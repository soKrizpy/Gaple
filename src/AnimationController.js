import { animate, createTimeline, stagger } from 'animejs';
import confetti from 'canvas-confetti';
import { sounds } from './utils/soundEffects';

/**
 * AnimationController.js
 * Modul khusus penanganan seluruh efek visual & animasi game Domino Gaple menggunakan Anime.js (v4)
 */

// Helper compatibility wrapper untuk syntax anime({...}) dan anime.timeline()
export const anime = function(params) {
  const { targets, ...rest } = params || {};
  return animate(targets, rest);
};

anime.timeline = function(params) {
  const tl = createTimeline(params);
  const originalAdd = tl.add.bind(tl);
  tl.add = function(a1, a2, a3) {
    if (a1 && a1.targets) {
      const { targets, ...rest } = a1;
      return originalAdd(targets, rest, a2);
    }
    return originalAdd(a1, a2, a3);
  };
  return tl;
};

anime.stagger = stagger;

export default anime;

/**
 * Menggerakkan batu domino cepat ke target posisi dengan efek membal (easeOutBack),
 * lalu memicu micro screen shake pada kontainer papan meja.
 * 
 * @param {HTMLElement|string} tileElement - Elemen batu domino yang akan dianimasikan
 * @param {{x: number, y: number, rotate?: number, scale?: number}} targetPosition - Posisi koordinat & rotasi tujuan
 * @param {Function} [onComplete] - Callback opsional saat animasi selesai
 */
export function animateTileSlam(tileElement, targetPosition, onComplete) {
  const target = typeof tileElement === 'string' ? document.querySelector(tileElement) : tileElement;
  if (!target) {
    if (typeof onComplete === 'function') onComplete();
    return;
  }

  const { x = 0, y = 0, rotate = 0, scale = 1 } = targetPosition || {};

  animate(target, {
    translateX: x,
    translateY: y,
    rotate: rotate,
    scale: [scale * 1.25, scale],
    opacity: [0.85, 1],
    duration: 360,
    ease: 'outBack(1.8)',
    onComplete: () => {
      // Picu getaran layar mikro (screen shake) pada kontainer papan meja
      const boardContainer = document.querySelector('#game-table') || document.querySelector('.game-board-container');
      if (boardContainer) {
        animate(boardContainer, {
          translateX: [0, -6, 6, -4, 4, -2, 2, 0],
          translateY: [0, 4, -4, 2, -2, 0],
          duration: 250,
          ease: 'outQuad',
        });
      }

      // Haptic feedback jika didukung perangkat
      try {
        if (typeof window !== 'undefined' && 'vibrate' in navigator) {
          navigator.vibrate(25);
        }
      } catch {
        // ignore haptic error
      }

      if (typeof onComplete === 'function') {
        onComplete();
      }
    }
  });
}

/**
 * Animasi Terbang Kartu yang Dipilih Saat Diletakkan di Meja (Flight Arc):
 * Menerbangkan kartu domino dari tangan pemain (atau bot) secara melengkung di udara,
 * membesar, berputar sesuai orientasi sambungan meja, lalu membanting (slam) ke meja
 * dengan efek getaran layar, debu/cahaya benturan, dan audio clack/slam.
 *
 * @param {Object} options
 * @param {Object} options.tile - Objek batu domino { head, tail, isDouble }
 * @param {DOMRect} [options.startRect] - Bounding rect posisi awal (dari dock)
 * @param {DOMRect} [options.targetRect] - Bounding rect posisi sasaran di meja
 * @param {number} [options.targetAngle] - Sudut rotasi akhir di meja
 * @param {Function} [options.onComplete] - Callback saat batu mendarat di meja
 */
