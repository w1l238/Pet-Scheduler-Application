import React, { useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import api from '../api';
import './Auth.css';

function RegisterPage() {
    const [formData, setFormData] = useState({
        FirstName: '',
        LastName: '',
        Email: '',
        PhoneNumber: '',
        Password: '',
    });
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const { FirstName, LastName, Email, PhoneNumber, Password } = formData;

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
        <div className="auth-container">
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