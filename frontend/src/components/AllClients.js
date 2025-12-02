import React, { useState, useEffect } from 'react';
import api from '../api';
import EditClientModal from './EditClientModal'; // Import the modal

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

    // State for the modal
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingClient, setEditingClient] = useState(null);

    useEffect(() => {
        const fetchClients = async () => {
            setLoading(true);
            try {
                const res = await api.get('/clients');
                setClients(res.data);
            } catch (err) {
                setError('Failed to fetch clients.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        const token = localStorage.getItem('token');
        if (token) {
            const decoded = decodeToken(token);
            setCurrentUserId(decoded?.user?.id);
        }

        fetchClients();
    }, [version]);

    const handleDeleteClient = async (clientId) => {
        if (window.confirm('Are you sure you want to delete this client and all associated data? This action cannot be undone.')) {
            try {
                await api.delete(`/clients/${clientId}`);
                setVersion(v => v + 1); // Trigger re-fetch
            } catch (err) {
                console.error('Failed to delete client', err);
                setError('Failed to delete client. Please try again.');
            }
        }
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
    };

    const filteredAndSortedClients = clients
        .filter(client => {
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
        <div>
            <header class="dashboard-header">
                <h1>All Clients</h1>
            </header>
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
                            <div className="item-details">
                                <strong>Name:</strong> {client.firstname} {client.lastname} <br />
                                <strong>Email:</strong> {client.email} <br />
                                <strong>Role:</strong> {client.role}
                            </div>
                            <div className="item-actions">
                                <button onClick={() => handleOpenEditModal(client)} className="edit-button">
                                    Edit
                                </button>
                                {currentUserId !== client.clientid && (
                                    <button 
                                        onClick={() => handleDeleteClient(client.clientid)} 
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
        </div>
    );
}

export default AllClients;