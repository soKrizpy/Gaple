/**
 * Auth and cloud persistence helpers for Balakutak Master.
 *
 * Requires Google sign-in to be enabled and a Cloud Firestore database to exist.
 * Cloud data is namespaced by Firebase Auth UID; never trust client-submitted
 * competitive scores as cheat-proof without server-side validation.
 */
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  type User,
} from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  type DocumentData,
} from 'firebase/firestore';
import { auth, db, googleProvider } from './firebaseClient';
import type { LeaderboardEntry, PlayerProfile } from '../types';

const DEFAULT_PROFILE: PlayerProfile = {
  nickname: 'Pemain Warkop',
  highScore: 0,
  highestRound: 1,
  highestStreak: 0,
  gamesPlayed: 0,
  avatar: '🀄',
};

export function subscribeToAuth(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, callback);
}

export async function signInWithGoogle(): Promise<User> {
  // Mobile browsers often close or isolate OAuth popups. Use a full-page
  // redirect on phones, then finish the sign-in when the app returns.
  const isMobile = typeof navigator !== 'undefined'
    && /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
  if (isMobile) {
    await signInWithRedirect(auth, googleProvider);
    // Navigation should happen before this function returns.
    return new Promise<User>(() => {});
  }
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

export async function completeGoogleRedirect(): Promise<User | null> {
  const result = await getRedirectResult(auth);
  return result?.user ?? null;
}

export async function signOutPlayer(): Promise<void> {
  await signOut(auth);
}

export async function loadCloudPlayerProfile(user: User): Promise<PlayerProfile> {
  const profileRef = doc(db, 'players', user.uid);
  const snapshot = await getDoc(profileRef);
  if (!snapshot.exists()) {
    const initial: PlayerProfile = {
      ...DEFAULT_PROFILE,
      nickname: user.displayName?.trim().slice(0, 18) || DEFAULT_PROFILE.nickname,
      avatar: '🀄',
    };
    await setDoc(profileRef, {
      ...initial,
      email: user.email ?? null,
      updatedAt: serverTimestamp(),
    });
    return initial;
  }

  const data = snapshot.data();
  return {
    nickname: typeof data.nickname === 'string' ? data.nickname.slice(0, 18) : DEFAULT_PROFILE.nickname,
    highScore: finiteNonNegative(data.highScore, 0),
    highestRound: Math.max(1, finiteNonNegative(data.highestRound, 1)),
    highestStreak: finiteNonNegative(data.highestStreak, 0),
    gamesPlayed: finiteNonNegative(data.gamesPlayed, 0),
    avatar: typeof data.avatar === 'string' ? data.avatar : DEFAULT_PROFILE.avatar,
  };
}

export async function saveCloudPlayerProfile(
  user: User,
  profile: Partial<PlayerProfile>,
): Promise<PlayerProfile> {
  const current = await loadCloudPlayerProfile(user);
  const updated: PlayerProfile = {
    nickname: typeof profile.nickname === 'string'
      ? profile.nickname.trim().slice(0, 18) || current.nickname
      : current.nickname,
    highScore: Math.max(current.highScore, finiteNonNegative(profile.highScore, current.highScore)),
    highestRound: Math.max(current.highestRound, finiteNonNegative(profile.highestRound, current.highestRound)),
    highestStreak: Math.max(current.highestStreak, finiteNonNegative(profile.highestStreak, current.highestStreak)),
    gamesPlayed: Math.max(current.gamesPlayed, finiteNonNegative(profile.gamesPlayed, current.gamesPlayed)),
    avatar: typeof profile.avatar === 'string' ? profile.avatar : current.avatar,
  };

  await setDoc(doc(db, 'players', user.uid), {
    ...updated,
    email: user.email ?? null,
    updatedAt: serverTimestamp(),
  }, { merge: true });

  return updated;
}

export async function submitCloudLeaderboardEntry(
  user: User,
  params: Pick<LeaderboardEntry, 'score' | 'roundReached' | 'streak' | 'favRelic'>,
  profile: PlayerProfile,
): Promise<void> {
  const safeScore = finiteNonNegative(params.score, 0);
  const safeRound = Math.max(1, finiteNonNegative(params.roundReached, 1));
  const safeStreak = finiteNonNegative(params.streak, 0);
  const title = safeScore >= 100000
    ? 'Legenda Pos Ronda'
    : safeScore >= 60000
      ? 'Master Balak Warkop'
      : safeScore >= 30000
        ? 'Jawara Gaple Ronda'
        : 'Pemain Setia Warkop';

  // Random document ID allows multiple runs to appear in the leaderboard.
  const entryRef = doc(collection(db, 'leaderboard'));
  await setDoc(entryRef, {
    userId: user.uid,
    name: profile.nickname.slice(0, 18),
    title,
    score: safeScore,
    roundReached: safeRound,
    streak: safeStreak,
    timestamp: Date.now(),
    avatar: profile.avatar || '🀄',
    favRelic: params.favRelic || 'Korek Gas Toko',
    createdAt: serverTimestamp(),
  });
}

export async function loadCloudLeaderboard(maxEntries = 30): Promise<LeaderboardEntry[]> {
  const safeLimit = Math.max(1, Math.min(100, Math.floor(maxEntries)));
  const entriesQuery = query(
    collection(db, 'leaderboard'),
    orderBy('score', 'desc'),
    limit(safeLimit),
  );
  const snapshot = await getDocs(entriesQuery);
  return snapshot.docs.map((item) => {
    const data: DocumentData = item.data();
    return {
      id: item.id,
      userId: typeof data.userId === 'string' ? data.userId : undefined,
      name: typeof data.name === 'string' ? data.name : 'Pemain Warkop',
      title: typeof data.title === 'string' ? data.title : 'Pemain Setia Warkop',
      score: finiteNonNegative(data.score, 0),
      roundReached: Math.max(1, finiteNonNegative(data.roundReached, 1)),
      streak: finiteNonNegative(data.streak, 0),
      timestamp: finiteNonNegative(data.timestamp, Date.now()),
      avatar: typeof data.avatar === 'string' ? data.avatar : '🀄',
      favRelic: typeof data.favRelic === 'string' ? data.favRelic : undefined,
    };
  });
}

function finiteNonNegative(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0
    ? Math.floor(value)
    : fallback;
}
