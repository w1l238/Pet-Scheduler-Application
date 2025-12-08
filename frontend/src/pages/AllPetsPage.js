import React from "react";
import AllPets from "../components/AllPets";
import usePageTitle from '../hooks/usePageTitle';

function AllPetsPage() {
    usePageTitle('Admin - All Pets', '/favicon.ico');
    return (
        <AllPets />
    );
}

export default AllPetsPage;