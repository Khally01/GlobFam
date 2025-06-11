# GlobFam Demo Instructions

## Quick Start (For Monday's Demo)

### Mobile Demo

### 1. Start the App
```bash
cd globfam-mobile
npm start
```

### 2. Run on iOS Simulator
- Press `i` in the terminal or scan QR code with Expo Go app

### 3. Demo Login
- On the login screen, click the **"Try Demo"** button
- This will log you in as Khally Dashdorj with pre-populated data

### Web Demo

1. **Open in Browser**
   - Simply double-click `web-demo.html` or
   - Open in any modern web browser
   - No installation required!

2. **Features**
   - Same data as mobile app
   - Responsive design
   - Transaction modal
   - Family hub view

## Demo Flow

### 1. **Login Screen**
- Show the clean UI with email/password fields
- Highlight the **"Try Demo"** button for easy access
- Mention real user registration is available

### 2. **Dashboard Overview**
- **Total Balance**: Shows $45,000 USD across all currencies
- **Currency Balances**: 
  - USD: $45,000
  - AUD: A$35,000  
  - MNT: ₮25,000,000
- **Recent Transactions**: Pre-populated with realistic student expenses
- **Quick Actions**: Add Income/Expense buttons

### 3. **Key Features to Demo**

#### Multi-Currency Support
- Show how balances are displayed in multiple currencies
- Demonstrate real-time conversion between USD/AUD/MNT
- Explain how this helps international students track money across countries

#### Transaction Management
- Click "Add Expense" to show the transaction modal
- Show categories relevant to students (Education, Rent, Food, etc.)
- Demonstrate date selection and currency choice

#### Family Hub
- Navigate to Family Hub tab
- Show "Dashdorj Family" with 2 members
- Explain shared budget and financial coordination features

### 4. **Value Propositions to Highlight**
- **Problem**: International students manage money in 3+ currencies using spreadsheets
- **Solution**: Unified dashboard with real-time conversion
- **Target Market**: 6+ million international student families
- **Differentiator**: Built BY an international student FOR international students

## Technical Notes
- App is built with React Native + Expo
- Firebase backend (auth, real-time sync)
- Redux for state management
- Demo mode uses local mock data (no Firebase calls)

## Troubleshooting
- If app doesn't start: `npm install --legacy-peer-deps`
- If iOS simulator issues: Open Xcode first
- If blank screen: Check console for errors

## Demo Talking Points
1. "This is Khally, an international student from Mongolia studying in Australia"
2. "She has money in 3 different currencies across 2 countries"
3. "Previously, she used complex spreadsheets to track everything"
4. "Now, she can see her total wealth instantly in any currency"
5. "She can track visa compliance (work hours) automatically"
6. "Her family back home can see shared finances in real-time"

## Next Steps After Demo
- Implement bank integrations
- Add visa compliance tracking
- Build family financial education features
- Launch beta with 100 international students