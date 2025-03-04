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
    const [alumni, setAlumni] = useState(null);
    const [loading, setLoading] = useState(true);
    const [title, setTitle] = useState("");
    const [search, setSearch] = useState("");
    const [selectedThread, setSelectedThread] = useState(null);
    const [replyMessage, setReplyMessage] = useState("");

    const navigate = useNavigate();

    useEffect(() => {
        const checkAuth = async () => {
            onAuthStateChanged(auth, (currentUser) => {
                if (currentUser && currentUser.email.endsWith("@itbhu.ac.in")) {
                    setUser(currentUser);
                }
            });

            const storedAlumni = JSON.parse(localStorage.getItem("alumni"));
            if (storedAlumni) {
                setAlumni(storedAlumni);
            }
        };

        checkAuth();
        fetchThreads();
    }, []);

    const fetchThreads = async () => {
        try {
            const res = await axios.get(API_URL);
            setThreads(res.data);
        } catch (err) {
            console.error("Error fetching threads:", err);
        } finally {
            setLoading(false);
        }
    };

    const addThread = async () => {
        if ((!user && !alumni) || !title.trim()) return alert("You must be logged in to post.");

        const postData = {
            name: user ? user.displayName.split(" ")[0] : alumni.name.split(" ")[0], // First Name Only
            title,
        };

        try {
            const res = await axios.post(API_URL, postData);
            setThreads(res.data);
            setTitle("");
        } catch (err) {
            console.error("Error adding thread:", err);
        }
    };

    const replyToThread = async (id) => {
        if (!replyMessage.trim()) return alert("⚠️ Please enter a reply.");

        const replyData = {
            name: user ? user.displayName.split(" ")[0] : alumni.name.split(" ")[0], // First Name Only
            message: replyMessage,
        };

        try {
            const res = await axios.post(`${API_URL}/${id}/reply`, replyData);

            // ✅ Update the local state immediately
            setThreads((prevThreads) =>
                prevThreads.map((thread) =>
                    thread._id === id ? { ...thread, replies: [...thread.replies, res.data.replies[res.data.replies.length - 1]] } : thread
                )
            );

            // ✅ Update the selected thread immediately if it's open
            if (selectedThread && selectedThread._id === id) {
                setSelectedThread({ ...selectedThread, replies: [...selectedThread.replies, res.data.replies[res.data.replies.length - 1]] });
            }

            setReplyMessage(""); // Clear input after sending
        } catch (err) {
            console.error("Error replying to thread:", err);
        }
    };

    const deleteThread = async (id) => {
        try {
            await axios.delete(`${API_URL}/${id}`);
            setThreads((prevThreads) => prevThreads.filter((thread) => thread._id !== id));
            setSelectedThread(null); // If deleting the currently viewed thread, return to list
        } catch (err) {
            console.error("Error deleting thread:", err);
        }
    };
    const deleteReply = async (threadId, replyId) => {
        const currentUserName = user ? user.displayName.split(" ")[0] : alumni.name.split(" ")[0];

        try {
            const res = await axios.delete(`${API_URL}/${threadId}/reply/${replyId}/${currentUserName}`);

            // ✅ Update the thread list (delete reply instantly)
            setThreads((prevThreads) =>
                prevThreads.map((thread) =>
                    thread._id === threadId ? { ...thread, replies: res.data.replies } : thread
                )
            );

            // ✅ Update the selected thread if open
            if (selectedThread && selectedThread._id === threadId) {
                setSelectedThread({ ...selectedThread, replies: res.data.replies });
            }
        } catch (err) {
            alert("❌ You can only delete your own reply.");
            console.error("Error deleting reply:", err);
        }
    };


    return (
        <div className="forum">
            <div className="forum-header">
                <h1>Discussion Forum</h1>
                {user || alumni ? <button className="logout-btn" onClick={logout}>Logout</button> : null}
            </div>

            {/* Search Bar */}
            <div className="search-box">
                <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search threads..." />
                <button onClick={fetchThreads}>🔍 Search</button>
            </div>

            {/* Post a New Thread */}
            {user || alumni ? (
                <div className="post-box">
                    <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Start a discussion..." />
                    <button onClick={addThread}>Post</button>
                </div>
            ) : (
                <p>You must be logged in to post a thread.</p>
            )}

            {loading ? (
                <p>Loading...</p>
            ) : selectedThread ? (
                <div className="thread-detail">
                    <h2>{selectedThread.title}</h2>
                    <p>By {selectedThread.name}</p>

                    <div className="replies">
                        <h4>Replies:</h4>
                        {selectedThread.replies.map((r, idx) => (
                            <div key={idx} className="reply-item">
                                <p><b>{r.name}:</b> {r.message}</p>
                                {r.name === (user ? user.displayName.split(" ")[0] : alumni.name.split(" ")[0]) && (
                                    <button className="del-reply" onClick={() => deleteReply(selectedThread._id, r._id)}>🗑 Delete</button>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Reply to Thread */}
                    <div className="reply-box">
                        <input type="text" value={replyMessage} onChange={(e) => setReplyMessage(e.target.value)} placeholder="Your reply..." />
                        <button onClick={() => replyToThread(selectedThread._id)}>Reply</button>
                    </div>

                    {/* Delete Thread Button */}
                    <button className="del" onClick={() => deleteThread(selectedThread._id)}>🗑 Delete Thread</button>
                    <button onClick={() => setSelectedThread(null)}>⬅ Back</button>
                </div>
            ) : (
                <ul className="thread-list">
                    {threads.filter(t => t.title.toLowerCase().includes(search.toLowerCase())).map((thread) => (
                        <li key={thread._id} className="thread" onClick={() => setSelectedThread(thread)}>
                            <h3>{thread.title}</h3>
                            <small>By {thread.name}</small>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default Forum;
