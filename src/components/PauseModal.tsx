/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';
import { Play, RotateCcw, Home, BookOpen, Volume2, VolumeX, X, Trophy } from 'lucide-react';
import { animateModalOpen } from '../AnimationController.js';

interface PauseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRestartRound: () => void;
  onReturnToMainMenu: () => void;
  onOpenRules: () => void;
  onOpenLeaderboard: () => void;
  currentRound: number;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  isOpen,
  onClose,
  onRestartRound,
  onReturnToMainMenu,
  onOpenRules,
  onOpenLeaderboard,
  currentRound,
  isMuted,
  onToggleMute,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && modalRef.current) {
      animateModalOpen(modalRef.current);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 select-none">
      <div
        ref={modalRef}
        className="bg-slate-900 border border-stone-700/80 rounded-3xl p-6 max-w-sm w-full shadow-2xl flex flex-col gap-5 text-stone-100"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-800">
          <div>
            <h2 className="text-lg font-black text-amber-200">Menu Jeda</h2>
            <p className="text-xs text-stone-400">Pos Ronda {currentRound}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          {/* Lanjut Main */}
          <button
            onClick={onClose}
            className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg active:scale-98"
          >
            <Play className="w-4 h-4 fill-slate-950" />
            Lanjutkan Permainan
          </button>

          {/* Ulangi Babak Ini */}
          <button
            onClick={() => {
              onClose();
              onRestartRound();
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer border border-stone-700 active:scale-98"
          >
            <RotateCcw className="w-4 h-4 text-amber-400" />
            Ulangi Babak Ini
          </button>

          {/* Papan Skor & Klasemen */}
          <button
            onClick={() => {
              onClose();
              onOpenLeaderboard();
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer border border-amber-500/40 active:scale-98 shadow-sm"
          >
            <Trophy className="w-4 h-4 text-amber-400" />
            Papan Skor & Klasemen
          </button>

          {/* Panduan Aturan */}
          <button
            onClick={() => {
              onClose();
              onOpenRules();
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer border border-stone-700 active:scale-98"
          >
            <BookOpen className="w-4 h-4 text-sky-400" />
            Cara Main & Aturan
          </button>

          {/* Toggle Suara */}
          <button
            onClick={onToggleMute}
            className="w-full py-2.5 px-4 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer border border-stone-700 active:scale-98"
          >
            {isMuted ? (
              <>
                <VolumeX className="w-4 h-4 text-rose-400" />
                Nyalakan Suara (Muted)
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4 text-emerald-400" />
                Matikan Suara (Suara Aktif)
              </>
            )}
          </button>
        </div>

        {/* Footer: Keluar ke Menu Utama */}
        <div className="pt-2 border-t border-stone-800">
          <button
            onClick={() => {
              onClose();
              onReturnToMainMenu();
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-red-950/40 hover:bg-red-900/50 text-red-300 hover:text-red-200 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer border border-red-500/30 active:scale-98"
          >
            <Home className="w-4 h-4" />
            Keluar ke Menu Utama
          </button>
        </div>
      </div>
    </div>
  );
};
