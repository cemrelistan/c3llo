import os, sys, re, json, html, codecs, time
import requests
from bs4 import BeautifulSoup

BASE = r"C:\Users\EMRE\.gemini\antigravity\brain\5adc8b27-24da-49d9-b343-2426838d78d0"
CURRICULUM_FILE = BASE + r"\.system_generated\steps\162\content.md"
RESTRICTED_FILE = BASE + r"\.system_generated\steps\250\content.md"
ELECTIVE_FILE   = BASE + r"\.system_generated\steps\251\content.md"
ITB_FILE        = BASE + r"\.system_generated\steps\252\content.md"
DEPTS_JSON_FILE = BASE + r"\.system_generated\steps\296\content.md"

def read_file(path):
    with codecs.open(path, "r", encoding="utf-8") as f: return f.read()

def decode_html_entities(text): return html.unescape(text)

def get_department_map():
    content = read_file(DEPTS_JSON_FILE)
    json_start = content.find("[")
    json_end = content.rfind("]") + 1
    if json_start != -1 and json_end != 0:
        data = json.loads(content[json_start:json_end])
        return {item['dersBransKodu']: item['bransKoduId'] for item in data}
    return {}

def parse_prerequisites(html_content):
    soup = BeautifulSoup(html_content, 'html.parser')
    table = soup.find('table')
    rules = {}
    if not table: return rules
    
    for tr in table.find_all('tr'):
        tds = [td.get_text(strip=True) for td in tr.find_all('td')]
        if len(tds) > 1:
            code = tds[0].split('->')[0].strip()
            if 'EVBA' in code: code = code[:8]
            elif 'EMAT' in code: code = code[:8]
            
            course_code = tds[0].strip()
            m = re.match(r'([A-Z]+\s\d+[A-Z]?)', course_code)
            if m: course_code = m.group(1)
            
            rule_str = tds[1].strip()
            rules[course_code] = rule_str
    return rules

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

electives_new_path = 'c:/Users/EMRE/Desktop/Sihirbaz/scratch/electives_new.txt'
if os.path.exists(electives_new_path):
    lines = read_file(electives_new_path).splitlines()
    lines = [l.strip() for l in lines if l.strip()]
    i = 0
    current_type = 'RESTRICTED_ELECTIVE'
    while i < len(lines):
        if 'Elective Course (MT)' in lines[i]:
            current_type = 'RESTRICTED_ELECTIVE'
            i += 1
            if i < len(lines) and 'Ders\tDil\tKredi' in lines[i]: i += 1
            continue
        elif 'ITB' in lines[i] or 'İTB' in lines[i]:
            current_type = 'ITB'
            i += 1
            if i < len(lines) and 'Ders\tDil\tKredi' in lines[i]: i += 1
            continue
            
        if i + 1 < len(lines) and '\t' in lines[i+1]:
            code = lines[i]
            parts = lines[i+1].split('\t')
            name = parts[0]
            if name == 'English' or name == 'Turkish':
                name = ""
                cr_idx = 1
                ec_idx = 2
            else:
                cr_idx = 2
                ec_idx = 3
                
            try:
                credit = float(parts[cr_idx].replace(',', '.'))
                ects = float(parts[ec_idx].replace(',', '.'))
                
                dept = code.split(' ')[0] if ' ' in code else code[:3]
                cid = code.replace(' ', '_')
                
                c_obj = {
                    'id': cid,
                    'code': code,
                    'name': name if name else code,
                    'semester': 0,
                    'credit': credit,
                    'ects': ects,
                    'type': current_type,
                    'department': dept,
                    'rawPrereq': ''
                }
                
                if current_type == 'ITB' or dept in ['SNT', 'ALM', 'ARB', 'CIN', 'FRA', 'ISP', 'ITA', 'ITB', 'JPN', 'RUS', 'HUK']:
                    c_obj['type'] = 'ITB'
                else:
                    c_obj['type'] = 'RESTRICTED_ELECTIVE'
                
                if not name and cid in all_courses:
                    c_obj['name'] = all_courses[cid]['name']
                    
                all_courses[cid] = c_obj
            except Exception as e:
                pass
            i += 2
        else:
            i += 1

