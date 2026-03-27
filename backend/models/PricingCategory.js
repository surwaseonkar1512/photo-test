import mongoose from 'mongoose';

const pricingCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  slug: {
    type: String,
    required: true,
    unique: true
  },
  description: String,
  order: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

const PricingCategory = mongoose.model('PricingCategory', pricingCategorySchema);
export default PricingCategory;
