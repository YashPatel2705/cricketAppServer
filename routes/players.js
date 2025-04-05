const express = require('express');
const router = express.Router();
const Player = require('../models/Player');

router.get('/', async (req, res) => {
  const { role, search } = req.query;

  const query = {};

  // Role filter
  if (role && role !== 'all players') {
    query.role = role.toLowerCase();
  }

  // Search filter (partial match on name)
  if (search) {
    query.name = { $regex: search, $options: 'i' };
  }

  try {
    const players = await Player.find(query);
    res.json(players);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch players' });
  }
});

router.post('/', async (req, res) => {
  const player = new Player(req.body);
  await player.save();
  res.json(player);
});

router.put('/:id', async (req, res) => {
  const updated = await Player.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
});

router.delete('/:id', async (req, res) => {
  await Player.findByIdAndDelete(req.params.id);
  res.json({ message: 'Player deleted' });
});

module.exports = router;
