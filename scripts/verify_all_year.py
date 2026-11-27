import json, datetime, sys

sys.stdout.reconfigure(encoding='utf-8')
data = json.load(open('assets/data/daily-tips.json', encoding='utf-8'))

print(f"Total entries in daily-tips.json: {len(data)}")

# Generate every day in a leap year (366 days)
start_date = datetime.date(2024, 1, 1)
calendar_days = [(start_date + datetime.timedelta(days=i)).strftime('%m-%d') for i in range(366)]

missing_in_calendar = []
issues = []

for day_str in calendar_days:
    if day_str not in data:
        # Check if 02-29 is missing (standard non-leap vs leap)
        missing_in_calendar.append(day_str)
        continue
    
    val = data[day_str]
    if not isinstance(val, dict):
        issues.append(f"{day_str}: Not a dict ({type(val)})")
        continue
    
    # Check Tip 1 for elem and high
    for school in ['elem', 'middle', 'high']:
        isHigh = school in ['middle', 'high']
        # Tip 1 logic from app.js:
        if isHigh and val.get('tip1High'):
            t1 = val['tip1High']
        elif not isHigh and val.get('tip1Elem'):
            t1 = val['tip1Elem']
        else:
            t1 = val.get('tip1') or val.get('missionHigh') or val.get('tipHigh') or ''
        
        # Tip 2 logic from app.js:
        if isHigh and val.get('tip2High'):
            t2 = val['tip2High']
        elif not isHigh and val.get('tip2Elem'):
            t2 = val['tip2Elem']
        else:
            t2 = val.get('tip2') or val.get('tip') or val.get('tipElem') or ''
        
        if not t1 or len(str(t1).strip()) < 5:
            issues.append(f"{day_str} ({school}): Tip 1 is empty or too short: '{t1}'")
        if not t2 or len(str(t2).strip()) < 5:
            issues.append(f"{day_str} ({school}): Tip 2 is empty or too short: '{t2}'")

print(f"\nMissing calendar dates: {missing_in_calendar}")
print(f"Total issues found across all days & school types: {len(issues)}")
if issues:
    print("Issues sample (up to 20):")
    for iss in issues[:20]:
        print(" -", iss)
else:
    print("ALL 365 DAYS HAVE PERFECT TIP 1 AND TIP 2 FOR ALL SCHOOL TYPES!")
