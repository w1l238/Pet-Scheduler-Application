import React, { useState, useEffect, useCallback } from 'react';
import api from '../api';
import ServiceForm from './ServiceForm'; // Import the new unified form
import { FiBarChart2 } from 'react-icons/fi'; // Icon for stats
import ConfirmationModal from './ConfirmationModal'; // Import the new modal
import './ServiceManager.css'; // Import animation styles

function ServiceManager() {
    const [services, setServices] = useState([]);
    const [serviceStats, setServiceStats] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [version, setVersion] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortCriteria, setSortCriteria] = useState('name-asc');
    const [editingService, setEditingService] = useState(null);
    const [isAnimated, setIsAnimated] = useState(false); // State for animation

    // State for confirmation modal
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [serviceToDeleteId, setServiceToDeleteId] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch both services and their usage stats concurrently
                const [servicesRes, statsRes] = await Promise.all([
                    api.get('/services'),
                    api.get('/services/stats')
                ]);
                setServices(servicesRes.data);
                setServiceStats(statsRes.data);
            } catch (err) {
                setError('Failed to fetch service data.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [version]);

    // Effect for triggering animation after loading is complete
    useEffect(() => {
        if (!loading) {
            const timer = setTimeout(() => setIsAnimated(true), 50); // Short delay for rendering
            return () => clearTimeout(timer);
        }
    }, [loading]);

    const handleDeleteService = (serviceId) => {
        setServiceToDeleteId(serviceId);
        setShowConfirmModal(true);
    };

    const confirmDelete = async () => {
        try {
            await api.delete(`/services/${serviceToDeleteId}`);
            setVersion(v => v + 1); // Re-fetch data
        } catch (err) {
            console.error('Failed to delete service', err);
            setError('Failed to delete service. Please try again.');
        } finally {
            setShowConfirmModal(false);
            setServiceToDeleteId(null);
        }
    };

    const cancelDelete = () => {
        setShowConfirmModal(false);
        setServiceToDeleteId(null);
    };

    const handleSave = useCallback(() => {
        setEditingService(null); // Clear the form after save
        setVersion(v => v + 1); // Re-fetch data to show changes
    }, []); // No dependencies, as it only updates state

    const handleClearForm = useCallback(() => {
        setEditingService(null);
    }, []); // No dependencies, as it only updates state

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
        <div className={`service-manager-layout ${isAnimated ? 'loaded' : ''}`}>
            <header className="dashboard-header">
                <h1>Manage Services</h1>
            </header>
            <div className="service-manager-content">
                {/* Left Pane: Existing Services List */}
                <div className="existing-services-pane">
                    <h2>Existing Services</h2>
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
                                <li 
                                    key={service.serviceid} 
                                    className="dashboard-list-item" 
                                    onClick={(e) => {
                                        const clickedItem = e.currentTarget;
                                        setEditingService(service);
                                        clickedItem.classList.add('bounce-animation');
                                        setTimeout(() => {
                                            clickedItem.classList.remove('bounce-animation');
                                        }, 200); // Match animation duration
                                    }}
                                >
                                    <div className="item-details">
                                        <strong>{service.name}</strong> <br />
                                        <span>${service.price} | {service.durationminutes || 'N/A'} mins</span>
                                        <p style={{fontSize: '0.9rem', color: '#666', marginTop: '4px'}}>{service.description || 'No description.'}</p>
                                        <span className="status-line" title="Usage Count">
                                            <FiBarChart2 /> {serviceStats[service.serviceid] || 0} bookings
                                        </span>
                                    </div>
                                    <div className="item-actions">
                                        <button onClick={(e) => { e.stopPropagation(); handleDeleteService(service.serviceid); }} className="delete-button">
                                            Delete
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Right Pane: Add/Edit Form */}
                <div className="add-service-pane">
                    <ServiceForm 
                        serviceToEdit={editingService}
                        onSave={handleSave}
                        onClear={handleClearForm}
                    />
                </div>
            </div>

            <ConfirmationModal
                show={showConfirmModal}
                message="Are you sure you want to delete this service? This action cannot be undone."
                onConfirm={confirmDelete}
                onCancel={cancelDelete}
            />
        </div>
    );
}

export default ServiceManager;