# 🔥 Firebase Setup - Baby Steps Guide

## Step 1: Create Firebase Project (2 minutes)

1. **Go to Firebase Console**
   - Open: https://console.firebase.google.com
   - Click the big blue button: **"Create a project"**

2. **Name Your Project**
   - Project name: `globfam-app`
   - Click **"Continue"**

3. **Google Analytics**
   - You can disable this for now (toggle OFF)
   - Click **"Create project"**
   - Wait 30 seconds for creation

## Step 2: Enable Authentication (1 minute)

1. **In Firebase Console**
   - Click **"Authentication"** in left sidebar
   - Click **"Get started"** button

2. **Enable Email/Password**
   - Click **"Email/Password"** 
   - Toggle **"Enable"** switch ON ✅
   - Click **"Save"**

That's it! No other auth methods needed for now.

## Step 3: Create Firestore Database (1 minute)

1. **In Firebase Console**
   - Click **"Firestore Database"** in left sidebar
   - Click **"Create database"** button

2. **Security Rules**
   - Choose **"Start in test mode"** (we'll secure it later)
   - Click **"Next"**

3. **Location**
   - Choose **"nam5 (United States)"** or your nearest location
   - Click **"Enable"**

## Step 4: Get Your Config Keys (1 minute)

1. **Project Settings**
   - Click the ⚙️ gear icon (top left)
   - Click **"Project settings"**

2. **Add Web App**
   - Scroll down to "Your apps"
   - Click the `</>` Web icon
   - App nickname: `globfam-web`
   - Click **"Register app"**

3. **Copy Your Config**
   - You'll see code like this:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSyBx1234567890abcdefg",
     authDomain: "globfam-app.firebaseapp.com",
     projectId: "globfam-app",
     storageBucket: "globfam-app.appspot.com",
     messagingSenderId: "123456789012",
     appId: "1:123456789012:web:abcdef123456"
   };
   ```

## Step 5: Update Your App (30 seconds)

1. **Open VS Code**
   - Navigate to: `/Users/khallydashdorj/Projects/globfam/globfam-mobile/src/services/firebase.ts`

2. **Replace the Config**
   - Find lines 26-33 (the firebaseConfig object)
   - Replace with YOUR config from Firebase
   - Save the file (Cmd+S)

## Step 6: Test Your App! 🎉

```bash
cd /Users/khallydashdorj/Projects/globfam/globfam-mobile
npm start
# Press 'i' for iOS
```

## What You Just Did ✅

1. ✅ Created Firebase project
2. ✅ Enabled Email/Password authentication
3. ✅ Created Firestore database
4. ✅ Got your config keys
5. ✅ Updated your app

## Test Features:
- **Register**: Create a test account
- **Login**: Sign in with your account
- **Dashboard**: See multi-currency view
- **Family**: Create/join a family

## Troubleshooting:

**"Firebase not found" error?**
```bash
cd globfam-mobile
npm install firebase
```

**Can't see the config?**
- Go back to Firebase Console
- Project Settings → Your apps → Web app
- Click "Config" button

**Auth not working?**
- Make sure Email/Password is enabled
- Check that you saved firebase.ts file

## Next Steps:
1. Create a test account in your app
2. Add some currency balances
3. Create a family and get the invite code
4. Test with another account!

**You're now live with a real backend! 🚀**