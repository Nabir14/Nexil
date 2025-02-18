import React, { useEffect, useRef, useState } from "react";
import { auth, db } from "./firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { updateProfile } from "firebase/auth";
import { GoogleAuthProvider, getAuth, signInWithPopup, signInAnonymously } from "firebase/auth";
import { addDoc, collection, serverTimestamp, query, orderBy, onSnapshot, limit, doc, getDocs, deleteDoc, getFirestore, where, writeBatch} from "firebase/firestore";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { Filter } from 'bad-words';
import { getSHA256Hash } from "boring-webcrypto-sha256";

import './App.css';
import googleIcon from "./images/google.svg"
import logoutIcon from "./images/logout.svg"
import sendIcon from "./images/send.svg"
import replyIcon from "./images/reply.svg"
import backIcon from "./images/back.svg"
import nexilIcon from "./images/nexil-icon-transparent.png"

function UserEditRoom({ setRoom }){
	const [username, setUsername] = useState("");
	const textFilter = new Filter();
	
	const saveUsername = (e) => {
		e.preventDefault();
		if(username.length > 3){
			updateProfile(auth.currentUser, {displayName: username})
			setRoom(0)
		}else{
			alert("Username Should Be Atleast 3 Characters Long!")
		}
	}

	return (
		<div className="h-screen flex justify-center items-center bg-neutral-950">
		<form onSubmit={saveUsername}>
		<h1 className="text-3xl font-bold text-white text-center pb-4">Customize Your Profile</h1>
		<div className="flex">
			<p className="text-md font-bold text-white px-2">Username:</p>
			<input type="text" id="username" onChange={(e) => setUsername(e.target.value)} placeholder={auth.currentUser.displayName} />
		</div>
		<div className="flex justify-center items-center py-2">
			<button className="rounded-full bg-white hover:bg-purple-900 hover:text-white font-bold px-2 py-2" type="submit">Save Changes</button>
		<div className="px-2">
			<button onClick={() => setRoom(0)} className="rounded-full bg-white hover:bg-purple-900 hover:text-white font-bold px-2 py-2">Cancel</button>
		</div>
		</div>
		</form>
		</div>
	);

}

function NavHeader({ setRoom }){
	const [user] = useAuthState(auth);
	const signOut = () => {
		auth.signOut();
		auth.currentUser.delete();
	};

	return (
		<div className="sticky top-0 text-white bg-neutral-900 flex items-center justify-between">
		<div className="flex items-center justify-center px-2 py-2">
		<img src={nexilIcon} alt="icon" className="w-8 h-8" />
			<h1 className="px-1 py-1 font-bold text-2xl">Nexil</h1>
		</div>
			<nav className="flex-shrink-0">
		{user ? (
			<div className="flex">
		<button onClick={signOut} type="button" className="border-0 bg-none px-2 py-2">
				<img src={logoutIcon} alt="logout" />
		</button>
		<button onClick={() => setRoom(10)}type="button" className="border-0 w-12 bg-none px-2 py-2">

				<img src={user.photoURL} alt="userPfp" className="rounded-full" />
		</button>
			</div>
		) : (
			<span></span>
		)}
			</nav>
		</div>
	);
}

function LoginAlert(){
	const [user] = useAuthState(auth);
	const anonymousSignIn = () => {
		signInAnonymously(auth);
	};
	const googleSignIn = () => {
		const provider = new GoogleAuthProvider();
                signInWithPopup(auth, provider);
        };
	return (
		<div className="h-screen flex items-center justify-center">
			<div className="flex flex-col items-center">
		<div className="flex items-center justify-center mb-4">
		<img src={nexilIcon} className="w-1/2" />
		</div>
		<h1 className="font-bold text-white text-center py-2">🗣️ Talk with anyone using Nexil<br /> Get Started!</h1>
		<div className="p-1">
                        <button onClick={anonymousSignIn} className="border-0 bg-white text-black font-bold text-md hover:border-2 hover:border-purple-900 px-4 py-2 rounded-full flex items-center justify-center"><img src={nexilIcon} className="w-5 h-5 mr-2"/>Log In Anonymously</button>
		</div>
		<div className="p-1">
                        <button onClick={googleSignIn} className="border-0 bg-white text-black font-bold text-md hover:border-2 hover:border-blue-500 px-4 py-2 rounded-full flex items-center justify-center"><img src={googleIcon} className="w-5 h-5 mr-2"/>Log In With Google</button>
		</div>
			</div>
		</div>
	);
}

