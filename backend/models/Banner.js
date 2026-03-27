import mongoose from 'mongoose';

const bannerSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    subtitle: String,
    image: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Media',
        required: true
    },
    order: {
        type: Number,
        default: 0
    },
    isVisible: {
        type: Boolean,
        default: true
    },
    link: String,
    buttonText: String
}, { timestamps: true });

const Banner = mongoose.model('Banner', bannerSchema);
export default Banner;
