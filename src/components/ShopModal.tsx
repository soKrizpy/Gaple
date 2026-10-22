import React, { useState, useEffect, useRef } from 'react';
import { Relic, ConsumableItem, Domino } from '../types';
import { showRewardedAd } from '../services/RewardedAdController';
import { sounds } from '../utils/soundEffects';
import { DominoTile } from './DominoTile';
import { Store, Coins, Video, Sparkles, RefreshCw, ArrowRight, Utensils, Check } from 'lucide-react';
import { animateModalOpen } from '../AnimationController.js';

interface ShopModalProps {
  isOpen: boolean;
  coins: number;
  activeRelics: Relic[];
  hand: Domino[];
  shopRelics: Relic[];
  onBuyRelic: (relic: Relic) => void;
  onApplyGorengan: (tileId: string) => void;
  onBuyConsumable: (item: ConsumableItem) => void;
  onRerollShopWithCoins: () => void;
  onRerollShopWithAd: () => void;
  onCloseShop: () => void;
  nextRoundNumber: number;
}

export const SHOP_CONSUMABLES: ConsumableItem[] = [
  {
    id: 'item_gorengan',
    name: 'Gorengan Hangat',
    desc: 'Ubah satu batu di tangan menjadi balak dengan nilai mengikuti angka tertinggi pada batu itu.',
    icon: '🥟',
    price: 3,
    effectType: 'make_balak',
  },
  {
    id: 'item_esteh',
    name: 'Es Teh Manis Jumbo',
    desc: 'Menambah +2 kuota buang batu (discards) untuk babak berikutnya.',
    icon: '🥤',
    price: 2,
    effectType: 'add_discards',
  },
  {
    id: 'item_baterai',
    name: 'Baterai Cadangan',
    desc: 'Memberikan modal skor awal +150 poin di babak berikutnya.',
    icon: '🔋',
    price: 4,
    effectType: 'instant_score',
  },
];

