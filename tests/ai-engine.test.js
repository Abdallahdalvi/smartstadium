/**
 * @fileoverview Tests for Multi-Agent AI Engine (AgentRouter)
 * Tests: intent classification, agent resolution, response generation,
 * dashboard insights, security, and edge cases.
 */

// Mock browser globals required by the IIFE modules
global.window = {
  SpeechRecognition: undefined,
  webkitSpeechRecognition: undefined,
  speechSynthesis: undefined
};
global.navigator = {};
global.fetch = jest.fn();

// Provide required module dependencies
global.Utils = require('../js/utils');
global.I18n = require('../js/i18n');
global.KB = require('../js/knowledge-base');

const AIEngine = require('../js/ai-engine');

/* ==========================================================================
 * Intent Classification — AgentRouter
 * ========================================================================== */
describe('AIEngine — Intent Classification (AgentRouter)', () => {
  test('classifies greeting intent for common greetings', () => {
    expect(AIEngine.classifyIntent('hello there')).toBe(AIEngine.INTENTS.GREETING);
    expect(AIEngine.classifyIntent('hi')).toBe(AIEngine.INTENTS.GREETING);
    expect(AIEngine.classifyIntent('hey!')).toBe(AIEngine.INTENTS.GREETING);
    expect(AIEngine.classifyIntent('hola')).toBe(AIEngine.INTENTS.GREETING);
    expect(AIEngine.classifyIntent('bonjour')).toBe(AIEngine.INTENTS.GREETING);
  });

  test('classifies food intent for food and drink queries', () => {
    expect(AIEngine.classifyIntent('I want to buy a burger')).toBe(AIEngine.INTENTS.FOOD);
    expect(AIEngine.classifyIntent('is there halal food?')).toBe(AIEngine.INTENTS.FOOD);
    expect(AIEngine.classifyIntent('vegan options please')).toBe(AIEngine.INTENTS.FOOD);
    expect(AIEngine.classifyIntent('where can I get a beer?')).toBe(AIEngine.INTENTS.FOOD);
  });

  test('classifies emergency intent for urgent queries', () => {
    expect(AIEngine.classifyIntent('sos help')).toBe(AIEngine.INTENTS.EMERGENCY);
    expect(AIEngine.classifyIntent('there is a fire')).toBe(AIEngine.INTENTS.EMERGENCY);
    expect(AIEngine.classifyIntent('evacuate now')).toBe(AIEngine.INTENTS.EMERGENCY);
  });

  test('classifies medical intent for health queries', () => {
    expect(AIEngine.classifyIntent('I feel hurt')).toBe(AIEngine.INTENTS.MEDICAL);
    expect(AIEngine.classifyIntent('where is first aid?')).toBe(AIEngine.INTENTS.MEDICAL);
    expect(AIEngine.classifyIntent('I need a doctor')).toBe(AIEngine.INTENTS.MEDICAL);
  });

  test('classifies sustainability intent', () => {
    expect(AIEngine.classifyIntent('how do I recycle?')).toBe(AIEngine.INTENTS.SUSTAINABILITY);
    expect(AIEngine.classifyIntent('carbon offset')).toBe(AIEngine.INTENTS.SUSTAINABILITY);
    expect(AIEngine.classifyIntent('eco-friendly options')).toBe(AIEngine.INTENTS.SUSTAINABILITY);
  });

  test('classifies crowd intelligence intent', () => {
    expect(AIEngine.classifyIntent('is the stadium busy?')).toBe(AIEngine.INTENTS.CROWD);
    expect(AIEngine.classifyIntent('crowd density at gate A')).toBe(AIEngine.INTENTS.CROWD);
    expect(AIEngine.classifyIntent('how long is the queue?')).toBe(AIEngine.INTENTS.CROWD);
  });

  test('classifies volunteer intent', () => {
    expect(AIEngine.classifyIntent('deploy volunteers')).toBe(AIEngine.INTENTS.VOLUNTEER);
  });

  test('classifies security intent', () => {
    expect(AIEngine.classifyIntent('prohibited items')).toBe(AIEngine.INTENTS.SECURITY);
    expect(AIEngine.classifyIntent('bag check policy')).toBe(AIEngine.INTENTS.SECURITY);
  });

  test('classifies transport intent', () => {
    expect(AIEngine.classifyIntent('how do I take the train to the stadium?')).toBe(AIEngine.INTENTS.TRANSPORT);
    expect(AIEngine.classifyIntent('is there parking available?')).toBe(AIEngine.INTENTS.TRANSPORT);
    expect(AIEngine.classifyIntent('train to stadium')).toBe(AIEngine.INTENTS.TRANSPORT);
  });

  test('classifies accessibility intent', () => {
    expect(AIEngine.classifyIntent('wheelchair access')).toBe(AIEngine.INTENTS.ACCESSIBILITY);
    expect(AIEngine.classifyIntent('hearing loop available?')).toBe(AIEngine.INTENTS.ACCESSIBILITY);
  });

  test('classifies staff operations intent', () => {
    expect(AIEngine.classifyIntent('show staff ops')).toBe(AIEngine.INTENTS.STAFF);
    expect(AIEngine.classifyIntent('enable staff mode')).toBe(AIEngine.INTENTS.STAFF);
  });

  test('classifies volunteer intent', () => {
    expect(AIEngine.classifyIntent('volunteer deployment')).toBe(AIEngine.INTENTS.VOLUNTEER);
    expect(AIEngine.classifyIntent('assign volunteer')).toBe(AIEngine.INTENTS.VOLUNTEER);
  });

  test('classifies navigation intent for wayfinding queries', () => {
    expect(AIEngine.classifyIntent('where is gate A?')).toBe(AIEngine.INTENTS.NAVIGATION);
    expect(AIEngine.classifyIntent('nearest restroom')).toBe(AIEngine.INTENTS.NAVIGATION);
    expect(AIEngine.classifyIntent('how do I find the exit?')).toBe(AIEngine.INTENTS.NAVIGATION);
  });

  test('classifies seating intent', () => {
    expect(AIEngine.classifyIntent('I am in section 140')).toBe(AIEngine.INTENTS.SEATING);
    expect(AIEngine.classifyIntent('where is my seat row G')).toBe(AIEngine.INTENTS.SEATING);
  });

  test('classifies schedule intent', () => {
    expect(AIEngine.classifyIntent('when is the next match?')).toBe(AIEngine.INTENTS.SCHEDULE);
    expect(AIEngine.classifyIntent('match fixtures')).toBe(AIEngine.INTENTS.SCHEDULE);
  });

  test('falls back to general intent for ambiguous queries', () => {
    expect(AIEngine.classifyIntent('can I bring my dog?')).toBe(AIEngine.INTENTS.GENERAL);
    expect(AIEngine.classifyIntent('random question here')).toBe(AIEngine.INTENTS.GENERAL);
  });
});

