import React from 'react';
import { Domino } from '../types';

interface DominoTileProps {
  domino: Domino;
  head?: number;
  tail?: number;
  orientation?: 'vertical' | 'horizontal';
  size?: 'sm' | 'md' | 'lg';
  isPlayable?: boolean;
  isSelected?: boolean;
  isBoardTile?: boolean;
  angle?: number;
  onClick?: () => void;
  onDragStart?: (e: React.DragEvent) => void;
  onTouchStart?: (e: React.TouchEvent) => void;
  className?: string;
  id?: string;
}

export const DominoTile: React.FC<DominoTileProps> = ({
  domino,
  head,
  tail,
  orientation = 'vertical',
  size = 'md',
  isPlayable = false,
  isSelected = false,
  isBoardTile = false,
  angle = 0,
  onClick,
  onDragStart,
  onTouchStart,
  className = '',
  id,
}) => {
  const actualHead = head !== undefined ? head : domino.head;
  const actualTail = tail !== undefined ? tail : domino.tail;
  const isDouble = domino.isDouble || actualHead === actualTail;

  // Size dimensions
  const dimensions = {
    sm: { width: 34, height: 68, pipSize: 5, gap: 2 },
    md: { width: 44, height: 88, pipSize: 7, gap: 3 },
    lg: { width: 56, height: 112, pipSize: 9, gap: 4 },
  }[size];

  // Render authentic domino pips (titik) pattern for values 0 to 6
  const renderPips = (val: number, isTopOrLeft: boolean) => {
    // 3x3 grid positions: [row, col] (0-2, 0-2)
    const positions: Record<number, Array<[number, number]>> = {
      0: [],
      1: [[1, 1]],
      2: [[0, 0], [2, 2]],
      3: [[0, 0], [1, 1], [2, 2]],
      4: [[0, 0], [0, 2], [2, 0], [2, 2]],
      5: [[0, 0], [0, 2], [1, 1], [2, 0], [2, 2]],
      6: [[0, 0], [0, 2], [1, 0], [1, 2], [2, 0], [2, 2]],
    };

    const pipsList = positions[val] || [];
    
    // Warna pip klasik: 1 & 4 sering memiliki aksen merah terang (vermilion) dalam tradisi gaple, sisanya hitam/biru tua
    const pipColor = (val === 1 || val === 4) ? 'bg-red-600 shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)]' : 'bg-slate-900 shadow-[inset_0_1px_2px_rgba(0,0,0,0.6)]';

    return (
      <div 
        className="relative w-full h-full grid grid-cols-3 grid-rows-3 p-1 place-items-center"
        aria-label={`Sisi domino titik ${val}`}
      >
        {pipsList.map(([row, col], idx) => {
          // Dynamic grid position
          const gridStyle: React.CSSProperties = {
            gridRowStart: row + 1,
            gridColumnStart: col + 1,
            width: dimensions.pipSize,
            height: dimensions.pipSize,
          };
          return (
            <div
              key={`${isTopOrLeft ? 't' : 'b'}-${idx}`}
              style={gridStyle}
              className={`rounded-full ${pipColor} transition-transform`}
            />
          );
        })}
      </div>
    );
  };

  const isHoriz = orientation === 'horizontal';
  const width = isHoriz ? dimensions.height : dimensions.width;
  const height = isHoriz ? dimensions.width : dimensions.height;

  return (
    <div
      id={id || `tile-${domino.id}`}
      data-tile-id={domino.id}
      draggable={!isBoardTile && isPlayable}
      onDragStart={onDragStart}
      onTouchStart={onTouchStart}
      onClick={onClick}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        transform: angle ? `rotate(${angle}deg)` : undefined,
      }}
      className={`
        relative select-none cursor-pointer rounded-lg
        bg-gradient-to-br from-amber-50 via-stone-100 to-amber-100/90
        border-2 border-stone-300 shadow-[0_4px_10px_rgba(0,0,0,0.45),inset_0_1px_1px_rgba(255,255,255,0.9)]
        transition-all duration-200
        ${isHoriz ? 'flex flex-row' : 'flex flex-col'}
        ${isSelected ? 'ring-4 ring-amber-400 scale-105 shadow-amber-400/30 z-20 -translate-y-2' : ''}
        ${isPlayable && !isSelected ? 'hover:scale-105 hover:-translate-y-1 ring-2 ring-emerald-400/80' : ''}
        ${!isPlayable && !isBoardTile ? 'opacity-80 brightness-95' : ''}
        ${className}
      `}
    >
      {/* Sisi Pertama (Head - Kiri jika horizontal, Atas jika vertikal) */}
      <div className="flex-1 flex items-center justify-center relative overflow-hidden">
        {renderPips(actualHead, true)}
      </div>

      {/* Garis Pembatas Tengah & Brass Spinner Pin */}
      <div 
        className={`
          relative flex items-center justify-center bg-stone-400/70
          ${isHoriz ? 'w-[2px] h-full my-auto' : 'h-[2px] w-full mx-auto'}
        `}
      >
        {/* Brass Pin (Pin Kuningan Klasik di Tengah Batu Domino) */}
        <div className="absolute w-2 h-2 rounded-full bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-200 shadow-sm border border-amber-700/60 z-10" />
      </div>

      {/* Sisi Kedua (Tail - Kanan jika horizontal, Bawah jika vertikal) */}
      <div className="flex-1 flex items-center justify-center relative overflow-hidden">
        {renderPips(actualTail, false)}
      </div>

      {/* Indikator Balak Kembar (Glow Badge halus di tangan) */}
      {isDouble && !isBoardTile && (
        <div className="absolute -top-1.5 -right-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-stone-900 text-[9px] font-extrabold px-1 rounded-full shadow-sm pointer-events-none">
          B
        </div>
      )}

      {/* Indikator Balak Kembar di Meja Permainan (Glow Border & Balak Tag) */}
      {isDouble && isBoardTile && (
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-950 font-black text-[8px] px-1 rounded-full shadow-xs border border-amber-300 pointer-events-none uppercase">
          Balak
        </div>
      )}
    </div>
  );
};
