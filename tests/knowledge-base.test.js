/**
 * @fileoverview Tests for Knowledge Base Module
 * Tests: data integrity, required fields, data relationships, business rules
 */

const KB = require('../js/knowledge-base');

describe('Knowledge Base — Data Integrity', () => {

  /* --- Stadiums --- */
  describe('stadiums', () => {
    test('has at least one stadium', () => {
      expect(Array.isArray(KB.stadiums)).toBe(true);
      expect(KB.stadiums.length).toBeGreaterThanOrEqual(1);
    });

    test('MetLife Stadium is included', () => {
      const metlife = KB.stadiums.find(s => s.id === 'metlife');
      expect(metlife).toBeDefined();
    });

    test('each stadium has required fields', () => {
      Object.values(KB.stadiums).forEach(stadium => {
        expect(stadium).toHaveProperty('id');
        expect(stadium).toHaveProperty('name');
        expect(stadium).toHaveProperty('city');
        expect(stadium).toHaveProperty('country');
        expect(stadium).toHaveProperty('capacity');
      });
    });

    test('stadium capacities are realistic (20000–100000)', () => {
      KB.stadiums.forEach(s => {
        expect(s.capacity).toBeGreaterThan(20000);
        expect(s.capacity).toBeLessThanOrEqual(100000);
      });
    });

    test('MetLife has valid facilities structure', () => {
      const metlife = KB.stadiums.find(s => s.id === 'metlife');
      expect(metlife.facilities).toHaveProperty('medical');
      expect(metlife.facilities).toHaveProperty('firstAid');
      expect(metlife.facilities).toHaveProperty('lostFound');
    });
  });

  /* --- Matches --- */
  describe('matches', () => {
    test('has match data', () => {
      expect(Array.isArray(KB.matches)).toBe(true);
      expect(KB.matches.length).toBeGreaterThan(0);
    });

    test('each match has home and away teams', () => {
      KB.matches.forEach(m => {
        expect(m).toHaveProperty('home');
        expect(m).toHaveProperty('away');
        expect(m.home).toHaveProperty('team');
        expect(m.away).toHaveProperty('team');
      });
    });

    test('each match has a valid status', () => {
      const validStatuses = new Set(['upcoming', 'completed', 'live']);
      KB.matches.forEach(m => {
        expect(validStatuses.has(m.status)).toBe(true);
      });
    });

    test('matches with scores have numeric score values', () => {
      KB.matches
        .filter(m => m.status === 'completed')
        .forEach(m => {
          expect(typeof m.score.home).toBe('number');
          expect(typeof m.score.away).toBe('number');
          expect(m.score.home).toBeGreaterThanOrEqual(0);
          expect(m.score.away).toBeGreaterThanOrEqual(0);
        });
    });

    test('matches have a city field', () => {
      KB.matches.forEach(m => {
        expect(m).toHaveProperty('city');
        expect(typeof m.city).toBe('string');
      });
    });
  });

  /* --- Players --- */
  describe('players', () => {
    test('has player data', () => {
      expect(Array.isArray(KB.players)).toBe(true);
      expect(KB.players.length).toBeGreaterThan(0);
    });

    test('each player has required fields', () => {
      KB.players.forEach(player => {
        expect(player).toHaveProperty('id');
        expect(player).toHaveProperty('name');
        expect(player).toHaveProperty('country');
        expect(player).toHaveProperty('goals');
        expect(player).toHaveProperty('caps');
      });
    });

    test('player goals and caps are non-negative integers', () => {
      KB.players.forEach(p => {
        expect(p.goals).toBeGreaterThanOrEqual(0);
        expect(p.caps).toBeGreaterThanOrEqual(0);
        expect(Number.isInteger(p.goals)).toBe(true);
        expect(Number.isInteger(p.caps)).toBe(true);
      });
    });

    test('player ids are unique', () => {
      const ids = KB.players.map(p => p.id);
      const unique = new Set(ids);
      expect(unique.size).toBe(ids.length);
    });
  });

  /* --- Emergency Data --- */
  describe('emergency', () => {
    test('has emergency contacts', () => {
      expect(KB.emergency).toHaveProperty('contacts');
      expect(Array.isArray(KB.emergency.contacts)).toBe(true);
      expect(KB.emergency.contacts.length).toBeGreaterThan(0);
    });

    test('each contact has name and number', () => {
      KB.emergency.contacts.forEach(c => {
        expect(c).toHaveProperty('name');
        expect(c).toHaveProperty('number');
        expect(typeof c.name).toBe('string');
        expect(typeof c.number).toBe('string');
        expect(c.number.length).toBeGreaterThan(0);
      });
    });

    test('has alert types', () => {
      expect(KB.emergency).toHaveProperty('alertTypes');
      expect(Array.isArray(KB.emergency.alertTypes)).toBe(true);
    });

    test('alert types include medical and fire', () => {
      const ids = KB.emergency.alertTypes.map(a => a.id);
      expect(ids).toContain('medical');
      expect(ids).toContain('fire');
    });
  });

  /* --- Rules --- */
  describe('rules', () => {
    test('has game rules', () => {
      expect(KB.rules).toHaveProperty('game');
      expect(Array.isArray(KB.rules.game)).toBe(true);
      expect(KB.rules.game.length).toBeGreaterThan(0);
    });

    test('each rule is a non-empty string', () => {
      KB.rules.game.forEach(rule => {
        expect(typeof rule).toBe('string');
        expect(rule.trim().length).toBeGreaterThan(0);
      });
    });
  });

  /* --- Fan Zone Activities --- */
  describe('fanZoneActivities', () => {
    test('has fan zone activities', () => {
      expect(Array.isArray(KB.fanZoneActivities)).toBe(true);
      expect(KB.fanZoneActivities.length).toBeGreaterThanOrEqual(4);
    });

    test('each activity has required fields', () => {
      KB.fanZoneActivities.forEach(a => {
        expect(a).toHaveProperty('name');
        expect(a).toHaveProperty('location');
        expect(a).toHaveProperty('duration');
        expect(a).toHaveProperty('cost');
        expect(a).toHaveProperty('description');
      });
    });
  });
});
