import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

function AllPets() {
    const [pets, setPets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [version, setVersion] = useState(0); // To trigger re-fetch
    const [searchTerm, setSearchTerm] = useState('');
    const [sortCriteria, setSortCriteria] = useState('name-asc');

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

    const handleDeletePet = async (petId) => {
        if (window.confirm('Are you sure you want to delete this pet?')) {
            try {
                await api.delete(`/pets/${petId}`);
                setVersion(v => v + 1); //Trigger refresh
            } catch (err) {
                console.error('Failed to delete pet', err);
                setError('Failed to delete pet. Please try again.');
            }
        }
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
        <div>
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
                        <Link to={`/pet/${pet.petid}`}>
                            <li key={pet.petid} className="dashboard-list-item">
                                <img src={pet.profilephotourl || 'https://via.placeholder.com/50'} alt={`${pet.name}'s profile`} className="item-photo" />
                                    <div className="item-details">
                                        <strong>{pet.name}</strong> ({pet.breed || 'N/A'}) - {pet.age ? `${pet.age} years old` : 'Age not specified'}
                                        <p>Owner: {pet.firstname} {pet.lastname}</p>
                                    </div>
                                <div className="item-actions">
                                    <button onClick={() => handleDeletePet(pet.petid)} className="delete-button">
                                        Delete
                                    </button>
                                </div>
                            </li>
                        </Link>   
                    ))}
                </ul>
            )}
        </div>
    );
}

export default AllPets;