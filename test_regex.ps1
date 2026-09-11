$json = Get-Content assets/data/daily-tips.json -Encoding UTF8 | ConvertFrom-Json
$count = 0
foreach ($p in $json.psobject.properties) {
    $val = $p.value
    if ($val.tip1 -and $val.tip1.Trim().EndsWith("משימה יומית של החג:")) {
        if ($val.tip2High -match "(.*?) 5 \. 6 \. \] ליסודי (.*?) 7 \. 8 \. (💡 טיפ החג: .*?) 9 \.") {
            Write-Host "Matched: "
            $count++
        } else {
            Write-Host "Unmatched format for : "
        }
    }
}
Write-Host "Total matched: $count"
