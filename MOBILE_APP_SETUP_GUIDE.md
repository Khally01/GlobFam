# 📱 GlobFam Mobile App Setup Guide

## Quick Overview
I've created a fully functional React Native mobile app with Expo. Here's how to get it running on your phone!

## 🚀 Baby Steps to Get the App on Your Phone

### Prerequisites
1. **Your Phone**: iPhone or Android
2. **Expo Go App**: Download from App Store (iOS) or Google Play Store (Android)
3. **Your Computer**: Connected to the same WiFi as your phone

### Step 1: Install Expo Go on Your Phone
- **iPhone**: Search "Expo Go" in App Store and install
- **Android**: Search "Expo Go" in Google Play Store and install

### Step 2: Start the Development Server
Open Terminal on your Mac and run these commands:

```bash
# Navigate to the mobile app directory
cd /Users/khallydashdorj/Projects/globfam/globfam-mobile

# Install dependencies (if not already done)
npm install --legacy-peer-deps

# Start the Expo development server
npx expo start
```

### Step 3: Connect Your Phone
After running `npx expo start`, you'll see:
1. A QR code in the terminal
2. Metro Bundler will open in your browser (usually at http://localhost:8081)

**To connect:**
- **iPhone**: Open Camera app, scan the QR code, tap the notification to open in Expo Go
- **Android**: Open Expo Go app, tap "Scan QR Code", scan the code

### Step 4: Wait for the App to Load
The app will bundle and load on your phone. This might take 30-60 seconds the first time.

## 📋 What You'll See in the App

### Features Available:
1. **Dashboard**
   - Total balance in multiple currencies (USD, AUD, MNT)
   - Currency converter
   - Recent transactions
   - Upcoming payment alerts
   - Visa savings progress tracker

2. **Family Hub**
   - Family member management
   - Shared expenses
   - Family financial overview

3. **Budget Planner**
   - Savings goals with progress tracking
   - Payment reminders
   - Monthly budget analysis
   - Visa renewal savings calculator

4. **Visa Compliance**
   - Work hours tracker (48 hours/fortnight limit)
   - Visa expiry countdown
   - Financial requirements calculator
   - Childcare cost tracking with subsidies

5. **Settings**
   - Payment reminder notifications
   - Notification scheduling preferences
   - Profile management
   - Currency preferences

## 🔔 Testing Notifications

1. Go to Settings tab in the app
2. Toggle "Payment Reminders" ON
3. The app will ask for notification permission - tap "Allow"
4. Tap "Send Test Notification" to verify it's working
5. You'll receive payment reminders based on your schedule:
   - Visa payments: 90, 60, 30, 14, 7 days before
   - Tuition: 30, 14, 7, 3, 1 day before
   - Other payments: 14, 7, 3, 1 day before

## 🌐 Web Demo

To open the web demo:
```bash
# Open the complete demo in your browser
open /Users/khallydashdorj/Projects/globfam/globfam-complete-demo.html
```

## 🔧 Troubleshooting

### If the QR code doesn't work:
1. Make sure your phone and computer are on the same WiFi network
2. Try typing the URL shown in Metro Bundler directly in Expo Go

### If the app crashes:
1. Shake your phone to open the developer menu
2. Tap "Reload" to restart the app

### If you see "Network Error":
Check that your Firebase configuration is correct in the .env file

## 📝 Demo Credentials
The app runs in demo mode with:
- User: Khally Dashdorj
- Email: demo@globfam.app
- Pre-loaded with sample data

## 🎯 Next Steps for Production

When you're ready to build for the App Store/Google Play:
1. Create app store accounts
2. Build production versions:
   ```bash
   # iOS
   npx eas build --platform ios
   
   # Android
   npx eas build --platform android
   ```
3. Submit to stores

## 💡 Tips
- The app works offline for viewing data
- Notifications work even when app is closed
- All amounts are in real Australian visa requirement values
- Demo data includes realistic scenarios for international students

Enjoy your GlobFam app! 🎉