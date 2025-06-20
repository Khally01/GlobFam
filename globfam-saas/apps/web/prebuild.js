const fs = require('fs');
const path = require('path');

console.log('🔧 Running prebuild script to fix dependencies...');

// Check if we're in Railway environment or local with missing packages
const packagesPath = path.join(__dirname, '../../packages');
const packagesExist = fs.existsSync(packagesPath);

if (!packagesExist || process.env.RAILWAY_ENVIRONMENT) {
  console.log('📦 Packages directory not found or Railway detected, creating local copies...');
  
  // Create directories
  const dirs = [
    'src/lib/shared-types',
    'src/components/shared-ui'
  ];
  
  dirs.forEach(dir => {
    const fullPath = path.join(__dirname, dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }
  });
  
  // Create types file
  const typesContent = `// Auto-generated types for build
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';
  organizationId: string;
  familyId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Organization {
  id: string;
  name: string;
  plan: 'STARTER' | 'FAMILY' | 'PREMIUM' | 'ENTERPRISE';
  createdAt: Date;
  updatedAt: Date;
}

export interface Family {
  id: string;
  name: string;
  inviteCode: string;
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Asset {
  id: string;
  name: string;
  type: string;
  currency: string;
  amount: string;
  userId: string;
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Transaction {
  id: string;
  type: 'INCOME' | 'EXPENSE' | 'TRANSFER';
  category: string;
  amount: string;
  currency: string;
  description?: string;
  date: Date;
  userId: string;
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

export const SUPPORTED_CURRENCIES = ['USD', 'AUD', 'MNT', 'EUR', 'GBP', 'CNY', 'JPY', 'KRW'] as const;
export type SupportedCurrency = typeof SUPPORTED_CURRENCIES[number];
`;
  
  fs.writeFileSync(path.join(__dirname, 'src/lib/shared-types/index.ts'), typesContent);
  
  // Create UI components index
  const uiIndexContent = `// Auto-generated UI exports
export { Button } from './button';
export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './card';
export { Input } from './input';
`;
  
  fs.writeFileSync(path.join(__dirname, 'src/components/shared-ui/index.tsx'), uiIndexContent);
  
  // Update all imports
  console.log('🔄 Updating imports...');
  const updateImports = (dir) => {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory() && !file.includes('node_modules')) {
        updateImports(filePath);
      } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        let content = fs.readFileSync(filePath, 'utf8');
        content = content.replace(/@globfam\/types/g, '@/lib/shared-types');
        content = content.replace(/@globfam\/ui/g, '@/components/shared-ui');
        fs.writeFileSync(filePath, content);
      }
    });
  };
  
  updateImports(path.join(__dirname, 'src'));
  
  console.log('✅ Prebuild complete!');
} else {
  console.log('✅ Packages found, skipping prebuild modifications.');
}