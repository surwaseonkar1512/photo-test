import mongoose from 'mongoose';

const testimonialSchema = new mongoose.Schema({
    clientName: {
        type: String,
        required: true
    },
    coupleNames: String,
    content: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
        default: 5
    },
    image: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Media'
    },
    isFeatured: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

const Testimonial = mongoose.model('Testimonial', testimonialSchema);
export default Testimonial;
