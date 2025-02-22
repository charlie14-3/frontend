import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import io from "socket.io-client";
import { auth } from "../firebase"; // ✅ Correct Import
import { onAuthStateChanged } from "firebase/auth"; // ✅ Import separately
import "../styles/chat.css";  // Ensure styling is correct

const CHAT_API_URL = "http://localhost:5001/chat";
const socket = io("http://localhost:5001");

function Chat() {
    const [user, setUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [messageInput, setMessageInput] = useState("");
    const [searchParams] = useSearchParams();
    const receiverName = searchParams.get("name"); // Get alumni name from URL
    const [selectedChat, setSelectedChat] = useState(localStorage.getItem("selectedChat") || null);
    const [chatList, setChatList] = useState([]); // Stores chat history

    useEffect(() => {
        onAuthStateChanged(auth, (currentUser) => {
            if (!currentUser) {
                window.location.href = "/"; // Redirect if not logged in
            } else {
                setUser(currentUser);
                fetchChatList(currentUser.displayName);
                if (selectedChat) {
                    fetchMessages(currentUser.displayName, selectedChat);
                }
            }
        });
    }, [selectedChat]);

    // Fetch list of past chats (Alumni the user has chatted with)
    const fetchChatList = async (username) => {
        try {
            const res = await axios.get(`${CHAT_API_URL}/users/${username}`);
            setChatList(res.data);
        } catch (err) {
            console.error("❌ Error fetching chat users:", err);
        }
    };

    // Fetch full message history from MongoDB
    const fetchMessages = async (senderName, receiverName) => {
        if (!receiverName) return;
        try {
            const res = await axios.get(`${CHAT_API_URL}/${senderName}/${receiverName}`);
            setMessages(res.data);
        } catch (err) {
            console.error("❌ Error fetching messages:", err);
        }
    };

    // Send message to alumni
    const sendMessage = async () => {
        if (!messageInput.trim() || !selectedChat) return;
        const newMessage = { sender: user.displayName, receiver: selectedChat, message: messageInput };
        setMessages([...messages, newMessage]);
        socket.emit("send_message", newMessage);

        try {
            await axios.post(`${CHAT_API_URL}/send`, newMessage);
            setMessageInput("");
        } catch (err) {
            console.error("❌ Error sending message:", err);
        }
    };

    // Update chat when clicking on a new alumni
    useEffect(() => {
        if (receiverName) {
            localStorage.setItem("selectedChat", receiverName);
            setSelectedChat(receiverName);
            fetchMessages(user?.displayName, receiverName);
        }
    }, [receiverName, user]);

    return (
        <div className="chat-container">
            {/* Left Sidebar (WhatsApp-Style Chat List) */}
            <div className="chat-sidebar">
                <h2>Your Chats</h2>
                {chatList.length === 0 ? (
                    <p>No chats available</p>
                ) : (
                    <ul>
                        {chatList.map((chatUser, index) => (
                            <li 
                                key={index} 
                                className={`chat-user ${selectedChat === chatUser ? "active" : ""}`}
                                onClick={() => {
                                    setSelectedChat(chatUser);
                                    fetchMessages(user?.displayName, chatUser);
                                }}
                            >
                                {chatUser}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Chat Window */}
            <div className="chat-window">
                {selectedChat ? (
                    <>
                        <div className="chat-header">
                            <h2>{selectedChat}</h2> {/* ✅ Alumni Name on Top */}
                        </div>
                        <div className="messages">
                            {messages.map((msg, idx) => (
                                <p key={idx} className={msg.sender === user.displayName ? "sent" : "received"}>
                                    <strong>{msg.sender}:</strong> {msg.message}
                                </p>
                            ))}
                        </div>
                        <input
                            type="text"
                            value={messageInput}
                            onChange={(e) => setMessageInput(e.target.value)}
                            placeholder="Type a message..."
                        />
                        <button onClick={sendMessage}>Send</button>
                    </>
                ) : (
                    <p>Select an alumni to start chatting</p>
                )}
            </div>
        </div>
    );
}

export default Chat;
