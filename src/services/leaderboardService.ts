/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LeaderboardEntry, PlayerProfile } from '../types';

const STORAGE_LEADERBOARD_KEY = 'domino_gaple_leaderboard_v2';
const STORAGE_PLAYER_PROFILE_KEY = 'domino_gaple_player_profile_v2';

// Daftar Juara Awal Komunitas Warkop Pos Ronda
const DEFAULT_COMMUNITY_LEADERBOARD: LeaderboardEntry[] = [
  {
    id: 'lb_1',
    name: 'Bang Jampang',
    title: 'Jawara Pos Ronda Utama',
    score: 148500,
    roundReached: 15,
    streak: 8,
    timestamp: Date.now() - 3600 * 1000 * 4,
    avatar: '🤠',
    favRelic: 'Korek Gas Toko',
  },
  {
    id: 'lb_2',
    name: 'Pak RT Mulyadi',
    title: 'Sesepuh Balak Enam',
    score: 112400,
    roundReached: 12,
    streak: 6,
    timestamp: Date.now() - 3600 * 1000 * 18,
    avatar: '☕',
    favRelic: 'Cangkir Kopi Hitam',
  },
  {
    id: 'lb_3',
    name: 'Cak Dul Gaple',
    title: 'Master Rantai Pantura',
    score: 95800,
    roundReached: 10,
    streak: 7,
    timestamp: Date.now() - 3600 * 1000 * 30,
    avatar: '🔥',
    favRelic: 'Akik Merah Delima',
  },
  {
    id: 'lb_4',
    name: 'Kang Asep Garut',
    title: 'Pawang Kipas Sate',
    score: 79250,
    roundReached: 9,
    streak: 5,
    timestamp: Date.now() - 3600 * 1000 * 48,
    avatar: '🍢',
    favRelic: 'Kipas Sate Sakti',
  },
  {
    id: 'lb_5',
    name: 'Mas Budi Gardu 3',
    title: 'Spesialis Tutup Meja',
    score: 64800,
    roundReached: 8,
    streak: 5,
    timestamp: Date.now() - 3600 * 1000 * 72,
    avatar: '🎲',
    favRelic: 'Asbak Kaleng Penuh',
  },
  {
    id: 'lb_6',
    name: 'Mpok Minah Kopi',
    title: 'Ratu Es Teh Manis',
    score: 51200,
    roundReached: 7,
    streak: 4,
    timestamp: Date.now() - 3600 * 1000 * 96,
    avatar: '🥤',
    favRelic: 'Cangkir Kopi Hitam',
  },
  {
    id: 'lb_7',
    name: 'Bang Udin Keriting',
    title: 'Jagoan Balak Kosong',
    score: 38900,
    roundReached: 5,
    streak: 4,
    timestamp: Date.now() - 3600 * 1000 * 120,
    avatar: '😎',
    favRelic: 'Korek Gas Toko',
  },
];

const DEFAULT_PLAYER_PROFILE: PlayerProfile = {
  nickname: 'Pemain Warkop',
  highScore: 0,
  highestRound: 1,
  highestStreak: 0,
  gamesPlayed: 0,
  avatar: '🀄',
};

/**
 * Memuat profil pemain saat ini dari LocalStorage
 */
export function getStoredPlayerProfile(): PlayerProfile {
  if (typeof window === 'undefined') return DEFAULT_PLAYER_PROFILE;
  try {
    const raw = localStorage.getItem(STORAGE_PLAYER_PROFILE_KEY);
    if (!raw) return DEFAULT_PLAYER_PROFILE;
    return { ...DEFAULT_PLAYER_PROFILE, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PLAYER_PROFILE;
  }
}

/**
 * Menyimpan profil pemain (nama julukan & statistik)
 */
export function savePlayerProfile(profile: Partial<PlayerProfile>): PlayerProfile {
  const current = getStoredPlayerProfile();
  const updated: PlayerProfile = { ...current, ...profile };
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_PLAYER_PROFILE_KEY, JSON.stringify(updated));
    }
  } catch (e) {
    console.error('Gagal menyimpan profil pemain:', e);
  }
  return updated;
}

/**
 * Memuat seluruh entri leaderboard tersimpan
 */
export function loadLeaderboardEntries(): LeaderboardEntry[] {
  if (typeof window === 'undefined') return DEFAULT_COMMUNITY_LEADERBOARD;
  try {
    const raw = localStorage.getItem(STORAGE_LEADERBOARD_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_LEADERBOARD_KEY, JSON.stringify(DEFAULT_COMMUNITY_LEADERBOARD));
      return DEFAULT_COMMUNITY_LEADERBOARD;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return DEFAULT_COMMUNITY_LEADERBOARD;
    }
    return parsed;
  } catch {
    return DEFAULT_COMMUNITY_LEADERBOARD;
  }
}

/**
 * Menyimpan skor babak/permainan ke leaderboard & update personal best
 */
