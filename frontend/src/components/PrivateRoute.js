import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const decodeToken = (token) => {
    try {
        // Basic JWT decoding (only for Client-Side display)
        return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
        console.error('Error decoding token:', e);
        return null;
    }
};

const PrivateRoute = ({ allowedRoles }) => {
    const token = localStorage.getItem('token');

    if (!token) {
        // User is not logged in, redirect to login page
        return <Navigate to="/login" replace />;
    }

    const decodedToken = decodeToken(token);
    const userRole = decodedToken?.user?.role;

    // Check if the user's role is allowed to access this route
    if (allowedRoles && !allowedRoles.includes(userRole)) {
        // User is logged in but not authorized, redirect to home page
        return <Navigate to="/" replace />;
    }

    // User is authenticated and authorized, render the requested component
    return <Outlet />;
};

export default PrivateRoute;