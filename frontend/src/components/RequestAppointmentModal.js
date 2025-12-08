import React, { useState, useEffect } from 'react';
import api from '../api';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css'; // Import datepicker CSS
import './RequestAppointmentModal.css';

const decodeToken = (token) => {
    try {
        return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
        return null;
    }
};

function RequestAppointmentModal({ onClose, onAppointmentRequested }) {
    const [formData, setFormData] = useState({
        PetID: '',
        ServiceID: '',
        AppointmentTime: null, // Initialize as null for Date object
        Notes: '',
    });
    const [pets, setPets] = useState([]);
    const [services, setServices] = useState([]);
    const [bookedAppointments, setBookedAppointments] = useState([]); // For disabling times
    const [message, setMessage] = useState('');
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setShowModal(true), 10);

        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                const decodedToken = decodeToken(token);
                const clientId = decodedToken?.user?.id;

                // Fetch pets, services, and booked times concurrently
                const [petsRes, servicesRes, bookedTimesRes] = await Promise.all([
                    clientId ? api.get(`/clients/${clientId}/pets`) : Promise.resolve({ data: [] }),
                    api.get('/services'),
                    api.get('/public/appointments/booked-times')
                ]);

                setPets(petsRes.data);
                setServices(servicesRes.data);
                setBookedAppointments(bookedTimesRes.data.map(appt => ({
                    start: new Date(appt.start),
                    end: new Date(appt.end)
                })));

            } catch (err) {
                console.error('Failed to fetch data for form', err);
                setMessage('Could not load data for the appointment form.');
            }
        };
        fetchData();

        return () => clearTimeout(timer);
    }, []);

    const { PetID, ServiceID, AppointmentTime, Notes } = formData;

    const handleDateChange = (date) => {
        setFormData({ ...formData, AppointmentTime: date });
    };

    const filterTime = (time) => {
        if (!ServiceID) {
            return true; // Don't filter if no service is selected yet
        }

        const selectedService = services.find(s => s.serviceid === parseInt(ServiceID, 10));
        if (!selectedService) {
            return true;
        }

        const duration = selectedService.durationminutes;
        const requestedStart = new Date(time);
        const requestedEnd = new Date(requestedStart.getTime() + duration * 60000);

        // Check for overlap with any booked appointments
        const isOverlapping = bookedAppointments.some(appt =>
            (requestedStart < appt.end && requestedEnd > appt.start)
        );

        return !isOverlapping;
    };

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleClose = () => {
        setShowModal(false);
        setTimeout(onClose, 300);
    };


    const handleSubmit = async e => {
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
                Status: 'Pending',
                AppointmentTime: AppointmentTime.toISOString(), // Format for backend
            };

            await api.post('/appointments', appointmentData);
            setMessage('Appointment requested successfully!');
            if (onAppointmentRequested) {
                onAppointmentRequested();
            }
            handleClose();
        } catch (err) {
            console.error(err.response ? err.response.data : err.message);
            setMessage(err.response ? err.response.data.message : 'Server error');
        }
    };

    return (
        <div className={`modal-overlay ${showModal ? 'show' : ''}`} onClick={handleClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Request an Appointment</h2>
                    <button onClick={handleClose} className="close-button">&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="dashboard-form">
                    <div className="form-group">
                        <label>Pet</label>
                        <select name="PetID" value={PetID} onChange={onChange} required>
                            <option value="">Select a Pet</option>
                            {pets.map(pet => (
                                <option key={pet.petid} value={pet.petid}>{pet.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Service</label>
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
                        <label>Date and Time</label>
                        <DatePicker
                            selected={AppointmentTime}
                            onChange={handleDateChange}
                            showTimeSelect
                            use12Hours
                            dateFormat="MM/dd/yyyy h:mm aa"
                            minDate={new Date()} // Prevent selecting past dates
                            filterTime={filterTime} // Add this prop
                            timeFormat="h:mm aa"
                            timeIntervals={15}
                            timeCaption="Time"
                            placeholderText="Select date and time"
                            className="form-control" // Apply some basic styling
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Notes</label>
                        <textarea
                            placeholder="Notes for your appointment (e.g. allergies)"
                            name="Notes"
                            value={Notes}
                            onChange={onChange}
                        ></textarea>
                    </div>
                    <div className="modal-footer">
                        <button type="button" onClick={handleClose} className="cancel-button">Cancel</button>
                        <button type="submit" className="save-button">Request</button>
                    </div>
                </form>
                {message && <p className={`message ${message.includes('successfully') ? 'success' : ''}`}>{message}</p>}
            </div>
        </div>
    );
}

export default RequestAppointmentModal;
