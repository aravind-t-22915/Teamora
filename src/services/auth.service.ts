// src/services/auth.service.ts
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  updateProfile,
} from 'firebase/auth';
import {
  doc, setDoc, getDoc, serverTimestamp, collection, query, where, getDocs,
} from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { COLLECTIONS, INVITE_CODE_LENGTH } from '../config/constants';
import { AppUser, Club, UserRole } from '../types';

function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < INVITE_CODE_LENGTH; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// True while registerCoach/registerPlayer is writing Firestore docs after creating
// the Firebase Auth user. onAuthStateChanged fires immediately on user creation,
// before the writes complete — this flag lets AuthContext skip the "no doc" logout.
let _registering = false;

export const authService = {
  isRegistering: () => _registering,

  /** Listen to Firebase Auth state changes */
  onAuthStateChanged: (cb: (user: User | null) => void) =>
    onAuthStateChanged(auth, cb),

  /** Register + create club (coach flow) */
  async registerCoach(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    clubName: string,
  ): Promise<AppUser> {
    _registering = true;
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const uid  = cred.user.uid;
    const displayName = `${firstName} ${lastName}`;
    await updateProfile(cred.user, { displayName });

    // Create the club first
    const clubRef    = doc(collection(db, COLLECTIONS.CLUBS));
    const inviteCode = generateInviteCode();
    const club: Club = {
      clubId:      clubRef.id,
      name:        clubName,
      slug:        clubName.toLowerCase().replace(/\s+/g, '-'),
      inviteCode,
      logoUrl:     '',
      primaryColor:'#22C55E',
      homeVenue:   '',
      city:        '',
      country:     '',
      adminIds:    [uid],
      memberCount: 1,
      season:      '2025-2026',
      createdAt:   serverTimestamp() as never,
      updatedAt:   serverTimestamp() as never,
    };
    await setDoc(clubRef, club);

    // Create user document
    const userRef = doc(db, COLLECTIONS.USERS, uid);
    const appUser: AppUser = {
      userId:       uid,
      clubId:       clubRef.id,
      email,
      displayName,
      firstName,
      lastName,
      photoUrl:     '',
      role:         'coach' as UserRole,
      status:       'active',
      position:     'unassigned',
      preferredFoot:'right',
      jerseyNumber: null,
      height:       null,
      weight:       null,
      dateOfBirth:  null,
      phone:        '',
      emergencyContactName:  '',
      emergencyContactPhone: '',
      groupIds:     [],
      joinedClubAt: serverTimestamp() as never,
      lastActiveAt: serverTimestamp() as never,
      fcmToken:     '',
      notificationPreferences: {
        practiceReminder:   true,
        matchReminder:      true,
        venueChange:        true,
        newReport:          true,
        newAnnouncement:    true,
        paymentReminder:    true,
        attendanceReminder: true,
      },
      createdAt: serverTimestamp() as never,
      updatedAt: serverTimestamp() as never,
    };
    await setDoc(userRef, appUser);
    _registering = false;
    return appUser;
  },

  /** Register player with invite code */
  async registerPlayer(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    inviteCode: string,
  ): Promise<AppUser> {
    _registering = true;
    // Find club by invite code
    const clubQuery = query(
      collection(db, COLLECTIONS.CLUBS),
      where('inviteCode', '==', inviteCode.toUpperCase()),
    );
    const clubSnap = await getDocs(clubQuery);
    if (clubSnap.empty) throw new Error('Invalid invite code');
    const club = clubSnap.docs[0].data() as Club;

    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const uid  = cred.user.uid;
    const displayName = `${firstName} ${lastName}`;
    await updateProfile(cred.user, { displayName });

    const userRef = doc(db, COLLECTIONS.USERS, uid);
    const appUser: AppUser = {
      userId:       uid,
      clubId:       club.clubId,
      email,
      displayName,
      firstName,
      lastName,
      photoUrl:     '',
      role:         'player',
      status:       'pending',   // awaiting coach approval
      position:     'unassigned',
      preferredFoot:'right',
      jerseyNumber: null,
      height:       null,
      weight:       null,
      dateOfBirth:  null,
      phone:        '',
      emergencyContactName:  '',
      emergencyContactPhone: '',
      groupIds:     [],
      joinedClubAt: serverTimestamp() as never,
      lastActiveAt: serverTimestamp() as never,
      fcmToken:     '',
      notificationPreferences: {
        practiceReminder:   true,
        matchReminder:      true,
        venueChange:        true,
        newReport:          true,
        newAnnouncement:    true,
        paymentReminder:    true,
        attendanceReminder: true,
      },
      createdAt: serverTimestamp() as never,
      updatedAt: serverTimestamp() as never,
    };
    await setDoc(userRef, appUser);
    _registering = false;
    return appUser;
  },

  /** Sign in existing user */
  async login(email: string, password: string): Promise<void> {
    await signInWithEmailAndPassword(auth, email, password);
  },

  /** Sign out */
  async logout(): Promise<void> {
    await signOut(auth);
  },

  /** Fetch AppUser document */
  async getUser(uid: string): Promise<AppUser | null> {
    const snap = await getDoc(doc(db, COLLECTIONS.USERS, uid));
    return snap.exists() ? (snap.data() as AppUser) : null;
  },

  /** Fetch Club document */
  async getClub(clubId: string): Promise<Club | null> {
    const snap = await getDoc(doc(db, COLLECTIONS.CLUBS, clubId));
    return snap.exists() ? (snap.data() as Club) : null;
  },
};
