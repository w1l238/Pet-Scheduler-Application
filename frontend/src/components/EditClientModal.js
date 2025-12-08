import React, { useState, useEffect } from 'react';
import api from '../api';
import './EditClientModal.css';

function EditClientModal({ client, onClose, onSave }) {
    const [formData, setFormData] = useState({
        FirstName: '',
        LastName: '',
        Email: '',
        Role: '',
        ProfilePhotoURL: '', // Add ProfilePhotoURL
    });
    const [message, setMessage] = useState('');
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        // Initialize form data when a client is passed in
        if (client) {
            setFormData({
                FirstName: client.firstname || '',
                LastName: client.lastname || '',
                Email: client.email || '',
                Role: client.role || 'Client',
                ProfilePhotoURL: client.profilephotourl || '', // Initialize ProfilePhotoURL
            });
        }
        // For the fade-in effect
        const timer = setTimeout(() => setShowModal(true), 10);
        return () => clearTimeout(timer);
    }, [client]);

    const { FirstName, LastName, Email, Role, ProfilePhotoURL } = formData;

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleClose = () => {
        setShowModal(false);
        // Allow animation to finish before calling parent onClose
        setTimeout(onClose, 300);
    };

    const handleSubmit = async e => {
        e.preventDefault();
        try {
            const res = await api.put(`/clients/${client.clientid}`, formData);
            onSave(res.data); // Pass updated client back to parent
        } catch (err) {
            console.error(err.response ? err.response.data : err.message);
            setMessage(err.response?.data?.message || 'Server error');
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
                        <label>Profile Photo URL</label>
                        <input
                            type="text"
                            name="ProfilePhotoURL"
                            value={ProfilePhotoURL}
                            onChange={onChange}
                        />
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
