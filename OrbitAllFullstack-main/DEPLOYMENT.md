# Vercel Deployment Guide

This guide will help you deploy the Orbit AI application to Vercel.

## 📋 Prerequisites

- Vercel account (free at https://vercel.com)
- GitHub account with your repository
- Backend already deployed (or use existing backend URL)
- MongoDB Atlas account for database

---

## 🚀 Part 1: Deploy Frontend to Vercel

### Step 1: Connect GitHub Repository

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Select **"Import Git Repository"**
4. Find and select your `Orbit-AI-Fullstack` repository
5. Click **"Import"**

### Step 2: Configure Project Settings

1. **Framework Preset**: Select **"Vite"** (or it auto-detects)
2. **Project Name**: Keep default or rename to `orbit-ai-frontend`
3. **Root Directory**: Set to `orbit-frontend-premium`
4. **Build Command**: `npm run build`
5. **Output Directory**: `dist`
6. **Install Command**: `npm install`

### Step 3: Set Environment Variables

1. Under **"Environment Variables"**, add:
   
   ```
   VITE_API_URL = https://your-backend-api-url.com/api
   ```

2. Click **"Add"**
3. Keep it for all environments (Production, Preview, Development)

### Step 4: Deploy

Click **"Deploy"** button and wait for deployment to complete.

Your frontend will be live at: `https://orbit-ai-frontend.vercel.app` (or your custom domain)

---

## 🚀 Part 2: Deploy Backend

For the Express.js backend, Vercel isn't ideal. Use one of these alternatives:

### Option A: Railway (Recommended)

1. Go to [Railway.app](https://railway.app)
2. Click **"Create New Project"** → **"Deploy from GitHub"**
3. Select your repository
4. Railway auto-detects Node.js:
   - **Service**: Select `orbit-backend`
   - **Settings**:
     - Root Directory: `orbit-backend`
     - Watch Patterns: (leave default)
5. Add Environment Variables:
   ```
   MONGODB_URI = your_mongodb_uri
   JWT_SECRET = your_jwt_secret
   NODE_ENV = production
   OPENAI_API_KEY = your_openai_key
   PORT = 5000
   ```
6. Deploy!

Your backend will be at: `https://your-project.up.railway.app`

### Option B: Render.com

1. Go to [Render.com](https://render.com)
2. Click **"New"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `orbit-backend`
   - **Environment**: `Node`
   - **Region**: Choose closest to you
   - **Root Directory**: `orbit-backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Add Environment Variables (same as above)
6. Deploy!

Your backend will be at: `https://orbit-backend.onrender.com`

### Option C: Heroku (Legacy but still works)

1. Install [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli)
2. Login: `heroku login`
3. Create app: `heroku create orbit-backend`
4. Add MongoDB: `heroku addons:create mongolab:sandbox`
5. Set environment variables:
   ```bash
   heroku config:set JWT_SECRET=your_secret
   heroku config:set OPENAI_API_KEY=your_key
   ```
6. Deploy:
   ```bash
   git push heroku main
   ```

---

## 🔗 Update Frontend with Backend URL

After deploying your backend:

1. Go to your Vercel frontend project
2. Go to **Settings** → **Environment Variables**
3. Update `VITE_API_URL`:
   ```
   VITE_API_URL = https://your-deployed-backend-url/api
   ```
4. Redeploy the frontend (Vercel will automatically redeploy)

---

## ✅ Testing Deployment

After both are deployed:

1. Visit your frontend URL
2. Test user registration/login
3. Check browser console for API connection errors
4. Verify all features work (resume analyzer, chat, etc.)

---

## 🔒 Security Checklist

- [ ] `.env` files are in `.gitignore`
- [ ] All secrets set in deployment environment
- [ ] CORS configured properly in backend
- [ ] HTTPS enforced
- [ ] API keys not exposed in frontend code
- [ ] Database credentials not in version control

---

## 📊 Useful Links

- [Vercel Docs](https://vercel.com/docs)
- [Railway Docs](https://docs.railway.app)
- [Render Docs](https://render.com/docs)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

---

## 🆘 Troubleshooting

### Frontend won't build
- Check `vite.config.js` is correct
- Ensure all imports are valid
- Check Node version matches requirements

### Backend won't connect
- Verify `VITE_API_URL` environment variable
- Check CORS settings in `server.js`
- Ensure backend is actually deployed and running
- Check browser Network tab for errors

### Database issues
- Verify `MONGODB_URI` is correct
- Ensure IP whitelist includes your deployment host
- Check MongoDB Atlas connection string format

---

**Last Updated**: February 2026
