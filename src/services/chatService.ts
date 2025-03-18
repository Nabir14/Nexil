import {
	addDoc,
	collection,
	onSnapshot,
	orderBy,
	query,
	serverTimestamp,
} from "firebase/firestore";
import { db } from "../db/firebase";
import { Message } from "../types/chat";

const messageRef = collection(db, "messages");

const sendMessage = async (
	text: string,
	senderId: string,
	senderName: string,
	photoURL: string,
) => {
	if (!text.trim()) return;
	await addDoc(messageRef, { text, senderId, senderName, photoURL, timestamp: serverTimestamp() });
};

const listenMessages = (setMessages: (messages: Message[]) => void) => {
	const messagesQuery = query(collection(db, "messages"), orderBy("timestamp", "asc"));
	const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
		const messages = snapshot.docs.map((doc) => ({
			id: doc.id,
			...doc.data(),
		})) as Message[];
		setMessages(messages);
	});
	return unsubscribe;
};

export { sendMessage, listenMessages };
