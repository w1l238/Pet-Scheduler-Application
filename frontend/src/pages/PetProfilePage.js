import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';
import { FaPaw, FaBirthdayCake, FaStickyNote } from 'react-icons/fa';
import usePageTitle from '../hooks/usePageTitle';

const PetProfilePage = () => {
    const { petId } = useParams();
    const [pet, setPet] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showPage, setShowPage] = useState(false);

    usePageTitle(pet ? `${pet.name}'s Profile` : 'Pet Profile', '/favicon.ico');

    useEffect(() => {
        const fetchPet = async () => {
            try {
                const response = await api.get(`/pets/${petId}`);
                setPet(response.data);
            } catch (err) {
                setError('Pet not found');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchPet();
    }, [petId]);

    useEffect(() => {
        if (!loading) {
            const timer = setTimeout(() => setShowPage(true), 10);
            return () => clearTimeout(timer);
        }
    }, [loading]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    if (!pet) {
        return <div>Pet not found</div>;
    }

    return (
        <div className="profile-page-container">
            <div className={`profile-card ${showPage ? 'show' : ''}`}>
                <div className="profile-card-header">
                    {pet.profilephotopath ? (
                        <img src={`${process.env.REACT_APP_API_BASE_URL}${pet.profilephotopath}`} alt={`${pet.name}'s profile`} className="profile-photo pet-profile-photo" />
                    ) : (
                        <div className="profile-photo-placeholder">
                            {pet.name ? pet.name.charAt(0).toUpperCase() : '?'}
                        </div>
                    )}
                    <h1>{pet.name}</h1>
                </div>
                <div className="profile-card-body">
                    {pet.breed && (
                        <div className="profile-info-item">
                            <FaPaw className="info-icon" />
                            <span><strong>Breed:</strong> {pet.breed}</span>
                        </div>
                    )}
                    {pet.age && (
                        <div className="profile-info-item">
                            <FaBirthdayCake className="info-icon" />
                            <span><strong>Age:</strong> {pet.age}</span>
                        </div>
                    )}
                    {pet.notes && (
                        <div className="profile-info-item">
                            <FaStickyNote className="info-icon" />
                            <span><strong>Notes:</strong> {pet.notes}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PetProfilePage;

