// Chat Application Frontend
// React + TypeScript + Vite + Socket.io

import React, { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import io from 'socket.io-client';

const API_BASE_URL = 'http://localhost:5000';

const ChatApp = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [username, setUsername] = useState('');
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (username) {
      const newSocket = io(API_BASE_URL);
      setSocket(newSocket);

      newSocket.on('connect', () => {
        setIsConnected(true);
        newSocket.emit('join', username);
      });

      newSocket.on('disconnect', () => {
        setIsConnected(false);
      });

      newSocket.on('message', (message) => {
        setMessages((prevMessages) => [...prevMessages, message]);
      });

      newSocket.on('history', (history) => {
        setMessages(history);
      });

      return () => {
        newSocket.disconnect();
      };
    }
  }, [username]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket || !isConnected) return;

    const message = {
      id: uuidv4(),
      username,
      content: newMessage,
      timestamp: new Date().toISOString()
    };

    socket.emit('message', message);
    setNewMessage('');
  };

  const handleJoin = (e) => {
    e.preventDefault();
    if (!username.trim()) return;
  };

  return (
    <div className="chat-container">
      {!username ? (
        <div className="join-form">
          <h2>Join Chat</h2>
          <form onSubmit={handleJoin}>
            <input
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <button type="submit">Join Chat</button>
          </form>
        </div>
      ) : (
        <div className="chat-room">
          <div className="chat-header">
            <h2>Real-time Chat Application</h2>
            <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>:
              {isConnected ? 'Connected' : 'Disconnected'}
            </div>
            <button onClick={() => setUsername('')}>Change User</button>
          </div>

          <div className="messages-container">
            {messages.map((message) => (
              <div key={message.id} className="message">
                <div className="message-header">
                  <span className="username">{message.username}</span>
                  <span className="timestamp">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div className="message-content">{message.content}</div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <form className="message-form" onSubmit={handleSendMessage}>
            <input
              type="text"
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              disabled={!isConnected}
            />
            <button type="submit" disabled={!isConnected || !newMessage.trim()}>
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ChatApp;