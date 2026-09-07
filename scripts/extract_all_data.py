import re, json, sys, html
import requests
from bs4 import BeautifulSoup
import time

BASE = r"C:\Users\EMRE\.gemini\antigravity\brain\5adc8b27-24da-49d9-b343-2426838d78d0"
CURRICULUM_FILE = BASE + r"\.system_generated\steps\162\content.md"
RESTRICTED_FILE = BASE + r"\.system_generated\steps\250\content.md"
ELECTIVE_FILE   = BASE + r"\.system_generated\steps\251\content.md"
ITB_FILE        = BASE + r"\.system_generated\steps\252\content.md"
DEPTS_JSON_FILE = BASE + r"\.system_generated\steps\296\content.md"

OUTPUT_COURSES  = r"c:\Users\EMRE\Desktop\Sihirbaz\src\data\courses.js"
OUTPUT_SCHEDULE = r"c:\Users\EMRE\Desktop\Sihirbaz\src\data\schedule.js"

def read_file(path):
    with open(path, "r", encoding="utf-8") as f: return f.read()

def decode_html_entities(text): return html.unescape(text)

def get_department_map():
    content = read_file(DEPTS_JSON_FILE)
    json_start = content.find("[")
    json_end = content.rfind("]") + 1
    if json_start != -1 and json_end != 0:
        data = json.loads(content[json_start:json_end])
        return {item['dersBransKodu']: item['bransKoduId'] for item in data}
    return {}

def parse_curriculum(html_content):
    soup = BeautifulSoup(html_content, 'html.parser')
    courses = []
    for idx, table in enumerate(soup.find_all('table', class_='datalist')):
        semester = idx + 1
        h2 = table.find('h2')
        if h2:
            m = re.search(r'(\d+)\.', h2.get_text())
            if m: semester = int(m.group(1))
        tbody = table.find('tbody')
        if not tbody: continue
        for tr in tbody.find_all('tr'):
            tds = tr.find_all('td')
            if len(tds) < 10: continue
            code_a = tds[0].find('a')
            if not code_a: continue
            code = code_a.get_text(strip=True)
            name = tds[1].get_text(strip=True)
            if code == 'Dersler' or not code: continue
            credit_text = tds[4].get_text(strip=True)
            ects_text = tds[5].get_text(strip=True)
            credit = int(re.search(r'(\d+)', credit_text).group(1)) if credit_text and re.search(r'(\d+)', credit_text) else 0
            ects = float(re.search(r'([\d,\.]+)', ects_text).group(1).replace(',', '.')) if ects_text and re.search(r'([\d,\.]+)', ects_text) else 0
            dept = code.split(' ')[0] if ' ' in code else code[:3]
            courses.append({
                'id': code.replace(' ', '_'),
                'code': code,
                'name': decode_html_entities(name),
                'semester': semester,
                'credit': credit,
                'ects': ects,
                'type': 'MANDATORY',
                'department': dept
            })
    return courses

def parse_elective_group(html_content, group_type):
    soup = BeautifulSoup(html_content, 'html.parser')
    courses = []
    table = soup.find('table', class_='datalist')
    if not table or not table.find('tbody'): return courses
    for tr in table.find('tbody').find_all('tr'):
        tds = tr.find_all('td')
        if len(tds) < 7: continue
        code_a = tds[0].find('a')
        if not code_a: continue
        code = code_a.get_text(strip=True)
        br = tds[0].find('br')
        name = str(br.next_sibling).strip() if br and br.next_sibling else tds[0].get_text(strip=True).replace(code, '').strip()
        credit_text = tds[2].get_text(strip=True)
        ects_text = tds[3].get_text(strip=True)
        credit = int(re.search(r'(\d+)', credit_text).group(1)) if credit_text and re.search(r'(\d+)', credit_text) else 0
        ects = float(re.search(r'([\d,\.]+)', ects_text).group(1).replace(',', '.')) if ects_text and re.search(r'([\d,\.]+)', ects_text) else 0
        dept = code.split(' ')[0] if ' ' in code else code[:3]
        courses.append({
            'id': code.replace(' ', '_'),
            'code': code,
            'name': decode_html_entities(name),
            'semester': 0,
            'credit': credit,
            'ects': ects,
            'type': group_type,
            'department': dept
        })
    return courses

