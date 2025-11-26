import React from 'react';
import { NavLink } from 'react-router-dom';
import { MdOutlinePets } from 'react-icons/md';
import { FaRegCalendarAlt, FaRegClock } from 'react-icons/fa';
import { FiMenu } from 'react-icons/fi';
import './ClientSidebar.css';

function ClientSidebar({ isCollapsed, toggleSidebar }) {
    return (
        <nav className={`client-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
            <div className="client-sidebar-header">
                <button onClick={toggleSidebar} className="sidebar-toggle-button">
                    <FiMenu />
                </button>
            </div>
            <ul className="client-sidebar-nav-menu">
                <li className="client-sidebar-nav-item">
                    <NavLink to="/client/dashboard" className="client-sidebar-nav-links" end>
                        <FaRegCalendarAlt />
                        <span>Calendar</span>
                    </NavLink>
                </li>
                <li className="client-sidebar-nav-item">
                    <NavLink to="/client/pets" className="client-sidebar-nav-links">
                        <MdOutlinePets />
                        <span>Pets</span>
                    </NavLink>
                </li>
                <li className="client-sidebar-nav-item">
                    <NavLink to="/client/appointments" className="client-sidebar-nav-links">
                        <FaRegClock />
                        <span>Appointments</span>
                    </NavLink>
                </li>
            </ul>
        </nav>
    );
}

export default ClientSidebar;
