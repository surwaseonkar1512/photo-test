import PricingCategory from '../models/PricingCategory.js';

// @desc    Get all pricing categories
// @route   GET /api/pricing-categories
// @access  Public
export const getPricingCategories = async (req, res, next) => {
    try {
        const categories = await PricingCategory.find({}).sort({ order: 1 });
        res.json(categories);
    } catch (error) {
        next(error);
    }
};

// @desc    Create a pricing category
// @route   POST /api/pricing-categories
// @access  Private/Admin
export const createPricingCategory = async (req, res, next) => {
    try {
        const { name, slug, description, order } = req.body;
        const category = await PricingCategory.create({ name, slug, description, order });
        res.status(201).json(category);
    } catch (error) {
        next(error);
    }
};

// @desc    Update a pricing category
// @route   PUT /api/pricing-categories/:id
// @access  Private/Admin
export const updatePricingCategory = async (req, res, next) => {
    try {
        const category = await PricingCategory.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!category) {
            res.status(404);
            throw new Error('Category not found');
        }
        res.json(category);
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a pricing category
// @route   DELETE /api/pricing-categories/:id
// @access  Private/Admin
export const deletePricingCategory = async (req, res, next) => {
    try {
        const category = await PricingCategory.findById(req.params.id);
        if (!category) {
            res.status(404);
            throw new Error('Category not found');
        }
        await PricingCategory.deleteOne({ _id: category._id });
        res.json({ message: 'Category removed' });
    } catch (error) {
        next(error);
    }
};
