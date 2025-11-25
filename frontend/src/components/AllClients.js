import React, { useState, useEffect } from 'react';
import api from '../api';

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
        if (window.confirm('Are you sure you want to delete this client and all associated data?')) {
            try {
                await api.delete(`/clients/${clientId}`);
                setVersion(v => v + 1); // Trigger re-fetch
            } catch (err) {
                console.error('Failed to delete client', err);
                setError('Failed to delete client. Please try again.');
            }
        }
    };

    const handleRoleChange = async (client) => {
        const newRole = client.role === 'Admin' ? 'Client' : 'Admin';
        try {
            await api.put(`/clients/${client.clientid}`, { Role: newRole });
            setVersion(v => v + 1);
        } catch (err) {
            console.error('Failed to update role', err);
            setError(err.response?.data?.message || 'Failed to update role.');
        }
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
                                <strong>Email:</strong> {client.email}
                            </div>
                            <div className="item-actions">
                                <span className="role-display"><strong>Role:</strong> {client.role}</span>
                                {currentUserId !== client.clientid && (
                                    <label className="toggle-switch">
                                        <input
                                            type="checkbox"
                                            checked={client.role === 'Admin'}
                                            onChange={() => handleRoleChange(client)}
                                        />
                                        <span className="slider"></span>
                                    </label>
                                )}
                                <button onClick={() => handleDeleteClient(client.clientid)} className="delete-button">
                                    Delete
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default AllClients;