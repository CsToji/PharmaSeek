# PharmaSeek - Free Deployment Guide (Step by Step)

This guide deploys the full-stack app completely free using:
- **Frontend**: Vercel (React)
- **Backend**: Render (Spring Boot)
- **Database**: PostgreSQL on Render (MySQL is no longer available on Render)

---

## Prerequisites

- GitHub account (free)
- Vercel account (free - sign up with GitHub)
- Render account (free - sign up with GitHub)

---

## Step 1: Push Code to GitHub ✅ (Already Done)

```bash
# Navigate to project directory
cd /home/toji/Desktop/desk/PFA-files

# Initialize git (if not already)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - PharmaSeek app"

# Create new repo on GitHub (via browser)
# Go to https://github.com/new
# Name: pharmacy-app
# Make it Public
# Don't initialize with README

# Add remote and push
git remote add origin https://github.com/YOUR_USERNAME/pharmacy-app.git
git branch -M main
git push -u origin main
```

---

## Step 2: Prepare Backend for Deployment

### 2.1 Update application.properties

Edit `/home/toji/Desktop/desk/PFA-files/App/backend/src/main/resources/application.properties`:

```properties
spring.application.name=pharmacy-app
server.port=${PORT:8080}

# Database - will be updated after creating Render MySQL
spring.datasource.url=${DATABASE_URL}
spring.datasource.username=${DATABASE_USERNAME}
spring.datasource.password=${DATABASE_PASSWORD}
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# JPA
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect

# CORS - Allow Vercel frontend
cors.frontend.url=${FRONTEND_URL:https://your-app.vercel.app}

# Logging
logging.level.org.springframework.security=INFO
```

### 2.2 Update CORS Configuration

Edit your CORS config to allow your Vercel frontend URL.

### 2.3 Update apiClient.js for Production

Edit `/home/toji/Desktop/desk/PFA-files/App/frontend/src/services/apiClient.js`:

```javascript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://your-backend.onrender.com/api';
```

### 2.4 Create Environment Variables File

Create `.env.production` in frontend:
```
VITE_API_URL=https://your-backend.onrender.com/api
```

### 2.5 Commit and Push

```bash
git add .
git commit -m "Prepare for deployment"
git push
```

---

## Step 3: Deploy MySQL Database on Render

### 3.1 Create Render Account
1. Go to https://render.com
2. Sign in with GitHub
3. Click "New +" → "PostgreSQL" (or MySQL)

### 3.2 Create MySQL Instance
1. Click **"New +"** → **"MySQL"**
2. Configure:
   - **Name**: `pharmacy-db`
   - **Database**: `pharmacy_app`
   - **Plan**: **Free** (500MB storage)
   - **Region**: Choose closest to you
