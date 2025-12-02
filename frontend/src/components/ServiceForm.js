import React, { useState, useEffect } from 'react';
import api from '../api';

function ServiceForm({ serviceToEdit, onSave, onClear }) {
    const [formData, setFormData] = useState({
        Name: '',
        Description: '',
        Price: '',
        DurationMinutes: '',
    });
    const [message, setMessage] = useState('');
    const isEditMode = !!serviceToEdit;

    useEffect(() => {
        if (serviceToEdit) {
            setFormData({
                Name: serviceToEdit.name || '',
                Description: serviceToEdit.description || '',
                Price: serviceToEdit.price || '',
                DurationMinutes: serviceToEdit.durationminutes || '',
            });
        } else {
            // Clear form when there's no service to edit
            setFormData({ Name: '', Description: '', Price: '', DurationMinutes: '' });
        }
    }, [serviceToEdit]);

    const { Name, Description, Price, DurationMinutes } = formData;

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async e => {
        e.preventDefault();
        setMessage('');
        try {
            let res;
            if (isEditMode) {
                // Update existing service
                res = await api.put(`/services/${serviceToEdit.serviceid}`, formData);
            } else {
                // Create new service
                res = await api.post('/services', formData);
            }
            onSave(res.data); // Pass the saved/updated service back to the parent
        } catch (err) {
            console.error('Failed to save service', err);
            setMessage(err.response?.data?.message || 'Failed to save service.');
        }
    };

    return (
        <div className="dashboard-card">
            <div className="section-header-with-button">
                <h2>{isEditMode ? 'Edit Service' : 'Add a New Service'}</h2>
                {isEditMode && (
                     <button onClick={onClear} className="cancel-button" style={{padding: '5px 10px', fontSize: '0.9rem'}}>
                        Cancel Edit
                    </button>
                )}
            </div>
            <form onSubmit={handleSubmit} className="dashboard-form">
                <div className="form-group">
                    <label>Service Name</label>
                    <input type="text" name="Name" value={Name} onChange={onChange} required />
                </div>
                <div className="form-group">
                    <label>Description</label>
                    <textarea name="Description" value={Description} onChange={onChange}></textarea>
                </div>
                <div className="form-group">
                    <label>Price ($)</label>
                    <input type="number" name="Price" value={Price} onChange={onChange} required step="0.01" />
                </div>
                <div className="form-group">
                    <label>Duration (minutes)</label>
                    <input type="number" name="DurationMinutes" value={DurationMinutes} onChange={onChange} />
                </div>
                <button type="submit" className="save-button" style={{width: '100%', marginTop: '1rem'}}>
                    {isEditMode ? 'Update Service' : 'Add Service'}
                </button>
                {message && <p className="message" style={{marginTop: '1rem'}}>{message}</p>}
            </form>
        </div>
    );
}

export default ServiceForm;
