import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import usePageTitle from '../hooks/usePageTitle'; // Import the custom hook
import './Auth.css';

function LoginPage() {
    usePageTitle('Pet Scheduler - Login', '/favicon.ico'); // Set the page title and favicon
    const [formData, setFormData] = useState({
        Email: '',
        Password: '',
    });
    const [message, setMessage] = useState('');
    const [isAnimated, setIsAnimated] = useState(false); // State for animation
    const navigate = useNavigate();

    const { Email, Password } = formData;

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
            const res = await api.post('/auth/login', formData);
            localStorage.setItem('token', res.data.token);
            setMessage('Login successful!');

            const token = res.data.token;
            const decodedToken = JSON.parse(atob(token.split('.')[1]));
            const userRole = decodedToken.user.role;

            if (userRole === 'Admin') {
                navigate('/admin/calendar');
            } else {
                navigate('/client/calendar');
            }
        } catch (err) {
            console.error(err.response ? err.response.data : err.message);
            const errorMessage = err.response ? err.response.data.message : 'Server error';
            setMessage(errorMessage);
        }
    };

    return (
        <div className={`auth-container auth-page-layout ${isAnimated ? 'loaded' : ''}`}>
            <div className="auth-form-wrapper">
                <h1>Login</h1>
                <form onSubmit={onSubmit}>
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
                        <label htmlFor="Password">Password</label>
                        <input
                            type="password"
                            id="Password"
                            name="Password"
                            value={Password}
                            onChange={onChange}
                            required
                        />
                    </div>
                    <button type="submit" className="auth-button">Login</button>
                </form>
                {message && <p className={`message ${message === 'Login successful!' ? 'success' : ''}`}>{message}</p>}
                <p>
                    Don't have an account? <Link to="/register">Register</Link>
                </p>
            </div>
        </div>
    );
}

export default LoginPage;