# APM Master v14 Changelog

## v14.12.1 — Autofill Reliability, Screen-Cache Visibility, CTJOBS Snapshot (2026-04-08)

### Feature
- **No Date Filter in forecast search** — New `"No Date Filter"` option in the week selector dropdown (both manual mode and dataspy builder). Unchecking all days auto-selects it; selecting a week offset restores Mon-Fri defaults. Dataspy builder toggle hides week/day controls when enabled. MADDON non-date filters (equipment, desc, org) still apply normally.
- **`forecast-profile-manager.js` — Profile summary shows "No Date Filter"** — `buildDateSummary()` returns `'No Date Filter'` for profiles with `weeks === 'none'`.

### Correctness
- **Consolidated record auto-open** — New shared `waitAndOpenSingleResult()` replaces 3 competing `openFirstGridRecord` callers (Boot, `goToRecordDirect`, quick search fallback). `_autoOpenInProgress` flag prevents concurrent `itemdblclick` events that caused blank record fields. Quick search fallback path (filter injection after Nav.goTo) removed entirely.
- **`goToRecordDirect` — 2s settle delay after Nav.goTo** — Prevents opening on the old iframe before the reload completes. Without it, the poll found the stale grid, fired `itemdblclick`, then Nav.goTo destroyed the iframe.
- **`autofill-engine.js` — `store.load()` for activity combo switching** — Replaced `ExtUtils.ensureStoreLoaded` (indirect `doQuery`/`onTriggerClick`) with direct `combo.getStore().load({ callback })` for both WO (`switchActivity`) and shift report (`executeShiftReportChecklists`) combo loading. More reliable, confirmed via live probe. Removed `ExtUtils` import.
- **`autofill-triggers.js` — Button injection screen-cache visibility fix** — `hasExisting()` now checks `existingCmp.isVisible(true)` instead of `isComponentOnActiveScreen` to detect buttons on wrong screen. Strategy 1b loops `querySelectorAll('.toolbarExpandRight')` with visibility filter. Strategy 2 filters tabpanels by `tp.isVisible(true)`. Uses direct visibility checks because autofill needs "visually visible" not "same screen."
- **`session-snapshot.js` — CTJOBS record capture via systemFunc alias** — Record guard now checks `ENTITY_REGISTRY[screen].systemFunc` alias (CTJOBS's `systemFunc` is `WSJOBS`) instead of discarding records as stale. Also preserves `_lastGridStateHash` during list→record transitions when `captureGridState` returns null (card layout hides filter/dataspy combos on CTJOBS).
- **`isComponentOnActiveScreen` reverted to original** — Returns `true` when no tabpanel ancestor. Snapshot/module-guard need the looser "same screen" check; autofill injection uses `comp.isVisible(true)` for "actually visible now." These serve different purposes and must not be conflated.

### Configuration
- **Tampermonkey update/download URLs** → `drive.corp.amazon.com/view/rosendah@/greasemonkey_scripts/APM-Master/forecast.user.js`
- **Bug report Slack link** → `https://amazon.enterprise.slack.com/archives/C0AQ158AYCS`
- **Cloudflare Worker URLs** — Replaced placeholder with deployed `apm-master.jaker788.workers.dev` endpoints.

## v14.12.0 — ModuleGuard Migration & Shared-Iframe Fixes (2026-04-07)

### Critical
- **`forecast-engine.js` — CTJOBS shared-iframe grid detection via title cross-check** — `isGridReady`, `returnToListView`, and `applyForecastFiltersExtJS` previously accepted mismatched frames when `_WO_FUNCS` equivalence passed (CTJOBS grid accepted when targeting WSJOBS). Replaced with `resolveScreenFunc()` title cross-check — only accepts a frame with stale `initpath` if the title observer confirms the target screen is active. Title observer is O(1) cached, authoritative over `initpath` which is set at iframe load time and never updates when EAM reuses the frame.
- **`forecast-engine.js` — Skip redundant navigation when already on target** — `executeForecast` always called `navigateTo` even when user was already on the target screen, causing grid column reset → re-order flash. Now checks `resolveScreenFunc() === currentTarget` before navigating. Post-navigation verification via `detectActiveTarget()` force-navigates via `launchScreenDirect` if screen-cache tab click was a no-op.
- **`forecast-engine.js` — `returnToListView` early exit** — Added `if (getEamViewState().view === 'list') return` guard. Without it, strategies 1-2 (listdetailview API, expand buttons) found nothing when already in list view, falling through to strategy 3 (`launchScreenDirect`) — full screen reload.
- **`autofill-engine.js` — `do1Tech` checkbox modification counting** — Unchecking the opposite checkbox (e.g., unchecking "No" when setting LOTO to "Yes") was not counted in `modifiedCount`. When all rows had the correct box already checked but the wrong box also checked, `modifiedCount` stayed 0, `saveGridData()` was skipped, and EAM showed unsaved-changes popup on activity switch. Both checkbox operations now increment `modifiedCount`.

### Correctness
- **`eam-title-observer.js` — `getEamViewState()` enriched with `screen` and `tab` derived fields** — New `screen` field: `SCREEN_TITLE_TO_FUNC[screenTitle]` (O(1) lookup, same as `resolveScreenFunc()`). New `tab` field: `TAB_MAP[subTab]` normalized to `'HDR'|'ACK'|'LABOR'|'LIST'|'UNKNOWN'` with `view === 'list'` fallback — fixes the UNKNOWN-for-list-view gap that caused `detectActiveTab` to skip the list view handling path. Callers now use `getEamViewState().screen || detectActiveScreen()` instead of the manual `SCREEN_TITLE_TO_FUNC[screenTitle]` assembly pattern.
- **`autofill-engine.js` — Strict record-view confirmation on `isConfirmedRecordView`** — `queryActiveView('span.recorddesc')` could match stale elements from the top frame or screen-cache frames during transitions. Previously checked `view !== 'list'` which still passed during `'unknown'` transition states (shared-iframe CTJOBS→WSJOBS). Now requires `view === 'record'` — only trusts the recorddesc match when the title observer positively confirms record view.
- **`autofill-triggers.js` — Reset healthy cooldown on screen change** — `_lastAutoFillButtonHealthy` persisted across screen switches (WSJOBS→CTJOBS). The 3-second "healthy" cooldown blocked retry scans on the new screen — first retry set `_lastAutoFillScreen` to the new screen, subsequent retries (1s apart) were blocked because `1000 < 3000`. Now resets to `false` when `funcName` changes, dropping cooldown to 400ms for immediate retry responsiveness.
- **`autofill-engine.js` — List view fallback handles UNKNOWN tab** — `detectActiveTab()` returns UNKNOWN (not LIST) when `subTab` is null. The graceful exit path (`context.tab === 'LIST'`) never fired. Now also checks `context.tab === 'UNKNOWN' && eamView === 'list'` to catch this case.
- **`ext-consistency.js` — `triggerInjections` guards against AutoFill flow** — `getIsAutoFillRunning()` check prevents `injectAutoFillTriggers` from being scheduled during the flow. Previously, the check only happened 100ms later when the debounced callback fired — by which time the flow may have crashed and reset the flag in its `finally` block, allowing a second crash cascade via `toolbar.insert()` during mid-transition layout.
- **`autofill-engine.js` — `getAccessibleDocs` title lookup consolidated** — 12-line `getAccessibleDocs()` loop with inline `getComputedStyle` visibility checks in `executeShiftReportFlow` replaced with `queryActiveView('input[name="description"]', { readOnly: true })`.
- **`labor-booker.js` — ModuleGuard migration** — Replaced `checkAllFrames()` + `checkTabAndInject(win)` frame iteration with `guard.queryDOM('.uft-id-newrec[data-qtip="Add Labor"]')`. ModuleGuard's 6-step guard chain (feature flag → nav guard → screen match → view → frame visibility → element visibility) replaces inline `isActiveFrame` + `detectActiveScreen` checks. Export changed from `checkTabAndInject` to `injectQuickBook`.
- **`closing-comments-counter.js` — Removed redundant `queryActiveView`** — `isPmType(doc)` already receives `doc` from the `guard.queryDOM` callback. Replaced `queryActiveView('input[name="workordertype"]')` (which re-ran frame iteration) with `doc.querySelector(...)` — O(1) lookup in the already-resolved document.

### Convention
- **`autofill-triggers.js` / `autofill-prefs.js` / `autofill-engine.js` — `getEamViewState().screen` replaces manual title-first pattern** — Removed `SCREEN_TITLE_TO_FUNC` imports from 3 autofill files. Screen detection now uses `getEamViewState().screen || detectActiveScreen()` — one-liner instead of 3-line destructure + lookup + fallback.


## v14.11.7 — Anchor-Based Screen-Cache Safety & WSBOOK Detection (2026-04-05)

### Critical
- **`autofill-engine.js` — Anchor-based `discoverRecordTabPanel()`** — New function replaces fragile global `ComponentQuery` lookups for finding the correct screen's record tabPanel. Walks from a visible `span.recorddesc` header (always visible for the active screen, sits above card layout) through `form[id*=recordview]` → `ownerCt` chain to the record-level tabPanel. DOM containment check (`container.el.dom.contains(anchor)`) disambiguates shared-iframe scenarios. Works identically across all 3 iframe scenarios: multi-iframe cached, shared iframe, and no screen cache.
- **`autofill-engine.js` — `ensureHDRTab` scoped Strategy 1** — When `ctx.recordTabPanel` is set by the anchor discovery, finds HDR via `tabPanel.down('uxtabcontainer[itemId=HDR]')` instead of global `findActiveTabContainer`. Title-lagging fallback: checks visible `form[id*=recordview]` when title observer hasn't settled during quick screen transitions.
- **`autofill-engine.js` — `executeChecklistsNative` scoped ACK lookup** — Uses `ctx.recordTabPanel.down('uxtabcontainer[itemId=ACK]')` as primary strategy. Eliminates the screen-cache cross-contamination where SHFRPT's ACK container (with `casemanagementtasksequence` combo) was found instead of WSJOBS's (with `activity` combo). Global search with combo-name validation kept as fallback for shift report flow.
- **`autofill-engine.js` — `findActiveTabContainer` blind fallback removed** — The `|| all[0]` fallback silently returned an arbitrary container when all visibility checks failed (both screens' sub-tabs hidden by card layout). Now returns `null` with a debug log. Callers use the scoped anchor approach instead.

### Correctness
- **`constants.js` — `SCREEN_TITLE_TO_FUNC` WSBOOK mapping** — Added `'Book Labor By Employee': 'WSBOOK'`. Previously unmapped, causing `detectActiveScreen()` Layer 0 (title) to miss WSBOOK entirely. FocusManager (Layer 1) returned stale WSJOBS during WSJOBS→WSBOOK transitions in shared iframes, allowing Quick Book button injection into WSBOOK's toolbar.
- **`session-snapshot.js` — Canonical `detectActiveScreen()` for screen detection** — Replaced direct `SCREEN_TITLE_TO_FUNC[viewState.screenTitle]` lookup in `captureState()` with `detectActiveScreen()`. Routes through the canonical detection path with all guards (title Layer 0, FocusManager Layer 1, XHR Layer 2).
- **`autofill-engine.js` — Canonical `detectActiveScreen()` in view-change handler** — Replaced direct `SCREEN_TITLE_TO_FUNC[e.detail.screenTitle]` in `APM_EAM_VIEW_CHANGE` listener with `detectActiveScreen()`. Same rationale as Snapshot fix.
- **`autofill-engine.js` — HDR return at end of checklists scoped** — Uses `mainTabPanel.down('uxtabcontainer[itemId=HDR]')` instead of global `findActiveTabContainer` for returning to Record View after checklist execution.
- **`autofill-engine.js` — Tab detection fallback via anchor tabPanel** — When `detectActiveTab()` returns UNKNOWN (title lagging during quick screen transitions), checks `ctx.recordTabPanel.getActiveTab()` to determine the actual active sub-tab. Ensures checklists run first when user IS on the checklist tab but title hasn't settled.
- **`autofill-engine.js` — Create Follow-up WO via `actionsBtn.menu.items.items`** — Accesses the Actions button's menu items directly instead of `showMenu()` → `delay(300)` → global `menuitem` query. Menu and items exist before showing. Uses stable `item.action === 'createfollowupwo'` identifier instead of regex text matching.
- **`autofill-engine.js` — Scheduler paused during AutoFill flow** — `APMScheduler.pause(30000)` at flow start, `resume()` in finally block. Prevents scheduler tasks (ext-btn-injection, autofill-button-poll, etc.) from calling `toolbar.insert()` during card layout transitions, which triggers `resumeLayouts` → `getSize` crash on components with undefined `el`.
- **`labor-booker.js` — `isAutoFillRunning` guard on Quick Book injection** — `checkTabAndInject` now checks `getIsAutoFillRunning()` before injecting. Same rationale as scheduler pause — prevents `toolbar.insert()` layout flush during AutoFill flow.

### Convention
- **`autofill-engine.js` — 10-Tech no explicit save** — Comment clarifying why `do10Tech` does NOT call `saveGridData()`: tab switches (ACK→HDR) auto-save without unsaved-changes popup, unlike activity switches within ACK which need pre-save (`do1Tech`/`do5Tech`).

## v14.11.6 — AutoFill List View, Chip UX, Preview Fix (2026-04-05)

### Correctness
- **`autofill-engine.js` — `itemdblclick` fired on view, not grid** — Grid-to-record navigation fired `grid.fireEvent('itemdblclick', grid, ...)` which gave EAM's handler the wrong `this` context, causing `getWidth`/`getSize` crashes during the list→record transition. Changed to `view.fireEvent('itemdblclick', view, ...)` matching the session-snapshot pattern.
- **`autofill-engine.js` — `'List View'` recognized in `detectActiveTab`** — Added `'List View': 'LIST'` to `TAB_MAP`. Previously mapped to `UNKNOWN`, causing the flow to skip grid-to-record navigation and attempt `ensureHDRTab` from list view (always fails).
- **`autofill-engine.js` — Fallback grid search via `getAccessibleDocs`** — When `LIST` is detected and the primary grid search (via `getExtWindows`) misses the grid, a secondary search via `getAccessibleDocs` finds the grid without `isVisible(true)` deep check. Navigates to the user's selected row.
- **`autofill-engine.js` — `ensureHDRTab` allows top frame when no iframes exist** — In non-screen-cache mode (`frames: []`), the `win === win.top` guard skipped the only available window. Now conditionally allows top frame when `wins.some(w => w !== w.top)` is false.
- **`autofill-engine.js` — Early return when `ensureHDRTab` fails** — The `else` branch (HDR/OTHER tab) continued to `needsChecklist` after record fill was aborted, causing checklist execution from list view → `this.el is undefined` crash. Now returns immediately.
- **`colorcode-ui.js` — Preview stale highlight cleanup** — Editing an existing rule and backspacing keywords left stale `data-cc-rule="__preview__"` highlights. Root cause: nametag overlays inject tag text ("daily") into `row.textContent`, creating self-reinforcing regex matches that prevented cleanup. Targeted scrub now builds clean text from `cell.childNodes` excluding `.apm-nametag` elements.
- **`colorcode-ui.js` — `clearPreview` brute-force DOM scrub** — Cancel/save now queries all `[data-cc-rule="__preview__"]` rows across accessible documents and strips decorations + nametags before reprocessing. Bypasses unreliable `processColorCodeGrid` cleanup for the `__preview__` rule.
- **`chip-input.js` / `colorcode-ui.js` — "or" label cleanup on chip × click** — Clicking the × button on a chip removed the chip but left adjacent "or" labels. Now removes the previous (or next) sibling `.cc-or-label`.

### Quality
- **`chip-input.js` / `colorcode-ui.js` — Pending chip visual** — Typing in a keyword input now wraps the input in a dashed-border "pending chip" for immediate visual feedback. Solidifies into a real chip on Enter or +. `input.focus()` after DOM reparent prevents defocus on first character.
- **`chip-input.js` — `commitPending()` method** — Auto-commits pending text as a chip. Called by `getCurrentFormData()` before reading chips, preventing silent data loss on Save.
- **`chip-input.js` / `colorcode-ui.js` — Capitalized chip text** — Keywords display with `textTransform: 'capitalize'` for readability; stored value unchanged.
- **`settings-panel-tabs.js` — Updated keyword placeholder text** — WO: "WO title keywords (OR logic if multiple)", SR: "Report title keywords (OR logic if multiple)", CC: "Row match keywords (OR logic if multiple)".

## v14.11.6 — Entity Link Cache Fix (2026-04-05)

### Correctness
- **`colorcode-engine.js` — Sub-tab grids discovered after cache hit** — `resolveEntityColumn` cached entity columns but never checked for newly appeared grids. When a user opened a sub-tab (e.g., Checklist) whose grid had a `followupwoactivity` column, the cache returned early because existing columns were still alive — new grids were invisible. Added `_lastScannedGridIds` tracking: the cache check now compares current grid IDs against the last full scan and falls through to re-scan when new grids appear. Document filter prevents COMMON-frame processing from triggering futile loadmain re-scans.
- **`colorcode-engine.js` — Follow-up WO suffix stripped in header field copy icons** — `HEADER_FIELD_ENTITIES` copy icons (e.g., workordernum on SSRCVI) passed raw form values including `-11` suffixes directly to `buildEntityUrl`. Now strips `/-\d+$/` for `workordernum` fields, matching the grid cell stripping from v14.10.17.
- **`colorcode-engine.js` — `applyEntityLink` preserves child elements in cells** — `cell.textContent = ''` destroyed ALL child elements (checkboxes, icons) when linkifying. Checklist grid cells with follow-up WO numbers and adjacent checkbox elements lost their checkboxes. Now checks `cell.childElementCount > 0` and uses a TreeWalker to replace only the text node containing the entity ID, preserving other DOM children. Text-only cells (main grid) still use the fast path.

## v14.11.5 — AutoFill HDR Fix, Shift Summary, ColorCode Storm (2026-04-05)

### Critical
- **`autofill-engine.js` — `ensureHDRTab` skips top frame** — Added `win === win.top` guard. `getExtWindows()` returns the EAM top frame first. The top frame has its own `Ext` instance with `uxtabcontainer[itemId=HDR]` components (navigation shell). `setActiveTab` on the top frame's tabpanel silently does nothing to the content iframe's record sub-tabs. Now skipped — record sub-tabs only exist in content iframes.
- **`autofill-engine.js` — `ensureHDRTab` title observer verification** — Replaced broken `getActiveTab() !== hdrTab` comparison with `getEamViewState().subTab === 'Record View'` for both "already on HDR" detection and post-switch verification. `getActiveTab()` returns the tabpanel's direct child card (a wrapper), not the `uxtabcontainer` inside it — the `!==` comparison was always `true`, causing every switch to report failure. Title observer polls every 100ms for up to 4s after `setActiveTab`.
- **`autofill-engine.js` — `findActiveTabContainer` helper** — Screen-cache-aware `uxtabcontainer` lookup. Filters ComponentQuery results by parent tabpanel DOM visibility (`isElementInActiveView`). Cached screens apply `display:none` on ancestor panels, zeroing `getBoundingClientRect` for all descendants. Single-result case skips filter. Fallback to `all[0]` if no container passes (preserves behavior during transient states). Applied to 4 call sites: `ensureHDRTab`, `executeChecklistsNative` ACK search, `executeChecklistsNative` HDR return, `detectActiveTab`.
- **`labor-booker.js` — Shift filter priority swap** — `_enteredAt` (bookingcode-based registry, unique per record) is now the PRIMARY shift boundary check. The booking log `find()` is demoted to fallback for synthetic records only. Previously, the booking log was checked first — `find()` returned the first entry matching date+hours, so when multiple bookings shared the same date and hours (e.g., 1h before and 1h after the boundary), the post-boundary record matched the pre-boundary log entry and was incorrectly excluded.
- **`labor-booker.js` — Cross-format comparison normalization** — Booking log lookups and injection now use `toIso()` (via `parseEamDate` + `getLocalIsoDate`) for dates and `toHrs()` (via `parseFloat`) for hours. Fixes `'1' !== '1.00'` hours mismatch and `'04-APR-2026' !== '04/04/2026'` date format mismatch between booking log entries and server records.
- **`labor-booker.js` — Dynamic yesterday display** — Shift summary always tallies 2 days when night shift is on (the shift boundary filter already excluded previous-shift records). Shows "Yesterday" row only if filtered records have hours for it. Replaces the time-based `showYesterday` cutoff that discarded yesterday's records after `shiftEnd + 4h` even when the boundary filter had correctly kept them.
- **`colorcode-engine.js` — rAF deduplication guard** — Added `_ccRafPending` flag to prevent multiple `requestAnimationFrame` callbacks being queued simultaneously. Without this, rapid-fire triggers from store loads, view refreshes, and discovery bursts each queued a separate rAF. The first rAF processed and cleared `_ccPendingContexts`; subsequent rAFs found an empty set and fell through to the expensive "Full Scan Fallback" that scanned ALL documents + ALL iframes. A single checklist save triggered ~15 processing cycles; now collapses to 2-3.
- **`colorcode-engine.js` — Removed `doubleTrigger` on `'refresh'` event** — The `refresh` listener previously fired twice (immediate + 250ms delayed) as a workaround for EAM two-pass rendering. This doubled triggers during store reloads. Replaced with single `trigger`. Decorations lost to second-pass rendering are recovered by the next natural event (scroll, interaction, or idle poll).
- **`colorcode-engine.js` — Throttle window increased to 1000ms** — `THROTTLE_MS` changed from 500 to 1000. During event storms (checklist saves, multi-XHR responses), the 500ms throttle forced premature execution before events settled. 1000ms allows better coalescing while still providing responsive updates during continuous scrolling.
- **`ext-consistency.js` — Removed redundant ColorCode trigger from store `'load'`** — The store `'load'` handler in `bindGridListeners` called `debouncedProcessColorCodeGrid` directly, duplicating the trigger from colorcode-engine's own grid view `'refresh'` listener which fires as a consequence of the same store load. Removed to eliminate one trigger path per store reload.

### Correctness
- **`logger.js` — `Logger.info` uses `console.log()`** — Changed from `console.info()` to match `Logger.debug` and `Logger.verbose`. `console.info()` maps to a separate browser filter category ("Info") that can be hidden independently of "Logs" in Firefox/Chrome DevTools, making AutoFill flow logs invisible even with all filters enabled. `console.warn()` and `console.error()` unchanged (distinct visual styling).
- **`labor-service.js` — Synthetic record preservation** — `addRecord()` now tracks synthetics in `_syntheticRecords`. After a server fetch overwrites the cache, unconfirmed synthetics (< 2 min, not found in server data) are merged back. Prevents the labor-tracker's force fetch on `APM_LABOR_SYNC` from wiping the synthetic record before the shift summary can render it.
- **`labor-service.js` — Return cached data including synthetics** — `fetchData` returns `laborCache.data` (server + merged synthetics) instead of raw `records`.
- **`labor-booker.js` — 30s cache window** — `fetchLaborSummary` uses cached data if last fetch was < 30s ago, avoiding redundant server round-trip when popup re-opens right after a booking.
- **`labor-booker.js` — Booking log injection** — Recent (< 2 min) booking log entries not represented in filtered results are injected as synthetic records. Last-resort guarantee for newly booked hours.
- **`labor-booker.js` — appendBookingLog normalization** — Hours stored via explicit `parseFloat` normalization for defensive consistency.

## v14.11.4 — Checklist Performance & Tab Detection Fix (2026-04-04)

### Critical
- **`labor-booker.js` — Shift filter priority swap** — `_enteredAt` (bookingcode-based registry, unique per record) is now the PRIMARY shift boundary check. The booking log `find()` is demoted to fallback for synthetic records only. Previously, the booking log was checked first — `find()` returned the first entry matching date+hours, so when multiple bookings shared the same date and hours (e.g., 1h before and 1h after the boundary), the post-boundary record matched the pre-boundary log entry and was incorrectly excluded.
- **`labor-booker.js` — Cross-format comparison normalization** — Booking log lookups and injection now use `toIso()` (via `parseEamDate` + `getLocalIsoDate`) for dates and `toHrs()` (via `parseFloat`) for hours. Fixes `'1' !== '1.00'` hours mismatch and `'04-APR-2026' !== '04/04/2026'` date format mismatch between booking log entries and server records.
- **`labor-booker.js` — Dynamic yesterday display** — Shift summary always tallies 2 days when night shift is on (the shift boundary filter already excluded previous-shift records). Shows "Yesterday" row only if filtered records have hours for it. Replaces the time-based `showYesterday` cutoff that discarded yesterday's records after `shiftEnd + 4h` even when the boundary filter had correctly kept them.

### Correctness
- **`labor-service.js` — Synthetic record preservation** — `addRecord()` now tracks synthetics in `_syntheticRecords`. After a server fetch overwrites the cache, unconfirmed synthetics (< 2 min, not found in server data) are merged back. Prevents the labor-tracker's force fetch on `APM_LABOR_SYNC` from wiping the synthetic record before the shift summary can render it.
- **`labor-service.js` — Return cached data including synthetics** — `fetchData` returns `laborCache.data` (server + merged synthetics) instead of raw `records`.
- **`labor-booker.js` — 30s cache window** — `fetchLaborSummary` uses cached data if last fetch was < 30s ago, avoiding redundant server round-trip when popup re-opens right after a booking.
- **`labor-booker.js` — Booking log injection** — Recent (< 2 min) booking log entries not represented in filtered results are injected as synthetic records. Last-resort guarantee for newly booked hours.
- **`labor-booker.js` — appendBookingLog normalization** — Hours stored via explicit `parseFloat` normalization for defensive consistency.

## v14.11.4 — Checklist Performance & Tab Detection Fix (2026-04-04)

### Critical
- **`autofill-engine.js` — `detectActiveTab()` uses title observer instead of DOM scan** — Replaced `.x-tab-active` DOM element scanning with `getEamViewState().subTab` from the shared title observer. EAM authoritatively sets `document.title` to "APM - Work Orders | Book Labor" (etc.) on tab switches — this is immune to screen-cache stale DOM where hidden panels retain `.x-tab-active` classes. Maps 'Record View'→HDR, 'Checklist'→ACK, 'Book Labor'→LABOR.
- **`autofill-engine.js` — Unconditional `ensureHDRTab()` before field injection** — Removed the `if (context.tab !== 'HDR')` guard in the default dispatch branch. `ensureHDRTab()` is now called before `injectExtJSFieldsNative()` in ALL three dispatch paths (ACK, LABOR, else). The function is a no-op when already on HDR (`getActiveTab() === hdrTab`), so no performance cost. Prevents field injection on wrong tab when detection is wrong.
- **`autofill-engine.js` — DOM checkbox clicks replace `record.set()` for checklist filling** — Checkboxes now fill via native `chk.click()` on `<input type="checkbox">` elements queried directly from the grid DOM (`gridEl.querySelectorAll('tr')`). Native checkbox toggle is visually instant — the browser renders `:checked` at the rendering level before ExtJS processes the model update. The old `record.set()` approach triggered synchronous full-row DOM replacements per record, blocking the main thread with no paint opportunity. Removed all `suspendEvents`/`suspendLayouts`/`resumeEvents`/`resumeLayouts`/`view.refresh()` machinery — no longer needed.
- **`autofill-engine.js` — Guaranteed paint yield via `rAF + setTimeout`** — `waitForPaint()` helper uses `requestAnimationFrame(() => setTimeout(resolve, 0))` to guarantee the browser commits a paint frame before proceeding. `rAF` fires before the next paint; `setTimeout` inside fires after paint commits. Replaces unreliable `delay(0)` (setTimeout alone doesn't guarantee a paint). Applied after checkbox filling in `processCheckboxes`, `do1Tech`, and shift report checklists.
- **`autofill-engine.js` — No explicit save needed** — Removed all `saveGridData()` calls from checklist functions. EAM auto-saves dirty records when switching activities or tabs, showing its native processing behavior. The activity switch in `switchActivity` (combo change → `handleEamPopups` → `localWaitForAjax`) and the HDR tab switch in the caller handle saves naturally.
- **`autofill-engine.js` — GPU-composited loading mask for save wait** — `showChecklistMask()` / `hideChecklistMask()` module-level helpers show a full-viewport animated overlay during the post-checklist save wait. 5 vertical bars pulsing via CSS `@keyframes` with `transform: scaleY()` (compositor-driven, smooth even when main thread is busy). Shown after all activities complete, hidden after `localWaitForAjax()` settles. Used by both WO and shift report flows.

### Correctness
- **`autofill-engine.js` — `loadMoreRecords` two-round Ajax wait** — After DOM scroll, waits for `localWaitForAjax()` → `delay(100)` → second `localWaitForAjax()`. The 100ms gap allows EAM's GETCACHE response to trigger secondary record-loading Ajax calls. Previously, `delay(50)` was too short and missed the chained request, leaving 6 records unloaded on a 56-item checklist.
- **`autofill-engine.js` — `switchActivity` popup delay reduced** — `delay(500)` → `delay(150)` before `handleEamPopups`. EAM popups render within ~100-200ms. Subsequent `handleEamPopups` calls after `localWaitForAjax` catch stragglers. Same reduction applied to shift report combo switch.
- **`autofill-engine.js` — Skip redundant `waitForGridData`** — After ACK tab switch, checks if grid already has data before waiting up to 3s. Avoids unnecessary delay when already on the checklist tab.
- **`autofill-engine.js` — DOM click for Save button** — `saveGridData` and `saveChecklist` prefer `targetBtn.el.dom.click()` over `handler.call()` for a more complete event chain.
- **`autofill-engine.js` — `resolveCheckboxFields` removed** — No longer needed; DOM click approach uses positional checkboxes (`checkboxes[0]` = Yes, `checkboxes[1]` = No) instead of field-name resolution.
- **`autofill-engine.js` — `store.getRange()` replaces manual array collection** — Three locations replaced `store.each(rec => records.push(rec))` with `store.getRange()`.
- **`autofill-engine.js` — `ensureHDRTab()` returns boolean** — Returns `true` if HDR was found, `false` if not. All dispatch branches check the return and abort field injection with error toast on failure, preventing EAM system errors from `setEamLovFieldDirect` on hidden forms.
- **`autofill-engine.js` — `ensureHDRTab()` verifies tab switch actually landed on HDR** — After `setActiveTab(hdrTab)` + `waitForSettled`, checks `tabPanel.getActiveTab() === hdrTab`. EAM auto-saves certain tabs (Documents, Comments) when switching away, and the save response can redirect to ACK instead of HDR. If verification fails, waits for redirect to settle then retries. Returns `false` if retry also fails. Applied to both primary and fallback strategies.

### Quality
- **`autofill-engine.js` — Toast progression** — Added "Filling N checklist items..." toast before checkbox loop. User sees: activity switch toast → filling toast → synced toast → save mask. Previously the activity switch toast stayed visible for the entire process.

## v14.11.2 — Night Shift Record Registry & Fast Save Verification (2026-04-04)

### Critical
- **`labor-service.js` — Record registry (`stampRecords`)** — Every EAM labor record is now tracked by `bookingcode` in `LABOR_RECORD_REGISTRY_KEY` with a `firstSeen` timestamp (48h prune). Night shift filtering works for ALL records, not just Quick Book entries. Previously, EAM-booked entries bypassed the shift boundary filter entirely (`return true`).
- **`labor-booker.js` — Fast save verification via response interception** — `triggerSaveAndVerify()` now races 3 paths: (1) `AjaxHooks.onRequestComplete` parses the SAVE HTTP response for `pageData.messages === null` and `pagemode === 'display'` (~400ms), (2) store `load` event fallback (~2.5s), (3) 5s timeout. First to confirm wins. Cut happy-path confirmation from ~2.5s to ~400ms.

### Correctness
- **`labor-service.js` — MADDON date filter on shift summary fetch** — `fetchData()` accepts `daysBack` parameter, adds `datework >= yesterday` MADDON filter to the EAM query. Quick Book summary passes `daysBack: 2`, reducing server payload. Smart cache reuse: broader (unfiltered) cache satisfies narrower requests without re-fetching. Tracker's 7-day tab unaffected.
- **`labor-booker.js` — showYesterday timing fix** — Night shift summary now respects `shiftEnd + 4h` as cutoff for hiding yesterday (was always `true` when shift end configured). Visible from midnight until cutoff. Fallback: 11am when no end time set.
- **`labor-booker.js` — Booking toast color fix** — "Booking Xh..." progress toast used `--apm-info` (undefined CSS variable, rendered transparent). Changed to `--apm-accent` (#3498db blue).

### Convention
- **`labor-booker.js` — Combined night shift config hint** — Removed toggleable `i` info button and hidden bubble. Replaced with always-visible italic hint below the shift end input: "Shows yesterday after midnight. Set shift end time to filter previous shift — leave at 00:00 to show all. Allow 1 shift for the filter to start working." All 7 languages updated.
- **`labor-booker.js` — Simplified result logic** — Removed `'unknown'` save result path. Now binary: `'success'` or `'failed'`. Log messages include verification `method` (`response`/`store`/`timeout`).
- **`locale.js` — Removed `nightShiftInfo` key** — Content merged into `nightShiftFilterHint`. All 7 language blocks updated.
- **`constants.js` — `LABOR_RECORD_REGISTRY_KEY`** — New storage key `'apm_v1_labor_record_registry'` for bookingcode-based record tracking.

## v14.11.2 — WSBOOK Screen-Cache Button Injection Fix (2026-04-04)

### Correctness
- **`autofill-engine.js` — Strategy 1b visibility guard** — Added `isElementInActiveView(anchorIconEl)` check before using `.toolbarExpandRight` as injection anchor. When WSJOBS is screen-cached and WSBOOK is active in the same iframe, the cached anchor has `display:none` (zero rect, null `offsetParent`) but `.up('toolbar')` walks to the shared `maintoolbar` — injecting into an always-visible toolbar from a hidden anchor. Guard prevents this path entirely.
- **`autofill-engine.js` — Non-autofill screen stale button cleanup** — When `detectActiveScreen()` returns a screen not in `AUTOFILL_SCREENS`, iterates all accessible frames and destroys stale `apm-btn-do-autofill` ExtJS components or DOM elements. Previously, the early-return on non-autofill screens skipped the per-frame loop entirely, leaving buttons injected during screen transitions orphaned in shared toolbars.
- **`labor-booker.js` — Quick Book WSBOOK screen guard** — `checkTabAndInject()` now requires `detectActiveScreen()` to return `WSJOBS` or `CTJOBS`. WSBOOK (Book Labor By Employee) shares the same COMMON iframe and has its own `.uft-id-newrec[data-qtip="Add Labor"]` button, causing false-positive injection. Guard also destroys stale Quick Book components on wrong-screen detection, handling buttons injected during the brief screen transition when `detectActiveScreen()` temporarily returns the cached screen's function name.

## v14.11.2 — Title-Based Screen Resolution & Event-Driven Snapshot (2026-04-03)

### Critical
- **`constants.js` — `SCREEN_TITLE_TO_FUNC` reverse map** — Hardcoded map from actual EAM title screen names to USER_FUNCTION_NAME. EAM titles ("Internal Repair Parts Request") don't match ENTITY_REGISTRY.screenTitle ("Repair Requests"), so auto-derivation was not possible. 11 mapped screens cover all daily-use entities.
- **`eam-title-observer.js` — `resolveScreenFunc()` export** — O(1) screen resolution from cached title. No FocusManager, no ComponentQuery, no DOM walk.
- **`utils.js` — Layer 0 in `detectActiveScreen()`** — Title-based resolution as first check before FocusManager scan. All 13 callers benefit automatically. Correctly resolves UDS screens (AUIRPR, SHFRPT) where FocusManager reports system function (BSUDSC, CSCASE). Per-call cost dropped from 1-100ms to near-instant for mapped screens.

### Correctness
- **`autofill-engine.js` — recorddesc-based title reading in executeAutoFillFlow()** — Replaced `input[name="description"]` + `getComputedStyle()` with `span.recorddesc` + `isElementInActiveView()`. The old approach failed on non-HDR tabs where ExtJS card layout hides the form panel, causing "blank record" detection and wrong profile selection.
- **`autofill-engine.js` — Screen-cache protection in ensureHDRTab() + detectActiveTab()** — Added `isActiveFrame()` and `isElementInActiveView()` guards to prevent switching tabs or reading tab state from screen-cached iframes.
- **`autofill-engine.js` — Grid selection contamination fix** — Added `grid.isVisible(true)` deep check to Source 2 (grid selection) in `injectAutoFillTriggers()`. Prevents reading WO title from a grid hidden behind the record view by card layout.
- **`autofill-engine.js` — Cached title contamination fix on new records** — Source 3 (`_lastKnownTitle`) now guards against `FocusManager.activeView.lastRecordid` being empty (new/blank record). Cache cleared on new records to prevent stale title leakage.
- **`autofill-engine.js` — Empty grid false positive fix** — Added `getEamViewState().view !== 'list'` gate before blank record detection. Prevents AutoFill button from showing on empty grid list view where blank header mimics a new record.
- **`session-snapshot.js` — recordcode-based entity ID detection** — `detectRecordView()` now reads `span.recordcode` (module header) before form fields. On non-HDR sub-tabs, .HDR hasn't fired so form fields are stale, but the header already shows the new record's entity ID.
- **`session-snapshot.js` — Universal AJAX trigger** — Expanded from `.HDR`-only to `url.includes('.')`, catching all EAM sub-tab requests (FUNC.ACK, FUNC.BOO, FUNC.PAR, etc.). options.url is relative (e.g. "WSJOBS.PAR"), not the full URL.
- **`session-snapshot.js` — Independent AJAX capture timer** — AJAX hook now uses a separate `_ajaxCaptureTimer` instead of the shared `scheduleCaptureState()` debounce. The view-change handler (300ms) was cancelling the 3-second AJAX timer, preventing record-to-record captures on sub-tabs.
- **`session-snapshot.js` — Initial capture at hook install** — Added `captureState()` call when hooks install (15s after boot). Previously the first capture waited for an event or the 30s safety-net tick (up to 45s).

### Convention
- **`autofill-engine.js` — Direct title resolution in APM_EAM_VIEW_CHANGE listener** — Uses `SCREEN_TITLE_TO_FUNC[e.detail.screenTitle]` from event detail, falling back to `detectActiveScreen()` only for unmapped screens.
- **`session-snapshot.js` — Title-based fast path in captureState()** — Uses `SCREEN_TITLE_TO_FUNC[viewState.screenTitle]` before `detectActiveScreen()`, leveraging the already-available `getEamViewState()` call.

## v14.11.1 — Session Restore: Date Filter Capture & Ajax Race Fix (2026-04-03)

### Correctness
- **`session-snapshot.js` — Date filter values silently dropped during capture** — `captureGridState` used `getRawValue()` to read filter fields. In record view (card layout hides list panel), date fields return `""` from `getRawValue()` but valid `Date` from `getValue()`. Fallback called `getRawValue()` again (still empty), so date filter values were silently skipped — snapshot ended up with `filterFields: null`, causing restore to run an unfiltered search and open the wrong record. Fixed with three-tier Date fallback: `getSubmitValue()` → `Ext.Date.format(val, f.format)` → manual `MM/DD/YYYY`.
- **`session-snapshot.js` — Run click Ajax race condition** — `restoreGridState` used `delay(300) + waitForAjax` after clicking Run. EAM defers the Ajax request via `Ext.defer`, so `waitForAjax` saw `isLoading() === false` and resolved immediately. Grid still had stale rows from the initial default load → target record not found → fell back to first record. Replaced with Ajax polling: poll `isLoading()` every 50ms (up to 2s) for the request to start, then `waitForAjax` for completion. Restore time dropped from ~11s to ~2s.

### Quality
- **`session-snapshot.js` — Filter application logs promoted to INFO** — Individual filter set/fail results and summary now logged at INFO (was DEBUG). Added explicit `"No filter fields in snapshot"` message when `filterFields` is null.

## v14.11.0 — Screen-Cache DOM Filtering & UDS Screen Detection (2026-04-03)

### Correctness
- **`tab-title.js` — DOM-level screen-cache element filtering** — `getRecordDescription()` now uses `querySelectorAll` + `isElementInActiveView()` instead of `querySelector`. EAM screen-caches multiple screens in the same COMMON document — `querySelector` returns the first DOM match, which may be from a cached screen's hidden panel. `isElementInActiveView()` checks `getBoundingClientRect()` for zero dimensions (`display:none`) or negative positions (ExtJS offsets hideMode).
- **`utils.js` — UDS override in `detectActiveScreen()`** — User-defined screens (BSUDSC, e.g. AUIRPR) don't update `FocusManager.activeView`, leaving it stuck on the previous screen. When `setXhrScreenContext` receives `systemFunc === 'BSUDSC'`, a sticky override activates that persists until FocusManager reports a different non-generic screen. Fixes snapshot capturing wrong screen and tab-title showing wrong screen name on AUIRPR.
- **`utils.js` — XHR context as fallback step 2 in `detectActiveScreen()`** — When FocusManager produces no result at all, checks `_xhrUserFunc` before the grid-based `detectScreenFunction()` fallback. Prevents `findMainGrid()` from picking the wrong grid in screen-cache mode.
- **`tab-title.js` — AJAX hook `isActiveFrame(win)` guard** — `.HDR` AJAX hook now checks if the requesting window's iframe is the active frame. Prevents cached frames' background HDR requests from triggering title updates.

## v14.10.26 — Shared Title Observer & Event-Driven Snapshot (2026-04-03)

### Correctness
- **`eam-title-observer.js` — New shared core module** — Single MutationObserver on `<title>` parses EAM's title format and dispatches `APM_EAM_VIEW_CHANGE` events. Replaces per-module observers. Consumers: tab-title, session-snapshot.
- **`tab-title.js` — Screen-cache frame detection via bounding rect** — `isActiveFrame(win)` checks `getBoundingClientRect().top > -1000` on iframe elements. Cached frames sit at `top: -9916px`. Previous approaches all failed: `isFrameVisible` (size check), `form.isVisible(true)` (within-iframe scope), FocusManager (global singleton).
- **`tab-title.js` — Record description from `span.recorddesc` + `textarea` support** — Primary source is now `span.recorddesc` (instant update). Fallback matches both `<input>` and `<textarea>` (Parts uses textarea, WOs use input).
- **`tab-title.js` — Record-to-record poll** — 3s `setInterval` while in record view catches next/prev record changes where the title observer doesn't fire.
- **`session-snapshot.js` — Event-driven capture replaces 3s poll** — `APM_EAM_VIEW_CHANGE` event triggers capture at 300ms. AJAX `.HDR` hook triggers at 3s (record data loading). Safety-net poll reduced from 3s to 30s. Skips `detectRecordView()` entirely on list view. ~90% fewer ComponentQuery scans.

### Cleanup
- **`session-snapshot.js` — Removed `APM_VIEW_TRANSITION` listener and `CAPTURE_INTERVAL` constant** — Superseded by shared title observer events.
- **`tab-title.js` — Removed per-module MutationObserver** — Now listens for `APM_EAM_VIEW_CHANGE` from shared observer. Uses `suppressNextTitleChange()` for title writes.
- **`boot.js` — Shared observer installed unconditionally for top frame** — Before tab-title and snapshot registration.

## v14.10.24 — Tab Title: MutationObserver-Driven (2026-04-03)

### Correctness
- **`tab-title.js` — Complete rewrite: parse EAM's `document.title` format for view detection** — Previous approach used `FocusManager.isRecordView` (stale during transitions), `APM_VIEW_TRANSITION` (never fires in screen-cache mode), `offsetParent` checks (ExtJS offsets hideMode ≠ `display:none`), and tracked `_currentView` state (race conditions with AJAX hooks). All failed. New approach: MutationObserver on `<title>` parses EAM's structured format (`"APM - <Screen> | Record View"` / `"| List View"` / `"| Checklist"` etc.) — `| List View` = grid, any `|` = record, no `|` = screen transition. Record description read via `querySelector('input[name="description"]')` (no ComponentQuery). AJAX `.HDR` hook catches record-to-record navigation (next/prev) where EAM doesn't change the title. Retry (2× at 500ms) handles late-loading descriptions.
- **`boot.js` — Simplified tab-title registration** — Removed `APM_VIEW_TRANSITION` listener, `APM_ACTIVE_VIEW_CHANGED` listener, `setCurrentView` import, `_forceScreenTitle` flag. Now just `installTitleGuard()` + `installAjaxHook()`.
- **`tab-grid-order.js` — Reverted `guardFocusManager` setter** — Removed `APM_ACTIVE_VIEW_CHANGED` dispatch (fired chaotically with intermediate values during navigation). Restored original `set(v) { _real = v; }`.

### Cleanup
- **`tab-title.js` — Removed FocusManager dependency for record/list detection** — No `isRecordView`, `lastRecordid`, or `_cachedRvForm`. No scheduler poll (was 10s). No `invalidateTitleCache()`. Module dropped from ~150 lines to ~120.

## v14.10.23 — Performance: Record Load Freeze Fix (2026-04-02)

### Critical
- **`boot.js` / `tab-title.js` — Defer `updateTabTitle()` out of synchronous `dispatchEvent`** — `APM_VIEW_TRANSITION` fires synchronously inside EAM's `setActiveItem`. `updateTabTitle()` was the only handler not wrapped in `setTimeout`, causing `ComponentQuery.query('form[id*=recordview]')` to execute inside the layout transition, freezing pages with 13+ tabs. Deferred to 150ms. Also replaced 3s polling with 10s safety-net poll + cached form reference + `recordview` xtype query (exact match vs expensive `id*=` substring scan). FocusManager `isRecordView === false` gate added above cache for correct list-return title updates.
- **`frame-manager.js` — Null guard on `_burstWin.document`** — Discovery burst 150ms timer could fire after iframe navigated/destroyed. Added `!_burstWin.closed` check + try/catch.
- **`tab-grid-order.js` — Targeted layout flush in `reorderTabs()`** — Replaced `resumeLayouts(true)` (global full-tree flush, 193ms) with `resumeLayouts(false)` + `mainTabPanel.updateLayout()` (targeted, 3ms). 98% reduction in reorder cost.
- **`tab-grid-order.js` — Cooldown only on real work** — `_lastConsistencyRun` was set in `finally` even when `findMainTabPanel()` returned null (e.g., COMMON frame). No-op calls blocked subsequent content-frame calls. Added `_didWork` flag so cooldown only activates after a tab panel was found.

### Performance
- **`tab-grid-order.js` — Increase consistency cooldown from 500ms to 1500ms** — Discovery burst + ext-consistency tab events caused 17 cascading `applyTabConsistency` calls in 14 seconds. 1500ms cooldown absorbs event storms while allowing the initial reorder + one follow-up for late-added tabs.
- **`colorcode-engine.js` — Skip most sub-tab grids entirely** — `classifyGrid()` now defaults sub-tab grids to `false` (skip). Only Parts grids (detected by `par_part`/`partcode`/`wspf_10_repr_part` columns) get `'linkify'`. Checklist already handled by viewId check. Eliminates 7+ grid scans on record load.
- **`colorcode-engine.js` — Targeted cell processing for non-matching rows** — New `processEntityCellsOnly()` queries only known entity column cells by `data-columnid` instead of iterating all cells. For a 28-column grid, skips ~93% of cell operations on rows without rule matches.
- **`frame-manager.js` — Hook `listdetailview` during discovery bursts** — `hookViewTransitions()` now runs on burst windows to catch late-created components (e.g., start center → record navigation). Idempotent via `_hookedTransitionWins` WeakSet.

### Correctness
- **`closing-comments-counter.js` — Fix FocusManager bail-out** — Changed `!av.isRecordView` (bails on `undefined`) to `av?.isRecordView === false` (only bails on explicit `false`). `isRecordView` is undefined during transitions, not false.
- **`boot.js` — Add 10s safety-net poll for comment counter** — `APM_VIEW_TRANSITION` doesn't fire from start center navigation (listdetailview not hooked yet). Poll catches the gap; function has early bail-outs so cost is minimal.

## v14.10.21 — Snapshot Fallback Guard, Summary Order (2026-04-02)

### Correctness
- **`session-snapshot.js` — Guard fallback scan against new tabs** — The fallback scan (which finds the most recent snapshot from any tab when the tab-specific one is missing) fired for genuinely new tabs opened via bookmark, showing the restore prompt from another active tab's snapshot. Added `previousTabId` check: fallback only runs when the tab had a prior session (`previousTabId` exists) or the wake prompt explicitly set `autoRestore`. A null `previousTabId` with no wake flags = new tab → no fallback.
- **`labor-booker.js` — Shift summary day order** — Yesterday now renders above today in the shift summary panel.

## v14.10.20 — Fast Booking Mode, Submit Fix (2026-04-02)

### Critical
- **`labor-booker.js` — Fix `fRate is not defined` ReferenceError crashing submit** — `fRate` and `fOcrType` were declared with `const` inside a `try` block (cascade steps 3-4) but referenced after the `finally` block (verification + record sync). Hoisted both as `let` before the `try` block.
- **`labor-booker.js` — Fast booking mode (default)** — Only runs the Activity cascade (to unlock save and capture department/trade rate), then triggers save immediately. All other parameters (employee, hours, date, type, rate) are injected into the save request by the Ajax hook via `_pendingBooking`. Eliminates ~1s+ of cascade waits per booking. Previous full-cascade flow preserved as "Safe Mode" checkbox.
- **`labor-booker.js` — Smart retry in safe mode** — Retry loop now checks each field before re-cascading. If Activity/Employee/Type already have the correct value from a prior iteration, their cascades are skipped, cutting retry time from ~1000ms to ~400ms per iteration.
- **`labor-booker.js` — Store listener for post-save verification** — Replaced fixed `delay(300)` after save with a store `load` event listener (3s safety timeout). Verification now responds to actual store reload instead of guessing.

## v14.10.19 — Labor Department Cascade, Nametag Footer Reset (2026-04-02)

### Critical
- **`labor-booker.js` — Fire `select` event on `booactivity` combo to trigger Department cascade** — `setFieldValue` only fires `change`/`blur` events, but EAM's Activity→Department cascade on the Book Labor form listens for the `select` event (fired by native user interaction). Without it, Department stayed blank and save failed with "Department field cannot be blank". Now fires `fAct.fireEvent('select', fAct, actRec)` after setting the value, matching the pattern already used in `autofill-engine.js`, `forecast-engine.js`, and `session-snapshot.js`.
- **`labor-booker.js` — Reset `_capturedDepartment` at booking flow start** — The module-level variable persisted across bookings, risking a stale department from a prior WO being injected into the save payload.

### Correctness
- **`nametag-filter.js` — Restore footer record count when filter is cleared** — `forceFooterText` overwrote the toolbar DOM during an active filter, but clearing the filter never restored it. The `clearFilter()` under `suspendEvents()` suppresses the `datachanged` event that normally triggers toolbar refresh, so the DOM stayed stuck at the old filtered count.

---

## v14.10.18 — Stability, Performance, Bundle Size (2026-04-01)

### Critical
- **`forecast-filter.js` — `suspendEvents` now wrapped in `try/finally`** — If `clearFilter` or `filterBy` threw, `resumeEvents` was never called and the store became permanently muted. The grid would stop responding to filter changes until page reload.

### Correctness
- **`labor-booker.js` — Click-away listener no longer leaks** — Opening the quick-book popup N times registered N permanent `click` listeners on `document`. Now guarded by `_apmClickAwayBound` flag on the popup element.
- **`labor-booker.js` — `fDept.suspendEvents` wrapped in `try/finally`** — The department field's events are now guaranteed to resume even if the cascade flow throws during booking.
- **`ptp-timer.js` — Interval self-clears on missing DOM** — If the timer UI element was removed, the `setInterval` ran forever without clearing. Now detects the missing element and cleans up.
- **`ptp-sandbox.js` — XHR `load` listener guarded against duplicates** — If `send()` was called twice on the same XHR (retry), duplicate `load` handlers fired. Now guarded by `_apmLoadListenerAdded`.
- **`chip-input.js` — Keystroke listener uses `AbortController`** — Capture-phase `document` listener accumulated on panel re-injection. Now cancels previous listeners via `AbortController.abort()` on re-wire.
- **`ext-consistency.js` — Function-level `_apmPatched` flag on `initComponent`** — Detects stale wrapper after ExtJS reloads within the same window (screen cache swap).
- **`forecast-engine.js` — Ajax busy check scans all windows** — Previously only checked top frame's `Ext.Ajax.isLoading()`. Now scans all frames via `getExtWindows().some()`, preventing filter injection from racing with in-flight iframe requests.

### Performance
- **`help-images.js` — Images moved to external URLs (–43% bundle size)** — 453KB of base64-encoded help images extracted to `.webp` files hosted on GitHub. Bundle reduced from 1,078KB to 615KB. Images load via direct `<img src>` from `raw.githubusercontent.com`.
- **`colorcode-prefs.js` — `getRules()` caches parsed result** — Eliminated `JSON.parse(JSON.stringify(...))` deep clone on every call (~2x/sec). Returns cached object; re-parses only when rules change.
- **`colorcode-engine.js` — CSS variables batched into single `<style>` element** — `fullStyleUpdate` previously called `root.style.setProperty()` per-rule per-document (O(N×M) style invalidations). Now builds one `:root{...}` style block per document.
- **`nametag-filter.js` — Removed `datachanged` store handler** — Was iterating all records to clear search cache on every sort/filter/page change. Only `load` (new server data) requires invalidation; the lazy computation handles everything else.
- **`eam-nav.js` — Transition error suppression interval reduced 5x** — Fallback `setInterval` in `suppressEamTransitionError` changed from 200ms to 1000ms. The MutationObserver already handles new iframes instantly.
- **`logger.js` — Short-circuit for single-string args** — `error()`, `warn()`, `info()` skip `JSON.stringify` + `.map().join()` when called with a single string argument (the common case).
- **`autofill-prefs.js` — Hydration guard prevents redundant storage reads** — `getPresets()` and `getPresetsReadOnly()` no longer call `APMStorage.get()` on every invocation. A `_hydratedFromStorage` flag skips re-hydration after the first successful read.

---

## v14.10.17 — Region-Aware Tenant, Entity Link Fixes (2026-04-01)

### Correctness
- **Region-aware `DEFAULT_TENANT`** — Derived from hostname instead of hardcoded `AMAZONRMENA_PRD`. EU hostnames (`eu*`) resolve to `AMAZONRMEEU_PRD`, US/other to `AMAZONRMENA_PRD`. `LINK_CONFIG.tenant` now references `DEFAULT_TENANT`. `buildEntityUrl` also checks `AppState.session.tenant` as a middle fallback between `EAM.AppData.tenant` and the hostname-derived default.
- **Unrecognized screens fall back to WSJOBS for entity links** — Screens not in `ENTITY_REGISTRY` (e.g., WSBOOK) previously kept `_activeUserFunc` as the raw screen name, causing `buildEntityUrl` to create links with `USER_FUNCTION_NAME=WSBOOK` instead of `WSJOBS`. Now overrides `_activeUserFunc` to `'WSJOBS'` and continues with the full column scan instead of returning early (which also left `_subGridColumns` stale).
- **Follow-up WO suffix stripped from entity links** — Follow-up work orders display with a `-N` suffix (e.g., `1234567890-11`) that isn't part of the actual record. `applyEntityLink` now strips trailing `-\d+` for `workordernum` entities before building the URL.

---

## v14.10.16 — FocusManager Guard Expansion, Consistency Scheduling (2026-04-01)

### Correctness
- **`_SAFE_ACTIVE_VIEW` expanded with full ExtJS Component interface** — EAM's minified code calls `.down()`, `.items`, `.query()`, `.updateLayout()` etc. on `FocusManager.activeView` without null checks. The safe fallback (returned when `activeView` is null during transitions) only had data properties (`isRecordView`, `screen`), causing "b.activeView.down is not a function" TypeErrors. Now includes traversal methods (`down`, `up`, `query`), identity (`getId`, `isVisible`), element access (`el`, `getEl`), container items (MixedCollection-like), and layout methods.
- **`guardFocusManager` installed in 3 additional code paths** — Previously only installed in `applyTabConsistency`. Now also installed in `applyGridConsistency` (triggers `resumeLayouts` via `reorderColumns`), `resetTabDefaults`, and `ext-consistency.js setupComponentListeners` (earliest point per window). Ensures guard is always active before any layout operation.
- **`resumeLayouts(true)` wrapped in try/catch in `reorderColumns`** — The `finally` block had unguarded `resumeLayouts(true)` (same gap already fixed in `reorderTabs` but missed here). Layout flushes trigger EAM internal code that hits null containers, and errors in `finally` bypass `catch`.
- **`resumeEvents()` wrapped in try/catch in `reorderTabs` and `nametag-filter`** — Both had unguarded `resumeEvents()` in `finally` blocks. If a store/component is destroyed mid-operation, the error in `finally` masks the original exception.

### Quality
- **Removed 3-second consistency polling from `ui-persistence`** — `applyTabConsistency` and `applyGridConsistency` were called every 3s via the scheduler. EAM only resets tab/column order on first load; after the initial reorder it does not fight back. Event-driven triggers (tab change, AJAX discovery burst, preset sync, column move) provide full coverage. Eliminates ~14 redundant consistency runs per minute.

---

## v14.10.15 — Scheduler Visibility-Aware Timer Reset (2026-04-01)

### Correctness
- **Scheduler visibility-aware timer reset** — Added a `visibilitychange` listener in the TaskScheduler constructor that resets all task `lastRun` timestamps when the browser tab becomes visible again. Browsers throttle `setTimeout` in background tabs, causing all 16+ scheduled tasks to appear overdue simultaneously on wake and fire synchronously in one tick (timer stampede). The existing `pause()`/`resume(resetTimers)` handled navigation transitions and machine sleep, but had no awareness of simple tab backgrounding/foregrounding.

---

## v14.10.13 — Wake Scheduler Freeze Guard (2026-04-01)

### Correctness
- **Scheduler pause on sleep/wake** — After machine sleep, scheduler tasks (ui-persistence, session-snapshot, autofill, colorcode, etc.) kept firing against dead iframes and destroyed ExtJS components while the session was expired, causing tab freezes. The scheduler is now paused immediately on wake detection, before the wake prompt or session probe. Resumed with timer reset once the session state is resolved (probe alive, user dismisses prompt, or 2-min safety timeout), preventing a task stampede from all overdue tasks firing in a single tick.
- **`resume(resetTimers)` parameter** — `APMScheduler.resume()` accepts an optional `resetTimers` flag that resets all task `lastRun` timestamps to `now`. Long pauses (>10s) automatically pass this flag on safety-net resume. Prevents 15+ tasks from executing synchronously in one tick after extended pauses.

---

## v14.10.12 — Tab Restoration Guard, AutoFill New Record Detection (2026-04-01)

### Correctness
- **Tab reorder "you must select a record" fix** — On new/blank records (first opened in a session), `restorePluginTabs` called EAM's tab menu handlers which fired AJAX for sub-tab data. EAM rejected these with a "you must select a record" popup because `activeView.lastRecordid` was empty (auto-generated placeholder, not a real record). Two-layer fix: (1) primary guard checks `activeView.lastRecordid` — authoritative for new records even when the form model has an ExtJS internal ID, (2) failed restoration tracker detects when a handler call doesn't add the expected tab and skips retries, breaking the infinite cleanup-pass loop.
- **AutoFill button on first-in-session new records** — Blank record detection for default profile matching now uses `activeView.lastRecordid` as a fallback signal alongside the existing form check. Toolbar injection also falls back to `activeView` directly when `rvForm.up('panel')` isn't available, allowing button placement on new records before the form fully renders.

### Convention
- **Build output minified** — `esbuild` minification enabled to discourage end-user modification of the built userscript. Log string literals preserved; ~29% size reduction.

---

## v14.10.11 — FocusManager Guard (2026-03-31)

### Correctness
- **FocusManager.activeView guard** — `guardFocusManager(win)` installs an `Object.defineProperty` getter/setter on `EAM.FocusManager.activeView` that returns a safe fallback object (`isRecordView: undefined`, `screen: { userFunction: '' }`) when the real value is null. EAM's minified code accesses `d.isRecordView` without null checks during record→list transitions, throwing `TypeError: can't access property 'isRecordView', d is null`. Previous try/catch guards on `setActiveTab` couldn't catch this because the error originates from: (1) `resumeLayouts(true)` in `reorderTabs`'s `finally` block (bypasses catch), (2) `updateLayout()` triggering FocusManager indirectly, (3) async ExtJS callbacks scheduled during tab operations. Both `resumeLayouts` and `updateLayout` now additionally wrapped in try/catch.
- **Unhandled async rejections** — `applyTabConsistency` is `async` but all callers (`scheduleCleanupPass`, `ext-consistency.js`, `frame-manager.js`, `boot.js`, sync listener) invoked it without `.catch()`. Added `.catch()` to all fire-and-forget call sites to prevent unhandled promise rejection console errors.

---

## v14.10.10 — AutoFill Keyword Chips (2026-03-31)

### Convention
- **AutoFill keyword chips** — Keywords are now entered as individual chips (pills) instead of comma-separated text, matching the ColorCode keyword UI. Supports Enter to add, Backspace to remove, paste auto-split on commas. Shared `chip-input.js` utility created for reuse. Storage migrated from comma-string to array format with automatic legacy migration on first load.

---

## v14.10.9 — AutoFill UX, Snapshot Restore Reliability, Wake Threshold (2026-03-31)

### Correctness
- **AutoFill keyword index collision:** `rebuildKeywordIndex()` used a 1:1 `Map<keyword, entry>` — profiles sharing a keyword silently overwrote each other, causing wrong profile auto-selection without showing the picker. A single profile with multiple matching keywords also appeared as duplicate entries in the picker. Replaced with 1:many `Map<keyword, Array<entry>>` and updated all three consumers (WO matching, shift report matching, button injection) to iterate arrays with Set-based deduplication.
- **Snapshot filter restore race condition:** `restoreGridState()` set filter fields and clicked Run before the grid's initial Ajax load completed — caused "Internal System Error" popups on EAM. Added `waitForAjax()` after finding the Run button but before touching any filters, ensuring the initial grid data load is settled first.
- **Snapshot filter recovery now opens the record:** After recovering from stale filters (clear + re-run), the restore flow now attempts to open the target record from the unfiltered grid instead of returning early.
- **Snapshot popup detection during grid poll:** The grid data polling loop now checks for system error popups each iteration, breaking early on detection instead of exhausting all 10 retries (~5s). Recovery starts immediately after popup dismissal.
- **Snapshot retry-before-clear recovery:** On filter-induced server error, retries Run with existing filters first (catches transient EAM errors). Only clears filters if retry also fails.
- **Wake detection false positives:** Threshold raised from 60s to 15 min (900,000ms). Normal timer drift (60–90s gaps) no longer triggers unnecessary session probes and log noise.

### Quality
- **AutoFill template selector buttons visible:** CSS fix — `<select>` intrinsic min-width pushed Save/New/Delete buttons off-screen. Added `flex:1 1 0; min-width:0` on select, `flex-shrink:0` on buttons, `flex-wrap:wrap` on row.
- **Labor hours `.5` normalization:** Bare decimals (`.5`, `.75`) auto-prefixed to `0.5`, `0.75` on blur and in `getCurrentFormData()`. Prevents user confusion about valid input.
- **AutoFill keyword hint updated:** Hint below keyword input now explains that multiple matching templates show a picker, reducing confusion about duplicate matches.

---

## v14.10.8 — Rule Consolidation, Start-Screen Forecast, Import Fixes (2026-03-30)

### Features
- **ColorCode rule consolidation** — auto-merges imported BetterAPM rules with same badge name + similar color (weighted RGB distance < 60). Dismissible banner with "Got it" / "Undo". General "Consolidate Rules" button in settings panel uniform shading row.
- **Forecast start-screen resilience** — `navigateTo` retries `launchScreenDirect` with backoff (0/1.5s/3s) when EAM frame manager is still initializing. Falls back to URL navigation via `logindisp` if all internal strategies fail. Pending forecast intent persisted to `sessionStorage` for auto-resume after redirect.

### Correctness
- **Import flickering fix** — consolidated import flow into single `setRules()` call, eliminating competing cross-frame syncs and double `requestAnimationFrame` paint cycles
- **Cross-frame cache staleness** — `getRules()` now tracks `AppState` array reference to detect external mutations from `sync.js`, preventing stale cached rules in child frames
- **Settings import: CC rules rejected** — `settings-io.js` validation now accepts wrapped `{ _v: 1, rules: [...] }` format (was rejecting as "expected array")
- **Modal closes settings panel** — added `.apm-modal-overlay` to UIManager system exclusions so modal button clicks don't dismiss the panel behind them

### Quality
- **Settings import refresh** — replaced bare `location.reload()` with native modal offering "Refresh Now" (session redirect) or "Later" (dismiss)

## v14.10.7 — EU Region Support, Locale System, a2z Domain (2026-03-30)

### Features
- **Region auto-detection:** `AppContext.isEU` flag based on hostname (`eu1.eam...`). Dynamic `EAM_BASE_URL` and `SESSION_TIMEOUT_URL` derived from hostname — no more hardcoded `us1`/`eu1`.
- **a2z EAM domain support:** `prod.eam.aws.a2z.com` added as a recognized EAM domain. Updated across 8 files: `@match`, `isEAM`/`isEAMAuth` detection, `EAM_BASE_URL` (dynamic hostname derivation — a2z has no region prefix), origin guard, session heartbeat, cookie domains (`.aws.a2z.com`), and theme cookie whitelists. Session capture is domain-agnostic (hooks XHR/Fetch for `eamid`/`tenant` params).
- **Date format auto-detection:** `detectDateFormat()` and `detectDateSeparator()` use `Intl.DateTimeFormat` to sniff the browser's locale on EU domains. Detects DD/MM/YYYY, DD-MON-YYYY, YYYY-MM-DD, and period separators (DD.MM.YYYY). New ISO date format option and period separator added to settings dropdown.
- **Comma decimal support for EU EAM:** Labor presets display with commas on EU (`0,25` / `0,5`). Input parsing accepts both comma and period. `calculateTally` normalizes comma decimals from EAM responses. `hrswork` field injection sends comma format to EU EAM (fixes 2.5 → 25 bug). All tally/summary displays use locale-aware formatting.
- **Locale system** (`src/core/locale.js`): 7 languages (en, de, fr, es, it, pt, ja) with `t(key, ...args)` function. Covers ~70 toast messages, session prompts, labor popup UI, AutoFill button, PTP timer, SSO rescue link. Language auto-detected from `navigator.language`, overridable in Settings > Regional. Falls back to English for unsupported languages.
- **Follow-up WO in AutoFill:** New `createFollowUp` and `followUpNotes` fields in WO profile. After checklist completion, sets notes on 10-Tech row, flags follow-up checkbox, saves, then clicks Actions → Create Follow-up WO.

### Correctness
- **Tab-grid-order infinite popup loop on new records:** `restorePluginTabs` called EAM's native tab menu handlers on blank/new records, which sent AJAX for tab data that doesn't exist yet → "must select a record" popup → OK dismissal triggered ExtJS events → `ext-consistency` re-fired `applyTabConsistency` → infinite loop. Added blank record guard (`getRecord()` null/phantom check) that skips plugin tab restoration while still allowing safe CSS-only hide/show and reorder operations. Configuration-dependent: only affects users whose saved tab order includes tabs requiring plugin menu restoration.
- **Date override now respects separator setting:** ExtJS date field override uses the selected separator (`.` escaped for ExtJS). Added `d.m.Y` and `d-m-Y` to altFormats.
- **`parseEamDate` unified separator handling:** Single regex handles `/`, `.`, and `-` separators. ISO format checked first to prevent misparse.
- **Locale cross-frame consistency:** `t()` reads language from `apmGeneralSettings` reference as fallback, preventing language revert when toasts fire from frames where `setLanguageOverride()` hasn't run yet.

### Quality
- **Settings descriptions improved:** Date Format now says "Must match your EAM region — auto-detected on EU domains". Date Override explains the day/month swap risk. Language dropdown hint clarifies "Changes toast notifications only — menus and settings stay in English".
- **Romance language gender fixes:** `openedEntity` and `restorePromptRecord` use gender-neutral verbs (FR: "en cours"/"incluait", ES: "en uso"/"incluía", IT: "in uso"/"includeva", PT: "em uso"/"continha") to avoid adjective agreement errors with unknown entity types.
- **German phrasing improved:** `restorePromptRecord` uses "enthielt" (contained) instead of clunky "hatte geöffnet". `pleaseRefresh` uses "Bitte EAM neu laden" (imperative).
- **Italian imperative fix:** `pleaseRefresh` changed from infinitive "Aggiornare" to imperative "Aggiorna".

### Convention
- **ColorCode keyword chips** — Keywords are now entered as individual chips (pills) instead of comma-separated text. Supports any character in keywords including commas. Bulk mode with numeric range expansion for power users. Storage migrated from comma-string to array format. BetterAPM imports treated as single keywords.

---

## v14.10.6 — Help Screen Reorganization, Snapshot Restore Fallback (2026-03-29)

### Correctness
- **Snapshot restore failed after browser restart/tab recovery:** `sessionStorage.getItem('apm_tab_id')` returns null after browser restart or tab recovery, causing `showWakePrompt()` to show "expired" even when a valid snapshot existed in GM storage. Added fallback scan of all `apm_v1_snapshot_*` keys in GM storage when tab-specific lookup fails — picks the most recent valid snapshot.
- **`SessionSnapshot.init()` restore missed orphaned snapshots:** Matching fallback added to the restore flow — if tab-specific snapshot not found but auto-restore flag is set, scans all snapshot keys and picks the most recent valid one. Tracks which key was actually used for cleanup.

### Quality
- **Help screen Getting Started reorganized:** Bullets reordered by priority (Theme, Session Protection, Export/Import, Feature Toggles, Date Format, Update Track, Diagnostics). Theme + Theme Bookmarks merged into one bullet. Session Protection consolidated from four separate bullets (Auto-Redirect, Session-Snapshot, Session Heartbeat, Session Expired Notice) into one story-flow bullet (heartbeat keeps alive, expired prompt with Restore/Redirect/Dismiss, auto-redirect fallback, restore offered on login).
- **"Feature Flags" renamed to "Feature Toggles"** in help text — less developer jargon for end users.
- **Update Track help text trimmed** significantly.
- **Auto-Redirect help text:** "error page" changed to "landing page".
- **Intro paragraph comma splice fixed** in help overlay.

### Cleanup
- **Session heartbeat activity timeout bumped from 2h to 3h** — reduces premature heartbeat suppression during long idle-but-open sessions.

---

## v14.10.5 — Cross-Frame Diagnostics, Session Restore Hardening (2026-03-29)

### Critical
- **Snapshot restore consumed on login page:** Login guard only checked for `logindisp` in URL. SSO auto-login redirects to `/login` (no `disp`), causing snapshot flags and data to be consumed before the real EAM app loaded. Broadened guard to `pathname.includes('/login')`.
- **ColorCode applied to checklist grids:** The DOM fallback `doc.querySelectorAll('.x-grid-item')` bypassed `isColorCodeTarget` exclusions when all grids were correctly filtered out. Now only fires when ExtJS ComponentQuery is unavailable, not when grids exist but were intentionally excluded.
- **Drillback auto-open triggered on sub-grids:** `handleDrillbackAutoOpen` matched Parts Associated grid (`wsjobs_par_par`) because storeId contained `wsjobs`. Added `uxtabcontainer` exclusion to skip record sub-tab grids.

### Correctness
- **Diagnostics missing content iframe logs:** `Diagnostics.toJSON()` only read the top frame's log buffer. AutoFill, ColorCode, and other modules running in content iframes were invisible. Added `_aggregateFrameData()` that merges logs/errors from all accessible frames' `_APM.diagnostics`.
- **Snapshot grid state cross-frame contamination:** `captureGridState` scanned all frames and could pick up WSJOBS dataspy/filters while active screen was SHFRPT. Restricted to target window only.
- **Snapshot dataspy restore caused EAM internal error:** `fireEvent('select', combo, null)` when target dataspy wasn't in combo store. Now validates via `findRecordByValue` before setting.
- **Snapshot record not opened after grid restore:** Single-shot `findMainGrid` check raced with EAM's multi-phase grid loading. Added polling (up to 5s) for grid data before attempting record open.
- **Shift Report autofill `reportedby` field not found:** CSCASE uses `responsible` field, not `reportedby`. Added fallback chain: `responsible` → `reportedby` → `enteredby` → `userslogon` → `personresponsible`. Dumps available field names on failure.
- **Shift Report autofill session user empty in content iframe:** `AppState.session.user` was stale (restored at boot before top frame captured BSSTRT). Added fresh read from APMStorage before user login step.
- **Shift Report autofill hung after setting user login:** Missing `handleEamPopups()` after `reportedby` LOV field set. Tab keypress triggered server lookup popup that blocked the flow.
- **Shift Report checklist tab transition error:** `tabPanel.setActiveTab(ackContainer)` triggered "f.items is null". Wrapped with `suppressEamTransitionError()`.
- **LaborBooker success log referenced block-scoped variable:** `postCount` was `const` inside an `if` block but referenced outside. Hoisted to `let`.
- **`[object ErrorEvent]` popup during forecast navigation:** Firefox passes `ErrorEvent` objects (not strings) to `onerror` for aborted network requests (`NS_BINDING_ABORTED`). Added `instanceof Event` check + `[object ErrorEvent]` string pattern to `isTransitionError`.
- **Clipboard copy icon in sub-grids had no checkmark feedback:** `ClipboardItem` API failed in content iframes (missing `clipboard-write` permission). Switched to `document.execCommand('copy')` with temporary DOM selection for rich text (HTML link) that works in all frames.

### Features
- **Nametag filter capture/restore:** Snapshot now saves `nametagFilter` keyword and re-applies via `applyNametagFilter()` after grid data loads.
- **System popup auto-dismissal:** `dismissSystemPopups()` finds ExtJS `.x-message-box` elements and clicks Yes/OK. Called before and after snapshot restore navigation to handle standup meeting reminders etc.
- **Instant wake detection:** `visibilitychange` listener fires `monitorStatus()` immediately on tab focus, bypassing scheduler + requestIdleCallback delay. Gaps >30 min skip the network probe entirely (session certainly expired).
- **ColorCode three-tier grid classification:** `classifyGrid()` returns `'full'` (main grid: rules + links), `'linkify'` (sub-grids: entity links only), or `false` (checklists/popups: skip). Parts lists in record views get clickable entity links without rule highlights/nametags.
- **INFO logging for significant state changes:** Snapshot capture, ColorCode entity resolution, nametag filter, LaborBooker booking/success, LaborService fetch, and Shift Report autofill steps now log at INFO level for diagnostics visibility.

### Cleanup
- **TabGridOrder "Preferred Order" log demoted to debug** — was INFO, fired every 3 seconds from `ui-persistence` scheduler task.

---

## v14.10.4 — Navigation Guard: Firefox Cross-Origin Error Fix (2026-03-28)

### Critical
- **`NS_ERROR_XPC_SECURITY_MANAGER_VETO` during forecast navigation from start screen:** Programmatic `EAM.Nav.launchScreen()` causes Firefox to throw cross-origin errors when frames are mid-transition. Scheduler tasks and event-driven callbacks (`scanAndAttachFrames`, `ExtConsistencyManager.bindAll`, discovery bursts) continued accessing frames during the transition, triggering the error in EAM's `app.js`. Fixed with three-layer navigation guard:
  1. **Global flag** (`isNavigationGuarded()` in `state.js`) — checked by `scanAndAttachFrames`, `ExtConsistencyManager.bindAll`, and `triggerDiscoveryBurst` to bail during transitions.
  2. **Scheduler pause** (`APMScheduler.pause()/resume()`) — blocks all periodic tasks during navigation.
  3. **Multi-frame error suppression** (`suppressEamTransitionError()`) — patches `window.onerror` and `Ext.Error.handle` on ALL accessible frames with MutationObserver for instant new-iframe detection.
- **Unprotected cross-frame access in three locations:** `window.top.document` in forecast-maddon AJAX hook (forecast-engine.js), `window.top.location.href` in colorcode link handler (colorcode-engine.js), and `mainWin.top` in nametag click handler (index.js) — all now guarded with try-catch.

### Convention
- **`suppressEamTransitionError` refactored to `isTransitionError()` helper** — centralizes all transition error patterns (items-null, NS_ERROR_XPC_SECURITY_MANAGER_VETO, SecurityError, Permission denied).

---

## v14.10.3 — Forecast Filter Persistence Across Sort/Pagination (2026-03-28)

### Correctness
- **Custom dataspy filters lost on grid column sort:** MADDON filters were only injected during the initial Run request. All three injection paths were transient — AjaxHooks gated on `isRunning` (resets in `finally`), XHR intercept was one-shot, proxy extraParams unused. Sorting or paginating the grid triggered a new server request without MADDON, returning unfiltered results. Fixed: added `filtersActive` flag that persists after execution; AjaxHooks handler now fires when `isRunning || filtersActive`, re-injecting MADDON on every subsequent WO grid request until explicitly cleared.
- **CTJOBS requests not intercepted by AjaxHooks:** `isWorkOrderSearch` only matched `WSJOBS.xmlhttp` — CTJOBS relied solely on the one-shot XHR intercept. Added CTJOBS to the AjaxHooks check so both targets benefit from persistent filter injection.

---

## v14.10.2 — AutoFill Button Injection Fix (2026-03-28)

### Correctness
- **AutoFill button missing after creating new record from non-matching record:** Three compounding issues prevented button injection on blank/new records when the previous record had no matching profile:
  1. **Title-watch ignored empty titles:** `currentTitle &&` guard in the title-watch task prevented detection when title changed from non-empty to empty (new record). The function was never re-triggered.
  2. **Hidden grid leaked stale selection:** Source 2 (grid title detection) queried all `gridpanel` components including hidden grids behind EAM's card layout, picking up the old record's non-matching title even when a visible blank form was authoritative.
  3. **`_lastKnownTitle` cache bled across records:** Cache fallback fired whenever title was empty regardless of form visibility, overriding blank record detection with the previous record's title.

---

## v14.10.1 — Flag Corruption Fix, Screen Registry Expansion (2026-03-28)

### Correctness
- **Feature flag corruption root cause:** `handleGeneralSettingsSync` used shallow `Object.assign` that replaced the entire `flags` object. If any frame saved settings before flags were registered (`flags: {}`), the empty object propagated via storage events to all other frames, wiping their flags. Fixed: sync now merges individual flag values instead of replacing the object; empty/missing incoming flags preserve existing values.
- **Save guard:** `saveGeneralSettings` now detects all-disabled flags before persisting and repairs them — prevents corrupted state from reaching storage.
- **`repairIfCorrupted` strengthened:** Checks all falsy values (`false`, `undefined`, `null`), not just strict `=== false`. Catches missing/deleted flag keys.
- **Early flag registration:** `FeatureFlags.registerDefaults()` centralizes all flag definitions and runs immediately after `initializeGeneralSettings()` in index.js — before any module gating. Previously, flags were only registered in `initBootSequence()` (too late for early gates like `LaborBooker.init`).
- **Toolbar button ungated:** `NativeToggle` (APM Master toolbar button) no longer gated behind `colorCode` flag — it's the only way to access settings and re-enable disabled features.
- **Shift report checklist task 20 skipped:** Grid never reloaded after combo switch because `select` event wasn't fired (previously removed due to array-wrapper crash). Fixed: fires `select` with single record (matching ExtJS classic signature), added strict `casemanagementtasksequence` field verification (removed unreliable record-ID check), initial grid wait before task loop, skip combo switch when grid already has correct data.
- **Autofill button disappears on non-HDR tabs:** Form visibility check (`isVisible(true)`) failed when user switched to Checklist/Activities tab, causing button removal. Fixed: falls back to cached `_lastKnownTitle` for keyword matching; repair screens keep existing button when form is temporarily hidden.
- **Session snapshot navigation error on Repair/Shift Report screens:** `buildEamScreenUrl` used user function name as system function (AUIRPR instead of BSUDSC), causing server error. Fixed: added AUIRPR/SHFRPT to `ENTITY_REGISTRY` with correct `systemFunc`.
- **Stale screen detection in ColorCode linkification:** `resolveEntityColumn` used XHR-captured screen context which goes stale in screen-cache mode. WO pattern matched non-WO numeric IDs (e.g., Physical Inventory codes). Fixed: uses `detectActiveScreen()` (FocusManager) as primary detection.
- **Linkification disabled for non-drillback screens:** Screens without `drillbackFlag` generated broken links (land on start screen). Now only linkifies screens with confirmed drillback support.
- **`buildEntityUrl` null drillback guard:** Previously generated `null=YES` in URL when `drillbackFlag` was null.

### Features
- **ENTITY_REGISTRY expansion:** Added 10 new screens for snapshot capture/restore support:
  - SSRECV (PO Receipts), PSPORD (Purchase Orders), SSPINV (Physical Inventory)
  - OSOBJS (Equipment Systems), OSOBJA (Equipment Assets), OSOBJP (Equipment Positions)
  - CTOBJS (System Compliance), EUPBS1 (Parts by Store)
  - SSMANP (Manufacturer Parts), SSSUPT (Supplier Parts)
  - AUIRPR (Repair Requests), SHFRPT (Shift Reports)

### Convention
- **`FeatureFlags.registerDefaults()`** — centralized flag definitions, called from both index.js (early) and boot.js (idempotent safety)

---

## v14.10.0 — Multi-Screen Autofill Templates (2026-03-28)

### Features
- **Multi-screen support:** Autofill templates now support Work Orders, Repair Requests (AUIRPR), and Shift Reports (SHFRPT) as distinct screen types
- **Contextual pill bar:** Screen selector in settings auto-detects current EAM screen
- **Repair Request flow:** Org + store cascade, repairable part, issued WO (auto first result), save + initiate repair
- **Shift Report flow:** Auto user login, status, checklists (activity 10/20), save
- **5-Tech checklist:** New activity 5 support for WO templates
- **Department field:** Replaces org position in WO form; org conditionally shown for new record templates only
- **New template popover:** Replaces browser prompt() with styled inline popover with copy-from-current option
- **Dirty-state tracking:** Warns on unsaved changes when switching templates or screens
- **Collapsible schedule dates:** `<details>` element defaults closed, reclaims vertical space
- **Screen detection service:** New `detectActiveScreen()` in utils.js — shared service for reliably detecting the current screen in screen-cache mode (prefers visible iframe FocusManager over stale top-frame)
- **Screen-watch polling:** 500ms FocusManager poll with 8s retry burst after screen changes for fast button injection on tab switches

### Correctness
- `switchActivity` now matches combo records by display text in addition to value field (fixes shift report task sequence matching where values are internal IDs)
- Shift report checklists use dedicated `executeShiftReportChecklists` handler — separate from WO's `executeChecklistsNative` to avoid cross-screen contamination in screen-cache mode
- `executeChecklistsNative` ACK tab search now prefers `ctx.activeWin` frame to avoid finding cached screens
- Feature flag corruption guard: `repairIfCorrupted()` resets all flags to defaults if every flag is false (prevents total lockout)

### Cleanup
- All no-args `detectScreenFunction()` callers migrated to `detectActiveScreen()` (tab-title, settings-panel, draglist, autofill-prefs, session-snapshot)

### Convention
- Renamed "Update" to "Save" in template selector
- Renamed "1-Tech" to "LOTO", shortened option labels (YES/NO)
- Renamed `pmChecks` to `techChecks10` in preset data model
- Nested preset storage: `autofill.wo`, `autofill.repair`, `autofill.shiftReport`
- Screen-aware keyword index: `Map<keyword, { screen, presetKey }>`

### Migration
- `autofill_v2` migration wraps existing flat presets into `wo` namespace, renames fields, adds defaults

---

## v14.9.0 — Wake-from-Sleep Session Probe (2026-03-27)

### New Feature
- **Wake detection + session probe**: When the machine wakes from sleep (detected via >60s wall-clock gap in scheduler ticks), the script probes `BSSTRT.xmlhttp` to check session status. If expired, a prompt offers three choices:
  - **Restore**: Sets `sessionStorage` flag, redirects to login, session-snapshot auto-restores without prompting.
  - **Redirect**: Sets skip flag, redirects to login, session-snapshot suppresses its restore prompt.
  - **Dismiss**: Closes prompt, no redirect (user may want to copy data before session fully dies).
- **Session-snapshot flag handoff**: `session-snapshot.js` reads `apm_snapshot_auto_restore` / `apm_snapshot_skip_restore` flags from `sessionStorage` on boot, enabling one-prompt UX instead of two sequential prompts.

---

## v14.8.5 — Immediate Landing Page Redirect (2026-03-27)

### Correctness
- **Instant redirect on bot/landing pages**: When session timeout redirects to hexagon.com or octave.com, the script now calls `forceRedirect()` immediately at T=0 in `index.js` (after settings init, before boot sequence). Previously, the redirect waited for the full three-gate boot + first 10-second scheduler tick of `monitorStatus()`, causing a multi-second delay on the bot page.

---

## v14.8.4 — Session Snapshot Sub-Tab Awareness (2026-03-27)

### Correctness
- **Record detection on sub-tabs**: `detectRecordView()` and `getRecordDescription()` now use two-tier visibility — checks `form.isVisible(true)` first (HDR tab), then falls back to `form.up('tabpanel').isVisible(true)` for sub-tabs (Checklist, BOO, etc.). Previously, sub-tabs were misidentified as grid view because the card layout hid the HDR form.
- **Tab title persists on sub-tabs**: `getRecordDescription()` in `tab-title.js` uses the same two-tier check, so the browser tab title stays as the record description when switching between record sub-tabs instead of reverting to the screen name.

### New Feature
- **Active tab capture & restore**: Snapshot now records `record.activeTab` (the tab panel's `getActiveTab().itemId`). On restore, `restoreActiveTab()` switches to the saved sub-tab after opening the record. No-op for HDR (default landing tab). Delta tracking includes tab changes to avoid redundant storage writes.

---

## v14.8.0 — AutoFill Engine Reliability & Speed (2026-03-27)

### Performance
- **Event-driven waits replace fixed delays**: `waitForSettled()` resolves when ExtJS Ajax goes idle instead of waiting hardcoded 150-500ms per LOV field. Estimated 1.5-3s savings per full autofill flow.
- **Pre-compiled keyword index**: `getKeywordIndex()` builds a Map on preset mutation instead of splitting/lowercasing keywords on every 2-second polling tick. Used by both `injectAutoFillTriggers` and `executeAutoFillFlow`.
- **Read-only preset accessor**: `getPresetsReadOnly()` skips `structuredClone` for hot-path callers (title-watch, button-poll) that only read data.
- **Batched model field sets**: 9 model-only fields now use `record.beginEdit()/endEdit()` with suspended field events — one record change notification instead of nine.
- **Flow context caching**: `createFlowContext()` captures frame windows once per flow, threaded through sub-functions to avoid redundant `getExtWindows()` tree walks. Populated with `activeWin`/`activeExt`/`mainForm` as they're discovered.
- **Conditional popup handling**: Removed unnecessary `handleEamPopups` after status field (produces validation errors, not confirmations) and pre-save (popups already handled inline).
- **Checklist pre-scan early exit**: Both `do1Tech` and `do10Tech` scan grid records before batch processing — if all items are already in the target state, returns immediately without layout suspension or save overhead.
- **`switchActivity` skips grid wait when already on target**: If grid data is already loaded for the current activity, skips the `waitForGridData` poll.

### Reliability
- **LOV value verification**: `verifyFieldValue()` reads back LOV field values after Ajax settles and warns (orange toast) if EAM silently rejected a value.
- **Popup dismissal verification**: `handleEamPopups` now re-checks window visibility after auto-clicking Yes/OK. Logs warning if popup persists (likely a validation error).
- **Hardened activity matching**: `normalizeActivity()` extracts leading integer from activity values, immune to invisible whitespace (`\u00A0`, `\t`), zero-padding, and display format variance. Store search breaks on first match.
- **Model field filter excludes empty strings**: Prevents clearing existing form values when preset fields are blank.

### UX
- **Full-screen checklist loading mask**: GPU-composited `transform: scaleY()` animated bars overlay on `window.top.document`, covering entire viewport including toolbar. Stays smooth during main-thread `record.set()` work since animation runs on the compositor thread. Shown before activity processing, cleaned up in `finally` block.
- **Event loop yields during batch processing**: `do1Tech` and `processInBatches` yield via `await delay(0)` every 10 records to keep browser responsive.

### Observability
- **Diagnostics: autofill flow durations**: Last 20 execution times recorded via `Diagnostics.recordAutofillFlow()`, visible in settings diagnostics.
- **Diagnostics: wipe guard recovery counter**: `Diagnostics.recordWipeGuardRecovery()` increments when sub-frame save guard recovers stored data, making the safety net observable.

---

## v14.7.9 — Screen Detection & Frame Matching Fixes (2026-03-27)

### Critical
- **Forecast targeted wrong frame with screen cache**: Frame matching in `isGridReady`, `applyForecastFiltersExtJS`, and `returnToListView` only excluded CTJOBS when looking for WSJOBS — all other screens (WSBOOK, SSPART, etc.) were accepted. On the Book Labor screen, the WSBOOK frame's grid was picked up as a "WSJOBS grid", preventing navigation and filter application. Replaced with strict matching: `if (winUserFunc && winUserFunc !== target) continue`.
- **Forecast search never fired in no-screen-cache mode**: `applyForecastFiltersExtJS` had an inline iframe visibility check (`win !== window`) that always evaluated true under the `@grant unsafeWindow` sandbox — `window` is the Tampermonkey sandbox, never equal to any real page frame. Replaced with `isFrameVisible()` which handles `unsafeWindow` identity and defaults to visible when undetermined.
- **Session snapshot always captured "BSSTRT" without screen cache**: `detectScreenFunction()` checked `initpath` before `FocusManager`. In no-screen-cache mode, `initpath` is permanently `"BSSTRT"`. Swapped the order so FocusManager (current active screen) is checked first.

### Correctness
- **`getWinUserFunc` detection order corrected**: `initpath` (per-frame) is checked before `FocusManager` (global). FocusManager returns the *active* screen for ALL frames — wrong for identifying inactive screen-cache tabs (e.g., all frames reported WSBOOK when that tab was active, hiding the WSJOBS frame). `detectScreenFunction()` keeps FocusManager first (correct for "what screen am I on?" queries like session-snapshot).
- **Generic function name filtering**: Both functions filter `BSSTRT`, `WSTABS`, `WSFLTR`, `GLOBAL` to prevent stale `initpath` from short-circuiting detection in no-screen-cache mode.
- **Labor tally hour fluctuation**: `eamQuery` pagination skipped records 101-104 due to a `+5` cursor offset on the first page ("safety margin"). Changed to `+1` consistent with subsequent pages. Also normalized breakdown keys to ISO format to prevent date format mismatch between server and local records.
- **Rich text clipboard for WO links**: Copy icon now writes both `text/html` (hyperlinked WO number) and `text/plain` (WO number) — pastes as a clickable link in Slack/Teams/email.

### New Feature
- **View transition events**: `listdetailview` card layout intercept (`hookViewTransitions` in frame-manager.js) fires `APM_VIEW_TRANSITION` custom events with `{view: 'record'|'list', win}` on every record↔list swap. Replaces 3-second polling for all three consumers:
  - **Tab title**: Immediate `updateTabTitle()` on transition + `MutationObserver` title guard blocks EAM's default title from flashing during transitions.
  - **Session snapshot**: Immediate `captureState()` with 300ms settle delay.
  - **Quick Book button**: Re-injects on `record` transitions using `e.detail.win` (correct content frame). Relaxed BOO tab detection to `rendered && !isDestroyed` — deep `isVisible(true)` was too strict since card layout hides ancestors before the tab panel activates.
- **Deep visibility for record detection**: `detectRecordView()` and `getRecordDescription()` now use `isVisible(true)` to exclude record forms hidden by card layout. Previously, the form persisted after returning to list view and was detected as active.

---

## v14.7.8 — Screen Cache MADDON Fix (2026-03-27)

### Critical
- **MADDON filter injection for screen-cached frames**: Fixed custom dataspy profiles (assigned-to, equipment, etc.) not applying when EAM's Screen Cache is enabled. With screen cache, grid stores use `Ext.data.proxy.Memory` and EAM bypasses `Ext.Ajax` entirely for grid data requests — all previous injection strategies (proxy `doRequest` patch, `beforeload` events, `AjaxHooks`, direct `extraParams`) were silently ignored. New approach: one-shot `XMLHttpRequest.prototype.send` intercept patches all accessible frames before clicking Run, appends MADDON params to the POST body of the next matching grid request, then self-cleans. Works across all browsers and proxy types.

### Correctness
- **Active frame detection with screen cache**: `applyForecastFiltersExtJS` now checks iframe element visibility (`offsetWidth`/`offsetHeight` in parent document) to skip inactive cached tabs. Previously picked the first matching WSJOBS frame, which could be a hidden cached tab — causing filters to be set and Run to be clicked in the wrong frame.
- **`AjaxHooks.install()` re-installs on Ext.Ajax replacement**: Screen cache can replace the `Ext.Ajax` singleton after our monkey-patch. Install now checks `request._apmPatched` marker instead of just the window flag, re-patching when needed.
- **`AjaxHooks.remove(id)`**: New method to cleanly unregister hooks by ID.

---

## v14.7.7 — Settings Panel Decomposition (2026-03-27)

### Decomposition & Readability
- **Settings panel split**: Decomposed `settings-panel.js` (2307 lines) into 6 focused files: `settings-panel.js` (875-line orchestrator), `settings-panel-tabs.js` (tab builders), `settings-panel-overlays.js` (help/welcome/changelog), `settings-panel-diagnostics.js` (telemetry UI), `settings-panel-draglist.js` (drag reorder), `settings-panel-autofill.js` (preset helpers). No behavior change.

### Correctness
- **Session heartbeat POST**: Changed heartbeat from GET to form-encoded POST (`BSSTRT.xmlhttp` with `COMPONENT_INFO_TYPE`, `CURRENT_TAB_NAME`, `eamid`, `tenant`). Plain GETs were potentially served from cache without resetting the servlet container's session idle timer. POST mimics real EAM navigation, ensuring the session is actually extended.

---

## v14.7.6 — EAM API Integration (2026-03-26)

### Critical
- **Session heartbeat rework**: Replaced broken `logindisp` HEAD request (pre-auth endpoint that never extended sessions) with authenticated `BSSTRT.xmlhttp` GET request. Added 10–15 min jittered interval (was fixed 5 min), 2-hour user activity gate (mousemove/keydown/click/scroll), and `__apmRedirecting` guard. Heartbeat is NOT idle-gated (removed `isIdle: true`) so it fires reliably in background tabs where `requestIdleCallback` is throttled/suppressed. `forceRedirect()` now stops all scheduler tasks immediately to prevent bot-like traffic during redirect.
- **Labor field injection reorder**: Changed cascade order from employee → type → activity to activity → employee → type → date/hours (matches manual EAM flow). Eliminates cascade conflicts where employee change clobbered previously-set fields. Injection now succeeds on iteration 0 (was up to 20 retries).

### Correctness
- **Labor save via `callSave()`**: Primary save path now uses EAM's internal `formPanel.getTabView().callSave()` instead of finding and clicking the save button. Falls back to button click if unavailable.
- **Screen detection via EAM APIs**: Replaced fragile English-only tab text parsing with `EAM.AppData.getAppData().initpath` (primary) and `EAM.FocusManager.activeView.screen.userFunction` (secondary). Language-independent, works across all frames. Applied to forecast `detectActiveTarget()`, `getWinUserFunc()`, `isGridReady()`, and shared `detectScreenFunction()` in utils.js.
- **Quick search via `Nav.goTo()`**: Forecast quick search now uses `EAM.Nav.goTo()` for instant WO navigation instead of grid filter → Run → wait → click. Falls back to old grid search path if unavailable.
- **Session restore via `Nav.goTo()`**: Session snapshot record restore uses `EAM.Nav.goTo()` for direct navigation, significantly faster than the old launchScreen + filter field + Run button flow. Falls back to previous method if unavailable.
- **Session snapshot captures grid search state**: Snapshot schema v2 captures dataspy selection (by `itemId=dataspyList` combo) and all `ff_*` filter field values with their operators (`fo_eq`, `fo_lte`, `fo_gte`, `fo_con`, `fo_dncon`). On restore, sets dataspy → populates filter fields with correct operators → clicks Run → opens the matching record (not just first row). Falls back gracefully when grid state is absent (v1 snapshots).
- **`isRecordView()` helper**: New exported function in forecast-engine using `FocusManager.activeView.isRecordView` for record/list view detection.

### Documentation
- Added EAM Runtime APIs section to ARCHITECTURE.md documenting discovered APIs: screen detection, navigation, screen object properties, save API, and rejected approaches

## v14.7.3 — Legacy Storage Key Cleanup (2026-03-26)

### Performance
- Added `suspendLayouts()`/`resumeLayouts()` and `store.suspendEvents()`/`resumeEvents()` batching to checklist autofill — eliminates ~300 synchronous grid repaints per 100-record batch
- Added `beginEdit()`/`endEdit()` per checklist record — batches 2-3 `set()` calls into a single store event per record
- Applied to both `do1Tech` (LOTO) and `do10Tech` (PM Checks) via `processInBatches`
- Replaced polling `localWaitForAjax` (50ms poll + 70ms overhead per call) with event-driven Ajax listener — resolves instantly when Ajax completes instead of up to 50ms late
- Removed post-save grid reload wait from `saveGridData` — next activity switch or HDR return reloads anyway, saving 2-4s per save cycle
- Reduced `waitForGridData` polling from 50ms to 16ms intervals, grace period from 300ms to 100ms
- Removed 200ms dead wait after checklist tab switch and 300ms after HDR return
- Added `grid.getView().refresh()` before save so checkboxes fill visually before the server round-trip

### Convention
- Normalized 5 storage keys to `apm_v1_*` naming convention (`apmNightShiftOn`, `apmLastKnownEmpId`, `ApmSession`, `apm_ptp_history`, `apm_last_update_check`)
- Removed runtime legacy key reads from theme-resolver (`ApmGeneralSettings` fallback) and theme-broadcast (storage watch)
- Fixed labor-tracker raw `localStorage` read to use `APMStorage`
- Fixed labor-booker hardcoded key strings to use constants
- Added `rename_keys_v1` migration to copy data from old key names to new `apm_v1_*` keys
- Added `cleanup_legacy_v1` migration to delete 26 dead legacy keys from both GM and localStorage
- Added `deleteLegacyKey()` helper to MigrationManager

### Correctness
- Fixed `break` → `continue` in autofill grid-nav loop that could skip remaining windows if one lacked ComponentQuery
- Removed dead emergency migration recovery in autofill-prefs (MigrationManager was never API-registered)
- Replaced `innerHTML.trim()` HDR-empty check with `children.length` to avoid serializing large DOM subtrees

### Cleanup
- Consolidated double `APMStorage.get()` in `savePresets()` into a single read
- Removed redundant `setIsAutoFillRunning(false)` calls before `finally` block in autofill flow
- Replaced local `formatEAMDate` duplicate with shared `formatToEamDate` from core/utils
- Standardized `isHidden` check pattern in tab-grid-order to explicit `typeof` guard

## v14.7.1 — Session Snapshot & Restore (2026-03-25)

### New Feature
- **Session Snapshot** — Automatically captures current screen and open record every 3s. After session timeout and re-login, prompts to restore previous state via internal EAM.Nav navigation and MADDON filter injection. Per-tab isolation via sessionStorage with 4-hour TTL and automatic cleanup of orphaned snapshots.

### Refactoring
- **EAM Navigation** — Extracted `launchScreenDirect()`, `buildEamScreenUrl()`, and `suppressEamTransitionError()` from forecast-engine to shared `src/core/eam-nav.js`. `buildEamScreenUrl` now uses `ENTITY_REGISTRY.systemFunc` for correct non-WSJOBS screen URLs.
- **MADDON Filter Utilities** — Extracted direct proxy injection/cleanup from forecast-engine to shared `src/core/maddon.js` with `injectMaddonFilter()`, `clearMaddonFilters()`, and `buildEntityFilter()`

## v14.7.0 — Auto-Open Record on Quick Search & Drillback (2026-03-24)

### Features
- Quick search now auto-opens the WO record after grid filters return results — no manual double-click needed
- New-tab drillback links (entity links with `FROMEMAIL=YES`) auto-open the record after EAM boots
- Toast confirmation "Opened WO {number}" on successful auto-open (3s auto-dismiss)
- "WO not found" feedback when drillback or quick search returns 0 results
- Shared `openFirstGridRecord()` utility with cross-frame record view polling
- Entity-agnostic: works for WSJOBS, CTJOBS, SSRCVI, SSPART via ENTITY_REGISTRY

## v14.6.6 — Grid Performance & Tab-Grid Reliability (2026-03-24)

### Performance
- Added `suspendEvents()`/`resumeEvents()` batching to nametag filter — eliminates 2-3 redundant grid repaints per filter operation (modeled after forecast-filter.js pattern)
- Removed double-pulse colorcode invalidation in nametag filter — single pulse after `view.refresh()` replaces immediate + 300ms delayed strategy
- Added `isFrameVisible()` gate to 3-second colorcode persistence scheduler — hidden iframes (screen cache) now skipped until made visible via events
- Replaced full-row regex test for entity detection gate with `!!entityConfig.pattern` existence check — per-cell regex still runs inside `applyEntityLink`

### Reliability
- Added `isDestroyed` and null guards to tab overflow `getBoundingClientRect()` detection — prevents crash when tab is destroyed mid-measurement
- Replaced fixed 500ms grid header retry with exponential backoff (200ms → 2s cap) and added `Logger.warn` on retry exhaustion for diagnostics

## v14.6.5 — Deep Code Review: Bug Fixes, Security, Decomposition (2026-03-24)

### Critical Fixes
- Fixed labor-booker correction validation rejecting negative hours (`parsed <= 0` changed to `parsed === 0`) — manual correction flow was completely broken
- Fixed autofill activity detection: `startsWith('1')` matched both activity 1 and 10 — now requires delimiter after number
- Fixed MADDON filter truncation: sequential key iteration (`while` loop) silently dropped filters when keys were non-contiguous — replaced with prefix scan
- Replaced `innerHTML` SVG injection in `status.js` with programmatic `createElementNS` DOM API

### Security
- Fixed URL parameter injection in session.js: `tenant` value now uses `encodeURIComponent()` in URL construction
- Fixed broken session early-return guard: `self.eamid` referenced wrong object (SessionMonitor instead of AppState.session) — every XHR response was needlessly processed
- Added action allowlist for postMessage hotkey handler in message-router.js
- Added `e.source === window.parent` validation when capturing PTP parent origin
- Centralized PTP origin validation: ptp-sandbox.js now imports `isTrustedOrigin` from origin-guard.js instead of duplicating regex patterns
- Tightened update URL validation in settings panel to pin to expected domains (github.com, greasyfork.org)
- Replaced `localStorage.setItem.__apmPatched` function-property flag with window-level `FLAGS.STORAGE_PATCH` guard
- Added color validation (`/^#[0-9a-fA-F]{3,8}$/`) on imported colorcode rules before CSS property injection
- Added `CSS.escape()` for rule ID interpolation in querySelector selectors
- Adopted `FLAGS` constants for session XHR/fetch guards, update-checked flag, and migration-retry flag (replacing bare `window._apm*` properties)
- Safe-by-default URL parsing in network.js: malformed URLs now default to cross-origin path
- Masked eamid fully as `[redacted]` in session logs

### Correctness
- Fixed boot deadlock: pre-boot phase (`MigrationManager.run`, `initializeGeneralSettings`) now wrapped in try/catch with `finally { BootManager.markReady('settings') }`
- Fixed `ExtConsistencyManager.bindAll()` running outside error boundary in boot.js — failure silently disabled all scheduler tasks
- Fixed colorcode preview nametag cleanup: `parseFloat('__preview__')` returned NaN — now handles string IDs correctly
- Fixed stale `getTotalCount` closure in nametag-filter: overridden function now returns `this.getCount()` dynamically
- Fixed MADDON proxy cleanup race: replaced fixed 500ms delay with `waitForAjax()`
- Fixed labor success toast firing before server confirmation — now waits for AJAX completion
- Fixed recursive frame broadcast in message-router.js: added `Set`-based cycle detection
- Fixed update-check flag set before fetch — failed checks now allow retry
- Fixed stale `isDarkHint` closure in theme-shield `beforeunload` — now reads current theme at event time
- Fixed `findMainGrid` cache not clearing when cached grid is destroyed/unrendered
- Added missing domain whitelist check in theme-shield cookie setting
- Added 15-second auto-dismiss fallback for non-error status banners
- Added `animateOut()` call after persistent toast click handler
- Added `isError` parameter to `setStatus()` replacing color-string comparison
- Added 30-second safety timeout for labor-booker `isRunning` flag
- Changed DST-sensitive `Math.round` to `Math.floor` in labor day-difference calculation
- Added retry counter (max 10) to tab-grid-order grid header polling
- Reduced resize suppression window from 5000ms to 1000ms in tab-grid-order
- Fixed autofill `!value` guard rejecting legitimate falsy values (0, empty string)
- Removed redundant `setIsAutoFillRunning(false)` calls in autofill early-return paths
- Fixed forecast `buildMaddonFilters` joiner logic relying on combined-array index
- Removed dead `resp.status === 302` check in session fetch monitor (fetch follows redirects)
- Added `formatToEamDate` handling for ISO datetime strings with `T` separator
- Added `store.on('datachanged')` cache invalidation for nametag search text
- Moved `store.clearFilter()` to correct branch in nametag-filter (was causing double render)
- Added missing radix to `parseInt` calls in eam-query.js
- Added retry-exhaustion warning log in date-override.js
- Added migration schema version check in settings-io.js import path

### Convention Alignment
- Adopted `el()` from dom-helpers.js in: colorcode-engine (12 sites), autofill-engine, labor-booker, status.js, toast.js, settings-panel, forecast-profile-manager, forecast-search-form
- Replaced ~20 hardcoded hex/rgba colors with `--apm-*` CSS custom properties across styles.js, colorcode-ui.js, filter-builder.js, conflict-notice.js, settings-panel.js
- Added new design tokens: `--apm-warning-dark`, `--apm-success-dark`, `--apm-text-on-accent`, `--apm-text-disabled`
- Removed `unsafeHTML` alias from `el()` helper in dom-helpers.js
- Added `href` to dom-helpers.js direct property assignment list
- Replaced raw iframe discovery with `getAccessibleDocs()` in autofill-engine.js
- Replaced DOM queries with ExtJS `tabPanel.getActiveTab()` would be ideal (documented for future)
- Replaced dynamic `import()` with static imports: frame-manager.js (ui-manager), forecast-ui.js (forecast-prefs)
- Extracted shared `cleanEmployeeId` utility in labor-service.js, adopted in labor-tracker.js
- Moved discovery-burst AjaxHooks registration to one-time init in frame-manager.js
- Standardized logger tags: `'AutoFill'` (was mixed), `'SettingsIO'` (was `'Settings'`)
- Replaced `JSON.parse(JSON.stringify())` with `structuredClone()` in autofill-prefs.js
- Debounced MutationObserver callbacks in autofill-engine.js, labor-booker.js, ext-consistency.js
- Changed `export let apmGeneralSettings` to `export const` in state.js
- Reorganized index.js: all imports at top, executable code in labeled `// --- Immediate Phase ---` section
- Added error boundaries to all pre-boot code and post-task-array scheduler registrations in boot.js
- Simplified defensive `ForecastFilter && ForecastFilter.init && ForecastFilter.init()` to `ForecastFilter.init()`
- Increased autofill-button-poll interval from 2s to 5s (MutationObserver handles real-time)
- Removed `characterData: true` from autofill MutationObserver options
- Replaced spread-based NodeList iteration with explicit for-loops in autofill observer
- Added PTP history format version marker to skip migration loop after first run

### Decomposition & Readability
- Decomposed `applyThemeHooks` (283 lines) into 7 focused helpers: `cleanupDefaultTheme`, `applyFlashPrevention`, `setupJsTraps`, `setupCssSentinel`, `setupPersistencePolling`, `broadcastToFrames`, `updateCssVarsAndCookie`
- Decomposed `applyCellProcessors` (150 lines) into `applyEntityLink`, `applyPtpTag`, `applyNametags`
- Extracted `processRecordHeader` from `processColorCodeGrid`
- Extracted `renderRuleItem` from `renderRules` in colorcode-ui.js
- Extracted `getPtpStatusInfo` shared helper eliminating duplicate status→icon/color mapping
- Extracted `_detectMoreRecords` helper from `recursiveGridFetch` in utils.js
- Extracted `_extractHasMoreFromXml`/`_extractHasMoreFromJson` from `hookStoreReader` in ext-consistency.js
- Extracted common `allHidden`/`screenHidden` resolution in ext-consistency.js `syncNativeState`
- Extracted `readLegacyValue` helper from migration-manager.js `safeMigrate`
- Extracted `appendDateInclusionFilters` shared helper in forecast-engine.js (was duplicated)
- Extracted `resolveCheckboxFields` helper from autofill do1Tech/do10Tech
- Extracted `FIELD_MAP` constant for EAM UDF field names with business-meaning comments
- Extracted `RATE_DATE_DEFAULT` constant in labor-booker.js
- Extracted `setupCloseButton` helper in ptp-timer.js, fixed inconsistent opacity values
- Extracted `showTab` helper in settings-panel.js for tab switching
- Defined MADDON operator constants (`OP_EQ`, `OP_LTE`, etc.) in forecast-engine.js
- Cached trigger selector in ui-manager.js mousedown handler
- Added ~30 explanatory comments for magic values, intentional patterns, and safety assumptions
- Removed dead code: `badgeHtml` variable, unused `escapeHtml`/`apmFetch`/`recursiveGridFetch` imports, redundant `loadPreferences()` call
- Hoisted `barRect` out of forEach loop in tab-grid-order.js

### Cleanup
- Removed dead `clearGuards` parameter from theme-broadcast.js `initThemeListeners` and theme-enforcer.js call site
- Removed `_broadcastPending` time-based dedup gate in theme-hooks.js (interval-clear-before-create is sufficient)
- Reduced theme broadcast count from 10 to 5
- Added 5-minute max to theme persistence slow poll (was unbounded)
- Renamed `internal` to `hookState` in theme-hooks.js
- Renamed `self` to `monitor` in session.js for clarity
- Renamed `d` to `msg` in message-router.js
- Renamed `el_elem` to `inputEl` in colorcode-ui.js
- Replaced `innerHTML = ''` with `replaceChildren()` in colorcode-ui.js, settings-panel.js

---

## v14.6.4 — Full Codebase Review & Hardening (2026-03-24)

### Critical Fixes
- Fixed 7 CSS syntax bugs (`))` double-paren) in `styles.js` that silently broke focus rings, box shadows, and backgrounds on quick search, labor panel, profile badges, filter builder, and day-off buttons
- Fixed nametag filter rendering pulse never firing — `APMApi.invalidateColorCodeCache` was accessed as direct property instead of `APMApi.get()`
- Added missing `shift` and `org` fields to MADDON filter builder — profiles with these constraints were silently dropping the filters
- Fixed cookie domain mismatch in `theme-shield.js` — `clearGuards` now derives domain dynamically instead of hardcoding `.hxgnsmartcloud.com`
- Fixed prototype pollution vector in `settings-io.js` — imported objects are now deep-cloned before storage write
- Documented origin trust scope in `origin-guard.js`

### Security Hardening
- Blocked `_api` property on `unsafeWindow.APMApi` Proxy — page scripts can no longer bypass write protection
- Removed wildcard `postMessage(data, '*')` fallback in `safePostMessage`
- Fixed unsafe `hasOwnProperty` calls on parsed JSON in `sync.js` and `settings-io.js`
- Added URL protocol validation for update links in settings panel
- Replaced `innerHTML` with `textContent`/DOM APIs in labor-tracker and autofill-engine
- Sanitized imported colorcode rules (allowlist fields on JSON import)
- Masked session ID (`eamid`) in log output

### Correctness
- Added null guards for `getElementById` calls in forecast hotkey paths
- Added double-patch guard to `hookFetch()` in session monitor
- Added early exit in XHR load handler after session is fully captured
- Fixed localStorage `setItem` double-patch risk in theme-broadcast (function property guard)
- Added error boundary to `enforceTheme()` boot task
- Added self-clear to theme-hooks polling interval after hooks apply
- Added error logging to theme-shield catch block
- Fixed `openFn()` exception leaving UI manager registry in stale state
- Fixed labor-booker: lazy window evaluation, hours input validation, cross-document `createTextNode`, removed premature `record.commit()`
- Fixed PTP timer drift — now uses wall-clock `Date.now()` instead of counting scheduler ticks
- Restricted PTP `_parentOrigin` to lock only from theme handshake messages
- Added `MIGRATION_RAN` to `FLAGS` constants (was raw `window.__apmMigrationRan`)
- Added `Array.isArray` guard to migration-manager merge logic
- Fixed `colorcode-engine.js` `.replace('.', '_')` to use global regex (`/\./g`)
- Fixed discovery burst re-registering indefinitely on rapid Ajax responses
- Used `UPDATE_CHECK_KEY` constant instead of hardcoded string in updater

### Convention Alignment
- Migrated 5 window globals to APMApi registry (`updateInfo`, `systemDefaultTabOrder`, PTP timer state)
- Fixed import ordering in 4 files (frame-manager, message-router, boot.js, settings-panel)
- Added error boundaries to 4 forecast component builders
- Replaced JS hover handlers with CSS `:hover` rule for toolbar buttons

### Dead Code Cleanup
- Removed dead imports: `LOG_LEVELS` (state.js), `apmGetGlobalWindow` (storage.js), `getSettings` (message-router.js)
- Removed empty functions: `initAjaxInterceptors()`, `applyLocalProfileFilters()` and their call sites
- Removed unused: `FORECAST_VERSION`, `_ccSheet`, `lastCheckState`
- Removed dead `mode` parameter from `setStatus()` and updated 12 callers
- Removed orphaned JSDoc block, dead `setupAjaxInterceptors` method, duplicate `clearTimeout`, dead `logLevel` check
- Removed unused `callbacks` parameters from forecast component functions
- Deleted `framework-interrogator.js` (non-functional hardcoded IDs)
- Fixed smart quotes in `ownership-tracer.js`, wrapped `tab-prober.js` in IIFE

### Quality
- Changed scheduler-investigator from `Logger.info` to `Logger.debug`
- Removed per-mousedown debug logging noise
- Tightened `isDark` theme check to word-boundary regex
- Added visibility guard to PTP sandbox heartbeat
- Fixed `el` variable shadowing in forecast-ui.js
- Added comment for intentional `GET_ALL_DATABSE_ROWS` server-side typo
- Fixed `recovery.js` version check from truthiness to `'_v' in stored`

---

- Architectural Refactor
- Migrated codebase to modular ES structure with esbuild bundling
- Improved maintainability and eliminated global scope conflicts
- Removed legacy script-tag injections in favor of a unified core
- Consolidated redundant utilities from merged tools into shared modules
- Implemented persistent self-healing task for UI stability

- Theme Enforcement
- Layered defense system to prevent framework theme resets
- Sticky manifest traps to intercept and redirect theme re-initialization
- CSS Sentinel redirection for dynamically loaded stylesheets
- Flash prevention styles for seamless page transitions
- Cookie-based theme hinting to eliminate flashes on SSO transition subdomains
- Heartbeat theme synchronization for nested iframes and portlets

- Session Management
- Automated detection of silent timeouts and landing page redirections
- Auto-redirect to SSO login page when session expiration is detected

- Feature Updates
- Added locale-aware date format detection for EU/US configurations
- Implemented high-precision dark mode overrides for sub-components
- Switched to native framework event listeners for improved performance
- Refined PTP state tracking for multi-tab stability

- Unified Storage & Performance (v14.1.4)
- Implemented Unified Cross-Domain Storage (`APMStorage`) using `GM_setValue`
- Eliminated "data loss" when users are redirected between different EAM subdomains
- Stabilized global messaging system for better multi-frame synchronization
- Optimized rendering performance (Double Pulse) for nametag filters
- Implemented `findMainGrid` caching to reduce redundant iframe scans
