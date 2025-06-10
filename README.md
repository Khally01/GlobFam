# GlobFam - Multi-Currency Family Finance Platform 🌍💰

> Empowering international student families to manage wealth across borders

## 🚀 Overview

GlobFam solves the complex financial challenges faced by 6+ million international student families managing assets across multiple countries and currencies. Built by an international student, for international students.

## ✨ Key Features

- **Multi-Currency Dashboard**: Real-time view of family wealth in USD/AUD/MNT
- **Family Coordination**: Shared budgets and financial goals
- **Visa Compliance Tracking**: Monitor work hours and income limits
- **Family Legacy**: Financial education platform for children
- **Smart Insights**: Currency optimization and investment recommendations

## 🛠️ Tech Stack

- **Mobile**: React Native + Expo
- **Backend**: Firebase (Auth, Firestore, Functions)
- **APIs**: Currency exchange, banking integrations
- **State**: Redux Toolkit
- **UI**: React Native Paper

## 📱 Getting Started

### Prerequisites

- Node.js 18+
- Expo CLI
- iOS Simulator (Xcode) or Android Studio
- Firebase account

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/globfam.git
cd globfam

# Install dependencies
npm install

# Start the development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android
```

### Environment Setup

Create a `.env` file in the root directory:

```env
FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=your_auth_domain
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_storage_bucket
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id
FIXER_API_KEY=your_fixer_api_key
```

## 🏗️ Project Structure

```
globfam/
├── src/
│   ├── screens/          # App screens
│   ├── components/       # Reusable components
│   ├── services/         # API and Firebase services
│   ├── store/           # Redux store and slices
│   ├── navigation/      # React Navigation setup
│   └── utils/           # Helper functions
├── assets/              # Images, fonts, etc.
├── docs/               # Documentation
└── marketing/          # Marketing materials
```

## 🎯 Roadmap

### Phase 1: MVP (Current)
- [x] Project setup
- [ ] Authentication flow
- [ ] Multi-currency dashboard
- [ ] Basic family sharing

### Phase 2: Core Features
- [ ] Bank integrations
- [ ] Visa compliance tracking
- [ ] Real-time sync
- [ ] Push notifications

### Phase 3: Family Legacy
- [ ] Child profiles
- [ ] Educational content
- [ ] Gamification
- [ ] Achievement system

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

Built with ❤️ for the international student community

---

**Questions?** Reach out at globfam@example.com