import React, { useState, useEffect, useRef } from 'react';
import { DailyMission } from '../types';
import { getTimeUntilReset } from '../services/dailyMissionService';
import { sounds } from '../utils/soundEffects';
import { Target, CheckCircle2, Coins, Clock, X, Sparkles, Gift } from 'lucide-react';
import { animateModalOpen } from '../AnimationController.js';

interface DailyMissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  missions: DailyMission[];
  onClaimMission: (missionId: string, rewardCoins: number) => void;
  onClaimAll: () => void;
}

export const DailyMissionsModal: React.FC<DailyMissionsModalProps> = ({
  isOpen,
  onClose,
  missions,
  onClaimMission,
  onClaimAll,
}) => {
  const [resetTimer, setResetTimer] = useState<string>(getTimeUntilReset());
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    if (modalRef.current) {
      animateModalOpen(modalRef.current);
    }
    setResetTimer(getTimeUntilReset());
    const interval = setInterval(() => {
      setResetTimer(getTimeUntilReset());
    }, 60000);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const claimableCount = missions.filter((m) => m.isCompleted && !m.isClaimed).length;
  const completedCount = missions.filter((m) => m.isCompleted).length;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 md:p-5 z-50 select-none">
      <div
        ref={modalRef}
        className="bg-slate-900 border-2 border-amber-500/70 rounded-3xl max-w-lg w-full shadow-2xl flex flex-col gap-4 p-5 md:p-6 text-stone-100 max-h-[90vh] overflow-y-auto"
      >
        {/* Header Modal */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-slate-950 shadow-md">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base md:text-lg font-black text-amber-300 tracking-wide">
                  MISI HARIAN POS RONDA
                </h2>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-bold border border-amber-500/40">
                  {completedCount}/3 Selesai
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-stone-400 mt-0.5">
                <Clock className="w-3.5 h-3.5 text-stone-500" />
                <span>Reset dalam: <strong className="text-stone-300 font-mono">{resetTimer}</strong></span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Daftar 3 Misi Harian */}
        <div className="flex flex-col gap-3">
          {missions.map((mission) => {
            const progressPercent = Math.min(100, Math.round((mission.current / mission.target) * 100));

            return (
              <div
                key={mission.id}
                className={`p-3.5 rounded-2xl border transition-all flex flex-col gap-2.5 ${
                  mission.isClaimed
                    ? 'bg-stone-950/40 border-stone-800/60 opacity-65'
                    : mission.isCompleted
                    ? 'bg-amber-950/30 border-amber-500/70 shadow-lg shadow-amber-500/10 ring-1 ring-amber-400/30'
                    : 'bg-stone-950/80 border-stone-800'
                }`}
              >
                {/* Baris Atas: Ikon, Judul, Reward */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl p-1 bg-stone-900 rounded-xl border border-stone-800">
                      {mission.icon}
                    </span>
                    <div>
                      <h4 className="text-xs md:text-sm font-bold text-amber-200 leading-tight">
                        {mission.title}
                      </h4>
                      <p className="text-[11px] text-stone-300 mt-0.5 leading-snug">
                        {mission.description}
                      </p>
                    </div>
                  </div>

                  {/* Badge Hadiah Koin */}
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-300 shrink-0 font-mono text-xs font-bold">
                    <Coins className="w-3.5 h-3.5 text-amber-400" />
                    <span>+{mission.rewardCoins}</span>
                  </div>
                </div>

                {/* Progress Bar & Status */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-[10px] text-stone-400 font-mono">
                    <span>Kemajuan:</span>
                    <span className={mission.isCompleted ? 'text-emerald-400 font-bold' : 'text-stone-300'}>
                      {mission.current} / {mission.target}
                    </span>
                  </div>

                  <div className="w-full bg-stone-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-1.5 rounded-full transition-all duration-500 ${
                        mission.isCompleted
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                          : 'bg-gradient-to-r from-amber-500 to-yellow-400'
                      }`}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Tombol Klaim atau Status */}
                <div className="flex justify-end pt-1 border-t border-stone-900">
                  {mission.isClaimed ? (
                    <span className="text-[11px] text-stone-500 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-stone-600" />
                      <span>Sudah Diklaim</span>
                    </span>
                  ) : mission.isCompleted ? (
                    <button
                      onClick={() => onClaimMission(mission.id, mission.rewardCoins)}
                      className="px-4 py-1.5 rounded-xl font-extrabold text-xs uppercase bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer animate-pulse"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Klaim +{mission.rewardCoins} Koin</span>
                    </button>
                  ) : (
                    <span className="text-[10px] text-stone-500 italic">
                      Sedang berjalan ({progressPercent}%)
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer: Klaim Semua & Tutup */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-stone-800">
          {claimableCount > 1 ? (
            <button
              onClick={onClaimAll}
              className="px-4 py-2.5 rounded-xl font-black text-xs uppercase bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 shadow-md active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Gift className="w-4 h-4" />
              <span>Klaim Semua Hadiah!</span>
            </button>
          ) : (
            <span className="text-[11px] text-stone-400">
              Misi baru muncul setiap hari pukul 00:00 WIB.
            </span>
          )}

          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs uppercase transition-all cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
