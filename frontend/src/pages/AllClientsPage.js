import React from "react";
import AllClients from "../components/AllClients";
import usePageTitle from '../hooks/usePageTitle';

function AllClientsPage() {
    usePageTitle('Admin - All Clients', '/favicon.ico');
    return (
        <AllClients />
    );
}

export default AllClientsPage;