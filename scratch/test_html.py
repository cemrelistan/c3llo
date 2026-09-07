with open('c:/Users/EMRE/Desktop/Sihirbaz/obs.html', 'r', encoding='utf-8') as f:
    text = f.read()
    for line in text.split('\n'):
        if 'value="' in line and ('SNT' in line or 'HUK' in line):
            print(line.strip())
