CREATE TABLE gallery (
    id NVARCHAR(36) PRIMARY KEY,
    title NVARCHAR(200) NOT NULL,
    description NTEXT,
    media_url NVARCHAR(500) NOT NULL,
    media_type NVARCHAR(10) CHECK (media_type IN ('image', 'video')),
    thumbnail_url NVARCHAR(500),
    tags NVARCHAR(MAX),
    position_x DECIMAL(5,2) DEFAULT (RAND() * 100),
    position_y DECIMAL(5,2) DEFAULT (RAND() * 100),
    size_width INT DEFAULT (200 + RAND() * 300),
    size_height INT DEFAULT (200 + RAND() * 300),
    fall_speed DECIMAL(3,2) DEFAULT (0.5 + RAND() * 2),
    rotation DECIMAL(5,2) DEFAULT (RAND() * 360),
    is_active BIT DEFAULT 1,
    display_order INT DEFAULT 0,
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE()
);

-- Create indexes
CREATE INDEX idx_active_order ON gallery (is_active, display_order);
CREATE INDEX idx_created_at ON gallery (created_at);

-- Sample gallery items
INSERT INTO gallery (id, title, description, media_url, media_type, tags, is_active, display_order) VALUES
('gallery-001', 'Mountain Landscape', 'Beautiful mountain scenery at sunset', 'https://picsum.photos/800/600?random=1', 'image', '["nature", "landscape", "mountains"]', 1, 1),
('gallery-002', 'Urban Architecture', 'Modern city skyline at night', 'https://picsum.photos/800/600?random=2', 'image', '["architecture", "urban", "city"]', 1, 2),
('gallery-003', 'Ocean Waves', 'Peaceful ocean waves crashing on shore', 'https://picsum.photos/800/600?random=3', 'image', '["nature", "ocean", "waves"]', 1, 3),
('gallery-004', 'Sample Video', 'A sample video for testing', 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4', 'video', '["video", "sample", "test"]', 1, 4),
('gallery-005', 'Forest Path', 'Sunlight filtering through trees', 'https://picsum.photos/800/600?random=4', 'image', '["nature", "forest", "trees"]', 1, 5); 