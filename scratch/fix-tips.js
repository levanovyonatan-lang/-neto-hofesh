const fs = require('fs');

const raw = fs.readFileSync('assets/data/daily-tips.json', 'utf8');
const data = JSON.parse(raw);

// Regex for the " 2 . [optional mission title]" part
const splitRegex = /\s*\d+\s*\.\s*(🎯\s*משימה יומית של החג:|משימה יומית של החג:|🎯\s*משימה יומית:|משימה יומית:|🎯\s*)?/g;

// Regex for trailing garbage like " 5 . 6 . ] ליסודי ..."
const trailingGarbageRegex = /\s*\d+\s*\.\s*(\d+\s*\.\s*)*(\]\s*ליסודי)?.*$/g;
const justGarbageRegex = /^\s*\d+\s*\.\s*$/;

let fixedCount = 0;

for (const key in data) {
    if (typeof data[key] === 'object') {
        const entry = data[key];
        
        // 1. Clean trailing garbage from ALL fields first
        for (const field in entry) {
            if (typeof entry[field] === 'string') {
                if (justGarbageRegex.test(entry[field])) {
                    // if it's purely "5 .", clear it
                    entry[field] = "";
                } else {
                    // remove trailing " 5 . 6 . ] ..."
                    const match = entry[field].match(/\s*\d+\s*\.\s*(?:\d+\s*\.\s*)*(?:\]\s*ליסודי)?.*$/);
                    // but wait! some valid tips might have numbers like " 5 . " if they are lists.
                    // Actually, ChatGPT left the list numbers. Let's be careful.
                    // Usually it's at the end of the text.
                    if (match && match.index > 10) {
                        entry[field] = entry[field].substring(0, match.index).trim();
                    }
                }
            }
        }
        
        // 2. Handle tip1 merged with tip2
        const tip1Fields = ['tip1', 'tip1High', 'tip1Elem'];
        for (const t1 of tip1Fields) {
            if (entry[t1]) {
                const parts = entry[t1].split(splitRegex);
                // splitRegex has capture groups, so it will return [part1, capture1, part2, ...]
                // If it split into multiple parts, part[0] is the tip, and part[2] is the mission
                if (parts.length > 1) {
                    const cleanTip1 = parts[0].trim();
                    const remainder = parts.slice(2).join('').trim();
                    
                    entry[t1] = cleanTip1;
                    
                    if (remainder.length > 2) {
                        // There is actual text for tip2 inside tip1!
                        const t2 = t1.replace('tip1', 'tip2');
                        if (!entry[t2] || entry[t2].trim() === "") {
                            // Assign it to tip2
                            // Prepend "🎯 משימה יומית של החג: " if not present?
                            let newTip2 = remainder;
                            if (!newTip2.includes('משימה')) {
                                newTip2 = "🎯 משימה יומית של החג: " + newTip2;
                            }
                            entry[t2] = newTip2;
                        }
                    }
                }
            }
        }
        
        // Clean up empty keys
        for (const field in entry) {
            if (entry[field] === "") {
                delete entry[field];
            }
        }
    }
}

fs.writeFileSync('scratch/daily-tips-test.json', JSON.stringify(data, null, 2), 'utf8');
console.log("Done");
