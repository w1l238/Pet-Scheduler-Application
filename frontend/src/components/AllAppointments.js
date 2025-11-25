import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../api';
import { FiClock, FiCheckCircle, FiCheckSquare, FiXCircle } from 'react-icons/fi';

const statusIcons = {
    Pending: <FiClock />,
    Scheduled: <FiCheckCircle />,
    Completed: <FiCheckSquare />,
    Canceled: <FiXCircle />,
};

function AllAppointments() {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [version, setVersion] = useState(0); // To trigger re-fetch
    const [searchTerm, setSearchTerm] = useState('');
    const [sortCriteria, setSortCriteria] = useState('default');
    const [statusFilter, setStatusFilter] = useState('All');
    const location = useLocation();
    const highlightedId = location.state?.highlightedId;

    useEffect(() => {
        const fetchAppointments = async () => {
            setLoading(true);
            try {
                const res = await api.get('/appointments');
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

    const handleUpdateStatus = async (id, newStatus) => {
        try {
            const res = await api.get(`/appointments/${id}`);
            const appointmentToUpdate = res.data;

            // Create updated appointment object with the new status
            const updatedAppointment = { ...appointmentToUpdate, status: newStatus };

            await api.put(`/appointments/${id}`, updatedAppointment);
            setVersion(v => v + 1); // Trigger re-fetch to show change
        } catch (err) {
            console.error('Failed to udpate appointment status', err);
            setError('Failed to updated status. Please try again.');
        }
    };

    const filteredAndSortedAppointments = appointments
        .filter(appt => {
            if (statusFilter === 'All') return true;
            return appt.status === statusFilter;
        })
        .filter(appt => {
            const searchTermLower = searchTerm.toLowerCase();
            if (!searchTermLower) return true;
            const clientName = `${appt.firstname} ${appt.lastname}`.toLowerCase();
            return (
                clientName.includes(searchTermLower) ||
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
                    // Default sort: pending first, then by date descending
                    if (a.status === 'Pending' && b.status !== 'Pending') return -1;
                    if (a.status !== 'Pending' && b.status === 'Pending') return 1;
                    return new Date(b.appointmenttime) - new Date(a.appointmenttime);
            }
        });

    if (loading) {
        return <p>Loading all appointments...</p>;
    }
 
     if (error) {
        return <p className="message">{error}</p>;
    }

    return (
        <div>
            <header class="dashboard-header">
                <h1>All Appointments</h1>
            </header>
            
            <div className="controls">
                <input
                    type="text"
                    placeholder="Search by Client Name, Pet Name, or Status"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="search-input"
                />
                <select value={sortCriteria} onChange={e => setSortCriteria(e.target.value)} className="sort-select">
                    <option value="default">Sort by (Default)</option>
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
                <p>There are no appointments matching your criteria.</p>
            ) : (
                <ul className="dashboard-list">
                    {filteredAndSortedAppointments.map(appt => (
                        <li key={appt.appointmentid} className={`dashboard-list-item status-bg-${appt.status.toLowerCase()} ${appt.appointmentid === highlightedId ? 'highlighted' : ''}`}>
                            <div className="item-details">
                                <strong>Date:</strong> {new Date(appt.appointmenttime).toLocaleString()} <br />
                                <strong>Client:</strong> {appt.firstname} {appt.lastname} | <strong>Pet:</strong> {appt.petname} <br />
                                <span className="status-line">
                                    <strong className="status-text">
                                        {statusIcons[appt.status]}
                                        Status:
                                    </strong> {appt.status}
                                </span>
                            </div>
                            <div className="item-actions">
                                {appt.status === 'Pending' && (
                                    <button onClick={() => handleUpdateStatus(appt.appointmentid, 'Scheduled')} className="approve-button">
                                        Approve
                                    </button>
                                )}
                                {appt.status === 'Scheduled' && (
                                    <button onClick={() => handleUpdateStatus(appt.appointmentid, 'Completed')} className="complete-button">
                                        Mark as Completed
                                    </button>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default AllAppointments;