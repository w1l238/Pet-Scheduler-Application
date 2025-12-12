import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Removed Link
import api from '../api';
import ConfirmationModal from './ConfirmationModal'; // Import the new modal
import EditPetModalAdmin from './EditPetModalAdmin'; // Import the admin edit pet modal
import './AllPets.css'; // Import animation styles

function AllPets() {
    const [pets, setPets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [version, setVersion] = useState(0); // To trigger re-fetch
    const [searchTerm, setSearchTerm] = useState('');
    const [sortCriteria, setSortCriteria] = useState('name-asc');
    const [isAnimated, setIsAnimated] = useState(false); // State for animation

    // State for confirmation modal
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [petToDeleteId, setPetToDeleteId] = useState(null);

    // State for edit modal
    const [showEditModal, setShowEditModal] = useState(false);
    const [petToEdit, setPetToEdit] = useState(null);

    const navigate = useNavigate(); // Initialize useNavigate

    useEffect(() => {
        const fetchPets = async () => {
            setLoading(true);
            try {
                const res = await api.get('/pets');
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

    // Effect for triggering animation after loading is complete
    useEffect(() => {
        if (!loading) {
            const timer = setTimeout(() => setIsAnimated(true), 50); // Short delay for rendering
            return () => clearTimeout(timer);
        }
    }, [loading]);

    const handleDeletePet = (petId) => {
        setPetToDeleteId(petId);
        setShowConfirmModal(true);
    };

    const confirmDelete = async () => {
        try {
            await api.delete(`/pets/${petToDeleteId}`);
            setVersion(v => v + 1); //Trigger refresh
        } catch (err) {
            console.error('Failed to delete pet', err);
            setError('Failed to delete pet. Please try again.');
        } finally {
            setShowConfirmModal(false);
            setPetToDeleteId(null);
        }
    };

    const cancelDelete = () => {
        setShowConfirmModal(false);
        setPetToDeleteId(null);
    };

    const handleEditPet = (pet) => {
        setPetToEdit(pet);
        setShowEditModal(true);
    };

    const handleCloseEditModal = () => {
        setShowEditModal(false);
        setPetToEdit(null);
    };

    const handlePetUpdated = (updatedPet) => {
        setPets(prevPets => prevPets.map(pet =>
            pet.petid === updatedPet.petid ? { ...pet, ...updatedPet } : pet
        ));
        // setVersion(v => v + 1); // Removed to prevent full re-fetch
    };

    const filteredAndSortedPets = pets
        .filter(pet => {
            const searchTermLower = searchTerm.toLowerCase();
            return (
                pet.name.toLowerCase().includes(searchTermLower) ||
                (pet.breed && pet.breed.toLowerCase().includes(searchTermLower)) ||
                (pet.firstname && pet.firstname.toLowerCase().includes(searchTermLower)) ||
                (pet.lastname && pet.lastname.toLowerCase().includes(searchTermLower))
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
        return <p>Loading all pets...</p>
    }

    if (error) {
        return <p className="message">{error}</p>;
    }

    return (
        <div className={`all-pets-layout ${isAnimated ? 'loaded' : ''}`}>
            <header class="dashboard-header">
                <h1>All Pets</h1>
            </header>
            <div className="controls">
                <input
                    type="text"
                    placeholder="Search by Name, Breed, or Client Name"
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
                <p>No pets matching your criteria.</p>
            ) : (
                <ul className="dashboard-list">
                    {filteredAndSortedPets.map(pet => (
                        <li key={pet.petid} className="dashboard-list-item" onClick={() => navigate(`/admin/pet/${pet.petid}`)}>
                            {pet.profilephotopath ? (
                                <img src={`${process.env.REACT_APP_API_BASE_URL}${pet.profilephotopath}`} alt={`${pet.name}'s profile`} className="item-photo pet-profile-photo" />
                            ) : (
                                <div className="profile-photo-placeholder item-photo">
                                    {pet.name ? pet.name.charAt(0).toUpperCase() : '?'}
                                </div>
                            )}
                                <div className="item-details">
                                    <strong>{pet.name}</strong> ({pet.breed || 'N/A'}) - {pet.age ? `${pet.age} years old` : 'Age not specified'}
                                    <p>Owner: {pet.firstname} {pet.lastname}</p>
                                </div>
                            <div className="item-actions">
                                <button onClick={(e) => { e.stopPropagation(); handleEditPet(pet); }} className="edit-button">
                                    Edit
                                </button>
                                <button onClick={(e) => { e.stopPropagation(); handleDeletePet(pet.petid); }} className="delete-button">
                                    Delete
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            <ConfirmationModal
                show={showConfirmModal}
                message="Are you sure you want to delete this pet? This action cannot be undone."
                onConfirm={confirmDelete}
                onCancel={cancelDelete}
            />

            {showEditModal && (
                <EditPetModalAdmin
                    pet={petToEdit}
                    onClose={handleCloseEditModal}
                    onPetUpdated={handlePetUpdated}
                />
            )}
        </div>
    );
}

export default AllPets;