// Ders Sihirbazı - Ana Uygulama
import './styles/index.css';
import { Sidebar } from './components/sidebar.js';
import { CourseGraph } from './components/graph.js';
import { Calendar } from './components/calendar.js';

class App {
  constructor() {
    this.activeTab = 'graph';
    this.graph = null;
    this.calendar = null;
    this.sidebar = null;

    this.init();
  }

  init() {
    // Initialize sidebar with callback
    this.sidebar = new Sidebar((passedCourses) => {
      this.onPassedCoursesChange(passedCourses);
    });

    // Initialize graph
    this.graph = new CourseGraph('graphContainer', 'graphSvg');

    // Initialize calendar
    this.calendar = new Calendar();
    // Make calendar accessible globally for onclick handlers
    window.calendarInstance = this.calendar;

    // Bind tab navigation
    this.bindTabs();

    // Handle resize
    window.addEventListener('resize', () => {
      if (this.activeTab === 'graph' && this.graph) {
        this.graph.resize();
      }
    });

    // Trigger initial update with saved passed courses
    const passedCourses = this.sidebar.getPassedCourses();
    this.onPassedCoursesChange(passedCourses);

    console.log('🧙 Ders Sihirbazı başlatıldı!');
  }

  bindTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        this.activeTab = tab;

        // Update buttons
        tabButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Update content
        tabContents.forEach(tc => tc.classList.remove('active'));
        const targetContent = document.getElementById(`${tab}Tab`);
        if (targetContent) targetContent.classList.add('active');

        // Resize graph if switching to graph tab
        if (tab === 'graph' && this.graph) {
          setTimeout(() => this.graph.resize(), 100);
        }
      });
    });
  }

  onPassedCoursesChange(passedCourses) {
    // Update graph
    if (this.graph) {
      this.graph.update(passedCourses);
    }

    // Update calendar
    if (this.calendar) {
      this.calendar.update(passedCourses);
    }
    
    this.updateTotalCredits();
  }
  
  updateTotalCredits() {
    setTimeout(() => {
      const headerPassedCount = document.getElementById('headerPassedCount');
      const headerAvailableCount = document.getElementById('headerAvailableCount');
      const headerTotalCount = document.getElementById('headerTotalCount');
      
      if (headerPassedCount && headerAvailableCount && headerTotalCount) {
        const passed = parseFloat(headerPassedCount.textContent) || 0;
        const available = parseFloat(headerAvailableCount.textContent) || 0;
        headerTotalCount.textContent = passed + available;
      }
    }, 100);
  }
}

// Start the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
});
