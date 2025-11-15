# 📦 Deployment from GitHub to Google Cloud Run

This guide walks you through deploying VoiceBot from GitHub to Google Cloud Run.

## Prerequisites

✅ GitHub repository with VoiceBot code  
✅ Google Cloud Project created  
✅ gcloud CLI installed and authenticated  
✅ OpenAI API key  

## 🚀 Step 1: Push Code to GitHub

```bash
cd c:\Users\Shah\Desktop\assessment_project

# Initialize git (if not already done)
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: VoiceBot full-stack application"

# Add GitHub remote
git remote add origin https://github.com/YOUR_USERNAME/voicebot.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## ☁️ Step 2: Set Up Google Cloud

### 2.1 Create Cloud Build Service Account

```bash
# Set your project
gcloud config set project custom-temple-472421-i9

# Enable required APIs
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com

# Create service account for Cloud Build
gcloud iam service-accounts create cloud-build-bot \
  --display-name="Cloud Build Bot"

# Grant permissions
gcloud projects add-iam-policy-binding custom-temple-472421-i9 \
  --member=serviceAccount:cloud-build-bot@custom-temple-472421-i9.iam.gserviceaccount.com \
  --role=roles/run.admin

gcloud projects add-iam-policy-binding custom-temple-472421-i9 \
  --member=serviceAccount:cloud-build-bot@custom-temple-472421-i9.iam.gserviceaccount.com \
  --role=roles/iam.serviceAccountUser

gcloud projects add-iam-policy-binding custom-temple-472421-i9 \
  --member=serviceAccount:cloud-build-bot@custom-temple-472421-i9.iam.gserviceaccount.com \
  --role=roles/storage.admin
```

### 2.2 Store OpenAI Key in Cloud Secret Manager

```bash
# Create secret
echo -n "sk-your-actual-openai-key-here" | gcloud secrets create openai-api-key --data-file=-

# Grant Cloud Build access to secret
gcloud secrets add-iam-policy-binding openai-api-key \
  --member=serviceAccount:cloud-build-bot@custom-temple-472421-i9.iam.gserviceaccount.com \
  --role=roles/secretmanager.secretAccessor
```

## 🏗️ Step 3: Configure Cloud Build Triggers

### Option A: Deploy Backend

1. Go to: https://console.cloud.google.com/cloud-build/triggers?project=custom-temple-472421-i9

2. Click **"Create Trigger"**

3. Fill in:
   - **Name:** `voicebot-backend-build`
   - **Repository:** Select your GitHub repo (you may need to connect GitHub first)
   - **Branch:** `main`
   - **Build configuration:** `Cloud Build configuration file (yaml or json)`
   - **Location:** `cloudbuild.yaml`

4. Click **"Create"**

### Option B: Deploy Frontend

1. Click **"Create Trigger"** again

2. Fill in:
   - **Name:** `voicebot-frontend-build`
   - **Repository:** Your GitHub repo
   - **Branch:** `main`
   - **Build configuration:** `Cloud Build configuration file (yaml or json)`
   - **Location:** `cloudbuild-frontend.yaml`

3. Click **"Create"**

## 🔑 Step 4: Set Secret Manager Integration

Update `cloudbuild.yaml` to use Secret Manager:

```yaml
steps:
  # Build backend Docker image
  - name: 'gcr.io/cloud-builders/docker'
    dir: 'backend'
    args:
      - 'build'
      - '-t'
      - 'gcr.io/$PROJECT_ID/voicebot-backend:latest'
      - '.'

  # Deploy with secret
  - name: 'gcr.io/cloud-builders/gcloud'
    entrypoint: bash
    args:
      - '-c'
      - |
        gcloud secrets versions access latest --secret="openai-api-key" > /workspace/openai_key.txt
        OPENAI_KEY=$(cat /workspace/openai_key.txt)
        gcloud run deploy voicebot-backend \
          --image=gcr.io/$PROJECT_ID/voicebot-backend:latest \
          --region=us-central1 \
          --allow-unauthenticated \
          --set-env-vars=OPENAI_API_KEY=$OPENAI_KEY,OPENAI_MODEL_STT=whisper-1
```

## 📤 Step 5: Deploy Backend

### Via GitHub Push
```bash
# Commit changes
git add cloudbuild.yaml
git commit -m "Add Cloud Build configuration"
git push origin main

# Cloud Build will automatically trigger
```

### Via Manual Trigger
```bash
# Or manually trigger the build
gcloud builds submit --config=cloudbuild.yaml
```

## 📊 Monitor Deployment

```bash
# View build logs
gcloud builds log [BUILD_ID]

# List all builds
gcloud builds list

# View Cloud Run service
gcloud run services describe voicebot-backend --region us-central1

# Get service URL
gcloud run services describe voicebot-backend \
  --region us-central1 \
  --format='value(status.url)'
```

## ✅ Verify Deployment

```bash
# Test backend health
curl https://voicebot-backend-xxxxx.a.run.app/health

# Should return: {"status":"ok"}
```

## 🔄 Step 6: Deploy Frontend

Once backend is deployed, update frontend:

1. Get backend URL from previous step
2. Update `cloudbuild-frontend.yaml` with backend URL
3. Push to trigger frontend build

Or manually:
```bash
gcloud builds submit --config=cloudbuild-frontend.yaml \
  --substitutions=_BACKEND_URL="https://voicebot-backend-xxxxx.a.run.app"
```

## 🛡️ Production Checklist

- [ ] OpenAI key stored in Secret Manager (not .env)
- [ ] CORS configured for frontend domain
- [ ] Cloud Armor enabled for DDoS protection
- [ ] Custom domain configured
- [ ] SSL/TLS certificate enabled
- [ ] Cloud Logging configured
- [ ] Error monitoring enabled
- [ ] Backup and disaster recovery plan

## 📋 Troubleshooting

### Build fails: "unable to prepare context"
- Ensure Dockerfile path is correct in cloudbuild.yaml
- Check `dir:` field matches your directory structure

### Deploy fails: "Container failed to start"
- Check logs: `gcloud run services describe voicebot-backend --region us-central1`
- Verify environment variables are set
- Check OpenAI API key validity

### Frontend can't reach backend
- Get backend URL: `gcloud run services describe voicebot-backend --region us-central1 --format='value(status.url)'`
- Update frontend .env or environment variable
- Redeploy frontend

### Permission denied errors
- Grant Cloud Build service account permissions
- Check IAM roles are assigned correctly
- Verify Secret Manager access

## 📚 Additional Resources

- [Cloud Build Documentation](https://cloud.google.com/build/docs)
- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Connecting GitHub to Cloud Build](https://cloud.google.com/build/docs/repositories/github-app-deploy)
- [Using Secrets with Cloud Build](https://cloud.google.com/build/docs/securing-builds/use-secrets)

## ✨ Next Steps

After successful deployment:

1. **Set up monitoring**: Configure Cloud Logging and Monitoring
2. **Enable CI/CD**: Automatic builds on every push to main
3. **Custom domain**: Add your own domain with SSL
4. **Scaling**: Adjust memory/CPU based on usage
5. **Cost optimization**: Set up budget alerts

---

**Your services are now live on Google Cloud Run! 🚀**
