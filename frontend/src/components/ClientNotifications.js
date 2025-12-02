import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBell } from 'react-icons/fa';
import api from '../api';
import './ClientNotifications.css';

function ClientNotifications() {
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

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

    const handleMarkAllAsRead = async () => {
        try {
            await api.put('/notifications/read-all');
            setNotifications([]); // Clear notifications from view
            setIsOpen(false); // Close dropdown
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
        setIsOpen(!isOpen);
    };

    return (
        <div className="client-notifications">
            <button onClick={toggleDropdown} className="nav-links-button">
                <FaBell />
                {notifications.length > 0 && (
                    <span className="notification-count">{notifications.length}</span>
                )}
            </button>
            {isOpen && (
                <div className="client-notifications-dropdown">
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
                        notifications.map(notif => (
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
                        ))
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
