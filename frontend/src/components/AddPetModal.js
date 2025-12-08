import React, { useState, useEffect } from 'react';
import api from '../api';
import './AddPetModal.css';

const decodeToken = (token) => {
    try {
        return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
        return null;
    }
};

function AddPetModal({ onClose, onPetAdded }) {
    const [formData, setFormData] = useState({
        Name: '',
        Breed: '',
        Age: '',
        Notes: '',
        ProfilePhotoURL: '',
    });
    const [message, setMessage] = useState('');
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setShowModal(true), 10);
        return () => clearTimeout(timer);
    }, []);

    const { Name, Breed, Age, Notes, ProfilePhotoURL } = formData;

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleClose = () => {
        setShowModal(false);
        setTimeout(onClose, 300);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setMessage('Not authenticated. Please log in.');
                return;
            }
            const decodedToken = decodeToken(token);
            const clientId = decodedToken?.user?.id;

            if (!clientId) {
                setMessage('Could not identify client from token.');
                return;
            }

            const petData = { ...formData, ClientID: clientId };

            // If ProfilePhotoURL is empty, set it to the default image URL
            if (!petData.ProfilePhotoURL) {
                petData.ProfilePhotoURL = 'https://imgs.search.brave.com/K6W0zfpaPJCvOK3_7HIIoAJgsNfbgogZ64-WW8W7VhM/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9zdGF0/aWMudmVjdGVlenku/Y29tL3N5c3RlbS9y/ZXNvdXJjZXMvdGh1/bWJuYWlscy8wNjcv/ODE4LzMwOS9zbWFs/bC9taW5pbWFsaXN0/LWJsYWNrLWRvZy1z/aWxob3VldHRlLWlj/b24tdmVjdG9yLmpw/Zw';
            }

            await api.post('/pets', petData);
            setMessage('Pet added successfully!');
            if (onPetAdded) {
                onPetAdded();
            }
            handleClose();
        } catch (err) {
            console.error(err.response ? err.response.data : err.message);
            setMessage(err.response ? err.response.data.message : 'Server error');
        }
    };

    return (
        <div className={`modal-overlay ${showModal ? 'show' : ''}`} onClick={handleClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Add a New Pet</h2>
                    <button onClick={handleClose} className="close-button">&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="dashboard-form">
                    <div className="form-group">
                        <label>Pet Name</label>
                        <input type="text" name="Name" value={Name} onChange={onChange} placeholder="Pet Name" required />
                    </div>
                    <div className="form-group">
                        <label>Breed</label>
                        <input type="text" name="Breed" value={Breed} onChange={onChange} placeholder="Breed (Optional)" />
                    </div>
                    <div className="form-group">
                        <label>Age</label>
                        <input type="number" name="Age" value={Age} onChange={onChange} placeholder="Age (Optional)" min="0" />
                    </div>
                    <div className="form-group">
                        <label>Notes</label>
                        <textarea
                        placeholder="Notes (e.g. allergies, behavior)"
                        name="Notes"
                        value={Notes}
                        onChange={onChange}
                    />
                    </div>
                    <div className="form-group">
                        <label>Profile Photo URL</label>
                        <input type="text" name="ProfilePhotoURL" value={ProfilePhotoURL} onChange={onChange} placeholder="Image URL (Optional)" />
                    </div>
                    <div className="modal-footer">
                        <button type="button" onClick={handleClose} className="cancel-button">Cancel</button>
                        <button type="submit" className="save-button">Save</button>
                    </div>
                </form>
                {message && <p className={`message ${message.includes('successfully') ? 'success' : ''}`}>{message}</p>}
            </div>
        </div>
    );
}

export default AddPetModal;
