import React, { useEffect, useRef, useState } from "react";
import { auth, db } from "./firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { addDoc, collection, serverTimestamp, query, orderBy, onSnapshot, limit, } from "firebase/firestore";
import { Filter } from 'bad-words';

import './App.css';
import googleIcon from "./images/google.svg"
import logoutIcon from "./images/logout.svg"
import sendIcon from "./images/send.svg"
import replyIcon from "./images/reply.svg"
import backIcon from "./images/back.svg"
import nexilIcon from "./images/nexil-icon-transparent.png"

function NavHeader(){
	const [user] = useAuthState(auth);
	const signOut = () => {
		auth.signOut();
	};

	return (
		<div className="sticky top-0 text-white bg-neutral-900 flex items-center justify-between">
		<div className="flex items-center justify-center px-2 py-2">
		<img src={nexilIcon} alt="icon" className="w-8 h-8" />
			<h1 className="px-1 py-1 font-bold text-2xl">Nexil</h1>
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

const SendMessage = ({scroll, trigger}) => {
	const [message, setMessage] = useState("");
	const textFilter = new Filter();

	const sendMessage = async (event) => {
		event.preventDefault();
		if (message.trim() === "") {
			setMessage("");
			scroll.current.scrollIntoView({ behavior: "smooth" });
			return;
		}
		const { uid, displayName, photoURL } = auth.currentUser;
		await addDoc(collection(db, "nexil-chat-db"), {
			text: textFilter.clean(message),
			name: displayName,
			avatar: photoURL,
			createdAt: serverTimestamp(),
			uid,
		});
		setMessage("");
		scroll.current.scrollIntoView({ behavior: "smooth" });
	};
  return (
    <form onSubmit={(event) => sendMessage(event)} className="sticky bottom-0 bg-none flex items-center justify-between">
      <button className="transition ease-in-out delay-300 bg-neutral-800 px-2 py-2 hover:bg-neutral-900" onClick={() => trigger(0)}><img src={backIcon} alt="back" /></button>
      <label htmlFor="messageInput" hidden>
        Enter Message
      </label>
      <input
        id="messageInput"
        name="messageInput"
        type="text"
        className="bg-neutral-800 text-white border-0 px-2 py-2 w-screen h-full"
        placeholder="message"
	value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button type="submit" className="transition ease-in-out delay-300 bg-blue-600 px-2 py-2 hover:bg-purple-600"><img src={sendIcon} alt="send" /></button>
    </form>
  );
};

const ReceivedMessage = ({ message }) => {
	return (
      <div className="py-1 flex justify-start text-white">
		    <img 
		className="border-0 rounded-full mr-2 w-1/2 w-8 h-8" 
		src={message.avatar} 
		alt="userAvatar" 
		/>
    <div className="bg-neutral-800 border-0 rounded-b-md rounded-r-md max-w-[65%] inline-block">
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
      <div className="py-1 flex justify-end text-white">
    <div className="bg-neutral-800 border-0 rounded-b-md rounded-l-md max-w-[65%] inline-block">
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

const MessageBody =  ({ setRoom }) => {
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
	  <main>
	  <div>
	{messages?.map((message) => (
          <MessageInfoContainer key={message.id} message={message} />
        ))}
	  </div>
	  <span ref={scroll}></span>
          <SendMessage scroll={scroll} trigger={ setRoom }/>
	  </main>
  );
};

const PCRCard = ({ trigger }) => {
	return (
		<div className="max-w-sm p-6 bg-white border rounded-lg shadow bg-zinc-900 border-neutral-700 transition ease-in-out hover:shadow-lg hover:shadow-fuchsia-500/50">
    <h5 className="mb-2 text-2xl font-bold tracking-tight text-white">
      Public Chat Room
	</h5>
  <p className="mb-3 font-normal text-gray-400">
    A chat room to talk with multiple people from across the world.
  </p>
  <button className="transition ease-in-out delay-500 inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white rounded-lg bg-gradient-to-r from-blue-800 to-fuchsia-500 hover:border-2 hover:border-blue-500" onClick={trigger} >
    Enter
    <svg
      className="rtl:rotate-180 w-3.5 h-3.5 ms-2"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 14 10"
    >
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M1 5h12m0 0L9 1m4 4L9 9"
      />
    </svg>
  </button>
</div>
);
}

const Lobby = ({ enterRoom }) => {
	return (
		<div className="h-screen flex items-center justify-center">
			<PCRCard trigger={() => enterRoom(1)}/>
		</div>

	);
}

const PublicChatRoom = ({ setRoom }) => {
	return(
		<div>
			<MessageBody setRoom={setRoom} />
		</div>
	);
}

const LoadingPage = () => {
	return (
		<div className="h-screen flex items-center justify-center">
			<h1 className="italic font-bold text-3xl text-white">🌐 Loading...</h1>
		</div>
	);
}

function App() {
  const [user] = useAuthState(auth);
  const [room, setRoom] = useState(0);
  const [loading, setLoading] = useState(false);
  const [targetRoom, setTargetRoom] = useState(null);

  const enterRoom = (roomId) => {
    setTargetRoom(roomId);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setRoom(roomId);
    }, 5000);
  };

  return (
    <div className="App bg-neutral-950">
	  <NavHeader />
	  {!user ? (
        <LoginAlert />
      ) : loading ? (
        <LoadingPage />
      ) : room === 0 ? (
        <Lobby enterRoom={enterRoom} />
      ) : room === 1 ? (
        <PublicChatRoom setRoom={setRoom} />
      ) : (
	<Lobby enterRoom={enterRoom} />
      )}
    </div>
  );
}

export default App;
