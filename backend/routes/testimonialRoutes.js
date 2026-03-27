import express from 'express';
import {
    getTestimonials,
    getActiveTestimonials,
    createTestimonial,
    updateTestimonial,
    deleteTestimonial
} from '../controllers/testimonialController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .get(getTestimonials)
    .post(protect, admin, createTestimonial);

router.route('/active')
    .get(getActiveTestimonials);

router.route('/:id')
    .put(protect, admin, updateTestimonial)
    .delete(protect, admin, deleteTestimonial);

export default router;
