import Pricing from '../models/Pricing.js';

// @desc    Get all pricing packages
// @route   GET /api/pricing
// @access  Public
export const getPricingPackages = async (req, res, next) => {
    try {
        const packages = await Pricing.find({ status: 'active' })
            .populate('category')
            .sort({ order: 1 });
        res.json(packages);
    } catch (error) {
        next(error);
    }
};

// @desc    Get all pricing packages for Admin
// @route   GET /api/pricing/admin/all
// @access  Private/Admin
export const getAdminPricingPackages = async (req, res, next) => {
    try {
        const packages = await Pricing.find({})
            .populate('category')
            .sort({ order: 1 });
        res.json(packages);
    } catch (error) {
        next(error);
    }
};

// @desc    Create a pricing package
// @route   POST /api/pricing
// @access  Private/Admin
export const createPricingPackage = async (req, res, next) => {
    try {
        const { 
            packageName, category, isPopular, sellingPrice, 
            actualPrice, description, features, addOns, status, order 
        } = req.body;

        const pricing = await Pricing.create({
            packageName, category, isPopular, sellingPrice,
            actualPrice, description, features, addOns, status, order
        });

        res.status(201).json(pricing);
    } catch (error) {
        next(error);
    }
};

// @desc    Update a pricing package
// @route   PUT /api/pricing/:id
// @access  Private/Admin
export const updatePricingPackage = async (req, res, next) => {
    try {
        const pricing = await Pricing.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (pricing) {
            res.json(pricing);
        } else {
            res.status(404);
            throw new Error('Pricing package not found');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a pricing package
// @route   DELETE /api/pricing/:id
// @access  Private/Admin
export const deletePricingPackage = async (req, res, next) => {
    try {
        const pricing = await Pricing.findById(req.params.id);

        if (pricing) {
            await Pricing.deleteOne({ _id: pricing._id });
            res.json({ message: 'Pricing package removed' });
        } else {
            res.status(404);
            throw new Error('Pricing package not found');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Toggle package status
// @route   PATCH /api/pricing/status/:id
// @access  Private/Admin
export const togglePackageStatus = async (req, res, next) => {
    try {
        const pkg = await Pricing.findById(req.params.id);
        if (!pkg) {
            res.status(404);
            throw new Error('Package not found');
        }
        pkg.status = pkg.status === 'active' ? 'inactive' : 'active';
        await pkg.save();
        res.json(pkg);
    } catch (error) {
        next(error);
    }
};
