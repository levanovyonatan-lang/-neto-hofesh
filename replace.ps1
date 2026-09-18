$content = Get-Content index.html -Raw -Encoding UTF8
$content = $content -replace 'placeholder="הכנס שם כאן..."', 'placeholder="הכנס שם כאן... (מומלץ עם אימוג''י)"'
Set-Content index.html -Value $content -Encoding UTF8
Write-Output "Done"
