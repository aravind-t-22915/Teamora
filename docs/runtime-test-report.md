# Runtime Test Report
**Teamora — FC Revelation**
**Audit Date:** 2026-09-04

---

## Test Status

**Note:** The application was not run in a simulator during this audit because:
1. No `.env` file was initially populated (Firebase credentials needed)
2. Running requires a connected device or simulator with Expo Go or native build
3. All findings below are based on static code analysis and service-layer inspection

A full runtime test should be performed after the P0 fixes are applied.

---

## Pre-Runtime Analysis Results

### Application Startup

**Expected behavior:**
1. `App.tsx` renders `GestureHandlerRootView` → `PersistQueryClientProvider` → `AuthProvider` → `RootNavigator`
2. `AuthProvider` sets up `onAuthStateChanged` listener
3. `RootNavigator` shows loading spinner while `isLoading: true`
4. If no cached user: shows `AuthNavigator` (Splash → Welcome)
5. If cached user with `status: 'active'`: shows `AppNavigator` (5-tab main app)

**Potential Issues:**
- Firebase v12 dynamic require for `getReactNativePersistence` may fail silently, falling back to non-persistent auth. Cold-start would then show auth screens even if previously logged in.
- If `.env` credentials are wrong/empty, Firebase init fails and the app crashes with an unhelpful error.

---

### Login Flow
**Code analysis: FUNCTIONAL**
- Zod validation (email format, password min 8 chars) ✅
- Firebase `signInWithEmailAndPassword` ✅
- Auth state listener in `AuthProvider` triggers, fetches user doc and club doc ✅
- `setUser(appUser)` → `isLoading: false`, `isAuthenticated: true` ✅
- `RootNavigator` re-renders, shows `AppNavigator` ✅

**Potential Issues:**
- If user doc doesn't exist in Firestore (edge case: auth account created but user doc write failed), `getUser()` returns null → `setUser(null)` → user stuck on auth screens after logging in with valid credentials
- Error messages from Firebase passed directly to user (e.g., "Firebase: Error (auth/wrong-password)") — not user-friendly

---

### Registration (Coach)
**Code analysis: FUNCTIONAL with bugs**

Flow:
1. `RegisterScreen` → `authService.registerCoach(email, password, firstName, lastName, CLUB_NAME)`
2. Creates Firebase Auth user
3. Creates club doc in Firestore
4. Creates user doc in Firestore
5. `setUser(appUser)` + `setClub(club)` + navigates to `ProfileSetup`

**Known Bugs:**
- Club name is hardcoded to "FC Revelation" — all coaches create clubs with this name
- If step 3 fails (Firestore write error), Firebase Auth account is created but user can never log in (no Firestore user doc)
- No transaction wrapping — partial failure leaves orphaned auth account

---

### Create Event
**Code analysis: FUNCTIONAL with UX issue**

- Form validation: title required, date format YYYY-MM-DD required, time format HH:MM required
- `eventService.createEvent()` writes to Firestore
- Navigation back on success

**UX Issue:**
- Date must be typed as "2026-09-15" — no date picker
- If date typed wrong format, Alert.alert shown but input not highlighted

---

### Event Detail / Attendance
**Code analysis: FUNCTIONAL**

- `useEvent(eventId)` fetches event with React Query
- `useMyAttendance(eventId)` subscribes to own attendance in real-time
- RSVP tap → `setAttendance(status)` → `attendanceService.setAttendance()` runs Firestore transaction
- Transaction atomically updates attendance doc + event.attendanceCount
- UI updates optimistically

**No issues found in attendance flow** — this is one of the better-implemented features.

---

### Timeline Editor
**Code analysis: FUNCTIONAL**

- Bottom-sheet modal for adding events
- Player picker modal from FlatList of all club players
- `matchDataService.addTimelineEvent()` uses `arrayUnion` to add to timeline

**Bug:** When adding a substitution, `substituteInId` is stored but the display name for the sub-in player is NOT stored in the form state. `substituteInId` gets the userId but there's no corresponding `substituteInName` field being set. The TimelineList component would need to resolve the userId to a display name.

---

### Statistics Screen
**Code analysis: BROKEN**

The `StatisticsScreen` shows:
- Season tab: Correct W/D/L derived from completed match events ✅ (but goalsAgainst wrong for away games)
- Scorers/Assists/MOTM/Attendance tabs: ALL SHOW ZEROS because `playerStats` collection is never populated

---

### Match Result
**Code analysis: FUNCTIONAL but with stats bug**

`MatchResultScreen` → `matchResultService.saveResult()`:
- Correctly computes win/draw/loss outcome
- Saves to `matchResults/{eventId}` collection
- Updates `events/{eventId}.result` and `events/{eventId}.status = 'completed'`
- **Does NOT update playerStats** — stats remain 0

---

## Identified Runtime Errors (Predicted)

| Error | Trigger | Severity |
|---|---|---|
| "Missing or insufficient permissions" | Accessing matchData or matchResults without rules | HIGH — will prevent match workflow |
| "The query requires an index" | Statistics screen loads (playerStats orderBy goals) | HIGH — stats screen crashes |
| Firebase init crash | .env not populated | CRITICAL — app won't start |
| Substitution display name blank | Timeline shows substitution events | MEDIUM |
| goalsAgainst wrong for away matches | Statistics season overview | MEDIUM |

---

## Tests That Should Be Written First

1. **Statistics calculation unit test**: Given a match result with scorers, verify playerStats updated correctly
2. **Attendance transaction test**: Concurrent RSVP updates don't corrupt counts
3. **Auth flow integration test**: Register coach → invite code → register player → approve player → login
4. **Event CRUD test**: Create → read → update → delete
5. **Timeline event test**: Add goal → verify timeline stored → delete goal → verify removed
