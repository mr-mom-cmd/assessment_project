# 🚀 Cloud Run Deployment Guide

This guide shows how to deploy VoiceBot to Google Cloud Run from GitHub.

## Prerequisites

- GitHub repository with code pushed
- Google Cloud Project created
- gcloud CLI installed locally
- Billing enabled on GCP project

## Deployment Steps

### Option 1: Direct Cloud Run Deployment (Recommended)

Cloud Run will automatically build your Docker images from GitHub source code.

#### 1. Create Backend Service

```bash
gcloud run deploy voicebot-backend \
  --source https://github.com/YOUR_USERNAME/voicebot/backend \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars="OPENAI_API_KEY=sk-your-key,OPENAI_MODEL_STT=whisper-1,OPENAI_MODEL_TTS=gpt-4o-mini-tts,OPENAI_MODEL_CHAT=gpt-4o-mini" \
  --port 8080
```

#### 2. Get Backend URL

```bash
gcloud run services describe voicebot-backend \
  --region us-central1 \
  --format='value(status.url)'
```

#### 3. Update Frontend Configuration

After getting the backend URL, update `frontend/.env`:
```
VITE_API_BASE_URL=https://voicebot-backend-xxxxx.a.run.app
```

#### 4. Create Frontend Service

```bash
gcloud run deploy voicebot-frontend \
  --source https://github.com/YOUR_USERNAME/voicebot/frontend \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080
```

#### 5. Get Frontend URL

```bash
gcloud run services describe voicebot-frontend \
  --region us-central1 \
  --format='value(status.url)'
```

Your app is now live at the frontend URL!

---

### Option 2: Via Google Cloud Console (Web UI)

