import Testimonial from '../models/Testimonial.js';

// @desc    Get all testimonials
// @route   GET /api/testimonials
// @access  Public
export const getTestimonials = async (req, res, next) => {
    try {
        const testimonials = await Testimonial.find({})
            .populate('image')
            .sort({ createdAt: -1 });
        res.json(testimonials);
    } catch (error) {
        next(error);
    }
};

// @desc    Get active/featured testimonials
// @route   GET /api/testimonials/active
// @access  Public
export const getActiveTestimonials = async (req, res, next) => {
    try {
        const testimonials = await Testimonial.find({ isFeatured: true })
            .populate('image')
            .sort({ createdAt: -1 });
        res.json(testimonials);
    } catch (error) {
        next(error);
    }
};

// @desc    Create a testimonial
// @route   POST /api/testimonials
// @access  Private/Admin
export const createTestimonial = async (req, res, next) => {
    try {
        const testimonial = await Testimonial.create(req.body);
        res.status(201).json(testimonial);
    } catch (error) {
        next(error);
    }
};

// @desc    Update a testimonial
// @route   PUT /api/testimonials/:id
// @access  Private/Admin
export const updateTestimonial = async (req, res, next) => {
    try {
        const testimonial = await Testimonial.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (testimonial) {
            res.json(testimonial);
        } else {
            res.status(404);
            throw new Error('Testimonial not found');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a testimonial
// @route   DELETE /api/testimonials/:id
// @access  Private/Admin
export const deleteTestimonial = async (req, res, next) => {
    try {
        const testimonial = await Testimonial.findById(req.params.id);

        if (testimonial) {
            await Testimonial.deleteOne({ _id: testimonial._id });
            res.json({ message: 'Testimonial removed' });
        } else {
            res.status(404);
            throw new Error('Testimonial not found');
        }
    } catch (error) {
        next(error);
    }
};
