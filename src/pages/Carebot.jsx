import React, { useState } from "react";
import "./Carebot.css";

function Carebot() {
  const [messages, setMessages] = useState([
    { text: "Hi! I'm Carebot 💙 I can give basic health tips", sender: "bot" }
  ]);
  const [input, setInput] = useState("");

  const getBotReply = (msg) => {
  msg = msg.toLowerCase();

  if (msg.includes("fever"))
    return "Try resting, staying hydrated, and monitoring your temperature. If it continues, you should consult a doctor.";

  if (msg.includes("cold") || msg.includes("cough"))
    return "Drink warm fluids and take rest. If symptoms persist, consult a doctor.";

  if (msg.includes("headache"))
    return "Take rest, stay hydrated, and avoid screens. If it keeps happening, consult a doctor.";

  if (msg.includes("stress") || msg.includes("anxiety"))
    return "Try relaxing, breathing exercises, or talking to someone. If it feels serious, consult a professional.";

  return "I'm not fully sure about that. It's better to consult a doctor.";
};

  const sendMessage = () => {
    if (!input.trim()) return;

    const userMsg = { text: input, sender: "user" };
    const botMsg = { text: getBotReply(input), sender: "bot" };

    setMessages([...messages, userMsg, botMsg]);
    setInput("");
  };

  const styles = {
  heading: {
    background: "#102146",
    color: "#f8d8e4",
    width: "100vw",
    padding: "15px 0",
    fontSize: "30px",
    fontWeight: "700",
    marginBottom: "30px",
    textAlign: "center",
    marginLeft: "calc(-50vw + 50%)"
  }
};

  return (
    <div className="chat-container">
     <h2 style={styles.heading}>🤖CareBot</h2>

      <div className="chat-box">
  {messages.map((msg, index) => (
    <div
      key={index}
      className={`chat-bubble ${msg.sender === "user" ? "user" : "bot"}`}
    >
      {msg.text}
    </div>
  ))}
</div>

      <div className="chat-input">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about health..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}

export default Carebot;