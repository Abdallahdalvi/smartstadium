/**
 * @fileoverview Smart Notifications System
 * In-app push-style toast notifications with queuing, priorities, and dismissal
 */

'use strict';

const Notifications = (() => {

  /** @type {HTMLElement|null} Container element */
  let container = null;

  /** @type {Array<{id:string, msg:string, type:string, timeout:number}>} Queued notifications */
  const queue = [];

  /** @type {boolean} Whether notifications are enabled */
  let enabled = true;

  /** @type {number} Auto-dismiss delay in ms */
  const DISMISS_DELAY = 6000;

  /**
   * Predefined matchday notification schedule
   * Each fires after a delay from app init
   * @type {Array<{delay: number, type: string, message: string, icon: string}>}
   */
  const SCHEDULED_ALERTS = [
    { delay: 8000,  type: 'info',    icon: '🚪', message: 'Gates A & B now open — enjoy smooth entry!' },
    { delay: 18000, type: 'warning', icon: '⚠️', message: 'High congestion at Gate A. Consider using Gate B for faster entry.' },
    { delay: 30000, type: 'success', icon: '🍔', message: 'Concessions are less busy now — great time to grab food before half-time rush!' },
    { delay: 45000, type: 'info',    icon: '🌱', message: 'Eco Tip: Recycling bins are near Section 130. Help us hit our 80% diversion goal!' },
    { delay: 60000, type: 'warning', icon: '⏰', message: 'Kickoff in 15 minutes! Head to your seat — Section 140, Row F.' },
    { delay: 80000, type: 'success', icon: '🎉', message: '⚽ Match starts soon! Enjoy the FIFA World Cup 2026!' }
  ];

  /* =========================================================================
   * INITIALIZATION
   * ========================================================================= */

  /**
   * Initialize the notification system, bind toggle from settings
   */
  function init() {
    container = document.getElementById('notification-container');
    if (!container) return;

    // Restore preference
    enabled = Utils.getStorage('ss_notifications', true);
    const toggle = document.getElementById('notifications-toggle');
    if (toggle) {
      toggle.checked = enabled;
      toggle.addEventListener('change', e => {
        enabled = e.target.checked;
        Utils.setStorage('ss_notifications', enabled);
      });
    }

    // Schedule matchday alerts
    SCHEDULED_ALERTS.forEach(({ delay, type, icon, message }) => {
      setTimeout(() => {
        if (enabled) show(message, type, icon);
      }, delay);
    });

    // Bell button opens a simple panel (just a UX hint)
    const bell = document.getElementById('notification-bell');
    if (bell) {
      bell.addEventListener('click', () => {
        show('SmartStadium notifications are active. You\'ll receive real-time alerts!', 'info', '🔔');
      });
    }
  }

  /* =========================================================================
   * SHOW / DISMISS
   * ========================================================================= */

  /**
   * Display a notification toast
   * @param {string} message - Notification text (plain text, no HTML)
   * @param {'info'|'success'|'warning'|'danger'} [type='info'] - Styling variant
   * @param {string} [icon='🔔'] - Emoji icon prefix
   * @returns {string} Notification ID
   */
  function show(message, type = 'info', icon = '🔔') {
    if (!container || !enabled) return '';

    const id = `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const toast = document.createElement('div');
    toast.className = `notification-toast notif-${type}`;
    toast.id = id;
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');

    const msgEl = document.createElement('div');
    msgEl.className = 'notif-body';

    const iconEl = document.createElement('span');
    iconEl.className = 'notif-icon';
    iconEl.textContent = icon;

    const textEl = document.createElement('span');
    textEl.className = 'notif-text';
    textEl.textContent = message;

    const closeBtn = document.createElement('button');
    closeBtn.className = 'notif-close';
    closeBtn.textContent = '✕';
    closeBtn.setAttribute('aria-label', 'Dismiss notification');
    closeBtn.addEventListener('click', () => dismiss(id));

    msgEl.appendChild(iconEl);
    msgEl.appendChild(textEl);
    toast.appendChild(msgEl);
    toast.appendChild(closeBtn);

    container.appendChild(toast);

    // Animate in
    requestAnimationFrame(() => toast.classList.add('show'));

    // Auto-dismiss
    setTimeout(() => dismiss(id), DISMISS_DELAY);

    // Update badge count
    _updateBadge(1);

    return id;
  }

  /**
   * Dismiss a specific notification by ID
   * @param {string} id - Notification element ID
   */
  function dismiss(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.remove('show');
    el.classList.add('hiding');
    setTimeout(() => el.remove(), 350);
    _updateBadge(-1);
  }

  /**
   * Dismiss all visible notifications
   */
  function dismissAll() {
    if (!container) return;
    container.querySelectorAll('.notification-toast').forEach(el => {
      dismiss(el.id);
    });
  }

  /* =========================================================================
   * BADGE
   * ========================================================================= */

  let _badgeCount = 0;

  /**
   * Update the bell notification badge count
   * @param {number} delta - +1 to add, -1 to remove
   * @private
   */
  function _updateBadge(delta) {
    _badgeCount = Math.max(0, _badgeCount + delta);
    const badge = document.getElementById('notif-badge');
    if (!badge) return;
    badge.hidden = _badgeCount === 0;
    badge.textContent = _badgeCount > 9 ? '9+' : String(_badgeCount);
  }

  /* =========================================================================
   * PUBLIC API
   * ========================================================================= */

  return { init, show, dismiss, dismissAll };

})();

if (typeof module !== 'undefined' && module.exports) module.exports = Notifications;
