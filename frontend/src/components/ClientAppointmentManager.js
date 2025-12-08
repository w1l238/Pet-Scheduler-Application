import React, { useState, useEffect } from 'react';
import api from '../api';
import { FiClock, FiCheckCircle, FiCheckSquare, FiXCircle } from 'react-icons/fi';
import ConfirmationModal from './ConfirmationModal';

const statusIcons = {
    Pending: <FiClock />,
    Scheduled: <FiCheckCircle />,
    Completed: <FiCheckSquare />,
    Canceled: <FiXCircle />,
};

const decodeToken = (token) => {
    try {
        return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
        return null;
    }
};

function ClientAppointmentManager({ version, onAppointmentUpdated, onLoadComplete }) {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortCriteria, setSortCriteria] = useState('date-desc');
    const [statusFilter, setStatusFilter] = useState('All');

    // State for confirmation modal
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [appointmentToCancel, setAppointmentToCancel] = useState(null);
    const [confirmMessage, setConfirmMessage] = useState('');

    // Effect to notify parent component when loading is finished
    useEffect(() => {
        if (!loading && onLoadComplete) {
            onLoadComplete();
        }
    }, [loading, onLoadComplete]);

    useEffect(() => {
        const fetchAppointments = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    setError('Not authenticated');
                    setLoading(false);
                    return;
                }
                const decodedToken = decodeToken(token);
                const clientId = decodedToken?.user?.id;

                if (!clientId) {
                    setError('Could not identify client from token.');
                    setLoading(false);
                    return;
                }

                const res = await api.get(`/clients/${clientId}/appointments`);
                setAppointments(res.data);
            } catch (err) {
                setError('Failed to fetch appointments.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchAppointments();
    }, [version]);

    const handleCancelAppointment = (appointment) => {
        setAppointmentToCancel(appointment);
        setConfirmMessage(`Are you sure you want to cancel your appointment for ${appointment.petname} on ${new Date(appointment.appointmenttime).toLocaleString()}?`);
        setShowConfirmModal(true);
    };

    const handleConfirmCancel = async () => {
        setShowConfirmModal(false);
        if (appointmentToCancel) {
            try {
                const res = await api.get(`/appointments/${appointmentToCancel.appointmentid}`);
                const appointmentToUpdate = res.data;

                const updatedAppointment = { ...appointmentToUpdate, status: 'Canceled' };

                await api.put(`/appointments/${appointmentToCancel.appointmentid}`, updatedAppointment);
                onAppointmentUpdated();
                setAppointmentToCancel(null);
            } catch (err) {
                console.error('Failed to update appointment status', err);
                setError('Failed to update status. Please try again.');
            }
        }
    };

    const handleCancel = () => {
        setShowConfirmModal(false);
        setAppointmentToCancel(null);
    };

    const filteredAndSortedAppointments = appointments
        .filter(appt => {
            if (statusFilter === 'All') return true;
            return appt.status === statusFilter;
        })
        .filter(appt => {
            const searchTermLower = searchTerm.toLowerCase();
            if (!searchTermLower) return true;
            return (
                appt.petname.toLowerCase().includes(searchTermLower) ||
                appt.status.toLowerCase().includes(searchTermLower)
            );
        })
        .sort((a, b) => {
            switch (sortCriteria) {
                case 'date-asc':
                    return new Date(a.appointmenttime) - new Date(b.appointmenttime);
                case 'date-desc':
                    return new Date(b.appointmenttime) - new Date(a.appointmenttime);
                default:
                    return new Date(b.appointmenttime) - new Date(a.appointmenttime);
            }
        });

    if (loading) {
        return <p>Loading appointments...</p>;
    }

    if (error) {
        return <p className="message">{error}</p>;
    }

    return (
        <div>
            <div className="controls">
                <input
                    type="text"
                    placeholder="Search by Pet Name or Status"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="search-input"
                />
                <select value={sortCriteria} onChange={e => setSortCriteria(e.target.value)} className="sort-select">
                    <option value="date-desc">Newest First</option>
                    <option value="date-asc">Oldest First</option>
                </select>
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="filter-select">
                    <option value="All">Filter by Status (All)</option>
                    <option value="Pending">Pending</option>
                    <option value="Scheduled">Scheduled</option>
                    <option value="Completed">Completed</option>
                    <option value="Canceled">Canceled</option>
                </select>
            </div>
            {filteredAndSortedAppointments.length === 0 ? (
                <p>You have no appointments matching your criteria.</p>
            ) : (
                <ul className="dashboard-list">
                    {filteredAndSortedAppointments.map(appt => (
                        <li key={appt.appointmentid} className={`dashboard-list-item status-bg-${appt.status.toLowerCase()}`}>
                            <div className="item-details">
                                <strong>Date:</strong> {new Date(appt.appointmenttime).toLocaleString()} <br />
                                <strong>Pet:</strong> {appt.petname} <br />
                                <span className="status-line">
                                    <strong className="status-text">
                                        {statusIcons[appt.status]}
                                        Status:
                                    </strong> {appt.status}
                                </span>
                            </div>
                            <div className="item-actions">
                                {(appt.status === 'Pending' || appt.status === 'Scheduled') && (
                                    <button onClick={() => handleCancelAppointment(appt)} className="delete-button">
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            <ConfirmationModal
                show={showConfirmModal}
                message={confirmMessage}
                onConfirm={handleConfirmCancel}
                onCancel={handleCancel}
            />
        </div>
    );
}

export default ClientAppointmentManager;