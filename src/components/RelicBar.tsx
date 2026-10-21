import React from 'react';
import { Relic } from '../types';
import { Sparkles, Plus, Wand2 } from 'lucide-react';

interface RelicBarProps {
  relics: Relic[];
  onRelicClick?: (relic: Relic) => void;
  wildcardActive?: boolean;
  wildcardUsedThisRound?: boolean;
  onToggleWildcard?: () => void;
}

const MAX_RELIC_SLOTS = 5;

export const RelicBar: React.FC<RelicBarProps> = ({
  relics,
  onRelicClick,
  wildcardActive = false,
  wildcardUsedThisRound = false,
  onToggleWildcard,
}) => {
  const hasKipasSate = relics.some((r) => r.id === 'jimat_kipas');
  const emptySlotsCount = Math.max(0, MAX_RELIC_SLOTS - relics.length);

  return (
    <div className="flex items-center justify-between gap-2 overflow-x-auto py-1 px-2 no-scrollbar">
      {/* Label Slot Jimat Warkop */}
      <div className="flex items-center gap-1.5 shrink-0">
        <div className="flex items-center gap-1 text-[11px] text-amber-300 font-extrabold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span>Jimat Warkop</span>
          <span className="text-[10px] font-mono bg-stone-800 text-amber-400 px-1.5 py-0.2 rounded-full border border-stone-700">
            {relics.length}/{MAX_RELIC_SLOTS}
          </span>
        </div>
      </div>

      {/* 5 Slot Jimat (Terisi & Kosong) */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        {relics.map((relic) => {
          const isKipas = relic.id === 'jimat_kipas';

          const rarityStyle = {
            common: 'border-sky-500/60 bg-sky-950/40 text-sky-200',
            rare: 'border-purple-500/70 bg-purple-950/40 text-purple-200',
            legendary: 'border-amber-500/80 bg-amber-950/40 text-amber-200 ring-1 ring-amber-400/40',
          }[relic.rarity];

          return (
            <div
              key={relic.id}
              id={`relic-${relic.id}`}
              onClick={() => onRelicClick && onRelicClick(relic)}
              title={`${relic.name}: ${relic.desc}`}
              className={`
                relative group flex items-center gap-1.5 px-2 py-1 rounded-xl border
                cursor-pointer select-none transition-all active:scale-95 shrink-0 shadow-sm
                ${rarityStyle}
                ${isKipas && wildcardActive ? 'ring-2 ring-yellow-400 bg-yellow-950/60 shadow-yellow-500/40 animate-pulse' : ''}
              `}
            >
              <span className="text-base select-none">{relic.icon}</span>
              <div className="flex flex-col text-left">
                <span className="text-[11px] font-bold leading-none truncate max-w-[90px] sm:max-w-[110px]">
                  {relic.name}
                </span>
                <span className="text-[9px] text-stone-300 opacity-90 leading-tight font-mono">
                  +{relic.chipsBonus}T | +{relic.multBonus}P
                </span>
              </div>

              {/* Tooltip Hover Lengkap */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-52 p-2.5 rounded-xl bg-stone-900 border border-amber-500/60 text-stone-100 text-[11px] shadow-2xl z-50 pointer-events-none">
                <div className="flex items-center gap-1.5 font-bold text-amber-300">
                  <span>{relic.icon}</span>
                  <span>{relic.name}</span>
                </div>
                <div className="text-stone-300 mt-1 leading-snug">{relic.desc}</div>
                <div className="mt-1.5 text-[10px] text-emerald-400 font-mono bg-black/40 px-1.5 py-0.5 rounded border border-emerald-500/30">
                  {relic.conditionDescription}
                </div>
              </div>
            </div>
          );
        })}

        {/* Slot Kosong hingga maksimal 5 */}
        {Array.from({ length: emptySlotsCount }).map((_, idx) => (
          <div
            key={`empty-slot-${idx}`}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl border border-dashed border-stone-800 bg-stone-950/40 text-stone-600 shrink-0 text-[10px] select-none"
            title="Slot Jimat Kosong (Bisa didapat setelah menyelesaikan ronde)"
          >
            <Plus className="w-3 h-3 text-stone-700" />
            <span className="font-mono">Slot Kosong</span>
          </div>
        ))}
      </div>

      {/* Tombol Khusus Wildcard Kipas Sate */}
      {hasKipasSate && onToggleWildcard && (
        <div className="shrink-0 ml-1">
          <button
            onClick={onToggleWildcard}
            disabled={wildcardUsedThisRound}
            className={`
              flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer
              ${wildcardUsedThisRound
                ? 'bg-stone-800 text-stone-500 border border-stone-700 cursor-not-allowed'
                : wildcardActive
                ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-slate-950 ring-2 ring-yellow-400 animate-pulse font-black'
                : 'bg-stone-900 hover:bg-stone-800 text-amber-300 border border-amber-500/50'
              }
            `}
            title={
              wildcardUsedThisRound
                ? 'Efek Kipas Sate sudah dipakai di babak ini'
                : 'Aktifkan Kipas Sate: Sambung batu apa saja ke meja tanpa peduli angka!'
            }
          >
            <Wand2 className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[11px]">
              {wildcardUsedThisRound
                ? 'Wildcard Habis'
                : wildcardActive
                ? 'Wildcard AKTIF!'
                : 'Pakai Kipas Sate'}
            </span>
          </button>
        </div>
      )}
    </div>
  );
};
