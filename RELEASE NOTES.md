# APM Master — Release History

For a detailed developer changelog with root-cause analysis, see: [changelog.md](https://github.com/jaker788-create/APM-Master/blob/main/changelog.md)

---

## v14.14.63 (2026-04-26)

### Fixes
- **Yes/No/Clear bulk toolbar in the WO Checklist tab no longer disappears.** The toolbar resolved its slot in the Result column by matching the literal header text `Result` — any tenant-level rename, locale variant, or slow column paint dropped it silently. It now binds to the column by its data field (`dataIndex='result'`), the same field the autofill engine already uses, so the toolbar appears reliably on every WO Checklist regardless of how the column is labelled.

---

## v14.14.62 (2026-04-26)

### Fixes
- **AutoFill default-profile picker now opens next to the AutoFill button instead of drifting off-screen.** When the picker had to choose between multiple matching default profiles, it could anchor to a button living in a hidden screen-cache iframe — placing the dropdown hundreds of pixels away from the visible button (or off-screen entirely). The picker now anchors to the button in the active frame, so it always lands where you expect.

---

## v14.14.61 (2026-04-25)

### Fixes
- **"Update Available" prompt now installs on Violentmonkey, Greasemonkey, and ScriptCat.** The updater opened the install page in a backgrounded tab and auto-closed it after 3 seconds — a flow tuned for Tampermonkey, where the install confirm appears in a separate extension tab. Other managers render the install prompt inside the navigated tab, so backgrounding hid the prompt and the auto-close dismissed it before Confirm could land. The updater now opens foregrounded with no auto-close on every manager except Tampermonkey, which keeps its original flow.
- **Forecast profile summary now reflects the saved past/future toggle.** Profiles whose dataspy was past-facing by default (e.g. "All Work Orders") always read "Last X Weeks" in the panel summary even after the builder's past/future chip was toggled to future and saved. With Date Override on, this summary line is the only past/future indicator while the profile is active, so the toggle felt broken even though it was saving correctly. The summary now matches what the actual filter run does.
- **Forecast past/future chip in standard mode no longer reflects the wrong dataspy.** The chip's visibility came from the hidden advanced dropdown's last value, so it could appear in standard mode even when the actual run targeted "Open Work Orders" (which never needs a past toggle). The chip now resolves the same effective dataspy as the search itself — accounting for the active profile, the dataspy mode (default vs. active), and advanced-panel visibility.

### Improvements
- **Diagnostic export no longer duplicates log entries across frames.** Each frame collected the same shared previous-session logs and the aggregator wasn't deduping, so a single entry could appear repeated several times in the exported diagnostic JSON. A composite-key filter drops duplicates before sorting.

---

## v14.14.59 (2026-04-25)

### Features
- **AutoFill WO presets now carry a `Shift` LOV field alongside `Assigned To`.** The two fields share a fixed-width row inside Schedule & Labor, sitting directly above Book Labor. The shift value is injected after the equipment cascade with the same settle/popup/verify flank as every other LOV field.
- **AutoFill WO editor layout cleanup.** `Assign:` now lives in Schedule & Labor as `Assigned To`. Closing Comments wrapped in the standard panel-section box and moved up in the menu, with trouble codes now at the bottom. Closing textarea grew by ~one line of visible height. Focus state in the editor no longer inverts inputs in dark mode.

### Fixes
- **Keyword chip paste no longer splits on commas.** Pasting `equipment, 300` into an autofill or color-code keyword search input used to produce two chips while typing the same string and pressing Enter produced one. The paste handler now matches Enter and `+` everywhere — the entire pasted string becomes one chip, so commas (and any other character) are valid inside a keyword.
- **AutoFill no longer falsely warns that LOV fields were "rejected" when EAM resolved a label to its database code.** Setting WO Type to `Corrective` or Status to `Open` succeeds, but EAM stores the underlying code (`CM`, `R`) under the hood — the verifier was comparing `"Corrective"` to `"CM"` and emitting an orange "not accepted" toast on every fill. Verification now also accepts the displayed label and a store lookup. Genuine rejections still warn.
- **Scheduled-mode labor booking now works on any WO without per-employee `WSJOBS_SCH` rows.** The fetch was hitting an endpoint that strips the planned-hours rollup, so users with work orders that carry rolled-up hours instead of per-employee schedule rows experienced skipped labor booking. The fetch now reads the WO-level rollup as a fallback — same request, no extra round trip.
- **"No scheduled hours" labor skip now surfaces in the final completion toast** instead of being instantly replaced by the next progress toast. Look for the orange "AutoFill complete — no scheduled hours to book" message when the planned hours are zero.
- **Disabling the PTP Sandbox feature flag now persists the dependent PTP Tracking and PTP Timer toggles to off and visibly greys out their settings rows.** Storage previously stayed true after the sandbox flag flipped off, and the disabled toggle slider looked identical to an active one. Re-enabling sandbox leaves the dependent prefs at off — opt-in is deliberate.
- **Creating a new (blank) record while an existing matching WO was selected no longer fills the blank record with the previous record's preset.** The trigger button's 3-second cooldown was holding the previous match's title in a closure; that fallback is now bypassed when the engine detects a new record.
- **Default profiles (`isDefault: true`) no longer surface the disambiguation picker on existing records.** Two profiles sharing a keyword — typically a "for new records" template and a regular preset for the same kind of work — both landed in the picker on every routine fill. "New Record" profiles now mean what the name suggests. To keyword-match existing records, leave "New Record" unchecked. (Profiles with `isDefault: true` and no companion non-default profile won't trigger AutoFill on existing records — clone the profile and uncheck `isDefault` on one copy.)
- **Checklist text-result and notes now write to the correct row even when row shapes vary.** On checklists that mixed Yes/No rows with text-result rows, the configured text could land in the notes field of the row beneath it. Iteration is now driven by record index rather than DOM heuristics, so config and row are always paired correctly. Action/row-shape mismatches (`'text'` on a Yes/No row, `'yes'`/`'no'` on a text-result row, `'skip'`) are silent no-ops on the result column instead of writing to the wrong field.
- **Settings import no longer overrides bundled preferences and feature flags from the source machine.** Theme, locale, log level, every feature flag, and PTP toggles used to ride along inside the export and clobber the importing user's set values (and auto-detected ones like date format and language). Saved data — autofill profiles, nametag rules, dataspy/forecast profiles, labor settings, tab/grid order — continues to import normally.

### Improvements
- **Diagnostic report now includes a saved-data snapshot for triage.** Bug reports a user pastes from the diagnostics dialog now show tab/column/hidden-tab orders, autofill profile names + match keywords + isDefault flags, full nametag rules, full dataspy/forecast profiles + per-screen selections, and a labor employee count. Profile bodies and labor employee names are deliberately excluded (size and PII).
- **Tab/grid order moved to its own storage key (`apm_v1_tab_order`).** Tab orders, column orders, and hidden tabs lived inside the autofill presets blob for historical reasons that no longer hold. Migrated automatically on first boot — no action required. Old export files keep working.

---

## v14.14.50 (2026-04-25)

### Fixes
- **PTP Sandbox is now hard-off on EU and other non-US1 tenants, regardless of any stored value.** Some users on regions where PTP doesn't exist had the PTP Sandbox feature flag stuck on (carried over from the old PTP timer flag), with the toggle disabled in settings so there was no way to turn it off. AutoFill's PTP completion check then blocked labor booking on every WO with "PTP not completed — skipping labor booking" because the assessment can never complete in those regions. The sandbox now reads as off everywhere PTP isn't available, and a one-time cleanup zeroes the stale settings so the toggles in the panel reflect reality.

---

## v14.14.49 (2026-04-24)

### Features
- **Per-pair AND/OR logic in the forecast profile filter builder.** Every consecutive pair of include keywords in a field (description, equipment, assigned, organization, shift, labor) now shows a clickable AND/OR pill between the chips. Mix operators within a single field, e.g. `desc "pump" AND "motor" OR "bearing"`, or build range filters like `labor >= 5 AND labor <= 10`. Excludes (`!` prefix) stay AND-joined.
- **Eight new filter fields in the forecast profile builder.** Criticality, Priority Level, Location, Department, Cancel Reason, Hold Reason, Parts Issued (yes/no), and PM Is Intrusive (yes/no). Fields that are typically empty outside specific dataspies (Parts Issued, Cancel Reason, Hold Reason) show a soft hint if the profile's dataspy sits outside their usual scope — advisory only, filters still save and emit.
- **"Created By" forecast profile filter.** New field at the top of the Text Search group scopes a forecast to work orders created by a specific user. CONTAINS-only, single value per profile, applies to both WSJOBS and CTJOBS.
- **Night Shift configuration reachable from the Labor Tally panel.** Previously only available from the Quick Book popup's cog icon. A new Shift chip in the tally header opens the same toggle and shift-end form inline; changes propagate to the tally immediately and to Quick Book on next open. A warning-colored dot on the chip signals that Night Shift is currently enabled.

### Fixes
- Grid Column drag list in the settings panel was silently writing to an orphan slot (reorders from the panel never reached the grid, on any screen). Replaced with a hint pointing at EAM's grid header — dragging and resizing columns in the grid itself already saves per screen and dataspy. The Reset Column Defaults button still works.
- Single-site forecast profiles no longer send the `organization` filter twice on the same request (one from EAM's form, one from MADDON injection). Operators incompatible with EAM's top-filter (`!=`, `^`, `$`) continue to route through MADDON only.
- Forecast profile builder left open for extended sessions no longer slows the browser — the full-viewport Gaussian blur on modal overlays has been halved (per-frame GPU cost drops roughly 4×), and the forecast header's continuous weather animation (raindrops + lightning) pauses while the builder covers it.
- Forecast panel no longer leaks global document listeners across init cycles, and the panel's style MutationObserver no longer re-runs component lookups on every position/zoom tweak. Outside-click handlers for the description autocomplete and the dataspy-mode popover are torn down when they close, and all forecast panel listeners tear down on `pagehide`.

### Improvements
- Column Order settings title and the reset-reload dialog now include the active dataspy (e.g. "Column Order (WSJOBS · Open WOs assigned to me):") so it's clear which per-dataspy slot is being saved or cleared.
- Forecast filter preview and active-profile summary both lead with a `Target: <SCREEN> · <dataspy>` line above the filter text, matching the convention introduced for column settings.
- Manager Mode toggle in Labor Tally restyled from hyperlink to chip to match the new Shift chip.

---

## v14.14.43 (2026-04-24)

### Changes
- **Drillback auto-open is now opt-in.** Some users were seeing the record load blank with `<Auto-Generated>` in the work order field after a single-result drillback or search. The issue is timing-related and not fully fixable from the script side (it depends on EAM's internal component wiring). Too much time commitment to root cause fix right now for a minor feature. Auto-open is now off by default; if it works reliably for your machine, you can re-enable it under Settings → General → "Auto-Open Single Drillback Result". Workaround when it does happen: click another tab and back.
- **No more "XMLHttpRequest.responseText" console error.** Cosmetic fix — the error came from APM intercepting non-text XHRs incorrectly. No functional impact.

---

## v14.14.42 (2026-04-23)

### Features
- **Dataspy-aware column orders** — Switching dataspies on one screen no longer overwrites the single saved order. Column order, width, and visibility are now keyed per `(screen, dataspy)` pair; pre-existing saves are dropped once on upgrade and must be re-saved per dataspy. A one-time toast explains this the first time you open settings.

### Fixes
- Returning to list view from non-HDR/non-Activities tabs no longer throws "Cannot read properties of null (reading 'isRecordView')" in Chrome
- Checklist Yes/No/Clear bulk buttons now appear on the first ACK tab entry (previously required switching the activity combo to trigger injection)
- Entering a WO with a pre-existing completed PTP no longer fires a phantom "Assessment cancelled" broadcast
- Column reorders/resizes on screens with no saved preset now persist (first drag was previously silently dropped)
- PTP completion capture is more reliable — schema drift, aborted submits, parent-iframe handshake lag, and missing WO context on the PtpHomeView endpoint no longer leave assessments stuck on INCOMPLETE
- Drillback / auto-open records no longer intermittently load blank with `<Auto-Generated>` fields — cross-frame data fetch is verified, the double-fire race is suppressed, and phantom binds are recovered via direct form load
- Scheduled-mode labor with fraction=0 no longer books the full scheduled amount (was treating 0 as unset and substituting 1)
- Checklist "Saving Checklist…" mask now covers the full save phase (was only showing during the final ~500 ms)
- Settings → Tab Order now refreshes when you reopen the panel (was showing the previously-viewed screen until you clicked a toggle)
- CTJOBS and ADJOBS no longer inherit WSJOBS's saved column order on load
- "Assign To Me" and Shift Report "Set User Login" no longer write full email addresses into `assignedto` for certain session-restore paths

### Improvements
- Tab/column layout reset now uses the styled APM reload dialog (matches feature-flag reload) instead of a browser confirm
- Record Tabs panel hint mentions EAM's native add/remove path alongside drag-to-reorder

---

## v14.14.26 (2026-04-22)

### Fixes
- Column order/width no longer saves to the wrong screen when grids are shared across CTJOBS/WSJOBS (or other shared-iframe screens) — saves now live-detect the grid's current screen on every write
- "Reset column order" now actually clears the saved state (previously re-saved the same state it was trying to delete)
- Reset now restores the EAM server default, not your previously saved APM order
- Parts (SSPART) and other wide grids no longer visibly jump or block typing in column filter inputs after width reapply
- Hidden columns no longer stick around permanently — column hide/show is session-only unless you explicitly save (prevents stray EAM column-hide bursts from being persisted)
- "Wipe All Saved Data" now reloads the top frame instead of redirecting to auth in the child iframe
- Quick book no longer blocks the next record navigation because the activity field re-selected its old value on blur (most visible on slower networks and EU tenants)
- Drillback / single-result auto-open no longer leaves the record blank with `<Auto-Generated>` in key fields — waits for cross-frame data and confirms the form is populated before returning
- UK/EU tenants: fast-mode booking no longer crashes after dismissing the future-date confirmation popup
- UK/EU tenants: night-shift bootstrap now parses EAM dates correctly (was rejecting every date with a US-only regex)
- UK/EU tenants: scheduled-hours fetch now parses comma decimals (was summing every row to 0)

---

## v14.14.17 (2026-04-21)

### Features
- Book labor by scheduled hours — new "Scheduled" mode fetches the WO's scheduled labor tab and books the remaining difference automatically. Supports a fraction multiplier (e.g. 0.5 = book half) and an "Ignore booked" toggle to book against the raw total instead of remaining hours.
- What's New modal now pulls live release notes from GitHub — stable users see release notes, beta users see the developer changelog

### Fixes
- Update install no longer leaves an orphan tab — the source-view tab that Tampermonkey used to trigger install detection now closes itself automatically once the install prompt is open
- Scheduled hours fetch no longer returns 0 rows when a user's sticky dataspy filters the view — pinned to the global "All Records" dataspy
- Scheduled hours fetch is deterministic (was intermittently returning HTML instead of JSON)
- Forecast profile's saved dataspy is honored in standard/simple forecast view (was silently falling back to the screen default)
- Quick book save verification actively fetches server state when the response intercept misses — toast confirms match or warns if no record is found

### Improvements
- Removed the form-state verification layer from labor save — fetch-based fallback now provides definitive confirmation

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
