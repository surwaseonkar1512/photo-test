import express from 'express';
import {
    getStories,
    getAdminStories,
    getStoryByIdentifier,
    createStory,
    updateStory,
    deleteStory
} from '../controllers/storyController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .get(getStories)
    .post(protect, admin, createStory);

router.get('/admin/all', protect, admin, getAdminStories);

router.route('/:identifier')
    .get(getStoryByIdentifier)

router.route('/:id')
    .put(protect, admin, updateStory)
    .delete(protect, admin, deleteStory);

export default router;
