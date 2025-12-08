import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import ClientSidebar from '../components/ClientSidebar';
import './ClientLayout.css';

function ClientLayout() {
    console.log('ClientLayout rendered');
    // Initialize isCollapsed state from localStorage, default to false if not found
    const [isCollapsed, setIsCollapsed] = useState(() => {
        const savedState = localStorage.getItem('clientSidebarCollapsed');
        console.log('ClientLayout: Initializing isCollapsed from localStorage:', savedState);
        return savedState === 'true'; // localStorage stores strings, convert to boolean
    });

    // Update localStorage whenever isCollapsed changes
    useEffect(() => {
        console.log('ClientLayout: isCollapsed changed to', isCollapsed);
        localStorage.setItem('clientSidebarCollapsed', isCollapsed);
        return () => {
            console.log('ClientLayout: Unmounting');
        };
    }, [isCollapsed]);

    const toggleSidebar = () => {
        console.log('ClientLayout: Toggling sidebar');
        setIsCollapsed(prev => !prev);
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
