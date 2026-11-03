# Development Roadmap
**Teamora — FC Revelation**
**Audit Date:** 2026-09-04

---

## P0 — Critical Fixes (Must be done before continuing)

These are blocking issues that will cause incorrect behavior or data corruption.

---

### P0-1: Fix Statistics — Wire Match Results to playerStats

**Objective:** When a match result is saved, update each player's statistics in `playerStats`.

**The Problem:** `matchResultService.saveResult()` stores scorers/assists/cards in `matchResults/{eventId}` but never calls `statsService.incrementGoal()` or `statsService.incrementStat()`. All statistics show 0.

**Files to Modify:**
- `src/services/matchResult.service.ts` — add stats update logic at end of `saveResult()`
- `src/services/stats.service.ts` — add `recalculateFromResult()` function
- Possibly a new `src/services/statsCalculation.service.ts`

**Logic:**
```
saveResult() called
  → for each scorer: statsService.incrementGoal(userId, season)
  → for each assist: statsService.incrementStat(userId, season, 'assists')
  → for each yellowCard: statsService.incrementStat(userId, season, 'yellowCards')
  → for each redCard: statsService.incrementStat(userId, season, 'redCards')
  → for MOTM: statsService.incrementStat(userId, season, 'motmCount')
  → for each startingLineup player: increment appearances + starts
  → for each substitute player: increment appearances (not starts)
```

**Database Changes:** None — `playerStats` schema is already correct.

**Testing Required:**
- Save a result with 2 scorers and verify `goals` increments by 1 for each
- Save a result with an assist and verify `assists` increments
- Save a result, then edit it — verify stats are corrected (needs idempotent logic)
- Delete a result — verify stats are decremented

**Acceptance Criteria:**
- After saving a match result, top scorers leaderboard shows correct goals
- Statistics screen shows non-zero values for players with match records

---

### P0-2: Fix Goals For/Against Calculation (Home vs Away)

**Objective:** Statistics screen counts goals correctly regardless of home/away.

**The Problem:** `StatisticsScreen.tsx:43`
```typescript
const goalsFor     = completedMatches.reduce((sum, e) => sum + (e.result?.homeGoals ?? 0), 0);
const goalsAgainst = completedMatches.reduce((sum, e) => sum + (e.result?.awayGoals ?? 0), 0);
```
This always assumes our team is the home team. For away games, this is reversed.

**Files to Modify:**
- `src/features/statistics/screens/StatisticsScreen.tsx`

**Logic:**
```typescript
const goalsFor = completedMatches.reduce((sum, e) => {
  const ourGoals = e.isHomeGame ? e.result?.homeGoals : e.result?.awayGoals;
  return sum + (ourGoals ?? 0);
}, 0);
```

**Testing Required:**
- Create an away match with result 1-3 — our goals should be 3, not 1

---

### P0-3: Fix app.json userInterfaceStyle

**Objective:** Status bar icons visible on dark background.

**Files to Modify:**
- `app.json` — change `"userInterfaceStyle": "light"` to `"userInterfaceStyle": "dark"`

**Testing Required:** Visual check that status bar icons are white/light colored.

---

### P0-4: Add Firestore Rules for matchData and matchResults

**Objective:** Prevent unauthenticated access to match data.

**Files to Modify:**
- `firestore.rules` — add explicit rules for `matchData` and `matchResults` collections

**Rules to Add:**
```javascript
match /matchData/{matchId} {
  allow read: if isMember(resource.data.clubId);
  allow create, update: if isCoach(request.resource.data.clubId);
  allow delete: if isHeadCoach(resource.data.clubId);
}

match /matchResults/{resultId} {
  allow read: if isMember(resource.data.clubId);
  allow create, update: if isCoach(request.resource.data.clubId);
  allow delete: if isHeadCoach(resource.data.clubId);
}

match /playerStats/{statsId} {
  allow read: if isAuth() && (
    resource.data.userId == request.auth.uid ||
    isMember(resource.data.clubId)
  );
  allow write: if isCoach(resource.data.clubId);
}
```

