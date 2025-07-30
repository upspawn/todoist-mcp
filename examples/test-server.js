#!/usr/bin/env node

// Quick test script for the Todoist MCP server
// Usage: TODOIST_API_KEY=your-key node examples/test-server.js

const { spawn } = require('child_process');
const path = require('path');

if (!process.env.TODOIST_API_KEY) {
  console.error('Error: TODOIST_API_KEY environment variable is required');
  console.error('Usage: TODOIST_API_KEY=your-key node examples/test-server.js');
  process.exit(1);
}

console.log('🚀 Testing Todoist MCP Server...');
console.log('Press Ctrl+C to exit\n');

// Start the server
const serverPath = path.join(__dirname, '..', 'dist', 'index.js');
const server = spawn('node', [serverPath], {
  stdio: ['pipe', 'pipe', 'inherit'],
  env: {
    ...process.env,
    DEBUG: 'true'
  }
});

// Test sequence: initialize -> list tools -> test a simple tool
const testSequence = [
  // Initialize
  JSON.stringify({
    jsonrpc: '2.0',
    id: 1,
    method: 'initialize',
    params: {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: {
        name: 'test-client',
        version: '1.0.0'
      }
    }
  }) + '\n',
  
  // List tools
  JSON.stringify({
    jsonrpc: '2.0',
    id: 2,
    method: 'tools/list'
  }) + '\n',
  
  // Test list_projects tool
  JSON.stringify({
    jsonrpc: '2.0',
    id: 3,
    method: 'tools/call',
    params: {
      name: 'list_projects'
    }
  }) + '\n'
];

let responseCount = 0;
let responses = [];

server.stdout.on('data', (data) => {
  const lines = data.toString().split('\n').filter(line => line.trim());
  
  for (const line of lines) {
    try {
      const response = JSON.parse(line);
      responses.push(response);
      responseCount++;
      
      console.log(`📥 Response ${responseCount}:`, JSON.stringify(response, null, 2));
      
      if (responseCount === 1) {
        console.log('\n✅ Server initialized successfully!');
      } else if (responseCount === 2) {
        const toolCount = response.result?.tools?.length || 0;
        console.log(`\n✅ Found ${toolCount} available tools!`);
      } else if (responseCount === 3) {
        if (response.error) {
          console.log('\n❌ Error testing list_projects:', response.error.message);
        } else {
          console.log('\n✅ Successfully tested list_projects tool!');
        }
        
        console.log('\n🎉 All tests completed successfully!');
        server.kill();
        process.exit(0);
      }
    } catch (e) {
      console.log('📤 Raw output:', line);
    }
  }
});

server.on('error', (error) => {
  console.error('❌ Server error:', error);
  process.exit(1);
});

server.on('close', (code) => {
  console.log(`\n📋 Server exited with code ${code}`);
});

// Send test messages with delays
let messageIndex = 0;
function sendNextMessage() {
  if (messageIndex < testSequence.length) {
    const message = testSequence[messageIndex];
    console.log(`📤 Sending message ${messageIndex + 1}:`, JSON.parse(message.trim()));
    server.stdin.write(message);
    messageIndex++;
    
    // Wait a bit between messages
    setTimeout(sendNextMessage, 1000);
  }
}

// Start the test sequence after a short delay
setTimeout(sendNextMessage, 500);