import React, { useState, useEffect, useRef } from 'react';
import { Domino } from '../types';
import { DominoTile } from './DominoTile';
import {
  CheckCircle2,
  Trash2,
  Flame,
  ArrowLeftRight,
  Zap,
  Layers,
  Sparkles,
} from 'lucide-react';
import { sounds } from '../utils/soundEffects';

interface ControlDockProps {
  hand: Domino[];
  selectedTile: Domino | null;
  leftEnd: number | null;
  rightEnd: number | null;
  canPlayLeft: boolean;
  canPlayRight: boolean;
  discardsLeft: number;
  playsLeft: number;
  streak?: number;
  chips?: number;
  mult?: number;
  wildcardActive?: boolean;
  wildcardUsedThisRound?: boolean;
  onToggleWildcard?: () => void;
  hasKipasSate?: boolean;
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
  streak = 0,
  wildcardActive = false,
  wildcardUsedThisRound = false,
  onToggleWildcard,
  hasKipasSate = false,
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

  // Deteksi peningkatan streak untuk memicu animasi menyala dinamis saat kartu berhasil tersambung
  const [isJustConnected, setIsJustConnected] = useState(false);
  const prevStreakRef = useRef(streak);

  useEffect(() => {
    if (streak > prevStreakRef.current && streak > 0) {
      setIsJustConnected(true);
      const timer = setTimeout(() => {
        setIsJustConnected(false);
      }, 950);
      return () => clearTimeout(timer);
    }
    prevStreakRef.current = streak;
  }, [streak]);

  const isTilePlayable = (tile: Domino) => {
    if (isBoardEmpty || wildcardActive) return true;
    return (
      tile.head === leftEnd ||
      tile.tail === leftEnd ||
      tile.head === rightEnd ||
      tile.tail === rightEnd
    );
  };

  const handPipTotal = hand.reduce((acc, t) => acc + t.head + t.tail, 0);