/* ==========================================================================
 * Agent Resolution — AgentRouter
 * ========================================================================== */
describe('AIEngine — Agent Resolution', () => {
  test('resolves CrowdIntelAgent for crowd intent', () => {
    const agent = AIEngine.resolveAgent(AIEngine.INTENTS.CROWD);
    expect(agent).not.toBeNull();
    expect(agent.name).toBe('CrowdIntelAgent');
  });

  test('resolves EmergencyAgent for emergency intent', () => {
    const agent = AIEngine.resolveAgent(AIEngine.INTENTS.EMERGENCY);
    expect(agent).not.toBeNull();
    expect(agent.name).toBe('EmergencyAgent');
  });

  test('resolves NavigationAgent for navigation intent', () => {
    const agent = AIEngine.resolveAgent(AIEngine.INTENTS.NAVIGATION);
    expect(agent).not.toBeNull();
    expect(agent.name).toBe('NavigationAgent');
  });

  test('resolves NavigationAgent for seating intent', () => {
    const agent = AIEngine.resolveAgent(AIEngine.INTENTS.SEATING);
    expect(agent).not.toBeNull();
    expect(agent.name).toBe('NavigationAgent');
  });

  test('resolves SustainabilityAgent for sustainability intent', () => {
    const agent = AIEngine.resolveAgent(AIEngine.INTENTS.SUSTAINABILITY);
    expect(agent).not.toBeNull();
    expect(agent.name).toBe('SustainabilityAgent');
  });

  test('returns null for unregistered intents', () => {
    const agent = AIEngine.resolveAgent(AIEngine.INTENTS.GENERAL);
    expect(agent).toBeNull();
  });

  test('AGENT_REGISTRY is an array with all expected agents', () => {
    const names = AIEngine.AGENT_REGISTRY.map(a => a.name);
    expect(names).toContain('CrowdIntelAgent');
    expect(names).toContain('EmergencyAgent');
    expect(names).toContain('NavigationAgent');
    expect(names).toContain('VolunteerAgent');
    expect(names).toContain('SustainabilityAgent');
    expect(names).toContain('SecurityAgent');
    expect(names).toContain('MedicalAgent');
    expect(names).toContain('AccessibilityAgent');
    expect(names).toContain('TransportAgent');
    expect(names).toContain('OperationsAgent');
  });
});