export function recordLeaderboardScore(params: {
  score: number;
  roundReached: number;
  streak: number;
  favRelicName?: string;
}): { newRank: number; isNewHighScore: boolean; entry: LeaderboardEntry } {
  const profile = getStoredPlayerProfile();
  const isNewHighScore = params.score > profile.highScore;

  // Update profil pemain
  const updatedProfile = savePlayerProfile({
    highScore: Math.max(profile.highScore, params.score),
    highestRound: Math.max(profile.highestRound, params.roundReached),
    highestStreak: Math.max(profile.highestStreak, params.streak),
    gamesPlayed: profile.gamesPlayed + 1,
  });

  const playerTitle =
    params.score >= 100000
      ? 'Legenda Pos Ronda'
      : params.score >= 60000
      ? 'Master Balak Warkop'
      : params.score >= 30000
      ? 'Jawara Gaple Ronda'
      : 'Pemain Setia Warkop';

  const newEntry: LeaderboardEntry = {
    id: `player_score_${Date.now()}`,
    name: updatedProfile.nickname || 'Pemain Warkop',
    title: playerTitle,
    score: params.score,
    roundReached: params.roundReached,
    streak: params.streak,
    timestamp: Date.now(),
    avatar: updatedProfile.avatar || '🀄',
    isCurrentPlayer: true,
    favRelic: params.favRelicName || 'Korek Gas Toko',
  };

  const existingEntries = loadLeaderboardEntries();
  // Filter duplikat skor pemain yang lebih rendah jika ada
  const filtered = existingEntries.filter(
    (e) => !(e.isCurrentPlayer && e.score <= params.score)
  );

  const combined = [...filtered, newEntry].sort((a, b) => b.score - a.score);
  // Simpan maksimal 30 skor teratas
  const topList = combined.slice(0, 30);

  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_LEADERBOARD_KEY, JSON.stringify(topList));
    }
  } catch (e) {
    console.error('Gagal menyimpan skor ke leaderboard:', e);
  }

  const newRank = topList.findIndex((e) => e.id === newEntry.id) + 1;
  return { newRank: newRank > 0 ? newRank : topList.length, isNewHighScore, entry: newEntry };
}

/**
 * Filter leaderboard berdasarkan rentang waktu: All Time, Mingguan, Harian
 */
export function getFilteredLeaderboard(
  timeframe: 'all_time' | 'weekly' | 'daily'
): LeaderboardEntry[] {
  const list = loadLeaderboardEntries();
  const now = Date.now();
  const oneDay = 24 * 3600 * 1000;
  const oneWeek = 7 * oneDay;

  let filtered = list;
  if (timeframe === 'daily') {
    filtered = list.filter((e) => now - e.timestamp <= oneDay || e.isCurrentPlayer);
  } else if (timeframe === 'weekly') {
    filtered = list.filter((e) => now - e.timestamp <= oneWeek || e.isCurrentPlayer);
  }

  // Jika filter menghasilkan sedikit data, pastikan tetap ada minimal entries
  if (filtered.length < 3) {
    filtered = list.slice(0, 6);
  }

  return [...filtered].sort((a, b) => b.score - a.score);
}

/**
 * Teks template share yang menarik untuk media sosial
 */
export function generateShareText(params: {
  playerName: string;
  score: number;
  round: number;
  rank?: number;
}): string {
  const rankText = params.rank ? `Peringkat #${params.rank}` : 'Rekor Baru';
  return `🀄 BALAKUTAK MASTER - POS RONDA WARKOP 🀄\n\n` +
    `👤 Jawara: ${params.playerName}\n` +
    `🏆 Total Skor: ${params.score.toLocaleString('id-ID')} Poin!\n` +
    `📍 Berhasil Menembus: Pos Ronda ${params.round}\n` +
    `🎖️ ${rankText} di Papan Klasemen Warkop!\n\n` +
    `Buktikan keahlian strategi domino dan jimat sakti kamu! Siapa berani kalahkan rekor saya? 🔥\n` +
    `Mainkan gratis sekarang: ${typeof window !== 'undefined' ? window.location.origin : ''}`;
}

/**
 * Membuka Web Share API bawaan perangkat atau fallback ke clipboard
 */
export async function shareScoreToSocial(params: {
  playerName: string;
  score: number;
  round: number;
  rank?: number;
}): Promise<'native' | 'clipboard' | 'failed'> {
  const text = generateShareText(params);
  const title = 'Rekor Skor Balakutak Master';
  const url = typeof window !== 'undefined' ? window.location.href : '';

  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({
        title,
        text,
        url,
      });
      return 'native';
    } catch (err: any) {
      if (err.name === 'AbortError') return 'native';
    }
  }

  // Fallback salin ke clipboard
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(text);
      return 'clipboard';
    } catch {
      return 'failed';
    }
  }

  return 'failed';
}

/**
 * Link langsung untuk share ke WhatsApp
 */
export function getWhatsAppShareUrl(text: string): string {
  return `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
}

/**
 * Link langsung untuk share ke X / Twitter
 */
export function getTwitterShareUrl(text: string): string {
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
}

/**
 * Link langsung untuk share ke Telegram
 */
export function getTelegramShareUrl(text: string): string {
  return `https://t.me/share/url?text=${encodeURIComponent(text)}&url=${encodeURIComponent(
    typeof window !== 'undefined' ? window.location.origin : ''
  )}`;
}
