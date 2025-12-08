import React from "react";
import ServiceManager from "../components/ServiceManager";
import usePageTitle from '../hooks/usePageTitle';

function ManageServicesPage() {
    usePageTitle('Admin - Services', '/favicon.ico');
    return (
        <ServiceManager />
    );
}

export default ManageServicesPage;