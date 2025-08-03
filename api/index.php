<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-CSRF-Token');
session_start();

// Verify admin authentication
function verifyAdmin() {
    if (!isset($_SESSION['adminSession'])) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized']);
        exit;
    }
}

// Route handling
$route = $_SERVER['REQUEST_URI'];
$method = $_SERVER['REQUEST_METHOD'];

switch ($route) {
    case '/api/content/update':
        verifyAdmin();
        if ($method === 'POST') {
            $data = json_decode(file_get_contents('php://input'), true);
            updatePageContent($data);
        }
        break;

    case (preg_match('/^\/api\/content\/.*/', $route) ? true : false):
        verifyAdmin();
        if ($method === 'GET') {
            $page = basename($route);
            getPageContent($page);
        }
        break;

    case '/api/notes':
        verifyAdmin();
        if ($method === 'GET') {
            getAllNotes();
        }
        break;

    case '/api/notes/save':
        verifyAdmin();
        if ($method === 'POST') {
            $data = json_decode(file_get_contents('php://input'), true);
            saveNote($data);
        }
        break;

    case (preg_match('/^\/api\/notes\/.*/', $route) ? true : false):
        verifyAdmin();
        if ($method === 'GET') {
            $id = basename($route);
            getNoteById($id);
        }
        break;

    // Add more routes as needed
}

// Add input validation
function validateInput($data) {
    return htmlspecialchars(strip_tags($data));
}

function updatePageContent($data) {
    // Validate input
    $page = validateInput($data['page']);
    $content = validateInput($data['content']);
    $meta = $data['meta'];
    
    // Save to database or file system
    $filename = "../pages/{$page}.html";
    
    // Create backup
    if (file_exists($filename)) {
        copy($filename, "../backups/{$page}_" . date('Y-m-d_H-i-s') . ".html");
    }
    
    // Update content
    file_put_contents($filename, renderPage($content, $meta));
    
    echo json_encode(['success' => true]);
}

function getPageContent($page) {
    $filename = "../pages/{$page}.html";
    if (file_exists($filename)) {
        $content = file_get_contents($filename);
        // Parse content and meta data
        $data = parsePageContent($content);
        echo json_encode($data);
    } else {
        http_response_code(404);
        echo json_encode(['error' => 'Page not found']);
    }
}

// Helper functions
function renderPage($content, $meta) {
    // Template for page rendering
    return "<!DOCTYPE html>
    <html>
    <head>
        <title>{$meta['title']}</title>
        <meta name=\"description\" content=\"{$meta['description']}\">
        <meta name=\"keywords\" content=\"{$meta['keywords']}\">
        <!-- Include your stylesheets and scripts -->
    </head>
    <body>
        {$content}
    </body>
    </html>";
}

function parsePageContent($html) {
    // Parse HTML content and extract meta data
    // Return structured data
    return [
        'content' => $html,
        'meta' => [
            'title' => '', // Extract from HTML
            'description' => '',
            'keywords' => ''
        ]
    ];
}

function getAllNotes() {
    // Fetch notes from the database or file system
    // Return as JSON
}

function saveNote($data) {
    // Save the note to the database or file system
    // Return success response
}

function getNoteById($id) {
    // Fetch a single note by ID
    // Return as JSON
} 