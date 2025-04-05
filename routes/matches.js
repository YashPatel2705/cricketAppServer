const express = require('express');
const router = express.Router();
const Match = require('../models/Match');
const Team = require('../models/Team');

// GET all matches
router.get('/', async (req, res) => {
  try {
    const matches = await Match.find()
      .populate('teamA', 'name image')
      .populate('teamB', 'name image');
    res.json(matches);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch matches' });
  }
});

// GET match by ID
router.get('/:id', async (req, res) => {
  try {
    const match = await Match.findById(req.params.id)
      .populate('teamA', 'name image')
      .populate('teamB', 'name image');

    if (!match) return res.status(404).json({ error: 'Match not found' });

    res.json(match);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch match' });
  }
});

// CREATE match
router.post('/', async (req, res) => {
  try {
    console.log("📥 Incoming match data:", req.body);
    const { teamA, teamB, date, stage, ground } = req.body;
    const match = new Match({ teamA, teamB, date, stage, ground });
    await match.save();
    const populated = await Match.findById(match._id)
      .populate('teamA', 'name image')
      .populate('teamB', 'name image');
    res.json(populated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create match' });
  }
});

// UPDATE match
router.put('/:id', async (req, res) => {
  try {
    const { teamA, teamB, date, stage, ground } = req.body;
    const updated = await Match.findByIdAndUpdate(
      req.params.id,
      { teamA, teamB, date, stage, ground },
      { new: true }
    )
      .populate('teamA', 'name image')
      .populate('teamB', 'name image');
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update match' });
  }
});

// DELETE match
router.delete('/:id', async (req, res) => {
  try {
    await Match.findByIdAndDelete(req.params.id);
    res.json({ message: 'Match deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete match' });
  }
});

module.exports = router;