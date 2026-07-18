/**
 * @fileoverview Sustainability Dashboard Module
 * Real-time eco-impact metrics, carbon tracking, and green actions
 * Powers the FIFA Green Goal 2026 sustainability section
 */

'use strict';

const SustainabilityModule = (() => {

  /** @type {number|null} Simulation interval ID */
  let simTimer = null;

  /**
   * Sustainability state — simulates IoT sensor data
   * @type {{ energy: number, water: number, wasteDiverted: number, carbonOffset: number, greenScore: number }}
   */
  let state = {
    energy: 2847,
    water: 48200,
    wasteDiverted: 76,
    carbonOffset: 124,
    greenScore: 74
  };

  /* =========================================================================
   * INITIALIZATION
   * ========================================================================= */

  /**
   * Initialize sustainability dashboard — binds carbon option selectors
   */
  function init() {
    bindCarbonOptions();
  }

  /* =========================================================================
   * RENDER & UPDATE
   * ========================================================================= */

  /**
   * Start real-time metric simulation (called when sustainability section becomes active)
   */
  function startSimulation() {
    updateDisplay();
    simTimer = setInterval(() => {
      _tickMetrics();
      updateDisplay();
    }, 4000);
  }

  /**
   * Stop simulation (called when leaving sustainability section)
   */
  function stopSimulation() {
    if (simTimer) {
      clearInterval(simTimer);
      simTimer = null;
    }
  }

  /**
   * Simulate small fluctuations in live metrics
   * @private
   */
  function _tickMetrics() {
    state.energy = Math.max(2400, state.energy + Utils.randInt(-30, 50));
    state.water = Math.max(44000, state.water + Utils.randInt(-200, 300));
    state.wasteDiverted = Math.min(82, Math.max(70, state.wasteDiverted + Utils.randInt(-1, 1)));
    state.carbonOffset = Math.min(155, state.carbonOffset + Utils.randInt(0, 3));
    state.greenScore = Math.min(92, Math.max(68, state.greenScore + Utils.randInt(-1, 1)));
  }

  /**
   * Update all metric display elements with current state values
   */
  function updateDisplay() {
    _setText('sustain-energy', `${state.energy.toLocaleString()} kWh`);
    _setText('sustain-water', `${state.water.toLocaleString()} L`);
    _setText('sustain-waste', `${state.wasteDiverted}%`);
    _setText('sustain-carbon', `${state.carbonOffset} tCO₂`);
    _setText('green-score-val', String(state.greenScore));

    _setBarWidth('sustain-energy-bar', Math.round((state.energy / 4500) * 100));
    _setBarWidth('sustain-water-bar', Math.round((state.water / 100000) * 100));
    _setBarWidth('sustain-waste-bar', state.wasteDiverted);
    _setBarWidth('sustain-carbon-bar', Math.round((state.carbonOffset / 155) * 100));

    // Update green score badge color
    const badge = document.getElementById('green-score-badge');
    if (badge) {
      badge.style.borderColor = state.greenScore >= 80 ? 'var(--color-success)'
        : state.greenScore >= 65 ? 'var(--color-warning)' : 'var(--color-danger)';
    }
  }

  /* =========================================================================
   * CARBON OPTION SELECTOR
   * ========================================================================= */

  /**
   * Bind click handlers to the transport carbon-impact selectors
   */
  function bindCarbonOptions() {
    const options = document.querySelectorAll('.carbon-option');
    options.forEach(opt => {
      opt.addEventListener('click', () => {
        options.forEach(o => o.classList.remove('selected'));
        opt.classList.add('selected');
        _updateCarbonTip(opt.id);
      });
    });
  }

  /**
   * Update the AI carbon tip based on selected transport
   * @param {string} optId - ID of the selected carbon option element
   * @private
   */
  function _updateCarbonTip(optId) {
    const tipEl = document.querySelector('.sustain-carbon-tip');
    if (!tipEl) return;

    const tips = {
      'co-metro':   '💡 <strong>Great choice!</strong> By using the Metro, you saved approximately <strong>11.6 kg of CO₂</strong> vs. driving alone — equivalent to planting 1 tree! 🌳',
      'co-car':     '⚠️ <strong>AI Tip:</strong> Solo driving emits 12.4 kg CO₂ for this journey. Consider carpooling or Metro next time — you\'d cut your footprint by up to 94%!',
      'co-carpool': '💡 <strong>Good effort!</strong> Sharing a car with 3 others saves 75% of the solo-driver footprint. Could you take Metro next time for an even bigger impact?',
      'co-walk':    '🌟 <strong>Zero-emission hero!</strong> Walking or cycling produces 0 kg CO₂. You\'re setting the gold standard for sustainable fan travel!'
    };

    if (tipEl && tips[optId]) {
      Utils.setHTML(tipEl, tips[optId]);
    }
  }

  /* =========================================================================
   * PRIVATE HELPERS
   * ========================================================================= */

  /**
   * Safely set text content of an element by ID
   * @param {string} id
   * @param {string} value
   * @private
   */
  function _setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  /**
   * Set a bar-fill element's width percentage, clamped 0–100
   * @param {string} id
   * @param {number} pct
   * @private
   */
  function _setBarWidth(id, pct) {
    const el = document.getElementById(id);
    if (el) el.style.width = `${Math.min(100, Math.max(0, pct))}%`;
  }

  /* =========================================================================
   * PUBLIC API
   * ========================================================================= */

  return {
    init,
    startSimulation,
    stopSimulation,
    updateDisplay
  };

})();

if (typeof module !== 'undefined' && module.exports) module.exports = SustainabilityModule;
