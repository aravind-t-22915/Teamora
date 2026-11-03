# Existing System Audit
**Teamora — FC Revelation Football Team Management App**
**Audit Date:** 2026-09-04

---

## 1. Technology Stack

**Frontend:**
- Expo ~57.0.7 (React Native 0.86.0)
- TypeScript ~6.0.3
- React 19.2.3
- NativeWind v4.2.6 (Tailwind CSS for React Native)
- React Navigation v7 (Bottom Tabs + Native Stack)
- React Hook Form v7 + Zod v4 (form management + validation)
- React Query (TanStack) v5 + AsyncStorage persister (server state + offline cache)
- Zustand v5 (global UI/auth state)
- victory-native v41 (charts)
- react-native-reanimated v4 + react-native-gesture-handler v2 (animations)
- react-native-calendars v1.1314.0
- react-native-maps v1.27.2 (map display)
- date-fns v4 (date formatting)
- expo-notifications v57 (push notifications)
- expo-image-picker + expo-image-manipulator (photo upload)
- expo-blur (glassmorphic effects)

**Backend:**
- No dedicated backend server
- All logic runs client-side via Firebase SDK
- Firebase Firestore (primary database, real-time)
- Firebase Auth (authentication)
- Firebase Storage (image/file uploads)
- Expo push notification infrastructure (token registration only — no actual server sending)

**Database:**
- Cloud Firestore (NoSQL, Firebase)
- 12 collections: clubs, users, groups, events, attendance, comments, reports, playerStats, matchData, gallery, notifications, clubSettings
- Plus: matchResults (hardcoded, not in COLLECTIONS constant)

**Authentication:**
- Firebase Authentication (Email/Password only)
- Role-based access control (RBAC): coach, assistant_coach, manager, player
- Permission system in authStore (24 permissions)
- Firebase Auth persistence via AsyncStorage (with fallback)
- Player approval workflow (pending → active status)

**Hosting:**
- EAS (Expo Application Services) configured (eas.json exists)
- Targeting Android (package: com.teamora.fcrevalation) + iOS
- Firebase project: teamora-d1a4e (Spark/free tier assumed)

**Storage:**
- Firebase Storage (images compressed before upload via expo-image-manipulator)
- Max 1200×1200px, 75% quality, 400px thumbnails

**Testing:**
- NONE — zero test files exist anywhere in the project

**Other Key Dependencies:**
- react-native-paper v5 (installed but not used — dead dependency)
- expo-location v57 (installed but no location code found in src/)
- react-native-svg v15 (used by victory-native)
- @tanstack/react-query-persist-client (offline persistence)

---

## 2. Existing Features

