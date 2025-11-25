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
import AdminDashboard from './pages/AdminDashboard';
import ClientDashboard from './pages/ClientDashboard';
import NotFoundPage from './pages/NotFoundPage';
import AllAppointmentsPage from './pages/AllAppointmentsPage';
import AllInvoicesPage from './pages/AllInvoicesPage';
import AllClientsPage from './pages/AllClientsPage';
import AllPetsPage from './pages/AllPetsPage';
import ManageServicesPage from './pages/ManageServicesPage';
import AdminLayout from './pages/AdminLayout';

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
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/appointments" element={<AllAppointmentsPage />} />
            <Route path="/admin/invoices" element={<AllInvoicesPage />} />
            <Route path="/admin/clients" element={<AllClientsPage />} />
            <Route path="/admin/pets" element={<AllPetsPage />} />
            <Route path="/admin/services" element={<ManageServicesPage />} />
          </Route>
        </Route>

        {/* Protected Client Route */}
        <Route element={<PrivateRoute allowedRoles={['Client', 'Admin']} />}>
          {/* Admin can also access client dashboard */}
          <Route path="/client/dashboard" element={<ClientDashboard />} />
        </Route>
       
       {/* Not Found Route */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default App;