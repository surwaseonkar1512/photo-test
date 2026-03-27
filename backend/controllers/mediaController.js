import Media from '../models/Media.js';
import { v2 as cloudinary } from 'cloudinary';

// @desc    Upload media
// @route   POST /api/media/upload
// @access  Private/Admin
export const uploadMedia = async (req, res, next) => {
    try {
        if (!req.file) {
            res.status(400);
            throw new Error('Please upload a file');
        }

        const b64 = Buffer.from(req.file.buffer).toString('base64');
        let dataURI = 'data:' + req.file.mimetype + ';base64,' + b64;
        
        const folder = req.body.folder || 'portfolio';
        
        const result = await cloudinary.uploader.upload(dataURI, {
            folder: `photography/${folder}`,
            resource_type: 'auto'
        });

        const media = await Media.create({
            url: result.secure_url,
            public_id: result.public_id,
            format: result.format,
            width: result.width,
            height: result.height,
            bytes: result.bytes,
            folder: folder
        });

        res.status(201).json(media);
    } catch (error) {
        next(error);
    }
};

// @desc    Get all media
// @route   GET /api/media
// @access  Private/Admin
export const getMedia = async (req, res, next) => {
    try {
        const media = await Media.find({}).sort({ createdAt: -1 });
        res.json(media);
    } catch (error) {
        next(error);
    }
};

// @desc    Delete media
// @route   DELETE /api/media/:id
// @access  Private/Admin
export const deleteMedia = async (req, res, next) => {
    try {
        const media = await Media.findById(req.params.id);

        if (media) {
            await cloudinary.uploader.destroy(media.public_id);
            await Media.deleteOne({ _id: media._id });
            res.json({ message: 'Media removed' });
        } else {
            res.status(404);
            throw new Error('Media not found');
        }
    } catch (error) {
        next(error);
    }
};
