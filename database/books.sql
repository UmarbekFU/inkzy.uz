CREATE TABLE books (
    id INT IDENTITY(1,1) PRIMARY KEY,
    title NVARCHAR(255) NOT NULL,
    author NVARCHAR(255) NOT NULL,
    isbn NVARCHAR(20),
    summary NTEXT,
    tags NVARCHAR(MAX),
    rating INT,
    read_date DATE,
    notes_content NTEXT,
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE()
);

CREATE INDEX idx_rating ON books(rating);
CREATE INDEX idx_read_date ON books(read_date); 