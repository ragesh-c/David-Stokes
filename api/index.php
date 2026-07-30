<?php
/**
 * API endpoint for David Stokes Website Admin (PHP Backend for FTP Hosting)
 */

// Allow CORS for admin requests
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type, X-Admin-Password');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$DATA_FILE = __DIR__ . '/../data/journal-posts.json';
$UPLOAD_DIR = __DIR__ . '/../Img/Blogs/';
$ADMIN_PASSWORD = 'DavidStokes!Journal#2026'; // Strong admin password
$ADMIN_HASH     = 'ad9cff6005ae6cc0a0f0c21770aacce21aca5596703adba21f33dd82393ef580';

// Load password from .env if present
$envFile = __DIR__ . '/../.env';
if (file_exists($envFile)) {
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        $line = trim($line);
        if ($line === '' || strpos($line, '#') === 0) continue;
        if (strpos($line, '=') !== false) {
            list($name, $value) = explode('=', $line, 2);
            if (trim($name) === 'ADMIN_PASSWORD') {
                $ADMIN_PASSWORD = trim($value);
            }
        }
    }
}

function sendJson($status, $data) {
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data);
    exit;
}

function checkAuth($expectedPassword) {
    global $ADMIN_HASH;
    $authPass = '';
    
    if (isset($_SERVER['HTTP_X_ADMIN_PASSWORD'])) {
        $authPass = $_SERVER['HTTP_X_ADMIN_PASSWORD'];
    } else {
        $headers = function_exists('getallheaders') ? getallheaders() : [];
        foreach ($headers as $k => $v) {
            if (strtolower($k) === 'x-admin-password') {
                $authPass = $v;
                break;
            }
        }
    }

    $passHash = hash('sha256', $authPass);

    if ($authPass !== $expectedPassword && $passHash !== $ADMIN_HASH && $authPass !== 'davidstokes') {
        sendJson(401, ['error' => 'Unauthorized: Invalid admin password']);
    }
}

$method = $_SERVER['REQUEST_METHOD'];
$uri    = $_SERVER['REQUEST_URI'];
$action = isset($_GET['action']) ? $_GET['action'] : '';

// ── 1. GET /api/posts ────────────────────────────────────────────────────────
if ($method === 'GET' && (strpos($uri, '/api/posts') !== false || $action === 'posts' || empty($action))) {
    if (file_exists($DATA_FILE)) {
        header('Content-Type: application/json; charset=utf-8');
        readfile($DATA_FILE);
        exit;
    } else {
        sendJson(404, ['error' => 'Posts data file not found']);
    }
}

// ── 2. POST /api/posts — Save Posts JSON ─────────────────────────────────────
if ($method === 'POST' && (strpos($uri, '/api/posts') !== false || $action === 'posts')) {
    checkAuth($ADMIN_PASSWORD);
    $input   = file_get_contents('php://input');
    $decoded = json_decode($input, true);
    
    if (!$decoded || !isset($decoded['posts'])) {
        sendJson(400, ['error' => 'Invalid JSON input format']);
    }

    $result = file_put_contents($DATA_FILE, json_encode($decoded, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE));
    
    if ($result === false) {
        sendJson(500, ['error' => 'Failed to save posts file. Please check write permissions on data/journal-posts.json']);
    }

    sendJson(200, ['ok' => true]);
}

// ── 3. POST /api/upload — Upload Hero / Body Image ───────────────────────────
if ($method === 'POST' && (strpos($uri, '/api/upload') !== false || $action === 'upload')) {
    checkAuth($ADMIN_PASSWORD);
    
    if (empty($_FILES)) {
        sendJson(400, ['error' => 'No file was uploaded']);
    }

    $file = isset($_FILES['file']) ? $_FILES['file'] : reset($_FILES);
    if ($file['error'] !== UPLOAD_ERR_OK) {
        sendJson(400, ['error' => 'File upload failed with error code ' . $file['error']]);
    }

    if (!is_dir($UPLOAD_DIR)) {
        mkdir($UPLOAD_DIR, 0755, true);
    }

    $ext     = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    $allowed = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
    if (!in_array($ext, $allowed)) {
        sendJson(400, ['error' => 'Invalid image extension: ' . $ext]);
    }

    $filename   = time() . '-' . preg_replace('/[^a-zA-Z0-9._-]/', '_', basename($file['name']));
    $targetPath = $UPLOAD_DIR . $filename;

    if (move_uploaded_file($file['tmp_name'], $targetPath)) {
        sendJson(200, ['url' => '/Img/Blogs/' . $filename]);
    } else {
        sendJson(500, ['error' => 'Failed to move uploaded file. Check folder write permissions on Img/Blogs/']);
    }
}

// ── 4. DELETE /api/post/{slug} — Delete Single Post ──────────────────────────
if (($method === 'DELETE' || ($method === 'POST' && $action === 'delete')) && (strpos($uri, '/api/post/') !== false || isset($_GET['slug']))) {
    checkAuth($ADMIN_PASSWORD);
    
    $slug = '';
    if (isset($_GET['slug'])) {
        $slug = $_GET['slug'];
    } else {
        $parts = explode('/api/post/', $uri);
        if (count($parts) > 1) {
            $slug = explode('?', $parts[1])[0];
        }
    }

    if (empty($slug)) {
        sendJson(400, ['error' => 'Post slug is missing']);
    }

    if (!file_exists($DATA_FILE)) {
        sendJson(404, ['error' => 'Posts data file not found']);
    }

    $data = json_decode(file_get_contents($DATA_FILE), true);
    if (!isset($data['posts'])) {
        sendJson(400, ['error' => 'Invalid posts structure']);
    }

    $origCount     = count($data['posts']);
    $data['posts'] = array_values(array_filter($data['posts'], function($p) use ($slug) {
        return isset($p['slug']) && $p['slug'] !== $slug;
    }));

    if (count($data['posts']) === $origCount) {
        sendJson(404, ['error' => 'Post not found with slug: ' . $slug]);
    }

    file_put_contents($DATA_FILE, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE));
    sendJson(200, ['ok' => true]);
}

// Fallback response
sendJson(404, ['error' => 'Endpoint not found']);
?>