export const ShopModal: React.FC<ShopModalProps> = ({
  isOpen,
  coins,
  activeRelics,
  hand,
  shopRelics,
  onBuyRelic,
  onApplyGorengan,
  onBuyConsumable,
  onRerollShopWithCoins,
  onRerollShopWithAd,
  onCloseShop,
  nextRoundNumber,
}) => {
  const [selectedTileForGorengan, setSelectedTileForGorengan] = useState<string | null>(null);
  const [isGorenganMode, setIsGorenganMode] = useState<boolean>(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && modalRef.current) {
      animateModalOpen(modalRef.current);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBuyGorenganInitiate = () => {
    if (coins < 3) return;
    setIsGorenganMode(true);
  };

  const handleConfirmGorengan = () => {
    if (!selectedTileForGorengan) return;
    onApplyGorengan(selectedTileForGorengan);
    setIsGorenganMode(false);
    setSelectedTileForGorengan(null);
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 md:p-5 z-50 select-none">
      <div
        ref={modalRef}
        className="bg-slate-900 border-2 border-amber-500/70 rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col gap-4 p-5 md:p-6 text-stone-100"
      >
        {/* Header Toko Ronda */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-600 to-yellow-400 flex items-center justify-center text-slate-950 shadow-md">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base md:text-lg font-black text-amber-300 tracking-wide">
                WARKOP POS RONDA (TOKO RONDA)
              </h2>
              <p className="text-[11px] text-stone-400">
                Belanja jimat baru, santap gorengan, dan perkuat tanganmu sebelum Babak {nextRoundNumber}!
              </p>
            </div>
          </div>

          {/* Dompet Koin Pemain */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-amber-500/10 border border-amber-500/40 text-amber-300">
            <Coins className="w-4 h-4 text-amber-400 animate-pulse" />
            <span className="font-mono font-extrabold text-sm md:text-base">{coins}</span>
            <span className="text-[10px] uppercase font-bold text-stone-400">Koin</span>
          </div>
        </div>

        {/* Mode Pemilihan Batu untuk Gorengan */}
        {isGorenganMode ? (
          <div className="bg-amber-950/40 border border-amber-500/60 rounded-2xl p-4 flex flex-col gap-3 animate-fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Utensils className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-amber-300 text-sm">Gorengan Hangat (3 Koin)</h3>
              </div>
              <button
                onClick={() => setIsGorenganMode(false)}
                className="text-xs text-stone-400 hover:text-stone-200 cursor-pointer"
              >
                Batal
              </button>
            </div>
            <p className="text-xs text-stone-300">
              Pilih satu batu di tangan Anda yang ingin digoreng menjadi <strong>batu Balak kembar</strong>:
            </p>

            <div className="flex items-center gap-2 overflow-x-auto py-2 no-scrollbar justify-center">
              {hand.map((tile) => (
                <div
                  key={tile.id}
                  onClick={() => setSelectedTileForGorengan(tile.id)}
                  className={`cursor-pointer transition-transform ${
                    selectedTileForGorengan === tile.id ? 'scale-110 ring-4 ring-amber-400 rounded-lg' : 'hover:scale-105'
                  }`}
                >
                  <DominoTile domino={tile} size="sm" isBoardTile={true} />
                </div>
              ))}
            </div>

            <button
              onClick={handleConfirmGorengan}
              disabled={!selectedTileForGorengan}
              className={`py-2 rounded-xl font-bold text-xs uppercase flex items-center justify-center gap-1.5 transition-all ${
                selectedTileForGorengan
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer shadow-md'
                  : 'bg-stone-800 text-stone-500 cursor-not-allowed'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>Goreng Jadi Batu Balak!</span>
            </button>
          </div>
        ) : null}

        {/* Bagian 1: 2 Jimat Acak yang Dijual */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-extrabold text-amber-400 uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Jimat Warkop Tersedia ({activeRelics.length}/5 Terpasang):</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {shopRelics.map((relic) => {
              const price = relic.price || 5;
              const canAfford = coins >= price;
              const alreadyOwned = activeRelics.some((r) => r.id === relic.id);

              return (
                <div
                  key={relic.id}
                  className="p-3.5 rounded-2xl bg-stone-950/80 border border-stone-800 flex flex-col justify-between gap-3 shadow-sm hover:border-amber-500/40 transition-all"
                >
                  <div className="flex items-start gap-2.5">
                    <span className="text-3xl shrink-0 p-1 bg-stone-900 rounded-xl border border-stone-800">
                      {relic.icon}
                    </span>
                    <div>
                      <h4 className="font-bold text-amber-200 text-xs md:text-sm">{relic.name}</h4>
                      <p className="text-[11px] text-stone-300 mt-0.5 leading-snug">{relic.desc}</p>
                      <span className="inline-block mt-1 text-[10px] text-emerald-400 font-mono bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/30">
                        {relic.conditionDescription}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-stone-900">
                    <span className="flex items-center gap-1 text-xs font-bold text-amber-300 font-mono">
                      <Coins className="w-3.5 h-3.5 text-amber-400" /> {price} Koin
                    </span>

                    <button
                      onClick={() => onBuyRelic(relic)}
                      disabled={!canAfford || alreadyOwned}
                      className={`px-3 py-1.5 rounded-xl font-bold text-xs uppercase transition-all flex items-center gap-1 cursor-pointer ${
                        alreadyOwned
                          ? 'bg-stone-800 text-stone-500 cursor-not-allowed'
                          : canAfford
                          ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 hover:from-amber-400 hover:to-yellow-300 active:scale-95 shadow'
                          : 'bg-stone-800 text-stone-500 border border-stone-700 cursor-not-allowed'
                      }`}
                    >
                      {alreadyOwned ? 'Dimiliki' : canAfford ? 'Beli Jimat' : 'Koin Kurang'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bagian 2: Barang Konsumsi (Gorengan, Es Teh, Baterai) */}
        <div className="flex flex-col gap-2 pt-1 border-t border-stone-800/80">
          <div className="flex items-center gap-1.5 text-xs font-extrabold text-amber-400 uppercase tracking-wider">
            <Utensils className="w-4 h-4" />
            <span>Santapan Pos Ronda (Barang Konsumsi):</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {SHOP_CONSUMABLES.map((item) => {
              const canAfford = coins >= item.price;
              const isGorengan = item.id === 'item_gorengan';

              return (
                <div
                  key={item.id}
                  className="p-3 rounded-2xl bg-stone-950/80 border border-stone-800 flex flex-col justify-between gap-2.5 shadow-sm"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{item.icon}</span>
                    <div>
                      <h4 className="font-bold text-amber-200 text-xs">{item.name}</h4>
                      <span className="text-[10px] text-amber-400 font-mono font-bold flex items-center gap-0.5">
                        <Coins className="w-3 h-3" /> {item.price} Koin
                      </span>
                    </div>
                  </div>
                  <p className="text-[10px] text-stone-300 leading-tight">{item.desc}</p>

                  <button
                    onClick={() => {
                      if (isGorengan) {
                        handleBuyGorenganInitiate();
                      } else {
                        onBuyConsumable(item);
                      }
                    }}
                    disabled={!canAfford}
                    className={`w-full py-1.5 rounded-xl font-bold text-xs uppercase transition-all flex items-center justify-center gap-1 cursor-pointer ${
                      canAfford
                        ? 'bg-amber-600 hover:bg-amber-500 text-white shadow active:scale-95'
                        : 'bg-stone-800 text-stone-500 cursor-not-allowed border border-stone-700'
                    }`}
                  >
                    <span>{isGorengan ? 'Pilih Batu' : 'Beli'}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bagian 3: Tombol Reroll Toko & Iklan Berhadiah Gratis */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 border-t border-stone-800">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Reroll dengan Koin */}
            <button
              onClick={onRerollShopWithCoins}
              disabled={coins < 2}
              className={`flex-1 sm:flex-none px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                coins >= 2
                  ? 'bg-stone-800 hover:bg-stone-700 text-amber-300 border border-stone-700 active:scale-95'
                  : 'bg-stone-900 text-stone-600 border border-stone-800 cursor-not-allowed'
              }`}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Acak Toko (2 Koin)</span>
            </button>

            {/* Refresh Toko Gratis (Tonton Video Iklan) */}
            {canWatchAd && <button
              onClick={() => {
                showRewardedAd('reroll_shop', () => {
                  onRerollShopWithAd();
                });
              }}
              className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl text-xs font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-blue-400"
            >
              <Video className="w-3.5 h-3.5 text-blue-200 animate-pulse" />
              <span>Refresh Toko Gratis (Tonton Video)</span>
            </button>}
          </div>

          {/* Tombol Lanjut ke Babak Pos Ronda Berikutnya */}
          <button
            onClick={onCloseShop}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-black text-xs md:text-sm uppercase tracking-wider bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 hover:from-emerald-400 hover:to-teal-300 text-slate-950 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Mulai Babak {nextRoundNumber}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
