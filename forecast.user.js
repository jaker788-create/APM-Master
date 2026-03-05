// ==UserScript==
// @name         APM Master: Forecast Tool
// @namespace    https://w.amazon.com/bin/view/Users/rosendah/APM-Master/
// @version      12.5.4
// @description  Powerful WO Forecast Tool & Native Quick Search Bar. Manual edits to this script are not recomended, this is actively supported tool so Slack me for any issues and I can push an update! If you edit you will not receive auto updates
// @author       Jacob Rosendahl & Thai Ho
// @icon         https://media.licdn.com/dms/image/v2/D5603AQGdCV0_LQKRfQ/profile-displayphoto-scale_100_100/B56ZyZLvQ5HgAg-/0/1772096519061?e=1773878400&v=beta&t=eWO1Jiy0-WbzG_yBv-SBrmmsVOPMexF57-q1Xh_VXCk
// @match        https://us1.eam.hxgnsmartcloud.com/*
// @match        https://eu1.eam.hxgnsmartcloud.com/*
// @updateURL    https://drive.corp.amazon.com/view/rosendah@/greasemonkey_scripts/APM-Master/forecast.user.js
// @downloadURL  https://drive.corp.amazon.com/view/rosendah@/greasemonkey_scripts/APM-Master/forecast.user.js
// @run-at       document-idle
// ==/UserScript==

/* --------------------------------------------------------------------------
   RECENT FEATURES & BUG FIXES:
   - v12.5.4 Feature: Added a manual start PTP timer based on the PTP tab context
   - v12.5.3 Optimize: Rewrote some legacy DOM checks and fixed wait functions with event driven ExtJS waits, even faster execution speed.
   - v12.5.2 Optimize: Rewrote the Forecast Button to natively inject itself into the toolbar and let the framework handle placement and rendering.
   - v12.5.1 Feature: The Labor Tally function introduced in v12.3 is now a universal & moveable edge tab that fetches booked labor in the backround with a native server request. (Was real interesting to implement). Added manager mode to save multiple aliases for search.
   - v12.4.0 Feature: The 3-Way PM filter introduced in v12.2 now directly modifies the ExtJS stores rather than visually hiding rows. Now it is functionally as if you are only looking at PMs only or Non PMs only, no hidden records.
   - v12.3.4 Feature: Added internal update check and in menu notice. Cleaned up UI with removal of "Ready" status message.
   - v12.3.3 Bug Fix: Fixed date format issue where systems would not be mm-dd-yyyy, added a date format override to conform with APM requirements always
   - v12.2.3 Bug Fix: UI Menu defocus events were getting trapped inside iframes, added native ExtJS listener for mouse events.
   - v12.2.1 Feature: When performing WO Search the dataspy is now changed to "All Work Orders" to ensure any searched WO will come up. When performing Forecast search it is set back to "Open Work Orders".
   - v12.1.3 Feature: Upgraded "Past Due" checkbox to a dynamic toggle button.
   - V12.1.1 Feature: Synced Relative dates to Custom Dates on switch.
   - v12.1.0 Feature: Merged native-blended "Quick Search" bar into the top header. Shares the high-speed engine for instant WO lookups.
   - v12.1.0 Feature: Added "Custom Dates" grid toggle to Forecast menu to replace week dropdown when specific dates are needed.
   - v12.0.0 Feature: Added "Simple Mode" toggle to the header. Hides Assigned, Shift, and Site Code fields for a cleaner interface.
   - v12.0.0 Feature: Site Code is now optional. Added "-- All Sites --" option to the dropdown.
   - v12.0.0 UI/UX: Reorganized "Today" button and "Include Past Due" into a shared container. Removed manual "Save" checkbox.
   - v11.9.3 Feature: Added Alt + C "Quick Clear" shortcut to wipe all search fields blank.
   - v11.9.3 Feature: Added integrated Help & Tips guide.
   - v11.9.1 Bug Fix: Implemented Strict Active Tab check to prevent script from being tricked by duplicate field names on other iframes.
   - v11.9.0 Bug/Stability Fix: Rewrote tab and menu navigation logic.
   - v11.5.2 Feature: Now exits from record view when a search is triggered.
   - v11.5.2 Stability: Optimized execution speed and aggressive cross-frame targeting.
   -------------------------------------------------------------------------- */

(function() {
    'use strict';

    // Wait for Ext to be available before applying the override
    var overrideDate = function() {
        if (typeof Ext !== 'undefined' && Ext.form && Ext.form.field && Ext.form.field.Date) {
            Ext.override(Ext.form.field.Date, {
                format: 'm/d/Y', // Forces MM/DD/YYYY
                altFormats: 'm/d/Y|n/j/Y|n/j/y|m/j/y|n/d/y|m/j/Y|n/d/Y|m-d-y|m-d-Y|m/d|m-d|md|mdy|mdY|d|Y-m-d|n-j|n/j'
            });
            console.log('APM-Master: Date format override applied.');
        } else {
            // Retry if Ext isn't ready yet
            setTimeout(overrideDate, 100);
        }
    };

    overrideDate();

    /** =========================
     * Engine Configuration
     * ========================= */
    const CONFIG = {
        respectUsability: true,
        afterFillDelayMs: 100,
        openMenuDelayMs: 80,
        runClickDelayMs: 80,
        retries: 6,
        retryDelayMs: 150
    };

    const STORAGE_KEY = 'eam_forecast_preferences_v12';
    let isStopped = false;
    let isRunning = false;

    // Site Data State
    let savedOrgs = [];
    let selectedOrg = '';

/** =========================
 * 3-Way PM Non-PM Filter (Native ExtJS Upgrade)
 * ========================= */
const ForecastFilter = (function() {
    let filterState = 0; // 0: All, 1: PMs, 2: Non-PMs
    let lastKnownStoreId = null;

    const TARGET_DATA_INDEX = 'duedate';
    const STATES = [
        { label: 'Filter: Show All', bg: '#7f8c8d' },
        { label: 'Filter: PMs Only', bg: '#1abc9c' },
        { label: 'Filter: Non-PMs', bg: '#3498db' }
    ];

    function getTargetContext() {
        const allWins = [window, ...Array.from(document.querySelectorAll('iframe')).map(f => f.contentWindow)];
        for (const win of allWins) {
            try {
                if (win.Ext && win.Ext.ComponentQuery) {
                    const grid = win.Ext.ComponentQuery.query('gridpanel').find(g =>
                        g.columns && g.columns.length > 20 && g.rendered && !g.isDestroyed
                    );
                    if (grid) return { win, doc: win.document, grid };
                }
            } catch (e) { continue; }
        }
        return null;
    }

    function updateFooterTextNatively(grid, count) {
        // EAM stores the "Records: X of Y" text in a specific toolbar text item
        // Find the docked bottom toolbar, then find the tbtext component
        const bbar = grid.getDockedItems('toolbar[dock="bottom"]')[0];
        if (bbar) {
            const textItem = bbar.down('tbtext');
            if (textItem) {
                // Suspend events briefly so we don't trigger layout recalculations multiple times
                textItem.suspendEvents();
                textItem.setText(`Records: ${count} of ${count}`);
                textItem.resumeEvents();
            }
        }
    }

    /** =========================
     * Main Filter Engine
     * ========================= */
    function applyStoreFilter() {
        const ctx = getTargetContext();
        if (!ctx) return;

        const { grid } = ctx;
        const store = grid.getStore();

        // Prevent infinite loops if EAM reloads the store
        store.suspendEvents();

        // 1. Restore native Total Count getter BEFORE doing anything else
        if (store._nativeGetTotalCount) {
            store.getTotalCount = store._nativeGetTotalCount;
        }

        // 2. Clear filters so the store retrieves all records
        store.clearFilter();

        if (filterState === 0) {
            const realCount = store.getCount();
            updateFooterTextNatively(grid, realCount);
            store.resumeEvents();
            grid.getView().refresh();
            return;
        }

        // 3. Apply Logical Filter
        store.filterBy((record) => {
            const val = record.get(TARGET_DATA_INDEX);
            const isBlank = (!val || val.toString().trim() === "" || val === null);
            return filterState === 1 ? !isBlank : isBlank;
        });

        const count = store.getCount();

        // 4. Override Native Total Count logic
        if (!store._nativeGetTotalCount) store._nativeGetTotalCount = store.getTotalCount;
        store.getTotalCount = function() { return count; };

        // 5. Update UI Natively
        updateFooterTextNatively(grid, count);

        store.resumeEvents();
        grid.getView().refresh(); // Force ExtJS to redraw the grid with the filtered data
        if (grid.view && grid.view.el) grid.view.el.setScrollTop(0);
    }

    function toggleGridFilter(btn) {
        filterState = (filterState + 1) % 3;
        btn.style.background = STATES[filterState].bg;
        btn.textContent = STATES[filterState].label;
        applyStoreFilter();
    }

    /**
     * Injection Loop
     */
    function injectForecastFilter() {
        const ctx = getTargetContext();
        if (!ctx) return;

        const { doc, grid } = ctx;
        const store = grid.getStore();

        // Re-apply filter if the underlying store changes (e.g. user clicked Run)
        if (filterState !== 0 && store.storeId !== lastKnownStoreId) {
            applyStoreFilter();
        }
        lastKnownStoreId = store.storeId;

        const dataspyInput = doc.querySelector('input[name="dataspylist"]');
        if (!dataspyInput || dataspyInput.offsetWidth === 0) return;

        const toolbarContainer = dataspyInput.closest('.x-box-target');
        if (!toolbarContainer || doc.getElementById('apm-list-pm-btn')) return;

        const btn = doc.createElement('button');
        btn.id = 'apm-list-pm-btn';
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
            setInterval(injectForecastFilter, 1500);
        }
    };
})();

ForecastFilter.init();

    /** =========================
     * Styles & Animations
     * ========================= */
    const style = document.createElement('style');
    style.innerHTML = `
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
        .thunder-overlay {
            position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
            z-index: 999998; pointer-events: none;
            animation: screen-thunder 0.8s ease-out forwards;
        }
        .center-lightning {
            position: fixed; top: 50%; left: 50%;
            z-index: 999999; pointer-events: none;
            animation: center-bolt-flash 0.8s ease-out forwards;
        }
        .raindrop, .lightning-bolt { opacity: 0; transform-box: fill-box; }
        .rain-cloud-always .raindrop, .rain-cloud-hover:hover .raindrop { animation-name: rain-fall; animation-timing-function: linear; animation-iteration-count: infinite; }
        .rain-cloud-always .lightning-bolt, .rain-cloud-hover:hover .lightning-bolt { animation: lightning-flash 3.5s infinite; }
        .drop-1 { animation-duration: 1.0s; animation-delay: 0.0s; }
        .drop-2 { animation-duration: 1.3s; animation-delay: 0.4s; }
        .drop-3 { animation-duration: 1.1s; animation-delay: 0.8s; }
        .drop-4 { animation-duration: 1.4s; animation-delay: 0.2s; }
        .drop-5 { animation-duration: 1.2s; animation-delay: 0.6s; }
        .drop-6 { animation-duration: 1.5s; animation-delay: 0.9s; }
        #eam-forecast-panel select, #eam-forecast-panel input { outline: none !important; }
        #eam-btn-close:hover { background: #e74c3c !important; }
        .org-btn { background: #4a5a6a; color: white; border: none; padding: 6px 10px; border-radius: 4px; cursor: pointer; font-weight: bold; font-size: 12px; transition: background 0.2s; }
        .org-btn:hover { background: #5c6d7e; }
        .org-btn-add:hover { background: #3498db !important; }
        .org-btn-rem:hover { background: #e74c3c !important; }

        /* Sliding Toggle Switch */
        .eam-slider-switch { position: relative; display: inline-block; width: 34px; height: 18px; margin: 0; flex-shrink: 0; }
        .eam-slider-switch input { opacity: 0; width: 0; height: 0; }
        .eam-slider-track { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(52, 152, 219, 0.2); transition: .3s; border-radius: 18px; border: 1px solid #3498db; }
        .eam-slider-track:before { position: absolute; content: ""; height: 12px; width: 12px; left: 2px; bottom: 2px; background-color: #3498db; transition: .3s; border-radius: 50%; }
        .eam-slider-switch input:checked + .eam-slider-track { background-color: #3498db; }
        .eam-slider-switch input:checked + .eam-slider-track:before { transform: translateX(16px); background-color: #ffffff; }
    `;
    document.head.appendChild(style);

    const SVG_CLOUD = `
        <svg viewBox="0 0 24 24" width="22" height="22" style="vertical-align: text-bottom; margin-bottom: 2px; overflow: visible;">
            <path class="lightning-bolt" d="M18,3 L5,16 L11,16 L7,26 L20,11 L13,11 Z" fill="#f1c40f"/>
            <path d="M17.5,18 C20,18 22,16 22,13.5 C22,11.2 20.3,9.3 18,9 C17.5,6.2 15,4 12,4 C8.7,4 6,6.7 6,10 C6,10.1 6,10.1 6,10.1 C3.8,10.3 2,12.2 2,14.5 C2,17 4,19 6.5,19 L17.5,18 Z" fill="currentColor"/>
            <path class="raindrop drop-1" d="M8,19 L7,23" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            <path class="raindrop drop-2" d="M12,20 L11,24" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            <path class="raindrop drop-3" d="M16,19 L15,23" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            <path class="raindrop drop-4" d="M10,18 L9,22" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            <path class="raindrop drop-5" d="M14,19 L13,23" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            <path class="raindrop drop-6" d="M18,18 L17,22" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
    `;

    /** =========================
     * Storage & State Logic
     * ========================= */
    function loadPreferences() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const prefs = JSON.parse(saved);

                if (prefs.orgs && Array.isArray(prefs.orgs)) {
                    savedOrgs = prefs.orgs.filter(o => o !== 'All Sites' && o !== '-- All Sites --' && o !== '');
                } else {
                    savedOrgs = [];
                }

                if (prefs.selectedOrg !== undefined && (prefs.selectedOrg === '' || savedOrgs.includes(prefs.selectedOrg))) {
                    selectedOrg = prefs.selectedOrg;
                } else {
                    selectedOrg = '';
                }

                return prefs;
            }
        } catch (e) { console.warn('[APM Forecast] Failed to load preferences:', e); }

        // Clean initial state
        savedOrgs = [];
        selectedOrg = '';
        return null;
    }

    function saveAllPreferences() {
        selectedOrg = document.getElementById('eam-org-select').value;
        let prefsToSave = { orgs: savedOrgs, selectedOrg: selectedOrg };

        prefsToSave.week = document.getElementById('eam-week-select').value;
        prefsToSave.days = Array.from(document.querySelectorAll('#eam-day-checkboxes input[type="checkbox"]')).map(cb => cb.dataset.explicit === "true");
        prefsToSave.assignedText = document.getElementById('eam-assigned-text').value.trim();
        prefsToSave.shiftText = document.getElementById('eam-shift-text').value.trim();
        prefsToSave.descOp = document.getElementById('eam-desc-op').value;
        prefsToSave.descText = document.getElementById('eam-desc-text').value.trim();

        const todayToggle = document.getElementById('eam-today-only-toggle');
        if (todayToggle) prefsToSave.todayOnly = todayToggle.checked;

        // Save Mode States
        const advSite = document.getElementById('eam-adv-site');
        const customDates = document.getElementById('eam-custom-dates');
        if (advSite) prefsToSave.isSimpleMode = advSite.style.display === 'none';
        if (customDates) prefsToSave.isCustomDateMode = customDates.style.display !== 'none';

        const custStart = document.getElementById('eam-custom-start');
        const custEnd = document.getElementById('eam-custom-end');
        if (custStart) prefsToSave.customStart = custStart.value;
        if (custEnd) prefsToSave.customEnd = custEnd.value;

        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(prefsToSave)); }
        catch(e) { console.error('[APM Forecast] Failed to save preferences:', e); }
    }

    function setStatus(mode, msg, color) {
        if (mode === 'quick') {
            const el = document.getElementById('apm-qs-status');
            if (el) {
                el.textContent = msg;
                if (color) { el.style.color = color; el.style.opacity = '1'; }
                else { el.style.color = ''; el.style.opacity = '0.7'; }
            }
        } else {
            const el = document.getElementById('eam-status');
            if (el) { el.textContent = msg; if (color) el.style.color = color; }
        }
    }

    function triggerThunderstrike() {
        const overlay = document.createElement('div'); overlay.className = 'thunder-overlay';
        const bolt = document.createElement('div'); bolt.className = 'center-lightning';
        bolt.innerHTML = `<svg viewBox="0 0 24 24" width="250" height="250"><path d="M18,3 L5,16 L11,16 L7,26 L20,11 L13,11 Z" fill="#f1c40f"/></svg>`;
        document.body.appendChild(overlay); document.body.appendChild(bolt);
        setTimeout(() => { if (overlay.parentNode) overlay.parentNode.removeChild(overlay); if (bolt.parentNode) bolt.parentNode.removeChild(bolt); }, 1000);
    }

    /** =========================
     * Date Logic By Thai Ho
     * ========================= */
