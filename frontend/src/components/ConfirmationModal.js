import React, { useEffect, useState } from 'react';
import './ConfirmationModal.css';

function ConfirmationModal({ show, message, onConfirm, onCancel }) {
    const [showContent, setShowContent] = useState(false); // Controls content visibility and animation
    const [isMounted, setIsMounted] = useState(false); // Controls if component is in DOM

    useEffect(() => {
        if (show) {
            setIsMounted(true); // Mount component
            // Small delay to allow CSS transition to play for overlay
            const timer = setTimeout(() => setShowContent(true), 10);
            return () => clearTimeout(timer);
        } else {
            setShowContent(false); // Start fade-out animation for content
            const timer = setTimeout(() => {
                setIsMounted(false); // Unmount component after animation
            }, 300); // Match CSS transition duration
            return () => clearTimeout(timer);
        }
    }, [show]);

    if (!isMounted) return null;

    return (
        <div className={`confirmation-modal-overlay ${showContent ? 'show' : ''}`} onClick={onCancel}>
            <div className={`confirmation-modal-content ${showContent ? '' : 'closing'}`} onClick={e => e.stopPropagation()}>
                <h2>Confirm Action</h2>
                <p>{message}</p>
                <div className="confirmation-modal-actions">
                    <button onClick={onConfirm} className="confirmation-modal-button confirm">Confirm</button>
                    <button onClick={onCancel} className="confirmation-modal-button cancel">Cancel</button>
                </div>
            </div>
        </div>
    );
}

export default ConfirmationModal;
