import React, { useEffect, useRef, useState } from "react";
import { auth, db } from "./firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { addDoc, collection, serverTimestamp, query, orderBy, onSnapshot, limit, } from "firebase/firestore";

import './App.css';
import googleIcon from "./images/google.svg"
import logoutIcon from "./images/logout.svg"
import sendIcon from "./images/send.svg"
import replyIcon from "./images/reply.svg"
import nexilIcon from "./images/nexil-icon-transparent.png"

function NavHeader(){
	const [user] = useAuthState(auth);
	const signOut = () => {
		auth.signOut();
	};

	return (
		<div className="text-white bg-blue-500 flex items-center justify-center">
		<div className="flex items-center justify-start">
		<img src={nexilIcon} alt="icon" className="w-1/12 h-1/12" />
			<h1 className="px-2 py-2 font-bold text-2xl">Nexil</h1>
		</div>
			<nav className="flex-shrink-0">
		{user ? (
			<button onClick={signOut} type="button" className="border-0 bg-none px-2 py-2">
				<img src={logoutIcon} alt="logout" />
			</button>
		) : (
			<span></span>
		)}
			</nav>
		</div>
	);
}

function LoginAlert(){
	const [user] = useAuthState(auth);
	const googleSignIn = () => {
		const provider = new GoogleAuthProvider();
                signInWithPopup(auth, provider);
        };
        const signOut = () => {
		auth.signOut();
	};
	return (
		<div className="h-screen flex items-center justify-center">
			<div className="flex flex-col items-center">
		<div className="flex items-center justify-center mb-4">
		<img src={nexilIcon} className="w-1/2" />
		</div>
		<h1 className="font-bold text-white text-center py-2">🗣️ Talk with anyone using Nexil<br /> Get Started!</h1>
                        <button onClick={googleSignIn} className="border-0 bg-white text-black font-bold text-md hover:border-2 hover:border-blue-500 px-4 py-2 rounded-full flex items-center justify-center"><img src={googleIcon} className="w-5 h-5 mr-2"/>Log In With Google</button>
			</div>
		</div>
	);
}

const SendMessage = () => {
	const [message, setMessage] = useState("");
	const sendMessage = async (event) => {
		event.preventDefault();
		if (message.trim() === "") {
			return;
		}
		const { uid, displayName, photoURL } = auth.currentUser;
		await addDoc(collection(db, "nexil-chat-db"), {
			text: message,
			name: displayName,
			avatar: photoURL,
			createdAt: serverTimestamp(),
			uid,
		});
		setMessage("");
	};
  return (
    <form onSubmit={(event) => sendMessage(event)} className="sticky bottom-0 bg-none flex items-center justify-between">
      <label htmlFor="messageInput" hidden>
        Enter Message
      </label>
      <input
        id="messageInput"
        name="messageInput"
        type="text"
        className="bg-white border-0 px-2 py-2 w-screen h-full"
        placeholder="message"
	value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button type="submit" className="bg-blue-500 px-2 py-2 hover:bg-blue-900"><img src={sendIcon} alt="send" /></button>
    </form>
  );
};

const ReceivedMessage = ({ message }) => {
	return (
      <div className="pb-1 flex justify-start">
		    <img 
		className="border-0 rounded-full mr-2 w-1/2 w-8 h-8" 
		src={message.avatar} 
		alt="userAvatar" 
		/>
    <div className="bg-white border-0 rounded-b-md rounded-r-md max-w-[65%] inline-block">
      <div className="text-left px-1 py-1">
      <p className="italic font-bold text-sm">{message.name}</p>
      <p className="break-words">{message.text}</p>
      </div>
      </div>
      </div>
  );
}

const SentMessage = ({ message }) => {
	return (
      <div className="pb-1 flex justify-end">
    <div className="bg-white border-0 rounded-b-md rounded-l-md max-w-[65%] inline-block">
	<div className="text-right px-1 py-1">
      <p className="italic font-bold text-sm">{message.name}</p>
      <p className="break-words">{message.text}</p>
		</div>
      </div>
		    <img 
		className="border-0 rounded-full ml-2 w-1/2 w-8 h-8" 
		src={message.avatar} 
		alt="userAvatar" 
		/>
      </div>
  );
}

const MessageInfoContainer = ({ message }) => {
  const [user] = useAuthState(auth);

  return (
    <div>
	  {message.uid === user.uid ? <SentMessage message={message}/> : <ReceivedMessage message={message}/>}
      </div>
  );
};

const MessageBody = () => {
  const [messages, setMessages] = useState([]);
  const scroll = useRef();

  useEffect(() => {
    const q = query(
      collection(db, "nexil-chat-db"),
      orderBy("createdAt", "desc"),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (QuerySnapshot) => {
      const fetchedMessages = [];
      QuerySnapshot.forEach((doc) => {
        fetchedMessages.push({ ...doc.data(), id: doc.id });
      });
      const sortedMessages = fetchedMessages.sort(
        (a, b) => a.createdAt - b.createdAt
      );
      setMessages(sortedMessages);
    });
    return () => unsubscribe;
  }, []);

  return (
	  <div>
	{messages?.map((message) => (
          <MessageInfoContainer key={message.id} message={message} />
        ))}
	  </div>
  );
};

const Body = () => {
	return(
		<div>
			<MessageBody />
			<SendMessage />
		</div>
	);
}

function App() {
  const [user] = useAuthState(auth);
  return (
    <div className="App bg-gray-900">
	  <NavHeader />
	  {!user ? <LoginAlert /> : <Body />}
    </div>
  );
}

export default App;
