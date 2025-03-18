import { useEffect, useRef, useState } from "react";
import { Message } from "../types/chat";
import { auth } from "../db/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import MessageComponent from "./Message";
import ChatInput from "./ChatInput";
import { listenMessages } from "../services/chatService";
import Loading from "./Loading";

const Chat = () => {
	const [user] = useAuthState(auth);
	const [messages, setMessages] = useState<Message[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const messagesEndRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		try {
			const unsubscribe = listenMessages((newMessages) => {
				setMessages(newMessages);
				setLoading(false);
			});
			return () => {
				if (unsubscribe) {
					unsubscribe();
				}
			};
		} catch (error) {
			console.error("Failed to listen to messages:", error);
			setLoading(false);
		}
	}, []);

	// Scroll down every time the message changes
	useEffect(() => {
		if (messagesEndRef.current && !loading) {
			messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
		}
	}, [messages, loading]);

	return (
		<section className="relative w-full min-h-svh max-h-svh overflow-x-hidden overflow-y-auto scroll-w-none">
			{loading ? (
				<Loading text="Loading messages..." />
			) : (
				<>
					<div className="flex flex-col gap-1.5 p-2 min-h-full">
						{messages.map((message) => (
							<MessageComponent
								key={message.id}
								message={message}
								currentUserId={user?.uid || ""}
								photoURL={message.photoURL}
							/>
						))}
						<div ref={messagesEndRef} /> {/* Dummy element for scrolling down*/}
					</div>
					<ChatInput />
				</>
			)}
		</section>
	);
};

export default Chat;
