# Gap Analysis
**Teamora — FC Revelation**
**Audit Date:** 2026-09-04

---

| Requirement | Current State | Gap | Priority | Recommended Action |
|---|---|---|---|---|
| **Authentication** | | | | |
| Email/password login | Complete | — | — | — |
| Coach registration | Complete | Club name hardcoded | P1 | Make club name an input field |
| Player invite code join | Complete | — | — | — |
| Player approval | Complete | — | — | — |
| Password reset | Missing | No "forgot password" flow | P2 | Add Firebase sendPasswordResetEmail |
| Email verification | Missing | Any email accepted | P2 | Add sendEmailVerification |
| **Team Management** | | | | |
| Club information | Partial | Name hardcoded; no logo upload; memberCount not updated | P1 | Allow coach to set club name at registration |
| Season management | Missing | Season hardcoded in constants.ts | P2 | Allow season to be set in clubSettings |
| Invite code display | Missing | Code generated but not shown to coach | P1 | Show invite code on Profile/Settings screen |
| **Player Management** | | | | |
| Player profile (basic fields) | Complete | — | — | — |
| Jersey number | Complete | No uniqueness check | P2 | Client-side warn if duplicate number |
| Position | Complete | — | — | — |
| Player photo | Missing | No profile photo upload UI | P2 | Add image picker to EditProfile |
| Player status (active/pending/suspended) | Complete | — | — | — |
| Emergency contacts | Stored in schema | No UI to view/edit | P2 | Add to EditProfile screen |
| **Training** | | | | |
| Training sessions | Complete | 'practice' event type | — | — |
| Training attendance | Complete | Via event attendance system | — | — |
| Attendance status: Present | Complete | 'going' maps to present | — | — |
| Attendance status: Absent | Complete | 'not_going' | — | — |
| Attendance status: Late | Complete | 'late' | — | — |
| Attendance status: Excused | Partial | No 'excused' status — 'maybe' is closest | P2 | Add 'excused' attendance status |
| **Matches** | | | | |
| Match creation (all types) | Complete | — | — | — |
| Opponent, competition, home/away | Complete | — | — | — |
| Match result entry | Complete | — | — | — |
| Match status (scheduled/live/completed/cancelled) | Partial | Only 'scheduled' and 'completed' used; no 'live' mode | P2 | Add match start/end actions |
| **Match Squad** | | | | |
| Starting XI | Complete | Lineup builder implemented | — | — |
| Substitutes | Complete | — | — | — |
| Formation selector | Complete | — | — | — |
| Unavailable players | Partial | Schema has `unavailable: string[]` but no UI | P2 | Add unavailable toggle in Lineup Builder |
| **Match Events / Timeline** | | | | |
| Goal | Complete | Minute, player, assist, own goal, penalty flags | — | — |
| Assist | Complete | Linked to goal event | — | — |
| Yellow card | Complete | — | — | — |
| Red card | Complete | — | — | — |
| Substitution | Complete | Sub on/off player pickers | — | — |
| Shot | Missing | Not in timeline event types | P2 | Add to TimelineEventType enum |
| Shot on target | Missing | — | P2 | Same as above |
| Save (goalkeeper) | Missing | — | P2 | Add to TimelineEventType |
| Tackle / Interception | Missing | Not in blueprint timeline but in stats requirements | P3 | Low priority for V1 |
| Event deletion | Complete | With confirmation dialog | — | — |
| Event editing | Missing | Cannot edit a timeline event after adding | HIGH | Add edit functionality to TimelineEditorScreen |
| **Player Statistics** | | | | |
| Appearances | Broken | playerStats never updated | **CRITICAL** | Wire stats calculation to match result save |
| Starts | Broken | — | **CRITICAL** | Same as above |
| Minutes played | Missing | No calculation from substitutions | HIGH | Calculate from lineup + substitution events |
| Goals | Broken | — | **CRITICAL** | Wire stats |
| Assists | Broken | — | **CRITICAL** | Wire stats |
| Yellow cards | Broken | — | **CRITICAL** | Wire stats |
| Red cards | Broken | — | **CRITICAL** | Wire stats |
| Goals per 90 | Missing | Derived stat | P1 | Calculate after minutes and goals are correct |
| Assists per 90 | Missing | Derived stat | P1 | Calculate after fixing base stats |
| Attendance percentage | Broken | Never calculated | P1 | Calculate from attendance records on read |
| **Dashboard / Statistics Screen** | | | | |
| Match record (W/D/L) | Complete | Derived from events with results | — | — |
| Goals for/against | Partial | Only counts homeGoals (always assumes team is home) | HIGH | Fix to account for away games |
| Top scorer leaderboard | Broken | All zeros | CRITICAL | Fix stats calculation |
| Top assists leaderboard | Broken | All zeros | CRITICAL | Fix stats calculation |
| MOTM leaderboard | Broken | All zeros | CRITICAL | Fix stats calculation |
| Attendance leaderboard | Broken | All zeros | CRITICAL | Fix stats calculation |
| Home screen W/D/L banner | Broken | Hardcoded zeros | HIGH | Wire to actual match results |
| **Mobile / UX** | | | | |
| Date picker (not text input) | Missing | Plain text YYYY-MM-DD input | HIGH | Replace with DateTimePicker |
| Time picker | Partial | Plain text HH:MM input | P2 | Replace with TimePickerInput |
| Live match mode (fast event entry) | Missing | 13+ steps to record a goal | HIGH | Add quick-entry flow or match mode shortcut |
| Match running score from timeline | Missing | Score only from entered result | P2 | Derive score from goal events in timeline |
| Error boundaries on screens | Missing | App will crash on unhandled errors | P2 | Add ErrorBoundary to feature screens |
| Skeleton loaders | Missing | Spinners only | P3 | Nice-to-have |
| **Backup / Export** | | | | |
| Data export | Missing | — | P2 | CSV export for match results and player stats |
| JSON backup | Missing | — | P3 | Full Firestore export |
| **Security** | | | | |
| matchData/matchResults Firestore rules | Missing | Collections not covered in rules | HIGH | Add to firestore.rules |
| Firebase App Check | Missing | — | P2 | Prevent API abuse |
| Coach notes access (server-side) | Partial | Any active member can read coachNotes field | P2 | Move to restricted sub-collection or matchData |
| **Testing** | | | | |
| Unit tests | Missing | Zero tests | P1 | Start with stats calculation functions |
| Integration tests | Missing | — | P2 | Attendance transaction, result save |
| E2E tests | Missing | — | P3 | Register → Create Event → Record Goal → Check Stat |
| **Other** | | | | |
| Invite code shown to coach | Missing | Code generated but not visible in UI | P1 | Show in Profile/Settings screen |
| Club name as user input at registration | Missing | Hardcoded to "FC Revelation" | P1 | Add club name field to RegisterScreen |
| userInterfaceStyle "dark" in app.json | Wrong | Set to "light" | P1 | Change to "dark" or "automatic" |
| matchResults not in COLLECTIONS constant | Minor | Hardcoded string | P2 | Add MATCH_RESULTS to constants.ts |
| react-native-paper unused dependency | Technical debt | Adds bundle size | P3 | Remove from package.json |
| expo-location unused dependency | Technical debt | Adds bundle size | P3 | Remove from package.json |
