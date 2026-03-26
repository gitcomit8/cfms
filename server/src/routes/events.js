import express from 'express';
import pool from '../config/db.js';
import { authenticateToken, roleGuard } from '../middleware/auth.js';

const router = express.Router();

// Get all events (public) with filtering
router.get('/', async (req, res, next) => {
  try {
    const { category, status, search, limit = 50, offset = 0 } = req.query;
    
    let query = `
      SELECT 
        e.EventID, e.EventName, e.Category, e.Description, 
        e.EventDate, e.StartTime, e.EndTime, e.Max_Capacity, 
        e.Current_Capacity, e.TeamSize, e.Status,
        v.VenueName, v.Street, v.City, v.State, v.ZIP, v.Capacity as VenueCapacity
      FROM Events e
      LEFT JOIN Venues v ON e.VenueID = v.VenueID
      WHERE 1=1
    `;
    const params = [];

    if (category) {
      query += ' AND e.Category = ?';
      params.push(category);
    }

    if (status) {
      query += ' AND e.Status = ?';
      params.push(status);
    }

    if (search) {
      query += ' AND (e.EventName LIKE ? OR e.Description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY e.EventDate ASC, e.StartTime ASC';
    query += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [rows] = await pool.execute(query, params);

    res.json({
      events: rows,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        count: rows.length
      }
    });

  } catch (error) {
    next(error);
  }
});

// Get specific event by ID (public)
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.execute(`
      SELECT 
        e.EventID, e.EventName, e.Category, e.Description, 
        e.EventDate, e.StartTime, e.EndTime, e.Max_Capacity, 
        e.Current_Capacity, e.TeamSize, e.Status,
        v.VenueName, v.Street, v.City, v.State, v.ZIP, v.Capacity as VenueCapacity
      FROM Events e
      LEFT JOIN Venues v ON e.VenueID = v.VenueID
      WHERE e.EventID = ?
    `, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Get teams for this event
    const [teams] = await pool.execute(`
      SELECT t.TeamID, t.TeamName, t.JoinCode, 
             p.FName, p.LName, p.Email as LeaderEmail
      FROM Teams t
      JOIN Participants p ON t.LeaderID = p.ParticipantID
      WHERE t.EventID = ?
    `, [id]);

    res.json({
      event: rows[0],
      teams: teams
    });

  } catch (error) {
    next(error);
  }
});

// Create event (admin only)
router.post('/', authenticateToken, roleGuard(['admin']), async (req, res, next) => {
  try {
    const { 
      venueId, eventName, category, description, eventDate, 
      startTime, endTime, maxCapacity, teamSize = 1, status = 'upcoming' 
    } = req.body;

    if (!eventName || !eventDate || !maxCapacity) {
      return res.status(400).json({ 
        error: 'Event name, date, and max capacity are required' 
      });
    }

    if (maxCapacity <= 0) {
      return res.status(400).json({ 
        error: 'Max capacity must be greater than 0' 
      });
    }

    if (teamSize <= 0) {
      return res.status(400).json({ 
        error: 'Team size must be greater than 0' 
      });
    }

    const [result] = await pool.execute(`
      INSERT INTO Events 
      (VenueID, EventName, Category, Description, EventDate, StartTime, EndTime, Max_Capacity, TeamSize, Status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [venueId || null, eventName, category, description, eventDate, startTime, endTime, maxCapacity, teamSize, status]);

    // Fetch the created event
    const [eventRows] = await pool.execute(`
      SELECT 
        e.EventID, e.EventName, e.Category, e.Description, 
        e.EventDate, e.StartTime, e.EndTime, e.Max_Capacity, 
        e.Current_Capacity, e.TeamSize, e.Status,
        v.VenueName
      FROM Events e
      LEFT JOIN Venues v ON e.VenueID = v.VenueID
      WHERE e.EventID = ?
    `, [result.insertId]);

    res.status(201).json({
      message: 'Event created successfully',
      event: eventRows[0]
    });

  } catch (error) {
    next(error);
  }
});

// Update event (admin only)
router.put('/:id', authenticateToken, roleGuard(['admin']), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { 
      venueId, eventName, category, description, eventDate, 
      startTime, endTime, maxCapacity, teamSize, status 
    } = req.body;

    // Check if event exists
    const [existingEvent] = await pool.execute('SELECT EventID FROM Events WHERE EventID = ?', [id]);
    if (existingEvent.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Build dynamic update query
    const updates = [];
    const params = [];

    if (venueId !== undefined) {
      updates.push('VenueID = ?');
      params.push(venueId || null);
    }
    if (eventName !== undefined) {
      updates.push('EventName = ?');
      params.push(eventName);
    }
    if (category !== undefined) {
      updates.push('Category = ?');
      params.push(category);
    }
    if (description !== undefined) {
      updates.push('Description = ?');
      params.push(description);
    }
    if (eventDate !== undefined) {
      updates.push('EventDate = ?');
      params.push(eventDate);
    }
    if (startTime !== undefined) {
      updates.push('StartTime = ?');
      params.push(startTime);
    }
    if (endTime !== undefined) {
      updates.push('EndTime = ?');
      params.push(endTime);
    }
    if (maxCapacity !== undefined) {
      updates.push('Max_Capacity = ?');
      params.push(maxCapacity);
    }
    if (teamSize !== undefined) {
      updates.push('TeamSize = ?');
      params.push(teamSize);
    }
    if (status !== undefined) {
      updates.push('Status = ?');
      params.push(status);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    params.push(id);
    const query = `UPDATE Events SET ${updates.join(', ')} WHERE EventID = ?`;

    await pool.execute(query, params);

    // Fetch updated event
    const [updatedEvent] = await pool.execute(`
      SELECT 
        e.EventID, e.EventName, e.Category, e.Description, 
        e.EventDate, e.StartTime, e.EndTime, e.Max_Capacity, 
        e.Current_Capacity, e.TeamSize, e.Status,
        v.VenueName
      FROM Events e
      LEFT JOIN Venues v ON e.VenueID = v.VenueID
      WHERE e.EventID = ?
    `, [id]);

    res.json({
      message: 'Event updated successfully',
      event: updatedEvent[0]
    });

  } catch (error) {
    next(error);
  }
});

// Delete event (admin only)
router.delete('/:id', authenticateToken, roleGuard(['admin']), async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if event exists
    const [existingEvent] = await pool.execute('SELECT EventID FROM Events WHERE EventID = ?', [id]);
    if (existingEvent.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    await pool.execute('DELETE FROM Events WHERE EventID = ?', [id]);

    res.json({ message: 'Event deleted successfully' });

  } catch (error) {
    next(error);
  }
});

export default router;