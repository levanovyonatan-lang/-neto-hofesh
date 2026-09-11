$path = 'assets/data/daily-tips.json'
$jsonString = Get-Content $path -Raw -Encoding UTF8
$json = ConvertFrom-Json $jsonString

foreach ($p in $json.psobject.properties) {
    $val = $p.value
    if ($val.tip1 -and $val.tip1.Trim().EndsWith("משימה יומית של החג:")) {
        if ($val.tip2High -match "(.*?) 5 \. 6 \. \] ליסודי (.*?) 7 \. 8 \. (💡 טיפ החג: .*?) 9 \.") {
            $highTask = $val.tip1 + " " + $matches[1].Trim()
            $elemTask = $val.tip1 + " " + $matches[2].Trim()
            $tip = $matches[3].Trim()

            $val | Add-Member -MemberType NoteProperty -Name "tip1High" -Value $highTask -Force
            $val | Add-Member -MemberType NoteProperty -Name "tip1Elem" -Value $elemTask -Force
            $val | Add-Member -MemberType NoteProperty -Name "tip2" -Value $tip -Force

            $val.psobject.properties.Remove("tip2High")
            $val.psobject.properties.Remove("tip2Elem")
        }
    }
}

$json | ConvertTo-Json -Depth 10 | Set-Content $path -Encoding UTF8
