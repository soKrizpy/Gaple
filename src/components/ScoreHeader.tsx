/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useEffect, useState } from 'react';
import {
  Target,
  Coins,
  Trophy,
  Menu as MenuIcon,
} from 'lucide-react';
import { PosRondaState } from '../types';
import { sounds } from '../utils/soundEffects';

interface ScoreHeaderProps {
  score: number;
  chips?: number;
  mult?: number;
  boneyardCount?: number;
  isMuted?: boolean;
  onToggleMute?: () => void;
  onOpenMenu: () => void;
  posRonda: PosRondaState;
  coins: number;
}

export const ScoreHeader: React.FC<ScoreHeaderProps> = ({
  score,
  onOpenMenu,
  posRonda,
  coins,
}) => {
  const progressPercent = Math.min(100, Math.round((posRonda.roundScore / posRonda.targetScore) * 100));
  // Deteksi transisi kenaikan ronde (Pos Ronda 1 -> Pos Ronda 2 -> Pos Ronda 3 dst)
  const [isRoundTransitioning, setIsRoundTransitioning] = useState(false);
  const prevRoundRef = useRef(posRonda.currentRound);

  useEffect(() => {
    if (posRonda.currentRound !== prevRoundRef.current) {
      setIsRoundTransitioning(true);
      const timer = setTimeout(() => {
        setIsRoundTransitioning(false);
      }, 1600);
      prevRoundRef.current = posRonda.currentRound;
      return () => clearTimeout(timer);
    }
  }, [posRonda.currentRound]);

  return (
    <header className="w-full bg-slate-900/95 backdrop-blur-md border-b border-stone-800/80 px-2.5 sm:px-4 py-1 sm:py-1.5 text-stone-100 flex flex-col gap-1 sm:gap-1.5 shrink-0 z-30 shadow-md">
      {/* Bagian Atas: Tombol Menu & Tulisan Pos Ronda Dinamis */}
      <div className="flex items-center gap-2 sm:gap-3 w-full">
        {/* Tombol Burger Menu */}
        <button
          onClick={() => {
            sounds.playTileClack();
            onOpenMenu();
          }}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-stone-800/90 hover:bg-stone-700 text-stone-200 border border-stone-700/80 text-xs font-bold transition-all cursor-pointer active:scale-95 shadow-xs shrink-0"
          title="Menu & Jeda"
        >
          <MenuIcon className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-xs">Menu</span>
        </button>

        {/* Tulisan Dinamis: Pos Ronda 1, 2, 3... */}
        <div className="flex items-center gap-2 text-xs py-0.5">
          {/* Label Babak Dinamis Utama dengan Efek Transisi */}
          <div
            id="pos-ronda-dynamic-label"
            className={`flex items-center gap-1.5 px-3 py-1 rounded-xl border transition-all duration-500 shrink-0 select-none ${
              isRoundTransitioning
                ? 'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-slate-950 font-black border-yellow-200 ring-4 ring-amber-400/80 shadow-[0_0_25px_rgba(245,158,11,1)] scale-105'
                : 'bg-gradient-to-r from-amber-500/25 to-amber-600/10 border-amber-500/50 text-amber-300 font-extrabold shadow-sm'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full transition-colors ${
                isRoundTransitioning ? 'bg-slate-950 animate-ping' : 'bg-amber-400 animate-pulse'
              }`}
            />
            <span className="tracking-wide text-xs">Pos Ronda</span>
            <span
              key={`round-num-${posRonda.currentRound}`}
              className={`font-mono text-sm font-black transition-transform duration-300 inline-block ${
                isRoundTransitioning ? 'text-slate-950 scale-125 animate-bounce' : 'text-amber-300'
              }`}
            >
              {posRonda.currentRound}
            </span>

            {isRoundTransitioning && (
              <span className="text-[9px] bg-slate-950 text-amber-300 font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider ml-0.5 animate-pulse">
                Babak Baru!
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Bagian Bawah: Target, Skor, Total, & Koin tepat di bawah tulisan Pos Ronda */}
      <div className="flex items-center justify-between gap-2 pt-1 border-t border-stone-800/60">
        {/* Target Skor & Skor Babak Ini */}
        <div className="flex-1 max-w-xs sm:max-w-sm md:max-w-md flex flex-col justify-center">
          <div className="flex items-center justify-between text-[11px] font-mono mb-0.5 sm:mb-1">
            <span className="text-stone-300 flex items-center gap-1 font-bold">
              <Target className="w-3.5 h-3.5 text-amber-400" />
              Target: <strong className="text-amber-300 font-extrabold">{posRonda.targetScore.toLocaleString('id-ID')}</strong>
            </span>
            <span className="text-stone-400 text-[10px] sm:text-[11px]">
              Skor: <strong className="text-emerald-400 font-bold">{posRonda.roundScore.toLocaleString('id-ID')}</strong>
            </span>
          </div>
          <div className="w-full bg-stone-800/90 rounded-full h-1.5 sm:h-2 overflow-hidden shadow-inner border border-stone-700/40">
            <div
              className="bg-gradient-to-r from-amber-500 to-emerald-400 h-1.5 sm:h-2 rounded-full transition-all duration-300 shadow"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Sisi Kanan: Skor Total & Dompet Koin */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Total Score Ticker */}
          <div className="flex items-center gap-1.5 bg-stone-950/90 px-2.5 py-1 rounded-xl border border-stone-800 shadow-xs">
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
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 shadow-xs">
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-mono font-bold text-xs md:text-sm">{coins}</span>
          </div>
        </div>
      </div>
    </header>
  );
};
