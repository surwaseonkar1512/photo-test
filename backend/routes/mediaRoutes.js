import express from 'express';
import {
    uploadMedia,
    getMedia,
    deleteMedia
} from '../controllers/mediaController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.route('/')
    .get(protect, admin, getMedia);

router.post('/upload', protect, admin, upload.single('file'), uploadMedia);

router.route('/:id')
    .delete(protect, admin, deleteMedia);

export default router;
