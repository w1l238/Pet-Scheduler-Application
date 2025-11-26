import React, { useState } from "react";
import ClientAppointmentManager from '../components/ClientAppointmentManager';
import RequestAppointmentModal from '../components/RequestAppointmentModal';
import './Dashboard.css';

function ClientAppointmentsPage() {
    const [version, setVersion] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleAppointmentChange = () => {
        setVersion(v => v + 1);
    };

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    return (
        <div>
            <div className="section-header-with-button">
                <h1>Manage Appointments</h1>
                <button onClick={openModal} className="add-button">Request Appointment</button>
            </div>
            <div>
                <ClientAppointmentManager version={version} onAppointmentUpdated={handleAppointmentChange} />
            </div>

            {isModalOpen && (
                <RequestAppointmentModal
                    onClose={closeModal}
                    onAppointmentRequested={handleAppointmentChange}
                />
            )}
        </div>
    );
}

export default ClientAppointmentsPage;
