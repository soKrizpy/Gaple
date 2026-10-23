/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Domino, PlacedTile, Relic } from '../types';

/**
 * Membuat set lengkap 28 batu domino standar (0-0 hingga 6-6)
 */
export function createDominoSet(): Domino[] {
  const set: Domino[] = [];
  for (let i = 0; i <= 6; i++) {
    for (let j = i; j <= 6; j++) {
      set.push({
        id: `${i}-${j}`,
        head: i,
        tail: j,
        isDouble: i === j,
      });
    }
  }
  return set;
}

/**
 * Mengacak array batu domino (Fisher-Yates shuffle)
 */
export function shuffleDominos(tiles: Domino[]): Domino[] {
  const shuffled = [...tiles];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Target Skor per Babak Pos Ronda (Eksponensial ala Balatro):
 * Babak 1 = 300, Babak 2 = 800, Babak 3 = 2.000, Babak 4 = 5.000, Babak 5 = 12.000, dst.
 */
export function getTargetScoreForRound(round: number): number {
  const targets: Record<number, number> = {
    1: 300,
    2: 800,
    3: 2000,
    4: 5000,
    5: 12000,
    6: 25000,
    7: 50000,
    8: 100000,
  };
  if (targets[round]) return targets[round];
  return Math.round(12000 * Math.pow(2.2, round - 5));
}

/**
 * 7 Jimat Warkop Awal & Relik Pendukung (Maksimal 5 Slot Terpasang)
 */
export const AVAILABLE_RELICS: Relic[] = [
  {
    id: 'jimat_korek',
    name: 'Korek Gas Toko',
    desc: 'Setiap batu berangka 6 memberikan +15 Titik (Chips) dan +3 Pengali (Mult).',
    icon: '🔥',
    rarity: 'common',
    chipsBonus: 15,
    multBonus: 3,
    conditionDescription: 'Aktif saat batu yang dimainkan memiliki mata 6',
  },
  {
    id: 'jimat_kopi',
    name: 'Cangkir Kopi Hitam',
    desc: 'Menambah +1 kuota pasang batu jika berhasil memasang batu Balak (kembar).',
    icon: '☕',
    rarity: 'rare',
    chipsBonus: 20,
    multBonus: 2,
    conditionDescription: 'Aktif saat memasang batu Balak: kuota pasang bertambah +1!',
  },
  {
    id: 'jimat_asbak',
    name: 'Asbak Penuh',
    desc: 'Batu yang memuat angka 0 memberi +25 Titik dan bonus skor 1,5× pada langkah itu.',
    icon: '🚬',
    rarity: 'rare',
    chipsBonus: 25,
    multBonus: 0,
    multMultiplier: 1.5,
    conditionDescription: 'Aktif saat memasang batu yang memuat angka 0; bonus 1,5× berlaku pada langkah itu.',
  },
  {
    id: 'jimat_kipas',
    name: 'Kipas Sate',
    desc: 'Sekali per ronde, aktifkan Wildcard untuk menyambung batu apa saja. Aktivasi memberi +10 Titik dan +1 Pengali pada langkah tersebut.',
    icon: '🪭',
    rarity: 'legendary',
    chipsBonus: 10,
    multBonus: 1,
    isWildcard: true,
    conditionDescription: 'Aktifkan tombol Kipas Sate sebelum memasang batu untuk sambungan bebas dan bonus skor.',
  },
  {
    id: 'jimat_akik',
    name: 'Batu Akik Merah',
    desc: 'Batu dengan total titik ganjil memberi +10 Titik dan bonus acak +2 hingga +8 Pengali.',
    icon: '💍',
    rarity: 'rare',
    chipsBonus: 10,
    multBonus: 4,
    conditionDescription: 'Aktif saat total titik batu ganjil: +10 Titik dan +2–8 Pengali acak.',
  },
  {
    id: 'jimat_balak',
    name: 'Balak Kembar Sakti',
    desc: 'Batu balak (kembar) memberi tambahan +25 Titik dan +2 Pengali.',
    icon: '💎',
    rarity: 'rare',
    chipsBonus: 25,
    multBonus: 2,
    conditionDescription: 'Aktif saat memasang batu balak (kembar)',
  },
  {
    id: 'jimat_gaple',
    name: 'Gong Kunci Gaple',
    desc: 'Ledakan Meja Gaple (Deadlock) memakai pengali 5× total sisa titik di tangan (dasar 3×).',
    icon: '🔔',
    rarity: 'legendary',
    chipsBonus: 50,
    multBonus: 5,
    multMultiplier: 2,
    conditionDescription: 'Mengubah pengali ledakan Gaple dari 3× menjadi 5×.',
  },
];

/**
 * Cek apakah batu bisa dipasang ke ujung kiri atau kanan meja.
 * Jika isWildcardActive = true (efek Kipas Sate), semua batu sah di kedua ujung.
 */
export function checkTilePlayable(
  tile: Domino,
  leftEnd: number | null,
  rightEnd: number | null,
  isWildcardActive: boolean = false
): { canPlayLeft: boolean; canPlayRight: boolean } {
  if (isWildcardActive) {
    return { canPlayLeft: true, canPlayRight: true };
  }

  if (leftEnd === null || rightEnd === null) {
    return { canPlayLeft: true, canPlayRight: true };
  }

  const { head, tail } = tile;
  const canPlayLeft = head === leftEnd || tail === leftEnd;
  const canPlayRight = head === rightEnd || tail === rightEnd;

  return { canPlayLeft, canPlayRight };
}

/**
 * Periksa apakah pemain memiliki minimal satu batu yang bisa disambungkan
 */
export function playerHasValidMoves(
  hand: Domino[],
  leftEnd: number | null,
  rightEnd: number | null,
  isWildcardActive: boolean = false
): boolean {
  if (isWildcardActive) return hand.length > 0;
  if (leftEnd === null || rightEnd === null) return hand.length > 0;
  return hand.some((tile) => {
    const { canPlayLeft, canPlayRight } = checkTilePlayable(tile, leftEnd, rightEnd, isWildcardActive);
    return canPlayLeft || canPlayRight;
  });
}

/**
 * Hitung jumlah sisa titik dalam tangan pemain
 */
export function calculateHandPipSum(hand: Domino[]): number {
  return hand.reduce((sum, tile) => sum + tile.head + tile.tail, 0);
}

/**
 * Hitung skor ledakan Gaple Deadlock:
 * "Hitung sisa seluruh titik di tangan pemain lalu kalikan dengan 3 sebagai skor ledakan terakhir ronde tersebut"
 */
export function calculateGapleExplosionScore(hand: Domino[], relics: Relic[] = []): {
  pipSum: number;
  multiplier: number;
  explosionScore: number;
} {
  const pipSum = calculateHandPipSum(hand);
  let multiplier = 3;

  // Jika memiliki jimat Gong Kunci Gaple
  const hasGongRelic = relics.some((r) => r.id === 'jimat_gaple');
  if (hasGongRelic) {
    multiplier = 5;
  }

  const explosionScore = pipSum * multiplier;
  return { pipSum, multiplier, explosionScore };
}

/**
 * Rumus Skor Pos Ronda (ala Balatro):
 * Total Skor = Chips (Titik) × Mult (Pengali)
 *
 * Aturan Dasar:
 * - Chips dasar = jumlah titik pada batu tersebut.
 * - Streak adalah Chain Combo: hanya balak yang benar-benar cocok dengan ujung meja menaikkan streak.
 * - Streak yang sudah terkumpul bertahan saat batu biasa dipasang; discard memutusnya di App.
 * - Bonus Balak: semua balak tetap memberi pengganda instan Mult × 2.
 *
 * Efek Jimat Warkop:
 * 1. Korek Gas Toko: Setiap batu berangka 6 -> +15 Chips & +3 Mult
 * 2. Cangkir Kopi Hitam: Memasang batu Balak -> Kuota pasang bertambah +1!
 * 3. Asbak Penuh: Batu yang memuat 0 memberi +25 Chips dan skor langkah ×1.5
 * 4. Kipas Sate: Wildcard sambung bebas
 * 5. Batu Akik Merah: Titik ganjil -> Pengali acak antara +2 hingga +8 Mult!
 * 6. Balak Kembar Sakti: +25 Chips & +2 Mult
 */
export function calculateMoveScorePosRonda(
  tile: Domino,
  currentStreak: number,
  relics: Relic[],
  handRemainingCount: number,
  wildcardActive: boolean = false
): {
  chips: number;            // Titik batu
  mult: number;             // Pengali kombo
  totalMoveScore: number;   // Titik × Pengali
  isBalak: boolean;         // Apakah balak (Mult × 2)
  triggeredRelics: string[];
  bonusPlaysGranted: number; // Dari Cangkir Kopi Hitam
  akikBonusRoll: number | null;
  hasAsbakTrigger: boolean;
} {
  // 1. Titik Dasar = jumlah titik pada batu tersebut
  let chips = tile.head + tile.tail;
  
  // 2. Chain Combo memberi bonus nyata: +1 Mult per tingkat streak,
  //    ditambah +2 Mult pada tingkat ke-3, 6, 9, dan seterusnya.
  //    App hanya menaikkan streak saat balak cocok dengan ujung meja, dan reset saat discard.
  const streakMilestoneBonus = Math.floor(currentStreak / 3) * 2;
  let mult = 1 + currentStreak + streakMilestoneBonus;

  // 3. Bonus Balak: Jika memasang batu Balak (kembar), berikan pengganda instan: Mult × 2!
  const isBalak = tile.isDouble;
  if (isBalak) {
    mult = mult * 2;
  }

  // 4. Periksa efek Jimat Warkop aktif
  const triggeredRelics: string[] = [];
  let bonusPlaysGranted = 0;
  let akikBonusRoll: number | null = null;
  let hasAsbakTrigger = false;

  relics.forEach((relic) => {
    // 1. Korek Gas Toko: Setiap batu berangka 6 memberikan +15 Chips dan +3 Mult
    if (relic.id === 'jimat_korek') {
      const hasSix = tile.head === 6 || tile.tail === 6;
      if (hasSix) {
        const countSix = (tile.head === 6 ? 1 : 0) + (tile.tail === 6 ? 1 : 0);
        chips += 15 * countSix;
        mult += 3 * countSix;
        triggeredRelics.push(relic.id);
      }
    }

    // 2. Cangkir Kopi Hitam: Menambah +1 kuota pasang batu jika berhasil memasang batu Balak
    if (relic.id === 'jimat_kopi') {
      if (tile.isDouble) {
        bonusPlaysGranted += 1;
        chips += 20;
        mult += 2;
        triggeredRelics.push(relic.id);
      }
    }

    // 3. Asbak Penuh: bonus berlaku pada langkah batu bernilai 0 (bukan kondisi tangan kosong).
    if (relic.id === 'jimat_asbak') {
      const hasZero = tile.head === 0 || tile.tail === 0;
      if (hasZero) {
        chips += 25;
        hasAsbakTrigger = true;
        triggeredRelics.push(relic.id);
      }
    }

    // 4. Kipas Sate: bonus hanya saat wildcard benar-benar digunakan.
    if (relic.id === 'jimat_kipas' && wildcardActive) {
      chips += 10;
      mult += 1;
      triggeredRelics.push(relic.id);
    }

    // 5. Batu Akik Merah: Setiap batu bernilai ganjil memberikan pengali acak antara +2 hingga +8 Mult
    if (relic.id === 'jimat_akik') {
      const isOdd = (tile.head + tile.tail) % 2 !== 0;
      if (isOdd) {
        const roll = Math.floor(Math.random() * 7) + 2; // Acak 2 s/d 8
        akikBonusRoll = roll;
        chips += 10;
        mult += roll;
        triggeredRelics.push(relic.id);
      }
    }

    // Jimat Balak Kembar Sakti (tambahan)
    if (relic.id === 'jimat_balak' && tile.isDouble) {
      chips += relic.chipsBonus;
      mult += relic.multBonus;
      triggeredRelics.push(relic.id);
    }
  });

  let totalMoveScore = chips * mult;

  // Asbak Penuh memberi bonus 1.5× pada langkah yang memuat angka 0.
  if (hasAsbakTrigger) {
    totalMoveScore = Math.round(totalMoveScore * 1.5);
  }

  return {
    chips,
    mult,
    totalMoveScore,
    isBalak,
    triggeredRelics,
    bonusPlaysGranted,
    akikBonusRoll,
    hasAsbakTrigger,
  };
}
