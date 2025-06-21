# 🚀 Railway Services & Environment Variables Setup

## Step 1: Add PostgreSQL Service

1. **In your Railway project dashboard**, click the **"+ New"** button
2. Select **"Database"**
3. Choose **"Add PostgreSQL"**
4. Railway will create a PostgreSQL instance
5. Wait for it to show as **"Active"** (green status)

## Step 2: Add Redis Service

1. Click **"+ New"** button again
2. Select **"Database"**
3. Choose **"Add Redis"**
4. Railway will create a Redis instance
5. Wait for it to show as **"Active"** (green status)

## Step 3: Connect Services to Your API

After adding PostgreSQL and Redis, Railway should automatically:
- Create `DATABASE_URL` variable linked to PostgreSQL
- Create `REDIS_URL` variable linked to Redis

To verify:
1. Click on your **API service**
2. Go to **"Variables"** tab
3. You should see:
   - `DATABASE_URL` → "Reference to Postgres.DATABASE_URL"
   - `REDIS_URL` → "Reference to Redis.REDIS_URL"

## Step 4: Add Environment Variables

In your API service's **Variables** tab:

1. Click **"+ New Variable"** button (or "Raw Editor" for bulk add)

2. Add these variables one by one:

   **Variable 1:**
   - Key: `NODE_ENV`
   - Value: `production`

   **Variable 2:**
   - Key: `JWT_SECRET`
   - Value: `qAkjnqtKorJAMP4OJZgA0DnZEOtHb3iElWl1jrRTeiE=`

   **Variable 3:**
   - Key: `JWT_REFRESH_SECRET`
   - Value: `gyidyR+sJ7lzK5nx1xKdZoPC7MkJPu2EqnAFYlcM8zU=`

### OR Use Raw Editor (Faster):

Click "Raw Editor" and paste:
```
NODE_ENV=production
JWT_SECRET=qAkjnqtKorJAMP4OJZgA0DnZEOtHb3iElWl1jrRTeiE=
JWT_REFRESH_SECRET=gyidyR+sJ7lzK5nx1xKdZoPC7MkJPu2EqnAFYlcM8zU=
```

## 🎯 Your Railway Project Should Look Like:

```
Your Project
├── globfam-api (your API service)
├── Postgres (database service) - Active
└── Redis (cache service) - Active
```

## ✅ Verification Checklist:

1. **Services Tab**: Do you see 3 services total?
   - Your API service
   - Postgres (green/active)
   - Redis (green/active)

2. **Variables Tab** (in your API service):
   - `DATABASE_URL` (auto-linked) ✓
   - `REDIS_URL` (auto-linked) ✓
   - `NODE_ENV=production` ✓
   - `JWT_SECRET=...` ✓
   - `JWT_REFRESH_SECRET=...` ✓

## 🚨 Common Issues:

### If DATABASE_URL or REDIS_URL not showing:
1. Click the variable input field
2. Type `DATABASE_URL`
3. A dropdown should appear with "Reference to Postgres.DATABASE_URL"
4. Select it to link the services

### If services not connecting:
1. Make sure all services are in the same Railway project
2. Restart/redeploy your API service after adding databases

## 🔄 After Setup:
1. All services should be "Active"
2. All 5 environment variables should be set
3. Click **"Redeploy"** on your API service

The deployment should now work! 🚀