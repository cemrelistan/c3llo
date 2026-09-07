// Graph - D3.js DAG Ders Bağlantı Grafiği
import * as d3 from 'd3';
import { courses, courseMap, COURSE_TYPES, getAvailableCourses } from '../data/courses.js';

function extractPrereqs(course) {
  if (!course.rawPrereq) return [];
  const regex = /(?:([A-Z]{3,4}\s\d+[A-Z]?)(?=MIN\.\s*[A-Z]{2}))|([A-Z]{3,4}\s\d+[A-Z]?)/g;
  
  const unique = new Set();
  let match;
  while ((match = regex.exec(course.rawPrereq)) !== null) {
      if (match[1]) unique.add(match[1]);
      else if (match[2]) unique.add(match[2]);
  }
  
  return [...unique].map(code => {
    const id = code.replace(' ', '_');
    if (courseMap.has(id)) return id;
    if (id.endsWith('E') && courseMap.has(id.substring(0, id.length - 1))) return id.substring(0, id.length - 1);
    if (!id.endsWith('E') && courseMap.has(id + 'E')) return id + 'E';
    return id;
  }).filter(id => courseMap.has(id));
}

function buildPrerequisiteEdges() {
  const edges = [];
  courses.forEach(course => {
    const prereqs = extractPrereqs(course);
    prereqs.forEach(prereqId => {
      edges.push({ source: prereqId, target: course.id });
    });
  });
  return edges;
}

function getConnectionCount(courseId) {
  const edges = buildPrerequisiteEdges();
  return edges.filter(e => e.source === courseId || e.target === courseId).length;
}

export class CourseGraph {
  constructor(containerId, svgId) {
    this.container = document.getElementById(containerId);
    this.svgElement = document.getElementById(svgId);
    this.passedCourses = new Set();
    this.activeFilter = 'all';
    this.simulation = null;
    this.tooltip = document.getElementById('tooltip');

    this.init();
  }

  init() {
    this.setupSvg();
    this.bindControls();
    this.render();
  }

  setupSvg() {
    const rect = this.container.getBoundingClientRect();
    this.width = rect.width || 1200;
    this.height = rect.height || 700;

    this.svg = d3.select(this.svgElement)
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', `0 0 ${this.width} ${this.height}`);

    // Clear existing
    this.svg.selectAll('*').remove();

    // Defs for arrow markers and gradients
    const defs = this.svg.append('defs');

    // Arrow marker
    defs.append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '-0 -5 10 10')
      .attr('refX', 20)
      .attr('refY', 0)
      .attr('orient', 'auto')
      .attr('markerWidth', 8)
      .attr('markerHeight', 8)
      .append('path')
      .attr('d', 'M 0,-5 L 10,0 L 0,5')
      .attr('fill', '#4a5568');

    // Glow filter
    const filter = defs.append('filter')
      .attr('id', 'glow')
      .attr('x', '-50%')
      .attr('y', '-50%')
      .attr('width', '200%')
      .attr('height', '200%');
    filter.append('feGaussianBlur')
      .attr('stdDeviation', '3')
      .attr('result', 'coloredBlur');
    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // Available pulse filter
    const pulseFilter = defs.append('filter')
      .attr('id', 'pulse-glow')
      .attr('x', '-100%')
      .attr('y', '-100%')
      .attr('width', '300%')
      .attr('height', '300%');
    pulseFilter.append('feGaussianBlur')
      .attr('stdDeviation', '4')
      .attr('result', 'coloredBlur');
    const pulseMerge = pulseFilter.append('feMerge');
    pulseMerge.append('feMergeNode').attr('in', 'coloredBlur');
    pulseMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // Zoom behavior
    this.zoom = d3.zoom()
      .scaleExtent([0.3, 3])
      .on('zoom', (event) => {
        this.g.attr('transform', event.transform);
      });

    this.svg.call(this.zoom);

