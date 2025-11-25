import React from 'react';
import { NavLink } from 'react-router-dom';
import {MdOutlineReceiptLong, MdOutlinePeople, MdOutlinePets, MdOutlineMiscellaneousServices } from 'react-icons/md';
import { FaRegCalendarAlt, FaRegClock } from 'react-icons/fa';
import { FiMenu } from 'react-icons/fi';
import './AdminSidebar.css';

function AdminSidebar({ isCollapsed, toggleSidebar }) {
    return (
        <nav className={`admin-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
            <div className="admin-sidebar-header">
                <button onClick={toggleSidebar} className="sidebar-toggle-button">
                    <FiMenu />
                </button>
            </div>
            <ul className="admin-sidebar-nav-menu">
                <li className="admin-sidebar-nav-item">
                    <NavLink to="/admin/dashboard" className="admin-sidebar-nav-links" end>
                        <FaRegCalendarAlt />
                        <span>Calendar</span>
                    </NavLink>
                </li>
                <li className="admin-sidebar-nav-item">
                    <NavLink to="/admin/appointments" className="admin-sidebar-nav-links">
                        <FaRegClock />
                        <span>Appointments</span>
                    </NavLink>
                </li>
                <li className="admin-sidebar-nav-item">
                    <NavLink to="/admin/invoices" className="admin-sidebar-nav-links">
                        <MdOutlineReceiptLong />
                        <span>Invoices</span>
                    </NavLink>
                </li>
                <li className="admin-sidebar-nav-item">
                    <NavLink to="/admin/clients" className="admin-sidebar-nav-links">
                        <MdOutlinePeople />
                        <span>Clients</span>
                    </NavLink>
                </li>
                <li className="admin-sidebar-nav-item">
                    <NavLink to="/admin/pets" className="admin-sidebar-nav-links">
                        <MdOutlinePets />
                        <span>Pets</span>
                    </NavLink>
                </li>
                <li className="admin-sidebar-nav-item">
                    <NavLink to="/admin/services" className="admin-sidebar-nav-links">
                        <MdOutlineMiscellaneousServices />
                        <span>Services</span>
                    </NavLink>
                </li>
            </ul>
        </nav>
    );
}

export default AdminSidebar;
