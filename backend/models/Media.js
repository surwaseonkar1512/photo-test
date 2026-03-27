import mongoose from 'mongoose';

const mediaSchema = new mongoose.Schema({
    url: {
        type: String,
        required: true
    },
    public_id: {
        type: String,
        required: true
    },
    format: String,
    width: Number,
    height: Number,
    bytes: Number,
    folder: String
}, { timestamps: true });

const Media = mongoose.model('Media', mediaSchema);
export default Media;
