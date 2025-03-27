import { useState, useEffect, useRef } from "react";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/profile.css";
import { useLocation } from "react-router-dom";


const PROFILE_API_URL = "http://localhost:5001/profile";

function Profile() {
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const viewedName = searchParams.get("name"); // ✅ this is the name in URL param if clicked from chat

    const [alumni, setAlumni] = useState(JSON.parse(localStorage.getItem("alumni")) || null);

    const [user, setUser] = useState(null);




    const [profileData, setProfileData] = useState({
        name: "",
        department: "",
        degree: "",
        about: "",
        profilePic: "",
    });
    const [selectedFile, setSelectedFile] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const isViewingOwnProfile = !viewedName || (user && viewedName === user.displayName) || (alumni && viewedName === alumni.name);
    const fileInputRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const storedAlumni = JSON.parse(localStorage.getItem("alumni"));

        if (viewedName) {
            // You're viewing someone else's profile (from chat)
            fetchProfileData(viewedName);
        } else {
            // You're viewing your own profile (student or alumni)
            onAuthStateChanged(auth, (currentUser) => {
                if (currentUser) {
                    setUser(currentUser);
                    fetchProfileData(currentUser.displayName);
                } else if (storedAlumni) {
                    setAlumni(storedAlumni);
                    fetchProfileData(storedAlumni.name);
                } else {
                    navigate("/");
                }
            });
        }
    }, []);


    const fetchProfileData = async (username) => {
        try {
            const res = await axios.get(`${PROFILE_API_URL}/${username}`);
            setProfileData(res.data);
        } catch (err) {
            console.error("❌ Error fetching profile:", err);
        }
    };

    const handleChange = (e) => {
        setProfileData({ ...profileData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setProfileData({ ...profileData, profilePic: URL.createObjectURL(file) }); // Show preview
        }
    };

    const saveProfile = async () => {
        try {
            const formData = new FormData();
            formData.append("name", user ? user.displayName : alumni?.name);
            formData.append("department", profileData.department);
            formData.append("degree", profileData.degree);
            formData.append("about", profileData.about);
            formData.append("occupation", profileData.occupation);
            formData.append("sector", profileData.sector);

            if (selectedFile) {
                formData.append("profilePic", selectedFile);
            }

            const res = await axios.post(`${PROFILE_API_URL}/update`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            setProfileData(res.data);
            alert("✅ Profile updated successfully!");
            setIsEditing(false);
        } catch (err) {
            console.error("❌ Error updating profile:", err);
        }
    };

    return (
        <div className="profile-wrapper">
            <div className="sidebar">
                <h2>Dashboard</h2>
                <ul>
                    <li onClick={() => navigate("/")}>🏠 Home</li>
                    <li className="active">👤 Profile</li>
                    <li onClick={() => navigate("/logout")}>🚪 Logout</li>
                </ul>
            </div>

            <div className="profile-container">
                <h1>Profile</h1>

                {/* Profile Picture Upload */}
                <div className="profile-image-container">
                    <img
                        src={profileData.profilePic ? `http://localhost:5001/uploads/${profileData.profilePic}` : "default-avatar.png"}
                        alt="Profile"
                        className="profile-pic"
                    />

                    {isEditing && (
                        <>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                ref={fileInputRef}
                                style={{ display: "none" }}
                            />
                            <button className="upload-btn" onClick={() => fileInputRef.current.click()}>
                                📤 Upload Profile Picture
                            </button>
                        </>
                    )}
                </div>

                <div className="profile-details">
                    <label>Name:</label>
                    <input type="text" name="name" value={profileData.name} disabled />

                    {alumni ? (
                        <>
                            <label>Occupation:</label>
                            <input
                                type="text"
                                name="occupation"
                                value={profileData.occupation || ""}
                                onChange={handleChange}
                                disabled={!isEditing}
                            />

                            <label>Sector:</label>
                            <input
                                type="text"
                                name="sector"
                                value={profileData.sector || ""}
                                onChange={handleChange}
                                disabled={!isEditing}
                            />
                        </>
                    ) : (
                        <>
                            <label>Department:</label>
                            <input
                                type="text"
                                name="department"
                                value={profileData.department}
                                onChange={handleChange}
                                disabled={!isEditing}
                            />

                            <label>Degree:</label>
                            <select
                                name="degree"
                                value={profileData.degree}
                                onChange={handleChange}
                                disabled={!isEditing}
                            >
                                <option value="">Select Degree</option>
                                <option value="B.Tech">B.Tech</option>
                                <option value="M.Tech">M.Tech</option>
                                <option value="IDD">IDD</option>
                                <option value="Ph.D">Ph.D</option>
                                <option value="Other">Other</option>
                            </select>

                            <label>About:</label>
                            <textarea
                                name="about"
                                value={profileData.about}
                                onChange={handleChange}
                                disabled={!isEditing}
                            />
                        </>
                    )}

                    {isViewingOwnProfile && (
                        isEditing ? (
                            <button className="save-btn" onClick={saveProfile}>Save</button>
                        ) : (
                            <button className="edit-btn" onClick={() => setIsEditing(true)}>Edit</button>
                        )
                    )}


                </div>

            </div>
        </div>
    );
}

export default Profile;
