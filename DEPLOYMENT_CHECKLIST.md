# ✅ VoiceBot Deployment Checklist

## Before You Start

### Local Prerequisites
- [ ] Git installed (`git --version`)
- [ ] gcloud CLI installed (`gcloud --version`)
- [ ] GitHub account with SSH/token configured
- [ ] Your OpenAI API key ready
- [ ] GCP project created (Project ID: `custom-temple-472421-i9`)

---

## Step 1: GitHub Setup (5 minutes)

### Local Setup
```powershell
cd c:\Users\Shah\Desktop\assessment_project

# Check everything is clean
git status  # Should show untracked/new files

# Initialize git
git init

# Add all files (respects .gitignore)
git add .

# Commit
git commit -m "Initial commit: VoiceBot - AI Voice Assistant"

# Add remote
git remote add origin https://github.com/YOUR_USERNAME/voicebot.git

# Create main branch and push
git branch -M main
git push -u origin main
```

### Verification
- [ ] Repository shows on GitHub: `https://github.com/YOUR_USERNAME/voicebot`
- [ ] All files visible on GitHub
- [ ] No `.env` files exposed (should be in .gitignore)

---

## Step 2: Google Cloud Setup (10 minutes)

### Enable APIs
```bash
gcloud config set project custom-temple-472421-i9

# Enable required services
gcloud services enable \
  cloudbuild.googleapis.com \
  run.googleapis.com \
  containerregistry.googleapis.com \
  artifactregistry.googleapis.com
```

- [ ] APIs enabled in GCP console

### Create Service Account
```bash
gcloud iam service-accounts create cloud-build-bot \
  --display-name="Cloud Build Bot"
```

- [ ] Service account created

### Grant Permissions
```bash
# Cloud Run admin
gcloud projects add-iam-policy-binding custom-temple-472421-i9 \
  --member=serviceAccount:cloud-build-bot@custom-temple-472421-i9.iam.gserviceaccount.com \
  --role=roles/run.admin

# Service account user
gcloud projects add-iam-policy-binding custom-temple-472421-i9 \
  --member=serviceAccount:cloud-build-bot@custom-temple-472421-i9.iam.gserviceaccount.com \
  --role=roles/iam.serviceAccountUser

# Storage admin (for artifacts)
gcloud projects add-iam-policy-binding custom-temple-472421-i9 \
  --member=serviceAccount:cloud-build-bot@custom-temple-472421-i9.iam.gserviceaccount.com \
  --role=roles/storage.admin
```

- [ ] All permissions granted

### Store OpenAI Key in Secret Manager
```bash
# Create secret (replace with your real key)
echo -n "sk-proj-JcDnpeh4mbvAJg-..." | \
  gcloud secrets create openai-api-key --data-file=-

# Grant access to Cloud Build service account
gcloud secrets add-iam-policy-binding openai-api-key \
  --member=serviceAccount:cloud-build-bot@custom-temple-472421-i9.iam.gserviceaccount.com \
  --role=roles/secretmanager.secretAccessor
```

- [ ] OpenAI key stored in Secret Manager
- [ ] Cloud Build can access the secret

---

## Step 3: Connect GitHub to Cloud Build (5 minutes)

### Via Cloud Console
1. Go to: https://console.cloud.google.com/cloud-build/triggers
2. Click "Connect Repository"
3. Select GitHub (you may need to authorize)
4. Select your `voicebot` repository
5. Click "Connect"

- [ ] GitHub connected to Cloud Build

---

## Step 4: Create Build Triggers

### Backend Trigger
1. Click "Create Trigger"
2. **Name**: `voicebot-backend`
3. **Repository**: Select `voicebot`
4. **Branch**: `main`
5. **Build config**: `cloudbuild.yaml`
6. Click "Create"

- [ ] Backend trigger created

### Frontend Trigger  
1. Click "Create Trigger"
2. **Name**: `voicebot-frontend`
3. **Repository**: Select `voicebot`
4. **Branch**: `main`
5. **Build config**: `cloudbuild-frontend.yaml`
6. Click "Create"

- [ ] Frontend trigger created

---

## Step 5: Deploy! 🚀

### First Deployment
```bash
cd c:\Users\Shah\Desktop\assessment_project

# Update cloudbuild.yaml with your secret reference
# Then push
git push origin main

# Cloud Build will automatically trigger!
```

### Monitor Deployment
```bash
# Watch builds
gcloud builds list --limit=5

# View specific build logs
gcloud builds log [BUILD_ID]

# Check deployed services
gcloud run services list --region us-central1

# Get backend URL
gcloud run services describe voicebot-backend --region us-central1 --format='value(status.url)'
```

