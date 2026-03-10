// ==UserScript==
// @name         APM Master: Unified Tools
// @namespace    https://w.amazon.com/bin/view/Users/rosendah/APM-Master/
// @version      14.0.4
// @description  Quality of life and automation tools that use native EAM ExtJS Framewoek functions for high reliability and capability. This is actively supported tool so Slack me for any issues and I can push an update.
// @author       Jacob Rosendahl
// @icon         https://media.licdn.com/dms/image/v2/D5603AQGdCV0_LQKRfQ/profile-displayphoto-scale_100_100/B56ZyZLvQ5HgAg-/0/1772096519061?e=1773878400&v=beta&t=eWO1Jiy0-WbzG_yBv-SBrmmsVOPMexF57-q1Xh_VXCk
// @match        https://us1.eam.hxgnsmartcloud.com/*
// @match        https://eu1.eam.hxgnsmartcloud.com/*
// @match        https://*.insights.amazon.dev/*
// @match        https://user.sparsy.insights.amazon.dev/*
// @match        https://*.apm-es.gps.amazon.dev/*
// @updateURL    https://drive.corp.amazon.com/view/rosendah@/greasemonkey_scripts/APM-Master/forecast.user.js
// @downloadURL  https://drive.corp.amazon.com/view/rosendah@/greasemonkey_scripts/APM-Master/forecast.user.js
// @run-at       document-start
// @grant        none
// ==/UserScript==

/* --------------------------------------------------------------------------
   RECENT FEATURES & BUG FIXES:
   - v14.0.4 Added locale-aware date format detection for EU/US configurations.
   - v14.0.4 Flash prevention implemented with css styles backdrop during page load to prevent flashbanging users who use the dark mode.
   - v14.0.2 Added a PTP status tracker so users can see if they have completed a PTP on a WO from grid view
   - v14.0.1 Replaced all document.createElement('script') injections in favor of a unified core, consolidating redundant utilities from merged tools into shared modules to native framework event listeners for improved performance.
   - v14.0.0 Architectural Refactor: Migrated codebase to modular ES structure with esbuild bundling, improves maintainability and eliminated global scope conflicts.
   - v12.5.11 Bug Fix: Fixed failed navigation when using screen cache, which was broken from the prior no screen cache fix. Tested with and without SC and it works now.
   -------------------------------------------------------------------------- */

