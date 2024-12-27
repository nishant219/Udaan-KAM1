import mongoose from "mongoose";

const interactionSchema = new mongoose.Schema({
    leadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lead',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['CALL', 'ORDER', 'EMAIL', 'MEETING'],
      required: true,
    },
    contactId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Contact',
    },
    notes: String,
    outcome: String,
    orderValue: {
      type: Number,
      default: 0,
    },
    kamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
  }, { timestamps: true });

const Interaction = mongoose.model('Interaction', interactionSchema);
export default Interaction;

