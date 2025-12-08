import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';
import './AdminLayout.css';

function AdminLayout() {
    // Initialize isCollapsed state from localStorage, default to false if not found
    const [isCollapsed, setIsCollapsed] = useState(() => {
        const savedState = localStorage.getItem('adminSidebarCollapsed');
        return savedState === 'true'; // localStorage stores strings, convert to boolean
    });

    // Update localStorage whenever isCollapsed changes
    useEffect(() => {
        localStorage.setItem('adminSidebarCollapsed', isCollapsed);
    }, [isCollapsed]);

    const toggleSidebar = () => {
        setIsCollapsed(prev => !prev);
    };

    return (
        <div className={`admin-layout ${isCollapsed ? 'collapsed' : ''}`}>
            <AdminSidebar isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} />
            <main className="admin-content">
                <Outlet />
            </main>
        </div>
    );
}

export default AdminLayout;