3. Click **"Create Database"**
4. **Wait 2-3 minutes** for it to provision
5. Copy the **Internal Database URL** (you'll need it in Step 4)

Example format:
```
mysql://user:password@host:3306/database
```

### 3.3 Initialize Database
1. In Render dashboard, click on your MySQL instance
2. Go to **"Connections"** tab
3. Use the **"psql"** command or connect with a MySQL client
4. Run this SQL to create database:

```sql
CREATE DATABASE IF NOT EXISTS pharmacy_app;
```

Or run your existing schema SQL.

---

## Step 4: Deploy Backend on Render

### 4.1 Create Render Account & Connect GitHub
1. Go to https://render.com
2. Connect your GitHub repository

### 4.2 Create Web Service
1. Click **"New +"** → **"Web Service"**
2. Configure:
   - **GitHub Repo**: Select `pharmacy-app`
   - **Branch**: `main`
   - **Region**: Same as MySQL

### 4.3 Configure Build Settings
- **Root Directory**: `App/backend`
- **Build Command**: `./mvnw clean package -DskipTests` (or install Maven first)
- **Publish Directory**: `App/backend`

For Maven, use a **Build Script**:
```bash
#!/bin/bash
cd App/backend
./mvnw clean package -DskipTests
```

### 4.4 Set Environment Variables
Click **"Environment Variables"** and add:

| Key | Value |
|-----|-------|
| `DATABASE_URL` | Your MySQL connection string from Step 3.2 |
| `DATABASE_USERNAME` | From your MySQL connection string |
| `DATABASE_PASSWORD` | From your MySQL connection string |
| `PORT` | `8080` |
| `FRONTEND_URL` | Your Vercel URL (e.g., `https://pharmacy-app.vercel.app`) |

**Note**: If using Render's PostgreSQL (not MySQL), change:
- Driver to `org.postgresql.Driver`
- Dialect to `org.hibernate.dialect.PostgreSQLDialect`

### 4.5 Deploy
1. Click **"Create Web Service"**
2. Wait 5-10 minutes for first deployment
3. Check logs for errors
4. Your backend will be live at: `https://pharmacy-app.onrender.com`

### 4.6 Verify Backend
```bash
curl https://your-backend.onrender.com/api/auth/me
```

---

## Step 5: Deploy Frontend on Vercel

### 5.1 Create Vercel Account
1. Go to https://vercel.com
2. Sign in with GitHub
3. Click **"Add New..."** → **"Project"**

### 5.2 Import GitHub Repo
1. Select your `pharmacy-app` repository
2. Click **"Import"**

### 5.3 Configure Build Settings
- **Framework Preset**: Vite (or React)
- **Root Directory**: `App/frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

### 5.4 Add Environment Variables
Click **"Environment Variables"** and add:

| Name | Value |
|------|-------|
| `VITE_API_URL` | `https://pharmacy-app.onrender.com/api` |

### 5.5 Deploy
1. Click **"Deploy"**
2. Wait 2-3 minutes
3. Your frontend will be live at: `https://pharmacy-app.vercel.app`

---

## Step 6: Update CORS & API URLs

### 6.1 Update Backend CORS
In Render backend settings, ensure `FRONTEND_URL` matches your Vercel URL exactly:
```
FRONTEND_URL=https://pharmacy-app.vercel.app
```

### 6.2 Update Frontend API URL
Ensure `apiClient.js` points to your Render backend:
```javascript
const API_BASE_URL = 'https://pharmacy-app.onrender.com/api';
```

---

## Step 7: Initialize Database with Schema

### 7.1 Run Schema via Render
1. Go to your Render MySQL dashboard
2. Click **"psql"** connection tab
3. Run your SQL schema (create tables, insert data)

### 7.2 Or via Backend
With `spring.jpa.hibernate.ddl-auto=update`, tables auto-create on first API call.

---

## Step 8: Test Everything

### 8.1 Test Backend APIs
```bash
# Login
curl -X POST https://pharmacy-app.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password"}'

# Get drugs
curl https://pharmacy-app.onrender.com/api/search/drugs?query=amox
```

### 8.2 Test Frontend
1. Open https://pharmacy-app.vercel.app
2. Login with existing account
3. Test search, reservations, etc.

---

## Free Tier Limits & Tips

### Render Free Tier
- **Sleep after 15 min inactivity** - First request takes 30s+ to wake up
- **500MB MySQL** storage
- **750 hours/month** across all services

### Vercel Free Tier
- **100GB bandwidth/month**
- **100 deployments/day**
- No custom domain (uses *.vercel.app)

### Keep Backend Awake (Optional)
Use a free cron job service like https://cron-job.org to ping your backend every 5 minutes:
```
https://pharmacy-app.onrender.com/api/auth/me
```

---

## Troubleshooting

### CORS Errors
- Ensure `FRONTEND_URL` in backend matches Vercel URL exactly
- Include protocol (https://)

### Database Connection Failed
- Check environment variables in Render
- Verify MySQL is in same region
- Wait 2-3 min for MySQL to fully provision

### Build Failed (Backend)
- Add Maven wrapper: `mvn wrapper:wrapper`
- Or use Render's built-in Java support

### 503 Service Unavailable
- Backend is sleeping (Render free tier)
- First request wakes it up (takes 30-60s)
- Use cron job to keep awake

---

## Alternative: All-in-One Free Deployment

### Option 2: Railway (Simplified)
Railway offers similar free tier with easier setup:
1. Create Railway account (https://railway.app)
2. Deploy MySQL
3. Deploy Backend (auto-detects Spring Boot)
4. Deploy Frontend (auto-detects Vite/React)

### Option 3: Fly.io
1. Create Fly.io account
2. Use `fly launch` for each service
3. Free tier: 3 shared VMs, 160GB storage

---

## Custom Domain (Optional)

### Vercel
1. Go to project settings → Domains
2. Add your domain (e.g., `pharmacy-app.com`)
3. Update DNS records

### Render
1. Go to Web Service → Custom Domains
2. Add domain and follow DNS instructions

---

## Final Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    INTERNET                              │
└─────────────────────────────────────────────────────────┘
                           │
        ┌──────────────────┴──────────────────┐
        │                                         │
        ▼                                         ▼
┌───────────────────┐                  ┌───────────────────┐
│    VERCEL         │                  │    RENDER          │
│    (Frontend)     │                  │    (Backend)       │
│                   │                  │                   │
│ https://pharmacy  │ ───── API ─────▶ │ https://pharmacy- │
│ -app.vercel.app  │                  │ app.onrender.com   │
└───────────────────┘                  └───────────────────┘
                                               │
                                               ▼
                                    ┌───────────────────┐
                                    │    RENDER         │
                                    │    (MySQL)        │
                                    │                   │
                                    │  pharmacy-db      │
                                    └───────────────────┘
```

---

## Summary: Cost Breakdown

| Service | Cost | Limits |
|---------|------|--------|
| Vercel (Frontend) | **FREE** | *.vercel.app domain |
| Render (Backend) | **FREE** | 750h/month, sleeps after 15min |
| Render (MySQL) | **FREE** | 500MB storage |
| GitHub | **FREE** | Unlimited repos |
| **TOTAL** | **$0/month** | Works great for small apps |

---

## Push Updates

After code changes:
```bash
git add .
git commit -m "Update description"
git push
```
Vercel/Render will auto-deploy from GitHub.