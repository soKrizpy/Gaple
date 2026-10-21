/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Volume2,
  VolumeX,
  Target,
  Zap,
  Trash2,
  Layers,
  Coins,
  Trophy,
  Menu as MenuIcon,
} from 'lucide-react';
import { PosRondaState } from '../types';

interface ScoreHeaderProps {
  score: number;
  chips: number; // Titik
  mult: number;  // Pengali
  boneyardCount: number;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenMenu: () => void;
  posRonda: PosRondaState;
  coins: number;
}

export const ScoreHeader: React.FC<ScoreHeaderProps> = ({
  score,
  chips,
  mult,
  boneyardCount,
  isMuted,
  onToggleMute,
  onOpenMenu,
  posRonda,
  coins,
}) => {
  const progressPercent = Math.min(100, Math.round((posRonda.roundScore / posRonda.targetScore) * 100));

  return (
    <header className="w-full bg-slate-900/95 backdrop-blur-md border-b border-stone-800/80 px-3 sm:px-4 py-2 text-stone-100 flex flex-col gap-1.5 shrink-0 z-30 shadow-md">
      {/* Baris 1: Tombol Menu, Indikator Pos Ronda, Target Progress & Dompet Koin */}
      <div className="flex items-center justify-between gap-2">
        {/* Sisi Kiri: Menu & Audio */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={onOpenMenu}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-stone-800/90 hover:bg-stone-700 text-stone-200 border border-stone-700/80 text-xs font-bold transition-all cursor-pointer active:scale-95 shadow-xs"
            title="Menu & Jeda"
          >
            <MenuIcon className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Menu</span>
          </button>

          <button
            onClick={onToggleMute}
            className="p-1.5 rounded-xl bg-stone-800/80 hover:bg-stone-700 text-stone-300 transition-all cursor-pointer"
            title={isMuted ? 'Nyalakan Suara' : 'Matikan Suara'}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
          </button>

          {/* Pos Ronda Tag */}
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-extrabold tracking-wide">
            <span>Pos Ronda {posRonda.currentRound}</span>
          </div>
        </div>

        {/* Sisi Tengah: Target Skor & Skor Babak Ini */}
        <div className="flex-1 max-w-xs md:max-w-md flex flex-col justify-center px-1 sm:px-3">
          <div className="flex items-center justify-between text-[11px] font-mono mb-1">
            <span className="text-stone-400 flex items-center gap-1 font-bold">
              <Target className="w-3.5 h-3.5 text-amber-400" />
              Target: <strong className="text-amber-300">{posRonda.targetScore.toLocaleString('id-ID')}</strong>
            </span>
            <span className="text-stone-400">
              Ronde: <strong className="text-emerald-400">{posRonda.roundScore.toLocaleString('id-ID')}</strong>
            </span>
          </div>
          <div className="w-full bg-stone-800 rounded-full h-2 overflow-hidden shadow-inner">
            <div
              className="bg-gradient-to-r from-amber-500 to-emerald-400 h-2 rounded-full transition-all duration-300 shadow"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Sisi Kanan: Skor Total Ticker & Dompet Koin */}
        <div className="flex items-center gap-2">
          {/* Total Score Ticker */}
          <div className="flex items-center gap-1.5 bg-stone-950/80 px-2.5 py-1 rounded-xl border border-stone-800">
            <Trophy className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <div className="flex flex-col text-right">
              <span className="text-[8px] uppercase font-bold text-stone-400 leading-none">Total</span>
              <span
                id="header-score-ticker"
                className="text-xs md:text-sm font-black text-amber-300 font-mono tracking-tight leading-none mt-0.5"
              >
                {score.toLocaleString('id-ID')}
              </span>
            </div>
          </div>

          {/* Dompet Koin */}
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300">
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-mono font-bold text-xs md:text-sm">{coins}</span>
          </div>
        </div>
      </div>

      {/* Baris 2: Kuota Pasang, Buang, Rantai & Indikator Titik x Pengali */}
      <div className="flex flex-wrap items-center justify-between gap-1.5 pt-1 border-t border-stone-800/60 text-xs">
        {/* Kuota Giliran Pasang & Buang Batu */}
        <div className="flex items-center gap-2 sm:gap-3 text-[11px]">
          <span className="flex items-center gap-1 text-stone-300 bg-stone-950/60 px-2 py-0.5 rounded-lg border border-stone-800">
            <Zap className="w-3 h-3 text-sky-400" /> Pasang:
            <strong className={`font-mono font-bold ${posRonda.playsLeft <= 1 ? 'text-rose-400 animate-pulse' : 'text-sky-300'}`}>
              {posRonda.playsLeft}/4
            </strong>
          </span>

          <span className="flex items-center gap-1 text-stone-300 bg-stone-950/60 px-2 py-0.5 rounded-lg border border-stone-800">
            <Trash2 className="w-3 h-3 text-amber-400" /> Buang:
            <strong className="font-mono font-bold text-amber-300">{posRonda.discardsLeft}/3</strong>
          </span>

          <span className="flex items-center gap-1 text-stone-300 bg-stone-950/60 px-2 py-0.5 rounded-lg border border-stone-800">
            <Layers className="w-3 h-3 text-emerald-400" /> Rantai:
            <strong className="font-mono font-bold text-emerald-300">+{posRonda.streak} Mult</strong>
          </span>

          <span className="text-stone-500 text-[10px] hidden md:inline">
            Cadangan: <strong className="text-stone-400">{boneyardCount}</strong>
          </span>
        </div>

        {/* Formula Skor: Titik (Chips) x Pengali (Mult) */}
        <div className="flex items-center gap-1.5 bg-stone-950/80 px-2.5 py-0.5 rounded-lg border border-stone-800 ml-auto">
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-bold text-sky-400">TITIK:</span>
            <span className="font-mono font-black text-sky-300 text-xs">{chips}</span>
          </div>
          <span className="text-stone-500 font-bold">×</span>
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-bold text-rose-500">PENGALI:</span>
            <span className="font-mono font-black text-rose-400 text-xs">{mult}</span>
          </div>
        </div>
      </div>
    </header>
  );
};
