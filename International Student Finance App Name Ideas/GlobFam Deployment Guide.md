# GlobFam Deployment Guide

This guide provides step-by-step instructions for deploying and running your GlobFam application, both for local development and production environments.

## Table of Contents
1. [Local Development Setup](#local-development-setup)
2. [Building for Production](#building-for-production)
3. [Deployment Options](#deployment-options)
4. [Troubleshooting](#troubleshooting)

## Local Development Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or pnpm package manager

### Step 1: Clone or Extract the Source Code
```bash
# If you received a ZIP file, extract it to your preferred location
unzip globfam_source.zip -d globfam

# Navigate to the project directory
cd globfam
```

### Step 2: Install Dependencies
```bash
# Using npm
npm install

# OR using pnpm (recommended for faster installation)
pnpm install
```

### Step 3: Start Development Server
```bash
# Using npm
npm run dev

# OR using pnpm
pnpm dev
```

This will start a development server, typically on port 5173. Open your browser and navigate to `http://localhost:5173` to view the application.

## Building for Production

When you're ready to deploy your application to a production environment, follow these steps:

### Step 1: Build the Application
```bash
# Using npm
npm run build

# OR using pnpm
pnpm build
```

This will create a `dist` directory containing optimized production files.

### Step 2: Preview the Production Build Locally
```bash
# Using npm
npm run preview

# OR using serve (if installed globally)
serve -s dist
```

## Deployment Options

### Option 1: Static Hosting Services

The GlobFam application is a static single-page application that can be hosted on various platforms:

#### Vercel (Recommended)
1. Install Vercel CLI: `npm install -g vercel`
2. Navigate to your project directory
3. Run: `vercel`
4. Follow the prompts to deploy

#### Netlify
1. Install Netlify CLI: `npm install -g netlify-cli`
2. Navigate to your project directory
3. Run: `netlify deploy`
4. Follow the prompts to deploy

#### GitHub Pages
1. Create a GitHub repository for your project
2. Add a `deploy.yml` workflow file in `.github/workflows/` directory
3. Configure the workflow to build and deploy to GitHub Pages

### Option 2: Traditional Web Hosting

1. Build your application as described above
2. Upload the contents of the `dist` directory to your web server
3. Configure your web server to handle SPA routing (example configurations below)

#### Apache (.htaccess file)
```
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

#### Nginx (nginx.conf)
```
location / {
  try_files $uri $uri/ /index.html;
}
```

### Option 3: Docker Deployment

For containerized deployment, you can use the following Dockerfile:

```dockerfile
FROM node:16-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Build and run the Docker container:
```bash
docker build -t globfam-app .
docker run -p 8080:80 globfam-app
```

## Customization Options

### Changing the Brand Name or Logo
1. Update the translations in `src/translations.ts` for both English and Mongolian
2. Replace any logo files in the `public` directory
3. Rebuild the application

### Adding New Features
1. Create new components in the `src/components` directory
2. Update the routing in `src/App.tsx`
3. Add new translations in `src/translations.ts`

## Troubleshooting

### Port Conflicts
If you encounter a port conflict when starting the development server or serving the production build:

```bash
# Specify a different port for development
npm run dev -- --port 3000

# Specify a different port for serve
serve -s dist -l 8000
```

### Build Errors
If you encounter build errors:

1. Make sure all dependencies are installed: `npm install`
2. Clear the cache: `npm run dev -- --force` or delete the `node_modules/.vite` directory
3. Check for TypeScript errors: `npx tsc --noEmit`

### Deployment Issues
- Ensure your hosting service supports single-page applications
- Configure proper redirects for client-side routing
- Check CORS settings if your app makes API calls to different domains

## Next Steps for Your Startup

As you continue developing GlobFam as a startup:

1. **Backend Development**: Consider adding a backend API for user authentication and data persistence
2. **User Testing**: Gather feedback from Mongolian families studying in Australia
3. **Analytics**: Implement usage analytics to understand how users interact with your application
4. **Monetization**: Develop a pricing model for premium features or partnerships

For any additional assistance, refer to the documentation for the specific tools and libraries used in the project.
