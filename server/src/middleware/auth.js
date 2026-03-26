import jwt from 'jsonwebtoken';
import pool from '../config/db.js';

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, async (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }

    // Fetch fresh user data from database
    try {
      const [rows] = await pool.execute(
        'SELECT ParticipantID, FName, LName, Email, Role FROM Participants WHERE ParticipantID = ?',
        [user.participantId]
      );

      if (rows.length === 0) {
        return res.status(403).json({ error: 'User not found' });
      }

      req.user = rows[0];
      next();
    } catch (error) {
      console.error('Auth middleware error:', error);
      res.status(500).json({ error: 'Authentication failed' });
    }
  });
};

export const roleGuard = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!allowedRoles.includes(req.user.Role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};