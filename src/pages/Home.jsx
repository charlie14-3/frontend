import { useState, useEffect } from "react";
import { signInWithGoogle, auth, logout } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/home.css";
import BackgroundImage from "../assets/background.webp"; // ✅ Background Image

function Home() {
    const [user, setUser] = useState(null);
    const [showAlumniPopup, setShowAlumniPopup] = useState(false);
    const [alumniData, setAlumniData] = useState({ name: "", email: "", occupation: "" });
    const [alumni, setAlumni] = useState(JSON.parse(localStorage.getItem("alumni")) || null); // ✅ Store Alumni Session
    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribe(); // ✅ Cleanup listener on unmount
    }, []);

    // ✅ Open Alumni Login Popup
    const handleAlumniLogin = () => {
        setShowAlumniPopup(true);
    };

    // ✅ Handle Input Change
    const handleInputChange = (e) => {
        setAlumniData({ ...alumniData, [e.target.name]: e.target.value });
    };

    // ✅ Submit Alumni Data
    const submitAlumniData = async () => {
        if (!alumniData.name || !alumniData.email || !alumniData.occupation) {
            alert("⚠️ Please fill in all fields.");
            return;
        }

        try {
            const res = await axios.post("http://localhost:5001/alumni/add", alumniData);
            if (res.data.success) {
                setAlumni(alumniData);
                localStorage.setItem("alumni", JSON.stringify(alumniData)); // ✅ Store Alumni Session
                setShowAlumniPopup(false);
            }
        } catch (err) {
            console.error("❌ Error submitting alumni data:", err);
        }
    };

    // ✅ Logout Alumni
    const handleAlumniLogout = () => {
        setAlumni(null);
        localStorage.removeItem("alumni");
    };

    return (
        <>
            <div className="home-container" style={{ backgroundImage: `url(${BackgroundImage})` }}>
                <div className="hero-section">
                    <h1>Electronics Engineering Society</h1>
                    <p>Innovate, Collaborate, and Excel at IIT BHU</p>

                    {/* ✅ Hide login buttons if an alumni is logged in */}
                    {!alumni && !user ? (
                        <div className="auth-buttons">
                            <button className="login-btn" onClick={signInWithGoogle}>Login as Student</button>
                            <button className="alumni-btn" onClick={handleAlumniLogin}>Login as Alumni</button>
                        </div>
                    ) : null}

                    {/* ✅ Student Logout Button */}
                    {user ? (
                        <div className="auth-buttons">
                            <p>Logged in as {user.displayName}</p>
                            <button className="logout-btn" onClick={logout}>Logout</button>
                        </div>
                    ) : null}

                    {/* ✅ Alumni Logout Button */}
                    {alumni ? (
                        <div className="auth-buttons">
                            <p>Logged in as {alumni.name} ({alumni.occupation})</p>
                            <button className="logout-btn" onClick={handleAlumniLogout}>Logout</button>
                        </div>
                    ) : null}
                </div>
            </div>

            {/* ✅ About Section remains unchanged */}
            <div className="about-container">
                <h1>About Us</h1>
                <p className="about-description">
                    Welcome to the <b>Society of Electronics Engineering</b> at IIT BHU! We are a dynamic community of
                    students, faculty, and professionals dedicated to fostering innovation in electronics and technology.
                </p>

                <div className="about-section">
                    <h2>🎯 Our Mission</h2>
                    <p>
                        To empower students with knowledge and hands-on experience in electronics, bridging the gap between
                        academia and industry through workshops, hackathons, and research.
                    </p>
                </div>

                <div className="about-section">
                    <h2>🌍 Our Vision</h2>
                    <p>
                        To be a hub of innovation where future engineers and tech leaders emerge, solving real-world
                        challenges with cutting-edge technology.
                    </p>
                </div>
            </div>

            {/* ✅ Alumni Login Popup */}
            {showAlumniPopup && (
                <div className="alumni-popup">
                    <div className="alumni-popup-content">
                        <h2>Alumni Login</h2>
                        <p>Enter your details to log in.</p>
                        <input type="text" name="name" placeholder="Your Name" onChange={handleInputChange} />
                        <input type="email" name="email" placeholder="Your Email" onChange={handleInputChange} />
                        <input type="text" name="occupation" placeholder="Your Occupation" onChange={handleInputChange} />
                        <button className="submit-btn" onClick={submitAlumniData}>Submit</button>
                        <button className="close-btn" onClick={() => setShowAlumniPopup(false)}>Cancel</button>
                    </div>
                </div>
            )}
        </>
    );
}

export default Home;
