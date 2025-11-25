# Deployment Guide

This guide covers deploying the Meta Growth Agent platform to production.

## Architecture Overview

The platform consists of:
- **Backend**: FastAPI application with Celery workers
- **Frontend**: React SPA (Single Page Application)
- **Database**: PostgreSQL
- **Cache/Queue**: Redis
- **Services**: Meta Ads API, Competitor Intelligence APIs, LLM APIs

## Deployment Options

### Option 1: Vercel (Frontend) + Railway/Render (Backend)

#### Frontend on Vercel

1. **Connect Repository**
   - Go to [Vercel](https://vercel.com)
   - Import your GitHub repository
   - Set root directory to `frontend`

2. **Environment Variables**
   ```
   VITE_API_URL=https://your-backend-api.com
   ```

3. **Build Settings**
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`

4. **Deploy**
   - Vercel will automatically deploy on every push to main branch

#### Backend on Railway/Render

1. **Create New Service**
   - Connect your GitHub repository
   - Set root directory to project root (not frontend)

2. **Environment Variables**
   ```
   DATABASE_URL=postgresql://...
   REDIS_URL=redis://...
   META_ADS_TOKEN=...
   ANTHROPIC_API_KEY=...
   GOOGLE_API_KEY=...
   JWT_SECRET=your-secret-key
   ENVIRONMENT=production
   ```

3. **Build & Start Commands**
   - Build: `pip install -r requirements.txt`
   - Start: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

4. **Workers**
   - Create separate services for Celery worker and beat:
     - Worker: `celery -A app.tasks.worker worker -l info`
     - Beat: `celery -A app.tasks.worker beat -l info`

### Option 2: Docker Compose (Self-Hosted)

1. **Update docker-compose.yml**
   ```yaml
   services:
     frontend:
       build:
         context: ./frontend
         dockerfile: Dockerfile
       ports:
         - "80:80"
       environment:
         - VITE_API_URL=http://backend:8000
     
     backend:
       build: .
       ports:
         - "8000:8000"
       environment:
         - DATABASE_URL=postgresql://...
       depends_on:
         - postgres
         - redis
   ```

2. **Build and Deploy**
   ```bash
   docker-compose build
   docker-compose up -d
   ```

### Option 3: AWS/GCP/Azure

#### Frontend (S3 + CloudFront)

1. Build frontend:
   ```bash
   cd frontend
   npm run build
   ```

2. Upload `dist/` to S3 bucket

3. Configure CloudFront distribution pointing to S3

4. Set environment variable `VITE_API_URL` to your backend URL

#### Backend (ECS/Fargate or Cloud Run)

1. Create Dockerfile for backend
2. Push to container registry
3. Deploy to ECS/Fargate or Cloud Run
4. Configure environment variables
5. Set up RDS (PostgreSQL) and ElastiCache (Redis)

## Environment Configuration

### Production Checklist

- [ ] Set strong `JWT_SECRET`
- [ ] Configure production database
- [ ] Set up Redis instance
- [ ] Add all required API keys
- [ ] Configure CORS origins (remove `*`)
- [ ] Set up SSL/TLS certificates
- [ ] Configure domain names
- [ ] Set up monitoring and logging
- [ ] Configure backup strategy
- [ ] Set up alerting

### CORS Configuration

Update `app/main.py` for production:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://your-frontend-domain.com",
        "https://www.your-frontend-domain.com",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)
```

## Database Setup

1. **Create Database**
   ```sql
   CREATE DATABASE meta_growth_agent;
   ```

2. **Run Migrations** (when Alembic is set up)
   ```bash
   alembic upgrade head
   ```

3. **Initialize Schema**
   - The app will create tables on first startup via `init_db()`

## Monitoring

### Health Checks

- Backend: `GET /health`
- Frontend: Built-in Vite health check

### Logging

- Backend uses `structlog` for structured logging
- Configure log aggregation service (Datadog, LogRocket, etc.)

### Metrics

- Set up OpenTelemetry endpoint if configured
- Monitor Celery task queue length
- Track API response times

## Security

1. **Secrets Management**
   - Use environment variables or secret management service
   - Never commit secrets to git

2. **API Security**
   - Enable rate limiting
   - Implement proper authentication
   - Use HTTPS everywhere

3. **Database Security**
   - Use connection pooling
   - Enable SSL for database connections
   - Regular backups

## Scaling

### Horizontal Scaling

- **API**: Deploy multiple FastAPI instances behind load balancer
- **Workers**: Scale Celery workers based on queue length
- **Database**: Use read replicas for read-heavy workloads

### Vertical Scaling

- Increase database instance size
- Add more Redis memory
- Increase worker resources

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Check `allow_origins` in CORS middleware
   - Verify frontend URL matches configured origins

2. **Database Connection**
   - Verify `DATABASE_URL` format
   - Check network connectivity
   - Verify database credentials

3. **Worker Not Processing**
   - Check Redis connection
   - Verify Celery worker is running
   - Check task queue for errors

4. **Frontend API Errors**
   - Verify `VITE_API_URL` is set correctly
   - Check backend is accessible from frontend
   - Verify authentication tokens

## Support

For deployment issues, check:
- Application logs
- Infrastructure logs
- Health check endpoints
- Database connection status

