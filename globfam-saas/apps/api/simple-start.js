const http = require('http');

console.log('🚀 Starting simple health check server...');
console.log('PORT:', process.env.PORT || 3001);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
console.log('REDIS_URL exists:', !!process.env.REDIS_URL);

const port = process.env.PORT || 3001;

// Create a simple server that responds to health checks
const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', message: 'API is starting up...' }));
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(port, '0.0.0.0', () => {
  console.log(`✅ Health check server listening on port ${port}`);
  
  // Now try to start the actual app
  setTimeout(() => {
    console.log('📦 Starting actual application...');
    require('./dist/index.js');
  }, 2000);
});

// Handle errors
server.on('error', (err) => {
  console.error('❌ Server error:', err);
  process.exit(1);
});