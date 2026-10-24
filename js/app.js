/**
 * Kingshot Rally Sync Timer
 * Modular architecture for multi-stronghold rally synchronization, live UTC tracking,
 * tactical broadcast generation, internationalization (i18n), and browser persistence.
 */

(function () {
  'use strict';

  // ===========================================================================
  // 1. i18n Bridge & Constants
  // ===========================================================================
  const i18n = globalThis.KS_I18N || {
    SUPPORTED_LANGUAGES: [{ code: 'zh-Hant', label: '繁體中文' }],
    DEFAULT_LANG: 'zh-Hant',
    t: (key) => key,
    getLang: () => 'zh-Hant',
    setLang: () => 'zh-Hant',
    applyStaticTranslations: () => {}
  };
  const t = (key, params) => i18n.t(key, params);

  const STORAGE_KEY_STATE = 'ks_rally_timer_state_v1';
  const STORAGE_KEY_PRESETS = 'ks_rally_timer_presets_v1';

  function getDefaultStrongholds() {
    return [
      { id: 'sh_1', name: t('default.strongholdName', { num: 1 }) },
      { id: 'sh_2', name: t('default.strongholdName', { num: 2 }) },
      { id: 'sh_3', name: t('default.strongholdName', { num: 3 }) }
    ];
  }

  function getDefaultLeaders() {
    return [
      {
        id: '1',
        name: t('default.leaderName', { char: 'A' }),
        power: '',
        marches: {
          sh_1: { min: 0, sec: 20 },
          sh_2: { min: 0, sec: 35 },
          sh_3: { min: 0, sec: 50 }
        },
        waitTime: 300,
        enabled: true
      },
      {
        id: '2',
        name: t('default.leaderName', { char: 'B' }),
        power: '',
        marches: {
          sh_1: { min: 0, sec: 40 },
          sh_2: { min: 0, sec: 25 },
          sh_3: { min: 1, sec: 5 }
        },
        waitTime: 300,
        enabled: true
      }
    ];
  }

  // ===========================================================================
  // 2. Pure Utility Functions
  // ===========================================================================
  const pad = (num, digits = 2) => String(num).padStart(digits, '0');

  function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function createId(prefix = '') {
    const rand = Math.random().toString(36).substring(2, 7);
    return prefix ? `${prefix}_${Date.now()}_${rand}` : `${Date.now()}_${rand}`;
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, (tag) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag));
  }

  function getUtcDateString(d = new Date()) {
    return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())} UTC`;
  }

  function getUtcTimeString(d = new Date()) {
    return `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}`;
  }

  function formatTimeHMS(totalSeconds) {
    const isNeg = totalSeconds < 0;
    const absSec = Math.abs(totalSeconds);
    const m = Math.floor(absSec / 60);
    const s = absSec % 60;
    return `${isNeg ? '-' : ''}${pad(m)}:${pad(s)}`;
  }

  function formatFullHMS(totalSeconds) {
    const isNeg = totalSeconds < 0;
    const absSec = Math.abs(totalSeconds);
    const h = Math.floor(absSec / 3600);
    const m = Math.floor((absSec % 3600) / 60);
    const s = absSec % 60;
    return `${isNeg ? '-' : ''}${pad(h)}:${pad(m)}:${pad(s)}`;
  }

  function formatUtcOutput(dateObj, targetDateObj) {
    const timeStr = getUtcTimeString(dateObj);
    if (targetDateObj && dateObj.getUTCDate() !== targetDateObj.getUTCDate()) {
      return `${timeStr} ${t('summary.nextDayTag')}`;
    }
    return timeStr;
  }

  function parseTimeToken(token) {
    if (!token) return { min: 0, sec: 30 };
    if (token.includes(':')) {
      const [mRaw, sRaw] = token.split(':');
      let m = parseInt(mRaw, 10) || 0;
      let s = parseInt(sRaw, 10) || 0;
      if (s >= 60) {
        m += Math.floor(s / 60);
        s %= 60;
      }
      return { min: Math.max(0, m), sec: Math.max(0, s) };
    }
    const totalSec = Math.max(0, parseInt(token, 10) || 0);
    return { min: Math.floor(totalSec / 60), sec: totalSec % 60 };
  }

  // ===========================================================================
  // 3. Application State & Domain Calculations
  // ===========================================================================
  let state = {
    calcMode: 'target_hit', // 'target_hit' | 'first_launch'
    targetTime: '22:50:00', // HH:mm:ss (UTC, 24-hour)
    globalWaitTime: 300,    // seconds (5 min default)
    arrivalInterval: 0,     // seconds between consecutive active teams' arrival
    strongholds: getDefaultStrongholds(),
    selectedStrongholdId: 'sh_1',
    leaders: []
  };

  // Track which leaders have their collapsible settings drawer open in Section 1.2
  const expandedLeaderIds = new Set();

  function normalizeStrongholdsAndLeaders() {
    state.arrivalInterval = Math.max(0, parseInt(state.arrivalInterval, 10) || 0);

    if (!Array.isArray(state.strongholds) || state.strongholds.length === 0) {
      state.strongholds = getDefaultStrongholds();
    }

    const validIds = state.strongholds.map((s) => s.id);
    if (!state.selectedStrongholdId || !validIds.includes(state.selectedStrongholdId)) {
      state.selectedStrongholdId = state.strongholds[0].id;
    }

    if (!Array.isArray(state.leaders)) {
      state.leaders = [];
    }

    state.leaders.forEach((leader) => {
      if (leader.power === undefined || leader.power === null) {
        leader.power = '';
      } else {
        leader.power = String(leader.power);
      }
      if (!leader.marches || typeof leader.marches !== 'object') {
        leader.marches = {};
      }
      const fallbackMin = parseInt(leader.marchMin, 10) || 0;
      const fallbackSec = parseInt(leader.marchSec, 10) || 0;

      state.strongholds.forEach((sh, idx) => {
        if (!leader.marches[sh.id] || typeof leader.marches[sh.id] !== 'object') {
          leader.marches[sh.id] = {
            min: idx === 0 ? fallbackMin : 0,
            sec: idx === 0 ? fallbackSec : 30
          };
        } else {
          leader.marches[sh.id].min = Math.max(0, parseInt(leader.marches[sh.id].min, 10) || 0);
          leader.marches[sh.id].sec = Math.max(0, parseInt(leader.marches[sh.id].sec, 10) || 0);
        }
      });

      delete leader.marchMin;
      delete leader.marchSec;
    });
  }

  // Translate unmodified default stronghold/leader names when switching language
  function localizeDefaultNamesOnLangSwitch() {
    state.strongholds.forEach((sh) => {
      const m = /^(?:據點\s*(\d+)|Stronghold\s*(\d+))$/i.exec((sh.name || '').trim());
      if (m) {
        const num = m[1] || m[2];
        sh.name = t('default.strongholdName', { num });
      }
    });

    state.leaders.forEach((leader) => {
      const m = /^(?:隊長\s*([A-Z0-9]+)|Leader\s*([A-Z0-9]+))$/i.exec((leader.name || '').trim());
      if (m) {
        const char = m[1] || m[2];
        leader.name = t('default.leaderName', { char });
      }
    });
  }

  function getSelectedStronghold() {
    if (!Array.isArray(state.strongholds) || state.strongholds.length === 0) {
      return { id: 'sh_1', name: t('default.strongholdName', { num: 1 }) };
    }
    return state.strongholds.find((s) => s.id === state.selectedStrongholdId) || state.strongholds[0];
  }

  function getLeaderMarch(leader, shId = state.selectedStrongholdId) {
    const entry = leader?.marches?.[shId];
    return {
      min: Math.max(0, parseInt(entry?.min, 10) || 0),
      sec: Math.max(0, parseInt(entry?.sec, 10) || 0)
    };
  }

  function setLeaderMarch(leader, shId, minVal, secVal) {
    if (!leader.marches || typeof leader.marches !== 'object') {
      leader.marches = {};
    }
    let m = Math.max(0, parseInt(minVal, 10) || 0);
    let s = Math.max(0, parseInt(secVal, 10) || 0);
    if (s >= 60) {
      m += Math.floor(s / 60);
      s %= 60;
    }
    leader.marches[shId] = { min: m, sec: s };
  }

  function getLeaderWaitSeconds(leader) {
    return (leader.waitTime !== undefined && leader.waitTime !== null)
      ? parseInt(leader.waitTime, 10)
      : state.globalWaitTime;
  }

  function formatLeaderDrawerSummary(leader) {
    const mObj = getLeaderMarch(leader, state.selectedStrongholdId);
    const waitLabel = (leader.waitTime === null || leader.waitTime === undefined)
      ? t('leader.drawerSummaryGlobal')
      : `${Math.round(parseInt(leader.waitTime, 10) / 60)}m`;
    return `${mObj.min}:${pad(mObj.sec)} · ${waitLabel}`;
  }

  function getActiveLeaders() {
    return (state.leaders || []).filter((l) => l.enabled !== false);
  }

  function getRosterMaxDurationSec() {
    const activeLeaders = getActiveLeaders();
    if (activeLeaders.length === 0) {
      return state.globalWaitTime;
    }
    const intervalSec = Math.max(0, parseInt(state.arrivalInterval, 10) || 0);
    const effectiveLeads = activeLeaders.map((l, idx) => {
      const mObj = getLeaderMarch(l, state.selectedStrongholdId);
      const durationSec = (mObj.min * 60 + mObj.sec) + getLeaderWaitSeconds(l);
      return durationSec - idx * intervalSec;
    });
    return Math.max(...effectiveLeads);
  }

  function getParsedInputUtcTimestamp() {
    const parts = (state.targetTime || '22:50:00').split(':');
    const h = parseInt(parts[0] || '0', 10);
    const m = parseInt(parts[1] || '0', 10);
    const s = parseInt(parts[2] || '0', 10);

    const now = new Date();
    let inputMs = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), h, m, s);

    if (inputMs - now.getTime() < -30 * 60 * 1000) {
      inputMs += 24 * 60 * 60 * 1000;
    }
    return inputMs;
  }

  function getHitTimestamp() {
    const inputMs = getParsedInputUtcTimestamp();
    if (state.calcMode === 'first_launch') {
      return inputMs + getRosterMaxDurationSec() * 1000;
    }
    return inputMs;
  }

  function getFirstLaunchTimestamp() {
    const inputMs = getParsedInputUtcTimestamp();
    if (state.calcMode === 'first_launch') {
      return inputMs;
    }
    return inputMs - getRosterMaxDurationSec() * 1000;
  }

  function calculateLeaderTimes(leader) {
    const baseHitMs = getHitTimestamp();
    const activeLeaders = getActiveLeaders();
    const activeIdx = activeLeaders.findIndex((l) => l.id === leader.id);
    const intervalSec = Math.max(0, parseInt(state.arrivalInterval, 10) || 0);
    const arrivalOffsetSec = activeIdx >= 0 ? activeIdx * intervalSec : 0;

    const hitMs = baseHitMs + arrivalOffsetSec * 1000;
    const mObj = getLeaderMarch(leader, state.selectedStrongholdId);
    const marchSec = mObj.min * 60 + mObj.sec;
    const waitSec = getLeaderWaitSeconds(leader);
    const durationSec = marchSec + waitSec;
    const effectiveLeadSec = durationSec - arrivalOffsetSec;

    const launchTimestamp = hitMs - durationSec * 1000;
    const departTimestamp = hitMs - marchSec * 1000;
    const maxLeadSec = getRosterMaxDurationSec();
    const isEnabled = leader.enabled !== false;
    const isFirstLead = isEnabled && (effectiveLeadSec === maxLeadSec);
    const delayFromFirstSec = Math.max(0, maxLeadSec - effectiveLeadSec);

    return {
      launchDate: new Date(launchTimestamp),
      departDate: new Date(departTimestamp),
      hitDate: new Date(hitMs),
      marchMin: mObj.min,
      marchSec: mObj.sec,
      totalMarchSec: marchSec,
      waitSec,
      durationSec,
      arrivalOffsetSec,
      delayFromFirstSec,
      isFirstLead,
      launchTimestamp,
      departTimestamp,
      hitTimestamp: hitMs
    };
  }

  function computeLeaderCountdownStatus(times, nowMs = Date.now()) {
    const remainingLaunchSec = Math.floor((times.launchTimestamp - nowMs) / 1000);
    const remainingHitSec = Math.floor((times.hitTimestamp - nowMs) / 1000);

    if (remainingHitSec < 0) {
      return {
        statusClass: 'status-passed',
        statusText: t('status.passed'),
        cardStateClass: 'state-passed'
      };
    }

    if (remainingLaunchSec <= 0 && remainingHitSec > 0) {
      if (nowMs < times.departTimestamp) {
        const waitRemain = Math.floor((times.departTimestamp - nowMs) / 1000);
        return {
          statusClass: 'status-soon',
          statusText: t('status.waitingDepart', { time: formatTimeHMS(waitRemain) }),
          cardStateClass: 'state-active'
        };
      }
      return {
        statusClass: 'status-marching',
        statusText: t('status.marching', { time: formatTimeHMS(remainingHitSec) }),
        cardStateClass: 'state-active'
      };
    }

    if (remainingLaunchSec <= 60 && remainingLaunchSec > 0) {
      return {
        statusClass: 'status-soon',
        statusText: t('status.soon', { sec: remainingLaunchSec }),
        cardStateClass: 'state-soon'
      };
    }

    return {
      statusClass: 'status-waiting',
      statusText: t('status.countdown', { time: formatFullHMS(remainingLaunchSec) }),
      cardStateClass: ''
    };
  }

  // ===========================================================================
  // 4. Persistence & URL State Sharing
  // ===========================================================================
  function saveStateToLocalStorage() {
    try {
      localStorage.setItem(STORAGE_KEY_STATE, JSON.stringify(state));
    } catch (e) {
      console.warn('Storage save failed:', e);
    }
  }

  function loadStateFromLocalStorage() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_STATE);
      if (saved) {
        state = { ...state, ...JSON.parse(saved) };
      } else {
        state.leaders = getDefaultLeaders();
      }
    } catch (e) {
      state.leaders = getDefaultLeaders();
    }
    normalizeStrongholdsAndLeaders();
  }

  function loadStateFromUrlHash() {
    if (!window.location.hash || window.location.hash.length < 5) return false;
    try {
      const params = new URLSearchParams(window.location.hash.substring(1));
      const dataParam = params.get('data');
      if (dataParam) {
        const decoded = decodeURIComponent(escape(atob(dataParam)));
        const parsed = JSON.parse(decoded);
        if (parsed && Array.isArray(parsed.leaders)) {
          state = { ...state, ...parsed };
          normalizeStrongholdsAndLeaders();
          return true;
        }
      }
    } catch (e) {
      console.warn('Failed to parse URL hash data:', e);
    }
    return false;
  }

  function getShareableUrl() {
    const exportState = {
      calcMode: state.calcMode,
      targetTime: state.targetTime,
      globalWaitTime: state.globalWaitTime,
      arrivalInterval: state.arrivalInterval,
      strongholds: state.strongholds,
      selectedStrongholdId: state.selectedStrongholdId,
      leaders: state.leaders
    };
    const b64 = btoa(unescape(encodeURIComponent(JSON.stringify(exportState))));
    const baseUrl = window.location.origin + window.location.pathname;
    return `${baseUrl}#data=${encodeURIComponent(b64)}`;
  }

  function loadSavedPresets() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_PRESETS);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  // ===========================================================================
  // 5. DOM Element References
  // ===========================================================================
  const elCurrentUtcTime = document.getElementById('currentUtcTime');
  const elCurrentUtcDate = document.getElementById('currentUtcDate');
  const elLangSelect = document.getElementById('langSelect');

  // 1.1 & 2.1 Stronghold Elements
  const elStrongholdConfigList = document.getElementById('strongholdConfigList');
  const elStrongholdTabs = document.getElementById('strongholdTabs');

  // 1.2 Roster Input Elements
  const elRosterTbody = document.getElementById('rosterTbody');
  const elEmptyState = document.getElementById('emptyState');
  const elLeaderCountBadge = document.getElementById('leaderCountBadge');
  const elCheckAllLeaders = document.getElementById('checkAllLeaders');
  const elBtnAddLeader = document.getElementById('btnAddLeader');
  const elBtnLoadExample = document.getElementById('btnLoadExample');

  // 2.2 - 2.5 Tactical Setting Elements
  const elBtnModeTarget = document.getElementById('btnModeTarget');
  const elBtnModeFirst = document.getElementById('btnModeFirst');
  const elTargetTimeLabel = document.getElementById('targetTimeLabel');
  const elStepperTzPill = document.getElementById('stepperTzPill');
  const elTargetHour = document.getElementById('targetHour');
  const elTargetMinute = document.getElementById('targetMinute');
  const elTargetSecond = document.getElementById('targetSecond');
  const elGlobalWaitTime = document.getElementById('globalWaitTime');
  const elArrivalInterval = document.getElementById('arrivalInterval');
  const elBtnSetCurrentUtc = document.getElementById('btnSetCurrentUtc');
  const elBtnNextRound5 = document.getElementById('btnNextRound5');
  const elBtnNextRound10 = document.getElementById('btnNextRound10');

  // 3. Live Output & Broadcast Elements
  const elSummaryCard1Title = document.getElementById('summaryCard1Title');
  const elSummaryTargetUtc = document.getElementById('summaryTargetUtc');
  const elSummaryCard1Sub = document.getElementById('summaryCard1Sub');
  const elSummaryCard2Title = document.getElementById('summaryCard2Title');
  const elSummaryTargetSecondary = document.getElementById('summaryTargetSecondary');
  const elSummaryTargetSecondarySub = document.getElementById('summaryTargetSecondarySub');
  const elSummaryCard3Title = document.getElementById('summaryCard3Title');
  const elSummaryTargetCountdown = document.getElementById('summaryTargetCountdown');
  const elSummaryTargetStatus = document.getElementById('summaryTargetStatus');
  const elMetaStrongholdPreview = document.getElementById('metaStrongholdPreview');
  const elMetaActiveCount = document.getElementById('metaActiveCount');
  const elMetaHitPreview = document.getElementById('metaHitPreview');
  const elLeaderOutputList = document.getElementById('leaderOutputList');
  const elExportTextarea = document.getElementById('exportTextarea');
  const elBtnCopyExport = document.getElementById('btnCopyExport');
  const elBtnCopyShareUrl = document.getElementById('btnCopyShareUrl');
  const elCopyFeedback = document.getElementById('copyFeedback');

  // Presets, Clear Data & Batch Import Modal Elements
  const elPresetNameInput = document.getElementById('presetNameInput');
  const elBtnSavePreset = document.getElementById('btnSavePreset');
  const elBtnClearAllData = document.getElementById('btnClearAllData');
  const elSavedPresetsList = document.getElementById('savedPresetsList');
  const elClearDataModal = document.getElementById('clearDataModal');
  const elBtnCloseClearModal = document.getElementById('btnCloseClearModal');
  const elBtnCancelClear = document.getElementById('btnCancelClear');
  const elBtnSubmitClear = document.getElementById('btnSubmitClear');
  const elClearOptStrongholds = document.getElementById('clearOptStrongholds');
  const elClearOptLeaders = document.getElementById('clearOptLeaders');
  const elClearOptPresets = document.getElementById('clearOptPresets');
  const elBatchModal = document.getElementById('batchModal');
  const elBtnBatchImport = document.getElementById('btnBatchImport');
  const elBtnCloseBatchModal = document.getElementById('btnCloseBatchModal');
  const elBtnCancelBatch = document.getElementById('btnCancelBatch');
  const elBtnSubmitBatch = document.getElementById('btnSubmitBatch');
  const elBatchTextarea = document.getElementById('batchTextarea');

  // ===========================================================================
  // 6. Clipboard & Feedback Helpers
  // ===========================================================================
  function showCopyFeedback(msg) {
    elCopyFeedback.textContent = msg || t('feedback.copied');
    elCopyFeedback.classList.add('show');
    setTimeout(() => {
      elCopyFeedback.classList.remove('show');
    }, 2500);
  }

  function fallbackCopyText(text) {
    const tempInput = document.createElement('textarea');
    tempInput.value = text;
    document.body.appendChild(tempInput);
    tempInput.select();
    try {
      document.execCommand('copy');
      showCopyFeedback();
    } catch (err) {
      alert(t('feedback.copyFailed'));
    }
    document.body.removeChild(tempInput);
  }

  function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text)
        .then(() => showCopyFeedback())
        .catch(() => fallbackCopyText(text));
    } else {
      fallbackCopyText(text);
    }
  }

  // ===========================================================================
  // 7. Section 1.1 & 2.1: Stronghold Management & Target Selection
  // ===========================================================================
  function renderStrongholdConfigList() {
    if (!elStrongholdConfigList) return;
    const canDelete = state.strongholds.length > 1;
    const placeholder = escapeHtml(t('s1_1.shPlaceholder'));

    const itemsHtml = state.strongholds.map((sh, idx) => {
      const ariaLabel = escapeHtml(t('s1_1.shAriaLabel', { num: idx + 1 }));
      const delTitle = canDelete
        ? escapeHtml(t('s1_1.btnDelTitle', { name: sh.name }))
        : escapeHtml(t('s1_1.btnDelDisabledTitle'));
      return `
        <div class="sh-config-item" data-sh-id="${sh.id}">
          <span class="sh-config-num">🏰 #${idx + 1}</span>
          <input type="text" class="form-input sh-config-name-input" data-sh-id="${sh.id}" value="${escapeHtml(sh.name)}" maxlength="20" placeholder="${placeholder}" aria-label="${ariaLabel}">
          <button type="button" class="btn-icon btn-del-sh" data-sh-id="${sh.id}" ${canDelete ? '' : 'disabled'} title="${delTitle}">❌</button>
        </div>
      `;
    }).join('');

    const addBtnHtml = `
      <button type="button" class="sh-config-item sh-config-add-btn" id="btnAddStronghold" title="${escapeHtml(t('s1_1.btnAddTitle'))}">
        <span class="sh-add-label">${escapeHtml(t('s1_1.btnAdd'))}</span>
      </button>
    `;

    elStrongholdConfigList.innerHTML = itemsHtml + addBtnHtml;

    elStrongholdConfigList.querySelectorAll('.sh-config-name-input').forEach((input) => {
      const handleRename = (e) => {
        const shId = e.target.getAttribute('data-sh-id');
        renameStrongholdById(shId, e.target.value);
      };
      input.addEventListener('input', handleRename);
      input.addEventListener('change', handleRename);
    });

    elStrongholdConfigList.querySelectorAll('.btn-del-sh').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const shId = e.currentTarget.getAttribute('data-sh-id');
        deleteStrongholdById(shId);
      });
    });

    elStrongholdConfigList.querySelectorAll('.sh-config-add-btn').forEach((btn) => {
      btn.addEventListener('click', addStronghold);
    });
  }

  function renderStrongholdSelectTabs() {
    if (!elStrongholdTabs) return;
    const activeTagText = escapeHtml(t('s2_1.activeTag'));

    elStrongholdTabs.innerHTML = state.strongholds.map((sh) => {
      const isSelected = sh.id === state.selectedStrongholdId;
      return `
        <button type="button" class="stronghold-tab-btn ${isSelected ? 'active' : ''}" data-sh-id="${sh.id}" role="tab" aria-selected="${isSelected}">
          <span class="sh-tab-icon">${isSelected ? '🎯' : '🏰'}</span>
          <span class="sh-tab-name">${escapeHtml(sh.name)}</span>
          ${isSelected ? `<span class="sh-tab-active-tag">${activeTagText}</span>` : ''}
        </button>
      `;
    }).join('');

    elStrongholdTabs.querySelectorAll('.stronghold-tab-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const shId = e.currentTarget.getAttribute('data-sh-id');
        selectStronghold(shId);
      });
    });
  }

  function renderStrongholdControlPanel() {
    normalizeStrongholdsAndLeaders();
    renderStrongholdConfigList();
    renderStrongholdSelectTabs();
  }

  function selectStronghold(shId) {
    if (!shId || state.selectedStrongholdId === shId) return;
    if (!state.strongholds.some((s) => s.id === shId)) return;

    state.selectedStrongholdId = shId;
    normalizeStrongholdsAndLeaders();
    renderStrongholdSelectTabs();
    commitCalculationUpdate();
  }

  function addStronghold() {
    const nextNum = state.strongholds.length + 1;
    const newId = createId('sh');
    const newName = t('default.strongholdName', { num: nextNum });

    state.strongholds.push({ id: newId, name: newName });
    state.leaders.forEach((leader) => {
      if (!leader.marches || typeof leader.marches !== 'object') {
        leader.marches = {};
      }
      leader.marches[newId] = { min: 0, sec: 30 };
    });

    normalizeStrongholdsAndLeaders();
    renderStrongholdControlPanel();
    commitRosterRender();
    showCopyFeedback(t('feedback.shAdded', { name: newName }));
  }

  function deleteStrongholdById(delId) {
    if (state.strongholds.length <= 1) {
      alert(t('alert.minOneStronghold'));
      return;
    }
    const targetSh = state.strongholds.find((s) => s.id === delId);
    if (!targetSh) return;

    if (!confirm(t('confirm.deleteStronghold', { name: targetSh.name }))) {
      return;
    }

    state.strongholds = state.strongholds.filter((s) => s.id !== delId);
    state.leaders.forEach((leader) => {
      if (leader.marches && leader.marches[delId]) {
        delete leader.marches[delId];
      }
    });
    if (state.selectedStrongholdId === delId) {
      state.selectedStrongholdId = state.strongholds[0].id;
    }

    normalizeStrongholdsAndLeaders();
    renderStrongholdControlPanel();
    commitRosterRender();
    showCopyFeedback(t('feedback.shDeleted', { name: targetSh.name }));
  }

  function renameStrongholdById(shId, newNameRaw) {
    const targetSh = state.strongholds.find((s) => s.id === shId);
    if (!targetSh) return;
    targetSh.name = (newNameRaw || '').trim() || t('s1_1.unnamedStronghold');

    renderStrongholdSelectTabs();

    if (elRosterTbody) {
      elRosterTbody.querySelectorAll(`.sh-march-item[data-sh-id="${shId}"] .sh-march-name`).forEach((el) => {
        el.textContent = targetSh.name;
      });
    }

    commitCalculationUpdate();
  }

  // ===========================================================================
  // 8. Section 1.2 & 3.1: Leader Input Cards & Tactical Output Cards
  // ===========================================================================
  function syncHeaderMetaAndCheckAll() {
    const activeLeaders = getActiveLeaders();
    const totalCount = state.leaders.length;
    const activeCount = activeLeaders.length;
    const activeSh = getSelectedStronghold();

    if (totalCount === 0) {
      elLeaderCountBadge.textContent = t('leader.badgeZero');
    } else if (activeCount === totalCount) {
      elLeaderCountBadge.textContent = t('leader.badgeAllActive', { total: totalCount });
    } else {
      elLeaderCountBadge.textContent = t('leader.badgePartialActive', { active: activeCount, total: totalCount });
    }

    if (elMetaStrongholdPreview) {
      elMetaStrongholdPreview.textContent = t('s3_1.metaStronghold', { sh: activeSh.name });
    }
    if (elMetaActiveCount) {
      elMetaActiveCount.textContent = totalCount === 0
        ? t('s3_1.metaNoTeams')
        : t('s3_1.metaActiveTeams', { active: activeCount, total: totalCount });
    }
    if (elMetaHitPreview) {
      const hitUtcStr = formatUtcOutput(new Date(getHitTimestamp()));
      elMetaHitPreview.textContent = t('s3_1.metaHitPreview', { time: hitUtcStr });
    }
    if (elCheckAllLeaders) {
      elCheckAllLeaders.checked = totalCount > 0 && activeCount === totalCount;
      elCheckAllLeaders.indeterminate = activeCount > 0 && activeCount < totalCount;
    }
  }

  function updateAllDrawerSummariesInPlace() {
    state.leaders.forEach((leader) => {
      const summaryEl = document.getElementById(`drawer-summary-${leader.id}`);
      if (summaryEl) {
        summaryEl.textContent = formatLeaderDrawerSummary(leader);
      }
    });
  }

  function moveLeaderByOffset(leaderId, offset) {
    const idx = state.leaders.findIndex((l) => l.id === leaderId);
    if (idx === -1) return;
    const targetIdx = idx + offset;
    if (targetIdx < 0 || targetIdx >= state.leaders.length) return;

    const temp = state.leaders[idx];
    state.leaders[idx] = state.leaders[targetIdx];
    state.leaders[targetIdx] = temp;

    commitRosterRender();
  }

  function renderRoster() {
    normalizeStrongholdsAndLeaders();
    syncHeaderMetaAndCheckAll();

    if (state.leaders.length === 0) {
      elRosterTbody.innerHTML = '';
      elEmptyState.style.display = 'block';
      renderLeaderOutputList();
      updateExportText();
      return;
    }

    elEmptyState.style.display = 'none';

    const unitMin = escapeHtml(t('leader.unitMin'));
    const unitSec = escapeHtml(t('leader.unitSec'));

    elRosterTbody.innerHTML = state.leaders.map((leader, index) => {
      const isEnabled = leader.enabled !== false;
      const isExpanded = expandedLeaderIds.has(leader.id);
      const cardStateClass = isEnabled ? '' : 'state-disabled';
      const drawerSummary = formatLeaderDrawerSummary(leader);
      const isFirstItem = index === 0;
      const isLastItem = index === state.leaders.length - 1;

      const strongholdMarchItemsHtml = state.strongholds.map((sh) => {
        const mObj = getLeaderMarch(leader, sh.id);
        const minAria = escapeHtml(t('leader.marchMinAria', { name: sh.name }));
        const secAria = escapeHtml(t('leader.marchSecAria', { name: sh.name }));
        return `
          <div class="sh-march-item" data-sh-id="${sh.id}">
            <div class="sh-march-label">
              <span class="sh-march-icon">🏰</span>
              <span class="sh-march-name">${escapeHtml(sh.name)}</span>
            </div>
            <div class="march-input-group">
              <div class="march-input-sub">
                <input type="number" min="0" max="59" class="form-input input-sm-number leader-march-min"
                  value="${mObj.min}" data-id="${leader.id}" data-sh-id="${sh.id}" inputmode="numeric" placeholder="0" aria-label="${minAria}">
                <span class="march-unit">${unitMin}</span>
              </div>
              <span class="march-colon">:</span>
              <div class="march-input-sub">
                <input type="number" min="0" max="59" class="form-input input-sm-number leader-march-sec"
                  value="${mObj.sec}" data-id="${leader.id}" data-sh-id="${sh.id}" inputmode="numeric" placeholder="0" aria-label="${secAria}">
                <span class="march-unit">${unitSec}</span>
              </div>
            </div>
          </div>
        `;
      }).join('');

      const checkTitle = escapeHtml(isEnabled ? t('leader.checkExcludeTitle') : t('leader.checkIncludeTitle'));
      const moveUpTitle = escapeHtml(isFirstItem ? t('leader.moveUpDisabledTitle') : t('leader.moveUpTitle'));
      const moveDownTitle = escapeHtml(isLastItem ? t('leader.moveDownDisabledTitle') : t('leader.moveDownTitle'));

      return `
        <div class="leader-card ${cardStateClass}" data-id="${leader.id}">
          <div class="card-header-row">
            <div class="card-identity-group">
              <label class="leader-checkbox-label" title="${checkTitle}">
                <input type="checkbox" class="leader-check" data-id="${leader.id}" ${isEnabled ? 'checked' : ''}>
                <span class="leader-order-num">#${index + 1}</span>
              </label>
              <div class="leader-name-box">
                <input type="text" class="form-input leader-name-input" value="${escapeHtml(leader.name)}"
                  data-id="${leader.id}" placeholder="${escapeHtml(t('leader.namePlaceholder'))}" maxlength="20" aria-label="${escapeHtml(t('leader.nameAriaLabel'))}">
              </div>
              <div class="leader-power-box" title="${escapeHtml(t('leader.powerBoxTitle'))}">
                <span class="power-prefix">💪</span>
                <input type="text" class="form-input leader-power-input" value="${escapeHtml(leader.power || '')}"
                  data-id="${leader.id}" placeholder="${escapeHtml(t('leader.powerPlaceholder'))}" maxlength="16" aria-label="${escapeHtml(t('leader.powerAriaLabel'))}">
              </div>
            </div>
            <div class="card-action-group">
              <div class="leader-order-btns" role="group" aria-label="${escapeHtml(t('leader.orderGroupAria'))}">
                <button type="button" class="btn-icon btn-move-up" data-id="${leader.id}" ${isFirstItem ? 'disabled' : ''} title="${moveUpTitle}">▲</button>
                <button type="button" class="btn-icon btn-move-down" data-id="${leader.id}" ${isLastItem ? 'disabled' : ''} title="${moveDownTitle}">▼</button>
              </div>
              <button type="button" class="btn-leader-drawer-toggle ${isExpanded ? 'is-open' : ''}" data-id="${leader.id}" aria-expanded="${isExpanded}" title="${escapeHtml(t('leader.drawerToggleTitle'))}">
                <span class="drawer-btn-text">${escapeHtml(t('leader.drawerBtnText'))}</span>
                <span class="drawer-toggle-summary" id="drawer-summary-${leader.id}">${drawerSummary}</span>
                <span class="drawer-toggle-caret">${isExpanded ? '▴' : '▾'}</span>
              </button>
              <button type="button" class="btn-icon btn-delete" data-id="${leader.id}" title="${escapeHtml(t('leader.deleteTitle'))}">❌</button>
            </div>
          </div>

          <div class="leader-config-drawer ${isExpanded ? 'is-open' : ''}" id="leader-drawer-${leader.id}" style="display: ${isExpanded ? 'flex' : 'none'};">
            <div class="drawer-wait-row">
              <label class="setting-item-label" for="wait-select-${leader.id}">
                <span class="icon">⏱️</span> ${escapeHtml(t('leader.waitLabel'))}
              </label>
              <select id="wait-select-${leader.id}" class="form-select leader-wait-time" data-id="${leader.id}">
                <option value="default" ${leader.waitTime === null || leader.waitTime === undefined ? 'selected' : ''}>${escapeHtml(t('leader.waitFollowGlobal', { min: state.globalWaitTime / 60 }))}</option>
                <option value="60" ${leader.waitTime === 60 ? 'selected' : ''}>${escapeHtml(t('leader.wait1m'))}</option>
                <option value="180" ${leader.waitTime === 180 ? 'selected' : ''}>${escapeHtml(t('leader.wait3m'))}</option>
                <option value="300" ${leader.waitTime === 300 ? 'selected' : ''}>${escapeHtml(t('leader.wait5m'))}</option>
                <option value="600" ${leader.waitTime === 600 ? 'selected' : ''}>${escapeHtml(t('leader.wait10m'))}</option>
              </select>
            </div>

            <div class="drawer-march-section">
              <div class="setting-march-header">
                <span class="setting-item-label">
                  <span class="icon">🏃</span> ${escapeHtml(t('leader.marchSectionHeader'))}
                </span>
              </div>
              <div class="stronghold-marches-grid">
                ${strongholdMarchItemsHtml}
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');

    attachRosterInputEvents();
    renderLeaderOutputList();
    updateExportText();
  }

  function attachRosterInputEvents() {
    elRosterTbody.querySelectorAll('.btn-leader-drawer-toggle').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        if (!id) return;
        const drawer = document.getElementById(`leader-drawer-${id}`);
        const isNowOpen = !expandedLeaderIds.has(id);

        if (isNowOpen) {
          expandedLeaderIds.add(id);
        } else {
          expandedLeaderIds.delete(id);
        }

        e.currentTarget.classList.toggle('is-open', isNowOpen);
        e.currentTarget.setAttribute('aria-expanded', String(isNowOpen));
        const caretSpan = e.currentTarget.querySelector('.drawer-toggle-caret');
        if (caretSpan) caretSpan.textContent = isNowOpen ? '▴' : '▾';

        if (drawer) {
          drawer.classList.toggle('is-open', isNowOpen);
          drawer.style.display = isNowOpen ? 'flex' : 'none';
        }
      });
    });

    elRosterTbody.querySelectorAll('.leader-check').forEach((checkbox) => {
      checkbox.addEventListener('change', (e) => {
        const id = e.target.getAttribute('data-id');
        const leader = state.leaders.find((l) => l.id === id);
        if (leader) {
          leader.enabled = e.target.checked;
          commitRosterRender();
        }
      });
    });

    elRosterTbody.querySelectorAll('.leader-name-input').forEach((input) => {
      input.addEventListener('input', (e) => {
        const id = e.target.getAttribute('data-id');
        const leader = state.leaders.find((l) => l.id === id);
        if (leader) {
          leader.name = e.target.value;
          commitCalculationUpdate();
        }
      });
    });

    elRosterTbody.querySelectorAll('.leader-power-input').forEach((input) => {
      const handlePower = (e) => {
        const id = e.target.getAttribute('data-id');
        const leader = state.leaders.find((l) => l.id === id);
        if (leader) {
          leader.power = e.target.value;
          updateRosterCalculationsInPlace();
          saveStateToLocalStorage();
        }
      };
      input.addEventListener('input', handlePower);
      input.addEventListener('change', handlePower);
    });

    elRosterTbody.querySelectorAll('.btn-move-up').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        moveLeaderByOffset(id, -1);
      });
    });

    elRosterTbody.querySelectorAll('.btn-move-down').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        moveLeaderByOffset(id, 1);
      });
    });

    elRosterTbody.querySelectorAll('.leader-march-min').forEach((input) => {
      const handleMarchMin = (e) => {
        const id = e.target.getAttribute('data-id');
        const shId = e.target.getAttribute('data-sh-id') || state.selectedStrongholdId;
        const leader = state.leaders.find((l) => l.id === id);
        if (leader) {
          const cur = getLeaderMarch(leader, shId);
          const newMin = Math.max(0, parseInt(e.target.value, 10) || 0);
          setLeaderMarch(leader, shId, newMin, cur.sec);
          commitCalculationUpdate();
        }
      };
      input.addEventListener('input', handleMarchMin);
      input.addEventListener('change', handleMarchMin);
    });

    elRosterTbody.querySelectorAll('.leader-march-sec').forEach((input) => {
      const handleMarchSec = (e) => {
        const id = e.target.getAttribute('data-id');
        const shId = e.target.getAttribute('data-sh-id') || state.selectedStrongholdId;
        const leader = state.leaders.find((l) => l.id === id);
        if (leader) {
          const cur = getLeaderMarch(leader, shId);
          const newSec = Math.max(0, parseInt(e.target.value, 10) || 0);
          setLeaderMarch(leader, shId, cur.min, newSec);
          if (e.type === 'change') {
            const normalized = getLeaderMarch(leader, shId);
            e.target.value = normalized.sec;
            const minInput = elRosterTbody.querySelector(`.leader-march-min[data-id="${id}"][data-sh-id="${shId}"]`);
            if (minInput) minInput.value = normalized.min;
          }
          commitCalculationUpdate();
        }
      };
      input.addEventListener('input', handleMarchSec);
      input.addEventListener('change', handleMarchSec);
    });

    elRosterTbody.querySelectorAll('.leader-wait-time').forEach((select) => {
      select.addEventListener('change', (e) => {
        const id = e.target.getAttribute('data-id');
        const leader = state.leaders.find((l) => l.id === id);
        if (leader) {
          const val = e.target.value;
          leader.waitTime = val === 'default' ? null : parseInt(val, 10);
          commitCalculationUpdate();
        }
      });
    });

    elRosterTbody.querySelectorAll('.btn-delete').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        const targetLeader = state.leaders.find((l) => l.id === id);
        if (!targetLeader) return;

        if (!confirm(t('confirm.deleteLeader', { name: targetLeader.name }))) {
          return;
        }

        expandedLeaderIds.delete(id);
        state.leaders = state.leaders.filter((l) => l.id !== id);
        commitRosterRender();
        showCopyFeedback(t('feedback.leaderDeleted', { name: targetLeader.name }));
      });
    });
  }

  function renderLeaderOutputList() {
    if (!elLeaderOutputList) return;
    syncHeaderMetaAndCheckAll();

    if (state.leaders.length === 0) {
      elLeaderOutputList.innerHTML = `
        <div class="output-empty-hint">${escapeHtml(t('s3_1.emptyNoLeaders'))}</div>
      `;
      return;
    }

    const activeLeaders = getActiveLeaders();
    if (activeLeaders.length === 0) {
      elLeaderOutputList.innerHTML = `
        <div class="output-empty-hint">${escapeHtml(t('s3_1.emptyNoActive'))}</div>
      `;
      return;
    }

    const activeSh = getSelectedStronghold();
    const nowMs = Date.now();

    elLeaderOutputList.innerHTML = activeLeaders.map((leader, idx) => {
      const times = calculateLeaderTimes(leader);
      const { statusClass, statusText, cardStateClass } = computeLeaderCountdownStatus(times, nowMs);

      const launchUtc = formatUtcOutput(times.launchDate, times.hitDate);
      const departUtc = formatUtcOutput(times.departDate, times.hitDate);
      const hitUtc = formatUtcOutput(times.hitDate);
      const marchStr = `${pad(times.marchMin)}:${pad(times.marchSec)}`;
      const waitMin = times.waitSec / 60;

      const delayFromFirstSec = times.delayFromFirstSec;
      const roleTag = times.isFirstLead
        ? `<span class="badge-first-lead">${escapeHtml(t('s3_1.badgeFirstLead'))}</span>`
        : (delayFromFirstSec > 0
          ? `<span class="badge-delay" title="${escapeHtml(t('s3_1.badgeDelayTitle', { sec: delayFromFirstSec }))}">${escapeHtml(t('s3_1.badgeDelayText', { sec: delayFromFirstSec }))}</span>`
          : '');
      const powerTrimmed = (leader.power || '').trim();
      const powerBadge = powerTrimmed
        ? `<span class="badge-power" title="${escapeHtml(t('s3_1.badgePowerTitle'))}">💪 ${escapeHtml(powerTrimmed)}</span>`
        : '';

      return `
        <div class="leader-output-card ${cardStateClass}" data-id="${leader.id}">
          <div class="output-card-top">
            <div class="output-leader-identity">
              <span class="leader-order-num">#${idx + 1}</span>
              <span class="output-leader-name">${escapeHtml(leader.name)}</span>
              ${powerBadge}
              ${roleTag}
            </div>
            <div class="output-card-actions">
              <span class="status-pill ${statusClass}" id="status-pill-${leader.id}">
                ${escapeHtml(statusText)}
              </span>
              <button type="button" class="btn-icon btn-copy-single" data-id="${leader.id}" title="${escapeHtml(t('s3_1.btnCopySingleTitle'))}">📋</button>
            </div>
          </div>

          <div class="card-launch-banner">
            <div class="launch-banner-main">
              <div class="launch-title-row">
                <span class="launch-hero-title">${escapeHtml(t('s3_1.launchHeroTitle', { sh: activeSh.name }))}</span>
              </div>
              <div class="launch-hero-time-row">
                <span class="launch-hero-time">${launchUtc}</span>
                <span class="launch-hero-tz">UTC</span>
              </div>
            </div>
            <div class="output-march-meta">
              <span class="output-meta-chip">${escapeHtml(t('s3_1.metaMarch', { march: marchStr }))}</span>
              <span class="output-meta-chip">${escapeHtml(t('s3_1.metaWait', { min: waitMin }))}</span>
            </div>
          </div>

          <div class="card-timeline-tracker">
            <div class="tracker-step tracker-launch">
              <span class="tracker-dot"></span>
              <div class="tracker-info">
                <span class="tracker-label">${escapeHtml(t('s3_1.stepLaunch'))}</span>
                <span class="tracker-time">${launchUtc}</span>
              </div>
            </div>
            <div class="tracker-arrow">➔</div>
            <div class="tracker-step tracker-depart">
              <span class="tracker-dot"></span>
              <div class="tracker-info">
                <span class="tracker-label">${escapeHtml(t('s3_1.stepDepart', { min: waitMin }))}</span>
                <span class="tracker-time">${departUtc}</span>
              </div>
            </div>
            <div class="tracker-arrow">➔</div>
            <div class="tracker-step tracker-hit">
              <span class="tracker-dot"></span>
              <div class="tracker-info">
                <span class="tracker-label">${escapeHtml(t('s3_1.stepHit', { sh: activeSh.name, march: marchStr }))}</span>
                <span class="tracker-time">${hitUtc}</span>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');

    elLeaderOutputList.querySelectorAll('.btn-copy-single').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        const leader = state.leaders.find((l) => l.id === id);
        if (leader) {
          const times = calculateLeaderTimes(leader);
          const launchUtc = formatUtcOutput(times.launchDate, times.hitDate);
          const hitUtc = formatUtcOutput(times.hitDate);
          const marchText = `${pad(times.marchMin)}:${pad(times.marchSec)}`;
          const waitMin = times.waitSec / 60;
          const leadTag = times.isFirstLead ? t('s3_1.singleCopyLeadTag') : '';
          const text = t('s3_1.singleCopyTemplate', {
            name: leader.name,
            leadTag,
            sh: activeSh.name,
            launch: launchUtc,
            waitMin,
            march: marchText,
            hit: hitUtc
          });
          copyToClipboard(text);
        }
      });
    });
  }

  function updateRosterCalculationsInPlace() {
    normalizeStrongholdsAndLeaders();
    updateAllDrawerSummariesInPlace();
    renderLeaderOutputList();
    updateExportText();
  }

  function commitRosterRender() {
    renderRoster();
    updateTargetSummaryBanner();
    saveStateToLocalStorage();
  }

  function commitCalculationUpdate() {
    updateRosterCalculationsInPlace();
    updateTargetSummaryBanner();
    saveStateToLocalStorage();
  }

  function updateRosterCountdowns(now = new Date()) {
    const nowMs = now.getTime();
    state.leaders.forEach((leader) => {
      const pill = document.getElementById(`status-pill-${leader.id}`);
      if (!pill) return;

      if (leader.enabled === false) {
        pill.className = 'status-pill status-disabled';
        pill.textContent = t('status.disabled');
        return;
      }

      const times = calculateLeaderTimes(leader);
      const { statusClass, statusText } = computeLeaderCountdownStatus(times, nowMs);
      pill.className = `status-pill ${statusClass}`;
      pill.textContent = statusText;
    });
  }

  // ===========================================================================
  // 9. Section 2.2 - 2.4: Mode Switch, Time Stepper & Quick Adjusters
  // ===========================================================================
  function updateModeTabUI() {
    if (state.calcMode === 'first_launch') {
      elBtnModeTarget.classList.remove('active');
      elBtnModeFirst.classList.add('active');
      elTargetTimeLabel.textContent = t('s2_4.labelFirstLaunch');
    } else {
      elBtnModeFirst.classList.remove('active');
      elBtnModeTarget.classList.add('active');
      elTargetTimeLabel.textContent = t('s2_4.labelTargetHit');
    }
    elStepperTzPill.textContent = 'UTC';
  }

  function switchMode(newMode) {
    if (state.calcMode === newMode) return;

    if (newMode === 'first_launch') {
      state.targetTime = formatUtcOutput(new Date(getFirstLaunchTimestamp()));
      state.calcMode = 'first_launch';
    } else {
      state.targetTime = formatUtcOutput(new Date(getHitTimestamp()));
      state.calcMode = 'target_hit';
    }

    updateModeTabUI();
    updateTimeInputsFromState();
    commitRosterRender();
  }

  function updateTimeInputsFromState() {
    const parts = (state.targetTime || '22:50:00').split(':');
    elTargetHour.value = pad(parseInt(parts[0] || '0', 10));
    elTargetMinute.value = pad(parseInt(parts[1] || '0', 10));
    elTargetSecond.value = pad(parseInt(parts[2] || '0', 10));
  }

  function syncTargetTimeFromInputs() {
    const clamp = (val, max) => Math.min(max, Math.max(0, isNaN(val) ? 0 : val));
    const h = clamp(parseInt(elTargetHour.value, 10), 23);
    const m = clamp(parseInt(elTargetMinute.value, 10), 59);
    const s = clamp(parseInt(elTargetSecond.value, 10), 59);

    state.targetTime = `${pad(h)}:${pad(m)}:${pad(s)}`;
    commitCalculationUpdate();
  }

  function adjustFieldValue(field, delta) {
    const fieldMap = {
      hour: { el: elTargetHour, mod: 24 },
      minute: { el: elTargetMinute, mod: 60 },
      second: { el: elTargetSecond, mod: 60 }
    };
    const cfg = fieldMap[field];
    if (!cfg) return;

    const cur = parseInt(cfg.el.value, 10) || 0;
    cfg.el.value = pad((cur + delta + cfg.mod) % cfg.mod);
    syncTargetTimeFromInputs();
  }

  let holdTimeout = null;
  let holdInterval = null;

  function startHold(field, delta, e) {
    if (e && e.type === 'touchstart' && e.cancelable) {
      e.preventDefault();
    }
    adjustFieldValue(field, delta);

    clearTimeout(holdTimeout);
    clearInterval(holdInterval);

    holdTimeout = setTimeout(() => {
      holdInterval = setInterval(() => adjustFieldValue(field, delta), 75);
    }, 280);
  }

  function stopHold() {
    clearTimeout(holdTimeout);
    clearInterval(holdInterval);
    holdTimeout = null;
    holdInterval = null;
  }

  function addSecondsToCurrentUtc(seconds) {
    const futureUtc = new Date(Date.now() + seconds * 1000);
    state.targetTime = getUtcTimeString(futureUtc);
    updateTimeInputsFromState();
    commitRosterRender();
  }

  function roundToNextMinuteMultiple(stepMinutes) {
    const now = new Date();
    const totalMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();
    const hasSeconds = now.getUTCSeconds() > 0 || now.getUTCMilliseconds() > 0;
    const baseMinutes = hasSeconds ? (totalMinutes + 1) : (totalMinutes + stepMinutes);
    const remainder = baseMinutes % stepMinutes;
    const targetMinutes = remainder === 0 ? baseMinutes : (baseMinutes + (stepMinutes - remainder));

    const targetH = Math.floor(targetMinutes / 60) % 24;
    const targetM = targetMinutes % 60;

    state.targetTime = `${pad(targetH)}:${pad(targetM)}:00`;
    updateTimeInputsFromState();
    commitRosterRender();
  }

  // ===========================================================================
  // 10. Section 3: Summary Banner, Clocks & Broadcast Export
  // ===========================================================================
  function updateTargetSummaryBanner() {
    const hitMs = getHitTimestamp();
    const firstLaunchMs = getFirstLaunchTimestamp();
    const nowMs = Date.now();

    const hitDiffSec = Math.floor((hitMs - nowMs) / 1000);
    const firstLaunchDiffSec = Math.floor((firstLaunchMs - nowMs) / 1000);
    const hitUtcStr = formatUtcOutput(new Date(hitMs));
    const firstUtcStr = formatUtcOutput(new Date(firstLaunchMs));

    const activeLeaders = getActiveLeaders();
    const longestLeader = activeLeaders.find((l) => calculateLeaderTimes(l).isFirstLead);
    const activeSh = getSelectedStronghold();

    if (state.calcMode === 'first_launch') {
      elSummaryCard1Title.textContent = t('summary.m2.card1Title', { sh: activeSh.name });
      elSummaryTargetUtc.textContent = `${state.targetTime} UTC`;
      if (longestLeader) {
        elSummaryCard1Sub.textContent = t('summary.m2.card1SubLongest', { sh: activeSh.name, leader: longestLeader.name });
      } else if (activeLeaders.length === 0) {
        elSummaryCard1Sub.textContent = t('summary.m2.card1SubNone');
      } else {
        elSummaryCard1Sub.textContent = t('summary.m2.card1SubDefault', { sh: activeSh.name });
      }

      elSummaryCard2Title.textContent = t('summary.m2.card2Title', { sh: activeSh.name });
      elSummaryTargetSecondary.textContent = `${hitUtcStr} UTC`;
      elSummaryTargetSecondarySub.textContent = t('summary.m2.card2Sub', { sh: activeSh.name });

      elSummaryCard3Title.textContent = t('summary.m2.card3Title');
      if (firstLaunchDiffSec < 0) {
        if (hitDiffSec < 0) {
          elSummaryTargetCountdown.textContent = t('summary.m2.hitDone');
          elSummaryTargetCountdown.className = 'summary-huge text-muted';
          elSummaryTargetStatus.textContent = t('summary.elapsed', { time: formatFullHMS(Math.abs(hitDiffSec)) });
        } else {
          elSummaryTargetCountdown.textContent = t('summary.m2.firstLaunched');
          elSummaryTargetCountdown.className = 'summary-huge text-gold';
          elSummaryTargetStatus.textContent = t('summary.m2.untilHit', { time: formatFullHMS(hitDiffSec) });
        }
      } else {
        elSummaryTargetCountdown.textContent = formatFullHMS(firstLaunchDiffSec);
        elSummaryTargetCountdown.className = 'summary-huge text-green';
        elSummaryTargetStatus.textContent = t('summary.m2.countingDown');
      }
    } else {
      elSummaryCard1Title.textContent = t('summary.m1.card1Title', { sh: activeSh.name });
      elSummaryTargetUtc.textContent = `${state.targetTime} UTC`;
      elSummaryCard1Sub.textContent = t('summary.m1.card1Sub', { sh: activeSh.name });

      elSummaryCard2Title.textContent = t('summary.m1.card2Title');
      elSummaryTargetSecondary.textContent = `${firstUtcStr} UTC`;
      if (longestLeader) {
        elSummaryTargetSecondarySub.textContent = t('summary.m1.card2SubLongest', { leader: longestLeader.name, sh: activeSh.name });
      } else if (activeLeaders.length === 0) {
        elSummaryTargetSecondarySub.textContent = t('summary.m1.card2SubNone');
      } else {
        elSummaryTargetSecondarySub.textContent = t('summary.m1.card2SubDefault', { sh: activeSh.name });
      }

      elSummaryCard3Title.textContent = t('summary.m1.card3Title');
      if (hitDiffSec < 0) {
        elSummaryTargetCountdown.textContent = t('summary.m1.expired');
        elSummaryTargetCountdown.className = 'summary-huge text-muted';
        elSummaryTargetStatus.textContent = t('summary.elapsed', { time: formatFullHMS(Math.abs(hitDiffSec)) });
      } else {
        elSummaryTargetCountdown.textContent = formatFullHMS(hitDiffSec);
        elSummaryTargetCountdown.className = 'summary-huge text-green';
        elSummaryTargetStatus.textContent = t('summary.m1.countingDown');
      }
    }
  }

  function updateClocks() {
    const now = new Date();
    elCurrentUtcTime.textContent = getUtcTimeString(now);
    elCurrentUtcDate.textContent = getUtcDateString(now);
    updateTargetSummaryBanner();
    updateRosterCountdowns(now);
  }

  function updateExportText() {
    if (state.leaders.length === 0) {
      elExportTextarea.value = t('s3_2.emptyNoLeaders');
      return;
    }

    const activeLeaders = getActiveLeaders();
    if (activeLeaders.length === 0) {
      elExportTextarea.value = t('s3_2.emptyNoActive');
      return;
    }

    const activeSh = getSelectedStronghold();
    let output = t('broadcast.header', { sh: activeSh.name });

    activeLeaders.forEach((leader, idx) => {
      const times = calculateLeaderTimes(leader);
      const launchUtc = formatUtcOutput(times.launchDate, times.hitDate);
      output += t('broadcast.line', {
        idx: idx + 1,
        name: leader.name,
        launch: launchUtc
      });
    });

    output += t('broadcast.footer');
    elExportTextarea.value = output;
  }

  // ===========================================================================
  // 11. Section 4: Presets & Batch Import
  // ===========================================================================
  function renderPresetsList() {
    const presets = loadSavedPresets();
    if (presets.length === 0) {
      elSavedPresetsList.innerHTML = `<span class="presets-empty-hint">${escapeHtml(t('s4.emptyPresets'))}</span>`;
      return;
    }

    elSavedPresetsList.innerHTML = presets.map((p, idx) => `
      <div class="preset-chip">
        <button class="preset-load-btn" data-index="${idx}" title="${escapeHtml(t('s4.loadTitle'))}">
          ${escapeHtml(t('s4.chipLabel', { name: p.name, count: p.leaders.length }))}
        </button>
        <button class="preset-del-btn" data-index="${idx}" title="${escapeHtml(t('s4.delTitle'))}">&times;</button>
      </div>
    `).join('');

    elSavedPresetsList.querySelectorAll('.preset-load-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.currentTarget.getAttribute('data-index'), 10);
        const currentPresets = loadSavedPresets();
        const targetPreset = currentPresets[idx];
        if (!targetPreset) return;

        if (Array.isArray(targetPreset.strongholds) && targetPreset.strongholds.length > 0) {
          state.strongholds = deepClone(targetPreset.strongholds);
        }
        if (targetPreset.selectedStrongholdId) {
          state.selectedStrongholdId = targetPreset.selectedStrongholdId;
        }
        if (targetPreset.arrivalInterval !== undefined) {
          state.arrivalInterval = Math.max(0, parseInt(targetPreset.arrivalInterval, 10) || 0);
          if (elArrivalInterval) elArrivalInterval.value = String(state.arrivalInterval);
        }
        state.leaders = deepClone(targetPreset.leaders);
        normalizeStrongholdsAndLeaders();
        renderStrongholdControlPanel();
        commitRosterRender();
        showCopyFeedback(t('feedback.presetLoaded', { name: targetPreset.name }));
      });
    });

    elSavedPresetsList.querySelectorAll('.preset-del-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.currentTarget.getAttribute('data-index'), 10);
        const currentPresets = loadSavedPresets();
        const removed = currentPresets.splice(idx, 1);
        localStorage.setItem(STORAGE_KEY_PRESETS, JSON.stringify(currentPresets));
        renderPresetsList();
        showCopyFeedback(t('feedback.presetDeleted', { name: removed[0]?.name || '' }));
      });
    });
  }

  function saveCurrentAsPreset() {
    const name = elPresetNameInput.value.trim();
    if (!name) {
      alert(t('alert.enterPresetName'));
      elPresetNameInput.focus();
      return;
    }
    if (state.leaders.length === 0) {
      alert(t('alert.addLeaderBeforePreset'));
      return;
    }

    const presets = loadSavedPresets();
    presets.push({
      name,
      createdAt: Date.now(),
      arrivalInterval: state.arrivalInterval,
      strongholds: deepClone(state.strongholds),
      selectedStrongholdId: state.selectedStrongholdId,
      leaders: deepClone(state.leaders)
    });

    localStorage.setItem(STORAGE_KEY_PRESETS, JSON.stringify(presets));
    elPresetNameInput.value = '';
    renderPresetsList();
    showCopyFeedback(t('feedback.presetSaved', { name }));
  }

  function openClearDataModal() {
    if (!elClearDataModal) return;
    if (elClearOptStrongholds) elClearOptStrongholds.checked = true;
    if (elClearOptLeaders) elClearOptLeaders.checked = true;
    if (elClearOptPresets) elClearOptPresets.checked = false;
    elClearDataModal.style.display = 'flex';
  }

  function closeClearDataModal() {
    if (!elClearDataModal) return;
    elClearDataModal.style.display = 'none';
  }

  function executeClearSelectedData() {
    const clearStrongholds = elClearOptStrongholds ? elClearOptStrongholds.checked : true;
    const clearLeaders = elClearOptLeaders ? elClearOptLeaders.checked : true;
    const clearPresets = elClearOptPresets ? elClearOptPresets.checked : false;

    if (!clearStrongholds && !clearLeaders && !clearPresets) {
      alert(t('alert.clearSelectAtLeastOne'));
      return;
    }

    if (clearStrongholds) {
      state.strongholds = getDefaultStrongholds();
      state.selectedStrongholdId = state.strongholds[0].id;
    }

    if (clearLeaders) {
      state.leaders = [];
      expandedLeaderIds.clear();
    }

    if (clearPresets) {
      try {
        localStorage.removeItem(STORAGE_KEY_PRESETS);
      } catch (e) {
        // Ignore storage error
      }
      renderPresetsList();
    }

    normalizeStrongholdsAndLeaders();
    renderStrongholdControlPanel();
    commitRosterRender();
    closeClearDataModal();
    showCopyFeedback(t('feedback.allDataCleared'));
  }

  function parseBatchText(text) {
    const newLeaders = [];
    text.split('\n').forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('//')) return;

      const parts = trimmed.split(/\s+/);
      if (parts.length < 2) return;

      const name = parts[0];
      const timeTokens = parts.slice(1);
      const marches = {};

      state.strongholds.forEach((sh) => {
        marches[sh.id] = { min: 0, sec: 30 };
      });

      if (timeTokens.length === 1) {
        marches[state.selectedStrongholdId] = parseTimeToken(timeTokens[0]);
      } else {
        state.strongholds.forEach((sh, idx) => {
          if (timeTokens[idx]) {
            marches[sh.id] = parseTimeToken(timeTokens[idx]);
          }
        });
      }

      newLeaders.push({
        id: createId(),
        name,
        power: '',
        marches,
        waitTime: null,
        enabled: true
      });
    });

    return newLeaders;
  }

  // ===========================================================================
  // 12. Language Switching & Application Initialization
  // ===========================================================================
  function applyFullLanguageRefresh() {
    i18n.applyStaticTranslations(document);
    localizeDefaultNamesOnLangSwitch();
    renderStrongholdControlPanel();
    updateModeTabUI();
    renderPresetsList();
    commitRosterRender();
  }

  function initLanguageSelector() {
    if (!elLangSelect) return;
    const currentLang = i18n.getLang();

    if (Array.isArray(i18n.SUPPORTED_LANGUAGES) && i18n.SUPPORTED_LANGUAGES.length > 0) {
      elLangSelect.innerHTML = i18n.SUPPORTED_LANGUAGES.map((item) => `
        <option value="${escapeHtml(item.code)}" ${item.code === currentLang ? 'selected' : ''}>
          ${escapeHtml(item.label)}
        </option>
      `).join('');
    }
    elLangSelect.value = currentLang;

    elLangSelect.addEventListener('change', (e) => {
      const newLang = e.target.value;
      i18n.setLang(newLang);
      applyFullLanguageRefresh();
    });
  }

  function init() {
    initLanguageSelector();
    i18n.applyStaticTranslations(document);

    if (!loadStateFromUrlHash()) {
      loadStateFromLocalStorage();
    }

    if (!state.targetTime) state.targetTime = '22:50:00';
    if (!state.calcMode) state.calcMode = 'target_hit';
    delete state.exportFormat;

    localizeDefaultNamesOnLangSwitch();
    renderStrongholdControlPanel();
    updateModeTabUI();
    updateTimeInputsFromState();
    elGlobalWaitTime.value = String(state.globalWaitTime || 300);
    if (elArrivalInterval) {
      elArrivalInterval.value = String(state.arrivalInterval || 0);
    }

    // 1.2 Select All / Deselect All Leaders
    if (elCheckAllLeaders) {
      elCheckAllLeaders.addEventListener('change', (e) => {
        const isChecked = e.target.checked;
        state.leaders.forEach((l) => {
          l.enabled = isChecked;
        });
        commitRosterRender();
      });
    }

    // 1.2 Add Leader
    elBtnAddLeader.addEventListener('click', () => {
      const nextNum = state.leaders.length + 1;
      const nextChar = String.fromCharCode(65 + ((nextNum - 1) % 26));
      const newId = createId();
      const marches = {};
      state.strongholds.forEach((sh) => {
        marches[sh.id] = { min: 0, sec: 30 };
      });
      state.leaders.push({
        id: newId,
        name: t('default.leaderName', { char: nextChar }),
        power: '',
        marches,
        waitTime: null,
        enabled: true
      });
      expandedLeaderIds.add(newId);
      commitRosterRender();
    });

    // 1.2 Load Example
    elBtnLoadExample.addEventListener('click', () => {
      state.strongholds = getDefaultStrongholds();
      state.selectedStrongholdId = state.strongholds[0].id;
      state.leaders = getDefaultLeaders();
      state.arrivalInterval = 0;
      if (elArrivalInterval) elArrivalInterval.value = '0';
      state.targetTime = state.calcMode === 'first_launch' ? '22:10:00' : '22:50:00';
      expandedLeaderIds.clear();
      normalizeStrongholdsAndLeaders();
      renderStrongholdControlPanel();
      updateTimeInputsFromState();
      commitRosterRender();
    });

    // 1.2 Batch Import Modal
    elBtnBatchImport.addEventListener('click', () => {
      elBatchModal.style.display = 'flex';
      elBatchTextarea.focus();
    });

    const closeBatch = () => { elBatchModal.style.display = 'none'; };
    elBtnCloseBatchModal.addEventListener('click', closeBatch);
    elBtnCancelBatch.addEventListener('click', closeBatch);

    elBtnSubmitBatch.addEventListener('click', () => {
      const parsed = parseBatchText(elBatchTextarea.value);
      if (parsed.length === 0) {
        alert(t('alert.batchParseEmpty'));
        return;
      }
      state.leaders = [...state.leaders, ...parsed];
      elBatchTextarea.value = '';
      closeBatch();
      commitRosterRender();
      showCopyFeedback(t('feedback.batchImported', { count: parsed.length }));
    });

    // 2.2 Mode Switcher
    elBtnModeTarget.addEventListener('click', () => switchMode('target_hit'));
    elBtnModeFirst.addEventListener('click', () => switchMode('first_launch'));

    // 2.3 Global Wait Time
    elGlobalWaitTime.addEventListener('change', (e) => {
      state.globalWaitTime = parseInt(e.target.value, 10);
      commitRosterRender();
    });

    // 2.4 Team Arrival Interval
    if (elArrivalInterval) {
      const handleIntervalChange = (e) => {
        const val = Math.max(0, parseInt(e.target.value, 10) || 0);
        state.arrivalInterval = val;
        if (e.type === 'change') {
          e.target.value = String(val);
        }
        commitCalculationUpdate();
      };
      elArrivalInterval.addEventListener('input', handleIntervalChange);
      elArrivalInterval.addEventListener('change', handleIntervalChange);
    }

    // 2.5 Time Stepper Inputs & Arrows
    [elTargetHour, elTargetMinute, elTargetSecond].forEach((inp) => {
      inp.addEventListener('input', syncTargetTimeFromInputs);
      inp.addEventListener('change', syncTargetTimeFromInputs);
      inp.addEventListener('blur', () => {
        let val = parseInt(inp.value, 10);
        if (isNaN(val) || val < 0) val = 0;
        const max = inp.id === 'targetHour' ? 23 : 59;
        if (val > max) val = max;
        inp.value = pad(val);
        syncTargetTimeFromInputs();
      });
      inp.addEventListener('wheel', (e) => {
        e.preventDefault();
        const delta = e.deltaY < 0 ? 1 : -1;
        const field = inp.id === 'targetHour' ? 'hour' : (inp.id === 'targetMinute' ? 'minute' : 'second');
        adjustFieldValue(field, delta);
      }, { passive: false });
    });

    document.querySelectorAll('.btn-step-arrow').forEach((btn) => {
      const field = btn.getAttribute('data-field');
      const delta = parseInt(btn.getAttribute('data-delta'), 10) || 1;

      btn.addEventListener('mousedown', (e) => startHold(field, delta, e));
      btn.addEventListener('mouseup', stopHold);
      btn.addEventListener('mouseleave', stopHold);
      btn.addEventListener('touchstart', (e) => startHold(field, delta, e), { passive: false });
      btn.addEventListener('touchend', stopHold);
      btn.addEventListener('touchcancel', stopHold);
      btn.addEventListener('click', (e) => e.preventDefault());
    });

    if (elBtnSetCurrentUtc) {
      elBtnSetCurrentUtc.addEventListener('click', () => {
        state.targetTime = getUtcTimeString(new Date());
        updateTimeInputsFromState();
        commitRosterRender();
        showCopyFeedback(state.calcMode === 'first_launch'
          ? t('feedback.resetUtcFirst')
          : t('feedback.resetUtcTarget'));
      });
    }

    document.querySelectorAll('.btn-pill[data-offset]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const offsetSec = parseInt(e.currentTarget.getAttribute('data-offset'), 10);
        addSecondsToCurrentUtc(offsetSec);
      });
    });

    elBtnNextRound5.addEventListener('click', () => roundToNextMinuteMultiple(5));
    elBtnNextRound10.addEventListener('click', () => roundToNextMinuteMultiple(10));

    // 3.2 Broadcast Copy Buttons
    elBtnCopyExport.addEventListener('click', () => copyToClipboard(elExportTextarea.value));
    elBtnCopyShareUrl.addEventListener('click', () => {
      copyToClipboard(getShareableUrl());
      showCopyFeedback(t('feedback.shareUrlCopied'));
    });

    // Presets & Clear All Data Modal
    elBtnSavePreset.addEventListener('click', saveCurrentAsPreset);
    if (elBtnClearAllData) {
      elBtnClearAllData.addEventListener('click', openClearDataModal);
    }
    if (elBtnCloseClearModal) {
      elBtnCloseClearModal.addEventListener('click', closeClearDataModal);
    }
    if (elBtnCancelClear) {
      elBtnCancelClear.addEventListener('click', closeClearDataModal);
    }
    if (elBtnSubmitClear) {
      elBtnSubmitClear.addEventListener('click', executeClearSelectedData);
    }

    // Initial Render & Live Clock Interval
    renderPresetsList();
    renderRoster();
    updateClocks();
    setInterval(updateClocks, 250);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
