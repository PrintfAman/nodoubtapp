#!/usr/bin/env bash
set -e

cd backend
npm install
cd ../frontend
npm install
npm run build
cd ../backend
node server.js
