<?php
require_once 'db.php';
header('Content-Type: application/json');

// Verify admin authentication
function verifyAdmin() {
    session_start();
    if (!isset($_SESSION['adminSession'])) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized']);
        exit;
    }
}

// Route handling
$method = $_SERVER['REQUEST_METHOD'];
$route = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

switch ($route) {
    case '/api/books':
        if ($method === 'GET') {
            getBooks();
        } elseif ($method === 'POST') {
            verifyAdmin();
            addBook();
        }
        break;

    case (preg_match('/^\/api\/books\/\d+$/', $route) ? true : false):
        $id = basename($route);
        if ($method === 'GET') {
            getBook($id);
        } elseif ($method === 'PUT') {
            verifyAdmin();
            updateBook($id);
        } elseif ($method === 'DELETE') {
            verifyAdmin();
            deleteBook($id);
        }
        break;
}

function getBooks() {
    global $db;
    try {
        $query = "SELECT * FROM books ORDER BY rating DESC, read_date DESC";
        $stmt = $db->query($query);
        $books = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($books);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error']);
    }
}

function getBook($id) {
    global $db;
    try {
        $stmt = $db->prepare("SELECT * FROM books WHERE id = ?");
        $stmt->execute([$id]);
        $book = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($book) {
            echo json_encode($book);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Book not found']);
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error']);
    }
}

function addBook() {
    global $db;
    try {
        $data = json_decode(file_get_contents('php://input'), true);
        
        $query = "INSERT INTO books (
            title, author, isbn, summary, tags, 
            rating, read_date, notes_content
        ) VALUES (
            :title, :author, :isbn, :summary, :tags,
            :rating, :read_date, :notes_content
        )";
        
        $stmt = $db->prepare($query);
        $stmt->execute([
            'title' => $data['title'],
            'author' => $data['author'],
            'isbn' => $data['isbn'],
            'summary' => $data['summary'],
            'tags' => json_encode($data['tags']),
            'rating' => $data['rating'],
            'read_date' => $data['readDate'],
            'notes_content' => $data['notesContent']
        ]);
        
        echo json_encode(['success' => true, 'id' => $db->lastInsertId()]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to add book']);
    }
}

function updateBook($id) {
    global $db;
    try {
        $data = json_decode(file_get_contents('php://input'), true);
        
        $query = "UPDATE books SET 
            title = :title,
            author = :author,
            isbn = :isbn,
            summary = :summary,
            tags = :tags,
            rating = :rating,
            read_date = :read_date,
            notes_content = :notes_content
            WHERE id = :id";
        
        $stmt = $db->prepare($query);
        $stmt->execute([
            'id' => $id,
            'title' => $data['title'],
            'author' => $data['author'],
            'isbn' => $data['isbn'],
            'summary' => $data['summary'],
            'tags' => json_encode($data['tags']),
            'rating' => $data['rating'],
            'read_date' => $data['readDate'],
            'notes_content' => $data['notesContent']
        ]);
        
        echo json_encode(['success' => true]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to update book']);
    }
}

function deleteBook($id) {
    global $db;
    try {
        $stmt = $db->prepare("DELETE FROM books WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(['success' => true]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to delete book']);
    }
} 
