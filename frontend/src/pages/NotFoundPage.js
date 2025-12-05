import React from "react";
import { Link } from "react-router-dom";
import './NotFoundPage.css';

function NotFoundPage() {
    return (
        <div className="not-found-container">
            <div className="not-found-content">
                <h1>404</h1>
                <h2>Page Not Found</h2>
                <p>Sorry, the page you are looking for does not exist or has been moved.</p>
                <Link to="/" className="not-found-link">Back to Login Page</Link>
            </div>
        </div>
    );
}

export default NotFoundPage;