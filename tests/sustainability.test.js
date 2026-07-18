/**
 * @fileoverview Unit tests for SustainabilityModule
 */

'use strict';

// --- DOM + Globals mock ---
const mockElements = {};
function createMockElement(id) {
  const el = { textContent: '', style: {}, hidden: false, id };
  mockElements[id] = el;
  return el;
}

global.document = {
  getElementById: (id) => mockElements[id] || null,
  querySelectorAll: () => [],
  querySelector: () => null
};

global.Utils = {
  randInt: (min, max) => min,
  setHTML: (el, html) => { if (el) el.innerHTML = html; }
};

// Create DOM elements used by the module
['sustain-energy', 'sustain-water', 'sustain-waste', 'sustain-carbon',
 'green-score-val', 'sustain-energy-bar', 'sustain-water-bar',
 'sustain-waste-bar', 'sustain-carbon-bar', 'green-score-badge'
].forEach(createMockElement);

const SustainabilityModule = require('../js/sustainability');

// --- Tests ---

describe('SustainabilityModule', () => {

  test('exports init, startSimulation, stopSimulation, updateDisplay', () => {
    expect(typeof SustainabilityModule.init).toBe('function');
    expect(typeof SustainabilityModule.startSimulation).toBe('function');
    expect(typeof SustainabilityModule.stopSimulation).toBe('function');
    expect(typeof SustainabilityModule.updateDisplay).toBe('function');
  });

  test('init does not throw', () => {
    expect(() => SustainabilityModule.init()).not.toThrow();
  });

  test('updateDisplay sets metric text content', () => {
    SustainabilityModule.updateDisplay();

    expect(mockElements['sustain-energy'].textContent).toMatch(/kWh/);
    expect(mockElements['sustain-water'].textContent).toMatch(/L/);
    expect(mockElements['sustain-waste'].textContent).toMatch(/%/);
    expect(mockElements['sustain-carbon'].textContent).toMatch(/tCO/);
    expect(mockElements['green-score-val'].textContent).toBeTruthy();
  });

  test('updateDisplay sets bar widths as percentages', () => {
    SustainabilityModule.updateDisplay();

    expect(mockElements['sustain-energy-bar'].style.width).toMatch(/%/);
    expect(mockElements['sustain-water-bar'].style.width).toMatch(/%/);
    expect(mockElements['sustain-waste-bar'].style.width).toMatch(/%/);
    expect(mockElements['sustain-carbon-bar'].style.width).toMatch(/%/);
  });

  test('updateDisplay sets green score badge border color', () => {
    SustainabilityModule.updateDisplay();

    const badge = mockElements['green-score-badge'];
    expect(badge.style.borderColor).toBeTruthy();
  });

  test('startSimulation and stopSimulation lifecycle', () => {
    jest.useFakeTimers();

    SustainabilityModule.startSimulation();
    // Should have called updateDisplay at least once
    expect(mockElements['sustain-energy'].textContent).toMatch(/kWh/);

    // Advance timers and verify it still works
    jest.advanceTimersByTime(4000);
    expect(mockElements['sustain-energy'].textContent).toMatch(/kWh/);

    // Stop should not throw
    expect(() => SustainabilityModule.stopSimulation()).not.toThrow();

    jest.useRealTimers();
  });

  test('stopSimulation is safe to call multiple times', () => {
    expect(() => {
      SustainabilityModule.stopSimulation();
      SustainabilityModule.stopSimulation();
    }).not.toThrow();
  });
});
