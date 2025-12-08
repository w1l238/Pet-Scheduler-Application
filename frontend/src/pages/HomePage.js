import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import usePageTitle from '../hooks/usePageTitle'; // Import the custom hook
import './HomePage.css';

function HomePage() {
    usePageTitle('Pet Scheduler - Home', '/favicon.ico'); // Set the page title and favicon
    const [isAnimated, setIsAnimated] = useState(false);

    useEffect(() => {
        // Set a timeout to trigger the animation shortly after the component mounts
        const timer = setTimeout(() => {
            setIsAnimated(true);
        }, 100); // 100ms delay

        return () => clearTimeout(timer); // Cleanup the timer
    }, []);

    return (
        <div className={`container home-page-layout ${isAnimated ? 'loaded' : ''}`}>
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