/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useEffect } from 'react';
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
  const activeRoundRef = useRef<HTMLSpanElement>(null);

  // Auto-scroll nomor ronde aktif
  useEffect(() => {
    if (activeRoundRef.current) {
      activeRoundRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }
  }, [posRonda.currentRound]);

  // Babak Pos Ronda 1, 2, 3, dan seterusnya
  const totalRounds = Math.max(8, posRonda.currentRound + 1);
  const roundList = Array.from({ length: totalRounds }, (_, i) => i + 1);

  return (
    <header className="w-full bg-slate-900/95 backdrop-blur-md border-b border-stone-800/80 px-2.5 sm:px-4 py-1.5 text-stone-100 flex flex-col gap-1.5 shrink-0 z-30 shadow-md">
      {/* Bagian Atas: Tombol Menu & Tulisan Pos Ronda (1, 2, 3, dst) yang memanjang ke kanan */}
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

        {/* Tulisan Pos Ronda (1, 2, 3, dst) Memanjang Horizontal ke Kanan */}
        <div className="flex items-center gap-1 text-xs overflow-x-auto no-scrollbar scroll-smooth py-0.5">
          <span className="font-extrabold text-amber-300 text-xs tracking-wide shrink-0 mr-0.5">
            Pos Ronda (
          </span>
          <div className="flex items-center gap-1 shrink-0">
            {roundList.map((r, idx) => {
              const isCurrent = r === posRonda.currentRound;
              const isCompleted = r < posRonda.currentRound;

              return (
                <React.Fragment key={r}>
                  {isCurrent ? (
                    <span
                      ref={activeRoundRef}
                      className="px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 font-black text-xs shadow-md border border-amber-300 ring-2 ring-amber-400/40 shrink-0 animate-pulse"
                      title={`Babak Saat Ini: Pos Ronda ${r}`}
                    >
                      {r}
                    </span>
                  ) : isCompleted ? (
                    <span
                      className="px-1.5 py-0.5 rounded-md bg-emerald-950/70 border border-emerald-500/40 text-emerald-400 text-xs font-bold shrink-0"
                      title={`Pos Ronda ${r} selesai`}
                    >
                      ✓{r}
                    </span>
                  ) : (
                    <span
                      className="px-1.5 py-0.5 rounded-md bg-stone-800/40 text-stone-500 text-xs font-medium shrink-0"
                      title={`Pos Ronda ${r}`}
                    >
                      {r}
                    </span>
                  )}
                  {idx < roundList.length - 1 && (
                    <span className="text-stone-600 text-[10px]">,</span>
                  )}
                </React.Fragment>
              );
            })}
          </div>
          <span className="font-extrabold text-amber-300 text-xs shrink-0 ml-0.5">
            )
          </span>
        </div>
      </div>

      {/* Bagian Bawah: Target, Total, & Koin tepat di bawah tulisan Pos Ronda */}
      <div className="flex items-center justify-between gap-2 pt-1 border-t border-stone-800/60">
        {/* Target Skor & Skor Babak Ini */}
        <div className="flex-1 max-w-xs sm:max-w-sm md:max-w-md flex flex-col justify-center">
          <div className="flex items-center justify-between text-[11px] font-mono mb-1">
            <span className="text-stone-300 flex items-center gap-1 font-bold">
              <Target className="w-3.5 h-3.5 text-amber-400" />
              Target: <strong className="text-amber-300 font-extrabold">{posRonda.targetScore.toLocaleString('id-ID')}</strong>
            </span>
            <span className="text-stone-400 text-[10px] sm:text-[11px]">
              Ronde: <strong className="text-emerald-400 font-bold">{posRonda.roundScore.toLocaleString('id-ID')}</strong>
            </span>
          </div>
          <div className="w-full bg-stone-800/90 rounded-full h-2 overflow-hidden shadow-inner border border-stone-700/40">
            <div
              className="bg-gradient-to-r from-amber-500 to-emerald-400 h-2 rounded-full transition-all duration-300 shadow"
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
