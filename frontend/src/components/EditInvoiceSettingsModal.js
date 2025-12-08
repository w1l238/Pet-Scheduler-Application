import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom'; // Import ReactDOM
import './EditInvoiceSettingsModal.css';

const EditInvoiceSettingsModal = ({ settings, onSave, onClose }) => {
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
            <div className="modal-content invoice-settings-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Edit Invoice Settings</h2>
                    <button onClick={handleClose} className="close-button">&times;</button>
                </div>
                <div className="modal-body">
                    <div className="form-group">
                        <label htmlFor="invoice_due_days">Default Due Date (in days)</label>
                        <input
                            type="number"
                            id="invoice_due_days"
                            name="invoice_due_days"
                            value={localSettings.invoice_due_days || '30'}
                            onChange={handleChange}
                            className="form-control"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="invoice_footer">Custom Invoice Footer</label>
                        <textarea
                            id="invoice_footer"
                            name="invoice_footer"
                            value={localSettings.invoice_footer || ''}
                            onChange={handleChange}
                            rows="4"
                            className="form-control"
                        ></textarea>
                    </div>
                </div>
                <div className="modal-footer">
                    <button onClick={handleClose} className="button-secondary">Cancel</button>
                    <button onClick={handleSave} className="button-primary">Save</button>
                </div>
            </div>
        </div>,
        portalNode
    );
};

export default EditInvoiceSettingsModal;
