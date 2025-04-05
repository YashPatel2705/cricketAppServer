const express = require('express');
const router = express.Router();
const Team = require('../models/Team');
const Player = require('../models/Player');
const upload = require('../middleware/upload');

// ✅ Move this BEFORE `/:id`
router.get('/available-players', async (req, res) => {
  try {
    const teams = await Team.find();
    const assigned = teams.flatMap(team => team.players.map(p => p.player.toString()));
    const availablePlayers = await Player.find({ _id: { $nin: assigned } });
    res.json(availablePlayers);
  } catch (err) {
    console.error('❌ Error fetching available players:', err);
    res.status(500).json({ error: 'Failed to fetch available players', details: err.message });
  }
});

// ✅ Get all teams
router.get('/', async (req, res) => {
  try {
    const teams = await Team.find().populate('players.player');
    res.json(teams);
  } catch (err) {
    console.error('❌ Error fetching teams:', err);
    res.status(500).json({ error: 'Failed to fetch teams', details: err.message });
  }
});

// ✅ Get single team by ID (must come last)
router.get('/:id', async (req, res) => {
  try {
    const team = await Team.findById(req.params.id).populate('players.player');
    if (!team) return res.status(404).json({ error: 'Team not found' });
    res.json(team);
  } catch (err) {
    console.error('❌ Error fetching team:', err);
    res.status(500).json({ error: 'Failed to fetch team', details: err.message });
  }
});

// ✅ Create a team
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { name, description, players } = req.body;
    if (!name || !players || players.length === 0) {
      return res.status(400).json({ error: 'Team name and players are required' });
    }

    const parsedPlayers = JSON.parse(players);
    const team = new Team({
      name,
      description,
      players: parsedPlayers.map(p => ({ player: p.player, role: p.role })),
      image: req.file ? `/uploads/${req.file.filename}` : ''
    });

    await team.save();
    const populated = await Team.findById(team._id).populate('players.player');
    res.json(populated);
  } catch (err) {
    console.error('❌ Error creating team:', err.message);
    res.status(500).json({ error: 'Failed to create team', details: err.message });
  }
});

// ✅ Update team
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const { name, description, players } = req.body;
    if (!name || !players || players.length === 0) {
      return res.status(400).json({ error: 'Team name and players are required' });
    }

    const parsedPlayers = JSON.parse(players);
    const update = {
      name,
      description,
      players: parsedPlayers.map(p => ({ player: p.player, role: p.role }))
    };

    if (req.file) {
      update.image = `/uploads/${req.file.filename}`;
    }

    const updated = await Team.findByIdAndUpdate(req.params.id, update, {
      new: true
    }).populate('players.player');

    res.json(updated);
  } catch (err) {
    console.error('❌ Error updating team:', err.message);
    res.status(500).json({ error: 'Failed to update team', details: err.message });
  }
});

// ✅ Delete team
router.delete('/:id', async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ error: 'Team not found' });

    await Team.findByIdAndDelete(req.params.id);
    res.json({ message: 'Team deleted' });
  } catch (err) {
    console.error('❌ Error deleting team:', err.message);
    res.status(500).json({ error: 'Failed to delete team', details: err.message });
  }
});

module.exports = router;
