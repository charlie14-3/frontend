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
    const [searchType, setSearchType] = useState("name");
    const [searchText, setSearchText] = useState("");
    
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
                const res = await axios.get(API_URL); // Fetch alumni data from Google Sheets via backend
                console.log("✅ Alumni Data Received:", res.data);
                setAlumni(res.data); // Save data into alumni state
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

            {/* ✅ Search Bar */}
            <div className="search-bar">
                <select
                    value={searchType}
                    onChange={(e) => setSearchType(e.target.value)}
                    className="search-dropdown"
                >
                    <option value="name">Name</option>
                    <option value="occupation">Occupation</option>
                    <option value="sector">Sector</option>
                </select>

                <input
                    type="text"
                    placeholder={`Search by ${searchType}`}
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    className="search-input"
                />
            </div>

            {/* ✅ Alumni List */}
            {loading ? (
                <p>Loading alumni data...</p>
            ) : (
                <div className="alumni-list">
                    {alumni.length > 0 ? (
                        alumni
                            .filter((alumnus) => {
                                const value = alumnus[searchType]?.toLowerCase() || "";
                                return value.includes(searchText.toLowerCase());
                            })
                            .map((alumnus, index) => (
                                <div key={index} className="alumni-card">
                                    <h3
                                        className="alumni-name clickable"
                                        onClick={() => startChat(alumnus)}
                                    >
                                        {alumnus.name || "Unknown"}
                                    </h3>
                                    <p><b>Occupation:</b> {alumnus.occupation || "Not Provided"}</p>
                                    <p><b>Sector:</b> {alumnus.sector || "Not Provided"}</p>
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