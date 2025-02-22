import { useState, useEffect } from "react";
import axios from "axios";
import { auth } from "../firebase"; 
import { onAuthStateChanged } from "firebase/auth"; // ✅ Import directly from Firebase
import io from "socket.io-client";
import "../styles/alumni.css";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:5001/alumni";
const CHAT_API_URL = "http://localhost:5001/chat";
const socket = io("http://localhost:5001");

function Alumni() {
    const [alumni, setAlumni] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedAlumnus, setSelectedAlumnus] = useState(null);
    const [messages, setMessages] = useState([]);
    const [messageInput, setMessageInput] = useState("");
    const [user, setUser] = useState(null);
    const navigate = useNavigate();


    // Check if a user is logged in
    useEffect(() => {
        onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
    }, []);

    // Fetch alumni data
    useEffect(() => {
        axios.get(API_URL)
            .then(res => {
                setAlumni(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error("❌ Error fetching alumni data:", err);
                setLoading(false);
            });
    }, []);

    // Open chat with an alumnus
    

    // Send a message
    

    // Listen for incoming messages
    const startChat = (alumnus) => {
        console.log("📌 Alumni Clicked:", alumnus); // Debugging Click
        if (!alumnus.name) {
            console.error("❌ ERROR: Alumni has no name!");
            return;
        }
        navigate(`/chat?name=${encodeURIComponent(alumnus.name)}`);
    };


    return (
        <div className="alumni-container">
            <h1>Alumni Network</h1>
            <p>Click on an alumnus to start a private chat.</p>

            {loading ? (
                <p>Loading alumni data...</p>
            ) : (
                <div className="alumni-list">
                    {alumni.map((alumnus, index) => (
                        <div key={index} className="alumni-card">
                            <h3 
                                className="alumni-name clickable" 
                                onClick={() => startChat(alumnus)}
                            >
                                {alumnus.name}
                            </h3>
                            <p>{alumnus.occupation}</p>
                        </div>
                    ))}
                </div>
            )}

            
        </div>
    );
}

export default Alumni;
