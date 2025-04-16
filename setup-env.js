#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🚀 GOATWAVE Environment Setup 🚀');
console.log('This script will help you set up your environment variables for GOATWAVE.');
console.log('');

rl.question('Enter your BlackForestLabs API key: ', (apiKey) => {
  if (!apiKey) {
    console.log('❌ API key is required. Exiting...');
    rl.close();
    return;
  }

  rl.question('Enter your model ID: ', (modelId) => {
    if (!modelId) {
      console.log('❌ Model ID is required. Exiting...');
      rl.close();
      return;
    }

    const envContent = `NEXT_PUBLIC_BLACKFOREST_API_KEY=${apiKey}\nNEXT_PUBLIC_MODEL_ID=${modelId}\n`;
    
    // Write to .env file
    fs.writeFileSync(path.join(__dirname, '.env'), envContent);
    console.log('✅ Created .env file with your API key and model ID');
    
    // Also write to .env.local for local development
    fs.writeFileSync(path.join(__dirname, '.env.local'), envContent);
    console.log('✅ Created .env.local file with your API key and model ID');
    
    console.log('');
    console.log('🎉 Environment setup complete!');
    console.log('You can now run the app with: npm run dev');
    
    rl.close();
  });
}); 