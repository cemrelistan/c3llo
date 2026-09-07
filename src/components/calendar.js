// Calendar - Haftalık Takvim Oluşturucu
import { courses, courseMap, COURSE_TYPES, arePrerequisitesMet } from '../data/courses.js';
import { scheduleData, getScheduleByCourseId, DAY_NAMES, TIME_SLOTS, hasTimeConflict } from '../data/schedule.js';

export class Calendar {
  constructor() {
    this.passedCourses = new Set();
    this.selectedCourses = new Map(); // courseId -> { course, timeSlots }
    this.courseTypeFilter = 'all';

    this.weeklyCalendar = document.getElementById('weeklyCalendar');
    this.courseCardsList = document.getElementById('courseCardsList');
    this.courseTypeFilterEl = document.getElementById('courseTypeFilter');
    this.availableBadge = document.getElementById('availableBadge');

    this.init();
  }

  init() {
    this.renderCalendarGrid();
    this.bindEvents();
  }

  bindEvents() {
    this.courseTypeFilterEl?.addEventListener('change', (e) => {
      this.courseTypeFilter = e.target.value;
      this.renderAvailableCourses();
    });
  }

  renderCalendarGrid() {
    let html = '';

    // Header row
    html += '<div class="calendar-header" style="grid-column: 1; grid-row: 1;"></div>';
    DAY_NAMES.forEach((day, i) => {
      html += `<div class="calendar-header" style="grid-column: ${i + 2}; grid-row: 1;">${day}</div>`;
    });

    // Time rows
    for (let t = 0; t < TIME_SLOTS.length; t++) {
      const time = TIME_SLOTS[t];
      const nextTime = TIME_SLOTS[t + 1] || `${parseInt(time) + 1}:30`;
      html += `<div class="time-slot" style="grid-column: 1; grid-row: ${t + 2};">${time}</div>`;

      for (let d = 0; d < 5; d++) {
        html += `<div class="calendar-cell" data-day="${d}" data-time="${t}" style="grid-column: ${d + 2}; grid-row: ${t + 2};" id="cell_${d}_${t}"></div>`;
      }
    }

    this.weeklyCalendar.innerHTML = html;
  }

