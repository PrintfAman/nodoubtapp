const express = require('express');
const http = require('http');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const WebSocket = require('ws');
const path = require('path');
const fs = require('fs');

dotenv.config();

const app = express();

const server = http.createServer(app);

const allowedOrigins = [
  'https://nodoubtapp.vercel.app'
];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Vary', 'Origin');
  res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  next();
});
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });

const postsRouter = require('./routes/posts');
app.use('/api/posts', postsRouter);

app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API route not found' });
  }
  next();
});

app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  if (res.headersSent) {
    return next(err);
  }
  res.status(500).json({ error: 'Server error' });
});


const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  console.log('Client connected');

  ws.on('message', async (message) => {
    try {
      const query = message.toString();
      const searchRegex = new RegExp(query, 'i');
      const results = await mongoose.model('Post').find({
        $or: [
          { title: searchRegex },
          { body: searchRegex }
        ]
      });
      ws.send(JSON.stringify(results));
    } catch (error) {
      console.error('WebSocket search error:', error);
      ws.send(JSON.stringify({ error: 'Server error' }));
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

const frontendBuildPath = path.join(__dirname, '../frontend/dist');
if (fs.existsSync(frontendBuildPath)) {
  app.use(express.static(frontendBuildPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendBuildPath, 'index.html'));
  });
}

const PORT = parseInt(process.env.PORT, 10) || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});