import React from "react";

interface Message {
  id: string;
  text: string;
  timestamp: number;
}

interface MessageItemProps {
  message: Message;
}

const MessageItem: React.FC<MessageItemProps> = React.memo(({ message }) => {
  return (
    <div className="rounded-lg w-max p-2 bg-neutral-900">
      <p>{message.text}</p>
      <small>{new Date(message.timestamp).toLocaleTimeString()}</small>
    </div>
  );
});

export default MessageItem;
