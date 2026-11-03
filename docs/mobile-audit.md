# Mobile UX Audit
**Teamora — FC Revelation**
**Audit Date:** 2026-09-04

---

## Device Coverage

**Tested (code inspection):** 375×667 (iPhone SE), 390×844 (iPhone 14), 412×915 (Pixel 7)
**Note:** App tested via source-code review only; no actual device/simulator run performed (see Runtime Test Report for test status).

---

## 1. Navigation

### Bottom Tab Bar
✅ **5 tabs** implemented with emoji icons + labels  
✅ **iOS padding** (84px height) vs Android (64px height) handled  
✅ **Active state** highlights with accent green  
✅ **FAB (center tab)** for events — good ergonomic choice  

⚠️ **Center button is the Events tab, not a true FAB**: Tapping it navigates to the Events list, not directly to Create Event. A true FAB that immediately opens Create Event would be faster for coaches.  

✅ **Safe area** respected via `SafeAreaView` in all screens  

### Match Tools Access
⚠️ **Match tools (Lineup, Timeline, Ratings, Report, Result) are in the Overview tab** of Event Detail — they require: Tab (Events) → Event Detail → scroll down → tap tool. That's 4+ actions to start recording a goal. **Too slow for live match use.**

### Single-hand Use
⚠️ The back button "← Back" is a small text button at the top-left. On large phones (390px+), the top-left corner is hard to reach one-handed. A bottom-sheet pattern or gesture-based navigation would help.

---

## 2. Touch Targets

### Findings

| Element | Current Size | Issue |
|---|---|---|
| RSVP buttons (Going/Maybe/etc.) | flex-wrap row, ~56px wide | Tight on small screens; 5 buttons in a row |
| Match action icons (Lineup/Timeline/etc.) | 72px min-width, ~44px tap area | Acceptable |
| Back button "← Back" | Text only, no hitSlop | Too small — needs `hitSlop` padding |
| Tab bar items | ~20px emoji + 10px label | Good — full tab width is the touch target |
| Squad list rows | Full card width | ✅ Good |
| Timeline editor "Add Event" button | Full width, 52px height | ✅ Good |
| Delete icon 🗑 in Event Detail | No hitSlop defined | Risk of accidental tap next to Edit button |

