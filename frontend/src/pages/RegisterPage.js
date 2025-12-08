import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom";
import api from '../api';
import usePageTitle from '../hooks/usePageTitle'; // Import the custom hook
import './Auth.css';

function RegisterPage() {
    usePageTitle('Pet Scheduler - Register', '/favicon.ico'); // Set the page title and favicon
    const [formData, setFormData] = useState({
        FirstName: '',
        LastName: '',
        Email: '',
        PhoneNumber: '',
        Password: '',
    });
    const [message, setMessage] = useState('');
    const [isAnimated, setIsAnimated] = useState(false); // State for animation
    const navigate = useNavigate();

    const { FirstName, LastName, Email, PhoneNumber, Password } = formData;

    useEffect(() => {
        // Set a timeout to trigger the animation shortly after the component mounts
        const timer = setTimeout(() => {
            setIsAnimated(true);
        }, 100); // 100ms delay

        return () => clearTimeout(timer); // Cleanup the timer
    }, []);

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        try {
            const res = await api.post('/auth/register', formData);
            setMessage(res.data.message + ' Redirecting to login...');
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err) {
            console.error(err.response ? err.response.data : err.message);
            const errorMessage = err.response ? err.response.data.message : 'Server error';
            setMessage(errorMessage);
        }
    };

    return (
        <div className={`auth-container auth-page-layout ${isAnimated ? 'loaded' : ''}`}>
            <div className="auth-form-wrapper">
                <h1>Register</h1>
                <form onSubmit={onSubmit}>
                    <div className="form-group">
                        <label htmlFor="FirstName">First Name</label>
                        <input
                            type="text"
                            id="FirstName"
                            name="FirstName"
                            value={FirstName}
                            onChange={onChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="LastName">Last Name</label>
                        <input
                            type="text"
                            id="LastName"
                            name="LastName"
                            value={LastName}
                            onChange={onChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="Email">Email Address</label>
                        <input
                            type="email"
                            id="Email"
                            name="Email"
                            value={Email}
                            onChange={onChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="PhoneNumber">Phone Number (Optional)</label>
                        <input
                            type="text"
                            id="PhoneNumber"
                            name="PhoneNumber"
                            value={PhoneNumber}
                            onChange={onChange}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="Password">Password</label>
                        <input
                            type="password"
                            id="Password"
                            name="Password"
                            value={Password}
                            onChange={onChange}
                            required
                            minLength="6"
                        />
                    </div>
                    <button type="submit" className="auth-button">Register</button>
                </form>
                {message && <p className={`message ${message.includes('successfully') ? 'success' : ''}`}>{message}</p>}
                <p>
                    Already have an account? <Link to="/login">Login</Link>
                </p>
            </div>
        </div>
    );
}

export default RegisterPage;