---

### P0-5: Fix Club Name — Make it User Input at Registration

**Objective:** Every coach should be able to name their own club.

**Files to Modify:**
- `src/features/auth/screens/RegisterScreen.tsx` — add a `clubName` TextInput field
- `src/schemas/auth.schema.ts` — add `clubName` to registerSchema

**Acceptance Criteria:**
- Coach registration form has a "Club Name" field
- Created club has the entered name, not "FC Revelation"

---

### P0-6: Display Invite Code to Coach

**Objective:** Coach must be able to share the invite code with players.

**Files to Modify:**
- `src/features/profile/screens/ProfileScreen.tsx` or `SettingsScreen.tsx`

**Implementation:**
- Read `club.inviteCode` from `useAuthStore(s => s.club)`
- Display in a copyable text box with share button

---

## P1 — Core Functionality (Required for V1 release)

---

### P1-1: Date/Time Pickers

**Objective:** Replace YYYY-MM-DD text input with a proper date picker.

**Files to Modify:**
- `src/features/events/screens/CreateEventScreen.tsx`
- `src/features/events/screens/EditEventScreen.tsx`

**Library:** `@react-native-community/datetimepicker` (or `expo` native solution)

**Acceptance Criteria:**
- Coach can tap a date field and select from a native date picker
- Date stored correctly in YYYY-MM-DD format internally

---

### P1-2: Calculate and Display Attendance Percentage

**Objective:** Player attendance percentage shown in stats and profile.

**Files to Modify:**
- New: `src/utils/attendanceCalculations.ts`
- `src/features/squad/screens/PlayerProfileScreen.tsx`
- `src/hooks/usePlayerStats.ts`

**Logic:**
- Count events where player was in target group
- Count events where player responded 'going' or 'late'
- `attendanceRate = (attended / invited) * 100`

---

### P1-3: Home Screen Live Stats

**Objective:** Home screen W/D/L banner shows real data.

**Files to Modify:**
- `src/features/home/screens/HomeScreen.tsx`
- Add `useMatchStats()` hook or reuse `useAllEvents()`

---

### P1-4: Minutes Played Calculation

**Objective:** Calculate minutes played per player from lineup + substitution timeline events.

**Logic:**
- Player starts: `minutesIn = 0` if in startingLineup
- Player subbed on: `minutesIn = sub event minute`
- Player subbed off: `minutesOut = sub event minute`
- Player stays full game: `minutesOut = 90` (or full_time event minute)

**Files to Modify:**
- `src/services/matchResult.service.ts` — add minutes calculation to saveResult()
- `src/services/stats.service.ts`

---

### P1-5: Edit Timeline Events

**Objective:** Coach can correct a wrongly-entered timeline event.

**Files to Modify:**
- `src/features/match/screens/TimelineEditorScreen.tsx`
- `src/services/matchData.service.ts` — add `updateTimelineEvent()`

---

### P1-6: Add matchResults to COLLECTIONS Constant

**Files to Modify:**
- `src/config/constants.ts` — add `MATCH_RESULTS: 'matchResults'`
- `src/services/matchResult.service.ts` — use COLLECTIONS.MATCH_RESULTS

---

### P1-7: Fix userService.rejectPlayer (Data Loss Bug)

**Files to Modify:**
- `src/services/user.service.ts` — change `deleteDoc` to `updateDoc` with `status: 'suspended'`

---

### P1-8: Deploy Firestore Indexes

**Objective:** Ensure all queries requiring composite indexes work in production.

**Files to Create:**
- `firestore.indexes.json` with all required indexes

**Required Indexes:**
- `playerStats`: clubId (ASC) + season (ASC) + goals (DESC)
- `events`: clubId (ASC) + date (ASC)
- `gallery`: clubId (ASC) + createdAt (DESC)
- `gallery`: eventId (ASC) + createdAt (DESC)
- `comments`: eventId (ASC) + createdAt (ASC)

