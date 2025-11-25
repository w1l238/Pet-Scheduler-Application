import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { FiAlertCircle, FiCheckCircle } from 'react-icons/fi';

const statusIcons = {
    Unpaid: <FiAlertCircle />,
    Paid: <FiCheckCircle />,
};

function InvoiceManager() {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [version, setVersion] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortCriteria, setSortCriteria] = useState('date-desc');

    useEffect(() => {
        const fetchInvoices = async () => {
            setLoading(true);
            try {
                const res = await api.get('/invoices');
                setInvoices(res.data);
            } catch (err) {
                setError('Failed to fetch invoices.')
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchInvoices();
    }, [version]);

    const handleUpdateStatus = async (invoiceId, newStatus) => {
        try {
            // Find orignal invoice to get all properties for the PUT request
            const invoiceToUpdate = invoices.find(inv => inv.invoiceid === invoiceId);
            if (!invoiceToUpdate) {
                setError('Could not find invoice to update.');
                return;
            }

            const updatedInvoice = { ...invoiceToUpdate, status: newStatus };

            await api.put(`/invoices/${invoiceId}`, updatedInvoice);
            setVersion(v => v + 1); // Re-fetch to show changes
        } catch (err) {
            console.error('Failed to update invoice status', err);
            setError('Failed to update status. Please try again.');
        }
    };

    const filteredAndSortedInvoices = invoices
        .filter(invoice => {
            const searchTermLower = searchTerm.toLowerCase();
            return (
                invoice.invoiceid.toString().includes(searchTermLower) ||
                invoice.appointmentid.toString().includes(searchTermLower) ||
                invoice.status.toLowerCase().includes(searchTermLower) ||
                invoice.amount.toString().includes(searchTermLower)
            );
        })
        .sort((a, b) => {
            switch (sortCriteria) {
                case 'date-asc':
                    return new Date(a.createdat) - new Date(b.createdat);
                case 'date-desc':
                    return new Date(b.createdat) - new Date(a.createdat);
                case 'amount-asc':
                    return a.amount - b.amount;
                case 'amount-desc':
                    return b.amount - a.amount;
                default:
                    return 0;
            }
        });

    if (loading) {
        return <p>Loading invoices...</p>;
    }

    if (error) {
        return <p className="message">{error}</p>;
    }

    return (
        <div>
            <header class="dashboard-header">
                    <h1>All Invoices</h1>
                </header>
            <div className="controls">
                <input
                    type="text"
                    placeholder="Search by ID, Amount, or Status"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="search-input"
                />
                <select value={sortCriteria} onChange={e => setSortCriteria(e.target.value)} className="sort-select">
                    <option value="date-desc">Newest First</option>
                    <option value="date-asc">Oldest First</option>
                    <option value="amount-desc">Amount (High to Low)</option>
                    <option value="amount-asc">Amount (Low to High)</option>
                </select>
            </div>
            {filteredAndSortedInvoices.length === 0 ? (
                <p>No invoices matching your criteria.</p>
            ) : (
                <ul className="dashboard-list">
                    {filteredAndSortedInvoices.map(invoice => (
                        <li key={invoice.invoiceid} className={`dashboard-list-item status-bg-${invoice.status.toLowerCase()}`}>
                            <div className="item-details">
                                <strong>Invoice #{invoice.invoiceid}</strong> for <Link to="/admin/appointments" state={{ highlightedId: invoice.appointmentid }}>Appointment #{invoice.appointmentid}</Link> <br />
                                <strong>Amount:</strong> ${invoice.amount} <br />
                                <span className="status-line">
                                    <strong className="status-text">
                                        {statusIcons[invoice.status]}
                                        Status:
                                    </strong> {invoice.status}
                                </span> <br />
                                <strong>Due:</strong> {new Date(invoice.duedate).toLocaleDateString()}
                            </div>
                            <div className="item-actions">
                                {invoice.status === 'Unpaid' && (
                                    <button onClick={() => handleUpdateStatus(invoice.invoiceid, 'Paid')} className="paid-button">
                                        Mark as Paid
                                    </button>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default InvoiceManager;