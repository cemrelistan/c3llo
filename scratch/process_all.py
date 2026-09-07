import json
import re

# 1. Load allowed codes from alınabilirler.txt
allowed_codes = set()
with open('src/data/alınabilirler.txt', 'r', encoding='utf-8') as f:
    for line in f:
        line = line.strip()
        # Match lines like "ALM 101" or "ITB 020E" or "ING 103AC"
        if re.match(r'^[A-Z]{3} \d{3}[A-Za-z]*$', line):
            allowed_codes.add(line)

print(f"Loaded {len(allowed_codes)} allowed course codes.")

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

# 3. Read tüm_açık_dersler.txt
with open('src/data/tüm_açık_dersler.txt', 'r', encoding='utf-8') as f:
    lines = f.readlines()

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
    
    crn = parts[0].strip()
    ders_kodu = parts[1].strip()
    
    # Check if exactly in allowed_codes
    if ders_kodu not in allowed_codes:
        continue
        
    if crn in seen_crns:
        continue
        
    ders_adi = parts[2].strip()
    hoca = parts[4].strip()
    bina = parts[5].strip()
    gun = parts[6].strip()
    saat = parts[7].strip()
    derslik = parts[8].strip()
    kontenjan = parts[9].strip()
    yazilan = parts[10].strip()
    
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
new_sched = "export const scheduleData = [\n"
new_sched += ",\n".join(all_objects)
new_sched += "\n];\n\n"
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