def parse_schedule_html(html_content):
    soup = BeautifulSoup(html_content, 'html.parser')
    table = soup.find('table', id='dersProgramContainer')
    if not table:
        for t in soup.find_all('table'):
            if t.find('thead') and 'CRN' in t.find('thead').get_text():
                table = t
                break
    if not table or not table.find('tbody'): return []
    entries = []
    for tr in table.find('tbody').find_all('tr'):
        tds = tr.find_all('td')
        if len(tds) < 14: continue
        crn = tds[0].get_text(strip=True)
        if not crn or not crn.isdigit(): continue
        code_a = tds[1].find('a')
        course_code = code_a.get_text(strip=True) if code_a else tds[1].get_text(strip=True)
        time_text = tds[7].get_text(strip=True) if len(tds) > 7 else ''
        time_start, time_end = '', ''
        if '/' in time_text:
            time_start, time_end = time_text.split('/')[0].strip(), time_text.split('/')[1].strip()
        
        capacity = int(tds[9].get_text(strip=True)) if len(tds) > 9 and tds[9].get_text(strip=True).isdigit() else 0
        enrolled = int(tds[10].get_text(strip=True)) if len(tds) > 10 and tds[10].get_text(strip=True).isdigit() else 0
        bld_a = tds[5].find('a') if len(tds) > 5 else None
        
        entries.append({
            'crn': crn,
            'courseCode': course_code,
            'name': decode_html_entities(tds[2].get_text(strip=True)),
            'day': decode_html_entities(tds[6].get_text(strip=True)) if len(tds) > 6 else '',
            'timeStart': time_start,
            'timeEnd': time_end,
            'building': bld_a.get_text(strip=True) if bld_a else (tds[5].get_text(strip=True) if len(tds) > 5 else ''),
            'classroom': tds[8].get_text(strip=True) if len(tds) > 8 else '--',
            'instructor': decode_html_entities(tds[4].get_text(strip=True)),
            'capacity': capacity,
            'enrolled': enrolled
        })
    return entries

def parse_prerequisites(html_content):
    soup = BeautifulSoup(html_content, 'html.parser')
    table = soup.find('table')
    rules = {}
    if not table: return rules
    
    for tr in table.find_all('tr'):
        tds = [td.get_text(strip=True) for td in tr.find_all('td')]
        if len(tds) > 1:
            code = tds[0].split('->')[0].strip()
            # Clean up the code (remove trailing E or combined codes like VBA 222EVBA 222)
            if 'EVBA' in code: code = code[:8]
            elif 'EMAT' in code: code = code[:8]
            
            # The rule string is in tds[1], wait no, the split was wrong in my thought.
            # In the original html, tds[0] is course, tds[1] is prereq text
            course_code = tds[0].strip()
            # Remove duplicated names like VBA 311EVBA 311
            m = re.match(r'([A-Z]+\s\d+[A-Z]?)', course_code)
            if m: course_code = m.group(1)
            
            rule_str = tds[1].strip()
            rules[course_code] = rule_str
    return rules

def build_rule_tree(rule_str):
    if not rule_str or rule_str == '-': return None
    
    # Check for simple credit requirement
    if re.match(r'^\d+,\d+$', rule_str) or re.match(r'^\d+$', rule_str):
        return {'type': 'CREDIT', 'value': int(rule_str.split(',')[0])}
        
    # Recursive parsing of ( A Ve B ) Veya C
    # This is a basic parser. It converts the string into a JS object string representation.
    # For courses.js, we can just save the raw string and let the JS parser handle it,
    # OR we can parse it in Python. Given time, it's safer to output the raw string 
    # and parse it in courses.js with a small token parser.
    return rule_str

print("Parsing curriculum...")
all_courses = {}
for c in parse_curriculum(read_file(CURRICULUM_FILE)): all_courses[c['id']] = c
for c in parse_elective_group(read_file(RESTRICTED_FILE), 'RESTRICTED_ELECTIVE'): 
    if c['id'] not in all_courses: all_courses[c['id']] = c
for c in parse_elective_group(read_file(ELECTIVE_FILE), 'ELECTIVE'): 
    if c['id'] not in all_courses: all_courses[c['id']] = c
for c in parse_elective_group(read_file(ITB_FILE), 'ITB'): 
    if c['id'] in all_courses:
        all_courses[c['id']]['type'] = 'ITB'
    else:
        all_courses[c['id']] = c

courses_list = list(all_courses.values())
dept_map = get_department_map()
departments = set(c['department'] for c in courses_list)

all_schedule = []
all_prereqs = {}

print("Fetching schedules and prerequisites...")
for dept in sorted(departments):
    if dept in dept_map:
        did = dept_map[dept]
        
        # Schedule
        try:
            resp = requests.get("https://obs.itu.edu.tr/public/DersProgram/DersProgramSearch", 
                                params={'ProgramSeviyeTipiAnahtari': 'LS', 'dersBransKoduId': did}, timeout=15)
            if resp.status_code == 200:
                dept_sch = parse_schedule_html(resp.text)
                our_codes = set(c['code'] for c in courses_list if c['department'] == dept)
                relevant = [s for s in dept_sch if s['courseCode'] in our_codes]
                all_schedule.extend(relevant)
        except Exception as e:
            print(f"Error fetching schedule for {dept}: {e}")
            
        time.sleep(0.5)
        
        # Prerequisites
        try:
            resp = requests.get("https://obs.itu.edu.tr/public/GenelTanimlamalar/OnsartAra", 
                                params={'DersBransKoduId': did}, timeout=15)
            if resp.status_code == 200:
                pr = parse_prerequisites(resp.text)
                all_prereqs.update(pr)
        except Exception as e:
            print(f"Error fetching prereqs for {dept}: {e}")
            
        time.sleep(0.5)

