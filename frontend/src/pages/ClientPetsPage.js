import React, { useState } from "react";
import PetManager from '../components/PetManager';
import AddPetModal from '../components/AddPetModal';
import usePageTitle from '../hooks/usePageTitle';
import './Dashboard.css';
import './ClientPetsPage.css'; // Import animation styles

function ClientPetsPage() {
    usePageTitle('Client - Pets', '/favicon.ico');
    const [version, setVersion] = useState(0);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isAnimated, setIsAnimated] = useState(false); // State for animation

    const handlePetAdded = () => {
        setVersion(v => v + 1);
    };

    const handlePetDeleted = () => {
        setVersion(v => v + 1);
    };

    const openAddModal = () => setIsAddModalOpen(true);
    const closeAddModal = () => setIsAddModalOpen(false);

    // Callback to be triggered by PetManager when it's done loading
    const handleLoadComplete = () => {
        // A short delay can sometimes help ensure all elements are ready
        setTimeout(() => setIsAnimated(true), 50);
    };

    return (
        <div className={`client-pets-page-layout ${isAnimated ? 'loaded' : ''}`}>
            <div className="section-header-with-button">
                <h1>Manage Pets</h1>
                <button onClick={openAddModal} className="add-button">Add Pet</button>
            </div>
            <div>
                <PetManager 
                    version={version} 
                    onPetDeleted={handlePetDeleted}
                    onLoadComplete={handleLoadComplete} 
                />
            </div>

            {isAddModalOpen && (
                <AddPetModal
                    onClose={closeAddModal}
                    onPetAdded={handlePetAdded}
                />
            )}
        </div>
    );
}

export default ClientPetsPage;
