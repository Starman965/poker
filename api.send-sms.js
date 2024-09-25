// Import the Twilio module
import twilio from 'twilio';

// Twilio credentials (you'll add these as environment variables later)
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

// Serverless function to send SMS
export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { message, phoneNumber } = req.body;

        try {
            // Send the SMS using Twilio
            const twilioMessage = await client.messages.create({
                body: message,
                to: phoneNumber,  // Recipient's phone number
                from: process.env.TWILIO_PHONE_NUMBER // Your Twilio phone number
            });

            // Return success response
            res.status(200).json({ success: true, messageSid: twilioMessage.sid });
        } catch (error) {
            // Return error response
            res.status(500).json({ success: false, error: error.message });
        }
    } else {
        res.status(405).json({ message: 'Only POST requests are allowed' });
    }
}
