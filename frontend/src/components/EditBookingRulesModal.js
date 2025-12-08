import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom'; // Import ReactDOM
import './EditBookingRulesModal.css';

const EditBookingRulesModal = ({ settings, onSave, onClose }) => {
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
            <div className="modal-content booking-rules-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Edit Booking & Appointment Rules</h2>
                    <button onClick={handleClose} className="close-button">&times;</button>
                </div>
                <div className="modal-body">
                    <div className="form-group">
                        <label htmlFor="booking_minimum_notice_hours">Minimum Booking Notice (in hours)</label>
                        <input
                            type="number"
                            id="booking_minimum_notice_hours"
                            name="booking_minimum_notice_hours"
                            value={localSettings.booking_minimum_notice_hours || '24'}
                            onChange={handleChange}
                            className="form-control"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="cancellation_policy">Cancellation Policy</label>
                        <textarea
                            id="cancellation_policy"
                            name="cancellation_policy"
                            value={localSettings.cancellation_policy || ''}
                            onChange={handleChange}
                            rows="8"
                            className="form-control"
                        ></textarea>
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

export default EditBookingRulesModal;
