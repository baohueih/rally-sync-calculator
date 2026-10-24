/**
 * Kingshot Rally Leader Guide - Multi-Language Controller & Live Clock
 * Supports: zh-Hant, zh-Hans, en, ja, ko, ru, es, de, fr, vi
 */

(function () {
  'use strict';

  const STORAGE_KEY_LANG = 'ks_guide_lang';
  const DEFAULT_LANG = 'zh-Hant';

  const TRANSLATIONS = {
    'zh-Hant': {
      pageTitle: 'Kingshot 集結隊長作戰指南 | Rally Leader Guide',
      headerTag: 'Kingshot 作戰指南',
      headerTitle: '集結隊長操作與數據確認',
      headerSubtitle: '快速確認集結發起步驟、行軍時間、實力數值與遊戲即時時間',
      utcClockTitle: '遊戲伺服器時間 (UTC)',
      btnToTimer: '⏱️ 前往壓秒計時器',
      langLabel: '語言 / Language',

      step1Badge: '步驟 1',
      step1Title: '開啟集結介面',
      step1Desc: '點擊目標據點，按下「集結」並設定集結等待時間（標準為 5 分鐘，以作戰指示為準）。',
      step1Hint: '⚠️ 請提前 15～30 秒打開此介面，分秒不差準時按下發起！',
      step1ImgAlt: '開啟集結操作介面截圖',
      clickToZoom: '🔍 點擊圖片放大檢視',

      step2Badge: '步驟 2',
      step2Title: '出征隊伍關鍵資訊確認',
      step2Desc: '進入隊伍配置畫面時，請務必確認並回報以下 3 大核心作戰數據：',
      step2ImgAlt: '出征隊伍配置畫面與核心資訊標示',

      item1Badge: '1. 行軍時間',
      item1Title: '行軍時間 (March Time)',
      item1Desc: '前往目標據點的單程行軍所需時間（分 : 秒）。',
      item1Note: '⚠️ 回報給指揮官的時間必須是<strong>不開行軍加速</strong>的原始時間。出征後<strong>嚴禁誤按加速</strong>，確保全體同時撞擊！',

      item2Badge: '2. 實力數值',
      item2Title: '實力數值 (Power Value)',
      item2Desc: '當前出征隊伍的集結戰鬥力（例如：120M、95M、80M 等）。',
      item2Note: '💡 提供給作戰指揮官，用於排序主力集結、副集結與進攻撞擊順序。',

      item3Badge: '3. 即時時鐘',
      item3Title: '即時時鐘 (Live Clock)',
      item3Desc: '遊戲右上角顯示的伺服器 UTC 即時時間。',
      item3Note: '⏰ 所有壓秒集結指令皆嚴格以該時鐘為基準。請確保自身秒數同步，到秒準時按下！',

      checklistTitle: '📋 集結隊長必備 4 大黃金守則',
      rule1: '1. 回報「原始不加速」行軍時間給作戰指揮官',
      rule2: '2. 回報該隊伍「實力數值 (Power)」',
      rule3: '3. 提前 15~30 秒進入集結介面，對齊 UTC 時間分秒不差準時按下',
      rule4: '4. 行軍途中絕不可使用加速，以免破壞全盟同步撞擊效果',

      footerText: 'Kingshot 集結隊長作戰指南 · 供聯盟集結隊伍快速查閱',
      copyright: '© [#1914][ACE]Bao咔咔 · Kingshot Rally Sync Timer'
    },

    'zh-Hans': {
      pageTitle: 'Kingshot 集结队长作战指南 | Rally Leader Guide',
      headerTag: 'Kingshot 作战指南',
      headerTitle: '集结队长操作与数据确认',
      headerSubtitle: '快速确认集结发起步骤、行军时间、实力数值与游戏即时时间',
      utcClockTitle: '游戏服务器时间 (UTC)',
      btnToTimer: '⏱️ 前往压秒计时器',
      langLabel: '语言 / Language',

      step1Badge: '步骤 1',
      step1Title: '开启集结界面',
      step1Desc: '点击目标据点，按下「集结」并设定集结等待时间（标准为 5 分钟，以作战指示为准）。',
      step1Hint: '⚠️ 请提前 15～30 秒打开此界面，分秒不差准时按下发起！',
      step1ImgAlt: '开启集结操作界面截图',
      clickToZoom: '🔍 点击图片放大查看',

      step2Badge: '步骤 2',
      step2Title: '出征队伍关键信息确认',
      step2Desc: '进入队伍配置画面时，请务必确认并汇报以下 3 大核心作战数据：',
      step2ImgAlt: '出征队伍配置画面与核心信息标示',

      item1Badge: '1. 行军时间',
      item1Title: '行军时间 (March Time)',
      item1Desc: '前往目标据点的单程行军所需时间（分 : 秒）。',
      item1Note: '⚠️ 汇报给指挥官的时间必须是<strong>不使用行军加速</strong>的原始时间。出征后<strong>切勿误按加速</strong>，确保全体同时撞击！',

      item2Badge: '2. 实力数值',
      item2Title: '实力数值 (Power Value)',
      item2Desc: '当前出征队伍的集结战斗力（例如：120M、95M、80M 等）。',
      item2Note: '💡 提供给作战指挥官，用于排序主力集结、副集结与进攻撞击顺序。',

      item3Badge: '3. 即时时钟',
      item3Title: '即时时钟 (Live Clock)',
      item3Desc: '游戏右上角显示的服务器 UTC 即时时间。',
      item3Note: '⏰ 所有压秒集结指令皆严格以此挂钟为基准。请确保自身秒数同步，到秒准时按下！',

      checklistTitle: '📋 集结队长必备 4 大黄金法则',
      rule1: '1. 汇报「原始不加速」行军时间给作战指挥官',
      rule2: '2. 汇报该队伍「实力数值 (Power)」',
      rule3: '3. 提前 15~30 秒进入集结界面，对齐 UTC 时间分秒不差准时按下',
      rule4: '4. 行军途中绝不可使用加速，以免破坏全盟同步撞击效果',

      footerText: 'Kingshot 集结队长作战指南 · 供联盟集结队伍快速查阅',
      copyright: '© [#1914][ACE]Bao咔咔 · Kingshot Rally Sync Timer'
    },

    'en': {
      pageTitle: 'Kingshot Rally Leader Guide | Essential Metrics',
      headerTag: 'Kingshot Combat Guide',
      headerTitle: 'Rally Leader Operations & Key Metrics',
      headerSubtitle: 'Quick reference for rally initiation, March Time, Squad Power, and live server clock',
      utcClockTitle: 'Game Server Time (UTC)',
      btnToTimer: '⏱️ Open Rally Sync Timer',
      langLabel: 'Language',

      step1Badge: 'Step 1',
      step1Title: 'Open the Rally Menu',
      step1Desc: 'Tap the target stronghold, press "Rally", and select the wait duration (5 minutes is standard).',
      step1Hint: '⚠️ Open this interface 15–30 seconds early and press launch at the exact designated second!',
      step1ImgAlt: 'Open Rally menu screenshot',
      clickToZoom: '🔍 Tap image to zoom',

      step2Badge: 'Step 2',
      step2Title: 'Verify 3 Essential March Metrics',
      step2Desc: 'On the troop deployment screen, verify and report these 3 core metrics to your shot-caller:',
      step2ImgAlt: 'Troop deployment screen with key metrics highlighted',

      item1Badge: '1. March Time',
      item1Title: 'March Time (One-Way)',
      item1Desc: 'One-way march duration to the target stronghold (mm:ss).',
      item1Note: '⚠️ Always report your <strong>unbuffed march time</strong> (no speedups active). After departure, <strong>NEVER use speedups</strong> so all rallies hit simultaneously!',

      item2Badge: '2. Power Value',
      item2Title: 'Squad Power Value',
      item2Desc: 'Total combat battle power of the marching squad (e.g., 120M, 95M, 80M).',
      item2Note: '💡 Report this to your commander to properly prioritize main assault squads vs. secondary waves.',

      item3Badge: '3. Live Clock',
      item3Title: 'Live Game Clock (UTC)',
      item3Desc: 'The live UTC game server time displayed in the top corner of the game.',
      item3Note: '⏰ All synchronized rally launch times are strictly based on this clock. Ensure your timing aligns down to the second!',

      checklistTitle: '📋 Rally Leader 4 Golden Rules',
      rule1: '1. Report unbuffed (no speedup) one-way march time to commander',
      rule2: '2. Report squad combat Power (e.g. 120M)',
      rule3: '3. Open rally menu 15–30s early; launch precisely at the UTC second',
      rule4: '4. Never use march speedups after departure to keep simultaneous hit',

      footerText: 'Kingshot Rally Leader Guide · Quick reference for alliance rally captains',
      copyright: '© [#1914][ACE]Bao咔咔 · Kingshot Rally Sync Timer'
    },

    'ja': {
      pageTitle: 'Kingshot 集結リーダー作戦ガイド | Essential Metrics',
      headerTag: 'Kingshot 作戦ガイド',
      headerTitle: '集結リーダー操作＆データ確認ガイド',
      headerSubtitle: '集結の開始手順、行軍時間、戦力値、ゲーム内リアルタイム時計の確認方法',
      utcClockTitle: 'ゲームサーバー時間 (UTC)',
      btnToTimer: '⏱️ タイマーを開く',
      langLabel: '言語 / Language',

      step1Badge: 'ステップ 1',
      step1Title: '集結画面を開く',
      step1Desc: '目標の拠点をタップし、「集結」を押して待機時間を設定します（標準は5分間）。',
      step1Hint: '⚠️ 予定時間の15〜30秒前にこの画面を開き、指定秒数ちょうどに発起ボタンを押してください！',
      step1ImgAlt: '集結開始画面のスクリーンショット',
      clickToZoom: '🔍 画像をタップして拡大',

      step2Badge: 'ステップ 2',
      step2Title: '出撃部隊の重要データ確認',
      step2Desc: '部隊編成画面で、以下の重要3項目を確認し指揮官に共有してください：',
      step2ImgAlt: '部隊編成画面と重要データ表示',

      item1Badge: '1. 行軍時間',
      item1Title: '行軍時間 (March Time)',
      item1Desc: '目標拠点までの片道所要時間（分 : 秒）。',
      item1Note: '⚠️ 指揮官には<strong>加速を使わない素の行軍時間</strong>を報告してください。出発後は<strong>絶対に加速を使わないでください</strong>（全軍同着のため）！',

      item2Badge: '2. 戦力値',
      item2Title: '戦力値 (Power Value)',
      item2Desc: '出撃部隊の戦闘力（例：120M、95M、80Mなど）。',
      item2Note: '💡 指揮官が主力隊・サブ隊の編成順や突入順を判断するために必要となります。',

      item3Badge: '3. リアルタイム時計',
      item3Title: 'ゲーム内時計 (Live Clock)',
      item3Desc: 'ゲーム画面右上に表示されるUTCサーバー時間。',
      item3Note: '⏰ 全ての集結発起時間は厳密にこの時計を基準としています。秒単位で正確に合わせて発起してください！',

      checklistTitle: '📋 集結リーダー 4大重要ルール',
      rule1: '1. 加速なしの正確な行軍時間を指揮官に報告',
      rule2: '2. 編成部隊の「戦力値 (Power)」を報告',
      rule3: '3. 15〜30秒前に集結画面を開き、UTC指定秒数に狂いなく発起',
      rule4: '4. 出撃後の加速使用は厳禁（同時着弾崩れを防ぐため）',

      footerText: 'Kingshot 集結リーダー作戦ガイド · 連盟集結部隊のクイック参照用',
      copyright: '© [#1914][ACE]Bao咔咔 · Kingshot Rally Sync Timer'
    },

    'ko': {
      pageTitle: 'Kingshot 집결 대장 작전 가이드 | Rally Leader Guide',
      headerTag: 'Kingshot 작전 가이드',
      headerTitle: '집결 대장 조작 및 핵심 수치 확인',
      headerSubtitle: '집결 발기 방법, 행군 시간, 전투력 수치 및 실시간 서버 시계 확인 안내',
      utcClockTitle: '게임 서버 시간 (UTC)',
      btnToTimer: '⏱️ 타이머로 이동',
      langLabel: '언어 / Language',

      step1Badge: '1단계',
      step1Title: '집결 화면 열기',
      step1Desc: '목표 거점을 터치하고 \'집결\'을 누른 후 대기 시간을 설정합니다(표준 5분).',
      step1Hint: '⚠️ 예정 시간 15~30초 전에 미리 이 화면을 열어두고, 지정된 초에 정확히 발기 버튼을 누르세요!',
      step1ImgAlt: '집결 화면 스크린샷',
      clickToZoom: '🔍 이미지를 터치하여 확대',

      step2Badge: '2단계',
      step2Title: '출정 부대 핵심 데이터 확인',
      step2Desc: '부대 편성 화면에서 다음 3가지 핵심 정보를 확인하고 지휘관에게 보고하세요:',
      step2ImgAlt: '출정 부대 편성 화면 및 핵심 정보 표시',

      item1Badge: '1. 행군 시간',
      item1Title: '행군 시간 (March Time)',
      item1Desc: '목표 거점까지의 편도 행군 소요 시간(분:초).',
      item1Note: '⚠️ 지휘관에게는 <strong>가속을 사용하지 않은 기본 행군 시간</strong>을 보고해야 합니다. 출발 후에는 동시 타격을 위해 <strong>절대 가속을 누르지 마세요</strong>!',

      item2Badge: '2. 전투력 수치',
      item2Title: '전투력 수치 (Power Value)',
      item2Desc: '출정 부대의 전투력(예: 120M, 95M, 80M 등).',
      item2Note: '💡 지휘관이 주력 집결 및 지원 집결 순서를 배치하는 데 사용됩니다.',

      item3Badge: '3. 실시간 시계',
      item3Title: '실시간 시계 (Live Clock)',
      item3Desc: '게임 우측 상단에 표시되는 UTC 서버 시간.',
      item3Note: '⏰ 모든 초맞춤 집결 발기 시간은 이 시계를 기준으로 합니다. 초 단위까지 오차 없이 정확히 발기하세요!',

      checklistTitle: '📋 집결 대장 필수 4대 수칙',
      rule1: '1. 가속 없는 기본 행군 시간 지휘관에게 보고',
      rule2: '2. 출정 부대 전투력(Power) 수치 보고',
      rule3: '3. 15~30초 전 집결창 대기 후 UTC 지정 초에 정확히 발기',
      rule4: '4. 출발 후 동시 타격 유지를 위해 가속 사용 금지',

      footerText: 'Kingshot 집결 대장 작전 가이드 · 연맹 집결 부대용 빠른 가이드',
      copyright: '© [#1914][ACE]Bao咔咔 · Kingshot Rally Sync Timer'
    },

    'ru': {
      pageTitle: 'Kingshot Руководство капитана сбора | Rally Leader Guide',
      headerTag: 'Kingshot Боевое руководство',
      headerTitle: 'Действия капитана сбора и ключевые параметры',
      headerSubtitle: 'Запуск сбора, время марша, боевая мощь и текущее время сервера UTC',
      utcClockTitle: 'Время сервера (UTC)',
      btnToTimer: '⏱️ Перейти к таймеру',
      langLabel: 'Язык / Language',

      step1Badge: 'Шаг 1',
      step1Title: 'Открытие меню сбора',
      step1Desc: 'Нажмите на опорный пункт, выберите «Сбор» и установите время ожидания (стандартно 5 минут).',
      step1Hint: '⚠️ Откройте меню за 15–30 секунд до запуска и нажмите точно в назначенную секунду!',
      step1ImgAlt: 'Меню запуска сбора',
      clickToZoom: '🔍 Нажмите для увеличения',

      step2Badge: 'Шаг 2',
      step2Title: 'Проверка 3 ключевых параметров',
      step2Desc: 'В окне отправки войск проверьте и сообщите координатору следующие 3 параметра:',
      step2ImgAlt: 'Экран отправки войск с параметрами',

      item1Badge: '1. Время марша',
      item1Title: 'Время марша (March Time)',
      item1Desc: 'Время пути в одну сторону до цели (мин : сек).',
      item1Note: '⚠️ Сообщайте <strong>время БЕЗ ускорений</strong>. После выхода <strong>НИ В КОЕМ СЛУЧАЕ не используйте ускорение</strong> для синхронного удара!',

      item2Badge: '2. Боевая мощь',
      item2Title: 'Боевая мощь (Power Value)',
      item2Desc: 'Сила отправляемого отряда (например: 120M, 95M, 80M).',
      item2Note: '💡 Необходима координатору для распределения основных ударных и вспомогательных сборов.',

      item3Badge: '3. Часы сервера',
      item3Title: 'Часы сервера (Live Clock)',
      item3Desc: 'Текущее время UTC в верхнем углу экрана игры.',
      item3Note: '⏰ Все запуски сборов строго синхронизированы с этими часами. Запускайте секунда в секунду!',

      checklistTitle: '📋 4 золотых правила капитана сбора',
      rule1: '1. Сообщить время марша без ускорений координатору',
      rule2: '2. Сообщить боевую мощь (Power) отряда',
      rule3: '3. Открыть окно за 15–30 сек и нажать ровно в секунду UTC',
      rule4: '4. Никогда не использовать ускорение марша после старта',

      footerText: 'Kingshot Руководство капитана сбора · Памятка для альянса',
      copyright: '© [#1914][ACE]Bao咔咔 · Kingshot Rally Sync Timer'
    },

    'es': {
      pageTitle: 'Guía de Líder de Rally Kingshot | Métricas Clave',
      headerTag: 'Guía de Combate Kingshot',
      headerTitle: 'Operaciones y Métricas del Líder de Rally',
      headerSubtitle: 'Guía rápida para iniciar rallies, Tiempo de Marcha, Poder y Reloj del Servidor',
      utcClockTitle: 'Hora del Servidor (UTC)',
      btnToTimer: '⏱️ Ir al Sincronizador',
      langLabel: 'Idioma / Language',

      step1Badge: 'Paso 1',
      step1Title: 'Abrir el Menú de Rally',
      step1Desc: 'Toca la fortaleza objetivo, presiona "Rally" y elige el tiempo de espera (5 minutos estándar).',
      step1Hint: '⚠️ ¡Abre esta ventana 15–30 segundos antes y presiona iniciar en el segundo exacto!',
      step1ImgAlt: 'Captura de pantalla del menú de rally',
      clickToZoom: '🔍 Toca para ampliar imagen',

      step2Badge: 'Paso 2',
      step2Title: 'Confirmar 3 Métricas Esenciales',
      step2Desc: 'En la pantalla de despliegue, verifica y reporta estos 3 datos al comandante:',
      step2ImgAlt: 'Pantalla de despliegue con datos clave',

      item1Badge: '1. Tiempo de Marcha',
      item1Title: 'Tiempo de Marcha (March Time)',
      item1Desc: 'Duración del trayecto de ida hasta el objetivo (mm:ss).',
      item1Note: '⚠️ Reporta tu tiempo <strong>SIN aceleradores</strong>. Tras la salida, <strong>NUNCA uses aceleradores</strong> para asegurar el impacto simultáneo.',

      item2Badge: '2. Poder del Escuadrón',
      item2Title: 'Valor de Poder (Power Value)',
      item2Desc: 'Poder militar de tu escuadrón (ej. 120M, 95M, 80M).',
      item2Note: '💡 Permite al comandante ordenar las oleadas de ataque principales y secundarias.',

      item3Badge: '3. Reloj en Vivo',
      item3Title: 'Reloj del Juego (Live Clock)',
      item3Desc: 'Hora UTC del servidor que se muestra en la esquina superior del juego.',
      item3Note: '⏰ Todos los rallies sincronizados dependen de este reloj. ¡Inicia con precisión de segundo!',

      checklistTitle: '📋 4 Reglas de Oro del Líder de Rally',
      rule1: '1. Reportar el tiempo de marcha base sin acelerador al comandante',
      rule2: '2. Reportar el poder (Power) del escuadrón',
      rule3: '3. Abrir ventana 15–30s antes y lanzar en el segundo UTC exacto',
      rule4: '4. Prohibido acelerar tras salir para no romper el impacto simultáneo',

      footerText: 'Guía de Líder de Rally Kingshot · Referencia rápida de alianza',
      copyright: '© [#1914][ACE]Bao咔咔 · Kingshot Rally Sync Timer'
    },

    'de': {
      pageTitle: 'Kingshot Rally-Leiter Leitfaden | Essential Metrics',
      headerTag: 'Kingshot Kampf-Leitfaden',
      headerTitle: 'Rally-Leiter Aktionen & Kennzahlen',
      headerSubtitle: 'Schnellanleitung für Rally-Start, Marschzeit, Kampfkraft und Serveruhr',
      utcClockTitle: 'Spiel-Serverzeit (UTC)',
      btnToTimer: '⏱️ Zum Timer',
      langLabel: 'Sprache / Language',

      step1Badge: 'Schritt 1',
      step1Title: 'Rally-Menü öffnen',
      step1Desc: 'Festung antippen, auf "Rally" drücken und Wartezeit wählen (Standard: 5 Minuten).',
      step1Hint: '⚠️ Menü 15–30 Sek. vorher öffnen und exakt zur vorgegebenen Sekunde starten!',
      step1ImgAlt: 'Screenshot Rally-Startmenü',
      clickToZoom: '🔍 Bild antippen zum Vergrößern',

      step2Badge: 'Schritt 2',
      step2Title: '3 Kern-Kennzahlen prüfen',
      step2Desc: 'Prüfe im Truppen-Einsatzmenü folgende 3 Werte und melde sie dem Kommandanten:',
      step2ImgAlt: 'Screenshot Truppeneinsatz mit Kennzahlen',

      item1Badge: '1. Marschzeit',
      item1Title: 'Marschzeit (March Time)',
      item1Desc: 'Einfache Marschdauer zum Ziel (mm:ss).',
      item1Note: '⚠️ Immer die <strong>ungestoppte Marschzeit (ohne Beschleuniger)</strong> melden. Nach dem Start <strong>niemals beschleunigen</strong>!',

      item2Badge: '2. Kampfkraft',
      item2Title: 'Kampfkraft (Power Value)',
      item2Desc: 'Gesamtkampfkraft des entsandten Trupps (z. B. 120M, 95M).',
      item2Note: '💡 Dient dem Kommandanten zur Staffelung der Haupt- und Folgeangriffe.',

      item3Badge: '3. Live-Uhr',
      item3Title: 'Live-Serveruhr (Live Clock)',
      item3Desc: 'Die oben im Spiel angezeigte UTC-Serverzeit.',
      item3Note: '⏰ Alle synchronisierten Rallies richten sich streng nach dieser Uhr. Starte sekundengenau!',

      checklistTitle: '📋 4 Goldene Regeln für Rally-Leiter',
      rule1: '1. Marschzeit ohne Beschleuniger dem Kommandanten melden',
      rule2: '2. Truppen-Kampfkraft (Power) melden',
      rule3: '3. Menü 15–30s vorher öffnen; exakt zur UTC-Sekunde starten',
      rule4: '4. Nach Abmarsch keinesfalls Marschbeschleuniger nutzen',

      footerText: 'Kingshot Rally-Leiter Leitfaden · Schnelle Allianz-Übersicht',
      copyright: '© [#1914][ACE]Bao咔咔 · Kingshot Rally Sync Timer'
    },

    'fr': {
      pageTitle: 'Guide du Chef de Ralliement Kingshot | Métriques Clés',
      headerTag: 'Guide de Combat Kingshot',
      headerTitle: 'Opérations & Métriques Clés du Chef de Ralliement',
      headerSubtitle: 'Procédure de lancement, Temps de marche, Puissance et Horloge du serveur',
      utcClockTitle: 'Heure du Serveur (UTC)',
      btnToTimer: '⏱️ Ouvrir le Synchronisateur',
      langLabel: 'Langue / Language',

      step1Badge: 'Étape 1',
      step1Title: 'Ouvrir le Menu de Ralliement',
      step1Desc: 'Appuyez sur la forteresse cible, choisissez "Ralliement" et réglez le délai (5 min standard).',
      step1Hint: '⚠️ Ouvrez ce menu 15 à 30 secondes à l\'avance et lancez à la seconde exacte !',
      step1ImgAlt: 'Capture d\'écran du menu de ralliement',
      clickToZoom: '🔍 Toucher pour agrandir',

      step2Badge: 'Étape 2',
      step2Title: 'Vérifier 3 Métriques Essentielles',
      step2Desc: 'Sur l\'écran de déploiement, vérifiez et transmettez ces 3 données au commandant :',
      step2ImgAlt: 'Écran de déploiement des troupes avec données clés',

      item1Badge: '1. Temps de Marche',
      item1Title: 'Temps de Marche (March Time)',
      item1Desc: 'Durée du trajet aller vers la forteresse cible (mm:ss).',
      item1Note: '⚠️ Indiquez le temps <strong>SANS accélérateurs</strong>. Après le départ, <strong>n\'utilisez AUCUN accélérateur</strong> pour frapper en même temps !',

      item2Badge: '2. Puissance',
      item2Title: 'Puissance de l\'Escouade (Power Value)',
      item2Desc: 'Puissance militaire de votre escouade (ex. 120M, 95M).',
      item2Note: '💡 Permet au stratège d\'ordonner les vagues de ralliements prioritaires.',

      item3Badge: '3. Horloge en Direct',
      item3Title: 'Horloge du Jeu (Live Clock)',
      item3Desc: 'L\'heure UTC du serveur affichée dans le coin supérieur du jeu.',
      item3Note: '⏰ Tous les départs synchronisés reposent sur cette horloge. Lancez à la seconde près !',

      checklistTitle: '📋 4 Règles d\'Or du Chef de Ralliement',
      rule1: '1. Transmettre le temps de marche brut sans accélérateur au commandant',
      rule2: '2. Transmettre la puissance (Power) de l\'escouade',
      rule3: '3. Préparer l\'écran 15–30s avant; lancer exactement à la seconde UTC',
      rule4: '4. Interdiction absolue d\'accélérer après le départ',

      footerText: 'Guide du Chef de Ralliement Kingshot · Référence rapide pour l\'alliance',
      copyright: '© [#1914][ACE]Bao咔咔 · Kingshot Rally Sync Timer'
    },

    'vi': {
      pageTitle: 'Hướng Dẫn Đội Trưởng Tập Kết Kingshot | Rally Leader Guide',
      headerTag: 'Cẩm Nang Tác Chiến Kingshot',
      headerTitle: 'Hướng Dẫn Thao Tác & Thông Số Đội Trưởng Tập Kết',
      headerSubtitle: 'Hướng dẫn mở tập kết, Thời gian hành quân, Chỉ số lực chiến và Đồng hồ UTC',
      utcClockTitle: 'Giờ Máy Chủ (UTC)',
      btnToTimer: '⏱️ Mở Trình Đồng Bộ',
      langLabel: 'Ngôn ngữ / Language',

      step1Badge: 'Bước 1',
      step1Title: 'Mở Giao Diện Tập Kết',
      step1Desc: 'Nhấn vào cứ điểm mục tiêu, chọn "Tập kết" và cài đặt thời gian chờ (chuẩn 5 phút).',
      step1Hint: '⚠️ Hãy mở giao diện này trước 15–30 giây và nhấn phát động chuẩn xác từng giây!',
      step1ImgAlt: 'Ảnh chụp giao diện mở tập kết',
      clickToZoom: '🔍 Nhấn vào ảnh để phóng to',

      step2Badge: 'Bước 2',
      step2Title: 'Xác Nhận 3 Thông Số Cốt Lõi',
      step2Desc: 'Tại giao diện điều quân, hãy xác nhận và báo cáo 3 thông tin quan trọng sau cho chỉ huy:',
      step2ImgAlt: 'Giao diện điều quân và hiển thị thông số quan trọng',

      item1Badge: '1. Thời Gian Hành Quân',
      item1Title: 'Thời Gian Hành Quân (March Time)',
      item1Desc: 'Thời gian đi một chiều đến cứ điểm mục tiêu (phút : giây).',
      item1Note: '⚠️ Báo cho chỉ huy thời gian <strong>KHÔNG dùng tăng tốc</strong>. Sau khi xuất quân, <strong>tuyệt đối KHÔNG ấn tăng tốc</strong> để đảm bảo va chạm cùng lúc!',

      item2Badge: '2. Lực Chiến Đội Quân',
      item2Title: 'Chỉ Số Lực Chiến (Power Value)',
      item2Desc: 'Sức mạnh chiến đấu của đội quân xuất trận (ví dụ: 120M, 95M, 80M).',
      item2Note: '💡 Cung cấp cho chỉ huy để sắp xếp thứ tự đội hình chủ lực và thê đội tiếp ứng.',

      item3Badge: '3. Đồng Hồ Thời Gian Thực',
      item3Title: 'Đồng Hồ Máy Chủ (Live Clock)',
      item3Desc: 'Thời gian UTC của máy chủ hiển thị ở góc trên trong game.',
      item3Note: '⏰ Mọi hiệu lệnh tập kết căn giây đều căn cứ vào đồng hồ này. Hãy phát động chuẩn xác từng giây!',

      checklistTitle: '📋 4 Nguyên Tắc Vàng Của Đội Trưởng Tập Kết',
      rule1: '1. Báo cáo thời gian hành quân gốc (không tăng tốc) cho chỉ huy',
      rule2: '2. Báo cáo lực chiến (Power) của đội hình',
      rule3: '3. Mở sẵn giao diện trước 15–30s; bấm xuất kích chuẩn xác theo giây UTC',
      rule4: '4. Tuyệt đối không dùng tăng tốc sau khi xuất phát',

      footerText: 'Hướng Dẫn Đội Trưởng Tập Kết Kingshot · Cẩm nang tra cứu nhanh',
      copyright: '© [#1914][ACE]Bao咔咔 · Kingshot Rally Sync Timer'
    }
  };

  let currentLang = DEFAULT_LANG;

  function detectPreferredLang() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LANG);
      if (saved && TRANSLATIONS[saved]) return saved;
    } catch (e) {
      // Ignore
    }

    const browserLangs = navigator.languages || [navigator.language || navigator.userLanguage || ''];
    for (const raw of browserLangs) {
      if (!raw) continue;
      const lower = raw.toLowerCase();
      if (lower.startsWith('zh-tw') || lower.startsWith('zh-hk') || lower.startsWith('zh-mo') || lower.startsWith('zh-hant')) {
        return 'zh-Hant';
      }
      if (lower.startsWith('zh')) return 'zh-Hans';
      if (lower.startsWith('ja')) return 'ja';
      if (lower.startsWith('ko')) return 'ko';
      if (lower.startsWith('ru')) return 'ru';
      if (lower.startsWith('es')) return 'es';
      if (lower.startsWith('de')) return 'de';
      if (lower.startsWith('fr')) return 'fr';
      if (lower.startsWith('vi')) return 'vi';
      if (lower.startsWith('en')) return 'en';
    }
    return DEFAULT_LANG;
  }

  function applyLanguage(lang) {
    if (!TRANSLATIONS[lang]) lang = DEFAULT_LANG;
    currentLang = lang;
    try {
      localStorage.setItem(STORAGE_KEY_LANG, lang);
    } catch (e) {
      // Ignore
    }

    document.documentElement.lang = lang;
    const dict = TRANSLATIONS[lang];

    if (dict.pageTitle) {
      document.title = dict.pageTitle;
    }

    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      if (dict[key] !== undefined) {
        el.textContent = dict[key];
      }
    });

    document.querySelectorAll('[data-i18n-html]').forEach((el) => {
      const key = el.getAttribute('data-i18n-html');
      if (dict[key] !== undefined) {
        el.innerHTML = dict[key];
      }
    });

    document.querySelectorAll('[data-i18n-alt]').forEach((el) => {
      const key = el.getAttribute('data-i18n-alt');
      if (dict[key] !== undefined) {
        el.setAttribute('alt', dict[key]);
      }
    });

    const select = document.getElementById('guideLangSelect');
    if (select && select.value !== lang) {
      select.value = lang;
    }
  }

  function setupLightbox() {
    const modal = document.getElementById('lightboxModal');
    const modalImg = document.getElementById('lightboxImg');
    const closeBtn = document.getElementById('lightboxClose');
    if (!modal || !modalImg) return;

    document.querySelectorAll('.zoomable-img').forEach((img) => {
      img.addEventListener('click', () => {
        modalImg.src = img.src;
        modalImg.alt = img.alt || '';
        modal.style.display = 'flex';
      });
    });

    const closeModal = () => { modal.style.display = 'none'; };
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.style.display === 'flex') {
        closeModal();
      }
    });
  }

  function init() {
    const initialLang = detectPreferredLang();
    const select = document.getElementById('guideLangSelect');
    if (select) {
      select.value = initialLang;
      select.addEventListener('change', (e) => {
        applyLanguage(e.target.value);
      });
    }

    applyLanguage(initialLang);
    setupLightbox();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
