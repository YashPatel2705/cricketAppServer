const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// ✅ Debug middleware - FIRST
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.url}`);
  next();
});

// ✅ Essential middleware - SECOND
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ Import routes
const matchesRouter = require('./routes/matches');
const teamsRouter = require('./routes/teams');
const pointsRouter = require('./routes/points');
const playersRouter = require('./routes/Players');

// ✅ Register routes - THIRD
app.use('/api/matches', matchesRouter);
app.use('/api/teams', teamsRouter);
app.use('/api/points', pointsRouter);
app.use('/api/players', playersRouter);

// ✅ Setup Socket.io
const { Server } = require('socket.io');
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log('🟢 Socket connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('🔴 Socket disconnected:', socket.id);
  });

  socket.on('score:update', (data) => {
    console.log('📡 Received score update:', data);
    io.emit('score:updated', data);
  });
});

// ✅ MongoDB
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error("❌ MONGO_URI is not defined in .env file");
  process.exit(1);
}

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

// ✅ Server start
const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
}); 