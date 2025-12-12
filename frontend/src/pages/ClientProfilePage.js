import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import usePageTitle from '../hooks/usePageTitle';
import './ClientProfilePage.css';
import EditClientProfileModal from '../components/EditClientProfileModal';
import { FaEnvelope, FaPhone, FaUserEdit } from 'react-icons/fa';

const decodeToken = (token) => {
    try {
        return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
        return null;
    }
};

const ClientProfilePage = () => {
    usePageTitle('Client - Profile', '/favicon.ico');
    const [client, setClient] = useState(null);
    const [pets, setPets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [showPage, setShowPage] = useState(false);
    const [showPets, setShowPets] = useState(false);
    const navigate = useNavigate();

    const fetchClientData = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const decodedToken = decodeToken(token);
            const clientId = decodedToken?.user?.id;

            if (!clientId) {
                setError('Could not identify client from token.');
                setLoading(false);
                return;
            }

            const clientRes = await api.get(`/clients/${clientId}`);
            setClient(clientRes.data);

            const petsRes = await api.get(`/clients/${clientId}/pets`);
            setPets(petsRes.data);
        } catch (err) {
            setError('Failed to fetch client data.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchClientData();
    }, [fetchClientData]);

    useEffect(() => {
        if (!loading) {
            const timer = setTimeout(() => setShowPage(true), 10);
            const petsTimer = setTimeout(() => setShowPets(true), 200); // Delay for pets section
            return () => {
                clearTimeout(timer);
                clearTimeout(petsTimer);
            };
        }
    }, [loading]);

    const handleSave = async (updatedData) => {
        try {
            const token = localStorage.getItem('token');
            const decodedToken = decodeToken(token);
            const clientId = decodedToken?.user?.id;
            await api.put(`/clients/${clientId}`, updatedData);
            setIsEditModalOpen(false);
            fetchClientData(); // Refresh data
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

    if (!client) {
        return <div>Client not found</div>;
    }

    return (
        <div className="profile-page-container">
            <div className={`profile-card ${showPage ? 'show' : ''}`}>
                <div className="profile-card-header">
                    {client.profilephotopath ? (
                        <img src={`${process.env.REACT_APP_API_BASE_URL}${client.profilephotopath}`} alt={`${client.firstname}'s profile`} className="profile-photo" />
                    ) : (
                        <div className="profile-photo-placeholder">
                            {client.firstname ? client.firstname.charAt(0).toUpperCase() : '?'}
                        </div>
                    )}
                    <h1>{client.firstname} {client.lastname}</h1>
                    <button onClick={() => setIsEditModalOpen(true)} className="edit-profile-button">
                        <FaUserEdit /> Edit Profile
                    </button>
                </div>
                <div className="profile-card-body">
                    <div className="profile-info-item">
                        <FaEnvelope className="info-icon" />
                        <span>{client.email}</span>
                    </div>
                    {client.phonenumber && (
                        <div className="profile-info-item">
                            <FaPhone className="info-icon" />
                            <span>{client.phonenumber}</span>
                        </div>
                    )}
                </div>
            </div>

            <div className={`pets-section ${showPets ? 'show' : ''}`}>
                <h2>My Pets</h2>
                <div className="pet-grid">
                    {pets.map(pet => (
                        <div key={pet.petid} className="pet-card" onClick={() => navigate(`/client/pet/${pet.petid}`)}>
                            {pet.profilephotopath ? (
                                <img src={pet.profilephotopath ? `${process.env.REACT_APP_API_BASE_URL}${pet.profilephotopath}` : 'https://via.placeholder.com/150'} alt={`${pet.name.charAt(0).toUpperCase()}`} className="pet-card-photo pet-profile-photo" />
                            ) : (
                                <div className="profile-photo-placeholder pet-card-photo">
                                    {pet.name ? pet.name.charAt(0).toUpperCase() : '?'}
                                </div>
                            )}
                            <div className="pet-card-name">{pet.name}</div>
                        </div>
                    ))}
                </div>
            </div>

            {isEditModalOpen && (
                <EditClientProfileModal
                    client={client}
                    onSave={handleSave}
                    onClose={() => setIsEditModalOpen(false)}
                />
            )}
        </div>
    );
};

export default ClientProfilePage;

