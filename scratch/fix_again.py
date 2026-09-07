import json
import re

# 1. Load allowed codes
allowed_codes = set()
with open('scratch/allowed.txt', 'r', encoding='utf-8') as f:
    for line in f:
        line = line.strip()
        if line:
            allowed_codes.add(line)

# 2. Extract original schedule.js objects
with open('src/data/schedule.js', 'r', encoding='utf-8') as f:
    sched = f.read()

crn_objects = re.findall(r"\{\s*crn:\s*'[^']+.*?(?:\},|\})", sched)
original_objects = []
seen_crns = set()

# The original file ended with crn: '12138' (VBA 343E)
for obj in crn_objects:
    crn_match = re.search(r"crn:\s*'([^']+)'", obj)
    if crn_match:
        crn = crn_match.group(1)
        if crn not in seen_crns:
            seen_crns.add(crn)
            if obj.endswith(','): obj = obj[:-1]
            original_objects.append(obj)
        if crn == '12138':
            break

print(f"Extracted {len(original_objects)} original objects.")

# 3. Read input.txt (the raw course data from transcript)
with open('scratch/input.txt', 'r', encoding='utf-8') as f:
    input_text = f.read()

lines = input_text.split('\n')
start_parsing = False
new_objects = []

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
    
    # Check if exactly in allowed_codes
    if ders_kodu not in allowed_codes:
        continue
        
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
    new_objects.append(obj)
    seen_crns.add(crn)

print(f"Found {len(new_objects)} new courses matching the allowed list.")

all_objects = original_objects + new_objects

# 4. Generate new schedule.js
new_sched = "export const scheduleData = [\n  " + ",\n  ".join(all_objects) + ",\n];\n\n"
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

print(f"Update completed. Total {len(all_objects)} courses in schedule.")
