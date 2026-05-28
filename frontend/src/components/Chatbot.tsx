import api from "../api/axios";
import { useEffect, useRef, useState } from "react";

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
  const [position, setPosition] = useState({ x: window.innerWidth - 80, y: window.innerHeight - 80 });
  const [dragging, setDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const hasDragged = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async () => {
    if (!message.trim() || loading) return;
    const userMessage: Message = { role: "user", text: message };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);
    setMessage("");
    try {
      const res = await api.post("/chat/", { message });
      setMessages((prev) => [...prev, { role: "assistant", text: res.data.assistant.message }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", text: "Server error." }]);
    } finally {
      setLoading(false);
    }
  };

  // Drag handlers
  const onMouseDown = (e: React.MouseEvent) => {
    hasDragged.current = false;
    dragOffset.current = { x: e.clientX - position.x, y: e.clientY - position.y };
    setDragging(true);

    const onMouseMove = (ev: MouseEvent) => {
      hasDragged.current = true;
      const newX = Math.max(16, Math.min(window.innerWidth - 60 - 16, ev.clientX - dragOffset.current.x));
      const newY = Math.max(16, Math.min(window.innerHeight - 60 - 16, ev.clientY - dragOffset.current.y));
      setPosition({ x: newX, y: newY });
    };

    const onMouseUp = () => {
      setDragging(false);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  // Chat window position — keep it on screen
  const chatLeft = position.x + 60 + 12 + 320 > window.innerWidth
    ? position.x - 320 - 12
    : position.x + 60 + 12;
  const chatTop = Math.max(16, Math.min(position.y, window.innerHeight - 500 - 16));

  return (
    <>
      {/* Draggable FAB */}
      <div
        onMouseDown={onMouseDown}
        onClick={() => { if (!hasDragged.current) setIsOpen((o) => !o); }}
        style={{
          position: "fixed",
          left: position.x,
          top: position.y,
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #0d9488, #0f766e)",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: dragging ? "grabbing" : "grab",
          zIndex: 9999,
          boxShadow: "0 8px 24px rgba(13,148,136,0.38)",
          userSelect: "none",
          transition: dragging ? "none" : "box-shadow 0.2s",
        }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
        </svg>
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            left: chatLeft,
            top: chatTop,
            width: 320,
            height: 500,
            borderRadius: 20,
            overflow: "hidden",
            zIndex: 9998,
            display: "flex",
            flexDirection: "column",
            backgroundColor: "#ffffff",
            boxShadow: "0 24px 64px rgba(15,23,42,0.18)",
            border: "1px solid #e2e8f0",
          }}
        >
          {/* Header */}
          <div
            style={{
              backgroundColor: "#0d9488",
              padding: "14px 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
              </svg>
              <span style={{ fontWeight: 700, fontSize: 15, color: "#fff" }}>AI Assistant</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: "rgba(255,255,255,0.18)",
                border: "none",
                borderRadius: 8,
                width: 28,
                height: 28,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontSize: 16,
              }}
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "14px 12px",
              display: "flex",
              flexDirection: "column",
              gap: 10,
              backgroundColor: "#f8fafc",
            }}
          >
            {messages.length === 0 && (
              <p style={{ textAlign: "center", color: "#94a3b8", fontSize: 13, marginTop: 24 }}>
                Ask anything about your tasks and projects.
              </p>
            )}
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                  maxWidth: "82%",
                  backgroundColor: msg.role === "user" ? "#0d9488" : "#ffffff",
                  color: msg.role === "user" ? "#fff" : "#1e293b",
                  padding: "10px 14px",
                  borderRadius: msg.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                  fontSize: 13,
                  lineHeight: "1.5",
                  boxShadow: "0 1px 4px rgba(15,23,42,0.07)",
                  border: msg.role === "assistant" ? "1px solid #e2e8f0" : "none",
                }}
              >
                {msg.text}
              </div>
            ))}
            {loading && (
              <div
                style={{
                  alignSelf: "flex-start",
                  backgroundColor: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "16px 16px 16px 4px",
                  padding: "10px 14px",
                  fontSize: 13,
                  color: "#94a3b8",
                  boxShadow: "0 1px 4px rgba(15,23,42,0.07)",
                }}
              >
                AI is typing…
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div
            style={{
              display: "flex",
              padding: "10px 12px",
              borderTop: "1px solid #e2e8f0",
              backgroundColor: "#ffffff",
              gap: 8,
              alignItems: "center",
            }}
          >
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") sendMessage(); }}
              placeholder="Type message..."
              style={{
                flex: 1,
                padding: "10px 12px",
                border: "1px solid #e2e8f0",
                borderRadius: 12,
                fontSize: 13,
                backgroundColor: "#f1f5f9",
                color: "#1e293b",
                outline: "none",
              }}
            />
            <button
              onClick={sendMessage}
              disabled={!message.trim() || loading}
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                border: "none",
                backgroundColor: !message.trim() || loading ? "#cbd5e1" : "#0d9488",
                color: "white",
                cursor: !message.trim() || loading ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                transition: "background-color 0.15s",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default Chatbot;