$path = 'assets/data/daily-tips.json'
$jsonString = Get-Content $path -Raw -Encoding UTF8
$json = ConvertFrom-Json $jsonString -AsHashtable

foreach ($key in $json.Keys.Clone()) {
    $val = $json[$key]
    if ($val.Contains("tip1") -and $val["tip1"].Trim().EndsWith("משימה יומית של החג:")) {
        if ($val.Contains("tip2High") -and $val["tip2High"] -match "(.*?) 5 \. 6 \. \] ליסודי (.*?) 7 \. 8 \. (💡 טיפ החג: .*?) 9 \.") {
            $highTask = $val["tip1"] + " " + $matches[1].Trim()
            $elemTask = $val["tip1"] + " " + $matches[2].Trim()
            $tip = $matches[3].Trim()

            $val["tip1High"] = $highTask
            $val["tip1Elem"] = $elemTask
            $val["tip2"] = $tip

            $val.Remove("tip2High")
            $val.Remove("tip2Elem")
        }
    }
}

$json | ConvertTo-Json -Depth 10 | Set-Content $path -Encoding UTF8
