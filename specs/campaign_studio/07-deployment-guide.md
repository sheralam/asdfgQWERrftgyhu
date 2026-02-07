# Deployment Guide - Campaign Studio

## 1. Overview

This guide covers the deployment setup for Campaign Studio, including local development, staging, and production environments.

## 2. Prerequisites

### System Requirements
- **OS**: Linux (Ubuntu 22.04+ recommended) or macOS
- **CPU**: 2+ cores
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 20GB minimum

### Software Requirements

#### Backend
- Python 3.11 or higher
- PostgreSQL 15 or higher
- pip (Python package manager)
- virtualenv or venv

#### Frontend
- Node.js 20 or higher
- npm 10 or higher

#### Optional
- Docker & Docker Compose
- nginx (for production)
- Redis (for caching)

## 3. Local Development Setup

### 3.1 Database Setup

```bash
# Install PostgreSQL (Ubuntu)
sudo apt update
sudo apt install postgresql postgresql-contrib

# Start PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql
```

```sql
CREATE DATABASE "campaign-studio";
CREATE USER postgres WITH PASSWORD 'postgres';
GRANT ALL PRIVILEGES ON DATABASE "campaign-studio" TO postgres;
\q
```

### 3.2 Backend Setup

```bash
# Clone repository
git clone <repository-url>
cd car-infotainment

# Create backend directory
mkdir -p backend
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit .env with your configuration

# Run database migrations
alembic upgrade head

# Seed initial data (optional)
python scripts/seed_data.py

# Start development server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Backend .env file:**
```bash
# App
APP_NAME=Campaign Studio API
DEBUG=true

# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=campaign-studio
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres

# Security
SECRET_KEY=change-this-to-a-secure-random-string-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# CORS
CORS_ORIGINS=["http://localhost:5173"]

# Encryption
ENCRYPTION_KEY=32-character-encryption-key-here
```

### 3.3 Frontend Setup

```bash
# Open new terminal
cd car-infotainment

# Create frontend directory
mkdir -p frontend
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Edit .env with your configuration

# Start development server
npm run dev
```

**Frontend .env file:**
```bash
VITE_API_BASE_URL=http://localhost:8000/api
VITE_APP_NAME=Campaign Studio
```

### 3.4 Verify Installation

1. Backend: Navigate to http://localhost:8000/api/docs
2. Frontend: Navigate to http://localhost:5173
3. Create test account and login

## 4. Docker Deployment

### 4.1 Docker Compose Configuration

**docker-compose.yml:**
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15
    container_name: campaign-studio-db
    environment:
      POSTGRES_DB: campaign-studio
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    networks:
      - campaign-network

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: campaign-studio-api
    environment:
      DATABASE_HOST: postgres
      DATABASE_PORT: 5432
      DATABASE_NAME: campaign-studio
      DATABASE_USER: postgres
      DATABASE_PASSWORD: postgres
      SECRET_KEY: ${SECRET_KEY}
      ENCRYPTION_KEY: ${ENCRYPTION_KEY}
    ports:
      - "8000:8000"
    depends_on:
      - postgres
    networks:
      - campaign-network
    volumes:
      - ./backend:/app
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: campaign-studio-ui
    environment:
      VITE_API_BASE_URL: http://localhost:8000/api
    ports:
      - "5173:5173"
    depends_on:
      - backend
    networks:
      - campaign-network
    volumes:
      - ./frontend:/app
    command: npm run dev

volumes:
  postgres_data:

networks:
  campaign-network:
    driver: bridge
```

### 4.2 Backend Dockerfile

**backend/Dockerfile:**
```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port
EXPOSE 8000

# Run migrations and start server
CMD ["sh", "-c", "alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port 8000"]
```

### 4.3 Frontend Dockerfile

**frontend/Dockerfile:**
```dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy application code
COPY . .

# Expose port
EXPOSE 5173

# Start development server
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
```

### 4.4 Run with Docker

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild and restart
docker-compose up -d --build
```

## 5. Production Deployment

### 5.1 Backend Production Setup

**requirements.txt (production):**
```txt
fastapi==0.104.1
uvicorn[standard]==0.24.0
sqlalchemy==2.0.23
psycopg2-binary==2.9.9
alembic==1.12.1
pydantic==2.5.0
pydantic-settings==2.1.0
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.6
python-dotenv==1.0.0
gunicorn==21.2.0
```

**Production Start Command:**
```bash
gunicorn app.main:app \
    --workers 4 \
    --worker-class uvicorn.workers.UvicornWorker \
    --bind 0.0.0.0:8000 \
    --timeout 120 \
    --access-logfile - \
    --error-logfile -
```

### 5.2 Frontend Production Build

```bash
# Build production bundle
npm run build

# Output will be in dist/ directory
# Serve with nginx or any static file server
```

### 5.3 Nginx Configuration

**/etc/nginx/sites-available/campaign-studio:**
```nginx
# Backend API
upstream backend {
    server localhost:8000;
}

