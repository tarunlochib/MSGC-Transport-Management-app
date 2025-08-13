// Post-build verification script for Render
const fs = require('fs');
const path = require('path');

console.log('🔍 Post-build verification...');
console.log('📁 Current directory:', process.cwd());
console.log('📁 Server directory:', __dirname);

// Check all possible locations for the dist folder
const possiblePaths = [
  './client/dist',
  './dist',
  './dist-root',
  '../client/dist',
  '../dist',
  '../dist-root',
  '../../client/dist',
  '../../dist',
  '../../dist-root'
];

console.log('\n🔍 Checking all possible paths:');
let foundPaths = [];

possiblePaths.forEach(testPath => {
  try {
    const fullPath = path.resolve(testPath);
    if (fs.existsSync(fullPath)) {
      console.log(`✅ Found: ${testPath} (${fullPath})`);
      
      if (fs.existsSync(path.join(fullPath, 'index.html'))) {
        console.log(`   ✅ index.html exists`);
        foundPaths.push(fullPath);
        
        // List some files to verify it's the right dist folder
        const files = fs.readdirSync(fullPath);
        console.log(`   📁 Files: ${files.slice(0, 5).join(', ')}${files.length > 5 ? '...' : ''}`);
      } else {
        console.log(`   ❌ index.html missing`);
      }
    } else {
      console.log(`❌ Not found: ${testPath}`);
    }
  } catch (error) {
    console.log(`❌ Error checking ${testPath}:`, error.message);
  }
});

console.log('\n📊 Summary:');
if (foundPaths.length > 0) {
  console.log(`✅ Found ${foundPaths.length} valid dist folder(s):`);
  foundPaths.forEach(path => console.log(`   - ${path}`));
} else {
  console.log('❌ No valid dist folders found!');
}

console.log('\n🔍 Environment info:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('PWD:', process.env.PWD);

// Try to create a simple test file to verify write permissions
try {
  const testFile = path.join(process.cwd(), 'build-test.txt');
  fs.writeFileSync(testFile, `Build completed at ${new Date().toISOString()}`);
  console.log('✅ Write test successful - can create files in current directory');
  fs.unlinkSync(testFile); // Clean up
} catch (error) {
  console.log('❌ Write test failed:', error.message);
}
