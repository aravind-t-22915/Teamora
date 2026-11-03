# Security Audit
**Teamora — FC Revelation**
**Audit Date:** 2026-09-04
**Scope:** Defensive code audit — no exploitation attempted

---

## Summary

| Severity | Count |
|---|---|
| CRITICAL | 1 |
| HIGH | 3 |
| MEDIUM | 4 |
| LOW | 5 |

---

## CRITICAL Issues

### SEC-C1: Real Firebase Credentials in .env File
**Severity:** CRITICAL (contextual)

**File:** `.env`

The `.env` file contains production Firebase credentials:
```
EXPO_PUBLIC_FIREBASE_API_KEY=<redacted>
EXPO_PUBLIC_FIREBASE_PROJECT_ID=<redacted>
EXPO_PUBLIC_FIREBASE_APP_ID=<redacted>
```

**Assessment:**
- `.env` IS in `.gitignore` — the file is NOT committed to git. If this repo is private, no immediate exposure.
- `EXPO_PUBLIC_` prefix means these values ARE bundled into the compiled app binary (intentional for Expo/Firebase client apps).
- Firebase client keys are designed to be embedded in apps. Security is enforced by **Firestore Security Rules** (which are well-implemented).
- **The actual risk is if the repo were made public** — the `.env` file would not be exposed, but the values would be extractable from the app binary anyway.

