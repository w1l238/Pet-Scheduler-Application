// Placeholder for SMS service integration (e.g. Twilio)

const sendSMS = async (to, body) => {
    console.log('--- SIMULATING SMS ---');
    console.log(`To: ${to}`);
    console.log(`Body: ${body}`);
    console.log('--------------------');

    // Twilio implementation example
    // const twilio = require('twilio');
    // const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    // await client.messages.create({
    //     body: body,
    //     from, process.env.TWILIO_PHONE_NUMBER,
    //     to: to
    // });
    return Promise.resolve({ sid: 'SM_SIMULATED_ID' });
};

module.exports = { sendSMS };