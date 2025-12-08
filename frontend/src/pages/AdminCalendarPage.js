import React, { useState, useEffect, useCallback } from "react";
import api from '../api';
import AppointmentCalendar from "../components/AppointmentCalendar";
import AppointmentListPane from "../components/AppointmentListPane";
import usePageTitle from '../hooks/usePageTitle'; // Import the custom hook
import './Dashboard.css';
import './AdminCalendarPage.css'; // Import animation styles

function AdminCalendarPage() {
    usePageTitle('Admin - Calendar', '/favicon.ico'); // Set the page title and favicon
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [allAppointments, setAllAppointments] = useState([]);
    const [appointmentsForDate, setAppointmentsForDate] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAnimated, setIsAnimated] = useState(false); // State for animation

    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                const response = await api.get('/appointments');
                const appointments = response.data;
                setAllAppointments(appointments);

                // Set initial appointments for today
                const todayAppointments = appointments.filter(appt => 
                    new Date(appt.appointmenttime).toDateString() === new Date().toDateString()
                );
                setAppointmentsForDate(todayAppointments);

            } catch (err) {
                console.error("Failed to fetch appointments", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAppointments();
    }, []);

    // Effect for triggering animation after loading is complete
    useEffect(() => {
        if (!loading) {
            const timer = setTimeout(() => setIsAnimated(true), 50); // Short delay for rendering
            return () => clearTimeout(timer);
        }
    }, [loading]);

    const handleDateSelect = useCallback((date) => {
        setSelectedDate(date);
        const appointmentsForSelectedDate = allAppointments.filter(appt => 
            new Date(appt.appointmenttime).toDateString() === date.toDateString()
        );
        setAppointmentsForDate(appointmentsForSelectedDate);
    }, [allAppointments]);

    if (loading) {
        return (
            <div className="calendar-page-container">
                <header className="dashboard-header">
                    <h1>Calendar</h1>
                </header>
                <div>Loading...</div>
            </div>
        );
    }

    return (
        <div className={`calendar-page-container ${isAnimated ? 'loaded' : ''}`}>
            <header className="dashboard-header">
                <h1>Calendar</h1>
            </header>
            <div className="calendar-page-layout">
                <div className="calendar-main-content">
                    <AppointmentCalendar 
                        userRole="Admin" 
                        onDateSelect={handleDateSelect}
                        selectedDate={selectedDate}
                        appointments={allAppointments}
                    />
                </div>
                <div className="calendar-sidebar">
                    <AppointmentListPane 
                        date={selectedDate}
                        appointments={appointmentsForDate}
                    />
                </div>
            </div>
        </div>
    );
}

export default AdminCalendarPage;