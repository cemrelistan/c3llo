// Sidebar - Verilen Dersler Paneli
import { courses, COURSE_TYPES, COURSE_TYPE_LABELS, getAvailableCourses, courseMap } from '../data/courses.js';

const STORAGE_KEY = 'ders-sihirbazi-passed-courses';

export class Sidebar {
  constructor(onPassedCoursesChange) {
    this.onPassedCoursesChange = onPassedCoursesChange;
    this.passedCourses = this.loadPassedCourses();
    this.searchQuery = '';
    
    this.sidebar = document.getElementById('sidebar');
    this.semesterList = document.getElementById('semesterList');
    this.courseSearch = document.getElementById('courseSearch');
    this.selectAllBtn = document.getElementById('selectAllBtn');
    this.clearAllBtn = document.getElementById('clearAllBtn');
    this.sidebarToggle = document.getElementById('sidebarToggle');
    this.sidebarClose = document.getElementById('sidebarClose');
    this.sidebarOverlay = document.getElementById('sidebarOverlay');
    
    this.init();
  }
  
  init() {
    this.renderSemesters();
    this.bindEvents();
    this.updateStats();
    // Initial notification
    this.onPassedCoursesChange(this.passedCourses);
  }
  
  bindEvents() {
    // Search
    this.courseSearch.addEventListener('input', (e) => {
      this.searchQuery = e.target.value.toLowerCase();
      this.filterCourses();
    });
    
    // Select all / Clear
    this.selectAllBtn.addEventListener('click', () => this.selectAll());
    this.clearAllBtn.addEventListener('click', () => this.clearAll());
    
    // Sidebar toggle
    this.sidebarToggle.addEventListener('click', () => this.toggleSidebar());
    this.sidebarClose.addEventListener('click', () => this.closeSidebar());
    this.sidebarOverlay.addEventListener('click', () => this.closeSidebar());
  }
  
  toggleSidebar() {
    this.sidebar.classList.toggle('open');
    this.sidebarOverlay.classList.toggle('active');
  }
  
  closeSidebar() {
    this.sidebar.classList.remove('open');
    this.sidebarOverlay.classList.remove('active');
  }
  
  renderSemesters() {
    // Group courses by semester
    const semesters = new Map();
    
    // First add mandatory/general courses grouped by semester
    for (const course of courses) {
      if (course.type === COURSE_TYPES.ITB || course.type === COURSE_TYPES.DIL) continue; // ITB ve Dil'i ayrı göster
      
      const key = course.type === COURSE_TYPES.MANDATORY || course.type === COURSE_TYPES.GENERAL
        ? `${course.semester}. Dönem`
        : course.type === COURSE_TYPES.RESTRICTED_ELECTIVE
          ? 'Sınırlı Seçmeli (MT)'
          : 'Seçmeli (MT)';
      
      if (!semesters.has(key)) {
        semesters.set(key, []);
      }
      semesters.get(key).push(course);
    }
    
    // Add ITB group
    const itbCourses = courses.filter(c => c.type === COURSE_TYPES.ITB);
    if (itbCourses.length > 0) {
      semesters.set('ITB Seçmeli', itbCourses);
    }

    // Add Dil group
    const dilCourses = courses.filter(c => c.type === COURSE_TYPES.DIL);
    if (dilCourses.length > 0) {
      semesters.set('Dil Seçmeli', dilCourses);
    }
    
    let html = '';
    for (const [semesterName, semesterCourses] of semesters) {
      const passedInSemester = semesterCourses.filter(c => this.passedCourses.has(c.id)).length;
      
      html += `
        <div class="semester-group" data-semester="${semesterName}">
          <div class="semester-header" onclick="this.classList.toggle('expanded')">
            <span class="semester-title">${semesterName}</span>
            <div style="display:flex;align-items:center;gap:8px;">
              <span class="semester-count">${passedInSemester}/${semesterCourses.length}</span>
              <span class="semester-icon">▼</span>
            </div>
          </div>
          <div class="semester-courses">
            ${semesterCourses.map(course => this.renderCourseCheckbox(course)).join('')}
          </div>
        </div>
      `;
    }
    
    this.semesterList.innerHTML = html;
    
    // Bind checkbox events
    this.semesterList.querySelectorAll('input[type="checkbox"]').forEach(cb => {
      cb.addEventListener('change', (e) => {
        const courseId = e.target.dataset.courseId;
        if (e.target.checked) {
          this.passedCourses.add(courseId);
        } else {
          this.passedCourses.delete(courseId);
        }
        this.savePassedCourses();
        this.updateStats();
        this.onPassedCoursesChange(this.passedCourses);
      });
    });
  }
  
