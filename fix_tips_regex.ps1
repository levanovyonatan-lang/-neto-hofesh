$content = Get-Content assets/data/daily-tips.json -Raw -Encoding UTF8
$pattern = '(?s)"tip1":\s*"([^"]*?משימה יומית של החג:)",\s*"tip2High":\s*"(.*?) 5 \. 6 \. \] ליסודי (.*?) 7 \. 8 \. (💡 טיפ החג: .*?) 9 \.",\s*"tip2Elem":\s*"([^"]*?)"'
$replacement = '"tip1High": "${1} ${2}",
    "tip1Elem": "${1} ${3}",
    "tip2": "${4}"'
$newContent = [regex]::Replace($content, $pattern, $replacement)
$newContent | Set-Content assets/data/daily-tips.json -Encoding UTF8
