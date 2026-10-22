/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Domino, PlacedTile } from '../types';
import { DominoTile } from './DominoTile';
import {
  MoveRight,
  MoveLeft,
  Sparkles,
  Play,
  Flame,
  ChevronLeft,
  ChevronRight,
  Crosshair,
  Hand,
} from 'lucide-react';
import { sounds } from '../utils/soundEffects';

interface GameBoardProps {
  tiles: PlacedTile[];
  leftEnd: number | null;
  rightEnd: number | null;
  selectedTile: Domino | null;
  canPlayLeft: boolean;
  canPlayRight: boolean;
  onPlaceTile: (targetEnd: 'left' | 'right') => void;
  isPortrait: boolean;
  isCompactHeight?: boolean;
  isGameOver: boolean;
  isDeadlock: boolean;
  isWildcardActive?: boolean;
  lastPlacedTileId?: string | null;
  chips?: number;
  mult?: number;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  tiles,
  leftEnd,
  rightEnd,
  selectedTile,
  canPlayLeft,
  canPlayRight,
  onPlaceTile,
  isPortrait,
  isCompactHeight = false,
  isWildcardActive = false,
  lastPlacedTileId,
  chips,
  mult,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // State untuk Fitur Geser Meja Interaktif (Drag-to-Pan)
  const [isDragging, setIsDragging] = useState(false);
  const dragStartXRef = useRef(0);
  const scrollStartLeftRef = useRef(0);
  const hasMovedSignificantlyRef = useRef(false);

  // Pusatkan tampilan ke batu terakhir yang dilempar/diletakkan di meja
  const centerOnLastTile = useCallback((smooth: boolean = true) => {
    const container = scrollContainerRef.current;
    if (!container || tiles.length === 0) return;

    let targetEl: HTMLElement | null = null;
    if (lastPlacedTileId) {
      targetEl = document.getElementById(`placed-tile-${lastPlacedTileId}`);
    }
    if (!targetEl && tiles.length > 0) {
      const fallbackTile = tiles[tiles.length - 1];
      targetEl = document.getElementById(`placed-tile-${fallbackTile.id}`);
    }

    if (targetEl && container) {
      const containerWidth = container.clientWidth;
      const tileOffsetLeft = targetEl.offsetLeft;
      const tileWidth = targetEl.offsetWidth;
      // Letakkan pusat batu tepat di titik tengah horizontal kontainer meja
      const targetScroll = tileOffsetLeft + tileWidth / 2 - containerWidth / 2;

      container.scrollTo({
        left: Math.max(0, targetScroll),
        behavior: smooth ? 'smooth' : 'auto',
      });
    } else {
      // Fallback ke posisi tengah seimbang
      container.scrollTo({
        left: (container.scrollWidth - container.clientWidth) / 2,
        behavior: smooth ? 'smooth' : 'auto',
      });
    }
  }, [tiles, lastPlacedTileId]);

  // Efek Otomatis: Saat batu baru dilempar ke meja, selalu pusatkan ke batu tersebut
  useEffect(() => {
    if (tiles.length === 0) return;

    const frameId = requestAnimationFrame(() => {
      centerOnLastTile(true);
    });
    const timer = setTimeout(() => {
      centerOnLastTile(true);
    }, 70);

    return () => {
      cancelAnimationFrame(frameId);
      clearTimeout(timer);
    };
  }, [tiles.length, lastPlacedTileId, centerOnLastTile]);

  // Tombol navigasi manual geser meja (Nudge)
  const handleNudge = (direction: 'left' | 'right') => {
    sounds.playTileClack();
    const container = scrollContainerRef.current;
    if (!container) return;
    const distance = 240;
    container.scrollBy({
      left: direction === 'left' ? -distance : distance,
      behavior: 'smooth',
    });
  };

