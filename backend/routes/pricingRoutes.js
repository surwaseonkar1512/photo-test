import express from 'express';
import {
    getPricingPackages,
    getAdminPricingPackages,
    createPricingPackage,
    updatePricingPackage,
    deletePricingPackage,
    togglePackageStatus
} from '../controllers/pricingController.js';
import {
    getPricingCategories,
    createPricingCategory,
    updatePricingCategory,
    deletePricingCategory
} from '../controllers/pricingCategoryController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Category Routes
router.route('/categories')
    .get(getPricingCategories)
    .post(protect, admin, createPricingCategory);

router.route('/categories/:id')
    .put(protect, admin, updatePricingCategory)
    .delete(protect, admin, deletePricingCategory);

// Package Routes
router.route('/')
    .get(getPricingPackages)
    .post(protect, admin, createPricingPackage);

router.get('/admin/all', protect, admin, getAdminPricingPackages);

router.patch('/status/:id', protect, admin, togglePackageStatus);

router.route('/:id')
    .put(protect, admin, updatePricingPackage)
    .delete(protect, admin, deletePricingPackage);

export default router;