    // Main group
    this.g = this.svg.append('g');
  }

  bindControls() {
    document.getElementById('zoomIn')?.addEventListener('click', () => {
      this.svg.transition().duration(300).call(this.zoom.scaleBy, 1.3);
    });

    document.getElementById('zoomOut')?.addEventListener('click', () => {
      this.svg.transition().duration(300).call(this.zoom.scaleBy, 0.7);
    });

    document.getElementById('resetView')?.addEventListener('click', () => {
      this.svg.transition().duration(500).call(
        this.zoom.transform,
        d3.zoomIdentity.translate(this.width / 2, this.height / 2).scale(0.8).translate(-this.width / 2, -this.height / 2)
      );
    });

    // Filter buttons
    document.getElementById('graphFilterBar')?.addEventListener('click', (e) => {
      const btn = e.target.closest('.filter-btn');
      if (!btn) return;

      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      this.activeFilter = btn.dataset.filter;
      this.applyFilter();
    });
  }

  getNodeColor(course) {
    switch (course.type) {
      case COURSE_TYPES.MANDATORY: return '#00d4ff';
      case COURSE_TYPES.RESTRICTED_ELECTIVE: return '#a855f7';
      case COURSE_TYPES.ELECTIVE: return '#10b981';
      case COURSE_TYPES.ITB: return '#f59e0b';
      case COURSE_TYPES.DIL: return '#ec4899';
      case COURSE_TYPES.GENERAL: return '#64748b';
      default: return '#64748b';
    }
  }

  getNodeRadius(courseId) {
    const connections = getConnectionCount(courseId);
    return Math.max(18, Math.min(35, 18 + connections * 2.5));
  }

  render() {
    this.g.selectAll('*').remove();

    const edges = buildPrerequisiteEdges();
    const availableCourses = getAvailableCourses([...this.passedCourses]);
    const availableSet = new Set(availableCourses.map(c => c.id));

    // Create nodes with semester-based positioning
    const nodes = courses.map(course => {
      const connections = getConnectionCount(course.id);
      // Position based on semester (x) and some offset (y)
      const semesterX = (course.semester - 1) * (this.width / 9) + 100;
      
      return {
        id: course.id,
        course: course,
        connections: connections,
        x: semesterX + (Math.random() - 0.5) * 40,
        y: this.height / 2 + (Math.random() - 0.5) * 300
      };
    });

    const nodeMap = new Map(nodes.map(n => [n.id, n]));

    // Create links referencing node objects
    const links = edges
      .filter(e => nodeMap.has(e.source) && nodeMap.has(e.target))
      .map(e => ({
        source: nodeMap.get(e.source),
        target: nodeMap.get(e.target)
      }));

    // Force simulation with semester-based x positioning
    this.simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id(d => d.id).distance(100).strength(0.5))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('x', d3.forceX(d => {
        const sem = d.course.semester;
        return sem * (this.width / 10) + 50;
      }).strength(0.7))
      .force('y', d3.forceY(this.height / 2).strength(0.1))
      .force('collision', d3.forceCollide().radius(d => this.getNodeRadius(d.id) + 5));

    // Draw links
    const link = this.g.append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('class', 'link')
      .attr('stroke', '#2d3561')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', 1.5)
      .attr('marker-end', 'url(#arrowhead)');

    // Draw node groups
    const node = this.g.append('g')
      .attr('class', 'nodes')
      .selectAll('g')
      .data(nodes)
      .join('g')
      .attr('class', 'node-group')
      .attr('cursor', 'pointer')
      .call(d3.drag()
        .on('start', (event, d) => this.dragStarted(event, d))
        .on('drag', (event, d) => this.dragged(event, d))
        .on('end', (event, d) => this.dragEnded(event, d))
      );

    // Node circles
    node.append('circle')
      .attr('r', d => this.getNodeRadius(d.id))
      .attr('fill', d => {
        if (this.passedCourses.has(d.id)) return '#1a1f36';
        return this.getNodeColor(d.course);
      })
      .attr('stroke', d => {
        if (this.passedCourses.has(d.id)) return '#10b981';
        if (availableSet.has(d.id)) return '#fff';
        return 'rgba(255,255,255,0.3)';
      })
      .attr('stroke-width', d => {
        if (this.passedCourses.has(d.id)) return 3;
        if (availableSet.has(d.id)) return 2.5;
        return 1.5;
      })
      .attr('opacity', d => {
        if (this.passedCourses.has(d.id)) return 0.7;
        return 0.9;
      })
      .attr('filter', d => {
        if (availableSet.has(d.id)) return 'url(#pulse-glow)';
        return null;
      });

    // Passed check mark
    node.filter(d => this.passedCourses.has(d.id))
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('fill', '#10b981')
      .attr('font-size', d => this.getNodeRadius(d.id) * 0.7)
      .attr('font-weight', 'bold')
      .text('✓');

    // Node labels (course name)
    node.filter(d => !this.passedCourses.has(d.id))
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('fill', d => {
        const color = this.getNodeColor(d.course);
        // Darken for readability on colored background
        return '#fff';
      })
      .attr('font-size', d => {
        const r = this.getNodeRadius(d.id);
        return Math.max(6, Math.min(9, r * 0.4));
      })
      .attr('font-weight', '600')
      .text(d => {
        const name = d.course.name;
        // Truncate if too long
        const maxLen = Math.floor(this.getNodeRadius(d.id) * 0.6);
        return name.length > maxLen ? name.substring(0, maxLen - 1) + '…' : name;
      });

    // Name label below node
    node.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', d => this.getNodeRadius(d.id) + 14)
      .attr('fill', 'var(--text-secondary)')
      .attr('font-size', '9px')
      .attr('font-weight', '500')
      .text(d => d.course.code);

    // Hover events
    node.on('mouseover', (event, d) => this.showTooltip(event, d))
        .on('mouseout', () => this.hideTooltip())
        .on('click', (event, d) => this.highlightConnections(d));

    // Simulation tick
    this.simulation.on('tick', () => {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);

      node.attr('transform', d => `translate(${d.x},${d.y})`);
    });

    // Store refs
    this.nodeSelection = node;
    this.linkSelection = link;
    this.nodes = nodes;
    this.links = links;

    // Initial zoom to fit
    setTimeout(() => {
      this.svg.transition().duration(800).call(
        this.zoom.transform,
        d3.zoomIdentity.translate(50, 50).scale(0.75)
      );
    }, 500);
  }

  showTooltip(event, d) {
    const course = d.course;
    const isPassed = this.passedCourses.has(d.id);
    const available = getAvailableCourses([...this.passedCourses]);
    const isAvailable = available.some(c => c.id === d.id);

    const prereqIds = extractPrereqs(course);
    const prereqNames = prereqIds
      .map(id => courseMap.get(id))
      .filter(Boolean)
      .map(c => c.name)
      .join(', ');

    let statusHtml = '';
    if (isPassed) {
      statusHtml = '<div style="color:#10b981;font-weight:600;margin-top:4px;">✓ Verilmiş</div>';
    } else if (isAvailable) {
      statusHtml = '<div style="color:#00d4ff;font-weight:600;margin-top:4px;">◉ Alınabilir</div>';
    } else {
      const unmetIds = prereqIds.filter(id => !this.passedCourses.has(id));
      const unmetNames = unmetIds.map(id => courseMap.get(id)).filter(Boolean).map(c => c.code).join(', ');
      
      statusHtml = `<div style="color:#ef4444;font-weight:600;margin-top:4px;">🔒 Önşart karşılanmamış`;
      if (unmetNames) statusHtml += ` (Eksik: ${unmetNames})`;
      statusHtml += `</div>`;
    }

    this.tooltip.innerHTML = `
      <h4 style="color:${this.getNodeColor(course)}">${course.name}</h4>
      <div style="color:var(--text-muted);font-size:0.75rem;margin-bottom:6px;">${course.code}</div>
      <div style="display:flex;gap:12px;margin-bottom:6px;">
        <span>Kredi: <strong>${course.credit}</strong></span>
        <span>AKTS: <strong>${course.ects}</strong></span>
      </div>
      ${prereqNames ? `<div style="font-size:0.8rem;color:var(--text-secondary);">Önşart: ${prereqNames}</div>` : ''}
      ${statusHtml}
      <div style="font-size:0.7rem;color:var(--text-muted);margin-top:4px;">Bağlantı: ${d.connections} ders</div>
    `;
    this.tooltip.style.display = 'block';
    this.tooltip.style.left = (event.pageX + 15) + 'px';
    this.tooltip.style.top = (event.pageY - 10) + 'px';
    this.tooltip.classList.add('visible');
  }

  hideTooltip() {
    this.tooltip.classList.remove('visible');
    setTimeout(() => {
      if (!this.tooltip.classList.contains('visible')) {
        this.tooltip.style.display = 'none';
      }
    }, 200);
  }

  highlightConnections(d) {
    const courseId = d.id;

    // Reset all
    this.nodeSelection.selectAll('circle')
      .attr('opacity', 0.3);
    this.linkSelection
      .attr('stroke-opacity', 0.1)
      .attr('stroke-width', 1);

    // Find connected nodes
    const connectedIds = new Set([courseId]);
    // Prerequisites (upstream)
    const course = courseMap.get(courseId);
    if (course) {
      extractPrereqs(course).forEach(id => connectedIds.add(id));
    }
    // Dependents (downstream)
    courses.forEach(c => {
      if (extractPrereqs(c).includes(courseId)) {
        connectedIds.add(c.id);
      }
    });

    // Highlight connected
    this.nodeSelection.selectAll('circle')
      .attr('opacity', nd => connectedIds.has(nd.id) ? 1 : 0.15);

    this.linkSelection
      .attr('stroke-opacity', l =>
        (connectedIds.has(l.source.id) && connectedIds.has(l.target.id)) ? 1 : 0.05
      )
      .attr('stroke-width', l =>
        (connectedIds.has(l.source.id) && connectedIds.has(l.target.id)) ? 2.5 : 1
      )
      .attr('stroke', l =>
        (connectedIds.has(l.source.id) && connectedIds.has(l.target.id)) ? '#00d4ff' : '#2d3561'
      );

    // Click elsewhere to reset
    this.svg.on('click.reset', (event) => {
      if (event.target === this.svgElement) {
        this.resetHighlight();
        this.svg.on('click.reset', null);
      }
    });
  }

  resetHighlight() {
    this.nodeSelection.selectAll('circle')
      .attr('opacity', d => this.passedCourses.has(d.id) ? 0.7 : 0.9);
    this.linkSelection
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', 1.5)
      .attr('stroke', '#2d3561');
  }

  applyFilter() {
    if (this.activeFilter === 'all') {
      this.nodeSelection.style('display', null);
      this.linkSelection.style('display', null);
      return;
    }

    const visibleIds = new Set();
    this.nodeSelection.each(function(d) {
      const visible = d.course.type === this.activeFilter;
      d3.select(this.parentNode).style('display', visible ? null : 'none');
      if (visible) visibleIds.add(d.id);
    }.bind({ activeFilter: this.activeFilter }));

    // Fix: use proper filter
    this.nodeSelection.style('display', d => {
      return d.course.type === this.activeFilter ? null : 'none';
    });

    this.linkSelection.style('display', l => {
      return (visibleIds.has(l.source.id) && visibleIds.has(l.target.id)) ? null : 'none';
    });
  }

  update(passedCourses) {
    this.passedCourses = passedCourses;
    this.render();
  }

  dragStarted(event, d) {
    if (!event.active) this.simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  dragged(event, d) {
    d.fx = event.x;
    d.fy = event.y;
  }

  dragEnded(event, d) {
    if (!event.active) this.simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }

  resize() {
    const rect = this.container.getBoundingClientRect();
    this.width = rect.width || 1200;
    this.height = rect.height || 700;
    this.svg.attr('viewBox', `0 0 ${this.width} ${this.height}`);
  }
}
