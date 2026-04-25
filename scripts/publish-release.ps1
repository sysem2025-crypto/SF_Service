param(
    [Parameter(Mandatory = $true)]
    [string]$SourceDir,

    [string]$Product = "ModusSlim2",

    [string]$ReleaseLabel = ""
)

function Get-NormalizedName {
    param([string]$Value)

    return ($Value -replace '[^a-zA-Z0-9._-]+', '_').Trim('_')
}

if (-not (Test-Path -LiteralPath $SourceDir)) {
    Write-Error "Source directory not found: $SourceDir"
    exit 1
}

$projectRoot = Split-Path -Parent $PSScriptRoot
$targetRoot = Join-Path $projectRoot "repository_files\software-firmware"

if (-not (Test-Path -LiteralPath $targetRoot)) {
    New-Item -ItemType Directory -Force -Path $targetRoot | Out-Null
}

$files = Get-ChildItem -LiteralPath $SourceDir -File

if (-not $files.Count) {
    Write-Error "No files found in source directory: $SourceDir"
    exit 1
}

if ([string]::IsNullOrWhiteSpace($ReleaseLabel)) {
    $firstBaseName = [System.IO.Path]::GetFileNameWithoutExtension($files[0].Name)
    $ReleaseLabel = Get-NormalizedName $firstBaseName
}

$productName = Get-NormalizedName $Product
$releaseName = Get-NormalizedName $ReleaseLabel
$destination = Join-Path $targetRoot $productName
$destination = Join-Path $destination $releaseName

New-Item -ItemType Directory -Force -Path $destination | Out-Null

Write-Host "Publishing release..." -ForegroundColor Cyan
Write-Host "Source:      $SourceDir"
Write-Host "Product:     $productName"
Write-Host "Release:     $releaseName"
Write-Host "Destination: $destination"
Write-Host ""

$robocopyArgs = @(
    $SourceDir
    $destination
    "*.*"
    "/E"
    "/R:1"
    "/W:1"
)

robocopy @robocopyArgs
$exitCode = $LASTEXITCODE

if ($exitCode -ge 8) {
    Write-Error "Robocopy failed with exit code $exitCode"
    exit $exitCode
}

$manifestPath = Join-Path $destination "_release_manifest.txt"
$manifest = @(
    "PublishedAt: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
    "SourceDir: $SourceDir"
    "Product: $productName"
    "Release: $releaseName"
    "Files:"
)

$manifest += $files | ForEach-Object { "- $($_.Name) [$($_.Length) bytes]" }

Set-Content -LiteralPath $manifestPath -Value $manifest -Encoding UTF8

Write-Host ""
Write-Host "Release published successfully." -ForegroundColor Green
Write-Host "Manifest: $manifestPath" -ForegroundColor Green
