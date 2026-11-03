# Teamora — Complete Product Blueprint
### Amateur Football Team Management App
**Team:** FC Revelation | **Version:** 1.0 | **Date:** July 2026

---

## Table of Contents

1. [Product Requirement Document (PRD)](#1-product-requirement-document)
2. [User Flow](#2-user-flow)
3. [Information Architecture](#3-information-architecture)
4. [Navigation Structure](#4-navigation-structure)
5. [Firestore Schema](#5-firestore-schema)
6. [Folder Structure](#6-folder-structure)
7. [Component Tree](#7-component-tree)
8. [Screen Wireframes](#8-screen-wireframes)
9. [UI Design System](#9-ui-design-system)
10. [API Layer](#10-api-layer)
11. [State Management](#11-state-management)
12. [Development Roadmap](#12-development-roadmap)
13. [Coding Standards](#13-coding-standards)

---

# 1. Product Requirement Document

## 1.1 Executive Summary

**Teamora** is a mobile-first team management platform designed exclusively for amateur football clubs. It replaces fragmented WhatsApp communication with a structured, beautiful, and intelligent team hub. Everything is organized around **Events** — the atomic unit of team activity.

---

## 1.2 Problem Statement

| Current Pain | Impact |
|---|---|
| All communication in WhatsApp groups | Zero structure, infinite scroll |
| 👍 reactions used for attendance | No real data, no history |
| Announcements buried after days | Players miss practice times |
| No historical match records | No player growth tracking |
| No player statistics | No motivation, no accountability |
| Photos scattered across phones | No team memories |
| No squad management | Coach cannot target groups |

---

## 1.3 Solution Overview

Teamora replaces WhatsApp for team management by providing:

- **Structured Events** — Every activity is a proper record
- **Smart Attendance** — Going / Maybe / Not Going / Late / Need Pickup
- **Group Targeting** — Notify only the relevant squad
- **Match Intelligence** — Lineup, timeline, stats, reports
- **Player Profiles** — Performance history and growth
- **Team Statistics** — Leaderboards and season data
- **Persistent Gallery** — Photos and highlights by event
- **Push Notifications** — Right person, right time

---

## 1.4 Target Users

### Coach
Primary admin. Creates and manages everything.
- Full CRUD on all events
- Player approval and removal
- Group creation and management
- Match report authoring
- Statistics and attendance overview
- Notification broadcasting

### Assistant Coach
Secondary admin with partial permissions.
- Create / edit events (cannot delete)
- Manage attendance
- Add match timeline events
- View all statistics

### Manager
Administrative role.
- Create announcements and payment events
- View all statistics
- Manage player registrations
- Cannot edit match data

### Player
Standard member.
- View all events they are invited to
- Confirm attendance
- Comment on events
- View personal statistics
- Update own profile
- View gallery

---

## 1.5 Core Feature Modules

### Module 1 — Authentication
- Email / Password signup
- Invitation code to join club
- Role assignment by coach
- Profile setup on first login
- Biometric login (optional)

### Module 2 — Events
- Universal event creation
- 12 event types with type-specific fields
- Date / Time / Venue / Map
- Weather placeholder
- Attendance tracking
- Gallery per event
- Comments per event
- Coach notes (private)
- Push notification on create/update

### Module 3 — Calendar
- Month / Week / Agenda views
- Color-coded by event type
- Tap to see event details
- Create event from calendar tap

### Module 4 — Match Intelligence
- Pre-match: Lineup selection, attendance confirm
- Live (manual): Timeline events entry
- Post-match: Result, stats, report, gallery
- MOTM award
- Individual player ratings

### Module 5 — Groups
- Unlimited named groups
- Players in multiple groups
- Events targeted to groups
- Group-scoped notifications

### Module 6 — Player Profiles
- Bio data (position, foot, height, weight)
- Jersey number
- Emergency contact
- Season statistics
- Attendance percentage
- Performance graph
- Award history

### Module 7 — Statistics
- Club-level season stats
- Individual player stats
- Top scorer, assists, MOTM leaderboards
- Attendance leaderboard
- Match history with results

### Module 8 — Reports
- Rich text match reports by coach
- Sections: Summary, Strengths, Weaknesses, Next Focus
- Individual player feedback
- Archived permanently

### Module 9 — Gallery
- Photo upload per event
- Video upload per event
- View by event or all-gallery
- Pinch to zoom viewer

### Module 10 — Notifications
- Practice reminders (day before, 2 hours before)
- Match reminders (day before)
- Venue / time change alerts
- New report published
- New announcement
- Payment deadline reminders
- RSVP reminders for non-responders

### Module 11 — Profile & Settings
- Edit profile photo and bio
- Dark / Light theme toggle
- Notification preferences
- Privacy settings
- Club information
- Logout

---

## 1.6 Non-Functional Requirements

| Requirement | Target |
|---|---|
| App startup time | < 2 seconds |
| Event list load | < 1 second |
| Image upload feedback | Progress indicator |
| Offline support | Last 30 events cached |
| Push notification delivery | < 5 seconds |
| Firebase Free Tier | Must stay within limits |
| TypeScript coverage | 100% |
| Screen accessibility | Basic ARIA labels |

---

## 1.7 Firebase Free Tier Limits (Reference)

| Service | Free Limit | Strategy |
|---|---|---|
| Firestore reads | 50,000/day | Pagination, caching |
| Firestore writes | 20,000/day | Batch writes |
| Storage | 5 GB | Compress images before upload |
| Auth users | Unlimited | — |
| Functions | Not used | Client-side logic |
| Hosting | Not used | Mobile only |

---

# 2. User Flow

## 2.1 Onboarding Flow

```
App Launch
    │
    ▼
Splash Screen (2s)
    │
    ├─── First Time ──► Welcome Screen
    │                       │
    │              ┌────────┴────────┐
    │              ▼                 ▼
    │         Create Account    Join with Code
    │              │                 │
    │         Email + Pass      Enter Club Code
    │              │                 │
    │         Profile Setup     Profile Setup
    │              │                 │
    │         (Coach creates    (Player waits
    │          club auto)        for approval)
    │              │                 │
    │              └────────┬────────┘
    │                       ▼
    │               Dashboard (Home)
    │
    └─── Returning ──► Auto Login ──► Dashboard
```

## 2.2 Coach — Create Event Flow

```
Home Screen
    │
    ▼
Tap [ + ] FAB
    │
    ▼
Select Event Type
(Practice / Match / Tournament / etc.)
    │
    ▼
Event Creation Form
    ├── Title
    ├── Description
    ├── Date + Time Picker
    ├── Venue Name
    ├── Map Location Picker (OpenStreetMap)
    ├── Select Target Groups
    ├── Coach Notes (private)
    ├── Enable Notifications toggle
    │
    ▼
Review Event Card
    │
    ▼
Publish ──► Firestore write ──► Push notifications sent
    │
    ▼
Event Detail Screen
```

## 2.3 Player — Attendance Flow

```
Push Notification: "Practice Tomorrow 6pm"
    │
    ▼
Tap Notification
    │
    ▼
Event Detail Screen
    │
    ▼
Attendance Section
    ├── Going ✓
    ├── Maybe ?
    ├── Not Going ✗
    ├── Late ⏰
    └── Need Pickup 🚗
    │
    ▼
Tap response ──► Firestore write
    │
    ▼
Coach sees update in real-time
Coach attendance summary updates
```

## 2.4 Coach — Post Match Flow

```
Match Event Detail
    │
    ▼
[ Enter Result ] button
    ├── Home Goals
    └── Away Goals
    │
    ▼
[ Add Timeline ]
    ├── Goal (player, minute)
    ├── Yellow Card
    ├── Red Card
    ├── Substitution (on/off, minute)
    ├── Half Time
    └── Full Time
    │
    ▼
[ Edit Lineup ]
    ├── Starting 11
    ├── Substitutes
    └── Formation picker
    │
    ▼
[ Rate Players ]
    └── 1-10 slider per player
    │
    ▼
[ Select MOTM ]
    │
    ▼
[ Write Report ]
    ├── Summary
    ├── Strengths
    ├── Weaknesses
    ├── Next Focus
    └── Per-player notes
    │
    ▼
[ Upload Gallery ]
    └── Photos / Videos
    │
    ▼
Match Complete ──► Stats updated ──► Season leaderboard updated
```

## 2.5 Player Join Flow

```
Player Downloads App
    │
    ▼
"Join a Club"
    │
    ▼
Enter Club Invite Code (6-digit)
    │
    ▼
Club found ──► Request sent to Coach
    │
    ▼
Coach receives notification: "John Doe wants to join"
    │
    ├── Approve ──► Player gets access, assigned to "Everyone" group
    └── Reject  ──► Player notified
```

---

# 3. Information Architecture

```
TEAMORA
│
├── AUTH
│   ├── Splash
│   ├── Welcome
│   ├── Login
│   ├── Register
│   ├── Join Club (invite code)
│   └── Profile Setup
│
├── MAIN APP
│   │
│   ├── HOME (Feed)
│   │   ├── Upcoming Events List
│   │   ├── Attendance Summary Cards
│   │   ├── Recent Announcements
│   │   └── Quick Stats Banner
│   │
│   ├── CALENDAR
│   │   ├── Month View
│   │   ├── Week View
│   │   ├── Agenda View
│   │   └── Event Detail (tap)
│   │
│   ├── EVENTS
│   │   ├── Events List (filterable)
│   │   ├── Event Detail
│   │   │   ├── Overview Tab
│   │   │   ├── Attendance Tab
│   │   │   ├── Comments Tab
│   │   │   └── Gallery Tab
│   │   │       (Match events also have:)
│   │   │       ├── Lineup Tab
│   │   │       ├── Timeline Tab
│   │   │       ├── Statistics Tab
│   │   │       └── Report Tab
│   │   └── Create / Edit Event (Coach only)
│   │
│   ├── SQUAD
│   │   ├── Player List
│   │   ├── Player Profile
│   │   │   ├── Bio
│   │   │   ├── Stats
│   │   │   ├── Attendance
│   │   │   ├── Awards
│   │   │   └── Performance Graph
│   │   ├── Groups
│   │   │   ├── Group List
│   │   │   ├── Group Detail
│   │   │   └── Create / Edit Group (Coach only)
│   │   └── Pending Approvals (Coach only)
│   │
│   ├── STATISTICS
│   │   ├── Season Overview
│   │   ├── Top Scorers
│   │   ├── Top Assists
│   │   ├── Most MOTM
│   │   ├── Attendance Leaders
│   │   ├── Clean Sheets
│   │   └── Match History
│   │
│   ├── GALLERY
│   │   ├── All Photos (chronological)
│   │   ├── By Event
│   │   └── Photo / Video Viewer
│   │
│   └── PROFILE
│       ├── My Profile
│       ├── Edit Profile
│       ├── Notification Settings
│       ├── Theme Toggle
│       ├── Privacy Settings
│       ├── Club Info
│       └── Logout
│
└── COACH TOOLS (overlay/modal flows)
    ├── Attendance Manager (per event)
    ├── Report Writer
    ├── Lineup Builder
    ├── Timeline Editor
    ├── Player Rating
    └── Push Notification Composer
```

---

# 4. Navigation Structure

## 4.1 Stack Overview

```
RootNavigator (Stack)
│
├── AuthStack (Stack)
│   ├── SplashScreen
│   ├── WelcomeScreen
│   ├── LoginScreen
│   ├── RegisterScreen
│   ├── JoinClubScreen
│   └── ProfileSetupScreen
│
└── AppStack (Stack)
    │
    ├── MainTabNavigator (Bottom Tabs — 5 tabs)
    │   ├── Tab 1: HomeStack
    │   │   └── HomeScreen
    │   ├── Tab 2: CalendarStack
    │   │   ├── CalendarScreen
    │   │   └── EventDetailScreen
    │   ├── Tab 3: EventsStack
    │   │   ├── EventsListScreen
    │   │   ├── EventDetailScreen
    │   │   └── CreateEventScreen (Coach)
    │   ├── Tab 4: SquadStack
    │   │   ├── SquadScreen
    │   │   ├── PlayerProfileScreen
    │   │   ├── GroupsScreen
    │   │   └── GroupDetailScreen
    │   └── Tab 5: ProfileStack
    │       ├── ProfileScreen
    │       ├── EditProfileScreen
    │       └── SettingsScreen
    │
    └── ModalStack (presented as modal)
        ├── AttendanceManagerScreen
        ├── ReportWriterScreen
        ├── LineupBuilderScreen
        ├── TimelineEditorScreen
        ├── PlayerRatingScreen
        ├── GalleryViewerScreen
        ├── StatisticsScreen
        └── NotificationComposerScreen
```

## 4.2 Bottom Tab Bar Design

```
┌─────────────────────────────────────────────┐
│                                             │
│  ⚽️ Home   📅 Calendar  🗓 Events           │
│  👥 Squad   👤 Profile                      │
│                                             │
│  [●]   [ ]     [+]     [ ]   [ ]            │
│  Home  Cal   (FAB)   Squad  Profile         │
└─────────────────────────────────────────────┘
```

- Center FAB (floating action button) opens "Create Event" for Coach
- Active tab uses green accent color
- Inactive tabs use muted gray

## 4.3 Deep Link Map

```
teamora://event/:eventId
teamora://player/:playerId
teamora://group/:groupId
teamora://calendar/:date
teamora://notification/:notificationId
```

---

# 5. Firestore Schema

## 5.1 Collections Overview

```
Firestore Root
│
├── clubs/
├── users/
├── groups/
├── events/
├── attendance/
├── comments/
├── reports/
├── playerStats/
├── matchData/
├── gallery/
├── notifications/
└── clubSettings/
```

---

## 5.2 clubs Collection

```typescript
// /clubs/{clubId}
{
  clubId: string;                    // Auto-generated
  name: string;                      // "FC Revelation"
  slug: string;                      // "fc-revelation"
  inviteCode: string;                // 6-char code e.g. "REV123"
  logoUrl: string;
  primaryColor: string;              // "#22C55E"
  founded: Timestamp;
  homeVenue: string;
  city: string;
  country: string;
  adminIds: string[];                // Coach user IDs
  memberCount: number;
  season: string;                    // "2025-2026"
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

---

## 5.3 users Collection

```typescript
// /users/{userId}
{
  userId: string;                    // Firebase Auth UID
  clubId: string;
  email: string;
  displayName: string;
  firstName: string;
  lastName: string;
  photoUrl: string;
  role: 'coach' | 'assistant_coach' | 'manager' | 'player';
  status: 'pending' | 'active' | 'suspended';

  // Football profile
  position: 'goalkeeper' | 'defender' | 'midfielder' | 'forward' | 'unassigned';
  preferredFoot: 'left' | 'right' | 'both';
  jerseyNumber: number | null;
  height: number | null;            // cm
  weight: number | null;            // kg
  dateOfBirth: Timestamp | null;

  // Contact
  phone: string;
  emergencyContactName: string;
  emergencyContactPhone: string;

  // Meta
  groupIds: string[];               // Groups this player belongs to
  joinedClubAt: Timestamp;
  lastActiveAt: Timestamp;
  fcmToken: string;                 // Push notification token
  notificationPreferences: {
    practiceReminder: boolean;
    matchReminder: boolean;
    venueChange: boolean;
    newReport: boolean;
    newAnnouncement: boolean;
    paymentReminder: boolean;
    attendanceReminder: boolean;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

---

## 5.4 groups Collection

```typescript
// /groups/{groupId}
{
  groupId: string;
  clubId: string;
  name: string;                     // "Tournament Squad"
  description: string;
  color: string;                    // For UI display
  emoji: string;                    // "⚽️"
  memberIds: string[];              // User IDs
  memberCount: number;
  createdBy: string;                // Coach userId
  isDefault: boolean;               // True for "Everyone"
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

---

## 5.5 events Collection

```typescript
// /events/{eventId}
{
  eventId: string;
  clubId: string;

  // Core
  type: EventType;                  // See enum below
  title: string;
  description: string;
  status: 'scheduled' | 'live' | 'completed' | 'cancelled' | 'postponed';

  // Time
  date: Timestamp;
  startTime: string;                // "18:00"
  endTime: string;                  // "20:00"
  allDay: boolean;

  // Location
  venueName: string;
  venueAddress: string;
  coordinates: {
    lat: number;
    lng: number;
  } | null;

  // Match-specific
  isMatch: boolean;
  opponent: string | null;
  competition: string | null;       // "Sunday League Division 1"
  isHomeGame: boolean | null;
  result: {
    homeGoals: number;
    awayGoals: number;
    outcome: 'win' | 'loss' | 'draw' | null;
  } | null;

  // Targeting
  targetGroups: string[];           // Group IDs, empty = everyone
  visibleToAll: boolean;

  // Content
  coachNotes: string;               // Private, coach-only
  weatherPlaceholder: string;       // "Sunny, 22°C" — manually set
  coverImageUrl: string | null;

  // Counts (denormalized for performance)
  attendanceCount: {
    going: number;
    maybe: number;
    notGoing: number;
    late: number;
    needPickup: number;
    noResponse: number;
  };
  commentCount: number;
  galleryCount: number;

  // Notifications
  notificationsEnabled: boolean;
  notificationSentAt: Timestamp | null;

  // Meta
  createdBy: string;               // Coach userId
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// EventType enum
type EventType =
  | 'practice'
  | 'practice_match'
  | 'league_match'
  | 'tournament_match'
  | 'friendly_match'
  | 'meeting'
  | 'recovery_session'
  | 'gym_session'
  | 'announcement'
  | 'payment_deadline'
  | 'birthday';
```

---

## 5.6 attendance Collection

```typescript
// /attendance/{attendanceId}
// attendanceId = `${eventId}_${userId}`
{
  attendanceId: string;
  eventId: string;
  userId: string;
  clubId: string;
  displayName: string;             // Denormalized
  photoUrl: string;                // Denormalized
  position: string;                // Denormalized

  status: 'going' | 'maybe' | 'not_going' | 'late' | 'need_pickup' | 'no_response';
  note: string;                    // Optional: "I'll be 10 mins late"

  respondedAt: Timestamp | null;
  updatedAt: Timestamp;
}
```

---

## 5.7 comments Collection

```typescript
// /comments/{commentId}
{
  commentId: string;
  eventId: string;
  clubId: string;
  userId: string;
  displayName: string;             // Denormalized
  photoUrl: string;                // Denormalized
  text: string;
  likes: string[];                 // Array of userIds who liked
  likeCount: number;
  isCoachNote: boolean;            // Pinned coach comment
  editedAt: Timestamp | null;
  createdAt: Timestamp;
}
```

---

## 5.8 reports Collection

```typescript
// /reports/{reportId}
{
  reportId: string;
  eventId: string;
  clubId: string;
  matchTitle: string;              // Denormalized
  matchDate: Timestamp;            // Denormalized
  author: string;                  // userId

  // Report sections
  summary: string;
  strengths: string;
  weaknesses: string;
  nextFocus: string;

  // Player-specific feedback
  playerFeedback: {
    [userId: string]: {
      displayName: string;         // Denormalized
      note: string;
      rating: number;              // 1-10
    };
  };

  isPublished: boolean;
  publishedAt: Timestamp | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

---

## 5.9 playerStats Collection

```typescript
// /playerStats/{statsId}
// statsId = `${userId}_${season}`
{
  statsId: string;
  userId: string;
  clubId: string;
  season: string;                  // "2025-2026"
  displayName: string;             // Denormalized

  // Offensive
  goals: number;
  assists: number;
  shots: number;
  shotsOnTarget: number;

  // Discipline
  yellowCards: number;
  redCards: number;

  // Appearances
  appearances: number;
  starts: number;
  substitutions: number;
  minutesPlayed: number;

  // Goalkeeper
  cleanSheets: number;
  savesMade: number;

  // Awards
  motmCount: number;
  motmEvents: string[];            // eventIds

  // Attendance
  totalInvited: number;
  totalAttended: number;           // "going" + "late"
  attendanceRate: number;          // Percentage 0-100

  // Ratings
  averageRating: number;           // 0-10
  ratingCount: number;

  updatedAt: Timestamp;
}
```

---

## 5.10 matchData Collection

```typescript
// /matchData/{matchId}
// matchId = eventId (1:1 relationship)
{
  matchId: string;                 // Same as eventId
  clubId: string;

  // Formation
  formation: string;               // "4-3-3"

  // Lineup
  startingLineup: LineupPlayer[];
  substitutes: LineupPlayer[];
  unavailable: string[];           // userIds

  // Timeline
  timeline: TimelineEvent[];

  // Match stats
  stats: {
    home: MatchStatsData;
    away: MatchStatsData;
  };

  // Awards
  motm: string | null;             // userId

  updatedAt: Timestamp;
}

interface LineupPlayer {
  userId: string;
  displayName: string;
  jerseyNumber: number;
  position: string;
  positionIndex: number;           // Grid position on pitch
  isCaptain: boolean;
  rating: number | null;           // Post-match rating
}

interface TimelineEvent {
  id: string;
  minute: number;
  type: 'goal' | 'yellow_card' | 'red_card' | 'substitution' | 'half_time' | 'full_time' | 'kickoff';
  playerId: string | null;
  playerName: string | null;
  assistId: string | null;
  assistName: string | null;
  substituteInId: string | null;
  substituteOutId: string | null;
  isOwnGoal: boolean;
  isPenalty: boolean;
  note: string;
}

interface MatchStatsData {
  possession: number;
  shots: number;
  shotsOnTarget: number;
  corners: number;
  fouls: number;
  offsides: number;
  yellowCards: number;
  redCards: number;
}
```

---

## 5.11 gallery Collection

```typescript
// /gallery/{mediaId}
{
  mediaId: string;
  eventId: string;
  clubId: string;
  uploadedBy: string;              // userId
  uploaderName: string;            // Denormalized

  type: 'photo' | 'video';
  url: string;                     // Firebase Storage URL
  thumbnailUrl: string;            // Compressed thumbnail
  caption: string;
  width: number;
  height: number;
  fileSize: number;                // bytes

  isHighlight: boolean;            // Featured media
  likes: string[];                 // userIds
  likeCount: number;

  createdAt: Timestamp;
}
```

---

## 5.12 notifications Collection

```typescript
// /notifications/{notificationId}
{
  notificationId: string;
  clubId: string;
  targetUserIds: string[];         // Empty = all members
  targetGroupIds: string[];

  type: NotificationType;
  title: string;
  body: string;
  data: {                          // Deep link payload
    screen: string;
    params: Record<string, string>;
  };

  sentAt: Timestamp;
  readBy: string[];                // userIds who read it
  createdBy: string;               // userId
}

type NotificationType =
  | 'practice_reminder'
  | 'match_reminder'
  | 'venue_changed'
  | 'time_changed'
  | 'new_report'
  | 'new_announcement'
  | 'payment_reminder'
  | 'tournament_reminder'
  | 'attendance_reminder'
  | 'join_request'
  | 'join_approved'
  | 'join_rejected';
```

---

## 5.13 clubSettings Collection

```typescript
// /clubSettings/{clubId}
{
  clubId: string;
  season: string;
  defaultEventReminder: number;    // Hours before event
  allowPlayerComments: boolean;
  allowPlayerGalleryUpload: boolean;
  requireAttendanceConfirm: boolean;
  attendanceDeadlineHours: number; // Hours before event
  publicProfile: boolean;
  timezone: string;                // "Europe/London"
  currency: string;                // "GBP"
  updatedAt: Timestamp;
}
```

---

## 5.14 Firestore Security Rules (Strategy)

```
Rules Design:
- All reads/writes require authentication
- clubId must match user's clubId from their user document
- Only coaches can write to events, reports, matchData
- Players can only write their own attendance record
- Players can only write their own comments
- Gallery uploads: Coach always, Players if clubSettings.allowPlayerGalleryUpload
- playerStats: Write only via server-side logic (Coach only)
- Attendance reads: Coach sees all, Player sees only their own
```

---

## 5.15 Firestore Index Requirements

```
events: clubId + date (ASC)
events: clubId + type + date
events: clubId + status + date
attendance: eventId + status
attendance: userId + clubId
playerStats: clubId + season + goals (DESC)
playerStats: clubId + season + motmCount (DESC)
playerStats: clubId + season + attendanceRate (DESC)
comments: eventId + createdAt (ASC)
gallery: eventId + createdAt (DESC)
gallery: clubId + createdAt (DESC)
notifications: targetUserIds + sentAt (DESC)
```

---

# 6. Folder Structure

```
teamora/
│
├── app.json
├── babel.config.js
├── tsconfig.json
├── tailwind.config.js
├── package.json
├── .env
├── .env.example
│
├── assets/
│   ├── fonts/
│   │   └── Inter/
│   ├── images/
│   │   ├── logo.png
│   │   ├── splash.png
│   │   └── placeholder-avatar.png
│   └── icons/
│
├── src/
│   │
│   ├── config/
│   │   ├── firebase.ts             # Firebase initialization
│   │   ├── queryClient.ts          # React Query setup
│   │   └── constants.ts            # App-wide constants
│   │
│   ├── types/
│   │   ├── index.ts                # Re-exports
│   │   ├── user.types.ts
│   │   ├── event.types.ts
│   │   ├── attendance.types.ts
│   │   ├── match.types.ts
│   │   ├── group.types.ts
│   │   ├── stats.types.ts
│   │   ├── gallery.types.ts
│   │   ├── notification.types.ts
│   │   └── navigation.types.ts
│   │
│   ├── schemas/                    # Zod validation schemas
│   │   ├── auth.schema.ts
│   │   ├── event.schema.ts
│   │   ├── player.schema.ts
│   │   ├── report.schema.ts
│   │   └── match.schema.ts
│   │
│   ├── services/                   # Firebase service layer
│   │   ├── auth.service.ts
│   │   ├── user.service.ts
│   │   ├── event.service.ts
│   │   ├── attendance.service.ts
│   │   ├── match.service.ts
│   │   ├── report.service.ts
│   │   ├── gallery.service.ts
│   │   ├── group.service.ts
│   │   ├── stats.service.ts
│   │   ├── notification.service.ts
│   │   ├── comment.service.ts
│   │   └── storage.service.ts
│   │
│   ├── repositories/               # Data access abstraction
│   │   ├── BaseRepository.ts
│   │   ├── UserRepository.ts
│   │   ├── EventRepository.ts
│   │   ├── AttendanceRepository.ts
│   │   ├── MatchRepository.ts
│   │   ├── ReportRepository.ts
│   │   ├── GalleryRepository.ts
│   │   ├── GroupRepository.ts
│   │   └── StatsRepository.ts
│   │
│   ├── hooks/                      # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useClub.ts
│   │   ├── useEvents.ts
│   │   ├── useEvent.ts
│   │   ├── useAttendance.ts
│   │   ├── useMatch.ts
│   │   ├── useGroups.ts
│   │   ├── usePlayers.ts
│   │   ├── usePlayerStats.ts
│   │   ├── useGallery.ts
│   │   ├── useNotifications.ts
│   │   ├── usePermissions.ts      # Role-based permission checks
│   │   ├── useImagePicker.ts
│   │   └── useOfflineSync.ts
│   │
│   ├── stores/                     # Zustand global state
│   │   ├── authStore.ts
│   │   ├── clubStore.ts
│   │   └── uiStore.ts
│   │
│   ├── navigation/
│   │   ├── RootNavigator.tsx
│   │   ├── AuthNavigator.tsx
│   │   ├── AppNavigator.tsx
│   │   ├── MainTabNavigator.tsx
│   │   ├── HomeStack.tsx
│   │   ├── CalendarStack.tsx
│   │   ├── EventsStack.tsx
│   │   ├── SquadStack.tsx
│   │   ├── ProfileStack.tsx
│   │   └── linking.ts             # Deep link config
│   │
│   ├── features/                  # Feature-based modules
│   │   │
│   │   ├── auth/
│   │   │   ├── screens/
│   │   │   │   ├── SplashScreen.tsx
│   │   │   │   ├── WelcomeScreen.tsx
│   │   │   │   ├── LoginScreen.tsx
│   │   │   │   ├── RegisterScreen.tsx
│   │   │   │   ├── JoinClubScreen.tsx
│   │   │   │   └── ProfileSetupScreen.tsx
│   │   │   ├── components/
│   │   │   │   ├── AuthInput.tsx
│   │   │   │   └── SocialButton.tsx
│   │   │   └── hooks/
│   │   │       └── useLoginForm.ts
│   │   │
│   │   ├── home/
│   │   │   ├── screens/
│   │   │   │   └── HomeScreen.tsx
│   │   │   └── components/
│   │   │       ├── UpcomingEventCard.tsx
│   │   │       ├── AttendanceSummaryBanner.tsx
│   │   │       ├── QuickStatsBanner.tsx
│   │   │       └── AnnouncementCard.tsx
│   │   │
│   │   ├── calendar/
│   │   │   ├── screens/
│   │   │   │   └── CalendarScreen.tsx
│   │   │   └── components/
│   │   │       ├── MonthView.tsx
│   │   │       ├── WeekView.tsx
│   │   │       ├── AgendaView.tsx
│   │   │       └── EventDot.tsx
│   │   │
│   │   ├── events/
│   │   │   ├── screens/
│   │   │   │   ├── EventsListScreen.tsx
│   │   │   │   ├── EventDetailScreen.tsx
│   │   │   │   └── CreateEventScreen.tsx
│   │   │   └── components/
│   │   │       ├── EventCard.tsx
│   │   │       ├── EventTypeBadge.tsx
│   │   │       ├── EventHeader.tsx
│   │   │       ├── AttendancePanel.tsx
│   │   │       ├── AttendanceButton.tsx
│   │   │       ├── AttendanceSummary.tsx
│   │   │       ├── CommentsList.tsx
│   │   │       ├── CommentInput.tsx
│   │   │       ├── EventGallery.tsx
│   │   │       ├── VenueMap.tsx
│   │   │       ├── WeatherBadge.tsx
│   │   │       └── CoachNotesPanel.tsx
│   │   │
│   │   ├── match/
│   │   │   ├── screens/
│   │   │   │   ├── MatchDetailScreen.tsx
│   │   │   │   ├── LineupBuilderScreen.tsx
│   │   │   │   ├── TimelineEditorScreen.tsx
│   │   │   │   ├── PlayerRatingScreen.tsx
│   │   │   │   └── ReportWriterScreen.tsx
│   │   │   └── components/
│   │   │       ├── MatchHeader.tsx
│   │   │       ├── MatchScoreboard.tsx
│   │   │       ├── MatchTabBar.tsx
│   │   │       ├── LineupPitch.tsx
│   │   │       ├── TimelineList.tsx
│   │   │       ├── TimelineEventItem.tsx
│   │   │       ├── MatchStatsBars.tsx
│   │   │       ├── PlayerRatingCard.tsx
│   │   │       ├── MOTMAward.tsx
│   │   │       └── FormationSelector.tsx
│   │   │
│   │   ├── squad/
│   │   │   ├── screens/
│   │   │   │   ├── SquadScreen.tsx
│   │   │   │   ├── PlayerProfileScreen.tsx
│   │   │   │   ├── GroupsScreen.tsx
│   │   │   │   ├── GroupDetailScreen.tsx
│   │   │   │   └── PendingApprovalsScreen.tsx
│   │   │   └── components/
│   │   │       ├── PlayerCard.tsx
│   │   │       ├── PlayerListItem.tsx
│   │   │       ├── PositionBadge.tsx
│   │   │       ├── GroupCard.tsx
│   │   │       ├── StatsGraph.tsx
│   │   │       └── AttendanceRing.tsx
│   │   │
│   │   ├── statistics/
│   │   │   ├── screens/
│   │   │   │   └── StatisticsScreen.tsx
│   │   │   └── components/
│   │   │       ├── SeasonOverviewCard.tsx
│   │   │       ├── LeaderboardList.tsx
│   │   │       ├── LeaderboardItem.tsx
│   │   │       ├── StatBarChart.tsx
│   │   │       └── WinRatePieChart.tsx
│   │   │
│   │   ├── gallery/
│   │   │   ├── screens/
│   │   │   │   ├── GalleryScreen.tsx
│   │   │   │   └── MediaViewerScreen.tsx
│   │   │   └── components/
│   │   │       ├── GalleryGrid.tsx
│   │   │       ├── MediaThumbnail.tsx
│   │   │       └── UploadButton.tsx
│   │   │
│   │   └── profile/
│   │       ├── screens/
│   │       │   ├── ProfileScreen.tsx
│   │       │   ├── EditProfileScreen.tsx
│   │       │   └── SettingsScreen.tsx
│   │       └── components/
│   │           ├── ProfileHeader.tsx
│   │           ├── StatCard.tsx
│   │           ├── NotificationToggle.tsx
│   │           └── ThemeToggle.tsx
│   │
│   └── components/                # Shared/atomic components
│       ├── ui/
│       │   ├── Button.tsx
│       │   ├── Input.tsx
│       │   ├── Card.tsx
│       │   ├── Badge.tsx
│       │   ├── Avatar.tsx
│       │   ├── Divider.tsx
│       │   ├── Tag.tsx
│       │   ├── Chip.tsx
│       │   ├── Modal.tsx
│       │   ├── BottomSheet.tsx
│       │   ├── Toast.tsx
│       │   ├── Spinner.tsx
│       │   ├── ProgressBar.tsx
│       │   └── EmptyState.tsx
│       ├── layout/
│       │   ├── Screen.tsx          # SafeAreaView wrapper
│       │   ├── Header.tsx
│       │   ├── TabBar.tsx
│       │   └── FAB.tsx
│       └── feedback/
│           ├── SkeletonLoader.tsx
│           ├── ErrorBoundary.tsx
│           ├── ErrorState.tsx
│           └── LoadingOverlay.tsx
│
└── __tests__/
    ├── services/
    ├── hooks/
    └── components/
```

---

# 7. Component Tree

## 7.1 App Root

```
<App>
  └── <QueryClientProvider>
        └── <AuthProvider>
              └── <ThemeProvider>
                    └── <RootNavigator>
                          ├── <AuthNavigator> (unauthenticated)
                          └── <AppNavigator>  (authenticated)
```

## 7.2 Home Screen Tree

```
<HomeScreen>
  ├── <Screen> (safe area + scroll)
  │   ├── <Header title="FC Revelation" />
  │   ├── <QuickStatsBanner>
  │   │   ├── Wins this season
  │   │   ├── Next match countdown
  │   │   └── Team attendance rate
  │   ├── <SectionTitle "Upcoming Events" />
  │   ├── <FlatList>
  │   │   └── <UpcomingEventCard> (×n)
  │   │       ├── EventTypeBadge
  │   │       ├── Date + Time
  │   │       ├── Title
  │   │       ├── Venue
  │   │       └── AttendanceMiniSummary
  │   ├── <SectionTitle "Recent Announcements" />
  │   └── <FlatList>
  │       └── <AnnouncementCard> (×n)
  └── <FAB> (Coach only — Create Event)
```

## 7.3 Event Detail Screen Tree

```
<EventDetailScreen>
  ├── <EventHeader>
  │   ├── CoverImage / EventTypeGradient
  │   ├── EventTypeBadge
  │   ├── Title
  │   ├── Date + Time chips
  │   └── Status badge
  ├── <TabBar>
  │   ├── [Overview] [Attendance] [Comments] [Gallery]
  │   └── (Match: +[Lineup] [Timeline] [Stats] [Report])
  │
  ├── <OverviewTab>
  │   ├── VenueMap (OpenStreetMap embed)
  │   ├── DescriptionBlock
  │   ├── WeatherBadge
  │   ├── CoachNotesPanel (Coach only)
  │   └── QuickAttendanceButtons (Going/Maybe/Not Going)
  │
  ├── <AttendanceTab>
  │   ├── AttendanceSummaryRing (doughnut chart)
  │   ├── AttendanceFilterTabs (Going | Maybe | Not Going | Late | No Response)
  │   └── PlayerAttendanceList
  │       └── PlayerListItem (×n)
  │
  ├── <CommentsTab>
  │   ├── CommentsList
  │   │   └── CommentItem (×n)
  │   │       ├── Avatar
  │   │       ├── Name + Timestamp
  │   │       ├── Text
  │   │       └── LikeButton
  │   └── CommentInput
  │
  └── <GalleryTab>
      ├── GalleryGrid
      │   └── MediaThumbnail (×n)
      └── UploadButton (Coach / players if enabled)
```

## 7.4 Match Screen Tree

```
<MatchDetailScreen>
  ├── <MatchHeader>
  │   ├── HomeTeamLogo + Name
  │   ├── ScoreDisplay ("2 - 1")
  │   ├── AwayTeamName
  │   ├── MatchStatus badge
  │   └── CompetitionName
  │
  ├── [Lineup Tab]
  │   ├── FormationSelector (Coach)
  │   ├── PitchView (SVG grid)
  │   │   └── PlayerPin (×11)
  │   └── SubstitutesList
  │
  ├── [Timeline Tab]
  │   ├── TimelineList
  │   │   └── TimelineEventItem (×n)
  │   │       ├── MinuteBadge
  │   │       ├── EventIcon (⚽️🟨🟥)
  │   │       └── PlayerName
  │   └── AddTimelineButton (Coach)
  │
  ├── [Statistics Tab]
  │   ├── MatchStatsBars
  │   │   └── StatRow (Possession / Shots / etc.)
  │   └── IndividualStatsList
  │
  └── [Report Tab]
      ├── ReportSections
      │   ├── Summary block
      │   ├── Strengths block
      │   ├── Weaknesses block
      │   └── NextFocus block
      └── PlayerFeedbackList
```

---

# 8. Screen Wireframes

## 8.1 Splash Screen
```
┌─────────────────────────────┐
│                             │
│                             │
│         ⚽️ TEAMORA          │
│      [animated logo]        │
│                             │
│      "FC Revelation"        │
│                             │
│    ████████████████ (bar)   │
│                             │
└─────────────────────────────┘
bg: Dark #0F1117 | logo: white + green
```

## 8.2 Welcome Screen
```
┌─────────────────────────────┐
│                             │
│   [football field graphic]  │
│   (glassmorphic overlay)    │
│                             │
│   ┌─────────────────────┐   │
│   │  Welcome to Teamora │   │
│   │  Your team hub.     │   │
│   │                     │   │
│   │  [Create Account]   │   │
│   │  [Sign In]          │   │
│   │  [Join with Code]   │   │
│   └─────────────────────┘   │
│                             │
└─────────────────────────────┘
```

## 8.3 Home Screen
```
┌─────────────────────────────┐
│ FC Revelation    [🔔] [👤]  │
├─────────────────────────────┤
│ ┌─────────────────────────┐ │
│ │ 🏆 Season at a Glance   │ │
│ │  W:8  D:2  L:1  Att:87% │ │
│ └─────────────────────────┘ │
├─────────────────────────────┤
│ UPCOMING EVENTS             │
│                             │
│ ┌─────────────────────────┐ │
│ │ 🔵 PRACTICE             │ │
│ │ Tuesday Training        │ │
│ │ 📅 Tue 22 Jul  ⏰ 18:00 │ │
│ │ 📍 Victoria Park        │ │
│ │ [✓11] [?3] [✗2]        │ │
│ └─────────────────────────┘ │
│                             │
│ ┌─────────────────────────┐ │
│ │ 🟢 LEAGUE MATCH         │ │
│ │ vs AFC United           │ │
│ │ 📅 Sat 26 Jul  ⏰ 15:00 │ │
│ │ 📍 Riverside Ground     │ │
│ │ [✓8] [?4] [✗1]        │ │
│ └─────────────────────────┘ │
├─────────────────────────────┤
│  🏠    📅    [+]   👥   👤  │
└─────────────────────────────┘
```

## 8.4 Event Detail — Overview Tab
```
┌─────────────────────────────┐
│ ← Back              [✏️]   │
│                             │
│ ┌─────────────────────────┐ │
│ │ [Gradient Green Header]  │ │
│ │  🟢 LEAGUE MATCH        │ │
│ │  vs AFC United          │ │
│ │  Sat 26 Jul • 15:00     │ │
│ │  ✅ Scheduled           │ │
│ └─────────────────────────┘ │
│                             │
│ [Overview][Attend][Chat][📷]│
│ ─────────────────────────── │
│                             │
│ 📍 Riverside Ground         │
│ ┌─────────────────────────┐ │
│ │   [OpenStreetMap tile]  │ │
│ │                         │ │
│ └─────────────────────────┘ │
│                             │
│ 📝 Description              │
│ "Derby match. Full squad    │
│  attendance needed."        │
│                             │
│ ☀️  Sunny • 21°C            │
│                             │
│ ─── YOUR RESPONSE ───────── │
│ [✓ Going] [? Maybe] [✗ No] │
│ [⏰ Late] [🚗 Pickup]       │
│                             │
└─────────────────────────────┘
```

## 8.5 Attendance Tab
```
┌─────────────────────────────┐
│ [Overview][Attend●][Chat][📷]│
├─────────────────────────────┤
│                             │
│      ┌─────────────┐       │
│      │   Doughnut  │       │
│      │  11 Going   │       │
│      │   3 Maybe   │       │
│      │   2 No      │       │
│      └─────────────┘       │
│                             │
│ [Going 11][Maybe 3][No 2]  │
│ [Late 1][No Response 3]    │
│ ─────────────────────────── │
│                             │
│ 🟢 GOING (11)              │
│ ┌─────────────────────────┐ │
│ │ 👤 John Smith  ⚽️ FWD  │ │
│ │ 👤 Mark James  🥅 GK   │ │
│ │ 👤 Paul Brown  🛡️ DEF  │ │
│ └─────────────────────────┘ │
│                             │
└─────────────────────────────┘
```

## 8.6 Match Scoreboard (Timeline Tab)
```
┌─────────────────────────────┐
│         FC Revelation       │
│              2              │
│             vs              │
│              1              │
│          AFC United         │
│ ─────────────────────────── │
│                             │
│ [Line][Timeline●][Stat][Rep]│
│ ─────────────────────────── │
│                             │
│ ⚽️  5'  John Smith         │
│     (assist: Mark James)    │
│                             │
│ 🟨 23'  AFC — No.7         │
│                             │
│ ─────── HALF TIME ──────── │
│                             │
│ ⚽️ 67'  Paul Brown         │
│     (penalty)               │
│                             │
│ ⚽️ 78'  AFC — No.9         │
│                             │
│ ─────── FULL TIME 2-1 ───── │
│                             │
│         [+ Add Event]       │
└─────────────────────────────┘
```

## 8.7 Squad Screen
```
┌─────────────────────────────┐
│ Squad            [+] [⚙️]  │
├─────────────────────────────┤
│ [Players●] [Groups] [Pending]│
│ ─────────────────────────── │
│ 🔍 Search players...        │
│ [All][GK][DEF][MID][FWD]   │
│ ─────────────────────────── │
│                             │
│ ┌─────────────────────────┐ │
│ │ 👤  John Smith          │ │
│ │ #9  Forward  •  Active  │ │
│ │ ⚽️15  🏆3  📅 94%      │ │
│ └─────────────────────────┘ │
│                             │
│ ┌─────────────────────────┐ │
│ │ 👤  Mark James          │ │
│ │ #1  Goalkeeper  •  Active│ │
│ │ 🧤8   🏆1   📅 88%     │ │
│ └─────────────────────────┘ │
│                             │
└─────────────────────────────┘
```

## 8.8 Player Profile Screen
```
┌─────────────────────────────┐
│ ←  Player Profile  [✏️]    │
│ ─────────────────────────── │
│                             │
│     [Avatar 80px]           │
│      John Smith             │
│    #9  •  Forward           │
│    ⭐ Right Foot             │
│                             │
│ ┌────┬────┬────┬────┐      │
│ │ 15 │ 7  │ 8  │ 3  │      │
│ │Goal│Asst│MOTM│Card│      │
│ └────┴────┴────┴────┘      │
│                             │
│ 📅 Attendance: 94% (●●●●○) │
│                             │
│ ── Performance Graph ─────  │
│ [Victory Line Chart]        │
│  ratings over last 10 games │
│                             │
│ ── Awards ───────────────── │
│  🏆 MOTM vs AFC United      │
│  🏆 MOTM vs City FC         │
│                             │
│ ── Details ──────────────── │
│  📏 182cm  ⚖️ 76kg  🎂 24  │
│  📱 +44 7700 000000         │
│                             │
└─────────────────────────────┘
```

## 8.9 Statistics Screen
```
┌─────────────────────────────┐
│ Statistics    [Season▼]    │
├─────────────────────────────┤
│ ┌─────────────────────────┐ │
│ │ Season 2025-26 Overview │ │
│ │  P:11  W:8  D:2  L:1   │ │
│ │  GF:24  GA:9  GD:+15   │ │
│ └─────────────────────────┘ │
│                             │
│ 🏅 TOP SCORERS             │
│ 1. John Smith    15 ⚽️     │
│ 2. Paul Brown    8  ⚽️     │
│ 3. Lee Davis     5  ⚽️     │
│                             │
│ 🎯 TOP ASSISTS             │
│ 1. Mark James    11 🎯     │
│ 2. Sam Taylor    6  🎯     │
│                             │
│ 🏆 MOTM LEADERS            │
│ 1. John Smith    8 🏆      │
│ 2. Mark James    3 🏆      │
│                             │
│ 📅 ATTENDANCE LEADERS      │
│ 1. Paul Brown    100% ●●●● │
│ 2. John Smith    94%  ●●●○ │
│                             │
└─────────────────────────────┘
```

## 8.10 Create Event Screen
```
┌─────────────────────────────┐
│ ← Create Event              │
│ ─────────────────────────── │
│                             │
│  EVENT TYPE                 │
│ [Practice][Match][Meeting]  │
│ [Tournament][Gym][Recovery] │
│ [Announcement][Payment]     │
│                             │
│  TITLE                      │
│ ┌─────────────────────────┐ │
│ │ Tuesday Training        │ │
│ └─────────────────────────┘ │
│                             │
│  DATE           TIME        │
│ ┌───────────┐ ┌───────────┐│
│ │ Tue 22 Jul│ │  18:00    ││
│ └───────────┘ └───────────┘│
│                             │
│  VENUE                      │
│ ┌─────────────────────────┐ │
│ │ 📍 Search location...   │ │
│ └─────────────────────────┘ │
│  [Map Preview]              │
│                             │
│  TARGET GROUPS              │
│ [✓Everyone][League Squad]   │
│ [Tournament Squad]          │
│                             │
│  NOTIFICATIONS              │
│ Send push notification  [✓] │
│                             │
│      [Publish Event]        │
│                             │
└─────────────────────────────┘
```

---

# 9. UI Design System

## 9.1 Color Palette

```typescript
export const colors = {
  // Backgrounds
  background: {
    primary:   '#0F1117',   // Deep dark
    secondary: '#161B22',   // Card background
    tertiary:  '#1C2333',   // Elevated card
    glass:     'rgba(255,255,255,0.05)',
  },

  // Accent — Green (football pitch)
  accent: {
    primary:   '#22C55E',   // Main green
    light:     '#4ADE80',   // Lighter green
    dark:      '#16A34A',   // Darker green
    glow:      'rgba(34,197,94,0.15)',  // Green glow
  },

  // Event Type Colors
  event: {
    practice:    '#3B82F6',  // Blue
    match:       '#22C55E',  // Green
    tournament:  '#F97316',  // Orange
    meeting:     '#A855F7',  // Purple
    gym:         '#EF4444',  // Red
    recovery:    '#06B6D4',  // Cyan
    payment:     '#EAB308',  // Yellow
    birthday:    '#EC4899',  // Pink
    announcement:'#6B7280',  // Gray
  },

  // Text
  text: {
    primary:   '#F9FAFB',
    secondary: '#9CA3AF',
    muted:     '#6B7280',
    inverse:   '#0F1117',
  },

  // Status
  status: {
    going:     '#22C55E',
    maybe:     '#EAB308',
    notGoing:  '#EF4444',
    late:      '#F97316',
    pickup:    '#8B5CF6',
    noResp:    '#6B7280',
  },

  // UI
  border:    'rgba(255,255,255,0.08)',
  divider:   'rgba(255,255,255,0.06)',
  overlay:   'rgba(0,0,0,0.6)',

  // Cards
  cardGlass: 'rgba(22,27,34,0.8)',
};
```

## 9.2 Typography

```typescript
export const typography = {
  // Font family
  fontFamily: {
    regular: 'Inter_400Regular',
    medium:  'Inter_500Medium',
    semibold:'Inter_600SemiBold',
    bold:    'Inter_700Bold',
    black:   'Inter_900Black',
  },

  // Font sizes
  size: {
    xs:  11,
    sm:  13,
    md:  15,
    lg:  17,
    xl:  20,
    '2xl': 24,
    '3xl': 28,
    '4xl': 34,
    '5xl': 40,
  },

  // Line heights
  lineHeight: {
    tight:  1.2,
    normal: 1.5,
    loose:  1.8,
  },
};
```

## 9.3 Spacing & Layout

```typescript
export const spacing = {
  // Base unit: 4px
  1:  4,
  2:  8,
  3:  12,
  4:  16,
  5:  20,
  6:  24,
  8:  32,
  10: 40,
  12: 48,
  16: 64,
};

export const radius = {
  sm:   8,
  md:   12,
  lg:   16,
  xl:   20,
  '2xl':24,
  full: 999,
};
```

## 9.4 Glassmorphism Card Style

```typescript
export const glassCard = {
  backgroundColor: 'rgba(22, 27, 34, 0.8)',
  borderWidth: 1,
  borderColor: 'rgba(255, 255, 255, 0.08)',
  borderRadius: 16,
  // Expo BlurView for actual blur effect
  overflow: 'hidden',
  // Shadow
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.3,
  shadowRadius: 12,
  elevation: 8,
};
```

## 9.5 Event Type Configuration

```typescript
export const eventTypeConfig = {
  practice: {
    label: 'Practice',
    color: '#3B82F6',
    icon: '⚽️',
    gradient: ['#1D4ED8', '#3B82F6'],
  },
  league_match: {
    label: 'League Match',
    color: '#22C55E',
    icon: '🏆',
    gradient: ['#15803D', '#22C55E'],
  },
  tournament_match: {
    label: 'Tournament',
    color: '#F97316',
    icon: '🥇',
    gradient: ['#C2410C', '#F97316'],
  },
  meeting: {
    label: 'Meeting',
    color: '#A855F7',
    icon: '📋',
    gradient: ['#7E22CE', '#A855F7'],
  },
  gym_session: {
    label: 'Gym Session',
    color: '#EF4444',
    icon: '💪',
    gradient: ['#B91C1C', '#EF4444'],
  },
  recovery_session: {
    label: 'Recovery',
    color: '#06B6D4',
    icon: '🧊',
    gradient: ['#0E7490', '#06B6D4'],
  },
  payment_deadline: {
    label: 'Payment',
    color: '#EAB308',
    icon: '💰',
    gradient: ['#A16207', '#EAB308'],
  },
  birthday: {
    label: 'Birthday',
    color: '#EC4899',
    icon: '🎂',
    gradient: ['#BE185D', '#EC4899'],
  },
  announcement: {
    label: 'Announcement',
    color: '#6B7280',
    icon: '📢',
    gradient: ['#374151', '#6B7280'],
  },
};
```

## 9.6 Animation Tokens

```typescript
export const animation = {
  // Duration
  fast:   150,
  normal: 250,
  slow:   400,

  // Easing (Reanimated)
  easing: {
    standard: Easing.bezier(0.4, 0, 0.2, 1),
    decelerate: Easing.bezier(0, 0, 0.2, 1),
    accelerate: Easing.bezier(0.4, 0, 1, 1),
    spring: { damping: 15, stiffness: 150 },
  },
};

// Usage patterns:
// - Card entrance: fade + translateY(20px → 0)
// - Button press: scale(1 → 0.95) spring
// - Tab switch: horizontal slide
// - Bottom sheet: translateY spring
// - Attendance button: scale + color spring
```

## 9.7 NativeWind Tailwind Config

```javascript
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#0F1117',
        surface: '#161B22',
        elevated: '#1C2333',
        accent: '#22C55E',
        'accent-light': '#4ADE80',
        'text-primary': '#F9FAFB',
        'text-secondary': '#9CA3AF',
        'text-muted': '#6B7280',
        border: 'rgba(255,255,255,0.08)',
      },
      fontFamily: {
        sans: ['Inter_400Regular'],
        medium: ['Inter_500Medium'],
        semibold: ['Inter_600SemiBold'],
        bold: ['Inter_700Bold'],
      },
      borderRadius: {
        DEFAULT: '12px',
        lg: '16px',
        xl: '20px',
        '2xl': '24px',
      },
    },
  },
};
```

---

# 10. API Layer

## 10.1 Architecture Overview

```
Screen / Component
      │
      ▼
  React Query Hook  (useEvents, useAttendance, etc.)
      │
      ▼
  Repository       (EventRepository, etc.)
      │
      ▼
  Service          (event.service.ts)
      │
      ▼
  Firestore SDK    (firebase/firestore)
```

## 10.2 Base Repository

```typescript
// src/repositories/BaseRepository.ts

interface Repository<T> {
  findById(id: string): Promise<T | null>;
  findAll(filters?: QueryFilter[]): Promise<T[]>;
  create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T>;
  update(id: string, data: Partial<T>): Promise<void>;
  delete(id: string): Promise<void>;
  subscribe(id: string, callback: (data: T | null) => void): Unsubscribe;
  subscribeAll(filters: QueryFilter[], callback: (data: T[]) => void): Unsubscribe;
}
```

## 10.3 Event Service API

```typescript
// src/services/event.service.ts

interface EventService {
  // Queries
  getEventsByClub(clubId: string, filters?: EventFilters): Promise<Event[]>;
  getEventById(eventId: string): Promise<Event | null>;
  getEventsByDateRange(clubId: string, from: Date, to: Date): Promise<Event[]>;
  getUpcomingEvents(clubId: string, limit?: number): Promise<Event[]>;

  // Mutations
  createEvent(data: CreateEventInput): Promise<Event>;
  updateEvent(eventId: string, data: UpdateEventInput): Promise<void>;
  deleteEvent(eventId: string): Promise<void>;
  cancelEvent(eventId: string, reason: string): Promise<void>;

  // Subscriptions (real-time)
  subscribeToEvents(clubId: string, callback: (events: Event[]) => void): Unsubscribe;
  subscribeToEvent(eventId: string, callback: (event: Event | null) => void): Unsubscribe;
}
```

## 10.4 Attendance Service API

```typescript
interface AttendanceService {
  getAttendanceForEvent(eventId: string): Promise<Attendance[]>;
  getUserAttendance(userId: string, eventId: string): Promise<Attendance | null>;

  setAttendance(input: {
    eventId: string;
    userId: string;
    status: AttendanceStatus;
    note?: string;
  }): Promise<void>;

  getAttendanceSummary(eventId: string): Promise<AttendanceSummary>;

  subscribeToAttendance(
    eventId: string,
    callback: (attendance: Attendance[]) => void
  ): Unsubscribe;
}
```

## 10.5 React Query Hooks

```typescript
// src/hooks/useEvents.ts
function useEvents(clubId: string, filters?: EventFilters) {
  return useQuery({
    queryKey: ['events', clubId, filters],
    queryFn: () => eventService.getEventsByClub(clubId, filters),
    staleTime: 1000 * 60 * 2,  // 2 minutes
    gcTime: 1000 * 60 * 10,    // 10 minutes
  });
}

// src/hooks/useSetAttendance.ts
function useSetAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: attendanceService.setAttendance,
    onMutate: async (variables) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['attendance', variables.eventId] });
      const previous = queryClient.getQueryData(['attendance', variables.eventId]);
      queryClient.setQueryData(['attendance', variables.eventId], (old: Attendance[]) => {
        // Update the user's attendance record optimistically
        return old.map(a => a.userId === variables.userId
          ? { ...a, status: variables.status }
          : a
        );
      });
      return { previous };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      queryClient.setQueryData(
        ['attendance', variables.eventId],
        context?.previous
      );
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: ['attendance', variables.eventId] });
    },
  });
}
```

## 10.6 Real-time Subscription Pattern

```typescript
// src/hooks/useRealtimeEvent.ts
function useRealtimeEvent(eventId: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const unsubscribe = eventService.subscribeToEvent(eventId, (event) => {
      queryClient.setQueryData(['event', eventId], event);
    });
    return unsubscribe;
  }, [eventId]);

  return useQuery({
    queryKey: ['event', eventId],
    queryFn: () => eventService.getEventById(eventId),
    staleTime: Infinity,  // Only updated via subscription
  });
}
```

## 10.7 Offline Support Strategy

```typescript
// Strategy: AsyncStorage + React Query persistence

// 1. Persist React Query cache to AsyncStorage
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';

const persister = createAsyncStoragePersister({
  storage: AsyncStorage,
  throttleTime: 1000,
});

// 2. Mark queries for persistence
useQuery({
  queryKey: ['events', clubId],
  queryFn: ...,
  meta: { persist: true },  // Only persist flagged queries
});

// 3. Network state detection
import NetInfo from '@react-native-community/netinfo';

// 4. Mutation queue for offline writes
// Queue mutations when offline, flush on reconnect
```

---

# 11. State Management

## 11.1 State Categories

| Category | Tool | Reason |
|---|---|---|
| Server state (events, players, etc.) | React Query | Caching, sync, background refetch |
| Auth state | Zustand + Firebase | Persistent, global |
| Club state | Zustand | App-wide club context |
| UI state (modals, theme) | Zustand | Lightweight, simple |
| Form state | React Hook Form | Performant, Zod integration |
| Navigation state | React Navigation | Built-in |

## 11.2 Zustand Auth Store

```typescript
// src/stores/authStore.ts
interface AuthState {
  user: User | null;
  club: Club | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  role: UserRole | null;

  // Actions
  setUser: (user: User | null) => void;
  setClub: (club: Club | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;

  // Permission helpers
  canCreateEvent: () => boolean;
  canEditEvent: (eventId: string) => boolean;
  canDeleteEvent: () => boolean;
  canManageSquad: () => boolean;
  canViewCoachNotes: () => boolean;
  canWriteReport: () => boolean;
}
```

## 11.3 Zustand UI Store

```typescript
// src/stores/uiStore.ts
interface UIState {
  theme: 'dark' | 'light';
  activeTab: string;
  isCreateEventOpen: boolean;
  selectedDate: Date | null;
  toastMessage: ToastConfig | null;

  // Actions
  setTheme: (theme: 'dark' | 'light') => void;
  showToast: (config: ToastConfig) => void;
  hideToast: () => void;
  openCreateEvent: () => void;
  closeCreateEvent: () => void;
}
```

## 11.4 Permission System

```typescript
// src/hooks/usePermissions.ts

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  coach: [
    'create_event', 'edit_event', 'delete_event',
    'manage_squad', 'approve_player', 'create_group',
    'write_report', 'view_coach_notes', 'manage_attendance',
    'upload_gallery', 'send_notification', 'view_all_stats',
    'edit_lineup', 'add_timeline', 'rate_players',
  ],
  assistant_coach: [
    'create_event', 'edit_event',
    'manage_attendance', 'upload_gallery',
    'write_report', 'view_coach_notes',
    'edit_lineup', 'add_timeline', 'rate_players',
    'view_all_stats',
  ],
  manager: [
    'create_event', // announcements, payments only
    'manage_squad', 'approve_player',
    'upload_gallery', 'view_all_stats',
  ],
  player: [
    'view_events', 'set_attendance',
    'comment', 'view_gallery',
    'update_own_profile', 'view_own_stats',
  ],
};

function usePermissions() {
  const { role } = useAuthStore();
  const can = (permission: Permission) =>
    role ? ROLE_PERMISSIONS[role].includes(permission) : false;
  return { can };
}
```

---

# 12. Development Roadmap

## Phase 1 — Foundation (Weeks 1-2)
**Goal: App shell, auth, navigation**

- [ ] Expo project setup (TypeScript, NativeWind, ESLint, Prettier)
- [ ] Firebase configuration (Auth, Firestore, Storage)
- [ ] Navigation structure (all navigators, placeholder screens)
- [ ] Design system implementation (colors, typography, base components)
- [ ] Authentication screens (Login, Register, Splash, Welcome)
- [ ] User document creation on register
- [ ] Club creation and invite code system
- [ ] Join club flow
- [ ] Role assignment
- [ ] Home screen shell

**Milestone:** User can register, create/join a club, and land on Home.

---

## Phase 2 — Events Core (Weeks 3-4)
**Goal: Full event CRUD and calendar**

- [ ] Event types and schemas
- [ ] Create Event screen (Coach)
- [ ] Events list screen
- [ ] Event detail screen (Overview tab)
- [ ] Calendar screen (Month + Agenda view)
- [ ] Venue map with OpenStreetMap
- [ ] Push notifications setup (Expo Notifications + FCM token storage)
- [ ] Basic notification on event create

**Milestone:** Coach can create events. Players can see them on calendar.

---

## Phase 3 — Attendance (Week 5)
**Goal: Real-time attendance tracking**

- [ ] Attendance buttons on event detail
- [ ] Real-time attendance subscription
- [ ] Attendance tab (player list by status)
- [ ] Attendance summary doughnut chart (Victory Charts)
- [ ] Optimistic updates
- [ ] Attendance count on event cards
- [ ] Coach can see all responses

**Milestone:** Full attendance flow works in real-time.

---

## Phase 4 — Squad & Groups (Week 6)
**Goal: Player management**

- [ ] Squad screen (player list, search, filter by position)
- [ ] Player profile screen
- [ ] Groups CRUD (Coach)
- [ ] Add/remove players from groups
- [ ] Target events to groups
- [ ] Pending approvals screen
- [ ] Approve / reject join requests

**Milestone:** Coach has full squad control. Groups work.

---

## Phase 5 — Match Intelligence (Weeks 7-8)
**Goal: Full match module**

- [ ] Match detail screen (tabbed)
- [ ] Lineup builder (pitch view, drag positions)
- [ ] Formation selector
- [ ] Timeline editor (goal, cards, subs)
- [ ] Match statistics entry
- [ ] Player rating screen
- [ ] MOTM selection
- [ ] Match result input

**Milestone:** Full post-match workflow is functional.

---

## Phase 6 — Reports & Statistics (Week 9)
**Goal: Intelligence layer**

- [ ] Report writer screen (rich sections)
- [ ] Per-player feedback
- [ ] Report publish flow
- [ ] Reports accessible from match event
- [ ] Statistics screen (season overview)
- [ ] Leaderboards (scorers, assists, MOTM, attendance)
- [ ] Win/loss/draw charts
- [ ] playerStats document auto-update on match complete
- [ ] Performance graph on player profile

**Milestone:** Full statistics and reporting is live.

---

## Phase 7 — Gallery & Comments (Week 10)
**Goal: Media and engagement**

- [ ] Comment system (all events)
- [ ] Like comments
- [ ] Photo upload (Firebase Storage, compressed)
- [ ] Video upload (with progress bar)
- [ ] Gallery grid view per event
- [ ] Full-screen media viewer
- [ ] All-gallery screen (club-wide)
- [ ] Highlight marking

**Milestone:** Comments and gallery complete.

---

## Phase 8 — Notifications & Polish (Week 11)
**Goal: Smart notifications and final UX**

- [ ] Notification types implementation
- [ ] Scheduled reminders (practice, match day before)
- [ ] Venue change notification
- [ ] Unread notification badge
- [ ] Notification history screen
- [ ] Deep links from notification tap
- [ ] Skeleton loaders (all screens)
- [ ] Error states and empty states
- [ ] Pull-to-refresh
- [ ] Haptic feedback

**Milestone:** App feels production-ready.

---

## Phase 9 — Offline & Performance (Week 12)
**Goal: Resilience**

- [ ] React Query persistence (AsyncStorage)
- [ ] Offline indicator UI
- [ ] Optimistic mutations everywhere
- [ ] Image lazy loading
- [ ] FlatList performance (windowSize, maxToRenderPerBatch)
- [ ] Firestore query optimization
- [ ] Bundle size audit

**Milestone:** App works reliably on poor connections.

---

## Phase 10 — QA & Release (Week 13)
**Goal: Ship**

- [ ] Unit tests (services, repositories, hooks)
- [ ] E2E smoke tests (Detox or manual)
- [ ] Firebase Security Rules finalization
- [ ] Firestore indexes deployment
- [ ] App icon and splash screen finalization
- [ ] Expo EAS build configuration
- [ ] TestFlight / Play Console internal testing
- [ ] Bug bash with real team (FC Revelation)

**Milestone:** App store submission ready.

---

# 13. Coding Standards

## 13.1 TypeScript Rules

```typescript
// ✅ Always define explicit return types on functions
async function getEvent(id: string): Promise<Event | null> { ... }

// ✅ Use interfaces for data shapes, types for unions/primitives
interface Event { ... }
type AttendanceStatus = 'going' | 'maybe' | 'not_going' | 'late' | 'need_pickup';

// ✅ Never use 'any' — use 'unknown' if type is truly unknown
function parseData(raw: unknown): Event { ... }

// ✅ Use discriminated unions for complex state
type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: Error };

// ✅ Use Readonly for config/constant objects
const CONFIG: Readonly<AppConfig> = { ... };
```

## 13.2 Component Standards

```typescript
// ✅ Functional components with typed props
interface EventCardProps {
  event: Event;
  onPress: (eventId: string) => void;
  showAttendance?: boolean;
}

export const EventCard: React.FC<EventCardProps> = ({
  event,
  onPress,
  showAttendance = true,
}) => { ... };

// ✅ Memoize expensive components
export const PlayerListItem = React.memo<PlayerListItemProps>(({ player }) => {
  ...
});

// ✅ Extract styles to StyleSheet or className strings (NativeWind)
// Never define styles inline for complex components

// ✅ Keep components under 200 lines — extract sub-components
```

## 13.3 Naming Conventions

```
Files:
  Screens:      PascalCase  →  EventDetailScreen.tsx
  Components:   PascalCase  →  AttendanceCard.tsx
  Hooks:        camelCase   →  useAttendance.ts
  Services:     camelCase   →  event.service.ts
  Stores:       camelCase   →  authStore.ts
  Types:        camelCase   →  event.types.ts
  Schemas:      camelCase   →  event.schema.ts

Code:
  Components:   PascalCase  →  EventCard
  Functions:    camelCase   →  getUpcomingEvents()
  Constants:    SCREAMING   →  MAX_GALLERY_ITEMS
  Types:        PascalCase  →  AttendanceStatus
  Enums:        PascalCase  →  EventType.Practice
  Props types:  [Name]Props →  EventCardProps
```

## 13.4 File Structure per Feature

```
features/events/
  screens/
    EventDetailScreen.tsx    ← Full screen, orchestrates components
  components/
    EventCard.tsx            ← Reusable display component
    AttendancePanel.tsx      ← Sub-component
  hooks/
    useEventForm.ts          ← Form-specific hook
  utils/
    formatEventDate.ts       ← Pure utility function
```

## 13.5 Error Handling Pattern

```typescript
// ✅ Service layer: always throw typed errors
class EventNotFoundError extends Error {
  constructor(eventId: string) {
    super(`Event ${eventId} not found`);
    this.name = 'EventNotFoundError';
  }
}

// ✅ React Query: use onError for user feedback
const { mutate } = useSetAttendance({
  onError: (error) => {
    showToast({ type: 'error', message: 'Could not update attendance' });
  },
});

// ✅ Top-level: ErrorBoundary wraps all feature screens
<ErrorBoundary fallback={<ErrorState />}>
  <EventDetailScreen />
</ErrorBoundary>
```

## 13.6 Firestore Best Practices

```typescript
// ✅ Always use batch writes for multi-document updates
const batch = writeBatch(db);
batch.update(eventRef, { 'attendanceCount.going': increment(1) });
batch.set(attendanceRef, attendanceData);
await batch.commit();

// ✅ Denormalize read-heavy data (display name, photo in attendance)
// ✅ Paginate all lists — never fetch unbounded collections
const q = query(
  collection(db, 'events'),
  where('clubId', '==', clubId),
  orderBy('date', 'asc'),
  limit(20),
  startAfter(lastDoc)
);

// ✅ Unsubscribe from all real-time listeners on unmount
useEffect(() => {
  const unsub = subscribeToEvent(eventId, handler);
  return unsub; // Cleanup
}, [eventId]);
```

## 13.7 Git Workflow

```
Branches:
  main          → Production-ready code
  develop       → Integration branch
  feature/xxx   → Individual features
  fix/xxx       → Bug fixes
  chore/xxx     → Non-functional changes

Commit format (Conventional Commits):
  feat(events): add create event form
  fix(attendance): correct optimistic update rollback
  chore(deps): upgrade react-native to 0.74
  docs(readme): update setup instructions

PR Rules:
  - No direct commits to main
  - All PRs must pass TypeScript check
  - Minimum 1 reviewer
  - Squash merge to develop
```

## 13.8 Environment Variables

```bash
# .env (never commit)
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=
EXPO_PUBLIC_CLUB_ID=                      # FC Revelation club ID (seeded)
```

---

# Appendix A — Firestore Read Budget Calculator

```
Assumption: 20 active players, 3 events/week

Daily reads estimate:
  Home screen load:      20 events docs         = 20
  Calendar view:         30 event docs           = 30
  Event detail open:     1 event + 20 attendance = 21
  Attendance update:     1 write (not a read)
  Stats screen:          20 playerStats docs     = 20
  Squad screen:          20 user docs            = 20
  Total per user/day:    ~111 reads
  20 players × 111:      2,220 reads/day
  Free tier limit:       50,000 reads/day
  Usage:                 4.4% of free tier ✅
```

---

# Appendix B — Key Third-Party Libraries

| Library | Version | Purpose |
|---|---|---|
| expo | ~51 | React Native framework |
| expo-router / React Navigation | v6 | Navigation |
| firebase | ^10 | Backend services |
| @tanstack/react-query | ^5 | Server state management |
| zustand | ^4 | Client state |
| react-hook-form | ^7 | Form handling |
| zod | ^3 | Schema validation |
| nativewind | ^4 | Tailwind for RN |
| react-native-paper | ^5 | Material components |
| victory-native | ^36 | Charts |
| react-native-maps (OSM) | ^1 | Map component |
| expo-notifications | latest | Push notifications |
| expo-image-picker | latest | Gallery access |
| expo-image-manipulator | latest | Image compression |
| react-native-reanimated | ^3 | Animations |
| react-native-gesture-handler | ^2 | Gestures |
| @expo/vector-icons | latest | Icons |
| expo-blur | latest | Glassmorphism |
| date-fns | ^3 | Date formatting |
| @react-native-async-storage/async-storage | ^1 | Local persistence |

---

*Blueprint Version 1.0 — FC Revelation / Teamora — July 2026*
*Ready for implementation. Proceed to Phase 1.*