  // Logika Drag Meja dengan Mouse (Mouse Drag to Pan)
  const handleMouseDown = (e: React.MouseEvent) => {
    const container = scrollContainerRef.current;
    if (!container) return;

    setIsDragging(true);
    hasMovedSignificantlyRef.current = false;
    dragStartXRef.current = e.pageX - container.offsetLeft;
    scrollStartLeftRef.current = container.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const container = scrollContainerRef.current;
    if (!container) return;

    e.preventDefault();
    const currentX = e.pageX - container.offsetLeft;
    const walk = (currentX - dragStartXRef.current) * 1.35; // Kecepatan geser meja natural

    if (Math.abs(walk) > 6) {
      hasMovedSignificantlyRef.current = true;
    }
    container.scrollLeft = scrollStartLeftRef.current - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    // Beri jeda sangat singkat agar klik pada tombol tidak terpicu setelah geser meja
    setTimeout(() => {
      hasMovedSignificantlyRef.current = false;
    }, 60);
  };

  // Logika Drag Meja dengan Sentuhan Jari (Touch Drag to Pan)
  const touchStartXRef = useRef(0);
  const touchScrollStartRef = useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    const container = scrollContainerRef.current;
    if (!container || e.touches.length !== 1) return;

    hasMovedSignificantlyRef.current = false;
    touchStartXRef.current = e.touches[0].pageX;
    touchScrollStartRef.current = container.scrollLeft;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const container = scrollContainerRef.current;
    if (!container || e.touches.length !== 1) return;

