import { useState, useEffect, useRef } from "react"; // Tambahkan useRef
import { database } from "./firebase";
import { ref, push, onValue } from "firebase/database";
import MessageInput from "./components/MessageInput";
import MessageItem from "./components/MessageItem";

interface Message {
  id: string;
  text: string;
  timestamp: number;
}

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Fetch messages from Firebase
  useEffect(() => {
    const messagesRef = ref(database, "messages");
    onValue(messagesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const messageList: Message[] = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        setMessages(messageList);
      }
      setLoading(false); // Turn Off Loading
    });
  }, []);

  // Scroll down every time the message changes
  useEffect(() => {
    if (messagesEndRef.current && !loading) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading]);

  // Send Message
  const sendMessage = () => {
    if (newMessage.trim() === "") return;
    const messagesRef = ref(database, "messages");
    push(messagesRef, {
      text: newMessage,
      timestamp: Date.now(),
    });
    setNewMessage("");
  };

  return (
    <section className="relative w-full min-h-svh max-h-svh overflow-x-auto scroll-w-none">
      {loading ? (
        <div className="flex items-center justify-center h-full">
          <p className="font-extrabold text-sm">Loading messages...</p>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-1 p-2">
            {messages.map((message) => (
              <MessageItem key={message.id} message={message} />
            ))}
            <div ref={messagesEndRef} /> {/* Dummy element for scrolling down*/}
          </div>
          <MessageInput
            value={newMessage}
            placeholder="Type a message"
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && sendMessage()}
            onClick={sendMessage}
          />
        </>
      )}
    </section>
  );
};

export default Chat;
