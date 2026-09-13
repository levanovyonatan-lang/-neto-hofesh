$bytes = [System.IO.File]::ReadAllBytes("index.html")
if ($bytes[0] -ne 0xEF -or $bytes[1] -ne 0xBB -or $bytes[2] -ne 0xBF) {
    $bom = New-Object byte[] 3
    $bom[0] = 0xEF
    $bom[1] = 0xBB
    $bom[2] = 0xBF
    $newBytes = $bom + $bytes
    [System.IO.File]::WriteAllBytes("index.html", $newBytes)
}