export function animateTilePlacementFlight({ tile, startRect, targetRect, targetAngle = 0, onComplete }) {
  if (!startRect || !targetRect || typeof document === 'undefined') {
    sounds.playTileSlam();
    const boardContainer = document.querySelector('#game-table') || document.querySelector('.game-board-container');
    if (boardContainer) {
      animate(boardContainer, {
        translateX: [0, -6, 6, -4, 4, 0],
        translateY: [0, 4, -4, 2, 0],
        duration: 220,
        ease: 'outQuad',
      });
    }
    if (typeof onComplete === 'function') onComplete();
    return;
  }

  // Buat elemen visual terbang (proxy element)
  const flyer = document.createElement('div');
  flyer.className = 'fixed pointer-events-none z-[9999] rounded-lg shadow-2xl flex flex-col items-center justify-between';
  flyer.style.width = `${startRect.width || 44}px`;
  flyer.style.height = `${startRect.height || 88}px`;
  flyer.style.left = `${startRect.left}px`;
  flyer.style.top = `${startRect.top}px`;
  flyer.style.background = 'linear-gradient(135deg, #fffbeb 0%, #f5f5f4 50%, #fef3c7 100%)';
  flyer.style.border = '2px solid #d6d3d1';
  flyer.style.boxShadow = '0 20px 35px rgba(0,0,0,0.65), 0 0 25px rgba(245, 158, 11, 0.7)';

  // Helper render titik domino
  const renderPipsHtml = (val) => {
    const coords = {
      0: [],
      1: [[1, 1]],
      2: [[0, 0], [2, 2]],
      3: [[0, 0], [1, 1], [2, 2]],
      4: [[0, 0], [0, 2], [2, 0], [2, 2]],
      5: [[0, 0], [0, 2], [1, 1], [2, 0], [2, 2]],
      6: [[0, 0], [0, 2], [1, 0], [1, 2], [2, 0], [2, 2]],
    }[val] || [];

    const isRed = (val === 1 || val === 4);
    const pipBg = isRed ? '#dc2626' : '#0f172a';

    let dotsHtml = '';
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        const hasDot = coords.some(([row, col]) => row === r && col === c);
        if (hasDot) {
          dotsHtml += `<div style="grid-row-start: ${r + 1}; grid-column-start: ${c + 1}; width: 6px; height: 6px; border-radius: 9999px; background-color: ${pipBg}; box-shadow: inset 0 1px 2px rgba(0,0,0,0.5);"></div>`;
        }
      }
    }
    return `<div style="display: grid; grid-template-columns: repeat(3, 1fr); grid-template-rows: repeat(3, 1fr); width: 100%; height: 100%; place-items: center; padding: 2px;">${dotsHtml}</div>`;
  };

  flyer.innerHTML = `
    <div style="flex: 1; width: 100%; display: flex; align-items: center; justify-content: center; overflow: hidden;">
      ${renderPipsHtml(tile.head)}
    </div>
    <div style="width: 100%; height: 2px; background-color: #a8a29e; position: relative; display: flex; align-items: center; justify-content: center;">
      <div style="position: absolute; width: 6px; height: 6px; border-radius: 9999px; background: linear-gradient(135deg, #d97706, #fde047, #b45309); border: 1px solid #78350f;"></div>
    </div>
    <div style="flex: 1; width: 100%; display: flex; align-items: center; justify-content: center; overflow: hidden;">
      ${renderPipsHtml(tile.tail)}
    </div>
  `;

  document.body.appendChild(flyer);

  const deltaX = (targetRect.left + targetRect.width / 2) - (startRect.left + startRect.width / 2);
  const deltaY = (targetRect.top + targetRect.height / 2) - (startRect.top + startRect.height / 2);

  // Parabolic flight trajectory with Anime.js
  animate(flyer, {
    translateX: [0, deltaX],
    translateY: [0, deltaY - 45, deltaY],
    rotate: [0, targetAngle || 0],
    scale: [1, 1.25, 1],
    duration: 380,
    ease: 'outCubic',
    onComplete: () => {
      // Sound of slam
      sounds.playTileSlam();

      // Gentle screen shake on board container
      const boardContainer = document.querySelector('#game-table') || document.querySelector('.game-board-container');
      if (boardContainer) {
        animate(boardContainer, {
          translateX: [0, -3, 3, -1, 1, 0],
          translateY: [0, 2, -2, 1, 0],
          duration: 200,
          ease: 'outQuad',
        });
      }

      // Haptic
      try {
        if (typeof window !== 'undefined' && 'vibrate' in navigator) {
          navigator.vibrate(25);
        }
      } catch {
        // ignore
      }

      // Landing ripple
      const ripple = document.createElement('div');
      ripple.className = 'fixed pointer-events-none z-[9998] rounded-full border-2 border-amber-400';
      ripple.style.left = `${targetRect.left + targetRect.width / 2 - 25}px`;
      ripple.style.top = `${targetRect.top + targetRect.height / 2 - 25}px`;
      ripple.style.width = '50px';
      ripple.style.height = '50px';
      document.body.appendChild(ripple);

      animate(ripple, {
        scale: [0.5, 2.2],
        opacity: [0.8, 0],
        duration: 280,
        ease: 'outQuad',
        onComplete: () => {
          if (ripple.parentNode) ripple.parentNode.removeChild(ripple);
        }
      });

      // Mount placed tile with smooth state transition
      if (typeof onComplete === 'function') {
        onComplete();
      }

      // Transisi transparan halus saat mendarat agar tidak mendominasi layar secara tiba-tiba
      animate(flyer, {
        opacity: [1, 0],
        scale: [1, 1.03],
        duration: 180,
        ease: 'outQuad',
        onComplete: () => {
          if (flyer.parentNode) flyer.parentNode.removeChild(flyer);
        }
      });
    }
  });
}

