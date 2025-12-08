import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import EditPetModal from './EditPetModal';
import ConfirmationModal from './ConfirmationModal';

const decodeToken = (token) => {
    try {
        return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
        return null;
    }
};

function PetManager({ version, onPetDeleted, onLoadComplete }) {
    const [pets, setPets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortCriteria, setSortCriteria] = useState('name-asc');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedPet, setSelectedPet] = useState(null);
    const navigate = useNavigate();

    // State for confirmation modal
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [petToDelete, setPetToDelete] = useState(null);
    const [confirmMessage, setConfirmMessage] = useState('');

    // Effect to notify parent component when loading is finished
    useEffect(() => {
        if (!loading && onLoadComplete) {
            onLoadComplete();
        }
    }, [loading, onLoadComplete]);

    useEffect(() => {
        const fetchPets = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    setError('Not authenticated');
                    setLoading(false);
                    return;
                }
                const decodedToken = decodeToken(token);
                const clientId = decodedToken?.user?.id;

                if (!clientId) {
                    setError('Could not identify client from token.');
                    setLoading(false);
                    return;
                }

                const res = await api.get(`/clients/${clientId}/pets`);
                setPets(res.data);
            } catch (err) {
                setError('Failed to fetch pets.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchPets();
    }, [version]);

    const handleDeletePet = (pet) => {
        setPetToDelete(pet);
        setConfirmMessage(`Are you sure you want to delete ${pet.name}? This action cannot be undone.`);
        setShowConfirmModal(true);
    };

    const handleConfirmDelete = async () => {
        setShowConfirmModal(false);
        if (petToDelete) {
            try {
                await api.delete(`/pets/${petToDelete.petid}`);
                onPetDeleted(); // Notify parent to trigger re-fetch
                setPetToDelete(null);
            } catch (err) {
                console.error('Failed to delete pet', err);
                setError('Failed to delete pet. Please try again.');
            }
        }
    };

    const handleCancelDelete = () => {
        setShowConfirmModal(false);
        setPetToDelete(null);
    };

    const openEditModal = (pet) => {
        setSelectedPet(pet);
        setIsEditModalOpen(true);
    };

    const closeEditModal = () => {
        setSelectedPet(null);
        setIsEditModalOpen(false);
    };

    const handlePetUpdated = () => {
        closeEditModal();
        // Refresh the list by notifying the parent
        onPetDeleted();
    };

    const filteredAndSortedPets = pets
        .filter(pet => {
            const searchTermLower = searchTerm.toLowerCase();
            return (
                pet.name.toLowerCase().includes(searchTermLower) ||
                (pet.breed && pet.breed.toLowerCase().includes(searchTermLower))
            );
        })
        .sort((a, b) => {
            switch (sortCriteria) {
                case 'name-asc':
                    return a.name.localeCompare(b.name);
                case 'name-desc':
                    return b.name.localeCompare(a.name);
                case 'age-asc':
                    return (a.age || 0) - (b.age || 0);
                case 'age-desc':
                    return (b.age || 0) - (a.age || 0);
                default:
                    return 0;
            }
        });

    if (loading) {
        return <p>Loading pets...</p>;
    }

    if (error) {
        return <p className="message">{error}</p>;
    }

    return (
        <div>
            <div className="controls">
                <input
                    type="text"
                    placeholder="Search by Name or Breed"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="search-input"
                />
                <select value={sortCriteria} onChange={e => setSortCriteria(e.target.value)} className="sort-select">
                    <option value="name-asc">Name A-Z</option>
                    <option value="name-desc">Name Z-A</option>
                    <option value="age-asc">Age (Low to High)</option>
                    <option value="age-desc">Age (High to Low)</option>
                </select>
            </div>
            {filteredAndSortedPets.length === 0 ? (
                <p>You have not added any pets yet, or none match your search.</p>
            ) : (
                <ul className="dashboard-list">
                    {filteredAndSortedPets.map(pet => (
                        <li key={pet.petid} className="dashboard-list-item" onClick={() => navigate(`/client/pet/${pet.petid}`)}>
                            <img src={pet.profilephotourl || 'https://via.placeholder.com/50'} alt={`${pet.name}'s profile`} className="item-photo" />
                            <div className="item-details">
                                <strong>{pet.name}</strong> ({pet.breed || 'N/A'}) - {pet.age ? `${pet.age} years old` : 'Age not specified'}
                                {pet.notes && <p>Notes: {pet.notes}</p>}
                            </div>
                            <div className="item-actions">
                                <button onClick={(e) => { e.stopPropagation(); openEditModal(pet); }} className="edit-button">
                                    Edit
                                </button>
                                <button onClick={(e) => { e.stopPropagation(); handleDeletePet(pet); }} className="delete-button">
                                    Delete
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            {isEditModalOpen && (
                <EditPetModal
                    pet={selectedPet}
                    onClose={closeEditModal}
                    onPetUpdated={handlePetUpdated}
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

export default PetManager;