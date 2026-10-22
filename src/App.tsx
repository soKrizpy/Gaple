/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Domino,
  PlacedTile,
  Relic,
  PosRondaState,
  ConsumableItem,
  DailyMission,
  MissionType,
} from './types';
import {
  createDominoSet,
  shuffleDominos,
  AVAILABLE_RELICS,
  checkTilePlayable,
  playerHasValidMoves,
  calculateMoveScorePosRonda,
  calculateGapleExplosionScore,
  getTargetScoreForRound,
} from './utils/dominoLogic';
import { sounds } from './utils/soundEffects';
import {
  animateTilePlacementFlight,
  animateScoreResolution,
  animateRelicTrigger,
  animateDeadlockGaple,
  triggerConfettiExplosion,
  triggerFireSparks,
} from './AnimationController.js';
import { showRewardedAd } from './services/RewardedAdController';
import { loadDailyMissions, saveDailyMissions, trackMissionAction } from './services/dailyMissionService';

import { MainMenu } from './components/MainMenu';
import { ScoreHeader } from './components/ScoreHeader';
import { RelicBar } from './components/RelicBar';
import { GameBoard } from './components/GameBoard';
import { ControlDock } from './components/ControlDock';
import { GapleModal } from './components/GapleModal';
import { ShopModal } from './components/ShopModal';
import { RulesModal } from './components/RulesModal';
import { PauseModal } from './components/PauseModal';
import { DailyMissionsModal } from './components/DailyMissionsModal';
import { RewardedAdModal } from './components/RewardedAdModal';
import { LeaderboardPage } from './components/LeaderboardPage';
import { recordLeaderboardScore } from './services/leaderboardService';

