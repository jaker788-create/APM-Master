# APM Master — Release History

Detailed developer changelog with root-cause analysis: [changelog.md](changelog.md)

---

## v14.14.10 (2026-04-19)

### Features
- Checklist text-result option — rows with text inputs (instead of Yes/No) can now be filled via a "Text" toggle in advanced per-row config
- Bulk Yes/No/Clear buttons moved into the Result column header (no more toolbar overlap at high zoom)
- Scheduled start/end dates replaced with relative day offsets (0 = today, 5 = 5 days out)
- Description autocomplete in forecast — saves recent terms, pin favorites, filter as you type
- Dataspy mode persists across sessions
- Dataspy target dropdown in forecast advanced panel — select which EAM dataspy to search against
- Dataspies integrated into profiles with per-screen options
- Dataspy mode awareness — "Change" popover to switch between Open WOs and active EAM dataspy
- Live sync between EAM's dataspy combobox and the forecast panel
- Past-date auto-detection for dataspies — closed/all WO dataspies automatically flip date labels
- Direction toggle (Past/Future) for bidirectional dataspies
- "Assign To Me" button on all WO records (renamed from "Flip Ticket")
- Night shift bootstrap seeds record registry with real timestamps on first popup open
- PTP anti-flash guard — dark background applied before React renders

### Fixes
- Column widths now save and restore correctly (was writing to a clone instead of the real state)
- Flex clearing uses `flex = 0` instead of `delete` to avoid prototype leak
- `minWidth` cleared before applying saved column width
- Direction toggle clears properly on mode switch
- Shift end clear button now reads "Clear" instead of ambiguous X glyph
- Enter key closes night shift popover
- Shift view toggle hidden when night shift is off
- Checklist bulk buttons aligned to Result column header
- PM Check sync now triggers grid save immediately
- Quick book navigation no longer blocked after labor booking

---

## v14.14.2 (2026-04-18)

### Features
- LST response intercept rewrites column order before grid creation — eliminates visible column reorder flicker on first load
- Column show/hide via LST rewrite — server-hidden fields can now be promoted to visible
- Grid columns restored before first render via ExtJS override

### Fixes
- Labor save capture hardened with XHR-level response interception (survives screen-cache replacing Ext.Ajax)
- Immediate labor tally refresh on save verification failure
- CTJOBS labor save detection added

---

## v14.14.0 (2026-04-17)

### Features
- New `ScreenScope` class unifies screen detection across all iframe scenarios (screen-cache, shared iframe, no screen cache)
- Diagnostics panel expanded with environment, boot gates, and session info

### Fixes
- Forecast no longer fails on CTJOBS in shared-iframe or no-iframe mode
- `returnToListView` no longer expands the wrong screen
- Labor tally now extracts confirmed records from SAVE response (replaced synthetic record approach)
- Labor service dedup simplified to bookingcode lookup
- PTP Cognito auth gate prevents 401 cascades during token refresh

---

## v14.13.11 (2026-04-16)

### Features
- PTP timer can be disabled independently from PTP sandbox (theme sync + status tracking continue)
- Feature flag reload dialog — toggling a flag now prompts for page refresh

### Fixes
- Forecast no longer targets the wrong screen in screen-cache mode
- Forecast MADDON filters no longer contaminate non-forecast screens (ADJOBS, CPJOBS)
- Column sort/page no longer drops MADDON filters
- Fast-mode labor booking no longer dirties blank record after save
- PTP completion status hardened — COMPLETE is permanent, duplicate guard fixed, text fallback fixed
- Theme responder always replies (fixes null `_parentOrigin` for default-theme users)

---

## v14.13.7 (2026-04-15)

### Improvements
- All storage and cookie key strings centralized in constants

### Fixes
- Tab activation suppression during plugin restoration widened to full orchestration
- Session restore now respects saved active tab
- API proxy methods properly bound (fixes console access to APMApi)
- Colorcode row-cache no longer reprocesses entity-less rows infinitely
- Guard against checklist grids in column reordering

---

## v14.13.5 (2026-04-14)

### Features
- Equipment keyword matching with AND logic — profiles can match on both title and equipment keywords
- Equipment keyword chip input with toggle switch in settings
- EAM popup auto-dismiss handles date-in-past confirmation during autofill

