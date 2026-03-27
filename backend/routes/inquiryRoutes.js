import express from 'express';
import {
    getInquiries,
    createInquiry,
    updateInquiryStatus,
    deleteInquiry
} from '../controllers/inquiryController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .get(protect, admin, getInquiries)
    .post(createInquiry);

router.route('/:id')
    .put(protect, admin, updateInquiryStatus)
    .delete(protect, admin, deleteInquiry);

export default router;
