/**
 * @fileoverview Smart Stadium Wayfinding Module
 * SVG-based interactive map with AI turn-by-turn directions
 * Supports seat finding, facility navigation, and accessibility routes
 */

'use strict';

const Wayfinding = (() => {

  let svgMap = null;
  let activeRoute = null;
  let activeStep = 0;
  let pathAnimationId = null;

  /* =========================================================================
   * FACILITY DATABASE (map coordinates for routing)
   * ========================================================================= */
  const FACILITIES = {
    'gate-a':    { id: 'gate-a',    label: 'Gate A (North)',      x: 380, y:  45, icon: '🚪', type: 'gate',      accessible: true  },
    'gate-b':    { id: 'gate-b',    label: 'Gate B (East)',       x: 737, y: 290, icon: '🚪', type: 'gate',      accessible: true  },
    'gate-c':    { id: 'gate-c',    label: 'Gate C (South)',      x: 460, y: 532, icon: '🚪', type: 'gate',      accessible: true  },
    'gate-d':    { id: 'gate-d',    label: 'Gate D (West)',       x: 102, y: 290, icon: '🚪', type: 'gate',      accessible: true  },
    'first-aid-1':{ id:'first-aid-1',label:'First Aid (North)',   x: 237, y: 175, icon: '🏥', type: 'medical',   accessible: true  },
    'first-aid-2':{ id:'first-aid-2',label:'First Aid (South)',   x: 602, y: 405, icon: '🏥', type: 'medical',   accessible: true  },
    'toilet-n':  { id: 'toilet-n',  label: 'Restroom (North)',    x: 332, y: 105, icon: '🚻', type: 'restroom',  accessible: true  },
    'toilet-s':  { id: 'toilet-s',  label: 'Restroom (South)',    x: 502, y: 460, icon: '🚻', type: 'restroom',  accessible: true  },
    'toilet-e':  { id: 'toilet-e',  label: 'Restroom (East)',     x: 658, y: 220, icon: '🚻', type: 'restroom',  accessible: false },
    'toilet-w':  { id: 'toilet-w',  label: 'Restroom (West)',     x: 182, y: 360, icon: '🚻', type: 'restroom',  accessible: false },
    'food-n':    { id: 'food-n',    label: 'Concession (North)',  x: 300, y: 108, icon: '🍔', type: 'food',      accessible: true  },
    'food-s':    { id: 'food-s',    label: 'Concession (South)',  x: 540, y: 460, icon: '🍔', type: 'food',      accessible: true  },
    'food-e':    { id: 'food-e',    label: 'Concession (East)',   x: 657, y: 175, icon: '🍔', type: 'food',      accessible: true  },
    'food-w':    { id: 'food-w',    label: 'Concession (West)',   x: 183, y: 175, icon: '🍔', type: 'food',      accessible: true  },
    'halal':     { id: 'halal',     label: 'Halal Station',       x: 695, y: 290, icon: '🌙', type: 'food',      accessible: true  },
    'vegan':     { id: 'vegan',     label: 'Green/Vegan Bar',     x: 240, y: 405, icon: '🌱', type: 'food',      accessible: true  },
    'elev-a':    { id: 'elev-a',    label: 'Elevator (Gate A)',   x: 370, y:  75, icon: '🛗', type: 'elevator',  accessible: true  },
    'elev-b':    { id: 'elev-b',    label: 'Elevator (Gate B)',   x: 710, y: 260, icon: '🛗', type: 'elevator',  accessible: true  },
    'elev-c':    { id: 'elev-c',    label: 'Elevator (Gate C)',   x: 450, y: 505, icon: '🛗', type: 'elevator',  accessible: true  },
    'elev-d':    { id: 'elev-d',    label: 'Elevator (Gate D)',   x: 128, y: 260, icon: '🛗', type: 'elevator',  accessible: true  },
    'atm-a':     { id: 'atm-a',     label: 'ATM (Gate A)',        x: 420, y:  55, icon: '💳', type: 'atm',       accessible: true  },
    'atm-c':     { id: 'atm-c',     label: 'ATM (Gate C)',        x: 490, y: 520, icon: '💳', type: 'atm',       accessible: true  },
    'lost-found':{ id:'lost-found', label:'Lost & Found Desk',   x: 350, y:  55, icon: '🔍', type: 'info',      accessible: true  },
    'family-zone':{ id:'family-zone',label:'Family Zone',         x: 237, y: 115, icon: '👨‍👩‍👧', type:'family',    accessible: true  },
    'fan-zone':  { id: 'fan-zone',  label: 'Fan Zone Plaza',      x: 420, y: 565, icon: '🎉', type: 'fanzone',   accessible: true  },
    'store':     { id: 'store',     label: 'Official FIFA Store', x: 695, y: 180, icon: '👕', type: 'shopping',  accessible: true  },
    'exit-n':    { id: 'exit-n',    label: 'Emergency Exit N',   x: 280, y:  35, icon: '⬆', type: 'exit',      accessible: true  },
    'exit-s':    { id: 'exit-s',    label: 'Emergency Exit S',   x: 540, y: 532, icon: '⬇', type: 'exit',      accessible: true  }
  };

  /* =========================================================================
   * SECTIONS (seating areas for navigation)
   * ========================================================================= */
  function getSectionCoords(section) {
    const num = parseInt(section);
    if (isNaN(num)) return { x: 420, y: 290 }; // Center default

    // Map section numbers to approximate coordinates
    if (num >= 101 && num <= 112) return { x: 270 + (num - 101) * 8, y: 165 };
    if (num >= 113 && num <= 125) return { x: 200, y: 200 + (num - 113) * 18 };
    if (num >= 126 && num <= 137) return { x: 270 + (num - 126) * 8, y: 410 };
    if (num >= 138 && num <= 149) return { x: 600, y: 200 + (num - 138) * 18 };
    if (num >= 201 && num <= 249) return { x: 200 + (num - 201) * 9, y: 200 };
    if (num >= 301 && num <= 349) return { x: 200 + (num - 301) * 9, y: 230 };
    return { x: 420, y: 290 };
  }

  /* =========================================================================
   * PATHFINDING (simple waypoint-based routing)
   * ========================================================================= */

  // Concourse waypoints for routing around the ring
  const CONCOURSE_RING = [
    { x: 380, y:  80 }, // North concourse
    { x: 480, y:  80 },
    { x: 660, y: 160 }, // NE corner
    { x: 700, y: 290 }, // East concourse
    { x: 660, y: 410 }, // SE corner
    { x: 480, y: 500 }, // South concourse
    { x: 380, y: 500 },
    { x: 200, y: 410 }, // SW corner
    { x: 150, y: 290 }, // West concourse
    { x: 200, y: 160 }, // NW corner
  ];

  /**
   * Find nearest ring waypoint to a coordinate
   */
  function nearestWaypoint(x, y) {
    let best = null, bestDist = Infinity;
    for (const wp of CONCOURSE_RING) {
      const d = Math.hypot(wp.x - x, wp.y - y);
      if (d < bestDist) { bestDist = d; best = wp; }
    }
    return best;
  }

  /**
   * Build a simple path between two points via concourse
   * @param {{ x, y }} from
   * @param {{ x, y }} to
   * @returns {Array<{x, y}>}
   */
  function buildPath(from, to) {
    const startWP = nearestWaypoint(from.x, from.y);
    const endWP   = nearestWaypoint(to.x, to.y);

    const startIdx = CONCOURSE_RING.indexOf(startWP);
    const endIdx   = CONCOURSE_RING.indexOf(endWP);

    let clockwise = [], counter = [];
    let i = startIdx;
    while (i !== endIdx) {
      clockwise.push(CONCOURSE_RING[i]);
      i = (i + 1) % CONCOURSE_RING.length;
    }
    clockwise.push(CONCOURSE_RING[endIdx]);

    i = startIdx;
    while (i !== endIdx) {
      counter.push(CONCOURSE_RING[i]);
      i = (i - 1 + CONCOURSE_RING.length) % CONCOURSE_RING.length;
    }
    counter.push(CONCOURSE_RING[endIdx]);

    const route = clockwise.length <= counter.length ? clockwise : counter;
    return [from, startWP, ...route.slice(1), to];
  }

  /**
   * Calculate total path distance
   * @param {Array<{x,y}>} path
   * @returns {number}
   */
  function pathDistance(path) {
    let d = 0;
    for (let i = 1; i < path.length; i++) {
      d += Math.hypot(path[i].x - path[i-1].x, path[i].y - path[i-1].y);
    }
    return d;
  }

  /* =========================================================================
   * TURN-BY-TURN GENERATION
   * ========================================================================= */

  /**
   * Generate human-readable turn-by-turn directions
   * @param {{ x, y }} from
   * @param {Object} toFacility - Target facility object
   * @param {string} [sectionInfo]
   * @returns {Array<{icon, text}>}
   */
  function generateDirections(from, toFacility, sectionInfo = '') {
    const steps = [];
    const target = toFacility;

    // Determine gate to use
    const nearestGate = findNearestGate(from);
    const targetNearestGate = findNearestGate({ x: target.x, y: target.y });

    // Direction vector
    const dx = target.x - from.x;
    const dy = target.y - from.y;
    const angle = Math.atan2(dy, dx) * 180 / Math.PI;

    const dirStr = angle > -45 && angle < 45 ? 'east' :
                   angle >= 45 && angle < 135 ? 'south' :
                   (angle >= 135 || angle < -135) ? 'west' : 'north';

    const dirMap = { north: '↑ North', south: '↓ South', east: '→ East', west: '← West' };

    steps.push({
      icon: '📍',
      text: `Start at your current location. Head toward the ${dirMap[dirStr]} concourse.`
    });

    if (nearestGate !== targetNearestGate) {
      steps.push({ icon: '🚶', text: `Walk along the main concourse ring toward ${target.label}.` });
    }

    // Accessibility note
    if (target.accessible) {
      steps.push({ icon: '♿', text: `Accessible route available — follow the blue ♿ markers on the floor.` });
    }

    // Level change
    if (target.type === 'elevator') {
      steps.push({ icon: '🛗', text: `Use the elevator to reach your desired level. Press assist button if needed.` });
    }

    steps.push({ icon: '🎯', text: `${target.icon} **${target.label}** is ahead on your ${getRelativeDir(dx, dy)} side. Look for the ${target.type === 'gate' ? 'gate sign' : target.type === 'medical' ? 'green cross' : 'venue signage'}.` });

    const distPx = Math.hypot(target.x - from.x, target.y - from.y);
    const walkMins = Math.max(1, Math.round(distPx / 100)); // approx scale
    steps.push({ icon: '⏱', text: `Estimated walking time: **${walkMins}–${walkMins + 1} minutes**.` });

    if (sectionInfo) {
      steps.push({ icon: '💡', text: `Tip: Section ${sectionInfo} is marked with color-coded signs at every entrance. Staff in red vests are stationed at each section door.` });
    }

    return steps;
  }

  function getRelativeDir(dx, dy) {
    if (Math.abs(dx) > Math.abs(dy)) return dx > 0 ? 'right' : 'left';
    return dy > 0 ? 'left' : 'right'; // inverted for stadium layout
  }

  function findNearestGate(pos) {
    const gates = ['gate-a', 'gate-b', 'gate-c', 'gate-d'].map(id => ({
      id, ...FACILITIES[id]
    }));
    return gates.sort((a, b) =>
      Math.hypot(a.x - pos.x, a.y - pos.y) - Math.hypot(b.x - pos.x, b.y - pos.y)
    )[0].id;
  }

  /* =========================================================================
   * SVG RENDERING
   * ========================================================================= */

  /**
   * Render the stadium SVG map
   * @param {string} containerId - ID of the container element
   */
  function renderMap(containerId) {
    const container = Utils.el(containerId);
    if (!container) return;

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 840 600');
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', 'Stadium seating map with labeled zones');
    svg.style.width = '100%';
    svg.style.height = '100%';
    svg.id = 'stadium-svg';

    svg.innerHTML = `
      <defs>
        <linearGradient id="stadiumBg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#071820"/>
          <stop offset="100%" stop-color="#04090d"/>
        </linearGradient>
        <radialGradient id="glowBlue" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#00d4ff" stop-opacity="0.8"/>
          <stop offset="100%" stop-color="#00d4ff" stop-opacity="0"/>
        </radialGradient>
        <radialGradient id="glowGold" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#FFD700" stop-opacity="0.8"/>
          <stop offset="100%" stop-color="#FFD700" stop-opacity="0"/>
        </radialGradient>
        <filter id="glow">
          <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <pattern id="grassPattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
          <rect width="20" height="20" fill="#175d49"/>
          <rect width="20" height="10" fill="#1b7358"/>
        </pattern>
      </defs>

      <!-- Background -->
      <rect x="0" y="0" width="840" height="600" fill="url(#stadiumBg)" rx="12"/>
      <path d="M0 84H840M0 516H840" stroke="rgba(80, 212, 180, 0.08)" stroke-width="1"/>

      <!-- Stadium outer shell -->
      <ellipse cx="420" cy="290" rx="330" ry="255" fill="#0d2931" stroke="#2e6670" stroke-width="2"/>

      <!-- Seating sections - North Stand -->
      <rect x="200" y="75" width="440" height="80" rx="8" fill="#153944" stroke="#2d6670" stroke-width="1" aria-label="North Stand"/>
      <!-- Section labels - North -->
      <text x="310" y="120" fill="#8cc5c4" font-size="10" font-family="Inter" opacity="0.8">NORTH STAND · SECTIONS 101–125</text>

      <!-- South Stand -->
      <rect x="200" y="445" width="440" height="80" rx="8" fill="#153944" stroke="#2d6670" stroke-width="1"/>
      <text x="315" y="490" fill="#8cc5c4" font-size="10" font-family="Inter" opacity="0.8">SOUTH STAND · SECTIONS 126–149</text>

      <!-- East Stand -->
      <rect x="645" y="145" width="80" height="290" rx="8" fill="#153944" stroke="#2d6670" stroke-width="1"/>
      <text x="665" y="295" fill="#8cc5c4" font-size="10" font-family="Inter" opacity="0.8" transform="rotate(90,665,295)">EAST · SECTIONS 200–249</text>

      <!-- West Stand -->
      <rect x="115" y="145" width="80" height="290" rx="8" fill="#153944" stroke="#2d6670" stroke-width="1"/>
      <text x="158" y="295" fill="#8cc5c4" font-size="10" font-family="Inter" opacity="0.8" transform="rotate(-90,158,295)">WEST · SECTIONS 300–349</text>

      <!-- Playing field: a landscape soccer pitch, with goals on the short ends -->
      <rect x="210" y="165" width="420" height="270" rx="6" fill="url(#grassPattern)" stroke="#d7f5e8" stroke-width="2"/>
      <rect x="210" y="215" width="72" height="170" fill="none" stroke="#d7f5e8" stroke-width="1.5"/>
      <rect x="210" y="245" width="30" height="110" fill="none" stroke="#d7f5e8" stroke-width="1.5"/>
      <rect x="558" y="215" width="72" height="170" fill="none" stroke="#d7f5e8" stroke-width="1.5"/>
      <rect x="600" y="245" width="30" height="110" fill="none" stroke="#d7f5e8" stroke-width="1.5"/>
      <rect x="195" y="250" width="15" height="100" fill="rgba(215,245,232,0.12)" stroke="#d7f5e8" stroke-width="1.5"/>
      <rect x="630" y="250" width="15" height="100" fill="rgba(215,245,232,0.12)" stroke="#d7f5e8" stroke-width="1.5"/>
      <line x1="420" y1="165" x2="420" y2="435" stroke="#d7f5e8" stroke-width="1.5"/>
      <circle cx="420" cy="300" r="50" fill="none" stroke="#d7f5e8" stroke-width="1.5"/>
      <circle cx="420" cy="300" r="4" fill="#d7f5e8"/>
      <text x="420" y="306" fill="#d7f5e8" font-size="11" font-family="Outfit" text-anchor="middle" font-weight="700" letter-spacing="1.5" opacity="0.58">MATCH PITCH</text>

      <!-- Concourse paths -->
      <rect x="150" y="140" width="540" height="340" rx="2" fill="none" stroke="#1e1e3a" stroke-width="60" opacity="0.8"/>

      <!-- Route path (empty — filled by wayfinding) -->
      <g id="route-group"></g>

      <!-- User location marker (empty — set by wayfinding) -->
      <g id="user-marker"></g>

      <!-- Facility markers (injected below) -->
      <g id="facilities-group"></g>

      <!-- Compass -->
      <g transform="translate(780,50)">
        <circle r="22" fill="rgba(0,0,0,0.5)" stroke="#2a2a4a" stroke-width="1"/>
        <text x="0" y="-8" fill="#FFD700" font-size="12" text-anchor="middle" font-weight="bold">N</text>
        <text x="0" y="14" fill="rgba(255,255,255,0.4)" font-size="9" text-anchor="middle">S</text>
        <text x="-14" y="5" fill="rgba(255,255,255,0.4)" font-size="9" text-anchor="middle">W</text>
        <text x="14" y="5" fill="rgba(255,255,255,0.4)" font-size="9" text-anchor="middle">E</text>
        <line x1="0" y1="-17" x2="0" y2="-6" stroke="#FFD700" stroke-width="2"/>
      </g>

      <!-- Scale indicator -->
      <g transform="translate(660,570)">
        <line x1="0" y1="0" x2="60" y2="0" stroke="rgba(255,255,255,0.3)" stroke-width="2"/>
        <line x1="0" y1="-4" x2="0" y2="4" stroke="rgba(255,255,255,0.3)" stroke-width="1.5"/>
        <line x1="60" y1="-4" x2="60" y2="4" stroke="rgba(255,255,255,0.3)" stroke-width="1.5"/>
        <text x="30" y="-8" fill="rgba(255,255,255,0.4)" font-size="9" text-anchor="middle">~50m</text>
      </g>
    `;

    container.innerHTML = '';
    container.appendChild(svg);
    svgMap = svg;

    // Render facility markers
    renderFacilityMarkers();
  }

  /**
   * Render all facility markers on the SVG
   */
  function renderFacilityMarkers() {
    const group = svgMap?.getElementById('facilities-group');
    if (!group) return;
    group.innerHTML = '';

    Object.values(FACILITIES).forEach(f => {
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.setAttribute('transform', `translate(${f.x},${f.y})`);
      g.setAttribute('class', 'facility-marker');
      g.setAttribute('tabindex', '0');
      g.setAttribute('role', 'button');
      g.setAttribute('aria-label', f.label);
      g.style.cursor = 'pointer';

      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('r', '12');
      circle.setAttribute('fill', getFacilityColor(f.type));
      circle.setAttribute('opacity', '0.85');
      circle.setAttribute('stroke', 'rgba(255,255,255,0.3)');
      circle.setAttribute('stroke-width', '1');

      const emoji = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      emoji.setAttribute('class', 'facility-emoji');
      emoji.setAttribute('text-anchor', 'middle');
      emoji.setAttribute('dominant-baseline', 'central');
      emoji.setAttribute('font-size', '10');
      emoji.textContent = f.icon;

      // Label — hidden by default, shown on hover/focus only (prevents clutter)
      const labelBg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      const labelText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      const labelW = Math.min(f.label.length * 5.5 + 14, 120);
      labelBg.setAttribute('x', String(-labelW / 2));
      labelBg.setAttribute('y', '16');
      labelBg.setAttribute('width', String(labelW));
      labelBg.setAttribute('height', '16');
      labelBg.setAttribute('rx', '4');
      labelBg.setAttribute('fill', 'rgba(9,18,35,0.88)');
      labelBg.setAttribute('class', 'facility-label-bg');

      labelText.setAttribute('class', 'facility-label');
      labelText.setAttribute('text-anchor', 'middle');
      labelText.setAttribute('y', '27');
      labelText.setAttribute('font-size', '9');
      labelText.setAttribute('fill', '#ffffff');
      labelText.setAttribute('font-weight', '700');
      labelText.setAttribute('font-family', 'Inter,system-ui,sans-serif');
      labelText.textContent = f.label;

      // Hide labels by default — show on pointer enter / keyboard focus
      labelBg.style.display  = 'none';
      labelText.style.display = 'none';

      g.appendChild(circle);
      g.appendChild(emoji);
      g.appendChild(labelBg);
      g.appendChild(labelText);

      // Tooltip for accessibility
      const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
      title.textContent = f.label;
      g.appendChild(title);

      // Show label on hover/focus
      const showLabel = () => { labelBg.style.display = ''; labelText.style.display = ''; };
      const hideLabel = () => { labelBg.style.display = 'none'; labelText.style.display = 'none'; };
      g.addEventListener('pointerenter', showLabel);
      g.addEventListener('pointerleave', hideLabel);
      g.addEventListener('focus',        showLabel);
      g.addEventListener('blur',         hideLabel);

      g.addEventListener('click', () => navigateTo(f.id));
      g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigateTo(f.id); }});

      group.appendChild(g);
    });
  }

  function getFacilityColor(type) {
    const colors = {
      gate: '#2a52a0', medical: '#cc2222', restroom: '#1a3a8a',
      food: '#a05010', elevator: '#606010', atm: '#105050',
      info: '#304080', family: '#205050', fanzone: '#702080',
      shopping: '#503010', exit: '#802020'
    };
    return colors[type] || '#3a3a6a';
  }

  /* =========================================================================
   * ROUTE DRAWING
   * ========================================================================= */

  /**
   * Draw a route on the SVG map
   * @param {Array<{x,y}>} path - Array of waypoints
   * @param {{ x, y }} destination - Destination point
   */
  function drawRoute(path, destination) {
    const routeGroup = svgMap?.getElementById('route-group');
    if (!routeGroup) return;
    routeGroup.innerHTML = '';

    if (path.length < 2) return;

    // Path line
    const points = path.map(p => `${p.x},${p.y}`).join(' ');

    const pathEl = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
    pathEl.setAttribute('points', points);
    pathEl.setAttribute('fill', 'none');
    pathEl.setAttribute('stroke', '#00D4FF');
    pathEl.setAttribute('stroke-width', '3.5');
    pathEl.setAttribute('stroke-linecap', 'round');
    pathEl.setAttribute('stroke-linejoin', 'round');
    pathEl.setAttribute('opacity', '0.85');
    pathEl.setAttribute('class', 'route-path');

    // Animated dashes
    const length = path.reduce((acc, p, i) =>
      i === 0 ? 0 : acc + Math.hypot(p.x - path[i-1].x, p.y - path[i-1].y), 0);

    pathEl.style.strokeDasharray = length;
    pathEl.style.strokeDashoffset = length;
    pathEl.style.animation = 'drawRoute 1.8s ease forwards';

    routeGroup.appendChild(pathEl);

    // Waypoint dots
    path.slice(1, -1).forEach(p => {
      const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      dot.setAttribute('cx', p.x);
      dot.setAttribute('cy', p.y);
      dot.setAttribute('r', '4');
      dot.setAttribute('fill', '#00D4FF');
      dot.setAttribute('opacity', '0.6');
      routeGroup.appendChild(dot);
    });

    // Destination marker (pulsing)
    const destGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    destGroup.setAttribute('transform', `translate(${destination.x},${destination.y})`);

    const outerPulse = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    outerPulse.setAttribute('r', '18');
    outerPulse.setAttribute('fill', 'none');
    outerPulse.setAttribute('stroke', '#FFD700');
    outerPulse.setAttribute('stroke-width', '2');
    outerPulse.setAttribute('opacity', '0.4');
    outerPulse.style.animation = 'sosPulse 2s infinite';

    const destCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    destCircle.setAttribute('r', '10');
    destCircle.setAttribute('fill', '#FFD700');
    destCircle.setAttribute('opacity', '0.95');

    destGroup.appendChild(outerPulse);
    destGroup.appendChild(destCircle);
    routeGroup.appendChild(destGroup);

    // User start marker
    const userGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    userGroup.setAttribute('transform', `translate(${path[0].x},${path[0].y})`);
    userGroup.setAttribute('class', 'location-pin');

    const userCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    userCircle.setAttribute('r', '8');
    userCircle.setAttribute('fill', '#22C55E');

    const userText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    userText.setAttribute('text-anchor', 'middle');
    userText.setAttribute('dominant-baseline', 'central');
    userText.setAttribute('font-size', '8');
    userText.textContent = '📍';

    userGroup.appendChild(userCircle);
    userGroup.appendChild(userText);
    routeGroup.appendChild(userGroup);
  }

  /**
   * Clear the route from the map
   */
  function clearRoute() {
    const routeGroup = svgMap?.getElementById('route-group');
    if (routeGroup) routeGroup.innerHTML = '';
    activeRoute = null;
    activeStep = 0;
  }

  /* =========================================================================
   * PUBLIC NAVIGATION API
   * ========================================================================= */

  /**
   * Navigate to a facility by ID
   * @param {string} facilityId
   * @param {Object} [options]
   * @param {boolean} [options.accessibleOnly] - Prefer accessible routes
   * @param {Function} [options.onDirections] - Callback with directions array
   */
  function navigateTo(facilityId, options = {}) {
    const facility = FACILITIES[facilityId];
    if (!facility) {
      console.warn('[Wayfinding] Unknown facility:', facilityId);
      return null;
    }

    // Determine user position (simulate: at Gate A by default)
    const userPos = Utils.getStorage('ss_user_pos', { x: 380, y: 75 });

    const path = buildPath(userPos, { x: facility.x, y: facility.y });
    const directions = generateDirections(userPos, facility);

    drawRoute(path, { x: facility.x, y: facility.y });

    activeRoute = { facility, path, directions };
    activeStep  = 0;

    options.onDirections?.(directions, facility);

    // Announce for screen readers
    Utils.announce(`Route to ${facility.label} drawn. ${directions.length} steps.`);

    return { facility, directions, estimatedMinutes: Math.max(1, Math.round(pathDistance(path) / 100)) };
  }

  /**
   * Navigate to a seat
   * @param {string} section
   * @param {string} [row]
   * @param {string} [seat]
   * @param {Object} [options]
   */
  function navigateToSeat(section, row, seat, options = {}) {
    const coords = getSectionCoords(section);

    // Create a virtual facility for the seat
    const virtualFacility = {
      id: `seat-${section}-${row}-${seat}`,
      label: `Section ${section}${row ? `, Row ${row}` : ''}${seat ? `, Seat ${seat}` : ''}`,
      x: coords.x,
      y: coords.y,
      icon: '🪑',
      type: 'seat',
      accessible: parseInt(section) % 20 === 0
    };

    const userPos = Utils.getStorage('ss_user_pos', { x: 380, y: 75 });
    const path = buildPath(userPos, coords);
    const directions = generateDirections(userPos, virtualFacility, section);

    drawRoute(path, coords);

    activeRoute = { facility: virtualFacility, path, directions };
    options.onDirections?.(directions, virtualFacility);

    Utils.announce(`Route to ${virtualFacility.label} drawn. ${directions.length} steps.`);
    return { facility: virtualFacility, directions, estimatedMinutes: Math.max(1, Math.round(pathDistance(path) / 100)) };
  }

  /**
   * Find nearest facility of a given type
   * @param {string} type - Facility type
   * @param {{ x, y }} [from] - Starting position
   * @returns {Object|null}
   */
  function findNearest(type, from) {
    const pos = from || Utils.getStorage('ss_user_pos', { x: 420, y: 290 });

    const candidates = Object.values(FACILITIES).filter(f => f.type === type);
    if (!candidates.length) return null;

    return candidates.sort((a, b) =>
      Math.hypot(a.x - pos.x, a.y - pos.y) - Math.hypot(b.x - pos.x, b.y - pos.y)
    )[0];
  }

  /**
   * Search facilities by keyword
   * @param {string} query
   * @returns {Array}
   */
  function searchFacilities(query) {
    const lc = query.toLowerCase();
    return Object.values(FACILITIES).filter(f =>
      f.label.toLowerCase().includes(lc) || f.type.toLowerCase().includes(lc) || f.icon.includes(lc)
    );
  }

  /**
   * Set user's current position on the map
   * @param {{ x, y }} pos
   */
  function setUserPosition(pos) {
    Utils.setStorage('ss_user_pos', pos);
  }

  /**
   * Get all facilities (for UI listing)
   * @returns {Object}
   */
  function getFacilities() { return FACILITIES; }

  /**
   * Advance to next direction step
   * @returns {{ step: Object, index: number }|null}
   */
  function nextStep() {
    if (!activeRoute) return null;
    if (activeStep < activeRoute.directions.length - 1) activeStep++;
    return { step: activeRoute.directions[activeStep], index: activeStep };
  }

  /**
   * Go to previous direction step
   */
  function prevStep() {
    if (!activeRoute || activeStep === 0) return null;
    activeStep--;
    return { step: activeRoute.directions[activeStep], index: activeStep };
  }

  /**
   * Filter visible map markers by type.
   * @param {'all'|'gates'|'food'|'restroom'|'medical'|'accessible'} filter
   */
  function filterMarkers(filter) {
    const group = svgMap?.getElementById('facilities-group');
    if (!group) return;

    const typeMap = {
      all:        null,
      gates:      ['gate', 'exit'],
      food:       ['food'],
      restroom:   ['restroom'],
      medical:    ['medical'],
      accessible: ['elevator', 'family']
    };

    const allowed = typeMap[filter] || null;

    group.querySelectorAll('.facility-marker').forEach(marker => {
      const label = marker.getAttribute('aria-label') || '';
      // Find facility by label match
      const f = Object.values(FACILITIES).find(fac => fac.label === label);
      if (!f) return;
      const visible = !allowed || allowed.includes(f.type);
      marker.style.display    = visible ? '' : 'none';
      marker.setAttribute('aria-hidden', String(!visible));
    });
  }

  return {
    renderMap,
    navigateTo,
    navigateToSeat,
    findNearest,
    searchFacilities,
    clearRoute,
    setUserPosition,
    getFacilities,
    nextStep,
    prevStep,
    filterMarkers,
    FACILITIES
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Wayfinding;
}