1. Go to [Cloud Run Console](https://console.cloud.google.com/run)
2. Click "**Create Service**"
3. Choose "**Deploy from source code**"
4. Connect your GitHub repository
5. Select branch: `main`
6. Runtime: Python 3.11 (backend) / Node.js 20 (frontend)
7. Set environment variables
8. Click "Deploy"

---

### Option 3: Using Cloud Build (CI/CD)

For automatic deployments on every push:

#### Create `cloudbuild.yaml`

```yaml
steps:
  # Build backend
  - name: 'gcr.io/cloud-builders/docker'
    args:
      - 'build'
      - '-t'
      - 'gcr.io/$PROJECT_ID/voicebot-backend'
      - '-f'
      - 'backend/Dockerfile'
      - './backend'

  # Push backend
  - name: 'gcr.io/cloud-builders/docker'
    args:
      - 'push'
      - 'gcr.io/$PROJECT_ID/voicebot-backend'

  # Deploy backend
  - name: 'gcr.io/cloud-builders/gke-deploy'
    args:
      - 'run'
      - 'deploy'
      - 'voicebot-backend'
      - '--source=.'
      - '--region=us-central1'
      - '--image=gcr.io/$PROJECT_ID/voicebot-backend'

  # Build frontend
  - name: 'gcr.io/cloud-builders/docker'
    args:
      - 'build'
      - '-t'
      - 'gcr.io/$PROJECT_ID/voicebot-frontend'
      - '-f'
      - 'frontend/Dockerfile'
      - './frontend'

  # Push frontend
  - name: 'gcr.io/cloud-builders/docker'
    args:
      - 'push'
      - 'gcr.io/$PROJECT_ID/voicebot-frontend'

  # Deploy frontend
  - name: 'gcr.io/cloud-builders/gke-deploy'
    args:
      - 'run'
      - 'deploy'
      - 'voicebot-frontend'
      - '--source=.'
      - '--region=us-central1'
      - '--image=gcr.io/$PROJECT_ID/voicebot-frontend'

images:
  - 'gcr.io/$PROJECT_ID/voicebot-backend'
  - 'gcr.io/$PROJECT_ID/voicebot-frontend'
```

Set up Cloud Build trigger:
```bash
gcloud builds connect --repository-name=voicebot --repository-owner=YOUR_USERNAME
```

---

## Environment Variables

### Backend (Cloud Run)

In the Cloud Run service settings, add:

| Variable | Value |
|----------|-------|
| `OPENAI_API_KEY` | Your OpenAI API key |
| `OPENAI_MODEL_STT` | `whisper-1` |
| `OPENAI_MODEL_TTS` | `gpt-4o-mini-tts` |
| `OPENAI_MODEL_CHAT` | `gpt-4o-mini` |

### Frontend (Cloud Run)

In the Cloud Run service settings, add:

| Variable | Value |
|----------|-------|
| `VITE_API_BASE_URL` | Backend service URL |

---

## Security Best Practices

### 1. Use Secret Manager

Instead of storing API keys in environment variables:

```bash
# Create secret
echo -n "sk-your-key-here" | gcloud secrets create openai-api-key --data-file=-

# Grant Cloud Run access
gcloud secrets add-iam-policy-binding openai-api-key \
  --member=serviceAccount:PROJECT_ID@appspot.gserviceaccount.com \
  --role=roles/secretmanager.secretAccessor

# Update Cloud Run
gcloud run deploy voicebot-backend \
  --update-secrets=OPENAI_API_KEY=openai-api-key:latest \
  --region=us-central1
```

### 2. Restrict CORS

In `backend/app/main.py`, restrict to your frontend domain:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://voicebot-frontend-xxxxx.a.run.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 3. Require Authentication

Remove `--allow-unauthenticated` and manage access:

```bash
gcloud run deploy voicebot-frontend \
  --remove-unauthenticated
```

Then grant access to specific users/service accounts.

### 4. Custom Domain

```bash
gcloud run domain-mappings create \
  --service=voicebot-frontend \
  --domain=voicebot.example.com \
  --region=us-central1
```

---

## Monitoring & Logs

### View Logs

```bash
# Backend logs
gcloud run services logs read voicebot-backend \
  --region=us-central1 \
  --limit=50

# Frontend logs
gcloud run services logs read voicebot-frontend \
  --region=us-central1 \
  --limit=50
```

### Set Up Alerts

In Cloud Console → Monitoring:
1. Create alert policy
2. Select "Cloud Run"
3. Choose metrics (error rate, response time, etc.)
4. Set thresholds
5. Add notification channels

---

## Troubleshooting

### Deployment Fails

Check Cloud Build logs:
```bash
gcloud builds list
gcloud builds log BUILD_ID
```

### Backend returns 500 errors

```bash
# Check environment variables
gcloud run services describe voicebot-backend --region=us-central1

# Test API manually
curl https://voicebot-backend-xxxxx.a.run.app/health
```

### CORS errors

Verify `allow_origins` in backend and set correct frontend URL as environment variable.

### High latency

- Check CPU/Memory allocation (increase if needed)
- Review OpenAI API response times
- Enable Cloud CDN for frontend
- Use regional load balancing

---

## Scaling & Performance

### Automatic Scaling

Cloud Run auto-scales based on traffic. Adjust:

```bash
gcloud run deploy voicebot-backend \
  --min-instances=1 \
  --max-instances=100 \
  --memory=512Mi \
  --cpu=1 \
  --timeout=3600
```

### Manual Scaling

View current instances:
```bash
gcloud run services describe voicebot-backend --region=us-central1
```

---

## Cost Optimization

- Use `--min-instances=0` for minimal idle costs
- Set appropriate CPU/Memory (512Mi and 1 CPU are defaults)
- Use Cloud Build's free tier (180 build-minutes/day)
- Enable VPC to route through private network

---

## Cleanup

To delete deployed services:

```bash
gcloud run services delete voicebot-backend --region=us-central1
gcloud run services delete voicebot-frontend --region=us-central1
```

To free up resources:
```bash
gcloud container images delete gcr.io/PROJECT_ID/voicebot-backend
gcloud container images delete gcr.io/PROJECT_ID/voicebot-frontend
```

---

## Next Steps

- Set up CI/CD with Cloud Build
- Configure custom domain
- Set up monitoring alerts
- Optimize database queries (if using)
- Scale infrastructure based on demand

For more info: [Cloud Run Documentation](https://cloud.google.com/run/docs)
