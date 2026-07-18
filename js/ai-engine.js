/**
 * @fileoverview Multi-Agent AI Engine — Agent Router & Specialized Domain Agents
 *
 * Architecture: AgentRouter → classifies intent → delegates to specialized Agent
 *
 * Agents:
 *   NavigationAgent     — Wayfinding, seat finding, facility location
 *   OperationsAgent     — Staff mode, crowd deployment, operational intelligence
 *   CrowdIntelAgent     — Congestion prediction, zone density, queue forecasts
 *   TransportAgent      — Metro, parking, rideshare, shuttle guidance
 *   AccessibilityAgent  — Wheelchair, hearing loop, guide dog, assisted entry
 *   EmergencyAgent      — SOS, medical, fire, evacuation
 *   VolunteerAgent      — Volunteer deployment, shift recommendations
 *   MedicalAgent        — First aid, AED, ambulance, injury guidance
 *   SecurityAgent       — Incident reporting, prohibited items, threat level
 *   SustainabilityAgent — Carbon offset, recycling, eco-impact metrics
 *
 * Each agent encapsulates its own system prompt, knowledge extraction,
 * and response generation logic. The AgentRouter coordinates them via
 * intent classification and entity extraction.
 *
 * Runs locally with rich knowledge-base responses for a reliable demo.
 */

'use strict';

