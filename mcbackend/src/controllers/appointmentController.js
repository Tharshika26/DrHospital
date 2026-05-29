const asyncHandler = require("express-async-handler");
const Appointment = require("../models/Appointment");
const Patient = require("../models/Patient");
const Doctor = require("../models/Doctor");
const sendNotification = require("../utils/sendNotification");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT) || 465,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

// POST /api/appointments/book
const bookAppointment = asyncHandler(async (req, res) => {
    const { doctorId, serviceId, date, timeSlot } = req.body;
    let patient = await Patient.findOne({ user: req.user._id });
    if (!patient && req.user.role === "patient") {
        patient = await Patient.create({
            user: req.user._id,
            medicalHistory: []
        });
    }
    if (!patient) {
        res.status(400);
        throw new Error("Patient profile required");
    }
    const doctor = await Doctor.findById(doctorId).populate("user");
    if (!doctor) {
        res.status(404);
        throw new Error("Doctor not found");
    }

    // create appointment
    const appt = await Appointment.create({
        patient: patient._id,
        doctor: doctor._id,
        service: serviceId,
        date,
        timeSlot,
        status: "pending"
    });

    // notify doctor & patient (email) - best-effort
    try {
        const Service = require("../models/Service");
        const service = await Service.findById(serviceId);
        const serviceName = service ? service.name : "";
        const formattedDate = new Date(date).toLocaleDateString();

        // 1. Send confirmation email to Patient
        const mailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Appointment Booked Successfully</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f4f6f8; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed; background-color: #f4f6f8; padding: 40px 0;">
                <tr>
                    <td align="center">
                        <table border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); overflow: hidden; border: 1px solid #e2e8f0; text-align: left;">
                            <tr>
                                <td align="center" style="background: linear-gradient(135deg, #0f172a, #0d9488); padding: 40px 20px; color: #ffffff;">
                                    <div style="font-size: 28px; font-weight: bold; margin-bottom: 6px; letter-spacing: 1px;">Dr.HOSPITAL</div>
                                    <div style="font-size: 14px; color: #ccfbf1; opacity: 0.9;">Appointment Booking Confirmation</div>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding: 40px 30px;">
                                    <h2 style="margin: 0 0 15px 0; color: #1e293b; font-size: 20px; font-weight: 600;">Appointment Requested!</h2>
                                    <p style="margin: 0 0 25px 0; color: #475569; font-size: 15px; line-height: 1.6;">Hi ${req.user.name},</p>
                                    <p style="margin: 0 0 25px 0; color: #475569; font-size: 15px; line-height: 1.6;">Your appointment has been successfully requested. Below are the details of your visit:</p>
                                    
                                    <table border="0" cellpadding="12" cellspacing="0" width="100%" style="background-color: #f1f5f9; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid #0d9488;">
                                        <tr>
                                            <td style="font-size: 14px; color: #475569; font-weight: 600; width: 150px; border-bottom: 1px solid #e2e8f0;">Doctor:</td>
                                            <td style="font-size: 14px; color: #1e293b; font-weight: 700; border-bottom: 1px solid #e2e8f0;">Dr. ${doctor.user.name}</td>
                                        </tr>
                                        ${doctor.specialization ? `
                                        <tr>
                                            <td style="font-size: 14px; color: #475569; font-weight: 600; border-bottom: 1px solid #e2e8f0;">Specialization:</td>
                                            <td style="font-size: 14px; color: #1e293b; font-weight: 700; border-bottom: 1px solid #e2e8f0;">${doctor.specialization}</td>
                                        </tr>` : ''}
                                        ${serviceName ? `
                                        <tr>
                                            <td style="font-size: 14px; color: #475569; font-weight: 600; border-bottom: 1px solid #e2e8f0;">Service:</td>
                                            <td style="font-size: 14px; color: #1e293b; font-weight: 700; border-bottom: 1px solid #e2e8f0;">${serviceName}</td>
                                        </tr>` : ''}
                                        <tr>
                                            <td style="font-size: 14px; color: #475569; font-weight: 600; border-bottom: 1px solid #e2e8f0;">Date:</td>
                                            <td style="font-size: 14px; color: #1e293b; font-weight: 700; border-bottom: 1px solid #e2e8f0;">${formattedDate}</td>
                                        </tr>
                                        <tr>
                                            <td style="font-size: 14px; color: #475569; font-weight: 600; border-bottom: 1px solid #e2e8f0;">Time Slot:</td>
                                            <td style="font-size: 14px; color: #1e293b; font-weight: 700; border-bottom: 1px solid #e2e8f0;">${timeSlot}</td>
                                        </tr>
                                        <tr>
                                            <td style="font-size: 14px; color: #475569; font-weight: 600;">Status:</td>
                                            <td style="font-size: 14px; color: #0d9488; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Pending Approval</td>
                                        </tr>
                                    </table>

                                    <div style="background-color: #fffbeb; border: 1px solid #fef3c7; border-radius: 8px; padding: 15px; margin-bottom: 25px;">
                                        <p style="margin: 0; color: #b45309; font-size: 14px; font-weight: 500; line-height: 1.5;">
                                            <strong>Important Note:</strong> Please arrive at the clinic at least 10 minutes prior to your scheduled time.
                                        </p>
                                    </div>
                                    
                                    <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0;">
                                    <p style="margin: 0; color: #64748b; font-size: 13px; line-height: 1.5;">Thank you for choosing Dr.HOSPITAL. We are dedicated to providing you with the best healthcare services.</p>
                                </td>
                            </tr>
                            <tr>
                                <td style="background-color: #f8fafc; padding: 25px 30px; text-align: center; border-top: 1px solid #f1f5f9;">
                                    <p style="margin: 0; color: #94a3b8; font-size: 12px;">&copy; 2026 Dr.HOSPITAL. All rights reserved.</p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
        `;

        await transporter.sendMail({
            from: `"Dr.HOSPITAL Appointments" <${process.env.SMTP_USER}>`,
            to: req.user.email,
            subject: `Your Appointment Booking Confirmation - Dr.HOSPITAL`,
            text: `Hi ${req.user.name},\n\nYour appointment request with Dr. ${doctor.user.name} on ${formattedDate} at ${timeSlot} has been received and is pending approval.`,
            html: mailHtml
        });
        console.log(`[Email] Appointment confirmation successfully sent to patient ${req.user.email.replace(/^(.)(.*)(@.*)$/, "$1***$3")}`);

        // 2. Notify Doctor (email)
        await transporter.sendMail({
            from: `"Dr.HOSPITAL Portal" <${process.env.SMTP_USER}>`,
            to: doctor.user.email,
            subject: `New Appointment Request - Dr.HOSPITAL`,
            text: `Dear Dr. ${doctor.user.name},\n\nPatient ${req.user.name} has requested an appointment on ${formattedDate} at ${timeSlot}.\n\nPlease log in to your dashboard to review and approve/reject this request.`,
        });
        console.log(`[Email] Appointment notification successfully sent to doctor ${doctor.user.email.replace(/^(.)(.*)(@.*)$/, "$1***$3")}`);

    } catch (err) {
        console.warn("Failed to send booking notification emails", err.message);
    }

    res.status(201).json(appt);
});

// PUT /api/appointments/:id/respond  (doctor accepts/rejects)
const respondAppointment = asyncHandler(async (req, res) => {
    const appt = await Appointment.findById(req.params.id).populate("doctor").populate("patient");
    if (!appt) {
        res.status(404);
        throw new Error("Appointment not found");
    }

    // only doctor who owns appointment or admin can accept
    if (req.user.role !== "admin" && String(appt.doctor.user) !== String(req.user._id)) {
        res.status(403);
        throw new Error("Not allowed");
    }

    const { action } = req.body; // "confirm" or "reject"
    if (action === "confirm") appt.status = "confirmed";
    else if (action === "reject") appt.status = "rejected";

    await appt.save();

    // notify patient (placeholder)
    // patient user email retrieval omitted - expand as needed

    res.json(appt);
});

// POST /api/appointments/create-checkout-session
const createCheckoutSession = asyncHandler(async (req, res) => {
    const { doctorId, date, timeSlot, patientName, patientPhone, specialization } = req.body;
    console.log("Create Checkout Session Body:", req.body);

    const doctor = await Doctor.findById(doctorId).populate("user");
    if (!doctor) {
        console.error("Doctor not found for ID:", doctorId);
        res.status(404);
        throw new Error("Doctor not found");
    }

    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: `Appointment with ${doctor.user.name}`,
                            description: `Specialization: ${specialization} | Date: ${date} | Time: ${timeSlot}`,
                        },
                        unit_amount: 5000, // $50.00 placeholder
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment-cancelled`,
            metadata: {
                doctorId,
                date,
                timeSlot,
                patientName,
                patientPhone,
                userId: req.user._id.toString()
            }
        });

        res.json({ id: session.id });
    } catch (stripeError) {
        console.error("Stripe Checkout Session Error:", stripeError);
        res.status(400);
        throw new Error(stripeError.message);
    }
});

