import mongoose from 'mongoose';

const leadSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  phone: String,
  email: {
    type: String,
    required: true
  },
  source: {
    type: String,
    enum: ["manual", "contact", "pricing"],
    default: "contact"
  },
  category: String,
  package: String,
  eventDate: Date,
  location: String,
  message: String,
  status: {
    type: String,
    enum: ["new", "in-progress", "quotation-sent", "won", "lost"],
    default: "new"
  },
  notes: String,
  totalAmount: {
    type: Number,
    default: 0
  },
  receivedAmount: {
    type: Number,
    default: 0
  },
  remainingAmount: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

// Pre-save hook to calculate remaining amount
leadSchema.pre('save', function() {
  this.remainingAmount = this.totalAmount - this.receivedAmount;
});

const Lead = mongoose.model('Lead', leadSchema);
export default Lead;
