import express from 'express';
import pool from '../config/db.js';
import { authenticateToken, roleGuard } from '../middleware/auth.js';

const router = express.Router();

// Get all users (admin only)
router.get('/users', authenticateToken, roleGuard(['admin']), async (req, res, next) => {
  try {
    const { role, college, limit = 50, offset = 0 } = req.query;

    let whereConditions = [];
    let params = [];

    if (role) {
      whereConditions.push('Role = ?');
      params.push(role);
    }

    if (college) {
      whereConditions.push('College = ?');
      params.push(college);
    }

    let query = `
      SELECT 
        ParticipantID, FName, LName, Email, Phone, College, Role, CreatedAt
      FROM Participants
    `;

    if (whereConditions.length > 0) {
      query += ' WHERE ' + whereConditions.join(' AND ');
    }

    query += ' ORDER BY CreatedAt DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [users] = await pool.execute(query, params);

    // Get total count for pagination (use same filters but no LIMIT)
    let countParams = [];
    let countQuery = 'SELECT COUNT(*) as total FROM Participants';

    if (whereConditions.length > 0) {
      countQuery += ' WHERE ' + whereConditions.join(' AND ');
      // Rebuild params for count query (same where conditions, no LIMIT)
      countParams = [];
      if (role) countParams.push(role);
      if (college) countParams.push(college);
    }

    const [countResult] = await pool.execute(countQuery, countParams);

    res.json({
      users: users,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        count: users.length,
        total: countResult[0].total
      }
    });

  } catch (error) {
    next(error);
  }
});


// Get user by ID (admin only)
router.get('/users/:id', authenticateToken, roleGuard(['admin']), async (req, res, next) => {
  try {
    const { id } = req.params;

    const [user] = await pool.execute(`
      SELECT 
        ParticipantID, FName, LName, Email, Phone, College, Role, CreatedAt
      FROM Participants
      WHERE ParticipantID = ?
    `, [id]);

    if (user.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get user's event registrations
    const [registrations] = await pool.execute(`
      SELECT 
        r.EventID, e.EventName, e.EventDate, r.Status, r.RegDate,
        t.TeamName, t.TeamID
      FROM Registrations r
      JOIN Events e ON r.EventID = e.EventID
      LEFT JOIN Teams t ON r.TeamID = t.TeamID
      WHERE r.ParticipantID = ?
      ORDER BY e.EventDate DESC
    `, [id]);

    // Get teams if user is admin/has teams
    const [teams] = await pool.execute(`
      SELECT 
        t.TeamID, t.EventID, t.TeamName, t.JoinCode, e.EventName,
        COUNT(DISTINCT r.ParticipantID) as MemberCount
      FROM Teams t
      JOIN Events e ON t.EventID = e.EventID
      LEFT JOIN Registrations r ON t.TeamID = r.TeamID
      WHERE t.LeaderID = ?
      GROUP BY t.TeamID, t.EventID, t.TeamName, t.JoinCode, e.EventName
    `, [id]);

    res.json({
      user: user[0],
      registrations: registrations,
      teamsLed: teams
    });

  } catch (error) {
    next(error);
  }
});

// Assign or change user role (admin only)
router.put('/users/:id/role', authenticateToken, roleGuard(['admin']), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!role) {
      return res.status(400).json({ error: 'Role is required' });
    }

    const validRoles = ['student', 'admin', 'judge'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ 
        error: `Invalid role. Must be one of: ${validRoles.join(', ')}` 
      });
    }

    // Check if user exists
    const [user] = await pool.execute('SELECT ParticipantID FROM Participants WHERE ParticipantID = ?', [id]);
    if (user.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update role
    await pool.execute('UPDATE Participants SET Role = ? WHERE ParticipantID = ?', [role, id]);

    // Fetch updated user
    const [updatedUser] = await pool.execute(`
      SELECT 
        ParticipantID, FName, LName, Email, Phone, College, Role, CreatedAt
      FROM Participants
      WHERE ParticipantID = ?
    `, [id]);

    res.json({
      message: 'User role updated successfully',
      user: updatedUser[0]
    });

  } catch (error) {
    next(error);
  }
});

