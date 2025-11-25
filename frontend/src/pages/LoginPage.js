import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Auth.css';

function LoginPage() {
    const [formData, setFormData] = useState({
        Email: '',
        Password: '',
    });
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const { Email, Password } = formData;

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:5000/api/auth/login', formData);
            localStorage.setItem('token', res.data.token);
            setMessage('Login successful!');

            const token = res.data.token;
            const decodedToken = JSON.parse(atob(token.split('.')[1]));
            const userRole = decodedToken.user.role;

            if (userRole === 'Admin') {
                navigate('/admin/dashboard');
            } else {
                navigate('/client/dashboard');
            }
        } catch (err) {
            console.error(err.response ? err.response.data : err.message);
            const errorMessage = err.response ? err.response.data.message : 'Server error';
            setMessage(errorMessage);
        }
    };

    return (
        <div className="auth-container">
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