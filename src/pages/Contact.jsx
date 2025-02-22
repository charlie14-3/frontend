import { useState } from "react";
import "../styles/contact.css";

function Contact() {
    const [formData, setFormData] = useState({ name: "", email: "", message: "" });
    const [submitted, setSubmitted] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.name || !formData.email || !formData.message) {
            alert("Please fill in all fields.");
            return;
        }

        console.log("Form Submitted:", formData);
        setSubmitted(true);

        // Reset form after submission
        setTimeout(() => {
            setFormData({ name: "", email: "", message: "" });
            setSubmitted(false);
        }, 3000);
    };

    return (
        <div className="contact-container">
            <h1>Contact Us</h1>
            <p>We would love to hear from you! Reach out with your queries or feedback.</p>

            <div className="contact-form">
                {submitted ? (
                    <p className="success-message">Thank you for contacting us! We will get back to you soon.</p>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Your Name" required />
                        <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Your Email" required />
                        <textarea name="message" value={formData.message} onChange={handleChange} placeholder="Your Message" required></textarea>
                        <button type="submit">Send Message</button>
                    </form>
                )}
            </div>

            {/* Google Maps Embed */}
            <div className="map-container">
                <h2>Find Us</h2>
                <iframe
                    title="Google Maps"
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3672.6493086489767!2d82.99455107518773!3d25.26202532756096!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x398e3193b2b9dff5%3A0x5c2a8a69d5a7c68!2sIIT%20(BHU)%20Varanasi!5e0!3m2!1sen!2sin!4v1643035636738!5m2!1sen!2sin"
                    width="100%"
                    height="300"
                    allowFullScreen
                    loading="lazy"
                ></iframe>
            </div>
        </div>
    );
}

export default Contact;
