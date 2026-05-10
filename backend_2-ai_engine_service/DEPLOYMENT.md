# ShikshaDisha AI Engine Service - Deployment Guide

## Prerequisites

- Docker & Docker Compose installed
- GitHub Container Registry access (ghcr.io)
- Optional: Watchtower or similar for auto-updates

---

## Quick Start

### 1. Pull the Latest Image

```bash
docker pull ghcr.io/saad2134/shiksha-disha/b2-ai-engine:latest
```

### 2. Run the Container

```bash
docker run -d \
  --name shiksha-ai-engine \
  -p 9000:9000 \
  -e NSQF_COURSES_PATH=./data/nsqf_courses.csv \
  -v $(pwd)/data:/app/data \
  -v $(pwd)/models:/app/models \
  ghcr.io/saad2134/shiksha-disha/b2-ai-engine:latest
```

### Development (Hot Reload)

#### Dev Profile (Auto-Reload)
```bash
cd backend_2-ai_engine_service
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
curl http://localhost:9000/health
```

### Local Development (No Docker)

Requires Redis 7+ running locally.

```bash
# Create virtual environment
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac

# Install dependencies
pip install -r requirements.txt

# Set environment variables
set REDIS_URL=redis://localhost:6379/0

# Run with auto-reload
uvicorn app.main:app --reload
```

---

## Auto-Update with Watchtower

[Watchtower](https://containrrr.dev/watchtower/) monitors Docker registries for image updates and automatically restarts containers.

### Option 1: Run Watchtower as a Container

```bash
docker run -d \
  --name watchtower \
  -v /var/run/docker.sock:/var/run/docker.sock \
  containrrr/watchtower \
  --interval 30 \
  --include-restart \
  shiksha-ai-engine
```

**Parameters:**
- `--interval 30` - Check for updates every 30 seconds
- `--include-restart` - Restart container when image updates

### Option 2: Docker Compose with Watchtower

Create `deploy-compose.yml`:

```yaml
version: "3.8"

services:
  ai_engine:
    image: ghcr.io/saad2134/shiksha-disha/b2-ai-engine:latest
    container_name: shiksha-ai-engine
    ports:
      - "9000:9000"
    environment:
      - REDIS_URL=redis://redis:6379/0
      - NSQF_COURSES_PATH=./data/nsqf_courses.csv
      - INDEX_PATH=./models/faiss.index
      - EMBEDS_PATH=./models/course_embeds.npy
      - META_PATH=./models/course_meta.pkl
    volumes:
      - ./data:/app/data
      - ./models:/app/models
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:9000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  watchtower:
    image: containrrr/watchtower
    container_name: watchtower
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    environment:
      - WATCHTOWER_CLEANUP=true
      - WATCHTOWER_NOTIFICATIONS=shoutrrr
      - WATCHTOWER_NOTIFICATION_URL=${WATCHTOWER_WEBHOOK_URL}
    command: --interval 60 --include-restart shiksha-ai-engine
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    container_name: shiksha-redis
    ports:
      - "6379:6379"
    restart: unless-stopped
    volumes:
      - redis_data:/data

volumes:
  redis_data:
```

### Option 3: Systemd Service (Production Linux)

Create `/etc/systemd/system/shiksha-ai-engine.service`:

```ini
[Unit]
Description=ShikshaDisha AI Engine Service
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/shiksha-ai-engine
ExecStartPre=/usr/bin/docker pull ghcr.io/saad2134/shiksha-disha/b2-ai-engine:latest
ExecStart=/usr/bin/docker compose -f deploy-compose.yml up -d
ExecStop=/usr/bin/docker compose -f deploy-compose.yml down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
```

Enable auto-updates:

```bash
sudo cp shiksha-ai-engine.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now shiksha-ai-engine
```

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `REDIS_URL` | `redis://localhost:6379/0` | Redis connection |
| `NSQF_COURSES_PATH` | `./data/nsqf_courses.csv` | Course data CSV |
| `EMBEDDING_MODEL` | `all-MiniLM-L6-v2` | Sentence transformer model |
| `INDEX_PATH` | `./models/faiss.index` | FAISS index file |
| `EMBEDS_PATH` | `./models/course_embeds.npy` | Pre-computed embeddings |
| `META_PATH` | `./models/course_meta.pkl` | Course metadata |
| `TOP_K` | `10` | Default match results |

---

## Manual Update Steps

```bash
# 1. Pull latest image
docker pull ghcr.io/saad2134/shiksha-disha/b2-ai-engine:latest

# 2. Stop current container
docker stop shiksha-ai-engine

# 3. Remove old container
docker rm shiksha-ai-engine

# 4. Run new container (with same settings)
docker run -d \
  --name shiksha-ai-engine \
  -p 9000:9000 \
  ghcr.io/saad2134/shiksha-disha/b2-ai-engine:latest
```

---

## Health Checks

```bash
# Check container health
docker inspect --format='{{.State.Health.Status}}' shiksha-ai-engine

# View logs
docker logs shiksha-ai-engine

# Check API
curl http://localhost:9000/health
```

---

## Troubleshooting

### Container Won't Start

```bash
# Check logs
docker logs shiksha-ai-engine

# Verify data files exist
ls -la ./data/
ls -la ./models/
```

### Watchtower Not Updating

```bash
# Check Watchtower logs
docker logs watchtower

# Manually trigger update
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  containrrr/watchtower --run-once shiksha-ai-engine
```

### Port Already in Use

```bash
# Find process using port 9000
lsof -i :9000

# Kill and restart
docker kill $(docker ps -q --filter ancestor=shiksha-ai-engine)
docker rm shiksha-ai-engine
docker run -d --name shiksha-ai-engine -p 9000:9000 ...
```

---

## CI/CD Pipeline

The GitHub Actions workflow (`.github/workflows/deploy-ai-engine.yml`) automatically:

1. Builds Docker image on changes to `backend-2-ai_engine_service/`
2. Pushes to GitHub Container Registry
3. Creates tags: `latest`, `main-<sha>`, `pr-<number>`

The image will be available at:
```
ghcr.io/saad2134/shiksha-disha/b2-ai-engine:latest
```
