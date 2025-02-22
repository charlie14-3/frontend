import { useState, useEffect } from "react";
import { auth, logout } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/forum.css";

const API_URL = "http://localhost:5001/forum";

function Forum() {
    const [threads, setThreads] = useState([]);
    const [user, setUser] = useState(null);
    const [name, setName] = useState("");
    const [title, setTitle] = useState("");
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyName, setReplyName] = useState("");
    const [replyMessage, setReplyMessage] = useState("");

    const navigate = useNavigate();

    useEffect(() => {
        onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                const emailDomain = currentUser.email.split("@")[1];
                if (emailDomain === "itbhu.ac.in") {
                    setUser(currentUser);
                    fetchThreads();
                } else {
                    alert("Only IIT BHU students can access the forum.");
                    logout();
                    navigate("/");
                }
            } else {
                navigate("/");
            }
        });
    }, []);

    const fetchThreads = async () => {
        try {
            const res = await axios.get(API_URL);
            setThreads(res.data);
        } catch (err) {
            console.error("Error fetching threads:", err);
        }
    };

    const addThread = async () => {
        if (!user) return alert("You must be logged in to post.");
        if (!title.trim()) return alert("Title cannot be empty.");
        
        try {
            const res = await axios.post(API_URL, { name: user.displayName, title });
            setThreads(res.data);
            setTitle("");
        } catch (err) {
            console.error("Error adding thread:", err);
        }
    };

    const replyToThread = async (id) => {
        if (!replyName.trim() || !replyMessage.trim()) return alert("Enter name and reply.");
        
        try {
            const res = await axios.post(`${API_URL}/${id}/reply`, { name: replyName, message: replyMessage });
            setThreads(threads.map((thread) => (thread._id === id ? res.data : thread)));
            setReplyName("");
            setReplyMessage("");
            setReplyingTo(null);
        } catch (err) {
            console.error("Error replying to thread:", err);
        }
    };

    const deleteThread = async (id) => {
        try {
            await axios.delete(`${API_URL}/${id}`);
            setThreads(threads.filter((thread) => thread._id !== id));
        } catch (err) {
            console.error("Error deleting thread:", err);
        }
    };

    return (
        <div className="forum">
            <h1>Discussion Forum</h1>
            <p>Welcome, {user?.displayName || "Guest"}</p>
            <button onClick={logout}>Logout</button>

            <div className="post-box">
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Start a discussion..." />
                <button onClick={addThread}>Post</button>
            </div>

            <ul className="thread-list">
                {threads.map((thread) => (
                    <li key={thread._id} className="thread">
                        <h3>{thread.title} (by {thread.name})</h3>
                        <button onClick={() => deleteThread(thread._id)}>🗑 Delete</button>

                        <div className="replies">
                            <h4>Replies:</h4>
                            {thread.replies.map((r, idx) => (
                                <p key={idx}><b>{r.name}:</b> {r.message}</p>
                            ))}
                        </div>

                        {replyingTo === thread._id ? (
                            <div>
                                <input type="text" value={replyName} onChange={(e) => setReplyName(e.target.value)} placeholder="Your Name" />
                                <input type="text" value={replyMessage} onChange={(e) => setReplyMessage(e.target.value)} placeholder="Your reply..." />
                                <button onClick={() => replyToThread(thread._id)}>Reply</button>
                            </div>
                        ) : (
                            <button className="repel" onClick={() => setReplyingTo(thread._id)}>💬 Reply</button>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default Forum;
