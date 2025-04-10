const express = require('express');
const router = express.Router();
const Points = require('../models/Points');

// Update points table after match completion
router.post('/update', async (req, res) => {
  try {
    const {
      matchId,
      teamA,
      teamB,
      winner,
      teamAScore,
      teamBScore,
      teamAOvers,
      teamBOvers,
      stage
    } = req.body;

    console.log('📥 Incoming points update data:', req.body);

    // Update or create points for Team A
    const teamAPoints = await Points.findOneAndUpdate(
      { teamId: teamA },
      {
        $inc: {
          matchesPlayed: 1,
          wins: winner === teamA ? 1 : 0,
          losses: winner === teamB ? 1 : 0,
          points: winner === teamA ? 2 : 0,
          runsFor: teamAScore,
          runsAgainst: teamBScore,
          oversPlayed: teamAOvers,
          oversBowled: teamBOvers
        }
      },
      { upsert: true, new: true }
    );

    // Update or create points for Team B
    const teamBPoints = await Points.findOneAndUpdate(
      { teamId: teamB },
      {
        $inc: {
          matchesPlayed: 1,
          wins: winner === teamB ? 1 : 0,
          losses: winner === teamA ? 1 : 0,
          points: winner === teamB ? 2 : 0,
          runsFor: teamBScore,
          runsAgainst: teamAScore,
          oversPlayed: teamBOvers,
          oversBowled: teamAOvers
        }
      },
      { upsert: true, new: true }
    );

    // Calculate and update Net Run Rate (NRR)
    teamAPoints.nrr = ((teamAPoints.runsFor / teamAPoints.oversPlayed) - 
                       (teamAPoints.runsAgainst / teamAPoints.oversBowled)).toFixed(3);
    teamBPoints.nrr = ((teamBPoints.runsFor / teamBPoints.oversPlayed) - 
                       (teamBPoints.runsAgainst / teamBPoints.oversBowled)).toFixed(3);

    await teamAPoints.save();
    await teamBPoints.save();

    console.log('✅ Points updated successfully for both teams');
    res.json({
      teamAPoints,
      teamBPoints
    });
  } catch (error) {
    console.error('❌ Error updating points table:', error);
    res.status(500).json({ message: 'Error updating points table', error: error.message });
  }
});

module.exports = router; 