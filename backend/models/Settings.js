import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
    siteName: {
        type: String,
        default: 'Photography Portfolio'
    },
    companyLogoUrl: String,
    navbarLogoUrl: String,
    footerLogoUrl: String,
    logoUrl: String, // Fallback for legacy
    contactEmail: String,
    contactPhone: String,
    socialLinks: {
        instagram: String,
        facebook: String,
        twitter: String,
        youtube: String,
        linkedin: String,
        whatsapp: String
    },
    aboutText: String,
    aboutImage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Media'
    },
    seoDescription: String,
    seoKeywords: String
}, { timestamps: true });

const Settings = mongoose.model('Settings', settingsSchema);
export default Settings;
