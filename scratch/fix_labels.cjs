const fs = require('fs');
let s = fs.readFileSync('c:/Users/EMRE/Desktop/Sihirbaz/src/data/courses.js', 'utf8');

const replacement = `export const COURSE_TYPE_LABELS = {
  [COURSE_TYPES.MANDATORY]: 'Zorunlu',
  [COURSE_TYPES.RESTRICTED_ELECTIVE]: 'Sınırlı Seçmeli (MT)',
  [COURSE_TYPES.ELECTIVE]: 'Seçmeli (MT)',
  [COURSE_TYPES.ITB]: 'ITB Seçmeli',
  [COURSE_TYPES.GENERAL]: 'Genel'
};`;

s = s.replace(/export const COURSE_TYPE_LABELS = \{\s*\[COURSE_TYPES\.MANDATORY\]: 'Zorunlu',\s*\[COURSE_TYPES\.RESTRICTED_ELECTIVE\]: 'Sınırlı Seçmeli \(MT\)',/, replacement + '\n\n');

fs.writeFileSync('c:/Users/EMRE/Desktop/Sihirbaz/src/data/courses.js', s);
console.log('Fixed COURSE_TYPE_LABELS');
