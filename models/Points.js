const mongoose = require('mongoose');

const pointsSchema = new mongoose.Schema({
  teamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true,
    unique: true
  },
  matchesPlayed: {
    type: Number,
    default: 0
  },
  wins: {
    type: Number,
    default: 0
  },
  losses: {
    type: Number,
    default: 0
  },
  points: {
    type: Number,
    default: 0
  },
  runsFor: {
    type: Number,
    default: 0
  },
  runsAgainst: {
    type: Number,
    default: 0
  },
  oversPlayed: {
    type: Number,
    default: 0
  },
  oversBowled: {
    type: Number,
    default: 0
  },
  nrr: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Add index for faster queries
pointsSchema.index({ points: -1, nrr: -1 });

module.exports = mongoose.model('Points', pointsSchema); 