import React, { useState, useEffect, useCallback } from 'react';
import api from '../api';
import './AdminProfilePage.css';
import EditAdminProfileModal from '../components/EditAdminProfileModal';
import { FaEnvelope, FaPhone, FaUserEdit } from 'react-icons/fa';
import usePageTitle from '../hooks/usePageTitle';

const decodeToken = (token) => {
    try {
        return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
        return null;
    }
};

const AdminProfilePage = () => {
    usePageTitle('Admin - Profile', '/favicon.ico');
    const [admin, setAdmin] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [showPage, setShowPage] = useState(false);

    const fetchAdminData = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const decodedToken = decodeToken(token);
            const adminId = decodedToken?.user?.id;

            if (!adminId) {
                setError('Could not identify admin from token.');
                setLoading(false);
                return;
            }

            const adminRes = await api.get(`/clients/${adminId}`);
            setAdmin(adminRes.data);
        } catch (err) {
            setError('Failed to fetch admin data.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAdminData();
    }, [fetchAdminData]);

    useEffect(() => {
        if (!loading) {
            const timer = setTimeout(() => setShowPage(true), 10);
            return () => clearTimeout(timer);
        }
    }, [loading]);

    const handleSave = async (updatedData) => {
        try {
            const token = localStorage.getItem('token');
            const decodedToken = decodeToken(token);
            const adminId = decodedToken?.user?.id;
            await api.put(`/clients/${adminId}`, updatedData);
            setIsEditModalOpen(false);
            fetchAdminData(); // Refresh data
        } catch (err) {
            console.error(err);
            alert('Failed to update profile.');
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    if (!admin) {
        return <div>Admin not found</div>;
    }

        return (
            <div className="profile-page-container">
                <div className={`profile-card ${showPage ? 'show' : ''}`}>
                    <div className="profile-card-header">
                        <img src={admin.profilephotourl || 'https://via.placeholder.com/150'} alt={`${admin.firstname}'s profile`} className="profile-photo" />
                        <h1>{admin.firstname} {admin.lastname}</h1>
                        <button onClick={() => setIsEditModalOpen(true)} className="edit-profile-button">
                            <FaUserEdit /> Edit Profile
                        </button>
                    </div>
                    <div className="profile-card-body">
                        <div className="profile-info-item">
                            <FaEnvelope className="info-icon" />
                            <span>{admin.email}</span>
                        </div>
                        {admin.phonenumber && (
                            <div className="profile-info-item">
                                <FaPhone className="info-icon" />
                                <span>{admin.phonenumber}</span>
                            </div>
                        )}
                    </div>
                </div>
    
                {isEditModalOpen && (
                    <EditAdminProfileModal
                        admin={admin}
                        onSave={handleSave}
                        onClose={() => setIsEditModalOpen(false)}
                    />
                )}
            </div>
        );
    };
export default AdminProfilePage;
