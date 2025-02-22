import "../styles/events.css";

function Events() {
    return (
        <div className="events-container">
            {/* UDYAM Section */}
            <div className="udyam-section">
                <h1>UDYAM</h1>
                <p>
                    Over the course of more than a decade, <b>UDYAM</b>, the Annual Techno-Management Festival hosted 
                    by the Department of Electronics Engineering at IIT (BHU) Varanasi, has been a cornerstone event. 
                    It offers a diverse array of competitions in **Digital & Analog Electronics, Data Science, Machine Learning**, and more.
                    <br /><br />
                    Now, poised for its latest edition in <b>2024</b>, UDYAM continues fostering **technical excellence** among Indian technocrats.
                </p>
            </div>

            {/* Sub-Events Section */}
            <div className="sub-events">
                <h2>Sub Events</h2>
                <div className="events-grid">
                    <div className="event-card">
                        <h3>DEVBITS</h3>
                        <p>Explore the world of Web Development and Competitive Programming.</p>
                        <button>Register</button>
                    </div>

                    <div className="event-card">
                        <h3>CASSANDRA</h3>
                        <p>Unleash the power of Machine Learning & Data Science.</p>
                        <button>Register</button>
                    </div>

                    <div className="event-card">
                        <h3>X-IOTA</h3>
                        <p>IoT challenges that push the limits of Robotics and Automation.</p>
                        <button>Register</button>
                    </div>

                    <div className="event-card">
                        <h3>DIGISIM</h3>
                        <p>Master Digital Circuit Simulation and Design.</p>
                        <button>Register</button>
                    </div>

                    <div className="event-card">
                        <h3>FUNCKIT</h3>
                        <p>Challenge yourself with coding and circuit puzzles.</p>
                        <button>Register</button>
                    </div>

                    <div className="event-card">
                        <h3>COMMNET</h3>
                        <p>Discover the world of Digital and Analog Communication.</p>
                        <button>Register</button>
                    </div>

                    <div className="event-card">
                        <h3>I-CHIP</h3>
                        <p>Design, simulate, and innovate with advanced chip design.</p>
                        <button>Register</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Events;
