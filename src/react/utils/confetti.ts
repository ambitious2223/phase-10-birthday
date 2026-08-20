import confetti from 'canvas-confetti';
import { playVictoryChime } from './soundEffects';

export function fireWinConfetti() {
  const duration = 3000;
  const end = Date.now() + duration;

  const frame = () => {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: ['#dc2626', '#2563eb', '#16a34a', '#eab308'],
    });
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: ['#dc2626', '#2563eb', '#16a34a', '#eab308'],
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  };
  frame();
}

export function fireSmallBurst(x: number, y: number) {
  confetti({
    particleCount: 30,
    spread: 60,
    origin: { x: x / window.innerWidth, y: y / window.innerHeight },
    colors: ['#fbbf24', '#f59e0b', '#d97706'],
    scalar: 0.8,
  });
}

export function fireMeldComplete() {
  confetti({
    particleCount: 50,
    spread: 70,
    origin: { y: 0.7 },
    colors: ['#fbbf24', '#f59e0b'],
    scalar: 1.2,
  });
}

export function fireWinFromAvatar(element: HTMLElement) {
  const rect = element.getBoundingClientRect();
  const x = (rect.left + rect.width / 2) / window.innerWidth;
  const y = (rect.top + rect.height / 2) / window.innerHeight;

  confetti({
    particleCount: 80,
    spread: 90,
    origin: { x, y },
    colors: ['#dc2626', '#2563eb', '#16a34a', '#eab308', '#7c3aed'],
    scalar: 1.3,
    gravity: 0.8,
  });

  setTimeout(() => {
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { x: x - 0.1, y },
      colors: ['#fbbf24', '#f59e0b'],
      scalar: 0.9,
    });
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { x: x + 0.1, y },
      colors: ['#fbbf24', '#f59e0b'],
      scalar: 0.9,
    });
  }, 200);
}

export function fireBirthdayBurst() {
  playVictoryChime();
  const duration = 4000;
  const end = Date.now() + duration;

  const frame = () => {
    confetti({
      particleCount: 4,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: ['#d32f2f', '#fbbf24', '#e65100', '#7c3aed', '#1565c0'],
    });
    confetti({
      particleCount: 4,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: ['#d32f2f', '#fbbf24', '#e65100', '#7c3aed', '#1565c0'],
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  };
  frame();

  setTimeout(() => {
    confetti({
      particleCount: 200,
      spread: 120,
      origin: { y: 0.5 },
      colors: ['#d32f2f', '#fbbf24', '#e65100', '#7c3aed', '#1565c0', '#2e7d32'],
      scalar: 1.4,
      gravity: 0.6,
    });
  }, 500);

  setTimeout(() => {
    confetti({
      particleCount: 100,
      spread: 90,
      origin: { y: 0.6 },
      colors: ['#fbbf24', '#f59e0b', '#d97706'],
      scalar: 1.2,
    });
  }, 1200);
}

export function fireWildSparkle(x: number, y: number) {
  const originX = x / window.innerWidth;
  const originY = y / window.innerHeight;

  confetti({
    particleCount: 15,
    spread: 45,
    origin: { x: originX, y: originY },
    colors: ['#ff4d4d', '#ffd700', '#4da6ff', '#ff69b4', '#7c3aed'],
    scalar: 0.7,
    gravity: 0.5,
    drift: 0,
    ticks: 60,
  });

  setTimeout(() => {
    confetti({
      particleCount: 8,
      spread: 30,
      origin: { x: originX, y: originY },
      colors: ['#ff4d4d', '#ffd700', '#4da6ff'],
      scalar: 0.5,
      gravity: 0.3,
      ticks: 40,
    });
  }, 150);
}
