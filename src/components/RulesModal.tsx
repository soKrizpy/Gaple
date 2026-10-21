import React, { useEffect, useRef } from 'react';
import { X, BookOpen, Sparkles, Target, Flame, Layers, Award } from 'lucide-react';
import { animateModalOpen } from '../AnimationController.js';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && modalRef.current) {
      animateModalOpen(modalRef.current);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50 select-none">
      <div
        ref={modalRef}
        className="bg-slate-900 border border-amber-500/50 rounded-3xl p-5 md:p-6 max-w-lg w-full shadow-2xl flex flex-col gap-4 text-stone-100 max-h-[85vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-stone-800">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-amber-300">Panduan & Aturan Gaple Pos Ronda</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Isi Panduan dengan Istilah Asli Indonesia */}
        <div className="space-y-3 text-xs text-stone-300 leading-relaxed">
          {/* Rumus Skor */}
          <div className="bg-stone-950/70 p-3 rounded-xl border border-stone-800">
            <h3 className="font-bold text-sky-400 text-sm mb-1.5 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-sky-300" /> Sistem Hitungan Skor Pos Ronda
            </h3>
            <div className="p-2 bg-slate-900 rounded-lg border border-sky-500/30 font-mono text-center text-sm font-black text-amber-300 my-1">
              Total Skor = Titik Batu × Pengali Kombo
            </div>
            <ul className="space-y-1 list-disc list-inside mt-2">
              <li>
                <strong>Titik Dasar (Biru):</strong> Jumlah titik mata pada batu yang dipasang (contoh: batu [5-3] bernilai 8 Titik).
              </li>
              <li>
                <strong>Pengali Rantai (Merah):</strong> Pengali dasar bertambah +1 setiap kali berhasil menyambung batu berturut-turut tanpa putus (streak).
              </li>
              <li>
                <strong>Bonus Balak Sakti:</strong> Memasang batu Balak (kembar: 0-0, 1-1 s/d 6-6) melipatgandakan pengali secara instan: <span className="text-rose-400 font-bold">Pengali × 2</span>!
              </li>
            </ul>
          </div>

          {/* Struktur Babak Pos Ronda */}
          <div className="bg-stone-950/70 p-3 rounded-xl border border-stone-800">
            <h3 className="font-bold text-amber-300 text-sm mb-1.5 flex items-center gap-1.5">
              <Target className="w-4 h-4 text-amber-400" /> Struktur Babak & Kuota Main
            </h3>
            <p className="mb-2">
              Setiap babak mengharuskan pemain mencapai <strong>Target Skor</strong>:
            </p>
            <div className="grid grid-cols-3 gap-1.5 text-center font-mono text-[11px] mb-2">
              <div className="bg-stone-900 p-1.5 rounded border border-stone-800">
                <span className="text-stone-400 block text-[9px]">Babak 1</span>
                <span className="text-amber-300 font-bold">300 Poin</span>
              </div>
              <div className="bg-stone-900 p-1.5 rounded border border-stone-800">
                <span className="text-stone-400 block text-[9px]">Babak 2</span>
                <span className="text-amber-300 font-bold">800 Poin</span>
              </div>
              <div className="bg-stone-900 p-1.5 rounded border border-stone-800">
                <span className="text-stone-400 block text-[9px]">Babak 3</span>
                <span className="text-amber-300 font-bold">2.000 Poin</span>
              </div>
            </div>
            <p>
              Di setiap babak, pemain dibekali:
            </p>
            <ul className="space-y-1 list-disc list-inside mt-1">
              <li><strong>4 kali kuota pasang batu:</strong> Kesempatan meletakkan batu ke meja.</li>
              <li><strong>3 kali kuota buang batu (discard):</strong> Membuang batu yang tidak cocok dan menarik batu baru dari cadangan.</li>
            </ul>
          </div>

          {/* Sambungan Batu & Rotasi Otomatis */}
          <div className="bg-stone-950/70 p-3 rounded-xl border border-stone-800">
            <h3 className="font-bold text-amber-300 text-sm mb-1.5 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-amber-400" /> Aturan Sambungan Batu & Rotasi Otomatis
            </h3>
            <p className="mb-2">
              Batu domino di meja saling terhubung pada sisi mata titik yang sama:
            </p>
            <ul className="space-y-1 list-disc list-inside">
              <li>
                <strong>Saling Mengunci:</strong> Batu enam harus bertemu batu enam, batu tiga bertemu batu tiga, baik di ujung kiri maupun di ujung kanan meja.
              </li>
              <li>
                <strong>Rotasi Otomatis:</strong> Anda tidak perlu repot memutar batu secara manual. Permainan akan secara otomatis memutar dan menyesuaikan arah kepala serta ekor batu agar sisi mata titik yang bersentuhan selalu cocok sempurna.
              </li>
              <li>
                <strong>Batu Balak (Kembar):</strong> Batu kembar (seperti 6-6, 5-5, dst.) dipasang melintang tegak (vertikal) di jalur sambungan dan memberikan pengganda kombo <span className="text-rose-400 font-bold">Pengali × 2</span> secara langsung!
              </li>
            </ul>
          </div>

          {/* Kondisi Meja Gaple / Deadlock */}
          <div className="bg-stone-950/70 p-3 rounded-xl border border-stone-800">
            <h3 className="font-bold text-rose-400 text-sm mb-1.5 flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-rose-400" /> Kondisi 'Kunci Meja / Gaple!'
            </h3>
            <p>
              Jika tidak ada lagi batu di tangan yang bisa disambung dan kuota buang batu telah habis:
            </p>
            <div className="p-2 bg-red-950/40 rounded-lg border border-red-500/40 my-2 text-stone-200">
              Tekan tombol <strong>'Kunci Meja (Gaple)'</strong>: Seluruh sisa titik pada batu di tangan dihitung, lalu <strong className="text-yellow-300">dikalikan dengan 3</strong> sebagai skor ledakan penutup babak!
            </div>
            <p className="text-[11px] text-stone-400">
              Meja akan bergetar mantap, disusul perolehan skor penutup dan letupan kembang api kemenangan.
            </p>
          </div>

          {/* Jimat Sakti */}
          <div className="bg-stone-950/70 p-3 rounded-xl border border-stone-800">
            <h3 className="font-bold text-emerald-400 text-sm mb-1 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-emerald-300" /> Jimat Sakti Warkop
            </h3>
            <p>
              Setiap kali berhasil lolos target babak, Anda dapat belanja di Toko Ronda untuk membeli Jimat Warkop baru (maksimal 5 jimat) guna memperkuat Titik Batu dan Pengali Kombo di babak-babak berikutnya.
            </p>
          </div>
        </div>

        {/* Tombol Tutup */}
        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md"
        >
          Siap Main, Kembali ke Meja
        </button>
      </div>
    </div>
  );
};
