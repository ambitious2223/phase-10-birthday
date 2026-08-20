let ctx: AudioContext | null = null;
let drawCount = 0;

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function note(freq: number, start: number, dur: number, type: OscillatorType = 'sine', gain = 0.15) {
  const c = getCtx();
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  g.gain.setValueAtTime(gain, c.currentTime + start);
  g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + start + dur);
  osc.connect(g).connect(c.destination);
  osc.start(c.currentTime + start);
  osc.stop(c.currentTime + start + dur);
}

function noise(start: number, dur: number, gain = 0.08) {
  const c = getCtx();
  const buf = c.createBuffer(1, c.sampleRate * dur, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const src = c.createBufferSource();
  src.buffer = buf;
  const g = c.createGain();
  const filter = c.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.value = 2000;
  g.gain.setValueAtTime(gain, c.currentTime + start);
  g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + start + dur);
  src.connect(filter).connect(g).connect(c.destination);
  src.start(c.currentTime + start);
  src.stop(c.currentTime + start + dur);
}

export function resetDrawCount() {
  drawCount = 0;
}

export function playCardDraw() {
  drawCount++;
  const pitchMult = 1 + (drawCount - 1) * 0.08;
  const baseFreq = 1800 * pitchMult;
  noise(0, 0.12, 0.06);
  note(baseFreq, 0, 0.08, 'sine', 0.04);
  note(baseFreq * 1.2, 0.02, 0.06, 'sine', 0.03);
}

export function playCardDiscard() {
  drawCount = 0;
  note(300, 0, 0.1, 'triangle', 0.12);
  note(200, 0.02, 0.08, 'triangle', 0.08);
  noise(0, 0.06, 0.05);
}

export function playPhaseLay() {
  drawCount = 0;
  note(523, 0, 0.25, 'sine', 0.12);
  note(659, 0.12, 0.25, 'sine', 0.12);
  note(784, 0.24, 0.35, 'sine', 0.15);
  note(1047, 0.36, 0.4, 'sine', 0.08);
}

export function playSkipSlam() {
  drawCount = 0;
  note(80, 0, 0.3, 'sawtooth', 0.15);
  note(60, 0.05, 0.25, 'square', 0.1);
  note(150, 0, 0.15, 'triangle', 0.12);
  noise(0, 0.1, 0.08);
}

export function playVictoryChime() {
  drawCount = 0;
  const notes = [523, 659, 784, 1047, 784, 1047, 1319];
  notes.forEach((f, i) => note(f, i * 0.1, 0.3, 'sine', 0.1));
  note(1568, 0.7, 0.5, 'sine', 0.12);
}

export function playFeltSlide() {
  noise(0, 0.08, 0.03);
  note(600, 0, 0.05, 'sine', 0.02);
}
