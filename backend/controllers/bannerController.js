import Banner from '../models/Banner.js';

// @desc    Get all active banners
// @route   GET /api/banners
// @access  Public
export const getActiveBanners = async (req, res, next) => {
    try {
        const banners = await Banner.find({ isVisible: true })
            .populate('image')
            .sort({ order: 1 });
        res.json(banners);
    } catch (error) {
        next(error);
    }
};

// @desc    Get all banners
// @route   GET /api/banners/all
// @access  Private/Admin
export const getAllBanners = async (req, res, next) => {
    try {
        const banners = await Banner.find({})
            .populate('image')
            .sort({ order: 1 });
        res.json(banners);
    } catch (error) {
        next(error);
    }
};

// @desc    Create new banner
// @route   POST /api/banners
// @access  Private/Admin
export const createBanner = async (req, res, next) => {
    try {
        const banner = await Banner.create(req.body);
        res.status(201).json(banner);
    } catch (error) {
        next(error);
    }
};

// @desc    Update banner
// @route   PUT /api/banners/:id
// @access  Private/Admin
export const updateBanner = async (req, res, next) => {
    try {
        const banner = await Banner.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (banner) {
            res.json(banner);
        } else {
            res.status(404);
            throw new Error('Banner not found');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Delete banner
// @route   DELETE /api/banners/:id
// @access  Private/Admin
export const deleteBanner = async (req, res, next) => {
    try {
        const banner = await Banner.findById(req.params.id);

        if (banner) {
            await Banner.deleteOne({ _id: banner._id });
            res.json({ message: 'Banner removed' });
        } else {
            res.status(404);
            throw new Error('Banner not found');
        }
    } catch (error) {
        next(error);
    }
};
