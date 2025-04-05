// models/Match.js
const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  teamA: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
  teamB: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
  date: { type: Date, required: true },
  stage: {
    type: String,
    enum: ['Group', 'Quarter', 'Semi', 'Final'],
    required: true
  },
  ground: {
    type: String,
    enum: ['Ground 1', 'Ground 2'],
    required: true
  },
  status: {
    type: String,
    enum: ['scheduled', 'live', 'completed'],
    default: 'scheduled'
  },
  result: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('Match', matchSchema);
