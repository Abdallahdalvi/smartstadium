/**
 * @fileoverview Utility functions — sanitization, formatting, DOM helpers
 * Security-focused: all user content sanitized before DOM insertion
 */

'use strict';

const Utils = (() => {

  /* =========================================================================
   * SECURITY: Input Sanitization
   * ========================================================================= */

  /**
   * Escape HTML special characters to prevent XSS
   * @param {string} str - Raw user input
   * @returns {string} HTML-safe string
   */
  function escapeHtml(str) {
    if (typeof str !== 'string') return '';
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return str.replace(/[&<>"']/g, m => map[m]);
  }

  /**
   * Sanitize text for safe display (strips tags, limits length)
   * @param {string} input - Raw input
   * @param {number} [maxLen=500] - Maximum allowed length
   * @returns {string} Sanitized string
   */
  function sanitize(input, maxLen = 500) {
    if (typeof input !== 'string') return '';
    return escapeHtml(input.trim().slice(0, maxLen));
  }

  /**
   * Validate that a string contains no dangerous patterns
   * @param {string} input
   * @returns {boolean}
   */
  function isSafeInput(input) {
    if (typeof input !== 'string') return false;
    const dangerous = /<script|javascript:|data:|vbscript:|on\w+=/i;
    return !dangerous.test(input);
  }

  /* =========================================================================
   * FORMATTING
   * ========================================================================= */

  /**
   * Format a date string to human-readable format
   * @param {string} dateStr - ISO date string YYYY-MM-DD
   * @param {string} [locale='en-US']
   * @returns {string}
   */
  function formatDate(dateStr, locale = 'en-US') {
    try {
      const d = new Date(dateStr + 'T00:00:00');
      return d.toLocaleDateString(locale, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  }

  /**
   * Format time to 12h format
   * @param {string} timeStr - HH:MM
   * @returns {string}
   */
  function formatTime(timeStr) {
    try {
      const [h, m] = timeStr.split(':').map(Number);
      const suffix = h >= 12 ? 'PM' : 'AM';
      const hour = ((h + 11) % 12 + 1);
      return `${hour}:${String(m).padStart(2, '0')} ${suffix}`;
    } catch {
      return timeStr;
    }
  }

  /**
   * Get current time string HH:MM AM/PM
   * @returns {string}
   */
  function getCurrentTime() {
    return new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  }

  /**
   * Format a number with commas
   * @param {number} n
   * @returns {string}
   */
  function formatNumber(n) {
    return n.toLocaleString('en-US');
  }

  /**
   * Compute countdown from now to a future date string
   * @param {string} targetDateStr - YYYY-MM-DD
   * @param {string} targetTimeStr - HH:MM
   * @returns {{ days: number, hours: number, minutes: number, seconds: number, expired: boolean }}
   */
  function getCountdown(targetDateStr, targetTimeStr) {
    const target = new Date(`${targetDateStr}T${targetTimeStr}:00`).getTime();
    const now = Date.now();
    const diff = target - now;

    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };

    const days    = Math.floor(diff / 86400000);
    const hours   = Math.floor((diff % 86400000) / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return { days, hours, minutes, seconds, expired: false };
  }

  /* =========================================================================
   * DOM HELPERS
   * ========================================================================= */

  /**
   * Safely get DOM element by ID
   * @param {string} id
   * @returns {HTMLElement|null}
   */
  function el(id) {
    return document.getElementById(id);
  }

  /**
   * Query selector shorthand
   * @param {string} selector
   * @param {Element} [root=document]
   * @returns {Element|null}
   */
  function qs(selector, root = document) {
    return root.querySelector(selector);
  }

  /**
   * Query selector all shorthand
   * @param {string} selector
   * @param {Element} [root=document]
   * @returns {NodeList}
   */
  function qsa(selector, root = document) {
    return root.querySelectorAll(selector);
  }

  /**
   * Safely set text content of an element
   * @param {string} id
   * @param {string} text
   */
  function setText(id, text) {
    const elem = el(id);
    if (elem) elem.textContent = String(text);
  }

  /**
   * Safely set innerHTML with DOMPurify sanitization
   * Falls back to raw assignment only when DOMPurify is unavailable (e.g., test env)
   * @param {string|Element} target - Element ID or DOM element
   * @param {string} html - HTML string to sanitize and insert
   */
  function setHTML(target, html) {
    const elem = typeof target === 'string' ? el(target) : target;
    if (!elem) return;
    const clean = (typeof DOMPurify !== 'undefined')
      ? DOMPurify.sanitize(html, { ADD_ATTR: ['aria-live', 'aria-label', 'data-i18n', 'role'] })
      : html;
    elem.innerHTML = clean;
  }

  /**
   * Add event listener with optional debounce
   * @param {Element} elem
   * @param {string} event
   * @param {Function} handler
   * @param {number} [debounceMs=0]
   */
  function on(elem, event, handler, debounceMs = 0) {
    if (!elem) return;
    const fn = debounceMs > 0 ? debounce(handler, debounceMs) : handler;
    elem.addEventListener(event, fn);
    return fn; // return for potential removal
  }

  /**
   * Animate a number counting up from 0 to target
   * @param {Element} el
   * @param {number} target
   * @param {number} [duration=1200]
   */
  function animateCounter(elem, target, duration = 1200) {
    if (!elem) return;
    const start = performance.now();
    const update = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      elem.textContent = Math.round(eased * target).toLocaleString();
      if (progress < 1) requestAnimationFrame(update);
    };
    requestAnimationFrame(update);
  }

  /* =========================================================================
   * PERFORMANCE: Debounce & Throttle
   * ========================================================================= */

  /**
   * Debounce a function
   * @param {Function} fn
   * @param {number} wait
   * @returns {Function}
   */
  function debounce(fn, wait) {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), wait);
    };
  }

  /**
   * Throttle a function
   * @param {Function} fn
   * @param {number} limit
   * @returns {Function}
   */
  function throttle(fn, limit) {
    let inThrottle;
    return function (...args) {
      if (!inThrottle) {
        fn.apply(this, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  }

  /* =========================================================================
   * STORAGE (with error handling)
   * ========================================================================= */

  /**
   * Safely get item from localStorage
   * @param {string} key
   * @param {*} defaultVal
   * @returns {*}
   */
  function getStorage(key, defaultVal = null) {
    try {
      const val = localStorage.getItem(key);
      return val !== null ? JSON.parse(val) : defaultVal;
    } catch {
      return defaultVal;
    }
  }

  /**
   * Safely set item in localStorage
   * @param {string} key
   * @param {*} value
   * @returns {boolean} success
   */
  function setStorage(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      console.warn('[Utils] localStorage unavailable');
      return false;
    }
  }

  /**
   * Remove item from localStorage
   * @param {string} key
   */
  function removeStorage(key) {
    try { localStorage.removeItem(key); } catch { /* noop */ }
  }

  /* =========================================================================
   * GEOLOCATION
   * ========================================================================= */

  /**
   * Get current geolocation as a promise
   * @returns {Promise<{lat: number, lng: number}>}
   */
  function getLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        pos => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        err => reject(err),
        { timeout: 8000, maximumAge: 30000 }
      );
    });
  }

  /* =========================================================================
   * RANDOM HELPERS
   * ========================================================================= */

  /**
   * Random integer between min and max (inclusive)
   * @param {number} min
   * @param {number} max
   * @returns {number}
   */
  function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Random float between 0 and 1 with optional max
   * @param {number} [max=1]
   * @returns {number}
   */
  function randFloat(max = 1) {
    return Math.random() * max;
  }

  /**
   * Pick a random element from an array
   * @param {Array} arr
   * @returns {*}
   */
  function randItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  /**
   * Generate a unique ID string
   * @param {string} [prefix='id']
   * @returns {string}
   */
  function uid(prefix = 'id') {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }

  /* =========================================================================
   * ARIA / ACCESSIBILITY
   * ========================================================================= */

  /**
   * Announce a message to screen readers via aria-live region
   * @param {string} message
   * @param {'polite'|'assertive'} [priority='polite']
   */
  function announce(message, priority = 'polite') {
    let liveRegion = document.getElementById('aria-live-region');
    if (!liveRegion) {
      liveRegion = document.createElement('div');
      liveRegion.id = 'aria-live-region';
      liveRegion.setAttribute('aria-live', priority);
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.className = 'sr-only';
      document.body.appendChild(liveRegion);
    }
    liveRegion.setAttribute('aria-live', priority);
    // Clear then set — forces re-announcement
    liveRegion.textContent = '';
    requestAnimationFrame(() => {
      liveRegion.textContent = message;
    });
  }

  /**
   * Trap focus inside a modal element
   * @param {Element} container
   * @returns {Function} cleanup function
   */
  function trapFocus(container) {
    const focusable = container.querySelectorAll(
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last  = focusable[focusable.length - 1];

    function handler(e) {
      if (e.key !== 'Tab') return;
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    }

    container.addEventListener('keydown', handler);
    if (first) first.focus();
    return () => container.removeEventListener('keydown', handler);
  }

  /* =========================================================================
   * PUBLIC API
   * ========================================================================= */
  return {
    escapeHtml,
    sanitize,
    isSafeInput,
    formatDate,
    formatTime,
    getCurrentTime,
    formatNumber,
    getCountdown,
    el,
    qs,
    qsa,
    setText,
    setHTML,
    on,
    animateCounter,
    debounce,
    throttle,
    getStorage,
    setStorage,
    removeStorage,
    getLocation,
    randInt,
    randFloat,
    randItem,
    uid,
    announce,
    trapFocus
  };
})();

if (typeof module !== 'undefined' && module.exports) module.exports = Utils;
