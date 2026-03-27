import express from 'express';
import { 
    createQuotation, 
    getLeadQuotations, 
    getAllQuotations, 
    deleteQuotation,
    sendQuotationEmail 
} from '../controllers/quotationController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// All quotation routes are admin protected
router.use(protect, admin);

router.post('/', createQuotation);
router.get('/', getAllQuotations);
router.get('/lead/:leadId', getLeadQuotations);
router.delete('/:id', deleteQuotation);
router.post('/send-email', sendQuotationEmail);

export default router;
