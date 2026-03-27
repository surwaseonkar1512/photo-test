import Story from '../models/Story.js';

// @desc    Get all stories (published only for public)
// @route   GET /api/stories
// @access  Public
export const getStories = async (req, res, next) => {
    try {
        const stories = await Story.find({ status: 'published' })
            .populate('category')
            .populate('coverImage')
            .populate('images')
            .sort({ eventDate: -1, createdAt: -1 });
        res.json(stories);
    } catch (error) {
        next(error);
    }
};

// @desc    Get all stories (including drafts for Admin)
// @route   GET /api/stories/admin/all
// @access  Private/Admin
export const getAdminStories = async (req, res, next) => {
    try {
        const stories = await Story.find({})
            .populate('category')
            .populate('coverImage')
            .populate('images')
            .sort({ createdAt: -1 });
        res.json(stories);
    } catch (error) {
        next(error);
    }
};

// @desc    Get story by ID or Slug
// @route   GET /api/stories/:identifier
// @access  Public
export const getStoryByIdentifier = async (req, res, next) => {
    try {
        const { identifier } = req.params;
        let query;

        if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
            query = { _id: identifier };
        } else {
            query = { slug: identifier };
        }

        const story = await Story.findOne(query)
            .populate('category')
            .populate('coverImage')
            .populate('images');

        if (story) {
            res.json(story);
        } else {
            res.status(404);
            throw new Error('Story not found');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Create a story
// @route   POST /api/stories
// @access  Private/Admin
export const createStory = async (req, res, next) => {
    try {
        const { 
            title, slug, subTitle, slogan, description, category, 
            coverImage, images, videoUrls, highlights, eventDate, 
            clientName, location, status, isFeatured 
        } = req.body;

        const storyExists = await Story.findOne({ slug });

        if (storyExists) {
            res.status(400);
            throw new Error('Story slug already exists');
        }

        const story = await Story.create({
            title, slug, subTitle, slogan, description, category,
            coverImage, images, videoUrls, highlights, eventDate,
            clientName, location, status, isFeatured
        });

        res.status(201).json(story);
    } catch (error) {
        next(error);
    }
};

// @desc    Update a story
// @route   PUT /api/stories/:id
// @access  Private/Admin
export const updateStory = async (req, res, next) => {
    try {
        const story = await Story.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (story) {
            res.json(story);
        } else {
            res.status(404);
            throw new Error('Story not found');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a story
// @route   DELETE /api/stories/:id
// @access  Private/Admin
export const deleteStory = async (req, res, next) => {
    try {
        const story = await Story.findById(req.params.id);

        if (story) {
            await Story.deleteOne({ _id: story._id });
            res.json({ message: 'Story removed' });
        } else {
            res.status(404);
            throw new Error('Story not found');
        }
    } catch (error) {
        next(error);
    }
};
