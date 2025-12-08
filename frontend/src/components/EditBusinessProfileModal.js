import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom'; // Import ReactDOM
import './EditBusinessProfileModal.css';

const EditBusinessProfileModal = ({ settings, onSave, onClose }) => {
    const [localSettings, setLocalSettings] = useState(settings);
    const [showModal, setShowModal] = useState(false);
    const [portalNode, setPortalNode] = useState(null); // State to hold the portal DOM node

    useEffect(() => {
        // Create a div element to append to the body for the portal
        const node = document.createElement('div');
        document.body.appendChild(node);
        setPortalNode(node);

        // Cleanup function to remove the node when the component unmounts
        return () => {
            document.body.removeChild(node);
        };
    }, []); // Run only once on mount

    useEffect(() => {
        const timer = setTimeout(() => setShowModal(true), 10);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        setLocalSettings(settings);
    }, [settings]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setLocalSettings(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        onSave(localSettings);
    };

    const handleClose = () => {
        setShowModal(false);
        setTimeout(onClose, 300); // Wait for animation to finish
    };

    if (!portalNode) {
        return null; // Don't render until the portal node is ready
    }

    return ReactDOM.createPortal(
        <div className={`modal-overlay ${showModal ? 'show' : ''}`} onClick={handleClose}>
            <div className="modal-content business-profile-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Edit Business Profile</h2>
                    <button onClick={handleClose} className="close-button">&times;</button>
                </div>
                <div className="modal-body">
                    <div className="form-group">
                        <label htmlFor="business_name">Business Name</label>
                        <input
                            type="text"
                            id="business_name"
                            name="business_name"
                            value={localSettings.business_name || ''}
                            onChange={handleChange}
                            className="form-control"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="business_address">Address</label>
                        <input
                            type="text"
                            id="business_address"
                            name="business_address"
                            value={localSettings.business_address || ''}
                            onChange={handleChange}
                            className="form-control"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="business_phone">Phone Number</label>
                        <input
                            type="text"
                            id="business_phone"
                            name="business_phone"
                            value={localSettings.business_phone || ''}
                            onChange={handleChange}
                            className="form-control"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="business_email">Public Email Address</label>
                        <input
                            type="email"
                            id="business_email"
                            name="business_email"
                            value={localSettings.business_email || ''}
                            onChange={handleChange}
                            className="form-control"
                        />
                    </div>
                </div>
                <div className="modal-footer">
                    <button onClick={handleClose} className="button-secondary">Cancel</button>
                    <button onClick={handleSave} className="button-primary">Save Changes</button>
                </div>
            </div>
        </div>,
        portalNode
    );
};

export default EditBusinessProfileModal;
