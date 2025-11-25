import React, { useState } from 'react';
import api from '../api';

const decodeToken = (token) => {
    try {
        return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
        return null;
    }
};

function AddPetForm({ onPetAdded }) {
    const [formData, setFormData] = useState({
        Name: '',
        Breed: '',
        Age: '',
        Notes: '',
    });
    const [message, setMessage] = useState('');

    const { Name, Breed, Age, Notes } = formData;

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
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

            await api.post('/pets', petData);
            setMessage('Pet added successfully!');
            setFormData({ Name: '', Breed: '', Age: '', Notes: '' }); // Clear form
            if (onPetAdded) {
                onPetAdded(); // Notify parent to refresh pet list
            }
        } catch (err) {
            console.error(err.response ? err.response.data : err.message);
            setMessage(err.response ? err.response.data.message : 'Server error');
        }
    };

    return (
        <div>
            <h4>Add a New Pet</h4>
            <form onSubmit={onSubmit} className="dashboard-form">
                <div className="form-group">
                    <input
                        type="text"
                        placeholder="Pet Name"
                        name="Name"
                        value={Name}
                        onChange={onChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <input
                        type="text"
                        placeholder="Breed (Optional)"
                        name="Breed"
                        value={Breed}
                        onChange={onChange}
                    />
                </div>
                <div className="form-group">
                    <input
                        type="number"
                        placeholder="Age (Optional)"
                        name="Age"
                        value={Age}
                        onChange={onChange}
                        min="0"
                    />
                </div>
                <div className="form-group">
                    <textarea
                        placeholder="Notes (e.g. allergies, behavior)"
                        name="Notes"
                        value={Notes}
                        onChange={onChange}
                    />
                </div>
                <button type="submit">Add Pet</button>
            </form>
            {message && <p className={`message ${message.includes('successfully') ? 'success' : ''}`}>{message}</p>}
        </div>
    );
}

export default AddPetForm;