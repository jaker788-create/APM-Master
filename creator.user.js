// ==UserScript==
// @name         APM Master: WO Creator & Auto-Fill + Tab Re-Order
// @namespace    https://w.amazon.com/bin/view/Users/rosendah/APM-Master/
// @version      0.8.3
// @description  WO Cretion, Auto-Fill Engine, and LOTO Checklist Automation.
// @author       Jacob Rosendahl
// @icon         https://media.licdn.com/dms/image/v2/D5603AQGdCV0_LQKRfQ/profile-displayphoto-scale_100_100/B56ZyZLvQ5HgAg-/0/1772096519061?e=1773878400&v=beta&t=eWO1Jiy0-WbzG_yBv-SBrmmsVOPMexF57-q1Xh_VXCk
// @match        https://us1.eam.hxgnsmartcloud.com/*
// @match        https://eu1.eam.hxgnsmartcloud.com/*
// @updateURL    https://drive.corp.amazon.com/view/rosendah@/greasemonkey_scripts/APM-Master/creator.user.js
// @downloadURL  https://drive.corp.amazon.com/view/rosendah@/greasemonkey_scripts/APM-Master/creator.user.js
// @run-at       document-idle
// @grant        none
// ==/UserScript==

/* --------------------------------------------------------------------------
   RECENT FEATURES & BUG FIXES:
   - v0.8.3 Optimize: Refined UI & wording for clarity. Signifigantly improved checklist performance and context awareness, will no longer hang on an unexpected tab and auto nav to the right checklist do minimal waiting.
   - v0.8.1 Bug Fix: Fixed some security catch errors.
   - v0.8.0 Optimize: Replaced fixed Ajax waits with native ExtJS event listeners for faster execution of autofilling. Signifigantly shrunk and simplified Menu UI.
   - v0.7.3 Optimize: Removed WO Creator function as it diddn't have that much purpose.
   - v0.7.2: Feature: Added update notice in UI, added dynamic resizing with browser window scale, added help & tips.
   - v0.6.14 Bug Fix: Removed problematic defocus logic.
   - v0.6.13 Bug Fix: Abandoned the "run-once" tagging for a continuous audit loop. The script now monitors physical tab positions every 1.5s and snaps them back if EAM's AJAX updates revert the layout.
   - v0.6.10 Feature: Menu will close if you click away.
   - v0.6.9 Feature: UI improvements.
   - v0.6.8 Feature: Can fill out 1-tech & 10-tech.
   - v0.6.0 Added ability to reorder WO list view tabs.
   - v0.5.2 This is getting big... Record creaton fills out the first page sucessfully via ExtJS calls.
   - v0.4.0 Engine Overhaul: Replaced all UI simulated clicks/typing with Native ExtJS Form Injection, Store Modification, and Ajax requests for Headless execution.
   - v0.3.10 Feature: Addded status message timeout of 8 seconds. Updated UI dropdown defaults from "-- None --" to "-- Skip --".
   -------------------------------------------------------------------------- */

