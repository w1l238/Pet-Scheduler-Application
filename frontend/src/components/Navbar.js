import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiLogOut, FiLogIn, FiUserPlus, FiUser } from 'react-icons/fi'; // Import login/out, and register icons
import { FaDog } from 'react-icons/fa' // Dog Icon
import { MdOutlineSpaceDashboard } from 'react-icons/md'; // Dashboard Icon
import './Navbar.css';

const decodeToken = (token) => {
    try {
        return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
        return null;
    }
};

function Navbar() {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const decodedToken = decodeToken(token);
    const userRole = decodedToken?.user?.role;

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/" className="navbar-logo">
                    <FaDog /> <span>PetScheduler</span>
                </Link>
                <ul className="nav-menu">
                    {token ? (
                        <>
                            <li className="nav-item">
                                {userRole === 'Admin' ? (
                                    <Link to="/admin/dashboard" className="nav-links">
                                        <MdOutlineSpaceDashboard /> <span className="sr-only">Dashboard</span>
                                        </Link>
                                ) : (
                                    <Link to="/client/dashboard" className="nav-links">
                                        <MdOutlineSpaceDashboard /> <span className="sr-only">Dashboard</span>
                                        </Link>
                                )}
                            </li>
                            <li className="nav-item">
                                <button onClick={handleLogout} className="nav-links-button">
                                    <FiLogOut /> <span className="sr-only">Logout</span>
                                </button>
                            </li>
                        </>
                    ) : (
                        <>
                            <li className="nav-item">
                                <Link to="/login" className="nav-links">
                                <FiLogIn /> <span className="sr-only">Login</span>
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link to="/register" className="nav-links">
                                <FiUserPlus /> <span className="sr-only">Register</span>
                                </Link>
                            </li>
                        </>
                    )}
                </ul>
            </div>
        </nav>
    );
}

export default Navbar;
