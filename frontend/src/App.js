import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css'; // Keep existing App.css temporarily

// Import Components
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';

// Import pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminCalendarPage from './pages/AdminCalendarPage';
import ClientCalendarPage from './pages/ClientCalendarPage';
import NotFoundPage from './pages/NotFoundPage';
import AllAppointmentsPage from './pages/AllAppointmentsPage';
import AllInvoicesPage from './pages/AllInvoicesPage';
import AllClientsPage from './pages/AllClientsPage';
import AllPetsPage from './pages/AllPetsPage';
import ManageServicesPage from './pages/ManageServicesPage';
import AdminLayout from './pages/AdminLayout';

import ClientLayout from './pages/ClientLayout';
import ClientPetsPage from './pages/ClientPetsPage';
import ClientAppointmentsPage from './pages/ClientAppointmentsPage';
import PetProfilePage from './pages/PetProfilePage';
import ClientProfilePage from './pages/ClientProfilePage';
import AdminProfilePage from './pages/AdminProfilePage';
import AdminSettingsPage from './pages/AdminSettingsPage';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* Protected Admin Route */}
        <Route element={<PrivateRoute allowedRoles={['Admin']} />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin/calendar" element={<AdminCalendarPage />} />
            <Route path="/admin/appointments" element={<AllAppointmentsPage />} />
            <Route path="/admin/invoices" element={<AllInvoicesPage />} />
            <Route path="/admin/clients" element={<AllClientsPage />} />
            <Route path="/admin/pets" element={<AllPetsPage />} />
            <Route path="/admin/services" element={<ManageServicesPage />} />
            <Route path="/admin/profile" element={<AdminProfilePage />} />
            <Route path="/admin/settings" element={<AdminSettingsPage />} />
          </Route>
        </Route>

        {/* Protected Client Route */}
        <Route element={<PrivateRoute allowedRoles={['Client', 'Admin']} />}>
          <Route element={<ClientLayout />}>
            <Route path="/client/calendar" element={<ClientCalendarPage />} />
            <Route path="/client/pets" element={<ClientPetsPage />} />
            <Route path="/client/appointments" element={<ClientAppointmentsPage />} />
            <Route path="/pet/:petId" element={<PetProfilePage />} />
            <Route path="/client/profile" element={<ClientProfilePage />} />
          </Route>
        </Route>
       
       {/* Not Found Route */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default App;