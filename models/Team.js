const mongoose = require('mongoose');

// Player schema with a reference to the Player model and role
const playerWithRoleSchema = new mongoose.Schema({
  player: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Player', // Referencing the Player model
    required: true 
  },
  role: {
    type: String,
    enum: ['C', 'VC', 'WK', ''], // Role can be Captain (C), Vice-Captain (VC), Wicket Keeper (WK), or empty
    default: '' // Default role is empty string
  }
});

// Team schema with player references
const teamSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  description: String, // Optional description
  image: String, // URL to the team's image/logo
  players: [playerWithRoleSchema] // Array of players with their roles
});

// Export the Team model
module.exports = mongoose.model('Team', teamSchema);
