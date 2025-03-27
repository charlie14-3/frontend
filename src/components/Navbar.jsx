import { Link } from "react-router-dom";
import "../styles/navbar.css";
import Logo from "../assets/log.jpeg"; // ✅ Import your society's logo
import { Menu, X } from "lucide-react"; // Using lucide-react for icons

//for profile 
import { useState, useEffect, useRef } from "react";
import { auth } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import profileIcon from "../assets/profile.png"; // Make sure to have a small icon
import "../styles/navbar.css";



function Navbar() {
    //profile
    const [user, setUser] = useState(null);
    const [alumni, setAlumni] = useState(JSON.parse(localStorage.getItem("alumni")) || null);
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
const dropdownRef = useRef(null);

useEffect(() => {
    function handleClickOutside(event) {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
            setShowDropdown(false);
        }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
}, []);


    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });

        return () => unsubscribe();
    }, []);

    // ✅ Handle Profile Click (Redirect Logic)
    const handleProfileClick = () => {
        setShowDropdown(!showDropdown);
    };
    const handleLogout = async () => {
        if (user) {
            await signOut(auth);
            setUser(null);
        }
        if (alumni) {
            localStorage.removeItem("alumni");
            setAlumni(null);
        }
        navigate("/");
    };
    




    return (
        <nav className="navbar">
            {/* Logo and Title */}
            <div className="logo-container">
                <img src={Logo} alt="Society Logo" className="logo" />
                <h1 className="nav-title">EES IIT BHU</h1>
            </div>

            {/* Navigation Links */}
            <ul className={`nav-links ${menuOpen ? "active" : ""}`}>
                <li><Link to="/">Home</Link></li>
                <li><Link to="/events">Events</Link></li>
                <li><Link to="/forum">Forum</Link></li>
                <li><Link to="/alumni">Alumni</Link></li>
                <li><Link to="/contact">Contact</Link></li>
                <li><Link to="/chat ">Chat</Link></li>
                <img 
                    src={profileIcon} 
                    alt="Profile" 
                    className="profile-icon" 
                    onClick={handleProfileClick} 
                />
                {showDropdown && (
    <div className="profile-dropdown" ref={dropdownRef}>
        <p onClick={() => { navigate("/profile"); setShowDropdown(false); }}>👤 View Profile</p>
        <p onClick={handleLogout}>🚪 Logout</p>
    </div>
)}

            </ul>
            {/* Hamburger Menu Toggle (For Mobile) */}
            <div className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
                <div className="bar"></div>
                <div className="bar"></div>
                <div className="bar"></div>
            </div>

            {/* Mobile Dropdown Menu */}
            <div className={`mobile-menu ${menuOpen ? "active" : ""}`}>
                <Link to="/" onClick={() => setMenuOpen(false)}>Home</Link>
                <Link to="/events" onClick={() => setMenuOpen(false)}>Events</Link>
                <Link to="/forum" onClick={() => setMenuOpen(false)}>Forum</Link>
                <Link to="/alumni" onClick={() => setMenuOpen(false)}>Alumni</Link>
                <Link to="/contact" onClick={() => setMenuOpen(false)}>Contact</Link>
                <Link to="/chat" onClick={() => setMenuOpen(false)}>Chat</Link>
            </div>
        </nav>
    );
}

export default Navbar;
