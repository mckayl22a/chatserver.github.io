import { useState, useEffect } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:3000"); // Change to your deployed server

function App() {
  const [username, setUsername] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [channels, setChannels] = useState([]);
  const [currentChannel, setCurrentChannel] = useState("general");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3000/channels")
      .then(res => res.json())
      .then(setChannels);

    fetch(`http://localhost:3000/messages/${currentChannel}`)
      .then(res => res.json())
      .then(setMessages);

    socket.on("receiveMessage", (msg) => {
      setMessages(prev => [...prev, msg]);
    });

    return () => socket.off("receiveMessage");
  }, [currentChannel]);

  const login = async () => {
    const res = await fetch("http://localhost:3000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username }),
    });
    if (res.ok) setLoggedIn(true);
  };

  const sendMessage = () => {
    socket.emit("sendMessage", { channelId: currentChannel, username, message });
    setMessage("");
  };

  const joinChannel = (channel) => {
    setCurrentChannel(channel.id);
    socket.emit("joinChannel", channel.id);
  };

  if (!loggedIn) return (
    <div className="login">
      <input placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
      <button onClick={login}>Login</button>
    </div>
  );

  return (
    <div className="chat-container">
      <div className="channels">
        {channels.map(ch => (
          <button key={ch.id} onClick={() => joinChannel(ch)}>{ch.name}</button>
        ))}
      </div>
      <div className="chat">
        <div className="messages">
          {messages.map((m, i) => (
            <div key={i}><b>{m.username}:</b> {m.message}</div>
          ))}
        </div>
        <input value={message} onChange={e => setMessage(e.target.value)} placeholder="Type a message..." />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}

export default App;
