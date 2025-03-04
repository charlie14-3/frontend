import { useState } from "react";
import "../styles/events.css";

const eventsData = [
    { name: "DEVBITS", details: "Explore the world of Web Development and Competitive Programming." },
    { name: "CASSANDRA", details: "Unleash the power of Machine Learning & Data Science." },
    { name: "X-IOTA", details: "IoT challenges that push the limits of Robotics and Automation." },
    { name: "DIGISIM", details: "Master Digital Circuit Simulation and Design." },
    { name: "FUNCKIT", details: "Challenge yourself with coding and circuit puzzles." },
    { name: "COMMNET", details: "Discover the world of Digital and Analog Communication." },
    { name: "I-CHIP", details: "Design, simulate, and innovate with advanced chip design." }
];

function Events() {
    const [flipped, setFlipped] = useState(Array(eventsData.length).fill(false));

    const handleFlip = (index) => {
        setFlipped((prev) => {
            const newFlipped = [...prev];
            newFlipped[index] = !newFlipped[index];
            return newFlipped;
        });
    };

    return (
        <div className="events-container">
            {/* UDYAM Section */}
            <div className="udyam-section">
                <h1>UDYAM</h1>
                <p>
                    Over the course of more than a decade, <b>UDYAM</b>, the Annual Techno-Management Festival hosted 
                    by the Department of Electronics Engineering at IIT (BHU) Varanasi, has been a cornerstone event. 
                    It offers a diverse array of competitions in <b>Digital & Analog Electronics, Data Science, Machine Learning</b>, and more.
                    <br /><br />
                    Now, poised for its latest edition in <b>2024</b>, UDYAM continues fostering <b>technical excellence</b> among Indian technocrats.
                </p>
            </div>

            {/* Sub-Events Section */}
            <div className="sub-events">
                <h2>Sub Events</h2>
                <div className="events-grid">
                    {eventsData.map((event, index) => (
                        <div key={index} className="event-card" onClick={() => handleFlip(index)}>
                            <div className={`event-card-inner ${flipped[index] ? "flipped" : ""}`}>
                                {/* Front Side */}
                                <div className="event-card-front">
                                    <h3>{event.name}</h3>
                                    <button>Register</button>
                                </div>

                                {/* Back Side */}
                                <div className="event-card-back">
                                    <p>{event.details}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Events;
