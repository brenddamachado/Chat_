import { getAuth } from "firebase/auth";
import { addDoc, collection, limit, orderBy, query, serverTimestamp } from "firebase/firestore";
import { useRef, useState } from "react";
import { useAuthState, useSignInWithGoogle } from "react-firebase-hooks/auth";
import { useCollectionData } from "react-firebase-hooks/firestore";
import "./App.css";
import { app, databaseApp } from "./serves/firebaseConfig";

const auth = getAuth(app);


export const App = () => {
  const [user] = useAuthState(auth);

  return (
  <div className="App">
    <header>
      <h1> Privado</h1>
      <SignOut />
    </header>
    <section>
      {user ? <ChatRoom /> : <SignIn />}
    </section>
  </div>
  )
}


export const ChatRoom= () => {
  const dummy = useRef()
  const messagesRef = collection(databaseApp, "messages");
  const q = query(messagesRef, orderBy("createdAt"), limit(25));
  const [messages] = useCollectionData(q, {idField: "id" });

  const [formValue, setFormValue] = useState("");
  const sendMessage = async (e) => {
    e.preventDefault();
  const {photoURL, uid} = auth.currentUser;

  await addDoc(messagesRef, {
    text: formValue,
  uid,
  photoURL,
  createdAt: serverTimestamp()
    })
  setFormValue("")
  dummy.current.scrollIntoView({behavior: 'smooth' })
  }
  return (
  <>
    <main>
      {messages &&
        messages.map((msg, index) => <ChatMessage key={index} message={msg} />)}
      <div ref={dummy}></div>
    </main>
    <form onSubmit={sendMessage}>
      <input
        type="text"
        value={formValue}
        onChange={(e) => setFormValue(e.target.value)}
      />
      <button type="submit" disabled={!formValue}>Enviar</button>
    </form>
  </>
  );
};

export const ChatMessage = (props) => {
  const {text, uid, photoURL} = props.message;

  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';
  return (
  <div className={`message ${messageClass}`}>
    <img src={photoURL || 'https://api.adorable.io/avatars/23/abott@adorable.png'} />
    <p>{text}</p>
  </div>
  );
};


export const SignIn = () => {
  const [signInWithGoogle] = useSignInWithGoogle(auth);

  return (
  <button className="sign-in" onClick={() => signInWithGoogle()}>
    Logar com o Google
  </button>
  );
};
export const SignOut= () => {
  return (
  auth.currentUser && (
  <button className='sign-out'
    onClick={() => auth.signOut()}>
    Sair
  </button>
  )
  );
   
  
};