const AIEngine = (() => {

  /* =========================================================================
   * AGENT REGISTRY & INTENT DEFINITIONS
   * ========================================================================= */

  /**
   * Canonical intent identifiers used across the agent system
   * @readonly
   * @enum {string}
   */
  const INTENTS = {
    NAVIGATION:      'navigation',
    SEATING:         'seating',
    FOOD:            'food',
    RULES:           'rules',
    SCHEDULE:        'schedule',
    TRANSPORT:       'transport',
    EMERGENCY:       'emergency',
    MEDICAL:         'medical',
    ACCESSIBILITY:   'accessibility',
    WIFI:            'wifi',
    LOST:            'lost',
    WEATHER:         'weather',
    TICKETS:         'tickets',
    FANZONE:         'fanzone',
    PLAYERS:         'players',
    SUSTAINABILITY:  'sustainability',
    STAFF:           'staff',
    VOLUNTEER:       'volunteer',
    SECURITY:        'security',
    CROWD:           'crowd',
    GREETING:        'greeting',
    THANKS:          'thanks',
    GENERAL:         'general'
  };

  /**
   * Agent metadata registry — maps each agent to its domain and intents
   * @type {Array<{name: string, domain: string, intents: string[]}>}
   */
  const AGENT_REGISTRY = [
    { name: 'NavigationAgent',     domain: 'Wayfinding & Seat Location',    intents: [INTENTS.NAVIGATION, INTENTS.SEATING] },
    { name: 'OperationsAgent',     domain: 'Operational Intelligence',      intents: [INTENTS.STAFF] },
    { name: 'CrowdIntelAgent',     domain: 'Crowd Intelligence',            intents: [INTENTS.CROWD] },
    { name: 'TransportAgent',      domain: 'Transport & Logistics',         intents: [INTENTS.TRANSPORT] },
    { name: 'AccessibilityAgent',  domain: 'Accessibility Services',        intents: [INTENTS.ACCESSIBILITY] },
    { name: 'EmergencyAgent',      domain: 'Emergency Response',            intents: [INTENTS.EMERGENCY] },
    { name: 'VolunteerAgent',      domain: 'Volunteer Coordination',        intents: [INTENTS.VOLUNTEER] },
    { name: 'MedicalAgent',        domain: 'Medical & First Aid',           intents: [INTENTS.MEDICAL] },
    { name: 'SecurityAgent',       domain: 'Security & Incident Mgmt',     intents: [INTENTS.SECURITY] },
    { name: 'SustainabilityAgent', domain: 'Sustainability & Green Ops',    intents: [INTENTS.SUSTAINABILITY] },
  ];

  /* =========================================================================
   * INTENT PATTERNS (multilingual keyword matching)
   * Pattern order matters — first match wins. More specific patterns first.
   * ========================================================================= */

  const PATTERNS = [
    {
      intent: INTENTS.SUSTAINABILITY,
      patterns: [/sustainab|eco|green|recycle|carbon|offset|emission|environment|climate|footprint/i]
    },
    {
      intent: INTENTS.VOLUNTEER,
      patterns: [/volunteer|deploy.*volunteer|shift.*volunteer|volunteer.*deploy|volunteer.*assign/i]
    },
    {
      intent: INTENTS.SECURITY,
      patterns: [/security|prohibited|banned|threat|suspicious|incident.*report|bag.*check|weapon/i]
    },
    {
      intent: INTENTS.CROWD,
      patterns: [/crowd|congestion|density|queue|busy|packed|overcrowded|capacity|surge/i]
    },
    {
      intent: INTENTS.STAFF,
      patterns: [/staff ops|enable staff|operational intelligence|crowd deployment|ops brief|staff mode/i]
    },
    {
      intent: INTENTS.GREETING,
      patterns: [/^(hi|hello|hey|hola|bonjour|ciao|hallo|こんにちは|안녕|नमस्ते|مرحبا|oi|olá)\b/i]
    },
    {
      intent: INTENTS.THANKS,
      patterns: [/thank|thanks|merci|gracias|grazie|danke|ありがとう|감사|धन्यवाद|شكرا|obrigado/i]
    },
    {
      intent: INTENTS.FOOD,
      patterns: [/food|\beat\b|drink|menu|restaurant|snack|burger|hot dog|pizza|beer|nachos|halal|vegetarian|vegan|gluten|cafe|concession|beverage|hungry|thirsty/i,
                 /comida|manger|nourriture|essen|cibo|食べ|먹|खाना|طعام|almoco|jantar/i]
    },
    {
      intent: INTENTS.RULES,
      patterns: [/rule|regulation|offside|foul|card|yellow|red|var|penalty|substitut|law of.*game|how.*play|allowed|prohibited|banned|forbidden/i,
                 /regla|règle|regel|regola|ルール|규칙|नियम|قاعدة/i]
    },
    {
      intent: INTENTS.SCHEDULE,
      patterns: [/match|game|fixture|schedule|when.*play|kickoff|kick.off|halftime|half.time|final|quarter|semi|group stage|result|score|standing/i,
                 /partido|match|spiel|partita|試合|경기|मैच|مباراة/i]
    },
    {
      intent: INTENTS.TRANSPORT,
      patterns: [/transport|bus|metro|subway|train|parking|car|taxi|uber|lyft|ride|shuttle|drive|arrive|get here|how.*come/i,
                 /transporte|transport|verkehr|trasporto|交通|교통|परिवहन|مواصلات/i]
    },
    {
      intent: INTENTS.EMERGENCY,
      patterns: [/emergency|sos|help.*urgent|danger|fire|evacuate|disaster|evacuation|alarm|panic/i]
    },
    {
      intent: INTENTS.MEDICAL,
      patterns: [/medical|doctor|nurse|first aid|hurt|injured|injury|sick|ill|faint|ambulance|hospital|pain|unwell/i,
                 /médico|médecin|arzt|medico|医療|의료|चिकित्सा|طبي/i]
    },
    {
      intent: INTENTS.ACCESSIBILITY,
      patterns: [/wheelchair|accessible|disability|disabled|blind|deaf|mobility|assistance|special need|elevator.*wheelchair|ramp|hearing loop/i,
                 /accessib|barrierefreiheit|accesso|アクセシビリティ|접근성|सुगम्य|إمكانية الوصول/i]
    },
    {
      intent: INTENTS.WIFI,
      patterns: [/wifi|wi-fi|internet|network|connection|connect|signal|data|online/i]
    },
    {
      intent: INTENTS.LOST,
      patterns: [/lost|missing|can't find|lost child|missing child|lost.*item|found.*item|lost.*wallet|lost.*phone|lost.*bag/i,
                 /perdido|perdu|verloren|smarrito|紛失|분실|खोया|مفقود/i]
    },
    {
      intent: INTENTS.WEATHER,
      patterns: [/weather|temperature|rain|sun|hot|cold|forecast|clima|météo|wetter|tempo|天気|날씨|मौसम|طقس/i]
    },
    {
      intent: INTENTS.TICKETS,
      patterns: [/ticket|entry|scan|qr|code|admission|pass|credential|badge/i]
    },
    {
      intent: INTENTS.FANZONE,
      patterns: [/fan zone|fanzone|activity|activities|event|things to do|entertainment|store|shop|merchandise|trophy|photo|experience/i]
    },
    {
      intent: INTENTS.SEATING,
      patterns: [/seat|section|row|block|stand|tribune|asiento|siège|posto|sitz|席|좌석|सीट|مقعد/i,
                 /where.*(?:my|sit)|find.*seat|get to.*section/i]
    },
    {
      intent: INTENTS.NAVIGATION,
      patterns: [/where|how.*get|direction|navigate|find|way to|path|route|located|nearest|closest|baño|toilette|ausgang|dov|どこ|어디|कहां|أين/i,
                 /gate|exit|entrance|concourse|concession|elevator|lift|escalator|stair/i]
    },
    {
      intent: INTENTS.PLAYERS,
      patterns: [/mbappe|mbappé|yamal|haaland|vini|vinicius|bellingham|ronaldo|messi|player|squad|team|lineup|eleven|starting/i]
    }
  ];

  /* =========================================================================
   * ENTITY EXTRACTORS
   * ========================================================================= */

  /**
   * Extract seat/section information from user query
   * @param {string} text - Sanitized user input
   * @returns {{ section: string|null, row: string|null, seat: string|null }}
   */
  function extractSeatInfo(text) {
    const sectionMatch = text.match(/section\s+(\w+)/i) || text.match(/sec\s*\.?\s*(\w+)/i);
    const rowMatch     = text.match(/row\s+([a-z\d]+)/i);
    const seatMatch    = text.match(/seat\s+(\d+)/i) || text.match(/#\s*(\d+)/);
    return {
      section: sectionMatch?.[1] || null,
      row:     rowMatch?.[1] || null,
      seat:    seatMatch?.[1] || null
    };
  }

  /**
   * Extract facility type from query
   * @param {string} text - Sanitized user input
   * @returns {string|null} Facility identifier or null
   */
  function extractFacility(text) {
    const lc = text.toLowerCase();
    if (/toilet|restroom|bathroom|wc|loo|baño/.test(lc)) return 'restroom';
    if (/food|eat|concession|snack/.test(lc)) return 'food';
    if (/medical|first.?aid|doctor/.test(lc)) return 'medical';
    if (/gate|entrance|exit/.test(lc)) return 'gate';
    if (/elevator|lift/.test(lc)) return 'elevator';
    if (/atm|cash/.test(lc)) return 'atm';
    if (/parking/.test(lc)) return 'parking';
    return null;
  }

  /* =========================================================================
   * SPECIALIZED AGENT RESPONSE GENERATORS
   *
   * Each function represents one domain agent's response logic.
   * In production, each would carry its own system prompt to the LLM.
   * In demo mode, they return rich, contextual knowledge-base responses.
   * ========================================================================= */

  const RESPONSES = {

    /* --- SustainabilityAgent --- */
    [INTENTS.SUSTAINABILITY]: () => {
      return `🌱 **SmartStadium Eco-Hub**\n\nDid you know? Taking the Metro today saves approximately **2.4kg of CO₂** compared to driving!\n\n**Recycling:**\n• Look for the Green Bins (mixed recycling) and Blue Bins (compost/food waste) every 50 meters.\n• We use 100% biodegradable cups.\n\n**Carbon Offset:**\nIf you flew here, you can offset your flight using the FIFA Green Goal program.\n\nThank you for helping make WC 2026 the greenest World Cup ever! 🌍`;
    },

    /* --- OperationsAgent --- */
    [INTENTS.STAFF]: () => {
      return `🔐 **STAFF OPS MODE ENABLED**\n\n**Real-time Insights (Zone: North Concourse)**\n🚨 **Alert**: Crowd density approaching 85% at Gate A (Expected delay: 15 mins).\n\n**AI Recommendation:**\n• Redirect incoming fans to Gate B (Currently at 30% capacity).\n• Deploy 2 additional wayfinding volunteers to Section 105 junction.\n• Pre-warn concessions at Section 110 of incoming surge.\n\n*Type "exit staff mode" to return to fan view.*`;
    },

    /* --- VolunteerAgent --- */
    [INTENTS.VOLUNTEER]: () => {
      return `🙋 **Volunteer Deployment — AI Recommendation**\n\n**Current Shift:** North Concourse Wayfinding\n**Time:** 14:00–18:00 EST\n\n**Deployment Advisory:**\n• Gate A requires 2 additional volunteers (crowd density 85%).\n• Section 105 junction needs a wayfinding volunteer for the next 45 minutes.\n• Fan Zone South has excess volunteers — 1 can be redeployed.\n\n**Your Next Task:**\nProceed to **Gate A** and assist incoming fans with seat-finding. Estimated surge: 12 minutes.\n\n📋 *Check volunteer dashboard for updated shift assignments.*`;
    },

    /* --- SecurityAgent --- */
    [INTENTS.SECURITY]: () => {
      return `🛡️ **Security Advisory**\n\n**Current Threat Level:** LOW ✅\n\n**Prohibited Items Reminder:**\n• No glass containers, weapons, laser pointers, drones, or umbrellas over 12"\n• Clear bag policy (12"×6"×12") enforced at all gates\n\n**Reporting an Incident:**\n1. Tap the **SOS button** in the Emergency tab for urgent threats\n2. Approach any staff member in a **blue vest** (Security)\n3. Call Security Hotline: **+1-800-WC26-SEC**\n\n**AI Note:** All entry points are monitored with real-time bag screening. Average wait: 4 minutes.`;
    },

    /* --- CrowdIntelAgent --- */
    [INTENTS.CROWD]: () => {
      return `👥 **Crowd Intelligence — Live Update**\n\n**Overall Stadium:** 72% capacity (59,400 / 82,500)\n\n**Zone Breakdown:**\n• North Stand: 🟡 68% — moderate flow\n• South Stand: 🟢 45% — comfortable\n• Gate A: 🔴 87% — heavy congestion\n• Gate B: 🟢 31% — clear entry\n\n**AI Prediction:**\nConcourse congestion expected to peak at half-time (~38 min). Visit concessions in the last 10 minutes of the first half to avoid queues.\n\n💡 *Open the Crowd tab for the live heatmap and real-time zone-by-zone breakdown.*`;
    },

    /* --- Greeting (Router handles directly) --- */
    [INTENTS.GREETING]: () => {
      const greetings = [
        `${I18n.t('chat.greeting')}`,
        `¡Welcome to FIFA World Cup 2026! 🏆⚽ I'm your SmartStadium AI — ask me about seats, food, directions, rules, safety, or anything stadium-related!`,
        `Good to see you! I'm here to make your World Cup experience unforgettable. What can I help with today? 🌟`
      ];
      return Utils.randItem(greetings);
    },

    [INTENTS.THANKS]: () => {
      return Utils.randItem([
        '🏆 You\'re very welcome! Enjoy the match — it\'s going to be incredible! Is there anything else I can help with?',
        'Happy to help! ⚽ Go enjoy the game! Any other questions?',
        'My pleasure! 😊 Feel free to ask anytime. Have an amazing World Cup experience!'
      ]);
    },

    /* --- NavigationAgent --- */
    [INTENTS.SEATING]: (text) => {
      return `📍 **Finding Your Seat**\n\nI see your ticket is for **Section 140, Row F, Seat 12**.\n\nHere's how to get there:\n1. Enter through **Gate A** (shortest route to your section)\n2. Take the main concourse — Section 140 is clearly signed in blue\n3. Look for Row F signs at the aisle ends\n\n💡 *Tip: Tap the Navigate tab to see this route drawn on the live map!*`;
    },

    [INTENTS.NAVIGATION]: (text) => {
      const facility = extractFacility(text);
      const facilityResponses = {
        restroom: `🚻 **Nearest Restrooms**\n\nSince your seat is in **Section 140**, the closest restroom is right across the concourse near **Section 138**.\n\nAccessible restrooms and family restrooms (with changing tables) are also available near Section 115.\n\n💡 *Tip: Open Navigate tab and tap "Nearest Toilet" for a drawn route!*`,
        food: `🍔 **Nearest Food Concessions**\n\nBased on your seat in **Section 140**, the closest concession stand is just behind you in the **East Concourse**.\n\n• **International Food Zone**: Section 130\n• **Halal Station**: Gate B concourse\n• **Vegan/Veggie Green Bar**: Section 130\n\nOpen the Navigate tab → "Food" to find the closest stand!`,
        medical: `🏥 **First Aid Stations**\n\nFirst Aid stations are located at:\n• **Section 110** (lower bowl, north end)\n• **Section 330** (upper bowl, south end)\n• **Gate A** lobby (external)\n• **Gate C** lobby (external)\n\nIn any medical emergency — **call the SOS button** in the Emergency tab.`,
        gate: `🚪 **Stadium Gates**\n\nYour designated entry is **Gate A** (closest to Section 140).\n\nIf you need the nearest exit, please use **Emergency Exit N**, which is right near your section.\n\nGates open **3 hours before kickoff**.`,
        atm: `💳 **ATMs**\n\nATMs are located at:\n• Gate A lobby (2 machines)\n• Gate C lobby (2 machines)\n• Club Level entrance (1 machine)\n\nNote: **Cashless payment preferred** — most concessions accept card, Apple Pay, Google Pay.`,
        elevator: `🛗 **Elevators**\n\nSince your seat is near **Gate A**, you can use the **Gate A Elevators** (Level 1 to 3).\n\nPriority access for wheelchair users. Press the assist button for staff help.`,
        parking: `🚗 **Parking**\n\n• **Lots A–F**: Opens 4 hours before kickoff — **cashless only**\n• **Accessible Parking**: Lot A1 (nearest gate, permit required)\n• **Cost**: $45-75 depending on lot\n\n⚠️ *Roads close 4hrs before/2hrs after. Public transit strongly recommended!*\n• Metro to stadium: **NJ Transit Meadowlands Rail** from Penn Station (20 min)`
      };
      if (facility && facilityResponses[facility]) return facilityResponses[facility];
      return `🗺️ **Stadium Navigation**\n\nI can help you find:\n• 📍 Your seat (Section/Row/Seat)\n• 🚻 Nearest restrooms\n• 🍔 Food concessions\n• 🏥 First Aid stations\n• 🚪 Gates and exits\n• 🛗 Elevators\n• 💳 ATMs\n\nJust tell me where you want to go, or open the **Navigate tab** for the interactive stadium map with AI turn-by-turn directions!`;
    },

    [INTENTS.FOOD]: (text) => {
      const lc = text.toLowerCase();
      if (/halal/.test(lc)) {
        return `🌙 **Halal Food Options**\n\nHalal certified stations at:\n• **Halal Station** — Gate B concourse\n  - Falafel Wrap ($12)\n  - Chicken Tikka Naan ($14)\n  - Halal Hot Dog ($9)\n  - Fresh Juices ($6)\n\n• **International Food Zone** (Section 130) — multiple halal options from Middle Eastern, South Asian, and African cuisine\n\nAll halal items are clearly marked with the ☪️ symbol. Certified by FIFA's halal food partner.`;
      }
      if (/vegan|vegetarian|veggie/.test(lc)) {
        return `🥗 **Vegan & Vegetarian Options**\n\n• **Green Concession Bar** (Section 130):\n  - Vegan Burrito Bowl ($13)\n  - Veggie Burger ($11)\n  - Fresh Fruit Cup ($7)\n  - Vegan Nachos ($10)\n  - Plant-based hot dog ($9)\n\n• **International Food Zone**: Many plant-based options from world cuisines\n\nAll vegan items are marked with 🌱. Ask staff if unsure — they're trained on allergen info.`;
      }
      if (/beer|alcohol|drink/.test(lc)) {
        return `🍺 **Beverages & Alcohol**\n\n• **Beer**: Budweiser, Corona, Michelob Ultra — $14 each\n• **Non-alcoholic beer**: Available at all stands — $8\n• **Soft drinks**: Coke, Pepsi, Sprite, water — $6\n• **Juice / smoothies**: Green concession bar — $7-9\n\n⚠️ **Age requirement**: 21+ USA, 18+ Canada & Mexico. Valid ID required.\n⚠️ Alcohol service stops at the 75th minute of each match.`;
      }
      return `🍔 **Food & Drink at the Stadium**\n\nWe have 12+ food stations:\n\n🥤 **Drinks**: Coke, Pepsi, Sprite, Water ($6), Beer ($14)\n🌭 **Classic**: Hot Dog ($9), Nachos ($11), Pizza ($8)\n🌮 **International**: Tacos ($13), Empanadas ($10), Poutine ($12 CAD)\n🌙 **Halal**: Falafel Wrap ($12), Chicken Tikka ($14) — Gate B\n🌱 **Vegan/Veggie**: Burrito Bowl ($13), Veggie Burger ($11) — Section 130\n\nOpen the **Fan Experience → Menus** tab for the full menu. Cards, Apple Pay, Google Pay accepted everywhere!`;
    },

    [INTENTS.RULES]: (text) => {
      const lc = text.toLowerCase();
      if (/offside/.test(lc)) {
        return `⚽ **The Offside Rule**\n\nA player is in an **offside position** if:\n• Any part of their head, body, or feet is closer to the opponents' goal line than **both the ball AND the second-to-last opponent** at the moment the ball is played\n\n**Not offside**: Arms are excluded. Being level with the last defender = onside.\n\n**VAR** (Video Assistant Referee) checks offside decisions using semi-automated offside technology with sub-centimetre precision at FIFA WC 2026.`;
      }
      if (/var/.test(lc)) {
        return `📺 **VAR — Video Assistant Referee**\n\nVAR can intervene in 4 situations:\n1. **Goal/No Goal** — offside, foul in the build-up\n2. **Penalty/No Penalty** — foul assessment in the area\n3. **Direct Red Card** — serious foul play, violent conduct\n4. **Mistaken Identity** — wrong player cautioned/dismissed\n\nFIFA WC 2026 uses **Semi-Automated Offside Technology (SAOT)** for instant, sub-centimetre offside checks shown on stadium screens.`;
      }
      if (/card|yellow|red/.test(lc)) {
        return `🟨🟥 **Cards & Disciplinary Rules**\n\n**Yellow Card** = Caution\n• Two yellows in one match = automatic red card\n• Accumulate 2 yellows across group stage = 1-match ban\n\n**Red Card** = Immediate ejection\n• Player must leave the pitch immediately\n• Team plays with 10 players for remainder of match\n• Player suspended for next match (serious foul = longer ban)\n\n**Referee's discretion** applies in all cases.`;
      }
      return `📋 **FIFA Rules & Regulations**\n\nHere's what you need to know:\n\n${KB.rules.game.slice(0, 4).map(r => `• ${r}`).join('\n')}\n\n*Ask me about specific rules: offside, VAR, cards, substitutions, penalties, etc.!*`;
    },

    [INTENTS.SCHEDULE]: (text) => {
      const upcoming = KB.matches.filter(m => m.status === 'upcoming').slice(0, 3);
      const completed = KB.matches.filter(m => m.status === 'completed').slice(-2);
      let response = `📅 **FIFA World Cup 2026 — Match Schedule**\n\n`;

      if (completed.length) {
        response += `**Recent Results:**\n`;
        completed.forEach(m => {
          response += `• ${m.home.flag} ${m.home.team} **${m.score.home}–${m.score.away}** ${m.away.team} ${m.away.flag} *(${m.stage})*\n`;
        });
        response += '\n';
      }

      response += `**Upcoming Matches:**\n`;
      upcoming.forEach(m => {
        response += `• ${Utils.formatDate(m.date)} ${Utils.formatTime(m.time)} — ${m.home.flag} **${m.home.team}** vs **${m.away.team}** ${m.away.flag} *(${m.stage} · ${m.city})*\n`;
      });

      response += `\n🏆 **The FINAL** is on **19 July 2026** at **MetLife Stadium, New York**\n\n*Open the Tickets tab for the full schedule and live standings!*`;
      return response;
    },

    /* --- TransportAgent --- */
    [INTENTS.TRANSPORT]: () => {
      return `🚌 **Getting to the Stadium**\n\n**🚇 Public Transport (Recommended):**\n• NJ Transit Meadowlands Rail — Direct from Penn Station, 20 min\n• Express buses from NY Port Authority Bus Terminal\n• Metro: Increased frequency on match days\n\n**🚗 Parking:**\n• Lots A–F open 4hrs before kickoff — cashless only\n• $45-75 per vehicle\n• Accessible: Lot A1 (permit required)\n• Roads close 4hrs before/2hrs after match\n\n**🚕 Rideshare:**\n• Uber/Lyft: Designated pickup at Lot B1 East\n• Pre-book in the app before arriving\n\n**🚶 Walking:**\n• From Meadowlands Station: 8-minute walk (signposted)\n\n💡 *Leave 2+ hours before kickoff on match days!*`;
    },

    /* --- EmergencyAgent --- */
    [INTENTS.EMERGENCY]: () => {
      return `🚨 **EMERGENCY ASSISTANCE**\n\nFor immediate emergencies:\n\n• **🔴 Tap the SOS button** in the Emergency tab — sends your GPS location instantly\n• **Call Security**: +1-800-WC26-SEC\n• **Call Medical**: +1-800-WC26-MED\n• **Fire/Police**: 911 (USA) or 112 (Canada/Mexico)\n\n**In case of evacuation:**\nFollow green emergency lighting to the nearest exit. Do NOT use elevators. Leave all belongings. Follow staff instructions.\n\n*Go to the Emergency tab now for full safety resources.*`;
    },

    /* --- MedicalAgent --- */
    [INTENTS.MEDICAL]: () => {
      return `🏥 **Medical Assistance**\n\n**First Aid Stations:**\n• Section 110 (lower bowl)\n• Section 330 (upper bowl)\n• Gate A lobby (external)\n• Gate C lobby (external)\n\n**For emergencies:** Tap SOS in the Emergency tab OR call **+1-800-WC26-MED**\n\nMedical staff wear **green vests** and are stationed throughout the venue. AED defibrillators are located at all First Aid stations and every gate entrance.\n\n⚠️ Do not move a seriously injured person. Call for help and keep the area clear.`;
    },

    /* --- AccessibilityAgent --- */
    [INTENTS.ACCESSIBILITY]: () => {
      return `♿ **Accessibility Services**\n\n• **Accessible Seating**: Sections 120, 140 (lower), 320 (upper)\n• **Wheelchair Parking**: Lot A1 — permit required\n• **Elevators**: At all 4 gates — priority for wheelchair users\n• **Hearing Loops**: Installed throughout — compatible with T-coil hearing aids\n• **Guide Dogs**: Welcome throughout the venue\n• **Accessible Restrooms**: At every gate and family zones\n• **Personal Assistance**: Request via the app — staff will meet you at your gate\n• **Accessible Transport**: Access-A-Ride and equivalent services stop at Gate D\n\n📞 **Accessibility Hotline**: +1-800-FIFA-ACC\n📧 accessibility@fifa.wc2026.com`;
    },

    [INTENTS.WIFI]: () => {
      return `📶 **Free Stadium WiFi**\n\n• **Network name**: FIFA_WC2026_FAN\n• **Password**: No password required — open network\n• **Speed**: Gigabit capacity supporting 80,000+ connections\n• **Coverage**: 100% of all seating areas, concourses, and fan zones\n\n💡 **Tips:**\n• The network auto-connects on most devices\n• For best speeds, avoid streaming large videos during peak times\n• This SmartStadium app works fully **offline** too!\n• VPN connections are supported`;
    },

    [INTENTS.LOST]: (text) => {
      if (/child|kid|son|daughter|boy|girl/.test(text.toLowerCase())) {
        return `🧒 **Missing Child — URGENT**\n\n1. **Go to the Emergency tab immediately** → tap "Report Missing Child"\n2. Call the dedicated Child Safety line: **+1-800-WC26-KID**\n3. Go to the nearest Information Desk (every gate) — staff will coordinate a search immediately\n4. Notify nearby security staff (blue/yellow vests)\n\n**Stay calm** — our team responds to missing child reports as top priority. All staff will be alerted within 60 seconds of a report being filed.`;
      }
      return `🔍 **Lost & Found**\n\n**If you've lost something:**\n1. Go to the Emergency tab → "Lost & Found"\n2. Submit a report — you'll receive a tracking reference number\n3. Visit the **Information Desk at Gate A** (open all day)\n4. Call: **+1-800-WC26-LST**\n\n**If you've found something:**\nBring it to any Information Desk or Security post immediately.\n\n**Common items found**: Phones (kept at Gate A desk), Wallets (secured with Security), Clothing, Bags\n\n*All found items are logged and held for 60 days after the tournament.*`;
    },

    [INTENTS.WEATHER]: () => {
      const weathers = [
        { desc: 'Partly Cloudy', temp: '78°F / 26°C', icon: '⛅', tips: ['Bring sunscreen!', 'Light layers recommended for evening'] },
        { desc: 'Sunny', temp: '84°F / 29°C', icon: '☀️', tips: ['Hat and sunscreen essential', 'Stay hydrated — free water refill stations inside'] },
        { desc: 'Clear Evening', temp: '68°F / 20°C', icon: '🌙', tips: ['Perfect match weather!', 'Light jacket for post-match'] }
      ];
      const w = Utils.randItem(weathers);
      return `🌤️ **Match Day Weather — MetLife Stadium**\n\n${w.icon} **${w.desc}** — ${w.temp}\n\n**What to bring:**\n${w.tips.map(t => `• ${t}`).join('\n')}\n\n• Sealed water bottles (500ml) are permitted inside\n• Stadium concessions sell cold drinks and hot beverages\n• Umbrella max size: 12" — larger umbrellas prohibited\n\n*Check the Home tab weather widget for real-time conditions!*`;
    },

    [INTENTS.TICKETS]: () => {
      return `🎟️ **Tickets & Entry**\n\n**Mobile Tickets:**\n• Open the Tickets tab → show your QR code at the gate\n• Ensure screen brightness is high for scanning\n• No print required — fully digital\n\n**Entry Rules:**\n• Gates open **3 hours before kickoff**\n• Ticket is linked to your ID — bring valid photo ID\n• No re-entry once you leave the venue\n• Late arrivals: your seat may be used until 15 mins after kickoff\n\n**Resale / Transfer:**\n• Tickets are non-transferable\n• Official resale only via FIFA's authorised platform\n\n**Wallet:** Your ticket is saved in the Tickets tab — it works offline too!`;
    },

    [INTENTS.FANZONE]: () => {
      const activities = KB.fanZoneActivities.slice(0, 4);
      let response = `🎉 **Fan Zone Activities — Top Picks!**\n\n`;
      activities.forEach(a => {
        response += `**${a.emoji} ${a.name}**\n📍 ${a.location} · ⏱ ${a.duration} · 💰 ${a.cost}\n${a.description}\n\n`;
      });
      response += `*See all 8+ activities in the **Fan Experience tab** with personalised recommendations!*`;
      return response;
    },

    [INTENTS.PLAYERS]: (text) => {
      const lc = text.toLowerCase();
      const playerMap = {
        mbappe: 'mbappe', mbappé: 'mbappe', kylian: 'mbappe',
        yamal: 'yamal', lamine: 'yamal',
        haaland: 'haaland', erling: 'haaland',
        vini: 'vini', vinicius: 'vini',
        bellingham: 'bellingham', jude: 'bellingham',
        ronaldo: 'ronaldo', cr7: 'ronaldo', cristiano: 'ronaldo',
        messi: 'messi', leo: 'messi', lionel: 'messi'
      };

      const found = Object.keys(playerMap).find(k => lc.includes(k));
      if (found) {
        const p = KB.players.find(pl => pl.id === playerMap[found]);
        if (p) {
          return `⭐ **${p.name}** ${p.flag}\n\n📊 **Stats:** ${p.goals} international goals · ${p.caps} caps · Age ${p.age}\n🏟️ **Club:** ${p.club}\n⚽ **Position:** ${p.position}\n\n📖 **${p.bio}**\n\n🏷️ **Known for:** ${p.tags.join(' · ')}\n\n*This is one of ${KB.players.length} legendary players featured in the SmartStadium app hero carousel!*`;
        }
      }
      return `⭐ **FIFA WC 2026 — Stars to Watch**\n\n${KB.players.slice(0, 5).map(p => `${p.flag} **${p.name}** (${p.country}) — ${p.goals} goals in ${p.caps} caps`).join('\n')}\n\n...and many more! Check the home carousel for player profiles. Who's your favourite? 😄`;
    },

    [INTENTS.GENERAL]: () => {
      const responses = [
        `I can help with:\n• 📍 **Navigation** — finding your seat, gates, facilities\n• 🍔 **Food & Drink** — menus, halal, vegan options\n• 📅 **Match Schedule** — fixtures, results, standings\n• 📋 **Rules** — offside, VAR, cards, substitutions\n• 🚌 **Transport** — metro, parking, rideshare\n• 🆘 **Safety** — SOS, First Aid, Lost & Found\n• 🎉 **Fan Zone** — activities, merchandise, experiences\n\nWhat would you like to know?`,
        `Great question! As your FIFA World Cup 2026 assistant, I have information about everything at the stadium. Try asking about your seat location, nearby food, the match schedule, or stadium rules!`,
        `I'm your AI companion for the greatest show on Earth! I can answer questions about the stadium layout, match day info, FIFA rules, food options, transport, and safety. What's on your mind?`
      ];
      return Utils.randItem(responses);
    }
  };

  /* =========================================================================
   * AGENT ROUTER — Intent Classification
   * ========================================================================= */

  /**
   * Classify the intent of user input via pattern matching.
   * The Agent Router uses this to delegate to the correct specialized agent.
   * @param {string} text - Sanitized user input
   * @returns {string} Intent constant from INTENTS enum
   */
  function classifyIntent(text) {
    for (const { intent, patterns } of PATTERNS) {
      for (const pattern of patterns) {
        if (pattern.test(text)) return intent;
      }
    }
    return INTENTS.GENERAL;
  }

  /**
   * Resolve which agent handles a given intent
   * @param {string} intent - Intent constant
   * @returns {{ name: string, domain: string } | null}
   */
  function resolveAgent(intent) {
    return AGENT_REGISTRY.find(a => a.intents.includes(intent)) || null;
  }

  /* =========================================================================
   * DASHBOARD AI INSIGHTS GENERATOR
   *
   * Produces the proactive operational intelligence cards shown on the
   * enterprise dashboard landing page. Each insight is generated by its
   * respective specialized agent.
   * ========================================================================= */

  /**
   * Generate all proactive AI insight cards for the dashboard
   * @returns {Array<{id: string, agent: string, title: string, icon: string, severity: string, recommendation: string, reasoning: string, confidence: number, impact: string}>}
   */
  function generateDashboardInsights() {
    return [
      {
        id: 'crowd-prediction',
        agent: 'CrowdIntelAgent',
        title: 'Crowd Congestion Prediction',
        icon: '👥',
        severity: 'high',
        recommendation: 'Redirect incoming fans from Gate A to Gate B immediately.',
        reasoning: 'Gate A density has reached 87% with an upward trend over the last 15 minutes. Gate B remains at 31% capacity with clear throughput. Historical data from similar fixtures shows a 92% probability of bottleneck formation at Gate A within 12 minutes if no intervention occurs.',
        confidence: 94,
        impact: 'Reduces average fan wait time by ~8 minutes and prevents potential safety incident at Gate A.'
      },
      {
        id: 'ops-brief',
        agent: 'OperationsAgent',
        title: 'AI Operational Brief',
        icon: '📋',
        severity: 'medium',
        recommendation: 'Activate pre-match Protocol B for North Concourse crowd flow management.',
        reasoning: 'Current fan ingress rate is 2,340 fans/min (above 2,000 threshold). Kickoff is in 47 minutes. North Concourse sections 105-115 are receiving disproportionate traffic due to metro arrival patterns. Protocol B redirects 30% of flow via upper concourse.',
        confidence: 89,
        impact: 'Balances concourse load across levels, reduces crush risk, and improves fan experience in Sections 105-115.'
      },
      {
        id: 'volunteer-deploy',
        agent: 'VolunteerAgent',
        title: 'Volunteer Deployment',
        icon: '🙋',
        severity: 'low',
        recommendation: 'Deploy 2 additional wayfinding volunteers to Section 105 junction for the next 45 minutes.',
        reasoning: 'Navigation queries from the AI chatbot have spiked 340% for Section 105 area in the last 20 minutes, coinciding with metro arrivals. Current volunteer coverage is 1 per 3 sections — insufficient for pre-match surge.',
        confidence: 91,
        impact: 'Reduces fan confusion, lowers average seat-finding time from 6.2 min to 2.8 min in affected sections.'
      },
      {
        id: 'transport-intel',
        agent: 'TransportAgent',
        title: 'Transport Intelligence',
        icon: '🚌',
        severity: 'medium',
        recommendation: 'Extend NJ Transit Meadowlands Rail service by 30 minutes post-match.',
        reasoning: 'Current match is expected to draw 81,200 fans (98.4% capacity). Historical egress data shows 67% of attendees use rail. Standard service ends 90 min post-match but 23% of fans typically depart after 90 min. Weather forecast (clear, 68°F) reduces taxi/rideshare demand.',
        confidence: 87,
        impact: 'Serves an estimated 4,200 additional fans via rail, reducing parking lot congestion by 18% and rideshare surge pricing.'
      },
      {
        id: 'sustainability',
        agent: 'SustainabilityAgent',
        title: 'Sustainability Metrics',
        icon: '🌱',
        severity: 'low',
        recommendation: 'Increase recycling bin collection frequency at Food Zone North (currently overflowing).',
        reasoning: 'Waste sensors report North Food Zone recycling bins at 94% capacity. South bins are at 45%. Diversion rate is currently 72% — above the 65% FIFA Green Goal target but below our stretch goal of 80%.',
        confidence: 96,
        impact: 'Maintains recycling diversion rate above target and prevents bin overflow that causes cross-contamination of waste streams.'
      },
      {
        id: 'accessibility',
        agent: 'AccessibilityAgent',
        title: 'Accessibility Alert',
        icon: '♿',
        severity: 'medium',
        recommendation: 'Dispatch maintenance to Gate D Elevator 2 — response time increasing.',
        reasoning: 'Elevator 2 at Gate D has shown a 34% increase in door-close cycle time over the last hour (now 8.2 seconds vs. 6.1 second baseline). 14 wheelchair users have entry times via Gate D in the next 30 minutes. Elevator 1 is operational but will be insufficient for peak demand.',
        confidence: 82,
        impact: 'Prevents potential 12-minute delays for wheelchair users arriving via Gate D during the pre-match rush.'
      },
      {
        id: 'emergency-readiness',
        agent: 'EmergencyAgent',
        title: 'Emergency Readiness',
        icon: '🚨',
        severity: 'low',
        recommendation: 'All emergency systems nominal. No action required.',
        reasoning: 'All 4 evacuation routes tested and clear. 12/12 AED units reporting online. Medical staff deployment at 100% (24 medics, 4 ambulances staged). Fire suppression system last tested 6 hours ago — all green. Communication channels verified.',
        confidence: 98,
        impact: 'Full readiness ensures sub-3-minute emergency response time across all stadium zones.'
      },
      {
        id: 'weather-impact',
        agent: 'OperationsAgent',
        title: 'Weather Impact Assessment',
        icon: '🌤️',
        severity: 'low',
        recommendation: 'No weather-related operational changes needed.',
        reasoning: 'Current conditions: Partly Cloudy, 78°F / 26°C, wind 8mph NW, 5% precipitation chance. Heat index is within safe limits. UV index moderate — sunscreen advisory issued via app push notification at 14:00. No lightning risk detected within 100-mile radius.',
        confidence: 95,
        impact: 'Stable conditions support standard operational protocols. No need for rain contingency or extreme heat measures.'
      }
    ];
  }

  /* =========================================================================
   * PUBLIC: Generate Response (Agent Router entry point)
   * ========================================================================= */

  /**
   * Generate a contextual response to user input.
   * The Agent Router classifies intent, resolves the handling agent,
   * and delegates response generation to the local demo engine.
   * @param {string} rawInput - Raw user text (sanitized internally)
   * @param {Object} [context] - Optional context: { stadium, language }
   * @returns {Promise<string>} Response text (may contain markdown)
   */
  async function respond(rawInput, context = {}) {
    // Security: reject unsafe inputs before any processing
    if (!Utils.isSafeInput(rawInput)) {
      return '⚠️ Please enter a valid question without special characters.';
    }
    const input = rawInput.trim().slice(0, 500);
    if (!input) return '';

    return demoRespond(input, context);
  }

  /**
   * Demo mode response generator — routes to the correct agent's handler
   * @param {string} input - Sanitized input
   * @param {Object} context
   * @returns {string}
   */
  function demoRespond(input, context) {
    const intent = classifyIntent(input);
    const agent = resolveAgent(intent);
    if (agent) {
      console.debug(`[AgentRouter] Delegating to ${agent.name} (${agent.domain}) for intent: ${intent}`);
    } else {
      console.debug(`[AgentRouter] No specialized agent for intent: ${intent}, using general handler`);
    }

    const generator = RESPONSES[intent] || RESPONSES[INTENTS.GENERAL];
    try {
      return generator(input, context);
    } catch (err) {
      console.error('[AgentRouter] Response generation error:', err);
      return RESPONSES[INTENTS.GENERAL](input, context);
    }
  }

  /* =========================================================================
   * VOICE I/O
   * ========================================================================= */

  let recognition = null;
  let isListeningState = false;
  let synthesis = window.speechSynthesis;

  /**
   * Start voice recognition
   * @param {Function} onResult - Callback with transcript string
   * @param {Function} onError - Callback with error message
   * @param {Function} onEnd - Callback when recognition ends
   * @returns {boolean} Success
   */
  function startListening(onResult, onError, onEnd) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      onError?.('Voice input not supported in this browser. Try Chrome.');
      return false;
    }

    if (isListeningState) stopListening();

    recognition = new SpeechRecognition();
    recognition.lang = I18n.getSpeechLang();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (e) => {
      const transcript = e.results[0]?.[0]?.transcript?.trim();
      if (transcript) {
        onResult?.(transcript);
        Utils.announce(`You said: ${transcript}`, 'polite');
      }
    };

    recognition.onerror = (e) => {
      const messages = {
        'no-speech': 'No speech detected. Please try again.',
        'audio-capture': 'Microphone not accessible. Check browser permissions.',
        'not-allowed': 'Microphone access denied. Please allow microphone in browser settings.',
        'network': 'Network error during voice recognition.'
      };
      onError?.(messages[e.error] || `Voice error: ${e.error}`);
      isListeningState = false;
    };

    recognition.onend = () => {
      isListeningState = false;
      onEnd?.();
    };

    try {
      recognition.start();
      isListeningState = true;
      Utils.announce('Listening. Speak now.', 'assertive');
      return true;
    } catch (err) {
      console.error('[AgentRouter] Voice start error:', err);
      onError?.('Could not start voice recognition.');
      return false;
    }
  }

  /**
   * Stop voice recognition
   */
  function stopListening() {
    if (recognition && isListeningState) {
      recognition.stop();
      isListeningState = false;
    }
  }

  /**
   * Speak text using TTS
   * @param {string} text - Text to speak (markdown stripped internally)
   * @param {Function} [onEnd] - Callback when speech ends
   */
  function speak(text, onEnd) {
    if (!synthesis) return;
    synthesis.cancel();

    // Strip markdown for cleaner TTS
    const clean = text.replace(/\*\*/g, '').replace(/\*/g, '').replace(/#{1,6}\s/g, '').replace(/•/g, '').slice(0, 800);

    const utter = new SpeechSynthesisUtterance(clean);
    utter.lang = I18n.getSpeechLang();
    utter.rate = 0.95;
    utter.pitch = 1.0;
    utter.volume = 1.0;

    // Try to find a voice matching the language
    const voices = synthesis.getVoices();
    const langCode = I18n.getLang();
    const matchedVoice = voices.find(v => v.lang.startsWith(langCode) && !v.name.includes('Google'));
    if (matchedVoice) utter.voice = matchedVoice;

    utter.onend = () => onEnd?.();
    utter.onerror = (e) => console.warn('[AIEngine] TTS error:', e.error);

    synthesis.speak(utter);
  }

  /**
   * Stop speech synthesis
   */
  function stopSpeaking() {
    synthesis?.cancel();
  }

  /**
   * Check if voice input is supported
   * @returns {boolean}
   */
  function isVoiceSupported() {
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  /**
   * Check if TTS is supported
   * @returns {boolean}
   */
  function isTTSSupported() {
    return !!window.speechSynthesis;
  }

  /* =========================================================================
   * PUBLIC API
   * ========================================================================= */
  return {
    respond,
    classifyIntent,
    resolveAgent,
    generateDashboardInsights,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    isVoiceSupported,
    isTTSSupported,
    isListening: () => isListeningState,
    INTENTS,
    AGENT_REGISTRY
  };
})();

if (typeof module !== 'undefined' && module.exports) module.exports = AIEngine;
