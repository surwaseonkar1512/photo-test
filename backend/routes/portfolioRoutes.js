import express from 'express';
import { 
    getPortfolio, 
    getAllAdminPortfolio, 
    createPortfolioItem, 
    updatePortfolioItem, 
    deletePortfolioItem, 
    togglePortfolioStatus,
    reorderPortfolio
} from '../controllers/portfolioController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public route
router.get('/', getPortfolio);

// Admin routes
router.get('/admin', protect, admin, getAllAdminPortfolio);
router.post('/', protect, admin, createPortfolioItem);
router.put('/:id', protect, admin, updatePortfolioItem);
router.delete('/:id', protect, admin, deletePortfolioItem);
router.patch('/status/:id', protect, admin, togglePortfolioStatus);
router.put('/reorder', protect, admin, reorderPortfolio);

export default router;
