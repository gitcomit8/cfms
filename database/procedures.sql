-- database/procedures.sql
-- Leaderboard generation with weighted score aggregation

USE cfms;

DROP PROCEDURE IF EXISTS GenerateLeaderboard;

DELIMITER $$
CREATE PROCEDURE GenerateLeaderboard(IN p_EventID INT)
BEGIN
    SELECT
        t.TeamID,
        t.TeamName,
        ROUND(
            SUM(js.Score * js.Weight) / SUM(js.Weight),
            2
        ) AS WeightedAvg,
        COUNT(DISTINCT js.JudgeID) AS JudgeCount,
        COUNT(DISTINCT js.CriteriaName) AS CriteriaCount
    FROM Teams t
    INNER JOIN Judges_Scores js ON t.TeamID = js.TeamID AND t.EventID = js.EventID
    WHERE t.EventID = p_EventID
    GROUP BY t.TeamID, t.TeamName
    ORDER BY WeightedAvg DESC;
END$$
DELIMITER ;