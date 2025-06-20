const fs = require('fs');
const path = require('path');

console.log('🔄 Fixing all imports from @globfam/* to local paths...');

// Function to recursively update imports in all files
function updateImports(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.includes('node_modules') && !file.includes('.next')) {
      updateImports(filePath);
    } else if ((file.endsWith('.ts') || file.endsWith('.tsx')) && !file.includes('.d.ts')) {
      try {
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;
        
        // Replace @globfam/types imports
        if (content.includes('@globfam/types')) {
          content = content.replace(/@globfam\/types/g, '@/lib/shared-types');
          modified = true;
          console.log(`✅ Updated types imports in: ${filePath}`);
        }
        
        // Replace @globfam/ui imports
        if (content.includes('@globfam/ui')) {
          content = content.replace(/@globfam\/ui/g, '@/components/shared-ui');
          modified = true;
          console.log(`✅ Updated UI imports in: ${filePath}`);
        }
        
        if (modified) {
          fs.writeFileSync(filePath, content);
        }
      } catch (error) {
        console.error(`❌ Error processing ${filePath}:`, error.message);
      }
    }
  });
}

// Start updating from src directory
const srcPath = path.join(__dirname, 'src');
updateImports(srcPath);

console.log('✅ All imports have been updated!');