const SendMessage = ({scroll, trigger, readDB, doe, sessionTime, setSessionTime}) => {
	const [message, setMessage] = useState("");

	const sendMessage = async (event) => {
		event.preventDefault();
		if (message.trim() === "") {
			setMessage("");
			scroll.current.scrollIntoView({ behavior: "smooth" });
			return;
		}
		const { uid, displayName, photoURL } = auth.currentUser;
		await addDoc(collection(db, readDB), {
			text: message,
			name: displayName,
			avatar: photoURL,
			createdAt: serverTimestamp(),
			sessionTime: sessionTime,
			uid,
		});
		setMessage("");
		scroll.current.scrollIntoView({ behavior: "smooth" });
	};
	const deleteUserMessages = async (roomName, cs) => {
		const user = auth.currentUser;
		const messagesRef = collection(db, roomName);
		let q;
		if (cs){
			q = query(
				messagesRef,
				where("uid", "==", user.uid),
				where("sessionTime", "==", sessionTime)
			);
		}else{
			q = query(
				messagesRef,
				where("uid", "==", user.uid),
			);
			
		}
		const querySnapshot = await getDocs(q);
		const batch = writeBatch(db);
		querySnapshot.forEach((doc) => {
			batch.delete(doc.ref);
		});
		await batch.commit();
	};
	const handleExitRoom = async () => {
		if(doe === "Force All"){
			await deleteUserMessages(readDB, false);
		}else if(doe === "Current Session"){
			await deleteUserMessages(readDB, true);	
		}
		trigger(0);
		setSessionTime(0);
	};

  return (
    <form onSubmit={(event) => sendMessage(event)} className="sticky bottom-0 bg-none flex items-center justify-between w-screen">
      <button className="transition ease-in-out delay-300 bg-neutral-800 px-2 py-2 hover:bg-neutral-900 h-10" onClick={handleExitRoom}><img src={backIcon} alt="back" /></button>
      <label htmlFor="messageInput" hidden>
        Aa
      </label>
      <input
        id="messageInput"
        name="messageInput"
        type="text"
        className="bg-neutral-800 text-white border-0 px-2 py-2 w-screen"
        placeholder="Aa"
	value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button type="submit" className="transition ease-in-out delay-300 bg-blue-600 px-2 py-2 hover:bg-purple-600 h-10"><img src={sendIcon} alt="send" /></button>
    </form>
  );
};

const MessageControls = ({ setMControl, message, dbName }) => {
	const [deleteAlertBox, setDAlertBox] = useState(false)
	const deleteMessage = async () => {
		await deleteDoc(doc(db, dbName, message.id))
		setDAlertBox(false)
	}
	return (
		<div>
		<button className="w-4 h-4 pr-5 rounded-full" onClick={() => setDAlertBox(true)}>🗑️ </button>
		<br />
		<button className="w-4 h-4 pr-5 rounded-full">🗨️</button>
		{deleteAlertBox ? (
		<div className="bg-black bg-opacity-70 rounded-md fixed inset-0 z-50 flex items-center justify-center">
		<div>
		<h1 className="text-xl font-bold text-white py-2">Do You Want To Delete This Message?</h1>
		<div className="flex justify-center">
		<div className="px-2">
		<button onClick={deleteMessage} className="bg-zinc-800 rounded-xl px-4 py-2 text-white text-center hover:bg-white hover:text-black">Yes</button>
		</div>
		<div className="px-2">
		<button onClick={() => setDAlertBox(false)} className="px-4 py-2 rounded-xl bg-zinc-800 text-white text-center hover:bg-white hover:text-black">No</button>
		</div>
		</div>
		</div>
		</div>
		) : null}
		</div>
	);
}

