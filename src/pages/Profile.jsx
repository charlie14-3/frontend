import { useState, useEffect } from "react";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/profile.css";

const PROFILE_API_URL = "http://localhost:5001/profile";

function Profile() {
    const [user, setUser] = useState(null);
    const [alumni, setAlumni] = useState(JSON.parse(localStorage.getItem("alumni")) || null);
    const [profileData, setProfileData] = useState({
        name: "",
        department: "",
        degree: "",
        about: ""
    });
    const [isEditing, setIsEditing] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                fetchProfileData(currentUser.displayName);
            } else if (alumni) {
                fetchProfileData(alumni.name);
            } else {
                navigate("/"); // Redirect to home if not logged in
            }
        });
    }, []);

    // ✅ Fetch User Profile Data
    const fetchProfileData = async (username) => {
        try {
            const res = await axios.get(`${PROFILE_API_URL}/${username}`);
            setProfileData(res.data);
        } catch (err) {
            console.error("❌ Error fetching profile:", err);
        }
    };

    // ✅ Handle Input Changes
    const handleChange = (e) => {
        setProfileData({ ...profileData, [e.target.name]: e.target.value });
    };

    // ✅ Save Profile Data
    const saveProfile = async () => {
        try {
            await axios.post(`${PROFILE_API_URL}/update`, { ...profileData, name: user ? user.displayName : alumni?.name });
            alert("✅ Profile updated successfully!");
            setIsEditing(false);
        } catch (err) {
            console.error("❌ Error updating profile:", err);
        }
    };

    return (
        <div className="profile-container">
            <h1>Profile</h1>

            <label>Name:</label>
            <input type="text" name="name" value={profileData.name} disabled />

            <label>Department:</label>
            <input type="text" name="department" value={profileData.department} onChange={handleChange} disabled={!isEditing} placeholder="Enter your department" />

            <label>Degree:</label>
            <select name="degree" value={profileData.degree} onChange={handleChange} disabled={!isEditing}>
                <option value="">Select Degree</option>
                <option value="B.Tech">B.Tech</option>
                <option value="M.Tech">M.Tech</option>
                <option value="IDD">IDD</option>

                <option value="Ph.D">Ph.D</option>
                <option value="Other">Other</option>
            </select>

            <label>About:</label>
            <textarea name="about" value={profileData.about} onChange={handleChange} disabled={!isEditing} placeholder="Tell us about yourself..." />

            {isEditing ? (
                <button onClick={saveProfile}>Save</button>
            ) : (
                <button onClick={() => setIsEditing(true)}>Edit</button>
            )}
        </div>
    );
}

export default Profile;
