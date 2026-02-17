# Docker Deployment Guide

This guide explains how to deploy the Transport Book Web App using Docker and Docker Compose with nginx as a reverse proxy.

## Prerequisites

- Docker (version 20.10 or higher)
- Docker Compose (version 2.0 or higher)

## Quick Start

### 1. Configure Environment Variables

Copy the example environment file and update it with your actual values:

```bash
cp .env.example .env
```

Edit `.env` and add your Supabase credentials:

```env
NODE_ENV=production
USE_SUPABASE=true
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
```

### 2. Build and Run

Build and start all services:

```bash
docker-compose up -d
```

This will:
- Build the Next.js application
- Start the Next.js server on port 3000 (internal)
- Start nginx on port 80 (exposed)

### 3. Access the Application

Open your browser and navigate to:
- http://localhost:8080 (via nginx)

> **Note:** On Windows, port 80 is often reserved by the system. The application uses port 8080 instead.

## Docker Commands

### Start Services
```bash
docker-compose up -d
```

### Stop Services
```bash
docker-compose down
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f nextjs
docker-compose logs -f nginx
```

### Rebuild After Changes
```bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Check Service Health
```bash
docker-compose ps
```

## Architecture

```
Client → nginx (port 8080) → Next.js (port 3000) → Supabase
```

### Services

1. **nextjs**: Next.js application server
   - Built using multi-stage Docker build
   - Runs on port 3000 (internal)
   - Uses standalone output mode for optimal performance

2. **nginx**: Reverse proxy and web server
   - Handles incoming HTTP requests on port 8080
   - Proxies requests to Next.js
   - Serves static files with caching
   - Includes gzip compression

## Configuration Files

- `Dockerfile`: Multi-stage build for Next.js app
- `docker-compose.yml`: Orchestrates all services
- `nginx.conf`: nginx reverse proxy configuration
- `.dockerignore`: Excludes unnecessary files from Docker build
- `.env`: Environment variables (create from `.env.example`)

## Production Deployment

### SSL/HTTPS Setup

To enable HTTPS, you need to:

1. Obtain SSL certificates (e.g., from Let's Encrypt)
2. Create a `certs` directory:
   ```bash
   mkdir certs
   ```
3. Place your certificate files in the `certs` directory
4. Update `nginx.conf` to add SSL configuration:
   ```nginx
   server {
     listen 443 ssl http2;
     ssl_certificate /etc/nginx/certs/fullchain.pem;
     ssl_certificate_key /etc/nginx/certs/privkey.pem;
     # ... rest of configuration
   }
   ```
5. Uncomment the SSL volume mount in `docker-compose.yml`

### Environment-Specific Configurations

For different environments, create separate compose files:

- `docker-compose.prod.yml` - Production
- `docker-compose.staging.yml` - Staging
- `docker-compose.dev.yml` - Development

Run with:
```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### Database Considerations

- **Production**: Set `USE_SUPABASE=true` and configure Supabase credentials
- **Development**: Set `USE_SUPABASE=false` to use local SQLite
  - SQLite data is persisted in `./data` directory via volume mount

## Monitoring

### Health Checks

Both services include health checks:
- Next.js: http://localhost:3000/api/health (internal)
- nginx: http://localhost:8080/health

View health status:
```bash
docker-compose ps
```

### Resource Usage

Monitor resource consumption:
```bash
docker stats
```

## Troubleshooting

### Container won't start
```bash
# Check logs
docker-compose logs nextjs
docker-compose logs nginx

# Verify configuration
docker-compose config
```

### Database connection issues
- Verify `SUPABASE_URL` and `SUPABASE_ANON_KEY` in `.env`
- Check network connectivity from container:
  ```bash
  docker-compose exec nextjs wget -O- https://your-project.supabase.co
  ```

### nginx proxy errors
- Check nginx configuration syntax:
  ```bash
  docker-compose exec nginx nginx -t
  ```
- Restart nginx:
  ```bash
  docker-compose restart nginx
  ```

### Build failures
- Clear Docker cache and rebuild:
  ```bash
  docker-compose down
  docker system prune -a
  docker-compose build --no-cache
  ```

## Scaling

To run multiple Next.js instances behind nginx:

```bash
docker-compose up -d --scale nextjs=3
```

Update `nginx.conf` upstream block to include all instances.

## Backup

### Backup data directory (SQLite)
```bash
docker-compose exec nextjs tar czf /tmp/data-backup.tar.gz /app/data
docker cp transport-book-nextjs:/tmp/data-backup.tar.gz ./backup/
```

### Backup Supabase
Follow Supabase backup procedures for production database.

## Security Best Practices

1. **Never commit `.env` file** - It contains sensitive credentials
2. **Use secrets management** in production (Docker Swarm secrets, Kubernetes secrets)
3. **Keep images updated**:
   ```bash
   docker-compose pull
   docker-compose up -d
   ```
4. **Run containers as non-root** (already configured in Dockerfile)
5. **Limit container resources** in `docker-compose.yml`:
   ```yaml
   deploy:
     resources:
       limits:
         cpus: '1'
         memory: 1G
   ```

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Next.js Docker Deployment](https://nextjs.org/docs/deployment#docker-image)
- [nginx Documentation](https://nginx.org/en/docs/)
