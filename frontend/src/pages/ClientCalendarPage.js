import React from "react";
import AppointmentCalendar from "../components/AppointmentCalendar";
import './Dashboard.css';

function ClientCalendarPage() {
    return (
        <div className="dashboard-full-height">
            <header className="dashboard-header">
                <h1>Calendar</h1>
            </header>
            <AppointmentCalendar userRole="Client" />
        </div>
    );
}

export default ClientCalendarPage;