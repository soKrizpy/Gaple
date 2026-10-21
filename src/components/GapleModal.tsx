/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';
import { Relic, PosRondaState, Domino } from '../types';
import { Trophy, Sparkles, RefreshCw, Flame, ArrowRight, Video, Store, Coins, Home, ShieldAlert } from 'lucide-react';
import { DominoTile } from './DominoTile';
import { animateModalOpen } from '../AnimationController.js';

interface ResultModalProps {
  isOpen: boolean;
  isDeadlock: boolean;
  scoreEarned: number;
  availableRelicChoices?: Relic[];
  onSelectRelic?: (relic: Relic) => void;
  onNextRound: () => void;
  posRonda: PosRondaState;
  gapleExplosionData?: {
    pipSum: number;
    multiplier: number;
    explosionScore: number;
  } | null;
  coinsEarned?: number;
  onReviveWithAd?: () => void;
  onOpenShop?: () => void;
  onReturnToMainMenu?: () => void;
  handRemaining?: Domino[];
}

export const GapleModal: React.FC<ResultModalProps> = ({
  isOpen,
  isDeadlock,
  scoreEarned,
  availableRelicChoices = [],
  onSelectRelic,
  onNextRound,
  posRonda,
  gapleExplosionData,
  coinsEarned = 0,
  onReviveWithAd,
  onOpenShop,
  onReturnToMainMenu,
  handRemaining = [],
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && modalRef.current) {
      animateModalOpen(modalRef.current);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isTargetAchieved = posRonda.roundScore >= posRonda.targetScore;

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50 select-none">
      <div
        ref={modalRef}
        id="result-modal-card"
        className="bg-slate-900 border-2 border-amber-500/60 rounded-3xl p-5 sm:p-7 max-w-md w-full shadow-[0_0_50px_rgba(0,0,0,0.9)] flex flex-col gap-4 text-stone-100 max-h-[90vh] overflow-y-auto"
      >
        {/* Banner Status Menang / Kalah */}
        <div className="text-center flex flex-col items-center">
          <div
            className={`w-16 h-16 rounded-3xl flex items-center justify-center text-3xl shadow-xl mb-2.5 ${
              isTargetAchieved
                ? 'bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 shadow-amber-500/30'
                : 'bg-gradient-to-tr from-rose-600 to-red-800 text-white shadow-rose-600/30'
            }`}
          >
            {isTargetAchieved ? (
              <Trophy className="w-9 h-9 fill-slate-950" />
            ) : isDeadlock ? (
              <Flame className="w-9 h-9 text-yellow-300" />
            ) : (
              <ShieldAlert className="w-9 h-9" />
            )}
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            {isTargetAchieved ? (
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-500">
                TARGET POS RONDA TERCAPAI!
              </span>
            ) : isDeadlock ? (
              <span className="text-rose-400">MEJA GAPLE TERKUNCI!</span>
            ) : (
              <span className="text-rose-400">GILIRAN HABIS!</span>
            )}
          </h2>

          <p className="text-xs sm:text-sm text-stone-300 mt-1 leading-snug">
            {isTargetAchieved
              ? `Hebat! Anda mengumpulkan skor melebihi target Pos Ronda ${posRonda.currentRound} dan berhak belanja di Toko Ronda!`
              : isDeadlock
              ? 'Meja terkunci rapat! Poin ledakan telah ditambahkan, namun target skor belum tercapai.'
              : `Kuota pasang batu habis sebelum target Pos Ronda ${posRonda.currentRound} terpenuhi.`}
          </p>
        </div>

        {/* Kalkulasi Ledakan Meja Gaple jika terjadi Deadlock */}
        {isDeadlock && gapleExplosionData && (
          <div className="bg-red-950/60 border border-red-500/60 rounded-2xl p-3 flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-red-300 uppercase tracking-wider">
              <Flame className="w-4 h-4 text-yellow-300 animate-pulse" />
              <span>Rincian Ledakan Skor Gaple:</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center font-mono text-xs">
              <div className="bg-stone-900/90 p-2 rounded-xl border border-red-900/50">
                <span className="text-[10px] text-stone-400 block">Sisa Titik:</span>
                <span className="text-base font-black text-amber-300">{gapleExplosionData.pipSum}</span>
              </div>
              <div className="bg-stone-900/90 p-2 rounded-xl border border-red-900/50">
                <span className="text-[10px] text-stone-400 block">Pengali:</span>
                <span className="text-base font-black text-rose-400">×{gapleExplosionData.multiplier}</span>
              </div>
              <div className="bg-stone-900/90 p-2 rounded-xl border border-red-900/50">
                <span className="text-[10px] text-stone-400 block">Ledakan:</span>
                <span className="text-base font-black text-emerald-400">+{gapleExplosionData.explosionScore}</span>
              </div>
            </div>
          </div>
        )}

        {/* Skor Babak & Koin */}
        <div className="bg-stone-950/80 p-3.5 rounded-2xl border border-stone-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-stone-400 font-bold uppercase block">
              Skor Pos Ronda {posRonda.currentRound}:
            </span>
            <span className="text-lg font-black text-amber-300 font-mono">
              {posRonda.roundScore.toLocaleString('id-ID')} / {posRonda.targetScore.toLocaleString('id-ID')}
            </span>
          </div>

          {isTargetAchieved && (
            <div className="text-right flex items-center gap-1.5 bg-amber-500/15 px-3 py-1.5 rounded-xl border border-amber-500/40">
              <Coins className="w-4 h-4 text-amber-400" />
              <div>
                <span className="text-[9px] text-stone-400 font-bold uppercase block">Hadiah:</span>
                <span className="text-sm font-black text-amber-300 font-mono">+{coinsEarned} Koin</span>
              </div>
            </div>
          )}
        </div>

        {/* Sisa Batu di Tangan jika Kalah */}
        {!isTargetAchieved && handRemaining.length > 0 && (
          <div className="flex flex-col gap-1.5 bg-stone-950/60 p-2.5 rounded-xl border border-stone-800">
            <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
              Sisa Batu di Tangan ({handRemaining.length}):
            </span>
            <div className="flex items-center gap-1 overflow-x-auto py-1 no-scrollbar">
              {handRemaining.map((tile) => (
                <div key={tile.id} className="scale-75 origin-left shrink-0 -mr-2">
                  <DominoTile domino={tile} size="sm" isBoardTile={true} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pemilihan Jimat Hadiah Babak jika Menang */}
        {isTargetAchieved && availableRelicChoices.length > 0 && onSelectRelic && (
          <div className="flex flex-col gap-2 pt-1 border-t border-stone-800">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
              <Sparkles className="w-4 h-4" />
              <span>Pilih 1 Jimat Hadiah Pos Ronda:</span>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {availableRelicChoices.map((r) => (
                <button
                  key={r.id}
                  onClick={() => onSelectRelic(r)}
                  className="p-3 rounded-2xl bg-stone-950 border border-amber-500/40 hover:border-amber-400 hover:bg-stone-900 text-left transition-all active:scale-98 flex items-center gap-3 cursor-pointer shadow-md"
                >
                  <span className="text-3xl shrink-0">{r.icon}</span>
                  <div className="flex-1">
                    <div className="text-xs font-extrabold text-amber-300">{r.name}</div>
                    <div className="text-[11px] text-stone-300 leading-tight mt-0.5">{r.desc}</div>
                    <div className="text-[10px] text-emerald-400 font-mono mt-1">
                      +{r.chipsBonus} Titik | +{r.multBonus} Pengali
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tombol Aksi Bawah */}
        <div className="flex flex-col gap-2 mt-1">
          {/* Menang: Tombol Masuk Toko Ronda */}
          {isTargetAchieved && onOpenShop && (
            <button
              onClick={onOpenShop}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-sm uppercase tracking-wider shadow-lg shadow-amber-500/25 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Store className="w-5 h-5 text-slate-950" />
              <span>Masuk Toko Ronda</span>
              <ArrowRight className="w-5 h-5 text-slate-950" />
            </button>
          )}

          {/* Kalah: Nonton Iklan Revive (+2 Giliran) */}
          {!isTargetAchieved && onReviveWithAd && (
            <button
              onClick={onReviveWithAd}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white font-black text-xs md:text-sm uppercase tracking-wider shadow-lg shadow-red-500/30 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer border border-rose-300 animate-pulse"
            >
              <Video className="w-4 h-4 text-yellow-300" />
              <span>Nonton Iklan (+2 Giliran Revive)</span>
            </button>
          )}

          {/* Kalah: Coba Lagi dari Pos 1 */}
          {!isTargetAchieved && (
            <button
              onClick={onNextRound}
              className="w-full py-2.5 rounded-2xl bg-stone-800 hover:bg-stone-700 text-stone-200 hover:text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer border border-stone-700"
            >
              <RefreshCw className="w-4 h-4 text-amber-400" />
              <span>Coba Lagi dari Pos 1</span>
            </button>
          )}

          {/* Kembali ke Menu Utama */}
          {onReturnToMainMenu && (
            <button
              onClick={onReturnToMainMenu}
              className="w-full py-2 rounded-2xl bg-stone-900/80 hover:bg-stone-800 text-stone-400 hover:text-stone-200 font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer border border-stone-800/80"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Kembali ke Menu Utama</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
