# Tower Building Game

A containerized tower building game with user authentication, leaderboard, and offline support.

## Features

- **Docker Containerization** - Multi-stage build for optimized production images
- **User Authentication** - Login/registration system with SQLite database
- **Leaderboard** - Real-time scoreboard showing top 10 players
- **Persistent Storage** - Scores saved in SQLite database (survives container restarts)
- **Offline Ready** - No external dependencies, works completely offline
- **Kubernetes Ready** - Compatible with Helm charts and Longhorn storage

## Quick Start

### Docker Compose
```bash
docker compose up
```
Access at http://localhost:8082

### Docker Run
```bash
docker run -d -p 8082:8082 -v tower_game_data:/app/data tower_game:latest
```

## Setup

### Local Development
```bash
npm install
npm run build
npm start
```

### Kubernetes with Helm
Use your existing Helm chart with:
```yaml
image:
  repository: tower_game
  tag: latest
  pullPolicy: IfNotPresent

service:
  port: 8082
  targetPort: 8082

persistence:
  enabled: true
  storageClass: longhorn
  size: 1Gi
  mountPath: /app/data
```

## Architecture

### Backend (Node.js + Express)
- REST API for authentication and score management
- SQLite database for persistent storage
- User registration and login with password storage

### Frontend (HTML/Canvas)
- Game rendering on HTML5 canvas
- Real-time leaderboard updates
- Offline-first design

### Database Schema
- **users**: username, password, createdAt
- **scores**: userId, username, score, blocks, timestamp

## Environment Variables
- `NODE_ENV`: Set to `production` in Docker
- `DATA_DIR`: Directory for database (default: `/app/data`)

## File Structure
```
.
├── Dockerfile          # Multi-stage production build
├── docker-compose.yml  # Docker Compose configuration
├── index.js           # Express server
├── index.html         # Frontend with game and leaderboard
├── src/
│   ├── db.js         # SQLite database functions
│   └── ...           # Game logic
├── assets/           # Images, sounds, fonts
└── dist/            # Webpack bundled game
```

## Changes Made
- ✅ Added Docker containerization with multi-stage builds
- ✅ Implemented Express.js backend API
- ✅ Created SQLite database for user authentication and score persistence
- ✅ Added leaderboard UI with real-time updates
- ✅ Removed all external dependencies (Google Analytics, custom fonts)
- ✅ Made app fully offline-compatible
- ✅ Added .gitignore for sensitive data and database files
- ✅ Configured for Kubernetes/Helm deployment

## Database Persistence
The app uses a Docker volume mounted at `/app/data` to persist the SQLite database. This ensures scores are saved even after container restarts.

For Kubernetes, configure a PersistentVolumeClaim with Longhorn or your preferred storage class.

## License
ISC
