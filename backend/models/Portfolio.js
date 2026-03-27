import mongoose from 'mongoose';

const portfolioSchema = new mongoose.Schema({
  image: {
    url: {
      type: String,
      required: true
    },
    public_id: {
      type: String,
      required: true
    }
  },
  title: {
    type: String,
    trim: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  story: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Story'
  },
  tags: [String],
  order: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  }
}, { timestamps: true });

// Pre-save hook to handle default order if needed
portfolioSchema.pre('save', async function() {
  if (this.isNew && !this.order) {
    const lastItem = await this.constructor.findOne().sort('-order');
    this.order = lastItem ? lastItem.order + 1 : 0;
  }
});

const Portfolio = mongoose.model('Portfolio', portfolioSchema);
export default Portfolio;
