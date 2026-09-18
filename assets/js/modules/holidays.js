let activeHolidays = ['2026-04-22', '2026-05-05', '2026-05-21', '2026-05-22'];

const holidays2027 = [
    '2026-09-11', '2026-09-13', // ראש השנה
    '2026-09-20', '2026-09-21', '2026-09-22', '2026-09-23', '2026-09-24', '2026-09-25', '2026-09-27', '2026-09-28', '2026-09-29', '2026-09-30', '2026-10-01', '2026-10-02', // כיפור וסוכות
    '2026-12-06', '2026-12-07', '2026-12-08', '2026-12-09', '2026-12-10', '2026-12-11', // חנוכה
    '2027-03-23', '2027-03-24', // פורים
    '2027-04-13', '2027-04-14', '2027-04-15', '2027-04-16', '2027-04-18', '2027-04-19', '2027-04-20', '2027-04-21', '2027-04-22', '2027-04-23', '2027-04-25', '2027-04-26', '2027-04-27', '2027-04-28', // פסח
    '2027-05-12', // יום העצמאות; ל"ג בעומר הוא יום לימודים
    '2027-06-10', '2027-06-11' // שבועות
];

const targets2027 = [
    { id: 'roshHashana2026', name: 'ראש השנה', date: new Date('2026-09-11T08:15:00'), icon: '🍯', bg: '#fef3c7', lengthText: '<b>שלושה ימים</b> כולל שישי-שבת' },
    { id: 'kippurSukkot2026', name: 'כיפור וסוכות', date: new Date('2026-09-20T08:15:00'), icon: '🛖', bg: '#ecfdf5', lengthText: '<b>שבועיים רצופים!</b>' },
    { id: 'hanukkah2026', name: 'חנוכה', date: new Date('2026-12-06T08:15:00'), icon: '🍩', bg: '#eff6ff', lengthText: '<b>שבוע שלם</b>' },
    { id: 'purim2027', name: 'פורים', date: new Date('2027-03-23T08:15:00'), icon: '🎭', bg: '#fdf4ff', lengthText: '<b>יומיים</b> מטורפים' },
    { id: 'pesach2027', name: 'פסח', date: new Date('2027-04-13T08:15:00'), icon: '🍷', bg: '#fff7ed', lengthText: '<b>16 ימים!</b>' },
    { id: 'atzmaut2027', name: 'יום העצמאות', date: new Date('2027-05-12T08:15:00'), icon: '🇮🇱', bg: '#f0f9ff', lengthText: '<b>יום אחד</b>' },
    { id: 'lagbaomer', name: 'ל"ג בעומר', date: new Date('2027-05-25T08:15:00'), icon: '🔥', bg: '#fff7ed', isSchoolDay: true },
    { id: 'shavuot2027', name: 'שבועות', date: new Date('2027-06-10T08:15:00'), icon: '🧀', bg: '#f0fdf4', lengthText: '<b>שלושה ימים</b> כולל שישי-שבת' },
    { id: 'summerHigh2027', name: 'החופש הגדול', date: new Date('2027-06-21T08:15:00'), isSummer: true, type: 'high', icon: '🏖️', bg: '#fefce8' },
    { id: 'summerElem2027', name: 'החופש הגדול', date: new Date('2027-07-01T08:15:00'), isSummer: true, type: 'elem', icon: '🍉', bg: '#fefce8' }
];

const allTargets = [
    { id: 'atzmaut', name: 'יום העצמאות', date: new Date('2026-04-22T08:15:00'), icon: '🇮🇱', bg: '#f0f9ff', lengthText: '<b>יום אחד</b>' },
    { id: 'lagbaomer', name: 'ל"ג בעומר', date: new Date('2026-05-05T08:15:00'), icon: '🔥', bg: '#fff7ed', lengthText: '<b>יום אחד</b>' },
    { id: 'shavuot', name: 'שבועות', date: new Date('2026-05-21T08:15:00'), icon: '🧀', bg: '#f0fdf4', lengthText: '<b>שלושה ימים</b> כולל שישי-שבת' },
    { id: 'summerHigh', name: 'החופש הגדול', date: new Date('2026-06-19T08:15:00'), isSummer: true, type: 'high', icon: '🏖️', bg: '#fefce8' },
    { id: 'summerMiddlePrep', name: 'מכינת קיץ', date: new Date('2026-07-01T08:15:00'), type: 'middle', icon: '🤖', bg: '#eff6ff', noFriday: true, description: 'לכיתות ז\'-ט\' (לא חובה). לומדים עד ה-30.6', lengthText: '<b>62 ימים</b>' },
    { id: 'summerElemLow', name: 'ביה"ס של החופש הגדול (א\'-ג\')', date: new Date('2026-07-31T08:15:00'), type: 'elem', icon: '🎒', bg: '#fdf4ff', description: 'לומדים עד ה-30.7 (לא חובה)', noFriday: true, lengthText: '<b>32 ימים</b>' },
    { id: 'summerElem', name: 'החופש הגדול', date: new Date('2026-07-01T08:15:00'), isSummer: true, type: 'elem', icon: '🍉', bg: '#fefce8' }
];
