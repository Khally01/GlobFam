const fs = require('fs');
const path = require('path');

console.log('🔍 Validating build fixes...\n');

let hasErrors = false;

// Check if all required UI components exist
const uiComponents = ['button.tsx', 'card.tsx', 'input.tsx', 'index.tsx'];
const uiPath = path.join(__dirname, 'src/components/shared-ui');

console.log('📦 Checking UI components:');
uiComponents.forEach(component => {
  const exists = fs.existsSync(path.join(uiPath, component));
  console.log(`  ${exists ? '✅' : '❌'} ${component}`);
  if (!exists) hasErrors = true;
});

// Check if shared-types exists
const typesPath = path.join(__dirname, 'src/lib/shared-types/index.ts');
const typesExists = fs.existsSync(typesPath);
console.log(`\n📝 Checking shared types:\n  ${typesExists ? '✅' : '❌'} shared-types/index.ts`);
if (!typesExists) hasErrors = true;

// Check for any remaining @globfam imports
console.log('\n🔍 Checking for @globfam imports:');
let foundGlobfamImports = false;

function checkImports(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.includes('node_modules') && !file.includes('.next')) {
      checkImports(filePath);
    } else if ((file.endsWith('.ts') || file.endsWith('.tsx')) && !file.includes('.d.ts')) {
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        if (content.includes('@globfam/')) {
          console.log(`  ❌ Found @globfam import in: ${filePath}`);
          foundGlobfamImports = true;
          hasErrors = true;
        }
      } catch (error) {
        // Ignore read errors
      }
    }
  });
}

checkImports(path.join(__dirname, 'src'));

if (!foundGlobfamImports) {
  console.log('  ✅ No @globfam imports found');
}

// Check next.config.js
console.log('\n⚙️  Checking next.config.js:');
const nextConfig = fs.readFileSync(path.join(__dirname, 'next.config.js'), 'utf8');
const hasTranspilePackages = nextConfig.includes('transpilePackages');
console.log(`  ${hasTranspilePackages ? '❌' : '✅'} transpilePackages removed`);
if (hasTranspilePackages) hasErrors = true;

// Summary
console.log('\n' + '='.repeat(50));
if (hasErrors) {
  console.log('❌ Build validation failed! Please fix the issues above.');
} else {
  console.log('✅ All checks passed! The build should now work correctly.');
  console.log('\n📋 Next steps:');
  console.log('  1. Install dependencies: npm install');
  console.log('  2. Run the build: npm run build');
  console.log('  3. Start the app: npm run dev');
}
console.log('='.repeat(50));