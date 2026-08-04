import fetch from 'node-fetch';

async function checkServer() {
  try {
    const response = await fetch('http://0.0.0.0:3000/');
    const text = await response.text();
    console.log(`Status: ${response.status}`);
    console.log(`Response: ${text}`);
  } catch (error) {
    console.error('Error connecting to server:', error.message);
  }
}

checkServer();
