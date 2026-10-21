import { DailyMission, MissionType } from '../types';

/**
 * dailyMissionService.ts
 * Mengelola sistem 3 Misi Harian per hari dengan penyimpanan localStorage
 * dan reset otomatis setiap pergantian tanggal.
 */

const STORAGE_KEY_DATE = 'domino_daily_missions_date';
const STORAGE_KEY_DATA = 'domino_daily_missions_data';

export const MISSION_POOL: Omit<DailyMission, 'current' | 'isCompleted' | 'isClaimed'>[] = [
  {
    id: 'misi_win_2',
    title: 'Peronda Tangguh',
    description: 'Menangkan 2 babak Pos Ronda dengan melampaui target skor.',
    icon: '🏆',
    type: 'win_rounds',
    target: 2,
    rewardCoins: 10,
  },
  {
    id: 'misi_place_10',
    title: 'Rantai Batu Panjang',
    description: 'Pasang dan sambungkan 10 batu domino ke meja pos ronda.',
    icon: '🀄',
    type: 'place_dominoes',
    target: 10,
    rewardCoins: 8,
  },
  {
    id: 'misi_kipas_sate',
    title: 'Tukang Kipas Sakti',
    description: 'Gunakan kekuatan jimat Kipas Sate (Wildcard) sekali dalam ronde.',
    icon: '🪭',
    type: 'use_kipas',
    target: 1,
    rewardCoins: 6,
  },
  {
    id: 'misi_balak_3',
    title: 'Jawara Balak',
    description: 'Pasang 3 batu Balak kembar (0-0 s/d 6-6) ke atas meja.',
    icon: '💎',
    type: 'place_balak',
    target: 3,
    rewardCoins: 8,
  },
  {
    id: 'misi_score_1000',
    title: 'Banjir Poin Ronda',
    description: 'Kumpulkan skor minimal 1.000 poin dalam satu babak permainan.',
    icon: '⚡',
    type: 'reach_score',
    target: 1000,
    rewardCoins: 12,
  },
  {
    id: 'misi_discard_3',
    title: 'Taktik Buang Kartu',
    description: 'Gunakan kuota buang batu (discard) sebanyak 3 kali untuk menukar batu.',
    icon: '🗑️',
    type: 'discard_tiles',
    target: 3,
    rewardCoins: 6,
  },
  {
    id: 'misi_gaple_1',
    title: 'Kuncian Maut',
    description: 'Picu kondisi Meja Gaple (Deadlock) untuk ledakan skor sisa titik.',
    icon: '🔒',
    type: 'trigger_gaple',
    target: 1,
    rewardCoins: 10,
  },
];

/**
 * Dapatkan string tanggal lokal (YYYY-MM-DD)
 */
export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Hasilkan 3 misi harian acak deterministik berdasarkan tanggal
 */
export function generateMissionsForDate(dateStr: string): DailyMission[] {
  // Hash sederhana dari string tanggal
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = (hash << 5) - hash + dateStr.charCodeAt(i);
    hash |= 0;
  }

  // Acak pool berdasarkan hash
  const poolCopy = [...MISSION_POOL];
  const selected: DailyMission[] = [];

  for (let i = 0; i < 3; i++) {
    const index = Math.abs(hash + i * 17) % poolCopy.length;
    const item = poolCopy.splice(index, 1)[0];
    selected.push({
      ...item,
      current: 0,
      isCompleted: false,
      isClaimed: false,
    });
  }

  return selected;
}

/**
 * Muat atau buat 3 misi harian untuk hari ini
 */
export function loadDailyMissions(): DailyMission[] {
  const today = getTodayDateString();

  if (typeof window !== 'undefined') {
    try {
      const savedDate = localStorage.getItem(STORAGE_KEY_DATE);
      const savedData = localStorage.getItem(STORAGE_KEY_DATA);

      if (savedDate === today && savedData) {
        return JSON.parse(savedData);
      }
    } catch {
      // Fallback jika localStorage error
    }
  }

  // Jika hari baru atau belum ada data, buat 3 misi baru
  const newMissions = generateMissionsForDate(today);
  saveDailyMissions(newMissions);
  return newMissions;
}

/**
 * Simpan misi harian ke localStorage
 */
export function saveDailyMissions(missions: DailyMission[]) {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY_DATE, getTodayDateString());
      localStorage.setItem(STORAGE_KEY_DATA, JSON.stringify(missions));
    } catch {
      // ignore
    }
  }
}

/**
 * Perbarui progres misi berdasarkan aksi pemain
 */
export function trackMissionAction(
  missions: DailyMission[],
  type: MissionType,
  amount: number = 1
): { updatedMissions: DailyMission[]; newlyCompleted: DailyMission[] } {
  let hasChange = false;
  const newlyCompleted: DailyMission[] = [];

  const updatedMissions = missions.map((mission) => {
    if (mission.type === type && !mission.isCompleted) {
      hasChange = true;
      const newCurrent = mission.type === 'reach_score' 
        ? Math.max(mission.current, amount)
        : mission.current + amount;
      
      const isCompleted = newCurrent >= mission.target;
      if (isCompleted) {
        newlyCompleted.push({ ...mission, current: newCurrent, isCompleted: true });
      }

      return {
        ...mission,
        current: Math.min(newCurrent, mission.target),
        isCompleted,
      };
    }
    return mission;
  });

  if (hasChange) {
    saveDailyMissions(updatedMissions);
  }

  return { updatedMissions, newlyCompleted };
}

/**
 * Hitung sisa waktu hingga reset tengah malam
 */
export function getTimeUntilReset(): string {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setHours(24, 0, 0, 0);

  const diffMs = tomorrow.getTime() - now.getTime();
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  return `${hours}j ${minutes}m`;
}
