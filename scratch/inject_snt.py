import json, codecs

with open('c:/Users/EMRE/Desktop/Sihirbaz/snt_data.json', 'r', encoding='utf-8') as f:
    snt = json.load(f)

# 1. Update courses.js
with codecs.open('c:/Users/EMRE/Desktop/Sihirbaz/src/data/courses.js', 'r', 'utf-8') as f:
    c = f.read()

c = c.replace("'İTB Seçmeli'", "'ITB Seçmeli'")

insertIdx = c.rfind('];')
newCourses = ''
for crs in snt['courses']:
    if crs['id'] not in c:
        newCourses += f"  {{ id: '{crs['id']}', code: '{crs['code']}', name: '{crs['name'].replace(chr(39), chr(92)+chr(39))}', semester: 0, credit: {crs['credit']}, ects: {crs['ects']}, type: COURSE_TYPES.ITB, department: 'SNT', rawPrereq: '' }},\n"

c = c[:insertIdx] + newCourses + c[insertIdx:]
with codecs.open('c:/Users/EMRE/Desktop/Sihirbaz/src/data/courses.js', 'w', 'utf-8') as f:
    f.write(c)

# 2. Update schedule.js
with codecs.open('c:/Users/EMRE/Desktop/Sihirbaz/src/data/schedule.js', 'r', 'utf-8') as f:
    s = f.read()

sInsertIdx = s.rfind('];')
newSchedules = ''
for sch in snt['schedules']:
    if sch['crn'] not in s:
        newSchedules += f"  {{ crn: '{sch['crn']}', courseCode: '{sch['courseCode']}', courseId: '{sch['courseId']}', courseName: '{sch['courseName'].replace(chr(39), chr(92)+chr(39))}', day: '{sch['day']}', timeStart: '{sch['timeStart']}', timeEnd: '{sch['timeEnd']}', building: '{sch['building']}', classroom: '{sch['classroom']}', instructor: '{sch['instructor'].replace(chr(39), chr(92)+chr(39))}', capacity: {sch['capacity']}, enrolled: {sch['enrolled']} }},\n"

s = s[:sInsertIdx] + newSchedules + s[sInsertIdx:]
with codecs.open('c:/Users/EMRE/Desktop/Sihirbaz/src/data/schedule.js', 'w', 'utf-8') as f:
    f.write(s)

print("Courses and schedules updated.")
