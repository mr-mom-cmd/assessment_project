import React, { useState } from "react";

interface ChatInputProps {
  onSend: (message: string) => Promise<void> | void;
  disabled?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSend, disabled }) => {
  const [value, setValue] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    setValue("");
    await onSend(trimmed);
  };

  return (
    <section className="panel chat-panel">
      <h2>Text Chat</h2>
      <form onSubmit={handleSubmit} className="chat-panel__form">
        <input
          type="text"
          className="input"
          placeholder="Type your question here..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
          disabled={disabled}
        />
        <button className="btn btn-secondary" type="submit" disabled={disabled}>
          Send
        </button>
      </form>
    </section>
  );
};
