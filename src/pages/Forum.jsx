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
    const [search, setSearch] = useState("");
    const [selectedThread, setSelectedThread] = useState(null);
    const [showThreadModal, setShowThreadModal] = useState(false);
    const [showPollModal, setShowPollModal] = useState(false);

    // Thread Form
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [image, setImage] = useState(null);
    const [tags, setTags] = useState("");

//full screen view
const [isModalOpen, setIsModalOpen] = useState(false);


    // Poll Form
    const [pollQuestion, setPollQuestion] = useState("");
    const [pollOptions, setPollOptions] = useState([""]);

     // Reply Form
     const [replyMessage, setReplyMessage] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
            } else {
                navigate("/");
            }
        });
        fetchThreads();
    }, []);

    const fetchThreads = async () => {
        try {
            const res = await axios.get(API_URL);
            setThreads(res.data.filter(thread => !thread.poll));  // Filter out polls from regular threads
        } catch (err) {
            console.error("Error fetching threads:", err);
        }
    };
    
    

    const fetchUserPosts = async () => {
        try {
            const res = await axios.get(`${API_URL}/my-posts/${user.displayName.split(" ")[0]}`);
            setThreads(res.data);
        } catch (err) {
            console.error("Error fetching user posts:", err);
        }
    };

    const handleCreateThread = async () => {
        if (!title.trim() || !content.trim()) {
            alert("Title and content are required.");
            return;
        }

        const formData = new FormData();
        formData.append("name", user.displayName.split(" ")[0]);
        formData.append("title", title);
        formData.append("content", content);
        formData.append("tags", tags);
        if (image) formData.append("image", image);

        try {
            await axios.post(`${API_URL}/create-thread`, formData, { headers: { "Content-Type": "multipart/form-data" } });
            fetchThreads();
            setShowThreadModal(false);
            resetForm();
        } catch (err) {
            console.error("Error creating thread:", err);
        }
    };

    const handleCreatePoll = async () => {
        if (!pollQuestion.trim()) {
            alert("Poll question is required.");
            return;
        }

        if (pollOptions.length < 2 || pollOptions.some(opt => opt.trim() === "")) {
            alert("At least two valid options are required.");
            return;
        }

        const pollData = {
            name: user.displayName.split(" ")[0],
            pollQuestion,
            pollOptions
        };

        try {
            await axios.post(`${API_URL}/create-poll`, pollData);
            fetchThreads();
            setShowPollModal(false);
            resetForm();
        } catch (err) {
            console.error("Error creating poll:", err);
        }
    };

    const handleReplyToThread = async (threadId) => {
        if (!replyMessage.trim()) {
            alert("Please enter a reply.");
            return;
        }
      
        const replyData = {
            name: user.displayName.split(" ")[0],
            message: replyMessage,
        };
      
        try {
            const res = await axios.post(`${API_URL}/${threadId}/reply`, replyData);
            const updatedThread = res.data;
            setThreads(prevThreads =>
                prevThreads.map(thread =>
                    thread._id === updatedThread._id ? updatedThread : thread
                )
            );
            setReplyMessage(""); // Clear reply input
        } catch (err) {
            console.error("Error replying to thread:", err);
        }
      };
      

    const resetForm = () => {
        setTitle("");
        setContent("");
        setImage(null);
        setTags("");
        setPollQuestion("");
        setPollOptions([""]);
    };

    const handleDeleteThread = async (threadId) => {
      try {
          await axios.delete(`${API_URL}/${threadId}?name=${user.displayName.split(" ")[0]}`);
          fetchThreads();
          setSelectedThread(null);
      } catch (err) {
          alert("❌ You can only delete your own thread.");
          console.error("Error deleting thread:", err);
      }
  };

  const fetchPolls = async () => {
    try {
        const res = await axios.get(`${API_URL}/polls`);  // This API call will fetch only polls
        setThreads(res.data);
    } catch (err) {
        console.error("Error fetching polls:", err);
    }
};


  const handleDeleteReply = async (threadId, replyId) => {
    try {
        await axios.delete(`${API_URL}/${threadId}/reply/${replyId}/${user.displayName.split(" ")[0]}`);
        fetchThreads();
        if (selectedThread && selectedThread._id === threadId) {
            setSelectedThread({ ...selectedThread, replies: selectedThread.replies.filter(r => r._id !== replyId) });
        }
    } catch (err) {
        alert("❌ You can only delete your own reply.");
        console.error("Error deleting reply:", err);
    }
};