function formatDate(d) {
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        return `${month}/${day}/${d.getFullYear()}`;
    }

    function getDateRange(weekValue, minDay, maxDay, isCumulative) {
        if (minDay === null || maxDay === null) return null;
        const val = parseInt(weekValue, 10);
        const now = new Date();
        const baseSunday = new Date(now); baseSunday.setDate(now.getDate() - now.getDay());

        let startOffset = isCumulative ? 0 : val * 7;
        let endOffset   = isCumulative ? val * 7 : val * 7;

        const startD = new Date(baseSunday); startD.setDate(baseSunday.getDate() + minDay + startOffset);
        const endD = new Date(baseSunday); endD.setDate(baseSunday.getDate() + maxDay + endOffset);

        return { start: formatDate(startD), end: formatDate(endD) };
    }

    /** =========================
     * GitHub Update Checker
     * ========================= */
    const FORECAST_VERSION = '12.5.4'; // MUST MATCH YOUR SCRIPT HEADER VERSION

    function isNewerVersion(oldVer, newVer) {
        const oldParts = oldVer.split('.').map(Number);
        const newParts = newVer.split('.').map(Number);
        for (let i = 0; i < Math.max(oldParts.length, newParts.length); i++) {
            const o = oldParts[i] || 0;
            const n = newParts[i] || 0;
            if (n > o) return true;
            if (n < o) return false;
        }
        return false;
    }

    function checkForUpdates() {
        if (window._eamForecastUpdateChecked) return;
        window._eamForecastUpdateChecked = true;

        fetch('https://raw.githubusercontent.com/jaker788-create/APM-Master/main/forecast.user.js')
            .then(response => response.text())
            .then(text => {
                const match = text.match(/\/\/\s*@version\s+([0-9\.]+)/);
                if (match && match[1]) {
                    const remoteVersion = match[1];
                    if (isNewerVersion(FORECAST_VERSION, remoteVersion)) {
                        const updateContainer = document.getElementById('eam-update-container');
                        if (updateContainer) updateContainer.style.display = 'block';
                        console.log(`[Forecast] Update available! Current: ${FORECAST_VERSION}, Remote: ${remoteVersion}`);
                    }
                }
            }).catch(e => console.warn('[Forecast] Update check failed silently.', e));
    }

    /** =========================
     * Quick Search Bar Builder (Stable DOM)
     * ========================= */
    function buildSearchUI() {
        if (window.self !== window.top) return;
        if (document.getElementById('apm-quick-search-container')) return;

        // Pull native styling to match the header
        const referenceBtn = document.querySelector('.x-btn-inner') || document.body;
        const computedStyle = window.getComputedStyle(referenceBtn);
        const nativeColor = computedStyle.color || '#d1d1d1';
        const nativeFont = computedStyle.fontFamily || 'sans-serif';

        const searchContainer = document.createElement('div');
        searchContainer.id = 'apm-quick-search-container';

        // Fix to the left side, bypassing ExtJS layout rules
        searchContainer.style.position = 'fixed';
        searchContainer.style.top = '0';
        searchContainer.style.left = '110px';
        searchContainer.style.height = '42px';
        searchContainer.style.display = 'flex';
        searchContainer.style.alignItems = 'center';
        searchContainer.style.gap = '8px';
        searchContainer.style.padding = '0 10px';
        searchContainer.style.zIndex = '99999';

        searchContainer.innerHTML = `
            <span style="color:${nativeColor}; font-family:${nativeFont}; font-weight:bold; font-size:13px; cursor:default; user-select:none; margin-right:2px;">Quick Search:</span>
            <input type="text" id="apm-qs-input" placeholder="WO Number..." style="width: 140px; font-family: monospace; font-weight: bold; height: 24px; padding: 0 6px; box-sizing: border-box; outline: none; background: #ffffff; color: #1e272e; border: 1px solid #bdc3c7; border-radius: 3px;">
            <a id="apm-qs-btn" style="cursor:pointer; display:flex; align-items:center; justify-content:center; padding:0 8px; height:24px; border-radius:3px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color:${nativeColor};">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </a>
            <span id="apm-qs-status" style="color:${nativeColor}; font-family:${nativeFont}; font-size:11px; opacity:0.7; width:80px; margin-left:5px; white-space:nowrap; user-select:none;"></span>
        `;

        document.body.appendChild(searchContainer);

        const btn = document.getElementById('apm-qs-btn');
        const input = document.getElementById('apm-qs-input');

        btn.onmouseover = function() { this.style.backgroundColor = 'rgba(255,255,255,0.2)'; };
        btn.onmouseout = function() { this.style.backgroundColor = 'rgba(255,255,255,0.1)'; };

        btn.onclick = () => { if (!isRunning) executeForecast('quick'); };
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                if (!isRunning) executeForecast('quick');
            }
        });
    }

    function buildForecastUI() {
        if (window.self !== window.top) return;

        let panel = document.getElementById('eam-forecast-panel');
        if (!panel) {
            panel = document.createElement('div');
            panel.id = 'eam-forecast-panel';
            panel.style = 'position:fixed; z-index:99999; padding:15px; background:#35404a; color:white; border:1px solid #2c353c; border-radius:8px; box-shadow: 0px 8px 25px rgba(0,0,0,0.6); font-family:sans-serif; width: 460px; display:none;';

            panel.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px; border-bottom: 1px solid #4a5a6a; padding-bottom: 10px;">
                    <div style="display:flex; align-items:center; gap:8px;">
                        <h4 style="margin:0; font-size:18px; color:#ffffff; font-weight: normal;">WO Forecast <span style="color:#1abc9c; font-weight: bold;">Tool</span></h4>
                        <div class="rain-cloud-always" style="color: #1abc9c; margin-top: -3px;">
                            ${SVG_CLOUD}
                        </div>
                    </div>
                    <div style="display:flex; align-items:center; gap:10px;">
                        <button id="eam-mode-toggle" style="background:#2b343c; color:#1abc9c; border:1px solid #1abc9c; padding: 4px 10px; border-radius:15px; cursor:pointer; font-size:11px; font-weight:bold; transition: all 0.2s;">Simple Mode 🍃</button>
                        <button id="eam-btn-close" style="background:#505f6e; color:#ffffff; border:none; padding: 4px 10px; border-radius:4px; cursor:pointer; font-size:14px; font-weight:bold; transition: background 0.2s;">✖</button>
                    </div>
                </div>

                <div id="eam-main-view">

                    <div id="eam-adv-site" style="display:none; flex-direction:column; gap:4px; margin-bottom:15px;">
                        <div style="display:flex; gap:5px; align-items:center;">
                            <label style="font-size:12px; color:#b0bec5; white-space:nowrap;">Site Code (Org):</label>
                            <select id="eam-org-select" style="flex-grow:1; padding:6px; border-radius:4px; border:none; background:#ecf0f1; color:#2c3e50; font-weight:bold; cursor:pointer; text-transform:uppercase;">
                                <option value="">-- All Sites --</option>
                            </select>
                            <button id="eam-add-org-btn" class="org-btn org-btn-add" title="Add New Site">+</button>
                            <button id="eam-rem-org-btn" class="org-btn org-btn-rem" title="Remove Selected Site">-</button>
                        </div>
                    </div>

                    <div style="display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:5px;">
                        <label style="font-size:12px; color:#b0bec5; font-weight:bold;">Date Range:</label>
                        <button id="eam-date-mode-toggle" style="background:transparent; color:#3498db; border:none; cursor:pointer; font-size:11px; text-decoration:underline; padding:0;">Switch to Custom Dates 📅</button>
                    </div>

                    <div id="eam-relative-dates">
                        <div style="display:flex; gap:15px; align-items:center; margin-bottom:10px;">
                            <label style="font-size:12px; color:#b0bec5; white-space:nowrap;">Target Week:</label>
                            <select id="eam-week-select" data-cumulative="false" style="flex-grow:1; padding:6px; border-radius:4px; border:none; background:#ecf0f1; color:#2c3e50; font-weight:bold; cursor:pointer;">
                                <option value="0">This Week</option>
                                <option value="1">Next Week</option>
                                <option value="2">2 Weeks From Now</option>
                                <option value="3">3 Weeks From Now</option>
                            </select>
                        </div>
                        <div id="eam-day-checkboxes" style="background:#2b343c; padding:10px; border-radius:6px; margin-bottom:15px; font-size:13px; display:flex; justify-content:space-between; align-items:center;">
                            <label style="cursor:pointer; display:flex; flex-direction:column; align-items:center; gap:4px;"><input type="checkbox" value="0"> Sun</label>
                            <label style="cursor:pointer; display:flex; flex-direction:column; align-items:center; gap:4px;"><input type="checkbox" value="1"> Mon</label>
                            <label style="cursor:pointer; display:flex; flex-direction:column; align-items:center; gap:4px;"><input type="checkbox" value="2"> Tue</label>
                            <label style="cursor:pointer; display:flex; flex-direction:column; align-items:center; gap:4px;"><input type="checkbox" value="3"> Wed</label>
                            <label style="cursor:pointer; display:flex; flex-direction:column; align-items:center; gap:4px;"><input type="checkbox" value="4"> Thu</label>
                            <label style="cursor:pointer; display:flex; flex-direction:column; align-items:center; gap:4px;"><input type="checkbox" value="5"> Fri</label>
                            <label style="cursor:pointer; display:flex; flex-direction:column; align-items:center; gap:4px;"><input type="checkbox" value="6"> Sat</label>
                        </div>
                    </div>

                    <div id="eam-custom-dates" style="display:none; background:#2b343c; padding:10px; border-radius:6px; margin-bottom:15px; gap:10px; flex-direction:column;">
                        <div style="display:flex; align-items:center; justify-content:space-between; gap:10px;">
                            <label style="font-size:12px; color:#b0bec5; width:40px;">From:</label>
                            <input type="date" id="eam-custom-start" style="flex-grow:1; padding:6px; border-radius:4px; border:none; background:#ecf0f1; color:#2c3e50; font-weight:bold; font-family:monospace; font-size:12px; cursor:pointer;">
                        </div>
                        <div style="display:flex; align-items:center; justify-content:space-between; gap:10px;">
                            <label style="font-size:12px; color:#b0bec5; width:40px;">To:</label>
                            <input type="date" id="eam-custom-end" style="flex-grow:1; padding:6px; border-radius:4px; border:none; background:#ecf0f1; color:#2c3e50; font-weight:bold; font-family:monospace; font-size:12px; cursor:pointer;">
                        </div>
                    </div>

                    <div id="eam-adv-assigned" style="display:none; gap:10px; margin-bottom:10px; align-items:center;">
                        <label style="font-size:12px; color:#b0bec5; white-space:nowrap;">Assigned:</label>
                        <input type="text" id="eam-assigned-text" placeholder="(Optional)" style="flex-grow:1; padding:6px; border-radius:4px; border:none; background:#ecf0f1; color:#2c3e50; text-transform:uppercase;">
                        <label style="font-size:12px; color:#b0bec5; white-space:nowrap; margin-left:5px;">Shift:</label>
                        <input type="text" id="eam-shift-text" placeholder="(Opt)" style="width:60px; padding:6px; border-radius:4px; border:none; background:#ecf0f1; color:#2c3e50; text-transform:uppercase;">
                    </div>

                    <div style="display:flex; gap:10px; margin-bottom:20px; align-items:center;">
                        <label style="font-size:12px; color:#b0bec5; white-space:nowrap;">Description:</label>
                        <select id="eam-desc-op" style="padding:6px; border-radius:4px; border:none; background:#ecf0f1; color:#2c3e50; font-weight:bold; cursor:pointer;">
                            <option value="Contains">Include</option>
                            <option value="Does Not Contain">Exclude</option>
                        </select>
                        <input type="text" id="eam-desc-text" placeholder="Keyword (Optional)..." style="flex-grow:1; padding:6px; border-radius:4px; border:none; background:#ecf0f1; color:#2c3e50;">
                    </div>

                    <div style="display:flex; justify-content:space-between; gap:15px;">
                        <button id="eam-btn-run" style="background:#1abc9c; color:white; border:none; padding:10px; border-radius:6px; cursor:pointer; font-weight:bold; flex: 1; font-size:14px; transition: background 0.2s;">Run Search</button>

                        <div style="display:flex; align-items:center; background: rgba(52, 152, 219, 0.15); border: 1px solid rgba(52, 152, 219, 0.4); border-radius:6px; padding: 4px 6px; gap:8px; flex: 0 0 auto;">

                            <label style="display:flex; align-items:center; gap:6px; cursor:pointer; margin:0;">
                                <div class="eam-slider-switch">
                                    <input type="checkbox" id="eam-today-only-toggle">
                                    <span class="eam-slider-track"></span>
                                </div>
                                <span id="eam-today-toggle-text" style="color:#3498db; font-size:11px; font-weight:bold; white-space:nowrap; user-select:none; margin-top:1px; width:105px; display:inline-block; text-align:left;">Includes Past Due</span>
                            </label>

                            <button id="eam-btn-today" style="background:#3498db; color:white; border:none; padding:8px 12px; border-radius:4px; cursor:pointer; font-weight:bold; font-size:14px; transition: background 0.2s;" title="Search Today (Alt + T)">Today</button>
                        </div>
                    </div>

                    <div style="display:flex; justify-content:space-between; align-items:center; font-size:11.5px; color:#95a5a6; margin-top:15px; border-top: 1px solid #4a5a6a; padding-top:10px;">
                        <button id="eam-help-btn" style="background:transparent; color:#3498db; border:none; padding: 0; cursor: pointer; font-size: 11.5px; text-decoration: underline;">ℹ️ Help & Tips</button>
                        <span>Shortcuts: <b style="color:#bdc3c7;">Alt + T</b> (Today) | <b style="color:#bdc3c7;">Alt + C</b> (Clear Grid)</span>
                    </div>
                </div>

                <div id="eam-guide-container" style="display:none; max-height: 400px; overflow-y: auto; padding-right: 6px;">
                    <p style="font-size: 12px; color: #bdc3c7; line-height: 1.4; margin-bottom: 10px;">The Forecast Tool eliminates the manual "click-and-wait" fatigue of filtering Work Orders. It automates navigation, grid expansion, and multi-field filtering into a single, lightning-fast action.</p>

                    <h4 style="color: #1abc9c; margin: 10px 0 5px 0; font-size: 13px;">1. Setting Your Parameters</h4>
                    <ul style="margin: 0 0 10px 0; padding-left: 20px; font-size: 12px; color: #bdc3c7; line-height: 1.4;">
                        <li><strong>Site Code (Org):</strong> Available in Advanced Mode. Select your site or leave blank to search all.</li>
                        <li><strong>Target Week & Days:</strong> Choose your week and click the days you want to filter, or swap to Custom Dates 📅 for absolute calendar picking.</li>
                        <li><strong>Today Modifier:</strong> Use the slider next to the 'Today' button to switch between "Today Only" (strict exact match) or "Includes Past Due" (pulls everything up to today).</li>
                    </ul>

                    <h4 style="color: #1abc9c; margin: 10px 0 5px 0; font-size: 13px;">2. Advanced Filters</h4>
                    <ul style="margin: 0 0 10px 0; padding-left: 20px; font-size: 12px; color: #bdc3c7; line-height: 1.4;">
                        <li>Use the <strong>Description</strong> field to narrow your results.</li>
                        <li><em>Tip:</em> The Description dropdown lets you choose whether a keyword should be Included (e.g., only show "13 Week") or Excluded (e.g., hide all "Daily").</li>
                    </ul>

                    <h4 style="color: #1abc9c; margin: 10px 0 5px 0; font-size: 13px;">3. Power User Shortcuts</h4>
                    <ul style="margin: 0 0 10px 0; padding-left: 20px; font-size: 12px; color: #bdc3c7; line-height: 1.4;">
                        <li><strong>Alt + T (Quick Today):</strong> The "Thunderbolt" shortcut. Press this anywhere in EAM to instantly run a search for Today's Work Orders.</li>
                        <li><strong>Alt + C (Quick Clear):</strong>This will instantly clear all search fields if you need to manually search something</li>
                    </ul>

<h4 style="color: #1abc9c; margin: 10px 0 5px 0; font-size: 13px;">4. Fast Booked Labor Check</h4>
                    <ul style="margin: 0 0 10px 0; padding-left: 20px; font-size: 12px; color: #bdc3c7; line-height: 1.4;">
                        <li>Use the floating "LABOR TALLY ⏱️" tab on the edge of your screen to instantly check your hours from anywhere in EAM. You can drag and snap it to any edge of your browser.</li>
                    </ul>
                    <div style="text-align:left; margin-top: 10px; border-top: 1px solid #4a5a6a; padding-top:10px;">
                        <button id="eam-guide-back-btn" style="background:transparent; color:#3498db; border:none; padding: 0; cursor: pointer; font-size: 11px; text-decoration: underline;">🔙 Back to Tool</button>
                    </div>
                </div>

                <div id="eam-status" style="margin-top:5px; font-size:12px; text-align:center; color:#b0bec5; font-weight:bold;"></div>

                <div id="eam-update-container" style="display:none; margin-top: 10px; text-align: center;">
                    <a href="https://raw.githubusercontent.com/jaker788-create/APM-Master/main/forecast.user.js" target="_blank" style="display:inline-block; background:#f39c12; color:white; padding:6px 12px; border-radius:4px; font-weight:bold; text-decoration:none; font-size:12px; transition: background 0.2s; box-shadow: 0 2px 5px rgba(0,0,0,0.2);">✨ Update Available</a>
                </div>
            `;
            document.body.appendChild(panel);

            document.getElementById('eam-btn-run').onmouseover = function() { this.style.backgroundColor = '#16a085'; };
            document.getElementById('eam-btn-run').onmouseout = function() { this.style.backgroundColor = '#1abc9c'; };
            document.getElementById('eam-btn-today').onmouseover = function() { this.style.backgroundColor = '#2980b9'; };
            document.getElementById('eam-btn-today').onmouseout = function() { this.style.backgroundColor = '#3498db'; };

            // Render Site Code Options
            const renderOrgs = () => {
                const select = document.getElementById('eam-org-select');
                if (!select) return;

                // Empty string acts as the visual and logical default
                select.innerHTML = '<option value="">-- All Sites --</option>';

                savedOrgs.forEach(org => {
                    const opt = document.createElement('option');
                    opt.value = org;
                    opt.textContent = org;
                    if (org === selectedOrg) opt.selected = true;
                    select.appendChild(opt);
                });

                select.value = selectedOrg || "";
            };

            const checkboxes = Array.from(panel.querySelectorAll('#eam-day-checkboxes input[type="checkbox"]'));


            function updateCheckboxVisuals() {
                const userChecked = checkboxes.filter(cb => cb.dataset.explicit === "true").map(cb => parseInt(cb.value, 10));
                const weekSelect = document.getElementById('eam-week-select');
                const prevVal = weekSelect.value;

                if (userChecked.length === 0) {
                    checkboxes.forEach(cb => { cb.checked = false; cb.disabled = false; cb.parentElement.style = 'color:white; opacity:1; cursor:pointer; display:flex; flex-direction:column; align-items:center; gap:4px;'; });
                    if (weekSelect.dataset.cumulative === "true") {
                        weekSelect.innerHTML = `<option value="0">This Week</option><option value="1">Next Week</option><option value="2">2 Weeks From Now</option><option value="3">3 Weeks From Now</option>`;
                        weekSelect.dataset.cumulative = "false";
                        weekSelect.value = prevVal;
                    }
                    return;
                }

                const min = Math.min(...userChecked), max = Math.max(...userChecked);
                const isAllDays = (min === 0 && max === 6);

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
                    const baseStyle = 'display:flex; flex-direction:column; align-items:center; gap:4px; ';
                    if (i === min || i === max) {
                        cb.checked = true; cb.disabled = false; cb.dataset.explicit = "true";
                        cb.parentElement.style = baseStyle + 'color:#1abc9c; opacity:1; cursor:pointer; font-weight:bold; text-shadow: 0 0 5px rgba(26,188,156,0.5);';
                    } else if (i > min && i < max) {
                        cb.checked = true; cb.disabled = true; cb.dataset.explicit = "false";
                        cb.parentElement.style = baseStyle + 'color:#7f8c8d; opacity:0.5; cursor:not-allowed; font-style:italic;';
                    } else {
                        cb.checked = false; cb.disabled = false; cb.dataset.explicit = "false";
                        cb.parentElement.style = baseStyle + 'color:white; opacity:1; cursor:pointer; font-weight:normal;';
                    }
                });
            }

            // Slider UI Logic
            const todayToggle = document.getElementById('eam-today-only-toggle');
            const todayToggleText = document.getElementById('eam-today-toggle-text');

            const updateTodayToggleUI = () => {
                if (todayToggle.checked) {
                    todayToggleText.textContent = 'Today Only';
                } else {
                    todayToggleText.textContent = 'Includes Past Due';
                }
            };

            todayToggle.addEventListener('change', () => {
                updateTodayToggleUI();
                saveAllPreferences();
            });

            // Always Load Prefs
            let weekToSet = "0";
            let isSimpleMode = true;
            let isCustomDateMode = false;

            const prefs = loadPreferences();
            if (prefs) {
                if (prefs.descOp) document.getElementById('eam-desc-op').value = prefs.descOp;
                if (prefs.descText !== undefined) document.getElementById('eam-desc-text').value = prefs.descText;
                if (prefs.assignedText !== undefined) document.getElementById('eam-assigned-text').value = prefs.assignedText;
                if (prefs.shiftText !== undefined) document.getElementById('eam-shift-text').value = prefs.shiftText;
                if (prefs.week) weekToSet = prefs.week;
                if (prefs.isSimpleMode !== undefined) isSimpleMode = prefs.isSimpleMode;
                if (prefs.todayOnly !== undefined) document.getElementById('eam-today-only-toggle').checked = prefs.todayOnly;

                if (prefs.isCustomDateMode !== undefined) isCustomDateMode = prefs.isCustomDateMode;
                if (prefs.customStart) document.getElementById('eam-custom-start').value = prefs.customStart;
                if (prefs.customEnd) document.getElementById('eam-custom-end').value = prefs.customEnd;

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
            document.getElementById('eam-week-select').value = weekToSet;

            // Date Mode Display Logic
            const dateModeBtn = document.getElementById('eam-date-mode-toggle');
            const relDates = document.getElementById('eam-relative-dates');
            const custDates = document.getElementById('eam-custom-dates');

            const updateDateModeDisplay = () => {
                if (isCustomDateMode) {
                    relDates.style.display = 'none';
                    custDates.style.display = 'flex';
                    dateModeBtn.innerHTML = 'Switch to Relative ⚡';
                } else {
                    relDates.style.display = 'block';
                    custDates.style.display = 'none';
                    dateModeBtn.innerHTML = 'Switch to Custom Dates 📅';
                }
            };
            updateDateModeDisplay();

            dateModeBtn.onclick = () => {
                isCustomDateMode = !isCustomDateMode;

                // Sync Relative dates to Custom Dates on switch
                if (isCustomDateMode) {
                    const weekSelect = document.getElementById('eam-week-select');
                    const isCumulative = weekSelect.dataset.cumulative === "true";
                    const userChecked = checkboxes.filter(cb => cb.dataset.explicit === "true").map(cb => parseInt(cb.value, 10));

                    if (userChecked.length > 0) {
                        const dates = getDateRange(weekSelect.value, Math.min(...userChecked), Math.max(...userChecked), isCumulative);
                        if (dates) {
                            const toYMD = (dStr) => {
                                const p = dStr.split('/');
                                return `${p[2]}-${p[0].padStart(2, '0')}-${p[1].padStart(2, '0')}`;
                            };
                            document.getElementById('eam-custom-start').value = toYMD(dates.start);
                            document.getElementById('eam-custom-end').value = toYMD(dates.end);
                        }
                    }
                }

                updateDateModeDisplay();
                saveAllPreferences();
            };

            // Simple Mode Display Logic
            const modeBtn = document.getElementById('eam-mode-toggle');
            const advSite = document.getElementById('eam-adv-site');
            const advAssigned = document.getElementById('eam-adv-assigned');

            const updateModeDisplay = () => {
                if (isSimpleMode) {
                    advSite.style.display = 'none';
                    advAssigned.style.display = 'none';
                    modeBtn.innerHTML = 'Simple Mode 🍃';
                    modeBtn.style.color = '#1abc9c';
                    modeBtn.style.borderColor = '#1abc9c';
                    modeBtn.style.background = '#2b343c';
                } else {
                    advSite.style.display = 'flex';
                    advAssigned.style.display = 'flex';
                    modeBtn.innerHTML = 'Advanced ⚙️';
                    modeBtn.style.color = '#e67e22';
                    modeBtn.style.borderColor = '#e67e22';
                    modeBtn.style.background = 'rgba(230, 126, 34, 0.1)';
                }
            };
            updateModeDisplay();

            modeBtn.onclick = () => {
                isSimpleMode = !isSimpleMode;
                updateModeDisplay();
                saveAllPreferences();
            };

            // Site Code Manager Buttons
            document.getElementById('eam-add-org-btn').onclick = () => {
                const newOrg = prompt('Enter new Site Code (Org):');

                if (newOrg && newOrg.trim()) {
                    const cleanOrg = newOrg.trim().toUpperCase();

                    if (cleanOrg === 'ALL SITES' || cleanOrg === '-- ALL SITES --') {
                        selectedOrg = '';
                    } else {
                        if (!savedOrgs.includes(cleanOrg)) {
                            savedOrgs.push(cleanOrg);
                        }
                        selectedOrg = cleanOrg;
                    }

                    renderOrgs();
                    saveAllPreferences();
                }
            };

            document.getElementById('eam-rem-org-btn').onclick = () => {
                const select = document.getElementById('eam-org-select');
                const current = select.value;

                if (!current) {
                    alert('Cannot remove the default "All Sites" option.');
                    return;
                }

                if (confirm(`Are you sure you want to remove ${current} from your list?`)) {
                    savedOrgs = savedOrgs.filter(o => o !== current);
                    selectedOrg = ''; // Reset to All Sites
                    renderOrgs();
                    saveAllPreferences();
                }
            };

            checkboxes.forEach(cb => { cb.addEventListener('change', (e) => { e.target.dataset.explicit = e.target.checked ? "true" : "false"; updateCheckboxVisuals(); }); });

            document.getElementById('eam-btn-close').onclick = () => {
                panel.style.display = 'none';
                document.getElementById('eam-main-view').style.display = 'block';
                document.getElementById('eam-guide-container').style.display = 'none';
            };

            document.getElementById('eam-help-btn').onclick = () => {
                document.getElementById('eam-main-view').style.display = 'none';
                document.getElementById('eam-guide-container').style.display = 'block';
            };

            document.getElementById('eam-guide-back-btn').onclick = () => {
                document.getElementById('eam-main-view').style.display = 'block';
                document.getElementById('eam-guide-container').style.display = 'none';
            };

            document.getElementById('eam-btn-run').onclick = () => { if (!isRunning) executeForecast('normal'); };
            document.getElementById('eam-btn-today').onclick = () => { if (!isRunning) executeForecast('today'); };

            const enterTriggerFields = ['eam-desc-text', 'eam-assigned-text', 'eam-shift-text'];
            enterTriggerFields.forEach(id => {
                document.getElementById(id).addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') { e.preventDefault(); if (!isRunning) executeForecast('normal'); }

                });
            });

            // Fire background update check
            checkForUpdates();
        }
    }

    /** =========================
     * Engine Utilities (Direct Control Of EAM ExtJS Framework)
     * ========================= */
    const delay = (ms) => new Promise(res => setTimeout(res, ms));

    function closeAllExtMenus() {
        const payloadId = 'apm-extjs-defocus-' + Date.now();
        const scriptContent = `
            (function() {
                try {
                    if (window.Ext && window.Ext.menu && window.Ext.menu.Manager) {
                        window.Ext.menu.Manager.hideAll();
                    } else if (window.Ext && window.Ext.ComponentQuery) {
                        var menus = window.Ext.ComponentQuery.query('menu[hidden=false]');
                        if (menus) { menus.forEach(function(m) { if (m.hide) m.hide(); }); }
                    }
                } catch(e) {}
            })();
        `;
        const scriptEl = document.createElement('script');
        scriptEl.id = payloadId;
        scriptEl.textContent = scriptContent;
        document.head.appendChild(scriptEl);
        setTimeout(() => scriptEl.remove(), 100);
    }

    async function returnToListView() {
        const payloadId = 'apm-extjs-listview-' + Date.now();
        const scriptContent = `
            (function() {
                try {
                    // 1. Find the WSJOBS iframe Ext context
                    var targetExt = window.Ext;
                    var frames = document.querySelectorAll('iframe');
                    for (var i=0; i<frames.length; i++) {
                        if (frames[i].src && frames[i].src.includes('SYSTEM_FUNCTION_NAME=WSJOBS')) {
                            if (frames[i].contentWindow && frames[i].contentWindow.Ext) {
                                targetExt = frames[i].contentWindow.Ext;
                                break;
                            }
                        }
                    }
                    if (!targetExt || !targetExt.ComponentQuery) return;

                    // 2. Query ExtJS memory for common "Expand" buttons or "List View" tabs
                    var queries = [
                        'button[cls~=uftid-collapseright]',
                        'button[tooltip*="Expand Right"]',
                        'button[tooltip*="Alt+Right"]',
                        'tab[text="List View"]',
                        'button[ariaLabel="List View"]'
                    ];

                    for (var q=0; q<queries.length; q++) {
                        var elements = targetExt.ComponentQuery.query(queries[q]);
                        for (var j=0; j<elements.length; j++) {
                            var el = elements[j];
                            // Skip if ExtJS knows it is currently hidden from the user
                            if (el.hidden || (el.isHidden && el.isHidden())) continue;

                            // Execute natively
                            if (el.handler) {
                                el.handler.call(el.scope || el, el);
                                return;
                            } else if (el.isTab) {
                                var tabPanel = el.up('tabpanel');
                                if (tabPanel) tabPanel.setActiveTab(el);
                                else el.fireEvent('click', el);
                                return;
                            } else {
                                el.fireEvent('click', el);
                                return;
                            }
                        }
                    }
                } catch(e) { console.warn('APM List View Error:', e); }
            })();
        `;
        const scriptEl = document.createElement('script');
        scriptEl.id = payloadId;
        scriptEl.textContent = scriptContent;
        document.head.appendChild(scriptEl);
        setTimeout(() => scriptEl.remove(), 100);

        await delay(150); // Allow framework animation to finish
    }

    function getEAMModules() {
        const frames = document.querySelectorAll('iframe');
        const modules = [];
        frames.forEach(f => {
            const src = f.getAttribute('src');
            if (!src || !src.split('?')[1]) return;
            const urlParams = new URLSearchParams(src.split('?')[1]);
            if (urlParams.get('SYSTEM_FUNCTION_NAME')) {
                modules.push({ document: f.contentDocument || f.contentWindow.document, sysFunction: urlParams.get('SYSTEM_FUNCTION_NAME') });
            }
        });
        return modules;
    }

function isGridReady() {
        const allWins = [window, ...Array.from(document.querySelectorAll('iframe')).map(f => f.contentWindow)];
        for (const win of allWins) {
            try {
                if (win.Ext && win.Ext.ComponentQuery) {
                    const grid = win.Ext.ComponentQuery.query('gridpanel').find(g =>
                        g.columns && g.columns.length > 20 && g.rendered && !g.isDestroyed
                    );
                    // Check if grid exists, is rendered, and its store has finished its initial load
                    if (grid && grid.getStore() && !grid.getStore().isLoading()) {
                        return true;
                    }
                }
            } catch (e) { continue; }
        }
        return false;
    }

async function navigateTo(tabText, menuPathArray) {
        const payloadId = 'apm-extjs-nav-' + Date.now();
        const scriptContent = `
            (function() {
                try {
                    if (!window.Ext || !window.Ext.ComponentQuery) return;

                    // 1. FAST PATH (Native Tab Switch)
                    var tabs = window.Ext.ComponentQuery.query('tab');
                    var targetTab = null;
                    for (var i=0; i<tabs.length; i++) {
                        // Use indexOf instead of exact match to account for EAM formatting
                        if (tabs[i].text && tabs[i].text.indexOf("${tabText}") > -1) {
                            targetTab = tabs[i];
                            break;
                        }
                    }

                    if (targetTab) {
                        // Force a native DOM click on the Ext component to trigger EAM's routing
                        if (targetTab.el && targetTab.el.dom) {
                            targetTab.el.dom.click();
                        } else {
                            targetTab.fireEvent('click', targetTab);
                        }
                        return;
                    }

                    // 2. COLD START PATH
                    var paths = ${JSON.stringify(menuPathArray)};
                    if (paths.length === 2) {
                        var btns = window.Ext.ComponentQuery.query('button');
                        var topBtn = null;
                        for (var j=0; j<btns.length; j++) {
                            if (btns[j].text && btns[j].text.indexOf(paths[0]) > -1 && btns[j].showMenu) {
                                topBtn = btns[j];
                                break;
                            }
                        }

                        if (topBtn) {
                            topBtn.showMenu(); // Lazy Load trigger

                            setTimeout(function() {
                                var menuItems = window.Ext.ComponentQuery.query('menuitem');
                                var childItem = null;
                                for (var k=0; k<menuItems.length; k++) {
                                    if (menuItems[k].text && menuItems[k].text.indexOf(paths[1]) > -1) {
                                        childItem = menuItems[k];
                                        break;
                                    }
                                }

                                if (childItem) {
                                    if (childItem.handler) {
                                        childItem.handler.call(childItem.scope || childItem, childItem);
                                    } else if (childItem.el && childItem.el.dom) {
                                        childItem.el.dom.click();
                                    } else {
                                        childItem.fireEvent('click', childItem);
                                    }
                                }

                                // Clean up menus AFTER the click fires
                                if (window.Ext.menu && window.Ext.menu.Manager) {
                                    window.Ext.menu.Manager.hideAll();
                                }
                            }, 150);
                        }
                    }
                } catch(e) { console.error('APM ExtJS Nav Error:', e); }
            })();
        `;
        const scriptEl = document.createElement('script');
        scriptEl.id = payloadId;
        scriptEl.textContent = scriptContent;
        document.head.appendChild(scriptEl);
        setTimeout(() => scriptEl.remove(), 100);

        return true;
    }

/** =========================
     * Direct ExtJS API Bridge (Event-Driven)
     * ========================= */
    function applyForecastFiltersExtJS(filterData) {
        const payloadId = 'apm-extjs-payload-' + Date.now();
        const scriptContent = `
            (function() {
                try {
                    var attempts = 0;
                    var maxAttempts = 40;

                    function executeEngine() {
                        attempts++;
                        var targetExt = window.Ext;
                        var frames = document.querySelectorAll('iframe');
                        var foundFrame = false;

                        for (var i=0; i<frames.length; i++) {
                            if (frames[i].src && frames[i].src.includes('SYSTEM_FUNCTION_NAME=WSJOBS')) {
                                if (frames[i].contentWindow && frames[i].contentWindow.Ext) {
                                    targetExt = frames[i].contentWindow.Ext;
                                    foundFrame = true;
                                    break;
                                }
                            }
                        }

                        if (!foundFrame || !targetExt || !targetExt.ComponentQuery) {
                            if (attempts < maxAttempts) setTimeout(executeEngine, 250);
                            return;
                        }

                        // Ensure form fields are actually rendered before proceeding
                        var orgFields = targetExt.ComponentQuery.query('[name=ff_organization]');
                        if (!orgFields || orgFields.length === 0) {
                            if (attempts < maxAttempts) setTimeout(executeEngine, 250);
                            return;
                        }

                        var data = ${JSON.stringify(filterData)};
                        var needsAjaxWait = false;

                        // 1. Change Dataspy (Dynamic Target)
                        if (!data.isClearMode) {
                            var targetDataspyName = data.isWoSearch ? 'All Work Orders' : 'Open Work Orders';
                            var combos = targetExt.ComponentQuery.query('combobox');
                            for (var c = 0; c < combos.length; c++) {
                                var combo = combos[c];
                                var store = combo.getStore && combo.getStore();
                                if (store && combo.displayField) {
                                    var targetRecord = store.findRecord(combo.displayField, targetDataspyName, 0, false, false, true);
                                    if (targetRecord) {
                                        var rawId = targetRecord.get(combo.valueField);
                                        if (typeof rawId === 'object' && rawId !== null) rawId = rawId.id || rawId.value;

                                        var currentVal = combo.getValue();
                                        if (typeof currentVal === 'object' && currentVal !== null) currentVal = currentVal.id || currentVal.value;

                                        if (String(currentVal) !== String(rawId)) {
                                            combo.setValue(rawId);
                                            combo.fireEvent('select', combo, targetRecord);
                                            needsAjaxWait = true;
                                            break;
                                        }
                                    }
                                }
                            }
                        }

                        function applyFiltersAndRun() {
                            function setExtField(nameAttr, value, operatorClass) {
                                if (value === undefined || value === null) return;
                                var fields = targetExt.ComponentQuery.query('[name=' + nameAttr + ']:not([destroyed=true])');
                                if (!fields || fields.length === 0) return;

                                var cmp = fields[0];
                                if (value === '') {
                                    cmp.setValue('');
                                    cmp.fireEvent('change', cmp, '');
                                    cmp.fireEvent('blur', cmp);
                                    return;
                                }

                                cmp.setValue(value);
                                cmp.fireEvent('change', cmp, value);
                                cmp.fireEvent('blur', cmp);

                                if (operatorClass) {
                                    var el = cmp.getEl();
                                    var triggerBtnEl = null;
                                    var parentWrap = el.up('.x-box-inner') || el.up('.x-column-header-inner') || el.up('.x-container');

                                    if (parentWrap) {
                                        triggerBtnEl = parentWrap.down('.uft-id-btnfilteroperator') || parentWrap.down('.x-btn-icon-el-gridfilter-small');
                                        if (triggerBtnEl && triggerBtnEl.hasCls('x-btn-icon-el-gridfilter-small')) {
                                            triggerBtnEl = triggerBtnEl.up('.x-btn');
                                        }
                                    }

                                    if (triggerBtnEl) {
                                        var opBtnCmp = targetExt.getCmp(triggerBtnEl.id);
                                        if (opBtnCmp && opBtnCmp.menu) {
                                            var menuItem = opBtnCmp.menu.items.items.find(function(item) {
                                                return item.iconCls === operatorClass;
                                            });
                                            if (menuItem) {
                                                if (menuItem.handler) menuItem.handler.call(menuItem.scope || menuItem, menuItem);
                                                else menuItem.fireEvent('click', menuItem);
                                            }
                                        }
                                    }
                                }
                            }

                            var topFilterFields = targetExt.ComponentQuery.query('[name=selfiltervaluectrl]:not([destroyed=true])');
                            if (topFilterFields && topFilterFields.length > 0) {
                                topFilterFields[0].setValue('');
                                topFilterFields[0].fireEvent('change', topFilterFields[0], '');
                                topFilterFields[0].fireEvent('blur', topFilterFields[0]);
                            }

                            setExtField('ff_organization', data.org, 'fo_con');
                            setExtField('ff_workordernum', data.woNum, 'fo_con');
                            setExtField('ff_description', data.desc, data.descOpClass);
                            setExtField('ff_assignedto', data.assigned, 'fo_con');
                            setExtField('ff_shift', data.shift, 'fo_con');
                            setExtField('ff_schedstartdate', data.start, data.startOpClass);
                            setExtField('ff_schedenddate', data.end, data.endOpClass);

                            if (data.isWoSearch) {
                                setExtField('ff_status', '', 'fo_con');
                            }

                            if (!data.isClearMode) {
                                var runBtns = targetExt.ComponentQuery.query('button[text=Run]:not([destroyed=true])');
                                if (runBtns && runBtns.length > 0) {
                                    var runBtn = runBtns[0];
                                    if (runBtn.handler) runBtn.handler.call(runBtn.scope || runBtn, runBtn);
                                    else runBtn.fireEvent('click', runBtn);
                                }
                            }
                        }

                        // 3. Native Event-Driven Execution (Replaces the Polling Loop)
                        if (needsAjaxWait) {
                            var ajaxListener = function() {
                                // Once the network goes quiet, unbind to prevent memory leaks
                                if (!targetExt.Ajax.isLoading()) {
                                    targetExt.Ajax.un('requestcomplete', ajaxListener);
                                    targetExt.Ajax.un('requestexception', ajaxListener);

                                    // Give ExtJS a tiny 150ms buffer to physically draw the new text boxes
                                    setTimeout(applyFiltersAndRun, 150);
                                }
                            };

                            // Bind directly to the ExtJS global Ajax queue
                            targetExt.Ajax.on('requestcomplete', ajaxListener);
                            targetExt.Ajax.on('requestexception', ajaxListener);

                            // Failsafe timeout in case the request finished instantaneously
                            setTimeout(function() {
                                targetExt.Ajax.un('requestcomplete', ajaxListener);
                                targetExt.Ajax.un('requestexception', ajaxListener);
                                applyFiltersAndRun();
                            }, 4000);
                        } else {
                            applyFiltersAndRun();
                        }
                    }

                    executeEngine();
                } catch(e) { console.error('APM ExtJS Execution Error:', e); }
            })();
        `;
        const scriptEl = document.createElement('script');
        scriptEl.id = payloadId;
        scriptEl.textContent = scriptContent;
        document.head.appendChild(scriptEl);
        setTimeout(() => scriptEl.remove(), 100);
    }

    /** =========================
     * Labor Tracker Module (Omni-Edge & Manager Mode)
     * ========================= */
    const LaborTracker = (function() {
        if (window.self !== window.top) return { init: function() {} };

        let laborCache = { data: [], lastFetch: 0 };
        let activeTab = 7;
        let isFetching = false;

        // Manager Mode State
        let savedEmployees = JSON.parse(localStorage.getItem('apmLaborSavedEmps') || '[]');
        let selectedEmployee = localStorage.getItem('apmLaborActiveEmp') || '';

        function extractEamIdAggressive() {
            const uuidPattern = /([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/i;
            if (window.EAM && window.EAM.AppData && window.EAM.AppData.eamid) return window.EAM.AppData.eamid;
            const cookieMatch = document.cookie.match(new RegExp(`eamid=${uuidPattern.source}`, 'i'));
            if (cookieMatch) return cookieMatch[1];
            const pageHTML = document.documentElement.innerHTML;
            const htmlMatch = pageHTML.match(new RegExp(`eamid["'=:%&?]+${uuidPattern.source}`, 'i'));
            if (htmlMatch) return htmlMatch[1];
            const frames = document.querySelectorAll('iframe');
            for (let f of frames) {
                if (f.src) {
                    const srcMatch = f.src.match(new RegExp(`eamid=${uuidPattern.source}`, 'i'));
                    if (srcMatch) return srcMatch[1];
                }
            }
            return null;
        }

function extractEmployeeId() {
            // Check native EAM context first
            if (window.EAM && window.EAM.Context && window.EAM.Context.employee) {
                return window.EAM.Context.employee.toUpperCase();
            }
            // Check EAM AppData as backup
            if (window.EAM && window.EAM.AppData && window.EAM.AppData.employee) {
                return window.EAM.AppData.employee.toUpperCase();
            }
            console.warn("[Labor Tracker] No active user found in framework.");
            return "";
        }

        async function fetchLaborData() {
            if (Date.now() - laborCache.lastFetch < 900000 && laborCache.data.length > 0) {
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

            // Inject Manager Mode Target
            const currentUser = extractEmployeeId();
            const targetEmployee = selectedEmployee ? selectedEmployee : currentUser;

            const payload = new URLSearchParams({
                GRID_ID: "1742", GRID_NAME: "WSBOOK_HDR", DATASPY_ID: "100696",
                USER_FUNCTION_NAME: "WSBOOK", SYSTEM_FUNCTION_NAME: "WSBOOK",
                CURRENT_TAB_NAME: "HDR", COMPONENT_INFO_TYPE: "DATA_ONLY",
                employee: targetEmployee, tenant: currentTenant, eamid: currentEamId,
                NUMBER_OF_ROWS_FIRST_RETURNED: "5000"
            });

            try {
                const response = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8', 'X-Requested-With': 'XMLHttpRequest' },
                    body: payload.toString()
                });

                const text = await response.text();
                if (text.trim().startsWith('<') || text.includes('System Error')) {
                    updateUIState("Server Rejected");
                    isFetching = false;
                    return;
                }

                const jsonStart = text.indexOf('{');
                if (jsonStart === -1) throw new Error("No JSON found");

                const dataObj = JSON.parse(text.substring(jsonStart));
                laborCache.data = dataObj?.pageData?.grid?.GRIDRESULT?.GRID?.DATA || [];
                laborCache.lastFetch = Date.now();

            } catch (err) {
                updateUIState("Data Error");
            } finally {
                isFetching = false;
                updateUIState();
            }
        }

        function calculateLabor(daysParam) {
            const now = new Date();
            now.setHours(0, 0, 0, 0);
            let total = 0;
            let breakdown = {};

            laborCache.data.forEach(r => {
                const rDate = new Date(r.datework);
                rDate.setHours(0, 0, 0, 0);
                const diffDays = Math.floor((now - rDate) / (1000 * 3600 * 24));
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
            const sel = document.getElementById('apm-labor-emp-select');
            const lbl = document.getElementById('apm-labor-target-label');
            if (!sel || !lbl) return;

            sel.innerHTML = '<option value="">-- Self --</option>';
            savedEmployees.forEach(emp => {
                const opt = document.createElement('option');
                opt.value = emp;
                opt.textContent = emp;
                if (emp === selectedEmployee) opt.selected = true;
                sel.appendChild(opt);
            });

            lbl.textContent = 'Target: ' + (selectedEmployee || 'Self');
        }

        function injectUI() {
            if (document.getElementById('apm-labor-trigger')) return;

            const style = document.createElement('style');
            style.innerHTML = `
                #apm-labor-trigger { position: fixed; background: #3498db; color: white; padding: 10px; cursor: pointer; font-weight: bold; font-size: 12px; z-index: 2147483647; box-shadow: 0 0 10px rgba(0,0,0,0.5); transition: background 0.2s; user-select: none; display: flex; align-items: center; justify-content: center; white-space: nowrap; }
                #apm-labor-trigger:hover { background: #2980b9; }
                #apm-labor-panel { position: fixed; width: 260px; background: #35404a; border: 1px solid #4a5a6a; border-radius: 8px; padding: 15px; z-index: 2147483646; transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1); display: flex; flex-direction: column; box-shadow: 0 0 20px rgba(0,0,0,0.6); }
                .labor-tabs { display: flex; gap: 2px; background: #2b343c; border-radius: 4px; overflow: hidden; margin-bottom: 15px; }
                .labor-tab { flex: 1; padding: 8px; text-align: center; font-size: 11px; cursor: pointer; color: #b0bec5; font-weight: bold; transition: 0.2s; user-select: none; }
                .labor-tab.active { background: #3498db; color: white; }
                .labor-total { font-size: 32px; font-weight: bold; text-align: center; margin: 10px 0; color: #ecf0f1; }
                .labor-row { display: flex; justify-content: space-between; padding: 6px 10px; border-bottom: 1px solid #4a5a6a; font-size: 12px; color: #bdc3c7; }
            `;
            document.head.appendChild(style);

            const trigger = document.createElement('div');
            trigger.id = 'apm-labor-trigger';
            trigger.innerHTML = "LABOR TALLY ⏱️";

            const panel = document.createElement('div');
            panel.id = 'apm-labor-panel';
            panel.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 8px;">
                    <span style="font-size:11px; color:#bdc3c7; font-weight:bold;" id="apm-labor-target-label">Target: Self</span>
                    <button id="apm-labor-mgr-toggle" style="background:transparent; color:#3498db; border:none; padding:0; cursor:pointer; font-size:10px; text-decoration:underline;">Manager Mode ⚙️</button>
                </div>
                <div id="apm-labor-mgr-panel" style="display:none; background:#2b343c; padding:8px; border-radius:4px; margin-bottom:10px; gap:6px; flex-direction:column;">
                    <div style="display:flex; gap:6px;">
                        <select id="apm-labor-emp-select" style="flex-grow:1; padding:4px; border-radius:3px; border:none; background:#ecf0f1; color:#2c3e50; font-size:11px; font-weight:bold; cursor:pointer; text-transform:uppercase;">
                        </select>
                        <button id="apm-labor-emp-add" style="background:#3498db; color:white; border:none; padding:4px 8px; border-radius:3px; cursor:pointer; font-weight:bold;" title="Add User">+</button>
                        <button id="apm-labor-emp-rem" style="background:#e74c3c; color:white; border:none; padding:4px 8px; border-radius:3px; cursor:pointer; font-weight:bold;" title="Remove User">-</button>
                    </div>
                </div>

                <div class="labor-tabs">
                    <div class="labor-tab" data-d="1">Today</div>
                    <div class="labor-tab" data-d="2">2-Day</div>
                    <div class="labor-tab active" data-d="7">7-Day</div>
                </div>
                <div id="labor-sum-box" class="labor-total">0.00 <span style="font-size:14px; color:#7f8c8d;">hrs</span></div>
                <div id="labor-breakdown-box" style="max-height: 200px; overflow-y: auto;"></div>
                <button id="labor-force-refresh" style="margin-top:15px; background:#4a5a6a; color:white; border:none; padding:8px; border-radius:4px; cursor:pointer; font-size:11px; transition: background 0.2s;">Refresh from Server</button>
            `;

            document.body.appendChild(trigger);
            document.body.appendChild(panel);

            renderEmpSelect();

            let dockInfo = JSON.parse(localStorage.getItem('apmLaborDockPos') || '{"edge":"right","pos":300}');
            let isVisible = false;

            function applyDocking() {
                let maxPos = (dockInfo.edge === 'top' || dockInfo.edge === 'bottom') ? window.innerWidth : window.innerHeight;
                dockInfo.pos = Math.max(30, Math.min(maxPos - 30, dockInfo.pos));

                trigger.style.left = trigger.style.right = trigger.style.top = trigger.style.bottom = '';
                panel.style.left = panel.style.right = panel.style.top = panel.style.bottom = '';
                trigger.style.transition = 'background 0.2s, transform 0.2s ease-out';
                trigger.style.writingMode = trigger.style.textOrientation = '';

                const offset = '34px';

                if (dockInfo.edge === 'right') {
                    trigger.style.right = '0'; trigger.style.top = dockInfo.pos + 'px'; trigger.style.transform = 'translateY(-50%)'; trigger.style.writingMode = 'vertical-rl'; trigger.style.borderRadius = '8px 0 0 8px';
                    panel.style.right = offset; panel.style.top = dockInfo.pos + 'px'; panel.style.transform = isVisible ? 'translate(0%, -50%)' : 'translate(calc(100% + 50px), -50%)';
                }
                else if (dockInfo.edge === 'left') {
                    trigger.style.left = '0'; trigger.style.top = dockInfo.pos + 'px'; trigger.style.transform = 'translateY(-50%)'; trigger.style.writingMode = 'vertical-lr'; trigger.style.textOrientation = 'mixed'; trigger.style.borderRadius = '0 8px 8px 0';
                    panel.style.left = offset; panel.style.top = dockInfo.pos + 'px'; panel.style.transform = isVisible ? 'translate(0%, -50%)' : 'translate(calc(-100% - 50px), -50%)';
                }
                else if (dockInfo.edge === 'top') {
                    trigger.style.top = '0'; trigger.style.left = dockInfo.pos + 'px'; trigger.style.transform = 'translateX(-50%)'; trigger.style.borderRadius = '0 0 8px 8px';
                    panel.style.top = offset; panel.style.left = dockInfo.pos + 'px'; panel.style.transform = isVisible ? 'translate(-50%, 0%)' : 'translate(-50%, calc(-100% - 50px))';
                }
                else if (dockInfo.edge === 'bottom') {
                    trigger.style.bottom = '0'; trigger.style.left = dockInfo.pos + 'px'; trigger.style.transform = 'translateX(-50%)'; trigger.style.borderRadius = '8px 8px 0 0';
                    panel.style.bottom = offset; panel.style.left = dockInfo.pos + 'px'; panel.style.transform = isVisible ? 'translate(-50%, 0%)' : 'translate(-50%, calc(100% + 50px))';
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
                        trigger.style.transition = 'none';
                        if (isVisible) { isVisible = false; applyDocking(); }
                    }
                    if (isDragging) {
                        trigger.style.right = trigger.style.bottom = 'auto';
                        trigger.style.left = (moveEvent.clientX - offsetX) + 'px';
                        trigger.style.top = (moveEvent.clientY - offsetY) + 'px';
                        trigger.style.transform = 'none';
                    }
                };

                const onMouseUp = (upEvent) => {
                    document.removeEventListener('mousemove', onMouseMove);
                    document.removeEventListener('mouseup', onMouseUp);

                    if (isDragging) {
                        let cx = upEvent.clientX, cy = upEvent.clientY, w = window.innerWidth, h = window.innerHeight;
                        let distTop = cy, distBottom = h - cy, distLeft = cx, distRight = w - cx;
                        let min = Math.min(distTop, distBottom, distLeft, distRight);

                        if (min === distRight) { dockInfo.edge = 'right'; dockInfo.pos = cy; }
                        else if (min === distLeft) { dockInfo.edge = 'left'; dockInfo.pos = cy; }
                        else if (min === distTop) { dockInfo.edge = 'top'; dockInfo.pos = cx; }
                        else { dockInfo.edge = 'bottom'; dockInfo.pos = cx; }

                        localStorage.setItem('apmLaborDockPos', JSON.stringify(dockInfo));
                        applyDocking();
                    } else {
                        isVisible = !wasVisible;
                        applyDocking();
                        if (isVisible) {
                            // Force cache invalidation every time the panel is opened
                            laborCache.lastFetch = 0;
                            fetchLaborData();
                        }
                    }
                };
                document.addEventListener('mousemove', onMouseMove);
                document.addEventListener('mouseup', onMouseUp);
            };

            // Manager Mode Events
            document.getElementById('apm-labor-mgr-toggle').onclick = () => {
                const p = document.getElementById('apm-labor-mgr-panel');
                p.style.display = p.style.display === 'none' ? 'flex' : 'none';
            };

            document.getElementById('apm-labor-emp-add').onclick = () => {
                const alias = prompt("Enter employee alias (e.g. ROSENDAH):");
                if (alias && alias.trim()) {
                    const cleanAlias = alias.trim().toUpperCase();
                    if (!savedEmployees.includes(cleanAlias)) {
                        savedEmployees.push(cleanAlias);
                        localStorage.setItem('apmLaborSavedEmps', JSON.stringify(savedEmployees));
                    }
                    selectedEmployee = cleanAlias;
                    localStorage.setItem('apmLaborActiveEmp', selectedEmployee);
                    renderEmpSelect();
                    laborCache.lastFetch = 0; // Invalidate cache
                    fetchLaborData();
                }
            };

            document.getElementById('apm-labor-emp-rem').onclick = () => {
                if (!selectedEmployee) return;
                if (confirm("Remove " + selectedEmployee + " from saved list?")) {
                    savedEmployees = savedEmployees.filter(e => e !== selectedEmployee);
                    localStorage.setItem('apmLaborSavedEmps', JSON.stringify(savedEmployees));
                    selectedEmployee = '';
                    localStorage.setItem('apmLaborActiveEmp', selectedEmployee);
                    renderEmpSelect();
                    laborCache.lastFetch = 0; // Invalidate cache
                    fetchLaborData();
                }
            };

            document.getElementById('apm-labor-emp-select').onchange = (e) => {
                selectedEmployee = e.target.value;
                localStorage.setItem('apmLaborActiveEmp', selectedEmployee);
                renderEmpSelect();
                laborCache.lastFetch = 0; // Invalidate cache for new user
                fetchLaborData();
            };

            // Close on outside click
            document.addEventListener('mousedown', (e) => {
                if (isVisible && !panel.contains(e.target) && !trigger.contains(e.target)) {
                    isVisible = false;
                    applyDocking();
                }
            });

            panel.querySelectorAll('.labor-tab').forEach(t => t.onclick = (e) => {
                panel.querySelectorAll('.labor-tab').forEach(x => x.classList.remove('active'));
                e.target.classList.add('active');
                activeTab = parseInt(e.target.getAttribute('data-d'));
                if (!isFetching) updateUIState();
            });

            document.getElementById('labor-force-refresh').onclick = () => {
                laborCache.lastFetch = 0;
                fetchLaborData();
            };

            window.addEventListener('resize', () => applyDocking());
        }

        function updateUIState(errorMsg = null) {
            const sumBox = document.getElementById('labor-sum-box');
            const list = document.getElementById('labor-breakdown-box');

            if (errorMsg) {
                sumBox.innerHTML = `<span style="font-size:16px; color:#e74c3c;">${errorMsg}</span>`;
                if (errorMsg === "Loading...") sumBox.innerHTML = `<span style="font-size:16px; color:#f39c12;">${errorMsg}</span>`;
                list.innerHTML = '';
                return;
            }

            const { total, breakdown } = calculateLabor(activeTab);
            sumBox.innerHTML = `${total.toFixed(2)} <span style="font-size:14px; color:#7f8c8d;">hrs</span>`;

            list.innerHTML = '';
            const sortedDates = Object.keys(breakdown).sort((a,b) => new Date(b) - new Date(a));

            if (sortedDates.length === 0) {
                list.innerHTML = '<div style="text-align:center; padding:10px; color:#7f8c8d; font-size:12px;">No labor records found.</div>';
            } else {
                sortedDates.forEach(d => {
                    const row = document.createElement('div');
                    row.className = 'labor-row';
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

/** =========================
     * Master Flow Logic
     * ========================= */
    async function executeForecast(mode = 'normal') {
        if (window.self !== window.top) return;

        // 1. SPAM-CLICK & CRASH GUARD
        if (isRunning) return;
        try {
            if (window.Ext && window.Ext.Ajax && window.Ext.Ajax.isLoading()) {
                setStatus(mode, 'EAM busy... please wait.', '#f1c40f');
                return;
            }
        } catch(e) {}

        let orgText = '', dates = { start: '', end: '' }, assignedText = '', shiftText = '', descText = '', descOp = 'Contains', quickSearchText = '';

        if (mode === 'quick') {
            quickSearchText = document.getElementById('apm-qs-input').value.trim();
            if (!quickSearchText) { setStatus(mode, 'Enter WO.', '#e74c3c'); return; }
        } else if (mode === 'clear') {
            // Leave empty
        } else if (mode === 'today') {
            const todayFormatted = formatDate(new Date());
            dates = { start: todayFormatted, end: todayFormatted };
            orgText = document.getElementById('eam-org-select').value.trim().toUpperCase();
        } else {
            const isCustomDateMode = document.getElementById('eam-custom-dates').style.display !== 'none';
            if (isCustomDateMode) {
                const startVal = document.getElementById('eam-custom-start').value;
                const endVal = document.getElementById('eam-custom-end').value;
                const formatHtmlDate = (dStr) => { if (!dStr) return ''; const p = dStr.split('-'); return p.length === 3 ? p[1] + '/' + p[2] + '/' + p[0] : ''; };
                dates = { start: formatHtmlDate(startVal), end: formatHtmlDate(endVal) };
                if (!dates.start && !dates.end) { setStatus(mode, 'Select date range.', '#e74c3c'); return; }
            } else {
                const weekSelectEl = document.getElementById('eam-week-select');
                const weekOffset = weekSelectEl.value;
                const isCumulative = weekSelectEl.dataset.cumulative === "true";
                const checkboxesList = Array.from(document.querySelectorAll('#eam-day-checkboxes input[type="checkbox"]'));
                const userChecked = checkboxesList.filter(cb => cb.dataset.explicit === "true").map(cb => parseInt(cb.value, 10));
                if (userChecked.length === 0) { setStatus(mode, 'Select a day.', '#e74c3c'); return; }
                dates = getDateRange(weekOffset, Math.min(...userChecked), Math.max(...userChecked), isCumulative);
            }
            assignedText = document.getElementById('eam-assigned-text').value.trim();
            shiftText = document.getElementById('eam-shift-text').value.trim();
            descText = document.getElementById('eam-desc-text').value.trim();
            descOp = document.getElementById('eam-desc-op').value;
            // Captures the "" if All Sites is selected, or "DWA2" if a site is picked
            orgText = document.getElementById('eam-org-select').value.trim().toUpperCase();
        }

        isRunning = true;
        isStopped = false;

        if (mode !== 'quick') saveAllPreferences();

        const panel = document.getElementById('eam-forecast-panel');
        if (panel) panel.style.display = 'none';

        if (mode === 'quick') setStatus(mode, 'Jumping...', '#3498db');
        else if (mode === 'clear') setStatus(mode, 'Clearing...', '#f1c40f');
        else triggerThunderstrike();

        // 1. Native Tab Jump or Menu Build
        await navigateTo('Work Orders', ['Work', 'Work Orders']);

        // 2. Poll for Grid Readiness
        setStatus(mode, 'Expanding...', '#f1c40f');
        let gridFound = false;
        for (let i = 0; i < 40; i++) {
            if (isGridReady()) { gridFound = true; break; }
            await delay(250);
        }

        if (!gridFound) {
            setStatus(mode, 'Grid timeout.', '#e74c3c');
            isRunning = false;
            return;
        }

        // Expand to List View natively
        await returnToListView();

        setStatus(mode, mode === 'clear' ? 'Wiping Fields...' : 'Injecting API...', '#f1c40f');

    /** =========================
     * Configuration Logic
     * ========================= */
        const todayOnlyCheckbox = document.getElementById('eam-today-only-toggle');
        const isTodayOnly = todayOnlyCheckbox && todayOnlyCheckbox.checked;

        const effectiveStartDate = dates.start || dates.end;
        const effectiveEndDate = dates.end || dates.start;
        const isSingleDay = (effectiveStartDate === effectiveEndDate);

        let startOpClass = 'fo_con';
        let endOpClass = 'fo_con';

        if (mode !== 'quick' && mode !== 'clear') {
            if (isSingleDay) {
                startOpClass = isTodayOnly ? 'fo_eq' : 'fo_lte';
            } else {
                startOpClass = 'fo_gte';
                endOpClass = 'fo_lte';
            }
        }
    /** =========================
     * ExtJS Payload Construction
     * ========================= */
        const extjsFilterData = {
            isClearMode: mode === 'clear',
            isWoSearch: mode === 'quick', // Flags the payload to change the Dataspy
            org: (mode === 'quick' || mode === 'clear') ? '' : orgText,
            woNum: (mode === 'quick') ? quickSearchText : (mode === 'clear' ? '' : null),
            desc: (mode === 'quick' || mode === 'clear') ? '' : descText,
            descOpClass: descOp === 'Contains' ? 'fo_con' : 'fo_dncon',
            assigned: (mode === 'quick' || mode === 'clear') ? '' : assignedText,
            shift: (mode === 'quick' || mode === 'clear') ? '' : shiftText,
            start: (mode === 'quick' || mode === 'clear') ? '' : effectiveStartDate,
            startOpClass: startOpClass,
            end: (mode === 'quick' || mode === 'clear' || isSingleDay) ? '' : effectiveEndDate,
            endOpClass: endOpClass
        };

        // 3. Fire Native Filter Execution
        applyForecastFiltersExtJS(extjsFilterData);

        if (mode === 'clear') {
            setStatus(mode, '', '#1abc9c');
        } else {
            setStatus(mode, '', '#18bc9c');
            if (mode === 'quick') document.getElementById('apm-qs-input').value = '';
        }

        isRunning = false;
    }

    /** =========================
     * Native ExtJS Toggle Button Injector
     * ========================= */
    function injectToggleBtnNatively() {
        if (window.self !== window.top) return;

        // 1. Establish Event Listeners (Once)
        if (!window._apmForecastToggleBound) {
            window._apmForecastToggleBound = true;

            // Handle panel toggle triggered from inside the ExtJS Sandbox
            window.addEventListener('APM_TOGGLE_FORECAST', (e) => {
                const panel = document.getElementById('eam-forecast-panel');
                if (!panel) return;

                if (panel.style.display === 'none' || panel.style.display === '') {
                    panel.style.top = (e.detail.bottom + 6) + 'px';

                    // Center the 460px wide panel under the button
                    const panelWidth = 460;
                    let targetLeft = e.detail.left + (e.detail.width / 2) - (panelWidth / 2);

                    // Boundary Checks to prevent clipping off screen
                    const screenWidth = window.innerWidth;
                    if (targetLeft + panelWidth > screenWidth - 20) {
                        targetLeft = screenWidth - panelWidth - 20;
                    }
                    if (targetLeft < 20) targetLeft = 20;

                    panel.style.left = targetLeft + 'px';
                    panel.style.display = 'block';
                } else {
                    panel.style.display = 'none';
                }
            });

            // Defocus: Click outside to close (Top Window)
            const hidePanel = (e) => {
                const panel = document.getElementById('eam-forecast-panel');
                const isClickOnBtn = e && e.target && (e.target.closest('#apm-forecast-ext-btn') || e.target.closest('#eam-forecast-toggle'));

                if (panel && panel.style.display === 'block' && (!e || (!panel.contains(e.target) && !isClickOnBtn))) {
                    panel.style.display = 'none';
                }
            };
            document.addEventListener('mousedown', hidePanel, true);

            // Defocus: Click inside iframes to close
            setInterval(() => {
                document.querySelectorAll('iframe').forEach(f => {
                    try {
                        const fWin = f.contentWindow;
                        if (fWin && !fWin.__apm_forecast_defocus) {
                            if (fWin.Ext && fWin.Ext.getDoc) fWin.Ext.getDoc().on('mousedown', hidePanel);
                            else if (fWin.document) fWin.document.addEventListener('mousedown', hidePanel, true);
                            fWin.__apm_forecast_defocus = true;
                        }
                    } catch(err) {}
                });
            }, 1500);
        }

        // 2. Inject Native Ext Component Payload
        const payloadId = 'apm-extjs-inject-btn-' + Date.now();
        const scriptContent = `
            (function() {
                try {
                    if (!window.Ext || !window.Ext.ComponentQuery) return;
                    if (window.Ext.getCmp('apm-forecast-ext-btn')) return;

                    var rawBtns = document.querySelectorAll('.x-btn-mainmenuButton-toolbar-small');
                    if (rawBtns.length === 0) return;

                    var visibleBtns = [];
                    for (var i = 0; i < rawBtns.length; i++) {
                        if (rawBtns[i].offsetWidth > 0) visibleBtns.push(rawBtns[i]);
                    }
                    if (visibleBtns.length === 0) return;

                    var lastDomBtn = visibleBtns[visibleBtns.length - 1];
                    var extEl = lastDomBtn.closest('.x-btn') || lastDomBtn;
                    if (!extEl || !extEl.id) return;

                    var extCmp = window.Ext.getCmp(extEl.id);
                    if (!extCmp) return;

                    var parentContainer = extCmp.up('toolbar') || extCmp.up('container');
                    if (!parentContainer) return;

                    var insertIndex = parentContainer.items.indexOf(extCmp) + 1;

                    parentContainer.insert(insertIndex, {
                        xtype: 'button',
                        id: 'apm-forecast-ext-btn',
                        ui: 'plain',
                        margin: '0 0 0 12',
                        html: '<div id="eam-forecast-toggle" class="rain-cloud-hover" style="display:flex; align-items:center; font-family:sans-serif; font-size:13px; font-weight:600; color:#d1d1d1; transition:color 0.15s; cursor:pointer;"><span style="margin-right:6px;">Forecast</span><svg viewBox="0 0 24 24" width="22" height="22" style="vertical-align: text-bottom; margin-bottom: 2px; overflow: visible;"><path class="lightning-bolt" d="M18,3 L5,16 L11,16 L7,26 L20,11 L13,11 Z" fill="#f1c40f"/><path d="M17.5,18 C20,18 22,16 22,13.5 C22,11.2 20.3,9.3 18,9 C17.5,6.2 15,4 12,4 C8.7,4 6,6.7 6,10 C6,10.1 6,10.1 6,10.1 C3.8,10.3 2,12.2 2,14.5 C2,17 4,19 6.5,19 L17.5,18 Z" fill="currentColor"/><path class="raindrop drop-1" d="M8,19 L7,23" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path class="raindrop drop-2" d="M12,20 L11,24" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path class="raindrop drop-3" d="M16,19 L15,23" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path class="raindrop drop-4" d="M10,18 L9,22" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path class="raindrop drop-5" d="M14,19 L13,23" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path class="raindrop drop-6" d="M18,18 L17,22" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg></div>',
                        listeners: {
                            el: {
                                mouseenter: function() { var inner = document.getElementById('eam-forecast-toggle'); if (inner) inner.style.color = '#ffffff'; },
                                mouseleave: function() { var inner = document.getElementById('eam-forecast-toggle'); if (inner) inner.style.color = '#d1d1d1'; }
                            }
                        },
                        handler: function(btn) {
                            var el = btn.getEl();
                            // Package up the width of the button so the UI knows how to center itself
                            window.dispatchEvent(new CustomEvent('APM_TOGGLE_FORECAST', {
                                detail: { left: el.getX(), bottom: el.getY() + el.getHeight(), width: el.getWidth() }
                            }));
                        }
                    });
                } catch(e) { console.error('APM Native Button Injection Error:', e); }
            })();
        `;
        const scriptEl = document.createElement('script');
        scriptEl.id = payloadId;
        scriptEl.textContent = scriptContent;
        document.head.appendChild(scriptEl);
        setTimeout(() => scriptEl.remove(), 100);
    }

    /** =========================
     * Hotkey Routing Logic
     * ========================= */
    window.addEventListener('keydown', (e) => {
        if (e.altKey && e.key.toLowerCase() === 't') {
            e.preventDefault();
            if (window.self !== window.top) window.parent.postMessage({ type: 'APM_RUN_TODAY_FORECAST' }, '*');
            else if (!isRunning) executeForecast('today');
        }
        if (e.altKey && e.key.toLowerCase() === 'c') {
            e.preventDefault();
            if (window.self !== window.top) window.parent.postMessage({ type: 'APM_RUN_CLEAR_FORECAST' }, '*');
            else if (!isRunning) executeForecast('clear');
        }
    }, true);

    if (window.self === window.top) {
        window.addEventListener('message', (e) => {
            if (e.data && e.data.type === 'APM_RUN_TODAY_FORECAST') {
                if (!isRunning) executeForecast('today');
            }
            if (e.data && e.data.type === 'APM_RUN_CLEAR_FORECAST') {
                if (!isRunning) executeForecast('clear');
            }
        });
    }

    /** =========================
     * PTP Timer Engine (Manual Start)
     * ========================= */
    let ptpSeconds = 120;

    function initPtpTimerUI() {
        let timerUI = document.getElementById('apm-ptp-timer');
        if (!timerUI) {
            timerUI = document.createElement('div');
            timerUI.id = 'apm-ptp-timer';
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
                    <span style="font-size:12px; text-transform:uppercase; opacity:0.9; letter-spacing:0.5px; color:#f1c40f;">▶ Start PTP Timer</span>
                    <span id="apm-ptp-time" style="font-family:monospace; font-size:20px; opacity:0.5;">02:00</span>
                </div>
                <div id="apm-ptp-close" style="cursor:pointer; font-size:14px; opacity:0.5; padding-left:4px; transition:opacity 0.2s;" title="Dismiss Timer">✖</div>
            `;
            timerUI.style.background = '#34495e';
            timerUI.style.borderColor = '#2c3e50';

            document.getElementById('apm-ptp-start-btn').onclick = startPtpCountdown;
        }

        // Close logic
        const closeBtn = document.getElementById('apm-ptp-close');
        closeBtn.onmouseover = function() { this.style.opacity = '1'; };
        closeBtn.onmouseout = function() { this.style.opacity = '0.5'; };
        closeBtn.onclick = () => {
            timerUI.style.display = 'none';
            if (window._ptpInterval) clearInterval(window._ptpInterval);
            window._ptpTimerRunning = false;
            window._ptpDismissed = true;
        };

        return timerUI;
    }

    function startPtpCountdown() {
        window._ptpTimerRunning = true;
        ptpSeconds = 120;

        const timerUI = document.getElementById('apm-ptp-timer');
        timerUI.style.background = '#e74c3c';
        timerUI.style.borderColor = '#c0392b';

        timerUI.innerHTML = `
            <div style="display:flex; align-items:baseline; gap:8px;">
                <span style="font-size:12px; text-transform:uppercase; opacity:0.9; letter-spacing:0.5px;">PTP Timer:</span>
                <span id="apm-ptp-time" style="font-family:monospace; font-size:20px;">02:00</span>
            </div>
            <div id="apm-ptp-close" style="cursor:pointer; font-size:14px; opacity:0.7; padding-left:4px; transition:opacity 0.2s;" title="Dismiss Timer">✖</div>
        `;

        const closeBtn = document.getElementById('apm-ptp-close');
        closeBtn.onmouseover = function() { this.style.opacity = '1'; };
        closeBtn.onmouseout = function() { this.style.opacity = '0.7'; };
        closeBtn.onclick = () => {
            timerUI.style.display = 'none';
            clearInterval(window._ptpInterval);
            window._ptpTimerRunning = false;
            window._ptpDismissed = true;
        };

        if (window._ptpInterval) clearInterval(window._ptpInterval);

        window._ptpInterval = setInterval(() => {
            ptpSeconds--;
            const timeEl = document.getElementById('apm-ptp-time');
            if (!timeEl) return;

            if (ptpSeconds <= 0) {
                clearInterval(window._ptpInterval);
                timeEl.textContent = "READY";
                timerUI.style.background = '#2ecc71';
                timerUI.style.borderColor = '#27ae60';
            } else {
                const mins = Math.floor(ptpSeconds / 60);
                const secs = ptpSeconds % 60;
                timeEl.textContent = `0${mins}:${secs < 10 ? '0' : ''}${secs}`;
            }
        }, 1000);
    }

    function checkPtpStatus() {
        if (window.self !== window.top) return;

        let isPtpVisible = false;
        const allDocs = [document, ...Array.from(document.querySelectorAll('iframe')).map(f => f.contentDocument).filter(Boolean)];

        for (const doc of allDocs) {
            const activeTabs = doc.querySelectorAll('.x-tab-active .x-tab-inner, .x-tab-active .x-tab-text');
            for (let i = 0; i < activeTabs.length; i++) {
                if (activeTabs[i].textContent.trim().toUpperCase().includes('PTP')) {
                    isPtpVisible = true;
                    break;
                }
            }
            if (isPtpVisible) break;
        }

        const timerUI = document.getElementById('apm-ptp-timer');

        if (isPtpVisible) {
            if (!window._ptpDismissed) {
                const ui = initPtpTimerUI();
                if (ui.style.display === 'none') ui.style.display = 'flex';
            }
        } else {
            if (timerUI && timerUI.style.display !== 'none') timerUI.style.display = 'none';
            if (window._ptpTimerRunning || window._ptpDismissed) {
                clearInterval(window._ptpInterval);
                window._ptpTimerRunning = false;
                window._ptpDismissed = false;
            }
        }
    }

/** =========================
     * Unified Tool Initialization
     * ========================= */
    let initTO;
    const observer = new MutationObserver(() => {
        clearTimeout(initTO);
        initTO = setTimeout(() => {
            buildForecastUI();
            injectToggleBtnNatively();
            buildSearchUI();
            checkPtpStatus(); // Immediate check on DOM changes
        }, 150);
    });
    observer.observe(document.body, { childList: true, subtree: true });

    // Initial Startup & Heartbeat
    setTimeout(() => {
        buildForecastUI();
        injectToggleBtnNatively();
        buildSearchUI();
        LaborTracker.init();

        // Establish heartbeat for PTP timer and persistent UI checks
        setInterval(() => {
            checkPtpStatus();
        }, 1500);
    }, 1500);

})();