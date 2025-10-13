# KRTJ Installer Cleanup Script
# Run this script to clean up old installers and keep only the last 2 versions

Write-Host "🧹 KRTJ Installer Cleanup - Keep Last 2 Versions" -ForegroundColor Cyan

# Clean old installer files (keep last 2 versions)
$installerFiles = Get-ChildItem "public/downloads/KRTJ-Desktop-Setup-*.exe" | Sort-Object Name -Descending
Write-Host "📦 Found $($installerFiles.Count) installer files" -ForegroundColor Yellow

if ($installerFiles.Count -gt 2) {
    $filesToKeep = $installerFiles | Select-Object -First 2
    $filesToRemove = $installerFiles | Select-Object -Skip 2
    
    Write-Host "✅ Keeping:" -ForegroundColor Green
    foreach ($file in $filesToKeep) {
        Write-Host "  - $($file.Name)" -ForegroundColor White
    }
    
    Write-Host "🗑️  Removing:" -ForegroundColor Red
    foreach ($file in $filesToRemove) {
        Remove-Item $file.FullName
        Write-Host "  - $($file.Name)" -ForegroundColor White
    }
    
    Write-Host "📊 Cleanup Summary:" -ForegroundColor Cyan
    Write-Host "  Kept: $($filesToKeep.Count) files" -ForegroundColor Green
    Write-Host "  Removed: $($filesToRemove.Count) files" -ForegroundColor Red
    
    # Calculate space saved
    $spaceSaved = ($filesToRemove | Measure-Object -Property Length -Sum).Sum
    $spaceSavedMB = [math]::Round($spaceSaved / 1MB, 1)
    Write-Host "  Space saved: $spaceSavedMB MB" -ForegroundColor Yellow
} else {
    Write-Host "✅ No cleanup needed - only $($installerFiles.Count) files present" -ForegroundColor Green
}

# Also clean old archive files (keep last 2)
$archiveFiles = Get-ChildItem "public/downloads/archive/version-*.json" | Sort-Object Name -Descending
if ($archiveFiles.Count -gt 2) {
    $archiveToRemove = $archiveFiles | Select-Object -Skip 2
    foreach ($file in $archiveToRemove) {
        Remove-Item $file.FullName
        Write-Host "🗑️  Removed old archive: $($file.Name)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "🎉 Cleanup complete! Repository is optimized." -ForegroundColor Green
Write-Host "💡 Remember to commit and push the changes: git add . && git commit -m 'Cleanup old installer versions' && git push" -ForegroundColor Cyan