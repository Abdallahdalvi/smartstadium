/**
 * @fileoverview Crowd Heatmap & Congestion Management Module
 * Canvas-based real-time crowd density visualization with AI predictions
 */

'use strict';

const CrowdManager = (() => {

  let canvas = null;
  let ctx    = null;
  let animFrame = null;
  let isRunning = false;

  /* =========================================================================
   * ZONE DEFINITIONS
   * ========================================================================= */
  const ZONES = [
    { id: 'north-stand',  label: 'North Stand',       capacity: 8000,  x: 200, y: 75,  w: 440, h: 80  },
    { id: 'south-stand',  label: 'South Stand',       capacity: 8000,  x: 200, y: 445, w: 440, h: 80  },
    { id: 'east-stand',   label: 'East Stand',        capacity: 6000,  x: 645, y: 145, w: 80,  h: 290 },
    { id: 'west-stand',   label: 'West Stand',        capacity: 6000,  x: 115, y: 145, w: 80,  h: 290 },
    { id: 'gate-a-area',  label: 'Gate A Entrance',   capacity: 2000,  x: 310, y: 20,  w: 220, h: 60  },
    { id: 'gate-b-area',  label: 'Gate B Entrance',   capacity: 2000,  x: 720, y: 200, w: 60,  h: 180 },
    { id: 'gate-c-area',  label: 'Gate C Entrance',   capacity: 2000,  x: 310, y: 500, w: 220, h: 60  },
    { id: 'gate-d-area',  label: 'Gate D Entrance',   capacity: 2000,  x: 60,  y: 200, w: 60,  h: 180 },
    { id: 'concourse-n',  label: 'N Concourse',       capacity: 3000,  x: 200, y: 155, w: 440, h: 20  },
    { id: 'concourse-s',  label: 'S Concourse',       capacity: 3000,  x: 200, y: 435, w: 440, h: 20  },
    { id: 'concourse-e',  label: 'E Concourse',       capacity: 2500,  x: 625, y: 155, w: 20,  h: 290 },
    { id: 'concourse-w',  label: 'W Concourse',       capacity: 2500,  x: 195, y: 155, w: 20,  h: 290 },
    { id: 'food-area-1',  label: 'Food Zone (N)',     capacity: 500,   x: 250, y: 95,  w: 90,  h: 40  },
    { id: 'food-area-2',  label: 'Food Zone (S)',     capacity: 500,   x: 500, y: 445, w: 90,  h: 40  },
    { id: 'fan-zone',     label: 'Fan Zone',          capacity: 5000,  x: 200, y: 560, w: 440, h: 40  }
  ];

  // Zone density state [0.0 - 1.0]
  let zoneDensity = {};

  // Heatmap heat points (generated dynamically)
  let heatPoints = [];

  /* =========================================================================
   * DENSITY SIMULATION
   * ========================================================================= */

  /**
   * Initialize zone densities based on time of day
   */
  function initDensities() {
    const hour = new Date().getHours();
    const isMatchDay = true; // Always simulate match day
    const minutesToKickoff = 90; // Assume match starting in 90 mins

    ZONES.forEach(zone => {
      let base = 0.2;

      // Pre-match crowd buildup
      if (minutesToKickoff <= 120 && minutesToKickoff >= 0) {
        base += (120 - minutesToKickoff) / 120 * 0.55;
      }

      // Gate areas busiest at entry time
      if (zone.id.includes('gate')) {
        base += minutesToKickoff < 60 ? 0.4 : 0.15;
      }

      // Food zones moderate
      if (zone.id.includes('food')) {
        base += 0.2;
      }

      // Stands fill up close to kickoff
      if (zone.id.includes('stand')) {
        base += minutesToKickoff < 30 ? 0.55 : 0.2;
      }

      // Add random noise for realism
      base += (Math.random() - 0.5) * 0.15;
      zoneDensity[zone.id] = Math.min(1.0, Math.max(0.05, base));
    });
  }

  /**
   * Update densities with realistic simulation
   */
  function updateDensities() {
    ZONES.forEach(zone => {
      const current = zoneDensity[zone.id] || 0.2;
      // Random walk with mean-reversion
      const target = Utils.getStorage(`crowd_target_${zone.id}`, null) || 0.5;
      const drift  = (target - current) * 0.01;
      const noise  = (Math.random() - 0.5) * 0.02;
      zoneDensity[zone.id] = Math.min(1.0, Math.max(0.02, current + drift + noise));
    });
  }

  /**
   * Generate heatmap points from zone densities
   */
  function generateHeatPoints() {
    heatPoints = [];
    const W = canvas?.width || 840;
    const H = canvas?.height || 600;
    const scaleX = W / 840;
    const scaleY = H / 600;

    ZONES.forEach(zone => {
      const density = zoneDensity[zone.id] || 0;
      const pointCount = Math.floor(density * 12);

      for (let i = 0; i < pointCount; i++) {
        heatPoints.push({
          x: (zone.x + zone.w * 0.1 + Math.random() * zone.w * 0.8) * scaleX,
          y: (zone.y + zone.h * 0.1 + Math.random() * zone.h * 0.8) * scaleY,
          intensity: density * (0.7 + Math.random() * 0.3),
          radius: (30 + Math.random() * 40) * Math.min(scaleX, scaleY)
        });
      }
    });
  }

  /* =========================================================================
   * CANVAS RENDERING
   * ========================================================================= */

  /**
   * Initialize canvas for heatmap rendering
   * @param {string} canvasId
   */
  function initCanvas(canvasId) {
    canvas = Utils.el(canvasId);
    if (!canvas) { console.error('[CrowdManager] Canvas not found:', canvasId); return false; }

    // Set canvas dimensions to match display
    function resizeCanvas() {
      const rect = canvas.getBoundingClientRect();
      canvas.width  = rect.width  * (window.devicePixelRatio || 1);
      canvas.height = rect.height * (window.devicePixelRatio || 1);
      ctx = canvas.getContext('2d');
      ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
    }

    resizeCanvas();
    window.addEventListener('resize', Utils.debounce(resizeCanvas, 200));
    ctx = canvas.getContext('2d');
    return true;
  }

  /**
   * Render one heatmap frame
   */
  function renderFrame() {
    if (!ctx || !canvas) return;
    const W = canvas.width / (window.devicePixelRatio || 1);
    const H = canvas.height / (window.devicePixelRatio || 1);

    // Clear
    ctx.clearRect(0, 0, W, H);

    // Dark base (stadium silhouette)
    ctx.fillStyle = 'rgba(10, 10, 20, 0.92)';
    ctx.fillRect(0, 0, W, H);

    // Draw heatmap blobs
    heatPoints.forEach(pt => {
      const gradient = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, pt.radius);

      // Color based on intensity: green → yellow → orange → red
      let r, g, b;
      const t = pt.intensity;
      if (t < 0.4) {
        // Green to yellow
        const p = t / 0.4;
        r = Math.round(34 + (245 - 34) * p);
        g = Math.round(197 + (158 - 197) * p);
        b = 94 - Math.round(94 * p);
      } else if (t < 0.75) {
        // Yellow to orange
        const p = (t - 0.4) / 0.35;
        r = Math.round(245 + (239 - 245) * p);
        g = Math.round(158 - 90 * p);
        b = 0;
      } else {
        // Orange to red
        const p = (t - 0.75) / 0.25;
        r = 239;
        g = Math.round(68 - 68 * p);
        b = Math.round(68 * p * 0.3);
      }

      gradient.addColorStop(0,   `rgba(${r},${g},${b},${0.5 * pt.intensity})`);
      gradient.addColorStop(0.5, `rgba(${r},${g},${b},${0.2 * pt.intensity})`);
      gradient.addColorStop(1,   `rgba(${r},${g},${b},0)`);

      ctx.beginPath();
      ctx.arc(pt.x, pt.y, pt.radius, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();
    });

    // Zone labels and density overlays
    const scaleX = W / 840;
    const scaleY = H / 600;

    // Gate hotspots remain visible in the heat layer; labels are limited to
    // major stands so text never overlaps at dashboard scale.
    ZONES.slice(0, 4).forEach(zone => {
      const density = zoneDensity[zone.id] || 0;
      const x = zone.x * scaleX;
      const y = zone.y * scaleY;
      const w = zone.w * scaleX;
      const h = zone.h * scaleY;
      const cx = x + w / 2;
      const cy = y + h / 2;

      // Label
      ctx.font = `bold ${Math.round(9 * Math.min(scaleX, scaleY) + 5)}px Inter`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const level = getDensityLevel(density);
      const labelColors = { low: '#22C55E', medium: '#F59E0B', high: '#EF4444' };
      ctx.fillStyle = labelColors[level];
      ctx.fillText(`${zone.label} ${Math.round(density * 100)}%`, cx, cy);
    });

    // Timestamp watermark
    ctx.font = '10px Inter';
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.textAlign = 'left';
    ctx.fillText(`Live • ${Utils.getCurrentTime()}`, 8, H - 8);
  }

  /**
   * Start the live simulation loop
   */
  function startSimulation() {
    if (isRunning) return;
    isRunning = true;

    initDensities();
    generateHeatPoints();

    let lastUpdate = 0;

    function loop(timestamp) {
      if (!isRunning) return;

      // Update densities every 2 seconds
      if (timestamp - lastUpdate > 2000) {
        updateDensities();
        generateHeatPoints();
        lastUpdate = timestamp;
      }

      renderFrame();
      animFrame = requestAnimationFrame(loop);
    }

    animFrame = requestAnimationFrame(loop);
  }

  /**
   * Stop simulation
   */
  function stopSimulation() {
    isRunning = false;
    if (animFrame) { cancelAnimationFrame(animFrame); animFrame = null; }
  }

  /* =========================================================================
   * AI CONGESTION PREDICTIONS
   * ========================================================================= */

  /**
   * Get current density level for a zone
   * @param {number} density
   * @returns {'low'|'medium'|'high'}
   */
  function getDensityLevel(density) {
    if (density < 0.45) return 'low';
    if (density < 0.75) return 'medium';
    return 'high';
  }

  /**
   * Get zone summaries for UI display
   * @returns {Array}
   */
  function getZoneSummaries() {
    return ZONES.slice(0, 8).map(zone => ({
      ...zone,
      density: zoneDensity[zone.id] || 0,
      level: getDensityLevel(zoneDensity[zone.id] || 0),
      crowd: Math.round((zoneDensity[zone.id] || 0) * zone.capacity),
      percentage: Math.round((zoneDensity[zone.id] || 0) * 100)
    }));
  }

  /**
   * Generate AI congestion predictions
   * @returns {Array<{ zone: string, prediction: string, severity: string, action: string }>}
   */
  function generatePredictions() {
    const summaries = getZoneSummaries();
    const predictions = [];

    // Find high-density zones
    const highZones  = summaries.filter(z => z.level === 'high');
    const medZones   = summaries.filter(z => z.level === 'medium');

    if (highZones.length > 0) {
      const zone = highZones[0];
      predictions.push({
        zone: zone.label,
        severity: 'high',
        prediction: `${zone.label} is currently at ${zone.percentage}% capacity — congestion expected to peak in ~15 minutes.`,
        action: `Use Gate ${zone.id.includes('north') ? 'C or D' : zone.id.includes('east') ? 'A or D' : 'B or C'} to bypass congestion.`
      });
    }

    if (medZones.length > 0) {
      const zone = medZones[0];
      predictions.push({
        zone: zone.label,
        severity: 'medium',
        prediction: `${zone.label} at ${zone.percentage}% — moderate crowd flow anticipated for next 30 minutes.`,
        action: `Concourse level 2 is currently clearer — consider moving through the upper concourse.`
      });
    }

    // Always add a positive prediction
    const clearZones = summaries.filter(z => z.level === 'low');
    if (clearZones.length > 0) {
      const zone = clearZones[0];
      predictions.push({
        zone: zone.label,
        severity: 'low',
        prediction: `${zone.label} is ${zone.percentage}% occupied — clear and comfortable flow.`,
        action: `This is an excellent area to access concessions or facilities right now.`
      });
    }

    // Half-time prediction
    predictions.push({
      zone: 'All Concourses',
      severity: 'medium',
      prediction: `AI model predicts 73% surge in concourse traffic at half-time (predicted in ~38 minutes).`,
      action: `Visit food concessions in the last 10 minutes of the first half to avoid queues.`
    });

    return predictions;
  }

  /**
   * Get alternate route suggestion
   * @param {string} fromZoneId - High-density zone to avoid
   * @returns {string}
   */
  function getAlternateRoute(fromZoneId) {
    const altRoutes = {
      'gate-a-area': 'Route via Gate D (West) then North concourse — estimated 4 min walk vs 12 min through Gate A.',
      'gate-b-area': 'Take East upper concourse stairwell → Level 2 → Gate B express lane. Saves ~8 minutes.',
      'gate-c-area': 'Route via Gate A (North) then South concourse — Gate C is congested but Gate A entry is clear.',
      'gate-d-area': 'Use West elevator bank → cross at Level 2 → avoid ground-floor crush. Faster by ~6 minutes.',
      'concourse-n': 'North concourse is busy — use South concourse (clear) and access your section from the south.',
      'food-area-1': 'North food zone is queued 15+ mins — Food Zone South or East concession stand has no wait.',
      'north-stand': 'North Stand entry: Use Section 101 door (far left) — other doors have longer queues.',
      'south-stand': 'South Stand: Section 148 door (far right) is currently the quickest entry point.',
    };
    return altRoutes[fromZoneId] || 'Consider using an alternate gate or upper concourse for faster movement.';
  }

  /**
   * Trigger emergency alert overlay
   * @param {string} alertType - 'fire' | 'medical' | 'evacuation' | 'security'
   */
  function triggerEmergencyAlert(alertType) {
    const alertData = KB.emergency.alertTypes.find(a => a.id === alertType);
    if (!alertData) return;

    const overlay = Utils.el('emergency-overlay');
    if (!overlay) return;

    Utils.el('emergency-overlay-icon').textContent    = alertData.emoji;
    Utils.el('emergency-overlay-title').textContent   = alertData.label.toUpperCase();
    Utils.el('emergency-overlay-message').textContent = alertData.message;

    overlay.className = 'emergency-overlay show';
    overlay.setAttribute('aria-live', 'assertive');
    Utils.announce(`EMERGENCY ALERT: ${alertData.label}. ${alertData.message}`, 'assertive');

    // Flash page title
    const origTitle = document.title;
    let flashCount = 0;
    const flashInterval = setInterval(() => {
      document.title = flashCount++ % 2 === 0 ? `🚨 ${alertData.label.toUpperCase()} 🚨` : origTitle;
      if (flashCount > 20) { clearInterval(flashInterval); document.title = origTitle; }
    }, 500);
  }

  /**
   * Dismiss emergency overlay
   */
  function dismissAlert() {
    const overlay = Utils.el('emergency-overlay');
    if (overlay) overlay.className = 'emergency-overlay';
    document.title = document.title.replace(/🚨.*🚨\s*/g, '');
  }

  return {
    initCanvas,
    startSimulation,
    stopSimulation,
    getZoneSummaries,
    generatePredictions,
    getAlternateRoute,
    getDensityLevel,
    triggerEmergencyAlert,
    dismissAlert,
    ZONES
  };
})();

if (typeof module !== 'undefined' && module.exports) module.exports = CrowdManager;

