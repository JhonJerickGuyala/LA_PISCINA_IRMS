const nodemailer = require('nodemailer');
require('dotenv').config();

// I-setup ang 'transporter' gamit ang credentials mula sa .env file
const transporter = nodemailer.createTransport({
  service: 'gmail', // Pwede mong palitan (e.g., 'yahoo', 'outlook')
  auth: {
    user: process.env.EMAIL_USER, // Iyong email (e.g., 'lapiscina.resort@gmail.com')
    pass: process.env.EMAIL_PASS  // Iyong Google "App Password"
  }
});

module.exports = transporter;