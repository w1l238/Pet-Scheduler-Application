import React, { useState, useEffect } from 'react';
import api from '../api';
import './EditPetModal.css';

function EditPetModal({ pet, onClose, onPetUpdated }) {
    const [formData, setFormData] = useState({
        Name: '',
        Breed: '',
        Age: '',
        Notes: '',
        ProfilePhotoURL: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false); // Add showModal state

    useEffect(() => {
        const timer = setTimeout(() => setShowModal(true), 10); // Trigger animation
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (pet) {
            setFormData({
                Name: pet.name || '',
                Breed: pet.breed || '',
                Age: pet.age || '',
                Notes: pet.notes || '',
                ProfilePhotoURL: pet.profilephotourl || '',
            });
        }
    }, [pet]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleClose = () => {
        setShowModal(false); // Start fade-out animation
        setTimeout(onClose, 300); // Close modal after animation
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const updatedPetData = {
                ...formData,
                Age: formData.Age ? parseInt(formData.Age, 10) : null,
                ClientID: pet.clientid, // Keep the original ClientID
            };
            await api.put(`/pets/${pet.petid}`, updatedPetData);
            onPetUpdated();
        } catch (err) {
            setError('Failed to update pet. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (!pet) return null;

    return (
        <div className={`modal-overlay ${showModal ? 'show' : ''}`} onClick={handleClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Edit Pet</h2>
                    <button onClick={handleClose} className="close-button">&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="dashboard-form">
                    <div className="form-group">
                        <label>Name</label>
                        <input
                            type="text"
                            name="Name"
                            value={formData.Name}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Breed</label>
                        <input
                            type="text"
                            name="Breed"
                            value={formData.Breed}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-group">
                        <label>Age</label>
                        <input
                            type="number"
                            name="Age"
                            value={formData.Age}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-group">
                        <label>Notes</label>
                        <textarea
                            name="Notes"
                            value={formData.Notes}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-group">
                        <label>Profile Photo URL</label>
                        <input
                            type="text"
                            name="ProfilePhotoURL"
                            value={formData.ProfilePhotoURL}
                            onChange={handleChange}
                        />
                    </div>
                    {error && <p className="error-message">{error}</p>}
                    <div className="modal-footer">
                        <button type="button" className="cancel-button" onClick={handleClose}>Cancel</button>
                        <button type="submit" className="save-button" disabled={loading}>
                            {loading ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default EditPetModal;
