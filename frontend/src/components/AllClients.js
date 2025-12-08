import React, { useState, useEffect } from 'react';
import api from '../api';
import EditClientModal from './EditClientModal'; // Import the modal
import ConfirmationModal from './ConfirmationModal'; // Import the ConfirmationModal
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import './AllClients.css'; // Import animation styles

const decodeToken = (token) => {
    try {
        return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
        return null;
    }
};

function AllClients() {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [version, setVersion] = useState(0); // To trigger re-fetch
    const [searchTerm, setSearchTerm] = useState('');
    const [sortCriteria, setSortCriteria] = useState('name-asc');
    const [currentUserId, setCurrentUserId] = useState(null);
    const [currentAdminClient, setCurrentAdminClient] = useState(null); // State for current admin's client object
    const [isAnimated, setIsAnimated] = useState(false); // State for animation

    // State for the modal
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingClient, setEditingClient] = useState(null);

    // State for confirmation modal
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [clientToDelete, setClientToDelete] = useState(null);
    const [confirmMessage, setConfirmMessage] = useState('');

    const navigate = useNavigate(); // Initialize useNavigate

    useEffect(() => {
        const fetchClients = async () => {
            setLoading(true);
            try {
                const res = await api.get('/clients');
                const fetchedClients = res.data;
                setClients(fetchedClients);

                const token = localStorage.getItem('token');
                if (token) {
                    const decoded = decodeToken(token);
                    const userId = decoded?.user?.id;
                    setCurrentUserId(userId);
                    // Find the current admin's client object
                    const adminClient = fetchedClients.find(c => c.clientid === userId);
                    setCurrentAdminClient(adminClient);
                }

            } catch (err) {
                setError('Failed to fetch clients.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchClients();
    }, [version]);

    // Effect for triggering animation after loading is complete
    useEffect(() => {
        if (!loading) {
            const timer = setTimeout(() => setIsAnimated(true), 50); // Short delay for rendering
            return () => clearTimeout(timer);
        }
    }, [loading]);

    const handleDeleteClient = (client) => {
        setClientToDelete(client);
        setConfirmMessage(`Are you sure you want to delete client ${client.firstname} ${client.lastname} and all associated data? This action cannot be undone.`);
        setShowConfirmModal(true);
    };

    const handleConfirmDelete = async () => {
        setShowConfirmModal(false);
        if (clientToDelete) {
            try {
                await api.delete(`/clients/${clientToDelete.clientid}`);
                setVersion(v => v + 1); // Trigger re-fetch
                setClientToDelete(null);
            } catch (err) {
                console.error('Failed to delete client', err);
                setError('Failed to delete client. Please try again.');
            }
        }
    };

    const handleCancelDelete = () => {
        setShowConfirmModal(false);
        setClientToDelete(null);
    };

    const handleOpenEditModal = (client) => {
        setEditingClient(client);
        setIsEditModalOpen(true);
    };

    const handleCloseEditModal = () => {
        setEditingClient(null);
        setIsEditModalOpen(false);
    };

    const handleSaveClient = (updatedClient) => {
        // Close the modal first to prevent flickering
        handleCloseEditModal();
        // Then, update the state locally for a snappy UI response
        setClients(clients.map(c => c.clientid === updatedClient.clientid ? updatedClient : c));
        // If the updated client is the current admin, update currentAdminClient state
        if (updatedClient.clientid === currentUserId) {
            setCurrentAdminClient(updatedClient);
        }
    };

    const filteredAndSortedClients = clients
        .filter(client => {
            // Filter out the current admin from the main list
            if (client.clientid === currentUserId) return false;

            const searchTermLower = searchTerm.toLowerCase();
            return (
                client.firstname.toLowerCase().includes(searchTermLower) ||
                client.lastname.toLowerCase().includes(searchTermLower) ||
                client.email.toLowerCase().includes(searchTermLower)
            );
        })
        .sort((a, b) => {
            switch (sortCriteria) {
                case 'name-asc':
                    return a.lastname.localeCompare(b.lastname);
                case 'name-desc':
                    return b.lastname.localeCompare(a.lastname);
                case 'date-asc':
                    return new Date(a.createdat) - new Date(b.createdat);
                case 'date-desc':
                    return new Date(b.createdat) - new Date(a.createdat);
                default:
                    return 0;
            }
        });

    if (loading) {
        return <p>Loading clients...</p>;
    }

    if (error) {
        return <p className="message">{error}</p>;
    }

    return (
        <div className={`all-clients-layout ${isAnimated ? 'loaded' : ''}`}>
            <header class="dashboard-header">
                <h1>All Clients</h1>
            </header>

            {currentAdminClient && (
                <div className="dashboard-card pinned-admin-card" onClick={() => navigate('/admin/profile')} style={{ cursor: 'pointer' }}>
                    <h2>Your Account</h2>
                    <div className="pinned-admin-details"> {/* New container for layout */}
                        <img src={currentAdminClient.profilephotourl || 'https://via.placeholder.com/50'} alt={`${currentAdminClient.firstname}'s profile`} className="item-photo" />
                        <div className="pinned-admin-text-details">
                            <strong>{currentAdminClient.firstname} {currentAdminClient.lastname}</strong> <br />
                            <span>{currentAdminClient.email}</span> <br />
                            <span>Role: {currentAdminClient.role}</span>
                        </div>
                    </div>
                </div>
            )}

            <div className="controls">
                <input
                    type="text"
                    placeholder="Search by Name or Email"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="search-input"
                />
                <select value={sortCriteria} onChange={e => setSortCriteria(e.target.value)} className="sort-select">
                    <option value="name-asc">Name A-Z</option>
                    <option value="name-desc">Name Z-A</option>
                    <option value="date-desc">Newest First</option>
                    <option value="date-asc">Oldest First</option>
                </select>
            </div>
            {filteredAndSortedClients.length === 0 ? (
                <p>No clients matching your criteria.</p>
            ) : (
                <ul className="dashboard-list">
                    {filteredAndSortedClients.map(client => (
                        <li key={client.clientid} className="dashboard-list-item">
                            <img src={client.profilephotourl || 'https://via.placeholder.com/50'} alt={`${client.firstname}'s profile`} className="item-photo" />
                            <div className="item-details">
                                <strong>Name:</strong> {client.firstname} {client.lastname} <br />
                                <strong>Email:</strong> {client.email} <br />
                                <strong>Role:</strong> {client.role}
                            </div>
                            <div className="item-actions">
                                {currentUserId !== client.clientid && (
                                    <button onClick={() => handleOpenEditModal(client)} className="edit-button">
                                        Edit
                                    </button>
                                )}
                                {currentUserId !== client.clientid && (
                                    <button 
                                        onClick={() => handleDeleteClient(client)} 
                                        className="delete-button"
                                        title="Delete Client"
                                    >
                                        Delete
                                    </button>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            {isEditModalOpen && (
                <EditClientModal
                    client={editingClient}
                    onClose={handleCloseEditModal}
                    onSave={handleSaveClient}
                />
            )}

            <ConfirmationModal
                show={showConfirmModal}
                message={confirmMessage}
                onConfirm={handleConfirmDelete}
                onCancel={handleCancelDelete}
            />
        </div>
    );
}

export default AllClients;