// Build verification script for Render
const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying build output...');
console.log('📁 Current directory:', process.cwd());
console.log('📁 Directory contents:');
try {
  const files = fs.readdirSync('.');
  files.forEach(file => {
    const stats = fs.statSync(file);
    const type = stats.isDirectory() ? '📁' : '📄';
    console.log(`${type} ${file}`);
  });
} catch (error) {
  console.log('❌ Error reading directory:', error.message);
}

console.log('\n🔍 Looking for dist folder...');
const possiblePaths = [
  './client/dist',
  './dist',
  '../client/dist',
  '../../client/dist'
];

possiblePaths.forEach(testPath => {
  try {
    if (fs.existsSync(testPath)) {
      console.log(`✅ Found: ${testPath}`);
      const distFiles = fs.readdirSync(testPath);
      console.log(`   Contents: ${distFiles.join(', ')}`);
      
      if (fs.existsSync(path.join(testPath, 'index.html'))) {
        console.log(`✅ index.html found in ${testPath}`);
      } else {
        console.log(`❌ index.html NOT found in ${testPath}`);
      }
    } else {
      console.log(`❌ Not found: ${testPath}`);
    }
  } catch (error) {
    console.log(`❌ Error checking ${testPath}:`, error.message);
  }
});

console.log('\n🔍 Environment variables:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('PWD:', process.env.PWD);
