// Root entry point for Render deployment
// This file redirects to the actual server file

const path = require('path');
const serverPath = path.join(__dirname, 'server', 'index.js');

try {
  require(serverPath);
} catch (error) {
  console.error('Error loading server:', error);
  console.error('Expected server file at:', serverPath);
  process.exit(1);
}
