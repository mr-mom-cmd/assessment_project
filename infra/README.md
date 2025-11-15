# Infra / Deployment Notes

## 1. Build & Push Backend

```bash
cd backend
gcloud builds submit --tag gcr.io/PROJECT_ID/voicebot-backend
```

## 2. Deploy Backend to Cloud Run

```bash
gcloud run deploy voicebot-backend \
  --image gcr.io/PROJECT_ID/voicebot-backend \
  --platform managed \
  --region asia-southeast1 \
  --allow-unauthenticated
```

Attach secrets / env vars as needed.

## 3. Build & Deploy Frontend

```bash
cd frontend
gcloud builds submit --tag gcr.io/PROJECT_ID/voicebot-frontend
gcloud run deploy voicebot-frontend \
  --image gcr.io/PROJECT_ID/voicebot-frontend \
  --platform managed \
  --region asia-southeast1 \
  --allow-unauthenticated
```

Set `VITE_API_BASE_URL` in your frontend build or as a runtime config (e.g., using env and a small config endpoint).