# Frontend
server {
    listen 80;
    server_name campaign-studio.com www.campaign-studio.com;
    
    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name campaign-studio.com www.campaign-studio.com;

    # SSL certificates
    ssl_certificate /etc/letsencrypt/live/campaign-studio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/campaign-studio.com/privkey.pem;
    
    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Frontend (React app)
    location / {
        root /var/www/campaign-studio/frontend/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Backend API
    location /api {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

Enable and restart nginx:
```bash
sudo ln -s /etc/nginx/sites-available/campaign-studio /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 6. Environment Variables

### Production Environment Variables

**Backend (.env.production):**
```bash
APP_NAME=Campaign Studio API
DEBUG=false

DATABASE_HOST=production-db-host
DATABASE_PORT=5432
DATABASE_NAME=campaign_studio_prod
DATABASE_USER=prod_user
DATABASE_PASSWORD=<strong-password>

SECRET_KEY=<generate-secure-random-key-min-32-chars>
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

CORS_ORIGINS=["https://campaign-studio.com"]

ENCRYPTION_KEY=<generate-secure-32-char-key>
```

**Frontend (.env.production):**
```bash
VITE_API_BASE_URL=https://campaign-studio.com/api
VITE_APP_NAME=Campaign Studio
```

## 7. Database Migrations

```bash
# Create new migration
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head

# Rollback last migration
alembic downgrade -1

# View migration history
alembic history

# View current version
alembic current
```

## 8. Backup and Restore

### Database Backup

```bash
# Backup
pg_dump -h localhost -U postgres -d campaign-studio > backup_$(date +%Y%m%d_%H%M%S).sql

# Compressed backup
pg_dump -h localhost -U postgres -d campaign-studio | gzip > backup_$(date +%Y%m%d_%H%M%S).sql.gz

# Automated daily backup (crontab)
0 2 * * * pg_dump -h localhost -U postgres -d campaign-studio | gzip > /backups/campaign-studio_$(date +\%Y\%m\%d).sql.gz
```

### Database Restore

```bash
# Restore from backup
psql -h localhost -U postgres -d campaign-studio < backup_20260206.sql

# Restore from compressed backup
gunzip -c backup_20260206.sql.gz | psql -h localhost -U postgres -d campaign-studio
```

## 9. Monitoring and Logging

### Application Logging

**Backend (Python):**
```python
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('/var/log/campaign-studio/api.log'),
        logging.StreamHandler()
    ]
)
```

### Health Check Endpoints

Backend health check is available at:
```
GET /api/health
```

Response:
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "database": "connected"
}
```

### Monitoring Tools

- **Application Performance**: New Relic, Datadog, or Sentry
- **Server Monitoring**: Prometheus + Grafana
- **Log Management**: ELK Stack (Elasticsearch, Logstash, Kibana)
- **Uptime Monitoring**: Pingdom, UptimeRobot

## 10. Security Checklist

### Pre-Deployment Security

- [ ] Change all default passwords
- [ ] Generate secure SECRET_KEY and ENCRYPTION_KEY
- [ ] Enable HTTPS with valid SSL certificate
- [ ] Configure CORS to allow only production domains
- [ ] Set DEBUG=false in production
- [ ] Enable database encryption at rest
- [ ] Configure firewall rules (UFW or iptables)
- [ ] Set up fail2ban for SSH protection
- [ ] Enable audit logging
- [ ] Review and minimize exposed ports
- [ ] Set up database backups
- [ ] Configure rate limiting
- [ ] Enable CSRF protection
- [ ] Implement Content Security Policy headers
- [ ] Regular security updates and patches

## 11. Scaling Considerations

### Horizontal Scaling

**Load Balancer Configuration:**
```nginx
upstream backend_cluster {
    least_conn;
    server backend1:8000;
    server backend2:8000;
    server backend3:8000;
    server backend4:8000;
}
```

### Database Scaling

- **Read Replicas**: Set up PostgreSQL read replicas
- **Connection Pooling**: Use PgBouncer
- **Caching**: Implement Redis for frequently accessed data

### CDN Integration

Use CDN for static assets:
- CloudFront (AWS)
- CloudFlare
- Fastly

## 12. Troubleshooting

### Common Issues

**Database Connection Failed:**
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Check connection
psql -h localhost -U postgres -d campaign-studio

# Check logs
sudo tail -f /var/log/postgresql/postgresql-15-main.log
```

**Backend Not Starting:**
```bash
# Check logs
docker-compose logs backend

# Verify migrations
alembic current

# Test database connection
python -c "from app.database import engine; engine.connect()"
```

**Frontend Build Fails:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf node_modules/.vite
```

## 13. Maintenance

### Regular Tasks

- **Daily**: Monitor logs and error rates
- **Weekly**: Review security alerts, update dependencies
- **Monthly**: Database optimization, backup verification
- **Quarterly**: Security audit, performance review

### Update Procedure

```bash
# 1. Backup database
pg_dump campaign-studio > backup_pre_update.sql

# 2. Pull latest code
git pull origin main

# 3. Update backend dependencies
cd backend
pip install -r requirements.txt

# 4. Run migrations
alembic upgrade head

# 5. Update frontend
cd ../frontend
npm install
npm run build

# 6. Restart services
sudo systemctl restart campaign-studio-api
sudo systemctl reload nginx

# 7. Verify deployment
curl http://localhost:8000/api/health
```

This deployment guide provides comprehensive instructions for setting up Campaign Studio in various environments.
