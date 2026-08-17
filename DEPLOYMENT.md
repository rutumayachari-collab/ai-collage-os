# Production Deployment Guide

## Architecture

- **Frontend**: Vercel / Cloudflare Pages
- **Backend**: Render / Railway / Fly.io
- **Database**: MongoDB Atlas
- **CDN**: Vercel Edge Network (frontend)

## Prerequisites

1. MongoDB Atlas cluster with IP whitelist configured for the backend host
2. Backend hosting account (Render / Railway)
3. Frontend hosting account (Vercel)
4. Domain name (optional but recommended)

## Environment Variables

### Backend (Set in hosting platform)

```
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/aicollegeos?retryWrites=true&w=majority
JWT_SECRET=<production-secret-min-32-chars>
JWT_EXPIRES_IN=7d
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=<smtp-user>
EMAIL_PASS=<smtp-password>
CLIENT_URL=https://<frontend-production-url>
AI_PROVIDER=OPENAI
AI_MODEL=gpt-4o-mini
AI_API_KEY=<openai-api-key>
AI_BASE_URL=https://api.openai.com/v1
AI_TIMEOUT_MS=30000
AI_MAX_RETRIES=2
```

**CRITICAL**: Never expose `JWT_SECRET`, `MONGODB_URI` password, `EMAIL_PASS`, or `AI_API_KEY` to the frontend.

### Frontend (Set in Vercel / hosting platform)

```
VITE_API_BASE_URL=https://<backend-production-url>/api/v1
```

## Deployment Steps

### 1. MongoDB Atlas

- Create cluster
- Database: `aicollegeos`
- User: `aicollegeos_app` (or dedicated production user)
- Network Access: Add backend host IP (NOT 0.0.0.0/0)
- TLS: Enabled (default)
- Get SRV URI

### 2. Backend

**Option A: Render**
- Connect GitHub repo
- Root directory: `backend`
- Build command: `npm install && npm run build`
- Start command: `node dist/server.js`
- Add all environment variables
- Deploy

**Option B: Railway**
- Connect GitHub repo
- Root directory: `backend`
- Start command: `node dist/server.js`
- Add all environment variables
- Deploy

**Option C: Fly.io**
- `fly launch` in backend directory
- Set secrets via `fly secrets set`
- Deploy

### 3. Frontend

**Vercel**
- Import project from GitHub
- Root directory: `frontned`
- Build command: `npm run build`
- Output directory: `.output`
- Add `VITE_API_BASE_URL` environment variable
- Deploy

**Cloudflare Pages**
- Connect repo
- Build command: `npm run build`
- Output: `.output`
- Add `VITE_API_BASE_URL` environment variable

## Verification Checklist

- [ ] Backend health endpoint returns 200
- [ ] MongoDB connection successful
- [ ] CORS allows frontend origin
- [ ] Frontend loads without console errors
- [ ] Login works
- [ ] Protected routes redirect unauthenticated users
- [ ] Role-based navigation works
- [ ] API calls use production URL
- [ ] No secrets in frontend bundle
- [ ] HTTPS enabled on both frontend and backend
