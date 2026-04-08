// Root entrypoint for Railway deployment
// This allows the root start script and Procfile to use `node server.js`
// while keeping the actual backend app in the backend/ folder.
require('./backend/server.js');