snt_raw_path = 'c:/Users/EMRE/Desktop/Sihirbaz/scratch/snt_raw.txt'
if os.path.exists(snt_raw_path):
    lines = read_file(snt_raw_path).splitlines()
    for line in lines:
        line = line.strip()
        if not line: continue
        cols = line.split('\t')
        if len(cols) < 11: continue
        
        ccode = cols[1].strip()
        name = cols[2].strip()
        cid = ccode.replace(' ', '_')
        dept = ccode.split(' ')[0]
        
        if cid not in all_courses:
            all_courses[cid] = {
                'id': cid,
                'code': ccode,
                'name': name,
                'credit': 3.0,
                'ects': 4.0,
                'type': 'ITB',
                'department': dept,
                'rawPrereq': ''
            }
        else:
            all_courses[cid]['name'] = name
            all_courses[cid]['type'] = 'ITB'

# FETCH PREREQUISITES
dept_map = get_department_map()
departments = set(c['department'] for c in all_courses.values())
all_prereqs = {}

print("Fetching prerequisites...")
for dept in departments:
    if dept in dept_map:
        did = dept_map[dept]
        try:
            resp = requests.get("https://obs.itu.edu.tr/public/GenelTanimlamalar/OnsartAra", 
                                params={'DersBransKoduId': did}, timeout=15)
            if resp.status_code == 200:
                pr = parse_prerequisites(resp.text)
                all_prereqs.update(pr)
        except Exception as e:
            print(f"Error fetching prereqs for {dept}: {e}")
        time.sleep(0.2)

# APPLY PREREQUISITES
lang_depts = ['ALM', 'ARB', 'CIN', 'FRA', 'ISP', 'ITA', 'JPN', 'RUS', 'ING']
for c in all_courses.values():
    code = c['code']
    pr_str = all_prereqs.get(code, '')
    
    # Custom ITB language logic as per user
    if c['department'] in lang_depts:
        m = re.search(r'(\d+)', code)
        if m:
            num = int(m.group(1))
            if num > 101:
                prev_num = num - 1
                pr_str = code.replace(str(num), str(prev_num))
                
    c['rawPrereq'] = pr_str

js_str = "export const courses = [\n"
for cid, c in all_courses.items():
    safe_name = c['name'].replace("'", "\\'")
    safe_prereq = str(c.get('rawPrereq', '')).replace("'", "\\'")
    t = c['type']
    if t == 'RESTRICTED_ELECTIVE': t_str = 'COURSE_TYPES.RESTRICTED_ELECTIVE'
    elif t == 'ELECTIVE': t_str = 'COURSE_TYPES.ELECTIVE'
    elif t == 'ITB': t_str = 'COURSE_TYPES.ITB'
    elif t == 'GENERAL': t_str = 'COURSE_TYPES.GENERAL'
    else: t_str = 'COURSE_TYPES.MANDATORY'
    
    js_str += f"  {{ id: '{c['id']}', code: '{c['code']}', name: '{safe_name}', semester: {c.get('semester', 0)}, credit: {c['credit']}, ects: {c['ects']}, type: {t_str}, department: '{c['department']}', rawPrereq: '{safe_prereq}' }},\n"
js_str += "];\n"

courses_js_path = 'c:/Users/EMRE/Desktop/Sihirbaz/src/data/courses.js'
with codecs.open(courses_js_path, 'r', 'utf-8') as f:
    courses_js = f.read()

start_idx = courses_js.find('export const courses = [')
end_idx = courses_js.find('];', start_idx) + 2

new_courses_js = courses_js[:start_idx] + js_str + courses_js[end_idx:]

with codecs.open(courses_js_path, 'w', 'utf-8') as f:
    f.write(new_courses_js)

print(f"Restored courses.js with prerequisites for {len(all_courses)} courses.")
