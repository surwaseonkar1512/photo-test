import mongoose from 'mongoose';

const pricingSchema = new mongoose.Schema({
    packageName: {
        type: String,
        required: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PricingCategory',
        required: true
    },
    isPopular: {
        type: Boolean,
        default: false
    },
    sellingPrice: {
        type: Number,
        required: true
    },
    actualPrice: {
        type: Number,
        required: true
    },
    description: String,
    features: [String],
    addOns: [String],
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    },
    order: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

const Pricing = mongoose.model('Pricing', pricingSchema);
export default Pricing;
