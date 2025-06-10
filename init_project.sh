#!/bin/bash

# GlobFam Project Initialization Script
# This creates the complete React Native project structure

echo "🚀 Initializing GlobFam React Native Project..."

# Check prerequisites
check_command() {
    if ! command -v $1 &> /dev/null; then
        echo "❌ $1 is not installed. Please install it first."
        exit 1
    fi
}

check_command node
check_command npm

# Create React Native project
echo "📱 Creating React Native project with Expo..."
npx create-expo-app globfam-mobile --template blank-typescript
cd globfam-mobile

# Install all dependencies
echo "📦 Installing dependencies..."
npm install \
    @react-navigation/native \
    @react-navigation/stack \
    @react-navigation/bottom-tabs \
    react-native-screens \
    react-native-safe-area-context \
    react-native-gesture-handler \
    react-native-reanimated \
    react-native-paper \
    react-native-vector-icons \
    @reduxjs/toolkit \
    react-redux \
    firebase \
    react-native-chart-kit \
    react-native-svg \
    axios \
    react-native-async-storage/async-storage \
    react-native-dotenv \
    @react-native-community/netinfo

# Install dev dependencies
npm install --save-dev \
    @types/react \
    @types/react-native \
    typescript \
    prettier \
    eslint \
    @typescript-eslint/parser \
    @typescript-eslint/eslint-plugin

# Create project structure
echo "🏗️ Creating project structure..."
mkdir -p src/{screens,components,services,store/slices,navigation,utils,types,assets/images,constants}

# Create configuration files
cat > tsconfig.json << 'EOF'
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
EOF

cat > .prettierrc << 'EOF'
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2
}
EOF

cat > .eslintrc.json << 'EOF'
{
  "extends": [
    "expo",
    "prettier"
  ],
  "plugins": ["prettier"],
  "rules": {
    "prettier/prettier": "error"
  }
}
EOF

# Create babel config for path aliases
cat > babel.config.js << 'EOF'
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          alias: {
            '@': './src',
          },
        },
      ],
      'react-native-reanimated/plugin',
    ],
  };
};
EOF

echo "✅ Project structure created successfully!"
echo ""
echo "📋 Next steps:"
echo "1. cd globfam-mobile"
echo "2. Create your Firebase project at https://console.firebase.google.com"
echo "3. Add your Firebase config to .env file"
echo "4. npm start"
echo ""
echo "Happy coding! 🎉"