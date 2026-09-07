const fs = require('fs');
const text = fs.readFileSync('src/data/courses.js', 'utf8');
let startIdx = text.indexOf('export const courseMap = new Map(');
if (startIdx === -1) startIdx = text.indexOf('export function getAvailableCourses');
const endIdx = text.indexOf('export function getAvailableCourses');

const funcCode = `export const courseMap = new Map(courses.map(c => [c.id, c]));

export function arePrerequisitesMet(courseId, passedCourses) {
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
    const match = evalStr.match(/(\\([^)]*\\)|[A-Z]{3,4}\\s\\d+[A-Z]?)/);
    if (match) evalStr = evalStr.substring(match.index);
    evalStr = evalStr.replace(/\\d+(,\\d+)?$/, '');

    const courseMatchRegex = /(?:([A-Z]{3,4}\\s\\d+[A-Z]?)(MIN\\.\\s*[A-Z]{2}))|([A-Z]{3,4}\\s\\d+[A-Z]?)/g;
    
    evalStr = evalStr.replace(courseMatchRegex, (match, code1, minStr, code2) => {
       let code = (code1 || code2).trim();
       const id = code.replace(' ', '_');
       let isPassed = passedCourses.includes(id);
       
       if (!isPassed) {
         if (code.endsWith('E')) {
           isPassed = passedCourses.includes(id.substring(0, id.length - 1));
         } else {
           isPassed = passedCourses.includes(id + 'E');
         }
       }
       return isPassed ? " true " : " false ";
    });
    
    evalStr = evalStr.replace(/Veya/g, ' || ').replace(/Ve/g, ' && ');
    
    try {
       return (new Function('return ' + evalStr))();
    } catch (e) {
       console.error("Parse error for rule:", rule.value, e);
       return false;
    }
  }

  return true;
}

`;

const newText = text.substring(0, startIdx) + funcCode + text.substring(endIdx);
fs.writeFileSync('src/data/courses.js', newText);
