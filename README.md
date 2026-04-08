# Post Explorer

## Project Overview
Post Explorer is a full-stack web application that allows users to explore posts fetched from JSONPlaceholder. The app features real-time search functionality using WebSockets, enabling instant filtering of posts by title or body. Users can view all posts in a responsive grid layout and search through them dynamically without page reloads.

## Folder Structure
```
nodoubt-app/
├── backend/
│   ├── server.js
│   ├── models/
│   │   └── Post.js
│   ├── routes/
│   │   └── posts.js
│   ├── .env.example
│   ├── package.json
│   └── vercel.json
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── main.jsx
│   ├── index.html
│   ├── .env.example
│   ├── package.json
│   └── vercel.json
├── .gitignore
└── README.md
```

## Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend | React, Vite |
| Backend | Express.js, Node.js |
| Database | MongoDB, Mongoose |
| WebSocket | ws |
| Deployment | Vercel |

## How to Run Locally

### Prerequisites
- Node.js 18+
- MongoDB Atlas account

### Backend Setup
1. Navigate to the backend directory: `cd backend`
2. Install dependencies: `npm install`
3. Copy the environment file: `cp .env.example .env` and fill in your MongoDB Atlas connection string
4. Start the server: `node server.js`

### Frontend Setup
1. Navigate to the frontend directory: `cd frontend`
2. Install dependencies: `npm install`
3. Copy the environment file: `cp .env.example .env` and fill in the API and WebSocket URLs
4. Start the development server: `npm run dev`

## Environment Variables

| Variable | Description | Location |
|----------|-------------|----------|
| MONGODB_URI | MongoDB Atlas connection string | backend/.env |
| PORT | Server port (default 5000) | backend/.env |
| VITE_API_URL | Backend API URL | frontend/.env |
| VITE_WS_URL | WebSocket URL | frontend/.env |

## Live URL
Coming soon

## Note about WebSockets on Vercel
If WebSocket doesn't work on Vercel, deploy the backend on Railway or Render and update VITE_WS_URL accordingly.