  renderCourseCheckbox(course) {
    const isChecked = this.passedCourses.has(course.id);
    const typeColor = this.getTypeColor(course.type);
    
    return `
      <div class="course-checkbox" data-course-id="${course.id}">
        <input type="checkbox" id="cb_${course.id}" data-course-id="${course.id}" ${isChecked ? 'checked' : ''}>
        <label for="cb_${course.id}">
          <span class="checkmark"></span>
          <span class="course-type-dot" style="background:${typeColor};width:8px;height:8px;border-radius:50%;flex-shrink:0;"></span>
          <span class="course-name-text">${course.name}</span>
          <span class="course-code-tag" style="font-size:0.7rem;color:var(--text-muted);margin-left:auto;white-space:nowrap;">${course.code}</span>
        </label>
      </div>
    `;
  }
  
  getTypeColor(type) {
    switch (type) {
      case COURSE_TYPES.MANDATORY: return 'var(--accent-cyan)';
      case COURSE_TYPES.RESTRICTED_ELECTIVE: return 'var(--accent-purple)';
      case COURSE_TYPES.ELECTIVE: return 'var(--accent-green)';
      case COURSE_TYPES.ITB: return 'var(--accent-orange)';
      case COURSE_TYPES.DIL: return '#ec4899';
      case COURSE_TYPES.GENERAL: return 'var(--text-muted)';
      default: return 'var(--text-muted)';
    }
  }
  
  filterCourses() {
    const checkboxes = this.semesterList.querySelectorAll('.course-checkbox');
    checkboxes.forEach(cb => {
      const courseId = cb.dataset.courseId;
      const course = courses.find(c => c.id === courseId);
      if (!course) return;
      
      const matchesSearch = this.searchQuery === '' ||
        course.name.toLowerCase().includes(this.searchQuery) ||
        course.code.toLowerCase().includes(this.searchQuery);
      
      cb.style.display = matchesSearch ? '' : 'none';
    });
  }
  
  selectAll() {
    const checkboxes = this.semesterList.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(cb => {
      cb.checked = true;
      this.passedCourses.add(cb.dataset.courseId);
    });
    this.savePassedCourses();
    this.updateStats();
    this.onPassedCoursesChange(this.passedCourses);
    this.renderSemesters();
  }
  
  clearAll() {
    this.passedCourses.clear();
    this.savePassedCourses();
    this.updateStats();
    this.onPassedCoursesChange(this.passedCourses);
    this.renderSemesters();
  }
  
  updateStats() {
    const passedCount = document.getElementById('headerPassedCount');
    
    if (passedCount) {
      let passedCredits = 0;
      this.passedCourses.forEach(id => {
        const c = courseMap.get(id);
        if (c) passedCredits += c.credit;
      });
      passedCount.textContent = passedCredits;
    }
    
    // Update semester counts
    this.semesterList.querySelectorAll('.semester-group').forEach(group => {
      const semesterName = group.dataset.semester;
      const checkboxes = group.querySelectorAll('input[type="checkbox"]');
      const checked = [...checkboxes].filter(cb => cb.checked).length;
      const countEl = group.querySelector('.semester-count');
      if (countEl) countEl.textContent = `${checked}/${checkboxes.length}`;
    });
  }
  
  loadPassedCourses() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return new Set(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Error loading passed courses:', e);
    }
    return new Set();
  }
  
  savePassedCourses() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...this.passedCourses]));
    } catch (e) {
      console.error('Error saving passed courses:', e);
    }
  }
  
  getPassedCourses() {
    return this.passedCourses;
  }
}
