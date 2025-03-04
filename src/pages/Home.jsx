import { useState, useEffect } from "react";
import { signInWithGoogle, auth, logout } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/home.css";
import Logo from "../assets/log.jpeg"; 
import ParticlesComponent from "./Particles";

const API_URL = "http://localhost:5001/alumni";

function Home() {
    const [user, setUser] = useState(null);
    const [showAlumniPopup, setShowAlumniPopup] = useState(false);
    const [isRegistering, setIsRegistering] = useState(false);
    const [alumniData, setAlumniData] = useState({ name: "", email: "", occupation: "", password: "", interests: "", experience: "" });
    const [alumni, setAlumni] = useState(JSON.parse(localStorage.getItem("alumni")) || null);
    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                const emailDomain = currentUser.email.split("@")[1];  
                if (emailDomain === "itbhu.ac.in") { 
                    setUser(currentUser);
                } else {
                    alert("❌ Only IIT BHU students can log in.");
                    logout();
                    setUser(null);
                }
            }
        });

        return () => unsubscribe();
    }, []);

    const handleStudentLogin = () => {
        signInWithGoogle()
            .then((result) => {
                const emailDomain = result.user.email.split("@")[1];
                if (emailDomain !== "itbhu.ac.in") {
                    alert("❌ Only IIT BHU students can log in.");
                    logout();
                }
            })
            .catch((error) => console.error("❌ Error signing in:", error));
    };

    const handleStudentLogout = async () => {
        try {
            await logout(); 
            setUser(null); 
            setAlumni(null);
            localStorage.removeItem("alumni");
            navigate("/"); 
        } catch (error) {
            console.error("❌ Error logging out:", error);
        }
    };

    const handleAlumniLogin = async () => {
        try {
            const res = await axios.post(`${API_URL}/login`, { email: alumniData.email, password: alumniData.password });
            setAlumni(res.data.alumni);
            localStorage.setItem("alumni", JSON.stringify(res.data.alumni));
            setShowAlumniPopup(false);
            alert("✅ Login successful!");
        } catch (err) {
            alert("❌ Login failed: " + err.response.data.message);
        }
    };

    const handleAlumniRegister = async () => {
        try {
            await axios.post(`${API_URL}/register`, alumniData);
            alert("✅ Registration successful! Please log in.");
            setIsRegistering(false);
        } catch (err) {
            alert("❌ Registration failed: " + err.response.data.message);
        }
    };

    const handleAlumniLogout = () => {
        setAlumni(null);
        localStorage.removeItem("alumni");
        navigate("/");
    };

    return (
        <>
            <div className="home-container">
                <ParticlesComponent id="particles" />

                <div className="hero-section">
                    <h1>Electronics Engineering Society</h1>
                    <p>Innovate, Collaborate, and Excel at IIT BHU</p>

                    {!alumni && !user ? (
                        <div className="auth-buttons">
                            <button className="login-btn" onClick={handleStudentLogin}>Login as Student</button>
                            <button className="alumni-btn" onClick={() => setShowAlumniPopup(true)}>Login as Alumni</button>
                        </div>
                    ) : null}

                    {user && (
                        <div className="auth-buttons">
                            <p>Logged in as {user.displayName}</p>
                            <button className="logout-btn" onClick={handleStudentLogout}>Logout</button>
                        </div>
                    )}

                    {alumni && (
                        <div className="auth-buttons">
                            <p>Logged in as {alumni.name} ({alumni.occupation})</p>
                            <button className="logout-btn" onClick={handleAlumniLogout}>Logout</button>
                        </div>
                    )}
                </div>
            </div>

            {/* ✅ About Section */}
            <div className="about-container">
                <h1>ABOUT US</h1>
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

            {/* ✅ Alumni Login & Registration Popup */}
            {showAlumniPopup && (
                <div className="alumni-popup">
                    <div className="alumni-popup-content">
                        <h2>{isRegistering ? "Alumni Registration" : "Alumni Login"}</h2>

                        <input type="email" name="email" placeholder="Your Email" onChange={(e) => setAlumniData({ ...alumniData, email: e.target.value })} />
                        <input type="password" name="password" placeholder="Password" onChange={(e) => setAlumniData({ ...alumniData, password: e.target.value })} />

                        {isRegistering && (
                            <>
                                <input type="text" name="name" placeholder="Your Name" onChange={(e) => setAlumniData({ ...alumniData, name: e.target.value })} />
                                <input type="text" name="occupation" placeholder="Your Occupation" onChange={(e) => setAlumniData({ ...alumniData, occupation: e.target.value })} />
                                <input type="text" name="interests" placeholder="Your Interests" onChange={(e) => setAlumniData({ ...alumniData, interests: e.target.value })} />
                                <input type="text" name="experience" placeholder="Experience" onChange={(e) => setAlumniData({ ...alumniData, experience: e.target.value })} />
                            </>
                        )}

                        <button className="submit-btn" onClick={isRegistering ? handleAlumniRegister : handleAlumniLogin}>{isRegistering ? "Register" : "Login"}</button>
                        <button className="toggle-btn" onClick={() => setIsRegistering(!isRegistering)}>{isRegistering ? "Already Registered? Login" : "New? Register"}</button>
                    </div>
                </div>
            )}

            {/* ✅ Footer Section */}
            <footer className="footer">
                <div className="footer-content">
                    <div className="footer-logos">
                        <img src={Logo} alt="Society Logo" className="footer-logo" />
                    </div>
                    <div className="footer-links">
                        <h3>Important Links</h3>
                        <ul>
                            <li><a href="https://github.com/electronics-society" target="_blank" rel="noopener noreferrer">GitHub</a></li>
                            <li><a href="https://www.linkedin.com/in/electronics-society/" target="_blank" rel="noopener noreferrer">LinkedIn</a></li>
                            <li><a href="/contact">Contact Us</a></li>
                        </ul>
                    </div>
                </div>
                <p className="footer-bottom">© 2025 Electronics Engineering Society, IIT BHU. All rights reserved.</p>
            </footer>
        </>
    );
}

export default Home;
