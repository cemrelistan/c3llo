import re
import codecs
import time
import requests
import json
from bs4 import BeautifulSoup

# Read user provided electives
with codecs.open('c:/Users/EMRE/Desktop/Sihirbaz/scratch/electives_new.txt', 'r', 'utf-8') as f:
    text = f.read()

mt_part = text.split('Elective Course (ITB):')[0]
itb_part = text.split('Elective Course (ITB):')[1]

def extract_courses(part_text, course_type):
    courses = []
    lines = [l.strip() for l in part_text.split('\n') if l.strip()]
    i = 0
    while i < len(lines):
        # Look for a course code like BHB 202E
        match = re.match(r'^([A-Z]{3,4})\s(\d+[A-Z]?)$', lines[i])
        if match:
            code = lines[i]
            dept = match.group(1)
            # The next line contains the name, language, credits, etc. separated by tabs
            if i + 1 < len(lines):
                details = lines[i+1].split('\t')
                name = details[0]
                lang = details[1]
                credit = float(details[2].replace(',', '.'))
                ects = float(details[3].replace(',', '.'))
                courses.append({
                    'id': code.replace(' ', '_'),
                    'code': code,
                    'name': name,
                    'semester': 0, # Electives don't have a fixed semester, but we can set 0 or keep it empty
                    'credit': credit,
                    'ects': ects,
                    'type': course_type,
                    'department': dept
                })
                i += 1
        i += 1
    return courses

mt_courses = extract_courses(mt_part, 'RESTRICTED_ELECTIVE')
itb_courses = extract_courses(itb_part, 'ITB')
new_electives = mt_courses + itb_courses

# dept_ids from extract_all_data.py
dept_ids = {
    'BHB': '20', 'ECN': '40', 'EKO': '41', 'END': '46', 'FIZ': '52',
    'KIM': '85', 'MAT': '124', 'VBA': '306', 'ING': '71', 'TUR': '296',
    'ATA': '10', 'DAN': '29', 'ISL': '74', 'YON': '320', 'BLG': '21',
    'KON': '99', 'EEE': '42', 'EHB': '43', 'SNT': '284',
    'ALM': '4', 'ARB': '6', 'CIN': '24', 'FRA': '54', 'HUK': '66',
    'ISP': '73', 'ITA': '75', 'ITB': '76', 'JPN': '80', 'RUS': '277'
}

depts_needed = set(c['department'] for c in new_electives)
depts_needed.add('VBA') # We must keep VBA for mandatory courses

all_schedule = []
all_prereqs = {}

def parse_schedule_html(html):
    soup = BeautifulSoup(html, 'html.parser')
    schedules = []
    table = soup.find('table')
    if not table: return schedules
    
    for row in table.find_all('tr')[1:]:
        cols = row.find_all('td')
        if len(cols) >= 10:
            crn = cols[0].text.strip()
            ccode = cols[1].text.strip().replace('\r', '').replace('\n', ' ')
            ccode = re.sub(r'\s+', ' ', ccode)
            
            cname = cols[2].text.strip()
            instructor = cols[4].text.strip()
            bldg = cols[5].text.strip()
            day = cols[6].text.strip()
            time_str = cols[7].text.strip()
            classroom = cols[8].text.strip()
            cap = cols[9].text.strip()
            enr = cols[10].text.strip() if len(cols) > 10 else "0"
            
            try: cap = int(cap)
            except: cap = 0
            try: enr = int(enr)
            except: enr = 0
            
            t_start, t_end = "", ""
            if '/' in time_str:
                parts = time_str.split('/')
                t_start = parts[0].strip()
                t_end = parts[1].strip()
            
            schedules.append({
                'crn': crn, 'courseCode': ccode, 'name': cname,
                'instructor': instructor, 'building': bldg,
                'day': day, 'timeStart': t_start, 'timeEnd': t_end,
                'classroom': classroom, 'capacity': cap, 'enrolled': enr
            })
    return schedules

def parse_prerequisites(html):
    soup = BeautifulSoup(html, 'html.parser')
    prereqs = {}
    table = soup.find('table')
    if not table: return prereqs
    for row in table.find_all('tr')[1:]:
        cols = row.find_all('td')
        if len(cols) >= 3:
            code = cols[0].text.strip()
            p_text = cols[2].text.strip()
            p_text = re.sub(r'\s+', ' ', p_text)
            prereqs[code] = p_text
    return prereqs