const ReceivedMessage = ({ message, pf }) => {
	const textFilter = new Filter();
	const [text, setText] = useState(message.text);
	const [username, setUsername] = useState(message.name);
	const checkProfanityFilter = () => {
		if (pf === true){
			const textFilter = new Filter();
			setText(textFilter.clean(message.text));
			setUsername(textFilter.clean(message.name));
		}
	}
	return (
      <div className="py-1 flex justify-start text-white" onLoad={checkProfanityFilter}>
		    <img 
		className="border-0 rounded-full mr-2 w-1/2 w-8 h-8" 
		src={message.avatar} 
		alt="userAvatar" 
		/>
    <div className="bg-neutral-800 border-0 rounded-b-xl rounded-r-xl max-w-[65%] inline-block">
      <div className="text-left p-2">
      <p className="italic font-bold text-sm">{username}</p>
      <p className="break-words">{text}</p>
      </div>
      </div>
      </div>
  );
};

const SentMessage = ({ message, dbName, pf }) => {
	const [mControl, setMControl] = useState(false);
	const [text, setText] = useState(message.text);
	const [username, setUsername] = useState(message.name);
	const mControlTrigger = () => {
		if(mControl === true){
			setMControl(false)
		}else{
			setMControl(true)
		}
	}
	const checkProfanityFilter = () => {
		if (pf === true){
			const textFilter = new Filter();
			setText(textFilter.clean(message.text));
			setUsername(textFilter.clean(message.name));
		}
	}
	return (
      <div className="py-1 flex justify-end text-white" onLoad={checkProfanityFilter}>
		{mControl ? <MessageControls setMControl={setMControl} message={message} dbName={dbName} /> : null}
    <div className="bg-neutral-800 border-0 rounded-b-xl rounded-l-xl max-w-[65%] inline-block">
	<div className="text-right p-2" onClick={mControlTrigger}>
      <p className="italic font-bold text-sm">{username}</p>
      <p className="break-words">{text}</p>
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

const MessageInfoContainer = ({ message, dbName, pf, doe }) => {
  const [user] = useAuthState(auth);

  return (
    <div>
	  {message.uid === user.uid ? <SentMessage message={message} dbName={dbName} pf={pf}/> : <ReceivedMessage message={message} pf={pf}/>}
      </div>
  );
};

const MessageBody =  ({ setRoom, readDB, pf, doe, sessionTime, setSessionTime }) => {
  const [messages, setMessages] = useState([]);
  const scroll = useRef();

  useEffect(() => {
    const q = query(
      collection(db, readDB),
      orderBy("createdAt"),
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
	  <main onLoad={() => scroll.current.scrollIntoView({ behavior: "auto" })}>
	  <div>
	{messages?.map((message) => (
          <MessageInfoContainer key={message.id} message={message} dbName={readDB} pf={pf} />
        ))}
	  </div>
	  <span ref={scroll}></span>
          <SendMessage scroll={scroll} trigger={ setRoom } readDB={ readDB } doe={ doe } sessionTime={sessionTime} setSessionTime={setSessionTime}/>
	  </main>
  );
};


const PCRCard = ({ trigger }) => {
	return (
		<div className="pt-2">
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
		</div>
);
}

const PRCRCard = ({ setRoom, setDBName, pf, setPF, doe, setDOE, setSessionTime }) => {
	const [roomName, setRN] = useState("");
	const [roomID, setRID] = useState("");
	const [dbCon, setDBCon] = useState(false);
	const [cr, setCR] = useState(false);
	const [formText, setFT] = useState("Join Room");
	
	const setProfanityFilter = () => {
		if(pf === true){
			setPF(false);
		}else{
			setPF(true);
		}
	}
	const setDeleteOnExit = () => {
		if(doe === true){
			setDOE(false);
		}else{
			setDOE(true);
		}
	}
	const setCreateRoom = () => {
		if(cr === true){
			setCR(false);
		}else{
			setCR(true);
		}
	}

	const createHash = async () => {
		const textAsBuffer = new TextEncoder().encode(Math.floor((Math.random() * 9999999999999999) + 1));
		const hashBuffer = await window.crypto.subtle.digest("SHA-256", textAsBuffer);
		const hashArray = Array.from(new Uint8Array(hashBuffer));
		const hash = hashArray
			.map((item) => item.toString(16).padStart(2, "0"))
			.join("");
		setRID(hash);
	};

	const formButton = () => {
		if(cr === false){
			setFT("Create Room");
		}else{
			setFT("Join Room");
		}
	}
	const checkRoomExists = async () => {
		const roomRef = collection(db, roomName);
		const roomSnapshot = await getDocs(roomRef);
		if (roomSnapshot.empty) {
			return false;
		}else{
			return true;
		}
	}

	const createDB = async (e) => {
		e.preventDefault();
		if(roomName === ""){
			alert("Room Name Cannot Be Empty");

		}else{
			if(cr === true){
				const exists = await checkRoomExists();
				if(exists){
					await createHash();
					setDBName(roomName+"-"+roomID);
					setRoom(2);
					await addDoc(collection(db, roomName+"-"+roomID), {
						text: roomName+"-"+roomID,
						name: "Nexil",
						avatar: nexilIcon,
						createdAt: serverTimestamp(),
					});
				}else{
					setDBName(roomName+"-"+roomID);
					setRoom(2);
					await addDoc(collection(db, roomName+"-"+roomID), {
						text: roomName+"-"+roomID,
						name: "Nexil",
						avatar: nexilIcon,
						createdAt: serverTimestamp(),
					});
				}
			}else{
				const exists = await checkRoomExists();
				if (exists) {
					setDBName(roomName);
					setRoom(2);
					setSessionTime(Date.now());
				}else{
					alert("Room Not Found!");
					return;
				}

			}
		}
	}

	return (
		<div className="pt-2">
		<div className="max-w-sm p-6 bg-white border rounded-lg shadow bg-zinc-900 border-neutral-700 transition ease-in-out hover:shadow-lg hover:shadow-fuchsia-500/50">
    <h5 className="mb-2 text-2xl font-bold tracking-tight text-white">
      Private Chat Room
	</h5>
  <p className="mb-3 font-normal text-gray-400">
    Your private space.
  </p>
  <button className="transition ease-in-out delay-500 inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white rounded-lg bg-gradient-to-r from-blue-800 to-fuchsia-500 hover:border-2 hover:border-blue-500" onClick={() => {setDBCon(true); createHash();}} >
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
		{dbCon ? (
		<div className="h-screen flex justify-center items-center bg-neutral-950 bg-opacity-75 fixed inset-0">
		<form onSubmit={createDB} className="max-w-md w-4/5 fixed">
		<h1 className="text-3xl font-bold text-white text-center pb-4">Create Private Room</h1>
		<div className="flex-col">
			<div className="flex">
			<p className="text-md font-bold text-white px-2">Room Name:</p>
			<input type="text" id="roomName" onChange={(e) => setRN(e.target.value)} placeholder="Type room name here" />
			</div>
			{cr ?
			<div className="flex pt-2">
			<p className="text-md font-bold text-white px-2">RoomID:</p>
			<input type="text" id="roomID" value={roomID} disabled/>
			</div>
			: null}
			<div className="flex pt-4">
			<p className="text-sm font-bold text-white px-2">Profanity Filter:</p>
			<input type="checkbox" id="filterWords" checked={pf} onChange={setProfanityFilter}/>
			</div>
			<div className="flex">
			<p className="text-sm font-bold text-white px-2">Delete Messages On Exit:</p>
			<select value={doe} onChange={e => setDOE(e.target.value)}>
				<option value="Disabled">Disabled</option>
				<option value="Current Session">Current Session</option>
				<option value="Force All">Force All</option>
			</select>
			</div>
			<div className="flex">
			<p className="text-sm font-bold text-white px-2">Create New Room:</p>
			<input type="checkbox" id="filterWords" checked={cr} onChange={() => {setCreateRoom(); formButton();}}/>
			</div>
			</div>
		<div className="flex justify-center items-center py-2">
			<button className="rounded-full bg-white hover:bg-purple-900 hover:text-white font-bold px-2 py-2" type="submit">{formText}</button>
			<button onClick={(e) => {e.preventDefault(); setRoom(0); setDBCon(false);}} className="rounded-full bg-white hover:bg-purple-900 hover:text-white font-bold px-2 py-2">Cancel</button>
		<div className="px-2">
		</div>
		</div>
		</form>
		</div> 
		) : null}
</div>
		</div>
);
}

const Lobby = ({ setRoom, enterRoom, setDBName, pf, setPF, doe, setDOE, setSessionTime}) => {
	return (
		<div className="h-screen flex-col items-center justify-center">
			<PCRCard trigger={() => enterRoom(1)}/>
			<PRCRCard setRoom={setRoom} setDBName={setDBName} pf={pf} setPF={setPF} doe={doe} setDOE={setDOE} setSessionTime={setSessionTime}/>
		</div>

	);
}


const PublicChatRoom = ({ setRoom, sessionTime, setSessionTime }) => {
	return(
		<div>
			<MessageBody setRoom={setRoom} readDB="nexil-chat-db" pf={true} doe={false} sessionTime={0} setSessionTime={setSessionTime}/>
		</div>
	);
}

const PrivateRoom = ({ setRoom, dbName, pf, doe, sessionTime, setSessionTime}) => {
	return(
		<div>
			<MessageBody setRoom={setRoom} readDB={dbName} pf={pf} doe={doe} sessionTime={sessionTime} setSessionTime={setSessionTime}/>
		</div>
	);
}

const LoadingPage = () => {
	return (
		<div className="h-screen flex items-center justify-center">
			<h1 className="font-bold text-3xl text-white">🌐 Loading...</h1>
		</div>
	);
}

function App() {
  const [user] = useAuthState(auth);
  const [room, setRoom] = useState(0);
  const [loading, setLoading] = useState(false);
  const [targetRoom, setTargetRoom] = useState(null);
  const [dbName, setDBName] = useState("");
  const [pf, setPF] = useState(false);
  const [doe, setDOE] = useState("Disabled");
  const [sessionTime, setSessionTime] = useState(0);

  const enterRoom = (roomId) => {
    setTargetRoom(roomId);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setRoom(roomId);
    }, 500);
  };

  return (
    <div className="App bg-neutral-950">
	  <NavHeader setRoom={setRoom}/>
	  {!user ? (
        <LoginAlert />
      ) : loading ? (
        <LoadingPage />
      ) : room === 10 ? (
        <UserEditRoom setRoom={setRoom} />
      ) : room === 0 ? (
        <Lobby setRoom={setRoom} enterRoom={enterRoom} setDBName={setDBName} pf={pf} setPF={setPF} doe={doe} setDOE={setDOE} setSessionTime={setSessionTime}/>
      ) : room === 1 ? (
        <PublicChatRoom setRoom={setRoom} sessionTime={sessionTime} setSessionTime={setSessionTime}/>
      ) : room === 2 ? (
	<PrivateRoom setRoom={setRoom} dbName={dbName} pf={pf} doe={doe} sessionTime={sessionTime} setSessionTime={setSessionTime}/>
      ) : (
	<Lobby setRoom={setRoom} enterRoom={enterRoom} setDBName={setDBName} pf={pf} setPF={setPF} doe={doe} setDOE={setDOE} setSessionTime={setSessionTime}/>
      )}
    </div>
  );
}

export default App;
