/**
 * @fileoverview Internationalization (i18n) module
 * Supports 10 languages with full UI string translations
 * Language detection from browser, persisted in localStorage
 */

'use strict';

const I18n = (() => {

  const SUPPORTED_LANGUAGES = {
    'en': { name: 'English',    nativeName: 'English',    flag: '🇬🇧', dir: 'ltr', speechLang: 'en-US', voiceName: 'en' },
    'es': { name: 'Spanish',    nativeName: 'Español',    flag: '🇪🇸', dir: 'ltr', speechLang: 'es-ES', voiceName: 'es' },
    'fr': { name: 'French',     nativeName: 'Français',   flag: '🇫🇷', dir: 'ltr', speechLang: 'fr-FR', voiceName: 'fr' },
    'ar': { name: 'Arabic',     nativeName: 'العربية',    flag: '🇸🇦', dir: 'rtl', speechLang: 'ar-SA', voiceName: 'ar' },
    'pt': { name: 'Portuguese', nativeName: 'Português',  flag: '🇧🇷', dir: 'ltr', speechLang: 'pt-BR', voiceName: 'pt' },
    'de': { name: 'German',     nativeName: 'Deutsch',    flag: '🇩🇪', dir: 'ltr', speechLang: 'de-DE', voiceName: 'de' },
    'ja': { name: 'Japanese',   nativeName: '日本語',     flag: '🇯🇵', dir: 'ltr', speechLang: 'ja-JP', voiceName: 'ja' },
    'ko': { name: 'Korean',     nativeName: '한국어',     flag: '🇰🇷', dir: 'ltr', speechLang: 'ko-KR', voiceName: 'ko' },
    'hi': { name: 'Hindi',      nativeName: 'हिन्दी',    flag: '🇮🇳', dir: 'ltr', speechLang: 'hi-IN', voiceName: 'hi' },
    'it': { name: 'Italian',    nativeName: 'Italiano',   flag: '🇮🇹', dir: 'ltr', speechLang: 'it-IT', voiceName: 'it' }
  };

  // Translation strings
  const TRANSLATIONS = {
    en: {
      appTitle: 'SmartStadium 2026',
      appSubtitle: 'FIFA World Cup 2026',
      nav: {
        home: 'Home', assistant: 'AI Assistant', navigate: 'Navigate',
        crowd: 'Crowd', tickets: 'Tickets', emergency: 'Emergency'
      },
      home: {
        heroTitle: 'Welcome to the',
        heroHighlight: 'FIFA World Cup 2026',
        heroSubtitle: 'Your AI-powered companion for the greatest show on Earth',
        nextMatch: 'Next Match',
        liveNow: 'Live Now',
        matchDay: 'Match Day',
        crowdStatus: 'Crowd Status',
        todayVenue: "Today's Venue",
        findMySeat: 'Find My Seat',
        interactiveMap: 'Interactive stadium map',
        myTickets: 'My Tickets',
        digitalWalletText: 'Digital wallet & entry',
        weather: 'Weather',
        gatesOpen: 'Gates Open',
        openNow: 'OPEN NOW'
      },
      chat: {
        title: 'AI Stadium Assistant',
        subtitle: 'Online · Powered by SmartAI',
        placeholder: 'Ask me anything about the stadium...',
        send: 'Send',
        voice: 'Voice Input',
        greeting: "Hello! I'm your FIFA World Cup 2026 Stadium Assistant 🏆 I can help with directions, food, match info, rules, safety, and more. What would you like to know?",
        quickReplies: ['📍 My Seat', '🚻 Restroom', '🍔 Food Options', '📋 Match Rules', '🏥 First Aid', '🚪 Exit Routes', '🚌 Transport', '♿ Accessibility']
      },
      navigate: {
        title: 'Smart Navigation',
        subtitle: 'AI-powered wayfinding across the stadium',
        searchPlaceholder: 'Where do you want to go?',
        findRoute: 'Find Route',
        clearRoute: 'Clear',
        myLocation: 'My Location',
        stepByStep: 'Turn-by-Turn Directions',
        estimated: 'Est. walk time',
        minutes: 'min'
      },
      crowd: {
        title: 'Crowd Management',
        subtitle: 'Live density monitoring and AI congestion predictions',
        live: 'LIVE',
        low: 'Clear', medium: 'Moderate', high: 'Congested',
        prediction: 'AI Prediction',
        altRoute: 'Alternate Route',
        emergencyAlert: 'Emergency Alert',
        predictionsTitle: 'AI Congestion Predictions'
      },
      tickets: {
        title: 'My Tickets & Fan Zone',
        digitalWallet: 'Digital Wallet',
        myTicket: 'My Ticket',
        fanZone: 'Fan Zone',
        schedule: 'Schedule',
        standingsTab: 'Standings',
        scanTicket: 'Tap to Scan Entry',
        walletTab: 'Wallet',
        scheduleTab: 'Schedule',
        fanZoneTab: 'Fan Zone'
      },
      emergency: {
        title: 'Emergency & Safety',
        subtitle: 'Your safety is our highest priority',
        sos: 'SOS', sosLabel: 'TAP FOR EMERGENCY',
        contacts: 'Emergency Contacts',
        lostFound: 'Lost & Found',
        lostChild: 'Report Missing Child',
        safetyAlerts: 'Safety Alerts',
        reportItem: 'Report Lost Item',
        describeItem: 'Describe your lost item...',
        submit: 'Submit Report',
        selectIssue: 'Select issue type...',
        reportFoundItem: 'Report Found Item',
        alertTitle: 'ALERT',
        alertMessage: 'Follow staff instructions immediately.'
      },
      settings: {
        title: 'Settings',
        language: 'Language',
        highContrast: 'High Contrast',
        fontSize: 'Font Size',
        reduceMotion: 'Reduce Motion',
        notifications: 'Push Notifications',
        offline: 'Offline Mode'
      },
      common: {
        loading: 'Loading...', error: 'Something went wrong',
        retry: 'Retry', close: 'Close', confirm: 'Confirm',
        cancel: 'Cancel', save: 'Save', search: 'Search',
        more: 'Learn More', back: 'Back', next: 'Next',
        live: 'LIVE', new: 'NEW', free: 'Free', acknowledge: 'Acknowledge'
      }
    },

    es: {
      appTitle: 'SmartStadium 2026',
      appSubtitle: 'Copa Mundial FIFA 2026',
      nav: {
        home: 'Inicio', assistant: 'Asistente IA', navigate: 'Navegar',
        crowd: 'Multitud', tickets: 'Entradas', emergency: 'Emergencia'
      },
      home: {
        heroTitle: 'Bienvenido a la',
        heroHighlight: 'Copa Mundial FIFA 2026',
        heroSubtitle: 'Tu compañero impulsado por IA para el mayor espectáculo del mundo',
        nextMatch: 'Próximo Partido',
        liveNow: 'En Vivo',
        matchDay: 'Día del Partido',
        crowdStatus: 'Estado de Multitud',
        todayVenue: 'Estadio Hoy'
      },
      chat: {
        title: 'Asistente IA del Estadio',
        subtitle: 'En línea · Impulsado por SmartAI',
        placeholder: 'Pregúntame cualquier cosa sobre el estadio...',
        send: 'Enviar', voice: 'Entrada de voz',
        greeting: '¡Hola! Soy tu Asistente del Estadio de la Copa Mundial FIFA 2026 🏆 Puedo ayudarte con direcciones, comida, información del partido, reglas, seguridad y más. ¿Qué te gustaría saber?',
        quickReplies: ['📍 Mi Asiento', '🚻 Baño', '🍔 Comida', '📋 Reglas', '🏥 Primeros Auxilios', '🚪 Salidas', '🚌 Transporte', '♿ Accesibilidad']
      },
      navigate: {
        title: 'Navegación Inteligente',
        subtitle: 'Orientación por IA en todo el estadio',
        searchPlaceholder: '¿A dónde quieres ir?',
        findRoute: 'Buscar Ruta',
        clearRoute: 'Limpiar',
        myLocation: 'Mi Ubicación',
        stepByStep: 'Instrucciones Paso a Paso',
        estimated: 'Tiempo estimado',
        minutes: 'min'
      },
      crowd: {
        title: 'Gestión de Multitudes',
        subtitle: 'Monitoreo en vivo y predicciones de congestión con IA',
        live: 'EN VIVO', low: 'Despejado', medium: 'Moderado', high: 'Congestionado',
        prediction: 'Predicción IA', altRoute: 'Ruta Alternativa', emergencyAlert: 'Alerta de Emergencia'
      },
      tickets: {
        title: 'Mis Entradas y Zona Fan',
        digitalWallet: 'Billetera Digital', myTicket: 'Mi Entrada',
        fanZone: 'Zona Fan', schedule: 'Calendario', standingsTab: 'Clasificación', scanTicket: 'Toca para Escanear'
      },
      emergency: {
        title: 'Emergencia y Seguridad',
        subtitle: 'Tu seguridad es nuestra máxima prioridad',
        sos: 'SOS', sosLabel: 'TOCA EN EMERGENCIA',
        contacts: 'Contactos de Emergencia', lostFound: 'Objetos Perdidos',
        lostChild: 'Reportar Niño Perdido', safetyAlerts: 'Alertas de Seguridad',
        reportItem: 'Reportar Objeto Perdido', describeItem: 'Describe tu objeto perdido...',
        submit: 'Enviar Reporte'
      },
      settings: {
        title: 'Configuración', language: 'Idioma', highContrast: 'Alto Contraste',
        fontSize: 'Tamaño de Fuente', reduceMotion: 'Reducir Movimiento',
        notifications: 'Notificaciones Push', offline: 'Modo Sin Conexión'
      },
      common: {
        loading: 'Cargando...', error: 'Algo salió mal', retry: 'Reintentar',
        close: 'Cerrar', confirm: 'Confirmar', cancel: 'Cancelar',
        save: 'Guardar', search: 'Buscar', more: 'Más información',
        back: 'Atrás', next: 'Siguiente', live: 'EN VIVO', new: 'NUEVO', free: 'Gratis'
      }
    },

    fr: {
      appTitle: 'SmartStadium 2026',
      appSubtitle: 'Coupe du Monde FIFA 2026',
      nav: {
        home: 'Accueil', assistant: 'Assistant IA', navigate: 'Naviguer',
        crowd: 'Foule', tickets: 'Billets', emergency: 'Urgence'
      },
      home: {
        heroTitle: 'Bienvenue à la',
        heroHighlight: 'Coupe du Monde FIFA 2026',
        heroSubtitle: 'Votre compagnon IA pour le plus grand spectacle du monde',
        nextMatch: 'Prochain Match', liveNow: 'En Direct',
        matchDay: 'Jour de Match', crowdStatus: 'Statut de la Foule', todayVenue: "Stade d'Aujourd'hui"
      },
      chat: {
        title: "Assistant IA du Stade",
        subtitle: 'En ligne · Alimenté par SmartAI',
        placeholder: 'Posez-moi une question sur le stade...',
        send: 'Envoyer', voice: 'Entrée vocale',
        greeting: "Bonjour ! Je suis votre Assistant de Stade de la Coupe du Monde FIFA 2026 🏆 Je peux vous aider avec les directions, la nourriture, les infos du match, les règles, la sécurité et plus encore. Que souhaitez-vous savoir ?",
        quickReplies: ['📍 Mon Siège', '🚻 Toilettes', '🍔 Nourriture', '📋 Règles', '🏥 Premiers Secours', '🚪 Sorties', '🚌 Transport', '♿ Accessibilité']
      },
      navigate: { title: 'Navigation Intelligente', subtitle: 'Orientation IA dans le stade',
        searchPlaceholder: 'Où voulez-vous aller ?', findRoute: 'Trouver un Itinéraire', clearRoute: 'Effacer',
        myLocation: 'Ma Position', stepByStep: 'Instructions Pas à Pas', estimated: 'Temps de marche estimé', minutes: 'min'
      },
      crowd: { title: 'Gestion des Foules', subtitle: 'Surveillance en direct et prédictions IA',
        live: 'EN DIRECT', low: 'Fluide', medium: 'Modéré', high: 'Congestionné',
        prediction: 'Prédiction IA', altRoute: 'Itinéraire Alternatif', emergencyAlert: "Alerte d'Urgence"
      },
      tickets: { title: 'Mes Billets et Zone Fan', digitalWallet: 'Portefeuille Numérique',
        myTicket: 'Mon Billet', fanZone: 'Zone Fan', schedule: 'Calendrier', standingsTab: 'Classement', scanTicket: 'Appuyer pour Scanner'
      },
      emergency: { title: 'Urgence et Sécurité', subtitle: 'Votre sécurité est notre priorité absolue',
        sos: 'SOS', sosLabel: "APPUYER EN CAS D'URGENCE",
        contacts: "Contacts d'Urgence", lostFound: 'Objets Perdus', lostChild: 'Signaler un Enfant Perdu',
        safetyAlerts: 'Alertes de Sécurité', reportItem: 'Signaler un Objet Perdu',
        describeItem: 'Décrivez votre objet perdu...', submit: 'Soumettre le Rapport'
      },
      settings: { title: 'Paramètres', language: 'Langue', highContrast: 'Contraste Élevé',
        fontSize: 'Taille de Police', reduceMotion: 'Réduire les Animations',
        notifications: 'Notifications Push', offline: 'Mode Hors Ligne'
      },
      common: { loading: 'Chargement...', error: 'Quelque chose a mal tourné', retry: 'Réessayer',
        close: 'Fermer', confirm: 'Confirmer', cancel: 'Annuler', save: 'Enregistrer',
        search: 'Rechercher', more: 'En savoir plus', back: 'Retour', next: 'Suivant',
        live: 'EN DIRECT', new: 'NOUVEAU', free: 'Gratuit'
      }
    },

    ar: {
      appTitle: 'SmartStadium 2026',
      appSubtitle: 'كأس العالم FIFA 2026',
      nav: { home: 'الرئيسية', assistant: 'المساعد الذكي', navigate: 'التنقل', crowd: 'الحشود', tickets: 'التذاكر', emergency: 'الطوارئ' },
      home: { heroTitle: 'مرحباً بك في', heroHighlight: 'كأس العالم FIFA 2026', heroSubtitle: 'رفيقك الذكي في أعظم عرض على وجه الأرض',
        nextMatch: 'المباراة القادمة', liveNow: 'مباشر الآن', matchDay: 'يوم المباراة', crowdStatus: 'حالة الحشود', todayVenue: 'ملعب اليوم'
      },
      chat: { title: 'مساعد الملعب الذكي', subtitle: 'متصل · مدعوم بالذكاء الاصطناعي',
        placeholder: 'اسألني أي شيء عن الملعب...', send: 'إرسال', voice: 'إدخال صوتي',
        greeting: 'مرحباً! أنا مساعد ملعب كأس العالم FIFA 2026 🏆 يمكنني مساعدتك في الاتجاهات والطعام ومعلومات المباراة والقواعد والسلامة والمزيد. ماذا تريد أن تعرف؟',
        quickReplies: ['📍 مقعدي', '🚻 دورة المياه', '🍔 الطعام', '📋 القواعد', '🏥 الإسعاف', '🚪 المخارج', '🚌 المواصلات', '♿ إمكانية الوصول']
      },
      navigate: { title: 'التنقل الذكي', subtitle: 'توجيه بالذكاء الاصطناعي عبر الملعب',
        searchPlaceholder: 'إلى أين تريد الذهاب؟', findRoute: 'ابحث عن المسار', clearRoute: 'مسح',
        myLocation: 'موقعي', stepByStep: 'تعليمات خطوة بخطوة', estimated: 'وقت السير المقدر', minutes: 'دقيقة'
      },
      crowd: { title: 'إدارة الحشود', subtitle: 'مراقبة مباشرة وتنبؤات الذكاء الاصطناعي',
        live: 'مباشر', low: 'واضح', medium: 'متوسط', high: 'مزدحم',
        prediction: 'تنبؤ الذكاء الاصطناعي', altRoute: 'مسار بديل', emergencyAlert: 'تنبيه طارئ'
      },
      tickets: { title: 'تذاكري ومنطقة المشجعين', digitalWallet: 'المحفظة الرقمية', myTicket: 'تذكرتي',
        fanZone: 'منطقة المشجعين', schedule: 'الجدول', standingsTab: 'الترتيب', scanTicket: 'اضغط للمسح'
      },
      emergency: { title: 'الطوارئ والسلامة', subtitle: 'سلامتك هي أولويتنا القصوى',
        sos: 'SOS', sosLabel: 'اضغط في حالة الطوارئ',
        contacts: 'جهات الاتصال الطارئة', lostFound: 'المفقودات والموجودات',
        lostChild: 'الإبلاغ عن طفل مفقود', safetyAlerts: 'تنبيهات الأمان',
        reportItem: 'الإبلاغ عن غرض مفقود', describeItem: 'صف غرضك المفقود...', submit: 'إرسال التقرير'
      },
      settings: { title: 'الإعدادات', language: 'اللغة', highContrast: 'تباين عالٍ',
        fontSize: 'حجم الخط', reduceMotion: 'تقليل الحركة', notifications: 'الإشعارات', offline: 'وضع عدم الاتصال'
      },
      common: { loading: 'جارٍ التحميل...', error: 'حدث خطأ ما', retry: 'إعادة المحاولة',
        close: 'إغلاق', confirm: 'تأكيد', cancel: 'إلغاء', save: 'حفظ', search: 'بحث',
        more: 'اعرف المزيد', back: 'رجوع', next: 'التالي', live: 'مباشر', new: 'جديد', free: 'مجاني'
      }
    },

    pt: {
      appTitle: 'SmartStadium 2026',
      appSubtitle: 'Copa do Mundo FIFA 2026',
      nav: { home: 'Início', assistant: 'Assistente IA', navigate: 'Navegar', crowd: 'Multidão', tickets: 'Ingressos', emergency: 'Emergência' },
      chat: { title: 'Assistente IA do Estádio', subtitle: 'Online · Powered by SmartAI', placeholder: 'Pergunte qualquer coisa sobre o estádio...',
        send: 'Enviar', voice: 'Entrada de voz',
        greeting: 'Olá! Sou seu Assistente do Estádio da Copa do Mundo FIFA 2026 🏆 Posso ajudá-lo com direções, comida, informações da partida, regras, segurança e muito mais. O que gostaria de saber?',
        quickReplies: ['📍 Meu Assento', '🚻 Banheiro', '🍔 Comida', '📋 Regras', '🏥 Primeiros Socorros', '🚪 Saídas', '🚌 Transporte', '♿ Acessibilidade']
      },
      navigate: { title: 'Navegação Inteligente', subtitle: 'Orientação por IA no estádio',
        searchPlaceholder: 'Para onde você quer ir?', findRoute: 'Encontrar Rota', clearRoute: 'Limpar',
        myLocation: 'Minha Localização', stepByStep: 'Instruções Passo a Passo', estimated: 'Tempo de caminhada', minutes: 'min'
      },
      crowd: { title: 'Gerenciamento de Multidões', subtitle: 'Monitoramento ao vivo e previsões de IA',
        live: 'AO VIVO', low: 'Livre', medium: 'Moderado', high: 'Congestionado',
        prediction: 'Previsão IA', altRoute: 'Rota Alternativa', emergencyAlert: 'Alerta de Emergência'
      },
      tickets: { title: 'Meus Ingressos e Zona Fan', digitalWallet: 'Carteira Digital', myTicket: 'Meu Ingresso',
        fanZone: 'Zona Fan', schedule: 'Calendário', standingsTab: 'Classificação', scanTicket: 'Toque para Escanear'
      },
      emergency: { title: 'Emergência e Segurança', subtitle: 'Sua segurança é nossa prioridade máxima',
        sos: 'SOS', sosLabel: 'TOQUE EM EMERGÊNCIA', contacts: 'Contatos de Emergência',
        lostFound: 'Achados e Perdidos', lostChild: 'Reportar Criança Perdida', safetyAlerts: 'Alertas de Segurança',
        reportItem: 'Reportar Item Perdido', describeItem: 'Descreva seu item perdido...', submit: 'Enviar Relatório'
      },
      settings: { title: 'Configurações', language: 'Idioma', highContrast: 'Alto Contraste',
        fontSize: 'Tamanho da Fonte', reduceMotion: 'Reduzir Animações', notifications: 'Notificações Push', offline: 'Modo Offline'
      },
      common: { loading: 'Carregando...', error: 'Algo deu errado', retry: 'Tentar novamente',
        close: 'Fechar', confirm: 'Confirmar', cancel: 'Cancelar', save: 'Salvar',
        search: 'Pesquisar', more: 'Saiba mais', back: 'Voltar', next: 'Próximo',
        live: 'AO VIVO', new: 'NOVO', free: 'Grátis'
      }
    },

    de: {
      appTitle: 'SmartStadium 2026',
      appSubtitle: 'FIFA Weltmeisterschaft 2026',
      nav: { home: 'Start', assistant: 'KI-Assistent', navigate: 'Navigation', crowd: 'Menschenmenge', tickets: 'Tickets', emergency: 'Notfall' },
      chat: { title: 'KI-Stadionassistent', subtitle: 'Online · Powered by SmartAI',
        placeholder: 'Frag mich alles über das Stadion...',
        send: 'Senden', voice: 'Spracheingabe',
        greeting: 'Hallo! Ich bin Ihr FIFA-WM-2026-Stadionassistent 🏆 Ich kann Ihnen mit Wegbeschreibungen, Essen, Spielinfos, Regeln, Sicherheit und mehr helfen. Was möchten Sie wissen?',
        quickReplies: ['📍 Mein Platz', '🚻 Toilette', '🍔 Essen', '📋 Regeln', '🏥 Erste Hilfe', '🚪 Ausgänge', '🚌 Transport', '♿ Barrierefreiheit']
      },
      navigate: { title: 'Intelligente Navigation', subtitle: 'KI-gestützte Wegführung im Stadion',
        searchPlaceholder: 'Wohin möchten Sie gehen?', findRoute: 'Route finden', clearRoute: 'Löschen',
        myLocation: 'Mein Standort', stepByStep: 'Schritt-für-Schritt-Anleitung', estimated: 'Gesch. Gehzeit', minutes: 'Min'
      },
      crowd: { title: 'Crowd-Management', subtitle: 'Live-Überwachung und KI-Stauvorhersagen',
        live: 'LIVE', low: 'Frei', medium: 'Mäßig', high: 'Stau',
        prediction: 'KI-Vorhersage', altRoute: 'Alternativroute', emergencyAlert: 'Notfallalarm'
      },
      tickets: { title: 'Meine Tickets & Fan Zone', digitalWallet: 'Digitale Geldbörse', myTicket: 'Mein Ticket',
        fanZone: 'Fan Zone', schedule: 'Spielplan', standingsTab: 'Tabelle', scanTicket: 'Zum Scannen tippen'
      },
      emergency: { title: 'Notfall & Sicherheit', subtitle: 'Ihre Sicherheit hat höchste Priorität',
        sos: 'SOS', sosLabel: 'IM NOTFALL DRÜCKEN', contacts: 'Notfallkontakte',
        lostFound: 'Fundbüro', lostChild: 'Vermisstes Kind melden', safetyAlerts: 'Sicherheitsmeldungen',
        reportItem: 'Verlorenen Gegenstand melden', describeItem: 'Beschreiben Sie Ihren verlorenen Gegenstand...', submit: 'Bericht senden'
      },
      settings: { title: 'Einstellungen', language: 'Sprache', highContrast: 'Hoher Kontrast',
        fontSize: 'Schriftgröße', reduceMotion: 'Bewegung reduzieren', notifications: 'Push-Benachrichtigungen', offline: 'Offline-Modus'
      },
      common: { loading: 'Laden...', error: 'Etwas ist schiefgelaufen', retry: 'Erneut versuchen',
        close: 'Schließen', confirm: 'Bestätigen', cancel: 'Abbrechen', save: 'Speichern',
        search: 'Suchen', more: 'Mehr erfahren', back: 'Zurück', next: 'Weiter',
        live: 'LIVE', new: 'NEU', free: 'Kostenlos'
      }
    },

    ja: {
      appTitle: 'SmartStadium 2026',
      appSubtitle: 'FIFA ワールドカップ 2026',
      nav: { home: 'ホーム', assistant: 'AIアシスタント', navigate: 'ナビ', crowd: '混雑', tickets: 'チケット', emergency: '緊急' },
      chat: { title: 'スタジアムAIアシスタント', subtitle: 'オンライン · SmartAI搭載',
        placeholder: 'スタジアムについて何でも聞いてください...',
        send: '送信', voice: '音声入力',
        greeting: 'こんにちは！FIFA ワールドカップ 2026 スタジアムアシスタントです 🏆 道案内、食事、試合情報、ルール、安全など、何でもお手伝いします。何が知りたいですか？',
        quickReplies: ['📍 私の席', '🚻 トイレ', '🍔 食事', '📋 ルール', '🏥 救急', '🚪 出口', '🚌 交通', '♿ アクセシビリティ']
      },
      navigate: { title: 'スマートナビゲーション', subtitle: 'AIによるスタジアム案内', searchPlaceholder: 'どこへ行きますか？',
        findRoute: 'ルートを検索', clearRoute: 'クリア', myLocation: '現在地', stepByStep: 'ルート案内', estimated: '徒歩時間', minutes: '分'
      },
      crowd: { title: '混雑管理', subtitle: 'リアルタイム監視とAI予測', live: 'ライブ',
        low: '空き', medium: '普通', high: '混雑', prediction: 'AI予測', altRoute: '迂回ルート', emergencyAlert: '緊急アラート'
      },
      tickets: { title: 'チケット・ファンゾーン', digitalWallet: 'デジタルウォレット', myTicket: 'マイチケット',
        fanZone: 'ファンゾーン', schedule: 'スケジュール', standingsTab: '順位表', scanTicket: 'タップしてスキャン'
      },
      emergency: { title: '緊急・安全', subtitle: 'あなたの安全が最優先です',
        sos: 'SOS', sosLabel: '緊急の場合はタップ', contacts: '緊急連絡先',
        lostFound: '落し物', lostChild: '迷子を報告', safetyAlerts: '安全アラート',
        reportItem: '落し物を報告', describeItem: '落し物を説明してください...', submit: '報告を送信'
      },
      settings: { title: '設定', language: '言語', highContrast: 'ハイコントラスト',
        fontSize: 'フォントサイズ', reduceMotion: 'アニメーション削減', notifications: 'プッシュ通知', offline: 'オフラインモード'
      },
      common: { loading: '読み込み中...', error: 'エラーが発生しました', retry: '再試行',
        close: '閉じる', confirm: '確認', cancel: 'キャンセル', save: '保存',
        search: '検索', more: '詳細', back: '戻る', next: '次へ', live: 'ライブ', new: '新着', free: '無料'
      }
    },

    ko: {
      appTitle: 'SmartStadium 2026',
      appSubtitle: 'FIFA 월드컵 2026',
      nav: { home: '홈', assistant: 'AI 어시스턴트', navigate: '길찾기', crowd: '군중', tickets: '티켓', emergency: '긴급' },
      chat: { title: '경기장 AI 어시스턴트', subtitle: '온라인 · SmartAI 지원', placeholder: '경기장에 대해 무엇이든 물어보세요...',
        send: '전송', voice: '음성 입력',
        greeting: '안녕하세요! FIFA 월드컵 2026 경기장 어시스턴트입니다 🏆 길 안내, 음식, 경기 정보, 규칙, 안전 등 무엇이든 도와드립니다. 무엇이 궁금하신가요?',
        quickReplies: ['📍 내 좌석', '🚻 화장실', '🍔 음식', '📋 규칙', '🏥 응급처치', '🚪 출구', '🚌 교통', '♿ 접근성']
      },
      navigate: { title: '스마트 내비게이션', subtitle: 'AI 기반 경기장 길찾기', searchPlaceholder: '어디로 가시겠어요?',
        findRoute: '경로 찾기', clearRoute: '지우기', myLocation: '내 위치', stepByStep: '단계별 안내', estimated: '예상 도보 시간', minutes: '분'
      },
      crowd: { title: '군중 관리', subtitle: '실시간 모니터링 및 AI 예측', live: '라이브',
        low: '한산', medium: '보통', high: '혼잡', prediction: 'AI 예측', altRoute: '대체 경로', emergencyAlert: '긴급 경보'
      },
      tickets: { title: '내 티켓 & 팬존', digitalWallet: '디지털 지갑', myTicket: '내 티켓',
        fanZone: '팬존', schedule: '일정', standingsTab: '순위', scanTicket: '탭하여 스캔'
      },
      emergency: { title: '긴급 및 안전', subtitle: '귀하의 안전이 최우선입니다',
        sos: 'SOS', sosLabel: '긴급 시 탭', contacts: '긴급 연락처',
        lostFound: '분실물', lostChild: '미아 신고', safetyAlerts: '안전 경보',
        reportItem: '분실물 신고', describeItem: '분실물을 설명해 주세요...', submit: '신고 제출'
      },
      settings: { title: '설정', language: '언어', highContrast: '고대비',
        fontSize: '글꼴 크기', reduceMotion: '동작 줄이기', notifications: '푸시 알림', offline: '오프라인 모드'
      },
      common: { loading: '로딩 중...', error: '오류가 발생했습니다', retry: '재시도',
        close: '닫기', confirm: '확인', cancel: '취소', save: '저장',
        search: '검색', more: '더 보기', back: '뒤로', next: '다음', live: '라이브', new: '새로운', free: '무료'
      }
    },

    hi: {
      appTitle: 'SmartStadium 2026',
      appSubtitle: 'FIFA विश्व कप 2026',
      nav: { home: 'होम', assistant: 'AI सहायक', navigate: 'नेविगेट', crowd: 'भीड़', tickets: 'टिकट', emergency: 'आपातकाल' },
      chat: { title: 'स्टेडियम AI सहायक', subtitle: 'ऑनलाइन · SmartAI द्वारा संचालित',
        placeholder: 'स्टेडियम के बारे में कुछ भी पूछें...',
        send: 'भेजें', voice: 'वॉइस इनपुट',
        greeting: 'नमस्ते! मैं आपका FIFA विश्व कप 2026 स्टेडियम सहायक हूं 🏆 मैं दिशा-निर्देश, भोजन, मैच की जानकारी, नियम, सुरक्षा और अधिक में मदद कर सकता हूं। आप क्या जानना चाहते हैं?',
        quickReplies: ['📍 मेरी सीट', '🚻 शौचालय', '🍔 खाना', '📋 नियम', '🏥 प्राथमिक चिकित्सा', '🚪 निकास', '🚌 परिवहन', '♿ पहुंच']
      },
      navigate: { title: 'स्मार्ट नेविगेशन', subtitle: 'AI-संचालित स्टेडियम मार्गदर्शन',
        searchPlaceholder: 'आप कहाँ जाना चाहते हैं?', findRoute: 'मार्ग खोजें', clearRoute: 'साफ़ करें',
        myLocation: 'मेरी लोकेशन', stepByStep: 'चरण-दर-चरण दिशा-निर्देश', estimated: 'अनुमानित पैदल समय', minutes: 'मिनट'
      },
      crowd: { title: 'भीड़ प्रबंधन', subtitle: 'लाइव निगरानी और AI भविष्यवाणियां', live: 'लाइव',
        low: 'स्पष्ट', medium: 'मध्यम', high: 'भीड़भाड़', prediction: 'AI भविष्यवाणी', altRoute: 'वैकल्पिक मार्ग', emergencyAlert: 'आपातकालीन अलर्ट'
      },
      tickets: { title: 'मेरे टिकट और फैन जोन', digitalWallet: 'डिजिटल वॉलेट', myTicket: 'मेरा टिकट',
        fanZone: 'फैन जोन', schedule: 'शेड्यूल', standingsTab: 'स्टैंडिंग', scanTicket: 'स्कैन करने के लिए टैप करें'
      },
      emergency: { title: 'आपातकाल और सुरक्षा', subtitle: 'आपकी सुरक्षा हमारी सर्वोच्च प्राथमिकता है',
        sos: 'SOS', sosLabel: 'आपात स्थिति में दबाएं', contacts: 'आपातकालीन संपर्क',
        lostFound: 'खोया-पाया', lostChild: 'गुमशुदा बच्चे की रिपोर्ट', safetyAlerts: 'सुरक्षा अलर्ट',
        reportItem: 'खोई वस्तु की रिपोर्ट', describeItem: 'अपनी खोई वस्तु का वर्णन करें...', submit: 'रिपोर्ट सबमिट करें'
      },
      settings: { title: 'सेटिंग्स', language: 'भाषा', highContrast: 'उच्च कंट्रास्ट',
        fontSize: 'फ़ॉन्ट आकार', reduceMotion: 'मोशन कम करें', notifications: 'पुश नोटिफिकेशन', offline: 'ऑफ़लाइन मोड'
      },
      common: { loading: 'लोड हो रहा है...', error: 'कुछ गलत हो गया', retry: 'पुनः प्रयास करें',
        close: 'बंद करें', confirm: 'पुष्टि करें', cancel: 'रद्द करें', save: 'सहेजें',
        search: 'खोजें', more: 'अधिक जानें', back: 'वापस', next: 'अगला', live: 'लाइव', new: 'नया', free: 'मुफ्त'
      }
    },

    it: {
      appTitle: 'SmartStadium 2026',
      appSubtitle: 'Coppa del Mondo FIFA 2026',
      nav: { home: 'Home', assistant: 'Assistente IA', navigate: 'Naviga', crowd: 'Folla', tickets: 'Biglietti', emergency: 'Emergenza' },
      chat: { title: 'Assistente IA dello Stadio', subtitle: 'Online · Powered by SmartAI',
        placeholder: 'Chiedimi qualsiasi cosa sullo stadio...',
        send: 'Invia', voice: 'Input vocale',
        greeting: 'Ciao! Sono il tuo Assistente dello Stadio della Coppa del Mondo FIFA 2026 🏆 Posso aiutarti con indicazioni, cibo, info sulla partita, regole, sicurezza e altro. Cosa vorresti sapere?',
        quickReplies: ['📍 Il mio posto', '🚻 Bagno', '🍔 Cibo', '📋 Regole', '🏥 Pronto Soccorso', '🚪 Uscite', '🚌 Trasporti', '♿ Accessibilità']
      },
      navigate: { title: 'Navigazione Intelligente', subtitle: 'Orientamento IA in tutto lo stadio',
        searchPlaceholder: 'Dove vuoi andare?', findRoute: 'Trova Percorso', clearRoute: 'Cancella',
        myLocation: 'La mia posizione', stepByStep: 'Istruzioni passo dopo passo', estimated: 'Tempo a piedi stimato', minutes: 'min'
      },
      crowd: { title: 'Gestione della Folla', subtitle: 'Monitoraggio live e previsioni IA', live: 'LIVE',
        low: 'Libero', medium: 'Moderato', high: 'Congestionato',
        prediction: 'Previsione IA', altRoute: 'Percorso Alternativo', emergencyAlert: 'Allarme Emergenza'
      },
      tickets: { title: 'I miei Biglietti e Fan Zone', digitalWallet: 'Portafoglio Digitale', myTicket: 'Il mio Biglietto',
        fanZone: 'Fan Zone', schedule: 'Calendario', standingsTab: 'Classifica', scanTicket: 'Tocca per Scansionare'
      },
      emergency: { title: 'Emergenza e Sicurezza', subtitle: 'La tua sicurezza è la nostra massima priorità',
        sos: 'SOS', sosLabel: "TOCCA IN CASO D'EMERGENZA", contacts: "Contatti d'Emergenza",
        lostFound: 'Oggetti Smarriti', lostChild: 'Segnala Bambino Disperso', safetyAlerts: 'Avvisi di Sicurezza',
        reportItem: 'Segnala Oggetto Smarrito', describeItem: 'Descrivi il tuo oggetto smarrito...', submit: 'Invia Segnalazione'
      },
      settings: { title: 'Impostazioni', language: 'Lingua', highContrast: 'Alto Contrasto',
        fontSize: 'Dimensione Testo', reduceMotion: 'Riduci Animazioni', notifications: 'Notifiche Push', offline: 'Modalità Offline'
      },
      common: { loading: 'Caricamento...', error: "Qualcosa è andato storto", retry: 'Riprova',
        close: 'Chiudi', confirm: 'Conferma', cancel: 'Annulla', save: 'Salva',
        search: 'Cerca', more: 'Scopri di più', back: 'Indietro', next: 'Avanti', live: 'LIVE', new: 'NUOVO', free: 'Gratis'
      }
    }
  };

  let currentLang = 'en';

  /**
   * Initialize language from stored preference or browser setting
   */
  function init() {
    const stored = Utils.getStorage('ss_language', null);
    if (stored && SUPPORTED_LANGUAGES[stored]) {
      currentLang = stored;
    } else {
      const browser = navigator.language?.split('-')[0];
      currentLang = (browser && SUPPORTED_LANGUAGES[browser]) ? browser : 'en';
    }
    applyLanguage(currentLang);
  }

  /**
   * Get translation for a key path (e.g. 'chat.title')
   * @param {string} keyPath - Dot-separated key path
   * @param {string} [lang] - Override language
   * @returns {string}
   */
  function t(keyPath, lang) {
    const l = lang || currentLang;
    const dict = TRANSLATIONS[l] || TRANSLATIONS['en'];
    const keys = keyPath.split('.');
    let val = dict;
    for (const k of keys) {
      val = val?.[k];
      if (val === undefined) break;
    }
    if (val === undefined || typeof val !== 'string') {
      // Fallback to English
      let fallback = TRANSLATIONS['en'];
      for (const k of keys) fallback = fallback?.[k];
      return fallback || keyPath;
    }
    return val;
  }

  /**
   * Change active language
   * @param {string} code - Language code
   */
  function setLanguage(code) {
    if (!SUPPORTED_LANGUAGES[code]) return;
    currentLang = code;
    Utils.setStorage('ss_language', code);
    applyLanguage(code);
    document.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang: code } }));
    Utils.announce(`Language changed to ${SUPPORTED_LANGUAGES[code].name}`);
  }

  /**
   * Apply language settings to the document
   * @param {string} code
   */
  function applyLanguage(code) {
    const langConfig = SUPPORTED_LANGUAGES[code];
    if (!langConfig) return;
    document.documentElement.lang = langConfig.speechLang;
    document.documentElement.dir  = langConfig.dir;
  }

  /**
   * Get all supported language configs
   * @returns {Object}
   */
  function getLanguages() {
    return SUPPORTED_LANGUAGES;
  }

  /**
   * Get current language code
   * @returns {string}
   */
  function getLang() { return currentLang; }

  /**
   * Get speech language code for current language
   * @returns {string}
   */
  function getSpeechLang() {
    return SUPPORTED_LANGUAGES[currentLang]?.speechLang || 'en-US';
  }

  return { init, t, setLanguage, getLang, getSpeechLang, getLanguages, SUPPORTED_LANGUAGES };
})();

if (typeof module !== 'undefined' && module.exports) module.exports = I18n;

