import requests, json
from bs4 import BeautifulSoup
import html

resp = requests.get('https://obs.itu.edu.tr/public/DersProgram/DersProgramSearch', params={'ProgramSeviyeTipiAnahtari': 'LS', 'dersBransKoduId': 193})
soup = BeautifulSoup(resp.text, 'html.parser')
table = soup.find('table', id='dersProgramContainer')
if not table:
    for t in soup.find_all('table'):
        if t.find('thead') and 'CRN' in t.find('thead').get_text():
            table = t
            break

snt_courses = {}
snt_schedules = []

for tr in table.find('tbody').find_all('tr'):
    tds = tr.find_all('td')
    if len(tds) < 14: continue
    crn = tds[0].get_text(strip=True)
    code_a = tds[1].find('a')
    course_code = code_a.get_text(strip=True) if code_a else tds[1].get_text(strip=True)
    name = html.unescape(tds[2].get_text(strip=True))
    course_id = course_code.replace(' ', '_')
    
    if course_id not in snt_courses:
        snt_courses[course_id] = {
            'id': course_id, 'code': course_code, 'name': name,
            'semester': 0, 'credit': 3, 'ects': 3.0, 'type': 'COURSE_TYPES.ITB', 'department': 'SNT', 'rawPrereq': ''
        }
    
    time_text = tds[7].get_text(strip=True)
    time_start, time_end = '', ''
    if '/' in time_text:
        time_start, time_end = time_text.split('/')[0].strip(), time_text.split('/')[1].strip()
    
    capacity = int(tds[9].get_text(strip=True)) if tds[9].get_text(strip=True).isdigit() else 0
    enrolled = int(tds[10].get_text(strip=True)) if tds[10].get_text(strip=True).isdigit() else 0
    bld_a = tds[5].find('a')
    building = bld_a.get_text(strip=True) if bld_a else tds[5].get_text(strip=True)
    
    snt_schedules.append({
        'crn': crn, 'courseCode': course_code, 'courseId': course_id, 'courseName': name,
        'day': html.unescape(tds[6].get_text(strip=True)), 'timeStart': time_start, 'timeEnd': time_end,
        'building': building, 'classroom': tds[8].get_text(strip=True), 
        'instructor': html.unescape(tds[4].get_text(strip=True)),
        'capacity': capacity, 'enrolled': enrolled
    })

with open('c:/Users/EMRE/Desktop/Sihirbaz/snt_data.json', 'w', encoding='utf-8') as f:
    json.dump({'courses': list(snt_courses.values()), 'schedules': snt_schedules}, f)
print(f'Found {len(snt_courses)} SNT courses and {len(snt_schedules)} schedules.')
