import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';

const router = express.Router();

// Register endpoint
router.post('/register', async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, phone, college, role = 'student' } = req.body;

    // Basic validation
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ 
        error: 'First name, last name, email, and password are required' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        error: 'Password must be at least 6 characters long' 
      });
    }

    // Validate role
    const validRoles = ['student', 'admin', 'judge'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ 
        error: 'Invalid role. Must be student, admin, or judge' 
      });
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Insert user
    const [result] = await pool.execute(
      'INSERT INTO Participants (FName, LName, Email, PasswordHash, Phone, College, Role) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [firstName, lastName, email, passwordHash, phone || null, college || null, role]
    );

    // Generate JWT
    const token = jwt.sign(
      { 
        participantId: result.insertId,
        email: email,
        role: role
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: result.insertId,
        firstName,
        lastName,
        email,
        role,
        phone,
        college
      }
    });

  } catch (error) {
    next(error);
  }
});

// Login endpoint
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email and password are required' 
      });
    }

    // Find user
    const [rows] = await pool.execute(
      'SELECT ParticipantID, FName, LName, Email, PasswordHash, Phone, College, Role FROM Participants WHERE Email = ?',
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = rows[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.PasswordHash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign(
      { 
        participantId: user.ParticipantID,
        email: user.Email,
        role: user.Role
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.ParticipantID,
        firstName: user.FName,
        lastName: user.LName,
        email: user.Email,
        role: user.Role,
        phone: user.Phone,
        college: user.College
      }
    });

  } catch (error) {
    next(error);
  }
});

export default router;