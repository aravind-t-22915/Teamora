# Database Audit
**Teamora — FC Revelation**
**Audit Date:** 2026-09-04

---

## 1. Collections Overview

| Collection | Purpose | Doc ID Strategy | Status |
|---|---|---|---|
| clubs | Club/organization data | Auto-generated | ✅ Implemented |
| users | User profiles + auth metadata | Firebase Auth UID | ✅ Implemented |
| groups | Named player groups | Auto-generated | ✅ Implemented |
| events | All team events | Auto-generated | ✅ Implemented |
| attendance | Per-user per-event RSVP | `{eventId}_{userId}` | ✅ Implemented |
| comments | Event comments | Auto-generated | ✅ Implemented |
| reports | Match coach reports | Auto-generated | ✅ Implemented |
| playerStats | Season player statistics | `{userId}_{season}` | ✅ Exists — but **never written from match flow** |
| matchData | Lineup, timeline, ratings | `{eventId}` (1:1) | ✅ Implemented |
| matchResults | Match result entry | `{eventId}` (1:1) | ✅ Implemented — but **separate system** from timeline |
| gallery | Photo/video metadata | Auto-generated | ✅ Implemented |
| notifications | Notification log | Auto-generated | ✅ Implemented |
| clubSettings | Club configuration | `{clubId}` | Defined in types, no UI to write |
| polls / pollResponses | Availability polls | Auto-generated | Rules exist, no service/UI |

**Note:** `matchResults` is not listed in `COLLECTIONS` constant in `constants.ts`. It's hardcoded as `'matchResults'` in `matchResult.service.ts`.

---

## 2. Schema Analysis

### clubs
- All fields match BLUEPRINT.md schema
- `founded` field omitted from auth.service.ts club creation (not critical)
- `season` hardcoded to "2025-2026"

### users
- Complete implementation matching blueprint
- `fcmToken` initialized as empty string (correct, updated on login)
- All football profile fields (position, foot, height, weight, dob) defaulted appropriately
- `groupIds` initialized as empty array

### events
- Complete implementation
- `attendanceCount` denormalized object maintained by `attendanceService` transaction
- `isMatch` derived from type during create (correct)
- Date stored as Firestore Timestamp (correct)
- Soft cancel via `status: 'cancelled'` (good)

### attendance
- Deterministic doc ID: `{eventId}_{userId}` — enables O(1) lookup without index
- Transaction-based update ensures atomic count maintenance
- **Good design** — no race conditions possible

### playerStats
- Doc ID: `{userId}_{season}` — correct, enables efficient single-doc access
- Schema complete with all planned fields
- **CRITICAL ISSUE: Never populated from match flow** (see section 4)

### matchData
- 1:1 with events (doc ID = eventId) — clean design
- Stores timeline as an array inside the document
- **Timeline array grows unbounded** — Firestore documents max at 1MB; ~100 events per match × multiple seasons is safe, but timeline deletion uses read-then-write (expensive for large timelines)

### matchResults
- Separate from matchData — stores scorers/assists arrays, MOTM
- Duplicates goal/assist data from timeline
- **Two competing systems** for tracking goal/assist attribution

---

## 3. Relationships

```
clubs (1) ──── (N) users
clubs (1) ──── (N) events
clubs (1) ──── (N) groups
events (1) ──── (N) attendance  [attendanceId = {eventId}_{userId}]
events (1) ──── (N) comments
events (1) ──── (1) matchData   [matchId = eventId]
events (1) ──── (1) matchResults [resultId = eventId]
events (1) ──── (N) gallery
events (1) ──── (N) reports
users (1) ──── (N) playerStats  [statsId = {userId}_{season}]
```

All relationships are maintained via string IDs (correct for NoSQL).

---

## 4. CRITICAL: Statistics Architecture Problem

### The Problem

There are TWO separate data entry points for goals and match events, and **neither one updates playerStats**:

**Path A: Timeline Editor → matchData collection**
```
TimelineEditorScreen
  → useAddTimelineEvent()
    → matchDataService.addTimelineEvent()
      → Writes to matchData/{eventId}.timeline[]
      → NEVER calls statsService.incrementGoal()
      → NEVER calls statsService.incrementStat()
```

**Path B: Match Result Screen → matchResults collection**
```
MatchResultScreen
  → matchResultService.saveResult()
    → Writes to matchResults/{eventId} with scorers[], assists[], yellowCards[], redCards[]
    → NEVER calls statsService.upsertPlayerStats()
    → NEVER iterates scorers and calls incrementGoal()
```

### The Result

`playerStats` documents are never written to through normal match flow. The statistics screen will show **0 goals, 0 assists, 0 appearances, etc. for every player.**

### Statistics Calculation Strategy — Current vs Ideal

**Current (broken):**
- Manual incremental updates via `statsService.incrementStat()` — the functions exist but are never called
- Manual result entry via `matchResultService.saveResult()` — stores data but never propagates to playerStats

**Ideal (what must be built):**
- Option A: **Derived statistics** — calculate from matchResults/matchData on read
- Option B: **Event-driven updates** — when matchResult.saveResult() is called, iterate scorers/assists/cards and call statsService.upsertPlayerStats()

