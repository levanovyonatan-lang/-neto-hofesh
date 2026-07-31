# build_seo_pages.ps1 - 100% ASCII script reading UTF-8 JSON and generating rich SEO landing pages
$ErrorActionPreference = "Stop"

$baseDir = $PSScriptRoot
if (-not $baseDir) { $baseDir = Get-Location }

$indexFile = Join-Path $baseDir "index.html"
$jsonFile = Join-Path $baseDir "holidays_seo.json"

$baseHtml = [System.IO.File]::ReadAllText($indexFile, [System.Text.Encoding]::UTF8)
$jsonText = [System.IO.File]::ReadAllText($jsonFile, [System.Text.Encoding]::UTF8)
$data = ConvertFrom-Json $jsonText
$labels = $data.labels
$holidays = $data.holidays

Write-Host "Building 10 SEO Holiday Landing Pages with Rich On-Page Content & Silo Hub..." -ForegroundColor Cyan

foreach ($holiday in $holidays) {
    $dir = Join-Path $baseDir $holiday.slug
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir | Out-Null
    }

    $html = $baseHtml


    # 2. Replace Title, Description, Keywords, Canonical URL
    $html = [System.Text.RegularExpressions.Regex]::Replace($html, '<title>.*?</title>', "<title>$($holiday.title)</title>", [System.Text.RegularExpressions.RegexOptions]::Singleline)
    $html = [System.Text.RegularExpressions.Regex]::Replace($html, '<meta name="description"\s+content=".*?">', "<meta name=`"description`" content=`"$($holiday.desc)`">", [System.Text.RegularExpressions.RegexOptions]::Singleline)
    $html = [System.Text.RegularExpressions.Regex]::Replace($html, '<meta name="keywords"\s+content=".*?">', "<meta name=`"keywords`" content=`"$($holiday.keywords)`">", [System.Text.RegularExpressions.RegexOptions]::Singleline)
    $html = [System.Text.RegularExpressions.Regex]::Replace($html, '<link rel="canonical" href=".*?">', "<link rel=`"canonical`" href=`"https://www.neto-hofesh.co.il/$($holiday.slug)/`">")

    # 3. Build JSON-LD FAQ items and FAQ Accordion HTML
    $faqJsonArray = @()
    $faqHtmlItems = @()
    foreach ($pair in $holiday.faqs) {
        $q = $pair[0]
        $a = $pair[1]
        $faqJsonArray += "            {
                `"@type`": `"Question`",
                `"name`": `"$q`",
                `"acceptedAnswer`": {
                    `"@type`": `"Answer`",
                    `"text`": `"$a`"
                }
            }"

        $faqHtmlItems += "                    <details class=`"seo-faq-item`">
                        <summary>$q</summary>
                        <div class=`"seo-faq-answer`">$a</div>
                    </details>"
    }
    $faqsJoined = $faqJsonArray -join ",`r`n"
    $faqAccordionHtml = $faqHtmlItems -join "`r`n"

    # 4. Build Article Paragraphs HTML
    $articleIntroHtml = @()
    foreach ($p in $holiday.articleIntro) {
        $articleIntroHtml += "                    <p style=`"margin-bottom: 14px; font-size: calc(16px * var(--text-scale, 1)); line-height: 1.7; color: var(--text-main); font-weight: 600;`">$p</p>"
    }
    $introHtmlJoined = $articleIntroHtml -join "`r`n"

    # 5. OpenGraph, Twitter Cards, Preselected Holiday JS, and JSON-LD Rich Snippet Schemas
    $ogAndSchema = @"
    <!-- Open Graph & Social Cards -->
    <meta property="og:title" content="$($holiday.title)">
    <meta property="og:description" content="$($holiday.desc)">
    <meta property="og:url" content="https://www.neto-hofesh.co.il/$($holiday.slug)/">
    <meta property="og:image" content="https://www.neto-hofesh.co.il/icon-neto-sunglasses-white.png">
    <meta property="og:type" content="website">
    <meta property="og:locale" content="he_IL">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="$($holiday.title)">
    <meta name="twitter:description" content="$($holiday.desc)">
    <meta name="twitter:image" content="https://www.neto-hofesh.co.il/icon-neto-sunglasses-white.png">

    <!-- Preselect Active Holiday in JS -->
    <script>
        window.NETO_ACTIVE_HOLIDAY = "$($holiday.targetId)";
        window.NETO_ACTIVE_HOLIDAY_SLUG = "$($holiday.slug)";
        window.NETO_HOLIDAY_NAME = "$($holiday.name)";
    </script>

    <!-- JSON-LD FAQPage & Event Schema for Rich Snippets -->
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "FAQPage",
                "mainEntity": [
$faqsJoined
                ]
            },
            {
                "@type": "Event",
                "name": "$($holiday.eventName)",
                "startDate": "$($holiday.date)",
                "location": {
                    "@type": "Place",
                    "name": "$($holiday.eventLocation)",
                    "address": {
                        "@type": "PostalAddress",
                        "addressCountry": "IL"
                    }
                },
                "description": "$($holiday.desc)"
            }
        ]
    }
    </script>
</head>
"@

    $html = $html -replace '</head>', $ogAndSchema

    # 6. Inject Holiday Hero Badge at top of <main class="app-container">
    $heroBadgeHtml = @"
    <main class="app-container">
        <div class="holiday-seo-hero-badge">
            <span>$($holiday.icon)</span>
            <span>$($holiday.heroBadgeText)</span>
        </div>
"@
    $html = $html -replace '<main class="app-container">', $heroBadgeHtml

    # 7. Build Rich SEO Holiday Content Section (replaces generic seo-footer)
    $holidaySeoSection = @"
            <!-- Dedicated Holiday SEO Landing Content -->
            <section class="holiday-seo-content-box">
                <h1 style="font-size: clamp(22px, 4vw, calc(28px * var(--text-scale, 1))); font-weight: 900; color: var(--text-main); margin-bottom: 12px; line-height: 1.3;">
                    $($holiday.icon) $($holiday.articleTitle)
                </h1>

                <!-- Holiday Quick Facts -->
                <div class="holiday-quick-facts-grid">
                    <div class="holiday-quick-fact-card">
                        <span class="holiday-quick-fact-title">$($labels.datesTitle)</span>
                        <span class="holiday-quick-fact-val">$($holiday.vacationDatesText)</span>
                    </div>
                    <div class="holiday-quick-fact-card">
                        <span class="holiday-quick-fact-title">$($labels.daysTitle)</span>
                        <span class="holiday-quick-fact-val">$($holiday.totalVacationDays)</span>
                    </div>
                    <div class="holiday-quick-fact-card">
                        <span class="holiday-quick-fact-title">$($labels.returnTitle)</span>
                        <span class="holiday-quick-fact-val">$($holiday.returnToSchoolText)</span>
                    </div>
                    <div class="holiday-quick-fact-card" style="background: #fffbeb; border-color: #fde047;">
                        <span class="holiday-quick-fact-title" style="color: #b45309;">$($labels.tipTitle)</span>
                        <span class="holiday-quick-fact-val" style="color: #92400e; font-size: calc(14px * var(--text-scale, 1));">$($holiday.holidayTip)</span>
                    </div>
                </div>

                <!-- Article Content -->
                <article style="margin-bottom: 25px;">
$introHtmlJoined
                </article>

                <!-- Interactive FAQ Accordion -->
                <section style="margin-bottom: 30px;">
                    <h2 style="font-size: calc(20px * var(--text-scale, 1)); font-weight: 900; color: var(--text-main); margin-bottom: 12px;">
                        $($labels.faqTitle) $($holiday.name)
                    </h2>
                    <div class="seo-faq-accordion">
$faqAccordionHtml
                    </div>
                </section>
            </section>
"@

    $html = [System.Text.RegularExpressions.Regex]::Replace($html, '<footer class="seo-footer">.*?</footer>', $holidaySeoSection, [System.Text.RegularExpressions.RegexOptions]::Singleline)

    # 7.5 Replace setup screen demo buttons with ONE large yellow button specific to THIS holiday
    $customButtonHtml = @"
            <!-- DEMO_BUTTONS_START -->
            <div id="demo-action-buttons" class="demo-action-buttons-container">
                <h3 class="demo-buttons-title" style="font-size: calc(18px * var(--text-scale, 1)); font-weight: 800; color: #475569; margin-bottom: 14px;">התחל ספירה עד:</h3>
                <div class="demo-buttons-row" style="display: flex; justify-content: center; width: 100%;">
                    <button id="btn-demo-holiday" class="btn-demo-summer" style="width: 100%; max-width: 340px; font-size: calc(22px * var(--text-scale, 1)); padding: 18px 28px; border-radius: 22px; box-shadow: 0 12px 28px rgba(234, 179, 8, 0.4); font-weight: 900; background: linear-gradient(135deg, #facc15 0%, #eab308 100%); color: #0f172a; border: 3px solid #fef08a; cursor: pointer; transition: all 0.2s ease-out; letter-spacing: -0.5px;" onclick="initApp('$($holiday.targetId)')">
                        $($holiday.icon) $($holiday.name) $($holiday.icon)
                    </button>
                </div>
            </div>
            <!-- DEMO_BUTTONS_END -->
"@
    $html = [System.Text.RegularExpressions.Regex]::Replace($html, '<!-- DEMO_BUTTONS_START -->.*?<!-- DEMO_BUTTONS_END -->', $customButtonHtml, [System.Text.RegularExpressions.RegexOptions]::Singleline)

    # 8. Convert Relative Paths for Subdirectories
    $html = $html.Replace('href="official-sun-neto-transparent.png', 'href="../official-sun-neto-transparent.png')
    $html = $html.Replace('href="icon-neto-sunglasses-white.png', 'href="../icon-neto-sunglasses-white.png')
    $html = $html.Replace('href="manifest.json', 'href="../manifest.json')
    $html = $html.Replace('href="assets/', 'href="../assets/')
    $html = $html.Replace('src="assets/', 'src="../assets/')
    $html = $html.Replace('src="tips.js"', 'src="../tips.js"')
    $html = $html.Replace('src="avigail-camp.html"', 'src="../avigail-camp.html"')

    # Fix relative links in the home hub grid if needed (safe regex without doubling ../)
    $html = [System.Text.RegularExpressions.Regex]::Replace($html, 'href="(?:\.\./)?(hanukkah|taanit-esther|purim|pesach|asru-chag|atzmaut|lag-baomer|shavuot|summer-high|summer)/"', 'href="../$1/"')

    $outPath = Join-Path $dir "index.html"
    [System.IO.File]::WriteAllText($outPath, $html, [System.Text.Encoding]::UTF8)
    Write-Host " -> Created: /$($holiday.slug)/index.html ($($holiday.name))" -ForegroundColor Green
}

# 9. Generate sitemap.xml
$today = Get-Date -Format "yyyy-MM-dd"
$urls = @(
    "    <url>
        <loc>https://www.neto-hofesh.co.il/</loc>
        <lastmod>$today</lastmod>
        <changefreq>daily</changefreq>
        <priority>1.0</priority>
    </url>"
)

foreach ($holiday in $holidays) {
    $urls += "    <url>
        <loc>https://www.neto-hofesh.co.il/$($holiday.slug)/</loc>
        <lastmod>$today</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.9</priority>
    </url>"
}

$sitemapXml = @"
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
$($urls -join "`r`n")
</urlset>
"@

$sitemapPath = Join-Path $baseDir "sitemap.xml"
[System.IO.File]::WriteAllText($sitemapPath, $sitemapXml, [System.Text.Encoding]::UTF8)
Write-Host " -> Created: /sitemap.xml (11 URLs)" -ForegroundColor Yellow
Write-Host "SEO Pages & Sitemap build completed successfully!" -ForegroundColor Cyan
