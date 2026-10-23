/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import balakutakLogo from '../assets/images/balakutak_master_logo_1792665905566.jpg';
import {
  Play,
  BookOpen,
  ListTodo,
  Volume2,
  VolumeX,
  Coins,
  Sparkles,
  Flame,
  Trophy,
  UserCircle,
  LogOut,
  X,
} from 'lucide-react';

interface MainMenuProps {
  onStartGame: () => void;
  onOpenRules: () => void;
  onOpenMissions: () => void;
  onOpenLeaderboard: () => void;
  unclaimedMissionsCount: number;
  coins: number;
  cloudUserName: string | null;
  cloudUserPhotoURL: string | null;
  cloudStatus: string;
  onGoogleLogin: () => void;
  onGoogleLogout: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  onStartGame,
  onOpenRules,
  onOpenMissions,
  onOpenLeaderboard,
  unclaimedMissionsCount,
  coins,
  cloudUserName,
  cloudUserPhotoURL,
  cloudStatus,
  onGoogleLogin,
  onGoogleLogout,
  isMuted,
  onToggleMute,
}) => {
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between bg-slate-950 text-stone-100 overflow-hidden select-none">
      {/* Background Ambience: Warkop Night Vibe & Subtle Felt Texture */}
      <div className="absolute inset-0 pointer-events-none opacity-30 bg-[radial-gradient(ellipse_80%_80%_at_50%_-10%,rgba(245,158,11,0.28),rgba(0,0,0,0))]" />
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(ellipse_60%_60%_at_50%_110%,rgba(16,185,129,0.22),rgba(0,0,0,0))]" />

      {/* Top Header Bar: Clean & Minimalist */}
      <header className="relative z-10 w-full max-w-4xl mx-auto px-4 py-3 flex items-center justify-between border-b border-stone-800/80 bg-slate-950/70 backdrop-blur-md">
        {/* Header ringkas: semua kontrol utama sejajar tanpa logo/judul kecil */}
        <div className="flex items-center justify-end gap-1.5 sm:gap-2 w-full">
          {/* Dompet Koin */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300">
            <Coins className="w-4 h-4 text-amber-400" />
            <span className="font-mono font-black text-xs md:text-sm">{coins.toLocaleString('id-ID')}</span>
          </div>

          {/* Login Google / status cloud — beri ruang agar foto profil terlihat jelas */}
          <button
            onClick={() => {
              if (cloudUserName) {
                setIsLogoutConfirmOpen(true);
              } else {
                onGoogleLogin();
              }
            }}
            title={cloudUserName ? 'Klik untuk logout dari akun Google' : cloudStatus}
            className="max-w-[140px] px-2.5 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 text-xs font-bold"
          >
            {cloudUserPhotoURL ? (
              <img src={cloudUserPhotoURL} alt="Foto profil Google" className="w-7 h-7 shrink-0 rounded-full object-cover border border-emerald-300/60" referrerPolicy="no-referrer" />
            ) : (
              <UserCircle className="w-5 h-5 shrink-0" />
            )}
            <span className="hidden sm:inline truncate">{cloudUserName ? cloudUserName.slice(0, 12) : 'Login Google'}</span>
          </button>

          {/* Kontrol suara, leaderboard, dan misi harian sejajar di header */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={onToggleMute}
              title={isMuted ? 'Nyalakan Suara' : 'Matikan Suara'}
              aria-label={isMuted ? 'Nyalakan Suara' : 'Matikan Suara'}
              className="p-2 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-700/80 text-stone-300 hover:text-white transition-all cursor-pointer active:scale-95"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>

            <button
              onClick={onOpenLeaderboard}
              title="Papan Skor & Klasemen Juara"
              aria-label="Papan Skor & Klasemen Juara"
              className="p-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 transition-all flex items-center justify-center cursor-pointer active:scale-95"
            >
              <Trophy className="w-4 h-4 text-amber-400" />
            </button>

            <button
              onClick={onOpenMissions}
              title="Misi Harian"
              aria-label="Misi Harian"
              className="relative p-2 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-700/80 text-stone-200 transition-all flex items-center justify-center cursor-pointer hover:border-amber-500/50 active:scale-95"
            >
              <ListTodo className="w-4 h-4 text-amber-400" />
              {unclaimedMissionsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-600 text-white font-mono font-black text-[9px] flex items-center justify-center animate-bounce shadow">
                  {unclaimedMissionsCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Center Content: Title & Core Action Buttons */}
      <main className="relative z-10 flex-1 w-full max-w-md mx-auto px-6 flex flex-col items-center justify-center text-center gap-5 py-6">
        {/* Engaging Mascot Icon Logo & Title */}
        <div className="space-y-2.5 flex flex-col items-center">
          {/* Engaging Mascot Logo */}
          <div className="relative group cursor-pointer transition-transform hover:scale-105 active:scale-95 duration-300">
            <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-amber-500 via-yellow-400 to-emerald-500 opacity-70 blur-md group-hover:opacity-100 transition-opacity animate-pulse pointer-events-none" />
            <img
              src={balakutakLogo}
              alt="Logo Balakutak Master"
              className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-full object-cover border-4 border-amber-300/80 shadow-[0_0_35px_rgba(245,158,11,0.65)] ring-4 ring-amber-500/40"
              referrerPolicy="no-referrer"
            />
            <div className="absolute -bottom-2 inset-x-0 flex justify-center">
              <span className="bg-slate-950 text-amber-300 text-[10px] sm:text-xs font-black px-3 py-0.5 rounded-full border border-amber-500/70 shadow-lg tracking-wider uppercase">
                EDISI POS RONDA
              </span>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold tracking-wide mt-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Tantangan Solo Gaple Warkop
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-amber-100 via-amber-200 to-yellow-500 tracking-tight leading-tight">
            BALAKUTAK MASTER
          </h1>

          <p className="text-xs md:text-sm text-stone-400 max-w-xs mx-auto leading-relaxed">
            Rangkai batu domino dengan sambungan mata yang cocok, manfaatkan kelipatan <span className="text-sky-300 font-bold">Titik Batu</span> × <span className="text-rose-400 font-bold">Pengali Sambungan</span>, koleksi Jimat Warkop, dan jadilah <strong>Balakutak Master</strong> sejati!
          </p>
        </div>

        {/* Action Buttons: Minimalis & Fokus */}
        <div className="w-full space-y-3 pt-2">
          {/* Tombol Utama: Mulai Main */}
          <button
            onClick={onStartGame}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:via-yellow-400 hover:to-amber-500 text-slate-950 font-black text-lg md:text-xl shadow-[0_0_30px_rgba(245,158,11,0.35)] transition-all transform hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] flex items-center justify-center gap-3 cursor-pointer"
          >
            <Play className="w-6 h-6 fill-slate-950" />
            MULAI MAIN
          </button>

          {/* Tombol Papan Skor & Klasemen Ronda */}
          <button
            onClick={onOpenLeaderboard}
            className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-amber-600/30 via-stone-900 to-amber-500/20 hover:from-amber-600/40 hover:to-amber-500/30 border border-amber-500/60 text-amber-200 font-extrabold text-sm transition-all flex items-center justify-center gap-2.5 cursor-pointer active:scale-[0.99] shadow-md"
          >
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>Papan Skor & Klasemen Juara</span>
          </button>

          {/* Tombol Cara Main */}
          <button
            onClick={onOpenRules}
            className="w-full py-3 px-5 rounded-2xl bg-stone-900/90 hover:bg-stone-800 border border-stone-800 hover:border-amber-500/40 text-stone-200 font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
          >
            <BookOpen className="w-4 h-4 text-amber-400" />
            Cara Main & Aturan
          </button>

          {/* Tombol Misi Harian */}
          <button
            onClick={onOpenMissions}
            className="w-full py-2.5 px-4 rounded-xl bg-stone-900/60 hover:bg-stone-800/80 border border-stone-800 text-stone-400 hover:text-amber-300 font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
          >
            <ListTodo className="w-3.5 h-3.5 text-amber-400" />
            Misi Harian ({unclaimedMissionsCount} Hadiah Siap Klaim)
          </button>
        </div>
      </main>

      {isLogoutConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm px-4" role="dialog" aria-modal="true" aria-labelledby="logout-dialog-title">
          <div className="w-full max-w-sm rounded-2xl border border-amber-500/40 bg-slate-950 p-6 shadow-[0_0_40px_rgba(245,158,11,0.18)]">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-amber-400/30 bg-amber-500/10 text-amber-300">
              <LogOut className="h-7 w-7" />
            </div>
            <h2 id="logout-dialog-title" className="text-center text-xl font-black text-amber-100">Keluar dari akun?</h2>
            <p className="mt-2 text-center text-sm leading-relaxed text-stone-300">
              Kamu akan logout dari akun Google <span className="font-bold text-white">{cloudUserName}</span>. Pastikan progres permainanmu sudah tersimpan.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button type="button" onClick={() => setIsLogoutConfirmOpen(false)} className="flex items-center justify-center gap-2 rounded-xl border border-stone-700 bg-stone-900 px-4 py-3 text-sm font-bold text-stone-200 transition hover:bg-stone-800">
                <X className="h-4 w-4" /> Batal
              </button>
              <button type="button" onClick={() => { setIsLogoutConfirmOpen(false); onGoogleLogout(); }} className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 px-4 py-3 text-sm font-black text-slate-950 transition hover:brightness-110 active:scale-95">
                <LogOut className="h-4 w-4" /> Ya, logout
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="text-center text-[10px] text-stone-500 py-1">{cloudStatus}</div>

      {/* Footer Info Versi */}
      <footer className="relative z-10 w-full text-center py-4 text-xs text-stone-500 border-t border-stone-900 bg-slate-950/80">
        <p className="font-mono text-[11px] text-stone-500">
          Balakutak Master · Edisi Pos Ronda Warkop
        </p>
      </footer>
    </div>
  );
};
