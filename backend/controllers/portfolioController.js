import Portfolio from '../models/Portfolio.js';

// @desc    Get all active portfolio items (Public)
// @route   GET /api/portfolio
// @access  Public
export const getPortfolio = async (req, res, next) => {
    try {
        const { category } = req.query;
        let query = { status: 'active' };
        
        if (category) {
            query.category = category; // Should be ID
        }

        const portfolio = await Portfolio.find(query)
            .populate('category', 'name slug')
            .populate('story', 'title slug')
            .sort({ order: 1, createdAt: -1 });
            
        res.json(portfolio);
    } catch (error) {
        next(error);
    }
};

// @desc    Get all portfolio items for admin
// @route   GET /api/admin/portfolio
// @access  Private/Admin
export const getAllAdminPortfolio = async (req, res, next) => {
    try {
        const portfolio = await Portfolio.find({})
            .populate('category', 'name slug')
            .populate('story', 'title slug')
            .sort({ order: 1, createdAt: -1 });
        res.json(portfolio);
    } catch (error) {
        next(error);
    }
};

// @desc    Create a portfolio item
// @route   POST /api/portfolio
// @access  Private/Admin
export const createPortfolioItem = async (req, res, next) => {
    try {
        const { image, title, category, story, tags, order, status } = req.body;

        const portfolioItem = await Portfolio.create({
            image,
            title,
            category,
            story,
            tags,
            order,
            status
        });

        res.status(201).json(portfolioItem);
    } catch (error) {
        next(error);
    }
};

// @desc    Update a portfolio item
// @route   PUT /api/portfolio/:id
// @access  Private/Admin
export const updatePortfolioItem = async (req, res, next) => {
    try {
        const portfolioItem = await Portfolio.findById(req.params.id);

        if (portfolioItem) {
            portfolioItem.image = req.body.image || portfolioItem.image;
            portfolioItem.title = req.body.title !== undefined ? req.body.title : portfolioItem.title;
            portfolioItem.category = req.body.category || portfolioItem.category;
            portfolioItem.story = req.body.story || portfolioItem.story;
            portfolioItem.tags = req.body.tags || portfolioItem.tags;
            portfolioItem.order = req.body.order !== undefined ? req.body.order : portfolioItem.order;
            portfolioItem.status = req.body.status || portfolioItem.status;

            const updatedItem = await portfolioItem.save();
            res.json(updatedItem);
        } else {
            res.status(404);
            throw new Error('Portfolio item not found');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a portfolio item
// @route   DELETE /api/portfolio/:id
// @access  Private/Admin
export const deletePortfolioItem = async (req, res, next) => {
    try {
        const portfolioItem = await Portfolio.findById(req.params.id);

        if (portfolioItem) {
            await Portfolio.deleteOne({ _id: portfolioItem._id });
            res.json({ message: 'Portfolio item removed' });
        } else {
            res.status(404);
            throw new Error('Portfolio item not found');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Toggle status of portfolio item
// @route   PATCH /api/portfolio/status/:id
// @access  Private/Admin
export const togglePortfolioStatus = async (req, res, next) => {
    try {
        const portfolioItem = await Portfolio.findById(req.params.id);

        if (portfolioItem) {
            portfolioItem.status = portfolioItem.status === 'active' ? 'inactive' : 'active';
            await portfolioItem.save();
            res.json(portfolioItem);
        } else {
            res.status(404);
            throw new Error('Portfolio item not found');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Update portfolio order
// @route   PUT /api/portfolio/reorder
// @access  Private/Admin
export const reorderPortfolio = async (req, res, next) => {
    try {
        const { orders } = req.body; // Array of { id: ..., order: ... }
        
        await Promise.all(orders.map(item => 
            Portfolio.findByIdAndUpdate(item.id, { order: item.order })
        ));

        res.json({ message: 'Portfolio reordered successfully' });
    } catch (error) {
        next(error);
    }
};
