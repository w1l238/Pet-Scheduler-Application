import React, { useState, useEffect } from 'react';
import api from '../api';

const decodeToken = (token) => {
    try {
        return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
        return null;
    }
};

function RequestAppointmentForm({ onAppointmentRequested }) {
    const [formData, setFormData] = useState({
        PetID: '',
        ServiceID: '',
        AppointmentTime: '',
        Notes: '',
    });
    const [pets, setPets] = useState([]);
    const [services, setServices] = useState([]);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Pets
                const token = localStorage.getItem('token');
                const decodedToken = decodeToken(token);
                const clientId = decodedToken?.user?.id;
                if (clientId) {
                    const petsRes = await api.get(`/clients/${clientId}/pets`);
                    setPets(petsRes.data);
                }

                // Fetch services (publically available)
                const servicesRes = await api.get('/services');
                setServices(servicesRes.data);
            } catch (err) {
                console.error('Failed to fetch data for form', err);
                setMessage('Could not load data for the appointment form.');
            }
        };
        fetchData();
    }, []);

    const { PetID, ServiceID, AppointmentTime, Notes } = formData;

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const decodedToken = decodeToken(token);
            const clientId = decodedToken?.user?.id;

            if (!clientId || !PetID || !ServiceID || !AppointmentTime) {
                setMessage('Please fill out all required fields.');
                return;
            }

            const appointmentData = {
                ...formData,
                ClientID: clientId,
                Status: 'Pending', // Appointments pend until approved
            };

            await api.post('/appointments', appointmentData);
            setMessage('Appointment requested sucessfully! You will be notified upon confirmation.');
            setFormData({ PetID: '', ServiceID: '', AppointmentTime: '', Notes: ''}); // Clear form
            if (onAppointmentRequested) {
                onAppointmentRequested();
            }
        } catch (err) {
            console.error(err.response ? err.response.data : err.message);
            setMessage(err.respone ? err.response.data.message : 'Server error');
        }
    };

    return (
        <div>
            <h4>Request an Appointment</h4>
            <form onSubmit={onSubmit} className="dashboard-form">
                <div className="form-group">
                    <select name="PetID" value={PetID} onChange={onChange} required>
                        <option value="">Select a Pet</option>
                        {pets.map(pet => (
                            <option key={pet.petid} value={pet.petid}>{pet.name}</option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <select name="ServiceID" value={ServiceID} onChange={onChange} required>
                        <option value="">Select a Service</option>
                        {services.map(service => (
                            <option key={service.serviceid} value={service.serviceid}>
                                {service.name} - ${service.price}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <input
                        type="datetime-local"
                        name="AppointmentTime"
                        value={AppointmentTime}
                        onChange={onChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <textarea
                        placeholder="Notes for your appointment"
                        name="Notes"
                        value={Notes}
                        onChange={onChange}
                    ></textarea>
                </div>
                <button type="submit">Request Appointment</button>
            </form>
            {message && <p className={`message ${message.includes('sucessfully') ? 'success' : ''}`}>{message}</p>}
        </div>
    );
}

export default RequestAppointmentForm;
