import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import usePageTitle from '../hooks/usePageTitle';
import Toast from '../components/Toast'; // Import Toast component
import './Auth.css';

function LoginPage() {
    usePageTitle('Pet Scheduler - Login');
    const [formData, setFormData] = useState({
        Email: '',
        Password: '',
    });
    const [toast, setToast] = useState({ message: '', type: '' }); // State for toast
    const [isAnimated, setIsAnimated] = useState(false);
    const navigate = useNavigate();

    const { Email, Password } = formData;

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
            const res = await api.post('/auth/login', formData);
            localStorage.setItem('token', res.data.token);
            
            // We don't show a toast on success, we navigate away
            // setToast({ message: 'Login successful!', type: 'success' });

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
            const errorMessage = err.response?.data?.message || 'Server error. Please try again later.';
            setToast({ message: errorMessage, type: 'error' });
        }
    };

    return (
        <div className={`auth-container auth-page-layout ${isAnimated ? 'loaded' : ''}`}>
            <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: '' })} />
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
                <p>
                    Don't have an account? <Link to="/register">Register</Link>
                </p>
            </div>
        </div>
    );
}

export default LoginPage;