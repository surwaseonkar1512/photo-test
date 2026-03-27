import mongoose from 'mongoose';

const inquirySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: String,
    serviceType: String,
    package: String,
    datePreference: String,
    eventDate: Date,
    message: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['New', 'In Progress', 'Closed'],
        default: 'New'
    }
}, { timestamps: true });

const Inquiry = mongoose.model('Inquiry', inquirySchema);
export default Inquiry;