/**
 * Menampilkan resolusi skor kombo gaya Balatro (Chips x Mult) dengan anime.timeline():
 * Langkah 1: Angka Chips biru melompat dari batu
 * Langkah 2: Angka Mult merah melompat dan membesar (scale: [0, 1.4, 1])
 * Langkah 3: Menggerakkan angka total skor di papan atas berputar naik (number counting ticker)
 * 
 * @param {number} chipsValue - Nilai Chips (biru)
 * @param {number} multValue - Nilai Pengali Mult (merah)
 * @param {number} totalTarget - Total target skor baru setelah penambahan
 * @param {Object} [config] - Konfigurasi elemen tampilan dan callback
 */
export function animateScoreResolution(chipsValue, multValue, totalTarget, config = {}) {
  const {
    chipsElem = '#score-chips-popup',
    multElem = '#score-mult-popup',
    tickerElem = '#header-score-ticker',
    currentScore = 0,
    onScoreUpdate,
    onComplete
  } = config;

  const tl = anime.timeline({
    onComplete: () => {
      if (typeof onComplete === 'function') {
        onComplete();
      }
    }
  });

  const cTarget = typeof chipsElem === 'string' ? document.querySelector(chipsElem) : chipsElem;
  const mTarget = typeof multElem === 'string' ? document.querySelector(multElem) : multElem;
  const tTarget = typeof tickerElem === 'string' ? document.querySelector(tickerElem) : tickerElem;

  // Langkah 1: Angka Titik biru melompat dari batu
  if (cTarget) {
    cTarget.textContent = `+${chipsValue} Titik`;
    tl.add(cTarget, {
      opacity: [0, 1],
      translateY: [25, -12],
      scale: [0.6, 1.25, 1],
      duration: 350,
      ease: 'outBack(1.6)',
      onBegin: () => {
        sounds.playTitikPop();
      }
    });
  }

  // Langkah 2: Angka Pengali merah melompat dan membesar (scale: [0, 1.4, 1])
  if (mTarget) {
    mTarget.textContent = `X${multValue} Pengali`;
    tl.add(mTarget, {
      opacity: [0, 1],
      translateY: [20, -15],
      scale: [0, 1.4, 1],
      duration: 400,
      ease: 'outElastic(1, .5)',
      onBegin: () => {
        sounds.playPengaliPop();
      }
    }, '-=150');
  }

  // Langkah 3: Menggerakkan angka total skor di papan atas agar berputar naik dengan denting nada naik
  const scoreCounter = { val: currentScore };
  let tickCount = 0;
  const scoreDiff = totalTarget - currentScore;

  tl.add(scoreCounter, {
    val: totalTarget,
    round: 1,
    duration: 650,
    ease: 'outExpo',
    onUpdate: () => {
      const rounded = Math.round(scoreCounter.val);
      if (tTarget) {
        tTarget.textContent = rounded.toLocaleString('id-ID');
      }
      if (typeof onScoreUpdate === 'function') {
        onScoreUpdate(rounded);
      }
      // Pitch-shift sound tick
      tickCount++;
      if (tickCount % 3 === 0) {
        const progress = scoreDiff > 0 ? (scoreCounter.val - currentScore) / scoreDiff : 0;
        sounds.playScoreTick(progress);
      }
    }
  }, '+=80');

  // Pulse effect pada badge total skor saat angka bertambah
  if (tTarget) {
    tl.add(tTarget, {
      scale: [1, 1.28, 1],
      duration: 280,
      ease: 'inOutQuad',
    }, '-=550');
  }

  // Fade out popup chips & mult setelah selesai
  const popups = [cTarget, mTarget].filter(Boolean);
  if (popups.length > 0) {
    tl.add(popups, {
      opacity: [1, 0],
      translateY: -28,
      duration: 280,
      ease: 'inQuad',
      delay: 200,
    });
  }

  return tl;
}

