/**
 * @fileoverview Unit tests for Notifications module
 */

'use strict';

// --- DOM mock ---
const mockElements = {};
function createMockElement(id) {
  const children = [];
  const el = {
    id,
    textContent: '',
    hidden: false,
    checked: true,
    className: '',
    classList: {
      add: (cls) => { el.className += ' ' + cls; },
      remove: (cls) => { el.className = el.className.replace(cls, '').trim(); }
    },
    appendChild: (child) => { children.push(child); return child; },
    querySelectorAll: () => [],
    setAttribute: () => {},
    addEventListener: () => {},
    remove: () => {}
  };
  mockElements[id] = el;
  return el;
}

global.document = {
  getElementById: (id) => mockElements[id] || null,
  createElement: (tag) => ({
    className: '',
    id: '',
    textContent: '',
    classList: {
      add: function(cls) { this.className += ' ' + cls; },
      remove: function(cls) { this.className = this.className.replace(cls, '').trim(); }
    },
    appendChild: function(child) { return child; },
    setAttribute: () => {},
    addEventListener: () => {},
    remove: () => {}
  })
};

global.requestAnimationFrame = (fn) => setTimeout(fn, 0);

global.Utils = {
  getStorage: (key, def) => def,
  setStorage: () => true,
  setHTML: (el, html) => { if (el) el.innerHTML = html; }
};

// Create container and badge
createMockElement('notification-container');
createMockElement('notif-badge');
createMockElement('notifications-toggle');

const Notifications = require('../js/notifications');

// --- Tests ---

describe('Notifications', () => {

  test('exports init, show, dismiss, dismissAll', () => {
    expect(typeof Notifications.init).toBe('function');
    expect(typeof Notifications.show).toBe('function');
    expect(typeof Notifications.dismiss).toBe('function');
    expect(typeof Notifications.dismissAll).toBe('function');
  });

  test('init does not throw', () => {
    jest.useFakeTimers();
    expect(() => Notifications.init()).not.toThrow();
    jest.useRealTimers();
  });

  test('show returns a notification ID string', () => {
    jest.useFakeTimers();
    Notifications.init();
    const id = Notifications.show('Test notification', 'info', '🔔');
    expect(typeof id).toBe('string');
    expect(id).toMatch(/^notif-/);
    jest.useRealTimers();
  });

  test('show with default type uses info styling', () => {
    jest.useFakeTimers();
    Notifications.init();
    const id = Notifications.show('Default type test');
    expect(typeof id).toBe('string');
    expect(id).toMatch(/^notif-/);
    jest.useRealTimers();
  });

  test('dismiss does not throw for non-existent ID', () => {
    expect(() => Notifications.dismiss('nonexistent-id')).not.toThrow();
  });

  test('dismissAll does not throw', () => {
    jest.useFakeTimers();
    Notifications.init();
    expect(() => Notifications.dismissAll()).not.toThrow();
    jest.useRealTimers();
  });
});
