// 1. LAHAT NG 'require' STATEMENTS SA PINAKATAAS
const express = require('express');
const crypto = require('crypto');
const bcrypt = require('bcryptjs'); 
const db = require('../db'); 
const transporter = require('../email'); 

// 2. I-DEFINE SI 'router'
const router = express.Router();

// ---------------- SIGNUP ----------------
router.post('/signup', async (req, res) => {
  const { username, email, password, confirmPassword } = req.body;
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

    // Assign customer role automatically
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
  const db = req.app.locals.db;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    // Find user by email
    const [rows] = await db.query('SELECT * FROM usertbl WHERE email = ?', [email]);

    if (rows.length === 0) {
      return res.status(400).json({ message: 'User not found' });
    }

    const user = rows[0];

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    // Remove password from response
    const { password: pw, ...userData } = user;

    // Return user info including role
    res.json({ message: 'Login successful', user: userData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// =======================================================
//          BAGONG ROUTE: FORGOT PASSWORD REQUEST
// =======================================================
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    // 1. Hanapin ang user sa database
    const [users] = await db.query('SELECT * FROM usertbl WHERE email = ?', [email]);
    const user = users[0];

    // 2. Kung walang user, send success pa rin (para 'di malaman ng attacker)
    if (!user) {
      return res.status(200).json({ message: 'Reset link sent.' });
    }

    // 3. Gumawa ng token
    const token = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    
    // 4. Set expiration (15 minutes from now)
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // 5. I-save sa database
    await db.query(
      'UPDATE usertbl SET resetPasswordToken = ?, resetPasswordExpires = ? WHERE id = ?',
      [hashedToken, expires, user.id]
    );

    // 6. Gumawa ng reset link (para sa React app - 5173 ay default Vite port)
    const resetURL = `http://localhost:5173/reset-password?token=${token}`; 

    // 7. Ipadala ang email
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

// =======================================================
//            BAGONG ROUTE: RESET PASSWORD SUBMIT
// =======================================================
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match.' });
    }

    // 1. I-hash ang token mula sa URL
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // 2. Hanapin ang user sa DB + check kung valid ang token at hindi expired
    // Gagamit tayo ng NOW() function ng MySQL para sa time comparison
    const [users] = await db.query(
      'SELECT * FROM usertbl WHERE resetPasswordToken = ? AND resetPasswordExpires > NOW()',
      [hashedToken]
    );
    const user = users[0];

    // 3. Kung wala, invalid or expired
    if (!user) {
      return res.status(400).json({ message: 'Token is invalid or has expired.' });
    }

    // 4. Kung OK, i-hash ang bagong password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 5. I-update ang password sa DB at linisin ang tokens
    await db.query(
      'UPDATE usertbl SET password = ?, resetPasswordToken = NULL, resetPasswordExpires = NULL WHERE id = ?',
      [hashedPassword, user.id]
    );

    res.status(200).json({ message: 'Password reset successful.' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
G  }
});

// 5. I-EXPORT SI ROUTER SA PINAKA-DULO NG FILE
module.exports = router;