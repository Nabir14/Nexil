import { Message } from "../types/chat";

const MessageComponent = ({
	message,
	currentUserId,
	photoURL,
}: {
	message: Message;
	currentUserId: string;
	photoURL: string;
}) => {
	const isOwnMessage = message.senderId === currentUserId;
	return (
		<section className={`flex ${isOwnMessage && "flex-row-reverse text-end"} gap-1.5`}>
			<img
				src={photoURL}
				width={42}
				height={42}
				alt="profile"
				className="shrink-0 object-cover pointer-events-none rounded-full size-10"
				loading="lazy"
			/>
			<div className="blox rounded-xl max-w-fit min-md:max-w-1/2">
				<span className="text-neutral-300">{message.senderName}</span>
				<p>{message.text}</p>
				<small className="text-neutral-500">
					{message.timestamp
						? message.timestamp.toDate().toLocaleTimeString()
						: new Date().toLocaleTimeString()}
				</small>
			</div>
		</section>
	);
};

export default MessageComponent;