// Get statistics dashboard (admin only)
router.get('/stats/dashboard', authenticateToken, roleGuard(['admin']), async (req, res, next) => {
  try {
    // Total users by role
    const [usersByRole] = await pool.execute(`
      SELECT Role, COUNT(*) as count
      FROM Participants
      GROUP BY Role
    `);

    // Total events
    const [eventStats] = await pool.execute(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN Status = 'upcoming' THEN 1 ELSE 0 END) as upcoming,
        SUM(CASE WHEN Status = 'active' THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN Status = 'completed' THEN 1 ELSE 0 END) as completed
      FROM Events
    `);

    // Total registrations
    const [regStats] = await pool.execute(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN Status = 'confirmed' THEN 1 ELSE 0 END) as confirmed,
        SUM(CASE WHEN Status = 'cancelled' THEN 1 ELSE 0 END) as cancelled
      FROM Registrations
    `);

    // Total teams
    const [teamStats] = await pool.execute(`
      SELECT COUNT(*) as total FROM Teams
    `);

    // Total venues
    const [venueStats] = await pool.execute(`
      SELECT COUNT(*) as total FROM Venues
    `);

    // Capacity utilization
    const [capacityStats] = await pool.execute(`
      SELECT 
        SUM(Max_Capacity) as totalCapacity,
        SUM(Current_Capacity) as currentUsed,
        ROUND(100 * SUM(Current_Capacity) / SUM(Max_Capacity), 2) as utilizationPercent
      FROM Events
      WHERE Max_Capacity > 0
    `);

    // Top events by registrations
    const [topEvents] = await pool.execute(`
      SELECT 
        e.EventID, e.EventName, COUNT(r.ParticipantID) as registrationCount,
        e.Current_Capacity, e.Max_Capacity
      FROM Events e
      LEFT JOIN Registrations r ON e.EventID = r.EventID AND r.Status = 'confirmed'
      GROUP BY e.EventID, e.EventName, e.Current_Capacity, e.Max_Capacity
      ORDER BY registrationCount DESC
      LIMIT 5
    `);

    res.json({
      usersByRole: usersByRole,
      events: eventStats[0],
      registrations: regStats[0],
      teams: teamStats[0],
      venues: venueStats[0],
      capacity: capacityStats[0],
      topEvents: topEvents
    });

  } catch (error) {
    next(error);
  }
});

// Get event statistics (admin only)
router.get('/stats/events/:eventId', authenticateToken, roleGuard(['admin']), async (req, res, next) => {
  try {
    const { eventId } = req.params;

    // Event details
    const [event] = await pool.execute(`
      SELECT 
        e.EventID, e.EventName, e.Category, e.EventDate, e.StartTime, e.EndTime,
        e.Max_Capacity, e.Current_Capacity, e.TeamSize, e.Status,
        v.VenueName, v.Capacity as VenueCapacity,
        COUNT(DISTINCT r.ParticipantID) as registrationCount,
        COUNT(DISTINCT t.TeamID) as teamCount
      FROM Events e
      LEFT JOIN Venues v ON e.VenueID = v.VenueID
      LEFT JOIN Registrations r ON e.EventID = r.EventID AND r.Status = 'confirmed'
      LEFT JOIN Teams t ON e.EventID = t.EventID
      WHERE e.EventID = ?
      GROUP BY e.EventID, e.EventName, e.Category, e.EventDate, e.StartTime, e.EndTime,
               e.Max_Capacity, e.Current_Capacity, e.TeamSize, e.Status,
               v.VenueName, v.Capacity
    `, [eventId]);

    if (event.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Team statistics for event
    const [teamStats] = await pool.execute(`
      SELECT 
        t.TeamID, t.TeamName, 
        COUNT(DISTINCT r.ParticipantID) as memberCount,
        COUNT(DISTINCT js.JudgeID) as judgeCount,
        ROUND(AVG(js.Score), 2) as averageScore
      FROM Teams t
      LEFT JOIN Registrations r ON t.TeamID = r.TeamID
      LEFT JOIN Judges_Scores js ON t.TeamID = js.TeamID AND t.EventID = js.EventID
      WHERE t.EventID = ?
      GROUP BY t.TeamID, t.TeamName
      ORDER BY averageScore DESC
    `, [eventId]);

    res.json({
      event: event[0],
      teamStatistics: teamStats
    });

  } catch (error) {
    next(error);
  }
});

// Delete user (admin only) - cascade delete
router.delete('/users/:id', authenticateToken, roleGuard(['admin']), async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const [user] = await pool.execute('SELECT ParticipantID FROM Participants WHERE ParticipantID = ?', [id]);
    if (user.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Delete user (cascade will handle related records)
    await pool.execute('DELETE FROM Participants WHERE ParticipantID = ?', [id]);

    res.json({ message: 'User deleted successfully' });

  } catch (error) {
    next(error);
  }
});

export default router;
