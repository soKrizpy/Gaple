/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Domino {
  id: string;
  head: number; // 0 to 6
  tail: number; // 0 to 6
  isDouble: boolean;
}

export interface PlacedTile {
  id: string;
  domino: Domino;
  head: number; // The pip pointing back toward chain or left
  tail: number; // The pip pointing outward / toward open end
  side: 'center' | 'left' | 'right';
  x: number;
  y: number;
  angle: number; // In degrees
  isDouble: boolean;
  order: number;
}

export interface Relic {
  id: string;
  name: string;
  desc: string;
  icon: string;
  rarity: 'common' | 'rare' | 'legendary';
  chipsBonus: number; // Titik Tambahan
  multBonus: number;  // Pengali Tambahan
  multMultiplier?: number;
  conditionDescription: string;
  isWildcard?: boolean; // Khusus Kipas Sate
  price?: number;       // Harga koin di Toko Ronda
}

export interface ConsumableItem {
  id: string;
  name: string;
  desc: string;
  icon: string;
  price: number;
  effectType: 'make_balak' | 'add_discards' | 'instant_score';
}

export interface PosRondaState {
  currentRound: number; // Babak Pos Ronda (1, 2, 3...)
  targetScore: number;  // Target skor babak ini (300, 800, 2000...)
  playsLeft: number;    // Kuota pasang batu (Hands: default 4)
  discardsLeft: number; // Kuota buang batu (Discards: default 3)
  streak: number;       // Rantai sambungan tanpa putus (+1 Mult per streak)
  roundScore: number;   // Skor yang terkumpul di babak ini
  wildcardActive: boolean; // Aktif saat pemain mengaktifkan efek Kipas Sate
  wildcardUsedThisRound: boolean; // Kipas Sate hanya bisa 1x per ronde
}

export type RewardAdType = 'revive_round' | 'reroll_shop' | 'bonus_coins';

export type MissionType = 
  | 'win_rounds'
  | 'place_dominoes'
  | 'use_kipas'
  | 'place_balak'
  | 'reach_score'
  | 'discard_tiles'
  | 'trigger_gaple';

export interface DailyMission {
  id: string;
  title: string;
  description: string;
  icon: string;
  type: MissionType;
  target: number;
  current: number;
  rewardCoins: number;
  isCompleted: boolean;
  isClaimed: boolean;
}

export interface ScorePopupData {
  id: string;
  chips: number;
  mult: number;
  totalGain: number;
  x: number;
  y: number;
  relicsTriggered: string[];
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  score: number;
  roundReached: number;
  streak: number;
  timestamp: number;
  title: string; // e.g. "Jawara Pos Ronda", "Master Gaple Balak", "Sesepuh Warkop"
  avatar: string;
  isCurrentPlayer?: boolean;
  favRelic?: string;
}

export interface PlayerProfile {
  nickname: string;
  highScore: number;
  highestRound: number;
  highestStreak: number;
  gamesPlayed: number;
  avatar?: string;
}

