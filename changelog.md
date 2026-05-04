# APM Master v14 Changelog

## v14.14.122 — Audit P1 sweep across autofill / EAM core / lifecycle / hygiene / forecast XHR (2026-05-03)

### Critical
- **Forecast pagination revives on screen-cached WSJOBS / CTJOBS.** `recursiveGridFetch` hooked `store.on('load')`, which EAM never fires when populating via `loadData` / `loadRawData`. Switched to `datachanged` with an `isLoading()` re-entry guard. Audit P1 #14.
- **PTP iframe regains its WO context after every reload.** A module-scope `_lastBroadcastWo` dedup blocked re-broadcasts after iframe reload, so PTP couldn't classify creates. Dedup removed; same-WO scenarios cost one extra `APM_PTP_CONTEXT` per nav. Audit P1 #19.
- **ColorCode / labor-tracker / tab-grid-order keep receiving repaint signals after shared-iframe document swaps.** `attachObserverToDoc` early-returned on the cached window key, leaving the observer wired to the detached document. A `frame:styleRefresh` subscriber now disconnects and re-observes the new doc on the same key. Audit P1 #25.
- **EAM iframe modules now see view changes.** `eam-title-observer` dispatched `APM_EAM_VIEW_CHANGE` only on the top window, so iframe-bundled subscribers never heard it. The observer now broadcasts to every `getExtWindows()` target via a per-iframe bridge that re-fires the local CustomEvent. Audit P1 #16.

### Security
- **PTP `requestUrlParams` no longer echoes the iframe src to non-PTP trusted origins.** Any TRUSTED_PATTERNS origin could request and receive the iframe URL, including non-PTP EAM origins. New `isPtpOrigin()` predicate (`*.ptp.amazon.dev` / `*.insights.amazon.dev`) gates the reply. Audit P1 #26.

### Correctness
- **Autofill survives LOV cascades that re-render the form.** `injectExtJSFieldsNative` reused a once-captured `mainForm` across org/dept/type/eq/shift cascades that destroy and re-render the panel. A new `ensureForm()` closure re-polls after each cascade-triggering LOV. Audit P1 #7.
- **Shared LOV helpers fire `select` for combo-cascade fields.** `setExtModelDirect` and `setEamLovFieldDirect` fired only `change` and `blur`; cascade-driven sites had to fire `select` manually beforehand. `select` now fires before `change`/`blur` for `combobox` xtypes only. Audit P1 #8.
- **Comma-decimal locales no longer disable autofill labor / completion-date branches.** `parseFloat("0,5")` returns `0` for EU users, silently dropping labor hours and date components in autofill paths (v14.14.18 had only fixed `fetchScheduledHours`). New `parseLocaleDecimal()` treats the rightmost separator as the decimal marker; `parseCompletionDateValue` delegates to `parseEamDate`. Audit P1 #9.
- **Autofill trigger button reads the title at click time.** `dispatchAutoFillClick` captured the title at scan time, so a click within the 3-second cooldown after navigating to a new WO launched with the prior title. Handler now reads `getVisibleRecordTitle()` inside the click closure. Audit P1 #10.
- **Autofill equipment field discovery scopes to the active screen.** `Ext.ComponentQuery.query('[name="equipment"]')` ran unscoped in shared-iframe COMMON mode and could pick from a stale cached screen. Routed through `scope.queryExtAll(...)` with an `isVisible(true)` filter. Audit P1 #11.
- **`resolveLaborHours` form fallback skips hidden card-layout siblings.** `find(f => f.rendered && !f.isDestroyed)` could return a card-layout panel from the wrong WO and produce wrong org/type lookups. Added `f.isVisible?.(true)` to the predicate. Audit P1 #13.
- **`setupComponentWatcher` re-patches after Ext reload.** A per-window `_watcher` flag short-circuited ahead of the prototype `_apmPatched` marker, so an Ext reload (which clears the prototype patch) left the re-patch branch unreachable. Per-window flag removed; `_apmPatched` is now the sole idempotence gate. Audit P1 #15.
- **Forms in screen-cache mode get correct screen identity.** `eam-record._readFromStore` resolved screen via `detectScreenFunction`, which defaulted to FocusManager-global — wrong frame in screen-cache mode. Now resolves from `activeTarget?.screenId` first, falling back only when null. Audit P1 #17.
- **Quick-Book safety timer no longer races the `isRunning` guard.** A 30-second timer flipped `BookerState.isRunning = false` mid-flow, letting a second click start a parallel pipeline. The timer now logs a heartbeat warning; the finally block remains the single owner of the flag. Audit P1 #18.
- **`dismissSystemPopups` reaches deeper iframes in screen-cache mode.** Walked only top-level `document.querySelectorAll('iframe')` and missed wrapper → EAM → COMMON → popup chains, stalling restore flow. Now iterates `getExtWindows().map(w => w.document)` with the top-level document as fallback. Audit P1 #20.
- **Snapshot capture fires when forecast profile or nametag filter changes.** The change detector compared only screen / record / tab / grid identity, so profile flips followed by tab close lost the last selection. `_lastForecastProfile` and `_lastNametagFilter` are now tracked alongside. Audit P1 #21.

### Convention
- **Last `core/` / `ui/` → `modules/` layer break removed.** `settings-panel-overlays.js:8` imported `detectBetterApm` and `importFromBetterApm` directly from the welcome module. The welcome module now self-registers both via `APMApi.register('welcome.…')`; the overlay looks them up lazily. ESLint warning count drops 87 → 86. Audit P1 #22.

### Quality
- **`handleGeneralSettingsSync` no longer clobbers then patches the flags reference.** The loop wrote `apmGeneralSettings[key] = next[key]` (including `flags`), then re-merged at lines 67–72 — correct by ordering, brittle to insertion. Now destructures `flags` and merges separately. Audit P1 #23.
- **`APMStorage.get` no longer fires reentrant `set` during diagnostic dumps.** Reads on localStorage-only keys auto-promoted to GM_setValue inline, fanning storage events to sibling frames on every diagnostics walk. Promotion is now opt-in via `{ promote: true }`; `MigrationManager.promoteToGlobal()` is the only caller. Audit P1 #24.
- **Forecast XHR one-shot intercept folded into the persistent `forecast-maddon-xhr` hook.** `installXhrMaddonIntercept` patched `XMLHttpRequest.prototype.send` per Run; concurrent Runs could silently skip-install and prototype mutations accumulated. A `pendingOneShotInjection` Map (publish/consume + 10s TTL) is consulted by the persistent hook; the 108-line per-Run mutator is gone. Audit P1 #27.

## v14.14.121 — Audit P0 sweep + storage-backed EAM context (2026-05-03)

### Correctness
- **EAM tenant, date format, and screen-cache list survive Firefox Xray and iframe teardown.** `gAppData` lives on the loadmain iframe and Firefox `unsafeWindow` Xray hides page-defined globals, so direct `window.EAM?.AppData?.tenant` reads returned undefined — bouncing session-timeout and Wipe Data redirects to `/message.html?error=SPECIFY_TENANT`. A storage-backed cache (`getCachedTenant` / `getEamDateFormat` / `getCachedScreenCacheList`) captures values on `frame:attached` with a SessionMonitor XHR fallback, and consumers now read from GM storage.
- **PTP dark-mode supplemental CSS revived.** Smart curly quotes (U+201C / U+201D) had silently broken the `AWSUI_DARK_CSS` attribute selectors, so browsers dropped the entire block. Quotes fixed; the `[id^="question-"]` rule rewritten to `background-color: transparent` so cards keep the MutationObserver-stripped transparent look instead of flipping opaque. Audit P0 #1.
- **Session restore from a fresh tab finds the tenant.** `navigateViaUrl` still read `window.EAM?.AppData?.tenant` directly while every other consumer moved to `getCachedTenant()`. Cold-cache restores were producing `?tenant=` and bouncing to `SPECIFY_TENANT`. Audit P0 #3.
- **Session-snapshot capture no longer fires on every Ajax round-trip.** The Ajax filter read `url.includes('.')` (every URL contains a dot) instead of `.HDR`. The 3-second debounced capture walks all frames running the script's most expensive `ComponentQuery` — its largest invisible cost during AJAX bursts. Audit P0 #4.
- **PTP completion events no longer fan out N×M times in screen-cache mode.** The wrapper top frame relayed every `APM_PTP_*` to all children and then handled the message itself, multiplying single completions through every cached frame. Wrapper now relays-and-returns; only the visible child handles. Audit P0 #5.
- **Autofill bulk Yes / No / Clear toolbar buttons iterate by store, not `<tr>`.** The v14.14.51 fix landed only in `processCheckboxes`; three sibling loops (autofill-triggers toolbar, wo-checklists LOTO blanket, shift-report per-task) still iterated `<tr>` and mis-mapped cfg-to-row when a filter row was visible. All four loops now share a single `iterateGridRecords` helper. Audit P0 #6.

### Performance
- **LaborBooker no longer accumulates duplicate top-frame listeners on every `frame:attached`.** `init(win)` re-registered three top-window listeners on every per-frame event, accumulating 3–5 duplicates per boot and firing N parallel `fetchLaborSummary` round-trips per `APM_SESSION_UPDATED`. Top-frame work is now hoisted into an idempotent `_initOnce` mirroring the labor-tracker pattern. Audit P0 #2.

## v14.14.120 — Wipe Data actually wipes (2026-05-03)

### Correctness
- **Wipe Data no longer leaves settings in place after the SSO redirect.** Wipe cleared GM and us1.eam's localStorage, but the SSO chain bounced through `prd-use1-sso.eam.hxgnsmartcloud.com` whose per-origin localStorage retained pre-wipe data — `APMStorage.get`'s localStorage→GM promotion fired there and resurrected everything into shared GM before the page returned to EAM. Wipe now writes empty placeholders (`'{}'` / `'default'` / `'[]'`) to the critical GM keys so the promotion's localStorage fallback never runs, and `saveGeneralSettings` early-returns on `shouldSkipBoot` frames so any stray save during the bounce is dropped.
- **Wipe Data redirects to `logindisp` with the captured tenant instead of `location.reload()`** Tenant is grabbed from `AppState.session` before storage is cleared.

## v14.14.119 — Labor tally Shift View extends to 7-day span (2026-05-03)

### Features
- **Labor tally Shift View now spans Current / 3 Shifts / 7 Shifts via the existing tab row.** Shift mode was previously a fixed 2-day window with the day-count tabs disabled. Each shift renders as a header row labelled by its start day name ("Wed Shift", etc.) with the constituent date breakdowns nested below.
- **Initial unstamped records fall back to work date.**  Timestamps come from quick-book SAVE and a one-time dataspy 1723 seed gated on `LABOR_NIGHT_SHIFT_BOOTSTRAPPED_KEY` instead of a per-session flag; registry retention extends from 48h to 8 days so multi-shift lookbacks can hold their stamps.
- **Each shift entry with unstamped contributors carries an inline "no entry time — new bookings will track" badge.** The badge sits between the shift-day label and the hours total, with a tooltip explaining that the booking predates entry-time capture and that hours booked from now on will be grouped by the shift they were entered in. Badges fade out organically as the registry fills with quick-book stamps over the next ~8 days of normal use.

## v14.14.118 — Labor module decomposed, safe mode booking removed (2026-05-02)

### Cleanup
- **Quick Book "Safe" mode removed.** Safe mode (~150 lines of iterative-retry cascade in `safeBookingFlow`) was an opt-in fallback for tenants whose activity cascade timing caused issues. The cases it was added for are now handled by the fast path's captured-department safety net and the Ajax-hook payload injection.
- **`labor-booker.js` (1,556 lines) split into role-based files inside `src/modules/labor/`.** The IIFE is replaced by an orchestrator (`labor-booker.js`, 66 lines: init, frame-event wiring, public API) plus `labor-booker-popup.js` (Quick Book popup UI), `labor-booker-flow.js` (booking pipeline + SAVE Ajax hook), `labor-booker-verify.js` (save trigger + response verification), `labor-decimal.js` (locale-aware decimal helpers), and `labor-booker-state.js` (cross-file mutable state). No behavior change.
- **`labor-tracker.js` moved into `src/modules/labor/` so the labor module lives under one folder.** Imports in `boot.js` and tracker-internal paths updated; comment-only path references in `core/state.js` and `core/sync.js` follow.

## v14.14.117 — Toolbar injection fallbacks pruned (2026-05-02)

### Cleanup
- **Top-frame menu toolbar injection drops the dock-query and any-toolbar-scan fallbacks.** (`mainmenubar` xtype) is the primary and the DOM-anchor walk on `.x-btn-mainmenuButton-toolbar-small` stays as the fallback.
- **AutoFill button injection collapses to one strategy.** `EAM.Utils.getMainToolbar()` is the single path; the prior `recordPanel.getDockedItems('toolbar[dock="top"]')`, `.toolbarExpandRight` DOM-anchor, and tab-bar absolute-position fallbacks are removed along with the pre-flight `rvForm` lookup that only existed to feed Strategy 1. Per-screen retries already cover the early-mount window where `getMainToolbar()` returns null.
- **Active WO-number resolution centralized in `core/eam/eam-record.js#getActiveWoNumber`.** The same `span.recordcode` + `offsetParent` visibility scrape was duplicated four times (autofill `wo-shared`, labor-booker, ptp-context-broadcaster, message-router). One owner now handles the active-screen scope filter via `findActiveScreenTarget` and uses the active recordview form's bound record (store).

## v14.14.116 — EAM gAppData becomes the source of truth for tenant, dateformat, and screen-cache mode (2026-05-02)

### Correctness
- **Default date format now reads from EAM's `gAppData.installparams.dateformat` instead of an OS-locale sniff.** New `getEamDateFormat()` / `getEamDateSeparator()` helpers in `dates.js` map EAM's format string (`m/d/Y`, `d/m/Y`, `Y-m-d`, `d-M-Y`) to the existing `'us' | 'eu' | 'iso' | 'mon'` enum and the matching separator. `initializeGeneralSettings` re-evaluates on the fresh-install path so EU/UK/APAC tenants pick up their EAM-supplied format the moment `gAppData` populates. The user's stored override still wins.
- **`DEFAULT_TENANT` resolves from `gAppData.tenantid` instead of a hostname regex.** `eu*` → EU / anything-else → NA was correct for US/EU but silently fell back to NA for APAC. `getDefaultTenant()` now reads `window.gAppData?.tenantid` lazily; `SESSION_TIMEOUT_URL` becomes `getSessionTimeoutUrl()` and `LINK_CONFIG.tenant` becomes a getter so all six call sites pick up the live value.

### Convention
- **Forecast navigation skips the cached-iframe path for screens not in `gAppData.installparams.screencachelist`.** EAM only mounts dedicated `uxtabiframe[screenId=X]` slots for cache-listed userFunctions (today: WSJOBS only) — Path A was guaranteed to miss for CTJOBS, ADJOBS, etc., adding DOM-walk cost on every forecast nav. New `isScreenCached()` / `getScreenCacheList()` helpers in `eam-context.js` short-circuit Path A in `_activateCachedScreen()` and gate `_isScreenCacheWrapper()` in `message-router.js` so non-cache-mode tenants skip the same-origin frame walk entirely.

### Cleanup
- **OS-locale sniff and hostname tenant fallback retired.** With EAM as the authoritative source, the old `Intl.DateTimeFormat` parts walk in `state.js` and the `eu*`/`us*` hostname regex in `constants.js` are dead weight — the EAM helpers cover every tenant correctly. Theme-shield's SSO rescue link on `idp.federate.amazon.com` (the only caller that runs without `gAppData`) carries an inline `AMAZONRMENA_PRD` literal at the use site instead.

## v14.14.115 — Assign To Me anchors inline and rides the form lifecycle (2026-05-02)

### Correctness
- ** Adjusted Assign To Me button injection method** The last attempt was not ideal, the button blinked on every load and sometimes never came back. The button now anchors on the description field's body wrap like before, but registers an `afterrecordchange` listener on the form panel — mirroring Amazon's SIM-T icon pattern in `work_orders.js` — so re-injection runs once per record load at the right ExtJS lifecycle point with no removal path.

## v14.14.114 — PTP iframe auth recovery + timer/status persistence (2026-05-02)

### Correctness
- **PTP backup handlers now work in screen cache `{once:true}` `relayIframeUrl` listener.** In screen-cache mode the PTP iframe sits inside the EAM child frame — every lookup returned null because it was looking in the top frame, so v14.14.109's `requestUrlParams` reply never fired and a single missed handshake from Amazon's work_orders.js left PTP stuck on "WO connection error". The query now reads the current frame's `document`.
- **The PTP Take-2 Timer and Status Tracking toggles stability increased across reloads.** Settings panel built a "diagnostic-consistency" cleanup at panel-build time that wrote `ptpTimerEnabled=false` / `ptpTrackingEnabled=false` whenever its `ptpPrefsEnabled()` gate was false — which is set true if not `AppContext.isUS1`, suspected to trip recently on the `idp.federate.amazon.com` SSO bounce during session reload. APMStorage writes go through GM_setValue, which is shared across every userscript-matched domain, so each pass clobbered the user's US1 prefs back to false and the next us1 reload showed them disabled. Cleanup no longer needed; `syncPtpPrefs` already keeps the children in sync when the sandbox flag is toggled, and the migrations that could have left stale state are gone migrated by now.

### Convention
- **Toggling PTP Sandbox back on now re-enables the Timer and Status Tracking children too.** `syncPtpPrefs` was a one-way switch — turning sandbox off persisted the children to false, but turning it back on left them at false and required the user to re-opt-in manually, which was intentional but wrong. It now treats sandbox as a master switch in both directions; an explicit `AppContext.isUS1` early-return guards a stray programmatic call from clobbering shared cross-domain storage in SSO intermediate pages.

## v14.14.113 — EAM context readers consolidated (2026-05-02)

### Convention
- **One durable read function per EAM context dimension.** `getCurrentUser`, `getCurrentOrganization`, and `getActiveScreen` move into a new `src/core/eam/eam-context.js`, replacing 11 bespoke fallback chains spread across labor, autofill, session-snapshot, and PTP. User resolution is cache-first (AppState.session.user → APMStorage → EAM.AppData → EAM.Context). Organization resolution is forecast-picker first then EAM.Context. DOM-scrape fallbacks are gone — fail visible. `cleanEmployeeId` migrates here from `labor-service.js` for the same reason it was being imported by autofill, ptp, and labor-tracker. No user-visible delta.

## v14.14.112 — Drop expired PTP flag migrations (2026-05-01)

### Cleanup
- **The four one-shot PTP flag migrations (`renamePtpFlag`, `splitPtpTimerSetting`, `ensurePtpFlag`, `clearPtpForNonUS1`) come out of `migration-manager`.** They covered the v14.14.50 ptpTimer→ptpSandbox rename plus the region-lock cleanup; every active install has long since marked them complete in `migrations_done`, so the code paths only sat there as a misfire risk. The runtime guard in `FeatureFlags.isEnabled('ptpSandbox')` still forces the flag off for non-US1/non-PTP frames, so removing `clearPtpForNonUS1` does not loosen the region lock. Stale `ptp_flag_*` IDs already in users' `migrations_done` are inert — the runner just never sees those IDs again.

## v14.14.111 — Assign To Me button drops its layout-recovery observer (2026-05-01)