for dept in depts_needed:
    did = dept_ids.get(dept)
    if not did:
        print(f"Unknown dept ID for {dept}")
        continue
    print(f"Fetching {dept}...")
    try:
        resp = requests.get("https://obs.itu.edu.tr/public/DersProgram/DersProgramSearch", 
                            params={'ProgramSeviyeTipiAnahtari': 'LS', 'dersBransKoduId': did}, timeout=15)
        if resp.status_code == 200:
            dept_sch = parse_schedule_html(resp.text)
            all_schedule.extend(dept_sch)
    except Exception as e:
        print(f"Error schedule {dept}: {e}")
        
    try:
        resp = requests.get("https://obs.itu.edu.tr/public/GenelTanimlamalar/OnsartAra", 
                            params={'DersBransKoduId': did}, timeout=15)
        if resp.status_code == 200:
            pr = parse_prerequisites(resp.text)
            all_prereqs.update(pr)
    except Exception as e:
        print(f"Error prereqs {dept}: {e}")
    time.sleep(0.5)

print("Fetched all data. Updating files safely...")

# UPDATE COURSES.JS safely
courses_js_path = 'c:/Users/EMRE/Desktop/Sihirbaz/src/data/courses.js'
with codecs.open(courses_js_path, 'r', 'utf-8') as f:
    courses_js = f.read()

# We need to extract the existing mandatory courses
# Find export const courses = [ ... ];
start_idx = courses_js.find('export const courses = [')
end_idx = courses_js.find('];', start_idx)
courses_str = courses_js[start_idx:end_idx+2]

# The cleanest way is to use Node to extract them, or we can just regex the mandatory ones
import subprocess
result = subprocess.run(['node', '-e', """
import('./src/data/courses.js').then(m => {
  console.log(JSON.stringify(m.courses.filter(c => c.type === 'mandatory' || c.type === 'general')));
}).catch(console.error);
"""], cwd='c:/Users/EMRE/Desktop/Sihirbaz', capture_output=True, text=True)

try:
    mandatory_courses = json.loads(result.stdout.strip())
except json.JSONDecodeError:
    print("Failed to load mandatory courses from node:", result.stdout)
    exit(1)

all_final_courses = mandatory_courses + new_electives

# Now rebuild the courses array string
new_courses_str = "export const courses = [\n"
for c in all_final_courses:
    safe_name = c['name'].replace("'", "\\'")
    
    # get rawPrereq
    if c['type'] == 'mandatory' or c['type'] == 'general':
        raw_p = c.get('rawPrereq', '')
    else:
        raw_p = all_prereqs.get(c['code'], "")
        if not raw_p and c['code'].endswith('E'):
            raw_p = all_prereqs.get(c['code'][:-1], "")
    
    safe_prereq = raw_p.replace("'", "\\'")
    # We map type back to COURSE_TYPES.*
    if c['type'] in ['RESTRICTED_ELECTIVE', 'ITB']:
        type_str = f"COURSE_TYPES.{c['type']}"
    else:
        tmap = {'mandatory': 'MANDATORY', 'general': 'GENERAL', 'restricted_elective': 'RESTRICTED_ELECTIVE', 'elective': 'ELECTIVE', 'itb': 'ITB'}
        type_str = f"COURSE_TYPES.{tmap[c['type']]}"
    
    new_courses_str += f"  {{ id: '{c['id']}', code: '{c['code']}', name: '{safe_name}', semester: {c.get('semester', 0)}, credit: {c['credit']}, ects: {c['ects']}, type: {type_str}, department: '{c['department']}', rawPrereq: '{safe_prereq}' }},\n"

new_courses_str += "];"

courses_js = courses_js[:start_idx] + new_courses_str + courses_js[end_idx+2:]

with codecs.open(courses_js_path, 'w', 'utf-8') as f:
    f.write(courses_js)

# UPDATE SCHEDULE.JS safely
schedule_js_path = 'c:/Users/EMRE/Desktop/Sihirbaz/src/data/schedule.js'
with codecs.open(schedule_js_path, 'r', 'utf-8') as f:
    schedule_js = f.read()

start_idx_s = schedule_js.find('export const scheduleData = [')
end_idx_s = schedule_js.find('];', start_idx_s)

import subprocess
result_s = subprocess.run(['node', '-e', """
import('./src/data/schedule.js').then(m => {
  console.log(JSON.stringify(m.scheduleData));
}).catch(console.error);
"""], cwd='c:/Users/EMRE/Desktop/Sihirbaz', capture_output=True, text=True)

try:
    existing_schedule = json.loads(result_s.stdout.strip())
except:
    existing_schedule = []

# Merge existing schedule with new schedule
existing_crns = set(s['crn'] for s in existing_schedule)
for s in all_schedule:
    if s['crn'] not in existing_crns:
        existing_schedule.append(s)

allowed_codes = set(c['code'] for c in all_final_courses)
final_schedule = [s for s in existing_schedule if s['courseCode'] in allowed_codes]

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
