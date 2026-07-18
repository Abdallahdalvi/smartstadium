const Utils = require('../js/utils');

describe('Utils module', () => {
  describe('Security and Sanitization', () => {
    test('escapeHtml should convert dangerous characters', () => {
      const input = '<script>alert("xss")</script> & \'malicious\'';
      const expected = '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt; &amp; &#039;malicious&#039;';
      expect(Utils.escapeHtml(input)).toBe(expected);
    });

    test('sanitize should trim and escape', () => {
      const input = '   <tag>   ';
      expect(Utils.sanitize(input)).toBe('&lt;tag&gt;');
    });

    test('isSafeInput should reject dangerous patterns', () => {
      expect(Utils.isSafeInput('<script>')).toBe(false);
      expect(Utils.isSafeInput('javascript:alert(1)')).toBe(false);
      expect(Utils.isSafeInput('onload=foo()')).toBe(false);
      expect(Utils.isSafeInput('Hello world')).toBe(true);
    });
  });

  describe('Formatting', () => {
    test('formatNumber should add commas', () => {
      expect(Utils.formatNumber(1000000)).toBe('1,000,000');
    });
  });

  describe('Random Helpers', () => {
    test('randInt should return a number in range', () => {
      const val = Utils.randInt(5, 10);
      expect(val).toBeGreaterThanOrEqual(5);
      expect(val).toBeLessThanOrEqual(10);
    });

    test('randItem should pick an item from array', () => {
      const arr = [1, 2, 3];
      const val = Utils.randItem(arr);
      expect(arr).toContain(val);
    });
  });
});