### Cleanup
- **Assign To Me on WO record-view now anchors on the description field's outer ExtJS element instead of inside the trigger-wrap parent.** The deeper anchor was destroyed by ExtJS layout passes — including the reflow colorcode's PTP-tag injection sets off — which forced a MutationObserver to re-inject the button on every wipe. Switching to `descField.el.dom` + `appendChild` (the same shape Amazon's `work_orders.js` uses for its SIM-T icon) places the button on a container that survives reflow; the observer and its parent-flex setup come out, and the existing polling re-inject in `injectAutoFillTriggers` covers full field destruction.

## v14.14.109 — PTP capture rewrite, iPTP support, auth recovery (2026-05-01)

### Correctness
- **PTP iframes now recover from a Midway SSO bounce instead of stalling 5 s and landing on WO connection fail.** When PTP's React app lands on `/login.html` without `workordernum`/`organization`, it posts `{type:'requestUrlParams'}` to its parent and expects `{type:'urlParams', data:{src}}` back so it can `location.replace` to a parameterised URL — without a reply it falls on error page. `message-router` now matches the iframe by `contentWindow` identity and replies with the iframe element's `src` attribute.
- **Cognito auth failures now surface as diagnostic log lines instead of silently returning `false`.** Amplify's `Auth.currentSession()` already serialises refresh before each PTP API call, so a 401/403 after that point means a stale refreshToken or out-of-band sign-out — previously the sandbox just returned false and the failure left no trace. The sandbox now posts `APM_PTP_AUTH_FAILED` with status code and endpoint name; `message-router` logs at INFO so the failure lands in diagnostic dumps.
- **iPTP→PTP conversion now capture into PTP history.** `convert_iptp_assess` emits a START for `target_workorder_id` so the timer fires for the new PTP; `create_troubleshooting` emits a START using the broadcast WO context (its body has none). Standalone iPTP submits — recognised by a non-numeric `workorder_id` (the user alias) — emit `APM_PTP_IPTP_COMPLETED`/`APM_PTP_IPTP_CANCELLED` instead of being dropped.

### Cleanup
- **PTP capture collapses from nine layered mechanisms to two pure helpers.** The previous stack — response-status parser, depth-2 sweep, text regex, DOM "now complete" watcher, click delegation, 10 s submit watchdog, route polling + history patches, `get_all_assessment` safety net, and the body-driven submit decision — is replaced by `parseStateTransition(url, status, body, currentWo)` and `parseListResponse(url, parsedBody, user, currentWo)`, both fed by a single XHR/fetch `loadend` listener. Coverage spans every observed transition (start, complete, cancel, list-view stop, completed-elsewhere) plus the new iPTP and conversion paths at roughly 300 fewer lines in `ptp-sandbox.js`; the four dormant safety nets (route polling, click delegation, DOM watcher, submit watchdog) leave alongside since `get_all_assessment` interception and the body-driven submit decision cover their cases directly.
- **Cognito auth gate removed.** The 500 ms-poll hold-and-release queue at module-eval time double-gated `execute-api` calls that Amplify was already serialising through `currentSession`/`refreshSessionIfPossible` — adding 0–500 ms latency on the happy path and merely delaying the inevitable 401 by up to 15 s on the dead-refreshToken path. The paired `APM_PTP_AUTH_GATE`/`APM_PTP_AUTH_DIAG` handlers in `message-router` come out alongside.

## v14.14.108 — Refresh from server now clears pending labor records (2026-05-01)

### Correctness
- **The labor tally panel's "Refresh from server" button now drops pending records too.** `force=true` on `LaborService.getData` only bypasses the 60-second fetch gate — it does not clear `_pendingRecords`, the buffer that holds bookings extracted from SAVE responses for up to two minutes. A pending record with a malformed `datework` survived every refresh and silently dropped from `calculateTally` for the full two-minute window, making refresh appear to do nothing until the entry expired on its own. The refresh handler now calls `invalidateCache()` first.

### Quality
- **`calculateTally` logs a one-line summary at INFO so future bad-state cases show up in diagnostic dumps.** Previously, when 104 records came back from the server but the tally rendered as 0.00 hrs with an empty breakdown, there was no way to tell from a diagnostic export whether the records lacked `datework`, failed `parseEamDate`, or fell outside the day window. The new log records the input count, total hours, bucket count, and `daysParam` on every tally pass.

## v14.14.107 — CTJOBS column orders save and restore correctly (2026-05-01)

### Correctness
- **Column orders on CTJOBS (and any other screen sharing WSJOBS's store class) now save and restore under the user-facing screen key instead of the system key.** CTJOBS reuses the `wsjobs_lst_lst` store class, so storeId-based class-path detection resolved every CTJOBS grid to `WSJOBS` — saves landed at `WSJOBS|<dataspy>` while the LST intercept correctly looked up `CTJOBS|<dataspy>` from the POST body, reload never matched the save and CTJOBS appeared to forget its column state. The `lst-intercept` now stamps `{userFunc, sysFunc}` on the window from the POST body on every parsed `.LST`; `grid-column-override` consults the stamp at `initComponent` (overriding class-path when its result equals `sysFunc` and `userFunc` differs) and reads `proxy.extraParams.USER_FUNCTION_NAME` at save time (authoritative once GRIDDATA has fired).

## v14.14.106 — Welcome screen Better APM import (2026-04-30)

### Quality
- **Welcome screen offers one-click migration from Better APM.** Fresh installs that find Better APM's `apmMappings` / `apmUiTheme` keys in localStorage now see a browser-style "Import" prompt on the landing page.
- **Welcome modal scales with the same zoom compensation as the help overlay, settings panel, and forecast UI.** On displays running below 100% effective scaling the modal previously rendered at native 420px and was hard to read.
- **Welcome tour pages now show feature screenshots instead of emoji icons.** Forecast, Labor, and the three settings-panel features each render the same screenshots used in the help overlay so first-time users get a concrete preview of what they're being offered.

### Cleanup
- **Textarea-paste rule import drops a dead reference to a never-implemented `showConsolidationBanner`.** The post-import call sat at `colorcode-lifecycle.js:654` but the function was never defined or imported anywhere — any Better APM paste that surfaced consolidation groups would have ReferenceError'd silently after the rules were saved. Call removed along with the unused `preConsolidated` snapshot; the existing success toast continues to convey the consolidated-count outcome.

## v14.14.105 — Boot-time exception cleanup (2026-04-30)

### Correctness
- **Forecast hotkey listener no longer crashes on Chrome autofill clicks.** Chrome's saved-entries popup fires a keydown without a `key` property, so `e.key.toLowerCase()` threw. The handler now early-returns unless `altKey` is set and `e.key` is a string — Alt+T / Alt+C are the only bindings.
- **ColorCode panel no longer ReferenceErrors on the empty-rules path.** `colorcode-lifecycle.js` rendered the "No rules found" placeholder via `el(...)` but never imported `el` from `dom-helpers`. Dormant until Settings opened with zero rules. Import added.
- **Storage absorbs Tampermonkey GM port-disconnect errors.** Frames being torn down can leave `GM_setValue/getValue/deleteValue` throwing "Attempting to use a disconnected port object" mid-save. `APMStorage.{get,set,remove}` now detect that message, latch a per-frame flag so subsequent calls skip GM, and log at debug; localStorage already covered the data path.

## v14.14.104 — PTP completion captured at submit-time from request body (2026-04-30)

### Critical
- **PTP completion now captured directly from the `/submit_assessment` request body, not only from response parsing.** The prior path detected completion by scraping the submit response and the follow-up `get_assessment` — both succeed most of the time, but the timing variation occasionally caused both paths to miss, leaving `PTP_HISTORY` empty or incomplete and AutoFill skipping labor with "PTP not completed". A new request-body path runs first inside the submit XHR's `loadend`: a 200 POST to `/submit_assessment` with a numeric `workorder_id`. Rework of how capture is done to come later after PTP src review.

## v14.14.103 — TabGridOrder null-target passthrough (2026-04-30)

### Correctness
- **`mainTabPanel.setActiveTab(null)` and `beforetabchange` with `newCard == null` now pass through to ExtJS instead of being blocked.** The first list→record transition after a screen-cache nav fires several `setActiveTab(null)` calls during EAM's lazy build of the record-view tab content. The override was substituting `getActiveTab()` (the current LIST tab) for null, which misled EAM's caller into reading `.tabXtype` off the wrong panel and flowing into `Ext.create(undefined)` → "TypeError: c is not a constructor" inside `ClassManager.getInstantiator`'s compiled `new Function('c','a','return new c(...)')`. Null targets aren't user-visible focus yanks — they're internal EAM lazy-build no-ops — so the block protected nothing and actively misdirected the framework.

## v14.14.102 — Screen-detection mcp migration completes (2026-04-30)

### Quality
- **Screen-detection across the codebase routes through EAM's mcp `getMainContentPanel` snapshot instead of multi-frame walks + positioning math.** `findMainGrid`, `findMainTabPanel`, `queryActiveView`, `AjaxHooks.activeOnly` + `ModuleGuard.onAjax`, the `detectActiveScreen` FocusManager-iframe-pick, and the dataspy combo lookup all migrate; structural mcp answers replace a `getBoundingClientRect().top < -1000` heuristic that required pairing other checks to account for non cached frames shared in cached iframe. This mcp simplifies things and reduces code burden on any new additions requiring screen context.
- **`target.containsEl(el)` / `containsComp(comp)` / `containsDoc(doc)` bake the within-screen card-layout filter into the mcp primitive.** EAM's shared-iframe COMMON mode (one iframe hosts multiple screens via card layout) requires layering the within-screen visibility check on top of the frame-level mcp answer; making consumers compose it manually invited omission. The new methods make the safe path the default; `findMainGrid` / `findMainTabPanel` / `_findActiveDataspyCombo` now also reject stale shared-iframe siblings as part of the same sweep.

### Cleanup
- **`forEachExtWindow`'s `activeOnly` opt deleted** (zero production callers; only test code passed it). Function collapses to a thin `getExtWindows().forEach` wrapper.

## v14.14.101 — Forecast nav simplified to two strategies (2026-04-30)

### Quality
- **Forecast nav uses structural ExtJS selectors instead of tab text for screen cache nav.** The cached-screen path now activates the matching `uxtabiframe[screenId=X]` — or the shared NONCACHE slot when its current occupant's `userFunction` matches the target — via `mcp.setActiveTab(...)`, identical to EAM's own short-path at `app.js:643964`. No `'Work Orders'` / `'Compliance Work Orders'` text comparison. Navigation back to a previously-loaded non-cached screen now hits the cache path too — which avoids a full `launchScreen` destroy + remount. Each successful nav emits one `Logger.info` line of the form `Navigated to <target> via <method>` (`screen-cache` | `launchScreen`) for triage. ]

### Cleanup
- **Removed 2 fallback strategies.** The previous menu-walk and URL-redirect fallbacks are gone along with their `apm-pending-forecast` sessionStorage handshake — they only fired when `launchScreen` was unavailable, which never happens.

## v14.14.100 — launchScreen error suppression retired (2026-04-29)

### Cleanup
- **`launchScreenDirect` no longer installs the 8-second blanket error suppression by default.** The destroy-race null-deref the suppression was originally added to mask is already prevented by the navigation guard + `APMScheduler.pause(8000)` introduced afterwards — those stop the scheduler tasks racing `prevScreen.destroy()` so the NPE never fires in the first place. Confirmed by toggling suppression off through a temporary diagnostic flag, running cold-start forecast navs, and seeing zero browser error popups, zero suppressed-error log lines, and a clean `Forecast Complete`. The new `disableTransitionSuppression` flag is default-on (suppression skipped); the `suppressEamTransitionError` / `patchWindow` / `isTransitionError` helpers stay behind it as an opt-out escape hatch in case the race ever resurfaces under conditions not currently exercised.

## v14.14.99 — Multi-install warning banner (2026-04-29)

### Quality
- **Multi-install warning banner.** Multiple Tampermonkey installs of APM Master fan every listener into N parallel firings on every click and Ajax burst; v14.14.98's debounce hid the menu-blink symptom but the underlying duplication stayed. A persistent top-of-viewport orange banner now mounts ~3s after boot when `window.top._apmUi.installs.length > 1`, names the install count, and tells users to clean up Tampermonkey and refresh. Built with raw DOM and inline styles in `src/ui/multi-install-banner.js` (same defensive approach as the diagnostic overlay) so the banner survives whatever broke UIManager.

## v14.14.98 — Multi-install fan-out fix + diagnostic overlay + toolbar Amazon-pattern alignment (2026-04-29)

### Critical
- **Multiple userscript installs of APM Master fanned every click into N synchronous toggle calls, hiding the menu before users could see it.** Each sandboxed install registered its own `mousedown` + `APM_TOGGLE_*` listeners on the shared page document, so a single click fired the toolbar handler N times and `UIManager.toggle` flipped the panel open/closed/open within microseconds — visible as nothing happening on a single click and a brief flash on rapid clicks. `UIManager.toggle` now applies a 250ms per-panel debounce keyed on the shared `window.top._apmUi.toggleTimes` registry so all sandboxes coordinate; the first toggle wins and follow-ups within the window are dropped. `initUIManager` also pushes to a shared `installs` array on each boot so diagnostics can surface a diagnostic panel and warning.

### Quality
- **Top-frame nav and per-screen WO toolbar discovery now use direct ExtJS handles with position-aware insertion.** `toolbar-injection.js` queries `mainmenubar` xtype directly and inserts after the last main-menu button; `autofill-triggers.js` calls `EAM.Utils.getMainToolbar()` and inserts before the toolbar's `tbfill` spacer (Amazon's anchor pattern). Existing fallbacks retained.
- **Diagnostic overlay (`Ctrl+Shift+Alt+D` to toggle) for capturing field issues when the normal Settings menu is unreachable.** Floating panel with live status (UIManager registry, panel show/hide history, click history, browser, scripts on page, globals of interest, storage keys, GM_info) plus Copy summary and Download .json buttons. Auto-mounts when `node build.js --diag` builds the userscript with `__APM_DIAG_BUILD=true` for shipping a one-off diagnostic build to a specific user; hotkey-gated in prod/debug builds at ~5 KB cost. Self-contained: uses raw DOM and its own click handlers so it can't be broken by the same UIManager paths it was helping diagnose.

## v14.14.95 — UI primitives subdirectory (2026-04-29)

### Quality
- **`dom-helpers`, `toast`, `status`, `tokens`, and `locale` move from flat `src/core/` into `src/core/primitives/`.** These five files are tiny UI atoms shared by core, ui, and modules — keeping them flat alongside infrastructure orchestrators blurred the boundary and offered no obvious home for future additions (notification banners, modals, `tokens-settings.js` for user color customization). The new subdirectory mirrors the `theme/`, `ext/`, `eam/` pattern adopted earlier in the audit follow-up wave; 55 consumer imports rewrote mechanically and `frame-manager` / `state` updated their relative paths to `./primitives/`. No runtime behavior change; resolves P3.6 of the 2026-04-26 src/core audit.

## v14.14.94 — Dead cross-frame sync fallbacks removed (2026-04-29)

### Cleanup
- **`core/sync.js` no longer carries direct-mutation fallbacks for `apm_v1_autofill_presets`, `apm_v1_tab_order`, `apm_v1_colorcode_rules`, or `apm_v1_colorcode_settings`.** Both modules register `storageSyncHook:*` at boot, so the dispatcher's hook lookup always handles those keys; the four fallback functions and their `case` branches in the switch were dead code as of v14.14.93. The dispatcher now handles only the two surviving core-owned keys (general settings, session) — both stay because their state has no natural "owning module". New modules join cross-frame sync by registering a hook at the bottom of their prefs file; no `core/` change needed. Closes the AppState module-local inversion campaign.

## v14.14.93 — Autofill presets moved to module-local (2026-04-28)

### Cleanup
- **`AppState.autofill.presets` moves out of `core/state.js` and into `modules/autofill/autofill-prefs.js` as module-local `_presets`.** Cross-frame sync now flows through `storageSyncHook:apm_v1_autofill_presets` and `storageSyncHook:apm_v1_tab_order` registered at module load, dispatched by the seam added in v14.14.91. The preset hook also invalidates the compiled keyword indexes — the prior `handleAutoFillPresetsSync` fallback never did, so cross-frame keyword updates stayed invisible to the receiving frame's lookup until the next local mutation. `AppState` now holds only the `session` slice; the dead sync.js fallbacks (autofill, tab-order, colorcode) land in v14.14.94. Implements Phase 3 of the AppState module-local inversion campaign.

## v14.14.92 — ColorCode state moved to module-local (2026-04-28)

### Cleanup
- **`colorCode.rules` and `colorCode.settings` move out of `AppState` and into `colorcode-prefs.js` as module-local `_rules`/`_settings`.** Cross-frame sync now flows through `storageSyncHook:apm_v1_colorcode_rules` and `storageSyncHook:apm_v1_colorcode_settings` registered at module load, dispatched by the seam added in v14.14.91. The legacy `handleColorCodeRulesSync`/`handleColorCodeSettingsSync` paths in `core/sync.js` survive only as guarded dead code (`if (!AppState.colorCode) return`) until v14.14.94 deletes them; in practice the hook always fires first because `colorcode-prefs.js` registers at boot. After this, `AppState` carries only `autofill.presets` (also coming home in v14.14.93) and `session.*`.
- **New `removePreviewRules()` helper replaces three direct `AppState.colorCode.rules` mutations in `colorcode-lifecycle.js`.** Preview cleanup paths (panel close, panel-close mutation observer, boot-time stale cleanup) used to filter `AppState.colorCode.rules` in place to avoid `setRules`'s save+broadcast side effects; that contract is preserved as an exported transient mutator that bumps the rules cache generation but skips persistence and `APM_CC_SYNC_REQUIRED`. Implements Phase 2 of the AppState module-local inversion campaign.

## v14.14.91 — Storage sync inversion seam (2026-04-28)

### Quality
- **`core/sync.js` now dispatches storage events through `APMApi.listHooks('storageSyncHook:')` before falling back to the legacy switch.** First step toward moving `colorCode.{rules,settings}` and `autofill.presets` out of `core/state.js` into their owning modules, finishing the inversion v14.14.85 began. Hooks key off the full storage key (e.g. `storageSyncHook:apm_v1_colorcode_rules`) so dispatch is a single `APMApi.has`/`get` lookup; modules that haven't migrated still hit the existing direct-mutation handlers, so nothing changes at runtime yet. New `core/sync.test.js` covers hook dispatch, fallback path, error isolation, and falsy `newValue`. v14.14.92 wires colorcode through the seam; autofill follows. Implements Phase 1 of the AppState module-local inversion campaign.

## v14.14.90 — Quick search always targets WSJOBS (2026-04-28)

### Correctness
- **Forecast Quick Search is hardcoded to WSJOBS and ignores the advanced panel's target dropdown.** The quick-search Strategy fed `snapshot.targetFromUI` through `resolveTarget`, so leaving the advanced panel set to Compliance landed every quick jump on CTJOBS — symptom: `mode=quick, target=CTJOBS` in the log even though the advanced panel governs forecast filtering only. Quick search is a drillback-style record jump (`Nav.goTo` for the entered WO#) and is conceptually disconnected from forecast filter/dataspy state, so the strategy now returns `target: 'WSJOBS'` directly; `resolveTarget` is no longer imported.

## v14.14.89 — Direct-load placeholder recovery + auto-record-open consolidation (2026-04-28)

### Correctness
- **Drillback auto-open recovers from EAM placeholder bind via `_tabView.loadRecordData()` direct-load.** The v14.14.87 tab-tickle workaround is removed in favour of issuing the entity-detail XHR directly on the mounted HDR form — no tab activation, no flicker, ~3.5s on the verified bad repro. Snapshot restore (`openMatchingGridRecord`) and autofill grid-to-record (`navigateGridToRecord`) inherit the same recovery via the shared primitive.

### Cleanup
- **Auto-record-open consolidated behind `selectAndOpenGridRecord()`.** `record-open.js` exports one fire/poll/recover helper; `openFirstGridRecord`, `openMatchingGridRecord`, and `navigateGridToRecord` collapse into thin callers. Closes three bespoke implementations.
- **`drillbackAutoOpen` setting and three obsolete protections removed.** Direct-load recovery makes the opt-in toggle, `detectScreenCacheChurn`, Phase 2 force-bind, and `getControllerReadiness`/`waitForGridControllerReady` redundant. `record-open.js` shrinks ~150 lines.

## v14.14.88 — Legacy column-order keys re-cleanup + runtime strip (2026-04-28)

### Correctness
- **Saved column orders no longer go silently invisible after upgrading from pre-v14.14.41 storage.** Bare-key `columnOrders` entries (`WSJOBS`, `OSOBJP`) survived the v14.14.54 migration on some installs, and composite-key lookups miss them entirely, so every grid load served EAM defaults. `stripLegacyColumnOrderKeys()` now runs at every hydration path in `autofill-prefs.js` so a bare key cannot survive in-session. Affected users re-customize per (screen, dataspy) since bare data cannot be auto-promoted.

### Cleanup
- **`legacy_column_orders_cleanup_v2` migration runs across 7 boots.** New `runs: N` option in `MigrationManager` (tracked via `MIGRATIONS_RUN_COUNT_KEY`) so the storage cleanup survives stale-tab writebacks. Runtime strip stands down once v2 finalises.

## v14.14.87 — Drillback / Quick-Jump Phantom-Bind Recovery (2026-04-28)

### Correctness
- **Auto-open drillback and Forecast Quick Jump recover when EAM lands the form on its `<Auto-Generated>` placeholder.** `verifyAndRecoverRecordBind` switches from phantom-flag to content-match (compares the bound record's entity ID to the gridRecord's) and, on mismatch, runs `recoverViaTabTickle` — a programmatic `tabchange` that fires `MasterScreenController.loadTabData` and lets EAM populate the form natively. Full chain in [`.planning/postmortems/postmortem-drillback-record-open-recovery-2026-04-28.md`](.planning/postmortems/postmortem-drillback-record-open-recovery-2026-04-28.md).

## v14.14.86 — P3.5: Visibility Primitives Migration (2026-04-28)

### Cleanup
- **Modules now reach for `ScreenScope` instead of the three near-synonyms (`isActiveFrame`, `isElementInActiveView`, `isComponentOnActiveScreen`).** `ScreenScope.from(ref)` learns to accept a raw `Window` so single-frame callers (session-snapshot grid-state) skip the active-frame scan. Seven module/UI sites migrate: autofill-helpers (`discoverRecordTabPanel`, `detectActiveTab`, `findActiveTabContainer` — internal swap to scope.contains), wo-workflow (equipment read, HDR confirmation poll/fast path, Strategy 2 fallback), wo-checklists (Strategy 2 ACK fallback), session-snapshot grid-state (filter-field gate), and settings-panel (record-tabs check). After this, only two surviving frame-level call sites in modules — both in colorcode for legitimate per-iframe iteration — plus the `wo-shared.js` documented bounding-rect opt-out. `isElementInActiveView` and `isComponentOnActiveScreen` exit the module surface entirely (still exported for `ScreenScope` and `dom-queries` internals); `isActiveFrame` survives as the documented frame-level primitive that the foundational ajax gate (`AjaxHooks.activeOnly`, `ModuleGuard.onAjax`) consumes. Implements P3.5 from the 2026-04-26 audit; no behaviour change.

## v14.14.85 — Trim dead `AppState` slices; module-local autofill running flag (2026-04-27)

### Cleanup
- **`AppState` drops the `forecast`, `ptp`, and `systemDefaults` slices and the unused `colorCode.footerObserver` / `colorCode.activeFilter` fields.** Forecast and ptp moved to module-local state long ago, but the husk slices stayed in `core/state.js` and accumulated dead structure (six forecast fields, three ptp fields, two systemDefaults fields, two unused colorCode fields — 13 fields with zero readers across `src/`). Removed alongside the matching shape assertions in `state.test.js`. Implements P3.3 from the 2026-04-26 audit, partial — the persistent/runtime distinction is now sharper because only the cross-cutting state remains in `AppState`.
- **`autofill.isAutoFillRunning` moves from `AppState` to module-local in `autofill-prefs.js`.** All readers/writers go through the existing `getIsAutoFillRunning` / `setIsAutoFillRunning` exports (and `APMApi.get('getIsAutoFillRunning')` for `ext-consistency`), so the move is internal-only — no consumer changes. Sets the precedent for a follow-up plan that finishes the inversion: `autofill.presets`, `colorCode.rules`, and `colorCode.settings` become module-local once `core/sync.js` dispatches via `APMApi` hooks instead of writing to slices directly. The remaining `session.{isInitialized, isFresh}` runtime flags stay in `AppState` because their consumers span `core/sync`, `core/diagnostics`, and `modules/labor-tracker` — they are intentionally co-located with the captured `eamid/tenant/user` fields they describe.

## v14.14.84 — Remove dead `APM_VIEW_TRANSITION` dispatch path (2026-04-27)

