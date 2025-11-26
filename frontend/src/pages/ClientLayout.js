import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import ClientSidebar from '../components/ClientSidebar';
import './ClientLayout.css';

function ClientLayout() {
    const [isCollapsed, setIsCollapsed] = useState(false);

    const toggleSidebar = () => {
        setIsCollapsed(!isCollapsed);
    };

    return (
        <div className={`client-layout ${isCollapsed ? 'collapsed' : ''}`}>
            <ClientSidebar isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} />
            <main className="client-content">
                <Outlet />
            </main>
        </div>
    );
}

export default ClientLayout;
