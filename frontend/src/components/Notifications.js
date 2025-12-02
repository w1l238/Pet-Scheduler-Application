import React, { useState, useEffect, useCallback } from 'react';
import { FaBell } from 'react-icons/fa';
import api from '../api';
import './Notifications.css';

function Notifications() {
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [error, setError] = useState('');

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
        // Poll for new notifications every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    const handleUpdateStatus = async (id, newStatus) => {
        try {
            // First, get the existing appointment details
            const res = await api.get(`/appointments/${id}`);
            const appointment = res.data;

            // Update only the status
            const updatedAppointment = { ...appointment, status: newStatus };

            // Send the update
            await api.put(`/appointments/${id}`, updatedAppointment);
            
            // Refresh the list
            fetchNotifications();
        } catch (err) {
            setError(`Failed to ${newStatus === 'Scheduled' ? 'approve' : 'deny'} appointment.`);
            console.error(err);
        }
    };

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div className="notifications">
            <button onClick={toggleDropdown} className="nav-links-button">
                <FaBell />
                {notifications.length > 0 && (
                    <span className="notification-count">{notifications.length}</span>
                )}
            </button>
            {isOpen && (
                <div className="notifications-dropdown">
                    <div className="notifications-header">
                        Pending Appointments
                    </div>
                    {error && <p className="message">{error}</p>}
                    {notifications.length > 0 ? (
                        notifications.map(apt => (
                            <div key={apt.appointmentid} className="notification-item">
                                <p>
                                    <strong>{apt.firstname} {apt.lastname}</strong> requested an appointment for <strong>{apt.petname}</strong>.
                                </p>
                                <p>
                                    DateTime: {new Date(apt.appointmenttime).toLocaleString()}
                                </p>
                                <div className="notification-actions">
                                    <button 
                                        onClick={() => handleUpdateStatus(apt.appointmentid, 'Scheduled')}
                                        className="approve-button">
                                        Approve
                                    </button>
                                    <button 
                                        onClick={() => handleUpdateStatus(apt.appointmentid, 'Canceled')}
                                        className="deny-button">
                                        Deny
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