export default function App() {
  // Screen State Machine: 'main_menu', 'game', atau 'leaderboard'
  const [screen, setScreen] = useState<'main_menu' | 'game' | 'leaderboard'>('main_menu');
  const previousScreenRef = useRef<'main_menu' | 'game'>('main_menu');
  const [isPauseOpen, setIsPauseOpen] = useState<boolean>(false);
  const [rewardedAdsUsed, setRewardedAdsUsed] = useState<number>(0);
  const MAX_REWARDED_ADS_PER_GAME = 3;

  // Responsiveness: Portrait / Landscape & Layar Tinggi Terbatas (Compact Height)
  const [isPortrait, setIsPortrait] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerHeight > window.innerWidth;
    }
    return false;
  });
  const [isCompactHeight, setIsCompactHeight] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerHeight < 720;
    }
    return false;
  });

  // State Babak Pos Ronda (Target, Kuota Pasang 4, Kuota Buang 3, Rantai Streak, Wildcard Kipas Sate)
  const [posRonda, setPosRonda] = useState<PosRondaState>({
    currentRound: 1,
    targetScore: getTargetScoreForRound(1),
    playsLeft: 4,
    discardsLeft: 3,
    streak: 0,
    roundScore: 0,
    wildcardActive: false,
    wildcardUsedThisRound: false,
  });

  // Misi Harian & Dompet Koin
  const [missions, setMissions] = useState<DailyMission[]>(() => loadDailyMissions());
  const [isMissionsOpen, setIsMissionsOpen] = useState<boolean>(false);
  const [coins, setCoins] = useState<number>(() => {
    if (typeof window === 'undefined') return 4;
    const saved = Number(localStorage.getItem('balakutak_wallet_coins'));
    return Number.isFinite(saved) && saved >= 0 ? saved : 4;
  });
  const [bonusScoreNextRound, setBonusScoreNextRound] = useState<number>(0);
  const [roundCoinsEarned, setRoundCoinsEarned] = useState<number>(0);

  // Toko Ronda Antar-Babak
  const [isShopOpen, setIsShopOpen] = useState<boolean>(false);
  const [shopRelics, setShopRelics] = useState<Relic[]>([]);

  // Board & Domino State (100% Solo)
  const [hand, setHand] = useState<Domino[]>([]);
  const [boneyard, setBoneyard] = useState<Domino[]>([]);
  const [placedTiles, setPlacedTiles] = useState<PlacedTile[]>([]);
  const [lastPlacedTileId, setLastPlacedTileId] = useState<string | null>(null);
  const [leftEnd, setLeftEnd] = useState<number | null>(null);
  const [rightEnd, setRightEnd] = useState<number | null>(null);

  // Selection & Scoring State
  const [selectedTile, setSelectedTile] = useState<Domino | null>(null);
  const [score, setScore] = useState<number>(0);
  const [currentChips, setCurrentChips] = useState<number>(0);
  const [currentMult, setCurrentMult] = useState<number>(1);

  // 5 Slot Jimat Warkop Awal (Maksimal 5)
  const [activeRelics, setActiveRelics] = useState<Relic[]>([
    AVAILABLE_RELICS[0], // Korek Gas Toko (Mata 6 -> +15 Titik & +3 Pengali)
    AVAILABLE_RELICS[1], // Cangkir Kopi Hitam (Pasang Balak -> +1 Kuota Pasang)
    AVAILABLE_RELICS[3], // Kipas Sate (Wildcard sambung bebas 1x per ronde)
  ]);

  // Pasif Banner Notification (misal: "+1 Kuota Pasang! (Kopi Hitam)")
  const [passiveNotice, setPassiveNotice] = useState<string | null>(null);

  // Round Results & Modals
  const [isDeadlock, setIsDeadlock] = useState<boolean>(false);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [roundBonusEarned, setRoundBonusEarned] = useState<number>(0);
  const [gapleExplosionData, setGapleExplosionData] = useState<{
    pipSum: number;
    multiplier: number;
    explosionScore: number;
  } | null>(null);
  const [relicChoices, setRelicChoices] = useState<Relic[]>([]);
  const [isRulesOpen, setIsRulesOpen] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  const isResolvingTurnRef = useRef<boolean>(false);

  // Hitung jumlah misi yang selesai tapi belum diklaim untuk badge notifikasi
  const unclaimedMissionsCount = missions.filter((m) => m.isCompleted && !m.isClaimed).length;

  // Helper untuk mencatat kemajuan misi harian
  const recordMission = useCallback((type: MissionType, amount: number = 1) => {
    setMissions((prev) => {
      const { updatedMissions } = trackMissionAction(prev, type, amount);
      saveDailyMissions(updatedMissions);
      return updatedMissions;
    });
  }, []);

  // Persist wallet locally until cloud account sync is configured.
  useEffect(() => {
    try { localStorage.setItem('balakutak_wallet_coins', String(coins)); } catch { /* storage may be unavailable */ }
  }, [coins]);

  // Resize listener
  useEffect(() => {
    const handleResize = () => {
      setIsPortrait(window.innerHeight > window.innerWidth);
      setIsCompactHeight(window.innerHeight < 720);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  // Acak 2 Jimat untuk Toko Ronda
  const rollShopRelics = useCallback((currentOwned: Relic[]) => {
    const available = AVAILABLE_RELICS.filter((r) => !currentOwned.some((ar) => ar.id === r.id));
    const shuffled = [...available].sort(() => Math.random() - 0.5);
    setShopRelics(shuffled.slice(0, 2).map((r) => ({
      ...r,
      price: r.rarity === 'legendary' ? 7 : r.rarity === 'rare' ? 5 : 4,
    })));
  }, []);

  // Inisialisasi Game atau Babak Baru (100% Solo)
  const initGame = useCallback((nextRoundNum: number = 1, bonusScoreStart: number = 0) => {
    const fullSet = shuffleDominos(createDominoSet());
    isResolvingTurnRef.current = false;

    // Solo Roguelike: 7 batu di tangan pemain, 21 batu di cadangan (boneyard)
    const initialHand = fullSet.slice(0, 7);
    const initialBoneyard = fullSet.slice(7);

    setPosRonda({
      currentRound: nextRoundNum,
      targetScore: getTargetScoreForRound(nextRoundNum),
      playsLeft: 4,      // 4 kali pasang batu per babak
      discardsLeft: 3,   // 3 kali buang batu per babak
      streak: 0,         // Reset rantai sambungan
      roundScore: bonusScoreStart,
      wildcardActive: false,
      wildcardUsedThisRound: false,
    });

    setHand(initialHand);
    setBoneyard(initialBoneyard);
    setPlacedTiles([]);
    setLastPlacedTileId(null);
    setLeftEnd(null);
    setRightEnd(null);
    setSelectedTile(null);
    setIsDeadlock(false);
    setIsGameOver(false);
    setIsShopOpen(false);
    setRoundBonusEarned(0);
    setGapleExplosionData(null);
    setRelicChoices([]);
    setPassiveNotice(null);
  }, []);

  // Memulai Permainan dari Menu Utama
  const handleStartGame = () => {
    setRewardedAdsUsed(0);
    sounds.playTileClack();
    setScore(0);
    initGame(1);
    setScreen('game');
  };

  // Kembali ke Menu Utama
  const handleReturnToMainMenu = () => {
    sounds.playTileClack();
    setScreen('main_menu');
    setIsPauseOpen(false);
    setIsGameOver(false);
    setIsDeadlock(false);
    setIsShopOpen(false);
  };

  // Ulangi Babak Ini
  const handleRestartRound = () => {
    sounds.playTileClack();
    initGame(posRonda.currentRound);
    setIsPauseOpen(false);
  };

  // Evaluasi langkah sah pemain
  const { canPlayLeft, canPlayRight } = selectedTile
    ? checkTilePlayable(selectedTile, leftEnd, rightEnd, posRonda.wildcardActive)
    : { canPlayLeft: false, canPlayRight: false };

  const hasValidMove = playerHasValidMoves(hand, leftEnd, rightEnd, posRonda.wildcardActive);

  // Mengaktifkan Efek Jimat Sakti Kipas Sate (Wildcard Sambung Bebas)
  const handleToggleWildcard = () => {
    if (posRonda.wildcardUsedThisRound) return;
    sounds.playKipasSate();
    setPosRonda((prev) => ({
      ...prev,
      wildcardActive: !prev.wildcardActive,
    }));
  };

  // Selesaikan Babak: Menang atau Kalah
  const finalizeRound = useCallback(
    (
      isWon: boolean,
      finalScore: number,
      finalPosRonda: PosRondaState,
      deadlockData: { pipSum: number; multiplier: number; explosionScore: number } | null = null,
      sessionFinalScore: number = finalScore
    ) => {
      setIsGameOver(true);
      setRoundBonusEarned(finalScore);

      if (isWon) {
        // Pemain Lolos Babak!
        sounds.playVictory();
        triggerConfettiExplosion();
        recordMission('win_rounds', 1);

        // Koin dihitung dari sisa kuota pasang batu + bonus dasar babak
        const earnedCoins = Math.max(1, finalPosRonda.playsLeft) + 2;
        setRoundCoinsEarned(earnedCoins);
        setCoins((prev) => prev + earnedCoins);

        // Berikan pilihan jimat acak jika belum memiliki semua
        const unowned = AVAILABLE_RELICS.filter((r) => !activeRelics.some((ar) => ar.id === r.id));
        if (unowned.length > 0) {
          const shuffled = [...unowned].sort(() => Math.random() - 0.5);
          setRelicChoices(shuffled.slice(0, 2));
        } else {
          setRelicChoices([]);
        }

        rollShopRelics(activeRelics);
      } else {
        // Pemain Gagal Mencapai Target Skor
        sounds.playDefeat();
        setRoundCoinsEarned(0);
        setRelicChoices([]);
      }

      // Catat ke Papan Skor (Leaderboard)
      // One leaderboard entry represents a completed run, not every successful round.
      if (!isWon) {
        recordLeaderboardScore({
          score: sessionFinalScore,
          roundReached: finalPosRonda.currentRound,
          streak: finalPosRonda.streak,
          favRelicName: activeRelics[0]?.name,
        });
      }
    },
    [activeRelics, recordMission, rollShopRelics]
  );

  // Navigasi Buka Halaman Leaderboard
  const handleOpenLeaderboard = () => {
    sounds.playTileClack();
    if (screen !== 'leaderboard') {
      previousScreenRef.current = screen;
    }
    setScreen('leaderboard');
  };

  // Aksi Memasang Batu Domino ke Meja
  const handlePlaceTile = (targetEnd: 'left' | 'right') => {
    if (!selectedTile || isResolvingTurnRef.current || isGameOver) return;
    if (posRonda.playsLeft <= 0) return;

    isResolvingTurnRef.current = true;
    const tile = selectedTile;
    const isFirstTile = placedTiles.length === 0;

    let head = tile.head;
    let tail = tile.tail;
    let newLeft = leftEnd;
    let newRight = rightEnd;

    if (isFirstTile) {
      newLeft = tile.head;
      newRight = tile.tail;
      head = tile.head;
      tail = tile.tail;
    } else if (targetEnd === 'left') {
      // Tile baru diletakkan di sebelah KIRI meja.
      // Sisi ekor (tail) tile baru harus bersentuhan dengan leftEnd meja.
      // Sisi kepala (head) tile baru mengarah keluar menjadi leftEnd yang baru.
      if (tile.isDouble) {
        newLeft = tile.head;
        head = tile.head;
        tail = tile.tail;
      } else if (posRonda.wildcardActive) {
        if (tile.tail === leftEnd) {
          head = tile.head;
          tail = tile.tail;
          newLeft = tile.head;
        } else if (tile.head === leftEnd) {
          head = tile.tail;
          tail = tile.head;
          newLeft = tile.tail;
        } else {
          head = tile.head;
          tail = tile.tail;
          newLeft = tile.head;
        }
      } else if (tile.tail === leftEnd) {
        // [head | tail] -> tail menyentuh leftEnd meja
        head = tile.head;
        tail = tile.tail;
        newLeft = tile.head;
      } else {
        // tile.head === leftEnd -> putar arah batu menjadi [tail | head]
        // sehingga sisi head berada di kanan menyentuh leftEnd meja!
        head = tile.tail;
        tail = tile.head;
        newLeft = tile.tail;
      }
    } else {
      // targetEnd === 'right'
      // Tile baru diletakkan di sebelah KANAN meja.
      // Sisi kepala (head) tile baru harus bersentuhan dengan rightEnd meja.
      // Sisi ekor (tail) tile baru mengarah keluar menjadi rightEnd yang baru.
      if (tile.isDouble) {
        newRight = tile.tail;
        head = tile.head;
        tail = tile.tail;
      } else if (posRonda.wildcardActive) {
        if (tile.head === rightEnd) {
          head = tile.head;
          tail = tile.tail;
          newRight = tile.tail;
        } else if (tile.tail === rightEnd) {
          head = tile.tail;
          tail = tile.head;
          newRight = tile.head;
        } else {
          head = tile.head;
          tail = tile.tail;
          newRight = tile.tail;
        }
      } else if (tile.head === rightEnd) {
        // [head | tail] -> head menyentuh rightEnd meja
        head = tile.head;
        tail = tile.tail;
        newRight = tile.tail;
      } else {
        // tile.tail === rightEnd -> putar arah batu menjadi [tail | head]
        // sehingga sisi tail berada di kiri menyentuh rightEnd meja!
        head = tile.tail;
        tail = tile.head;
        newRight = tile.head;
      }
    }

    const rotatedTile: Domino = {
      id: tile.id,
      head,
      tail,
      isDouble: tile.isDouble,
    };

    // Koordinat animasi banting batu
    const tileElement = document.querySelector(`#hand-tile-${selectedTile.id}`);
    const startRect = tileElement ? tileElement.getBoundingClientRect() : undefined;

    let targetSocketId = '#target-socket-center';
    if (placedTiles.length > 0) {
      targetSocketId = targetEnd === 'left' ? '#target-socket-left' : '#target-socket-right';
    }
    const targetElement = document.querySelector(targetSocketId) || document.querySelector('#game-table');
    const targetRect = targetElement ? targetElement.getBoundingClientRect() : undefined;

    animateTilePlacementFlight({
      tile: rotatedTile,
      startRect,
      targetRect,
      targetAngle: selectedTile.isDouble ? 90 : 0,
      onComplete: () => {
        // Picu animasi percikan api di sekitar kartu saat mendarat dan tersambung di meja
        triggerFireSparks(targetRect || targetSocketId, { isDouble: selectedTile.isDouble });
        executeTilePlacement(targetEnd, rotatedTile, newLeft, newRight);
      },
    });
  };

  // Eksekusi Logika Pasang Batu Setelah Animasi Selesai
  const executeTilePlacement = (
    targetEnd: 'left' | 'right',
    placedDomino: Domino,
    newLeft: number | null,
    newRight: number | null
  ) => {
    if (!selectedTile) return;

    const tile = selectedTile;
    const isFirstTile = placedTiles.length === 0;

    const newPlaced: PlacedTile = {
      id: `${tile.id}-${Date.now()}`,
      domino: placedDomino,
      head: placedDomino.head,
      tail: placedDomino.tail,
      side: isFirstTile ? 'center' : targetEnd,
      x: 0,
      y: 0,
      angle: tile.isDouble ? 90 : 0,
      isDouble: tile.isDouble,
      order: placedTiles.length,
    };

    // Update tangan & tarik batu pengganti dari cadangan jika tersedia
    const remainingHand = hand.filter((t) => t.id !== tile.id);
    let nextBoneyard = [...boneyard];
    let nextHand = remainingHand;

    if (nextBoneyard.length > 0) {
      const [drawn, ...restBoneyard] = nextBoneyard;
      nextHand = [...remainingHand, drawn];
      nextBoneyard = restBoneyard;
    }

    // Kalkulasi Skor Pos Ronda ala Balatro
    const scoreCalc = calculateMoveScorePosRonda(
      tile,
      posRonda.streak,
      activeRelics,
      nextHand.length,
      posRonda.wildcardActive
    );

    // Animasi Relic jika ada jimat yang terpicu
    scoreCalc.triggeredRelics.forEach((relicId) => {
      const el = document.querySelector(`#relic-${relicId}`);
      if (el) animateRelicTrigger(el as HTMLElement);
    });

    if (scoreCalc.bonusPlaysGranted > 0) {
      sounds.playKopiHitam();
      setPassiveNotice('☕ Cangkir Kopi Hitam Aktif: +1 Kuota Pasang Batu Diberikan!');
      setTimeout(() => setPassiveNotice(null), 3000);
    }

    // Catat Misi Harian
    const newRoundScore = posRonda.roundScore + scoreCalc.totalMoveScore;

    recordMission('place_dominoes', 1);
    recordMission('reach_score', newRoundScore);
    if (tile.isDouble) recordMission('place_balak', 1);
    if (posRonda.wildcardActive) recordMission('use_kipas', 1);
    const newPlaysLeft = posRonda.playsLeft - 1 + scoreCalc.bonusPlaysGranted;
    const newStreak = posRonda.streak + 1;
    const newTargetScore = posRonda.targetScore;

    const nextPosRondaState: PosRondaState = {
      ...posRonda,
      roundScore: newRoundScore,
      playsLeft: newPlaysLeft,
      streak: newStreak,
      wildcardActive: false,
      wildcardUsedThisRound: posRonda.wildcardUsedThisRound || posRonda.wildcardActive,
    };

    // Animasi Resolusi Skor Terapung (Anime.js)
    setCurrentChips(scoreCalc.chips);
    setCurrentMult(scoreCalc.mult);

    animateScoreResolution(
      scoreCalc.chips,
      scoreCalc.mult,
      score + scoreCalc.totalMoveScore,
      {
        currentScore: score,
        onScoreUpdate: (val: number) => setScore(val),
        onComplete: () => {
          isResolvingTurnRef.current = false;

          // Cek Kondisi Kemenangan Babak
          if (newRoundScore >= newTargetScore) {
            finalizeRound(true, newRoundScore, nextPosRondaState, null, score + (newRoundScore - posRonda.roundScore));
          } else if (newPlaysLeft <= 0) {
            // Kuota pasang habis dan belum mencapai target
            finalizeRound(false, newRoundScore, nextPosRondaState, null, score + (newRoundScore - posRonda.roundScore));
          }
        },
      }
    );

    // Update state papan & tangan
    setPlacedTiles((prev) => (targetEnd === 'left' ? [newPlaced, ...prev] : [...prev, newPlaced]));
    setLastPlacedTileId(newPlaced.id);
    setLeftEnd(newLeft);
    setRightEnd(newRight);
    setHand(nextHand);
    setBoneyard(nextBoneyard);
    setSelectedTile(null);
    setPosRonda(nextPosRondaState);
  };

  // Buang Batu Terpilih (Discard)
  const handleDiscardTile = (tile: Domino) => {
    if (posRonda.discardsLeft <= 0 || isGameOver) return;

    sounds.playTileClack();
    recordMission('discard_tiles', 1);

    const remainingHand = hand.filter((t) => t.id !== tile.id);
    let nextBoneyard = [...boneyard];
    let nextHand = remainingHand;

    if (nextBoneyard.length > 0) {
      const [drawn, ...restBoneyard] = nextBoneyard;
      nextHand = [...remainingHand, drawn];
      nextBoneyard = restBoneyard;
    }

    setHand(nextHand);
    setBoneyard(nextBoneyard);
    setSelectedTile(null);
    setPosRonda((prev) => ({
      ...prev,
      discardsLeft: prev.discardsLeft - 1,
    }));
  };

  // Kunci Meja (GAPLE! Deadlock Score Explosion)
  const handleTriggerGapleExplosion = () => {
    if (isGameOver || isResolvingTurnRef.current) return;

    isResolvingTurnRef.current = true;
    sounds.playGapleClack();
    recordMission('trigger_gaple', 1);

    const explosionData = calculateGapleExplosionScore(hand, activeRelics);
    setGapleExplosionData(explosionData);
    setIsDeadlock(true);

    // Animasi getaran seluruh batu meja dan confetti kembang api
    animateDeadlockGaple('.placed-tile', () => {
      isResolvingTurnRef.current = false;
      const finalRoundScore = posRonda.roundScore + explosionData.explosionScore;
      const updatedPosRonda = {
        ...posRonda,
        roundScore: finalRoundScore,
      };

      setPosRonda(updatedPosRonda);
      setScore((prev) => prev + explosionData.explosionScore);

      const isWon = finalRoundScore >= posRonda.targetScore;
      finalizeRound(isWon, finalRoundScore, updatedPosRonda, explosionData, score + explosionData.explosionScore);
    });
  };

  // Urutkan Batu di Tangan
  const handleSortHand = () => {
    sounds.playTileClack();
    setHand((prev) =>
      [...prev].sort((a, b) => {
        if (a.isDouble && !b.isDouble) return -1;
        if (!a.isDouble && b.isDouble) return 1;
        return (b.head + b.tail) - (a.head + a.tail);
      })
    );
  };

  // Pilih Jimat Baru setelah Lolos Babak (Maksimal 5 Slot)
  const handleSelectRelic = (relic: Relic) => {
    sounds.playAkikMerah();
    setActiveRelics((prev) => {
      if (prev.length < 5) {
        return [...prev, relic];
      }
      return [...prev.slice(1), relic];
    });
    setRelicChoices([]);
    setIsGameOver(false);
    setIsShopOpen(true);
  };

  // Beli Jimat di Toko Ronda
  const handleBuyShopRelic = (relic: Relic) => {
    const price = relic.price || 5;
    if (coins < price) return;

    setCoins((prev) => prev - price);
    sounds.playVictory();

    setActiveRelics((prev) => {
      if (prev.length < 5) {
        return [...prev, relic];
      }
      return [...prev.slice(1), relic];
    });

    setPassiveNotice(`🎁 Berhasil Membeli Jimat: ${relic.name}!`);
    setTimeout(() => setPassiveNotice(null), 3000);
  };

  // Menggunakan Barang Konsumsi 'Gorengan': Mengubah satu batu di tangan menjadi Balak kembar
  const handleApplyGorengan = (tileId: string) => {
    if (coins < 3) return;

    setCoins((prev) => prev - 3);
    sounds.playTileSlam();

    setHand((prev) =>
      prev.map((tile) => {
        if (tile.id === tileId) {
          const maxPip = Math.max(tile.head, tile.tail);
          const targetPip = maxPip === 0 ? 6 : maxPip;
          return {
            ...tile,
            // Keep the physical tile ID stable to avoid duplicate keys / selection collisions.
            head: targetPip,
            tail: targetPip,
            isDouble: true,
          };
        }
        return tile;
      })
    );

    setPassiveNotice('🥟 Gorengan Hangat Disantap! Satu batu di tangan berubah menjadi Balak Kembar!');
    setTimeout(() => setPassiveNotice(null), 3500);
  };

  // Beli Barang Konsumsi Lainnya (Es Teh, Rokok)
  const handleBuyConsumable = (item: ConsumableItem) => {
    if (coins < item.price) return;
    setCoins((prev) => prev - item.price);
    sounds.playVictory();

    if (item.id === 'item_esteh') {
      setPosRonda((prev) => ({ ...prev, discardsLeft: prev.discardsLeft + 2 }));
      setPassiveNotice('🥤 Es Teh Manis Diminum: +2 Kuota Buang Batu Ditambahkan!');
    } else if (item.id === 'item_baterai') {
      setBonusScoreNextRound((prev) => prev + 150);
      setPassiveNotice('🔋 Baterai Cadangan disimpan: +150 skor awal pada babak berikutnya!');
    }
    setTimeout(() => setPassiveNotice(null), 3000);
  };

  // Reroll Toko dengan Koin
  const handleRerollShopWithCoins = () => {
    if (coins < 2) return;
    setCoins((prev) => prev - 2);
    sounds.playTileClack();
    rollShopRelics(activeRelics);
  };

  // Callback ini hanya memberi hadiah; ShopModal membuka iklan dan memanggilnya setelah selesai.
  const handleRerollShopWithAd = () => {
    if (rewardedAdsUsed >= MAX_REWARDED_ADS_PER_GAME) {
      setPassiveNotice('📺 Kuota iklan habis (3/3) untuk permainan ini.');
      setTimeout(() => setPassiveNotice(null), 3000);
      return;
    }
    setRewardedAdsUsed((count) => count + 1);
    sounds.playVictory();
    rollShopRelics(activeRelics);
    setPassiveNotice('📺 Toko berhasil di-refresh setelah iklan selesai!');
    setTimeout(() => setPassiveNotice(null), 3000);
  };

  // Revive Saat Kalah (Nonton Iklan untuk Tambah 2 Giliran)
  const handleReviveWithAd = () => {
    if (rewardedAdsUsed >= MAX_REWARDED_ADS_PER_GAME) {
      setPassiveNotice('📺 Kuota iklan habis (3/3) untuk permainan ini.');
      setTimeout(() => setPassiveNotice(null), 3000);
      return;
    }
    showRewardedAd('revive_round', () => {
      setRewardedAdsUsed((count) => count + 1);
      sounds.playVictory();
      setPosRonda((prev) => ({
        ...prev,
        playsLeft: prev.playsLeft + 2,
      }));
      setIsGameOver(false);
      setIsDeadlock(false);
      setPassiveNotice('🎬 Revive Berhasil: +2 Giliran Pasang Ditambahkan! Lanjutkan Ronde!');
      setTimeout(() => setPassiveNotice(null), 3500);
    });
  };

  // Klaim Hadiah 1 Misi Harian
  const handleClaimMission = (missionId: string, rewardCoins: number) => {
    sounds.playVictory();
    triggerConfettiExplosion();
    setCoins((prev) => prev + rewardCoins);
    setMissions((prev) => {
      const next = prev.map((m) => (m.id === missionId ? { ...m, isClaimed: true } : m));
      saveDailyMissions(next);
      return next;
    });
    setPassiveNotice(`🎁 Hadiah Misi Diklaim: +${rewardCoins} Koin Ditambahkan!`);
    setTimeout(() => setPassiveNotice(null), 3000);
  };

  // Klaim Semua Hadiah Misi Harian yang Siap
  const handleClaimAllMissions = () => {
    let totalReward = 0;
    missions.forEach((m) => {
      if (m.isCompleted && !m.isClaimed) totalReward += m.rewardCoins;
    });

    if (totalReward > 0) {
      sounds.playVictory();
      triggerConfettiExplosion();
      setCoins((prev) => prev + totalReward);
      setMissions((prev) => {
        const next = prev.map((m) => (m.isCompleted ? { ...m, isClaimed: true } : m));
        saveDailyMissions(next);
        return next;
      });
      setPassiveNotice(`🎉 Semua Hadiah Misi Diklaim: +${totalReward} Koin Ditambahkan!`);
      setTimeout(() => setPassiveNotice(null), 3000);
    }
  };

  // Mulai Babak Berikutnya (Pos Ronda bertambah otomatis: 1 -> 2 -> 3 dst)
  const handleProceedNextRound = () => {
    setIsShopOpen(false);
    setIsGameOver(false);
    sounds.playVictory();
    const nextRound = posRonda.currentRound + 1;
    const startingBonus = bonusScoreNextRound;
    setBonusScoreNextRound(0);
    initGame(nextRound, startingBonus);
  };

  // =========================================================================
  // SCREEN 1: MAIN MENU (Hanya Judul, Mulai Main, Cara Main, Misi, Info Versi)
  // =========================================================================
  if (screen === 'main_menu') {
    return (
      <div className="min-h-screen w-screen bg-slate-950 font-sans text-stone-100 select-none">
        <MainMenu
          onStartGame={handleStartGame}
          onOpenRules={() => setIsRulesOpen(true)}
          onOpenMissions={() => setIsMissionsOpen(true)}
          onOpenLeaderboard={handleOpenLeaderboard}
          unclaimedMissionsCount={unclaimedMissionsCount}
          coins={coins}
          isMuted={isMuted}
          onToggleMute={() => {
            sounds.isMuted = !isMuted;
            setIsMuted(!isMuted);
          }}
        />

        {/* Modal Pop-up yang Dapat Diakses dari Main Menu */}
        <RulesModal
          isOpen={isRulesOpen}
          onClose={() => setIsRulesOpen(false)}
        />

        <DailyMissionsModal
          isOpen={isMissionsOpen}
          onClose={() => setIsMissionsOpen(false)}
          missions={missions}
          onClaimMission={handleClaimMission}
          onClaimAll={handleClaimAllMissions}
        />

        <RewardedAdModal />
      </div>
    );
  }

  // =========================================================================
  // SCREEN 2: PAPAN SKOR & KLASEMEN (LEADERBOARD PAGE)
  // =========================================================================
  if (screen === 'leaderboard') {
    return (
      <LeaderboardPage
        onBack={() => {
          // Jika leaderboard dibuka dari pop-up kemenangan, lanjutkan otomatis
          // ke babak berikutnya saat pemain kembali ke permainan.
          const returningToGame = previousScreenRef.current === 'game';
          const roundWon = posRonda.roundScore >= posRonda.targetScore;
          if (returningToGame && isGameOver && roundWon) {
            setScreen('game');
            handleProceedNextRound();
            return;
          }
          setScreen(previousScreenRef.current || 'main_menu');
        }}
        currentScore={score}
        currentRound={posRonda.currentRound}
      />
    );
  }

  // =========================================================================
  // SCREEN 3: GAMEPLAY UTAMA (Minimalis & Bebas Clutter)
  // =========================================================================
  return (
    <div className="flex flex-col h-screen h-[100svh] w-screen overflow-hidden bg-slate-950 font-sans text-stone-100 select-none">
      {/* Bagian Atas (HUD): Hanya Target Skor, Skor Saat Ini, Pos Ronda, Sisa Pasang, Sisa Buang, dan Koin */}
      <ScoreHeader
        score={score}
        chips={currentChips}
        mult={currentMult}
        boneyardCount={boneyard.length}
        isMuted={isMuted}
        onToggleMute={() => {
          sounds.isMuted = !isMuted;
          setIsMuted(!isMuted);
        }}
        onOpenMenu={() => setIsPauseOpen(true)}
        posRonda={posRonda}
        coins={coins}
      />

      {/* Bagian Sub-HUD: Deretan Slot Jimat Warkop Aktif (Maksimal 5 Item) */}
      <div className="bg-slate-900/95 border-b border-stone-800/80 px-2 py-0.5">
        <RelicBar
          relics={activeRelics}
          wildcardActive={posRonda.wildcardActive}
          wildcardUsedThisRound={posRonda.wildcardUsedThisRound}
          onToggleWildcard={handleToggleWildcard}
          onRelicClick={(relic) => {
            const el = document.querySelector(`#relic-${relic.id}`);
            if (el) {
              animateRelicTrigger(el as HTMLElement);
              if (relic.id === 'jimat_korek') sounds.playKorekGas();
              else if (relic.id === 'jimat_kopi') sounds.playKopiHitam();
              else if (relic.id === 'jimat_kipas') sounds.playKipasSate();
              else if (relic.id === 'jimat_akik') sounds.playAkikMerah();
              else if (relic.id === 'jimat_asbak') sounds.playAsbakPenuh();
              else sounds.playTitikPop();
            }
          }}
        />
      </div>

      {/* Notifikasi Pasif Jimat Muncul Melayang */}
      {passiveNotice && (
        <div className="absolute top-24 inset-x-4 flex justify-center pointer-events-none z-50 animate-bounce">
          <div className="bg-slate-900/90 text-amber-300 font-bold text-xs md:text-sm px-4 py-1.5 rounded-full shadow-2xl border border-amber-500/70 backdrop-blur-md">
            {passiveNotice}
          </div>
        </div>
      )}

      {/* Bagian Tengah (Papan Meja): Jalur Rantai Domino Rapi (Responsif & Proporsional di Layar HP) */}
      <main className="relative flex flex-col p-1 sm:p-1.5 md:p-2.5 pb-[156px] sm:pb-0 overflow-hidden flex-1 min-h-0 shrink transition-all duration-500 ease-in-out">
        <GameBoard
          tiles={placedTiles}
          leftEnd={leftEnd}
          rightEnd={rightEnd}
          selectedTile={selectedTile}
          canPlayLeft={canPlayLeft}
          canPlayRight={canPlayRight}
          onPlaceTile={handlePlaceTile}
          isPortrait={isPortrait}
          isCompactHeight={isCompactHeight}
          isGameOver={isGameOver}
          isDeadlock={isDeadlock}
          isWildcardActive={posRonda.wildcardActive}
          lastPlacedTileId={lastPlacedTileId}
          chips={currentChips}
          mult={currentMult}
        />
      </main>

      {/* Bagian Bawah: Meja Bawah (Status Pasang, Buang, Rantai, Tangan, dan Aksi Chain) */}
      <ControlDock
        hand={hand}
        selectedTile={selectedTile}
        leftEnd={leftEnd}
        rightEnd={rightEnd}
        canPlayLeft={canPlayLeft}
        canPlayRight={canPlayRight}
        discardsLeft={posRonda.discardsLeft}
        playsLeft={posRonda.playsLeft}
        streak={posRonda.streak}
        chips={currentChips}
        mult={currentMult}
        wildcardActive={posRonda.wildcardActive}
        wildcardUsedThisRound={posRonda.wildcardUsedThisRound}
        onToggleWildcard={handleToggleWildcard}
        hasKipasSate={activeRelics.some((r) => r.id === 'jimat_kipas')}
        onSelectTile={(tile) => {
          sounds.playTileClack();
          setSelectedTile(selectedTile?.id === tile.id ? null : tile);
        }}
        onPlaceTile={handlePlaceTile}
        onDiscardTile={handleDiscardTile}
        onTriggerGapleExplosion={handleTriggerGapleExplosion}
        onSortHand={handleSortHand}
        hasValidMove={hasValidMove}
        isPortrait={isPortrait}
        isCompactHeight={isCompactHeight}
      />

      {/* ========================================================================= */}
      {/* SISTEM MODAL POP-UP (Hanya Muncul Saat Event)                            */}
      {/* ========================================================================= */}

      {/* 1. Modal Jeda (Pause Modal) */}
      <PauseModal
        isOpen={isPauseOpen}
        onClose={() => setIsPauseOpen(false)}
        onRestartRound={handleRestartRound}
        onReturnToMainMenu={handleReturnToMainMenu}
        onOpenRules={() => setIsRulesOpen(true)}
        onOpenLeaderboard={() => {
          setIsPauseOpen(false);
          handleOpenLeaderboard();
        }}
        currentRound={posRonda.currentRound}
        isMuted={isMuted}
        onToggleMute={() => {
          sounds.isMuted = !isMuted;
          setIsMuted(!isMuted);
        }}
      />

      {/* 2. Modal Hasil Ronde (Menang / Kalah / Kunci Meja) */}
      <GapleModal
        isOpen={isGameOver}
        isDeadlock={isDeadlock}
        scoreEarned={roundBonusEarned}
        availableRelicChoices={relicChoices}
        onSelectRelic={handleSelectRelic}
        onNextRound={() => {
          if (posRonda.roundScore >= posRonda.targetScore) {
            handleProceedNextRound();
          } else {
            setScore(0);
            initGame(1);
          }
        }}
        posRonda={posRonda}
        gapleExplosionData={gapleExplosionData}
        coinsEarned={roundCoinsEarned}
        onReviveWithAd={handleReviveWithAd}
        canWatchAd={rewardedAdsUsed < MAX_REWARDED_ADS_PER_GAME}
        onOpenShop={() => {
          setIsGameOver(false);
          setIsShopOpen(true);
        }}
        onOpenLeaderboard={() => {
          setIsGameOver(false);
          handleOpenLeaderboard();
        }}
        onReturnToMainMenu={handleReturnToMainMenu}
        handRemaining={hand}
      />

      {/* 3. Modal Toko Ronda Antar-Babak */}
      <ShopModal
        isOpen={isShopOpen}
        coins={coins}
        activeRelics={activeRelics}
        hand={hand}
        shopRelics={shopRelics}
        onBuyRelic={handleBuyShopRelic}
        onApplyGorengan={handleApplyGorengan}
        onBuyConsumable={handleBuyConsumable}
        onRerollShopWithCoins={handleRerollShopWithCoins}
        onRerollShopWithAd={handleRerollShopWithAd}
        canWatchAd={rewardedAdsUsed < MAX_REWARDED_ADS_PER_GAME}
        onCloseShop={handleProceedNextRound}
        nextRoundNumber={posRonda.currentRound + 1}
      />

      {/* 4. Modal Panduan & Cara Main */}
      <RulesModal
        isOpen={isRulesOpen}
        onClose={() => setIsRulesOpen(false)}
      />

      {/* 5. Modal Misi Harian */}
      <DailyMissionsModal
        isOpen={isMissionsOpen}
        onClose={() => setIsMissionsOpen(false)}
        missions={missions}
        onClaimMission={handleClaimMission}
        onClaimAll={handleClaimAllMissions}
      />

      {/* 6. Modal Simulasi Google AdMob Rewarded Ad (3 Detik) */}
      <RewardedAdModal />
    </div>
  );
}
