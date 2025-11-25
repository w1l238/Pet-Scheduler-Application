import React, { useState, useEffect } from 'react';
import api from '../api';
import './AddServiceModal.css';

function AddServiceModal({ onClose, onServiceAdded }) {
    const [formData, setFormData] = useState({
        Name: '',
        Description: '',
        Price: '',
        DurationMinutes: '',
    });
    const [message, setMessage] = useState('');
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setShowModal(true), 10);
        return () => clearTimeout(timer);
    }, []);

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleClose = () => {
        setShowModal(false);
        setTimeout(onClose, 300);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/services', formData);
            setMessage('Service added successfully!');
            onServiceAdded();
            handleClose();
        } catch (err) {
            console.error('Failed to add service', err);
            setMessage(err.response ? err.response.data.message : 'Server error');
        }
    };

    return (
        <div className={`modal-overlay ${showModal ? 'show' : ''}`} onClick={handleClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Add Service</h2>
                    <button onClick={handleClose} className="close-button">&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="dashboard-form">
                    <div className="form-group">
                        <label>Name</label>
                        <input type="text" name="Name" value={formData.Name} onChange={onChange} placeholder="Service Name" required />
                    </div>
                    <div className="form-group">
                        <label>Description</label>
                        <input type="text" name="Description" value={formData.Description} onChange={onChange} placeholder="Description" />
                    </div>
                    <div className="form-group">
                        <label>Price</label>
                        <input type="number" name="Price" value={formData.Price} onChange={onChange} placeholder="Price" required step="0.01" />
                    </div>
                    <div className="form-group">
                        <label>Duration (Minutes)</label>
                        <input type="number" name="DurationMinutes" value={formData.DurationMinutes} onChange={onChange} placeholder="Duration (Minutes)" />
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

export default AddServiceModal;
