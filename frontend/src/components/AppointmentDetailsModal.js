import React, { useState, useEffect } from 'react';
import { FiClock, FiCheckCircle, FiCheckSquare, FiXCircle } from 'react-icons/fi';
import './AppointmentDetailsModal.css';

const statusIcons = {
    Pending: <FiClock />,
    Scheduled: <FiCheckCircle />,
    Completed: <FiCheckSquare />,
    Canceled: <FiXCircle />,
};

function AppointmentDetailsModal({ isOpen, onClose, date, appointments }) {
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(() => {
                setShowModal(true);
            }, 10);
            return () => clearTimeout(timer);
        } else {
            setShowModal(false);
        }
    }, [isOpen]);

    if (!isOpen) {
        return null;
    }

    // Sort appointments by time for display in the modal
    const sortedAppointments = [...appointments].sort((a, b) => new Date(a.appointmenttime) - new Date(b.appointmenttime));

    return (
        <div className={`modal-overlay ${showModal ? 'show' : ''}`} onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Appointments for {date.toLocaleDateString()}</h2>
                    <button onClick={onClose} className="close-button">&times;</button>
                </div>
                <div className="modal-body">
                    {sortedAppointments.length > 0 ? (
                        <ul className="modal-appointment-list">
                            {sortedAppointments.map(appt => (
                                <li key={appt.appointmentid} className={`status-bg-${appt.status.toLowerCase()}`}>
                                    <strong>Time:</strong> {new Date(appt.appointmenttime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}<br />
                                    <span className="status-line">
                                        <strong className="status-text">
                                            {statusIcons[appt.status]}
                                            Status:
                                        </strong> {appt.status}
                                    </span><br />
                                    <strong>Client:</strong> {appt.firstname} {appt.lastname} | <strong>Pet:</strong> {appt.petname}<br />
                                    {appt.notes && <><strong>Notes:</strong> {appt.notes}</>}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>No Appointments for today.</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default AppointmentDetailsModal;