### Fixes
- Stale autofill on same-screen record navigation
- Keyword mode sync conflict with "New record template" checkbox
- Labor save response detection hardened for string-encoded params
- Labor failure toast now says "check EAM error" (more actionable)

### Improvements
- Settings hint text bumped to 12px for readability
- Labor hours `.5` auto-prefixed to `0.5` on blur

---

## v14.13.3 (2026-04-13)

### Features
- PTP completion guard on labor booking — skips booking with warning when PTP is incomplete
- PTP completion status badge in Quick Book popup
- Advanced per-row checklist configuration — modal with per-row Yes/No, Notes, and Follow Up
- LOTO dropdown shows "Custom" when advanced config is saved
- Follow-up WO creation per-activity from advanced checklist config

### Fixes
- Settings panel stays open during modal popups
- Legacy `createFollowUp` field migrated to per-row config

---

## v14.13.1 (2026-04-12)

### Features
- Checklist bulk-action buttons (Yes/No/Clear) on the ACK tab toolbar

### Fixes
- "No" button no longer selects Follow-up checkbox on completed-only rows

---

## v14.13.0 (2026-04-11)

### Features
- Forecast engine rewritten as a 5-stage pipeline (resolveIntent, collectFilters, execute, publishContext, persist)
- Modes are now pluggable Strategies; filter sources are pluggable Contributors
- Single-shot DOM snapshot eliminates mid-pipeline data races
- No Date Filter option in forecast search

### Fixes
- WSJOBS and CTJOBS can have independent active filter contexts simultaneously
- `waitForGridReady` timeout reduced from 15s to 7s for faster failure feedback
- Tab disappearance fix — legacy hidden tabs migration no longer randomly assigns tabs to wrong screens
- Labor tally double-counting fix — synthetic records now matched by bookingcode
- Consolidated record auto-open prevents concurrent double-click events

---

## v14.12.1 (2026-04-08)

### Features
- No Date Filter in forecast search — unchecking all days auto-selects it

### Fixes
- Consolidated record auto-open prevents blank record fields from concurrent events
- Activity combo switching uses direct `store.load()` (more reliable)
- AutoFill button injection respects screen-cache visibility
- Session snapshot captures CTJOBS records correctly
- `isComponentOnActiveScreen` reverted to correct behavior

---

## v14.12.0 (2026-04-07)

### Fixes
- CTJOBS shared-iframe grid detection via title cross-check
- Skips redundant navigation when already on target screen (eliminates column reset flash)
- `returnToListView` no longer reloads the full screen when already in list view
- 1-Tech checkbox counting now includes unchecking the opposite checkbox
- ModuleGuard adopted across autofill, labor-booker, closing-comments
- Screen detection uses `getEamViewState().screen` consistently

---

## v14.11.7 (2026-04-05)

### Features
- Anchor-based record tab panel discovery — reliably finds the correct screen's record panel in all iframe scenarios
- Live grid preview on color/tag input changes
- Nametag filter capture and restore in session snapshots

