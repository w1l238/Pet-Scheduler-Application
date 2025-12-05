import React from 'react';
import Calendar from 'react-calendar';
import './AppointmentCalendar.css';
import 'react-calendar/dist/Calendar.css';

const AppointmentCalendar = ({ onDateSelect, selectedDate, appointments }) => {

    const handleDayClick = (date) => {
        if (onDateSelect) {
            onDateSelect(date);
        }
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
                        {appointmentsForTile.length > 2 && <div className="more-appointments-indicator">...</div>}
                    </div>
                );
            }
        }
        return null;
    };

    const tileClassName = ({ date, view }) => {
        if (view === 'month' && selectedDate && date.toDateString() === selectedDate.toDateString()) {
            return 'selected-day';
        }
        return null;
    };

    return (
        <div className="calendar-container">
            <Calendar
                onClickDay={handleDayClick}
                tileContent={tileContent}
                tileClassName={tileClassName}
                className="full-page-calendar"
            />
        </div>
    );
};

export default AppointmentCalendar;