- [ ] Backend deployed successfully
- [ ] Backend service running and accessible
- [ ] Get backend URL (e.g., `https://voicebot-backend-xxxxx.a.run.app`)

### Update Frontend with Backend URL
```bash
# Edit cloudbuild-frontend.yaml
# Update _BACKEND_URL with your actual backend URL

git add cloudbuild-frontend.yaml
git commit -m "Update backend URL for frontend"
git push origin main

# Frontend will deploy automatically
```

- [ ] Frontend deployed successfully
- [ ] Frontend accessible at its URL
- [ ] Frontend can communicate with backend

---

## Step 6: Verify Deployment

### Backend Health Check
```bash
curl https://voicebot-backend-xxxxx.a.run.app/health
# Expected: {"status":"ok"}
```

- [ ] Backend health endpoint responds

### Frontend Access
Open in browser: `https://voicebot-frontend-xxxxx.a.run.app`

- [ ] Frontend loads without errors
- [ ] Can record and send audio
- [ ] Receives responses from backend

### Test End-to-End Flow
1. Click "Start Recording"
2. Say something like "Hello"
3. Click "Stop Recording"
4. Verify transcript appears
5. Wait for AI response

- [ ] Audio recorded successfully
- [ ] Speech-to-text works
- [ ] Chat receives response
- [ ] Text-to-speech plays

---

## Optional: Production Setup

### Configure Custom Domain
```bash
# Map custom domain to Cloud Run service
gcloud run domain-mappings create \
  --service=voicebot-frontend \
  --domain=yourdomain.com \
  --region=us-central1
```

- [ ] Custom domain configured (if desired)

### Enable Auto-Scaling
- [ ] Verified auto-scaling is enabled in Cloud Run settings
- [ ] Memory set to appropriate level (512MB backend, 256MB frontend)
- [ ] Concurrency limits set

### Set Up Monitoring
```bash
# View real-time logs
gcloud logging read "resource.type=cloud_run_revision" --limit=50 --format=json
```

- [ ] Monitoring/logging configured
- [ ] Error alerts set up

### Enable IAP (if needed)
- [ ] Identity-Aware Proxy configured for security

---

## Troubleshooting Checklist

### Build Fails
- [ ] Check build logs: `gcloud builds log [BUILD_ID]`
- [ ] Verify Dockerfile paths in cloudbuild.yaml
- [ ] Ensure dependencies are correct
- [ ] Check .gcloudignore excludes other services

### Deploy Fails
- [ ] Verify service account has correct IAM roles
- [ ] Check OpenAI key is accessible from Secret Manager
- [ ] Ensure port 8080 is exposed in Dockerfile
- [ ] Review Cloud Run logs

### Frontend Can't Reach Backend
- [ ] Verify backend URL in frontend environment variable
- [ ] Check CORS is enabled on backend
- [ ] Ensure both services are running
- [ ] Check browser network tab for errors

### High Costs
- [ ] Set Cloud Budget alerts: https://console.cloud.google.com/billing/budgets
- [ ] Review Cloud Run memory allocation
- [ ] Check for unnecessary API calls
- [ ] Consider reserved capacity for production

---

## Maintenance

### Regular Updates
- [ ] Update dependencies monthly
- [ ] Monitor API quotas
- [ ] Review Cloud Logging for errors
- [ ] Test disaster recovery

### Scaling
- [ ] Monitor request latency
- [ ] Adjust memory/CPU if needed
- [ ] Consider caching frequently used responses

### Security
- [ ] Rotate OpenAI keys periodically
- [ ] Review IAM permissions monthly
- [ ] Check for exposed secrets
- [ ] Update base Docker images

---

## Done! 🎉

**Your VoiceBot application is now live on Google Cloud Run!**

### What You've Accomplished
✅ Cleaned and prepared code for GitHub  
✅ Set up Google Cloud infrastructure  
✅ Configured automated deployments  
✅ Deployed to Cloud Run  
✅ Verified end-to-end functionality  

### Next Steps
- Share your app URL with others
- Monitor performance and costs
- Set up additional monitoring/alerts
- Consider adding CI/CD for additional environments

---

**Need help?** Check these guides:
- `README.md` - Project documentation
- `GITHUB_DEPLOYMENT_GUIDE.md` - Detailed deployment steps
- `DEPLOYMENT_READY.md` - Project readiness summary

Good luck! 🚀
