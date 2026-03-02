// ==UserScript==
// @name         APM Master: ColorCode & Nametags
// @namespace    https://w.amazon.com/bin/view/Users/rosendah/APM-Master/
// @version      3.9.13
// @description  Physical Icon Injection + Zero-Math Hitboxes.
// @author       Jacob Rosendahl
// @icon         https://media.licdn.com/dms/image/v2/D5603AQGdCV0_LQKRfQ/profile-displayphoto-scale_100_100/B56ZyZLvQ5HgAg-/0/1772096519061?e=1773878400&v=beta&t=eWO1Jiy0-WbzG_yBv-SBrmmsVOPMexF57-q1Xh_VXCk
// @match        https://us1.eam.hxgnsmartcloud.com/*
// @match        https://eu1.eam.hxgnsmartcloud.com/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

/* --------------------------------------------------------------------------
   RECENT FEATURES & BUG FIXES:
   - v3.9.11 Feature: You can now click on any custom tags and it will hide all other rows in the grid withough that same tag,
     had to abandon the CSS rendering for physical injection, slight but insignifigant performance hit. Row fill color is still a CSS overlay with HW accelaration.
   - v3.9.11 Bug Fix: After much trying, CSS stamping for links was abandoned due to reliability issues, its a small performance hit. Back to physical injection.
   - v3.9.1  Bug Fix: Fixed the theme injection to work on all routes getting to APM that I know of with a intercept, inject,
     and redirect and session store 10 sec timeout to prevent infinite redirect loop.
   - v3.9.0 UI/UX: Replaced the Uniform Highlight checkbox with a sleek toggle switch for Uniform vs. Alternating Shading.
   - v3.8.0 Feature: Added System Theme selector. Automatically injects &uitheme modifiers.
   - v3.5.0 Feature: Integrated a "Help & Tips" guide directly into the UI.
   - v3.3.0 Feature: Added Priority Sorting (Up/Down) and Full Rule Editing capabilities.
   - v3.2.0 Feature: Upgraded nametags to Cell-Level targeting and multi-tagging capabilities.
   - v3.2.4 Bug Fix; Fixed another issue with live color & rule updates by adding cross-frame syncing
   - v3.0.0 Unified Release: Combined ColorCode and Linkifier into a single sequential engine. Unified logic prevents Linkifier from interrupting ColorCode repaints.
   - v2.3.0 High-Efficiency Rendering: Re-engineered coloring logic to use dynamic CSS variables and data-attribute stamping.
   - v2.0.0 Feature: Added Export/Import ability and toggle for name tag & row color fill.
   - v1.1.1 Bug Fix: Fixed broken grid hover/selection shading.

   -------------------------------------------------------------------------- */

