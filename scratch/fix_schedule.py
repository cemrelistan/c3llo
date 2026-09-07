import json
import re

# Read the broken schedule.js
with open('src/data/schedule.js', encoding='utf-8') as f:
    sched = f.read()

# I need to restore the file to the state before my script ran.
# I appended to the last bracket.
# The original file had DAY_NAMES and TIME_SLOTS:
# export const DAY_NAMES = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma'];
# export const TIME_SLOTS = [
#   '08:30 - 09:29', '09:30 - 10:29', '10:30 - 11:29', '11:30 - 12:29',
#   '12:30 - 13:29', '13:30 - 14:29', '14:30 - 15:29', '15:30 - 16:29', '16:30 - 17:29'
# ];
# export function getScheduleByCourseId(id) { ... }
# export function hasTimeConflict(course1, course2) { ... }

# The break happened because I searched for the last ']'.
# Let's completely read the old original part. The appended entries all have "{" at start.
# Actually, the easiest way to fix it is to use the original scratch/parse.py but change the logic.
# Let's extract the valid elements from scheduleData and TIME_SLOTS and regenerate it.
# Actually wait, `scheduleData` has lines that end with `},`.
# Let's match all objects that have `crn:`
crn_objects = re.findall(r"\{\s*crn:\s*'[^']+.*?(?:\},|\})", sched)

# Get unique ones to be safe, but wait, there are duplicates if I ran it twice? No I ran it once.
unique_objects = []
seen_crns = set()
for obj in crn_objects:
    crn_match = re.search(r"crn:\s*'([^']+)'", obj)
    if crn_match:
        crn = crn_match.group(1)
        if crn not in seen_crns:
            seen_crns.add(crn)
            # make sure it ends with }
            if obj.endswith(','): obj = obj[:-1]
            unique_objects.append(obj)

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

print(f"Fixed schedule.js with {len(unique_objects)} entries.")
