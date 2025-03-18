import React, { useState } from "react";
import { auth } from "../db/firebase";
import { sendMessage } from "../services/chatService";
import { SendHorizontal } from "lucide-react";
import { useAuthState } from "react-firebase-hooks/auth";

const ChatInput = () => {
	const [text, setText] = useState("");
	const [user] = useAuthState(auth);

	const handleSend = async () => {
		if (!text.trim()) return;

		if (!user) {
			alert("You must be logged in to send messages!");
			return;
		}

		try {
			console.log("Sending message:", text);
			setText("");
			await sendMessage(text, user.uid, user.displayName || "Anonymous", user.photoURL || "");
			console.log("Message sent!");
		} catch (error) {
			console.error("Error sending message:", error);
		}
	};

	const handleChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
		setText(event.target.value);
	};

	const handleKeyUp: React.KeyboardEventHandler<HTMLInputElement> = async (event) => {
		if (event.key === "Enter") {
			await handleSend();
		}
	};

	return (
		<section className="sticky bottom-0 flex w-[-webkit-fill-available] h-fit px-2 bg-neutral-900">
			<input
				className="outline-none rounded-full w-full py-2.5 px-2"
				type="text"
				value={text}
				placeholder="Type a message"
				onChange={handleChange}
				onKeyUp={handleKeyUp}
			/>
			<button
				className="flex items-center justify-center cursor-pointer hover:text-white active:text-white"
				onClick={handleSend}
			>
				<SendHorizontal />
			</button>
		</section>
	);
};

export default ChatInput;
