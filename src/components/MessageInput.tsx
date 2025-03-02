import React from "react";
import { SendHorizontal } from "lucide-react";

interface Prop {
  value: string;
  placeholder: string;
  onClick: () => void;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  onKeyUp: React.KeyboardEventHandler<HTMLInputElement>;
}

const MessageInput: React.FC<Prop> = React.memo(
  ({ value, placeholder, onClick, onChange, onKeyUp }) => {
    return (
      <section className="sticky bottom-0 flex w-[-webkit-fill-available] h-fit px-2 bg-neutral-900">
        <input
          className="rounded-full w-full py-2.5 px-2 outline-none"
          type="text"
          value={value}
          placeholder={placeholder}
          onChange={onChange}
          onKeyUp={onKeyUp}
        />
        <button
          className="flex items-center justify-center cursor-pointer hover:text-white active:text-white"
          onClick={onClick}
        >
          <SendHorizontal />
        </button>
      </section>
    );
  },
);

export default MessageInput;
