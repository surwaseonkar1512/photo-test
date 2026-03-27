import Settings from '../models/Settings.js';

// @desc    Get site settings
// @route   GET /api/settings
// @access  Public
export const getSettings = async (req, res, next) => {
    try {
        let settings = await Settings.findOne();
        
        // If no settings exist, return default empty object
        if (!settings) {
            settings = await Settings.create({});
        }
        
        // Populate the aboutImage if present
        if (settings.aboutImage) {
            settings = await settings.populate('aboutImage');
        }

        res.json(settings);
    } catch (error) {
        next(error);
    }
};

// @desc    Update site settings
// @route   PUT /api/settings
// @access  Private/Admin
export const updateSettings = async (req, res, next) => {
    try {
        let settings = await Settings.findOne();

        if (settings) {
            // Update existing settings
            settings.siteName = req.body.siteName || settings.siteName;
            settings.companyLogoUrl = req.body.companyLogoUrl || settings.companyLogoUrl;
            settings.navbarLogoUrl = req.body.navbarLogoUrl || settings.navbarLogoUrl;
            settings.footerLogoUrl = req.body.footerLogoUrl || settings.footerLogoUrl;
            settings.logoUrl = req.body.companyLogoUrl || req.body.logoUrl || settings.logoUrl;
            settings.contactEmail = req.body.contactEmail || settings.contactEmail;
            settings.contactPhone = req.body.contactPhone || settings.contactPhone;
            settings.socialLinks = req.body.socialLinks || settings.socialLinks;
            settings.aboutText = req.body.aboutText || settings.aboutText;
            settings.aboutImage = req.body.aboutImage || settings.aboutImage;
            settings.seoDescription = req.body.seoDescription || settings.seoDescription;
            settings.seoKeywords = req.body.seoKeywords || settings.seoKeywords;

            const updatedSettings = await settings.save();
            res.json(updatedSettings);
        } else {
            // Create new if somehow doesn't exist
            settings = await Settings.create(req.body);
            res.status(201).json(settings);
        }
    } catch (error) {
        next(error);
    }
};
