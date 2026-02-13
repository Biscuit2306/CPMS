import React, { useState } from "react";
import axios from "axios";
import "../styles/chatbot.css";

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { from: "bot", text: "Hey Ask me anything!" }
  ]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { from: "user", text: input };
    setMessages((m) => [...m, userMsg]);
    setInput("");

    try {
      const res = await axios.post("http://localhost:5000/api/chat", {
        message: input
      });

      setMessages((m) => [
        ...m,
        { from: "bot", text: res.data.reply }
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        { from: "bot", text: "Something went wrong 😅" }
      ]);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button className="chatbot-button" onClick={() => setOpen(!open)}>
        💬
      </button>

      {open && (
        <div className="chatbot-box">
          <div className="chatbot-header">
            AI Chatbot
            <span onClick={() => setOpen(false)}>✖</span>
          </div>

          <div className="chatbot-messages">
            {messages.map((m, i) => (
              <div key={i} className={`msg ${m.from}`}>
                {m.text}
              </div>
            ))}
          </div>

          <div className="chatbot-input">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything..."
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button onClick={sendMessage}>Send</button>
          </div>
        </div>
      )}
    </>
  );
}