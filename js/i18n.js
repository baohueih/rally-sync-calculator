/**
 * Kingshot Rally Sync Timer - Internationalization (i18n) Module
 *
 * How to maintain or add languages:
 * 1. To fix a translation: find the key under `TRANSLATIONS['zh-Hant']` or `TRANSLATIONS['en']` and edit the string.
 *    Placeholders inside `{braces}` (e.g. `{name}`, `{time}`, `{count}`) are dynamically replaced at runtime.
 * 2. To add a new language (e.g. Japanese `ja` or Korean `ko`):
 *    - Add `{ code: 'ja', label: '日本語' }` to `SUPPORTED_LANGUAGES`.
 *    - Copy the `'en'` (or `'zh-Hant'`) block in `TRANSLATIONS` under `'ja': { ... }` and translate the values.
 *    - Any missing key automatically falls back to `'zh-Hant'`.
 */

(function () {
  'use strict';

  const STORAGE_KEY_LANG = 'ks_rally_timer_lang_v1';
  const DEFAULT_LANG = 'zh-Hant';

  const SUPPORTED_LANGUAGES = [
    { code: 'zh-Hant', label: '繁體中文' },
    { code: 'en', label: 'English' }
  ];

  const TRANSLATIONS = {
    // =========================================================================
    // 繁體中文 (Traditional Chinese - Default)
    // =========================================================================
    'zh-Hant': {
      // Meta & Sticky Bar
      'meta.title': 'Kingshot 據點戰集結壓秒計算器 | Rally Sync Timer',
      'sticky.ariaLabel': '即時作戰時鐘',
      'sticky.brandTitle': 'Kingshot 壓秒',
      'sticky.utcClockTitle': '當前遊戲伺服器時間 (UTC)',
      'sticky.utcClockLabel': 'UTC 遊戲時間',
      'sticky.langAriaLabel': '選擇介面語言',
      'sticky.btnGuide': '📖 隊長指南',

      // App Header
      'header.title': 'Kingshot 戰術壓秒集結計算器',
      'header.subtitle': '精準同步到達時間 · 連續轟炸據點',

      // Section 2: Parameter Input
      's1.title': '參數輸入',
      's1.desc': '先建立據點名單，並輸入各隊長前往各據點的單程行軍時間。',
      's1_1.title': '2.1 新增 / 命名 / 刪除據點',
      's1_1.hint': '直接修改名稱或增刪據點（下方 3.1 再選擇要攻打哪個據點）',
      's1_1.btnAdd': '＋ 新增據點',
      's1_1.btnAddTitle': '新增一個據點',
      's1_1.shPlaceholder': '據點名稱',
      's1_1.shAriaLabel': '據點 {num} 名稱',
      's1_1.btnDelTitle': '刪除「{name}」',
      's1_1.btnDelDisabledTitle': '至少需保留一個據點',
      's1_1.unnamedStronghold': '未命名據點',

      // Section 2.2: Leaders & March Times
      's1_2.title': '2.2 隊長名單與各據點行軍時間',
      's1_2.hint': '勾選參戰隊長，並填寫到各個據點的行軍時間（分 : 秒）',
      's1_2.btnAddLeader': '新增隊長',
      's1_2.btnBatchImport': '📋 批次匯入',
      's1_2.selectAllTitle': '全選 / 取消全選參戰隊伍',
      's1_2.selectAllText': '全選所有隊長參戰（未勾選者將暫時排除於作戰計算外）',
      's1_2.emptyTitle': '目前尚無集結隊伍',
      's1_2.emptyDesc': '點擊下方「新增隊長」按鈕，或載入預設範例隊伍。',
      's1_2.btnLoadExample': '載入預設範例 (隊長A、隊長B)',

      // Leader Card (1.2)
      'leader.badgeZero': '0 隊',
      'leader.badgeAllActive': '{total} 隊全參戰',
      'leader.badgePartialActive': '{active}/{total} 隊參戰',
      'leader.checkExcludeTitle': '點擊暫時排除此隊長',
      'leader.checkIncludeTitle': '點擊勾選加入參戰',
      'leader.namePlaceholder': '隊長名稱',
      'leader.nameAriaLabel': '隊長名稱',
      'leader.powerBoxTitle': '隊長力量數值 (方便觀察實力)',
      'leader.powerPlaceholder': '力量',
      'leader.powerAriaLabel': '隊長力量數值',
      'leader.orderGroupAria': '排序隊長位置',
      'leader.moveUpTitle': '往上移動此隊長',
      'leader.moveUpDisabledTitle': '已在最上方',
      'leader.moveDownTitle': '往下移動此隊長',
      'leader.moveDownDisabledTitle': '已在最下方',
      'leader.drawerToggleTitle': '展開或收合此隊長的行軍時間與集結時間設定',
      'leader.drawerBtnText': '🕙 設定',
      'leader.drawerSummaryGlobal': '全局',
      'leader.deleteTitle': '刪除此隊長',
      'leader.waitLabel': '集結等待時間',
      'leader.waitFollowGlobal': '跟隨全局預設 ({min} 分鐘)',
      'leader.wait1m': '1 分鐘',
      'leader.wait3m': '3 分鐘',
      'leader.wait5m': '5 分鐘 (標準)',
      'leader.wait10m': '10 分鐘',
      'leader.marchSectionHeader': '到各據點的單程行軍時間 (分 : 秒)',
      'leader.marchMinAria': '{name} 行軍分鐘',
      'leader.marchSecAria': '{name} 行軍秒數',
      'leader.unitMin': '分',
      'leader.unitSec': '秒',

      // Section 3: Tactical Settings
      's2.title': '作戰設定',
      's2.desc': '選擇本次要前往攻打的據點、計時模式與目標時間。',
      's2_1.title': '3.1 選擇前往哪個據點',
      's2_1.tabsAria': '目標據點選擇',
      's2_1.activeTag': '當前攻打',
      's2_2.title': '3.2 選擇作戰計時模式',
      's2_2.modeTargetHit': '🎯 全部抵達撞擊時間',
      's2_2.modeFirstLaunch': '🚀 第一隊發起集結時間',
      's2_3.title': '3.3 選擇全局集結等待時間',
      's2_3.hint': '發起集結後等待隊員進組的時間，Kingshot 常用 5 分鐘',
      's2_3.opt1m': '1 分鐘 (快速集結)',
      's2_3.opt3m': '3 分鐘',
      's2_3.opt5m': '5 分鐘 (標準)',
      's2_3.opt10m': '10 分鐘',
      's2_3.opt15m': '15 分鐘',
      's2_4_interval.title': '3.4 隊伍抵達時間間隔',
      's2_4_interval.hint': '設定各隊伍依序抵達據點的時間差（0 秒代表全部隊伍同一時間撞擊）',
      's2_4_interval.unitSec': '秒',
      's2_4.labelTargetHit': '3.5 時間控制面板：目標撞擊時間 (UTC)',
      's2_4.labelFirstLaunch': '3.5 時間控制面板：第一隊發起集結時間 (UTC)',
      's2_4.btnResetUtc': '🔄 重設為目前時間',
      's2_4.btnResetUtcTitle': '重設為當前 UTC 遊戲時間',
      's2_4.hourUpTitle': '小時 +1',
      's2_4.hourDownTitle': '小時 -1',
      's2_4.hourLabel': '時',
      's2_4.minUpTitle': '分鐘 +1',
      's2_4.minDownTitle': '分鐘 -1',
      's2_4.minLabel': '分',
      's2_4.secUpTitle': '秒數 +1',
      's2_4.secDownTitle': '秒數 -1',
      's2_4.secLabel': '秒',
      's2_4.quickLabel': '⚡ 快捷設定：',
      's2_4.quickPlus2m': '當前UTC+2分',
      's2_4.quickPlus3m': '當前UTC+3分',
      's2_4.quickPlus5m': '當前UTC +5分',
      's2_4.quickPlus10m': '當前UTC +10分',
      's2_4.quickPlus15m': '當前UTC +15分',
      's2_4.quickNext5m': '下一個5分整點',
      's2_4.quickNext10m': '下一個10分整點',

      // Section 4 & 5: Tactical Orders & Live Info
      's3_orders.title': '作戰指示',
      's3_orders.desc': '一鍵複製盟頻作戰發布廣播指令。',
      's3.title': '即時資訊',
      's3.desc': '即時計算各隊長發起集結時間與倒數狀態。',
      'summary.nextDayTag': '(跨日)',
      'summary.m1.card1Title': '🎯 目標撞擊時間 (UTC) · {sh}',
      'summary.m1.card1Sub': '全部隊伍同時抵達【{sh}】',
      'summary.m1.card2Title': '🚀 第一隊發起時間 (UTC 首發)',
      'summary.m1.card2SubLongest': '首發隊伍: {leader} (攻打{sh})',
      'summary.m1.card2SubNone': '無參戰隊伍 (請勾選隊長)',
      'summary.m1.card2SubDefault': '最久行軍隊伍準時發起 (攻打{sh})',
      'summary.m1.card3Title': '⏳ 距離撞擊剩餘時間',
      'summary.m1.expired': '已過期 / 撞擊完成',
      'summary.m1.countingDown': '作戰倒數中',
      'summary.m2.card1Title': '🚀 設定第一隊發起時間 (UTC) · {sh}',
      'summary.m2.card1SubLongest': '目標：{sh} ｜ 首發: {leader}',
      'summary.m2.card1SubNone': '無參戰隊伍 (請勾選隊長)',
      'summary.m2.card1SubDefault': '目標：{sh} ｜ 行軍最久隊伍準時發起',
      'summary.m2.card2Title': '🎯 預計撞擊時間 ({sh})',
      'summary.m2.card2Sub': '全體集結同秒撞擊【{sh}】',
      'summary.m2.card3Title': '⏳ 距離首隊發起剩餘時間',
      'summary.m2.hitDone': '已撞擊完成',
      'summary.m2.firstLaunched': '首隊已發起',
      'summary.m2.untilHit': '距撞擊剩餘 {time}',
      'summary.m2.countingDown': '首隊發起倒數中',
      'summary.elapsed': '已過去 {time}',

      // Section 5.1: Leader Output Cards
      's3_1.title': '5.1 各隊長發起與行軍時間資訊',
      's3_1.metaStronghold': '🏰 攻打據點：{sh}',
      's3_1.metaNoTeams': '尚無隊伍',
      's3_1.metaActiveTeams': '{active}/{total} 隊參戰',
      's3_1.metaHitPreview': '共同撞擊：{time} UTC',
      's3_1.emptyNoLeaders': '尚未新增任何隊長，請先於上方「2.2 隊長名單」新增隊伍。',
      's3_1.emptyNoActive': '⚠️ 目前無勾選任何參戰隊長，請於上方「2.2 隊長名單」勾選參戰隊伍。',
      's3_1.badgeFirstLead': '🚀 首發隊伍',
      's3_1.badgeDelayTitle': '比首發隊伍晚 {sec} 秒發起',
      's3_1.badgeDelayText': '+{sec}s 延遲',
      's3_1.badgePowerTitle': '隊長力量數值',
      's3_1.btnCopySingleTitle': '複製此隊長作戰指令',
      's3_1.launchHeroTitle': '📢 推算發起集結時間 · 攻打【{sh}】',
      's3_1.metaMarch': '🏃 行軍 {march}',
      's3_1.metaWait': '⏱️ 集結 {min}分',
      's3_1.stepLaunch': '📢 發起集結',
      's3_1.stepDepart': '🚶 隊伍出發 ({min}分)',
      's3_1.stepHit': '🎯 撞擊{sh} ({march})',
      's3_1.singleCopyLeadTag': ' [首發]',
      's3_1.singleCopyTemplate': '【{name}】{leadTag} 攻打【{sh}】請於 {launch} UTC 發起集結 ({waitMin}分集結 / 行軍 {march} / 撞擊 {hit} UTC)',

      // Leader Status Pills
      'status.passed': '已撞擊完成',
      'status.waitingDepart': '等待出發中 ({time})',
      'status.marching': '行軍中 ({time})',
      'status.soon': '🔥 倒數 {sec} 秒',
      'status.countdown': '倒數 {time}',
      'status.disabled': '未參戰 / 排除',

      // Section 4.1: Alliance Broadcast
      's3_2.title': '4.1 盟頻作戰發布廣播 (一鍵複製)',
      's3_2.btnCopyExport': '📋 複製集結作戰指令',
      's3_2.btnCopyShareUrl': '🔗 複製此戰術分享連結',
      's3_2.emptyNoLeaders': '尚無集結隊伍。請新增隊長以產生發布指令。',
      's3_2.emptyNoActive': '⚠️ 目前所有隊長皆已被設為「未參戰/排除」（無任何勾選）。\n請在上方隊長名單勾選至少一位參戰隊長，以產生作戰廣播指令。',
      'broadcast.header': '🎯目標: {sh}\n',
      'broadcast.line': '{idx}. {name}: {launch} UTC發起\n',
      'broadcast.footer': '⚠️ 請各隊長提前15秒打開集結界面，分秒不差準時按下！',

      // Section 1: Presets & Share Link
      's4.title': '戰術存檔與分享',
      's4.desc': '儲存或切換常用戰術配置，或複製戰術網址分享給盟友。',
      's4.badge': '瀏覽器自動儲存',
      's4.btnClearAllData': '🗑️ 清除所有資料',
      's4.btnClearAllDataTitle': '清除所有據點、隊長與預設組資料',
      's4_1.title': '1.1 戰術預設組',
      's4_1.hint': '儲存當前陣容與行軍時間配置至瀏覽器，方便隨時切換',
      's4.inputPlaceholder': '王城主攻組、西邊炮台配置',
      's4.btnSave': '💾 儲存當前配置為預設',
      's4.emptyPresets': '尚未儲存任何自訂預設組',
      's4.loadTitle': '載入此預設組',
      's4.delTitle': '刪除預設',
      's4.chipLabel': '💾 {name} ({count}隊)',
      's4_2.title': '1.2 戰術分享連結',
      's4_2.hint': '將當前所有設定打包成輕量網址，盟友打開即可同步所有據點、隊長與倒數計時',
      's4_2.btnCopyShareUrl': '🔗 複製此戰術分享連結',
      's4_2.btnOpenGuide': '📖 隊長操作指南',

      // FAQ & Footer
      'faq.sectionTitle': '壓秒集結計算原理說明',
      'faq.formulaTitle': '📐 計算公式：',
      'faq.formula1': '【發起集結時間】=【目標到達時間】−【行軍時間】−【集結等待時間】',
      'faq.formula2': '【集結出發時間】=【發起集結時間】+【集結等待時間】=【目標到達時間】−【行軍時間】',
      'faq.q1Title': '🎯 什麼是壓秒集結？',
      'faq.q1Desc': '在 Kingshot 的據點戰中，防守方通常會有駐軍支援。透過同步多個集結的撞擊時間（例如前後差在 1~2 秒內），可連續打擊目標，不給敵方補兵與治療的時間，達到最大化傷亡效果。',
      'faq.q2Title': '⏰ 行軍時間如何取得？',
      'faq.q2Desc': '隊長點擊目標據點，按下「攻擊」或「集結」預覽畫面，即可查看該隊伍單程行軍時間（幾分幾秒）。請隊長提供不開加速狀態下的時間，並確認行軍過程中不要誤點加速。',
      'faq.q3Title': '⏰ 如何快速同步時間？',
      'faq.q3Desc': '點擊「重設為目前時間」即可將目標時間對齊目前 UTC 伺服器時間，再搭配快捷微調按鈕或上下箭頭，即可在數秒內迅速定案撞擊時間。',
      'faq.q4Title': '🌐 如何放到 GitHub Pages？',
      'faq.q4Desc': '本工具為純靜態網頁（HTML/CSS/JS），只需將專案推送至 GitHub Repository，在倉庫的 Settings > Pages 中將 Source 設定為 main 分支根目錄即可免伺服器永久免費運行。',
      'footer.text': 'Kingshot Rally Sync Timer · 純前端架構 · 資料保存在本機 · 支援 GitHub Pages 部署',

      // Batch Import & Clear Data Modals
      'modal.batchTitle': '📋 批次新增 / 快速貼上隊長名單',
      'modal.batchDescHtml': '每行一位隊長，行軍時間將匯入至<strong>目前選中的目標據點</strong>（或依序對應多個據點）：<br><code>隊長名稱 行軍秒數</code> (例: <code>隊長A 20</code>)<br><code>隊長名稱 分:秒</code> (例: <code>隊長B 1:15</code>)<br><code>隊長名稱 據點1分:秒 據點2分:秒 ...</code> (例: <code>隊長C 0:20 0:45 1:10</code>)',
      'modal.batchPlaceholder': '隊長A 20\n隊長B 40\n隊長C 1:15\n隊長D 0:35',
      'modal.btnCancel': '取消',
      'modal.btnSubmit': '確認匯入',
      'modal.clearTitle': '🗑️ 清除資料確認',
      'modal.clearDesc': '請勾選要清除的資料項目：',
      'modal.clearOptStrongholds': '目前據點（還原為預設據點）',
      'modal.clearOptLeaders': '所有隊長',
      'modal.clearOptPresets': '已儲存的戰術預設組',
      'modal.btnConfirmClear': '確認清除',

      // Feedbacks, Alerts & Defaults
      'feedback.copied': '已複製到剪貼簿！',
      'feedback.copyFailed': '複製失敗，請手動全選複製。',
      'feedback.shAdded': '已新增「{name}」！',
      'feedback.shDeleted': '已刪除據點「{name}」',
      'feedback.leaderDeleted': '已刪除隊長「{name}」',
      'feedback.presetLoaded': '已載入預設組「{name}」',
      'feedback.presetDeleted': '已刪除預設組「{name}」',
      'feedback.presetSaved': '已成功儲存預設組「{name}」！',
      'feedback.batchImported': '已成功匯入 {count} 位隊長！',
      'feedback.resetUtcFirst': '已將第一隊發起時間重設為目前 UTC 時間！',
      'feedback.resetUtcTarget': '已將目標撞擊時間重設為目前 UTC 時間！',
      'feedback.shareUrlCopied': '已複製作戰分享連結！隊友打開即可查看即時倒數。',
      'feedback.allDataCleared': '已清除所選資料！',
      'alert.minOneStronghold': '至少需保留一個作戰據點！',
      'alert.clearSelectAtLeastOne': '請至少勾選一項要清除的資料！',
      'confirm.deleteStronghold': '確定要刪除據點「{name}」及其對應的行軍時間資料嗎？',
      'confirm.deleteLeader': '確定要刪除隊長「{name}」嗎？',
      'alert.enterPresetName': '請先輸入預設組名稱，例如「王城主攻組」',
      'alert.addLeaderBeforePreset': '請先新增隊長名單再儲存預設組！',
      'alert.batchParseEmpty': '未解析到任何隊伍資料，請確認格式（例如：隊長A 20）。',
      'default.strongholdName': '據點 {num}',
      'default.leaderName': '隊長{char}'
    },

    // =========================================================================
    // English
    // =========================================================================
    'en': {
      // Meta & Sticky Bar
      'meta.title': 'Kingshot Rally Sync Timer | Tactical Calculator',
      'sticky.ariaLabel': 'Live Tactical Clock',
      'sticky.brandTitle': 'Kingshot Sync',
      'sticky.utcClockTitle': 'Current Game Server Time (UTC)',
      'sticky.utcClockLabel': 'UTC Game Time',
      'sticky.langAriaLabel': 'Select Interface Language',
      'sticky.btnGuide': '📖 Leader Guide',

      // App Header
      'header.title': 'Kingshot Tactical Rally Sync Calculator',
      'header.subtitle': 'Synchronize Hit Times · Coordinate Simultaneous Rally Strikes',

      // Section 2: Parameter Input
      's1.title': 'Parameter Input',
      's1.desc': 'Set up target strongholds first, then enter each leader\'s one-way march time to each stronghold.',
      's1_1.title': '2.1 Add / Rename / Delete Strongholds',
      's1_1.hint': 'Edit names or add/remove strongholds (select which target to attack in 3.1 below)',
      's1_1.btnAdd': '＋ Add Stronghold',
      's1_1.btnAddTitle': 'Add a new stronghold',
      's1_1.shPlaceholder': 'Stronghold Name',
      's1_1.shAriaLabel': 'Stronghold {num} Name',
      's1_1.btnDelTitle': 'Delete "{name}"',
      's1_1.btnDelDisabledTitle': 'At least one stronghold is required',
      's1_1.unnamedStronghold': 'Unnamed Stronghold',

      // Section 2.2: Leaders & March Times
      's1_2.title': '2.2 Rally Leaders & March Times',
      's1_2.hint': 'Check participating leaders and set their march time (Min : Sec) to each stronghold',
      's1_2.btnAddLeader': 'Add Leader',
      's1_2.btnBatchImport': '📋 Batch Import',
      's1_2.selectAllTitle': 'Select / Deselect All Participating Leaders',
      's1_2.selectAllText': 'Select all leaders to participate (unchecked leaders are excluded from calculations)',
      's1_2.emptyTitle': 'No Rally Leaders Yet',
      's1_2.emptyDesc': 'Click "Add Leader" below, or load the example roster.',
      's1_2.btnLoadExample': 'Load Example Roster (Leader A, Leader B)',

      // Leader Card (1.2)
      'leader.badgeZero': '0 Teams',
      'leader.badgeAllActive': 'All {total} Active',
      'leader.badgePartialActive': '{active}/{total} Active',
      'leader.checkExcludeTitle': 'Click to temporarily exclude this leader',
      'leader.checkIncludeTitle': 'Click to include this leader in battle',
      'leader.namePlaceholder': 'Leader Name',
      'leader.nameAriaLabel': 'Leader Name',
      'leader.powerBoxTitle': 'Leader Power (for strength reference)',
      'leader.powerPlaceholder': 'Power',
      'leader.powerAriaLabel': 'Leader Power',
      'leader.orderGroupAria': 'Reorder leader position',
      'leader.moveUpTitle': 'Move leader up',
      'leader.moveUpDisabledTitle': 'Already at the top',
      'leader.moveDownTitle': 'Move leader down',
      'leader.moveDownDisabledTitle': 'Already at the bottom',
      'leader.drawerToggleTitle': 'Expand or collapse march & rally wait time settings',
      'leader.drawerBtnText': '🕙 Set',
      'leader.drawerSummaryGlobal': 'Global',
      'leader.deleteTitle': 'Delete this leader',
      'leader.waitLabel': 'Rally Wait Time',
      'leader.waitFollowGlobal': 'Follow Global ({min} min)',
      'leader.wait1m': '1 Min',
      'leader.wait3m': '3 Min',
      'leader.wait5m': '5 Min (Standard)',
      'leader.wait10m': '10 Min',
      'leader.marchSectionHeader': 'One-Way March Time per Stronghold (Min : Sec)',
      'leader.marchMinAria': '{name} March Minutes',
      'leader.marchSecAria': '{name} March Seconds',
      'leader.unitMin': 'm',
      'leader.unitSec': 's',

      // Section 3: Tactical Settings
      's2.title': 'Tactical Settings',
      's2.desc': 'Select the target stronghold to attack, timing mode, and target UTC time.',
      's2_1.title': '3.1 Select Target Stronghold',
      's2_1.tabsAria': 'Target Stronghold Selection',
      's2_1.activeTag': 'Target',
      's2_2.title': '3.2 Select Timing Mode',
      's2_2.modeTargetHit': '🎯 Simultaneous Target Hit Time',
      's2_2.modeFirstLaunch': '🚀 First Rally Launch Time',
      's2_3.title': '3.3 Global Rally Wait Time',
      's2_3.hint': 'Wait time after launching a rally before troops march (5 min is standard in Kingshot)',
      's2_3.opt1m': '1 Minute (Quick Rally)',
      's2_3.opt3m': '3 Minutes',
      's2_3.opt5m': '5 Minutes (Standard)',
      's2_3.opt10m': '10 Minutes',
      's2_3.opt15m': '15 Minutes',
      's2_4_interval.title': '3.4 Team Arrival Interval',
      's2_4_interval.hint': 'Time gap in seconds between consecutive teams arriving at the stronghold (0s = simultaneous impact)',
      's2_4_interval.unitSec': 'Sec',
      's2_4.labelTargetHit': '3.5 Time Control Panel: Target Hit Time (UTC)',
      's2_4.labelFirstLaunch': '3.5 Time Control Panel: First Rally Launch Time (UTC)',
      's2_4.btnResetUtc': '🔄 Reset to Current UTC',
      's2_4.btnResetUtcTitle': 'Reset to current UTC game time',
      's2_4.hourUpTitle': 'Hour +1',
      's2_4.hourDownTitle': 'Hour -1',
      's2_4.hourLabel': 'Hr',
      's2_4.minUpTitle': 'Minute +1',
      's2_4.minDownTitle': 'Minute -1',
      's2_4.minLabel': 'Min',
      's2_4.secUpTitle': 'Second +1',
      's2_4.secDownTitle': 'Second -1',
      's2_4.secLabel': 'Sec',
      's2_4.quickLabel': '⚡ Quick Set:',
      's2_4.quickPlus2m': 'Now +2m',
      's2_4.quickPlus3m': 'Now +3m',
      's2_4.quickPlus5m': 'Now +5m',
      's2_4.quickPlus10m': 'Now +10m',
      's2_4.quickPlus15m': 'Now +15m',
      's2_4.quickNext5m': 'Next 5m Mark',
      's2_4.quickNext10m': 'Next 10m Mark',

      // Section 4 & 5: Tactical Orders & Live Info
      's3_orders.title': 'Tactical Orders',
      's3_orders.desc': 'One-click copy alliance broadcast rally orders.',
      's3.title': 'Live Tactical Info',
      's3.desc': 'Real-time rally launch times and countdown status for each leader.',
      'summary.nextDayTag': '(Next Day)',
      'summary.m1.card1Title': '🎯 Target Hit Time (UTC) · {sh}',
      'summary.m1.card1Sub': 'All rallies hit [{sh}] simultaneously',
      'summary.m1.card2Title': '🚀 First Rally Launch Time (UTC)',
      'summary.m1.card2SubLongest': '1st Launch: {leader} (Target: {sh})',
      'summary.m1.card2SubNone': 'No active leaders (please check leaders)',
      'summary.m1.card2SubDefault': 'Longest-march team launches first ({sh})',
      'summary.m1.card3Title': '⏳ Countdown to Impact',
      'summary.m1.expired': 'Expired / Hit Completed',
      'summary.m1.countingDown': 'Countdown Active',
      'summary.m2.card1Title': '🚀 First Rally Launch Time (UTC) · {sh}',
      'summary.m2.card1SubLongest': 'Target: {sh} ｜ 1st Launch: {leader}',
      'summary.m2.card1SubNone': 'No active leaders (please check leaders)',
      'summary.m2.card1SubDefault': 'Target: {sh} ｜ Longest-march team launches first',
      'summary.m2.card2Title': '🎯 Estimated Hit Time ({sh})',
      'summary.m2.card2Sub': 'All rallies hit [{sh}] on the same second',
      'summary.m2.card3Title': '⏳ Countdown to First Launch',
      'summary.m2.hitDone': 'Hit Completed',
      'summary.m2.firstLaunched': '1st Rally Launched',
      'summary.m2.untilHit': 'Impact in {time}',
      'summary.m2.countingDown': 'Counting Down to 1st Launch',
      'summary.elapsed': 'Elapsed {time}',

      // Section 5.1: Leader Output Cards
      's3_1.title': '5.1 Leader Launch & March Schedule',
      's3_1.metaStronghold': '🏰 Target: {sh}',
      's3_1.metaNoTeams': 'No Teams',
      's3_1.metaActiveTeams': '{active}/{total} Active',
      's3_1.metaHitPreview': 'Sync Hit: {time} UTC',
      's3_1.emptyNoLeaders': 'No leaders added yet. Please add leaders in "2.2 Rally Leaders" above.',
      's3_1.emptyNoActive': '⚠️ No active leaders selected. Please check at least one leader in "2.2 Rally Leaders" above.',
      's3_1.badgeFirstLead': '🚀 1st Launch',
      's3_1.badgeDelayTitle': 'Launches {sec}s after the first leader',
      's3_1.badgeDelayText': '+{sec}s delay',
      's3_1.badgePowerTitle': 'Leader Power',
      's3_1.btnCopySingleTitle': 'Copy order for this leader',
      's3_1.launchHeroTitle': '📢 Calculated Rally Launch Time · Target [{sh}]',
      's3_1.metaMarch': '🏃 March {march}',
      's3_1.metaWait': '⏱️ Rally {min}m',
      's3_1.stepLaunch': '📢 Open Rally',
      's3_1.stepDepart': '🚶 Depart ({min}m)',
      's3_1.stepHit': '🎯 Hit {sh} ({march})',
      's3_1.singleCopyLeadTag': ' [1st Launch]',
      's3_1.singleCopyTemplate': '[{name}]{leadTag} Target [{sh}]: Open rally at {launch} UTC ({waitMin}m rally / March {march} / Hit {hit} UTC)',

      // Leader Status Pills
      'status.passed': 'Hit Completed',
      'status.waitingDepart': 'Rallying ({time})',
      'status.marching': 'Marching ({time})',
      'status.soon': '🔥 Launch in {sec}s',
      'status.countdown': 'In {time}',
      'status.disabled': 'Excluded',

      // Section 4.1: Alliance Broadcast
      's3_2.title': '4.1 Alliance Chat Broadcast (One-Click Copy)',
      's3_2.btnCopyExport': '📋 Copy Rally Orders',
      's3_2.btnCopyShareUrl': '🔗 Copy Shareable Link',
      's3_2.emptyNoLeaders': 'No rally leaders yet. Add leaders above to generate broadcast orders.',
      's3_2.emptyNoActive': '⚠️ All leaders are currently unchecked/excluded.\nPlease check at least one participating leader above to generate broadcast orders.',
      'broadcast.header': '🎯Target: {sh}\n',
      'broadcast.line': '{idx}. {name}: Launch {launch} UTC\n',
      'broadcast.footer': '⚠️ Open the rally menu 15s early and press launch on the exact second!',

      // Section 1: Presets & Share Link
      's4.title': 'Tactical Saves & Sharing',
      's4.desc': 'Save or switch common tactical setups, or copy a shareable link for teammates.',
      's4.badge': 'Saved in Browser',
      's4.btnClearAllData': '🗑️ Clear All Data',
      's4.btnClearAllDataTitle': 'Clear all strongholds, leaders, and saved presets',
      's4_1.title': '1.1 Tactical Presets',
      's4_1.hint': 'Save current roster and march times to browser storage for quick switching',
      's4.inputPlaceholder': 'King\'s Castle Main Squad, West Turret Setup',
      's4.btnSave': '💾 Save Current Setup as Preset',
      's4.emptyPresets': 'No custom presets saved yet',
      's4.loadTitle': 'Load this preset',
      's4.delTitle': 'Delete preset',
      's4.chipLabel': '💾 {name} ({count} teams)',
      's4_2.title': '1.2 Tactical Share Link',
      's4_2.hint': 'Package all current settings into a compact URL so teammates can sync target strongholds, leaders, and live countdowns',
      's4_2.btnCopyShareUrl': '🔗 Copy Tactical Share Link',
      's4_2.btnOpenGuide': '📖 Rally Leader Guide',

      // FAQ & Footer
      'faq.sectionTitle': 'How Rally Sync Calculation Works',
      'faq.formulaTitle': '📐 Formula:',
      'faq.formula1': '[Rally Launch Time] = [Target Hit Time] − [March Time] − [Rally Wait Time]',
      'faq.formula2': '[Rally Depart Time] = [Rally Launch Time] + [Rally Wait Time] = [Target Hit Time] − [March Time]',
      'faq.q1Title': '🎯 What is a Synchronized Rally?',
      'faq.q1Desc': 'In Kingshot stronghold battles, defenders reinforce garrisons between attacks. By syncing multiple rallies to hit within 1–2 seconds of each other, you overwhelm enemy defenders before they can heal or reinforce.',
      'faq.q2Title': '⏰ How do I find my March Time?',
      'faq.q2Desc': 'Tap the target stronghold and preview "Attack" or "Rally" to see your one-way march duration (mm:ss). Report unbuffed march times and avoid using march speedups after departure.',
      'faq.q3Title': '⏰ How to set target time quickly?',
      'faq.q3Desc': 'Click "Reset to Current UTC" to align with live server time, then use the quick offset buttons (+5m, +10m) or stepper arrows to lock in your target time in seconds.',
      'faq.q4Title': '🌐 How to host on GitHub Pages?',
      'faq.q4Desc': 'This tool is a pure static web app (HTML/CSS/JS). Push the repository to GitHub and enable GitHub Pages from Settings > Pages (Source: main branch root) for free serverless hosting.',
      'footer.text': 'Kingshot Rally Sync Timer · Pure Client-Side App · Local Storage Persistence · GitHub Pages Ready',

      // Batch Import & Clear Data Modals
      'modal.batchTitle': '📋 Batch Import / Paste Leader List',
      'modal.batchDescHtml': 'One leader per line. March times apply to the <strong>currently selected stronghold</strong> (or map to all strongholds in order):<br><code>LeaderName Seconds</code> (e.g. <code>LeaderA 20</code>)<br><code>LeaderName Min:Sec</code> (e.g. <code>LeaderB 1:15</code>)<br><code>LeaderName SH1_Min:Sec SH2_Min:Sec ...</code> (e.g. <code>LeaderC 0:20 0:45 1:10</code>)',
      'modal.batchPlaceholder': 'LeaderA 20\nLeaderB 40\nLeaderC 1:15\nLeaderD 0:35',
      'modal.btnCancel': 'Cancel',
      'modal.btnSubmit': 'Import Now',
      'modal.clearTitle': '🗑️ Confirm Clear Data',
      'modal.clearDesc': 'Select the data items you want to clear:',
      'modal.clearOptStrongholds': 'Current Strongholds (Reset to defaults)',
      'modal.clearOptLeaders': 'All Leaders',
      'modal.clearOptPresets': 'Saved Tactical Presets',
      'modal.btnConfirmClear': 'Clear Selected',

      // Feedbacks, Alerts & Defaults
      'feedback.copied': 'Copied to clipboard!',
      'feedback.copyFailed': 'Copy failed. Please select all and copy manually.',
      'feedback.shAdded': 'Added "{name}"!',
      'feedback.shDeleted': 'Deleted stronghold "{name}"',
      'feedback.leaderDeleted': 'Deleted leader "{name}"',
      'feedback.presetLoaded': 'Loaded preset "{name}"',
      'feedback.presetDeleted': 'Deleted preset "{name}"',
      'feedback.presetSaved': 'Saved preset "{name}"!',
      'feedback.batchImported': 'Successfully imported {count} leaders!',
      'feedback.resetUtcFirst': 'Reset First Rally Launch Time to current UTC!',
      'feedback.resetUtcTarget': 'Reset Target Hit Time to current UTC!',
      'feedback.shareUrlCopied': 'Shareable tactical link copied! Teammates can open it for live countdowns.',
      'feedback.allDataCleared': 'Selected data cleared!',
      'alert.minOneStronghold': 'At least one stronghold must be kept!',
      'alert.clearSelectAtLeastOne': 'Please select at least one item to clear!',
      'confirm.deleteStronghold': 'Delete stronghold "{name}" and its march time data?',
      'confirm.deleteLeader': 'Delete leader "{name}"?',
      'alert.enterPresetName': 'Please enter a preset name first (e.g. "King\'s Castle Main Squad").',
      'alert.addLeaderBeforePreset': 'Please add rally leaders before saving a preset!',
      'alert.batchParseEmpty': 'No valid leader lines found. Example format: LeaderA 20',
      'default.strongholdName': 'Stronghold {num}',
      'default.leaderName': 'Leader {char}'
    }
  };

  let currentLang = DEFAULT_LANG;

  function isSupported(lang) {
    return Boolean(lang && TRANSLATIONS[lang]);
  }

  function loadSavedLang() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LANG);
      if (isSupported(saved)) {
        currentLang = saved;
      }
    } catch (e) {
      // Ignore storage error
    }
    return currentLang;
  }

  function setLang(lang) {
    if (!isSupported(lang)) return currentLang;
    currentLang = lang;
    try {
      localStorage.setItem(STORAGE_KEY_LANG, currentLang);
    } catch (e) {
      // Ignore storage error
    }
    if (document.documentElement) {
      document.documentElement.lang = currentLang;
    }
    return currentLang;
  }

  function getLang() {
    return currentLang;
  }

  function t(key, params = {}, langOverride) {
    const activeLang = isSupported(langOverride) ? langOverride : currentLang;
    const dict = TRANSLATIONS[activeLang] || TRANSLATIONS[DEFAULT_LANG];
    let str = dict[key];
    if (str === undefined) {
      str = TRANSLATIONS[DEFAULT_LANG][key];
    }
    if (str === undefined) {
      return key;
    }
    return String(str).replace(/\{([a-zA-Z0-9_]+)\}/g, (match, k) => (
      params[k] !== undefined && params[k] !== null ? String(params[k]) : match
    ));
  }

  function applyStaticTranslations(root = document) {
    if (!root) return;
    if (document.documentElement) {
      document.documentElement.lang = currentLang;
    }
    if (typeof document.title === 'string') {
      document.title = t('meta.title');
    }

    if (typeof root.querySelectorAll !== 'function') return;

    root.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      if (key) el.textContent = t(key);
    });

    root.querySelectorAll('[data-i18n-html]').forEach((el) => {
      const key = el.getAttribute('data-i18n-html');
      if (key) el.innerHTML = t(key);
    });

    root.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (key) {
        const val = t(key);
        el.placeholder = val;
        el.setAttribute('placeholder', val);
      }
    });

    root.querySelectorAll('[data-i18n-title]').forEach((el) => {
      const key = el.getAttribute('data-i18n-title');
      if (key) {
        const val = t(key);
        el.title = val;
        el.setAttribute('title', val);
      }
    });

    root.querySelectorAll('[data-i18n-aria-label]').forEach((el) => {
      const key = el.getAttribute('data-i18n-aria-label');
      if (key) {
        el.setAttribute('aria-label', t(key));
      }
    });
  }

  // Initialize language from storage immediately
  loadSavedLang();

  const api = {
    SUPPORTED_LANGUAGES,
    DEFAULT_LANG,
    TRANSLATIONS,
    t,
    getLang,
    setLang,
    applyStaticTranslations
  };

  if (typeof window !== 'undefined') {
    window.KS_I18N = api;
  }
  if (typeof globalThis !== 'undefined') {
    globalThis.KS_I18N = api;
  }
})();
