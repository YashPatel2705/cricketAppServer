const express = require('express');
const router = express.Router();
const Match = require('../models/Match');
const mongoose = require('mongoose');

// Get all matches
router.get('/', async (req, res) => {
  try {
    const matches = await Match.find()
      .populate('teamA teamB winningTeam', 'name image')
      .sort({ date: -1 });
    res.json(matches);
  } catch (error) {
    console.error('Error fetching matches:', error);
    res.status(500).json({ error: 'Failed to fetch matches' });
  }
});

// Get a single match by ID
router.get('/:matchId', async (req, res) => {
  try {
    const match = await Match.findById(req.params.matchId)
      .populate('teamA teamB winningTeam', 'name image');
    
    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }
    
    res.json(match);
  } catch (error) {
    console.error('Error fetching match:', error);
    res.status(500).json({ error: 'Failed to fetch match' });
  }
});

// Create a new match
router.post('/', async (req, res) => {
  try {
    console.log("📥 Incoming match data:", req.body);
    const matchData = req.body;
    
    // Validate required fields
    if (!matchData.teamA || !matchData.teamB || !matchData.date || !matchData.ground) {
      return res.status(400).json({ 
        error: 'Missing required match data',
        details: 'Required fields: teamA, teamB, date, ground'
      });
    }
    
    // Validate team IDs
    if (!mongoose.Types.ObjectId.isValid(matchData.teamA) || !mongoose.Types.ObjectId.isValid(matchData.teamB)) {
      return res.status(400).json({ error: 'Invalid team ID' });
    }

    // Validate date
    const matchDate = new Date(matchData.date);
    if (isNaN(matchDate.getTime())) {
      return res.status(400).json({ error: 'Invalid date format' });
    }
    
    // Create match with validated data
    const match = new Match({
      teamA: matchData.teamA,
      teamB: matchData.teamB,
      date: matchDate,
      ground: matchData.ground,
      stage: matchData.stage || 'Group',
      overs: matchData.overs || 20
    });

    await match.save();
    
    const populatedMatch = await Match.findById(match._id)
      .populate('teamA teamB', 'name image');
    
    console.log("✅ Match created successfully:", populatedMatch._id);
    res.status(201).json(populatedMatch);
  } catch (error) {
    console.error('❌ Error creating match:', error);
    res.status(500).json({ 
      error: 'Failed to create match', 
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Update a match
router.put('/:matchId', async (req, res) => {
  try {
    const { matchId } = req.params;
    const matchData = req.body;
    
    // Validate team IDs if provided
    if (matchData.teamA && !mongoose.Types.ObjectId.isValid(matchData.teamA)) {
      return res.status(400).json({ error: 'Invalid teamA ID' });
    }
    
    if (matchData.teamB && !mongoose.Types.ObjectId.isValid(matchData.teamB)) {
      return res.status(400).json({ error: 'Invalid teamB ID' });
    }
    
    if (matchData.winningTeam && !mongoose.Types.ObjectId.isValid(matchData.winningTeam)) {
      return res.status(400).json({ error: 'Invalid winningTeam ID' });
    }
    
    const updatedMatch = await Match.findByIdAndUpdate(
      matchId,
      { $set: matchData },
      { new: true, runValidators: true }
    ).populate('teamA teamB winningTeam', 'name image');
    
    if (!updatedMatch) {
      return res.status(404).json({ error: 'Match not found' });
    }
    
    res.json(updatedMatch);
  } catch (error) {
    console.error('Error updating match:', error);
    res.status(500).json({ error: 'Failed to update match', details: error.message });
  }
});

// Complete a match and update its data
router.post('/:matchId/complete', async (req, res) => {
  try {
    console.log("📥 Incoming match completion data:", req.body);
    const { matchId } = req.params;
    const matchData = req.body;

    // Validate required fields
    if (!matchData.firstInningsScore || !matchData.secondInningsScore) {
      return res.status(400).json({ error: 'Missing required match data' });
    }

    // Validate winningTeam if provided
    if (matchData.winningTeam && !mongoose.Types.ObjectId.isValid(matchData.winningTeam)) {
      return res.status(400).json({ error: 'Invalid winning team ID' });
    }

    // Prepare update data
    const updateData = {
      status: 'completed',
      completedAt: new Date(),
      firstInnings: {
        score: matchData.firstInningsScore,
        wickets: matchData.firstInningsWickets,
        overs: matchData.firstInningsOvers
      },
      secondInnings: {
        score: matchData.secondInningsScore,
        wickets: matchData.secondInningsWickets,
        overs: matchData.secondInningsOvers
      },
      result: matchData.result,
      ballByBall: matchData.ballByBall || [],
      overHistory: matchData.overHistory || []
    };

    // Only set winningTeam if it's provided and valid
    if (matchData.winningTeam) {
      updateData.winningTeam = matchData.winningTeam;
    }

    // Update match in database with complete match data
    const updatedMatch = await Match.findByIdAndUpdate(
      matchId,
      { $set: updateData },
      { 
        new: true,
        runValidators: true
      }
    ).populate([
      { path: 'teamA', select: 'name image' },
      { path: 'teamB', select: 'name image' },
      { path: 'winningTeam', select: 'name image' }
    ]);

    if (!updatedMatch) {
      console.error('❌ Match not found:', matchId);
      return res.status(404).json({ error: 'Match not found' });
    }

    console.log("✅ Match completed successfully:", updatedMatch._id);
    res.json(updatedMatch);
  } catch (error) {
    console.error('❌ Error completing match:', error);
    res.status(500).json({ 
      error: 'Failed to complete match', 
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Delete a match
router.delete('/:matchId', async (req, res) => {
  try {
    const match = await Match.findByIdAndDelete(req.params.matchId);
    
    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }
    
    res.json({ message: 'Match deleted successfully' });
  } catch (error) {
    console.error('Error deleting match:', error);
    res.status(500).json({ error: 'Failed to delete match' });
  }
});

module.exports = router;