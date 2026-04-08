const express = require('express');
const http = require('http');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const WebSocket = require('ws');
const path = require('path');
const fs = require('fs');

dotenv.config();

const app = express();

const server = http.createServer(app);

app.use(cors({
  origin: '*'
}));

app.use(express.json());

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });

const postsRouter = require('./routes/posts');
app.use('/api/posts', postsRouter);

const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  console.log('Client connected');

  ws.on('message', async (message) => {
    const query = message.toString();
    const searchRegex = new RegExp(query, 'i');
    const results = await mongoose.model('Post').find({
      $or: [
        { title: searchRegex },
        { body: searchRegex }
      ]
    });
    ws.send(JSON.stringify(results));
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

const frontendBuildPath = path.join(__dirname, '../frontend/dist');
if (fs.existsSync(frontendBuildPath)) {
  app.use(express.static(frontendBuildPath));
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api')) {
      return res.status(404).json({ message: 'API route not found' });
    }
    res.sendFile(path.join(frontendBuildPath, 'index.html'));
  });
}

const PORT = parseInt(process.env.PORT, 10) || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});