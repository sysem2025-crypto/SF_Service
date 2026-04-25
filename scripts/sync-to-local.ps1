param(
    [string]$Source = "H:\Life_OS\01_Lavoro\06_Service\03_Assistenza\07_Web_Assistenza_GitHub",
    [string]$Destination = "C:\project\web_assistenza",
    [switch]$Mirror
)

$robocopyArgs = @(
    $Source
    $Destination
)

if ($Mirror) {
    $robocopyArgs += "/MIR"
} else {
    $robocopyArgs += "/E"
}

$robocopyArgs += @(
    "/XD", "node_modules", ".next", ".git"
    "/XF", ".env.local"
)

Write-Host "Sincronizzazione progetto..." -ForegroundColor Cyan
Write-Host "Sorgente:      $Source"
Write-Host "Destinazione:  $Destination"
Write-Host "Modalita:      $(if ($Mirror) { 'mirror' } else { 'copy recursive' })"
Write-Host ""

robocopy @robocopyArgs

$exitCode = $LASTEXITCODE

if ($exitCode -ge 8) {
    Write-Error "Robocopy ha restituito un errore. Exit code: $exitCode"
    exit $exitCode
}

Write-Host ""
Write-Host "Sincronizzazione completata. Exit code robocopy: $exitCode" -ForegroundColor Green
Write-Host "Ora puoi andare in $Destination e lanciare npm run dev" -ForegroundColor Green
