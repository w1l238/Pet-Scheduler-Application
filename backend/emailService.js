require('dotenv').config();
const nodemailer = require('nodemailer');

// Create a transporter using email service details from .env
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_PORT == 465,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
})

// Function to send an email
const sendEmail = async (to, subject, text, html) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER, // Sender address
            to, // List of recievers
            subject, // Subject line
            text, // Plain text body
            html, // HTML body
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email send: %s', info.messageId);
        return info;
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    
    }
};

module.exports = { sendEmail }