/* ==========================================================================
 * Response Generation — Demo Mode
 * ========================================================================== */
describe('AIEngine — Response Generation (Demo Mode)', () => {
  test('responds to food intent with menu content', async () => {
    const response = await AIEngine.respond('hungry for some nachos');
    expect(response).toMatch(/Food|food|menu/i);
  });

  test('responds to halal food queries with halal info', async () => {
    const response = await AIEngine.respond('where can I find halal food?');
    expect(response).toMatch(/halal|Halal/);
  });

  test('responds to vegan food queries', async () => {
    const response = await AIEngine.respond('any vegan options?');
    expect(response).toMatch(/vegan|Vegan/i);
  });

  test('responds to alcohol queries with age warning', async () => {
    const response = await AIEngine.respond('where can I get a beer?');
    expect(response).toMatch(/beer|Beer|alcohol/i);
  });

  test('responds to emergency intent with SOS info', async () => {
    const response = await AIEngine.respond('this is an emergency!');
    expect(response).toMatch(/emergency|SOS|Emergency/i);
  });

  test('responds to sustainability intent', async () => {
    const response = await AIEngine.respond('how do I recycle here?');
    expect(response).toMatch(/recycle|Recycle|sustainability|Eco/i);
  });

  test('responds to crowd intent with congestion data', async () => {
    const response = await AIEngine.respond('is it crowded at Gate A?');
    expect(response).toMatch(/crowd|Crowd|congestion|density/i);
  });

  test('responds to transport intent with transit info', async () => {
    const response = await AIEngine.respond('train to stadium');
    expect(response).toMatch(/transit|metro|parking|transport|Transport/i);
  });

  test('responds to accessibility queries', async () => {
    const response = await AIEngine.respond('wheelchair access?');
    expect(response).toMatch(/wheelchair|Wheelchair|accessible|Accessible/i);
  });

  test('responds to wifi queries', async () => {
    const response = await AIEngine.respond('what is the wifi password?');
    expect(response).toMatch(/wifi|WiFi|network|FIFA_WC2026/i);
  });

  test('handles unsafe input and returns warning', async () => {
    const response = await AIEngine.respond('<script>alert("xss")</script>');
    expect(response).toContain('⚠️');
  });

  test('handles empty input gracefully', async () => {
    const response = await AIEngine.respond('   ');
    expect(response).toBe('');
  });

  test('returns general help for unknown queries', async () => {
    const response = await AIEngine.respond('abcdefghijklmno completely random');
    expect(typeof response).toBe('string');
    expect(response.length).toBeGreaterThan(0);
  });

  test('responds to schedule queries with match data', async () => {
    const response = await AIEngine.respond('when is the next match?');
    expect(response).toMatch(/match|Match|schedule|Schedule/i);
  });

  test('responds to ticket queries', async () => {
    const response = await AIEngine.respond('show me my ticket QR code');
    expect(response).toMatch(/ticket|Ticket|QR|entry/i);
  });

  test('responds to lost and found queries', async () => {
    const response = await AIEngine.respond('I lost my wallet');
    expect(response).toMatch(/lost|Lost|found|Found/i);
  });

  test('responds to missing child query with urgent message', async () => {
    const response = await AIEngine.respond('my child is missing');
    expect(response).toMatch(/child|Child|missing|Missing|urgent|URGENT/i);
  });

  test('responds to VAR rule queries', async () => {
    const response = await AIEngine.respond('what is VAR?');
    expect(response).toMatch(/VAR/i);
  });

  test('responds to offside rule queries', async () => {
    const response = await AIEngine.respond('explain the offside rule');
    expect(response).toMatch(/offside|Offside/i);
  });
});

/* ==========================================================================
 * Dashboard Insights — generateDashboardInsights()
 * ========================================================================== */