(() => {
  // src/core/constants.js
  var KEY_THEME2 = "apmUiTheme";
  var CC_STORAGE_RULES = "apm_colorcode_rules";
  var CC_STORAGE_SET = "apm_colorcode_settings";
  var PRESET_STORAGE_KEY = "apm_creator_presets_v1";
  var STORAGE_KEY = "eam_forecast_preferences_v12";
  var CURRENT_VERSION = "14.0.4";
  var UPDATE_URL = "https://raw.githubusercontent.com/jaker788-create/APM-Master/main/forecast.user.js";
  var GITHUB_URL = "https://github.com/jaker788-create/APM-Master";
  var SESSION_TIMEOUT_URL = "https://us1.eam.hxgnsmartcloud.com/web/base/logindisp?tenant=AMAZONRMENA_PRD";
  var LINK_CONFIG = {
    tenant: "AMAZONRMENA_PRD",
    userFuncName: "WSJOBS",
    woPattern: /\b(1\d{9,})\b/
  };
  var SVG_CLOUD = '<svg viewBox="0 0 24 24" width="26" height="26" style="vertical-align: text-bottom; margin-bottom: -1px; margin-right: 4px; overflow: visible;"><path class="lightning-bolt" d="M18,3 L5,16 L11,16 L7,26 L20,11 L13,11 Z" fill="#f1c40f"/><path d="M17.5,18 C20,18 22,16 22,13.5 C22,11.2 20.3,9.3 18,9 C17.5,6.2 15,4 12,4 C8.7,4 6,6.7 6,10 C6,10.1 6,10.1 6,10.1 C3.8,10.3 2,12.2 2,14.5 C2,17 4,19 6.5,19 L17.5,18 Z" fill="currentColor"/><path class="raindrop drop-1" d="M8,19 L7,23" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path class="raindrop drop-2" d="M12,20 L11,24" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path class="raindrop drop-3" d="M16,19 L15,23" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path class="raindrop drop-4" d="M10,18 L9,22" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path class="raindrop drop-5" d="M14,19 L13,23" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path class="raindrop drop-6" d="M18,18 L17,22" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>';

  // src/core/theme-enforcer.js
  function enforceTheme(targetWin = window, targetDoc = document) {
    const isEAM2 = targetWin.location.hostname.includes("hxgnsmartcloud.com");
    const isPTP2 = /amazon\.dev|insights/i.test(targetWin.location.hostname);
    if (!isEAM2 && !isPTP2) return;
    targetWin.__apmThemeState = targetWin.__apmThemeState || {
      activeTheme: null,
      sentinelActive: false
    };
    const state = targetWin.__apmThemeState;
    const applyEnforcer = (themeName) => {
      if (!themeName || themeName === "default") return;
      state.activeTheme = themeName;
      const manifestPath = "eam/" + themeName + ".json";
      const isDark = themeName.includes("dark") || themeName.includes("hex");
      const internal = {
        pollCount: 0,
        origBeforeLoad: null,
        wrapper: null
      };
      if (isDark) {
        const flashStyle = targetDoc.getElementById("apm-flash-prevent") || targetDoc.createElement("style");
        flashStyle.id = "apm-flash-prevent";
        flashStyle.textContent = `
                html, body, .x-body, .x-viewport, #processing-request-container { background-color: #222 !important; color: #eee !important; }
                .loading-mask, .x-mask { background-color: rgba(0,0,0,0.5) !important; }
            `;
        (targetDoc.head || targetDoc.documentElement).appendChild(flashStyle);
      }
      const hookEam = (obj) => {
        if (!obj) return;
        try {
          Object.defineProperty(obj, "CSS_PATH", {
            get: () => state.activeTheme,
            set: () => {
            },
            configurable: true,
            enumerable: true
          });
        } catch (e) {
          obj.CSS_PATH = state.activeTheme;
        }
      };
      const hookExt = (obj) => {
        if (!obj) return;
        let _manifest = manifestPath;
        try {
          if (!obj.__apmManifestHooked) {
            Object.defineProperty(obj, "manifest", {
              get: () => _manifest,
              set: (v) => {
                if (typeof v === "string" && v.includes("theme-") && !v.includes(state.activeTheme)) {
                  console.log(`[APM Master] Sticky Manifest: Redirecting "${v}" -> "${manifestPath}"`);
                  _manifest = manifestPath;
                } else {
                  _manifest = v;
                }
              },
              configurable: true,
              enumerable: true
            });
            obj.__apmManifestHooked = true;
          }
        } catch (e) {
          obj.manifest = manifestPath;
        }
        if (!internal.wrapper) {
          internal.origBeforeLoad = obj.beforeLoad;
          internal.wrapper = function(tags) {
            targetWin.Ext.manifest = manifestPath;
            if (typeof internal.origBeforeLoad === "function") {
              try {
                return internal.origBeforeLoad.apply(this, arguments);
              } catch (err) {
              }
            }
          };
          try {
            Object.defineProperty(obj, "beforeLoad", {
              get: () => internal.wrapper,
              set: (v) => {
                internal.origBeforeLoad = v;
              },
              configurable: true,
              enumerable: true
            });
          } catch (e) {
          }
        }
      };
      if (targetWin.EAM) hookEam(targetWin.EAM);
      if (targetWin.Ext) hookExt(targetWin.Ext);
      try {
        let _eam = targetWin.EAM;
        Object.defineProperty(targetWin, "EAM", {
          get: () => _eam,
          set: (v) => {
            _eam = v;
            if (v) hookEam(v);
          },
          configurable: true,
          enumerable: true
        });
        let _ext = targetWin.Ext;
        Object.defineProperty(targetWin, "Ext", {
          get: () => _ext,
          set: (v) => {
            _ext = v;
            if (v) hookExt(v);
          },
          configurable: true,
          enumerable: true
        });
      } catch (e) {
      }
      const flipLink = (node) => {
        if (node.tagName === "LINK" && node.rel === "stylesheet" && node.href) {
          const url = node.href.toLowerCase();
          const isTheme = url.includes("/theme-") || url.includes("/ext-theme-") || url.includes("neptune") || url.includes("crisp") || url.includes("triton");
          if (isTheme && !url.includes(state.activeTheme)) {
            const newHref = node.href.replace(/(theme-)[^./?#]+/, `$1${state.activeTheme.replace("theme-", "")}`);
            if (newHref !== node.href) {
              console.log(`[APM Master] CSS Sentinel: Flipping ${node.href} -> ${newHref}`);
              node.href = newHref;
            }
          }
        }
      };
      if (!state.sentinelActive) {
        targetDoc.querySelectorAll('link[rel="stylesheet"]').forEach(flipLink);
        const sentinel = new MutationObserver((mutations) => {
          for (const m of mutations) {
            for (const node of m.addedNodes || []) {
              if (node.nodeType === 1) flipLink(node);
            }
          }
        });
        sentinel.observe(targetDoc.documentElement, { childList: true, subtree: true });
        state.sentinelActive = true;
      }
      const poll = () => {
        internal.pollCount++;
        if (targetWin.Ext) hookExt(targetWin.Ext);
        if (targetWin.EAM) hookEam(targetWin.EAM);
        if (internal.pollCount < 200) {
          setTimeout(poll, 50);
        } else {
          setInterval(() => {
            if (targetWin.Ext) hookExt(targetWin.Ext);
            if (targetWin.EAM) hookEam(targetWin.EAM);
          }, 5e3);
        }
      };
      const broadcast = () => {
        for (let i = 0; i < targetWin.frames.length; i++) {
          try {
            targetWin.frames[i].postMessage({ type: "APM_SET_THEME", value: themeName }, "*");
          } catch (err) {
          }
        }
      };
      broadcast();
      if (targetWin === targetWin.top) {
        let count = 0;
        const iv = setInterval(() => {
          broadcast();
          if (++count > 10) clearInterval(iv);
        }, 1e3);
      }
      const style = targetDoc.getElementById("apm-theme-root-vars") || targetDoc.createElement("style");
      if (!style.id) {
        style.id = "apm-theme-root-vars";
        (targetDoc.head || targetDoc.documentElement).appendChild(style);
      }
      style.textContent = `:root { --apm-active-theme: "${themeName}"; }`;
      const cls = "x-theme-" + themeName.replace("theme-", "");
      if (targetDoc.body) targetDoc.body.classList.add(cls);
      targetDoc.documentElement.classList.add(cls);
      console.log(`[APM Master] Theme Applied: ${themeName} (${targetWin === targetWin.top ? "TOP" : "FRAME"})`);
    };
    if (!targetWin.__apmMsgBound) {
      targetWin.addEventListener("message", (e) => {
        const d = e.data;
        if (d && (d.type === "APM_SET_THEME" || d.apmMaster === "theme")) {
          const newTheme = (d.value || d.theme || "default").toLowerCase();
          if (newTheme !== state.activeTheme) applyEnforcer(newTheme);
        } else if (d && d.type === "APM_GET_THEME") {
          const cur = state.activeTheme || "default";
          if (cur !== "default") {
            try {
              e.source?.postMessage({ type: "APM_SET_THEME", value: cur }, "*");
            } catch (err) {
            }
          }
        }
      });
      targetWin.__apmMsgBound = true;
    }
    const getStoredTheme = () => {
      try {
        const genStr = targetWin.localStorage.getItem("ApmGeneralSettings");
        const gen = genStr ? JSON.parse(genStr) : null;
        if (gen && gen.theme && gen.theme !== "default") return gen.theme;
        const ccStr = targetWin.localStorage.getItem(CC_STORAGE_SET);
        const cc = ccStr ? JSON.parse(ccStr) : null;
        if (cc && cc.theme && cc.theme !== "default") return cc.theme;
        const direct = targetWin.localStorage.getItem(KEY_THEME2);
        if (direct && direct !== "default") return direct;
      } catch (e) {
      }
      return "default";
    };
    let startTheme = getStoredTheme();
    if (startTheme !== "default") {
      console.log(`[APM Master] Theme Enforcer: Detected "${startTheme}"`);
      applyEnforcer(startTheme);
    } else if (targetWin !== targetWin.top) {
      let tries = 0;
      const requestTheme = () => {
        if (state.activeTheme) return;
        try {
          targetWin.top.postMessage({ type: "APM_GET_THEME" }, "*");
        } catch (e) {
        }
        if (++tries < 15) setTimeout(requestTheme, 1e3);
      };
      requestTheme();
    }
    if (!targetWin.localStorage.__apmSetItemPatched) {
      try {
        const _set = targetWin.localStorage.setItem;
        targetWin.localStorage.setItem = function(k, v) {
          const r = _set.apply(this, arguments);
          if (k === "ApmGeneralSettings" || k === CC_STORAGE_SET || k === KEY_THEME2) {
            const next = getStoredTheme();
            if (next !== "default") {
              applyEnforcer(next);
              for (let i = 0; i < targetWin.frames.length; i++) {
                try {
                  targetWin.frames[i].postMessage({ type: "APM_SET_THEME", value: next }, "*");
                } catch (err) {
                }
              }
            }
          }
          return r;
        };
        targetWin.localStorage.__apmSetItemPatched = true;
      } catch (e) {
      }
    }
  }

  // src/core/state.js
  var AppState = {
    // Forecast
    forecast: {
      isRunning: false,
      isStopped: false,
      savedOrgs: [],
      selectedOrg: ""
    },
    // Autofill / TabOrder
    autofill: {
      isAutoFillRunning: false,
      presets: {
        autofill: {},
        config: {
          columnOrder: "",
          tabOrder: "",
          hiddenTabs: []
        }
      }
    },
    // ColorCode
    colorCode: {
      rules: [],
      settings: { uniformHighlight: false, theme: "default" },
      footerObserver: null,
      activeFilter: ""
    },
    // PTP
    ptp: {
      seconds: 120,
      timerRunning: false,
      dismissed: false
    },
    // System defaults
    systemDefaults: {
      tabOrder: null,
      columnOrder: null
    }
  };
  var DEFAULT_SETTINGS = {
    ptpTimerEnabled: true,
    ptpTrackingEnabled: true,
    openLinksInNewTab: true,
    autoRedirect: false,
    dateFormat: "us",
    // 'us' or 'eu'
    dateSeparator: "/",
    dateOverrideEnabled: true
  };
  var apmGeneralSettings = { ...DEFAULT_SETTINGS };
  var _settingsInitialized = false;
  function initializeGeneralSettings() {
    if (_settingsInitialized) return apmGeneralSettings;
    console.log("[APM State] Initializing General Settings...");
    const stored = localStorage.getItem("ApmGeneralSettings");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        console.log("[APM State] Loaded from storage:", parsed);
        Object.assign(apmGeneralSettings, DEFAULT_SETTINGS, parsed);
      } catch (e) {
        console.error("[APM State] Failed to parse stored settings:", e);
        Object.assign(apmGeneralSettings, DEFAULT_SETTINGS);
      }
    } else {
      console.log("[APM State] No stored settings found, using defaults.");
      Object.assign(apmGeneralSettings, DEFAULT_SETTINGS);
    }
    _settingsInitialized = true;
    console.log("[APM State] Initialization complete.");
    return apmGeneralSettings;
  }
  function saveGeneralSettings() {
    console.log("[APM State] Saving General Settings:", apmGeneralSettings);
    localStorage.setItem("ApmGeneralSettings", JSON.stringify(apmGeneralSettings));
  }
  function setGeneralSetting(key, value) {
    apmGeneralSettings[key] = value;
    saveGeneralSettings();
  }
  if (typeof window !== "undefined") {
    window.addEventListener("storage", (e) => {
      if (e.key === "ApmGeneralSettings" && e.newValue) {
        try {
          const next = JSON.parse(e.newValue);
          Object.assign(apmGeneralSettings, next);
        } catch (err) {
        }
      }
    });
  }

  // src/modules/autofill/autofill-prefs.js
  function loadPresets() {
    try {
      const stored = localStorage.getItem(PRESET_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.autofill) AppState.autofill.presets.autofill = parsed.autofill;
        if (parsed.config) AppState.autofill.presets.config = parsed.config;
      }
    } catch (e) {
      console.warn("Failed to load autofill presets", e);
    }
  }
  function savePresets() {
    localStorage.setItem(PRESET_STORAGE_KEY, JSON.stringify(AppState.autofill.presets));
  }
  function getPresets() {
    return AppState.autofill.presets;
  }
  function getIsAutoFillRunning() {
    return AppState.autofill.isAutoFillRunning;
  }
  function setIsAutoFillRunning(val) {
    AppState.autofill.isAutoFillRunning = val;
  }

  // src/modules/colorcode/colorcode-prefs.js
  function loadColorCodePrefs() {
    try {
      const storedRules = localStorage.getItem(CC_STORAGE_RULES);
      if (storedRules) {
        AppState.colorCode.rules = JSON.parse(storedRules);
      }
      const storedSet = localStorage.getItem(CC_STORAGE_SET);
      if (storedSet) {
        const parsed = JSON.parse(storedSet);
        AppState.colorCode.settings = { ...AppState.colorCode.settings, ...parsed };
      }
    } catch (e) {
      console.warn("[ColorCode] Failed to load preferences", e);
    }
  }
  function saveColorCodeRules() {
    localStorage.setItem(CC_STORAGE_RULES, JSON.stringify(AppState.colorCode.rules));
  }
  function saveColorCodeSettings() {
    localStorage.setItem(CC_STORAGE_SET, JSON.stringify(AppState.colorCode.settings));
  }
  function getRules() {
    return AppState.colorCode.rules;
  }
  function setRules(newRules) {
    AppState.colorCode.rules = newRules;
  }
  function getSettings() {
    return AppState.colorCode.settings;
  }
  if (typeof window !== "undefined") {
    window.addEventListener("storage", (e) => {
      if (e.key === CC_STORAGE_RULES && e.newValue) {
        try {
          AppState.colorCode.rules = JSON.parse(e.newValue);
          if (typeof window.invalidateColorCodeCache === "function") {
            window.invalidateColorCodeCache();
          } else if (typeof window.debouncedProcessColorCodeGrid === "function") {
            window.debouncedProcessColorCodeGrid();
          }
        } catch (err) {
        }
      } else if (e.key === CC_STORAGE_SET && e.newValue) {
        try {
          const next = JSON.parse(e.newValue);
          AppState.colorCode.settings = { ...AppState.colorCode.settings, ...next };
          if (typeof window.fullStyleUpdate === "function") {
            window.fullStyleUpdate();
          }
        } catch (err) {
        }
      }
    });
  }

  // src/core/utils.js
  var delay = (ms) => new Promise((res) => setTimeout(res, ms));
  function getExtWindows() {
    const wins = /* @__PURE__ */ new Set([window.top, window]);
    document.querySelectorAll("iframe").forEach((f) => {
      try {
        if (f.src && f.src.includes("amazon.dev")) return;
        if (f.contentWindow && f.contentWindow.Ext) wins.add(f.contentWindow);
      } catch (e) {
      }
    });
    return [...wins];
  }
  function findMainGrid() {
    for (const win of getExtWindows()) {
      try {
        if (!win.Ext?.ComponentQuery) continue;
        const grid = win.Ext.ComponentQuery.query("gridpanel").find(
          (g) => g.columns?.length > 20 && g.rendered && !g.isDestroyed
        );
        if (grid) return { win, doc: win.document, grid };
      } catch (e) {
      }
    }
    return null;
  }
  function formatDate(d) {
    if (!d || isNaN(d.getTime())) return "";
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    const sep = apmGeneralSettings?.dateSeparator || "/";
    if (apmGeneralSettings?.dateFormat === "eu") {
      return `${day}${sep}${month}${sep}${year}`;
    }
    return `${month}${sep}${day}${sep}${year}`;
  }
  function waitForAjax(win) {
    return new Promise((resolve) => {
      const ext = win?.Ext;
      if (!ext || !ext.Ajax) return resolve();
      if (!ext.Ajax.isLoading()) return resolve();
      const onComplete = function() {
        if (!ext.Ajax.isLoading()) {
          ext.Ajax.un("requestcomplete", onComplete);
          ext.Ajax.un("requestexception", onComplete);
          setTimeout(resolve, 100);
        }
      };
      ext.Ajax.on("requestcomplete", onComplete);
      ext.Ajax.on("requestexception", onComplete);
      setTimeout(() => {
        ext.Ajax.un("requestcomplete", onComplete);
        ext.Ajax.un("requestexception", onComplete);
        resolve();
      }, 1e4);
    });
  }

  // src/modules/forecast/forecast-prefs.js
  var savedOrgs = [];
  var selectedOrg = "";
  function setSavedOrgs(orgs) {
    savedOrgs = orgs;
  }
  function setSelectedOrg(org) {
    selectedOrg = org;
  }
  function loadPreferences() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const prefs = JSON.parse(saved);
        if (prefs.orgs && Array.isArray(prefs.orgs)) {
          savedOrgs = prefs.orgs.filter((o) => o !== "All Sites" && o !== "-- All Sites --" && o !== "");
        } else {
          savedOrgs = [];
        }
        if (prefs.selectedOrg !== void 0 && (prefs.selectedOrg === "" || savedOrgs.includes(prefs.selectedOrg))) {
          selectedOrg = prefs.selectedOrg;
        } else {
          selectedOrg = "";
        }
        return prefs;
      }
    } catch (e) {
      console.warn("[APM Forecast] Failed to load preferences:", e);
    }
    savedOrgs = [];
    selectedOrg = "";
    return null;
  }
  function saveAllPreferences() {
    const orgSelect = document.getElementById("eam-org-select");
    selectedOrg = orgSelect ? orgSelect.value : "";
    let prefsToSave = { orgs: savedOrgs, selectedOrg };
    const weekSelect = document.getElementById("eam-week-select");
    if (weekSelect) prefsToSave.week = weekSelect.value;
    prefsToSave.days = Array.from(document.querySelectorAll('#eam-day-checkboxes input[type="checkbox"]')).map((cb) => cb.dataset.explicit === "true");
    const assignedText = document.getElementById("eam-assigned-text");
    if (assignedText) prefsToSave.assignedText = assignedText.value.trim();
    const shiftText = document.getElementById("eam-shift-text");
    if (shiftText) prefsToSave.shiftText = shiftText.value.trim();
    const descOp = document.getElementById("eam-desc-op");
    if (descOp) prefsToSave.descOp = descOp.value;
    const descText = document.getElementById("eam-desc-text");
    if (descText) prefsToSave.descText = descText.value.trim();
    const todayToggle = document.getElementById("eam-today-only-toggle");
    if (todayToggle) prefsToSave.todayOnly = todayToggle.checked;
    const advSite = document.getElementById("eam-adv-site");
    const customDates = document.getElementById("eam-custom-dates");
    if (advSite) prefsToSave.isSimpleMode = advSite.style.display === "none";
    if (customDates) prefsToSave.isCustomDateMode = customDates.style.display !== "none";
    const custStart = document.getElementById("eam-custom-start");
    const custEnd = document.getElementById("eam-custom-end");
    if (custStart) prefsToSave.customStart = custStart.value;
    if (custEnd) prefsToSave.customEnd = custEnd.value;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prefsToSave));
    } catch (e) {
      console.error("[APM Forecast] Failed to save preferences:", e);
    }
  }

  // src/modules/forecast/forecast-engine.js
  var isRunning = false;
  var isStopped = false;
  function getDateRange(weekValue, minDay, maxDay, isCumulative) {
    if (minDay === null || maxDay === null) return null;
    const val = parseInt(weekValue, 10);
    const now = /* @__PURE__ */ new Date();
    const baseSunday = new Date(now);
    baseSunday.setDate(now.getDate() - now.getDay());
    let startOffset = isCumulative ? 0 : val * 7;
    let endOffset = isCumulative ? val * 7 : val * 7;
    const startD = new Date(baseSunday);
    startD.setDate(baseSunday.getDate() + minDay + startOffset);
    const endD = new Date(baseSunday);
    endD.setDate(baseSunday.getDate() + maxDay + endOffset);
    return { start: formatDate(startD), end: formatDate(endD) };
  }
  function isGridReady() {
    const frames = [window, ...Array.from(document.querySelectorAll("iframe")).map((f) => {
      try {
        return f.contentWindow;
      } catch (e) {
        return null;
      }
    }).filter(Boolean)];
    for (const win of frames) {
      try {
        if (win.Ext && win.Ext.ComponentQuery) {
          const grids = win.Ext.ComponentQuery.query("gridpanel:not([destroyed=true])");
          for (const grid of grids) {
            if (grid.rendered && grid.getStore) {
              const store = grid.getStore();
              if (store && store.storeId && store.storeId.toLowerCase().includes("wsjobs") && !store.isLoading()) {
                return true;
              }
            }
          }
        }
      } catch (e) {
      }
    }
    return false;
  }
  async function navigateTo(tabText, menuPathArray) {
    function isExactMatch(rawText, target) {
      if (!rawText) return false;
      const cleanText = rawText.replace(/<[^>]*>?/gm, "").replace(/&nbsp;/g, " ").trim();
      if (cleanText.toUpperCase().includes("COMPLIANCE")) return false;
      if (cleanText === target) return true;
      if (cleanText.startsWith(target + " ") || cleanText.startsWith(target + "(")) return true;
      if (cleanText.includes("- " + target)) return true;
      return false;
    }
    for (const win of getExtWindows()) {
      try {
        if (!win.Ext || !win.Ext.ComponentQuery) continue;
        const tabs = win.Ext.ComponentQuery.query("tab:not([hidden=true]):not([destroyed=true])");
        let targetTab = tabs.find((t) => isExactMatch(t.text, tabText));
        if (targetTab) {
          if (targetTab.el && targetTab.el.dom) targetTab.el.dom.click();
          else targetTab.fireEvent("click", targetTab);
          return;
        }
        if (menuPathArray && menuPathArray.length === 2) {
          const btns = win.Ext.ComponentQuery.query("button");
          let topBtn = btns.find((b) => !b.hidden && isExactMatch(b.text, menuPathArray[0]) && b.showMenu);
          if (topBtn) {
            topBtn.showMenu();
            await delay(200);
            const menuItems = win.Ext.ComponentQuery.query("menuitem");
            let childItem = menuItems.find(
              (item) => !item.hidden && !(typeof item.isHidden === "function" && item.isHidden()) && isExactMatch(item.text, menuPathArray[1])
            );
            if (childItem) {
              if (childItem.handler) childItem.handler.call(childItem.scope || childItem, childItem);
              else if (childItem.el && childItem.el.dom) childItem.el.dom.click();
              else childItem.fireEvent("click", childItem);
            }
            if (win.Ext.menu && win.Ext.menu.Manager) win.Ext.menu.Manager.hideAll();
            return;
          }
        }
      } catch (e) {
      }
    }
  }
  async function returnToListView() {
    let targetExt = null;
    for (const win of getExtWindows()) {
      try {
        if (!win.Ext || !win.Ext.ComponentQuery) continue;
        const grids = win.Ext.ComponentQuery.query("gridpanel:not([destroyed=true])");
        const found = grids.some((g) => {
          const store = g.getStore && g.getStore();
          return store && store.storeId && store.storeId.toLowerCase().includes("wsjobs");
        });
        if (found) {
          targetExt = win.Ext;
          break;
        }
      } catch (e) {
      }
    }
    if (!targetExt) targetExt = window.Ext;
    if (!targetExt || !targetExt.ComponentQuery) return;
    const queries = [
      "button[cls~=uftid-collapseright]",
      'button[tooltip*="Expand Right"]',
      'button[tooltip*="Alt+Right"]',
      'tab[text="List View"]',
      'button[ariaLabel="List View"]'
    ];
    for (const q of queries) {
      const elements = targetExt.ComponentQuery.query(q);
      for (const el2 of elements) {
        if (el2.hidden || el2.isHidden && el2.isHidden()) continue;
        if (el2.handler) {
          el2.handler.call(el2.scope || el2, el2);
          return;
        } else if (el2.isTab) {
          const win = getExtWindows().find((w) => w.Ext === targetExt) || window;
          const tp = el2.up("tabpanel");
          if (tp) tp.setActiveTab(el2);
          else el2.fireEvent("click", el2);
          return;
        } else {
          el2.fireEvent("click", el2);
          return;
        }
      }
    }
    await delay(150);
  }
  async function applyForecastFiltersExtJS(filterData) {
    let targetExt = null;
    let foundFrame = false;
    let targetWin = window;
    for (let attempts = 0; attempts < 40; attempts++) {
      for (const win of getExtWindows()) {
        try {
          if (!win.Ext || !win.Ext.ComponentQuery) continue;
          const grids = win.Ext.ComponentQuery.query("gridpanel:not([destroyed=true])");
          foundFrame = grids.some((g) => {
            const store = g.getStore && g.getStore();
            return store && store.storeId && store.storeId.toLowerCase().includes("wsjobs");
          });
          if (foundFrame) {
            targetExt = win.Ext;
            targetWin = win;
            break;
          }
        } catch (e) {
        }
      }
      if (!targetExt) targetExt = window.Ext;
      if (foundFrame && targetExt && targetExt.ComponentQuery) {
        const woFields = targetExt.ComponentQuery.query("[name=ff_workordernum]:not([destroyed=true])");
        if (woFields && woFields.length > 0) break;
      }
      await delay(250);
    }
    if (!targetExt || !targetExt.ComponentQuery) return;
    let needsAjaxWait = false;
    const data = filterData;
    if (!data.isClearMode) {
      const targetDataspyName = data.isWoSearch ? "All Work Orders" : "Open Work Orders";
      const combos = targetExt.ComponentQuery.query("combobox");
      for (const combo of combos) {
        const store = combo.getStore && combo.getStore();
        if (store && combo.displayField) {
          const targetRecord = store.findRecord(combo.displayField, targetDataspyName, 0, false, false, true);
          if (targetRecord) {
            let rawId = targetRecord.get(combo.valueField);
            if (typeof rawId === "object" && rawId !== null) rawId = rawId.id || rawId.value;
            let currentVal = combo.getValue();
            if (typeof currentVal === "object" && currentVal !== null) currentVal = currentVal.id || currentVal.value;
            if (String(currentVal) !== String(rawId)) {
              combo.setValue(rawId);
              combo.fireEvent("select", combo, targetRecord);
              needsAjaxWait = true;
              break;
            }
          }
        }
      }
    }
    if (needsAjaxWait) {
      await waitForAjax(targetWin);
    }
    const setExtField = (nameAttr, value, operatorClass) => {
      if (value === void 0 || value === null) return;
      const fields = targetExt.ComponentQuery.query("[name=" + nameAttr + "]:not([destroyed=true])");
      if (!fields || fields.length === 0) return;
      const cmp = fields[0];
      if (value === "") {
        cmp.setValue("");
        cmp.fireEvent("change", cmp, "");
        cmp.fireEvent("blur", cmp);
        return;
      }
      cmp.setValue(value);
      cmp.fireEvent("change", cmp, value);
      cmp.fireEvent("blur", cmp);
      if (operatorClass) {
        const el2 = cmp.getEl();
        let triggerBtnEl = null;
        const parentWrap = el2.up(".x-box-inner") || el2.up(".x-column-header-inner") || el2.up(".x-container");
        if (parentWrap) {
          triggerBtnEl = parentWrap.down(".uft-id-btnfilteroperator") || parentWrap.down(".x-btn-icon-el-gridfilter-small");
          if (triggerBtnEl && triggerBtnEl.hasCls("x-btn-icon-el-gridfilter-small")) {
            triggerBtnEl = triggerBtnEl.up(".x-btn");
          }
        }
        if (triggerBtnEl) {
          const opBtnCmp = targetExt.getCmp(triggerBtnEl.id);
          if (opBtnCmp && opBtnCmp.menu && opBtnCmp.menu.items && opBtnCmp.menu.items.items) {
            const menuItem = opBtnCmp.menu.items.items.find((item) => item.iconCls === operatorClass);
            if (menuItem) {
              if (menuItem.handler) menuItem.handler.call(menuItem.scope || menuItem, menuItem);
              else menuItem.fireEvent("click", menuItem);
            }
          }
        }
      }
    };
    const topFilterFields = targetExt.ComponentQuery.query("[name=selfiltervaluectrl]:not([destroyed=true])");
    if (topFilterFields && topFilterFields.length > 0) {
      topFilterFields[0].setValue("");
      topFilterFields[0].fireEvent("change", topFilterFields[0], "");
      topFilterFields[0].fireEvent("blur", topFilterFields[0]);
    }
    setExtField("ff_organization", data.org, "fo_con");
    setExtField("ff_workordernum", data.woNum, "fo_con");
    setExtField("ff_description", data.desc, data.descOpClass);
    setExtField("ff_assignedto", data.assigned, "fo_con");
    setExtField("ff_shift", data.shift, "fo_con");
    setExtField("ff_schedstartdate", data.start, data.startOpClass);
    setExtField("ff_schedenddate", data.end, data.endOpClass);
    if (data.isWoSearch) {
      setExtField("ff_status", "", "fo_con");
    }
    if (!data.isClearMode) {
      const runBtns = targetExt.ComponentQuery.query("button[text=Run]:not([destroyed=true])");
      if (runBtns && runBtns.length > 0) {
        const runBtn = runBtns[0];
        if (runBtn.handler) runBtn.handler.call(runBtn.scope || runBtn, runBtn);
        else runBtn.fireEvent("click", runBtn);
      }
    }
  }
  async function executeForecast(mode = "normal") {
    if (window.self !== window.top) return;
    if (isRunning) return;
    try {
      if (window.Ext && window.Ext.Ajax && window.Ext.Ajax.isLoading()) {
        setStatus(mode, "EAM busy... please wait.", "#f1c40f");
        return;
      }
    } catch (e) {
    }
    let orgText = "", dates = { start: "", end: "" }, assignedText = "", shiftText = "", descText = "", descOp = "Contains", quickSearchText = "";
    if (mode === "quick") {
      quickSearchText = document.getElementById("apm-qs-input").value.trim();
      if (!quickSearchText) {
        setStatus(mode, "Enter WO.", "#e74c3c");
        return;
      }
    } else if (mode === "clear") {
    } else if (mode === "today") {
      const todayFormatted = formatDate(/* @__PURE__ */ new Date());
      dates = { start: todayFormatted, end: todayFormatted };
      const orgSelect = document.getElementById("eam-org-select");
      orgText = orgSelect ? orgSelect.value.trim().toUpperCase() : "";
    } else {
      const isCustomDateMode = document.getElementById("eam-custom-dates").style.display !== "none";
      if (isCustomDateMode) {
        const startVal = document.getElementById("eam-custom-start").value;
        const endVal = document.getElementById("eam-custom-end").value;
        const formatHtmlDate = (dStr) => {
          if (!dStr) return "";
          const p = dStr.split("-");
          return p.length === 3 ? p[1] + "/" + p[2] + "/" + p[0] : "";
        };
        dates = { start: formatHtmlDate(startVal), end: formatHtmlDate(endVal) };
        if (!dates.start && !dates.end) {
          setStatus(mode, "Select date range.", "#e74c3c");
          return;
        }
      } else {
        const weekSelectEl = document.getElementById("eam-week-select");
        const weekOffset = weekSelectEl.value;
        const isCumulative = weekSelectEl.dataset.cumulative === "true";
        const checkboxesList = Array.from(document.querySelectorAll('#eam-day-checkboxes input[type="checkbox"]'));
        const userChecked = checkboxesList.filter((cb) => cb.dataset.explicit === "true").map((cb) => parseInt(cb.value, 10));
        if (userChecked.length === 0) {
          setStatus(mode, "Select a day.", "#e74c3c");
          return;
        }
        dates = getDateRange(weekOffset, Math.min(...userChecked), Math.max(...userChecked), isCumulative);
      }
      assignedText = document.getElementById("eam-assigned-text")?.value.trim() || "";
      shiftText = document.getElementById("eam-shift-text")?.value.trim() || "";
      descText = document.getElementById("eam-desc-text")?.value.trim() || "";
      descOp = document.getElementById("eam-desc-op")?.value || "Contains";
      orgText = document.getElementById("eam-org-select")?.value.trim().toUpperCase() || "";
    }
    isRunning = true;
    isStopped = false;
    if (mode !== "quick") saveAllPreferences();
    const panel = document.getElementById("eam-forecast-panel");
    if (panel) panel.style.display = "none";
    if (mode === "quick") setStatus(mode, "Jumping...", "#3498db");
    else if (mode === "clear") setStatus(mode, "Clearing...", "#f1c40f");
    else triggerThunderstrike();
    await navigateTo("Work Orders", ["Work", "Work Orders"]);
    setStatus(mode, "Expanding...", "#f1c40f");
    let gridFound = false;
    for (let i = 0; i < 40; i++) {
      if (isGridReady()) {
        gridFound = true;
        break;
      }
      await delay(250);
    }
    if (!gridFound) {
      setStatus(mode, "Grid timeout.", "#e74c3c");
      isRunning = false;
      return;
    }
    await returnToListView();
    setStatus(mode, mode === "clear" ? "Wiping Fields..." : "Injecting API...", "#f1c40f");
    const todayOnlyCheckbox = document.getElementById("eam-today-only-toggle");
    const isTodayOnly = todayOnlyCheckbox && todayOnlyCheckbox.checked;
    const effectiveStartDate = dates.start || dates.end;
    const effectiveEndDate = dates.end || dates.start;
    const isSingleDay = effectiveStartDate === effectiveEndDate;
    let startOpClass = "fo_con";
    let endOpClass = "fo_con";
    if (mode !== "quick" && mode !== "clear") {
      if (isSingleDay) {
        startOpClass = isTodayOnly ? "fo_eq" : "fo_lte";
      } else {
        startOpClass = "fo_gte";
        endOpClass = "fo_lte";
      }
    }
    const extjsFilterData = {
      isClearMode: mode === "clear",
      isWoSearch: mode === "quick",
      org: mode === "quick" || mode === "clear" ? "" : orgText,
      woNum: mode === "quick" ? quickSearchText : mode === "clear" ? "" : null,
      desc: mode === "quick" || mode === "clear" ? "" : descText,
      descOpClass: descOp === "Contains" ? "fo_con" : "fo_dncon",
      assigned: mode === "quick" || mode === "clear" ? "" : assignedText,
      shift: mode === "quick" || mode === "clear" ? "" : shiftText,
      start: mode === "quick" || mode === "clear" ? "" : effectiveStartDate,
      startOpClass,
      end: mode === "quick" || mode === "clear" || isSingleDay ? "" : effectiveEndDate,
      endOpClass
    };
    applyForecastFiltersExtJS(extjsFilterData);
    if (mode === "clear") {
      setStatus(mode, "", "#1abc9c");
    } else {
      setStatus(mode, "", "#18bc9c");
      if (mode === "quick") document.getElementById("apm-qs-input").value = "";
    }
    isRunning = false;
  }
  function getIsRunning() {
    return isRunning;
  }

  // src/ui/dom-helpers.js
  function el(tag, props = {}, children = []) {
    const element = document.createElement(tag);
    for (const [key, value] of Object.entries(props)) {
      if (key === "style" && typeof value === "object") {
        Object.assign(element.style, value);
      } else if (key === "dataset" && typeof value === "object") {
        Object.assign(element.dataset, value);
      } else if (key.startsWith("on") && typeof value === "function") {
        element[key] = value;
      } else if (key === "className") {
        element.className = value;
      } else if (key === "innerHTML") {
        element.innerHTML = value;
      } else if (["checked", "value", "disabled", "readOnly", "title"].includes(key)) {
        element[key] = value;
      } else {
        element.setAttribute(key, value);
      }
    }
    for (const child of children) {
      if (typeof child === "string" || typeof child === "number") {
        element.appendChild(document.createTextNode(child));
      } else if (child instanceof HTMLElement || child instanceof SVGElement) {
        element.appendChild(child);
      }
    }
    return element;
  }

  // src/core/updater.js
  var updateListeners = [];
  function isNewerVersion(oldVer, newVer) {
    const oldParts = oldVer.split(".").map(Number);
    const newParts = newVer.split(".").map(Number);
    for (let i = 0; i < Math.max(oldParts.length, newParts.length); i++) {
      const o = oldParts[i] || 0;
      const n = newParts[i] || 0;
      if (n > o) return true;
      if (n < o) return false;
    }
    return false;
  }
  function subscribeToUpdates(callback) {
    updateListeners.push(callback);
    if (window._apmUpdateAvailable) callback();
  }
  function checkForGlobalUpdates() {
    if (window._apmUpdateChecked) return;
    window._apmUpdateChecked = true;
    console.log("[APM Master] Checking for updates...", CURRENT_VERSION);
    fetch(UPDATE_URL).then((response) => response.text()).then((text) => {
      const match = text.match(/\/\/\s*@version\s+([0-9\.]+)/);
      if (match && match[1]) {
        const remoteVersion = match[1];
        if (isNewerVersion(CURRENT_VERSION, remoteVersion)) {
          window._apmUpdateAvailable = true;
          console.log(`[APM Master] \u2728 Update available! Current: ${CURRENT_VERSION}, Remote: ${remoteVersion}`);
          updateListeners.forEach((cb) => cb());
        }
      }
    }).catch((e) => console.warn("[APM Master] Update check failed silently.", e));
  }

  // src/modules/forecast/forecast-ui.js
  function setStatus(mode, msg, color) {
    if (window.self !== window.top) return;
    let banner = document.getElementById("apm-global-status");
    if (!banner) {
      banner = document.createElement("div");
      banner.id = "apm-global-status";
      banner.style.cssText = `
            position: fixed; top: 15px; left: 50%; transform: translateX(-50%);
            z-index: 999999; padding: 8px 24px; border-radius: 30px;
            font-family: sans-serif; font-weight: bold; font-size: 14px;
            background-color: #2c3e50; box-shadow: 0 4px 15px rgba(0,0,0,0.5);
            display: none; text-align: center; pointer-events: none;
            transition: opacity 0.2s ease-in-out;
        `;
      document.body.appendChild(banner);
    }
    const cleanMsg = (msg || "").trim().toLowerCase();
    if (!cleanMsg || cleanMsg === "ready" || cleanMsg === "done") {
      banner.style.display = "none";
      return;
    }
    banner.textContent = msg;
    banner.style.color = color || "#ffffff";
    banner.style.border = `2px solid ${color || "#34495e"}`;
    banner.style.display = "block";
    if (window._apmStatusTO) clearTimeout(window._apmStatusTO);
    if (color === "#e74c3c") {
      window._apmStatusTO = setTimeout(() => {
        banner.style.display = "none";
      }, 4e3);
    }
  }
  function triggerThunderstrike() {
    const overlay = document.createElement("div");
    overlay.className = "thunder-overlay";
    const bolt = document.createElement("div");
    bolt.className = "center-lightning";
    bolt.innerHTML = `<svg viewBox="0 0 24 24" width="250" height="250"><path d="M18,3 L5,16 L11,16 L7,26 L20,11 L13,11 Z" fill="#f1c40f"/></svg>`;
    document.body.appendChild(overlay);
    document.body.appendChild(bolt);
    setTimeout(() => {
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
      if (bolt.parentNode) bolt.parentNode.removeChild(bolt);
    }, 1e3);
  }
  function checkForUpdates() {
    subscribeToUpdates(() => {
      const updateContainer = document.getElementById("eam-update-container");
      if (updateContainer) updateContainer.style.display = "block";
    });
  }
  function buildSearchUI() {
    if (window.self !== window.top) return;
    let ui = document.getElementById("apm-quick-search-container");
    if (ui) return ui;
    ui = el("div", { id: "apm-quick-search-container", className: "apm-qs-container", style: { display: "flex" } }, [
      el("span", { className: "apm-qs-label" }, "Quick Search:"),
      el("input", { type: "text", id: "apm-qs-input", placeholder: "Jump to WO...", autocomplete: "off", className: "apm-qs-input" }),
      el("button", { id: "apm-qs-btn", className: "apm-qs-btn", innerHTML: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>' }),
      el("span", { id: "apm-qs-status", className: "apm-qs-status" })
    ]);
    document.body.appendChild(ui);
    const qsInput = document.getElementById("apm-qs-input");
    const qsBtn = document.getElementById("apm-qs-btn");
    qsBtn.addEventListener("mouseover", () => qsBtn.style.background = "rgba(255,255,255,0.2)");
    qsBtn.addEventListener("mouseout", () => qsBtn.style.background = "rgba(255,255,255,0.1)");
    const doSearch = () => {
      const val = qsInput.value.trim();
      if (val && !getIsRunning()) executeForecast("quick");
    };
    qsBtn.addEventListener("click", doSearch);
    qsInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        e.stopPropagation();
        doSearch();
      }
    }, true);
    return ui;
  }
  function buildForecastUI() {
    if (window.self !== window.top) return;
    let panel = document.getElementById("eam-forecast-panel");
    if (!panel) {
      let updateCheckboxVisuals = function() {
        const userChecked = checkboxes.filter((cb) => cb.dataset.explicit === "true").map((cb) => parseInt(cb.value, 10));
        const weekSelect = document.getElementById("eam-week-select");
        const prevVal = weekSelect.value;
        if (userChecked.length === 0) {
          checkboxes.forEach((cb) => {
            cb.checked = false;
            cb.disabled = false;
            cb.parentElement.style = "color:white; opacity:1; cursor:pointer; display:flex; flex-direction:column; align-items:center; gap:4px;";
          });
          if (weekSelect.dataset.cumulative === "true") {
            weekSelect.innerHTML = `<option value="0">This Week</option><option value="1">Next Week</option><option value="2">2 Weeks From Now</option><option value="3">3 Weeks From Now</option>`;
            weekSelect.dataset.cumulative = "false";
            weekSelect.value = prevVal;
          }
          return;
        }
        const min = Math.min(...userChecked), max = Math.max(...userChecked);
        const isAllDays = min === 0 && max === 6;
        if (isAllDays && weekSelect.dataset.cumulative !== "true") {
          weekSelect.innerHTML = `<option value="0">This Week</option><option value="1">Next 2 Weeks</option><option value="2">Next 3 Weeks</option><option value="3">Next 4 Weeks</option>`;
          weekSelect.dataset.cumulative = "true";
          weekSelect.value = prevVal;
        } else if (!isAllDays && weekSelect.dataset.cumulative === "true") {
          weekSelect.innerHTML = `<option value="0">This Week</option><option value="1">Next Week</option><option value="2">2 Weeks From Now</option><option value="3">3 Weeks From Now</option>`;
          weekSelect.dataset.cumulative = "false";
          weekSelect.value = prevVal;
        }
        checkboxes.forEach((cb, i) => {
          const baseStyle = "display:flex; flex-direction:column; align-items:center; gap:4px; ";
          if (i === min || i === max) {
            cb.checked = true;
            cb.disabled = false;
            cb.dataset.explicit = "true";
            cb.parentElement.style = baseStyle + "color:#1abc9c; opacity:1; cursor:pointer; font-weight:bold; text-shadow: 0 0 5px rgba(26,188,156,0.5);";
          } else if (i > min && i < max) {
            cb.checked = true;
            cb.disabled = true;
            cb.dataset.explicit = "false";
            cb.parentElement.style = baseStyle + "color:#7f8c8d; opacity:0.5; cursor:not-allowed; font-style:italic;";
          } else {
            cb.checked = false;
            cb.disabled = false;
            cb.dataset.explicit = "false";
            cb.parentElement.style = baseStyle + "color:white; opacity:1; cursor:pointer; font-weight:normal;";
          }
        });
      };
      panel = document.createElement("div");
      panel.id = "eam-forecast-panel";
      panel.style.display = "none";
      panel.className = "eam-fc-container";
      const header = el("div", { className: "eam-fc-header" }, [
        el("div", { className: "eam-fc-title-box" }, [
          el("h4", { className: "eam-fc-title", innerHTML: 'WO Forecast <span style="color:#1abc9c; font-weight: bold;">Tool</span>' }),
          el("div", { className: "rain-cloud-always", style: { color: "#1abc9c", marginTop: "-3px" }, innerHTML: SVG_CLOUD })
        ]),
        el("div", { className: "eam-fc-controls" }, [
          el("button", { id: "eam-mode-toggle", className: "eam-fc-mode-btn" }, "Simple Mode \u{1F343}"),
          el("button", { id: "eam-btn-close", className: "eam-fc-close-btn" }, "\u2716")
        ])
      ]);
      const mainView = el("div", { id: "eam-main-view" }, [
        el("div", { id: "eam-adv-site", className: "eam-fc-adv-box" }, [
          el("div", { className: "eam-fc-row" }, [
            el("label", { className: "eam-fc-label" }, "Site Code (Org):"),
            el("select", { id: "eam-org-select", className: "eam-fc-select", style: { textTransform: "uppercase" } }, [
              el("option", { value: "" }, "-- All Sites --")
            ]),
            el("button", { id: "eam-add-org-btn", className: "org-btn org-btn-add", title: "Add New Site" }, "+"),
            el("button", { id: "eam-rem-org-btn", className: "org-btn org-btn-rem", title: "Remove Selected Site" }, "-")
          ])
        ]),
        el("div", { className: "eam-fc-date-header" }, [
          el("label", { className: "eam-fc-date-label" }, "Date Range:"),
          el("button", { id: "eam-date-mode-toggle", className: "eam-fc-date-toggle" }, "Switch to Custom Dates \u{1F4C5}")
        ]),
        el("div", { id: "eam-relative-dates" }, [
          el("div", { className: "eam-fc-week-row" }, [
            el("label", { className: "eam-fc-label" }, "Target Week:"),
            el("select", { id: "eam-week-select", dataset: { cumulative: "false" }, className: "eam-fc-select" }, [
              el("option", { value: "0" }, "This Week"),
              el("option", { value: "1" }, "Next Week"),
              el("option", { value: "2" }, "2 Weeks From Now"),
              el("option", { value: "3" }, "3 Weeks From Now")
            ])
          ]),
          el("div", { id: "eam-day-checkboxes", className: "eam-fc-days-box" }, [
            ...["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
              (day, i) => el("label", { style: { cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" } }, [
                el("input", { type: "checkbox", value: String(i) }),
                ` ${day}`
              ])
            )
          ])
        ]),
        el("div", { id: "eam-custom-dates", className: "eam-fc-custom-dates" }, [
          el("div", { className: "eam-fc-custom-row" }, [
            el("label", { style: { fontSize: "12px", color: "#b0bec5", width: "40px" } }, "From:"),
            el("input", { type: "date", id: "eam-custom-start", className: "eam-fc-date-input" })
          ]),
          el("div", { className: "eam-fc-custom-row" }, [
            el("label", { style: { fontSize: "12px", color: "#b0bec5", width: "40px" } }, "To:"),
            el("input", { type: "date", id: "eam-custom-end", className: "eam-fc-date-input" })
          ])
        ]),
        el("div", { id: "eam-adv-assigned", className: "eam-fc-assigned-box" }, [
          el("label", { className: "eam-fc-label" }, "Assigned:"),
          el("input", { type: "text", id: "eam-assigned-text", placeholder: "(Optional)", className: "eam-fc-input-text" }),
          el("label", { className: "eam-fc-label", style: { marginLeft: "5px" } }, "Shift:"),
          el("input", { type: "text", id: "eam-shift-text", placeholder: "(Opt)", className: "eam-fc-shift-text" })
        ]),
        el("div", { className: "eam-fc-desc-box" }, [
          el("label", { className: "eam-fc-label" }, "Description:"),
          el("select", { id: "eam-desc-op", className: "eam-fc-select" }, [
            el("option", { value: "Contains" }, "Include"),
            el("option", { value: "Does Not Contain" }, "Exclude")
          ]),
          el("input", { type: "text", id: "eam-desc-text", placeholder: "Keyword (Optional)...", className: "eam-fc-desc-input" })
        ]),
        el("div", { className: "eam-fc-run-box" }, [
          el("button", { id: "eam-btn-run", className: "eam-fc-btn-run" }, "Run Search"),
          el("div", { className: "eam-fc-today-box" }, [
            el("label", { className: "eam-fc-today-lbl" }, [
              el("div", { className: "eam-slider-switch" }, [
                el("input", { type: "checkbox", id: "eam-today-only-toggle" }),
                el("span", { className: "eam-slider-track" })
              ]),
              el("span", { id: "eam-today-toggle-text", className: "eam-fc-today-txt" }, "Includes Past Due")
            ]),
            el("button", { id: "eam-btn-today", className: "eam-fc-btn-today", title: "Search Today (Alt + T)" }, "Today")
          ])
        ]),
        el("div", { className: "eam-fc-footer" }, [
          el("button", { id: "eam-help-btn", className: "eam-fc-help-link" }, "\u2139\uFE0F Help & Tips"),
          el("span", { innerHTML: 'Shortcuts: <b style="color:#bdc3c7;">Alt + T</b> (Today) | <b style="color:#bdc3c7;">Alt + C</b> (Clear Grid)' })
        ])
      ]);
      const guideContainer = el("div", { id: "eam-guide-container", className: "eam-fc-guide-box" }, [
        el("p", { className: "eam-fc-guide-text" }, 'The Forecast Tool eliminates the manual "click-and-wait" fatigue of filtering Work Orders. It automates navigation, grid expansion, and multi-field filtering into a single, lightning-fast action.'),
        el("h4", { className: "eam-fc-guide-hdr" }, "1. Setting Your Parameters"),
        el("ul", { className: "eam-fc-guide-list" }, [
          el("li", { innerHTML: "<strong>Site Code (Org):</strong> Available in Advanced Mode. Select your site or leave blank to search all." }),
          el("li", { innerHTML: "<strong>Target Week & Days:</strong> Choose your week and click the days you want to filter, or swap to Custom Dates \u{1F4C5} for absolute calendar picking." }),
          el("li", { innerHTML: `<strong>Today Modifier:</strong> Use the slider next to the 'Today' button to switch between "Today Only" (strict exact match) or "Includes Past Due" (pulls everything up to today).` })
        ]),
        el("h4", { className: "eam-fc-guide-hdr" }, "2. Advanced Filters"),
        el("ul", { className: "eam-fc-guide-list" }, [
          el("li", { innerHTML: "Use the <strong>Description</strong> field to narrow your results." }),
          el("li", { innerHTML: '<em>Tip:</em> The Description dropdown lets you choose whether a keyword should be Included (e.g., only show "13 Week") or Excluded (e.g., hide all "Daily").' })
        ]),
        el("h4", { className: "eam-fc-guide-hdr" }, "3. Power User Shortcuts"),
        el("ul", { className: "eam-fc-guide-list" }, [
          el("li", { innerHTML: `<strong>Alt + T (Quick Today):</strong> The "Thunderbolt" shortcut. Press this anywhere in EAM to instantly run a search for Today's Work Orders.` }),
          el("li", { innerHTML: "<strong>Alt + C (Quick Clear):</strong>This will instantly clear all search fields if you need to manually search something" })
        ]),
        el("h4", { className: "eam-fc-guide-hdr" }, "4. Fast Booked Labor Check"),
        el("ul", { className: "eam-fc-guide-list" }, [
          el("li", { innerHTML: 'Use the floating "LABOR TALLY \u23F1\uFE0F" tab on the edge of your screen to instantly check your hours from anywhere in EAM. You can drag and snap it to any edge of your browser.' })
        ]),
        el("div", { className: "eam-fc-guide-back" }, [
          el("button", { id: "eam-guide-back-btn", className: "eam-fc-help-link" }, "\u{1F519} Back to Tool")
        ])
      ]);
      const statusLabel = el("div", { id: "eam-status", className: "eam-fc-status" });
      const updateContainer = el("div", { id: "eam-update-container", className: "eam-fc-update-box" }, [
        el("a", { href: "https://raw.githubusercontent.com/jaker788-create/APM-Master/main/forecast.user.js", target: "_blank", className: "apm-footer-update-btn" }, "\u2728 Update Available")
      ]);
      panel.appendChild(header);
      panel.appendChild(mainView);
      panel.appendChild(guideContainer);
      panel.appendChild(statusLabel);
      panel.appendChild(updateContainer);
      document.body.appendChild(panel);
      document.getElementById("eam-btn-run").onmouseover = function() {
        this.style.backgroundColor = "#16a085";
      };
      document.getElementById("eam-btn-run").onmouseout = function() {
        this.style.backgroundColor = "#1abc9c";
      };
      document.getElementById("eam-btn-today").onmouseover = function() {
        this.style.backgroundColor = "#2980b9";
      };
      document.getElementById("eam-btn-today").onmouseout = function() {
        this.style.backgroundColor = "#3498db";
      };
      const renderOrgs = () => {
        const select = document.getElementById("eam-org-select");
        if (!select) return;
        select.innerHTML = '<option value="">-- All Sites --</option>';
        savedOrgs.forEach((org) => {
          const opt = document.createElement("option");
          opt.value = org;
          opt.textContent = org;
          if (org === selectedOrg) opt.selected = true;
          select.appendChild(opt);
        });
        select.value = selectedOrg || "";
      };
      const checkboxes = Array.from(panel.querySelectorAll('#eam-day-checkboxes input[type="checkbox"]'));
      const todayToggle = document.getElementById("eam-today-only-toggle");
      const todayToggleText = document.getElementById("eam-today-toggle-text");
      const updateTodayToggleUI = () => {
        if (todayToggle.checked) {
          todayToggleText.textContent = "Today Only";
        } else {
          todayToggleText.textContent = "Includes Past Due";
        }
      };
      todayToggle.addEventListener("change", () => {
        updateTodayToggleUI();
        saveAllPreferences();
      });
      let weekToSet = "0";
      let isSimpleMode = true;
      let isCustomDateMode = false;
      const prefs = loadPreferences();
      if (prefs) {
        if (prefs.descOp) document.getElementById("eam-desc-op").value = prefs.descOp;
        if (prefs.descText !== void 0) document.getElementById("eam-desc-text").value = prefs.descText;
        if (prefs.assignedText !== void 0) document.getElementById("eam-assigned-text").value = prefs.assignedText;
        if (prefs.shiftText !== void 0) document.getElementById("eam-shift-text").value = prefs.shiftText;
        if (prefs.week) weekToSet = prefs.week;
        if (prefs.isSimpleMode !== void 0) isSimpleMode = prefs.isSimpleMode;
        if (prefs.todayOnly !== void 0) document.getElementById("eam-today-only-toggle").checked = prefs.todayOnly;
        if (prefs.isCustomDateMode !== void 0) isCustomDateMode = prefs.isCustomDateMode;
        if (prefs.customStart) document.getElementById("eam-custom-start").value = prefs.customStart;
        if (prefs.customEnd) document.getElementById("eam-custom-end").value = prefs.customEnd;
        if (prefs.days && Array.isArray(prefs.days)) {
          checkboxes.forEach((cb, i) => {
            cb.checked = prefs.days[i];
            cb.dataset.explicit = prefs.days[i] ? "true" : "false";
          });
        }
      }
      renderOrgs();
      updateCheckboxVisuals();
      updateTodayToggleUI();
      document.getElementById("eam-week-select").value = weekToSet;
      const dateModeBtn = document.getElementById("eam-date-mode-toggle");
      const relDates = document.getElementById("eam-relative-dates");
      const custDates = document.getElementById("eam-custom-dates");
      const updateDateModeDisplay = () => {
        if (isCustomDateMode) {
          relDates.style.display = "none";
          custDates.style.display = "flex";
          dateModeBtn.innerHTML = "Switch to Relative \u26A1";
        } else {
          relDates.style.display = "block";
          custDates.style.display = "none";
          dateModeBtn.innerHTML = "Switch to Custom Dates \u{1F4C5}";
        }
      };
      updateDateModeDisplay();
      dateModeBtn.onclick = () => {
        isCustomDateMode = !isCustomDateMode;
        if (isCustomDateMode) {
          const weekSelect = document.getElementById("eam-week-select");
          const isCumulative = weekSelect.dataset.cumulative === "true";
          const userChecked = checkboxes.filter((cb) => cb.dataset.explicit === "true").map((cb) => parseInt(cb.value, 10));
          if (userChecked.length > 0) {
            const dates = getDateRange(weekSelect.value, Math.min(...userChecked), Math.max(...userChecked), isCumulative);
            if (dates) {
              const toYMD = (dStr) => {
                const p = dStr.split("/");
                return `${p[2]}-${p[0].padStart(2, "0")}-${p[1].padStart(2, "0")}`;
              };
              document.getElementById("eam-custom-start").value = toYMD(dates.start);
              document.getElementById("eam-custom-end").value = toYMD(dates.end);
            }
          }
        }
        updateDateModeDisplay();
        saveAllPreferences();
      };
      const modeBtn = document.getElementById("eam-mode-toggle");
      const advSite = document.getElementById("eam-adv-site");
      const advAssigned = document.getElementById("eam-adv-assigned");
      const updateModeDisplay = () => {
        if (isSimpleMode) {
          advSite.style.display = "none";
          advAssigned.style.display = "none";
          modeBtn.innerHTML = "Simple Mode \u{1F343}";
          modeBtn.style.color = "#1abc9c";
          modeBtn.style.borderColor = "#1abc9c";
          modeBtn.style.background = "#2b343c";
        } else {
          advSite.style.display = "flex";
          advAssigned.style.display = "flex";
          modeBtn.innerHTML = "Advanced \u2699\uFE0F";
          modeBtn.style.color = "#e67e22";
          modeBtn.style.borderColor = "#e67e22";
          modeBtn.style.background = "rgba(230, 126, 34, 0.1)";
        }
      };
      updateModeDisplay();
      modeBtn.onclick = () => {
        isSimpleMode = !isSimpleMode;
        updateModeDisplay();
        saveAllPreferences();
      };
      document.getElementById("eam-add-org-btn").onclick = () => {
        const newOrg = prompt("Enter new Site Code (Org):");
        if (newOrg && newOrg.trim()) {
          const cleanOrg = newOrg.trim().toUpperCase();
          if (cleanOrg === "ALL SITES" || cleanOrg === "-- ALL SITES --") {
            setSelectedOrg("");
          } else {
            if (!savedOrgs.includes(cleanOrg)) {
              setSavedOrgs([...savedOrgs, cleanOrg]);
            }
            setSelectedOrg(cleanOrg);
          }
          renderOrgs();
          saveAllPreferences();
        }
      };
      document.getElementById("eam-rem-org-btn").onclick = () => {
        const select = document.getElementById("eam-org-select");
        const current = select.value;
        if (!current) {
          alert('Cannot remove the default "All Sites" option.');
          return;
        }
        if (confirm(`Are you sure you want to remove ${current} from your list?`)) {
          setSavedOrgs(savedOrgs.filter((o) => o !== current));
          setSelectedOrg("");
          renderOrgs();
          saveAllPreferences();
        }
      };
      checkboxes.forEach((cb) => {
        cb.addEventListener("change", (e) => {
          e.target.dataset.explicit = e.target.checked ? "true" : "false";
          updateCheckboxVisuals();
        });
      });
      document.getElementById("eam-btn-close").onclick = () => {
        panel.style.display = "none";
        document.getElementById("eam-main-view").style.display = "block";
        document.getElementById("eam-guide-container").style.display = "none";
      };
      document.getElementById("eam-help-btn").onclick = () => {
        document.getElementById("eam-main-view").style.display = "none";
        document.getElementById("eam-guide-container").style.display = "block";
      };
      document.getElementById("eam-guide-back-btn").onclick = () => {
        document.getElementById("eam-main-view").style.display = "block";
        document.getElementById("eam-guide-container").style.display = "none";
      };
      document.getElementById("eam-btn-run").onclick = () => {
        if (!getIsRunning()) executeForecast("normal");
      };
      document.getElementById("eam-btn-today").onclick = () => {
        if (!getIsRunning()) executeForecast("today");
      };
      const enterTriggerFields = ["eam-desc-text", "eam-assigned-text", "eam-shift-text"];
      enterTriggerFields.forEach((id) => {
        document.getElementById(id).addEventListener("keydown", (e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            if (!getIsRunning()) executeForecast("normal");
          }
        });
      });
      checkForUpdates();
    }
  }
  function initForecastShortcuts() {
    const handleHotkey = (action, isWO = false) => {
      if (window.self !== window.top) {
        window.top.postMessage({ apmMaster: "hotkey", action, isWO }, "*");
      } else {
        executeForecast(action);
      }
    };
    const checkKey = (e) => {
      const key = e.key.toLowerCase();
      if (e.altKey && key === "t") {
        e.preventDefault();
        e.stopPropagation();
        handleHotkey("today");
        return true;
      }
      if (e.altKey && key === "c") {
        e.preventDefault();
        e.stopPropagation();
        let isWO = false;
        try {
          isWO = (window.EAM?.AppData?.systemFunction || "").includes("JOBS") || window.location.href.includes("JOBS");
        } catch (err) {
        }
        handleHotkey("clear", isWO);
        return true;
      }
      return false;
    };
    if (window._apmHotkeysBound) return;
    window.checkApmHotkey = checkKey;
    window.addEventListener("keydown", checkKey, true);
    window._apmHotkeysBound = true;
    const bindExtHotkeys = function() {
      if (window.Ext && window.Ext.onReady) {
        window.Ext.onReady(function() {
          const doc = window.Ext.getDoc();
          if (doc && !doc.hasApmHotkeys) {
            doc.on("keydown", (e) => {
              if (checkKey(e.browserEvent || e)) e.stopEvent();
            });
            doc.hasApmHotkeys = true;
          }
        });
      } else {
        setTimeout(bindExtHotkeys, 500);
      }
    };
    if (document.readyState === "complete") {
      setTimeout(bindExtHotkeys, 1e3);
    } else {
      window.addEventListener("load", () => setTimeout(bindExtHotkeys, 1e3));
    }
  }

  // src/core/scheduler.js
  var TaskScheduler = class {
    constructor() {
      this.tasks = [];
      this.running = false;
      this.timeoutId = null;
    }
    /**
     * Register a recurring task
     * @param {string} id - Unique identifier
     * @param {number} intervalMs - Minimum time between executions
     * @param {Function} callback - Function to execute
     * @param {boolean} executeImmediately - If true, execute once upon registration
     */
    registerTask(id, intervalMs, callback, executeImmediately = false) {
      this.tasks = this.tasks.filter((t) => t.id !== id);
      this.tasks.push({
        id,
        intervalMs,
        callback,
        lastRun: executeImmediately ? 0 : performance.now()
      });
      if (!this.running) {
        this.start();
      }
      if (executeImmediately) {
        this.tick();
      }
    }
    removeTask(id) {
      const idx = this.tasks.findIndex((t) => t.id === id);
      if (idx === -1) return;
      this.tasks.splice(idx, 1);
      if (this.tasks.length === 0) {
        this.stop();
      }
    }
    start() {
      if (this.running) return;
      this.running = true;
      this.tick();
    }
    stop() {
      this.running = false;
      if (this.timeoutId !== null) {
        clearTimeout(this.timeoutId);
        this.timeoutId = null;
      }
    }
    tick() {
      if (!this.running) return;
      const now = performance.now();
      let nextTickDelay = 500;
      this.tasks.forEach((task) => {
        if (now - task.lastRun >= task.intervalMs) {
          try {
            task.callback();
          } catch (e) {
            console.error(`[APM Scheduler] Error in task '${task.id}':`, e);
          }
          task.lastRun = now;
        } else {
          const timeStr = task.intervalMs - (now - task.lastRun);
          if (timeStr > 0 && timeStr < nextTickDelay) {
            nextTickDelay = timeStr;
          }
        }
      });
      this.timeoutId = setTimeout(() => {
        if (this.running) this.tick();
      }, Math.max(100, nextTickDelay));
    }
  };
  var APMScheduler = new TaskScheduler();

  // src/modules/forecast/forecast-filter.js
  var ForecastFilter = /* @__PURE__ */ (function() {
    let filterState = 0;
    let lastKnownStoreId = null;
    const TARGET_DATA_INDEX = "duedate";
    const STATES = [
      { label: "Filter: Show All", bg: "#7f8c8d" },
      { label: "Filter: PMs Only", bg: "#1abc9c" },
      { label: "Filter: Non-PMs", bg: "#3498db" }
    ];
    function getTargetContext() {
      return findMainGrid();
    }
    function updateFooterTextNatively(grid, count) {
      const bbar = grid.getDockedItems('toolbar[dock="bottom"]')[0];
      if (bbar) {
        const textItem = bbar.down("tbtext");
        if (textItem) {
          textItem.suspendEvents();
          textItem.setText(`Records: ${count} of ${count}`);
          textItem.resumeEvents();
        }
      }
    }
    function applyStoreFilter() {
      const ctx = getTargetContext();
      if (!ctx) return;
      const { grid } = ctx;
      const store = grid.getStore();
      store.suspendEvents();
      if (store._nativeGetTotalCount) {
        store.getTotalCount = store._nativeGetTotalCount;
      }
      store.clearFilter();
      if (filterState === 0) {
        const realCount = store.getCount();
        updateFooterTextNatively(grid, realCount);
        store.resumeEvents();
        grid.getView().refresh();
        return;
      }
      store.filterBy((record) => {
        const val = record.get(TARGET_DATA_INDEX);
        const isBlank = !val || val.toString().trim() === "" || val === null;
        return filterState === 1 ? !isBlank : isBlank;
      });
      const count = store.getCount();
      if (!store._nativeGetTotalCount) store._nativeGetTotalCount = store.getTotalCount;
      store.getTotalCount = function() {
        return count;
      };
      updateFooterTextNatively(grid, count);
      store.resumeEvents();
      grid.getView().refresh();
      if (grid.view && grid.view.el) grid.view.el.setScrollTop(0);
    }
    function toggleGridFilter(btn) {
      filterState = (filterState + 1) % 3;
      btn.style.background = STATES[filterState].bg;
      btn.textContent = STATES[filterState].label;
      applyStoreFilter();
    }
    function injectForecastFilter() {
      const ctx = getTargetContext();
      if (!ctx) return;
      const { doc, grid } = ctx;
      const store = grid.getStore();
      if (filterState !== 0 && store.storeId !== lastKnownStoreId) {
        applyStoreFilter();
      }
      lastKnownStoreId = store.storeId;
      const dataspyInput = doc.querySelector('input[name="dataspylist"]');
      if (!dataspyInput || dataspyInput.offsetWidth === 0) return;
      const toolbarContainer = dataspyInput.closest(".x-box-target");
      if (!toolbarContainer || doc.getElementById("apm-list-pm-btn")) return;
      const btn = doc.createElement("button");
      btn.id = "apm-list-pm-btn";
      btn.textContent = STATES[filterState].label;
      btn.style.cssText = `
            position: absolute; left: 270px; top: 9px; z-index: 1000;
            padding: 4px 10px; background: ${STATES[filterState].bg};
            color: white; border: none; border-radius: 4px;
            font-weight: bold; cursor: pointer; font-size: 11px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.3); transition: background 0.2s;
        `;
      btn.onclick = (e) => {
        e.preventDefault();
        toggleGridFilter(btn);
      };
      toolbarContainer.appendChild(btn);
    }
    return {
      init: function() {
        APMScheduler.registerTask("forecast-filter", 1500, () => {
          const existingBtn = document.getElementById("apm-list-pm-btn");
          if (existingBtn && filterState === 0) return;
          injectForecastFilter();
        });
      }
    };
  })();

  // src/core/toast.js
  function showToast(msg, color, keepOpen = false) {
    let t = document.getElementById("apm-global-toast");
    if (!t) {
      t = document.createElement("div");
      t.id = "apm-global-toast";
      t.style.cssText = "position:fixed; top:15px; left:50%; transform:translateX(-50%); z-index:9999999; padding:8px 20px; border-radius:30px; font-weight:bold; font-family:sans-serif; font-size:13px; color:white; opacity:0; pointer-events:none; transition:opacity 0.3s ease; box-shadow:0 4px 15px rgba(0,0,0,0.4);";
      document.body.appendChild(t);
    }
    t.innerHTML = msg;
    t.style.background = color || "#3498db";
    t.style.display = "block";
    setTimeout(() => t.style.opacity = "1", 10);
    if (window._apmToastTO) clearTimeout(window._apmToastTO);
    if (!keepOpen) {
      window._apmToastTO = setTimeout(() => {
        t.style.opacity = "0";
        setTimeout(() => t.style.display = "none", 300);
      }, 3e3);
    }
  }

  // src/modules/colorcode/colorcode-engine.js
  var PTP_LINK_CONFIG = {
    woPattern: /\b(1\d{9,}|2\d{9,}|3\d{9,})\b/,
    recordCodePattern: /\b(1\d{9,}|2\d{9,}|3\d{9,})\b/
  };
  var _rowCache = /* @__PURE__ */ new WeakMap();
  var _rowCacheGeneration = 0;
  var _lastRuleFingerprint = "";
  var _ptpHistoryCleaned = false;
  function getPtpHistory() {
    let history = {};
    if (!apmGeneralSettings || !apmGeneralSettings.ptpTrackingEnabled) return history;
    try {
      history = JSON.parse(localStorage.getItem("apm_ptp_history")) || {};
    } catch (e) {
    }
    if (!_ptpHistoryCleaned) {
      _ptpHistoryCleaned = true;
      const now = Date.now();
      const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1e3;
      let changed = false;
      for (const key in history) {
        const entry = history[key];
        const timestamp = typeof entry === "object" ? entry.time : entry;
        if (now - timestamp > SEVEN_DAYS) {
          delete history[key];
          changed = true;
        }
      }
      if (changed) {
        try {
          localStorage.setItem("apm_ptp_history", JSON.stringify(history));
        } catch (e) {
        }
      }
    }
    return history;
  }
  function hexToRgbVals(hex) {
    let r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
    return `${r}, ${g}, ${b}`;
  }
  function fullStyleUpdate(targetDoc) {
    const rules = getRules();
    const settings = getSettings();
    const docs = targetDoc ? [targetDoc] : [document];
    if (!targetDoc) {
      document.querySelectorAll("iframe").forEach((f) => {
        try {
          const fd = f.contentDocument;
          if (fd && fd.readyState !== "loading") docs.push(fd);
        } catch (e) {
        }
      });
    }
    docs.forEach((doc) => {
      const root = doc.documentElement;
      if (!root) return;
      rules.forEach((rule) => {
        if (!rule || !rule.id) return;
        const safeId = rule.id.toString().replace(".", "_");
        root.style.setProperty(`--cc-color-${safeId}`, rule.color);
      });
      const legacy = doc.getElementById("apm-cc-dynamic-styles");
      if (legacy) legacy.remove();
    });
  }
  function processColorCodeGrid(targetDoc) {
    const doc = targetDoc && targetDoc.querySelectorAll ? targetDoc : document;
    const settings = getSettings();
    const rules = getRules();
    if (!settings || !rules || !Array.isArray(rules)) {
      return;
    }
    const activeRules = rules.filter((r) => r.search).map((r) => ({
      ...r,
      searchTerms: r.search.split(",").map((s) => s.trim().toLowerCase()).filter((s) => s)
    }));
    const ptpHistory = getPtpHistory();
    const ruleFingerprint = `${settings.uniformHighlight}|` + rules.map((r) => `${r.id}:${r.search}:${r.fill}:${r.showTag}:${r.color}`).join("|");
    if (ruleFingerprint !== _lastRuleFingerprint) {
      _lastRuleFingerprint = ruleFingerprint;
      _rowCacheGeneration++;
      fullStyleUpdate(doc);
    }
    const buildSafeWoUrl = (woNum) => {
      const currentTenant = window.EAM && window.EAM.AppData && window.EAM.AppData.tenant ? window.EAM.AppData.tenant : LINK_CONFIG.tenant;
      return `https://${window.location.hostname}/web/base/logindisp?tenant=${currentTenant}&FROMEMAIL=YES&SYSTEM_FUNCTION_NAME=${LINK_CONFIG.userFuncName}&USER_FUNCTION_NAME=${LINK_CONFIG.userFuncName}&workordernum=${woNum}`;
    };
    doc.querySelectorAll(".x-grid-item").forEach((row) => {
      try {
        const textLen = row.textContent.length;
        const lowerText = row.textContent.toLowerCase();
        const cached = _rowCache.get(row);
        const rowMatches = activeRules.filter((r) => r.searchTerms.some((term) => lowerText.includes(term)));
        const fillRule = rowMatches.find((r) => r.fill);
        const tagRulesCount = rowMatches.filter((r) => r.showTag).length;
        const currentRuleId = row.getAttribute("data-cc-rule");
        const hasNametags = row.querySelector(".apm-nametag");
        const hasLinkified = row.querySelector(".apm-wo-link");
        const hasPtpTag = row.querySelector(".apm-ptp-status-tag");
        const isVisuallyIncomplete = fillRule && !currentRuleId || tagRulesCount > 0 && !hasNametags || PTP_LINK_CONFIG.woPattern.test(row.textContent) && (!hasLinkified || apmGeneralSettings?.ptpTrackingEnabled && !hasPtpTag);
        if (cached && cached.len === textLen && cached.text === lowerText && cached.gen === _rowCacheGeneration && !isVisuallyIncomplete) {
          return;
        }
        _rowCache.set(row, { len: textLen, text: lowerText, gen: _rowCacheGeneration });
        if (fillRule) {
          row.setAttribute("data-cc-rule", fillRule.id);
          const rgb = hexToRgbVals(fillRule.color);
          const baseOp = settings && settings.uniformHighlight ? "0.22" : "0.15";
          row.style.setProperty("--cc-row-bg", `rgba(${rgb}, ${baseOp})`);
          row.style.setProperty("--cc-row-bg-alt", `rgba(${rgb}, 0.22)`);
          row.style.setProperty("--cc-row-bg-hover", `rgba(${rgb}, 0.30)`);
          row.style.setProperty("--cc-row-bg-sel", `rgba(${rgb}, 0.45)`);
        } else if (row.hasAttribute("data-cc-rule")) {
          row.removeAttribute("data-cc-rule");
          row.style.removeProperty("--cc-row-bg");
          row.style.removeProperty("--cc-row-bg-alt");
          row.style.removeProperty("--cc-row-bg-hover");
          row.style.removeProperty("--cc-row-bg-sel");
        }
        const cells = row.querySelectorAll(".x-grid-cell-inner");
        cells.forEach((cell) => {
          const cellText = cell.textContent;
          const lowerCellText = cellText.toLowerCase();
          if (!cell.querySelector(".apm-wo-link")) {
            const match = cellText.match(PTP_LINK_CONFIG.woPattern);
            if (match) {
              const woNum = match[1];
              const safeUrl = buildSafeWoUrl(woNum);
              const isNewTab = apmGeneralSettings?.openLinksInNewTab;
              const targetAttr = isNewTab ? 'target="_blank"' : "";
              const onclickAttr = isNewTab ? "" : `onclick="event.preventDefault(); event.stopPropagation(); window.top.location.href='${safeUrl}'; return false;"`;
              let linkHtml = `<span style="white-space:nowrap"><a class="apm-wo-link" href="${safeUrl}" ${targetAttr} ${onclickAttr}>${woNum}</a><span class="apm-copy-icon" data-wo-copy-url="${safeUrl}"></span></span>`;
              cell.innerHTML = cell.innerHTML.replace(PTP_LINK_CONFIG.woPattern, linkHtml);
              cell.setAttribute("data-apm-linkified", "true");
              cell.setAttribute("data-wo-num", woNum);
            }
          }
          if (apmGeneralSettings.ptpTrackingEnabled && cell.hasAttribute("data-wo-num")) {
            const woNum = cell.getAttribute("data-wo-num");
            const ptpRecord = ptpHistory[woNum];
            const existingPtpTag = cell.querySelector(".apm-ptp-status-tag");
            if (ptpRecord) {
              const isComplete = ptpRecord.status === "COMPLETE";
              const icon = isComplete ? "\u2705" : "\u274C";
              const statusTxt = isComplete ? "Completed" : "Cancelled/Incomplete";
              const titleTxt = `${statusTxt} PTP on ${new Date(ptpRecord.time).toLocaleDateString()}`;
              const newHtml = `<div class="apm-ptp-status-tag" title="${titleTxt}" style="font-size: 11px; margin-top: 4px; display: inline-flex; align-items: center; gap: 4px; color: var(--text-color); opacity: 0.9;"><span style="font-size:12px;">${icon}</span> PTP</div>`;
              if (!existingPtpTag) {
                cell.insertAdjacentHTML("beforeend", newHtml);
              } else if (existingPtpTag.title !== titleTxt) {
                existingPtpTag.outerHTML = newHtml;
              }
            } else if (existingPtpTag) {
              existingPtpTag.remove();
            }
          } else if (!apmGeneralSettings.ptpTrackingEnabled) {
            const existingPtpTag = cell.querySelector(".apm-ptp-status-tag");
            if (existingPtpTag) existingPtpTag.remove();
          }
          cell.querySelectorAll(".apm-nametag").forEach((tag) => {
            const ruleId = parseFloat(tag.getAttribute("data-cc-id"));
            if (!rowMatches.some((r) => r.id === ruleId && r.showTag)) {
              tag.remove();
            }
          });
          rowMatches.forEach((rule) => {
            if (!rule.showTag || !rule.tag) return;
            const matchingTerms = rule.searchTerms.filter((term) => lowerCellText.includes(term));
            if (matchingTerms.length === 0) return;
            const safeId = rule.id.toString().replace(".", "_");
            const formattedTagText = rule.tag.replace(/\\n/g, "<br>");
            const allTermsCsv = rule.searchTerms.join(", ");
            let existingTag = cell.querySelector(`.apm-nametag[data-cc-id="${rule.id}"]`);
            if (!existingTag) {
              cell.insertAdjacentHTML("beforeend", `<div class="apm-nametag" style="background-color: var(--cc-color-${safeId})" title="Click to filter" data-cc-id="${rule.id}" data-filter-kw="${allTermsCsv}">${formattedTagText}</div>`);
            } else {
              existingTag.style.backgroundColor = `var(--cc-color-${safeId})`;
              existingTag.setAttribute("data-filter-kw", allTermsCsv);
              if (existingTag.innerHTML !== formattedTagText) existingTag.innerHTML = formattedTagText;
            }
          });
        });
        _rowCache.set(row, { len: textLen, text: lowerText, gen: _rowCacheGeneration });
      } catch (e) {
        console.error("[ColorCode] Row processing error:", e);
      }
    });
    try {
      doc.querySelectorAll("span.recordcode").forEach((el2) => {
        const textContent = el2.textContent;
        const match = textContent.match(PTP_LINK_CONFIG.recordCodePattern) || textContent.match(PTP_LINK_CONFIG.woPattern);
        if (match) {
          const woNum = match[0];
          if (!el2.hasAttribute("data-wo-num")) {
            el2.setAttribute("data-wo-num", woNum);
            el2.insertAdjacentHTML("beforeend", `<span class="apm-copy-icon" data-wo-copy-url="${buildSafeWoUrl(woNum)}"></span>`);
          }
          if (apmGeneralSettings.ptpTrackingEnabled) {
            const ptpRecord = ptpHistory[woNum];
            const existingPtpTag = doc.querySelector(".apm-ptp-status-tag-header");
            if (ptpRecord) {
              const isComplete = ptpRecord.status === "COMPLETE";
              const icon = isComplete ? "\u2705" : "\u274C";
              const statusTxt = isComplete ? "Completed" : "Cancelled";
              const titleTxt = `${statusTxt} PTP on ${new Date(ptpRecord.time).toLocaleDateString()}`;
              const newHtml = `<span class="apm-ptp-status-tag-header" title="${titleTxt}" style="font-size: 13px; margin-left: 8px; display: inline-flex; align-items: center; gap: 4px; color: var(--text-color); opacity: 1.0; cursor: help; white-space: nowrap;"><span style="font-size:14px;">${icon}</span> PTP</span>`;
              const descField = doc.querySelector('input[name="description"]');
              const triggerWrap = descField ? descField.closest(".x-form-trigger-wrap") : null;
              if (triggerWrap) {
                const parentBody = triggerWrap.parentElement;
                if (parentBody) {
                  parentBody.style.setProperty("display", "flex", "important");
                  parentBody.style.setProperty("align-items", "center", "important");
                  parentBody.style.setProperty("overflow", "visible", "important");
                  parentBody.style.setProperty("max-width", "none", "important");
                  const existingInDoc = parentBody.querySelector(".apm-ptp-status-tag-header");
                  if (!existingPtpTag && !existingInDoc) {
                    triggerWrap.insertAdjacentHTML("afterend", newHtml);
                  } else if (existingPtpTag && existingPtpTag.title !== titleTxt) {
                    existingPtpTag.outerHTML = newHtml;
                  }
                }
              }
            } else if (existingPtpTag) {
              existingPtpTag.remove();
            }
          } else {
            const existingPtpTag = doc.querySelector(".apm-ptp-status-tag-header");
            if (existingPtpTag) existingPtpTag.remove();
          }
        }
      });
    } catch (e) {
      console.error("[ColorCode] Record view processing error:", e);
    }
  }
  function setupExtGridListeners(win) {
    if (!win.Ext || !win.Ext.override || win.__apmHooksInjected) return;
    try {
      win.addEventListener("APM_PTP_UPDATED_EVENT", () => {
        debouncedProcessColorCodeGrid(win.document, true);
      });
      win.Ext.override(win.Ext.view.Table, {
        refresh: function() {
          this.callParent(arguments);
          debouncedProcessColorCodeGrid(this.el?.dom?.ownerDocument, true);
        },
        onAdd: function() {
          this.callParent(arguments);
          debouncedProcessColorCodeGrid(this.el?.dom?.ownerDocument, true);
        },
        onUpdate: function() {
          this.callParent(arguments);
          debouncedProcessColorCodeGrid(this.el?.dom?.ownerDocument, true);
        }
      });
      win.Ext.ComponentQuery.query("gridpanel, treepanel").forEach((grid) => {
        const view = grid.getView();
        if (view && !view._apmHooksInjected) {
          const trigger = () => debouncedProcessColorCodeGrid(view.el?.dom?.ownerDocument, true);
          view.on("refresh", trigger);
          view.on("itemadd", trigger);
          view.on("itemupdate", trigger);
          view.on("bufferedrefresh", trigger);
          view.on("viewready", trigger);
          view._apmHooksInjected = true;
        }
      });
      win.__apmHooksInjected = true;
    } catch (e) {
    }
  }
  var _ccProcessTO = null;
  var _ccLastRun = 0;
  var DEBOUNCE_MS = 10;
  function debouncedProcessColorCodeGrid(targetContext, forceImmediate = false) {
    const now = Date.now();
    const run = () => {
      _ccLastRun = Date.now();
      if (targetContext) {
        processColorCodeGrid(targetContext);
      } else {
        processColorCodeGrid(document);
        document.querySelectorAll("iframe").forEach((f) => {
          try {
            const fd = f.contentDocument;
            if (fd && fd.readyState !== "loading") processColorCodeGrid(fd);
          } catch (e) {
          }
        });
      }
    };
    if (forceImmediate) {
      run();
      return;
    }
    if (now - _ccLastRun > 500) {
      run();
      return;
    }
    clearTimeout(_ccProcessTO);
    _ccProcessTO = setTimeout(run, DEBOUNCE_MS);
  }
  function invalidateColorCodeCache() {
    _rowCacheGeneration++;
    debouncedProcessColorCodeGrid(null, true);
  }

  // src/modules/colorcode/colorcode-ui.js
  function setupColorCodeLogic() {
    let banner = document.getElementById("apm-filter-banner");
    if (!banner) {
      banner = document.createElement("div");
      banner.id = "apm-filter-banner";
      document.body.appendChild(banner);
    }
    let editingId = null;
    const rContainer = document.getElementById("cc-rules-container");
    if (!rContainer) return;
    const updatePreview = () => {
      const fillBtn = document.getElementById("cc-btn-fill");
      const tagBtn = document.getElementById("cc-btn-tag");
      const colorInput = document.getElementById("cc-color");
      const tagInput = document.getElementById("cc-tag");
      const previewRow = document.getElementById("cc-preview-row");
      const previewTag = document.getElementById("cc-preview-tag");
      if (!previewRow || !previewTag || !colorInput || !tagInput) return;
      const color = colorInput.value;
      const fillActive = fillBtn?.classList.contains("active");
      const tagActive = tagBtn?.classList.contains("active");
      const tagText = tagInput.value.trim();
      if (fillActive) {
        const rgb = hexToRgbVals(color);
        previewRow.style.background = `rgba(${rgb}, 0.22)`;
        previewRow.style.borderLeft = `5px solid ${color}`;
      } else {
        previewRow.style.background = "transparent";
        previewRow.style.borderLeft = "1px solid #45535e";
      }
      if (tagActive && tagText) {
        previewTag.style.display = "block";
        previewTag.style.background = color;
        previewTag.textContent = tagText;
      } else {
        previewTag.style.display = "none";
      }
    };
    const renderRules = () => {
      let rules = getRules();
      rContainer.innerHTML = "";
      if (!rules.length) {
        rContainer.appendChild(el("div", { style: { textAlign: "center", fontSize: "12px", color: "#7f8c8d", margin: "10px" } }, ["No rules found."]));
        return;
      }
      rules.forEach((rule) => {
        const upBtn = el("button", { className: "rule-up-btn", dataset: { id: rule.id }, style: { background: "transparent", border: "none", color: "#b0bec5", cursor: "pointer", fontSize: "12px", padding: "0 4px" } }, ["\u25B2"]);
        const downBtn = el("button", { className: "rule-down-btn", dataset: { id: rule.id }, style: { background: "transparent", border: "none", color: "#b0bec5", cursor: "pointer", fontSize: "12px", padding: "0 4px" } }, ["\u25BC"]);
        const ctrlCol = el("div", { style: { display: "flex", flexDirection: "column", gap: "2px", marginRight: "6px" } }, [upBtn, downBtn]);
        const searchSpan = el("span", { style: { fontSize: "13px", fontWeight: "bold", color: "#ecf0f1", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" } }, [rule.search]);
        let tagDisplaySpan = el("span", { style: { fontSize: "10px", color: "#1abc9c", fontWeight: "bold", background: "rgba(26, 188, 156, 0.1)", padding: "2px 6px", borderRadius: "10px", display: "inline-block", marginTop: "2px", width: "max-content" } }, [rule.tag || "Keywords as Tag"]);
        if (rule.fill && rule.showTag && rule.tag) {
          tagDisplaySpan.textContent = `Fill & Tag: ${rule.tag}`;
          tagDisplaySpan.style.color = "#1abc9c";
          tagDisplaySpan.style.background = "rgba(26, 188, 156, 0.1)";
        } else if (rule.fill) {
          tagDisplaySpan.textContent = "Fill Row Only";
          tagDisplaySpan.style.color = "#f39c12";
          tagDisplaySpan.style.background = "rgba(243, 156, 18, 0.1)";
        } else if (rule.showTag && rule.tag) {
          tagDisplaySpan.textContent = `Tag Only: ${rule.tag}`;
          tagDisplaySpan.style.color = "#3498db";
          tagDisplaySpan.style.background = "rgba(52, 152, 219, 0.1)";
        } else {
          tagDisplaySpan.textContent = "Formatting Disabled";
          tagDisplaySpan.style.color = "#7f8c8d";
          tagDisplaySpan.style.background = "rgba(127, 140, 141, 0.1)";
        }
        const textCol = el("div", { style: { display: "flex", flexDirection: "column", flexGrow: "1", overflow: "hidden", padding: "0 5px" } }, [searchSpan, tagDisplaySpan]);
        const editBtn = el("button", { className: "rule-edit-btn", dataset: { id: rule.id }, style: { background: "#4a5a6a", color: "white", border: "none", borderRadius: "4px", padding: "4px 6px", cursor: "pointer", fontSize: "11px", transition: "background 0.2s" } }, ["\u270F\uFE0F"]);
        const delBtn = el("button", { className: "rule-delete-btn", dataset: { id: rule.id }, style: { background: "transparent", color: "#e74c3c", border: "none", borderRadius: "4px", padding: "4px 6px", cursor: "pointer", fontSize: "12px" } }, ["\u274C"]);
        const actionCol = el("div", { style: { display: "flex", alignItems: "center", gap: "6px" } }, [editBtn, delBtn]);
        const itemEl = el("div", { className: "rule-item", style: { borderLeftColor: rule.color, borderLeftWidth: "5px" } }, [ctrlCol, textCol, actionCol]);
        rContainer.appendChild(itemEl);
      });
      rContainer.querySelectorAll(".rule-delete-btn").forEach((b) => b.onclick = (e) => {
        let rs = getRules();
        setRules(rs.filter((r) => r.id !== parseFloat(e.target.dataset.id)));
        saveSync();
      });
      rContainer.querySelectorAll(".rule-edit-btn").forEach((b) => b.onclick = (e) => {
        editingId = parseFloat(e.target.dataset.id);
        const r = getRules().find((x) => x.id === editingId);
        if (r) {
          document.getElementById("cc-search").value = r.search;
          document.getElementById("cc-tag").value = r.tag || "";
          document.getElementById("cc-color").value = r.color;
          const fillBtn = document.getElementById("cc-btn-fill");
          const tagBtn = document.getElementById("cc-btn-tag");
          if (fillBtn) {
            if (!!r.fill) fillBtn.classList.add("active");
            else fillBtn.classList.remove("active");
            fillBtn.style.background = fillBtn.classList.contains("active") ? "#34495e" : "transparent";
          }
          if (tagBtn) {
            if (!!r.showTag) tagBtn.classList.add("active");
            else tagBtn.classList.remove("active");
            tagBtn.style.background = tagBtn.classList.contains("active") ? "#34495e" : "transparent";
          }
          updatePreview();
          const btnText = document.getElementById("cc-add-btn-text");
          if (btnText) btnText.textContent = "Update Rule";
          else document.getElementById("cc-add-btn").textContent = "Update Rule";
          document.getElementById("cc-add-btn").style.background = "#f39c12";
          document.getElementById("cc-cancel-btn").style.display = "inline-block";
        }
      });
      rContainer.querySelectorAll(".rule-up-btn").forEach((b) => b.onclick = (e) => {
        const id = parseFloat(e.target.dataset.id);
        let rs = getRules();
        const idx = rs.findIndex((r) => r.id === id);
        if (idx > 0) {
          [rs[idx - 1], rs[idx]] = [rs[idx], rs[idx - 1]];
          saveSync();
        }
      });
      rContainer.querySelectorAll(".rule-down-btn").forEach((b) => b.onclick = (e) => {
        const id = parseFloat(e.target.dataset.id);
        let rs = getRules();
        const idx = rs.findIndex((r) => r.id === id);
        if (idx < rs.length - 1) {
          [rs[idx + 1], rs[idx]] = [rs[idx], rs[idx + 1]];
          saveSync();
        }
      });
    };
    const resetForm = () => {
      editingId = null;
      document.getElementById("cc-search").value = "";
      document.getElementById("cc-tag").value = "";
      document.getElementById("cc-color").value = "#e74c3c";
      const fillBtn = document.getElementById("cc-btn-fill");
      const tagBtn = document.getElementById("cc-btn-tag");
      if (fillBtn) {
        fillBtn.classList.add("active");
        fillBtn.style.background = "#34495e";
      }
      if (tagBtn) {
        tagBtn.classList.add("active");
        tagBtn.style.background = "#34495e";
      }
      updatePreview();
      const btnText = document.getElementById("cc-add-btn-text");
      if (btnText) btnText.textContent = "Save Rule";
      else document.getElementById("cc-add-btn").textContent = "Save Rule";
      document.getElementById("cc-add-btn").style.background = "#3498db";
      document.getElementById("cc-cancel-btn").style.display = "none";
    };
    const saveSync = () => {
      saveColorCodeRules();
      fullStyleUpdate();
      renderRules();
      invalidateColorCodeCache();
      debouncedProcessColorCodeGrid();
    };
    const elUniform = document.getElementById("cc-setting-uniform");
    if (elUniform) elUniform.onchange = (e) => {
      getSettings().uniformHighlight = e.target.checked;
      saveColorCodeSettings();
      const lbl = document.getElementById("cc-uniform-label");
      if (lbl) lbl.textContent = e.target.checked ? "Uniform Shading" : "Alternating Shading";
      fullStyleUpdate();
      debouncedProcessColorCodeGrid();
    };
    const elTheme = document.getElementById("cc-setting-theme");
    if (elTheme) elTheme.onchange = (e) => {
      getSettings().theme = e.target.value;
      saveColorCodeSettings();
      if (confirm("Reload to apply theme?")) window.top.location.replace(SESSION_TIMEOUT_URL);
    };
    const elCancelBtn = document.getElementById("cc-cancel-btn");
    if (elCancelBtn) elCancelBtn.onclick = resetForm;
    const elFillBtn = document.getElementById("cc-btn-fill");
    if (elFillBtn) elFillBtn.onclick = () => {
      elFillBtn.classList.toggle("active");
      elFillBtn.style.background = elFillBtn.classList.contains("active") ? "#34495e" : "transparent";
      updatePreview();
    };
    const elTagBtn = document.getElementById("cc-btn-tag");
    if (elTagBtn) elTagBtn.onclick = () => {
      elTagBtn.classList.toggle("active");
      elTagBtn.style.background = elTagBtn.classList.contains("active") ? "#34495e" : "transparent";
      updatePreview();
    };
    document.getElementById("cc-color")?.addEventListener("input", updatePreview);
    document.getElementById("cc-tag")?.addEventListener("input", updatePreview);
    const elAddBtn = document.getElementById("cc-add-btn");
    if (elAddBtn) elAddBtn.onclick = () => {
      const searchInput = document.getElementById("cc-search");
      const s = searchInput?.value.trim();
      if (!s) return;
      const tagInput = document.getElementById("cc-tag");
      const tag = tagInput?.value.trim() || "";
      const fillActive = document.getElementById("cc-btn-fill")?.classList.contains("active") ?? false;
      const tagActive = document.getElementById("cc-btn-tag")?.classList.contains("active") ?? false;
      const nr = {
        search: s,
        tag,
        color: document.getElementById("cc-color")?.value || "#e74c3c",
        fill: fillActive,
        showTag: tagActive && tag.length > 0
      };
      let rs = getRules();
      if (editingId) {
        const idx = rs.findIndex((r) => r.id === editingId);
        if (idx > -1) {
          rs[idx] = { id: rs[idx].id, ...nr };
        }
      } else {
        rs.push({ id: Date.now(), ...nr });
      }
      setRules(rs);
      saveSync();
      resetForm();
      if (searchInput) searchInput.focus();
    };
    const handleEnter = (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        e.stopPropagation();
        elAddBtn.click();
      }
    };
    ["keydown", "keyup", "keypress"].forEach((evt) => {
      document.getElementById("cc-search")?.addEventListener(evt, (e) => {
        if (e.key !== "Tab") e.stopPropagation();
      });
      document.getElementById("cc-tag")?.addEventListener(evt, (e) => {
        if (e.key !== "Tab") e.stopPropagation();
      });
    });
    document.getElementById("cc-search")?.addEventListener("keydown", handleEnter);
    document.getElementById("cc-tag")?.addEventListener("keydown", handleEnter);
    const elExportBtn = document.getElementById("cc-export-btn");
    if (elExportBtn) elExportBtn.onclick = () => {
      try {
        navigator.clipboard.writeText(btoa(unescape(encodeURIComponent(JSON.stringify(getRules()))))).then(() => alert("Configuration code copied!"));
      } catch (e) {
        alert("Export error.");
      }
    };
    const elImportBtn = document.getElementById("cc-import-btn");
    if (elImportBtn) elImportBtn.onclick = () => {
      const input = prompt("Paste configuration code:");
      if (input && input.trim()) {
        try {
          const importedRules = JSON.parse(decodeURIComponent(escape(atob(input.trim()))));
          if (!Array.isArray(importedRules) || importedRules.length === 0) return alert("No valid rules found.");
          let rs = getRules();
          if (confirm("Replace existing rules?")) {
            setRules(importedRules);
          } else {
            importedRules.forEach((r) => {
              r.id = Date.now() + Math.random();
              rs.push(r);
            });
            setRules(rs);
          }
          saveSync();
          alert(`Successfully imported ${importedRules.length} rules!`);
        } catch (e) {
          alert("Invalid code.");
        }
      }
    };
    renderRules();
    updatePreview();
  }

  // src/modules/tab-grid-order/tab-grid-order.js
  var _cachedColumns = null;
  var _cachedColumnsTime = 0;
  function probeExtGridColumns() {
    if (Date.now() - _cachedColumnsTime < 2e3 && _cachedColumns) {
      return _cachedColumns;
    }
    let cols = [];
    const allDocs = getExtWindows();
    for (const win of allDocs) {
      if (win.Ext && win.Ext.ComponentQuery) {
        const grids = win.Ext.ComponentQuery.query("gridpanel");
        const mainGrid = grids.find((g) => g.columns && g.columns.length > 20 && g.rendered);
        if (mainGrid && mainGrid.headerCt) {
          mainGrid.headerCt.items.items.forEach((col) => {
            if (col.rendered && (!col.isHidden || !col.isHidden()) && col.dataIndex) {
              let cleanText = (col.text || col.dataIndex).replace(/<[^>]*>?/gm, "").trim();
              if (cleanText && cleanText !== "&#160;") {
                cols.push({ index: col.dataIndex, text: cleanText });
              }
            }
          });
          break;
        }
      }
    }
    _cachedColumns = cols;
    _cachedColumnsTime = Date.now();
    return cols;
  }
  var _cachedTabs = null;
  var _cachedTabsTime = 0;
  function probeExtTabs() {
    if (Date.now() - _cachedTabsTime < 2e3 && _cachedTabs) {
      return _cachedTabs;
    }
    let tabs = [];
    const allDocs = getExtWindows();
    for (const win of allDocs) {
      if (win.Ext && win.Ext.ComponentQuery) {
        const tabPanels = win.Ext.ComponentQuery.query("tabpanel, uxtabpanel");
        const mainTabPanel = tabPanels.find((tp) => tp.rendered && !tp.isDestroyed && tp.items && tp.items.items.length > 0 && tp.items.items.some((t) => {
          let txt = t.title || t.text || "";
          return txt.includes("Activities") || txt.includes("Checklist") || txt.includes("Comments");
        }));
        if (mainTabPanel) {
          let tabBarWidth = 0;
          let tabBarEl = null;
          try {
            const tabBar = mainTabPanel.getTabBar ? mainTabPanel.getTabBar() : mainTabPanel.tabBar;
            if (tabBar && tabBar.el && tabBar.el.dom) {
              tabBarEl = tabBar.el.dom;
              tabBarWidth = tabBarEl.clientWidth;
            }
          } catch (e) {
          }
          mainTabPanel.items.items.forEach((t) => {
            if (t.isDestroyed) return;
            let cleanText = (t.title || t.text || "").replace(/<[^>]*>?/gm, "").trim();
            if (cleanText && cleanText !== "&#160;") {
              let isOverflow = false;
              if (tabBarWidth > 0 && t.tab && t.tab.el && t.tab.el.dom) {
                const tabLeft = t.tab.el.dom.offsetLeft;
                const tabRight = tabLeft + t.tab.el.dom.offsetWidth;
                isOverflow = tabRight > tabBarWidth || tabLeft < 0;
              }
              tabs.push({ index: cleanText, text: cleanText, isOverflow });
            }
          });
          break;
        }
      }
    }
    _cachedTabs = tabs;
    _cachedTabsTime = Date.now();
    return tabs;
  }
  async function applyGridConsistency() {
    const presets = getPresets();
    if (!presets.config.columnOrder) return;
    const preferredOrder = presets.config.columnOrder.split(",").map((s) => s.trim()).filter((s) => s.length > 0);
    const allDocs = getExtWindows();
    for (const win of allDocs) {
      if (win.Ext && win.Ext.ComponentQuery) {
        const grids = win.Ext.ComponentQuery.query("gridpanel");
        const mainGrid = grids.find((g) => g.columns && g.columns.length > 20 && g.rendered && !g.isDestroyed && !g.destroying);
        if (mainGrid && mainGrid.headerCt && !mainGrid.headerCt.isDestroyed) {
          const headerCt = mainGrid.headerCt;
          let needsSorting = false;
          const visibleCols = headerCt.getVisibleGridColumns().filter((c) => !c.isCheckerHd && !c.locked && c.xtype !== "rownumberer");
          const activePreferred = preferredOrder.map((dataIndex) => visibleCols.find((c) => c.dataIndex === dataIndex)).filter(Boolean);
          for (let i = 0; i < activePreferred.length; i++) {
            if (visibleCols[i] !== activePreferred[i]) {
              needsSorting = true;
              break;
            }
          }
          if (needsSorting && !headerCt.isDestroyed) {
            let layoutsSuspended = false;
            try {
              win.Ext.suspendLayouts();
              layoutsSuspended = true;
              let currentAbsTarget = 0;
              activePreferred.forEach((targetCol) => {
                while (currentAbsTarget < headerCt.items.length) {
                  let colAtTarget = headerCt.items.getAt(currentAbsTarget);
                  if (colAtTarget.isCheckerHd || colAtTarget.locked || colAtTarget.xtype === "rownumberer" || typeof colAtTarget.isHidden === "function" && colAtTarget.isHidden()) {
                    currentAbsTarget++;
                  } else {
                    break;
                  }
                }
                const currentAbsIdx = headerCt.items.indexOf(targetCol);
                if (currentAbsIdx !== -1 && currentAbsIdx !== currentAbsTarget) {
                  headerCt.move(targetCol, currentAbsTarget);
                }
                currentAbsTarget++;
              });
            } catch (e) {
              console.warn("[APM] Grid column reorder failed:", e);
            } finally {
              if (layoutsSuspended) win.Ext.resumeLayouts(true);
              if (!mainGrid.isDestroyed && mainGrid.getView && !mainGrid.getView().isDestroyed) {
                mainGrid.getView().refresh();
              }
            }
          }
          break;
        }
      }
    }
  }
  async function applyTabConsistency() {
    const presets = getPresets();
    const hasOrder = presets.config.tabOrder && presets.config.tabOrder.trim().length > 0;
    const hiddenTabs = presets.config.hiddenTabs || [];
    const hasHidden = hiddenTabs.length > 0;
    if (!hasOrder && !hasHidden) return;
    const preferredOrder = hasOrder ? presets.config.tabOrder.split(",").map((s) => s.trim()).filter((s) => s.length > 0) : [];
    const allDocs = getExtWindows();
    for (const win of allDocs) {
      if (win.Ext && win.Ext.ComponentQuery) {
        const tabPanels = win.Ext.ComponentQuery.query("tabpanel, uxtabpanel");
        const mainTabPanel = tabPanels.find((tp) => tp.rendered && !tp.isDestroyed && !tp.destroying && tp.items && tp.items.items.length > 0 && tp.items.items.some((t) => {
          let txt = t.title || t.text || "";
          return txt.includes("Activities") || txt.includes("Checklist") || txt.includes("Comments");
        }));
        if (!mainTabPanel) continue;
        if (hasHidden) {
          let activeTabHidden = false;
          mainTabPanel.items.items.forEach((item) => {
            if (item.isDestroyed || !item.tab || !item.tab.el || !item.tab.el.dom) return;
            const tabName = (item.title || item.text || "").replace(/<[^>]*>?/gm, "").trim();
            if (hiddenTabs.includes(tabName)) {
              item.tab.el.dom.classList.add("apm-tab-hidden");
              if (mainTabPanel.getActiveTab && mainTabPanel.getActiveTab() === item) {
                activeTabHidden = true;
              }
            } else {
              item.tab.el.dom.classList.remove("apm-tab-hidden");
            }
          });
          if (activeTabHidden) {
            const firstVisible = mainTabPanel.items.items.find((item) => {
              if (item.isDestroyed || !item.tab || !item.tab.el || !item.tab.el.dom) return false;
              const tabName = (item.title || item.text || "").replace(/<[^>]*>?/gm, "").trim();
              return !hiddenTabs.includes(tabName);
            });
            if (firstVisible && !firstVisible.isDestroyed) {
              mainTabPanel.setActiveTab(firstVisible);
            }
          }
        }
        if (hasOrder && !mainTabPanel.isDestroyed) {
          let needsSorting = false;
          preferredOrder.forEach((tabName, targetIdx) => {
            if (mainTabPanel.isDestroyed) return;
            const currentIdx = mainTabPanel.items.findIndexBy((item) => {
              if (item.isDestroyed) return false;
              let name = (item.title || item.text || "").replace(/<[^>]*>?/gm, "").trim();
              return name === tabName;
            });
            if (currentIdx !== -1 && currentIdx !== targetIdx) {
              needsSorting = true;
            }
          });
          if (needsSorting && !mainTabPanel.isDestroyed) {
            let layoutsSuspended = false;
            try {
              win.Ext.suspendLayouts();
              layoutsSuspended = true;
              preferredOrder.forEach((tabName, targetIdx) => {
                const currentIdx = mainTabPanel.items.findIndexBy((item) => {
                  if (item.isDestroyed) return false;
                  let name = (item.title || item.text || "").replace(/<[^>]*>?/gm, "").trim();
                  return name === tabName;
                });
                const itemToMove = mainTabPanel.items.getAt(currentIdx);
                if (currentIdx !== -1 && currentIdx !== targetIdx && itemToMove) {
                  mainTabPanel.move(itemToMove, targetIdx);
                }
              });
            } catch (e) {
              console.warn("[APM] Tab reorder failed silently to prevent crash:", e);
            } finally {
              if (layoutsSuspended) win.Ext.resumeLayouts(true);
              if (!mainTabPanel.isDestroyed && typeof mainTabPanel.updateLayout === "function") {
                mainTabPanel.updateLayout();
              }
            }
          }
        }
        break;
      }
    }
  }
  function invalidateTabCache() {
    _cachedColumns = null;
    _cachedColumnsTime = 0;
    _cachedTabs = null;
    _cachedTabsTime = 0;
  }

  // src/ui/settings-panel.js
  function buildSettingsPanel() {
    window.apmBuildSettingsPanel = buildSettingsPanel;
    if (window.self !== window.top || document.getElementById("apm-settings-panel")) return;
    let settingsMode = "cols";
    let activeTab = "autofill";
    if (!document.getElementById("apm-tab-hide-css")) {
      const css = document.createElement("style");
      css.id = "apm-tab-hide-css";
      css.textContent = `
            .apm-tab-hidden { display: none !important; }
            .apm-overflow-badge { 
                font-size: 9px; background: #f39c12; color: #fff; 
                padding: 1px 4px; border-radius: 3px; margin-left: 6px; 
                font-weight: bold; text-transform: uppercase; 
            }
        `;
      document.head.appendChild(css);
    }
    const panel = document.createElement("div");
    panel.id = "apm-settings-panel";
    panel.className = "apm-settings-container";
    const dpr = window.devicePixelRatio || 1;
    if (dpr < 1) {
      panel.style.zoom = 1 / dpr;
    }
    panel.style.display = "none";
    const margin = 20;
    const vHeight = window.innerHeight;
    const vWidth = window.innerWidth;
    const rect = panel.getBoundingClientRect();
    const panelWidth = rect.width || 440;
    const panelHeight = 580;
    let topPos = 60;
    let rightPos = margin;
    if (topPos + panelHeight > vHeight) topPos = Math.max(10, vHeight - panelHeight - margin);
    if (rightPos + panelWidth > vWidth) rightPos = Math.max(10, vWidth - panelWidth - margin);
    panel.style.top = topPos + "px";
    panel.style.right = rightPos + "px";
    panel.style.display = "none";
    const helpOverlay = el("div", { id: "apm-help-overlay", className: "apm-help-overlay", style: { display: "none" } }, [
      el("div", { className: "apm-help-modal" }, [
        el("div", { className: "apm-help-header" }, [
          el("h4", { className: "apm-help-title" }, "APM Master Guide"),
          el("button", { id: "apm-help-close", className: "apm-help-close" }, "\u2716")
        ]),
        el("div", { className: "apm-help-content" }, [
          el("div", { className: "apm-help-section" }, [
            el("div", { className: "apm-help-section-title" }, "\u{1F3A8} ColorCode & Themes"),
            el("p", {}, "Highlight work orders based on custom keywords or status. Rules are processed from top-to-bottom:"),
            el("ul", {}, [
              el("li", {}, [el("b", {}, "Multi-Keyword Matching: "), "Enter multiple terms separated by commas (e.g., ", el("code", {}, "13 week, quarterly, slider belt"), ") to apply one rule to all of them."]),
              el("li", {}, [el("b", {}, "Nametags (Badge Text): "), "Show a colored pill badge on matching cells. Leave it empty to only highlight the row."]),
              el("li", {}, [el("b", {}, "Tag Filtering: "), "Click any nametag in the grid to instantly filter for that tag. Click the nametag again to reset."]),
              el("li", {}, [el("b", {}, "Fill Row: "), "Toggle row highlighting independently of nametags. The first matching rule sets the color."]),
              el("li", {}, [el("b", {}, "Themes: "), "Choose between Classic Dark, Hex Dark, or Light themes. These apply globally on page reload."])
            ])
          ]),
          el("div", { className: "apm-help-section" }, [
            el("div", { className: "apm-help-section-title" }, "\u{1F4CB} AutoFill Profiles"),
            el("p", {}, "Create saved templates to instantly fill Work Order forms:"),
            el("ul", {}, [
              el("li", {}, [el("b", {}, "Keyword Match: "), "Profiles are suggested automatically if a keyword is found in the WO description."]),
              el("li", {}, [el("b", {}, "PM Checkbox: "), 'Set "1-Tech" or "10-Tech" counts for automated checklist completion.']),
              el("li", {}, [el("b", {}, "Partial Fill: "), "Templates can fill just closing comments, trouble codes, assigned to, or the equipment closest match."])
            ])
          ]),
          el("div", { className: "apm-help-section" }, [
            el("div", { className: "apm-help-section-title" }, "\u{1F9E9} UI Customization"),
            el("p", {}, "Optimize EAM to fit your workflow in the ", el("b", {}, "Tab Order"), " tab:"),
            el("ul", {}, [
              el("li", {}, [el("b", {}, "Drag & Drop: "), "Reorder columns or record tabs instantly. Your order is saved across sessions."]),
              el("li", {}, [el("b", {}, "Hiding Tabs: "), 'Hide clutter with the \u2716 icon. Restore them from the "Hidden" list anytime.']),
              el("li", {}, [el("b", {}, "Reset: "), 'Use the "Reset to Default" button to restore the original EAM layout.'])
            ])
          ]),
          el("div", { className: "apm-help-section" }, [
            el("div", { className: "apm-help-section-title" }, "\u23F1\uFE0F Utilities & Productivity"),
            el("ul", {}, [
              el("li", {}, [el("b", {}, "\u26A1 PM Filter Toggle: "), 'Use the button in the grid toolbar to cycle between "PMs Only", "Non-PMs", or "Show All".']),
              el("li", {}, [el("b", {}, "\u2705 PTP Status Icons: "), "View assessment status directly in the grid or record header. \u2705 means you have previously completed an assessment for this WO. ", el("i", {}, "(Tracks your history only)")]),
              el("li", {}, [el("b", {}, "\u23F1\uFE0F Labor Tally: "), "Drag the widget to see your hours worked for 1, 2, or 7 days. Use Manager Mode for other employees."]),
              el("li", {}, [el("b", {}, "\u{1F50D} Quick Search: "), "Jump to any WO instantly. Use ", el("kbd", {}, "Alt+T"), " for today's orders and ", el("kbd", {}, "Alt+C"), " to clear filters."]),
              el("li", {}, [el("b", {}, "\u{1F517} Work Order Links: "), "Work Order numbers in the grid are automatically hyperlinked. Click to open in EAM, or click the clipboard icon to copy the URL to clipboard."])
            ])
          ]),
          el("div", { className: "apm-help-section" }, [
            el("div", { className: "apm-help-section-title" }, "\u2699\uFE0F General Settings"),
            el("ul", {}, [
              el("li", {}, [el("b", {}, "PTP Timer: "), 'Shows a 2-minute countdown overlay on the PTP screen to encourage a "Take 2" safety pause.']),
              el("li", {}, [el("b", {}, "Work Order Links: "), "Configure whether WO numbers open in the current window or a new tab."]),
              el("li", {}, [el("b", {}, "Auto-Redirect: "), "Automatically returns to the APM home screen if your session expires."])
            ])
          ])
        ])
      ])
    ]);
    const header = el("div", { className: "apm-settings-header" }, [
      el("h4", { className: "apm-settings-title" }, "APM Master"),
      el("button", { id: "apm-c-btn-close", className: "apm-settings-close-btn" }, "\u2716")
    ]);
    const tabContainer = el("div", { id: "apm-tab-container", className: "apm-tab-container" }, [
      el("div", { id: "tab-autofill", className: "apm-tab-btn apm-tab-active-autofill" }, "Auto Fill Profiles"),
      el("div", { id: "tab-settings", className: "apm-tab-btn apm-tab-inactive" }, "Tab Order"),
      el("div", { id: "tab-colorcode", className: "apm-tab-btn apm-tab-inactive" }, "ColorCode & Theme"),
      el("div", { id: "tab-general", className: "apm-tab-btn apm-tab-inactive" }, "General")
    ]);
    const autofillFields = el("div", { id: "apm-main-fields", className: "apm-panel-section" }, [
      el("div", { className: "apm-template-box" }, [
        el("div", { className: "apm-template-label" }, "Active Template:"),
        el("div", { className: "apm-template-row" }, [
          el("select", { id: "apm-c-preset-select", className: "apm-template-select" }),
          el("button", { id: "apm-c-btn-save", className: "creator-btn apm-template-btn-update", title: "Update selection" }, "Update"),
          el("button", { id: "apm-c-btn-new", className: "creator-btn apm-template-btn-new", title: "New/Copy template" }, "New / Copy"),
          el("button", { id: "apm-c-btn-del", className: "creator-btn apm-template-btn-del", title: "Delete template" }, "\u2716")
        ])
      ]),
      el("div", { className: "apm-fields-wrapper" }, [
        el("div", { className: "field-row", style: { marginBottom: "6px" } }, [
          el("div", { className: "field-label", style: { color: "#f39c12", fontWeight: "bold", width: "65px", textAlign: "left", fontSize: "11px" } }, "Match:"),
          el("input", { type: "text", id: "apm-c-keyword", className: "field-input", placeholder: "e.g., pre-sort, repair, jam", style: { fontFamily: "monospace", border: "1px solid #f39c12", height: "24px", padding: "0 8px", fontSize: "11px", transition: "all 0.2s" } })
        ]),
        el("div", { style: { display: "flex", gap: "6px", marginBottom: "4px" } }, [
          el("div", { className: "field-row", style: { width: "105px", flexShrink: "0", margin: "0" } }, [
            el("div", { className: "field-label", style: { width: "35px", textAlign: "left", fontSize: "11px" } }, "Org:"),
            el("input", { type: "text", id: "apm-c-org", className: "field-input upper", placeholder: "Ignore", style: { height: "24px", padding: "0 6px", fontSize: "11px", border: "1px solid transparent", transition: "all 0.2s" } })
          ]),
          el("div", { className: "field-row", style: { flexGrow: "1", margin: "0" } }, [
            el("div", { className: "field-label", style: { width: "70px", textAlign: "left", fontSize: "11px" } }, "Equipment:"),
            el("input", { type: "text", id: "apm-c-eq", className: "field-input upper", placeholder: "Leave blank to ignore", style: { height: "24px", padding: "0 6px", fontSize: "11px", border: "1px solid transparent", transition: "all 0.2s" } })
          ])
        ]),
        el("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 10px", marginBottom: "6px" } }, [
          el("div", { className: "field-row", style: { margin: "0" } }, [
            el("div", { className: "field-label", style: { width: "40px", textAlign: "left", fontSize: "11px" } }, "Type:"),
            el("select", { id: "apm-c-type", className: "field-input", style: { height: "24px", padding: "0 4px", fontSize: "11px", border: "1px solid transparent", transition: "all 0.2s" } }, [
              el("option", { value: "" }, "- Ignore -"),
              el("option", { value: "Breakdown" }, "Breakdown"),
              el("option", { value: "Corrective" }, "Corrective"),
              el("option", { value: "Project" }, "Project")
            ])
          ]),
          el("div", { className: "field-row", style: { margin: "0" } }, [
            el("div", { className: "field-label", style: { width: "40px", textAlign: "left", fontSize: "11px" } }, "Status:"),
            el("select", { id: "apm-c-status", className: "field-input", style: { height: "24px", padding: "0 4px", fontSize: "11px", border: "1px solid transparent", transition: "all 0.2s" } }, [
              el("option", { value: "" }, "- Ignore -"),
              el("option", { value: "Open" }, "Open"),
              el("option", { value: "In Progress" }, "In Progress")
            ])
          ]),
          el("div", { className: "field-row", style: { margin: "0" } }, [
            el("div", { className: "field-label", style: { width: "40px", textAlign: "left", fontSize: "11px" } }, "Exec:"),
            el("select", { id: "apm-c-exec", className: "field-input", style: { height: "24px", padding: "0 4px", fontSize: "11px", border: "1px solid transparent", transition: "all 0.2s" } }, [
              el("option", { value: "" }, "- Ignore -"),
              el("option", { value: "EXDN" }, "EXDN"),
              el("option", { value: "EXDB" }, "EXDB"),
              el("option", { value: "EXMW" }, "EXOPS"),
              el("option", { value: "EXSHUT" }, "EXSHUT")
            ])
          ]),
          el("div", { className: "field-row", style: { margin: "0" } }, [
            el("div", { className: "field-label", style: { width: "40px", textAlign: "left", fontSize: "11px" } }, "Safety:"),
            el("select", { id: "apm-c-safety", className: "field-input", style: { height: "24px", padding: "0 4px", fontSize: "11px", border: "1px solid transparent", transition: "all 0.2s" } }, [
              el("option", { value: "" }, "- Ignore -"),
              el("option", { value: "No" }, "No"),
              el("option", { value: "Yes" }, "Yes")
            ])
          ])
        ]),
        el("div", { className: "apm-checklist-box", style: { marginBottom: "6px" } }, [
          el("div", { className: "apm-checklist-title" }, "Automated Checklists:"),
          el("div", { className: "apm-checklist-row" }, [
            el("div", { className: "field-label", style: { width: "40px", textAlign: "left", color: "#fff", fontSize: "11px" } }, "1-Tech:"),
            el("select", { id: "apm-c-loto-mode", className: "field-input", style: { width: "110px", height: "22px", padding: "0 4px", fontSize: "10px" } }, [
              el("option", { value: "none" }, "- Ignore -"),
              el("option", { value: "yes" }, "(Check YES)"),
              el("option", { value: "no" }, "(Check NO)")
            ]),
            el("div", { className: "field-label", style: { flexGrow: "1", textAlign: "right", color: "#fff", fontSize: "11px", marginRight: "5px" } }, "10-Tech:"),
            el("input", { type: "number", id: "apm-c-pm-checks", className: "field-input", min: "0", placeholder: "0", onblur: (e) => {
              if (e.target.value === "") e.target.value = "0";
            }, style: { width: "70px", height: "22px", padding: "0 4px", textAlign: "center", fontSize: "10px" } })
          ])
        ]),
        el("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 10px", marginBottom: "6px" } }, [
          el("div", { className: "field-row", style: { margin: "0" } }, [
            el("div", { className: "field-label", style: { width: "50px", textAlign: "left", fontSize: "11px" } }, "Problem:"),
            el("input", { type: "text", id: "apm-c-prob", className: "field-input upper" })
          ]),
          el("div", { className: "field-row", style: { margin: "0" } }, [
            el("div", { className: "field-label", style: { width: "40px", textAlign: "left", fontSize: "11px" } }, "Failure:"),
            el("input", { type: "text", id: "apm-c-fail", className: "field-input upper" })
          ]),
          el("div", { className: "field-row", style: { margin: "0" } }, [
            el("div", { className: "field-label", style: { width: "50px", textAlign: "left", fontSize: "11px" } }, "Cause:"),
            el("input", { type: "text", id: "apm-c-cause", className: "field-input upper" })
          ]),
          el("div", { className: "field-row", style: { margin: "0" } }, [
            el("div", { className: "field-label", style: { width: "40px", textAlign: "left", fontSize: "11px" } }, "Assign:"),
            el("input", { type: "text", id: "apm-c-assign", className: "field-input upper" })
          ])
        ]),
        el("div", { style: { display: "flex", gap: "6px", marginBottom: "6px" } }, [
          el("div", { className: "field-row", style: { flex: "1", margin: "0" } }, [
            el("div", { className: "field-label", style: { width: "35px", textAlign: "left", fontSize: "11px" } }, "Start:"),
            el("input", { type: "date", id: "apm-c-start", className: "field-input", style: { height: "24px", padding: "0 4px", fontSize: "10px" } })
          ]),
          el("div", { className: "field-row", style: { flex: "1", margin: "0" } }, [
            el("div", { className: "field-label", style: { width: "30px", textAlign: "left", fontSize: "11px" } }, "End:"),
            el("input", { type: "date", id: "apm-c-end", className: "field-input", style: { height: "24px", padding: "0 4px", fontSize: "10px" } })
          ])
        ]),
        el("div", { className: "field-row", style: { margin: "0", alignItems: "flex-start" } }, [
          el("div", { className: "field-label", style: { width: "50px", textAlign: "left", fontSize: "11px", marginTop: "5px" } }, "Closing:"),
          el("textarea", { id: "apm-c-close", className: "field-input apm-textarea-input", placeholder: "Closing comments..." })
        ])
      ])
    ]);
    const settingsFields = el("div", { id: "apm-settings-fields", style: { display: "none" } }, [
      el("div", { className: "apm-ui-settings-toggles" }, [
        el("div", { id: "apm-s-tog-cols", className: "apm-ui-settings-btn active" }, "Grid Columns"),
        el("div", { id: "apm-s-tog-tabs", className: "apm-ui-settings-btn inactive" }, "Record Tabs")
      ]),
      el("div", { id: "apm-s-title", style: { color: "#3498db", fontWeight: "bold", marginBottom: "5px" } }, "Visual Order:"),
      el("div", { style: { fontSize: "11px", color: "#aaa", marginBottom: "10px" } }, "Drag and drop to reorder. Syncs automatically."),
      el("div", { id: "apm-s-col-list", className: "apm-ui-settings-list" }),
      el("button", { id: "apm-s-btn-save-settings", className: "apm-ui-settings-save" }, "Save Layout Order"),
      el("button", { id: "apm-s-btn-reset", className: "apm-ui-settings-reset" }, "Reset to Default")
    ]);
    const colorCodeFields = el("div", { id: "apm-colorcode-fields", style: { display: "none", paddingBottom: "5px" } }, [
      el("div", { className: "apm-cc-search-box", style: { background: "#22292f", padding: "12px", borderRadius: "6px", border: "1px solid #45535e", marginBottom: "15px" } }, [
        el("div", { style: { display: "flex", gap: "10px", marginBottom: "12px" } }, [
          el("div", { style: { flex: "1" } }, [
            el("div", { style: { fontSize: "11px", color: "#95a5a6", marginBottom: "4px", fontWeight: "bold" } }, "Keyword (Search)"),
            el("input", { type: "text", id: "cc-search", className: "field-input", placeholder: "e.g., pre-sort, motor, jam", style: { height: "30px", fontSize: "12px", width: "100%", boxSizing: "border-box" } })
          ]),
          el("div", { style: { width: "50px" } }, [
            el("div", { style: { fontSize: "11px", color: "#95a5a6", marginBottom: "4px", fontWeight: "bold", textAlign: "center" } }, "Color"),
            el("input", { type: "color", id: "cc-color", value: "#e74c3c", tabIndex: -1, style: { width: "100%", height: "30px", padding: "0", border: "1px solid #45535e", borderRadius: "4px", cursor: "pointer", background: "none" } })
          ])
        ]),
        el("div", { style: { display: "flex", gap: "10px", alignItems: "flex-end", marginBottom: "15px" } }, [
          el("div", { style: { flex: "1" } }, [
            el("div", { style: { fontSize: "11px", color: "#95a5a6", marginBottom: "4px", fontWeight: "bold" } }, "Badge Text (Nametag)"),
            el("input", { type: "text", id: "cc-tag", className: "field-input", placeholder: "(Leave blank for no nametag)", style: { height: "30px", fontSize: "12px", width: "100%", boxSizing: "border-box" } })
          ])
        ]),
        el("div", { style: { display: "flex", gap: "10px", alignItems: "center", marginBottom: "15px" } }, [
          el("div", { style: { display: "flex", gap: "4px" } }, [
            el("button", { id: "cc-btn-fill", className: "apm-cc-style-btn active", title: "Fill Row Background", style: { width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #45535e", borderRadius: "4px", background: "#34495e", cursor: "pointer", color: "white", transition: "all 0.2s" } }, "\u{1F58C}\uFE0F"),
            el("button", { id: "cc-btn-tag", className: "apm-cc-style-btn active", title: "Show Nametag", style: { width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #45535e", borderRadius: "4px", background: "#34495e", cursor: "pointer", color: "white", transition: "all 0.2s" } }, "\u{1F3F7}\uFE0F")
          ]),
          el("div", { id: "cc-preview-row", style: { flex: "1", height: "32px", background: "rgba(231, 76, 60, 0.22)", borderLeft: "5px solid #e74c3c", borderRadius: "4px", display: "flex", alignItems: "center", padding: "0 10px", fontSize: "12px", color: "#ecf0f1", overflow: "hidden", position: "relative" } }, [
            el("span", { style: { opacity: "0.6", whiteSpace: "nowrap" } }, "Preview Row Content..."),
            el("div", { id: "cc-preview-tag", className: "apm-nametag", style: { position: "absolute", right: "10px", background: "#e74c3c" } }, "Sample Tag")
          ])
        ]),
        el("div", { style: { display: "flex", gap: "8px", flex: "1", justifyContent: "flex-end" } }, [
          el("button", { id: "cc-add-btn", style: { flex: "1", maxWidth: "120px", background: "#3498db", color: "white", border: "none", borderRadius: "4px", height: "32px", cursor: "pointer", fontWeight: "bold", fontSize: "12px", transition: "background 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" } }, [
            el("span", {}, "\u{1F4BE}"),
            el("span", { id: "cc-add-btn-text" }, "Save Rule")
          ]),
          el("button", { id: "cc-cancel-btn", style: { display: "none", background: "#7f8c8d", color: "white", border: "none", borderRadius: "4px", height: "32px", padding: "0 12px", cursor: "pointer", fontWeight: "bold", fontSize: "12px" } }, "Cancel")
        ])
      ]),
      el("div", { className: "apm-cc-theme-box" }, [
        el("div", { className: "apm-cc-theme-item" }, [
          el("div", { className: "apm-cc-theme-label" }, "Theme:"),
          el("select", { id: "cc-setting-theme", className: "apm-cc-theme-select" }, [
            el("option", { value: "default" }, "System Default"),
            el("option", { value: "theme-hex-dark" }, "Dark Hex"),
            el("option", { value: "theme-dark" }, "Dark Classic"),
            el("option", { value: "theme-darkblue" }, "Dark Blue"),
            el("option", { value: "theme-hex" }, "Light Hex"),
            el("option", { value: "theme-orange" }, "Orange")
          ])
        ]),
        el("div", { className: "apm-cc-theme-item" }, [
          el("div", { id: "cc-uniform-label", className: "apm-cc-theme-label" }, "Uniform Shading"),
          el("label", { className: "cc-toggle-switch" }, [
            el("input", { type: "checkbox", id: "cc-setting-uniform", checked: true }),
            el("span", { className: "cc-toggle-slider" })
          ])
        ])
      ]),
      el("div", { id: "cc-rules-container", className: "apm-cc-rules-container" }),
      el("div", { id: "cc-guide-container", className: "apm-cc-guide" }, [
        el("p", {}, 'Rules match if ANY of the comma-separated keywords are found in a row. "Fill Row" is applied to every match.'),
        el("p", {}, [
          el("b", { style: { color: "white" } }, "Nametags: "),
          'Type text into "Badge Text" to show a pill badge on matching cells. Leave it empty to only highlight the row without showing a tag. Use ',
          el("code", {}, "\\n"),
          " for line breaks."
        ])
      ])
    ]);
    const generalFields = el("div", { id: "apm-general-fields", style: { display: "none" }, className: "apm-general-box" }, [
      el("div", { className: "apm-general-item" }, [
        el("div", {}, [
          el("div", { className: "apm-general-title" }, "PTP Timer"),
          el("div", { className: "apm-general-desc" }, 'Show a 2-minute countdown timer overlay on the PTP screen if you want to follow the standard of "Take 2" minutes.')
        ]),
        el("label", { className: "cc-toggle-switch" }, [
          el("input", { type: "checkbox", id: "gen-setting-ptp", checked: !!apmGeneralSettings.ptpTimerEnabled }),
          el("span", { className: "cc-toggle-slider" })
        ])
      ]),
      el("div", { className: "apm-general-item" }, [
        el("div", {}, [
          el("div", { id: "gen-setting-links-title", className: "apm-general-title" }, apmGeneralSettings.openLinksInNewTab ? "Open Work Orders in New Tab" : "Open Work Orders in Current Tab"),
          el("div", { className: "apm-general-desc" }, "Linkified WO numbers open in a new window vs the current window")
        ]),
        el("label", { className: "cc-toggle-switch" }, [
          el("input", { type: "checkbox", id: "gen-setting-links", checked: !!apmGeneralSettings.openLinksInNewTab }),
          el("span", { className: "cc-toggle-slider" })
        ])
      ]),
      el("div", { className: "apm-general-item" }, [
        el("div", {}, [
          el("div", { className: "apm-general-title" }, "Show PTP Status Icons"),
          el("div", { className: "apm-general-desc" }, "Inject \u2705 or \u274C icons into the Grid and Record Views to show your personal assessment history")
        ]),
        el("label", { className: "cc-toggle-switch" }, [
          el("input", { type: "checkbox", id: "gen-setting-ptp-ui", checked: !!apmGeneralSettings.ptpTrackingEnabled }),
          el("span", { className: "cc-toggle-slider" })
        ])
      ]),
      el("div", { className: "apm-general-item" }, [
        el("div", {}, [
          el("div", { className: "apm-general-title" }, "Auto-Redirect"),
          el("div", { className: "apm-general-desc" }, "Automatically return to APM Home if session expires")
        ]),
        el("label", { className: "cc-toggle-switch" }, [
          el("input", { type: "checkbox", id: "gen-setting-redirect", checked: !!apmGeneralSettings.autoRedirect }),
          el("span", { className: "cc-toggle-slider" })
        ])
      ]),
      el("div", { className: "apm-general-item", style: { borderTop: "1px solid #45535e", paddingTop: "10px", marginTop: "10px" } }, [
        el("div", {}, [
          el("div", { className: "apm-general-title", style: { color: "#1abc9c" } }, "Regional: Date Format"),
          el("div", { className: "apm-general-desc" }, "Choose the format your EAM expects for inputs.")
        ]),
        el("select", { id: "gen-setting-date-fmt", className: "apm-cc-theme-select", style: { width: "120px" } }, [
          el("option", { value: "us" }, "MM/DD/YYYY"),
          el("option", { value: "eu" }, "DD/MM/YYYY")
        ])
      ]),
      el("div", { className: "apm-general-item" }, [
        el("div", {}, [
          el("div", { className: "apm-general-title" }, "Regional: Separator"),
          el("div", { className: "apm-general-desc" }, "The character between parts (e.g. / or -)")
        ]),
        el("select", { id: "gen-setting-date-sep", className: "apm-cc-theme-select", style: { width: "120px" } }, [
          el("option", { value: "/" }, "/ (Slash)"),
          el("option", { value: "-" }, "- (Dash)")
        ])
      ]),
      el("div", { className: "apm-general-item" }, [
        el("div", {}, [
          el("div", { className: "apm-general-title" }, "Regional: Overrides"),
          el("div", { className: "apm-general-desc" }, "Force standard date parsing in EAM (Disable if causing errors)")
        ]),
        el("label", { className: "cc-toggle-switch" }, [
          el("input", { type: "checkbox", id: "gen-setting-date-over", checked: !!apmGeneralSettings.dateOverrideEnabled }),
          el("span", { className: "cc-toggle-slider" })
        ])
      ])
    ]);
    const footer = el("div", { className: "apm-footer" }, [
      el("div", { id: "cc-footer-btns", style: { display: "none", justifyContent: "space-between", gap: "8px", marginBottom: "10px", padding: "0 5px" } }, [
        el("button", { id: "cc-export-btn", className: "cc-footer-btn", title: "Export Rules to Clipboard" }, "\u{1F4E4} Export Config"),
        el("button", { id: "cc-import-btn", className: "cc-footer-btn", title: "Import Rules" }, "\u{1F4E5} Import Config")
      ]),
      el("div", { id: "apm-settings-update-container", style: { display: "none", marginBottom: "8px" } }, [
        el("a", { href: GITHUB_URL, target: "_blank", className: "apm-footer-update-btn" }, "\u2728 Update Available")
      ]),
      el("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", padding: "0 8px" } }, [
        el("a", { href: "https://github.com/jaker788-create/APM-Master/issues", target: "_blank", style: { flex: "1", color: "#3498db", fontSize: "11px", textDecoration: "none", fontWeight: "bold", textAlign: "left" } }, "\u{1F41B} Bug Report"),
        el("div", { style: { flex: "1", display: "flex", justifyContent: "center" } }, [
          el("button", { id: "apm-c-btn-help", className: "apm-footer-help-btn-box", style: { padding: "6px 14px", fontSize: "12px", minWidth: "80px" } }, "\u2139\uFE0F Help & Tips")
        ]),
        el("span", { style: { flex: "1", color: "#ffffff", fontSize: "11px", textAlign: "right", paddingRight: "5px" } }, `v${CURRENT_VERSION}`)
      ])
    ]);
    panel.appendChild(header);
    panel.appendChild(tabContainer);
    panel.appendChild(autofillFields);
    panel.appendChild(settingsFields);
    panel.appendChild(colorCodeFields);
    panel.appendChild(generalFields);
    panel.appendChild(footer);
    document.body.appendChild(panel);
    document.body.appendChild(helpOverlay);
    const selectEl = document.getElementById("apm-c-preset-select");
    const mainFields = autofillFields;
    const colorcodeFields = colorCodeFields;
    const tabAutofill = document.getElementById("tab-autofill");
    const tabSettings = document.getElementById("tab-settings");
    const tabColorcode = document.getElementById("tab-colorcode");
    const tabGeneral = document.getElementById("tab-general");
    const togCols = document.getElementById("apm-s-tog-cols");
    const togTabs = document.getElementById("apm-s-tog-tabs");
    const colListContainer = document.getElementById("apm-s-col-list");
    try {
      const fmt = document.getElementById("gen-setting-date-fmt");
      const sep = document.getElementById("gen-setting-date-sep");
      const over = document.getElementById("gen-setting-date-over");
      if (fmt) fmt.value = apmGeneralSettings.dateFormat || "us";
      if (sep) sep.value = apmGeneralSettings.dateSeparator || "/";
      if (over) over.checked = !!apmGeneralSettings.dateOverrideEnabled;
      setupColorCodeLogic(colorcodeFields);
      const ccSettings = getSettings();
      const elTheme = document.getElementById("cc-setting-theme");
      if (elTheme && ccSettings.theme) {
        elTheme.value = ccSettings.theme;
      }
      const elUniform = document.getElementById("cc-setting-uniform");
      if (elUniform && ccSettings.uniformHighlight !== void 0) {
        elUniform.checked = ccSettings.uniformHighlight;
        const lbl = document.getElementById("cc-uniform-label");
        if (lbl) lbl.textContent = ccSettings.uniformHighlight ? "Uniform Shading" : "Alternating Shading";
      }
    } catch (e) {
      console.error("[APM Master] Error initializing settings panel listeners:", e);
    }
    panel.addEventListener("keydown", (e) => {
      const tag = e.target.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") {
        e.stopPropagation();
      }
    }, true);
    try {
      document.getElementById("apm-c-btn-close").onclick = () => {
        panel.style.display = "none";
      };
      const ptpTog = document.getElementById("gen-setting-ptp");
      if (ptpTog) ptpTog.onchange = (e) => {
        setGeneralSetting("ptpTimerEnabled", e.target.checked);
        const ptpContainer = document.getElementById("apm-ptp-timer");
        if (ptpContainer && !apmGeneralSettings.ptpTimerEnabled) ptpContainer.style.display = "none";
      };
      const ptpUiTog = document.getElementById("gen-setting-ptp-ui");
      if (ptpUiTog) ptpUiTog.onchange = (e) => {
        setGeneralSetting("ptpTrackingEnabled", e.target.checked);
        if (typeof invalidateColorCodeCache === "function") invalidateColorCodeCache();
      };
      const linksTog = document.getElementById("gen-setting-links");
      if (linksTog) linksTog.onchange = (e) => {
        setGeneralSetting("openLinksInNewTab", e.target.checked);
        const titleEl = document.getElementById("gen-setting-links-title");
        if (titleEl) {
          titleEl.textContent = e.target.checked ? "Open Work Orders in New Tab" : "Open Work Orders in Current Tab";
        }
        if (typeof debouncedProcessColorCodeGrid === "function") debouncedProcessColorCodeGrid();
      };
      const redirTog = document.getElementById("gen-setting-redirect");
      if (redirTog) redirTog.onchange = (e) => {
        setGeneralSetting("autoRedirect", e.target.checked);
      };
      const fmtSet = document.getElementById("gen-setting-date-fmt");
      if (fmtSet) fmtSet.onchange = (e) => {
        setGeneralSetting("dateFormat", e.target.value);
      };
      const sepSet = document.getElementById("gen-setting-date-sep");
      if (sepSet) sepSet.onchange = (e) => {
        setGeneralSetting("dateSeparator", e.target.value);
      };
      const overSet = document.getElementById("gen-setting-date-over");
      if (overSet) overSet.onchange = (e) => {
        setGeneralSetting("dateOverrideEnabled", e.target.checked);
      };
      subscribeToUpdates(() => {
        const updateContainer = document.getElementById("apm-settings-update-container");
        if (updateContainer) updateContainer.style.display = "block";
      });
    } catch (e) {
      console.error("[APM Master] Error binding general listeners:", e);
    }
    const resetTabs = () => {
      tabAutofill.style.background = "transparent";
      tabAutofill.className = "apm-tab-btn apm-tab-inactive";
      tabSettings.style.background = "transparent";
      tabSettings.className = "apm-tab-btn apm-tab-inactive";
      tabColorcode.style.background = "transparent";
      tabColorcode.className = "apm-tab-btn apm-tab-inactive";
      tabGeneral.style.background = "transparent";
      tabGeneral.className = "apm-tab-btn apm-tab-inactive";
      document.getElementById("apm-tab-container").style.display = "flex";
      const ccFooterTools = document.getElementById("cc-footer-btns");
      if (ccFooterTools) ccFooterTools.style.display = "none";
    };
    const applyPresetData = (data) => {
      if (!data) data = {};
      document.getElementById("apm-c-keyword").value = data.keyword || "";
      document.getElementById("apm-c-org").value = data.org || "";
      document.getElementById("apm-c-eq").value = data.eq || "";
      document.getElementById("apm-c-type").value = data.type || "";
      document.getElementById("apm-c-status").value = data.status || "";
      document.getElementById("apm-c-exec").value = data.exec || "";
      document.getElementById("apm-c-safety").value = data.safety || "";
      document.getElementById("apm-c-loto-mode").value = data.lotoMode || "none";
      document.getElementById("apm-c-pm-checks").value = data.pmChecks || "";
      document.getElementById("apm-c-prob").value = data.prob || "";
      document.getElementById("apm-c-fail").value = data.fail || "";
      document.getElementById("apm-c-cause").value = data.cause || "";
      document.getElementById("apm-c-assign").value = data.assign || "";
      document.getElementById("apm-c-start").value = data.start || "";
      document.getElementById("apm-c-end").value = data.end || "";
      document.getElementById("apm-c-close").value = data.close || "";
    };
    const renderPresetOptions = () => {
      const presets = getPresets();
      selectEl.innerHTML = "";
      const targetList = presets.autofill;
      for (const pName in targetList) {
        const opt = document.createElement("option");
        opt.value = pName;
        opt.textContent = pName;
        selectEl.appendChild(opt);
      }
      if (Object.keys(targetList).length > 0) {
        applyPresetData(targetList[Object.keys(targetList)[0]]);
      } else {
        applyPresetData({});
      }
    };
    const renderDragList = (itemsArray, emptyMsg) => {
      colListContainer.innerHTML = "";
      if (itemsArray.length === 0) {
        colListContainer.innerHTML = `<div style="color:#7f8c8d; text-align:center; padding:10px;">${emptyMsg}</div>`;
        return;
      }
      const presets = getPresets();
      if (!presets.config.hiddenTabs) presets.config.hiddenTabs = [];
      const isTabsMode = settingsMode === "tabs";
      let visibleItems = itemsArray;
      let hiddenItems = [];
      if (isTabsMode) {
        visibleItems = itemsArray.filter((c) => !presets.config.hiddenTabs.includes(c.index));
        hiddenItems = itemsArray.filter((c) => presets.config.hiddenTabs.includes(c.index));
      }
      const resetBtn = document.getElementById("apm-s-btn-reset");
      if (resetBtn) resetBtn.style.display = isTabsMode ? "block" : "none";
      const createDragItem = (c, isHidden) => {
        const item = document.createElement("div");
        item.dataset.index = c.index;
        item.className = "apm-col-item";
        if (isHidden) {
          item.draggable = false;
          item.style.opacity = "0.4";
          item.style.cursor = "default";
          item.style.borderLeftColor = "#e74c3c";
          const overflowHtml = c.isOverflow ? '<span class="apm-overflow-badge" title="This tab is in the EAM overflow menu (scrolled out of view)">Scrolled</span>' : "";
          item.innerHTML = `<span><span style="text-decoration: line-through;"><b style="color:#7f8c8d;">\u2630</b> &nbsp; ${c.text}</span>${overflowHtml}</span> <button class="apm-tab-restore-btn" data-tab-name="${c.index}" style="background:#2ecc71; color:white; border:none; border-radius:4px; padding:2px 8px; cursor:pointer; font-size:12px; font-weight:bold;" title="Restore tab">\uFF0B</button>`;
        } else {
          item.draggable = true;
          const actionBtn = isTabsMode ? `<button class="apm-tab-hide-btn" data-tab-name="${c.index}" style="background:transparent; color:#e74c3c; border:none; border-radius:4px; padding:2px 6px; cursor:pointer; font-size:13px; font-weight:bold;" title="Hide tab">\u2716</button>` : `<span style="color:#7f8c8d; font-size:10px;">[${c.index}]</span>`;
          const overflowHtml = isTabsMode && c.isOverflow ? '<span class="apm-overflow-badge" title="This tab is in the EAM overflow menu (scrolled out of view)">Scrolled</span>' : "";
          item.innerHTML = `<span><span><b style="color:#3498db;">\u2630</b> &nbsp; ${c.text}</span>${overflowHtml}</span> ${actionBtn}`;
          item.ondragstart = (e) => {
            e.dataTransfer.setData("text/plain", "");
            item.classList.add("dragging");
          };
          item.ondragend = () => {
            item.classList.remove("dragging");
          };
        }
        return item;
      };
      visibleItems.forEach((c) => colListContainer.appendChild(createDragItem(c, false)));
      if (isTabsMode && hiddenItems.length > 0) {
        const divider = document.createElement("div");
        divider.style.cssText = "text-align:center; color:#7f8c8d; font-size:11px; padding:6px 0; margin:4px 0; border-top:1px dashed #4a5a6a; user-select:none;";
        divider.textContent = "\u2500\u2500 Hidden \u2500\u2500";
        colListContainer.appendChild(divider);
        hiddenItems.forEach((c) => colListContainer.appendChild(createDragItem(c, true)));
      }
      if (isTabsMode) {
        colListContainer.querySelectorAll(".apm-tab-hide-btn").forEach((btn) => {
          btn.onclick = (e) => {
            e.stopPropagation();
            if (!presets.config.hiddenTabs) presets.config.hiddenTabs = [];
            const tabName = btn.getAttribute("data-tab-name");
            if (!presets.config.hiddenTabs.includes(tabName)) {
              presets.config.hiddenTabs.push(tabName);
            }
            renderDragList(itemsArray, emptyMsg);
          };
        });
        colListContainer.querySelectorAll(".apm-tab-restore-btn").forEach((btn) => {
          btn.onclick = (e) => {
            e.stopPropagation();
            if (!presets.config.hiddenTabs) presets.config.hiddenTabs = [];
            const tabName = btn.getAttribute("data-tab-name");
            presets.config.hiddenTabs = presets.config.hiddenTabs.filter((t) => t !== tabName);
            renderDragList(itemsArray, emptyMsg);
          };
        });
      }
    };
    colListContainer.ondragover = (e) => {
      e.preventDefault();
      const dragging = document.querySelector(".dragging");
      if (!dragging) return;
      const siblings = [...colListContainer.querySelectorAll(".apm-col-item:not(.dragging)")];
      const nextSibling = siblings.find((sibling) => {
        const box = sibling.getBoundingClientRect();
        return e.clientY <= box.top + box.height / 2;
      });
      if (nextSibling) {
        colListContainer.insertBefore(dragging, nextSibling);
      } else {
        colListContainer.appendChild(dragging);
      }
    };
    const performAutoFetch = () => {
      if (settingsMode === "cols") {
        const cols = probeExtGridColumns();
        renderDragList(cols, "No grid found. Open the Work Orders screen.");
      } else {
        const tabs = probeExtTabs();
        renderDragList(tabs, "No record tabs found. Open a Work Order.");
      }
    };
    const loadSettingsView = () => {
      const resetBtn = document.getElementById("apm-s-btn-reset");
      const titleEl = document.getElementById("apm-s-title");
      if (settingsMode === "cols") {
        togCols.style.background = "#3498db";
        togCols.style.color = "#fff";
        togTabs.style.background = "transparent";
        togTabs.style.color = "#7f8c8d";
        if (resetBtn) resetBtn.style.display = "none";
        if (titleEl) titleEl.textContent = "Visual Order:";
      } else {
        togTabs.style.background = "#3498db";
        togTabs.style.color = "#fff";
        togCols.style.background = "transparent";
        togCols.style.color = "#7f8c8d";
        if (resetBtn) resetBtn.style.display = "block";
        if (titleEl) titleEl.textContent = "Tab Layout:";
      }
      performAutoFetch();
    };
    togCols.onclick = () => {
      settingsMode = "cols";
      loadSettingsView();
    };
    togTabs.onclick = () => {
      settingsMode = "tabs";
      invalidateTabCache();
      loadSettingsView();
    };
    tabAutofill.onclick = () => {
      activeTab = "autofill";
      resetTabs();
      tabAutofill.className = "apm-tab-btn apm-tab-active-autofill";
      mainFields.style.display = "block";
      settingsFields.style.display = "none";
      colorcodeFields.style.display = "none";
      generalFields.style.display = "none";
      renderPresetOptions();
    };
    tabSettings.onclick = () => {
      activeTab = "settings";
      resetTabs();
      tabSettings.className = "apm-tab-btn apm-tab-active-autofill";
      mainFields.style.display = "none";
      settingsFields.style.display = "block";
      colorcodeFields.style.display = "none";
      generalFields.style.display = "none";
      loadSettingsView();
    };
    tabColorcode.onclick = () => {
      activeTab = "colorcode";
      resetTabs();
      tabColorcode.className = "apm-tab-btn apm-tab-active-autofill";
      mainFields.style.display = "none";
      settingsFields.style.display = "none";
      colorcodeFields.style.display = "block";
      generalFields.style.display = "none";
      const ccFooterTools = document.getElementById("cc-footer-btns");
      if (ccFooterTools) ccFooterTools.style.display = "flex";
    };
    tabGeneral.onclick = () => {
      activeTab = "general";
      resetTabs();
      tabGeneral.className = "apm-tab-btn apm-tab-active-autofill";
      mainFields.style.display = "none";
      settingsFields.style.display = "none";
      colorcodeFields.style.display = "none";
      generalFields.style.display = "block";
    };
    document.getElementById("apm-c-btn-help").onclick = () => {
      helpOverlay.style.display = "flex";
    };
    document.getElementById("apm-help-close").onclick = (e) => {
      e.stopPropagation();
      helpOverlay.style.display = "none";
    };
    helpOverlay.onclick = (e) => {
      if (e.target === helpOverlay) {
        helpOverlay.style.display = "none";
      }
    };
    selectEl.addEventListener("change", () => {
      const presets = getPresets();
      const selected = selectEl.value;
      if (selected && presets.autofill[selected]) {
        applyPresetData(presets.autofill[selected]);
      }
    });
    const getCurrentFormData = () => {
      return {
        keyword: document.getElementById("apm-c-keyword").value.toLowerCase(),
        org: document.getElementById("apm-c-org").value,
        eq: document.getElementById("apm-c-eq").value,
        type: document.getElementById("apm-c-type").value,
        status: document.getElementById("apm-c-status").value,
        exec: document.getElementById("apm-c-exec").value,
        safety: document.getElementById("apm-c-safety").value,
        lotoMode: document.getElementById("apm-c-loto-mode").value,
        pmChecks: document.getElementById("apm-c-pm-checks").value ? parseInt(document.getElementById("apm-c-pm-checks").value, 10) : 0,
        prob: document.getElementById("apm-c-prob").value,
        fail: document.getElementById("apm-c-fail").value,
        cause: document.getElementById("apm-c-cause").value,
        assign: document.getElementById("apm-c-assign").value,
        start: document.getElementById("apm-c-start").value,
        end: document.getElementById("apm-c-end").value,
        close: document.getElementById("apm-c-close").value
      };
    };
    document.getElementById("apm-c-btn-save").onclick = () => {
      const presets = getPresets();
      if (selectEl.value) {
        presets.autofill[selectEl.value] = getCurrentFormData();
        savePresets();
        showToast(`Template "${selectEl.value}" Updated!`, "#2ecc71");
      } else {
        showToast("No template selected to update.", "#e74c3c");
      }
    };
    document.getElementById("apm-c-btn-new").onclick = () => {
      const name = prompt("Enter a name for the new template:");
      if (name && name.trim()) {
        const presets = getPresets();
        const safeName = name.trim();
        presets.autofill[safeName] = getCurrentFormData();
        savePresets();
        renderPresetOptions();
        selectEl.value = safeName;
        showToast(`Template "${safeName}" Created!`, "#3498db");
      }
    };
    document.getElementById("apm-c-btn-del").onclick = () => {
      if (selectEl.value && confirm(`Delete template "${selectEl.value}"?`)) {
        const presets = getPresets();
        const deletedName = selectEl.value;
        delete presets.autofill[selectEl.value];
        savePresets();
        renderPresetOptions();
        showToast(`Template "${deletedName}" Deleted.`, "#e74c3c");
      }
    };
    document.getElementById("apm-s-btn-save-settings").onclick = () => {
      const items = [...colListContainer.querySelectorAll(".apm-col-item")];
      const presets = getPresets();
      if (items.length > 0) {
        const visibleItems = [...colListContainer.querySelectorAll('.apm-col-item:not([style*="opacity"])')].filter((el2) => el2.style.opacity !== "0.4");
        const orderStr = visibleItems.map((el2) => el2.dataset.index).join(", ");
        if (settingsMode === "cols") {
          presets.config.columnOrder = orderStr;
          showToast("Grid Column order saved!", "#2ecc71");
          applyGridConsistency();
        } else {
          presets.config.tabOrder = orderStr;
          const hiddenCount = (presets.config.hiddenTabs || []).length;
          showToast(`Tab layout saved! (${hiddenCount} hidden)`, "#2ecc71");
          applyTabConsistency();
        }
        savePresets();
      } else {
        showToast("No items to save.", "#e74c3c");
      }
    };
    document.getElementById("apm-s-btn-reset").onclick = () => {
      if (!confirm("Reset layout to system defaults?")) return;
      const presets = getPresets();
      if (settingsMode === "tabs") {
        presets.config.tabOrder = "";
        presets.config.hiddenTabs = [];
        invalidateTabCache();
        savePresets();
        const allWins = getExtWindows();
        for (const win of allWins) {
          try {
            if (!win.Ext || !win.Ext.ComponentQuery) continue;
            const tabPanels = win.Ext.ComponentQuery.query("tabpanel");
            const mainTP = tabPanels.find((tp) => tp.rendered && !tp.isDestroyed && tp.items);
            if (mainTP) {
              mainTP.items.items.forEach((item) => {
                if (!item.isDestroyed && item.tab && item.tab.el && item.tab.el.dom) {
                  item.tab.el.dom.classList.remove("apm-tab-hidden");
                }
              });
              const defaultOrder = window._apmSystemDefaultTabOrder;
              if (defaultOrder && defaultOrder.length > 0) {
                let layoutsSuspended = false;
                try {
                  win.Ext.suspendLayouts();
                  layoutsSuspended = true;
                  defaultOrder.forEach((tabName, targetIdx) => {
                    if (mainTP.isDestroyed) return;
                    const currentIdx = mainTP.items.findIndexBy((item) => {
                      if (item.isDestroyed) return false;
                      let name = (item.title || item.text || "").replace(/<[^>]*>?/gm, "").trim();
                      return name === tabName;
                    });
                    if (currentIdx !== -1 && currentIdx !== targetIdx) {
                      const itemToMove = mainTP.items.getAt(currentIdx);
                      if (itemToMove) mainTP.move(itemToMove, targetIdx);
                    }
                  });
                } catch (e) {
                } finally {
                  if (layoutsSuspended) win.Ext.resumeLayouts(true);
                  if (!mainTP.isDestroyed && typeof mainTP.updateLayout === "function") {
                    mainTP.updateLayout();
                  }
                }
              }
            }
          } catch (e) {
          }
        }
        showToast("Tab layout reset to system defaults!", "#3498db");
        performAutoFetch();
      } else {
        presets.config.columnOrder = "";
        savePresets();
        showToast("Column layout reset to defaults!", "#3498db");
        performAutoFetch();
      }
    };
    if (activeTab === "autofill") tabAutofill.onclick();
    else tabSettings.onclick();
  }

  // src/ui/toolbar-injection.js
  function injectToggleBtnNatively() {
    if (window.self !== window.top) return;
    if (!window._apmForecastToggleBound) {
      window._apmForecastToggleBound = true;
      window.addEventListener("APM_TOGGLE_FORECAST", (e) => {
        console.log("[APM Master] Event: APM_TOGGLE_FORECAST fired.");
        const panel = document.getElementById("eam-forecast-panel");
        if (!panel) {
          console.error("[APM Master] Forecast panel not found in DOM!");
          return;
        }
        if (panel.style.display === "none" || panel.style.display === "") {
          const cp = document.getElementById("apm-colorcode-panel");
          const sp = document.getElementById("apm-settings-panel");
          if (cp) cp.style.display = "none";
          if (sp) sp.style.display = "none";
          const top = e.detail.bottom + 6;
          const panelWidth = 460;
          let targetLeft = e.detail.left + e.detail.width / 2 - panelWidth / 2;
          if (targetLeft + panelWidth > window.innerWidth - 10) targetLeft = window.innerWidth - panelWidth - 10;
          if (targetLeft < 10) targetLeft = 10;
          panel.style.top = top + "px";
          panel.style.left = targetLeft + "px";
          panel.style.display = "block";
          const naturalHeight = panel.scrollHeight || panel.offsetHeight;
          const availableHeight = window.innerHeight - top - 20;
          if (naturalHeight > availableHeight) {
            panel.style.zoom = (availableHeight / naturalHeight).toFixed(3);
          } else {
            panel.style.zoom = "1";
          }
          console.log("[APM Master] Forecast panel opened. Scaling:", panel.style.zoom);
        } else {
          panel.style.display = "none";
          console.log("[APM Master] Forecast panel closed.");
        }
      });
      window.addEventListener("APM_TOGGLE_SETTINGS", (e) => {
        console.log("[APM Master] Event: APM_TOGGLE_SETTINGS fired.");
        let p = document.getElementById("apm-settings-panel");
        if (!p) {
          console.warn("[APM Master] Settings panel missing. Rebuilding...");
          if (typeof window.apmBuildSettingsPanel === "function") {
            window.apmBuildSettingsPanel();
            p = document.getElementById("apm-settings-panel");
          }
        }
        if (!p) {
          console.error("[APM Master] Settings panel could not be built!");
          return;
        }
        if (p.style.display === "none" || p.style.display === "") {
          const fp = document.getElementById("eam-forecast-panel");
          const cp = document.getElementById("apm-colorcode-panel");
          if (fp) fp.style.display = "none";
          if (cp) cp.style.display = "none";
          const top = e.detail.bottom + 6;
          const panelWidth = 440;
          let left = e.detail.left + e.detail.width / 2 - panelWidth / 2;
          if (left + panelWidth > window.innerWidth - 10) left = window.innerWidth - panelWidth - 10;
          if (left < 10) left = 10;
          p.style.top = top + "px";
          p.style.left = left + "px";
          p.style.display = "block";
          const naturalHeight = p.scrollHeight || p.offsetHeight;
          const availableHeight = window.innerHeight - top - 20;
          if (naturalHeight > availableHeight) {
            p.style.zoom = (availableHeight / naturalHeight).toFixed(3);
          } else {
            p.style.zoom = "1";
          }
          console.log("[APM Master] Settings panel opened. Scaling:", p.style.zoom);
        } else {
          p.style.display = "none";
          console.log("[APM Master] Settings panel closed.");
        }
      });
      document.addEventListener("mousedown", (e) => {
        const fcBtn = e.target.closest("#apm-forecast-ext-btn");
        if (fcBtn) {
          console.log("[APM Toolbar] Delegated MouseDown: Forecast Button");
          e.preventDefault();
          e.stopPropagation();
          var rect = fcBtn.getBoundingClientRect();
          window.dispatchEvent(new CustomEvent("APM_TOGGLE_FORECAST", {
            detail: { left: rect.left, bottom: rect.bottom, width: rect.width }
          }));
          return;
        }
        const crBtn = e.target.closest("#apm-settings-ext-btn");
        if (crBtn) {
          console.log("[APM Toolbar] Delegated MouseDown: Settings Button");
          e.preventDefault();
          e.stopPropagation();
          var rect = crBtn.getBoundingClientRect();
          window.dispatchEvent(new CustomEvent("APM_TOGGLE_SETTINGS", {
            detail: { left: rect.left, bottom: rect.bottom, width: rect.width }
          }));
          return;
        }
      }, true);
      document.addEventListener("mouseover", (e) => {
        const btn = e.target.closest("#apm-forecast-ext-btn, #apm-settings-ext-btn");
        if (btn) btn.style.color = "#ffffff";
      }, true);
      document.addEventListener("mouseout", (e) => {
        const btn = e.target.closest("#apm-forecast-ext-btn, #apm-settings-ext-btn");
        if (btn) btn.style.color = "#d1d1d1";
      }, true);
      const hidePanelsGlobal = (e) => {
        const panels = [
          document.getElementById("eam-forecast-panel"),
          document.getElementById("apm-settings-panel"),
          document.getElementById("apm-labor-panel"),
          document.getElementById("apm-labor-mgr-panel"),
          document.getElementById("apm-colorcode-panel")
        ];
        const isClickOnTrigger = e && e.target && (e.target.closest("#apm-forecast-ext-btn") || e.target.closest("#apm-settings-ext-btn") || e.target.closest("#apm-labor-mgr-toggle") || e.target.closest("#apm-labor-trigger") || e.target.closest(".apm-toolbar-btn") || e.target.closest(".rain-cloud-hover"));
        const isClickInsidePanel = e && e.target && panels.some((p) => p && p.contains(e.target));
        const isClickOnExternalOverlay = e && e.target && (e.target.closest(".swal2-container") || e.target.closest(".x-mask"));
        if (isClickOnTrigger || isClickInsidePanel || isClickOnExternalOverlay) return;
        panels.forEach((p) => {
          if (p && (p.style.display === "block" || p.style.display === "flex")) {
            p.style.display = "none";
          }
        });
        window.dispatchEvent(new Event("APM_CLOSE_LABOR"));
      };
      document.addEventListener("mousedown", hidePanelsGlobal, true);
      APMScheduler.registerTask("focus-defocus", 5e3, () => {
        document.querySelectorAll("iframe").forEach((f) => {
          try {
            const fWin = f.contentWindow;
            if (fWin && !fWin.__apm_forecast_defocus) {
              if (fWin.Ext && fWin.Ext.getDoc) fWin.Ext.getDoc().on("mousedown", hidePanelsGlobal);
              else if (fWin.document) fWin.document.addEventListener("mousedown", hidePanelsGlobal, true);
              fWin.__apm_forecast_defocus = true;
            }
          } catch (err) {
          }
        });
      });
      let lastPulse = 0;
      const tryInjectButtons = () => {
        try {
          const now = Date.now();
          if (now - lastPulse > 1e4) {
            console.log("[APM Toolbar] Pulse: Injection task active.");
            lastPulse = now;
          }
          if (!window.Ext || !window.Ext.ComponentQuery) return;
          var exitingCmp = window.Ext.getCmp("apm-custom-btn-group");
          if (exitingCmp && exitingCmp.getEl() && exitingCmp.getEl().dom && document.body.contains(exitingCmp.getEl().dom)) {
            return;
          }
          if (exitingCmp) {
            console.log("[APM Toolbar] Destroying stale button component.");
            exitingCmp.destroy();
          }
          var rawBtns = document.querySelectorAll(".x-btn-mainmenuButton-toolbar-small");
          if (rawBtns.length === 0) return;
          var visibleBtns = [];
          for (var i = 0; i < rawBtns.length; i++) {
            if (rawBtns[i].offsetWidth > 0) visibleBtns.push(rawBtns[i]);
          }
          if (visibleBtns.length === 0) return;
          var lastDomBtn = visibleBtns[visibleBtns.length - 1];
          var extEl = lastDomBtn.closest(".x-btn") || lastDomBtn;
          if (!extEl || !extEl.id) return;
          var extCmp = window.Ext.getCmp(extEl.id);
          if (!extCmp) return;
          var parentContainer = extCmp.up("toolbar") || extCmp.up("container");
          if (!parentContainer) {
            parentContainer = extCmp.up("panel")?.getDockedItems('toolbar[dock="top"]')[0];
          }
          if (!parentContainer) return;
          console.log("[APM Toolbar] Injecting buttons into container:", parentContainer.id);
          var insertIndex = parentContainer.items.indexOf(extCmp) + 1;
          parentContainer.insert(insertIndex, {
            xtype: "component",
            id: "apm-custom-btn-group",
            margin: "0 0 0 12",
            html: '<div id="apm-btn-group-inner" style="display:flex; align-items:center; gap:27px;"><div id="apm-forecast-ext-btn" style="display:flex; align-items:center; font-family:sans-serif; font-size:13px; font-weight:600; color:#d1d1d1; transition:color 0.15s; cursor:pointer;" class="rain-cloud-hover apm-btn-inner apm-fc-btn"><span style="margin-right:6px;">Forecast</span><svg viewBox="0 0 24 24" width="22" height="22" style="vertical-align: text-bottom; margin-bottom: 2px; overflow: visible;"><path class="lightning-bolt" d="M18,3 L5,16 L11,16 L7,26 L20,11 L13,11 Z" fill="#f1c40f"/><path d="M17.5,18 C20,18 22,16 22,13.5 C22,11.2 20.3,9.3 18,9 C17.5,6.2 15,4 12,4 C8.7,4 6,6.7 6,10 C6,10.1 6,10.1 6,10.1 C3.8,10.3 2,12.2 2,14.5 C2,17 4,19 6.5,19 L17.5,18 Z" fill="currentColor"/><path class="raindrop drop-1" d="M8,19 L7,23" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path class="raindrop drop-2" d="M12,20 L11,24" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path class="raindrop drop-3" d="M16,19 L15,23" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path class="raindrop drop-4" d="M10,18 L9,22" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path class="raindrop drop-5" d="M14,19 L13,23" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path class="raindrop drop-6" d="M18,18 L17,22" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg></div><div id="apm-settings-ext-btn" style="display:flex; align-items:center; font-family:sans-serif; font-size:13px; font-weight:600; color:#d1d1d1; transition:color 0.15s; cursor:pointer;"><span>APM Master</span><span style="margin-left: 5px; display: inline-flex; align-items: center;"><svg viewBox="0 0 10 10" width="8" height="8" style="fill: currentColor; opacity: 0.8;"><path d="M0 3 L10 3 L5 8 Z"/></svg></span></div></div>'
          });
        } catch (e) {
          console.error("APM Native Button Injection Error:", e);
        }
      };
      APMScheduler.registerTask("ext-btn-injection", 500, tryInjectButtons);
    }
  }

  // src/modules/ptp/ptp-timer.js
  var ptpSeconds = 120;
  function initPtpTimerUI() {
    let timerUI = document.getElementById("apm-ptp-timer");
    if (!timerUI) {
      timerUI = document.createElement("div");
      timerUI.id = "apm-ptp-timer";
      timerUI.style.cssText = `
            position: fixed; top: 85px; right: 30px;
            background: #34495e; color: white; padding: 6px 12px 6px 16px; border-radius: 30px;
            font-family: sans-serif; font-size: 16px; font-weight: bold;
            z-index: 100000; box-shadow: 0 4px 15px rgba(0,0,0,0.3);
            display: flex; align-items: center; gap: 10px; border: 2px solid #2c3e50;
            user-select: none; pointer-events: auto; transition: all 0.2s;
        `;
      document.body.appendChild(timerUI);
    }
    if (!window._ptpTimerRunning) {
      timerUI.innerHTML = `
            <div id="apm-ptp-start-btn" style="display:flex; align-items:baseline; gap:8px; cursor:pointer;">
                <span style="font-size:12px; text-transform:uppercase; opacity:0.9; letter-spacing:0.5px; color:#f1c40f;">\u25B6 Start PTP Timer</span>
                <span id="apm-ptp-time" style="font-family:monospace; font-size:20px; opacity:0.5;">02:00</span>
            </div>
            <div id="apm-ptp-close" style="cursor:pointer; font-size:14px; opacity:0.5; padding-left:4px; transition:opacity 0.2s;" title="Dismiss Timer">\u2716</div>
        `;
      timerUI.style.background = "#34495e";
      timerUI.style.borderColor = "#2c3e50";
      document.getElementById("apm-ptp-start-btn").onclick = startPtpCountdown;
    }
    const closeBtn = document.getElementById("apm-ptp-close");
    closeBtn.onmouseover = function() {
      this.style.opacity = "1";
    };
    closeBtn.onmouseout = function() {
      this.style.opacity = "0.5";
    };
    closeBtn.onclick = () => {
      timerUI.style.display = "none";
      APMScheduler.removeTask("ptp-countdown");
      window._ptpTimerRunning = false;
      window._ptpDismissed = true;
    };
    return timerUI;
  }
  function startPtpCountdown() {
    window._ptpTimerRunning = true;
    ptpSeconds = 120;
    const timerUI = document.getElementById("apm-ptp-timer");
    timerUI.style.background = "#e74c3c";
    timerUI.style.borderColor = "#c0392b";
    timerUI.innerHTML = `
        <div style="display:flex; align-items:baseline; gap:8px;">
            <span style="font-size:12px; text-transform:uppercase; opacity:0.9; letter-spacing:0.5px;">PTP Timer:</span>
            <span id="apm-ptp-time" style="font-family:monospace; font-size:20px;">02:00</span>
        </div>
        <div id="apm-ptp-close" style="cursor:pointer; font-size:14px; opacity:0.7; padding-left:4px; transition:opacity 0.2s;" title="Dismiss Timer">\u2716</div>
    `;
    const closeBtn = document.getElementById("apm-ptp-close");
    closeBtn.onmouseover = function() {
      this.style.opacity = "1";
    };
    closeBtn.onmouseout = function() {
      this.style.opacity = "0.7";
    };
    closeBtn.onclick = () => {
      timerUI.style.display = "none";
      APMScheduler.removeTask("ptp-countdown");
      window._ptpTimerRunning = false;
      window._ptpDismissed = true;
    };
    APMScheduler.registerTask("ptp-countdown", 1e3, () => {
      ptpSeconds--;
      const timeEl = document.getElementById("apm-ptp-time");
      if (!timeEl) return;
      if (ptpSeconds <= 0) {
        APMScheduler.removeTask("ptp-countdown");
        timeEl.textContent = "READY";
        timerUI.style.background = "#2ecc71";
        timerUI.style.borderColor = "#27ae60";
      } else {
        const mins = Math.floor(ptpSeconds / 60);
        const secs = ptpSeconds % 60;
        timeEl.textContent = `0${mins}:${secs < 10 ? "0" : ""}${secs}`;
      }
    });
  }
  function stopPtpTimer() {
    const timerUI = document.getElementById("apm-ptp-timer");
    if (timerUI) timerUI.style.display = "none";
    APMScheduler.removeTask("ptp-countdown");
    window._ptpTimerRunning = false;
    window._ptpDismissed = true;
  }
  function checkPtpStatus(hasHeartbeat = false) {
    const timerUI = document.getElementById("apm-ptp-timer");
    if (timerUI && !apmGeneralSettings.ptpTimerEnabled) {
      timerUI.style.display = "none";
      APMScheduler.removeTask("ptp-countdown");
      window._ptpTimerRunning = false;
    }
  }

  // src/modules/autofill/autofill-engine.js
  function formatEAMDate(dateStr) {
    if (!dateStr) return "";
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      return formatDate(d);
    }
    return dateStr;
  }
  function setExtModelDirect(activeExt, formPanel, fieldName, value) {
    if (!formPanel || !value) return false;
    const field = activeExt.ComponentQuery.query(`[name="${fieldName}"]`, formPanel)[0] || activeExt.ComponentQuery.query(`[name="${fieldName}"]`)[0];
    if (field) {
      if (typeof field.setReadOnly === "function") field.setReadOnly(false);
      if (typeof field.setDisabled === "function") field.setDisabled(false);
      field.setValue(value);
      const record = formPanel.getRecord();
      if (record) {
        record.set(fieldName, value);
      }
      return true;
    }
    return false;
  }
  async function setEamLovFieldDirect(activeExt, formPanel, name, value) {
    if (!activeExt || !formPanel || !value) return false;
    const field = activeExt.ComponentQuery.query(`[name="${name}"]`, formPanel)[0] || activeExt.ComponentQuery.query(`[name="${name}"]`)[0];
    if (field) {
      if (typeof field.setReadOnly === "function") field.setReadOnly(false);
      if (typeof field.setDisabled === "function") field.setDisabled(false);
      field.setValue(value);
      const record = formPanel.getRecord();
      if (record) record.set(name, value);
      if (field.inputEl && field.inputEl.dom) {
        const dom = field.inputEl.dom;
        dom.focus();
        dom.value = value;
        dom.dispatchEvent(new Event("input", { bubbles: true }));
        dom.dispatchEvent(new Event("change", { bubbles: true }));
        const tabEvent = new KeyboardEvent("keydown", { key: "Tab", code: "Tab", keyCode: 9, which: 9, bubbles: true });
        dom.dispatchEvent(tabEvent);
        dom.blur();
      }
      field.fireEvent("change", field, value);
      field.fireEvent("blur", field);
      return true;
    }
    return false;
  }
  async function searchEquipmentNative(searchTerm, win) {
    const ext = win.Ext;
    const eam = win.EAM || window.top.EAM || window.EAM;
    let eamid = "", tenant = "";
    if (eam && eam.Context) {
      eamid = eam.Context.eamid;
      tenant = eam.Context.tenant;
    }
    if (!eamid || !tenant) {
      const params = ext.Object.fromQueryString(win.location.search || window.top.location.search);
      eamid = params.eamid || "";
      tenant = params.tenant || "";
    }
    if (!ext || !eamid) return searchTerm;
    let currentOrg = "";
    const orgField = ext.ComponentQuery.query('[name="organization"]')[0];
    if (orgField && orgField.getValue()) {
      currentOrg = orgField.getValue();
    } else {
      const forecastOrgEl = window.top.document.getElementById("eam-org-select");
      if (forecastOrgEl && forecastOrgEl.value) {
        currentOrg = forecastOrgEl.value;
      } else if (window.EAM && window.EAM.Context && window.EAM.Context.organization) {
        currentOrg = window.EAM.Context.organization;
      }
    }
    return new Promise((resolve) => {
      ext.Ajax.request({
        url: "OSEQPP.xmlhttp",
        method: "POST",
        params: {
          GRID_NAME: "LVOBJL",
          SYSTEM_FUNCTION_NAME: "OSEQPP",
          USER_FUNCTION_NAME: "WSJOBS",
          CURRENT_TAB_NAME: "HDR",
          COMPONENT_INFO_TYPE: "DATA_ONLY",
          LOV_TAGNAME: "equipment",
          filterfields: "equipmentcode",
          filteroperator: "CONTAINS",
          filtervalue: searchTerm,
          LOV_ALIAS_NAME_1: "equipmentlookup",
          LOV_ALIAS_VALUE_1: "true",
          LOV_ALIAS_TYPE_1: "text",
          LOV_ALIAS_NAME_2: "param.loantodept",
          LOV_ALIAS_VALUE_2: "true",
          LOV_ALIAS_TYPE_2: "text",
          LOV_ALIAS_NAME_3: "control.org",
          LOV_ALIAS_VALUE_3: currentOrg,
          LOV_ALIAS_TYPE_3: "text",
          LOV_ALIAS_NAME_4: "param.cctrspcvalidation",
          LOV_ALIAS_VALUE_4: "M",
          LOV_ALIAS_TYPE_4: "text",
          LOV_ALIAS_NAME_5: "param.department",
          LOV_ALIAS_VALUE_5: "RME",
          LOV_ALIAS_TYPE_5: "text",
          eamid,
          tenant
        },
        success: function(response) {
          try {
            const data = ext.decode(response.responseText);
            const rows = data.pageData.grid.GRIDRESULT.GRID.DATA;
            if (rows && rows.length > 0) resolve(rows[0].equipmentcode);
            else resolve(searchTerm);
          } catch (e) {
            resolve(searchTerm);
          }
        },
        failure: function() {
          resolve(searchTerm);
        }
      });
    });
  }
  async function injectExtJSFieldsNative(data) {
    showToast("Locating active EAM Form...", "#f1c40f", true);
    let activeWin = null;
    let mainForm = null;
    for (let i = 0; i < 20; i++) {
      const allDocs = getExtWindows();
      for (const win of allDocs) {
        if (win && win.Ext && win.Ext.ComponentQuery) {
          const forms = win.Ext.ComponentQuery.query("form");
          const targetForm = forms.find((f) => f.rendered && f.id.includes("recordview"));
          if (targetForm) {
            activeWin = win;
            mainForm = targetForm.getForm();
            break;
          }
        }
      }
      if (activeWin && mainForm) break;
      await delay(250);
    }
    if (!activeWin || !mainForm) {
      showToast("Error: Visible WO Form not found.", "#e74c3c");
      setIsAutoFillRunning(false);
      return;
    }
    const activeExt = activeWin.Ext;
    if (data.org) {
      showToast("Setting Organization...", "#f1c40f", true);
      await setEamLovFieldDirect(activeExt, mainForm, "organization", data.org);
      await waitForAjax(activeWin);
      await waitForAjax(activeWin);
      await delay(150);
    }
    if (data.eq) {
      showToast("Searching Equipment Database...", "#f1c40f", true);
      let finalEquipment = await searchEquipmentNative(data.eq, activeWin);
      showToast("Setting Equipment...", "#f1c40f", true);
      await setEamLovFieldDirect(activeExt, mainForm, "equipment", finalEquipment);
      await waitForAjax(activeWin);
      await delay(150);
    }
    showToast("Injecting Data Model...", "#f1c40f", true);
    if (data.exec) setExtModelDirect(activeExt, mainForm, "udfchar13", data.exec);
    if (data.safety) setExtModelDirect(activeExt, mainForm, "udfchar24", data.safety);
    if (data.close) setExtModelDirect(activeExt, mainForm, "udfnote01", data.close);
    if (data.prob) setExtModelDirect(activeExt, mainForm, "problemcode", data.prob);
    if (data.fail) setExtModelDirect(activeExt, mainForm, "failurecode", data.fail);
    if (data.cause) setExtModelDirect(activeExt, mainForm, "causecode", data.cause);
    if (data.assign) setExtModelDirect(activeExt, mainForm, "assignedto", data.assign);
    if (data.start) setExtModelDirect(activeExt, mainForm, "schedstartdate", formatEAMDate(data.start));
    if (data.end) setExtModelDirect(activeExt, mainForm, "schedenddate", formatEAMDate(data.end));
    await delay(500);
    showToast("Dispatching Save Request...", "#2ecc71", true);
    const saveBtns = activeExt.ComponentQuery.query("button[action=saveRec], button[action=saverecord], button.uft-id-saverec");
    const targetBtn = saveBtns.find((b) => b.rendered && !(typeof b.isHidden === "function" && b.isHidden())) || saveBtns[0];
    if (targetBtn) {
      if (targetBtn.handler) {
        targetBtn.handler.call(targetBtn.scope || targetBtn, targetBtn);
      } else {
        targetBtn.fireEvent("click", targetBtn);
      }
    } else {
      showToast("Error: Save button missing.", "#e74c3c");
      setIsAutoFillRunning(false);
      return;
    }
    await waitForAjax(activeWin);
  }
  async function executeChecklistsNative(data) {
    const lotoMode = data.lotoMode;
    const pmChecks = data.pmChecks || 0;
    if ((!lotoMode || lotoMode === "none") && pmChecks === 0) return;
    showToast("Navigating to Checklist...", "#9b59b6", true);
    let activeExt = null;
    let checklistContainer = null;
    let mainTabPanel = null;
    let activeWin = null;
    for (let i = 0; i < 15; i++) {
      const allDocs = getExtWindows();
      for (const win of allDocs) {
        if (win.Ext && win.Ext.ComponentQuery) {
          const containers = win.Ext.ComponentQuery.query("uxtabcontainer[itemId=ACK]");
          if (containers.length > 0) {
            activeWin = win;
            activeExt = win.Ext;
            checklistContainer = containers[0];
            mainTabPanel = checklistContainer.up("tabpanel");
            break;
          }
        }
      }
      if (activeExt && mainTabPanel) break;
      await delay(100);
    }
    if (!activeExt || !mainTabPanel || !checklistContainer) {
      showToast("Checklist Tab (ACK) not found.", "#e74c3c");
      return;
    }
    mainTabPanel.setActiveTab(checklistContainer);
    const getGridStore = () => {
      const grids = activeExt.ComponentQuery.query("gridpanel", checklistContainer);
      return grids.length > 0 ? grids[0] : null;
    };
    const localWaitForAjax = async () => {
      await delay(50);
      let waited = 0;
      while (waited < 6e3) {
        if (activeExt.Ajax && !activeExt.Ajax.isLoading()) break;
        await delay(50);
        waited += 50;
      }
      await delay(50);
    };
    const saveGridData = async () => {
      let targetBtn = null;
      const submitBtns = activeExt.ComponentQuery.query("button[tooltip=Submit], button[text=Submit]");
      const visibleSubmit = submitBtns.find((b) => b.rendered && (!b.hidden && !(typeof b.isHidden === "function" && b.isHidden())));
      if (visibleSubmit) {
        targetBtn = visibleSubmit;
      } else {
        const saveBtns = activeExt.ComponentQuery.query("button[action=saveRec], button[action=saverecord], button.uft-id-saverec");
        targetBtn = saveBtns.find((b) => b.rendered && (!b.hidden && !(typeof b.isHidden === "function" && b.isHidden()))) || saveBtns[0];
      }
      if (targetBtn) {
        if (targetBtn.handler) targetBtn.handler.call(targetBtn.scope || targetBtn, targetBtn);
        else targetBtn.fireEvent("click", targetBtn);
      }
      await localWaitForAjax();
    };
    const switchActivity = async (targetValue) => {
      const combos = activeExt.ComponentQuery.query("combobox[name=activity]", checklistContainer);
      if (!combos || combos.length === 0) return false;
      const actCombo = combos[0];
      const actStore = actCombo.getStore();
      const currentVal = String(actCombo.getValue() || "");
      const currentDisp = String(actCombo.getRawValue() || "").trim();
      if (currentVal === targetValue || currentDisp === targetValue || currentDisp.startsWith(targetValue + " -") || currentDisp.startsWith(targetValue + "-")) {
        return true;
      }
      let targetRec = null;
      actStore.each((rec) => {
        const val = String(rec.get(actCombo.valueField) || "");
        const disp = String(rec.get(actCombo.displayField) || "").trim();
        if (val === targetValue || disp === targetValue || disp.startsWith(targetValue + " -") || disp.startsWith(targetValue + "-")) {
          targetRec = rec;
        }
      });
      if (targetRec) {
        actCombo.setValue(targetRec.get(actCombo.valueField));
        actCombo.fireEvent("select", actCombo, [targetRec]);
        actCombo.fireEvent("change", actCombo, targetRec.get(actCombo.valueField));
        await localWaitForAjax();
        const grid = getGridStore();
        if (grid) {
          let waitData = 0;
          while (grid.getStore().getCount() === 0 && waitData < 500) {
            await delay(50);
            waitData += 50;
          }
        }
        return true;
      }
      return false;
    };
    await localWaitForAjax();
    if (lotoMode && lotoMode !== "none") {
      const isReady = await switchActivity("1");
      if (isReady) {
        let chkGrid = getGridStore();
        if (chkGrid && chkGrid.getStore().getCount() > 0) {
          let modifiedCount = 0;
          let needsSaving = false;
          chkGrid.getStore().each((record) => {
            let yesField = "yes", noField = "no";
            if (!record.data.hasOwnProperty("yes")) {
              const boolKeys = Object.keys(record.data).filter((k) => k.startsWith("udfchkbox") || k.includes("chkbox"));
              if (boolKeys.length >= 2) {
                yesField = boolKeys[0];
                noField = boolKeys[1];
              }
            }
            const currentYes = record.get(yesField);
            const currentNo = record.get(noField);
            if (lotoMode === "yes" && currentYes !== "-1") {
              record.set(yesField, "-1");
              record.set(noField, "0");
              needsSaving = true;
              modifiedCount++;
            } else if (lotoMode === "no" && currentNo !== "-1") {
              record.set(yesField, "0");
              record.set(noField, "-1");
              needsSaving = true;
              modifiedCount++;
            }
          });
          if (needsSaving) {
            showToast(`Synced ${modifiedCount} 1-Tech items. Saving...`, "#2ecc71", true);
            await saveGridData();
          }
        }
      }
    }
    if (pmChecks > 0) {
      showToast("Loading 10-Tech Activity...", "#3498db", true);
      const isReady = await switchActivity("10");
      if (isReady) {
        let pmGrid = getGridStore();
        if (pmGrid && pmGrid.getStore().getCount() > 0) {
          let pmModified = 0;
          let needsSaving = false;
          pmGrid.getStore().each((record, index) => {
            if (index < pmChecks) {
              let yesField = "yes", noField = "no";
              if (!record.data.hasOwnProperty("yes")) {
                const boolKeys = Object.keys(record.data).filter((k) => k.startsWith("udfchkbox") || k.includes("chkbox"));
                if (boolKeys.length >= 2) {
                  yesField = boolKeys[0];
                  noField = boolKeys[1];
                }
              }
              const isAlreadyCompleted = record.data.hasOwnProperty("completed") && record.get("completed") === "-1" || record.get(yesField) === "-1";
              if (!isAlreadyCompleted) {
                if (record.data.hasOwnProperty("completed")) record.set("completed", "-1");
                record.set(yesField, "-1");
                record.set(noField, "0");
                needsSaving = true;
                pmModified++;
              }
            }
          });
          if (needsSaving) {
            showToast(`Synced ${pmModified} PM Checks. Saving...`, "#2ecc71", true);
            await saveGridData();
          }
        } else {
          showToast("No items found on 10-Tech.", "#e74c3c");
        }
      }
    }
    const hdrContainers = activeExt.ComponentQuery.query("uxtabcontainer[itemId=HDR]");
    if (hdrContainers.length > 0) mainTabPanel.setActiveTab(hdrContainers[0]);
  }
  async function executeAutoFillFlow(fallbackTitle) {
    if (window.self !== window.top) return;
    if (getIsAutoFillRunning()) return;
    setIsAutoFillRunning(true);
    try {
      loadPresets();
      let activeTitle = "";
      const allDocs = [window.top.document, document];
      document.querySelectorAll("iframe").forEach((f) => {
        try {
          if (f.src && f.src.includes("amazon.dev")) return;
          if (f.contentDocument) allDocs.push(f.contentDocument);
        } catch (e) {
        }
      });
      for (const d of allDocs) {
        if (!d) continue;
        const descInputs = Array.from(d.querySelectorAll('input[name="description"]')).filter((el2) => {
          const style = window.getComputedStyle(el2);
          return style.display !== "none" && style.visibility !== "hidden" && el2.offsetParent !== null;
        });
        if (descInputs.length > 0 && descInputs[0].value) {
          activeTitle = descInputs[0].value.trim();
          break;
        }
      }
      if (!activeTitle && fallbackTitle) {
        activeTitle = fallbackTitle;
      }
      if (!activeTitle) {
        showToast("Error: Could not read WO Title.", "#e74c3c");
        setIsAutoFillRunning(false);
        return;
      }
      const titleLower = activeTitle.toLowerCase();
      let matchedData = null;
      const presets = getPresets();
      for (const key in presets.autofill) {
        const kwString = presets.autofill[key].keyword;
        if (!kwString) continue;
        const keywords = kwString.split(",").map((k) => k.trim().toLowerCase()).filter((k) => k.length > 0);
        if (keywords.some((k) => titleLower.includes(k))) {
          matchedData = presets.autofill[key];
          break;
        }
      }
      if (!matchedData) {
        const shortTitle = activeTitle.length > 25 ? activeTitle.substring(0, 25) + "..." : activeTitle;
        showToast(`No match for: "${shortTitle}"`, "#e74c3c");
        setIsAutoFillRunning(false);
        return;
      }
      showToast(`Auto-Filling Template: ${matchedData.keyword}`, "#f1c40f", true);
      await injectExtJSFieldsNative(matchedData);
      if (matchedData.lotoMode !== "none" || matchedData.pmChecks > 0) {
        await executeChecklistsNative(matchedData);
      }
      showToast("Auto-Fill Complete.", "#1abc9c");
    } catch (e) {
      console.error("[APM] Critical Error in executeAutoFillFlow:", e);
      showToast("Script Error (See Console)", "#e74c3c");
    } finally {
      setIsAutoFillRunning(false);
    }
  }
  function injectAutoFillTriggers() {
    if (window.self !== window.top || getIsAutoFillRunning()) return;
    let isRecordViewActive = false;
    let foundTitle = "";
    const allWins = [window.top, window];
    const allDocs = [window.document];
    document.querySelectorAll("iframe").forEach((f) => {
      try {
        if (f.contentWindow && f.contentWindow.Ext) {
          allWins.push(f.contentWindow);
        }
        if (f.contentDocument) {
          allDocs.push(f.contentDocument);
        }
      } catch (err) {
      }
    });
    allWins.forEach((win) => {
      try {
        if (win.Ext && win.Ext.ComponentQuery) {
          const forms = win.Ext.ComponentQuery.query("form");
          const rvForm = forms.find((f) => f.id && f.id.includes("recordview") && typeof f.isVisible === "function" && f.isVisible(true));
          if (rvForm) {
            isRecordViewActive = true;
            const descField = rvForm.getForm().findField("description");
            if (descField) {
              foundTitle = (descField.getValue() || "").trim().toLowerCase();
            }
          }
        }
      } catch (err) {
      }
    });
    const currentWoTitle = foundTitle;
    const isFormReady = isRecordViewActive;
    const presets = getPresets();
    allDocs.forEach((d) => {
      if (!d) return;
      if (!isFormReady || !currentWoTitle) {
        d.querySelectorAll("#apm-btn-do-autofill").forEach((btn) => btn.remove());
        return;
      }
      const headerEl = d.querySelector("span.recordcode");
      if (headerEl) {
        const existingBtn = d.getElementById("apm-btn-do-autofill");
        let hasMatch = false;
        for (const key in presets.autofill) {
          const kwString = presets.autofill[key].keyword;
          if (!kwString) continue;
          const keywords = kwString.split(",").map((k) => k.trim().toLowerCase()).filter(Boolean);
          if (keywords.some((k) => currentWoTitle.includes(k))) {
            hasMatch = true;
            break;
          }
        }
        if (hasMatch && !existingBtn) {
          const btn = document.createElement("button");
          btn.id = "apm-btn-do-autofill";
          btn.innerHTML = "Auto Fill \u26A1";
          btn.style.cssText = "margin-left: 15px; padding: 4px 12px; background: #3498db; color: white; border: none; border-radius: 4px; font-weight: bold; cursor: pointer; font-size: 11px; vertical-align: middle; transition: background 0.2s; box-shadow: 0 1px 3px rgba(0,0,0,0.2); height: 24px; line-height: 1;";
          btn.onmouseenter = () => {
            btn.style.background = "#2980b9";
          };
          btn.onmouseleave = () => {
            btn.style.background = "#3498db";
          };
          btn.onclick = (e) => {
            e.preventDefault();
            executeAutoFillFlow("");
          };
          headerEl.insertAdjacentElement("afterend", btn);
        } else if (!hasMatch && existingBtn) {
          existingBtn.remove();
        }
      }
    });
  }

  // src/modules/labor-tracker.js
  var LaborTracker = (function() {
    if (window.self !== window.top) return { init: function() {
    } };
    let laborCache = { data: [], lastFetch: 0 };
    let activeTab = 7;
    let isFetching = false;
    let savedEmployees = JSON.parse(localStorage.getItem("apmLaborSavedEmps") || "[]");
    let selectedEmployee = localStorage.getItem("apmLaborActiveEmp") || "";
    function extractEamIdAggressive() {
      const uuidPattern = /([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/i;
      if (window.EAM && window.EAM.AppData && window.EAM.AppData.eamid) return window.EAM.AppData.eamid;
      const cookieMatch = document.cookie.match(new RegExp(`eamid=${uuidPattern.source}`, "i"));
      if (cookieMatch) return cookieMatch[1];
      const frames = document.querySelectorAll("iframe");
      for (let f of frames) {
        if (f.src) {
          const srcMatch = f.src.match(new RegExp(`eamid=${uuidPattern.source}`, "i"));
          if (srcMatch) return srcMatch[1];
        }
      }
      return null;
    }
    function extractEmployeeId() {
      if (window.EAM) {
        if (window.EAM.Context && window.EAM.Context.employee) return window.EAM.Context.employee.toUpperCase();
        if (window.EAM.AppData) {
          if (window.EAM.AppData.employee) return window.EAM.AppData.employee.toUpperCase();
          if (window.EAM.AppData.user) return window.EAM.AppData.user.toUpperCase();
        }
      }
      if (window.Ext && window.Ext.ComponentQuery) {
        try {
          const tbText = window.Ext.ComponentQuery.query('toolbar text[text*="User ("]')[0];
          if (tbText && tbText.text) {
            const m = tbText.text.match(/\(([^@\s\)]+)@/i);
            if (m) return m[1].toUpperCase();
          }
        } catch (e) {
        }
      }
      const headerSelectors = [
        ".x-toolbar-text-mainmenuButton-toolbar",
        "#eam-user-name",
        ".u-header-username",
        ".eam-user-info",
        "#userName",
        ".user-name"
      ];
      for (let sel of headerSelectors) {
        const el2 = document.querySelector(sel);
        if (el2 && el2.textContent) {
          const text = el2.textContent.trim();
          const m = text.match(/\(([^@\s\)]+)@/i) || text.match(/User\s*\(([^@\s\)]+)/i);
          if (m) return m[1].toUpperCase();
          const parts = text.split(",")[0].split(" ")[0].toUpperCase();
          if (parts && parts.length > 2) return parts;
        }
      }
      const topBar = document.querySelector(".x-toolbar-main");
      if (topBar) {
        const bodyMatch = topBar.textContent.match(/User\s*\(([^@\s\)]+)@/i);
        if (bodyMatch) return bodyMatch[1].toUpperCase();
      }
      const lastKnown = localStorage.getItem("apmLastKnownEmpId");
      if (lastKnown) return lastKnown;
      console.warn("[Labor Tracker] No active user found in framework.");
      return "";
    }
    async function fetchLaborData() {
      if (Date.now() - laborCache.lastFetch < 9e5 && laborCache.data.length > 0) {
        updateUIState();
        return;
      }
      isFetching = true;
      updateUIState("Loading...");
      const currentEamId = extractEamIdAggressive();
      if (!currentEamId) {
        isFetching = false;
        updateUIState("Session Error");
        return;
      }
      const url = "https://us1.eam.hxgnsmartcloud.com/web/base/WSBOOK.HDR.xmlhttp";
      const currentTenant = window.EAM?.AppData?.tenant || "AMAZONRMENA_PRD";
      const currentUser = extractEmployeeId();
      const targetEmployee = selectedEmployee ? selectedEmployee : currentUser;
      if (currentUser && !selectedEmployee) {
        localStorage.setItem("apmLastKnownEmpId", currentUser);
      }
      const payload = new URLSearchParams({
        GRID_ID: "1742",
        GRID_NAME: "WSBOOK_HDR",
        DATASPY_ID: "100696",
        USER_FUNCTION_NAME: "WSBOOK",
        SYSTEM_FUNCTION_NAME: "WSBOOK",
        CURRENT_TAB_NAME: "HDR",
        COMPONENT_INFO_TYPE: "DATA_ONLY",
        employee: targetEmployee,
        tenant: currentTenant,
        eamid: currentEamId,
        NUMBER_OF_ROWS_FIRST_RETURNED: "5000",
        MAX_ROWS: "5000",
        RECORDS_TO_RECEIVE: "5000",
        PAGINATION_FIRST_ROW: "1",
        PAGINATION_LAST_ROW: "5000",
        LIST_ALL_ROWS: "YES",
        FORCE_REQUERY: "YES"
      });
      try {
        const firstResponse = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8", "X-Requested-With": "XMLHttpRequest" },
          body: payload.toString()
        });
        const firstText = await firstResponse.text();
        if (firstText.trim().startsWith("<") || firstText.includes("System Error")) {
          updateUIState("Server Rejected");
          isFetching = false;
          return;
        }
        const jsonStart = firstText.indexOf("{");
        if (jsonStart === -1) throw new Error("No JSON found");
        const dataObj = JSON.parse(firstText.substring(jsonStart));
        let allRecords = dataObj?.pageData?.grid?.GRIDRESULT?.GRID?.DATA || [];
        let metadata = dataObj?.pageData?.grid?.GRIDRESULT?.GRID?.METADATA || {};
        let nextCursor = parseInt(metadata.CURRENTCURSORPOSITION || allRecords.length) + 1;
        while (metadata.MORERECORDPRESENT === "+" && allRecords.length < 5e3) {
          console.log(`[Labor Tracker] More records present. Fetching from cursor ${nextCursor}...`);
          const cacheUrl = "https://us1.eam.hxgnsmartcloud.com/web/base/GETCACHE";
          const cachePayload = new URLSearchParams({
            COMPONENT_INFO_TYPE: "DATA_ONLY",
            COMPONENT_INFO_TYPE_MODE: "CACHE",
            GRID_ID: "1742",
            GRID_NAME: "WSBOOK_HDR",
            DATASPY_ID: "100696",
            NUMBER_OF_ROWS_FIRST_RETURNED: "100",
            // Request 100 more
            CACHE_REQUEST: "false",
            CURSOR_POSITION: nextCursor.toString(),
            CURRENT_TAB_NAME: "HDR",
            SYSTEM_FUNCTION_NAME: "WSBOOK",
            USER_FUNCTION_NAME: "WSBOOK",
            eamid: currentEamId,
            tenant: currentTenant,
            employee: targetEmployee
          });
          const cacheResponse = await fetch(cacheUrl, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8", "X-Requested-With": "XMLHttpRequest" },
            body: cachePayload.toString()
          });
          const cacheText = await cacheResponse.text();
          const cacheJsonStart = cacheText.indexOf("{");
          if (cacheJsonStart === -1) break;
          const cacheDataObj = JSON.parse(cacheText.substring(cacheJsonStart));
          const newRecords = cacheDataObj?.pageData?.grid?.GRIDRESULT?.GRID?.DATA || [];
          if (newRecords.length === 0) break;
          allRecords = allRecords.concat(newRecords);
          metadata = cacheDataObj?.pageData?.grid?.GRIDRESULT?.GRID?.METADATA || {};
          nextCursor = parseInt(metadata.CURRENTCURSORPOSITION || allRecords.length) + 1;
          if (allRecords.length > 5e3) break;
        }
        laborCache.data = allRecords;
        laborCache.lastFetch = Date.now();
        console.log(`[Labor Tracker] Consolidated ${laborCache.data.length} records.`);
        if (laborCache.data.length > 0) {
          console.log(`[Labor Tracker] Datework format sample: "${laborCache.data[0].datework}"`);
        }
      } catch (err) {
        console.error("[Labor Tracker] Fetch error:", err);
        updateUIState("Data Error");
      } finally {
        isFetching = false;
        updateUIState();
      }
    }
    function calculateLabor(daysParam) {
      const now = /* @__PURE__ */ new Date();
      now.setHours(0, 0, 0, 0);
      let total = 0;
      let breakdown = {};
      laborCache.data.forEach((r) => {
        if (!r.datework) return;
        let rDate;
        const dateStr = String(r.datework).split(" ")[0];
        if (dateStr.includes("/")) {
          const parts = dateStr.split("/");
          if (parts.length === 3) {
            const m = parseInt(parts[0]), d = parseInt(parts[1]), y = parseInt(parts[2]);
            rDate = new Date(y, m - 1, d);
          }
        } else if (dateStr.includes("-")) {
          const parts = dateStr.split("-");
          if (parts.length === 3) {
            const y = parseInt(parts[0]), m = parseInt(parts[1]), d = parseInt(parts[2]);
            rDate = new Date(y, m - 1, d);
          }
        }
        if (!rDate || isNaN(rDate.getTime())) rDate = new Date(r.datework);
        rDate.setHours(0, 0, 0, 0);
        const diffDays = Math.round((now - rDate) / (1e3 * 3600 * 24));
        const maxDaysAgo = daysParam === 7 ? 7 : daysParam - 1;
        if (diffDays <= maxDaysAgo && diffDays >= 0) {
          const hrs = parseFloat(r.hrswork);
          if (!isNaN(hrs)) {
            total += hrs;
            breakdown[r.datework] = (breakdown[r.datework] || 0) + hrs;
          }
        }
      });
      return { total, breakdown };
    }
    function renderEmpSelect() {
      const sel = document.getElementById("apm-labor-emp-select");
      const lbl = document.getElementById("apm-labor-target-label");
      if (!sel || !lbl) return;
      sel.innerHTML = '<option value="">-- Self --</option>';
      savedEmployees.forEach((emp) => {
        const opt = document.createElement("option");
        opt.value = emp;
        opt.textContent = emp;
        if (emp === selectedEmployee) opt.selected = true;
        sel.appendChild(opt);
      });
      lbl.textContent = "Target: " + (selectedEmployee || "Self");
    }
    function injectUI() {
      if (document.getElementById("apm-labor-trigger")) return;
      const trigger = document.createElement("div");
      trigger.id = "apm-labor-trigger";
      trigger.className = "apm-labor-trigger";
      trigger.innerHTML = "LABOR TALLY \u23F1\uFE0F";
      const panel = el("div", { id: "apm-labor-panel", className: "apm-labor-panel" }, [
        el("div", { className: "apm-labor-header" }, [
          el("span", { className: "apm-labor-target-lbl", id: "apm-labor-target-label" }, "Target: Self"),
          el("button", { id: "apm-labor-mgr-toggle", className: "apm-labor-mgr-toggle" }, "Manager Mode \u2699\uFE0F")
        ]),
        el("div", { id: "apm-labor-mgr-panel", className: "apm-labor-mgr-panel" }, [
          el("div", { className: "apm-labor-mgr-row" }, [
            el("select", { id: "apm-labor-emp-select", className: "apm-labor-emp-select" }),
            el("button", { id: "apm-labor-emp-add", className: "apm-labor-btn-add", title: "Add User" }, "+"),
            el("button", { id: "apm-labor-emp-rem", className: "apm-labor-btn-rem", title: "Remove User" }, "-")
          ])
        ]),
        el("div", { className: "labor-tabs" }, [
          el("div", { className: "labor-tab", "data-d": "1" }, "Today"),
          el("div", { className: "labor-tab", "data-d": "2" }, "2-Day"),
          el("div", { className: "labor-tab active", "data-d": "7" }, "7-Day")
        ]),
        el("div", { id: "labor-sum-box", className: "labor-total" }, [
          "0.00 ",
          el("span", { style: { fontSize: "14px", color: "#7f8c8d" } }, "hrs")
        ]),
        el("div", { id: "labor-breakdown-box", className: "apm-labor-breakdown-box" }),
        el("button", { id: "labor-force-refresh", className: "apm-labor-force-refresh" }, "Refresh from Server")
      ]);
      document.body.appendChild(trigger);
      document.body.appendChild(panel);
      renderEmpSelect();
      let dockInfo = JSON.parse(localStorage.getItem("apmLaborDockPos") || '{"edge":"right","pos":300}');
      let isVisible = false;
      function applyDocking() {
        let maxPos = dockInfo.edge === "top" || dockInfo.edge === "bottom" ? window.innerWidth : window.innerHeight;
        dockInfo.pos = Math.max(30, Math.min(maxPos - 30, dockInfo.pos));
        trigger.style.left = trigger.style.right = trigger.style.top = trigger.style.bottom = "";
        panel.style.left = panel.style.right = panel.style.top = panel.style.bottom = "";
        trigger.style.transition = "background 0.2s, transform 0.2s ease-out";
        trigger.style.writingMode = trigger.style.textOrientation = "";
        const offset = "34px";
        if (dockInfo.edge === "right") {
          trigger.style.right = "0";
          trigger.style.top = dockInfo.pos + "px";
          trigger.style.transform = "translateY(-50%)";
          trigger.style.writingMode = "vertical-rl";
          trigger.style.borderRadius = "8px 0 0 8px";
          panel.style.right = offset;
          panel.style.top = dockInfo.pos + "px";
          panel.style.transform = isVisible ? "translate(0%, -50%)" : "translate(calc(100% + 50px), -50%)";
        } else if (dockInfo.edge === "left") {
          trigger.style.left = "0";
          trigger.style.top = dockInfo.pos + "px";
          trigger.style.transform = "translateY(-50%)";
          trigger.style.writingMode = "vertical-lr";
          trigger.style.textOrientation = "mixed";
          trigger.style.borderRadius = "0 8px 8px 0";
          panel.style.left = offset;
          panel.style.top = dockInfo.pos + "px";
          panel.style.transform = isVisible ? "translate(0%, -50%)" : "translate(calc(-100% - 50px), -50%)";
        } else if (dockInfo.edge === "top") {
          trigger.style.top = "0";
          trigger.style.left = dockInfo.pos + "px";
          trigger.style.transform = "translateX(-50%)";
          trigger.style.borderRadius = "0 0 8px 8px";
          panel.style.top = offset;
          panel.style.left = dockInfo.pos + "px";
          panel.style.transform = isVisible ? "translate(-50%, 0%)" : "translate(-50%, calc(-100% - 50px))";
        } else if (dockInfo.edge === "bottom") {
          trigger.style.bottom = "0";
          trigger.style.left = dockInfo.pos + "px";
          trigger.style.transform = "translateX(-50%)";
          trigger.style.borderRadius = "8px 8px 0 0";
          panel.style.bottom = offset;
          panel.style.left = dockInfo.pos + "px";
          panel.style.transform = isVisible ? "translate(-50%, 0%)" : "translate(-50%, calc(100% + 50px))";
        }
      }
      applyDocking();
      trigger.onmousedown = (e) => {
        let isDragging = false;
        let startX = e.clientX, startY = e.clientY;
        let rect = trigger.getBoundingClientRect();
        let offsetX = startX - rect.left, offsetY = startY - rect.top;
        let wasVisible = isVisible;
        const onMouseMove = (moveEvent) => {
          if (!isDragging && (Math.abs(moveEvent.clientX - startX) > 5 || Math.abs(moveEvent.clientY - startY) > 5)) {
            isDragging = true;
            trigger.style.transition = "none";
            if (isVisible) {
              isVisible = false;
              applyDocking();
            }
          }
          if (isDragging) {
            trigger.style.right = trigger.style.bottom = "auto";
            trigger.style.left = moveEvent.clientX - offsetX + "px";
            trigger.style.top = moveEvent.clientY - offsetY + "px";
            trigger.style.transform = "none";
          }
        };
        const onMouseUp = (upEvent) => {
          document.removeEventListener("mousemove", onMouseMove);
          document.removeEventListener("mouseup", onMouseUp);
          if (isDragging) {
            let cx = upEvent.clientX, cy = upEvent.clientY, w = window.innerWidth, h = window.innerHeight;
            let distTop = cy, distBottom = h - cy, distLeft = cx, distRight = w - cx;
            let min = Math.min(distTop, distBottom, distLeft, distRight);
            if (min === distRight) {
              dockInfo.edge = "right";
              dockInfo.pos = cy;
            } else if (min === distLeft) {
              dockInfo.edge = "left";
              dockInfo.pos = cy;
            } else if (min === distTop) {
              dockInfo.edge = "top";
              dockInfo.pos = cx;
            } else {
              dockInfo.edge = "bottom";
              dockInfo.pos = cx;
            }
            localStorage.setItem("apmLaborDockPos", JSON.stringify(dockInfo));
            applyDocking();
          } else {
            isVisible = !wasVisible;
            applyDocking();
            if (isVisible) {
              laborCache.lastFetch = 0;
              fetchLaborData();
            }
          }
        };
        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
      };
      document.getElementById("apm-labor-mgr-toggle").onclick = () => {
        const p = document.getElementById("apm-labor-mgr-panel");
        p.style.display = p.style.display === "none" ? "flex" : "none";
      };
      document.getElementById("apm-labor-emp-add").onclick = () => {
        const alias = prompt("Enter employee alias (e.g. ROSENDAH):");
        if (alias && alias.trim()) {
          const cleanAlias = alias.trim().toUpperCase();
          if (!savedEmployees.includes(cleanAlias)) {
            savedEmployees.push(cleanAlias);
            localStorage.setItem("apmLaborSavedEmps", JSON.stringify(savedEmployees));
          }
          selectedEmployee = cleanAlias;
          localStorage.setItem("apmLaborActiveEmp", selectedEmployee);
          renderEmpSelect();
          laborCache.lastFetch = 0;
          fetchLaborData();
        }
      };
      document.getElementById("apm-labor-emp-rem").onclick = () => {
        if (!selectedEmployee) return;
        if (confirm("Remove " + selectedEmployee + " from saved list?")) {
          savedEmployees = savedEmployees.filter((e) => e !== selectedEmployee);
          localStorage.setItem("apmLaborSavedEmps", JSON.stringify(savedEmployees));
          selectedEmployee = "";
          localStorage.setItem("apmLaborActiveEmp", selectedEmployee);
          renderEmpSelect();
          laborCache.lastFetch = 0;
          fetchLaborData();
        }
      };
      document.getElementById("apm-labor-emp-select").onchange = (e) => {
        selectedEmployee = e.target.value;
        localStorage.setItem("apmLaborActiveEmp", selectedEmployee);
        renderEmpSelect();
        laborCache.lastFetch = 0;
        fetchLaborData();
      };
      document.addEventListener("mousedown", (e) => {
        if (isVisible && !panel.contains(e.target) && !trigger.contains(e.target)) {
          isVisible = false;
          applyDocking();
        }
      });
      window.addEventListener("APM_CLOSE_LABOR", () => {
        if (isVisible) {
          isVisible = false;
          applyDocking();
        }
      });
      panel.querySelectorAll(".labor-tab").forEach((t) => t.onclick = (e) => {
        panel.querySelectorAll(".labor-tab").forEach((x) => x.classList.remove("active"));
        e.target.classList.add("active");
        activeTab = parseInt(e.target.getAttribute("data-d"));
        if (!isFetching) updateUIState();
      });
      document.getElementById("labor-force-refresh").onclick = () => {
        laborCache.lastFetch = 0;
        fetchLaborData();
      };
      window.addEventListener("resize", () => applyDocking());
    }
    function updateUIState(errorMsg = null) {
      const sumBox = document.getElementById("labor-sum-box");
      const list = document.getElementById("labor-breakdown-box");
      if (errorMsg) {
        sumBox.innerHTML = `<span style="font-size:16px; color:#e74c3c;">${errorMsg}</span>`;
        if (errorMsg === "Loading...") sumBox.innerHTML = `<span style="font-size:16px; color:#f39c12;">${errorMsg}</span>`;
        list.innerHTML = "";
        return;
      }
      const { total, breakdown } = calculateLabor(activeTab);
      sumBox.innerHTML = `${total.toFixed(2)} <span style="font-size:14px; color:#7f8c8d;">hrs</span>`;
      list.innerHTML = "";
      const sortedDates = Object.keys(breakdown).sort((a, b) => new Date(b) - new Date(a));
      if (sortedDates.length === 0) {
        list.innerHTML = '<div style="text-align:center; padding:10px; color:#7f8c8d; font-size:12px;">No labor records found.</div>';
      } else {
        sortedDates.forEach((d) => {
          const row = document.createElement("div");
          row.className = "labor-row";
          row.innerHTML = `<span>${d}</span> <strong>${breakdown[d].toFixed(2)}</strong>`;
          list.appendChild(row);
        });
      }
    }
    return {
      init: function() {
        setTimeout(injectUI, 1500);
      }
    };
  })();

  // src/ui/styles.js
  var APM_STATIC_STYLES = `
/* =========================
 * Weather Animations
 * ========================= */
@keyframes rain-fall {
    0% { transform: translateY(-4px) scaleY(0.5); opacity: 0; }
    15% { opacity: 1; transform: translateY(0px) scaleY(1); }
    75% { opacity: 1; }
    100% { transform: translateY(10.8px) scaleY(1.35); opacity: 0; }
}
@keyframes lightning-flash {
    0%, 84%, 100% { opacity: 0; }
    85% { opacity: 1; }
    87% { opacity: 0; }
    88% { opacity: 1; }
    92% { opacity: 0; }
}
@keyframes center-bolt-flash {
    0% { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
    10% { opacity: 1; transform: translate(-50%, -50%) scale(1.2); filter: drop-shadow(0 0 20px rgba(241,196,15,0.8)); }
    20% { opacity: 0; transform: translate(-50%, -50%) scale(1); }
    30% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); filter: drop-shadow(0 0 40px rgba(241,196,15,1)); }
    100% { opacity: 0; transform: translate(-50%, -50%) scale(1.5); filter: drop-shadow(0 0 10px rgba(241,196,15,0)); }
}
@keyframes screen-thunder {
    0% { background-color: rgba(255, 255, 255, 0); }
    10% { background-color: rgba(255, 255, 255, 0.2); }
    20% { background-color: rgba(255, 255, 255, 0); }
    30% { background-color: rgba(255, 255, 255, 0.3); }
    100% { background-color: rgba(255, 255, 255, 0); }
}
.thunder-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; z-index: 999998; pointer-events: none; animation: screen-thunder 0.8s ease-out forwards; }
.center-lightning { position: fixed; top: 50%; left: 50%; z-index: 999999; pointer-events: none; animation: center-bolt-flash 0.8s ease-out forwards; }
.raindrop, .lightning-bolt { opacity: 0; transform-box: fill-box; }
.rain-cloud-always .raindrop, .rain-cloud-hover:hover .raindrop { animation-name: rain-fall; animation-timing-function: linear; animation-iteration-count: infinite; }
.rain-cloud-always .lightning-bolt, .rain-cloud-hover:hover .lightning-bolt { animation: lightning-flash 3.5s infinite; }
.drop-1 { animation-duration: 1.0s; animation-delay: 0.0s; }
.drop-2 { animation-duration: 1.3s; animation-delay: 0.4s; }
.drop-3 { animation-duration: 1.1s; animation-delay: 0.8s; }
.drop-4 { animation-duration: 1.4s; animation-delay: 0.2s; }
.drop-5 { animation-duration: 1.2s; animation-delay: 0.6s; }
.drop-6 { animation-duration: 1.5s; animation-delay: 0.9s; }

/* =========================
 * Form Inputs & Buttons (Forecast Panel)
 * ========================= */
#eam-forecast-panel select, #eam-forecast-panel input { outline: none !important; }
.eam-fc-container { position:fixed; z-index:2147483647; padding:12px; background:#35404a; color:white; border:1px solid #2c353c; border-radius:8px; box-shadow: 0px 8px 25px rgba(0,0,0,0.6); font-family:sans-serif; width: 500px; display:none; }

.eam-fc-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:15px; border-bottom: 1px solid #4a5a6a; padding-bottom: 10px; }
.eam-fc-title-box { display:flex; align-items:center; gap:8px; }
.eam-fc-title { margin:0; font-size:18px; color:#ffffff; font-weight: normal; }
.eam-fc-controls { display:flex; align-items:center; gap:10px; }
.eam-fc-mode-btn { background:#2b343c; color:#1abc9c; border:1px solid #1abc9c; padding: 4px 10px; border-radius:15px; cursor:pointer; font-size:11px; font-weight:bold; transition: all 0.2s; }
.eam-fc-close-btn { background:#505f6e; color:#ffffff; border:none; padding: 4px 10px; border-radius:4px; cursor:pointer; font-size:14px; font-weight:bold; transition: background 0.2s; }
.eam-fc-close-btn:hover { background: #e74c3c !important; }
.eam-fc-adv-box { display:none; flex-direction:column; gap:4px; margin-bottom:15px; }
.eam-fc-row { display:flex; gap:5px; align-items:center; }
.eam-fc-label { font-size:12px; color:#b0bec5; white-space:nowrap; }
.eam-fc-select { flex-grow:1; padding:6px; border-radius:4px; border:none; background:#ecf0f1; color:#2c3e50; font-weight:bold; cursor:pointer; }
.org-btn { background: #4a5a6a; color: white; border: none; padding: 6px 10px; border-radius: 4px; cursor: pointer; font-weight: bold; font-size: 12px; transition: background 0.2s; }
.org-btn:hover { background: #5c6d7e; }
.org-btn-add:hover { background: #3498db !important; }
.org-btn-rem:hover { background: #e74c3c !important; }

/* =========================
 * Toggle Switches
 * ========================= */
.eam-slider-switch { position: relative; display: inline-block; width: 34px; height: 18px; margin: 0; flex-shrink: 0; }
.eam-slider-switch input { opacity: 0; width: 0; height: 0; }
.eam-slider-track { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(52, 152, 219, 0.2); transition: .3s; border-radius: 18px; border: 1px solid #3498db; }
.eam-slider-track:before { position: absolute; content: ""; height: 12px; width: 12px; left: 2px; bottom: 2px; background-color: #3498db; transition: .3s; border-radius: 50%; }
.eam-slider-switch input:checked + .eam-slider-track { background-color: #3498db; }
.eam-slider-switch input:checked + .eam-slider-track:before { transform: translateX(16px); background-color: #ffffff; }

/* =========================
 * Tabs and Hidden Classes
 * ========================= */
.apm-tab-hidden { display: none !important; }
.apm-overflow-badge { font-size: 9px; background: #f39c12; color: #fff; padding: 1px 4px; border-radius: 3px; margin-left: 6px; font-weight: bold; text-transform: uppercase; }

/* =========================
 * ColorCode Nametag & Links
 * ========================= */
.apm-nametag { display: table; color: #ffffff; font-weight: bold; font-size: 11px; padding: 3px 6px; border-radius: 4px; margin-top: 5px; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.3); cursor: pointer; transition: transform 0.1s; }
.apm-nametag:hover { transform: scale(1.05); }
#apm-filter-banner { position: fixed; top: 10px; left: 50%; transform: translateX(-50%); background: #e74c3c; color: white; padding: 6px 16px; border-radius: 20px; font-weight: bold; font-size: 13px; cursor: pointer; z-index: 2147483647; display: none; box-shadow: 0 4px 10px rgba(0,0,0,0.5); }
.apm-wo-link { color: #007bff !important; text-decoration: underline !important; font-weight: bold !important; cursor: pointer; }
.apm-copy-icon { display: inline-block; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='13' height='13' viewBox='0 0 24 24' fill='none' stroke='%23007bff' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='9' y='9' width='13' height='13' rx='2' ry='2'%3E%3C/rect%3E%3Cpath d='M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1'%3E%3C/path%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: center; width: 14px; height: 14px; margin-left: 8px; vertical-align: middle; cursor: copy; opacity: 0.4; }
.apm-copy-icon:hover, .apm-copy-success { opacity: 1; }
.apm-copy-success { background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='13' height='13' viewBox='0 0 24 24' fill='none' stroke='%2328a745' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='20 6 9 17 4 12'%3E%3C/polyline%3E%3C/svg%3E") !important; }
.x-grid-item[data-cc-rule] { background-color: var(--cc-row-bg) !important; }
.x-grid-item.x-grid-item-alt[data-cc-rule] { background-color: var(--cc-row-bg-alt) !important; }
.x-grid-item.x-grid-item-over[data-cc-rule] { background-color: var(--cc-row-bg-hover) !important; }
.x-grid-item.x-grid-item-selected[data-cc-rule] { background-color: var(--cc-row-bg-sel) !important; }

/* =========================
 * ColorCode Rules UI
 * ========================= */
.rule-item { display: flex; justify-content: space-between; align-items: center; background: #2b343c; padding: 6px 8px; border-radius: 4px; margin-bottom: 6px; border-left: 4px solid #1abc9c; }
.cc-toggle-switch { position: relative; display: inline-block; width: 32px; height: 18px; margin: 0; flex-shrink: 0; }
.cc-toggle-switch input { opacity: 0; width: 0; height: 0; }
.cc-toggle-slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #505f6e; transition: .3s; border-radius: 18px; }
.cc-toggle-slider:before { position: absolute; content: ""; height: 12px; width: 12px; left: 3px; bottom: 3px; background-color: white; transition: .3s; border-radius: 50%; }
.cc-toggle-switch input:checked + .cc-toggle-slider { background-color: #1abc9c; }
.cc-toggle-switch input:checked + .cc-toggle-slider:before { transform: translateX(14px); }
.cc-footer-btn { background: #4a5a6a; color: white; border: none; padding: 6px 10px; border-radius: 4px; font-size: 11px; font-weight: bold; cursor: pointer; transition: background 0.2s; }
.cc-footer-btn:hover { background: #5c6d7e; }
.rule-btn { background: #4a5a6a; color: white; border: none; border-radius: 4px; padding: 4px 6px; cursor: pointer; font-size: 11px; font-weight: bold; }
.rule-btn:hover { background: #5c6d7e; }
.rule-delete-btn { background: transparent; color: #e74c3c; border: none; border-radius: 4px; padding: 4px 6px; cursor: pointer; font-size: 12px; font-weight: bold; }
.rule-delete-btn:hover { background: rgba(231, 76, 60, 0.2); }
.rule-dir-btn { background: transparent; border: none; color: #b0bec5; cursor: pointer; font-size: 12px; padding: 0 4px; line-height: 1; }
.rule-dir-btn:hover { color: #ffffff; }

/* =========================
 * Settings Panel & AutoFill
 * ========================= */
.apm-settings-container { position:fixed; z-index:2147483647; padding:12px; background:#35404a; color:white; border:1px solid #2c353c; border-radius:8px; box-shadow: 0px 8px 25px rgba(0,0,0,0.6); font-family:sans-serif; width: 440px; max-width: 95vw; display:none; }

.apm-settings-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; }
.apm-settings-title { margin:0; font-size:16px; color:#ffffff; font-weight:normal; }
.apm-settings-close-btn { background:#505f6e; color:#ffffff; border:none; padding:4px 10px; border-radius:4px; cursor:pointer; font-size:12px; font-weight:bold; }
.apm-tab-container { display:flex; margin-bottom:10px; background:#2b343c; border-radius:6px; overflow:hidden; }
.apm-panel-section { display:block; }
.apm-template-box { background: rgba(0,0,0,0.25); padding: 8px 10px; border-radius: 6px; margin-bottom: 12px; border: 1px solid #45535e; }
.apm-template-label { font-size: 10px; color: #b0bec5; margin-bottom: 4px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; }
.apm-template-row { display: flex; gap: 5px; align-items: center; }
.apm-template-select { flex-grow:1; height: 26px; padding:0 6px; border-radius:4px; border:none; font-weight:bold; cursor:pointer; font-size:12px; background: #ecf0f1; color: #2c3e50; }
.apm-template-btn-update { background:#3498db; color:white; padding: 4px 10px; height: 26px; }
.apm-template-btn-new { background:#2ecc71; color:white; padding: 4px 10px; height: 26px; }
.apm-template-btn-del { background:#e74c3c; color:white; padding: 0; width: 26px; height: 26px; display: flex; align-items: center; justify-content: center; }
.apm-fields-wrapper { padding: 0 4px; margin-bottom: 5px; }
.apm-checklist-box { background: rgba(26, 188, 156, 0.08); border: 1px solid rgba(26, 188, 156, 0.2); padding: 6px 8px; border-radius: 6px; margin-bottom: 10px; flex-wrap: wrap; }
.apm-checklist-title { width: 100%; font-size: 10px; color: #1abc9c; margin-bottom: 4px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; }
.apm-checklist-row { display: flex; gap: 8px; width: 100%; align-items: center; }
.apm-textarea-input { height: 54px; padding: 6px 8px; font-size: 11px; line-height: 1.3; resize: none; font-family: sans-serif; border: 1px solid transparent; transition: all 0.2s; }
.apm-ui-settings-toggles { display:flex; margin-bottom:10px; background:#22292f; border-radius:4px; overflow:hidden; }
.apm-ui-settings-btn { flex:1; text-align:center; padding:8px; cursor:pointer; font-size:12px; font-weight:bold; }
.apm-ui-settings-btn.active { background:#3498db; color:#fff; }
.apm-ui-settings-btn.inactive { background:transparent; color:#7f8c8d; }
.apm-ui-settings-list { background:#22292f; border:1px solid #45535e; border-radius:4px; padding:5px; min-height:60px; max-height: 45vh; overflow-y:auto; margin-bottom:10px; }

.apm-ui-settings-save { width:100%; background:#2ecc71; color:white; border:none; padding:12px; border-radius:6px; cursor:pointer; font-weight:bold; font-size:14px; }
.apm-ui-settings-reset { width:100%; background:#e74c3c; color:white; border:none; padding:8px; border-radius:6px; cursor:pointer; font-weight:bold; font-size:12px; margin-top:6px; display:none; }
.apm-cc-search-box { background: rgba(0,0,0,0.25); border: 1px solid #45535e; padding: 8px 10px; border-radius: 6px; margin-bottom: 8px; }
.apm-cc-search-row { display: flex; gap: 8px; margin-bottom: 8px; }
.apm-cc-options-row { display: flex; gap: 10px; align-items: center; margin-bottom: 8px; padding-left: 2px; }
.apm-cc-buttons-row { display: flex; gap: 8px; }
.apm-cc-theme-box { display:flex; gap: 8px; margin-bottom: 8px; align-items: center; }
.apm-cc-theme-item { flex: 1; display:flex; align-items:center; justify-content:space-between; background: rgba(0,0,0,0.2); padding: 6px 10px; border-radius: 6px; border: 1px solid #45535e; }
.apm-cc-theme-label { font-size: 11px; color: #b0bec5; font-weight: bold; }
.apm-cc-theme-select { padding: 4px; border-radius: 4px; background: #ecf0f1; border: none; font-size: 11px; cursor: pointer; font-weight: bold; color: #2c3e50; }
.apm-cc-rules-container { background:#22292f; border:1px solid #45535e; border-radius:4px; padding:5px; min-height:80px; max-height: 35vh; overflow-y:auto; margin-bottom:8px; }

.apm-cc-guide { display:none; font-size: 12px; color: #b0bec5; line-height: 1.5; background: #22292f; border-radius: 6px; padding: 12px; border: 1px solid #45535e; }
.apm-general-box { display:none; padding: 10px; background: #22292f; border-radius: 6px; border: 1px solid #45535e; }
.apm-general-item { display:flex; justify-content:space-between; align-items:center; margin-bottom: 15px; padding: 0 5px; }
.apm-general-title { font-weight: bold; font-size: 13px; color: #fff; }
.apm-general-desc { font-size: 11px; color: #95a5a6; }
.apm-help-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); z-index: 2147483647; display: none; align-items: center; justify-content: center; backdrop-filter: blur(2px); }
.apm-help-modal { background: #1e272e; width: 600px; max-width: 90%; max-height: 85vh; border-radius: 12px; border: 1px solid #34495e; box-shadow: 0 15px 40px rgba(0,0,0,0.5); display: flex; flex-direction: column; position: relative; overflow: hidden; }
.apm-help-header { padding: 15px 20px; background: #2c3e50; border-bottom: 1px solid #34495e; display: flex; justify-content: space-between; align-items: center; }
.apm-help-title { color: #3498db; margin: 0; font-size: 18px; font-weight: bold; }
.apm-help-close { background: transparent; border: none; color: #95a5a6; font-size: 20px; cursor: pointer; padding: 5px; line-height: 1; transition: color 0.2s; }
.apm-help-close:hover { color: #fff; }
.apm-help-content { padding: 25px; overflow-y: auto; color: #b0bec5; font-size: 14px; line-height: 1.6; }
.apm-help-section { margin-bottom: 25px; }
.apm-help-section-title { color: #3498db; font-size: 16px; font-weight: bold; margin-bottom: 10px; display: flex; align-items: center; gap: 8px; }
.apm-help-section b { color: #ecf0f1; }
.apm-help-content ul { padding-left: 20px; margin: 10px 0; }
.apm-help-content li { margin-bottom: 8px; }
.apm-help-content kbd { background: #34495e; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 12px; color: #3498db; border: 1px solid #4a627a; }
.apm-footer { margin-top: 10px; text-align: center; display: flex; flex-direction: column; gap: 8px; }
.apm-footer-help-btn { cursor: pointer; color: #3498db; font-size: 11px; text-decoration: underline; font-weight: bold; }
.apm-footer-help-btn-box { background: #4a5a6a; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 11px; font-weight: bold; transition: background 0.2s; box-shadow: 0 1px 3px rgba(0,0,0,0.2); }
.apm-footer-help-btn-box:hover { background: #5c6d7e; }
.cc-footer-btn { background: #34495e; color: #b0bec5; border: 1px solid #4a5a6a; border-radius: 4px; padding: 5px 10px; cursor: pointer; font-size: 11px; font-weight: bold; transition: all 0.2s; }
.cc-footer-btn:hover { background: #4a5a6a; color: white; border-color: #5c6d7e; box-shadow: 0 1px 3px rgba(0,0,0,0.2); }
.apm-footer-update-btn { display:inline-block; background:#f39c12; color:white; padding:6px 12px; border-radius:4px; font-weight:bold; text-decoration:none; font-size:11px; transition: background 0.2s; box-shadow: 0 2px 5px rgba(0,0,0,0.2); }
.apm-footer-version { font-size: 10px; color: #505f6e; opacity: 0.7; }

.apm-qs-container { position: fixed; top: 3px; left: 110px; z-index: 20; display: flex; align-items: center; gap: 8px; background: transparent; padding: 0 10px; height: 42px; }
.apm-qs-label { color: #d1d1d1; font-family: sans-serif; font-weight: bold; font-size: 13px; cursor: default; user-select: none; margin-right: 2px; }
.apm-qs-input { width: 140px; font-family: monospace; font-weight: bold; height: 24px; padding: 0 6px; box-sizing: border-box; outline: none; background: #ffffff; color: #1e272e; border: 1px solid #bdc3c7; border-radius: 3px; }
.apm-qs-btn { cursor: pointer; display: flex; align-items: center; justify-content: center; padding: 0 8px; height: 24px; border-radius: 3px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: #d1d1d1; }
.apm-qs-status { color: #d1d1d1; font-family: sans-serif; font-size: 11px; opacity: 0.7; width: 80px; margin-left: 5px; white-space: nowrap; user-select: none; }
.eam-fc-date-header { display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:5px; }
.eam-fc-date-label { font-size:12px; color:#b0bec5; font-weight:bold; }
.eam-fc-date-toggle { background:transparent; color:#3498db; border:none; cursor:pointer; font-size:11px; text-decoration:underline; padding:0; }
.eam-fc-week-row { display:flex; gap:15px; align-items:center; margin-bottom:10px; }
.eam-fc-days-box { background:#2b343c; padding:10px; border-radius:6px; margin-bottom:15px; font-size:13px; display:flex; justify-content:space-between; align-items:center; }
.eam-fc-custom-dates { display:none; background:#2b343c; padding:10px; border-radius:6px; margin-bottom:15px; gap:10px; flex-direction:column; }
.eam-fc-custom-row { display:flex; align-items:center; justify-content:space-between; gap:10px; }
.eam-fc-date-input { flex-grow:1; padding:6px; border-radius:4px; border:none; background:#ecf0f1; color:#2c3e50; font-weight:bold; font-family:monospace; font-size:12px; cursor:pointer; }
.eam-fc-assigned-box { display:none; gap:10px; margin-bottom:10px; align-items:center; }
.eam-fc-input-text { flex-grow:1; padding:6px; border-radius:4px; border:none; background:#ecf0f1; color:#2c3e50; text-transform:uppercase; }
.eam-fc-shift-text { width:60px; padding:6px; border-radius:4px; border:none; background:#ecf0f1; color:#2c3e50; text-transform:uppercase; }
.eam-fc-desc-box { display:flex; gap:10px; margin-bottom:20px; align-items:center; }
.eam-fc-desc-input { flex-grow:1; padding:6px; border-radius:4px; border:none; background:#ecf0f1; color:#2c3e50; }
.eam-fc-run-box { display:flex; justify-content:space-between; gap:15px; }
.eam-fc-btn-run { background:#1abc9c; color:white; border:none; padding:10px; border-radius:6px; cursor:pointer; font-weight:bold; flex: 1; font-size:14px; transition: background 0.2s; }
.eam-fc-today-box { display:flex; align-items:center; background: rgba(52, 152, 219, 0.15); border: 1px solid rgba(52, 152, 219, 0.4); border-radius:6px; padding: 4px 6px; gap:8px; flex: 0 0 auto; }
.eam-fc-today-lbl { display:flex; align-items:center; gap:6px; cursor:pointer; margin:0; }
.eam-fc-today-txt { color:#3498db; font-size:11px; font-weight:bold; white-space:nowrap; user-select:none; margin-top:1px; width:105px; display:inline-block; text-align:left; }
.eam-fc-btn-today { background:#3498db; color:white; border:none; padding:8px 12px; border-radius:4px; cursor:pointer; font-weight:bold; font-size:14px; transition: background 0.2s; }
.eam-fc-footer { display:flex; justify-content:space-between; align-items:center; font-size:11.5px; color:#95a5a6; margin-top:15px; border-top: 1px solid #4a5a6a; padding-top:10px; }
.eam-fc-help-link { background:transparent; color:#3498db; border:none; padding: 0; cursor: pointer; font-size: 11.5px; text-decoration: underline; }
.eam-fc-guide-box { display:none; max-height: 60vh; overflow-y: auto; padding-right: 6px; }

.eam-fc-guide-text { font-size: 12px; color: #bdc3c7; line-height: 1.4; margin-bottom: 10px; }
.eam-fc-guide-hdr { color: #1abc9c; margin: 10px 0 5px 0; font-size: 13px; }
.eam-fc-guide-list { margin: 0 0 10px 0; padding-left: 20px; font-size: 12px; color: #bdc3c7; line-height: 1.4; }
.eam-fc-guide-back { text-align:left; margin-top: 10px; border-top: 1px solid #4a5a6a; padding-top:10px; }
.eam-fc-status { margin-top:5px; font-size:12px; text-align:center; color:#b0bec5; font-weight:bold; }
.eam-fc-update-box { display:none; margin-top: 10px; text-align: center; }

/* =========================
 * Labor Tracker UI
 * ========================= */
.apm-labor-trigger { position: fixed; background: #3498db; color: white; padding: 10px; cursor: pointer; font-weight: bold; font-size: 12px; z-index: 2147483647; box-shadow: 0 0 10px rgba(0,0,0,0.5); transition: background 0.2s; user-select: none; display: flex; align-items: center; justify-content: center; white-space: nowrap; }
.apm-labor-trigger:hover { background: #2980b9; }
.apm-labor-panel { position: fixed; width: min(280px, 80vw); background: #35404a; border: 1px solid #4a5a6a; border-radius: 8px; padding: 15px; z-index: 2147483646; transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1); display: flex; flex-direction: column; box-shadow: 0 0 20px rgba(0,0,0,0.6); }

.labor-tabs { display: flex; gap: 2px; background: #2b343c; border-radius: 4px; overflow: hidden; margin-bottom: 15px; }
.labor-tab { flex: 1; padding: 8px; text-align: center; font-size: 11px; cursor: pointer; color: #b0bec5; font-weight: bold; transition: 0.2s; user-select: none; }
.labor-tab.active { background: #3498db; color: white; }
.labor-total { font-size: 32px; font-weight: bold; text-align: center; margin: 10px 0; color: #ecf0f1; }
.labor-row { display: flex; justify-content: space-between; padding: 6px 10px; border-bottom: 1px solid #4a5a6a; font-size: 12px; color: #bdc3c7; }
.apm-labor-header { display:flex; justify-content:space-between; align-items:center; margin-bottom: 8px; }
.apm-labor-target-lbl { font-size:11px; color:#bdc3c7; font-weight:bold; }
.apm-labor-mgr-toggle { background:transparent; color:#3498db; border:none; padding:0; cursor:pointer; font-size:10px; text-decoration:underline; }
.apm-labor-mgr-panel { display:none; background:#2b343c; padding:8px; border-radius:4px; margin-bottom:10px; gap:6px; flex-direction:column; }
.apm-labor-mgr-row { display:flex; gap:6px; }
.apm-labor-emp-select { flex-grow:1; padding:4px; border-radius:3px; border:none; background:#ecf0f1; color:#2c3e50; font-size:11px; font-weight:bold; cursor:pointer; text-transform:uppercase; }
.apm-labor-btn-add { background:#3498db; color:white; border:none; padding:4px 8px; border-radius:3px; cursor:pointer; font-weight:bold; }
.apm-labor-btn-rem { background:#e74c3c; color:white; border:none; padding:4px 8px; border-radius:3px; cursor:pointer; font-weight:bold; }
.apm-labor-breakdown-box { max-height: 200px; overflow-y: auto; }
.apm-labor-force-refresh { margin-top:15px; background:#4a5a6a; color:white; border:none; padding:8px; border-radius:4px; cursor:pointer; font-size:11px; transition: background 0.2s; }
.apm-labor-force-refresh:hover { background: #5c6d7e; }

#apm-creator-panel select, #apm-creator-panel input, #apm-creator-panel textarea { outline: none !important; box-sizing: border-box; }
.creator-btn { cursor: pointer; transition: background 0.2s; font-weight: bold; border-radius: 4px; border: none; padding: 6px 12px; font-size: 12px; }
.field-row { display: flex; gap: 10px; margin-bottom: 10px; align-items: center; min-width: 0; }
.field-label { font-size: 12px; color: #b0bec5; white-space: nowrap; width: 100px; text-align: right; }
.field-input { flex-grow: 1; padding: 6px; border-radius: 4px; border: 1px solid transparent; background: #ecf0f1; color: #2c3e50; min-width: 0; width: 100%; box-sizing: border-box; transition: all 0.2s ease-in-out; }
.field-input.upper { text-transform: uppercase; }
#apm-creator-panel .field-input:focus { border-color: #3498db !important; background: #ffffff !important; box-shadow: 0 0 5px rgba(52, 152, 219, 0.4) !important; }
.apm-tab-btn { flex: 1; padding: 10px; text-align: center; cursor: pointer; font-weight: bold; transition: all 0.2s; border-bottom: 3px solid transparent; }
.apm-tab-active-autofill { color: #3498db; border-bottom: 3px solid #3498db; background: rgba(52, 152, 219, 0.05); }
.apm-tab-inactive { color: #7f8c8d; }
.apm-tab-inactive:hover { color: #bdc3c7; background: rgba(255,255,255,0.02); }
.apm-col-item { padding: 8px; margin-bottom: 4px; background: #34495e; color: white; border-radius: 4px; cursor: grab; font-size: 12px; display: flex; justify-content: space-between; align-items: center; border: 1px solid #2c3e50; user-select: none; }
.apm-col-item:active { cursor: grabbing; }
.apm-col-item.dragging { opacity: 0.5; background: #f39c12; border-color: #e67e22; }
#apm-global-toast { position: fixed; top: 15px; left: 50%; transform: translateX(-50%); z-index: 9999999; padding: 8px 20px; border-radius: 30px; font-weight: bold; font-family: sans-serif; font-size: 13px; color: white; opacity: 0; pointer-events: none; transition: opacity 0.3s ease; box-shadow: 0px 4px 15px rgba(0,0,0,0.4); display: none; }

/* Filter Buttons & Extras */
.apm-filter-btn { position: absolute; left: 270px; top: 9px; z-index: 1000; padding: 4px 10px; color: white; border: none; border-radius: 4px; font-weight: bold; cursor: pointer; font-size: 11px; box-shadow: 0 1px 3px rgba(0,0,0,0.3); transition: background 0.2s; }

/* Input Placeholder Overrides */
#apm-settings-panel ::placeholder, #eam-forecast-panel ::placeholder, .apm-labor-panel ::placeholder { color: #888 !important; opacity: 1 !important; }
#apm-settings-panel :-ms-input-placeholder, #eam-forecast-panel :-ms-input-placeholder, .apm-labor-panel :-ms-input-placeholder { color: #888 !important; }
#apm-settings-panel ::-ms-input-placeholder, #eam-forecast-panel ::-ms-input-placeholder, .apm-labor-panel ::-ms-input-placeholder { color: #888 !important; }
`;
  function injectStaticStyles() {
    if (document.getElementById("apm-static-styles")) return;
    const style = document.createElement("style");
    style.id = "apm-static-styles";
    style.textContent = APM_STATIC_STYLES;
    document.head.appendChild(style);
  }

  // src/core/date-override.js
  function initDateOverride() {
    if (window.self !== window.top) return;
    const applyOverride = () => {
      if (typeof Ext !== "undefined" && Ext.form && Ext.form.field && Ext.form.field.Date) {
        if (!apmGeneralSettings.dateOverrideEnabled) return;
        const fmt = apmGeneralSettings.dateFormat === "eu" ? "d/m/Y" : "m/d/Y";
        Ext.override(Ext.form.field.Date, {
          format: fmt,
          altFormats: "m/d/Y|n/j/Y|n/j/y|m/j/y|n/d/y|m/j/Y|n/d/Y|m-d-y|m-d-Y|m/d|m-d|md|mdy|mdY|d|Y-m-d|n-j|n/j|d/m/Y|j/n/Y|j/n/y"
        });
        console.log("APM-Master: Date format override applied.");
      } else {
        setTimeout(applyOverride, 100);
      }
    };
    applyOverride();
  }

  // src/ui/conflict-notice.js
  function checkLegacyConflicts() {
    if (window.self !== window.top) return;
    const STORAGE_KEY2 = "apm_conflict_notice_shown";
    const isShown = localStorage.getItem(STORAGE_KEY2);
    if (isShown === "true") return;
    const isBetterApmDetected = !!document.getElementById("better-apm-styles") || !!document.querySelector(".better-apm-btn");
    if (isShown === "true" && !isBetterApmDetected) return;
    if (isBetterApmDetected && isShown === "true" && !localStorage.getItem("apm_better_apm_warned")) {
      localStorage.removeItem(STORAGE_KEY2);
    }
    setTimeout(() => {
      const title = isBetterApmDetected ? "\u26A0\uFE0F Conflict Detected: Better APM" : "\u{1F4E6} APM Suite Integration";
      const icon = isBetterApmDetected ? "\u{1F6AB}" : "\u26A1";
      const mainMsg = isBetterApmDetected ? "We've detected that 'Better APM' is also running. This tool is known to conflict with APM Master, causing UI elements to disappear or hotkeys to fail." : "I've integrated everything into this single script. To prevent any possible conflicts, please ensure you have disabled the older, standalone versions of:";
      const listContent = isBetterApmDetected ? [
        el("p", { style: { color: "#e74c3c", fontWeight: "bold", margin: "5px 0" } }, "\u2022 Better APM (Userscript)"),
        el("p", { style: { fontSize: "12px", marginTop: "10px" } }, "APM Master now includes its own self-healing mode to fight these conflicts, but disabling the other tool is recommended for full stability.")
      ] : [
        el("p", { style: { color: "#f1c40f", fontWeight: "bold", margin: "5px 0" } }, "\u2022 APM Master (Legacy Autofill)"),
        el("p", { style: { color: "#f1c40f", fontWeight: "bold", margin: "5px 0" } }, "\u2022 ColorCode & Nametags")
      ];
      const overlay = el("div", {
        id: "apm-conflict-overlay",
        className: "apm-help-overlay",
        style: { display: "flex", justifyContent: "center", alignItems: "center", zIndex: "2147483647" }
      }, [
        el("div", {
          className: "apm-help-modal",
          style: { maxWidth: "450px", height: "auto", maxHeight: "80vh", padding: "25px", textAlign: "center" }
        }, [
          el("div", { style: { marginBottom: "20px" } }, [
            el("h3", { style: { color: isBetterApmDetected ? "#e74c3c" : "#3498db", margin: "0 0 10px 0", fontSize: "20px" } }, title),
            el("div", {
              style: {
                width: "60px",
                height: "60px",
                background: "rgba(52, 152, 219, 0.1)",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "15px auto"
              }
            }, [el("span", { style: { fontSize: "30px" } }, icon)])
          ]),
          el("div", { className: "apm-help-content", style: { padding: "0", fontSize: "14px", lineHeight: "1.6", color: "#ecf0f1" } }, [
            el("p", {}, mainMsg),
            el("div", { style: { margin: "15px 0", padding: "10px", background: "rgba(0,0,0,0.2)", borderRadius: "8px" } }, listContent),
            !isBetterApmDetected ? el("p", {}, "running in your browser extension (e.g. Tampermonkey).") : null,
            el("p", { style: { fontSize: "12px", opacity: "0.7", marginTop: "15px" } }, "Having multiple APM tools active at once can cause UI glitches or slower performance.")
          ]),
          el("div", { style: { marginTop: "30px" } }, [
            el("button", {
              className: "apm-tab-btn apm-tab-active-autofill",
              style: { width: "100%", padding: "12px", borderRadius: "8px", cursor: "pointer", fontWeight: "bold", border: "none" },
              onclick: () => {
                localStorage.setItem(STORAGE_KEY2, "true");
                if (isBetterApmDetected) localStorage.setItem("apm_better_apm_warned", "true");
                overlay.remove();
              }
            }, "Got it, I'll check my settings!")
          ])
        ])
      ]);
      document.body.appendChild(overlay);
    }, 1500);
  }

  // src/boot.js
  function monitorSessionStatus() {
    if (window.self !== window.top) return;
    if (!apmGeneralSettings.autoRedirect) return;
    let timeoutDetected = false;
    const allDocs = [document];
    document.querySelectorAll("iframe").forEach((f) => {
      try {
        if (f.contentDocument) allDocs.push(f.contentDocument);
      } catch (e) {
      }
    });
    for (const doc of allDocs) {
      if (timeoutDetected) break;
      const msgBoxes = doc.querySelectorAll(".x-window-text, .x-message-box-info, .x-component-default");
      for (const box of msgBoxes) {
        const text = box.textContent || "";
        if (text.includes("Session") && (text.includes("expired") || text.includes("timeout") || text.includes("invalid"))) {
          timeoutDetected = true;
          break;
        }
      }
    }
    if (!timeoutDetected) {
      const url = window.location.href;
      if (url.includes("logindisp") && !url.includes("tenant=") || url.includes("octave.com")) {
        timeoutDetected = true;
      }
    }
    if (timeoutDetected) {
      console.log("[APM Master] Session timeout detected. Auto-redirecting...");
      window.location.replace(SESSION_TIMEOUT_URL);
    }
  }
  function initBootSequence() {
    if (window.self === window.top) {
      initializeGeneralSettings();
      loadPresets();
      loadColorCodePrefs();
    }
    setTimeout(() => {
      if (window.self === window.top) {
        injectStaticStyles();
        initDateOverride();
        checkLegacyConflicts();
        buildForecastUI();
        buildSearchUI();
        initForecastShortcuts();
        if (typeof ForecastFilter !== "undefined" && ForecastFilter.init) ForecastFilter.init();
        if (typeof LaborTracker !== "undefined" && LaborTracker.init) LaborTracker.init();
        buildSettingsPanel();
        setupColorCodeLogic();
        injectToggleBtnNatively();
        checkPtpStatus();
        const bindConsistencyListeners = () => {
          const wins = getExtWindows();
          for (const win of wins) {
            try {
              if (win.Ext && win.Ext.Ajax && !win.__apmAjaxInterceptor) {
                win.Ext.Ajax.on("requestexception", (conn, response) => {
                  if (response && response.status === 401 && apmGeneralSettings.autoRedirect) {
                    console.log("[APM Master] Instant timeout detected (401). Auto-redirecting...");
                    window.top.location.replace(SESSION_TIMEOUT_URL);
                  }
                });
                win.__apmAjaxInterceptor = true;
              }
              if (!win.Ext || !win.Ext.ComponentQuery || win.__apmConsistencyBound) continue;
              win.Ext.ComponentQuery.query("tabpanel, uxtabpanel").forEach((tp) => {
                if (!tp.__apmDefaultsCaptured && !tp.isDestroyed) {
                  const isMainPanel = tp.items && tp.items.items && tp.items.items.some(
                    (t) => /Activities|Checklist|Comments/.test(t.title || t.text || "")
                  );
                  if (isMainPanel && !window._apmSystemDefaultTabOrder) {
                    window._apmSystemDefaultTabOrder = tp.items.items.filter((t) => !t.isDestroyed).map((t) => (t.title || t.text || "").replace(/<[^>]*>?/gm, "").trim()).filter((n) => n && n !== "&#160;");
                  }
                  tp.__apmDefaultsCaptured = true;
                }
                if (!tp.__apmConsistencyListener && !tp.isDestroyed) {
                  const trigger = () => {
                    console.log(`[APM Consistency] Triggered for ${tp.id}`);
                    setTimeout(applyTabConsistency, 10);
                  };
                  tp.on("tabchange", trigger);
                  tp.on("add", trigger);
                  tp.on("afterlayout", trigger);
                  tp.on("activate", trigger);
                  tp.__apmConsistencyListener = true;
                  trigger();
                }
              });
              win.Ext.ComponentQuery.query("gridpanel").forEach((grid) => {
                if (!grid.__apmConsistencyListener && !grid.isDestroyed && grid.headerCt) {
                  grid.headerCt.on("columnmove", () => setTimeout(applyGridConsistency, 50));
                  grid.__apmConsistencyListener = true;
                  setTimeout(applyGridConsistency, 50);
                }
              });
              win.__apmConsistencyBound = true;
            } catch (e) {
            }
          }
        };
        window.top.bindConsistencyListeners = bindConsistencyListeners;
        bindConsistencyListeners();
        APMScheduler.registerTask("consistency-bind", 1e4, bindConsistencyListeners);
        APMScheduler.registerTask("autofill-triggers", 2e3, () => {
          injectAutoFillTriggers();
        });
        APMScheduler.registerTask("session-monitor", 5e3, () => {
          monitorSessionStatus();
        });
        APMScheduler.registerTask("ui-persistence", 3e3, () => {
          if (window.self !== window.top) return;
          if (!document.getElementById("apm-settings-panel")) {
            console.log("[APM Master] Settings panel missing, re-injecting...");
            buildSettingsPanel();
          }
          if (!document.getElementById("eam-forecast-panel")) {
            console.log("[APM Master] Forecast panel missing, re-injecting...");
            buildForecastUI();
          }
          if (!document.getElementById("apm-quick-search-container")) {
            console.log("[APM Master] Quick Search missing, re-injecting...");
            buildSearchUI();
          }
          initForecastShortcuts();
        });
      }
    }, 300);
  }

  // src/modules/ptp/ptp-sandbox.js
  var STYLE_ID = "apm-ptp-dark-patch";
  var DARK_THEMES = /* @__PURE__ */ new Set(["theme-hex-dark", "theme-dark", "theme-darkblue", "theme-orange", "dark"]);
  var currentMemTheme = "default";
  var AWSUI_DARK_CSS = `
    /* === Theme tokens === */
    #root {
      --bg: #1e1e1e;
      --bg-2: #2d2d2d;
      --bg-3: #3d3d3d;
      --fg: #ffffff;
      --fg-muted: #cccccc;
      --border: #555555;
      --primary: #0073bb;
      --link: #66b3ff;
      --link-visited: #9999ff;
      --link-hover: #99ccff;
      --tickmark: #5cd5d7;

      /* Fix for Cloudscape container header forcing white */
      --color-background-container-header-clzg6q: var(--bg-3) !important;
      --color-background-status-warning-03nxlw: var(--bg-3) !important;
      --color-border-status-warning-3feumr: var(--border) !important;
    }

    /* === App chrome === */
    #root,
    #root main {
      background-color: var(--bg) !important;
      color: var(--fg) !important;
    }

    /* Cloudscape header bars (safe, hash-proof selectors) */
    #root [class^="awsui_header_"],
    #root [class^="awsui_root_"][class*="awsui_variant-default_"],
    #root [class^="awsui_root_"][class*="awsui_variant-stacked_"] {
      background-color: var(--bg-3) !important;
      color: var(--fg) !important;
      border-color: var(--border) !important;
    }

    /* === Cloudscape table headers (normal + sticky clones) === */
    #root [class*="awsui_header-secondary_"],
    #root [class*="awsui_header-secondary_"]::before,
    #root [class*="awsui_header-sticky-enabled_"] {
      background-color: var(--bg-3) !important;
      color: var(--fg) !important;
      border-color: var(--border) !important;
    }
    #root th[class*="awsui_header-cell_"],
    #root th[class*="awsui_header-cell_"] > *,
    #root [class*="awsui_header-cell-content_"],
    #root [class*="awsui_header-cell-text_"],
    #root [class*="awsui_thead-active_"] {
      background-color: var(--bg-3) !important;
      color: var(--fg) !important;
      border-color: var(--border) !important;
    }
    /* Sort icons / resize handles / column dividers */
    #root [class*="awsui_sorting-icon_"],
    #root [class*="awsui_sorting-icon_"] *,
    #root [class*="awsui_resizable-box-handle_"],
    #root [class*="awsui_resize-divider_"],
    #root [class*="awsui_divider_"] {
      color: var(--fg) !important;
      fill: currentColor !important;
      stroke: currentColor !important;
      background-color: var(--border) !important; /* divider track */
      border-color: var(--border) !important;
    }
    
    /* Info \u201Ci\u201D icons */
    #root [data-link="true"] .awsui_icon_h11ix_1mfw9_189 svg circle,
    #root [class*="awsui_trigger_"] .awsui_icon_h11ix_1mfw9_189 svg circle {
      fill: #263333 !important;
      stroke: var(--tickmark) !important;
    }

    #root [data-link="true"] .awsui_icon_h11ix_1mfw9_189 svg path,
    #root [class*="awsui_trigger_"] .awsui_icon_h11ix_1mfw9_189 svg path {
      stroke: var(--tickmark) !important;
    }    
    
    /* Sticky scrollbar under wide tables */
    #root [class*="awsui_sticky-scrollbar_"],
    #root [class*="awsui_sticky-scrollbar-content_"] {
      background-color: var(--bg-3) !important;
    }

    /* Some tables render an extra header container */
    #root [class^="awsui_table-header_"],
    #root [class*="awsui_sticky-header_"] {
      background-color: var(--bg-3) !important;
      color: var(--fg) !important;
      border-color: var(--border) !important;
    }

    #root [class^="awsui_header_"]:not(#\\9) {
      background-color: var(--bg-3) !important;
      color: var(--fg) !important;
    }

    /* Titles & item counters inside headers */
    #root [class^="awsui_title_"],
    #root [class^="awsui_counter_"] {
      color: var(--fg) !important;
    }

    /* Make everything inside those headers inherit readable colors */
    #root [class^="awsui_header_"] *,
    #root [class^="awsui_root_"][class*="awsui_variant-"] * {
      color: var(--fg) !important;
      fill: currentColor !important;
      stroke: currentColor !important;
    }

    /* If a sticky table header container is present, darken it too */
    #root [data-awsui-table-sticky-header="true"],
    #root [data-awsui-table-sticky-header="true"] * {
      background-color: var(--bg-3) !important;
      color: var(--fg) !important;
    }

    /* Some themes paint via ::before/::after \u2014 neutralize them */
    #root [class^="awsui_header_"]::before,
    #root [class^="awsui_header_"]::after {
      background-color: var(--bg-3) !important;
    }

    #root .awsui-context-alert [class^="awsui_alert_"],
    #root [class^="awsui_alert_"],
    #root [class*="awsui_type-warning_"],
    #root [class*="awsui_type-info_"],
    #root [class*="awsui_type-success_"],
    #root [class*="awsui_type-error_"] {
      background-color: var(--bg-3) !important;
      color: var(--fg) !important;
      border: 1px solid var(--border) !important;
    }

    #root [class^="awsui_alert_"] a { color: var(--link) !important; }
    #root [class^="awsui_alert_"] svg * {
      stroke: currentColor !important;
      fill: currentColor !important;
    }

    /* === Checkboxes (avoid black-on-black boxes) === */
    /* Undo global fill for rect/circle so boxes aren't painted solid */
    #root svg rect,
    #root svg circle { fill: none !important; }

    #root [class*="awsui_checkbox-control_"] svg rect {
      fill: var(--bg-2) !important;   /* box background */
      stroke: var(--fg) !important;   /* box outline */
    }

    /* Checked checkbox accent (tick) color */
    #root [class*="awsui_checkbox-control_"]:has(input:checked) {
      color: var(--tickmark) !important; /* drives the check mark */
    }

    /* make sure the SVG tick inherits it */
    #root [class*="awsui_checkbox-control_"]:has(input:checked) svg * {
      fill: currentColor !important;
      stroke: currentColor !important;
    }

    /* === Inline "Question" headings === */
    #root [style*="color: rgb(102, 102, 102)"][style*="font-weight: bold"] {
      color: var(--fg) !important;
    }

    /* === Dynamically inserted question cards (aliceblue) === */
    #root [id^="question-"][style*="background-color: rgb(240, 248, 255)"] {
      background-color: var(--bg-2) !important;
      border-color: var(--primary) !important;
      color: var(--fg) !important;
    }
    #root [id^="question-"] [style*="font-weight: bold"][style*="color: rgb(0, 115, 187)"] {
      color: var(--fg) !important;
    }

    /* === Radios: use same accent as checkboxes === */

    /* Checked state \u2014 hash-proof + robust */
    #root [role="radiogroup"] [class*="awsui_radio-control_"]:has(input:checked) {
      color: var(--tickmark) !important; /* drives the filled dot via currentColor */
    }
    #root [role="radiogroup"] [class*="awsui_radio-control_"]:has(input:checked) svg * {
      fill: currentColor !important;
      stroke: currentColor !important;
    }

    /* Fallbacks (when :has isn\u2019t available) */
    #root [role="radiogroup"] [class*="awsui_radio-control_"][aria-checked="true"] svg *,
    #root [role="radiogroup"] [class*="styled-circle-checked_"] {
      fill: var(--tickmark) !important;
      stroke: var(--tickmark) !important;
    }

    /* Unchecked radios - visible ring on dark bg */
    #root [role="radiogroup"] [class*="awsui_radio-control_"] svg [class*="styled-circle-border_"] {
      stroke: var(--fg-muted) !important;
    }
    #root [role="radiogroup"] [class*="awsui_radio-control_"] svg [class*="styled-circle-fill_"]:not([class*="checked_"]) {
      fill: transparent !important;
      stroke: transparent !important;
    }

    /* === Sticky breadcrumb bar with inline white background === */

    #root div[style*="position: sticky"][style*="background-color: white"] {
      background-color: var(--bg-2) !important;
      border-bottom-color: var(--border) !important;
    }

    #root div[style*="position: sticky"]:has(> nav[class*="awsui_breadcrumb-group_"]) {
      background-color: var(--bg-2) !important;
      border-bottom-color: var(--border) !important;
    }

    #root header,
    #root nav {
      background-color: var(--bg-2) !important;
    }

    /* Left navigation (open state) */
    #root nav[aria-hidden="false"] {
      background-color: var(--bg-2) !important;
    }

    /* Top-nav utilities */
    #root [data-utility-special="search"] a[role="button"],
    #root [data-utility-special="menu-trigger"] button {
      color: var(--fg) !important;
    }

    /* Version links in the header */
    #root header a[href="#version"],
    #root nav a[href="#version"] {
      color: var(--fg) !important;
    }

    /* === Links (content area) === */
    #root a { color: var(--link) !important; }
    #root a:visited { color: var(--link-visited) !important; }
    #root a:hover { color: var(--link-hover) !important; }

    /* === Section cards (e.g., "Table", "Legacy Assessments") === */
    #root [data-selection-root="true"] > :first-child {
      background-color: var(--bg-2) !important;
      border-radius: 15px 15px 0 0 !important;
      padding-bottom: 60px !important; /* matches your header padding tweak */
    }
    #root [data-selection-root="true"] > :last-child {
      background-color: var(--bg-2) !important;
      border-radius: 0 0 15px 15px !important;
    }

    /* Headings */
    #root [data-selection-root="true"] h2 {
      color: var(--fg) !important;
    }

    /* Header control clusters inside section headers */
    #root [data-selection-root="true"] [aria-label="Preferences"],
    #root [data-selection-root="true"] [aria-label="Preferences"] button,
    #root [data-selection-root="true"] [data-awsui-section="controls"],
    #root [data-selection-root="true"] [role="group"] {
      border-radius: 15px !important;
    }

    /* === Tables === */
    #root [role="table"] {
      background-color: var(--bg-2) !important;
      color: var(--fg) !important;
      border-color: var(--border) !important;
    }
    #root [role="table"] thead th {
      background-color: var(--bg-3) !important;
      color: var(--fg) !important;
      border-color: var(--border) !important;
    }
    #root [role="table"] tbody td {
      color: var(--fg) !important;
      border-color: var(--border) !important;
    }

    /* Empty state rows/containers inside tables (fallback) */
    #root [role="table"] [aria-live],
    #root [role="table"] [role="status"] {
      background-color: var(--bg-2) !important;
      color: var(--fg-muted) !important;
    }

    /* Sticky header bars in table/section UIs */
    #root [aria-labelledby^="heading:"] {
      background-color: var(--bg-2) !important;
    }

    /* === Filters & inputs === */
    #root input[type="search"],
    #root input[aria-label^="Filter" i],
    #root [role="search"] input {
      background-color: var(--bg-3) !important;
      color: var(--fg) !important;
      border-color: var(--border) !important;
    }

    /* === Buttons (default + primary) === */
    #root button,
    #root [role="button"] {
      background-color: var(--bg-3) !important;
      color: var(--fg) !important;
      border: 1px solid var(--border) !important;
    }
    /* Primary action (Create Assessment) */
    #root button[type="submit"] {
      background-color: var(--primary) !important;
    }

    /* Pagination states */
    #root button[aria-current="true"] {
      background-color: var(--bg-3) !important;
      color: var(--fg) !important;
    }

    /* === Icons (inherit text color) === */
    #root svg path,
    #root svg circle,
    #root svg rect,
    #root svg line,
    #root svg polyline {
      stroke: currentColor !important;
      fill: currentColor !important;
    }

    /* Make nav/header items white even with global link colors */
    #root header, #root nav { color: var(--fg) !important; }

    /* === Flash/alerts === */
    #root [role="alert"],
    #root [aria-live="polite"],
    #root [aria-live="assertive"] {
      background-color: var(--bg-3) !important;
      border: 1px solid var(--border) !important;
      color: var(--fg) !important;
    }
    #root [role="alert"] .message,
    #root [role="alert"] .header,
    #root [role="alert"] .content {
      color: var(--fg) !important;
    }
    #root [role="alert"] .content,
    #root [role="status"] { color: var(--fg-muted) !important; }

    /* === Dialogs/Modals === */
    #root [role="dialog"] {
      background-color: var(--bg-2) !important;
      color: var(--fg) !important;
    }
    #root [role="dialog"] header,
    #root [role="dialog"] [data-part="header"] {
      background-color: var(--bg-3) !important;
      color: var(--fg) !important;
    }
    #root [role="dialog"] footer,
    #root [role="dialog"] [data-part="footer"] {
      background-color: var(--bg-3) !important;
    }

    /* === Labels / descriptions === */
    #root label,
    #root [id*="label" i] { color: var(--fg) !important; }
    #root [id*="description" i],
    #root [aria-describedby],
    #root small,
    #root .helptext {
      color: var(--fg-muted) !important;
    }

    /* Rich HTML blobs rendered with data-html */
    #root [data-html="true"] span {
      color: var(--fg) !important;
    }

    /* === Toggles / sliders / listbox-like options === */
    #root [role="switch"] {
      background-color: var(--border) !important;
    }
    #root [role="switch"][aria-checked="true"] {
      background-color: var(--primary) !important;
    }

    #root [role="slider"] {
      background-color: var(--bg-2) !important;
    }
    #root [role="listbox"] {
      background-color: var(--bg-2) !important;
    }
    #root [role="option"] {
      background-color: var(--bg-3) !important;
      border: 1px solid var(--border) !important;
      color: var(--fg) !important;
    }

    /* === Generic text elements === */
    #root b, #root p { color: var(--fg) !important; }

    /* Keep header/nav links white even with global link colors */
    #root header a, #root nav a { color: var(--fg) !important; }
`;
  function applyPtpCss(on) {
    let existing = document.getElementById(STYLE_ID);
    if (on) {
      if (!existing) {
        existing = document.createElement("style");
        existing.id = STYLE_ID;
        existing.textContent = AWSUI_DARK_CSS;
        console.log("%c[APM Master] PTP: Injecting Dark Theme Patch NOW", "background: #212224; color: #1abc9c; font-weight: bold; padding: 4px;");
      }
      (document.head || document.documentElement).appendChild(existing);
    } else if (existing) {
      existing.remove();
      console.log("[APM Master] PTP: Removing Dark Theme Patch");
    }
  }
  function initPtpSandbox() {
    const isPTP2 = /amazon\.dev|insights/i.test(window.location.hostname);
    if (!isPTP2) return;
    console.log("[APM Master] PTP Sandbox detected on:", window.location.hostname);
    let completionFired = false;
    const triggerCompletion = (woNumber) => {
      if (completionFired || !woNumber) return;
      console.log(`[APM Master] PTP Sandbox: \u2705 Assessment completed via API for WO ${woNumber}. Broadcasting...`);
      window.top.postMessage({ type: "APM_PTP_COMPLETED", wo: woNumber }, "*");
      completionFired = true;
    };
    const triggerStart = () => {
      console.log(`[APM Master] PTP Sandbox: \u23F3 Assessment meta loaded. Broadcasting start...`);
      window.top.postMessage({ type: "APM_PTP_START" }, "*");
    };
    const triggerCancel = () => {
      console.log(`[APM Master] PTP Sandbox: \u{1F6AB} Assessment cancelled. Broadcasting stop...`);
      window.top.postMessage({ type: "APM_PTP_CANCELLED" }, "*");
    };
    const handleAssessmentResponse = (url, text, status, requestBody) => {
      try {
        if (url.includes("create_assessment") && status === 200) {
          triggerStart();
          return;
        }
        if (!text || !text.includes("100")) return;
        const res = JSON.parse(text);
        if (res?.body?.assessment?.AssessmentStatus === "INCOMPLETE") {
          triggerStart();
        } else if (res?.body?.response?.workorder_id) {
          if (res.body.response.final_status === "COMPLETE") {
            triggerCompletion(res.body.response.workorder_id);
          } else if (res.body.response.final_status === "CANCELLED") {
            triggerCancel();
          }
        } else if (res?.body?.assessment?.AssessmentStatus) {
          if (res.body.assessment.AssessmentStatus === "COMPLETE") {
            const match = url.match(/workOrderId=(\d+)/i);
            if (match && match[1]) triggerCompletion(match[1]);
          } else if (res.body.assessment.AssessmentStatus === "CANCELLED") {
            triggerCancel();
          }
        } else if (url.includes("get_revisions") && res?.body?.revisions) {
          const inactiveRev = res.body.revisions.find((r) => r.status === "inactive");
          if (inactiveRev) triggerCancel();
        } else if (url.includes("submit_assessment")) {
          if (text.includes("OMPLETE")) {
            if (requestBody && typeof requestBody === "string") {
              try {
                const req = JSON.parse(requestBody);
                if (req?.workorder_id) triggerCompletion(req.workorder_id);
              } catch (e) {
              }
            }
          } else if (text.includes("CANCELLED")) {
            triggerCancel();
          }
        }
      } catch (e) {
      }
    };
    const origOpen = XMLHttpRequest.prototype.open;
    const origSend = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.open = function(method, url) {
      this._apmUrl = (url || "").toString();
      return origOpen.apply(this, arguments);
    };
    XMLHttpRequest.prototype.send = function(body) {
      if (this._apmUrl && (this._apmUrl.includes("submit_assessment") || this._apmUrl.includes("get_assessment") || this._apmUrl.includes("create_assessment"))) {
        this.addEventListener("load", function() {
          handleAssessmentResponse(this._apmUrl, this.responseText, this.status, body);
        });
      }
      return origSend.apply(this, arguments);
    };
    const origFetch = window.fetch;
    window.fetch = async function(...args) {
      const response = await origFetch.apply(this, args);
      try {
        const url = args[0] instanceof Request ? args[0].url : typeof args[0] === "string" ? args[0] : "";
        if (url && (url.includes("submit_assessment") || url.includes("get_assessment") || url.includes("create_assessment") || url.includes("get_revisions"))) {
          const clone = response.clone();
          const text = await clone.text();
          const reqObj = args[0] instanceof Request ? args[0] : args[1] || {};
          handleAssessmentResponse(url, text, response.status, reqObj.body);
        }
      } catch (e) {
      }
      return response;
    };
    const start = () => {
      console.log("[APM Master] PTP Sandbox: Starting core logic");
      const checkVisibility = () => {
        if (!document.body) return;
        const hasPtpHeader = !!document.querySelector('.ptp-header, .permit-details, #ptp-main-content, [class*="awsui_root_"]');
        const hasWorkOrder = window.location.href.includes("workOrder");
        if (hasPtpHeader || hasWorkOrder) {
          window.top.postMessage({ type: "APM_PTP_HEARTBEAT", visible: true, url: window.location.href }, "*");
        }
      };
      setInterval(checkVisibility, 8e3);
      checkVisibility();
      window.addEventListener("mousedown", (e) => {
        window.top.postMessage({ type: "APM_PTP_CLICK_AWAY" }, "*");
      }, true);
      new MutationObserver(() => {
        if (!document.getElementById(STYLE_ID) && DARK_THEMES.has(currentMemTheme)) {
          applyPtpCss(true);
        }
      }).observe(document.head || document.documentElement, { childList: true });
    };
    window.addEventListener("message", (e) => {
      const d = e.data;
      if (!d) return;
      const isBetterApmMatch = d.__betterApm === "theme" || d.__betterApm === "setTheme";
      const isNativeMatch = d.type === "APM_SET_THEME" || d.apmMaster === "theme";
      if (isBetterApmMatch || isNativeMatch) {
        const newTheme = (d.value || d.theme || "default").toLowerCase();
        console.log(`%c[APM Master] PTP Sandbox: Theme Sync -> ${newTheme}`, "background: #212224; color: #1abc9c; padding: 2px;");
        try {
          localStorage.setItem(KEY_THEME, newTheme);
        } catch (err) {
        }
        currentMemTheme = newTheme;
        applyPtpCss(DARK_THEMES.has(currentMemTheme));
      }
    });
    if (document.readyState === "loading") {
      window.addEventListener("DOMContentLoaded", start);
    } else {
      start();
    }
    const requestTheme = () => {
      try {
        const local = localStorage.getItem(KEY_THEME);
        if (local && local !== currentMemTheme) {
          currentMemTheme = local;
          applyPtpCss(DARK_THEMES.has(currentMemTheme));
        }
      } catch (e) {
      }
      console.log("[APM Master] PTP Sandbox: Requesting Theme Handshake...");
      try {
        window.top.postMessage({ type: "APM_GET_THEME", apmMaster: "getTheme", __betterApm: "getTheme" }, "*");
      } catch (e) {
      }
    };
    requestTheme();
    setTimeout(requestTheme, 1500);
    setTimeout(requestTheme, 4e3);
  }

  // src/modules/colorcode/nametag-filter.js
  var activeNametagFilter = "";
  function forceFooterText(gridDom, count) {
    const walk = document.createTreeWalker(gridDom, NodeFilter.SHOW_TEXT, {
      acceptNode: function(node2) {
        return /Records:\s*\d+\s*of\s*\d+/.test(node2.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
      }
    }, false);
    let node;
    while (node = walk.nextNode()) node.nodeValue = `Records: ${count} of ${count}`;
  }
  function applyNametagFilter(kw) {
    const ctx = findMainGrid();
    if (!ctx) return;
    const store = ctx.grid.getStore();
    const gridDom = ctx.grid.getEl().dom;
    const view = ctx.grid.getView();
    if (store._nativeGetTotalCount) store.getTotalCount = store._nativeGetTotalCount;
    store.clearFilter();
    activeNametagFilter = kw || "";
    const keywords = kw.split(",").map((s) => s.trim().toLowerCase()).filter((s) => s);
    if (keywords.length === 0) {
      forceFooterText(gridDom, store.getCount());
      if (view && view.el) view.el.setScrollTop(0);
      return;
    }
    store.filterBy((record) => {
      const rowText = Object.values(record.data).map((v) => v ? String(v).toLowerCase() : "").join(" ");
      return keywords.some((k) => rowText.includes(k));
    });
    const count = store.getCount();
    if (!store._nativeGetTotalCount) store._nativeGetTotalCount = store.getTotalCount;
    store.getTotalCount = function() {
      return count;
    };
    forceFooterText(gridDom, count);
    if (view && !view.__apmFooterHook) {
      view.on("refresh", () => {
        if (activeNametagFilter) {
          const currentCount = ctx.grid.getStore().getCount();
          forceFooterText(ctx.grid.getEl().dom, currentCount);
        }
      });
      view.__apmFooterHook = true;
    }
    if (view && view.el) view.el.setScrollTop(0);
  }
  if (typeof window !== "undefined") {
    window.applyNametagFilter = applyNametagFilter;
  }

  // src/core/message-router.js
  function initMessageRouter() {
    window.addEventListener("message", (e) => {
      const d = e.data;
      if (!d) return;
      if (d.type === "APM_PTP_HEARTBEAT") {
        window._ptpLastHeartbeat = Date.now();
        if (window.self === window.top && typeof checkPtpStatus === "function") {
          checkPtpStatus(true);
        }
      }
      if (d.type === "APM_GET_THEME" || d.apmMaster === "getTheme") {
        const settings = getSettings();
        const activeTheme = settings.theme && settings.theme !== "default" ? settings.theme : localStorage.getItem(KEY_THEME2) || "default";
        const target = e.origin && e.origin !== "null" ? e.origin : "*";
        try {
          e.source?.postMessage({
            type: "APM_SET_THEME",
            apmMaster: "theme",
            value: activeTheme
          }, target);
        } catch (err) {
        }
      }
      if (d.type === "APM_PTP_CLICK_AWAY") {
        if (typeof window.apmCloseAllPanels === "function") {
          window.apmCloseAllPanels();
        }
      }
      if (d.type === "APM_PTP_START") {
        if (window.self === window.top) {
          const timerUI = initPtpTimerUI();
          if (timerUI && timerUI.style.display === "none") timerUI.style.display = "flex";
          startPtpCountdown();
        }
      }
      if (d.type === "APM_PTP_CANCELLED") {
        if (window.self === window.top) stopPtpTimer();
        if (d.wo) {
          updatePtpHistory(d.wo, "CANCELLED");
        }
      }
      if (d.type === "APM_PTP_COMPLETED" && d.wo) {
        updatePtpHistory(d.wo, "COMPLETE");
        if (window.self === window.top) stopPtpTimer();
      }
    });
  }
  function updatePtpHistory(wo, status) {
    let history = {};
    try {
      history = JSON.parse(localStorage.getItem("apm_ptp_history")) || {};
    } catch (e) {
    }
    Object.keys(history).forEach((key) => {
      if (typeof history[key] === "number") {
        history[key] = { status: "COMPLETE", time: history[key] };
      }
    });
    history[wo] = { status, time: Date.now() };
    localStorage.setItem("apm_ptp_history", JSON.stringify(history));
    window.dispatchEvent(new CustomEvent("APM_PTP_UPDATED_EVENT", { detail: { wo, data: history[wo] } }));
  }

  // src/core/frame-manager.js
  var _gridObservers = /* @__PURE__ */ new Map();
  function injectStylesIntoDoc(doc) {
    if (!doc || doc.getElementById("apm-static-styles")) return;
    const style = doc.createElement("style");
    style.id = "apm-static-styles";
    style.textContent = APM_STATIC_STYLES;
    (doc.head || doc.documentElement).appendChild(style);
  }
  function attachObserverToDoc(doc, win) {
    if (!doc || _gridObservers.has(win)) return;
    injectStylesIntoDoc(doc);
    const target = doc.documentElement || doc.body;
    if (!target) return;
    const obs = new MutationObserver((mutations) => {
      const hasRelevantChanges = mutations.some((m) => m.addedNodes.length > 0 || m.type === "characterData");
      if (hasRelevantChanges) {
        debouncedProcessColorCodeGrid(doc);
      }
    });
    obs.observe(target, {
      childList: true,
      subtree: true,
      characterData: true
    });
    _gridObservers.set(win, obs);
  }
  function scanAndAttachFrames() {
    attachObserverToDoc(document, window);
    const injectComponentWatcher = (win) => {
      if (!win.Ext || !win.Ext.Component || win.__apmWatcherInjected) return;
      const originalInit = win.Ext.Component.prototype.initComponent;
      win.Ext.Component.prototype.initComponent = function() {
        const res = originalInit.apply(this, arguments);
        if (this.isXType) {
          if (this.isXType("gridpanel") || this.isXType("tabpanel")) {
            setTimeout(() => {
              if (!this.isDestroyed) triggerConsistencyForComponent(this, win);
            }, 10);
          }
        }
        return res;
      };
      win.__apmWatcherInjected = true;
    };
    const triggerConsistencyForComponent = (comp, win) => {
      const fd = win.document;
      if (comp.isXType("gridpanel")) {
        if (typeof setupExtGridListeners === "function") setupExtGridListeners(win);
        processColorCodeGrid(fd);
      } else if (comp.isXType("tabpanel") || comp.isXType("uxtabpanel")) {
        if (window.top.bindConsistencyListeners) window.top.bindConsistencyListeners();
      }
    };
    const injectAjaxWatcher = (win) => {
      if (!win.Ext || !win.Ext.Ajax || win.__apmAjaxWatcherInjected) return;
      win.Ext.Ajax.on("requestcomplete", (conn, response, options) => {
        const url = options?.url || "";
        if (url.includes("request") || url.includes("search") || url.includes("grid") || url.includes(".xmlhttp") || url.includes(".HDR") || url.includes(".LST") || url.includes("GRIDDATA")) {
          setTimeout(() => {
            if (window.top.bindConsistencyListeners) window.top.bindConsistencyListeners();
            if (typeof applyTabConsistency === "function") applyTabConsistency();
            if (typeof applyGridConsistency === "function") applyGridConsistency();
            debouncedProcessColorCodeGrid();
          }, 100);
        }
      });
      win.__apmAjaxWatcherInjected = true;
    };
    document.querySelectorAll("iframe").forEach((f) => {
      if (!f.hasApmLoadBound) {
        f.addEventListener("load", () => {
          setTimeout(scanAndAttachFrames, 250);
        });
        f.hasApmLoadBound = true;
      }
      try {
        const fw = f.contentWindow;
        const fd = f.contentDocument;
        if (fw && fd && fd.readyState !== "loading") {
          const needsStyles = !fd.getElementById("apm-static-styles");
          const needsObserver = !_gridObservers.has(fw);
          if (needsStyles || needsObserver) {
            injectStylesIntoDoc(fd);
            enforceTheme(fw, fd);
            fullStyleUpdate(fd);
          }
          injectComponentWatcher(fw);
          injectAjaxWatcher(fw);
          if (!fd.hasApmEventsBound) {
            const bindHooks = () => {
              try {
                fd.addEventListener("keydown", (e) => {
                  if (window.top.checkApmHotkey) window.top.checkApmHotkey(e);
                }, true);
                fd.addEventListener("mousedown", (e) => {
                  if (!e.target.closest("#apm-settings-panel, #apm-labor-panel, #apm-labor-trigger, #eam-forecast-container, .apm-toolbar-btn, .forecast-btn")) {
                    if (window.top.apmCloseAllPanels) window.top.apmCloseAllPanels();
                  }
                }, true);
                fd.hasApmEventsBound = true;
              } catch (err) {
              }
            };
            if (fw.Ext && fw.Ext.onReady) fw.Ext.onReady(bindHooks);
            else bindHooks();
          }
          const triggerConsistency = () => {
            if (typeof setupExtGridListeners === "function") setupExtGridListeners(fw);
            processColorCodeGrid(fd);
            attachObserverToDoc(fd, fw);
          };
          if (fw.Ext && fw.Ext.onReady) fw.Ext.onReady(triggerConsistency);
          else triggerConsistency();
        }
      } catch (e) {
      }
    });
  }

  // src/index.js
  enforceTheme();
  initializeGeneralSettings();
  var isEAM = window.location.hostname.includes("hxgnsmartcloud.com");
  var isPTP = /amazon\.dev|insights/i.test(window.location.hostname);
  if (isEAM || isPTP) {
    initPtpSandbox();
    if (isEAM) {
      loadColorCodePrefs();
      fullStyleUpdate();
      checkForGlobalUpdates();
      initMessageRouter();
    }
    window.applyNametagFilter = applyNametagFilter;
  }
  window.apmCloseAllPanels = function() {
    const settings = document.getElementById("apm-settings-panel");
    if (settings) settings.style.display = "none";
    const forecast = document.getElementById("eam-forecast-container");
    if (forecast) forecast.style.display = "none";
    window.dispatchEvent(new CustomEvent("APM_CLOSE_LABOR"));
  };
  document.addEventListener("click", (e) => {
    const tag = e.target.closest(".apm-nametag");
    if (tag) {
      const kw = tag.getAttribute("data-filter-kw");
      if (kw) {
        const isAlreadyActive = window.activeNametagFilter === kw;
        const newFilter = isAlreadyActive ? "" : kw;
        window.activeNametagFilter = newFilter;
        let banner = document.getElementById("apm-filter-banner");
        if (!banner) {
          banner = document.createElement("div");
          banner.id = "apm-filter-banner";
          banner.style.cssText = "position:fixed; top:10px; left:50%; transform:translateX(-50%); background:#e74c3c; color:white; padding:6px 16px; border-radius:20px; font-weight:bold; font-size:13px; cursor:pointer; z-index:2147483647; display:none; box-shadow:0 4px 10px rgba(0,0,0,0.5);";
          document.body.appendChild(banner);
        }
        if (newFilter) {
          const keywords = newFilter.split(",").map((s) => s.trim());
          banner.innerHTML = `\u{1F50D} Showing: "${keywords.length > 2 ? keywords[0] + ", " + keywords[1] + "..." : newFilter}" \u2716`;
          banner.style.display = "block";
        } else {
          banner.style.display = "none";
        }
        if (typeof window.applyNametagFilter === "function") window.applyNametagFilter(newFilter);
        document.querySelectorAll("iframe").forEach((f) => {
          try {
            f.contentWindow.postMessage({ type: "APM_SET_FILTER", kw: newFilter }, "*");
          } catch (err) {
          }
        });
      }
      return;
    }
    if (e.target.closest("#apm-filter-banner")) {
      window.activeNametagFilter = "";
      document.getElementById("apm-filter-banner").style.display = "none";
      if (typeof window.applyNametagFilter === "function") window.applyNametagFilter("");
      document.querySelectorAll("iframe").forEach((f) => {
        try {
          f.contentWindow.postMessage({ type: "APM_SET_FILTER", kw: "" }, "*");
        } catch (err) {
        }
      });
      return;
    }
    const icon = e.target.closest(".apm-copy-icon");
    if (icon) {
      e.preventDefault();
      e.stopPropagation();
      const url = icon.getAttribute("data-wo-copy-url");
      if (url) {
        navigator.clipboard.writeText(url).then(() => {
          icon.classList.add("apm-copy-success");
          setTimeout(() => icon.classList.remove("apm-copy-success"), 1500);
        });
      }
    }
  }, true);
  window.addEventListener("DOMContentLoaded", () => {
    if (!isEAM) return;
    document.addEventListener("mousedown", (e) => {
      const isTrigger = e.target.closest("#apm-settings-ext-btn, #apm-forecast-ext-btn, #apm-labor-trigger, #apm-labor-mgr-toggle, .apm-toolbar-btn, .rain-cloud-hover");
      const panels = ["apm-settings-panel", "eam-forecast-container", "eam-forecast-panel", "apm-labor-panel", "apm-labor-mgr-panel", "apm-colorcode-panel"];
      const isInside = panels.some((id) => document.getElementById(id)?.contains(e.target));
      if (!isTrigger && !isInside) window.apmCloseAllPanels();
    }, true);
    const observer = new MutationObserver((mutations) => {
      const hasNewIframe = mutations.some((m) => Array.from(m.addedNodes).some((n) => n.nodeType === 1 && (n.tagName === "IFRAME" || n.querySelector && n.querySelector("iframe"))));
      if (hasNewIframe) setTimeout(scanAndAttachFrames, 150);
    });
    if (document.body) observer.observe(document.body, { childList: true, subtree: true });
    initBootSequence();
    setTimeout(() => {
      scanAndAttachFrames();
      if (window.self === window.top) checkPtpStatus();
    }, 1500);
    setInterval(scanAndAttachFrames, 6e4);
  });
})();
