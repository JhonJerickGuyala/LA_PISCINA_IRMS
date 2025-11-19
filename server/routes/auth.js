const express = require('express');
const crypto = require('crypto');
const bcrypt = require('bcryptjs'); 
const transporter = require('../email'); 

const router = express.Router();

// ---------------- SIGNUP ----------------
router.post('/signup', async (req, res) => {
  const { username, email, password, confirmPassword } = req.body;
  
  // KUNIN ANG CONNECTION GALING SERVER.JS
  const db = req.app.locals.db;

  // Validate required fields
  if (!username || !email || !password || !confirmPassword) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  // Validate password match
  if (password !== confirmPassword) {
    return res.status(400).json({ message: 'Passwords do not match' });
  }

  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    const role = 'customer';

    // Insert into database
    const [result] = await db.query(
      'INSERT INTO usertbl (username, email, password, role) VALUES (?, ?, ?, ?)',
      [username, email, hashedPassword, role]
    );

    res.status(201).json({ message: 'User created successfully' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ message: 'Email or username already exists' });
    } else {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  }
});

// ---------------- LOGIN ----------------
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  // KUNIN ANG CONNECTION GALING SERVER.JS
  const db = req.app.locals.db;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const [rows] = await db.query('SELECT * FROM usertbl WHERE email = ?', [email]);

    if (rows.length === 0) {
      return res.status(400).json({ message: 'User not found' });
    }

    const user = rows[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    const { password: pw, ...userData } = user;
    res.json({ message: 'Login successful', user: userData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ---------------- FORGOT PASSWORD ----------------
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    // FIX: Idinagdag ko ito dahil nawawala sa original code mo
    const db = req.app.locals.db;
    
    const [users] = await db.query('SELECT * FROM usertbl WHERE email = ?', [email]);
    const user = users[0];

    if (!user) {
      return res.status(200).json({ message: 'Reset link sent.' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await db.query(
      'UPDATE usertbl SET resetPasswordToken = ?, resetPasswordExpires = ? WHERE id = ?',
      [hashedToken, expires, user.id]
    );

    const resetURL = `http://localhost:5173/reset-password?token=${token}`; 

    await transporter.sendMail({
      from: `"La Piscina" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'Password Reset Request',
      html: `
        <p>You requested a password reset.</p>
        <p>Click this link to set a new password (link expires in 15 minutes):</p>
        <a href="${resetURL}" target="_blank">${resetURL}</a>
      `
    });

    res.status(200).json({ message: 'Reset link sent.' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ---------------- RESET PASSWORD ----------------
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password, confirmPassword } = req.body;
    
    // FIX: Idinagdag ko ito
    const db = req.app.locals.db;

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match.' });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const [users] = await db.query(
      'SELECT * FROM usertbl WHERE resetPasswordToken = ? AND resetPasswordExpires > NOW()',
      [hashedToken]
    );
    const user = users[0];

    if (!user) {
      return res.status(400).json({ message: 'Token is invalid or has expired.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await db.query(
      'UPDATE usertbl SET password = ?, resetPasswordToken = NULL, resetPasswordExpires = NULL WHERE id = ?',
      [hashedPassword, user.id]
    );

    res.status(200).json({ message: 'Password reset successful.' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;