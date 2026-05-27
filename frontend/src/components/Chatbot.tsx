import api from "../api/axios";
import { useEffect, useState } from "react";

interface Message {
  role: "user" | "assistant";
  text: string;
}

function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUser, setLastUser] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const syncUser = () => {
      let userId: string | null = null;
      const userStr = localStorage.getItem("user");

      try {
        const user = userStr ? JSON.parse(userStr) : null;
        userId = user?.email || (user?.id ? String(user.id) : null);
      } catch {
        userId = null;
      }

      if (userId !== lastUser) {
        setMessages([]);
        setMessage("");
        setLastUser(userId);
      }
    };

    syncUser();
    const intervalId = window.setInterval(syncUser, 500);

    return () => window.clearInterval(intervalId);
  }, [isOpen, lastUser]);

  const sendMessage = async () => {
    if (!message.trim()) return;

    const userMessage: Message = {
      role: "user",
      text: message,
    };

    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const res = await api.post("/chat/", {
        message,
      });

      const botMessage: Message = {
        role: "assistant",
        text: res.data.assistant.message,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "Server error.",
        },
      ]);
    }

    setMessage("");
    setLoading(false);
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          width: "60px",
          height: "60px",
          borderRadius: "50%",
          border: "none",
          backgroundColor: "#2563eb",
          color: "white",
          fontSize: "24px",
          cursor: "pointer",
          zIndex: 9999,
          boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
        }}
      >
        💬
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            bottom: "90px",
            right: "20px",
            width: "350px",
            height: "500px",
            backgroundColor: "white",
            border: "1px solid #ccc",
            borderRadius: "10px",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            zIndex: 9999,
            boxShadow: "0 0 10px rgba(0,0,0,0.2)",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "15px",
              backgroundColor: "#2563eb",
              color: "white",
              fontWeight: "bold",
            }}
          >
            AI Assistant
          </div>

          {/* Messages */}
          <div
            style={{
              flex: 1,
              padding: "10px",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            {messages.map((msg, index) => (
              <div
                key={index}
                style={{
                  alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                  backgroundColor: msg.role === "user" ? "#2563eb" : "#f1f1f1",
                  color: msg.role === "user" ? "white" : "black",
                  padding: "10px",
                  borderRadius: "10px",
                  maxWidth: "80%",
                }}
              >
                {msg.text}
              </div>
            ))}
            {loading && (
              <div style={{ alignSelf: "flex-start", color: "#666" }}>
                AI is typing...
              </div>
            )}
          </div>

          {/* Input */}
          <div
            style={{
              display: "flex",
              padding: "10px",
              borderTop: "1px solid #ccc",
            }}
          >
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type message..."
              style={{
                flex: 1,
                padding: "10px",
                border: "1px solid #ccc",
                borderRadius: "4px",
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  sendMessage();
                }
              }}
            />
            <button
              onClick={sendMessage}
              style={{
                marginLeft: "10px",
                padding: "10px 15px",
                backgroundColor: "#2563eb",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default Chatbot;
