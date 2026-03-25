// ==UserScript==
// @name         APM Master: Unified Tools
// @namespace    https://w.amazon.com/bin/view/Users/rosendah/APM-Master/
// @version      14.6.9
// @description  Quality of life and automation tool that uses native EAM ExtJS Framework functions for high reliability and capability. This is actively supported tool so Slack me or submit bug report/feature request through the bug report button in the menu.
// @author       Jacob Rosendahl
// @icon         https://media.licdn.com/dms/image/v2/D5603AQGdCV0_LQKRfQ/profile-displayphoto-scale_100_100/B56ZyZLvQ5HgAg-/0/1772096519061?e=1773878400&v=beta&t=eWO1Jiy0-WbzG_yBv-SBrmmsVOPMexF57-q1Xh_VXCk
// @match        https://*.eam.hxgnsmartcloud.com/*
// @match        https://*.sso.eam.hxgnsmartcloud.com/*
// @match        https://idp.federate.amazon.com/*
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
// @connect      raw.githubusercontent.com
// @connect      github.com
// @connect      *.hxgnsmartcloud.com
// ==/UserScript==

if (typeof GM_getValue !== 'undefined' && GM_getValue('apm_theme_hint') === 'dark') {
    var _dc = document.getElementById('apm-dark-canvas') || document.createElement('style');
    _dc.id = 'apm-dark-canvas';
    _dc.textContent = 'html { background-color: #121212 !important; color-scheme: dark !important; }';
    (document.head || document.documentElement).appendChild(_dc);
}

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

  // src/core/context.js
  var mainWin, hostname, url, AppContext, FLAGS;
  var init_context = __esm({
    "src/core/context.js"() {
      mainWin = typeof unsafeWindow !== "undefined" ? unsafeWindow : window;
      hostname = mainWin.location.hostname.toLowerCase();
      url = mainWin.location.href.toLowerCase();
      AppContext = Object.freeze({
        hostname,
        // Core Domains
        isEAM: hostname.includes("hxgnsmartcloud.com"),
        // 'amazon.dev' targets the PTP development domain; 'insights' matches the
        // HxGN EAM Insights subdomain where the PTP timer iframe is hosted.
        isPTP: /\.amazon\.dev$|insights\.hxgnsmartcloud\.com/i.test(hostname),
        isLanding: hostname.includes("octave.com") || hostname.includes("hexagon.com"),
        isShell: url.includes("/base/common"),
        // Auth / Transition Domains
        isIDP: hostname.includes("federate.amazon.com"),
        isSSO: hostname.includes("sso."),
        isSAML: url.includes("saml"),
        get isSubmit() {
          return document.title === "Submit Form";
        },
        isEAMAuth: hostname.includes("hxgnsmartcloud.com") && (url.includes("/sso/") || url.includes("/sp/") || url.includes("ssoservlet")),
        // Frame Context — screen-cache-aware.
        // EAM's "screen cache" wraps the main page in an iframe, so window !== window.top.
        // Fallback: outermost EAM content frame if parent IS top and we're not a
        // shell/content child frame. Note: PTP timer UI bypasses this entirely by
        // always rendering on unsafeWindow.top.document (see ptp-timer.js).
        isTop: window === window.top || (function() {
          try {
            return window.parent === window.top && !url.includes("/base/common") && !url.includes("/base/loadmain");
          } catch (e) {
            return false;
          }
        })(),
        // Logic Aggregates
        get shouldInitUI() {
          return this.isEAM || this.isPTP;
        },
        get isTransition() {
          return this.isIDP || this.isSubmit || (this.isSSO || this.isSAML) && !this.isEAM && !this.isPTP;
        },
        get shouldSkipBoot() {
          return this.isLanding || this.isIDP || this.isSSO;
        }
      });
      FLAGS = Object.freeze({
        CORE_INIT: "__apm_core_initialized",
        BOOT_EXTJS: "__apm_boot_extjs_ready",
        AJAX_HOOK: "__apm_ajax_hooked",
        STORAGE_PATCH: "__apm_storage_patched",
        THEME_UNLOAD: "__apm_theme_unload_bound",
        THEME_MSG: "__apm_theme_msg_bound",
        CONSISTENCY_BOUND: "__apm_consistency_bound",
        GRID_HOOK: "__apm_grid_hooked",
        TAB_CAPTURED: "__apm_tab_defaults_captured",
        FORECAST_TOGGLE: "__apm_forecast_toggle_bound",
        HOTKEYS_BOUND: "__apm_hotkeys_bound",
        MIGRATION_RAN: "__apm_migration_ran",
        SESSION_XHR_HOOK: "__apm_session_xhr_hooked",
        SESSION_FETCH_HOOK: "__apm_session_fetch_hooked",
        UPDATE_CHECKED: "__apm_update_checked",
        MIGRATION_RETRY: "__apm_migration_retry"
      });
    }
  });

  // src/core/constants.js
  var KEY_THEME, CC_STORAGE_RULES, CC_STORAGE_SET, PRESET_STORAGE_KEY, STORAGE_KEY, APM_GENERAL_STORAGE, CURRENT_VERSION, VERSION_CHECK_URL, UPDATE_URL, LABOR_EMPS_STORAGE, LABOR_ACTIVE_STORAGE, LABOR_DOCK_STORAGE, LABOR_PREFS_STORAGE, LABOR_NIGHT_SHIFT_KEY, LABOR_LAST_EMP_KEY, SESSION_STORAGE_KEY, PTP_HISTORY_KEY, UPDATE_CHECK_KEY, MIGRATIONS_DONE_KEY, WELCOME_SEEN_KEY, BETA_VERSION_CHECK_URL, BETA_UPDATE_URL, LOG_LEVELS, DEFAULT_TENANT, SESSION_TIMEOUT_URL, LINK_CONFIG, MIN_GRID_COLUMNS, MIN_TAB_ITEMS, ENTITY_REGISTRY, SCREEN_TITLES;
  var init_constants = __esm({
    "src/core/constants.js"() {
      KEY_THEME = "apm_v1_ui_theme";
      CC_STORAGE_RULES = "apm_v1_colorcode_rules";
      CC_STORAGE_SET = "apm_v1_colorcode_settings";
      PRESET_STORAGE_KEY = "apm_v1_autofill_presets";
      STORAGE_KEY = "apm_v1_forecast_prefs";
      APM_GENERAL_STORAGE = "apm_v1_general_settings";
      CURRENT_VERSION = "14.6.9";
      VERSION_CHECK_URL = "https://raw.githubusercontent.com/jaker788-create/APM-Master/main/forecast.user.js";
      UPDATE_URL = "https://raw.githubusercontent.com/jaker788-create/APM-Master/main/forecast.user.js";
      LABOR_EMPS_STORAGE = "apm_v1_labor_employees";
      LABOR_ACTIVE_STORAGE = "apm_v1_labor_active";
      LABOR_DOCK_STORAGE = "apm_v1_labor_dock";
      LABOR_PREFS_STORAGE = "apm_v1_labor_prefs";
      LABOR_NIGHT_SHIFT_KEY = "apmNightShiftOn";
      LABOR_LAST_EMP_KEY = "apmLastKnownEmpId";
      SESSION_STORAGE_KEY = "ApmSession";
      PTP_HISTORY_KEY = "apm_ptp_history";
      UPDATE_CHECK_KEY = "apm_last_update_check";
      MIGRATIONS_DONE_KEY = "apm_v1_migrations_done";
      WELCOME_SEEN_KEY = "apm_v1_welcome_seen";
      BETA_VERSION_CHECK_URL = "https://raw.githubusercontent.com/jaker788-create/APM-Master/Beta/forecast.user.js";
      BETA_UPDATE_URL = "https://raw.githubusercontent.com/jaker788-create/APM-Master/Beta/forecast.user.js";
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
      MIN_GRID_COLUMNS = 3;
      MIN_TAB_ITEMS = 2;
      ENTITY_REGISTRY = {
        WSJOBS: {
          label: "Work Order",
          systemFunc: "WSJOBS",
          entityKey: "workordernum",
          dataIndex: "workordernum",
          drillbackFlag: "FROMEMAIL",
          pattern: /(?:^|\D)([123]\d{9,})(?=\D|$)/,
          screenTitle: "Work Orders",
          descriptionField: "workorderdesc"
        },
        CTJOBS: {
          label: "Compliance Work Order",
          systemFunc: "WSJOBS",
          entityKey: "workordernum",
          dataIndex: "workordernum",
          drillbackFlag: "FROMEMAIL",
          pattern: /(?:^|\D)([123]\d{9,})(?=\D|$)/,
          screenTitle: "Compliance Work Orders",
          descriptionField: "workorderdesc"
        },
        SSRCVI: {
          label: "Repair Receipt",
          systemFunc: "SSRCVI",
          entityKey: "receiptcode",
          dataIndex: "receiptcode",
          drillbackFlag: "DRILLBACK",
          pattern: /(?:^|\D)([123]\d{9,})(?=\D|$)/,
          screenTitle: "Repair Receipts",
          descriptionField: "receiptdescription"
        },
        SSPART: {
          label: "Part",
          systemFunc: "SSPART",
          entityKey: "partcode",
          dataIndex: "partcode",
          drillbackFlag: "DRILLBACK",
          pattern: null,
          screenTitle: "Parts",
          descriptionField: "partdescription"
        }
      };
      SCREEN_TITLES = {
        BSSTRT: "Start Screen"
      };
    }
  });

  // src/core/storage.js
  var APMStorage;
  var init_storage = __esm({
    "src/core/storage.js"() {
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
                if (typeof gmVal === "string") {
                  try {
                    return JSON.parse(gmVal);
                  } catch (e) {
                    return gmVal;
                  }
                }
                return gmVal;
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
          try {
            if (typeof GM_deleteValue !== "undefined") GM_deleteValue(key);
          } catch (e) {
          }
          try {
            localStorage.removeItem(key);
          } catch (e) {
          }
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

  // src/core/recovery.js
  var Recovery;
  var init_recovery = __esm({
    "src/core/recovery.js"() {
      init_storage();
      init_constants();
      Recovery = {
        /**
         * Remove stuck preview rules from ColorCode storage.
         * Safe operation that only removes rules marked as __preview__ / _isPreview.
         * @returns {Object} { success: boolean, message: string, removed: number, remaining: number }
         */
        removePreviewRules() {
          try {
            const stored = APMStorage.get(CC_STORAGE_RULES);
            if (!stored) {
              return {
                success: false,
                message: "No ColorCode rules found in storage",
                removed: 0,
                remaining: 0
              };
            }
            let rules = Array.isArray(stored) ? stored : stored.rules || [];
            if (!Array.isArray(rules)) {
              return {
                success: false,
                message: "Rules data has unexpected format",
                removed: 0,
                remaining: 0
              };
            }
            const previewRules = rules.filter((r) => r._isPreview || r.id === "__preview__");
            if (previewRules.length === 0) {
              return {
                success: true,
                message: `\u2705 Your data is clean! Found ${rules.length} saved rules with no preview rules.`,
                removed: 0,
                remaining: rules.length
              };
            }
            const cleanedRules = rules.filter((r) => !r._isPreview && r.id !== "__preview__");
            const dataToSave = "_v" in stored ? { _v: 1, rules: cleanedRules } : cleanedRules;
            APMStorage.set(CC_STORAGE_RULES, dataToSave);
            return {
              success: true,
              message: `\u2705 SUCCESS! Removed ${previewRules.length} preview rule(s). Your ${cleanedRules.length} saved rules are intact. Refresh to see changes.`,
              removed: previewRules.length,
              remaining: cleanedRules.length
            };
          } catch (error) {
            return {
              success: false,
              message: `\u274C Error: ${error.message}`,
              removed: 0,
              remaining: 0
            };
          }
        }
      };
    }
  });

  // src/core/api.js
  var APMApi;
  var init_api = __esm({
    "src/core/api.js"() {
      init_context();
      init_recovery();
      APMApi = {
        /** 
         * The raw global _APM object.
         * @private
         * @type {PublicAPI} 
         */
        _api: null,
        /**
         * Initialize the API on the specified window.
         * @param {Window} win 
         */
        init(win = mainWin) {
          if (!win._APM) {
            win._APM = {};
          }
          this._api = win._APM;
        },
        /**
         * Register a service or value.
         * @param {keyof PublicAPI} key 
         * @param {any} value 
         */
        register(key, value) {
          if (!this._api) this.init();
          this._api[key] = value;
        },
        /**
         * Retrieve a service or value.
         * @param {keyof PublicAPI} key 
         * @returns {any}
         */
        get(key) {
          if (!this._api) this.init();
          return this._api[key];
        },
        // Typed Accessors for critical paths
        get invalidateColorCodeCache() {
          return this.get("invalidateColorCodeCache");
        },
        get bindConsistencyListeners() {
          return this.get("bindConsistencyListeners");
        },
        get handleGlobalClick() {
          return this.get("handleGlobalClick");
        },
        get triggerDiscoveryBurst() {
          return this.get("triggerDiscoveryBurst");
        },
        get triggerResponsiveInjections() {
          return this.get("triggerResponsiveInjections");
        },
        get checkSession() {
          return this.get("checkSession");
        },
        get forceRedirect() {
          return this.get("forceRedirect");
        },
        get applyNametagFilter() {
          return this.get("applyNametagFilter");
        },
        get buildForecastUI() {
          return this.get("buildForecastUI");
        },
        get buildSettingsPanel() {
          return this.get("buildSettingsPanel");
        },
        /**
         * Recovery utilities for fixing data corruption and stuck state.
         */
        get recovery() {
          return Recovery;
        }
      };
      if (typeof mainWin !== "undefined") {
        mainWin.APMApi = APMApi;
        if (!mainWin._APM) mainWin._APM = {};
        mainWin._APM.recovery = Recovery;
      }
      if (typeof window !== "undefined") {
        window.APMApi = APMApi;
        if (!window._APM) window._APM = {};
        window._APM.recovery = Recovery;
      }
      if (typeof unsafeWindow !== "undefined") {
        unsafeWindow.APMApi = new Proxy(APMApi, {
          get(target, prop) {
            if (prop === "register" || prop === "_api") return void 0;
            return target[prop];
          },
          set() {
            return true;
          },
          deleteProperty() {
            return true;
          }
        });
        if (!unsafeWindow._APM) unsafeWindow._APM = {};
        unsafeWindow._APM.recovery = Recovery;
      }
    }
  });

  // src/core/diagnostics.js
  var MAX_ERRORS, Diagnostics;
  var init_diagnostics = __esm({
    "src/core/diagnostics.js"() {
      init_api();
      init_context();
      init_constants();
      MAX_ERRORS = 50;
      Diagnostics = {
        bootTimings: {},
        // { [phase]: durationMs }
        perfMetrics: {
          // Aggregated telemetry
          colorCode: [],
          // Last 20 durations
          eamQuery: [],
          // Last 20 latencies
          scheduler: {}
          // { [taskName]: avgDuration }
        },
        errors: [],
        // last 50 errors with timestamps
        _watchers: /* @__PURE__ */ new Map(),
        startTime: Date.now(),
        /**
         * Record a timing landmark.
         * @param {string} phase 
         * @param {number} durationMs 
         */
        recordTiming(phase, durationMs) {
          this.bootTimings[phase] = durationMs;
        },
        /**
         * Record a performance metric with rolling average.
         * @param {string} key 
         * @param {number} value 
         */
        recordPerformance(key, value) {
          if (!this.perfMetrics[key]) this.perfMetrics[key] = [];
          this.perfMetrics[key].unshift(value);
          if (this.perfMetrics[key].length > 20) this.perfMetrics[key].pop();
        },
        /**
         * Records scheduler task execution duration.
         */
        recordSchedulerTask(name, duration) {
          if (!this.perfMetrics.scheduler[name]) {
            this.perfMetrics.scheduler[name] = { count: 0, total: 0, max: 0 };
          }
          const m = this.perfMetrics.scheduler[name];
          m.count++;
          m.total += duration;
          m.max = Math.max(m.max, duration);
        },
        /**
         * Add an error to the circular buffer.
         * @param {Object} errObj 
         */
        addError(errObj) {
          this.errors.unshift({
            timestamp: (/* @__PURE__ */ new Date()).toISOString(),
            ...errObj
          });
          if (this.errors.length > MAX_ERRORS) {
            this.errors.pop();
          }
        },
        /**
         * Captures a snapshot of the current scheduler state.
         * @returns {Object}
         */
        schedulerSnapshot() {
          try {
            const scheduler = APMApi.get("scheduler");
            if (!scheduler) return { status: "missing" };
            return { status: "active", tasks: scheduler.getTasks ? scheduler.getTasks() : "unknown" };
          } catch (e) {
            return { status: "error", message: e.message };
          }
        },
        /**
         * Captures status of iframe observers and style injections.
         * @returns {Object}
         */
        frameSnapshot() {
          const results = {
            top: {
              hotkeys: !!window[FLAGS.HOTKEYS_BOUND],
              styles: !!document.getElementById("apm-static-styles")
            },
            frames: []
          };
          try {
            document.querySelectorAll("iframe").forEach((f) => {
              const info = { id: f.id, accessible: false };
              try {
                const win = f.contentWindow;
                const doc = f.contentDocument;
                if (win && doc) {
                  info.accessible = true;
                  info.url = win.location.href;
                  info.gridFound = !!doc.querySelector(".x-grid-item");
                  info.ccFound = !!doc.querySelector("[data-cc-rule]");
                  info.tagsFound = !!doc.querySelector(".apm-nametag");
                  info.styles = !!doc.getElementById("apm-static-styles") || doc.adoptedStyleSheets && doc.adoptedStyleSheets.length > 0;
                }
              } catch (e) {
                info.error = "Cross-origin or blocked";
              }
              results.frames.push(info);
            });
          } catch (e) {
            results.error = e.message;
          }
          return results;
        },
        /**
         * Monitor a specific element for mutations (Sentinel logic).
         * @param {string} selector 
         */
        watchElement(selector) {
          const target = document.querySelector(selector);
          if (!target) return false;
          if (this._watchers.has(selector)) {
            this._watchers.get(selector).disconnect();
          }
          let lastAlertTime = 0;
          const observer = new MutationObserver((mutations) => {
            const now = Date.now();
            if (now - lastAlertTime < 5e3) return;
            lastAlertTime = now;
            this.addError({
              tag: "Sentinel",
              message: `Mutation detected on ${selector}: ${mutations.length} changes.`
            });
            console.warn("[Diagnostics] Sentinel alert:", mutations);
          });
          observer.observe(target, { childList: true, subtree: true, attributes: true });
          this._watchers.set(selector, observer);
          return true;
        },
        unwatchElement(selector) {
          if (this._watchers.has(selector)) {
            this._watchers.get(selector).disconnect();
            this._watchers.delete(selector);
            return true;
          }
          return false;
        },
        /**
         * Calculates summary statistics for the UI.
         * @returns {Object}
         */
        getPerformanceSummary() {
          const stats = {
            boot: this.bootTimings,
            colorCode: this.calculateStats(this.perfMetrics.colorCode),
            eamQuery: this.calculateStats(this.perfMetrics.eamQuery),
            scheduler: Object.entries(this.perfMetrics.scheduler).map(([name, data]) => ({
              name,
              avg: (data.total / data.count).toFixed(2),
              max: data.max.toFixed(2),
              count: data.count
            })).sort((a, b) => b.avg - a.avg)
          };
          return stats;
        },
        /**
         * Internal helper for array stats.
         */
        calculateStats(arr) {
          if (!arr || arr.length === 0) return { avg: 0, p95: 0, count: 0 };
          const sorted = [...arr].sort((a, b) => a - b);
          const sum = sorted.reduce((a, b) => a + b, 0);
          const avg = sum / sorted.length;
          const p95Idx = Math.min(Math.ceil(sorted.length * 0.95) - 1, sorted.length - 1);
          const p95 = sorted[p95Idx];
          return {
            avg: parseFloat(avg.toFixed(2)),
            p95: parseFloat(p95.toFixed(2)),
            max: parseFloat(sorted[sorted.length - 1].toFixed(2)),
            count: arr.length
          };
        },
        /**
         * Aggregates all diagnostic data into a single object.
         * @returns {Object}
         */
        toJSON() {
          return {
            version: CURRENT_VERSION,
            timestamp: (/* @__PURE__ */ new Date()).toISOString(),
            uptime: Math.floor((Date.now() - this.startTime) / 1e3),
            bootTimings: this.bootTimings,
            performance: this.perfMetrics,
            errors: this.errors,
            frames: this.frameSnapshot(),
            userAgent: navigator.userAgent,
            url: window.location.href
          };
        }
      };
      APMApi.register("diagnostics", Diagnostics);
    }
  });

  // src/core/logger.js
  var currentNumericLevel, APMLogger;
  var init_logger = __esm({
    "src/core/logger.js"() {
      init_constants();
      init_diagnostics();
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
            try {
              Diagnostics.addError({
                tag,
                message: args.map((a) => {
                  if (a instanceof Error) return a.message + "\n" + a.stack;
                  if (typeof a === "object") {
                    try {
                      return JSON.stringify(a);
                    } catch (_) {
                      return String(a);
                    }
                  }
                  return String(a);
                }).join(" ")
              });
            } catch (e) {
            }
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
      } else if (["checked", "value", "disabled", "readOnly", "title", "href"].includes(key)) {
        element[key] = value;
      } else {
        element.setAttribute(key, value);
      }
    }
    const childrenArray = Array.isArray(children) ? children : children !== null && children !== void 0 ? [children] : [];
    for (const child of childrenArray) {
      if (typeof child === "string" || typeof child === "number") {
        element.appendChild(document.createTextNode(child));
      } else if (child && (child.nodeType && (child.nodeType === 1 || child.nodeType === 3 || child.nodeType === 11) || child instanceof SVGElement)) {
        element.appendChild(child);
      }
    }
    return element;
  }
  var init_dom_helpers = __esm({
    "src/ui/dom-helpers.js"() {
    }
  });

  // src/core/toast.js
  function getOrCreateToast(id) {
    let t = document.getElementById(id);
    if (!t) {
      t = el("div", {
        id,
        style: {
          position: "fixed",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: "2147483647",
          padding: "8px 20px",
          borderRadius: "30px",
          fontWeight: "bold",
          fontFamily: "sans-serif",
          fontSize: "13px",
          color: "white",
          opacity: "0",
          transition: "opacity 0.3s ease, transform 0.3s ease",
          boxShadow: "0 4px 15px rgba(0,0,0,0.4)",
          pointerEvents: "none",
          cursor: "default"
        }
      });
      document.body.appendChild(t);
    }
    return t;
  }
  function animateIn(t) {
    setTimeout(() => {
      t.style.opacity = "1";
      t.style.transform = t._translateBase + " translateY(0)";
    }, 10);
  }
  function animateOut(t, cb) {
    t.style.opacity = "0";
    t.style.transform = t._translateBase + " translateY(-20px)";
    setTimeout(() => {
      t.style.display = "none";
      if (cb) cb();
    }, 300);
  }
  function showToast(msg, color, keepOpen = false, onClick = null) {
    if (onClick) {
      _persistentMsg = msg;
      _persistentColor = color;
      _persistentOnClick = onClick;
      _showPersistent();
      return;
    }
    if (!_persistentOnClick) {
      _persistentMsg = null;
      _persistentColor = null;
      const pt = document.getElementById("apm-persistent-toast");
      if (pt && pt.style.display !== "none") animateOut(pt);
    }
    const t = getOrCreateToast("apm-global-toast");
    t.style.top = "15px";
    t._translateBase = "translateX(-50%)";
    t.onclick = null;
    t.style.cursor = "default";
    t.style.pointerEvents = "none";
    if (!msg) {
      animateOut(t);
      return;
    }
    t.textContent = msg;
    t.style.background = color || "var(--apm-accent)";
    t.style.display = "block";
    document.body.appendChild(t);
    animateIn(t);
    _nudgePersistent(true);
    if (_toastTimeout) clearTimeout(_toastTimeout);
    if (keepOpen) {
      _toastTimeout = null;
    } else {
      _toastTimeout = setTimeout(() => {
        animateOut(t, () => _nudgePersistent(false));
      }, 5e3);
    }
  }
  function _showPersistent() {
    const t = getOrCreateToast("apm-persistent-toast");
    t.style.top = "15px";
    t._translateBase = "translateX(-50%)";
    t.onclick = null;
    t.style.cursor = "default";
    t.style.pointerEvents = "none";
    if (!_persistentMsg) {
      animateOut(t);
      return;
    }
    t.textContent = _persistentMsg;
    t.style.background = _persistentColor || "var(--apm-success)";
    t.style.display = "block";
    document.body.appendChild(t);
    if (_persistentOnClick) {
      t.style.pointerEvents = "auto";
      t.style.cursor = "pointer";
      t.onclick = (e) => {
        e.stopPropagation();
        _persistentOnClick(e);
        _persistentMsg = null;
        _persistentColor = null;
        _persistentOnClick = null;
        animateOut(t);
      };
    }
    const tmp = document.getElementById("apm-global-toast");
    const tmpVisible = tmp && tmp.style.opacity === "1" && tmp.style.display !== "none";
    if (tmpVisible) {
      t.style.top = "55px";
    }
    animateIn(t);
  }
  function _nudgePersistent(down) {
    const t = document.getElementById("apm-persistent-toast");
    if (!t || t.style.display === "none" || t.style.opacity === "0") return;
    t.style.top = down ? "55px" : "15px";
  }
  function clearPersistentToast() {
    _persistentMsg = null;
    _persistentColor = null;
    _persistentOnClick = null;
    const t = document.getElementById("apm-persistent-toast");
    if (t) animateOut(t);
  }
  var _toastTimeout, _persistentMsg, _persistentColor, _persistentOnClick;
  var init_toast = __esm({
    "src/core/toast.js"() {
      init_dom_helpers();
      _toastTimeout = null;
      _persistentMsg = null;
      _persistentColor = null;
      _persistentOnClick = null;
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

  // src/core/state.js
  function initializeGeneralSettings() {
    if (_settingsInitialized) return apmGeneralSettings;
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
          const raw = JSON.parse(decodeURIComponent(cookieMatch[1]));
          const COOKIE_KEYS = ["autoRedirect", "dateFormat", "dateSeparator", "updateTrack"];
          parsed = Object.fromEntries(
            Object.entries(raw).filter(([k]) => COOKIE_KEYS.includes(k))
          );
          APMLogger.info("APM State", "Recovered from cookie:", parsed);
        } catch (e) {
        }
      }
    }
    if (parsed) {
      const existingFlags = { ...apmGeneralSettings.flags };
      Object.assign(apmGeneralSettings, DEFAULT_SETTINGS, parsed);
      apmGeneralSettings.flags = { ...existingFlags, ...parsed.flags || {} };
    } else {
      if (isTopFrame()) {
        APMLogger.info("APM State", "No stored settings found, using defaults.");
      }
      const existingFlags = { ...apmGeneralSettings.flags };
      Object.assign(apmGeneralSettings, DEFAULT_SETTINGS);
      apmGeneralSettings.flags = { ...existingFlags };
    }
    _settingsInitialized = true;
    APMLogger.info("APM State", "Initialization complete.");
    return apmGeneralSettings;
  }
  function saveGeneralSettings() {
    apmGeneralSettings._v = 1;
    APMStorage.set(APM_GENERAL_STORAGE, apmGeneralSettings);
    try {
      const domain = ".hxgnsmartcloud.com";
      const expiry = new Date(Date.now() + 365 * 24 * 60 * 60 * 1e3).toUTCString();
      const syncData = {
        autoRedirect: apmGeneralSettings.autoRedirect,
        dateFormat: apmGeneralSettings.dateFormat,
        dateSeparator: apmGeneralSettings.dateSeparator,
        updateTrack: apmGeneralSettings.updateTrack
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
              columnOrders: {},
              // Keyed by SYSTEM_FUNCTION_NAME
              tabOrders: {},
              // Keyed by SYSTEM_FUNCTION_NAME
              hiddenTabs: {}
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
        updateTrack: "stable",
        // stable, beta
        flags: {}
        // Phase 9: Feature Flags
      };
      apmGeneralSettings = { ...DEFAULT_SETTINGS };
      _settingsInitialized = false;
    }
  });

  // src/core/utils.js
  function apmGetGlobalWindow() {
    return typeof unsafeWindow !== "undefined" ? unsafeWindow : window;
  }
  function safePostMessage(targetWin, data) {
    try {
      const origin = targetWin.location.origin;
      targetWin.postMessage(data, origin);
    } catch (e) {
      try {
        targetWin.postMessage(data, "*");
      } catch (e2) {
        APMLogger.debug("Core", "postMessage: both origin attempts failed, message not sent");
      }
    }
  }
  function isFrameVisible(win) {
    try {
      if (win === window || win === window.top) return true;
      if (typeof unsafeWindow !== "undefined" && win === unsafeWindow) return true;
      const parentDoc = win.parent?.document;
      if (!parentDoc) return true;
      const iframes = parentDoc.querySelectorAll("iframe");
      for (const f of iframes) {
        try {
          if (f.contentWindow === win) {
            const style = parentDoc.defaultView.getComputedStyle(f);
            if (style.display === "none" || style.visibility === "hidden") return false;
            const rect = f.getBoundingClientRect();
            return rect.width > 0 && rect.height > 0;
          }
        } catch (e) {
        }
      }
      return true;
    } catch (e) {
      return true;
    }
  }
  function isWindowAccessible(win) {
    if (!win) return false;
    try {
      return !!(win.location && typeof win.location.href === "string");
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
    const now = performance.now();
    if (_extWinsCache && now - _extWinsCacheTime < EXT_WINS_CACHE_TTL) return _extWinsCache;
    const root = apmGetGlobalWindow();
    const wins = /* @__PURE__ */ new Set();
    const gather = (win) => {
      if (!isWindowAccessible(win)) return;
      try {
        if (win.Ext) wins.add(win);
        for (let i = 0; i < win.frames.length; i++) {
          gather(win.frames[i]);
        }
      } catch (e) {
      }
    };
    const rootTop = root.top;
    if (isWindowAccessible(rootTop)) gather(rootTop);
    gather(root);
    _extWinsCache = [...wins];
    _extWinsCacheTime = now;
    return _extWinsCache;
  }
  function getAccessibleDocs() {
    const root = apmGetGlobalWindow();
    const docs = /* @__PURE__ */ new Set();
    const wins = /* @__PURE__ */ new Set();
    const gather = (win) => {
      if (!win || wins.has(win) || !isWindowAccessible(win)) return;
      try {
        wins.add(win);
        let doc = win.document;
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
    const rootTop = root.top;
    if (isWindowAccessible(rootTop)) gather(rootTop);
    gather(root);
    return [...docs];
  }
  function findMainGrid(invalidate = false) {
    if (invalidate) {
      _mainGridCache = null;
      _lastGridCheck = 0;
    }
    const now = performance.now();
    if (_mainGridCache && now - _lastGridCheck < GRID_CACHE_TTL) {
      if (!_mainGridCache.grid.isDestroyed && _mainGridCache.grid.rendered) {
        if (isFrameVisible(_mainGridCache.win)) return _mainGridCache;
        _mainGridCache = null;
      } else {
        _mainGridCache = null;
      }
    }
    const start = performance.now();
    const wins = getExtWindows();
    const candidates = [];
    for (const win of wins) {
      try {
        if (!win.Ext?.ComponentQuery) continue;
        const frameVis = isFrameVisible(win);
        const grids = win.Ext.ComponentQuery.query("gridpanel:not([destroyed=true])").filter((g) => g.rendered && !g.isDestroyed && !g.destroying && g.headerCt?.rendered && g.columns?.length > MIN_GRID_COLUMNS && !g.up("window"));
        for (const g of grids) {
          candidates.push({ win, grid: g, visible: frameVis });
        }
      } catch (e) {
      }
    }
    if (candidates.length === 0) {
      _mainGridCache = null;
      _lastGridCheck = performance.now();
      APMLogger.info("Utils", `findMainGrid found NOTHING in ${wins.length} windows`);
      return null;
    }
    candidates.sort((a, b) => {
      if (a.visible !== b.visible) return b.visible ? 1 : -1;
      return b.grid.columns.length - a.grid.columns.length;
    });
    const best = candidates[0];
    const end = performance.now();
    _mainGridCache = { win: best.win, doc: best.win.document, grid: best.grid };
    _lastGridCheck = end;
    APMLogger.debug("Utils", `findMainGrid found: ${best.grid.id} in ${(end - start).toFixed(2)}ms (Cols: ${best.grid.columns.length}, FrameVisible: ${best.visible})`);
    return _mainGridCache;
  }
  function findMainTabPanel() {
    const candidates = [];
    for (const win of getExtWindows()) {
      try {
        if (!win.Ext?.ComponentQuery) continue;
        const frameVis = isFrameVisible(win);
        const tps = win.Ext.ComponentQuery.query("tabpanel:not([destroyed=true]), uxtabpanel:not([destroyed=true])").filter((tp) => tp.rendered && !tp.isDestroyed && tp.items?.items?.length > MIN_TAB_ITEMS && tp.items.items.some((t) => t.itemId === "HDR"));
        for (const tp of tps) {
          candidates.push({ win, tabPanel: tp, visible: frameVis });
        }
      } catch (e) {
      }
    }
    candidates.sort((a, b) => {
      if (a.visible !== b.visible) return b.visible ? 1 : -1;
      return b.tabPanel.items.items.length - a.tabPanel.items.items.length;
    });
    if (candidates.length > 0) return { win: candidates[0].win, tabPanel: candidates[0].tabPanel };
    return null;
  }
  function setXhrScreenContext(userFunc, systemFunc) {
    if (userFunc && userFunc !== _xhrUserFunc) {
      _mainGridCache = null;
      _lastGridCheck = 0;
    }
    if (userFunc) _xhrUserFunc = userFunc;
    if (systemFunc) _xhrSystemFunc = systemFunc;
  }
  function getXhrScreenContext() {
    return { userFunc: _xhrUserFunc, systemFunc: _xhrSystemFunc };
  }
  function detectScreenFunction(win, grid) {
    if (!win) {
      const mg = findMainGrid();
      if (mg) {
        win = mg.win;
        grid = grid || mg.grid;
      }
    }
    if (grid) {
      const name = _funcFromStore(grid);
      if (name) return name;
    }
    if (win?.Ext?.ComponentQuery) {
      try {
        const grids = win.Ext.ComponentQuery.query("gridpanel:not([destroyed=true])");
        for (const g of grids) {
          if (!g.rendered || g.isDestroyed) continue;
          const name = _funcFromStore(g);
          if (name) return name;
        }
      } catch (e) {
      }
    }
    if (win) {
      try {
        const eamUsr = win.EAM?.USER_FUNCTION_NAME;
        if (eamUsr && !_GENERIC_FUNCS.has(eamUsr)) return eamUsr;
      } catch (e) {
      }
    }
    if (win) {
      try {
        const params = new URLSearchParams(win.location.search);
        const usr = params.get("USER_FUNCTION_NAME");
        if (usr && !_GENERIC_FUNCS.has(usr)) return usr;
        const sys = params.get("SYSTEM_FUNCTION_NAME");
        if (sys && !_GENERIC_FUNCS.has(sys)) return sys;
      } catch (e) {
      }
    }
    if (_xhrUserFunc && !_GENERIC_FUNCS.has(_xhrUserFunc)) return _xhrUserFunc;
    return apmGetActiveFunctionNames().userFunc;
  }
  function _funcFromStore(grid) {
    try {
      const extra = grid.getStore?.()?.getProxy?.()?.extraParams;
      if (!extra) return null;
      const usr = extra.USER_FUNCTION_NAME;
      if (usr && !_GENERIC_FUNCS.has(usr)) return usr;
      const sys = extra.SYSTEM_FUNCTION_NAME;
      if (sys && !_GENERIC_FUNCS.has(sys)) return sys;
    } catch (e) {
    }
    return null;
  }
  function apmGetActiveFunctionNames() {
    const mainGrid = findMainGrid();
    if (mainGrid) {
      const name = _funcFromStore(mainGrid.grid);
      if (name) {
        try {
          const extra = mainGrid.grid.getStore?.()?.getProxy?.()?.extraParams;
          return { systemFunc: extra?.SYSTEM_FUNCTION_NAME || name, userFunc: name };
        } catch (e) {
        }
        return { systemFunc: name, userFunc: name };
      }
    }
    if (_xhrUserFunc && !_GENERIC_FUNCS.has(_xhrUserFunc)) {
      return { systemFunc: _xhrSystemFunc || _xhrUserFunc, userFunc: _xhrUserFunc };
    }
    const wins = getExtWindows();
    for (const win of wins) {
      try {
        const params = new URLSearchParams(win.location.search);
        const sys = params.get("SYSTEM_FUNCTION_NAME");
        const usr = params.get("USER_FUNCTION_NAME");
        if (sys && !_GENERIC_FUNCS.has(sys)) {
          return { systemFunc: sys, userFunc: usr || sys };
        }
      } catch (e) {
      }
    }
    return { systemFunc: "GLOBAL", userFunc: "GLOBAL" };
  }
  function clickLikeUser(el2) {
    try {
      const rect = el2.getBoundingClientRect();
      const opts = { bubbles: true, cancelable: true, view: window, clientX: rect.left + rect.width / 2, clientY: rect.top + rect.height / 2 };
      el2.dispatchEvent(new MouseEvent("mousedown", opts));
      el2.dispatchEvent(new MouseEvent("mouseup", opts));
      el2.dispatchEvent(new MouseEvent("click", opts));
    } catch (e) {
      el2.click?.();
    }
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
    const datePart = isoDate.split("T")[0];
    const [y, m, d] = datePart.split("-");
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
  function applyZoomCompensation(element, opts = {}) {
    const ZOOM_BLEND = 0.75;
    const update = () => {
      const dpr = window.devicePixelRatio || 1;
      const zoomFactor = 1 + (1 / dpr - 1) * ZOOM_BLEND;
      element.style.zoom = zoomFactor;
      if (opts.onUpdate) opts.onUpdate(zoomFactor, dpr);
    };
    update();
    let currentMql = null;
    let currentHandler = null;
    let cancelled = false;
    const listen = () => {
      if (cancelled) return;
      currentMql = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
      currentHandler = () => {
        update();
        currentMql.removeEventListener("change", currentHandler);
        listen();
      };
      currentMql.addEventListener("change", currentHandler);
    };
    listen();
    return () => {
      cancelled = true;
      if (currentMql && currentHandler) {
        currentMql.removeEventListener("change", currentHandler);
      }
    };
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
  async function openFirstGridRecord(grid, win, timeoutMs = 5e3) {
    const store = grid.getStore();
    if (!store || store.getCount() === 0) return { success: false };
    const record = store.getAt(0);
    const selModel = grid.getSelectionModel();
    if (selModel && selModel.select) selModel.select(record);
    const view = grid.getView();
    const rowEl = view.getRow?.(0) ?? view.getNode?.(0);
    APMLogger.info("Utils", `Opening first grid record: ${record.get("workordernum") || record.getId()}`);
    grid.fireEvent("itemdblclick", grid, record, rowEl, 0, {});
    await waitForAjax(win);
    const pollInterval = 250;
    const maxPolls = Math.ceil(timeoutMs / pollInterval);
    for (let i = 0; i < maxPolls; i++) {
      await delay(pollInterval);
      for (const w of getExtWindows()) {
        try {
          if (!w.Ext?.ComponentQuery) continue;
          const forms = w.Ext.ComponentQuery.query("form[id*=recordview]");
          if (forms.some((f) => f.rendered && f.el && !f.isDestroyed)) {
            APMLogger.info("Utils", `Record view ready after ${(i + 1) * pollInterval}ms`);
            await delay(200);
            const entityId = record.get("workordernum") || record.get("receiptcode") || record.get("partcode") || record.getId();
            return { success: true, entityId: String(entityId) };
          }
        } catch (e) {
        }
      }
    }
    APMLogger.warn("Utils", `Record view did not appear within ${timeoutMs}ms`);
    return { success: false };
  }
  function _detectMoreRecords(store, rawData) {
    if (store.__apmLastHasMore !== void 0) {
      const result = !!store.__apmLastHasMore;
      APMLogger.debug("Utils", `[Fetch Logic] Using Reader-hooked morePresent: ${result}`);
      delete store.__apmLastHasMore;
      return result;
    }
    if (!rawData) return false;
    try {
      if (rawData.nodeType === Node.DOCUMENT_NODE || rawData.nodeType === Node.ELEMENT_NODE || typeof rawData === "string" && rawData.includes("<?xml")) {
        let xmlDoc = typeof rawData === "string" ? new DOMParser().parseFromString(rawData, "text/xml") : rawData;
        const metaNode = xmlDoc.querySelector?.("METADATA") || xmlDoc;
        return metaNode.getAttribute?.("MORERECORDPRESENT") === "+" || metaNode.querySelector?.("MORERECORDPRESENT")?.textContent === "+";
      } else {
        const data = rawData?.pageData?.grid?.GRIDRESULT?.GRID?.METADATA ? rawData.pageData.grid.GRIDRESULT.GRID.METADATA : rawData?.GRIDRESULT?.GRID?.METADATA ? rawData.GRIDRESULT.GRID.METADATA : rawData?.METADATA || rawData;
        return data.MORERECORDPRESENT === "+" || data.MORERECORDPRESENT === "Y";
      }
    } catch (e) {
      return false;
    }
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
      const morePresent = _detectMoreRecords(store, rawData);
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
          return new Promise((resolve, reject) => {
            store.load({
              addRecords: true,
              params: loadParams,
              // Injected params will be merged by ExtJS
              callback: (records, op, success) => {
                if (success) {
                  options.operation = op;
                  setTimeout(() => checkAndDoFetch().then(resolve, reject), 300);
                } else resolve();
              }
            });
          });
        } else {
          const fallbackParams = {
            ...extraParams,
            GET_ALL_DATABSE_ROWS: "true",
            // Intentional misspelling — matches EAM server API parameter name
            REQUEST_TYPE: "LIST.DATA_ONLY.STORED",
            CURSOR_POSITION: nextCursor.toString()
          };
          APMLogger.debug("Utils", `Triggering fallback load for ${grid.id} at cursor ${nextCursor}`);
          return new Promise((resolve, reject) => {
            store.load({
              addRecords: true,
              params: fallbackParams,
              callback: (records, op, success) => {
                if (success) {
                  options.operation = op;
                  setTimeout(() => checkAndDoFetch().then(resolve, reject), 300);
                } else resolve();
              }
            });
          });
        }
      }
    };
    return checkAndDoFetch();
  }
  var delay, _extWinsCache, _extWinsCacheTime, EXT_WINS_CACHE_TTL, _mainGridCache, _lastGridCheck, GRID_CACHE_TTL, _xhrUserFunc, _xhrSystemFunc, _GENERIC_FUNCS, ExtUtils;
  var init_utils = __esm({
    "src/core/utils.js"() {
      init_state();
      init_logger();
      init_constants();
      delay = (ms) => new Promise((res) => setTimeout(res, ms));
      _extWinsCache = null;
      _extWinsCacheTime = 0;
      EXT_WINS_CACHE_TTL = 500;
      _mainGridCache = null;
      _lastGridCheck = 0;
      GRID_CACHE_TTL = 5e3;
      _xhrUserFunc = null;
      _xhrSystemFunc = null;
      _GENERIC_FUNCS = /* @__PURE__ */ new Set(["WSTABS", "WSFLTR", "GLOBAL", ""]);
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

  // src/core/origin-guard.js
  function isTrustedOrigin(origin) {
    if (!origin || origin === "null") return false;
    if (origin === window.location.origin) return true;
    try {
      const hostname2 = new URL(origin).hostname;
      return TRUSTED_PATTERNS.some((p) => p.test(hostname2));
    } catch {
      return false;
    }
  }
  var TRUSTED_PATTERNS;
  var init_origin_guard = __esm({
    "src/core/origin-guard.js"() {
      TRUSTED_PATTERNS = [
        /\.hxgnsmartcloud\.com$/,
        /\.hexagon\.com$/,
        // IMPORTANT: Must be \.amazon\.dev$ (broad), NOT \.ptp\.amazon\.dev$ (narrow).
        // PTP uses varying subdomains: user.sparsy.insights.amazon.dev, *.ptp.amazon.dev, etc.
        // A narrow pattern breaks PTP communication silently — no error, just dropped messages.
        // Message handlers must also validate message structure/type.
        /\.amazon\.dev$/
      ];
    }
  });

  // src/core/ui-manager.js
  var UIManager;
  var init_ui_manager = __esm({
    "src/core/ui-manager.js"() {
      init_logger();
      init_utils();
      init_origin_guard();
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
            if (!window._apmUiFallback) {
              window._apmUiFallback = { panels: /* @__PURE__ */ new Set(), triggers: /* @__PURE__ */ new Set(), lastTriggerTime: 0, activePanelId: null };
            }
            return window._apmUiFallback;
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
          window.addEventListener("message", (e) => {
            if (e.data?.type === "APM_CLOSE_UI" && isTrustedOrigin(e.origin)) handleCloseSignal(e);
          });
          try {
            window.top.addEventListener("APM_CLOSE_UI", handleCloseSignal);
          } catch (e) {
            window.addEventListener("APM_CLOSE_UI", handleCloseSignal);
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
              try {
                openFn();
                registry.activePanelId = panelId;
                try {
                  window.top._apmUi.activePanelId = panelId;
                } catch (e) {
                }
              } catch (e) {
                registry.activePanelId = null;
                APMLogger.error("UIManager", "Panel open failed:", e);
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
              if (!_cachedTriggerSelector) _cachedTriggerSelector = Array.from(registry.triggers).join(",");
              const triggerMatch = _cachedTriggerSelector ? target.closest(_cachedTriggerSelector) : null;
              if (triggerMatch) {
                registry.lastTriggerTime = Date.now();
                try {
                  window.top._apmUi.lastTriggerTime = Date.now();
                } catch (err) {
                }
                APMLogger.verbose("UIManager", `Trigger click detected: ${triggerMatch.tagName || "element"}`);
                return;
              }
              const isInsidePanel = target.closest(".apm-ui-panel") || Array.from(registry.panels).some((id) => {
                return targetWin.document.getElementById(id)?.contains(target);
              });
              const isSystem = target.closest(".swal2-container") || target.closest(".x-mask") || target.closest(".x-datepicker") || target.closest(".x-menu") || target.closest(".x-layer") || target.closest(".x-combo-list") || target.closest(".x-tip");
              const isFormElement = ["INPUT", "TEXTAREA", "SELECT", "OPTION"].includes(target.tagName) || target.closest("form");
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
        let _cachedTriggerSelector = null;
        function registerPanel(panelId, triggerSelectors = []) {
          localPanels.add(panelId);
          const registry = getGlobalRegistry();
          registry.panels.add(panelId);
          triggerSelectors.forEach((s) => registry.triggers.add(s));
          _cachedTriggerSelector = null;
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
                safePostMessage(w, detail);
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
            if (el2 && (el2.style.display !== "none" && el2.style.visibility !== "hidden")) {
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
      init_diagnostics();
      TaskScheduler = class {
        constructor() {
          this.instanceId = Math.random().toString(36).substring(7);
          this.tasks = [];
          this.running = false;
          this.timeoutId = null;
          APMLogger.info("Scheduler", `New TaskScheduler instance created: ${this.instanceId}`);
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
          APMLogger.info("Scheduler", `[${this.instanceId}] Task registered: ${id} (${intervalMs}ms)`);
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
                const start = performance.now();
                try {
                  task.callback();
                } catch (e) {
                  APMLogger.error("Scheduler", `Error in task '${task.id}':`, e);
                }
                const duration = performance.now() - start;
                if (duration > 50) {
                  APMLogger.warn("Scheduler", `Task '${task.id}' took ${duration.toFixed(2)}ms`);
                }
                try {
                  Diagnostics.recordSchedulerTask(task.id, duration);
                } catch (e) {
                }
                task.lastRun = performance.now();
              };
              if (task.isIdle && typeof window.requestIdleCallback === "function") {
                task.lastRun = performance.now();
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
            const start = performance.now();
            try {
              task.callback();
            } catch (e) {
              APMLogger.error("Scheduler", `Error in immediate task '${task.id}':`, e);
            }
            const duration = performance.now() - start;
            try {
              Diagnostics.recordSchedulerTask(task.id, duration);
            } catch (e) {
            }
            task.lastRun = performance.now();
          }
        }
        /**
         * Return all registered tasks for diagnostics
         */
        getTasks() {
          return this.tasks.map((t) => ({
            id: t.id,
            instance: this.instanceId,
            intervalMs: t.intervalMs,
            isIdle: t.isIdle,
            lastRunMs: t.lastRun
          }));
        }
      };
      APMScheduler = new TaskScheduler();
    }
  });

  // src/core/feature-flags.js
  var FeatureFlags;
  var init_feature_flags = __esm({
    "src/core/feature-flags.js"() {
      init_state();
      init_logger();
      FeatureFlags = {
        _registry: /* @__PURE__ */ new Map(),
        /**
         * Checks if a feature flag is enabled.
         * @param {string} flag 
         * @returns {boolean}
         */
        isEnabled(flag) {
          const config = this._registry.get(flag);
          const defaultValue = config ? config.default : true;
          if (!apmGeneralSettings.flags) {
            return defaultValue;
          }
          const value = apmGeneralSettings.flags[flag];
          return value !== void 0 ? value : defaultValue;
        },
        /**
         * Registers a feature flag with a default value and descriptive metadata.
         * @param {string} flag 
         * @param {Object} config - { default: boolean, label: string, description: string }
         */
        register(flag, config) {
          this._registry.set(flag, {
            default: true,
            label: flag,
            description: "",
            ...config
          });
          if (!apmGeneralSettings.flags) apmGeneralSettings.flags = {};
          if (apmGeneralSettings.flags[flag] === void 0) {
            apmGeneralSettings.flags[flag] = this._registry.get(flag).default;
          }
        },
        /**
         * Returns all registered flags and their current values.
         * @returns {Array<{id: string, value: boolean, label: string, description: string}>}
         */
        getAll() {
          return Array.from(this._registry.entries()).map(([id, config]) => ({
            id,
            value: this.isEnabled(id),
            label: config.label,
            description: config.description
          }));
        },
        /**
         * Toggles a feature flag and persists the change.
         * @param {string} flag 
         * @param {boolean} value 
         */
        set(flag, value) {
          if (!apmGeneralSettings.flags) apmGeneralSettings.flags = {};
          apmGeneralSettings.flags[flag] = value;
          setGeneralSetting("flags", apmGeneralSettings.flags);
          APMLogger.info("FeatureFlags", `Flag '${flag}' set to ${value}`);
        }
      };
    }
  });

  // src/core/network.js
  async function apmFetch(url2, options = {}) {
    let isCrossOrigin = false;
    try {
      const parsed = new URL(url2, window.location.href);
      isCrossOrigin = parsed.hostname !== window.location.hostname;
    } catch (e) {
      isCrossOrigin = true;
      APMLogger.debug("Network", "URL parse failed, defaulting to cross-origin:", e.message);
    }
    let safeUrl;
    try {
      const parsed = new URL(url2, window.location.href);
      safeUrl = parsed.origin + parsed.pathname;
    } catch {
      safeUrl = "[unparseable URL]";
    }
    if (isCrossOrigin && typeof GM_xmlhttpRequest !== "undefined") {
      APMLogger.debug("Network", `Using GM_xmlhttpRequest for cross-origin request: ${safeUrl}`);
      const withCredentials = options.credentials === "include" || options.credentials === "same-origin";
      return new Promise((resolve, reject) => {
        GM_xmlhttpRequest({
          method: options.method || "GET",
          url: url2,
          headers: options.headers || {},
          data: options.body,
          anonymous: !withCredentials,
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
            APMLogger.error("Network", `GM_xmlhttpRequest error for ${url2}:`, err);
            reject(new Error(`GM_xmlhttpRequest failed: ${err.statusText || "Unknown error"}`));
          },
          ontimeout: () => {
            APMLogger.error("Network", `GM_xmlhttpRequest timeout for ${url2}`);
            reject(new Error("GM_xmlhttpRequest timeout"));
          }
        });
      });
    }
    APMLogger.debug("Network", `Using native fetch for request: ${safeUrl}`);
    return fetch(url2, options);
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

  // src/core/ajax-hooks.js
  var handlers, AjaxHooks;
  var init_ajax_hooks = __esm({
    "src/core/ajax-hooks.js"() {
      init_logger();
      init_context();
      init_utils();
      handlers = {
        beforerequest: /* @__PURE__ */ new Map(),
        requestcomplete: /* @__PURE__ */ new Map(),
        requestexception: /* @__PURE__ */ new Map()
      };
      AjaxHooks = {
        /**
         * Register a callback for 'beforerequest'
         * @param {string} id Unique identifier for the hook
         * @param {function} fn (conn, options)
         */
        onBeforeRequest(id, fn) {
          handlers.beforerequest.set(id, fn);
        },
        /**
         * Register a callback for 'requestcomplete'
         * @param {string} id Unique identifier for the hook
         * @param {function} fn (conn, response, options)
         */
        onRequestComplete(id, fn) {
          handlers.requestcomplete.set(id, fn);
        },
        /**
         * Register a callback for 'requestexception'
         * @param {string} id Unique identifier for the hook
         * @param {function} fn (conn, response, options)
         */
        onRequestException(id, fn) {
          handlers.requestexception.set(id, fn);
        },
        /**
         * Install global listeners on a window's Ext.Ajax singleton.
         * Uses both Ext.Ajax.on() events AND a monkey-patch on Ext.Ajax.request()
         * to ensure we catch requests from grid store proxies that may bypass
         * the Ext.Ajax event system.
         * @param {Window} win
         */
        install(win) {
          if (!isWindowAccessible(win) || !win.Ext || !win.Ext.Ajax || win[FLAGS.AJAX_HOOK]) return;
          APMLogger.debug("AjaxHooks", "Installing global interceptors on window:", win.location?.pathname);
          win.Ext.Ajax.on({
            beforerequest: (conn, options) => {
              if (options._apmHooked) return;
              options._apmHooked = true;
              options._apmCompleted = false;
              options._apmExcepted = false;
              handlers.beforerequest.forEach((fn, id) => {
                try {
                  fn(win, conn, options);
                } catch (e) {
                  APMLogger.error("AjaxHooks", `Error in beforerequest hook [${id}]:`, e);
                }
              });
            },
            requestcomplete: (conn, response, options) => {
              if (options._apmCompleted) return;
              options._apmCompleted = true;
              handlers.requestcomplete.forEach((fn, id) => {
                try {
                  fn(win, conn, response, options);
                } catch (e) {
                  APMLogger.error("AjaxHooks", `Error in requestcomplete hook [${id}]:`, e);
                }
              });
            },
            requestexception: (conn, response, options) => {
              if (options._apmExcepted) return;
              options._apmExcepted = true;
              handlers.requestexception.forEach((fn, id) => {
                try {
                  fn(win, conn, response, options);
                } catch (e) {
                  APMLogger.error("AjaxHooks", `Error in requestexception hook [${id}]:`, e);
                }
              });
            }
          });
          const origRequest = win.Ext.Ajax.request.bind(win.Ext.Ajax);
          win.Ext.Ajax.request = function(options) {
            if (!options._apmHooked) {
              options._apmHooked = true;
              handlers.beforerequest.forEach((fn, id) => {
                try {
                  fn(win, win.Ext.Ajax, options);
                } catch (e) {
                  APMLogger.error("AjaxHooks", `Error in request-patch hook [${id}]:`, e);
                }
              });
            }
            return origRequest(options);
          };
          win[FLAGS.AJAX_HOOK] = true;
        }
      };
    }
  });

  // src/core/eam-query.js
  function extractJson(text) {
    if (!text) throw new Error("Empty response");
    if (text.trim().toLowerCase().startsWith("<!doctype") || text.includes("<html")) {
      APMLogger.error("EAMQuery", `HTML detected instead of JSON. Head: ${text.substring(0, 40).replace(/\n/g, " ")}`);
      throw new Error("SESSION_EXPIRED");
    }
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start === -1 || end === -1 || end < start) {
      APMLogger.error("EAMQuery", `No JSON boundaries found. Text length: ${text.length}`);
      throw new Error("MALFORMED_RESPONSE");
    }
    const jsonStr = text.substring(start, end + 1);
    try {
      return JSON.parse(jsonStr);
    } catch (e) {
      APMLogger.error("EAMQuery", `JSON Parse failed: ${e.message}. Snippet: ${jsonStr.substring(0, 100)}`);
      throw e;
    }
  }
  function buildMaddonFilters(filters) {
    if (!filters) return {};
    const maddonParams = {};
    let seq = 1;
    for (const [alias, val] of Object.entries(filters)) {
      if (val === void 0 || val === null || val === "") continue;
      const keywords = String(val).split(",").map((s) => s.trim()).filter((s) => s);
      if (keywords.length === 0) continue;
      const allRules = keywords.map((kw) => {
        let operator = "CONTAINS";
        let value = kw;
        let type = "include";
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
        return { operator, value, type };
      });
      const includes = allRules.filter((r) => r.type === "include");
      const excludes = allRules.filter((r) => r.type === "exclude");
      includes.forEach((rule, idx) => {
        maddonParams[`MADDON_FILTER_ALIAS_NAME_${seq}`] = alias;
        maddonParams[`MADDON_FILTER_OPERATOR_${seq}`] = rule.operator;
        maddonParams[`MADDON_FILTER_VALUE_${seq}`] = rule.value;
        maddonParams[`MADDON_FILTER_SEQNUM_${seq}`] = seq.toString();
        maddonParams[`MADDON_FILTER_JOINER_${seq}`] = idx === includes.length - 1 ? "AND" : "OR";
        if (includes.length > 1) {
          maddonParams[`MADDON_LPAREN_${seq}`] = idx === 0 ? "true" : "false";
          maddonParams[`MADDON_RPAREN_${seq}`] = idx === includes.length - 1 ? "true" : "false";
        } else {
          maddonParams[`MADDON_LPAREN_${seq}`] = "false";
          maddonParams[`MADDON_RPAREN_${seq}`] = "false";
        }
        seq++;
      });
      excludes.forEach((rule) => {
        maddonParams[`MADDON_FILTER_ALIAS_NAME_${seq}`] = alias;
        maddonParams[`MADDON_FILTER_OPERATOR_${seq}`] = rule.operator;
        maddonParams[`MADDON_FILTER_VALUE_${seq}`] = rule.value;
        maddonParams[`MADDON_FILTER_SEQNUM_${seq}`] = seq.toString();
        maddonParams[`MADDON_FILTER_JOINER_${seq}`] = "AND";
        maddonParams[`MADDON_LPAREN_${seq}`] = "false";
        maddonParams[`MADDON_RPAREN_${seq}`] = "false";
        seq++;
      });
    }
    return maddonParams;
  }
  async function eamQuery({
    baseUrl = "https://us1.eam.hxgnsmartcloud.com/web/base/",
    endpoint = "",
    // e.g. 'WSBOOK.HDR.xmlhttp'
    gridId,
    gridName,
    dataspyId,
    userFunction,
    systemFunction,
    currentTab = "HDR",
    filters = {},
    // { alias: value }
    extraParams = {},
    // { rawParam: value }
    maxRows = 5e3,
    pageSize = 100,
    includePagination = true
  }) {
    const queryStart = performance.now();
    const session = AppState.session;
    if (!session.eamid) throw new Error("Missing EAM Session ID");
    const currentTenant = session.tenant || DEFAULT_TENANT;
    const url2 = baseUrl + (endpoint || gridName + ".xmlhttp");
    const payloadObj = {
      GRID_ID: gridId,
      GRID_NAME: gridName,
      DATASPY_ID: dataspyId,
      USER_FUNCTION_NAME: userFunction,
      SYSTEM_FUNCTION_NAME: systemFunction,
      CURRENT_TAB_NAME: currentTab,
      COMPONENT_INFO_TYPE: "DATA_ONLY",
      eamid: session.eamid,
      tenant: currentTenant,
      ...includePagination ? {
        MAX_ROWS: maxRows.toString(),
        NUMBER_OF_ROWS_FIRST_RETURNED: pageSize.toString(),
        LIST_ALL_ROWS: "YES",
        FORCE_REQUERY: "YES"
      } : {},
      ...extraParams,
      ...buildMaddonFilters(filters)
    };
    const cleanPayload = {};
    for (const [k, v] of Object.entries(payloadObj)) {
      if (v !== void 0 && v !== null) cleanPayload[k] = v;
    }
    const payload = new URLSearchParams(cleanPayload);
    try {
      const firstResp = await apmFetch(url2, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8", "X-Requested-With": "XMLHttpRequest" },
        body: payload.toString(),
        credentials: "include"
      });
      const firstText = await firstResp.text();
      const dataObj = extractJson(firstText);
      let allRecords = dataObj?.pageData?.grid?.GRIDRESULT?.GRID?.DATA || [];
      let metadata = dataObj?.pageData?.grid?.GRIDRESULT?.GRID?.METADATA || {};
      const pos0 = parseInt(metadata.CURRENTCURSORPOSITION, 10);
      let nextCursor = (isNaN(pos0) ? allRecords.length : pos0) + 5;
      const MAX_PAGES = Math.ceil(maxRows / pageSize) + 5;
      let pageCount = 0;
      const seenCursors = /* @__PURE__ */ new Set();
      while (metadata.MORERECORDPRESENT === "+" && allRecords.length < maxRows) {
        if (++pageCount > MAX_PAGES) {
          APMLogger.warn("eamQuery", `Hit MAX_PAGES (${MAX_PAGES}), stopping pagination.`);
          break;
        }
        if (seenCursors.has(nextCursor)) {
          APMLogger.warn("eamQuery", `Duplicate cursor ${nextCursor}, stopping pagination.`);
          break;
        }
        seenCursors.add(nextCursor);
        const cacheUrl = baseUrl + "GETCACHE";
        const cachePayload = new URLSearchParams({
          COMPONENT_INFO_TYPE: "DATA_ONLY",
          COMPONENT_INFO_TYPE_MODE: "CACHE",
          GRID_ID: gridId,
          GRID_NAME: gridName,
          DATASPY_ID: dataspyId,
          NUMBER_OF_ROWS_FIRST_RETURNED: pageSize.toString(),
          CURSOR_POSITION: nextCursor.toString(),
          SYSTEM_FUNCTION_NAME: systemFunction,
          USER_FUNCTION_NAME: userFunction,
          eamid: session.eamid,
          tenant: currentTenant,
          ...extraParams
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
        const pos = parseInt(metadata.CURRENTCURSORPOSITION, 10);
        nextCursor = (isNaN(pos) ? allRecords.length : pos) + 1;
        await new Promise((r) => setTimeout(r, 0));
      }
      const totalDuration = performance.now() - queryStart;
      Diagnostics.recordPerformance("eamQuery", parseFloat(totalDuration.toFixed(2)));
      return { records: allRecords, metadata };
    } catch (err) {
      APMLogger.error("EAMQuery", "Query Execution failure:", err);
      throw err;
    }
  }
  var init_eam_query = __esm({
    "src/core/eam-query.js"() {
      init_state();
      init_network();
      init_logger();
      init_constants();
      init_diagnostics();
    }
  });

  // src/modules/labor/labor-service.js
  var cleanEmployeeId, LaborService;
  var init_labor_service = __esm({
    "src/modules/labor/labor-service.js"() {
      init_state();
      init_utils();
      init_logger();
      init_eam_query();
      cleanEmployeeId = (id) => (id && id.includes("@") ? id.split("@")[0] : id || "").toUpperCase();
      LaborService = /* @__PURE__ */ (function() {
        let laborCache = {
          data: [],
          lastFetch: 0,
          employee: ""
        };
        async function fetchData(targetEmployee, force = false) {
          const now = Date.now();
          if (!force && laborCache.employee === targetEmployee && now - laborCache.lastFetch < 15e3 && laborCache.data.length > 0) {
            return laborCache.data;
          }
          if (!targetEmployee) {
            APMLogger.warn("LaborService", "Missing employee for fetch");
            return [];
          }
          try {
            const { records } = await eamQuery({
              endpoint: "WSBOOK.HDR.xmlhttp",
              gridId: "1742",
              gridName: "WSBOOK_HDR",
              dataspyId: "100696",
              userFunction: "WSBOOK",
              systemFunction: "WSBOOK",
              extraParams: { employee: targetEmployee }
            });
            laborCache.data = records;
            laborCache.employee = targetEmployee;
            laborCache.lastFetch = Date.now();
            return records;
          } catch (err) {
            APMLogger.error("LaborService", "Fetch error:", err);
            throw err;
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
            const diffDays = Math.floor((now - rDate) / (1e3 * 3600 * 24));
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
      init_ajax_hooks();
      init_feature_flags();
      init_dom_helpers();
      LaborBooker = (function() {
        let _laborWin = null;
        const getLaborWin = () => _laborWin || (_laborWin = apmGetGlobalWindow());
        let isRunning2 = false;
        let laborObservers = /* @__PURE__ */ new Map();
        let hoursPresets = ["0.1", "0.25", "0.5", "0.75", "1", "1.5", "2", "2.5", "3"];
        const RATE_DATE_DEFAULT = "0.|01/01/2020|01/01/2035";
        AjaxHooks.onBeforeRequest("labor-save", (win, conn, options) => {
          try {
            if (!FeatureFlags.isEnabled("laborBooker")) return;
            const url2 = options.url || "";
            const params = options.params || {};
            const isSave = url2.includes("pageaction=SAVE") && (url2.includes("WSJOBS.BOO") || params.GRID_NAME === "WSJOBS_BOO");
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
              ensureParam("ratedate", RATE_DATE_DEFAULT);
              ensureParam("isdetailfieldchanged", "true");
            }
          } catch (e) {
            APMLogger.error("LaborBooker", "labor-save hook error:", e);
          }
        });
        function detectActivityCode(fAct) {
          if (!fAct) return "10";
          const current = fAct.getValue();
          if (current !== null && current !== void 0 && current !== "") return String(current);
          return "10";
        }
        function checkTabAndInject(win) {
          if (!FeatureFlags.isEnabled("laborBooker")) return;
          if (!isWindowAccessible(win) || !win.Ext || !win.Ext.ComponentQuery) return;
          try {
            const tabs = win.Ext.ComponentQuery.query("uxtabcontainer[itemId=BOO]:not([destroyed=true])");
            const booTab = tabs.find((t) => t.rendered && !t.isDestroyed && t.isVisible(true));
            if (!booTab) {
              const existingCmp2 = win.Ext.getCmp("apm-quick-book-cmp");
              if (existingCmp2 && !existingCmp2.isDestroyed) existingCmp2.destroy();
              const btn = win.document.getElementById("apm-quick-book-btn");
              if (btn) btn.remove();
              return;
            }
            const existingCmp = win.Ext.getCmp("apm-quick-book-cmp");
            if (existingCmp && existingCmp.getEl?.()?.dom && win.document.body.contains(existingCmp.getEl().dom)) return;
            if (existingCmp && !existingCmp.isDestroyed) existingCmp.destroy();
            let toolbar = null;
            let insertIdx = -1;
            const actionsBtns = win.Ext.ComponentQuery.query("button:not([destroyed=true])", booTab);
            const actionsBtn = actionsBtns.find(
              (b) => b.rendered && !b.isDestroyed && b.isVisible?.() && /^Actions$/i.test(b.getText?.() || b.text || "")
            );
            if (actionsBtn) {
              toolbar = actionsBtn.up("toolbar");
              if (toolbar && toolbar.rendered && !toolbar.isDestroyed) {
                let directChild = actionsBtn;
                while (directChild.ownerCt && directChild.ownerCt !== toolbar) {
                  directChild = directChild.ownerCt;
                }
                insertIdx = toolbar.items.indexOf(directChild) + 1;
                APMLogger.debug("LaborBooker", `Strategy 1: Found Actions button in toolbar ${toolbar.id}`);
              } else {
                toolbar = null;
              }
            }
            if (!toolbar) {
              const ldv = booTab.down("listdetailview");
              if (ldv) {
                toolbar = ldv.down("toolbar");
                if (toolbar && toolbar.rendered && !toolbar.isDestroyed) {
                  insertIdx = toolbar.items.getCount();
                  APMLogger.debug("LaborBooker", `Strategy 2: Found listdetailview toolbar ${toolbar.id}`);
                } else {
                  toolbar = null;
                }
              }
            }
            if (!toolbar) {
              const toolbars = win.Ext.ComponentQuery.query("toolbar:not([destroyed=true])", booTab);
              for (const tb of toolbars) {
                if (!tb.rendered || tb.isDestroyed || !tb.isVisible?.()) continue;
                const hasCombo = tb.items.items.some((it) => it.xtype === "combobox" || it.xtype === "combo");
                if (hasCombo) continue;
                if (tb.items.getCount() > 1) {
                  toolbar = tb;
                  insertIdx = tb.items.getCount();
                  APMLogger.debug("LaborBooker", `Strategy 3: Fallback toolbar ${tb.id}`);
                  break;
                }
              }
            }
            if (!toolbar) return;
            toolbar.insert(insertIdx, {
              xtype: "component",
              id: "apm-quick-book-cmp",
              margin: "0 0 0 8",
              html: '<button id="apm-quick-book-btn" class="apm-lb-trigger" style="height:24px;">Quick Book</button>',
              listeners: {
                afterrender: function(cmp) {
                  const btn = cmp.getEl()?.dom?.querySelector("#apm-quick-book-btn");
                  if (btn) {
                    btn.addEventListener("click", (e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      UIManager.toggle("apm-labor-popup", () => {
                        APMLogger.debug("LaborBooker", "Quick Book button atomic toggle -> opening");
                        showQuickBookPopup(win, btn);
                      });
                    });
                  }
                }
              }
            });
            APMLogger.debug("LaborBooker", `Quick Book injected into BOO toolbar at index ${insertIdx}`);
          } catch (e) {
            APMLogger.debug("LaborBooker", "checkTabAndInject error:", e);
          }
        }
        async function showQuickBookPopup(win, anchorBtn) {
          let popup = win.document.getElementById("apm-labor-popup");
          if (!popup) {
            popup = win.document.createElement("div");
            popup.id = "apm-labor-popup";
            popup.className = "apm-ui-panel apm-lb-popup";
            const formSide = win.document.createElement("div");
            formSide.className = "apm-lb-form";
            const header = win.document.createElement("div");
            header.className = "apm-lb-header";
            header.innerHTML = `<h3 class="apm-lb-title">Quick Book Labor</h3>`;
            const closeBtn = win.document.createElement("button");
            closeBtn.id = "apm-lb-close-x";
            closeBtn.innerHTML = "\u2716";
            closeBtn.className = "apm-lb-close";
            closeBtn.onclick = () => UIManager.closeAll(true);
            header.appendChild(closeBtn);
            formSide.appendChild(header);
            const dateRow = win.document.createElement("div");
            dateRow.className = "apm-lb-date-row";
            dateRow.innerHTML = `<label class="apm-lb-date-label">Date:</label>`;
            const dateInput2 = win.document.createElement("input");
            dateInput2.id = "apm-lb-date";
            dateInput2.type = "date";
            dateInput2.className = "apm-lb-date-input";
            dateRow.appendChild(dateInput2);
            dateRow.onclick = () => {
              if (dateInput2.showPicker) dateInput2.showPicker();
              else dateInput2.focus();
            };
            formSide.appendChild(dateRow);
            const hint = win.document.createElement("div");
            hint.className = "apm-lb-hint";
            hint.textContent = "Double-click a preset to book instantly";
            formSide.appendChild(hint);
            const presetBox = win.document.createElement("div");
            presetBox.className = "apm-lb-presets";
            hoursPresets.forEach((h) => {
              const b = win.document.createElement("button");
              b.innerHTML = h;
              b.className = "apm-lb-preset";
              b.onclick = () => {
                const input = win.document.getElementById("apm-lb-hours");
                const isCorr = win.document.getElementById("apm-lb-correction").checked;
                input.value = isCorr ? `-${h}` : h;
                presetBox.querySelectorAll(".apm-lb-preset").forEach((p) => p.classList.remove("active"));
                b.classList.add("active");
              };
              b.ondblclick = () => {
                const input = win.document.getElementById("apm-lb-hours");
                const isCorr = win.document.getElementById("apm-lb-correction").checked;
                const val = isCorr ? `-${h}` : h;
                input.value = val;
                presetBox.querySelectorAll(".apm-lb-preset").forEach((p) => p.classList.remove("active"));
                b.classList.add("active");
                const dInput = win.document.getElementById("apm-lb-date").value;
                const type = win.document.querySelector('input[name="lb-type"]').value;
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
            hoursRow.className = "apm-lb-hours-row";
            const hoursInput2 = win.document.createElement("input");
            hoursInput2.id = "apm-lb-hours";
            hoursInput2.type = "text";
            hoursInput2.placeholder = "Hours...";
            hoursInput2.className = "apm-lb-hours-input";
            hoursInput2.addEventListener("input", () => {
              presetBox.querySelectorAll(".apm-lb-preset").forEach((p) => p.classList.remove("active"));
            });
            hoursRow.appendChild(hoursInput2);
            const corrLabel = win.document.createElement("label");
            corrLabel.id = "apm-lb-corr-label";
            corrLabel.className = "apm-lb-correction";
            corrLabel.innerHTML = `
                <input id="apm-lb-correction" type="checkbox">
                <span class="apm-lb-correction-text">Subtract (-)</span>
            `;
            const corrCheck2 = corrLabel.querySelector("input");
            corrCheck2.onchange = (e) => {
              const hVal = hoursInput2.value;
              if (e.target.checked) {
                if (hVal && !hVal.startsWith("-")) hoursInput2.value = "-" + hVal;
                else if (!hVal) hoursInput2.value = "-";
              } else {
                if (hVal.startsWith("-")) hoursInput2.value = hVal.replace("-", "");
              }
              presetBox.classList.toggle("correction-mode", e.target.checked);
            };
            hoursRow.appendChild(corrLabel);
            formSide.appendChild(hoursRow);
            const typeRow = win.document.createElement("div");
            typeRow.className = "apm-lb-type-row";
            const normalBtn = win.document.createElement("button");
            normalBtn.className = "apm-lb-type-btn active";
            normalBtn.textContent = "Normal";
            const overtimeBtn = win.document.createElement("button");
            overtimeBtn.className = "apm-lb-type-btn";
            overtimeBtn.textContent = "Overtime";
            const typeHidden = win.document.createElement("input");
            typeHidden.type = "hidden";
            typeHidden.name = "lb-type";
            typeHidden.value = "N";
            normalBtn.onclick = () => {
              normalBtn.classList.add("active");
              overtimeBtn.classList.remove("active");
              typeHidden.value = "N";
            };
            overtimeBtn.onclick = () => {
              overtimeBtn.classList.add("active");
              normalBtn.classList.remove("active");
              typeHidden.value = "O";
            };
            typeRow.append(normalBtn, overtimeBtn, typeHidden);
            formSide.appendChild(typeRow);
            const bookBtn2 = win.document.createElement("button");
            bookBtn2.id = "apm-lb-book-btn";
            bookBtn2.innerHTML = "Book Labor";
            bookBtn2.className = "apm-lb-book-btn";
            formSide.appendChild(bookBtn2);
            popup.appendChild(formSide);
            const sumSide = win.document.createElement("div");
            sumSide.className = "apm-lb-summary";
            sumSide.innerHTML = `
                <h4 class="apm-lb-summary-title">Shift Summary</h4>
                <div id="apm-lb-sum-content" class="apm-lb-summary-content">
                    <div class="apm-lb-summary-loading">Fetching...</div>
                </div>
                <div class="apm-lb-summary-footer">
                    <label class="apm-lb-night-label">
                        <input id="apm-lb-night-toggle" type="checkbox" ${APMStorage.get("apmNightShiftOn") === true ? "checked" : ""}>
                        Night Shift Mode
                    </label>
                </div>
            `;
            popup.appendChild(sumSide);
            win.document.body.appendChild(popup);
            const nightToggle = win.document.getElementById("apm-lb-night-toggle");
            nightToggle.onchange = (e) => {
              APMStorage.set(LABOR_NIGHT_SHIFT_KEY, e.target.checked);
              fetchLaborSummary(win);
            };
          }
          const dateInput = win.document.getElementById("apm-lb-date");
          const hoursInput = win.document.getElementById("apm-lb-hours");
          const corrCheck = win.document.getElementById("apm-lb-correction");
          if (hoursInput) hoursInput.value = "";
          if (corrCheck) corrCheck.checked = false;
          popup.querySelectorAll(".apm-lb-preset").forEach((p) => p.classList.remove("active"));
          popup.querySelector(".apm-lb-presets")?.classList.remove("correction-mode");
          const typeBtns = popup.querySelectorAll(".apm-lb-type-btn");
          if (typeBtns.length === 2) {
            typeBtns[0].classList.add("active");
            typeBtns[1].classList.remove("active");
          }
          const typeHiddenEl = popup.querySelector('input[name="lb-type"]');
          if (typeHiddenEl) typeHiddenEl.value = "N";
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
          if (titleEl) titleEl.textContent = "Quick Book Labor";
          if (bookBtn) {
            bookBtn.textContent = "Book Labor";
            bookBtn.onclick = () => {
              const hRaw = hoursInput.value;
              if (!hRaw || hRaw === "-") return showToast("Enter hours!", "#e74c3c");
              const isCorrection = win.document.getElementById("apm-lb-correction").checked;
              const parsed = parseFloat(hRaw);
              if (isNaN(parsed) || parsed === 0) {
                showToast("Enter valid hours", "var(--apm-danger)");
                return;
              }
              const hours = isCorrection ? `-${Math.abs(parsed)}` : Math.abs(parsed).toString();
              const date = dateInput.value;
              const type = win.document.querySelector('input[name="lb-type"]').value;
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
              const row = el("div", { className: "apm-lb-summary-row" }, [
                el("span", { className: "apm-lb-summary-day" }, d === todayStr ? "Today" : "Yesterday"),
                win.document.createTextNode(" "),
                el("strong", { className: "apm-lb-summary-hours" }, val.toFixed(2) + "h")
              ]);
              content.appendChild(row);
            });
            const totalRow = el("div", { className: "apm-lb-summary-total" }, [
              el("span", {}, "TOTAL"),
              win.document.createTextNode(" "),
              el("span", {}, total.toFixed(2) + "h")
            ]);
            content.appendChild(totalRow);
          } catch (err) {
            content.innerHTML = "";
            if (err.message === "SESSION_EXPIRED") {
              const errDiv = el("div", { className: "apm-lb-summary-error" });
              errDiv.appendChild(win.document.createTextNode("Session Expired!"));
              errDiv.appendChild(win.document.createElement("br"));
              errDiv.appendChild(win.document.createTextNode("Please refresh EAM."));
              content.appendChild(errDiv);
            } else {
              content.appendChild(el("div", { className: "apm-lb-summary-empty" }, "No hours booked yet."));
            }
          }
        }
        async function executeBookingFlow(data, win) {
          if (isRunning2) return;
          isRunning2 = true;
          const _safetyTimer = setTimeout(() => {
            isRunning2 = false;
          }, 3e4);
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
                if (employee) {
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
                const actCode = detectActivityCode(fAct);
                ExtUtils.setFieldValue(form, "booactivity", actCode, true);
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
                      if (fRD) ExtUtils.setFieldValue(form, "ratedate", RATE_DATE_DEFAULT);
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
                  }
                  injectionSuccess = true;
                  break;
                }
              }
              await delay(400);
            }
            if (!injectionSuccess) throw new Error("Fields failed to stick (EAM Cascade/Clear)");
            const preForm = targetExt.ComponentQuery.query("form:not([destroyed=true])", booTab)[0];
            if (preForm && preForm.getForm) {
              const pf = preForm.getForm();
              const rf = pf.findField("traderate");
              if (rf && !rf.getValue()) ExtUtils.setFieldValue(pf, "traderate", "0.00");
              const rd = pf.findField("ratedate");
              if (rd && !rd.getValue()) ExtUtils.setFieldValue(pf, "ratedate", RATE_DATE_DEFAULT);
              if (!pf.findField("isdetailfieldchanged")?.getValue()) ExtUtils.setFieldValue(pf, "isdetailfieldchanged", "true");
            }
            let saveBtn = targetExt.ComponentQuery.query("button[action=saveRec]:not([destroyed=true]), button.uft-id-saverec:not([destroyed=true])", booTab)[0];
            if (!saveBtn) {
              saveBtn = targetExt.ComponentQuery.query("button[action=saveRec]:not([destroyed=true]), button.uft-id-saverec:not([destroyed=true])").find((b) => b.rendered && !(typeof b.isHidden === "function" && b.isHidden()));
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
              await waitForAjax(targetWin);
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
            clearTimeout(_safetyTimer);
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
            APMStorage.set(LABOR_LAST_EMP_KEY, clean);
            return clean;
          }
          return "";
        }
        function extractCompletionDate(win) {
          if (!win.Ext) return null;
          try {
            const hdrTab = win.Ext.ComponentQuery.query("uxtabcontainer[itemId=HDR]")[0];
            if (hdrTab) {
              const formPanel = hdrTab.down("form");
              if (formPanel && formPanel.getRecord) {
                const record = formPanel.getRecord();
                if (record) {
                  const compVal = record.get("datecompleted");
                  if (compVal) {
                    const dateStr = parseCompletionDateValue(compVal);
                    if (dateStr) return dateStr;
                  }
                }
              }
            }
            const allTabs = win.Ext.ComponentQuery.query("uxtabcontainer:not([destroyed=true])");
            for (const tab of allTabs) {
              const form = tab.down("form");
              if (form && form.getRecord) {
                const rec = form.getRecord();
                if (rec && rec.get("datecompleted")) {
                  const dateStr = parseCompletionDateValue(rec.get("datecompleted"));
                  if (dateStr) return dateStr;
                }
              }
            }
          } catch (e) {
            APMLogger.debug("LaborBooker", "Error extracting completion date:", e.message);
          }
          return null;
        }
        function parseCompletionDateValue(compVal) {
          try {
            if (!compVal) return null;
            if (compVal instanceof Date) return getLocalIsoDate(compVal);
            if (typeof compVal === "string") {
              const parts = compVal.split(" ")[0].split("/");
              if (parts.length === 3) {
                return `${parts[2]}-${parts[0].padStart(2, "0")}-${parts[1].padStart(2, "0")}`;
              }
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
          let _mutTimer = null;
          const shouldCheck = () => {
            clearTimeout(_mutTimer);
            _mutTimer = setTimeout(() => checkTabAndInject(win), 250);
          };
          const observer = new MutationObserver((mutations) => {
            for (const m of mutations) {
              if (m.type === "childList") {
                const hasRelevant = Array.from(m.addedNodes).some(
                  (n) => n.nodeType === 1 && (n.tagName === "DIV" || n.tagName === "IFRAME")
                );
                if (hasRelevant) {
                  shouldCheck();
                  break;
                }
              }
            }
          });
          observer.observe(doc.body || doc.documentElement, { childList: true, subtree: true });
          laborObservers.set(doc, observer);
          checkTabAndInject(win);
        }
        return {
          init: function(win) {
            if (!FeatureFlags.isEnabled("laborBooker")) return;
            const targetWin = win || getLaborWin();
            try {
              initLaborObserver(targetWin);
            } catch (e) {
              APMLogger.error("LaborBooker", "initLaborObserver failed:", e);
            }
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
            return executeBookingFlow({ hours, date: getLocalIsoDate(/* @__PURE__ */ new Date()), type: "N" }, win);
          }
        };
      })();
    }
  });

  // src/index.js
  init_context();
  init_logger();
  init_api();
  init_toast();

  // src/core/theme-enforcer.js
  init_logger();
  init_theme_resolver();
  init_context();
  init_utils();

  // src/core/theme-shield.js
  init_constants();
  init_context();
  init_logger();
  function applyTransitionShield(targetWin, targetDoc, isDarkHint, context) {
    const { isTransition, isSSO, isSAML, isIDP, isEAMAuth } = context;
    if (isDarkHint && (isTransition || isSSO || isSAML || isEAMAuth || targetDoc.cookie.includes("apm_transition_active=1"))) {
      try {
        const shieldCSS = targetDoc.getElementById("apm-shield-css") || targetDoc.createElement("style");
        shieldCSS.id = "apm-shield-css";
        shieldCSS.textContent = `
                html, body { background-color: #121212 !important; color-scheme: dark !important; color: #eee !important; transition: none !important; }
                html.apm-shield-active body { visibility: hidden !important; }
                #apm-nuclear-shield, #apm-unload-blackout {
                    position: fixed !important; top: 0 !important; left: 0 !important;
                    width: 100vw !important; height: 100vh !important;
                    background: #121212 !important; z-index: 2147483647 !important;
                    pointer-events: none !important; transition: opacity 0.2s ease !important;
                    visibility: visible !important;
                }
            `;
        (targetDoc.head || targetDoc.documentElement).appendChild(shieldCSS);
        targetDoc.documentElement.classList.add("apm-shield-active");
        if (!targetDoc.querySelector('meta[name="color-scheme"]')) {
          if (typeof GM_addElement !== "undefined") {
            GM_addElement(targetDoc.head || targetDoc.documentElement, "meta", { name: "color-scheme", content: "dark" });
          }
        }
        if (targetWin === targetWin.top && !targetDoc.getElementById("apm-nuclear-shield")) {
          if (typeof GM_addElement !== "undefined") {
            const shield = GM_addElement(targetDoc.documentElement, "div", { id: "apm-nuclear-shield" });
            if (shield) {
              shield.style.cssText = "position:fixed;top:0;left:0;width:100vw;height:100vh;background:#121212;z-index:2147483647;pointer-events:none;";
            }
          }
        }
        if (isIDP) {
          setTimeout(() => {
            const shield = targetDoc.getElementById("apm-nuclear-shield");
            if (shield && !targetDoc.getElementById("apm-sso-rescue")) {
              const rescue = targetDoc.createElement("div");
              rescue.id = "apm-sso-rescue";
              const rescueLink = targetDoc.createElement("a");
              rescueLink.href = `https://us1.eam.hxgnsmartcloud.com/web/base/logindisp?tenant=${DEFAULT_TENANT}`;
              rescueLink.style.cssText = "color:#3498db;text-decoration:underline;font-family:sans-serif;font-size:14px;pointer-events:auto;cursor:pointer;font-weight:bold;";
              rescueLink.textContent = "Stuck? Click here to return to EAM";
              rescue.appendChild(rescueLink);
              rescue.style.cssText = "position:fixed; bottom:20px; left:50%; transform:translateX(-50%); z-index:2147483647; text-align:center; padding:10px; background:rgba(0,0,0,0.7); border-radius:8px;";
              shield.appendChild(rescue);
              if (targetWin === targetWin.top) {
                APMLogger.info("APM Master", "SSO Safety Net deployed.");
              }
            }
          }, 1e4);
        }
      } catch (e) {
        try {
          console.warn("[APM] Transition shield error", e);
        } catch (_) {
        }
      }
    }
    if (!isIDP) {
      setTimeout(() => {
        targetDoc.documentElement.classList.remove("apm-shield-active");
        const shield = targetDoc.getElementById("apm-nuclear-shield");
        if (shield) {
          APMLogger.warn("APM Master", "Nuclear Shield safety timeout triggered.");
          shield.style.opacity = "0";
          setTimeout(() => shield.remove(), 450);
        }
      }, 5e3);
    }
  }
  function applyUnloadBlackout(targetWin, targetDoc, isDarkHint) {
    if (targetWin === targetWin.top && !targetWin[FLAGS.THEME_UNLOAD]) {
      targetWin.addEventListener("beforeunload", () => {
        const isDarkNow = typeof GM_getValue !== "undefined" && GM_getValue("apm_theme_hint") === "dark" || targetDoc.cookie.includes("apm_theme_hint=dark");
        if (isDarkNow) {
          if (targetWin === targetWin.top) {
            const baseDomain = targetWin.location.hostname.split(".").slice(-2).join(".");
            const isWhitelisted = baseDomain.includes("hxgnsmartcloud") || baseDomain.includes("hexagon") || baseDomain.includes("amazon");
            const cookieDomain = isWhitelisted ? `domain=.${baseDomain};` : "";
            targetDoc.cookie = `apm_transition_active=1; path=/; ${cookieDomain} max-age=15; SameSite=Lax`;
          }
          try {
            if (typeof GM_addElement !== "undefined") {
              GM_addElement(targetDoc.documentElement, "div", { id: "apm-unload-blackout" });
            }
          } catch (e) {
          }
        }
      });
      targetWin[FLAGS.THEME_UNLOAD] = true;
    }
  }
  function clearGuards(targetDoc) {
    targetDoc.documentElement.classList.remove("apm-shield-active");
    const guards = ["apm-global-flash-guard", "apm-total-blackout-shield", "apm-nuclear-shield", "apm-unload-blackout", "apm-flash-prevent", "apm-dark-canvas", "apm-shield-css"];
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
    if (targetDoc.cookie.includes("apm_transition_active")) {
      const baseDomain = targetDoc.defaultView?.location?.hostname?.split(".").slice(-2).join(".") || "hxgnsmartcloud.com";
      targetDoc.cookie = `apm_transition_active=0; path=/; domain=.${baseDomain}; max-age=0; SameSite=Lax`;
    }
  }

  // src/core/theme-hooks.js
  init_logger();
  init_utils();
  function cleanupDefaultTheme(targetWin, targetDoc, themeName) {
    for (const id of ["apm-flash-prevent", "apm-dark-canvas", "apm-theme-root-vars"]) {
      const el2 = targetDoc.getElementById(id);
      if (el2) el2.remove();
    }
    const csMeta = targetDoc.querySelector('meta[name="color-scheme"][content="dark"]');
    if (csMeta) csMeta.remove();
    if (targetWin === targetWin.top) {
      try {
        if (typeof GM_setValue !== "undefined") GM_setValue("apm_theme_hint", "default");
        const baseDomain = targetWin.location.hostname.split(".").slice(-2).join(".");
        const cookieDomain = baseDomain.includes("hxgnsmartcloud") || baseDomain.includes("hexagon") || baseDomain.includes("amazon") ? `domain=.${baseDomain};` : "";
        targetDoc.cookie = `apm_theme_hint=default; path=/; ${cookieDomain} max-age=31536000; SameSite=Lax`;
      } catch (e) {
      }
    }
  }
  function applyFlashPrevention(targetDoc, themeName) {
    const isDark = /(?:^|-)dark(?:$|-)/.test(themeName);
    if (!isDark) {
      for (const id of ["apm-flash-prevent", "apm-dark-canvas"]) {
        const el2 = targetDoc.getElementById(id);
        if (el2) {
          el2.remove();
          APMLogger.debug("APM Master", `Removed stale ${id} for light theme`);
        }
      }
      const staleMeta = targetDoc.querySelector('meta[name="color-scheme"][content="dark"]');
      if (staleMeta) staleMeta.remove();
    }
    if (isDark) {
      const flashStyle = targetDoc.getElementById("apm-flash-prevent") || targetDoc.createElement("style");
      flashStyle.id = "apm-flash-prevent";
      flashStyle.textContent = `
            html, body, .x-body, .x-viewport, #processing-request-container { background-color: #222 !important; color: #eee !important; }
            .loading-mask, .x-mask { background-color: rgba(0,0,0,0.5) !important; }
        `;
      (targetDoc.head || targetDoc.documentElement).appendChild(flashStyle);
    }
  }
  function setupJsTraps(targetWin, targetDoc, themeName, state) {
    const manifestPath = "eam/" + themeName + ".json";
    const hookState = {
      pollCount: 0,
      origBeforeLoad: null,
      wrapper: null
    };
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
      if (!hookState.wrapper) {
        hookState.origBeforeLoad = obj.beforeLoad;
        hookState.wrapper = function(tags) {
          targetWin.Ext.manifest = manifestPath;
          if (typeof hookState.origBeforeLoad === "function") {
            try {
              return hookState.origBeforeLoad.apply(this, arguments);
            } catch (err) {
            }
          }
        };
        try {
          Object.defineProperty(obj, "beforeLoad", {
            get: () => hookState.wrapper,
            set: (v) => {
              hookState.origBeforeLoad = v;
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
    return { hookEam, hookExt, hookState };
  }
  function setupCssSentinel(targetDoc, themeName, state) {
    const flipLink = (node) => {
      if (node.tagName === "LINK" && node.rel === "stylesheet" && node.href) {
        const url2 = node.href.toLowerCase();
        const isTheme = url2.includes("/theme-") || url2.includes("/ext-theme-") || url2.includes("neptune") || url2.includes("crisp") || url2.includes("triton");
        if (isTheme && !url2.includes(state.activeTheme)) {
          const newHref = node.href.replace(/(theme-)[^./?#]+/, `$1${state.activeTheme.replace("theme-", "")}`);
          if (newHref !== node.href) {
            APMLogger.debug("APM Master", `CSS Sentinel: Flipping ${node.href} -> ${newHref}`);
            node.href = newHref;
          }
        }
      }
    };
    if (!state.sentinelActive) {
      if (state._sentinel) {
        try {
          state._sentinel.disconnect();
        } catch (e) {
        }
      }
      const docLinks = targetDoc.querySelectorAll('link[rel="stylesheet"]');
      docLinks.forEach(flipLink);
      state._sentinel = new MutationObserver((mutations) => {
        if (!isWindowAccessible(targetDoc.defaultView)) return;
        for (const m of mutations) {
          for (const node of m.addedNodes || []) {
            if (node.nodeType !== 1) continue;
            if (node.tagName !== "LINK") continue;
            flipLink(node);
          }
        }
      });
      state._sentinel.observe(targetDoc.documentElement, { childList: true, subtree: true });
      state.sentinelActive = true;
    }
  }
  function setupPersistencePolling(targetWin, targetDoc, themeName, state, hookEam, hookExt, hookState) {
    const poll = () => {
      if (!isWindowAccessible(targetWin)) return;
      hookState.pollCount++;
      if (state.hooksApplied) return;
      try {
        if (targetWin.Ext) hookExt(targetWin.Ext);
        if (targetWin.EAM) hookEam(targetWin.EAM);
        if (targetWin.Ext?.__apmManifestHooked && targetWin.EAM) {
          state.hooksApplied = true;
          return;
        }
      } catch (e) {
      }
      if (hookState.pollCount < 200) {
        state._pollTimeout = setTimeout(poll, 50);
      } else {
        let slowPollCount = 0;
        state._pollInterval = setInterval(() => {
          if (state.hooksApplied) {
            clearInterval(state._pollInterval);
            state._pollInterval = null;
            return;
          }
          if (!isWindowAccessible(targetWin)) {
            clearInterval(state._pollInterval);
            state._pollInterval = null;
            return;
          }
          try {
            if (targetWin.Ext) hookExt(targetWin.Ext);
            if (targetWin.EAM) hookEam(targetWin.EAM);
          } catch (e) {
          }
          if (++slowPollCount >= 60) {
            clearInterval(state._pollInterval);
            state._pollInterval = null;
            APMLogger.warn("APM Master", "Theme persistence polling timed out after 5 minutes");
          }
        }, 5e3);
      }
    };
    poll();
  }
  function broadcastToFrames(targetWin, themeName, state) {
    const broadcast = () => {
      for (let i = 0; i < targetWin.frames.length; i++) {
        try {
          safePostMessage(targetWin.frames[i], { type: "APM_SET_THEME", value: themeName });
        } catch (err) {
        }
      }
    };
    broadcast();
    if (targetWin === targetWin.top) {
      if (state._broadcastInterval) {
        clearInterval(state._broadcastInterval);
        state._broadcastInterval = null;
      }
      let count = 0;
      state._broadcastInterval = setInterval(() => {
        broadcast();
        if (++count > 5) {
          clearInterval(state._broadcastInterval);
          state._broadcastInterval = null;
        }
      }, 1e3);
    }
  }
  function updateCssVarsAndCookie(targetWin, targetDoc, themeName) {
    const isDark = /(?:^|-)dark(?:$|-)/.test(themeName);
    const style = targetDoc.getElementById("apm-theme-root-vars") || targetDoc.createElement("style");
    if (!style.id) {
      style.id = "apm-theme-root-vars";
      (targetDoc.head || targetDoc.documentElement).appendChild(style);
    }
    const safeThemeName = themeName.replace(/[^a-z0-9\-]/g, "");
    style.textContent = `:root { --apm-active-theme: "${safeThemeName}"; }`;
    if (targetWin === targetWin.top) {
      try {
        const baseDomain = targetWin.location.hostname.split(".").slice(-2).join(".");
        const cookieDomain = baseDomain.includes("hxgnsmartcloud") || baseDomain.includes("hexagon") || baseDomain.includes("amazon") ? `domain=.${baseDomain};` : "";
        if (typeof GM_setValue !== "undefined") GM_setValue("apm_theme_hint", isDark ? "dark" : "default");
        if (isDark) {
          targetDoc.cookie = `apm_theme_hint=dark; path=/; ${cookieDomain} max-age=31536000; SameSite=Lax`;
        } else {
          targetDoc.cookie = `apm_theme_hint=default; path=/; ${cookieDomain} max-age=31536000; SameSite=Lax`;
        }
      } catch (e) {
      }
    }
  }
  function applyThemeHooks(targetWin, targetDoc, themeName, state) {
    if (!isWindowAccessible(targetWin)) return;
    if (state._pollTimeout) {
      clearTimeout(state._pollTimeout);
      state._pollTimeout = null;
    }
    if (state._pollInterval) {
      clearInterval(state._pollInterval);
      state._pollInterval = null;
    }
    targetDoc.documentElement.dataset.apmTheme = themeName || "default";
    if (!themeName || themeName === "default") {
      state.activeTheme = themeName || "default";
      cleanupDefaultTheme(targetWin, targetDoc, themeName);
      if (state._sentinel) {
        try {
          state._sentinel.disconnect();
        } catch (e) {
        }
        state._sentinel = null;
        state.sentinelActive = false;
      }
      if (state._broadcastInterval) {
        clearInterval(state._broadcastInterval);
        state._broadcastInterval = null;
      }
      state.hooksApplied = false;
      return;
    }
    state.activeTheme = themeName;
    applyFlashPrevention(targetDoc, themeName);
    const { hookEam, hookExt, hookState } = setupJsTraps(targetWin, targetDoc, themeName, state);
    setupCssSentinel(targetDoc, themeName, state);
    setupPersistencePolling(targetWin, targetDoc, themeName, state, hookEam, hookExt, hookState);
    broadcastToFrames(targetWin, themeName, state);
    updateCssVarsAndCookie(targetWin, targetDoc, themeName);
    if (targetWin === targetWin.top) {
      APMLogger.info("APM Master", `Theme Applied: ${themeName}`);
    }
  }

  // src/core/theme-broadcast.js
  init_constants();
  init_origin_guard();
  init_context();
  init_theme_resolver();
  init_utils();
  function initThemeListeners(targetWin, targetDoc, state, applyEnforcer) {
    if (!targetWin[FLAGS.THEME_MSG]) {
      targetWin.addEventListener("message", (e) => {
        const d = e.data;
        if (!isTrustedOrigin(e.origin)) return;
        if (d && (d.type === "APM_SET_THEME" || d.apmMaster === "theme")) {
          const newTheme = (d.value || d.theme || "default").toLowerCase();
          if (!/^[a-z0-9\-]+$/.test(newTheme)) return;
          if (newTheme !== state.activeTheme) applyEnforcer(newTheme);
        } else if (d && d.type === "APM_GET_THEME") {
          const cur = state.activeTheme || "default";
          if (cur !== "default") {
            try {
              if (e.source) safePostMessage(e.source, { type: "APM_SET_THEME", value: cur });
            } catch (err) {
            }
          }
        }
      });
      targetWin[FLAGS.THEME_MSG] = true;
    }
    if (isWindowAccessible(targetWin)) {
      try {
        if (!targetWin[FLAGS.STORAGE_PATCH]) {
          const _set = targetWin.localStorage.setItem;
          targetWin.localStorage.setItem = function(k, v) {
            const r = _set.apply(this, arguments);
            if (k === "ApmGeneralSettings" || k === APM_GENERAL_STORAGE || k === CC_STORAGE_SET || k === KEY_THEME) {
              const next = ThemeResolver.getPreferredTheme();
              if (next !== "default") {
                applyEnforcer(next);
                if (isWindowAccessible(targetWin)) {
                  for (let i = 0; i < targetWin.frames.length; i++) {
                    try {
                      safePostMessage(targetWin.frames[i], { type: "APM_SET_THEME", value: next });
                    } catch (err) {
                    }
                  }
                }
              } else {
                applyEnforcer("default");
                if (isWindowAccessible(targetWin)) {
                  for (let i = 0; i < targetWin.frames.length; i++) {
                    try {
                      safePostMessage(targetWin.frames[i], { type: "APM_SET_THEME", value: "default" });
                    } catch (err) {
                    }
                  }
                }
              }
            }
            return r;
          };
          targetWin[FLAGS.STORAGE_PATCH] = true;
        }
      } catch (e) {
      }
    }
  }

  // src/core/theme-enforcer.js
  function enforceTheme(targetWin = window, targetDoc = document) {
    try {
      if (!isWindowAccessible(targetWin)) return;
      const isDarkHint = typeof GM_getValue !== "undefined" && GM_getValue("apm_theme_hint") === "dark" || targetDoc.cookie.includes("apm_theme_hint=dark");
      const { isEAM: isEAM2, isPTP: isPTP2, isIDP, isSubmit, isTop, isEAMAuth } = AppContext;
      if (isDarkHint) {
        const darkCanvas = targetDoc.getElementById("apm-dark-canvas") || targetDoc.createElement("style");
        darkCanvas.id = "apm-dark-canvas";
        darkCanvas.textContent = "html { background-color: #121212 !important; color-scheme: dark !important; }";
        (targetDoc.head || targetDoc.documentElement).appendChild(darkCanvas);
      }
      applyTransitionShield(targetWin, targetDoc, isDarkHint, AppContext);
      applyUnloadBlackout(targetWin, targetDoc, isDarkHint);
      if (isIDP || isEAMAuth || isSubmit && !isEAM2) {
        return;
      }
      if (!isEAM2 && !isPTP2) return;
      targetWin.__apmThemeState = targetWin.__apmThemeState || {
        activeTheme: null,
        sentinelActive: false,
        flashGuardApplied: true
      };
      const state = targetWin.__apmThemeState;
      const applyEnforcer = (themeName) => {
        applyThemeHooks(targetWin, targetDoc, themeName, state);
        clearGuards(targetDoc);
      };
      initThemeListeners(targetWin, targetDoc, state, applyEnforcer);
      const startTheme = ThemeResolver.getPreferredTheme();
      if (startTheme !== "default") {
        applyEnforcer(startTheme);
      } else {
        applyEnforcer("default");
        if (targetWin !== targetWin.top) {
          let tries = 0;
          const requestTheme = () => {
            if (state.activeTheme && state.activeTheme !== "default") return;
            try {
              safePostMessage(targetWin.top, { type: "APM_GET_THEME" });
            } catch (e) {
            }
            if (++tries < 15) setTimeout(requestTheme, 1e3);
          };
          requestTheme();
        }
      }
    } catch (e) {
      try {
        APMLogger.error("ThemeEnforcer", "Critical boot error", e);
      } catch (_) {
      }
    }
  }

  // src/core/migration-manager.js
  init_constants();
  init_logger();
  init_utils();
  init_storage();
  init_context();
  var isFunctionallyEmpty = (raw) => {
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
  var MigrationManager = {
    run() {
      if (!isTopFrame()) return;
      if (window[FLAGS.MIGRATION_RAN]) return;
      window[FLAGS.MIGRATION_RAN] = true;
      let completedIds = APMStorage.get(MIGRATIONS_DONE_KEY, []);
      if (!Array.isArray(completedIds)) completedIds = [];
      const migrations2 = [
        { id: "general_v1", fn: () => this.migrateGeneralSettings() },
        { id: "autofill_v1", fn: () => this.migrateAutofillPresets() },
        { id: "colorcode_v1", fn: () => this.migrateColorCode() },
        { id: "forecast_v1", fn: () => this.migrateForecast() },
        { id: "labor_v1", fn: () => this.migrateLabor() },
        { id: "promote_v1", fn: () => this.promoteToGlobal() }
      ];
      if (migrations2.every((m) => completedIds.includes(m.id))) {
        APMLogger.info("Migration", "All migrations previously completed. Skipping.");
        return;
      }
      APMLogger.info("Migration", "Starting data migration check...");
      migrations2.forEach(({ id, fn }) => {
        if (!completedIds.includes(id)) {
          try {
            fn();
            completedIds.push(id);
            APMLogger.info("Migration", `Completed: ${id}`);
          } catch (e) {
            APMLogger.error("Migration", `Error in ${id}:`, e);
          }
        }
      });
      APMStorage.set(MIGRATIONS_DONE_KEY, completedIds);
      APMLogger.info("Migration", "Migration process finished.");
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
      this.safeMigrate("apm_general_settings", APM_GENERAL_STORAGE);
      this.safeMigrate("apm_gen_settings", APM_GENERAL_STORAGE);
      this.safeMigrate("apmUiTheme", KEY_THEME);
    },
    migrateAutofillPresets() {
      const transform = (oldData) => {
        if (oldData && typeof oldData === "object" && !oldData.autofill && !oldData.config) {
          oldData = {
            autofill: oldData,
            config: { columnOrders: {}, tabOrders: {}, hiddenTabs: [] }
          };
        }
        if (oldData && oldData.config) {
          if (oldData.config.columnOrder !== void 0) {
            oldData.config.columnOrders = { GLOBAL: oldData.config.columnOrder };
            delete oldData.config.columnOrder;
          }
          if (oldData.config.tabOrder !== void 0) {
            oldData.config.tabOrders = { GLOBAL: oldData.config.tabOrder };
            delete oldData.config.tabOrder;
          }
          if (!oldData.config.columnOrders) oldData.config.columnOrders = {};
          if (!oldData.config.tabOrders) oldData.config.tabOrders = {};
        }
        return oldData;
      };
      const opts = { force: true, merge: true };
      const legacyKeys = [
        "apm_creator_presets_v1",
        "apm_creator_presets",
        "apm_preset_store",
        "APM_Creator_Presets",
        "ApmCreatorPresets",
        "apm_presets"
      ];
      legacyKeys.forEach((key) => this.safeMigrate(key, PRESET_STORAGE_KEY, transform, opts));
    },
    migrateColorCode() {
      this.safeMigrate("apm_colorcode_rules", CC_STORAGE_RULES);
      this.safeMigrate("apm_colorcode_settings", CC_STORAGE_SET);
      this.safeMigrate("ApmColorCodeRules", CC_STORAGE_RULES);
      this.safeMigrate("ApmColorCodeSettings", CC_STORAGE_SET);
    },
    migrateForecast() {
      const forecastKeys = [
        "eam_forecast_preferences_v12",
        "apm_forecast_prefs",
        "eamForecastPrefs",
        "eam_forecast_prefs"
      ];
      forecastKeys.forEach((key) => {
        this.safeMigrate(key, STORAGE_KEY, (oldData) => {
          if (oldData && typeof oldData === "object") {
            if (oldData.profiles && !oldData.customProfiles) oldData.customProfiles = oldData.profiles;
            if (oldData.dataspys && !oldData.customProfiles) oldData.customProfiles = oldData.dataspys;
          }
          return oldData;
        });
      });
    },
    migrateLabor() {
      this.safeMigrate("apmLaborSavedEmps", LABOR_EMPS_STORAGE);
      this.safeMigrate("apmLaborActiveEmp", LABOR_ACTIVE_STORAGE);
      this.safeMigrate("apmLaborDockPos", LABOR_DOCK_STORAGE);
    },
    /**
     * Reads a value from both GM storage and localStorage for a legacy key.
     * @param {string} legacyKey - The legacy storage key to read
     * @returns {string|null} The raw string value, or null if not found
     */
    readLegacyValue(legacyKey) {
      const legacyLocal = localStorage.getItem(legacyKey);
      let legacyGM = null;
      if (typeof GM_getValue !== "undefined") {
        try {
          const rawGM = GM_getValue(legacyKey);
          if (rawGM) legacyGM = typeof rawGM === "string" ? rawGM : JSON.stringify(rawGM);
        } catch (e) {
        }
      }
      return legacyLocal || legacyGM;
    },
    safeMigrate(legacyKey, v1Key, transform = (d) => d, options = {}) {
      try {
        const { force = false, merge = false } = options;
        const v1Raw = typeof GM_getValue !== "undefined" ? GM_getValue(v1Key) : null;
        let v1Parsed = null;
        try {
          v1Parsed = typeof v1Raw === "string" ? JSON.parse(v1Raw) : v1Raw;
        } catch (e) {
        }
        const v1Exists = v1Parsed && !isFunctionallyEmpty(v1Parsed);
        if (!force && v1Exists) return;
        const legacyRaw = this.readLegacyValue(legacyKey);
        if (!legacyRaw || legacyRaw === "null" || legacyRaw === "{}" || legacyRaw === "[]") return;
        APMLogger.info("Migration", `MIGRATING: ${legacyKey} -> ${v1Key} (Force: ${force}, Merge: ${merge})`);
        let legacyParsed = null;
        try {
          legacyParsed = JSON.parse(legacyRaw);
        } catch (e) {
          return;
        }
        let dataToSave = transform(legacyParsed);
        if (merge && v1Exists) {
          if (typeof dataToSave === "object" && !Array.isArray(dataToSave) && typeof v1Parsed === "object" && !Array.isArray(v1Parsed)) {
            const merged = { ...v1Parsed };
            if (dataToSave.autofill) {
              merged.autofill = { ...dataToSave.autofill, ...v1Parsed.autofill || {} };
            }
            if (dataToSave.config) {
              merged.config = { ...dataToSave.config, ...v1Parsed.config || {} };
            }
            dataToSave = merged;
          }
        }
        APMStorage.set(v1Key, dataToSave);
      } catch (e) {
        APMLogger.error("Migration", `Error migrating ${legacyKey}:`, e);
      }
    }
  };

  // src/index.js
  init_state();

  // src/core/boot-manager.js
  init_logger();
  init_context();
  init_utils();
  init_diagnostics();
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
      const duration = (performance.now() - this.startTime).toFixed(2);
      APMLogger.debug("BootManager", `State marked ready: ${key} (${duration}ms)`);
      try {
        performance.mark(`apm-boot-${key}`);
        Diagnostics.recordTiming(key, parseFloat(duration));
      } catch (e) {
      }
      this.checkReady();
    }
    /**
     * Register a callback to run when all states are ready
     */
    onBoot(callback) {
      if (this.states.ready) {
        try {
          callback();
        } catch (e) {
          APMLogger.error("BootManager", "Late boot callback error:", e);
        }
      } else {
        this.callbacks.push(callback);
      }
    }
    checkReady() {
      if (this.states.dom && this.states.settings && this.states.extjs && !this.states.ready) {
        this.states.ready = true;
        const duration = (performance.now() - this.startTime).toFixed(2);
        APMLogger.info("BootManager", `All dependencies met. Booting now... (${duration}ms)`);
        try {
          performance.measure("apm-boot-total", "apm-boot-dom");
          Diagnostics.recordTiming("total", parseFloat(duration));
        } catch (e) {
        }
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
     * Helper to wait for ExtJS if it's expected but not yet loaded.
     * If the tab is hidden (background tab), defers polling until visible to avoid
     * burning the timeout window against browser timer throttling (~1Hz in bg tabs).
     */
    waitForExt(win = window, maxWait = 5e3) {
      if (AppContext.isLanding) {
        APMLogger.debug("BootManager", "Landing page detected, skipping ExtJS wait.");
        this.markReady("extjs");
        return;
      }
      const startPolling = () => {
        const start = Date.now();
        const check = () => {
          let ext = null;
          try {
            const topWin = window.top;
            ext = win.Ext || (isWindowAccessible(topWin) ? topWin.Ext : null);
          } catch (e) {
            ext = win.Ext;
          }
          if (ext && ext.isReady) {
            this.markReady("extjs");
          } else if (Date.now() - start < maxWait) {
            if (ext && Date.now() - start > 3e3) {
              APMLogger.info("BootManager", "ExtJS detected but isReady stalled > 3s. Proceeding eager.");
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
      };
      if (document.hidden) {
        APMLogger.info("BootManager", "Tab hidden at boot \u2014 deferring ExtJS poll until visible.");
        let pollingStarted = false;
        const onVisible = () => {
          if (!document.hidden && !pollingStarted) {
            pollingStarted = true;
            document.removeEventListener("visibilitychange", onVisible);
            APMLogger.info("BootManager", "Tab became visible. Starting ExtJS poll.");
            startPolling();
          }
        };
        document.addEventListener("visibilitychange", onVisible);
        setTimeout(() => {
          if (document.hidden && !pollingStarted) {
            pollingStarted = true;
            document.removeEventListener("visibilitychange", onVisible);
            APMLogger.warn("BootManager", "Tab still hidden after 30s \u2014 starting ExtJS poll anyway.");
            startPolling();
          }
        }, 3e4);
      } else {
        startPolling();
      }
    }
  };
  var BootManager = new BootManagerClass();

  // src/index.js
  init_ui_manager();
  init_scheduler();
  init_feature_flags();

  // src/core/session.js
  init_state();
  init_logger();
  init_utils();
  init_storage();
  init_constants();
  init_state();
  init_context();
  init_api();
  var SessionMonitor = {
    _liveConfirmed: /* @__PURE__ */ new Set(),
    init() {
      if (typeof window === "undefined") return;
      if (AppContext.isTop) {
        APMLogger.info("APM Session", "Initializing Monitor...");
      }
      this.restore();
      this.hookXHR();
      this.hookFetch();
      if (AppContext.isTop) {
        this.setupGlobalRedirects();
      }
    },
    setupGlobalRedirects() {
      APMApi.register("checkSession", () => this.monitorStatus());
      APMApi.register("forceRedirect", () => this.forceRedirect());
    },
    restore() {
      const stored = APMStorage.get(SESSION_STORAGE_KEY);
      if (stored) {
        try {
          const { eamid, tenant, user } = stored;
          Object.assign(AppState.session, { eamid, tenant, user });
          if (AppContext.isTop) {
            APMLogger.info("APM Session", "Restored from storage:", AppState.session);
          }
        } catch (e) {
          APMLogger.debug("Session", "Failed to restore session:", e);
        }
      }
    },
    save() {
      const { eamid, tenant, user } = AppState.session;
      APMStorage.set(SESSION_STORAGE_KEY, { eamid, tenant, user });
    },
    hookXHR() {
      if (XMLHttpRequest.prototype[FLAGS.SESSION_XHR_HOOK]) return;
      XMLHttpRequest.prototype[FLAGS.SESSION_XHR_HOOK] = true;
      const monitor = this;
      const origOpen = XMLHttpRequest.prototype.open;
      const origSend = XMLHttpRequest.prototype.send;
      XMLHttpRequest.prototype.open = function(method, url2) {
        this._apmUrl = (url2 || "").toString();
        return origOpen.apply(this, arguments);
      };
      XMLHttpRequest.prototype.send = function(body) {
        if (AppState.session.isInitialized) return origSend.apply(this, arguments);
        const url2 = this._apmUrl;
        const payload = body && typeof body === "string" ? body : null;
        this.addEventListener("load", function() {
          if (AppState.session.isInitialized) return;
          if (this.status === 200) {
            monitor.tryCaptureFromTraffic(url2, payload);
            if (this.responseText) {
              monitor.processResponse(url2, this.responseText);
            }
          }
        });
        return origSend.apply(this, arguments);
      };
    },
    hookFetch() {
      if (window[FLAGS.SESSION_FETCH_HOOK]) return;
      window[FLAGS.SESSION_FETCH_HOOK] = true;
      const monitor = this;
      const origFetch = window.fetch;
      window.fetch = async function(...args) {
        const url2 = args[0] instanceof Request ? args[0].url : typeof args[0] === "string" ? args[0] : "";
        const options = (args[0] instanceof Request ? args[0] : args[1]) || {};
        const payload = options.body && typeof options.body === "string" ? options.body : null;
        const response = await origFetch.call(window, ...args);
        if (response.ok) {
          monitor.tryCaptureFromTraffic(url2, payload);
          try {
            if (url2.includes("BSSTRT") || url2.includes("GRIDDATA")) {
              const clone = response.clone();
              const text = await clone.text();
              monitor.processResponse(url2, text);
            }
          } catch (e) {
            APMLogger.debug("Session", "Fetch response parse error:", e);
          }
        }
        return response;
      };
    },
    tryCaptureFromTraffic(url2, payload) {
      if (url2) {
        const eamMatch = url2.match(/[?&]eamid=([^&]+)/);
        const tenantMatch = url2.match(/[?&]tenant=([^&]+)/);
        if (eamMatch) this.updateState("eamid", decodeURIComponent(eamMatch[1]));
        if (tenantMatch) this.updateState("tenant", decodeURIComponent(tenantMatch[1]));
      }
      if (payload) {
        const eamMatch = payload.match(/[?&]eamid=([^&]+)/) || payload.match(/eamid=([^&]+)/);
        const tenantMatch = payload.match(/[?&]tenant=([^&]+)/) || payload.match(/tenant=([^&]+)/);
        if (eamMatch) this.updateState("eamid", decodeURIComponent(eamMatch[1]));
        if (tenantMatch) this.updateState("tenant", decodeURIComponent(tenantMatch[1]));
      }
    },
    processResponse(url2, text) {
      if (!url2 || !text) return;
      if (url2.includes("BSSTRT")) {
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
        APMLogger.info("APM Session", `Captured ${key}: ${key === "eamid" ? "[redacted]" : finalValue}`);
        AppState.session[key] = finalValue;
        this.save();
        if (key === "user") {
          APMStorage.set(LABOR_LAST_EMP_KEY, finalValue);
        }
      }
      this._liveConfirmed.add(key);
      if (!AppState.session.isInitialized && this._liveConfirmed.has("eamid") && this._liveConfirmed.has("tenant") && this._liveConfirmed.has("user")) {
        AppState.session.isInitialized = true;
        AppState.session.isFresh = true;
        window.dispatchEvent(new CustomEvent("APM_SESSION_UPDATED", {
          detail: { ...AppState.session, firstInit: true }
        }));
      }
    },
    monitorStatus() {
      if (!AppContext.isTop) return;
      if (window.__apmRedirecting) return;
      if (!apmGeneralSettings.autoRedirect) return;
      const currentUrl = window.location.href.toLowerCase();
      const { isLanding } = AppContext;
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
            const url2 = win.location.href.toLowerCase();
            const isAuthPage = url2.includes("logindisp") || url2.includes("federate.amazon.com") || url2.includes("midway") || url2.includes("saml") || url2.includes("okta.com") || url2.includes("octave.com");
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
      if (!window.location.hostname.includes("eam.hxgnsmartcloud.com")) return;
      APMLogger.debug("APM Session", "Refreshing session heartbeat...");
      try {
        const url2 = `/web/base/logindisp?tenant=${encodeURIComponent(session.tenant || DEFAULT_TENANT)}`;
        const resp = await fetch(url2, {
          method: "HEAD",
          credentials: "same-origin"
        });
        if (resp.status === 200) {
          APMLogger.debug("APM Session", "Session heartbeat successful.");
        } else if (resp.status === 401 || resp.redirected) {
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

  // src/core/updater.js
  init_constants();
  init_state();
  init_logger();
  init_storage();
  init_api();
  init_context();
  init_network();
  var updateListeners = [];
  function isNewerVersion(oldVer, newVer) {
    if (oldVer === newVer) return false;
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
    if (!updateListeners.includes(callback)) {
      updateListeners.push(callback);
    }
    if (APMApi.get("updateInfo")?.available) callback();
    return () => {
      updateListeners = updateListeners.filter((cb) => cb !== callback);
    };
  }
  function getUpdateUrls() {
    const isBeta = apmGeneralSettings.updateTrack === "beta";
    return {
      check: isBeta ? BETA_VERSION_CHECK_URL : VERSION_CHECK_URL,
      download: isBeta ? BETA_UPDATE_URL : UPDATE_URL
    };
  }
  function checkForGlobalUpdates(force = false, onComplete = null) {
    if (window[FLAGS.UPDATE_CHECKED] && !force) {
      if (typeof onComplete === "function") onComplete(APMApi.get("updateInfo")?.available ?? false);
      return;
    }
    const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    const lastCheck = APMStorage.get(UPDATE_CHECK_KEY);
    if (lastCheck === today && !force) {
      APMLogger.info("APM Master", "Update already checked today. Skipping auto-check.");
      window[FLAGS.UPDATE_CHECKED] = true;
      if (typeof onComplete === "function") onComplete(APMApi.get("updateInfo")?.available ?? false);
      return;
    }
    const { check, download } = getUpdateUrls();
    APMLogger.info("APM Master", `Checking for updates (${apmGeneralSettings.updateTrack})...`, CURRENT_VERSION);
    apmFetch(check).then((response) => response.text()).then((text) => {
      window[FLAGS.UPDATE_CHECKED] = true;
      APMStorage.set(UPDATE_CHECK_KEY, today);
      const match = text.match(/\/\/\s*@version\s+([0-9\.]+)/);
      if (match && match[1]) {
        const remoteVersion = match[1];
        if (isNewerVersion(CURRENT_VERSION, remoteVersion)) {
          APMApi.register("updateInfo", { available: true, version: remoteVersion, url: download });
          APMLogger.info("APM Master", `\u2728 Update available! Current: ${CURRENT_VERSION}, Remote: ${remoteVersion} (${apmGeneralSettings.updateTrack})`);
        } else {
          APMApi.register("updateInfo", { available: false });
          APMLogger.info("APM Master", "Software is up to date.");
        }
        updateListeners.forEach((cb) => cb());
        if (typeof onComplete === "function") onComplete(APMApi.get("updateInfo")?.available ?? false);
      } else {
        if (typeof onComplete === "function") onComplete(false);
      }
    }).catch((e) => {
      APMLogger.warn("APM Master", "Update check failed silently.", e);
      if (typeof onComplete === "function") onComplete(false);
    });
  }

  // src/core/message-router.js
  init_constants();
  init_context();
  init_ui_manager();
  init_storage();
  init_theme_resolver();
  init_api();
  init_logger();
  init_origin_guard();
  init_utils();

  // src/modules/ptp/ptp-timer.js
  init_state();
  init_logger();
  init_feature_flags();
  var countdownStart = null;
  var COUNTDOWN_DURATION = 120;
  var _ptpTimerRunning = false;
  var _ptpDismissed = false;
  var _countdownInterval = null;
  function _getTopDoc() {
    try {
      const uw = typeof unsafeWindow !== "undefined" ? unsafeWindow : window;
      const topWin = uw.top;
      if (topWin.document && topWin.document.body) return topWin.document;
    } catch (e) {
    }
    return document;
  }
  function setupCloseButton(closeBtn, timerUI, onClose) {
    closeBtn.onmouseover = function() {
      this.style.opacity = "1";
    };
    closeBtn.onmouseout = function() {
      this.style.opacity = "0.6";
    };
    closeBtn.onclick = () => {
      timerUI.style.display = "none";
      if (_countdownInterval) {
        clearInterval(_countdownInterval);
        _countdownInterval = null;
      }
      _ptpTimerRunning = false;
      _ptpDismissed = true;
      if (onClose) onClose();
    };
  }
  function initPtpTimerUI() {
    const topDoc = _getTopDoc();
    let timerUI = topDoc.getElementById("apm-ptp-timer");
    if (!timerUI) {
      timerUI = topDoc.createElement("div");
      timerUI.id = "apm-ptp-timer";
      timerUI.style.cssText = `
            position: fixed; top: 85px; right: 30px;
            background: var(--apm-surface-0); color: white; padding: 6px 12px 6px 16px; border-radius: 30px;
            font-family: sans-serif; font-size: 16px; font-weight: bold;
            z-index: 100000; box-shadow: 0 4px 15px rgba(0,0,0,0.3);
            display: flex; align-items: center; gap: 10px; border: 2px solid var(--apm-surface-sunken);
            user-select: none; pointer-events: auto; transition: all 0.2s;
        `;
      topDoc.body.appendChild(timerUI);
    }
    if (!_ptpTimerRunning) {
      timerUI.innerHTML = `
            <div id="apm-ptp-start-btn" style="display:flex; align-items:baseline; gap:8px; cursor:pointer;">
                <span style="font-size:12px; text-transform:uppercase; opacity:0.9; letter-spacing:0.5px; color:var(--apm-warning);">\u25B6 Start PTP Timer</span>
                <span id="apm-ptp-time" style="font-family:monospace; font-size:20px; opacity:0.5;">02:00</span>
            </div>
            <div id="apm-ptp-close" style="cursor:pointer; font-size:14px; opacity:0.6; padding-left:4px; transition:opacity 0.2s;" title="Dismiss Timer">\u2716</div>
        `;
      timerUI.style.background = "var(--apm-surface-0)";
      timerUI.style.borderColor = "var(--apm-surface-sunken)";
      topDoc.getElementById("apm-ptp-start-btn").onclick = startPtpCountdown;
    }
    setupCloseButton(topDoc.getElementById("apm-ptp-close"), timerUI);
    return timerUI;
  }
  function startPtpCountdown() {
    _ptpTimerRunning = true;
    let ptpSeconds = COUNTDOWN_DURATION;
    countdownStart = Date.now();
    const topDoc = _getTopDoc();
    const timerUI = topDoc.getElementById("apm-ptp-timer");
    timerUI.style.background = "var(--apm-danger)";
    timerUI.style.borderColor = "var(--apm-danger)";
    timerUI.innerHTML = `
        <div style="display:flex; align-items:baseline; gap:8px;">
            <span style="font-size:12px; text-transform:uppercase; opacity:0.9; letter-spacing:0.5px;">PTP Timer:</span>
            <span id="apm-ptp-time" style="font-family:monospace; font-size:20px;">02:00</span>
        </div>
        <div id="apm-ptp-close" style="cursor:pointer; font-size:14px; opacity:0.6; padding-left:4px; transition:opacity 0.2s;" title="Dismiss Timer">\u2716</div>
    `;
    setupCloseButton(topDoc.getElementById("apm-ptp-close"), timerUI);
    if (_countdownInterval) clearInterval(_countdownInterval);
    _countdownInterval = setInterval(() => {
      ptpSeconds = COUNTDOWN_DURATION - Math.floor((Date.now() - countdownStart) / 1e3);
      if (ptpSeconds < 0) ptpSeconds = 0;
      const timeEl = topDoc.getElementById("apm-ptp-time");
      if (!timeEl) return;
      if (ptpSeconds <= 0) {
        clearInterval(_countdownInterval);
        _countdownInterval = null;
        timeEl.textContent = "READY";
        timerUI.style.background = "var(--apm-success-bright)";
        timerUI.style.borderColor = "var(--apm-success-bright)";
      } else {
        const mins = Math.floor(ptpSeconds / 60);
        const secs = ptpSeconds % 60;
        timeEl.textContent = `0${mins}:${secs < 10 ? "0" : ""}${secs}`;
      }
    }, 1e3);
  }
  function stopPtpTimer() {
    const topDoc = _getTopDoc();
    const timerUI = topDoc.getElementById("apm-ptp-timer");
    if (timerUI) timerUI.style.display = "none";
    if (_countdownInterval) {
      clearInterval(_countdownInterval);
      _countdownInterval = null;
    }
    _ptpTimerRunning = false;
    _ptpDismissed = true;
  }
  function checkPtpStatus(hasHeartbeat = false) {
    if (!FeatureFlags.isEnabled("ptpTimer")) return;
    const topDoc = _getTopDoc();
    const timerUI = topDoc.getElementById("apm-ptp-timer");
    if (timerUI && !apmGeneralSettings.ptpTimerEnabled) {
      timerUI.style.display = "none";
      if (_countdownInterval) {
        clearInterval(_countdownInterval);
        _countdownInterval = null;
      }
      _ptpTimerRunning = false;
    }
  }

  // src/core/message-router.js
  function _isScreenCacheWrapper() {
    if (window !== window.top) return false;
    for (let i = 0; i < window.frames.length; i++) {
      try {
        if (window.frames[i].location.hostname === window.location.hostname) {
          return true;
        }
      } catch (e) {
      }
    }
    return false;
  }
  function initMessageRouter() {
    const isWrapper = _isScreenCacheWrapper();
    window.addEventListener("message", (e) => {
      const msg = e.data;
      if (!msg) return;
      if (!isTrustedOrigin(e.origin)) return;
      if (isWrapper && msg.type && msg.type.startsWith("APM_PTP_") && !msg._relayed) {
        const relayed = { ...msg, _relayed: true };
        for (let i = 0; i < window.frames.length; i++) {
          try {
            safePostMessage(window.frames[i], relayed);
          } catch (err) {
          }
        }
      }
      if (msg.type === "APM_PTP_HEARTBEAT") {
        window._ptpLastHeartbeat = Date.now();
        if (AppContext.isTop && typeof checkPtpStatus === "function") {
          checkPtpStatus(true);
        }
      }
      if (msg.type === "APM_GET_THEME" || msg.apmMaster === "getTheme") {
        const activeTheme = ThemeResolver.getPreferredTheme();
        if (activeTheme && activeTheme !== "default") {
          try {
            e.source?.postMessage({
              type: "APM_SET_THEME",
              apmMaster: "theme",
              value: activeTheme
            }, e.origin);
          } catch (err) {
          }
        }
      }
      if (msg.type === "APM_PTP_CLICK_AWAY") {
        UIManager.closeAll();
      }
      if (msg.type === "APM_PTP_START") {
        const timerUI = initPtpTimerUI();
        if (timerUI && timerUI.style.display === "none") timerUI.style.display = "flex";
        startPtpCountdown();
        if (msg.wo) updatePtpHistory(msg.wo, "INCOMPLETE");
      }
      if (msg.type === "APM_PTP_CANCELLED") {
        stopPtpTimer();
        if (msg.wo) updatePtpHistory(msg.wo, "CANCELLED");
      }
      if (msg.type === "APM_PTP_COMPLETED" && msg.wo) {
        updatePtpHistory(msg.wo, "COMPLETE");
        stopPtpTimer();
      }
      if (msg.type === "APM_PTP_STOP_TIMER") {
        stopPtpTimer();
      }
      if (msg.type === "APM_SET_FILTER") {
        APMLogger.debug("Router", `Received APM_SET_FILTER: "${msg.kw}" from ${msg.sourceFrame || e.origin || "unknown"}`);
        const topWin = window.top || window;
        const currentFilter = topWin.activeNametagFilter;
        if (currentFilter === msg.kw && msg.kw !== "") {
          APMLogger.debug("Router", "Filter state already matches global. Skipping application.");
          return;
        }
        const applyFilter = APMApi.applyNametagFilter;
        if (typeof applyFilter === "function") {
          applyFilter(msg.kw);
        }
      }
      if (msg.apmMaster === "hotkey" && msg.action) {
        const VALID_ACTIONS = /* @__PURE__ */ new Set(["normal", "today", "quick", "clear"]);
        if (!VALID_ACTIONS.has(msg.action)) return;
        APMLogger.debug("Router", `Received hotkey action: "${msg.action}"`);
        if (AppContext.isTop) {
          const execFn = APMApi.get("executeForecast");
          if (typeof execFn === "function") {
            execFn(msg.action);
          } else {
            APMLogger.warn("Router", "executeForecast not registered on top window");
          }
        }
      }
    });
  }
  function updatePtpHistory(wo, status) {
    let history = APMStorage.get(PTP_HISTORY_KEY) || {};
    if (!history._v) {
      Object.keys(history).forEach((key) => {
        if (typeof history[key] === "number") {
          history[key] = { status: "COMPLETE", time: history[key] };
        }
      });
      history._v = 2;
    }
    history[wo] = { status, time: Date.now() };
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1e3;
    for (const key of Object.keys(history)) {
      if (key === "_v") continue;
      if (history[key].time < thirtyDaysAgo) {
        delete history[key];
      }
    }
    APMStorage.set(PTP_HISTORY_KEY, history);
    const eventDetail = { wo, data: history[wo] };
    window.dispatchEvent(new CustomEvent("APM_PTP_UPDATED_EVENT", { detail: eventDetail }));
    const visited = /* @__PURE__ */ new Set();
    const broadcast = (win) => {
      if (visited.has(win)) return;
      visited.add(win);
      try {
        if (win !== window) {
          if (!isWindowAccessible(win)) return;
          win.dispatchEvent(new CustomEvent("APM_PTP_UPDATED_EVENT", { detail: eventDetail }));
        }
        for (let i = 0; i < win.frames.length; i++) {
          try {
            broadcast(win.frames[i]);
          } catch (e) {
          }
        }
      } catch (e) {
      }
    };
    broadcast(window.top);
  }

  // src/core/frame-manager.js
  init_utils();
  init_logger();
  init_ajax_hooks();

  // src/core/ext-consistency.js
  init_utils();
  init_logger();
  init_state();
  init_constants();

  // src/modules/tab-grid-order/tab-grid-order.js
  init_toast();
  init_logger();
  init_utils();
  init_constants();

  // src/modules/autofill/autofill-prefs.js
  init_state();
  init_constants();
  init_logger();
  init_storage();
  init_utils();
  init_api();
  var _migrationRetried = false;
  function normalizeColumnOrder(raw) {
    if (!raw) return null;
    if (typeof raw === "string") {
      return raw.split(",").map((s) => ({ index: s.trim() })).filter((e) => e.index);
    }
    return raw;
  }
  function normalizeTabOrder(raw) {
    if (!raw) return null;
    if (typeof raw === "string") {
      return raw.split(",").map((s) => s.trim()).filter(Boolean);
    }
    return raw;
  }
  function normalizeHiddenTabs(raw, funcName) {
    if (Array.isArray(raw)) {
      return raw.length > 0 ? { [funcName]: raw } : {};
    }
    return raw || {};
  }
  function loadPresets() {
    try {
      const parsed = APMStorage.get(PRESET_STORAGE_KEY);
      if (parsed) {
        if (parsed._v === void 0) {
          parsed._v = 0;
          APMLogger.debug("AutoFill", "Presets loaded as legacy v0");
        }
        if (parsed.autofill || parsed.config) {
          if (parsed.autofill) AppState.autofill.presets.autofill = parsed.autofill;
          if (parsed.config) AppState.autofill.presets.config = parsed.config;
          if (AppState.autofill.presets.autofill && Object.keys(AppState.autofill.presets.autofill).length === 0) {
            const MigrationManager2 = APMApi.get("MigrationManager");
            if (MigrationManager2 && !_migrationRetried) {
              _migrationRetried = true;
              APMLogger.warn("AutoFill", "Profiles empty but config exists. Triggering deep healing migration...");
              MigrationManager2.migrateAutofillPresets();
              const fresh = APMStorage.get(PRESET_STORAGE_KEY);
              if (fresh && fresh.autofill) AppState.autofill.presets.autofill = fresh.autofill;
            }
          }
        } else if (typeof parsed === "object" && Object.keys(parsed).length > 0) {
          AppState.autofill.presets.autofill = parsed;
          APMLogger.info("AutoFill", "Recovered unwrapped legacy presets.");
          savePresets();
        }
      }
    } catch (e) {
      APMLogger.warn("AutoFill", "Failed to load presets", e);
    }
  }
  function savePresets() {
    const profiles = AppState.autofill.presets.autofill;
    if (!profiles || Object.keys(profiles).length === 0) {
      try {
        const stored = APMStorage.get(PRESET_STORAGE_KEY);
        if (stored?.autofill && Object.keys(stored.autofill).length > 0) {
          AppState.autofill.presets.autofill = stored.autofill;
        }
      } catch (e) {
        APMLogger.debug("AutoFill", "Storage operation failed:", e);
      }
    }
    const config = AppState.autofill.presets.config;
    const localTabCount = Object.keys(config.tabOrders || {}).length;
    const localColCount = Object.keys(config.columnOrders || {}).length;
    if (localTabCount === 0 || localColCount === 0) {
      try {
        const stored = APMStorage.get(PRESET_STORAGE_KEY);
        if (stored?.config) {
          if (localTabCount === 0 && stored.config.tabOrders && Object.keys(stored.config.tabOrders).length > 0) {
            config.tabOrders = stored.config.tabOrders;
            APMLogger.debug("AutoFill", "Recovered stored tabOrders before save");
          }
          if (localColCount === 0 && stored.config.columnOrders && Object.keys(stored.config.columnOrders).length > 0) {
            config.columnOrders = stored.config.columnOrders;
            APMLogger.debug("AutoFill", "Recovered stored columnOrders before save");
          }
          const localHiddenCount = Object.keys(config.hiddenTabs || {}).length;
          if (localHiddenCount === 0 && stored?.config?.hiddenTabs) {
            const storedHidden = stored.config.hiddenTabs;
            if (Array.isArray(storedHidden) && storedHidden.length > 0 || !Array.isArray(storedHidden) && Object.keys(storedHidden).length > 0) {
              config.hiddenTabs = storedHidden;
              APMLogger.debug("AutoFill", "Recovered stored hiddenTabs before save");
            }
          }
        }
      } catch (e) {
        APMLogger.debug("AutoFill", "Storage operation failed:", e);
      }
    }
    AppState.autofill.presets._v = 1;
    APMStorage.set(PRESET_STORAGE_KEY, AppState.autofill.presets);
  }
  function getPresets() {
    const config = AppState.autofill.presets.config;
    if (Object.keys(config.tabOrders || {}).length === 0 && Object.keys(config.columnOrders || {}).length === 0 && Object.keys(config.hiddenTabs || {}).length === 0) {
      try {
        const stored = APMStorage.get(PRESET_STORAGE_KEY);
        if (stored?.config) {
          AppState.autofill.presets.config = { ...config, ...stored.config };
          APMLogger.debug("AutoFill", "Hydrated config from storage for getPresets()");
        }
        if (stored?.autofill && Object.keys(AppState.autofill.presets.autofill || {}).length === 0) {
          AppState.autofill.presets.autofill = stored.autofill;
        }
      } catch (e) {
        APMLogger.debug("AutoFill", "Storage operation failed:", e);
      }
    }
    const cfg = AppState.autofill.presets.config;
    if (cfg) {
      const funcName = detectScreenFunction() || "GLOBAL";
      if (Array.isArray(cfg.hiddenTabs)) {
        cfg.hiddenTabs = normalizeHiddenTabs(cfg.hiddenTabs, funcName);
      }
      for (const key of Object.keys(cfg.tabOrders || {})) {
        if (typeof cfg.tabOrders[key] === "string") {
          cfg.tabOrders[key] = normalizeTabOrder(cfg.tabOrders[key]);
        }
      }
      for (const key of Object.keys(cfg.columnOrders || {})) {
        if (typeof cfg.columnOrders[key] === "string") {
          cfg.columnOrders[key] = normalizeColumnOrder(cfg.columnOrders[key]);
        }
      }
    }
    return structuredClone(AppState.autofill.presets);
  }
  function updatePresetConfig(updates) {
    const config = AppState.autofill.presets.config;
    if (Object.keys(config.tabOrders || {}).length === 0 && Object.keys(config.columnOrders || {}).length === 0) {
      loadPresets();
      APMLogger.debug("AutoFill", "Loaded presets before updatePresetConfig (config was empty)");
    }
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
  function getDefaultProfiles() {
    const presets = getPresets();
    if (!presets?.autofill) return [];
    return Object.entries(presets.autofill).filter(([, data]) => data.isDefault).map(([name, data]) => ({ name, ...data }));
  }
  function getIsAutoFillRunning() {
    return AppState.autofill.isAutoFillRunning;
  }
  function setIsAutoFillRunning(val) {
    AppState.autofill.isAutoFillRunning = val;
  }

  // src/modules/colorcode/colorcode-engine.js
  init_state();
  init_logger();
  init_constants();
  init_utils();
  init_api();
  init_diagnostics();
  init_feature_flags();
  init_storage();
  init_ajax_hooks();

  // src/modules/colorcode/colorcode-prefs.js
  init_state();
  init_constants();
  init_logger();
  init_storage();
  init_theme_resolver();
  function loadColorCodePrefs() {
    try {
      const storedRules = APMStorage.get(CC_STORAGE_RULES);
      if (storedRules) {
        if (storedRules._v !== void 0) {
          AppState.colorCode.rules = storedRules.rules || [];
        } else {
          AppState.colorCode.rules = storedRules;
        }
      }
      const storedSet = APMStorage.get(CC_STORAGE_SET);
      if (storedSet) {
        if (storedSet._v === void 0) {
          storedSet._v = 0;
          APMLogger.debug("ColorCode", "Settings loaded as legacy v0");
        }
        AppState.colorCode.settings = { ...AppState.colorCode.settings, ...storedSet };
      }
      AppState.colorCode.settings.theme = ThemeResolver.getPreferredTheme();
    } catch (e) {
      APMLogger.warn("ColorCode", "Failed to load preferences", e);
    }
  }
  function saveColorCodeRules() {
    const wrapped = { _v: 1, rules: AppState.colorCode.rules };
    APMStorage.set(CC_STORAGE_RULES, wrapped);
  }
  function saveColorCodeSettings() {
    AppState.colorCode.settings._v = 1;
    APMStorage.set(CC_STORAGE_SET, AppState.colorCode.settings);
  }
  var _cachedRulesJson = null;
  var _rulesGen = 0;
  var _currentRulesGen = 0;
  function getRules() {
    const stored = AppState.colorCode.rules;
    let rules;
    if (stored && typeof stored === "object" && !Array.isArray(stored) && stored._v !== void 0) {
      rules = stored.rules || [];
    } else {
      rules = AppState.colorCode.rules;
    }
    if (!_cachedRulesJson || _rulesGen !== _currentRulesGen) {
      _cachedRulesJson = JSON.stringify(rules);
      _rulesGen = _currentRulesGen;
    }
    return JSON.parse(_cachedRulesJson);
  }
  function setRules(newRules) {
    AppState.colorCode.rules = newRules;
    _currentRulesGen++;
    _cachedRulesJson = null;
    saveColorCodeRules();
    window.dispatchEvent(new CustomEvent("APM_CC_SYNC_REQUIRED"));
  }
  function getSettings() {
    if (AppState.colorCode.settings._v === void 0) {
      AppState.colorCode.settings._v = 0;
      APMLogger.debug("ColorCode", "Settings accessed as legacy v0");
    }
    return { ...AppState.colorCode.settings };
  }
  function setSettings(updates) {
    AppState.colorCode.settings = { ...AppState.colorCode.settings, ...updates };
    saveColorCodeSettings();
    window.dispatchEvent(new CustomEvent("APM_CC_SYNC_REQUIRED"));
  }

  // src/modules/colorcode/colorcode-engine.js
  init_dom_helpers();
  var _rowCache = /* @__PURE__ */ new WeakMap();
  var _rowCacheGeneration = 0;
  var _lastRuleFingerprint = "";
  var _ptpHistoryCleaned = false;
  function getPtpHistory() {
    let history = {};
    if (!apmGeneralSettings || !apmGeneralSettings.ptpTrackingEnabled) return history;
    try {
      history = APMStorage.get(PTP_HISTORY_KEY) || {};
    } catch (e) {
      APMLogger.debug("ColorCode", "Error:", e.message || e);
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
          APMStorage.set(PTP_HISTORY_KEY, history);
        } catch (e) {
          APMLogger.debug("ColorCode", "Error:", e.message || e);
        }
      }
    }
    return history;
  }
  function hexToRgbVals(hex) {
    let r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
    return `${r}, ${g}, ${b}`;
  }
  function getPtpStatusInfo(status) {
    if (status === "COMPLETE") return { icon: "\u2705", statusTxt: "Complete", color: "var(--apm-success)" };
    if (status === "CANCELLED") return { icon: "\u274C", statusTxt: "Cancelled", color: "var(--apm-danger)" };
    return { icon: "\u23F3", statusTxt: "Incomplete", color: "var(--apm-warning)" };
  }
  function fullStyleUpdate(targetDoc) {
    if (!FeatureFlags.isEnabled("colorCode")) return;
    const rules = getRules();
    const settings = getSettings();
    const previewRule = getPreviewRuleOverride();
    const docs = targetDoc ? [targetDoc] : [document];
    if (!targetDoc) {
      document.querySelectorAll("iframe").forEach((f) => {
        try {
          const fd = f.contentDocument;
          if (fd && fd.readyState !== "loading") docs.push(fd);
        } catch (e) {
          APMLogger.debug("ColorCode", "Error:", e.message || e);
        }
      });
    }
    docs.forEach((doc) => {
      const root = doc.documentElement;
      if (!root) return;
      rules.forEach((rule) => {
        if (!rule || !rule.id) return;
        const safeId = rule.id.toString().replace(/[^a-zA-Z0-9_-]/g, "_");
        if (!/^#[0-9a-fA-F]{3,8}$/.test(rule.color)) return;
        root.style.setProperty(`--cc-color-${safeId}`, rule.color);
      });
      if (previewRule && previewRule.id && previewRule.color) {
        const safeId = previewRule.id.toString().replace(/[^a-zA-Z0-9_-]/g, "_");
        root.style.setProperty(`--cc-color-${safeId}`, previewRule.color);
      }
      const legacy = doc.getElementById("apm-cc-dynamic-styles");
      if (legacy) legacy.remove();
    });
  }
  var _compiledRules = null;
  var _compiledRulesFingerprint = "";
  var _APM_PREVIEW_KEY = "__ccPreviewRule";
  function _getTopAPM() {
    try {
      const uw = typeof unsafeWindow !== "undefined" ? unsafeWindow : window;
      const top = uw.top;
      if (!top._APM) top._APM = {};
      return top._APM;
    } catch (e) {
      if (!window._APM) window._APM = {};
      return window._APM;
    }
  }
  function setPreviewRuleOverride(rule) {
    _getTopAPM()[_APM_PREVIEW_KEY] = rule || null;
    if (rule) {
      APMLogger.debug("ColorCode Engine", "Preview override SET (cross-frame):", rule);
    } else {
      APMLogger.debug("ColorCode Engine", "Preview override CLEARED (cross-frame)");
    }
  }
  function getPreviewRuleOverride() {
    return _getTopAPM()[_APM_PREVIEW_KEY] || null;
  }
  function getCompiledRules(rules) {
    const fingerprint = rules.map((r) => `${r.id}:${r.search}:${r.fill}:${r.showTag}:${r.color}:${r.tag || ""}`).join("|");
    if (_compiledRules && fingerprint === _compiledRulesFingerprint) {
      return _compiledRules;
    }
    APMLogger.debug("ColorCode", `Compiling ${rules.length} rules...`);
    _compiledRulesFingerprint = fingerprint;
    _compiledRules = rules.map((r) => {
      if (!r.search) return null;
      const terms = r.search.split(",").map((s) => s.trim().toLowerCase()).filter((s) => s);
      if (terms.length === 0) return null;
      const pattern = terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
      return { ...r, regex: new RegExp(pattern, "i") };
    }).filter((r) => r);
    APMLogger.debug("ColorCode", `Compiled ${_compiledRules.length} rules: ${_compiledRules.map((r) => r.id).join(", ")}`);
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
  var _entityColumnId = null;
  var _activeEntityConfig = null;
  var _activeUserFunc = null;
  AjaxHooks.onBeforeRequest("entity-detect", (win, conn, options) => {
    const url2 = options.url || "";
    if (!url2.includes("FUNCTION_CLASS=WEBL")) return;
    try {
      const urlObj = new URL(url2, win.location.origin);
      const usr = urlObj.searchParams.get("USER_FUNCTION_NAME");
      let sys = urlObj.searchParams.get("SYSTEM_FUNCTION_NAME");
      if (usr) {
        if (!sys) {
          const pathParts = urlObj.pathname.split("/");
          const last = pathParts[pathParts.length - 1];
          if (last && last !== "base") sys = last;
        }
        setXhrScreenContext(usr, sys);
        APMLogger.debug("ColorCode", `XHR entity detect: userFunc=${usr}, systemFunc=${sys}`);
      }
    } catch (e) {
      APMLogger.debug("ColorCode", "Error:", e.message || e);
    }
  });
  AjaxHooks.onBeforeRequest("entity-detect-hdr", (win, conn, options) => {
    const url2 = options.url || "";
    if (!url2.includes(".HDR") && !url2.includes(".LST")) return;
    try {
      const params = typeof options.params === "string" ? new URLSearchParams(options.params) : null;
      const paramsObj = typeof options.params === "object" ? options.params : null;
      const usr = params?.get("USER_FUNCTION_NAME") || paramsObj?.USER_FUNCTION_NAME;
      const sys = params?.get("SYSTEM_FUNCTION_NAME") || paramsObj?.SYSTEM_FUNCTION_NAME;
      if (usr && usr !== "WSTABS" && usr !== "WSFLTR") {
        setXhrScreenContext(usr, sys);
        APMLogger.debug("ColorCode", `XHR entity detect (HDR/LST): userFunc=${usr}, systemFunc=${sys}`);
      }
    } catch (e) {
      APMLogger.debug("ColorCode", "Error:", e.message || e);
    }
  });
  function resolveEntityColumn(doc) {
    const xhr = getXhrScreenContext();
    let userFunc = xhr.userFunc;
    if (!userFunc) {
      const fromFrames = apmGetActiveFunctionNames();
      userFunc = fromFrames.userFunc;
    }
    if (!userFunc || userFunc === "WSJOBS") {
      for (const win of getExtWindows()) {
        try {
          if (!win.Ext?.ComponentQuery) continue;
          const tabs = win.Ext.ComponentQuery.query("tab[active=true]:not([destroyed=true])");
          for (const tab of tabs) {
            const text = (tab.text || "").toUpperCase();
            if (text.includes("COMPLIANCE") && text.includes("WORK")) {
              userFunc = "CTJOBS";
              break;
            }
          }
          if (userFunc === "CTJOBS") break;
        } catch (e) {
        }
      }
    }
    _activeUserFunc = userFunc || "WSJOBS";
    const config = ENTITY_REGISTRY[_activeUserFunc];
    if (!config) {
      _activeEntityConfig = ENTITY_REGISTRY.WSJOBS;
      _entityColumnId = null;
      return;
    }
    _activeEntityConfig = config;
    APMLogger.debug("ColorCode", `Entity resolved: userFunc=${_activeUserFunc}, label=${config.label}, dataIndex=${config.dataIndex}`);
    _entityColumnId = null;
    try {
      const win = doc.defaultView || window;
      if (win.Ext && win.Ext.ComponentQuery) {
        const grids = win.Ext.ComponentQuery.query("gridpanel:not([destroyed=true])");
        for (const g of grids) {
          if (!g.rendered || g.isDestroyed || !g.headerCt) continue;
          if (g.getEl()?.dom?.ownerDocument !== doc) continue;
          const col = g.headerCt.items.items.find(
            (c) => c.dataIndex === config.dataIndex && c.rendered
          );
          if (col?.id) {
            _entityColumnId = col.id;
            APMLogger.debug("ColorCode", `Entity column found: ${col.id} (dataIndex=${config.dataIndex})`);
            break;
          }
        }
      }
    } catch (e) {
      APMLogger.debug("ColorCode", "resolveEntityColumn grid search error:", e);
    }
  }
  function buildEntityUrl(entityId, config, userFunc) {
    const tenant = window.EAM && window.EAM.AppData && window.EAM.AppData.tenant ? window.EAM.AppData.tenant : LINK_CONFIG.tenant;
    const params = new URLSearchParams({
      tenant,
      [config.drillbackFlag]: "YES",
      SYSTEM_FUNCTION_NAME: config.systemFunc,
      USER_FUNCTION_NAME: userFunc
    });
    params.set(config.entityKey, entityId);
    return `https://${window.location.hostname}/web/base/logindisp?${params.toString()}`;
  }
  function applyEntityLink(cell, entityConfig, rawText) {
    const cellText = rawText;
    const hasLinkAttr = cell.hasAttribute("data-apm-linkified");
    const physicalLinkMissing = hasLinkAttr && !cell.querySelector(".apm-wo-link");
    const existingLink = hasLinkAttr ? cell.querySelector(".apm-wo-link") : null;
    const linkSettingChanged = existingLink && existingLink.getAttribute("target") === "_blank" !== !!apmGeneralSettings?.openLinksInNewTab;
    if (!hasLinkAttr || physicalLinkMissing || linkSettingChanged) {
      let entityId = null;
      const config = entityConfig || ENTITY_REGISTRY.WSJOBS;
      const userFunc = _activeUserFunc || "WSJOBS";
      if (_entityColumnId) {
        const gridCell = cell.closest(".x-grid-cell");
        if (gridCell && gridCell.getAttribute("data-columnid") === _entityColumnId) {
          const trimmed = cellText.trim();
          if (trimmed) entityId = trimmed;
        }
      }
      if (!entityId && config.pattern) {
        const match = cellText.match(config.pattern);
        if (match) entityId = match[1];
      }
      if (entityId) {
        const safeUrl = buildEntityUrl(entityId, config, userFunc);
        const isNewTab = apmGeneralSettings?.openLinksInNewTab;
        const anchorProps = { className: "apm-wo-link", href: safeUrl };
        if (isNewTab) anchorProps.target = "_blank";
        const anchor = el("a", anchorProps, [entityId]);
        const copyIcon = el("span", { className: "apm-copy-icon", title: "Copy link to clipboard", dataset: { woCopyUrl: safeUrl } });
        const wrapper = el("span", { style: { whiteSpace: "nowrap" } }, [anchor, copyIcon]);
        cell.textContent = "";
        cell.appendChild(wrapper);
        if (!isNewTab) {
          const link = cell.querySelector(".apm-wo-link");
          if (link) link.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            window.top.location.href = safeUrl;
          });
        }
        cell.setAttribute("data-apm-linkified", "true");
        cell.setAttribute("data-wo-num", entityId);
      } else if (hasLinkAttr) {
        cell.removeAttribute("data-apm-linkified");
        cell.removeAttribute("data-wo-num");
      }
    }
  }
  function applyPtpTag(cell, ptpRecord) {
    if (apmGeneralSettings.ptpTrackingEnabled && cell.hasAttribute("data-wo-num")) {
      const woNum = cell.getAttribute("data-wo-num");
      const record = ptpRecord || null;
      const existingPtpTag = cell.querySelector(".apm-ptp-status-tag");
      if (record) {
        const { icon, statusTxt, color } = getPtpStatusInfo(record.status);
        const titleTxt = `${statusTxt} PTP on ${new Date(record.time).toLocaleDateString()}`;
        if (!existingPtpTag) {
          const iconSpan = el("span", { style: { fontSize: "12px" } }, [icon]);
          const ptpDiv = el("div", {
            className: "apm-ptp-status-tag",
            title: titleTxt,
            style: { fontSize: "11px", marginTop: "4px", display: "inline-flex", alignItems: "center", gap: "4px", color, opacity: "0.9" }
          }, [iconSpan, " PTP"]);
          cell.appendChild(ptpDiv);
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
  }
  function applyNametags(cell, rowMatches) {
    const lowerCellText = cell.textContent.toLowerCase();
    cell.querySelectorAll(".apm-nametag").forEach((tag) => {
      const raw = tag.getAttribute("data-cc-id");
      const ruleId = isNaN(Number(raw)) ? raw : Number(raw);
      if (!rowMatches.some((r) => r.id === ruleId && r.showTag)) tag.remove();
    });
    rowMatches.forEach((rule) => {
      if (!rule.showTag || !rule.tag || !rule.regex.test(lowerCellText)) {
        cell.querySelector(`.apm-nametag[data-cc-id="${CSS.escape(String(rule.id))}"]`)?.remove();
        return;
      }
      const safeId = rule.id.toString().replace(/[^a-zA-Z0-9_-]/g, "_");
      const allTermsCsv = rule.search || "";
      const existingTag = cell.querySelector(`.apm-nametag[data-cc-id="${CSS.escape(String(rule.id))}"]`);
      if (!existingTag) {
        const tagChildren = [];
        const tagParts = rule.tag.split("\\n");
        tagParts.forEach((part, i) => {
          if (i > 0) tagChildren.push(el("br"));
          tagChildren.push(part);
        });
        const tagDiv = el("div", {
          className: "apm-nametag",
          title: "Click to filter",
          dataset: { ccId: rule.id, filterKw: allTermsCsv },
          style: { backgroundColor: `var(--cc-color-${safeId})` }
        }, tagChildren);
        cell.appendChild(tagDiv);
      } else {
        existingTag.style.backgroundColor = `var(--cc-color-${safeId})`;
        existingTag.setAttribute("data-filter-kw", allTermsCsv);
        const currentText = existingTag.textContent;
        const newText = rule.tag.replace(/\\n/g, "\n");
        if (currentText !== newText) {
          existingTag.textContent = "";
          const parts = rule.tag.split("\\n");
          parts.forEach((part, i) => {
            if (i > 0) existingTag.appendChild(el("br"));
            existingTag.appendChild(document.createTextNode(part));
          });
        }
      }
    });
  }
  function applyCellProcessors(cell, rowMatches, ptpHistory) {
    const entityConfig = _activeEntityConfig || ENTITY_REGISTRY.WSJOBS;
    applyEntityLink(cell, entityConfig, cell.textContent);
    const woNum = cell.getAttribute("data-wo-num");
    applyPtpTag(cell, woNum ? ptpHistory[woNum] : null);
    applyNametags(cell, rowMatches);
  }
  function processRecordHeader(doc, ptpHistory) {
    try {
      const headerConfig = _activeEntityConfig || ENTITY_REGISTRY.WSJOBS;
      const headerUserFunc = _activeUserFunc || "WSJOBS";
      doc.querySelectorAll("span.recordcode").forEach((rcEl) => {
        const textContent = rcEl.textContent;
        let entityId = null;
        if (headerConfig.pattern) {
          const match = textContent.match(headerConfig.pattern);
          if (match) entityId = match[1];
        } else {
          const cleanText = textContent.replace(/[\u200B-\u200D\uFEFF]/g, "").trim();
          if (cleanText) entityId = cleanText;
        }
        if (entityId) {
          if (!rcEl.hasAttribute("data-wo-num")) {
            rcEl.setAttribute("data-wo-num", entityId);
            const copyIcon = el("span", { className: "apm-copy-icon", title: "Copy link to clipboard", dataset: { woCopyUrl: buildEntityUrl(entityId, headerConfig, headerUserFunc) } });
            rcEl.appendChild(copyIcon);
          }
          if (apmGeneralSettings.ptpTrackingEnabled) {
            const ptpRecord = ptpHistory[entityId];
            const existingPtpTag = doc.querySelector(".apm-ptp-status-tag-header");
            if (ptpRecord) {
              const { icon, statusTxt, color } = getPtpStatusInfo(ptpRecord.status);
              const titleTxt = `${statusTxt} PTP on ${new Date(ptpRecord.time).toLocaleDateString()}`;
              const buildPtpTag = () => {
                const iconSpan = el("span", { style: { fontSize: "14px" } }, [icon]);
                return el("span", {
                  className: "apm-ptp-status-tag-header",
                  title: titleTxt,
                  style: { fontSize: "13px", marginLeft: "8px", display: "inline-flex", alignItems: "center", gap: "4px", opacity: "1.0", cursor: "help", whiteSpace: "nowrap", color }
                }, [iconSpan, " PTP"]);
              };
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
                    triggerWrap.after(buildPtpTag());
                  } else if (existingPtpTag && existingPtpTag.title !== titleTxt) {
                    existingPtpTag.replaceWith(buildPtpTag());
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
  function processColorCodeGrid(targetDoc) {
    const doc = targetDoc && targetDoc.querySelectorAll ? targetDoc : document;
    if (!FeatureFlags.isEnabled("colorCode")) return;
    const settings = getSettings();
    const previewOverride = getPreviewRuleOverride();
    let rawRules = getRules();
    if (previewOverride) {
      rawRules = rawRules.filter((r) => r.id !== "__preview__");
      if (previewOverride._editingId) {
        rawRules = rawRules.filter((r) => r.id !== previewOverride._editingId);
      }
      rawRules = [...rawRules, previewOverride];
    } else {
      const stale = rawRules.find((r) => r.id === "__preview__");
      if (stale) {
        APMLogger.warn("ColorCode", `Stale preview rule in AppState, stripping. search="${stale.search}"`);
        rawRules = rawRules.filter((r) => r.id !== "__preview__");
      }
    }
    if (!settings || !rawRules || !Array.isArray(rawRules)) return;
    const activeRules = getCompiledRules(rawRules);
    const ptpHistory = getPtpHistory();
    resolveEntityColumn(doc);
    const ruleFingerprint = `${settings.uniformHighlight}|${_compiledRulesFingerprint}`;
    if (ruleFingerprint !== _lastRuleFingerprint) {
      _lastRuleFingerprint = ruleFingerprint;
      _rowCacheGeneration++;
      fullStyleUpdate(doc);
    }
    let rowsToProcess = [];
    try {
      const win = doc.defaultView || window;
      if (win.Ext && win.Ext.ComponentQuery) {
        const grids = win.Ext.ComponentQuery.query("gridpanel:not([destroyed=true])");
        grids.forEach((g) => {
          if (g.rendered && !g.isDestroyed && g.getEl()?.dom?.ownerDocument === doc) {
            const view = g.getView();
            if (view && view.getNodes) {
              const nodes = view.getNodes();
              if (nodes && nodes.length > 0) rowsToProcess.push(...nodes);
            }
          }
        });
      }
    } catch (e) {
      APMLogger.error("ColorCode", "Error querying grids:", e);
    }
    if (rowsToProcess.length === 0) rowsToProcess = doc.querySelectorAll(".x-grid-item");
    const viewCache = /* @__PURE__ */ new Map();
    rowsToProcess.forEach((row) => {
      try {
        const win = doc.defaultView || window;
        const gridEl = row.closest(".x-grid");
        const gridId = gridEl?.id;
        let view = null;
        if (gridId) {
          if (!viewCache.has(gridId)) {
            const cmp = win.Ext?.getCmp(gridId);
            viewCache.set(gridId, cmp?.getView?.() || null);
          }
          view = viewCache.get(gridId);
        }
        const record = view?.getRecord?.(row);
        const rawText = row.textContent;
        const textLen = rawText.length;
        const cached = _rowCache.get(row);
        const isRecycled = record && cached?.recId !== record.internalId || cached?.textRaw !== rawText;
        if (!isRecycled && cached && cached.gen === _rowCacheGeneration) {
          const needsRepaint = cached.hasTag && !row.querySelector(".apm-nametag") || cached.hasEntity && !row.querySelector(".apm-wo-link") || cached.hasFill && !row.hasAttribute("data-cc-rule");
          if (!needsRepaint) {
            row.setAttribute("data-cc-gen", _rowCacheGeneration);
            return;
          }
          APMLogger.debug("ColorCode", `Row ${row.id} needs repaint (decorations missing)`);
        }
        const lowerText = rawText.toLowerCase();
        const rowMatches = activeRules.filter((r) => r.regex.test(lowerText));
        const fillRule = rowMatches.find((r) => r.fill);
        const tagRulesCount = rowMatches.filter((r) => r.showTag).length;
        const entityConfig = _activeEntityConfig || ENTITY_REGISTRY.WSJOBS;
        const hasEntity = _entityColumnId ? true : !!entityConfig.pattern;
        _rowCache.set(row, {
          len: textLen,
          textRaw: rawText,
          recId: record?.internalId,
          gen: _rowCacheGeneration,
          hasFill: !!fillRule,
          hasTag: tagRulesCount > 0,
          hasEntity
        });
        applyRowColoring(row, fillRule, settings);
        if (rowMatches.length === 0 && !hasEntity && Object.keys(ptpHistory).length === 0) {
          row.setAttribute("data-cc-gen", _rowCacheGeneration);
          return;
        }
        const cells = row.querySelectorAll(".x-grid-cell-inner");
        cells.forEach((cell) => applyCellProcessors(cell, rowMatches, ptpHistory));
        row.setAttribute("data-cc-gen", _rowCacheGeneration);
      } catch (e) {
        APMLogger.error("ColorCode", "Row processing error:", e);
      }
    });
    processRecordHeader(doc, ptpHistory);
  }
  function setupExtGridListeners(win) {
    if (!FeatureFlags.isEnabled("colorCode")) return;
    if (!win.Ext || !win.Ext.ComponentQuery) return;
    try {
      if (!win.__apmWinHooksInjected) {
        APMLogger.debug("ColorCode", `Initializing window hooks for ${win.location?.pathname}`);
        win.addEventListener("APM_PTP_UPDATED_EVENT", () => {
          _rowCacheGeneration++;
          debouncedProcessColorCodeGrid(win.document, true);
        });
        win.__apmWinHooksInjected = true;
      }
      const grids = win.Ext.ComponentQuery.query("gridpanel, treepanel");
      if (grids.length > 0) APMLogger.debug("ColorCode", `Found ${grids.length} grids for listener binding in ${win.location?.pathname}`);
      grids.forEach((grid) => {
        const view = grid.getView();
        if (view && !view._apmHooksInjected) {
          APMLogger.debug("ColorCode", `Binding listeners to view of grid: ${grid.id}`);
          const trigger = () => debouncedProcessColorCodeGrid(view.el?.dom?.ownerDocument);
          const doubleTrigger = () => {
            trigger();
            setTimeout(trigger, 250);
          };
          view.on("refresh", doubleTrigger);
          view.on("itemadd", trigger);
          view.on("itemupdate", trigger);
          view.on("bufferedrefresh", trigger);
          view.on("viewready", trigger);
          view.on("groupcollapse", trigger);
          view.on("groupexpand", trigger);
          let _scrollThrottleTO = null;
          const scrollHandler = () => {
            if (_scrollThrottleTO) return;
            _scrollThrottleTO = setTimeout(() => {
              _scrollThrottleTO = null;
              trigger();
            }, 250);
          };
          const attachScroll = (el2) => {
            if (!el2 || !el2.dom) return;
            el2.dom.removeEventListener("scroll", scrollHandler);
            el2.dom.addEventListener("scroll", scrollHandler, { passive: true });
          };
          if (view.rendered) {
            attachScroll(view.el);
            if (view.getScroller) {
              const scroller = view.getScroller();
              if (scroller && scroller.getElement) attachScroll(scroller.getElement());
            }
          } else {
            view.on("render", () => {
              attachScroll(view.el);
              if (view.getScroller) {
                const scroller = view.getScroller();
                if (scroller && scroller.getElement) attachScroll(scroller.getElement());
              }
            });
          }
          view._apmHooksInjected = true;
        }
      });
      const tabPanels = win.Ext.ComponentQuery.query("tabpanel[id=main-tab-panel], tabpanel[itemId=main-tab-panel]");
      tabPanels.forEach((tp) => {
        if (!tp._apmCCInjected) {
          tp.on("tabchange", () => {
            APMLogger.debug("ColorCode", "Main tab change detected - invalidating cache");
            invalidateColorCodeCache(win.document);
          });
          tp._apmCCInjected = true;
        }
      });
      win.__apmHooksInjected = true;
    } catch (e) {
      APMLogger.warn("ColorCode", "setupExtGridListeners failed:", e);
    }
  }
  var _ccProcessTO = null;
  var _ccLastRun = 0;
  var _ccFirstRequestTime = 0;
  var DEBOUNCE_MS = 150;
  var THROTTLE_MS = 500;
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
              APMLogger.debug("ColorCode", "Error:", e.message || e);
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
              APMLogger.debug("ColorCode", "Error:", e.message || e);
            }
          });
        }
        const end = performance.now();
        const duration = parseFloat((end - start).toFixed(2));
        Diagnostics.recordPerformance("colorCode", duration);
        APMLogger.debug("ColorCode", `Grid processing took ${duration}ms for ${count} frames (Immediate: ${forceImmediate})`);
      });
    };
    if (forceImmediate) {
      if (_ccProcessTO) clearTimeout(_ccProcessTO);
      run();
      return;
    }
    if (now - _ccLastRun > 1e3) {
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
    APMApi.register("invalidateColorCodeCache", invalidateColorCodeCache);
    APMApi.register("debouncedProcessColorCodeGrid", debouncedProcessColorCodeGrid);
    APMApi.register("fullStyleUpdate", fullStyleUpdate);
    globalWin.addEventListener("APM_CC_SYNC_REQUIRED", () => {
      fullStyleUpdate();
      invalidateColorCodeCache();
    });
    window.addEventListener("resize", () => {
      debouncedProcessColorCodeGrid(document);
    }, { passive: true });
  }

  // src/modules/tab-grid-order/tab-grid-order.js
  init_state();
  init_api();
  init_feature_flags();
  init_diagnostics();
  var CACHE_TTL_MS = 2e3;
  var SUPPRESSION_HOLD_MS = 400;
  var CLEANUP_COALESCE_MS = 100;
  var STABILITY_TIMEOUT_MS = 5e3;
  var RESTORATION_TIMEOUT_MS = 1e3;
  var AJAX_IDLE_TIMEOUT_MS = 3e3;
  var CLEANUP_RETRY_COUNT = 11;
  async function waitForCondition(predicate, timeoutMs = 3e3, intervalMs = 50) {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      if (predicate()) return true;
      await new Promise((r) => setTimeout(r, intervalMs));
    }
    return false;
  }
  var _gridRetries = 0;
  var _cachedColumns = null;
  var _cachedColumnsTime = 0;
  var _systemDefaults = { tabs: {}, columns: {} };
  var _tabNameCache = /* @__PURE__ */ new Map();
  function normalizeTabName(rawName) {
    if (!rawName) return "";
    if (_tabNameCache.has(rawName)) return _tabNameCache.get(rawName);
    const normalized = rawName.replace(/<[^>]*>?/gm, "").replace(/&nbsp;/g, " ").replace(/\u00A0/g, " ").trim();
    _tabNameCache.set(rawName, normalized);
    return normalized;
  }
  function probeExtGridColumns() {
    if (Date.now() - _cachedColumnsTime < CACHE_TTL_MS && _cachedColumns) {
      return _cachedColumns;
    }
    let cols = [];
    const result = findMainGrid();
    if (result && result.grid.headerCt) {
      result.grid.headerCt.items.items.forEach((col) => {
        if (col.rendered && (!col.isHidden || !col.isHidden()) && col.dataIndex) {
          let cleanText = (col.text || col.dataIndex).replace(/<[^>]*>?/gm, "").trim();
          if (cleanText && cleanText !== "&#160;") {
            cols.push({
              index: col.dataIndex,
              text: cleanText,
              width: col.getWidth?.() || col.width || null
            });
          }
        }
      });
    }
    _cachedColumns = cols;
    _cachedColumnsTime = Date.now();
    return cols;
  }
  var _cachedTabs = null;
  var _cachedTabsTime = 0;
  function probeExtTabs() {
    if (Date.now() - _cachedTabsTime < CACHE_TTL_MS && _cachedTabs) {
      return _cachedTabs;
    }
    let tabsMap = /* @__PURE__ */ new Map();
    const result = findMainTabPanel();
    if (result) {
      const tp = result.tabPanel;
      const tabBar = tp.getTabBar ? tp.getTabBar() : tp.tabBar;
      const tabMenuPlugin = tp.plugins?.find?.((p) => p.ptype === "uxtabmenu");
      const barRect = tabBar && tabBar.rendered && tabBar.el?.dom ? tabBar.el.dom.getBoundingClientRect() : null;
      tp.items.items.forEach((t) => {
        if (t.isDestroyed) return;
        let cleanText = normalizeTabName(t.title || t.text || t.tab?.getText?.());
        if (cleanText && cleanText !== "&#160;") {
          const systemHidden = !!(t.hidden || t.tab && t.tab.hidden);
          let isOverflow = false;
          if (barRect && t.tab && t.tab.rendered && !t.tab.isDestroyed) {
            const tabEl = t.tab.el?.dom;
            if (tabEl) {
              const tabRect = tabEl.getBoundingClientRect();
              isOverflow = tabRect.right > barRect.right + 2 || tabRect.left < barRect.left - 2;
            }
          }
          const existing = tabsMap.get(cleanText);
          if (!existing || existing.systemHidden && !systemHidden) {
            tabsMap.set(cleanText, { index: cleanText, text: cleanText, isOverflow, systemHidden, itemId: t.itemId || null });
          } else if (existing && t.itemId && existing.itemId && t.itemId !== existing.itemId) {
            const suffixed = `${cleanText} (${t.itemId})`;
            tabsMap.set(suffixed, { index: suffixed, text: cleanText, isOverflow, systemHidden, itemId: t.itemId });
          }
        }
      });
      if (tabMenuPlugin?.tabsMenu?.items) {
        tabMenuPlugin.tabsMenu.items.items.forEach((mi) => {
          if (mi.isDestroyed || !mi.text) return;
          let cleanText = normalizeTabName(mi.text);
          if (cleanText && !tabsMap.has(cleanText)) {
            tabsMap.set(cleanText, {
              index: cleanText,
              text: cleanText,
              isOverflow: true,
              isPluginMenu: true,
              systemHidden: true
            });
          }
        });
      }
    }
    const tabs = Array.from(tabsMap.values());
    _cachedTabs = tabs;
    _cachedTabsTime = Date.now();
    return tabs;
  }
  function reorderColumns(headerCt, preferredOrder, win) {
    const visibleCols = headerCt.getVisibleGridColumns().filter(
      (c) => !c.isCheckerHd && !c.locked && c.xtype !== "rownumberer"
    );
    const activePreferred = preferredOrder.map(
      (dataIndex) => visibleCols.find((c) => c.dataIndex === dataIndex)
    ).filter(Boolean);
    let needsSorting = false;
    for (let i = 0; i < activePreferred.length; i++) {
      if (visibleCols[i] !== activePreferred[i]) {
        needsSorting = true;
        break;
      }
    }
    if (!needsSorting || headerCt.isDestroyed) return false;
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
      return false;
    } finally {
      if (layoutsSuspended) win.Ext.resumeLayouts(true);
    }
    return true;
  }
  function hookColumnResize(grid, win) {
    if (grid._apmResizeHooked || !grid.headerCt || grid.isDestroyed) return;
    grid._apmResizeHooked = true;
    grid.headerCt.on("columnresize", (ct, col, width) => {
      if (Date.now() < _suppressResizeUntil || !col.dataIndex || grid.isDestroyed) return;
      try {
        const funcName = resolveScreenContext(win, grid);
        const presets = getPresets();
        const existing = presets.config.columnOrders?.[funcName];
        let orderArray;
        if (Array.isArray(existing)) {
          orderArray = existing.map((entry) => {
            const e = typeof entry === "string" ? { index: entry, width: null } : { ...entry };
            if (e.index === col.dataIndex) e.width = width;
            return e;
          });
          if (!orderArray.some((e) => e.index === col.dataIndex)) {
            orderArray.push({ index: col.dataIndex, width });
          }
        } else {
          orderArray = [];
          grid.headerCt.items.items.forEach((c) => {
            if (c.rendered && (!c.isHidden || !c.isHidden()) && c.dataIndex) {
              orderArray.push({
                index: c.dataIndex,
                width: c.dataIndex === col.dataIndex ? width : c.getWidth?.() || c.width || null
              });
            }
          });
        }
        const merged = { ...presets.config.columnOrders || {}, [funcName]: orderArray };
        AppState.autofill.presets.config.columnOrders = merged;
        savePresets();
        APMLogger.debug("TabGridOrder", `Auto-saved column width: ${col.dataIndex} = ${width}px (${funcName})`);
      } catch (e) {
        APMLogger.warn("TabGridOrder", "Failed to auto-save column width:", e);
      }
    });
    APMLogger.debug("TabGridOrder", `Hooked columnresize on grid ${grid.id}`);
  }
  var _suppressResizeUntil = 0;
  function applyColumnWidths(headerCt, savedOrder) {
    for (const saved of savedOrder) {
      if (!saved.width) continue;
      const col = headerCt.items.items.find((c) => c.dataIndex === saved.index);
      if (col && !col.isDestroyed && col.setWidth) {
        const currentWidth = col.getWidth?.() || col.width;
        if (currentWidth === saved.width) continue;
        try {
          col.setWidth(saved.width);
        } catch (e) {
          APMLogger.warn("TabGridOrder", `Failed to set width for column "${saved.index}":`, e);
        }
      }
    }
  }
  async function applyGridConsistency() {
    if (!FeatureFlags.isEnabled("tabGridOrder")) return;
    const start = performance.now();
    try {
      const result = findMainGrid();
      if (!result || !result.grid.headerCt || result.grid.headerCt.isDestroyed) return;
      const { grid: mainGrid, win } = result;
      hookColumnResize(mainGrid, win);
      const funcName = resolveScreenContext(win, mainGrid);
      const presets = getPresets();
      const rawOrder = presets.config.columnOrders?.[funcName] || presets.config.columnOrders?.["GLOBAL"];
      if (!rawOrder) return;
      const preferredOrder = typeof rawOrder === "string" ? rawOrder.split(",").map((s) => s.trim()).filter(Boolean) : rawOrder.map((entry) => typeof entry === "string" ? entry : entry.index);
      if (preferredOrder.length === 0) return;
      if (!mainGrid.headerCt.rendered) {
        if (++_gridRetries > 10 || mainGrid.isDestroyed) {
          APMLogger.warn("TabGridOrder", `Grid header retry exhausted (${_gridRetries} attempts). Grid: ${mainGrid.id}, destroyed: ${mainGrid.isDestroyed}`);
          _gridRetries = 0;
          return;
        }
        const delay2 = Math.min(200 * Math.pow(2, _gridRetries - 1), 2e3);
        APMLogger.debug("TabGridOrder", `Grid ${mainGrid.id} header not ready. Retry ${_gridRetries}/10 in ${delay2}ms`);
        setTimeout(applyGridConsistency, delay2);
        return;
      }
      _gridRetries = 0;
      if (!_systemDefaults.columns[funcName]) {
        const defaultCols = mainGrid.headerCt.getVisibleGridColumns().filter((c) => !c.isCheckerHd && !c.locked && c.xtype !== "rownumberer" && c.dataIndex).map((c) => c.dataIndex);
        if (defaultCols.length > 0) _systemDefaults.columns[funcName] = defaultCols;
      }
      _suppressResizeUntil = Date.now() + 1e3;
      const didMove = reorderColumns(mainGrid.headerCt, preferredOrder, win);
      if (Array.isArray(rawOrder) && rawOrder.some((e) => e.width)) {
        applyColumnWidths(mainGrid.headerCt, rawOrder);
      }
      if (didMove && !mainGrid.isDestroyed && mainGrid.getView && !mainGrid.getView().isDestroyed) {
        mainGrid.getView().refresh();
        debouncedProcessColorCodeGrid(win.document);
      }
    } finally {
      Diagnostics.recordPerformance("tabGridOrder", performance.now() - start);
    }
  }
  var _isApplyingTabConsistency = false;
  var _ignoreNativeEvents = false;
  var _allowActiveTabChange = true;
  var _cleanupScheduled = false;
  var _pendingRerun = false;
  function scheduleCleanupPass(delay2 = CLEANUP_COALESCE_MS) {
    if (_cleanupScheduled) return;
    _cleanupScheduled = true;
    setTimeout(() => {
      _cleanupScheduled = false;
      applyTabConsistency(CLEANUP_RETRY_COUNT);
      APMApi.get("triggerResponsiveInjections")?.();
    }, delay2);
  }
  function isSuppressingNativeEvents() {
    return _ignoreNativeEvents;
  }
  function resolveScreenContext(win, grid) {
    return detectScreenFunction(win, grid);
  }
  function hideAndShowTabs(mainTabPanel, hiddenTabs, preferredOrder) {
    let activeTabWasRemoved = false;
    const activeTab = mainTabPanel.getActiveTab?.() || null;
    mainTabPanel.items.items.forEach((item) => {
      if (item.isDestroyed || !item.tab) return;
      const tabName = normalizeTabName(item.title || item.text || item.tab.getText?.());
      const isHiddenInPresets = hiddenTabs.includes(tabName);
      if (isHiddenInPresets) {
        if (item.tab.isVisible()) {
          try {
            APMLogger.debug("TabGridOrder", `CSS hiding tab: ${tabName}`);
            item.tab.hide();
            item.hide();
          } catch (e) {
            APMLogger.warn("TabGridOrder", `Failed to hide tab "${tabName}"`);
          }
        }
        if (activeTab === item) activeTabWasRemoved = true;
      } else {
        if (!item.tab.isVisible()) {
          const isUserOrdered = preferredOrder.includes(tabName);
          const isVisibleBySystem = !item.tab.hidden;
          if (isUserOrdered || isVisibleBySystem) {
            try {
              item.tab.show();
            } catch (e) {
              APMLogger.warn("TabGridOrder", `Failed to show tab "${tabName}"`, e);
            }
          }
        }
      }
    });
    if (activeTabWasRemoved) {
      try {
        const firstVisible = mainTabPanel.items.items.find((t) => t.tab && t.tab.isVisible());
        if (firstVisible) mainTabPanel.setActiveTab(firstVisible);
      } catch (e) {
        APMLogger.warn("TabGridOrder", "Could not safely switch away from hidden active tab", e);
      }
    }
  }
  async function restorePluginTabs(mainTabPanel, hiddenTabs, preferredOrder) {
    const tabMenuPlugin = mainTabPanel.plugins?.find?.((p) => p.ptype === "uxtabmenu");
    if (!tabMenuPlugin?.tabsMenu?.items) return;
    const menuItems = tabMenuPlugin.tabsMenu.items.items;
    let restorationHappened = false;
    let restorationCount = 0;
    const MAX_RESTORATIONS = 5;
    for (const mi of menuItems) {
      if (mi.isDestroyed || !mi.text) continue;
      if (restorationCount >= MAX_RESTORATIONS) {
        APMLogger.warn("TabGridOrder", `Circuit breaker: hit max ${MAX_RESTORATIONS} restorations. Stopping.`);
        break;
      }
      const tabName = normalizeTabName(mi.text);
      const isHiddenInPresets = hiddenTabs.includes(tabName);
      const isUserOrdered = preferredOrder.includes(tabName);
      if (!isHiddenInPresets && isUserOrdered) {
        const alreadyOpen = mainTabPanel.items.items.some((t) => {
          if (!t || t.isDestroyed) return false;
          return normalizeTabName(t.title || t.text || t.tab && t.tab.getText?.()) === tabName;
        });
        if (!alreadyOpen && mi.handler && typeof mi.handler === "function") {
          try {
            APMLogger.info("TabGridOrder", `Triggering restoration handler for: ${tabName}`);
            _allowActiveTabChange = false;
            mi.handler.call(mi.scope || mi, mi);
            restorationHappened = true;
            restorationCount++;
            const win = mainTabPanel.el?.dom?.ownerDocument?.defaultView || window;
            await waitForCondition(() => !win.Ext?.Ajax?.isLoading(), RESTORATION_TIMEOUT_MS);
          } catch (e) {
            APMLogger.warn("TabGridOrder", `Handler restoration failed for "${tabName}"`, e);
          } finally {
            _allowActiveTabChange = true;
          }
        }
      }
    }
    if (restorationHappened) {
      const win = mainTabPanel.el?.dom?.ownerDocument?.defaultView || window;
      await waitForCondition(() => !win.Ext?.Ajax?.isLoading(), AJAX_IDLE_TIMEOUT_MS);
    }
  }
  function reorderTabs(mainTabPanel, preferredOrder, win) {
    if (!preferredOrder.length || mainTabPanel.isDestroyed) return;
    const currentItems = mainTabPanel.items;
    const nameAt = (idx) => {
      const item = currentItems.getAt(idx);
      return item && !item.isDestroyed ? normalizeTabName(item.title || item.text || item.tab?.getText?.() || "") : null;
    };
    const currentNames = /* @__PURE__ */ new Set();
    currentItems.each((item) => {
      if (!item || item.isDestroyed) return;
      currentNames.add(normalizeTabName(item.title || item.text || item.tab?.getText?.() || ""));
    });
    const filteredPreferred = preferredOrder.filter((name) => currentNames.has(name));
    let needsSorting = false;
    for (let i = 0; i < filteredPreferred.length; i++) {
      if (nameAt(i) !== filteredPreferred[i]) {
        needsSorting = true;
        break;
      }
    }
    if (!needsSorting || mainTabPanel.isDestroyed) return;
    let layoutsSuspended = false;
    try {
      win.Ext.suspendLayouts();
      layoutsSuspended = true;
      if (typeof mainTabPanel.suspendEvents === "function") mainTabPanel.suspendEvents(true);
      for (let targetIdx = 0; targetIdx < filteredPreferred.length; targetIdx++) {
        if (mainTabPanel.isDestroyed) break;
        const tabName = filteredPreferred[targetIdx];
        let currentIdx = -1;
        for (let j = targetIdx; j < currentItems.getCount(); j++) {
          if (nameAt(j) === tabName) {
            currentIdx = j;
            break;
          }
        }
        if (currentIdx !== -1 && currentIdx !== targetIdx) {
          const itemToMove = currentItems.getAt(currentIdx);
          if (itemToMove && !itemToMove.isDestroyed) {
            APMLogger.debug("TabGridOrder", `Moving tab "${tabName}" from ${currentIdx} to ${targetIdx}`);
            mainTabPanel.move(itemToMove, targetIdx);
          }
        }
      }
    } catch (e) {
      APMLogger.warn("TabGridOrder", "Tab reorder failed:", e);
    } finally {
      if (typeof mainTabPanel.resumeEvents === "function") mainTabPanel.resumeEvents();
      if (layoutsSuspended) win.Ext.resumeLayouts(true);
    }
  }
  function restoreFocus(mainTabPanel, activeTabName) {
    if (!activeTabName || mainTabPanel.isDestroyed) return;
    const currentActive = mainTabPanel.getActiveTab();
    const currentActiveName = currentActive ? normalizeTabName(currentActive.title || currentActive.text || currentActive.tab && currentActive.tab.getText?.() || "") : null;
    if (currentActiveName !== activeTabName) {
      const targetItem = mainTabPanel.items.items.find(
        (t) => normalizeTabName(t.title || t.text || t.tab && t.tab.getText?.()) === activeTabName
      );
      if (targetItem && !targetItem.isDestroyed && targetItem.tab && targetItem.tab.isVisible()) {
        APMLogger.debug("TabGridOrder", `Restoring active tab to: ${activeTabName}`);
        mainTabPanel.setActiveTab(targetItem);
      }
    }
  }
  function installHooks(mainTabPanel, win, hasSavedPreferences) {
    if (!hasSavedPreferences) return;
    if (mainTabPanel.isDestroyed || mainTabPanel.__apmConsistencyHook) return;
    const originalMove = mainTabPanel.move;
    const originalAdd = mainTabPanel.add;
    const originalInsert = mainTabPanel.insert;
    const originalSetActive = mainTabPanel.setActiveTab;
    if (mainTabPanel.items && !mainTabPanel.items.__apmHooked) {
      const originalCollInsert = mainTabPanel.items.insert;
      mainTabPanel.items.insert = function(idx, item) {
        const result = originalCollInsert.apply(this, arguments);
        if (!_isApplyingTabConsistency) {
          scheduleCleanupPass();
        }
        return result;
      };
      mainTabPanel.items.__apmHooked = true;
    }
    mainTabPanel.move = function(item, toIdx) {
      const result = originalMove.apply(this, arguments);
      if (!_isApplyingTabConsistency) {
        APMLogger.debug("TabGridOrder", `Framework moved "${normalizeTabName(item?.title || item?.text || "")}" to ${toIdx}. Scheduling cleanup.`);
        scheduleCleanupPass();
      }
      return result;
    };
    mainTabPanel.add = function() {
      const result = originalAdd.apply(this, arguments);
      if (!_isApplyingTabConsistency) {
        scheduleCleanupPass();
      }
      return result;
    };
    mainTabPanel.insert = function(idx, item) {
      const result = originalInsert.apply(this, arguments);
      if (!_isApplyingTabConsistency) {
        scheduleCleanupPass();
      }
      return result;
    };
    mainTabPanel.setActiveTab = function(item) {
      if (_allowActiveTabChange) return originalSetActive.apply(this, arguments);
      APMLogger.warn("TabGridOrder", `Blocked focus jump for "${normalizeTabName(item?.title || item?.text || "")}". Focus protected.`);
      return originalSetActive.call(this, this.getActiveTab());
    };
    mainTabPanel.__apmConsistencyHook = true;
  }
  async function applyTabConsistency(retryCount = 0) {
    if (!FeatureFlags.isEnabled("tabGridOrder")) return;
    if (_isApplyingTabConsistency) {
      _pendingRerun = true;
      return;
    }
    const start = performance.now();
    APMLogger.debug("TabGridOrder", `applyTabConsistency called (Retry: ${retryCount})`);
    try {
      _isApplyingTabConsistency = true;
      const result = findMainTabPanel();
      if (!result) return;
      const { tabPanel: mainTabPanel, win } = result;
      const hdrTab = mainTabPanel.items?.items?.find((t) => t.itemId === "HDR");
      if (hdrTab && (!hdrTab.rendered || !hdrTab.getEl?.()?.dom?.innerHTML?.trim())) {
        APMLogger.debug("TabGridOrder", "Record tab panel found but no record loaded (HDR empty). Skipping.");
        return;
      }
      _ignoreNativeEvents = true;
      const gridResult = findMainGrid();
      const funcName = resolveScreenContext(win, gridResult?.grid);
      const presets = getPresets();
      const rawHidden = presets.config.hiddenTabs;
      const hiddenTabs = Array.isArray(rawHidden) ? rawHidden : rawHidden?.[funcName] || [];
      const hasHidden = hiddenTabs.length > 0;
      const siloOrder = presets.config.tabOrders?.[funcName] || presets.config.tabOrders?.["GLOBAL"] || "";
      const preferredOrder = typeof siloOrder === "string" ? siloOrder.split(",").map((s) => s.trim()).filter(Boolean) : Array.isArray(siloOrder) ? siloOrder : [];
      const hasOrder = preferredOrder.length > 0;
      if (!hasOrder && !hasHidden) return;
      if (retryCount < CLEANUP_RETRY_COUNT) {
        const isReady = await waitForCondition(
          () => mainTabPanel.isVisible?.(true) && !!win.Ext.isReady,
          STABILITY_TIMEOUT_MS
        );
        if (!isReady && !mainTabPanel.isVisible?.(true)) return;
        if (!isReady) {
          APMLogger.warn("TabGridOrder", `TabPanel ${mainTabPanel.id} not stable after ${STABILITY_TIMEOUT_MS}ms. Best-effort.`);
        }
      }
      if (!_systemDefaults.tabs[funcName]) {
        const defaultTabs = [];
        mainTabPanel.items.each((item) => {
          if (!item || item.isDestroyed) return;
          const name = normalizeTabName(item.title || item.text || item.tab?.getText?.() || "");
          if (name) defaultTabs.push(name);
        });
        if (defaultTabs.length > 0) _systemDefaults.tabs[funcName] = defaultTabs;
      }
      if (hasOrder && retryCount === 0) {
        APMLogger.info("TabGridOrder", `[Silo: ${funcName}] Preferred Order:`, preferredOrder);
      }
      const activeTab = mainTabPanel.getActiveTab?.() || null;
      const activeTabName = activeTab ? normalizeTabName(activeTab.title || activeTab.text || activeTab.tab && activeTab.tab.getText?.()) : null;
      if (hasHidden || hasOrder) {
        hideAndShowTabs(mainTabPanel, hiddenTabs, preferredOrder);
        await restorePluginTabs(mainTabPanel, hiddenTabs, preferredOrder);
      }
      reorderTabs(mainTabPanel, preferredOrder, win);
      restoreFocus(mainTabPanel, activeTabName);
      if (!mainTabPanel.isDestroyed && typeof mainTabPanel.updateLayout === "function") {
        mainTabPanel.updateLayout();
      }
      installHooks(mainTabPanel, win, hasOrder || hasHidden);
    } finally {
      _isApplyingTabConsistency = false;
      setTimeout(() => {
        _ignoreNativeEvents = false;
      }, SUPPRESSION_HOLD_MS);
      Diagnostics.recordPerformance("tabGridOrder", performance.now() - start);
      if (_pendingRerun) {
        _pendingRerun = false;
        scheduleCleanupPass();
      }
    }
  }
  function resetTabDefaults() {
    const result = findMainTabPanel();
    if (!result) {
      APMLogger.warn("TabGridOrder", "resetTabDefaults: no tab panel found");
      return false;
    }
    const { tabPanel: mainTabPanel, win } = result;
    const funcName = resolveScreenContext(win, findMainGrid()?.grid);
    const defaultOrder = _systemDefaults.tabs[funcName] || APMApi.get("systemDefaultTabOrder");
    _isApplyingTabConsistency = true;
    _ignoreNativeEvents = true;
    try {
      mainTabPanel.items.items.forEach((item) => {
        if (item.isDestroyed || !item.tab) return;
        try {
          if (!item.tab.isVisible()) {
            item.tab.show();
            item.show();
          }
        } catch (e) {
        }
      });
      const tabMenuPlugin = mainTabPanel.plugins?.find?.((p) => p.ptype === "uxtabmenu");
      if (tabMenuPlugin?.tabsMenu?.items) {
        let restored = 0;
        tabMenuPlugin.tabsMenu.items.items.forEach((mi) => {
          if (mi.isDestroyed || !mi.handler || restored >= 5) return;
          const tabName = normalizeTabName(mi.text);
          const alreadyOpen = mainTabPanel.items.items.some(
            (t) => !t.isDestroyed && normalizeTabName(t.title || t.text || t.tab?.getText?.()) === tabName
          );
          if (!alreadyOpen) {
            try {
              mi.handler.call(mi.scope || mi, mi);
              restored++;
            } catch (e) {
            }
          }
        });
      }
      if (defaultOrder && defaultOrder.length > 0) {
        reorderTabs(mainTabPanel, defaultOrder, win);
      }
      if (!mainTabPanel.isDestroyed) {
        if (typeof mainTabPanel.updateLayout === "function") mainTabPanel.updateLayout();
        if (mainTabPanel.getTabBar?.()?.updateLayout) mainTabPanel.getTabBar().updateLayout();
      }
      APMLogger.info("TabGridOrder", `Tabs reset to system defaults for ${funcName}`);
      return true;
    } catch (e) {
      APMLogger.warn("TabGridOrder", "resetTabDefaults failed:", e);
      return false;
    } finally {
      _isApplyingTabConsistency = false;
      setTimeout(() => {
        _ignoreNativeEvents = false;
      }, SUPPRESSION_HOLD_MS);
    }
  }
  function resetColumnDefaults() {
    const result = findMainGrid();
    if (!result || !result.grid.headerCt || result.grid.headerCt.isDestroyed) {
      APMLogger.warn("TabGridOrder", "resetColumnDefaults: no grid found");
      return false;
    }
    const { grid: mainGrid, win } = result;
    const funcName = resolveScreenContext(win, mainGrid);
    const defaultOrder = _systemDefaults.columns[funcName];
    if (!defaultOrder || defaultOrder.length === 0) {
      APMLogger.info("TabGridOrder", `No captured column defaults for ${funcName}. Will take effect on next page load.`);
      return false;
    }
    _suppressResizeUntil = Date.now() + 5e3;
    try {
      const didMove = reorderColumns(mainGrid.headerCt, defaultOrder, win);
      if (didMove && !mainGrid.isDestroyed && mainGrid.getView?.() && !mainGrid.getView().isDestroyed) {
        mainGrid.getView().refresh();
        debouncedProcessColorCodeGrid(win.document);
      }
      APMLogger.info("TabGridOrder", `Columns reset to system defaults for ${funcName}`);
      return true;
    } catch (e) {
      APMLogger.warn("TabGridOrder", "resetColumnDefaults failed:", e);
      return false;
    }
  }
  function invalidateTabCache() {
    _cachedColumns = null;
    _cachedColumnsTime = 0;
    _cachedTabs = null;
    _cachedTabsTime = 0;
    _tabNameCache.clear();
  }
  if (typeof window !== "undefined") {
    APMApi.register("applyGridConsistency", applyGridConsistency);
    APMApi.register("applyTabConsistency", applyTabConsistency);
    window.addEventListener("APM_PRESETS_SYNC_REQUIRED", () => {
      if (!FeatureFlags.isEnabled("tabGridOrder")) return;
      try {
        applyTabConsistency();
      } catch (e) {
        APMLogger.warn("TabGridOrder", "applyTabConsistency failed during sync:", e);
      }
      try {
        applyGridConsistency();
      } catch (e) {
        APMLogger.warn("TabGridOrder", "applyGridConsistency failed during sync:", e);
      }
    });
  }

  // src/modules/autofill/autofill-engine.js
  init_utils();
  init_dom_helpers();
  init_logger();
  init_toast();
  init_state();
  init_scheduler();
  init_feature_flags();
  init_eam_query();
  var _autofillLock = false;
  var _lastKnownTitle = "";
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
    if (!formPanel || value === void 0 || value === null) return false;
    const field = activeExt.ComponentQuery.query(`[name="${fieldName}"]`, formPanel)[0] || activeExt.ComponentQuery.query(`[name="${fieldName}"]`)[0];
    if (field) {
      if (field.readOnly || field.disabled) APMLogger.debug("AutoFill", "Overriding protected field:", field.name || field.itemId);
      if (typeof field.setReadOnly === "function") field.setReadOnly(false);
      if (typeof field.setDisabled === "function") field.setDisabled(false);
      field.setValue(value);
      const record = formPanel.getRecord();
      if (record) {
        record.set(fieldName, value);
      }
      field.fireEvent("change", field, value);
      field.fireEvent("blur", field);
      return true;
    }
    return false;
  }
  async function setEamLovFieldDirect(activeExt, formPanel, name, value) {
    if (!activeExt || !formPanel || value === void 0 || value === null) return false;
    const field = activeExt.ComponentQuery.query(`[name="${name}"]`, formPanel)[0] || activeExt.ComponentQuery.query(`[name="${name}"]`)[0];
    if (field) {
      if (field.readOnly || field.disabled) APMLogger.debug("AutoFill", "Overriding protected field:", field.name || field.itemId);
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
    if (!ext) return searchTerm;
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
    try {
      const { records } = await eamQuery({
        endpoint: "OSEQPP.xmlhttp",
        gridName: "LVOBJL",
        // gridId and dataspyId intentionally omitted — stripped by eamQuery's
        // undefined filter. Manual LOV uses numeric IDs (67, 101718) that are
        // instance-specific; omitting lets the server resolve from GRID_NAME.
        userFunction: "WSJOBS",
        systemFunction: "OSEQPP",
        // No filters — avoids MADDON params that manual LOV search doesn't use
        includePagination: false,
        // Manual LOV doesn't send pagination params
        extraParams: {
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
          LOV_ALIAS_TYPE_5: "text"
        }
      });
      if (records && records.length > 0) return records[0].equipmentcode;
      return searchTerm;
    } catch (e) {
      APMLogger.error("AutoFill", "searchEquipmentNative error:", e);
      return searchTerm;
    }
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
    if (!win.Ext || !win.Ext.ComponentQuery) return false;
    const allWindows = win.Ext.ComponentQuery.query("window:not([destroyed=true])").filter(
      (w) => w.isVisible && w.isVisible() && !w.id?.includes("recordview")
    );
    let dismissed = false;
    for (const box of allWindows) {
      const btn = win.Ext.ComponentQuery.query("button[text=Yes]:not([destroyed=true])", box)[0] || win.Ext.ComponentQuery.query("button[text=OK]:not([destroyed=true])", box)[0] || win.Ext.ComponentQuery.query("button[text=Ok]:not([destroyed=true])", box)[0];
      if (btn && !btn.disabled && btn.isVisible()) {
        APMLogger.info("AutoFill", `Auto-clicking "${btn.text}" on EAM popup: ${box.title || "Untitled"}`);
        if (btn.handler) btn.handler.call(btn.scope || btn, btn);
        else btn.fireEvent("click", btn);
        await delay(300);
        dismissed = true;
      }
    }
    return dismissed;
  }
  async function injectExtJSFieldsNative(data) {
    if (_autofillLock) {
      APMLogger.warn("AutoFill", "Skipping concurrent autofill invocation");
      return;
    }
    _autofillLock = true;
    try {
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
      if (data.woTitle) {
        await setEamLovFieldDirect(activeExt, mainForm, "description", data.woTitle);
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
        await handleEamPopups(activeWin);
        await waitForAjax(activeWin);
        await delay(150);
      }
      showToast("Injecting Data Model...", "#f1c40f", true);
      const FIELD_MAP = { exec: "udfchar13", safety: "udfchar24", close: "udfnote01" };
      if (data.exec) setExtModelDirect(activeExt, mainForm, FIELD_MAP.exec, data.exec);
      if (data.safety) setExtModelDirect(activeExt, mainForm, FIELD_MAP.safety, data.safety);
      if (data.close) setExtModelDirect(activeExt, mainForm, FIELD_MAP.close, data.close);
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
        return;
      }
      await waitForAjax(activeWin);
    } finally {
      _autofillLock = false;
    }
  }
  async function executeChecklistsNative(data, currentActivity = null) {
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
        if (waited > 300 && (!activeExt.Ajax || !activeExt.Ajax.isLoading())) break;
        if (waited === 800) showToast("Waiting for Grid Data...", "#f39c12", true);
        await delay(50);
        waited += 50;
      }
    };
    if (!mainTabPanel.isDestroyed && mainTabPanel.getActiveTab() !== checklistContainer) {
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
    const resolveCheckboxFields = (record) => {
      let yesField = "yes", noField = "no";
      if (!record.data.hasOwnProperty("yes")) {
        const boolKeys = Object.keys(record.data).filter((k) => k.startsWith("udfchkbox") || k.includes("chkbox"));
        if (boolKeys.length >= 2) {
          yesField = boolKeys[0];
          noField = boolKeys[1];
        }
      }
      return { yesField, noField };
    };
    const do1Tech = async () => {
      if (!lotoMode || lotoMode === "none") return;
      const isReady = await switchActivity("1");
      if (!isReady) return;
      let chkGrid = getGridStore();
      if (chkGrid && chkGrid.getStore().getCount() > 0) {
        let modifiedCount = 0;
        let needsSaving = false;
        chkGrid.getStore().each((record) => {
          const { yesField, noField } = resolveCheckboxFields(record);
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
    };
    const do10Tech = async () => {
      if (pmChecks <= 0) return;
      showToast("Loading 10-Tech Activity...", "#3498db", true);
      const isReady = await switchActivity("10");
      if (!isReady) return;
      let pmGrid = getGridStore();
      if (pmGrid && pmGrid.getStore().getCount() > 0) {
        let pmModified = 0;
        let needsSaving = false;
        pmGrid.getStore().each((record, index) => {
          if (index < pmChecks) {
            const { yesField, noField } = resolveCheckboxFields(record);
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
    };
    if (currentActivity === "10") {
      APMLogger.info("AutoFill", "Starting from 10-Tech (context-aware)");
      await do10Tech();
      await do1Tech();
    } else {
      await do1Tech();
      await do10Tech();
    }
    try {
      const hdrContainers = activeExt.ComponentQuery.query("uxtabcontainer[itemId=HDR]");
      if (hdrContainers.length > 0) {
        const freshTabPanel = hdrContainers[0].up("tabpanel");
        const tp = freshTabPanel && !freshTabPanel.isDestroyed ? freshTabPanel : !mainTabPanel.isDestroyed ? mainTabPanel : null;
        if (tp) {
          tp.setActiveTab(hdrContainers[0]);
          await delay(300);
          await localWaitForAjax();
        }
      }
    } catch (e) {
      APMLogger.warn("AutoFill", "Could not return to Record View tab:", e);
    }
  }
  function detectActiveTab() {
    const allDocs = getAccessibleDocs();
    const TAB_MAP = {
      "record view": "HDR",
      "checklist": "ACK",
      "book labor": "LABOR"
    };
    let detectedTab = null;
    for (const doc of allDocs) {
      const activeTabEls = doc.querySelectorAll(".x-tab-active");
      for (const tabEl of activeTabEls) {
        const innerEl = tabEl.querySelector(".x-tab-inner") || tabEl;
        const text = (innerEl.textContent || "").trim().toLowerCase();
        for (const [name, tabId] of Object.entries(TAB_MAP)) {
          if (text === name) {
            detectedTab = tabId;
            break;
          }
        }
        if (detectedTab) break;
      }
      if (detectedTab) break;
    }
    APMLogger.debug("AutoFill", `DOM tab scan result: ${detectedTab || "no record sub-tab found"}`);
    let tabPanel = null, ctxWin = null;
    for (const win of getExtWindows()) {
      try {
        if (!win.Ext?.ComponentQuery) continue;
        const hdrContainers = win.Ext.ComponentQuery.query("uxtabcontainer[itemId=HDR]");
        if (hdrContainers.length > 0) {
          tabPanel = hdrContainers[0].up("tabpanel");
          ctxWin = win;
          break;
        }
      } catch (e) {
      }
    }
    if (detectedTab === "ACK") {
      let activity = null;
      for (const win of getExtWindows()) {
        try {
          if (!win.Ext?.ComponentQuery) continue;
          const combos = win.Ext.ComponentQuery.query("combobox[name=activity]");
          if (combos.length > 0) {
            const rawVal = String(combos[0].getValue() || "").trim();
            const dispVal = String(combos[0].getRawValue() || "").trim();
            if (rawVal === "10" || dispVal.startsWith("10 ") || dispVal.startsWith("10-") || dispVal.startsWith("10 -")) activity = "10";
            else if (rawVal === "1" || dispVal.startsWith("1 ") || dispVal.startsWith("1-") || dispVal.startsWith("1 -")) activity = "1";
            APMLogger.debug("AutoFill", `Activity detected: val="${rawVal}", disp="${dispVal}" \u2192 ${activity}`);
            break;
          }
        } catch (e) {
        }
      }
      return { tab: "ACK", activity, win: ctxWin, tabPanel };
    }
    if (detectedTab === "HDR") {
      return { tab: "HDR", activity: null, win: ctxWin, tabPanel };
    }
    if (detectedTab === "LABOR") {
      return { tab: "LABOR", activity: null, win: ctxWin, tabPanel };
    }
    return { tab: detectedTab || "UNKNOWN", activity: null, win: ctxWin, tabPanel };
  }
  function showDefaultProfilePicker(profiles) {
    const existing = document.getElementById("apm-autofill-picker");
    if (existing) existing.remove();
    const overlay = el("div", {
      id: "apm-autofill-picker",
      style: { position: "fixed", inset: "0", zIndex: "1000001", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.4)" }
    }, [
      el("div", {
        className: "apm-ui-panel",
        style: { background: "var(--apm-surface-0)", border: "1px solid var(--apm-border-strong)", borderRadius: "var(--apm-radius-lg)", padding: "12px", minWidth: "220px", maxWidth: "320px", boxShadow: "var(--apm-shadow)" }
      }, [
        el("div", {
          style: { fontSize: "var(--apm-text-md)", fontWeight: "600", color: "var(--apm-accent)", marginBottom: "10px" }
        }, "Select Template"),
        ...profiles.map((prof) => {
          const btn = el("button", {
            style: { display: "block", width: "100%", padding: "8px 12px", marginBottom: "4px", background: "var(--apm-surface-raised)", border: "1px solid var(--apm-border)", borderRadius: "var(--apm-radius-sm)", color: "var(--apm-text-primary)", cursor: "pointer", fontSize: "var(--apm-text-sm)", textAlign: "left", transition: "all 0.15s" }
          }, prof.name + (prof.woTitle ? ` \u2014 ${prof.woTitle}` : ""));
          btn.onmouseenter = () => {
            btn.style.borderColor = "var(--apm-accent)";
            btn.style.background = "var(--apm-accent-subtle)";
          };
          btn.onmouseleave = () => {
            btn.style.borderColor = "var(--apm-border)";
            btn.style.background = "var(--apm-surface-raised)";
          };
          btn.onclick = () => {
            overlay.remove();
            executeAutoFillFlow("", prof);
          };
          return btn;
        })
      ])
    ]);
    overlay.onclick = (e) => {
      if (e.target === overlay) overlay.remove();
    };
    overlay.addEventListener("keydown", (e) => {
      if (e.key === "Escape") overlay.remove();
    });
    overlay.tabIndex = -1;
    document.body.appendChild(overlay);
    overlay.focus();
  }
  async function executeAutoFillFlow(fallbackTitle, preselectedProfile) {
    if (getIsAutoFillRunning()) return;
    setIsAutoFillRunning(true);
    try {
      let gridNavWin = null;
      for (const win of getExtWindows()) {
        if (!win.Ext?.ComponentQuery || gridNavWin) break;
        for (const grid of win.Ext.ComponentQuery.query("gridpanel")) {
          if (grid.isDestroyed || !grid.rendered) continue;
          if (grid.isVisible && !grid.isVisible(true)) continue;
          const store = grid.getStore?.();
          if (!store) continue;
          const sid = (store.storeId || "").toLowerCase();
          if (!sid.includes("wsjobs") && !sid.includes("ctjobs")) continue;
          const sel = grid.getSelectionModel?.().getSelection?.();
          if (!sel?.length) continue;
          const view = grid.getView();
          const rowIndex = store.indexOf(sel[0]);
          const rowEl = view.getRow?.(rowIndex) ?? view.getNode?.(rowIndex);
          APMLogger.info("AutoFill", `Visible WO grid with selection \u2014 navigating to record (grid: ${grid.id})`);
          grid.fireEvent("itemdblclick", grid, sel[0], rowEl, rowIndex, {});
          gridNavWin = win;
          break;
        }
      }
      if (gridNavWin) {
        await waitForAjax(gridNavWin);
        for (let i = 0; i < 40; i++) {
          await delay(250);
          let formReady = false;
          for (const win of getExtWindows()) {
            try {
              if (!win.Ext?.ComponentQuery) continue;
              const forms = win.Ext.ComponentQuery.query("form[id*=recordview]");
              if (forms.some((f) => f.rendered && f.el && !f.isDestroyed)) {
                formReady = true;
                break;
              }
            } catch (e) {
            }
          }
          if (formReady) {
            APMLogger.info("AutoFill", `Record view form ready after ${(i + 1) * 250}ms`);
            await delay(200);
            break;
          }
        }
      } else {
        APMLogger.info("AutoFill", "No visible WO grid with selection \u2014 assuming record view");
      }
      const context = gridNavWin ? { tab: "HDR", activity: null, win: gridNavWin, tabPanel: null } : detectActiveTab();
      APMLogger.info("AutoFill", `Context: tab=${context.tab}, activity=${context.activity}${gridNavWin ? " (post-grid-nav, forced HDR)" : ""}`);
      loadPresets();
      let activeTitle = "";
      const allDocs = getAccessibleDocs();
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
      const titleLower = activeTitle.toLowerCase();
      let matchedData = preselectedProfile || null;
      if (!matchedData && !activeTitle && getDefaultProfiles().length === 0) {
        showToast("Error: Could not read WO Title.", "#e74c3c");
        setIsAutoFillRunning(false);
        return;
      }
      const presets = getPresets();
      if (!matchedData) {
        for (const key in presets.autofill) {
          const kwString = presets.autofill[key].keyword;
          if (!kwString) continue;
          const keywords = kwString.split(",").map((k) => k.trim().toLowerCase()).filter((k) => k.length > 0);
          if (keywords.some((k) => titleLower.includes(k))) {
            matchedData = presets.autofill[key];
            break;
          }
        }
      }
      if (!matchedData && !titleLower) {
        const defaults = getDefaultProfiles();
        if (defaults.length === 1) {
          matchedData = defaults[0];
          APMLogger.info("AutoFill", `Using default profile "${defaults[0].name}" for blank record`);
        } else if (defaults.length > 1) {
          APMLogger.info("AutoFill", `${defaults.length} default profiles \u2014 showing picker`);
          setIsAutoFillRunning(false);
          showDefaultProfilePicker(defaults);
          return;
        }
      }
      if (!matchedData) {
        const shortTitle = activeTitle.length > 25 ? activeTitle.substring(0, 25) + "..." : activeTitle;
        showToast(`No match for: "${shortTitle}"`, "#e74c3c");
        setIsAutoFillRunning(false);
        return;
      }
      showToast(`Auto-Filling Template: ${matchedData.keyword || matchedData.woTitle || matchedData.name}`, "#f1c40f", true);
      const needsRecordFill = !!(matchedData.org || matchedData.type || matchedData.eq || matchedData.exec || matchedData.safety || matchedData.close || matchedData.prob || matchedData.fail || matchedData.cause || matchedData.assign || matchedData.status || matchedData.start || matchedData.end || matchedData.laborHours && parseFloat(matchedData.laborHours) > 0);
      const needsChecklist = matchedData.lotoMode && matchedData.lotoMode !== "none" || matchedData.pmChecks > 0;
      const hasLaborHours = matchedData.laborHours && parseFloat(matchedData.laborHours) > 0;
      if (context.tab === "ACK") {
        APMLogger.info("AutoFill", `Starting from checklist tab, activity=${context.activity} (context-aware)`);
        if (needsChecklist) {
          await executeChecklistsNative(matchedData, context.activity);
        }
        if (needsRecordFill) {
          APMLogger.info("AutoFill", "Switching to HDR for record fill after checklists");
          await ensureHDRTab();
          await delay(300);
          await injectExtJSFieldsNative(matchedData);
        }
      } else if (context.tab === "LABOR" && hasLaborHours) {
        APMLogger.info("AutoFill", "Starting from Book Labor tab \u2014 booking labor first");
        showToast(`Auto-Booking ${matchedData.laborHours}h Labor...`, "#1abc9c", true);
        await executeLaborBookingNative(parseFloat(matchedData.laborHours), context.win);
        const dataWithoutLabor = { ...matchedData, laborHours: 0 };
        if (needsRecordFill) {
          APMLogger.info("AutoFill", "Switching to HDR for record fill after labor");
          await ensureHDRTab();
          await delay(300);
          await injectExtJSFieldsNative(dataWithoutLabor);
        }
        if (needsChecklist) {
          await executeChecklistsNative(matchedData);
        }
      } else {
        APMLogger.info("AutoFill", `Starting from ${context.tab} tab`);
        if (needsRecordFill) {
          if (context.tab !== "HDR") {
            await ensureHDRTab();
            await delay(300);
          }
          await injectExtJSFieldsNative(matchedData);
        }
        if (needsChecklist) {
          await executeChecklistsNative(matchedData);
        }
      }
      showToast("Auto-Fill Complete.", "#1abc9c");
    } catch (e) {
      APMLogger.error("AutoFill", "Critical Error in executeAutoFillFlow:", e);
      showToast("Script Error (See Console)", "#e74c3c");
    } finally {
      setIsAutoFillRunning(false);
    }
  }
  async function ensureHDRTab() {
    const wins = getExtWindows();
    for (const win of wins) {
      try {
        if (!win.Ext || !win.Ext.ComponentQuery) continue;
        const hdrContainers = win.Ext.ComponentQuery.query("uxtabcontainer[itemId=HDR]");
        if (hdrContainers.length > 0) {
          const hdrTab = hdrContainers[0];
          const tabPanel = hdrTab.up("tabpanel");
          if (tabPanel && tabPanel.getActiveTab() !== hdrTab) {
            APMLogger.info("AutoFill", "Switching to Record View (HDR) tab...");
            tabPanel.setActiveTab(hdrTab);
            await delay(250);
            await waitForAjax(win);
          }
          break;
        }
        const rvForms = win.Ext.ComponentQuery.query("form[id*=recordview]") || [];
        const rvForm = rvForms.find((f) => f.rendered && !f.isDestroyed);
        if (rvForm) {
          let tabItem = rvForm;
          let tabPanel = null;
          while (tabItem.ownerCt) {
            tabPanel = tabItem.ownerCt.isXType?.("tabpanel") ? tabItem.ownerCt : null;
            if (tabPanel) break;
            tabItem = tabItem.ownerCt;
          }
          if (tabPanel && tabPanel.getActiveTab() !== tabItem) {
            APMLogger.info("AutoFill", `Switching to Record View tab (${tabItem.id})...`);
            tabPanel.setActiveTab(tabItem);
            await delay(250);
          }
        }
      } catch (e) {
        APMLogger.error("AutoFill", "Error switching to record view tab:", e);
      }
    }
  }
  function injectAutoFillTriggers() {
    if (!FeatureFlags.isEnabled("autoFill")) return;
    if (getIsAutoFillRunning()) {
      APMLogger.debug("AutoFill", "Scan skipped: AutoFill is currently running");
      return;
    }
    APMLogger.debug("AutoFill", "--- Starting Scan ---");
    const allDocs = getAccessibleDocs();
    const presets = getPresets();
    allDocs.forEach((d) => {
      try {
        if (!d || !d.body) return;
        const win = d.defaultView;
        if (!win || !win.Ext) return;
        const rvForms = win.Ext.ComponentQuery.query("form[id*=recordview]") || win.Ext.ComponentQuery.query("form[name=recordview]");
        let foundTitleLocal = "";
        const rvForm = rvForms.find((f) => f.rendered && !f.isDestroyed && f.isVisible?.(true));
        APMLogger.debug("AutoFill", `[${d.location?.pathname}] Forms found: ${rvForms?.length || 0}, visible form: ${rvForm ? rvForm.id : "NONE"}`);
        if (rvForm) {
          const record = rvForm.getRecord?.();
          if (record) {
            foundTitleLocal = (record.get("description") || "").trim().toLowerCase();
          }
          if (!foundTitleLocal) {
            const descField = rvForm.getForm?.().findField?.("description");
            if (descField) foundTitleLocal = (descField.getValue() || "").trim().toLowerCase();
          }
        }
        if (!foundTitleLocal) {
          const grids = win.Ext.ComponentQuery.query("gridpanel");
          for (const grid of grids) {
            if (grid.isDestroyed || !grid.rendered) continue;
            try {
              const sel = grid.getSelectionModel?.().getSelection?.();
              if (sel && sel.length > 0) {
                const title = (sel[0].get("description") || sel[0].get("DESCRIPTION") || "").trim().toLowerCase();
                if (title) {
                  foundTitleLocal = title;
                  break;
                }
              }
            } catch (e) {
            }
          }
        }
        APMLogger.debug("AutoFill", `[${d.location?.pathname}] Title resolved: "${foundTitleLocal}"`);
        if (foundTitleLocal) _lastKnownTitle = foundTitleLocal;
        const existingCmp = win.Ext.getCmp("apm-btn-do-autofill");
        const existingDomBtn = d.getElementById("apm-btn-do-autofill");
        const removeExisting = () => {
          if (existingCmp && !existingCmp.isDestroyed) existingCmp.destroy();
          else if (existingDomBtn) existingDomBtn.remove();
        };
        const hasExisting = () => {
          if (existingCmp && !existingCmp.isDestroyed && existingCmp.getEl?.()?.dom && d.body.contains(existingCmp.getEl().dom)) return true;
          if (existingDomBtn && d.body.contains(existingDomBtn)) return true;
          return false;
        };
        let hasMatch = false;
        if (foundTitleLocal) {
          for (const key in presets.autofill) {
            const kwString = presets.autofill[key].keyword;
            if (!kwString) continue;
            const keywords = kwString.split(",").map((k) => k.trim().toLowerCase()).filter(Boolean);
            if (keywords.some((k) => foundTitleLocal === k || foundTitleLocal.includes(k))) {
              hasMatch = true;
              break;
            }
          }
        }
        if (!hasMatch && !foundTitleLocal && rvForm) {
          const defaults = getDefaultProfiles();
          if (defaults.length > 0) {
            hasMatch = true;
            APMLogger.debug("AutoFill", `Blank record detected \u2014 ${defaults.length} default profile(s) available`);
          }
        }
        if (!hasMatch) {
          if (existingCmp || existingDomBtn) {
            APMLogger.debug("AutoFill", `Removing button: no match for "${foundTitleLocal}"`);
            removeExisting();
          }
          return;
        }
        if (hasExisting()) return;
        removeExisting();
        let parentContainer = null;
        let insertIdx = -1;
        if (rvForm) {
          const recordPanel = rvForm.up("panel");
          if (recordPanel) {
            const dockedToolbars = recordPanel.getDockedItems?.('toolbar[dock="top"]') || [];
            for (const tb of dockedToolbars) {
              if (!tb.rendered || tb.isDestroyed || !tb.isVisible?.()) continue;
              if (tb.items && tb.items.getCount() > 0) {
                parentContainer = tb;
                insertIdx = tb.items.getCount();
                APMLogger.debug("AutoFill", `Strategy 1a: Found record toolbar via getDockedItems (${tb.id})`);
                break;
              }
            }
          }
        }
        if (!parentContainer) {
          const anchorIconEl = d.querySelector(".toolbarExpandRight");
          if (anchorIconEl) {
            const anchorDomBtn = anchorIconEl.closest(".x-btn");
            if (anchorDomBtn?.id) {
              const anchorCmp = win.Ext.getCmp(anchorDomBtn.id);
              if (anchorCmp) {
                const container = anchorCmp.up("toolbar") || anchorCmp.up("container");
                if (container) {
                  parentContainer = container;
                  let directChild = anchorCmp;
                  while (directChild.ownerCt && directChild.ownerCt !== parentContainer) {
                    directChild = directChild.ownerCt;
                  }
                  insertIdx = parentContainer.items.indexOf(directChild) + 1;
                  APMLogger.debug("AutoFill", `Strategy 1b: Found toolbar via .toolbarExpandRight (${container.id})`);
                }
              }
            }
          }
        }
        if (!parentContainer) {
          const tabPanels = win.Ext.ComponentQuery.query("tabpanel, uxtabpanel");
          const mainTabPanel = tabPanels.find(
            (tp) => tp.rendered && !tp.isDestroyed && tp.items?.items?.some((t) => {
              const txt = t.title || t.text || "";
              return /Activities|Checklist|Comments/i.test(txt);
            })
          );
          const tabBarEl = mainTabPanel?.tabBar?.el?.dom;
          if (!tabBarEl) return;
          APMLogger.info("AutoFill", `Injecting AutoFill button (tab bar fallback) for: "${foundTitleLocal}" in ${d.location?.pathname}`);
          const btn = d.createElement("button");
          btn.id = "apm-btn-do-autofill";
          btn.textContent = "Auto Fill";
          btn.className = "apm-af-trigger";
          btn.style.position = "absolute";
          btn.style.right = "10px";
          btn.style.top = "50%";
          btn.style.transform = "translateY(-50%)";
          btn.addEventListener("click", (e) => {
            e.preventDefault();
            executeAutoFillFlow(foundTitleLocal);
          });
          if (win.getComputedStyle(tabBarEl).position === "static") tabBarEl.style.position = "relative";
          tabBarEl.appendChild(btn);
          return;
        }
        APMLogger.info("AutoFill", `Injecting AutoFill button for: "${foundTitleLocal}" at index ${insertIdx} in ${d.location?.pathname}`);
        parentContainer.insert(insertIdx, {
          xtype: "component",
          id: "apm-btn-do-autofill",
          margin: "0 4px",
          // Static HTML only — never interpolate user data here
          html: '<button class="apm-af-trigger" style="vertical-align:middle;">Auto Fill</button>',
          listeners: {
            afterrender(cmp) {
              const btn = cmp.el.dom.querySelector("button");
              if (!btn) return;
              btn.addEventListener("click", (e) => {
                e.preventDefault();
                executeAutoFillFlow(foundTitleLocal);
              });
            }
          }
        });
      } catch (e) {
        APMLogger.warn("AutoFill", "Trigger injection error:", e);
      }
    });
  }
  function initAutoFillObserver() {
    APMLogger.info("AutoFill", "initAutoFillObserver entry");
    if (!FeatureFlags.isEnabled("autoFill")) {
      APMLogger.warn("AutoFill", "initAutoFillObserver exited: flag disabled");
      return;
    }
    APMLogger.info("AutoFill", "initAutoFillObserver proceeding");
    injectAutoFillTriggers();
    APMScheduler.registerTask("autofill-title-watch", 2e3, () => {
      if (!FeatureFlags.isEnabled("autoFill")) return;
      for (const win of getExtWindows()) {
        try {
          if (!win.Ext?.ComponentQuery) continue;
          const rvForms = win.Ext.ComponentQuery.query("form[id*=recordview]");
          const rvForm = rvForms.find((f) => f.rendered && !f.isDestroyed && f.isVisible?.(true));
          if (!rvForm) continue;
          let currentTitle = "";
          const record = rvForm.getRecord?.();
          if (record) currentTitle = (record.get("description") || "").trim().toLowerCase();
          if (!currentTitle) {
            const descField = rvForm.getForm?.().findField?.("description");
            if (descField) currentTitle = (descField.getValue() || "").trim().toLowerCase();
          }
          if (currentTitle && currentTitle !== _lastKnownTitle) {
            APMLogger.debug("AutoFill", `Title changed: "${_lastKnownTitle}" \u2192 "${currentTitle}"`);
            injectAutoFillTriggers();
          }
          return;
        } catch (e) {
        }
      }
    }, { isIdle: false });
    APMScheduler.registerTask("autofill-button-poll", 3e4, () => {
      if (!FeatureFlags.isEnabled("autoFill")) return;
      APMLogger.debug("AutoFill", "Task: autofill-button-poll (safety net)");
      injectAutoFillTriggers();
    }, { isIdle: false });
  }

  // src/core/ext-consistency.js
  init_context();
  init_ajax_hooks();
  init_api();
  init_scheduler();
  var injectionTO = null;
  var _boundWindows = /* @__PURE__ */ new WeakSet();
  var _burstActive = false;
  var ExtConsistencyManager = {
    init() {
      APMApi.register("bindConsistencyListeners", () => this.bindAll());
      APMApi.register("triggerDiscoveryBurst", () => this.triggerDiscoveryBurst());
      APMApi.register("triggerResponsiveInjections", () => this.triggerInjections());
      this.registerGlobalAjaxHooks();
    },
    registerGlobalAjaxHooks() {
      AjaxHooks.onRequestException("auth-redirect", (win, conn, response) => {
        if (response && response.status === 401 && apmGeneralSettings.autoRedirect) {
          APMLogger.info("APM Master", "Instant timeout detected (401). Auto-redirecting...");
          APMApi.forceRedirect?.();
        }
      });
      AjaxHooks.onRequestComplete("login-detect", (win, conn, response) => {
        if (response && response.responseText && apmGeneralSettings.autoRedirect) {
          const text = response.responseText.toLowerCase();
          if (text.includes("logindisp") || text.includes("octave.com") || text.includes("okta.com")) {
            APMLogger.info("APM Master", "Login redirect detected in Ajax response. Auto-redirecting...");
            APMApi.forceRedirect?.();
          }
        }
      });
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
        if (!isWindowAccessible(win)) continue;
        try {
          if (_boundWindows.has(win)) {
            if (win.Ext) debouncedProcessColorCodeGrid(win.document);
            continue;
          }
          AjaxHooks.install(win);
          this.setupComponentWatcher(win);
          this.setupComponentListeners(win);
          if (win.Ext) {
            debouncedProcessColorCodeGrid(win.document);
          }
          _boundWindows.add(win);
        } catch (e) {
          APMLogger.debug("ExtConsistency", "Error binding to window:", e);
        }
      }
    },
    /**
     * Triggers a temporary high-frequency discovery pulse (Burst Mode)
     * after AJAX activity or major UI changes.
     */
    triggerDiscoveryBurst() {
      if (_burstActive) return;
      _burstActive = true;
      const scheduler = APMScheduler;
      if (!scheduler) {
        this.bindAll();
        _burstActive = false;
        return;
      }
      let iterations = 10;
      APMLogger.debug("ExtConsistency", "Starting Discovery Burst Mode...");
      scheduler.removeTask("grid-discovery-burst");
      scheduler.registerTask("grid-discovery-burst", 500, () => {
        this.bindAll();
        iterations--;
        if (iterations <= 0) {
          scheduler.removeTask("grid-discovery-burst");
          _burstActive = false;
          APMLogger.debug("ExtConsistency", "Discovery Burst Mode complete.");
        }
      }, { executeImmediately: true });
    },
    /**
     * Injects a prototype override to detect new components (grids/tabs) instantly
     * as they are initialized by ExtJS.
     */
    setupComponentWatcher(win) {
      if (!win.Ext || !win.Ext.Component || win[FLAGS.CONSISTENCY_BOUND + "_watcher"]) return;
      const self = this;
      const originalInit = win.Ext.Component.prototype.initComponent;
      win.Ext.Component.prototype.initComponent = function() {
        const res = originalInit.apply(this, arguments);
        if (this.isXType) {
          if (this.isXType("gridpanel") || this.isXType("tabpanel")) {
            setTimeout(() => {
              if (this.isDestroyed) return;
              if (this.isXType("gridpanel")) {
                self.bindGridListeners(this);
              } else {
                self.bindTabListeners(this);
              }
            }, 100);
          }
        }
        return res;
      };
      win[FLAGS.CONSISTENCY_BOUND + "_watcher"] = true;
    },
    _extractHasMoreFromXml(rawData) {
      const xmlDoc = typeof rawData === "string" ? new DOMParser().parseFromString(rawData, "text/xml") : rawData;
      const metaNode = xmlDoc.querySelector?.("METADATA") || xmlDoc;
      return metaNode.getAttribute?.("MORERECORDPRESENT") === "+" || metaNode.querySelector?.("MORERECORDPRESENT")?.textContent === "+";
    },
    _extractHasMoreFromJson(rawData, result) {
      const data = result.rawData || rawData;
      const metadata = data?.pageData?.grid?.GRIDRESULT?.GRID?.METADATA || data?.GRIDRESULT?.GRID?.METADATA || data?.METADATA || data?.pageData?.METADATA || data || {};
      return metadata.MORERECORDPRESENT === "+" || metadata.MORERECORDPRESENT === "Y" || metadata.MORERECORDPRESENT === "YES";
    },
    hookStoreReader(store) {
      if (!store || store.__apmReaderHook) return;
      const proxy = store.getProxy();
      const reader = proxy?.getReader();
      if (!reader) return;
      const self = this;
      const originalRead = reader.read;
      reader.read = function(response) {
        const result = originalRead.apply(this, arguments);
        try {
          const rawData = response.responseXML || response.responseText || response;
          let hasMore = false;
          if (rawData.nodeType === 9 || rawData.nodeType === 1 || typeof rawData === "string" && rawData.includes("<?xml")) {
            hasMore = self._extractHasMoreFromXml(rawData);
          } else if (result?.rawData || typeof rawData === "object") {
            hasMore = self._extractHasMoreFromJson(rawData, result);
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
      if (tabPanels.length > 0) APMLogger.debug("ExtConsistency", `Found ${tabPanels.length} tabpanels in window ${win.location?.pathname}`);
      tabPanels.forEach((tp) => {
        this.captureTabDefaults(tp);
        this.bindTabListeners(tp);
      });
      const grids = win.Ext.ComponentQuery.query("gridpanel");
      if (grids.length > 0) APMLogger.debug("ExtConsistency", `Found ${grids.length} grids in window ${win.location?.pathname}`);
      grids.forEach((grid) => {
        this.bindGridListeners(grid);
      });
    },
    captureTabDefaults(tp) {
      if (tp[FLAGS.TAB_CAPTURED] || tp.isDestroyed) return;
      const isRecordPanel = tp.items?.items?.length > MIN_TAB_ITEMS && tp.items.items.some((t) => t.itemId === "HDR");
      if (isRecordPanel && !APMApi.get("systemDefaultTabOrder")) {
        APMApi.register("systemDefaultTabOrder", tp.items.items.filter((t) => !t.isDestroyed).map((t) => normalizeTabName(t.title || t.text || "")).filter((n) => n && n !== "&#160;"));
      }
      tp[FLAGS.TAB_CAPTURED] = true;
    },
    bindTabListeners(tp) {
      if (tp[FLAGS.CONSISTENCY_BOUND] || tp.isDestroyed) return;
      const win = tp.getEl?.()?.dom?.ownerDocument?.defaultView || window;
      let _triggerTimeout = null;
      const trigger = () => {
        clearTimeout(_triggerTimeout);
        _triggerTimeout = setTimeout(() => {
          APMLogger.debug("ExtConsistency", `Tab Activity on ${tp.id}. Re-scanning for components...`);
          applyTabConsistency();
          this.setupComponentListeners(win);
          this.triggerInjections();
          const cc = APMApi.get("invalidateColorCodeCache");
          if (cc) {
            cc(win.document);
            setTimeout(() => cc(win.document), 350);
          }
        }, 100);
      };
      const syncNativeState = (item, action) => {
        if (isSuppressingNativeEvents()) {
          APMLogger.debug("ExtConsistency", `Ignoring native ${action} event due to suppression flag.`);
          return;
        }
        const rawName = item.title || item.text || item.tab && item.tab.getText?.() || "";
        const tabName = normalizeTabName(rawName);
        if (!tabName || tabName === "&#160;") return;
        const p = getPresets();
        const funcName = detectScreenFunction(win);
        const allHidden = p.config.hiddenTabs || {};
        const screenHidden = Array.isArray(allHidden) ? allHidden : allHidden[funcName] || [];
        if (action === "remove") {
          APMLogger.info("ExtConsistency", `Native REMOVE detected for: ${tabName} (Silo: ${funcName})`);
          if (!screenHidden.includes(tabName)) {
            const newHidden = { ...Array.isArray(allHidden) ? {} : allHidden };
            newHidden[funcName] = [...screenHidden, tabName];
            updatePresetConfig({ hiddenTabs: newHidden });
          }
        } else if (action === "add") {
          APMLogger.info("ExtConsistency", `Native ADD detected for: ${tabName} (Silo: ${funcName})`);
          const newScreenHidden = screenHidden.filter((t) => t !== tabName);
          const newHidden = { ...Array.isArray(allHidden) ? {} : allHidden, [funcName]: newScreenHidden };
          const tabOrders = { ...p.config.tabOrders || {} };
          const siloOrder = tabOrders[funcName];
          const orderArray = typeof siloOrder === "string" ? siloOrder.split(",").map((s) => s.trim()) : Array.isArray(siloOrder) ? [...siloOrder] : [];
          if (!orderArray.includes(tabName)) {
            orderArray.push(tabName);
          }
          tabOrders[funcName] = orderArray;
          updatePresetConfig({ hiddenTabs: newHidden, tabOrders });
        }
      };
      tp.on("tabchange", trigger);
      tp.on("add", (tp2, item) => {
        syncNativeState(item, "add");
        trigger();
      });
      tp.on("remove", (tp2, item) => {
        syncNativeState(item, "remove");
        trigger();
      });
      tp.on("childmove", (container, item, fromIdx, toIdx) => {
        if (isSuppressingNativeEvents() || !item) return;
        APMLogger.debug("ExtConsistency", `Native CHILDMOVE detected for ${item.id || "item"} from ${fromIdx} to ${toIdx}. Triggering re-sync.`);
        trigger();
      });
      tp.on("activate", trigger);
      tp[FLAGS.CONSISTENCY_BOUND] = true;
    },
    bindGridListeners(grid) {
      if (grid[FLAGS.CONSISTENCY_BOUND] || grid.isDestroyed || !grid.headerCt) return;
      const win = grid.getEl?.()?.dom?.ownerDocument?.defaultView || window;
      const store = grid.getStore();
      APMLogger.debug("ExtConsistency", `Binding grid: ${grid.id}, Store: ${store?.storeId || "none"}`);
      grid.headerCt.on("columnmove", () => setTimeout(applyGridConsistency, 50));
      const bindStore = (s) => {
        if (!s || s[FLAGS.GRID_HOOK]) return;
        this.hookStoreReader(s);
        APMLogger.debug("ExtConsistency", `Hooking load event for store: ${s.storeId || "unnamed"}`);
        s.on("load", (storeInstance, records, successful, operation) => {
          if (!successful || grid.isDestroyed) return;
          APMLogger.debug("ExtConsistency", `Load detected on ${grid.id} (Store: ${s.storeId}). Checking for more records...`);
          recursiveGridFetch(grid, { operation });
          if (typeof debouncedProcessColorCodeGrid === "function") {
            debouncedProcessColorCodeGrid(grid.getEl()?.dom?.ownerDocument || document);
          }
        });
        s[FLAGS.GRID_HOOK] = true;
      };
      bindStore(grid.getStore());
      grid.on("reconfigure", (g, store2) => {
        APMLogger.debug("ExtConsistency", `Grid reconfigured: ${grid.id}. Re-hooking...`);
        bindStore(store2);
        setupExtGridListeners(win);
      });
      const sid = (store?.storeId || "").toLowerCase();
      if (sid.includes("wsjobs") || sid.includes("ctjobs")) {
        const sm = grid.getSelectionModel?.();
        if (sm && !sm.__apmSelChangeBound) {
          sm.on("selectionchange", () => this.triggerInjections());
          sm.__apmSelChangeBound = true;
        }
      }
      setupExtGridListeners(win);
      grid.on("destroy", () => {
        APMLogger.debug("ExtConsistency", `Grid destroyed: ${grid.id}. Invalidating cache.`);
        findMainGrid(true);
      });
      grid[FLAGS.CONSISTENCY_BOUND] = true;
      setTimeout(applyGridConsistency, 50);
    }
  };

  // src/core/frame-manager.js
  init_api();
  init_ui_manager();
  init_labor_booker();

  // src/ui/styles.js
  var APM_STATIC_STYLES = `
/* =========================
 * APM Design Tokens
 * Derived from EAM hex-dark theme palette.
 * Surface: deep charcoal with slight warmth.
 * Accent: EAM blue. Semantic: green/red/amber.
 * ========================= */
:root {
    --apm-surface-0: #35404a;
    --apm-surface-inset: #2b343c;
    --apm-surface-sunken: #22292f;
    --apm-surface-raised: #3d4a55;
    --apm-border: #45535e;
    --apm-border-strong: #4a5a6a;
    --apm-border-emphasis: #5a6a7a;
    --apm-control-bg: #4a5a6a;
    --apm-control-bg-hover: #5c6d7e;
    --apm-control-muted: #505f6e;
    --apm-text-primary: #ffffff;
    --apm-text-bright: #ecf0f1;
    --apm-text-secondary: #b0bec5;
    --apm-text-tertiary: #bdc3c7;
    --apm-text-muted: #95a5a6;
    --apm-text-disabled: #7f8c8d;
    --apm-accent: #3498db;
    --apm-accent-hover: #2980b9;
    --apm-accent-subtle: rgba(52, 152, 219, 0.1);
    --apm-success: #1abc9c;
    --apm-success-bright: #2ecc71;
    --apm-danger: #e74c3c;
    --apm-danger-subtle: rgba(231, 76, 60, 0.15);
    --apm-warning: #f39c12;
    --apm-warning-dark: #d35400;
    --apm-success-dark: #16a085;
    --apm-text-on-accent: #fff;
    --apm-purple: #9b59b6;
    --apm-input-bg: #ecf0f1;
    --apm-input-border: transparent;
    --apm-input-text: #2c3e50;
    --apm-input-focus: rgba(52, 152, 219, 0.4);
    --apm-shadow: 0 8px 25px rgba(0,0,0,0.6);
    --apm-shadow-sm: 0 1px 3px rgba(0,0,0,0.2);
    --apm-radius: 6px;
    --apm-radius-sm: 4px;
    --apm-radius-lg: 10px;
    /* Typography scale */
    --apm-font: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    --apm-font-mono: 'SF Mono', 'Cascadia Code', 'Consolas', monospace;
    --apm-text-xs: 10px;
    --apm-text-sm: 11px;
    --apm-text-base: 12px;
    --apm-text-md: 13px;
    --apm-text-lg: 15px;
    --apm-text-xl: 17px;
    --apm-text-hero: 32px;
}

/* =========================
 * Shared Control Styles
 * ========================= */
/* Button base \u2014 all APM buttons inherit this */
.apm-ui-panel button, .apm-ui-panel .creator-btn, .apm-ui-panel .org-btn,
.eam-fc-container button, .eam-fc-container .org-btn {
    font-family: var(--apm-font);
    line-height: 1;
    box-sizing: border-box;
}
/* Consistent focus ring on all interactive elements inside panels */
.apm-ui-panel button:focus-visible, .apm-ui-panel select:focus-visible,
.apm-ui-panel input:focus-visible, .apm-ui-panel textarea:focus-visible,
.eam-fc-container button:focus-visible, .eam-fc-container select:focus-visible,
.eam-fc-container input:focus-visible {
    outline: 2px solid var(--apm-accent);
    outline-offset: 1px;
}
/* Remove default outlines on all panel inputs/selects */
.apm-ui-panel select, .apm-ui-panel input, .apm-ui-panel textarea,
.eam-fc-container select, .eam-fc-container input { outline: none; }
/* Shared select styling \u2014 all native selects inside panels */
.apm-ui-panel select, .eam-fc-container select {
    font-family: var(--apm-font);
    font-weight: bold;
    cursor: pointer;
    box-sizing: border-box;
}

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
.eam-fc-container { position:fixed; z-index:2147483647; padding:14px; background:var(--apm-surface-0); color:var(--apm-text-primary); border:1px solid var(--apm-border-strong); border-radius:var(--apm-radius-lg); box-shadow: var(--apm-shadow); font-family:var(--apm-font); font-size:var(--apm-text-base); width: 500px; display:none; }

.eam-fc-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:15px; border-bottom: 1px solid var(--apm-border); padding-bottom: 10px; }
.eam-fc-title-box { display:flex; align-items:center; gap:8px; }
.eam-fc-title { margin:0; font-size:var(--apm-text-xl); color:var(--apm-text-bright); font-weight:600; }
.eam-fc-controls { display:flex; align-items:center; gap:10px; }
.eam-fc-mode-btn { background:var(--apm-surface-inset); color:var(--apm-success); border:1px solid var(--apm-success); padding: 4px 10px; border-radius:15px; cursor:pointer; font-size:11px; font-weight:bold; transition: all 0.15s; }
.eam-fc-mode-btn:hover { filter: brightness(1.15); box-shadow: 0 2px 8px rgba(46, 204, 113, 0.25); }
#eam-btn-spies:hover { box-shadow: 0 2px 8px rgba(52, 152, 219, 0.25); }
.eam-fc-close-btn { background:var(--apm-control-muted); color:var(--apm-text-primary); border:none; padding: 4px 10px; border-radius:var(--apm-radius-sm); cursor:pointer; font-size:var(--apm-text-base); font-weight:bold; transition: background 0.15s, color 0.15s; }
.eam-fc-close-btn:hover { background: var(--apm-danger) !important; color: white; }
.eam-fc-adv-box { display:none; flex-direction:column; gap:4px; margin-bottom:15px; }
.eam-fc-row { display:flex; gap:5px; align-items:center; }
.eam-fc-label { font-size:12px; color:var(--apm-text-secondary); white-space:nowrap; }
.eam-fc-select { flex-grow:1; height:28px; padding:0 6px; border-radius:var(--apm-radius-sm); border:1px solid var(--apm-input-border); background:var(--apm-input-bg); color:var(--apm-input-text); font-size:12px; font-weight:bold; cursor:pointer; box-sizing:border-box; }
.org-btn { background: var(--apm-control-bg); color: var(--apm-text-primary); border: none; padding: 6px 10px; border-radius: var(--apm-radius-sm); cursor: pointer; font-weight: bold; font-size: 12px; transition: background 0.15s; }
.org-btn:hover { background: var(--apm-control-bg-hover); }
.org-btn-add:hover { background: var(--apm-accent) !important; }
.org-btn-rem:hover { background: var(--apm-danger) !important; }

/* =========================
 * Toggle Switches
 * ========================= */
.eam-slider-switch { position: relative; display: inline-block; width: 32px; height: 18px; margin: 0; flex-shrink: 0; }
.eam-slider-switch input { opacity: 0; width: 0; height: 0; }
.eam-slider-track { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: var(--apm-control-muted); transition: .2s; border-radius: 18px; }
.eam-slider-track:before { position: absolute; content: ""; height: 12px; width: 12px; left: 3px; bottom: 3px; background-color: white; transition: .2s; border-radius: 50%; }
.eam-slider-switch input:checked + .eam-slider-track { background-color: var(--apm-accent); }
.eam-slider-switch input:checked + .eam-slider-track:before { transform: translateX(14px); }

/* =========================
 * Tabs and Hidden Classes
 * ========================= */
.apm-tab-hidden { display: none !important; }
.apm-overflow-badge { font-size: 9px; background: var(--apm-warning); color: var(--apm-text-on-accent); padding: 1px 4px; border-radius: 3px; margin-left: 6px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.3px; }

/* =========================
 * Grid Cell Height Clamp
 * ========================= */
.x-grid-cell-inner { max-height: 64px; overflow: hidden; }
.x-grid-cell-inner:has(.apm-nametag) { max-height: none; }

/* =========================
 * ColorCode Nametag & Links
 * ========================= */
.apm-nametag { display: table; color: var(--apm-text-primary); font-weight: bold; font-size: 11px; padding: 3px 6px; border-radius: 4px; margin-top: 5px; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.3); cursor: pointer; transition: transform 0.1s; }
.apm-nametag:hover { transform: scale(1.05); }
#apm-filter-banner { position: fixed; top: 10px; left: 50%; transform: translateX(-50%); background: var(--apm-danger); color: white; padding: 6px 16px; border-radius: 20px; font-weight: bold; font-size: 13px; cursor: pointer; z-index: 2147483647; display: none; box-shadow: 0 4px 10px rgba(0,0,0,0.5); transition: filter 0.15s, transform 0.1s; }
#apm-filter-banner:hover { filter: brightness(1.15); }
#apm-filter-banner:active { transform: translateX(-50%) scale(0.97); }
.apm-wo-link { color: var(--apm-accent) !important; text-decoration: underline !important; font-weight: bold !important; cursor: pointer; }
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
.rule-item { display: flex; justify-content: space-between; align-items: center; background: var(--apm-surface-inset); padding: 6px 8px; border-radius: var(--apm-radius-sm); margin-bottom: 6px; border-left: 3px solid var(--apm-success); }
.cc-toggle-switch { position: relative; display: inline-block; width: 32px; height: 18px; margin: 0; flex-shrink: 0; }
.cc-toggle-switch input { opacity: 0; width: 0; height: 0; }
.cc-toggle-slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: var(--apm-control-muted); transition: .2s; border-radius: 18px; }
.cc-toggle-slider:before { position: absolute; content: ""; height: 12px; width: 12px; left: 3px; bottom: 3px; background-color: white; transition: .2s; border-radius: 50%; }
.cc-toggle-switch input:checked + .cc-toggle-slider { background-color: var(--apm-success); }
.cc-toggle-switch input:checked + .cc-toggle-slider:before { transform: translateX(14px); }
.rule-btn { background: var(--apm-control-bg); color: var(--apm-text-primary); border: none; border-radius: var(--apm-radius-sm); padding: 4px 6px; cursor: pointer; font-size: 11px; font-weight: bold; transition: background 0.15s; }
.rule-btn:hover { background: var(--apm-control-bg-hover); }
.rule-delete-btn { background: transparent; color: var(--apm-danger); border: none; border-radius: var(--apm-radius-sm); padding: 4px 6px; cursor: pointer; font-size: 12px; font-weight: bold; transition: all 0.15s; }
.rule-delete-btn:hover { background: var(--apm-danger-subtle); color: white; }
.rule-dir-btn { background: transparent; border: none; color: var(--apm-text-secondary); cursor: pointer; font-size: 12px; padding: 0 4px; line-height: 1; transition: color 0.15s; }
.rule-dir-btn:hover { color: var(--apm-text-primary); }
.rule-edit-btn { transition: all 0.15s !important; }
.rule-edit-btn:hover { filter: brightness(1.2); }
.rule-up-btn, .rule-down-btn { transition: color 0.15s; }
.rule-up-btn:hover, .rule-down-btn:hover { color: var(--apm-text-primary) !important; }

/* =========================
 * Settings Panel & AutoFill
 * ========================= */
.apm-settings-container { position:fixed; z-index:2147483647; padding:14px; background:var(--apm-surface-0); color:var(--apm-text-primary); border:1px solid var(--apm-border-strong); border-radius:var(--apm-radius-lg); box-shadow: var(--apm-shadow); font-family:var(--apm-font); font-size:var(--apm-text-base); width: 440px; max-width: 95vw; max-height: 90vh; flex-direction: column; overflow: hidden; box-sizing: border-box; display:none; }

.apm-settings-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; }
.apm-settings-title { margin:0; font-size:var(--apm-text-lg); color:var(--apm-text-bright); font-weight:600; letter-spacing:0.2px; }
.apm-settings-close-btn { background:var(--apm-control-muted); color:var(--apm-text-primary); border:none; padding:4px 10px; border-radius:var(--apm-radius-sm); cursor:pointer; font-size:12px; font-weight:bold; transition:background 0.15s; }
.apm-settings-close-btn:hover { background:var(--apm-danger); }
.apm-tab-container { display:flex; margin-bottom:10px; background:var(--apm-surface-sunken); border-radius:var(--apm-radius); overflow:hidden; flex-shrink: 0; border:1px solid var(--apm-border); }
.apm-panel-section { display:none; flex-direction: column; flex: 1; min-height: 0; align-items: stretch; overflow: hidden; }
.apm-tab-content-scroll { overflow-y: auto; padding-right: 15px; flex: 1; min-height: 0; margin-bottom: 5px; scrollbar-gutter: stable; }
/* Scrollbar Styling */
.apm-tab-content-scroll::-webkit-scrollbar { width: 5px; }
.apm-tab-content-scroll::-webkit-scrollbar-track { background: transparent; }
.apm-tab-content-scroll::-webkit-scrollbar-thumb { background: var(--apm-control-bg); border-radius: 3px; }
.apm-tab-content-scroll::-webkit-scrollbar-thumb:hover { background: var(--apm-control-bg-hover); }
.apm-template-box { background: var(--apm-surface-sunken); padding: 8px 10px; border-radius: var(--apm-radius); margin-bottom: 12px; border: 1px solid var(--apm-border); }
.apm-template-label { font-size: var(--apm-text-xs); color: var(--apm-text-secondary); margin-bottom: 4px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.6px; }
.apm-template-row { display: flex; gap: 5px; align-items: center; }
.apm-template-select { flex-grow:1; height: 28px; padding:0 6px; border-radius:var(--apm-radius-sm); border:1px solid var(--apm-input-border); font-weight:bold; cursor:pointer; font-size:var(--apm-text-sm); background: var(--apm-input-bg); color: var(--apm-input-text); box-sizing:border-box; }
.apm-template-btn-update, .apm-template-btn-new, .apm-template-btn-del { border: none; border-radius: var(--apm-radius-sm); cursor: pointer; font-size: var(--apm-text-sm); font-weight: bold; transition: filter 0.15s; height: 28px; box-sizing: border-box; }
.apm-template-btn-update:hover, .apm-template-btn-new:hover { filter: brightness(1.15); }
.apm-template-btn-del:hover { filter: brightness(1.2); } /* red needs stronger bump \u2014 lower perceived luminance */
.apm-template-btn-update { background:var(--apm-accent); color:white; padding: 4px 10px; }
.apm-template-btn-new { background:var(--apm-success-bright); color:white; padding: 4px 10px; }
.apm-template-btn-del { background:var(--apm-danger); color:white; padding: 0; width: 28px; display: flex; align-items: center; justify-content: center; }
.apm-fields-wrapper { padding: 0 4px; margin-bottom: 5px; }
.apm-section-label { font-size: var(--apm-text-xs); font-weight: 600; text-transform: uppercase; letter-spacing: 0.6px; color: var(--apm-text-secondary); margin-bottom: 5px; margin-top: 2px; }
.apm-section-group { background: var(--apm-surface-sunken); border: 1px solid var(--apm-border); border-radius: var(--apm-radius); padding: 8px 10px; margin-bottom: 8px; }
.apm-field-highlight { border-color: var(--apm-warning) !important; }
.apm-field-accent { border-color: var(--apm-success) !important; }
.apm-checklist-box { background: rgba(62,180,137,0.06); border: 1px solid rgba(62,180,137,0.15); padding: 6px 8px; border-radius: var(--apm-radius); margin-bottom: 10px; flex-wrap: wrap; }
.apm-checklist-title { width: 100%; font-size: var(--apm-text-xs); color: var(--apm-success); margin-bottom: 4px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.6px; }
.apm-checklist-row { display: flex; gap: 8px; width: 100%; align-items: center; }
.apm-textarea-input { height: 54px; padding: 6px 8px; font-size: var(--apm-text-sm); line-height: 1.3; resize: none; font-family: var(--apm-font); border: 1px solid var(--apm-input-border); background: var(--apm-input-bg); color: var(--apm-input-text); transition: all 0.15s; text-transform: none; }
.apm-textarea-input:focus { border-color: var(--apm-accent); background: #ffffff; box-shadow: 0 0 0 2px var(--apm-input-focus); }
.apm-ui-settings-toggles { display:flex; margin-bottom:10px; background:var(--apm-surface-sunken); border-radius:var(--apm-radius-sm); overflow:hidden; border:1px solid var(--apm-border); }
.apm-ui-settings-btn { flex:1; text-align:center; padding:8px; cursor:pointer; font-size:var(--apm-text-base); font-weight:bold; transition: all 0.15s; user-select: none; }
.apm-ui-settings-btn.active { background:var(--apm-accent); color:var(--apm-text-on-accent); }
.apm-ui-settings-btn.active:hover { filter: brightness(1.15); }
.apm-ui-settings-btn.inactive { background:transparent; color:var(--apm-text-disabled); }
.apm-ui-settings-btn.inactive:hover { background: rgba(255,255,255,0.08); color: var(--apm-text-secondary); }
.apm-ui-settings-list { background:var(--apm-surface-sunken); border:1px solid var(--apm-border); border-radius:var(--apm-radius-sm); padding:5px; min-height:60px; max-height: 45vh; overflow-y:auto; margin-bottom:10px; }

.apm-ui-settings-reset { width:100%; background:var(--apm-danger); color:white; border:none; padding:6px 12px; border-radius:var(--apm-radius); cursor:pointer; font-weight:bold; font-size:var(--apm-text-base); display:none; transition: filter 0.15s, transform 0.1s; }
.apm-ui-settings-reset:hover { filter:brightness(1.2); } /* red needs stronger bump \u2014 lower perceived luminance */
.apm-ui-settings-reset:active { transform: scale(0.98); }
.apm-tab-action-footer { flex-shrink: 0; padding: 12px 15px 5px 0; border-top: 1px solid var(--apm-border); margin-top: 5px; }
.apm-cc-search-box { background: var(--apm-surface-sunken); border: 1px solid var(--apm-border); padding: 8px 10px; border-radius: var(--apm-radius); margin-bottom: 8px; }
.apm-cc-search-row { display: flex; gap: 8px; margin-bottom: 8px; }
.apm-cc-options-row { display: flex; gap: 10px; align-items: center; margin-bottom: 8px; padding-left: 2px; }
.apm-cc-buttons-row { display: flex; gap: 8px; }
.apm-cc-theme-box { display:flex; gap: 8px; margin-bottom: 8px; align-items: center; }
.apm-cc-theme-item { flex: 1; display:flex; align-items:center; justify-content:space-between; background: var(--apm-surface-sunken); padding: 6px 10px; border-radius: var(--apm-radius); border: 1px solid var(--apm-border); }
.apm-cc-theme-label { font-size: 11px; color: var(--apm-text-secondary); font-weight: bold; }
.apm-cc-theme-select { padding: 4px; border-radius: var(--apm-radius-sm); background: var(--apm-input-bg); border: 1px solid var(--apm-input-border); font-size: 11px; cursor: pointer; font-weight: bold; color: var(--apm-input-text); }
.apm-cc-rules-container { background:var(--apm-surface-sunken); border:1px solid var(--apm-border); border-radius:var(--apm-radius-sm); padding:5px; min-height:80px; max-height: 35vh; overflow-y:auto; margin-bottom:8px; }
.apm-cc-style-btn:hover { filter: brightness(1.15); }
#cc-add-btn { transition: all 0.15s !important; }
#cc-add-btn:hover { filter: brightness(1.15); }
#cc-cancel-btn { transition: all 0.15s !important; }
#cc-cancel-btn:hover { filter: brightness(1.2); }

.apm-cc-guide { display:none; font-size: 12px; color: var(--apm-text-secondary); line-height: 1.5; background: var(--apm-surface-sunken); border-radius: var(--apm-radius); padding: 12px; border: 1px solid var(--apm-border); }
.apm-general-box { display:none; padding: 10px; background: var(--apm-surface-sunken); border-radius: var(--apm-radius); border: 1px solid var(--apm-border); }
.apm-general-item { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom: 12px; padding: 4px 5px; border-radius: var(--apm-radius-sm); transition: background 0.15s; }
.apm-general-item:hover { background: rgba(255,255,255,0.03); }
.apm-general-title { font-weight: 600; font-size: var(--apm-text-md); color: var(--apm-text-bright); line-height: 1.3; margin-bottom: 2px; }
.apm-general-desc { font-size: var(--apm-text-sm); color: var(--apm-text-muted); line-height: 1.4; margin-right: 10px; }
.apm-help-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); z-index: 2147483647; display: none; align-items: center; justify-content: center; backdrop-filter: blur(3px); }
.apm-help-modal { background: var(--apm-surface-0); width: 600px; max-width: 90%; max-height: 85vh; border-radius: var(--apm-radius-lg); border: 1px solid var(--apm-border-strong); box-shadow: 0 20px 50px rgba(0,0,0,0.6); display: flex; flex-direction: column; position: relative; overflow: hidden; }
.apm-help-header { padding: 15px 20px; background: var(--apm-surface-raised); border-bottom: 1px solid var(--apm-border); display: flex; justify-content: space-between; align-items: center; }
.apm-help-title { color: var(--apm-accent); margin: 0; font-size: var(--apm-text-xl); font-weight: 600; }
.apm-help-close { background: transparent; border: none; color: var(--apm-text-muted); font-size: 20px; cursor: pointer; padding: 5px; line-height: 1; transition: color 0.15s; }
.apm-help-close:hover { color: var(--apm-text-primary); }
.apm-help-content { padding: 25px; overflow-y: auto; color: var(--apm-text-secondary); font-size: var(--apm-text-md); line-height: 1.6; }
.apm-help-section { margin-bottom: 25px; }
.apm-help-section-title { color: var(--apm-accent); font-size: var(--apm-text-lg); font-weight: 600; margin-bottom: 10px; display: flex; align-items: center; gap: 8px; }
.apm-help-section b { color: var(--apm-text-bright); }
.apm-help-content ul { padding-left: 20px; margin: 10px 0; }
.apm-help-content li { margin-bottom: 8px; }
.apm-help-content kbd { background: var(--apm-surface-raised); padding: 2px 6px; border-radius: var(--apm-radius-sm); font-family: var(--apm-font-mono); font-size: 12px; color: var(--apm-accent); border: 1px solid var(--apm-border-emphasis); }
.apm-footer { margin-top: 10px; text-align: center; display: flex; flex-direction: column; gap: 8px; flex-shrink: 0; border-top: 1px solid var(--apm-border); padding-top: 10px; }
.apm-footer-help-btn { cursor: pointer; color: var(--apm-accent); font-size: 11px; text-decoration: underline; font-weight: bold; }
.apm-footer-help-btn-box { background: var(--apm-control-bg); color: var(--apm-text-primary); border: none; padding: 6px 12px; border-radius: var(--apm-radius-sm); cursor: pointer; font-size: 11px; font-weight: bold; transition: background 0.15s; box-shadow: var(--apm-shadow-sm); }
.apm-footer-help-btn-box:hover { background: var(--apm-control-bg-hover); }
.cc-footer-btn { background: var(--apm-surface-raised); color: var(--apm-text-secondary); border: 1px solid var(--apm-border); border-radius: var(--apm-radius-sm); padding: 5px 10px; cursor: pointer; font-size: 11px; font-weight: bold; transition: all 0.15s; }
.cc-footer-btn:hover { background: var(--apm-control-bg); color: var(--apm-text-primary); border-color: var(--apm-border-strong); }
.apm-footer-update-btn { display:inline-block; background:var(--apm-warning); color:white; padding:6px 12px; border-radius:var(--apm-radius-sm); font-weight:bold; text-decoration:none; font-size:11px; transition: filter 0.15s; box-shadow: var(--apm-shadow-sm); }
.apm-footer-update-btn:hover { filter:brightness(1.15); }
.apm-footer-version { font-size: var(--apm-text-xs); color: var(--apm-text-disabled); }
.apm-help-wiki-link { transition: color 0.15s; }
.apm-help-wiki-link:hover { color: var(--apm-text-bright) !important; }
.apm-footer-bug-link { transition: color 0.15s; }
.apm-footer-bug-link:hover { color: var(--apm-text-bright) !important; text-decoration: underline; }
#apm-v-changelog { transition: color 0.15s, filter 0.15s; }
#apm-v-changelog:hover { filter: brightness(1.2); }

.apm-qs-container { position: fixed; top: 3px; left: 110px; z-index: 20; display: flex; align-items: center; gap: 8px; background: transparent; padding: 0 10px; height: 42px; }
.apm-qs-label { color: var(--apm-text-secondary); font-family: var(--apm-font); font-weight: bold; font-size: 13px; cursor: default; user-select: none; margin-right: 2px; }
.apm-qs-input { width: 140px; font-family: var(--apm-font-mono); font-weight: bold; height: 24px; padding: 0 6px; box-sizing: border-box; outline: none; background: rgba(255,255,255,0.9); color: var(--apm-input-text); border: 1px solid rgba(255,255,255,0.3); border-radius: 3px; }
.apm-qs-input:focus { border-color: var(--apm-accent); box-shadow: 0 0 0 2px var(--apm-input-focus); }
.apm-qs-btn { cursor: pointer; display: flex; align-items: center; justify-content: center; padding: 0 8px; height: 24px; border-radius: 3px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: var(--apm-text-secondary); transition: background 0.15s; }
.apm-qs-btn:hover { background: rgba(255,255,255,0.15); }
.apm-qs-status { color: var(--apm-text-secondary); font-family: var(--apm-font); font-size: 11px; opacity: 0.7; width: 80px; margin-left: 5px; white-space: nowrap; user-select: none; }
.eam-fc-date-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:5px; }
.eam-fc-date-label { font-size:var(--apm-text-base); color:var(--apm-text-secondary); font-weight:bold; }
.eam-fc-date-mode-toggle { display:inline-flex; border:1px solid var(--apm-border); border-radius:var(--apm-radius-sm); overflow:hidden; }
.eam-fc-date-mode-btn { background:transparent; border:none; color:var(--apm-text-disabled); padding:3px 10px; font-size:var(--apm-text-sm); font-weight:600; cursor:pointer; transition:all 0.15s; }
.eam-fc-date-mode-btn.active { background:var(--apm-accent); color:var(--apm-text-on-accent); }
.eam-fc-date-mode-btn.active:hover { filter:brightness(1.15); }
.eam-fc-date-mode-btn:not(.active):hover { color:var(--apm-text-secondary); background:rgba(255,255,255,0.03); }
.eam-fc-view-toggle { display:inline-flex; border:1px solid var(--apm-border); border-radius:var(--apm-radius-sm); overflow:hidden; }
.eam-fc-view-btn { background:transparent; border:none; color:var(--apm-text-disabled); padding:3px 8px; font-size:var(--apm-text-sm); font-weight:600; cursor:pointer; transition:all 0.15s; }
.eam-fc-view-btn.active { background:var(--apm-accent); color:var(--apm-text-on-accent); }
.eam-fc-view-btn.active:hover { filter:brightness(1.15); }
.eam-fc-view-btn:not(.active):hover { color:var(--apm-text-secondary); background:rgba(255,255,255,0.03); }
.eam-fc-week-row { display:flex; gap:10px; align-items:center; margin-bottom:10px; }
.eam-fc-days-box { padding:6px 10px; margin-bottom:10px; display:flex; justify-content:space-between; align-items:center; }
.eam-fc-custom-dates { display:none; background:var(--apm-surface-inset); padding:8px 12px; border-radius:var(--apm-radius); margin-bottom:15px; gap:8px; flex-direction:column; box-sizing:border-box; }
.eam-fc-custom-row { display:flex; align-items:center; justify-content:space-between; gap:10px; }
.eam-fc-date-input { flex-grow:1; height:28px; padding:0 6px; border-radius:var(--apm-radius-sm); border:1px solid var(--apm-input-border); background:var(--apm-input-bg); color:var(--apm-input-text); font-weight:bold; font-family:monospace; font-size:12px; cursor:pointer; box-sizing:border-box; }
.eam-fc-assigned-box { display:none; gap:10px; margin-bottom:10px; align-items:center; }
.eam-fc-input-text { flex-grow:1; height:28px; padding:0 6px; border-radius:var(--apm-radius-sm); border:1px solid var(--apm-input-border); background:var(--apm-input-bg); color:var(--apm-input-text); font-size:12px; text-transform:uppercase; box-sizing:border-box; }
.eam-fc-shift-text { width:60px; height:28px; padding:0 6px; border-radius:var(--apm-radius-sm); border:1px solid var(--apm-input-border); background:var(--apm-input-bg); color:var(--apm-input-text); font-size:12px; text-transform:uppercase; box-sizing:border-box; }
.eam-fc-desc-box { display:flex; gap:10px; margin-bottom:20px; align-items:center; }
.eam-fc-desc-input { flex-grow:1; height:28px; padding:0 6px; border-radius:var(--apm-radius-sm); border:1px solid var(--apm-input-border); background:var(--apm-input-bg); color:var(--apm-input-text); font-size:12px; box-sizing:border-box; transition: border-color 0.15s, box-shadow 0.15s; }
.eam-fc-desc-input:focus { outline: none; border-color: var(--apm-accent); background: #ffffff; box-shadow: 0 0 0 2px var(--apm-input-focus); }
.eam-fc-run-box { display:flex; justify-content:space-between; gap:15px; }
.eam-fc-btn-run { background:var(--apm-success); color:white; border:none; padding:8px 12px; border-radius:var(--apm-radius); cursor:pointer; font-weight:bold; flex: 1; font-size:var(--apm-text-md); transition: filter 0.15s, transform 0.1s; }
.eam-fc-btn-run:hover { filter:brightness(1.15); }
.eam-fc-btn-run:active { transform: scale(0.98); }
.eam-fc-today-box { display:flex; align-items:center; background: var(--apm-accent-subtle); border: 1px solid rgba(74,158,222,0.3); border-radius:var(--apm-radius); padding: 4px 6px; gap:8px; flex: 0 0 auto; }
.eam-fc-today-lbl { display:flex; align-items:center; gap:6px; cursor:pointer; margin:0; }
.eam-fc-today-txt { color:var(--apm-accent); font-size:11px; font-weight:bold; white-space:nowrap; user-select:none; margin-top:1px; width:105px; display:inline-block; text-align:left; }
.eam-fc-btn-today { background:var(--apm-accent); color:white; border:none; padding:8px 12px; border-radius:var(--apm-radius-sm); cursor:pointer; font-weight:bold; font-size:13px; transition: filter 0.15s; }
.eam-fc-btn-today:hover { filter:brightness(1.15); }
.eam-fc-footer { display:flex; justify-content:space-between; align-items:center; font-size:11.5px; color:var(--apm-text-muted); margin-top:15px; border-top: 1px solid var(--apm-border); padding-top:10px; }
.eam-fc-help-link { background:var(--apm-control-bg); color:var(--apm-text-primary); border:none; padding:6px 12px; cursor:pointer; font-size:var(--apm-text-sm); font-weight:bold; border-radius:var(--apm-radius-sm); transition:background 0.15s; text-decoration:none; box-shadow:var(--apm-shadow-sm); }
.eam-fc-help-link:hover { background:var(--apm-control-bg-hover); }
.eam-fc-guide-box { display:none; max-height: 60vh; overflow-y: auto; padding-right: 6px; }

.eam-fc-guide-text { font-size: 12px; color: var(--apm-text-tertiary); line-height: 1.4; margin-bottom: 10px; }
.eam-fc-guide-hdr { color: var(--apm-success); margin: 10px 0 5px 0; font-size: 13px; }
.eam-fc-guide-list { margin: 0 0 10px 0; padding-left: 20px; font-size: 12px; color: var(--apm-text-tertiary); line-height: 1.4; }
.eam-fc-guide-back { text-align:left; margin-top: 10px; border-top: 1px solid var(--apm-border); padding-top:10px; }
.eam-fc-status { margin-top:5px; font-size:12px; text-align:center; color:var(--apm-text-secondary); font-weight:bold; }
.eam-fc-update-box { display:none; margin-top: 10px; text-align: center; }
#apm-list-pm-btn { transition: all 0.15s !important; }
#apm-list-pm-btn:hover { filter: brightness(1.15); }

/* =========================
 * Labor Tracker UI
 * ========================= */
.apm-labor-trigger { position: fixed; background: var(--apm-accent); color: white; padding: 10px; cursor: pointer; font-weight: bold; font-size: 12px; z-index: 2147483647; box-shadow: var(--apm-shadow-sm); transition: filter 0.15s; user-select: none; display: flex; align-items: center; justify-content: center; white-space: nowrap; letter-spacing: 0.5px; }
.apm-labor-trigger:hover { filter: brightness(1.15); }
.apm-labor-panel { position: fixed; width: min(280px, 80vw); background: var(--apm-surface-0, #35404a); border: 1px solid var(--apm-border-strong); border-radius: var(--apm-radius-lg); padding: 15px; z-index: 2147483646; transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1); display: none; visibility: hidden; flex-direction: column; box-shadow: var(--apm-shadow); }

.labor-tabs { display: flex; gap: 2px; background: var(--apm-surface-sunken); border-radius: var(--apm-radius-sm); overflow: hidden; margin-bottom: 15px; border: 1px solid var(--apm-border); }
.labor-tab { flex: 1; padding: 8px; text-align: center; font-size: 11px; cursor: pointer; color: var(--apm-text-secondary); font-weight: bold; transition: all 0.15s; user-select: none; }
.labor-tab.active { background: var(--apm-accent); color: white; }
.labor-tab.active:hover { filter: brightness(1.15); }
.labor-tab:not(.active):hover { background: rgba(255,255,255,0.08); }
.labor-total { font-size: var(--apm-text-hero); font-weight: 700; text-align: center; margin: 10px 0; color: var(--apm-text-bright); }
.labor-total-unit { font-size: 14px; color: var(--apm-text-disabled); font-weight: 600; }
.labor-status-error { font-size: 16px; color: var(--apm-danger); }
.labor-status-loading { font-size: 16px; color: var(--apm-warning); }
.labor-empty { text-align: center; padding: 10px; color: var(--apm-text-disabled); font-size: var(--apm-text-base); }
.labor-row { display: flex; justify-content: space-between; padding: 6px 10px; border-bottom: 1px solid var(--apm-border); font-size: 12px; color: var(--apm-text-tertiary); }
.apm-labor-header { display:flex; justify-content:space-between; align-items:center; margin-bottom: 8px; }
.apm-labor-target-lbl { font-size:11px; color:var(--apm-text-tertiary); font-weight:bold; }
.apm-labor-mgr-toggle { background:transparent; color:var(--apm-accent); border:none; padding:0; cursor:pointer; font-size:10px; text-decoration:underline; transition: color 0.15s; }
.apm-labor-mgr-toggle:hover { color: var(--apm-text-bright); }
.apm-labor-mgr-panel { display:none; background:var(--apm-surface-inset); padding:8px; border-radius:var(--apm-radius-sm); margin-bottom:10px; gap:6px; flex-direction:column; }
.apm-labor-mgr-row { display:flex; gap:6px; }
.apm-labor-emp-select { flex-grow:1; padding:4px; border-radius:3px; border:1px solid var(--apm-input-border); background:var(--apm-input-bg); color:var(--apm-input-text); font-size:11px; font-weight:bold; cursor:pointer; text-transform:uppercase; }
.apm-labor-btn-add { background:var(--apm-accent); color:white; border:none; padding:4px 8px; border-radius:3px; cursor:pointer; font-weight:bold; transition:filter 0.15s; }
.apm-labor-btn-add:hover { filter:brightness(1.15); }
.apm-labor-btn-rem { background:var(--apm-danger); color:white; border:none; padding:4px 8px; border-radius:3px; cursor:pointer; font-weight:bold; transition:filter 0.15s; }
.apm-labor-btn-rem:hover { filter:brightness(1.2); } /* red needs stronger bump \u2014 lower perceived luminance than blue/green */
.apm-labor-breakdown-box { max-height: 200px; overflow-y: auto; }
.apm-labor-force-refresh { margin-top:15px; background:var(--apm-control-bg); color:var(--apm-text-primary); border:none; padding:8px; border-radius:var(--apm-radius-sm); cursor:pointer; font-size:11px; transition: background 0.15s; }
.apm-labor-force-refresh:hover { background: var(--apm-control-bg-hover); }

#apm-creator-panel select, #apm-creator-panel input, #apm-creator-panel textarea { outline: none !important; box-sizing: border-box; }
.creator-btn { cursor: pointer; transition: filter 0.15s; font-weight: bold; border-radius: var(--apm-radius-sm); border: none; padding: 6px 12px; font-size: 12px; }
.creator-btn:hover { filter:brightness(1.15); }
.field-row { display: flex; gap: 10px; margin-bottom: 10px; align-items: center; min-width: 0; }
.field-label { font-size: 12px; color: var(--apm-text-secondary); white-space: nowrap; width: 100px; text-align: right; }
.field-input { flex-grow: 1; height: 28px; padding: 0 6px; border-radius: var(--apm-radius-sm); border: 1px solid var(--apm-input-border); background: var(--apm-input-bg); color: var(--apm-input-text); min-width: 0; width: 100%; box-sizing: border-box; transition: border-color 0.15s; font-size: var(--apm-text-sm); font-family: var(--apm-font); text-transform: uppercase; }
.field-input textarea, textarea.field-input { height: auto; padding: 6px; text-transform: none; }
.field-input.upper { text-transform: uppercase; }
#apm-creator-panel .field-input:focus { border-color: var(--apm-accent) !important; background: #ffffff !important; box-shadow: 0 0 0 2px var(--apm-input-focus) !important; }
.apm-tab-btn { flex: 1; min-width: 0; height: 36px; padding: 4px 2px; text-align: center; cursor: pointer; font-weight: 600; transition: color 0.15s, border-color 0.15s, background 0.15s; border-bottom: 2px solid transparent; font-size: var(--apm-text-sm); display: flex; flex-direction: column; align-items: center; justify-content: center; line-height: 1.2; box-sizing: border-box; flex-shrink: 0; user-select: none; }
.apm-tab-active-autofill { color: var(--apm-accent); border-bottom-color: var(--apm-accent); background: var(--apm-accent-subtle); }
.apm-tab-active-autofill:hover { filter: brightness(1.15); }
.apm-tab-inactive { color: var(--apm-text-disabled); }
.apm-tab-inactive:hover { color: var(--apm-text-secondary); background: rgba(255,255,255,0.04); }
.apm-col-item { padding: 8px 10px; margin-bottom: 4px; background: var(--apm-surface-raised); color: var(--apm-text-primary); border-radius: var(--apm-radius-sm); cursor: grab; font-size: var(--apm-text-base); display: flex; justify-content: space-between; align-items: center; border: 1px solid var(--apm-border); user-select: none; transition: background 0.15s, border-color 0.15s, box-shadow 0.15s; }
.apm-col-item:hover { background: var(--apm-control-bg); border-color: var(--apm-border-strong); }
.apm-col-item:active { cursor: grabbing; box-shadow: 0 2px 8px rgba(0,0,0,0.3); }
.apm-col-item.dragging { opacity: 0.5; background: var(--apm-warning); border-color: var(--apm-warning); }
#apm-global-toast { position: fixed; top: 15px; left: 50%; transform: translateX(-50%); z-index: 9999999; padding: 8px 20px; border-radius: 30px; font-weight: bold; font-family: var(--apm-font); font-size: 13px; color: white; opacity: 0; pointer-events: none; transition: opacity 0.3s ease; box-shadow: 0px 4px 15px rgba(0,0,0,0.4); display: none; }

/* Filter Buttons & Extras */
.apm-filter-btn { position: absolute; left: 270px; top: 9px; z-index: 1000; padding: 4px 10px; color: white; border: none; border-radius: 4px; font-weight: bold; cursor: pointer; font-size: 11px; box-shadow: 0 1px 3px rgba(0,0,0,0.3); transition: background 0.2s; }

/* Input Placeholder Overrides */
#apm-settings-panel ::-ms-input-placeholder, #eam-forecast-panel :-ms-input-placeholder, .apm-labor-panel :-ms-input-placeholder { color: var(--apm-text-disabled) !important; }
#apm-settings-panel ::-ms-input-placeholder, #eam-forecast-panel ::-ms-input-placeholder, .apm-labor-panel ::-ms-input-placeholder { color: var(--apm-text-disabled) !important; }

/* =========================
 * Modals & Premium UI elements
 * ========================= */
.apm-modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); z-index: 2147483647; display: flex; align-items: center; justify-content: center; padding: 20px; box-sizing: border-box; }
.apm-modal-content { background: var(--apm-surface-0, #35404a); border: 1px solid var(--apm-border-strong); border-radius: 12px; box-shadow: 0 15px 40px rgba(0,0,0,0.5); display: flex; flex-direction: column; overflow: hidden; animation: apm-modal-appear 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275); max-height: 100%; }
.apm-modal-header { padding: 14px 18px; background: rgba(255,255,255,0.03); border-bottom: 1px solid var(--apm-border-strong); display: flex; justify-content: space-between; align-items: center; }
.apm-modal-body { padding: 18px; overflow-y: auto; flex: 1; min-height: 0; scrollbar-gutter: stable; }
.apm-modal-body::-webkit-scrollbar { width: 6px; }
.apm-modal-body::-webkit-scrollbar-track { background: transparent; }
.apm-modal-body::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 3px; }
.apm-modal-body::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.35); }
.apm-modal-footer { padding: 12px 15px; border-top: 1px solid var(--apm-border); background: rgba(0,0,0,0.1); }
.apm-modal-btn { padding: 6px 16px; font-size: 12px; border-radius: 6px; cursor: pointer; transition: filter 0.15s, background 0.15s, border-color 0.15s, color 0.15s; }
.apm-modal-btn:active { transform: scale(0.98); }
.apm-modal-btn-ghost { border: 1px solid var(--apm-border); background: var(--apm-surface-inset); color: var(--apm-text-secondary); }
.apm-modal-btn-ghost:hover { background: var(--apm-surface-raised); border-color: var(--apm-border-strong); color: var(--apm-text-bright); }
.apm-modal-btn-accent { border: none; background: var(--apm-accent); color: #fff; font-weight: 600; }
.apm-modal-btn-accent:hover { filter: brightness(1.15); }
.apm-modal-btn-success { border: none; background: var(--apm-success); color: #fff; font-weight: 600; }
.apm-modal-btn-success:hover { filter: brightness(1.15); }
.apm-modal-btn-warning { border: none; background: var(--apm-warning); color: #fff; font-weight: 600; }
.apm-modal-btn-warning:hover { filter: brightness(1.15); }
.apm-modal-btn-pill { font-size: 10px; padding: 2px 8px; border-radius: 10px; border: 1px solid var(--apm-border); background: transparent; color: var(--apm-text-secondary); cursor: pointer; transition: background 0.15s, border-color 0.15s, color 0.15s; }
.apm-modal-btn-pill:hover { background: rgba(255,255,255,0.08); border-color: var(--apm-border-strong); color: var(--apm-text-bright); }
@keyframes apm-modal-appear { from { opacity: 0; transform: scale(0.95) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }

.apm-profile-badge { display: inline-block; padding: 2px 6px; border-radius: 10px; background: var(--apm-accent-subtle); color: var(--apm-accent); font-size: var(--apm-text-xs); font-weight: 600; text-transform: uppercase; letter-spacing: 0.3px; margin-left: 8px; border: 1px solid rgba(74,158,222,0.3); }

/* =========================
 * Filter Builder (Dataspy)
 * ========================= */
.fb-modal { }
.fb-mode-toggle { display: inline-flex; border: 1px solid var(--apm-border); border-radius: var(--apm-radius-sm); overflow: hidden; margin-left: auto; }
.fb-mode-btn { background: transparent; border: none; color: var(--apm-text-disabled); padding: 4px 12px; font-size: var(--apm-text-base); cursor: pointer; transition: all 0.15s; }
.fb-mode-btn.fb-mode-active { background: var(--apm-accent); color: white; }
.fb-mode-btn:hover:not(.fb-mode-active) { color: var(--apm-text-secondary); }
.fb-add-row { display: flex; gap: 5px; align-items: center; margin-bottom: 5px; overflow: hidden; }
.fb-add-row select, .fb-add-row input { min-width: 0; }
.fb-field-select { width: 130px; height: 32px; padding: 0 6px; border-radius: 5px; border: 1px solid var(--apm-input-border); background: var(--apm-input-bg); color: var(--apm-input-text); font-size: var(--apm-text-md); cursor: pointer; box-sizing: border-box; }
.fb-op-select { width: 150px; height: 32px; padding: 0 6px; border-radius: 5px; border: 1px solid var(--apm-input-border); background: var(--apm-input-bg); color: var(--apm-input-text); font-size: var(--apm-text-md); cursor: pointer; box-sizing: border-box; }
.fb-keyword-input { flex: 1; height: 32px; padding: 0 10px; border-radius: 5px; border: 2px solid transparent; background: var(--apm-input-bg); color: var(--apm-input-text); font-size: var(--apm-text-md); box-sizing: border-box; transition: border-color 0.15s; }
.fb-keyword-input:focus { outline: none; border-color: var(--apm-accent); background: #ffffff; box-shadow: 0 0 0 2px var(--apm-input-focus); }
.fb-add-btn { background: var(--apm-accent); color: white; border: none; border-radius: 5px; padding: 6px 10px; font-size: var(--apm-text-sm); font-weight: bold; cursor: pointer; transition: filter 0.15s; white-space: nowrap; height: 32px; flex-shrink: 0; box-sizing: border-box; }
.fb-add-btn:hover { filter: brightness(1.15); }
.fb-hint { font-size: var(--apm-text-md); color: var(--apm-text-muted); font-style: italic; margin-bottom: 10px; min-height: 18px; }
.fb-chip-list { min-height: 44px; max-height: 220px; overflow-y: auto; padding: 8px; background: var(--apm-surface-sunken); border: 1px solid var(--apm-border); border-radius: var(--apm-radius); }
.fb-chip-group-label { font-size: var(--apm-text-sm); font-weight: 600; text-transform: uppercase; letter-spacing: 0.6px; margin: 6px 0 3px 0; padding-top: 4px; }
.fb-chip-group-label:first-child { margin-top: 0; padding-top: 0; }
.fb-chip { display: inline-flex; align-items: center; gap: 5px; background: var(--apm-surface-inset); border-radius: 5px; padding: 4px 8px 4px 10px; border-left: 3px solid var(--apm-accent); font-size: var(--apm-text-md); margin: 2px; animation: apm-modal-appear 0.15s ease-out; }
.fb-chip-op { font-size: var(--apm-text-sm); font-weight: 600; opacity: 0.8; }
.fb-chip-text { color: var(--apm-text-bright); max-width: 170px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.fb-chip-x { background: none; border: none; color: var(--apm-text-disabled); cursor: pointer; font-size: 16px; padding: 0 2px; line-height: 1; transition: color 0.15s; }
.fb-chip-x:hover { color: var(--apm-danger); }
.fb-preview { background: var(--apm-accent-subtle); border: 1px dashed var(--apm-accent); border-radius: var(--apm-radius); padding: 12px; font-size: var(--apm-text-md); line-height: 1.6; }
.fb-preview-label { color: var(--apm-accent); font-weight: 600; font-size: var(--apm-text-base); margin-bottom: 5px; }
.fb-preview-field { color: var(--apm-accent); font-weight: 600; }
.fb-preview-keyword { color: var(--apm-success); font-weight: 600; }
.fb-preview-joiner { color: var(--apm-warning); font-style: italic; }
.fb-preview-empty { color: var(--apm-text-disabled); font-style: italic; font-size: var(--apm-text-base); }
.fb-preview-text { color: var(--apm-text-tertiary); }
.fb-action-bar { display: flex; gap: 10px; padding: 14px 16px; border-top: 1px solid var(--apm-border); background: rgba(0,0,0,0.1); }
.fb-btn { border: none; border-radius: 5px; padding: 9px 18px; font-size: var(--apm-text-md); font-weight: bold; cursor: pointer; transition: filter 0.15s; }
.fb-btn:hover { filter: brightness(1.15); }
.fb-btn-save { background: var(--apm-success); color: white; flex: 1; }
.fb-btn-delete { background: var(--apm-danger); color: white; }
.fb-btn-cancel { background: var(--apm-control-bg); color: var(--apm-text-tertiary); }
.fb-date-section { margin-top: 8px; padding-left: 4px; }
.fb-day-checkboxes { display: flex; gap: 7px; justify-content: center; padding: 8px 0; }
.fb-day-btn { display: flex; flex-direction: column; align-items: center; gap: 3px; background: var(--apm-surface-inset); border: 1px solid var(--apm-border-strong); border-radius: var(--apm-radius); padding: 7px 10px; cursor: pointer; font-size: var(--apm-text-base); font-weight: bold; transition: all 0.15s; position: relative; min-width: 40px; }
.fb-day-btn.fb-day-on { color: var(--apm-success); border-color: var(--apm-success); background: rgba(62,180,137,0.08); }
.fb-day-btn.fb-day-off { color: var(--apm-danger); border-color: var(--apm-danger); background: var(--apm-danger-subtle); opacity: 0.7; }
.fb-day-btn:hover { opacity: 1; border-color: var(--apm-accent); }
.fb-day-x { color: var(--apm-danger); font-size: 11px; line-height: 1; }
.fb-day-label { line-height: 1; }
.fb-text-mode { padding: 4px 0; }
.fb-modal .eam-fc-select { height: 32px; font-size: 13px; padding: 0 8px; border-radius: 5px; }
.fb-modal .eam-fc-input-text { height: 32px; font-size: 13px; padding: 0 8px; border-radius: 5px; }

/* =========================
 * Welcome Overlay (First-Run)
 * ========================= */
.apm-welcome-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.75); z-index: 2147483647; display: none; align-items: center; justify-content: center; backdrop-filter: blur(4px); }
.apm-welcome-modal { background: var(--apm-surface-0); width: 420px; max-width: 90vw; border-radius: var(--apm-radius-lg); border: 1px solid var(--apm-border-strong); box-shadow: 0 20px 60px rgba(0,0,0,0.6); display: flex; flex-direction: column; overflow: hidden; animation: apm-modal-appear 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
.apm-welcome-body { padding: 28px 28px 20px; min-height: 200px; display: flex; flex-direction: column; }
.apm-welcome-icon { font-size: 36px; margin-bottom: 14px; line-height: 1; }
.apm-welcome-title { margin: 0 0 8px; font-size: var(--apm-text-xl); font-weight: 700; color: var(--apm-text-bright); letter-spacing: -0.2px; }
.apm-welcome-desc { margin: 0; font-size: var(--apm-text-md); color: var(--apm-text-secondary); line-height: 1.6; flex: 1; }
.apm-welcome-desc b { color: var(--apm-text-bright); font-weight: 600; }
.apm-welcome-footer { padding: 14px 28px 20px; display: flex; align-items: center; justify-content: space-between; }
.apm-welcome-dots { display: flex; gap: 6px; }
.apm-welcome-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--apm-control-muted); transition: all 0.2s; }
.apm-welcome-dot.active { background: var(--apm-accent); width: 20px; border-radius: 4px; }
.apm-welcome-nav { display: flex; gap: 8px; align-items: center; }
.apm-welcome-skip { background: none; border: none; color: var(--apm-text-disabled); cursor: pointer; font-size: var(--apm-text-sm); padding: 6px 10px; transition: color 0.15s; }
.apm-welcome-skip:hover { color: var(--apm-text-secondary); }
.apm-welcome-next { background: var(--apm-accent); color: white; border: none; border-radius: var(--apm-radius); padding: 8px 20px; font-weight: bold; font-size: var(--apm-text-md); cursor: pointer; transition: filter 0.15s; }
.apm-welcome-next:hover { filter: brightness(1.15); }
.apm-welcome-page { display: none; flex-direction: column; }
.apm-welcome-page.active { display: flex; }

/* Welcome landing page (page 0) */
.apm-welcome-landing { text-align: center; align-items: center; }
.apm-welcome-landing .apm-welcome-icon { font-size: 44px; margin-bottom: 10px; }
.apm-welcome-landing .apm-welcome-title { font-size: 22px; }
.apm-welcome-subtitle { margin: 0 0 20px; font-size: var(--apm-text-md); color: var(--apm-text-muted); line-height: 1.5; }
.apm-welcome-theme-row { display: flex; align-items: center; justify-content: center; gap: 12px; margin-top: 4px; }
.apm-welcome-theme-label { font-size: var(--apm-text-sm); color: var(--apm-text-secondary); font-weight: 600; }
.apm-welcome-theme-select { height: 32px; padding: 0 10px; border-radius: var(--apm-radius); border: 1px solid var(--apm-border-strong); background: var(--apm-surface-inset); color: var(--apm-text-primary); font-size: var(--apm-text-md); font-weight: bold; cursor: pointer; }
.apm-welcome-landing-btns { display: flex; flex-direction: column; gap: 8px; align-items: center; width: 100%; margin-top: 20px; }
.apm-welcome-start-btn { background: var(--apm-accent); color: white; border: none; border-radius: var(--apm-radius); padding: 10px 28px; font-weight: bold; font-size: var(--apm-text-md); cursor: pointer; transition: filter 0.15s; width: 100%; }
.apm-welcome-start-btn:hover { filter: brightness(1.15); }
.apm-welcome-theme-tip { margin: 6px 0 0; font-size: var(--apm-text-sm); color: var(--apm-text-muted); font-style: italic; }
.apm-welcome-skip-link { background: none; border: none; color: var(--apm-text-disabled); cursor: pointer; font-size: var(--apm-text-sm); padding: 4px; transition: color 0.15s; text-decoration: underline; }
.apm-welcome-skip-link:hover { color: var(--apm-text-secondary); }
.apm-welcome-tour-nav { display: none; }

/* =========================
 * Quick Book Labor Panel
 * ========================= */
.apm-lb-popup { position: fixed; z-index: 1000000; width: 500px; padding: 15px; background: var(--apm-surface-0); border: 1px solid var(--apm-border-strong); border-radius: var(--apm-radius-lg); box-shadow: var(--apm-shadow); display: none; gap: 15px; color: var(--apm-text-primary); visibility: hidden; user-select: none; font-family: var(--apm-font); font-size: var(--apm-text-base); }
.apm-lb-form { flex: 1; display: flex; flex-direction: column; gap: 10px; }
.apm-lb-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px; }
.apm-lb-title { margin: 0; font-size: var(--apm-text-lg); color: var(--apm-accent); font-weight: 600; }
.apm-lb-close { background: none; border: none; color: var(--apm-text-disabled); cursor: pointer; font-size: 14px; padding: 4px; transition: color 0.15s; }
.apm-lb-close:hover { color: var(--apm-text-primary); }

/* Date section */
.apm-lb-date-row { cursor: pointer; padding: 6px 10px; border: 1px solid var(--apm-border); border-radius: var(--apm-radius-sm); transition: all 0.2s; background: var(--apm-surface-inset); display: flex; gap: 5px; align-items: center; }
.apm-lb-date-row:hover { border-color: var(--apm-accent); background: var(--apm-accent-subtle); }
.apm-lb-date-label { width: 50px; cursor: pointer; color: var(--apm-text-secondary); font-size: var(--apm-text-sm); font-weight: 600; }
.apm-lb-date-input { flex: 1; background: transparent; border: none; color: var(--apm-text-primary); cursor: pointer; font-size: var(--apm-text-base); font-family: inherit; }
.apm-lb-date-input::-webkit-calendar-picker-indicator { cursor: pointer !important; filter: invert(0.7); opacity: 0.7; transition: opacity 0.15s; }
.apm-lb-date-row:hover .apm-lb-date-input::-webkit-calendar-picker-indicator { opacity: 1; }

/* Hint text */
.apm-lb-hint { font-size: var(--apm-text-xs); color: var(--apm-text-muted); margin: -4px 0 2px 0; font-style: italic; opacity: 0.8; }

/* Preset buttons */
.apm-lb-presets { display: flex; flex-wrap: wrap; gap: 4px; max-width: 250px; }
.apm-lb-preset { padding: 5px 10px; background: var(--apm-surface-raised); border: 1px solid var(--apm-border); color: var(--apm-text-primary); border-radius: var(--apm-radius-sm); cursor: pointer; font-size: var(--apm-text-sm); font-weight: 600; transition: all 0.15s; }
.apm-lb-preset:hover { border-color: var(--apm-accent); background: var(--apm-accent-subtle); color: var(--apm-accent); }
.apm-lb-preset.active { border-color: var(--apm-accent); background: var(--apm-accent); color: var(--apm-text-on-accent); }
.apm-lb-presets.correction-mode .apm-lb-preset { border-color: var(--apm-danger); color: var(--apm-danger); }
.apm-lb-presets.correction-mode .apm-lb-preset:hover { background: var(--apm-danger-subtle); border-color: var(--apm-danger); color: var(--apm-danger); }
.apm-lb-presets.correction-mode .apm-lb-preset.active { background: var(--apm-danger); border-color: var(--apm-danger); color: var(--apm-text-on-accent); }

/* Hours input row */
.apm-lb-hours-row { display: flex; gap: 8px; align-items: center; }
.apm-lb-hours-input { flex: 1; height: 32px; background: var(--apm-surface-sunken); border: 1px solid var(--apm-border); border-radius: var(--apm-radius-sm); color: var(--apm-text-primary); padding: 0 10px; font-size: var(--apm-text-md); outline: none; transition: border-color 0.2s; font-family: var(--apm-font-mono); }
.apm-lb-hours-input:focus { border-color: var(--apm-accent); }
.apm-lb-hours-input::placeholder { color: var(--apm-text-disabled); }

/* Correction toggle */
.apm-lb-correction { display: flex; align-items: center; gap: 8px; padding: 6px 10px; background: var(--apm-danger-subtle); border: 1px solid var(--apm-danger); border-radius: var(--apm-radius-sm); cursor: pointer; transition: all 0.2s; }
.apm-lb-correction:hover { background: rgba(231, 76, 60, 0.2); }
.apm-lb-correction-text { font-size: var(--apm-text-sm); color: var(--apm-danger); font-weight: bold; white-space: nowrap; }
.apm-lb-correction input[type="checkbox"] { cursor: pointer; width: 14px; height: 14px; margin: 0; accent-color: var(--apm-danger); }

/* Type toggle */
.apm-lb-type-row { display: inline-flex; border: 1px solid var(--apm-border); border-radius: var(--apm-radius-sm); overflow: hidden; align-self: stretch; }
.apm-lb-type-btn { flex: 1; background: transparent; border: none; color: var(--apm-text-disabled); padding: 6px 16px; font-size: var(--apm-text-sm); font-weight: 600; cursor: pointer; transition: all 0.15s; text-align: center; }
.apm-lb-type-btn.active { background: var(--apm-accent); color: var(--apm-text-on-accent); }
.apm-lb-type-btn:not(.active):hover { color: var(--apm-text-secondary); background: rgba(255,255,255,0.03); }

/* Book button */
.apm-lb-book-btn { padding: 10px; background: var(--apm-success); border: none; color: white; border-radius: var(--apm-radius); font-weight: bold; cursor: pointer; margin-top: 5px; font-size: var(--apm-text-md); transition: filter 0.15s, transform 0.1s; }
.apm-lb-book-btn:hover { filter: brightness(1.15); }
.apm-lb-book-btn:active { transform: scale(0.98); }

/* Summary sidebar */
.apm-lb-summary { width: 170px; border-left: 1px solid var(--apm-border); padding-left: 15px; display: flex; flex-direction: column; min-height: 230px; }
.apm-lb-summary-title { margin: 0 0 10px 0; font-size: var(--apm-text-md); color: var(--apm-text-muted); text-transform: uppercase; letter-spacing: 1px; font-weight: 600; }
.apm-lb-summary-content { flex: 1; overflow-y: hidden; display: flex; flex-direction: column; gap: 8px; }
.apm-lb-summary-row { display: flex; justify-content: space-between; font-size: var(--apm-text-md); padding: 4px 0; border-bottom: 1px solid var(--apm-border); }
.apm-lb-summary-day { color: var(--apm-text-tertiary); }
.apm-lb-summary-hours { color: var(--apm-success); font-weight: bold; }
.apm-lb-summary-total { margin-top: auto; padding-top: 10px; font-weight: bold; font-size: var(--apm-text-lg); display: flex; justify-content: space-between; color: var(--apm-text-bright); }
.apm-lb-summary-footer { border-top: 1px solid var(--apm-border); padding-top: 10px; margin-top: 10px; }
.apm-lb-night-label { display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: var(--apm-text-sm); color: var(--apm-warning); }
.apm-lb-night-label input[type="checkbox"] { accent-color: var(--apm-warning); }

/* Summary states */
.apm-lb-summary-loading { font-size: var(--apm-text-base); color: var(--apm-text-disabled); text-align: center; margin-top: 20px; }
.apm-lb-summary-error { font-size: var(--apm-text-sm); color: var(--apm-danger); text-align: center; margin-top: 15px; padding: 0 10px; }
.apm-lb-summary-empty { font-size: var(--apm-text-sm); color: var(--apm-text-disabled); text-align: center; padding-top: 20px; }

/* Quick Book trigger button */
.apm-lb-trigger { padding: 4px 12px; background: linear-gradient(135deg, var(--apm-warning), var(--apm-warning-dark)); color: white; border: none; border-radius: 12px; font-weight: bold; cursor: pointer; font-size: var(--apm-text-sm); transition: filter 0.15s, transform 0.1s; box-shadow: 0 2px 8px rgba(230, 126, 34, 0.4); }
.apm-lb-trigger:hover { filter: brightness(1.15); transform: translateY(-1px); box-shadow: 0 3px 12px rgba(230, 126, 34, 0.5); }

/* AutoFill trigger button */
.apm-af-trigger { padding: 4px 12px; background: linear-gradient(135deg, var(--apm-success), var(--apm-success-dark)); color: white; border: none; border-radius: 12px; font-weight: bold; cursor: pointer; font-size: var(--apm-text-sm); z-index: 10; line-height: 1; transition: filter 0.15s, transform 0.1s; box-shadow: 0 2px 8px rgba(26, 188, 156, 0.25); }
.apm-af-trigger:hover { filter: brightness(1.15); transform: translateY(-1px); box-shadow: 0 3px 12px rgba(26, 188, 156, 0.4); }

/* Toolbar button hover (CSS-native, replaces JS mouseover/mouseout) */
#apm-forecast-ext-btn:hover, #apm-settings-ext-btn:hover { color: var(--apm-text-primary) !important; }
`;
  function injectStaticStyles() {
    if (document.getElementById("apm-static-styles")) return;
    const style = document.createElement("style");
    style.id = "apm-static-styles";
    style.textContent = APM_STATIC_STYLES;
    (document.head || document.documentElement).appendChild(style);
  }
  var SVG_CLOUD = `
<svg viewBox="0 0 24 24" width="22" height="22" style="vertical-align: text-bottom; margin-bottom: 2px; overflow: visible;">
    <!-- SVG fill attributes don't support var() \u2014 keeping raw hex -->
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

  // src/core/frame-manager.js
  var _gridObservers = /* @__PURE__ */ new Map();
  var _discoveryBurstRegistered = false;
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
    try {
      if (LaborBooker && LaborBooker.init) LaborBooker.init(win);
    } catch (e) {
      APMLogger.error("FrameManager", "LaborBooker.init failed for frame \u2014 continuing observer setup:", e);
    }
    APMLogger.debug("FrameManager", "Setting up Centralized Reactive Observer for:", win.location.href);
    const observer = new MutationObserver((mutations) => {
      let shouldCheckGrid = false;
      for (const m of mutations) {
        if (m.type === "childList") {
          let hasPotentialGrid = false;
          for (let i = 0; i < m.addedNodes.length; i++) {
            const n = m.addedNodes[i];
            if (n.nodeType === 1 && (n.classList?.contains("x-grid-item-container") || n.classList?.contains("x-grid-view") || n.classList?.contains("x-panel-body") || // Generic panel body for tab switches
            n.tagName === "IFRAME")) {
              hasPotentialGrid = true;
              break;
            }
          }
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
    const target = doc.body || doc.documentElement;
    if (target) {
      observer.observe(target, { childList: true, subtree: true });
    } else {
      APMLogger.debug("FrameManager", "Skipping observer: document not ready or empty");
    }
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
    if (!_discoveryBurstRegistered) {
      _discoveryBurstRegistered = true;
      AjaxHooks.onRequestComplete("discovery-burst", (win, conn, response, options) => {
        const url2 = options?.url || "";
        const upperUrl = url2.toUpperCase();
        if (upperUrl.includes("REQUEST") || upperUrl.includes("SEARCH") || upperUrl.includes("GRID") || upperUrl.includes(".XMLHTTP") || upperUrl.includes(".HDR") || upperUrl.includes(".LST") || upperUrl.includes("GRIDDATA") || upperUrl.includes("GETCACHE") || upperUrl.includes("COMMON")) {
          setTimeout(() => {
            APMApi.triggerDiscoveryBurst?.();
            APMApi.triggerResponsiveInjections?.();
            if (typeof applyTabConsistency === "function") applyTabConsistency();
            if (typeof applyGridConsistency === "function") applyGridConsistency();
            debouncedProcessColorCodeGrid(win.document);
          }, 100);
        }
      });
    }
    attachObserverToDoc(document, window);
    AjaxHooks.install(window);
    document.querySelectorAll("iframe").forEach((f) => {
      if (f.hasApmLoadBound) return;
      f.addEventListener("load", () => {
        APMApi.checkSession?.();
        setTimeout(scanAndAttachFrames, 250);
      });
      f.hasApmLoadBound = true;
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
          ExtConsistencyManager.setupComponentWatcher(fw);
          AjaxHooks.install(fw);
          if (!fd.hasApmEventsBound && !fw.__apmEventsBound) {
            const bindHooks = () => {
              try {
                if (fd.hasApmEventsBound || fw.__apmEventsBound) return;
                fd.addEventListener("keydown", (e) => {
                  APMApi.get("checkHotkey")?.(e);
                }, true);
                fd.addEventListener("mousedown", (e) => {
                  APMApi.get("handleGlobalClick")?.(e);
                }, true);
                fd.addEventListener("click", (e) => {
                  if (e.target.closest?.(".apm-nametag") || e.target.closest?.(".apm-copy-icon")) {
                    e.preventDefault();
                    e.stopPropagation();
                  }
                }, true);
                UIManager.hookFrame(fw);
                fd.hasApmEventsBound = true;
                fw.__apmEventsBound = true;
              } catch (err) {
                APMLogger.debug("FrameManager", "Failed to bind events:", err);
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
        APMLogger.debug("FrameManager", "Cannot access frame:", e.message);
      }
    });
  }

  // src/boot.js
  init_state();
  init_utils();
  init_logger();
  init_constants();
  init_scheduler();

  // src/core/date-override.js
  init_state();
  init_logger();
  init_utils();
  function initDateOverride() {
    if (!isTopFrame()) return;
    let retries = 0;
    const applyOverride = () => {
      if (typeof Ext !== "undefined" && Ext.form && Ext.form.field && Ext.form.field.Date) {
        if (!apmGeneralSettings.dateOverrideEnabled) return;
        const fmt = apmGeneralSettings.dateFormat === "eu" ? "d/m/Y" : apmGeneralSettings.dateFormat === "mon" ? "d-M-Y" : "m/d/Y";
        Ext.override(Ext.form.field.Date, {
          format: fmt,
          altFormats: "m/d/Y|n/j/Y|n/j/y|m/j/y|n/d/y|m/j/Y|n/d/Y|m-d-y|m-d-Y|m/d|m-d|md|mdy|mdY|d|Y-m-d|n-j|n/j|d/m/Y|j/n/Y|j/n/y"
        });
        APMLogger.info("APM Master", "Date format override applied.");
      } else if (++retries < 50) {
        setTimeout(applyOverride, 100);
      } else {
        APMLogger.warn("DateOverride", "Ext.form.field.Date not found after 50 retries");
      }
    };
    applyOverride();
  }

  // src/core/sync.js
  init_state();
  init_constants();
  init_logger();
  init_api();
  var _syncInitialized = false;
  function initGlobalSync() {
    if (typeof window === "undefined") return;
    if (_syncInitialized) return;
    _syncInitialized = true;
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
        case SESSION_STORAGE_KEY:
          handleSessionSync(e.newValue);
          break;
      }
    });
  }
  function handleGeneralSettingsSync(data) {
    try {
      const next = JSON.parse(data);
      Object.assign(apmGeneralSettings, next);
      const invalidate = APMApi.get("invalidateColorCodeCache");
      if (typeof invalidate === "function") invalidate();
    } catch (err) {
      APMLogger.warn("Sync", "Failed to sync general settings", err);
    }
  }
  function handleSessionSync(data) {
    try {
      const session = JSON.parse(data);
      const ALLOWED_KEYS = ["eamid", "tenant", "user"];
      for (const key of ALLOWED_KEYS) {
        if (Object.prototype.hasOwnProperty.call(session, key)) {
          AppState.session[key] = session[key];
        }
      }
      if (AppState.session.isInitialized) {
        window.dispatchEvent(new CustomEvent("APM_SESSION_UPDATED", {
          detail: { ...AppState.session }
        }));
      }
    } catch (err) {
      APMLogger.warn("Sync", "Failed to sync session", err);
    }
  }
  function handleColorCodeRulesSync(data) {
    try {
      const parsed = JSON.parse(data);
      if (parsed && parsed._v !== void 0 && Array.isArray(parsed.rules)) {
        AppState.colorCode.rules = parsed.rules;
      } else if (Array.isArray(parsed)) {
        AppState.colorCode.rules = parsed;
      } else {
        APMLogger.warn("Sync", "Unexpected CC rules format, skipping sync");
        return;
      }
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
      if (next.autofill && Object.keys(next.autofill).length > 0) {
        AppState.autofill.presets.autofill = next.autofill;
      }
      if (next.config) AppState.autofill.presets.config = next.config;
      window.dispatchEvent(new CustomEvent("APM_PRESETS_SYNC_REQUIRED"));
    } catch (err) {
      APMLogger.warn("Sync", "Failed to sync autofill presets", err);
    }
  }

  // src/boot.js
  init_context();
  init_feature_flags();
  init_diagnostics();

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
  var forecastState = {
    week: "0",
    days: [false, true, true, true, true, true, false],
    // Mon-Fri default
    eqText: "",
    eqdescText: "",
    typeText: "",
    descOp: "Contains",
    descText: "",
    todayOnly: false,
    viewMode: "standard",
    // 'simple' | 'standard' | 'advanced'
    isCustomDateMode: false,
    customStart: "",
    customEnd: "",
    target: "WSJOBS"
  };
  function updateForecastState(updates) {
    forecastState = { ...forecastState, ...updates };
  }
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
  function setSelectedProfileIdWithSync(id) {
    selectedProfileId = id;
    const profSelect = document.getElementById("eam-profile-select");
    if (profSelect) profSelect.value = id;
  }
  function loadPreferences() {
    try {
      const prefs = APMStorage.get(STORAGE_KEY);
      if (prefs) {
        if (prefs._v === void 0) {
          prefs._v = 0;
          APMLogger.debug("Forecast", "Preferences loaded as legacy v0");
        }
        if (prefs.orgs && Array.isArray(prefs.orgs)) {
          savedOrgs = prefs.orgs.filter((o) => o !== "All Sites" && o !== "-- All Sites --" && o !== "");
        }
        selectedOrg = prefs.selectedOrg !== void 0 && (prefs.selectedOrg === "" || savedOrgs.includes(prefs.selectedOrg)) ? prefs.selectedOrg : "";
        const profilesToLoad = prefs.customProfiles || prefs.profiles || prefs.dataspys;
        savedProfiles = Array.isArray(profilesToLoad) ? profilesToLoad : [];
        selectedProfileId = prefs.selectedProfileId || "";
        forecastState = {
          week: prefs.week || "0",
          days: Array.isArray(prefs.days) && prefs.days.length === 7 ? prefs.days : [false, true, true, true, true, true, false],
          eqText: prefs.eqText || "",
          eqdescText: prefs.eqdescText || "",
          typeText: prefs.typeText || "",
          descOp: prefs.descOp || "Contains",
          descText: prefs.descText || "",
          todayOnly: !!prefs.todayOnly,
          viewMode: prefs.viewMode || (prefs.isSimpleMode === false ? "advanced" : prefs.isSimpleMode === true ? "simple" : "standard"),
          isCustomDateMode: !!prefs.isCustomDateMode,
          customStart: prefs.customStart || "",
          customEnd: prefs.customEnd || "",
          target: prefs.target || "WSJOBS"
        };
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
    const prefsToSave = {
      _v: 2,
      ...forecastState,
      orgs: savedOrgs,
      selectedOrg,
      customProfiles: savedProfiles,
      selectedProfileId
    };
    try {
      APMStorage.set(STORAGE_KEY, prefsToSave);
    } catch (e) {
      APMLogger.error("Forecast", "Failed to save preferences:", e);
    }
  }

  // src/modules/forecast/components/forecast-profile-manager.js
  init_dom_helpers();
  init_logger();
  init_toast();
  function createProfileManager() {
    try {
      const modal = el("div", { id: "apm-spies-modal", className: "apm-modal-overlay apm-ui-panel", style: { display: "none" } }, [
        el("div", { className: "apm-modal-content", style: { width: "420px" } }, [
          el("div", { className: "apm-modal-header" }, [
            el("h4", { style: { margin: 0, color: "var(--apm-accent)" } }, "Custom Dataspy Builder"),
            el("button", { id: "apm-spies-close", className: "eam-fc-close-btn" }, "\u2716")
          ]),
          el("div", { className: "apm-modal-body", style: { padding: "15px" } }, [
            el("div", { className: "eam-fc-row", style: { marginBottom: "10px" } }, [
              el("label", { className: "eam-fc-label", style: { width: "90px" } }, "Applies To:"),
              el("select", { id: "spy-target", className: "eam-fc-select", style: { flex: 1, color: "#e67e22", fontWeight: "bold" } }, [
                el("option", { value: "WSJOBS" }, "Work Orders"),
                el("option", { value: "CTJOBS" }, "Compliance Work Orders")
              ])
            ]),
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
                el("label", { className: "eam-fc-label", style: { display: "block", marginBottom: "4px" } }, "Shift:"),
                el("input", { type: "text", id: "spy-shift", className: "eam-fc-input-text", placeholder: "A, B...", style: { width: "100%" } })
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
              el("button", { id: "spy-btn-delete", className: "eam-fc-btn-today", style: { background: "var(--apm-danger)", borderColor: "var(--apm-danger)", flex: 0.4 } }, "Delete")
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
    } catch (e) {
      APMLogger.error("ProfileManager", "Build failed:", e);
      return el("div");
    }
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
      modal.querySelector("#spy-target").value = prof ? prof.target || "WSJOBS" : "WSJOBS";
      modal.querySelector("#spy-name").value = prof ? prof.name : "";
      modal.querySelector("#spy-eq").value = prof ? prof.equipment || "" : "";
      modal.querySelector("#spy-eqdesc").value = prof ? prof.eqDesc || "" : "";
      modal.querySelector("#spy-desc").value = prof ? prof.desc || "" : "";
      modal.querySelector("#spy-assigned").value = prof ? prof.assigned || "" : "";
      modal.querySelector("#spy-shift").value = prof ? prof.shift || "" : "";
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
        target: modal.querySelector("#spy-target").value === "CTJOBS" ? "CTJOBS" : "WSJOBS",
        equipment: modal.querySelector("#spy-eq").value.trim(),
        eqDesc: modal.querySelector("#spy-eqdesc").value.trim(),
        desc: modal.querySelector("#spy-desc").value.trim(),
        assigned: modal.querySelector("#spy-assigned").value.trim(),
        shift: modal.querySelector("#spy-shift").value.trim(),
        type: modal.querySelector("#spy-type").value.trim(),
        org: modal.querySelector("#spy-org").value.trim(),
        exDates: modal.querySelector("#spy-ex-dates").value.trim()
      };
      APMLogger.info("Forecast", `Saving Profile: ${name}`, profData);
      const existingIdx = savedProfiles.findIndex((p) => p.id === id);
      if (existingIdx >= 0) setSavedProfiles(savedProfiles.map((p, i) => i === existingIdx ? profData : p));
      else setSavedProfiles([...savedProfiles, profData]);
      setSelectedProfileId(id);
      renderProfiles_Global();
      updateProfileUI_Global();
      saveAllPreferences();
      showToast("Profile saved!", "var(--apm-success)");
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
    spyMgrSelect.innerHTML = "";
    spyMgrSelect.appendChild(el("option", { value: "" }, "-- Create New Profile --"));
    savedProfiles.forEach((p) => {
      spyMgrSelect.appendChild(el("option", { value: p.id }, p.name));
    });
    profSelect.innerHTML = "";
    profSelect.appendChild(el("option", { value: "manual" }, "[ Manual Native Search ]"));
    savedProfiles.forEach((p) => {
      const suffix = p.target === "CTJOBS" ? " [CT]" : "";
      profSelect.appendChild(el("option", { value: p.id }, `Profile: ${p.name}${suffix}`));
    });
    profSelect.value = selectedProfileId || "manual";
  }
  var WEEK_LABELS = { "0": "This Week", "1": "Next 2 Weeks", "2": "Next 3 Weeks", "3": "Next 4 Weeks" };
  var DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  function buildDateSummary(prof) {
    if (!prof || !prof.dateOverride) return "";
    const weekLabel = WEEK_LABELS[String(prof.weeks)] || "This Week";
    let summary = weekLabel;
    if (prof.arbitraryDays && Array.isArray(prof.days)) {
      const selected = prof.days.map((on, i) => on ? DAY_NAMES[i] : null).filter(Boolean);
      if (selected.length > 0 && selected.length < 7) {
        summary += ` (${selected.join(", ")} only)`;
      }
    }
    return summary;
  }
  function updateProfileUI_Global() {
    const profSelect = document.getElementById("eam-profile-select");
    const summary = document.getElementById("eam-profile-summary");
    const summaryText = document.getElementById("eam-profile-summary-text");
    const manualInputs = document.getElementById("eam-manual-inputs");
    const descBox = document.querySelector(".eam-fc-desc-box");
    const scheduleSection = document.getElementById("eam-schedule-section");
    if (!profSelect) return;
    const selectedId = profSelect.value;
    if (selectedId === "manual") {
      if (summary) summary.style.display = "none";
      if (manualInputs) manualInputs.style.display = "block";
      if (descBox) descBox.style.display = "flex";
      if (scheduleSection) scheduleSection.style.display = "";
    } else {
      const prof = savedProfiles.find((p) => p.id === selectedId);
      if (prof) {
        if (summary) summary.style.display = "block";
        if (manualInputs) manualInputs.style.display = "none";
        if (descBox) descBox.style.display = "none";
        const details = [];
        if (prof.target === "CTJOBS") details.push("Target: Compliance");
        if (prof.equipment) details.push(`Eq: ${prof.equipment}`);
        if (prof.eqDesc) details.push(`EqDesc: ${prof.eqDesc}`);
        if (prof.desc) details.push(`Desc: ${prof.desc}`);
        if (prof.assigned) details.push(`Assigned: ${prof.assigned}`);
        if (prof.shift) details.push(`Shift: ${prof.shift}`);
        if (prof.type) details.push(`Type: ${prof.type}`);
        if (prof.org) details.push(`Org: ${prof.org}`);
        const dateSummary = buildDateSummary(prof);
        if (dateSummary) details.push(`Dates: ${dateSummary}`);
        summaryText.textContent = details.length > 0 ? details.join(" | ") : "No specific filters set (All Records)";
        if (scheduleSection) scheduleSection.style.display = prof.dateOverride ? "none" : "";
      }
    }
  }

  // src/modules/forecast/components/filter-builder.js
  init_dom_helpers();
  init_toast();
  init_logger();
  init_utils();
  var FIELD_CONFIG = [
    { key: "desc", label: "Description", color: "#3498db", placeholder: "pump, motor..." },
    { key: "equipment", label: "Equipment", color: "#2ecc71", placeholder: "PUMP-001" },
    { key: "eqDesc", label: "Equip. Description", color: "#1abc9c", placeholder: "centrifugal" },
    { key: "assigned", label: "Assigned To", color: "#e67e22", placeholder: "JSMITH" },
    { key: "shift", label: "Shift", color: "#9b59b6", placeholder: "A, B" },
    { key: "type", label: "WO Type", color: "#f39c12", placeholder: "PM, REPAIR" },
    { key: "org", label: "Organization", color: "#95a5a6", placeholder: "MILL1" }
  ];
  var OPERATORS = [
    { value: "CONTAINS", label: "Contains", hint: "Matches if the field has this keyword anywhere" },
    { value: "NOTCONTAINS", label: "Does Not Contain", hint: "Hides work orders that match this keyword" },
    { value: "=", label: "Exact Match", hint: "Only matches if the field is exactly this value" },
    { value: "!=", label: "Not Equal To", hint: "Hides work orders where this field equals this value" },
    { value: "BEGINS", label: "Starts With", hint: "Matches if the field begins with this text" },
    { value: "ENDS", label: "Ends With", hint: "Matches if the field ends with this text" }
  ];
  var OP_LABELS = {
    "CONTAINS": "Contains",
    "NOTCONTAINS": "Excludes",
    "=": "Exact",
    "!=": "Not equal",
    "BEGINS": "Starts with",
    "ENDS": "Ends with"
  };
  var WEEK_OPTIONS = [
    { value: "0", label: "This Week" },
    { value: "1", label: "Next 2 Weeks" },
    { value: "2", label: "Next 3 Weeks" },
    { value: "3", label: "Next 4 Weeks" }
  ];
  var DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  function createEmptyState() {
    return {
      profileId: null,
      profileName: "",
      target: "WSJOBS",
      dateOverride: false,
      weeks: "0",
      arbitraryDays: false,
      days: [true, true, true, true, true, true, true],
      fields: {
        desc: [],
        equipment: [],
        eqDesc: [],
        assigned: [],
        shift: [],
        type: [],
        org: []
      }
    };
  }
  function serializeField(chips) {
    if (!chips.length) return "";
    return chips.map((c) => {
      switch (c.operator) {
        case "NOTCONTAINS":
          return "!" + c.keyword;
        case "=":
          return "=" + c.keyword;
        case "!=":
          return "!=" + c.keyword;
        case "BEGINS":
          return "^" + c.keyword;
        case "ENDS":
          return c.keyword + "$";
        default:
          return c.keyword;
      }
    }).join(", ");
  }
  function parseField(val) {
    if (!val) return [];
    return val.split(",").map((s) => s.trim()).filter((s) => s).map((kw) => {
      let operator = "CONTAINS";
      let keyword = kw;
      if (keyword.startsWith("!")) {
        operator = "NOTCONTAINS";
        keyword = keyword.substring(1);
      }
      if (keyword.startsWith("=")) {
        operator = operator === "NOTCONTAINS" ? "!=" : "=";
        keyword = keyword.substring(1);
      } else if (keyword.startsWith("^")) {
        operator = "BEGINS";
        keyword = keyword.substring(1);
      } else if (keyword.endsWith("$")) {
        operator = "ENDS";
        keyword = keyword.substring(0, keyword.length - 1);
      }
      return { keyword, operator };
    });
  }
  function serializeToProfile(state) {
    const prof = {
      id: state.profileId || "prof_" + Date.now(),
      name: state.profileName,
      target: state.target,
      equipment: serializeField(state.fields.equipment),
      eqDesc: serializeField(state.fields.eqDesc),
      desc: serializeField(state.fields.desc),
      assigned: serializeField(state.fields.assigned),
      shift: serializeField(state.fields.shift),
      type: serializeField(state.fields.type),
      org: serializeField(state.fields.org),
      exDates: ""
      // computed at query time, not stored
    };
    if (state.dateOverride) {
      prof.dateOverride = true;
      prof.weeks = state.weeks;
      prof.arbitraryDays = state.arbitraryDays;
      prof.days = [...state.days];
    }
    return prof;
  }
  function deserializeFromProfile(prof) {
    const state = createEmptyState();
    state.profileId = prof.id;
    state.profileName = prof.name || "";
    state.target = prof.target || "WSJOBS";
    for (const fc of FIELD_CONFIG) {
      state.fields[fc.key] = parseField(prof[fc.key]);
    }
    if (prof.dateOverride) {
      state.dateOverride = true;
      state.weeks = prof.weeks || "0";
      state.arbitraryDays = !!prof.arbitraryDays;
      state.days = Array.isArray(prof.days) ? [...prof.days] : [true, true, true, true, true, true, true];
    }
    return state;
  }
  function buildPreviewText(state) {
    const parts = [];
    for (const fc of FIELD_CONFIG) {
      const chips = state.fields[fc.key];
      if (!chips || !chips.length) continue;
      const includes = chips.filter((c) => !["NOTCONTAINS", "!="].includes(c.operator));
      const excludes = chips.filter((c) => ["NOTCONTAINS", "!="].includes(c.operator));
      const fieldSpan = el("span", { className: "fb-preview-field" }, fc.label);
      const fieldParts = [fieldSpan, " "];
      if (includes.length) {
        includes.forEach((inc, i) => {
          if (i > 0) fieldParts.push(el("span", { className: "fb-preview-joiner" }, " or "));
          fieldParts.push(OP_LABELS[inc.operator].toLowerCase() + " ");
          fieldParts.push(el("span", { className: "fb-preview-keyword" }, `'${inc.keyword}'`));
        });
      }
      if (excludes.length) {
        if (includes.length) fieldParts.push(el("span", { className: "fb-preview-joiner" }, " and "));
        excludes.forEach((exc, i) => {
          if (i > 0) fieldParts.push(el("span", { className: "fb-preview-joiner" }, " and "));
          fieldParts.push(OP_LABELS[exc.operator].toLowerCase() + " ");
          fieldParts.push(el("span", { className: "fb-preview-keyword" }, `'${exc.keyword}'`));
        });
      }
      parts.push(fieldParts);
    }
    if (parts.length === 0 && !state.dateOverride) {
      return el("span", { className: "fb-preview-empty" }, "No filters applied \u2014 all records will be shown");
    }
    const container = el("span");
    if (parts.length > 0) {
      container.appendChild(document.createTextNode("Show work orders where "));
      parts.forEach((fieldParts, fi) => {
        if (fi > 0) container.appendChild(el("span", { className: "fb-preview-joiner" }, ", and "));
        fieldParts.forEach((part) => {
          if (typeof part === "string") container.appendChild(document.createTextNode(part));
          else container.appendChild(part);
        });
      });
    }
    if (state.dateOverride) {
      const weekLabel = WEEK_OPTIONS.find((w) => w.value === state.weeks)?.label || "This Week";
      const dateText = parts.length > 0 ? ", " : "Show work orders ";
      container.appendChild(document.createTextNode(dateText));
      container.appendChild(el("span", { className: "fb-preview-joiner" }, "for "));
      container.appendChild(el("span", { className: "fb-preview-keyword" }, weekLabel));
      if (state.arbitraryDays) {
        const selectedDays = state.days.map((on, i) => on ? DAY_LABELS[i] : null).filter(Boolean);
        if (selectedDays.length > 0 && selectedDays.length < 7) {
          container.appendChild(document.createTextNode(", "));
          container.appendChild(el("span", { className: "fb-preview-keyword" }, selectedDays.join("\u2013") + " only"));
        }
      }
    }
    return container;
  }
  function updateDayVisuals(dayContainer, state) {
    const buttons = Array.from(dayContainer.querySelectorAll(".fb-day-btn"));
    buttons.forEach((btn, i) => {
      const isOn = state.days[i];
      btn.classList.toggle("fb-day-on", isOn);
      btn.classList.toggle("fb-day-off", !isOn);
      btn.querySelector(".fb-day-x").style.display = isOn ? "none" : "block";
    });
  }
  function createFilterBuilder() {
    try {
      let refreshChipList = function() {
        chipListEl.innerHTML = "";
        let hasAny = false;
        for (const fc of FIELD_CONFIG) {
          const chips = state.fields[fc.key];
          if (!chips.length) continue;
          hasAny = true;
          const groupLabel = el("div", { className: "fb-chip-group-label", style: { color: fc.color } }, fc.label);
          chipListEl.appendChild(groupLabel);
          chips.forEach((chip, idx) => {
            const chipEl = el("div", {
              className: "fb-chip",
              style: { borderLeftColor: fc.color },
              title: `${OP_LABELS[chip.operator]}: ${chip.keyword}`
            }, [
              el("span", { className: "fb-chip-op", style: { color: fc.color } }, OP_LABELS[chip.operator]),
              el("span", { className: "fb-chip-text" }, chip.keyword),
              el("button", {
                className: "fb-chip-x",
                title: "Remove",
                onclick: () => {
                  state.fields[fc.key].splice(idx, 1);
                  refreshChipList();
                  refreshPreview();
                }
              }, "\xD7")
            ]);
            chipListEl.appendChild(chipEl);
          });
        }
        if (!hasAny) {
          chipListEl.appendChild(
            el(
              "div",
              { className: "fb-preview-empty", style: { padding: "12px", textAlign: "center" } },
              "No filters yet \u2014 add one above"
            )
          );
        }
      }, refreshPreview = function() {
        previewEl.innerHTML = "";
        previewEl.appendChild(buildPreviewText(state));
      }, updateHint = function() {
        const op = OPERATORS.find((o) => o.value === opSelect.value);
        hintEl.textContent = op ? op.hint : "";
      }, updatePlaceholder = function() {
        const fc = FIELD_CONFIG.find((f) => f.key === fieldSelect.value);
        keywordInput.placeholder = fc ? fc.placeholder : "Enter keyword...";
      }, addChip = function() {
        const field = fieldSelect.value;
        const operator = opSelect.value;
        const keyword = keywordInput.value.trim();
        if (!keyword) {
          keywordInput.style.borderColor = "var(--apm-danger)";
          setTimeout(() => {
            keywordInput.style.borderColor = "";
          }, 800);
          return;
        }
        const exists = state.fields[field].some((c) => c.keyword === keyword && c.operator === operator);
        if (exists) {
          showToast("This filter already exists", "#e67e22");
          return;
        }
        state.fields[field].push({ keyword, operator });
        keywordInput.value = "";
        keywordInput.focus();
        refreshChipList();
        refreshPreview();
      }, syncToTextMode = function() {
        if (!textContainer) return;
        for (const fc of FIELD_CONFIG) {
          const input = textContainer.querySelector(`#fb-text-${fc.key}`);
          if (input) input.value = serializeField(state.fields[fc.key]);
        }
      }, syncFromTextMode = function() {
        if (!textContainer) return;
        for (const fc of FIELD_CONFIG) {
          const input = textContainer.querySelector(`#fb-text-${fc.key}`);
          if (input) state.fields[fc.key] = parseField(input.value);
        }
      }, loadProfile = function(profId) {
        if (!profId) {
          state = createEmptyState();
        } else {
          const prof = savedProfiles.find((p) => p.id === profId);
          if (prof) {
            state = deserializeFromProfile(prof);
          } else {
            state = createEmptyState();
          }
        }
        nameInput.value = state.profileName;
        targetSelect.value = state.target;
        deleteBtn.style.display = state.profileId ? "inline-block" : "none";
        dateToggle.checked = state.dateOverride;
        state.arbitraryDays = state.dateOverride;
        dateSection.style.display = state.dateOverride ? "block" : "none";
        if (state.dateOverride) updateDayVisuals(dayContainer, state);
        if (isVisualMode) {
          refreshChipList();
        } else {
          syncToTextMode();
        }
        refreshPreview();
      }, saveProfile = function() {
        if (!isVisualMode) syncFromTextMode();
        const name = nameInput.value.trim();
        if (!name) {
          showToast("Please enter a profile name", "#e74c3c");
          nameInput.focus();
          return;
        }
        if (state.dateOverride && state.arbitraryDays && !state.days.some(Boolean)) {
          showToast("Select at least one day", "#e74c3c");
          return;
        }
        state.profileName = name;
        state.target = targetSelect.value;
        state.weeks = weekSelect.value;
        const profData = serializeToProfile(state);
        APMLogger.info("FilterBuilder", `Saving Profile: ${name}`, profData);
        const existingIdx = savedProfiles.findIndex((p) => p.id === profData.id);
        if (existingIdx >= 0) setSavedProfiles(savedProfiles.map((p, i) => i === existingIdx ? profData : p));
        else setSavedProfiles([...savedProfiles, profData]);
        setSelectedProfileId(profData.id);
        state.profileId = profData.id;
        renderProfiles_Global();
        updateProfileUI_Global();
        saveAllPreferences();
        renderProfileOptions();
        profileSelect.value = profData.id;
        deleteBtn.style.display = "inline-block";
        showToast("Profile saved!", "#2ecc71");
      }, deleteProfile = function() {
        const id = state.profileId;
        if (!id) return;
        if (!confirm("Delete this profile?")) return;
        setSavedProfiles(savedProfiles.filter((p) => p.id !== id));
        if (selectedProfileId === id) setSelectedProfileId("manual");
        renderProfiles_Global();
        updateProfileUI_Global();
        saveAllPreferences();
        renderProfileOptions();
        profileSelect.value = "";
        loadProfile(null);
        showToast("Profile deleted", "#e74c3c");
      }, renderProfileOptions = function() {
        profileSelect.innerHTML = "";
        profileSelect.appendChild(el("option", { value: "" }, "-- Create New Profile --"));
        savedProfiles.forEach((p) => {
          const suffix = p.target === "CTJOBS" ? " [CT]" : "";
          profileSelect.appendChild(el("option", { value: p.id }, `${p.name}${suffix}`));
        });
      }, buildTextMode = function() {
        const rows = FIELD_CONFIG.map(
          (fc) => el("div", { className: "eam-fc-row", style: { marginBottom: "6px" } }, [
            el("label", { className: "eam-fc-label", style: { width: "110px", minWidth: "110px" } }, fc.label + ":"),
            el("input", {
              type: "text",
              id: `fb-text-${fc.key}`,
              className: "eam-fc-input-text",
              placeholder: `e.g., ${fc.placeholder}`,
              style: { flex: "1" }
            })
          ])
        );
        return el("div", { className: "fb-text-mode" }, [
          el(
            "div",
            { style: { fontSize: "12px", color: "var(--apm-text-muted)", marginBottom: "8px", fontStyle: "italic" } },
            "Use commas to separate keywords. Prefixes: ! (exclude), = (exact), ^ (starts with). Suffix: $ (ends with)"
          ),
          ...rows
        ]);
      };
      let state = createEmptyState();
      let isVisualMode = true;
      let chipListEl, previewEl, hintEl, keywordInput, fieldSelect, opSelect;
      let dateSection, dayContainer, weekSelect, dateToggle;
      let profileSelect, nameInput, targetSelect, deleteBtn;
      let visualContainer, textContainer;
      const modeToggleVisual = el("button", { className: "fb-mode-btn fb-mode-active" }, "Visual");
      const modeToggleText = el("button", { className: "fb-mode-btn" }, "Text");
      modeToggleVisual.onclick = () => {
        if (isVisualMode) return;
        syncFromTextMode();
        isVisualMode = true;
        modeToggleVisual.classList.add("fb-mode-active");
        modeToggleText.classList.remove("fb-mode-active");
        visualContainer.style.display = "block";
        textContainer.style.display = "none";
        refreshChipList();
        refreshPreview();
      };
      modeToggleText.onclick = () => {
        if (!isVisualMode) return;
        isVisualMode = false;
        modeToggleText.classList.add("fb-mode-active");
        modeToggleVisual.classList.remove("fb-mode-active");
        visualContainer.style.display = "none";
        textContainer.style.display = "block";
        syncToTextMode();
      };
      fieldSelect = el(
        "select",
        { className: "fb-field-select" },
        FIELD_CONFIG.map((fc) => el("option", { value: fc.key }, fc.label))
      );
      fieldSelect.addEventListener("change", updatePlaceholder);
      opSelect = el(
        "select",
        { className: "fb-op-select" },
        OPERATORS.map((op) => el("option", { value: op.value }, op.label))
      );
      opSelect.addEventListener("change", updateHint);
      keywordInput = el("input", {
        type: "text",
        className: "fb-keyword-input",
        placeholder: FIELD_CONFIG[0].placeholder
      });
      keywordInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          addChip();
        }
      });
      hintEl = el("div", { className: "fb-hint" }, OPERATORS[0].hint);
      const addBtn = el("button", { className: "fb-add-btn", onclick: addChip }, "+ Add");
      chipListEl = el("div", { className: "fb-chip-list" });
      previewEl = el("div", { className: "fb-preview-text" });
      profileSelect = el("select", { className: "eam-fc-select", style: { flex: "1" } });
      profileSelect.addEventListener("change", () => loadProfile(profileSelect.value || null));
      nameInput = el("input", {
        type: "text",
        className: "eam-fc-input-text",
        placeholder: "Profile Name...",
        style: { flex: "1" }
      });
      targetSelect = el("select", { className: "eam-fc-select", style: { width: "140px" } }, [
        el("option", { value: "WSJOBS" }, "Work Orders"),
        el("option", { value: "CTJOBS" }, "Compliance WOs")
      ]);
      dateToggle = el("input", { type: "checkbox" });
      weekSelect = el(
        "select",
        { className: "eam-fc-select", style: { flex: "1" } },
        WEEK_OPTIONS.map((w) => el("option", { value: w.value }, w.label))
      );
      dayContainer = el(
        "div",
        { className: "fb-day-checkboxes" },
        DAY_LABELS.map((day, i) => {
          const xMark = el("span", { className: "fb-day-x", style: { display: "none" } }, "\u2716");
          const btn = el("button", {
            className: "fb-day-btn fb-day-on",
            title: `Click to exclude ${day}`,
            onclick: () => {
              state.days[i] = !state.days[i];
              updateDayVisuals(dayContainer, state);
              refreshPreview();
            }
          }, [
            el("span", { className: "fb-day-label" }, day),
            xMark
          ]);
          return btn;
        })
      );
      dateSection = el("div", { className: "fb-date-section", style: { display: "none" } }, [
        el("div", { className: "eam-fc-row", style: { marginBottom: "8px" } }, [
          el("label", { className: "eam-fc-label", style: { width: "80px" } }, "Weeks:"),
          weekSelect
        ]),
        dayContainer,
        el(
          "div",
          { className: "fb-hint", style: { textAlign: "center", marginTop: "4px" } },
          "Click a day to exclude it from the search range"
        )
      ]);
      dateToggle.addEventListener("change", () => {
        state.dateOverride = dateToggle.checked;
        state.arbitraryDays = state.dateOverride;
        dateSection.style.display = state.dateOverride ? "block" : "none";
        if (state.dateOverride) updateDayVisuals(dayContainer, state);
        refreshPreview();
      });
      weekSelect.addEventListener("change", () => {
        state.weeks = weekSelect.value;
        refreshPreview();
      });
      deleteBtn = el("button", {
        className: "fb-btn fb-btn-delete",
        style: { display: "none" },
        onclick: deleteProfile
      }, "Delete");
      const saveBtn = el("button", { className: "fb-btn fb-btn-save", onclick: saveProfile }, "Save Profile");
      const cancelBtn = el("button", { className: "fb-btn fb-btn-cancel" }, "Cancel");
      visualContainer = el("div", { className: "fb-visual-mode" }, [
        el("div", { className: "fb-add-row" }, [
          fieldSelect,
          opSelect,
          keywordInput,
          addBtn
        ]),
        hintEl,
        chipListEl
      ]);
      textContainer = buildTextMode();
      textContainer.style.display = "none";
      const modal = el("div", {
        id: "apm-filter-builder-modal",
        className: "apm-modal-overlay apm-ui-panel",
        style: { display: "none" }
      });
      applyZoomCompensation(modal);
      modal.append(
        el("div", { className: "apm-modal-content fb-modal", style: { width: "540px" } }, [
          // Header
          el("div", { className: "apm-modal-header" }, [
            el("div", { style: { display: "flex", alignItems: "center", gap: "10px" } }, [
              el("h4", { style: { margin: "0", color: "var(--apm-accent)" } }, "Dataspy Builder"),
              el("div", { className: "fb-mode-toggle" }, [modeToggleVisual, modeToggleText])
            ]),
            el("button", {
              className: "eam-fc-close-btn",
              onclick: (e) => {
                e.stopPropagation();
                modal.style.display = "none";
              }
            }, "\u2716")
          ]),
          // Body
          el("div", { className: "apm-modal-body", style: { padding: "15px" } }, [
            // Profile bar
            el("div", { style: { marginBottom: "12px" } }, [
              el("div", { className: "eam-fc-row", style: { marginBottom: "6px" } }, [
                el("label", { className: "eam-fc-label", style: { width: "70px" } }, "Profile:"),
                profileSelect
              ]),
              el("div", { className: "eam-fc-row", style: { marginBottom: "6px" } }, [
                el("label", { className: "eam-fc-label", style: { width: "70px" } }, "Name:"),
                nameInput
              ]),
              el("div", { className: "eam-fc-row" }, [
                el("label", { className: "eam-fc-label", style: { width: "70px" } }, "Target:"),
                targetSelect
              ])
            ]),
            // Date override section
            el("div", { style: { marginBottom: "12px", padding: "8px", background: "rgba(52, 152, 219, 0.05)", borderRadius: "4px", border: "1px solid var(--apm-border)" } }, [
              el("div", { className: "eam-fc-row", style: { marginBottom: "4px" } }, [
                el("label", { style: { display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", fontSize: "13px", color: "#b0bec5" } }, [
                  el("div", { className: "eam-slider-switch" }, [
                    dateToggle,
                    el("span", { className: "eam-slider-track" })
                  ]),
                  "Override Date Range"
                ])
              ]),
              el(
                "div",
                { className: "fb-hint", style: { marginBottom: "6px" } },
                "Leave off to use the date range from the forecast panel"
              ),
              dateSection
            ]),
            // Divider
            el("div", { style: { borderBottom: "1px solid var(--apm-border)", margin: "0 0 12px 0" } }),
            // Filter builder (visual + text)
            visualContainer,
            textContainer,
            // Preview
            el("div", { className: "fb-preview", style: { marginTop: "12px" } }, [
              el("div", { className: "fb-preview-label" }, "Filter Preview:"),
              previewEl
            ])
          ]),
          // Footer
          el("div", { className: "fb-action-bar" }, [
            saveBtn,
            deleteBtn
          ])
        ])
      );
      modal.addEventListener("click", (e) => {
        e.stopPropagation();
        if (e.target === modal) modal.style.display = "none";
      });
      modal.addEventListener("keydown", (e) => {
        if (e.key === "Escape") modal.style.display = "none";
      });
      renderProfileOptions();
      refreshChipList();
      refreshPreview();
      modal.openBuilder = (prefillDesc, prefillOrg) => {
        renderProfileOptions();
        if (profileSelect.value === "" || !profileSelect.value) {
          state = createEmptyState();
          nameInput.value = "";
          deleteBtn.style.display = "none";
          if (prefillDesc) {
            state.fields.desc = parseField(prefillDesc);
          }
          if (prefillOrg) {
            state.fields.org = parseField(prefillOrg);
          }
          refreshChipList();
          refreshPreview();
          if (!isVisualMode) syncToTextMode();
        }
        dateToggle.checked = state.dateOverride;
        state.arbitraryDays = state.dateOverride;
        dateSection.style.display = state.dateOverride ? "block" : "none";
        weekSelect.value = state.weeks;
        if (state.dateOverride) updateDayVisuals(dayContainer, state);
        modal.style.display = "flex";
        keywordInput.focus();
      };
      return modal;
    } catch (e) {
      APMLogger.error("FilterBuilder", "Build failed:", e);
      return el("div");
    }
  }
  function computeDateInclusions(profile) {
    if (!profile.dateOverride) return [];
    if (!Array.isArray(profile.days)) return [];
    const weeks = parseInt(profile.weeks, 10) || 0;
    const now = /* @__PURE__ */ new Date();
    const baseSunday = new Date(now);
    baseSunday.setDate(now.getDate() - now.getDay());
    const startDate = new Date(baseSunday);
    const endDate = new Date(baseSunday);
    endDate.setDate(baseSunday.getDate() + weeks * 7 + 6);
    const inclusions = [];
    const cursor = new Date(startDate);
    while (cursor <= endDate) {
      const dayOfWeek = cursor.getDay();
      if (profile.days[dayOfWeek]) {
        const mm = String(cursor.getMonth() + 1).padStart(2, "0");
        const dd = String(cursor.getDate()).padStart(2, "0");
        const yyyy = cursor.getFullYear();
        inclusions.push(`${mm}/${dd}/${yyyy}`);
      }
      cursor.setDate(cursor.getDate() + 1);
    }
    return inclusions;
  }

  // src/modules/forecast/forecast-engine.js
  init_logger();

  // src/core/status.js
  init_dom_helpers();
  var _statusTimeout = null;
  function setStatus(msg, color, isError = false) {
    if (window.self !== window.top) return;
    let banner = document.getElementById("apm-global-status");
    if (!banner) {
      banner = el("div", {
        id: "apm-global-status",
        style: {
          position: "fixed",
          top: "15px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: "999999",
          padding: "8px 24px",
          borderRadius: "30px",
          fontFamily: "sans-serif",
          fontWeight: "bold",
          fontSize: "14px",
          backgroundColor: "var(--apm-surface-sunken)",
          boxShadow: "0 4px 15px rgba(0,0,0,0.5)",
          display: "none",
          textAlign: "center",
          pointerEvents: "none",
          transition: "opacity 0.2s ease-in-out"
        }
      });
      document.body.appendChild(banner);
    }
    const cleanMsg = (msg || "").trim().toLowerCase();
    if (!cleanMsg || cleanMsg === "ready" || cleanMsg === "done") {
      banner.style.display = "none";
      return;
    }
    banner.textContent = msg;
    banner.style.color = color || "var(--apm-text-primary)";
    banner.style.border = `2px solid ${color || "var(--apm-border)"}`;
    banner.style.display = "block";
    if (_statusTimeout) clearTimeout(_statusTimeout);
    if (isError) {
      _statusTimeout = setTimeout(() => {
        banner.style.display = "none";
      }, 4e3);
    } else {
      _statusTimeout = setTimeout(() => {
        banner.style.display = "none";
      }, 15e3);
    }
  }
  function triggerThunderstrike() {
    const overlay = document.createElement("div");
    overlay.className = "thunder-overlay";
    const bolt = document.createElement("div");
    bolt.className = "center-lightning";
    bolt.style.color = "var(--apm-warning)";
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("width", "250");
    svg.setAttribute("height", "250");
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", "M18,3 L5,16 L11,16 L7,26 L20,11 L13,11 Z");
    path.setAttribute("fill", "currentColor");
    svg.appendChild(path);
    bolt.appendChild(svg);
    document.body.appendChild(overlay);
    document.body.appendChild(bolt);
    setTimeout(() => {
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
      if (bolt.parentNode) bolt.parentNode.removeChild(bolt);
    }, 1e3);
  }

  // src/modules/forecast/forecast-engine.js
  init_ui_manager();
  init_ajax_hooks();
  init_feature_flags();
  init_toast();
  var isRunning = false;
  var isStopped = false;
  var currentMode = "normal";
  var currentTarget = "WSJOBS";
  var OP_EQ = "fo_eq";
  var OP_LTE = "fo_lte";
  var OP_GTE = "fo_gte";
  var OP_CON = "fo_con";
  var OP_DNCON = "fo_dncon";
  function detectActiveTarget() {
    for (const win of getExtWindows()) {
      try {
        if (!win.Ext?.ComponentQuery) continue;
        const activeTabs = win.Ext.ComponentQuery.query("tab[active=true]:not([destroyed=true])");
        for (const tab of activeTabs) {
          const text = (tab.text || "").toUpperCase();
          if (text.includes("COMPLIANCE") && text.includes("WORK")) return "CTJOBS";
          if (text.includes("WORK ORDER") && !text.includes("COMPLIANCE")) return "WSJOBS";
        }
      } catch (e) {
      }
    }
    return "WSJOBS";
  }
  function getWinUserFunc(win) {
    try {
      const params = new URLSearchParams(win.location.search);
      const fromUrl = params.get("USER_FUNCTION_NAME");
      if (fromUrl) return fromUrl;
    } catch (e) {
    }
    try {
      const fromEAM = win.EAM?.USER_FUNCTION_NAME;
      if (fromEAM) return fromEAM;
    } catch (e) {
    }
    return "";
  }
  function buildEamScreenUrl(target) {
    return `WSJOBS?USER_FUNCTION_NAME=${target}&FUNCTION_CLASS=WEBL`;
  }
  function suppressEamTransitionError(win) {
    const suppressors = [];
    try {
      const origOnerror = win.onerror;
      win.onerror = function(msg, url2, line, col, error) {
        const msgStr = String(msg || "");
        if (msgStr.includes("items") && msgStr.includes("null")) {
          APMLogger.debug("Forecast", "Suppressed EAM transition error (window.onerror):", msgStr);
          return true;
        }
        if (origOnerror) return origOnerror.call(this, msg, url2, line, col, error);
        return false;
      };
      suppressors.push(() => {
        win.onerror = origOnerror;
      });
    } catch (e) {
    }
    try {
      const origHandle = win.Ext?.Error?.handle;
      if (win.Ext?.Error) {
        win.Ext.Error.handle = function(err) {
          const msg = err && (err.msg || err.message || String(err)) || "";
          if (msg.includes("items") && msg.includes("null")) {
            APMLogger.debug("Forecast", "Suppressed EAM transition error (Ext.Error.handle):", msg);
            return true;
          }
          return origHandle ? origHandle.apply(this, arguments) : false;
        };
        suppressors.push(() => {
          win.Ext.Error.handle = origHandle;
        });
      }
    } catch (e) {
    }
    return () => {
      suppressors.forEach((fn) => {
        try {
          fn();
        } catch (e) {
        }
      });
      APMLogger.debug("Forecast", "EAM error suppression removed");
    };
  }
  function launchScreenDirect(win, target) {
    try {
      const nav = win.EAM?.Nav;
      if (!nav || typeof nav.launchScreen !== "function") {
        APMLogger.warn("Forecast", "EAM.Nav.launchScreen not available");
        return false;
      }
      const url2 = buildEamScreenUrl(target);
      APMLogger.info("Forecast", `Direct navigation via EAM.Nav.launchScreen("${url2}")`);
      const cleanup = suppressEamTransitionError(win);
      nav.launchScreen(url2, null, { fromNav: true });
      setTimeout(cleanup, 5e3);
      return true;
    } catch (e) {
      APMLogger.error("Forecast", "EAM.Nav.launchScreen failed:", e);
      return false;
    }
  }
  AjaxHooks.onBeforeRequest("forecast-maddon", (win, conn, options) => {
    try {
      if (!FeatureFlags.isEnabled("forecast")) return;
      if (!isRunning) {
        APMLogger.debug("Forecast-MADDON", "Skipped: isRunning=false");
        return;
      }
      const url2 = options.url || "";
      const params = options.params || {};
      const isGridData = url2.includes("GRIDDATA") || url2.includes(".xmlhttp") || params.GRID_NAME;
      if (!isGridData) return;
      const topDoc = window.top.document;
      const profSelect = topDoc.getElementById("eam-profile-select");
      const profId = profSelect?.value;
      const isWorkOrderSearch = url2.includes("WSJOBS.xmlhttp") || params.GRID_NAME === "WSJOBS";
      const isCacheRequest = url2.includes("GETCACHE") || typeof params === "string" && params.includes("COMPONENT_INFO_TYPE_MODE=CACHE") || params.COMPONENT_INFO_TYPE_MODE === "CACHE";
      APMLogger.debug("Forecast-MADDON", `Hook fired: isRunning=${isRunning}, profId=${profId}, isWO=${isWorkOrderSearch}, isCache=${isCacheRequest}, savedProfiles=${savedProfiles.length}, url=${url2.substring(0, 80)}`);
      if (isWorkOrderSearch && !isCacheRequest) {
        const winUserFunc = getWinUserFunc(win);
        if (winUserFunc) {
          if (currentTarget === "CTJOBS" && winUserFunc !== "CTJOBS") return;
          if (currentTarget === "WSJOBS" && winUserFunc === "CTJOBS") return;
        }
        let maddonParams = null;
        const skipManual = ["today", "quick", "clear"].includes(currentMode);
        APMLogger.debug("Forecast-MADDON", `Decision: profId=${profId}, skipManual=${skipManual}, currentMode=${currentMode}, profiles=[${savedProfiles.map((p) => p.id).join(",")}]`);
        if (profId && profId !== "manual") {
          const activeProfile = savedProfiles.find((p) => p.id === profId);
          APMLogger.debug("Forecast-MADDON", `Profile lookup: ${activeProfile ? activeProfile.name : "NOT FOUND"}`);
          if (activeProfile) {
            APMLogger.debug("Forecast", `Injecting MADDON filters for profile: ${activeProfile.name}`);
            maddonParams = buildMaddonFilters2(activeProfile);
            appendDateInclusionFilters(maddonParams, activeProfile);
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
            maddonParams = buildMaddonFilters2(manualProf);
          }
        }
        if (maddonParams) {
          const currentParams = typeof options.params === "object" ? options.params : typeof options.params === "string" ? Object.fromEntries(new URLSearchParams(options.params)) : {};
          const existingSeqKeys = Object.keys(currentParams).filter((k) => k.startsWith("MADDON_FILTER_SEQNUM_"));
          const existingSeqs = existingSeqKeys.map((k) => {
            const parts = k.split("_");
            return parseInt(parts[parts.length - 1], 10);
          });
          let maxSeq = existingSeqs.length > 0 ? Math.max(...existingSeqs) : 0;
          const shiftedMaddon = {};
          let ourSeqOffset = maxSeq;
          const filterKeys = Object.keys(maddonParams).filter((k) => k.startsWith("MADDON_FILTER_ALIAS_NAME_"));
          const ourSeqs = filterKeys.map((k) => {
            const parts = k.split("_");
            return parseInt(parts[parts.length - 1], 10);
          }).sort((a, b) => a - b);
          const filters = ourSeqs.map((s) => ({
            ALIAS: maddonParams[`MADDON_FILTER_ALIAS_NAME_${s}`],
            OPERATOR: maddonParams[`MADDON_FILTER_OPERATOR_${s}`],
            VALUE: maddonParams[`MADDON_FILTER_VALUE_${s}`],
            JOINER: maddonParams[`MADDON_FILTER_JOINER_${s}`],
            LPAREN: maddonParams[`MADDON_LPAREN_${s}`],
            RPAREN: maddonParams[`MADDON_RPAREN_${s}`]
          }));
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
          APMLogger.debug("Forecast-MADDON", `Injecting ${filters.length} MADDON filters, paramsType=${typeof options.params}`);
          if (typeof options.params === "object") {
            Object.assign(options.params, shiftedMaddon);
          } else if (typeof options.params === "string") {
            const searchParams = new URLSearchParams(options.params);
            for (const [k, v] of Object.entries(shiftedMaddon)) {
              searchParams.set(k, v);
            }
            options.params = searchParams.toString();
          }
          APMLogger.debug("Forecast-MADDON", "MADDON injection complete");
        } else {
          APMLogger.debug("Forecast-MADDON", "No maddonParams to inject");
        }
      }
    } catch (e) {
      APMLogger.error("Forecast", "MADDON hook error:", e);
    }
  });
  function appendDateInclusionFilters(maddonParams, profile) {
    if (!profile.dateOverride || !profile.arbitraryDays) return;
    const dateInclusions = computeDateInclusions(profile);
    if (dateInclusions.length === 0) return;
    const seqKeys = Object.keys(maddonParams).filter((k) => k.startsWith("MADDON_FILTER_SEQNUM_"));
    const seqs = seqKeys.map((k) => {
      const parts = k.split("_");
      return parseInt(parts[parts.length - 1], 10);
    });
    let maxSeq = seqs.length > 0 ? Math.max(...seqs) : 0;
    const needParens = dateInclusions.length > 1;
    dateInclusions.forEach((dateStr, idx) => {
      const s = maxSeq + idx + 1;
      const isLast = idx === dateInclusions.length - 1;
      maddonParams[`MADDON_FILTER_ALIAS_NAME_${s}`] = "schedstartdate";
      maddonParams[`MADDON_FILTER_OPERATOR_${s}`] = "=";
      maddonParams[`MADDON_FILTER_VALUE_${s}`] = dateStr;
      maddonParams[`MADDON_FILTER_SEQNUM_${s}`] = s.toString();
      maddonParams[`MADDON_FILTER_JOINER_${s}`] = isLast ? "AND" : "OR";
      maddonParams[`MADDON_LPAREN_${s}`] = needParens && idx === 0 ? "true" : "false";
      maddonParams[`MADDON_RPAREN_${s}`] = needParens && isLast ? "true" : "false";
    });
    APMLogger.debug("Forecast", `Appended ${dateInclusions.length} date inclusion filters (= OR)`);
  }
  function buildMaddonFilters2(prof) {
    const mapping = {
      equipment: "equipment",
      eqDesc: "equipmentdesc",
      desc: "description",
      assigned: "assignedto",
      type: "workordertype",
      exDates: "schedstartdate",
      shift: "shift",
      org: "organization"
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
      let includeIdx = 0;
      fieldRules.forEach((rule) => {
        maddonParams[`MADDON_FILTER_ALIAS_NAME_${seq}`] = alias;
        maddonParams[`MADDON_FILTER_OPERATOR_${seq}`] = rule.operator;
        maddonParams[`MADDON_FILTER_VALUE_${seq}`] = rule.value;
        maddonParams[`MADDON_FILTER_SEQNUM_${seq}`] = seq.toString();
        if (rule.type === "include") {
          maddonParams[`MADDON_FILTER_JOINER_${seq}`] = includeIdx === includes.length - 1 ? "AND" : "OR";
        } else {
          maddonParams[`MADDON_FILTER_JOINER_${seq}`] = "AND";
        }
        if (includes.length > 1) {
          maddonParams[`MADDON_LPAREN_${seq}`] = includeIdx === 0 && rule.type === "include" ? "true" : "false";
          maddonParams[`MADDON_RPAREN_${seq}`] = includeIdx === includes.length - 1 && rule.type === "include" ? "true" : "false";
        } else {
          maddonParams[`MADDON_LPAREN_${seq}`] = "false";
          maddonParams[`MADDON_RPAREN_${seq}`] = "false";
        }
        if (rule.type === "include") includeIdx++;
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
  function isGridReady(target = "WSJOBS") {
    const wins = getExtWindows();
    for (const win of wins) {
      try {
        if (!win.Ext?.ComponentQuery) continue;
        const winUserFunc = getWinUserFunc(win);
        const grids = win.Ext.ComponentQuery.query("gridpanel:not([destroyed=true])");
        for (const grid of grids) {
          if (grid.rendered && grid.getStore) {
            const store = grid.getStore();
            if (!store || store.isLoading()) continue;
            const storeId = (store.storeId || "").toLowerCase();
            const className = (store.$className || "").toLowerCase();
            const proxyUrl = (store.getProxy?.()?.url || "").toLowerCase();
            const winFunc = (win.EAM?.USER_FUNCTION_NAME || "").toUpperCase();
            const isWoGrid = storeId.includes("wsjobs") || storeId.includes("ctjobs") || className.includes("wsjobs") || proxyUrl.includes("wsjobs") || winFunc === "WSJOBS" || winFunc === "CTJOBS";
            if (!isWoGrid) continue;
            if (winUserFunc) {
              if (target === "CTJOBS" && winUserFunc !== "CTJOBS") continue;
              if (target === "WSJOBS" && winUserFunc === "CTJOBS") continue;
            }
            if (!winUserFunc) {
              const visible = grid.isVisible ? grid.isVisible(true) : true;
              if (!visible) continue;
            }
            APMLogger.debug("Forecast", `isGridReady found ${target} grid: ${grid.id} (Store: ${storeId}, Frame: ${winUserFunc || "unknown"})`);
            return true;
          }
        }
      } catch (e) {
      }
    }
    return false;
  }
  async function navigateTo(tabText, menuPathArray, options = {}) {
    function isExactMatch(rawText, matchText) {
      if (!rawText) return false;
      const cleanText = rawText.replace(/<[^>]*>?/gm, "").replace(/&nbsp;/g, " ").trim();
      const upper = cleanText.toUpperCase();
      const isComplianceTab = upper.includes("COMPLIANCE");
      const isWoRelated = upper.includes("ORDERS");
      if (isWoRelated) {
        if (options.target === "CTJOBS" && !isComplianceTab) return false;
        if (options.target !== "CTJOBS" && isComplianceTab) return false;
      }
      if (cleanText === matchText) return true;
      if (cleanText.startsWith(matchText + " ") || cleanText.startsWith(matchText + "(")) return true;
      if (cleanText.includes("- " + matchText)) return true;
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
      } catch (e) {
      }
    }
    const target = options.target || "WSJOBS";
    for (const win of getExtWindows()) {
      try {
        if (launchScreenDirect(win, target)) {
          await delay(1500);
          return;
        }
      } catch (e) {
      }
    }
    APMLogger.warn("Forecast", "EAM.Nav.launchScreen unavailable, falling back to menu navigation");
    for (const win of getExtWindows()) {
      try {
        if (!win.Ext || !win.Ext.ComponentQuery) continue;
        if (menuPathArray && menuPathArray.length === 2) {
          const btns = win.Ext.ComponentQuery.query("button");
          let topBtn = btns.find((b) => !b.hidden && isExactMatch(b.text, menuPathArray[0]) && b.showMenu);
          if (topBtn && topBtn.el && topBtn.el.dom) {
            clickLikeUser(topBtn.el.dom);
            await delay(300);
            const menuItems = win.Ext.ComponentQuery.query("menuitem");
            let childItem = menuItems.find(
              (item) => !item.hidden && !(typeof item.isHidden === "function" && item.isHidden()) && isExactMatch(item.text, menuPathArray[1])
            );
            if (childItem && childItem.el && childItem.el.dom) {
              clickLikeUser(childItem.el.dom);
            } else if (childItem) {
              if (childItem.handler) childItem.handler.call(childItem.scope || childItem, childItem);
              else childItem.fireEvent("click", childItem);
            }
            return;
          }
        }
      } catch (e) {
      }
    }
  }
  async function returnToListView(target = "WSJOBS") {
    let targetExt = null;
    for (const win of getExtWindows()) {
      try {
        if (!win.Ext || !win.Ext.ComponentQuery) continue;
        const winUserFunc = getWinUserFunc(win);
        const grids = win.Ext.ComponentQuery.query("gridpanel:not([destroyed=true])");
        const found = grids.some((g) => {
          if (!g.rendered || !g.getStore) return false;
          const store = g.getStore();
          if (!store) return false;
          const sid = (store.storeId || "").toLowerCase();
          const isWo = sid.includes("wsjobs") || sid.includes("ctjobs");
          if (!isWo) return false;
          if (winUserFunc) {
            if (target === "CTJOBS" && winUserFunc !== "CTJOBS") return false;
            if (target === "WSJOBS" && winUserFunc === "CTJOBS") return false;
          } else {
            const visible = g.isVisible ? g.isVisible(true) : true;
            if (!visible) return false;
          }
          return true;
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
    const gridTarget = filterData.target || "WSJOBS";
    let targetWin = window;
    for (let attempts = 0; attempts < 40; attempts++) {
      for (const win of getExtWindows()) {
        try {
          if (!win.Ext || !win.Ext.ComponentQuery) continue;
          const winUserFunc = getWinUserFunc(win);
          const grids = win.Ext.ComponentQuery.query("gridpanel:not([destroyed=true])");
          foundFrame = grids.some((g) => {
            if (!g.rendered || !g.getStore) return false;
            const store = g.getStore();
            if (!store) return false;
            const sid = (store.storeId || "").toLowerCase();
            const isWo = sid.includes("wsjobs") || sid.includes("ctjobs");
            if (!isWo) return false;
            if (winUserFunc) {
              if (gridTarget === "CTJOBS" && winUserFunc !== "CTJOBS") return false;
              if (gridTarget === "WSJOBS" && winUserFunc === "CTJOBS") return false;
            } else {
              const visible = g.isVisible ? g.isVisible(true) : true;
              if (!visible) return false;
            }
            return true;
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
    AjaxHooks.install(targetWin);
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
    setExtField("ff_organization", data.org, OP_CON);
    setExtField("ff_workordernum", data.woNum, OP_CON);
    setExtField("ff_description", data.desc, data.descOpClass);
    setExtField(["ff_schedstartdate", "ff_startdate"], data.start, data.startOpClass);
    setExtField(["ff_schedenddate", "ff_enddate"], data.end, data.endOpClass);
    if (data.isWoSearch) {
      setExtField("ff_status", "", OP_CON);
    }
    if (!data.isClearMode) {
      const runBtns = targetExt.ComponentQuery.query("button[text=Run]:not([destroyed=true])");
      if (runBtns && runBtns.length > 0) {
        const runBtn = runBtns[0];
        if (data.profile && data.maddonParams) {
          const grids = targetExt.ComponentQuery.query("gridpanel:not([destroyed=true])");
          for (const grid of grids) {
            const store = grid.getStore && grid.getStore();
            if (!store) continue;
            const sid = (store.storeId || "").toLowerCase();
            if (!sid.includes("wsjobs") && !sid.includes("ctjobs")) continue;
            const proxy = store.getProxy && store.getProxy();
            if (proxy) {
              const existing = proxy.getExtraParams ? proxy.getExtraParams() : proxy.extraParams || {};
              proxy.setExtraParams ? proxy.setExtraParams({ ...existing, ...data.maddonParams }) : proxy.extraParams = { ...existing, ...data.maddonParams };
              data._injectedMaddonKeys = Object.keys(data.maddonParams);
              data._injectedProxy = proxy;
              APMLogger.debug("Forecast", `Injected ${Object.keys(data.maddonParams).length} MADDON params into store proxy`);
              break;
            }
          }
        }
        if (runBtn.handler) runBtn.handler.call(runBtn.scope || runBtn, runBtn);
        else runBtn.fireEvent("click", runBtn);
        await waitForAjax(targetWin);
        if (data._injectedProxy && data._injectedMaddonKeys) {
          const proxy = data._injectedProxy;
          const existing = proxy.getExtraParams ? proxy.getExtraParams() : proxy.extraParams || {};
          const cleaned = { ...existing };
          for (const k of data._injectedMaddonKeys) delete cleaned[k];
          proxy.setExtraParams ? proxy.setExtraParams(cleaned) : proxy.extraParams = cleaned;
          APMLogger.debug("Forecast", "Cleaned up MADDON params from store proxy");
        }
      }
    }
  }
  async function executeForecast(mode = "normal", targetOverride = null) {
    if (!FeatureFlags.isEnabled("forecast")) return;
    if (window.self !== window.top) return;
    if (isRunning) return;
    try {
      if (window.Ext && window.Ext.Ajax && window.Ext.Ajax.isLoading()) {
        setStatus("EAM busy... please wait.", "#f1c40f");
        return;
      }
    } catch (e) {
    }
    let orgText = "", dates = { start: "", end: "" }, assignedText = "", shiftText = "", descText = "", descOp = "Contains", quickSearchText = "";
    if (mode === "quick") {
      const qsInput = document.getElementById("apm-qs-input");
      if (!qsInput) {
        setStatus("Quick search unavailable.", "var(--apm-danger)");
        return;
      }
      quickSearchText = qsInput.value.trim();
      if (!quickSearchText) {
        setStatus("Enter WO.", "#e74c3c");
        return;
      }
    } else if (mode === "clear") {
    } else if (mode === "today") {
      const todayFormatted = formatDate(/* @__PURE__ */ new Date());
      dates = { start: todayFormatted, end: todayFormatted };
      const orgSelect = document.getElementById("eam-org-select");
      orgText = orgSelect ? orgSelect.value.trim().toUpperCase() : "";
    } else {
      const profSelectEarly = document.getElementById("eam-profile-select");
      const earlyProfId = profSelectEarly ? profSelectEarly.value : "manual";
      const earlyProf = earlyProfId !== "manual" ? savedProfiles.find((p) => p.id === earlyProfId) : null;
      const profileHandlesDateRange = earlyProf && earlyProf.dateOverride;
      if (!profileHandlesDateRange) {
        const isCustomDateMode = document.getElementById("eam-custom-dates")?.style.display !== "none";
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
            setStatus("Select date range.", "#e74c3c");
            return;
          }
        } else {
          const weekSelectEl = document.getElementById("eam-week-select");
          const weekOffset = weekSelectEl?.value;
          const isCumulative = weekSelectEl?.dataset.cumulative === "true";
          const checkboxesList = Array.from(document.querySelectorAll('#eam-day-checkboxes input[type="checkbox"]'));
          const userChecked = checkboxesList.filter((cb) => cb.dataset.explicit === "true").map((cb) => parseInt(cb.value, 10));
          if (userChecked.length === 0) {
            setStatus("Select a day.", "#e74c3c");
            return;
          }
          dates = getDateRange(weekOffset, Math.min(...userChecked), Math.max(...userChecked), isCumulative);
        }
      }
      descText = document.getElementById("eam-desc-text")?.value.trim() || "";
      descOp = document.getElementById("eam-desc-op")?.value || "Contains";
      orgText = document.getElementById("eam-org-select")?.value.trim().toUpperCase() || "";
    }
    currentMode = mode;
    isRunning = true;
    isStopped = false;
    const profSelect = document.getElementById("eam-profile-select");
    const activeProfIdEarly = profSelect ? profSelect.value : "manual";
    const activeProfileEarly = activeProfIdEarly !== "manual" ? savedProfiles.find((p) => p.id === activeProfIdEarly) : null;
    if (activeProfileEarly && activeProfileEarly.dateOverride) {
      const weeks = parseInt(activeProfileEarly.weeks, 10) || 0;
      const profDays = Array.isArray(activeProfileEarly.days) ? activeProfileEarly.days : [true, true, true, true, true, true, true];
      const selectedDayIndices = profDays.map((on, i) => on ? i : -1).filter((i) => i >= 0);
      if (selectedDayIndices.length > 0) {
        const minDay = Math.min(...selectedDayIndices);
        const maxDay = Math.max(...selectedDayIndices);
        dates = getDateRange(String(weeks), minDay, maxDay, weeks > 0);
      }
      APMLogger.debug("Forecast", `Profile date override: weeks=${weeks}, days=[${profDays}], dates=${JSON.stringify(dates)}`);
    }
    if (activeProfileEarly && activeProfileEarly.target) {
      currentTarget = activeProfileEarly.target;
    } else if (targetOverride) {
      currentTarget = targetOverride;
    } else {
      const targetSelect = document.getElementById("eam-target-select");
      const advSite = document.getElementById("eam-adv-site");
      const isAdvancedVisible = advSite && advSite.style.display !== "none";
      if (isAdvancedVisible && targetSelect) {
        currentTarget = targetSelect.value || "WSJOBS";
      } else {
        currentTarget = detectActiveTarget();
      }
    }
    APMLogger.debug("Forecast", `Target resolved: ${currentTarget}`);
    try {
      if (mode !== "quick") saveAllPreferences();
      UIManager.closeAll(true);
      if (mode === "quick") setStatus("Jumping...", "#3498db");
      else if (mode === "clear") setStatus("Clearing...", "#f1c40f");
      else triggerThunderstrike();
      await navigateTo("Work Orders", ["Work", "Work Orders"], { target: currentTarget });
      setStatus("Expanding...", "#f1c40f");
      let gridFound = false;
      for (let i = 0; i < 60; i++) {
        if (isGridReady(currentTarget)) {
          gridFound = true;
          break;
        }
        await delay(250);
      }
      if (!gridFound) {
        setStatus("Grid timeout.", "#e74c3c");
        return;
      }
      await returnToListView(currentTarget);
      setStatus(mode === "clear" ? "Wiping Fields..." : "Injecting API...", "#f1c40f");
      const todayOnlyCheckbox = document.getElementById("eam-today-only-toggle");
      const isTodayOnly = todayOnlyCheckbox && todayOnlyCheckbox.checked;
      const activeProfile = activeProfileEarly;
      const effectiveStartDate = dates.start || dates.end;
      const effectiveEndDate = dates.end || dates.start;
      const isSingleDay = effectiveStartDate === effectiveEndDate;
      let startOpClass = OP_CON;
      let endOpClass = OP_CON;
      if (mode !== "quick" && mode !== "clear") {
        if (isSingleDay) {
          startOpClass = isTodayOnly ? OP_EQ : OP_LTE;
        } else {
          startOpClass = OP_GTE;
          endOpClass = OP_LTE;
        }
      }
      const profileHandlesDates = activeProfile && activeProfile.dateOverride && activeProfile.arbitraryDays;
      let maddonParams = null;
      if (activeProfile && mode !== "clear" && mode !== "quick") {
        maddonParams = buildMaddonFilters2(activeProfile);
        appendDateInclusionFilters(maddonParams, activeProfile);
        APMLogger.debug("Forecast", `Built ${Object.keys(maddonParams).length} MADDON params for profile: ${activeProfile.name}`);
      }
      const extjsFilterData = {
        target: currentTarget,
        isClearMode: mode === "clear",
        isWoSearch: mode === "quick",
        profile: activeProfile,
        maddonParams,
        org: mode === "quick" || mode === "clear" ? "" : activeProfile ? activeProfile.org && !activeProfile.org.includes(",") ? activeProfile.org : "" : orgText,
        woNum: mode === "quick" ? quickSearchText : mode === "clear" ? "" : null,
        desc: mode === "quick" || mode === "clear" || activeProfile ? "" : descText,
        descOpClass: descOp === "Contains" ? OP_CON : OP_DNCON,
        start: mode === "quick" || mode === "clear" || profileHandlesDates ? "" : effectiveStartDate,
        startOpClass,
        end: mode === "quick" || mode === "clear" || isSingleDay || profileHandlesDates ? "" : effectiveEndDate,
        endOpClass
      };
      await applyForecastFiltersExtJS(extjsFilterData);
      if (mode === "quick") {
        let woGrid = null;
        let woGridWin = null;
        for (const w of getExtWindows()) {
          try {
            if (!w.Ext?.ComponentQuery) continue;
            const grids = w.Ext.ComponentQuery.query("gridpanel:not([destroyed=true])");
            for (const g of grids) {
              if (!g.rendered || g.isDestroyed) continue;
              const s = g.getStore?.();
              if (!s) continue;
              const sid = (s.storeId || "").toLowerCase();
              if (sid.includes("wsjobs") || sid.includes("ctjobs")) {
                woGrid = g;
                woGridWin = w;
                break;
              }
            }
            if (woGrid) break;
          } catch (e) {
          }
        }
        if (woGrid) {
          const store = woGrid.getStore();
          if (store.getCount() === 0) {
            setStatus("WO not found.", "var(--apm-danger)");
          } else {
            setStatus("Opening record...", "#3498db");
            const result = await openFirstGridRecord(woGrid, woGridWin);
            if (result.success) {
              showToast(`Opened WO ${result.entityId}`, "#1abc9c", false);
            } else {
              setStatus("Record open timed out.", "var(--apm-danger)");
            }
          }
        }
      }
      if (activeProfile && mode !== "clear") {
        const datePart = buildDateSummary(activeProfile);
        const toastMsg = datePart ? `Dataspy: ${activeProfile.name} \u2014 ${datePart} (Click to Clear)` : `Dataspy: ${activeProfile.name} (Click to Clear)`;
        showToast(toastMsg, "#1abc9c", true, () => {
          setSelectedProfileIdWithSync("manual");
          updateProfileUI_Global();
          saveAllPreferences();
          clearPersistentToast();
          executeForecast("clear");
        });
      }
      if (mode === "clear") {
        setStatus("", "#1abc9c");
      } else {
        setStatus("", "#18bc9c");
        if (mode === "quick") {
          const qsClear = document.getElementById("apm-qs-input");
          if (qsClear) qsClear.value = "";
        }
      }
    } catch (e) {
      APMLogger.error("Forecast", "executeForecast error:", e);
      throw e;
    } finally {
      isRunning = false;
    }
  }
  function getIsRunning() {
    return isRunning;
  }

  // src/modules/forecast/forecast-ui.js
  init_dom_helpers();
  init_toast();
  init_logger();
  init_ui_manager();
  init_api();
  init_context();
  init_utils();

  // src/modules/forecast/components/forecast-search-form.js
  init_dom_helpers();
  init_logger();
  function createSearchForm(callbacks = {}) {
    try {
      const form = el("div", { id: "eam-main-view" }, [
        // ── Profile / Dataspy (standard + advanced) ──
        el("div", { id: "eam-adv-profile", style: { display: "flex", flexDirection: "column", gap: "6px", marginBottom: "8px" } }, [
          el("div", { className: "eam-fc-row" }, [
            el("label", { className: "eam-fc-label", style: { width: "50px", minWidth: "50px" } }, "Profile:"),
            el("select", { id: "eam-profile-select", className: "eam-fc-select", style: { color: "var(--apm-accent)", fontWeight: "bold" } }, [
              el("option", { value: "manual" }, "[ Manual Native Search ]")
            ]),
            el("button", { id: "eam-btn-spies", title: "Open the dataspy builder", style: { background: "none", border: "none", color: "var(--apm-accent)", fontSize: "var(--apm-text-sm)", fontWeight: "600", cursor: "pointer", padding: "0 4px", whiteSpace: "nowrap", transition: "color 0.15s" }, onmouseover: function() {
              this.style.color = "var(--apm-text-bright)";
              this.style.textDecoration = "underline";
            }, onmouseout: function() {
              this.style.color = "var(--apm-accent)";
              this.style.textDecoration = "none";
            } }, "+ New")
          ]),
          el("div", { id: "eam-profile-summary", style: { display: "none", background: "var(--apm-accent-subtle)", border: "1px dashed var(--apm-accent)", borderRadius: "var(--apm-radius-sm)", padding: "6px 8px", fontSize: "var(--apm-text-sm)", color: "var(--apm-text-tertiary)" } }, [
            el("div", { style: { fontWeight: "600", color: "var(--apm-accent)", marginBottom: "2px" } }, "Profile Active: ExtJS Filter Engaged"),
            el("div", { id: "eam-profile-summary-text" }, "Loading profile details...")
          ])
        ]),
        // ── Target & Site (advanced only) ──
        el("div", { id: "eam-adv-site", className: "eam-fc-adv-box" }, [
          el("div", { className: "apm-section-group", style: { marginBottom: "10px" } }, [
            el("div", { className: "apm-section-label" }, "Search Target"),
            el("div", { id: "eam-manual-inputs" }, [
              el("div", { className: "eam-fc-row" }, [
                el("label", { className: "eam-fc-label", style: { width: "50px", minWidth: "50px" } }, "Target:"),
                el("select", { id: "eam-target-select", className: "eam-fc-select", style: { width: "110px", minWidth: "110px", flex: "none", color: "var(--apm-warning)", fontWeight: "bold" } }, [
                  el("option", { value: "WSJOBS" }, "Work Orders"),
                  el("option", { value: "CTJOBS" }, "Compliance")
                ]),
                el("label", { className: "eam-fc-label", style: { width: "30px", minWidth: "30px", marginLeft: "6px", textAlign: "right" } }, "Site:"),
                el("select", { id: "eam-org-select", className: "eam-fc-select", style: { textTransform: "uppercase", flex: 1 } }, [
                  el("option", { value: "" }, "-- All Sites --")
                ]),
                el("button", { id: "eam-org-add-btn", className: "org-btn org-btn-add", style: { padding: "4px 6px", fontSize: "13px", lineHeight: "1", minWidth: "24px" }, title: "Add site" }, "+"),
                el("button", { id: "eam-org-remove-btn", className: "org-btn org-btn-rem", style: { padding: "4px 6px", fontSize: "13px", lineHeight: "1", minWidth: "24px", display: "none" }, title: "Remove selected site" }, "\u2212")
              ]),
              el("div", { id: "eam-add-org-row", style: { display: "none", marginTop: "6px" } }, [
                el("div", { className: "eam-fc-row" }, [
                  el("label", { className: "eam-fc-label", style: { width: "50px", minWidth: "50px", color: "var(--apm-success)" } }, "New:"),
                  el("input", { type: "text", id: "eam-add-org-input", className: "eam-fc-input-text", placeholder: "Site code...", style: { flex: 1, textTransform: "uppercase" } }),
                  el("button", { id: "eam-add-org-confirm", className: "org-btn org-btn-add", style: { padding: "4px 10px" } }, "Add"),
                  el("button", { id: "eam-add-org-cancel", className: "org-btn", style: { padding: "4px 8px" } }, "\u2715")
                ])
              ])
            ])
          ])
        ]),
        // ── Schedule ──
        el("div", { id: "eam-schedule-section", className: "apm-section-group", style: { marginBottom: "10px" } }, [
          el("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" } }, [
            el("div", { className: "apm-section-label", style: { margin: "0" } }, "Schedule"),
            el("div", { className: "eam-fc-date-mode-toggle" }, [
              el("button", { id: "eam-date-mode-rel", className: "eam-fc-date-mode-btn active" }, "Relative \u26A1"),
              el("button", { id: "eam-date-mode-cust", className: "eam-fc-date-mode-btn" }, "Custom \u{1F4C5}")
            ])
          ]),
          el("div", { id: "eam-relative-dates", style: { display: forecastState.isCustomDateMode ? "none" : "block" } }, [
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
                  el("input", {
                    type: "checkbox",
                    className: "eam-fc-day-cb",
                    value: String(i),
                    checked: forecastState.days[i],
                    dataset: { explicit: forecastState.days[i] ? "true" : "false" }
                  }),
                  el("span", { style: { fontSize: "var(--apm-text-sm)", userSelect: "none" } }, day)
                ])
              )
            ])
          ]),
          el("div", { id: "eam-custom-dates", className: "eam-fc-custom-dates", style: { display: forecastState.isCustomDateMode ? "flex" : "none" } }, [
            el("div", { className: "eam-fc-custom-row" }, [
              el("label", { className: "eam-fc-label", style: { width: "40px" } }, "From:"),
              el("input", { type: "date", id: "eam-custom-start", value: forecastState.customStart, className: "eam-fc-date-input" })
            ]),
            el("div", { className: "eam-fc-custom-row" }, [
              el("label", { className: "eam-fc-label", style: { width: "40px" } }, "To:"),
              el("input", { type: "date", id: "eam-custom-end", value: forecastState.customEnd, className: "eam-fc-date-input" })
            ])
          ])
        ]),
        // ── Context status line (visible in simple mode, clickable to switch to advanced) ──
        el("div", { id: "eam-context-status", style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px", padding: "4px 0" } }, [
          el("span", { id: "eam-context-status-text", style: { fontSize: "var(--apm-text-sm)", color: "var(--apm-text-muted)" } }, "Searching: Work Orders \xB7 All Sites"),
          el("button", { id: "eam-context-switch-btn", style: { background: "none", border: "none", color: "var(--apm-accent)", fontSize: "var(--apm-text-sm)", cursor: "pointer", padding: "0", fontWeight: "600", textDecoration: "underline", marginLeft: "8px", flexShrink: "0" } }, "Change")
        ]),
        // ── Filter & Run ──
        el("div", { className: "eam-fc-desc-box" }, [
          el("label", { className: "eam-fc-label" }, "Description:"),
          el("select", { id: "eam-desc-op", className: "eam-fc-select", style: { width: "80px", minWidth: "80px", flex: "none" } }, [
            el("option", { value: "Contains", selected: forecastState.descOp === "Contains" }, "Include"),
            el("option", { value: "Does Not Contain", selected: forecastState.descOp === "Does Not Contain" }, "Exclude")
          ]),
          el("input", { type: "text", id: "eam-desc-text", value: forecastState.descText, placeholder: "Keywords... (Optional)", className: "eam-fc-desc-input" })
        ]),
        el("div", { className: "eam-fc-run-box" }, [
          el("button", { id: "eam-btn-run", className: "eam-fc-btn-run" }, "Run Search"),
          el("div", { className: "eam-fc-today-box" }, [
            el("label", { className: "eam-fc-today-lbl" }, [
              el("div", { className: "eam-slider-switch" }, [
                el("input", { type: "checkbox", id: "eam-today-only-toggle", checked: forecastState.todayOnly }),
                el("span", { className: "eam-slider-track" })
              ]),
              el("span", { id: "eam-today-toggle-text", className: "eam-fc-today-txt" }, forecastState.todayOnly ? "Today Only" : "Includes Past Due")
            ]),
            el("button", { id: "eam-btn-today", className: "eam-fc-btn-today", title: "Search Today (Alt + T) - Does not apply description filter" }, "Today")
          ])
        ]),
        el("div", { className: "eam-fc-footer" }, [
          el("button", { id: "eam-help-btn", className: "eam-fc-help-link" }, "\u2139\uFE0F Help & Tips"),
          el("span", { innerHTML: 'Shortcuts: <b style="color:var(--apm-text-tertiary);">Alt+T</b> Today | <b style="color:var(--apm-text-tertiary);">Alt+C</b> Clear' })
        ])
      ]);
      setupListeners(form, callbacks);
      return form;
    } catch (e) {
      APMLogger.error("SearchForm", "Build failed:", e);
      return el("div");
    }
  }
  function setupListeners(container, callbacks) {
    const btnRun = container.querySelector("#eam-btn-run");
    const btnToday = container.querySelector("#eam-btn-today");
    const btnHelp = container.querySelector("#eam-help-btn");
    const todayToggle = container.querySelector("#eam-today-only-toggle");
    const todayToggleText = container.querySelector("#eam-today-toggle-text");
    const contextStatus = container.querySelector("#eam-context-status");
    const contextText = container.querySelector("#eam-context-status-text");
    const contextSwitchBtn = container.querySelector("#eam-context-switch-btn");
    const refreshContextStatus = () => {
      const profSelect = container.querySelector("#eam-profile-select");
      const profileId = profSelect ? profSelect.value : "manual";
      const isProfileActive = profileId !== "manual";
      if (contextStatus) contextStatus.style.display = isProfileActive ? "none" : "";
      if (!isProfileActive) {
        const targetEl = container.querySelector("#eam-target-select");
        const orgEl = container.querySelector("#eam-org-select");
        const targetLabel = targetEl ? targetEl.options[targetEl.selectedIndex]?.text || "Work Orders" : "Work Orders";
        const siteLabel = orgEl && orgEl.value ? orgEl.value : "All Sites";
        contextText.textContent = `Searching: ${targetLabel} \xB7 ${siteLabel}`;
      }
    };
    contextSwitchBtn.onclick = () => {
      const advBtn = document.querySelector('.eam-fc-view-btn[data-mode="advanced"]');
      if (advBtn) advBtn.click();
    };
    container.querySelector("#eam-target-select")?.addEventListener("change", refreshContextStatus);
    container.querySelector("#eam-org-select")?.addEventListener("change", () => {
      setTimeout(refreshContextStatus, 10);
    });
    container._refreshContextStatus = refreshContextStatus;
    refreshContextStatus();
    btnRun.onclick = () => {
      if (!getIsRunning()) executeForecast("normal");
    };
    btnToday.onclick = () => {
      if (!getIsRunning()) executeForecast("today");
    };
    btnHelp.onclick = () => {
      const helpOverlay = document.getElementById("apm-help-overlay");
      if (helpOverlay) helpOverlay.style.display = "flex";
    };
    todayToggle.addEventListener("change", () => {
      const checked = todayToggle.checked;
      todayToggleText.textContent = checked ? "Today Only" : "Includes Past Due";
      updateForecastState({ todayOnly: checked });
      saveAllPreferences();
    });
    const descInput = container.querySelector("#eam-desc-text");
    descInput.addEventListener("input", () => {
      updateForecastState({ descText: descInput.value.trim() });
    });
    descInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        if (!getIsRunning()) executeForecast("normal");
      }
    });
    container.querySelector("#eam-week-select").addEventListener("change", (e) => {
      updateForecastState({ week: e.target.value });
      saveAllPreferences();
    });
    container.querySelector("#eam-desc-op").addEventListener("change", (e) => {
      updateForecastState({ descOp: e.target.value });
      saveAllPreferences();
    });
    const customStart = container.querySelector("#eam-custom-start");
    const customEnd = container.querySelector("#eam-custom-end");
    customStart.addEventListener("change", (e) => {
      updateForecastState({ customStart: e.target.value });
      saveAllPreferences();
    });
    customEnd.addEventListener("change", (e) => {
      updateForecastState({ customEnd: e.target.value });
      saveAllPreferences();
    });
    for (const input of [customStart, customEnd]) {
      input.addEventListener("focus", () => {
        try {
          input.showPicker();
        } catch (_) {
        }
      });
    }
    const targetSelect = container.querySelector("#eam-target-select");
    if (targetSelect) {
      targetSelect.value = forecastState.target || "WSJOBS";
      targetSelect.addEventListener("change", () => {
        updateForecastState({ target: targetSelect.value });
        saveAllPreferences();
      });
    }
    const orgSelect = container.querySelector("#eam-org-select");
    const addOrgRow = container.querySelector("#eam-add-org-row");
    const addOrgInput = container.querySelector("#eam-add-org-input");
    const addOrgConfirm = container.querySelector("#eam-add-org-confirm");
    const addOrgCancel = container.querySelector("#eam-add-org-cancel");
    const orgAddBtn = container.querySelector("#eam-org-add-btn");
    const orgRemoveBtn = container.querySelector("#eam-org-remove-btn");
    const showAddRow = () => {
      addOrgRow.style.display = "block";
      addOrgInput.value = "";
      addOrgInput.focus();
    };
    const hideAddRow = () => {
      addOrgRow.style.display = "none";
    };
    const updateRemoveBtn = () => {
      orgRemoveBtn.style.display = selectedOrg ? "inline-block" : "none";
    };
    const commitAddOrg = () => {
      const cleanOrg = (addOrgInput.value || "").trim().toUpperCase();
      if (!cleanOrg) return;
      if (!savedOrgs.includes(cleanOrg)) setSavedOrgs([...savedOrgs, cleanOrg]);
      setSelectedOrg(cleanOrg);
      renderOrgs(container);
      updateRemoveBtn();
      saveAllPreferences();
      hideAddRow();
    };
    orgSelect.addEventListener("change", () => {
      setSelectedOrg(orgSelect.value);
      updateRemoveBtn();
      saveAllPreferences();
    });
    orgAddBtn.onclick = () => showAddRow();
    orgRemoveBtn.onclick = () => {
      const current = selectedOrg;
      if (current) {
        setSavedOrgs(savedOrgs.filter((o) => o !== current));
        setSelectedOrg("");
        renderOrgs(container);
        updateRemoveBtn();
        saveAllPreferences();
      }
    };
    addOrgConfirm.onclick = commitAddOrg;
    addOrgCancel.onclick = hideAddRow;
    addOrgInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        commitAddOrg();
      }
      if (e.key === "Escape") hideAddRow();
    });
    updateRemoveBtn();
    const relBtn = container.querySelector("#eam-date-mode-rel");
    const custBtn = container.querySelector("#eam-date-mode-cust");
    const relDates = container.querySelector("#eam-relative-dates");
    const custDates = container.querySelector("#eam-custom-dates");
    const checkboxes = Array.from(container.querySelectorAll('#eam-day-checkboxes input[type="checkbox"]'));
    const setDateMode = (nextCustom) => {
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
            const start = toYMD(dates.start);
            const end = toYMD(dates.end);
            container.querySelector("#eam-custom-start").value = start;
            container.querySelector("#eam-custom-end").value = end;
            updateForecastState({ customStart: start, customEnd: end });
          }
        }
      }
      relDates.style.display = nextCustom ? "none" : "block";
      custDates.style.display = nextCustom ? "flex" : "none";
      relBtn.classList.toggle("active", !nextCustom);
      custBtn.classList.toggle("active", nextCustom);
      updateForecastState({ isCustomDateMode: nextCustom });
      saveAllPreferences();
    };
    relBtn.onclick = () => setDateMode(false);
    custBtn.onclick = () => setDateMode(true);
    checkboxes.forEach((cb) => {
      cb.addEventListener("change", (e) => {
        e.target.dataset.explicit = e.target.checked ? "true" : "false";
        const newDays = checkboxes.map((c) => c.dataset.explicit === "true");
        updateForecastState({ days: newDays });
        updateCheckboxVisuals(container);
        saveAllPreferences();
      });
    });
  }
  function renderOrgs(container) {
    const select = container.querySelector("#eam-org-select");
    if (!select) return;
    select.innerHTML = "";
    select.appendChild(el("option", { value: "" }, "-- All Sites --"));
    savedOrgs.forEach((org) => {
      select.appendChild(el("option", { value: org, selected: org === selectedOrg }, org));
    });
    select.value = selectedOrg || "";
    const removeBtn = container.querySelector("#eam-org-remove-btn");
    if (removeBtn) removeBtn.style.display = selectedOrg ? "inline-block" : "none";
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
        cb.parentElement.style.cssText = "cursor:pointer; display:flex; flex-direction:column; align-items:center; gap:4px; color:var(--apm-text-secondary); opacity:1;";
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
      const base = "display:flex; flex-direction:column; align-items:center; gap:4px; ";
      if (i === min || i === max) {
        cb.checked = true;
        cb.disabled = false;
        cb.dataset.explicit = "true";
        cb.parentElement.style.cssText = base + "color:var(--apm-success); opacity:1; cursor:pointer; font-weight:bold;";
      } else if (i > min && i < max) {
        cb.checked = true;
        cb.disabled = true;
        cb.dataset.explicit = "false";
        cb.parentElement.style.cssText = base + "color:var(--apm-text-disabled); opacity:0.5; cursor:not-allowed;";
      } else {
        cb.checked = false;
        cb.disabled = false;
        cb.dataset.explicit = "false";
        cb.parentElement.style.cssText = base + "color:var(--apm-text-secondary); opacity:1; cursor:pointer;";
      }
    });
  }

  // src/modules/forecast/components/forecast-quick-search.js
  init_dom_helpers();
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
    try {
      APMApi.register("buildForecastUI", buildForecastUI);
      if (window.self !== window.top) return;
      injectForecastStyles();
      let panel = document.getElementById("eam-forecast-panel");
      if (!panel) {
        UIManager.registerPanel("eam-forecast-panel", ["#apm-forecast-ext-btn", ".apm-fc-btn"]);
        panel = el("div", { id: "eam-forecast-panel", style: { display: "none" }, className: "eam-fc-container apm-ui-panel" });
        panel.style.overflowY = "auto";
        panel.style.overflowX = "hidden";
        panel.style.boxSizing = "border-box";
        applyZoomCompensation(panel);
        const header = el("div", { className: "eam-fc-header" }, [
          el("div", { className: "eam-fc-title-box" }, [
            el("h4", { className: "eam-fc-title", innerHTML: 'WO Forecast <span style="color:var(--apm-success); font-weight:600;">Tool</span>' }),
            el("div", { className: "rain-cloud-always", style: { color: "var(--apm-success)", marginTop: "-3px" }, innerHTML: SVG_CLOUD })
          ]),
          el("div", { className: "eam-fc-controls" }, [
            el("div", { className: "eam-fc-view-toggle" }, [
              el("button", { dataset: { mode: "simple" }, className: "eam-fc-view-btn" }, "Simple"),
              el("button", { dataset: { mode: "standard" }, className: "eam-fc-view-btn" }, "Standard"),
              el("button", { dataset: { mode: "advanced" }, className: "eam-fc-view-btn" }, "Advanced")
            ])
          ])
        ]);
        const searchForm = createSearchForm({});
        const profileManager = createProfileManager();
        const filterBuilder = createFilterBuilder();
        const statusLabel = el("div", { id: "eam-status", className: "eam-fc-status" });
        const updateContainer = el("div", { id: "eam-update-container", className: "eam-fc-update-box" }, [
          el("a", { href: getUpdateUrls().download, target: "_blank", className: "apm-footer-update-btn", onclick: (e) => {
            e.preventDefault();
            window.open(getUpdateUrls().download, "_blank");
          } }, "\u2728 Update Available")
        ]);
        panel.appendChild(header);
        panel.appendChild(searchForm);
        panel.appendChild(profileManager);
        panel.appendChild(statusLabel);
        panel.appendChild(updateContainer);
        document.body.appendChild(panel);
        document.body.appendChild(filterBuilder);
        const viewToggle = panel.querySelector(".eam-fc-view-toggle");
        const spiesBtn = panel.querySelector("#eam-btn-spies");
        viewToggle.addEventListener("click", (e) => {
          const btn = e.target.closest(".eam-fc-view-btn");
          if (!btn) return;
          const mode = btn.dataset.mode;
          setModeUI(panel, mode);
          updateForecastState({ viewMode: mode });
          saveAllPreferences();
        });
        spiesBtn.onclick = () => {
          const dTextEl = panel.querySelector("#eam-desc-text");
          const oTextEl = panel.querySelector("#eam-org-select");
          const prefillDesc = dTextEl ? dTextEl.value.trim() : "";
          const prefillOrg = oTextEl ? oTextEl.value.trim() : "";
          filterBuilder.openBuilder(prefillDesc, prefillOrg);
        };
        panel.querySelector("#eam-profile-select").onchange = (e) => {
          const newVal = e.target.value;
          setSelectedProfileId(newVal);
          updateProfileUI_Global();
          saveAllPreferences();
          const mainView = panel.querySelector("#eam-main-view");
          if (mainView?._refreshContextStatus) mainView._refreshContextStatus();
          if (newVal === "manual") {
            clearPersistentToast();
          }
        };
        syncPreferences(panel);
        checkForUpdates();
      }
    } catch (e) {
      APMLogger.error("Forecast", "Failed to build forecast UI:", e);
    }
  }
  function setModeUI(panel, viewMode) {
    const advProfile = panel.querySelector("#eam-adv-profile");
    const advSite = panel.querySelector("#eam-adv-site");
    const contextStatus = panel.querySelector("#eam-context-status");
    const showProfile = viewMode === "standard" || viewMode === "advanced";
    const showSite = viewMode === "advanced";
    const showContext = viewMode !== "advanced";
    if (advProfile) advProfile.style.display = showProfile ? "flex" : "none";
    if (advSite) advSite.style.display = showSite ? "flex" : "none";
    if (contextStatus) contextStatus.style.display = showContext ? "flex" : "none";
    panel.querySelectorAll(".eam-fc-view-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.mode === viewMode);
    });
    const mainView = panel.querySelector("#eam-main-view");
    if (mainView?._refreshContextStatus) mainView._refreshContextStatus();
  }
  function syncPreferences(panel) {
    const prefs = loadPreferences();
    if (!prefs) {
      setModeUI(panel, "standard");
      return;
    }
    if (prefs.descOp) {
      const field = panel.querySelector("#eam-desc-op");
      if (field) field.value = prefs.descOp;
    }
    if (prefs.descText !== void 0) {
      const field = panel.querySelector("#eam-desc-text");
      if (field) field.value = prefs.descText;
    }
    if (prefs.todayOnly !== void 0) {
      const field = panel.querySelector("#eam-today-only-toggle");
      if (field) field.checked = prefs.todayOnly;
    }
    setModeUI(panel, forecastState.viewMode || "standard");
    const isCustomDateMode = prefs.isCustomDateMode === true;
    {
      const field = panel.querySelector("#eam-relative-dates");
      if (field) field.style.display = isCustomDateMode ? "none" : "block";
    }
    {
      const field = panel.querySelector("#eam-custom-dates");
      if (field) field.style.display = isCustomDateMode ? "flex" : "none";
    }
    {
      const field = panel.querySelector("#eam-date-mode-rel");
      if (field) field.classList.toggle("active", !isCustomDateMode);
    }
    {
      const field = panel.querySelector("#eam-date-mode-cust");
      if (field) field.classList.toggle("active", isCustomDateMode);
    }
    if (prefs.customStart) {
      const field = panel.querySelector("#eam-custom-start");
      if (field) field.value = prefs.customStart;
    }
    if (prefs.customEnd) {
      const field = panel.querySelector("#eam-custom-end");
      if (field) field.value = prefs.customEnd;
    }
    const checkboxes = Array.from(panel.querySelectorAll('#eam-day-checkboxes input[type="checkbox"]'));
    if (prefs.days && Array.isArray(prefs.days)) {
      checkboxes.forEach((cb, i) => {
        cb.checked = prefs.days[i];
        cb.dataset.explicit = prefs.days[i] ? "true" : "false";
      });
    }
    const targetSelect = panel.querySelector("#eam-target-select");
    if (targetSelect) targetSelect.value = prefs.target || "WSJOBS";
    renderOrgs(panel);
    renderProfiles_Global();
    updateCheckboxVisuals(panel);
    updateProfileUI_Global();
    if (prefs.week) {
      const field = panel.querySelector("#eam-week-select");
      if (field) field.value = prefs.week;
    }
  }
  var styles = `
.eam-fc-btn-small {
    background: var(--apm-surface-raised);
    border: 1px solid var(--apm-border);
    color: var(--apm-text-tertiary);
    border-radius: 3px;
    padding: 2px 6px;
    font-size: var(--apm-text-sm);
    cursor: pointer;
    transition: all 0.15s;
    min-width: 24px;
}
.eam-fc-btn-small:hover {
    background: var(--apm-control-bg);
    color: var(--apm-accent);
    border-color: var(--apm-accent);
}
.eam-fc-day-cb {
    -webkit-appearance: none;
    appearance: none;
    width: 16px;
    height: 16px;
    border: 2px solid var(--apm-border-strong, #4a5a6a);
    border-radius: 3px;
    background: var(--apm-surface-inset, #2b343c);
    cursor: pointer;
    transition: all 0.15s;
    margin: 0;
    position: relative;
}
.eam-fc-day-cb:hover {
    border-color: var(--apm-accent, #3498db);
}
.eam-fc-day-cb:checked {
    background: var(--apm-accent, #3498db);
    border-color: var(--apm-accent, #3498db);
}
.eam-fc-day-cb:checked:not(:disabled):hover {
    filter: brightness(1.15);
}
.eam-fc-day-cb:checked::after {
    content: '';
    position: absolute;
    left: 3px;
    top: 0px;
    width: 5px;
    height: 9px;
    border: solid #fff;
    border-width: 0 2px 2px 0;
    transform: rotate(45deg);
}
`;
  function injectForecastStyles() {
    if (document.getElementById("apm-fc-advanced-styles")) return;
    const s = document.createElement("style");
    s.id = "apm-fc-advanced-styles";
    s.innerHTML = styles;
    (document.head || document.documentElement).appendChild(s);
  }
  function initForecastShortcuts() {
    const handleHotkey = (action, isWO = false) => {
      if (window.self !== window.top) {
        safePostMessage(window.top, { apmMaster: "hotkey", action, isWO });
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
    if (window[FLAGS.HOTKEYS_BOUND]) return;
    APMApi.register("checkHotkey", checkKey);
    APMApi.register("executeForecast", executeForecast);
    window.addEventListener("keydown", checkKey, true);
    window[FLAGS.HOTKEYS_BOUND] = true;
    const bindExtHotkeys = () => {
      if (!window.Ext || !window.Ext.onReady) return;
      window.Ext.onReady(() => {
        const doc = window.Ext.getDoc();
        if (doc && !doc[FLAGS.HOTKEYS_BOUND]) {
          APMLogger.debug("APM Master", "Binding ExtJS hotkey listener");
          doc.on("keydown", (e) => {
            if (checkKey(e.browserEvent || e)) e.stopEvent();
          });
          doc[FLAGS.HOTKEYS_BOUND] = true;
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
  init_logger();
  var ForecastFilter = /* @__PURE__ */ (function() {
    let filterState = 0;
    let lastKnownStoreId = null;
    const TARGET_DATA_INDEX = "duedate";
    const STATES = [
      { label: "Filter: Show All", bg: "var(--apm-text-disabled)", tooltip: "Currently showing all records.\nClick to filter: PMs Only \u2192 Non-PMs \u2192 Show All.\nFilters the currently loaded list \u2014 does not perform a new search." },
      { label: "Filter: PMs Only", bg: "var(--apm-success)", tooltip: "Showing PMs only (records with a due date).\nClick to switch to Non-PMs.\nFilters the currently loaded list \u2014 does not perform a new search." },
      { label: "Filter: Non-PMs", bg: "var(--apm-accent)", tooltip: "Showing Non-PMs only (records without a due date).\nClick to switch to Show All.\nFilters the currently loaded list \u2014 does not perform a new search." }
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
      } else {
        store._nativeGetTotalCount = store.getTotalCount;
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
        const isBlank = !val || String(val).trim() === "";
        return filterState === 1 ? !isBlank : isBlank;
      });
      const count = store.getCount();
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
      btn.title = STATES[filterState].tooltip;
      applyStoreFilter();
    }
    function injectForecastFilter() {
      const ctx = getTargetContext();
      if (!ctx) return;
      const { win, doc, grid } = ctx;
      const store = grid.getStore();
      if (filterState !== 0 && store.storeId !== lastKnownStoreId) {
        applyStoreFilter();
      }
      lastKnownStoreId = store.storeId;
      const Ext2 = win.Ext;
      if (!Ext2 || !Ext2.ComponentQuery) return;
      const existingCmp = Ext2.getCmp("apm-pm-filter-cmp");
      if (existingCmp && existingCmp.getEl?.()?.dom && doc.body.contains(existingCmp.getEl().dom)) return;
      if (existingCmp) existingCmp.destroy();
      let parentToolbar = null;
      let insertAfterIdx = -1;
      const combos = Ext2.ComponentQuery.query('combobox[name="dataspylist"]:not([destroyed=true])');
      for (const combo of combos) {
        if (!combo.rendered || combo.isDestroyed || !combo.isVisible?.(true)) continue;
        const tb = combo.up("toolbar");
        if (tb && tb.rendered && !tb.isDestroyed) {
          parentToolbar = tb;
          insertAfterIdx = tb.items.indexOf(combo) + 1;
          APMLogger.debug("ForecastFilter", `Strategy 1: Found dataspy combo in toolbar (${tb.id})`);
          break;
        }
      }
      if (!parentToolbar) {
        const dataspyInput = doc.querySelector('input[name="dataspylist"]');
        if (dataspyInput && dataspyInput.offsetWidth > 0) {
          const extEl = dataspyInput.closest(".x-field") || dataspyInput.closest(".x-form-item");
          if (extEl && extEl.id) {
            const fieldCmp = Ext2.getCmp(extEl.id);
            if (fieldCmp) {
              const tb = fieldCmp.up("toolbar") || fieldCmp.up("container");
              if (tb && tb.rendered && !tb.isDestroyed) {
                parentToolbar = tb;
                insertAfterIdx = tb.items.indexOf(fieldCmp) + 1;
                APMLogger.debug("ForecastFilter", `Strategy 2: Found dataspy via DOM anchor (${tb.id})`);
              }
            }
          }
        }
      }
      if (!parentToolbar) return;
      const btnHtml = `<button id="apm-list-pm-btn" title="${STATES[filterState].tooltip.replace(/"/g, "&quot;")}" style="
            padding: 4px 10px; background: ${STATES[filterState].bg};
            color: white; border: none; border-radius: 4px;
            font-weight: bold; cursor: pointer; font-size: 11px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.3); transition: background 0.2s;
        ">${STATES[filterState].label}</button>`;
      parentToolbar.insert(insertAfterIdx, {
        xtype: "component",
        id: "apm-pm-filter-cmp",
        margin: "0 0 0 8",
        html: btnHtml,
        listeners: {
          afterrender: function(cmp) {
            const btnEl = cmp.getEl()?.dom?.querySelector("#apm-list-pm-btn");
            if (btnEl) {
              btnEl.addEventListener("click", (e) => {
                e.preventDefault();
                toggleGridFilter(btnEl);
              });
            }
          }
        }
      });
      APMLogger.info("ForecastFilter", `PM filter button injected into toolbar: ${parentToolbar.id}`);
    }
    return {
      init: function() {
        APMScheduler.registerTask("forecast-filter", 1500, () => {
          const existingBtn = document.getElementById("apm-list-pm-btn");
          if (existingBtn && document.body.contains(existingBtn) && filterState === 0) return;
          injectForecastFilter();
        });
      }
    };
  })();

  // src/modules/colorcode/colorcode-ui.js
  init_constants();
  init_storage();
  init_state();

  // src/core/settings-io.js
  init_constants();
  init_storage();
  init_constants();
  init_logger();
  var EXPORT_SCHEMA_VERSION = 1;
  var IMPORT_MODULES = [
    { id: "nametags", label: "Nametags (ColorCode)", keys: [CC_STORAGE_RULES, CC_STORAGE_SET] },
    { id: "autofill", label: "AutoFill Profiles", keys: [PRESET_STORAGE_KEY] },
    { id: "taborder", label: "Tab & Grid Order", keys: [APM_GENERAL_STORAGE] },
    { id: "dataspys", label: "Dataspys & Forecast", keys: [STORAGE_KEY] },
    { id: "theme", label: "System Theme", keys: [APM_GENERAL_STORAGE] },
    { id: "labor", label: "Labor Settings", keys: [LABOR_PREFS_STORAGE, LABOR_DOCK_STORAGE, LABOR_EMPS_STORAGE, LABOR_NIGHT_SHIFT_KEY] }
  ];
  function encodeSettingsAsBase64(jsonString) {
    try {
      const encoded = btoa(unescape(encodeURIComponent(jsonString)));
      return `APM:${encoded}`;
    } catch (e) {
      APMLogger.error("SettingsIO", "Error encoding to Base64:", e);
      throw e;
    }
  }
  function decodeSettingsFromBase64(base64String) {
    try {
      if (typeof base64String !== "string" || !base64String.startsWith("APM:")) {
        return null;
      }
      const encoded = base64String.substring(4);
      const decoded = decodeURIComponent(escape(atob(encoded)));
      return decoded;
    } catch (e) {
      APMLogger.error("SettingsIO", "Error decoding from Base64:", e);
      return null;
    }
  }
  var EXPORT_KEYS = [
    APM_GENERAL_STORAGE,
    CC_STORAGE_RULES,
    CC_STORAGE_SET,
    PRESET_STORAGE_KEY,
    STORAGE_KEY,
    LABOR_PREFS_STORAGE,
    LABOR_DOCK_STORAGE,
    LABOR_EMPS_STORAGE,
    LABOR_NIGHT_SHIFT_KEY
  ];
  var SKIP_KEYS = [
    SESSION_STORAGE_KEY,
    LABOR_LAST_EMP_KEY,
    PTP_HISTORY_KEY,
    UPDATE_CHECK_KEY
  ];
  var migrations = [
    // { fromVersion: 1, toVersion: 2, transform(settings) { ... } },
  ];
  function exportSettings() {
    try {
      const settings = {};
      for (const key of EXPORT_KEYS) {
        const value = APMStorage.get(key);
        if (value !== null && value !== void 0) {
          settings[key] = value;
        }
      }
      const exportData = {
        schemaVersion: EXPORT_SCHEMA_VERSION,
        exportedAt: (/* @__PURE__ */ new Date()).toISOString(),
        scriptVersion: CURRENT_VERSION,
        settings
      };
      return JSON.stringify(exportData, null, 2);
    } catch (e) {
      APMLogger.error("SettingsIO", "Error exporting settings:", e);
      throw e;
    }
  }
  function importSettings(input, options = {}) {
    const result = { ok: false, errors: [], migratedFrom: null, format: null };
    try {
      let jsonString = input;
      let format = "json";
      if (typeof input === "string" && input.trim().startsWith("APM:")) {
        const decoded = decodeSettingsFromBase64(input);
        if (decoded) {
          jsonString = decoded;
          format = "base64";
          APMLogger.info("SettingsIO", "Detected Base64-encoded import format");
        } else {
          result.errors.push("Invalid Base64 format. Data appears corrupted.");
          return result;
        }
      }
      result.format = format;
      let data;
      try {
        data = JSON.parse(jsonString);
      } catch (e) {
        result.errors.push(`Invalid JSON: ${e.message}`);
        return result;
      }
      if (!data || typeof data !== "object") {
        result.errors.push("Export file is not a valid object");
        return result;
      }
      if (!Object.prototype.hasOwnProperty.call(data, "schemaVersion")) {
        result.errors.push("Missing schemaVersion in export file");
        return result;
      }
      const exportSchemaVersion = data.schemaVersion;
      result.migratedFrom = exportSchemaVersion;
      if (!data.settings || typeof data.settings !== "object") {
        result.errors.push("Missing or invalid settings object");
        return result;
      }
      let settings = { ...data.settings };
      let currentVersion = exportSchemaVersion;
      for (const migration of migrations) {
        if (migration.fromVersion === currentVersion && migration.fromVersion < EXPORT_SCHEMA_VERSION) {
          try {
            settings = migration.transform(settings) || settings;
            currentVersion = migration.toVersion;
            APMLogger.info("SettingsIO", `Applied migration ${migration.fromVersion} -> ${migration.toVersion}`);
          } catch (e) {
            result.errors.push(`Migration ${migration.fromVersion} failed: ${e.message}`);
            APMLogger.error("SettingsIO", `Migration error:`, e);
            break;
          }
        }
      }
      if (currentVersion !== EXPORT_SCHEMA_VERSION) {
        result.errors.push("Could not migrate from schema v" + exportSchemaVersion + " to v" + EXPORT_SCHEMA_VERSION);
        return result;
      }
      let written = 0;
      for (const [key, value] of Object.entries(settings)) {
        if (SKIP_KEYS.includes(key)) {
          APMLogger.debug("SettingsIO", `Skipping excluded key: ${key}`);
          continue;
        }
        if (!EXPORT_KEYS.includes(key)) {
          APMLogger.warn("SettingsIO", `Import skipped unknown key: ${key}`);
          continue;
        }
        if (options.onlyKeys && !options.onlyKeys.includes(key)) {
          APMLogger.debug("SettingsIO", `Skipping unselected key: ${key}`);
          continue;
        }
        if (value === null || value === void 0) {
          APMLogger.debug("SettingsIO", `Skipping null/undefined key: ${key}`);
          continue;
        }
        try {
          if (key === APM_GENERAL_STORAGE && typeof value !== "object") {
            result.errors.push(`${key}: expected object, got ${typeof value}`);
            continue;
          }
          if ((key === CC_STORAGE_RULES || key === LABOR_EMPS_STORAGE) && !Array.isArray(value)) {
            result.errors.push(`${key}: expected array, got ${typeof value}`);
            continue;
          }
          const safeValue = typeof value === "object" && value !== null ? JSON.parse(JSON.stringify(value)) : value;
          APMStorage.set(key, safeValue);
          written++;
        } catch (e) {
          result.errors.push(`Failed to write ${key}: ${e.message}`);
          APMLogger.error("SettingsIO", `Write error for ${key}:`, e);
        }
      }
      if (written > 0) {
        result.ok = true;
        APMLogger.info("SettingsIO", `Successfully imported ${written} settings from schema v${exportSchemaVersion}`);
      } else if (result.errors.length === 0) {
        result.errors.push("No valid settings to import");
      }
      return result;
    } catch (e) {
      result.errors.push(`Unexpected error: ${e.message}`);
      APMLogger.error("SettingsIO", "Unexpected error during import:", e);
      return result;
    }
  }

  // src/modules/colorcode/colorcode-ui.js
  init_toast();
  init_utils();
  init_dom_helpers();
  init_logger();
  var DEFAULT_RULE_COLOR = "#e74c3c";
  function applyToggleBtnStyle(btn, active) {
    if (!btn) return;
    if (active) {
      btn.classList.add("active");
      btn.style.background = "var(--apm-accent-subtle)";
      btn.style.borderColor = "var(--apm-accent)";
      btn.style.color = "var(--apm-accent)";
    } else {
      btn.classList.remove("active");
      btn.style.background = "var(--apm-surface-inset)";
      btn.style.borderColor = "var(--apm-border)";
      btn.style.color = "var(--apm-text-disabled)";
    }
  }
  var _setupInitialized = false;
  var _previewDebounceTimer = null;
  var _editingId = null;
  var isPreviewActive = false;
  var currentPreviewRule = null;
  var originalRulesSnapshot = null;
  function buildTempRuleFromFormState() {
    const search = document.getElementById("cc-search")?.value || "";
    const color = document.getElementById("cc-color")?.value || DEFAULT_RULE_COLOR;
    const rawTag = document.getElementById("cc-tag")?.value || "";
    const tag = rawTag.replace(/\n/g, "\\n");
    const fill = document.getElementById("cc-btn-fill")?.classList.contains("active") ?? true;
    const showTag = document.getElementById("cc-btn-tag")?.classList.contains("active") ?? true;
    const rule = {
      id: "__preview__",
      search,
      color,
      tag,
      fill,
      showTag,
      _isPreview: true,
      _editingId: _editingId || null
    };
    APMLogger.debug("ColorCode UI", "buildTempRuleFromFormState:", rule);
    return rule;
  }
  function setupColorCodeLogic() {
    if (_setupInitialized) {
      APMLogger.debug("ColorCode UI", "setupColorCodeLogic already initialized, skipping re-init");
      return;
    }
    _setupInitialized = true;
    APMLogger.debug("ColorCode UI", "setupColorCodeLogic initializing...");
    let banner = document.getElementById("apm-filter-banner");
    if (!banner) {
      banner = document.createElement("div");
      banner.id = "apm-filter-banner";
      banner.className = "apm-ui-panel";
      document.body.appendChild(banner);
    }
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
        previewRow.style.borderLeft = "1px solid var(--apm-border)";
      }
      if (tagActive && tagText) {
        previewTag.style.display = "block";
        previewTag.style.background = color;
        previewTag.textContent = tagText;
      } else {
        previewTag.style.display = "none";
      }
    };
    function renderRuleItem(rule, { onDelete, onEdit, onMoveUp, onMoveDown }) {
      const upBtn = el("button", { className: "rule-up-btn", onclick: onMoveUp, style: { background: "transparent", border: "none", color: "var(--apm-text-secondary)", cursor: "pointer", fontSize: "12px", padding: "0 4px" } }, ["\u25B2"]);
      const downBtn = el("button", { className: "rule-down-btn", onclick: onMoveDown, style: { background: "transparent", border: "none", color: "var(--apm-text-secondary)", cursor: "pointer", fontSize: "12px", padding: "0 4px" } }, ["\u25BC"]);
      const ctrlCol = el("div", { style: { display: "flex", flexDirection: "column", gap: "2px", marginRight: "6px" } }, [upBtn, downBtn]);
      const searchSpan = el("span", { style: { fontSize: "13px", fontWeight: "bold", color: "var(--apm-text-bright)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" } }, [rule.search]);
      let tagText, tagColor, tagBg;
      if (rule.fill && rule.showTag && rule.tag) {
        tagText = `Fill & Tag: ${rule.tag}`;
        tagColor = "var(--apm-success)";
        tagBg = "var(--apm-success-subtle, rgba(26, 188, 156, 0.1))";
      } else if (rule.fill) {
        tagText = "Fill Row Only";
        tagColor = "var(--apm-warning)";
        tagBg = "var(--apm-warning-subtle, rgba(243, 156, 18, 0.1))";
      } else if (rule.showTag && rule.tag) {
        tagText = `Tag Only: ${rule.tag}`;
        tagColor = "var(--apm-accent)";
        tagBg = "var(--apm-accent-subtle, rgba(52, 152, 219, 0.1))";
      } else {
        tagText = "Formatting Disabled";
        tagColor = "var(--apm-text-disabled)";
        tagBg = "var(--apm-disabled-subtle, rgba(127, 140, 141, 0.1))";
      }
      const tagDisplaySpan = el("span", { style: { fontSize: "10px", color: tagColor, fontWeight: "bold", background: tagBg, padding: "2px 6px", borderRadius: "10px", display: "inline-block", marginTop: "2px", width: "max-content" } }, [tagText]);
      const textCol = el("div", { style: { display: "flex", flexDirection: "column", flexGrow: "1", overflow: "hidden", padding: "0 5px" } }, [searchSpan, tagDisplaySpan]);
      const editBtn = el("button", { className: "rule-edit-btn", onclick: onEdit, style: { background: "var(--apm-border-strong)", color: "white", border: "none", borderRadius: "4px", padding: "4px 6px", cursor: "pointer", fontSize: "11px", transition: "background 0.2s" } }, ["\u270F\uFE0F"]);
      const delBtn = el("button", { className: "rule-delete-btn", onclick: onDelete, style: { background: "transparent", color: "var(--apm-danger)", border: "none", borderRadius: "4px", padding: "4px 6px", cursor: "pointer", fontSize: "12px" } }, ["\u274C"]);
      const actionCol = el("div", { style: { display: "flex", alignItems: "center", gap: "6px" } }, [editBtn, delBtn]);
      return el("div", { className: "rule-item", style: { borderLeftColor: rule.color, borderLeftWidth: "5px" } }, [ctrlCol, textCol, actionCol]);
    }
    const renderRules = () => {
      let rules = getRules();
      rContainer.replaceChildren();
      rules = rules.filter((r) => !r._isPreview && r.id !== "__preview__");
      if (!rules.length) {
        rContainer.appendChild(el("div", { style: { textAlign: "center", fontSize: "12px", color: "var(--apm-text-disabled)", margin: "10px" } }, ["No rules found."]));
        return;
      }
      rules.forEach((rule, idx) => {
        const itemEl = renderRuleItem(rule, {
          onDelete: () => {
            let rs = getRules();
            setRules(rs.filter((r) => r.id !== rule.id));
            saveSync();
          },
          onEdit: () => {
            _editingId = rule.id;
            const r = getRules().find((x) => x.id === _editingId);
            if (r) {
              const ccSearchEl = document.getElementById("cc-search");
              if (ccSearchEl) ccSearchEl.value = r.search;
              const ccTagEl = document.getElementById("cc-tag");
              if (ccTagEl) {
                ccTagEl.value = (r.tag || "").replace(/\\n/g, "\n");
                ccTagEl.style.height = "auto";
                ccTagEl.style.height = Math.min(ccTagEl.scrollHeight, 72) + "px";
              }
              const ccColorEl = document.getElementById("cc-color");
              if (ccColorEl) ccColorEl.value = r.color;
              const fillBtn = document.getElementById("cc-btn-fill");
              const tagBtn = document.getElementById("cc-btn-tag");
              applyToggleBtnStyle(fillBtn, !!r.fill);
              applyToggleBtnStyle(tagBtn, !!r.showTag);
              updatePreview();
              const btnText = document.getElementById("cc-add-btn-text");
              const addBtn = document.getElementById("cc-add-btn");
              if (btnText) btnText.textContent = "Update Rule";
              else if (addBtn) addBtn.textContent = "Update Rule";
              if (addBtn) addBtn.style.background = "var(--apm-warning)";
              const cancelBtn = document.getElementById("cc-cancel-btn");
              if (cancelBtn) cancelBtn.style.display = "inline-block";
            }
          },
          onMoveUp: () => {
            let rs = getRules();
            const i = rs.findIndex((r) => r.id === rule.id);
            if (i > 0) {
              [rs[i - 1], rs[i]] = [rs[i], rs[i - 1]];
              setRules(rs);
              saveSync();
            }
          },
          onMoveDown: () => {
            let rs = getRules();
            const i = rs.findIndex((r) => r.id === rule.id);
            if (i < rs.length - 1) {
              [rs[i + 1], rs[i]] = [rs[i], rs[i + 1]];
              setRules(rs);
              saveSync();
            }
          }
        });
        rContainer.appendChild(itemEl);
      });
    };
    const resetForm = () => {
      _editingId = null;
      const ccSearchEl = document.getElementById("cc-search");
      if (ccSearchEl) ccSearchEl.value = "";
      const ccTagEl = document.getElementById("cc-tag");
      if (ccTagEl) ccTagEl.value = "";
      const ccColorEl = document.getElementById("cc-color");
      if (ccColorEl) ccColorEl.value = DEFAULT_RULE_COLOR;
      applyToggleBtnStyle(document.getElementById("cc-btn-fill"), true);
      applyToggleBtnStyle(document.getElementById("cc-btn-tag"), true);
      clearPreview();
      updatePreview();
      const btnText = document.getElementById("cc-add-btn-text");
      const addBtn = document.getElementById("cc-add-btn");
      if (btnText) btnText.textContent = "Save Rule";
      else if (addBtn) addBtn.textContent = "Save Rule";
      if (addBtn) addBtn.style.background = "var(--apm-accent)";
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
      showThemeReloadDialog();
    };
    const elCancelBtn = document.getElementById("cc-cancel-btn");
    if (elCancelBtn) elCancelBtn.onclick = resetForm;
    const elFillBtn = document.getElementById("cc-btn-fill");
    if (elFillBtn) elFillBtn.onclick = (e) => {
      e.stopPropagation();
      applyToggleBtnStyle(elFillBtn, !elFillBtn.classList.contains("active"));
      updatePreview();
      updateGridPreview();
    };
    const elTagBtn = document.getElementById("cc-btn-tag");
    if (elTagBtn) elTagBtn.onclick = (e) => {
      e.stopPropagation();
      applyToggleBtnStyle(elTagBtn, !elTagBtn.classList.contains("active"));
      updatePreview();
      updateGridPreview();
    };
    document.getElementById("cc-color")?.addEventListener("input", updatePreview);
    document.getElementById("cc-tag")?.addEventListener("input", updatePreview);
    const elAddBtn = document.getElementById("cc-add-btn");
    if (elAddBtn) elAddBtn.onclick = () => {
      const searchInput = document.getElementById("cc-search");
      const s = searchInput?.value.trim();
      if (!s) return;
      const tagInput = document.getElementById("cc-tag");
      const tag = (tagInput?.value.trim() || "").replace(/\n/g, "\\n");
      const fillActive = document.getElementById("cc-btn-fill")?.classList.contains("active") ?? false;
      const tagActive = document.getElementById("cc-btn-tag")?.classList.contains("active") ?? false;
      const nr = {
        search: s,
        tag,
        color: document.getElementById("cc-color")?.value || DEFAULT_RULE_COLOR,
        fill: fillActive,
        showTag: tagActive && tag.length > 0
      };
      let rs = getRules();
      if (_editingId) {
        const idx = rs.findIndex((r) => r.id === _editingId);
        if (idx > -1) {
          rs[idx] = { id: rs[idx].id, ...nr };
        }
      } else {
        rs.push({ id: Date.now(), ...nr });
      }
      setRules(rs);
      saveSync();
      clearPreview();
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
      ccSearch.addEventListener("input", () => {
        const pos = ccSearch.selectionStart;
        ccSearch.value = ccSearch.value.replace(/(^|[, ]+)([a-z])/g, (m, sep, ch) => sep + ch.toUpperCase());
        ccSearch.selectionStart = ccSearch.selectionEnd = pos;
      });
      ccSearch._apmListenersAttached = true;
    }
    if (ccTag && !ccTag._apmListenersAttached) {
      ["keyup", "keypress"].forEach((evt) => {
        ccTag.addEventListener(evt, (e) => {
          if (e.key !== "Tab") e.stopPropagation();
        });
      });
      const autoResizeTag = () => {
        ccTag.style.height = "auto";
        ccTag.style.height = Math.min(ccTag.scrollHeight, 72) + "px";
      };
      ccTag.addEventListener("input", autoResizeTag);
      ccTag.addEventListener("keydown", (e) => {
        if (e.key !== "Tab") e.stopPropagation();
      });
      ccTag._apmListenersAttached = true;
    }
    const elExportBtn = document.getElementById("cc-export-btn");
    if (elExportBtn) {
      elExportBtn.onclick = (e) => {
        try {
          if (!e.shiftKey) {
            const rulesJson = JSON.stringify(getRules());
            const encoded = encodeSettingsAsBase64(rulesJson);
            navigator.clipboard.writeText(encoded).then(() => showToast("Rules copied as Base64", "var(--apm-success-bright)")).catch(() => showToast("Failed to copy to clipboard", "var(--apm-danger)"));
          } else {
            const rules = getRules();
            const jsonStr = JSON.stringify(rules, null, 2);
            const blob = new Blob([jsonStr], { type: "application/json" });
            const url2 = URL.createObjectURL(blob);
            const link = document.createElement("a");
            const now = /* @__PURE__ */ new Date();
            const dateStr = now.toISOString().split("T")[0];
            link.href = url2;
            link.download = `apm-colorcode-rules-${dateStr}.json`;
            link.click();
            URL.revokeObjectURL(url2);
            showToast(`Downloaded ${rules.length} rules`, "var(--apm-success-bright)");
          }
        } catch (err) {
          showToast("Export error: " + err.message, "var(--apm-danger)");
        }
      };
    }
    ;
    const elImportBtn = document.getElementById("cc-import-btn");
    if (elImportBtn) {
      elImportBtn.onclick = () => {
        const panel = document.getElementById("cc-import-panel");
        if (panel) {
          panel.style.display = panel.style.display === "none" ? "block" : "none";
          if (panel.style.display === "block") {
            const textarea = document.getElementById("cc-import-textarea");
            if (textarea) textarea.focus();
          }
        }
      };
    }
    const ccImportPanel = document.getElementById("cc-import-panel");
    const ccImportTextarea = document.getElementById("cc-import-textarea");
    const ccImportFileBtn = document.getElementById("cc-import-file-btn");
    const ccImportFileInput = document.getElementById("cc-import-file-input");
    const NEUTRAL_TAG_COLOR = "#d5d5d5";
    function normalizeExternalTags(arr) {
      const isExternal = arr.some((r) => r.searchText !== void 0);
      if (!isExternal) return null;
      return arr.map((r) => ({
        id: Date.now() + Math.random(),
        search: String(r.searchText || ""),
        tag: String(r.appendText || "").replace(/\n/g, "\\n"),
        color: String(r.color || NEUTRAL_TAG_COLOR),
        fill: false,
        showTag: !!r.appendText
      }));
    }
    function showThemeReloadDialog() {
      const overlay = el("div", { className: "apm-modal-overlay", style: { zIndex: "2147483647" } }, [
        el("div", { className: "apm-modal-content", style: { width: "360px", maxWidth: "90vw" } }, [
          el("div", { className: "apm-modal-header" }, [
            el("span", { style: { fontWeight: "600", fontSize: "14px", color: "var(--apm-text-bright)" } }, "Theme Changed")
          ]),
          el("div", { className: "apm-modal-body" }, [
            el(
              "p",
              { style: { fontSize: "12px", color: "var(--apm-text-secondary)", margin: "0 0 10px", lineHeight: "1.5" } },
              "Your theme has been saved. A page refresh is required for the new theme to take full effect."
            ),
            el(
              "p",
              { style: { fontSize: "11px", color: "var(--apm-text-muted)", margin: "0", lineHeight: "1.5" } },
              "Refreshing now will reload your session back to the start center with the updated theme. You can also continue working and the theme will take effect in the next session."
            )
          ]),
          el("div", { className: "apm-modal-footer", style: { display: "flex", gap: "8px", justifyContent: "flex-end" } }, [
            el("button", {
              className: "apm-modal-btn apm-modal-btn-ghost",
              onclick: () => overlay.remove()
            }, "Later"),
            el("button", {
              className: "apm-modal-btn apm-modal-btn-accent",
              onclick: () => {
                window.top.location.href = SESSION_TIMEOUT_URL;
              }
            }, "Refresh Now")
          ])
        ])
      ]);
      document.body.appendChild(overlay);
    }
    function showImportChoiceDialog(ruleCount) {
      return new Promise((resolve) => {
        const overlay = el("div", { className: "apm-modal-overlay", style: { zIndex: "2147483647" } }, [
          el("div", { className: "apm-modal-content", style: { width: "380px", maxWidth: "90vw" } }, [
            el("div", { className: "apm-modal-header" }, [
              el("span", { style: { fontWeight: "600", fontSize: "14px", color: "var(--apm-text-bright)" } }, `Import ${ruleCount} Rule${ruleCount !== 1 ? "s" : ""}`)
            ]),
            el("div", { className: "apm-modal-body" }, [
              el(
                "p",
                { style: { fontSize: "12px", color: "var(--apm-text-secondary)", margin: "0 0 12px", lineHeight: "1.5" } },
                "Choose how to handle the imported rules:"
              ),
              el("div", { style: { display: "flex", flexDirection: "column", gap: "8px" } }, [
                el("div", { style: { fontSize: "11px", color: "var(--apm-text-muted)", padding: "8px 10px", background: "var(--apm-surface-inset)", borderRadius: "6px", lineHeight: "1.5" } }, [
                  el("span", { style: { fontWeight: "bold", color: "var(--apm-warning)" } }, "Replace"),
                  " \u2014 Remove all existing rules and use only the imported ones.",
                  el("br"),
                  el("span", { style: { fontWeight: "bold", color: "var(--apm-success)" } }, "Merge"),
                  " \u2014 Keep your existing rules and add the imported ones after them."
                ])
              ])
            ]),
            el("div", { className: "apm-modal-footer", style: { display: "flex", gap: "8px", justifyContent: "flex-end" } }, [
              el("button", {
                className: "apm-modal-btn apm-modal-btn-ghost",
                onclick: () => {
                  overlay.remove();
                  resolve("cancel");
                }
              }, "Cancel"),
              el("button", {
                className: "apm-modal-btn apm-modal-btn-success",
                onclick: () => {
                  overlay.remove();
                  resolve("merge");
                }
              }, "Merge"),
              el("button", {
                className: "apm-modal-btn apm-modal-btn-warning",
                onclick: () => {
                  overlay.remove();
                  resolve("replace");
                }
              }, "Replace")
            ])
          ])
        ]);
        document.body.appendChild(overlay);
      });
    }
    const performImport = async (input) => {
      if (!input || !input.trim()) {
        showToast("No rules provided", "var(--apm-warning)");
        return;
      }
      try {
        let importedRules;
        const trimmed = input.trim();
        if (trimmed.startsWith("APM:")) {
          const decoded = decodeSettingsFromBase64(trimmed);
          if (!decoded) {
            showToast("Invalid Base64 format", "var(--apm-danger)");
            return;
          }
          importedRules = JSON.parse(decoded);
        } else if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
          importedRules = JSON.parse(trimmed);
        } else {
          showToast("Expected Base64 (APM:...) or JSON array", "var(--apm-danger)");
          return;
        }
        if (!Array.isArray(importedRules) || importedRules.length === 0) {
          showToast("No valid rules found", "var(--apm-warning)");
          return;
        }
        const converted = normalizeExternalTags(importedRules);
        if (converted) {
          importedRules = converted;
        } else {
          importedRules = importedRules.map((r) => ({
            id: Date.now() + Math.random(),
            search: String(r.search || ""),
            tag: String(r.tag || ""),
            color: String(r.color || DEFAULT_RULE_COLOR),
            fill: !!r.fill,
            showTag: r.showTag !== false
          }));
        }
        const choice = await showImportChoiceDialog(importedRules.length);
        if (choice === "cancel") return;
        if (choice === "replace") {
          setRules(importedRules);
        } else {
          let rs = getRules();
          importedRules.forEach((r) => {
            r.id = Date.now() + Math.random();
            rs.push(r);
          });
          setRules(rs);
        }
        saveSync();
        showToast(`${choice === "replace" ? "Replaced" : "Merged"} ${importedRules.length} rules`, "var(--apm-success-bright)");
        if (ccImportPanel) ccImportPanel.style.display = "none";
        if (ccImportTextarea) ccImportTextarea.value = "";
      } catch (err) {
        showToast("Invalid format: " + err.message, "var(--apm-danger)");
      }
    };
    if (ccImportTextarea) {
      ccImportTextarea.addEventListener("keydown", (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
          e.preventDefault();
          performImport(ccImportTextarea.value);
        }
      });
    }
    if (ccImportFileInput) {
      ccImportFileInput.addEventListener("change", (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (evt) => {
          const content = evt.target?.result;
          if (typeof content === "string") {
            performImport(content);
          }
        };
        reader.onerror = () => showToast("Failed to read file", "var(--apm-danger)");
        reader.readAsText(file);
      });
    }
    if (ccImportFileBtn) {
      ccImportFileBtn.onclick = () => {
        ccImportFileInput?.click();
      };
    }
    const PREVIEW_DEBOUNCE_MS = 50;
    function updateGridPreview() {
      clearTimeout(_previewDebounceTimer);
      _previewDebounceTimer = setTimeout(() => {
        const settingsPanel = document.getElementById("apm-settings-panel");
        if (!settingsPanel || settingsPanel.style.display === "none") {
          setPreviewRuleOverride(null);
          invalidateColorCodeCache();
          const gc = findMainGrid();
          if (gc) debouncedProcessColorCodeGrid(gc.doc);
          return;
        }
        const gridContext = findMainGrid();
        if (!gridContext) return;
        const tempRule = buildTempRuleFromFormState();
        currentPreviewRule = tempRule;
        isPreviewActive = true;
        setPreviewRuleOverride(tempRule);
        invalidateColorCodeCache();
        debouncedProcessColorCodeGrid(gridContext.doc);
      }, PREVIEW_DEBOUNCE_MS);
    }
    function clearPreview() {
      APMLogger.debug("ColorCode UI", "clearPreview called");
      clearTimeout(_previewDebounceTimer);
      _previewDebounceTimer = null;
      isPreviewActive = false;
      currentPreviewRule = null;
      originalRulesSnapshot = null;
      APMLogger.debug("ColorCode UI", "Clearing preview override...");
      setPreviewRuleOverride(null);
      const appRules = AppState.colorCode.rules;
      if (Array.isArray(appRules) && appRules.some((r) => r.id === "__preview__")) {
        AppState.colorCode.rules = appRules.filter((r) => r.id !== "__preview__");
        APMLogger.debug("ColorCode UI", "Stripped stale __preview__ from AppState");
      }
      APMLogger.debug("ColorCode UI", "Invalidating caches...");
      invalidateColorCodeCache();
      const gridContext = findMainGrid();
      if (gridContext) {
        APMLogger.debug("ColorCode UI", "Processing grid to remove preview...");
        debouncedProcessColorCodeGrid(gridContext.doc);
      }
    }
    const formInputIds = ["cc-search", "cc-color", "cc-tag"];
    formInputIds.forEach((id) => {
      const inputEl = document.getElementById(id);
      if (inputEl) {
        inputEl.addEventListener("input", (e) => {
          APMLogger.debug("ColorCode UI", `Input event on #${id}:`, e.target.value);
          updateGridPreview();
        });
        inputEl.addEventListener("change", (e) => {
          APMLogger.debug("ColorCode UI", `Change event on #${id}:`, e.target.value);
          updateGridPreview();
        });
      }
    });
    renderRules();
    updatePreview();
  }
  function cleanupColorCodeOnPanelClose() {
    clearTimeout(_previewDebounceTimer);
    _previewDebounceTimer = null;
    const ccSearch = document.getElementById("cc-search");
    const ccTag = document.getElementById("cc-tag");
    const ccColor = document.getElementById("cc-color");
    const ccBtnFill = document.getElementById("cc-btn-fill");
    const ccBtnTag = document.getElementById("cc-btn-tag");
    if (ccSearch) ccSearch.value = "";
    if (ccTag) ccTag.value = "";
    if (ccColor) ccColor.value = DEFAULT_RULE_COLOR;
    applyToggleBtnStyle(ccBtnFill, true);
    applyToggleBtnStyle(ccBtnTag, true);
    const previewRow = document.getElementById("cc-preview-row");
    const previewTag = document.getElementById("cc-preview-tag");
    if (previewRow) {
      previewRow.style.background = "transparent";
      previewRow.style.borderLeft = "1px solid var(--apm-border)";
    }
    if (previewTag) previewTag.style.display = "none";
    const ccAddBtn = document.getElementById("cc-add-btn");
    const ccAddBtnText = document.getElementById("cc-add-btn-text");
    if (ccAddBtnText) ccAddBtnText.textContent = "Save Rule";
    else if (ccAddBtn) ccAddBtn.textContent = "Save Rule";
    if (ccAddBtn) ccAddBtn.style.background = "var(--apm-accent)";
    setPreviewRuleOverride(null);
    const appRules = AppState.colorCode.rules;
    if (Array.isArray(appRules) && appRules.some((r) => r.id === "__preview__")) {
      AppState.colorCode.rules = appRules.filter((r) => r.id !== "__preview__");
    }
    invalidateColorCodeCache();
    const gridContext = findMainGrid();
    if (gridContext) debouncedProcessColorCodeGrid(gridContext.doc);
  }
  function watchSettingsPanelClose() {
    const panel = document.getElementById("apm-settings-panel");
    if (!panel || panel._ccCloseWatcherAttached) return;
    panel._ccCloseWatcherAttached = true;
    const observer = new MutationObserver(() => {
      if (panel.style.display === "none") {
        cleanupColorCodeOnPanelClose();
      }
    });
    observer.observe(panel, { attributes: true, attributeFilter: ["style"] });
  }
  function cleanupStalePreviewRules() {
    const rules = AppState.colorCode.rules;
    if (Array.isArray(rules) && rules.some((r) => r.id === "__preview__")) {
      const cleaned = rules.filter((r) => r.id !== "__preview__");
      AppState.colorCode.rules = cleaned;
      APMLogger.debug("ColorCode UI", `Cleaned ${rules.length - cleaned.length} stale preview rule(s) from AppState`);
    }
  }

  // src/modules/labor-tracker.js
  init_dom_helpers();
  init_utils();
  init_state();
  init_labor_service();
  init_logger();
  init_ui_manager();
  init_constants();
  init_storage();
  init_feature_flags();
  var LaborTracker = (function() {
    if (!isTopFrame()) return { init: function() {
    } };
    let activeTab = 1;
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
      const currentUser = cleanEmployeeId(session.user);
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
      trigger.textContent = "LABOR TALLY";
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
          el("div", { className: "labor-tab active", "data-d": "1" }, "Today"),
          el("div", { className: "labor-tab", "data-d": "2" }, "2-Day"),
          el("div", { className: "labor-tab", "data-d": "7" }, "7-Day")
        ]),
        el("div", { id: "labor-sum-box", className: "labor-total" }, [
          "0.00 ",
          el("span", { className: "labor-total-unit" }, "hrs")
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
        const cls = errorMsg === "Loading..." ? "labor-status-loading" : "labor-status-error";
        sumBox.textContent = "";
        const span = document.createElement("span");
        span.className = cls;
        span.textContent = errorMsg;
        sumBox.appendChild(span);
        list.innerHTML = "";
        return;
      }
      const { total, breakdown } = calculateLabor(activeTab);
      sumBox.textContent = "";
      sumBox.appendChild(document.createTextNode(total.toFixed(2) + " "));
      const unit = document.createElement("span");
      unit.className = "labor-total-unit";
      unit.textContent = "hrs";
      sumBox.appendChild(unit);
      list.innerHTML = "";
      const sortedDates = Object.keys(breakdown).sort((a, b) => new Date(b) - new Date(a));
      if (sortedDates.length === 0) {
        list.appendChild(el("div", { className: "labor-empty" }, "No labor records found."));
      } else {
        sortedDates.forEach((d) => {
          const row = el("div", { className: "labor-row" }, [
            el("span", {}, d),
            document.createTextNode(" "),
            el("strong", {}, String(breakdown[d].toFixed(2)))
          ]);
          list.appendChild(row);
        });
      }
    }
    return {
      init: function() {
        if (!FeatureFlags.isEnabled("laborBooker")) return;
        if (!isTopFrame()) return;
        if (isInitialized) {
          if (!document.getElementById("apm-labor-trigger")) injectUI();
          return;
        }
        injectUI();
        isInitialized = true;
        UIManager.addExternalHandler(() => {
          const isHidden = panel.style.display === "none" || panel.style.visibility === "hidden";
          if (isHidden) {
            if (selectedEmployee !== "") {
              APMLogger.debug("LaborTracker", "Resetting selectedEmployee to Self on panel close.");
              selectedEmployee = "";
              APMStorage.set(LABOR_ACTIVE_STORAGE, "");
              renderEmpSelect();
            }
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
  init_labor_booker();

  // src/modules/tab-title.js
  init_logger();
  init_utils();
  init_constants();
  function getRecordDescription() {
    const wins = getExtWindows();
    for (const win of wins) {
      try {
        if (!win.Ext?.ComponentQuery) continue;
        const rvForms = win.Ext.ComponentQuery.query("form[id*=recordview]");
        const rvForm = rvForms.find((f) => f.rendered && !f.isDestroyed && f.isVisible?.());
        if (!rvForm) continue;
        const record = rvForm.getRecord?.();
        if (record) {
          const desc = (record.get("description") || "").trim();
          if (desc) return desc;
        }
        const descField = rvForm.getForm?.().findField?.("description");
        if (descField) {
          const val = (descField.getValue() || "").trim();
          if (val) return val;
        }
      } catch (e) {
      }
    }
    return null;
  }
  function updateTabTitle() {
    try {
      const userFunc = detectScreenFunction();
      if (!userFunc || userFunc === "GLOBAL") return;
      const entity = ENTITY_REGISTRY[userFunc];
      const screenTitle = entity?.screenTitle || SCREEN_TITLES[userFunc];
      if (entity) {
        const desc = getRecordDescription();
        if (desc) {
          if (document.title !== desc) {
            document.title = desc;
            APMLogger.debug("TabTitle", `Set title to record description: "${desc}"`);
          }
          return;
        }
      }
      if (screenTitle) {
        if (document.title !== screenTitle) {
          document.title = screenTitle;
          APMLogger.debug("TabTitle", `Set title to screen: "${screenTitle}"`);
        }
        return;
      }
    } catch (e) {
      APMLogger.error("TabTitle", "Failed to update tab title:", e);
    }
  }

  // src/ui/settings-panel.js
  init_logger();
  init_toast();
  init_utils();
  init_state();
  init_constants();
  init_api();
  init_storage();
  init_diagnostics();
  init_scheduler();
  init_feature_flags();
  init_dom_helpers();
  function createMainPanel() {
    const panel = el("div", { id: "apm-settings-panel", className: "apm-settings-container apm-ui-panel" });
    applyZoomCompensation(panel);
    return panel;
  }
  function createHeader() {
    return el("div", { className: "apm-settings-header" }, [
      el("h4", { className: "apm-settings-title" }, "APM Master")
    ]);
  }
  function createTabContainer() {
    return el("div", { id: "apm-tab-container", className: "apm-tab-container" }, [
      el("div", { id: "tab-autofill", className: "apm-tab-btn apm-tab-active-autofill" }, "Auto Fill Profiles"),
      el("div", { id: "tab-settings", className: "apm-tab-btn apm-tab-inactive" }, "Tab Order"),
      el("div", { id: "tab-colorcode", className: "apm-tab-btn apm-tab-inactive" }, "ColorCode & Nametag"),
      el("div", { id: "tab-general", className: "apm-tab-btn apm-tab-inactive" }, "General"),
      el("div", { id: "tab-diagnostics", className: "apm-tab-btn apm-tab-inactive" }, "Diagnostics")
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
          // ── Getting Started ──
          el("div", { className: "apm-help-section" }, [
            el("div", { className: "apm-help-section-title" }, "Getting Started"),
            el("p", {}, "APM Master adds productivity tools on top of EAM. General settings can be found in the APM Master toolbar button."),
            el("ul", {}, [
              el("li", {}, [el("b", {}, "Theme: "), "Set your preferred theme in the ", el("b", {}, "General"), " tab. Dark Classic is recommended for dark mode users. Themes apply after a page reload."]),
              el("li", {}, [el("b", {}, "Feature Flags: "), "Toggle individual modules on or off in the ", el("b", {}, "General"), " tab. Disabling a feature stops it from running entirely."]),
              el("li", {}, [el("b", {}, "Export / Import: "), "Back up all your settings, rules, and profiles from the ", el("b", {}, "General"), " tab. Use this to transfer your setup to another machine or restore after a reinstall."])
            ])
          ]),
          // ── Forecast & Filters ──
          el("div", { className: "apm-help-section" }, [
            el("div", { className: "apm-help-section-title" }, "Forecast & Filters"),
            el("p", {}, "Automate MADDON filtering with date ranges, keywords, and custom dataspies. Access via the Forecast button in the toolbar."),
            el("ul", {}, [
              el("li", {}, [el("b", {}, "Site / Org: "), "For multi-site users \u2014 select a site to narrow results. Single-site users can leave this on the default."]),
              el("li", {}, [el("b", {}, "Date Range: "), "Pick a target week, select specific days, or switch to custom dates for absolute calendar picking. Use the Today modifier to include or exclude past-due orders."]),
              el("li", {}, [el("b", {}, "Custom Dataspy: "), "Build advanced filters with multiple keywords using AND/OR logic. Exclude terms you don't need. Filters can target specific fields like description, status, or equipment."]),
              el("li", {}, [el("b", {}, "Saved Profiles: "), "Save your filter combinations as named profiles to quickly switch between different views."]),
              el("li", {}, [el("b", {}, "PM Filter Toggle: "), 'Instantly filter existing search results between "PMs Only", "Non-PMs", or "Show All" using the filter button in the grid toolbar.']),
              el("li", {}, [el("b", {}, "Shortcuts: "), "Press ", el("kbd", {}, "Alt+T"), " to instantly search today's work orders. Press ", el("kbd", {}, "Alt+C"), " to clear all filters."])
            ])
          ]),
          // ── ColorCode & Nametag ──
          el("div", { className: "apm-help-section" }, [
            el("div", { className: "apm-help-section-title" }, "ColorCode & Nametag"),
            el("p", {}, "Highlight work orders in the grid based on keywords. Rules are matched top-to-bottom against the description column."),
            el("ul", {}, [
              el("li", {}, [el("b", {}, "Creating Rules: "), "Open the ", el("b", {}, "ColorCode & Theme"), " tab, type a keyword, pick a color, and click Add. The rule is applied immediately."]),
              el("li", {}, [el("b", {}, "Multi-Keyword: "), "Enter multiple terms separated by commas (e.g., ", el("code", {}, "13 week, quarterly, slider belt"), ") to match any of them with one rule."]),
              el("li", {}, [el("b", {}, "Nametags: "), "Add badge text to a rule to show a colored pill on matching cells. Leave it empty to only highlight the row background."]),
              el("li", {}, [el("b", {}, "Tag Filtering: "), "Click any nametag in the grid to filter for that tag. Click it again to clear the filter."]),
              el("li", {}, [el("b", {}, "Fill Row: "), "Controls whether the entire row gets a background color. The first matching rule wins."]),
              el("li", {}, [el("b", {}, "Rule Order: "), "Drag rules to reorder priority. Rules higher in the list take precedence."])
            ])
          ]),
          // ── AutoFill Profiles ──
          el("div", { className: "apm-help-section" }, [
            el("div", { className: "apm-help-section-title" }, "AutoFill Profiles"),
            el("p", {}, "Create templates for recurring work orders. When APM detects a matching WO, a teal Auto Fill button appears on the record toolbar."),
            el("ul", {}, [
              el("li", {}, [el("b", {}, "Setup: "), "Open the ", el("b", {}, "Auto Fill Profiles"), " tab, create a new profile, and set a keyword that matches the WO description."]),
              el("li", {}, [el("b", {}, "Fields: "), "Templates can fill closing comments, trouble found/cause/action codes, assigned to, equipment closest match, and PM checklist counts."]),
              el("li", {}, [el("b", {}, "PM Checkbox: "), 'Set "1-Tech" or "10-Tech" to automatically complete the PM checklist as part of the fill.']),
              el("li", {}, [el("b", {}, "Partial Fill: "), "Leave fields blank in the template to skip them. Only the fields you define will be filled."]),
              el("li", {}, [el("b", {}, "Multiple Profiles: "), "Create as many profiles as you need. The first one whose keyword matches the WO description is suggested."])
            ])
          ]),
          // ── Labor Tools ──
          el("div", { className: "apm-help-section" }, [
            el("div", { className: "apm-help-section-title" }, "Labor Tools"),
            el("p", {}, "Book labor and track your hours without navigating away from the work order."),
            el("ul", {}, [
              el("li", {}, [el("b", {}, "Quick Book: "), "Click the orange Quick Book button on the Book Labor tab. Pick a preset or type custom hours, choose Normal or Overtime, and book instantly. Double-click a preset to book in one step."]),
              el("li", {}, [el("b", {}, "Correction Mode: "), "Check the Subtract box to book negative hours for corrections."]),
              el("li", {}, [el("b", {}, "Shift Summary: "), "The sidebar shows hours booked today (and yesterday in Night Shift mode) so you always know your running total."]),
              el("li", {}, [el("b", {}, "Labor Tally: "), "The dockable widget on the edge of your screen shows your hours for 1, 2, or 7 days. Drag it to any edge. Click to expand."]),
              el("li", {}, [el("b", {}, "Manager Mode: "), "Add other employee IDs in the Labor Tally to view their hours. Select from the dropdown to switch between employees."])
            ])
          ]),
          // ── Tab & Grid Customization ──
          el("div", { className: "apm-help-section" }, [
            el("div", { className: "apm-help-section-title" }, "Tab & Grid Customization"),
            el("p", {}, "Rearrange EAM's interface to match your workflow. Changes persist across sessions."),
            el("ul", {}, [
              el("li", {}, [el("b", {}, "Reorder Tabs: "), "Open the ", el("b", {}, "Tab Order"), " tab in settings. Drag record tabs into your preferred order."]),
              el("li", {}, [el("b", {}, "Reorder Columns: "), 'Switch to "Columns" mode to drag grid columns into your preferred order.']),
              el("li", {}, [el("b", {}, "Hide Tabs: "), 'Click the \u2716 on any tab to hide it. Restore hidden tabs from the "Hidden" list.']),
              el("li", {}, [el("b", {}, "Reset: "), "Use Reset to Default to restore the original EAM layout for the current screen."])
            ])
          ]),
          // ── Search & Navigation ──
          el("div", { className: "apm-help-section" }, [
            el("div", { className: "apm-help-section-title" }, "Search & Navigation"),
            el("ul", {}, [
              el("li", {}, [el("b", {}, "Quick Search: "), "Type a WO number in the search box in the top toolbar to jump directly to that work order."]),
              el("li", {}, [el("b", {}, "Keyboard Shortcuts: "), "Press ", el("kbd", {}, "Alt+T"), " to load today's work orders. Press ", el("kbd", {}, "Alt+C"), " to clear all filters."]),
              el("li", {}, [el("b", {}, "WO Links: "), "Work order numbers in the grid are automatically hyperlinked. Click to open in EAM. Use the clipboard icon to copy the direct URL."]),
              el("li", {}, [el("b", {}, "Link Behavior: "), "Configure whether links open in the current window or a new tab in the ", el("b", {}, "General"), " tab."])
            ])
          ]),
          // ── PTP & Safety ──
          el("div", { className: "apm-help-section" }, [
            el("div", { className: "apm-help-section-title" }, "PTP & Safety"),
            el("ul", {}, [
              el("li", {}, [el("b", {}, "Take-2 Timer: "), "When enabled, a 2-minute countdown appears on the PTP assessment screen as a reminder to pause and assess hazards before starting work."]),
              el("li", {}, [el("b", {}, "PTP Status Icons: "), "A \u2705 icon appears in the grid and record header for work orders where you've already completed a PTP assessment. This tracks your personal history only."]),
              el("li", {}, [el("b", {}, "Toggle: "), "Enable or disable the PTP Timer in the ", el("b", {}, "General"), " tab."])
            ])
          ]),
          // ── General Settings ──
          el("div", { className: "apm-help-section" }, [
            el("div", { className: "apm-help-section-title" }, "General Settings"),
            el("ul", {}, [
              el("li", {}, [el("b", {}, "Auto-Redirect: "), "Automatically navigates back to the EAM home screen when your session expires, so you don't get stuck on an error page."]),
              el("li", {}, [el("b", {}, "Date Format: "), "Override EAM's date display format and separator to match your regional preference."]),
              el("li", {}, [el("b", {}, "Feature Flags: "), "Disable any module you don't use. Disabled modules are completely skipped at startup for better performance."]),
              el("li", {}, [el("b", {}, "Diagnostics: "), "The Diagnostics tab shows boot timing, active tasks, and system health. Useful for troubleshooting if something isn't working."])
            ])
          ]),
          // ── More Info ──
          el("div", { className: "apm-help-section", style: { textAlign: "center", borderTop: "1px solid var(--apm-border)", paddingTop: "14px", marginTop: "8px" } }, [
            el("a", { href: "https://w.amazon.com/bin/view/Users/rosendah/APM-Master/", target: "_blank", className: "apm-help-wiki-link", style: { color: "var(--apm-accent)", fontWeight: "bold", fontSize: "12px", textDecoration: "underline", textUnderlineOffset: "3px" } }, "\u{1F4D6} Full Wiki \u2014 in-depth guides, screenshots & videos")
          ])
        ])
      ])
    ]);
  }
  function createWelcomeOverlay() {
    const tourPages = [
      {
        icon: "\u{1F50D}",
        title: "Forecast & Custom Filters",
        desc: "Filter your work order list by <b>date ranges, keywords, type</b>, and more. Multi-site users can narrow results by site. Use the <b>Dataspy Builder</b> for advanced AND/OR logic, exclude what you don't need, and save the filters you use every day."
      },
      {
        icon: "\u{1F9E9}",
        title: "Tab & Grid Customization",
        desc: "Drag and drop to <b>reorder record tabs and grid columns</b> to match how you actually work. Hide the tabs you never use. Your layout is saved across sessions \u2014 EAM finally remembers your preferences."
      },
      {
        icon: "\u26A1",
        title: "Labor Booking & Tally",
        desc: "Book labor directly from the work order with <b>Quick Book</b> \u2014 pick your hours, hit go. The <b>Labor Tally</b> widget docks to any edge of your screen and shows your booked hours at a glance, with multi-day and manager views."
      },
      {
        icon: "\u{1F4CB}",
        title: "AutoFill Profiles",
        desc: "Create <b>templates for recurring work orders</b> \u2014 closing comments, trouble codes, checklists, equipment fields. When APM detects a matching WO description, it offers to fill the form for you in one click."
      },
      {
        icon: "\u{1F3A8}",
        title: "ColorCode & Nametag",
        desc: "Highlight work orders in the grid based on <b>keywords</b>. Add colored nametag badges, click them to filter instantly. Color the <b>entire row, just the badge, or both</b> \u2014 it's up to you."
      }
    ];
    const overlay = el("div", { id: "apm-welcome-overlay", className: "apm-welcome-overlay apm-ui-panel", style: { display: "none" } }, [
      el("div", { className: "apm-welcome-modal" }, [
        el("div", { className: "apm-welcome-body" }, [
          // Page 0: Landing
          el("div", { className: "apm-welcome-page apm-welcome-landing active", "data-page": "0" }, [
            el("div", { className: "apm-welcome-icon" }, "\u{1F6E0}\uFE0F"),
            el("h3", { className: "apm-welcome-title" }, "Welcome to APM Master"),
            el("p", { className: "apm-welcome-subtitle" }, "Tools to make EAM work the way you need it to."),
            el("div", { className: "apm-welcome-theme-row" }, [
              el("span", { className: "apm-welcome-theme-label" }, "EAM system theme:"),
              el("select", { id: "apm-welcome-theme", className: "apm-welcome-theme-select" }, [
                el("option", { value: "default" }, "System Default"),
                el("option", { value: "theme-hex-dark" }, "Dark Hex"),
                el("option", { value: "theme-dark" }, "Dark Classic"),
                el("option", { value: "theme-darkblue" }, "Dark Blue"),
                el("option", { value: "theme-hex" }, "Light Hex"),
                el("option", { value: "theme-orange" }, "Orange")
              ])
            ]),
            el("p", { className: "apm-welcome-theme-tip" }, "Tip: Want a dark theme? Dark Classic is recommended. You can change this later in General Settings."),
            el("div", { className: "apm-welcome-landing-btns" }, [
              el("button", { id: "apm-welcome-start", className: "apm-welcome-start-btn" }, "Continue"),
              el("button", { id: "apm-welcome-skip-intro", className: "apm-welcome-skip-link" }, "Skip intro")
            ])
          ]),
          // Pages 1-5: Feature tour
          ...tourPages.map(
            (p, i) => el("div", { className: "apm-welcome-page", "data-page": String(i + 1) }, [
              el("div", { className: "apm-welcome-icon" }, p.icon),
              el("h3", { className: "apm-welcome-title" }, p.title),
              // CON6: innerHTML used here is safe — p.desc is static author-controlled content (no user input)
              el("p", { className: "apm-welcome-desc", innerHTML: p.desc })
            ])
          )
        ]),
        el("div", { className: "apm-welcome-footer" }, [
          el(
            "div",
            { id: "apm-welcome-dots", className: "apm-welcome-dots apm-welcome-tour-nav" },
            tourPages.map((_, i) => el("div", { className: `apm-welcome-dot${i === 0 ? " active" : ""}`, "data-dot": String(i) }))
          ),
          el("div", { id: "apm-welcome-tour-btns", className: "apm-welcome-nav apm-welcome-tour-nav" }, [
            el("button", { id: "apm-welcome-skip", className: "apm-welcome-skip" }, "Skip"),
            el("button", { id: "apm-welcome-next", className: "apm-welcome-next" }, "1 / 5  Next")
          ])
        ])
      ])
    ]);
    return overlay;
  }
  function bindWelcomeEvents() {
    const overlay = document.getElementById("apm-welcome-overlay");
    if (!overlay) return;
    let current = 0;
    let themeChanged = false;
    const allPages = overlay.querySelectorAll(".apm-welcome-page");
    const dots = overlay.querySelectorAll(".apm-welcome-dot");
    const tourNav = overlay.querySelectorAll(".apm-welcome-tour-nav");
    const nextBtn = document.getElementById("apm-welcome-next");
    const skipBtn = document.getElementById("apm-welcome-skip");
    const continueBtn = document.getElementById("apm-welcome-start");
    const skipIntroBtn = document.getElementById("apm-welcome-skip-intro");
    const themeSelect = document.getElementById("apm-welcome-theme");
    const tourTotal = 5;
    function goTo(idx) {
      current = idx;
      allPages.forEach((p) => p.classList.toggle("active", p.getAttribute("data-page") === String(idx)));
      const inTour = idx > 0;
      tourNav.forEach((el2) => el2.style.display = inTour ? "flex" : "none");
      if (inTour) {
        const tourIdx = idx - 1;
        dots.forEach((d, i) => d.classList.toggle("active", i === tourIdx));
        const isLast = tourIdx === tourTotal - 1;
        nextBtn.textContent = isLast ? "Get Started" : `${tourIdx + 1} / ${tourTotal}  Next`;
      }
    }
    function close() {
      overlay.style.display = "none";
      APMStorage.set(WELCOME_SEEN_KEY, true);
      if (themeChanged) {
        window.top.location.href = SESSION_TIMEOUT_URL;
      }
    }
    themeSelect.onchange = () => {
      const val = themeSelect.value;
      themeChanged = true;
      Promise.resolve().then(() => (init_theme_resolver(), theme_resolver_exports)).then(({ ThemeResolver: ThemeResolver2 }) => {
        ThemeResolver2.setGlobalTheme(val);
      });
    };
    continueBtn.onclick = () => goTo(1);
    skipIntroBtn.onclick = close;
    nextBtn.onclick = () => {
      if (current < tourTotal) goTo(current + 1);
      else close();
    };
    skipBtn.onclick = close;
    overlay.onclick = (e) => {
      if (e.target === overlay) close();
    };
  }
  function createChangelogModal() {
    return el("div", { id: "apm-changelog-modal", className: "apm-help-overlay apm-ui-panel", style: { display: "none" } }, [
      el("div", { className: "apm-help-modal", style: { width: "450px" } }, [
        el("div", { className: "apm-help-header" }, [
          el("h4", { className: "apm-help-title" }, "Revision History"),
          el("button", { id: "apm-changelog-close", className: "apm-help-close" }, "\u2716")
        ]),
        el("div", { className: "apm-help-content", style: { fontSize: "12px", lineHeight: "1.6" } }, [
          el("div", { style: { marginBottom: "15px", borderBottom: "1px solid var(--apm-border)", paddingBottom: "10px" } }, [
            el("b", { style: { color: "var(--apm-success)", display: "block", marginBottom: "5px" } }, "Latest \u2014 UI, Quality of Life, Infrastructure"),
            el("ul", { style: { paddingLeft: "20px", margin: "0" } }, [
              el("li", {}, "UI overhaul \u2014 centralized theme tokens, consistent visual flow across all panels and popups"),
              el("li", {}, "First-run welcome screen with theme selection and optional feature tour"),
              el("li", {}, "Comprehensive Help & Tips guide covering all features, linked from both settings and forecast"),
              el("li", {}, "Custom dataspy builder with multi-keyword OR/AND/exclusion filters"),
              el("li", {}, "Performance & error diagnostics tab"),
              el("li", {}, "Grid Column resizing, record tab reordering with overflow menu support and tab hiding"),
              el("li", {}, "ColorCode engine performance improvements with live rule preview"),
              el("li", {}, "Global configuration export/import"),
              el("li", {}, "Compatability with BetterAPM tags export into ColorCode tags"),
              el("li", {}, "Reduced dark mode page load flash"),
              el("li", {}, "Expanded hyperlink support for non-work order records"),
              el("li", {}, "Service centralization and legacy code cleanup")
            ])
          ]),
          el("div", { style: { marginBottom: "15px", borderBottom: "1px solid var(--apm-border)", paddingBottom: "10px" } }, [
            el("b", { style: { color: "var(--apm-accent)", display: "block", marginBottom: "5px" } }, "Planned Features"),
            el("ul", { style: { paddingLeft: "20px", margin: "0" } }, [
              el("li", {}, "WO QR codes for quick mobile access"),
              el("li", {}, "ColorCode rule pause/resume toggle"),
              el("li", {}, "Relative date filtering for ColorCode rules")
            ])
          ]),
          el("div", {}, [
            el("b", { style: { color: "var(--apm-accent)", display: "block", marginBottom: "5px" } }, "Planned Research"),
            el("ul", { style: { paddingLeft: "20px", margin: "0" } }, [
              el("li", {}, "Broader use of direct EXTJS API interaction and AJAX requests beyond Labor Tally/booking, dataspy, etc."),
              el("li", {}, "Personalized shift snapshots and multi-employee overview reports"),
              el("li", {}, "Session state snapshots to restore your exact position after timeout")
            ])
          ])
        ])
      ])
    ]);
  }
  function buildSettingsPanel() {
    if (window.self !== window.top || document.getElementById("apm-settings-panel")) return;
    const panel = createMainPanel();
    const helpOverlay = createHelpOverlay();
    const changelogModal = createChangelogModal();
    const welcomeOverlay = createWelcomeOverlay();
    const header = createHeader();
    const tabContainer = createTabContainer();
    const autofillFields = buildAutoFillTab();
    const tabOrderFields = buildTabOrderTab();
    const colorcodeFields = buildColorCodeTab();
    const generalFields = buildGeneralTab();
    const diagnosticsFields = buildDiagnosticsTab();
    const footer = createFooter();
    panel.appendChild(header);
    panel.appendChild(tabContainer);
    panel.appendChild(autofillFields);
    panel.appendChild(tabOrderFields);
    panel.appendChild(colorcodeFields);
    panel.appendChild(generalFields);
    panel.appendChild(diagnosticsFields);
    panel.appendChild(footer);
    document.body.appendChild(panel);
    document.body.appendChild(helpOverlay);
    document.body.appendChild(changelogModal);
    document.body.appendChild(welcomeOverlay);
    const state = {
      settingsMode: "cols",
      activeTab: "autofill",
      panel,
      autofillFields,
      tabOrderFields,
      colorcodeFields,
      generalFields,
      diagnosticsFields,
      footer
    };
    bindSettingsEvents(state);
    bindWelcomeEvents();
    if (!APMStorage.get(WELCOME_SEEN_KEY)) {
      setTimeout(() => {
        const overlay = document.getElementById("apm-welcome-overlay");
        if (overlay) overlay.style.display = "flex";
      }, 1500);
    }
  }
  APMApi.register("buildSettingsPanel", buildSettingsPanel);
  function buildAutoFillTab() {
    return el("div", { id: "apm-main-fields", className: "apm-panel-section" }, [
      el("div", { className: "apm-tab-content-scroll" }, [
        // ── Template Selector ──
        el("div", { className: "apm-template-box" }, [
          el("div", { className: "apm-template-label" }, "Saved Templates:"),
          el("div", { className: "apm-template-row" }, [
            el("select", { id: "apm-c-preset-select", className: "apm-template-select" }),
            el("button", { id: "apm-c-btn-save", className: "creator-btn apm-template-btn-update", title: "Update selection" }, "Update"),
            el("button", { id: "apm-c-btn-new", className: "creator-btn apm-template-btn-new", title: "Create a fresh template" }, "New Template"),
            el("button", { id: "apm-c-btn-del", className: "creator-btn apm-template-btn-del", title: "Delete template" }, "\u2716")
          ])
        ]),
        el("div", { className: "apm-fields-wrapper" }, [
          // ── Trigger Keywords / New Record Default ──
          el("div", { className: "apm-section-group", style: { marginBottom: "8px" } }, [
            el("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" } }, [
              el("div", { id: "apm-c-keyword-label", className: "apm-section-label", style: { color: "var(--apm-warning)", margin: "0" } }, "Auto-Match Keywords"),
              el("label", { style: { display: "flex", alignItems: "center", gap: "5px", cursor: "pointer" } }, [
                el("input", { type: "checkbox", id: "apm-c-is-default", style: { cursor: "pointer" } }),
                el("span", { style: { fontSize: "var(--apm-text-xs)", color: "var(--apm-text-muted)" } }, "New record template")
              ])
            ]),
            el("div", { id: "apm-c-keyword-row", className: "field-row", style: { margin: "0" } }, [
              el("input", { type: "text", id: "apm-c-keyword", className: "field-input apm-field-highlight", title: "Keywords to match WO title \u2014 separate multiple with comma", placeholder: "e.g., pre-sort, repair, jam", style: { fontFamily: "var(--apm-font-mono)", height: "28px", padding: "0 8px" } })
            ]),
            el("div", { id: "apm-c-wo-title-row", className: "field-row", style: { margin: "0", display: "none" } }, [
              el("input", { type: "text", id: "apm-c-wo-title", className: "field-input", title: "Title to set on the new work order", placeholder: "e.g., 13 Week PM \u2014 Line 1", style: { height: "28px", padding: "0 8px" } })
            ]),
            el("div", { id: "apm-c-keyword-hint", style: { fontSize: "var(--apm-text-xs)", color: "var(--apm-text-muted)", marginTop: "3px" } }, "When a WO title contains these words, this template is suggested automatically."),
            el("div", { id: "apm-c-wo-title-hint", style: { fontSize: "var(--apm-text-xs)", color: "var(--apm-text-muted)", marginTop: "3px", display: "none" } }, "This template appears on new blank records. The title above will fill the WO description.")
          ]),
          // ── Work Order Fields ──
          el("div", { className: "apm-section-group" }, [
            el("div", { className: "apm-section-label" }, "Work Order Fields"),
            el("div", { style: { display: "flex", gap: "6px", marginBottom: "4px" } }, [
              el("div", { className: "field-row", style: { width: "105px", flexShrink: "0", margin: "0" } }, [
                el("div", { className: "field-label", style: { width: "35px", textAlign: "left" } }, "Org:"),
                el("input", { type: "text", id: "apm-c-org", className: "field-input upper", placeholder: "Ignore", style: { height: "28px", padding: "0 6px" } })
              ]),
              el("div", { className: "field-row", style: { flexGrow: "1", margin: "0" } }, [
                el("div", { className: "field-label", title: "Partial match \u2014 grabs first search result", style: { width: "70px", textAlign: "left" } }, "Equipment:"),
                el("input", { type: "text", id: "apm-c-eq", className: "field-input upper", title: "Partial match \u2014 grabs first search result", placeholder: "Leave blank to ignore", style: { height: "28px", padding: "0 6px" } })
              ])
            ]),
            el("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 10px" } }, [
              el("div", { className: "field-row", style: { margin: "0" } }, [
                el("div", { className: "field-label", style: { width: "40px", textAlign: "left" } }, "Type:"),
                el("select", { id: "apm-c-type", className: "field-input", style: { height: "28px", padding: "0 4px" } }, [
                  el("option", { value: "" }, "- Ignore -"),
                  el("option", { value: "Breakdown" }, "Breakdown"),
                  el("option", { value: "Corrective" }, "Corrective"),
                  el("option", { value: "Project" }, "Project")
                ])
              ]),
              el("div", { className: "field-row", style: { margin: "0" } }, [
                el("div", { className: "field-label", style: { width: "40px", textAlign: "left" } }, "Status:"),
                el("select", { id: "apm-c-status", className: "field-input", style: { height: "28px", padding: "0 4px" } }, [
                  el("option", { value: "" }, "- Ignore -"),
                  el("option", { value: "Open" }, "Open"),
                  el("option", { value: "In Progress" }, "In Progress")
                ])
              ]),
              el("div", { className: "field-row", style: { margin: "0" } }, [
                el("div", { className: "field-label", style: { width: "40px", textAlign: "left" } }, "Exec:"),
                el("select", { id: "apm-c-exec", className: "field-input", style: { height: "28px", padding: "0 4px" } }, [
                  el("option", { value: "" }, "- Ignore -"),
                  el("option", { value: "EXDN" }, "EXDN - No Shutdown"),
                  el("option", { value: "EXDB" }, "EXDB - During Break"),
                  el("option", { value: "EXMW" }, "EXMW - Maint Window"),
                  el("option", { value: "EXOPS" }, "EXOPS - OPS Agreement"),
                  el("option", { value: "EXSHUT" }, "EXSHUT - Shutdown")
                ])
              ]),
              el("div", { className: "field-row", style: { margin: "0" } }, [
                el("div", { className: "field-label", style: { width: "40px", textAlign: "left" } }, "Safety:"),
                el("select", { id: "apm-c-safety", className: "field-input", style: { height: "28px", padding: "0 4px" } }, [
                  el("option", { value: "" }, "- Ignore -"),
                  el("option", { value: "No" }, "No"),
                  el("option", { value: "Yes" }, "Yes")
                ])
              ])
            ])
          ]),
          // ── Automated Checklists ──
          el("div", { className: "apm-checklist-box", style: { marginBottom: "8px" } }, [
            el("div", { className: "apm-checklist-title" }, "Automated Checklists"),
            el("div", { className: "apm-checklist-row" }, [
              el("div", { className: "field-label", title: "Select y/n to fill out during autofill", style: { width: "40px", textAlign: "left", color: "var(--apm-text-bright)" } }, "1-Tech:"),
              el("select", { id: "apm-c-loto-mode", className: "field-input", title: "Select y/n to fill out during autofill", style: { width: "115px", height: "28px", padding: "0 4px" } }, [
                el("option", { value: "none" }, "- Ignore -"),
                el("option", { value: "yes" }, "(Check YES)"),
                el("option", { value: "no" }, "(Check NO)")
              ]),
              el("div", { className: "field-label", title: "How many checkboxes to fill during autofill", style: { flexGrow: "1", textAlign: "right", color: "var(--apm-text-bright)", marginRight: "5px" } }, "10-Tech PM:"),
              el("input", { type: "number", id: "apm-c-pm-checks", className: "field-input", title: "How many checkboxes to fill during autofill", min: "0", placeholder: "0", onblur: (e) => {
                if (e.target.value === "") e.target.value = "0";
              }, style: { width: "55px", height: "28px", padding: "0 4px", textAlign: "center" } })
            ])
          ]),
          // ── Trouble Codes & Assignment ──
          el("div", { className: "apm-section-group" }, [
            el("div", { className: "apm-section-label" }, "Trouble Codes & Assignment"),
            el("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 10px" } }, [
              el("div", { className: "field-row", style: { margin: "0" } }, [
                el("div", { className: "field-label", style: { width: "50px", textAlign: "left" } }, "Problem:"),
                el("input", { type: "text", id: "apm-c-prob", className: "field-input upper" })
              ]),
              el("div", { className: "field-row", style: { margin: "0" } }, [
                el("div", { className: "field-label", style: { width: "40px", textAlign: "left" } }, "Failure:"),
                el("input", { type: "text", id: "apm-c-fail", className: "field-input upper" })
              ]),
              el("div", { className: "field-row", style: { margin: "0" } }, [
                el("div", { className: "field-label", style: { width: "50px", textAlign: "left" } }, "Cause:"),
                el("input", { type: "text", id: "apm-c-cause", className: "field-input upper" })
              ]),
              el("div", { className: "field-row", style: { margin: "0" } }, [
                el("div", { className: "field-label", style: { width: "40px", textAlign: "left" } }, "Assign:"),
                el("input", { type: "text", id: "apm-c-assign", className: "field-input upper" })
              ])
            ])
          ]),
          // ── Schedule & Labor ──
          el("div", { className: "apm-section-group" }, [
            el("div", { className: "apm-section-label" }, "Schedule & Labor"),
            el("div", { style: { display: "flex", gap: "6px", marginBottom: "4px" } }, [
              el("div", { className: "field-row", style: { flex: "1", margin: "0" } }, [
                el("div", { className: "field-label", style: { width: "35px", textAlign: "left" } }, "Start:"),
                el("input", { type: "date", id: "apm-c-start", className: "field-input", style: { height: "28px", padding: "0 4px" } })
              ]),
              el("div", { className: "field-row", style: { flex: "1", margin: "0" } }, [
                el("div", { className: "field-label", style: { width: "30px", textAlign: "left" } }, "End:"),
                el("input", { type: "date", id: "apm-c-end", className: "field-input", style: { height: "28px", padding: "0 4px" } })
              ])
            ]),
            el("div", { className: "field-row", style: { margin: "0" } }, [
              el("div", { className: "field-label", title: "Hours to book during autofill", style: { width: "65px", textAlign: "left", color: "var(--apm-success)", fontWeight: "bold" } }, "Book Labor:"),
              el("input", { type: "text", id: "apm-c-labor-hours", className: "field-input apm-field-accent", title: "Hours to book during autofill", placeholder: "0 hours", style: { height: "28px", padding: "0 8px", width: "80px", flexGrow: "0" } })
            ])
          ]),
          // ── Closing Comments ──
          el("div", { className: "field-row", style: { margin: "0", alignItems: "flex-start" } }, [
            el("div", { className: "field-label", style: { width: "65px", textAlign: "left", marginTop: "5px" } }, "Closing:"),
            el("textarea", { id: "apm-c-close", className: "field-input apm-textarea-input", placeholder: "Closing comments..." })
          ])
        ])
      ])
    ]);
  }
  function buildTabOrderTab() {
    return el("div", { id: "apm-settings-fields", style: { display: "none" }, className: "apm-panel-section" }, [
      el("div", { className: "apm-tab-content-scroll" }, [
        el("div", { className: "apm-ui-settings-toggles" }, [
          el("div", { id: "apm-s-tog-cols", className: "apm-ui-settings-btn active" }, "Grid Columns"),
          el("div", { id: "apm-s-tog-tabs", className: "apm-ui-settings-btn inactive" }, "Record Tabs")
        ]),
        el("div", { id: "apm-s-title", style: { color: "var(--apm-accent)", fontWeight: "bold", marginBottom: "5px" } }, "Visual Order:"),
        el("div", { style: { fontSize: "11px", color: "var(--apm-text-secondary)", marginBottom: "10px" } }, "Drag and drop to reorder. Syncs automatically."),
        el("div", { id: "apm-s-col-list", className: "apm-ui-settings-list" })
      ]),
      el("div", { className: "apm-tab-action-footer" }, [
        el("button", { id: "apm-s-btn-reset", className: "apm-ui-settings-reset" }, "Reset to Default")
      ])
    ]);
  }
  function buildColorCodeTab() {
    return el("div", { id: "apm-colorcode-fields", style: { display: "none", paddingBottom: "5px" }, className: "apm-panel-section" }, [
      el("div", { className: "apm-tab-content-scroll" }, [
        el("div", { className: "apm-cc-search-box", style: { background: "var(--apm-surface-sunken)", padding: "12px", borderRadius: "6px", border: "1px solid var(--apm-border)", marginBottom: "15px" } }, [
          el("div", { style: { display: "flex", gap: "10px", marginBottom: "12px" } }, [
            el("div", { style: { flex: "1" } }, [
              el("div", { style: { fontSize: "11px", color: "var(--apm-text-muted)", marginBottom: "4px", fontWeight: "bold" } }, "Keyword (Search)"),
              el("input", { type: "text", id: "cc-search", className: "field-input", placeholder: "Match multiple keywords separated by, comma,", style: { height: "28px", fontSize: "12px", width: "100%", boxSizing: "border-box", textTransform: "none" } })
            ]),
            el("div", { style: { width: "50px" } }, [
              el("div", { style: { fontSize: "11px", color: "var(--apm-text-muted)", marginBottom: "4px", fontWeight: "bold", textAlign: "center" } }, "Color"),
              el("input", { type: "color", id: "cc-color", value: "#e74c3c", tabIndex: -1, style: { width: "100%", height: "28px", padding: "0", border: "1px solid var(--apm-border)", borderRadius: "4px", cursor: "pointer", background: "none" } })
            ])
          ]),
          el("div", { style: { display: "flex", gap: "10px", alignItems: "flex-end", marginBottom: "15px" } }, [
            el("div", { style: { flex: "1" } }, [
              el("div", { style: { fontSize: "11px", color: "var(--apm-text-muted)", marginBottom: "4px", fontWeight: "bold" } }, "Badge Text (Nametag)"),
              el("textarea", { id: "cc-tag", className: "field-input", rows: 1, placeholder: "Press Enter for new line", style: { fontSize: "12px", width: "100%", boxSizing: "border-box", textTransform: "none", resize: "none", overflow: "hidden", minHeight: "28px", maxHeight: "72px", lineHeight: "18px", padding: "4px 6px", fontFamily: "inherit" } })
            ])
          ]),
          el("div", { style: { display: "flex", gap: "8px", width: "100%", marginBottom: "15px" } }, [
            el("button", { id: "cc-btn-fill", className: "apm-cc-style-btn active", title: "Fill Row Background", style: { flex: "1", height: "28px", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--apm-accent)", borderRadius: "4px", background: "var(--apm-accent-subtle)", cursor: "pointer", color: "var(--apm-accent)", transition: "all 0.15s", fontSize: "11px", fontWeight: "bold" } }, "Fill Row"),
            el("button", { id: "cc-btn-tag", className: "apm-cc-style-btn active", title: "Show Nametag", style: { flex: "1", height: "28px", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--apm-accent)", borderRadius: "4px", background: "var(--apm-accent-subtle)", cursor: "pointer", color: "var(--apm-accent)", transition: "all 0.15s", fontSize: "11px", fontWeight: "bold" } }, "Name Tag")
          ]),
          el("div", { style: { display: "flex", gap: "8px", flex: "1", justifyContent: "space-between", alignItems: "center" } }, [
            el("div", { style: { fontSize: "11px", color: "var(--apm-success)", fontStyle: "italic" } }, "\u2713 Live preview on grid"),
            el("div", { style: { display: "flex", gap: "8px" } }, [
              el("button", { id: "cc-add-btn", style: { flex: "1", maxWidth: "120px", background: "var(--apm-accent)", color: "white", border: "none", borderRadius: "4px", height: "28px", cursor: "pointer", fontWeight: "bold", fontSize: "12px", transition: "background 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" } }, [
                el("span", {}, "\u{1F4BE}"),
                el("span", { id: "cc-add-btn-text" }, "Save Rule")
              ]),
              el("button", { id: "cc-cancel-btn", style: { display: "inline-block", background: "var(--apm-text-disabled)", color: "white", border: "none", borderRadius: "4px", height: "28px", padding: "0 12px", cursor: "pointer", fontWeight: "bold", fontSize: "12px", marginLeft: "8px" } }, "Cancel")
            ])
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
      ])
    ]);
  }
  function buildGeneralTab() {
    const flagItems = FeatureFlags.getAll().map((flag) => {
      return el("div", { className: "apm-general-item" }, [
        el("div", { style: { flex: "1" } }, [
          el("div", { className: "apm-general-title", style: { fontSize: "12px" } }, flag.label),
          el("div", { className: "apm-general-desc", style: { fontSize: "10px" } }, flag.description)
        ]),
        el("label", { className: "cc-toggle-switch" }, [
          el("input", {
            type: "checkbox",
            checked: flag.value,
            onchange: (e) => FeatureFlags.set(flag.id, e.target.checked)
          }),
          el("span", { className: "cc-toggle-slider" })
        ])
      ]);
    });
    return el("div", { id: "apm-general-fields", style: { display: "none" }, className: "apm-panel-section" }, [
      el("div", { className: "apm-tab-content-scroll" }, [
        // ── Quick Settings (pinned top) ──
        el("div", { className: "apm-section-group", style: { marginBottom: "12px", borderColor: "var(--apm-accent)" } }, [
          el("div", { className: "apm-section-label", style: { color: "var(--apm-accent)" } }, "Quick Settings"),
          el("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 12px", marginBottom: "8px" } }, [
            el("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" } }, [
              el("span", { style: { fontSize: "var(--apm-text-sm)", color: "var(--apm-text-bright)", fontWeight: "600" } }, "Theme"),
              el("select", { id: "cc-setting-theme", className: "apm-cc-theme-select", style: { width: "110px" } }, [
                el("option", { value: "default" }, "System Default"),
                el("option", { value: "theme-hex-dark" }, "Dark Hex"),
                el("option", { value: "theme-dark" }, "Dark Classic"),
                el("option", { value: "theme-darkblue" }, "Dark Blue"),
                el("option", { value: "theme-hex" }, "Light Hex"),
                el("option", { value: "theme-orange" }, "Orange")
              ])
            ]),
            el("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" } }, [
              el("span", { style: { fontSize: "var(--apm-text-sm)", color: "var(--apm-text-bright)", fontWeight: "600" } }, "Update Track"),
              el("select", { id: "gen-setting-update-track", className: "apm-cc-theme-select", style: { width: "110px" } }, [
                el("option", { value: "stable" }, "Stable"),
                el("option", { value: "beta" }, "Beta / vNext")
              ])
            ])
          ]),
          el("div", { style: { display: "flex", gap: "6px", flexWrap: "wrap" } }, [
            el("button", { id: "apm-btn-check-updates", className: "apm-footer-help-btn-box", style: { flex: "1", padding: "5px 10px", fontSize: "var(--apm-text-xs)", minWidth: "0" } }, "Check Updates")
          ])
        ]),
        // ── Full System Backup ──
        el("div", { className: "apm-section-group", style: { marginBottom: "12px", borderColor: "var(--apm-border)" } }, [
          el("div", { className: "apm-section-label", style: { color: "var(--apm-accent)" } }, "Full System Backup"),
          el("div", { style: { fontSize: "var(--apm-text-xs)", color: "var(--apm-text-muted)", marginBottom: "8px" } }, "Export or import all APM settings, ColorCode rules, AutoFill profiles, dataspys, and preferences."),
          el("div", { style: { display: "flex", gap: "6px", flexWrap: "wrap" } }, [
            el("button", { id: "apm-btn-export-settings", className: "apm-footer-help-btn-box", title: "Download a full backup of all APM data as JSON", style: { flex: "1", padding: "5px 10px", fontSize: "var(--apm-text-xs)", minWidth: "0" } }, "Export All"),
            el("button", { id: "apm-btn-import-settings", className: "apm-footer-help-btn-box", title: "Restore from a full APM backup file", style: { flex: "1", padding: "5px 10px", fontSize: "var(--apm-text-xs)", minWidth: "0" } }, "Import All"),
            el("button", { id: "apm-btn-copy-b64", className: "apm-footer-help-btn-box", title: "Copy full backup as Base64 to clipboard", style: { flex: "1", padding: "5px 10px", fontSize: "var(--apm-text-xs)", minWidth: "0" } }, "Copy B64")
          ]),
          el("div", { id: "apm-import-panel", style: { display: "none", marginTop: "8px", padding: "10px", border: "1px solid var(--apm-border)", borderRadius: "4px", background: "var(--apm-surface-inset)" } }, [
            el("div", { style: { marginBottom: "8px" } }, [
              el("div", { style: { fontSize: "11px", color: "var(--apm-text-muted)", marginBottom: "4px", fontWeight: "bold" } }, "Import from File or Paste:"),
              el("input", { type: "file", id: "apm-import-file-input", accept: ".json", style: { display: "none" } }),
              el("button", { id: "apm-import-file-btn", className: "apm-footer-help-btn-box", style: { width: "100%", marginBottom: "6px", padding: "5px 10px", fontSize: "var(--apm-text-xs)" } }, "\u{1F4C1} Select JSON File")
            ]),
            el("div", { style: { display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" } }, [
              el("div", { style: { flex: "1", height: "1px", background: "var(--apm-border)" } }),
              el("span", { style: { color: "var(--apm-text-disabled)", fontSize: "10px" } }, "OR"),
              el("div", { style: { flex: "1", height: "1px", background: "var(--apm-border)" } })
            ]),
            el("div", { style: { marginBottom: "6px" } }, [
              el("textarea", { id: "apm-import-paste-input", style: { width: "100%", height: "60px", fontSize: "var(--apm-text-sm)", fontFamily: "var(--apm-font-mono)", padding: "6px", border: "1px solid var(--apm-border)", borderRadius: "var(--apm-radius-sm)", background: "var(--apm-surface-sunken)", color: "var(--apm-text-bright)", boxSizing: "border-box", resize: "vertical" }, placeholder: "Paste backup (JSON or Base64) here, then Ctrl+Enter..." })
            ]),
            el("div", { style: { fontSize: "10px", color: "var(--apm-text-disabled)", marginTop: "4px" } }, "Press Ctrl+Enter to import pasted data")
          ])
        ]),
        // ── Feature Modules ──
        el("div", { className: "apm-settings-section", style: { borderBottom: "1px solid var(--apm-border)", paddingBottom: "12px", marginBottom: "12px" } }, [
          el("div", { className: "apm-section-label", style: { color: "var(--apm-accent)", marginBottom: "8px" } }, "Feature Modules"),
          ...flagItems
        ]),
        // ── Preferences ──
        el("div", { className: "apm-settings-section", style: { paddingBottom: "12px", marginBottom: "12px" } }, [
          el("div", { className: "apm-section-label", style: { marginBottom: "8px" } }, "Preferences"),
          el("div", { className: "apm-general-item" }, [
            el("div", {}, [
              el("div", { id: "gen-setting-links-title", className: "apm-general-title" }, apmGeneralSettings.openLinksInNewTab ? "Open WOs in New Tab" : "Open WOs in Current Tab"),
              el("div", { className: "apm-general-desc" }, "Linkified WO numbers open in a new window vs current")
            ]),
            el("label", { className: "cc-toggle-switch" }, [
              el("input", { type: "checkbox", id: "gen-setting-links", checked: !!apmGeneralSettings.openLinksInNewTab }),
              el("span", { className: "cc-toggle-slider" })
            ])
          ]),
          el("div", { className: "apm-general-item" }, [
            el("div", {}, [
              el("div", { className: "apm-general-title" }, "PTP Status Icons"),
              el("div", { className: "apm-general-desc" }, "Show assessment history icons in grid/record views")
            ]),
            el("label", { className: "cc-toggle-switch" }, [
              el("input", { type: "checkbox", id: "gen-setting-ptp-ui", checked: !!apmGeneralSettings.ptpTrackingEnabled }),
              el("span", { className: "cc-toggle-slider" })
            ])
          ]),
          el("div", { className: "apm-general-item" }, [
            el("div", {}, [
              el("div", { className: "apm-general-title" }, "Auto-Redirect"),
              el("div", { className: "apm-general-desc" }, "Return to APM Home if session expires")
            ]),
            el("label", { className: "cc-toggle-switch" }, [
              el("input", { type: "checkbox", id: "gen-setting-redirect", checked: !!apmGeneralSettings.autoRedirect }),
              el("span", { className: "cc-toggle-slider" })
            ])
          ])
        ]),
        // ── Regional ──
        el("div", { className: "apm-settings-section", style: { borderTop: "1px solid var(--apm-border)", paddingTop: "12px", paddingBottom: "12px", marginBottom: "12px" } }, [
          el("div", { className: "apm-section-label", style: { color: "var(--apm-success)", marginBottom: "8px" } }, "Regional"),
          el("div", { className: "apm-general-item" }, [
            el("div", {}, [
              el("div", { className: "apm-general-title" }, "Date Format"),
              el("div", { className: "apm-general-desc" }, "The format your EAM expects for date inputs")
            ]),
            el("select", { id: "gen-setting-date-fmt", className: "apm-cc-theme-select", style: { width: "120px" } }, [
              el("option", { value: "us" }, "MM/DD/YYYY"),
              el("option", { value: "eu" }, "DD/MM/YYYY"),
              el("option", { value: "mon" }, "DD-MON-YYYY")
            ])
          ]),
          el("div", { className: "apm-general-item" }, [
            el("div", {}, [
              el("div", { className: "apm-general-title" }, "Separator"),
              el("div", { className: "apm-general-desc" }, "Character between date parts (/ or -)")
            ]),
            el("select", { id: "gen-setting-date-sep", className: "apm-cc-theme-select", style: { width: "120px" } }, [
              el("option", { value: "/" }, "/ (Slash)"),
              el("option", { value: "-" }, "- (Dash)")
            ])
          ]),
          el("div", { className: "apm-general-item" }, [
            el("div", {}, [
              el("div", { className: "apm-general-title" }, "Date Override"),
              el("div", { className: "apm-general-desc" }, "Force standard parsing (disable if causing errors)")
            ]),
            el("label", { className: "cc-toggle-switch" }, [
              el("input", { type: "checkbox", id: "gen-setting-date-over", checked: !!apmGeneralSettings.dateOverrideEnabled }),
              el("span", { className: "cc-toggle-slider" })
            ])
          ])
        ]),
        // ── Advanced ──
        el("div", { className: "apm-settings-section", style: { borderTop: "1px solid var(--apm-border)", paddingTop: "12px" } }, [
          el("div", { className: "apm-section-label", style: { marginBottom: "8px" } }, "Advanced"),
          el("div", { className: "apm-general-item" }, [
            el("div", { style: { flex: "1" } }, [
              el("div", { className: "apm-general-title" }, "Diagnostic Logging"),
              el("div", { className: "apm-general-desc" }, "Console verbosity level")
            ]),
            el("select", { id: "gen-setting-log-level", className: "apm-cc-theme-select", style: { width: "120px" } }, [
              el("option", { value: "error" }, "Error Only"),
              el("option", { value: "warn" }, "Warning"),
              el("option", { value: "info" }, "Info"),
              el("option", { value: "debug" }, "Debug"),
              el("option", { value: "verbose" }, "Verbose")
            ])
          ]),
          el("div", { id: "apm-import-status", style: { fontSize: "var(--apm-text-xs)", color: "var(--apm-text-muted)", marginTop: "6px", minHeight: "16px" } })
        ]),
        // ── Danger Zone ──
        el("div", { className: "apm-settings-section", style: { borderTop: "1px solid var(--apm-danger)", padding: "12px 0", marginTop: "10px" } }, [
          el("div", { className: "apm-section-label", style: { color: "var(--apm-danger)", marginBottom: "6px" } }, "Danger Zone"),
          el("div", { className: "apm-general-desc", style: { marginBottom: "10px" } }, "Permanently erase all APM Master data. This cannot be undone \u2014 back up first!"),
          el("button", { id: "apm-btn-wipe-all", className: "apm-footer-help-btn-box", style: { width: "auto", padding: "6px 14px", fontSize: "var(--apm-text-sm)", background: "var(--apm-danger)", color: "white", border: "none", fontWeight: "bold" } }, "Wipe All Saved Data")
        ])
      ])
    ]);
  }
  function buildDiagnosticsTab() {
    return el("div", { id: "apm-diagnostics-fields", style: { display: "none" }, className: "apm-panel-section" }, [
      el("div", { className: "apm-tab-content-scroll" }, [
        el("div", { className: "apm-diagnostics-header", style: { display: "flex", justifyContent: "space-between", marginBottom: "10px" } }, [
          el("span", { style: { color: "var(--apm-success)", fontWeight: "600", fontSize: "var(--apm-text-base)" } }, "Runtime Telemetry"),
          el("button", { id: "diag-btn-copy", className: "apm-footer-help-btn-box", style: { padding: "4px 10px", fontSize: "var(--apm-text-xs)", width: "auto" } }, "\u{1F4CB} Copy Report")
        ]),
        el("div", { id: "diag-content" }, [
          el("div", { style: { color: "var(--apm-text-muted)", fontSize: "var(--apm-text-sm)", textAlign: "center", marginTop: "50px" } }, "Loading statistics...")
        ])
      ])
    ]);
  }
  function createFooter() {
    return el("div", { className: "apm-footer" }, [
      el("div", { id: "cc-footer-btns", style: { display: "none", flexDirection: "column", gap: "8px", marginBottom: "10px", padding: "0" } }, [
        el("div", { style: { display: "flex", gap: "6px", width: "100%", boxSizing: "border-box" } }, [
          el("button", { id: "cc-export-btn", className: "cc-footer-btn", style: { flex: "1", minWidth: "0", overflow: "hidden", textOverflow: "ellipsis" }, title: "Copy Base64 to clipboard (Shift+click to download JSON)" }, "\u{1F4E4} Copy Rules (Base64)"),
          el("button", { id: "cc-export-download-btn", className: "cc-footer-btn", style: { flex: "1", minWidth: "0", overflow: "hidden", textOverflow: "ellipsis" }, title: "Download rules as JSON file" }, "\u{1F4BE} Download (.JSON)"),
          el("button", { id: "cc-import-btn", className: "cc-footer-btn", style: { flex: "1", minWidth: "0", overflow: "hidden", textOverflow: "ellipsis" }, title: "Toggle import panel" }, "\u{1F4E5} Import Rules")
        ]),
        el("div", { id: "cc-import-panel", style: { display: "none", marginTop: "8px", padding: "10px", border: "1px solid var(--apm-border)", borderRadius: "4px", background: "var(--apm-surface-inset)" } }, [
          el("div", { style: { marginBottom: "8px" } }, [
            el("div", { style: { fontSize: "11px", color: "var(--apm-text-muted)", marginBottom: "4px", fontWeight: "bold" } }, "Import from File or Paste (supports BetterAPM backups):"),
            el("input", { type: "file", id: "cc-import-file-input", style: { display: "none" }, accept: ".json,application/json" }),
            el("button", { id: "cc-import-file-btn", className: "cc-footer-btn", style: { width: "100%", marginBottom: "6px" } }, "\u{1F4C1} Select JSON File")
          ]),
          el("div", { style: { display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" } }, [
            el("div", { style: { flex: "1", height: "1px", background: "var(--apm-border)" } }),
            el("span", { style: { color: "var(--apm-text-disabled)", fontSize: "10px" } }, "OR"),
            el("div", { style: { flex: "1", height: "1px", background: "var(--apm-border)" } })
          ]),
          el("div", { style: { marginBottom: "6px" } }, [
            el("textarea", { id: "cc-import-textarea", style: { width: "100%", height: "80px", padding: "6px", fontSize: "11px", fontFamily: "monospace", border: "1px solid var(--apm-border)", borderRadius: "4px", background: "var(--apm-surface-sunken)", color: "var(--apm-text-bright)", resize: "vertical", boxSizing: "border-box" }, placeholder: "Paste Base64 (APM:...), JSON array, or BetterAPM backup here\\nCtrl+Enter to import" })
          ]),
          el("div", { style: { fontSize: "10px", color: "var(--apm-text-disabled)", marginTop: "4px" } }, "Press Ctrl+Enter to import pasted data")
        ])
      ]),
      el("div", { id: "apm-settings-update-container", style: { display: "none", marginBottom: "8px" } }, [
        el("a", { id: "apm-footer-update-link", href: UPDATE_URL, target: "_blank", className: "apm-footer-update-btn" }, "\u2728 Update Available")
      ]),
      el("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", padding: "0 8px" } }, [
        el("a", { href: "https://github.com/jaker788-create/APM-Master/issues", target: "_blank", className: "apm-footer-bug-link", style: { flex: "1", color: "var(--apm-accent)", fontSize: "11px", textDecoration: "none", fontWeight: "bold", textAlign: "left" } }, "\u{1F41B} Bug Report"),
        el("div", { style: { flex: "1", display: "flex", justifyContent: "center" } }, [
          el("button", { id: "apm-c-btn-help", className: "apm-footer-help-btn-box", style: { padding: "6px 14px", fontSize: "12px", minWidth: "80px" } }, "\u2139\uFE0F Help & Tips")
        ]),
        el("span", { id: "apm-v-changelog", style: { flex: "1", color: "var(--apm-success)", fontSize: "11px", textAlign: "right", paddingRight: "5px", cursor: "pointer", fontWeight: "bold", textDecoration: "underline", textDecorationStyle: "dotted", textUnderlineOffset: "3px" } }, `v${CURRENT_VERSION} \u2014 What's New`)
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
      diagnosticsFields,
      footer
    } = state;
    const selectEl = document.getElementById("apm-c-preset-select");
    const tabAutofill = document.getElementById("tab-autofill");
    const tabSettings = document.getElementById("tab-settings");
    const tabColorcode = document.getElementById("tab-colorcode");
    const tabGeneral = document.getElementById("tab-general");
    const tabDiagnostics = document.getElementById("tab-diagnostics");
    const togCols = document.getElementById("apm-s-tog-cols");
    const togTabs = document.getElementById("apm-s-tog-tabs");
    const colListContainer = document.getElementById("apm-s-col-list");
    function downloadSettings(jsonData) {
      const blob = new Blob([jsonData], { type: "application/json" });
      const url2 = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url2;
      link.download = `apm-master-settings-${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url2);
      showToast("Settings downloaded!", "var(--apm-success)");
    }
    const resetTabs = () => {
      [tabAutofill, tabSettings, tabColorcode, tabGeneral, tabDiagnostics].forEach((t) => {
        t.className = "apm-tab-btn apm-tab-inactive";
      });
      document.getElementById("apm-tab-container").style.display = "flex";
      const ccFooterTools = document.getElementById("cc-footer-btns");
      if (ccFooterTools) ccFooterTools.style.display = "none";
      APMScheduler.removeTask("diag-ui-poll");
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
    const loadSettingsView = (explicitMode) => {
      if (!explicitMode) {
        const tpResult = findMainTabPanel();
        let hasRecordTabs = false;
        if (tpResult && isFrameVisible(tpResult.win)) {
          const hdrTab = tpResult.tabPanel.items?.items?.find((t) => t.itemId === "HDR");
          hasRecordTabs = hdrTab && hdrTab.rendered && !!hdrTab.getEl?.()?.dom?.innerHTML?.trim();
        }
        state.settingsMode = hasRecordTabs ? "tabs" : "cols";
      }
      const resetBtn = document.getElementById("apm-s-btn-reset");
      const titleEl = document.getElementById("apm-s-title");
      const screenLabel = detectScreenFunction() || "Unknown";
      let hintEl = document.getElementById("apm-s-width-hint");
      if (state.settingsMode === "cols") {
        togCols.className = "apm-ui-settings-btn active";
        togTabs.className = "apm-ui-settings-btn inactive";
        if (resetBtn) resetBtn.style.display = "block";
        if (titleEl) titleEl.textContent = `Column Order (${screenLabel}):`;
        if (!hintEl && titleEl) {
          hintEl = document.createElement("div");
          hintEl.id = "apm-s-width-hint";
          hintEl.style.cssText = "font-size:11px;color:var(--apm-text-muted);margin:2px 0 6px 0;";
          hintEl.textContent = "Tip: Column widths are saved automatically when you resize them in the grid.";
          titleEl.parentNode.insertBefore(hintEl, titleEl.nextSibling);
        }
        if (hintEl) hintEl.style.display = "block";
      } else {
        togTabs.className = "apm-ui-settings-btn active";
        togCols.className = "apm-ui-settings-btn inactive";
        if (resetBtn) resetBtn.style.display = "block";
        if (titleEl) titleEl.textContent = `Tab Layout (${screenLabel}):`;
        if (hintEl) hintEl.style.display = "none";
      }
      performAutoFetch();
    };
    function initColorCodeAndRegionalSettings() {
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
    }
    function bindPanelKeyboardTrap() {
      panel.addEventListener("keydown", (e) => {
        const tag = e.target.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") {
          e.stopPropagation();
        }
      }, true);
    }
    function bindCloseButton() {
      watchSettingsPanelClose();
    }
    function bindGeneralSettings() {
      try {
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
          if (typeof invalidateColorCodeCache === "function") invalidateColorCodeCache();
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
          const checkBtn2 = document.getElementById("apm-btn-check-updates");
          const updateInfo = APMApi.get("updateInfo");
          if (updateInfo?.available) {
            if (updateContainer) updateContainer.style.display = "block";
            if (checkBtn2) checkBtn2.style.display = "none";
            const updateLink = document.getElementById("apm-footer-update-link");
            if (updateLink && updateInfo?.url) {
              if (updateInfo?.url?.startsWith("https://")) {
                try {
                  const updateHost = new URL(updateInfo.url).hostname;
                  if (!updateHost.endsWith("github.com") && !updateHost.endsWith("githubusercontent.com") && !updateHost.endsWith("greasyfork.org")) updateLink.href = "#";
                  else {
                    updateLink.href = updateInfo.url;
                    updateLink.onclick = (e) => {
                      e.preventDefault();
                      window.open(updateInfo.url, "_blank");
                    };
                  }
                } catch (_) {
                  updateLink.href = "#";
                }
              }
              if (updateInfo?.version) {
                updateLink.textContent = `\u2728 Update to v${updateInfo?.version} Available`;
              }
            }
          } else {
            if (updateContainer) updateContainer.style.display = "none";
            if (checkBtn2) checkBtn2.style.display = "inline-block";
          }
        });
        const checkBtn = document.getElementById("apm-btn-check-updates");
        if (checkBtn) {
          checkBtn.onclick = () => {
            checkBtn.textContent = "Checking...";
            checkBtn.disabled = true;
            checkForGlobalUpdates(true, (hasUpdate) => {
              if (hasUpdate) {
                return;
              }
              checkBtn.textContent = "Up to Date";
              setTimeout(() => {
                if (checkBtn) {
                  checkBtn.textContent = "Check for Updates";
                  checkBtn.disabled = false;
                }
              }, 3e3);
            });
          };
        }
      } catch (e) {
        APMLogger.error("Settings", "Error binding general settings listeners:", e);
      }
    }
    function bindImportExport() {
      try {
        const exportBtn = document.getElementById("apm-btn-export-settings");
        if (exportBtn) {
          exportBtn.onclick = () => {
            try {
              const jsonData = exportSettings();
              downloadSettings(jsonData);
            } catch (e) {
              APMLogger.error("Settings", "Error exporting settings:", e);
              showToast("Error exporting settings", "var(--apm-danger)");
            }
          };
        }
        const copyB64Btn = document.getElementById("apm-btn-copy-b64");
        if (copyB64Btn) {
          copyB64Btn.onclick = () => {
            try {
              const jsonData = exportSettings();
              const b64Data = encodeSettingsAsBase64(jsonData);
              if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(b64Data).then(() => {
                  showToast("Base64 backup copied to clipboard!", "var(--apm-success)");
                  copyB64Btn.textContent = "\u2713 Copied!";
                  setTimeout(() => {
                    if (copyB64Btn) copyB64Btn.textContent = "\u{1F4CB} Copy To Clipboard (Base64)";
                  }, 2e3);
                }).catch(() => {
                  showToast("Error copying to clipboard", "var(--apm-danger)");
                });
              } else {
                showToast("Clipboard not available in this browser", "var(--apm-danger)");
              }
            } catch (e) {
              APMLogger.error("Settings", "Error encoding settings:", e);
              showToast("Error preparing safe format", "var(--apm-danger)");
            }
          };
        }
        const importBtn = document.getElementById("apm-btn-import-settings");
        const importFileInput = document.getElementById("apm-import-file-input");
        const importPasteInput = document.getElementById("apm-import-paste-input");
        const importPanel = document.getElementById("apm-import-panel");
        const importFileBtn = document.getElementById("apm-import-file-btn");
        if (importBtn && importFileInput && importPasteInput) {
          let showImportDialog = function(content) {
            return new Promise((resolve) => {
              const checkboxes = [];
              const moduleRows = IMPORT_MODULES.map((mod) => {
                const cb = el("input", { type: "checkbox", checked: true, id: `import-mod-${mod.id}`, style: { accentColor: "var(--apm-accent)", cursor: "pointer", width: "14px", height: "14px", margin: "0" } });
                checkboxes.push({ cb, mod });
                return el("label", { htmlFor: `import-mod-${mod.id}`, style: { display: "flex", alignItems: "center", gap: "8px", padding: "6px 8px", borderRadius: "var(--apm-radius-sm)", cursor: "pointer", transition: "background 0.15s", fontSize: "12px", color: "var(--apm-text-bright)" } }, [
                  cb,
                  el("span", {}, mod.label)
                ]);
              });
              const setAll = (val) => checkboxes.forEach(({ cb }) => {
                cb.checked = val;
              });
              const overlay = el("div", { className: "apm-modal-overlay", style: { zIndex: "2147483647" } }, [
                el("div", { className: "apm-modal-content", style: { width: "400px", maxWidth: "90vw" } }, [
                  el("div", { className: "apm-modal-header" }, [
                    el("span", { style: { fontWeight: "600", fontSize: "14px", color: "var(--apm-text-bright)" } }, "Import Settings")
                  ]),
                  el("div", { className: "apm-modal-body", style: { padding: "14px 18px" } }, [
                    el(
                      "p",
                      { style: { fontSize: "11px", color: "var(--apm-text-muted)", margin: "0 0 12px", lineHeight: "1.5" } },
                      "Select which modules to import. Imported data will overwrite existing settings for the selected modules."
                    ),
                    el("div", { style: { display: "flex", gap: "8px", marginBottom: "10px" } }, [
                      el("button", {
                        className: "apm-modal-btn-pill",
                        onclick: () => setAll(true)
                      }, "Select All"),
                      el("button", {
                        className: "apm-modal-btn-pill",
                        onclick: () => setAll(false)
                      }, "Select None")
                    ]),
                    el("div", { style: { display: "flex", flexDirection: "column", gap: "2px", background: "var(--apm-surface-inset)", borderRadius: "var(--apm-radius)", padding: "6px", border: "1px solid var(--apm-border)" } }, moduleRows)
                  ]),
                  el("div", { className: "apm-modal-footer", style: { display: "flex", gap: "8px", justifyContent: "flex-end" } }, [
                    el("button", {
                      className: "apm-modal-btn apm-modal-btn-ghost",
                      onclick: () => {
                        overlay.remove();
                        resolve(false);
                      }
                    }, "Cancel"),
                    el("button", {
                      className: "apm-modal-btn apm-modal-btn-accent",
                      onclick: () => {
                        const selectedKeys = /* @__PURE__ */ new Set();
                        checkboxes.forEach(({ cb, mod }) => {
                          if (cb.checked) mod.keys.forEach((k) => selectedKeys.add(k));
                        });
                        if (selectedKeys.size === 0) {
                          showToast("No modules selected", "var(--apm-warning)");
                          return;
                        }
                        overlay.remove();
                        try {
                          const result = importSettings(content, { onlyKeys: [...selectedKeys] });
                          if (result.ok) {
                            const count = checkboxes.filter(({ cb }) => cb.checked).length;
                            showToast(`Imported ${count} module${count !== 1 ? "s" : ""} from backup`, "var(--apm-success)");
                            APMLogger.info("Settings", `Selective import: ${count} modules`);
                            importPasteInput.value = "";
                            importPasteInput.style.borderColor = "var(--apm-border)";
                            setTimeout(() => location.reload(), 1500);
                          } else {
                            const errorMsg = result.errors.length > 0 ? result.errors.slice(0, 3).join("; ") : "Import failed";
                            showToast(errorMsg, "var(--apm-danger)");
                            APMLogger.error("Settings", "Import errors:", result.errors);
                          }
                        } catch (e) {
                          APMLogger.error("Settings", "Error during import:", e);
                          showToast("Error processing import data", "var(--apm-danger)");
                        }
                        resolve(true);
                      }
                    }, "Import Selected")
                  ])
                ])
              ]);
              document.body.appendChild(overlay);
            });
          };
          const processImport = (content) => {
            showImportDialog(content);
          };
          const performPasteImport = () => {
            const content = importPasteInput.value.trim();
            if (!content) {
              showToast("Please paste backup data first", "var(--apm-warning)");
              return;
            }
            processImport(content);
          };
          importBtn.onclick = () => {
            if (importPanel) {
              const visible = importPanel.style.display !== "none";
              importPanel.style.display = visible ? "none" : "block";
              if (!visible) importPasteInput.focus();
            }
          };
          if (importFileBtn) {
            importFileBtn.onclick = () => importFileInput.click();
          }
          importFileInput.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (evt) => {
              try {
                const content = evt.target.result;
                processImport(content);
              } catch (e2) {
                APMLogger.error("Settings", "Error importing settings:", e2);
                showToast("Error reading import file", "var(--apm-danger)");
              }
            };
            reader.readAsText(file);
            importFileInput.value = "";
          };
          importPasteInput.addEventListener("keydown", (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
              e.preventDefault();
              performPasteImport();
            }
          });
          importPasteInput.addEventListener("input", () => {
            if (importPasteInput.value.trim()) {
              importPasteInput.style.borderColor = "var(--apm-accent)";
            } else {
              importPasteInput.style.borderColor = "var(--apm-border)";
            }
          });
        }
        const wipeBtn = document.getElementById("apm-btn-wipe-all");
        if (wipeBtn) {
          wipeBtn.onclick = () => {
            if (!confirm("\u26A0\uFE0F This will permanently delete ALL APM Master settings, templates, tab orders, color code rules, and labor data.\n\nMake sure you have a backup first!\n\nContinue?")) return;
            if (!confirm("Are you absolutely sure? This cannot be undone.")) return;
            try {
              const keys = APMStorage.list();
              let count = 0;
              keys.forEach((key) => {
                APMStorage.remove(key);
                count++;
              });
              const localKeys = Object.keys(localStorage).filter((k) => k.startsWith("apm") || k.startsWith("Apm") || k.startsWith("APM"));
              localKeys.forEach((k) => localStorage.removeItem(k));
              count += localKeys.length;
              const baseDomain = window.location.hostname.split(".").slice(-2).join(".");
              const cookieNames = ["apm_theme_hint", "apm_gen_settings", "apm_transition_active"];
              cookieNames.forEach((name) => {
                document.cookie = `${name}=; path=/; domain=.${baseDomain}; max-age=0; SameSite=Lax`;
                document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
              });
              const csMeta = document.querySelector('meta[name="color-scheme"]');
              if (csMeta) csMeta.remove();
              APMLogger.info("Settings", `Wiped ${count} storage entries + ${cookieNames.length} cookies.`);
              showToast(`All data wiped (${count} entries). Reloading...`, "var(--apm-danger)");
              setTimeout(() => location.reload(), 1500);
            } catch (e) {
              APMLogger.error("Settings", "Error wiping data:", e);
              showToast("Error wiping data \u2014 check console", "var(--apm-danger)");
            }
          };
        }
      } catch (e) {
        APMLogger.error("Settings", "Error binding import/export listeners:", e);
      }
    }
    function bindTabSwitching() {
      const showTab = (target) => {
        [autofillFields, tabOrderFields, colorcodeFields, generalFields, diagnosticsFields].forEach((t) => t.style.display = "none");
        target.style.display = "flex";
      };
      togCols.onclick = () => {
        state.settingsMode = "cols";
        loadSettingsView("cols");
      };
      togTabs.onclick = () => {
        state.settingsMode = "tabs";
        invalidateTabCache();
        loadSettingsView("tabs");
      };
      tabAutofill.onclick = () => {
        state.activeTab = "autofill";
        resetTabs();
        tabAutofill.className = "apm-tab-btn apm-tab-active-autofill";
        showTab(autofillFields);
        renderPresetOptions(selectEl);
      };
      tabSettings.onclick = () => {
        state.activeTab = "settings";
        resetTabs();
        tabSettings.className = "apm-tab-btn apm-tab-active-autofill";
        showTab(tabOrderFields);
        loadSettingsView();
      };
      tabColorcode.onclick = () => {
        state.activeTab = "colorcode";
        resetTabs();
        tabColorcode.className = "apm-tab-btn apm-tab-active-autofill";
        showTab(colorcodeFields);
        const ccFooterTools = document.getElementById("cc-footer-btns");
        if (ccFooterTools) ccFooterTools.style.display = "flex";
      };
      tabGeneral.onclick = () => {
        state.activeTab = "general";
        resetTabs();
        tabGeneral.className = "apm-tab-btn apm-tab-active-autofill";
        showTab(generalFields);
      };
      tabDiagnostics.onclick = () => {
        state.activeTab = "diagnostics";
        resetTabs();
        tabDiagnostics.className = "apm-tab-btn apm-tab-active-autofill";
        showTab(diagnosticsFields);
        refreshDiagnosticsUI();
        APMScheduler.registerTask("diag-ui-poll", 5e3, refreshDiagnosticsUI);
      };
    }
    function bindDiagnosticsTab() {
      const copyBtn = document.getElementById("diag-btn-copy");
      if (copyBtn) {
        copyBtn.onclick = () => {
          const data = JSON.stringify(Diagnostics.toJSON(), null, 2);
          navigator.clipboard.writeText(data).then(() => {
            showToast("Report copied to clipboard!", "var(--apm-success)");
          }).catch(() => showToast("Failed to copy to clipboard", "var(--apm-danger)"));
        };
      }
      const downloadBtn = document.getElementById("cc-export-download-btn");
      if (downloadBtn) {
        downloadBtn.onclick = () => {
          try {
            const rules = getRules();
            const jsonStr = JSON.stringify(rules, null, 2);
            const blob = new Blob([jsonStr], { type: "application/json" });
            const url2 = URL.createObjectURL(blob);
            const link = document.createElement("a");
            const now = /* @__PURE__ */ new Date();
            const dateStr = now.toISOString().split("T")[0];
            link.href = url2;
            link.download = `apm-colorcode-rules-${dateStr}.json`;
            link.click();
            URL.revokeObjectURL(url2);
            showToast(`Downloaded ${rules.length} rules`, "var(--apm-success-bright)");
          } catch (e) {
            showToast("Download error: " + e.message, "var(--apm-danger)");
          }
        };
      }
    }
    function bindHelpAndChangelog() {
      const helpBtn = document.getElementById("apm-c-btn-help");
      if (helpBtn) helpBtn.onclick = () => {
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
    }
    function bindPresetActions() {
      const defaultCb = document.getElementById("apm-c-is-default");
      if (defaultCb) defaultCb.addEventListener("change", syncDefaultToggle);
      selectEl.addEventListener("change", () => {
        const presets = getPresets();
        const selected = selectEl.value;
        if (selected && presets.autofill[selected]) {
          applyPresetData(presets.autofill[selected]);
        }
      });
      document.getElementById("apm-c-btn-save").onclick = () => {
        if (selectEl.value) {
          updatePresetAutofill(selectEl.value, getCurrentFormData());
          showToast(`Template "${selectEl.value}" Updated!`, "var(--apm-success-bright)");
        } else {
          showToast("No template selected to update.", "var(--apm-danger)");
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
            laborHours: "",
            isDefault: false,
            woTitle: ""
          };
          updatePresetAutofill(safeName, emptyData);
          renderPresetOptions(selectEl);
          selectEl.value = safeName;
          applyPresetData(emptyData);
          showToast(`Template "${safeName}" Created!`, "var(--apm-accent)");
        }
      };
      document.getElementById("apm-c-btn-del").onclick = () => {
        if (selectEl.value && confirm(`Delete template "${selectEl.value}"?`)) {
          const deletedName = selectEl.value;
          updatePresetAutofill(deletedName, null);
          renderPresetOptions(selectEl);
          showToast(`Template "${deletedName}" Deleted.`, "var(--apm-danger)");
        }
      };
    }
    function bindTabOrderActions() {
      document.getElementById("apm-s-btn-reset").onclick = () => {
        const mode = state.settingsMode === "tabs" ? "tab" : "column";
        if (!confirm(`Reset ${mode} layout to system defaults?`)) return;
        const presets = getPresets();
        const funcName = detectScreenFunction();
        if (state.settingsMode === "tabs") {
          const tabOrders = { ...presets.config.tabOrders || {} };
          delete tabOrders[funcName];
          const allHidden = { ...presets.config.hiddenTabs || {} };
          delete allHidden[funcName];
          updatePresetConfig({ tabOrders, hiddenTabs: allHidden });
          invalidateTabCache();
          resetTabDefaults();
          showToast(`Tab layout reset for ${funcName}!`, "var(--apm-accent)");
        } else {
          const columnOrders = { ...presets.config.columnOrders || {} };
          delete columnOrders[funcName];
          updatePresetConfig({ columnOrders });
          const restored = resetColumnDefaults();
          if (restored) {
            showToast(`Column layout reset for ${funcName}!`, "var(--apm-accent)");
          } else {
            showToast(`Column order cleared for ${funcName}. Reload page for full reset.`, "var(--apm-accent)");
          }
        }
        performAutoFetch();
      };
    }
    function sparkline(arr) {
      if (!arr || arr.length === 0) return "";
      const blocks = [" ", "\u2582", "\u2583", "\u2584", "\u2585", "\u2586", "\u2587", "\u2588"];
      const max = Math.max(...arr) || 1;
      return arr.map((v) => blocks[Math.min(blocks.length - 1, Math.floor(v / max * (blocks.length - 1)))]).join("");
    }
    function refreshDiagnosticsUI() {
      const container = document.getElementById("diag-content");
      if (!container) return;
      const data = Diagnostics.toJSON();
      const renderRow = (label, value) => el("div", { style: { display: "flex", justifyContent: "space-between", fontSize: "var(--apm-text-sm)", marginBottom: "3px" } }, [
        el("span", { style: { color: "var(--apm-text-muted)" } }, label),
        el("span", { style: { color: "var(--apm-accent)" } }, value || "---")
      ]);
      const renderTiming = (label, ms) => renderRow(label, ms ? `${ms}ms` : null);
      const renderError = (err) => el("div", { style: { borderLeft: "2px solid var(--apm-danger)", paddingLeft: "8px", marginBottom: "8px", fontSize: "var(--apm-text-xs)" } }, [
        el("div", { style: { color: "var(--apm-danger)", fontWeight: "600" } }, `[${err.tag}] ${err.timestamp.split("T")[1].substring(0, 8)}`),
        el("div", { style: { color: "var(--apm-text-bright)", whiteSpace: "pre-wrap", overflow: "hidden" } }, err.message)
      ]);
      const renderFrame = (f) => el("div", { style: { background: "var(--apm-surface-raised)", padding: "6px", borderRadius: "var(--apm-radius-sm)", marginBottom: "5px", fontSize: "var(--apm-text-xs)" } }, [
        el("div", { style: { display: "flex", justifyContent: "space-between", marginBottom: "2px" } }, [
          el("span", { style: { color: "var(--apm-accent)", fontWeight: "600" } }, f.id || "Unnamed Frame"),
          el("span", { style: { color: f.accessible ? "var(--apm-success-bright)" : "var(--apm-danger)" } }, f.accessible ? "Accessible" : "Blocked")
        ]),
        f.accessible && el("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2px", color: "var(--apm-text-muted)" } }, [
          el("span", {}, f.gridFound ? "\u2705 Grid Found" : "\u274C No Grid"),
          el("span", {}, f.ccFound ? "\u2705 ColorCode" : "\u274C No CC"),
          el("span", {}, f.tagsFound ? "\u2705 Nametags" : "\u274C No Tags"),
          el("span", {}, f.styles ? "\u2705 Styles" : "\u274C No Styles")
        ]),
        f.error && el("div", { style: { color: "var(--apm-warning)", fontSize: "9px" } }, f.error)
      ]);
      const perf = Diagnostics.getPerformanceSummary();
      const totalBoot = data.bootTimings.total || 1;
      const getPerfColor = (ms, type = "boot") => {
        if (type === "boot") {
          if (ms < 500) return "var(--apm-success-bright)";
          if (ms < 1500) return "var(--apm-warning)";
          return "var(--apm-danger)";
        }
        if (ms < 25) return "var(--apm-success-bright)";
        if (ms < 100) return "var(--apm-warning)";
        return "var(--apm-danger)";
      };
      const renderBootBar = (label, ms) => {
        const ratio = ms / totalBoot * 100;
        const color = getPerfColor(ms, "boot");
        const isTotal = label.includes("Total");
        return el("div", { style: { marginBottom: "8px" } }, [
          el("div", { style: { display: "flex", justifyContent: "space-between", fontSize: "var(--apm-text-xs)", color: "var(--apm-text-muted)", marginBottom: "2px" } }, [
            el("span", {}, label),
            el("span", { style: { color: isTotal ? "var(--apm-warning)" : "var(--apm-text-bright)" } }, `T+ ${ms}ms`)
          ]),
          el("div", { style: { height: "4px", background: "rgba(255,255,255,0.05)", borderRadius: "2px", overflow: "hidden" } }, [
            el("div", { style: { height: "100%", width: `${Math.max(2, Math.min(100, ratio))}%`, background: color, transition: "width 0.5s ease" } })
          ])
        ]);
      };
      const bootNodes = [
        el("div", { style: { fontWeight: "600", color: "var(--apm-text-bright)", fontSize: "var(--apm-text-sm)", marginBottom: "10px", borderBottom: "1px solid var(--apm-border)", paddingBottom: "4px" } }, "Boot Waterfall"),
        renderBootBar("DOM Ready", data.bootTimings.dom),
        renderBootBar("Settings Load", data.bootTimings.settings),
        renderBootBar("ExtJS Ready", data.bootTimings.extjs),
        renderBootBar("Total Boot", data.bootTimings.total)
      ];
      const moduleTimings = Object.entries(data.bootTimings).filter(([k]) => k.startsWith("module.")).sort((a, b) => b[1] - a[1]);
      if (moduleTimings.length > 0) {
        bootNodes.push(el(
          "div",
          { style: { fontSize: "var(--apm-text-xs)", color: "var(--apm-text-disabled)", marginTop: "10px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px" } },
          moduleTimings.map(([k, v]) => el("div", { style: { display: "flex", justifyContent: "space-between", padding: "2px 4px", background: "rgba(0,0,0,0.1)", borderRadius: "2px" } }, [
            el("span", {}, k.replace("module.", "")),
            el("span", { style: { color: getPerfColor(v, "module") } }, `${v}ms`)
          ]))
        ));
      }
      const renderEngineStat = (label, stat, history) => {
        let pill = "\u{1F7E2}";
        const color = getPerfColor(stat.avg, "boot");
        if (color === "var(--apm-warning)") pill = "\u{1F7E1}";
        if (color === "var(--apm-danger)") pill = "\u{1F534}";
        return el("div", { style: { background: "var(--apm-surface-raised)", padding: "8px", borderRadius: "var(--apm-radius-sm)", marginBottom: "8px" } }, [
          el("div", { style: { display: "flex", justifyContent: "space-between", marginBottom: "4px" } }, [
            el("span", { style: { color: "var(--apm-text-bright)", fontSize: "var(--apm-text-sm)", fontWeight: "600" } }, `${pill} ${label}`),
            el("span", { style: { color: "var(--apm-accent)", fontSize: "var(--apm-text-sm)" } }, `${stat.avg}ms avg`)
          ]),
          el("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" } }, [
            el("span", { style: { color: "var(--apm-text-disabled)", fontSize: "9px", fontFamily: "var(--apm-font-mono)" } }, sparkline(history)),
            el("span", { style: { color: "var(--apm-text-muted)", fontSize: "9px" } }, `max: ${stat.max}ms / p95: ${stat.p95}ms`)
          ])
        ]);
      };
      const nodes = [
        ...bootNodes,
        el("div", { style: { fontWeight: "600", color: "var(--apm-text-bright)", fontSize: "var(--apm-text-sm)", marginTop: "15px", marginBottom: "8px", borderBottom: "1px solid var(--apm-border)", paddingBottom: "4px" } }, "Engine Performance"),
        renderEngineStat("ColorCode Engine", perf.colorCode, data.performance.colorCode),
        renderEngineStat("EAM Query Service", perf.eamQuery, data.performance.eamQuery),
        el("div", { style: { fontWeight: "600", color: "var(--apm-text-bright)", fontSize: "var(--apm-text-sm)", marginTop: "15px", marginBottom: "8px", borderBottom: "1px solid var(--apm-border)", paddingBottom: "4px" } }, "Scheduler Tasks (avg/max)"),
        el("div", { style: { fontSize: "var(--apm-text-xs)" } }, perf.scheduler.slice(0, 5).map((s) => el("div", { style: { display: "flex", justifyContent: "space-between", marginBottom: "2px" } }, [
          el("span", { style: { color: "var(--apm-text-muted)" } }, s.name),
          el("span", { style: { color: "var(--apm-accent)" } }, `${s.avg} / ${s.max}ms`)
        ]))),
        el("div", { style: { fontWeight: "600", color: "var(--apm-text-bright)", fontSize: "var(--apm-text-sm)", marginTop: "15px", marginBottom: "8px", borderBottom: "1px solid var(--apm-border)", paddingBottom: "4px" } }, "System State"),
        renderRow("Uptime", `${data.uptime}s`),
        renderRow("Hotkeys", data.frames.top.hotkeys ? "Active" : "Disabled"),
        renderRow("Style injection", data.frames.top.styles ? "OK" : "Missing"),
        el("div", { style: { fontWeight: "600", color: "var(--apm-text-bright)", fontSize: "var(--apm-text-sm)", marginTop: "15px", marginBottom: "8px", borderBottom: "1px solid var(--apm-border)", paddingBottom: "4px" } }, "Iframe Health"),
        data.frames.frames.length === 0 ? el("div", { style: { color: "var(--apm-text-muted)", fontSize: "var(--apm-text-xs)" } }, "No iframes detected.") : el("div", {}, data.frames.frames.map(renderFrame)),
        el("div", { style: { fontWeight: "600", color: "var(--apm-text-bright)", fontSize: "var(--apm-text-sm)", marginTop: "15px", marginBottom: "8px", borderBottom: "1px solid var(--apm-border)", paddingBottom: "4px" } }, "Recent Errors"),
        data.errors.length === 0 ? el("div", { style: { color: "var(--apm-text-muted)", fontSize: "var(--apm-text-xs)", fontStyle: "italic" } }, "No errors captured.") : el("div", {}, data.errors.slice(0, 5).map(renderError))
      ];
      container.replaceChildren();
      nodes.forEach((node) => container.appendChild(node));
    }
    initColorCodeAndRegionalSettings();
    bindPanelKeyboardTrap();
    bindCloseButton();
    bindGeneralSettings();
    bindImportExport();
    bindTabSwitching();
    bindDiagnosticsTab();
    bindHelpAndChangelog();
    bindPresetActions();
    bindTabOrderActions();
    if (state.activeTab === "autofill") tabAutofill.onclick();
    else tabSettings.onclick();
  }
  function syncDefaultToggle() {
    const checked = document.getElementById("apm-c-is-default")?.checked;
    const kwRow = document.getElementById("apm-c-keyword-row");
    const kwHint = document.getElementById("apm-c-keyword-hint");
    const kwLabel = document.getElementById("apm-c-keyword-label");
    const titleRow = document.getElementById("apm-c-wo-title-row");
    const titleHint = document.getElementById("apm-c-wo-title-hint");
    if (kwRow) kwRow.style.display = checked ? "none" : "";
    if (kwHint) kwHint.style.display = checked ? "none" : "";
    if (kwLabel) kwLabel.textContent = checked ? "WO Description" : "Auto-Match Keywords";
    if (titleRow) titleRow.style.display = checked ? "" : "none";
    if (titleHint) titleHint.style.display = checked ? "" : "none";
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
    const defaultCb = document.getElementById("apm-c-is-default");
    if (defaultCb) defaultCb.checked = !!data.isDefault;
    const woTitleEl = document.getElementById("apm-c-wo-title");
    if (woTitleEl) woTitleEl.value = data.woTitle || "";
    syncDefaultToggle();
  }
  function renderPresetOptions(selectEl) {
    const presets = getPresets();
    selectEl.replaceChildren();
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
    let _draggingEl = null;
    colListContainer.innerHTML = "";
    if (itemsArray.length === 0) {
      const emptyDiv = document.createElement("div");
      emptyDiv.style.cssText = "color:var(--apm-text-disabled); text-align:center; padding:10px;";
      emptyDiv.textContent = emptyMsg;
      colListContainer.appendChild(emptyDiv);
      return;
    }
    const presets = getPresets();
    if (!presets.config.hiddenTabs) presets.config.hiddenTabs = {};
    const isTabsMode = state.settingsMode === "tabs";
    let visibleItems = itemsArray;
    let hiddenItems = [];
    const funcName = detectScreenFunction();
    const autoSaveOrder = () => {
      const items = [...colListContainer.querySelectorAll(".apm-col-item")];
      const visItems = items.filter((el2) => el2.dataset.hidden !== "true");
      if (visItems.length === 0) return;
      const p = getPresets();
      if (isTabsMode) {
        const orderArray = visItems.map((el2) => el2.dataset.index).filter(Boolean);
        const tabOrders = { ...p.config.tabOrders || {}, [funcName]: orderArray };
        updatePresetConfig({ tabOrders });
      } else {
        invalidateTabCache();
        const currentCols = probeExtGridColumns();
        const orderArray = visItems.map((el2) => {
          const idx = el2.dataset.index;
          const probed = currentCols.find((c) => c.index === idx);
          return { index: idx, width: probed?.width || null };
        }).filter((e) => e.index);
        const columnOrders = { ...p.config.columnOrders || {}, [funcName]: orderArray };
        updatePresetConfig({ columnOrders });
      }
    };
    if (isTabsMode) {
      const siloOrder = presets.config.tabOrders?.[funcName] || "";
      const preferredOrder = typeof siloOrder === "string" ? siloOrder.split(",").map((s) => s.trim()).filter(Boolean) : Array.isArray(siloOrder) ? siloOrder : [];
      const allHidden = presets.config.hiddenTabs || {};
      const screenHidden = Array.isArray(allHidden) ? [...allHidden] : [...allHidden[funcName] || []];
      itemsArray.forEach((c) => {
        if (c.systemHidden && !screenHidden.includes(c.index) && !preferredOrder.includes(c.index)) {
          screenHidden.push(c.index);
        }
      });
      visibleItems = itemsArray.filter((c) => !screenHidden.includes(c.index));
      hiddenItems = itemsArray.filter((c) => screenHidden.includes(c.index));
    }
    const resetBtn = document.getElementById("apm-s-btn-reset");
    if (resetBtn) resetBtn.style.display = "block";
    const createDragItem = (c, isHidden) => {
      const item = document.createElement("div");
      item.dataset.index = c.index;
      item.className = "apm-col-item";
      if (isHidden) {
        item.draggable = false;
        item.dataset.hidden = "true";
        item.style.cursor = "default";
        item.style.borderLeftColor = "var(--apm-danger)";
        const badges = [];
        if (c.isPluginMenu) badges.push(el("span", { className: "apm-overflow-badge", style: { background: "var(--apm-purple)" }, title: "This tab is managed by the EAM tab menu plugin (More menu)" }, "More Menu"));
        const labelSpan = el("span", { style: { opacity: "0.5", flex: "1", display: "flex", alignItems: "center" } }, [
          el("span", { style: { textDecoration: "line-through" } }, [
            el("b", { style: { color: "var(--apm-text-disabled)" } }, "\u2630"),
            document.createTextNode(" \xA0 " + c.text)
          ]),
          ...badges
        ]);
        const restoreBtn = el("button", {
          className: "apm-tab-restore-btn",
          "data-tab-name": c.index,
          style: { background: "var(--apm-success-bright)", color: "white", border: "none", borderRadius: "4px", padding: "4px 10px", cursor: "pointer", fontSize: "14px", fontWeight: "bold", boxShadow: "0 2px 4px rgba(0,0,0,0.2)", transition: "transform 0.1s", position: "relative", zIndex: "10" },
          title: "Restore tab"
        }, "\uFF0B");
        item.appendChild(labelSpan);
        item.appendChild(restoreBtn);
      } else {
        item.draggable = true;
        const actionEl = isTabsMode ? el("button", {
          className: "apm-tab-hide-btn",
          "data-tab-name": c.index,
          style: { background: "transparent", color: "var(--apm-danger)", border: "none", borderRadius: "4px", padding: "2px 6px", cursor: "pointer", fontSize: "13px", fontWeight: "bold" },
          title: "Hide tab"
        }, "\u2716") : el("span", { style: { color: "var(--apm-text-disabled)", fontSize: "10px" } }, "[" + c.index + "]");
        const badges = [];
        if (isTabsMode && c.isPluginMenu) badges.push(el("span", { className: "apm-overflow-badge", style: { background: "var(--apm-purple)" }, title: "This tab is managed by the EAM tab menu plugin (More menu)" }, "More Menu"));
        const labelSpan = el("span", {}, [
          el("span", {}, [
            el("b", { style: { color: "var(--apm-accent)" } }, "\u2630"),
            document.createTextNode(" \xA0 " + c.text)
          ]),
          ...badges
        ]);
        item.appendChild(labelSpan);
        item.appendChild(document.createTextNode(" "));
        item.appendChild(actionEl);
        item.ondragstart = (e) => {
          e.dataTransfer.setData("text/plain", "");
          item.classList.add("dragging");
          _draggingEl = item;
        };
        item.ondragend = () => {
          item.classList.remove("dragging");
          _draggingEl = null;
          autoSaveOrder();
        };
      }
      return item;
    };
    visibleItems.forEach((c) => colListContainer.appendChild(createDragItem(c, false)));
    if (isTabsMode && hiddenItems.length > 0) {
      const divider = document.createElement("div");
      divider.style.cssText = "text-align:center; color:var(--apm-text-disabled); font-size:11px; padding:6px 0; margin:4px 0; border-top:1px dashed var(--apm-border-strong); user-select:none;";
      divider.textContent = "\u2500\u2500 Hidden \u2500\u2500";
      colListContainer.appendChild(divider);
      hiddenItems.forEach((c) => colListContainer.appendChild(createDragItem(c, true)));
    }
    if (isTabsMode) {
      colListContainer.querySelectorAll(".apm-tab-hide-btn").forEach((btn) => {
        btn.onclick = (e) => {
          e.stopPropagation();
          const tabName = btn.getAttribute("data-tab-name");
          const p = getPresets();
          const allHidden = { ...p.config.hiddenTabs || {} };
          if (Array.isArray(p.config.hiddenTabs)) {
            allHidden[funcName] = [...p.config.hiddenTabs];
          }
          const screenHidden = allHidden[funcName] || [];
          if (!screenHidden.includes(tabName)) {
            allHidden[funcName] = [...screenHidden, tabName];
            updatePresetConfig({ hiddenTabs: allHidden });
          }
          renderDragList(state, colListContainer, itemsArray, emptyMsg);
        };
      });
      colListContainer.querySelectorAll(".apm-tab-restore-btn").forEach((btn) => {
        btn.onmousedown = (e) => e.stopPropagation();
        btn.onclick = (e) => {
          e.preventDefault();
          e.stopPropagation();
          const tabName = btn.getAttribute("data-tab-name");
          const p = getPresets();
          const allHidden = { ...p.config.hiddenTabs || {} };
          if (Array.isArray(p.config.hiddenTabs)) {
            allHidden[funcName] = p.config.hiddenTabs.filter((t) => t !== tabName);
          } else {
            allHidden[funcName] = (allHidden[funcName] || []).filter((t) => t !== tabName);
          }
          const tabOrders = { ...p.config.tabOrders || {} };
          const siloOrder = tabOrders[funcName];
          const orderArray = typeof siloOrder === "string" ? siloOrder.split(",").map((s) => s.trim()) : Array.isArray(siloOrder) ? [...siloOrder] : [];
          if (!orderArray.includes(tabName)) {
            orderArray.push(tabName);
          }
          tabOrders[funcName] = orderArray;
          updatePresetConfig({
            hiddenTabs: allHidden,
            tabOrders
          });
          renderDragList(state, colListContainer, itemsArray, emptyMsg);
        };
      });
    }
    colListContainer.ondragover = (e) => {
      e.preventDefault();
      const dragging = _draggingEl;
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
      keyword: document.getElementById("apm-c-keyword")?.value?.toLowerCase() || "",
      org: document.getElementById("apm-c-org")?.value || "",
      eq: document.getElementById("apm-c-eq")?.value || "",
      type: document.getElementById("apm-c-type")?.value || "",
      status: document.getElementById("apm-c-status")?.value || "",
      exec: document.getElementById("apm-c-exec")?.value || "",
      safety: document.getElementById("apm-c-safety")?.value || "",
      lotoMode: document.getElementById("apm-c-loto-mode")?.value || "",
      pmChecks: document.getElementById("apm-c-pm-checks")?.value ? parseInt(document.getElementById("apm-c-pm-checks").value, 10) : 0,
      prob: document.getElementById("apm-c-prob")?.value || "",
      fail: document.getElementById("apm-c-fail")?.value || "",
      cause: document.getElementById("apm-c-cause")?.value || "",
      assign: document.getElementById("apm-c-assign")?.value || "",
      start: document.getElementById("apm-c-start")?.value || "",
      end: document.getElementById("apm-c-end")?.value || "",
      close: document.getElementById("apm-c-close")?.value || "",
      laborHours: document.getElementById("apm-c-labor-hours")?.value || "",
      isDefault: document.getElementById("apm-c-is-default")?.checked || false,
      woTitle: document.getElementById("apm-c-wo-title")?.value || ""
    };
  }

  // src/ui/toolbar-injection.js
  init_scheduler();
  init_utils();
  init_logger();
  init_ui_manager();
  init_dom_helpers();
  init_api();
  init_context();
  var tbWin = apmGetGlobalWindow();
  function injectToggleBtnNatively() {
    if (!isTopFrame()) return;
    const topDoc = tbWin.top.document;
    if (!window[FLAGS.FORECAST_TOGGLE]) {
      window[FLAGS.FORECAST_TOGGLE] = true;
      window.addEventListener("APM_TOGGLE_FORECAST", (e) => {
        APMLogger.debug("APM Master", "Event: APM_TOGGLE_FORECAST fired.");
        UIManager.toggle("eam-forecast-panel", () => {
          let panel = document.getElementById("eam-forecast-panel");
          const buildUI = APMApi.get("buildForecastUI");
          if (!panel && typeof buildUI === "function") {
            buildUI();
            panel = document.getElementById("eam-forecast-panel");
          }
          if (!panel) {
            APMLogger.error("APM Master", "Failed to find/build eam-forecast-panel");
            return;
          }
          const zf = parseFloat(panel.style.zoom) || 1;
          const btnBottom = e.detail.bottom;
          const btnLeft = e.detail.left;
          const btnWidth = e.detail.width;
          const panelWidth = 500;
          const bottomMargin = 20;
          const top = (btnBottom + 6) / zf;
          let targetLeft = (btnLeft + btnWidth / 2 - panelWidth * zf / 2) / zf;
          const maxLeft = (window.innerWidth - panelWidth * zf - 10) / zf;
          if (targetLeft > maxLeft) targetLeft = maxLeft;
          if (targetLeft < 10 / zf) targetLeft = 10 / zf;
          panel.style.top = top + "px";
          panel.style.left = targetLeft + "px";
          panel.style.right = "";
          panel.style.display = "block";
          panel.style.visibility = "visible";
          const availableHeight = (window.innerHeight - btnBottom - 6 - bottomMargin) / zf;
          panel.style.maxHeight = Math.max(300, availableHeight) + "px";
          APMLogger.info("APM Master", "Forecast panel opened.");
        });
      });
      window.addEventListener("APM_TOGGLE_SETTINGS", (e) => {
        APMLogger.debug("APM Master", "Event: APM_TOGGLE_SETTINGS fired.");
        UIManager.toggle("apm-settings-panel", () => {
          let p = document.getElementById("apm-settings-panel");
          const buildUI = APMApi.get("buildSettingsPanel");
          if (!p && typeof buildUI === "function") {
            buildUI();
            p = document.getElementById("apm-settings-panel");
          }
          if (!p) return;
          const zf = parseFloat(p.style.zoom) || 1;
          const btnBottom = e.detail.bottom;
          const btnLeft = e.detail.left;
          const btnWidth = e.detail.width;
          const panelWidth = 440;
          const bottomMargin = 20;
          const top = (btnBottom + 6) / zf;
          let left = (btnLeft + btnWidth / 2 - panelWidth * zf / 2) / zf;
          const maxLeft = (window.innerWidth - panelWidth * zf - 10) / zf;
          if (left > maxLeft) left = maxLeft;
          if (left < 10 / zf) left = 10 / zf;
          p.style.top = top + "px";
          p.style.left = left + "px";
          p.style.right = "";
          p.style.display = "flex";
          p.style.visibility = "visible";
          const availableHeight = (window.innerHeight - btnBottom - 6 - bottomMargin) / zf;
          p.style.maxHeight = Math.max(300, availableHeight) + "px";
          APMLogger.info("APM Master", "Settings panel opened.");
        });
      });
      document.addEventListener("mousedown", (e) => {
        const fcBtn = e.target.closest("#apm-forecast-ext-btn");
        if (fcBtn) {
          APMLogger.debug("APM Toolbar", "Delegated MouseDown: Forecast Button");
          e.preventDefault();
          const rect = fcBtn.getBoundingClientRect();
          window.dispatchEvent(new CustomEvent("APM_TOGGLE_FORECAST", {
            detail: { left: rect.left, bottom: rect.bottom, width: rect.width }
          }));
          return;
        }
        const crBtn = e.target.closest("#apm-settings-ext-btn");
        if (crBtn) {
          APMLogger.debug("APM Toolbar", "Delegated MouseDown: Settings Button");
          e.preventDefault();
          const rect = crBtn.getBoundingClientRect();
          window.dispatchEvent(new CustomEvent("APM_TOGGLE_SETTINGS", {
            detail: { left: rect.left, bottom: rect.bottom, width: rect.width }
          }));
          return;
        }
      }, true);
      let lastPulse = 0;
      const tryInjectButtons = () => {
        try {
          const now = Date.now();
          if (isTopFrame() && now - lastPulse > 1e4) {
            APMLogger.debug("APM Toolbar", "Pulse: Injection task active.");
            lastPulse = now;
          }
          if (!tbWin.Ext || !tbWin.Ext.ComponentQuery) {
            if (now - lastPulse > 1e4) APMLogger.debug("APM Toolbar", "Waiting for ExtJS...");
            return;
          }
          const existingCmp = tbWin.Ext.getCmp("apm-custom-btn-group");
          if (existingCmp && existingCmp.getEl() && existingCmp.getEl().dom && document.body.contains(existingCmp.getEl().dom)) {
            return;
          }
          if (existingCmp) {
            APMLogger.debug("APM Toolbar", "Destroying stale button component.");
            existingCmp.destroy();
          }
          let parentContainer = null;
          let insertIndex = -1;
          const topToolbars = tbWin.Ext.ComponentQuery.query('toolbar[dock="top"]:not([destroyed=true])');
          for (const tb of topToolbars) {
            if (!tb.rendered || tb.isDestroyed || !tb.isVisible?.(true)) continue;
            if (tb.up("gridpanel") || tb.up("window")) continue;
            const owner = tb.ownerCt;
            if (!owner) continue;
            if (tb.items && tb.items.getCount() > 0) {
              const visibleCount = tb.items.items.filter((it) => !it.hidden && !it.isDestroyed).length;
              if (visibleCount === 0) continue;
              parentContainer = tb;
              insertIndex = tb.items.getCount();
              APMLogger.debug("APM Toolbar", `Strategy 1: Found toolbar via ComponentQuery (${tb.id}, ${visibleCount}/${tb.items.getCount()} visible items)`);
              break;
            }
          }
          if (!parentContainer) {
            const rawBtns = document.querySelectorAll(".x-btn-mainmenuButton-toolbar-small");
            if (rawBtns.length > 0) {
              let lastVisible = null;
              for (let i = 0; i < rawBtns.length; i++) {
                if (rawBtns[i].offsetWidth > 0) lastVisible = rawBtns[i];
              }
              if (lastVisible) {
                const extEl = lastVisible.closest(".x-btn") || lastVisible;
                if (extEl && extEl.id) {
                  const extCmp = tbWin.Ext.getCmp(extEl.id);
                  if (extCmp) {
                    parentContainer = extCmp.up("toolbar") || extCmp.up("container");
                    if (!parentContainer) {
                      parentContainer = extCmp.up("panel")?.getDockedItems?.('toolbar[dock="top"]')?.[0];
                    }
                    if (parentContainer) {
                      insertIndex = parentContainer.items.indexOf(extCmp) + 1;
                      APMLogger.debug("APM Toolbar", `Strategy 2: Found toolbar via DOM anchor (${parentContainer.id})`);
                    }
                  }
                }
              }
            }
          }
          if (!parentContainer) {
            const allToolbars = tbWin.Ext.ComponentQuery.query("toolbar:not([destroyed=true])");
            for (const tb of allToolbars) {
              if (!tb.rendered || tb.isDestroyed || !tb.isVisible?.(true)) continue;
              if (tb.up("gridpanel") || tb.up("window")) continue;
              if (tb.items && tb.items.getCount() > 1) {
                parentContainer = tb;
                insertIndex = tb.items.getCount();
                APMLogger.debug("APM Toolbar", `Strategy 3: Fallback toolbar (${tb.id}, ${tb.items.getCount()} items)`);
                break;
              }
            }
          }
          if (!parentContainer) {
            if (now - lastPulse > 1e4) APMLogger.debug("APM Toolbar", "No suitable toolbar found (tried 3 strategies)");
            return;
          }
          APMLogger.info("APM Toolbar", `Injecting buttons into: ${parentContainer.id} at index ${insertIndex}`);
          parentContainer.insert(insertIndex, {
            xtype: "component",
            id: "apm-custom-btn-group",
            margin: "0 0 0 12",
            html: el("div", { id: "apm-btn-group-inner", style: "display:flex; align-items:center; gap:27px;" }, [
              el("div", {
                id: "apm-forecast-ext-btn",
                className: "rain-cloud-hover apm-btn-inner apm-fc-btn",
                style: "display:flex; align-items:center; font-family:sans-serif; font-size:13px; font-weight:600; color:var(--apm-text-secondary); transition:color 0.15s; cursor:pointer;"
              }, [
                el("span", { style: "margin-right:6px;" }, "Forecast"),
                el("span", { style: "display: inline-flex; align-items: center;", innerHTML: SVG_CLOUD.trim() })
              ]),
              el("div", {
                id: "apm-settings-ext-btn",
                style: "display:flex; align-items:center; font-family:sans-serif; font-size:13px; font-weight:600; color:var(--apm-text-secondary); transition:color 0.15s; cursor:pointer;"
              }, [
                el("span", {}, "APM Master"),
                el("span", {
                  style: "margin-left: 5px; display: inline-flex; align-items: center;",
                  innerHTML: SVG_ARROW_DOWN.trim()
                })
              ])
            ]).outerHTML
          });
        } catch (e) {
          APMLogger.error("Toolbar", "Native Button Injection Error:", e);
        }
      };
      APMScheduler.registerTask("ext-btn-injection", 500, tryInjectButtons);
      tryInjectButtons();
    }
  }

  // src/boot.js
  init_toast();
  init_constants();
  var _drillbackHandled = false;
  async function handleDrillbackAutoOpen() {
    if (_drillbackHandled || !isTopFrame()) return;
    const params = new URLSearchParams(window.location.search);
    let matchedEntry = null;
    let entityId = null;
    for (const [key, entry] of Object.entries(ENTITY_REGISTRY)) {
      if (params.get(entry.drillbackFlag) === "YES" && params.get(entry.entityKey)) {
        const urlUserFunc = params.get("USER_FUNCTION_NAME");
        if (urlUserFunc && urlUserFunc !== key) continue;
        matchedEntry = entry;
        entityId = params.get(entry.entityKey);
        break;
      }
    }
    if (!matchedEntry || !entityId) return;
    _drillbackHandled = true;
    APMLogger.info("Boot", `Drillback detected: ${matchedEntry.label} ${entityId}`);
    const GRID_TIMEOUT = 7e3;
    const POLL_INTERVAL = 250;
    const maxPolls = Math.ceil(GRID_TIMEOUT / POLL_INTERVAL);
    let grid = null;
    let gridWin = null;
    for (let i = 0; i < maxPolls; i++) {
      await delay(POLL_INTERVAL);
      for (const w of getExtWindows()) {
        try {
          if (!w.Ext?.ComponentQuery) continue;
          const grids = w.Ext.ComponentQuery.query("gridpanel:not([destroyed=true])");
          for (const g of grids) {
            if (!g.rendered || g.isDestroyed) continue;
            const store2 = g.getStore?.();
            if (!store2 || store2.isLoading?.()) continue;
            const sid = (store2.storeId || "").toLowerCase();
            if (sid.includes("wsjobs") || sid.includes("ctjobs") || sid.includes(matchedEntry.systemFunc.toLowerCase())) {
              grid = g;
              gridWin = w;
              break;
            }
          }
          if (grid) break;
        } catch (e) {
        }
      }
      if (grid) break;
    }
    if (!grid) {
      APMLogger.warn("Boot", `Drillback grid not found within ${GRID_TIMEOUT}ms`);
      showToast(`${matchedEntry.label} grid did not load`, "#e74c3c", false);
      return;
    }
    const store = grid.getStore();
    if (store.getCount() === 0) {
      showToast(`${matchedEntry.label} ${entityId} not found`, "#e74c3c", false);
      return;
    }
    const result = await openFirstGridRecord(grid, gridWin);
    if (result.success) {
      showToast(`Opened ${matchedEntry.label} ${result.entityId}`, "#1abc9c", false);
    } else {
      showToast(`Could not open ${matchedEntry.label} ${entityId}`, "#e74c3c", false);
    }
  }
  function initBootSequence(win = window) {
    const isTop = win === win.top;
    FeatureFlags.register("colorCode", { label: "ColorCode Engine", description: "Real-time grid highlighting and nametags" });
    FeatureFlags.register("forecast", { label: "Forecast Tools", description: "Site/Org filters and search" });
    FeatureFlags.register("autoFill", { label: "AutoFill Profiles", description: "Automated form completion templates" });
    FeatureFlags.register("laborBooker", { label: "Labor Booker", description: "Quick labor entry for WOs" });
    FeatureFlags.register("ptpTimer", { label: "PTP Take-2 Timer", description: "Safety countdown on PTP screen" });
    FeatureFlags.register("tabGridOrder", { label: "UI Customization", description: "Drag & drop reordering of grids/tabs" });
    FeatureFlags.register("tabTitle", { label: "Tab Title", description: "Show current screen name in browser tab" });
    initGlobalSync();
    if (isTop) {
      try {
        loadPresets();
      } catch (e) {
        APMLogger.error("Boot", "Failed to load initial settings:", e);
      }
    }
    BootManager.waitForExt(win);
    BootManager.onBoot(() => {
      const isLanding = AppContext.isLanding;
      const isShell = AppContext.isShell;
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
        { name: "ForecastUI", flag: "forecast", onlyTop: true, fn: buildForecastUI },
        { name: "SearchUI", flag: "forecast", onlyTop: true, fn: buildSearchUI },
        { name: "Shortcuts", flag: "forecast", fn: initForecastShortcuts },
        { name: "ForecastFilter", flag: "forecast", fn: () => ForecastFilter.init() },
        { name: "LaborTracker", flag: "laborBooker", onlyTop: true, fn: () => LaborTracker.init() },
        { name: "SettingsPanel", onlyTop: true, fn: buildSettingsPanel },
        { name: "ColorCodeLogic", flag: "colorCode", noShell: true, fn: setupColorCodeLogic },
        { name: "AutoFillObserver", flag: "autoFill", onlyTop: true, fn: initAutoFillObserver },
        { name: "TabGridOrder", flag: "tabGridOrder", noShell: true, fn: () => {
          applyGridConsistency();
          applyTabConsistency();
        } },
        { name: "NativeToggle", flag: "colorCode", onlyTop: true, fn: injectToggleBtnNatively },
        { name: "PtpStatus", flag: "ptpTimer", onlyTop: true, noShell: true, fn: checkPtpStatus }
      ];
      tasks.forEach((task) => {
        try {
          if (isShell && task.noShell) {
            return;
          }
          if (task.flag && !FeatureFlags.isEnabled(task.flag)) {
            APMLogger.debug("Boot", `Skipping disabled feature: ${task.name}`);
            return;
          }
          if (task.onlyTop && !isTop) {
            return;
          }
          const start = performance.now();
          task.fn();
          const duration = performance.now() - start;
          Diagnostics.recordTiming(`module.${task.name}`, parseFloat(duration.toFixed(2)));
        } catch (e) {
          APMLogger.error("Boot", `Failed to initialize ${task.name}:`, e);
        }
      });
      try {
        ExtConsistencyManager.bindAll();
      } catch (e) {
        APMLogger.error("Boot", "ExtConsistency initial bind failed:", e);
      }
      try {
        APMScheduler.registerTask("consistency-bind", 1e4, () => ExtConsistencyManager.bindAll());
      } catch (e) {
        APMLogger.error("Boot", "Failed to register consistency-bind task:", e);
      }
      if (isTop) {
        try {
          APMScheduler.registerTask("ui-persistence", 3e3, () => {
            if (!document.getElementById("apm-settings-panel")) {
              APMLogger.info("APM Master", "Settings panel missing, re-injecting...");
              buildSettingsPanel();
            }
            if (FeatureFlags.isEnabled("forecast") && !document.getElementById("eam-forecast-panel")) {
              APMLogger.info("APM Master", "Forecast panel missing, re-injecting...");
              buildForecastUI();
            }
            if (FeatureFlags.isEnabled("forecast") && !document.getElementById("apm-quick-search-container")) {
              APMLogger.info("APM Master", "Quick Search missing, re-injecting...");
              buildSearchUI();
            }
            if (FeatureFlags.isEnabled("tabGridOrder")) {
              applyTabConsistency();
              applyGridConsistency();
            }
            if (FeatureFlags.isEnabled("laborBooker") && !document.getElementById("apm-labor-trigger")) {
              APMLogger.info("APM Master", "Labor Tally missing/detached, re-injecting...");
              LaborTracker.init();
            }
            if (FeatureFlags.isEnabled("forecast")) initForecastShortcuts();
            if (FeatureFlags.isEnabled("colorCode")) {
              const wins = getExtWindows();
              for (const w of wins) {
                try {
                  if (w.Ext && isFrameVisible(w)) debouncedProcessColorCodeGrid(w.document);
                } catch (e) {
                }
              }
            }
          });
        } catch (e) {
          APMLogger.error("Boot", "Failed to register ui-persistence task:", e);
        }
      }
      if (isTop && FeatureFlags.isEnabled("tabTitle")) {
        try {
          APMScheduler.registerTask("tab-title-update", 3e3, updateTabTitle);
        } catch (e) {
          APMLogger.error("Boot", "Failed to register tab-title-update task:", e);
        }
      }
      try {
        APMScheduler.registerTask("scheduler-investigator", 1e4, () => {
          const schedulerTasks = APMScheduler.getTasks();
          const instanceId = APMScheduler.instanceId;
          APMLogger.debug("Scheduler", `[${instanceId}] Live tasks (${schedulerTasks.length}):`, schedulerTasks.map((t) => t.id).join(", "));
        });
      } catch (e) {
        APMLogger.error("Boot", "Failed to register scheduler-investigator task:", e);
      }
      handleDrillbackAutoOpen().catch((e) => APMLogger.error("Boot", "Drillback auto-open error:", e));
    });
  }

  // src/modules/ptp/ptp-sandbox.js
  init_constants();
  init_logger();
  init_storage();
  init_origin_guard();
  var STYLE_ID = "apm-ptp-dark-patch";
  var DARK_THEMES = /* @__PURE__ */ new Set(["theme-hex-dark", "theme-dark", "theme-darkblue", "theme-orange", "dark"]);
  var currentMemTheme = "default";
  var _parentOrigin = null;
  var _pageWin = typeof unsafeWindow !== "undefined" ? unsafeWindow : window;
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

    /* === Cloudscape Popover (xjuzf hash = popover component) ===
       Popovers keep their default white bg unless explicitly darkened.
       White text from the broad b/p rule above then becomes invisible.
       Target every layer of the popover stack via the shared hash. */
    #root [class*="awsui_container_xjuzf_"],
    #root [class*="awsui_container-body_xjuzf_"],
    #root [class*="awsui_body_xjuzf_"],
    #root [class*="awsui_content_xjuzf_"] {
      background-color: var(--bg-2) !important;
      color: var(--fg) !important;
      border-color: var(--border) !important;
    }
    /* Arrow tip: inner face matches body, outer ring matches border */
    #root [class*="awsui_arrow-inner_xjuzf_"] {
      background-color: var(--bg-2) !important;
    }
    #root [class*="awsui_arrow-outer_xjuzf_"] {
      background-color: var(--border) !important;
    }
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
    let lastCompletedWo = null;
    const triggerCompletion = (woNumber) => {
      if (!woNumber) return;
      if (lastCompletedWo === woNumber) {
        APMLogger.debug("APM Master", `PTP Sandbox: Duplicate completion for WO ${woNumber}, skipping.`);
        return;
      }
      APMLogger.info("APM Master", `PTP Sandbox: Assessment completed via API for WO ${woNumber}. Broadcasting...`);
      if (_parentOrigin) {
        try {
          window.top.postMessage({ type: "APM_PTP_COMPLETED", wo: woNumber }, _parentOrigin);
        } catch (e) {
        }
      }
      lastCompletedWo = woNumber;
    };
    const triggerStart = (woNumber) => {
      if (!woNumber) return;
      lastCompletedWo = null;
      APMLogger.info("APM Master", `PTP Sandbox: Assessment started for WO ${woNumber}. Broadcasting...`);
      if (_parentOrigin) {
        try {
          window.top.postMessage({ type: "APM_PTP_START", wo: woNumber }, _parentOrigin);
        } catch (e) {
        }
      }
    };
    const triggerCancel = (woNumber) => {
      if (!woNumber) return;
      APMLogger.info("APM Master", `PTP Sandbox: Assessment cancelled for WO ${woNumber}. Broadcasting...`);
      if (_parentOrigin) {
        try {
          window.top.postMessage({ type: "APM_PTP_CANCELLED", wo: woNumber }, _parentOrigin);
        } catch (e) {
        }
      }
    };
    const triggerStopTimer = () => {
      APMLogger.info("APM Master", "PTP Sandbox: Assessment list hit. Requesting timer stop...");
      if (_parentOrigin) {
        try {
          window.top.postMessage({ type: "APM_PTP_STOP_TIMER" }, _parentOrigin);
        } catch (e) {
        }
      }
    };
    const handleAssessmentResponse = (url2, text, status, requestBody) => {
      try {
        let woFromUrl = null;
        const urlMatch = url2.match(/[?&](?:workOrderId|workorder_id)=(\d+)/i);
        if (urlMatch) woFromUrl = urlMatch[1];
        let bodyObj = null;
        if (requestBody && typeof requestBody === "string") {
          try {
            bodyObj = JSON.parse(requestBody);
          } catch (e) {
          }
        } else if (requestBody && typeof requestBody === "object") {
          bodyObj = requestBody;
        }
        const woFromBody = bodyObj?.workorder_id || bodyObj?.workOrderId;
        const targetWo = woFromBody || woFromUrl;
        if (url2.includes("get_all_assessment")) {
          triggerStopTimer();
        }
        if (url2.includes("create_assessment") && status === 200) {
          triggerStart(targetWo);
          return;
        }
        if (!text) return;
        let res;
        try {
          res = JSON.parse(text);
        } catch (e) {
          APMLogger.debug("APM Master", `PTP Sandbox: Non-JSON response from ${url2.split("?")[0]}`);
          if (url2.includes("submit_assessment") || url2.includes("update_assessment")) {
            if (text.includes("COMPLETE") && targetWo) triggerCompletion(targetWo);
            else if (text.includes("CANCELLED") && targetWo) triggerCancel(targetWo);
          }
          return;
        }
        const assessmentStatus = res?.body?.assessment?.AssessmentStatus || res?.body?.response?.final_status || res?.body?.response?.AssessmentStatus || res?.body?.AssessmentStatus || res?.assessment?.AssessmentStatus || res?.AssessmentStatus;
        const resWo = res?.body?.response?.workorder_id || res?.body?.response?.workOrderId || res?.body?.workorder_id || res?.workorder_id;
        const finalWo = resWo || targetWo;
        if (assessmentStatus === "INCOMPLETE") {
          triggerStart(finalWo);
        } else if (assessmentStatus === "COMPLETE") {
          triggerCompletion(finalWo);
        } else if (assessmentStatus === "CANCELLED") {
          triggerCancel(finalWo);
        } else if (url2.includes("get_revisions") && res?.body?.revisions) {
          const inactiveRev = res.body.revisions.find((r) => r.status === "inactive");
          if (inactiveRev && finalWo) triggerCancel(finalWo);
        } else if (url2.includes("submit_assessment") || url2.includes("update_assessment")) {
          if (text.includes("COMPLETE") && finalWo) {
            triggerCompletion(finalWo);
          } else if (text.includes("CANCELLED") && finalWo) {
            triggerCancel(finalWo);
          }
        }
      } catch (e) {
        APMLogger.debug("APM Master", "PTP Sandbox: Error processing response:", e.message);
      }
    };
    const PTP_ENDPOINTS = ["submit_assessment", "update_assessment", "get_assessment", "create_assessment", "get_all_assessment", "get_revisions"];
    const isRelevantUrl = (url2) => url2 && PTP_ENDPOINTS.some((ep) => url2.includes(ep));
    const RealXHR = _pageWin.XMLHttpRequest;
    const origOpen = RealXHR.prototype.open;
    const origSend = RealXHR.prototype.send;
    RealXHR.prototype.open = function(method, url2) {
      this._apmUrl = (url2 || "").toString();
      return origOpen.apply(this, arguments);
    };
    RealXHR.prototype.send = function(body) {
      if (isRelevantUrl(this._apmUrl)) {
        this.addEventListener("load", function() {
          handleAssessmentResponse(this._apmUrl, this.responseText, this.status, body);
        });
      }
      return origSend.apply(this, arguments);
    };
    const origFetch = _pageWin.fetch;
    _pageWin.fetch = async function(...args) {
      const response = await origFetch.apply(this, args);
      try {
        const url2 = args[0] instanceof Request ? args[0].url : typeof args[0] === "string" ? args[0] : "";
        if (isRelevantUrl(url2)) {
          const clone = response.clone();
          const text = await clone.text();
          const reqObj = args[0] instanceof Request ? args[0] : args[1] || {};
          handleAssessmentResponse(url2, text, response.status, reqObj.body);
        }
      } catch (e) {
        APMLogger.debug("PTP", "Fetch intercept body read failed:", e);
      }
      return response;
    };
    const start = () => {
      APMLogger.debug("APM Master", "PTP Sandbox: Starting core logic");
      const checkVisibility = () => {
        if (document.visibilityState !== "visible") return;
        if (!document.body) return;
        const hasPtpHeader = !!document.querySelector('.ptp-header, .permit-details, #ptp-main-content, [class*="awsui_root_"]');
        const hasWorkOrder = window.location.href.includes("workOrder");
        if (hasPtpHeader || hasWorkOrder) {
          if (_parentOrigin) {
            try {
              window.top.postMessage({ type: "APM_PTP_HEARTBEAT", visible: true, url: window.location.href }, _parentOrigin);
            } catch (e) {
            }
          }
        }
      };
      setInterval(checkVisibility, 8e3);
      checkVisibility();
      window.addEventListener("mousedown", (e) => {
        if (_parentOrigin) {
          try {
            window.top.postMessage({ type: "APM_PTP_CLICK_AWAY" }, _parentOrigin);
          } catch (e2) {
          }
        }
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
      if (!isTrustedOrigin(e.origin)) return;
      const isBetterApmMatch = d.__betterApm === "theme" || d.__betterApm === "setTheme";
      const isNativeMatch = d.type === "APM_SET_THEME" || d.apmMaster === "theme";
      if (isBetterApmMatch || isNativeMatch) {
        if (!_parentOrigin && isTrustedOrigin(e.origin)) _parentOrigin = e.origin;
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
        const target = _parentOrigin || "*";
        try {
          window.top.postMessage({ type: "APM_GET_THEME", apmMaster: "getTheme", __betterApm: "getTheme" }, target);
        } catch (e) {
        }
      } catch (e) {
      }
    };
    requestTheme();
    setTimeout(requestTheme, 1500);
    setTimeout(requestTheme, 4e3);
  }

  // src/modules/colorcode/nametag-filter.js
  init_logger();
  init_api();
  init_utils();
  function getActiveNametagFilter() {
    const root = apmGetGlobalWindow();
    const topWin = root.top || root;
    return topWin.activeNametagFilter || "";
  }
  function setActiveNametagFilter(kw) {
    const root = apmGetGlobalWindow();
    const topWin = root.top || root;
    topWin.activeNametagFilter = kw || "";
  }
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
  function applyNametagFilter(kw = "") {
    APMLogger.debug("Nametag", `applyNametagFilter called with kw: "${kw}"`);
    const ctx = findMainGrid();
    if (!ctx) return;
    const store = ctx.grid.getStore();
    const gridEl = ctx.grid.getEl();
    if (!gridEl) return;
    const gridDom = gridEl.dom;
    const view = ctx.grid.getView();
    if (!store._nativeGetTotalCount) {
      store._nativeGetTotalCount = store.getTotalCount;
    }
    if (store._nativeGetTotalCount && !store._apmCleanupBound) {
      store._apmCleanupBound = true;
      ctx.grid.on("destroy", () => {
        if (store._nativeGetTotalCount) {
          store.getTotalCount = store._nativeGetTotalCount;
          delete store._nativeGetTotalCount;
        }
      });
    }
    const activeFilter = kw || "";
    setActiveNametagFilter(activeFilter);
    const startFilter = performance.now();
    try {
      const keywords = kw.split(",").map((s) => s.trim().toLowerCase()).filter((s) => s);
      store.suspendEvents();
      try {
        if (keywords.length === 0) {
          store.clearFilter();
          if (store._nativeGetTotalCount) {
            store.getTotalCount = store._nativeGetTotalCount;
          }
        } else {
          store.clearFilter(true);
          store.filterBy((record) => {
            if (!record._apmSearchText) {
              record._apmSearchText = Object.values(record.data).map((v) => v !== null && v !== void 0 ? String(v).toLowerCase() : "").join(" ");
            }
            return keywords.some((k) => record._apmSearchText.includes(k));
          });
        }
      } finally {
        store.resumeEvents();
        if (view) view.refresh();
      }
      const endFilter = performance.now();
      const matchesCount = store.getCount();
      APMLogger.debug("Nametag", `Applied to '${ctx.grid.id}': ${matchesCount} matches in ${(endFilter - startFilter).toFixed(2)}ms`);
      const invalidate = APMApi.get("invalidateColorCodeCache");
      if (invalidate) {
        APMLogger.debug("Nametag", `Rendering pulse for '${ctx.grid.id}'`);
        invalidate(ctx.doc);
      }
      if (!store._apmCacheHook) {
        store.on("load", () => {
          store.each((r) => {
            delete r._apmSearchText;
          });
        });
        store.on("datachanged", () => {
          store.each((r) => {
            delete r._apmSearchText;
          });
        });
        store._apmCacheHook = true;
      }
      const count = store.getCount();
      store.getTotalCount = function() {
        return this.getCount();
      };
      forceFooterText(gridDom, count);
      if (view && !view.__apmFooterHook) {
        view.on("refresh", () => {
          const currentFilter = getActiveNametagFilter();
          if (currentFilter && ctx.grid && !ctx.grid.isDestroyed && ctx.grid.rendered) {
            try {
              const el2 = ctx.grid.getEl();
              if (el2 && el2.dom) {
                forceFooterText(el2.dom, ctx.grid.getStore().getCount());
              }
            } catch (e) {
              APMLogger.debug("Nametag", "Footer hook error:", e);
            }
          }
        });
        view.__apmFooterHook = true;
      }
      if (view && view.el) view.el.setScrollTop(0);
    } catch (err) {
      APMLogger.error("Nametag", "CRITICAL ERROR in applyNametagFilter:", err);
    }
  }

  // src/index.js
  init_labor_booker();
  APMLogger.debug("Boot", `APM script initializing in frame: ${window.location.pathname} (Top: ${AppContext.isTop})`);
  try {
    enforceTheme(mainWin, mainWin.document);
  } catch (e) {
    APMLogger.error("Boot", "Theme enforcement failed:", e);
  }
  try {
    MigrationManager.run();
    initializeGeneralSettings();
  } catch (e) {
    APMLogger.error("Boot", "Settings init failed:", e);
  } finally {
    BootManager.markReady("settings");
  }
  try {
    SessionMonitor.init();
  } catch (e) {
    APMLogger.error("Boot", "SessionMonitor init failed:", e);
  }
  try {
    UIManager.init();
  } catch (e) {
    APMLogger.error("Boot", "UIManager init failed:", e);
  }
  var { isEAM, isPTP, isLanding: isLandingPage } = AppContext;
  if (isEAM || isPTP || isLandingPage) {
    if (isPTP && FeatureFlags.isEnabled("ptpTimer")) initPtpSandbox();
    if (isEAM) {
      loadColorCodePrefs();
      cleanupStalePreviewRules();
      fullStyleUpdate();
      if (AppContext.isTop) {
        setTimeout(checkForGlobalUpdates, 1e4);
      }
      initMessageRouter();
      if (FeatureFlags.isEnabled("laborBooker")) {
        LaborBooker.init(mainWin);
      }
    }
    if (isEAM || isPTP) {
      if (FeatureFlags.isEnabled("colorCode")) {
        APMApi.register("applyNametagFilter", applyNametagFilter);
      }
      APMApi.register("Logger", APMLogger);
      APMApi.register("mainWin", mainWin);
    }
  }
  APMApi.register("closeAllPanels", (explicit) => UIManager.closeAll(explicit));
  APMApi.register("MigrationManager", MigrationManager);
  var handleGlobalClick = (e) => {
    if (e._apmHandled) return;
    let target = e.target;
    if (!target) return;
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
        e._apmHandled = true;
        const topWin = typeof mainWin !== "undefined" && mainWin.top ? mainWin.top : window.top;
        const currentGlobal = topWin.activeNametagFilter;
        const isAlreadyActive = currentGlobal === kw;
        const newFilter = isAlreadyActive ? "" : kw;
        APMLogger.debug("Core", `Nametag Click Logic: currentGlobal="${currentGlobal}", targetKw="${kw}", isAlreadyActive=${isAlreadyActive}, newFilter="${newFilter}"`);
        topWin.activeNametagFilter = newFilter;
        if (newFilter) {
          showToast(`Filter: ${newFilter} (Click to Clear)`, "var(--apm-success-bright)", true, () => {
            window.dispatchEvent(new CustomEvent("APM_CLEAR_FILTER"));
          });
        } else {
          clearPersistentToast();
          showToast("Filter Cleared", "var(--apm-text-disabled)");
        }
        const applyNametagFilterFn = APMApi.get("applyNametagFilter");
        if (typeof applyNametagFilterFn === "function") {
          applyNametagFilterFn(newFilter);
        }
        if (kw) {
          const msg = { type: "APM_SET_FILTER", kw: newFilter, sourceFrame: window.location.href };
          window.postMessage(msg, window.location.origin);
          document.querySelectorAll("iframe").forEach((f) => {
            try {
              f.contentWindow.postMessage(msg, window.location.origin);
            } catch (err) {
            }
          });
          if (window !== topWin) {
            topWin.postMessage(msg, window.location.origin);
          }
        }
      }
      return;
    }
    if (icon) {
      e.preventDefault();
      e.stopPropagation();
      const url2 = icon.getAttribute("data-wo-copy-url");
      APMLogger.debug("Core", `Icon click detected: ${url2}`);
      if (url2) {
        navigator.clipboard.writeText(url2).then(() => {
          icon.classList.add("apm-copy-success");
          setTimeout(() => icon.classList.remove("apm-copy-success"), 1500);
        }).catch(() => {
        });
      }
      return;
    }
  };
  APMApi.register("handleGlobalClick", handleGlobalClick);
  document.addEventListener("mousedown", APMApi.get("handleGlobalClick"), true);
  document.addEventListener("click", (e) => {
    if (e.target.closest?.(".apm-nametag") || e.target.closest?.(".apm-copy-icon")) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, true);
  var iframeObserver = null;
  var init = () => {
    if (!isEAM && !isPTP && !isLandingPage) return;
    if (!isLandingPage) {
      UIManager.registerPanel("apm-settings-panel", ["#apm-settings-ext-btn"]);
      UIManager.registerPanel("eam-forecast-panel", ["#apm-forecast-ext-btn"]);
      UIManager.registerPanel("apm-labor-panel", ["#apm-labor-trigger"]);
      UIManager.registerPanel("apm-colorcode-panel", [".apm-toolbar-btn", ".rain-cloud-hover"]);
      UIManager.registerPanel("apm-labor-popup", ["#apm-quick-book-btn"]);
    }
    initBootSequence(mainWin);
    if (iframeObserver) iframeObserver.disconnect();
    iframeObserver = new MutationObserver((mutations) => {
      const hasNewIframe = mutations.some((m) => Array.from(m.addedNodes).some((n) => n.nodeType === 1 && (n.tagName === "IFRAME" || n.querySelector && n.querySelector("iframe"))));
      if (hasNewIframe) {
        APMScheduler.runTaskNow("frame-sync-pulse");
      }
    });
    const startObservers = () => {
      if (document.body) iframeObserver.observe(document.body, { childList: true, subtree: true });
      BootManager.markReady("dom");
      APMScheduler.registerTask("frame-sync-pulse", 5e3, scanAndAttachFrames);
      APMScheduler.runTaskNow("frame-sync-pulse");
      if (AppContext.isTop) {
        APMScheduler.registerTask("ptp-status-check", 15e3, checkPtpStatus, { isIdle: true });
      }
    };
    if (document.body) {
      startObservers();
      processColorCodeGrid(document);
    } else {
      window.addEventListener("DOMContentLoaded", startObservers);
    }
    window.addEventListener("APM_CLEAR_FILTER", () => {
      mainWin.activeNametagFilter = "";
      const applyNametagFilterFn = APMApi.get("applyNametagFilter");
      if (typeof applyNametagFilterFn === "function") applyNametagFilterFn("");
      clearPersistentToast();
      showToast("Filter Cleared", "var(--apm-text-disabled)");
      const msg = { type: "APM_SET_FILTER", kw: "" };
      window.postMessage(msg, window.location.origin);
      document.querySelectorAll("iframe").forEach((f) => {
        try {
          f.contentWindow.postMessage(msg, window.location.origin);
        } catch (err) {
        }
      });
      const topWin = typeof mainWin !== "undefined" && mainWin.top ? mainWin.top : window.top;
      if (window !== topWin) topWin.postMessage(msg, window.location.origin);
    });
  };
  init();
})();
