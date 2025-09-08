const mongoose = require('mongoose');

const staySchema = new mongoose.Schema({
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date },
  hours: { type: Number },
  isNight: { type: Boolean, default: false },

  amount: { type: Number, required: true },

  phase: { type: String, enum: ['hour', 'night'], required: true },

  paymentMethod: { 
    type: String, 
    enum: ['cash', 'card', 'other'], 
    default: 'cash' 
  },

  expenses: [{ description: String, amount: Number }],

  // ⚡ Ajout
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }

}, { timestamps: true });


module.exports = mongoose.model('Stay', staySchema);
