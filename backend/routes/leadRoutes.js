import express from 'express';
import { 
    getLeads, 
    createLead, 
    updateLead, 
    updateLeadStatus, 
    deleteLead, 
    getRevenueAnalytics 
} from '../controllers/leadController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public route (Website forms)
router.post('/', createLead);

// Admin routes
router.get('/', protect, admin, getLeads);
router.put('/:id', protect, admin, updateLead);
router.patch('/:id/status', protect, admin, updateLeadStatus);
router.delete('/:id', protect, admin, deleteLead);
router.get('/analytics/revenue', protect, admin, getRevenueAnalytics);

export default router;
