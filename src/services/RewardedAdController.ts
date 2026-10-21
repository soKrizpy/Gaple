import { RewardAdType } from '../types';

/**
 * RewardedAdController.ts
 * Arsitektur Modular Iklan Berhadiah (Google AdMob Mockup & Bridge).
 * 
 * Untuk rilis Android Native / Capacitor / React Native:
 * Cukup gantikan implementasi di dalam fungsi `showRewardedAd` dengan SDK AdMob:
 * e.g.
 *   import { AdMob, RewardAdPluginEvents } from '@capacitor-community/admob';
 *   await AdMob.showRewardVideoAd({ adId: 'ca-app-pub-xxx/yyy' });
 */

export interface ActiveAdSession {
  rewardType: RewardAdType;
  title: string;
  description: string;
  rewardLabel: string;
  sponsorName: string;
  sponsorTagline: string;
  durationSeconds: number;
  onReward: () => void;
  onDismiss?: () => void;
}

type AdListener = (session: ActiveAdSession | null) => void;

class AdMobService {
  private listeners: AdListener[] = [];
  private currentSession: ActiveAdSession | null = null;

  public subscribe(listener: AdListener): () => void {
    this.listeners.push(listener);
    listener(this.currentSession);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l(this.currentSession));
  }

  /**
   * Menampilkan Iklan Berhadiah (Rewarded Ad).
   * Pada mock web: memunculkan popup simulasi 3 detik sebelum memberikan reward.
   * Pada Android: tinggal hubungkan ke AdMob.showRewardVideoAd().
   */
  public showRewardedAd(
    rewardType: RewardAdType,
    onReward: () => void,
    onDismiss?: () => void
  ) {
    // Definisi sponsor & label hadiah khas pos ronda
    const adPresets: Record<RewardAdType, { title: string; desc: string; reward: string; sponsor: string; tagline: string }> = {
      revive_round: {
        title: 'Revive Tambah 2 Giliran',
        desc: 'Tonton video pendek untuk mendapatkan 2 giliran pasang tambahan!',
        reward: '+2 Kuota Pasang Batu',
        sponsor: 'Kopi Kapal Pos Ronda',
        tagline: 'Kopinya para peronda sejati, melek sampai subuh!',
      },
      reroll_shop: {
        title: 'Refresh Toko Gratis',
        desc: 'Tonton video pendek untuk mengacak ulang barang dan jimat di toko!',
        reward: 'Acak Ulang Toko Gratis',
        sponsor: 'Korek Toko Tahan Angin',
        tagline: 'Sekali petik langsung nyala di segala cuaca.',
      },
      bonus_coins: {
        title: 'Koin Tambahan Pos Ronda',
        desc: 'Tonton video pendek untuk mendapatkan bonus 10 Koin!',
        reward: '+10 Uang Koin',
        sponsor: 'Kerupuk Kaleng Warkop',
        tagline: 'Gurih renyah teman setia main domino.',
      },
    };

    const preset = adPresets[rewardType] || adPresets.revive_round;

    this.currentSession = {
      rewardType,
      title: preset.title,
      description: preset.desc,
      rewardLabel: preset.reward,
      sponsorName: preset.sponsor,
      sponsorTagline: preset.tagline,
      durationSeconds: 3, // Sesuai spesifikasi: durasi 3 detik
      onReward: () => {
        onReward();
        this.closeAd();
      },
      onDismiss: () => {
        if (onDismiss) onDismiss();
        this.closeAd();
      },
    };

    this.notify();
  }

  public closeAd() {
    this.currentSession = null;
    this.notify();
  }

  public getCurrentSession(): ActiveAdSession | null {
    return this.currentSession;
  }
}

export const adMobService = new AdMobService();

/**
 * Fungsi pembungkus bersih yang dapat langsung dipanggil dari komponen game mana saja
 */
export function showRewardedAd(
  rewardType: RewardAdType,
  onReward: () => void,
  onDismiss?: () => void
) {
  adMobService.showRewardedAd(rewardType, onReward, onDismiss);
}
