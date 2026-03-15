// ==UserScript==
// @name         APM Master: Unified Tools
// @namespace    https://w.amazon.com/bin/view/Users/rosendah/APM-Master/
// @version      14.3.7
// @description  Quality of life and automation tool that uses native EAM ExtJS Framework functions for high reliability and capability. This is actively supported tool so Slack me or submit bug report/feature request through the bug report button in the menu.
// @author       Jacob Rosendahl
// @icon         https://media.licdn.com/dms/image/v2/D5603AQGdCV0_LQKRfQ/profile-displayphoto-scale_100_100/B56ZyZLvQ5HgAg-/0/1772096519061?e=1773878400&v=beta&t=eWO1Jiy0-WbzG_yBv-SBrmmsVOPMexF57-q1Xh_VXCk
// @match        https://*.eam.hxgnsmartcloud.com/*
// @match        https://*.sso.eam.hxgnsmartcloud.com/*
// @match        https://idp.federate.amazon.com/*
// @match        https://*.amazon.com/*
// @match        https://*.amazon.dev/*
// @match        https://*.apm-es.gps.amazon.dev/*
// @match        https://*.hexagon.com/*
// @match        https://*.octave.com/*
// @updateURL    https://drive.corp.amazon.com/view/rosendah@/greasemonkey_scripts/APM-Master/forecast.user.js
// @downloadURL  https://drive.corp.amazon.com/view/rosendah@/greasemonkey_scripts/APM-Master/forecast.user.js
// @run-at       document-start
// @grant        GM_addStyle
// @grant        GM_addElement
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @grant        GM_listValues
// @grant        unsafeWindow
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __esm = (fn, res) => function __init() {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  };
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };

  // src/core/constants.js
  var KEY_THEME, CC_STORAGE_RULES, CC_STORAGE_SET, PRESET_STORAGE_KEY, STORAGE_KEY, APM_GENERAL_STORAGE, CURRENT_VERSION, VERSION_CHECK_URL, UPDATE_URL, LABOR_EMPS_STORAGE, LABOR_ACTIVE_STORAGE, LABOR_DOCK_STORAGE, BETA_VERSION_CHECK_URL, BETA_UPDATE_URL, LOG_LEVELS, DEFAULT_TENANT, SESSION_TIMEOUT_URL, LINK_CONFIG;
  var init_constants = __esm({
    "src/core/constants.js"() {
      KEY_THEME = "apm_v1_ui_theme";
      CC_STORAGE_RULES = "apm_v1_colorcode_rules";
      CC_STORAGE_SET = "apm_v1_colorcode_settings";
      PRESET_STORAGE_KEY = "apm_v1_autofill_presets";
      STORAGE_KEY = "apm_v1_forecast_prefs";
      APM_GENERAL_STORAGE = "apm_v1_general_settings";
      CURRENT_VERSION = "14.3.3";
      VERSION_CHECK_URL = "https://raw.githubusercontent.com/jaker788-create/APM-Master/Automation/forecast.user.js";
      UPDATE_URL = "https://github.com/jaker788-create/APM-Master/releases/download/Automation/forecast.user.js";
      LABOR_EMPS_STORAGE = "apm_v1_labor_employees";
      LABOR_ACTIVE_STORAGE = "apm_v1_labor_active";
      LABOR_DOCK_STORAGE = "apm_v1_labor_dock";
      BETA_VERSION_CHECK_URL = "https://raw.githubusercontent.com/jaker788-create/APM-Master/Beta/forecast.user.js";
      BETA_UPDATE_URL = "https://github.com/jaker788-create/APM-Master/releases/download/Beta/forecast.user.js";
      LOG_LEVELS = {
        ERROR: 0,
        WARN: 1,
        INFO: 2,
        DEBUG: 3,
        VERBOSE: 4
      };
      DEFAULT_TENANT = "AMAZONRMENA_PRD";
      SESSION_TIMEOUT_URL = `https://us1.eam.hxgnsmartcloud.com/web/base/logindisp?tenant=${DEFAULT_TENANT}`;
      LINK_CONFIG = {
        tenant: "AMAZONRMENA_PRD",
        userFuncName: "WSJOBS",
        woPattern: /\b([123]\d{9,})\b/
      };
    }
  });

  // src/core/logger.js
  var currentNumericLevel, APMLogger;
  var init_logger = __esm({
    "src/core/logger.js"() {
      init_constants();
      currentNumericLevel = LOG_LEVELS.ERROR;
      APMLogger = {
        setLevel: (level) => {
          if (typeof level === "number") {
            currentNumericLevel = level;
          } else {
            const l = (level || "ERROR").toUpperCase();
            currentNumericLevel = LOG_LEVELS[l] ?? LOG_LEVELS.ERROR;
          }
        },
        error: (tag, ...args) => {
          if (currentNumericLevel >= LOG_LEVELS.ERROR) {
            console.error(`[${tag}]`, ...args);
          }
        },
        warn: (tag, ...args) => {
          if (currentNumericLevel >= LOG_LEVELS.WARN) {
            console.warn(`[${tag}]`, ...args);
          }
        },
        info: (tag, ...args) => {
          if (currentNumericLevel >= LOG_LEVELS.INFO) {
            console.info(`[${tag}]`, ...args);
          }
        },
        debug: (tag, ...args) => {
          if (currentNumericLevel >= LOG_LEVELS.DEBUG) {
            console.log(`[${tag}]`, ...args);
          }
        },
        verbose: (tag, ...args) => {
          if (currentNumericLevel >= LOG_LEVELS.VERBOSE) {
            console.log(`[${tag}]`, ...args);
          }
        },
        isLevel: (level) => {
          let numeric;
          if (typeof level === "number") {
            numeric = level;
          } else {
            const l = (level || "ERROR").toUpperCase();
            numeric = LOG_LEVELS[l] ?? LOG_LEVELS.ERROR;
          }
          return currentNumericLevel >= numeric;
        }
      };
    }
  });

  // src/core/toast.js
  function showToast(msg, color, keepOpen = false) {
    let t = document.getElementById("apm-global-toast");
    if (!t) {
      t = document.createElement("div");
      t.id = "apm-global-toast";
      t.style.cssText = "position:fixed; top:15px; left:50%; transform:translateX(-50%); z-index:9999999; padding:8px 20px; border-radius:30px; font-weight:bold; font-family:sans-serif; font-size:13px; color:white; opacity:0; pointer-events:none; transition:opacity 0.3s ease; box-shadow:0 4px 15px rgba(0,0,0,0.4);";
      document.body.appendChild(t);
    }
    if (!msg) {
      t.style.opacity = "0";
      setTimeout(() => {
        t.style.display = "none";
      }, 300);
      return;
    }
    t.textContent = msg;
    t.style.background = color || "#3498db";
    t.style.display = "block";
    setTimeout(() => t.style.opacity = "1", 10);
    if (window._apmToastTO) clearTimeout(window._apmToastTO);
    if (!keepOpen) {
      const duration = 5e3;
      window._apmToastTO = setTimeout(() => {
        t.style.opacity = "0";
        setTimeout(() => t.style.display = "none", 300);
      }, duration);
    }
  }
  var init_toast = __esm({
    "src/core/toast.js"() {
    }
  });

  // src/core/migration-manager.js
  var isFunctionallyEmpty, MigrationManager;
  var init_migration_manager = __esm({
    "src/core/migration-manager.js"() {
      init_constants();
      init_logger();
      init_utils();
      init_storage();
      isFunctionallyEmpty = (raw) => {
        if (!raw || raw === "null" || raw === "{}" || raw === "[]") return true;
        try {
          const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
          if (Array.isArray(parsed)) return parsed.length === 0;
          if (typeof parsed === "object") {
            if (parsed.orgs && Array.isArray(parsed.orgs) && parsed.orgs.length === 0 && !parsed.selectedOrg) return true;
            return Object.keys(parsed).length === 0;
          }
        } catch (e) {
        }
        return false;
      };
      MigrationManager = {
        run() {
          if (!isTopFrame()) return;
          if (window.__apmMigrationRan) return;
          window.__apmMigrationRan = true;
          APMLogger.info("Migration", "Starting data migration...");
          this.migrateGeneralSettings();
          this.migrateAutofillPresets();
          this.migrateColorCode();
          this.migrateForecast();
          this.migrateLabor();
          this.promoteToGlobal();
          APMLogger.info("Migration", "Migration complete.");
        },
        promoteToGlobal() {
          const v1Keys = [
            APM_GENERAL_STORAGE,
            PRESET_STORAGE_KEY,
            CC_STORAGE_RULES,
            CC_STORAGE_SET,
            STORAGE_KEY,
            LABOR_EMPS_STORAGE,
            LABOR_ACTIVE_STORAGE,
            LABOR_DOCK_STORAGE,
            KEY_THEME,
            "apmNightShiftOn",
            "apmLastKnownEmpId"
          ];
          v1Keys.forEach((key) => {
            APMStorage.get(key);
          });
        },
        migrateGeneralSettings() {
          this.safeMigrate("ApmGeneralSettings", APM_GENERAL_STORAGE);
          this.safeMigrate("apmUiTheme", KEY_THEME);
        },
        migrateAutofillPresets() {
          this.safeMigrate("apm_creator_presets_v1", PRESET_STORAGE_KEY);
          this.safeMigrate("apm_preset_store", PRESET_STORAGE_KEY);
        },
        migrateColorCode() {
          this.safeMigrate("apm_colorcode_rules", CC_STORAGE_RULES);
          this.safeMigrate("apm_colorcode_settings", CC_STORAGE_SET);
          this.safeMigrate("ApmColorCodeRules", CC_STORAGE_RULES);
          this.safeMigrate("ApmColorCodeSettings", CC_STORAGE_SET);
        },
        migrateForecast() {
          this.safeMigrate("eam_forecast_prefs", STORAGE_KEY, (oldData) => {
            if (oldData && typeof oldData === "object") {
              if (oldData.profiles && !oldData.customProfiles) oldData.customProfiles = oldData.profiles;
              if (oldData.dataspys && !oldData.customProfiles) oldData.customProfiles = oldData.dataspys;
            }
            return oldData;
          });
        },
        migrateLabor() {
          this.safeMigrate("apmLaborSavedEmps", LABOR_EMPS_STORAGE);
          this.safeMigrate("apmLaborActiveEmp", LABOR_ACTIVE_STORAGE);
          this.safeMigrate("apmLaborDockPos", LABOR_DOCK_STORAGE);
        },
        safeMigrate(legacyKey, v1Key, transform = (d) => d) {
          try {
            const v1InGM = typeof GM_getValue !== "undefined" ? GM_getValue(v1Key) : null;
            if (v1InGM && !isFunctionallyEmpty(v1InGM)) return;
            const v1Local = localStorage.getItem(v1Key);
            const legacyRaw = localStorage.getItem(legacyKey);
            if (!legacyRaw || legacyRaw === "null" || legacyRaw === "{}" || legacyRaw === "[]") return;
            const v1Empty = isFunctionallyEmpty(v1Local);
            if (v1Empty && legacyRaw && !isFunctionallyEmpty(legacyRaw)) {
              APMLogger.info("Migration", `MIGRATING: ${legacyKey} -> ${v1Key} (Global)`);
              let dataToSave = legacyRaw;
              if (transform) {
                try {
                  const parsed = JSON.parse(legacyRaw);
                  const transformed = transform(parsed);
                  dataToSave = JSON.stringify(transformed);
                } catch (e) {
                  dataToSave = legacyRaw;
                }
              }
              APMStorage.set(v1Key, dataToSave);
            }
          } catch (e) {
            APMLogger.error("Migration", `Error migrating ${legacyKey}:`, e);
          }
        }
      };
    }
  });

  // src/core/state.js
  function initializeGeneralSettings() {
    if (_settingsInitialized) return apmGeneralSettings;
    MigrationManager.run();
    let stored = APMStorage.get(APM_GENERAL_STORAGE);
    let parsed = null;
    if (stored) {
      parsed = stored;
      if (isTopFrame() && parsed.logLevel) {
        APMLogger.setLevel(parsed.logLevel);
        APMLogger.info("APM State", "Loaded from storage:", parsed);
      }
    }
    if (!parsed) {
      const cookieMatch = document.cookie.match(/apm_gen_settings=([^;]+)/);
      if (cookieMatch) {
        try {
          parsed = JSON.parse(decodeURIComponent(cookieMatch[1]));
          APMLogger.info("APM State", "Recovered from cookie:", parsed);
          if (parsed.logLevel) APMLogger.setLevel(parsed.logLevel);
        } catch (e) {
        }
      }
    }
    if (parsed) {
      Object.assign(apmGeneralSettings, DEFAULT_SETTINGS, parsed);
    } else {
      if (isTopFrame()) {
        APMLogger.info("APM State", "No stored settings found, using defaults.");
      }
      Object.assign(apmGeneralSettings, DEFAULT_SETTINGS);
    }
    _settingsInitialized = true;
    APMLogger.info("APM State", "Initialization complete.");
    return apmGeneralSettings;
  }
  function saveGeneralSettings() {
    APMStorage.set(APM_GENERAL_STORAGE, apmGeneralSettings);
    try {
      const domain = ".hxgnsmartcloud.com";
      const expiry = new Date(Date.now() + 365 * 24 * 60 * 60 * 1e3).toUTCString();
      const syncData = {
        autoRedirect: apmGeneralSettings.autoRedirect,
        dateFormat: apmGeneralSettings.dateFormat,
        dateSeparator: apmGeneralSettings.dateSeparator
      };
      document.cookie = `apm_gen_settings=${encodeURIComponent(JSON.stringify(syncData))}; domain=${domain}; path=/; expires=${expiry}; SameSite=Lax`;
    } catch (e) {
    }
  }
  function setGeneralSetting(key, value) {
    apmGeneralSettings[key] = value;
    saveGeneralSettings();
  }
  var AppState, DEFAULT_SETTINGS, apmGeneralSettings, _settingsInitialized;
  var init_state = __esm({
    "src/core/state.js"() {
      init_constants();
      init_utils();
      init_logger();
      init_storage();
      init_migration_manager();
      AppState = {
        // Forecast
        forecast: {
          isRunning: false,
          isStopped: false,
          savedOrgs: [],
          selectedOrg: "",
          savedProfiles: [],
          selectedProfileId: ""
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
          settings: { uniformHighlight: true, theme: "default" },
          footerObserver: null,
          activeFilter: ""
        },
        // PTP
        ptp: {
          seconds: 120,
          timerRunning: false,
          dismissed: false
        },
        // Session (Captured from EAM Traffic)
        session: {
          eamid: "",
          tenant: "",
          user: "",
          isInitialized: false,
          isFresh: false
        },
        // System defaults
        systemDefaults: {
          tabOrder: null,
          columnOrder: null
        }
      };
      DEFAULT_SETTINGS = {
        ptpTimerEnabled: true,
        ptpTrackingEnabled: true,
        openLinksInNewTab: true,
        autoRedirect: true,
        dateFormat: "us",
        // 'us', 'eu', or 'mon'
        dateSeparator: "/",
        dateOverrideEnabled: true,
        logLevel: "error",
        // error, warn, info, debug, verbose
        updateTrack: "stable"
        // stable, beta
      };
      apmGeneralSettings = { ...DEFAULT_SETTINGS };
      _settingsInitialized = false;
    }
  });

  // src/core/utils.js
  function apmGetGlobalWindow() {
    return typeof unsafeWindow !== "undefined" ? unsafeWindow : window;
  }
  function isWindowAccessible(win) {
    if (!win) return false;
    try {
      return !!(win.location && win.document && typeof win.location.href === "string");
    } catch (e) {
      return false;
    }
  }
  function isTopFrame() {
    try {
      const root = apmGetGlobalWindow();
      if (root.self === root.top) return true;
      try {
        if (root.top && root.top.document === document) return true;
      } catch (err) {
      }
    } catch (e) {
    }
    return false;
  }
  function getExtWindows() {
    const root = apmGetGlobalWindow();
    const wins = /* @__PURE__ */ new Set();
    const gather = (win) => {
      try {
        if (win.Ext) wins.add(win);
        for (let i = 0; i < win.frames.length; i++) {
          gather(win.frames[i]);
        }
      } catch (e) {
      }
    };
    gather(root.top);
    gather(root);
    return [...wins];
  }
  function getAccessibleDocs() {
    const root = apmGetGlobalWindow();
    const docs = /* @__PURE__ */ new Set();
    const wins = /* @__PURE__ */ new Set();
    const gather = (win) => {
      if (!win || wins.has(win)) return;
      try {
        wins.add(win);
        let doc = null;
        try {
          doc = win.document;
        } catch (e) {
        }
        if (doc) {
          docs.add(doc);
          doc.querySelectorAll("iframe").forEach((f) => {
            try {
              if (f.src && f.src.includes("amazon.dev")) return;
              if (f.contentWindow) gather(f.contentWindow);
            } catch (e) {
            }
          });
        }
      } catch (e) {
      }
    };
    gather(root.top);
    gather(root);
    return [...docs];
  }
  function findMainGrid() {
    const now = performance.now();
    if (_mainGridCache && now - _lastGridCheck < GRID_CACHE_TTL) {
      if (!_mainGridCache.grid.isDestroyed && _mainGridCache.grid.rendered) {
        return _mainGridCache;
      }
    }
    const start = performance.now();
    const wins = getExtWindows();
    for (const win of wins) {
      try {
        if (!win.Ext?.ComponentQuery) continue;
        const grid = win.Ext.ComponentQuery.query("gridpanel:not([destroyed=true])").find(
          (g) => g.columns?.length > 5 && g.rendered && !g.isDestroyed
        );
        if (grid) {
          const end = performance.now();
          _mainGridCache = { win, doc: win.document, grid };
          _lastGridCheck = end;
          APMLogger.debug("Utils", `findMainGrid found: ${grid.id} in ${(end - start).toFixed(2)}ms (Cols: ${grid.columns.length})`);
          return _mainGridCache;
        }
      } catch (e) {
      }
    }
    _mainGridCache = null;
    APMLogger.info("Utils", `findMainGrid found NOTHING in ${wins.length} windows`);
    return null;
  }
  function formatDate(d) {
    if (!d || isNaN(d.getTime())) return "";
    const day = String(d.getDate()).padStart(2, "0");
    const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const monName = months[d.getMonth()];
    const year = d.getFullYear();
    const sep = apmGeneralSettings?.dateSeparator || "/";
    if (apmGeneralSettings?.dateFormat === "eu") {
      return `${day}${sep}${month}${sep}${year}`;
    }
    if (apmGeneralSettings?.dateFormat === "mon") {
      return `${day}-${monName}-${year}`;
    }
    return `${month}${sep}${day}${sep}${year}`;
  }
  function getLocalIsoDate(date) {
    const d = date || /* @__PURE__ */ new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
  function formatToEamDate(isoDate) {
    if (!isoDate) return "";
    if (isoDate instanceof Date) return formatDate(isoDate);
    const [y, m, d] = isoDate.split("-");
    const dateObj = new Date(y, m - 1, d);
    return formatDate(dateObj);
  }
  function parseEamDate(dateStr) {
    if (!dateStr) return null;
    const s = String(dateStr).split(" ")[0].toUpperCase();
    const monMatch = s.match(/^(\d{1,2})-(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)-(\d{4})$/);
    if (monMatch) {
      const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
      const d = parseInt(monMatch[1]), m = months.indexOf(monMatch[2]), y = parseInt(monMatch[3]);
      return new Date(y, m, d);
    }
    if (s.includes("/")) {
      const parts = s.split("/");
      if (parts.length === 3) {
        const p1 = parseInt(parts[0]), p2 = parseInt(parts[1]), y = parseInt(parts[2]);
        if (apmGeneralSettings.dateFormat === "eu") return new Date(y, p2 - 1, p1);
        return new Date(y, p1 - 1, p2);
      }
    }
    if (s.includes("-") && s.split("-").length === 3 && s.split("-")[0].length === 4) {
      const parts = s.split("-");
      return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    }
    const fallback = new Date(dateStr);
    return isNaN(fallback.getTime()) ? null : fallback;
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
  async function recursiveGridFetch(grid, options = {}) {
    if (!grid || grid.isDestroyed) return;
    const store = grid.getStore();
    if (!store || store.isLoading()) return;
    const {
      useGetCacheEndpoint = false,
      maxRecursiveCalls = 25,
      eamid = "",
      tenant = ""
    } = options;
    let callCount = 0;
    const checkAndDoFetch = async () => {
      const proxy = store.getProxy();
      const reader = proxy?.getReader();
      const operation = options.operation;
      let rawData = operation?.getResultSet?.()?.rawData || operation?.request?.proxy?.getReader()?.rawData || operation?.response?.responseXML || operation?.response?.responseText || reader?.rawData;
      if (typeof rawData === "string" && (rawData.trim().startsWith("{") || rawData.trim().startsWith("["))) {
        try {
          rawData = JSON.parse(rawData);
        } catch (e) {
        }
      }
      let morePresent = !!store.__apmLastHasMore;
      if (store.__apmLastHasMore !== void 0) {
        APMLogger.debug("Utils", `[Fetch Logic] Using Reader-hooked morePresent: ${morePresent}`);
        delete store.__apmLastHasMore;
      } else if (rawData) {
        try {
          if (rawData.nodeType === 9 || rawData.nodeType === 1 || typeof rawData === "string" && rawData.includes("<?xml")) {
            let xmlDoc = typeof rawData === "string" ? new DOMParser().parseFromString(rawData, "text/xml") : rawData;
            const metaNode = xmlDoc.querySelector?.("METADATA") || xmlDoc;
            morePresent = metaNode.getAttribute?.("MORERECORDPRESENT") === "+" || metaNode.querySelector?.("MORERECORDPRESENT")?.textContent === "+";
          } else {
            const data = rawData?.pageData?.grid?.GRIDRESULT?.GRID?.METADATA ? rawData.pageData.grid.GRIDRESULT.GRID.METADATA : rawData?.GRIDRESULT?.GRID?.METADATA ? rawData.GRIDRESULT.GRID.METADATA : rawData?.METADATA || rawData;
            morePresent = data.MORERECORDPRESENT === "+" || data.MORERECORDPRESENT === "Y";
          }
        } catch (e) {
        }
      }
      const totalReceived = (store.snapshot || store.data).getCount?.() || (store.snapshot || store.data).length || 0;
      APMLogger.debug("Utils", `Recursive check for grid ${grid.id}: morePresent=${morePresent}, totalReceived=${totalReceived}, callCount=${callCount}`);
      if (morePresent && callCount < maxRecursiveCalls) {
        callCount++;
        APMLogger.debug("Utils", `Recursive fetch for grid ${grid.id}: Call ${callCount}`);
        const nextCursor = totalReceived + 1;
        const extraParams = proxy.extraParams || {};
        const effectiveEamid = options.eamid || AppState.session.eamid || extraParams.eamid || store.proxy?.reader?.rawData?.eamid;
        const effectiveTenant = options.tenant || AppState.session.tenant || extraParams.tenant || store.proxy?.reader?.rawData?.tenant;
        if (effectiveEamid && (useGetCacheEndpoint || grid.id?.includes("readonlygrid"))) {
          const loadParams = {
            COMPONENT_INFO_TYPE: "DATA_ONLY",
            COMPONENT_INFO_TYPE_MODE: "CACHE",
            ONLY_DATA_REQUIRED: "true",
            CURSOR_POSITION: nextCursor.toString(),
            eamid: effectiveEamid,
            tenant: effectiveTenant || ""
          };
          ["GRID_ID", "GRID_NAME", "DATASPY_ID", "SYSTEM_FUNCTION_NAME", "USER_FUNCTION_NAME", "CURRENT_TAB_NAME"].forEach((p) => {
            if (extraParams[p]) loadParams[p] = extraParams[p];
          });
          APMLogger.debug("Utils", `Triggering store.load({addRecords:true}) for ${grid.id} at cursor ${nextCursor}`);
          return new Promise((resolve) => {
            store.load({
              addRecords: true,
              params: loadParams,
              // Injected params will be merged by ExtJS
              callback: (records, op, success) => {
                if (success) {
                  options.operation = op;
                  setTimeout(() => resolve(checkAndDoFetch()), 300);
                } else resolve();
              }
            });
          });
        } else {
          const fallbackParams = {
            ...extraParams,
            GET_ALL_DATABSE_ROWS: "true",
            REQUEST_TYPE: "LIST.DATA_ONLY.STORED",
            CURSOR_POSITION: nextCursor.toString()
          };
          APMLogger.debug("Utils", `Triggering fallback load for ${grid.id} at cursor ${nextCursor}`);
          return new Promise((resolve) => {
            store.load({
              addRecords: true,
              params: fallbackParams,
              callback: (records, op, success) => {
                if (success) {
                  options.operation = op;
                  setTimeout(() => resolve(checkAndDoFetch()), 300);
                } else resolve();
              }
            });
          });
        }
      }
    };
    return checkAndDoFetch();
  }
  var delay, _mainGridCache, _lastGridCheck, GRID_CACHE_TTL, ExtUtils;
  var init_utils = __esm({
    "src/core/utils.js"() {
      init_state();
      init_logger();
      delay = (ms) => new Promise((res) => setTimeout(res, ms));
      _mainGridCache = null;
      _lastGridCheck = 0;
      GRID_CACHE_TTL = 5e3;
      ExtUtils = {
        /**
         * Set a value on an ExtJS field and fire necessary events.
         */
        setFieldValue: function(form, fieldName, value, isCombo = false) {
          const f = form.findField(fieldName);
          if (!f) return false;
          try {
            if (isCombo) {
              const rec = f.store ? f.store.findRecord("code", value) || f.store.findRecord("id", value) || f.store.getAt(0) : null;
              if (rec) {
                f.setValue(rec);
                if (f.select) f.select(rec);
              } else {
                f.setValue(value);
              }
            } else {
              f.setValue(value);
            }
            if (f.setRawValue) {
              f.setRawValue(f.getRawValue() || value);
            }
          } catch (e) {
          }
          f.fireEvent("change", f, f.getValue());
          f.fireEvent("blur", f);
          if (typeof f.validate === "function") f.validate();
          return true;
        },
        /**
         * Ensure a combo store is loaded before interacting.
         */
        ensureStoreLoaded: async function(field, win) {
          if (!field || !field.store) return;
          if (field.store.getCount() === 0 && !field.store.isLoading()) {
            if (field.doQuery) field.doQuery(field.allQuery || "", true);
            else if (field.onTriggerClick) field.onTriggerClick();
            await waitForAjax(win);
          }
        }
      };
    }
  });

  // src/core/storage.js
  var APMStorage;
  var init_storage = __esm({
    "src/core/storage.js"() {
      init_utils();
      init_logger();
      APMStorage = {
        /**
         * Retrieves a value from the best available storage.
         * @param {string} key 
         * @param {any} defaultValue 
         * @returns {any}
         */
        get(key, defaultValue = null) {
          try {
            if (typeof GM_getValue !== "undefined") {
              const gmVal = GM_getValue(key);
              if (gmVal !== void 0 && gmVal !== null) {
                try {
                  return JSON.parse(gmVal);
                } catch (e) {
                  return gmVal;
                }
              }
            }
            const localRaw = localStorage.getItem(key);
            if (localRaw !== null) {
              try {
                const parsed = JSON.parse(localRaw);
                if (typeof GM_setValue !== "undefined") {
                  this.set(key, parsed);
                  APMLogger.info("Storage", `Promoted key '${key}' from local to GM storage.`);
                }
                return parsed;
              } catch (e) {
                return localRaw;
              }
            }
          } catch (err) {
            APMLogger.error("Storage", `Error reading key '${key}':`, err);
          }
          return defaultValue;
        },
        /**
         * Saves a value to all available storage backends.
         * @param {string} key 
         * @param {any} value 
         */
        set(key, value) {
          try {
            const raw = typeof value === "string" ? value : JSON.stringify(value);
            if (typeof GM_setValue !== "undefined") {
              GM_setValue(key, raw);
            }
            localStorage.setItem(key, raw);
          } catch (err) {
            APMLogger.error("Storage", `Error saving key '${key}':`, err);
          }
        },
        /**
         * Deletes a key from all storage.
         * @param {string} key 
         */
        remove(key) {
          if (typeof GM_deleteValue !== "undefined") GM_deleteValue(key);
          localStorage.removeItem(key);
        },
        /**
         * Lists all keys in GM storage.
         * @returns {string[]}
         */
        list() {
          if (typeof GM_listValues !== "undefined") return GM_listValues();
          return Object.keys(localStorage);
        }
      };
    }
  });

  // src/core/theme-resolver.js
  var theme_resolver_exports = {};
  __export(theme_resolver_exports, {
    ThemeResolver: () => ThemeResolver
  });
  var ThemeResolver;
  var init_theme_resolver = __esm({
    "src/core/theme-resolver.js"() {
      init_constants();
      init_storage();
      init_logger();
      ThemeResolver = {
        /**
         * Resolves the active theme based on consistent priority logic.
         * Priority: KEY_THEME > CC_STORAGE_SET > APM_GENERAL_STORAGE
         */
        getPreferredTheme() {
          try {
            const getVal = (key) => {
              if (typeof GM_getValue !== "undefined") {
                const v = GM_getValue(key);
                if (v !== void 0 && v !== null) return v;
              }
              return localStorage.getItem(key);
            };
            const parseVal = (raw) => {
              if (!raw) return null;
              try {
                return typeof raw === "string" ? JSON.parse(raw) : raw;
              } catch (e) {
                return raw;
              }
            };
            const direct = getVal(KEY_THEME);
            if (direct && direct !== "default") return direct;
            const cc = parseVal(getVal(CC_STORAGE_SET));
            if (cc && cc.theme && cc.theme !== "default") return cc.theme;
            const gen = parseVal(getVal(APM_GENERAL_STORAGE));
            if (gen && gen.theme && gen.theme !== "default") return gen.theme;
            const legGen = parseVal(getVal("ApmGeneralSettings"));
            if (legGen && legGen.theme && legGen.theme !== "default") return legGen.theme;
          } catch (e) {
            APMLogger.warn("ThemeResolver", "Error resolving theme preference", e);
          }
          return "default";
        },
        /**
         * Saves the theme across all relevant storage locations to maintain consistency.
         */
        setGlobalTheme(themeName) {
          if (!themeName) return;
          APMLogger.info("ThemeResolver", `Setting global theme to: ${themeName}`);
          APMStorage.set(KEY_THEME, themeName);
          const cc = APMStorage.get(CC_STORAGE_SET) || {};
          if (cc.theme !== themeName) {
            cc.theme = themeName;
            APMStorage.set(CC_STORAGE_SET, cc);
          }
          const gen = APMStorage.get(APM_GENERAL_STORAGE) || {};
          if (gen.theme !== themeName) {
            gen.theme = themeName;
            APMStorage.set(APM_GENERAL_STORAGE, gen);
          }
        }
      };
    }
  });

  // src/core/ui-manager.js
  var ui_manager_exports = {};
  __export(ui_manager_exports, {
    UIManager: () => UIManager
  });
  var UIManager;
  var init_ui_manager = __esm({
    "src/core/ui-manager.js"() {
      init_logger();
      UIManager = /* @__PURE__ */ (function() {
        const localPanels = /* @__PURE__ */ new Set();
        let isInitialized = false;
        const getGlobalRegistry = () => {
          try {
            const root = window.top;
            if (!root._apmUi) {
              root._apmUi = {
                activePanelId: null,
                panels: /* @__PURE__ */ new Set(),
                triggers: /* @__PURE__ */ new Set(),
                lastTriggerTime: 0,
                version: 6
              };
            }
            return root._apmUi;
          } catch (e) {
            return window._apmUiFallback || { panels: /* @__PURE__ */ new Set(), triggers: /* @__PURE__ */ new Set(), lastTriggerTime: 0, activePanelId: null };
          }
        };
        function initUIManager() {
          if (isInitialized || window._apmUiInitialized) return;
          isInitialized = true;
          window._apmUiInitialized = true;
          const handleCloseSignal = (e) => {
            const data = e.detail || e.data;
            if (!data || data.type && data.type !== "APM_CLOSE_UI") return;
            const source = data.source || "unknown";
            const timestamp = data.timestamp || 0;
            const exemptId = data.exemptId;
            const isExplicit = data.explicit === true;
            const registry = getGlobalRegistry();
            registry.activePanelId = exemptId || null;
            if (!isExplicit && Date.now() - registry.lastTriggerTime < 80) {
              APMLogger.verbose("UIManager", `Suppressing auto-dismiss from ${source} (race condition guard)`);
              return;
            }
            _executeLocalClose(exemptId);
          };
          try {
            window.top.addEventListener("APM_CLOSE_UI", handleCloseSignal);
            window.addEventListener("message", (e) => {
              if (e.data?.type === "APM_CLOSE_UI") handleCloseSignal(e);
            });
          } catch (e) {
            window.addEventListener("APM_CLOSE_UI", handleCloseSignal);
            window.addEventListener("message", (e2) => {
              if (e2.data?.type === "APM_CLOSE_UI") handleCloseSignal(e2);
            });
          }
          hookFrame(window);
        }
        function toggle(panelId, openFn) {
          const registry = getGlobalRegistry();
          const now = Date.now();
          registry.lastTriggerTime = now;
          const isCurrentlyOpen = registry.activePanelId === panelId;
          if (isCurrentlyOpen) {
            APMLogger.debug("UIManager", `Toggling ${panelId} -> CLOSED`);
            closeAll(true);
          } else {
            APMLogger.debug("UIManager", `Toggling ${panelId} -> OPENING`);
            closeAll(true, panelId);
            if (typeof openFn === "function") {
              openFn();
              registry.activePanelId = panelId;
              try {
                window.top._apmUi.activePanelId = panelId;
              } catch (e) {
              }
            }
          }
        }
        function hookFrame(targetWin) {
          try {
            if (!targetWin || !targetWin.document) return;
            if (targetWin.document._apmUiListenerAttached) return;
            targetWin.document._apmUiListenerAttached = true;
            targetWin.document.addEventListener("mousedown", (e) => {
              const target = e.target;
              if (!target || !target.closest) return;
              const registry = getGlobalRegistry();
              const triggerSelector = Array.from(registry.triggers).find((s) => {
                try {
                  return target.closest(s);
                } catch (err) {
                  return false;
                }
              });
              if (triggerSelector) {
                registry.lastTriggerTime = Date.now();
                try {
                  window.top._apmUi.lastTriggerTime = Date.now();
                } catch (err) {
                }
                APMLogger.verbose("UIManager", `Trigger click detected: ${triggerSelector}`);
                return;
              }
              const isInsidePanel = target.closest(".apm-ui-panel") || Array.from(registry.panels).some((id) => {
                return targetWin.document.getElementById(id)?.contains(target);
              });
              const isSystem = target.closest(".swal2-container") || target.closest(".x-mask") || target.closest(".x-datepicker") || target.closest(".x-menu") || target.closest(".x-layer") || target.closest(".x-combo-list") || target.closest(".x-tip");
              const isFormElement = ["INPUT", "TEXTAREA", "SELECT", "OPTION"].includes(target.tagName) || target.closest("form");
              const className = typeof target.className === "string" ? target.className : target.className?.baseVal || "";
              if (APMLogger.isLevel("verbose")) {
                APMLogger.verbose("UIManager", `Click: inside=${!!isInsidePanel}, system=${!!isSystem} | target=${target.tagName}${target.id ? "#" + target.id : ""}`);
              }
              if (!isInsidePanel && !isSystem && !isFormElement) {
                closeAll();
              }
            }, true);
          } catch (err) {
          }
        }
        function registerPanel(panelId, triggerSelectors = []) {
          localPanels.add(panelId);
          const registry = getGlobalRegistry();
          registry.panels.add(panelId);
          triggerSelectors.forEach((s) => registry.triggers.add(s));
          const el2 = document.getElementById(panelId);
          if (el2) el2.classList.add("apm-ui-panel");
          APMLogger.verbose("UIManager", `Registered panel: ${panelId}`);
        }
        function addExternalHandler(handler) {
          if (typeof handler === "function") {
            const registry = getGlobalRegistry();
            if (!registry.handlers) registry.handlers = [];
            registry.handlers.push(handler);
          }
        }
        function closeAll(explicit = false, exemptId = null) {
          const registry = getGlobalRegistry();
          if (explicit) registry.lastTriggerTime = Date.now();
          if (!exemptId) registry.activePanelId = null;
          else registry.activePanelId = exemptId;
          const detail = {
            type: "APM_CLOSE_UI",
            source: window.location.pathname,
            timestamp: Date.now(),
            explicit,
            exemptId
          };
          try {
            window.top.dispatchEvent(new CustomEvent("APM_CLOSE_UI", { detail }));
          } catch (e) {
            window.dispatchEvent(new CustomEvent("APM_CLOSE_UI", { detail }));
          }
          try {
            const allWins = [window.top];
            try {
              for (let i = 0; i < window.top.frames.length; i++) {
                allWins.push(window.top.frames[i]);
              }
            } catch (err) {
            }
            allWins.forEach((w) => {
              try {
                w.postMessage(detail, "*");
              } catch (err) {
              }
            });
          } catch (e) {
          }
        }
        function _executeLocalClose(exemptId) {
          localPanels.forEach((id) => {
            if (exemptId && id === exemptId) return;
            const el2 = document.getElementById(id);
            if (el2 && (el2.style.display !== "none" || el2.style.visibility !== "hidden")) {
              APMLogger.debug("UIManager", `Hiding local panel: ${id}`);
              el2.style.display = "none";
              el2.style.visibility = "hidden";
            }
          });
          const registry = getGlobalRegistry();
          if (registry.handlers) {
            registry.handlers.forEach((h) => {
              try {
                h();
              } catch (err) {
              }
            });
          }
        }
        return {
          init: initUIManager,
          registerPanel,
          toggle,
          closeAll,
          hookFrame,
          addExternalHandler
        };
      })();
    }
  });

  // src/core/scheduler.js
  var scheduler_exports = {};
  __export(scheduler_exports, {
    APMScheduler: () => APMScheduler
  });
  var TaskScheduler, APMScheduler;
  var init_scheduler = __esm({
    "src/core/scheduler.js"() {
      init_logger();
      TaskScheduler = class {
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
         * @param {Object} options - { executeImmediately: boolean, isIdle: boolean }
         */
        registerTask(id, intervalMs, callback, options = {}) {
          const executeImmediately = !!options.executeImmediately;
          const isIdle = !!options.isIdle;
          this.tasks = this.tasks.filter((t) => t.id !== id);
          this.tasks.push({
            id,
            intervalMs,
            callback,
            isIdle,
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
              const runTask = () => {
                try {
                  task.callback();
                } catch (e) {
                  APMLogger.error("Scheduler", `Error in task '${task.id}':`, e);
                }
                task.lastRun = performance.now();
              };
              if (task.isIdle && typeof window.requestIdleCallback === "function") {
                window.requestIdleCallback(runTask, { timeout: 2e3 });
              } else {
                runTask();
              }
            } else {
              const timeRemaining = task.intervalMs - (now - task.lastRun);
              if (timeRemaining > 0 && timeRemaining < nextTickDelay) {
                nextTickDelay = timeRemaining;
              }
            }
          });
          this.timeoutId = setTimeout(() => {
            if (this.running) this.tick();
          }, Math.max(100, nextTickDelay));
        }
        /**
         * Execute a task immediately regardless of its interval
         * @param {string} id - Task identifier
         */
        runTaskNow(id) {
          const task = this.tasks.find((t) => t.id === id);
          if (task) {
            try {
              task.callback();
            } catch (e) {
              APMLogger.error("Scheduler", `Error in immediate task '${task.id}':`, e);
            }
            task.lastRun = performance.now();
          }
        }
      };
      APMScheduler = new TaskScheduler();
    }
  });

  // src/core/network.js
  async function apmFetch(url, options = {}) {
    const isCrossOrigin = !url.startsWith("/") && !url.includes(window.location.hostname);
    if (isCrossOrigin && typeof GM_xmlhttpRequest !== "undefined") {
      APMLogger.debug("Network", `Using GM_xmlhttpRequest for cross-origin request: ${url}`);
      return new Promise((resolve, reject) => {
        GM_xmlhttpRequest({
          method: options.method || "GET",
          url,
          headers: options.headers || {},
          data: options.body,
          cookie: options.credentials === "include" || options.credentials === "same-origin",
          onload: (res) => {
            const response = new Response(res.responseText, {
              status: res.status,
              statusText: res.statusText,
              headers: parseHeaders(res.responseHeaders)
            });
            response.clone = () => new Response(res.responseText, {
              status: res.status,
              statusText: res.statusText,
              headers: parseHeaders(res.responseHeaders)
            });
            resolve(response);
          },
          onerror: (err) => {
            APMLogger.error("Network", `GM_xmlhttpRequest error for ${url}:`, err);
            reject(new Error(`GM_xmlhttpRequest failed: ${err.statusText || "Unknown error"}`));
          },
          ontimeout: () => {
            APMLogger.error("Network", `GM_xmlhttpRequest timeout for ${url}`);
            reject(new Error("GM_xmlhttpRequest timeout"));
          }
        });
      });
    }
    APMLogger.debug("Network", `Using native fetch for request: ${url}`);
    return fetch(url, options);
  }
  function parseHeaders(headerStr) {
    const headers = new Headers();
    if (!headerStr) return headers;
    const lines = headerStr.split(/\r?\n/);
    for (const line of lines) {
      const parts = line.split(": ");
      if (parts.length >= 2) {
        const name = parts.shift().trim();
        const value = parts.join(": ").trim();
        headers.append(name, value);
      }
    }
    return headers;
  }
  var init_network = __esm({
    "src/core/network.js"() {
      init_logger();
    }
  });

  // src/modules/labor/labor-service.js
  var LaborService;
  var init_labor_service = __esm({
    "src/modules/labor/labor-service.js"() {
      init_state();
      init_utils();
      init_constants();
      init_logger();
      init_network();
      LaborService = /* @__PURE__ */ (function() {
        let laborCache = {
          data: [],
          lastFetch: 0,
          employee: ""
        };
        async function fetchData(targetEmployee, force = false) {
          const now = Date.now();
          const session = AppState.session;
          if (!force && laborCache.employee === targetEmployee && now - laborCache.lastFetch < 15e3 && laborCache.data.length > 0) {
            return laborCache.data;
          }
          if (!session.eamid || !targetEmployee) {
            APMLogger.warn("LaborService", "Missing session or employee for fetch");
            return [];
          }
          const url = "https://us1.eam.hxgnsmartcloud.com/web/base/WSBOOK.HDR.xmlhttp";
          const currentTenant = session.tenant || DEFAULT_TENANT;
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
            eamid: session.eamid,
            NUMBER_OF_ROWS_FIRST_RETURNED: "5000",
            MAX_ROWS: "5000",
            LIST_ALL_ROWS: "YES",
            FORCE_REQUERY: "YES"
          });
          try {
            const firstResp = await apmFetch(url, {
              method: "POST",
              headers: { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8", "X-Requested-With": "XMLHttpRequest" },
              body: payload.toString(),
              credentials: "include"
            });
            const firstText = await firstResp.text();
            const dataObj = extractJson(firstText);
            let allRecords = dataObj?.pageData?.grid?.GRIDRESULT?.GRID?.DATA || [];
            let metadata = dataObj?.pageData?.grid?.GRIDRESULT?.GRID?.METADATA || {};
            let nextCursor = parseInt(metadata.CURRENTCURSORPOSITION || allRecords.length) + 1;
            while (metadata.MORERECORDPRESENT === "+" && allRecords.length < 5e3) {
              const cacheUrl = "https://us1.eam.hxgnsmartcloud.com/web/base/GETCACHE";
              const cachePayload = new URLSearchParams({
                COMPONENT_INFO_TYPE: "DATA_ONLY",
                COMPONENT_INFO_TYPE_MODE: "CACHE",
                GRID_ID: "1742",
                GRID_NAME: "WSBOOK_HDR",
                DATASPY_ID: "100696",
                NUMBER_OF_ROWS_FIRST_RETURNED: "100",
                CURSOR_POSITION: nextCursor.toString(),
                SYSTEM_FUNCTION_NAME: "WSBOOK",
                USER_FUNCTION_NAME: "WSBOOK",
                eamid: session.eamid,
                tenant: currentTenant,
                employee: targetEmployee
              });
              const cacheResp = await apmFetch(cacheUrl, {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8", "X-Requested-With": "XMLHttpRequest" },
                body: cachePayload.toString(),
                credentials: "include"
              });
              const cacheText = await cacheResp.text();
              const cacheDataObj = extractJson(cacheText);
              const newRecords = cacheDataObj?.pageData?.grid?.GRIDRESULT?.GRID?.DATA || [];
              if (newRecords.length === 0) break;
              allRecords = allRecords.concat(newRecords);
              metadata = cacheDataObj?.pageData?.grid?.GRIDRESULT?.GRID?.METADATA || {};
              nextCursor = parseInt(metadata.CURRENTCURSORPOSITION || allRecords.length) + 1;
              await new Promise((r) => setTimeout(r, 0));
            }
            laborCache.data = allRecords;
            laborCache.employee = targetEmployee;
            laborCache.lastFetch = Date.now();
            return allRecords;
          } catch (err) {
            APMLogger.error("LaborService", "Fetch error:", err);
            if (err instanceof SyntaxError) {
              APMLogger.error("LaborService", "Session potentially expired or malformed response");
            }
            throw err;
          }
        }
        function extractJson(text) {
          if (!text) throw new Error("Empty response");
          if (text.trim().toLowerCase().startsWith("<!doctype") || text.includes("<html")) {
            APMLogger.error("LaborService", `HTML detected instead of JSON. Head: ${text.substring(0, 100).replace(/\n/g, " ")}`);
            throw new Error("SESSION_EXPIRED");
          }
          const start = text.indexOf("{");
          const end = text.lastIndexOf("}");
          if (start === -1 || end === -1 || end < start) {
            APMLogger.error("LaborService", `No JSON boundaries found. Text length: ${text.length}`);
            throw new Error("MALFORMED_RESPONSE");
          }
          const jsonStr = text.substring(start, end + 1);
          if (!jsonStr.includes('"pageData"') && !jsonStr.includes('"grid"')) {
            APMLogger.warn("LaborService", "JSON found but missing expected EAM markers");
          }
          try {
            return JSON.parse(jsonStr);
          } catch (e) {
            APMLogger.error("LaborService", `JSON Parse failed: ${e.message}. Snippet: ${jsonStr.substring(0, 100)}`);
            throw e;
          }
        }
        function calculateTally(records, daysParam) {
          const now = /* @__PURE__ */ new Date();
          now.setHours(0, 0, 0, 0);
          let total = 0;
          let breakdown = {};
          records.forEach((r) => {
            if (!r.datework) return;
            const rDate = parseEamDate(r.datework);
            if (!rDate) return;
            rDate.setHours(0, 0, 0, 0);
            const diffDays = Math.round((now - rDate) / (1e3 * 3600 * 24));
            const maxDaysAgo = daysParam - 1;
            if (diffDays <= maxDaysAgo && diffDays >= 0) {
              const hrs = parseFloat(r.hrswork);
              if (!isNaN(hrs)) {
                total += hrs;
                breakdown[r.datework] = (breakdown[r.datework] || 0) + hrs;
              }
            }
          });
          return { total, grandTotal: total, breakdown };
        }
        return {
          getData: fetchData,
          calculateTally,
          getCache: () => laborCache.data,
          invalidateCache: () => {
            laborCache.lastFetch = 0;
            laborCache.data = [];
          }
        };
      })();
    }
  });

  // src/modules/labor/labor-booker.js
  var labor_booker_exports = {};
  __export(labor_booker_exports, {
    LaborBooker: () => LaborBooker
  });
  var LaborBooker;
  var init_labor_booker = __esm({
    "src/modules/labor/labor-booker.js"() {
      init_utils();
      init_scheduler();
      init_logger();
      init_toast();
      init_state();
      init_constants();
      init_labor_service();
      init_ui_manager();
      init_storage();
      init_utils();
      LaborBooker = (function() {
        const laborWin = apmGetGlobalWindow();
        let isRunning2 = false;
        let isPreparing = false;
        let laborObservers = /* @__PURE__ */ new Map();
        let hoursPresets = ["0.1", "0.25", "0.5", "0.75", "1", "1.5", "2", "2.5", "3"];
        function checkTabAndInject(win) {
          if (!isWindowAccessible(win) || !win.Ext || !win.Ext.ComponentQuery) return;
          if (!win._apmAjaxHooked) {
            win._apmAjaxHooked = true;
            win.Ext.Ajax.on("beforerequest", (conn, options) => {
              if (!isWindowAccessible(win)) return;
              const popup = win.document.getElementById("apm-labor-popup");
              if (popup?.style.display === "none" && !isRunning2) return;
              const url = options.url || "";
              const params = options.params || {};
              const isSave = url.includes("pageaction=SAVE") && (url.includes("WSJOBS.BOO") || params.GRID_NAME === "WSJOBS_BOO");
              if (isSave) {
                APMLogger.debug("LaborBooker", "Hijacking Save Request to ensure Rate parameters.");
                const ensureParam = (key, val) => {
                  if (!params[key] || params[key] === "") params[key] = val;
                  if (typeof options.params === "string") {
                    const regex = new RegExp(`([&?]|^)${key}=([^&]*)`);
                    const match = options.params.match(regex);
                    if (match) {
                      if (match[2] === "") {
                        options.params = options.params.replace(regex, `$1${key}=${encodeURIComponent(val)}`);
                      }
                    } else {
                      const sep = options.params.includes("?") ? "&" : options.params.length > 0 ? "&" : "";
                      options.params += `${sep}${key}=${encodeURIComponent(val)}`;
                    }
                  }
                };
                const emp = params.employee || extractEmployee();
                ensureParam("employee", emp);
                ensureParam("octype", "N");
                ensureParam("ocrtype", "N");
                ensureParam("traderate", "0.00");
                ensureParam("ratedate", "0.|01/01/2020|01/01/2035");
                ensureParam("isdetailfieldchanged", "true");
              }
            });
          }
          try {
            const tabs = win.Ext.ComponentQuery.query("uxtabcontainer[itemId=BOO]:not([destroyed=true])");
            const booTab = tabs.find((t) => t.rendered && !t.isDestroyed && t.isVisible(true));
            if (!booTab) {
              const btn2 = win.document.getElementById("apm-quick-book-btn");
              if (btn2) btn2.remove();
              return;
            }
            const toolbar = booTab.down("toolbar");
            if (!toolbar || !toolbar.el || !toolbar.el.dom) return;
            const actionsBtn = win.Ext.ComponentQuery.query("button[text=Actions]:not([destroyed=true])", booTab)[0];
            if (!actionsBtn || !actionsBtn.el || !actionsBtn.el.dom) return;
            let btn = win.document.getElementById("apm-quick-book-btn");
            const parent = actionsBtn.el.dom.parentNode;
            if (!btn) {
              btn = win.document.createElement("button");
              btn.id = "apm-quick-book-btn";
              btn.innerHTML = "Quick Book \u26A1";
              btn.className = "apm-autofill-btn";
              Object.assign(btn.style, {
                padding: "4px 12px",
                background: "#e67e22",
                color: "white",
                border: "none",
                borderRadius: "4px",
                fontWeight: "bold",
                cursor: "pointer",
                fontSize: "11px",
                height: "24px",
                transition: "background 0.2s",
                boxShadow: "0 1px 3px rgba(0,0,0,0.2)"
              });
              btn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                UIManager.toggle("apm-labor-popup", () => {
                  APMLogger.debug("LaborBooker", "Quick Book button atomic toggle -> opening");
                  showQuickBookPopup(win, btn);
                  setTimeout(() => prepareForm(win), 300);
                });
              };
              parent.appendChild(btn);
            }
            const leftOffset = (actionsBtn.el.dom.offsetLeft || 0) + (actionsBtn.el.dom.offsetWidth || 0) + 10;
            Object.assign(btn.style, {
              position: "absolute",
              left: leftOffset + "px",
              top: "8px",
              zIndex: 10
            });
          } catch (e) {
          }
        }
        async function prepareForm(win) {
          if (isPreparing) return;
          isPreparing = true;
          try {
            if (!win.Ext) return;
            const ext = win.Ext;
            const booTab = ext.ComponentQuery.query("uxtabcontainer[itemId=BOO]:not([destroyed=true])").find((t) => t.rendered && !t.isDestroyed && t.isVisible(true));
            if (!booTab) return;
            const existingForm = ext.ComponentQuery.query("form:not([destroyed=true])", booTab)[0];
            const hasExistingBlank = existingForm && existingForm.getForm && existingForm.getForm().findField("employee")?.getValue();
            if (!hasExistingBlank) {
              const addBtn = ext.ComponentQuery.query('button[action=addRec]:not([destroyed=true]), button[tooltip="Add Record"]:not([destroyed=true])', booTab)[0];
              if (addBtn && !addBtn.disabled) {
                if (addBtn.handler) addBtn.handler.call(addBtn.scope || addBtn, addBtn);
                else addBtn.fireEvent("click", addBtn);
                await waitForAjax(win);
                await delay(200);
              }
            }
            const employee = extractEmployee();
            for (let i = 0; i < 15; i++) {
              await new Promise((r) => setTimeout(r, 0));
              const popup = win.document.getElementById("apm-labor-popup");
              if (popup && popup.style.display === "none") return;
              const formPanel = ext.ComponentQuery.query("form:not([destroyed=true])", booTab)[0];
              if (formPanel && formPanel.getForm) {
                const form = formPanel.getForm();
                const fEmp = form.findField("employee");
                const fAct = form.findField("booactivity");
                if (fEmp && !fEmp.getValue() && employee) {
                  ExtUtils.setFieldValue(form, "employee", employee, true);
                }
                if (fAct) {
                  await ExtUtils.ensureStoreLoaded(fAct, win);
                  if (fAct.store && fAct.store.getCount() > 0) {
                    if (ExtUtils.setFieldValue(form, "booactivity", "10", true)) break;
                  }
                }
              }
              await delay(400);
            }
          } catch (e) {
          } finally {
            isPreparing = false;
          }
        }
        async function showQuickBookPopup(win, anchorBtn) {
          let popup = win.document.getElementById("apm-labor-popup");
          if (!popup) {
            popup = win.document.createElement("div");
            popup.id = "apm-labor-popup";
            popup.className = "eam-fc-container apm-ui-panel";
            Object.assign(popup.style, {
              position: "fixed",
              zIndex: 1e6,
              width: "500px",
              padding: "15px",
              background: "#2c3e50",
              border: "2px solid #34495e",
              borderRadius: "10px",
              boxShadow: "0 8px 25px rgba(0,0,0,0.8)",
              display: "none",
              gap: "15px",
              color: "#ecf0f1",
              visibility: "hidden",
              userSelect: "none"
            });
            const formSide = win.document.createElement("div");
            formSide.style.cssText = "flex: 1; display: flex; flex-direction: column; gap: 10px;";
            const header = win.document.createElement("div");
            header.style.cssText = "display:flex; justify-content:space-between; align-items:center; margin-bottom: 2px;";
            header.innerHTML = `<h3 style="margin: 0; font-size: 16px; color: #1abc9c">Quick Book Labor</h3>`;
            const closeBtn = win.document.createElement("button");
            closeBtn.id = "apm-lb-close-x";
            closeBtn.innerHTML = "\u2716";
            closeBtn.style.cssText = "background:none; border:none; color:#7f8c8d; cursor:pointer; font-size:14px; padding: 4px;";
            closeBtn.onclick = () => UIManager.closeAll(true);
            header.appendChild(closeBtn);
            formSide.appendChild(header);
            const dateRow = win.document.createElement("div");
            dateRow.className = "eam-fc-row";
            dateRow.style.cssText += "; cursor: pointer; padding: 6px 10px; border: 1px solid #34495e; border-radius: 4px; transition: all 0.2s; background: rgba(0,0,0,0.1);";
            dateRow.innerHTML = `<label style="width: 50px; cursor: pointer; color: #bdc3c7; font-size: 11px;">Date:</label>`;
            const dateInput2 = win.document.createElement("input");
            dateInput2.id = "apm-lb-date";
            dateInput2.type = "date";
            dateInput2.style.cssText = "flex: 1; background: transparent; border: none; color: white; cursor: pointer; font-size: 12px; font-family: inherit;";
            dateRow.appendChild(dateInput2);
            dateRow.onclick = (e) => {
              if (e.target !== dateInput2) {
                if (dateInput2.showPicker) dateInput2.showPicker();
                else dateInput2.focus();
              }
            };
            dateRow.onmouseenter = () => {
              dateRow.style.borderColor = "#1abc9c";
              dateRow.style.background = "rgba(26, 188, 156, 0.05)";
            };
            dateRow.onmouseleave = () => {
              dateRow.style.borderColor = "#34495e";
              dateRow.style.background = "rgba(0,0,0,0.1)";
            };
            formSide.appendChild(dateRow);
            const hint = win.document.createElement("div");
            hint.style.cssText = "font-size: 10px; color: #95a5a6; margin: -4px 0 2px 0; font-style: italic; opacity: 0.8;";
            hint.innerHTML = "\u{1F4A1} Double-click a preset to book instantly";
            formSide.appendChild(hint);
            const presetBox = win.document.createElement("div");
            presetBox.style.cssText = "display:flex; flex-wrap:wrap; gap:4px; max-width: 250px;";
            hoursPresets.forEach((h) => {
              const b = win.document.createElement("button");
              b.innerHTML = h;
              b.style.cssText = "padding:5px 10px; background:#34495e; border:1px solid #45535e; color:white; border-radius:4px; cursor:pointer; font-size:11px; transition: all 0.2s;";
              b.onmouseenter = () => b.style.borderColor = "#1abc9c";
              b.onmouseleave = () => b.style.borderColor = "#45535e";
              b.onclick = () => {
                const input = win.document.getElementById("apm-lb-hours");
                const isCorr = win.document.getElementById("apm-lb-correction").checked;
                input.value = isCorr ? `-${h}` : h;
              };
              b.ondblclick = () => {
                const input = win.document.getElementById("apm-lb-hours");
                const isCorr = win.document.getElementById("apm-lb-correction").checked;
                const val = isCorr ? `-${h}` : h;
                input.value = val;
                const dInput = win.document.getElementById("apm-lb-date").value;
                const type = win.document.querySelector('input[name="lb-type"]:checked').value;
                UIManager.closeAll(true);
                setTimeout(() => {
                  showToast(`Booking ${val}h... \u23F3`, "#3498db");
                  executeBookingFlow({ hours: val, date: dInput, type }, win);
                }, 10);
              };
              presetBox.appendChild(b);
            });
            formSide.appendChild(presetBox);
            const hoursRow = win.document.createElement("div");
            hoursRow.className = "eam-fc-row";
            hoursRow.style.gap = "8px";
            const hoursInput2 = win.document.createElement("input");
            hoursInput2.id = "apm-lb-hours";
            hoursInput2.type = "text";
            hoursInput2.placeholder = "Hours...";
            hoursInput2.style.cssText = "flex: 1; height: 32px; background: #1c2833; border: 1px solid #34495e; border-radius: 4px; color: white; padding: 0 10px; font-size: 13px; outline: none; transition: border-color 0.2s;";
            hoursInput2.onfocus = () => hoursInput2.style.borderColor = "#1abc9c";
            hoursInput2.onblur = () => hoursInput2.style.borderColor = "#34495e";
            hoursRow.appendChild(hoursInput2);
            const corrLabel = win.document.createElement("label");
            corrLabel.id = "apm-lb-corr-label";
            corrLabel.style.cssText = "display:flex; align-items:center; gap:8px; padding: 6px 10px; background: rgba(231, 76, 60, 0.1); border: 1px solid #e74c3c; border-radius: 4px; cursor: pointer; transition: all 0.2s;";
            corrLabel.innerHTML = `
                <input id="apm-lb-correction" type="checkbox" style="cursor: pointer; width: 14px; height: 14px; margin: 0;">
                <span style="font-size:11px; color:#e74c3c; font-weight: bold; white-space: nowrap;">Subtract (-)</span>
            `;
            const corrCheck = corrLabel.querySelector("input");
            corrCheck.onchange = (e) => {
              const hVal = hoursInput2.value;
              if (e.target.checked) {
                corrLabel.style.background = "rgba(231, 76, 60, 0.25)";
                if (hVal && !hVal.startsWith("-")) hoursInput2.value = "-" + hVal;
                else if (!hVal) hoursInput2.value = "-";
              } else {
                corrLabel.style.background = "rgba(231, 76, 60, 0.1)";
                if (hVal.startsWith("-")) hoursInput2.value = hVal.replace("-", "");
              }
            };
            hoursRow.appendChild(corrLabel);
            formSide.appendChild(hoursRow);
            const typeRow = win.document.createElement("div");
            typeRow.className = "eam-fc-row";
            typeRow.style.cssText = "justify-content:center; gap:15px; margin-top:2px;";
            typeRow.innerHTML = `
                <label style="display:flex; align-items:center; gap:6px; cursor:pointer; font-size:12px; color: #bdc3c7;"><input type="radio" name="lb-type" value="N" style="margin:0; cursor:pointer;" checked>Normal</label>
                <label style="display:flex; align-items:center; gap:6px; cursor:pointer; font-size:12px; color: #bdc3c7;"><input type="radio" name="lb-type" value="O" style="margin:0; cursor:pointer;">Overtime</label>
            `;
            formSide.appendChild(typeRow);
            const bookBtn2 = win.document.createElement("button");
            bookBtn2.id = "apm-lb-book-btn";
            bookBtn2.innerHTML = "Book Labor \u26A1";
            bookBtn2.style.cssText = "padding:10px; background:#1abc9c; border:none; color:white; border-radius:6px; font-weight:bold; cursor:pointer; margin-top:5px; font-size:13px; transition: background 0.2s;";
            formSide.appendChild(bookBtn2);
            popup.appendChild(formSide);
            const sumSide = win.document.createElement("div");
            sumSide.style.cssText = "width: 170px; border-left: 1px solid #34495e; padding-left: 15px; display: flex; flex-direction: column; min-height: 230px;";
            sumSide.innerHTML = `
                <h4 style="margin: 0 0 10px 0; font-size: 13px; color: #95a5a6; text-transform: uppercase; letter-spacing: 1px;">Shift Summary</h4>
                <div id="apm-lb-sum-content" style="flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 8px;">
                    <div style="font-size: 12px; color: #7f8c8d; text-align: center; margin-top: 20px;">Fetching...</div>
                </div>
                <div style="border-top: 1px solid #34495e; padding-top: 10px; margin-top: 10px;">
                    <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 11px; color: #f1c40f;">
                        <input id="apm-lb-night-toggle" type="checkbox" ${APMStorage.get("apmNightShiftOn") === true ? "checked" : ""}>
                        Night Shift Mode \u{1F319}
                    </label>
                </div>
            `;
            popup.appendChild(sumSide);
            win.document.body.appendChild(popup);
            const nightToggle = win.document.getElementById("apm-lb-night-toggle");
            nightToggle.onchange = (e) => {
              APMStorage.set("apmNightShiftOn", e.target.checked);
              fetchLaborSummary(win);
            };
          }
          const dateInput = win.document.getElementById("apm-lb-date");
          const hoursInput = win.document.getElementById("apm-lb-hours");
          if (hoursInput) hoursInput.value = "";
          const compDate = extractCompletionDate(win);
          if (compDate) {
            const now = /* @__PURE__ */ new Date();
            const todayStr = getLocalIsoDate(now);
            if (compDate < todayStr) {
              if (dateInput) dateInput.value = compDate;
            } else {
              if (dateInput) dateInput.value = todayStr;
            }
          } else if (dateInput) dateInput.value = getLocalIsoDate();
          const titleEl = popup.querySelector("h3");
          const bookBtn = win.document.getElementById("apm-lb-book-btn");
          if (titleEl) titleEl.innerHTML = `Quick Book Labor`;
          if (bookBtn) {
            bookBtn.innerHTML = "Book Labor \u26A1";
            bookBtn.onclick = () => {
              const hRaw = hoursInput.value;
              if (!hRaw || hRaw === "-") return showToast("Enter hours!", "#e74c3c");
              const isCorrection = win.document.getElementById("apm-lb-correction").checked;
              const hours = isCorrection ? `-${Math.abs(hRaw)}` : Math.abs(hRaw).toString();
              const date = dateInput.value;
              const type = win.document.querySelector('input[name="lb-type"]:checked').value;
              UIManager.closeAll(true);
              setTimeout(() => {
                showToast(`Booking ${hours}h... \u23F3`, "#3498db");
                executeBookingFlow({ hours, date, type }, win);
              }, 10);
            };
          }
          popup.style.display = "flex";
          popup.style.visibility = "visible";
          try {
            const btnRect = anchorBtn.getBoundingClientRect();
            const popRect = popup.getBoundingClientRect();
            let left = btnRect.left + btnRect.width / 2 - popRect.width / 2;
            let top = btnRect.top - (popRect.height || 350) - 10;
            const margin = 15;
            if (left < margin) left = margin;
            if (left + popRect.width > win.innerWidth - margin) left = win.innerWidth - popRect.width - margin;
            if (top < margin) top = btnRect.bottom + 10;
            popup.style.top = top + "px";
            popup.style.left = left + "px";
          } catch (e) {
            popup.style.top = "50%";
            popup.style.left = "50%";
            popup.style.transform = "translate(-50%, -50%)";
          }
          setTimeout(() => fetchLaborSummary(win), 10);
        }
        async function fetchLaborSummary(win) {
          const content = win.document.getElementById("apm-lb-sum-content");
          if (!content) return;
          if (win.document.getElementById("apm-labor-popup")?.style.display === "none") return;
          const isNightShift = win.document.getElementById("apm-lb-night-toggle")?.checked;
          const employee = extractEmployee();
          if (!employee) return;
          try {
            const records = await LaborService.getData(employee);
            const now = /* @__PURE__ */ new Date();
            const todayStr = formatToEamDate(getLocalIsoDate(now));
            const yesterday = /* @__PURE__ */ new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yestStr = formatToEamDate(getLocalIsoDate(yesterday));
            let showYesterday = false;
            if (isNightShift) {
              const currentHour = (/* @__PURE__ */ new Date()).getHours();
              if (currentHour < 11) showYesterday = true;
            }
            const { total, breakdown } = LaborService.calculateTally(records, showYesterday ? 2 : 1);
            content.innerHTML = "";
            const datesToDisplay = showYesterday ? [todayStr, yestStr] : [todayStr];
            datesToDisplay.forEach((d) => {
              const val = breakdown[d] || 0;
              content.innerHTML += `<div style="display:flex; justify-content:space-between; font-size:13px; padding:4px 0; border-bottom:1px solid #34495e;">
                    <span style="color:#bdc3c7">${d === todayStr ? "Today" : "Yesterday"}</span> <strong style="color:#1abc9c">${val.toFixed(2)}h</strong>
                </div>`;
            });
            content.innerHTML += `<div style="margin-top:auto; padding-top:10px; font-weight:bold; font-size:15px; display:flex; justify-content:space-between; color:#ecf0f1;">
                <span>TOTAL</span> <span>${total.toFixed(2)}h</span>
            </div>`;
          } catch (err) {
            if (err.message === "SESSION_EXPIRED") {
              content.innerHTML = '<div style="font-size: 11px; color: #e74c3c; text-align: center; margin-top: 15px; padding: 0 10px;">Session Expired! \u{1F510}<br/>Please refresh EAM.</div>';
            } else {
              content.innerHTML = '<div style="font-size:11px; color:#7f8c8d; text-align:center; padding-top:20px;">No hours booked yet.</div>';
            }
          }
        }
        async function executeBookingFlow(data, win) {
          if (isRunning2) return;
          isRunning2 = true;
          try {
            let targetWin = win;
            let targetExt = win.Ext;
            let booTab = null;
            const wins = getExtWindows();
            for (const w of wins.includes(win) ? [win, ...wins.filter((x) => x !== win)] : wins) {
              try {
                if (isWindowAccessible(w) && w.Ext && w.Ext.ComponentQuery) {
                  const found = w.Ext.ComponentQuery.query("uxtabcontainer[itemId=BOO]:not([destroyed=true])")[0];
                  if (found && !found.isDestroyed) {
                    booTab = found;
                    targetWin = w;
                    targetExt = w.Ext;
                    break;
                  }
                }
              } catch (e) {
              }
            }
            if (!booTab) throw new Error("Book Labor tab (BOO) not found");
            const tabPanel = booTab.up("tabpanel:not([destroyed=true])");
            if (tabPanel && tabPanel.getActiveTab && tabPanel.getActiveTab() !== booTab) {
              tabPanel.setActiveTab(booTab);
              await delay(500);
            }
            const addBtn = targetExt.ComponentQuery.query('button[action=addRec]:not([destroyed=true]), button[tooltip="Add Record"]:not([destroyed=true])', booTab)[0];
            const existingForm = targetExt.ComponentQuery.query("form:not([destroyed=true])", booTab)[0];
            const isFilled = existingForm && existingForm.getForm && existingForm.getForm().findField("employee")?.getValue();
            if (!isFilled && addBtn && !addBtn.disabled) {
              if (addBtn.handler) addBtn.handler.call(addBtn.scope || addBtn, addBtn);
              else addBtn.fireEvent("click", addBtn);
              if (isWindowAccessible(targetWin)) {
                await waitForAjax(targetWin);
              }
              await delay(300);
            }
            const employee = extractEmployee();
            const eamDate = formatToEamDate(data.date);
            const targetHours = String(data.hours || "0.25");
            const targetType = data.type || "N";
            APMLogger.debug("LaborBooker", `Starting flow for field injection. Emp: ${employee}, Hrs: ${targetHours}, Type: ${targetType}`);
            let injectionSuccess = false;
            for (let i = 0; i < 20; i++) {
              const formPanel = targetExt.ComponentQuery.query("form:not([destroyed=true])", booTab)[0];
              if (formPanel && formPanel.getForm && formPanel.getForm()) {
                const form = formPanel.getForm();
                if (!form.findField("employee")?.getValue() && employee) {
                  ExtUtils.setFieldValue(form, "employee", employee, true);
                  await delay(150);
                }
                ExtUtils.setFieldValue(form, "datework", eamDate);
                ExtUtils.setFieldValue(form, "hrswork", targetHours);
                await ExtUtils.ensureStoreLoaded(form.findField("octype"), targetWin);
                ExtUtils.setFieldValue(form, "octype", targetType, true);
                const fOcrType = form.findField("ocrtype");
                if (fOcrType && !fOcrType.getValue()) {
                  ExtUtils.setFieldValue(form, "ocrtype", targetType);
                }
                const fAct = form.findField("booactivity");
                await ExtUtils.ensureStoreLoaded(fAct, targetWin);
                ExtUtils.setFieldValue(form, "booactivity", "10", true);
                const fRate = form.findField("rate") || form.findField("laborrate") || form.findField("traderate") || form.findField("costrate") || form.findField("trarate");
                const fRD = form.findField("ratedate");
                if (fRate) {
                  const rVal = fRate.getValue();
                  const isBlank = rVal === null || rVal === void 0 || rVal === "" || rVal === 0;
                  if (isBlank) {
                    if (fRate.onTriggerClick && i < 3) {
                      fRate.onTriggerClick();
                      await waitForAjax(targetWin);
                    } else {
                      ExtUtils.setFieldValue(form, fRate.name, "0.00");
                      if (fRD) ExtUtils.setFieldValue(form, "ratedate", "0.|01/01/2020|01/01/2035");
                    }
                  }
                }
                const fDetail = form.findField("isdetailfieldchanged");
                if (fDetail) ExtUtils.setFieldValue(form, "isdetailfieldchanged", "true");
                const finalEmp = form.findField("employee")?.getValue();
                const finalHrs = form.findField("hrswork")?.getValue();
                const finalType = form.findField("octype")?.getValue();
                const finalAct = form.findField("booactivity")?.getValue();
                const finalRate = fRate ? fRate.getValue() : "N/A";
                const isRateOk = finalRate !== null && finalRate !== void 0 && finalRate !== "" || !fRate;
                if (finalEmp && finalHrs && finalType && finalAct && isRateOk) {
                  const record = formPanel.getRecord();
                  if (record) {
                    form.getFields().each((f) => {
                      if (f.getName() && f.getValue() !== record.get(f.getName())) {
                        record.set(f.getName(), f.getValue());
                      }
                    });
                    if (fRate && (!record.get(fRate.name) && record.get(fRate.name) !== 0)) {
                      record.set(fRate.name, "0.00");
                    }
                    if (fOcrType && !record.get("ocrtype")) record.set("ocrtype", targetType);
                    if (form.updateRecord) form.updateRecord(record);
                    record.commit();
                  }
                  injectionSuccess = true;
                  break;
                }
              }
              await delay(400);
            }
            if (!injectionSuccess) throw new Error("Fields failed to stick (EAM Cascade/Clear)");
            let saveBtn = targetExt.ComponentQuery.query("button[action=saveRec]:not([destroyed=true]), button.uft-id-saverec:not([destroyed=true])", booTab)[0];
            if (!saveBtn) {
              saveBtn = targetExt.ComponentQuery.query("button[action=saveRec]:not([destroyed=true]), button.uft-id-saverec:not([destroyed=true])").find((b) => b.rendered && !b.isHidden());
            }
            if (saveBtn) {
              const formPanel = targetExt.ComponentQuery.query("form:not([destroyed=true])", booTab)[0];
              if (formPanel && formPanel.getForm && !formPanel.getForm().isValid()) {
                APMLogger.warn("LaborBooker", "Form invalid before save, attempting to force it...");
                formPanel.getForm().getFields().each((f) => {
                  if (f.validate && !f.validate()) {
                    APMLogger.debug("LaborBooker", `Invalid field: ${f.name} - Errors: ${JSON.stringify(f.getErrors())}`);
                  }
                });
              }
              APMLogger.debug("LaborBooker", "Executing Save...");
              if (saveBtn.handler) saveBtn.handler.call(saveBtn.scope || saveBtn, saveBtn);
              else saveBtn.fireEvent("click", saveBtn);
              showToast("Labor Sent! \u26A1", "#1abc9c");
              setTimeout(() => {
                LaborService.invalidateCache();
                window.dispatchEvent(new CustomEvent("APM_LABOR_SYNC", { detail: { source: "quick-book" } }));
              }, 800);
            } else throw new Error("Save button not found");
          } catch (e) {
            APMLogger.error("LaborBooker", "executeBookingFlow Error:", e);
            showToast("Error: " + e.message, "#e74c3c");
          } finally {
            isRunning2 = false;
          }
        }
        function extractEmployee() {
          const cleanId = (id) => (id && id.includes("@") ? id.split("@")[0] : id || "").toUpperCase();
          const session = AppState.session;
          if (session.user) return cleanId(session.user);
          const stored = APMStorage.get("apmLastKnownEmpId");
          if (stored) {
            session.user = cleanId(stored);
            return session.user;
          }
          const win = apmGetGlobalWindow();
          let emp = win.EAM?.Context?.sessionUserID || win.top?.EAM?.Context?.sessionUserID;
          if (!emp) {
            try {
              const userEl = document.querySelector(".x-btn-inner-user-menu-small");
              if (userEl) emp = userEl.textContent.trim();
            } catch (e) {
            }
          }
          if (emp) {
            const clean = (emp.includes("@") ? emp.split("@")[0] : emp).toUpperCase();
            session.user = clean;
            APMStorage.set("apmLastKnownEmpId", clean);
            return clean;
          }
          return "";
        }
        function extractCompletionDate(win) {
          if (!win.Ext) return null;
          try {
            const hdrTab = win.Ext.ComponentQuery.query("uxtabcontainer[itemId=HDR]")[0];
            if (!hdrTab) return null;
            const formPanel = hdrTab.down("form");
            if (!formPanel) return null;
            const record = formPanel.getRecord();
            if (!record) return null;
            let compVal = record.get("datecompleted");
            if (!compVal) return null;
            if (compVal instanceof Date) return getLocalIsoDate(compVal);
            if (typeof compVal === "string") {
              const parts = compVal.split(" ")[0].split("/");
              if (parts.length === 3) return `${parts[2]}-${parts[0].padStart(2, "0")}-${parts[1].padStart(2, "0")}`;
            }
          } catch (e) {
          }
          return null;
        }
        function initLaborObserver(win) {
          if (!isWindowAccessible(win)) return;
          const doc = win.document;
          if (!doc || laborObservers.has(doc)) return;
          APMLogger.debug("LaborBooker", "Setting up Reactive Observer for:", win.location.href);
          const observer = new MutationObserver((mutations) => {
            let shouldCheck = false;
            for (const m of mutations) {
              if (m.type === "childList") {
                const hasRelevant = Array.from(m.addedNodes).some(
                  (n) => n.nodeType === 1 && (n.tagName === "DIV" || n.tagName === "IFRAME")
                );
                if (hasRelevant) {
                  shouldCheck = true;
                  break;
                }
              }
            }
            if (shouldCheck) {
              checkTabAndInject(win);
            }
          });
          observer.observe(doc.body || doc.documentElement, { childList: true, subtree: true });
          laborObservers.set(doc, observer);
          checkTabAndInject(win);
        }
        return {
          init: function(win) {
            const targetWin = win || laborWin;
            initLaborObserver(targetWin);
            UIManager.registerPanel("apm-labor-popup", ["#apm-quick-book-btn", ".apm-autofill-btn"]);
            window.addEventListener("APM_SESSION_UPDATED", () => {
              if (!isWindowAccessible(targetWin)) return;
              const p = targetWin.document.getElementById("apm-labor-popup");
              if (p && p.style.visibility === "visible") fetchLaborSummary(targetWin);
            });
            window.addEventListener("APM_LABOR_SYNC", () => {
              if (!isWindowAccessible(targetWin)) return;
              const p = targetWin.document.getElementById("apm-labor-popup");
              if (p && p.style.visibility === "visible") LaborService.invalidateCache();
            });
          },
          checkTabAndInject,
          checkAll: function() {
            const wins = getExtWindows();
            const docs = wins.filter(isWindowAccessible).map((w) => w.document);
            for (const [doc, obs] of laborObservers.entries()) {
              if (!docs.includes(doc)) {
                try {
                  obs.disconnect();
                } catch (e) {
                }
                laborObservers.delete(doc);
                APMLogger.debug("LaborBooker", "Observer pruned during checkAll");
              }
            }
            wins.forEach((win) => {
              try {
                initLaborObserver(win);
              } catch (e) {
              }
            });
          },
          quickBookHours: async function(hours, win) {
            return executeBookingFlow({ hours, date: /* @__PURE__ */ new Date(), type: "N" }, win);
          }
        };
      })();
    }
  });

  // src/index.js
  init_logger();
  init_toast();

  // src/core/theme-enforcer.js
  init_constants();
  init_logger();
  init_theme_resolver();
  function enforceTheme(targetWin = window, targetDoc = document) {
    const isDarkHint = targetDoc.cookie.includes("apm_theme_hint=dark");
    const isEAM2 = targetWin.location.hostname.includes("hxgnsmartcloud.com");
    const isPTP2 = /amazon\.dev|insights/i.test(targetWin.location.hostname);
    const isIDP = targetWin.location.hostname.includes("federate.amazon.com");
    const isSubmit = targetDoc.title === "Submit Form";
    const hasSSO = targetWin.location.hostname.includes("sso.");
    const hasSAML = targetWin.location.href.includes("saml");
    const isTransition = isIDP || isSubmit || (hasSSO || hasSAML) && !isEAM2 && !isPTP2;
    if (isDarkHint && (isTransition || hasSSO || hasSAML || targetDoc.cookie.includes("apm_transition_active=1"))) {
      try {
        if (typeof GM_addStyle !== "undefined") {
          GM_addStyle(`
                    html, body { background-color: #000 !important; color-scheme: dark !important; color: #eee !important; transition: none !important; }
                    #apm-nuclear-shield, #apm-unload-blackout { 
                        position: fixed !important; top: 0 !important; left: 0 !important; 
                        width: 100vw !important; height: 100vh !important; 
                        background: #000 !important; z-index: 2147483647 !important; 
                        pointer-events: none !important; transition: opacity 0.2s ease !important; 
                    }
                `);
        }
        if (!targetDoc.querySelector('meta[name="color-scheme"]')) {
          if (typeof GM_addElement !== "undefined") {
            GM_addElement(targetDoc.head || targetDoc.documentElement, "meta", { name: "color-scheme", content: "dark" });
          }
        }
        if (targetWin === targetWin.top && !targetDoc.getElementById("apm-nuclear-shield")) {
          if (typeof GM_addElement !== "undefined") {
            GM_addElement(targetDoc.documentElement, "div", { id: "apm-nuclear-shield" });
          }
        }
        const locker = new MutationObserver(() => {
          if (typeof GM_addStyle !== "undefined") {
            GM_addStyle("html { background-color: #000 !important; }");
          }
        });
        locker.observe(targetDoc.documentElement, { attributes: true, attributeFilter: ["style"] });
        if (isIDP) {
          setTimeout(() => {
            const shield = targetDoc.getElementById("apm-nuclear-shield");
            if (shield && !targetDoc.getElementById("apm-sso-rescue")) {
              const rescue = targetDoc.createElement("div");
              rescue.id = "apm-sso-rescue";
              rescue.innerHTML = `<a href="https://us1.eam.hxgnsmartcloud.com/web/base/logindisp?tenant=${DEFAULT_TENANT}" 
                            style="color:#3498db; text-decoration:underline; font-family:sans-serif; font-size:14px; pointer-events:auto; cursor:pointer; font-weight:bold;">
                            Stuck? Click here to return to EAM
                        </a>`;
              rescue.style.cssText = "position:fixed; bottom:20px; left:50%; transform:translateX(-50%); z-index:2147483647; text-align:center; padding:10px; background:rgba(0,0,0,0.7); border-radius:8px;";
              shield.appendChild(rescue);
              if (targetWin === targetWin.top) {
                APMLogger.info("APM Master", "SSO Safety Net deployed.");
              }
            }
          }, 1e4);
        }
      } catch (e) {
      }
    }
    if (!isIDP) {
      setTimeout(() => {
        const shield = targetDoc.getElementById("apm-nuclear-shield");
        if (shield) {
          APMLogger.warn("APM Master", "Nuclear Shield safety timeout triggered.");
          shield.style.opacity = "0";
          setTimeout(() => shield.remove(), 450);
        }
      }, 5e3);
    }
    if (targetWin === targetWin.top && !targetWin.__apmUnloadBound) {
      targetWin.addEventListener("beforeunload", () => {
        if (isDarkHint) {
          const baseDomain = targetWin.location.hostname.split(".").slice(-2).join(".");
          targetDoc.cookie = `apm_transition_active=1; path=/; domain=.${baseDomain}; max-age=5; SameSite=Lax`;
          try {
            if (typeof GM_addElement !== "undefined") {
              GM_addElement(targetDoc.documentElement, "div", { id: "apm-unload-blackout" });
            }
          } catch (e) {
          }
        }
      });
      targetWin.__apmUnloadBound = true;
    }
    if (isIDP || isSubmit && !isEAM2) {
      APMLogger.debug("APM Master", `Transition Shield Active (CSP-Safe Terminator) on ${targetWin.location.hostname}`);
      return;
    }
    if (!isEAM2 && !isPTP2) return;
    targetWin.__apmThemeState = targetWin.__apmThemeState || {
      activeTheme: null,
      sentinelActive: false,
      flashGuardApplied: true
    };
    const state = targetWin.__apmThemeState;
    const clearGuards = () => {
      const guards = ["apm-global-flash-guard", "apm-total-blackout-shield", "apm-nuclear-shield", "apm-unload-blackout", "apm-flash-prevent"];
      for (const id of guards) {
        const el2 = targetDoc.getElementById(id);
        if (el2) {
          if (id.includes("shield") || id.includes("blackout")) {
            el2.style.opacity = "0";
            setTimeout(() => el2.remove(), 250);
          } else {
            el2.remove();
          }
        }
      }
      targetDoc.cookie = "apm_transition_active=0; path=/; domain=.hxgnsmartcloud.com; max-age=0; SameSite=Lax";
    };
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
                  APMLogger.debug("APM Master", `Sticky Manifest: Redirecting "${v}" -> "${manifestPath}"`);
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
              APMLogger.debug("APM Master", `CSS Sentinel: Flipping ${node.href} -> ${newHref}`);
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
      if (isDark) {
        targetDoc.cookie = "apm_theme_hint=dark; path=/; domain=.hxgnsmartcloud.com; max-age=31536000; SameSite=Lax";
      } else {
        targetDoc.cookie = "apm_theme_hint=default; path=/; domain=.hxgnsmartcloud.com; max-age=31536000; SameSite=Lax";
      }
      if (targetWin === targetWin.top) {
        APMLogger.info("APM Master", `Theme Applied: ${themeName}`);
      }
      clearGuards();
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
    let startTheme = ThemeResolver.getPreferredTheme();
    if (startTheme !== "default") {
      if (targetWin === targetWin.top) {
        APMLogger.info("APM Master", `Theme Enforcer: Detected "${startTheme}"`);
      }
      applyEnforcer(startTheme);
    } else {
      clearGuards();
      if (targetWin !== targetWin.top) {
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
    }
    if (!targetWin.localStorage.__apmSetItemPatched) {
      try {
        const _set = targetWin.localStorage.setItem;
        targetWin.localStorage.setItem = function(k, v) {
          const r = _set.apply(this, arguments);
          if (k === "ApmGeneralSettings" || k === APM_GENERAL_STORAGE || k === CC_STORAGE_SET || k === KEY_THEME) {
            const next = ThemeResolver.getPreferredTheme();
            if (next !== "default") {
              applyEnforcer(next);
              for (let i = 0; i < targetWin.frames.length; i++) {
                try {
                  targetWin.frames[i].postMessage({ type: "APM_SET_THEME", value: next }, "*");
                } catch (err) {
                }
              }
            } else {
              clearGuards();
            }
          }
          return r;
        };
        targetWin.localStorage.__apmSetItemPatched = true;
      } catch (e) {
      }
    }
  }

  // src/index.js
  init_state();

  // src/core/boot-manager.js
  init_logger();
  var BootManagerClass = class {
    constructor() {
      this.states = {
        dom: false,
        settings: false,
        extjs: false,
        ready: false
      };
      this.callbacks = [];
      this.startTime = performance.now();
    }
    /**
     * Mark a state as ready and check if we can boot
     */
    markReady(key) {
      if (this.states[key] === true) return;
      this.states[key] = true;
      APMLogger.debug("BootManager", `State marked ready: ${key}`);
      this.checkReady();
    }
    /**
     * Register a callback to run when all states are ready
     */
    onBoot(callback) {
      if (this.ready) {
        callback();
      } else {
        this.callbacks.push(callback);
      }
    }
    checkReady() {
      if (this.states.dom && this.states.settings && this.states.extjs && !this.states.ready) {
        this.states.ready = true;
        const duration = (performance.now() - this.startTime).toFixed(2);
        APMLogger.info("BootManager", `All dependencies met. Booting now... (${duration}ms)`);
        this.callbacks.forEach((cb) => {
          try {
            cb();
          } catch (e) {
            APMLogger.error("BootManager", "Error during module boot:", e);
          }
        });
        this.callbacks = [];
      }
    }
    /**
     * Helper to wait for ExtJS if it's expected but not yet loaded
     */
    waitForExt(win = window, maxWait = 5e3) {
      const isLanding = win.location.hostname.includes("octave.com") || win.location.hostname.includes("hexagon.com");
      if (isLanding) {
        APMLogger.debug("BootManager", "Landing page detected, skipping ExtJS wait.");
        this.markReady("extjs");
        return;
      }
      const start = Date.now();
      const check = () => {
        let ext = null;
        try {
          ext = win.Ext || window.top && window.top.Ext;
        } catch (e) {
          ext = win.Ext;
        }
        if (ext && ext.isReady) {
          this.markReady("extjs");
        } else if (Date.now() - start < maxWait) {
          if (ext && Date.now() - start > 1e3) {
            APMLogger.info("BootManager", "ExtJS detected but isReady stalled > 1s. Proceeding eager.");
            this.markReady("extjs");
            return;
          }
          setTimeout(check, 20);
        } else {
          if (ext) {
            APMLogger.info("BootManager", "ExtJS detected but isReady stalled. Proceeding.");
          } else {
            APMLogger.warn("BootManager", "ExtJS not detected. Proceeding anyway.");
          }
          this.markReady("extjs");
        }
      };
      check();
    }
  };
  var BootManager = new BootManagerClass();

  // src/modules/autofill/autofill-prefs.js
  init_state();
  init_constants();
  init_logger();
  init_storage();
  function loadPresets() {
    try {
      const parsed = APMStorage.get(PRESET_STORAGE_KEY);
      if (parsed) {
        if (parsed.autofill) AppState.autofill.presets.autofill = parsed.autofill;
        if (parsed.config) AppState.autofill.presets.config = parsed.config;
      }
    } catch (e) {
      APMLogger.warn("Autofill", "Failed to load presets", e);
    }
  }
  function savePresets() {
    APMStorage.set(PRESET_STORAGE_KEY, AppState.autofill.presets);
  }
  function getPresets() {
    return JSON.parse(JSON.stringify(AppState.autofill.presets));
  }
  function updatePresetConfig(updates) {
    AppState.autofill.presets.config = { ...AppState.autofill.presets.config, ...updates };
    savePresets();
    window.dispatchEvent(new CustomEvent("APM_PRESETS_SYNC_REQUIRED"));
  }
  function updatePresetAutofill(name, data) {
    if (data === null) {
      delete AppState.autofill.presets.autofill[name];
    } else {
      AppState.autofill.presets.autofill[name] = data;
    }
    savePresets();
    window.dispatchEvent(new CustomEvent("APM_PRESETS_SYNC_REQUIRED"));
  }
  function getIsAutoFillRunning() {
    return AppState.autofill.isAutoFillRunning;
  }
  function setIsAutoFillRunning(val) {
    AppState.autofill.isAutoFillRunning = val;
  }

  // src/modules/colorcode/colorcode-prefs.js
  init_state();
  init_constants();
  init_logger();
  init_storage();
  function loadColorCodePrefs() {
    try {
      const storedRules = APMStorage.get(CC_STORAGE_RULES);
      if (storedRules) {
        AppState.colorCode.rules = storedRules;
      }
      const storedSet = APMStorage.get(CC_STORAGE_SET);
      if (storedSet) {
        AppState.colorCode.settings = { ...AppState.colorCode.settings, ...storedSet };
      }
      Promise.resolve().then(() => (init_theme_resolver(), theme_resolver_exports)).then(({ ThemeResolver: ThemeResolver2 }) => {
        AppState.colorCode.settings.theme = ThemeResolver2.getPreferredTheme();
      });
    } catch (e) {
      APMLogger.warn("ColorCode", "Failed to load preferences", e);
    }
  }
  function saveColorCodeRules() {
    APMStorage.set(CC_STORAGE_RULES, AppState.colorCode.rules);
  }
  function saveColorCodeSettings() {
    APMStorage.set(CC_STORAGE_SET, AppState.colorCode.settings);
  }
  function getRules() {
    return JSON.parse(JSON.stringify(AppState.colorCode.rules));
  }
  function setRules(newRules) {
    AppState.colorCode.rules = newRules;
    saveColorCodeRules();
    window.dispatchEvent(new CustomEvent("APM_CC_SYNC_REQUIRED"));
  }
  function getSettings() {
    return { ...AppState.colorCode.settings };
  }
  function setSettings(updates) {
    AppState.colorCode.settings = { ...AppState.colorCode.settings, ...updates };
    saveColorCodeSettings();
    window.dispatchEvent(new CustomEvent("APM_CC_SYNC_REQUIRED"));
  }

  // src/modules/forecast/forecast-engine.js
  init_utils();

  // src/modules/forecast/forecast-prefs.js
  init_constants();
  init_logger();
  init_storage();
  var savedOrgs = [];
  var selectedOrg = "";
  var savedProfiles = [];
  var selectedProfileId = "";
  function setSavedOrgs(orgs) {
    savedOrgs = orgs;
  }
  function setSelectedOrg(org) {
    selectedOrg = org;
  }
  function setSavedProfiles(profiles) {
    savedProfiles = profiles;
  }
  function setSelectedProfileId(id) {
    selectedProfileId = id;
  }
  function loadPreferences() {
    try {
      const prefs = APMStorage.get(STORAGE_KEY);
      if (prefs) {
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
        const profilesToLoad = prefs.customProfiles || prefs.profiles || prefs.dataspys;
        if (profilesToLoad && Array.isArray(profilesToLoad)) {
          savedProfiles = profilesToLoad;
        } else {
          savedProfiles = [];
        }
        selectedProfileId = prefs.selectedProfileId || "";
        return prefs;
      }
    } catch (e) {
      APMLogger.warn("Forecast", "Failed to load preferences:", e);
    }
    savedOrgs = [];
    selectedOrg = "";
    return null;
  }
  function saveAllPreferences() {
    const orgSelect = document.getElementById("eam-org-select");
    selectedOrg = orgSelect ? orgSelect.value : "";
    let prefsToSave = {
      orgs: savedOrgs,
      selectedOrg,
      customProfiles: savedProfiles,
      selectedProfileId
    };
    const weekSelect = document.getElementById("eam-week-select");
    if (weekSelect) prefsToSave.week = weekSelect.value;
    prefsToSave.days = Array.from(document.querySelectorAll('#eam-day-checkboxes input[type="checkbox"]')).map((cb) => cb.dataset.explicit === "true");
    const assignedText = document.getElementById("eam-assigned-text");
    if (assignedText) prefsToSave.assignedText = assignedText.value.trim();
    const eqText = document.getElementById("eam-eq-text");
    if (eqText) prefsToSave.eqText = eqText.value.trim();
    const eqdescText = document.getElementById("eam-eqdesc-text");
    if (eqdescText) prefsToSave.eqdescText = eqdescText.value.trim();
    const typeText = document.getElementById("eam-type-text");
    if (typeText) prefsToSave.typeText = typeText.value.trim();
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
      APMStorage.set(STORAGE_KEY, prefsToSave);
    } catch (e) {
      APMLogger.error("Forecast", "Failed to save preferences:", e);
    }
  }

  // src/modules/forecast/forecast-engine.js
  init_logger();

  // src/core/status.js
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

  // src/modules/forecast/forecast-engine.js
  init_ui_manager();
  var isRunning = false;
  var isStopped = false;
  var currentMode = "normal";
  function initAjaxInterceptors() {
    for (const win of getExtWindows()) {
      if (win.Ext && !win._apmForecastAjaxHook) {
        win._apmForecastAjaxHook = true;
        win.Ext.Ajax.on("beforerequest", (conn, options) => {
          const url = options.url || "";
          const params = options.params || {};
          const isGridData = url.includes("GRIDDATA") || url.includes(".xmlhttp") || params.GRID_NAME;
          if (!isGridData) return;
          const topDoc = window.top.document;
          const profSelect = topDoc.getElementById("eam-profile-select");
          const profId = profSelect?.value;
          const isWorkOrderSearch = url.includes("WSJOBS.xmlhttp") || params.GRID_NAME === "WSJOBS";
          const isCacheRequest = url.includes("GETCACHE") || typeof params === "string" && params.includes("COMPONENT_INFO_TYPE_MODE=CACHE") || params.COMPONENT_INFO_TYPE_MODE === "CACHE";
          if (!isRunning) return;
          if (isWorkOrderSearch && !isCacheRequest) {
            let maddonParams = null;
            const skipManual = ["today", "quick", "clear"].includes(currentMode);
            if (profId && profId !== "manual") {
              const activeProfile = savedProfiles.find((p) => p.id === profId);
              if (activeProfile) {
                APMLogger.debug("Forecast", `Injecting MADDON filters for profile: ${activeProfile.name}`);
                maddonParams = buildMaddonFilters(activeProfile);
              }
            } else if (!skipManual) {
              const descVal = topDoc.getElementById("eam-desc-text")?.value?.trim();
              const descOp = topDoc.getElementById("eam-desc-op")?.value;
              let manualDesc = descVal;
              if (descVal && descOp === "Does Not Contain") {
                manualDesc = descVal.split(",").map((s) => s.trim()).filter((s) => s).map((s) => s.startsWith("!") ? s : "!" + s).join(", ");
              }
              const manualProf = {
                desc: manualDesc
              };
              if (manualProf.desc) {
                APMLogger.debug("Forecast", "Injecting manual MADDON filters");
                maddonParams = buildMaddonFilters(manualProf);
              }
            }
            if (maddonParams) {
              const currentParams = typeof options.params === "object" ? options.params : typeof options.params === "string" ? Object.fromEntries(new URLSearchParams(options.params)) : {};
              let maxSeq = 0;
              Object.keys(currentParams).forEach((k) => {
                const match = k.match(/MADDON_FILTER_SEQNUM_(\d+)/);
                if (match) maxSeq = Math.max(maxSeq, parseInt(match[1], 10));
              });
              const shiftedMaddon = {};
              let ourSeqOffset = maxSeq;
              const filters = [];
              let i = 1;
              while (maddonParams[`MADDON_FILTER_ALIAS_NAME_${i}`]) {
                filters.push({
                  ALIAS: maddonParams[`MADDON_FILTER_ALIAS_NAME_${i}`],
                  OPERATOR: maddonParams[`MADDON_FILTER_OPERATOR_${i}`],
                  VALUE: maddonParams[`MADDON_FILTER_VALUE_${i}`],
                  JOINER: maddonParams[`MADDON_FILTER_JOINER_${i}`],
                  LPAREN: maddonParams[`MADDON_LPAREN_${i}`],
                  RPAREN: maddonParams[`MADDON_RPAREN_${i}`]
                });
                i++;
              }
              filters.forEach((f, idx) => {
                const s = ourSeqOffset + idx + 1;
                shiftedMaddon[`MADDON_FILTER_ALIAS_NAME_${s}`] = f.ALIAS;
                shiftedMaddon[`MADDON_FILTER_OPERATOR_${s}`] = f.OPERATOR;
                shiftedMaddon[`MADDON_FILTER_VALUE_${s}`] = f.VALUE;
                shiftedMaddon[`MADDON_FILTER_JOINER_${s}`] = f.JOINER;
                shiftedMaddon[`MADDON_FILTER_SEQNUM_${s}`] = s.toString();
                shiftedMaddon[`MADDON_LPAREN_${s}`] = f.LPAREN;
                shiftedMaddon[`MADDON_RPAREN_${s}`] = f.RPAREN;
              });
              if (typeof options.params === "object") {
                Object.assign(options.params, shiftedMaddon);
              } else if (typeof options.params === "string") {
                const searchParams = new URLSearchParams(options.params);
                for (const [k, v] of Object.entries(shiftedMaddon)) {
                  searchParams.set(k, v);
                }
                options.params = searchParams.toString();
              }
            }
          }
        });
      }
    }
  }
  function buildMaddonFilters(prof) {
    const mapping = {
      equipment: "equipment",
      eqDesc: "equipmentdesc",
      desc: "description",
      assigned: "assignedto",
      type: "workordertype",
      exDates: "schedstartdate"
    };
    const maddonParams = {};
    let seq = 1;
    for (const [key, alias] of Object.entries(mapping)) {
      const val = prof[key];
      if (!val) continue;
      const keywords = val.split(",").map((s) => s.trim()).filter((s) => s);
      if (keywords.length === 0) continue;
      APMLogger.debug("Forecast", `Smart-Parsing ${key} keywords: [${keywords.join(", ")}]`);
      const allRules = keywords.map((kw) => {
        let operator = "CONTAINS";
        let value = kw;
        let type = "include";
        if (key === "exDates") {
          operator = "!=";
          type = "exclude";
        } else {
          if (value.startsWith("!")) {
            operator = "NOTCONTAINS";
            value = value.substring(1);
            type = "exclude";
          }
          if (value.startsWith("=")) {
            operator = operator === "NOTCONTAINS" ? "!=" : "=";
            value = value.substring(1);
          } else if (value.startsWith("^")) {
            operator = "BEGINS";
            value = value.substring(1);
          } else if (value.endsWith("$")) {
            operator = "ENDS";
            value = value.substring(0, value.length - 1);
          }
        }
        return { operator, value, type };
      });
      const includes = allRules.filter((r) => r.type === "include");
      const excludes = allRules.filter((r) => r.type === "exclude");
      const fieldRules = [...includes, ...excludes];
      fieldRules.forEach((rule, idx) => {
        maddonParams[`MADDON_FILTER_ALIAS_NAME_${seq}`] = alias;
        maddonParams[`MADDON_FILTER_OPERATOR_${seq}`] = rule.operator;
        maddonParams[`MADDON_FILTER_VALUE_${seq}`] = rule.value;
        maddonParams[`MADDON_FILTER_SEQNUM_${seq}`] = seq.toString();
        if (rule.type === "include") {
          maddonParams[`MADDON_FILTER_JOINER_${seq}`] = idx === includes.length - 1 ? "AND" : "OR";
        } else {
          maddonParams[`MADDON_FILTER_JOINER_${seq}`] = "AND";
        }
        if (includes.length > 1) {
          maddonParams[`MADDON_LPAREN_${seq}`] = idx === 0 ? "true" : "false";
          maddonParams[`MADDON_RPAREN_${seq}`] = idx === includes.length - 1 ? "true" : "false";
        } else {
          maddonParams[`MADDON_LPAREN_${seq}`] = "false";
          maddonParams[`MADDON_RPAREN_${seq}`] = "false";
        }
        seq++;
      });
    }
    return maddonParams;
  }
  function getDateRange(weekValue, minDay, maxDay, isCumulative) {
    if (minDay === null || maxDay === null) return null;
    const val = parseInt(weekValue, 10);
    const now = /* @__PURE__ */ new Date();
    const baseSunday = new Date(now);
    baseSunday.setDate(now.getDate() - now.getDay());
    const startWeekOffset = isCumulative ? 0 : val * 7;
    const endWeekOffset = val * 7;
    const startD = new Date(baseSunday);
    startD.setDate(baseSunday.getDate() + minDay + startWeekOffset);
    const endD = new Date(baseSunday);
    endD.setDate(baseSunday.getDate() + maxDay + endWeekOffset);
    return { start: formatDate(startD), end: formatDate(endD) };
  }
  function isGridReady() {
    const wins = getExtWindows();
    for (const win of wins) {
      try {
        if (!win.Ext?.ComponentQuery) continue;
        const grids = win.Ext.ComponentQuery.query("gridpanel:not([destroyed=true])");
        for (const grid of grids) {
          if (grid.rendered && grid.getStore) {
            const store = grid.getStore();
            if (!store || store.isLoading()) continue;
            const storeId = (store.storeId || "").toLowerCase();
            const className = (store.$className || "").toLowerCase();
            const proxyUrl = (store.getProxy?.()?.url || "").toLowerCase();
            const winFunc = (win.EAM?.USER_FUNCTION_NAME || "").toUpperCase();
            const isWSJOBS = storeId.includes("wsjobs") || className.includes("wsjobs") || proxyUrl.includes("wsjobs") || winFunc === "WSJOBS";
            if (isWSJOBS) {
              APMLogger.debug("Forecast", `isGridReady found WSJOBS grid: ${grid.id} (Store: ${storeId})`);
              return true;
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
      const combos = targetExt.ComponentQuery.query("combobox:not([destroyed=true])");
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
    const setExtField = (names, value, operatorClass) => {
      if (value === void 0 || value === null) return;
      const nameList = Array.isArray(names) ? names : [names];
      let cmp = null;
      for (const name of nameList) {
        const fields = targetExt.ComponentQuery.query("[name=" + name + "]:not([destroyed=true])");
        if (fields && fields.length > 0) {
          cmp = fields[0];
          break;
        }
      }
      if (!cmp) return;
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
          if (opBtnCmp && !opBtnCmp.isDestroyed && opBtnCmp.menu && !opBtnCmp.menu.isDestroyed && opBtnCmp.menu.items && opBtnCmp.menu.items.items) {
            const menuItem = opBtnCmp.menu.items.items.find((item) => item && !item.isDestroyed && item.iconCls === operatorClass);
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
    setExtField(["ff_schedstartdate", "ff_startdate"], data.start, data.startOpClass);
    setExtField(["ff_schedenddate", "ff_enddate"], data.end, data.endOpClass);
    if (data.isWoSearch) {
      setExtField("ff_status", "", "fo_con");
    }
    if (!data.isClearMode) {
      const runBtns = targetExt.ComponentQuery.query("button[text=Run]:not([destroyed=true])");
      if (runBtns && runBtns.length > 0) {
        const runBtn = runBtns[0];
        if (data.profile) {
        }
        if (runBtn.handler) runBtn.handler.call(runBtn.scope || runBtn, runBtn);
        else runBtn.fireEvent("click", runBtn);
      }
    }
  }
  async function executeForecast(mode = "normal") {
    if (window.self !== window.top) return;
    if (isRunning) return;
    currentMode = mode;
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
      descText = document.getElementById("eam-desc-text")?.value.trim() || "";
      descOp = document.getElementById("eam-desc-op")?.value || "Contains";
      orgText = document.getElementById("eam-org-select")?.value.trim().toUpperCase() || "";
    }
    isRunning = true;
    isStopped = false;
    initAjaxInterceptors();
    try {
      if (mode !== "quick") saveAllPreferences();
      UIManager.closeAll(true);
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
        return;
      }
      await returnToListView();
      setStatus(mode, mode === "clear" ? "Wiping Fields..." : "Injecting API...", "#f1c40f");
      const todayOnlyCheckbox = document.getElementById("eam-today-only-toggle");
      const isTodayOnly = todayOnlyCheckbox && todayOnlyCheckbox.checked;
      const profSelect = document.getElementById("eam-profile-select");
      const activeProfId = profSelect ? profSelect.value : "manual";
      const activeProfile = activeProfId !== "manual" ? savedProfiles.find((p) => p.id === activeProfId) : null;
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
        profile: activeProfile,
        org: mode === "quick" || mode === "clear" ? "" : activeProfile ? activeProfile.org : orgText,
        woNum: mode === "quick" ? quickSearchText : mode === "clear" ? "" : null,
        desc: mode === "quick" || mode === "clear" || activeProfile ? "" : descText,
        descOpClass: descOp === "Contains" ? "fo_con" : "fo_dncon",
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
    } finally {
      isRunning = false;
    }
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
      } else if (child && (child.nodeType && (child.nodeType === 1 || child.nodeType === 3 || child.nodeType === 11) || child instanceof SVGElement || child.constructor && child.constructor.name && child.constructor.name.includes("Element"))) {
        element.appendChild(child);
      }
    }
    return element;
  }

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
.drop-1 { animation-duration: 1.23s; animation-delay: 0s; }
.drop-2 { animation-duration: 1.37s; animation-delay: 0.21s; }
.drop-3 { animation-duration: 1.29s; animation-delay: 0.47s; }
.drop-4 { animation-duration: 1.41s; animation-delay: 0.13s; }
.drop-5 { animation-duration: 1.31s; animation-delay: 0.67s; }
.drop-6 { animation-duration: 1.47s; animation-delay: 0.91s; }
.drop-7 { animation-duration: 1.25s; animation-delay: 0.33s; }
.drop-8 { animation-duration: 1.39s; animation-delay: 0.59s; }
.drop-9 { animation-duration: 1.33s; animation-delay: 0.17s; }
.drop-10 { animation-duration: 1.43s; animation-delay: 0.79s; }

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
.apm-copy-icon { display: inline-block; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='13' height='13' viewBox='0 0 24 24' fill='none' stroke='%23007bff' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='9' y='9' width='13' height='13' rx='2' ry='2'%3E%3C/rect%3E%3Cpath d='M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1'%3E%3C/path%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: center; width: 14px; height: 14px; margin-left: 8px; vertical-align: middle; cursor: pointer; opacity: 0.4; }
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
.apm-labor-panel { position: fixed; width: min(280px, 80vw); background: #35404a; border: 1px solid #4a5a6a; border-radius: 8px; padding: 15px; z-index: 2147483646; transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1); display: none; visibility: hidden; flex-direction: column; box-shadow: 0 0 20px rgba(0,0,0,0.6); }

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
#apm-settings-panel ::-ms-input-placeholder, #eam-forecast-panel :-ms-input-placeholder, .apm-labor-panel :-ms-input-placeholder { color: #888 !important; }
#apm-settings-panel ::-ms-input-placeholder, #eam-forecast-panel ::-ms-input-placeholder, .apm-labor-panel ::-ms-input-placeholder { color: #888 !important; }

/* =========================
 * Modals & Premium UI elements
 * ========================= */
.apm-modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); z-index: 2147483647; display: flex; align-items: center; justify-content: center; }
.apm-modal-content { background: #35404a; border: 1px solid #4a5a6a; border-radius: 12px; box-shadow: 0 15px 40px rgba(0,0,0,0.5); display: flex; flex-direction: column; overflow: hidden; animation: apm-modal-appear 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
.apm-modal-header { padding: 12px 15px; background: rgba(255,255,255,0.03); border-bottom: 1px solid #4a5a6a; display: flex; justify-content: space-between; align-items: center; }
.apm-modal-body { padding: 15px; }
.apm-modal-footer { padding: 12px 15px; border-top: 1px solid #4a5a6a; background: rgba(0,0,0,0.1); }
@keyframes apm-modal-appear { from { opacity: 0; transform: scale(0.95) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }

.apm-profile-badge { display: inline-block; padding: 2px 6px; border-radius: 10px; background: rgba(52, 152, 219, 0.2); color: #3498db; font-size: 10px; font-weight: bold; text-transform: uppercase; margin-left: 8px; border: 1px solid rgba(52, 152, 219, 0.4); }
`;
  function injectStaticStyles() {
    if (document.getElementById("apm-static-styles")) return;
    const style = document.createElement("style");
    style.id = "apm-static-styles";
    style.textContent = APM_STATIC_STYLES;
    document.head.appendChild(style);
  }
  var SVG_CLOUD = `
<svg viewBox="0 0 24 24" width="22" height="22" style="vertical-align: text-bottom; margin-bottom: 2px; overflow: visible;">
    <path class="lightning-bolt" d="M18,3 L5,16 L11,16 L7,26 L20,11 L13,11 Z" fill="#f1c40f"/>
    <path d="M17.5,18 C20,18 22,16 22,13.5 C22,11.2 20.3,9.3 18,9 C17.5,6.2 15,4 12,4 C8.7,4 6,6.7 6,10 C6,10.1 6,10.1 6,10.1 C3.8,10.3 2,12.2 2,14.5 C2,17 4,19 6.5,19 L17.5,18 Z" fill="currentColor"/>
    <path class="raindrop drop-1" d="M8,19 L7,23" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    <path class="raindrop drop-2" d="M12,20 L11,24" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    <path class="raindrop drop-3" d="M16,19 L15,23" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    <path class="raindrop drop-4" d="M10,18 L9,22" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    <path class="raindrop drop-5" d="M14,19 L13,23" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    <path class="raindrop drop-6" d="M18,18 L17,22" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    <path class="raindrop drop-7" d="M9,20 L8,24" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" opacity="0.6"/>
    <path class="raindrop drop-8" d="M13,21 L12,25" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" opacity="0.6"/>
    <path class="raindrop drop-9" d="M17,20 L16,24" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" opacity="0.6"/>
    <path class="raindrop drop-10" d="M11,19 L10,23" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" opacity="0.6"/>
</svg>
`;
  var SVG_ARROW_DOWN = `
<svg viewBox="0 0 10 10" width="8" height="8" style="fill: currentColor; opacity: 0.8;">
    <path d="M0 3 L10 3 L5 8 Z"/>
</svg>
`;

  // src/modules/forecast/forecast-ui.js
  init_toast();
  init_logger();
  init_ui_manager();

  // src/core/updater.js
  init_constants();
  init_state();
  init_logger();
  init_storage();
  var updateListeners = [];
  function subscribeToUpdates(callback) {
    updateListeners.push(callback);
    if (window._apmUpdateAvailable) callback();
  }
  function getUpdateUrls() {
    const isBeta = apmGeneralSettings.updateTrack === "beta";
    return {
      check: isBeta ? BETA_VERSION_CHECK_URL : VERSION_CHECK_URL,
      download: isBeta ? BETA_UPDATE_URL : UPDATE_URL
    };
  }
  function checkForGlobalUpdates(force = false) {
    if (window._apmUpdateChecked && !force) return;
    const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    const lastCheck = APMStorage.get("apm_last_update_check");
    if (lastCheck === today && !force) {
      APMLogger.info("APM Master", "Update already checked today. Skipping auto-check.");
      window._apmUpdateChecked = true;
      return;
    }
    const { check, download } = getUpdateUrls();
    window._apmUpdateChecked = true;
    APMLogger.info("APM Master", `Checking for updates (${apmGeneralSettings.updateTrack})...`, CURRENT_VERSION);
    fetch(check).then((response) => response.text()).then((text) => {
      APMStorage.set("apm_last_update_check", today);
      const match = text.match(/\/\/\s*@version\s+([0-9\.]+)/);
      if (match && match[1]) {
        const remoteVersion = match[1];
        if (remoteVersion !== CURRENT_VERSION) {
          window._apmUpdateAvailable = true;
          window._apmRemoteVersion = remoteVersion;
          window._apmUpdateUrl = download;
          APMLogger.info("APM Master", `\u2728 Update available! Current: ${CURRENT_VERSION}, Remote: ${remoteVersion} (${apmGeneralSettings.updateTrack})`);
          updateListeners.forEach((cb) => cb());
        } else {
          window._apmUpdateAvailable = false;
        }
      }
    }).catch((e) => {
      APMLogger.warn("APM Master", "Update check failed silently.", e);
    });
  }

  // src/modules/forecast/components/forecast-search-form.js
  function createSearchForm(callbacks = {}) {
    const { onToggleGuide, onToggleMode } = callbacks;
    const form = el("div", { id: "eam-main-view" }, [
      el("div", { id: "eam-adv-site", className: "eam-fc-adv-box" }, [
        el("div", { className: "eam-fc-row", style: { marginBottom: "8px" } }, [
          el("label", { className: "eam-fc-label" }, "Active Profile:"),
          el("select", { id: "eam-profile-select", className: "eam-fc-select", style: { color: "#3498db", fontWeight: "bold" } }, [
            el("option", { value: "manual" }, "[ Manual Native Search ]")
          ])
        ]),
        el("div", { id: "eam-profile-summary", style: { display: "none", background: "rgba(52, 152, 219, 0.1)", border: "1px dashed #3498db", borderRadius: "4px", padding: "8px", marginBottom: "10px", fontSize: "11px", color: "#bdc3c7" } }, [
          el("div", { style: { fontWeight: "bold", color: "#3498db", marginBottom: "3px" } }, "\u2728 Profile Active: ExtJS Filter Engaged"),
          el("div", { id: "eam-profile-summary-text" }, "Loading profile details...")
        ]),
        el("div", { id: "eam-manual-inputs" }, [
          el("div", { className: "eam-fc-row" }, [
            el("label", { className: "eam-fc-label" }, "Site Code (Org):"),
            el("select", { id: "eam-org-select", className: "eam-fc-select", style: { textTransform: "uppercase" } }, [
              el("option", { value: "" }, "-- All Sites --")
            ]),
            el("button", { id: "eam-add-org-btn", className: "org-btn org-btn-add", title: "Add New Site" }, "+"),
            el("button", { id: "eam-rem-org-btn", className: "org-btn org-btn-rem", title: "Remove Selected Site" }, "-")
          ])
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
        el("input", { type: "text", id: "eam-desc-text", placeholder: "Keywords... (Optional)", className: "eam-fc-desc-input" })
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
    setupListeners(form, callbacks);
    return form;
  }
  function setupListeners(container, callbacks) {
    const { onToggleGuide } = callbacks;
    const btnRun = container.querySelector("#eam-btn-run");
    const btnToday = container.querySelector("#eam-btn-today");
    const btnHelp = container.querySelector("#eam-help-btn");
    const todayToggle = container.querySelector("#eam-today-only-toggle");
    const todayToggleText = container.querySelector("#eam-today-toggle-text");
    btnRun.onmouseover = () => btnRun.style.backgroundColor = "#16a085";
    btnRun.onmouseout = () => btnRun.style.backgroundColor = "#1abc9c";
    btnToday.onmouseover = () => btnToday.style.backgroundColor = "#2980b9";
    btnToday.onmouseout = () => btnToday.style.backgroundColor = "#3498db";
    btnRun.onclick = () => {
      if (!getIsRunning()) executeForecast("normal");
    };
    btnToday.onclick = () => {
      if (!getIsRunning()) executeForecast("today");
    };
    btnHelp.onclick = () => onToggleGuide?.();
    todayToggle.addEventListener("change", () => {
      todayToggleText.textContent = todayToggle.checked ? "Today Only" : "Includes Past Due";
      saveAllPreferences();
    });
    const descInput = container.querySelector("#eam-desc-text");
    descInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        if (!getIsRunning()) executeForecast("normal");
      }
    });
    container.querySelector("#eam-add-org-btn").onclick = () => {
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
        renderOrgs(container);
        saveAllPreferences();
      }
    };
    container.querySelector("#eam-rem-org-btn").onclick = () => {
      const select = container.querySelector("#eam-org-select");
      const current = select.value;
      if (!current) {
        alert('Cannot remove the default "All Sites" option.');
        return;
      }
      if (confirm(`Are you sure you want to remove ${current} from your list?`)) {
        setSavedOrgs(savedOrgs.filter((o) => o !== current));
        setSelectedOrg("");
        renderOrgs(container);
        saveAllPreferences();
      }
    };
    const dateModeBtn = container.querySelector("#eam-date-mode-toggle");
    const relDates = container.querySelector("#eam-relative-dates");
    const custDates = container.querySelector("#eam-custom-dates");
    const checkboxes = Array.from(container.querySelectorAll('#eam-day-checkboxes input[type="checkbox"]'));
    dateModeBtn.onclick = () => {
      const isCurrentlyCustom = custDates.style.display === "flex";
      const nextCustom = !isCurrentlyCustom;
      if (nextCustom) {
        const weekSelect = container.querySelector("#eam-week-select");
        const isCumulative = weekSelect.dataset.cumulative === "true";
        const userChecked = checkboxes.filter((cb) => cb.dataset.explicit === "true").map((cb) => parseInt(cb.value, 10));
        if (userChecked.length > 0) {
          const dates = getDateRange(weekSelect.value, Math.min(...userChecked), Math.max(...userChecked), isCumulative);
          if (dates) {
            const toYMD = (dStr) => {
              const p = dStr.split("/");
              return `${p[2]}-${p[0].padStart(2, "0")}-${p[1].padStart(2, "0")}`;
            };
            container.querySelector("#eam-custom-start").value = toYMD(dates.start);
            container.querySelector("#eam-custom-end").value = toYMD(dates.end);
          }
        }
      }
      relDates.style.display = nextCustom ? "none" : "block";
      custDates.style.display = nextCustom ? "flex" : "none";
      dateModeBtn.innerHTML = nextCustom ? "Switch to Relative \u26A1" : "Switch to Custom Dates \u{1F4C5}";
      saveAllPreferences();
    };
    checkboxes.forEach((cb) => {
      cb.addEventListener("change", (e) => {
        e.target.dataset.explicit = e.target.checked ? "true" : "false";
        updateCheckboxVisuals(container);
      });
    });
  }
  function renderOrgs(container) {
    const select = container.querySelector("#eam-org-select");
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
  }
  function updateCheckboxVisuals(container) {
    const checkboxes = Array.from(container.querySelectorAll('#eam-day-checkboxes input[type="checkbox"]'));
    const userChecked = checkboxes.filter((cb) => cb.dataset.explicit === "true").map((cb) => parseInt(cb.value, 10));
    const weekSelect = container.querySelector("#eam-week-select");
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
  }

  // src/modules/forecast/components/forecast-profile-manager.js
  init_logger();
  function createProfileManager(callbacks = {}) {
    const modal = el("div", { id: "apm-spies-modal", className: "apm-modal-overlay", style: { display: "none" } }, [
      el("div", { className: "apm-modal-content", style: { width: "420px" } }, [
        el("div", { className: "apm-modal-header" }, [
          el("h4", { style: { margin: 0, color: "#3498db" } }, [
            "Custom Dataspy Builder ",
            el("span", { style: { fontSize: "10px", verticalAlign: "middle", background: "#e67e22", color: "white", padding: "1px 5px", borderRadius: "3px", marginLeft: "5px", fontWeight: "bold" } }, "BETA")
          ]),
          el("button", { id: "apm-spies-close", className: "eam-fc-close-btn" }, "\u2716")
        ]),
        el("div", { className: "apm-modal-body", style: { padding: "15px" } }, [
          el("div", { className: "eam-fc-row", style: { marginBottom: "15px" } }, [
            el("label", { className: "eam-fc-label", style: { width: "90px" } }, "Profile Name:"),
            el("input", { type: "text", id: "spy-name", className: "eam-fc-input-text", placeholder: "e.g., Weekly PMs", style: { flex: 1 } })
          ]),
          el("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" } }, [
            el("div", { style: { gridColumn: "span 2" } }, [
              el("label", { className: "eam-fc-label", style: { display: "block", marginBottom: "4px" } }, "Work Order Description:"),
              el("div", { style: { display: "flex", gap: "5px" } }, [
                el("input", { type: "text", id: "spy-desc", className: "eam-fc-input-text", placeholder: "Keywords...", style: { flex: 1 } }),
                // These buttons need to be handled by the form/orchestrator or imported
                el("button", { className: "eam-fc-btn-small", title: "Exclude (!)", onclick: () => togglePrefix("spy-desc", "!") }, "!"),
                el("button", { className: "eam-fc-btn-small", title: "Exact (=)", onclick: () => togglePrefix("spy-desc", "=") }, "="),
                el("button", { className: "eam-fc-btn-small", title: "Begins (^)", onclick: () => togglePrefix("spy-desc", "^") }, "^")
              ])
            ]),
            el("div", {}, [
              el("label", { className: "eam-fc-label", style: { display: "block", marginBottom: "4px" } }, "Equipment:"),
              el("div", { style: { display: "flex", gap: "3px" } }, [
                el("input", { type: "text", id: "spy-eq", className: "eam-fc-input-text", placeholder: "PUMP*", style: { flex: 1 } }),
                el("button", { className: "eam-fc-btn-small", title: "Exclude", onclick: () => togglePrefix("spy-eq", "!") }, "!")
              ])
            ]),
            el("div", {}, [
              el("label", { className: "eam-fc-label", style: { display: "block", marginBottom: "4px" } }, "Eq. Description:"),
              el("input", { type: "text", id: "spy-eqdesc", className: "eam-fc-input-text", style: { width: "100%" } })
            ]),
            el("div", {}, [
              el("label", { className: "eam-fc-label", style: { display: "block", marginBottom: "4px" } }, "Assigned To:"),
              el("input", { type: "text", id: "spy-assigned", className: "eam-fc-input-text", style: { width: "100%" } })
            ]),
            el("div", {}, [
              el("label", { className: "eam-fc-label", style: { display: "block", marginBottom: "4px" } }, "WO Type:"),
              el("input", { type: "text", id: "spy-type", className: "eam-fc-input-text", placeholder: "PM, REPAIR", style: { width: "100%" } })
            ]),
            el("div", { style: { gridColumn: "span 2" } }, [
              el("label", { className: "eam-fc-label", style: { display: "block", marginBottom: "4px" } }, "Exclude Specific Dates:"),
              el("input", { type: "text", id: "spy-ex-dates", className: "eam-fc-input-text", placeholder: "03/15/2026, 03/16/2026...", style: { width: "100%" } })
            ]),
            el("div", { style: { gridColumn: "span 2" } }, [
              el("label", { className: "eam-fc-label", style: { display: "block", marginBottom: "4px" } }, "Org (Site):"),
              el("input", { type: "text", id: "spy-org", className: "eam-fc-input-text", style: { width: "100%" } })
            ])
          ]),
          el("div", { style: { marginTop: "15px", display: "flex", gap: "10px" } }, [
            el("button", { id: "spy-btn-save", className: "eam-fc-btn-run", style: { flex: 1, height: "35px" } }, "Save Profile"),
            el("button", { id: "spy-btn-delete", className: "eam-fc-btn-today", style: { background: "#e74c3c", borderColor: "#c0392b", flex: 0.4 } }, "Delete")
          ])
        ]),
        el("div", { className: "apm-modal-footer", style: { padding: "10px 15px", borderTop: "1px solid #45535e" } }, [
          el("div", { className: "eam-fc-label", style: { marginBottom: "5px" } }, "Manage Saved Spies:"),
          el("select", { id: "spy-manager-select", className: "eam-fc-select", style: { width: "100%" } }, [
            el("option", { value: "" }, "-- Create New Profile --")
          ])
        ])
      ])
    ]);
    setupModalListeners(modal);
    return modal;
  }
  function togglePrefix(id, prefix) {
    const el2 = document.getElementById(id);
    if (!el2) return;
    const start = el2.selectionStart;
    const end = el2.selectionEnd;
    let fullVal = el2.value;
    if (start !== end) {
      let selected = fullVal.substring(start, end).trim();
      if (selected.startsWith(prefix)) {
        selected = selected.substring(prefix.length).trim();
      } else {
        if (selected.startsWith("!") || selected.startsWith("=") || selected.startsWith("^")) {
          selected = selected.substring(1).trim();
        }
        selected = prefix + selected;
      }
      el2.value = fullVal.substring(0, start) + selected + fullVal.substring(end);
      el2.setSelectionRange(start, start + selected.length);
    } else {
      let val = fullVal.trim();
      if (val.startsWith(prefix)) {
        el2.value = val.substring(prefix.length).trim();
      } else {
        if (val.startsWith("!") || val.startsWith("=") || val.startsWith("^")) {
          val = val.substring(1).trim();
        }
        el2.value = prefix + val;
      }
    }
    el2.focus();
  }
  function setupModalListeners(modal) {
    modal.querySelector("#apm-spies-close").onclick = () => {
      modal.style.display = "none";
    };
    const spyMgrSelect = modal.querySelector("#spy-manager-select");
    spyMgrSelect.onchange = () => {
      const id = spyMgrSelect.value;
      const prof = savedProfiles.find((p) => p.id === id);
      modal.querySelector("#spy-name").value = prof ? prof.name : "";
      modal.querySelector("#spy-eq").value = prof ? prof.equipment || "" : "";
      modal.querySelector("#spy-eqdesc").value = prof ? prof.eqDesc || "" : "";
      modal.querySelector("#spy-desc").value = prof ? prof.desc || "" : "";
      modal.querySelector("#spy-assigned").value = prof ? prof.assigned || "" : "";
      modal.querySelector("#spy-type").value = prof ? prof.type || "" : "";
      modal.querySelector("#spy-org").value = prof ? prof.org || "" : "";
      modal.querySelector("#spy-ex-dates").value = prof ? prof.exDates || "" : "";
    };
    modal.querySelector("#spy-btn-save").onclick = () => {
      const name = modal.querySelector("#spy-name").value.trim();
      if (!name) {
        alert("Please enter a profile name.");
        return;
      }
      const id = spyMgrSelect.value || "prof_" + Date.now();
      const profData = {
        id,
        name,
        equipment: modal.querySelector("#spy-eq").value.trim(),
        eqDesc: modal.querySelector("#spy-eqdesc").value.trim(),
        desc: modal.querySelector("#spy-desc").value.trim(),
        assigned: modal.querySelector("#spy-assigned").value.trim(),
        type: modal.querySelector("#spy-type").value.trim(),
        org: modal.querySelector("#spy-org").value.trim(),
        exDates: modal.querySelector("#spy-ex-dates").value.trim()
      };
      APMLogger.info("Forecast", `Saving Profile: ${name}`, profData);
      const existingIdx = savedProfiles.findIndex((p) => p.id === id);
      if (existingIdx >= 0) savedProfiles[existingIdx] = profData;
      else savedProfiles.push(profData);
      setSelectedProfileId(id);
      renderProfiles_Global();
      updateProfileUI_Global();
      saveAllPreferences();
      alert("Profile saved!");
    };
    modal.querySelector("#spy-btn-delete").onclick = () => {
      const id = spyMgrSelect.value;
      if (!id) return;
      if (confirm("Delete this profile?")) {
        setSavedProfiles(savedProfiles.filter((p) => p.id !== id));
        if (selectedProfileId === id) setSelectedProfileId("manual");
        renderProfiles_Global();
        updateProfileUI_Global();
        saveAllPreferences();
        spyMgrSelect.value = "";
        spyMgrSelect.onchange();
      }
    };
  }
  function renderProfiles_Global() {
    const spyMgrSelect = document.getElementById("spy-manager-select");
    const profSelect = document.getElementById("eam-profile-select");
    if (!spyMgrSelect || !profSelect) return;
    const opts = '<option value="">-- Create New Profile --</option>' + savedProfiles.map((p) => `<option value="${p.id}">${p.name}</option>`).join("");
    spyMgrSelect.innerHTML = opts;
    const profOpts = '<option value="manual">[ Manual Native Search ]</option>' + savedProfiles.map((p) => `<option value="${p.id}">Profile: ${p.name}</option>`).join("");
    profSelect.innerHTML = profOpts;
    profSelect.value = selectedProfileId || "manual";
  }
  function updateProfileUI_Global() {
    const profSelect = document.getElementById("eam-profile-select");
    const summary = document.getElementById("eam-profile-summary");
    const summaryText = document.getElementById("eam-profile-summary-text");
    const manualInputs = document.getElementById("eam-manual-inputs");
    const descBox = document.querySelector(".eam-fc-desc-box");
    if (!profSelect) return;
    const selectedId = profSelect.value;
    if (selectedId === "manual") {
      if (summary) summary.style.display = "none";
      if (manualInputs) manualInputs.style.display = "block";
      if (descBox) descBox.style.display = "flex";
    } else {
      const prof = savedProfiles.find((p) => p.id === selectedId);
      if (prof) {
        if (summary) summary.style.display = "block";
        if (manualInputs) manualInputs.style.display = "none";
        if (descBox) descBox.style.display = "none";
        const details = [];
        if (prof.equipment) details.push(`Eq: ${prof.equipment}`);
        if (prof.eqDesc) details.push(`EqDesc: ${prof.eqDesc}`);
        if (prof.desc) details.push(`Desc: ${prof.desc}`);
        if (prof.assigned) details.push(`Assigned: ${prof.assigned}`);
        if (prof.type) details.push(`Type: ${prof.type}`);
        if (prof.org) details.push(`Org: ${prof.org}`);
        summaryText.textContent = details.length > 0 ? details.join(" | ") : "No specific filters set (All Records)";
      }
    }
  }

  // src/modules/forecast/components/forecast-guidance.js
  function createGuidance(callbacks = {}) {
    const { onBack } = callbacks;
    const guide = el("div", { id: "eam-guide-container", className: "eam-fc-guide-box" }, [
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
    guide.querySelector("#eam-guide-back-btn").onclick = () => onBack?.();
    return guide;
  }

  // src/modules/forecast/components/forecast-quick-search.js
  function createQuickSearch() {
    if (window.self !== window.top) return null;
    let ui = document.getElementById("apm-quick-search-container");
    if (ui) return ui;
    ui = el("div", { id: "apm-quick-search-container", className: "apm-qs-container", style: { display: "flex" } }, [
      el("span", { className: "apm-qs-label" }, "Quick Search:"),
      el("input", { type: "text", id: "apm-qs-input", placeholder: "Jump to WO...", autocomplete: "off", className: "apm-qs-input" }),
      el("button", { id: "apm-qs-btn", className: "apm-qs-btn", innerHTML: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>' }),
      el("span", { id: "apm-qs-status", className: "apm-qs-status" })
    ]);
    const qsInput = ui.querySelector("#apm-qs-input");
    const qsBtn = ui.querySelector("#apm-qs-btn");
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

  // src/modules/forecast/forecast-ui.js
  function checkForUpdates() {
    subscribeToUpdates(() => {
      const updateContainer = document.getElementById("eam-update-container");
      if (updateContainer) updateContainer.style.display = "block";
    });
  }
  function buildSearchUI() {
    const ui = createQuickSearch();
    if (ui && !ui.parentElement) document.body.appendChild(ui);
    return ui;
  }
  function buildForecastUI() {
    window._APM = window._APM || {};
    window._APM.buildForecastUI = buildForecastUI;
    if (window.self !== window.top) return;
    let panel = document.getElementById("eam-forecast-panel");
    if (!panel) {
      UIManager.registerPanel("eam-forecast-panel", ["#apm-forecast-ext-btn", ".apm-fc-btn"]);
      panel = el("div", { id: "eam-forecast-panel", style: { display: "none" }, className: "eam-fc-container apm-ui-panel" });
      const header = el("div", { className: "eam-fc-header" }, [
        el("div", { className: "eam-fc-title-box" }, [
          el("h4", { className: "eam-fc-title", innerHTML: 'WO Forecast <span style="color:#1abc9c; font-weight: bold;">Tool</span>' }),
          el("div", { className: "rain-cloud-always", style: { color: "#1abc9c", marginTop: "-3px" }, innerHTML: SVG_CLOUD })
        ]),
        el("div", { className: "eam-fc-controls" }, [
          el("button", { id: "eam-btn-spies", className: "eam-fc-mode-btn", style: { color: "#3498db", borderColor: "#3498db" } }, "\u2699\uFE0F Build Dataspy"),
          el("button", { id: "eam-mode-toggle", className: "eam-fc-mode-btn" }, "Simple Mode \u{1F343}"),
          el("button", { id: "eam-btn-close", className: "eam-fc-close-btn" }, "\u2716")
        ])
      ]);
      const searchForm = createSearchForm({
        onToggleGuide: () => {
          searchForm.style.display = "none";
          guidance.style.display = "block";
        }
      });
      const profileManager = createProfileManager();
      const guidance = createGuidance({
        onBack: () => {
          searchForm.style.display = "block";
          guidance.style.display = "none";
        }
      });
      guidance.style.display = "none";
      const statusLabel = el("div", { id: "eam-status", className: "eam-fc-status" });
      const updateContainer = el("div", { id: "eam-update-container", className: "eam-fc-update-box" }, [
        el("a", { href: "https://raw.githubusercontent.com/jaker788-create/APM-Master/main/forecast.user.js", target: "_blank", className: "apm-footer-update-btn" }, "\u2728 Update Available")
      ]);
      panel.appendChild(header);
      panel.appendChild(searchForm);
      panel.appendChild(guidance);
      panel.appendChild(profileManager);
      panel.appendChild(statusLabel);
      panel.appendChild(updateContainer);
      document.body.appendChild(panel);
      const modeBtn = panel.querySelector("#eam-mode-toggle");
      const spiesBtn = panel.querySelector("#eam-btn-spies");
      modeBtn.onclick = () => {
        const isSimple = modeBtn.textContent.includes("Simple");
        setModeUI(panel, !isSimple);
        saveAllPreferences();
      };
      spiesBtn.onclick = () => {
        const modal = panel.querySelector("#apm-spies-modal");
        const dTextEl = panel.querySelector("#eam-desc-text");
        const oTextEl = panel.querySelector("#eam-org-select");
        if (modal.querySelector("#spy-manager-select").value === "") {
          if (dTextEl) modal.querySelector("#spy-desc").value = dTextEl.value.trim();
          if (oTextEl) modal.querySelector("#spy-org").value = oTextEl.value.trim();
        }
        modal.style.display = "flex";
      };
      panel.querySelector("#eam-btn-close").onclick = () => {
        panel.style.display = "none";
        searchForm.style.display = "block";
        guidance.style.display = "none";
      };
      panel.querySelector("#eam-profile-select").onchange = (e) => {
        setSelectedProfileId(e.target.value);
        updateProfileUI_Global();
        saveAllPreferences();
      };
      syncPreferences(panel);
      checkForUpdates();
    }
  }
  function setModeUI(panel, isSimple) {
    const modeBtn = panel.querySelector("#eam-mode-toggle");
    const advSite = panel.querySelector("#eam-adv-site");
    if (isSimple) {
      advSite.style.display = "none";
      modeBtn.innerHTML = "Simple Mode \u{1F343}";
      modeBtn.style.color = "#1abc9c";
      modeBtn.style.borderColor = "#1abc9c";
      modeBtn.style.background = "#2b343c";
    } else {
      advSite.style.display = "flex";
      modeBtn.innerHTML = "Advanced \u2699\uFE0F";
      modeBtn.style.color = "#e67e22";
      modeBtn.style.borderColor = "#e67e22";
      modeBtn.style.background = "rgba(230, 126, 34, 0.1)";
    }
  }
  function syncPreferences(panel) {
    const prefs = loadPreferences();
    if (!prefs) return;
    if (prefs.descOp) panel.querySelector("#eam-desc-op").value = prefs.descOp;
    if (prefs.descText !== void 0) panel.querySelector("#eam-desc-text").value = prefs.descText;
    if (prefs.todayOnly !== void 0) panel.querySelector("#eam-today-only-toggle").checked = prefs.todayOnly;
    setModeUI(panel, prefs.isSimpleMode !== false);
    const isCustomDateMode = prefs.isCustomDateMode === true;
    panel.querySelector("#eam-relative-dates").style.display = isCustomDateMode ? "none" : "block";
    panel.querySelector("#eam-custom-dates").style.display = isCustomDateMode ? "flex" : "none";
    panel.querySelector("#eam-date-mode-toggle").innerHTML = isCustomDateMode ? "Switch to Relative \u26A1" : "Switch to Custom Dates \u{1F4C5}";
    if (prefs.customStart) panel.querySelector("#eam-custom-start").value = prefs.customStart;
    if (prefs.customEnd) panel.querySelector("#eam-custom-end").value = prefs.customEnd;
    const checkboxes = Array.from(panel.querySelectorAll('#eam-day-checkboxes input[type="checkbox"]'));
    if (prefs.days && Array.isArray(prefs.days)) {
      checkboxes.forEach((cb, i) => {
        cb.checked = prefs.days[i];
        cb.dataset.explicit = prefs.days[i] ? "true" : "false";
      });
    }
    renderOrgs(panel);
    renderProfiles_Global();
    updateCheckboxVisuals(panel);
    updateProfileUI_Global();
    if (prefs.week) panel.querySelector("#eam-week-select").value = prefs.week;
  }
  var styles = `
.eam-fc-btn-small {
    background: #2c3e50;
    border: 1px solid #45535e;
    color: #bdc3c7;
    border-radius: 3px;
    padding: 2px 6px;
    font-size: 11px;
    cursor: pointer;
    transition: all 0.2s;
    min-width: 24px;
}
.eam-fc-btn-small:hover {
    background: #34495e;
    color: #3498db;
    border-color: #3498db;
}
`;
  if (!document.getElementById("apm-fc-advanced-styles")) {
    const s = document.createElement("style");
    s.id = "apm-fc-advanced-styles";
    s.innerHTML = styles;
    document.head.appendChild(s);
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
    window._APM = window._APM || {};
    window._APM.checkHotkey = checkKey;
    window.addEventListener("keydown", checkKey, true);
    window._apmHotkeysBound = true;
    const bindExtHotkeys = () => {
      if (!window.Ext || !window.Ext.onReady) return;
      window.Ext.onReady(() => {
        const doc = window.Ext.getDoc();
        if (doc && !doc.hasApmHotkeys) {
          APMLogger.debug("APM Master", "Binding ExtJS hotkey listener");
          doc.on("keydown", (e) => {
            if (checkKey(e.browserEvent || e)) e.stopEvent();
          });
          doc.hasApmHotkeys = true;
        }
      });
    };
    Promise.resolve().then(() => (init_scheduler(), scheduler_exports)).then(({ APMScheduler: APMScheduler2 }) => {
      APMScheduler2.registerTask("ext-hotkeys-bind", 2e3, bindExtHotkeys);
    });
  }

  // src/modules/forecast/forecast-filter.js
  init_scheduler();
  init_utils();
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

  // src/ui/settings-panel.js
  init_logger();
  init_toast();

  // src/modules/colorcode/colorcode-engine.js
  init_state();
  init_logger();
  init_constants();
  init_utils();
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
  var _compiledRules = null;
  var _compiledRulesFingerprint = "";
  function getCompiledRules(rules) {
    const fingerprint = rules.map((r) => `${r.id}:${r.search}:${r.fill}:${r.showTag}:${r.color}`).join("|");
    if (_compiledRules && fingerprint === _compiledRulesFingerprint) return _compiledRules;
    _compiledRulesFingerprint = fingerprint;
    _compiledRules = rules.map((r) => {
      if (!r.search) return null;
      const terms = r.search.split(",").map((s) => s.trim().toLowerCase()).filter((s) => s);
      if (terms.length === 0) return null;
      const pattern = terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
      return {
        ...r,
        regex: new RegExp(pattern, "i")
      };
    }).filter((r) => r);
    return _compiledRules;
  }
  function applyRowColoring(row, fillRule, settings) {
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
      ["--cc-row-bg", "--cc-row-bg-alt", "--cc-row-bg-hover", "--cc-row-bg-sel"].forEach((p) => row.style.removeProperty(p));
    }
  }
  function buildSafeWoUrl(woNum) {
    const currentTenant = window.EAM && window.EAM.AppData && window.EAM.AppData.tenant ? window.EAM.AppData.tenant : LINK_CONFIG.tenant;
    return `https://${window.location.hostname}/web/base/logindisp?tenant=${currentTenant}&FROMEMAIL=YES&SYSTEM_FUNCTION_NAME=${LINK_CONFIG.userFuncName}&USER_FUNCTION_NAME=${LINK_CONFIG.userFuncName}&workordernum=${woNum}`;
  }
  function applyCellProcessors(cell, rowMatches, ptpHistory) {
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
        cell.innerHTML = `<span style="white-space:nowrap"><a class="apm-wo-link" href="${safeUrl}" ${targetAttr} ${onclickAttr}>${woNum}</a><span class="apm-copy-icon" title="Copy link to clipboard" data-wo-copy-url="${safeUrl}"></span></span>`;
        cell.setAttribute("data-apm-linkified", "true");
        cell.setAttribute("data-wo-num", woNum);
      }
    }
    if (apmGeneralSettings.ptpTrackingEnabled && cell.hasAttribute("data-wo-num")) {
      const woNum = cell.getAttribute("data-wo-num");
      const ptpRecord = ptpHistory[woNum];
      const existingPtpTag = cell.querySelector(".apm-ptp-status-tag");
      if (ptpRecord) {
        const s = ptpRecord.status;
        let icon = "\u23F3", statusTxt = "Incomplete", color = "#f39c12";
        if (s === "COMPLETE") {
          icon = "\u2705";
          statusTxt = "Completed";
          color = "var(--text-color)";
        } else if (s === "CANCELLED") {
          icon = "\u{1F6AB}";
          statusTxt = "Cancelled";
          color = "#e74c3c";
        }
        const titleTxt = `${statusTxt} PTP on ${new Date(ptpRecord.time).toLocaleDateString()}`;
        if (!existingPtpTag) {
          cell.insertAdjacentHTML("beforeend", `<div class="apm-ptp-status-tag" title="${titleTxt}" style="font-size: 11px; margin-top: 4px; display: inline-flex; align-items: center; gap: 4px; color: ${color}; opacity: 0.9;"><span style="font-size:12px;">${icon}</span> PTP</div>`);
        } else if (existingPtpTag.title !== titleTxt) {
          existingPtpTag.title = titleTxt;
          existingPtpTag.style.color = color;
          existingPtpTag.querySelector("span").textContent = icon;
        }
      } else if (existingPtpTag) {
        existingPtpTag.remove();
      }
    } else if (!apmGeneralSettings.ptpTrackingEnabled) {
      cell.querySelector(".apm-ptp-status-tag")?.remove();
    }
    cell.querySelectorAll(".apm-nametag").forEach((tag) => {
      const ruleId = parseFloat(tag.getAttribute("data-cc-id"));
      if (!rowMatches.some((r) => r.id === ruleId && r.showTag)) tag.remove();
    });
    rowMatches.forEach((rule) => {
      if (!rule.showTag || !rule.tag || !rule.regex.test(lowerCellText)) {
        cell.querySelector(`.apm-nametag[data-cc-id="${rule.id}"]`)?.remove();
        return;
      }
      const safeId = rule.id.toString().replace(".", "_");
      const formattedTagText = rule.tag.replace(/\\n/g, "<br>");
      const allTermsCsv = rule.search || "";
      const existingTag = cell.querySelector(`.apm-nametag[data-cc-id="${rule.id}"]`);
      if (!existingTag) {
        cell.insertAdjacentHTML("beforeend", `<div class="apm-nametag" style="background-color: var(--cc-color-${safeId})" title="Click to filter" data-cc-id="${rule.id}" data-filter-kw="${allTermsCsv}">${formattedTagText}</div>`);
      } else {
        existingTag.style.backgroundColor = `var(--cc-color-${safeId})`;
        existingTag.setAttribute("data-filter-kw", allTermsCsv);
        if (existingTag.innerHTML !== formattedTagText) existingTag.innerHTML = formattedTagText;
      }
    });
  }
  function processColorCodeGrid(targetDoc) {
    const doc = targetDoc && targetDoc.querySelectorAll ? targetDoc : document;
    const settings = getSettings();
    const rawRules = getRules();
    if (!settings || !rawRules || !Array.isArray(rawRules)) return;
    const activeRules = getCompiledRules(rawRules);
    const ptpHistory = getPtpHistory();
    const ruleFingerprint = `${settings.uniformHighlight}|${_compiledRulesFingerprint}`;
    if (ruleFingerprint !== _lastRuleFingerprint) {
      _lastRuleFingerprint = ruleFingerprint;
      _rowCacheGeneration++;
      fullStyleUpdate(doc);
    }
    let rowsToProcess = [];
    try {
      const win = doc.defaultView || window;
      if (win.Ext) {
        const grids = win.Ext.ComponentQuery.query("gridpanel:not([destroyed=true])");
        grids.forEach((g) => {
          if (g.rendered && !g.isDestroyed && g.getEl()?.dom?.ownerDocument === doc) {
            const view = g.getView();
            if (view && view.getNodes) rowsToProcess.push(...view.getNodes());
          }
        });
      }
    } catch (e) {
    }
    if (rowsToProcess.length === 0) rowsToProcess = doc.querySelectorAll(".x-grid-item");
    rowsToProcess.forEach((row) => {
      try {
        const textLen = row.textContent.length;
        const lowerText = row.textContent.toLowerCase();
        const cached = _rowCache.get(row);
        const rowMatches = activeRules.filter((r) => r.regex.test(lowerText));
        const fillRule = rowMatches.find((r) => r.fill);
        const tagRulesCount = rowMatches.filter((r) => r.showTag).length;
        const isVisuallyIncomplete = fillRule && !row.getAttribute("data-cc-rule") || tagRulesCount > 0 && !row.querySelector(".apm-nametag") || /[123]\d{8,}/.test(lowerText) && (row.getAttribute("data-apm-linkified") !== "true" || apmGeneralSettings?.ptpTrackingEnabled && !row.querySelector(".apm-ptp-status-tag"));
        if (cached && cached.len === textLen && cached.text === lowerText && cached.gen === _rowCacheGeneration && !isVisuallyIncomplete) {
          return;
        }
        _rowCache.set(row, { len: textLen, text: lowerText, gen: _rowCacheGeneration });
        applyRowColoring(row, fillRule, settings);
        const cells = row.querySelectorAll(".x-grid-cell-inner");
        cells.forEach((cell) => applyCellProcessors(cell, rowMatches, ptpHistory));
      } catch (e) {
        APMLogger.error("ColorCode", "Row processing error:", e);
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
            el2.insertAdjacentHTML("beforeend", `<span class="apm-copy-icon" title="Copy link to clipboard" data-wo-copy-url="${buildSafeWoUrl(woNum)}"></span>`);
          }
          if (apmGeneralSettings.ptpTrackingEnabled) {
            const ptpRecord = ptpHistory[woNum];
            const existingPtpTag = doc.querySelector(".apm-ptp-status-tag-header");
            if (ptpRecord) {
              const s = ptpRecord.status;
              let icon = "\u23F3", statusTxt = "Incomplete", color = "#f39c12";
              if (s === "COMPLETE") {
                icon = "\u2705";
                statusTxt = "Completed";
                color = "var(--text-color)";
              } else if (s === "CANCELLED") {
                icon = "\u{1F6AB}";
                statusTxt = "Cancelled";
                color = "#e74c3c";
              }
              const titleTxt = `${statusTxt} PTP on ${new Date(ptpRecord.time).toLocaleDateString()}`;
              const newHtml = `<span class="apm-ptp-status-tag-header" title="${titleTxt}" style="font-size: 13px; margin-left: 8px; display: inline-flex; align-items: center; gap: 4px; color: ${color}; opacity: 1.0; cursor: help; white-space: nowrap;"><span style="font-size:14px;">${icon}</span> PTP</span>`;
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
      APMLogger.error("ColorCode", "Record view processing error:", e);
    }
  }
  function setupExtGridListeners(win) {
    if (!win.Ext || !win.Ext.override || win.__apmHooksInjected) return;
    try {
      win.addEventListener("APM_PTP_UPDATED_EVENT", () => {
        _rowCacheGeneration++;
        debouncedProcessColorCodeGrid(win.document, true);
      });
      win.Ext.override(win.Ext.view.Table, {
        refresh: function() {
          this.callParent(arguments);
          debouncedProcessColorCodeGrid(this.el?.dom?.ownerDocument);
        },
        onAdd: function() {
          this.callParent(arguments);
          debouncedProcessColorCodeGrid(this.el?.dom?.ownerDocument);
        },
        onUpdate: function() {
          this.callParent(arguments);
          debouncedProcessColorCodeGrid(this.el?.dom?.ownerDocument);
        }
      });
      win.Ext.ComponentQuery.query("gridpanel, treepanel").forEach((grid) => {
        const view = grid.getView();
        if (view && !view._apmHooksInjected) {
          const trigger = () => debouncedProcessColorCodeGrid(view.el?.dom?.ownerDocument);
          view.on("refresh", trigger);
          view.on("itemadd", trigger);
          view.on("itemupdate", trigger);
          view.on("bufferedrefresh", trigger);
          view.on("viewready", trigger);
          if (view.rendered && view.el && view.el.dom) {
            view.el.dom.addEventListener("scroll", trigger, { passive: true });
          } else {
            view.on("render", () => view.el?.dom?.addEventListener("scroll", trigger, { passive: true }));
          }
          view._apmHooksInjected = true;
        }
      });
      if (!win._APM_CC_LOCAL_PULSE) {
        win._APM_CC_LOCAL_PULSE = setInterval(() => {
          debouncedProcessColorCodeGrid(win.document);
        }, 1500);
      }
      win.__apmHooksInjected = true;
    } catch (e) {
    }
  }
  var _ccProcessTO = null;
  var _ccLastRun = 0;
  var _ccFirstRequestTime = 0;
  var DEBOUNCE_MS = 100;
  var THROTTLE_MS = 250;
  var _ccPendingContexts = /* @__PURE__ */ new Set();
  function debouncedProcessColorCodeGrid(targetContext, forceImmediate = false) {
    if (targetContext && targetContext.nodeType === 9) {
      _ccPendingContexts.add(targetContext);
    }
    const now = Date.now();
    const run = () => {
      _ccProcessTO = null;
      _ccFirstRequestTime = 0;
      requestAnimationFrame(() => {
        const start = performance.now();
        _ccLastRun = Date.now();
        let count = 0;
        if (_ccPendingContexts.size > 0) {
          _ccPendingContexts.forEach((ctx) => {
            try {
              if (ctx && ctx.readyState !== "loading") {
                processColorCodeGrid(ctx);
                count++;
              }
            } catch (e) {
            }
          });
          _ccPendingContexts.clear();
        } else {
          processColorCodeGrid(document);
          count++;
          document.querySelectorAll("iframe").forEach((f) => {
            try {
              const fd = f.contentDocument;
              if (fd && fd.readyState !== "loading") {
                processColorCodeGrid(fd);
                count++;
              }
            } catch (e) {
            }
          });
        }
        const end = performance.now();
        APMLogger.debug("ColorCode", `Grid processing took ${(end - start).toFixed(2)}ms for ${count} frames (Immediate: ${forceImmediate})`);
      });
    };
    if (forceImmediate) {
      if (_ccProcessTO) clearTimeout(_ccProcessTO);
      run();
      return;
    }
    if (now - _ccLastRun > 500) {
      if (_ccProcessTO) clearTimeout(_ccProcessTO);
      run();
      return;
    }
    if (!_ccFirstRequestTime) _ccFirstRequestTime = now;
    if (now - _ccFirstRequestTime > THROTTLE_MS) {
      if (_ccProcessTO) clearTimeout(_ccProcessTO);
      run();
      return;
    }
    clearTimeout(_ccProcessTO);
    _ccProcessTO = setTimeout(run, DEBOUNCE_MS);
  }
  function invalidateColorCodeCache(targetContext) {
    _rowCacheGeneration++;
    _lastRuleFingerprint = "";
    debouncedProcessColorCodeGrid(targetContext, true);
  }
  var globalWin = apmGetGlobalWindow();
  if (globalWin) {
    globalWin._APM = globalWin._APM || {};
    globalWin._APM.invalidateColorCodeCache = invalidateColorCodeCache;
    globalWin._APM.debouncedProcessColorCodeGrid = debouncedProcessColorCodeGrid;
    globalWin._APM.fullStyleUpdate = fullStyleUpdate;
    globalWin.addEventListener("APM_CC_SYNC_REQUIRED", () => {
      fullStyleUpdate();
      invalidateColorCodeCache();
    });
  }

  // src/modules/colorcode/colorcode-ui.js
  init_constants();
  function setupColorCodeLogic() {
    let banner = document.getElementById("apm-filter-banner");
    if (!banner) {
      banner = document.createElement("div");
      banner.id = "apm-filter-banner";
      banner.className = "apm-ui-panel";
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
      renderRules();
    };
    const elUniform = document.getElementById("cc-setting-uniform");
    if (elUniform) elUniform.onchange = (e) => {
      setSettings({ uniformHighlight: e.target.checked });
      const lbl = document.getElementById("cc-uniform-label");
      if (lbl) lbl.textContent = e.target.checked ? "Uniform Shading" : "Alternating Shading";
    };
    const elTheme = document.getElementById("cc-setting-theme");
    if (elTheme) elTheme.onchange = (e) => {
      const val = e.target.value;
      setSettings({ theme: val });
      Promise.resolve().then(() => (init_theme_resolver(), theme_resolver_exports)).then(({ ThemeResolver: ThemeResolver2 }) => {
        ThemeResolver2.setGlobalTheme(val);
      });
      if (confirm("Reload to apply theme?")) {
        window.top.location.href = SESSION_TIMEOUT_URL;
      }
    };
    const elCancelBtn = document.getElementById("cc-cancel-btn");
    if (elCancelBtn) elCancelBtn.onclick = resetForm;
    const elFillBtn = document.getElementById("cc-btn-fill");
    if (elFillBtn) elFillBtn.onclick = () => {
      elFillBtn.classList.toggle("active");
      elFillBtn.style.background = elFillBtn.classList.contains("active") ? "#34495e" : "rgba(74, 90, 106, 0.4)";
      updatePreview();
    };
    const elTagBtn = document.getElementById("cc-btn-tag");
    if (elTagBtn) elTagBtn.onclick = () => {
      elTagBtn.classList.toggle("active");
      elTagBtn.style.background = elTagBtn.classList.contains("active") ? "#34495e" : "rgba(74, 90, 106, 0.4)";
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
    const ccSearch = document.getElementById("cc-search");
    const ccTag = document.getElementById("cc-tag");
    if (ccSearch && !ccSearch._apmListenersAttached) {
      ["keydown", "keyup", "keypress"].forEach((evt) => {
        ccSearch.addEventListener(evt, (e) => {
          if (e.key !== "Tab") e.stopPropagation();
        });
      });
      ccSearch.addEventListener("keydown", handleEnter);
      ccSearch._apmListenersAttached = true;
    }
    if (ccTag && !ccTag._apmListenersAttached) {
      ["keydown", "keyup", "keypress"].forEach((evt) => {
        ccTag.addEventListener(evt, (e) => {
          if (e.key !== "Tab") e.stopPropagation();
        });
      });
      ccTag.addEventListener("keydown", handleEnter);
      ccTag._apmListenersAttached = true;
    }
    const elExportBtn = document.getElementById("cc-export-btn");
    if (elExportBtn) elExportBtn.onclick = () => {
      try {
        navigator.clipboard.writeText(JSON.stringify(getRules(), null, 2)).then(() => alert("Configuration code copied!"));
      } catch (e) {
        alert("Export error.");
      }
    };
    const elImportBtn = document.getElementById("cc-import-btn");
    if (elImportBtn) elImportBtn.onclick = () => {
      const input = prompt("Paste configuration code:");
      if (input && input.trim()) {
        try {
          let importedRules;
          const trimmed = input.trim();
          if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
            importedRules = JSON.parse(trimmed);
          } else {
            importedRules = JSON.parse(decodeURIComponent(escape(atob(trimmed))));
          }
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
  init_toast();
  init_logger();
  init_utils();
  init_state();
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
              APMLogger.warn("TabGridOrder", "Grid column reorder failed:", e);
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
              APMLogger.warn("TabGridOrder", "Tab reorder failed silently to prevent crash:", e);
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
  if (typeof window !== "undefined") {
    window._APM = window._APM || {};
    window._APM.applyGridConsistency = applyGridConsistency;
    window._APM.applyTabConsistency = applyTabConsistency;
    window.addEventListener("APM_PRESETS_SYNC_REQUIRED", () => {
      applyTabConsistency();
      applyGridConsistency();
    });
  }

  // src/ui/settings-panel.js
  init_utils();
  init_state();
  init_constants();
  function createMainPanel() {
    const panel = document.createElement("div");
    panel.id = "apm-settings-panel";
    panel.className = "apm-settings-container apm-ui-panel";
    const dpr = window.devicePixelRatio || 1;
    if (dpr < 1) {
      panel.style.zoom = 1 / dpr;
    }
    const margin = 20;
    const vHeight = window.innerHeight;
    const vWidth = window.innerWidth;
    const panelWidth = 440;
    const panelHeight = 580;
    let topPos = 60;
    let rightPos = margin;
    if (topPos + panelHeight > vHeight) topPos = Math.max(10, vHeight - panelHeight - margin);
    if (rightPos + panelWidth > vWidth) rightPos = Math.max(10, vWidth - panelWidth - margin);
    panel.style.top = topPos + "px";
    panel.style.right = rightPos + "px";
    return panel;
  }
  function createHeader() {
    return el("div", { className: "apm-settings-header" }, [
      el("h4", { className: "apm-settings-title" }, "APM Master"),
      el("button", { id: "apm-c-btn-close", className: "apm-settings-close-btn" }, "\u2716")
    ]);
  }
  function createTabContainer() {
    return el("div", { id: "apm-tab-container", className: "apm-tab-container" }, [
      el("div", { id: "tab-autofill", className: "apm-tab-btn apm-tab-active-autofill" }, "Auto Fill Profiles"),
      el("div", { id: "tab-settings", className: "apm-tab-btn apm-tab-inactive" }, "Tab Order"),
      el("div", { id: "tab-colorcode", className: "apm-tab-btn apm-tab-inactive" }, "ColorCode & Theme"),
      el("div", { id: "tab-general", className: "apm-tab-btn apm-tab-inactive" }, "General")
    ]);
  }
  function createHelpOverlay() {
    return el("div", { id: "apm-help-overlay", className: "apm-help-overlay apm-ui-panel", style: { display: "none" } }, [
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
  }
  function createChangelogModal() {
    return el("div", { id: "apm-changelog-modal", className: "apm-help-overlay apm-ui-panel", style: { display: "none" } }, [
      el("div", { className: "apm-help-modal", style: { width: "450px" } }, [
        el("div", { className: "apm-help-header" }, [
          el("h4", { className: "apm-help-title" }, "Revision History"),
          el("button", { id: "apm-changelog-close", className: "apm-help-close" }, "\u2716")
        ]),
        el("div", { className: "apm-help-content", style: { fontSize: "12px", lineHeight: "1.6" } }, [
          el("div", { style: { marginBottom: "15px", borderBottom: "1px solid #45535e", paddingBottom: "10px" } }, [
            el("b", { style: { color: "#1abc9c", display: "block", marginBottom: "5px" } }, "Current Improvements (v14.3.x)"),
            el("ul", { style: { paddingLeft: "20px", margin: "0" } }, [
              el("li", {}, "Implemented Unified Cross-Domain Storage for consistent settings across subdomains (Benefits PTP, Timeout Redirect, Etc)"),
              el("li", {}, "Improved global messaging system for better multi-frame synchronization (Improves reliability of tab order config, etc)"),
              el("li", {}, "Centralized scheduler and synchronization for better performance"),
              el("li", {}, "Implemented early dataspy feature, supports multi keyword OR match AND exclusion Eg: Contains A OR B AND not C"),
              el("li", {}, "Enhanced session token and login detection for labor tracking"),
              el("li", {}, "Interface layout and styling refinements"),
              el("li", {}, "Added support for European date format selection"),
              el("li", {}, "Implemented Quick Book Labor feature"),
              el("li", {}, "Further refactoring of code for easier future additions"),
              el("li", {}, "Mitigated page load flash when using dark mode"),
              el("li", {}, "Significantly improved efficiency & speed of ColorCode engine, by co-opting ExtJS stores to locate rule matches and apply styles, skipping expensive DOM traversal")
            ])
          ]),
          el("div", { style: { marginBottom: "15px", borderBottom: "1px solid #45535e", paddingBottom: "10px" } }, [
            el("b", { style: { color: "#3498db", display: "block", marginBottom: "5px" } }, "Planned Features"),
            el("ul", { style: { paddingLeft: "20px", margin: "0" } }, [
              el("li", {}, "Pay off tech debt"),
              el("li", {}, "Global configuration export/import"),
              el("li", {}, "ColorCode rule pause button"),
              el("li", {}, "Relative date filtering for ColorCode rules"),
              el("li", {}, "Expanded hyperlink support for non-work order records")
            ])
          ]),
          el("div", {}, [
            el("b", { style: { color: "#3498db", display: "block", marginBottom: "5px" } }, "Planned Research"),
            el("ul", { style: { paddingLeft: "20px", margin: "0" } }, [
              el("li", {}, "More applications to utilize Direct ExtJS modification of the APM Framework, or even direct AJAX server requests like we do with Labor Tally already and partially with Labor Booking, such as:"),
              el("li", {}, "Mass work order editing and labor booking"),
              el("li", {}, "Possible personalized/custom shift snapshot/report depending on manager/smrt/mrt could be just WOs closed, assigned, multiple employees overview, etc but thats getting pretty advanced and far off I think"),
              el("li", {}, "Session state snapshot to bring you back exactly where you were before session timeout")
            ])
          ])
        ])
      ])
    ]);
  }
  function buildSettingsPanel() {
    window._APM = window._APM || {};
    window._APM.buildSettingsPanel = buildSettingsPanel;
    if (window.self !== window.top || document.getElementById("apm-settings-panel")) return;
    const panel = createMainPanel();
    const helpOverlay = createHelpOverlay();
    const changelogModal = createChangelogModal();
    const header = createHeader();
    const tabContainer = createTabContainer();
    const autofillFields = buildAutoFillTab();
    const tabOrderFields = buildTabOrderTab();
    const colorcodeFields = buildColorCodeTab();
    const generalFields = buildGeneralTab();
    const footer = createFooter();
    panel.appendChild(header);
    panel.appendChild(tabContainer);
    panel.appendChild(autofillFields);
    panel.appendChild(tabOrderFields);
    panel.appendChild(colorcodeFields);
    panel.appendChild(generalFields);
    panel.appendChild(footer);
    document.body.appendChild(panel);
    document.body.appendChild(helpOverlay);
    document.body.appendChild(changelogModal);
    const state = {
      settingsMode: "cols",
      activeTab: "autofill",
      panel,
      autofillFields,
      tabOrderFields,
      colorcodeFields,
      generalFields,
      footer
    };
    bindSettingsEvents(state);
  }
  function buildAutoFillTab() {
    return el("div", { id: "apm-main-fields", className: "apm-panel-section" }, [
      el("div", { className: "apm-template-box" }, [
        el("div", { className: "apm-template-label" }, "Active Template:"),
        el("div", { className: "apm-template-row" }, [
          el("select", { id: "apm-c-preset-select", className: "apm-template-select" }),
          el("button", { id: "apm-c-btn-save", className: "creator-btn apm-template-btn-update", title: "Update selection" }, "Update"),
          el("button", { id: "apm-c-btn-new", className: "creator-btn apm-template-btn-new", title: "Create a fresh template" }, "New Template"),
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
          ]),
          el("div", { className: "field-row", style: { width: "85px", margin: "0", height: "28px" } }, [
            el("div", { className: "field-label", style: { width: "35px", textAlign: "right", fontSize: "10px", color: "#1abc9c", fontWeight: "bold", lineHeight: "1", display: "flex", flexDirection: "column", justifyContent: "center", marginRight: "5px" } }, [
              el("span", {}, "Book"),
              el("span", {}, "Labor:")
            ]),
            el("input", { type: "text", id: "apm-c-labor-hours", className: "field-input", placeholder: "0", style: { height: "24px", padding: "0", fontSize: "11px", border: "1px solid #1abc9c", textAlign: "center", width: "40px" } })
          ])
        ]),
        el("div", { className: "field-row", style: { margin: "0", alignItems: "flex-start" } }, [
          el("div", { className: "field-label", style: { width: "50px", textAlign: "left", fontSize: "11px", marginTop: "5px" } }, "Closing:"),
          el("textarea", { id: "apm-c-close", className: "field-input apm-textarea-input", placeholder: "Closing comments..." })
        ])
      ])
    ]);
  }
  function buildTabOrderTab() {
    return el("div", { id: "apm-settings-fields", style: { display: "none" } }, [
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
  }
  function buildColorCodeTab() {
    return el("div", { id: "apm-colorcode-fields", style: { display: "none", paddingBottom: "5px" } }, [
      el("div", { className: "apm-cc-search-box", style: { background: "#22292f", padding: "12px", borderRadius: "6px", border: "1px solid #45535e", marginBottom: "15px" } }, [
        el("div", { style: { display: "flex", gap: "10px", marginBottom: "12px" } }, [
          el("div", { style: { flex: "1" } }, [
            el("div", { style: { fontSize: "11px", color: "#95a5a6", marginBottom: "4px", fontWeight: "bold" } }, "Keyword (Search)"),
            el("input", { type: "text", id: "cc-search", className: "field-input", placeholder: "Match multiple keywords separated by, comma,", style: { height: "30px", fontSize: "12px", width: "100%", boxSizing: "border-box" } })
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
          el("div", { style: { display: "flex", gap: "8px" } }, [
            el("button", { id: "cc-btn-fill", className: "apm-cc-style-btn active", title: "Fill Row Background", style: { padding: "0 12px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #45535e", borderRadius: "4px", background: "#34495e", cursor: "pointer", color: "white", transition: "all 0.2s", fontSize: "11px", fontWeight: "bold" } }, "Fill Row"),
            el("button", { id: "cc-btn-tag", className: "apm-cc-style-btn active", title: "Show Nametag", style: { padding: "0 12px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #45535e", borderRadius: "4px", background: "#34495e", cursor: "pointer", color: "white", transition: "all 0.2s", fontSize: "11px", fontWeight: "bold" } }, "Name Tag")
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
  }
  function buildGeneralTab() {
    return el("div", { id: "apm-general-fields", style: { display: "none" }, className: "apm-general-box" }, [
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
          el("option", { value: "eu" }, "DD/MM/YYYY"),
          el("option", { value: "mon" }, "DD-MON-YYYY")
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
      ]),
      el("div", { className: "apm-general-item", style: { borderTop: "1px solid #45535e", paddingTop: "10px", marginTop: "10px" } }, [
        el("div", {}, [
          el("div", { className: "apm-general-title", style: { color: "#3498db" } }, "Interface Theme"),
          el("div", { className: "apm-general-desc" }, "Choose the global visual style for APM elements.")
        ]),
        el("select", { id: "cc-setting-theme", className: "apm-cc-theme-select", style: { width: "125px" } }, [
          el("option", { value: "default" }, "System Default"),
          el("option", { value: "theme-hex-dark" }, "Dark Hex"),
          el("option", { value: "theme-dark" }, "Dark Classic"),
          el("option", { value: "theme-darkblue" }, "Dark Blue"),
          el("option", { value: "theme-hex" }, "Light Hex"),
          el("option", { value: "theme-orange" }, "Orange")
        ])
      ]),
      // Software & Updates Section
      el("div", { className: "apm-settings-section", style: { borderTop: "1px solid #45535e", padding: "15px 0", marginTop: "10px" } }, [
        el("h4", { style: { margin: "0 0 12px 0", color: "#1abc9c", fontSize: "14px", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "1px" } }, "Software & Updates"),
        el("div", { className: "apm-general-item", style: { border: "none", padding: "5px 0" } }, [
          el("div", { style: { flex: "1" } }, [
            el("div", { className: "apm-general-title" }, "Diagnostic Logging"),
            el("div", { className: "apm-general-desc" }, "Adjust information verbosity in the console.")
          ]),
          el("select", { id: "gen-setting-log-level", className: "apm-cc-theme-select", style: { width: "120px" } }, [
            el("option", { value: "error" }, "Error Only"),
            el("option", { value: "warn" }, "Warning"),
            el("option", { value: "info" }, "Info"),
            el("option", { value: "debug" }, "Debug"),
            el("option", { value: "verbose" }, "Verbose")
          ])
        ]),
        el("div", { className: "apm-general-item", style: { border: "none", padding: "5px 0" } }, [
          el("div", { style: { flex: "1" } }, [
            el("div", { className: "apm-general-title" }, "Update Track"),
            el("div", { className: "apm-general-desc" }, "Stable releases or cutting-edge Beta builds.")
          ]),
          el("select", { id: "gen-setting-update-track", className: "apm-cc-theme-select", style: { width: "120px" } }, [
            el("option", { value: "stable" }, "Stable Release"),
            el("option", { value: "beta" }, "Beta / vNext")
          ])
        ]),
        el("div", { className: "apm-general-item", style: { border: "none", padding: "5px 0" } }, [
          el("div", { style: { flex: "1" } }, [
            el("div", { className: "apm-general-title" }, "Manual Version Check"),
            el("div", { className: "apm-general-desc" }, "Check for the latest version manually.")
          ]),
          el("button", { id: "apm-btn-check-updates", className: "apm-footer-help-btn-box", style: { width: "100px", height: "30px", fontSize: "11px", minWidth: "100px" } }, "Check Now")
        ])
      ])
    ]);
  }
  function createFooter() {
    return el("div", { className: "apm-footer" }, [
      el("div", { id: "cc-footer-btns", style: { display: "none", justifyContent: "space-between", gap: "8px", marginBottom: "10px", padding: "0 5px" } }, [
        el("button", { id: "cc-export-btn", className: "cc-footer-btn", title: "Export Rules to Clipboard" }, "\u{1F4E4} Export Config"),
        el("button", { id: "cc-import-btn", className: "cc-footer-btn", title: "Import Rules" }, "\u{1F4E5} Import Config")
      ]),
      el("div", { id: "apm-settings-update-container", style: { display: "none", marginBottom: "8px" } }, [
        el("a", { href: UPDATE_URL, target: "_blank", className: "apm-footer-update-btn" }, "\u2728 Update Available")
      ]),
      el("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", padding: "0 8px" } }, [
        el("a", { href: "https://github.com/jaker788-create/APM-Master/issues", target: "_blank", style: { flex: "1", color: "#3498db", fontSize: "11px", textDecoration: "none", fontWeight: "bold", textAlign: "left" } }, "\u{1F41B} Bug Report"),
        el("div", { style: { flex: "1", display: "flex", justifyContent: "center" } }, [
          el("button", { id: "apm-c-btn-help", className: "apm-footer-help-btn-box", style: { padding: "6px 14px", fontSize: "12px", minWidth: "80px" } }, "\u2139\uFE0F Help & Tips")
        ]),
        el("span", { id: "apm-v-changelog", style: { flex: "1", color: "#1abc9c", fontSize: "11px", textAlign: "right", paddingRight: "5px", cursor: "pointer", fontWeight: "bold" } }, `v${CURRENT_VERSION}`)
      ])
    ]);
  }
  function bindSettingsEvents(state) {
    const {
      panel,
      autofillFields,
      tabOrderFields,
      colorcodeFields,
      generalFields,
      footer
    } = state;
    const selectEl = document.getElementById("apm-c-preset-select");
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
      APMLogger.error("Settings", "Error initializing settings panel listeners:", e);
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
      const logVal = document.getElementById("gen-setting-log-level");
      if (logVal) {
        logVal.value = apmGeneralSettings.logLevel || "error";
        logVal.onchange = (e) => setGeneralSetting("logLevel", e.target.value);
      }
      const trackVal = document.getElementById("gen-setting-update-track");
      if (trackVal) {
        trackVal.value = apmGeneralSettings.updateTrack || "stable";
        trackVal.onchange = (e) => {
          setGeneralSetting("updateTrack", e.target.value);
          checkForGlobalUpdates(true);
        };
      }
      subscribeToUpdates(() => {
        const updateContainer = document.getElementById("apm-settings-update-container");
        if (updateContainer) updateContainer.style.display = "block";
        const updateLink = document.getElementById("apm-footer-update-link");
        if (updateLink && window._apmUpdateUrl) {
          updateLink.href = window._apmUpdateUrl;
          if (window._apmRemoteVersion) {
            updateLink.textContent = `\u2728 Update to v${window._apmRemoteVersion} Available`;
          }
        }
        const checkBtn2 = document.getElementById("apm-btn-check-updates");
        if (checkBtn2) checkBtn2.style.display = "none";
      });
      const checkBtn = document.getElementById("apm-btn-check-updates");
      if (checkBtn) {
        checkBtn.onclick = () => {
          checkBtn.textContent = "Checking...";
          checkBtn.disabled = true;
          checkForGlobalUpdates(true);
          setTimeout(() => {
            if (checkBtn) {
              checkBtn.textContent = "Up to Date";
              setTimeout(() => {
                if (checkBtn) {
                  checkBtn.textContent = "Check for Updates";
                  checkBtn.disabled = false;
                }
              }, 3e3);
            }
          }, 1500);
        };
      }
    } catch (e) {
      APMLogger.error("Settings", "Error binding general listeners:", e);
    }
    const resetTabs = () => {
      [tabAutofill, tabSettings, tabColorcode, tabGeneral].forEach((t) => {
        t.className = "apm-tab-btn apm-tab-inactive";
      });
      document.getElementById("apm-tab-container").style.display = "flex";
      const ccFooterTools = document.getElementById("cc-footer-btns");
      if (ccFooterTools) ccFooterTools.style.display = "none";
    };
    const loadSettingsView = () => {
      const resetBtn = document.getElementById("apm-s-btn-reset");
      const titleEl = document.getElementById("apm-s-title");
      if (state.settingsMode === "cols") {
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
    const performAutoFetch = () => {
      if (state.settingsMode === "cols") {
        const cols = probeExtGridColumns();
        renderDragList(state, colListContainer, cols, "No grid found. Open the Work Orders screen.");
      } else {
        const tabs = probeExtTabs();
        renderDragList(state, colListContainer, tabs, "No record tabs found. Open a Work Order.");
      }
    };
    togCols.onclick = () => {
      state.settingsMode = "cols";
      loadSettingsView();
    };
    togTabs.onclick = () => {
      state.settingsMode = "tabs";
      invalidateTabCache();
      loadSettingsView();
    };
    tabAutofill.onclick = () => {
      state.activeTab = "autofill";
      resetTabs();
      tabAutofill.className = "apm-tab-btn apm-tab-active-autofill";
      autofillFields.style.display = "block";
      tabOrderFields.style.display = "none";
      colorcodeFields.style.display = "none";
      generalFields.style.display = "none";
      renderPresetOptions(selectEl);
    };
    tabSettings.onclick = () => {
      state.activeTab = "settings";
      resetTabs();
      tabSettings.className = "apm-tab-btn apm-tab-active-autofill";
      autofillFields.style.display = "none";
      tabOrderFields.style.display = "block";
      colorcodeFields.style.display = "none";
      generalFields.style.display = "none";
      loadSettingsView();
    };
    tabColorcode.onclick = () => {
      state.activeTab = "colorcode";
      resetTabs();
      tabColorcode.className = "apm-tab-btn apm-tab-active-autofill";
      autofillFields.style.display = "none";
      tabOrderFields.style.display = "none";
      colorcodeFields.style.display = "block";
      generalFields.style.display = "none";
      const ccFooterTools = document.getElementById("cc-footer-btns");
      if (ccFooterTools) ccFooterTools.style.display = "flex";
    };
    tabGeneral.onclick = () => {
      state.activeTab = "general";
      resetTabs();
      tabGeneral.className = "apm-tab-btn apm-tab-active-autofill";
      autofillFields.style.display = "none";
      tabOrderFields.style.display = "none";
      colorcodeFields.style.display = "none";
      generalFields.style.display = "block";
    };
    document.getElementById("apm-c-btn-help").onclick = () => {
      document.getElementById("apm-help-overlay").style.display = "flex";
    };
    document.getElementById("apm-help-close").onclick = (e) => {
      e.stopPropagation();
      document.getElementById("apm-help-overlay").style.display = "none";
    };
    document.getElementById("apm-help-overlay").onclick = (e) => {
      if (e.target.id === "apm-help-overlay") {
        e.target.style.display = "none";
      }
    };
    document.getElementById("apm-v-changelog").onclick = () => {
      document.getElementById("apm-changelog-modal").style.display = "flex";
    };
    document.getElementById("apm-changelog-close").onclick = () => {
      document.getElementById("apm-changelog-modal").style.display = "none";
    };
    document.getElementById("apm-changelog-modal").onclick = (e) => {
      if (e.target.id === "apm-changelog-modal") {
        e.target.style.display = "none";
      }
    };
    selectEl.addEventListener("change", () => {
      const presets = getPresets();
      const selected = selectEl.value;
      if (selected && presets.autofill[selected]) {
        applyPresetData(presets.autofill[selected]);
      }
    });
    document.getElementById("apm-c-btn-save").onclick = () => {
      const presets = getPresets();
      if (selectEl.value) {
        updatePresetAutofill(selectEl.value, getCurrentFormData());
        showToast(`Template "${selectEl.value}" Updated!`, "#2ecc71");
      } else {
        showToast("No template selected to update.", "#e74c3c");
      }
    };
    document.getElementById("apm-c-btn-new").onclick = () => {
      const name = prompt("Enter a name for the new template:");
      if (name && name.trim()) {
        const safeName = name.trim();
        const emptyData = {
          keyword: "",
          org: "",
          eq: "",
          type: "",
          status: "",
          exec: "",
          safety: "",
          lotoMode: "none",
          pmChecks: 0,
          prob: "",
          fail: "",
          cause: "",
          assign: "",
          start: "",
          end: "",
          close: "",
          laborHours: ""
        };
        updatePresetAutofill(safeName, emptyData);
        renderPresetOptions(selectEl);
        selectEl.value = safeName;
        applyPresetData(emptyData);
        showToast(`Template "${safeName}" Created!`, "#3498db");
      }
    };
    document.getElementById("apm-c-btn-del").onclick = () => {
      if (selectEl.value && confirm(`Delete template "${selectEl.value}"?`)) {
        const deletedName = selectEl.value;
        updatePresetAutofill(deletedName, null);
        renderPresetOptions(selectEl);
        showToast(`Template "${deletedName}" Deleted.`, "#e74c3c");
      }
    };
    document.getElementById("apm-s-btn-save-settings").onclick = () => {
      const items = [...colListContainer.querySelectorAll(".apm-col-item")];
      if (items.length > 0) {
        const visibleItems = items.filter((el2) => el2.dataset.hidden !== "true");
        const orderStr = visibleItems.map((el2) => el2.dataset.index).join(", ");
        if (state.settingsMode === "cols") {
          updatePresetConfig({ columnOrder: orderStr });
          showToast("Grid Column order saved!", "#2ecc71");
        } else {
          updatePresetConfig({ tabOrder: orderStr });
          const presets = getPresets();
          const hiddenCount = (presets.config.hiddenTabs || []).length;
          showToast(`Tab layout saved! (${hiddenCount} hidden)`, "#2ecc71");
        }
      } else {
        showToast("No items to save.", "#e74c3c");
      }
    };
    document.getElementById("apm-s-btn-reset").onclick = () => {
      if (!confirm("Reset layout to system defaults?")) return;
      const presets = getPresets();
      if (state.settingsMode === "tabs") {
        updatePresetConfig({ tabOrder: "", hiddenTabs: [] });
        invalidateTabCache();
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
                  if (!mainTP.isDestroyed && typeof mainTP.updateLayout === "function") mainTP.updateLayout();
                }
              }
            }
          } catch (e) {
          }
        }
        showToast("Tab layout reset to system defaults!", "#3498db");
        performAutoFetch();
      } else {
        updatePresetConfig({ columnOrder: "" });
        showToast("Column layout reset to defaults!", "#3498db");
        performAutoFetch();
      }
    };
    if (state.activeTab === "autofill") tabAutofill.onclick();
    else tabSettings.onclick();
  }
  function applyPresetData(data) {
    if (!data) data = {};
    const fields = [
      "keyword",
      "org",
      "eq",
      "type",
      "status",
      "exec",
      "safety",
      "loto-mode",
      "pm-checks",
      "prob",
      "fail",
      "cause",
      "assign",
      "start",
      "end",
      "close",
      "labor-hours"
    ];
    fields.forEach((f) => {
      const el2 = document.getElementById(`apm-c-${f}`);
      if (el2) {
        const key = f.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
        el2.value = data[key] || (f === "loto-mode" ? "none" : "");
      }
    });
  }
  function renderPresetOptions(selectEl) {
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
  }
  function renderDragList(state, colListContainer, itemsArray, emptyMsg) {
    colListContainer.innerHTML = "";
    if (itemsArray.length === 0) {
      colListContainer.innerHTML = `<div style="color:#7f8c8d; text-align:center; padding:10px;">${emptyMsg}</div>`;
      return;
    }
    const presets = getPresets();
    if (!presets.config.hiddenTabs) presets.config.hiddenTabs = [];
    const isTabsMode = state.settingsMode === "tabs";
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
        item.dataset.hidden = "true";
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
          if (!presets.config.hiddenTabs.includes(tabName)) presets.config.hiddenTabs.push(tabName);
          renderDragList(state, colListContainer, itemsArray, emptyMsg);
        };
      });
      colListContainer.querySelectorAll(".apm-tab-restore-btn").forEach((btn) => {
        btn.onclick = (e) => {
          e.stopPropagation();
          if (!presets.config.hiddenTabs) presets.config.hiddenTabs = [];
          const tabName = btn.getAttribute("data-tab-name");
          presets.config.hiddenTabs = presets.config.hiddenTabs.filter((t) => t !== tabName);
          renderDragList(state, colListContainer, itemsArray, emptyMsg);
        };
      });
    }
    colListContainer.ondragover = (e) => {
      e.preventDefault();
      const dragging = document.querySelector(".dragging");
      if (!dragging) return;
      const siblings = [...colListContainer.querySelectorAll(".apm-col-item:not(.dragging)")];
      const nextSibling = siblings.find((sibling) => {
        const box = sibling.getBoundingClientRect();
        return e.clientY <= box.top + box.height / 2;
      });
      if (nextSibling) colListContainer.insertBefore(dragging, nextSibling);
      else colListContainer.appendChild(dragging);
    };
  }
  function getCurrentFormData() {
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
      close: document.getElementById("apm-c-close").value,
      laborHours: document.getElementById("apm-c-labor-hours").value
    };
  }

  // src/ui/toolbar-injection.js
  init_scheduler();
  init_utils();
  init_logger();
  init_ui_manager();
  var tbWin = apmGetGlobalWindow();
  function injectToggleBtnNatively() {
    if (!isTopFrame()) return;
    const topDoc = tbWin.top.document;
    if (!window._apmForecastToggleBound) {
      window._apmForecastToggleBound = true;
      window.addEventListener("APM_TOGGLE_FORECAST", (e) => {
        APMLogger.debug("APM Master", "Event: APM_TOGGLE_FORECAST fired.");
        UIManager.toggle("eam-forecast-panel", () => {
          let panel = document.getElementById("eam-forecast-panel");
          if (!panel && typeof window._APM?.buildForecastUI === "function") {
            window._APM.buildForecastUI();
            panel = document.getElementById("eam-forecast-panel");
          }
          if (!panel) {
            APMLogger.error("APM Master", "Failed to find/build eam-forecast-panel");
            return;
          }
          const top = e.detail.bottom + 6;
          const panelWidth = 460;
          let targetLeft = e.detail.left + e.detail.width / 2 - panelWidth / 2;
          if (targetLeft + panelWidth > window.innerWidth - 10) targetLeft = window.innerWidth - panelWidth - 10;
          if (targetLeft < 10) targetLeft = 10;
          panel.style.top = top + "px";
          panel.style.left = targetLeft + "px";
          panel.style.display = "block";
          panel.style.visibility = "visible";
          const naturalHeight = panel.scrollHeight || panel.offsetHeight;
          const availableHeight = window.innerHeight - top - 20;
          if (naturalHeight > availableHeight) {
            panel.style.zoom = (availableHeight / naturalHeight).toFixed(3);
          } else {
            panel.style.zoom = "1";
          }
          APMLogger.info("APM Master", "Forecast panel opened.");
        });
      });
      window.addEventListener("APM_TOGGLE_SETTINGS", (e) => {
        APMLogger.debug("APM Master", "Event: APM_TOGGLE_SETTINGS fired.");
        UIManager.toggle("apm-settings-panel", () => {
          let p = document.getElementById("apm-settings-panel");
          if (!p && typeof window._APM?.buildSettingsPanel === "function") {
            window._APM.buildSettingsPanel();
            p = document.getElementById("apm-settings-panel");
          }
          if (!p) return;
          const top = e.detail.bottom + 6;
          const panelWidth = 440;
          let left = e.detail.left + e.detail.width / 2 - panelWidth / 2;
          if (left + panelWidth > window.innerWidth - 10) left = window.innerWidth - panelWidth - 10;
          if (left < 10) left = 10;
          p.style.top = top + "px";
          p.style.left = left + "px";
          p.style.display = "block";
          p.style.visibility = "visible";
          const naturalHeight = p.scrollHeight || p.offsetHeight;
          const availableHeight = window.innerHeight - top - 20;
          if (naturalHeight > availableHeight) {
            p.style.zoom = (availableHeight / naturalHeight).toFixed(3);
          } else {
            p.style.zoom = "1";
          }
          APMLogger.info("APM Master", "Settings panel opened.");
        });
      });
      document.addEventListener("mousedown", (e) => {
        const fcBtn = e.target.closest("#apm-forecast-ext-btn");
        if (fcBtn) {
          APMLogger.debug("APM Toolbar", "Delegated MouseDown: Forecast Button");
          e.preventDefault();
          var rect = fcBtn.getBoundingClientRect();
          window.dispatchEvent(new CustomEvent("APM_TOGGLE_FORECAST", {
            detail: { left: rect.left, bottom: rect.bottom, width: rect.width }
          }));
          return;
        }
        const crBtn = e.target.closest("#apm-settings-ext-btn");
        if (crBtn) {
          APMLogger.debug("APM Toolbar", "Delegated MouseDown: Settings Button");
          e.preventDefault();
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
      let lastPulse = 0;
      const tryInjectButtons = () => {
        try {
          const now = Date.now();
          if (isTopFrame() && now - lastPulse > 1e4) {
            APMLogger.debug("APM Toolbar", "Pulse: Injection task active.");
            lastPulse = now;
          }
          if (!tbWin.Ext || !tbWin.Ext.ComponentQuery) return;
          var exitingCmp = tbWin.Ext.getCmp("apm-custom-btn-group");
          if (exitingCmp && exitingCmp.getEl() && exitingCmp.getEl().dom && document.body.contains(exitingCmp.getEl().dom)) {
            return;
          }
          if (exitingCmp) {
            APMLogger.debug("APM Toolbar", "Destroying stale button component.");
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
          var extCmp = tbWin.Ext.getCmp(extEl.id);
          if (!extCmp) return;
          var parentContainer = extCmp.up("toolbar") || extCmp.up("container");
          if (!parentContainer) {
            parentContainer = extCmp.up("panel")?.getDockedItems('toolbar[dock="top"]')[0];
          }
          if (!parentContainer) return;
          APMLogger.info("APM Toolbar", "Injecting buttons into container:", parentContainer.id);
          var insertIndex = parentContainer.items.indexOf(extCmp) + 1;
          parentContainer.insert(insertIndex, {
            xtype: "component",
            id: "apm-custom-btn-group",
            margin: "0 0 0 12",
            html: el("div", { id: "apm-btn-group-inner", style: "display:flex; align-items:center; gap:27px;" }, [
              el("div", {
                id: "apm-forecast-ext-btn",
                className: "rain-cloud-hover apm-btn-inner apm-fc-btn",
                style: "display:flex; align-items:center; font-family:sans-serif; font-size:13px; font-weight:600; color:#d1d1d1; transition:color 0.15s; cursor:pointer;"
              }, [
                el("span", { style: "margin-right:6px;" }, "Forecast"),
                el("span", { style: "display: inline-flex; align-items: center;", innerHTML: SVG_CLOUD.trim() })
              ]),
              el("div", {
                id: "apm-settings-ext-btn",
                style: "display:flex; align-items:center; font-family:sans-serif; font-size:13px; font-weight:600; color:#d1d1d1; transition:color 0.15s; cursor:pointer;"
              }, [
                el("span", {}, "APM Master"),
                el("span", {
                  style: "margin-left: 5px; display: inline-flex; align-items: center;",
                  innerHTML: SVG_ARROW_DOWN.trim()
                })
              ])
            ]).outerHTML
          });
          UIManager.registerPanel("apm-settings-panel", ["#apm-settings-ext-btn"]);
        } catch (e) {
          APMLogger.error("Toolbar", "Native Button Injection Error:", e);
        }
      };
      APMScheduler.registerTask("ext-btn-injection", 500, tryInjectButtons);
      tryInjectButtons();
    }
  }

  // src/boot.js
  init_state();

  // src/modules/ptp/ptp-timer.js
  init_state();
  init_logger();
  init_scheduler();
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

  // src/boot.js
  init_utils();
  init_logger();
  init_constants();

  // src/modules/autofill/autofill-engine.js
  init_utils();
  init_logger();
  init_toast();
  init_state();
  var autoFillObservers = /* @__PURE__ */ new Map();
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
    let eam = win.EAM || window.EAM;
    if (!eam) {
      try {
        eam = window.top.EAM;
      } catch (e) {
      }
    }
    let eamid = "", tenant = "";
    if (eam && eam.Context) {
      eamid = eam.Context.eamid;
      tenant = eam.Context.tenant;
    }
    if (!eamid || !tenant) {
      let topSearch = "";
      try {
        topSearch = window.top.location.search;
      } catch (e) {
      }
      const params = ext.Object.fromQueryString(win.location.search || topSearch);
      eamid = params.eamid || "";
      tenant = params.tenant || "";
    }
    if (!ext || !eamid) return searchTerm;
    let currentOrg = "";
    const orgField = ext.ComponentQuery.query('[name="organization"]')[0];
    if (orgField && orgField.getValue()) {
      currentOrg = orgField.getValue();
    } else {
      let forecastOrgEl = null;
      try {
        forecastOrgEl = window.top.document.getElementById("eam-org-select");
      } catch (e) {
      }
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
  async function executeLaborBookingNative(hours, win) {
    if (!hours || isNaN(hours) || hours <= 0) return;
    const ext = win.Ext;
    if (!ext) return;
    try {
      const laborModules = await Promise.resolve().then(() => (init_labor_booker(), labor_booker_exports));
      const LaborBooker2 = laborModules.LaborBooker || laborModules;
      if (LaborBooker2 && typeof LaborBooker2.quickBookHours === "function") {
        await LaborBooker2.quickBookHours(hours, win);
      } else {
        APMLogger.warn("AutoFill", "LaborBooker.quickBookHours not found.");
      }
    } catch (e) {
      APMLogger.error("AutoFill", "Failed to execute automated labor booking:", e);
    }
  }
  async function handleEamPopups(win) {
    if (!win.Ext || !win.Ext.ComponentQuery) return;
    const msgBoxes = win.Ext.ComponentQuery.query("window:not([destroyed=true])").filter(
      (w) => w.isVisible && w.isVisible() && (w.cls?.includes("x-message-box") || w.title === "Confirmation" || w.title === "EAM")
    );
    for (const box of msgBoxes) {
      const yesBtn = win.Ext.ComponentQuery.query("button[text=Yes]:not([destroyed=true])", box)[0];
      if (yesBtn && !yesBtn.disabled && yesBtn.isVisible()) {
        APMLogger.info("AutoFill", `Auto-clicking "Yes" on EAM popup: ${box.title || "Untitled"}`);
        if (yesBtn.handler) yesBtn.handler.call(yesBtn.scope || yesBtn, yesBtn);
        else yesBtn.fireEvent("click", yesBtn);
        await delay(300);
        return true;
      }
    }
    return false;
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
      await handleEamPopups(activeWin);
      await waitForAjax(activeWin);
      await delay(150);
    }
    if (data.type) {
      showToast("Setting Work Order Type...", "#f1c40f", true);
      await setEamLovFieldDirect(activeExt, mainForm, "workordertype", data.type);
      await waitForAjax(activeWin);
      await handleEamPopups(activeWin);
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
    if (data.status) {
      showToast("Updating Work Order Status...", "#f1c40f", true);
      await setEamLovFieldDirect(activeExt, mainForm, "workorderstatus", data.status);
      await waitForAjax(activeWin);
      await handleEamPopups(activeWin);
    }
    await handleEamPopups(activeWin);
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
      if (data.laborHours && parseFloat(data.laborHours) > 0) {
        showToast("Saving WO before Labor...", "#f1c40f", true);
        await waitForAjax(activeWin);
        await delay(1500);
        showToast(`Auto-Booking ${data.laborHours}h Labor...`, "#1abc9c", true);
        await executeLaborBookingNative(parseFloat(data.laborHours), activeWin);
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
    const getGridStore = () => {
      const grids = activeExt.ComponentQuery.query("gridpanel", checklistContainer);
      return grids.length > 0 ? grids[0] : null;
    };
    const localWaitForAjax = async () => {
      let waited = 0;
      await delay(50);
      while (waited < 1e4) {
        if (!activeExt.Ajax || !activeExt.Ajax.isLoading()) break;
        await delay(50);
        waited += 50;
      }
      await delay(20);
    };
    const waitForGridData = async (maxMs = 1e4) => {
      const grid = getGridStore();
      if (!grid) return;
      let waited = 0;
      while (grid.getStore().getCount() === 0 && waited < maxMs) {
        if (waited > 800 && (!activeExt.Ajax || !activeExt.Ajax.isLoading())) break;
        if (waited === 1500) showToast("Waiting for Grid Data...", "#f39c12", true);
        await delay(100);
        waited += 100;
      }
    };
    if (mainTabPanel.getActiveTab() !== checklistContainer) {
      mainTabPanel.setActiveTab(checklistContainer);
      await delay(200);
    }
    await localWaitForAjax();
    await waitForGridData(3e3);
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
        await waitForGridData(1e4);
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
        showToast(`Switching to Activity ${targetValue}...`, "#3498db", true);
        actCombo.setValue(targetRec.get(actCombo.valueField));
        actCombo.fireEvent("select", actCombo, [targetRec]);
        actCombo.fireEvent("change", actCombo, targetRec.get(actCombo.valueField));
        await localWaitForAjax();
        await waitForGridData(1e4);
        return true;
      }
      return false;
    };
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
    const wins = getExtWindows();
    for (const win of wins) {
      try {
        if (win.Ext && win.Ext.ComponentQuery) {
          const tabContainers = win.Ext.ComponentQuery.query("uxtabcontainer[itemId=HDR]");
          if (tabContainers.length > 0) {
            const hdrTab = tabContainers[0];
            const tabPanel = hdrTab.up("tabpanel");
            if (tabPanel && tabPanel.getActiveTab() !== hdrTab) {
              APMLogger.info("APM AutoFill", "Switching to HDR tab...");
              tabPanel.setActiveTab(hdrTab);
              await new Promise((r) => setTimeout(r, 150));
            }
          }
        }
      } catch (e) {
      }
    }
    setIsAutoFillRunning(true);
    try {
      loadPresets();
      let activeTitle = "";
      const allDocs = [document];
      try {
        if (window.top.document && window.top.document !== document) allDocs.push(window.top.document);
      } catch (e) {
      }
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
      APMLogger.error("APM", "Critical Error in executeAutoFillFlow:", e);
      showToast("Script Error (See Console)", "#e74c3c");
    } finally {
      setIsAutoFillRunning(false);
    }
  }
  function injectAutoFillTriggers() {
    if (window.self !== window.top || getIsAutoFillRunning()) return;
    const allDocs = getAccessibleDocs();
    const presets = getPresets();
    allDocs.forEach((d) => {
      try {
        if (!d || !d.body) return;
        const win = d.defaultView;
        if (!win || !win.Ext) return;
        let isRvActiveLocal = false;
        let foundTitleLocal = "";
        const rvForms = win.Ext.ComponentQuery.query("form[id*=recordview]") || win.Ext.ComponentQuery.query("form[name=recordview]");
        const activeRv = rvForms.find((f) => f.rendered && f.isVisible(true));
        if (activeRv) {
          isRvActiveLocal = true;
          const record = activeRv.getRecord();
          if (record) {
            foundTitleLocal = (record.get("description") || "").trim().toLowerCase();
          }
          if (!foundTitleLocal) {
            const descField = activeRv.getForm().findField("description");
            if (descField) foundTitleLocal = (descField.getValue() || "").trim().toLowerCase();
          }
        }
        const existingBtn = d.getElementById("apm-btn-do-autofill");
        if (!isRvActiveLocal || !foundTitleLocal) {
          if (existingBtn) existingBtn.remove();
          return;
        }
        const headerEl = d.querySelector("span.recordcode");
        if (!headerEl) {
          if (existingBtn) existingBtn.remove();
          return;
        }
        let hasMatch = false;
        for (const key in presets.autofill) {
          const kwString = presets.autofill[key].keyword;
          if (!kwString) continue;
          const keywords = kwString.split(",").map((k) => k.trim().toLowerCase()).filter(Boolean);
          if (keywords.some((k) => foundTitleLocal === k || foundTitleLocal.includes(k))) {
            hasMatch = true;
            break;
          }
        }
        if (hasMatch) {
          if (!existingBtn) {
            const btn = d.createElement("button");
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
          }
        } else if (existingBtn) {
          existingBtn.remove();
        }
      } catch (e) {
      }
    });
  }
  function initAutoFillObserver() {
    if (window.self !== window.top) return;
    const setupObserver = (doc) => {
      if (!doc || autoFillObservers.has(doc)) return;
      APMLogger.debug("AutoFill", "Setting up observer for document:", doc.location.href);
      const observer = new MutationObserver((mutations) => {
        let shouldCheck = false;
        for (const m of mutations) {
          if (m.type === "childList") {
            const hasAdd = Array.from(m.addedNodes).some(
              (n) => n.nodeType === 1 && (n.classList.contains("recordcode") || n.querySelector(".recordcode") || n.id?.includes("recordview"))
            );
            const hasRem = Array.from(m.removedNodes).some(
              (n) => n.nodeType === 1 && (n.classList.contains("recordcode") || n.querySelector(".recordcode") || n.id?.includes("recordview"))
            );
            if (hasAdd || hasRem) {
              shouldCheck = true;
              break;
            }
          } else if (m.type === "attributes") {
            if (m.target && m.target.nodeType === 1) {
              const t = m.target;
              if (t.id?.includes("recordview") || t.classList.contains("recordcode")) {
                shouldCheck = true;
                break;
              }
            }
          }
        }
        if (shouldCheck) {
          injectAutoFillTriggers();
        }
      });
      observer.observe(doc.body || doc.documentElement, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["style", "class", "hidden"]
      });
      autoFillObservers.set(doc, observer);
    };
    injectAutoFillTriggers();
    setInterval(() => {
      const docs = getAccessibleDocs();
      let anyButtonVisible = false;
      for (const d of docs) {
        if (d.getElementById("apm-btn-do-autofill")) {
          anyButtonVisible = true;
          break;
        }
      }
      if (anyButtonVisible) {
        APMLogger.debug("AutoFill", "Safety polling: active button detected");
        injectAutoFillTriggers();
      }
    }, 1e3);
    setInterval(() => {
      const currentDocs = getAccessibleDocs();
      for (const [doc, obs] of autoFillObservers.entries()) {
        if (!currentDocs.includes(doc)) {
          try {
            obs.disconnect();
          } catch (e) {
          }
          autoFillObservers.delete(doc);
          APMLogger.debug("AutoFill", "Observer cleaned up for stale document");
        }
      }
      currentDocs.forEach(setupObserver);
    }, 5e3);
    setupObserver(document);
  }

  // src/modules/labor-tracker.js
  init_utils();
  init_state();
  init_labor_service();
  init_logger();
  init_ui_manager();
  init_constants();
  init_storage();
  var LaborTracker = (function() {
    if (!isTopFrame()) return { init: function() {
    } };
    let activeTab = 7;
    let isFetching = false;
    let isInitialized = false;
    let savedEmployees = [];
    let selectedEmployee = "";
    function loadAndMigrateLaborState() {
      try {
        const v1Emps = APMStorage.get(LABOR_EMPS_STORAGE);
        if (v1Emps) {
          savedEmployees = Array.isArray(v1Emps) ? v1Emps : [];
        } else {
          savedEmployees = [];
        }
        const v1Active = APMStorage.get(LABOR_ACTIVE_STORAGE);
        if (v1Active !== null) {
          selectedEmployee = v1Active;
        }
      } catch (e) {
        APMLogger.error("LaborTracker", "Failed to load state:", e);
        savedEmployees = [];
        selectedEmployee = "";
      }
    }
    loadAndMigrateLaborState();
    let trigger = null;
    let panel = null;
    function applyDocking() {
      if (!trigger || !panel) return;
      let dockInfo;
      try {
        const legacyDock = localStorage.getItem("apmLaborDockPos");
        const v1Dock = APMStorage.get(LABOR_DOCK_STORAGE);
        if (v1Dock) {
          dockInfo = v1Dock;
        } else if (legacyDock) {
          dockInfo = JSON.parse(legacyDock);
          APMStorage.set(LABOR_DOCK_STORAGE, dockInfo);
        } else {
          dockInfo = { edge: "right", pos: 300 };
        }
      } catch (e) {
        dockInfo = { edge: "right", pos: 300 };
      }
      let maxPos = dockInfo.edge === "top" || dockInfo.edge === "bottom" ? window.innerWidth : window.innerHeight;
      dockInfo.pos = Math.max(30, Math.min(maxPos - 30, dockInfo.pos));
      trigger.style.left = trigger.style.right = trigger.style.top = trigger.style.bottom = "";
      panel.style.left = panel.style.right = panel.style.top = panel.style.bottom = "";
      trigger.style.transition = "background 0.2s, transform 0.2s ease-out";
      trigger.style.writingMode = trigger.style.textOrientation = "";
      const offset = "34px";
      const isVisibleDom = panel.style.display !== "none" && panel.style.visibility !== "hidden";
      if (dockInfo.edge === "right") {
        trigger.style.right = "0";
        trigger.style.top = dockInfo.pos + "px";
        trigger.style.transform = "translateY(-50%)";
        trigger.style.writingMode = "vertical-rl";
        trigger.style.borderRadius = "8px 0 0 8px";
        panel.style.right = offset;
        panel.style.top = dockInfo.pos + "px";
        panel.style.transform = isVisibleDom ? "translate(0%, -50%)" : "translate(calc(100% + 50px), -50%)";
      } else if (dockInfo.edge === "left") {
        trigger.style.left = "0";
        trigger.style.top = dockInfo.pos + "px";
        trigger.style.transform = "translateY(-50%)";
        trigger.style.writingMode = "vertical-lr";
        trigger.style.textOrientation = "mixed";
        trigger.style.borderRadius = "0 8px 8px 0";
        panel.style.left = offset;
        panel.style.top = dockInfo.pos + "px";
        panel.style.transform = isVisibleDom ? "translate(0%, -50%)" : "translate(calc(-100% - 50px), -50%)";
      } else if (dockInfo.edge === "top") {
        trigger.style.top = "0";
        trigger.style.left = dockInfo.pos + "px";
        trigger.style.transform = "translateX(-50%)";
        trigger.style.borderRadius = "0 0 8px 8px";
        panel.style.top = offset;
        panel.style.left = dockInfo.pos + "px";
        panel.style.transform = isVisibleDom ? "translate(-50%, 0%)" : "translate(-50%, calc(-100% - 50px))";
      } else if (dockInfo.edge === "bottom") {
        trigger.style.bottom = "0";
        trigger.style.left = dockInfo.pos + "px";
        trigger.style.transform = "translateX(-50%)";
        trigger.style.borderRadius = "8px 8px 0 0";
        panel.style.bottom = offset;
        panel.style.left = dockInfo.pos + "px";
        panel.style.transform = isVisibleDom ? "translate(-50%, 0%)" : "translate(-50%, calc(100% + 50px))";
      }
    }
    async function fetchLaborData(force = false) {
      if (isFetching || panel && panel.style.display === "none") return;
      const session = AppState.session;
      if (!session.eamid || !session.user) {
        APMLogger.debug("Labor Tracker", "Waiting for session initialization...");
        return;
      }
      isFetching = true;
      updateUIState("Loading...");
      const currentUser = (session.user.includes("@") ? session.user.split("@")[0] : session.user).toUpperCase();
      const targetEmployee = selectedEmployee ? selectedEmployee : currentUser;
      try {
        await LaborService.getData(targetEmployee, force);
      } catch (err) {
        APMLogger.error("LaborTracker", "Fetch error:", err);
        updateUIState("Data Error");
      } finally {
        isFetching = false;
        updateUIState();
      }
    }
    function calculateLabor(daysParam) {
      const records = LaborService.getCache();
      return LaborService.calculateTally(records, daysParam);
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
      if (trigger) trigger.remove();
      if (panel) panel.remove();
      trigger = document.createElement("div");
      trigger.id = "apm-labor-trigger";
      trigger.className = "apm-labor-trigger";
      trigger.innerHTML = "LABOR TALLY \u23F1\uFE0F";
      panel = el("div", { id: "apm-labor-panel", className: "apm-labor-panel apm-ui-panel" }, [
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
      bindEvents();
      applyDocking();
      renderEmpSelect();
      const mPnl = document.getElementById("apm-labor-mgr-panel");
      if (mPnl) mPnl.style.display = "none";
      APMLogger.info("APM Master", "Labor Tracker: UI Injected.");
    }
    function bindEvents() {
      let dockInfo;
      try {
        dockInfo = APMStorage.get(LABOR_DOCK_STORAGE) || { edge: "right", pos: 300 };
      } catch (e) {
        dockInfo = { edge: "right", pos: 300 };
      }
      trigger.onmousedown = (e) => {
        let isDragging = false;
        let startX = e.clientX, startY = e.clientY;
        let rect = trigger.getBoundingClientRect();
        let offsetX = startX - rect.left, offsetY = startY - rect.top;
        const onMouseMove = (moveEvent) => {
          if (!isDragging && (Math.abs(moveEvent.clientX - startX) > 5 || Math.abs(moveEvent.clientY - startY) > 5)) {
            isDragging = true;
            trigger.style.transition = "none";
            const isVisibleDom = panel.style.display !== "none" && panel.style.visibility !== "hidden";
            if (isVisibleDom) {
              UIManager.closeAll(true);
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
            APMStorage.set(LABOR_DOCK_STORAGE, dockInfo);
            applyDocking();
          } else {
            UIManager.toggle("apm-labor-panel", () => {
              panel.style.display = "flex";
              panel.style.visibility = "visible";
              APMLogger.debug("LaborTracker", "Panel toggled via UIManager -> OPENING");
              fetchLaborData(true);
              applyDocking();
            });
          }
        };
        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
      };
      const mgrBtn = document.getElementById("apm-labor-mgr-toggle");
      if (mgrBtn) mgrBtn.onclick = () => {
        const p = document.getElementById("apm-labor-mgr-panel");
        const isHidden = p.style.display === "none";
        p.style.display = isHidden ? "flex" : "none";
        APMLogger.debug("LaborTracker", `Manager panel toggled: ${isHidden ? "OPEN" : "CLOSED"}`);
      };
      const addBtn = document.getElementById("apm-labor-emp-add");
      if (addBtn) addBtn.onclick = () => {
        const alias = prompt("Enter employee alias (e.g. ROSENDAH):");
        if (alias && alias.trim()) {
          const cleanAlias = alias.trim().toUpperCase();
          if (!savedEmployees.includes(cleanAlias)) {
            savedEmployees.push(cleanAlias);
            APMStorage.set(LABOR_EMPS_STORAGE, savedEmployees);
          }
          selectedEmployee = cleanAlias;
          APMStorage.set(LABOR_ACTIVE_STORAGE, selectedEmployee);
          renderEmpSelect();
          fetchLaborData(true);
        }
      };
      const remBtn = document.getElementById("apm-labor-emp-rem");
      if (remBtn) remBtn.onclick = () => {
        if (!selectedEmployee) return;
        if (confirm("Remove " + selectedEmployee + " from saved list?")) {
          savedEmployees = savedEmployees.filter((e) => e !== selectedEmployee);
          APMStorage.set(LABOR_EMPS_STORAGE, savedEmployees);
          selectedEmployee = "";
          APMStorage.set(LABOR_ACTIVE_STORAGE, selectedEmployee);
          renderEmpSelect();
          fetchLaborData(true);
        }
      };
      const selEl = document.getElementById("apm-labor-emp-select");
      if (selEl) selEl.onchange = (e) => {
        selectedEmployee = e.target.value;
        APMStorage.set(LABOR_ACTIVE_STORAGE, selectedEmployee);
        renderEmpSelect();
        fetchLaborData(true);
      };
      panel.querySelectorAll(".labor-tab").forEach((t) => t.onclick = (e) => {
        panel.querySelectorAll(".labor-tab").forEach((x) => x.classList.remove("active"));
        e.target.classList.add("active");
        activeTab = parseInt(e.target.getAttribute("data-d"));
        if (!isFetching) updateUIState();
      });
      const refreshBtn = document.getElementById("labor-force-refresh");
      if (refreshBtn) refreshBtn.onclick = () => fetchLaborData(true);
    }
    function updateUIState(errorMsg = null) {
      const sumBox = document.getElementById("labor-sum-box");
      const list = document.getElementById("labor-breakdown-box");
      if (!sumBox || !list) return;
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
        if (!isTopFrame()) return;
        if (isInitialized) {
          if (!document.getElementById("apm-labor-trigger")) injectUI();
          return;
        }
        injectUI();
        isInitialized = true;
        UIManager.addExternalHandler(() => {
          const isVisibleDom = panel.style.display !== "none" && panel.style.visibility !== "hidden";
          if (isVisibleDom) {
            applyDocking();
          }
        });
        UIManager.registerPanel("apm-labor-panel", ["#apm-labor-trigger", ".apm-labor-trigger"]);
        window.addEventListener("APM_SESSION_UPDATED", (e) => {
          const isVisible = panel.style.display !== "none" && panel.style.visibility !== "hidden";
          if (e.detail?.isFresh && isVisible) {
            fetchLaborData();
          }
        });
        window.addEventListener("resize", () => applyDocking());
        const isVisibleStart = panel.style.display !== "none" && panel.style.visibility !== "hidden";
        if (AppState.session.isFresh && isVisibleStart) {
          fetchLaborData();
        }
      }
    };
  })();

  // src/boot.js
  init_scheduler();

  // src/core/date-override.js
  init_state();
  init_logger();
  init_utils();
  function initDateOverride() {
    if (!isTopFrame()) return;
    const applyOverride = () => {
      if (typeof Ext !== "undefined" && Ext.form && Ext.form.field && Ext.form.field.Date) {
        if (!apmGeneralSettings.dateOverrideEnabled) return;
        const fmt = apmGeneralSettings.dateFormat === "eu" ? "d/m/Y" : "m/d/Y";
        Ext.override(Ext.form.field.Date, {
          format: fmt,
          altFormats: "m/d/Y|n/j/Y|n/j/y|m/j/y|n/d/y|m/j/Y|n/d/Y|m-d-y|m-d-Y|m/d|m-d|md|mdy|mdY|d|Y-m-d|n-j|n/j|d/m/Y|j/n/Y|j/n/y"
        });
        APMLogger.info("APM Master", "Date format override applied.");
      } else {
        setTimeout(applyOverride, 100);
      }
    };
    applyOverride();
  }

  // src/ui/conflict-notice.js
  init_storage();
  function checkLegacyConflicts() {
    if (window.self !== window.top) return;
    const STORAGE_KEY2 = "apm_conflict_notice_shown";
    const isShown = APMStorage.get(STORAGE_KEY2);
    const isBetterApmDetected = !!document.getElementById("better-apm-styles") || !!document.querySelector(".better-apm-btn");
    if (isBetterApmDetected && isShown === true && !APMStorage.get("apm_better_apm_warned")) {
      APMStorage.remove(STORAGE_KEY2);
    }
    if (APMStorage.get(STORAGE_KEY2) === true && !isBetterApmDetected) return;
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
                APMStorage.set(STORAGE_KEY2, true);
                if (isBetterApmDetected) APMStorage.set("apm_better_apm_warned", true);
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
  init_labor_booker();

  // src/core/sync.js
  init_state();
  init_constants();
  init_logger();
  function initGlobalSync() {
    if (typeof window === "undefined") return;
    window.addEventListener("storage", (e) => {
      if (!e.newValue) return;
      switch (e.key) {
        case APM_GENERAL_STORAGE:
          handleGeneralSettingsSync(e.newValue);
          break;
        case CC_STORAGE_RULES:
          handleColorCodeRulesSync(e.newValue);
          break;
        case CC_STORAGE_SET:
          handleColorCodeSettingsSync(e.newValue);
          break;
        case PRESET_STORAGE_KEY:
          handleAutoFillPresetsSync(e.newValue);
          break;
        case "ApmSession":
          handleSessionSync(e.newValue);
          break;
      }
    });
  }
  function handleGeneralSettingsSync(data) {
    try {
      const next = JSON.parse(data);
      Object.assign(apmGeneralSettings, next);
      if (typeof window.invalidateColorCodeCache === "function") {
        window.invalidateColorCodeCache();
      }
    } catch (err) {
      APMLogger.warn("Sync", "Failed to sync general settings", err);
    }
  }
  function handleSessionSync(data) {
    try {
      const session = JSON.parse(data);
      const wasInit = AppState.session.isInitialized;
      Object.assign(AppState.session, session);
      if (AppState.session.isInitialized) {
        window.dispatchEvent(new CustomEvent("APM_SESSION_UPDATED", {
          detail: { ...AppState.session, firstInit: !wasInit }
        }));
      }
    } catch (err) {
      APMLogger.warn("Sync", "Failed to sync session", err);
    }
  }
  function handleColorCodeRulesSync(data) {
    try {
      AppState.colorCode.rules = JSON.parse(data);
      window.dispatchEvent(new CustomEvent("APM_CC_SYNC_REQUIRED"));
    } catch (err) {
      APMLogger.warn("Sync", "Failed to sync colorcode rules", err);
    }
  }
  function handleColorCodeSettingsSync(data) {
    try {
      const next = JSON.parse(data);
      AppState.colorCode.settings = { ...AppState.colorCode.settings, ...next };
      window.dispatchEvent(new CustomEvent("APM_CC_SYNC_REQUIRED"));
    } catch (err) {
      APMLogger.warn("Sync", "Failed to sync colorcode settings", err);
    }
  }
  function handleAutoFillPresetsSync(data) {
    try {
      const next = JSON.parse(data);
      if (next.autofill) AppState.autofill.presets.autofill = next.autofill;
      if (next.config) AppState.autofill.presets.config = next.config;
      window.dispatchEvent(new CustomEvent("APM_PRESETS_SYNC_REQUIRED"));
    } catch (err) {
      APMLogger.warn("Sync", "Failed to sync autofill presets", err);
    }
  }

  // src/boot.js
  init_migration_manager();

  // src/core/session.js
  init_state();
  init_logger();
  init_utils();
  init_storage();
  init_constants();
  init_state();
  init_network();
  var SessionMonitor = {
    init() {
      if (typeof window === "undefined") return;
      if (isTopFrame()) {
        APMLogger.info("APM Session", "Initializing Monitor...");
      }
      this.restore();
      this.hookXHR();
      this.hookFetch();
      if (isTopFrame()) {
        this.setupGlobalRedirects();
      }
    },
    setupGlobalRedirects() {
      const topWin = apmGetGlobalWindow().top;
      topWin._APM = topWin._APM || {};
      topWin._APM.checkSession = () => this.monitorStatus();
      topWin._APM.forceRedirect = () => this.forceRedirect();
    },
    restore() {
      const stored = APMStorage.get("ApmSession");
      if (stored) {
        try {
          Object.assign(AppState.session, stored);
          if (isTopFrame()) {
            APMLogger.info("APM Session", "Restored from storage:", AppState.session);
          }
        } catch (e) {
        }
      }
    },
    save() {
      APMStorage.set("ApmSession", AppState.session);
    },
    hookXHR() {
      const self = this;
      const origOpen = XMLHttpRequest.prototype.open;
      const origSend = XMLHttpRequest.prototype.send;
      XMLHttpRequest.prototype.open = function(method, url) {
        this._apmUrl = (url || "").toString();
        return origOpen.apply(this, arguments);
      };
      XMLHttpRequest.prototype.send = function(body) {
        const url = this._apmUrl;
        const payload = body && typeof body === "string" ? body : null;
        this.addEventListener("load", function() {
          if (this.status === 200) {
            self.tryCaptureFromTraffic(url, payload);
            if (this.responseText) {
              self.processResponse(url, this.responseText);
            }
          }
        });
        return origSend.apply(this, arguments);
      };
    },
    hookFetch() {
      const self = this;
      const origFetch = window.fetch;
      window.fetch = async function(...args) {
        const url = args[0] instanceof Request ? args[0].url : typeof args[0] === "string" ? args[0] : "";
        const options = (args[0] instanceof Request ? args[0] : args[1]) || {};
        const payload = options.body && typeof options.body === "string" ? options.body : null;
        const response = await origFetch.apply(this, args);
        if (response.ok) {
          self.tryCaptureFromTraffic(url, payload);
          try {
            if (url.includes("BSSTRT") || url.includes("GRIDDATA")) {
              const clone = response.clone();
              const text = await clone.text();
              self.processResponse(url, text);
            }
          } catch (e) {
          }
        }
        return response;
      };
    },
    tryCaptureFromTraffic(url, payload) {
      if (url) {
        const eamMatch = url.match(/[?&]eamid=([^&]+)/);
        const tenantMatch = url.match(/[?&]tenant=([^&]+)/);
        if (eamMatch) this.updateState("eamid", eamMatch[1]);
        if (tenantMatch) this.updateState("tenant", tenantMatch[1]);
      }
      if (payload) {
        const eamMatch = payload.match(/[?&]eamid=([^&]+)/) || payload.match(/eamid=([^&]+)/);
        const tenantMatch = payload.match(/[?&]tenant=([^&]+)/) || payload.match(/tenant=([^&]+)/);
        if (eamMatch) this.updateState("eamid", eamMatch[1]);
        if (tenantMatch) this.updateState("tenant", tenantMatch[1]);
      }
    },
    processResponse(url, text) {
      if (!url || !text) return;
      if (url.includes("BSSTRT")) {
        try {
          const data = JSON.parse(text);
          const user = data?.pageData?.functionData?.sessionUserID;
          if (user) {
            this.updateState("user", user);
          }
        } catch (e) {
        }
      }
    },
    updateState(key, value) {
      if (!value) return;
      const current = AppState.session[key];
      if (current !== value) {
        let finalValue = value;
        if (key === "user" && typeof value === "string" && value.includes("@")) {
          finalValue = value.split("@")[0].toUpperCase();
        }
        APMLogger.info("APM Session", `Captured ${key}: ${finalValue}`);
        AppState.session[key] = finalValue;
        this.save();
        if (key === "user") {
          APMStorage.set("apmLastKnownEmpId", finalValue);
        }
        if (AppState.session.eamid && AppState.session.tenant && AppState.session.user) {
          const wasInitialized = AppState.session.isInitialized;
          AppState.session.isInitialized = true;
          AppState.session.isFresh = true;
          window.dispatchEvent(new CustomEvent("APM_SESSION_UPDATED", {
            detail: { ...AppState.session, firstInit: !wasInitialized }
          }));
        }
      }
    },
    monitorStatus() {
      if (!isTopFrame()) return;
      if (window.__apmRedirecting) return;
      if (!apmGeneralSettings.autoRedirect) return;
      const currentUrl = window.location.href.toLowerCase();
      const isLanding = window.location.hostname.includes("hexagon.com") || window.location.hostname.includes("octave.com");
      if (isLanding && !currentUrl.includes("logindisp")) {
        APMLogger.info("APM Session", "Landing page detected (Hexagon/Octave), triggering session timeout redirect.");
        this.forceRedirect();
        return;
      }
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
        const allWins = getExtWindows();
        for (const win of allWins) {
          try {
            const url = win.location.href.toLowerCase();
            const isAuthPage = url.includes("logindisp") || url.includes("federate.amazon.com") || url.includes("midway") || url.includes("saml") || url.includes("okta.com") || url.includes("octave.com");
            if (isAuthPage && !window.location.href.includes("logindisp")) {
              timeoutDetected = true;
              break;
            }
          } catch (e) {
          }
        }
      }
      if (timeoutDetected) {
        this.forceRedirect();
      }
    },
    /**
     * Performs a lightweight request to EAM to keep the session alive.
     */
    refreshSession: async function() {
      const session = AppState.session;
      if (!session.eamid || !session.tenant) return;
      APMLogger.debug("APM Session", "Refreshing session heartbeat...");
      try {
        const url = `https://us1.eam.hxgnsmartcloud.com/web/base/logindisp?tenant=${session.tenant || DEFAULT_TENANT}`;
        const resp = await apmFetch(url, {
          method: "HEAD",
          credentials: "include"
        });
        if (resp.status === 200) {
          APMLogger.debug("APM Session", "Session heartbeat successful.");
        } else if (resp.status === 401 || resp.status === 302) {
          APMLogger.warn("APM Session", "Session heartbeat failed with auth error, session may be expired.");
        }
      } catch (e) {
        APMLogger.error("APM Session", "Session heartbeat error:", e);
      }
    },
    forceRedirect() {
      if (window.__apmRedirecting) return;
      window.__apmRedirecting = true;
      APMLogger.info("APM Session", "Session timeout detected. Auto-redirecting...");
      const topWin = apmGetGlobalWindow().top;
      topWin.location.replace(SESSION_TIMEOUT_URL);
      setTimeout(() => {
        if (topWin.location.href !== SESSION_TIMEOUT_URL) {
          topWin.location.href = SESSION_TIMEOUT_URL;
        }
      }, 500);
    }
  };

  // src/core/ext-consistency.js
  init_utils();
  init_logger();
  init_state();
  var injectionTO = null;
  var ExtConsistencyManager = {
    init() {
      const topWin = apmGetGlobalWindow().top;
      topWin._APM = topWin._APM || {};
      topWin._APM.bindConsistencyListeners = () => this.bindAll();
      topWin._APM.triggerResponsiveInjections = () => this.triggerInjections();
    },
    triggerInjections() {
      clearTimeout(injectionTO);
      injectionTO = setTimeout(() => {
        injectAutoFillTriggers();
      }, 100);
    },
    bindAll() {
      const wins = getExtWindows();
      for (const win of wins) {
        try {
          this.setupAjaxInterceptors(win);
          this.setupComponentListeners(win);
        } catch (e) {
          APMLogger.debug("ExtConsistency", "Error binding to window:", e);
        }
      }
    },
    setupAjaxInterceptors(win) {
      if (!win.Ext || !win.Ext.Ajax || win.__apmAjaxInterceptor) return;
      win.Ext.Ajax.on("requestexception", (conn, response) => {
        if (response && response.status === 401 && apmGeneralSettings.autoRedirect) {
          APMLogger.info("APM Master", "Instant timeout detected (401). Auto-redirecting...");
          if (window.top._APM && window.top._APM.forceRedirect) window.top._APM.forceRedirect();
        }
      });
      win.Ext.Ajax.on("requestcomplete", (conn, response, options) => {
        if (response && response.responseText && apmGeneralSettings.autoRedirect) {
          const text = response.responseText.toLowerCase();
          if (text.includes("logindisp") || text.includes("octave.com") || text.includes("okta.com")) {
            APMLogger.info("APM Master", "Login redirect detected in Ajax response. Auto-redirecting...");
            if (window.top._APM && window.top._APM.forceRedirect) window.top._APM.forceRedirect();
          }
        }
      });
      win.__apmAjaxInterceptor = true;
    },
    hookStoreReader(store) {
      if (!store || store.__apmReaderHook) return;
      const proxy = store.getProxy();
      const reader = proxy?.getReader();
      if (!reader) return;
      const originalRead = reader.read;
      reader.read = function(response) {
        const result = originalRead.apply(this, arguments);
        try {
          const rawData = response.responseXML || response.responseText || response;
          let hasMore = false;
          if (rawData.nodeType === 9 || rawData.nodeType === 1 || typeof rawData === "string" && rawData.includes("<?xml")) {
            const xmlDoc = typeof rawData === "string" ? new DOMParser().parseFromString(rawData, "text/xml") : rawData;
            const metaNode = xmlDoc.querySelector?.("METADATA") || xmlDoc;
            hasMore = metaNode.getAttribute?.("MORERECORDPRESENT") === "+" || metaNode.querySelector?.("MORERECORDPRESENT")?.textContent === "+";
          } else if (result?.rawData || typeof rawData === "object") {
            const data = result.rawData || rawData;
            const metadata = data?.pageData?.grid?.GRIDRESULT?.GRID?.METADATA || data?.GRIDRESULT?.GRID?.METADATA || data?.METADATA || data?.pageData?.METADATA || data || {};
            hasMore = metadata.MORERECORDPRESENT === "+" || metadata.MORERECORDPRESENT === "Y" || metadata.MORERECORDPRESENT === "YES";
          }
          store.__apmLastHasMore = hasMore;
          APMLogger.debug("ExtConsistency", `[Reader Hook] Detected hasMore=${hasMore} for store ${store.storeId || "unnamed"}`);
        } catch (e) {
          APMLogger.error("ExtConsistency", "Error in Reader hook:", e);
        }
        return result;
      };
      store.__apmReaderHook = true;
    },
    setupComponentListeners(win) {
      if (!win.Ext || !win.Ext.ComponentQuery) return;
      const tabPanels = win.Ext.ComponentQuery.query("tabpanel, uxtabpanel");
      if (tabPanels.length > 0) APMLogger.debug("ExtConsistency", `Found ${tabPanels.length} tabpanels in window ${win.location.pathname}`);
      tabPanels.forEach((tp) => {
        this.captureTabDefaults(tp);
        this.bindTabListeners(tp);
      });
      const grids = win.Ext.ComponentQuery.query("gridpanel");
      if (grids.length > 0) APMLogger.debug("ExtConsistency", `Found ${grids.length} grids in window ${win.location.pathname}`);
      grids.forEach((grid) => {
        this.bindGridListeners(grid);
      });
    },
    captureTabDefaults(tp) {
      if (tp.__apmDefaultsCaptured || tp.isDestroyed) return;
      const isMainPanel = tp.items && tp.items.items && tp.items.items.some(
        (t) => /Activities|Checklist|Comments/.test(t.title || t.text || "")
      );
      if (isMainPanel && !window._apmSystemDefaultTabOrder) {
        window._apmSystemDefaultTabOrder = tp.items.items.filter((t) => !t.isDestroyed).map((t) => (t.title || t.text || "").replace(/<[^>]*>?/gm, "").trim()).filter((n) => n && n !== "&#160;");
      }
      tp.__apmDefaultsCaptured = true;
    },
    bindTabListeners(tp) {
      if (tp.__apmConsistencyListener || tp.isDestroyed) return;
      const win = tp.getEl?.()?.dom?.ownerDocument?.defaultView || window;
      const trigger = () => {
        APMLogger.debug("ExtConsistency", `Tab Activity on ${tp.id}. Re-scanning for components...`);
        setTimeout(() => {
          applyTabConsistency();
          this.setupComponentListeners(win);
          this.triggerInjections();
        }, 50);
      };
      tp.on("tabchange", trigger);
      tp.on("add", trigger);
      tp.on("activate", trigger);
      tp.__apmConsistencyListener = true;
    },
    bindGridListeners(grid) {
      if (grid.__apmConsistencyListener || grid.isDestroyed || !grid.headerCt) return;
      const store = grid.getStore();
      APMLogger.debug("ExtConsistency", `Binding grid: ${grid.id}, Store: ${store?.storeId || "none"}`);
      grid.headerCt.on("columnmove", () => setTimeout(applyGridConsistency, 50));
      const bindStore = (s) => {
        if (!s || s.__apmGetCacheHook) return;
        this.hookStoreReader(s);
        APMLogger.debug("ExtConsistency", `Hooking load event for store: ${s.storeId || "unnamed"}`);
        s.on("load", (storeInstance, records, successful, operation) => {
          if (!successful || grid.isDestroyed) return;
          APMLogger.debug("ExtConsistency", `Load detected on ${grid.id} (Store: ${s.storeId}). Checking for more records...`);
          recursiveGridFetch(grid, { operation });
        });
        s.__apmGetCacheHook = true;
      };
      bindStore(grid.getStore());
      grid.on("reconfigure", (g, store2) => {
        APMLogger.debug("ExtConsistency", `Grid reconfigured: ${grid.id}. Re-hooking store...`);
        bindStore(store2);
      });
      grid.__apmConsistencyListener = true;
      setTimeout(applyGridConsistency, 50);
    }
  };

  // src/boot.js
  function initBootSequence(win = window) {
    const isTop = win === win.top;
    if (isTop) {
      try {
        MigrationManager.run();
        initializeGeneralSettings();
        loadPresets();
        loadColorCodePrefs();
        initGlobalSync();
        BootManager.markReady("settings");
      } catch (e) {
        APMLogger.error("Boot", "Failed to load initial settings:", e);
        BootManager.markReady("settings");
      }
    } else {
      BootManager.markReady("settings");
    }
    BootManager.waitForExt(win);
    BootManager.onBoot(() => {
      if (!isTop) return;
      const isLanding = window.location.hostname.includes("octave.com") || window.location.hostname.includes("hexagon.com");
      APMScheduler.registerTask("session-monitor", 1e4, () => {
        SessionMonitor.monitorStatus();
      }, { isIdle: true });
      APMScheduler.registerTask("session-heartbeat", 3e5, () => {
        SessionMonitor.refreshSession();
      }, { isIdle: true });
      if (isLanding) {
        APMLogger.info("Boot", "Landing page detected. Skipping core UI initialization.");
        return;
      }
      const tasks = [
        { name: "Styles", fn: injectStaticStyles },
        { name: "DateOverride", fn: initDateOverride },
        { name: "ConflictCheck", fn: checkLegacyConflicts },
        { name: "ForecastUI", fn: buildForecastUI },
        { name: "SearchUI", fn: buildSearchUI },
        { name: "Shortcuts", fn: initForecastShortcuts },
        { name: "ForecastFilter", fn: () => ForecastFilter && ForecastFilter.init && ForecastFilter.init() },
        { name: "LaborTracker", fn: () => LaborTracker && LaborTracker.init && LaborTracker.init() },
        { name: "SettingsPanel", fn: buildSettingsPanel },
        { name: "ColorCodeLogic", fn: setupColorCodeLogic },
        { name: "AutoFillObserver", fn: initAutoFillObserver },
        { name: "NativeToggle", fn: injectToggleBtnNatively },
        { name: "PtpStatus", fn: checkPtpStatus }
      ];
      tasks.forEach((task) => {
        try {
          task.fn();
        } catch (e) {
          APMLogger.error("Boot", `Failed to initialize ${task.name}:`, e);
        }
      });
      ExtConsistencyManager.bindAll();
      APMScheduler.registerTask("consistency-bind", 1e4, () => ExtConsistencyManager.bindAll());
      APMScheduler.registerTask("ui-persistence", 3e3, () => {
        if (!isTopFrame()) return;
        if (!document.getElementById("apm-settings-panel")) {
          APMLogger.info("APM Master", "Settings panel missing, re-injecting...");
          buildSettingsPanel();
        }
        if (!document.getElementById("eam-forecast-panel")) {
          APMLogger.info("APM Master", "Forecast panel missing, re-injecting...");
          buildForecastUI();
        }
        if (!document.getElementById("apm-quick-search-container")) {
          APMLogger.info("APM Master", "Quick Search missing, re-injecting...");
          buildSearchUI();
        }
        if (!document.getElementById("apm-labor-trigger")) {
          APMLogger.info("APM Master", "Labor Tally missing/detached, re-injecting...");
          LaborTracker.init();
        }
        initForecastShortcuts();
      });
    });
  }

  // src/modules/ptp/ptp-sandbox.js
  init_constants();
  init_logger();
  init_storage();
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
        APMLogger.info("APM Master", "PTP: Injecting Dark Theme Patch");
      }
      (document.head || document.documentElement).appendChild(existing);
    } else if (existing) {
      existing.remove();
      APMLogger.info("APM Master", "PTP: Removing Dark Theme Patch");
    }
  }
  function initPtpSandbox() {
    const isPTP2 = /\.ptp\.amazon\.dev|insights/i.test(window.location.hostname);
    if (!isPTP2) return;
    APMLogger.info("APM Master", `PTP Sandbox detected on: ${window.location.hostname}`);
    let completionFired = false;
    const triggerCompletion = (woNumber) => {
      if (completionFired || !woNumber) return;
      APMLogger.info("APM Master", `PTP Sandbox: Assessment completed via API for WO ${woNumber}. Broadcasting...`);
      window.top.postMessage({ type: "APM_PTP_COMPLETED", wo: woNumber }, "*");
      completionFired = true;
    };
    const triggerStart = (woNumber) => {
      APMLogger.info("APM Master", `PTP Sandbox: Assessment started for WO ${woNumber}. Broadcasting...`);
      window.top.postMessage({ type: "APM_PTP_START", wo: woNumber }, "*");
    };
    const triggerCancel = (woNumber) => {
      APMLogger.info("APM Master", `PTP Sandbox: Assessment cancelled for WO ${woNumber}. Broadcasting...`);
      window.top.postMessage({ type: "APM_PTP_CANCELLED", wo: woNumber }, "*");
    };
    const triggerStopTimer = () => {
      APMLogger.info("APM Master", "PTP Sandbox: Assessment list hit. Requesting timer stop...");
      window.top.postMessage({ type: "APM_PTP_STOP_TIMER" }, "*");
    };
    const handleAssessmentResponse = (url, text, status, requestBody) => {
      try {
        let woFromUrl = null;
        const urlMatch = url.match(/[?&](?:workOrderId|workorder_id)=(\d+)/i);
        if (urlMatch) woFromUrl = urlMatch[1];
        let bodyObj = null;
        if (requestBody && typeof requestBody === "string") {
          try {
            bodyObj = JSON.parse(requestBody);
          } catch (e) {
          }
        }
        const woFromBody = bodyObj?.workorder_id;
        const targetWo = woFromBody || woFromUrl;
        if (url.includes("get_all_assessment")) {
          triggerStopTimer();
        }
        if (url.includes("create_assessment") && status === 200) {
          if (targetWo) triggerStart(targetWo);
          return;
        }
        if (!text) return;
        const res = JSON.parse(text);
        const assessmentStatus = res?.body?.assessment?.AssessmentStatus || res?.body?.response?.final_status;
        const resWo = res?.body?.response?.workorder_id;
        const finalWo = resWo || targetWo;
        if (assessmentStatus === "INCOMPLETE") {
          if (finalWo) triggerStart(finalWo);
        } else if (assessmentStatus === "COMPLETE") {
          if (finalWo) triggerCompletion(finalWo);
        } else if (assessmentStatus === "CANCELLED") {
          if (finalWo) triggerCancel(finalWo);
        } else if (url.includes("get_revisions") && res?.body?.revisions) {
          const inactiveRev = res.body.revisions.find((r) => r.status === "inactive");
          if (inactiveRev && finalWo) triggerCancel(finalWo);
        } else if (url.includes("submit_assessment")) {
          if (text.includes("COMPLETE") && finalWo) {
            triggerCompletion(finalWo);
          } else if (text.includes("CANCELLED") && finalWo) {
            triggerCancel(finalWo);
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
      if (this._apmUrl && (this._apmUrl.includes("submit_assessment") || this._apmUrl.includes("get_assessment") || this._apmUrl.includes("create_assessment") || this._apmUrl.includes("get_all_assessment"))) {
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
        if (url && (url.includes("submit_assessment") || url.includes("get_assessment") || url.includes("create_assessment") || url.includes("get_revisions") || url.includes("get_all_assessment"))) {
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
      APMLogger.debug("APM Master", "PTP Sandbox: Starting core logic");
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
        APMLogger.info("APM Master", `PTP Sandbox: Theme Sync -> ${newTheme}`);
        try {
          APMStorage.set(KEY_THEME, newTheme);
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
        const local = APMStorage.get(KEY_THEME);
        if (local && local !== currentMemTheme) {
          currentMemTheme = local;
          applyPtpCss(DARK_THEMES.has(currentMemTheme));
        }
      } catch (e) {
      }
      APMLogger.debug("APM Master", "PTP Sandbox: Requesting Theme Handshake...");
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
  init_logger();
  init_utils();
  var activeNametagFilter = "";
  function forceFooterText(gridDom, count) {
    if (!gridDom) return;
    const text = `Records: ${count} of ${count}`;
    const elements = gridDom.querySelectorAll(".x-toolbar-text");
    let found = false;
    for (const el2 of elements) {
      if (/Records:\s*/.test(el2.textContent)) {
        el2.textContent = text;
        found = true;
      }
    }
    if (!found) {
      const walk = document.createTreeWalker(gridDom, NodeFilter.SHOW_TEXT, {
        acceptNode: function(node2) {
          return /Records:\s*\d+\s*of\s*\d+/.test(node2.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
        }
      }, false);
      let node;
      while (node = walk.nextNode()) node.nodeValue = text;
    }
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
    const startFilter = performance.now();
    try {
      const keywords = kw.split(",").map((s) => s.trim().toLowerCase()).filter((s) => s);
      if (keywords.length === 0) {
        store.clearFilter();
      } else {
        store.filterBy((record) => {
          if (!record._apmSearchText) {
            record._apmSearchText = Object.values(record.data).map((v) => v !== null && v !== void 0 ? String(v).toLowerCase() : "").join(" ");
          }
          return keywords.some((k) => record._apmSearchText.includes(k));
        });
      }
      const endFilter = performance.now();
      const matchesCount = store.getCount();
      APMLogger.debug("Nametag", `Applied to '${ctx.grid.id}': ${matchesCount} matches in ${(endFilter - startFilter).toFixed(2)}ms`);
      const triggerPulse = (msg) => {
        const gWin = apmGetGlobalWindow();
        const topWin = gWin ? gWin.top : null;
        if (topWin?._APM?.invalidateColorCodeCache) {
          APMLogger.debug("Nametag", `${msg} rendering pulse for '${ctx.grid.id}'`);
          topWin._APM.invalidateColorCodeCache(ctx.doc);
        }
      };
      triggerPulse("Immediate");
      setTimeout(() => triggerPulse("Delayed"), 300);
      if (!store._apmCacheHook) {
        store.on("load", () => {
          store.each((r) => delete r._apmSearchText);
        });
        store._apmCacheHook = true;
      }
      const count = store.getCount();
      if (!store._nativeGetTotalCount) store._nativeGetTotalCount = store.getTotalCount;
      store.getTotalCount = function() {
        return count;
      };
      forceFooterText(gridDom, count);
      if (view && !view.__apmFooterHook) {
        view.on("refresh", () => {
          if (activeNametagFilter && ctx.grid && !ctx.grid.isDestroyed && ctx.grid.rendered) {
            try {
              const el2 = ctx.grid.getEl();
              if (el2 && el2.dom) {
                forceFooterText(el2.dom, ctx.grid.getStore().getCount());
              }
            } catch (e) {
            }
          }
        });
        view.__apmFooterHook = true;
      }
      if (view && view.el) view.el.setScrollTop(0);
      if (view && view.el) view.el.setScrollTop(0);
    } catch (err) {
      APMLogger.error("Nametag", "CRITICAL ERROR in applyNametagFilter:", err);
    }
  }

  // src/core/message-router.js
  init_constants();
  init_ui_manager();
  init_storage();
  init_theme_resolver();
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
        const activeTheme = ThemeResolver.getPreferredTheme();
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
        UIManager.closeAll();
      }
      if (d.type === "APM_PTP_START") {
        if (window.self === window.top) {
          const timerUI = initPtpTimerUI();
          if (timerUI && timerUI.style.display === "none") timerUI.style.display = "flex";
          startPtpCountdown();
        }
        if (d.wo) updatePtpHistory(d.wo, "INCOMPLETE");
      }
      if (d.type === "APM_PTP_CANCELLED") {
        if (window.self === window.top) stopPtpTimer();
        if (d.wo) updatePtpHistory(d.wo, "CANCELLED");
      }
      if (d.type === "APM_PTP_COMPLETED" && d.wo) {
        updatePtpHistory(d.wo, "COMPLETE");
        if (window.self === window.top) stopPtpTimer();
      }
      if (d.type === "APM_PTP_STOP_TIMER") {
        if (window.self === window.top) stopPtpTimer();
      }
      if (d.type === "APM_SET_FILTER") {
        if (typeof window._APM?.applyNametagFilter === "function") {
          window._APM.applyNametagFilter(d.kw);
        }
      }
    });
  }
  function updatePtpHistory(wo, status) {
    let history = APMStorage.get("apm_ptp_history") || {};
    Object.keys(history).forEach((key) => {
      if (typeof history[key] === "number") {
        history[key] = { status: "COMPLETE", time: history[key] };
      }
    });
    history[wo] = { status, time: Date.now() };
    APMStorage.set("apm_ptp_history", history);
    const event = new CustomEvent("APM_PTP_UPDATED_EVENT", { detail: { wo, data: history[wo] } });
    window.dispatchEvent(event);
    const broadcast = (win) => {
      try {
        if (win !== window) win.dispatchEvent(event);
        for (let i = 0; i < win.frames.length; i++) {
          broadcast(win.frames[i]);
        }
      } catch (e) {
      }
    };
    broadcast(window.top);
  }

  // src/core/frame-manager.js
  init_labor_booker();
  init_utils();
  init_logger();
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
    if (LaborBooker && LaborBooker.init) LaborBooker.init(win);
    APMLogger.debug("FrameManager", "Setting up Centralized Reactive Observer for:", win.location.href);
    const observer = new MutationObserver((mutations) => {
      let shouldCheckGrid = false;
      for (const m of mutations) {
        if (m.type === "childList") {
          const hasPotentialGrid = Array.from(m.addedNodes).some(
            (n) => n.nodeType === 1 && (n.classList?.contains("x-grid-item-container") || n.classList?.contains("x-grid-view") || n.classList?.contains("x-panel-body") || // Generic panel body for tab switches
            n.tagName === "IFRAME")
          );
          if (hasPotentialGrid) {
            shouldCheckGrid = true;
            break;
          }
        }
      }
      if (shouldCheckGrid) {
        debouncedProcessColorCodeGrid(doc);
      }
    });
    observer.observe(doc.body || doc.documentElement, { childList: true, subtree: true });
    _gridObservers.set(win, { active: true, observer });
    debouncedProcessColorCodeGrid(doc, true);
  }
  function scanAndAttachFrames() {
    const currentWins = getExtWindows();
    for (const [win, data] of _gridObservers.entries()) {
      try {
        if (!win || win.closed || win !== window && !currentWins.includes(win)) {
          if (data.observer) data.observer.disconnect();
          _gridObservers.delete(win);
          APMLogger.debug("FrameManager", "Cleaned up stale window reference and observer");
        }
      } catch (e) {
        _gridObservers.delete(win);
      }
    }
    attachObserverToDoc(document, window);
    if (!window.__apmIframeObserver) {
      window.__apmIframeObserver = new MutationObserver((mutations) => {
        const hasSrcChange = mutations.some((m) => m.type === "attributes" && m.attributeName === "src" && m.target.tagName === "IFRAME");
        if (hasSrcChange && window.top._APM?.checkSession) {
          window.top._APM.checkSession();
        }
      });
      window.__apmIframeObserver.observe(document.body, {
        attributes: true,
        subtree: true,
        attributeFilter: ["src"]
      });
    }
    const injectComponentWatcher = (win) => {
      if (!win.Ext || !win.Ext.Component || win.__apmWatcherInjected) return;
      const originalInit = win.Ext.Component.prototype.initComponent;
      win.Ext.Component.prototype.initComponent = function() {
        const res = originalInit.apply(this, arguments);
        if (this.isXType) {
          if (this.isXType("gridpanel") || this.isXType("tabpanel")) {
            setTimeout(() => {
              if (!this.isDestroyed) triggerConsistencyForComponent(this, win);
            }, 100);
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
        if (window.top._APM?.bindConsistencyListeners) window.top._APM.bindConsistencyListeners();
      } else if (comp.isXType("tabpanel") || comp.isXType("uxtabpanel")) {
        if (window.top._APM?.bindConsistencyListeners) window.top._APM.bindConsistencyListeners();
      }
    };
    const injectAjaxWatcher = (win) => {
      if (!win.Ext || !win.Ext.Ajax || win.__apmAjaxWatcherInjected) return;
      win.Ext.Ajax.on("requestcomplete", (conn, response, options) => {
        const url = options?.url || "";
        if (url.includes("request") || url.includes("search") || url.includes("grid") || url.includes(".xmlhttp") || url.includes(".HDR") || url.includes(".LST") || url.includes("GRIDDATA")) {
          setTimeout(() => {
            if (window.top._APM?.bindConsistencyListeners) window.top._APM.bindConsistencyListeners();
            if (window.top._APM?.triggerResponsiveInjections) window.top._APM.triggerResponsiveInjections();
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
          if (window.top._APM?.checkSession) window.top._APM.checkSession();
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
                  if (window.top._APM?.checkHotkey) window.top._APM.checkHotkey(e);
                }, true);
                fd.addEventListener("mousedown", (e) => {
                  if (window.top._APM?.handleGlobalClick) window.top._APM.handleGlobalClick(e);
                }, true);
                fd.addEventListener("click", (e) => {
                  if (e.target.closest?.(".apm-nametag") || e.target.closest?.(".apm-copy-icon")) {
                    e.preventDefault();
                    e.stopPropagation();
                  }
                }, true);
                Promise.resolve().then(() => (init_ui_manager(), ui_manager_exports)).then(({ UIManager: UIManager2 }) => {
                  UIManager2.hookFrame(fw);
                });
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
  init_labor_booker();
  init_ui_manager();

  // src/ui/filter-banner.js
  var FilterBanner = /* @__PURE__ */ (function() {
    let banner = null;
    function ensureBanner() {
      if (banner) return banner;
      banner = document.createElement("div");
      banner.id = "apm-filter-banner";
      banner.className = "apm-ui-panel";
      banner.style.cssText = `
            position: fixed;
            top: 10px;
            left: 50%;
            transform: translateX(-50%);
            background: #e74c3c;
            color: white;
            padding: 6px 16px;
            border-radius: 20px;
            font-weight: bold;
            font-size: 13px;
            cursor: pointer;
            z-index: 2147483647;
            display: none;
            box-shadow: 0 4px 10px rgba(0,0,0,0.5);
            transition: opacity 0.2s;
        `;
      banner.onclick = () => {
        window.activeNametagFilter = "";
        hide();
        window.dispatchEvent(new CustomEvent("APM_CLEAR_FILTER"));
      };
      document.body.appendChild(banner);
      return banner;
    }
    function show(filterText) {
      const b = ensureBanner();
      const keywords = filterText.split(",").map((s) => s.trim());
      const display = keywords.length > 2 ? `${keywords[0]}, ${keywords[1]}...` : filterText;
      b.innerHTML = `\u{1F50D} Showing: "${display}" \u2716`;
      b.style.display = "block";
    }
    function hide() {
      if (banner) banner.style.display = "none";
    }
    return {
      show,
      hide
    };
  })();

  // src/index.js
  init_scheduler();
  var mainWin = typeof unsafeWindow !== "undefined" ? unsafeWindow : window;
  (function() {
    const isLanding = mainWin.location.hostname.includes("octave.com") || mainWin.location.hostname.includes("hexagon.com");
    if (isLanding && mainWin.self === mainWin.top) {
      try {
        const stored = localStorage.getItem("apm_v1_general_settings");
        const autoRedirect = stored ? JSON.parse(stored).autoRedirect !== false : true;
        if (autoRedirect && !mainWin.location.href.includes("logindisp")) {
          const DEFAULT_TENANT2 = "AMAZONRMENA_PRD";
          const redirectUrl = `https://us1.eam.hxgnsmartcloud.com/web/base/logindisp?tenant=${DEFAULT_TENANT2}`;
          console.info("[APM] Ultra-Fast Landing Page Redirect Triggered.");
          mainWin.location.replace(redirectUrl);
          throw new Error("APM_REDIRECT_EXIT");
        }
      } catch (e) {
        if (e.message === "APM_REDIRECT_EXIT") return;
      }
    }
  })();
  mainWin._APM = mainWin._APM || {};
  var _APM = mainWin._APM;
  APMLogger.debug("Boot", `APM script initializing in frame: ${window.location.pathname} (Top: ${window.self === window.top})`);
  enforceTheme(mainWin, mainWin.document);
  initializeGeneralSettings();
  BootManager.markReady("settings");
  SessionMonitor.init();
  UIManager.init();
  UIManager.registerPanel("apm-filter-banner");
  var isEAM = mainWin.location.hostname.includes("hxgnsmartcloud.com");
  var isPTP = /\.ptp\.amazon\.dev|insights/i.test(mainWin.location.hostname);
  var isLandingPage = mainWin.location.hostname.includes("octave.com") || mainWin.location.hostname.includes("hexagon.com");
  if (isEAM || isPTP || isLandingPage) {
    if (isPTP) initPtpSandbox();
    if (isEAM) {
      loadColorCodePrefs();
      fullStyleUpdate();
      if (mainWin.self === mainWin.top) {
        setTimeout(checkForGlobalUpdates, 1e4);
      }
      initMessageRouter();
      LaborBooker.init(mainWin);
    }
    if (isEAM || isPTP) {
      _APM.applyNametagFilter = applyNametagFilter;
      _APM.Logger = APMLogger;
      _APM.mainWin = mainWin;
    }
  }
  _APM.closeAllPanels = (explicit) => UIManager.closeAll(explicit);
  _APM.handleGlobalClick = (e) => {
    let target = e.target;
    if (!target) return;
    APMLogger.debug("Core", `Mousedown on: ${target.tagName} (Class: ${target.className})`);
    let nametag = null;
    let icon = null;
    let gridItem = null;
    let curr = target;
    while (curr && curr !== document && curr !== window) {
      const cls = typeof curr.className === "string" ? curr.className : curr.className?.baseVal || "";
      if (cls.includes("apm-nametag")) nametag = curr;
      if (cls.includes("apm-copy-icon")) icon = curr;
      if (cls.includes("x-grid-item")) gridItem = curr;
      if (nametag || icon) break;
      curr = curr.parentNode;
    }
    if (gridItem) {
      APMLogger.debug("Core", "Grid Interaction detected");
    }
    if (nametag) {
      e.preventDefault();
      e.stopPropagation();
      const kw = nametag.getAttribute("data-filter-kw");
      APMLogger.debug("Core", `Nametag click detected: ${kw}`);
      if (kw !== null) {
        const topWin = typeof mainWin !== "undefined" && mainWin.top ? mainWin.top : window.top;
        const isAlreadyActive = topWin.activeNametagFilter === kw;
        const newFilter = isAlreadyActive ? "" : kw;
        topWin.activeNametagFilter = newFilter;
        if (newFilter) {
          FilterBanner.show(newFilter);
          showToast(`Filter Applied: ${newFilter}`, "#27ae60", true);
        } else {
          FilterBanner.hide();
          showToast("Filter Cleared", "#7f8c8d");
        }
        if (typeof _APM.applyNametagFilter === "function") {
          _APM.applyNametagFilter(newFilter);
        }
        document.querySelectorAll("iframe").forEach((f) => {
          try {
            f.contentWindow.postMessage({ type: "APM_SET_FILTER", kw: newFilter }, "*");
          } catch (err) {
          }
        });
      }
      return;
    }
    if (icon) {
      e.preventDefault();
      e.stopPropagation();
      const url = icon.getAttribute("data-wo-copy-url");
      APMLogger.debug("Core", `Icon click detected: ${url}`);
      if (url) {
        navigator.clipboard.writeText(url).then(() => {
          icon.classList.add("apm-copy-success");
          setTimeout(() => icon.classList.remove("apm-copy-success"), 1500);
        });
      }
      return;
    }
  };
  document.addEventListener("mousedown", _APM.handleGlobalClick, true);
  document.addEventListener("click", (e) => {
    if (e.target.closest?.(".apm-nametag") || e.target.closest?.(".apm-copy-icon")) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, true);
  var init = () => {
    if (!isEAM && !isPTP && !isLandingPage) return;
    if (!isLandingPage) {
      UIManager.init();
      UIManager.registerPanel("apm-settings-panel", ["#apm-settings-ext-btn"]);
      UIManager.registerPanel("eam-forecast-panel", ["#apm-forecast-ext-btn"]);
      UIManager.registerPanel("apm-labor-panel", ["#apm-labor-trigger"]);
      UIManager.registerPanel("apm-colorcode-panel", [".apm-toolbar-btn", ".rain-cloud-hover"]);
      UIManager.registerPanel("apm-labor-popup", ["#apm-quick-book-btn"]);
    }
    initBootSequence(mainWin);
    const observer = new MutationObserver((mutations) => {
      const hasNewIframe = mutations.some((m) => Array.from(m.addedNodes).some((n) => n.nodeType === 1 && (n.tagName === "IFRAME" || n.querySelector && n.querySelector("iframe"))));
      if (hasNewIframe) {
        APMScheduler.runTaskNow("frame-sync-pulse");
      }
    });
    const startObservers = () => {
      if (document.body) observer.observe(document.body, { childList: true, subtree: true });
      BootManager.markReady("dom");
      APMScheduler.registerTask("frame-sync-pulse", 5e3, scanAndAttachFrames);
      APMScheduler.runTaskNow("frame-sync-pulse");
      if (mainWin.self === mainWin.top) {
        APMScheduler.registerTask("ptp-status-check", 15e3, checkPtpStatus, { isIdle: true });
      }
    };
    if (document.body) {
      startObservers();
    } else {
      window.addEventListener("DOMContentLoaded", startObservers);
    }
    window.addEventListener("APM_CLEAR_FILTER", () => {
      mainWin.activeNametagFilter = "";
      if (typeof _APM.applyNametagFilter === "function") _APM.applyNametagFilter("");
      showToast("Filter Cleared", "#7f8c8d");
      document.querySelectorAll("iframe").forEach((f) => {
        try {
          f.contentWindow.postMessage({ type: "APM_SET_FILTER", kw: "" }, "*");
        } catch (err) {
        }
      });
    });
  };
  init();
})();