/**
 * Efek visual saat jimat aktif:
 * Jimat berguncang sedikit, membesar (scale: 1.15), dan memancarkan efek siluet cahaya (glow pulse).
 * 
 * @param {HTMLElement|string} relicElement - Elemen kartu jimat/relic
 * @param {Function} [onComplete] - Callback opsional
 */
export function animateRelicTrigger(relicElement, onComplete) {
  const target = typeof relicElement === 'string' ? document.querySelector(relicElement) : relicElement;
  if (!target) {
    if (typeof onComplete === 'function') onComplete();
    return;
  }

  return animate(target, {
    scale: [1, 1.18, 1],
    rotate: [0, -8, 8, -5, 5, 0],
    boxShadow: [
      '0 0 0 rgba(234, 179, 8, 0)',
      '0 0 28px 8px rgba(250, 204, 21, 0.85)',
      '0 0 8px rgba(234, 179, 8, 0.2)'
    ],
    duration: 500,
    ease: 'outBack',
    onComplete: () => {
      if (typeof onComplete === 'function') {
        onComplete();
      }
    }
  });
}

/**
 * Animasi kondisi 'Gaple/Kunci Papan' (Deadlock):
 * Semua batu di meja bergetar bersamaan dengan jeda berurutan (staggered delay),
 * lalu muncul efek ledakan partikel skor dramatis.
 * 
 * @param {Array<HTMLElement>|string} boardTiles - Kumpulan elemen batu di meja
 * @param {Function} [onExplosion] - Callback opsional saat ledakan muncul
 */
export function animateDeadlockGaple(boardTiles, onExplosion) {
  const targets = typeof boardTiles === 'string' ? document.querySelectorAll(boardTiles) : boardTiles;
  
  if (!targets || targets.length === 0) {
    triggerConfettiExplosion();
    if (typeof onExplosion === 'function') onExplosion();
    return;
  }

  // Getaran berurutan pada semua batu meja
  animate(targets, {
    translateX: [0, -8, 8, -6, 6, -3, 3, 0],
    translateY: [0, 4, -4, 3, -3, 0],
    rotate: [0, -4, 4, -2, 2, 0],
    delay: stagger(35, { from: 'center' }),
    duration: 520,
    ease: 'inOutSine',
    onComplete: () => {
      // Efek ledakan dramatis
      triggerConfettiExplosion();

      // Papan meja bergetar keras
      const boardContainer = document.querySelector('#game-table') || document.querySelector('.game-board-container');
      if (boardContainer) {
        animate(boardContainer, {
          translateX: [0, -10, 10, -7, 7, -3, 3, 0],
          translateY: [0, 8, -8, 5, -5, 0],
          duration: 380,
          ease: 'outElastic(1, .4)'
        });
      }

      if (typeof onExplosion === 'function') {
        onExplosion();
      }
    }
  });
}

