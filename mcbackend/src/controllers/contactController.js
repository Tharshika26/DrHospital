const Contact = require('../models/Contact');

// @desc    Submit contact form
// @route   POST /api/contacts
// @access  Public
const submitContact = async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        if (!name || !email || !subject || !message) {
            return res.status(400).json({ message: 'Please fill in all fields.' });
        }

        const newContact = await Contact.create({
            name,
            email,
            subject,
            message
        });

        res.status(201).json({
            success: true,
            message: 'Your message has been sent successfully. We will get back to you soon!',
            data: newContact
        });
    } catch (error) {
        console.error('Contact Submission Error:', error);
        res.status(500).json({ message: 'Server error. Please try again later.' });
    }
};

// @desc    Get all contact messages (Admin only)
// @route   GET /api/contacts
// @access  Private/Admin
const getContacts = async (req, res) => {
    try {
        const contacts = await Contact.find().sort({ createdAt: -1 });
        res.status(200).json(contacts);
    } catch (error) {
        console.error('Fetch Contacts Error:', error);
        res.status(500).json({ message: 'Server error.' });
    }
};

module.exports = {
    submitContact,
    getContacts
};
