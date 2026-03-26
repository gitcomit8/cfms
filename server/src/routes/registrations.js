import express from 'express';
import pool from '../config/db.js';
import { authenticateToken, roleGuard } from '../middleware/auth.js';

const router = express.Router();

// Register for an event (uses transaction with FOR UPDATE for concurrency control)
router.post('/', authenticateToken, async (req, res, next) => {
  const connection = await pool.getConnection();
  
  try {
    const { eventId, teamId = null } = req.body;
    const participantId = req.user.ParticipantID;

    if (!eventId) {
      return res.status(400).json({ error: 'Event ID is required' });
    }

    // Start transaction
    await connection.beginTransaction();

    // Check if already registered
    const [existing] = await connection.execute(
      'SELECT * FROM Registrations WHERE ParticipantID = ? AND EventID = ?',
      [participantId, eventId]
    );

    if (existing.length > 0) {
      await connection.rollback();
      return res.status(409).json({ error: 'Already registered for this event' });
    }

    // Lock row and check capacity (uses FOR UPDATE for concurrency control)
    const [event] = await connection.execute(
      'SELECT EventID, Max_Capacity, Current_Capacity, TeamSize FROM Events WHERE EventID = ? FOR UPDATE',
      [eventId]
    );

    if (event.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Event not found' });
    }

    const eventData = event[0];
    if (eventData.Current_Capacity >= eventData.Max_Capacity) {
      await connection.rollback();
      return res.status(409).json({ error: 'Event is at capacity' });
    }

    // Insert registration (trigger will update capacity)
    await connection.execute(
      'INSERT INTO Registrations (ParticipantID, EventID, TeamID, Status) VALUES (?, ?, ?, ?)',
      [participantId, eventId, teamId, 'confirmed']
    );

    await connection.commit();

    // Fetch registered event details
    const [registrationData] = await connection.execute(`
      SELECT 
        r.ParticipantID, r.EventID, r.TeamID, r.RegDate, r.Status,
        e.EventName, e.EventDate, e.StartTime, e.EndTime,
        t.TeamName
      FROM Registrations r
      JOIN Events e ON r.EventID = e.EventID
      LEFT JOIN Teams t ON r.TeamID = t.TeamID
      WHERE r.ParticipantID = ? AND r.EventID = ?
    `, [participantId, eventId]);

    res.status(201).json({
      message: 'Successfully registered for event',
      registration: registrationData[0]
    });

  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
});

// Get my registrations
router.get('/me', authenticateToken, async (req, res, next) => {
  try {
    const participantId = req.user.ParticipantID;

    const [registrations] = await pool.execute(`
      SELECT 
        r.ParticipantID, r.EventID, r.TeamID, r.RegDate, r.Status,
        e.EventID, e.EventName, e.Category, e.EventDate, e.StartTime, e.EndTime,
        e.Max_Capacity, e.Current_Capacity, e.TeamSize,
        v.VenueName, v.City, v.State,
        t.TeamName
      FROM Registrations r
      JOIN Events e ON r.EventID = e.EventID
      LEFT JOIN Venues v ON e.VenueID = v.VenueID
      LEFT JOIN Teams t ON r.TeamID = t.TeamID
      WHERE r.ParticipantID = ?
      ORDER BY e.EventDate DESC
    `, [participantId]);

    res.json({
      registrations: registrations
    });

  } catch (error) {
    next(error);
  }
});

// Cancel registration
router.delete('/:eventId', authenticateToken, async (req, res, next) => {
  const connection = await pool.getConnection();
  
  try {
    const { eventId } = req.params;
    const participantId = req.user.ParticipantID;

    if (!eventId) {
      return res.status(400).json({ error: 'Event ID is required' });
    }

    // Start transaction to decrement capacity
    await connection.beginTransaction();

    // Check if registration exists
    const [existing] = await connection.execute(
      'SELECT * FROM Registrations WHERE ParticipantID = ? AND EventID = ?',
      [participantId, eventId]
    );

    if (existing.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Registration not found' });
    }

    // Delete registration
    await connection.execute(
      'DELETE FROM Registrations WHERE ParticipantID = ? AND EventID = ?',
      [participantId, eventId]
    );

    // Decrement event capacity
    await connection.execute(
      'UPDATE Events SET Current_Capacity = GREATEST(0, Current_Capacity - 1) WHERE EventID = ?',
      [eventId]
    );

    await connection.commit();

    res.json({ message: 'Registration cancelled successfully' });

  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
});

export default router;
