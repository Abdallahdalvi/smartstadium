/**
 * @jest-environment jsdom
 * @fileoverview Tests for Tickets Module
 */
global.Utils = require('../js/utils');
global.KB = require('../js/knowledge-base');
global.I18n = { t: () => 'Mocked' };
const Tickets = require('../js/tickets');

describe('Tickets Module', () => {

  beforeEach(() => {
    document.body.innerHTML = `
      <div id="ticket-container"></div>
      <div id="schedule-container"></div>
      <div id="fanzone-container"></div>
    `;
  });

  test('renderTicket() populates ticket card', () => {
    Tickets.renderTicket('ticket-container');
    const container = document.getElementById('ticket-container');
    expect(container.innerHTML).toContain('ticket-card');
    expect(container.innerHTML).toContain('USA');
    expect(container.innerHTML).toContain('MEXICO');
  });

  test('renderSchedule() renders match list', () => {
    Tickets.renderSchedule('schedule-container');
    const container = document.getElementById('schedule-container');
    expect(container.querySelectorAll('.match-card').length).toBeGreaterThan(0);
    expect(container.innerHTML).toContain(KB.matches[0].home.team);
  });

  test('renderFanZone() renders activities', () => {
    Tickets.renderFanZone('fanzone-container');
    const container = document.getElementById('fanzone-container');
    expect(container.querySelectorAll('.activity-card').length).toBeGreaterThan(0);
    expect(container.innerHTML).toContain(KB.fanZoneActivities[0].name);
  });
});
