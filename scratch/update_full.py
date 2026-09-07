import json
import re
import os

transcript_path = r"C:\Users\EMRE\.gemini\antigravity\brain\603ca5e7-944a-4c6d-aa91-81bad99f128d\.system_generated\logs\transcript.jsonl"

user_text = ""
with open(transcript_path, 'r', encoding='utf-8') as f:
    for line in f:
        try:
            data = json.loads(line)
            if data.get('type') == 'USER_INPUT':
                user_text = data.get('content', '')
        except:
            pass

# Write full user text to input.txt just in case
with open('scratch/input.txt', 'w', encoding='utf-8') as f:
    f.write(user_text)

# Read allowed course codes
with open('src/data/courses.js', encoding='utf-8') as f:
    courses_js = f.read()

courses_codes = re.findall(r"code:\s*'([^']+)'", courses_js)

# Parse existing schedule.js to keep existing ones
with open('src/data/schedule.js', encoding='utf-8') as f:
    sched = f.read()

crn_objects = re.findall(r"\{\s*crn:\s*'[^']+.*?(?:\},|\})", sched)
unique_objects = []
seen_crns = set()

for obj in crn_objects:
    crn_match = re.search(r"crn:\s*'([^']+)'", obj)
    if crn_match:
        crn = crn_match.group(1)
        if crn not in seen_crns:
            seen_crns.add(crn)
            if obj.endswith(','): obj = obj[:-1]
            unique_objects.append(obj)

# Now parse the full user text
lines = user_text.split('\n')
start_parsing = False
for line in lines:
    if line.startswith('CRN\tDers Kodu'):
        start_parsing = True
        continue
    
    if not start_parsing:
        continue
        
    line = line.strip()
    if not line: continue
    parts = line.split('\t')
    if len(parts) < 11: continue
    
    crn = parts[0]
    ders_kodu = parts[1]
    
    # Check if in courses.js
    if ders_kodu not in courses_codes:
        continue
        
    # Check if we already have it
    if crn in seen_crns:
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
    
    obj = f"  {{ crn: '{crn}', courseCode: '{ders_kodu}', courseId: '{course_id}', courseName: '{ders_adi}', day: '{gun}', timeStart: '{ts}', timeEnd: '{te}', building: '{bina}', classroom: '{derslik}', instructor: '{hoca}', capacity: {kontenjan}, enrolled: {yazilan} }}"
    unique_objects.append(obj)
    seen_crns.add(crn)

new_sched = "export const scheduleData = [\n  " + ",\n  ".join(unique_objects) + ",\n];\n\n"
new_sched += """export const DAY_NAMES = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma'];
export const TIME_SLOTS = [
  '08:30 - 09:29', '09:30 - 10:29', '10:30 - 11:29', '11:30 - 12:29',
  '12:30 - 13:29', '13:30 - 14:29', '14:30 - 15:29', '15:30 - 16:29', '16:30 - 17:29'
];

export function getScheduleByCourseId(id) {
  return scheduleData.filter(s => s.courseId === id);
}

export function hasTimeConflict(course1, course2) {
  if (course1.day !== course2.day) return false;
  const start1 = parseFloat(course1.timeStart.replace(':', '.'));
  const end1 = parseFloat(course1.timeEnd.replace(':', '.'));
  const start2 = parseFloat(course2.timeStart.replace(':', '.'));
  const end2 = parseFloat(course2.timeEnd.replace(':', '.'));
  return (start1 < end2 && start2 < end1);
}
"""

with open('src/data/schedule.js', 'w', encoding='utf-8') as f:
    f.write(new_sched)

print(f"Update completed. Total {len(unique_objects)} courses in schedule.")
