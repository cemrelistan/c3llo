import requests
from bs4 import BeautifulSoup
import json
import codecs

deptIds = {
    'BHB': '20', 'ECN': '40', 'EKO': '41', 'END': '46', 'FIZ': '52',
    'KIM': '85', 'MAT': '124', 'VBA': '306', 'ING': '71', 'TUR': '296',
    'ATA': '10', 'DAN': '29', 'ISL': '74', 'YON': '320', 'BLG': '21',
    'KON': '99', 'EEE': '42', 'EHB': '43', 'SNT': '284',
    'ALM': '4', 'ARB': '6', 'CIN': '24', 'FRA': '54', 'HUK': '66',
    'ISP': '73', 'ITA': '75', 'ITB': '76', 'JPN': '80', 'RUS': '277'
}

deptsToFetch = ['SNT', 'ALM', 'ARB', 'CIN', 'FRA', 'HUK', 'ISP', 'ITA', 'ITB', 'JPN', 'RUS', 'BHB', 'ECN', 'EKO', 'END', 'ISL', 'VBA']

session = requests.Session()
res = session.get('https://obs.itu.edu.tr/public/DersProgram')
soup = BeautifulSoup(res.text, 'html.parser')

token = soup.find('input', {'name': '__RequestVerificationToken'})
if token:
    token_val = token.get('value')
else:
    token_val = ''

all_htmls = {}

for dept in deptsToFetch:
    print(f"Fetching {dept}...")
    data = {
        '__RequestVerificationToken': token_val,
        'ProgramSeviyeTipiAnahtari': 'LS',
        'dersBransKoduId': deptIds[dept]
    }
    r = session.post('https://obs.itu.edu.tr/public/DersProgram/DersProgramSearch', data=data)
    
    dept_soup = BeautifulSoup(r.text, 'html.parser')
    table = dept_soup.find('table')
    if table:
        all_htmls[dept] = str(table)
    else:
        all_htmls[dept] = ""
        
with codecs.open('c:/Users/EMRE/Desktop/Sihirbaz/scratch/scraped_schedules.json', 'w', 'utf-8') as f:
    json.dump(all_htmls, f, ensure_ascii=False)
print("Done!")
