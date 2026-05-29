const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');

// Stripe initialization helper
const getStripe = () => {
    if (!process.env.STRIPE_SECRET_KEY) {
        throw new Error("STRIPE_SECRET_KEY is not defined in .env");
    }
    return require('stripe')(process.env.STRIPE_SECRET_KEY);
};

// @desc Create Stripe Checkout Session
// @route POST /api/payments/create-checkout-session
// @access Public (or Private if you prefer)
router.post('/create-checkout-session', asyncHandler(async (req, res) => {
    try {
        const { appointmentData, successUrl, cancelUrl } = req.body;
        console.log("Creating Stripe session for:", appointmentData?.doctorName);
        
        if (!process.env.STRIPE_SECRET_KEY) {
            console.error("STRIPE_SECRET_KEY is missing!");
            return res.status(500).json({ message: "Server configuration error: Stripe key missing" });
        }

        const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

        const baseSuccessUrl = successUrl || `http://localhost:5173/patient/appointments?success=true`;
        const baseCancelUrl = cancelUrl || `http://localhost:5173/patient/appointments?canceled=true`;

        // Sanitize metadata
        const sanitizedMetadata = {};
        if (appointmentData) {
            Object.keys(appointmentData).forEach(key => {
                sanitizedMetadata[key] = String(appointmentData[key]);
            });
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: `Medical Appointment with Dr. ${appointmentData.doctorName || 'Specialist'}`,
                            description: `Date: ${appointmentData.date} | Time: ${appointmentData.timeSlot} | Consultation for ${appointmentData.specialization || 'General'}`,
                        },
                        unit_amount: 480, // $4.80
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: baseSuccessUrl,
            cancel_url: baseCancelUrl,
            metadata: sanitizedMetadata
        });

        res.json({ id: session.id, url: session.url });
    } catch (error) {
        console.error('Stripe Session Error:', error);
        res.status(500).json({ message: error.message });
    }
}));

module.exports = router;
