import React, { useState, useEffect } from 'react';
import api from '../api';
import EditServiceModal from './EditServiceModal';
import AddServiceModal from './AddServiceModal';

function ServiceManager() {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [version, setVersion] = useState(0); // To trigger re-fetch
    const [searchTerm, setSearchTerm] = useState('');
    const [sortCriteria, setSortCriteria] = useState('name-asc');
    const [editingService, setEditingService] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    useEffect(() => {
        const fetchServices = async () => {
            setLoading(true);
            try {
                const res = await api.get('/services');
                setServices(res.data);
            } catch (err) {
                setError('Failed to fetch services.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchServices();
    }, [version]);

    const handleDeleteService = async (serviceId) => {
        if (window.confirm('Are you sure you want to delete this service?')) {
            try {
                await api.delete(`/services/${serviceId}`);
                setVersion(v => v + 1); // Re-fetch services
            } catch (err) {
                console.error('Failed to delete service', err);
                setError('Failed to delete service. Please try again.');
            }
        }
    };

    // Edit Modal
    const openEditModal = (service) => {
        setEditingService(service);
        setIsEditModalOpen(true);
    };

    const closeEditModal = () => {
        setEditingService(null);
        setIsEditModalOpen(false);
    };

    const handleServiceUpdated = () => {
        setVersion(v => v + 1); // Re-fetch services
    };

    // Add Modal
    const openAddModal = () => setIsAddModalOpen(true);
    const closeAddModal = () => setIsAddModalOpen(false);

    const handleServiceAdded = () => {
        setVersion(v => v + 1); // Re-fetch services
    };

    const filteredAndSortedServices = services
        .filter(service => {
            const searchTermLower = searchTerm.toLowerCase();
            return (
                service.name.toLowerCase().includes(searchTermLower) ||
                (service.description && service.description.toLowerCase().includes(searchTermLower)) ||
                service.price.toString().includes(searchTermLower)
            );
        })
        .sort((a, b) => {
            switch (sortCriteria) {
                case 'name-asc':
                    return a.name.localeCompare(b.name);
                case 'name-desc':
                    return b.name.localeCompare(a.name);
                case 'price-asc':
                    return a.price - b.price;
                case 'price-desc':
                    return b.price - a.price;
                default:
                    return 0;
            }
        });

    if (loading) {
        return <p>Loading services...</p>;
    }

    if (error) {
        return <p className="message">{error}</p>;
    }

    return (
        <div className="service-manager-layout">
            <header className="dashboard-header">
                <h1>Manage Services</h1>
            </header>
            <div className="existing-services-pane">
                <div className="section-header-with-button">
                    <h2>Existing Services</h2>
                    <button onClick={openAddModal} className="add-button">Add Service</button>
                </div>
                
                <div className="controls">
                    <input
                        type="text"
                        placeholder="Search by Name, Description, or Price"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                    <select value={sortCriteria} onChange={e => setSortCriteria(e.target.value)} className="sort-select">
                        <option value="name-asc">Name A-Z</option>
                        <option value="name-desc">Name Z-A</option>
                        <option value="price-asc">Price (Low to High)</option>
                        <option value="price-desc">Price (High to Low)</option>
                    </select>
                </div>
                {filteredAndSortedServices.length === 0 ? (
                    <p>No services matching your criteria.</p>
                ) : (
                    <ul className="dashboard-list">
                        {filteredAndSortedServices.map(service => (
                            <li key={service.serviceid} className="dashboard-list-item">
                                <div className="item-details">
                                    <strong>Name:</strong> {service.name} <br />
                                    <strong>Price:</strong> ${service.price} <br />
                                    <strong>Duration:</strong> {service.durationminutes || 'N/A'} mins <br />
                                    <strong>Description:</strong> {service.description || 'No description.'}
                                </div>
                                <div className="item-actions">
                                    <button onClick={() => openEditModal(service)} className="edit-button">
                                        Edit
                                    </button>
                                    <button onClick={() => handleDeleteService(service.serviceid)} className="delete-button">
                                        Delete
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {isAddModalOpen && (
                <AddServiceModal
                    onClose={closeAddModal}
                    onServiceAdded={handleServiceAdded}
                />
            )}
            {isEditModalOpen && (
                <EditServiceModal
                    service={editingService}
                    onClose={closeEditModal}
                    onServiceUpdated={handleServiceUpdated}
                />
            )}
        </div>
    );
}

export default ServiceManager;