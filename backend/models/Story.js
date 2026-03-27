import mongoose from 'mongoose';

const storySchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        required: true,
        unique: true
    },
    description: String,
    subTitle: String,
    slogan: String,
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    coverImage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Media',
        required: true
    },
    images: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Media'
    }],
    videoUrls: [String],
    highlights: [String],
    eventDate: Date,
    clientName: String,
    location: String,
    status: {
        type: String,
        enum: ['draft', 'published'],
        default: 'draft'
    },
    isFeatured: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

const Story = mongoose.model('Story', storySchema);
export default Story;
