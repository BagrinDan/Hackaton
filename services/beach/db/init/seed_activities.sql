CREATE TABLE IF NOT EXISTS activities (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    capacity INT NOT NULL
);

INSERT INTO activities (id, name, description, capacity) VALUES
('ACT001', 'Beach Volleyball', 'Competitive beach volleyball tournament.', 20),
('ACT002', 'Surf Lessons', 'Beginner-friendly surf training session.', 15),
('ACT003', 'Snorkeling Adventure', 'Explore underwater marine life.', 12),
('ACT004', 'Sunrise Yoga', 'Morning yoga on the beach.', 25),
('ACT005', 'Kayaking Tour', 'Guided kayaking along the coastline.', 10),
('ACT006', 'Sandcastle Competition', 'Build the ultimate sandcastle.', 30),
('ACT007', 'Beach Soccer', 'Friendly soccer matches on the sand.', 22),
('ACT008', 'Scuba Diving', 'Discover deeper ocean wonders.', 8),
('ACT009', 'Jet Ski Experience', 'High-speed water adventure.', 1),
('ACT010', 'Beach Bonfire', 'Evening gathering with music and snacks.', 40),
('ACT011', 'Fishing Excursion', 'Learn fishing techniques with experts.', 10),
('ACT012', 'Paddle Boarding', 'Relaxing paddle board session.', 14),
('ACT013', 'Nature Walk', 'Guided tour of local flora and fauna.', 18),
('ACT014', 'Photography Workshop', 'Capture stunning beach landscapes.', 16),
('ACT015', 'Treasure Hunt', 'Family-friendly beach treasure hunt.', 25),
('ACT016', 'Cooking Class', 'Learn to prepare local seafood dishes.', 12),
('ACT017', 'Sailing Basics', 'Introduction to sailing techniques.', 10),
('ACT018', 'Beach Cleanup', 'Community environmental activity.', 50),
('ACT019', 'Meditation Session', 'Relaxing guided meditation by the sea.', 20),
('ACT020', 'Sunset Cruise', 'Boat cruise during sunset hours.', 15);