-- database/triggers.sql
-- Capacity enforcement trigger
-- Prevents overbooking at the database level (ACID guarantee)

USE cfms;

DROP TRIGGER IF EXISTS check_capacity;

DELIMITER $$
CREATE TRIGGER check_capacity
BEFORE INSERT ON Registrations
FOR EACH ROW
BEGIN
    DECLARE current_cap INT;
    DECLARE max_cap INT;

    SELECT Current_Capacity, Max_Capacity
    INTO current_cap, max_cap
    FROM Events
    WHERE EventID = NEW.EventID;

    IF current_cap >= max_cap THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Event at capacity';
    ELSE
        UPDATE Events
        SET Current_Capacity = current_cap + 1
        WHERE EventID = NEW.EventID;
    END IF;
END$$
DELIMITER ;