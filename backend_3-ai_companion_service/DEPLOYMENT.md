# ShikshaDisha AI Companion Service - Deployment Guide

## Prerequisites

- Docker & Docker Compose installed
- GitHub Container Registry access (ghcr.io)
- Optional: Watchtower for auto-updates

---

## Quick Start

### 1. Pull the Latest Image

```bash
docker pull ghcr.io/saad2134/shiksha-disha/b3-ai-companion:latest
```

### 2. Run the Container

```bash
docker run -d \
  --name shiksha-b3-ai-companion \
  -p 9001:9001 \
  ghcr.io/saad2134/shiksha-disha/b3-ai-companion:latest
```

### Development (Hot Reload)

#### Dev Profile (Auto-Reload)
```bash
cd backend_3-ai_companion_service
docker-compose --profile dev up -d
```

#### Manual Restart
```bash
# Rebuild (for dependency changes)
docker-compose up -d --build

# Or just restart for code-only changes
docker-compose restart
```

### 3. Verify

```bash
curl http://localhost:9001/health
```

---

## Auto-Update with Watchtower

### Option 1: Docker Compose with Watchtower

```yaml
version: "3.8"

services:
  ai_companion:
    image: ghcr.io/saad2134/shiksha-disha/b3-ai-companion:latest
    container_name: shiksha-b3-ai-companion
    ports:
      - "9001:9001"
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:9001/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  watchtower:
    image: containrrr/watchtower
    container_name: watchtower-companion
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    command: --interval 60 --include-restart shiksha-b3-ai-companion
    restart: unless-stopped
```

### Option 2: Standalone Watchtower

```bash
docker run -d \
  --name watchtower-companion \
  -v /var/run/docker.sock:/var/run/docker.sock \
  containrrr/watchtower \
  --interval 60 \
  --include-restart \
  shiksha-b3-ai-companion
```

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `REDIS_URL` | `redis://localhost:6379/0` | Redis connection |
| `EMBEDDING_MODEL` | `all-MiniLM-L6-v2` | Sentence transformer model |
| `CONVERSATION_HISTORY_LIMIT` | `50` | Max messages per conversation |

---

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /health` | Health check |
| `POST /chat` | Chat with AI Companion |
| `POST /chat/new` | Start new conversation |
| `GET /chat/{id}/history` | Get conversation history |
| `POST /forecast` | Get skill forecasts |
| `GET /alerts` | Get industry alerts |
| `POST /recommend` | Get content recommendations |
| `GET /resources` | Get all learning resources |

---

## Manual Update Steps

```bash
# Pull latest
docker pull ghcr.io/saad2134/shiksha-disha/b3-ai-companion:latest

# Restart
docker stop shiksha-b3-ai-companion
docker rm shiksha-b3-ai-companion
docker run -d --name shiksha-b3-ai-companion -p 9001:9001 \
  ghcr.io/saad2134/shiksha-disha/b3-ai-companion:latest
```

---

## Troubleshooting

```bash
# Check logs
docker logs shiksha-b3-ai-companion

# Check health
curl http://localhost:9001/health

# Rebuild from source
cd backend_3-ai_companion_service
docker-compose up --build
```

---

## Image Location

```
ghcr.io/saad2134/shiksha-disha/b3-ai-companion:latest
```
