const fs = require('fs');
let s = fs.readFileSync('c:/Users/EMRE/Desktop/Sihirbaz/src/data/courses.js', 'utf8');

// Remove all parseRuleString
s = s.replace(/export function parseRuleString[\s\S]*?\}\n?/g, '');

const idx = s.indexOf('export function arePrerequisitesMet');
if (idx !== -1) {
    s = s.substring(0, idx);
}

const topStr = `export function parseRuleString(str) {
  if (!str || str === '-') return null;
  const hasCourse = /[A-Z]{3,4}\\s\\d+[A-Z]?/.test(str);
  const creditMatch = str.match(/(\\d+),\\d+$/);
  if (!hasCourse && creditMatch) {
    return { type: 'CREDIT', value: parseInt(creditMatch[1]) };
  }
  if (/^\\d+(,\\d+)?$/.test(str)) return { type: 'CREDIT', value: parseInt(str) };
  return { type: 'RAW', value: str };
}
`;

s = s.replace('// Basit token parser', '// Basit token parser\\n' + topStr);

const codeToAdd = `export function arePrerequisitesMet(courseId, passedCourses) {
  const course = courseMap.get(courseId);
  if (!course) return false;
  if (!course.rawPrereq) return true;

  const rule = parseRuleString(course.rawPrereq);
  if (!rule) return true;
  
  if (rule.type === 'CREDIT') {
    let totalCredits = 0;
    for (const pid of passedCourses) {
      const pc = courseMap.get(pid);
      if (pc) totalCredits += pc.credit;
    }
    return totalCredits >= rule.value;
  }
  
  if (rule.type === 'RAW') {
    let evalStr = rule.value;
    
    const firstParen = evalStr.indexOf('(');
    const courseCodeMatch = evalStr.match(/[A-Z]{3,4}\\s\\d+[A-Z]?/);
    const firstCourseCode = courseCodeMatch ? courseCodeMatch.index : -1;
    
    let startIndex = -1;
    if (firstParen !== -1 && firstCourseCode !== -1) {
       startIndex = Math.min(firstParen, firstCourseCode);
    } else if (firstParen !== -1) {
       startIndex = firstParen;
    } else if (firstCourseCode !== -1) {
       startIndex = firstCourseCode;
    }
    
    if (startIndex !== -1) {
       evalStr = evalStr.substring(startIndex);
    }
    
    evalStr = evalStr.replace(/\\d+,\\d+/g, '');
    
    const courseMatchRegex = /(?:([A-Z]{3,4}\\s\\d+[A-Z]?)(MIN\\.\\s*[A-Z]{2}))|([A-Z]{3,4}\\s\\d+[A-Z]?)/g;
    
    evalStr = evalStr.replace(courseMatchRegex, (match, code1, minStr, code2) => {
       let code = (code1 || code2).trim();
       const id = code.replace(' ', '_');
       const passed = passedCourses.includes(id) || passedCourses.includes(id + 'E') || passedCourses.includes(id.replace('E', ''));
       return passed ? " true " : " false ";
    });
    
    evalStr = evalStr.replace(/Veya/g, ' || ').replace(/Ve/g, ' && ');
    
    try {
       return (new Function('return ' + evalStr))();
    } catch (e) {
       console.error("Parse error for rule:", rule.value, evalStr, e);
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
`;

s += codeToAdd;
fs.writeFileSync('c:/Users/EMRE/Desktop/Sihirbaz/src/data/courses.js', s);
console.log('courses.js fixed perfectly');