  return (
    <footer className="w-full bg-slate-900/95 backdrop-blur-md border-t border-stone-800 px-1.5 sm:px-3 pt-1 sm:pt-1.5 pb-2.5 sm:pb-3 flex flex-col gap-1 sm:gap-1.5 shrink-0 z-30 shadow-[0_-4px_25px_rgba(0,0,0,0.6)]">
      {/* Baris Kontrol Meja Bawah (Ringkas & Efisien untuk Layar HP agar Kartu Tidak Tertutup) */}
      <div className="flex items-center justify-between gap-1.5 px-2 py-1 rounded-xl bg-stone-950/80 border border-stone-800/80 text-xs">
        {/* Sisi Kiri: Kuota Pasang, Buang, & Streak Neon */}
        <div className="flex items-center gap-1 sm:gap-2 text-[11px] overflow-x-auto no-scrollbar">
          {/* Pasang */}
          <span className="flex items-center gap-1 text-stone-200 bg-stone-900/90 px-1.5 sm:px-2 py-0.5 rounded-lg border border-stone-800 shadow-xs shrink-0">
            <Zap className="w-3 h-3 text-sky-400" />
            <span className="hidden sm:inline text-stone-300 font-semibold">Pasang:</span>
            <strong className={`font-mono font-bold ${playsLeft <= 1 ? 'text-rose-400 animate-pulse' : 'text-sky-300'}`}>
              {playsLeft}/4
            </strong>
          </span>

          {/* Buang */}
          <span className="flex items-center gap-1 text-stone-200 bg-stone-900/90 px-1.5 sm:px-2 py-0.5 rounded-lg border border-stone-800 shadow-xs shrink-0">
            <Trash2 className="w-3 h-3 text-amber-400" />
            <span className="hidden sm:inline text-stone-300 font-semibold">Buang:</span>
            <strong className="font-mono font-bold text-amber-300">
              {discardsLeft}/3
            </strong>
          </span>

          {/* Komponen Indikator Rantai (Streak) dengan Efek Teks Neon Menyala Dinamis */}
          <div
            id="streak-neon-indicator"
            className={`relative flex items-center gap-1.5 px-2 sm:px-2.5 py-0.5 rounded-lg border transition-all duration-300 shrink-0 select-none ${
              isJustConnected ? 'scale-110 sm:scale-115' : 'scale-100'
            } ${
              streak === 0
                ? 'bg-stone-900/80 border-stone-800 text-stone-400'
                : streak === 1
                ? 'bg-emerald-950/90 border-emerald-400 text-emerald-300'
                : streak === 2
                ? 'bg-teal-950/90 border-teal-300 text-teal-200 ring-1 ring-teal-400/50'
                : streak === 3
                ? 'bg-amber-950/90 border-amber-300 text-amber-100 ring-2 ring-amber-400/60'
                : 'bg-gradient-to-r from-red-950 via-rose-950 to-amber-950 border-yellow-200 text-white ring-2 ring-yellow-400 animate-pulse'
            }`}
            style={{
              boxShadow:
                streak === 0
                  ? 'none'
                  : streak === 1
                  ? '0 0 12px rgba(16, 185, 129, 0.45), inset 0 0 6px rgba(52, 211, 153, 0.2)'
                  : streak === 2
                  ? '0 0 18px rgba(45, 212, 191, 0.65), inset 0 0 10px rgba(20, 184, 166, 0.3)'
                  : streak === 3
                  ? '0 0 25px rgba(245, 158, 11, 0.8), inset 0 0 12px rgba(251, 191, 36, 0.4)'
                  : '0 0 35px rgba(239, 68, 68, 0.9), 0 0 55px rgba(245, 158, 11, 0.7), inset 0 0 15px rgba(254, 240, 138, 0.5)',
            }}
          >
            {/* Animasi Ring Neon Berpijar saat Baru Menyambung Kartu */}
            {isJustConnected && (
              <div
                className={`absolute inset-0 rounded-lg animate-ping opacity-75 pointer-events-none ${
                  streak >= 4 ? 'bg-yellow-400' : streak >= 3 ? 'bg-amber-400' : 'bg-emerald-400'
                }`}
              />
            )}

            <Layers
              className={`w-3.5 h-3.5 transition-all duration-300 ${
                streak === 0
                  ? 'text-stone-500'
                  : streak === 1
                  ? 'text-emerald-400'
                  : streak === 2
                  ? 'text-teal-300 animate-bounce'
                  : streak === 3
                  ? 'text-amber-300 animate-bounce'
                  : 'text-yellow-300 animate-spin'
              }`}
            />

            {/* Teks Neon Menyala Sesuai Tingkat Streak */}
            <span
              className="text-[10px] sm:text-[11px] font-bold tracking-wide"
              style={{
                textShadow:
                  streak === 0
                    ? 'none'
                    : streak === 1
                    ? '0 0 7px #34d399, 0 0 14px #10b981'
                    : streak === 2
                    ? '0 0 8px #2dd4bf, 0 0 18px #0d9488, 0 0 28px #14b8a6'
                    : streak === 3
                    ? '0 0 10px #fde047, 0 0 22px #f59e0b, 0 0 35px #d97706'
                    : '0 0 10px #fff, 0 0 20px #facc15, 0 0 35px #ef4444, 0 0 50px #f43f5e',
              }}
            >
              Streak:
            </span>

            <strong
              className="font-mono font-black text-xs"
              style={{
                textShadow:
                  streak === 0
                    ? 'none'
                    : streak === 1
                    ? '0 0 8px #34d399, 0 0 16px #10b981'
                    : streak === 2
                    ? '0 0 10px #2dd4bf, 0 0 20px #0d9488, 0 0 30px #14b8a6'
                    : streak === 3
                    ? '0 0 12px #fde047, 0 0 24px #f59e0b, 0 0 36px #d97706'
                    : '0 0 14px #fff, 0 0 25px #facc15, 0 0 40px #ef4444, 0 0 60px #f43f5e',
              }}
            >
              +{streak}
            </strong>
          </div>
        </div>

        {/* Sisi Kanan: Urutkan & Kunci Meja (Gaple) */}
        <div className="flex items-center gap-1.5 shrink-0 ml-auto">
          {/* Tombol Urutkan Batu */}
          <button
            onClick={() => {
              sounds.playTileClack();
              onSortHand();
            }}
            title="Urutkan Balak & Nilai Titik"
            className="flex items-center gap-1 px-2 py-1 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white text-xs font-semibold border border-stone-700/80 transition-all active:scale-95 cursor-pointer shadow-xs"
          >
            <ArrowLeftRight className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline text-xs">Urutkan</span>
          </button>

          {/* Tombol Kunci Meja (GAPLE!) */}
          <button
            onClick={() => {
              sounds.playTileClack();
              onTriggerGapleExplosion();
            }}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-extrabold transition-all border shadow-lg ${
              !hasValidMove && !isBoardEmpty && !wildcardActive
                ? 'bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white border-yellow-300 shadow-red-500/40 animate-bounce active:scale-95 cursor-pointer'
                : 'bg-stone-900 hover:bg-stone-800 text-amber-300 hover:text-amber-200 border-amber-500/40 cursor-pointer active:scale-95'
            }`}
            title="Kunci Meja: Ledakkan seluruh sisa titik batu di tangan (Titik x 3) sebagai skor penutup babak!"
          >
            <Flame className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />
            <span>Gaple</span>
          </button>
        </div>
      </div>

      {/* Chain Aksi Lanjutan untuk Kartu yang Dipilih (Pasang, Jimat, Buang) */}
      {selectedTile && (
        <div className="flex flex-wrap items-center justify-between gap-2 bg-stone-950/90 px-2.5 py-1.5 rounded-xl border border-amber-500/50 shadow-lg animate-in fade-in slide-in-from-bottom-1 duration-200">
          {/* Info Batu Dipilih */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-stone-300">
              Pilihan: <strong className="text-amber-300 font-mono text-sm">[{selectedTile.head}-{selectedTile.tail}]</strong>
            </span>
            {selectedTile.isDouble && (
              <span className="px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-black">
                Balak (×2)
              </span>
            )}
          </div>

          {/* Deretan Chain Aksi Lanjutan: Pasang, Jimat, Buang */}
          <div className="flex flex-wrap items-center gap-1.5 ml-auto">
            {/* 1. Opsi Pasang ke Meja */}
            {isBoardEmpty ? (
              <button
                onClick={() => {
                  sounds.playTileClack();
                  onPlaceTile('left');
                }}
                className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1 shadow-md active:scale-95 transition-all cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Pasang Pertama</span>
              </button>
            ) : (
              <>
                {canPlayLeft && (
                  <button
                    onClick={() => {
                      sounds.playTileClack();
                      onPlaceTile('left');
                    }}
                    className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 shadow-md active:scale-95 transition-all cursor-pointer border border-emerald-400/60"
                    title={`Pasang menyambung mata ${leftEnd} di kiri meja`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Pasang Kiri ({leftEnd})</span>
                  </button>
                )}

                {canPlayRight && (
                  <button
                    onClick={() => {
                      sounds.playTileClack();
                      onPlaceTile('right');
                    }}
                    className="px-2.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-1 shadow-md active:scale-95 transition-all cursor-pointer border border-sky-400/60"
                    title={`Pasang menyambung mata ${rightEnd} di kanan meja`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Pasang Kanan ({rightEnd})</span>
                  </button>
                )}
              </>
            )}

            {/* 2. Opsi Chain Jimat (Kipas Sate / Wildcard) */}
            {onToggleWildcard && hasKipasSate && (
              <button
                onClick={() => {
                  sounds.playKipasSate();
                  onToggleWildcard();
                }}
                disabled={wildcardUsedThisRound && !wildcardActive}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all active:scale-95 cursor-pointer border ${
                  wildcardActive
                    ? 'bg-amber-500 text-slate-950 border-amber-300 ring-2 ring-amber-400 shadow-md font-black'
                    : wildcardUsedThisRound
                    ? 'bg-stone-800 text-stone-500 border-stone-700 cursor-not-allowed'
                    : 'bg-purple-900/80 hover:bg-purple-800 text-purple-200 border-purple-500/50 hover:text-white shadow-sm'
                }`}
                title="Gunakan efek Jimat Kipas Sate: Sambung kartu ini bebas ke ujung mana pun!"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{wildcardActive ? 'Wildcard Aktif' : 'Jimat Kipas'}</span>
              </button>
            )}

            {/* 3. Opsi Chain Buang Kartu Ini */}
            <button
              onClick={() => {
                sounds.playTileClack();
                onDiscardTile(selectedTile);
              }}
              disabled={discardsLeft <= 0}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all border ${
                discardsLeft > 0
                  ? 'bg-rose-700 hover:bg-rose-600 text-white border-rose-500 shadow-md active:scale-95 cursor-pointer'
                  : 'bg-stone-800/80 text-stone-500 border-stone-700/60 cursor-not-allowed'
              }`}
              title={
                discardsLeft <= 0
                  ? 'Kuota buang kartu babak ini telah habis!'
                  : `Buang kartu [${selectedTile.head}-${selectedTile.tail}] dan tarik kartu baru (${discardsLeft}/3)`
              }
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Buang ({discardsLeft}/3)</span>
            </button>
          </div>
        </div>
      )}

      {/* Barisan 7 Batu Domino di Tangan Pemain (Responsif & Selalu Tampak Penuh di Layar HP) */}
      <div className="w-full flex items-center justify-center overflow-x-auto pt-1 pb-0.5 sm:py-1 px-1 sm:px-2 no-scrollbar min-h-[76px] sm:min-h-[96px]">
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