**Action Required:**
- Verify Firestore Security Rules are deployed and correct ✅ (they are — see firestore.rules)
- Enable Firebase App Check for additional API abuse protection
- Restrict the API key in Google Cloud Console to only allowed origins/bundle IDs
- Ensure `.env` is never committed (it's in `.gitignore` ✅)

---

## HIGH Issues

### SEC-H1: No Rate Limiting on Authentication
**Severity:** HIGH

Firebase Authentication does provide built-in rate limiting for sign-in attempts, but there is no additional application-level rate limiting on the registration endpoint. A malicious user could create many accounts programmatically.

**Risk:** Bot account creation, invite code enumeration (6-char codes have limited entropy if enumerated systematically).

**Recommendation:**
- Enable Firebase App Check (protects against automated abuse)
- Consider using longer invite codes or rotating them after use

---

### SEC-H2: Client-Side Invite Code Generation
**Severity:** HIGH

**File:** `src/services/auth.service.ts:17-23`

The invite code for a new club is generated client-side:
```typescript
function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < INVITE_CODE_LENGTH; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}
```

`Math.random()` is not cryptographically secure. While this is not a critical vulnerability for a team management app, it means codes could theoretically be predicted by an attacker with knowledge of the seed.

**Risk:** Low in practice for a small team app, but technically a weakness.

**Recommendation:** Use `crypto.getRandomValues()` for invite code generation.

---

### SEC-H3: userService.rejectPlayer Deletes User Document
**Severity:** HIGH (Data Integrity)

**File:** `src/services/user.service.ts:41-43`

```typescript
async rejectPlayer(userId: string): Promise<void> {
  await deleteDoc(doc(usersCol(), userId));
},
```

The `user.service.ts` version of `rejectPlayer` **permanently deletes** the user document. The `squad.service.ts` version correctly sets `status: 'suspended'`. If the UI accidentally calls `userService.rejectPlayer` instead of `squadService.rejectPlayer`, a player's data is permanently lost.

**Recommendation:** Remove `userService.rejectPlayer` or change it to set `status: 'suspended'` to match `squadService`.

---

## MEDIUM Issues

### SEC-M1: Firestore Security Rules — clubs Collection Too Permissive
**Severity:** MEDIUM

**File:** `firestore.rules:67-79`

```javascript
match /clubs/{clubId} {
  allow read: if isAuth();
  allow create: if isAuth();
```

Any authenticated user can read ALL clubs and create a club. This means:
1. A player from Club A could read Club B's data (including inviteCode)
2. Any registered user can create unlimited clubs

**Risk:** Invite code enumeration by authenticated users. Not critical for a single-club deployment.

**Recommendation:**
- `allow read: if isAuth() && (resource.data.inviteCode == ... || isMember(clubId))` 
- Or: remove `inviteCode` from the clubs document and store it separately in a secure sub-document

---

### SEC-M2: No CSRF Protection
**Severity:** MEDIUM

Firebase SDK handles authentication tokens automatically (Bearer tokens in headers), which prevents CSRF for API calls. However, since this is a mobile app (not a web app with cookies), CSRF is not applicable in the traditional sense. **Not a real risk for this app type.**

---

### SEC-M3: Expo Push Notifications — No Server-Side Validation
**Severity:** MEDIUM

The `notificationService.createNotification()` creates a Firestore document but there is no actual push delivery mechanism. The Firestore rules allow any `isManager()` to write to notifications. Without a server, push tokens are stored but never used to send actual push notifications.

**Risk:** If push notification delivery is added later via a server, the token is the equivalent of a credential for that user's device. It should be treated carefully.

**Recommendation:** When implementing server-side push delivery, validate that the push token belongs to the target user before sending.

---

### SEC-M4: Input Sanitization
**Severity:** MEDIUM

Text inputs in `CreateEventScreen.tsx` use `maxLength` props but no sanitization beyond trimming. Firestore stores strings as-is. Since this is a React Native app (not a web browser), XSS is not directly applicable. However, if the data is ever displayed on a web interface or exported, unsanitized HTML/script content in event descriptions could cause issues.

**Recommendation:** The current approach (Zod schemas + maxLength) is sufficient for mobile. Implement sanitization if a web view is added.

---

## LOW Issues

### SEC-L1: Firebase Config Values Not Validated
**Severity:** LOW

**File:** `src/config/firebase.ts`

If `EXPO_PUBLIC_FIREBASE_PROJECT_ID` is undefined (e.g., `.env` not populated), `initializeApp` will be called with `undefined` values and will fail silently or produce unhelpful errors.

**Recommendation:** Add an assertion at startup:
```typescript
if (!process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID) {
  throw new Error('Firebase config missing from environment');
}
```

---

### SEC-L2: Error Messages May Expose Internal Details
**Severity:** LOW

`Alert.alert('Error', e instanceof Error ? e.message : ...)` in auth screens passes Firebase error messages directly to the user. Firebase errors like "auth/user-not-found" or "auth/wrong-password" enumerate account existence.

**Recommendation:** Map Firebase error codes to generic user-facing messages.

---

### SEC-L3: No Session Timeout
**Severity:** LOW

Firebase Auth sessions persist indefinitely (until explicit sign-out). For a shared device, a signed-in user is permanently signed in.

**Risk:** Low for personal devices typical of sports teams.

---

### SEC-L4: Coach Notes Not Redacted Server-Side
**Severity:** LOW

Coach notes are stored in event documents with `coachNotes` field. Firestore rules allow any active member to read events. A malicious client could read `coachNotes` even if the UI doesn't show them to players.

**Recommendation:** Move `coachNotes` to a sub-collection with separate read permissions, or to the `matchData` document that already has coach-only access patterns.

**Note:** The current Firestore rules DO NOT restrict coachNotes reading — all active members can read the entire event document.

---

### SEC-L5: No Account Deletion / Data Erasure
**Severity:** LOW

There is no user-facing account deletion functionality. GDPR/privacy regulations may require it.

**Recommendation:** Implement a "Delete Account" flow that removes the Firebase Auth account and Firestore user document.

---

## Authentication Summary

| Item | Status |
|---|---|
| Password hashing | ✅ Handled by Firebase Auth |
| Email verification | ❌ Not implemented |
| Password reset | ❌ Not implemented |
| Account lockout | ✅ Firebase Auth built-in |
| Session tokens | ✅ Firebase ID tokens (JWT, auto-refresh) |
| Biometric login | ❌ Planned in BLUEPRINT but not implemented |
| HTTPS for all communication | ✅ Firebase SDK enforces HTTPS |

---

## Firestore Security Rules Assessment

The `firestore.rules` file is well-designed:

✅ All reads/writes require authentication  
✅ `isMember()` checks clubId AND status=='active'  
✅ Players can only write their own attendance  
✅ Only coaches can write events, matchData, matchResults  
✅ `isOwn()` pattern prevents users modifying other users' data  
✅ Club deletion blocked (`allow delete: if false`)  
✅ Polls and notifications have appropriate restrictions  

⚠️ clubs collection allows any authenticated user to read all clubs (inviteCode exposure)  
⚠️ `matchData` and `matchResults` collections are NOT in firestore.rules — they are **unprotected** (default deny in Firestore v2 rules means they'd be inaccessible, but the rules file should explicitly cover them)

**Action Required:** Add explicit rules for `matchData`, `matchResults`, and `playerStats` collections to firestore.rules.