---

## P2 — UX Improvements (Important but not blocking)

---

### P2-1: Quick Match Event Entry (Match Mode)

**Objective:** Record a goal in under 10 seconds.

**Approach:** Add a persistent "Live Match" button on event detail when event.type is a match and status is not 'completed'. This opens a simplified quick-entry overlay:
- Large event type buttons (⚽ 🟨 🟥 🔄)
- Auto-incrementing match timer
- Last 11 players quick-select

---

### P2-2: Player Photo Upload

**Files to Modify:**
- `src/features/profile/screens/EditProfileScreen.tsx`
- `src/services/user.service.ts` — add `updatePhotoUrl()`

---

### P2-3: Password Reset Flow

**Files to Create/Modify:**
- `src/features/auth/screens/ForgotPasswordScreen.tsx`
- `src/navigation/AuthNavigator.tsx`

---

### P2-4: Excused Attendance Status

Add `'excused'` as a 6th attendance status alongside going/maybe/not_going/late/need_pickup.

**Files to Modify:**
- `src/types/attendance.types.ts`
- `src/services/attendance.service.ts`
- `src/features/events/screens/EventDetailScreen.tsx`
- `firestore.rules` (if needed)

---

### P2-5: Running Score from Timeline

**Objective:** Match score updates as goals are added to timeline.

**Logic:** Count `goal` events in timeline where `isOwnGoal = false` for home goals; display on Event Detail hero.

---

### P2-6: Error Boundaries on Feature Screens

**Files to Modify:**
- Add `<ErrorBoundary>` wrapper around each feature screen in the stack navigators

---

### P2-7: Unified Statistics Update on Timeline + Result

Resolve the two competing goal-tracking systems. Either:
- Derive `matchResults.scorers` from timeline goals, OR
- Use only `matchResults` for statistics (remove timeline as the source of truth for stats)

---

### P2-8: Firebase App Check

Enable App Check with reCAPTCHA/DeviceCheck to prevent API abuse.

---

## P3 — Future Features (Can wait)

- CSV data export for match results and player statistics
- JSON full backup
- Skeleton loaders instead of spinners
- Biometric login (Face ID / fingerprint)
- Push notification delivery (requires server/Cloud Functions)
- Season management UI (change season, archive old season)
- Club logo upload
- Tactical board / pitch visualization (pitch SVG for lineup display)
- Shot / shot-on-target / save / tackle / interception in timeline
- Social features (likes on events)
- Rich text match reports (currently plain text)
- Weekly email digest (requires server)
- Remove unused dependencies (react-native-paper, expo-location)

---

## Implementation Order Summary

**Week 1 (P0 — unblock everything):**
- P0-3: app.json fix (5 min)
- P0-6: Invite code display (1 hour)
- P0-5: Club name at registration (2 hours)
- P0-4: Firestore rules for matchData/matchResults/playerStats (2 hours)
- P0-2: Goals for/against calculation (30 min)

**Week 2 (P0 continued — stats fix):**
- P0-1: Wire match results to playerStats (1-2 days)
- P1-6 + P1-7: Minor fixes (1 hour total)
- P1-8: Deploy Firestore indexes (1 hour)

**Week 3 (P1 — core UX):**
- P1-1: Date/time pickers (1 day)
- P1-3: Home screen live stats (2 hours)
- P1-5: Edit timeline events (3 hours)

**Week 4 (P1 continued):**
- P1-4: Minutes played calculation (1 day)
- P1-2: Attendance percentage (3 hours)

**Week 5+ (P2 — polish):**
- P2-1: Quick match entry mode (2-3 days)
- P2-2: Player photo upload (1 day)
- P2-3: Password reset (2 hours)
- P2-6: Error boundaries (2 hours)
