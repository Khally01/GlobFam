const fs = require('fs');
const path = require('path');

// Read package.json
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

// Copy shared packages if in Railway environment
if (process.env.RAILWAY_ENVIRONMENT) {
  console.log('🚂 Railway environment detected, copying shared packages...');
  
  // Create directories
  fs.mkdirSync('temp-packages/types', { recursive: true });
  fs.mkdirSync('temp-packages/ui', { recursive: true });
  
  // Copy package files
  const typesPackage = JSON.parse(fs.readFileSync('../../packages/types/package.json', 'utf8'));
  const uiPackage = JSON.parse(fs.readFileSync('../../packages/ui/package.json', 'utf8'));
  
  fs.writeFileSync('temp-packages/types/package.json', JSON.stringify(typesPackage, null, 2));
  fs.writeFileSync('temp-packages/ui/package.json', JSON.stringify(uiPackage, null, 2));
  
  // Copy source files
  fs.copyFileSync('../../packages/types/index.ts', 'temp-packages/types/index.ts');
  fs.copyFileSync('../../packages/ui/index.tsx', 'temp-packages/ui/index.tsx');
  
  // Update package.json
  packageJson.dependencies['@globfam/types'] = 'file:./temp-packages/types';
  packageJson.dependencies['@globfam/ui'] = 'file:./temp-packages/ui';
  
  fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
  console.log('✅ Package references updated for Railway');
}