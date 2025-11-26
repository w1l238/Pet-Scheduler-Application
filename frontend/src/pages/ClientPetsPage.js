import React, { useState } from "react";
import PetManager from '../components/PetManager';
import AddPetModal from '../components/AddPetModal';
import './Dashboard.css';

function ClientPetsPage() {
    const [version, setVersion] = useState(0);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const handlePetAdded = () => {
        setVersion(v => v + 1);
    };

    const handlePetDeleted = () => {
        setVersion(v => v + 1);
    };

    const openAddModal = () => setIsAddModalOpen(true);
    const closeAddModal = () => setIsAddModalOpen(false);

    return (
        <div>
            <div className="section-header-with-button">
                <h1>Manage Pets</h1>
                <button onClick={openAddModal} className="add-button">Add Pet</button>
            </div>
            <div>
                <PetManager version={version} onPetDeleted={handlePetDeleted} />
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
