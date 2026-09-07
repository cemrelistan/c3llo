import json
import re

with open('src/data/courses.js', encoding='utf-8') as f:
    courses_js = f.read()

courses_codes = re.findall(r"code:\s*'([^']+)'", courses_js)

with open('scratch/input.txt', encoding='utf-8') as f:
    lines = f.readlines()

entries = []
for line in lines[1:]:
    line = line.strip()
    if not line: continue
    parts = line.split('\t')
    if len(parts) < 11: continue
    crn = parts[0]
    ders_kodu = parts[1]
    
    if ders_kodu not in courses_codes:
        continue
        
    ders_adi = parts[2]
    gun = parts[6]
    saat = parts[7]
    bina = parts[5]
    derslik = parts[8]
    hoca = parts[4]
    kontenjan = parts[9]
    yazilan = parts[10]
    
    if '/' in saat:
        ts, te = saat.split('/')
    else:
        ts = saat
        te = saat
    
    course_id = ders_kodu.replace(' ', '_')
    ders_adi = ders_adi.replace("'", "\\'")
    
    obj = f"  {{ crn: '{crn}', courseCode: '{ders_kodu}', courseId: '{course_id}', courseName: '{ders_adi}', day: '{gun}', timeStart: '{ts}', timeEnd: '{te}', building: '{bina}', classroom: '{derslik}', instructor: '{hoca}', capacity: {kontenjan}, enrolled: {yazilan} }},"
    entries.append(obj)

with open('src/data/schedule.js', encoding='utf-8') as f:
    sched = f.read()

last_bracket = sched.rfind(']')
if last_bracket != -1:
    new_sched = sched[:last_bracket]
    if not new_sched.endswith('\n'):
        new_sched += '\n'
    new_sched += "\n".join(entries) + "\n" + sched[last_bracket:]
    with open('src/data/schedule.js', 'w', encoding='utf-8') as f:
        f.write(new_sched)
    print(f"Added {len(entries)} courses.")
else:
    print("Could not find ] in schedule.js")
