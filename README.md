# Tower Game

Forked from https://github.com/iamkun/tower_game

## Features added

* Docker containerization
* Backend API
* User authentication
* Leaderboard system
* Offline support

---

## 🐳 Run with Docker Compose

```bash
docker compose up -d
```

---

## 🐳 Run with Docker (without compose)

```bash
docker run -d -p 8082:8082 --name tower_game \
-v tower_game_data:/app/data \
tower_game:latest
# Tower Game

Forked from https://github.com/iamkun/tower_game

## Features added

* Docker containerization
* Backend API
* User authentication
* Leaderboard system
* Offline support

---

## 🐳 Run with Docker Compose

```bash
docker compose up -d

# then check:
http://localhost:8082
```

---

## 🐳 Run with Docker (without compose)

```bash
docker run -d -p 8082:8082 --name tower_game \
-v tower_game_data:/app/data \
tower_game:latest

# then check:
http://localhost:8082
```

---

## ☸️ Run in Kubernetes

The database file (`scores.db`) is stored in `/app/data` inside the container.

In Docker, this is mounted as a volume to persist data.

In Kubernetes, you must mount a PersistentVolumeClaim (PVC), otherwise all data will be lost when the pod restarts.

---