const handleVotePoll = async (pollId, optionIndex) => {
    try {
        const userId = user.uid; // Get user ID for voting
  
        const res = await axios.post(`${API_URL}/${pollId}/poll`, { userId, optionIndex });
  
        const updatedThread = res.data;  // Update the thread with the poll results
        setThreads(prevThreads => prevThreads.map(thread =>
            thread._id === updatedThread._id ? updatedThread : thread
        ));
    } catch (err) {
        alert(err.response.data.message);
    }
  };
  


    return (
        <div className="forum-container">
            {/* Sidebar */}
            <div className="forum-sidebar">
            <ul>
    <li><button onClick={() => navigate("/")}>🏠 Home</button></li>
    <hr />
    <li><button onClick={fetchThreads}>📢 All Threads</button></li>
    <li><button onClick={fetchPolls}>📊 View Polls</button></li>
    <hr />
    <li><button onClick={fetchUserPosts}>👤 My Posts</button></li>
    {user && (
        <>
            <hr />
            <li><button onClick={logout}>🚪 Logout</button></li>
        </>
    )}
</ul>

            </div>

            {/* Main Content */}
            <div className="forum-content">
                <input type="text" value={search} onChange={(e) => setSearch(e.target.value.toLowerCase())} placeholder="Search..." />

                {/* Right Side Buttons */}
                <div className="forum-buttons">
                    <button onClick={() => setShowThreadModal(true)}>📝 Create Thread</button>
                    <button onClick={() => setShowPollModal(true)}>📊 Create Poll</button>
                </div>

                {/* Thread Modal */}
                {showThreadModal && (
                    <div className="modal">
                        <h3>Create a Thread</h3>
                        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" />
                        <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Content"></textarea>
                        <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} />
                        <input type="text" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="Tags (comma-separated)" />
                        <button onClick={handleCreateThread}>✅ Create Thread</button>
                        <button onClick={() => setShowThreadModal(false)}>❌ Cancel</button>
                    </div>
                )}

                {/* Poll Modal */}
                {showPollModal && (
                    <div className="modal">
                        <h3>Create a Poll</h3>
                        <input type="text" value={pollQuestion} onChange={(e) => setPollQuestion(e.target.value)} placeholder="Poll Question" />
                        {pollOptions.map((option, index) => (
                            <input
                                key={index}
                                type="text"
                                value={option}
                                onChange={(e) => {
                                    const newOptions = [...pollOptions];
                                    newOptions[index] = e.target.value;
                                    setPollOptions(newOptions);
                                }}
                                placeholder={`Option ${index + 1}`}
                            />
                        ))}
                        <button onClick={() => setPollOptions([...pollOptions, ""])}>➕ Add Option</button>
                        <button onClick={handleCreatePoll}>✅ Create Poll</button>
                        <button onClick={() => setShowPollModal(false)}>❌ Cancel</button>
                    </div>
                )}

                {/* Display Threads and Polls */}
                {threads.filter(thread => thread.title?.toLowerCase().includes(search) || thread.poll?.question?.toLowerCase().includes(search))
  .map(thread => (
    <div key={thread._id} className="thread-card">
        <h3>{thread.title || "Poll"}</h3>
        {thread.poll && <p>📊 Poll: {thread.poll.question}</p>}
        <button onClick={() => { setSelectedThread(thread); setIsModalOpen(true); }}>View</button>
    </div>
))}

            </div>
             {/* Display Thread Details */}
             {isModalOpen && selectedThread && (
    <div className="thread-detail-modal">
        <button className="back-btn" onClick={() => setIsModalOpen(false)}>⬅ Back</button>
        <h2>{selectedThread.title}</h2>
        <p>{selectedThread.content}</p>
        {selectedThread.image && <img src={selectedThread.image} alt="Thread" />}
        <div>
            <h3>Replies</h3>
            {selectedThread.replies.map((reply, index) => (
                <div key={index}>
                    <p><b>{reply.name}:</b> {reply.message}</p>
                    {reply.name === user.displayName.split(" ")[0] && (
                        <button onClick={() => handleDeleteReply(selectedThread._id, reply._id)}>🗑 Delete Reply</button>
                    )}
                </div>
            ))}
        </div>
        <div>
            <input
                type="text"
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                placeholder="Add a reply..."
            />
            <button onClick={() => handleReplyToThread(selectedThread._id)}>Reply</button>
        </div>
        {selectedThread.name === user.displayName.split(" ")[0] && (
            <button onClick={() => handleDeleteThread(selectedThread._id)}>🗑 Delete Thread</button>
        )}
    </div>
)}

            {/* Poll Voting */}
            {selectedThread && selectedThread.poll && (
    <div>
        <h3>{selectedThread.poll.question}</h3>
        <div>
            {selectedThread.poll.options.map((option, index) => (
                <div key={index}>
                    <button onClick={() => handleVotePoll(selectedThread._id, index)}>{option.option}</button>
                    <span>Votes: {option.votes}</span>
                </div>
            ))}
        </div>
        {selectedThread.name === user.displayName.split(" ")[0] && (
            <button onClick={() => handleDeleteThread(selectedThread._id)}>🗑 Delete Poll</button>
        )}
    </div>
)}

        </div>
    );
}

export default Forum;