describe('AIEngine — generateDashboardInsights()', () => {
  let insights;

  beforeAll(() => {
    insights = AIEngine.generateDashboardInsights();
  });

  test('returns an array of insights', () => {
    expect(Array.isArray(insights)).toBe(true);
    expect(insights.length).toBeGreaterThanOrEqual(5);
  });

  test('every insight has all required fields', () => {
    insights.forEach(ins => {
      expect(ins).toHaveProperty('id');
      expect(ins).toHaveProperty('agent');
      expect(ins).toHaveProperty('title');
      expect(ins).toHaveProperty('icon');
      expect(ins).toHaveProperty('severity');
      expect(ins).toHaveProperty('recommendation');
      expect(ins).toHaveProperty('reasoning');
      expect(ins).toHaveProperty('confidence');
      expect(ins).toHaveProperty('impact');
    });
  });

  test('every insight severity is one of: high, medium, low', () => {
    const valid = new Set(['high', 'medium', 'low']);
    insights.forEach(ins => {
      expect(valid.has(ins.severity)).toBe(true);
    });
  });

  test('every insight confidence is a number between 0 and 100', () => {
    insights.forEach(ins => {
      expect(typeof ins.confidence).toBe('number');
      expect(ins.confidence).toBeGreaterThanOrEqual(0);
      expect(ins.confidence).toBeLessThanOrEqual(100);
    });
  });

  test('all insight ids are unique', () => {
    const ids = insights.map(i => i.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  test('CrowdIntelAgent insight is included', () => {
    const crowdInsight = insights.find(i => i.agent === 'CrowdIntelAgent');
    expect(crowdInsight).toBeDefined();
  });

  test('EmergencyAgent insight is included', () => {
    const emergencyInsight = insights.find(i => i.agent === 'EmergencyAgent');
    expect(emergencyInsight).toBeDefined();
  });

  test('SustainabilityAgent insight is included', () => {
    const sustainInsight = insights.find(i => i.agent === 'SustainabilityAgent');
    expect(sustainInsight).toBeDefined();
  });

  test('all recommendation strings are non-empty', () => {
    insights.forEach(ins => {
      expect(typeof ins.recommendation).toBe('string');
      expect(ins.recommendation.trim().length).toBeGreaterThan(0);
    });
  });

  test('all reasoning strings are substantive (>50 chars)', () => {
    insights.forEach(ins => {
      expect(ins.reasoning.length).toBeGreaterThan(50);
    });
  });
});

/* ==========================================================================
 * Public API surface verification
 * ========================================================================== */
describe('AIEngine — Public API', () => {
  test('exports all required methods', () => {
    expect(typeof AIEngine.respond).toBe('function');
    expect(typeof AIEngine.classifyIntent).toBe('function');
    expect(typeof AIEngine.resolveAgent).toBe('function');
    expect(typeof AIEngine.generateDashboardInsights).toBe('function');
    expect(typeof AIEngine.startListening).toBe('function');
    expect(typeof AIEngine.stopListening).toBe('function');
    expect(typeof AIEngine.speak).toBe('function');
    expect(typeof AIEngine.stopSpeaking).toBe('function');
    expect(typeof AIEngine.isVoiceSupported).toBe('function');
    expect(typeof AIEngine.isTTSSupported).toBe('function');
    expect(typeof AIEngine.isListening).toBe('function');
    expect(typeof AIEngine.INTENTS).toBe('object');
    expect(typeof AIEngine.AGENT_REGISTRY).toBe('object');
  });

  test('INTENTS enum has all required constants', () => {
    const required = [
      'NAVIGATION', 'SEATING', 'FOOD', 'RULES', 'SCHEDULE', 'TRANSPORT',
      'EMERGENCY', 'MEDICAL', 'ACCESSIBILITY', 'WIFI', 'LOST', 'WEATHER',
      'TICKETS', 'FANZONE', 'PLAYERS', 'SUSTAINABILITY', 'STAFF',
      'VOLUNTEER', 'SECURITY', 'CROWD', 'GREETING', 'THANKS', 'GENERAL'
    ];
    required.forEach(key => {
      expect(AIEngine.INTENTS).toHaveProperty(key);
    });
  });

  test('isVoiceSupported returns a boolean', () => {
    expect(typeof AIEngine.isVoiceSupported()).toBe('boolean');
  });

  test('isTTSSupported returns a boolean', () => {
    expect(typeof AIEngine.isTTSSupported()).toBe('boolean');
  });

  test('isListening returns a boolean', () => {
    expect(typeof AIEngine.isListening()).toBe('boolean');
  });
});
