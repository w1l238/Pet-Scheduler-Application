import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom";
import api from '../api';
import usePageTitle from '../hooks/usePageTitle';
import Toast from '../components/Toast'; // Import Toast component
import './Auth.css';

function RegisterPage() {
    usePageTitle('Pet Scheduler - Register');
    const [formData, setFormData] = useState({
        FirstName: '',
        LastName: '',
        Email: '',
        PhoneNumber: '',
        Password: '',
    });
    const [toast, setToast] = useState({ message: '', type: '' }); // State for toast
    const [isAnimated, setIsAnimated] = useState(false);
    const navigate = useNavigate();

    const { FirstName, LastName, Email, PhoneNumber, Password } = formData;

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsAnimated(true);
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        try {
            const res = await api.post('/auth/register', formData);
            setToast({ message: res.data.message + '. Redirecting to login...', type: 'success' });
            setTimeout(() => {
                navigate('/login');
            }, 2500); // Increased delay to allow reading the toast
        } catch (err) {
            console.error(err.response ? err.response.data : err.message);
            const errorMessage = err.response?.data?.message || 'Server error. Please try again later.';
            setToast({ message: errorMessage, type: 'error' });
        }
    };

    return (
        <div className={`auth-container auth-page-layout ${isAnimated ? 'loaded' : ''}`}>
            <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: '' })} />
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
                <p>
                    Already have an account? <Link to="/login">Login</Link>
                </p>
            </div>
        </div>
    );
}

export default RegisterPage;