import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom'; // Import ReactDOM
import './EditEmailTemplatesModal.css';

const EditEmailTemplatesModal = ({ settings, onSave, onClose }) => {
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
            <div className="modal-content email-templates-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Edit Email Templates</h2>
                    <button onClick={handleClose} className="close-button">&times;</button>
                </div>
                <div className="modal-body">
                    <p>Use placeholders like <code>{`{{client_name}}`}</code>, <code>{`{{pet_name}}`}</code>, <code>{`{{appointment_date}}`}</code>, <code>{`{{appointment_time}}`}</code>, <code>{`{{amount}}`}</code>, <code>{`{{business_name}}`}</code>, <code>{`{{business_address}}`}</code>, <code>{`{{business_phone}}`}</code>, and <code>{`{{business_email}}`}</code> in the templates.</p>
                    
                    <div className="form-section">
                        <h3>24-Hour Reminder Email</h3>
                        <label htmlFor="email_reminder_24h_subject">Subject</label>
                        <input
                            type="text"
                            id="email_reminder_24h_subject"
                            name="email_reminder_24h_subject"
                            value={localSettings.email_reminder_24h_subject || ''}
                            onChange={handleChange}
                        />

                        <label htmlFor="email_reminder_24h_body">Body</label>
                        <textarea
                            id="email_reminder_24h_body"
                            name="email_reminder_24h_body"
                            value={localSettings.email_reminder_24h_body || ''}
                            onChange={handleChange}
                            rows="8"
                        ></textarea>
                    </div>

                    <div className="form-section">
                        <h3>1-Hour Reminder Email</h3>
                        <label htmlFor="email_reminder_1h_subject">Subject</label>
                        <input
                            type="text"
                            id="email_reminder_1h_subject"
                            name="email_reminder_1h_subject"
                            value={localSettings.email_reminder_1h_subject || ''}
                            onChange={handleChange}
                        />

                        <label htmlFor="email_reminder_1h_body">Body</label>
                        <textarea
                            id="email_reminder_1h_body"
                            name="email_reminder_1h_body"
                            value={localSettings.email_reminder_1h_body || ''}
                            onChange={handleChange}
                            rows="8"
                        ></textarea>
                    </div>

                    <div className="form-section">
                        <h3>Invoice Paid Email</h3>
                        <label htmlFor="invoice_paid_subject">Subject</label>
                        <input
                            type="text"
                            id="invoice_paid_subject"
                            name="invoice_paid_subject"
                            value={localSettings.invoice_paid_subject || ''}
                            onChange={handleChange}
                        />

                        <label htmlFor="invoice_paid_body">Body</label>
                        <textarea
                            id="invoice_paid_body"
                            name="invoice_paid_body"
                            value={localSettings.invoice_paid_body || ''}
                            onChange={handleChange}
                            rows="8"
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

export default EditEmailTemplatesModal;