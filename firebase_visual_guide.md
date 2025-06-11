# 🖼️ Firebase Setup - Visual Guide

## Where to Find firebase.ts File:

```
Your Computer
└── Users
    └── khallydashdorj
        └── Projects
            └── globfam
                └── globfam-mobile    ← YOUR APP IS HERE
                    └── src
                        └── services
                            └── firebase.ts  ← THIS FILE! 🎯
```

## How to Edit firebase.ts:

### Option 1: Using VS Code
1. Open VS Code
2. File → Open Folder → Choose `globfam-mobile`
3. In sidebar, click: src → services → firebase.ts
4. Find lines 26-33 (the part that says "YOUR_API_KEY")

### Option 2: Using Terminal
```bash
cd /Users/khallydashdorj/Projects/globfam/globfam-mobile
code src/services/firebase.ts
```

### Option 3: Using Finder
1. Open Finder
2. Go to: Projects → globfam → globfam-mobile → src → services
3. Right-click firebase.ts → Open With → VS Code

## What to Replace:

### BEFORE (Current file):
```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### AFTER (With your Firebase config):
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyBx-actualKeyFromFirebase",
  authDomain: "globfam-app.firebaseapp.com",
  projectId: "globfam-app",
  storageBucket: "globfam-app.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abc123def456"
};
```

## Quick Copy-Paste Steps:

1. **From Firebase Console:**
   - Copy the ENTIRE firebaseConfig object

2. **In VS Code:**
   - Select lines 26-33 (the whole firebaseConfig)
   - Paste your Firebase config
   - Save: Cmd+S (Mac) or Ctrl+S (Windows)

3. **Verify:**
   - Make sure there are NO "YOUR_" placeholders left
   - All values should be actual strings from Firebase

## Common Mistakes to Avoid:

❌ Don't include the `const firebaseConfig =` part twice
❌ Don't forget the semicolon at the end
❌ Don't mix up quotes (" vs ')
✅ Just replace the object values inside { }

**That's it! Your app is now connected to Firebase! 🎉**