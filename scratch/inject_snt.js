const fs = require('fs');

const snt = JSON.parse(fs.readFileSync('c:/Users/EMRE/Desktop/Sihirbaz/snt_data.json', 'utf8'));

// 1. Update courses.js
let c = fs.readFileSync('c:/Users/EMRE/Desktop/Sihirbaz/src/data/courses.js', 'utf8');

// Change İTB to ITB in COURSE_TYPE_LABELS
c = c.replace(/'İTB Seçmeli'/g, "'ITB Seçmeli'");

// Inject courses
const insertIdx = c.lastIndexOf('];');
let newCourses = '';
snt.courses.forEach(crs => {
    // If it's not already in courses.js
    if (!c.includes(crs.id)) {
        newCourses += `  { id: '${crs.id}', code: '${crs.code}', name: '${crs.name.replace(/'/g, "\\'")}', semester: 0, credit: ${crs.credit}, ects: ${crs.ects}, type: COURSE_TYPES.ITB, department: 'SNT', rawPrereq: '' },\n`;
    }
});
c = c.slice(0, insertIdx) + newCourses + c.slice(insertIdx);

fs.writeFileSync('c:/Users/EMRE/Desktop/Sihirbaz/src/data/courses.js', c);

// 2. Update schedule.js
let s = fs.readFileSync('c:/Users/EMRE/Desktop/Sihirbaz/src/data/schedule.js', 'utf8');
const sInsertIdx = s.lastIndexOf('];');
let newSchedules = '';
snt.schedules.forEach(sch => {
    if (!s.includes(sch.crn)) {
        newSchedules += `  { crn: '${sch.crn}', courseCode: '${sch.courseCode}', courseId: '${sch.courseId}', courseName: '${sch.courseName.replace(/'/g, "\\'")}', day: '${sch.day}', timeStart: '${sch.timeStart}', timeEnd: '${sch.timeEnd}', building: '${sch.building}', classroom: '${sch.classroom}', instructor: '${sch.instructor.replace(/'/g, "\\'")}', capacity: ${sch.capacity}, enrolled: ${sch.enrolled} },\n`;
    }
});
s = s.slice(0, sInsertIdx) + newSchedules + s.slice(sInsertIdx);
fs.writeFileSync('c:/Users/EMRE/Desktop/Sihirbaz/src/data/schedule.js', s);

console.log('Courses and schedules updated.');
