# Teamora

Mobile-first team management for amateur football clubs. Teamora replaces scattered WhatsApp groups with one structured hub for training, matches, attendance and squad management.

## Features

- **Auth and roles:** Coaches create a club and get an invite code. Players join with the code and wait for coach approval.
- **Events and calendar:** Schedule training sessions and matches, with venue and time.
- **Attendance:** Players mark availability, and coaches see who is coming.
- **Squad:** Player profiles with position, jersey number and details.
- **Match center:** Lineups, results and player ratings.
- **Statistics:** Per-player and team stats.
- **Gallery:** Shared photos and videos for the club.
- **Notifications:** Push notifications and reminders for events and announcements.

## Tech Stack

- Expo SDK 57, React Native 0.86, TypeScript
- Firebase: Auth, Firestore, Storage
- React Navigation v7
- Zustand for client state, TanStack Query for server state
- NativeWind (Tailwind CSS for React Native)

## Getting Started

### Prerequisites
- Node.js 18+
- A Firebase project with Email/Password auth and Firestore enabled
- Expo Go, an Android emulator, or an iOS simulator

### Setup

```bash
git clone https://github.com/aravind-t-22915/Teamora.git
cd Teamora
npm install
cp .env.example .env   # then fill in your Firebase values
npx expo start
```

### Environment variables

```
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=
```

### Firestore rules

Publish the rules in `firestore.rules` (Firebase Console → Firestore → Rules, or `firebase deploy --only firestore:rules`). Without them, sign-in and registration fail with `permission-denied`.

## Expo Go notes

Remote push notifications are not supported in Expo Go (SDK 53+). The app skips `expo-notifications` there. Use a development build to test push.

## Project Structure

```
src/
  config/       Firebase, theme, constants
  context/      Auth provider
  features/     auth, calendar, events, gallery, home, match, profile, squad, statistics
  hooks/        React Query and notification hooks
  navigation/   Root, auth and app navigators
  services/     Firestore and auth service layer
  stores/       Zustand stores
```

See `BLUEPRINT.md` for the full product spec and `docs/` for audits.
