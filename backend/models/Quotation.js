import mongoose from 'mongoose';

const quotationSchema = new mongoose.Schema({
  leadId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Lead",
    required: true
  },
  quotationNumber: {
    type: String,
    required: true,
    unique: true
  },
  templateData: {
    clientName: String,
    location: String,
    eventDetails: String,
    bullets: [String]
  },
  actualPrice: Number,
  sellingPrice: Number,
  gstPercentage: {
    type: Number,
    default: 0
  },
  gstType: {
    type: String,
    enum: ["included", "excluded"],
    default: "excluded"
  },
  gst: {
    type: Number,
    default: 0
  },
  finalAmount: Number,
  pdfUrl: String,
  pdfPublicId: String,
  status: {
    type: String,
    enum: ["draft", "sent", "accepted"],
    default: "draft"
  }
}, { timestamps: true });

const Quotation = mongoose.model('Quotation', quotationSchema);
export default Quotation;
