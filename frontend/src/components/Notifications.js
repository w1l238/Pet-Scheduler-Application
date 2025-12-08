import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FaBell, FaCheck, FaTimes } from 'react-icons/fa';
import api from '../api';
import './Notifications.css';

function Notifications() {
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isClosing, setIsClosing] = useState(false); // To handle fade-out animation
    const [error, setError] = useState('');
    const dropdownRef = useRef(null); // Ref for the dropdown container

    const fetchNotifications = useCallback(async () => {
        try {
            const res = await api.get('/appointments?status=Pending');
            setNotifications(res.data);
        } catch (err) {
            setError('Failed to fetch notifications.');
            console.error(err);
        }
    }, []);

    useEffect(() => {
        fetchNotifications();
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
    }, [isOpen, handleClose]); // Add handleClose to dependency array

    const handleUpdateStatus = async (id, newStatus) => {
        try {
            const res = await api.get(`/appointments/${id}`);
            const appointment = res.data;
            const updatedAppointment = { ...appointment, status: newStatus };
            await api.put(`/appointments/${id}`, updatedAppointment);
            fetchNotifications();
        } catch (err) {
            setError(`Failed to ${newStatus === 'Scheduled' ? 'approve' : 'deny'} appointment.`);
            console.error(err);
        }
    };


    const toggleDropdown = () => {
        if (isOpen) {
            handleClose();
        } else {
            setIsOpen(true);
            setIsClosing(false); // Ensure it's not in closing state when opening
        }
    };

    const onAnimationEnd = () => {
        if (isClosing) {
            setIsOpen(false);
            setIsClosing(false);
        }
    };

    return (
        <div className="notifications" ref={dropdownRef}>
            <button onClick={toggleDropdown} className="nav-links-button">
                <FaBell />
                {notifications.length > 0 && (
                    <span className="notification-count">{notifications.length}</span>
                )}
            </button>
            {isOpen && (
                <div 
                    className={`notifications-dropdown ${isClosing ? 'fade-out' : 'fade-in'}`}
                    onAnimationEnd={onAnimationEnd}
                >
                    <div className="notifications-header">
                        Pending Appointments
                    </div>
                    {error && <p className="message">{error}</p>}
                    {notifications.length > 0 ? (
                        notifications.map(apt => (
                            <div key={apt.appointmentid} className="notification-item">
                                <div className="notification-details">
                                    <p><strong>Client:</strong> {apt.firstname} {apt.lastname}</p>
                                    <p><strong>Pet:</strong> {apt.petname}</p>
                                    <p><strong>When:</strong> {new Date(apt.appointmenttime).toLocaleString()}</p>
                                </div>
                                <div className="notification-actions">
                                    <button 
                                        onClick={() => handleUpdateStatus(apt.appointmentid, 'Scheduled')}
                                        className="approve-button">
                                        <FaCheck /> Approve
                                    </button>
                                    <button 
                                        onClick={() => handleUpdateStatus(apt.appointmentid, 'Canceled')}
                                        className="deny-button">
                                        <FaTimes /> Deny
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="no-notifications">
                            No pending appointments.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default Notifications;
