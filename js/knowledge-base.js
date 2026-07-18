/**
 * @fileoverview FIFA WC 2026 Knowledge Base
 * Comprehensive data store: matches, stadiums, FAQs, food menus, rules, transport
 * Used by the AI Engine for contextual responses
 */

const KB = {

  /* =========================================================================
   * STADIUMS
   * ========================================================================= */
  stadiums: [
    {
      id: 'metlife',
      name: 'MetLife Stadium',
      city: 'East Rutherford, NJ',
      country: 'USA',
      capacity: 82500,
      surface: 'FieldTurf',
      opened: 1976,
      timezone: 'America/New_York',
      coordinates: { lat: 40.8136, lng: -74.0744 },
      description: 'Iconic NFL stadium hosting the FIFA WC 2026 Final. Home to New York Giants & Jets.',
      gates: ['Gate A (North)', 'Gate B (East)', 'Gate C (South)', 'Gate D (West)'],
      sections: { lower: '100-149', club: '200-249', upper: '300-349' },
      facilities: {
        medical: ['Section 110', 'Section 130', 'Section 330'],
        toilets: ['Every concourse level, every 5 sections'],
        food: ['Concourse Level 1 & 2', 'Club Level dining', '12 concession stands'],
        atm: ['Gate A lobby', 'Gate C lobby', 'Club level'],
        accessibility: ['Elevator Banks at all gates', 'Accessible seating Section 120, 140, 320'],
        familyRoom: ['Section 115 Family Lounge'],
        firstAid: ['Section 110 First Aid', 'Section 330 First Aid'],
        lostFound: ['Gate A Information Desk', 'Control Room Level 3']
      },
      transport: {
        metro: 'NJ Transit Meadowlands Rail — Direct from Penn Station (20 min)',
        bus: 'Express buses from NY Port Authority',
        parking: 'Lots A–F (arrive 3hrs early), cashless only',
        uber: 'Designated pickup: Lot B1 East'
      },
      matchDay: {
        gatesOpen: '3 hours before kickoff',
        prohibited: ['Glass containers', 'Alcohol from outside', 'Laser pointers', 'Drones', 'Umbrellas over 12"'],
        allowed: ['Clear bags (12"x6"x12")', 'Sealed water bottles (500ml)', 'Soft-sided coolers'],
        reentry: false
      }
    },
    {
      id: 'sofi',
      name: 'SoFi Stadium',
      city: 'Inglewood, CA',
      country: 'USA',
      capacity: 70240,
      surface: 'Natural Grass',
      timezone: 'America/Los_Angeles',
      description: 'State-of-the-art domed stadium, one of the most technologically advanced venues.',
      gates: ['Gate 1 (North)', 'Gate 2 (East)', 'Gate 3 (South)', 'Gate 4 (West)'],
      transport: {
        metro: 'Metro K Line — Fairview Heights Station',
        bus: 'LAX Shuttle + Metro Bus 115',
        parking: 'Lots 1–8 (cashless), $50–75',
        ride: 'Rideshare at designated lot'
      }
    },
    {
      id: 'azteca',
      name: 'Estadio Azteca',
      city: 'Mexico City',
      country: 'Mexico',
      capacity: 87523,
      surface: 'Natural Grass',
      description: 'Legendary stadium, the only venue to host two FIFA World Cup Finals (1970, 1986).',
      timezone: 'America/Mexico_City',
      gates: ['Puerta 1 (Norte)', 'Puerta 6 (Sur)', 'Puerta 15 (Este)', 'Puerta 20 (Oeste)'],
      transport: {
        metro: 'Metro Line 2 — Tasqueña Station then shuttle',
        bus: 'RTP Bus route 7, 26',
        parking: 'Limited — Metro strongly recommended'
      }
    },
    {
      id: 'bcplace',
      name: 'BC Place',
      city: 'Vancouver',
      country: 'Canada',
      capacity: 54500,
      surface: 'FieldTurf',
      timezone: 'America/Vancouver',
      description: 'Iconic domed stadium in downtown Vancouver with retractable roof.',
      gates: ['Gate A (North)', 'Gate B (South)', 'Gate C (East)', 'Gate D (West)'],
      transport: {
        metro: 'SkyTrain Expo/Millennium Line — Stadium-Chinatown Station',
        bus: 'TransLink Bus routes 3, 8, 50',
        parking: 'BC Place Parking Garage, Pacific Centre Parkade'
      }
    }
  ],

  /* =========================================================================
   * MATCH SCHEDULE — FIFA WC 2026 (Selected Key Fixtures)
   * ========================================================================= */
  matches: [
    {
      id: 'm001',
      stage: 'Group A',
      home: { team: 'Mexico', flag: '🇲🇽', code: 'MEX' },
      away: { team: 'Poland', flag: '🇵🇱', code: 'POL' },
      date: '2026-06-11',
      time: '18:00',
      stadium: 'Estadio Azteca',
      city: 'Mexico City',
      status: 'completed',
      score: { home: 2, away: 0 }
    },
    {
      id: 'm002',
      stage: 'Group B',
      home: { team: 'USA', flag: '🇺🇸', code: 'USA' },
      away: { team: 'Wales', flag: '🏴󠁧󠁢󠁷󠁬󠁳󠁿', code: 'WAL' },
      date: '2026-06-12',
      time: '15:00',
      stadium: 'SoFi Stadium',
      city: 'Los Angeles',
      status: 'completed',
      score: { home: 1, away: 1 }
    },
    {
      id: 'm010',
      stage: 'Group C',
      home: { team: 'France', flag: '🇫🇷', code: 'FRA' },
      away: { team: 'Brazil', flag: '🇧🇷', code: 'BRA' },
      date: '2026-06-15',
      time: '20:00',
      stadium: 'MetLife Stadium',
      city: 'New York',
      status: 'upcoming'
    },
    {
      id: 'm011',
      stage: 'Group D',
      home: { team: 'Argentina', flag: '🇦🇷', code: 'ARG' },
      away: { team: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', code: 'ENG' },
      date: '2026-06-17',
      time: '18:00',
      stadium: 'MetLife Stadium',
      city: 'New York',
      status: 'upcoming'
    },
    {
      id: 'm012',
      stage: 'Group E',
      home: { team: 'Spain', flag: '🇪🇸', code: 'ESP' },
      away: { team: 'Germany', flag: '🇩🇪', code: 'GER' },
      date: '2026-06-20',
      time: '21:00',
      stadium: 'SoFi Stadium',
      city: 'Los Angeles',
      status: 'upcoming'
    },
    {
      id: 'm020',
      stage: 'Quarter Final',
      home: { team: 'TBD', flag: '🏳️', code: 'TBD' },
      away: { team: 'TBD', flag: '🏳️', code: 'TBD' },
      date: '2026-07-03',
      time: '20:00',
      stadium: 'MetLife Stadium',
      city: 'New York',
      status: 'upcoming'
    },
    {
      id: 'm021',
      stage: 'Semi Final',
      home: { team: 'TBD', flag: '🏳️', code: 'TBD' },
      away: { team: 'TBD', flag: '🏳️', code: 'TBD' },
      date: '2026-07-14',
      time: '20:00',
      stadium: 'MetLife Stadium',
      city: 'New York',
      status: 'upcoming'
    },
    {
      id: 'mFinal',
      stage: 'FINAL 🏆',
      home: { team: 'TBD', flag: '🏳️', code: 'TBD' },
      away: { team: 'TBD', flag: '🏳️', code: 'TBD' },
      date: '2026-07-19',
      time: '20:00',
      stadium: 'MetLife Stadium',
      city: 'New York',
      status: 'upcoming'
    }
  ],

  /* =========================================================================
   * FOOD & BEVERAGE MENUS
   * ========================================================================= */
  foodMenu: {
    categories: ['Classic', 'International', 'Halal', 'Vegetarian', 'Vegan', 'Gluten-Free', 'Kids'],
    items: [
      { name: 'Stadium Hot Dog', price: '$9', category: 'Classic', stand: 'All concessions' },
      { name: 'Nachos & Cheese', price: '$11', category: 'Classic', stand: 'Sections 101-120' },
      { name: 'Beer (Budweiser)', price: '$14', category: 'Classic', stand: 'Beer stations', ageRequired: 21 },
      { name: 'Coca-Cola / Pepsi', price: '$6', category: 'Classic', stand: 'All concessions' },
      { name: 'Tacos al Pastor', price: '$13', category: 'International', stand: 'Azteca — all stands' },
      { name: 'Falafel Wrap', price: '$12', category: 'Halal', stand: 'Halal stand — Gate B' },
      { name: 'Chicken Tikka Naan', price: '$14', category: 'Halal', stand: 'Halal stand — Gate B' },
      { name: 'Veggie Burger', price: '$11', category: 'Vegetarian', stand: 'Green concession — Section 130' },
      { name: 'Vegan Burrito Bowl', price: '$13', category: 'Vegan', stand: 'Green concession — Section 130' },
      { name: 'Poutine (Canada only)', price: 'CAD $12', category: 'International', stand: 'BC Place — all stands' },
      { name: 'Empanadas (3 pcs)', price: '$10', category: 'International', stand: 'International Food Zone' },
      { name: 'Pizza Slice', price: '$8', category: 'Classic', stand: 'Pizza station — Club level' },
      { name: 'Fresh Fruit Cup', price: '$7', category: 'Vegan', stand: 'All concessions' },
      { name: 'Kids Meal (Hot dog + drink)', price: '$12', category: 'Kids', stand: 'Family Zones' },
      { name: 'Grilled Chicken Wrap', price: '$13', category: 'Gluten-Free', stand: 'Health section — Gate A' }
    ]
  },

  /* =========================================================================
   * FIFA RULES & REGULATIONS
   * ========================================================================= */
  rules: {
    game: [
      'Each match consists of two 45-minute halves with a 15-minute half-time interval.',
      'Extra time (two 15-min periods) then penalty shootout if tied after 90 minutes in knockout stage.',
      'A team must have at least 7 players on the field to continue a match.',
      'Each team is allowed up to 5 substitutions per match (6 in extra time) using 3 stoppages.',
      'The offside rule: a player is offside if closer to the opponents\' goal line than both the ball and the second-to-last opponent.',
      'Video Assistant Referee (VAR) is used for clear and obvious errors in goal/no goal, penalty/no penalty, direct red card, and mistaken identity decisions.',
      'Yellow card = caution. Two yellows = automatic red card. Red card = immediate ejection and one-match suspension.',
      'FIFA WC 2026 features 48 teams in 12 groups of 4. Top 2 from each group + 8 best 3rd-place teams advance to Round of 32.',
    ],
    stadium: [
      'No re-entry once you have left the venue.',
      'Clear bags only (max 12"x6"x12"). No large bags or backpacks.',
      'No glass containers, alcohol from outside, or laser pointers.',
      'No smoking anywhere inside the venue.',
      'Ticket must be scanned on entry — mobile tickets accepted.',
      'ID verification required for alcohol purchase (21+ USA, 18+ Canada/Mexico).',
      'Designated family zones available in every stadium.',
      'No drones, selfie sticks over 12", or professional camera equipment without press credentials.',
    ],
    ticketing: [
      'Tickets are non-transferable and linked to your ID.',
      'Gate opens 3 hours before kickoff.',
      'Late arrival: seats may be used by others until 15 minutes after kickoff.',
      'Ticket refunds only for cancelled matches (rescheduled = original ticket valid).',
    ]
  },

  /* =========================================================================
   * TRANSPORT INFORMATION
   * ========================================================================= */
  transport: {
    general: [
      'FIFA strongly recommends using public transport on match days.',
      'Roads within 2km of stadiums close 4 hours before and 2 hours after matches.',
      'Fan Zones accessible without a match ticket — open 5 hours before kickoff.',
      'Accessible transport options including ramps and priority seating on all transit lines.',
    ],
    rideshare: 'Uber and Lyft operate designated pick-up/drop-off zones at each stadium. Pre-book in the app.',
    accessibility: 'Wheelchair-accessible vehicles available via Access-A-Ride (USA) or equivalent services.'
  },

  /* =========================================================================
   * FAQ RESPONSES
   * ========================================================================= */
  faqs: [
    {
      id: 'faq-seat',
      q: 'How do I find my seat?',
      a: 'Open the Navigate tab and enter your section, row, and seat number. Our AI will draw a turn-by-turn path from your current location to your seat. Look for section signs at each gate entrance — they are lit and color-coded.'
    },
    {
      id: 'faq-toilet',
      q: 'Where are the nearest restrooms?',
      a: 'Restrooms are located every 5 sections on every concourse level. On the Navigate tab, tap "Nearest Toilet" to get directions. There are accessible restrooms with extra space at every gate and family restrooms near Section 115.'
    },
    {
      id: 'faq-food',
      q: 'What food is available?',
      a: 'We have 12+ food concession areas including Classic, International, Halal, Vegetarian, Vegan, and Gluten-Free options. The International Food Zone (Section 130 area) has cuisine from participating nations. Check the Fan Experience tab for full menu details.'
    },
    {
      id: 'faq-wifi',
      q: 'Is there WiFi in the stadium?',
      a: 'Yes! Connect to "FIFA_WC2026_FAN" (no password required). The network supports up to 80,000 simultaneous connections with gigabit speeds. For offline access, this app works fully offline too!'
    },
    {
      id: 'faq-lost',
      q: 'I lost something / my child is missing',
      a: 'Please go to the Emergency & Safety tab immediately. For a missing child, tap "Report Missing Child" — this broadcasts an alert to all staff. For lost items, tap "Lost & Found" to report and receive a tracking reference. Information desks are at every gate.'
    },
    {
      id: 'faq-medical',
      q: 'I need medical help',
      a: 'Go to Emergency & Safety and tap the SOS button or call the medical number. First Aid stations are at Sections 110 and 330 (inside) and Gate A/C (outside). Stadium medical staff are identifiable by green vests. Don\'t move an injured person — call for help.'
    },
    {
      id: 'faq-accessibility',
      q: 'What accessibility services are available?',
      a: 'Accessible seating is in Sections 120, 140, and 320. Elevators are at all 4 gates. Hearing loops are installed throughout. Guide dogs welcome. Accessible parking in Lot A1 (priority). Contact accessibility@fifa.wc2026 or call +1-800-FIFA-ACC.'
    },
    {
      id: 'faq-photo',
      q: 'Can I take photos and videos?',
      a: 'Yes! Personal photos and short videos for non-commercial use are allowed. No professional camera equipment (lenses over 100mm) or tripods without press credentials. No flash during play. Video streaming commercially requires a media license.'
    },
    {
      id: 'faq-weather',
      q: 'What should I bring for the weather?',
      a: 'Check the Match Day Conditions widget on the home page for real-time weather at your stadium. Sealed water bottles (500ml) are permitted. Sunscreen and hats are recommended for outdoor stadiums. Light layers for evening matches.'
    }
  ],

  /* =========================================================================
   * FAN ZONE ACTIVITIES
   * ========================================================================= */
  fanZoneActivities: [
    {
      id: 'fz-001',
      name: 'FIFA Trophy Experience',
      emoji: '🏆',
      description: 'Get a selfie with the FIFA World Cup Trophy! Timeslots every 15 mins.',
      location: 'Fan Zone Plaza — Center Stage',
      duration: '15 minutes',
      cost: 'Free with match ticket',
      tags: ['photo', 'iconic', 'all-ages'],
      color: 'linear-gradient(135deg, #B8860B, #FFD700)'
    },
    {
      id: 'fz-002',
      name: 'Skills Challenge Arena',
      emoji: '⚽',
      description: 'Test your football skills — shooting, dribbling, and free-kick accuracy competitions.',
      location: 'Fan Zone East Wing',
      duration: '20 minutes',
      cost: 'Free',
      tags: ['interactive', 'sports', 'competitive'],
      color: 'linear-gradient(135deg, #1a6b2a, #22C55E)'
    },
    {
      id: 'fz-003',
      name: 'Global Food Festival',
      emoji: '🌍',
      description: 'Taste dishes from all 48 World Cup nations. 80+ food vendors from around the globe.',
      location: 'International Food Village',
      duration: 'All day',
      cost: 'Pay per item',
      tags: ['food', 'culture', 'family'],
      color: 'linear-gradient(135deg, #C2410C, #F97316)'
    },
    {
      id: 'fz-004',
      name: 'Official FIFA Megastore',
      emoji: '👕',
      description: 'Official jerseys, scarves, boots, and exclusive WC2026 merchandise. Personalise your jersey!',
      location: 'Merchandise Pavilion — Gate B',
      duration: 'All day',
      cost: 'Varies',
      tags: ['shopping', 'merchandise'],
      color: 'linear-gradient(135deg, #1E3A8A, #3B82F6)'
    },
    {
      id: 'fz-005',
      name: 'AR Photo Booth',
      emoji: '📸',
      description: 'Augmented reality selfie experience — appear on the pitch with your favourite players!',
      location: 'Digital Experience Zone',
      duration: '10 minutes',
      cost: 'Free',
      tags: ['tech', 'photo', 'fun'],
      color: 'linear-gradient(135deg, #6D28D9, #A78BFA)'
    },
    {
      id: 'fz-006',
      name: 'Stadium Fan March',
      emoji: '🎺',
      description: 'Join the pre-match parade from Fan Village to stadium gates. Drums, flags, and singing!',
      location: 'Fan Village Entrance',
      duration: '45 minutes',
      cost: 'Free',
      tags: ['community', 'music', 'pre-match'],
      color: 'linear-gradient(135deg, #BE185D, #EC4899)'
    },
    {
      id: 'fz-007',
      name: 'Kids World Cup Zone',
      emoji: '🧒',
      description: 'Mini pitch, face painting, FIFA mascot meet & greet, and skill workshops for under-12s.',
      location: 'Family Zone — North Gate',
      duration: 'All day',
      cost: 'Free',
      tags: ['kids', 'family', 'educational'],
      color: 'linear-gradient(135deg, #0369A1, #0EA5E9)'
    },
    {
      id: 'fz-008',
      name: 'Watch Party Fan Screen',
      emoji: '📺',
      description: 'Watch other simultaneous matches on a 200sqm LED mega-screen with thousands of fans.',
      location: 'Fan Zone West Lawn',
      duration: 'Match duration',
      cost: 'Free',
      tags: ['watch', 'social', 'atmosphere'],
      color: 'linear-gradient(135deg, #064E3B, #059669)'
    }
  ],

  /* =========================================================================
   * PLAYERS
   * ========================================================================= */
  players: [
    {
      id: 'mbappe',
      name: 'Kylian Mbappé',
      firstName: 'Kylian',
      country: 'France',
      flag: '🇫🇷',
      position: 'Forward',
      number: 10,
      club: 'Real Madrid',
      age: 27,
      goals: 48,
      caps: 86,
      teamColor: '#003189',
      accentColor: '#FFD700',
      tags: ['Speed Demon', 'Clinical', 'World Class'],
      bio: 'The fastest player on earth and reigning World Cup champion. Mbappé brings lethal finishing and explosive pace to every tournament.',
      gradient: 'linear-gradient(135deg, #003189 0%, #0050C0 50%, #001F5E 100%)'
    },
    {
      id: 'yamal',
      name: 'Lamine Yamal',
      firstName: 'Lamine',
      country: 'Spain',
      flag: '🇪🇸',
      position: 'Forward / Winger',
      number: 11,
      club: 'FC Barcelona',
      age: 18,
      goals: 12,
      caps: 32,
      teamColor: '#AA151B',
      accentColor: '#F1BF00',
      tags: ['Prodigy', 'Dribbler', 'Future GOAT'],
      bio: 'The youngest player to ever score in a major European final. Yamal is the generational talent reshaping football at just 18.',
      gradient: 'linear-gradient(135deg, #AA151B 0%, #CC2233 50%, #770F12 100%)'
    },
    {
      id: 'haaland',
      name: 'Erling Haaland',
      firstName: 'Erling',
      country: 'Norway',
      flag: '🇳🇴',
      position: 'Striker',
      number: 9,
      club: 'Manchester City',
      age: 25,
      goals: 34,
      caps: 42,
      teamColor: '#EF2B2D',
      accentColor: '#FFFFFF',
      tags: ['Machine', 'Goal Machine', 'Unstoppable'],
      bio: 'A perfect scoring machine who broke every Premier League record. Haaland\'s combination of power, pace, and finishing is unmatched.',
      gradient: 'linear-gradient(135deg, #CC2020 0%, #EF2B2D 50%, #991818 100%)'
    },
    {
      id: 'vini',
      name: 'Vinicius Jr',
      firstName: 'Vini',
      country: 'Brazil',
      flag: '🇧🇷',
      position: 'Forward / Winger',
      number: 7,
      club: 'Real Madrid',
      age: 24,
      goals: 24,
      caps: 52,
      teamColor: '#009C3B',
      accentColor: '#FEDF00',
      tags: ['Jogo Bonito', 'Flair', 'Champions'],
      bio: 'Ballon d\'Or 2024 winner. Vini Jr brings Brazilian flair and joy to every match, with magical skills that leave defenders helpless.',
      gradient: 'linear-gradient(135deg, #006B29 0%, #009C3B 50%, #004A1C 100%)'
    },
    {
      id: 'bellingham',
      name: 'Jude Bellingham',
      firstName: 'Jude',
      country: 'England',
      flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
      position: 'Midfielder',
      number: 22,
      club: 'Real Madrid',
      age: 21,
      goals: 18,
      caps: 48,
      teamColor: '#CF081F',
      accentColor: '#FFFFFF',
      tags: ['Complete', 'Leader', 'Versatile'],
      bio: 'The complete modern midfielder. Bellingham scores, creates, defends, and leads — all at just 21 years old. England\'s captain-in-waiting.',
      gradient: 'linear-gradient(135deg, #9B0617 0%, #CF081F 50%, #6D0411 100%)'
    },
    {
      id: 'ronaldo',
      name: 'Cristiano Ronaldo',
      firstName: 'CR7',
      country: 'Portugal',
      flag: '🇵🇹',
      position: 'Forward',
      number: 7,
      club: 'Al Nassr',
      age: 41,
      goals: 135,
      caps: 220,
      teamColor: '#006600',
      accentColor: '#FF0000',
      tags: ['GOAT', 'Legend', 'SIUUU'],
      bio: 'The all-time international goals record holder with 135 goals in 220 caps. CR7\'s dedication, discipline, and desire to win are unparalleled in football history.',
      gradient: 'linear-gradient(135deg, #004400 0%, #006600 50%, #003300 100%)'
    },
    {
      id: 'messi',
      name: 'Lionel Messi',
      firstName: 'Leo',
      country: 'Argentina',
      flag: '🇦🇷',
      position: 'Forward',
      number: 10,
      club: 'Inter Miami',
      age: 38,
      goals: 112,
      caps: 196,
      teamColor: '#74ACDF',
      accentColor: '#FFFFFF',
      tags: ['GOAT', 'World Champion', '8× Ballon d\'Or'],
      bio: '8-time Ballon d\'Or winner and 2022 World Cup champion. Messi completed football\'s greatest journey, lifting the trophy that completed his legendary career.',
      gradient: 'linear-gradient(135deg, #4A7FAF 0%, #74ACDF 50%, #2E5C8A 100%)'
    }
  ],

  /* =========================================================================
   * EMERGENCY CONTACTS
   * ========================================================================= */
  emergency: {
    contacts: [
      { name: 'Stadium Medical', number: '+1-800-WC26-MED', emoji: '🏥', color: '#EF4444', description: 'For any medical emergency inside the venue' },
      { name: 'Stadium Security', number: '+1-800-WC26-SEC', emoji: '🛡️', color: '#F59E0B', description: 'For security incidents, threats, or suspicious activity' },
      { name: 'Control Room', number: '+1-800-WC26-CTR', emoji: '📡', color: '#3B82F6', description: 'General stadium operations and information' },
      { name: 'Police', number: '911 / 112', emoji: '👮', color: '#6D28D9', description: 'Local law enforcement for crimes or major incidents' },
      { name: 'Fire Department', number: '911 / 112', emoji: '🚒', color: '#EF4444', description: 'Fire or smoke — also call Fire via SOS button' },
      { name: 'Child Safety', number: '+1-800-WC26-KID', emoji: '🧒', color: '#EC4899', description: 'Dedicated line for missing child reports' },
      { name: 'Lost & Found', number: '+1-800-WC26-LST', emoji: '🔍', color: '#10B981', description: 'Gate A Information Desk — open all day' },
      { name: 'Accessibility', number: '+1-800-FIFA-ACC', emoji: '♿', color: '#06B6D4', description: 'Accessibility services, wheelchair assistance' }
    ],
    alertTypes: [
      { id: 'fire', label: 'Fire Alert', emoji: '🔥', color: '#EF4444', message: 'FIRE DETECTED. Please proceed calmly to the nearest exit. Follow green emergency lighting. Do not use elevators.' },
      { id: 'medical', label: 'Medical Emergency', emoji: '🏥', color: '#F59E0B', message: 'MEDICAL EMERGENCY in progress. Please remain in your seats and allow medical staff to reach the affected area.' },
      { id: 'evacuation', label: 'Evacuation Order', emoji: '🚨', color: '#DC2626', message: 'EVACUATION ORDER ISSUED. Please proceed immediately to the nearest exit in an orderly fashion. Leave all belongings.' },
      { id: 'security', label: 'Security Incident', emoji: '🛡️', color: '#7C3AED', message: 'SECURITY INCIDENT. Please follow instructions from security personnel. Remain calm and move to designated safe areas.' }
    ]
  },

  /* =========================================================================
   * STADIUM MAP ZONES (for SVG rendering)
   * ========================================================================= */
  mapZones: [
    { id: 'field',   label: 'Playing Field',    color: '#1a4a1a', x: 200, y: 150, w: 440, h: 280 },
    { id: 'north',   label: 'North Stand',       color: '#1a2a3a', x: 200, y: 80,  w: 440, h: 65 },
    { id: 'south',   label: 'South Stand',       color: '#1a2a3a', x: 200, y: 435, w: 440, h: 65 },
    { id: 'east',    label: 'East Stand',         color: '#1a2a3a', x: 645, y: 150, w: 65,  h: 280 },
    { id: 'west',    label: 'West Stand',         color: '#1a2a3a', x: 130, y: 150, w: 65,  h: 280 },
    { id: 'gateA',   label: 'Gate A',             color: '#2a1a3a', x: 340, y: 20,  w: 80,  h: 55 },
    { id: 'gateB',   label: 'Gate B',             color: '#2a1a3a', x: 710, y: 255, w: 55,  h: 70 },
    { id: 'gateC',   label: 'Gate C',             color: '#2a1a3a', x: 420, y: 505, w: 80,  h: 55 },
    { id: 'gateD',   label: 'Gate D',             color: '#2a1a3a', x: 75,  y: 255, w: 55,  h: 70 },
    { id: 'med1',    label: '🏥 First Aid',       color: '#3a0a0a', x: 215, y: 160, w: 45,  h: 30 },
    { id: 'med2',    label: '🏥 First Aid',       color: '#3a0a0a', x: 580, y: 390, w: 45,  h: 30 },
    { id: 'toilet1', label: '🚻 Restroom',        color: '#0a1a2a', x: 310, y: 90,  w: 45,  h: 30 },
    { id: 'toilet2', label: '🚻 Restroom',        color: '#0a1a2a', x: 480, y: 445, w: 45,  h: 30 },
    { id: 'food1',   label: '🍔 Concession',      color: '#2a1a0a', x: 215, y: 390, w: 55,  h: 30 },
    { id: 'food2',   label: '🍔 Concession',      color: '#2a1a0a', x: 570, y: 160, w: 55,  h: 30 },
    { id: 'exit1',   label: '⬆ Emergency Exit',   color: '#1a0a0a', x: 260, y: 20,  w: 60,  h: 30 },
    { id: 'exit2',   label: '⬆ Emergency Exit',   color: '#1a0a0a', x: 520, y: 505, w: 60,  h: 30 }
  ],

  /* =========================================================================
   * SUSTAINABILITY DATA
   * ========================================================================= */
  sustainability: {
    solarPowerPct: 62,
    recyclingRatePct: 78,
    waterSavedLitres: 4200000,
    carbonOffsetTonnes: 12500,
    electricVehiclesOnSite: 340,
    treesPledged: 50000,
    tips: [
      'Use public transit — save up to 2.3kg CO₂ per journey vs. driving.',
      'Bring a reusable water bottle — refill stations are free throughout the venue.',
      'Use the recycling bins (green = recycling, grey = general waste).',
      'Consider a meat-free meal today — the vegetarian options are delicious!',
      'Walk or cycle to the fan zone if you\'re within 3km.',
      'Support eco-certified merchandise at the official store.',
      'Offset your flight with the FIFA WC2026 Green Goal programme.'
    ]
  }
};

// Export for module use
if (typeof module !== 'undefined') module.exports = KB;
