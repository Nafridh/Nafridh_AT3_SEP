-- Sample Guilds
INSERT INTO Guilds (name, total_points) VALUES
('Shadow Seekers', 0),
('Page Turners', 0);

-- Sample Users
INSERT INTO Users (username, password, guild_id, is_admin, total_points) VALUES
('alice', 'password123', 1, 0, 0),
('bob', 'passbob', 2, 0, 0),
('teacher1', 'adminpass', NULL, 1, 0);

-- Sample Poll
INSERT INTO Polls (title, description, start_date, end_date, active) VALUES
('July Book Vote', 'Pick our July read!', '2025-06-01', '2025-06-30', 1);

-- Sample Books for the Poll
INSERT INTO Books (title, author, poll_id) VALUES
('The Book Thief', 'Markus Zusak', 1),
('Six of Crows', 'Leigh Bardugo', 1),
('The Giver', 'Lois Lowry', 1);

-- Sample Quests
INSERT INTO Quests (title, description, points, created_by) VALUES
('Read for 30 minutes before bed', 'Complete this 3 times a week', 10, 3),
('Discuss your favourite character with your guild', 'One-time task', 15, 3);

SELECT name, total_points FROM Guilds ORDER BY total_points DESC;

-- Get user's guild_id
SELECT guild_id FROM Users WHERE user_id = ?;

-- Then update the guild's points
UPDATE Guilds SET total_points = total_points + ? WHERE guild_id = ?;

INSERT INTO Polls (title, description, start_date, end_date, is_active)
VALUES ('August 2025 Book Poll', 'Vote for your next read!', '2025-07-01', '2025-08-01', 2);

SELECT poll_id FROM Polls WHERE title = 'August 2025 Book Poll';

INSERT INTO Books (title, author, description, cover_url, poll_id)
VALUES

('1984', 'George Orwell', 'A dystopian novel about totalitarianism.', 'images/1984.jpg', 2),
('To Kill a Mockingbird', 'Harper Lee', 'A story about justice and racial tension.', 'images/mockingbird.jpg', 2),
('Pride and Prejudice', 'Jane Austen', 'A romantic novel about manners and marriage.', 'images/pride.jpg', 2);
