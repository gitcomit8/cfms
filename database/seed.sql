-- database/seed.sql
-- Sample data for demonstration

USE cfms;

-- Clear existing data (order matters due to FKs)
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE Judges_Scores;
TRUNCATE TABLE Registrations;
TRUNCATE TABLE Teams;
TRUNCATE TABLE Events;
TRUNCATE TABLE Participants;
TRUNCATE TABLE Venues;
SET FOREIGN_KEY_CHECKS = 1;

-- Venues
INSERT INTO Venues (VenueName, Street, City, State, ZIP, Capacity) VALUES
('Main Auditorium', '100 College Rd', 'Chennai', 'Tamil Nadu', '600001', 500),
('CS Lab Block', '101 College Rd', 'Chennai', 'Tamil Nadu', '600001', 60),
('Open Air Theatre', '102 College Rd', 'Chennai', 'Tamil Nadu', '600001', 1000),
('Conference Hall', '103 College Rd', 'Chennai', 'Tamil Nadu', '600001', 150),
('Sports Ground', '104 College Rd', 'Chennai', 'Tamil Nadu', '600001', 200);

-- Participants (password = 'password123' hashed with bcrypt)
INSERT INTO Participants (FName, LName, Email, PasswordHash, Phone, College, Role) VALUES
('Arjun', 'Sharma', 'arjun@college.edu', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '9876543210', 'ABC College', 'student'),
('Priya', 'Singh', 'priya@college.edu', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '9876543211', 'ABC College', 'student'),
('Rahul', 'Kumar', 'rahul@college.edu', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '9876543212', 'XYZ University', 'student'),
('Sneha', 'Patel', 'sneha@college.edu', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '9876543213', 'DEF Institute', 'student'),
('Ayush', 'Gupta', 'ayush@college.edu', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '9876543214', 'ABC College', 'admin'),
('Dr. Ayaan', 'Khan', 'ayaan@college.edu', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '9876543215', 'ABC College', 'judge'),
('Prof. Meera', 'Nair', 'meera@college.edu', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '9876543216', 'ABC College', 'judge');

-- Events
INSERT INTO Events (VenueID, EventName, Category, Description, EventDate, StartTime, EndTime, Max_Capacity, TeamSize, Status) VALUES
(1, 'Code Wars', 'Technical', 'Competitive programming contest', '2026-04-15', '09:00:00', '17:00:00', 100, 3, 'upcoming'),
(2, 'Web Development Challenge', 'Technical', '24-hour hackathon for web development', '2026-04-16', '08:00:00', '08:00:00', 60, 2, 'upcoming'),
(3, 'Solo Singing', 'Cultural', 'Individual singing competition', '2026-04-17', '14:00:00', '18:00:00', 50, 1, 'upcoming'),
(4, 'Dance Battle', 'Cultural', 'Group dance competition', '2026-04-18', '16:00:00', '20:00:00', 80, 5, 'upcoming'),
(5, 'Photography Contest', 'Creative', 'Theme-based photography competition', '2026-04-19', '10:00:00', '15:00:00', 40, 1, 'upcoming');

-- Teams
INSERT INTO Teams (EventID, TeamName, JoinCode, LeaderID) VALUES
(1, 'Code Masters', 'CM2024AB', 1),
(1, 'Debug Squad', 'DS2024XY', 3),
(2, 'Web Wizards', 'WW2024PQ', 2),
(4, 'Dance Dynamos', 'DD2024RS', 4);

-- Registrations
INSERT INTO Registrations (ParticipantID, EventID, TeamID, Status) VALUES
(1, 1, 1, 'confirmed'),    -- Arjun in Code Masters
(2, 1, NULL, 'confirmed'), -- Priya registered for Code Wars (no team yet)
(3, 1, 2, 'confirmed'),    -- Rahul in Debug Squad
(2, 2, 3, 'confirmed'),    -- Priya in Web Wizards (leader)
(1, 3, NULL, 'confirmed'), -- Arjun in Solo Singing
(4, 4, 4, 'confirmed'),    -- Sneha in Dance Dynamos (leader)
(3, 5, NULL, 'confirmed'); -- Rahul in Photography Contest

-- Sample Scores (from judges)
INSERT INTO Judges_Scores (JudgeID, TeamID, EventID, CriteriaName, Score, Weight) VALUES
(6, 1, 1, 'Algorithm Efficiency', 8.5, 1.2),
(6, 1, 1, 'Code Quality', 9.0, 1.0),
(6, 1, 1, 'Problem Solving', 8.8, 1.1),
(7, 1, 1, 'Algorithm Efficiency', 8.2, 1.2),
(7, 1, 1, 'Code Quality', 8.7, 1.0),
(7, 1, 1, 'Problem Solving', 9.1, 1.1),
(6, 2, 1, 'Algorithm Efficiency', 7.8, 1.2),
(6, 2, 1, 'Code Quality', 8.3, 1.0),
(6, 2, 1, 'Problem Solving', 8.0, 1.1);