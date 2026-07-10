$activeHolidays = @(
    '2026-09-11', '2026-09-13',
    '2026-09-20', '2026-09-21', '2026-09-22', '2026-09-23', '2026-09-24', '2026-09-25', '2026-09-27', '2026-09-28', '2026-09-29', '2026-09-30', '2026-10-01', '2026-10-02',
    '2026-12-06', '2026-12-07', '2026-12-08', '2026-12-09', '2026-12-10', '2026-12-11',
    '2027-03-23', '2027-03-24',
    '2027-04-13', '2027-04-14', '2027-04-15', '2027-04-16', '2027-04-18', '2027-04-19', '2027-04-20', '2027-04-21', '2027-04-22', '2027-04-23', '2027-04-25', '2027-04-26', '2027-04-27', '2027-04-28',
    '2027-05-12',
    '2027-06-10', '2027-06-11'
)

function Get-NetDays ($targetDateStr, $schoolType, $studyFriday) {
    $now = Get-Date '2026-07-06T16:00:00'
    $current = $now.Date.AddDays(1)
    $target = (Get-Date $targetDateStr).Date
    $count = 0

    while ($current -lt $target) {
        $dStr = $current.ToString('yyyy-MM-dd')
        
        $isSummerDay = $false
        if ($schoolType -eq 'elem') {
            if ($current.Month -eq 7 -or $current.Month -eq 8) { $isSummerDay = $true }
        } else {
            if (($current.Month -eq 6 -and $current.Day -ge 21) -or $current.Month -eq 7 -or $current.Month -eq 8) { $isSummerDay = $true }
        }

        if ($isSummerDay) {
            $current = $current.AddDays(1)
            continue
        }

        $isFridayStudy = $studyFriday
        if ($current.DayOfWeek -ne 'Saturday' -and ($current.DayOfWeek -ne 'Friday' -or $isFridayStudy) -and $activeHolidays -notcontains $dStr) {
            $count++
        }
        $current = $current.AddDays(1)
    }
    return $count
}

Write-Host "Elem, 5-days, Rosh Hashanah: " (Get-NetDays '2026-09-11' 'elem' $false)
Write-Host "Elem, 6-days, Rosh Hashanah: " (Get-NetDays '2026-09-11' 'elem' $true)
Write-Host "Elem, 5-days, Summer 2027: " (Get-NetDays '2027-07-01' 'elem' $false)
Write-Host "Elem, 6-days, Summer 2027: " (Get-NetDays '2027-07-01' 'elem' $true)
Write-Host "High, 5-days, Summer 2027: " (Get-NetDays '2027-06-21' 'high' $false)
Write-Host "High, 6-days, Summer 2027: " (Get-NetDays '2027-06-21' 'high' $true)
