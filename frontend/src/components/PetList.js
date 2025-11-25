import React, { useState, useEffect } from 'react';
import api from '../api';

const decodeToken = (token) => {
    try {
        return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
        return null;
    }
};

function PetList({ key }) {
    const [pets, setPets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchPets = async () => {
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
    }, [key]);

    if (loading) {
        return <p>Loading pets...</p>;
    }

    if (error) {
        return <p className="message">{error}</p>;
    }

    return (
        <div>
            <h4>My Pets</h4>
            {pets.length === 0 ? (
                <p>You have not added any pets yet.</p>
            ) : (
                <ul className="dashboard-list">
                    {pets.map(pet => (
                        <li key={pet.petid} className="dashboard-list-item">
                            <strong>{pet.name}</strong> ({pet.breed || 'N/A'}) - {pet.age ? `${pet.age} years old` : 'Age not specified'}
                            {pet.notes && <p>Notes: {pet.notes}</p>}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default PetList;