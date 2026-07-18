/**
 * @fileoverview Tickets & Digital Wallet Module
 * Handles QR code generation, ticket display, match schedule, and Fan Zone UI
 */

'use strict';

const Tickets = (() => {

  /**
   * Render the user's digital ticket
   * @param {string} containerId 
   */
  function renderTicket(containerId) {
    const container = Utils.el(containerId);
    if (!container) return;

    // Use a mock ticket for the demo
    const ticket = {
      matchId: 1,
      home: 'USA',
      away: 'MEXICO',
      homeFlag: '🇺🇸',
      awayFlag: '🇲🇽',
      date: '11 Jun 2026',
      time: '15:00 EST',
      venue: 'Estadio Azteca, Mexico City',
      stage: 'Opening Match',
      gate: 'A',
      section: '140',
      row: 'F',
      seat: '12',
      tier: 'Category 1',
      price: '$250',
      name: 'John Doe',
      qrData: 'FIFAWC26-USA-MEX-TKT-991203948'
    };

    const isScanned = Utils.getStorage('ss_ticket_scanned', false);

    container.innerHTML = `
      <div class="ticket-card ${isScanned ? 'scanned' : ''}">
        <div class="ticket-header">
          <div class="ticket-teams">
            <span class="flag">${ticket.homeFlag}</span>
            <span class="team-name">${ticket.home}</span>
            <span class="vs">vs</span>
            <span class="team-name">${ticket.away}</span>
            <span class="flag">${ticket.awayFlag}</span>
          </div>
          <div class="ticket-stage">${ticket.stage}</div>
        </div>
        
        <div class="ticket-body">
          <div class="ticket-info">
            <div class="info-group">
              <span class="label">Date</span>
              <span class="value">${ticket.date}</span>
            </div>
            <div class="info-group">
              <span class="label">Time</span>
              <span class="value">${ticket.time}</span>
            </div>
            <div class="info-group wide">
              <span class="label">Venue</span>
              <span class="value">${ticket.venue}</span>
            </div>
          </div>
          
          <div class="ticket-seating">
            <div class="seat-block">
              <span class="label">Gate</span>
              <span class="value large">${ticket.gate}</span>
            </div>
            <div class="seat-block">
              <span class="label">Section</span>
              <span class="value large">${ticket.section}</span>
            </div>
            <div class="seat-block">
              <span class="label">Row</span>
              <span class="value large">${ticket.row}</span>
            </div>
            <div class="seat-block">
              <span class="label">Seat</span>
              <span class="value large">${ticket.seat}</span>
            </div>
          </div>
          
          <div class="ticket-qr-section" id="ticket-qr-btn">
            <div class="qr-placeholder">
              <div class="qr-grid"></div>
              <span class="qr-text" data-i18n="tickets.scanTicket">${I18n.t('tickets.scanTicket')}</span>
            </div>
            ${isScanned ? '<div class="scanned-stamp">SCANNED</div>' : ''}
          </div>
          
          <div class="ticket-footer">
            <span class="ticket-name">${ticket.name}</span>
            <span class="ticket-tier">${ticket.tier}</span>
          </div>
        </div>
      </div>
    `;

    // Add interactivity for QR scanning
    const qrBtn = container.querySelector('#ticket-qr-btn');
    if (qrBtn && !isScanned) {
      qrBtn.addEventListener('click', () => {
        // Simulate NFC/QR scan
        qrBtn.classList.add('scanning');
        Utils.el('ticket-qr-btn').innerHTML = '<div class="spinner"></div><span class="qr-text">Scanning...</span>';
        
        setTimeout(() => {
          Utils.setStorage('ss_ticket_scanned', true);
          renderTicket(containerId); // re-render as scanned
          Utils.announce('Ticket scanned successfully. Welcome to the stadium!', 'assertive');
        }, 1500);
      });
    }
  }

  /**
   * Render the Match Schedule list
   * @param {string} containerId 
   */
  function renderSchedule(containerId) {
    const container = Utils.el(containerId);
    if (!container) return;

    let html = '<div class="schedule-list">';
    
    KB.matches.forEach(match => {
      const isLive = match.status === 'live';
      const isCompleted = match.status === 'completed';
      
      html += `
        <div class="match-card ${isLive ? 'live-match' : ''}">
          <div class="match-card-header">
            <span class="match-date">${Utils.formatDate(match.date)} • ${Utils.formatTime(match.time)}</span>
            <span class="match-stage">${match.stage}</span>
            ${isLive ? '<span class="live-badge" data-i18n="common.live">LIVE</span>' : ''}
          </div>
          
          <div class="match-card-teams">
            <div class="team">
              <span class="team-flag">${match.home.flag}</span>
              <span class="team-name">${match.home.team}</span>
            </div>
            
            <div class="score-container">
              ${isCompleted || isLive 
                ? `<span class="score">${match.score.home} - ${match.score.away}</span>` 
                : `<span class="vs">vs</span>`
              }
              ${isLive ? `<span class="minute">${match.minute}'</span>` : ''}
            </div>
            
            <div class="team align-right">
              <span class="team-name">${match.away.team}</span>
              <span class="team-flag">${match.away.flag}</span>
            </div>
          </div>
          
          <div class="match-card-footer">
            <span class="match-venue">📍 ${match.venue}, ${match.city}</span>
          </div>
        </div>
      `;
    });
    
    html += '</div>';
    container.innerHTML = html;
  }

  /**
   * Render Fan Zone Activities
   * @param {string} containerId 
   */
  function renderFanZone(containerId) {
    const container = Utils.el(containerId);
    if (!container) return;

    let html = '<div class="fan-zone-grid">';
    
    KB.fanZoneActivities.forEach(activity => {
      html += `
        <div class="activity-card">
          <div class="activity-icon">${activity.emoji}</div>
          <div class="activity-content">
            <h3 class="activity-title">${activity.name}</h3>
            <p class="activity-desc">${activity.description}</p>
            <div class="activity-meta">
              <span class="meta-item">📍 ${activity.location}</span>
              <span class="meta-item">⏱️ ${activity.duration}</span>
              <span class="meta-item tag ${activity.cost === 'Free' ? 'free' : ''}">${activity.cost}</span>
            </div>
          </div>
          <button class="btn btn-outline activity-action" aria-label="Navigate to ${activity.name}">
            <span>Navigate</span> ↗
          </button>
        </div>
      `;
    });
    
    html += '</div>';
    container.innerHTML = html;

    // Add navigation listeners
    container.querySelectorAll('.activity-action').forEach((btn, idx) => {
      btn.addEventListener('click', () => {
        // App router will handle tab switching to navigate
        document.dispatchEvent(new CustomEvent('navigateToActivity', { 
          detail: { activityId: KB.fanZoneActivities[idx].id }
        }));
      });
    });
  }

  return {
    renderTicket,
    renderSchedule,
    renderFanZone
  };
})();

if (typeof module !== 'undefined' && module.exports) module.exports = Tickets;
