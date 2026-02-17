# Docker Setup - Quick Start

## What's Running

Your Transport Book Web App is now running in Docker with the following setup:

- **Next.js Application**: Running on internal port 3000
- **nginx Reverse Proxy**: Accessible on http://localhost:8080
- **Database**: Currently using SQLite (local mode)

## Access the Application

Open your browser and go to:
```
http://localhost:8080
```

## Useful Commands

### View Running Containers
```bash
docker-compose ps
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f nextjs
docker-compose logs -f nginx
```

### Stop Containers
```bash
docker-compose down
```

### Restart Containers
```bash
docker-compose restart
```

### Rebuild After Code Changes
```bash
docker-compose down
docker-compose up -d --build
```

## Health Checks

- nginx: http://localhost:8080/health
- Next.js API: http://localhost:8080/api/health

## Configuration Files Created

1. **Dockerfile** - Multi-stage build for Next.js
2. **docker-compose.yml** - Container orchestration
3. **nginx.conf** - nginx reverse proxy configuration
4. **.dockerignore** - Files to exclude from build
5. **.env** - Environment variables
6. **README.DOCKER.md** - Complete documentation

## Production Deployment

For production deployment with Supabase:

1. Copy `.env.example` to `.env`
2. Add your Supabase credentials
3. Set `USE_SUPABASE=true`
4. Rebuild containers

See [README.DOCKER.md](README.DOCKER.md) for complete documentation.

## Troubleshooting

### Port 80 Already in Use
The app uses port 8080 instead of 80 to avoid conflicts with Windows system services.

### Container Won't Start
Check logs: `docker-compose logs nextjs`

### Database Issues
The app currently uses SQLite for local development. Data is persisted in the `./data` directory.

---

**Build Status**: ✅ Successfully Built and Running
**Access**: http://localhost:8080
