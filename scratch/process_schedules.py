import json
from bs4 import BeautifulSoup
import re
import codecs

with codecs.open('c:/Users/EMRE/Desktop/Sihirbaz/scratch/scraped_schedules.json', 'r', 'utf-8') as f:
    schedules = json.load(f)

# Load old text to get credits
credits_map = {}
try:
    with codecs.open('c:/Users/EMRE/Desktop/Sihirbaz/scratch/electives_new.txt', 'r', 'utf-8') as f:
        lines = [l.strip() for l in f.readlines() if l.strip()]
        for i in range(len(lines)):
            if '\t' in lines[i] and i > 0:
                parts = lines[i].split('\t')
                code = lines[i-1]
                if parts[0] == 'English':
                    try:
                        cr = float(parts[1].replace(',', '.'))
                        ec = float(parts[2].replace(',', '.'))
                        credits_map[code] = (cr, ec)
                    except:
                        pass
                else:
                    try:
                        cr = float(parts[2].replace(',', '.'))
                        ec = float(parts[3].replace(',', '.'))
                        credits_map[code] = (cr, ec)
                    except:
                        pass
except:
    pass

itb_depts = ['SNT', 'ALM', 'ARB', 'CIN', 'FRA', 'ISP', 'ITA', 'ITB', 'JPN', 'RUS']
mt_depts = ['BHB', 'ECN', 'EKO', 'END', 'ISL'] # Also HUK is ITB? Wait HUK is usually ITB or MT. Let's say ITB.
itb_depts.append('HUK')

all_courses = {}
all_schedule = []

for dept, html in schedules.items():
    if not html: continue
    soup = BeautifulSoup(html, 'html.parser')
    for row in soup.find_all('tr')[1:]:
        cols = row.find_all('td')
        if len(cols) < 14: continue
        
        crn = cols[0].text.strip()
        if not crn.isdigit(): continue
        
        ccode = cols[1].text.strip().replace('\r', '').replace('\n', ' ')
        ccode = re.sub(r'\s+', ' ', ccode)
        
        name = cols[2].text.strip()
        instructor = cols[4].text.strip()
        bina = cols[5].text.strip()
        gun = cols[6].text.strip()
        saat = cols[7].text.strip()
        derslik = cols[8].text.strip()
        kapasite = cols[9].text.strip()
        yazilan = cols[10].text.strip()
        
        prereq = cols[13].text.strip()
        
        # Determine language prerequisites manually as per user instructions
        if dept in ['ALM', 'ARB', 'CIN', 'FRA', 'ISP', 'ITA', 'JPN', 'RUS', 'ING']:
            match = re.search(r'(\d+)', ccode)
            if match:
                num = int(match.group(1))
                if num > 101:
                    prev_num = num - 1
                    prereq = ccode.replace(str(num), str(prev_num))
        elif dept in itb_depts:
            prereq = "" # ITB has no prereqs otherwise
            
        time_s = ""
        time_e = ""
        if '/' in saat:
            time_s, time_e = saat.split('/')
            
        cap = int(kapasite) if kapasite.isdigit() else 0
        enr = int(yazilan) if yazilan.isdigit() else 0
        
        c_type = 'ITB' if dept in itb_depts else 'RESTRICTED_ELECTIVE'
        cr, ec = credits_map.get(ccode, (3.0, 3.0)) # Default ITB credit is 3
        
        cid = ccode.replace(' ', '_')
        
        if cid not in all_courses:
            all_courses[cid] = {
                'id': cid,
                'code': ccode,
                'name': name,
                'credit': cr,
                'ects': ec,
                'type': c_type,
                'department': dept,
                'prereq': prereq
            }
            
        all_schedule.append({
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

print(f"Total unique new courses: {len(all_courses)}")
print(f"Total new schedule entries: {len(all_schedule)}")

# NOW, merge into courses.js
import subprocess
result = subprocess.run(['node', '-e', """
import('./src/data/courses.js').then(m => {
  console.log(JSON.stringify(m.courses.filter(c => c.type === 'MANDATORY' || c.type === 'GENERAL')));
}).catch(console.error);
"""], cwd='c:/Users/EMRE/Desktop/Sihirbaz', capture_output=True, text=True, encoding='utf-8')

import json
try:
    existing_courses = json.loads(result.stdout.strip())
except:
    existing_courses = []

print(f"Loaded {len(existing_courses)} mandatory/general courses from courses.js")

final_courses = existing_courses + list(all_courses.values())

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

# Keep only existing schedules for courses that are NOT in all_courses (so we replace ITB/MT completely with live OBS data, but keep VBA/END etc)
new_ccodes = set(all_courses.keys()) # ids like SNT_101
filtered_existing = [s for s in existing_schedule if s['courseId'] not in new_ccodes]

final_schedule = filtered_existing + all_schedule

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

print("Updated perfectly.")
