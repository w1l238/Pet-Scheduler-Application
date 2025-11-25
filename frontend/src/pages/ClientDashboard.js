import React, { useState } from "react";
import PetList from '../components/PetList';
import AddPetForm from '../components/AddPetForm';
import AppointmentList from "../components/AppointmentList";
import RequestAppointmentForm from "../components/RequestAppointmentForm";
import AppointmentCalendar from "../components/AppointmentCalendar";
import './Dashboard.css';

function ClientDashboard() {
    const [petListVersion, setPetListVersion] = useState(0);
    const [appointmentListVersion, setAppointmentListVersion] = useState(0);

    const handlePetAdded = () => {
        setPetListVersion(currentVersion => currentVersion + 1);
    };

    const handleAppointmentRequested = () => {
        setAppointmentListVersion(currentVersion => currentVersion + 1);
    };

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <h1>Client Dashboard</h1>
                <p>Welcome! Here you can manage your pets and appointments.</p>
            </header>
            <div className="dashboard-layout">
                <div className="dashboard-calendar-pane">
                    <AppointmentCalendar userRole="Client" />
                </div>
                <div className="dashboard-cards-pane">
                    <div className="dashboard-grid">
                        <div className="dashboard-card">
                            <h2>Manage Your Pets</h2>
                            <AddPetForm onPetAdded={handlePetAdded} />
                            <PetList key={petListVersion} />
                        </div>
                        <div className="dashboard-card">
                            <h2>Manage Your Appointments</h2>
                            <RequestAppointmentForm onAppointmentRequested={handleAppointmentRequested} />
                            <AppointmentList key={appointmentListVersion} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ClientDashboard;