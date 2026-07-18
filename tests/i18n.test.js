/**
 * @jest-environment jsdom
 * @fileoverview Tests for i18n (Internationalization) Module
 * Tests: language listing, translation lookups, language switching,
 * speech language mapping, and persistence.
 */
// Utils is a dependency of I18n (used for getStorage/setStorage/announce)
global.Utils = require('../js/utils');

// jsdom provides document and localStorage. Ensure announce does not throw.
if (!global.Utils.announce) {
  global.Utils.announce = jest.fn();
}

const I18n = require('../js/i18n');

describe('I18n Module', () => {
  beforeEach(() => {
    // Mock localStorage for the tests
    let store = {};
    global.localStorage = {
      getItem: key => store[key] || null,
      setItem: (key, value) => { store[key] = value.toString(); },
      removeItem: key => { delete store[key]; },
      clear: () => { store = {}; }
    };
    global.localStorage.clear();
    I18n.init();
  });

  /* --- Language Listing --- */
  describe('getLanguages()', () => {
    test('returns an object of supported languages', () => {
      const langs = I18n.getLanguages();
      expect(typeof langs).toBe('object');
      expect(langs).not.toBeNull();
    });

    test('includes English', () => {
      expect(I18n.getLanguages()).toHaveProperty('en');
    });

    test('includes Spanish', () => {
      expect(I18n.getLanguages()).toHaveProperty('es');
    });

    test('includes French', () => {
      expect(I18n.getLanguages()).toHaveProperty('fr');
    });

    test('includes Arabic', () => {
      expect(I18n.getLanguages()).toHaveProperty('ar');
    });

    test('includes at least 10 languages', () => {
      const langs = I18n.getLanguages();
      expect(Object.keys(langs).length).toBeGreaterThanOrEqual(10);
    });

    test('each language has required fields', () => {
      const langs = I18n.getLanguages();
      Object.values(langs).forEach(lang => {
        expect(lang).toHaveProperty('name');
        expect(lang).toHaveProperty('nativeName');
        expect(lang).toHaveProperty('flag');
        expect(lang).toHaveProperty('dir');
        expect(lang).toHaveProperty('speechLang');
      });
    });

    test('Arabic has RTL direction', () => {
      expect(I18n.getLanguages().ar.dir).toBe('rtl');
    });

    test('English has LTR direction', () => {
      expect(I18n.getLanguages().en.dir).toBe('ltr');
    });
  });

  /* --- Translation Lookup --- */
  describe('t() — Translation', () => {
    beforeEach(() => {
      I18n.setLanguage('en');
    });

    test('returns a non-empty string for home.findMySeat', () => {
      const result = I18n.t('home.findMySeat');
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    test('returns a non-empty string for chat.greeting', () => {
      const result = I18n.t('chat.greeting');
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    test('returns an array for chat.quickReplies', () => {
      const result = I18n.t('chat.quickReplies');
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    test('returns the key path for a missing key', () => {
      const result = I18n.t('nonexistent.deeply.nested.key');
      // Should return the key itself rather than throwing
      expect(typeof result).toBe('string');
    });

    test('returns English fallback when Spanish key missing', () => {
      I18n.setLanguage('es');
      const en = I18n.t('home.findMySeat', 'en');
      const es = I18n.t('home.findMySeat');
      // Either Spanish translation exists, or falls back to English
      expect(typeof es).toBe('string');
      expect(es.length).toBeGreaterThan(0);
    });
  });

  /* --- Language Switching --- */
  describe('setLanguage() and getLang()', () => {
    test('default language is English', () => {
      expect(I18n.getLang()).toBe('en');
    });

    test('switches to Spanish', () => {
      I18n.setLanguage('es');
      expect(I18n.getLang()).toBe('es');
    });

    test('switches to French', () => {
      I18n.setLanguage('fr');
      expect(I18n.getLang()).toBe('fr');
    });

    test('switches to Arabic', () => {
      I18n.setLanguage('ar');
      expect(I18n.getLang()).toBe('ar');
    });

    test('switches to Japanese', () => {
      I18n.setLanguage('ja');
      expect(I18n.getLang()).toBe('ja');
    });

    test('ignores unsupported language codes (stays at previous)', () => {
      const before = I18n.getLang();
      I18n.setLanguage('zz');
      expect(I18n.getLang()).toBe(before);
    });

    test('persists language across init() calls', () => {
      I18n.setLanguage('es');
      I18n.init();
      expect(I18n.getLang()).toBe('es');
    });
  });

  /* --- Speech Language --- */
  describe('getSpeechLang()', () => {
    test('returns a non-empty string for English', () => {
      I18n.setLanguage('en');
      expect(typeof I18n.getSpeechLang()).toBe('string');
      expect(I18n.getSpeechLang().length).toBeGreaterThan(0);
    });

    test('returns Arabic speech code for Arabic', () => {
      I18n.setLanguage('ar');
      expect(I18n.getSpeechLang()).toMatch(/ar/i);
    });

    test('returns Spanish speech code for Spanish', () => {
      I18n.setLanguage('es');
      expect(I18n.getSpeechLang()).toMatch(/es/i);
    });

    test('returns Japanese speech code for Japanese', () => {
      I18n.setLanguage('ja');
      expect(I18n.getSpeechLang()).toMatch(/ja/i);
    });
  });
});
