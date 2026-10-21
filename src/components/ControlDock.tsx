/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Domino } from '../types';
import { DominoTile } from './DominoTile';
import { CheckCircle2, Trash2, Flame, ArrowLeftRight } from 'lucide-react';

interface ControlDockProps {
  hand: Domino[];
  selectedTile: Domino | null;
  leftEnd: number | null;
  rightEnd: number | null;
  canPlayLeft: boolean;
  canPlayRight: boolean;
  discardsLeft: number;
  playsLeft: number;
  onSelectTile: (tile: Domino) => void;
  onPlaceTile: (targetEnd: 'left' | 'right') => void;
  onDiscardTile: (tile: Domino) => void;
  onTriggerGapleExplosion: () => void;
  onSortHand: () => void;
  hasValidMove: boolean;
  isPortrait: boolean;
  isCompactHeight?: boolean;
}

export const ControlDock: React.FC<ControlDockProps> = ({
  hand,
  selectedTile,
  leftEnd,
  rightEnd,
  canPlayLeft,
  canPlayRight,
  discardsLeft,
  playsLeft,
  onSelectTile,
  onPlaceTile,
  onDiscardTile,
  onTriggerGapleExplosion,
  onSortHand,
  hasValidMove,
  isPortrait,
  isCompactHeight = false,
}) => {
  const isBoardEmpty = leftEnd === null || rightEnd === null;

  const isTilePlayable = (tile: Domino) => {
    if (isBoardEmpty) return true;
    return (
      tile.head === leftEnd ||
      tile.tail === leftEnd ||
      tile.head === rightEnd ||
      tile.tail === rightEnd
    );
  };

  const handPipTotal = hand.reduce((acc, t) => acc + t.head + t.tail, 0);

  return (
    <footer className="w-full bg-slate-900/95 backdrop-blur-md border-t border-stone-800 px-2 sm:px-3 py-1.5 sm:py-2 flex flex-col gap-1 sm:gap-2 shrink-0 z-30 shadow-[0_-4px_25px_rgba(0,0,0,0.6)]">
      {/* Action Bar & Secondary Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        {/* Info Tangan */}
        <div className="flex items-center gap-2 text-stone-300">
          <span className="font-bold text-amber-300">Tangan ({hand.length}):</span>
          <span className="text-[11px] font-mono bg-stone-800/80 px-2 py-0.5 rounded-lg border border-stone-700">
            Total {handPipTotal} Titik
          </span>
          {!hasValidMove && !isBoardEmpty && (
            <span className="text-rose-400 font-bold text-[11px] animate-pulse">
              • Batu buntu / tidak cocok
            </span>
          )}
        </div>

        {/* Buttons: Urutkan, Buang Terpilih, & Kunci Meja (Gaple) */}
        <div className="flex items-center gap-2">
          {/* Urutkan Batu */}
          <button
            onClick={onSortHand}
            title="Urutkan Balak & Nilai Titik"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white text-xs font-semibold border border-stone-700/80 transition-all active:scale-95 cursor-pointer"
          >
            <ArrowLeftRight className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Urutkan</span>
          </button>

          {/* Tombol Buang Terpilih (Discard) */}
          <button
            onClick={() => selectedTile && onDiscardTile(selectedTile)}
            disabled={!selectedTile || discardsLeft <= 0}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedTile && discardsLeft > 0
                ? 'bg-rose-700 hover:bg-rose-600 text-white shadow-md shadow-rose-900/30 active:scale-95 cursor-pointer border border-rose-500'
                : 'bg-stone-800/80 text-stone-500 border border-stone-700/60 cursor-not-allowed'
            }`}
            title={
              !selectedTile
                ? 'Pilih batu di tangan terlebih dahulu untuk dibuang'
                : discardsLeft <= 0
                ? 'Kuota buang batu babak ini telah habis!'
                : `Buang batu [${selectedTile.head}-${selectedTile.tail}] dan tarik batu baru`
            }
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Buang Terpilih ({discardsLeft}/3)</span>
          </button>

          {/* Tombol Darurat: Kunci Meja (GAPLE!) */}
          <button
            onClick={onTriggerGapleExplosion}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all border shadow-lg ${
              !hasValidMove && !isBoardEmpty
                ? 'bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white border-yellow-300 shadow-red-500/40 animate-bounce active:scale-95 cursor-pointer'
                : 'bg-stone-900 hover:bg-stone-800 text-amber-300 hover:text-amber-200 border-amber-500/40 cursor-pointer active:scale-95'
            }`}
            title="Kunci Meja: Ledakkan seluruh sisa titik batu di tangan (Titik x 3) sebagai skor penutup babak!"
          >
            <Flame className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />
            <span>Kunci Meja (Gaple)</span>
          </button>
        </div>
      </div>

      {/* Action Bar saat batu dipilih untuk dipasang */}
      {selectedTile && (
        <div className="flex flex-wrap items-center justify-between gap-2 bg-stone-950/85 px-3 py-1.5 rounded-xl border border-amber-500/40 shadow-inner">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-stone-300">
              Batu dipilih: <strong className="text-amber-300 font-mono">[{selectedTile.head}-{selectedTile.tail}]</strong>
            </span>
            {selectedTile.isDouble && (
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-black">
                Balak Kembar (Mult ×2)
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {isBoardEmpty ? (
              <button
                onClick={() => onPlaceTile('left')}
                className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Pasang Batu Pertama (Mulai Meja)</span>
              </button>
            ) : (
              <>
                {canPlayLeft && (
                  <button
                    onClick={() => onPlaceTile('left')}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer border border-emerald-400/60"
                    title={`Batu akan otomatis berputar agar sisi yang cocok menyambung ke mata ${leftEnd} di ujung kiri meja`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Pasang Kiri (Mata {leftEnd})</span>
                  </button>
                )}

                {canPlayRight && (
                  <button
                    onClick={() => onPlaceTile('right')}
                    className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer border border-sky-400/60"
                    title={`Batu akan otomatis berputar agar sisi yang cocok menyambung ke mata ${rightEnd} di ujung kanan meja`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Pasang Kanan (Mata {rightEnd})</span>
                  </button>
                )}

                {!canPlayLeft && !canPlayRight && (
                  <span className="text-[11px] text-rose-400 font-medium italic">
                    Batu tidak cocok dengan ujung {leftEnd} atau {rightEnd}
                  </span>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Barisan 7 Batu Domino di Tangan Pemain */}
      <div className="w-full flex items-center justify-center overflow-x-auto py-0.5 sm:py-1 px-1 sm:px-2 no-scrollbar min-h-[72px] sm:min-h-[92px]">
        <div className="flex items-center justify-center gap-1.5 sm:gap-2.5 max-w-full">
          {hand.map((tile) => {
            const playable = isTilePlayable(tile);
            const isSelected = selectedTile?.id === tile.id;

            return (
              <div
                key={tile.id}
                id={`hand-tile-${tile.id}`}
                className="transition-transform duration-150 shrink-0 cursor-pointer"
              >
                <DominoTile
                  domino={tile}
                  orientation="vertical"
                  size={isPortrait || isCompactHeight ? 'sm' : 'md'}
                  isPlayable={playable}
                  isSelected={isSelected}
                  onClick={() => onSelectTile(tile)}
                />
              </div>
            );
          })}
        </div>
      </div>
    </footer>
  );
};