### Fixes
- `ensureHDRTab` scoped to correct screen (no longer finds top frame's navigation shell)
- Checklist execution scoped to correct ACK container (no cross-screen contamination)
- WSBOOK screen mapping added (prevents Quick Book button on wrong screen)
- Entity link cache now discovers new sub-tab grids
- Follow-up WO suffix stripped from header field copy icons
- Entity links preserve checkboxes and other cell elements
- AutoFill `itemdblclick` fired on view (not grid) to prevent crash
- Colorcode preview stale highlight cleanup on rule edit
- Chip input "or" labels cleaned up on chip removal

### Improvements
- Pending chip visual feedback while typing keywords
- Capitalized chip text for readability

---

## v14.11.4 (2026-04-04)

### Features
- Night shift record registry — all EAM labor records tracked by bookingcode for shift filtering
- Fast save verification via response interception (~400ms vs ~2.5s)

### Fixes
- Tab detection uses title observer instead of unreliable DOM scan
- Unconditional `ensureHDRTab` before field injection
- Checklist filling via DOM clicks (visually instant, no main thread blocking)
- Guaranteed paint yield between checkbox operations
- Shift filter priority swap — bookingcode registry is primary, booking log is fallback
- Cross-format hours/date comparison normalization
- Dynamic yesterday display in shift summary

### Improvements
- GPU-composited loading mask during checklist save wait
- Toast progression shows checklist filling progress

---

## v14.11.1 (2026-04-03)

### Features
- Shared title observer (`eam-title-observer.js`) — single MutationObserver on `<title>` replaces per-module observers
- Event-driven session snapshot capture (replaces 3s poll)

### Fixes
- Tab title: complete rewrite using EAM's document.title format for reliable view detection
- Snapshot date filter values no longer silently dropped during capture
- Snapshot Run click Ajax race condition fixed (poll for request start instead of fixed delay)
- Screen-cache DOM filtering — element queries now check visibility
- UDS screen detection override (AUIRPR, SHFRPT)

---

## v14.10.23 (2026-04-02)

### Features
- Fast booking mode (default) — only runs Activity cascade, injects other fields into save request directly
- Smart retry in safe mode — skips already-correct field cascades
- Nametag filter footer record count restores when filter is cleared

### Fixes
- Record load freeze fix — deferred `updateTabTitle()` out of synchronous layout transition
- Targeted layout flush in tab reorder (98% reduction in reorder cost)
- `fRate is not defined` crash on labor submit
- Department cascade now triggered by `select` event (matches EAM's listener)
- Snapshot fallback scan no longer triggers for genuinely new tabs

### Improvements
- Colorcode skips most sub-tab grids entirely (7+ fewer grid scans on record load)
- Tab consistency cooldown increased to absorb event storms

---

## v14.10.18 (2026-04-01)

### Features
- FocusManager guard — safe fallback object prevents crashes during record/list transitions
- Scheduler visibility-aware timer reset — prevents task stampede on tab foreground
- Scheduler pause on sleep/wake — prevents tasks from firing against expired sessions

### Fixes
- `suspendEvents` wrapped in try/finally (prevents permanently muted stores)
- Click-away listener no longer leaks on repeated popup opens
- PTP timer interval self-clears on missing DOM
- XHR load listener guarded against duplicates
- Chip input keystroke listener uses AbortController (prevents accumulation)
- Consistency polling removed from scheduler (event-driven triggers provide full coverage)

### Improvements
- Help images moved to external URLs (43% bundle size reduction: 1,078KB to 615KB)
- Colorcode rules cache eliminates deep clone on every call
- CSS variables batched into single style element per document
- Logger short-circuits for single-string args

---

## v14.10.11 (2026-03-31)

### Features
- AutoFill keyword chips — enter keywords as individual pills instead of comma-separated text

### Fixes
- AutoFill keyword index collision — profiles sharing a keyword no longer silently overwrite each other
- Snapshot filter restore race condition — waits for initial grid load before setting filters
- Wake detection threshold raised from 60s to 15 min (reduces false positives)

### Improvements
- AutoFill template selector buttons now visible at all zoom levels

---

## v14.10.8 (2026-03-30)

### Features
- EU region auto-detection — dynamic base URLs, date format, comma decimal support
- a2z EAM domain support (`prod.eam.aws.a2z.com`)
- Locale system — 7 languages (en, de, fr, es, it, pt, ja) covering toast messages, session prompts, and UI labels
- Follow-up WO creation in AutoFill after checklist completion
- ColorCode rule consolidation — auto-merges imported BetterAPM rules with similar names/colors
- ColorCode keyword chips — pills instead of comma-separated text
- Forecast start-screen resilience with retry and URL fallback

### Fixes
- Cross-frame cache staleness for colorcode rules
- Settings import now accepts wrapped format
- Date override respects separator setting
- Import flickering eliminated (single `setRules()` call)

---

## v14.10.6 (2026-03-29)

### Fixes
- Snapshot restore failed after browser restart — added fallback scan of all snapshot keys
- Orphaned snapshot scan for tab recovery
- Cross-frame diagnostics now aggregates logs from all accessible frames
- Snapshot grid state no longer picks up wrong screen's data
- Snapshot dataspy restore validates before setting
- Shift Report field fallback chain (responsible, reportedby, enteredby, etc.)
- Clipboard copy icon works in content iframes (switched to execCommand)

### Improvements
- Help screen Getting Started reorganized by priority
- Session heartbeat activity timeout bumped from 2h to 3h

---

## v14.10.4 (2026-03-28)

### Features
- Multi-screen autofill — Work Orders, Repair Requests (AUIRPR), and Shift Reports (SHFRPT) as distinct screen types
- Repair Request flow — org cascade, repairable part, issued WO, save + initiate repair
- Shift Report flow — auto user login, status, checklists, save
- 5-Tech checklist support for WO templates
- Department field in WO templates
- New template popover with copy-from-current option
- Dirty-state tracking warns on unsaved template changes
- Screen detection service for reliable screen identification in screen-cache mode

### Fixes
- Feature flag corruption root cause fixed — cross-frame sync no longer wipes flags
- Toolbar button ungated (always accessible for re-enabling disabled features)
- Shift report checklist task 20 grid reload fixed
- AutoFill button persists on non-HDR tabs
- Session snapshot navigation fixed for Repair/Shift Report screens
- Stale screen detection in ColorCode linkification
- Entity links disabled for non-drillback screens
- Forecast targeted wrong frame with screen cache
- Forecast search now works in no-screen-cache mode
- Firefox cross-origin error during forecast navigation (three-layer guard)
- Custom dataspy filters persist across sort/pagination
- AutoFill button injection fix on blank/new records

---

## v14.9.0 (2026-03-27)

### Features
- Wake-from-sleep session probe — detects expired sessions and offers Restore/Redirect/Dismiss
- Session snapshot flag handoff for seamless one-prompt restore after re-login
- View transition events for instant tab title and snapshot updates
- Rich text clipboard for WO links (pastes as clickable link in Slack/Teams/email)

### Fixes
- Screen-cache MADDON filter injection (XHR prototype intercept for memory proxy stores)
- Active frame detection with screen cache
- Session snapshot screen detection in no-screen-cache mode
- Labor tally hour fluctuation from pagination offset

---

## v14.7.6 (2026-03-26)

### Features
- EAM API integration — screen detection, navigation, and save via internal EAM APIs
- Quick search via `Nav.goTo()` for instant WO navigation
- Session restore via `Nav.goTo()` (faster than filter + Run flow)
- Session snapshot captures grid search state (dataspy, filter fields, operators)

### Fixes
- Session heartbeat reworked — authenticated POST request, jittered interval, activity gate
- Labor field injection reorder matches manual EAM flow (eliminates cascade conflicts)
- Labor save via internal `callSave()` API

### Improvements
- Legacy storage keys normalized to `apm_v1_*` naming convention
- Checklist autofill performance — batched layouts and events, event-driven Ajax waits

---

## v14.7.1 (2026-03-25)

### Features
- Session Snapshot — automatically captures current screen and open record, prompts to restore after session timeout

---

## v14.7.0 (2026-03-24)

### Features
- Quick search auto-opens the WO record after grid filters return results
- New-tab drillback links auto-open the record after EAM boots
- Entity-agnostic auto-open for WSJOBS, CTJOBS, SSRCVI, SSPART

### Fixes
- 7 CSS syntax bugs fixed across quick search, labor panel, profile badges, filter builder
- Nametag filter rendering pulse fixed
- Missing shift and org fields in MADDON filter builder
- Cookie domain mismatch in theme shield
- Prototype pollution vector in settings import
- Labor-booker correction validation (negative hours no longer rejected)
- AutoFill activity detection (no longer matches activity 1 and 10)
- MADDON filter truncation on non-contiguous keys

### Security
- Blocked `_api` property bypass on APMApi proxy
- Removed wildcard postMessage fallback
- URL protocol validation for update links
- innerHTML replaced with DOM APIs across multiple files
- Sanitized imported colorcode rules
- Session ID masked in logs

### Improvements
- Grid performance — suspendEvents batching for nametag filter, isFrameVisible gate for colorcode
- Tab overflow measurement guards prevent crash on destroyed tabs
- Settings panel decomposed into 6 focused files
- Build output minified (29% size reduction)

---

## v14.1.4 and earlier

Initial release of APM Master as a modular ES6 userscript. Established the core architecture: esbuild bundling, ExtJS 6.x API manipulation, cross-frame theme enforcement, session management with auto-redirect, unified cross-domain storage (APMStorage), and the scheduler-driven task system. ColorCode grid highlighting, forecast filtering, labor booking, and PTP timer were the original feature set.
