# DOCVERO Zero-Dependency Local Static Web Server
# Uses Windows .NET HttpListener

$port = 3000
$prefix = "http://localhost:$port/"
$baseDir = $PSScriptRoot

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add($prefix)

try {
    $listener.Start()
} catch {
    $port = 3001
    $prefix = "http://localhost:$port/"
    $listener = New-Object System.Net.HttpListener
    $listener.Prefixes.Add($prefix)
    $listener.Start()
}

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  DOCVERO - Your Everyday File Toolkit" -ForegroundColor Green
Write-Host "  Local server running at: $prefix" -ForegroundColor Yellow
Write-Host "  Press Ctrl+C to stop." -ForegroundColor Gray
Write-Host "==========================================================" -ForegroundColor Cyan

Start-Process $prefix

while ($listener.IsListening) {
    try {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        $rawUrl = $request.RawUrl.Split('?')[0].Split('#')[0]
        if ($rawUrl -eq '/' -or [string]::IsNullOrWhiteSpace($rawUrl)) {
            $rawUrl = '/index.html'
        }

        $localPath = [System.IO.Path]::Combine($baseDir, $rawUrl.TrimStart('/'))

        if (Test-Path $localPath -PathType Leaf) {
            $ext = [System.IO.Path]::GetExtension($localPath).ToLower()
            $mime = switch ($ext) {
                '.html' { 'text/html; charset=utf-8' }
                '.css'  { 'text/css; charset=utf-8' }
                '.js'   { 'application/javascript; charset=utf-8' }
                '.mjs'  { 'application/javascript; charset=utf-8' }
                '.json' { 'application/json; charset=utf-8' }
                '.png'  { 'image/png' }
                '.jpg'  { 'image/jpeg' }
                '.jpeg' { 'image/jpeg' }
                '.webp' { 'image/webp' }
                '.svg'  { 'image/svg+xml' }
                '.pdf'  { 'application/pdf' }
                default { 'application/octet-stream' }
            }

            $bytes = [System.IO.File]::ReadAllBytes($localPath)
            $response.ContentType = $mime
            $response.ContentLength64 = $bytes.Length
            $response.AddHeader('Cache-Control', 'no-cache')
            if ($request.HttpMethod -ne 'HEAD') {
                $response.OutputStream.Write($bytes, 0, $bytes.Length)
            }
        } else {
            $response.StatusCode = 404
            $msg = [System.Text.Encoding]::UTF8.GetBytes('404 - File Not Found')
            $response.ContentType = 'text/plain'
            if ($request.HttpMethod -ne 'HEAD') {
                $response.OutputStream.Write($msg, 0, $msg.Length)
            }
        }
        $response.Close()
    } catch {
        # Catch individual request disconnects and keep server alive
    }
}