### Cleanup
- **`frame-manager.js` — Drop `hookViewTransitions` and the `APM_VIEW_TRANSITION` event.** The function patched every `listdetailview.setActiveItem` per frame to fire `APM_VIEW_TRANSITION` events that no module reads anymore. All four prior consumers (tab-title, session-snapshot, labor Quick Book, closing-comments-counter) had already migrated to `APM_EAM_VIEW_CHANGE` from the shared title observer plus an AJAX `.HDR` hook because the layout intercept never fired in screen-cache mode and missed start-center → record navigation. Removes the function, the `_hookedLayouts` and `_hookedTransitionWins` WeakSets, and three call sites (`scanAndAttachFrames` top-frame call, the iframe `triggerConsistency` closure, and the discovery-burst re-hook). `core/README.md`, `ARCHITECTURE.md`, and the labor + infrastructure skill docs now point at `APM_EAM_VIEW_CHANGE` as the canonical view-change event. Implements P3.2 from the 2026-04-26 audit; no behaviour change.

## v14.14.83 — Orchestrator Smoke Tests (2026-04-27)

### Quality
- **`frame-manager`, `ext-consistency`, and `message-router` gain smoke coverage.** 71 new tests across the three orchestrators covering origin gating, hook iteration, navigation-guard short-circuits, debounce/reentrancy, and PTP history evolution. Two test-only reset exports (`_resetFrameManagerForTest`, `_resetExtConsistencyForTest`) prevent module-level state leakage between tests. Closes the largest test-coverage gap in `core/`; implements P3.4 from the 2026-04-26 audit.

## v14.14.82 — Grid widths apply on no-LST screen reload (2026-04-27)

### Correctness
- **Saved column widths now apply on the second visit to a screen when EAM caches FIELD definitions and skips the `.LST` XHR.** `_funcFromStore` in `src/core/ext/ext-screen.js` resolved screen identity from `extraParams.USER_FUNCTION_NAME`, but at `initComponent` post-callParent the proxy is still a memory placeholder — `extraParams` is undefined, `$className`/`self.$className`/`model.$className` are null on the instance, and `detectScreenFunction`'s window-wide grid scan leaks the previous screen's identity from a not-yet-destroyed neighbour. The function now iterates five class-path candidates with `store.storeId` as the load-bearing one (in EAM it equals the full class path, e.g. `EAM.store.work.workorder.wsjobs_lst_lst`) and falls through to `extraParams` only for non-`_lst`-shape stores.

### Cleanup
- **Grid override diagnostic noise removed.** `wireReuseDiagnostics` and its `show`/parent-`activate` listeners were built on the disproven hypothesis that EAM reuses grid instances; fresh grids are constructed on every visit, so the listeners produced no useful signal. The proof-of-life `initComponent enter` / `post-callParent` info logs and the `skip(...)` early-return debug logs are dropped now that the override's reach is verified. The `init` and `afterrender` info logs stay as permanent diagnostics.
- **Cosmetic `[APMApi] get('systemDefaultTabOrder') — key not registered` console warning silenced.** `src/core/ext-consistency.js` and `src/modules/tab-grid-order/tab-grid-order.js` now gate the lookup behind `APMApi.has(...)` instead of letting `APMApi.get(...)` warn before the key is registered.

## v14.14.81 — Diagnostic Contributor Inversion (2026-04-26)

### Cleanup
- **Modules now contribute to the diagnostic export via `diagnosticHook:<name>`.** `core/diagnostics.js` adds `_collectModuleHooks()` that iterates `APMApi.listHooks('diagnosticHook:')`, calls each hook, and aggregates results under `summary.modules.<name>`. Hooks that throw are caught and surfaced as `{ error: '...' }` so one bad hook can't black-hole the export. Autofill ships as the demonstration migration: `autofill-prefs.js` registers `diagnosticHook:autofill` returning the per-screen-family preset summary that `diagnostics.js` previously hand-built. The inline autofill block in `_collectSavedDataSummary()` now skips when the hook is registered (single source of truth) and remains as fallback for the unmigrated colorcode/forecast/labor blocks. New modules contribute diagnostics with zero `core/` edits — same pattern as `consistencyHook:*`. Implements P2.4 from the 2026-04-26 audit; closes the last module-aware coupling in `core/`.

## v14.14.80 — Split `async-utils.js` Workflow from Primitives (2026-04-26)

### Cleanup
- **`async-utils.js` collapses from 562 lines to 51, with the EAM record-open orchestrators moving to a dedicated `core/record-open.js`.** The pure async primitives (`delay`, `debounce`, `throttle`, `waitForAjax`) had been crowded next to ~480 lines of stateful workflow code (`openFirstGridRecord`, `verifyAndRecoverRecordBind`, `waitAndOpenSingleResult`, `detectScreenCacheChurn`, `clearAutoOpenSentinel`, the `_autoOpenInProgress` flag, the `AUTO_OPEN_SENTINEL_KEY` sentinel) — and adding a primitive required reasoning about screen-cache subtleties that had nothing to do with timing helpers. The two consumers (`boot.js` for drillback auto-open, `forecast/engine/execution.js` for navigation) split their imports cleanly across the boundary. `record-open.js` now consumes `delay` and `waitForAjax` like any other caller. Adds `record-open.test.js` (sentinel + churn detection + view-state guards) and a fresh `waitForAjax` test in `async-utils.test.js`. Implements P2.2 from the 2026-04-26 audit; no behavior change.

## v14.14.79 — Split Wake Prompt UI from `session.js` (2026-04-26)

### Cleanup
- **Wake prompt extracted from `core/session.js` into `ui/wake-prompt.js`.** The wake-after-sleep banner — `Restore` / `Redirect to login` / `Dismiss` buttons, snapshot lookup, anti-replay click guard, animation — was 170 lines of inline DOM construction inside a service module. The presentation now lives under `src/ui/`; `session.js` keeps only the capture/heartbeat/redirect logic and dispatches `APM_SESSION_WAKE_NEEDED` when sleep detection or the network probe declares the session expired. UI subscribes to that event, owns its visibility state, exposes it via `APMApi.get('isWakePromptVisible')`, and emits `APM_SESSION_WAKE_DISMISSED` when the user clears the banner. `session.js` queries visibility through APMApi to gate normal-timeout detection. Implements P2.3 from the 2026-04-26 audit; no behavior change.

## v14.14.78 — Theme System Tests (2026-04-26)

### Quality
- **`theme-resolver` and `theme-enforcer` gain unit + smoke coverage.** 36 new tests across two files: priority resolution (KEY_THEME → CC_STORAGE_SET → APM_GENERAL_STORAGE), JSON-encoded vs raw values, GM-vs-localStorage fallback, error swallowing, multi-location write that preserves sibling keys, and a round-trip; plus enforcer smoke tests for early-exit gates (IDP, EAM auth, non-EAM/PTP), dark-canvas anti-flash injection (GM hint and cookie paths, no duplicate on re-run), apply-pipeline wiring (`applyThemeHooks` + `clearGuards` + `initThemeListeners`), `__apmThemeState` initialization, and try/catch around resolver and accessibility errors. Implements P2.5 from the 2026-04-26 audit — theme is load-bearing cross-frame logic with highly user-visible regressions (white flash, theme flicker) and was the largest uncovered subsystem in `core/`.

## v14.14.77 — `src/core/` Subdirectory Restructure (2026-04-26)

### Cleanup
- **`src/core/` flat layout splits into three subdirectories.** `theme-broadcast`, `theme-enforcer`, `theme-hooks`, `theme-resolver`, `theme-shield` move to `src/core/theme/`. `ext-windows`, `ext-finders`, `ext-screen`, `ext-guards`, `xhr-context` move to `src/core/ext/` (with their tests). `eam-nav`, `eam-query`, `eam-title-observer` move to `src/core/eam/` (with their tests). `ext-consistency` (orchestrator) stays at the core root. 78 importing files updated; tests (940) and build pass with no behavior change. Implements P2.1 from the 2026-04-26 audit — a flat 39-file `core/` was reaching the threshold where future additions would crowd unrelated concerns; the cluster boundaries (theme system, ExtJS helpers, EAM integration) now match directory boundaries.

## v14.14.76 — Trim Full System Backup UI (2026-04-26)

### Cleanup
- **Full System Backup is JSON-only.** Removes the Base64 export, the Copy B64 button, and the paste textarea. "Import All" now opens the file picker directly. JSON file in / JSON file out — every other path was unused.

## v14.14.75 — `src/core/` Audit P1 Batch (2026-04-26)

### Correctness
- **Forecast screen switch no longer throws `ReferenceError: defaultVal is not defined`.** `defaultVal` was declared inside an `if (dataspySelect)` block but referenced outside it when calling `syncDirectionToggle`. Hoisted to the handler top.

### Convention
- **WO selection-change binding derives from `ENTITY_REGISTRY`.** Replaces the hand-coded `wsjobs/ctjobs` store-id check in `ext-consistency.js` with a lookup of every entry with `entityKey: 'workordernum'`. New WO-family screens (e.g. `ADJOBS`) are picked up automatically.

### Quality
- **`APMApi.get()` warns once per unknown key; new `APMApi.has(key)` for explicit-undefined cases.** Typos surface in diagnostics instead of silently returning `undefined`.

### Cleanup
- **`utils.js` barrel removed; 64 importers now import directly from the per-concern modules** (`async-utils`, `dom-queries`, `ext-windows`, `ext-finders`, `ext-screen`, `ext-guards`, `xhr-context`, `dates`). Finishes the v14.14.66–v14.14.71 split.
- **"Plan 04 Task N" breadcrumbs retired** from `async-utils`, `ext-finders`, `ext-windows`, `xhr-context`, `utils` — the migration is done; the comments read as live TODOs.
- **`queryActiveView*` ↔ `ScreenScope.queryDOM*` cross-reference each other in JSDoc**, documenting the multi-frame-walk vs scope-bound boundary.
- **`src/core/README.md` adds a "Adding a new module" appendix** — 10 steps (flag → folder → `SettingsRegistry` → `frame-events` → `APMApi` → `ModuleGuard` → storage / logging / tests) plus an anti-patterns list.

## v14.14.72 — session-snapshot Split into Pipeline-Phase Modules (2026-04-26)

### Cleanup
- **`session-snapshot.js` decomposes from 1325 lines into a 189-line orchestrator plus six pipeline-phase modules** (`snapshot-store`, `grid-state`, `record-detector`, `capture-engine`, `restore-prompt`, `restore-engine`). Public API (`SessionSnapshot.init`) and on-disk schema (`_v: 2`) preserved; only consumer is `boot.js`. Adds 67 unit tests across the six modules (873 → 940).

## v14.14.71 — AutoFill Bulk Button: Frame-Aware Cache + dataIndex Cleanup (2026-04-26)

### Correctness
- **Yes/No/Clear bulk toolbar reappears after switching between Shift Report and Work Order checklists.** A module-level header cache short-circuited re-injection when its element was still `.isConnected` — which is always true in screen-cache mode because hidden frames stay in the DOM. The cached SHFRPT header satisfied the bail condition on every WSJOBS re-entry, starving the active grid silently with no log because the bail happened before any logging. The fast-path now also requires `ownerDocument === scope.doc`, so it only short-circuits within the same frame and falls through to a fresh column lookup on cross-frame transitions.
- **Result column resolved via `dataIndex='result'`.** Replaces the `.x-column-header-text-inner` text match with `headerCt.down('gridcolumn[dataIndex=result]')` (and a `columns.find` fallback) — locale-proof, survives header rename, and matches the data binding the original code comment already documented as the contract. Consolidates the v14.14.63 main hotfix (which kept text-match as a fallback) into the released line; the fallback is no longer needed once the column-model selector is trusted.

### Cleanup
- **Miss-after-success debug log fires once when the Result column disappears after a prior successful inject.** Targeted signal for future column-removal regressions; cleared on detection so it doesn't repeat on each re-entry.
- **Drop redundant `preventDefault` in the bulk-button click handler.** `stopPropagation` alone blocks the column-sort handler; `preventDefault` on a non-form button is a no-op.

> Note: a parallel hotfix landed on `main` as v14.14.63 covering the dataIndex column lookup ahead of this entry. v14.14.71 supersedes that work in the dev/Beta line and adds the frame-aware cache, miss log, and click-handler cleanup. Future hotfixes to `main` should use a 4-segment patch suffix (e.g. `14.14.62.1`) to avoid colliding with dev's version progression.

## v14.14.70 — colorcode-ui Split into Renderer + Lifecycle (2026-04-26)

### Correctness
- **Ctrl+Enter in the ColorCode import textarea now actually triggers the import.** The handler was attached as a bubble-phase `keydown` listener on the textarea element, so ExtJS swallowed the event on form elements before it reached the listener — same root cause as the v14.10.8 chip-input regression. Switching to a capture-phase `document` listener (filtered by `e.target.id`) lets the import fire as the placeholder text already advertises, and `stopImmediatePropagation` prevents ExtJS from acting on the same Enter.

### Cleanup
- **`colorcode-ui.js` decomposes from 1323 lines into a 24-line facade plus a renderer (392 lines) and a lifecycle (888 lines).** The monolith mixed pure-DOM construction (chip widget, rule list items, color picker, theme/import/consolidate modals, external-tags normalizer) with engine-side lifecycle (rule application, observers, panel-close cleanup, stale-preview pruning) — adding tests required spinning the whole settings panel, and the renderer surface had zero coverage. Pure-DOM code now lives in `colorcode-renderer.js`; the giant `setupColorCodeLogic` closure plus `cleanupColorCodeOnPanelClose` / `watchSettingsPanelClose` / `cleanupStalePreviewRules` move to `colorcode-lifecycle.js`. `colorcode-ui.js` is reduced to a re-export facade preserving the public surface and the three `APMApi.register` calls. Renderer extracted before lifecycle to avoid a circular intra-file dependency the original plan would have hit. Adds 39 unit tests (829 → 868) covering chip helpers, range expansion, external-tags normalization, rule-item rendering, toggle-button styling, pending-chip wrapping, and stale-preview filtering.

## v14.14.69 — Quick-Search Auto-Open Unblocked: Stale Sentinel + Stale-Buffer Churn Detect (2026-04-26)

### Correctness
- **Quick searching the same WO twice in a tab no longer silently fails with "WO not found."** The auto-open sentinel in `sessionStorage` was set on the first open and persisted for the tab's lifetime, blocking every subsequent `waitAndOpenSingleResult` call on that WO. `executeQuickSearch` now clears the sentinel via the new `clearAutoOpenSentinel()` helper before navigating, so user-initiated searches always win while the original double-fire protection for drillback boots stays intact.
- **`detectScreenCacheChurn` no longer blocks mid-session opens on stale BOUNDARY entries.** The check reads `── session reload ──` boundaries from `Diagnostics.logs`, a 150-entry circular buffer that survives the tab's lifetime — so any prior pair of reloads within 3 s permanently flagged every subsequent `openFirstGridRecord` call as bad-timing, leaving the user on the list grid and surfacing as "WO not found." downstream. The check now lives only in `boot.js handleDrillbackAutoOpen()` (its original fresh-boot drillback target); drillback users keep the v14.14.43 protection and the skip log moves from `[Utils]` to `[Boot]`.

### Quality
- **Coverage added.** `clearAutoOpenSentinel` and `detectScreenCacheChurn` now have unit tests in `async-utils.test.js`: sentinel removal / no-op / storage-failure swallowing, and churn detection across empty / single-boundary / near-pair / far-pair / slow-boot / fast-boot inputs (823 → 829 tests).

## v14.14.68 — core/utils.js Split into 8 Focused Modules (2026-04-26)

### Cleanup
- **`core/utils.js` decomposes from 1704 lines / 39 exports into a 30-line barrel plus eight per-concern modules** (`dates`, `async-utils`, `ext-guards`, `dom-queries`, `ext-windows`, `ext-finders`, `ext-screen`, `xhr-context`). Barrel re-exports preserve the 35 existing importers. Adds 252 tests covering UK-locale date parsing, FocusManager iframe preference, BSUDSC override lifecycle, screen-cache active-frame detection, and the `_SAFE_ACTIVE_VIEW` guard (568 → 820).

## v14.14.67 — Dismiss EAM Popups After HDR Save (2026-04-26)

### Correctness
- **`injectExtJSFieldsNative` now dismisses lingering EAM popups before returning.** The save click at the end of HDR record-fill could leave a confirm-save or validation dialog visible, which then blocked the engine from navigating to ACK for checklist completion. Every LOV setter already cleared its own popup, but the final save did not. Adds `await handleEamPopups(activeWin)` after `waitForAjax`, covering all three workflow paths (HDR-first, ACK-first, LABOR-first) since they all end HDR work through this function.

## v14.14.66 — Checklist Result-Column Selector Broadened + Diagnostic Logging (2026-04-26)

### Correctness
- **Bulk checklist toolbar and autofill engine handle Completed-only result rows defensively.** The shared result-column query in `performChecklistBulkAction` and `processCheckboxes` matched only `data-componentid^="uxrowcheckbox"`. A user reproducing on an all-Completed checklist saw every Completed row left untouched while Yes/No rows filled correctly. The selector now excludes only Follow-up (`checkboxfield`) widgets and treats every other in-row checkbox as a result-column candidate, covering EAM builds where the Completed widget uses a different prefix. Advanced-mode `'no'` action also unchecks single-checkbox Completed rows now, mirroring the bulk toolbar's existing 1-checkbox branch (was a silent no-op when `hasYesNo` was false). The advanced-modal column header for the result action relabels to `Yes/Completed` so the option semantics match what users see in the grid.

### Quality
- **Each checklist run logs a single INFO line with per-prefix counts.** `Bulk yes:` / `Checklist run:` entries record `rows`, the map of widget prefixes encountered (e.g. `{"uxrowcheckbox": 13}`), `modified`, `alreadyDone`, and `skipped`. Future selector mismatches surface in `apm-diagnostics-*.json` instead of failing silently, so reports of "autofill skipped my rows" can be diagnosed from one log entry without DOM probes.
- **Per-row checkbox click logic gains test coverage.** `wo-checklists.test.js` adds 7 happy-dom cases driving real `<tr>` elements through `view.getRow(i)`: single Completed click on `'yes'`, uncheck on `'no'`, Follow-up exclusion, a non-`uxrowcheckbox` prefix regression guard, Yes/No paired-row behaviour, and simple-count mode.

## v14.14.65 — AutoFill Engine Split: God Object to Facade (2026-04-26)

### Cleanup
- **`autofill-engine.js` split from 2088 lines into a 17-line facade plus eight focused files.** The engine mixed four workflow entry points (`executeAssignToMe`, `executeRepairFlow`, `executeShiftReportFlow`, `executeAutoFillFlow`) with their private helpers, the WO record-fill driver, the WO checklist driver, and three WO-shared utilities — all in one file with zero tests. Each workflow now lives in `workflows/` (`assign-to-me.js`, `repair-workflow.js`, `shift-report-workflow.js`, `wo-workflow.js`), the WO sub-drivers split into `workflows/wo-fields.js` and `workflows/wo-checklists.js`, and three WO-context helpers (`getWoNumberFromView`, `isPtpCompleted`, `resolveLaborHours`) move to `services/wo-shared.js`. Engine becomes a pure 4-export facade so consumers (`autofill-triggers.js`) keep importing from `./autofill-engine.js` with no path changes. Adds 112 new behavioral tests (568 → 680 across 38 files).

## v14.14.64 — Test Foundations: Vitest Coverage for Six Load-Bearing Core Files (2026-04-26)

### Quality
- **Six foundational `src/core/` files now have unit-test coverage.** `logger.js` (48 importers), `state.js` (22), `storage.js` (20), `api.js` (9), `scheduler.js` (10), and `ajax-hooks.js` (9) carried zero unit tests despite being load-bearing for every other module. Adds Vitest suites covering public API, dispatch semantics, error isolation, idempotence, GM/localStorage dual-write precedence, navigation guard auto-clear, and Ajax hook de-duplication so future refactors of dependent modules can detect regressions in these layers. Test count goes from 431 to 568 across 31 files (was 26).

## v14.14.63 — Architectural Inversion: Core Stops Importing Modules (2026-04-26)

### Convention
- **`src/core/` no longer imports from `src/modules/`.** Core orchestrators (`frame-manager`, `ext-consistency`, `message-router`) and `ui/settings-panel*` previously hard-coded module function calls, so adding a module meant editing core, removing one orphaned wiring, and boot order was implicit. Replaced with subscription via the existing `APMApi` registry and a new `frame-events` bus: modules register state queries on `APMApi`, subscribe to `frame:attached` / `frame:beforeAjax` / `frame:gridMutation` / `frame:ajaxBurst` / `frame:styleRefresh`, and a new `SettingsRegistry` lets modules describe their own settings sections so the panel renders whatever is registered. Adding or removing a module is now a same-file change inside the module.
- **`dom-helpers.js` moved from `src/ui/` to `src/core/`.** The `el()` factory has no UI policy — it's a generic DOM constructor — and living in `src/ui/` was producing false core→ui layering violations across `toast`, `status`, `session`, plus 13+ cross-layer module imports. The relocation eliminates the violations without changing semantics; 24 importers were updated.

### Quality
- **Vitest is wired and tested.** `npm test` runs 431 tests across 26 files (was 408 before this scope). New suites cover `dom-helpers`, `frame-events`, `APMApi.listHooks`, `settings-registry`, plus a starter `api.test.js` for the broader test-foundations work in plan 02. `happy-dom` was added as a devDependency so DOM-touching tests can run; `vitest.config.js` sets `environment: 'happy-dom'` globally.

## v14.14.62 — AutoFill Default-Profile Picker Anchors to Visible Frame (2026-04-26)

### Correctness
- **Default-profile picker no longer pops up far from the AutoFill button.** `showDefaultProfilePicker` walked `getAccessibleDocs()` to find the trigger and used the first match's `getBoundingClientRect()` to anchor its dropdown. With shared-iframe screen-cache, hidden screens keep their toolbars in the DOM and their AutoFill buttons stay queryable — so the iteration could land on a stale button whose coords belong to a hidden iframe's viewport, while the picker overlay is appended to the running frame's `document.body`. The resulting rect/viewport mismatch placed the picker hundreds of pixels away from the visible button (or off-screen entirely). Anchor lookup is now scoped to the running frame's own `document` so the rect always shares the overlay's viewport.

## v14.14.61 — Forecast Past/Future Indicators Reflect Actual State (2026-04-25)

