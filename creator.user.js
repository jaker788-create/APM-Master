// ==UserScript==
// @name         APM Master: WO Creator & Auto-Fill + Tab Re-Order
// @namespace    https://w.amazon.com/bin/view/Users/rosendah/APM-Master/
// @version      0.6.14
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
   - v0.6.14 Bug Fix: Removed problematic defocus logic
   - v0.6.13 Bug Fix: Abandoned the "run-once" tagging for a continuous audit loop. The script now monitors physical tab positions every 1.5s and snaps them back if EAM's AJAX updates revert the layout.
   - v0.6.10 Feature: Menu will close if you click away
   - v0.6.9 Feature: UI improvements
   - v0.6.8 Feature: Can fill out 10-tech (always yes/completed). Need to refine UI
   - v0.6.7 Bug Fix: Native checklist navigate and check y/n works! Now to try 10-tech
   - v0.6.6 Test: Iteration on checklist process
   - v0.6.5 Bug Fix: Repaired autofill triggers, applied correct save command, adjusted checklist logic after some probing but may still need iterations to fix
   - v0.6.4 Bug Fix: Minor APM tantrum because I was giving it an unsupported function, but it did not break the tab reorder function
   - v0.6.2 Improved interface for tab reorder and added ability to adjust record view tabs
   - v0.6.0 Added ability to reorder WO list view tabs
   - v0.5.2 This is getting big... Record creaton fills out the first page sucessfully via ExtJS calls. Next to test and complete checklist fill.
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
    let activeTab = 'creator';

    /** =========================
     * Data Management
     * ========================= */
    let presets = {
        creator: {},
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
                presets.creator = parsed.creator || {};
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
        // Safely capture the PM checks field, allowing it to be completely blank
        const rawPm = document.getElementById('apm-c-pm-checks').value.trim();
        const pmParsed = rawPm === '' ? '' : parseInt(rawPm, 10);

        return {
            keyword: document.getElementById('apm-c-keyword')?.value.trim() || '',
            org: document.getElementById('apm-c-org').value.trim().toUpperCase(),
            eq: document.getElementById('apm-c-eq').value.trim().toUpperCase(),
            desc: document.getElementById('apm-c-desc').value.trim(),
            type: document.getElementById('apm-c-type').value,
            status: document.getElementById('apm-c-status').value,
            exec: document.getElementById('apm-c-exec').value,
            safety: document.getElementById('apm-c-safety').value,
            lotoMode: document.getElementById('apm-c-loto-mode').value,
            pmChecks: pmParsed, // Uses the safely parsed value
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
        document.getElementById('apm-c-desc').value = data.desc || '';
        document.getElementById('apm-c-type').value = data.type || '';
        document.getElementById('apm-c-status').value = data.status || '';
        document.getElementById('apm-c-exec').value = data.exec || '';
        document.getElementById('apm-c-safety').value = data.safety || '';
        document.getElementById('apm-c-loto-mode').value = data.lotoMode || 'none';

        // FIXED: Strictly check for undefined so '0' doesn't get converted to a blank space
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
        #apm-creator-panel select, #apm-creator-panel input { outline: none !important; }
        .creator-btn { cursor: pointer; transition: background 0.2s; font-weight: bold; border-radius: 4px; border: none; padding: 6px 12px; font-size: 12px; }
        .preset-row { display: flex; gap: 8px; align-items: center; background: #2b343c; padding: 10px; border-radius: 6px; margin-bottom: 15px; }
        .field-row { display: flex; gap: 10px; margin-bottom: 10px; align-items: center; }
        .field-label { font-size: 12px; color: #b0bec5; white-space: nowrap; width: 100px; text-align: right; }
        .field-input { flex-grow: 1; padding: 6px; border-radius: 4px; border: none; background: #ecf0f1; color: #2c3e50; }
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
     * UI Builder (Panel)
     * ========================= */
    let settingsMode = 'cols'; // 'cols' or 'tabs'

    function buildCreatorUI() {
        if (window.self !== window.top || document.getElementById('apm-creator-panel')) return;

        loadPresets();

        const panel = document.createElement('div');
        panel.id = 'apm-creator-panel';
        panel.style = 'position:fixed; z-index:99999; padding:15px; background:#35404a; color:white; border:1px solid #2c353c; border-radius:8px; box-shadow: 0px 8px 25px rgba(0,0,0,0.6); font-family:sans-serif; width: 480px; display:none; top: 60px; right: 20px;';

       panel.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                <h4 style="margin:0; font-size:18px; color:#ffffff; font-weight: normal;">APM Master <span style="color:#e74c3c; font-weight: bold;">Suite</span></h4>
                <button id="apm-c-btn-close" style="background:#505f6e; color:#ffffff; border:none; padding: 4px 10px; border-radius:4px; cursor:pointer; font-size:14px; font-weight:bold;">✖</button>
            </div>

            <div style="display:flex; margin-bottom:15px; background:#2b343c; border-radius:6px; overflow:hidden;">
                <div id="tab-creator" class="apm-tab-btn apm-tab-active-creator">Creator</div>
                <div id="tab-autofill" class="apm-tab-btn apm-tab-inactive">Auto Fill</div>
                <div id="tab-settings" class="apm-tab-btn apm-tab-inactive">Settings</div>
            </div>

            <div id="apm-main-fields">
                <div class="preset-row">
                    <select id="apm-c-preset-select" style="flex-grow:1; padding:6px; border-radius:4px; border:none; font-weight:bold; cursor:pointer;"></select>
                    <button id="apm-c-btn-save" class="creator-btn" style="background:#3498db; color:white;">Save</button>
                    <button id="apm-c-btn-new" class="creator-btn" style="background:#2ecc71; color:white;">New</button>
                    <button id="apm-c-btn-del" class="creator-btn" style="background:#e74c3c; color:white;">Del</button>
                </div>

                <div style="padding-right: 5px; margin-bottom: 15px;">
                    <div class="field-row" id="row-keyword" style="display:none;">
                        <div class="field-label" style="color:#3498db; font-weight:bold;">WO Title:</div>
                        <input type="text" id="apm-c-keyword" class="field-input" placeholder="Partial or full title match...">
                    </div>

                    <div class="field-row"><div class="field-label">Organization:</div><input type="text" id="apm-c-org" class="field-input upper"></div>
                    <div class="field-row"><div class="field-label">Equipment:</div><input type="text" id="apm-c-eq" class="field-input upper" placeholder="Search Term..."></div>
                    <div class="field-row" id="row-desc"><div class="field-label">Description:</div><input type="text" id="apm-c-desc" class="field-input"></div>

                    <div style="border-top: 1px solid #4a5a6a; margin: 12px 0;"></div>

                    <div style="display: flex; gap: 10px; margin-bottom: 10px;">
                        <div style="flex: 1;">
                            <div class="field-row"><div class="field-label" style="width: 50px;">Type:</div><select id="apm-c-type" class="field-input"><option value="">- Skip -</option><option value="Breakdown">Breakdown</option><option value="Corrective">Corrective</option><option value="Project">Project</option></select></div>
                            <div class="field-row"><div class="field-label" style="width: 50px;">Status:</div><select id="apm-c-status" class="field-input"><option value="">- Skip -</option><option value="Open">Open</option><option value="In Progress">In Progress</option></select></div>
                        </div>
                        <div style="flex: 1;">
                            <div class="field-row"><div class="field-label" style="width: 50px;">Exec:</div><select id="apm-c-exec" class="field-input"><option value="">- Skip -</option><option value="EXDN">EXDN</option><option value="EXDB">EXDB</option><option value="EXMW">EXMW</option><option value="EXOPS">EXOPS</option><option value="EXSHUT">EXSHUT</option></select></div>
                            <div class="field-row"><div class="field-label" style="width: 50px;">Safety:</div><select id="apm-c-safety" class="field-input"><option value="">- Skip -</option><option value="No">No</option><option value="Yes">Yes</option></select></div>
                        </div>
                    </div>

                    <div class="field-row" style="background: rgba(155, 89, 182, 0.15); border: 1px solid rgba(155, 89, 182, 0.4); padding: 8px; border-radius: 6px;">
                        <div class="field-label" style="color:#c39bd3; font-weight:bold; width: 70px;">Checklists:</div>
                        <select id="apm-c-loto-mode" class="field-input" style="flex: 1; padding: 4px; font-size: 11px;">
                            <option value="none">- Skip LOTO -</option>
                            <option value="yes">LOTO: Yes</option>
                            <option value="no">LOTO: No</option>
                        </select>
                        <div style="font-size: 11px; color: #b0bec5; margin: 0 8px; white-space: nowrap; font-weight: bold;">PMs:</div>
                        <input type="number" id="apm-c-pm-checks" class="field-input" min="0" placeholder="Qty" style="width: 50px; padding: 4px; font-size: 12px; text-align: center; font-weight: bold;">
                    </div>

                    <div style="display: flex; gap: 10px; margin-bottom: 10px;">
                         <div style="flex: 1;">
                             <div class="field-row"><div class="field-label" style="width: 50px;">Prob:</div><input type="text" id="apm-c-prob" class="field-input upper"></div>
                             <div class="field-row"><div class="field-label" style="width: 50px;">Cause:</div><input type="text" id="apm-c-cause" class="field-input upper"></div>
                         </div>
                         <div style="flex: 1;">
                             <div class="field-row"><div class="field-label" style="width: 50px;">Fail:</div><input type="text" id="apm-c-fail" class="field-input upper"></div>
                             <div class="field-row"><div class="field-label" style="width: 50px;">Assign:</div><input type="text" id="apm-c-assign" class="field-input upper"></div>
                         </div>
                    </div>

                    <div class="field-row"><div class="field-label" style="width: 80px;">Start / End:</div><input type="date" id="apm-c-start" style="flex: 1; padding:4px; font-size:11px;"><span style="display:inline-block; width:15px; text-align:center;">-</span><input type="date" id="apm-c-end" style="flex: 1; padding:4px; font-size:11px;"></div>
                    <div class="field-row"><div class="field-label" style="width: 80px;">Comments:</div><input type="text" id="apm-c-close" class="field-input"></div>
                </div>

                <button id="apm-c-btn-generate" style="width:100%; background:#e74c3c; color:white; border:none; padding:12px; border-radius:6px; cursor:pointer; font-weight:bold; font-size:14px; transition: background 0.2s;">⚡ Generate New Record</button>
            </div>

            <div id="apm-settings-fields" style="display:none;">
                <div style="display:flex; margin-bottom:10px; background:#22292f; border-radius:4px; overflow:hidden;">
                    <div id="apm-s-tog-cols" style="flex:1; text-align:center; padding:8px; cursor:pointer; font-size:12px; font-weight:bold; background:#3498db; color:#fff;">Grid Columns</div>
                    <div id="apm-s-tog-tabs" style="flex:1; text-align:center; padding:8px; cursor:pointer; font-size:12px; font-weight:bold; color:#7f8c8d;">Record Tabs</div>
                </div>

                <div style="color:#3498db; font-weight:bold; margin-bottom: 5px;" id="apm-s-title">Visual Order:</div>
                <div style="font-size:11px; color:#aaa; margin-bottom:10px;">Drag and drop to reorder. Top item appears furthest left.</div>

                <button id="apm-s-btn-fetch" style="width:100%; background:#f39c12; color:white; border:none; padding:8px; border-radius:4px; cursor:pointer; font-weight:bold; margin-bottom:10px;">1. Pull Visible Items from Screen</button>

                <div id="apm-s-col-list" style="background:#22292f; border:1px solid #45535e; border-radius:4px; padding:5px; min-height:60px; max-height:220px; overflow-y:auto; margin-bottom:10px;">
                    </div>

                <button id="apm-s-btn-save-settings" style="width:100%; background:#2ecc71; color:white; border:none; padding:12px; border-radius:6px; cursor:pointer; font-weight:bold; font-size:14px;">2. Save Settings & Apply</button>
            </div>
        `;
        document.body.appendChild(panel);

        // Interaction Logic
        document.getElementById('apm-c-btn-close').onclick = () => { panel.style.display = 'none'; };

        const selectEl = document.getElementById('apm-c-preset-select');
        const mainFields = document.getElementById('apm-main-fields');
        const settingsFields = document.getElementById('apm-settings-fields');

        const tabCreator = document.getElementById('tab-creator');
        const tabAutofill = document.getElementById('tab-autofill');
        const tabSettings = document.getElementById('tab-settings');
        const rowKw = document.getElementById('row-keyword');
        const btnGen = document.getElementById('apm-c-btn-generate');

        const togCols = document.getElementById('apm-s-tog-cols');
        const togTabs = document.getElementById('apm-s-tog-tabs');
        const colListContainer = document.getElementById('apm-s-col-list');

        const resetTabs = () => {
            tabCreator.style.background = 'transparent';
            tabAutofill.style.background = 'transparent';
            tabSettings.style.background = 'transparent';
        };

        const renderPresetOptions = () => {
            selectEl.innerHTML = '';
            const targetList = activeTab === 'creator' ? presets.creator : presets.autofill;
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
        };

        // --- Probing Functions ---
        const probeExtGridColumns = () => {
            let cols = [];
            const allDocs = [window.top, window];
            document.querySelectorAll('iframe').forEach(f => {
                try { if (f.contentWindow && f.contentWindow.Ext) allDocs.push(f.contentWindow); } catch(e){}
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
                try { if (f.contentWindow && f.contentWindow.Ext) allDocs.push(f.contentWindow); } catch(e){}
            });

            for (const win of allDocs) {
                if (win.Ext && win.Ext.ComponentQuery) {
                    const tabPanels = win.Ext.ComponentQuery.query('tabpanel');
                    // Find the TabPanel holding Header, Activities, etc.
                    const mainTabPanel = tabPanels.find(tp => tp.rendered && tp.items && tp.items.items.length > 3 &&
                        tp.items.items.some(t => {
                            let txt = t.title || t.text || '';
                            return txt.includes('Activities') || txt.includes('Checklist') || txt.includes('Comments');
                        }));

                    if (mainTabPanel) {
                        mainTabPanel.items.items.forEach(t => {
                            // Check if tab is visually accessible
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
                item.innerHTML = `<span><b style="color:#3498db;">☰</b> &nbsp; ${c.text}</span> <span style="color:#7f8c8d; font-size:10px;">[${settingsMode === 'cols' ? c.index : 'Tab'}]</span>`;

                item.ondragstart = (e) => {
                    e.dataTransfer.setData('text/plain', '');
                    item.classList.add('dragging');
                };
                item.ondragend = () => { item.classList.remove('dragging'); };

                colListContainer.appendChild(item);
            });
        };

        // Container Drop Logic
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

        const loadSettingsView = () => {
            if (settingsMode === 'cols') {
                togCols.style.background = '#3498db'; togCols.style.color = '#fff';
                togTabs.style.background = 'transparent'; togTabs.style.color = '#7f8c8d';
                const saved = (presets.config.columnOrder || '').split(',').map(s => s.trim()).filter(s => s);
                renderDragList(saved.map(idx => ({ index: idx, text: idx })), 'No grid found. Open the Work Orders screen and click Pull.');
            } else {
                togTabs.style.background = '#3498db'; togTabs.style.color = '#fff';
                togCols.style.background = 'transparent'; togCols.style.color = '#7f8c8d';
                const saved = (presets.config.tabOrder || '').split(',').map(s => s.trim()).filter(s => s);
                renderDragList(saved.map(idx => ({ index: idx, text: idx })), 'No record tabs found. Open a Work Order and click Pull.');
            }
        };

        togCols.onclick = () => { settingsMode = 'cols'; loadSettingsView(); };
        togTabs.onclick = () => { settingsMode = 'tabs'; loadSettingsView(); };

        // Tab Setup
        tabCreator.onclick = () => {
            activeTab = 'creator';
            resetTabs(); tabCreator.style.background = '#3498db';
            mainFields.style.display = 'block'; settingsFields.style.display = 'none';
            rowKw.style.display = 'none'; btnGen.style.display = 'block';
            renderPresetOptions();
        };

        tabAutofill.onclick = () => {
            activeTab = 'autofill';
            resetTabs(); tabAutofill.style.background = '#3498db';
            mainFields.style.display = 'block'; settingsFields.style.display = 'none';
            rowKw.style.display = 'block'; btnGen.style.display = 'none';
            renderPresetOptions();
        };

        tabSettings.onclick = () => {
            activeTab = 'settings';
            resetTabs(); tabSettings.style.background = '#3498db';
            mainFields.style.display = 'none'; settingsFields.style.display = 'block';
            loadSettingsView();
        };

        // Init
        renderPresetOptions();
        selectEl.onchange = () => {
            const targetList = activeTab === 'creator' ? presets.creator : presets.autofill;
            applyPresetData(targetList[selectEl.value]);
        };

        document.getElementById('apm-c-btn-save').onclick = () => {
            const targetList = activeTab === 'creator' ? presets.creator : presets.autofill;
            if (selectEl.value) {
                targetList[selectEl.value] = getCurrentFormData();
                savePresets();
            }
        };

        document.getElementById('apm-c-btn-new').onclick = () => {
            const name = prompt('New preset name:');
            if (name && name.trim()) {
                const targetList = activeTab === 'creator' ? presets.creator : presets.autofill;
                targetList[name.trim()] = getCurrentFormData();
                savePresets(); renderPresetOptions();
                selectEl.value = name.trim();
            }
        };

        document.getElementById('apm-c-btn-del').onclick = () => {
            const targetList = activeTab === 'creator' ? presets.creator : presets.autofill;
            if (selectEl.value && confirm(`Delete preset "${selectEl.value}"?`)) {
                delete targetList[selectEl.value];
                savePresets(); renderPresetOptions();
            }
        };

        // Settings Buttons
        document.getElementById('apm-s-btn-fetch').onclick = () => {
            if (settingsMode === 'cols') {
                setStatus('Probing ExtJS Grid...', '#f39c12');
                const cols = probeExtGridColumns();
                renderDragList(cols, 'No grid found.');
                if (cols.length > 0) setStatus('Grid columns loaded.', '#2ecc71');
            } else {
                setStatus('Probing ExtJS Tabs...', '#f39c12');
                const tabs = probeExtTabs();
                renderDragList(tabs, 'No record tabs found.');
                if (tabs.length > 0) setStatus('Record tabs loaded.', '#2ecc71');
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

                // Force active elements to unlock so they get resorted immediately
                forceRetagExtJs();
            } else {
                setStatus('No items to save.', '#e74c3c');
            }
        };

        document.getElementById('apm-c-btn-generate').onclick = () => { if (!isRunning) executeCreatorFlow(); };
    }


    /** =========================
     * UI Customizations (Grid & Tabs)
     * ========================= */

    // Forces the loop to re-evaluate components after a settings save
    function forceRetagExtJs() {
        const allDocs = [window.top, window];
        document.querySelectorAll('iframe').forEach(f => {
            try { if (f.contentWindow && f.contentWindow.Ext) allDocs.push(f.contentWindow); } catch(e){}
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
            try { if (f.contentWindow && f.contentWindow.Ext) allDocs.push(f.contentWindow); } catch(e){}
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
            try { if (f.contentWindow && f.contentWindow.Ext) allDocs.push(f.contentWindow); } catch(e){}
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
            try { if (f.contentDocument) allDocs.push(f.contentDocument); } catch(e){}
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
                try { if (f.contentDocument) allDocs.push(f.contentDocument); } catch(e){}
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

    // Advanced Ajax Server Activity Checker
    async function waitForAjax(win) {
        let waited = 0;
        while(waited < 10000) {
            let isAjaxLoading = win.Ext && win.Ext.Ajax && win.Ext.Ajax.isLoading();
            let hasMask = false;
            try {
                const masks = Array.from(win.document.querySelectorAll('.x-mask, .x-mask-msg')).filter(el => {
                    const style = win.getComputedStyle(el);
                    return style.display !== 'none' && style.visibility !== 'hidden' && el.offsetParent !== null;
                });
                if (masks.length > 0) hasMask = true;
            } catch(e) {}

            if (!isAjaxLoading && !hasMask) break;

            await delay(200);
            waited += 200;
        }
        await delay(200);
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
                try { if (f.contentWindow && f.contentWindow.Ext) allDocs.push(f.contentWindow); } catch(e){}
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

        if (data.desc) setExtModelDirect(activeExt, mainForm, 'description', data.desc);
        if (data.exec) setExtModelDirect(activeExt, mainForm, 'udfchar13', data.exec);
        if (data.safety) setExtModelDirect(activeExt, mainForm, 'udfchar24', data.safety);
        if (data.close) setExtModelDirect(activeExt, mainForm, 'udfnote01', data.close);
        if (data.prob) setExtModelDirect(activeExt, mainForm, 'problemcode', data.prob);
        if (data.fail) setExtModelDirect(activeExt, mainForm, 'failurecode', data.fail);
        if (data.cause) setExtModelDirect(activeExt, mainForm, 'causecode', data.cause);
        if (data.assign) setExtModelDirect(activeExt, mainForm, 'assignedto', data.assign);

        if (data.start) setExtModelDirect(activeExt, mainForm, 'schedstartdate', formatEAMDate(data.start));
        if (data.end) setExtModelDirect(activeExt, mainForm, 'schedenddate', formatEAMDate(data.end));

        // 4. Set Dropdowns
        if (data.type) await setEamComboboxDirect(activeExt, mainForm, 'workordertype', data.type);
        if (data.status) await setEamComboboxDirect(activeExt, mainForm, 'workorderstatus', data.status);

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

        // 1. Locate Checklist Container
        for (let i = 0; i < 15; i++) {
            const allDocs = [window.top, window];
            document.querySelectorAll('iframe').forEach(f => {
                try { if (f.contentWindow && f.contentWindow.Ext) allDocs.push(f.contentWindow); } catch(e){}
            });

            for (const win of allDocs) {
                if (win.Ext && win.Ext.ComponentQuery) {
                    const containers = win.Ext.ComponentQuery.query('uxtabcontainer[itemId=ACK]');
                    if (containers.length > 0) {
                        activeExt = win.Ext;
                        checklistContainer = containers[0];
                        mainTabPanel = checklistContainer.up('tabpanel');
                        break;
                    }
                }
            }
            if (activeExt && mainTabPanel) break;
            await delay(250);
        }

        if (!activeExt || !mainTabPanel || !checklistContainer) {
            setStatus('Checklist Tab (ACK) not found.', '#e74c3c');
            return;
        }

        mainTabPanel.setActiveTab(checklistContainer);
        await delay(2000);

        const getGridStore = () => {
            const grids = activeExt.ComponentQuery.query('gridpanel', checklistContainer);
            return grids.length > 0 ? grids[0] : null;
        };

        const waitForAjax = async () => {
            let waited = 0;
            while (waited < 12000) {
                if (activeExt.Ajax && !activeExt.Ajax.isLoading()) break;
                await delay(250);
                waited += 250;
            }
            await delay(500); // Safety buffer after network resolves
        };

        const saveGridData = async () => {
            const grid = getGridStore();
            if (grid && grid.getView) grid.getView().refresh();

            // Prioritize the "Submit" button if on Checklist tab, fallback to Save Record
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

            await waitForAjax();
        };

        const handleUnsavedPopup = async () => {
            const msgBoxes = activeExt.ComponentQuery.query('messagebox');
            if (msgBoxes.length > 0) {
                const mb = msgBoxes.find(m => !m.hidden || (typeof m.isVisible === 'function' && m.isVisible()));
                if (mb) {
                    console.log("[APM] Catching unsaved changes popup. Auto-clicking 'Yes'...");
                    const yesBtn = mb.query('button[itemId=yes], button[text=Yes]')[0];
                    if (yesBtn) {
                        if (yesBtn.handler) yesBtn.handler.call(yesBtn.scope || yesBtn, yesBtn);
                        else yesBtn.fireEvent('click', yesBtn);
                        await waitForAjax();
                    }
                }
            }
        };

        // --- PHASE 1: LOTO (1-Tech) ---
        if (lotoMode && lotoMode !== 'none') {
            let chkGrid = getGridStore();
            if (chkGrid && chkGrid.getStore().getCount() > 0) {
                let modifiedCount = 0;
                chkGrid.getStore().each(record => {
                    let yesField = 'yes', noField = 'no';
                    if (!record.data.hasOwnProperty('yes')) {
                        const boolKeys = Object.keys(record.data).filter(k => k.startsWith('udfchkbox') || k.includes('chkbox'));
                        if (boolKeys.length >= 2) { yesField = boolKeys[0]; noField = boolKeys[1]; }
                    }

                    if (lotoMode === 'yes') {
                        record.set(yesField, '-1'); record.set(noField, '0'); modifiedCount++;
                    } else if (lotoMode === 'no') {
                        record.set(yesField, '0'); record.set(noField, '-1'); modifiedCount++;
                    }
                });
                setStatus(`Synced ${modifiedCount} LOTO items. Saving...`, '#2ecc71', true);
                await saveGridData();
            }
        }

        // --- PHASE 2: PM CHECKS (10-Tech) ---
        if (pmChecks > 0) {
            setStatus('Switching to 10-Tech Activity...', '#3498db', true);

            const combos = activeExt.ComponentQuery.query('combobox[name=activity]', checklistContainer);
            if (combos && combos.length > 0) {
                const actCombo = combos[0];
                const actStore = actCombo.getStore();

                let targetRec = null;
                actStore.each(rec => {
                    const val = String(rec.get(actCombo.valueField) || '');
                    const disp = String(rec.get(actCombo.displayField) || '');
                    if (val === '10' || disp.startsWith('10')) { targetRec = rec; }
                });

                if (targetRec) {
                    actCombo.setValue(targetRec.get(actCombo.valueField));
                    actCombo.fireEvent('select', actCombo, [targetRec]);
                    actCombo.fireEvent('change', actCombo, targetRec.get(actCombo.valueField));

                    await delay(600); // Wait for potential popup animation
                    await handleUnsavedPopup(); // Kill the popup if it appeared
                    await waitForAjax(); // Wait for 10-Tech grid to download
                } else {
                    console.warn("[APM] Activity '10' not found in dropdown.");
                }
            }

            let pmGrid = getGridStore();
            if (pmGrid && pmGrid.getStore().getCount() > 0) {
                let pmModified = 0;

                pmGrid.getStore().each((record, index) => {
                    if (index < pmChecks) {
                        let yesField = 'yes', noField = 'no';
                        if (!record.data.hasOwnProperty('yes')) {
                            const boolKeys = Object.keys(record.data).filter(k => k.startsWith('udfchkbox') || k.includes('chkbox'));
                            if (boolKeys.length >= 2) { yesField = boolKeys[0]; noField = boolKeys[1]; }
                        }

                        // Feed True to both standard formats
                        if (record.data.hasOwnProperty('completed')) record.set('completed', '-1');
                        record.set(yesField, '-1');
                        record.set(noField, '0');

                        pmModified++;
                    }
                });

                setStatus(`Synced ${pmModified} PM Checks. Saving...`, '#2ecc71', true);
                await saveGridData();
            } else {
                setStatus('No items found on 10-Tech.', '#e74c3c');
                await delay(1500);
            }
        }

        // Return to Record View (HDR)
        const hdrContainers = activeExt.ComponentQuery.query('uxtabcontainer[itemId=HDR]');
        if (hdrContainers.length > 0) mainTabPanel.setActiveTab(hdrContainers[0]);
    }

    /** =========================
     * Execution Flows
     * ========================= */
    async function executeCreatorFlow() {
        if (window.self !== window.top) return;
        if (isRunning) return;
        isRunning = true;

        try {
            loadPresets();

            const data = getCurrentFormData();
            if (!data.eq) { setStatus('Equipment required.', '#e74c3c'); isRunning = false; return; }

            document.getElementById('apm-creator-panel').style.display = 'none';

            setStatus('Navigating to Work Orders...', '#f1c40f', true);

            const activeTab = document.querySelector('.x-tab-active .x-tab-inner, .x-tab-active .x-tab-text');
            let isWOActive = activeTab && activeTab.textContent.trim() === 'Work Orders';

            if (!isWOActive) {
                const workMenuBtn = Array.from(document.querySelectorAll('.x-btn-inner')).find(el => el.textContent.trim() === 'Work');
                if (workMenuBtn) {
                    clickLikeUser(workMenuBtn.closest('.x-btn') || workMenuBtn);
                    let woMenuItem = null;
                    for (let i = 0; i < 20; i++) {
                        woMenuItem = Array.from(document.querySelectorAll('.x-menu-item-text')).find(el => el.textContent.trim() === 'Work Orders');
                        if (woMenuItem) break;
                        await delay(100);
                    }
                    if (woMenuItem) clickLikeUser(woMenuItem.closest('.x-menu-item') || woMenuItem);
                }

                for (let i = 0; i < 40; i++) {
                    const checkTab = document.querySelector('.x-tab-active .x-tab-inner, .x-tab-active .x-tab-text');
                    if (checkTab && checkTab.textContent.trim() === 'Work Orders') {
                        isWOActive = true;
                        break;
                    }
                    await delay(250);
                }
            }

            if (!isWOActive) {
                setStatus('Navigation Failed.', '#e74c3c', false);
                isRunning = false;
                return;
            }

            setStatus('Waiting for grid to load...', '#f1c40f', true);

            const newBtnSelectors = ['.uftid-newrec', '.uft-id-newrec', '[data-qtip*="New Record"]', 'button[aria-label="New Record"]'];
            const newBtn = await findWithRetry(document, newBtnSelectors, 50);

            if (!newBtn) {
                setStatus('Error: "New" button not found.', '#e74c3c', false);
                isRunning = false;
                return;
            }

            setStatus('Creating new record...', '#f1c40f', true);
            const clickTarget = newBtn.closest('.x-btn') || newBtn;
            clickLikeUser(clickTarget);
            try { clickTarget.click(); } catch(e){}

            // Wait for EAM's server response
            await delay(1500);

            let activeWin = window;
            for (let i = 0; i < 15; i++) {
                const allDocs = [window.top, window];
                document.querySelectorAll('iframe').forEach(f => {
                    try { if (f.contentWindow && f.contentWindow.Ext) allDocs.push(f.contentWindow); } catch(e){}
                });
                for (const w of allDocs) {
                    if (w && w.Ext && w.Ext.ComponentQuery && w.Ext.ComponentQuery.query('form').find(f => f.id.includes('recordview'))) {
                        activeWin = w; break;
                    }
                }
                if (activeWin !== window) break;
                await delay(200);
            }

            await delay(500);

            // 1. Inject WO Record Data
            await injectExtJSFieldsNative(data);

            // 2. Inject Checklist Data (Triggers if either LOTO or PM Checks are configured)
            if (data.lotoMode !== 'none' || data.pmChecks > 0) {
                await executeChecklistsNative(data);
            }

            setStatus('Record Complete.', '#1abc9c');
        } catch (e) {
            console.error('[APM] Critical Error in executeCreatorFlow:', e);
            setStatus('Script Error (See Console)', '#e74c3c');
        } finally {
            isRunning = false;
        }
    }

async function executeAutoFillFlow(fallbackTitle) {
        if (window.self !== window.top) return;
        if (isRunning) return;
        isRunning = true;

        try {
            loadPresets();

            let activeTitle = '';

            const allDocs = [window.top.document, document];
            document.querySelectorAll('iframe').forEach(f => { try { if (f.contentDocument) allDocs.push(f.contentDocument); } catch(e){} });

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
     * UI Injection Logic
     * ========================= */
    function injectCreatorBtn() {
        if (window.self !== window.top || document.getElementById('apm-creator-toggle')) return;

        const menuBtns = Array.from(document.querySelectorAll('.x-btn-mainmenuButton-toolbar-small'));
        if (menuBtns.length === 0) return;

        const parentContainer = menuBtns[0].parentElement;
        if (!parentContainer) return;

        let maxRight = 0;
        menuBtns.forEach(btn => {
            if (btn.offsetWidth > 0) {
                const left = parseInt(btn.style.left || 0, 10);
                const right = left + btn.offsetWidth;
                if (right > maxRight) maxRight = right;
            }
        });

        let targetLeft = maxRight + 12;
        const forecastBtn = document.getElementById('eam-forecast-toggle');
        if (forecastBtn && forecastBtn.offsetWidth > 0) {
            const fLeft = parseInt(forecastBtn.style.left || 0, 10);
            const fRight = fLeft + forecastBtn.offsetWidth;
            if (fRight + 12 > targetLeft) { targetLeft = fRight + 12; }
        }

        const toggleBtn = document.createElement('div');
        toggleBtn.id = 'apm-creator-toggle';
        toggleBtn.style.cssText = `
            position: absolute; left: ${targetLeft}px; top: 0px;
            height: 42px; display: flex; align-items: center;
            cursor: pointer; padding: 0 10px; color: #d1d1d1;
            font-family: sans-serif; font-size: 13px; font-weight: 600;
            z-index: 9998; transition: color 0.15s; user-select: none;
        `;

        toggleBtn.innerHTML = `APM Suite <span style="color:#e74c3c; margin-left:4px;">+</span>`;

        toggleBtn.onmouseenter = () => { toggleBtn.style.color = '#fff'; };
        toggleBtn.onmouseleave = () => { toggleBtn.style.color = '#d1d1d1'; };

        toggleBtn.onclick = () => {
            const p = document.getElementById('apm-creator-panel');
            const isHidden = p.style.display === 'none';
            if (isHidden) {
                const rect = toggleBtn.getBoundingClientRect();
                p.style.top = (rect.bottom + 6) + 'px';
                p.style.left = (rect.left - 200) + 'px';
                p.style.display = 'block';
            } else { p.style.display = 'none'; }
        };

        parentContainer.appendChild(toggleBtn);
    }

function injectAutoFillTriggers() {
        // 1. Guard: ONLY let the top-level script manage the buttons
        if (window.self !== window.top || isRunning) return;

        // 2. Gather all documents (Top window + all iframes)
        const allDocs = [window.document];
        document.querySelectorAll('iframe').forEach(f => {
            try { if (f.contentDocument) allDocs.push(f.contentDocument); } catch(e){}
        });

        // 3. Scan every document for the WO header
        allDocs.forEach(d => {
            if (!d) return;
            const titles = d.querySelectorAll('.recorddesc');

            titles.forEach(titleEl => {
                if (titleEl.getAttribute('aria-labelledby') && titleEl.getAttribute('aria-labelledby').includes('module_header')) {
                    const parent = titleEl.parentElement;

                    if (!parent.querySelector('#apm-btn-do-autofill')) {
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
        injectCreatorBtn();
        injectAutoFillTriggers();

        // Let the script autonomously search for and fix Grids and Tabs continuously
        applyGridConsistency();
        applyTabConsistency();

        // ExtJS Menu Patches
        applyPanelAutoClose()

    }, 1500);

})();