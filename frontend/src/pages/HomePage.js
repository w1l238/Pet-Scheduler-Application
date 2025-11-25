import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

function HomePage() {
    return (
        <div className="container">
            <header className="hero">
                <h1>Welcome to The Pet Scheduler App!</h1>
                <p>Your one-stop solution for managing pet appointments with ease.</p>
                <div className="hero-buttons">
                    <Link to="/login" className="btn">Login</Link>
                    <Link to="/register" className="btn">Register</Link>
                </div>
            </header>

            <section className="features">
                <div className="feature-card">
                    <h3>Easy Scheduling</h3>
                    <p>Book and manage appointments for your pets in just a few clicks.</p>
                </div>
                <div className="feature-card">
                    <h3>Client & Pet Profiles</h3>
                    <p>Keep all your client and pet information organized in one place.</p>
                </div>
                <div className="feature-card">
                    <h3>Automated Reminders</h3>
                    <p>Reduce no-shows with automated SMS and email reminders for appointments.</p>
                </div>
            </section>
        </div>
    );
}

export default HomePage;