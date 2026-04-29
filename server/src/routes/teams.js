import express from 'express';
import pool from '../config/db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Generate unique 8-character join code
const generateJoinCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// Check if join code already exists
const joinCodeExists = async (code) => {
  const [rows] = await pool.execute('SELECT TeamID FROM Teams WHERE JoinCode = ?', [code]);
  return rows.length > 0;
};

// Generate unique join code
const generateUniqueJoinCode = async () => {
  let code;
  let exists = true;
  
  while (exists) {
    code = generateJoinCode();
    exists = await joinCodeExists(code);
  }
  
  return code;
};

// Create a new team for an event
router.post('/', authenticateToken, async (req, res, next) => {
  try {
    const { eventId, teamName } = req.body;
    const leaderId = req.user.ParticipantID;

    if (!eventId || !teamName) {
      return res.status(400).json({ 
        error: 'Event ID and team name are required' 
      });
    }

    // Check if event exists
    const [event] = await pool.execute('SELECT EventID, TeamSize FROM Events WHERE EventID = ?', [eventId]);
    if (event.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Generate unique join code
    const joinCode = await generateUniqueJoinCode();

    // Create team
    const [result] = await pool.execute(
      'INSERT INTO Teams (EventID, TeamName, JoinCode, LeaderID) VALUES (?, ?, ?, ?)',
      [eventId, teamName, joinCode, leaderId]
    );

    // Fetch created team
    const [team] = await pool.execute(`
      SELECT 
        t.TeamID, t.EventID, t.TeamName, t.JoinCode, t.LeaderID, t.CreatedAt,
        p.FName, p.LName, p.Email
      FROM Teams t
      JOIN Participants p ON t.LeaderID = p.ParticipantID
      WHERE t.TeamID = ?
    `, [result.insertId]);

    res.status(201).json({
      message: 'Team created successfully',
      team: team[0]
    });

  } catch (error) {
    next(error);
  }
});

// Join a team using join code
router.post('/join', authenticateToken, async (req, res, next) => {
  try {
    const { joinCode } = req.body;
    const participantId = req.user.ParticipantID;

    if (!joinCode) {
      return res.status(400).json({ error: 'Join code is required' });
    }

    // Find team by join code
    const [team] = await pool.execute(`
      SELECT t.TeamID, t.EventID, t.TeamName, t.LeaderID, 
             e.TeamSize, e.Current_Capacity, e.Max_Capacity
      FROM Teams t
      JOIN Events e ON t.EventID = e.EventID
      WHERE t.JoinCode = ?
    `, [joinCode]);

    if (team.length === 0) {
      return res.status(404).json({ error: 'Invalid join code' });
    }

    const teamData = team[0];

    // Check if already registered for this event
    const [existingReg] = await pool.execute(
      'SELECT * FROM Registrations WHERE ParticipantID = ? AND EventID = ?',
      [participantId, teamData.EventID]
    );

    if (existingReg.length > 0) {
      return res.status(409).json({ error: 'Already registered for this event' });
    }

    // Check if already in this team
    const [existingTeamMember] = await pool.execute(
      'SELECT * FROM Registrations WHERE ParticipantID = ? AND TeamID = ?',
      [participantId, teamData.TeamID]
    );

    if (existingTeamMember.length > 0) {
      return res.status(409).json({ error: 'Already a member of this team' });
    }

    // Check team size constraint
    const [members] = await pool.execute(
      'SELECT COUNT(*) as count FROM Registrations WHERE TeamID = ?',
      [teamData.TeamID]
    );

    if (members[0].count >= teamData.TeamSize) {
      return res.status(409).json({ error: 'Team is full' });
    }

    // Check event capacity
    if (teamData.Current_Capacity >= teamData.Max_Capacity) {
      return res.status(409).json({ error: 'Event is at capacity' });
    }

    // Register participant for the event and team
    await pool.execute(
      'INSERT INTO Registrations (ParticipantID, EventID, TeamID, Status) VALUES (?, ?, ?, ?)',
      [participantId, teamData.EventID, teamData.TeamID, 'confirmed']
    );

    // Fetch updated team with members
    const [updatedTeam] = await pool.execute(`
      SELECT 
        t.TeamID, t.EventID, t.TeamName, t.JoinCode, t.LeaderID, t.CreatedAt,
        p.FName as LeaderFirstName, p.LName as LeaderLastName,
        COUNT(DISTINCT r.ParticipantID) as MemberCount
      FROM Teams t
      JOIN Participants p ON t.LeaderID = p.ParticipantID
      LEFT JOIN Registrations r ON t.TeamID = r.TeamID
      WHERE t.TeamID = ?
      GROUP BY t.TeamID, t.EventID, t.TeamName, t.JoinCode, t.LeaderID, t.CreatedAt, p.FName, p.LName
    `, [teamData.TeamID]);

    res.json({
      message: 'Successfully joined team',
      team: updatedTeam[0]
    });

  } catch (error) {
    next(error);
  }
});

// Get my teams
router.get('/my-teams', authenticateToken, async (req, res, next) => {
  try {
    const participantId = req.user.ParticipantID;

    const [teams] = await pool.execute(`
      SELECT DISTINCT
        t.TeamID, t.EventID, t.TeamName, t.JoinCode, t.LeaderID, t.CreatedAt,
        e.EventName, e.EventDate,
        p.FName as LeaderFirstName, p.LName as LeaderLastName,
        COUNT(DISTINCT r.ParticipantID) as MemberCount,
        t.LeaderID = ? as IsLeader
      FROM Registrations reg
      JOIN Teams t ON reg.TeamID = t.TeamID
      JOIN Events e ON t.EventID = e.EventID
      JOIN Participants p ON t.LeaderID = p.ParticipantID
      LEFT JOIN Registrations r ON t.TeamID = r.TeamID
      WHERE reg.ParticipantID = ?
      GROUP BY t.TeamID, t.EventID, t.TeamName, t.JoinCode, t.LeaderID, t.CreatedAt, 
               e.EventName, e.EventDate, p.FName, p.LName
      ORDER BY e.EventDate DESC
    `, [participantId, participantId]);

    res.json({
      teams: teams
    });

  } catch (error) {
    next(error);
  }
});

// Get team details with members
router.get('/:id', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;

    // Get team info
    const [team] = await pool.execute(`
      SELECT 
        t.TeamID, t.EventID, t.TeamName, t.JoinCode, t.LeaderID, t.CreatedAt,
        e.EventName, e.TeamSize, e.EventDate,
        p.FName as LeaderFirstName, p.LName as LeaderLastName, p.Email as LeaderEmail
      FROM Teams t
      JOIN Events e ON t.EventID = e.EventID
      JOIN Participants p ON t.LeaderID = p.ParticipantID
      WHERE t.TeamID = ?
    `, [id]);

    if (team.length === 0) {
      return res.status(404).json({ error: 'Team not found' });
    }

    // Get team members
    const [members] = await pool.execute(`
      SELECT 
        r.ParticipantID, p.FName, p.LName, p.Email, p.College, r.RegDate,
        p.ParticipantID = ? as IsCurrentUser
      FROM Registrations r
      JOIN Participants p ON r.ParticipantID = p.ParticipantID
      WHERE r.TeamID = ?
      ORDER BY r.RegDate ASC
    `, [req.user.ParticipantID, id]);

    res.json({
      team: team[0],
      members: members,
      memberCount: members.length
    });

  } catch (error) {
    next(error);
  }
});

// Get all teams for an event (route after specific team to avoid collision)
router.get('/event/:eventId', authenticateToken, async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit) || 50));
    const offset = Math.max(0, parseInt(req.query.offset) || 0);

    const [teams] = await pool.execute(`
      SELECT 
        t.TeamID, t.EventID, t.TeamName, t.JoinCode, t.LeaderID, t.CreatedAt,
        p.FName as LeaderFirstName, p.LName as LeaderLastName,
        COUNT(DISTINCT r.ParticipantID) as MemberCount
      FROM Teams t
      JOIN Participants p ON t.LeaderID = p.ParticipantID
      LEFT JOIN Registrations r ON t.TeamID = r.TeamID
      WHERE t.EventID = ?
      GROUP BY t.TeamID, t.EventID, t.TeamName, t.JoinCode, t.LeaderID, t.CreatedAt, p.FName, p.LName
      ORDER BY t.CreatedAt DESC
      LIMIT ${limit} OFFSET ${offset}
    `, [eventId]);

    res.json({
      teams: teams,
      pagination: {
        limit: limit,
        offset: offset,
        count: teams.length
      }
    });

  } catch (error) {
    next(error);
  }
});

export default router;

