import React from 'react';
import { FiClock, FiCheckCircle, FiCheckSquare, FiXCircle } from 'react-icons/fi';
import './AppointmentListPane.css';

const statusIcons = {
    Pending: <FiClock />,
    Scheduled: <FiCheckCircle />,
    Completed: <FiCheckSquare />,
    Canceled: <FiXCircle />,
};

const AppointmentListPane = ({ date, appointments }) => {
    if (!date) {
        return (
            <div className="appointment-list-pane">
                <div className="pane-header">
                    <h2>Select a Date</h2>
                </div>
                <div className="pane-body">
                    <p className="empty-message">Click on a date in the calendar to see the appointments for that day.</p>
                </div>
            </div>
        );
    }

    const sortedAppointments = [...appointments].sort((a, b) => new Date(a.appointmenttime) - new Date(b.appointmenttime));

    return (
        <div className="appointment-list-pane">
            <div className="pane-header">
                <h2>Appointments for {date.toLocaleDateString()}</h2>
            </div>
            <div className="pane-body">
                {sortedAppointments.length > 0 ? (
                    <ul className="appointment-list">
                        {sortedAppointments.map(appt => (
                            <li key={appt.appointmentid} className={`appointment-item status-bg-${appt.status.toLowerCase()}`}>
                                <div className="appointment-time">
                                    {new Date(appt.appointmenttime).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                    <br/>
                                    <strong>{new Date(appt.appointmenttime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong>
                                </div>
                                <div className="appointment-details">
                                    <span className="status-line">
                                        {statusIcons[appt.status]}
                                        <strong>{appt.status}</strong>
                                    </span>
                                    <span className="client-info">{appt.firstname} {appt.lastname} - <strong>{appt.petname}</strong></span>
                                    {appt.notes && <p className="notes">Notes: {appt.notes}</p>}
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="empty-message">No appointments scheduled for this day.</p>
                )}
            </div>
        </div>
    );
};

export default AppointmentListPane;