**Recommendation:** Option B with a dedicated statistics calculation function called at the end of `saveResult()`.

### Statistics Inconsistency Between Systems

`matchData.timeline[]` records goals with `playerId` and `assistId`.
`matchResults.scorers[]` records goals with `userId` and `playerName`.

These two lists can diverge if a coach adds events in the timeline but enters different scorers in the result form. There is no single source of truth for goal attribution.

**Recommendation:** The `matchResults.scorers` array should be derived from the timeline, not entered separately.

---

## 5. Indexes Required

The following Firestore composite indexes are required for queries to work:

| Collection | Fields | Direction | Status |
|---|---|---|---|
| events | clubId ASC, date ASC | — | Not deployed |
| playerStats | clubId ASC, season ASC, goals DESC | — | **Required** — `getClubStats()` uses `orderBy('goals', 'desc')` |
| comments | eventId ASC, createdAt ASC | — | Required for comments list |
| gallery | eventId ASC, createdAt DESC | — | Required for event gallery |
| gallery | clubId ASC, createdAt DESC | — | Required for club gallery |
| notifications | clubId ASC, sentAt DESC | — | Required for notifications list |

**The `playerStats` index is most critical** — without it, `getClubStats()` will fail with a Firestore "requires index" error in production, meaning the Statistics screen will always show a loading error.

---

## 6. Data Constraints & Validation

### Missing Constraints
- No uniqueness check on `jerseyNumber` within a club (two players could have #9)
- No validation that `season` format is consistent (e.g., "2025-2026")
- `inviteCode` generated client-side — theoretically could collide (6-char alphanumeric = ~32^6 ≈ 1 billion combinations, practically safe)

### Soft Delete
- Events: `status: 'cancelled'` — good, preserves history
- Players: `status: 'suspended'` — good, preserves profile
- But `userService.rejectPlayer()` does `deleteDoc()` — **data loss on rejection**

### Referential Integrity
- No cascading deletes (Firestore doesn't support them)
- Deleting an event doesn't delete: its attendance records, comments, gallery, matchData, matchResult, reports
- This creates orphaned documents — **minor technical debt**, not a runtime problem

---

## 7. Denormalization Assessment

| Denormalized Field | Location | Risk |
|---|---|---|
| `displayName` in attendance | attendance docs | If user changes name, old attendance records show stale name |
| `photoUrl` in attendance | attendance docs | If user updates photo, old records show stale photo |
| `matchTitle`, `matchDate` in reports | reports docs | If event is updated, report shows stale data |
| `memberCount` in clubs | clubs docs | Not maintained (createEvent doesn't update memberCount) |
| `attendanceCount` in events | events docs | Correctly maintained via transactions |
| `commentCount`, `galleryCount` in events | events docs | Correctly maintained |

**The memberCount field in clubs is never updated** — it stays at 1 forever after club creation.

---

## 8. Data Size Estimate (5-Year Projection)

Based on: 1 team, 30 players, 3 admins, 150 matches/year, 200 training sessions/year

| Data Type | Per Year | 5 Years |
|---|---|---|
| Event docs | 350 events × ~2KB | ~3.5MB |
| Attendance records | 350 events × 30 players × ~0.5KB | ~5.25MB |
| Comments | ~500 comments × ~0.3KB | ~0.75MB / year |
| Timeline events | 150 matches × ~20 events × ~0.2KB | ~0.6MB / year |
| PlayerStats | 30 players × 1KB | ~150KB / year |
| Gallery metadata | ~1000 photos × ~0.5KB | ~0.5MB / year |
| Player photos | 30 × 100KB avg (compressed) | ~3MB total |
| Match/event photos | ~1000 × 200KB avg (compressed) | ~200MB / year |

**5-year Firestore storage estimate: ~50MB** (well within free tier)
**5-year Firebase Storage estimate: ~1-2GB** (within 5GB free tier)

The biggest concern is Firebase Storage for photos. At 200MB/year of photos, 5 years = ~1GB, which stays within the 5GB free storage tier.

---

## 9. Historical Data Handling

- Events are preserved indefinitely (no auto-deletion)
- `status: 'cancelled'`/`'postponed'` for cancellations — good
- No season archiving mechanism
- `playerStats` use `{userId}_{season}` key — multiple seasons supported by design
- `matchResults` and `matchData` are preserved indefinitely — good for history

---

## 10. Summary of Database Issues

| Severity | Issue |
|---|---|
| CRITICAL | playerStats never updated from match events/results |
| CRITICAL | Two competing goal-tracking systems (timeline vs matchResults) |
| CRITICAL | Required Firestore index for playerStats not deployed |
| HIGH | `matchResults` collection name not in COLLECTIONS constant |
| HIGH | userService.rejectPlayer deletes user doc (data loss) |
| MEDIUM | Orphaned documents when events/players deleted |
| MEDIUM | memberCount in clubs never updated |
| MEDIUM | Denormalized displayName/photoUrl can become stale |
| LOW | No jersey number uniqueness constraint |
| LOW | season hardcoded in constants.ts |
