// Import required modules
const express = require('express');
const app = require('./app');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Define port
const PORT = process.env.PORT || 5000;

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});