(function() {
    'use strict';

    // --- CLONE KILLER: Prevent execution inside EAM iframes ---
    if (window.self !== window.top) return;

    const CONFIG = {
        afterFillDelayMs: 200,
        // ... rest of your script ...
        searchLoadDelayMs: 1500,
        tabLoadDelayMs: 3000,
        retries: 10,
        retryDelayMs: 200
    };

    let isRunning = false;
    let activeTab = 'autofill';

    /** =========================
     * Data Management
     * ========================= */
    let presets = {
        autofill: {},
        config: {
            columnOrder: 'workordernum, description, equipment, organization, workorderstatus, workordertype, assignedto',
            tabOrder: ''
        }
    };

    function loadPresets() {
        try {
            const stored = localStorage.getItem('apm_presets_v1');
            if (stored) {
                const parsed = JSON.parse(stored);
                presets.autofill = parsed.autofill || {};
                presets.config = parsed.config || presets.config;
                if (!presets.config.tabOrder) presets.config.tabOrder = '';
            }
        } catch (e) {}
    }

    function savePresets() {
        localStorage.setItem('apm_presets_v1', JSON.stringify(presets));
    }

    function getCurrentFormData() {
        const rawPm = document.getElementById('apm-c-pm-checks').value.trim();
        const pmParsed = rawPm === '' ? '' : parseInt(rawPm, 10);

        return {
            keyword: document.getElementById('apm-c-keyword')?.value.trim() || '',
            org: document.getElementById('apm-c-org').value.trim().toUpperCase(),
            eq: document.getElementById('apm-c-eq').value.trim().toUpperCase(),
            type: document.getElementById('apm-c-type').value,
            status: document.getElementById('apm-c-status').value,
            exec: document.getElementById('apm-c-exec').value,
            safety: document.getElementById('apm-c-safety').value,
            lotoMode: document.getElementById('apm-c-loto-mode').value,
            pmChecks: pmParsed,
            prob: document.getElementById('apm-c-prob').value.trim().toUpperCase(),
            fail: document.getElementById('apm-c-fail').value.trim().toUpperCase(),
            cause: document.getElementById('apm-c-cause').value.trim().toUpperCase(),
            assign: document.getElementById('apm-c-assign').value.trim().toUpperCase(),
            start: document.getElementById('apm-c-start').value,
            end: document.getElementById('apm-c-end').value,
            close: document.getElementById('apm-c-close').value.trim()
        };
    }

    function applyPresetData(data) {
        if (!data) data = {};
        if (document.getElementById('apm-c-keyword')) document.getElementById('apm-c-keyword').value = data.keyword || '';
        document.getElementById('apm-c-org').value = data.org || '';
        document.getElementById('apm-c-eq').value = data.eq || '';
        document.getElementById('apm-c-type').value = data.type || '';
        document.getElementById('apm-c-status').value = data.status || '';
        document.getElementById('apm-c-exec').value = data.exec || '';
        document.getElementById('apm-c-safety').value = data.safety || '';
        document.getElementById('apm-c-loto-mode').value = data.lotoMode || 'none';
        document.getElementById('apm-c-pm-checks').value = data.pmChecks !== undefined ? data.pmChecks : '';
        document.getElementById('apm-c-prob').value = data.prob || '';
        document.getElementById('apm-c-fail').value = data.fail || '';
        document.getElementById('apm-c-cause').value = data.cause || '';
        document.getElementById('apm-c-assign').value = data.assign || '';
        document.getElementById('apm-c-start').value = data.start || '';
        document.getElementById('apm-c-end').value = data.end || '';
        document.getElementById('apm-c-close').value = data.close || '';
    }

    /** =========================
     * UI Styles & Global Toast
     * ========================= */
    const style = document.createElement('style');
    style.innerHTML = `
        #apm-creator-panel select, #apm-creator-panel input { outline: none !important; box-sizing: border-box; }
        .creator-btn { cursor: pointer; transition: background 0.2s; font-weight: bold; border-radius: 4px; border: none; padding: 6px 12px; font-size: 12px; }
        .preset-row { display: flex; gap: 8px; align-items: center; background: #2b343c; padding: 10px; border-radius: 6px; margin-bottom: 15px; }

        /* Added min-width: 0 to force flex children to shrink */
        .field-row { display: flex; gap: 10px; margin-bottom: 10px; align-items: center; min-width: 0; }
        .field-label { font-size: 12px; color: #b0bec5; white-space: nowrap; width: 100px; text-align: right; }

        /* Added min-width: 0 and width: 100% to prevent input blowout */
        .field-input { flex-grow: 1; padding: 6px; border-radius: 4px; border: none; background: #ecf0f1; color: #2c3e50; min-width: 0; width: 100%; box-sizing: border-box; }
        .field-input.upper { text-transform: uppercase; }

        .apm-tab-btn { flex: 1; padding: 10px; text-align: center; cursor: pointer; font-weight: bold; transition: all 0.2s; border-bottom: 3px solid transparent; }
        .apm-tab-active-creator { color: #1abc9c; border-bottom: 3px solid #1abc9c; background: rgba(26, 188, 156, 0.05); }
        .apm-tab-active-autofill { color: #3498db; border-bottom: 3px solid #3498db; background: rgba(52, 152, 219, 0.05); }
        .apm-tab-inactive { color: #7f8c8d; }
        .apm-tab-inactive:hover { color: #bdc3c7; background: rgba(255,255,255,0.02); }

        .apm-col-item { padding: 8px; margin-bottom: 4px; background: #34495e; color: white; border-radius: 4px; cursor: grab; font-size: 12px; display: flex; justify-content: space-between; align-items: center; border: 1px solid #2c3e50; user-select: none; }
        .apm-col-item:active { cursor: grabbing; }
        .apm-col-item.dragging { opacity: 0.5; background: #f39c12; border-color: #e67e22; }
    `;
    document.head.appendChild(style);

    function setStatus(msg, color, keepOpen = false) {
        let toast = document.getElementById('apm-global-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'apm-global-toast';
            toast.style.cssText = 'position:fixed; top:15px; left:50%; transform:translateX(-50%); z-index:9999999; padding:8px 20px; border-radius:30px; font-weight:bold; font-family:sans-serif; font-size:13px; color:white; opacity:0; pointer-events:none; transition:opacity 0.3s ease; box-shadow:0px 4px 15px rgba(0,0,0,0.4); display:none;';
            document.body.appendChild(toast);
        }

        if (!msg) {
            toast.style.opacity = '0';
            setTimeout(() => { toast.style.display = 'none'; }, 300);
        } else {
            console.log(`[APM] ${msg}`);
            toast.style.display = 'block';
            setTimeout(() => { toast.style.opacity = '1'; }, 10);
            toast.style.backgroundColor = color || '#3498db';
            toast.textContent = msg;

            if (!keepOpen) {
                setTimeout(() => {
                    toast.style.opacity = '0';
                    setTimeout(() => { toast.style.display = 'none'; }, 300);
                }, 8000);
            }
        }
    }

    /** =========================
     * GitHub Update Checker
     * ========================= */
    const CURRENT_VERSION = '0.8.3'; // Manually bump this when you release new versions

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
        if (window._apmUpdateChecked) return;
        window._apmUpdateChecked = true;

        fetch('https://raw.githubusercontent.com/jaker788-create/APM-Master/main/creator.user.js')
            .then(response => response.text())
            .then(text => {
            const match = text.match(/\/\/\s*@version\s+([0-9\.]+)/);
            if (match && match[1]) {
                const remoteVersion = match[1];
                if (isNewerVersion(CURRENT_VERSION, remoteVersion)) {
                    const updateContainer = document.getElementById('apm-update-container');
                    if (updateContainer) updateContainer.style.display = 'block';
                    console.log(`[APM] Update available! Current: ${CURRENT_VERSION}, Remote: ${remoteVersion}`);
                }
            }
        }).catch(e => console.warn('[APM] Update check failed silently.', e));
    }

    /** =========================
     * UI Builder (Panel) - Compact Layout
     * ========================= */
    function buildCreatorUI() {
        if (window.self !== window.top || document.getElementById('apm-creator-panel')) return;

        let settingsMode = 'cols';
        let isHelpOpen = false;

        loadPresets();

        const panel = document.createElement('div');
        panel.id = 'apm-creator-panel';

        panel.style = 'position:fixed; z-index:99999; padding:15px; background:#35404a; color:white; border:1px solid #2c353c; border-radius:8px; box-shadow: 0px 8px 25px rgba(0,0,0,0.6); font-family:sans-serif; width: 380px; display:none;';

        const margin = 20;
        const vHeight = window.innerHeight;
        const vWidth = window.innerWidth;
        const panelWidth = 380;
        const panelHeight = 550;

        let topPos = 60;
        let rightPos = margin;

        if (topPos + panelHeight > vHeight) topPos = Math.max(10, vHeight - panelHeight - margin);
        if (rightPos + panelWidth > vWidth) rightPos = Math.max(10, vWidth - panelWidth - margin);

        panel.style.top = topPos + 'px';
        panel.style.right = rightPos + 'px';

        panel.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
            <h4 style="margin:0; font-size:16px; color:#ffffff; font-weight: normal;">APM Suite <span style="color:#3498db; font-weight: bold;">Auto-Fill</span></h4>
            <button id="apm-c-btn-close" style="background:#505f6e; color:#ffffff; border:none; padding: 4px 10px; border-radius:4px; cursor:pointer; font-size:12px; font-weight:bold;">✖</button>
        </div>

        <div id="apm-tab-container" style="display:flex; margin-bottom:12px; background:#2b343c; border-radius:6px; overflow:hidden;">
            <div id="tab-autofill" class="apm-tab-btn apm-tab-active-autofill" style="padding:8px;">Auto Fill Profiles</div>
            <div id="tab-settings" class="apm-tab-btn apm-tab-inactive" style="padding:8px;">UI Settings</div>
        </div>

        <div id="apm-main-fields" style="display:block;">

            <div style="background: rgba(0,0,0,0.25); padding: 10px; border-radius: 6px; margin-bottom: 15px; border: 1px solid #45535e;">
                <div style="font-size: 11px; color: #b0bec5; margin-bottom: 6px; font-weight: bold;">Active Template:</div>
                <div style="display: flex; gap: 6px;">
                    <select id="apm-c-preset-select" style="flex-grow:1; padding:6px; border-radius:4px; border:none; font-weight:bold; cursor:pointer; font-size:12px; background: #ecf0f1; color: #2c3e50;"></select>
                    <button id="apm-c-btn-save" class="creator-btn" style="background:#3498db; color:white;" title="Overwrite the selected template with current inputs">Update</button>
                    <button id="apm-c-btn-new" class="creator-btn" style="background:#2ecc71; color:white;" title="Create a new template">New / Copy</button>
                    <button id="apm-c-btn-del" class="creator-btn" style="background:#e74c3c; color:white; padding: 6px 10px;" title="Delete this template">✖</button>
                </div>
            </div>

            <div style="padding: 0 4px; margin-bottom: 10px;">
                <div class="field-row" style="margin-bottom: 12px;">
                    <div class="field-label" style="color:#f39c12; font-weight:bold; width: 55px; text-align: left;">Match:</div>
                    <input type="text" id="apm-c-keyword" class="field-input" placeholder="e.g., pre-sort, repair, jam" style="font-family: monospace; border: 1px solid #f39c12;">
                </div>

                <div style="display: flex; gap: 8px; margin-bottom: 8px;">
                    <div class="field-row" style="flex: 1; margin: 0;"><div class="field-label" style="width: 35px; text-align: left;">Org:</div><input type="text" id="apm-c-org" class="field-input upper" placeholder="Ignore"></div>
                    <div class="field-row" style="flex: 2; margin: 0;"><div class="field-label" style="width: 35px; text-align: left;">Equip:</div><input type="text" id="apm-c-eq" class="field-input upper" placeholder="Leave blank to ignore"></div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 8px;">
                    <div class="field-row" style="margin:0;"><div class="field-label" style="width:45px; text-align: left;">Type:</div><select id="apm-c-type" class="field-input"><option value="">- Ignore -</option><option value="Breakdown">Breakdown</option><option value="Corrective">Corrective</option><option value="Project">Project</option></select></div>
                    <div class="field-row" style="margin:0;"><div class="field-label" style="width:45px; text-align: left;">Status:</div><select id="apm-c-status" class="field-input"><option value="">- Ignore -</option><option value="Open">Open</option><option value="In Progress">In Progress</option></select></div>
                    <div class="field-row" style="margin:0;"><div class="field-label" style="width:45px; text-align: left;">Exec:</div><select id="apm-c-exec" class="field-input"><option value="">- Ignore -</option><option value="EXDN">EXDN</option><option value="EXDB">EXDB</option><option value="EXMW">EXMW</option><option value="EXOPS">EXOPS</option><option value="EXSHUT">EXSHUT</option></select></div>
                    <div class="field-row" style="margin:0;"><div class="field-label" style="width:45px; text-align: left;">Safety:</div><select id="apm-c-safety" class="field-input"><option value="">- Ignore -</option><option value="No">No</option><option value="Yes">Yes</option></select></div>
                </div>

                <div class="field-row" style="background: rgba(26, 188, 156, 0.1); border: 1px solid rgba(26, 188, 156, 0.3); padding: 8px; border-radius: 6px; margin-bottom: 10px; flex-wrap: wrap;">
                    <div style="width: 100%; font-size: 11px; color: #1abc9c; margin-bottom: 6px; font-weight: bold;">Automated Checklists:</div>
                    <div style="display: flex; gap: 8px; width: 100%; align-items: center;">
                        <div class="field-label" style="width: 45px; text-align: left; color:#fff;">1-Tech:</div>
                        <select id="apm-c-loto-mode" class="field-input" style="width: 135px; flex-grow: 0; padding: 4px; font-size: 11px;">
                            <option value="none">- Ignore -</option>
                            <option value="yes">(Check YES)</option>
                            <option value="no">(Check NO)</option>
                        </select>
                        <div class="field-label" style="flex-grow: 1; text-align: right; color:#fff;">10-Tech:</div>
                        <input type="number" id="apm-c-pm-checks" class="field-input" min="0" placeholder="Ignore" style="width: 100px; flex-grow: 0; padding: 4px; text-align: center;">
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 8px;">
                    <div class="field-row" style="margin:0;"><div class="field-label" style="width:55px; text-align: left;">Problem:</div><input type="text" id="apm-c-prob" class="field-input upper"></div>
                    <div class="field-row" style="margin:0;"><div class="field-label" style="width:45px; text-align: left;">Failure:</div><input type="text" id="apm-c-fail" class="field-input upper"></div>
                    <div class="field-row" style="margin:0;"><div class="field-label" style="width:55px; text-align: left;">Cause:</div><input type="text" id="apm-c-cause" class="field-input upper"></div>
                    <div class="field-row" style="margin:0;"><div class="field-label" style="width:45px; text-align: left;">Assign:</div><input type="text" id="apm-c-assign" class="field-input upper"></div>
                </div>

                <div style="display: flex; gap: 8px; margin-bottom: 8px;">
                    <div class="field-row" style="flex: 1; margin: 0;"><div class="field-label" style="width: 40px; text-align: left;">Start:</div><input type="date" id="apm-c-start" class="field-input" style="padding:4px; font-size:11px;"></div>
                    <div class="field-row" style="flex: 1; margin: 0;"><div class="field-label" style="width: 30px; text-align: left;">End:</div><input type="date" id="apm-c-end" class="field-input" style="padding:4px; font-size:11px;"></div>
                </div>

                <div class="field-row" style="margin:0;"><div class="field-label" style="width: 55px; text-align: left;">Closing:</div><input type="text" id="apm-c-close" class="field-input" placeholder="Closing comments..."></div>
            </div>
        </div>

        <div id="apm-settings-fields" style="display:none;">
            <div style="display:flex; margin-bottom:10px; background:#22292f; border-radius:4px; overflow:hidden;">
                <div id="apm-s-tog-cols" style="flex:1; text-align:center; padding:8px; cursor:pointer; font-size:12px; font-weight:bold; background:#3498db; color:#fff;">Grid Columns</div>
                <div id="apm-s-tog-tabs" style="flex:1; text-align:center; padding:8px; cursor:pointer; font-size:12px; font-weight:bold; color:#7f8c8d;">Record Tabs</div>
            </div>

            <div style="color:#3498db; font-weight:bold; margin-bottom: 5px;" id="apm-s-title">Visual Order:</div>
            <div style="font-size:11px; color:#aaa; margin-bottom:10px;">Drag and drop to reorder. Syncs automatically.</div>

            <div id="apm-s-col-list" style="background:#22292f; border:1px solid #45535e; border-radius:4px; padding:5px; min-height:60px; max-height:220px; overflow-y:auto; margin-bottom:10px;"></div>

            <button id="apm-s-btn-save-settings" style="width:100%; background:#2ecc71; color:white; border:none; padding:12px; border-radius:6px; cursor:pointer; font-weight:bold; font-size:14px;">Save Layout Order</button>
        </div>

        <div id="apm-help-fields" style="display:none; padding: 15px; background: #22292f; border-radius: 6px; font-size: 13px; color: #b0bec5; line-height: 1.6; border: 1px solid #45535e;">
            <h4 style="color:#3498db; margin: 0 0 15px 0; font-size: 15px; text-align: center; font-weight: bold;">
                Guide & Instructions
            </h4>
            <ul style="padding-left: 18px; margin: 0; list-style-type: none;">
                <li style="margin-bottom: 12px; position: relative;">
                    <b style="color:#f39c12; display: block; margin-bottom: 2px;">⚡ Smart Matching</b>
                    The <span style="color:white;">Match</span> field links templates to Work Orders. Enter unique keywords (e.g., <code>jam, conveyor</code>). If the WO title contains these words, the "Auto Fill" button will appear.
                </li>
                <li style="margin-bottom: 12px;">
                    <b style="color:#1abc9c; display: block; margin-bottom: 2px;">🤖 Checklist Automation</b>
                    <span style="color:white;">1-Tech:</span> Automatically checks YES or NO for every row in the LOTO grid.<br>
                    <span style="color:white;">10-Tech:</span> Completes the specific number of lines you enter. Set to <span style="color:white;">Ignore</span> (blank) to skip this step.
                </li>
                <li style="margin-bottom: 12px;">
                    <b style="color:#3498db; display: block; margin-bottom: 2px;">📂 Template Management</b>
                    Selecting a name in <span style="color:white;">Active Template</span> instantly loads its data into the boxes. Click <span style="color:white;">Update</span> to overwrite, or <span style="color:white;">New</span> to clone.
                </li>
                <li style="margin-bottom: 0;">
                    <b style="color:#e74c3c; display: block; margin-bottom: 2px;">🛠 UI Customization</b>
                    Use the <span style="color:white;">UI Settings</span> tab to drag and drop your preferred grid column order. APM Master will "force" this layout every time you open a screen.
                </li>
            </ul>
        </div>

        <div style="margin-top: 10px; text-align: center;">
            <span id="apm-c-btn-help" style="cursor: pointer; color: #7f8c8d; font-size: 11px; text-decoration: underline;">Help & Tips</span>
        </div>

        <div id="apm-update-container" style="display:none; margin-top: 15px; text-align: center;">
            <a href="https://raw.githubusercontent.com/jaker788-create/APM-Master/main/creator.user.js" target="_blank" style="display:inline-block; background:#f39c12; color:white; padding:8px 15px; border-radius:4px; font-weight:bold; text-decoration:none; font-size:13px; transition: background 0.2s; box-shadow: 0 2px 5px rgba(0,0,0,0.2);">✨ Update Available</a>
        </div>
        `;
        document.body.appendChild(panel);

        document.getElementById('apm-c-btn-close').onclick = () => { panel.style.display = 'none'; };

        const selectEl = document.getElementById('apm-c-preset-select');
        const mainFields = document.getElementById('apm-main-fields');
        const settingsFields = document.getElementById('apm-settings-fields');
        const helpFields = document.getElementById('apm-help-fields');

        const tabAutofill = document.getElementById('tab-autofill');
        const tabSettings = document.getElementById('tab-settings');

        const togCols = document.getElementById('apm-s-tog-cols');
        const togTabs = document.getElementById('apm-s-tog-tabs');
        const colListContainer = document.getElementById('apm-s-col-list');

        // "0 = Ignore" logic for the 10-Tech input
        const pmChecksEl = document.getElementById('apm-c-pm-checks');
        pmChecksEl.addEventListener('input', (e) => {
            if (e.target.value === '0') {
                e.target.value = ''; // Clears to trigger the "Ignore" placeholder
            }
        });

        document.getElementById('apm-c-btn-help').onclick = () => {
            isHelpOpen = !isHelpOpen;
            const helpBtn = document.getElementById('apm-c-btn-help');
            const tabContainer = document.getElementById('apm-tab-container');

            if (isHelpOpen) {
                mainFields.style.display = 'none';
                settingsFields.style.display = 'none';
                tabContainer.style.display = 'none';
                helpFields.style.display = 'block';
                helpBtn.textContent = '← Back to Tools';
                helpBtn.style.color = '#3498db';
            } else {
                resetTabs();
                if (activeTab === 'autofill') tabAutofill.onclick();
                else tabSettings.onclick();
            }
        };

        const resetTabs = () => {
            tabAutofill.style.background = 'transparent'; tabAutofill.className = 'apm-tab-btn apm-tab-inactive';
            tabSettings.style.background = 'transparent'; tabSettings.className = 'apm-tab-btn apm-tab-inactive';
            isHelpOpen = false;
            helpFields.style.display = 'none';
            document.getElementById('apm-tab-container').style.display = 'flex';
            const helpBtn = document.getElementById('apm-c-btn-help');
            helpBtn.textContent = 'Help & Tips';
            helpBtn.style.color = '#3498db';
        };

        const renderPresetOptions = () => {
            selectEl.innerHTML = '';
            const targetList = presets.autofill;
            for (const pName in targetList) {
                const opt = document.createElement('option');
                opt.value = pName; opt.textContent = pName;
                selectEl.appendChild(opt);
            }
            if (Object.keys(targetList).length > 0) {
                applyPresetData(targetList[Object.keys(targetList)[0]]);
            } else {
                applyPresetData({});
            }
            if (pmChecksEl.value === '0') pmChecksEl.value = '';
        };

        const probeExtGridColumns = () => {
            let cols = [];
            const allDocs = [window.top, window];
            document.querySelectorAll('iframe').forEach(f => {
                try { if (f.src && f.src.includes('amazon.dev')) return; if (f.contentWindow && f.contentWindow.Ext) allDocs.push(f.contentWindow); } catch(e){}
            });

            for (const win of allDocs) {
                if (win.Ext && win.Ext.ComponentQuery) {
                    const grids = win.Ext.ComponentQuery.query('gridpanel');
                    const mainGrid = grids.find(g => g.columns && g.columns.length > 20 && g.rendered);
                    if (mainGrid && mainGrid.headerCt) {
                        mainGrid.headerCt.items.items.forEach(col => {
                            if (col.rendered && (!col.isHidden || !col.isHidden()) && col.dataIndex) {
                                let cleanText = (col.text || col.dataIndex).replace(/<[^>]*>?/gm, '').trim();
                                if (cleanText && cleanText !== '&#160;') {
                                    cols.push({ index: col.dataIndex, text: cleanText });
                                }
                            }
                        });
                        break;
                    }
                }
            }
            return cols;
        };

        const probeExtTabs = () => {
            let tabs = [];
            const allDocs = [window.top, window];
            document.querySelectorAll('iframe').forEach(f => {
                try { if (f.src && f.src.includes('amazon.dev')) return; if (f.contentWindow && f.contentWindow.Ext) allDocs.push(f.contentWindow); } catch(e){}
            });

            for (const win of allDocs) {
                if (win.Ext && win.Ext.ComponentQuery) {
                    const tabPanels = win.Ext.ComponentQuery.query('tabpanel');
                    const mainTabPanel = tabPanels.find(tp => tp.rendered && tp.items && tp.items.items.length > 3 &&
                                                        tp.items.items.some(t => {
                        let txt = t.title || t.text || '';
                        return txt.includes('Activities') || txt.includes('Checklist') || txt.includes('Comments');
                    }));

                    if (mainTabPanel) {
                        mainTabPanel.items.items.forEach(t => {
                            if (!t.tab || (typeof t.tab.isHidden === 'function' && t.tab.isHidden())) return;
                            let cleanText = (t.title || t.text || '').replace(/<[^>]*>?/gm, '').trim();
                            if (cleanText && cleanText !== '&#160;') {
                                tabs.push({ index: cleanText, text: cleanText });
                            }
                        });
                        break;
                    }
                }
            }
            return tabs;
        };

        const renderDragList = (itemsArray, emptyMsg) => {
            colListContainer.innerHTML = '';
            if (itemsArray.length === 0) {
                colListContainer.innerHTML = `<div style="color:#7f8c8d; text-align:center; padding:10px;">${emptyMsg}</div>`;
                return;
            }

            itemsArray.forEach(c => {
                const item = document.createElement('div');
                item.draggable = true;
                item.dataset.index = c.index;
                item.className = 'apm-col-item';

                // FIXED: Removed backslashes to correctly parse JS string template
                item.innerHTML = `<span><b style="color:#3498db;">☰</b> &nbsp; ${c.text}</span> <span style="color:#7f8c8d; font-size:10px;">[${settingsMode === 'cols' ? c.index : 'Tab'}]</span>`;

                item.ondragstart = (e) => {
                    e.dataTransfer.setData('text/plain', '');
                    item.classList.add('dragging');
                };
                item.ondragend = () => { item.classList.remove('dragging'); };
                colListContainer.appendChild(item);
            });
        };

        colListContainer.ondragover = (e) => {
            e.preventDefault();
            const dragging = document.querySelector('.dragging');
            if (!dragging) return;

            const siblings = [...colListContainer.querySelectorAll('.apm-col-item:not(.dragging)')];
            const nextSibling = siblings.find(sibling => {
                const box = sibling.getBoundingClientRect();
                return e.clientY <= box.top + box.height / 2;
            });

            if (nextSibling) { colListContainer.insertBefore(dragging, nextSibling); }
            else { colListContainer.appendChild(dragging); }
        };

        const performAutoFetch = () => {
            if (settingsMode === 'cols') {
                const cols = probeExtGridColumns();
                renderDragList(cols, 'No grid found. Open the Work Orders screen.');
            } else {
                const tabs = probeExtTabs();
                renderDragList(tabs, 'No record tabs found. Open a Work Order.');
            }
        };

        const loadSettingsView = () => {
            if (settingsMode === 'cols') {
                togCols.style.background = '#3498db'; togCols.style.color = '#fff';
                togTabs.style.background = 'transparent'; togTabs.style.color = '#7f8c8d';
            } else {
                togTabs.style.background = '#3498db'; togTabs.style.color = '#fff';
                togCols.style.background = 'transparent'; togCols.style.color = '#7f8c8d';
            }
            performAutoFetch();
        };

        togCols.onclick = () => { settingsMode = 'cols'; loadSettingsView(); };
        togTabs.onclick = () => { settingsMode = 'tabs'; loadSettingsView(); };

        tabAutofill.onclick = () => {
            activeTab = 'autofill';
            resetTabs(); tabAutofill.className = 'apm-tab-btn apm-tab-active-autofill';
            mainFields.style.display = 'block'; settingsFields.style.display = 'none';
            renderPresetOptions();
        };

        tabSettings.onclick = () => {
            activeTab = 'settings';
            resetTabs(); tabSettings.className = 'apm-tab-btn apm-tab-active-autofill';
            mainFields.style.display = 'none'; settingsFields.style.display = 'block';
            loadSettingsView();
        };

        // --- TEMPLATE MANAGER LOGIC ---
        selectEl.addEventListener('change', () => {
            const selected = selectEl.value;
            if (selected && presets.autofill[selected]) {
                applyPresetData(presets.autofill[selected]);
                if (pmChecksEl.value === '0') pmChecksEl.value = '';
            }
        });

        document.getElementById('apm-c-btn-save').onclick = () => {
            if (selectEl.value) {
                presets.autofill[selectEl.value] = getCurrentFormData();
                savePresets();
                // FIXED: Removed backslashes
                setStatus(`Template "${selectEl.value}" Updated!`, '#2ecc71');
            } else {
                setStatus('No template selected to update.', '#e74c3c');
            }
        };

        document.getElementById('apm-c-btn-new').onclick = () => {
            const name = prompt('Enter a name for the new template:');
            if (name && name.trim()) {
                const safeName = name.trim();
                presets.autofill[safeName] = getCurrentFormData();
                savePresets();
                renderPresetOptions();
                selectEl.value = safeName;
                if (pmChecksEl.value === '0') pmChecksEl.value = '';
                // FIXED: Removed backslashes
                setStatus(`Template "${safeName}" Created!`, '#3498db');
            }
        };

        document.getElementById('apm-c-btn-del').onclick = () => {
            // FIXED: Removed backslashes
            if (selectEl.value && confirm(`Delete template "${selectEl.value}"?`)) {
                const deletedName = selectEl.value;
                delete presets.autofill[selectEl.value];
                savePresets();
                renderPresetOptions();
                setStatus(`Template "${deletedName}" Deleted.`, '#e74c3c');
            }
        };

        document.getElementById('apm-s-btn-save-settings').onclick = () => {
            const items = [...colListContainer.querySelectorAll('.apm-col-item')];
            if (items.length > 0) {
                const orderStr = items.map(el => el.dataset.index).join(', ');
                if (settingsMode === 'cols') {
                    presets.config.columnOrder = orderStr;
                    setStatus('Grid Column order saved!', '#2ecc71');
                } else {
                    presets.config.tabOrder = orderStr;
                    setStatus('Record Tab order saved!', '#2ecc71');
                }
                savePresets();
            } else {
                setStatus('No items to save.', '#e74c3c');
            }
        };

        if (activeTab === 'autofill') tabAutofill.onclick();
        else tabSettings.onclick();

        checkForUpdates();
    }

    /** =========================
     * UI Customizations (Grid & Tabs)
     * ========================= */

    // Forces the loop to re-evaluate components after a settings save
    function forceRetagExtJs() {
        const allDocs = [window.top, window];
        document.querySelectorAll('iframe').forEach(f => {
            try { if (f.src && f.src.includes('amazon.dev')) return; if (f.contentWindow && f.contentWindow.Ext) allDocs.push(f.contentWindow); } catch(e){}
        });
        for (const win of allDocs) {
            if (win.Ext && win.Ext.ComponentQuery) {
                const grids = win.Ext.ComponentQuery.query('gridpanel');
                grids.forEach(g => g.hasBeenSortedByAPM = false);
            }
        }
    }

    /** =========================
     * Grid Layout & Visual Order Auditing
     * ========================= */
    async function applyGridConsistency() {
        if (!presets.config.columnOrder) return;
        const preferredOrder = presets.config.columnOrder.split(',').map(s => s.trim()).filter(s => s.length > 0);

        const allDocs = [window.top, window];
        document.querySelectorAll('iframe').forEach(f => {
           try { if (f.src && f.src.includes('amazon.dev')) return; if (f.contentWindow && f.contentWindow.Ext) allDocs.push(f.contentWindow); } catch(e){}
        });

        for (const win of allDocs) {
            if (win.Ext && win.Ext.ComponentQuery) {
                const grids = win.Ext.ComponentQuery.query('gridpanel');
                const mainGrid = grids.find(g => g.columns && g.columns.length > 20 && g.rendered && !g.isDestroyed && !g.destroying);

                if (mainGrid && mainGrid.headerCt && !mainGrid.headerCt.isDestroyed) {
                    const headerCt = mainGrid.headerCt;

                    let needsSorting = false;
                    const visibleCols = headerCt.getVisibleGridColumns().filter(c => !c.isCheckerHd && !c.locked && c.xtype !== 'rownumberer');
                    const activePreferred = preferredOrder.map(dataIndex => visibleCols.find(c => c.dataIndex === dataIndex)).filter(Boolean);

                    // 1. Audit against what is actually visible
                    for (let i = 0; i < activePreferred.length; i++) {
                        if (visibleCols[i] !== activePreferred[i]) {
                            needsSorting = true;
                            break;
                        }
                    }

                    // 2. Execute Sort
                    if (needsSorting && !headerCt.isDestroyed) {
                        let layoutsSuspended = false;
                        try {
                            win.Ext.suspendLayouts();
                            layoutsSuspended = true;

                            let currentAbsTarget = 0;
                            activePreferred.forEach((targetCol) => {
                                // Fast-forward past system/hidden columns
                                while (currentAbsTarget < headerCt.items.length) {
                                    let colAtTarget = headerCt.items.getAt(currentAbsTarget);
                                    if (colAtTarget.isCheckerHd || colAtTarget.locked || colAtTarget.xtype === 'rownumberer' || (typeof colAtTarget.isHidden === 'function' && colAtTarget.isHidden())) {
                                        currentAbsTarget++;
                                    } else {
                                        break;
                                    }
                                }

                                const currentAbsIdx = headerCt.items.indexOf(targetCol);
                                if (currentAbsIdx !== -1 && currentAbsIdx !== currentAbsTarget) {
                                    headerCt.move(currentAbsIdx, currentAbsTarget);
                                }
                                currentAbsTarget++;
                            });
                        } catch (e) {
                            console.warn('[APM] Grid column reorder failed:', e);
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
        if (!presets.config.tabOrder) return;
        const preferredOrder = presets.config.tabOrder.split(',').map(s => s.trim()).filter(s => s.length > 0);

        const allDocs = [window.top, window];
        document.querySelectorAll('iframe').forEach(f => {
          try { if (f.src && f.src.includes('amazon.dev')) return; if (f.contentWindow && f.contentWindow.Ext) allDocs.push(f.contentWindow); } catch(e){}
        });

        for (const win of allDocs) {
            if (win.Ext && win.Ext.ComponentQuery) {
                const tabPanels = win.Ext.ComponentQuery.query('tabpanel');
                const mainTabPanel = tabPanels.find(tp => tp.rendered && !tp.isDestroyed && !tp.destroying && tp.items && tp.items.items.length > 3 &&
                                                    tp.items.items.some(t => {
                    let txt = t.title || t.text || '';
                    return txt.includes('Activities') || txt.includes('Checklist') || txt.includes('Comments');
                }));

                if (mainTabPanel) {
                    let needsSorting = false;

                    // 1. Live Audit
                    preferredOrder.forEach((tabName, targetIdx) => {
                        if (mainTabPanel.isDestroyed) return;
                        const currentIdx = mainTabPanel.items.findIndexBy(item => {
                            if (item.isDestroyed) return false;
                            let name = (item.title || item.text || '').replace(/<[^>]*>?/gm, '').trim();
                            return name === tabName;
                        });

                        if (currentIdx !== -1 && currentIdx !== targetIdx) {
                            needsSorting = true;
                        }
                    });

                    // 2. Execute Sort Safely
                    if (needsSorting && !mainTabPanel.isDestroyed) {
                        let layoutsSuspended = false;
                        try {
                            win.Ext.suspendLayouts();
                            layoutsSuspended = true;

                            preferredOrder.forEach((tabName, targetIdx) => {
                                const currentIdx = mainTabPanel.items.findIndexBy(item => {
                                    if (item.isDestroyed) return false;
                                    let name = (item.title || item.text || '').replace(/<[^>]*>?/gm, '').trim();
                                    return name === tabName;
                                });

                                if (currentIdx !== -1 && currentIdx !== targetIdx) {
                                    mainTabPanel.move(currentIdx, targetIdx);
                                }
                            });
                        } catch (e) {
                            console.warn('[APM] Tab reorder failed silently to prevent crash:', e);
                        } finally {
                            if (layoutsSuspended) win.Ext.resumeLayouts(true);
                            if (!mainTabPanel.isDestroyed && typeof mainTabPanel.updateLayout === 'function') {
                                mainTabPanel.updateLayout();
                            }
                        }
                    }
                    break;
                }
            }
        }
    }

    /** =========================
     * APM Panel Auto-Close Logic
     * ========================= */
    function applyPanelAutoClose() {
        const allDocs = [window.top.document, document];
        document.querySelectorAll('iframe').forEach(f => {
           try { if (f.src && f.src.includes('amazon.dev')) return; if (f.contentDocument) allDocs.push(f.contentDocument); } catch(e){}
        });

        // Define the handler ONCE on the top window
        if (!window._apmPanelCloseListener) {
            window._apmPanelCloseListener = function(e) {
                // Find your custom panel in the top window
                const panel = window.top.document.getElementById('apm-creator-panel');
                if (!panel || panel.style.display === 'none') return;

                // Abort if the user clicked inside the panel or on the toggle button
                if (e && e.target && typeof e.target.closest === 'function') {
                    if (e.target.closest('#apm-creator-panel, #apm-creator-toggle')) {
                        return;
                    }
                }

                // User clicked outside the panel. Hide it.
                panel.style.display = 'none';
            };
        }

        // Bind to all document surfaces so clicks inside iframes still close the top panel
        allDocs.forEach(doc => {
            if (doc && !doc._apmPanelBound) {
                doc.addEventListener('mousedown', window._apmPanelCloseListener, true);
                doc.addEventListener('pointerdown', window._apmPanelCloseListener, true);
                doc._apmPanelBound = true;
            }
        });
    }

    /** =========================
     * Engine Utilities & Checks
     * ========================= */
    const delay = (ms) => new Promise(res => setTimeout(res, ms));

    function isVisible(el) {
        if (!el) return false;
        const style = window.getComputedStyle(el);
        return style.display !== 'none' && style.visibility !== 'hidden' && el.offsetParent !== null;
    }

    async function findWithRetry(baseDoc, selectors, retries = CONFIG.retries) {
        for (let i = 0; i <= retries; i++) {
            if (!isRunning) return null;

            const allDocs = [window.top.document, baseDoc, document];
            document.querySelectorAll('iframe').forEach(f => {
                try { if (f.src && f.src.includes('amazon.dev')) return; if (f.contentDocument) allDocs.push(f.contentDocument); } catch(e){}
            });

            for (const d of allDocs) {
                if (!d) continue;
                for (const sel of selectors) {
                    const el = d.querySelector(sel);
                    if (el && isVisible(el)) return el;
                }
            }
            if (i < retries) await delay(CONFIG.retryDelayMs);
        }
        return null;
    }

    function clickLikeUser(el) {
        try {
            const rect = el.getBoundingClientRect();
            const opts = { bubbles: true, cancelable: true, view: window, clientX: rect.left + rect.width / 2, clientY: rect.top + rect.height / 2 };
            el.dispatchEvent(new MouseEvent('mousedown', opts));
            el.dispatchEvent(new MouseEvent('mouseup', opts));
            el.dispatchEvent(new MouseEvent('click', opts));
        } catch (e) { el.click?.(); }
    }

    // Native ExtJS Event-Driven Ajax Listener
    function waitForAjax(win) {
        return new Promise((resolve) => {
            const ext = win.Ext;
            if (!ext || !ext.Ajax) {
                resolve();
                return;
            }

            if (!ext.Ajax.isLoading()) {
                resolve();
                return;
            }

            // Hook directly into the framework's global Ajax queue
            const onComplete = function() {
                if (!ext.Ajax.isLoading()) {
                    ext.Ajax.un('requestcomplete', onComplete);
                    ext.Ajax.un('requestexception', onComplete);

                    // Give ExtJS 100ms to physically paint the DOM updates (like unmasking the UI)
                    setTimeout(resolve, 100);
                }
            };

            ext.Ajax.on('requestcomplete', onComplete);
            ext.Ajax.on('requestexception', onComplete);

            // 10-second failsafe in case a request hangs or gets silently aborted by EAM
            setTimeout(() => {
                ext.Ajax.un('requestcomplete', onComplete);
                ext.Ajax.un('requestexception', onComplete);
                resolve();
            }, 10000);
        });
    }

    function formatEAMDate(dateStr) {
        if (!dateStr) return '';
        const parts = dateStr.split('-');
        if (parts.length === 3) {
            return `${parts[1]}/${parts[2]}/${parts[0]}`; // Converts YYYY-MM-DD to MM/DD/YYYY
        }
        return dateStr;
    }


    /** =========================
     * NATIVE ExtJS Engine Core
     * ========================= */
    // Pure ExtJS Model Setter (For standard text/date fields)
    function setExtModelDirect(activeExt, formPanel, fieldName, value) {
        if (!formPanel || !value) return false;

        const field = activeExt.ComponentQuery.query(`[name="${fieldName}"]`, formPanel)[0] ||
              activeExt.ComponentQuery.query(`[name="${fieldName}"]`)[0];

        if (field) {
            if (typeof field.setReadOnly === 'function') field.setReadOnly(false);
            if (typeof field.setDisabled === 'function') field.setDisabled(false);

            field.setValue(value);

            const record = formPanel.getRecord();
            if (record) {
                record.set(fieldName, value);
            }
            return true;
        }
        return false;
    }

    // Advanced LOV Setter: Uses physical DOM triggers to safely fire validation without crashing ExtJS
    async function setEamLovFieldDirect(activeExt, formPanel, name, value) {
        if (!activeExt || !formPanel || !value) return false;

        const field = activeExt.ComponentQuery.query(`[name="${name}"]`, formPanel)[0] ||
              activeExt.ComponentQuery.query(`[name="${name}"]`)[0];

        if (field) {
            // Unlock UI
            if (typeof field.setReadOnly === 'function') field.setReadOnly(false);
            if (typeof field.setDisabled === 'function') field.setDisabled(false);

            // Set ExtJS model value
            field.setValue(value);
            const record = formPanel.getRecord();
            if (record) record.set(name, value);

            // FIX: Force physical DOM events to trigger EAM's natural validation listeners
            if (field.inputEl && field.inputEl.dom) {
                const dom = field.inputEl.dom;
                dom.focus();
                dom.value = value;
                dom.dispatchEvent(new Event('input', { bubbles: true }));
                dom.dispatchEvent(new Event('change', { bubbles: true }));

                // Tab key tells EAM LOV to validate
                const tabEvent = new KeyboardEvent('keydown', { key: 'Tab', code: 'Tab', keyCode: 9, which: 9, bubbles: true });
                dom.dispatchEvent(tabEvent);
                dom.blur();
            }

            // Backup ExtJS event triggers
            field.fireEvent('change', field, value);
            field.fireEvent('blur', field);

            return true;
        }
        return false;
    }

    // Pure Combobox Data Store Setter (Unlocked and Case-Insensitive)
    async function setEamComboboxDirect(activeExt, formPanel, name, displayText) {
        if (!activeExt || !formPanel || !displayText) return false;

        const combo = activeExt.ComponentQuery.query(`uxcombobox[name="${name}"]`, formPanel)[0] ||
              activeExt.ComponentQuery.query(`uxcombobox[name="${name}"]`)[0];

        if (combo && combo.store) {
            // 1. Force unlock the dropdown (EAM locks Status on new records)
            if (typeof combo.setReadOnly === 'function') combo.setReadOnly(false);
            if (typeof combo.setDisabled === 'function') combo.setDisabled(false);

            // 2. Load the dropdown options if they haven't been fetched from the server yet
            if (!combo.store.isLoaded()) {
                combo.store.load();
                await delay(600);
            }

            // 3. Search EAM's internal data store case-insensitively
            let record = combo.store.findRecord('display', new RegExp('^' + displayText + '$', 'i'));
            if (!record) record = combo.store.findRecord('field2', new RegExp('^' + displayText + '$', 'i')); // Fallback for older EAM versions

            if (record) {
                const internalCode = record.get('value') || record.get('field1');

                // Set the component
                combo.setValue(internalCode);

                // Update the visual DOM input box so you can see it changed
                if (combo.inputEl && combo.inputEl.dom) {
                    combo.inputEl.dom.value = record.get('display') || record.get('field2');
                }

                // Inject straight into the underlying save payload
                const formRecord = formPanel.getRecord();
                if (formRecord) {
                    formRecord.set(name, internalCode);
                }

                // Fire standard events just to be safe
                combo.fireEvent('select', combo, [record]);
                combo.fireEvent('change', combo, internalCode);

                return true;
            }
        }
        return false;
    }

    async function searchEquipmentNative(searchTerm, win) {
        const ext = win.Ext;

        const eam = win.EAM || window.top.EAM || window.EAM;
        let eamid = '', tenant = '';

        if (eam && eam.Context) {
            eamid = eam.Context.eamid;
            tenant = eam.Context.tenant;
        }
        if (!eamid || !tenant) {
            const params = ext.Object.fromQueryString(win.location.search || window.top.location.search);
            eamid = params.eamid || '';
            tenant = params.tenant || '';
        }

        if (!ext || !eamid) return searchTerm;

        let currentOrg = 'DWA2';
        const orgField = ext.ComponentQuery.query('[name="organization"]')[0];
        if (orgField) currentOrg = orgField.getValue() || 'DWA2';

        return new Promise((resolve) => {
            ext.Ajax.request({
                url: 'OSEQPP.xmlhttp',
                method: 'POST',
                params: {
                    GRID_NAME: 'LVOBJL',
                    SYSTEM_FUNCTION_NAME: 'OSEQPP',
                    USER_FUNCTION_NAME: 'WSJOBS',
                    CURRENT_TAB_NAME: 'HDR',
                    COMPONENT_INFO_TYPE: 'DATA_ONLY',
                    LOV_TAGNAME: 'equipment',
                    filterfields: 'equipmentcode',
                    filteroperator: 'CONTAINS',
                    filtervalue: searchTerm,
                    LOV_ALIAS_NAME_1: 'equipmentlookup',
                    LOV_ALIAS_VALUE_1: 'true',
                    LOV_ALIAS_TYPE_1: 'text',
                    LOV_ALIAS_NAME_2: 'param.loantodept',
                    LOV_ALIAS_VALUE_2: 'true',
                    LOV_ALIAS_TYPE_2: 'text',
                    LOV_ALIAS_NAME_3: 'control.org',
                    LOV_ALIAS_VALUE_3: currentOrg,
                    LOV_ALIAS_TYPE_3: 'text',
                    LOV_ALIAS_NAME_4: 'param.cctrspcvalidation',
                    LOV_ALIAS_VALUE_4: 'M',
                    LOV_ALIAS_TYPE_4: 'text',
                    LOV_ALIAS_NAME_5: 'param.department',
                    LOV_ALIAS_VALUE_5: 'RME',
                    LOV_ALIAS_TYPE_5: 'text',
                    eamid: eamid,
                    tenant: tenant
                },
                success: function(response) {
                    try {
                        const data = ext.decode(response.responseText);
                        const rows = data.pageData.grid.GRIDRESULT.GRID.DATA;
                        if (rows && rows.length > 0) resolve(rows[0].equipmentcode);
                        else resolve(searchTerm);
                    } catch(e) { resolve(searchTerm); }
                },
                failure: function() { resolve(searchTerm); }
            });
        });
    }

    /** =========================
     * Main Form Injection Engine
     * ========================= */
    async function injectExtJSFieldsNative(data) {
        setStatus('Locating active EAM Form...', '#f1c40f', true);

        let activeWin = null;
        let mainForm = null;

        for (let i = 0; i < 20; i++) {
            const allDocs = [window.top, window];
            document.querySelectorAll('iframe').forEach(f => {
                try { if (f.src && f.src.includes('amazon.dev')) return; if (f.contentWindow && f.contentWindow.Ext) allDocs.push(f.contentWindow); } catch(e){}
            });

            for (const win of allDocs) {
                if (win && win.Ext && win.Ext.ComponentQuery) {
                    const forms = win.Ext.ComponentQuery.query('form');
                    const targetForm = forms.find(f => f.rendered && f.id.includes('recordview'));
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
            setStatus('Error: Visible WO Form not found.', '#e74c3c');
            isRunning = false;
            return;
        }

        const activeExt = activeWin.Ext;

        // 1. Set Organization and rigidly wait for server to finish dependent field wipes
        if (data.org) {
            setStatus('Setting Organization...', '#f1c40f', true);
            await setEamLovFieldDirect(activeExt, mainForm, 'organization', data.org);
            await waitForAjax(activeWin);
            await delay(1000); // Wait for the form to wipe
        }

        // 2. Fetch Equipment and force EAM to load the description/department
        if (data.eq) {
            setStatus('Searching Equipment Database...', '#f1c40f', true);
            let finalEquipment = await searchEquipmentNative(data.eq, activeWin);
            setStatus('Setting Equipment...', '#f1c40f', true);
            await setEamLovFieldDirect(activeExt, mainForm, 'equipment', finalEquipment);
            await waitForAjax(activeWin);
            await delay(500); // Wait for description/department to visually populate
        }

        // 3. Set standard fields purely into the ExtJS Model (Equipment removed from here)
        setStatus('Injecting Data Model...', '#f1c40f', true);

        if (data.exec) setExtModelDirect(activeExt, mainForm, 'udfchar13', data.exec);
        if (data.safety) setExtModelDirect(activeExt, mainForm, 'udfchar24', data.safety);
        if (data.close) setExtModelDirect(activeExt, mainForm, 'udfnote01', data.close);
        if (data.prob) setExtModelDirect(activeExt, mainForm, 'problemcode', data.prob);
        if (data.fail) setExtModelDirect(activeExt, mainForm, 'failurecode', data.fail);
        if (data.cause) setExtModelDirect(activeExt, mainForm, 'causecode', data.cause);
        if (data.assign) setExtModelDirect(activeExt, mainForm, 'assignedto', data.assign);

        if (data.start) setExtModelDirect(activeExt, mainForm, 'schedstartdate', formatEAMDate(data.start));
        if (data.end) setExtModelDirect(activeExt, mainForm, 'schedenddate', formatEAMDate(data.end));

        await delay(500);

        // 5. Native Save
        setStatus('Dispatching Save Request...', '#2ecc71', true);
        const saveBtns = activeExt.ComponentQuery.query('button[action=saveRec], button[action=saverecord], button.uft-id-saverec');
        const targetBtn = saveBtns.find(b => b.rendered && !(b.isHidden && b.isHidden())) || saveBtns[0];

        if (targetBtn) {
            if (targetBtn.handler) {
                targetBtn.handler.call(targetBtn.scope || targetBtn, targetBtn);
            } else {
                targetBtn.fireEvent('click', targetBtn);
            }
        } else {
            setStatus('Error: Save button missing.', '#e74c3c');
            isRunning = false;
            return;
        }

        await waitForAjax(activeWin);
    }

    async function executeChecklistsNative(data) {
        const lotoMode = data.lotoMode;
        const pmChecks = data.pmChecks || 0;

        if ((!lotoMode || lotoMode === 'none') && pmChecks === 0) return;

        setStatus('Navigating to Checklist...', '#9b59b6', true);

        let activeExt = null;
        let checklistContainer = null;
        let mainTabPanel = null;
        let activeWin = null;

        // 1. Locate Checklist Container
        for (let i = 0; i < 15; i++) {
            const allDocs = [window.top, window];
            document.querySelectorAll('iframe').forEach(f => {
                try { if (f.src && f.src.includes('amazon.dev')) return; if (f.contentWindow && f.contentWindow.Ext) allDocs.push(f.contentWindow); } catch(e){}
            });

            for (const win of allDocs) {
                if (win.Ext && win.Ext.ComponentQuery) {
                    const containers = win.Ext.ComponentQuery.query('uxtabcontainer[itemId=ACK]');
                    if (containers.length > 0) {
                        activeWin = win;
                        activeExt = win.Ext;
                        checklistContainer = containers[0];
                        mainTabPanel = checklistContainer.up('tabpanel');
                        break;
                    }
                }
            }
            if (activeExt && mainTabPanel) break;
            await delay(100);
        }

        if (!activeExt || !mainTabPanel || !checklistContainer) {
            setStatus('Checklist Tab (ACK) not found.', '#e74c3c');
            return;
        }

        mainTabPanel.setActiveTab(checklistContainer);

        const getGridStore = () => {
            const grids = activeExt.ComponentQuery.query('gridpanel', checklistContainer);
            return grids.length > 0 ? grids[0] : null;
        };

        // CAPPED AJAX WAIT: Stops hanging if EAM has background polling
        const localWaitForAjax = async () => {
            await delay(50);
            let waited = 0;
            while (waited < 6000) { // Capped at 6 seconds maximum
                if (activeExt.Ajax && !activeExt.Ajax.isLoading()) break;
                await delay(50);
                waited += 50;
            }
            await delay(50);
        };

        const saveGridData = async () => {
            let targetBtn = null;
            const submitBtns = activeExt.ComponentQuery.query('button[tooltip=Submit], button[text=Submit]');
            const visibleSubmit = submitBtns.find(b => b.rendered && (!b.hidden && !(typeof b.isHidden === 'function' && b.isHidden())));

            if (visibleSubmit) {
                targetBtn = visibleSubmit;
            } else {
                const saveBtns = activeExt.ComponentQuery.query('button[action=saveRec], button[action=saverecord], button.uft-id-saverec');
                targetBtn = saveBtns.find(b => b.rendered && (!b.hidden && !(typeof b.isHidden === 'function' && b.isHidden()))) || saveBtns[0];
            }

            if (targetBtn) {
                if (targetBtn.handler) targetBtn.handler.call(targetBtn.scope || targetBtn, targetBtn);
                else targetBtn.fireEvent('click', targetBtn);
            }
            await localWaitForAjax();
        };

        // STRICT MATCHING SWITCHER
        const switchActivity = async (targetValue) => {
            const combos = activeExt.ComponentQuery.query('combobox[name=activity]', checklistContainer);
            if (!combos || combos.length === 0) return false;

            const actCombo = combos[0];
            const actStore = actCombo.getStore();

            // 1. Check exact underlying value to prevent "10" matching "1"
            const currentVal = String(actCombo.getValue() || '');
            const currentDisp = String(actCombo.getRawValue() || '').trim();

            // Allow exact match OR "1 -" formatting
            if (currentVal === targetValue || currentDisp === targetValue || currentDisp.startsWith(targetValue + ' -') || currentDisp.startsWith(targetValue + '-')) {
                return true;
            }

            let targetRec = null;
            actStore.each(rec => {
                const val = String(rec.get(actCombo.valueField) || '');
                const disp = String(rec.get(actCombo.displayField) || '').trim();

                if (val === targetValue || disp === targetValue || disp.startsWith(targetValue + ' -') || disp.startsWith(targetValue + '-')) {
                    targetRec = rec;
                }
            });

            if (targetRec) {
                actCombo.setValue(targetRec.get(actCombo.valueField));
                actCombo.fireEvent('select', actCombo, [targetRec]);
                actCombo.fireEvent('change', actCombo, targetRec.get(actCombo.valueField));

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

        // --- PHASE 1: LOTO (1-Tech) ---
        if (lotoMode && lotoMode !== 'none') {
            const isReady = await switchActivity('1');
            if (isReady) {
                let chkGrid = getGridStore();
                if (chkGrid && chkGrid.getStore().getCount() > 0) {
                    let modifiedCount = 0;
                    let needsSaving = false;

                    chkGrid.getStore().each(record => {
                        let yesField = 'yes', noField = 'no';
                        if (!record.data.hasOwnProperty('yes')) {
                            const boolKeys = Object.keys(record.data).filter(k => k.startsWith('udfchkbox') || k.includes('chkbox'));
                            if (boolKeys.length >= 2) { yesField = boolKeys[0]; noField = boolKeys[1]; }
                        }

                        const currentYes = record.get(yesField);
                        const currentNo = record.get(noField);

                        if (lotoMode === 'yes' && currentYes !== '-1') {
                            record.set(yesField, '-1'); record.set(noField, '0');
                            needsSaving = true; modifiedCount++;
                        } else if (lotoMode === 'no' && currentNo !== '-1') {
                            record.set(yesField, '0'); record.set(noField, '-1');
                            needsSaving = true; modifiedCount++;
                        }
                    });

                    if (needsSaving) {
                        setStatus(`Synced ${modifiedCount} LOTO items. Saving...`, '#2ecc71', true);
                        await saveGridData();
                    }
                }
            }
        }

        // --- PHASE 2: PM CHECKS (10-Tech) ---
        if (pmChecks > 0) {
            setStatus('Loading 10-Tech Activity...', '#3498db', true);

            const isReady = await switchActivity('10');

            if (isReady) {
                let pmGrid = getGridStore();
                if (pmGrid && pmGrid.getStore().getCount() > 0) {
                    let pmModified = 0;
                    let needsSaving = false;

                    pmGrid.getStore().each((record, index) => {
                        if (index < pmChecks) {
                            let yesField = 'yes', noField = 'no';
                            if (!record.data.hasOwnProperty('yes')) {
                                const boolKeys = Object.keys(record.data).filter(k => k.startsWith('udfchkbox') || k.includes('chkbox'));
                                if (boolKeys.length >= 2) { yesField = boolKeys[0]; noField = boolKeys[1]; }
                            }

                            const isAlreadyCompleted = (record.data.hasOwnProperty('completed') && record.get('completed') === '-1') || record.get(yesField) === '-1';

                            if (!isAlreadyCompleted) {
                                if (record.data.hasOwnProperty('completed')) record.set('completed', '-1');
                                record.set(yesField, '-1');
                                record.set(noField, '0');
                                needsSaving = true;
                                pmModified++;
                            }
                        }
                    });

                    if (needsSaving) {
                        setStatus(`Synced ${pmModified} PM Checks. Saving...`, '#2ecc71', true);
                        await saveGridData();
                    }
                } else {
                    setStatus('No items found on 10-Tech.', '#e74c3c');
                }
            }
        }

        const hdrContainers = activeExt.ComponentQuery.query('uxtabcontainer[itemId=HDR]');
        if (hdrContainers.length > 0) mainTabPanel.setActiveTab(hdrContainers[0]);
    }

    /** =========================
     * Execution Flows
     * ========================= */
    async function executeAutoFillFlow(fallbackTitle) {
        if (window.self !== window.top) return;
        if (isRunning) return;
        isRunning = true;

        try {
            loadPresets();

            let activeTitle = '';

            const allDocs = [window.top.document, document];
            document.querySelectorAll('iframe').forEach(f => { try { if (f.src && f.src.includes('amazon.dev')) return; if (f.contentDocument) allDocs.push(f.contentDocument); } catch(e){} });

            for (const d of allDocs) {
                if (!d) continue;
                const descInputs = Array.from(d.querySelectorAll('input[name="description"]')).filter(el => {
                    const style = window.getComputedStyle(el);
                    return style.display !== 'none' && style.visibility !== 'hidden' && el.offsetParent !== null;
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
                // FIXED: Removed the 'true' keepOpen flag
                setStatus('Error: Could not read WO Title.', '#e74c3c');
                isRunning = false; return;
            }

            const titleLower = activeTitle.toLowerCase();
            let matchedData = null;

            for (const key in presets.autofill) {
                const kwString = presets.autofill[key].keyword;
                if (!kwString) continue;

                const keywords = kwString.split(',').map(k => k.trim().toLowerCase()).filter(k => k.length > 0);

                if (keywords.some(k => titleLower.includes(k))) {
                    matchedData = presets.autofill[key];
                    break;
                }
            }

            if (!matchedData) {
                const shortTitle = activeTitle.length > 25 ? activeTitle.substring(0, 25) + '...' : activeTitle;
                // FIXED: Removed the 'true' keepOpen flag
                setStatus(`No match for: "${shortTitle}"`, '#e74c3c');
                isRunning = false; return;
            }

            setStatus(`Auto-Filling Template: ${matchedData.keyword}`, '#f1c40f', true);

            // 1. Inject WO Record Data
            await injectExtJSFieldsNative(matchedData);

            // 2. Inject Checklist Data
            if (matchedData.lotoMode !== 'none' || matchedData.pmChecks > 0) {
                await executeChecklistsNative(matchedData);
            }

            setStatus('Auto-Fill Complete.', '#1abc9c');
        } catch (e) {
            console.error('[APM] Critical Error in executeAutoFillFlow:', e);
            setStatus('Script Error (See Console)', '#e74c3c');
        } finally {
            isRunning = false;
        }
    }

    /** =========================
     * UI Injection & Alignment Logic (Dynamic DOM)
     * ========================= */
    function injectCreatorBtn() {
        if (window.self !== window.top) return;

        // 1. Locate the Anchor (Forecast if available, else last native EAM button)
        let anchorRect = null;

        // Target the native ExtJS wrapper for Forecast first
        const forecastBtn = document.getElementById('apm-forecast-ext-btn') || document.getElementById('eam-forecast-toggle');

        if (forecastBtn && forecastBtn.getBoundingClientRect().width > 0) {
            anchorRect = forecastBtn.getBoundingClientRect();
        } else {
            // Fallback: Find the last visible native EAM button
            const rawBtns = Array.from(document.querySelectorAll('.x-btn-mainmenuButton-toolbar-small'));
            const visibleBtns = rawBtns.filter(b => b.getBoundingClientRect().width > 0);
            if (visibleBtns.length > 0) {
                anchorRect = visibleBtns[visibleBtns.length - 1].getBoundingClientRect();
            }
        }

        if (!anchorRect) return; // Header not drawn yet

        let toggleBtn = document.getElementById('apm-creator-toggle');

        // 2. If button exists, constantly update its location (handles window resizing!)
        if (toggleBtn) {
            toggleBtn.style.left = (anchorRect.right + 12) + 'px';
            toggleBtn.style.top = anchorRect.top + 'px';
            return;
        }

        // 3. Create the button natively in the DOM
        toggleBtn = document.createElement('div');
        toggleBtn.id = 'apm-creator-toggle';

        // Use FIXED positioning and append to BODY so EAM's framework cannot hide it
        toggleBtn.style.cssText = `
            position: fixed;
            left: ${anchorRect.right + 12}px;
            top: ${anchorRect.top}px;
            height: ${anchorRect.height || 42}px;
            display: flex; align-items: center;
            cursor: pointer; padding: 0 10px; color: #d1d1d1;
            font-family: sans-serif; font-size: 13px; font-weight: 600;
            z-index: 99999; transition: color 0.15s; user-select: none;
        `;

        toggleBtn.innerHTML = `APM Suite <span style="color:#e74c3c; margin-left:4px; font-weight:bold;">+</span>`;

        toggleBtn.onmouseenter = () => { toggleBtn.style.color = '#fff'; };
        toggleBtn.onmouseleave = () => { toggleBtn.style.color = '#d1d1d1'; };

        toggleBtn.onclick = () => {
            const p = document.getElementById('apm-creator-panel');
            const isHidden = p.style.display === 'none' || p.style.display === '';
            if (isHidden) {
                const rect = toggleBtn.getBoundingClientRect();
                p.style.top = (rect.bottom + 6) + 'px';
                p.style.left = (rect.left - 200) + 'px';
                p.style.display = 'block';
            } else { p.style.display = 'none'; }
        };

        // Append to BODY to bypass ExtJS layout managers completely
        document.body.appendChild(toggleBtn);
    }

    /** =========================
     * AutoFill Trigger Logic
     * ========================= */
    function injectAutoFillTriggers() {
        if (window.self !== window.top || isRunning) return;

        loadPresets();

        // --- DECLARE LOCAL STATE ---
        let isRecordViewActive = false;
        let foundTitle = "";

        // 1. Gather visible contexts safely
        const allWins = [window.top, window];
        const allDocs = [window.document];

        document.querySelectorAll('iframe').forEach(f => {
            try {
                // FIX: Ask for .Ext inside the try/catch so it fails safely on amazon.dev
                if (f.contentWindow && f.contentWindow.Ext) {
                    allWins.push(f.contentWindow);
                }
                if (f.contentDocument) {
                    allDocs.push(f.contentDocument);
                }
            } catch(err){}
        });

        // 2. Scan ExtJS contexts for an active Record View form
        allWins.forEach(win => {
            try {
                if (win.Ext && win.Ext.ComponentQuery) {
                    const forms = win.Ext.ComponentQuery.query('form');
                    const rvForm = forms.find(f => f.id && f.id.includes('recordview') && typeof f.isVisible === 'function' && f.isVisible(true));

                    if (rvForm) {
                        isRecordViewActive = true;
                        const descField = rvForm.getForm().findField('description');
                        if (descField) {
                            foundTitle = (descField.getValue() || '').trim().toLowerCase();
                        }
                    }
                }
            } catch(err) {}
        });

        // FIX: Capture values into constants to resolve ESLint "no-loop-func"
        const currentWoTitle = foundTitle;
        const isFormReady = isRecordViewActive;

        // 3. Inject/Remove buttons
        allDocs.forEach(d => {
            if (!d) return;

            if (!isFormReady || !currentWoTitle) {
                d.querySelectorAll('#apm-btn-do-autofill').forEach(btn => btn.remove());
                return;
            }

            const titles = d.querySelectorAll('.recorddesc');
            titles.forEach(titleEl => {
                if (titleEl.getAttribute('aria-labelledby')?.includes('module_header')) {
                    const parent = titleEl.parentElement;
                    const existingBtn = parent.querySelector('#apm-btn-do-autofill');

                    let hasMatch = false;
                    for (const key in presets.autofill) {
                        const kwString = presets.autofill[key].keyword;
                        if (!kwString) continue;

                        const keywords = kwString.split(',').map(k => k.trim().toLowerCase()).filter(Boolean);
                        if (keywords.some(k => currentWoTitle.includes(k))) {
                            hasMatch = true;
                            break;
                        }
                    }

                    if (hasMatch && !existingBtn) {
                        const btn = d.createElement('button');
                        btn.id = 'apm-btn-do-autofill';
                        btn.innerHTML = 'Auto Fill ⚡';
                        btn.style.cssText = 'margin-left: 15px; padding: 4px 10px; background: #3498db; color: white; border: none; border-radius: 4px; font-weight: bold; cursor: pointer; font-size: 11px; vertical-align: middle; transition: background 0.2s;';

                        btn.onmouseenter = () => { btn.style.background = '#2980b9'; };
                        btn.onmouseleave = () => { btn.style.background = '#3498db'; };

                        btn.onclick = (e) => {
                            e.preventDefault();
                            executeAutoFillFlow(titleEl.textContent.trim());
                        };

                        parent.style.display = 'flex';
                        parent.style.alignItems = 'center';
                        parent.appendChild(btn);
                    } else if (!hasMatch && existingBtn) {
                        existingBtn.remove();
                    }
                }
            });
        });
    }

    /** =========================
     * Global Watcher Loop
     * ========================= */
    setInterval(() => {
        buildCreatorUI();
        injectCreatorBtn(); // <--- Restored to DOM version
        injectAutoFillTriggers();
        checkForUpdates()

        // Let the script autonomously search for and fix Grids and Tabs continuously
        applyGridConsistency();
        applyTabConsistency();

        // ExtJS Menu Patches
        applyPanelAutoClose()

    }, 1500);

    /** =========================
 * Window Resize Re-centering
 * ========================= */
    window.addEventListener('resize', () => {
        const panel = document.getElementById('apm-creator-panel');
        if (panel && panel.style.display !== 'none') {
            const vHeight = window.innerHeight;
            const panelHeight = panel.offsetHeight;
            const currentTop = parseInt(panel.style.top);

            // If the bottom of the panel is now off-screen due to resize/zoom
            if (currentTop + panelHeight > vHeight) {
                panel.style.top = Math.max(10, vHeight - panelHeight - 20) + 'px';
            }
        }
    });

})();