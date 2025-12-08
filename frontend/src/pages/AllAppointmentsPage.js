import React from "react";
import AllAppointments from "../components/AllAppointments";
import usePageTitle from '../hooks/usePageTitle';

function AllAppointmentsPage() {
    usePageTitle('Admin - All Appointments', '/favicon.ico');
    return (
        <AllAppointments />
    );
}

export default AllAppointmentsPage;