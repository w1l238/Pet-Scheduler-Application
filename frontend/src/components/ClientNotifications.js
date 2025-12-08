import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBell } from 'react-icons/fa';
import api from '../api';
import './ClientNotifications.css';

function ClientNotifications() {
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isClosing, setIsClosing] = useState(false); // To handle fade-out animation
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const dropdownRef = useRef(null); // Ref for the dropdown container

    const fetchNotifications = useCallback(async () => {
        try {
            const res = await api.get('/client/notifications');
            setNotifications(res.data);
        } catch (err) {
            setError('Failed to fetch notifications.');
            console.error(err);
        }
    }, []);

    useEffect(() => {
        fetchNotifications();
        // Poll for new notifications every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    const handleClose = useCallback(() => {
        if (isOpen) {
            setIsClosing(true);
        }
    }, [isOpen]);

    // Effect to handle clicks outside the dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isOpen && dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                handleClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, handleClose]);

    const handleMarkAllAsRead = async () => {
        try {
            await api.put('/notifications/read-all');
            setNotifications([]); // Clear notifications from view
            handleClose(); // Close dropdown with animation
        } catch (err) {
            setError('Failed to mark notifications as read.');
            console.error(err);
        }
    };

    const handleNotificationClick = (notification) => {
        // Mark all as read when one is clicked and navigate
        handleMarkAllAsRead();
        if (notification.link) {
            navigate(notification.link);
        }
    };

    const toggleDropdown = () => {
        if (isOpen) {
            handleClose();
        } else {
            setIsOpen(true);
            setIsClosing(false);
        }
    };

    const onAnimationEnd = () => {
        if (isClosing) {
            setIsOpen(false);
            setIsClosing(false);
        }
    };

    return (
        <div className="client-notifications" ref={dropdownRef}>
            <button onClick={toggleDropdown} className="nav-links-button">
                <FaBell />
                {notifications.length > 0 && (
                    <span className="notification-count">{notifications.length}</span>
                )}
            </button>
            {isOpen && (
                <div 
                    className={`client-notifications-dropdown ${isClosing ? 'fade-out' : 'fade-in'}`}
                    onAnimationEnd={onAnimationEnd}
                >
                    <div className="client-notifications-header">
                        <span>Notifications</span>
                        {notifications.length > 0 && (
                            <button onClick={handleMarkAllAsRead} className="mark-all-read-button">
                                Mark all as read
                            </button>
                        )}
                    </div>
                    {error && <p className="message">{error}</p>}
                    {notifications.length > 0 ? (
                        notifications.map(notif => {
                            const parts = /Your appointment for (.*) at (.*) has been updated to "(.*)"\./.exec(notif.message);
                            
                            if (parts) {
                                const [, petName, dateTime, status] = parts;
                                const date = new Date(dateTime);
                                return (
                                    <div 
                                        key={notif.notificationid} 
                                        className="client-notification-item"
                                        onClick={() => handleNotificationClick(notif)}
                                    >
                                        <div className="notification-title">Appointment Update</div>
                                        <div className="notification-details">
                                            <p><strong>Pet:</strong> {petName}</p>
                                            <p><strong>Date:</strong> {date.toLocaleDateString()}</p>
                                            <p><strong>Time:</strong> {date.toLocaleTimeString()}</p>
                                            <p><strong>New Status:</strong> <span className={`status-badge status-${status.toLowerCase()}`}>{status}</span></p>
                                        </div>
                                        <p className="notification-timestamp">
                                            {new Date(notif.createdat).toLocaleString()}
                                        </p>
                                    </div>
                                );
                            }

                            // Fallback for other notifications
                            return (
                                <div 
                                    key={notif.notificationid} 
                                    className="client-notification-item"
                                    onClick={() => handleNotificationClick(notif)}
                                >
                                    <p>{notif.message}</p>
                                    <p className="notification-timestamp">
                                        {new Date(notif.createdat).toLocaleString()}
                                    </p>
                                </div>
                            );
                        })
                    ) : (
                        <div className="no-client-notifications">
                            No new notifications.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default ClientNotifications;
