/**
 * @fileoverview Main Application Logic & Router
 * Connects all modules, handles navigation, routing, new features
 * @version 3.0 — PromptWars Challenge 4 Build
 */

'use strict';

document.addEventListener('DOMContentLoaded', () => {

  // ─── App State ─────────────────────────────────────────────────────────────
  let currentSection = 'home';
  let chatHistory    = [];
  let crowdPredictionTimer = null;
  let sustainabilityActive = false;

  // ─── DOM Element Cache ──────────────────────────────────────────────────────
  const els = {
    sections:          document.querySelectorAll('.app-section'),
    navBtns:           document.querySelectorAll('.nav-btn'),
    headerTitle:       document.getElementById('header-title'),
    chatInput:         document.getElementById('chat-input'),
    chatSendBtn:       document.getElementById('chat-send-btn'),
    chatVoiceBtn:      document.getElementById('chat-voice-btn'),
    chatMessages:      document.getElementById('chat-messages'),
    chatQuickReplies:  document.getElementById('chat-quick-replies'),
    navSearch:         document.getElementById('nav-search'),
    navResults:        document.getElementById('nav-results'),
    navClearBtn:       document.getElementById('nav-clear-route'),
    navDirections:     document.getElementById('nav-directions-panel'),
    langSelect:        document.getElementById('lang-select'),
    highContrastToggle:document.getElementById('high-contrast-toggle'),
    reduceMotionToggle:document.getElementById('reduce-motion-toggle'),
    fontSizeSelect:    document.getElementById('font-size-select'),
  };

  /* =========================================================================
   * INITIALIZATION
   * ========================================================================= */

  /**
   * Bootstrap all application modules
   */
  function init() {
    // Core modules
    I18n.init();
    Emergency.init();
    Wayfinding.renderMap('svg-map-container');
    Tickets.renderTicket('ticket-container');
    Tickets.renderSchedule('schedule-container');
    Tickets.renderFanZone('fanzone-container');
    Emergency.renderContacts('contacts-container');
    SustainabilityModule.init();
    Notifications.init();

    // Feature wiring
    setupNavigation();
    setupSectionTabs();
    setupMapFilters();
    setupChat();
    setupChatCategories();
    setupWayfinding();
    setupSettings();
    setupPWA();
    setupEventDelegations();

    // Dashboard
    renderDashboard();
    renderDigitalTwin();
    renderFanJourney();
    startDashboardClock();

    // Restore persisted accessibility settings
    if (Utils.getStorage('ss_high_contrast', false)) {
      document.body.classList.add('high-contrast');
      if (els.highContrastToggle) els.highContrastToggle.checked = true;
    }
    if (Utils.getStorage('ss_reduce_motion', false)) {
      document.body.classList.add('reduce-motion');
      if (els.reduceMotionToggle) els.reduceMotionToggle.checked = true;
    }
    const savedFontSize = Utils.getStorage('ss_font_size', 'medium');
    document.documentElement.setAttribute('data-font-size', savedFontSize);
    if (els.fontSizeSelect) els.fontSizeSelect.value = savedFontSize;

    // Clear legacy developer key
    Utils.removeStorage('ss_gemini_key');

    // Restore initial language UI
    updateLanguageUI();

    // Hide loader
    setTimeout(() => {
      const loader = document.getElementById('app-loader');
      if (loader) {
        loader.style.opacity = '0';
        setTimeout(() => loader.remove(), 500);
      }
    }, 1000);
  }

  /* =========================================================================
   * NAVIGATION & ROUTING
   * ========================================================================= */

  function setupNavigation() {
    els.navBtns.forEach(btn => {
      btn.addEventListener('click', e => {
        const target = e.currentTarget.dataset.target;
        if (target) switchSection(target);
      });
    });

    document.querySelectorAll('.btn-back').forEach(btn => {
      btn.addEventListener('click', () => switchSection('home'));
    });

    document.addEventListener('navigateToSection', e => {
      if (e.detail?.section) switchSection(e.detail.section);
    });
  }

  /**
   * Switch the active section, handling enter/leave side effects
   * @param {string} sectionId
   */
  function switchSection(sectionId) {
    if (currentSection === sectionId) return;

    // ── Leave handlers ──────────────────────────────────────────────────
    if (currentSection === 'crowd') {
      CrowdManager.stopSimulation();
      if (crowdPredictionTimer) { clearInterval(crowdPredictionTimer); crowdPredictionTimer = null; }
    }
    if (currentSection === 'sustainability') {
      SustainabilityModule.stopSimulation();
    }

    // Hide all
    els.sections.forEach(sec => sec.classList.remove('active'));
    els.navBtns.forEach(btn => btn.classList.remove('active'));

    // Show target
    const targetEl = document.getElementById(`section-${sectionId}`);
    if (targetEl) targetEl.classList.add('active');
    const targetNav = document.querySelector(`.nav-btn[data-target="${sectionId}"]`);
    if (targetNav) targetNav.classList.add('active');

    updateHeader(sectionId);

    // ── Enter handlers ──────────────────────────────────────────────────
    if (sectionId === 'crowd') {
      setTimeout(() => {
        CrowdManager.initCanvas('heatmap-canvas');
        CrowdManager.startSimulation();
        updateCrowdPredictions();
      }, 80);
    }
    if (sectionId === 'sustainability') {
      setTimeout(() => SustainabilityModule.startSimulation(), 80);
    }

    currentSection = sectionId;
    window.scrollTo(0, 0);
  }

  function updateHeader(sectionId) {
    const titles = {
      home: `<span class="gold-text">Smart</span>Stadium`,
      navigate:       'Navigation',
      assistant:      'AI Assistant',
      crowd:          'Crowd Intelligence',
      tickets:        'Tickets & Fan Zone',
      sustainability: 'Green Stadium',
      emergency:      'Safety & Emergency'
    };
    if (sectionId === 'home') {
      els.headerTitle.innerHTML = titles.home;
    } else {
      const key = sectionId === 'assistant' ? 'chat.title' : `${sectionId}.title`;
      const translated = I18n.t(key);
      els.headerTitle.textContent = (translated !== key) ? translated : (titles[sectionId] || sectionId.toUpperCase());
    }
  }

  /* =========================================================================
   * SECTION TABS (Navigate: Wayfinding / Transport Hub)
   * Tickets: Wallet / Schedule / Fan Zone / Journey
   * ========================================================================= */

  function setupSectionTabs() {
    // Navigate section tabs
    document.querySelectorAll('.section-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tabId = btn.dataset.tab;
        document.querySelectorAll('.section-tab-btn').forEach(b => {
          b.classList.remove('active');
          b.setAttribute('aria-selected', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');

        document.getElementById('tab-wayfinding').style.display = tabId === 'wayfinding' ? 'block' : 'none';
        document.getElementById('tab-transport').style.display  = tabId === 'transport'  ? 'block' : 'none';
      });
    });

    // Ticket section tabs
    const ticketTabs = ['wallet', 'schedule', 'fanzone', 'journey'];
    ticketTabs.forEach(tab => {
      const btn = document.getElementById(`tab-${tab}-btn`);
      if (!btn) return;
      btn.addEventListener('click', () => {
        ticketTabs.forEach(t => {
          const b = document.getElementById(`tab-${t}-btn`);
          const p = document.getElementById(`tab-${t}`);
          if (b) { b.classList.remove('active'); b.setAttribute('aria-selected','false'); }
          if (p) p.style.display = 'none';
        });
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');
        const panel = document.getElementById(`tab-${tab}`);
        if (panel) panel.style.display = 'block';
      });
    });
  }

   /* =========================================================================
   * EVENT DELEGATIONS (Replaces inline HTML event handlers)
   * ========================================================================= */

  function setupEventDelegations() {
    const settingsModal = document.getElementById('settings-modal');
    
    Utils.on(document.getElementById('header-settings-btn'), 'click', () => {
      if (settingsModal) settingsModal.classList.add('show');
    });
    
    Utils.on(document.getElementById('settings-close-btn'), 'click', () => {
      if (settingsModal) settingsModal.classList.remove('show');
    });
    
    Utils.on(document.getElementById('emergency-ack-btn'), 'click', () => {
      const overlay = document.getElementById('emergency-overlay');
      if (overlay) overlay.classList.remove('show');
    });
    
    const setupQACard = (id, target) => {
      const card = document.getElementById(id);
      if (!card) return;
      const handler = () => {
        const btn = document.querySelector(`.nav-btn[data-target='${target}']`);
        if (btn) btn.click();
      };
      Utils.on(card, 'click', handler);
      Utils.on(card, 'keydown', (e) => {
        if (e.key === 'Enter') handler();
      });
    };
    
    setupQACard('qa-navigate-card', 'navigate');
    setupQACard('qa-tickets-card', 'tickets');
    setupQACard('qa-sustainability-card', 'sustainability');
    setupQACard('qa-crowd-card', 'crowd');
  }

  /* =========================================================================
   * MAP FILTER BUTTONS
   * ========================================================================= */

  function setupMapFilters() {
    document.querySelectorAll('.map-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.map-filter-btn').forEach(b => {
          b.classList.remove('active');
          b.setAttribute('aria-pressed', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-pressed', 'true');

        const filter = btn.dataset.filter;
        Wayfinding.filterMarkers(filter);
      });
    });
  }

  /* =========================================================================
   * DIGITAL TWIN WIDGET
   * ========================================================================= */

  /**
   * Render the Digital Twin zone occupancy grid
   */
  function renderDigitalTwin() {
    const container = document.getElementById('digital-twin-widget');
    if (!container) return;

    const zones = [
      { name: 'North Stand',    pct: 68, color: 'var(--color-warning)', status: 'moderate' },
      { name: 'South Stand',    pct: 45, color: 'var(--color-success)', status: 'ok' },
      { name: 'East Stand',     pct: 82, color: 'var(--color-danger)', status: 'high' },
      { name: 'West Stand',     pct: 51, color: 'var(--color-success)', status: 'ok' },
      { name: 'Gate A',         pct: 87, color: 'var(--color-danger)', status: 'high' },
      { name: 'Gate B',         pct: 31, color: 'var(--color-success)', status: 'ok' },
      { name: 'Gate C',         pct: 55, color: 'var(--color-warning)', status: 'moderate' },
      { name: 'Concourses',     pct: 73, color: 'var(--color-warning)', status: 'moderate' },
    ];

    const html = zones.map(z => `
      <div class="twin-zone">
        <span class="twin-zone-name">${Utils.escapeHtml(z.name)}</span>
        <div class="twin-bar-wrap">
          <div class="twin-bar-fill" style="width:${z.pct}%;background:${z.color}"></div>
        </div>
        <span class="twin-pct">${z.pct}%</span>
        <span class="twin-status ${z.status}">${z.status === 'ok' ? 'Clear' : z.status === 'moderate' ? 'Moderate' : 'High'}</span>
      </div>
    `).join('');

    Utils.setHTML(container, html);

    // Animate bars in
    setTimeout(() => {
      container.querySelectorAll('.twin-bar-fill').forEach((bar, i) => {
        const pct = zones[i].pct;
        bar.style.width = '0%';
        setTimeout(() => { bar.style.width = `${pct}%`; }, 50 + i * 80);
      });
    }, 100);

    // Live tick — small variations
    setInterval(() => {
      container.querySelectorAll('.twin-zone').forEach((card, i) => {
        const bar = card.querySelector('.twin-bar-fill');
        const pctEl = card.querySelector('.twin-pct');
        if (!bar || !pctEl) return;
        const cur = parseInt(pctEl.textContent, 10);
        const next = Math.min(98, Math.max(20, cur + Utils.randInt(-2, 2)));
        bar.style.width = `${next}%`;
        pctEl.textContent = `${next}%`;
      });
    }, 4000);
  }

  /* =========================================================================
   * FAN JOURNEY TIMELINE
   * ========================================================================= */

  function renderFanJourney() {
    const container = document.getElementById('fan-journey-container');
    if (!container) return;

    const steps = [
      { time: '12:30',  status: 'done',     color: 'var(--color-success)', title: 'Leave for Stadium',     desc: 'Take NJ Transit from Penn Station — direct 20-min ride to Meadowlands Station.' },
      { time: '13:15',  status: 'done',     color: 'var(--color-success)', title: 'Arrive at Stadium',      desc: 'Enter via Gate A — your designated gate for Section 140. Average wait: 4 min.' },
      { time: '13:25',  status: 'done',     color: 'var(--color-success)', title: 'Grab Food & Drinks',     desc: 'Concessions are quiet now. Recommended: International Zone at Section 130.' },
      { time: '13:45',  status: 'next',     color: '#0057b8', title: 'Find Your Seat',         desc: 'Section 140, Row F, Seat 12. Turn left at Gate A concourse — clearly signposted.' },
      { time: '14:00',  status: 'upcoming', color: '#aec9ec', title: 'Kickoff! 🎉',            desc: 'USA 🇺🇸 vs Mexico 🇲🇽 — MetLife Stadium, FIFA World Cup 2026 Group Stage.' },
      { time: '15:00',  status: 'upcoming', color: '#aec9ec', title: 'Half-time Strategy',     desc: 'AI Tip: Skip concessions — peak queue in 2 min. Restroom at Section 138 is nearest.' },
      { time: '15:50',  status: 'upcoming', color: '#aec9ec', title: 'Final Whistle',          desc: 'Enjoy the atmosphere! Post-match celebrations in Fan Zone South.' },
      { time: '16:15',  status: 'upcoming', color: '#aec9ec', title: 'Post-Match Exit',        desc: 'AI recommends: exit via Gate B (shorter queue). Rail departs every 8 min.' },
    ];

    const html = steps.map((s, i) => `
      <div class="journey-step">
        <div class="journey-time">${Utils.escapeHtml(s.time)}</div>
        <div class="journey-connector">
          <div class="journey-dot" style="background:${s.color}"></div>
          ${i < steps.length - 1 ? '<div class="journey-line"></div>' : ''}
        </div>
        <div class="journey-content">
          <strong>${Utils.escapeHtml(s.title)}</strong>
          <p>${Utils.escapeHtml(s.desc)}</p>
          <span class="journey-status ${s.status}">${s.status === 'done' ? '✓ Done' : s.status === 'next' ? '→ Up Next' : '· Upcoming'}</span>
        </div>
      </div>
    `).join('');

    Utils.setHTML(container, html);
  }

  /* =========================================================================
   * ENTERPRISE DASHBOARD
   * ========================================================================= */

  function renderDashboard() {
    const container = document.getElementById('dashboard-insights');
    if (!container) return;

    const insights = AIEngine.generateDashboardInsights();
    if (!insights?.length) return;

    const cardsHtml = insights.map(ins => {
      const bodyId   = `insight-body-${ins.id}`;
      const toggleId = `insight-toggle-${ins.id}`;
      return `
        <article
          class="insight-card severity-${Utils.escapeHtml(ins.severity)}"
          aria-label="${Utils.escapeHtml(ins.title)} — ${Utils.escapeHtml(ins.severity)} severity"
        >
          <div class="insight-card-header">
            <span class="insight-icon" aria-hidden="true">${Utils.escapeHtml(ins.icon)}</span>
            <div class="insight-header-text">
              <h3 class="insight-title">${Utils.escapeHtml(ins.title)}</h3>
              <span class="insight-agent-badge">🤖 ${Utils.escapeHtml(ins.agent)}</span>
            </div>
            <span
              class="insight-severity-badge ${Utils.escapeHtml(ins.severity)}"
              aria-label="Severity: ${Utils.escapeHtml(ins.severity)}"
            >${Utils.escapeHtml(ins.severity.toUpperCase())}</span>
          </div>

          <div class="insight-recommendation" role="region" aria-label="AI Recommendation">
            <div class="insight-recommendation-label">💡 AI Recommendation</div>
            <p class="insight-recommendation-text">${Utils.escapeHtml(ins.recommendation)}</p>
          </div>

          <div class="insight-details">
            <button
              id="${toggleId}"
              class="insight-details-toggle"
              aria-expanded="false"
              aria-controls="${bodyId}"
              data-body-id="${bodyId}"
            >
              <span>Reasoning &amp; Evidence</span>
              <i class="toggle-chevron" aria-hidden="true">▾</i>
            </button>
            <div id="${bodyId}" class="insight-details-body" role="region" aria-labelledby="${toggleId}" hidden>
              <p class="insight-reasoning-label">AI Reasoning</p>
              <p class="insight-reasoning-text">${Utils.escapeHtml(ins.reasoning)}</p>
              <div class="insight-meta-row">
                <div class="insight-meta-item">
                  <span class="insight-meta-label">Confidence</span>
                  <span class="insight-meta-value">${Utils.escapeHtml(String(ins.confidence))}%</span>
                  <div class="confidence-bar" aria-hidden="true">
                    <div class="confidence-track">
                      <div class="confidence-fill" style="width:${Utils.escapeHtml(String(ins.confidence))}%"></div>
                    </div>
                    <span class="confidence-label">${Utils.escapeHtml(String(ins.confidence))}%</span>
                  </div>
                </div>
              </div>
              <p class="insight-impact-text"><strong>Impact:</strong> ${Utils.escapeHtml(ins.impact)}</p>
            </div>
          </div>
        </article>
      `;
    }).join('');

    Utils.setHTML(container, cardsHtml);

    // Accordion delegation
    container.addEventListener('click', e => {
      const btn = e.target.closest('.insight-details-toggle');
      if (!btn) return;
      const bodyId   = btn.dataset.bodyId;
      const body     = document.getElementById(bodyId);
      if (!body) return;
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!expanded));
      body.classList.toggle('open', !expanded);
      body.hidden = expanded;
    });

    container.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        const btn = e.target.closest('.insight-details-toggle');
        if (btn) { e.preventDefault(); btn.click(); }
      }
    });
  }

  /**
   * Start the dashboard clock — EST timezone
   */
  function startDashboardClock() {
    const clockEl = document.getElementById('dash-clock');
    if (!clockEl) return;

    function tick() {
      try {
        const now = new Date();
        clockEl.textContent = now.toLocaleTimeString('en-US', {
          timeZone: 'America/New_York',
          hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
        }) + ' EST';
      } catch {
        clockEl.textContent = new Date().toLocaleTimeString();
      }
    }
    tick();
    setInterval(tick, 1000);
  }

  /* =========================================================================
   * CHAT / AI ASSISTANT
   * ========================================================================= */

  function setupChat() {
    if (!els.chatSendBtn) return;

    els.chatSendBtn.addEventListener('click', handleChatSubmit);
    els.chatInput.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleChatSubmit(); }
    });

    if (AIEngine.isVoiceSupported()) {
      els.chatVoiceBtn.addEventListener('click', toggleVoiceInput);
    } else {
      els.chatVoiceBtn.style.display = 'none';
    }

    // Quick replies
    els.chatQuickReplies.addEventListener('click', e => {
      const btn = e.target.closest('.quick-reply-btn');
      if (btn) {
        els.chatInput.value = btn.textContent.trim();
        handleChatSubmit();
      }
    });

    // Initial greeting with demo conversation
    if (chatHistory.length === 0) {
      appendChatMessage('bot',
        `👋 **Welcome to SmartStadium AI!**\n\nI'm your FIFA World Cup 2026 companion. I can help with:\n• 📍 Finding your seat & navigating the stadium\n• 🍔 Food options (halal, vegan, allergen info)\n• 🚇 Transport & parking\n• 🌱 Sustainability & green tips\n• ♿ Accessibility services\n• 🚨 Safety & emergency info\n\nYour ticket: **Section 140, Row F, Seat 12** — USA vs Mexico 🇺🇸🇲🇽\n\nWhat can I help you with today?`
      );
    }
  }

  /**
   * Setup category chip quick-filters at top of chat
   */
  function setupChatCategories() {
    const chips = document.querySelectorAll('.cat-chip');
    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        chips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');

        const queryMap = {
          navigate:       'Where is my seat? How do I get to section 140?',
          food:           'What food options are available? Show me the menu.',
          transport:      'How do I get to the stadium? What are my transport options?',
          sustainability: 'What is the stadium doing for sustainability? What is my carbon footprint?',
          accessibility:  'What accessibility services are available at the stadium?',
          emergency:      'What should I do in an emergency? Where is the nearest first aid?'
        };

        const query = queryMap[chip.dataset.query];
        if (query) {
          els.chatInput.value = query;
          handleChatSubmit();
        }
      });
    });
  }

  async function handleChatSubmit() {
    const text = els.chatInput.value.trim();
    if (!text) return;

    els.chatInput.value = '';
    AIEngine.stopSpeaking();
    appendChatMessage('user', text);

    const typingId = `typing-${Date.now()}`;
    appendChatMessage('bot', '<span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>', typingId);
    scrollToChatBottom();

    try {
      const response = await AIEngine.respond(text, {
        stadium: 'MetLife Stadium',
        language: I18n.getLang()
      });
      const typingEl = document.getElementById(typingId);
      if (typingEl) typingEl.remove();
      appendChatMessage('bot', response);

      if (Utils.getStorage('ss_last_input_voice', false)) {
        AIEngine.speak(response);
        Utils.setStorage('ss_last_input_voice', false);
      }
    } catch (err) {
      console.error('[Chat]', err);
      const typingEl = document.getElementById(typingId);
      if (typingEl) typingEl.remove();
      appendChatMessage('bot', '⚠️ Sorry, I encountered an error. Please try again.');
    }
  }

  /**
   * Append a chat message bubble to the conversation
   * @param {'bot'|'user'} sender
   * @param {string} text
   * @param {string|null} [id]
   */
  function appendChatMessage(sender, text, id = null) {
    const row = document.createElement('div');
    row.className = `message-row ${sender === 'bot' ? 'ai' : 'user'}`;
    if (id) row.id = id;

    const bubble = document.createElement('div');
    bubble.className = 'message-bubble';

    if (sender === 'bot') {
      const escaped = Utils.escapeHtml(text);
      const md = escaped
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/\n/g, '<br>');
      Utils.setHTML(bubble, md);
    } else {
      bubble.textContent = text;
    }

    row.appendChild(bubble);
    els.chatMessages.appendChild(row);
    chatHistory.push({ sender, text });
    scrollToChatBottom();
  }

  function scrollToChatBottom() {
    if (els.chatMessages) els.chatMessages.scrollTop = els.chatMessages.scrollHeight;
  }

  function toggleVoiceInput() {
    if (AIEngine.isListening()) {
      AIEngine.stopListening();
      els.chatVoiceBtn.classList.remove('listening');
      els.chatInput.placeholder = I18n.t('chat.placeholder');
    } else {
      els.chatInput.placeholder = 'Listening...';
      els.chatVoiceBtn.classList.add('listening');

      AIEngine.startListening(
        transcript => {
          els.chatInput.value = transcript;
          Utils.setStorage('ss_last_input_voice', true);
          handleChatSubmit();
        },
        errMsg => {
          Utils.announce(errMsg, 'assertive');
          els.chatInput.placeholder = I18n.t('chat.placeholder');
          els.chatVoiceBtn.classList.remove('listening');
        },
        () => {
          els.chatVoiceBtn.classList.remove('listening');
          if (!els.chatInput.value) els.chatInput.placeholder = I18n.t('chat.placeholder');
        }
      );
    }
  }

  /* =========================================================================
   * WAYFINDING
   * ========================================================================= */

  function setupWayfinding() {
    if (!els.navSearch) return;

    // Populate destination dropdown grouped by category
    const groups = {
      'Gates & Exits':    ['gate-a', 'gate-b', 'gate-c', 'gate-d', 'exit-n', 'exit-s'],
      'Food & Drink':     ['food-n', 'food-s', 'food-e', 'food-w', 'halal', 'vegan'],
      'Restrooms':        ['toilet-n', 'toilet-s', 'toilet-e', 'toilet-w'],
      'Medical & Safety': ['first-aid-1', 'first-aid-2'],
      'Accessibility':    ['elev-a', 'elev-b', 'elev-c', 'elev-d', 'family-zone'],
      'Services':         ['atm-a', 'atm-c', 'lost-found', 'store', 'fan-zone']
    };

    let optHtml = '<option value="" disabled selected>Where do you want to go?</option>';
    Object.entries(groups).forEach(([groupName, ids]) => {
      optHtml += `<optgroup label="${groupName}">`;
      ids.forEach(id => {
        const f = Wayfinding.FACILITIES[id];
        if (f) optHtml += `<option value="${id}">${f.icon} ${f.label}${f.accessible ? ' ♿' : ''}</option>`;
      });
      optHtml += '</optgroup>';
    });
    els.navSearch.innerHTML = optHtml;

    els.navSearch.addEventListener('change', e => {
      const id = e.target.value;
      if (!id) return;
      els.navResults.innerHTML = '';
      Wayfinding.navigateTo(id, {
        onDirections: (directions, facility) => renderDirections(directions, facility)
      });
    });

    els.navClearBtn?.addEventListener('click', () => {
      Wayfinding.clearRoute();
      if (els.navDirections) {
        els.navDirections.innerHTML = '';
        els.navDirections.classList.remove('show');
      }
      els.navClearBtn.style.display = 'none';
      els.navSearch.value = '';
      // Reset filter buttons
      document.querySelectorAll('.map-filter-btn').forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-pressed','false');
      });
      const allBtn = document.querySelector('.map-filter-btn[data-filter="all"]');
      if (allBtn) { allBtn.classList.add('active'); allBtn.setAttribute('aria-pressed','true'); }
    });

    // Auto-navigate to nearest food on enter (demo)
    setTimeout(() => {
      Wayfinding.navigateTo('food-n', {
        onDirections: (directions, facility) => renderDirections(directions, facility)
      });
    }, 1800);
  }

  function renderDirections(directions, facility) {
    if (!els.navDirections) return;

    let html = `
      <div class="directions-header">
        <h3>Route to ${Utils.escapeHtml(facility.icon)} ${Utils.escapeHtml(facility.label)}</h3>
        <button class="btn btn-icon btn-close-dir" aria-label="Close directions">✕</button>
      </div>
      <div class="directions-list">
    `;

    directions.forEach(d => {
      const text = Utils.escapeHtml(d.text).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      html += `
        <div class="direction-step">
          <div class="step-icon">${Utils.escapeHtml(d.icon)}</div>
          <div class="step-text">${text}</div>
        </div>
      `;
    });
    html += '</div>';

    Utils.setHTML(els.navDirections, html);
    els.navDirections.classList.add('show');
    if (els.navClearBtn) els.navClearBtn.style.display = 'block';

    els.navDirections.querySelector('.btn-close-dir')?.addEventListener('click', () => {
      els.navDirections.classList.remove('show');
    });
  }

  /* =========================================================================
   * CROWD MANAGEMENT UI
   * ========================================================================= */

  function updateCrowdPredictions() {
    const container = document.getElementById('crowd-predictions');
    if (!container) return;

    const render = () => {
      if (currentSection !== 'crowd') return;
      const predictions = CrowdManager.generatePredictions();
      const html = predictions.map(p => `
        <div class="prediction-card border-${Utils.escapeHtml(p.severity)}" role="article">
          <div class="pred-header">
            <span class="pred-zone">${Utils.escapeHtml(p.zone)}</span>
            <span class="pred-badge bg-${Utils.escapeHtml(p.severity)}">${Utils.escapeHtml(p.severity.toUpperCase())}</span>
          </div>
          <div>
            <p class="pred-text">${Utils.escapeHtml(p.prediction)}</p>
            <div class="pred-action">
              <span class="icon">💡</span>
              <span>${Utils.escapeHtml(p.action)}</span>
            </div>
          </div>
        </div>
      `).join('');
      Utils.setHTML(container, html);
    };

    render();
    if (crowdPredictionTimer) clearInterval(crowdPredictionTimer);
    crowdPredictionTimer = setInterval(render, 5000);
  }

  /* =========================================================================
   * SETTINGS
   * ========================================================================= */

  function setupSettings() {
    // Language
    if (els.langSelect) {
      const langs = I18n.getLanguages();
      els.langSelect.innerHTML = Object.keys(langs).map(code =>
        `<option value="${code}">${langs[code].flag} ${langs[code].nativeName}</option>`
      ).join('');
      els.langSelect.value = I18n.getLang();
      els.langSelect.addEventListener('change', e => {
        I18n.setLanguage(e.target.value);
        updateLanguageUI();
      });
    }

    // High Contrast
    els.highContrastToggle?.addEventListener('change', e => {
      document.body.classList.toggle('high-contrast', e.target.checked);
      document.documentElement.setAttribute('data-high-contrast', String(e.target.checked));
      Utils.setStorage('ss_high_contrast', e.target.checked);
    });

    // Reduce Motion
    els.reduceMotionToggle?.addEventListener('change', e => {
      document.body.classList.toggle('reduce-motion', e.target.checked);
      document.documentElement.setAttribute('data-reduce-motion', String(e.target.checked));
      Utils.setStorage('ss_reduce_motion', e.target.checked);
    });

    // Font Size
    els.fontSizeSelect?.addEventListener('change', e => {
      document.documentElement.setAttribute('data-font-size', e.target.value);
      Utils.setStorage('ss_font_size', e.target.value);
    });

    // Close modal on backdrop click
    const modal = document.getElementById('settings-modal');
    if (modal) {
      modal.addEventListener('click', e => {
        if (e.target === modal) modal.classList.remove('show');
      });
    }
  }

  /**
   * Update all i18n-bound DOM elements and re-render dynamic content
   */
  function updateLanguageUI() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key  = el.getAttribute('data-i18n');
      const text = I18n.t(key);
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        el.placeholder = text;
      } else {
        el.textContent = text;
      }
    });

    // Quick replies
    if (els.chatQuickReplies) {
      const replies = I18n.t('chat.quickReplies');
      if (Array.isArray(replies)) {
        els.chatQuickReplies.innerHTML = replies
          .map(r => `<button class="quick-reply-btn">${Utils.escapeHtml(r)}</button>`)
          .join('');
      }
    }

    updateHeader(currentSection);
    if (els.langSelect) els.langSelect.value = I18n.getLang();

    Tickets.renderTicket('ticket-container');
    Tickets.renderSchedule('schedule-container');
    Tickets.renderFanZone('fanzone-container');
  }

  /* =========================================================================
   * PWA SERVICE WORKER
   * ========================================================================= */

  function setupPWA() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
          .then(reg => console.info('[PWA] Service Worker registered:', reg.scope))
          .catch(err => console.warn('[PWA] Service Worker registration failed:', err));
      });
    }
  }

  // ─── Boot ─────────────────────────────────────────────────────────────────
  init();

});
