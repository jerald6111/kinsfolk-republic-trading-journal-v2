# KRTJ Desktop Release Process - PowerShell Script
# This script automates the version management and deployment process

param(
    [Parameter(Mandatory=$true)]
    [string]$NewVersion,
    
    [Parameter(Mandatory=$true)]
    [string]$ReleaseTitle,
    
    [Parameter(Mandatory=$false)]
    [string]$ReleaseNotes = ""
)

Write-Host "🚀 Starting KRTJ Desktop Release Process v$NewVersion" -ForegroundColor Green

# Step 1: Archive current version
Write-Host "📁 Archiving current version..." -ForegroundColor Yellow
$currentVersionFile = "public/downloads/version.json"
if (Test-Path $currentVersionFile) {
    $currentVersion = (Get-Content $currentVersionFile | ConvertFrom-Json).version
    $archiveFile = "public/downloads/archive/version-$currentVersion.json"
    Copy-Item $currentVersionFile $archiveFile
    Write-Host "✅ Archived version $currentVersion to archive/" -ForegroundColor Green
}

# Step 2: Clean up old archives (keep only last 2 versions)
Write-Host "🧹 Cleaning old archive versions..." -ForegroundColor Yellow
$archiveFiles = Get-ChildItem "public/downloads/archive/version-*.json" | Sort-Object Name -Descending
if ($archiveFiles.Count -gt 2) {
    $filesToRemove = $archiveFiles | Select-Object -Skip 2
    foreach ($file in $filesToRemove) {
        Remove-Item $file.FullName
        Write-Host "🗑️  Removed old version: $($file.Name)" -ForegroundColor Red
    }
}

# Step 3: Update desktop package.json version
Write-Host "📝 Updating desktop package.json version..." -ForegroundColor Yellow
$packageJsonPath = "desktop/package.json"
$packageJson = Get-Content $packageJsonPath | ConvertFrom-Json
$packageJson.version = $NewVersion
$packageJson | ConvertTo-Json -Depth 100 | Set-Content $packageJsonPath
Write-Host "✅ Updated desktop package.json to v$NewVersion" -ForegroundColor Green

# Step 4: Build new installer
Write-Host "🔨 Building new installer..." -ForegroundColor Yellow
Set-Location "desktop"
npm run build
npm run dist
Set-Location ".."
Write-Host "✅ New installer built successfully" -ForegroundColor Green

# Step 5: Copy installer to downloads (for manual upload)
Write-Host "📋 Copying installer for deployment..." -ForegroundColor Yellow
$installerSource = "desktop/electron-dist/KRTJ-Desktop-Setup-$NewVersion.exe"
$installerDest = "public/downloads/KRTJ-Desktop-Setup.exe"
if (Test-Path $installerSource) {
    Copy-Item $installerSource $installerDest
    Write-Host "✅ Installer copied to public/downloads/" -ForegroundColor Green
} else {
    Write-Host "❌ Installer not found at $installerSource" -ForegroundColor Red
    exit 1
}

# Step 6: Get file size and checksum
Write-Host "🔍 Calculating file properties..." -ForegroundColor Yellow
$fileInfo = Get-Item $installerDest
$fileSizeMB = [math]::Round($fileInfo.Length / 1MB, 1)
$checksum = (Get-FileHash $installerDest -Algorithm SHA256).Hash

# Step 7: Update version.json
Write-Host "📄 Updating version.json..." -ForegroundColor Yellow
$newVersionData = @{
    version = $NewVersion
    releaseDate = (Get-Date).ToString("yyyy-MM-dd")
    downloadUrl = "/downloads/KRTJ-Desktop-Setup.exe"
    releaseNotes = @{
        title = $ReleaseTitle
        notes = $ReleaseNotes
    }
    minimumVersion = "1.0.0"
    isRequired = $false
    fileSize = "$fileSizeMB MB"
    checksum = $checksum
} | ConvertTo-Json -Depth 100

Set-Content $currentVersionFile $newVersionData
Write-Host "✅ Updated version.json with v$NewVersion details" -ForegroundColor Green

Write-Host ""
Write-Host "🎉 Release Process Complete!" -ForegroundColor Green
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host "   1. Upload installer: public/downloads/KRTJ-Desktop-Setup.exe to web hosting" -ForegroundColor White
Write-Host "   2. Commit and push changes: git add . && git commit -m 'Release v$NewVersion' && git push" -ForegroundColor White
Write-Host "   3. Deploy website to activate update notifications" -ForegroundColor White
Write-Host ""
Write-Host "📊 Release Summary:" -ForegroundColor Cyan
Write-Host "   Version: $NewVersion" -ForegroundColor White
Write-Host "   File Size: $fileSizeMB MB" -ForegroundColor White
Write-Host "   Checksum: $checksum" -ForegroundColor White