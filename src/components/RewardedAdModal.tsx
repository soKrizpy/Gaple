import React, { useEffect, useState } from 'react';
import { adMobService, ActiveAdSession } from '../services/RewardedAdController';
import { PlayCircle, CheckCircle, Gift, Sparkles, Volume2, ShieldCheck, X } from 'lucide-react';
import { sounds } from '../utils/soundEffects';

export const RewardedAdModal: React.FC = () => {
  const [session, setSession] = useState<ActiveAdSession | null>(null);
  const [secondsLeft, setSecondsLeft] = useState<number>(3);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  useEffect(() => {
    return adMobService.subscribe((activeSession) => {
      setSession(activeSession);
      if (activeSession) {
        setSecondsLeft(activeSession.durationSeconds || 3);
        setIsCompleted(false);
      }
    });
  }, []);

  useEffect(() => {
    if (!session || isCompleted) return;

    if (secondsLeft > 0) {
      const timer = setTimeout(() => {
        setSecondsLeft((prev) => prev - 1);
        sounds.playTileClack();
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setIsCompleted(true);
      sounds.playVictory();
    }
  }, [secondsLeft, session, isCompleted]);

  if (!session) return null;

  const totalDuration = session.durationSeconds || 3;
  const progressPercent = Math.min(100, Math.round(((totalDuration - secondsLeft) / totalDuration) * 100));

  const handleClaim = () => {
    session.onReward();
  };

  const handleClose = () => {
    if (isCompleted) {
      session.onReward();
    } else if (session.onDismiss) {
      session.onDismiss();
    } else {
      adMobService.closeAd();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-lg flex items-center justify-center p-4 z-50 animate-fade-in select-none">
      <div className="bg-slate-900 border-2 border-amber-500/80 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl flex flex-col text-stone-100 relative">
        {/* Ad Header: Tayangan Sponsor Ronda */}
        <div className="bg-stone-950 px-4 py-2 border-b border-stone-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-stone-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold text-stone-300">Tayangan Hadiah Sponsor Ronda</span>
          </div>

          <div className="flex items-center gap-2">
            {!isCompleted ? (
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono font-bold text-[11px] border border-amber-500/40 animate-pulse">
                Hadiah dalam {secondsLeft} dtk
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[11px] border border-emerald-500/40">
                Hadiah Terbuka!
              </span>
            )}

            {isCompleted && (
              <button
                onClick={handleClose}
                className="p-1 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Progress Bar Durasi 3 Detik */}
        <div className="w-full bg-stone-800 h-1.5">
          <div
            className="bg-gradient-to-r from-amber-500 to-emerald-400 h-1.5 transition-all duration-1000 ease-linear"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Ad Video Visual Simulation Body */}
        <div className="p-6 flex flex-col items-center text-center relative overflow-hidden bg-gradient-to-b from-stone-900 to-slate-950">
          {/* Animated Background Glow */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Sponsor Logo Icon */}
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-400 flex items-center justify-center text-slate-950 shadow-xl mb-4 transform hover:scale-105 transition-transform">
            <Gift className="w-10 h-10 animate-bounce" />
          </div>

          {/* Sponsor Info */}
          <span className="text-[10px] tracking-widest uppercase font-extrabold text-amber-400/90 mb-0.5">
            Disponsori Oleh:
          </span>
          <h3 className="text-xl font-black text-amber-200 tracking-wide">
            {session.sponsorName}
          </h3>
          <p className="text-xs text-stone-300 italic mt-1 max-w-xs">
            "{session.sponsorTagline}"
          </p>

          {/* Hadiah yang didapat */}
          <div className="w-full mt-5 p-3.5 rounded-2xl bg-black/50 border border-amber-500/40 flex items-center justify-between">
            <div className="text-left">
              <span className="text-[10px] uppercase font-bold text-stone-400 block">Reward yang Didapat:</span>
              <span className="text-sm font-extrabold text-emerald-300">{session.rewardLabel}</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              {isCompleted ? <CheckCircle className="w-5 h-5" /> : <PlayCircle className="w-5 h-5 animate-pulse" />}
            </div>
          </div>
        </div>

        {/* Action Button Footer */}
        <div className="p-4 bg-stone-950 border-t border-stone-800">
          <button
            onClick={handleClaim}
            disabled={!isCompleted}
            className={`
              w-full py-3 rounded-2xl font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all
              ${isCompleted
                ? 'bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/30 hover:scale-[1.02] active:scale-98 cursor-pointer animate-pulse'
                : 'bg-stone-800 text-stone-500 border border-stone-700 cursor-not-allowed'
              }
            `}
          >
            {isCompleted ? (
              <>
                <Sparkles className="w-4 h-4 text-slate-950" />
                <span>Klaim Hadiah Sekarang</span>
              </>
            ) : (
              <span>Menonton Iklan ({secondsLeft} dtk)...</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
