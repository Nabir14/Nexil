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
    <section className="rounded-xl max-w-fit p-2 bg-neutral-900">
      <p>{message.text}</p>
      <small>{new Date(message.timestamp).toLocaleTimeString()}</small>
    </section>
  );
});

export default MessageItem;
