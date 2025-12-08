import React, { useState } from "react";
import ClientAppointmentManager from '../components/ClientAppointmentManager';
import RequestAppointmentModal from '../components/RequestAppointmentModal';
import usePageTitle from '../hooks/usePageTitle';
import './Dashboard.css';
import './ClientAppointmentsPage.css'; // Import animation styles

function ClientAppointmentsPage() {
    usePageTitle('Client - Appointments', '/favicon.ico');
    const [version, setVersion] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAnimated, setIsAnimated] = useState(false); // State for animation

    const handleAppointmentChange = () => {
        setVersion(v => v + 1);
    };

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    // Callback to be triggered by child component when it's done loading
    const handleLoadComplete = () => {
        setTimeout(() => setIsAnimated(true), 50);
    };

    return (
        <div className={`client-appointments-page-layout ${isAnimated ? 'loaded' : ''}`}>
            <div className="section-header-with-button">
                <h1>Manage Appointments</h1>
                <button onClick={openModal} className="add-button">Request Appointment</button>
            </div>
            <div>
                <ClientAppointmentManager 
                    version={version} 
                    onAppointmentUpdated={handleAppointmentChange}
                    onLoadComplete={handleLoadComplete}
                />
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
