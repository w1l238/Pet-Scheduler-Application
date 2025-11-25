import React, { useState, useEffect } from 'react';
import api from '../api';

const decodeToken = (token) => {
    try {
        return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
        return null;
    }
};

function AppointmentList({ key }) {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchAppointments = async () => {
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
    }, [key]);

    if (loading) {
        return <p>Loading appointments...</p>;
    }

    if (error) {
        return <p className="message">{error}</p>;
    }

    return (
        <div>
            <h4>My Appointments</h4>
            {appointments.length === 0 ? (
                <p>You have no upcoming appointments.</p>
            ) : (
                <ul className="dashboard-list">
                    {appointments.map(appt => (
                        <li key={appt.appointmentid} className="dashboard-list-item">
                            <strong>Date:</strong> {new Date(appt.appointmenttime).toLocaleDateString()} <br />
                            <strong>Status:</strong> {appt.status} <br />
                            {appt.notes && <p>Notes: {appt.notes}</p>}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default AppointmentList;