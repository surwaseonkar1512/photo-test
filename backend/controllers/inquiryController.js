import Inquiry from '../models/Inquiry.js';
import sendEmail from '../utils/sendEmail.js';

// @desc    Get all inquiries
// @route   GET /api/inquiries
// @access  Private/Admin
export const getInquiries = async (req, res, next) => {
    try {
        const inquiries = await Inquiry.find({}).sort({ createdAt: -1 });
        res.json(inquiries);
    } catch (error) {
        next(error);
    }
};

// @desc    Create an inquiry
// @route   POST /api/inquiries
// @access  Public
export const createInquiry = async (req, res, next) => {
    try {
        const { name, email, phone, serviceType, eventType, package: selectedPackage, datePreference, eventDate, message } = req.body;

        const inquiry = await Inquiry.create({
            name,
            email,
            phone,
            serviceType: serviceType || eventType,
            package: selectedPackage,
            datePreference,
            eventDate,
            message
        });

        // Send email to admin
        try {
            await sendEmail({
                email: process.env.SMTP_USER,
                subject: `New Inquiry from ${inquiry.name}`,
                message: `You have a new inquiry:\n\nName: ${inquiry.name}\nEmail: ${inquiry.email}\nPhone: ${inquiry.phone || 'N/A'}\nMessage: ${inquiry.message}`
            });
        } catch (error) {
            console.error('Error sending email notification for inquiry', error);
        }

        res.status(201).json(inquiry);
    } catch (error) {
        next(error);
    }
};

// @desc    Update inquiry status
// @route   PUT /api/inquiries/:id
// @access  Private/Admin
export const updateInquiryStatus = async (req, res, next) => {
    try {
        const inquiry = await Inquiry.findById(req.params.id);

        if (inquiry) {
            inquiry.status = req.body.status || inquiry.status;
            const updatedInquiry = await inquiry.save();
            res.json(updatedInquiry);
        } else {
            res.status(404);
            throw new Error('Inquiry not found');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Delete inquiry
// @route   DELETE /api/inquiries/:id
// @access  Private/Admin
export const deleteInquiry = async (req, res, next) => {
    try {
        const inquiry = await Inquiry.findById(req.params.id);

        if (inquiry) {
            await Inquiry.deleteOne({ _id: inquiry._id });
            res.json({ message: 'Inquiry removed' });
        } else {
            res.status(404);
            throw new Error('Inquiry not found');
        }
    } catch (error) {
        next(error);
    }
};