/**
 * Helper partikel ledakan confetti untuk Gaple Deadlock & Kemenangan
 */
export function triggerConfettiExplosion() {
  try {
    confetti({
      particleCount: 85,
      spread: 75,
      origin: { y: 0.5 },
      colors: ['#f59e0b', '#ef4444', '#38bdf8', '#10b981', '#f3f4f6']
    });
    setTimeout(() => {
      confetti({
        particleCount: 55,
        angle: 60,
        spread: 60,
        origin: { x: 0, y: 0.6 }
      });
      confetti({
        particleCount: 55,
        angle: 120,
        spread: 60,
        origin: { x: 1, y: 0.6 }
      });
    }, 180);
  } catch {
    // fallback if confetti fails
  }
}

/**
 * Animasi membuka modal dengan efek membal (easeOutBack)
 * @param {HTMLElement|string} modalElement - Elemen kontainer modal
 * @param {Function} [onComplete] - Callback saat animasi selesai
 */
export function animateModalOpen(modalElement, onComplete) {
  const target = typeof modalElement === 'string' ? document.querySelector(modalElement) : modalElement;
  if (!target) {
    if (typeof onComplete === 'function') onComplete();
    return;
  }
  return animate(target, {
    scale: [0.8, 1],
    opacity: [0, 1],
    translateY: [24, 0],
    duration: 320,
    ease: 'outBack(1.5)',
    onComplete
  });
}

/**
 * Animasi Partikel Percikan Api di Sekitar Kartu:
 * Memunculkan semburan percikan api (fire sparks, bara api/embers, kilatan hangat)
 * di sekeliling kartu domino saat pemain berhasil menyambungkan dua kartu
 * dengan jumlah titik (mata) yang sama di meja.
 *
 * @param {HTMLElement|string|DOMRect|undefined|null} [targetOrRect] - Elemen kartu atau posisi koordinat di meja
 * @param {Object} [options]
 * @param {number} [options.count] - Jumlah partikel percikan api (default 42 atau 60 jika balak)
 * @param {boolean} [options.isDouble=false] - Jika balak, semburan api lebih dahsyat
 */
