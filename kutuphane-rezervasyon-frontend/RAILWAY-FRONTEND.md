# Railway Configuration for Frontend

## Service: kutuphane-frontend

### Build Settings
- **Builder:** Dockerfile
- **Dockerfile Path:** ./Dockerfile
- **Build Command:** (automatic via Docker)
- **Root Directory:** /

### Environment Variables
Add these in Railway Dashboard:

```env
# Application
NODE_ENV=production
PORT=80

# Backend API URL (Railway backend service URL)
API_URL=https://kutuphane-backend.up.railway.app
NEXT_PUBLIC_API_URL=https://kutuphane-backend.up.railway.app

# CORS Origins (Railway frontend URL)
CORS_ALLOWED_ORIGINS=https://kutuphane-frontend.up.railway.app
```

### Deploy Settings
- **Start Command:** (automatic via Docker ENTRYPOINT)
- **Health Check Path:** /
- **Health Check Timeout:** 300 seconds

### Networking
- **Port:** 80 (internal)
- **Public Domain:** Auto-generated or custom domain

### Resources
- **Memory:** 512 MB (recommended)
- **CPU:** 0.5 vCPU (recommended)

## Setup Instructions

### 1. Install Railway CLI
```bash
npm install -g @railway/cli
```

### 2. Login to Railway
```bash
railway login
```

### 3. Initialize Project
```bash
railway init
```

### 4. Link to Service
```bash
railway link
```

### 5. Set Environment Variables
```bash
railway variables set NODE_ENV=production
railway variables set API_URL=https://your-backend-url.up.railway.app
```

### 6. Deploy
```bash
railway up
```

## Automatic Deployment

After connecting to GitHub:
1. Push to `main` branch
2. Railway automatically builds Docker image
3. Deploys to production
4. Assigns a public URL

## Custom Domain (Optional)

1. Go to Railway Dashboard
2. Select your service
3. Click "Settings" → "Domains"
4. Add custom domain: `kutuphane.yourdomain.com`
5. Update DNS records as shown

## Monitoring

- View logs: `railway logs`
- View metrics: Railway Dashboard → Metrics tab
- Health check: Visit `https://your-app.up.railway.app/`

## Troubleshooting

### Build fails
- Check Dockerfile syntax
- Verify `package.json` dependencies
- Check Railway build logs

### App crashes
- View logs: `railway logs --tail 100`
- Check environment variables
- Verify port configuration (PORT=80)

### High memory usage
- Increase memory limit in Railway dashboard
- Optimize Docker image size
- Enable build caching
