import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import api from '../api';
import AppointmentDetailsModal from './AppointmentDetailsModal';
import './AppointmentCalendar.css';
import 'react-calendar/dist/Calendar.css';

const decodeToken = (token) => {
    try {
        return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
        console.error('Error decoding token:', e);
        return null;
    }
};

const AppointmentCalendar = ({ userRole }) => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isModalOpen, setIsModalOpen] = useState(false);

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
                const userId = decodedToken?.user?.id;

                let response;
                if (userRole === 'Admin') {
                    response = await api.get('/appointments');
                } else if (userId) {
                    response = await api.get(`/clients/${userId}/appointments`);
                } else {
                    setError('Could not identify user.');
                    setLoading(false);
                    return;
                }
                
                setAppointments(response.data);
            } catch (err) {
                setError('Failed to fetch appointments.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchAppointments();
    }, [userRole]);

    const handleDayClick = (date) => {
        setSelectedDate(date);
        setIsModalOpen(true);
    };

    const getAppointmentsForDate = (date) => {
        return appointments.filter(appt => {
            const apptDate = new Date(appt.appointmenttime);
            return (
                apptDate.getFullYear() === date.getFullYear() &&
                apptDate.getMonth() === date.getMonth() &&
                apptDate.getDate() === date.getDate()
            );
        });
    };

    const tileContent = ({ date, view }) => {
        if (view === 'month') {
            const appointmentsForTile = getAppointmentsForDate(date)
                .filter(appt => appt.status === 'Pending' || appt.status === 'Scheduled')
                .sort((a, b) => new Date(a.appointmenttime) - new Date(b.appointmenttime));

            if (appointmentsForTile.length > 0) {
                return (
                    <div className="appointment-list-container">
                        {appointmentsForTile.slice(0, 2).map(appt => (
                           <div key={appt.appointmentid} className={`appointment-info status-${appt.status.toLowerCase()}`}>
                               {new Date(appt.appointmenttime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                           </div>
                        ))}
                    </div>
                );
            }
        }
        return null;
    };
    
    if (loading) return <p>Loading calendar...</p>;
    if (error) return <p className="message">{error}</p>;

    return (
        <div className="calendar-container">
            <Calendar
                onClickDay={handleDayClick}
                tileContent={tileContent}
                className="full-page-calendar"
            />
            <AppointmentDetailsModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                date={selectedDate}
                appointments={getAppointmentsForDate(selectedDate)}
            />
        </div>
    );
};

export default AppointmentCalendar;