  renderAvailableCourses() {
    const passedArr = [...this.passedCourses];
    const openCourses = courses.filter(c => !this.passedCourses.has(c.id) && getScheduleByCourseId(c.id).length > 0);

    let filtered = openCourses;
    if (this.courseTypeFilter !== 'all') {
      filtered = openCourses.filter(c => c.type === this.courseTypeFilter);
    }

    this.availableBadge.textContent = filtered.length;

    if (filtered.length === 0) {
      this.courseCardsList.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">📭</div>
          <p>Alınabilecek açık ders bulunamadı</p>
          <p style="font-size:0.8rem;margin-top:8px;color:var(--text-muted);">Önşartlarını sağladığınız açık ders yok veya tümünü verdiniz.</p>
        </div>
      `;
      return;
    }

    this.courseCardsList.innerHTML = filtered.map(course => {
      const isSelected = this.selectedCourses.has(course.id);
      const schedule = getScheduleByCourseId(course.id);
      const hasSchedule = schedule.length > 0;
      const typeClass = this.getTypeClass(course.type);
      const isMet = arePrerequisitesMet(course.id, passedArr);

      let scheduleInfo = '';
      if (hasSchedule) {
        const crns = {};
        schedule.forEach(s => {
          if (!crns[s.crn]) crns[s.crn] = [];
          crns[s.crn].push(s);
        });
        const crnList = Object.keys(crns);
        
        if (crnList.length > 1) {
          scheduleInfo = `
            <select class="section-selector" id="sec_${course.id}" style="width: 100%; margin: 8px 0 4px 0; font-size: 0.8rem; padding: 4px; border-radius: 4px; background: rgba(0,0,0,0.2); border: 1px solid var(--border-color); color: var(--text-primary);" onclick="event.stopPropagation()">
              ${crnList.map(crn => {
                const times = crns[crn].map(s => `${s.day.substring(0,3)} ${s.timeStart}`).join(', ');
                return `<option value="${crn}">CRN: ${crn} (${times})</option>`;
              }).join('')}
            </select>
          `;
        } else {
          const uniqueSlots = new Set(schedule.map(s => `${s.day} ${s.timeStart}-${s.timeEnd}`));
          const slotsHtml = Array.from(uniqueSlots).join('<br>');
          scheduleInfo = `<div class="course-schedule-info">${slotsHtml}</div>`;
        }
      }

      let prereqMsg = 'Önşart sağlanmadı';
      if (!isMet && course.rawPrereq) {
        let pStr = course.rawPrereq;
        const nIdx = pStr.indexOf(course.name);
        if (nIdx !== -1) {
          pStr = pStr.substring(nIdx + course.name.length);
        } else {
          const m = pStr.match(/(\(|[A-Z]{3,4}\s\d+[A-Z]?)/);
          if (m) pStr = pStr.substring(m.index);
        }
        pStr = pStr.replace(/MIN\.\s*[A-Z]{2}/g, '').replace(/Veya/g, ' Veya ').replace(/Ve/g, ' Ve ').replace(/\)/g, ') ').replace(/\(/g, ' (');
        prereqMsg = `Eksik: ${pStr.trim()}`;
      }

      return `
        <div class="course-card ${typeClass} ${isSelected ? 'selected' : ''}"
             style="${!isMet ? 'opacity: 0.5; cursor: not-allowed; filter: grayscale(1);' : ''}"
             data-course-id="${course.id}"
             onclick="${!isMet ? '' : `window.calendarInstance.toggleCourse('${course.id}')`}">
          <div class="course-card-header" style="display: block; margin-bottom: 8px;">
            <div style="font-size: 0.95rem; font-weight: 600; color: var(--text-primary); line-height: 1.3; word-break: break-word;">
              ${!isMet ? '🔒 ' : ''}${course.name}
            </div>
          </div>
          <div class="course-title" style="color: var(--text-muted); font-size: 0.75rem;">
            ${course.code} • ${course.credit} Kr / ${course.ects} AKTS
          </div>
          ${scheduleInfo}
          <div class="course-card-actions" style="margin-top:8px;display:flex;justify-content:flex-end;align-items:center;">
            ${!isMet ? `<span style="font-size: 0.7rem; color: #ff6b6b; margin-right: 4px; line-height:1.2; flex:1;">${prereqMsg}</span>` : ''}
            <button class="btn-select-course ${isSelected ? 'btn-remove' : ''}" ${!isMet ? 'disabled style="opacity:0.5"' : ''} onclick="${!isMet ? '' : `event.stopPropagation(); window.calendarInstance.toggleCourse('${course.id}')`}">
              ${isSelected ? '✕ Kaldır' : '+ Ekle'}
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  toggleCourse(courseId) {
    if (this.selectedCourses.has(courseId)) {
      this.selectedCourses.delete(courseId);
    } else {
      const course = courseMap.get(courseId);
      if (!course) return;

      const schedule = getScheduleByCourseId(courseId);
      
      let selectedCrn = null;
      const selectEl = document.getElementById(`sec_${courseId}`);
      if (selectEl) {
         selectedCrn = selectEl.value;
      } else if (schedule.length > 0) {
         selectedCrn = schedule[0].crn;
      }

      const crnSchedule = selectedCrn ? schedule.filter(s => s.crn === selectedCrn) : schedule;

      this.selectedCourses.set(courseId, {
        course,
        timeSlots: crnSchedule.map(s => ({
          day: s.day,
          timeStart: s.timeStart,
          timeEnd: s.timeEnd,
          building: s.building,
          classroom: s.classroom,
          instructor: s.instructor
        }))
      });
    }

    this.renderAvailableCourses();
    this.renderCalendarEvents();
    this.updateStats();
  }

  addManualTime(courseId, btn) {
    const card = btn.closest('.course-card');
    const daySelect = card.querySelector(`select[data-course="${courseId}"]`);
    const startInput = card.querySelector(`input[data-field="start"][data-course="${courseId}"]`);
    const endInput = card.querySelector(`input[data-field="end"][data-course="${courseId}"]`);

    const day = daySelect.value;
    const timeStart = startInput.value;
    const timeEnd = endInput.value;

    if (!day || !timeStart || !timeEnd) return;

    const course = courseMap.get(courseId);
    if (!course) return;

    if (!this.selectedCourses.has(courseId)) {
      this.selectedCourses.set(courseId, {
        course,
        timeSlots: []
      });
    }

    this.selectedCourses.get(courseId).timeSlots.push({
      day,
      timeStart,
      timeEnd,
      building: '',
      classroom: '',
      instructor: ''
    });

    this.renderAvailableCourses();
    this.renderCalendarEvents();
    this.updateStats();
  }

  renderCalendarEvents() {
    // Clear all events
    document.querySelectorAll('.calendar-event').forEach(el => el.remove());

    // Check for conflicts
    const allSlots = [];
    for (const [courseId, data] of this.selectedCourses) {
      for (const slot of data.timeSlots) {
        allSlots.push({ courseId, course: data.course, ...slot });
      }
    }

    const conflicts = new Set();
    for (let i = 0; i < allSlots.length; i++) {
      for (let j = i + 1; j < allSlots.length; j++) {
        if (hasTimeConflict(allSlots[i], allSlots[j])) {
          conflicts.add(allSlots[i].courseId);
          conflicts.add(allSlots[j].courseId);
        }
      }
    }

    // Render events
    for (const slot of allSlots) {
      const dayIndex = DAY_NAMES.indexOf(slot.day);
      if (dayIndex === -1) continue;

      const startMinutes = this.timeToMinutes(slot.timeStart);
      const endMinutes = this.timeToMinutes(slot.timeEnd);
      const gridStartMinute = 8 * 60 + 30; // 08:30

      const startRow = Math.floor((startMinutes - gridStartMinute) / 60) + 2;
      const endRow = Math.ceil((endMinutes - gridStartMinute) / 60) + 2;
      const rowSpan = endRow - startRow;

      if (startRow < 2 || rowSpan <= 0) continue;

      const typeClass = this.getTypeClass(slot.course.type);
      const isConflict = conflicts.has(slot.courseId);

      const eventEl = document.createElement('div');
      eventEl.className = `calendar-event ${typeClass} ${isConflict ? 'conflict' : ''}`;
      eventEl.style.gridColumn = `${dayIndex + 2}`;
      eventEl.style.gridRow = `${startRow} / span ${rowSpan}`;
      eventEl.style.position = 'relative';

      eventEl.innerHTML = `
        <div class="calendar-event-title">${slot.course.name}</div>
        <div class="calendar-event-location">${slot.timeStart} - ${slot.timeEnd}</div>
        ${slot.building ? `<div class="calendar-event-location">${slot.building} ${slot.classroom || ''}</div>` : ''}
      `;

      this.weeklyCalendar.appendChild(eventEl);
    }

    // Update conflict indicator
    const conflictIndicator = document.getElementById('conflictIndicator');
    const conflictCount = document.getElementById('conflictCount');
    if (conflicts.size > 0) {
      conflictIndicator.style.display = '';
      conflictCount.textContent = conflicts.size;
    } else {
      conflictIndicator.style.display = 'none';
    }
  }

  updateStats() {
    const selectedCount = document.getElementById('selectedCourseCount');
    const totalCredits = document.getElementById('totalCredits');
    const totalECTS = document.getElementById('totalECTS');
    const headerAvailableCount = document.getElementById('headerAvailableCount');

    let credits = 0;
    let ects = 0;

    for (const [, data] of this.selectedCourses) {
      credits += data.course.credit;
      ects += data.course.ects;
    }

    if (selectedCount) selectedCount.textContent = this.selectedCourses.size;
    if (totalCredits) totalCredits.textContent = credits;
    if (totalECTS) totalECTS.textContent = ects;
    if (headerAvailableCount) {
      headerAvailableCount.textContent = credits;
      window.app?.updateTotalCredits?.();
    }
  }

  getTypeClass(type) {
    switch (type) {
      case COURSE_TYPES.MANDATORY: return 'mandatory';
      case COURSE_TYPES.RESTRICTED_ELECTIVE: return 'restricted';
      case COURSE_TYPES.ELECTIVE: return 'elective';
      case COURSE_TYPES.ITB: return 'itb';
      case COURSE_TYPES.DIL: return 'dil';
      default: return '';
    }
  }

  timeToMinutes(time) {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  }

  update(passedCourses) {
    this.passedCourses = passedCourses;
    // Clear selected courses that are now passed
    for (const courseId of this.selectedCourses.keys()) {
      if (passedCourses.has(courseId)) {
        this.selectedCourses.delete(courseId);
      }
    }
    this.renderAvailableCourses();
    this.renderCalendarEvents();
    this.updateStats();
  }
}
