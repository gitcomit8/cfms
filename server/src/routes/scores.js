import express from 'express';
import pool from '../config/db.js';
import { authenticateToken, roleGuard } from '../middleware/auth.js';

const router = express.Router();

// Submit a score for a team (judge only)
router.post('/', authenticateToken, roleGuard(['judge']), async (req, res, next) => {
  try {
    const { teamId, eventId, criteriaName, score, weight = 1.00 } = req.body;
    const judgeId = req.user.ParticipantID;

    // Validation
    if (!teamId || !eventId || !criteriaName || score === undefined) {
      return res.status(400).json({ 
        error: 'Team ID, event ID, criteria name, and score are required' 
      });
    }

    if (isNaN(score) || score < 0 || score > 100) {
      return res.status(400).json({ 
        error: 'Score must be a number between 0 and 100' 
      });
    }

    if (isNaN(weight) || weight <= 0) {
      return res.status(400).json({ 
        error: 'Weight must be a positive number' 
      });
    }

    // Check if team exists
    const [team] = await pool.execute(
      'SELECT TeamID, EventID FROM Teams WHERE TeamID = ? AND EventID = ?',
      [teamId, eventId]
    );

    if (team.length === 0) {
      return res.status(404).json({ error: 'Team not found in this event' });
    }

    // Check if event exists
    const [event] = await pool.execute('SELECT EventID FROM Events WHERE EventID = ?', [eventId]);
    if (event.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Insert or update score
    const [result] = await pool.execute(`
      INSERT INTO Judges_Scores (JudgeID, TeamID, EventID, CriteriaName, Score, Weight)
      VALUES (?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        Score = VALUES(Score),
        Weight = VALUES(Weight),
        ScoredAt = CURRENT_TIMESTAMP
    `, [judgeId, teamId, eventId, criteriaName, score, weight]);

    // Fetch the submitted score
    const [scoreData] = await pool.execute(`
      SELECT 
        ScoreID, JudgeID, TeamID, EventID, CriteriaName, Score, Weight, ScoredAt
      FROM Judges_Scores
      WHERE JudgeID = ? AND TeamID = ? AND EventID = ? AND CriteriaName = ?
    `, [judgeId, teamId, eventId, criteriaName]);

    res.status(201).json({
      message: 'Score submitted successfully',
      score: scoreData[0]
    });

  } catch (error) {
    next(error);
  }
});

// Get all scores for a team in an event
router.get('/team/:teamId/event/:eventId', authenticateToken, async (req, res, next) => {
  try {
    const { teamId, eventId } = req.params;

    const [scores] = await pool.execute(`
      SELECT 
        ScoreID, JudgeID, TeamID, EventID, CriteriaName, Score, Weight, ScoredAt,
        p.FName as JudgeFirstName, p.LName as JudgeLastName
      FROM Judges_Scores js
      JOIN Participants p ON js.JudgeID = p.ParticipantID
      WHERE js.TeamID = ? AND js.EventID = ?
      ORDER BY js.ScoredAt DESC
    `, [teamId, eventId]);

    res.json({
      scores: scores
    });

  } catch (error) {
    next(error);
  }
});

// Get leaderboard for an event (uses stored procedure)
router.get('/leaderboard/:eventId', async (req, res, next) => {
  try {
    const { eventId } = req.params;

    // Check if event exists
    const [event] = await pool.execute('SELECT EventID, EventName FROM Events WHERE EventID = ?', [eventId]);
    if (event.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Call stored procedure GenerateLeaderboard
    const [leaderboard] = await pool.execute('CALL GenerateLeaderboard(?)', [eventId]);

    res.json({
      event: event[0],
      leaderboard: leaderboard[0] || []
    });

  } catch (error) {
    next(error);
  }
});

// Get scores submitted by me (judge endpoint)
router.get('/my-scores', authenticateToken, roleGuard(['judge']), async (req, res, next) => {
  try {
    const judgeId = req.user.ParticipantID;

    const [scores] = await pool.execute(`
      SELECT 
        js.ScoreID, js.JudgeID, js.TeamID, js.EventID, js.CriteriaName, 
        js.Score, js.Weight, js.ScoredAt,
        t.TeamName, e.EventName,
        p.FName, p.LName
      FROM Judges_Scores js
      JOIN Teams t ON js.TeamID = t.TeamID
      JOIN Events e ON js.EventID = e.EventID
      JOIN Participants p ON t.LeaderID = p.ParticipantID
      WHERE js.JudgeID = ?
      ORDER BY js.ScoredAt DESC
    `, [judgeId]);

    res.json({
      scores: scores
    });

  } catch (error) {
    next(error);
  }
});

// Get scores for specific event (judge can view all scores for event they're judging)
router.get('/event/:eventId/all-scores', authenticateToken, roleGuard(['judge', 'admin']), async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const { teamId } = req.query;

    // Check if event exists
    const [event] = await pool.execute('SELECT EventID, EventName FROM Events WHERE EventID = ?', [eventId]);
    if (event.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    let query = `
      SELECT 
        js.ScoreID, js.JudgeID, js.TeamID, js.EventID, js.CriteriaName, 
        js.Score, js.Weight, js.ScoredAt,
        t.TeamName,
        judge.FName as JudgeFirstName, judge.LName as JudgeLastName
      FROM Judges_Scores js
      JOIN Teams t ON js.TeamID = t.TeamID
      JOIN Participants judge ON js.JudgeID = judge.ParticipantID
      WHERE js.EventID = ?
    `;
    const params = [eventId];

    if (teamId) {
      query += ' AND js.TeamID = ?';
      params.push(teamId);
    }

    query += ' ORDER BY t.TeamID, js.CriteriaName, js.ScoredAt DESC';

    const [scores] = await pool.execute(query, params);

    res.json({
      event: event[0],
      scores: scores
    });

  } catch (error) {
    next(error);
  }
});

export default router;
