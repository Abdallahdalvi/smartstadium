/**
 * @fileoverview Tests for CrowdManager (heatmap.js)
 * Tests: zone definitions, density simulation, prediction generation,
 * zone summary structure, and alternate route logic.
 *
 * NOTE: Density thresholds match heatmap.js implementation:
 *   density < 0.45  → 'low'
 *   density < 0.75  → 'medium'
 *   density >= 0.75 → 'high'
 */

// Mock browser globals required by heatmap.js
global.window = { devicePixelRatio: 1 };
global.document = {
  createElement: () => ({ style: {}, addEventListener: jest.fn() }),
  addEventListener: jest.fn()
};
global.requestAnimationFrame = jest.fn();
global.cancelAnimationFrame = jest.fn();
global.Utils = require('../js/utils');

const CrowdManager = require('../js/heatmap.js');

/* ==========================================================================
 * Zone Definitions
 * ========================================================================== */
describe('CrowdManager — Zone Definitions', () => {
  test('ZONES is an array', () => {
    expect(Array.isArray(CrowdManager.ZONES)).toBe(true);
  });

  test('has at least 10 zones', () => {
    expect(CrowdManager.ZONES.length).toBeGreaterThanOrEqual(10);
  });

  test('each zone has all required fields', () => {
    CrowdManager.ZONES.forEach(zone => {
      expect(zone).toHaveProperty('id');
      expect(zone).toHaveProperty('label');
      expect(zone).toHaveProperty('capacity');
      expect(zone).toHaveProperty('x');
      expect(zone).toHaveProperty('y');
      expect(zone).toHaveProperty('w');
      expect(zone).toHaveProperty('h');
    });
  });

  test('zone ids are unique', () => {
    const ids = CrowdManager.ZONES.map(z => z.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  test('zone capacities are positive integers', () => {
    CrowdManager.ZONES.forEach(z => {
      expect(z.capacity).toBeGreaterThan(0);
      expect(Number.isInteger(z.capacity)).toBe(true);
    });
  });

  test('zone dimensions are positive numbers', () => {
    CrowdManager.ZONES.forEach(z => {
      expect(z.w).toBeGreaterThan(0);
      expect(z.h).toBeGreaterThan(0);
    });
  });

  test('includes north-stand and south-stand zones', () => {
    const ids = CrowdManager.ZONES.map(z => z.id);
    expect(ids).toContain('north-stand');
    expect(ids).toContain('south-stand');
  });

  test('includes all four gate zones', () => {
    const ids = CrowdManager.ZONES.map(z => z.id);
    expect(ids).toContain('gate-a-area');
    expect(ids).toContain('gate-b-area');
    expect(ids).toContain('gate-c-area');
    expect(ids).toContain('gate-d-area');
  });

  test('zone x and y coordinates are non-negative', () => {
    CrowdManager.ZONES.forEach(z => {
      expect(z.x).toBeGreaterThanOrEqual(0);
      expect(z.y).toBeGreaterThanOrEqual(0);
    });
  });
});

/* ==========================================================================
 * getDensityLevel() — Threshold Classification
 * ========================================================================== */
describe('CrowdManager — getDensityLevel()', () => {
  // Implementation thresholds: < 0.45 = low, < 0.75 = medium, >= 0.75 = high

  test('returns "low" for density 0.0', () => {
    expect(CrowdManager.getDensityLevel(0.0)).toBe('low');
  });

  test('returns "low" for density 0.3', () => {
    expect(CrowdManager.getDensityLevel(0.3)).toBe('low');
  });

  test('returns "low" for density 0.44', () => {
    expect(CrowdManager.getDensityLevel(0.44)).toBe('low');
  });

  test('returns "medium" for density 0.45', () => {
    expect(CrowdManager.getDensityLevel(0.45)).toBe('medium');
  });

  test('returns "medium" for density 0.6', () => {
    expect(CrowdManager.getDensityLevel(0.6)).toBe('medium');
  });

  test('returns "medium" for density 0.74', () => {
    expect(CrowdManager.getDensityLevel(0.74)).toBe('medium');
  });

  test('returns "high" for density 0.75', () => {
    expect(CrowdManager.getDensityLevel(0.75)).toBe('high');
  });

  test('returns "high" for density 0.9', () => {
    expect(CrowdManager.getDensityLevel(0.9)).toBe('high');
  });

  test('returns "high" for density 1.0', () => {
    expect(CrowdManager.getDensityLevel(1.0)).toBe('high');
  });
});

/* ==========================================================================
 * Zone Summaries
 * ========================================================================== */
describe('CrowdManager — getZoneSummaries()', () => {
  let summaries;

  beforeAll(() => {
    summaries = CrowdManager.getZoneSummaries();
  });

  test('returns an array', () => {
    expect(Array.isArray(summaries)).toBe(true);
  });

  test('returns at most the first 8 zones', () => {
    expect(summaries.length).toBeLessThanOrEqual(8);
  });

  test('each summary has required fields', () => {
    summaries.forEach(s => {
      expect(s).toHaveProperty('id');
      expect(s).toHaveProperty('label');
      expect(s).toHaveProperty('density');
      expect(s).toHaveProperty('level');
      expect(s).toHaveProperty('capacity');
    });
  });

  test('density values are between 0 and 1', () => {
    summaries.forEach(s => {
      expect(s.density).toBeGreaterThanOrEqual(0);
      expect(s.density).toBeLessThanOrEqual(1);
    });
  });

  test('level values are one of: low, medium, high', () => {
    const valid = new Set(['low', 'medium', 'high']);
    summaries.forEach(s => {
      expect(valid.has(s.level)).toBe(true);
    });
  });

  test('percentage values are between 0 and 100', () => {
    summaries.forEach(s => {
      if (s.percentage !== undefined) {
        expect(s.percentage).toBeGreaterThanOrEqual(0);
        expect(s.percentage).toBeLessThanOrEqual(100);
      }
    });
  });
});

/* ==========================================================================
 * Predictions
 * ========================================================================== */
describe('CrowdManager — generatePredictions()', () => {
  let predictions;

  beforeAll(() => {
    predictions = CrowdManager.generatePredictions();
  });

  test('returns an array', () => {
    expect(Array.isArray(predictions)).toBe(true);
  });

  test('returns at least one prediction', () => {
    expect(predictions.length).toBeGreaterThan(0);
  });

  test('each prediction has all required fields', () => {
    predictions.forEach(p => {
      expect(p).toHaveProperty('zone');
      expect(p).toHaveProperty('prediction');
      expect(p).toHaveProperty('action');
      expect(p).toHaveProperty('severity');
    });
  });

  test('severity values are one of: low, medium, high', () => {
    const valid = new Set(['low', 'medium', 'high']);
    predictions.forEach(p => {
      expect(valid.has(p.severity)).toBe(true);
    });
  });

  test('prediction text strings are non-empty', () => {
    predictions.forEach(p => {
      expect(typeof p.prediction).toBe('string');
      expect(p.prediction.trim().length).toBeGreaterThan(0);
    });
  });

  test('action strings are non-empty', () => {
    predictions.forEach(p => {
      expect(typeof p.action).toBe('string');
      expect(p.action.trim().length).toBeGreaterThan(0);
    });
  });
});

/* ==========================================================================
 * Alternate Route Logic
 * ========================================================================== */
describe('CrowdManager — getAlternateRoute()', () => {
  test('returns a non-empty string for gate-a-area', () => {
    const route = CrowdManager.getAlternateRoute('gate-a-area');
    expect(typeof route).toBe('string');
    expect(route.trim().length).toBeGreaterThan(0);
  });

  test('returns a non-empty string for gate-b-area', () => {
    const route = CrowdManager.getAlternateRoute('gate-b-area');
    expect(typeof route).toBe('string');
    expect(route.trim().length).toBeGreaterThan(0);
  });

  test('returns a fallback string for unknown zones', () => {
    const route = CrowdManager.getAlternateRoute('nonexistent-zone-xyz');
    expect(typeof route).toBe('string');
    expect(route.trim().length).toBeGreaterThan(0);
  });

  test('returns a string for north-stand', () => {
    const route = CrowdManager.getAlternateRoute('north-stand');
    expect(typeof route).toBe('string');
    expect(route.trim().length).toBeGreaterThan(0);
  });

  test('returns a string for food-area-1', () => {
    const route = CrowdManager.getAlternateRoute('food-area-1');
    expect(typeof route).toBe('string');
    expect(route.trim().length).toBeGreaterThan(0);
  });
});
