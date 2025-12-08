import React, { useState, useEffect } from 'react';
import api from '../api';
import './AdminSettingsPage.css';
import EditEmailTemplatesModal from '../components/EditEmailTemplatesModal';
import EditInvoiceSettingsModal from '../components/EditInvoiceSettingsModal';
import EditBookingRulesModal from '../components/EditBookingRulesModal';
import EditBusinessProfileModal from '../components/EditBusinessProfileModal';
import usePageTitle from '../hooks/usePageTitle';

const AdminSettingsPage = () => {
    usePageTitle('Admin - Settings', '/favicon.ico');
    const [settings, setSettings] = useState({
        invoice_due_days: '30',
        invoice_footer: '',
        invoice_paid_subject: '',
        invoice_paid_body: '',
        booking_minimum_notice_hours: '24',
        cancellation_policy: '',
        business_name: '',
        business_address: '',
        business_phone: '',
        business_email: '',
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
    const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [isBusinessModalOpen, setIsBusinessModalOpen] = useState(false);
    const [pageLoaded, setPageLoaded] = useState(false); // State for animation

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await api.get('/settings');
                setSettings(prev => ({ ...prev, ...response.data }));
                setIsLoading(false);
            } catch (err) {
                setError('Failed to load settings.');
                setIsLoading(false);
            }
        };
        fetchSettings();
    }, []);

    useEffect(() => {
        if (!isLoading) {
            // A short delay ensures the initial state is rendered before the transition begins
            const timer = setTimeout(() => setPageLoaded(true), 150);
            return () => clearTimeout(timer);
        }
    }, [isLoading]);

    const handleSave = async (updatedSettings) => {
        setSuccess(null);
        setError(null);
        try {
            await api.put('/settings', updatedSettings);
            setSettings(updatedSettings);
            setSuccess('Settings updated successfully!');
            setIsEmailModalOpen(false); // Close email modal on save
            setIsInvoiceModalOpen(false); // Close invoice modal on save
            setIsBookingModalOpen(false); // Close booking modal on save
            setIsBusinessModalOpen(false); // Close business modal on save
        } catch (err) {
            setError('Failed to update settings.');
        }
    };

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <div className={`admin-settings-page ${pageLoaded ? 'loaded' : ''}`}>
            <h1>Admin Settings</h1>
            
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            <div className="settings-cards-container">
                <div className="settings-section">
                    <h3>Business Profile</h3>
                    <p>Manage your business's core information.</p>
                    <button onClick={() => setIsBusinessModalOpen(true)} className="button-primary">
                        Edit Business Profile
                    </button>
                </div>

                <div className="settings-section">
                    <h3>Email Templates</h3>
                    <p>Configure the content of automated reminder emails.</p>
                    <button onClick={() => setIsEmailModalOpen(true)} className="button-primary">
                        Edit Email Templates
                    </button>
                </div>

                <div className="settings-section">
                    <h3>Invoice Settings</h3>
                    <p>Configure default settings for new invoices.</p>
                    <button onClick={() => setIsInvoiceModalOpen(true)} className="button-primary">
                        Edit Invoice Settings
                    </button>
                </div>

                <div className="settings-section">
                    <h3>Booking & Appointment Rules</h3>
                    <p>Set rules for client bookings and cancellations.</p>
                    <button onClick={() => setIsBookingModalOpen(true)} className="button-primary">
                        Edit Booking Rules
                    </button>
                </div>
            </div>

            {isBusinessModalOpen && (
                <EditBusinessProfileModal
                    settings={settings}
                    onSave={handleSave}
                    onClose={() => setIsBusinessModalOpen(false)}
                />
            )}

            {isEmailModalOpen && (
                <EditEmailTemplatesModal
                    settings={settings}
                    onSave={handleSave}
                    onClose={() => setIsEmailModalOpen(false)}
                />
            )}

            {isInvoiceModalOpen && (
                <EditInvoiceSettingsModal
                    settings={settings}
                    onSave={handleSave}
                    onClose={() => setIsInvoiceModalOpen(false)}
                />
            )}

            {isBookingModalOpen && (
                <EditBookingRulesModal
                    settings={settings}
                    onSave={handleSave}
                    onClose={() => setIsBookingModalOpen(false)}
                />
            )}
        </div>
    );
};

export default AdminSettingsPage;

