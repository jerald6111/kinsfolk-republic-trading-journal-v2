# Fix emoji encoding issues
$files = @(
    "src\pages\VisionBoard.tsx",
    "src\pages\Journal.tsx",
    "src\pages\Charts.tsx"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw -Encoding UTF8
        
        # Replace corrupted emojis with proper ones
        $content = $content `
            -replace 'ðŸŽ‰', '🎉' `
            -replace 'ðŸ†', '🏆' `
            -replace 'â­', '⭐' `
            -replace 'ðŸ'ª', '💪' `
            -replace 'ðŸš€', '🚀' `
            -replace 'ðŸŽ¯', '🎯' `
            -replace 'âœï¸', '✏️' `
            -replace 'âž•', '➕' `
            -replace 'ðŸ"', '📝' `
            -replace 'ðŸ'°', '💰' `
            -replace 'ðŸ"…', '📅' `
            -replace 'ðŸ'¾', '💾' `
            -replace 'âœ¨', '✨' `
            -replace 'âœ"', '✓' `
            -replace 'ðŸ"Š', '📊' `
            -replace 'ðŸ"ˆ', '📈'
        
        Set-Content $file -Value $content -Encoding UTF8 -NoNewline
        Write-Host "Fixed emojis in $file"
    }
}

Write-Host "Done fixing emojis!"
