import Lead from '../models/Lead.js';
import sendEmail from '../utils/sendEmail.js';

// @desc    Get all leads
// @route   GET /api/leads
// @access  Private/Admin
export const getLeads = async (req, res, next) => {
    try {
        const leads = await Lead.find({}).sort({ createdAt: -1 });
        res.json(leads);
    } catch (error) {
        next(error);
    }
};

// @desc    Create a lead (Website)
// @route   POST /api/leads
// @access  Public
export const createLead = async (req, res, next) => {
    try {
        const { name, email, phone, serviceType, package: selectedPackage, eventDate, message, source, category, location } = req.body;

        const lead = await Lead.create({
            name,
            email,
            phone,
            category: category || serviceType,
            package: selectedPackage,
            eventDate,
            message,
            source: source || 'contact',
            location
        });

        // Send email to admin
        try {
            await sendEmail({
                email: process.env.SMTP_USER,
                subject: `New Lead from ${lead.name} (${lead.source})`,
                message: `You have a new lead:\n\nName: ${lead.name}\nSource: ${lead.source}\nEmail: ${lead.email}\nPhone: ${lead.phone || 'N/A'}\nMessage: ${lead.message || 'N/A'}`
            });
        } catch (error) {
            console.error('Error sending email notification for lead', error);
        }

        res.status(201).json(lead);
    } catch (error) {
        next(error);
    }
};

// @desc    Update lead (Drag & Drop or Manual Edit)
// @route   PUT /api/leads/:id
// @access  Private/Admin
export const updateLead = async (req, res, next) => {
    try {
        const lead = await Lead.findById(req.params.id);

        if (lead) {
            lead.name = req.body.name || lead.name;
            lead.email = req.body.email || lead.email;
            lead.phone = req.body.phone || lead.phone;
            lead.status = req.body.status || lead.status;
            lead.category = req.body.category || lead.category;
            lead.package = req.body.package || lead.package;
            lead.eventDate = req.body.eventDate || lead.eventDate;
            lead.location = req.body.location || lead.location;
            lead.notes = req.body.notes !== undefined ? req.body.notes : lead.notes;
            
            // Payment fields
            if (req.body.totalAmount !== undefined) lead.totalAmount = req.body.totalAmount;
            if (req.body.receivedAmount !== undefined) lead.receivedAmount = req.body.receivedAmount;

            const updatedLead = await lead.save();
            res.json(updatedLead);
        } else {
            res.status(404);
            throw new Error('Lead not found');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Update lead status only (Drag & Drop)
// @route   PATCH /api/leads/:id/status
// @access  Private/Admin
export const updateLeadStatus = async (req, res, next) => {
    try {
        const lead = await Lead.findById(req.params.id);

        if (lead) {
            lead.status = req.body.status;
            const updatedLead = await lead.save();
            res.json(updatedLead);
        } else {
            res.status(404);
            throw new Error('Lead not found');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Delete lead
// @route   DELETE /api/leads/:id
// @access  Private/Admin
export const deleteLead = async (req, res, next) => {
    try {
        const lead = await Lead.findById(req.params.id);

        if (lead) {
            await Lead.deleteOne({ _id: lead._id });
            res.json({ message: 'Lead removed' });
        } else {
            res.status(404);
            throw new Error('Lead not found');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Get Revenue Dashboard Analytics
// @route   GET /api/leads/analytics/revenue
// @access  Private/Admin
export const getRevenueAnalytics = async (req, res, next) => {
    try {
        const leads = await Lead.find({});
        
        const wonLeads = leads.filter(l => l.status === 'won');
        
        const analytics = {
            totalRevenue: wonLeads.reduce((acc, lead) => acc + (lead.totalAmount || 0), 0),
            receivedRevenue: wonLeads.reduce((acc, lead) => acc + (lead.receivedAmount || 0), 0),
            pendingRevenue: wonLeads.reduce((acc, lead) => acc + (lead.remainingAmount || 0), 0),
            totalLeads: leads.length,
            wonLeadsCount: wonLeads.length,
            conversionRate: leads.length > 0 ? (wonLeads.length / leads.length * 100).toFixed(1) : 0,
            leadsBySource: {
                manual: leads.filter(l => l.source === 'manual').length,
                contact: leads.filter(l => l.source === 'contact').length,
                pricing: leads.filter(l => l.source === 'pricing').length,
            }
        };
        
        res.json(analytics);
    } catch (error) {
        next(error);
    }
};
