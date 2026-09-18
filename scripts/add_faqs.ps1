$jsonText = [System.IO.File]::ReadAllText('holidays_seo.json', [System.Text.Encoding]::UTF8)
$data = ConvertFrom-Json $jsonText

foreach ($holiday in $data.holidays) {
    if ($holiday.slug -eq 'summer' -or $holiday.slug -eq 'summer-high') {
        $newFaq1 = [object[]]@('מתי נגמר החופש הגדול ומתי חוזרים ללימודים?', 'החופש הגדול מסתיים רשמית ב-31 באוגוסט, והתלמידים חוזרים ללימודים לפתיחת שנת הלימודים החדשה ב-1 בספטמבר.')
        $newFaq2 = [object[]]@('עוד כמה זמן חוזרים ללימודים? עוד כמה ימים חוזרים לבית ספר?', 'גם במהלך הקיץ תוכלו להתעדכן במחשבון ולראות בדיוק עוד כמה ימים נשארו לחופש עד שחוזרים לבית ספר.')
        
        $faqsList = [System.Collections.ArrayList]::new($holiday.faqs)
        $faqsList.Add($newFaq1) | Out-Null
        $faqsList.Add($newFaq2) | Out-Null
        
        $holiday.faqs = $faqsList.ToArray()
    }
}

$newJson = $data | ConvertTo-Json -Depth 10 -Compress:$false
[System.IO.File]::WriteAllText('holidays_seo.json', $newJson, [System.Text.Encoding]::UTF8)
Write-Host 'Done'
