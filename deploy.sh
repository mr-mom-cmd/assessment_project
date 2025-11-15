#!/bin/bash
# 🚀 VoiceBot - One-Step Cloud Run Deployment Script
# Usage: ./deploy.sh your-project-id your-github-username

set -e

PROJECT_ID="${1:-}"
GITHUB_USER="${2:-}"

if [ -z "$PROJECT_ID" ] || [ -z "$GITHUB_USER" ]; then
    echo "🚀 VoiceBot Cloud Run Deployment"
    echo ""
    echo "Usage: ./deploy.sh PROJECT_ID GITHUB_USERNAME"
    echo ""
    echo "Example:"
    echo "  ./deploy.sh my-gcp-project-id myusername"
    echo ""
    exit 1
fi

REPO="voicebot"
BACKEND_URL=""

echo ""
echo "🚀 Starting VoiceBot deployment..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Project ID: $PROJECT_ID"
echo "GitHub User: $GITHUB_USER"
echo "Repository: $REPO"
echo ""

# Set project
echo "1️⃣  Setting GCP project..."
gcloud config set project "$PROJECT_ID"
echo "✅ Project set to $PROJECT_ID"
echo ""

# Deploy Backend
echo "2️⃣  Deploying backend service..."
echo "This may take 3-5 minutes..."
gcloud run deploy voicebot-backend \
    --source "https://github.com/$GITHUB_USER/$REPO/backend" \
    --region us-central1 \
    --allow-unauthenticated \
    --set-env-vars="OPENAI_API_KEY=$OPENAI_API_KEY,OPENAI_MODEL_STT=whisper-1,OPENAI_MODEL_TTS=gpt-4o-mini-tts,OPENAI_MODEL_CHAT=gpt-4o-mini" \
    --port 8080

echo "✅ Backend deployed!"
echo ""

# Get backend URL
echo "3️⃣  Getting backend URL..."
BACKEND_URL=$(gcloud run services describe voicebot-backend \
    --region us-central1 \
    --format='value(status.url)')
echo "Backend URL: $BACKEND_URL"
echo ""

# Deploy Frontend
echo "4️⃣  Deploying frontend service..."
echo "This may take 3-5 minutes..."
gcloud run deploy voicebot-frontend \
    --source "https://github.com/$GITHUB_USER/$REPO/frontend" \
    --region us-central1 \
    --allow-unauthenticated \
    --set-env-vars="VITE_API_BASE_URL=$BACKEND_URL" \
    --port 8080

echo "✅ Frontend deployed!"
echo ""

# Get frontend URL
echo "5️⃣  Getting frontend URL..."
FRONTEND_URL=$(gcloud run services describe voicebot-frontend \
    --region us-central1 \
    --format='value(status.url)')
echo "Frontend URL: $FRONTEND_URL"
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 Deployment Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📍 Your VoiceBot is live at:"
echo "   🎙️  $FRONTEND_URL"
echo ""
echo "Backend API:"
echo "   📡 $BACKEND_URL"
echo ""
echo "✨ Enjoy your VoiceBot!"
echo ""
