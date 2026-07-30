<?php
// Purge OPcache and web server proxy cache
if (function_exists('opcache_reset')) {
    opcache_reset();
}
if (function_exists('clearstatcache')) {
    clearstatcache(true);
}

// Common reverse proxy cache purge headers
header('X-LiteSpeed-Purge: *');
header('X-Cache-Purge: *');
header('Nginx-Purge: *');
header('Purge: *');
header('Clear-Site-Data: "cache", "storage"');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0, s-maxage=0, private');
header('Pragma: no-cache');
header('Expires: Thu, 01 Jan 1970 00:00:00 GMT');

echo "Purge signal sent successfully.";
?>