### Correctness
- **Forecast profile summary ignored the saved `isPast` field.** `buildDateSummary` in `forecast-profile-manager.js` picked past vs. future labels purely from `isPastFacing(prof.target, prof.dataspy)`, so a profile whose dataspy was past-facing by default (e.g. "All Work Orders") always rendered "Last X Weeks" in the panel summary even after the builder's past/future chip was toggled to future and saved. With `dateOverride: true` the panel hides the schedule section entirely, so the summary line was the only signal — and it never updated. The summary now mirrors `computeDateInclusions`: saved `isPast` wins over dataspy default.
- **Standard-mode past/future chip read from a stale advanced-dropdown value.** `syncDirectionToggle` resolved its dataspy from `forecastState.dataspy` (the hidden advanced dropdown's last value), so simple/standard mode with `dataspyMode: 'default'` could keep the chip visible even though the run targeted "Open Work Orders". The chip and its click handler now use the same canonical `resolveDataspyValue` path as the execution pipeline, accounting for advanced visibility, the active profile, and the dataspy mode.

## v14.14.60 — Updater Works on Violentmonkey + Diagnostic Buffer Cleanup (2026-04-25)

### Correctness
- **Clicking "Update Available" now actually installs on Violentmonkey, Greasemonkey, and ScriptCat.** v14.14.17's `openUpdateUrl()` opened the `.user.js` URL backgrounded (`active: false`) and force-closed the tab after 3 seconds — a flow tuned for Tampermonkey's Chrome MV3 behaviour, which spawns its install prompt in a separate extension tab and caches the script content the moment the response arrives. Violentmonkey, Greasemonkey, and ScriptCat instead render the install confirmation INSIDE the navigated tab, so opening backgrounded hid the prompt and the 3-second auto-close dismissed it before any Confirm click could land. The updater now branches on `GM_info.scriptHandler`: Tampermonkey keeps the backgrounded + auto-close path (orphan source-tab cleanup still applies), while every other manager opens foregrounded with no auto-close so the user can confirm in the install tab.

### Cleanup
- **Theme persistence polling no longer floods the diagnostic buffer.** `setupPersistencePolling` in `theme-hooks.js` ran a 5-minute slow-poll for `Ext`/`EAM` availability and emitted a `Logger.warn('… timed out after 5 minutes')` at expiry. Repeated `applyThemeHooks` re-entries cycled fresh polling sessions, each completing its countdown and warning, so a long EAM session accumulated 100+ identical entries that crowded operational INFO/BOUNDARY logs out of the 150-entry circular buffer. The slow phase shrinks to 60 seconds (the property-trap setters in `setupJsTraps` catch later Ext/EAM assignments anyway), the warning demotes to `Logger.debug` (passive give-up signals are plumbing, per the INFO/DEBUG convention), gains `Ext=…, EAM=…` field context for future debugging, and a per-state `_warnedTimeout` flag prevents same-cycle re-emission. The underlying re-entry loop (root cause of the cycling) is logged in the plan file for a future investigation pass.
- **Diagnostic export now de-duplicates cross-frame log aggregation.** Each frame runs `restoreFromSession()` at boot and pulls previous-session logs from same-origin shared `sessionStorage`, so identical entries land in top frame's `Diagnostics.logs` and every iframe's `Diagnostics.logs`. `_aggregateFrameData()` concatenated all of them without dedup, so the exported diagnostic JSON could show the same log entry repeated N times across frames. A composite-key filter (`timestamp|level|tag|message` for logs, `timestamp|tag|message` for errors) drops duplicates before sorting. Per-frame log access in `detectScreenCacheChurn` is unchanged — the per-frame BOUNDARY pattern there is intentional ("the GOOD pattern" per `utils.js:1046`) and reads `Diagnostics.logs` directly, not via the aggregator.

## v14.14.59 — Keyword Chip Paste No Longer Splits on Commas (2026-04-25)

### Correctness
- **Pasting into a keyword chip input no longer splits on commas.** Both chip implementations — the shared `chip-input.js` (autofill WO keyword, autofill equipment-keyword, shift-report keyword) and the standalone `colorcode-ui.js` paste handler (color-code rule search terms) — ran `text.split(',')` on paste and added one chip per part, while Enter and the `+` button both committed the whole input as a single chip. Pasting `motor, fault` produced two chips while typing the same string and pressing Enter produced one. Both handlers now mirror Enter and `+`: the entire pasted string becomes one chip, so commas (and any other character) round-trip into the keyword/search arrays unchanged. The legacy comma-string → array migrators in `autofill-prefs.js`, `settings-panel-autofill.js`, and `colorcode-prefs.js` are untouched — they only fire on pre-array storage data and stay correct for new array-format chips.

## v14.14.58 — AutoFill Template Editor Refactor + Shift LOV Field (2026-04-25)

### Features
- **AutoFill WO presets now carry a `Shift` LOV field alongside `Assigned To`.** The two fields share a fixed-width 2-column row inside `Schedule & Labor`, sitting outside the collapsible date row and directly above `Book Labor:`. Column widths (`165px 135px`) are tuned so the Assigned To input's right edge lines up with the SCHEDULED dropdown directly below, and the Shift input matches the Assigned To input width — the section reads as an aligned grid rather than a stack of unrelated rows. The shift value is injected through `setEamLovFieldDirect` after the equipment cascade, with the canonical `waitForSettled → handleEamPopups → waitForSettled → verifyFieldValue` flank.

### Correctness
- **`needsRecordFill` gate now includes `shift`.** Without it, a preset whose only record-side change was the new shift field skipped the entire field-injection block — autofill matched the preset and then did nothing. Adding `matchedData.shift` to the OR chain alongside the other LOV/UDF fields is the minimum fix; future per-field additions need the same one-line gate update.

### Convention
- **Trouble Codes section dropped its Assignment column.** `Assign:` had been wedged into a 2×2 grid with Problem / Failure / Cause for layout convenience, not because it belonged there. Moved to Schedule & Labor (renamed `Assigned To`), and the trouble codes section now renders as a single 3-column row at the bottom of the editor.
- **Closing Comments wrapped in `apm-section-group`.** It was the only section in the WO editor without the standard panel-section box and label header. The inline `Closing:` label is now the section header instead.

### Cleanup
- **Closing textarea visible height grew by ~one line.** `.apm-textarea-input` was `height: 54px` but `textarea.field-input { height: auto }` (specificity 0,1,1) at styles.js:458 silently outranked it (specificity 0,1,0), so the textarea collapsed to its default `rows=2` regardless. Selector raised to `.field-input.apm-textarea-input` (specificity 0,2,0) and height bumped to `72px`.
- **Focus state in the creator panel no longer inverts inputs in dark mode.** The `:focus` rules at styles.js:262 and styles.js:460 swapped `background` to `--apm-surface-raised` (dark slate) and `color` to `--apm-text-primary` (white), inverting the light-bg/dark-text inputs into dark-bg/white-text on focus. Both rules now keep input colors and signal focus only via `border-color` and `box-shadow` — the `#apm-creator-panel`-scoped rule's fix improves every input in the editor, not just the textarea.

## v14.14.57 — PTP Sub-Toggles Persist & Grey Out When Sandbox Flag Off (2026-04-25)

### Correctness
- **Disabling the PTP Sandbox feature flag now persists `ptpTrackingEnabled` and `ptpTimerEnabled` to false and visibly greys out their settings rows.** `syncPtpPrefs()` only updated the in-DOM checkbox via `cb.checked = false` and never called `setGeneralSetting()`, so storage stayed true after the sandbox flag flipped off. Compounding it, `styles.js` had no `:disabled` rule for `.cc-toggle-switch`, so even when the disabled HTML attribute was honoured the slider looked identical to an active toggle. The sync function now writes false to storage when the sandbox transitions off, `buildGeneralTab()` runs a one-shot cleanup on panel open for users carrying stale state and applies an `apm-pref-disabled` class to the dependent rows at render time, and `styles.js` dims the slider, title, and description so the disabled state is unmistakable. Re-enabling sandbox leaves the prefs at false — opt-in is intentional rather than auto-restored.

## v14.14.56 — Suppress False-Positive LOV Value-Rejected Warnings (2026-04-25)

### Correctness
- **AutoFill no longer warns that LOV fields were rejected when EAM resolved the label to its database code.** Setting WO Type to `Corrective` or Status to `Open` succeeds — EAM's combo blur handler stores the underlying code (`CM`, `R`) in `getValue()` and keeps the requested label in `getRawValue()`. `verifyFieldValue()` only inspected `getValue()`, so the post-set readback compared `"Corrective"` against `"CM"` and emitted `[AutoFill] WO Type value rejected: set "Corrective", got "CM"` plus an orange "not accepted" toast on every fill. The verifier now also accepts a case-insensitive match against `getRawValue()` and, as a defensive backup, a store lookup where the combo's `displayField` matches the expected label and the resolved record's `valueField` equals the actual code. Genuine rejections — bogus values, server-side resets — still warn because none of the three checks pass.

### Correctness
- **Scheduled-mode labor booking now lands on any WO without per-employee `WSJOBS_SCH` rows.** The SCH-empty WO carries its planned hours in `pageData.values.woesthours` (with already-booked actuals in `woactualhours`) on the same tab response, but `fetchScheduledHours` was hitting `WSJOBS.SCH.xmlhttp` — a grid-data-only endpoint that returns `LIST.DATA_ONLY.STORED` and strips `pageData.values` regardless of `COMPONENT_INFO_TYPE`. The fetch now hits the bare `WSJOBS.SCH` endpoint (matching the manual tab-click), `eamQuery` exposes `pageData.values` alongside records via a new `includeFormData` opt-in (default off so labor-service / equipment-LOV callers keep their wire size), and `fetchScheduledHours` reads `woesthours`/`woactualhours` when the grid is empty — same request, no extra round trip — degrading to "no hours" only when both sources are zero. The diagnostic log reports source ("N activities" vs "WO rollup (woesthours=…, woactualhours=…)") so future zero-rows reports triage at a glance, and `extractJson`'s existing HTML-detection covers the rare session-expired login-page response.
- **Scheduled-mode labor skips now surface in the final completion toast instead of vanishing in milliseconds.** "No scheduled hours found" and "No remaining scheduled hours to book" toasts fired correctly but were instantly replaced by the next progress toast (typically the purple "Navigating checklist..." or the green "AutoFill complete"), so the user had no signal labor was deliberately skipped. `resolveLaborHours` now returns `{ hours, reason }`, both call sites propagate `reason === 'no_scheduled_hours' | 'no_remaining_hours'` into `_lastLaborResult.result = 'skipped_no_hours'`, and the final-toast dispatch grows an orange durable "AutoFill complete — no scheduled hours to book." branch alongside the existing `skipped_ptp` branch — same pattern, same reliability.

## v14.14.54 — Settings Import Boundaries + Diagnostic Saved-Data Snapshot (2026-04-25)

### Convention
- **Settings import no longer applies bundled preferences and feature flags.** `APM_GENERAL_STORAGE` packages theme, locale, log level, `autoRedirect`, every `FeatureFlags` value, and PTP toggles into a single key. Importing it across machines clobbers settings the install correctly auto-detected (date format, language) and overrides feature toggles the importing user deliberately set. Export still ships the key for snapshot completeness, but `importSettings()` now lists `APM_GENERAL_STORAGE` in `SKIP_KEYS` alongside session/transient keys; it's read out of the export blob and ignored. Saved data — autofill profiles, nametag rules, dataspy/forecast profiles, labor settings, tab/grid order — continues to import normally.
- **Tab/grid order extracted to its own `apm_v1_tab_order` storage key.** Tab orders, column orders, and hidden tabs lived inside `apm_v1_autofill_presets.config` for historical reasons that no longer hold — settings import grouped them under "Tab & Grid Order" but mapped to `APM_GENERAL_STORAGE` (where they were never stored), and the autofill recovery path had to fish them out of the wrong blob. New migration `tab_order_split_v1` copies `presets.config` to the new key once on boot and strips it from the autofill blob (idempotent — re-runs are no-ops). `loadPresets()`, `savePresets()`, the hydration paths, and the sync handler all read/write the dedicated key with a fallback to the legacy bundled location for the brief window before migration runs and for cross-frame writes from older tabs. Export schema bumped to v2 with a v1→v2 transform that splits old export files at import time, so existing backup files keep working. `IMPORT_MODULES` `taborder` row now correctly points at the new key, and the misleading `theme` row (which mapped to a non-existent theme field) is removed.

### Quality
- **Diagnostic report now includes a saved-data snapshot for triage.** `Diagnostics.toJSON()` adds a `savedData` section with tab/column/hidden tab orders, autofill profile names + match keywords + `isDefault` flags (no profile bodies — those can be 10KB+ and rarely explain bug reports), full nametag rules, full dataspy/forecast profiles + per-screen selections, and a labor employee count. Raw labor employee names are deliberately excluded as PII. Reports a bug reporter pastes now reveal whether they're on a near-default install or a heavily customised one, and which preset/rule/profile is actually configured for the screen they're describing.

### Cleanup
- **Legacy non-composite column-order keys are now stripped from storage instead of merely from in-memory reads.** Pre-v14.14.41 column orders were keyed by screen alone (`WSJOBS`); v14.14.41+ keys them by screen+dataspy (`WSJOBS|<dataspyId>`) and the lookup is strict per-dataspy, so legacy keys never match any grid. The previous `migrateLegacyColumnOrders` only filtered them out of in-memory `presets.config.columnOrders` on every `getPresetsReadOnly()` call — storage kept the data forever, occupying space and showing up in diagnostics as stranded entries that nothing references. New `legacy_column_orders_cleanup_v1` boot migration removes them persistently from `TAB_ORDER_STORAGE_KEY`. The v1→v2 import transform also strips legacy keys from incoming exports and reports the count via a new `result.warnings` field; the settings panel surfaces those warnings in the post-import refresh dialog so users know which screens lost their saved layout and need re-customising. With storage and imports both cleaned at their boundaries, the in-memory `migrateLegacyColumnOrders` strip is removed — its only remaining trigger was a stale write from a still-open pre-split tab via the cross-frame sync, which is a one-reload window producing inert keys (the strict composite-key lookup never matches them).

## v14.14.53 — AutoFill Blank-Record Detection Suppresses Stale Title Fallback (2026-04-25)

### Correctness
- **Creating a new record while a matching WO was selected no longer fills the blank record with the previous record's preset.** The trigger button keeps a 3-second cooldown on healthy non-list-view scans, so its click handler captures the previous match's title in a closure that `executeAutoFillFlow` accepted as `fallbackTitle`. The engine then layered `autofillState.lastKnownTitle` / `lastKnownEquipment` on top of that, both still holding the previous record's values until the next trigger scan refreshed them. After the engine logged "may be new/blank record," `titleLower` was non-empty thanks to those fallbacks, so the keyword index matched the previous record's preset (e.g. "Daily") and execution skipped the default-profile branch. The fallback chain is now gated on an `isNewRecord` check that mirrors the trigger's existing guard (`activeView.isRecordView && !activeView.lastRecordid`, with an `eamView === 'record'` corroboration when FocusManager is unreachable); when true, `fallbackTitle`, `lastKnownTitle`, and `lastKnownEquipment` are all bypassed and the caches are cleared so the next click starts clean.

## v14.14.52 — AutoFill Default Profiles Excluded From Keyword Matching (2026-04-25)

### Convention
- **`isDefault: true` profiles no longer participate in keyword matching on existing records.** Two profiles that share keywords or `woTitle` (typically a "for new records" template and a "for existing records" template covering the same kind of work) both landed in `allMatches` whenever an existing WO description contained the shared keyword, surfacing the disambiguation picker on every routine fill. The flag now means what its name suggests: the profile is the default for blank new records (the `getDefaultProfiles` fallback in `engine.js`) and is skipped during the title/equipment keyword scan in both `autofill-engine.js` (engine match loop) and `autofill-triggers.js` (button visibility). A profile that should keyword-match existing records must have `isDefault` unchecked. Profiles with `isDefault: true` and no companion non-default profile will no longer surface the Auto Fill button on existing records — the fix for that case is to clone the profile, uncheck `isDefault` on one copy, and let the two coexist.

## v14.14.51 — Checklist Per-Row Targeting (2026-04-25)

### Correctness
- **Checklist text-result and notes write to the correct row even when row shapes vary.** `processCheckboxes` walked `gridEl.querySelectorAll('tr')` and inferred `rowIndex` from heuristics, with two paths that hit `continue` without advancing the index (`if (!resultNum) continue;` and the action-mismatch fallthrough). On a checklist that mixed Yes/No rows with text-result rows, any tr whose shape didn't match the expected branch — or any extra tr the body emitted — could leave `cfg[i]` paired with the wrong record. The visible symptom: the resultText configured for a text-result row landed in the notes field of the row beneath it, and that row's own action was skipped. Iteration is now driven by record index (`for (let i = 0; i < limit; i++)`) with the row's DOM resolved via `view.getRow(i) || view.getNode(record)`, so `advancedConfig[i]` is always paired with the i-th store record regardless of how the body's tr enumeration looks.
- **Notes selector unified to `[data-componentid^="textfield"][maxlength="4000"]` for both row types.** The Yes/No branch previously used the generic `input[type="text"]`, which on a row containing a uxnumber result widget (also `type="text"`) would have matched the wrong field. Switching to the maxlength-discriminated selector everywhere makes notes targeting precise on text-result, Yes/No, and Completed-only rows.
- **Action/row-shape mismatches are now silent no-ops instead of failing into the wrong field.** `'text'` config on a Yes/No row, `'yes'`/`'no'` config on a text-result row, and `'skip'` all leave the result column untouched. Notes and follow-up still apply per the cfg, scoped to the correct row.

## v14.14.50 — PTP Sandbox Region Lock for non-US1 Tenants (2026-04-25)

### Critical
- **PTP Sandbox now hard-off on non-US1/non-PTP tenants regardless of stored value.** The legacy `ptpTimer` → `ptpSandbox` flag rename in `migration-manager.js` had no region guard, so any user who had ever enabled the old timer carried a `true` into the new flag — including EU users for whom no PTP iframe exists. The settings panel disabled the toggle for non-US1 (correct) but `FeatureFlags.isEnabled('ptpSandbox')` still returned the stored `true`, so AutoFill's `isPtpCompleted()` gated labor booking on a PTP_HISTORY entry that could never appear, producing `PTP not completed for WO ... — skipping labor booking` and blocking labor on every WO. `isEnabled` now short-circuits to `false` for `ptpSandbox` whenever `!AppContext.isUS1 && !AppContext.isPTP`, making region the runtime authority instead of storage.

### Cleanup
- **New `clearPtpForNonUS1` migration zeroes stale PTP storage on non-US1 tenants.** With the runtime guard in place the settings panel checkbox would still render checked (because storage said `true`) for affected users until a manual save; the migration resets `flags.ptpSandbox`, `ptpTrackingEnabled`, and `ptpTimerEnabled` to `false` once for non-US1/non-PTP users so the panel reflects the actual gate. US1 and PTP-domain users are untouched.

## v14.14.49 — Forecast Panel Perf + Target Display (2026-04-24)

### Convention
- **Filter preview and active-profile summary now lead with the target screen and dataspy.** Both surfaces previously buried (or split) the routing context — the filter preview showed only the filter sentence, and the profile-active summary listed `Target: Compliance` only when CTJOBS was chosen and `Dataspy: <name>` as just another pipe-joined detail. Both now prepend a dedicated `Target: WSJOBS · Open WOs assigned to me` line styled in a muted weight above the filter text, matching the `{SCREEN} · {dataspy display}` convention introduced for grid-column settings in v14.14.48. Dataspy label comes from `getDataspyDisplay(screen, value)` so naming stays consistent across the panel, the settings dialog, and the profile manager. The redundant `Target: Compliance` / `Dataspy: …` entries are dropped from the pipe-joined filter details since the leading line owns that information.

### Critical
- **`backdrop-filter: blur()` radius reduced on the three full-viewport overlays.** `.apm-modal-overlay` (used by the forecast profile builder), `.apm-welcome-overlay`, and `.apm-help-overlay` all wrapped the entire EAM viewport in a Gaussian blur that the compositor re-evaluated every frame. On a busy WSJOBS grid this is the worst-case GPU scenario: the blur target is 100vw × 100vh and sits on top of hundreds of rows, and the VRAM reserved for the pass is often not reclaimed quickly by the GPU driver even after the overlay is hidden. Leaving the profile builder open for extended sessions made the whole browser slow, and closing the tab did not recover — the dominant cost was this blur. Gaussian blur cost scales roughly with the square of the radius, so dropping from `blur(4px)` to `blur(2px)` (and from `blur(3px)` to `blur(2px)` on the help overlay) cuts the per-frame kernel work ~4×. Background rgba bumped lighter (0.5–0.6) so the reduced blur still reads as a focused modal.

### Correctness
- **Forecast panel listener hygiene — four sites that leaked work or fired across the whole page lifetime.** (1) `desc-autocomplete.js` attached a global `document` `mousedown` on init and never removed it; now attached in `renderDropdown` only while the dropdown is visible and torn down in `closeDropdown`, with an `_initialized` guard so repeat `initDescAutocomplete` calls don't stack listeners. (2) `forecast-search-form.js` did the same for the dataspy-mode popover's outside-click handler; now attaches on `showPopover()` / removes on `hidePopover()`. (3) `forecast-ui.js` `panelObserver` (MutationObserver on the panel's `style` attribute) fired on every style mutation — position updates, zoom compensation, width tweaks — and re-ran DOM queries + ExtJS combo attach/detach each time; memoized `_wasVisible` bails out when computed visibility is unchanged. (4) Same observer and the dataspy combo listener are now torn down on `pagehide` (`{ once: true }`). `detachEamComboListener` also pre-checks `combo.isDestroyed` before calling `.un()` so navigating EAM screens while the panel is open no longer invokes methods on a torn-down ExtJS component.
- **Forecast header weather animation pauses while the profile builder covers it.** Ten infinite raindrop animations plus a lightning flash ran continuously in the cloud icon. When the builder modal overlays the panel the animation is fully obscured, but the compositor still pays full cost. A new `body.apm-modal-active` class is set on `openBuilder` and cleared on every close path (close button, overlay click, Escape); a CSS rule pauses `.raindrop` / `.lightning-bolt` via `animation-play-state: paused` while the class is present. No effect when the forecast panel is hidden entirely (browser already stops painting display:none children) or when the modal is closed and the animation is visible again.

## v14.14.48 — Grid Column Settings Panel: Direct-Edit Hint + Dataspy Scope (2026-04-24)

### Correctness
- **Grid Column drag list removed from the settings panel.** The list had two problems: live-apply died when `applyGridConsistency` was deleted in v14.14.36 (saves could no longer reach the grid from the panel), and since v14.14.41 (dataspy-aware column orders) the panel's save path still wrote `columnOrders["<FUNC>"]` while the readers expected `columnOrders["<FUNC>|<DATASPYID>"]` — so every drag landed in an orphan slot that nothing reads. The feature was effectively dead for the user. Replaced with a prominent hint that points the user at the grid header: "Edit columns in APM directly — drag and resize from the grid header. Your layout is saved automatically, per screen and dataspy." The grid's own column save listeners (`grid-column-override.js`) already persist every mutation correctly under the composite key; the Reset Column Defaults button in the panel still works and deletes the active dataspy's saved entry. Tab Layout drag list is unchanged.

### Convention
- **Column Order title and reset dialog surface the active dataspy.** Because saves are per-dataspy, the UI previously gave no hint that reordering on "Open WOs" writes to a different slot than "PM's Assigned to Me". Title now reads `Column Order (WSJOBS · Open WOs assigned to me):` and the reset-reload dialog reads `Column layout for WSJOBS · Open WOs assigned to me has been reset...`. Dataspy display text comes from the live EAM combo's `getRawValue()` (empty suffix on grids without a dataspy, so `NONE`-slot screens show just the screen label). New helper `detectActiveDataspyDisplay` in `core/utils.js` shares one combo lookup with `detectActiveDataspyId`.

### Cleanup
- **Legacy column-order scrub runs on every preset hydration, not just once.** The v14.14.41 migration that drops non-composite `columnOrders` keys was gated on a one-shot storage flag, which meant a Settings Import from a pre-v14.14.41 export would silently reintroduce legacy keys that nothing reads. Gate removed; the scan is O(keys-count), writes only when it finds something to strip, and stays silent when storage is clean. `COLORDERS_DATASPY_MIGRATED_KEY` is no longer needed — constant and import removed.

## v14.14.47 — Forecast Filter Additions: Eight New Fields + "Created By" URL Channel (2026-04-24)

### Features
- **Eight new filter fields in the forecast profile builder.** Adds `criticality`, `priority` (`priorityicon`), `location`, `department`, `cancelReason` (`udfchar11`), `holdReason` (`udfchar04`), `partsIssued` (`udfchkbox01`), `pmIntrusive` (`udfchkbox07`). Text fields reuse the existing CONTAINS/exact/BEGINS/ENDS operator set and participate in per-pair AND/OR joiners; boolean fields (Parts Issued, PM Is Intrusive) use a YES/NO picker and cap at one chip (serialized as `=YES`/`=NO`, emitted as `udfchkbox* = -1` / `= 0` at MADDON build time).
- **`Created By` profile filter.** New field at the top of the Text Search group that scopes a forecast to work orders created by a specific user. Emitted as `filterfields=createdby&filteroperator=CONTAINS&filtervalue=<value>` — top-level URL params that coexist with MADDON body params in the same request. Explicit-only, CONTAINS-locked, single value per profile (second-chip cap with toast), applies to both WSJOBS and CTJOBS. Operator prefix characters (`!`, `=`, `^`, `$`) are stripped from the serialized value before injection since this channel has no operator flexibility.

### Convention
- **Dataspy scope hints are advisory, not enforced.** Three fields — `pmIntrusive` (Open WOs), `cancelReason` (Closed WOs), `holdReason` (All / Reactive Open / SIM-T Open) — carry a `scopedDataspies` whitelist and surface a soft warning in the builder hint line when the selected profile dataspy sits outside the list. MADDON still emits and profiles still save; the warning only flags that the field is typically empty on off-scope dataspies.
- **FilterSet gains a second channel, `urlParams`.** The pipeline's `FilterSet` now carries `urlParams` alongside `maddonParams`; both are independently mergeable, frozen into the published `ActiveFilterContext`, and injected on every Ajax/XHR request that matches a forecast target. `shouldPublishContext` returns `true` when *either* channel has content, so a profile configured only with `createdBy` still gets re-injection on sort/page. The one-shot XHR intercept (`execution.js`) and the persistent XHR hook (`hooks.js`) both handle the two channels — MADDON shifted/merged as before, URL params overwritten unconditionally (our injection is authoritative while the profile is active).

### Correctness
- **Single-site `organization` no longer lands in the request twice.** Previously a single-site profile wrote `org` to both the ExtJS `ff_organization` field AND a MADDON filter with alias `organization`, producing duplicate `organization CONTAINS <site>` entries (one from EAM's own form submission at seq 1, one from our injection at seq N). `profile-source.js` now strips `org` from the profile before MADDON emission whenever ExtJS can losslessly express the operator (plain CONTAINS, `!` NOTCONTAINS, `=` exact). Operators that have no ExtJS top-filter equivalent (`!=` NOT EQUAL, `^` BEGINS, `$` ENDS) continue to route through MADDON and the ExtJS field is left blank — which incidentally fixes a latent correctness bug where `!=<site>` filters produced empty result sets because the ExtJS fallback (`fo_con`) AND'd a CONTAINS filter against MADDON's `!=` exclusion.

### Cleanup
- **`serializeToProfile` and `createEmptyState` now iterate `FIELD_CONFIG`.** Previous code hardcoded each field key in the serializer and the empty-state initializer; adding a field required edits in three places. Now `FIELD_CONFIG` is the single source of truth — a new entry propagates automatically through serialize, deserialize, empty state, text mode, and the visual field-select dropdown. Field-select CSS width bumped 130px → 150px to accommodate longer labels ("PM Is Intrusive", "Priority Level").

## v14.14.46 — Per-Pair AND/OR Joiners in Forecast Profile Builder (2026-04-24)

### Features
- **Forecast profile filter builder now exposes a clickable AND/OR divider between every pair of positive keywords.** Previously multi-keyword fields were always OR-joined at the MADDON layer, so users who wanted tighter filtering had to split work into separate profiles. Every eligible field (`desc`, `equipment`, `eqDesc`, `assigned`, `shift`, `org`, `labor`) now renders a small pill between each consecutive pair of include chips — click it to flip that specific pair between AND and OR. The first attempt at this feature used a single field-level toggle, which was too coarse: it forced every keyword in a field into the same logic and made range filters like `labor >= 5 AND labor <= 10` impossible. Per-pair control handles mixed expressions such as `desc "pump" AND "motor" OR "bearing"`. Excludes (`!` prefix) stay AND-joined and render with a dim fixed `AND` divider — that is the only boolean reading that matches what users mean by "exclude." Hidden for `type` field (IN-filter over category codes, where AND is meaningless). Preview text updates the joiner verb in real time per pair.

### Convention
- **Profile schema is additive; no storage migration required.** A new `profile.fieldJoiners: { [fieldKey]: ('AND'|'OR')[] }` sidecar records the joiner between each consecutive pair of include chips (length = `includes.length - 1`); the array is emitted only when at least one entry is `AND`, so all-default-OR profiles round-trip byte-identical on disk. On read, missing/unknown entries default to OR so every profile that predates this feature behaves exactly as before (and any profile saved with the short-lived per-field `fieldLogic` shape also defaults to OR — that key is ignored on read and dropped on the next save). The MADDON engine change in `maddon-builder.js` reads per-chip joiners and emits `MADDON_FILTER_JOINER_N` accordingly; the existing outer paren wrap around the whole field stays unchanged so SQL precedence (`AND` > `OR`) isolates the field correctly from cross-field linking.

## v14.14.45 — Shift Config Chip in Labor Tally (2026-04-24)

### Features
- **Night Shift configuration is now reachable from the Labor Tally panel.** Previously only configurable from the Quick Book popup's cog icon. A new Shift chip in the tally header opens the same toggle/shift-end form as an inline panel; changes propagate to the tally immediately (hint + shift-view row refresh) and to Quick Book on next open since both read the same storage keys. A warning-colored dot on the chip signals that Night Shift is currently enabled.

### Convention
- **Manager Mode toggle restyled from hyperlink to chip.** The old underlined link style read as navigation; now it matches the new Shift chip using `--apm-control-bg` + icon + label, with an accent-subtle active state when the panel is open. `apm-labor-mgr-toggle` class replaced by shared `apm-labor-chip`.

### Cleanup
- **Night-shift form content extracted into `src/modules/labor/shift-config.js`.** Shared helper `createShiftConfigContent(doc, { onChange })` produces the three-row form (toggle, shift-end row, hint); Quick Book popup and Labor Tally panel both mount it. Handlers live in the helper; callers only own the popover wrapper and an `onChange` refresh callback.

## v14.14.44 — Caught-Exception Hygiene: Storage + AutoFill (2026-04-24)

### Cleanup
- **`APMStorage.get()` no longer throws a caught `SyntaxError` on every raw-string read.** `set()` writes strings raw (not JSON-stringified), but `get()` speculatively called `JSON.parse` on every string with a `try/catch` fallback — any value whose prefix matched a JSON token (version strings like `14.14.43`, ISO dates, theme-hint `'dark'`/`'default'` written directly by `theme-hooks.js`) threw a caught exception that paused the debugger when "Pause on caught exceptions" was enabled. Fix: new `safeJSONParse` helper in `src/core/storage.js` only invokes `JSON.parse` when the input actually looks like JSON (starts with `{`, `[`, `"`, or exact-matches `true`/`false`/`null`/a strict number regex); raw strings are returned as-is. Applied to both the GM and localStorage read branches. No data migration — `set()` is unchanged and existing stored values round-trip identically.
- **`Ext` probes now check the actual API, not just the namespace.** EAM attaches the `Ext` namespace object very early, but `Ext.getCmp` / `Ext.ComponentQuery` / `Ext.ComponentManager` come online later when the core class graph loads — `if (!win?.Ext)` style guards falsely pass during early boot and screen-cache iframe remounts, then the next line throws `win.Ext.getCmp is not a function` / `Cannot read properties of undefined (reading 'query')`. AutoFill's view-change retry loop (1s × 8) reproduced this reliably on fresh loads. Sites tightened: `autofill-triggers.js` cleanup sweep (line 334), `injectAutoFillTriggers` main body (line 370), `injectChecklistBulkButtons` (line 253), `injectAssignToMeButton` (line 709); `autofill-engine.js` active-equipment resolver (line 1743); `labor-booker.js` `extractCompletionDate` (line 1542). Each probe now targets the exact API it calls (`getCmp`, `ComponentQuery`, or both). Remaining `!win.Ext` sites in the codebase were already paired with an API-specific check and left alone.

## v14.14.43 — Drillback Auto-Open Gated Behind Opt-In Setting (2026-04-24)

### Correctness
- **Drillback auto-open is now opt-in (default off).** Single-result auto-open intermittently bound the recordview form to EAM's `<Auto-Generated>` placeholder on slow boots (battery-throttled CPU, screen-cache iframe re-mounts) and on some fast loads as well. Root cause: `view.fireEvent('itemdblclick', …)` triggers EAM's `selectRecord → selectRow` listener chain, which dereferences a null component reference set up later in EAM's controller wiring. State at our level (grid, view, SelectionModel) is identical good vs bad, so a state-based readiness check can't distinguish; retry-on-throw doesn't work because EAM's row-activation tracker mutates before the throw and the retry no-ops; force-bind desyncs EAM's controller and surfaces 500 HTML responses on subsequent tab switches. Fix: new `apmGeneralSettings.drillbackAutoOpen` (default `false`) gates `handleDrillbackAutoOpen` in `boot.js`. Settings panel toggle in General with explanation. Soft safety net (`detectScreenCacheChurn` heuristic skipping known BAD timing windows) retained for opted-in users. Full investigation in `.planning/postmortems/v14.14.43-drillback-autoopen-gated.md`.
- **LST XHR `responseText` getter no longer surfaces a spurious DOMException.** Per WebIDL, `responseText` throws `InvalidStateError` when `responseType` isn't `''` or `'text'`. Our `lst-intercept.js` getter override called the original getter unconditionally, so any third-party code reading `xhr.responseText` on a `json`/`blob`/`arraybuffer` XHR saw the spec throw attributed to APM Master in the console. Fix: short-circuit non-text responseTypes for non-LST XHRs (return `undefined`, the closest safe observable).

### Cleanup
- **Research instrumentation removed from `tab-grid-order.js` and `guardMasterScreenController`.** `__apmTabConsistencyState`, `__apmBlockedActivationsLog`, `__apmGuardSkipLog` ring buffers and the `MasterScreenGuard` info logs were investigation-only (v14.14.42 loadTabData hypothesis testing); guard behavior preserved, instrumentation gone.
- **`[trace]` logs in `openFirstGridRecord` / `verifyAndRecoverRecordBind` demoted to DEBUG.** They stay in source for future regression triage but no longer occupy the diagnostic ring buffer.

## v14.14.42 — MasterScreenController loadTabData Null Guard (2026-04-23)

### Correctness
- **Returning to list view from non-HDR/non-Activities tabs no longer throws `TypeError: Cannot read properties of null (reading 'isRecordView')`.** Our `applyTabConsistency` (`tp.move` reorder, hide/destroy, plugin restoration) leaves EAM's tab internals in a state where `tabItem.getTabView()` returns null on the `collapsePanel → expandLeft → listViewExpand → loadTabData` path, and `MasterScreenController.loadTabData` reads `.isRecordView` on it without a null check — Chrome only because V8 dispatches teardown listeners synchronously inline (Firefox defers them, so the about-to-be-destroyed view is still readable). Fix: new `guardMasterScreenController(win)` in `utils.js` overrides `loadTabData` to bail when `getTabView()` is null, called from `bindAll` every cycle since the controller class is lazy-loaded. Which specific op breaks the invariant is still unknown — investigation plan in `.planning/handoffs/session-2026-04-23-loadTabData-trigger.md`.

## v14.14.41 — Checklist Bulk Buttons Event-Driven Trigger (2026-04-23)

### Correctness
- **Checklist Yes/No/Clear buttons now appear on first ACK tab entry.** `injectChecklistBulkButtons` relied on a `.ACK` AJAX hook with a fixed 1500ms delay plus a view-change retry loop (8×1s); on slow renders the column header DOM wasn't painted when any of them ran, so initial injection silently bailed at the "Result" header search. Switching the activity combo triggered a second `.ACK` load with the grid fully rendered, which worked — masking the gap. Fix: when the checklist grid is first found, wire one-shot `view.refresh` + `grid.reconfigure` listeners that re-invoke the idempotent injection. `view.refresh` fires after every row render (initial load and activity change), so the DOM is guaranteed to be ready.

## v14.14.40 — Tab Native Removal (2026-04-23)

### Convention
- **Record-tab hide switched to native `tp.remove(item)`.** Settings-panel ✖ and EAM's own tab ✕ now converge on the same destroy-and-track-in-More-Menu flow; CSS-hide is gone. Reason: two divergent hidden states (CSS-hidden in items vs destroyed) created inconsistency; unifying on native matches the pattern established in v14.14.37 (trust EAM, intercept at the right layer).

### Cleanup
- **`resetTabDefaults` loses its no-op CSS-show step.** Plugin-menu restoration is now the sole recovery path, since nothing is ever CSS-hidden by our code.

### Quality
- **Record Tabs hint mentions native add/remove.** New sub-line under the drag-to-reorder hint surfaces the EAM-native path.

## v14.14.39 — Post-Update Notice for Column Reset (2026-04-23)

### Quality
- **One-time toast explains why saved column layouts disappeared.** The v14.14.36 migration silently dropped pre-dataspy-aware `columnOrders` entries, and users hit reloads with their layouts cleared and no context. Fix: added `src/ui/update-notice.js` with `maybeShowColumnResetNotice()` gated on `COL_RESET_NOTICE_SEEN_KEY`; fires from `buildSettingsPanel` in the existing-user branch (welcome flow covers fresh installs). Matches the session-restore prompt style but with a single "Got it" button and no auto-dismiss. Message also teaches the new direct-in-EAM save behavior.

## v14.14.38 — Drop `get_revisions` PTP Interception (2026-04-23)

### Correctness
- **Entering a WO with a pre-existing completed PTP no longer fires a phantom `Assessment cancelled` broadcast.** On page load PTP calls `get_revisions?view=PtpHomeView_getRevisions&type=PTP`, which returns PTP TEMPLATE revisions (not assessment lifecycle) — an `inactive` entry means an obsoleted template version, but the latest-revision parser treated it as a cancelled assessment and fired it against the WO the `get_all_assessment` safety net had just set. Fix: dropped `get_revisions` from `PTP_ENDPOINTS` and removed the latest-revision branch in `parseAssessmentStatus`. Existing `inactive`-status recognition for non-array responses was relocated into the depth-2 sweep (arrays are still skipped, so the template `revisions: [...]` array cannot re-trigger the bug).

## v14.14.37 — Grid Column Rewrite: Trust EAM, Trust .LST (2026-04-23)

### Correctness
- **Column reorders/resizes on screens with no saved preset now persist.** `grid-column-override.js` returned from `initComponent` before attaching `headerCt` save listeners when no saved order existed, so the `afterrender` hook never fired on fresh screens — every user drag was silently dropped. Fix: restructured the override so save listeners attach unconditionally; the order-restore branch runs only when a preset is present, but listener attachment is always performed.

### Cleanup
- **Deleted grid-column live consistency enforcement.** `applyGridConsistency`, `reapplyColumnOrder`, the AJAX-idle reapply in `ext-consistency.js`, the frame-activation reapply in `frame-manager.js`, and the grid branch of `APM_PRESETS_SYNC_REQUIRED` formed a loop that re-applied saved state over user mutations and caused the v14.14.22 filter-input drops. `.LST` intercept has been the primary restoration path since v14.14.22 — live enforcement is redundant once changes stick until reload. Also removed: `_suppressSave`, `setColumnSaveSuppression`, `_state.systemDefaults.columns`, `captureSystemDefaultColumns`, `capturePristineDefaults`, and the `reorderColumns` helper that only served the old real-time reset.
- **Reset Column Defaults is now delete-preset only.** The settings panel already shows a reload modal after reset; real-time restore required `_systemDefaults.columns` and `reorderColumns` and was redundant. Post-reload, `.LST` intercept no-ops for the cleared composite key and EAM serves pristine order.

## v14.14.36 — Dataspy-Aware Column Orders (2026-04-23)

### Feature
- **Dataspy-aware column orders.** Switching dataspies on one screen used to overwrite the single saved order — foreign columns would accumulate in each save and reappear under unrelated dataspies. Column order, width, and visibility are now keyed per `(screen, dataspy)` pair via `"<FUNC>|<DATASPYID>"` (or `"<FUNC>|NONE"` for dataspy-less grids); existing saves are dropped once on upgrade and must be re-saved per dataspy. Tabs are unaffected.

## v14.14.35 — PTP Completion Capture Hardening (2026-04-23)

### Correctness
- **Parse chain widened for schema drift and `get_revisions` responses.** The fixed 9-key lookup missed unknown wrappers, lowercase `complete`, and the `get_revisions` endpoint entirely. Fix: depth-2 recursive own-property sweep matching `/^(status|final_status|result)$/i`, a latest-revision branch for `get_revisions`, case-insensitive text fallback with `INCOMPLETE` lookarounds, and an `Logger.info` on 200-OK parse misses that dumps top-level response keys.
- **Aborted XHR and rejected fetch responses now reach the parser.** `xhr.addEventListener('load')` never fires on aborts, network errors, or timeouts, so React-aborted submit retries silently dropped responses even when the server had already committed. Fix: switched to `loadend` with a `status === 0 && !responseText` unsent-guard; fetch intercept wrapped in try/finally so rejected promises still parse the body.
- **Completion postMessages survive handshake lag and parent-not-ready windows.** Fire-and-forget `postMessage` to the top frame was dropped when the listener hadn't attached or the theme handshake was still in flight, and `triggerCompletion` silently returned when `_parentOrigin` was null. Fix: completions carry a `msgId`, retry 3× at 500 ms against `APM_PTP_ACK`, and queue in `_pendingCompletions` (deduped by `type:wo`) until the first trusted theme response flushes them.
- **Parent broadcasts WO to the PTP iframe via the theme handshake reply.** `get_revisions` responses carry no WO in URL or body, so sandbox parses produced `finalWo=null` and dropped completions with no diagnostic. Fix: parent reads iframe `src` `workordernum` first (with `span.recordcode` fallback) and piggybacks `APM_PTP_CONTEXT {wo}` on the theme response; sandbox caches it in `_currentWo` as `extractWo`'s last-resort branch.
- **DOM success-text safety net + submit watchdog.** Users who saw PTP's "submitted … now complete" banner still hit stuck-`INCOMPLETE` rows when every parse layer missed. Fix: on submit click, arm a 60 s `MutationObserver` matching `/submitted\b[^.]*\bnow complete/i` against `document.body.textContent` — on hit, fire `triggerCompletion(_currentWo)` deduped by `lastCompletedWo`. A 10 s observability-only watchdog logs submits that produced no completion.

### Quality
- **`parseAssessmentStatus` and `extractWo` extracted as pure, tested helpers.** No behavior change — enables the parse-surface widening above without dragging `handleAssessmentResponse`'s side-effect block into the test matrix. 20+ unit cases cover the 9-key chain, quoted text fallback, CANCELLED branch, and WO precedence.

## v14.14.34 — Phantom-Record Recovery for Auto-Opened Records (2026-04-23)

### Correctness
- **v14.14.33's sentinel killed the double-fire but records still opened blank** — new diagnostics showed one clean `Opening first grid record` fire followed by silence: no "Record view ready after Xms" INFO, no "Record view did not appear within 5000ms" WARN, yet 11s later the title-observer and session-snapshot both confirmed the UI was in record view. The form renders and gets bound to a phantom (or list-level) record without EAM's native detail fetch landing, and the existing 2s phantom-check gate in `openFirstGridRecord` was silent and non-actionable. Fix: rewrote the gate as `verifyAndRecoverRecordBind(gridRecord)` with an observable 4-phase flow — (1) poll 2s for `rec.phantom === false`; (2) on timeout, locate the visible recordview form and call `form.getForm().loadRecord(gridRecord)` to force-bind list-level fields immediately; (3) call `gridRecord.load()` with a 5s-cap callback to trigger server detail fetch and re-apply `loadRecord` on the response; (4) re-poll for bound state. Every branch emits an INFO or WARN captured to the diagnostic buffer, so the next bug report shows which phase landed. Partial binds still return `success=true` so the user sees list-level data instead of `<Auto-Generated>` placeholder.

## v14.14.33 — Auto-Opened Records Still Loaded Blank: Double-Fire Race (2026-04-23)

### Correctness
- **Drillback links still intermittently opened records with `<Auto-Generated>` fields despite v14.14.28's cross-frame AJAX fix** — diagnostics captured two `Opening first grid record: <WO>` logs 875 ms apart for the same WO, confirming a double `itemdblclick` fire. The second fire lands while the first's cross-frame data fetch is still in flight and leaves the form stuck on the phantom new-record shell. Root cause: `_autoOpenHandled` (`boot.js`) and `_autoOpenInProgress` (`utils.js`) are module-level per-frame guards — multiple boot cycles (child iframe boot, session-reload re-entry) each have their own closure and each independently call `waitAndOpenSingleResult`. The underlying `wsjobs_lst_lst` grid still satisfies single-result detection after the first fire because card-layout hides it without destroying it. Fix: added an `apm_auto_opened_wo` sessionStorage sentinel (shared across same-origin frames in the tab) and an early-return when `getEamViewState().view === 'record'` inside `waitAndOpenSingleResult`. Phantom-state recovery (direct `form.loadRecord()`) is deferred — this change only stops the race that causes the phantom in the first place.

## v14.14.32 — Scheduled Labor Fraction=0 Books Zero Hours (2026-04-23)

### Correctness
- **Setting labor fraction to 0 on a scheduled-mode preset booked the full scheduled amount** — `resolveLaborHours` used `parseFloat(data.laborFraction) || 1`, and since `parseFloat("0")` is `0` (falsy), the `|| 1` branch substituted `1` and booked 100% of scheduled hours instead of zero. Fix: parse once and gate on `Number.isFinite` so 0 survives while empty/NaN still falls back to 1; both call sites already guard with `hours > 0`, so fraction=0 now cleanly skips booking.

## v14.14.31 — Checklist Mask Covers Full Processing Phase (2026-04-23)

### Correctness
- **Autofill checklist "Saving Checklist…" mask appeared only at the tail, unmasking the majority of the work** — the mask sat after the `do1Tech/do5Tech/do10Tech` dispatch block so it originally only covered the single residual `waitForSettled`. Commit `773f6a0` added per-activity `saveGridData()` to `do10Tech` (previously only 1-Tech and 5-Tech saved per activity), so each activity's Ajax-heavy save now fires inside the loop — before the mask ever showed. Fix: move `showChecklistMask()` to immediately before the activity dispatch in `executeChecklistsNative`, and apply the same move to `executeShiftReportChecklists` (task loop also runs unmasked). The final `waitForSettled(…, 500)` and `hideChecklistMask()` stay at the tail; the 500ms min-buffer rationale (auto-save race during `waitForPaint`) still applies.

## v14.14.30 — Tab Order View Refreshes On Settings Reopen (2026-04-23)

### Correctness
- **Settings → Tab Order showed the previously-viewed screen until you clicked a toggle** — `buildSettingsPanel()` runs once and `UIManager.toggle()` just flips display on reopen, so `loadSettingsView()` (which reads `detectActiveScreen()` and probes tabs/columns) never re-fired after a screen switch. Fix: register `refreshSettingsPanel` on `APMApi` inside `bindSettingsEvents` and call it from the `APM_TOGGLE_SETTINGS` handler when the panel already exists; scoped to `state.activeTab === 'settings'` so reopening onto Auto Fill doesn't clobber an in-progress preset edit.

## v14.14.29 — LST Intercept USER_FUNCTION_NAME from POST Body (2026-04-23)

### Correctness
- **CTJOBS/ADJOBS inherited WSJOBS's saved column order on load** — screens that share the WSJOBS.LST endpoint (CTJOBS, ADJOBS) hit the same URL, and `lst-intercept.js::extractFuncName` only scanned the URL for `USER_FUNCTION_NAME=`; EAM actually sends it in the POST body. The URL fallback then matched the `.LST` path and returned `WSJOBS` for every shared-endpoint screen, so CTJOBS's LST intercept read and applied `columnOrders['WSJOBS']`. Fix: patch `XMLHttpRequest.prototype.send` to capture the body string, and switch `extractFuncName` to body-first → URL query → path fallback. Save/reset paths were already correct (grid store proxy and title-based detection) so no migration is needed.

## v14.14.28 — Native Reload Modal for Tab/Column Reset (2026-04-22)

### Quality
- **Tab/column layout reset now uses the same styled reload dialog as feature flags** — the reset button previously used a browser `confirm()` that didn't match APM's modal style and didn't offer a way to refresh afterwards (the in-place restoration isn't always sufficient, e.g. when `resetColumnDefaults()` returns false on screens without captured defaults). Fix: replaced the `confirm()` in `settings-panel.js::bindTabOrderActions` with `showTabResetReloadDialog()` — same `apm-modal-overlay` shell as `showFlagReloadDialog` in `settings-panel-tabs.js`, with Later / Refresh Now buttons (Refresh Now → `SESSION_TIMEOUT_URL`).

## v14.14.27 — Assign To Me Email Contamination (2026-04-22)

### Correctness
- **"Assign To Me" wrote full email into `assignedto` field for some users** — `executeAssignToMe` read `AppState.session.user` directly and only ran the `@`-strip + uppercase cleanup on the `LABOR_LAST_EMP_KEY` fallback path. When session state was restored from pre-cleanup storage or captured via a path that bypassed `SessionMonitor.updateState`, the email flowed straight through. Fix: always route through the shared `cleanEmployeeId()` utility regardless of source (same pattern `labor-booker.js::extractEmployee` already uses).
- **Shift Report "Set User Login" had the same bug** — identical shape in the `executeShiftReportFlow` user-resolution block. Cleaned on fallback only. Fixed identically; also normalizes the in-memory `AppState.session.user` if it was dirty so downstream callers see the clean value.

## v14.14.26 — Column Save Screen-Routing Fixes (2026-04-22)

### Correctness
- **Install-time screen detection had inverted priority** — `installGridColumnOverride.initComponent` called `detectActiveScreen()` first (GLOBAL user-visible screen) and only fell back to the grid's own store. During fast navigation, preload, or screen-cache warmup a grid's `initComponent` can fire while a different screen is active; the closure then captured the wrong name and every future save routed to the wrong `columnOrders` key. Fix: switch to `detectScreenFunction(win, this)` — already the canonical grid-first resolver (used by `tab-grid-order.js::resolveScreenContext`) — backed by LST_FLAG, with `detectActiveScreen` demoted to last resort.

### Correctness
- **Shared-iframe screen mutation wasn't caught** — per the CTJOBS/WSJOBS shared-systemFunc memory, a screen-cache iframe can host WSJOBS then later host CTJOBS with the same grid instance kept around. The grid's store `extraParams.USER_FUNCTION_NAME` updates but the save closure's `screen` didn't, so saves kept routing to the original key. Fix: `saveState` re-derives `detectScreenFunction(win, grid)` on every save. When live detection returns a non-empty result that differs from the closure, the save routes to the live value and emits a `Screen drift` debug log. Closure stays as fallback for the case where live detection briefly returns empty.

### Convention
- **`attachSaveListeners` now takes `win`** alongside `grid`/`screen` so `detectScreenFunction(win, grid)` can run at save time. Both call sites (`initComponent` afterrender, `reapplyColumnOrder` Phase 3) updated to pass it.

## v14.14.25 — Column Save Path Hardening (2026-04-22)

### Correctness
- **Dropped hidden-column tracking from the saved shape** — `saveState` previously captured `{ index, width, hidden }` for every column including hidden ones, and `applyColumnOrder` in `lst-intercept` re-hid them on reload. In practice that let a stray `columnhide` burst during screen-cache transitions or LST-driven rebuilds persist transient hidden flags, causing columns to come back hidden on every subsequent load. Fix: filter `c.hidden` columns out at capture time AND omit the `hidden` field from the saved object. Hide is now transient — menu-hides don't persist. `applyColumnOrder` still honors legacy `hidden: true` entries for back-compat; the branch drains as users resave.

### Correctness
- **Transient-state guard on saveState** — added `grid.rendered && grid.headerCt.rendered` check before capture. EAM fires `columnmove`/`columnresize` during layout rebuilds when the column set hasn't settled; capturing then wrote mid-transition values.

### Correctness
- **Idempotency check before writing** — `saveState` now compares proposed JSON to the currently saved JSON for the screen and skips `savePresets()` when identical. Kills cross-frame echo churn: frame A saves → storage event → frame B reapplies → B's `columnresize` burst → B tries to re-save the same value → now short-circuits. Proposed/existing objects have identical key order so `JSON.stringify` compare is deterministic.

### Convention
- **Debounced the four column listeners** — `columnresize`/`columnmove`/`columnhide`/`columnshow` now route through a 150 ms debounce instead of firing `saveState` per event. Rapid bursts (drag-resize, EAM internal rebuilds) collapse to one save; user-driven events are typically 300 ms+ apart so the debounce isn't felt.

## v14.14.24 — System-Default Capture + Wipe-All Reload (2026-04-22)

### Correctness
- **Reset column order restored APM's reordered state, not the EAM server default** — `applyGridConsistency` captured `systemDefaults.columns[funcName]` from `getVisibleGridColumns()`, but that reads the grid AFTER `lst-intercept` has already rewritten the FIELD array and the pre-render override has applied saved order. For any screen with saved columns the "default" was the user's saved order, so reset was a no-op. Fix: `lst-intercept.tryRewriteLst` captures the pristine visible-field order (filtered on `visible='+'` with positive integer `order`, sorted by order) from the original FIELD array BEFORE `applyColumnOrder` mutates it, via new `captureSystemDefaultColumns` exported from `tab-grid-order.js` and wired through `APMApi` to avoid a cyclic import. The fallback capture in `applyGridConsistency` now only fires when the user has no saved order for the screen (grid is provably pristine), so it can never record post-mutation state.

### Convention
- **"Wipe All Saved Data" reload redirected to auth in child frames** — the success handler ran `location.reload()`, which reloads only the current iframe. In an EAM content frame the iframe loses its auth context on its own and the reload lands on the session-timeout redirect, breaking the parent. Fix: `setTimeout(() => { try { window.top.location.reload(); } catch (e) { location.reload(); } }, 1500)` so the full top-level document reloads — matches the `window.top.location.href = SESSION_TIMEOUT_URL` pattern used by the feature-flag reload dialog and import-settings refresh.

## v14.14.23 — Reset Column Order Actually Resets (2026-04-22)

### Correctness
- **Reset column order silently re-saved the state it just deleted** — `reorderColumns` used `headerCt.suspendEvents(true)`, which *queues* events instead of discarding them; `resumeEvents()` then replayed the whole burst, so every `columnmove` hit the save listener and `saveState` rewrote the column orders entry the reset had just removed. The comment claimed suppression but the implementation queued. Also applied on every `reapplyColumnOrder` cross-frame sync, causing N redundant `localStorage.setItem` calls per reapply (idempotency made them harmless but not free). Fix: added a module-level `_suppressSave` flag in `grid-column-override.js` checked by `saveState`, exported `setColumnSaveSuppression`, and wrap both `reorderColumns` and `reapplyColumnOrder` in it. The flag stays set across `resumeEvents()` and `resumeLayouts(true)` so the layout-induced `columnresize` burst is also ignored. Reset now actually clears the saved order on the active screen.

## v14.14.22 — Column Reapply Feedback Loop on Wide Grids (2026-04-22)

### Critical
- **Parts (SSPART) and other wide grids with saved column widths jumped visibly and blocked typing in column filter inputs** — `reapplyColumnOrder`'s Phase 2 `setWidth` loop fired `columnresize` outside the `suspendEvents` window, echoing across frames via `localStorage` → `APM_PRESETS_SYNC_REQUIRED` → re-entry. Fix: hold `suspendEvents` across Phase 2, gate Phase 4 `view.refresh()` on actual changes, and skip `setWidth` when current width already matches saved. Dormant before v14.14.8 — the `structuredClone` bug silently dropped writes so there was nothing to echo. Full chain, UDF-column corruption explanation, and remediation in [.planning/postmortems/v14.14.22-reapply-feedback-loop.md](.planning/postmortems/v14.14.22-reapply-feedback-loop.md).

## v14.14.20 — Quick Book Activity Reselect Blocks Navigation (2026-04-22)

### Correctness
- **Post–quick-book navigation blocked because the activity field re-selected its old value on blur** — ExtJS 6.x `setValue('')` never clears `lastSelectedRecords`, so on `forceSelection + !allowBlank` combos `assertValue` reselected `lastRecords[0]` during blur → cascade → form dirty → EAM blocked the record change. Fix: null `lastSelectedRecords` on every field in `labor-booker.js:resetDirtyFields`, and stage Phase 5 cleanups at 500/1500/3000 ms to catch slow-network late cascades. v14.13.14 addressed the late-cascade dirty path but missed this framework quirk. See [.planning/postmortems/v14.14.20-quick-book-reselect.md](.planning/postmortems/v14.14.20-quick-book-reselect.md).

## v14.14.19 — Auto-Open Single Result Loads Blank Record (2026-04-22)

### Correctness
- **Drillback / quick-search auto-open intermittently left the record blank (`<Auto-Generated>` in key fields)** — Two compounding regressions in `openFirstGridRecord`: commit `4319134` silently dropped a cross-frame `waitForAjax` loop that `45c221a` had explicitly added ("without this, fields appear blank"), and the auto-open fired `itemdblclick` on the grid panel with the wrong first arg instead of on the view with EAM's canonical signature. Fix: restored the cross-frame AJAX wait, added a phantom-check poll that confirms `form.getForm().getRecord().phantom === false` across all frames, and switched the fire to `view.fireEvent('itemdblclick', view, record, rowEl, 0, {})`. Intermittent by network speed. See [.planning/postmortems/v14.14.19-auto-open-blank.md](.planning/postmortems/v14.14.19-auto-open-blank.md).

## v14.14.18 — UK/EU Locale Fixes for Labor Booking (2026-04-22)

### Critical
- **Fast-mode booking crashed after popup dismissal on EU tenants** — `fastBookingFlow` cached a single `form` reference across `dismissEamPopups`; EU tenants hit the future-date confirmation popup far more often (BST day-boundary crossings), the `Yes` cascade nulled the form's `_items` collection, and the next `findField`/`getFields` call threw. Fix: re-query the form via `ComponentQuery.query('form:not([destroyed=true])', booTab)[0]` after `dismissEamPopups`. See [.planning/postmortems/v14.14.18-uk-eu-locale.md](.planning/postmortems/v14.14.18-uk-eu-locale.md).

### Correctness
- **Night-shift bootstrap seeded zero records on EU tenants** — `parseEamDateTime` hardcoded a US `MM/DD/YYYY HH:MM` regex and rejected every EU date form (`21-APR-2026 08:00`, `21/04/2026 08:00`). UK diag showed `unparseable=9` out of 9 records. Fix: delegate the date portion to `parseEamDate` (honors `apmGeneralSettings.dateFormat`, handles all common EAM formats) and parse `HH:MM` off the second whitespace-split token. Covered in the same postmortem.
- **`fetchScheduledHours` read zero for EU-comma decimals** — Raw `parseFloat("0,5")` yields `0`; every row summed to `0`, the `scheduled <= 0` guard fired, booking returned zero. Fix: `String(v ?? '0').replace(',', '.')` before `parseFloat` + `isNaN` guard, mirroring `labor-service.js:260`. Covered in the same postmortem.

## v14.14.17 — Update Install: Auto-Close Source-View Tab (2026-04-21)

### Correctness
- **Update install still left a raw.githubusercontent.com tab behind** — v14.14.16's fix (swap `window.open` for `GM_openInTab`) assumed Tampermonkey would render its install prompt in-place in the tab we opened. That assumption is wrong on Chrome MV3: Tampermonkey always spawns a separate extension tab for the install UI regardless of how the URL is opened, because MV3 content scripts can't replace the page response. The source navigation to `raw.githubusercontent.com/.../forecast.user.js` renders as `text/plain` and leaves a source-code tab behind. Fix: `openUpdateUrl()` now opens the source URL with `active: false` (background, doesn't steal focus) and schedules `tab.close()` after 3s via the handle returned by `GM_openInTab`. Tampermonkey caches the script content as soon as the response arrives — usually within a few hundred ms — so the install prompt is self-contained and survives the source tab closing. End result: user clicks Install → Tampermonkey install prompt pops up as the active tab → source-view tab closes itself in the background → user installs and goes back to EAM.

## v14.14.16 — Update Link No Longer Leaves Blank Tab (2026-04-21)

### Correctness
- **Update link opened two tabs: one blank, one Tampermonkey install** — Clicking "✨ Update Available" (settings footer, forecast panel, switch-track install, outdated-bug-report modal) called `window.open(updateInfo.url, '_blank')`. Tampermonkey intercepts the `.user.js` request and routes the install prompt through its own extension tab, which left the tab created by `window.open` on `about:blank` indefinitely. Fix: added `@grant GM_openInTab` and a new `openUpdateUrl()` helper in `updater.js` that prefers `GM_openInTab(url, { active: true, insert: true })` — Tampermonkey renders the install prompt directly in the tab it opens, so no orphan blank tab is produced. Falls back to `window.open` if the grant is unavailable (e.g., Violentmonkey, though it typically handles the case the same way). Replaced at 4 call sites: `settings-panel.js` track-switch confirm, footer update link, outdated modal "Update Now" button, and `forecast-ui.js` forecast-panel update anchor.

## v14.14.15 — Profile Dataspy Honored in Non-Advanced Mode (2026-04-21)

### Correctness
- **Profile's dataspy ignored in standard/simple view** — `resolveDataspyValue` in `intent.js` only consulted the `#eam-dataspy-select` dropdown when Advanced mode was visible. In non-advanced mode it skipped straight to `getDefaultDataspy(screen)` / `readEamActiveDataspy(screen)`, silently dropping the profile's saved dataspy. A user who selected a custom profile with `dataspy="100680"` (Open SIM-T) and hit Run would see the pipeline target "Open Work Orders" (100367) instead, and if the profile had no other filter fields set, the search collapsed to "every open WO with today's scheduled start date". Fix: `resolveDataspyValue` now accepts an `activeProfile` argument and prefers `activeProfile.dataspy` over the screen default / EAM native combo when the Advanced panel is hidden. `snapshotUIState` resolves the active profile from `savedProfiles` by the `#eam-profile-select` value and passes it in. `today.js` re-resolves with `activeProfile=null` when `todayStrict` is set so the profile is bypassed consistently (dataspy included). Moved `resolveDataspyValue` to `forecast-prefs.js` to avoid a circular import between `intent.js` and `today.js`.

## v14.14.14 — Scheduled Hours Grid Binding (2026-04-21)

### Correctness
- **Scheduled hours fetch: 0 rows returned despite scheduled labor existing** — `fetchScheduledHours` hand-rolled the WSJOBS.SCH request without `GRID_ID` / `GRID_NAME` / `DATASPY_ID`. Without those params EAM fell back to each user's sticky dataspy on the SCH grid; any user whose last-selected dataspy filtered the view (or whose scheduled rows didn't match the default dataspy's filter) got an empty `GRID.DATA` response and saw "No remaining scheduled hours to book" even when scheduled labor existed. Now routed through `eamQuery` with the "All Records" global dataspy (209), grid id 205, grid name `WSJOBS_SCH` — matches the pattern labor-service.js uses for `WSBOOK.HDR`. Also drops the redundant `apmFetch` / `extractJson` / `AppState.session` imports that were only used by this function.

## v14.14.13 — Quick Book Fetch Verification (2026-04-21)

### Correctness
- **Quick book: fetch-based save verification** — When response interception (Layers 1-2) misses the save response, the fallback now actively fetches booked labor from the server (2-day WSBOOK query) and matches against date+hours+WO to confirm the booking. Previously the timeout path showed a passive "Labor sent — unverified" toast and silently fetched in the background without reporting the result. Now: orange toast announces the fetch, green toast confirms on match, red toast warns if no matching record found. Also fixes the downstream flow — failed fetch verification now correctly sets `presumedOk = false`, preventing phantom records in the tally cache.
- **Remove form-state verification layer** — The Layer 3 form-state check (`pagemode === 'display'`) removed from save verification. It was unreliable in screen-cache scenarios and redundant now that the fetch-based fallback provides definitive confirmation from the server.

## v14.14.12 — Scheduled Labor Options (2026-04-21)

### Critical
- **Scheduled labor: fraction and ignore-booked options** — When labor mode is "Scheduled", two new controls appear inline: a fraction multiplier (e.g. 0.5 = book half of total scheduled hours) and an "Ignore booked" checkbox that books against total scheduled hours instead of subtracting already-booked hours. Both are applied to the raw scheduled total from the SCH tab before booking. Default behavior (fraction=1, ignore-booked=off) is unchanged from v14.14.11.

### Correctness
- **Scheduled hours fetch: intermittent empty response** — `WSJOBS.SCH.xmlhttp` requires both `.xmlhttp` suffix and `COMPONENT_INFO_TYPE=DATA_ONLY` in the request. Without both, EAM non-deterministically returns HTML instead of JSON, causing the scheduled hours lookup to fail silently.

## v14.14.11 — Book Labor by Scheduled Hours (2026-04-20)

### Critical
- **Autofill labor: "Scheduled" booking mode** — New labor mode option in preset settings. When set to "Scheduled", autofill fetches the WSJOBS.SCH tab data for the current WO without navigating away, reads total scheduled hours (`actesthours`) and already-booked hours (`actactualhours`), and books the difference. Falls back gracefully if no scheduled labor exists or all hours are already booked. The existing "Fixed" mode (manual hour entry) remains unchanged as the default.

## v14.14.10 — Checklist Text-Result, Bulk Buttons, Relative Dates (2026-04-19)

### Critical
- **Checklist advanced config: Text result option** — Added a 3rd action type for per-row checklist config. Rows with text-input results (uxnumber fields) instead of Yes/No checkboxes can now be filled via a "Text" toggle. When selected, Yes/No hides and an inline text input appears for the result value. Notes remain separate. Result targets `uxnumber` widgets; notes target `textfield[maxlength=4000]`.
- **Bulk Yes/No/Clear buttons moved into Result column header** — Previously injected into the dataspy toolbar with absolute positioning, which overlapped the dataspy combobox at zoom levels above 80%. Now appended directly inside the Result column header element. No positioning math, no overlap.
- **Autofill scheduled dates: relative day offsets** — Start and End date fields replaced with a relative-day system. Each field has a Skip checkbox (default: checked, leaves EAM date untouched) and a numeric input for days from today (0 = today, 5 = 5 days from now). Dates resolve to absolute values at execution time. Migration clears any previously saved absolute date strings to skip state.

### Correctness
- **Shift end clear button now reads "Clear"** — Replaced the `×` glyph with text to avoid confusion with a menu close button.
- **Enter key closes night shift popover** — Pressing Enter in the shift end time input now closes the popover, matching click-away behavior.
- **Shift view toggle hidden when night shift is off** — The toggle in the labor tally panel is only visible when night shift mode is enabled. Disabling night shift resets shift view state to prevent stale filtering.
- **Night shift caveat text updated** — Changed from "First shift may be incomplete" to clarify that yesterday's hours won't be filtered until the next shift on first config.

## v14.14.9 — Description Autocomplete & Dataspy Persistence (2026-04-19)

### Critical
- **Description autocomplete** — The forecast description field now has a custom autocomplete dropdown. Shows saved terms on focus, filters as you type. Terms are auto-saved after each search (max 10 recent). Pin frequently used terms so they always appear first. Each item has a star toggle (pin/unpin) and x button (delete).
- **Dataspy mode now persists across sessions** — The non-advanced "Change" popover selection (Open WOs vs active dataspy) was saved to storage but never restored on load. Added `dataspyMode` to the `loadPreferences()` state rebuild and syncs the radio buttons in `syncPreferences()`.

### Correctness
- **Description field no longer persists** — With autocomplete available, the text field starts empty each session instead of restoring the last search term. Users select from the autocomplete menu instead.
- **Description field clears after search** — Run Search button and Enter key both clear the description input after executing, keeping the field ready for the next search.

### Cleanup
- Autocomplete dropdown uses `--apm-input-bg`/`--apm-input-text` tokens with `--apm-accent-subtle` hover highlight for visual consistency with input fields.

## v14.14.8 — Grid Column Width Persistence Fix (2026-04-19)

### Critical
- **Column widths now save and restore correctly** — `saveState()` was writing widths to a `structuredClone` returned by `getPresets()`, so writes were silently discarded. Switched to `getPresetsReadOnly()` which returns the real `AppState` reference. Both save and read paths now use the same object.
- **Flex clearing uses `col.flex = 0` instead of `delete col.flex`** — `delete` removed the own property, exposing `flex: 1` from the prototype (EAM's column class default). `0` is falsy so the ColumnLayout skips the flex branch, but it shadows the prototype value.

### Correctness
- **`minWidth` cleared before applying saved width** — EAM sets `minWidth` on some columns (e.g., date columns), preventing `setWidth()` from going below the minimum. `clearFlex()` now also sets `col.minWidth = 0`.
- **Screen detection fallbacks in `initComponent`** — When `detectActiveScreen()` returns empty during grid creation, falls back to the grid's own store proxy `extraParams.USER_FUNCTION_NAME`, then to the LST intercept's `__apmLstColumnsDone` flag.
- **LST intercept uses `getPresetsReadOnly()`** — Avoids unnecessary `structuredClone` overhead on every `.LST` response.

### Cleanup
- **Removed all diagnostic `console.warn` breadcrumbs** from `grid-column-override.js` and `lst-intercept.js`.

## v14.14.7 — Dataspy Mode Awareness & Direction Toggle Fix (2026-04-19)

### Critical
- **Dataspy mode popover** — Non-advanced modes now offer a "Change" popover with two options: "Always Open WOs" (default) or "Use active dataspy". Active mode reads the EAM native dataspy combobox to determine which dataspy is selected, and reflects the actual name in the context status line instead of the generic label.
- **Active dataspy live sync** — When the forecast panel opens in active dataspy mode, an ExtJS `change` listener attaches to EAM's `dataspylist` combobox. Changing the dataspy in EAM immediately updates the direction toggle and context status text. Listener detaches when the panel closes (zero overhead when hidden).

### Correctness
- **Direction toggle clears on mode switch** — Leaving advanced mode now properly hides the past/future chip when the reset dataspy (Open WOs) doesn't support direction toggling. Previously the chip remained visible with stale state.
- **Context status text reflects current state** — `setModeUI()` now runs after dataspy/dateDirection state updates, so `refreshContextStatus()` reads current values instead of stale pre-reset ones.
- **`readEamActiveDataspy` extracted to `forecast-prefs.js`** — Shared between the engine (`intent.js`) and UI layers, eliminating the duplicate implementation. Both the execution pipeline and the UI read the same EAM combo resolution logic.
- **`APM_DATASPY_MODE_CHANGE` event** — Switching dataspy mode via the popover while the panel is open re-attaches or detaches the EAM combo listener, and resets `dateDirection` to avoid stale overrides.

## v14.14.6 — Forecast Past-Date Auto-Detection (2026-04-19)

### Critical
- **Past-date auto-detection for dataspies** — Selecting a past-facing dataspy (Closed WOs, All WOs) automatically flips week labels to "Last Week" / "Last 2 Weeks" etc. and reverses date computation in `getDateRange()` via a new `direction` parameter. No user toggle needed for the default behavior — detection is driven by `isPastFacing()` checking the dataspy's display name.
- **Direction toggle for bidirectional dataspies** — A `◀ Past` / `▶ Future` toggle button appears next to the week selector when the active dataspy supports both directions: All WOs, Closed WOs (default past), and Open Follow Up, Open SIM-T, Open Reactive (default future, `toggleable: true` flag). Override persists in `forecastState.dateDirection` and resets on dataspy/screen change.

### Correctness
- **Profile builder direction-aware** — `getWeekOptions(isPast)` replaces static `WEEK_OPTIONS`. Profile loading, preview text, `computeDateInclusions()`, and dataspy change handler in the builder all respond to direction. Profile manager summary (`buildDateSummary`) uses past/future label maps.
- **Intent snapshot captures direction** — `snapshotUIState()` now reads `data-direction` from `#eam-week-select`. `normal.js` strategy uses the snapshot direction for manual searches; profile path still derives direction from the profile's own dataspy via `isPastFacing()`.
- **Custom date pre-fill respects direction** — Switching from relative to custom date mode passes the active direction to `getDateRange()`, so pre-filled dates match the visible week labels.

## v14.14.5 — Assign To Me, Night Shift Bootstrap, PTP Anti-Flash (2026-04-19)

### Critical
- **"Flip Ticket" renamed to "Assign To Me"** — Button now shows on all WO records in record view (previously gated by SIM-T field). Only changes WO type to Corrective if current type is Breakdown; skips org/execution/safety fields when already populated. MutationObserver re-injects the button if ExtJS layout recalculation removes it.
- **Night shift bootstrap seeds record registry with real timestamps** — New `bootstrapNightShift()` in LaborService fetches the "today" dataspy (ID 1723) on first popup open when night shift + shift end time are configured. Seeds `dateentered` timestamps into the record registry so shift-end filtering uses actual booking times instead of `Date.now()` defaults.
- **PTP anti-flash guard** — Reads cached theme immediately on sandbox init (before React renders) and applies dark background on `<html>` plus `awsui-dark-mode` class on `<body>` creation via MutationObserver. Eliminates white flash on PTP page load for dark theme users. Guard stylesheet removed once the real theme handshake completes.

### Correctness
- **Checklist bulk buttons aligned to Result column header** — Yes/No/Clear button group now positioned absolutely above the Result column header using `getBoundingClientRect()` alignment, instead of inserting at a fixed toolbar index. New CSS class `apm-ack-bulk-col-align` handles positioning.
- **PM Check sync triggers grid save** — After syncing checklist modifications, `executeChecklistsNative` now calls `waitForPaint()` + `saveGridData()` to persist changes immediately instead of relying on the user to manually save.
- **PTP question card darkify observer runs unconditionally** — MutationObserver for stripping React inline styles on question cards now installs regardless of current theme, checking `currentMemTheme` dynamically. Fixes cards staying light-styled when theme handshake completes after `start()`.
- **Night shift hint text updated** — Simplified to "Tallies yesterday and today" with orange caveat "First shift may be incomplete." Shift end clear button (×) added next to the time input.

## v14.14.4 — Forecast Dataspy Target Dropdown (2026-04-19)

### Critical
- **New "Target" dataspy dropdown in forecast advanced panel** — Selects which EAM dataspy to search against (e.g., Open WOs, Closed WOs, All WOs). Options vary by screen: WSJOBS has 8 dataspies, CTJOBS has 4. The previous "Target" dropdown (WSJOBS/CTJOBS) is renamed to "Screen". Dataspy selection flows through the intent → filter-set pipeline and drives the EAM combo selection in `execution.js` via the existing `targetDataspy` mechanism.
- **Dataspy integrated into profiles** — Profile editor gains a "Dataspy" dropdown that repopulates based on the profile's target screen. Profiles store an optional `dataspy` field (value code). When a profile is selected, its dataspy overrides the manual dropdown. Profile summary shows the active dataspy name.
- **`DATASPIES` registry with dual display names** — `display` holds the full EAM combo name for pipeline matching; `short` holds abbreviated names for compact UI rendering. Helpers: `getDefaultDataspy(screen)`, `getDataspyDisplay(screen, value)`.

### Correctness
- **Screen change resets dataspy to default** — Switching between Work Orders and Compliance repopulates the Target dropdown and resets to that screen's default dataspy.
- **Screen navigation syncs dataspy** — `APM_EAM_VIEW_CHANGE` handler repopulates dropdown options and validates the current selection, falling back to default if the saved value isn't valid for the new screen.
- **Context status line updated** — Simple/standard mode status now shows "Searching: {Screen} · {Dataspy} · {Site}" instead of just screen and site.

## v14.14.3 — Quick Book Navigation Fix (2026-04-19)

### Correctness
- **Fixed navigation blocked after quick-booking labor** — Post-save cleanup called `setValue('')` on the activity field without suspending events, triggering an EAM cascade that re-dirtied the blank BOO record after cleanup completed. Now wraps `setValue` in `suspendEvents(false)` / `resumeEvents()` to prevent cascade triggers. Added Phase 5 secondary cleanup pass (1s delayed) to catch any late-arriving cascades.

## v14.14.2 — LST Response Intercept for Column Control (2026-04-18)

### Correctness
- **Labor save capture hardened with XHR-level response interception** — Added Layer 2 (XHR `load` listener) and Layer 3 (form-state `pagemode` check) to `triggerSaveAndVerify`, racing alongside the existing Ext.Ajax `requestcomplete` hook. Screen-cache replaces `Ext.Ajax` in content iframes, silently dropping Method 1/2 hooks — the XHR-level capture operates on the raw `XMLHttpRequest` prototype and survives replacement. Timeout increased from 5s to 8s.
- **Immediate labor tally on verify failure** — When save verification times out, cache is invalidated and a forced server fetch runs after 2s before dispatching `APM_LABOR_SYNC`. Previously the tally used stale 30s-cached data, leaving hours mismatched until the next manual refresh.
- **CTJOBS BOO save detection** — Save response matching now includes `CTJOBS.BOO` / `CTJOBS_BOO` patterns alongside WSJOBS. Previously only WSJOBS saves were intercepted.

### Critical
- **LST response intercept rewrites column order before grid creation** — New `lst-intercept.js` intercepts `.LST` Ajax responses at the XHR prototype level (not Ext.Ajax events), rewriting the FIELD array (order, visibility, width) to match saved column preferences before ExtJS processes the response. Eliminates all post-render column moves on first load (previously up to 30 `headerCt.move()` calls). Uses `Object.defineProperty` to shadow the read-only `responseText` getter on the XHR instance. Installed early alongside `installGridColumnOverride` to catch the first `.LST` request in each frame.
- **Column show/hide via LST rewrite** — Server-hidden fields (`order: "-2"`) can now be promoted to visible by setting positive order and `visible: "+"` in the response. Visible columns can be demoted by setting `order: "-2"` and `visible: "-"`. Previously impossible — `initComponent` override could only reorder existing columns.
- **Reliable screen identity from request URL** — `USER_FUNCTION_NAME` parsed from the `.LST` request URL, replacing heuristic `detectActiveScreen()` for column order lookups. Eliminates misidentification in shared-iframe and screen-cache scenarios.

### Correctness
- **initComponent override skips when LST handled** — `grid-column-override.js` checks `win.__apmLstColumnsDone` Set before applying `restoreColumnOrder`. Save listeners still attach on `afterrender` regardless, so user changes are captured.
- **Graceful fallback on intercept failure** — If `Object.defineProperty` fails or response parsing errors, the handler returns silently and `initComponent` handles column order as before.

## v14.14.1 — Pre-Render Column Order (2026-04-18)

### Critical
- **Grid columns restored before first render** — `Ext.override` on `ReadOnlyGrid.initComponent` applies saved column order after `callParent()` but before `render`, eliminating the visible column reorder flicker on every screen load. No `view.refresh()` needed for initial render.
- **Removed post-render column reorder path** — Deleted `reorderColumns` retry loop, `hookColumnResize`, `applyColumnWidths`, and the `columnmove → applyGridConsistency` feedback hook in ext-consistency.js. Column save now handled by `afterrender` listeners in the override.

### Correctness
- **Cross-frame preset sync retained** — `APM_PRESETS_SYNC_REQUIRED` still triggers `reapplyColumnOrder` for already-rendered grids (uses `suspendLayouts` + `view.refresh()`, acceptable for explicit sync events).
- **System defaults capture preserved** — `applyGridConsistency` retained for capturing default column order on first load (needed for Reset to Default in settings panel).

## v14.14.0 — ScreenScope Unified Screen Detection (2026-04-17)

### Critical
- **New `ScreenScope` class unifies screen detection** — Single API (`active()`, `forScreen(target)`, `from(ref)`) replaces manual frame iteration + visibility checks scattered across modules. Three-pass `forScreen` resolution: (1) content iframes via initpath identity with grid-store fallback for shared-iframe, (2) top frame grid-store identity, (3) title-observer fallback for no-screen-cache and mixed modes.
- **Forecast no longer fails on CTJOBS in shared-iframe or no-iframe mode** — `forScreen('CTJOBS')` now finds the correct frame when CTJOBS lives in the same iframe as WSJOBS (grid-store fallback in pass 1) or when CTJOBS is hosted directly in the top frame while WSJOBS is screen-cached (title-observer fallback in pass 3).
- **`returnToListView` no longer expands the wrong screen** — Previously iterated frames top-first and found SSPART's `listdetailview` before WSJOBS's, switching the visible screen away. Now scoped to the target screen via `ScreenScope.forScreen(target)`.

### Correctness
- **ModuleGuard `queryDOM`/`queryExt`/`withActiveFrame` delegate to ScreenScope** — Removed manual `getExtWindows` + `isActiveFrame` + visibility check loops. Callback signatures preserved — no downstream breakage.
- **Forecast nav functions (`getActiveWoFrame`, `waitForGridReady`, `returnToListView`) use `ScreenScope.forScreen`** — Replaced frame-first iteration with screen-first scoping. Grid timeout diagnostics now report `no-scope` reason when no frame matches.
- **PTP auth gate messages use `'*'` fallback** — `_parentOrigin` is null at eval time (before theme handshake); messages now send with `_parentOrigin || '*'`. Safe: MessageRouter validates via `isTrustedOrigin()` independently.

### Convention
- **Diagnostics panel expanded** — Environment section (region, screen, view), boot gates grid, and session info added to the diagnostics report and settings panel UI. Download button repositioned with full-width layout.

## v14.13.12 — Labor Save Response Extraction, PTP Auth Gate, Build Cleanup (2026-04-17)

### Critical
- **Labor tally now extracts confirmed records from SAVE response** — Replaced synthetic record approach with real server data extraction. The SAVE response grid carries all booked labor with server-assigned bookingcodes. `extractConfirmedRecord` picks the highest bookingcode for the current employee — exact dedup, no heuristic matching. Fixed `pageData.grid` path (was missing `pageData` prefix). Three-layer WO fallback: response grid `event` > `pageData.values.workordernum` > request params.
- **Labor service dedup simplified to bookingcode Set lookup** — Removed 55-line synthetic merge loop with fragile format normalization. Pending records now carry real bookingcodes from the server response — dedup is an exact Set membership check.

### Correctness
- **PTP Cognito auth gate prevents API-before-refresh race** — On page load with expired Cognito tokens, `execute-api` calls (both XHR and fetch) are queued until the accessToken refreshes (polled every 500ms, 15s timeout). Prevents 401 cascades during token refresh. Includes one-shot diagnostic logging of Cognito token state.
- **PTP auth diagnostic and gate messages routed through MessageRouter** — New `APM_PTP_AUTH_DIAG` and `APM_PTP_AUTH_GATE` message types logged in the parent frame for visibility.

### Cleanup
- **Build: removed `identifierNamesGenerator: 'hexadecimal'`** — Default identifier generation is sufficient; hexadecimal mode added unnecessary output size.
- **Build: disabled `unicodeEscapeSequence`** — Reduces obfuscated output size without meaningful security trade-off.
- **Night shift hint label clarified** — "End time" → "Shift end time" for clarity. Removed italic style from hint text.

## v14.13.11 — Forecast Screen-Cache Scoping Fix (2026-04-16)

### Critical
- **Forecast no longer targets the wrong screen in screen-cache mode** — When running forecast for WSJOBS while ADJOBS was loaded in the top frame, `waitForGridReady` picked the top frame's grid (ADJOBS) because it was the first active frame iterated. All filter injection and Run clicks then operated on ADJOBS instead of WSJOBS. Fixed with three changes:
  - `waitForGridReady` now collects all candidate grids and prefers content iframes over the top/shell frame, sorted by column count.
  - `applyExtjsFilters` and `clickRunWithMaddon` scope ComponentQuery results to the target grid's `ownerDocument`, preventing cross-frame field/button leakage.
  - XHR MADDON intercept guards on `USER_FUNCTION_NAME` so ADJOBS requests (sharing the `WSJOBS.xmlhttp` endpoint) don't consume the one-shot intercept.

### Convention
- **Infrastructure skill updated** — Documented proven failure modes for `isActiveFrame`, `isElementInActiveView`, `isComponentOnActiveScreen`, and FocusManager. Added Screen Scoping section with failure matrix and two-layer pattern (document identity + DOM rect).

## v14.13.10 — Forecast Guard Fix, Flip Ticket Flex Layout (2026-04-16)

### Correctness
- **Forecast MADDON filters no longer contaminate ADJOBS/CPJOBS** — Screens with `systemFunc: 'WSJOBS'` (RME Audit, Compliance WO) route through `WSJOBS.xmlhttp`. Both the Ext.Ajax hook (`resolveRequestTarget`) and XHR hook now check `GRID_NAME` and skip injection for non-forecast screens.
- **Column sort/page no longer drops MADDON filters** — The XHR hook's body regex guard bailed on empty `GRID_NAME=` values (common in sort requests). Changed from `gnMatch && gnMatch[1] !== 'WSJOBS'` to a truthy-first check matching `resolveRequestTarget` semantics.
- **Fast-mode labor booking no longer dirties blank record** — After save, the activity cascade Ajax response can arrive after EAM resets to a blank form, populating `booactivity` and blocking navigation. Post-save cleanup now waits for pending Ajax and resets dirty field state.
- **PTP timer setting split migration** — Users who disabled the old `ptpTimer` flag now get `ptpSandbox` re-enabled with `ptpTimerEnabled` off, preserving theme sync and status tracking while respecting the timer preference.

### Feature
- **Feature flag reload dialog** — Toggling a feature flag now prompts for page refresh with explanation text, instead of silently requiring a manual reload.

### Cleanup
- **Flip Ticket button uses flex layout** — Replaced absolute positioning with flex sibling injection alongside colorcode's PTP header tag. Both coexist as flex children of the description field container.

### Quality
- **Forecast hooks test expansion** — Added tests for ADJOBS/CPJOBS derived screen rejection, empty GRID_NAME handling, and GRID_NAME confirmation on shared endpoint. 12 tests total.

## v14.13.9 — PTP Sandbox Decoupling, Status Capture Hardening (2026-04-16)

### Feature
- **`ptpTimerEnabled` preference** — New toggle lets users disable the PTP countdown timer without losing status tracking and theme sync. Disabling the parent `ptpSandbox` flag greys out and disables both PTP prefs with explanatory hint text.

### Correctness
- **`ptpTimer` flag renamed to `ptpSandbox`** — The flag gates theme sync, status tracking, and the timer — not just the timer. Automatic migration converts `ptpTimer` → `ptpSandbox` for existing users.
- **PTP completion guard re-enabled** — `isPtpCompleted()` restored (was bypassed in v14.13.8) with an explicit `ptpSandbox` check: when the sandbox is off, `isPtpCompleted()` returns `true` so labor booking proceeds normally.
- **Theme responder always replies** — Even when theme is `'default'`, the EAM parent now sends a response so the PTP sandbox can establish `_parentOrigin`. Previously, default-theme users got a null `_parentOrigin`, silently dropping all PTP status messages (start, completion, cancel, heartbeat).
- **COMPLETE is permanent** — `updatePtpHistory()` now blocks all writes (including re-completions) on WOs that already have COMPLETE status. Preserves the original completion timestamp regardless of subsequent assessment activity on the same WO.
- **`lastCompletedWo` guard moved inside `_parentOrigin` check** — Duplicate guard only sets after a successful postMessage send. If `_parentOrigin` was null at completion time, the message was never delivered, so re-sending is allowed once the handshake completes.
- **Fixed INCOMPLETE false-positive in text fallback** — Text-based status detection now uses `/"COMPLETE"/` regex instead of bare `includes('COMPLETE')`, which matched the `COMPLETE` substring inside `INCOMPLETE`.
- **Deeper status extraction chain** — Added `update_results.details_update`, `update_results.assessment_update`, and `screen_insert.screen_data` response paths for more reliable completion detection after submission.
- **`get_all_assessment` safety net** — When the user returns to the assessment list, checks if the current user has any COMPLETE assessment for the WO and backfills PTP history. Catches missed completions from race conditions or partial status capture.

### Cleanup
- **Removed `get_revisions` endpoint interception** — Revision `inactive` status does not reliably indicate assessment cancellation, and the WO was always null in that context.
- **Removed INCOMPLETE → `triggerStart` on API responses** — Only `create_assessment` (HTTP 200) triggers the start signal now. INCOMPLETE status during question-answering was generating ~12 redundant `APM_PTP_START` messages per assessment lifecycle.

## v14.13.8 — Bypass PTP Completion Check (2026-04-16)

### Correctness
- **Temporarily disabled PTP completion check in AutoFill** — `isPtpCompleted()` now always returns `true`. PTP capture is unreliable and needs work, blocking users from booking labor. Original logic commented out with `// TEMPORARY` marker for easy restoration.

## v14.13.7 — Storage Key Convention Cleanup (2026-04-15)

### Convention
- **Centralized all storage and cookie key strings in `constants.js`** — `apm_theme_hint` (GM+cookie hybrid), `apm_v1_install_id`, `apm_gen_settings` (cookie), and `apm_transition_active` (cookie) were hardcoded across 6 files. Now defined as `THEME_HINT_KEY`, `INSTALL_ID_KEY`, `COOKIE_GEN_SETTINGS`, and `COOKIE_TRANSITION_ACTIVE` constants.

## v14.13.6 — Tab Suppression Fix, Labor Refactor (2026-04-15)

### Correctness
- **Tab activation suppression during plugin restoration** — Widened the `allowActiveTabChange = false` window to cover the entire `applyTabConsistency` orchestration (was ~10ms per-tab, now full orchestration). EAM's deferred `setActiveTab` calls from async menu handlers are now blocked by the monkey-patch for the full duration. Prevents the visual flash where a newly-added plugin tab briefly steals focus before the script switches back.
- **Session restore respects saved active tab** — Hooks now install before phases (not after), so the `setActiveTab` monkey-patch is active during the first consistency run. Blocked external tab changes (session restore, user clicks) are tracked and re-applied after orchestration completes. Fixes: restoring a snapshot to "Comments" tab no longer reverts to "Record View".
- **`beforetabchange` defense-in-depth** — Added a high-priority `beforetabchange` listener that returns `false` when suppression is active, catching tab changes that bypass the `setActiveTab` monkey-patch (e.g., cached original references, TabBar direct activation).
- **Monkey-patch full swallow** — Blocked `setActiveTab` calls no longer re-enter the ExtJS framework (was calling `originalSetActive(this.getActiveTab())`). Now returns `this.getActiveTab()` directly — zero visual work, zero spurious `tabchange` events.

### Convention
- **`resetTabDefaults` suppression** — Added `allowActiveTabChange = false` to `resetTabDefaults()` to block EAM's deferred activation when restoring system default tabs.

### Correctness
- **API proxy methods bound to real target** — `unsafeWindow.APMApi` Proxy returned unbound methods — `this` inside `get()` referred to the Proxy (which blocks `_api` reads/writes), not the real APMApi object. `APMApi.get()` from the browser console always threw "this._api is undefined". Methods are now bound to the real target.
- **Colorcode row-cache infinite reprocess fix** — Entity-less checklist rows were re-processed every cycle. Now skipped after first pass.
- **Colorcode PO Receipts drillback flag** — Fixed flag check preventing color rules from applying on PO Receipt drillback grids.
- **Guard `applyGridConsistency` against checklist grids** — Checklist grids (with widget columns) were being processed by tab-grid-order's column reordering, destroying checklist cell widgets. Now excluded.

### Refactor
- **Colorcode entity-engine extraction** — Extracted the entity linkification system (WO, equipment, part, employee links) from the monolithic `colorcode-engine.js` into a dedicated `entity-engine.js`. Wired into the main engine with a debug snapshot for diagnostics.
- **Tab-grid-order internal refactor** — Consolidated `_state` object, extracted helpers, added correlation IDs for tracing tab operations, removed redundant `tabchange` events.

### Cleanup
- **Exported `fmtDecimal`, `parseCompletionDateValue`** from `labor-booker.js` — moved from IIFE-private to module-level exports for reuse/testability.
- **Exported `stampRecords`** from `labor-service.js` — moved from IIFE-private to module-level export.
- **Exported `isTransitionError`** from `eam-nav.js` — was private, now available for external callers.

### Quality
- **Vitest test suite expansion** — Added 10 test files covering core modules (`eam-nav`, `eam-query`, `eam-title-observer`, `feature-flags`, `locale`, `migration-manager`, `origin-guard`, `settings-io`, `utils`) and module tests (`colorcode-consolidate`, `colorcode-engine`, `entity-engine`, `labor-booker`, `labor-service`).
- **Live grid preview on color/tag input** — ColorCode settings now preview rule changes on the active grid in real-time when editing color or nametag inputs.

## v14.13.5 — Unit Tests, Dark-Mode Hardening, Cache Fixes (2026-04-14)

### Correctness
- **Stale autofill on same-screen record navigation** — View-change handler now clears both `lastKnownTitle` and `lastKnownEquipment` caches on every view change (not just screen changes), and resets `_lastAutoFillButtonHealthy` on view change + `.HDR` Ajax. Previously, navigating between records on the same screen kept stale equipment/title from the prior record.
- **`syncKeywordMode` MutationObserver conflict** — When "New record template" is checked, `syncKeywordMode()` now early-returns so the chip-container MutationObserver doesn't re-show rows that `syncDefaultToggle` intentionally hid.
- **Simplified `recorddesc` scanning** — Removed the `isListView` gate on `span.recorddesc` header scanning (was masking legitimate record cards). Equipment LOV read is still gated by `hasVisibleRecord && !isListView` — screen-cache keeps LOV fields alive on hidden record cards, but `isElementInActiveView` correctly handles header visibility.

### Convention
- **Dark-mode safe focus states** — Replaced 4 hardcoded `#ffffff` focus backgrounds with `var(--apm-surface-raised)` and added `color: var(--apm-text-primary)` on `.apm-textarea-input:focus`, `.eam-fc-desc-input:focus`, `#apm-creator-panel .field-input:focus`, `.fb-keyword-input:focus`. Quick search input (`apm-qs-input`) now uses `--apm-input-bg` / `--apm-border` tokens.
- **Number spinner always visible** — Chrome hides `input[type=number]` spinners until hover; added `-webkit-inner/outer-spin-button { opacity: 1 }` for panel and forecast inputs.
- **Placeholder selectors modernized** — Replaced IE-specific `:-ms-input-placeholder` / `::-ms-input-placeholder` with standard `::placeholder`. Added coverage for `#apm-creator-panel` and individual input classes.

### Cleanup
- **Removed checklist keyboard shortcuts** — Deleted `registerChecklistShortcuts()` and Alt+1/2/X tooltip hints from bulk buttons. Shortcuts were unreliable with ExtJS focus management.

### Quality
- **Vitest unit test infrastructure** — 112 tests across 7 files covering all forecast engine pure functions: `resolveTarget`, `buildMaddonFilters`, `resolveRequestTarget`, `mergeFilterSet`, `shouldPublishContext`, 4× `Strategy.buildIntent`, 3× `Contributor.contribute`. Run via `npm test`. Core DOM modules mocked at test boundary so pure pipeline logic runs in Node without `window`.
- **Exported 3 internal functions for testability** — `mergeFilterSet` (filter-set.js), `shouldPublishContext` (context.js), `resolveRequestTarget` (hooks.js).

## v14.13.4 — Equipment Keyword Matching, List View Fix (2026-04-14)

### Feature
- **Equipment keyword matching with AND logic** — AutoFill profiles now support `equipmentKeyword` arrays alongside title keywords. When a profile has both configured, both must match (AND). When only one type is configured, only that type needs to match. Equipment is read from: (1) `[name="equipment"]` LOV field in record view, (2) grid store `equipment`/`equipmentno` field from selected row, (3) cached fallback. Dual compiled keyword index (`getEquipmentKeywordIndex()`) mirrors the title index.
- **Equipment keyword chip input** — Title ↔ Equipment toggle switch in settings panel. Equipment chips display uppercase (`textTransform: 'uppercase'`). Dynamic hint text explains AND vs single-type matching based on which keyword types are populated. Chip counts in toggle labels update in real-time via MutationObserver.
- **`chip-input.js` — `textTransform` option** — `createChipInput()` and `createChipElement()` accept `textTransform` parameter (default `'capitalize'`). Equipment chips pass `'uppercase'`; title/SR chips use default.

### Correctness
- **`kwHint` not restoring on "New record template" uncheck** — `syncDefaultToggle` hid `kwHint.style.display = 'none'` when checked but the else-branch never restored it. One-line fix: `if (kwHint) kwHint.style.display = '';`.
- **Labor save response detection hardened** — Checks `pageaction=SAVE` in both `options.url` AND `options.params` (ExtJS may split them). Also handles string-encoded params.
- **Labor failure toast updated** — "record count unchanged" → "check EAM error" across all 7 locales. More actionable when the server rejects a booking.

### Quality
- **EAM popup auto-dismiss in labor booking** — `dismissEamPopups()` handles date-in-past confirmation popups during the field-setting phase. Two strategies: ExtJS ComponentQuery across all frames + DOM fallback. Only auto-clicks "Yes" on confirmation dialogs (Yes+No buttons). Error/alert dialogs left for the user. Called pre-save only.
- **Settings hint text bumped to 12px** — 11 hint elements across `settings-panel-tabs.js` and `settings-panel.js` updated from `var(--apm-text-xs)` (10px) to `12px` for readability.

## v14.13.3 — PTP Completion Guard, Flip Ticket (2026-04-13)

### Feature
- **PTP completion guard on labor booking** — AutoFill's labor booking step is gated by PTP completion status. `isPtpCompleted(woNum)` checks `PTP_HISTORY_KEY` storage. When tracking is enabled and PTP is incomplete, labor booking is skipped with a warning toast. 
- **PTP completion status in Quick Book popup** — Badge next to "Quick Book Labor" title shows green "PTP completed X.Xh ago" or orange "No PTP completed". Hidden when PTP tracking disabled.

## v14.13.2 — Advanced Per-Row Checklist Config (2026-04-13)

### Feature
- **Advanced per-row checklist configuration** — Modal popup (`openAdvancedModal`) for LOTO, 5-Tech, and 10-Tech with mutually-exclusive Yes/No checkboxes, Notes text input, and Follow Up checkbox per row. LOTO has fixed 2 rows with no Follow Up column. New rows default to Yes checked; "Unchecked rows will be skipped" hint in modal footer.
- **LOTO dropdown → "Custom"** — When advanced LOTO config is saved, the dropdown shows "Custom" (disabled `<option>`, set programmatically). Reverts to "- Ignore -" on clear. Syncs correctly on preset load via `applyPresetData`.
- **Follow-up WO creation per-activity** — Rows with `followUp: true` in advanced config trigger `Actions → Create Follow-up WO` inside `do5Tech`/`do10Tech`, after `processCheckboxes` and before save. Supports multiple follow-up rows per activity.

### Correctness
- **Settings panel stays open during modal** — Added `.apm-adv-modal-backdrop` to UIManager's system exclusion list (`ui-manager.js`). Modal is appended to `document.body` outside the panel DOM; without the exclusion, UIManager's click-outside handler closed the settings panel.
- **Legacy `createFollowUp` migration** — `MigrationManager.migrateAutofillV3()` converts old `createFollowUp`/`followUpNotes` profile fields to `advancedChecklist10` per-row config (first row gets notes + followUp, all rows default to yes). Runs once at boot, persists result.
- **Old `createFollowUp` engine block removed** — Dead code after migration; the per-activity follow-up WO creation in `do5Tech`/`do10Tech` replaces it.

## v14.13.1 — Checklist Bulk Actions (2026-04-12)

### Feature
- **Checklist bulk-action buttons** — Yes/No/Clear segmented button group injected into ChecklistGrid's dataspy toolbar on the ACK (Checklist) tab. Uses `getDataspy()` for direct toolbar access, title-gate (`getEamViewState().tab !== 'ACK'`) for zero-cost bail on non-checklist tabs, and scoped grid checkbox manipulation with scroll-loading and mutual exclusion (Yes unchecks No, etc.).

### Correctness
- **Checklist "No" button no longer selects Follow-up checkbox on Completed-only rows** — `row.querySelectorAll('input[type="checkbox"]')` grabbed all checkboxes including the Follow-up column. On "Completed:" rows (1 result checkbox + 1 follow-up), `checkboxes[1]` was the Follow-up. Fixed by scoping query to the Result column `<td>` (matched via `/Yes:|No:|Completed:/i` text content) and gating Yes/No actions on `hasYesNo` (3+ checkboxes).

## v14.13.0 — Forecast Engine Rewrite (2026-04-11)

### Convention
- **Forecast module migrated to a 5-stage pipeline** — `src/modules/forecast/forecast-engine.js` (1,312 LOC) replaced by `src/modules/forecast/engine/` — 24 files under 200 LOC each, single responsibilities, bottom-up dependency order. Pipeline stages: `resolveIntent` → `collectFilters` → `execute` → `publishContext` → `persist`. Only Stage 3 (`execution.js`) is async and touches the DOM/ExtJS; Stages 1, 2, 4, 5 are synchronous and reason-locally. Modes are Strategies (`strategies/{normal,today,quick,clear}.js`), filter sources are Contributors (`filters/{profile,manual,date}-source.js`) — adding a new mode or filter source = create one file + add one line to a registry barrel.
- **Single-shot DOM snapshot** — `intent.snapshotUIState()` reads every DOM field the pipeline needs up front, freezes the Intent, and never touches the DOM again. Eliminates the class of bug where a user DOM change during `await delay()` leaks into a later pipeline stage.
- **ModuleGuard adopted for forecast** — `engine/guard.js` exports a shared `ModuleGuard` instance used at the execution gate and inside `hooks.js`. Forecast was the last major module without ModuleGuard after the v14.12 migration.

### Correctness
- **Dual active filter contexts** — `engine/context.js` maintains a `Map<target, ActiveFilterContext>` keyed by WSJOBS/CTJOBS. `hooks.js` reads the target from the request URL (not from a global `currentTarget`) and looks up the matching context, so WSJOBS and CTJOBS can have independent active profiles simultaneously. Switching between the two screens no longer invalidates either context.
- **Centralized two-layer frame check** — `engine/nav.js:getActiveWoFrame(target)` replaces four near-identical implementations in the old `forecast-engine.js` (lines 486, 698, 806, 201 in v14.12). Includes the Layer 3 `isComponentOnActiveScreen` check that the old forecast code was missing, bringing it in line with `ModuleGuard.queryExt`.
- **`todayStrict` becomes declarative** — Alt+T with a `dateOverride` profile now builds an Intent with `profile: null, todayStrict: true` in `strategies/today.js:buildIntent`. The `today.postExecute` hook is the ONLY imperative DOM side effect in the whole Strategy/Contributor pipeline. Replaces the old mid-pipeline DOM mutation that set `filtersActive = false` and clobbered the dropdown from within `executeForecast`.
- **`waitForGridReady` timeout reduced 15s → 7s** — if the grid isn't ready in 7s the operation has already failed; waiting longer delayed user feedback without improving success rate.
- **Post-nav verification folded into `navigateToWoScreen`** — the shared-iframe tab-click-is-a-no-op fix (v14.12) moves from inline orchestrator code into the nav utility. `session-snapshot` can now reuse `navigateToWoScreen` directly for navigation-only restore cases.

### Cleanup
- **Dead code removed** — `isStopped` variable (set once, never read), `_WO_FUNCS` Set (replaced by inline `resolveScreenFunc() === target` check), unused imports `injectMaddonFilter`/`clearMaddonFilters`/`buildEamScreenUrl`.
- **`isRunning` + `filtersActive` replaced** — `_pipelineLock` handles re-entrance prevention, `ActiveFilterContext` Map handles hook state. The two concerns were entangled in the single `isRunning` flag in the old code.
- **`returnToListView` strategy 3 removed** — the nuclear `launchScreen` full-reload fallback is gone; `waitForGridReady` surfaces failures via `GridTimeoutError` / `setStatus` instead.
- **Recursive `executeForecast('clear')` in toast callback replaced** — the persistent-toast click handler now calls `clearForecast(target)` directly (cleanup item #4).
- **Error surfacing unified** — all pipeline errors are caught in `orchestrator.executeForecast` and surfaced via `setStatus(e.userMessage, '#e74c3c')`. No exception escapes to hotkey handlers or `APMApi` consumers.

### Deprecation
- **`getCurrentTarget()`** — now a warn-once shim in `engine/compat.js`. Returns the most-recently published context's target as a best-effort fallback. Scheduled for removal in a follow-up PR once all internal callers are migrated to `getActiveContext(target)` or `getEamViewState().screen`.

### Not in scope (deferred)
- Unit test infrastructure for the pure functions (`resolveTarget`, `buildMaddonFilters`, `Strategy.buildIntent`, `Contributor.contribute`, `resolveRequestTarget`, `mergeFilterSet`, `shouldPublishContext`) — the architecture makes these trivially testable but Vitest setup is a follow-up PR.
- Profile storage schema changes — `forecast-prefs.js` v2 format unchanged.
- UI rewrites — `forecast-ui.js`, `filter-builder.js`, `forecast-search-form.js`, `forecast-profile-manager.js`, `forecast-quick-search.js`, `forecast-filter.js` all unchanged except for three import path updates.

## v14.12.3 — Tab Disappearance Fix (2026-04-11)

### Critical
- **`autofill-prefs.js` — Non-deterministic legacy `hiddenTabs` migration was silently assigning tabs to the wrong screen silo** — Users reporting "missing tabs" they never explicitly hid were hitting this: a legacy flat-array `hiddenTabs = ["TabName"]` (meaning "hide everywhere" in the pre-per-screen format) was migrated via `funcName = getEamViewState().screen || detectActiveScreen() || 'GLOBAL'` at read time inside `getPresets()`. The detected `funcName` depended on **which frame called `getPresets()` first** and **whether the EAM title observer had fired yet** — effectively random. The result was `hiddenTabs = { [random_screen]: [previously_hidden_tabs] }`, causing those tabs to disappear on one arbitrary screen while reappearing on the screens the user originally intended. New `discardLegacyHiddenTabs(config)` helper replaces `normalizeHiddenTabs`: any legacy flat array is dropped entirely and reset to `{}` at every storage boundary (`loadPresets`, `getPresets`, `getPresetsReadOnly` hydration, `savePresets` recovery). Legacy users whose data is discarded see the "do nothing" default — all tabs visible — and can re-hide per screen if needed.
- **`migration-manager.js` — Wrapped legacy presets initialized `hiddenTabs: []` instead of `{}`** — Inconsistent with `state.js` default (`hiddenTabs: {}`) and triggered the broken migration path unnecessarily. Now matches the canonical object format.

### Correctness
- **`tab-grid-order.js` / `ext-consistency.js` / `settings-panel-draglist.js` — Removed dead `Array.isArray(hiddenTabs)` branches** — Three downstream readers had defensive legacy-array handling that became dead code once `getPresets()` normalizes at the boundary. The settings-panel-draglist variant contained `{ ...legacyArray }` → `{0: "tab", 1: "tab"}` garbage-object mutations that silently corrupted `hiddenTabs` with numeric keys if reached. Simplified all three to direct `hiddenTabs?.[funcName] || []` reads.
- **`autofill-prefs.js` — Removed unused screen-detection imports** — `detectActiveScreen` and `getEamViewState` were only used by the removed broken migration. Screen detection still happens at consumer sites (`tab-grid-order.js`, `settings-panel-draglist.js`, `ext-consistency.js`) where it belongs. `autofill-prefs.js` is now a pure storage/serialization layer with no per-screen logic.

## v14.12.2 — Labor Tally Double-Count Fix (2026-04-11)

### Critical
- **`labor-service.js` — Synthetic record merge matched against a non-existent field, doubling every Quick Book entry** — `_syntheticRecords.filter()` required `(r.employee || '').toUpperCase() === sEmp` to confirm a synthetic against its server record. But the WSBOOK HDR dataspy (100696) is already employee-scoped by the query's `employee=` parameter and does **not** echo `employee` back in `GRID.DATA[]` — every server record had `r.employee === undefined`, so the predicate compared `"" === "DANIEDKR"` and returned false for every synthetic. The filter then pushed the synthetic into `laborCache.data` alongside the server's real copy, and `calculateTally()` summed both, doubling every Quick Book booking's hours in the Labor Tally panel (e.g. booking 0.25h on top of 4h displayed 4.5 instead of 4.25). The bug looked "intermittent" because it only surfaced after the server actually had the matching record — before that window, the synthetic was legitimately the only copy. Small values like .1/.15/.25 were where users noticed the doubling most clearly because the delta is visually obvious; integer bookings were doubled identically but harder to catch by eye.
- **`labor-booker.js` — Synthetic records stamped with active `workordernum`** — New `extractWorkorderNum(win)` helper reads the current WO number from the parent HDR form (same `ComponentQuery.query('uxtabcontainer[itemId=HDR]')` pattern as `extractCompletionDate`). `executeBookingFlow` captures it before the booking flow runs and includes it in the `LaborService.addRecord()` payload. This gives the merge loop a tight, per-booking discriminator that distinguishes same-hours-same-day bookings on different WOs.
- **`labor-service.js` — Merge loop uses `workordernum` as primary key and `udfchar02` for employee cross-check** — When the synthetic has a WO number, the server record must match on `workordernum` too. The actual employee identifier on server records lives in `udfchar02` as `"USER@DOMAIN"` (e.g. `"ROSENDAH@AMAZON.COM"`); `cleanEmployeeId()` normalizes it to the synthetic's `"USER"` form. Manager Mode: synthetics are now filtered by `cleanEmployeeId(s.employee) === cleanEmployeeId(targetEmployee)` before merging — prevents a self-booking from leaking into another employee's cache when the tracker switches context.
- **`labor-service.js` — Format-agnostic hours/date comparison via `toHrs`/`toIso`** — Defense-in-depth against tenants whose EAM returns padded decimals (`"1.00"` vs synthetic `"1"`, `"0.10"` vs `"0.1"`) or cross-format dates (`"11-APR-2026"` vs `"04/11/2026"`). Mirrors the normalization pattern already used by `labor-booker.js`'s booking log injection.

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