| Feature | Status | Evidence | Quality | Notes |
|---|---|---|---|---|
| App shell / navigation | Complete | App.tsx, RootNavigator, MainTabNavigator, all stacks | Good | 5-tab bottom nav, all stacks wired |
| Splash Screen | Complete | SplashScreen.tsx | Good | |
| Welcome Screen | Complete | WelcomeScreen.tsx | Good | |
| Login | Complete | LoginScreen.tsx, auth.service.ts | Good | Zod validation, Firebase Auth |
| Register (Coach) | Complete | RegisterScreen.tsx | Partial | Club name hardcoded to "FC Revelation" |
| Register (Player / Invite code) | Complete | JoinClubScreen.tsx, auth.service.ts registerPlayer | Good | Invite code flow works |
| Profile Setup | Complete | ProfileSetupScreen.tsx | Good | |
| Auth state persistence | Partial | firebase.ts (dynamic require hack) | Needs Work | Try/catch fallback may break persistence on Firebase v12 |
| Role-based permissions | Complete | authStore.ts, usePermissions pattern | Good | 4 roles, 24 permissions |
| Player approval flow | Complete | PendingApprovalsScreen, squadService.approvePlayer | Good | |
| Home screen | Partial | HomeScreen.tsx | Needs Work | Stats banner hardcoded (0,0,0), announcements empty state only |
| Events list | Complete | EventsListScreen.tsx | Good | |
| Create Event | Complete | CreateEventScreen.tsx | Partial | Date is text input (YYYY-MM-DD), no date picker |
| Edit Event | Complete | EditEventScreen.tsx | Good | |
| Event Detail | Complete | EventDetailScreen.tsx | Good | Tabbed: overview, attendance, comments, gallery |
| Event cancellation | Complete | updateEvent with status='cancelled' | Good | |
| Delete Event | Complete | EventDetailScreen, useDeleteEvent | Good | Confirmation dialog |
| Attendance (RSVP) | Complete | attendance.service.ts, hooks | Good | Transactional updates, 5 statuses |
| Real-time attendance | Complete | subscribeMyAttendance | Good | Live listener |
| Attendance counts on events | Complete | attendanceService (transaction) | Good | Atomic inc/dec |
| Attendance tab (list by status) | Complete | EventDetailScreen attendance tab | Good | |
| Calendar screen | Complete | CalendarScreen.tsx | Good | react-native-calendars |
| Squad screen | Complete | SquadScreen.tsx | Good | Search, position filter, role badges |
| Player profile screen | Complete | PlayerProfileScreen.tsx | Partial | Stats display unknown quality |
| Groups screen | Complete | GroupsScreen.tsx | Good | |
| Group detail screen | Complete | GroupDetailScreen.tsx | Good | |
| Pending approvals | Complete | PendingApprovalsScreen.tsx | Good | |
| Match management | Complete | EventDetailScreen (match tools section) | Good | Lineup, Timeline, Ratings, Report, Result buttons |
| Lineup builder | Complete | LineupBuilderScreen.tsx | Good | Formation selector, starting/bench list |
| Timeline editor | Complete | TimelineEditorScreen.tsx | Good | Goal, cards, subs, HT/FT + player picker |
| Match result entry | Complete | MatchResultScreen.tsx | Good | Scorers, assists, cards, MOTM, notes |
| Player ratings | Complete | PlayerRatingScreen.tsx | Good | |
| Match report writer | Complete | ReportWriterScreen.tsx | Good | |
| Statistics screen | Partial | StatisticsScreen.tsx | **BROKEN** | **Stats always 0** — no code populates playerStats from events |
| Season overview (W/D/L) | Partial | StatisticsScreen, derived from events | Good | Correct for completed matches |
| Top scorers leaderboard | Partial | useTopScorers, statsService | **BROKEN** | All zeros — playerStats never updated |
| Gallery | Partial | GalleryScreen, gallery.service.ts, storage.service.ts | Partial | Upload code exists, integration may be incomplete |
| Photo upload + compression | Complete | storage.service.ts | Good | 1200px, 75% quality |
| Gallery viewer | Complete | MediaViewerScreen.tsx | Good | |
| Comments | Complete | comment.service.ts, CommentsList.tsx | Good | Like, delete |
| Push notification token | Complete | notification.service.ts | Good | Token saved to user doc |
| Push notification delivery | Missing | — | **MISSING** | No server/Cloud Function sends pushes |
| Local notification reminders | Complete | notificationService.scheduleLocalReminder | Good | Scheduled via Expo |
| Notification history screen | Complete | NotificationsScreen.tsx | Good | |
| Profile screen | Partial | ProfileScreen.tsx | Partial | Shows basic info, no stats, no photo |
| Edit profile | Complete | EditProfileScreen.tsx | Good | |
| Settings screen | Complete | SettingsScreen.tsx | Good | Theme toggle, notification prefs |
| Firestore security rules | Complete | firestore.rules | Good | Comprehensive RBAC rules |
| Offline cache | Partial | queryClient.ts, PersistQueryClientProvider | Partial | React Query persistence wired, no mutation queue |
| Dark theme / design system | Complete | theme.ts | Good | Glassmorphic, consistent |
| Player statistics calculation | Missing | — | **CRITICAL BUG** | timeline events and match results never update playerStats |
| Training attendance tracking | Partial | Reuses events attendance system | Good | Architecture is correct |
| Photo profile pictures | Missing | — | Missing | No code for user avatar upload |
| Data export / backup | Missing | — | Missing | No CSV/JSON export |
| PWA | Missing | — | Missing | Mobile app only (no web build configured) |

