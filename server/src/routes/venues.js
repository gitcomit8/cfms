import express from 'express';
import pool from '../config/db.js';
import { authenticateToken, roleGuard } from '../middleware/auth.js';

const router = express.Router();

// Get all venues (admin only for now, could be made public)
router.get('/', authenticateToken, roleGuard(['admin']), async (req, res, next) => {
  try {
    const [rows] = await pool.execute(`
      SELECT VenueID, VenueName, Street, City, State, ZIP, Capacity
      FROM Venues
      ORDER BY VenueName
    `);

    res.json({ venues: rows });

  } catch (error) {
    next(error);
  }
});

// Get specific venue by ID
router.get('/:id', authenticateToken, roleGuard(['admin']), async (req, res, next) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.execute(`
      SELECT VenueID, VenueName, Street, City, State, ZIP, Capacity
      FROM Venues
      WHERE VenueID = ?
    `, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Venue not found' });
    }

    // Get events at this venue
    const [events] = await pool.execute(`
      SELECT EventID, EventName, EventDate, StartTime, EndTime, Max_Capacity, Current_Capacity
      FROM Events
      WHERE VenueID = ?
      ORDER BY EventDate DESC
    `, [id]);

    res.json({
      venue: rows[0],
      events: events
    });

  } catch (error) {
    next(error);
  }
});

// Create venue (admin only)
router.post('/', authenticateToken, roleGuard(['admin']), async (req, res, next) => {
  try {
    const { venueName, street, city, state, zip, capacity } = req.body;

    if (!venueName) {
      return res.status(400).json({ error: 'Venue name is required' });
    }

    if (capacity && capacity <= 0) {
      return res.status(400).json({ error: 'Capacity must be greater than 0' });
    }

    const [result] = await pool.execute(`
      INSERT INTO Venues (VenueName, Street, City, State, ZIP, Capacity)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [venueName, street || null, city || null, state || null, zip || null, capacity || null]);

    // Fetch the created venue
    const [venueRows] = await pool.execute(`
      SELECT VenueID, VenueName, Street, City, State, ZIP, Capacity
      FROM Venues
      WHERE VenueID = ?
    `, [result.insertId]);

    res.status(201).json({
      message: 'Venue created successfully',
      venue: venueRows[0]
    });

  } catch (error) {
    next(error);
  }
});

// Update venue (admin only)
router.put('/:id', authenticateToken, roleGuard(['admin']), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { venueName, street, city, state, zip, capacity } = req.body;

    // Check if venue exists
    const [existingVenue] = await pool.execute('SELECT VenueID FROM Venues WHERE VenueID = ?', [id]);
    if (existingVenue.length === 0) {
      return res.status(404).json({ error: 'Venue not found' });
    }

    // Build dynamic update query
    const updates = [];
    const params = [];

    if (venueName !== undefined) {
      updates.push('VenueName = ?');
      params.push(venueName);
    }
    if (street !== undefined) {
      updates.push('Street = ?');
      params.push(street || null);
    }
    if (city !== undefined) {
      updates.push('City = ?');
      params.push(city || null);
    }
    if (state !== undefined) {
      updates.push('State = ?');
      params.push(state || null);
    }
    if (zip !== undefined) {
      updates.push('ZIP = ?');
      params.push(zip || null);
    }
    if (capacity !== undefined) {
      updates.push('Capacity = ?');
      params.push(capacity || null);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    params.push(id);
    const query = `UPDATE Venues SET ${updates.join(', ')} WHERE VenueID = ?`;

    await pool.execute(query, params);

    // Fetch updated venue
    const [updatedVenue] = await pool.execute(`
      SELECT VenueID, VenueName, Street, City, State, ZIP, Capacity
      FROM Venues
      WHERE VenueID = ?
    `, [id]);

    res.json({
      message: 'Venue updated successfully',
      venue: updatedVenue[0]
    });

  } catch (error) {
    next(error);
  }
});

// Delete venue (admin only)
router.delete('/:id', authenticateToken, roleGuard(['admin']), async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if venue exists
    const [existingVenue] = await pool.execute('SELECT VenueID FROM Venues WHERE VenueID = ?', [id]);
    if (existingVenue.length === 0) {
      return res.status(404).json({ error: 'Venue not found' });
    }

    // Check if venue is in use
    const [eventsUsingVenue] = await pool.execute('SELECT COUNT(*) as count FROM Events WHERE VenueID = ?', [id]);
    if (eventsUsingVenue[0].count > 0) {
      return res.status(409).json({ 
        error: 'Cannot delete venue. It is being used by existing events.' 
      });
    }

    await pool.execute('DELETE FROM Venues WHERE VenueID = ?', [id]);

    res.json({ message: 'Venue deleted successfully' });

  } catch (error) {
    next(error);
  }
});

export default router;