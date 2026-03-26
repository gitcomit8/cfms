-- database/schema.sql
-- CFMS Database Schema (BCNF Normalized)

CREATE DATABASE IF NOT EXISTS cfms;
USE cfms;

-- ============================================
-- Venues (extracted per 3NF/BCNF - no transitive deps)
-- Address decomposed to atomic fields per 1NF
-- ============================================
CREATE TABLE Venues (
    VenueID INT AUTO_INCREMENT PRIMARY KEY,
    VenueName VARCHAR(100) NOT NULL,
    Street VARCHAR(100),
    City VARCHAR(50),
    State VARCHAR(50),
    ZIP VARCHAR(10),
    Capacity INT
);

-- ============================================
-- Participants (all user roles in one table)
-- Name split into FName/LName per 1NF
-- ============================================
CREATE TABLE Participants (
    ParticipantID INT AUTO_INCREMENT PRIMARY KEY,
    FName VARCHAR(50) NOT NULL,
    LName VARCHAR(50) NOT NULL,
    Email VARCHAR(100) UNIQUE NOT NULL,
    PasswordHash VARCHAR(255) NOT NULL,
    Phone VARCHAR(15),
    College VARCHAR(100),
    Role ENUM('student', 'admin', 'judge') DEFAULT 'student',
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- Events (FK to Venues = Many-to-One)
-- ============================================
CREATE TABLE Events (
    EventID INT AUTO_INCREMENT PRIMARY KEY,
    VenueID INT,
    EventName VARCHAR(100) NOT NULL,
    Category VARCHAR(50),
    Description TEXT,
    EventDate DATE NOT NULL,
    StartTime TIME,
    EndTime TIME,
    Max_Capacity INT NOT NULL,
    Current_Capacity INT DEFAULT 0,
    TeamSize INT DEFAULT 1,
    Status ENUM('upcoming', 'active', 'completed') DEFAULT 'upcoming',
    FOREIGN KEY (VenueID) REFERENCES Venues(VenueID) ON DELETE SET NULL
);

-- ============================================
-- Teams (FK to Events = Many-to-One, LeaderID -> Participants)
-- ============================================
CREATE TABLE Teams (
    TeamID INT AUTO_INCREMENT PRIMARY KEY,
    EventID INT NOT NULL,
    TeamName VARCHAR(100) NOT NULL,
    JoinCode VARCHAR(8) UNIQUE NOT NULL,
    LeaderID INT NOT NULL,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (EventID) REFERENCES Events(EventID) ON DELETE CASCADE,
    FOREIGN KEY (LeaderID) REFERENCES Participants(ParticipantID) ON DELETE CASCADE
);

-- ============================================
-- Registrations (composite PK per 2NF - no partial deps)
-- Participant M:N Events junction table
-- ============================================
CREATE TABLE Registrations (
    ParticipantID INT NOT NULL,
    EventID INT NOT NULL,
    TeamID INT,
    RegDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    Status ENUM('confirmed', 'cancelled') DEFAULT 'confirmed',
    PRIMARY KEY (ParticipantID, EventID),
    FOREIGN KEY (ParticipantID) REFERENCES Participants(ParticipantID) ON DELETE CASCADE,
    FOREIGN KEY (EventID) REFERENCES Events(EventID) ON DELETE CASCADE,
    FOREIGN KEY (TeamID) REFERENCES Teams(TeamID) ON DELETE SET NULL
);

-- ============================================
-- Judges_Scores (criteria-based scoring with weights)
-- ============================================
CREATE TABLE Judges_Scores (
    ScoreID INT AUTO_INCREMENT PRIMARY KEY,
    JudgeID INT NOT NULL,
    TeamID INT NOT NULL,
    EventID INT NOT NULL,
    CriteriaName VARCHAR(50) NOT NULL,
    Score DECIMAL(5,2) NOT NULL,
    Weight DECIMAL(3,2) DEFAULT 1.00,
    ScoredAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (JudgeID) REFERENCES Participants(ParticipantID) ON DELETE CASCADE,
    FOREIGN KEY (TeamID) REFERENCES Teams(TeamID) ON DELETE CASCADE,
    FOREIGN KEY (EventID) REFERENCES Events(EventID) ON DELETE CASCADE
);

-- ============================================
-- Indexes on foreign keys for join performance
-- ============================================
CREATE INDEX idx_events_venue ON Events(VenueID);
CREATE INDEX idx_events_category ON Events(Category);
CREATE INDEX idx_events_date ON Events(EventDate);
CREATE INDEX idx_teams_event ON Teams(EventID);
CREATE INDEX idx_teams_joincode ON Teams(JoinCode);
CREATE INDEX idx_registrations_event ON Registrations(EventID);
CREATE INDEX idx_scores_event ON Judges_Scores(EventID);
CREATE INDEX idx_scores_team ON Judges_Scores(TeamID);