---

## 3. Services Implemented

All planned services exist with real implementations:

| Service | Status | Notes |
|---|---|---|
| auth.service.ts | Complete | Coach + player registration, login, logout |
| user.service.ts | Complete | CRUD + approvePlayer (deleteDoc on reject — inconsistency with squadService) |
| event.service.ts | Complete | Full CRUD + real-time subscription |
| attendance.service.ts | Complete | Transactional RSVP with count maintenance |
| matchData.service.ts | Complete | Lineup, timeline, ratings, MOTM, match stats |
| matchResult.service.ts | Complete | Full result entry with outcome calculation |
| stats.service.ts | Partial | Service exists but **never called from match flow** |
| gallery.service.ts | Complete | Upload metadata, like, highlight, delete |
| storage.service.ts | Complete | Firebase Storage upload with compression |
| notification.service.ts | Partial | Token registration + local reminders; no push sending |
| comment.service.ts | Complete | |
| group.service.ts | Complete | |
| report.service.ts | Complete | |
| squad.service.ts | Complete | |

---

## 4. Navigation Structure

All navigators implemented and wired:

- RootNavigator → AuthNavigator or AppNavigator based on auth state
- AuthNavigator → Splash, Welcome, Login, Register, JoinClub, ProfileSetup
- AppNavigator → MainTabNavigator + modal screens (Statistics, GalleryViewer)
- MainTabNavigator → HomeStack, CalendarStack, EventsStack, SquadStack, ProfileStack
- EventsStack → EventsList, EventDetail, CreateEvent, EditEvent, Gallery, MatchResult, LineupBuilder, TimelineEditor, PlayerRating, ReportWriter, AvailabilityPoll
- SquadStack → Squad, PlayerProfile, Groups, GroupDetail, PendingApprovals
- ProfileStack → Profile, EditProfile, Settings, Notifications

Deep links configured (linking.ts) for `teamora://` scheme.

---

## 5. What Is NOT Implemented

- Statistics auto-calculation (CRITICAL GAP — no link between events/results and playerStats)
- Actual push notification delivery (only token saved; no server sends the push)
- Player profile photo upload (storage service exists but no UI for it)
- Home screen live W/D/L stats (hardcoded zeros)
- Offline mutation queue (reads cached; writes fail when offline)
- Data export / backup
- Season management UI (SEASON hardcoded in constants.ts as "2025-2026")
- Club logo upload
- Club invite code display for coach
- Group-targeted event notifications
- Automated test suite (0 tests)
- Minutes played calculation from substitutions
- Training-specific attendance summary separate from general events

---

## 6. Key Technical Observations

1. **Firebase v12 compatibility**: The dynamic require hack for `getReactNativePersistence` suggests Firebase v12 changed auth import paths. This should be verified and fixed properly.

2. **COLLECTIONS constant not used for matchResults**: `matchResultService` hardcodes `'matchResults'` instead of using `COLLECTIONS.MATCH_RESULTS`. Minor inconsistency.

3. **Club name hardcoded**: `RegisterScreen` passes `CLUB_NAME` constant ("FC Revelation") to `registerCoach()`. Every new coach creates a club with this same name. Should be a user input field.

4. **react-native-paper installed but unused**: Adds ~2MB to bundle for no value.

5. **expo-location installed but unused**: Add to bundle with no benefit.

6. **userInterfaceStyle: "light" in app.json**: Conflicts with the dark design. Status bar behavior will be wrong on some devices.

7. **userService.rejectPlayer deletes the user document**: `squadService.rejectPlayer` sets status to 'suspended'. These two services are inconsistent.