export function triggerFireSparks(targetOrRect, options = {}) {
  if (typeof document === 'undefined') return;

  const isDouble = Boolean(options.isDouble);
  const count = options.count || (isDouble ? 60 : 42);
  let rect = null;

  if (targetOrRect) {
    if (typeof targetOrRect === 'string') {
      const el = document.querySelector(targetOrRect);
      if (el) rect = el.getBoundingClientRect();
    } else if (targetOrRect instanceof HTMLElement) {
      rect = targetOrRect.getBoundingClientRect();
    } else if (typeof targetOrRect.left === 'number') {
      rect = targetOrRect;
    }
  }

  // Jika tidak ada target, fallback ke tengah papan meja
  if (!rect) {
    const tableEl = document.querySelector('#game-table');
    if (tableEl) rect = tableEl.getBoundingClientRect();
    else rect = { left: window.innerWidth / 2 - 40, top: window.innerHeight / 2 - 40, width: 80, height: 80 };
  }

  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  // Bunyikan audio percikan api pemantik warkop
  try {
    sounds.playKorekGas();
  } catch {
    // ignore
  }

  // Kontainer partikel terapung di atas layar
  const container = document.createElement('div');
  container.className = 'fixed pointer-events-none z-[99999] overflow-visible';
  container.style.left = `${centerX}px`;
  container.style.top = `${centerY}px`;
  container.style.width = '0px';
  container.style.height = '0px';
  document.body.appendChild(container);

  // 1. Kilatan Cahaya Hangat di Sekitar Kartu (Warm Glow Flash)
  const glowFlash = document.createElement('div');
  glowFlash.className = 'absolute -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none';
  const glowSize = Math.max(rect.width * 1.8, 110);
  glowFlash.style.width = `${glowSize}px`;
  glowFlash.style.height = `${glowSize}px`;
  glowFlash.style.background = isDouble
    ? 'radial-gradient(circle, rgba(254,240,138,0.95) 0%, rgba(245,158,11,0.7) 40%, rgba(239,68,68,0.35) 70%, transparent 100%)'
    : 'radial-gradient(circle, rgba(251,191,36,0.9) 0%, rgba(249,115,22,0.6) 45%, rgba(239,68,68,0.25) 70%, transparent 100%)';
  glowFlash.style.filter = 'blur(6px)';
  container.appendChild(glowFlash);

  animate(glowFlash, {
    scale: [0.6, 1.45],
    opacity: [0.95, 0],
    duration: isDouble ? 500 : 420,
    ease: 'outQuad',
  });

  // 2. Gelombang Kejut Cincin Api (Fiery Shockwave Ring)
  const shockRing = document.createElement('div');
  shockRing.className = 'absolute -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none border-2';
  shockRing.style.width = '32px';
  shockRing.style.height = '32px';
  shockRing.style.borderColor = isDouble ? '#facc15' : '#f97316';
  shockRing.style.boxShadow = isDouble
    ? '0 0 20px rgba(250, 204, 21, 0.95), inset 0 0 12px rgba(239, 68, 68, 0.8)'
    : '0 0 16px rgba(245, 158, 11, 0.85), inset 0 0 10px rgba(239, 68, 68, 0.6)';
  container.appendChild(shockRing);

  animate(shockRing, {
    scale: [0.5, isDouble ? 3.8 : 2.8],
    opacity: [1, 0],
    duration: isDouble ? 520 : 460,
    ease: 'outCubic',
  });

  // 3. Partikel Percikan Api & Bara (Fire Spark & Ember Particles)
  const sparkColors = [
    '#ffffff', // Inti pijar putih
    '#fef08a', // Kuning terang
    '#fde047', // Kuning emas
    '#f59e0b', // Oranye amber
    '#f97316', // Oranye api
    '#ef4444', // Merah bara
    '#dc2626', // Merah tua
    '#fbbf24', // Amber terang
  ];

  const particles = [];
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'absolute rounded-full pointer-events-none';
    
    // Variasi bentuk: ada bulat bercahaya, ada bara api lonjong
    const isEmber = Math.random() > 0.35;
    const size = isEmber ? (Math.random() * 4 + 3) : (Math.random() * 3 + 2);
    const color = sparkColors[Math.floor(Math.random() * sparkColors.length)];

    p.style.width = `${size}px`;
    p.style.height = isEmber && Math.random() > 0.4 ? `${size * 2}px` : `${size}px`;
    p.style.backgroundColor = color;
    p.style.boxShadow = `0 0 ${Math.random() * 8 + 5}px ${color}, 0 0 ${Math.random() * 14 + 7}px #ea580c`;
    p.style.transform = 'translate(-50%, -50%)';

    container.appendChild(p);

    // Hitung vektor lemparan partikel percikan api
    const angle = Math.random() * Math.PI * 2;
    const maxSpeed = isDouble ? 160 : 120;
    const speed = Math.random() * maxSpeed + 35;
    const targetX = Math.cos(angle) * speed;
    // Letupan sedikit ke atas lalu jatuh oleh gravitasi
    const targetY = Math.sin(angle) * speed + (Math.random() * 30 - 10);

    particles.push({
      el: p,
      targetX,
      targetY,
      duration: Math.random() * 380 + 420,
      rotation: Math.random() * 360,
    });
  }

  // Animasikan tiap percikan api
  particles.forEach(({ el, targetX, targetY, duration, rotation }) => {
    animate(el, {
      translateX: [0, targetX],
      translateY: [0, targetY],
      rotate: [0, rotation],
      scale: [1.3, 0],
      opacity: [1, 0.85, 0],
      duration,
      ease: 'outQuad',
    });
  });

  // Bersihkan kontainer setelah animasi percikan selesai
  setTimeout(() => {
    if (container.parentNode) {
      container.parentNode.removeChild(container);
    }
  }, 950);
}

