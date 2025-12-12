import React, { useState, useEffect } from 'react';
import api from '../api'; // Import the API helper
import './EditAdminProfileModal.css';

const EditAdminProfileModal = ({ admin, onSave, onClose }) => {
    const [formData, setFormData] = useState({
        FirstName: '',
        LastName: '',
        Email: '',
        PhoneNumber: '',
        ProfilePhotoPath: '', // Changed from ProfilePhotoURL
        ProfilePhotoHash: '', // Added ProfilePhotoHash
    });
    const [showModal, setShowModal] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null); // Added for file input
    const [error, setError] = useState(''); // Added error state
    const [loading, setLoading] = useState(false); // Added loading state

    useEffect(() => {
        const timer = setTimeout(() => setShowModal(true), 10);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (admin) {
            setFormData({
                FirstName: admin.firstname || '',
                LastName: admin.lastname || '',
                Email: admin.email || '',
                PhoneNumber: admin.phonenumber || '',
                ProfilePhotoPath: admin.profilephotopath || '', // Initialize ProfilePhotoPath
                ProfilePhotoHash: admin.profilephotohash || '', // Initialize ProfilePhotoHash
            });
        }
    }, [admin]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const onFileChange = e => {
        setSelectedFile(e.target.files[0]);
    };

    const handleSave = async () => {
        setLoading(true);
        setError('');

        let profilePhotoPath = formData.ProfilePhotoPath;
        let profilePhotoHash = formData.ProfilePhotoHash;

        if (selectedFile) {
            const fileFormData = new FormData();
            fileFormData.append('profilePhoto', selectedFile);
            try {
                const uploadRes = await api.post('/upload', fileFormData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
                profilePhotoPath = uploadRes.data.filePath;
                profilePhotoHash = uploadRes.data.fileHash;
                setSelectedFile(null); // Clear selected file after successful upload
            } catch (err) {
                console.error('Failed to upload photo:', err);
                setError('Failed to upload photo. Please try again.');
                setLoading(false);
                return;
            }
        }

        try {
            onSave({ ...formData, ProfilePhotoPath: profilePhotoPath, ProfilePhotoHash: profilePhotoHash });
        } catch (err) {
            console.error('Failed to save admin profile:', err);
            setError('Failed to save admin profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleDeletePhoto = async () => {
        setLoading(true);
        setError('');
        try {
            // Assuming a DELETE endpoint for admin profile photos similar to clients
            await api.delete(`/clients/${admin.clientid}/photo`);
            const updatedFormData = { ...formData, ProfilePhotoPath: null, ProfilePhotoHash: null };
            setFormData(updatedFormData); // Update local state
            onSave(updatedFormData); // Notify parent with updated data
            handleClose(); // Close the modal
        } catch (err) {
            console.error('Failed to delete photo:', err);
            setError('Failed to delete photo. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setShowModal(false);
        setTimeout(onClose, 300);
    };

    return (
        <div className={`modal-overlay ${showModal ? 'show' : ''}`} onClick={handleClose}>
            <div className="modal-content admin-profile-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Edit Profile</h2>
                    <button onClick={handleClose} className="close-button">&times;</button>
                </div>
                <div className="modal-body">
                    <div className="form-group">
                        <label htmlFor="FirstName">First Name</label>
                        <input type="text" id="FirstName" name="FirstName" value={formData.FirstName} onChange={handleChange} className="form-control" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="LastName">Last Name</label>
                        <input type="text" id="LastName" name="LastName" value={formData.LastName} onChange={handleChange} className="form-control" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="Email">Email</label>
                        <input type="email" id="Email" name="Email" value={formData.Email} onChange={handleChange} className="form-control" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="PhoneNumber">Phone Number</label>
                        <input type="tel" id="PhoneNumber" name="PhoneNumber" value={formData.PhoneNumber} onChange={handleChange} className="form-control" />
                    </div>
                    <div className="form-group">
                        <label>Profile Photo</label>
                        <div className="photo-controls">
                            {formData.ProfilePhotoPath ? (
                                <div className="profile-photo-preview">
                                    <img src={`${process.env.REACT_APP_API_BASE_URL}${formData.ProfilePhotoPath}`} alt="Admin Profile" className="current-profile-photo" />
                                </div>
                            ) : (
                                <div className="profile-photo-placeholder">
                                    {formData.FirstName ? formData.FirstName.charAt(0).toUpperCase() : '?'}
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
                </div>
                {error && <p className="error-message">{error}</p>}
                <div className="modal-footer">
                    <button onClick={handleClose} className="button-secondary" disabled={loading}>Cancel</button>
                    <button onClick={handleSave} className="button-primary" disabled={loading}>
                        {loading ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditAdminProfileModal;