(function() {
    'use strict';

    const STORAGE_KEY_RULES = 'apm_colorcode_rules';
    const STORAGE_KEY_SETTINGS = 'apm_colorcode_settings';
    const LINK_CONFIG = {
        tenant: "AMAZONRMENA_PRD",
        userFuncName: "WSJOBS",
        woPattern: /\b(100\d{8,})\b/
    };

    let rules = JSON.parse(localStorage.getItem(STORAGE_KEY_RULES)) || [];
    let settings = JSON.parse(localStorage.getItem(STORAGE_KEY_SETTINGS)) || { uniformHighlight: false, theme: 'default' };

    /** =========================
     * 1. Theme Engine & URL Sanitizer
     * ========================= */
    function enforceTheme() {
        if (window.self !== window.top) return;

        const currentUrl = new URL(window.location.href);
        const path = currentUrl.pathname.toLowerCase();

        if (path.includes('/web/base/common') && currentUrl.searchParams.has('uitheme')) {
            currentUrl.searchParams.delete('uitheme');
            window.location.replace(currentUrl.toString());
            return;
        }

        if (!settings.theme || settings.theme === 'default') return;
        if (path.includes('/sso/') || path.includes('ssoservlet') || path.includes('xmlhttp')) return;

        if (path.includes('/web/base/')) {
            const currentThemeParam = currentUrl.searchParams.get('uitheme');
            if (currentThemeParam === settings.theme) return;

            const lastRedirect = parseInt(sessionStorage.getItem('apm_theme_last_redirect') || '0');
            if (Date.now() - lastRedirect < 10000) return;

            sessionStorage.setItem('apm_theme_last_redirect', Date.now().toString());

            const safeUrl = new URL(window.location.origin + '/web/base/logindisp');
            safeUrl.searchParams.set('tenant', LINK_CONFIG.tenant);
            safeUrl.searchParams.set('uitheme', settings.theme);

            if (currentUrl.searchParams.has('workordernum')) {
                safeUrl.searchParams.set('workordernum', currentUrl.searchParams.get('workordernum'));
                safeUrl.searchParams.set('SYSTEM_FUNCTION_NAME', currentUrl.searchParams.get('SYSTEM_FUNCTION_NAME') || 'WSJOBS');
                safeUrl.searchParams.set('USER_FUNCTION_NAME', currentUrl.searchParams.get('USER_FUNCTION_NAME') || 'WSJOBS');
            }

            window.location.replace(safeUrl.toString());
        }
    }
    enforceTheme();

    document.addEventListener('DOMContentLoaded', () => {
        let observer;
        let editingRuleId = null;

        /** =========================
         * GitHub Update Engine
         * ========================= */
        const GITHUB_RAW_URL = 'https://raw.githubusercontent.com/jaker788-create/APM-Master/main/nametag.user.js';

        async function checkForManualUpdate() {
            try {
                const response = await fetch(GITHUB_RAW_URL);
                const text = await response.text();
                
                // Use Regex to find the version in the remote file
                const versionMatch = text.match(/@version\s+([\d.]+)/);
                if (versionMatch && versionMatch[1]) {
                    const remoteVer = versionMatch[1];
                    const localVer = '3.9.13'; // Match this to your current metadata version

                    if (remoteVer.localeCompare(localVer, undefined, { numeric: true, sensitivity: 'base' }) > 0) {
                        if (confirm(`🚀 New Version Found: v${remoteVer}\n(Current: v${localVer})\n\nWould you like to install the update now?`)) {
                            window.location.href = GITHUB_RAW_URL;
                        }
                    } else {
                        alert(`✅ You are up to date! (v${localVer})`);
                    }
                }
            } catch (e) {
                console.error("[APM Master] GitHub Update Check Failed:", e);
                alert("❌ Update check failed. Ensure you are connected to the network.");
            }
        }
        
        /** =========================
         * 2. Core UI & Injection Styles
         * ========================= */
        const style = document.createElement('style');
        style.innerHTML = `
            .apm-nametag {
                display: table; color: #ffffff; font-weight: bold; font-size: 11px;
                padding: 3px 6px; border-radius: 4px; margin-top: 5px;
                text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.3);
                line-height: 1.2; text-shadow: 0px 1px 1px rgba(0,0,0,0.5);
                cursor: pointer; transition: transform 0.1s, outline 0.1s;
            }
            .apm-nametag:hover { transform: scale(1.05); outline: 1px solid rgba(255,255,255,0.6); }

            #apm-filter-banner { position: fixed; top: 10px; left: 50%; transform: translateX(-50%); background: #e74c3c; color: white; padding: 6px 16px; border-radius: 20px; font-weight: bold; font-size: 13px; cursor: pointer; z-index: 2147483647; display: none; box-shadow: 0 4px 10px rgba(0,0,0,0.5); }
            #apm-filter-banner:hover { background: #c0392b; }

            .apm-wo-link { color: #007bff !important; text-decoration: underline !important; font-weight: bold !important; cursor: pointer; }

            /* Physical Icon Styling */
            .apm-copy-icon {
                display: inline-block;
                background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='13' height='13' viewBox='0 0 24 24' fill='none' stroke='%23007bff' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='9' y='9' width='13' height='13' rx='2' ry='2'%3E%3C/rect%3E%3Cpath d='M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1'%3E%3C/path%3E%3C/svg%3E");
                background-repeat: no-repeat; background-position: center;
                width: 14px; height: 14px; margin-left: 8px; vertical-align: middle; cursor: copy; opacity: 0.4; transition: opacity 0.15s;
            }
            .apm-copy-icon:hover { opacity: 1; }
            .apm-copy-success {
                background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='13' height='13' viewBox='0 0 24 24' fill='none' stroke='%2328a745' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='20 6 9 17 4 12'%3E%3C/polyline%3E%3C/svg%3E") !important;
                opacity: 1;
            }

            /* Menu UI */
            #apm-colorcode-panel { position: fixed; z-index: 99999; padding: 15px; background: #35404a; color: white; border: 1px solid #2c353c; border-radius: 8px; box-shadow: 0px 8px 25px rgba(0,0,0,0.6); font-family: sans-serif; width: 380px; display: none; flex-direction: column; }
            #apm-colorcode-panel input[type="text"] { width: 100%; padding: 8px; margin-bottom: 10px; border-radius: 4px; border: none; background: #ecf0f1; color: #2c3e50; font-family: inherit; }
            .rule-item { display: flex; justify-content: space-between; align-items: center; background: #2b343c; padding: 6px 8px; border-radius: 4px; margin-bottom: 6px; border-left: 4px solid #1abc9c; }
            .rule-btn { background: #4a5a6a; color: white; border: none; border-radius: 4px; padding: 4px 6px; cursor: pointer; font-size: 11px; font-weight: bold; }
            .rule-btn:hover { background: #5c6d7e; }
            .rule-delete-btn { background: transparent; color: #e74c3c; border: none; border-radius: 4px; padding: 4px 6px; cursor: pointer; font-size: 12px; font-weight: bold; }
            .rule-delete-btn:hover { background: rgba(231, 76, 60, 0.2); }
            .rule-dir-btn { background: transparent; border: none; color: #b0bec5; cursor: pointer; font-size: 12px; padding: 0 4px; line-height: 1; }
            .rule-dir-btn:hover { color: #ffffff; }
            .cc-footer-btn { background: #4a5a6a; color: white; border: none; padding: 6px 10px; border-radius: 4px; font-size: 11px; font-weight: bold; cursor: pointer; transition: background 0.2s; }
            .cc-footer-btn:hover { background: #5c6d7e; }
            .cc-toggle-switch { position: relative; display: inline-block; width: 32px; height: 18px; margin: 0; }
            .cc-toggle-switch input { opacity: 0; width: 0; height: 0; }
            .cc-toggle-slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #505f6e; transition: .3s; border-radius: 18px; }
            .cc-toggle-slider:before { position: absolute; content: ""; height: 12px; width: 12px; left: 3px; bottom: 3px; background-color: white; transition: .3s; border-radius: 50%; }
            .cc-toggle-switch input:checked + .cc-toggle-slider { background-color: #1abc9c; }
            .cc-toggle-switch input:checked + .cc-toggle-slider:before { transform: translateX(14px); }
            #cc-guide-container h4 { color: #1abc9c; margin: 10px 0 5px 0; font-size: 13px; }
            #cc-guide-container ul { margin: 0 0 10px 0; padding-left: 20px; font-size: 12px; color: #bdc3c7; line-height: 1.4; }
            #cc-guide-container li { margin-bottom: 4px; }
            #cc-guide-container p { font-size: 12px; color: #bdc3c7; line-height: 1.4; margin: 0 0 10px 0; }
        `;
        document.head.appendChild(style);

        let activeFilterStyle = document.createElement('style');
        activeFilterStyle.id = 'apm-filter-style';
        document.head.appendChild(activeFilterStyle);

        if (window.self === window.top) {
            let filterBanner = document.createElement('div');
            filterBanner.id = 'apm-filter-banner';
            document.body.appendChild(filterBanner);
        }

        window.addEventListener('message', (e) => {
            if (e.data.type === 'APM_SET_FILTER') {
                const kw = e.data.kw;
                activeFilterStyle.innerHTML = kw ? `.x-grid-item:not([data-apm-row-text*="${kw.replace(/"/g, '\\"')}"]) { display: none !important; }` : '';

                if (window.self === window.top) {
                    const banner = document.getElementById('apm-filter-banner');
                    if (kw) {
                        banner.innerHTML = `🔍 Showing only: "${kw}" ✖ (Click to clear)`;
                        banner.style.display = 'block';
                    } else {
                        banner.style.display = 'none';
                    }
                    document.querySelectorAll('iframe').forEach(f => {
                        try { if (f.contentWindow) f.contentWindow.postMessage(e.data, '*'); } catch(err){}
                    });
                }
            }
        });

        function triggerFilter(kw) {
            if (window.self === window.top) {
                window.postMessage({ type: 'APM_SET_FILTER', kw: kw }, '*');
            } else {
                window.top.postMessage({ type: 'APM_SET_FILTER', kw: kw }, '*');
            }
        }

        // --- Dynamic Colors ---
        function hexToRgbVals(hex) {
            let r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
            return `${r}, ${g}, ${b}`;
        }

        function fullStyleUpdate() {
            rules.forEach(rule => {
                const rgb = hexToRgbVals(rule.color);
                const baseOp = settings.uniformHighlight ? '0.22' : '0.15';
                const safeId = rule.id.toString().replace('.', '_');
                document.documentElement.style.setProperty(`--cc-color-${safeId}`, rule.color);
                document.documentElement.style.setProperty(`--cc-bg-${safeId}`, `rgba(${rgb}, ${baseOp})`);
                document.documentElement.style.setProperty(`--cc-bg-alt-${safeId}`, `rgba(${rgb}, 0.22)`);
                document.documentElement.style.setProperty(`--cc-bg-hover-${safeId}`, `rgba(${rgb}, 0.30)`);
                document.documentElement.style.setProperty(`--cc-bg-sel-${safeId}`, `rgba(${rgb}, 0.45)`);
            });

            let ds = document.getElementById('apm-cc-dynamic-styles');
            if (!ds) { ds = document.createElement('style'); ds.id = 'apm-cc-dynamic-styles'; document.head.appendChild(ds); }
            let css = '';
            rules.forEach(rule => {
                const safeId = rule.id.toString().replace('.', '_');
                if (rule.fill) {
                    css += `
                        .x-grid-item[data-cc-rule="${rule.id}"] { background-color: var(--cc-bg-${safeId}) !important; }
                        .x-grid-item.x-grid-item-alt[data-cc-rule="${rule.id}"] { background-color: var(--cc-bg-alt-${safeId}) !important; }
                        .x-grid-item.x-grid-item-over[data-cc-rule="${rule.id}"],
                        .x-grid-item[data-cc-rule="${rule.id}"]:hover { background-color: var(--cc-bg-hover-${safeId}) !important; }
                        .x-grid-item.x-grid-item-selected[data-cc-rule="${rule.id}"] { background-color: var(--cc-bg-sel-${safeId}) !important; }
                    `;
                }
            });
            if (ds.innerHTML !== css) ds.innerHTML = css;
        }

        /** =========================
         * 3. Core Grid Processing
         * ========================= */
        function processGrid(root = document) {

            if (observer && root === document) observer.disconnect();
            const rows = root.querySelectorAll('.x-grid-item');

            rows.forEach(row => {
                try {
                    const text = row.textContent;
                    const lowerText = text.toLowerCase();
                    row.setAttribute('data-apm-row-text', lowerText);
                    row.removeAttribute('data-cc-rule');

                    let colorRuleApplied = false;
                    const cells = row.querySelectorAll('.x-grid-cell-inner');

                    // 1. Purge tags that no longer have a matching, active rule
                    row.querySelectorAll('.apm-nametag').forEach(tag => {
                        const kw = tag.getAttribute('data-filter-kw');
                        const isStillValid = rules.some(r => r.search.toLowerCase() === kw && r.showTag && lowerText.includes(kw));
                        if (!isStillValid) tag.remove();
                    });

                    for (let rule of rules) {
                        const searchStr = rule.search.toLowerCase();

                        if (lowerText.includes(searchStr)) {
                            // Apply background color to the highest priority match
                            if (!colorRuleApplied && rule.fill) {
                                row.setAttribute('data-cc-rule', rule.id);
                                colorRuleApplied = true;
                            }

                            // Handle Nametags
                            if (rule.showTag && rule.tag) {
                                cells.forEach(cell => {
                                    if (cell.textContent.toLowerCase().includes(searchStr)) {
                                        let existingTag = cell.querySelector(`.apm-nametag[data-filter-kw="${searchStr}"]`);
                                        const safeId = rule.id.toString().replace('.', '_');
                                        const formattedTagText = rule.tag.replace(/\\n/g, '<br>');

                                        if (!existingTag) {
                                            // Create new tag
                                            const t = root.createElement('div');
                                            t.className = 'apm-nametag';
                                            t.style.backgroundColor = `var(--cc-color-${safeId})`;
                                            t.innerHTML = formattedTagText;
                                            t.title = `Click to show "${rule.search}" only`;
                                            t.setAttribute('data-filter-kw', searchStr);
                                            cell.appendChild(t);
                                        } else {
                                            // Live-update existing tag in case the user edited the text/color
                                            existingTag.style.backgroundColor = `var(--cc-color-${safeId})`;
                                            if (existingTag.innerHTML !== formattedTagText) {
                                                existingTag.innerHTML = formattedTagText;
                                            }
                                        }
                                    }
                                });
                            }
                        }
                    }
                } catch (e) { /* Ignore ExtJS skeleton rows */ }

                // Physical Injection Logic
                try {
                    row.querySelectorAll('.x-grid-cell-inner').forEach(cell => {
                        if (cell.hasAttribute('data-apm-linkified')) return;

                        const match = cell.textContent.match(LINK_CONFIG.woPattern);
                        if (match) {
                            const woNum = match[1];
                            const baseQuery = `tenant=${LINK_CONFIG.tenant}&FROMEMAIL=YES&SYSTEM_FUNCTION_NAME=WSJOBS&USER_FUNCTION_NAME=${LINK_CONFIG.userFuncName}&workordernum=${woNum}`;
                            const copyUrl = `https://us1.eam.hxgnsmartcloud.com/web/base/logindisp?${baseQuery}`;
                            const openUrl = (settings.theme && settings.theme !== 'default') ? `${copyUrl}&uitheme=${settings.theme}` : copyUrl;

                            cell.setAttribute('data-apm-linkified', 'true');

                            for (let node of cell.childNodes) {
                                if (node.nodeType === 3 && node.textContent.includes(woNum)) {
                                    const container = document.createElement('span');
                                    container.style.whiteSpace = 'nowrap';

                                    // Native Link element handles opening naturally
                                    const link = document.createElement('a');
                                    link.className = 'apm-wo-link';
                                    link.textContent = woNum;
                                    link.href = openUrl;
                                    link.target = '_blank';

                                    // Dedicated copy element
                                    const copyIcon = document.createElement('span');
                                    copyIcon.className = 'apm-copy-icon';
                                    copyIcon.setAttribute('data-wo-copy-url', copyUrl);

                                    container.appendChild(link);
                                    container.appendChild(copyIcon);
                                    node.replaceWith(container);
                                    break;
                                }
                            }
                        }
                    });
                } catch (e) { }
            });

            // Header Icon Sync
            try {
                document.querySelectorAll('span.recordcode').forEach(el => {
                    if (el.hasAttribute('data-wo-num')) return;
                    const match = el.textContent.match(LINK_CONFIG.woPattern);
                    if (match) {
                        const woNum = match[1];
                        const baseQuery = `tenant=${LINK_CONFIG.tenant}&FROMEMAIL=YES&SYSTEM_FUNCTION_NAME=WSJOBS&USER_FUNCTION_NAME=${LINK_CONFIG.userFuncName}&workordernum=${woNum}`;

                        el.setAttribute('data-wo-num', woNum);

                        const copyIcon = document.createElement('span');
                        copyIcon.className = 'apm-copy-icon';
                        copyIcon.setAttribute('data-wo-copy-url', `https://us1.eam.hxgnsmartcloud.com/web/base/logindisp?${baseQuery}`);
                        el.appendChild(copyIcon);
                    }
                });
            } catch (e) { }

            if (observer) observer.observe(document.body, { childList: true, subtree: true });
        }

        /** =========================
         * 4. Zero-Math Event Capture
         * ========================= */
        window.addEventListener('click', (e) => {
            // 1. Direct Click on Physical Copy Icon
            if (e.target.classList.contains('apm-copy-icon')) {
                e.preventDefault(); e.stopPropagation();

                const copyUrl = e.target.getAttribute('data-wo-copy-url');
                const targetEl = e.target;

                const doFallback = (txt) => {
                    const doc = targetEl.ownerDocument || document;
                    const ta = doc.createElement('textarea');
                    ta.value = txt; ta.style.position = 'fixed'; ta.style.opacity = '0';
                    doc.body.appendChild(ta); ta.select(); doc.execCommand('copy');
                    doc.body.removeChild(ta);
                    targetEl.classList.add('apm-copy-success');
                    setTimeout(() => targetEl.classList.remove('apm-copy-success'), 1500);
                };

                if (navigator.clipboard && window.isSecureContext) {
                    navigator.clipboard.writeText(copyUrl).then(() => {
                        targetEl.classList.add('apm-copy-success');
                        setTimeout(() => targetEl.classList.remove('apm-copy-success'), 1500);
                    }).catch(() => doFallback(copyUrl));
                } else {
                    doFallback(copyUrl);
                }

            // 2. Click on Hyperlink
            } else if (e.target.classList.contains('apm-wo-link') || e.target.closest('a.apm-wo-link')) {
                e.stopPropagation(); // Just stop ExtJS from processing the row click, let the native <a> tag open the tab

            // 3. Tag Filter Click
            } else if (e.target.classList.contains('apm-nametag')) {
                e.preventDefault(); e.stopPropagation();
                triggerFilter(e.target.getAttribute('data-filter-kw'));

            // 4. Banner Clear Click
            } else if (e.target.id === 'apm-filter-banner') {
                e.preventDefault(); e.stopPropagation();
                triggerFilter(null);
            }
        }, true);

        /** =========================
         * 5. UI Panel & Setup
         * ========================= */
        function resetForm() {
            editingRuleId = null;
            document.getElementById('cc-search').value = '';
            document.getElementById('cc-tag').value = '';
            document.getElementById('cc-add-btn').textContent = 'Save';
            document.getElementById('cc-add-btn').style.background = '#1abc9c';
            document.getElementById('cc-cancel-btn').style.display = 'none';
            document.getElementById('cc-color').value = '#e74c3c';
            document.getElementById('cc-show-tag').checked = true;
            document.getElementById('cc-fill').checked = false;
        }

        function buildMenu() {
            if (window.self !== window.top || document.getElementById('apm-colorcode-panel')) return;
            const panel = document.createElement('div');
            panel.id = 'apm-colorcode-panel';
            panel.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px; border-bottom: 1px solid #4a5a6a; padding-bottom: 10px;">
                    <h4 style="margin:0; font-size:16px; color:#ffffff; font-weight: normal;">ColorCode & <span style="color:#1abc9c; font-weight: bold;">Nametags</span> 🎨</h4>
                    <button id="apm-cc-close" style="background:#505f6e; color:#ffffff; border:none; padding: 4px 10px; border-radius:4px; cursor:pointer;">✖</button>
                </div>

                <div id="cc-main-view">
                    <div style="background:#2b343c; padding: 12px; border-radius: 6px; margin-bottom: 10px;">
                        <input type="text" id="cc-search" placeholder="Target text... (Description, Equipment, etc.)">
                        <input type="text" id="cc-tag" placeholder="Nametag text... (Use \\n for line breaks)">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-top: 5px;">
                            <div style="display:flex; align-items:center; gap: 12px;">
                                <input type="color" id="cc-color" value="#e74c3c" style="cursor:pointer; height: 26px; width: 40px; border:none;">
                                <label style="font-size: 11px; color:#b0bec5; cursor:pointer;"><input type="checkbox" id="cc-show-tag" checked> Tag</label>
                                <label style="font-size: 11px; color:#b0bec5; cursor:pointer;"><input type="checkbox" id="cc-fill"> Fill</label>
                            </div>
                            <div style="display:flex; gap: 6px;">
                                <button id="cc-cancel-btn" style="background:#7f8c8d; color:white; border:none; padding: 6px 10px; border-radius:4px; cursor:pointer; display:none;">Cancel</button>
                                <button id="cc-add-btn" style="background:#1abc9c; color:white; border:none; padding: 6px 12px; border-radius:4px; cursor:pointer;">Save</button>
                            </div>
                        </div>
                    </div>

                    <div style="padding: 0 5px 10px 5px; border-bottom: 1px solid #4a5a6a; margin-bottom: 10px; display: flex; flex-direction: column; gap: 10px;">
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                            <div style="display:flex; align-items:center; gap: 8px;">
                                <label class="cc-toggle-switch">
                                    <input type="checkbox" id="cc-setting-uniform" ${settings.uniformHighlight ? 'checked' : ''}>
                                    <span class="cc-toggle-slider"></span>
                                </label>
                                <span id="cc-uniform-label" style="font-size: 12px; color: #1abc9c; font-weight: bold; user-select: none;">
                                    ${settings.uniformHighlight ? 'Uniform Shading' : 'Alternating Shading'}
                                </span>
                            </div>

                            <select id="cc-setting-theme" style="padding: 4px; border-radius: 4px; border: none; background: #ecf0f1; color: #2c3e50; font-size: 11px; cursor: pointer;">
                                <option value="default" ${(!settings.theme || settings.theme === 'default') ? 'selected' : ''}>System Default Theme</option>
                                <option value="theme-hex-dark" ${settings.theme === 'theme-hex-dark' ? 'selected' : ''}>Dark Hex</option>
                                <option value="theme-dark" ${settings.theme === 'theme-dark' ? 'selected' : ''}>Dark Classic</option>
                                <option value="theme-darkblue" ${settings.theme === 'theme-darkblue' ? 'selected' : ''}>Dark Blue</option>
                                <option value="theme-hex" ${settings.theme === 'theme-hex' ? 'selected' : ''}>Light Hex</option>
                                <option value="theme-orange" ${settings.theme === 'theme-orange' ? 'selected' : ''}>Orange</option>
                                <option value="theme-highcontrast" ${settings.theme === 'theme-highcontrast' ? 'selected' : ''}>High Contrast</option>
                                <option value="theme-ux3" ${settings.theme === 'theme-ux3' ? 'selected' : ''}>UX3 (Legacy)</option>
                            </select>
                        </div>
                        <input type="text" id="cc-rule-filter" placeholder="🔍 Filter saved rules..." style="width: 100%; padding: 8px; border-radius: 4px; border: none; background: #ecf0f1; color: #2c3e50; font-size: 12px; box-sizing: border-box;">
                    </div>
                    <div id="cc-rules-container" style="max-height: 200px; overflow-y: auto; padding-right: 4px;"></div>
                </div>

                <div id="cc-guide-container" style="display:none; max-height: 380px; overflow-y: auto; padding-right: 6px;">
                    <p>This tool scans your grid for specific keywords. When it finds a match, it highlights the row or injects a nametag.</p>
                    <h4>1. Filtering</h4>
                    <ul>
                        <li>Click any injected nametag to instantly filter the grid to show only rows matching that keyword.</li>
                        <li>Click the red warning banner at the top to clear the filter.</li>
                    </ul>
                    <h4>2. Row Backgrounds & Priority</h4>
                    <ul>
                        <li>Check <strong>Fill</strong> to color the background of the row.</li>
                        <li>Use <strong>▲ / ▼</strong> to move important rules to the top (highest rule wins the color).</li>
                    </ul>
                    <h4>3. The Linkifier</h4>
                    <ul>
                        <li>Click WO numbers to open them. Click the space <em>next</em> to the number to instantly copy the link.</li>
                    </ul>
                    <h4>4. Sharing</h4>
                    <ul>
                        <li>Use <strong>Export</strong> and <strong>Import</strong> to share setups with teammates.</li>
                    </ul>
                </div>

                <div style="display:flex; justify-content:space-between; align-items:center; margin-top:10px; border-top: 1px solid #4a5a6a; padding-top:10px;">
                    <button id="cc-import-btn" class="cc-footer-btn" title="Paste a config code from a teammate">📥 Import</button>
                    <button id="cc-update-btn" class="cc-footer-btn" style="background:#2980b9;">🔄 Check Update</button>
                    <button id="cc-help-btn" class="cc-footer-btn" style="background:transparent; color:#3498db; border:1px solid #3498db; width: 110px;">ℹ️ Help & Tips</button>
                    <button id="cc-export-btn" class="cc-footer-btn" title="Copy your config code to the clipboard">📤 Export</button>
                </div>
            `;
            document.body.appendChild(panel);

            document.getElementById('apm-cc-close').onclick = () => {
                panel.style.display = 'none'; resetForm();
                document.getElementById('cc-main-view').style.display = 'block';
                document.getElementById('cc-guide-container').style.display = 'none';
                document.getElementById('cc-help-btn').textContent = 'ℹ️ Help & Tips';
                document.getElementById('cc-help-btn').style.background = 'transparent';
                document.getElementById('cc-help-btn').style.color = '#3498db';
            };

            document.getElementById('cc-help-btn').onclick = (e) => {
                const mainView = document.getElementById('cc-main-view');
                const guideView = document.getElementById('cc-guide-container');
                if (mainView.style.display === 'none') {
                    mainView.style.display = 'block'; guideView.style.display = 'none';
                    e.target.textContent = 'ℹ️ Help & Tips'; e.target.style.background = 'transparent'; e.target.style.color = '#3498db';
                } else {
                    mainView.style.display = 'none'; guideView.style.display = 'block';
                    e.target.textContent = '🔙 Back to Rules'; e.target.style.background = '#3498db'; e.target.style.color = 'white';
                }
            };

            document.getElementById('cc-setting-uniform').onchange = (e) => {
                settings.uniformHighlight = e.target.checked;
                localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
                document.getElementById('cc-uniform-label').textContent = e.target.checked ? 'Uniform Shading' : 'Alternating Shading';
                fullStyleUpdate();
            };

            document.getElementById('cc-setting-theme').onchange = (e) => {
                const selectedTheme = e.target.value;
                settings.theme = selectedTheme;
                localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));

                if (confirm('Applying a new UI Theme requires EAM to reload. Reload now?')) {
                    const cleanUrl = new URL(window.location.origin + '/web/base/logindisp');
                    cleanUrl.searchParams.set('tenant', LINK_CONFIG.tenant);
                    if (selectedTheme !== 'default') cleanUrl.searchParams.set('uitheme', selectedTheme);
                    window.location.replace(cleanUrl.toString());
                }
            };

            document.getElementById('cc-rule-filter').oninput = (e) => renderRules(e.target.value.toLowerCase());
            document.getElementById('cc-cancel-btn').onclick = () => resetForm();

            document.getElementById('cc-add-btn').onclick = () => {
                const s = document.getElementById('cc-search').value.trim();
                if (!s) return;
                const newRuleData = { search: s, tag: document.getElementById('cc-tag').value, color: document.getElementById('cc-color').value, fill: document.getElementById('cc-fill').checked, showTag: document.getElementById('cc-show-tag').checked };
                if (editingRuleId) {
                    const idx = rules.findIndex(r => r.id === editingRuleId);
                    if (idx > -1) rules[idx] = { ...rules[idx], ...newRuleData };
                } else {
                    rules.push({ id: Date.now(), ...newRuleData });
                }
                saveAndSync(); resetForm();
            };

            document.getElementById('cc-export-btn').onclick = () => {
                try {
                    const b64 = btoa(unescape(encodeURIComponent(JSON.stringify(rules))));
                    navigator.clipboard.writeText(b64).then(() => alert('Configuration code copied to clipboard!\n\nPaste this in Slack or email to share your setup.'));
                } catch (e) { alert('Error generating export code.'); }
            };

            document.getElementById('cc-import-btn').onclick = () => { 
                const input = prompt('Paste your teammate\'s configuration code here:');
                if (input && input.trim()) {
                    try {
                        const importedRules = JSON.parse(decodeURIComponent(escape(atob(input.trim()))));
                        if (!Array.isArray(importedRules) || importedRules.length === 0) return alert('No valid rules found.');
                        if (confirm('Do you want to REPLACE your existing rules entirely?\n\n[OK] = Replace.\n[Cancel] = Append to bottom.')) {
                            rules = importedRules;
                        } else {
                            importedRules.forEach(r => { r.id = Date.now() + Math.random(); rules.push(r); });
                        }
                        saveAndSync(); alert(`Successfully imported ${importedRules.length} rules!`);
                    } catch (e) { alert('Invalid configuration code.'); }
                }
            };
            // NEW: Update Button Slot
            document.getElementById('cc-update-btn').onclick = () => {
                checkForManualUpdate();
            };
            renderRules();
        }

        function renderRules(filterStr = '') {
            const container = document.getElementById('cc-rules-container');
            if (!container) return;
            const filtered = filterStr ? rules.filter(r => r.search.toLowerCase().includes(filterStr)) : rules;
            container.innerHTML = filtered.length ? '' : `<div style="text-align:center; font-size:12px; color:#7f8c8d; margin:10px;">No rules found.</div>`;

            filtered.forEach((rule) => {
                const el = document.createElement('div');
                el.className = 'rule-item';
                el.style.borderLeftColor = rule.color;
                el.innerHTML = `
                    <div style="display:flex; flex-direction:column; gap: 2px; margin-right: 6px;">
                        <button class="rule-dir-btn rule-up-btn" data-id="${rule.id}" title="Move Priority Up">▲</button>
                        <button class="rule-dir-btn rule-down-btn" data-id="${rule.id}" title="Move Priority Down">▼</button>
                    </div>
                    <div style="display:flex; flex-direction:column; flex-grow: 1; overflow:hidden;">
                        <span style="font-size:12px; font-weight:bold; color:white; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${rule.search}</span>
                        <span style="font-size:10px; color:#b0bec5;">${rule.tag || 'No Tag'}</span>
                    </div>
                    <div style="display:flex; align-items:center; gap: 6px;">
                        <input type="color" class="rule-picker" data-id="${rule.id}" value="${rule.color}" style="width:20px; height:20px; border:none; background:none; cursor:pointer;" title="Quick Color Change">
                        <button class="rule-btn rule-edit-btn" data-id="${rule.id}" title="Edit Rule">✏️</button>
                        <button class="rule-delete-btn" data-id="${rule.id}" title="Delete Rule">❌</button>
                    </div>
                `;
                container.appendChild(el);
            });

            container.querySelectorAll('.rule-delete-btn').forEach(btn => btn.onclick = (e) => {
                const targetId = parseFloat(e.target.getAttribute('data-id'));
                rules = rules.filter(r => r.id !== targetId);
                if (editingRuleId === targetId) resetForm();
                saveAndSync();
            });

            container.querySelectorAll('.rule-edit-btn').forEach(btn => btn.onclick = (e) => {
                const targetId = parseFloat(e.target.getAttribute('data-id'));
                const rule = rules.find(r => r.id === targetId);
                if (!rule) return;
                document.getElementById('cc-search').value = rule.search;
                document.getElementById('cc-tag').value = rule.tag || '';
                document.getElementById('cc-color').value = rule.color;
                document.getElementById('cc-show-tag').checked = rule.showTag;
                document.getElementById('cc-fill').checked = rule.fill;
                editingRuleId = targetId;
                document.getElementById('cc-add-btn').textContent = 'Update';
                document.getElementById('cc-add-btn').style.background = '#f39c12';
                document.getElementById('cc-cancel-btn').style.display = 'inline-block';
            });

            container.querySelectorAll('.rule-up-btn').forEach(btn => btn.onclick = (e) => {
                const id = parseFloat(e.target.getAttribute('data-id'));
                const idx = rules.findIndex(r => r.id === id);
                if (idx > 0) { [rules[idx - 1], rules[idx]] = [rules[idx], rules[idx - 1]]; saveAndSync(); }
            });

            container.querySelectorAll('.rule-down-btn').forEach(btn => btn.onclick = (e) => {
                const id = parseFloat(e.target.getAttribute('data-id'));
                const idx = rules.findIndex(r => r.id === id);
                if (idx < rules.length - 1) { [rules[idx + 1], rules[idx]] = [rules[idx], rules[idx + 1]]; saveAndSync(); }
            });

            container.querySelectorAll('.rule-picker').forEach(p => {
                p.addEventListener('input', (e) => {
                    const id = parseFloat(e.target.getAttribute('data-id'));
                    const newColor = e.target.value;
                    const idx = rules.findIndex(r => r.id === id);
                    if (idx > -1) {
                        rules[idx].color = newColor;
                        e.target.closest('.rule-item').style.borderLeftColor = newColor;
                        fullStyleUpdate();
                        localStorage.setItem(STORAGE_KEY_RULES, JSON.stringify(rules));
                    }
                });
            });
        }

        function saveAndSync(skipUI = false) {
            localStorage.setItem(STORAGE_KEY_RULES, JSON.stringify(rules));
            fullStyleUpdate();
            if (!skipUI) renderRules();
            processGrid();
        }

        function injectToolbar() {
            if (window.self !== window.top) return;
            const bulletins = document.querySelector('.uft-id-bulletins, [class*="uft-id-bulletins"]');
            if (!bulletins || document.getElementById('btn-colorcode-menu')) return;
            const ref = bulletins.closest('.x-btn') || bulletins;
            const btn = document.createElement('div');
            btn.id = 'btn-colorcode-menu';
            const currentLeft = parseInt(ref.style.left || '0', 10);
            btn.style.cssText = `position: absolute; top: ${ref.style.top || '0px'}; left: ${currentLeft - 202}px; height: ${ref.offsetHeight || 42}px; display: inline-flex; align-items: center; cursor: pointer; padding: 0 12px; color: #d1d1d1; font-family: sans-serif; font-size: 13px; font-weight: 600; z-index: 9999; transition: color 0.15s; white-space: nowrap;`;
            btn.innerHTML = `ColorCode & Nametags 🎨`;
            btn.onmouseenter = () => btn.style.color = '#1abc9c';
            btn.onmouseleave = () => btn.style.color = '#d1d1d1';
            btn.onclick = () => {
                const p = document.getElementById('apm-colorcode-panel');
                p.style.display = (p.style.display === 'none' || !p.style.display) ? 'flex' : 'none';
                const r = btn.getBoundingClientRect();
                p.style.top = (r.bottom + 6) + 'px'; p.style.left = Math.max(0, r.right - 380) + 'px';
            };
            ref.parentNode.appendChild(btn);
        }

        window.addEventListener('storage', (e) => {
            if (e.key === STORAGE_KEY_RULES) { rules = JSON.parse(e.newValue || '[]'); fullStyleUpdate(); renderRules(); processGrid(); }
            else if (e.key === STORAGE_KEY_SETTINGS) { settings = JSON.parse(e.newValue || '{}'); fullStyleUpdate(); processGrid(); }
        });

        fullStyleUpdate();
        observer = new MutationObserver(() => {
            clearTimeout(window.apmMasterTO);
            window.apmMasterTO = setTimeout(() => { injectToolbar(); buildMenu(); processGrid(); }, 150);
        });
        observer.observe(document.body, { childList: true, subtree: true });
        setTimeout(processGrid, 2000);
    });
})();