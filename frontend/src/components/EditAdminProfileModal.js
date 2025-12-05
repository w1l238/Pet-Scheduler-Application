import React, { useState, useEffect } from 'react';
import './EditAdminProfileModal.css';

const EditAdminProfileModal = ({ admin, onSave, onClose }) => {
    const [formData, setFormData] = useState({
        FirstName: '',
        LastName: '',
        Email: '',
        PhoneNumber: '',
        ProfilePhotoURL: '',
    });
    const [showModal, setShowModal] = useState(false);

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
                ProfilePhotoURL: admin.profilephotourl || '',
            });
        }
    }, [admin]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = () => {
        onSave(formData);
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
                        <label htmlFor="ProfilePhotoURL">Profile Photo URL</label>
                        <input type="text" id="ProfilePhotoURL" name="ProfilePhotoURL" value={formData.ProfilePhotoURL} onChange={handleChange} className="form-control" />
                    </div>
                </div>
                <div className="modal-footer">
                    <button onClick={handleClose} className="button-secondary">Cancel</button>
                    <button onClick={handleSave} className="button-primary">Save</button>
                </div>
            </div>
        </div>
    );
};

export default EditAdminProfileModal;
