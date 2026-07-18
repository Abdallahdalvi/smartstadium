/**
 * @jest-environment jsdom
 * @fileoverview Tests for Emergency Module
 */
global.Utils = require('../js/utils');
global.KB = require('../js/knowledge-base');
const Emergency = require('../js/emergency');

describe('Emergency Module', () => {

  beforeEach(() => {
    document.body.innerHTML = `
      <div id="sos-btn"></div>
      <form id="lost-found-form">
        <input id="lf-type" value="wallet">
        <input id="lf-desc" value="black leather">
        <button type="submit">Submit</button>
      </form>
      <div id="contacts-container"></div>
    `;
    global.Utils.announce = jest.fn();
  });

  test('init() sets up SOS button without errors', () => {
    expect(() => Emergency.init()).not.toThrow();
  });

  test('renderContacts() populates the container with KB contacts', () => {
    Emergency.renderContacts('contacts-container');
    const container = document.getElementById('contacts-container');
    expect(container.innerHTML).toContain(KB.emergency.contacts[0].name);
    expect(container.innerHTML).toContain(KB.emergency.contacts[0].number);
    expect(container.querySelectorAll('.contact-item').length).toBe(KB.emergency.contacts.length);
  });

  test('renderContacts() does nothing if container missing', () => {
    expect(() => Emergency.renderContacts('missing-container')).not.toThrow();
  });
});
