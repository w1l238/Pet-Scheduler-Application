import React, { useState, useEffect } from 'react';
import api from '../api';
import './EditPetModal.css';

function EditPetModal({ pet, onClose, onPetUpdated }) {
    const [formData, setFormData] = useState({
        Name: '',
        Breed: '',
        Age: '',
        Notes: '',
        ProfilePhotoPath: '',
        ProfilePhotoHash: '', // Add ProfilePhotoHash to formData state
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false); // Add showModal state
    const [selectedFile, setSelectedFile] = useState(null);

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
                ProfilePhotoPath: pet.profilephotopath || '',
                ProfilePhotoHash: pet.profilephotohash || '', // Initialize ProfilePhotoHash from pet data
            });
        }
    }, [pet]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const onFileChange = e => {
        setSelectedFile(e.target.files[0]);
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
            let profilePhotoPath = formData.ProfilePhotoPath;
            let profilePhotoHash = formData.ProfilePhotoHash; // Get current hash from state

            // If a new file is selected, upload it first
            if (selectedFile) {
                const fileFormData = new FormData();
                fileFormData.append('profilePhoto', selectedFile);
                const uploadRes = await api.post('/upload', fileFormData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
                profilePhotoPath = uploadRes.data.filePath;
                profilePhotoHash = uploadRes.data.fileHash; // Capture the hash from the upload response
            }

            const updatedPetData = {
                ...formData,
                Age: formData.Age ? parseInt(formData.Age, 10) : null,
                ClientID: pet.clientid, // Keep the original ClientID
                ProfilePhotoPath: profilePhotoPath,
                ProfilePhotoHash: profilePhotoHash, // Include the hash in the update data
            };
            await api.put(`/pets/${pet.petid}`, updatedPetData);
            onPetUpdated();
            handleClose(); // Close on success
        } catch (err) {
            setError('Failed to update pet. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeletePhoto = async () => {
        setLoading(true);
        setError('');
        try {
            await api.delete(`/pets/${pet.petid}/photo`);
            setFormData(prev => ({ ...prev, ProfilePhotoPath: null, ProfilePhotoHash: null })); // Clear hash on delete
            onPetUpdated(); // Refresh parent component
        } catch (err) {
            setError('Failed to delete photo. Please try again.');
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
                        <label>Profile Photo</label>
                        <div className="photo-controls">
                            {formData.ProfilePhotoPath ? (
                                <div className="profile-photo-preview">
                                    <img src={`${process.env.REACT_APP_API_BASE_URL}${formData.ProfilePhotoPath}`} alt="Pet Profile" className="current-profile-photo" />
                                </div>
                            ) : (
                                <div className="profile-photo-placeholder">
                                    {formData.Name ? formData.Name.charAt(0).toUpperCase() : '?'}
                                </div>
                            )}
                            <input
                                type="file"
                                name="profilePhoto"
                                onChange={onFileChange}
                                accept="image/*"
                            />
                            {formData.ProfilePhotoPath && (
                                <button type="button" className="delete-photo-button" onClick={handleDeletePhoto} disabled={loading}>
                                    Delete Photo
                                </button>
                            )}
                        </div>
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
