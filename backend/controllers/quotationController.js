import Quotation from '../models/Quotation.js';
import Lead from '../models/Lead.js';
import Settings from '../models/Settings.js';
import { generatePDF } from '../utils/pdfGenerator.js';
import cloudinary from 'cloudinary';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import sendEmail from '../utils/sendEmail.js';

// @desc    Create a new Quotation & PDF
// @route   POST /api/quotations
// @access  Private/Admin
export const createQuotation = async (req, res, next) => {
    try {
        const { 
            leadId, 
            templateData, 
            actualPrice, 
            sellingPrice, 
            gstPercentage, 
            gstType, 
            gst, 
            finalAmount 
        } = req.body;

        const lead = await Lead.findById(leadId);
        if (!lead) {
            res.status(404);
            throw new Error('Lead not found');
        }

        // Fetch Branding Settings
        const settings = await Settings.findOne() || {};

        const quotationNumber = `QUO-${Date.now().toString().slice(-6)}`;
        const pdfFileName = `${quotationNumber}.pdf`;
        const tempPath = path.join(process.cwd(), 'tmp', pdfFileName);

        // Ensure tmp directory exists
        if (!fs.existsSync(path.join(process.cwd(), 'tmp'))) {
            fs.mkdirSync(path.join(process.cwd(), 'tmp'));
        }

        // Generate PDF
        await generatePDF({
            ...templateData,
            quotationNumber,
            actualPrice,
            sellingPrice,
            gstPercentage,
            gstType,
            gst,
            finalAmount,
            studioName: settings.siteName || 'Visionary Studio',
            logo: settings.companyLogoUrl || settings.logoUrl,
            contactEmail: settings.contactEmail,
            contactPhone: settings.contactPhone,
            website: process.env.FRONTEND_URL || 'www.visionarystudio.com'
        }, tempPath);

        // Verify File exists and has content
        const stats = fs.statSync(tempPath);
        if (stats.size === 0) {
            throw new Error('Generated PDF is empty. Corruption detected.');
        }
        console.log(`PDF Generated successfully: ${stats.size} bytes`);

        // 2. Upload to Cloudinary
        console.log('Uploading to Cloudinary...');
        const uniquePublicId = `${quotationNumber}-${Date.now()}`;
        const uploadResult = await cloudinary.v2.uploader.upload(tempPath, {
            folder: 'quotations',
            resource_type: 'image', 
            public_id: uniquePublicId, // No extension here
            format: 'pdf' // Upload as PDF
        });
        console.log('Upload successful:', uploadResult.secure_url);

        // 3. Save to Database (Convert PDF to PNG URL for better viewing)
        // Cloudinary URL format: .../upload/v123/folder/public_id.pdf -> change to .png
        const pngUrl = uploadResult.secure_url.replace(/\.pdf$/, '.png');
        
        const quotation = await Quotation.create({
            leadId,
            quotationNumber,
            pdfUrl: pngUrl, // Store PNG version
            pdfPublicId: uploadResult.public_id,
            actualPrice,
            sellingPrice,
            gstPercentage,
            gstType,
            gst,
            finalAmount,
            status: 'draft'
        });

        // 4. Update Lead status and amounts
        lead.status = 'quotation-sent';
        lead.totalAmount = finalAmount;
        await lead.save();

        // 5. Cleanup local file
        fs.unlinkSync(tempPath);

        res.status(201).json(quotation);
    } catch (error) {
        next(error);
    }
};

// @desc    Get quotations for a lead
// @route   GET /api/quotations/lead/:leadId
// @access  Private/Admin
export const getLeadQuotations = async (req, res, next) => {
    try {
        const quotations = await Quotation.find({ leadId: req.params.leadId }).sort({ createdAt: -1 });
        res.json(quotations);
    } catch (error) {
        next(error);
    }
};

// @desc    Get all quotations
// @route   GET /api/quotations
// @access  Private/Admin
export const getAllQuotations = async (req, res, next) => {
    try {
        const quotations = await Quotation.find({}).populate('leadId', 'name email').sort({ createdAt: -1 });
        res.json(quotations);
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a quotation
// @route   DELETE /api/quotations/:id
// @access  Private/Admin
export const deleteQuotation = async (req, res, next) => {
    try {
        const quotation = await Quotation.findById(req.params.id);

        if (quotation) {
            // Delete from Cloudinary
            if (quotation.pdfPublicId) {
                await cloudinary.v2.uploader.destroy(quotation.pdfPublicId, { resource_type: 'raw' });
            }
            await Quotation.deleteOne({ _id: quotation._id });
            res.json({ message: 'Quotation removed' });
        } else {
            res.status(404);
            throw new Error('Quotation not found');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Send Quotation via Email
// @route   POST /api/quotations/send-email
// @access  Private/Admin
export const sendQuotationEmail = async (req, res, next) => {
    try {
        const { quotationId } = req.body;
        const quotation = await Quotation.findById(quotationId).populate('leadId');

        if (!quotation) {
            res.status(404);
            throw new Error('Quotation not found');
        }

        const lead = quotation.leadId;
        
        await sendEmail({
            email: lead.email,
            subject: `Quotation for your ${lead.category || 'shoot'} - Visionary Studio`,
            message: `Hi ${lead.name},\n\nPlease find attached your photography quotation: ${quotation.quotationNumber}.\n\nView Online: ${quotation.pdfUrl}\n\nLooking forward to working with you!\n\nBest regards,\nVisionary Studio`
        });

        quotation.status = 'sent';
        await quotation.save();

        res.json({ message: 'Email sent successfully' });
    } catch (error) {
        next(error);
    }
};