    const currentX = e.touches[0].pageX;
    const diff = currentX - touchStartXRef.current;
    if (Math.abs(diff) > 8) {
      hasMovedSignificantlyRef.current = true;
    }
  };

  const handleSocketClick = (targetEnd: 'left' | 'right') => {
    // Cegah pemasangan batu jika baru saja melakukan aksi geser meja
    if (hasMovedSignificantlyRef.current) return;
    sounds.playTileClack();
    onPlaceTile(targetEnd);
  };

  return (
    <div
      id="game-table"
      className={`GameBoard relative flex-1 w-full h-full min-h-0 overflow-hidden rounded-xl sm:rounded-2xl md:rounded-3xl border-2 sm:border-4 shadow-[inset_0_4px_35px_rgba(0,0,0,0.85)] flex flex-col items-center justify-center select-none transition-all duration-500 ease-in-out ${
        isWildcardActive ? 'border-amber-400 ring-4 ring-amber-400/40' : 'border-stone-800'
      }`}
      style={{
        background: 'radial-gradient(circle at 50% 50%, #1e4620 0%, #0f2811 60%, #051608 100%)',
      }}
    >
      {/* Tekstur Felt Meja Hijau & Garis Halus */}
      <div
        className="absolute inset-0 opacity-15 pointer-events-none mix-blend-overlay"
        style={{
          backgroundImage: `radial-gradient(#ffffff 1px, transparent 1px)`,
          backgroundSize: '16px 16px',
        }}
      />

      {/* Watermark Logo Meja Balakutak Master */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.06]">
        <div className="text-center font-serif flex flex-col items-center">
          <div className="text-2xl sm:text-5xl md:text-7xl tracking-widest font-black text-amber-100 uppercase">
            BALAKUTAK MASTER
          </div>
          <div className="text-[10px] sm:text-xs md:text-sm tracking-widest text-amber-200 mt-1 sm:mt-2 font-mono">
            POS RONDA WARKOP
          </div>
        </div>
      </div>

      {/* Indikator Titik dan Pengali di Atas Meja (Mudah Dilihat Pemain) */}
      {chips !== undefined && mult !== undefined && (
        <div className="absolute top-2 sm:top-2.5 left-1/2 -translate-x-1/2 z-30 pointer-events-none flex items-center gap-1.5 sm:gap-2.5 bg-stone-950/90 backdrop-blur-md px-3 sm:px-4 py-1 sm:py-1.5 rounded-2xl border border-stone-700/80 shadow-[0_4px_25px_rgba(0,0,0,0.85)]">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] sm:text-xs font-black tracking-wider text-sky-400">TITIK</span>
            <span className="font-mono font-black text-sky-300 text-xs sm:text-sm px-2 py-0.5 rounded-lg bg-sky-950/90 border border-sky-500/40">
              {chips}
            </span>
          </div>
          <span className="text-amber-400 font-black text-xs sm:text-sm">×</span>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] sm:text-xs font-black tracking-wider text-rose-500">PENGALI</span>
            <span className="font-mono font-black text-rose-400 text-xs sm:text-sm px-2 py-0.5 rounded-lg bg-rose-950/90 border border-rose-500/40">
              {mult}
            </span>
          </div>
        </div>
      )}

      {/* Notifikasi Wildcard Kipas Sate Aktif */}
      {isWildcardActive && (
        <div className="absolute top-10 sm:top-12 inset-x-0 flex justify-center pointer-events-none z-30">
          <div className="bg-amber-500/95 text-slate-950 font-black text-xs px-3.5 py-1 rounded-full shadow-lg border border-yellow-300 flex items-center gap-1.5 animate-pulse">
            <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
            <span>WILDCARD KIPAS SATE AKTIF: Sambung Bebas ke Ujung Mana Pun!</span>
          </div>
        </div>
      )}

      {/* Petunjuk Interaktif Fitur Geser Meja */}
      {tiles.length > 1 && (
        <div className="absolute top-3 left-3 z-30 pointer-events-none hidden sm:flex items-center gap-1.5 bg-stone-950/75 backdrop-blur-md text-amber-200/90 text-[11px] px-3 py-1.5 rounded-full border border-stone-800 shadow-md">
          <Hand className="w-3.5 h-3.5 text-amber-400" />
          <span>Geser meja untuk melihat susunan kartu</span>
        </div>
      )}

      {/* Toolbar Kontrol Geser Meja & Tombol Pusatkan */}
      {tiles.length > 0 && (
        <div className="absolute bottom-2 sm:bottom-3 right-2 sm:right-3 flex items-center gap-1 sm:gap-1.5 z-30 bg-stone-950/85 backdrop-blur-md px-1.5 sm:px-2 py-1 sm:py-1.5 rounded-xl sm:rounded-2xl border border-stone-800/90 shadow-2xl">
          {/* Tombol Geser Kiri */}
          <button
            onClick={() => handleNudge('left')}
            className="p-1 sm:p-1.5 rounded-lg sm:rounded-xl bg-stone-900/90 hover:bg-stone-800 text-stone-300 hover:text-amber-300 active:scale-95 transition-all cursor-pointer border border-stone-700/60 shadow-sm"
            title="Geser Meja ke Kiri"
            aria-label="Geser Meja ke Kiri"
          >
            <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>

          {/* Tombol Pusatkan ke Batu Terakhir */}
          <button
            onClick={() => {
              sounds.playTileClack();
              centerOnLastTile(true);
            }}
            className="px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg sm:rounded-xl bg-gradient-to-r from-amber-600/30 to-amber-500/20 hover:from-amber-600/40 hover:to-amber-500/30 active:scale-95 text-amber-200 font-bold text-xs flex items-center gap-1 sm:gap-1.5 transition-all cursor-pointer border border-amber-500/50 shadow-sm"
            title="Pusatkan Layar ke Kartu Terakhir yang Dilempar"
          >
            <Crosshair className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400" />
            <span className="text-[10px] sm:text-[11px] font-semibold">Tengah</span>
          </button>

          {/* Tombol Geser Kanan */}
          <button
            onClick={() => handleNudge('right')}
            className="p-1 sm:p-1.5 rounded-lg sm:rounded-xl bg-stone-900/90 hover:bg-stone-800 text-stone-300 hover:text-amber-300 active:scale-95 transition-all cursor-pointer border border-stone-700/60 shadow-sm"
            title="Geser Meja ke Kanan"
            aria-label="Geser Meja ke Kanan"
          >
            <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
      )}

      {/* Floating score text popup container untuk animasi resolusi skor */}
      <div className="absolute top-2 sm:top-6 left-1/2 -translate-x-1/2 flex items-center gap-2 sm:gap-3 pointer-events-none z-50">
        <div
          id="score-chips-popup"
          className="opacity-0 font-mono font-black text-lg sm:text-xl md:text-2xl text-sky-400 drop-shadow-[0_4px_12px_rgba(14,165,233,0.9)] bg-slate-950/90 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-xl border border-sky-400"
        >
          +0 Titik
        </div>
        <div
          id="score-mult-popup"
          className="opacity-0 font-mono font-black text-xl sm:text-2xl md:text-3xl text-rose-500 drop-shadow-[0_4px_16px_rgba(244,63,94,0.95)] bg-slate-950/90 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-xl border border-rose-500"
        >
          X0 Pengali
        </div>
      </div>

      {/* Papan Meja Kosong: Prompt Awal Letakkan Batu Pertama */}
      {tiles.length === 0 && (
        <div className="relative z-20 flex flex-col items-center justify-center text-center p-2 sm:p-6 max-w-sm">
          <div
            id="target-socket-center"
            onClick={() => {
              if (selectedTile) {
                sounds.playTileClack();
                onPlaceTile('left');
              }
            }}
            className={`w-16 h-22 sm:w-28 sm:h-38 md:w-32 md:h-44 rounded-xl sm:rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-1 sm:p-4 transition-all duration-300 ${
              selectedTile
                ? 'border-amber-400 bg-amber-500/20 text-amber-200 shadow-[0_0_30px_rgba(245,158,11,0.5)] cursor-pointer scale-105 animate-pulse'
                : 'border-stone-600/70 bg-stone-900/40 text-stone-400'
            }`}
          >
            <div className="w-6 h-6 sm:w-10 sm:h-10 rounded-full bg-amber-500/20 flex items-center justify-center mb-1 sm:mb-2">
              <Play className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-amber-400 ml-0.5" />
            </div>
            <span className="text-[10px] sm:text-xs font-bold leading-tight">
              {selectedTile ? 'Klik Mulai Meja' : 'Pilih Batu'}
            </span>
            <span className="text-[8px] sm:text-[10px] text-stone-400 mt-0.5 sm:mt-1 font-mono">
              {selectedTile ? `[${selectedTile.head}-${selectedTile.tail}]` : 'Batu Pertama'}
            </span>
          </div>
        </div>
      )}

      {/* Papan Meja Berisi Batu: Rantai Domino Saling Terhubung (Bisa Digeser & Centered) */}
      {tiles.length > 0 && (
        <div
          ref={scrollContainerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleMouseUp}
          className={`relative z-10 w-full h-full flex items-center overflow-x-auto px-3 sm:px-10 md:px-20 py-1 sm:py-3 md:py-6 no-scrollbar touch-pan-x transition-colors duration-150 ${
            isDragging ? 'cursor-grabbing' : 'cursor-grab'
          }`}
        >
          <div className="flex items-center gap-1 sm:gap-1.5 mx-auto my-auto shrink-0 py-1 sm:py-3">
            {/* Target Socket Ujung Kiri */}
            {canPlayLeft && selectedTile && (
              <button
                id="target-socket-left"
                onClick={() => handleSocketClick('left')}
                className="w-10 h-16 sm:w-14 sm:h-24 md:w-16 md:h-28 rounded-lg sm:rounded-xl border-2 border-dashed border-emerald-400 bg-emerald-500/20 hover:bg-emerald-500/35 flex flex-col items-center justify-center text-emerald-300 transition-all cursor-pointer shadow-[0_0_20px_rgba(16,185,129,0.5)] animate-pulse shrink-0 active:scale-95 mr-1"
                title={`Pasang di Ujung Kiri (Menyambung Mata ${leftEnd})`}
              >
                <MoveLeft className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-emerald-300" />
                <span className="text-[8px] sm:text-[10px] font-black font-mono mt-0.5 sm:mt-1">Kiri</span>
                <span className="text-[7px] sm:text-[9px] font-extrabold text-emerald-200 bg-emerald-950/70 px-1 rounded border border-emerald-500/40 mt-0.5">
                  Mata {leftEnd}
                </span>
              </button>
            )}

            {/* Deretan Rantai Batu Domino yang Saling Terhubung di Meja */}
            {tiles.map((placed, idx) => {
              // Cek apakah batu ini tersambung ke batu sebelumnya
              const prevTile = idx > 0 ? tiles[idx - 1] : null;
              const isConnecting = prevTile !== null;
              const isThisTileLastPlaced = placed.id === lastPlacedTileId;

              return (
                <React.Fragment key={placed.id || `placed-${idx}`}>
                  {/* Indikator Sambungan Rapi Antar Dua Batu yang Bertemu */}
                  {isConnecting && (
                    <div
                      className="shrink-0 flex items-center justify-center -mx-0.5 z-20 pointer-events-none"
                      title={`Titik Sambung: Mata ${placed.head}`}
                    >
                      {isThisTileLastPlaced ? (
                        /* Efek Percikan Api Menyala pada Titik Sambungan yang Baru Saja Bertemu */
                        <div className="relative flex items-center justify-center">
                          <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-gradient-to-tr from-rose-600 via-amber-400 to-yellow-200 border border-amber-100 shadow-[0_0_14px_rgba(245,158,11,1)] flex items-center justify-center animate-bounce">
                            <Flame className="w-2.5 h-2.5 text-amber-950 fill-amber-300" />
                          </div>
                          <div className="absolute inset-0 rounded-full bg-amber-400 animate-ping opacity-60" />
                        </div>
                      ) : (
                        <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-300 border border-amber-950 shadow-sm flex items-center justify-center" />
                      )}
                    </div>
                  )}

                  {/* Kontainer Batu Domino di Meja (dengan Transisi Transparan Halus saat Mendarat) */}
                  <div
                    id={`placed-tile-${placed.id}`}
                    className={`transition-all duration-300 shrink-0 shadow-xl rounded-xl relative ${
                      isThisTileLastPlaced
                        ? 'ring-2 ring-amber-400 shadow-[0_0_24px_rgba(245,158,11,0.7)] z-10 scale-105 tile-land-transition'
                        : ''
                    }`}
                  >
                    <DominoTile
                      domino={placed.domino}
                      head={placed.head}
                      tail={placed.tail}
                      orientation={placed.isDouble ? 'vertical' : 'horizontal'}
                      size={isPortrait || isCompactHeight ? 'sm' : 'md'}
                      isBoardTile={true}
                    />

                    {/* Penanda Batu Terakhir yang Baru Dilempar: Cukup Ikon Api Naik Turun */}
                    {isThisTileLastPlaced && (
                      <div className="absolute -top-3.5 inset-x-0 flex justify-center pointer-events-none z-30 animate-bounce">
                        <div className="bg-gradient-to-t from-amber-600 via-amber-500 to-yellow-300 p-1 rounded-full border border-yellow-200 shadow-[0_0_14px_rgba(245,158,11,0.9)] flex items-center justify-center">
                          <Flame className="w-3.5 h-3.5 text-slate-950 fill-amber-100" />
                        </div>
                      </div>
                    )}
                  </div>
                </React.Fragment>
              );
            })}

            {/* Target Socket Ujung Kanan */}
            {canPlayRight && selectedTile && (
              <button
                id="target-socket-right"
                onClick={() => handleSocketClick('right')}
                className="w-10 h-16 sm:w-14 sm:h-24 md:w-16 md:h-28 rounded-lg sm:rounded-xl border-2 border-dashed border-sky-400 bg-sky-500/20 hover:bg-sky-500/35 flex flex-col items-center justify-center text-sky-300 transition-all cursor-pointer shadow-[0_0_20px_rgba(14,165,233,0.5)] animate-pulse shrink-0 active:scale-95 ml-1"
                title={`Pasang di Ujung Kanan (Menyambung Mata ${rightEnd})`}
              >
                <MoveRight className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-sky-300" />
                <span className="text-[8px] sm:text-[10px] font-black font-mono mt-0.5 sm:mt-1">Kanan</span>
                <span className="text-[7px] sm:text-[9px] font-extrabold text-sky-200 bg-sky-950/70 px-1 rounded border border-sky-500/40 mt-0.5">
                  Mata {rightEnd}
                </span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
