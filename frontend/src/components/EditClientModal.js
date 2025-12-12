import React, { useState, useEffect } from 'react';
import api from '../api';
import './EditClientModal.css';

function EditClientModal({ client, onClose, onSave }) {
    const [formData, setFormData] = useState({
        FirstName: '',
        LastName: '',
        Email: '',
        Role: '',
        ProfilePhotoPath: '', // Changed from ProfilePhotoURL
        ProfilePhotoHash: '', // Added ProfilePhotoHash
    });
    const [message, setMessage] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null); // Added for file input

    useEffect(() => {
        // Initialize form data when a client is passed in
        if (client) {
            setFormData({
                FirstName: client.firstname || '',
                LastName: client.lastname || '',
                Email: client.email || '',
                Role: client.role || 'Client',
                ProfilePhotoPath: client.profilephotopath || '', // Initialize ProfilePhotoPath
                ProfilePhotoHash: client.profilephotohash || '', // Initialize ProfilePhotoHash
            });
        }
        // For the fade-in effect
        const timer = setTimeout(() => setShowModal(true), 10);
        return () => clearTimeout(timer);
    }, [client]);

    const { FirstName, LastName, Email, Role } = formData; // Removed ProfilePhotoURL

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onFileChange = e => {
        setSelectedFile(e.target.files[0]);
    };

    const handleClose = () => {
        setShowModal(false);
        // Allow animation to finish before calling parent onClose
        setTimeout(onClose, 300);
    };

    const handleSubmit = async e => {
        e.preventDefault();
        setMessage('');

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
                setMessage('Failed to upload photo. Please try again.');
                return;
            }
        }

        try {
            const res = await api.put(`/clients/${client.clientid}`, {
                ...formData,
                ProfilePhotoPath: profilePhotoPath,
                ProfilePhotoHash: profilePhotoHash,
            });
            onSave(res.data); // Pass updated client back to parent
        } catch (err) {
            console.error(err.response ? err.response.data : err.message);
            setMessage(err.response?.data?.message || 'Server error');
        }
    };

    const handleDeletePhoto = async () => {
        try {
            await api.delete(`/clients/${client.clientid}/photo`);
            setFormData(prev => ({ ...prev, ProfilePhotoPath: null, ProfilePhotoHash: null }));
            // The parent component will refresh data when the modal closes.
        } catch (err) {
            console.error('Failed to delete photo:', err);
            setMessage('Failed to delete photo. Please try again.');
        }
    };

    if (!client) {
        return null;
    }

    return (
        <div className={`modal-overlay ${showModal ? 'show' : ''}`} onClick={handleClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Edit Client: {client.firstname} {client.lastname}</h2>
                    <button onClick={handleClose} className="close-button">&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="dashboard-form">
                    <div className="form-group">
                        <label>First Name</label>
                        <input
                            type="text"
                            name="FirstName"
                            value={FirstName}
                            onChange={onChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Last Name</label>
                        <input
                            type="text"
                            name="LastName"
                            value={LastName}
                            onChange={onChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            name="Email"
                            value={Email}
                            onChange={onChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Role</label>
                        <select name="Role" value={Role} onChange={onChange} required>
                            <option value="Client">Client</option>
                            <option value="Admin">Admin</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Profile Photo</label>
                        <div className="photo-controls">
                            {formData.ProfilePhotoPath ? (
                                <div className="profile-photo-preview">
                                    <img src={`${process.env.REACT_APP_API_BASE_URL}${formData.ProfilePhotoPath}`} alt="Client Profile" className="current-profile-photo" />
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
                                <button type="button" className="delete-photo-button" onClick={handleDeletePhoto}>
                                    Delete Photo
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" onClick={handleClose} className="cancel-button">Cancel</button>
                        <button type="submit" className="save-button">Save</button>
                    </div>
                </form>
                {message && <p className="message">{message}</p>}
            </div>
        </div>
    );
}

export default EditClientModal;
