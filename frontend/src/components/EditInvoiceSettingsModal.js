import React, { useState, useEffect } from 'react';
import './EditInvoiceSettingsModal.css';

const EditInvoiceSettingsModal = ({ settings, onSave, onClose }) => {
    const [localSettings, setLocalSettings] = useState(settings);
    const [showModal, setShowModal] = useState(false);

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

    return (
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
        </div>
    );
};

export default EditInvoiceSettingsModal;
