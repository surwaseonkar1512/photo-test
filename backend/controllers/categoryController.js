import Category from '../models/Category.js';

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
export const getCategories = async (req, res, next) => {
    try {
        const categories = await Category.find({})
            .populate('coverImage')
            .sort({ order: 1 });
        res.json(categories);
    } catch (error) {
        next(error);
    }
};

// @desc    Get category by ID
// @route   GET /api/categories/:id
// @access  Public
export const getCategoryById = async (req, res, next) => {
    try {
        const category = await Category.findById(req.params.id).populate('coverImage');
        if (category) {
            res.json(category);
        } else {
            res.status(404);
            throw new Error('Category not found');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Create a category
// @route   POST /api/categories
// @access  Private/Admin
export const createCategory = async (req, res, next) => {
    try {
        const { name, slug, description, coverImage, order } = req.body;

        const categoryExists = await Category.findOne({ slug });

        if (categoryExists) {
            res.status(400);
            throw new Error('Category slug already exists');
        }

        const category = await Category.create({
            name,
            slug,
            description,
            coverImage,
            order
        });

        res.status(201).json(category);
    } catch (error) {
        next(error);
    }
};

// @desc    Update a category
// @route   PUT /api/categories/:id
// @access  Private/Admin
export const updateCategory = async (req, res, next) => {
    try {
        const category = await Category.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (category) {
            res.json(category);
        } else {
            res.status(404);
            throw new Error('Category not found');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
export const deleteCategory = async (req, res, next) => {
    try {
        const category = await Category.findById(req.params.id);

        if (category) {
            await Category.deleteOne({ _id: category._id });
            res.json({ message: 'Category removed' });
        } else {
            res.status(404);
            throw new Error('Category not found');
        }
    } catch (error) {
        next(error);
    }
};
