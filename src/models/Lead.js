import mongoose from 'mongoose';

const leadSchema = new mongoose.Schema({
    restaurantName: {
        type: String,
        required: true,
        index: true,
      },
      address: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
      },
      status: {
        type: String,
        enum: ['NEW', 'CONTACTED', 'QUALIFIED', 'NEGOTIATING', 'CONVERTED', 'LOST'],
        default: 'NEW',
        index: true,
      },
      assignedKam: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
      },
      callFrequency: {
        type: String,
        enum: ['DAILY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY'],
        default: 'WEEKLY',
      },
      lastCallDate: {
        type: Date,
        index: true,
      },
      nextCallDate: {
        type: Date,
        index: true,
      },
      averageOrderValue: {
        type: Number,
        default: 0,
      },
      orderFrequency: {
        type: Number,
        default: 0,
      },
}, { timestamps: true });

const Lead = mongoose.model('Lead', leadSchema);
export default Lead;