print("Writing files...")

js = """export const COURSE_TYPES = {
  MANDATORY: 'mandatory',
  RESTRICTED_ELECTIVE: 'restricted_elective',
  ELECTIVE: 'elective',
  ITB: 'itb',
  GENERAL: 'general'
};

export const COURSE_TYPE_LABELS = {
  [COURSE_TYPES.MANDATORY]: 'Zorunlu',
  [COURSE_TYPES.RESTRICTED_ELECTIVE]: 'Sınırlı Seçmeli (MT)',
  [COURSE_TYPES.ELECTIVE]: 'Seçmeli (MT)',
  [COURSE_TYPES.ITB]: 'İTB Seçmeli',
  [COURSE_TYPES.GENERAL]: 'Genel'
};

// Basit token parser
export function parseRuleString(str) {
  if (!str || str === '-') return null;
  if (/^\d+(,\d+)?$/.test(str)) return { type: 'CREDIT', value: parseInt(str) };
  return { type: 'RAW', value: str };
}

export const courses = [
"""
for c in courses_list:
    safe_name = c['name'].replace("'", "\\'").replace("&amp;", "&")
    # match raw prereq
    raw_p = all_prereqs.get(c['code'], "")
    if not raw_p and c['code'].endswith('E'):
        raw_p = all_prereqs.get(c['code'][:-1], "")
        
    js += f"""  {{ id: '{c["id"]}', code: '{c["code"]}', name: '{safe_name}', semester: {c["semester"]}, credit: {c["credit"]}, ects: {c["ects"]}, type: COURSE_TYPES.{c["type"]}, department: '{c["department"]}', rawPrereq: '{raw_p}' }},
"""

js += """];

export const courseMap = new Map(courses.map(c => [c.id, c]));

export function arePrerequisitesMet(courseId, passedCourses) {
  const course = courseMap.get(courseId);
  if (!course) return false;
  if (!course.rawPrereq) return true;

  const rule = parseRuleString(course.rawPrereq);
  if (!rule) return true;
  
  if (rule.type === 'CREDIT') {
    // Toplam krediyi hesapla
    let totalCredits = 0;
    for (const pid of passedCourses) {
      const pc = courseMap.get(pid);
      if (pc) totalCredits += pc.credit;
    }
    return totalCredits >= rule.value;
  }
  
  if (rule.type === 'RAW') {
    // RAW kural ornegi: (MAT 104MIN. DDVeyaMAT 104EMIN. DD)Ve(VBA 210EMIN. DD)
    let evalStr = rule.value;
    
    // Geçilen dersleri regex ile bulup true/false yapacağız
    // Format: "VBA 113EMIN. DD"
    const courseMatchRegex = /([A-Z]{3,4}\s\d+[A-Z]?)(MIN\.\s*[A-Z]{2})?/g;
    
    evalStr = evalStr.replace(courseMatchRegex, (match, code) => {
       const passed = passedCourses.includes(code.replace(' ', '_'));
       return passed ? " true " : " false ";
    });
    
    evalStr = evalStr.replace(/Ve/g, ' && ').replace(/Veya/g, ' || ');
    
    try {
       // guvenli degil ama statik stringler oldugu icin calisir
       return (new Function('return ' + evalStr))();
    } catch (e) {
       console.error("Parse error for rule:", rule.value, e);
       return false;
    }
  }

  return true;
}

export function getAvailableCourses(passedCourses) {
  return courses.filter(c => {
    if (passedCourses.includes(c.id)) return false;
    return arePrerequisitesMet(c.id, passedCourses);
  });
}
"""

with open(OUTPUT_COURSES, "w", encoding="utf-8") as f: f.write(js)

sjs = """export const scheduleData = [
"""
for s in all_schedule:
    safe_name = s['name'].replace("'", "\\'")
    safe_instructor = s['instructor'].replace("'", "\\'")
    course_id = s['courseCode'].replace(' ', '_')
    sjs += f"""  {{ crn: '{s["crn"]}', courseCode: '{s["courseCode"]}', courseId: '{course_id}', courseName: '{safe_name}', day: '{s["day"]}', timeStart: '{s["timeStart"]}', timeEnd: '{s["timeEnd"]}', building: '{s["building"]}', classroom: '{s["classroom"]}', instructor: '{safe_instructor}', capacity: {s["capacity"]}, enrolled: {s["enrolled"]} }},
"""

sjs += """];

export const DAY_NAMES = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma'];
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

with open(OUTPUT_SCHEDULE, "w", encoding="utf-8") as f: f.write(sjs)
print("DONE")
