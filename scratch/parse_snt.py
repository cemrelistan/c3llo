import json
import codecs

snt_courses = {}
snt_schedules = []

with codecs.open('c:/Users/EMRE/Desktop/Sihirbaz/scratch/snt_raw.txt', 'r', 'utf-8') as f:
    for line in f:
        line = line.strip()
        if not line: continue
        cols = line.split('\t')
        if len(cols) < 11: continue
        
        crn = cols[0].strip()
        ccode = cols[1].strip()
        name = cols[2].strip()
        instructor = cols[4].strip()
        bina = cols[5].strip()
        gun = cols[6].strip()
        saat = cols[7].strip()
        derslik = cols[8].strip()
        kapasite = cols[9].strip()
        yazilan = cols[10].strip()
        
        time_s = ""
        time_e = ""
        if '/' in saat:
            time_s, time_e = saat.split('/')
            
        cap = int(kapasite) if kapasite.isdigit() else 0
        enr = int(yazilan) if yazilan.isdigit() else 0
        
        cid = ccode.replace(' ', '_')
        
        if cid not in snt_courses:
            snt_courses[cid] = {
                'id': cid,
                'code': ccode,
                'name': name,
                'credit': 3.0,
                'ects': 4.0,
                'type': 'ITB',
                'department': 'SNT',
                'prereq': ''
            }
            
        snt_schedules.append({
            'crn': crn,
            'courseCode': ccode,
            'name': name,
            'day': gun,
            'timeStart': time_s,
            'timeEnd': time_e,
            'building': bina,
            'classroom': derslik,
            'instructor': instructor,
            'capacity': cap,
            'enrolled': enr
        })

# ADD to courses.js
import subprocess
result = subprocess.run(['node', '-e', """
import('./src/data/courses.js').then(m => {
  console.log(JSON.stringify(m.courses.filter(c => c.type !== 'ITB')));
}).catch(console.error);
"""], cwd='c:/Users/EMRE/Desktop/Sihirbaz', capture_output=True, text=True, encoding='utf-8')

try:
    existing_courses = json.loads(result.stdout.strip())
except:
    existing_courses = []

final_courses = existing_courses + list(snt_courses.values())

courses_js_path = 'c:/Users/EMRE/Desktop/Sihirbaz/src/data/courses.js'
with codecs.open(courses_js_path, 'r', 'utf-8') as f:
    courses_js = f.read()

start_idx = courses_js.find('export const courses = [')
end_idx = courses_js.find('];', start_idx)

new_courses_str = "export const courses = [\n"
for c in final_courses:
    safe_name = c['name'].replace("'", "\\'")
    safe_prereq = c.get('prereq', '').replace("'", "\\'")
    t_str = f"COURSE_TYPES.{c['type']}"
    new_courses_str += f"  {{ id: '{c['id']}', code: '{c['code']}', name: '{safe_name}', semester: {c.get('semester', 0)}, credit: {c['credit']}, ects: {c['ects']}, type: {t_str}, department: '{c['department']}', rawPrereq: '{safe_prereq}' }},\n"
new_courses_str += "];"

courses_js = courses_js[:start_idx] + new_courses_str + courses_js[end_idx+2:]

with codecs.open(courses_js_path, 'w', 'utf-8') as f:
    f.write(courses_js)

# Merge into schedule.js
result_s = subprocess.run(['node', '-e', """
import('./src/data/schedule.js').then(m => {
  console.log(JSON.stringify(m.scheduleData));
}).catch(console.error);
"""], cwd='c:/Users/EMRE/Desktop/Sihirbaz', capture_output=True, text=True, encoding='utf-8')

try:
    existing_schedule = json.loads(result_s.stdout.strip())
except:
    existing_schedule = []

# Filter out old ITB courses if needed, actually just keep everything that is not SNT
new_ccodes = set(snt_courses.keys())
filtered_existing = [s for s in existing_schedule if s['courseCode'] not in new_ccodes]

# wait, we removed ALL ITB courses from courses.js above?
# "m.courses.filter(c => c.type !== 'ITB')"
# If we do that, we lose ALM, JPN etc. if they were there. But they weren't, since they were never successfully added.

final_schedule = filtered_existing + snt_schedules

schedule_js_path = 'c:/Users/EMRE/Desktop/Sihirbaz/src/data/schedule.js'
with codecs.open(schedule_js_path, 'r', 'utf-8') as f:
    schedule_js = f.read()

start_idx_s = schedule_js.find('export const scheduleData = [')
end_idx_s = schedule_js.find('];', start_idx_s)

new_schedule_str = "export const scheduleData = [\n"
for s in final_schedule:
    safe_name = s.get('courseName', s.get('name', '')).replace("'", "\\'")
    safe_instructor = s['instructor'].replace("'", "\\'")
    course_id = s['courseCode'].replace(' ', '_')
    new_schedule_str += f"  {{ crn: '{s['crn']}', courseCode: '{s['courseCode']}', courseId: '{course_id}', courseName: '{safe_name}', day: '{s['day']}', timeStart: '{s['timeStart']}', timeEnd: '{s['timeEnd']}', building: '{s['building']}', classroom: '{s['classroom']}', instructor: '{safe_instructor}', capacity: {s['capacity']}, enrolled: {s['enrolled']} }},\n"
new_schedule_str += "];"

schedule_js = schedule_js[:start_idx_s] + new_schedule_str + schedule_js[end_idx_s+2:]

with codecs.open(schedule_js_path, 'w', 'utf-8') as f:
    f.write(schedule_js)

print("Updated perfectly for SNT.")
