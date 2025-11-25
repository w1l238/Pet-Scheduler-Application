import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';
import './AdminLayout.css';

function AdminLayout() {
    const [isCollapsed, setIsCollapsed] = useState(false);

    const toggleSidebar = () => {
        setIsCollapsed(!isCollapsed);
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
