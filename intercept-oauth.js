/**
 * HTTP interceptor to log OAuth requests
 * Run this before starting 1code
 */

const http = require('http');
const https = require('https');

// Store original functions
const originalHttpRequest = http.request;
const originalHttpsRequest = https.request;

// Intercept http.request
http.request = function(...args) {
  const req = originalHttpRequest.apply(this, args);

  // Intercept write to capture body
  const originalWrite = req.write;
  req.write = function(chunk, encoding, callback) {
    if (req.path && req.path.includes('oauth')) {
      console.log('\n🔍 HTTP REQUEST INTERCEPTED:');
      console.log('URL:', req.protocol + '//' + req.host + req.path);
      console.log('Method:', req.method);
      console.log('Headers:', JSON.stringify(req.getHeaders(), null, 2));
      if (chunk) {
        console.log('Body:', chunk.toString());
      }
      console.log('---\n');
    }
    return originalWrite.call(this, chunk, encoding, callback);
  };

  return req;
};

// Intercept https.request
https.request = function(...args) {
  const req = originalHttpsRequest.apply(this, args);

  // Intercept write to capture body
  const originalWrite = req.write;
  req.write = function(chunk, encoding, callback) {
    const url = `https://${req.host}${req.path}`;
    if (url.includes('oauth') || url.includes('platform.claude.com')) {
      console.log('\n🔍 HTTPS REQUEST INTERCEPTED:');
      console.log('URL:', url);
      console.log('Method:', req.method);
      console.log('Headers:', JSON.stringify(req.getHeaders(), null, 2));
      if (chunk) {
        console.log('Body:', chunk.toString());
      }
      console.log('---\n');
    }
    return originalWrite.call(this, chunk, encoding, callback);
  };

  return req;
};

console.log('✅ HTTP/HTTPS interceptor loaded');
console.log('Now run: npm run dev');
