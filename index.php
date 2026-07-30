<?php
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0, s-maxage=0, private');
header('Pragma: no-cache');
header('Expires: Thu, 01 Jan 1970 00:00:00 GMT');
header('X-Accel-Expires: 0');
readfile(__DIR__ . '/index.html');
exit;
?>