// POST /api/appointments (Staff/Admin creating appointment)
// POST /api/appointments (Staff/Admin creating appointment)
const saveAppointmentByStaff = asyncHandler(async (req, res) => {
    const { 
        patientId, 
        patientName,
        patientPhone,
        doctorId, 
        date, 
        timeSlot, 
        patientAge, 
        paymentMethod, 
        hospitalFee, 
        doctorFee, 
        totalAmount,
        status
    } = req.body;

    const mongoose = require("mongoose");

    const isPatientIdValid = patientId && mongoose.Types.ObjectId.isValid(patientId);
    let patientProfile = null;
    if (isPatientIdValid) {
        patientProfile = await Patient.findById(patientId).populate("user");
    }

    const isDoctorIdValid = doctorId && mongoose.Types.ObjectId.isValid(doctorId);
    let doctor = null;
    if (isDoctorIdValid) {
        doctor = await Doctor.findById(doctorId).populate("user");
    }
    if (!doctor) {
        res.status(404);
        throw new Error("Doctor not found");
    }

    const appt = await Appointment.create({
        patient: isPatientIdValid ? patientId : null,
        patientName: patientName || (patientProfile && patientProfile.user ? patientProfile.user.name : "Unknown"),
        patientPhone: patientPhone || (patientProfile ? patientProfile.contact : ""),
        doctor: isDoctorIdValid ? doctorId : null,
        date,
        timeSlot,
        patientAge,
        paymentMethod,
        hospitalFee: hospitalFee || 250,
        doctorFee: doctorFee || 1250,
        totalAmount: totalAmount || 1500,
        paymentStatus: "paid",
        status: status || "Scheduled"
    });

    // Update patient age if profile exists and age changed
    if (patientProfile && patientAge && patientProfile.age !== Number(patientAge)) {
        patientProfile.age = Number(patientAge);
        await patientProfile.save();
    }

    // notify doctor & patient (email) - best-effort
    try {
        const formattedDate = new Date(date).toLocaleDateString();

        let patientEmail = patientProfile?.user?.email;
        if (!patientEmail && patientProfile?.user) {
            const User = require("../models/User");
            const u = await User.findById(patientProfile.user);
            if (u) {
                patientEmail = u.email;
            }
        }
        if (!patientEmail && req.user && req.user.role === "patient") {
            patientEmail = req.user.email;
        }

        let resolvedPatientName = patientName;
        if (patientProfile) {
            if (patientProfile.user && patientProfile.user.name) {
                resolvedPatientName = patientProfile.user.name;
            } else if (patientProfile.user) {
                const User = require("../models/User");
                const u = await User.findById(patientProfile.user);
                if (u) {
                    resolvedPatientName = u.name;
                }
            }
        }
        if (!resolvedPatientName && req.user && req.user.role === "patient") {
            resolvedPatientName = req.user.name;
        }
        if (!resolvedPatientName) {
            resolvedPatientName = "Patient";
        }

        let doctorEmail = doctor?.user?.email;
        if (!doctorEmail && doctor?.user) {
            const User = require("../models/User");
            const u = await User.findById(doctor.user);
            if (u) {
                doctorEmail = u.email;
            }
        }

        let resolvedDoctorName = doctor?.user?.name;
        if (!resolvedDoctorName && doctor?.user) {
            const User = require("../models/User");
            const u = await User.findById(doctor.user);
            if (u) {
                resolvedDoctorName = u.name;
            }
        }
        if (!resolvedDoctorName) {
            resolvedDoctorName = "Specialist";
        }

        if (patientEmail) {
            // 1. Send confirmation email to Patient
            const mailHtml = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>Appointment Booked Successfully</title>
            </head>
            <body style="margin: 0; padding: 0; background-color: #f4f6f8; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed; background-color: #f4f6f8; padding: 40px 0;">
                    <tr>
                        <td align="center">
                            <table border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); overflow: hidden; border: 1px solid #e2e8f0; text-align: left;">
                                <tr>
                                    <td align="center" style="background: linear-gradient(135deg, #0f172a, #0d9488); padding: 40px 20px; color: #ffffff;">
                                        <div style="font-size: 28px; font-weight: bold; margin-bottom: 6px; letter-spacing: 1px;">Dr.HOSPITAL</div>
                                        <div style="font-size: 14px; color: #ccfbf1; opacity: 0.9;">Appointment Booking Confirmation</div>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 40px 30px;">
                                        <h2 style="margin: 0 0 15px 0; color: #1e293b; font-size: 20px; font-weight: 600;">Appointment Confirmed!</h2>
                                        <p style="margin: 0 0 25px 0; color: #475569; font-size: 15px; line-height: 1.6;">Hi ${resolvedPatientName},</p>
                                        <p style="margin: 0 0 25px 0; color: #475569; font-size: 15px; line-height: 1.6;">Your appointment has been successfully scheduled and confirmed. Below are the details of your visit:</p>
                                        
                                        <table border="0" cellpadding="12" cellspacing="0" width="100%" style="background-color: #f1f5f9; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid #0d9488;">
                                            <tr>
                                                <td style="font-size: 14px; color: #475569; font-weight: 600; width: 150px; border-bottom: 1px solid #e2e8f0;">Doctor:</td>
                                                <td style="font-size: 14px; color: #1e293b; font-weight: 700; border-bottom: 1px solid #e2e8f0;">Dr. ${resolvedDoctorName}</td>
                                            </tr>
                                            ${doctor.specialization ? `
                                            <tr>
                                                <td style="font-size: 14px; color: #475569; font-weight: 600; border-bottom: 1px solid #e2e8f0;">Specialization:</td>
                                                <td style="font-size: 14px; color: #1e293b; font-weight: 700; border-bottom: 1px solid #e2e8f0;">${doctor.specialization}</td>
                                            </tr>` : ''}
                                            <tr>
                                                <td style="font-size: 14px; color: #475569; font-weight: 600; border-bottom: 1px solid #e2e8f0;">Date:</td>
                                                <td style="font-size: 14px; color: #1e293b; font-weight: 700; border-bottom: 1px solid #e2e8f0;">${formattedDate}</td>
                                            </tr>
                                            <tr>
                                                <td style="font-size: 14px; color: #475569; font-weight: 600; border-bottom: 1px solid #e2e8f0;">Time Slot:</td>
                                                <td style="font-size: 14px; color: #1e293b; font-weight: 700; border-bottom: 1px solid #e2e8f0;">${timeSlot}</td>
                                            </tr>
                                            <tr>
                                                <td style="font-size: 14px; color: #475569; font-weight: 600;">Status:</td>
                                                <td style="font-size: 14px; color: #0d9488; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Confirmed</td>
                                            </tr>
                                        </table>

                                        <div style="background-color: #fffbeb; border: 1px solid #fef3c7; border-radius: 8px; padding: 15px; margin-bottom: 25px;">
                                            <p style="margin: 0; color: #b45309; font-size: 14px; font-weight: 500; line-height: 1.5;">
                                                <strong>Important Note:</strong> Please arrive at the clinic at least 10 minutes prior to your scheduled time.
                                            </p>
                                        </div>
                                        
                                        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0;">
                                        <p style="margin: 0; color: #64748b; font-size: 13px; line-height: 1.5;">Thank you for choosing Dr.HOSPITAL. We are dedicated to providing you with the best healthcare services.</p>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="background-color: #f8fafc; padding: 25px 30px; text-align: center; border-top: 1px solid #f1f5f9;">
                                        <p style="margin: 0; color: #94a3b8; font-size: 12px;">&copy; 2026 Dr.HOSPITAL. All rights reserved.</p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </body>
            </html>
            `;

            await transporter.sendMail({
                from: `"Dr.HOSPITAL Appointments" <${process.env.SMTP_USER}>`,
                to: patientEmail,
                subject: `Your Appointment Booking Confirmation - Dr.HOSPITAL`,
                text: `Hi ${resolvedPatientName},\n\nYour appointment with Dr. ${resolvedDoctorName} on ${formattedDate} at ${timeSlot} has been successfully scheduled and paid.`,
                html: mailHtml
            });
            console.log(`[Email] Appointment confirmation successfully sent to patient ${patientEmail.replace(/^(.)(.*)(@.*)$/, "$1***$3")}`);
        } else {
            console.warn("[Email] No patient email resolved, skipping confirmation email.");
        }

        if (doctorEmail) {
            // 2. Notify Doctor (email)
            await transporter.sendMail({
                from: `"Dr.HOSPITAL Portal" <${process.env.SMTP_USER}>`,
                to: doctorEmail,
                subject: `New Appointment Scheduled - Dr.HOSPITAL`,
                text: `Dear Dr. ${resolvedDoctorName},\n\nPatient ${resolvedPatientName} has scheduled an appointment on ${formattedDate} at ${timeSlot}.\n\nPlease log in to your dashboard to review this appointment.`,
            });
            console.log(`[Email] Appointment notification successfully sent to doctor ${doctorEmail.replace(/^(.)(.*)(@.*)$/, "$1***$3")}`);
        } else {
            console.warn("[Email] No doctor email resolved, skipping notification email.");
        }
    } catch (err) {
        console.error("Failed to send booking notification emails:", err);
    }

    res.status(201).json(appt);
});

// GET /api/appointments (Staff/Admin fetching all, or Doctor fetching theirs)
const getAllAppointments = asyncHandler(async (req, res) => {
    let query = {};
    
    // If user is a doctor, filter by their doctor profile
    if (req.user.role === "doctor") {
        const doctorProfile = await Doctor.findOne({ user: req.user._id });
        if (doctorProfile) {
            query.doctor = doctorProfile._id;
        }
    }

    // If user is a patient, filter by their patient profile
    if (req.user.role === "patient") {
        let patientProfile = await Patient.findOne({ user: req.user._id });
        if (!patientProfile) {
            patientProfile = await Patient.create({
                user: req.user._id,
                medicalHistory: []
            });
        }
        if (patientProfile) {
            query.patient = patientProfile._id;
        }
    }

    const appointments = await Appointment.find(query)
        .populate({
            path: "patient",
            populate: { path: "user", select: "name email contact" }
        })
        .populate({
            path: "doctor",
            populate: { path: "user", select: "name" }
        })
        .populate("service", "name")
        .sort("-createdAt");
    
    res.json(appointments);
});

// PUT /api/appointments/:id/condition
const updateAppointmentCondition = asyncHandler(async (req, res) => {
    const { clinicalCondition } = req.body;
    const appt = await Appointment.findById(req.params.id);
    
    if (!appt) {
        res.status(404);
        throw new Error("Appointment not found");
    }

    appt.clinicalCondition = clinicalCondition;
    await appt.save();

    // Also update the Patient's latest clinical condition
    if (appt.patient) {
        await Patient.findByIdAndUpdate(appt.patient, { clinicalCondition: clinicalCondition });
    }

    res.json(appt);
});

// PUT /api/appointments/:id/complete
const completeAppointment = asyncHandler(async (req, res) => {
    const appt = await Appointment.findById(req.params.id);
    
    if (!appt) {
        res.status(404);
        throw new Error("Appointment not found");
    }

    appt.status = "completed";
    await appt.save();

    res.json(appt);
});

module.exports = { 
    bookAppointment, 
    respondAppointment, 
    createCheckoutSession, 
    saveAppointmentByStaff, 
    getAllAppointments,
    updateAppointmentCondition,
    completeAppointment
};


