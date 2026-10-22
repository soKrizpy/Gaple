/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import balakutakLogo from '../assets/images/balakutak_master_logo_1792665905566.jpg';
import {
  Trophy,
  ArrowLeft,
  Share2,
  Medal,
  Flame,
  Crown,
  Sparkles,
  Check,
  Copy,
  Edit2,
  ExternalLink,
  MessageCircle,
  Twitter,
  Send,
  Zap,
} from 'lucide-react';
import { LeaderboardEntry, PlayerProfile } from '../types';
import {
  getFilteredLeaderboard,
  getStoredPlayerProfile,
  savePlayerProfile,
  generateShareText,
  shareScoreToSocial,
  getWhatsAppShareUrl,
  getTwitterShareUrl,
  getTelegramShareUrl,
} from '../services/leaderboardService';
import { sounds } from '../utils/soundEffects';

interface LeaderboardPageProps {
  onBack: () => void;
  currentScore?: number;
  currentRound?: number;
}

export const LeaderboardPage: React.FC<LeaderboardPageProps> = ({
  onBack,
  currentScore = 0,
  currentRound = 1,
}) => {
  const [timeframe, setTimeframe] = useState<'all_time' | 'weekly' | 'daily'>('all_time');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [playerProfile, setPlayerProfile] = useState<PlayerProfile>(() => getStoredPlayerProfile());
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(playerProfile.nickname);
  const [isAvatarPickerOpen, setIsAvatarPickerOpen] = useState(false);
  const avatarOptions = [
    { emoji: '🀄', label: 'Balakutak Master' },
    { emoji: '😎', label: 'Jagoan Keren' },
    { emoji: '🤠', label: 'Si Raja Gaple' },
    { emoji: '🐱', label: 'Kucing Santai' },
    { emoji: '🐶', label: 'Si Cerdik' },
    { emoji: '🐧', label: 'Penguin Strategi' },
    { emoji: '🐼', label: 'Panda Tenang' },
    { emoji: '🐔', label: 'Ayam Jago' },
  ];
  const [selectedEntryToShare, setSelectedEntryToShare] = useState<LeaderboardEntry | null>(null);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  useEffect(() => {
    setEntries(getFilteredLeaderboard(timeframe));
  }, [timeframe]);

  const handleSaveAvatar = (avatar: string) => {
    sounds.playTileClack();
    const updated = savePlayerProfile({ avatar });
    setPlayerProfile(updated);
    setIsAvatarPickerOpen(false);
    setEntries(getFilteredLeaderboard(timeframe).map((entry) => entry.isCurrentPlayer ? { ...entry, avatar } : entry));
  };

  const handleSaveNickname = () => {
    sounds.playTileClack();
    const cleanName = editedName.trim() || 'Pemain Warkop';
    const updated = savePlayerProfile({ nickname: cleanName });
    setPlayerProfile(updated);
    setIsEditingName(false);
    // Refresh entries so new name reflects
    setEntries(getFilteredLeaderboard(timeframe));
  };

  const handleShareClick = (entry: LeaderboardEntry, rank?: number) => {
    sounds.playTileClack();
    setSelectedEntryToShare({ ...entry });
  };

  const handleNativeShare = async (entry: LeaderboardEntry) => {
    sounds.playVictory();
    const rank = entries.findIndex((e) => e.id === entry.id) + 1;
    const result = await shareScoreToSocial({
      playerName: entry.name,
      score: entry.score,
      round: entry.roundReached,
      rank: rank > 0 ? rank : undefined,
    });

    if (result === 'clipboard') {
      setCopyFeedback('📋 Teks & Skor Berhasil Disalin ke Clipboard!');
      setTimeout(() => setCopyFeedback(null), 3500);
    }
  };

  const handleCopyShareText = (entry: LeaderboardEntry) => {
    sounds.playTileClack();
    const rank = entries.findIndex((e) => e.id === entry.id) + 1;
    const text = generateShareText({
      playerName: entry.name,
      score: entry.score,
      round: entry.roundReached,
      rank: rank > 0 ? rank : undefined,
    });

    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopyFeedback('📋 Teks Papan Skor Berhasil Disalin!');
      setTimeout(() => setCopyFeedback(null), 3000);
    }
  };

  // 3 Juara Teratas untuk Podium
  const top1 = entries[0];
  const top2 = entries[1];
  const top3 = entries[2];

  // Best player display: take current game score or saved personal high score
  const displayScore = Math.max(playerProfile.highScore, currentScore);
  const displayRound = Math.max(playerProfile.highestRound, currentRound);

  return (
    <div className="relative min-h-screen w-full bg-slate-950 font-sans text-stone-100 flex flex-col select-none overflow-x-hidden">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none opacity-25 bg-[radial-gradient(ellipse_80%_80%_at_50%_-10%,rgba(245,158,11,0.3),rgba(0,0,0,0))]" />
      <div className="fixed inset-0 pointer-events-none opacity-20 bg-[radial-gradient(ellipse_60%_60%_at_50%_110%,rgba(16,185,129,0.25),rgba(0,0,0,0))]" />

      {/* Top Navbar */}
      <header className="sticky top-0 z-40 w-full bg-slate-900/90 backdrop-blur-md border-b border-stone-800 px-4 py-3 flex items-center justify-between shadow-lg">
        <button
          onClick={() => {
            sounds.playTileClack();
            onBack();
          }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 font-bold text-xs transition-all active:scale-95 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-amber-400" />
          <span>Kembali</span>
        </button>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300">
            <Trophy className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-400">
              PAPAN SKOR BALAKUTAK MASTER
            </h1>
            <p className="text-[10px] text-stone-400 font-mono">Klasemen Jawara Domino Pos Ronda Warkop</p>
          </div>
        </div>

        {/* Tombol Cepat Bagikan Rekor Saya */}
        <button
          onClick={() => {
            sounds.playTileClack();
            handleShareClick({
              id: 'player_quick_share',
              name: playerProfile.nickname,
              title: 'Jawara Pos Ronda',
              score: displayScore,
              roundReached: displayRound,
              streak: playerProfile.highestStreak,
              timestamp: Date.now(),
              avatar: playerProfile.avatar || '🀄',
              isCurrentPlayer: true,
            });
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs shadow-md transition-all active:scale-95 cursor-pointer"
          title="Bagikan Skor Saya ke Media Sosial"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Bagikan</span>
        </button>
      </header>

      {/* Main Container */}
      <main className="relative z-10 flex-1 max-w-4xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-6 flex flex-col gap-5">
        {/* Banner Profil & Rekor Pemain Saat Ini */}
        <div className="w-full rounded-2xl bg-gradient-to-br from-stone-900 via-slate-900 to-amber-950/40 border border-amber-500/30 p-4 sm:p-5 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Info Pemain */}
          <div className="flex items-center gap-3.5 w-full sm:w-auto">
            <button type="button" onClick={() => setIsAvatarPickerOpen(true)} title="Pilih avatar pemain" className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-400 p-0.5 shadow-lg flex items-center justify-center shrink-0 cursor-pointer active:scale-95">
              <span className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-3xl">{playerProfile.avatar || '🀄'}</span>
            </button>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                {isEditingName ? (
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      maxLength={18}
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      className="bg-stone-950 border border-amber-500 px-2.5 py-1 rounded-lg text-xs font-bold text-amber-200 outline-none w-36 sm:w-44"
                      autoFocus
                    />
                    <button
                      onClick={handleSaveNickname}
                      className="p-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <h2 className="text-base sm:text-lg font-black text-amber-200 truncate">
                      {playerProfile.nickname}
                    </h2>
                    <button
                      onClick={() => {
                        sounds.playTileClack();
                        setEditedName(playerProfile.nickname);
                        setIsEditingName(true);
                      }}
                      className="text-stone-400 hover:text-amber-300 transition-colors p-1 cursor-pointer"
                      title="Ubah Nama Julukan"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
                <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider shrink-0">
                  Profil Saya
                </span>
              </div>
              <p className="text-xs text-stone-400 mt-0.5">
                Main: <strong className="text-stone-200">{playerProfile.gamesPlayed}×</strong> · Babak Tertinggi:{' '}
                <strong className="text-amber-300">Pos Ronda {displayRound}</strong>
              </p>
            </div>
          </div>

          {/* Statistik Rekor & Tombol Share */}
          <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-stone-800">
            <div className="text-left sm:text-right">
              <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">
                Rekor Skor Tertinggi
              </span>
              <span className="font-mono text-xl sm:text-2xl font-black text-amber-300 drop-shadow-[0_2px_10px_rgba(245,158,11,0.5)]">
                {displayScore.toLocaleString('id-ID')}
              </span>
            </div>

            <button
              onClick={() => {
                sounds.playTileClack();
                handleShareClick({
                  id: 'player_banner_share',
                  name: playerProfile.nickname,
                  title: 'Jawara Pos Ronda',
                  score: displayScore,
                  roundReached: displayRound,
                  streak: playerProfile.highestStreak,
                  timestamp: Date.now(),
                  avatar: '🀄',
                  isCurrentPlayer: true,
                });
              }}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs shadow-md transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>Share Skor</span>
            </button>
          </div>
        </div>

        {/* Tab Filter Rentang Waktu */}
        <div className="flex items-center justify-center">
          <div className="flex items-center bg-stone-900/90 p-1 rounded-2xl border border-stone-800 shadow-inner">
            <button
              onClick={() => {
                sounds.playTileClack();
                setTimeframe('all_time');
              }}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                timeframe === 'all_time'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              👑 Semua Masa (All Time)
            </button>
            <button
              onClick={() => {
                sounds.playTileClack();
                setTimeframe('weekly');
              }}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                timeframe === 'weekly'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              🗓️ Pekan Ini
            </button>
            <button
              onClick={() => {
                sounds.playTileClack();
                setTimeframe('daily');
              }}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                timeframe === 'daily'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              ⚡ Hari Ini
            </button>
          </div>
        </div>

        {/* Podium 3 Besar Jawara Warkop */}
        {entries.length >= 3 && (
          <div className="grid grid-cols-3 gap-2 sm:gap-4 items-end pt-4 pb-2">
            {/* Juara 2: Perak */}
            {top2 && (
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-2">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-stone-800 border-2 border-slate-300 flex items-center justify-center text-xl sm:text-2xl shadow-lg">
                    {top2.avatar}
                  </div>
                  <div className="absolute -top-2 -right-1 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-slate-300 text-slate-950 font-black font-mono text-[10px] sm:text-xs flex items-center justify-center border border-white shadow">
                    2
                  </div>
                </div>
                <div className="w-full bg-stone-900/90 border border-slate-400/40 rounded-2xl p-2 sm:p-3 flex flex-col items-center shadow-lg">
                  <span className="text-xs sm:text-sm font-extrabold text-stone-200 truncate max-w-full">
                    {top2.name}
                  </span>
                  <span className="text-[10px] text-stone-400 font-mono">Pos Ronda {top2.roundReached}</span>
                  <span className="font-mono font-black text-xs sm:text-base text-slate-200 mt-1">
                    {top2.score.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            )}

            {/* Juara 1: Emas (Lebih Tinggi & Menonjol) */}
            {top1 && (
              <div className="flex flex-col items-center text-center -translate-y-2">
                <Crown className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-400 animate-bounce mb-1" />
                <div className="relative mb-2">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-300 p-0.5 shadow-[0_0_25px_rgba(245,158,11,0.6)] flex items-center justify-center">
                    <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-2xl sm:text-3xl">
                      {top1.avatar}
                    </div>
                  </div>
                  <div className="absolute -top-2 -right-1 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 font-black font-mono text-xs flex items-center justify-center border-2 border-yellow-200 shadow-md">
                    1
                  </div>
                </div>
                <div className="w-full bg-gradient-to-b from-amber-950/60 to-stone-900 border-2 border-amber-400/70 rounded-2xl p-2.5 sm:p-4 flex flex-col items-center shadow-2xl">
                  <span className="text-xs sm:text-base font-black text-amber-200 truncate max-w-full">
                    {top1.name}
                  </span>
                  <span className="text-[10px] sm:text-xs text-amber-300 font-bold font-mono">
                    Pos Ronda {top1.roundReached}
                  </span>
                  <span className="font-mono font-black text-sm sm:text-lg text-amber-300 mt-1">
                    {top1.score.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            )}

            {/* Juara 3: Perunggu */}
            {top3 && (
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-2">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-stone-800 border-2 border-amber-700/80 flex items-center justify-center text-xl sm:text-2xl shadow-lg">
                    {top3.avatar}
                  </div>
                  <div className="absolute -top-2 -right-1 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-amber-700 text-amber-100 font-black font-mono text-[10px] sm:text-xs flex items-center justify-center border border-amber-500 shadow">
                    3
                  </div>
                </div>
                <div className="w-full bg-stone-900/90 border border-amber-700/50 rounded-2xl p-2 sm:p-3 flex flex-col items-center shadow-lg">
                  <span className="text-xs sm:text-sm font-extrabold text-stone-200 truncate max-w-full">
                    {top3.name}
                  </span>
                  <span className="text-[10px] text-stone-400 font-mono">Pos Ronda {top3.roundReached}</span>
                  <span className="font-mono font-black text-xs sm:text-base text-amber-600 mt-1">
                    {top3.score.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Daftar Seluruh Peringkat Klasemen */}
        <div className="w-full bg-slate-900/80 backdrop-blur-md rounded-2xl border border-stone-800 p-2 sm:p-4 shadow-xl flex flex-col gap-2">
          <div className="flex items-center justify-between px-3 py-2 text-xs font-bold text-stone-400 border-b border-stone-800/80 uppercase tracking-wider">
            <span>Peringkat & Pemain</span>
            <div className="flex items-center gap-6 sm:gap-12">
              <span className="hidden sm:inline">Babak</span>
              <span>Total Skor</span>
              <span className="w-8 text-center">Aksi</span>
            </div>
          </div>

          <div className="flex flex-col gap-1.5 max-h-[460px] overflow-y-auto pr-1">
            {entries.map((entry, index) => {
              const rank = index + 1;
              const isPlayer = entry.isCurrentPlayer;

              return (
                <div
                  key={entry.id || `entry-${index}`}
                  className={`flex items-center justify-between p-2.5 sm:p-3 rounded-xl border transition-all ${
                    isPlayer
                      ? 'bg-gradient-to-r from-amber-500/20 via-yellow-500/10 to-amber-500/20 border-amber-400/80 shadow-[0_0_15px_rgba(245,158,11,0.25)] ring-1 ring-amber-400/50'
                      : rank <= 3
                      ? 'bg-stone-900/90 border-stone-800/90 hover:bg-stone-800/80'
                      : 'bg-stone-950/60 border-stone-800/60 hover:bg-stone-900/60'
                  }`}
                >
                  {/* Sisi Kiri: Rank & Avatar & Nama */}
                  <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
                    {/* Rank Badge */}
                    <div
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl font-mono font-black text-xs sm:text-sm flex items-center justify-center shrink-0 ${
                        rank === 1
                          ? 'bg-amber-400 text-slate-950 shadow-md'
                          : rank === 2
                          ? 'bg-slate-300 text-slate-950 shadow-md'
                          : rank === 3
                          ? 'bg-amber-700 text-white shadow-md'
                          : 'bg-stone-800 text-stone-400'
                      }`}
                    >
                      {rank}
                    </div>

                    <div className="text-lg sm:text-xl shrink-0">{entry.avatar}</div>

                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-xs sm:text-sm text-stone-100 truncate">
                          {entry.name}
                        </span>
                        {isPlayer && (
                          <span className="px-1.5 py-0.2 rounded-md bg-amber-400 text-slate-950 font-black text-[9px] uppercase tracking-wider shrink-0">
                            ANDA
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-stone-400 truncate">
                        {entry.title} {entry.favRelic ? `· 🪬 ${entry.favRelic}` : ''}
                      </span>
                    </div>
                  </div>

                  {/* Sisi Kanan: Babak, Skor, & Tombol Share */}
                  <div className="flex items-center gap-4 sm:gap-8 shrink-0">
                    <span className="hidden sm:inline font-mono text-xs text-stone-300">
                      Pos {entry.roundReached}
                    </span>

                    <span className="font-mono font-black text-xs sm:text-base text-amber-300">
                      {entry.score.toLocaleString('id-ID')}
                    </span>

                    {/* Tombol Share Spesifik Baris Ini */}
                    <button
                      onClick={() => handleShareClick(entry, rank)}
                      className="p-1.5 rounded-lg bg-stone-800 hover:bg-amber-500 hover:text-slate-950 text-stone-300 transition-all cursor-pointer active:scale-95 shadow-xs"
                      title={`Bagikan rekor ${entry.name}`}
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {isAvatarPickerOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-[60]">
          <div className="w-full max-w-sm rounded-3xl border border-amber-500/50 bg-slate-900 p-5 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-black text-amber-200">Pilih Avatar</h3>
                <p className="text-xs text-stone-400">Gaya Balakutak Master · 8 pilihan</p>
              </div>
              <button onClick={() => setIsAvatarPickerOpen(false)} className="rounded-lg bg-stone-800 px-3 py-2 text-stone-300">✕</button>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {avatarOptions.map((option) => (
                <button key={option.emoji} onClick={() => handleSaveAvatar(option.emoji)} title={option.label} aria-label={option.label} className={`aspect-square rounded-2xl border-2 flex flex-col items-center justify-center gap-1 transition-all ${(playerProfile.avatar || '🀄') === option.emoji ? 'border-amber-300 bg-amber-500/20 shadow-[0_0_18px_rgba(245,158,11,0.35)]' : 'border-stone-700 bg-slate-950 hover:border-amber-500/60'}`}>
                  <span className="text-3xl">{option.emoji}</span>
                  <span className="text-[9px] text-stone-300 text-center leading-tight">{option.label}</span>
                </button>
              ))}
            </div>
            <p className="mt-4 text-[11px] text-stone-500">Pilihan tersimpan otomatis di perangkat ini.</p>
          </div>
        </div>
      )}

      {/* Modal Dialog Share ke Media Sosial */}
      {selectedEntryToShare && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 select-none animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-stone-700/80 rounded-3xl p-5 sm:p-6 max-w-sm sm:max-w-md w-full shadow-2xl flex flex-col gap-4 text-stone-100">
            {/* Header Modal */}
            <div className="flex items-center justify-between pb-2 border-b border-stone-800">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-400" />
                <h3 className="font-black text-sm sm:text-base text-amber-200">
                  Bagikan Hasil Skor ke Medsos
                </h3>
              </div>
              <button
                onClick={() => setSelectedEntryToShare(null)}
                className="p-1 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white transition-all cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Kartu Skor Berhadiah (Visual Share Card Preview) */}
            <div className="relative w-full rounded-2xl bg-gradient-to-br from-amber-950/70 via-stone-900 to-slate-950 border-2 border-amber-500/60 p-4 shadow-xl overflow-hidden text-center">
              <div className="absolute top-2 right-2 text-stone-500 font-mono text-[9px] uppercase tracking-widest font-bold">
                Balakutak Master
              </div>

              {/* Mascot Logo Mini */}
              <div className="w-12 h-12 mx-auto rounded-full p-0.5 bg-gradient-to-tr from-amber-500 to-yellow-300 shadow-md mb-1.5">
                <img
                  src={balakutakLogo}
                  alt="Balakutak Master Logo"
                  className="w-full h-full rounded-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30 mb-1.5">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Pos Ronda Warkop</span>
              </div>

              <h4 className="text-base sm:text-lg font-black text-stone-100">
                {selectedEntryToShare.name}
              </h4>
              <p className="text-[11px] text-amber-200/80 font-semibold mb-2">
                {selectedEntryToShare.title}
              </p>

              <div className="py-2.5 my-1 bg-stone-950/80 rounded-xl border border-stone-800/80">
                <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">
                  Total Perolehan Skor
                </span>
                <span className="font-mono text-2xl sm:text-3xl font-black text-amber-300 tracking-tight">
                  {selectedEntryToShare.score.toLocaleString('id-ID')}
                </span>
                <span className="text-[11px] text-stone-300 block font-mono mt-0.5">
                  Berhasil Menembus <strong>Pos Ronda {selectedEntryToShare.roundReached}</strong>
                </span>
              </div>

              <p className="text-[10px] text-stone-400 mt-2 italic">
                "Siapa berani kalahkan strategi domino dan jimat saktiku? Buktikan di meja!"
              </p>
            </div>

            {/* Notifikasi Salin Berhasil */}
            {copyFeedback && (
              <div className="bg-emerald-950/90 text-emerald-300 text-xs font-bold px-3 py-2 rounded-xl border border-emerald-500/50 flex items-center justify-center gap-1.5 animate-in fade-in">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>{copyFeedback}</span>
              </div>
            )}

            {/* Tombol Pilihan Media Sosial */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              {/* WhatsApp */}
              <a
                href={getWhatsAppShareUrl(
                  generateShareText({
                    playerName: selectedEntryToShare.name,
                    score: selectedEntryToShare.score,
                    round: selectedEntryToShare.roundReached,
                  })
                )}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => sounds.playTileClack()}
                className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp</span>
              </a>

              {/* Twitter / X */}
              <a
                href={getTwitterShareUrl(
                  generateShareText({
                    playerName: selectedEntryToShare.name,
                    score: selectedEntryToShare.score,
                    round: selectedEntryToShare.roundReached,
                  })
                )}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => sounds.playTileClack()}
                className="py-2.5 px-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all"
              >
                <Twitter className="w-4 h-4" />
                <span>Twitter / X</span>
              </a>

              {/* Telegram */}
              <a
                href={getTelegramShareUrl(
                  generateShareText({
                    playerName: selectedEntryToShare.name,
                    score: selectedEntryToShare.score,
                    round: selectedEntryToShare.roundReached,
                  })
                )}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => sounds.playTileClack()}
                className="py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all"
              >
                <Send className="w-4 h-4" />
                <span>Telegram</span>
              </a>

              {/* Salin Teks / Link */}
              <button
                onClick={() => handleCopyShareText(selectedEntryToShare)}
                className="py-2.5 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 font-bold text-xs flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all cursor-pointer"
              >
                <Copy className="w-4 h-4 text-amber-400" />
                <span>Salin Teks</span>
              </button>
            </div>

            {/* Tombol Native Web Share (Cocok untuk HP) */}
            <button
              onClick={() => handleNativeShare(selectedEntryToShare)}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>Buka Opsi Share Ponsel (Lainnya)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