### RSVP Buttons
The 5 RSVP buttons in a row (Going / Maybe / Can't / Late / Pickup) are squeezed on a 375px screen. Each button is approximately 56px wide × 54px tall. This is borderline acceptable but tight. A 2-row layout would be better:
```
[✅ Going]  [🤔 Maybe]  [❌ Can't]
[⏰ Late]   [🚗 Pickup]
```

---

## 3. Forms

### Date Input (CRITICAL UX ISSUE)
**File:** `src/features/events/screens/CreateEventScreen.tsx:151-153`

```typescript
<TextInput
  style={s.input}
  value={dateStr}
  onChangeText={setDateStr}
  placeholder="YYYY-MM-DD"
/>
```

**Problem:** Coach must type a date in YYYY-MM-DD format on a phone keyboard. This is a significant friction point during training/match setup. **This needs a proper date picker** (e.g., `@react-native-community/datetimepicker` or a Expo-compatible date picker).

### Time Input
Similarly, `startTime` and `endTime` are plain text inputs with "HH:MM" format. While slightly less critical than the date (time can be memorized), a time picker would be better UX.

### Keyboard Behavior
✅ `KeyboardAvoidingView` used in Login screen  
⚠️ `CreateEventScreen` does NOT use `KeyboardAvoidingView` — the keyboard will cover form fields when typing in the middle/lower sections of the form  
⚠️ `keyboardShouldPersistTaps="handled"` set on ScrollView — this is correct to prevent keyboard dismissal on scroll  

### Match Detail Forms (Timeline)
✅ `TimelineEditorScreen` uses a bottom-sheet modal pattern — **good for one-handed use**  
✅ Minute input is a number-pad keyboard — correct  
✅ Player picker is a full-screen modal with FlatList — could be heavy but functional  

---

## 4. Match-Side Usability (CRITICAL for Product Success)

### Coach scenario: Recording a goal in less than 10 seconds

**Current flow:**
1. Open app (1s)
2. Navigate to Events tab (1 tap)
3. Find the match event (1-2 taps)
4. Tap "Overview" tab (default)
5. Scroll down to Match Tools section
6. Tap "Timeline" button
7. Wait for TimelineEditorScreen to load
8. Tap "+ Add Event" button
9. Type the minute in the input (2-3 taps on number pad)
10. Select event type "Goal"
11. Tap "Select player…"
12. Scroll list and tap player name
13. Optionally select assist player
14. Tap "Add"

**Total: ~13-15 steps, 20-30 seconds minimum**

**This fails the "under 10 seconds" requirement** for recording a match event.

### Recommendations for Match Mode
1. **Match mode shortcut**: A "Live Match" button on the event card for ongoing matches that goes directly to timeline editor
2. **Quick timeline**: Bypass the full modal by showing event type chips + minute input inline
3. **Pre-filled minute**: Auto-increment a match timer so minute doesn't need to be typed
4. **Recent players**: Show the last 11 players at the top of the player picker

### Current score visibility
✅ Score IS visible on Event Detail hero if a result has been entered via MatchResultScreen  
⚠️ Score does NOT auto-update from timeline events (no derived score from timeline goal events)  
⚠️ Timeline event goals don't count toward the event's `result.homeGoals` / `result.awayGoals`  

---

## 5. Scrolling and Content

### Event Detail Screen
✅ Uses tab pattern — prevents infinite scroll  
⚠️ Overview tab can get very long on match events (date, venue, match details, match tools, description, RSVP, coach notes) — consider collapsible sections  

### Statistics Screen
✅ Tab-based navigation (Season / Scorers / Assists / MOTM / Attendance)  
✅ Scrollable content  
⚠️ With all zeros (see database audit), the screen currently shows empty leaderboards  

### Home Screen
✅ Compact event cards  
⚠️ Stats banner (W/D/L/Attendance) shows hardcoded zeros — this is confusing/misleading  

---

## 6. Dark Theme

✅ Consistent dark background (#0F1117 base, #161B22 cards)  
✅ Good contrast ratios for primary text (#F9FAFB on dark)  
⚠️ `userInterfaceStyle: "light"` in app.json — the system status bar icons will be dark-colored (hard to see on dark background). Should be `"dark"`.  
✅ `<StatusBar style="light" />` in App.tsx partially corrects this  

---

## 7. Loading States

✅ `ActivityIndicator` used throughout for loading states  
✅ Auth loading shown (spinner while checking auth state)  
⚠️ No skeleton loaders (planned in BLUEPRINT Phase 8, not implemented)  
⚠️ No pull-to-refresh on Events list (some screens have it, not all)  
✅ `RefreshControl` on SquadScreen  

---

## 8. Error States

✅ Event not found shows error message with back button  
✅ Auth errors shown via Alert dialog  
✅ Lineup Builder shows permission error screen  
⚠️ Network errors not explicitly handled — if Firestore call fails, user sees spinner indefinitely  
⚠️ No `ErrorBoundary` wrapping feature screens (planned in BLUEPRINT but not implemented)  

---

## 9. Accessibility

⚠️ No `accessibilityLabel` props on interactive elements  
⚠️ Emoji used as icons throughout (tabs, status badges) — screen readers will read emoji literally  
⚠️ No `accessibilityRole` on TouchableOpacity buttons  

---

## 10. Overall Mobile UX Score

| Area | Score | Notes |
|---|---|---|
| Visual design | 8/10 | Dark glassmorphic design is clean and modern |
| Navigation structure | 7/10 | Good tab structure; match mode too deep |
| Touch targets | 6/10 | RSVP buttons tight; back button too small |
| Form UX | 5/10 | Date/time text inputs are a significant pain point |
| Match-side usage | 4/10 | Too many steps to record a goal; not match-day ready |
| Loading/error states | 6/10 | Spinners present; no skeletons or error boundaries |
| Accessibility | 3/10 | No labels, no roles |
| Offline UX | 4/10 | Cache read-only; writes fail silently offline |

**Overall: 5.4/10 — functional but not match-day ready**

The app is visually well-designed and structurally sound. The primary mobile UX issues are:
1. Date/time text inputs (should be pickers)
2. Too many taps to record a match event during live play
3. No real-time running score from timeline events
