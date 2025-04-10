const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  teamA: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true
  },
  teamB: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  ground: {
    type: String,
    required: true
  },
  stage: {
    type: String,
    enum: ['Group', 'Quarter', 'Semi', 'Final'],
    default: 'Group'
  },
  overs: {
    type: Number,
    default: 20
  },
  status: {
    type: String,
    enum: ['scheduled', 'in_progress', 'completed'],
    default: 'scheduled'
  },
  firstInnings: {
    score: Number,
    wickets: Number,
    overs: Number
  },
  secondInnings: {
    score: Number,
    wickets: Number,
    overs: Number
  },
  result: {
    type: String,
    enum: ['teamA_won', 'teamB_won', 'draw', 'tie']
  },
  winningTeam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    validate: {
      validator: function(v) {
        return v === null || mongoose.Types.ObjectId.isValid(v);
      },
      message: 'Invalid winning team ID'
    }
  },
  ballByBall: [{
    over: Number,
    ball: Number,
    batsman: String,
    bowler: String,
    runs: Number,
    extras: Number,
    wicket: Boolean,
    description: String
  }],
  overHistory: [{
    over: Number,
    runs: Number,
    wickets: Number,
    extras: Number
  }],
  completedAt: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Add any virtual fields if needed
matchSchema.virtual('winner', {
  ref: 'Team',
  localField: 'winningTeam',
  foreignField: '_id',
  justOne: true
});

module.exports = mongoose.model('Match', matchSchema);