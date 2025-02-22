import { Link } from "react-router-dom";
import "../styles/navbar.css";
import Logo from "../assets/log.jpeg"; // ✅ Import your society's logo

function Navbar() {
    return (
        <nav className="navbar">
            {/* Logo and Title */}
            <div className="logo-container">
                <img src={Logo} alt="Society Logo" className="logo" />
                <h1 className="nav-title">EES IIT BHU</h1>
            </div>

            {/* Navigation Links */}
            <ul className="nav-links">
                <li><Link to="/">Home</Link></li>
                <li><Link to="/events">Events</Link></li>
                <li><Link to="/forum">Forum</Link></li>
                <li><Link to="/alumni">Alumni</Link></li>
                <li><Link to="/contact">Contact</Link></li>
                <li><Link to="/chat ">Chat</Link></li>

            </ul>
        </nav>
    );
}

export default Navbar;
