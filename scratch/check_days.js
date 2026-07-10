
const holidays2027 = [
    '2026-09-11', '2026-09-13',
    '2026-09-20', '2026-09-21', '2026-09-22', '2026-09-23', '2026-09-24', '2026-09-25', '2026-09-27', '2026-09-28', '2026-09-29', '2026-09-30', '2026-10-01', '2026-10-02',
    '2026-12-06', '2026-12-07', '2026-12-08', '2026-12-09', '2026-12-10', '2026-12-11',
    '2027-03-23', '2027-03-24',
    '2027-04-13', '2027-04-14', '2027-04-15', '2027-04-16', '2027-04-18', '2027-04-19', '2027-04-20', '2027-04-21', '2027-04-22', '2027-04-23', '2027-04-25', '2027-04-26', '2027-04-27', '2027-04-28',
    '2027-05-12',
    '2027-06-10', '2027-06-11'
];

let count5Days = 0;
let count6Days = 0;

for (let d of holidays2027) {
    let date = new Date(d + 'T00:00:00Z');
    let day = date.getUTCDay(); // 0=Sun, 5=Fri, 6=Sat
    if (day !== 6) count6Days++; // Every day except Sat is counted in a 6-day week
    if (day !== 5 && day !== 6) count5Days++; // Every day except Fri and Sat is counted in a 5-day week
}
console.log('Vacation days during the year (5 days week): ' + count5Days);
console.log('Vacation days during the year (6 days week): ' + count6Days);

