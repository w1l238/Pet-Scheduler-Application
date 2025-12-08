import React from "react";
import InvoiceManager from "../components/InvoiceManager";
import usePageTitle from '../hooks/usePageTitle';

function AllInvoicesPage() {
    usePageTitle('Admin - All Invoices', '/favicon.ico');
    return (
        <InvoiceManager />
    );
}

export default AllInvoicesPage;