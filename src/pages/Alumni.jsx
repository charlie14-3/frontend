import { useState, useEffect } from "react";
import axios from "axios";
import { auth } from "../firebase"; 
import { onAuthStateChanged } from "firebase/auth";
import "../styles/alumni.css";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:5001/alumni";

function Alumni() {
    const [alumni, setAlumni] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    // ✅ Check if a user is logged in
    useEffect(() => {
        onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
    }, []);

    // ✅ Fetch alumni data from the backend
    useEffect(() => {
        const fetchAlumni = async () => {
            try {
                const res = await axios.get(API_URL);
                console.log("✅ Alumni Data Received:", res.data);
                setAlumni(res.data);
            } catch (err) {
                console.error("❌ Error fetching alumni data:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchAlumni();
    }, []);

    // ✅ Navigate to chat
    const startChat = (alumnus) => {
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
                    {alumni.length > 0 ? (
                        alumni.map((alumnus, index) => (
                            <div key={index} className="alumni-card">
                                <h3 
                                    className="alumni-name clickable" 
                                    onClick={() => startChat(alumnus)}
                                >
                                    {alumnus.name || "Unknown"}
                                </h3>
                                <p>{alumnus.occupation || "Not Provided"}</p>
                            </div>
                        ))
                    ) : (
                        <p>No alumni data available.</p>
                    )}
                </div>
            )}
        </div>
    );
}

export default Alumni;
