/**
 * @fileoverview Emergency & Safety Module
 * Handles SOS button, emergency alerts, lost and found forms, and quick contacts.
 */

'use strict';

const Emergency = (() => {

  /**
   * Initialize Emergency module UI
   */
  function init() {
    setupSOSButton();
    setupLostFoundForm();
  }

  /**
   * Setup SOS Button interaction (Hold to trigger)
   */
  function setupSOSButton() {
    const sosBtn = Utils.el('sos-btn');
    if (!sosBtn) return;

    let pressTimer;
    let isPressed = false;
    let progress = 0;
    
    // Create progress ring if it doesn't exist
    let ring = sosBtn.querySelector('.sos-progress-ring');
    if (!ring) {
      sosBtn.insertAdjacentHTML('beforeend', `
        <svg class="sos-progress-ring" viewBox="0 0 100 100">
          <circle class="ring-bg" cx="50" cy="50" r="45"></circle>
          <circle class="ring-fill" cx="50" cy="50" r="45" id="sos-ring-fill"></circle>
        </svg>
      `);
    }
    
    const ringFill = Utils.el('sos-ring-fill');
    if (ringFill) {
      const circumference = 2 * Math.PI * 45;
      ringFill.style.strokeDasharray = `${circumference} ${circumference}`;
      ringFill.style.strokeDashoffset = circumference;
    }

    const startPress = (e) => {
      e.preventDefault();
      if (isPressed) return;
      isPressed = true;
      sosBtn.classList.add('pressing');
      progress = 0;
      
      const circumference = 2 * Math.PI * 45;

      pressTimer = setInterval(() => {
        progress += 5; // 5% per 100ms = 2 seconds total
        
        if (ringFill) {
          const offset = circumference - (progress / 100) * circumference;
          ringFill.style.strokeDashoffset = offset;
        }

        if (progress >= 100) {
          clearInterval(pressTimer);
          triggerSOSEmergency();
          resetSOSBtn();
        }
      }, 100);
    };

    const cancelPress = () => {
      isPressed = false;
      clearInterval(pressTimer);
      sosBtn.classList.remove('pressing');
      progress = 0;
      if (ringFill) {
        ringFill.style.strokeDashoffset = 2 * Math.PI * 45;
      }
    };

    sosBtn.addEventListener('mousedown', startPress);
    sosBtn.addEventListener('touchstart', startPress, { passive: false });
    
    document.addEventListener('mouseup', cancelPress);
    document.addEventListener('touchend', cancelPress);
    document.addEventListener('touchcancel', cancelPress);
    sosBtn.addEventListener('mouseleave', cancelPress);

    function resetSOSBtn() {
      cancelPress();
      sosBtn.classList.add('triggered');
      setTimeout(() => {
        sosBtn.classList.remove('triggered');
      }, 3000);
    }
  }

  /**
   * Trigger the actual SOS emergency sequence
   */
  function triggerSOSEmergency() {
    Utils.announce('Emergency SOS triggered. Sending location to security.', 'assertive');
    
    // Vibrate device heavily
    if (navigator.vibrate) {
      navigator.vibrate([200, 100, 200, 100, 500]);
    }

    // Trigger heatmap overlay
    if (window.CrowdManager) {
      CrowdManager.triggerEmergencyAlert('medical'); // Defaulting to medical for SOS
    }

    // Show confirmation toast
    const toast = document.createElement('div');
    toast.className = 'sos-toast';
    toast.innerHTML = `
      <div class="toast-icon">🚨</div>
      <div class="toast-content">
        <h4>SOS Sent</h4>
        <p>Security is responding to your location (Gate A, Sec 105).</p>
      </div>
    `;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.classList.add('show');
    }, 10);

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 6000);
  }

  /**
   * Setup Lost and Found Form submission
   */
  function setupLostFoundForm() {
    const form = Utils.el('lost-found-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const type = Utils.el('lf-type')?.value;
      const desc = Utils.el('lf-desc')?.value;
      
      if (!type || !desc) {
        Utils.announce('Please fill out all fields.', 'polite');
        return;
      }

      // Sanitize input just to be safe
      const cleanDesc = Utils.sanitize(desc);

      const submitBtn = form.querySelector('button[type="submit"]');
      const origText = submitBtn.innerHTML;
      submitBtn.innerHTML = '<span class="spinner-small"></span> Submitting...';
      submitBtn.disabled = true;

      // Simulate API call
      setTimeout(() => {
        submitBtn.innerHTML = '✅ Report Submitted';
        Utils.announce(`Report submitted successfully. Reference number: ${Math.floor(Math.random() * 90000) + 10000}`, 'polite');
        
        setTimeout(() => {
          form.reset();
          submitBtn.innerHTML = origText;
          submitBtn.disabled = false;
        }, 3000);
      }, 1500);
    });
  }

  /**
   * Render safety contacts list
   * @param {string} containerId 
   */
  function renderContacts(containerId) {
    const container = Utils.el(containerId);
    if (!container) return;

    let html = '<ul class="contact-list" style="list-style:none; padding:0; display:grid; gap:16px;">';
    KB.emergency.contacts.forEach(contact => {
      html += `
        <li class="contact-item card" style="display:flex; align-items:center; gap:16px; padding:16px;">
          <div class="contact-icon" style="font-size:24px; background:${contact.color}22; padding:12px; border-radius:12px;">${contact.emoji}</div>
          <div class="contact-details" style="flex:1;">
            <h4 class="contact-label" style="margin:0; font-size:16px;">${contact.name}</h4>
            <p style="margin:4px 0 8px 0; font-size:12px; opacity:0.7;">${contact.description}</p>
            <a href="tel:${contact.number}" class="contact-number gold-text" style="font-weight:600; text-decoration:none;">${contact.number}</a>
          </div>
          <a href="tel:${contact.number}" class="btn btn-icon btn-primary" style="border-radius:50%; width:44px; height:44px;" aria-label="Call ${contact.name}">
            📞
          </a>
        </li>
      `;
    });
    html += '</ul>';
    
    container.innerHTML = html;
  }

  return {
    init,
    renderContacts
  };
})();

if (typeof module !== 'undefined' && module.exports) module.exports = Emergency;
