// Warung Rush — sound made from oscillators and noise, no audio files: a scoop's soft thump,
// the grill's sizzle, the bell when a dish is served, the buzz when something goes wrong.
// The context is created lazily on the first user gesture (browsers refuse sound before
// one), and screenshot scenes never call any of this, so shots stay silent and offline.

let context = null;
let muted = false;

export function setMuted(value) {
  muted = value;
}

function ensureContext() {
  if (muted) return null;
  if (typeof window === 'undefined') return null;
  if (context === null || context.state === 'closed') {
    const AudioCtor = window.AudioContext ?? window.webkitAudioContext;
    if (!AudioCtor) return null;
    context = new AudioCtor();
  }
  if (context.state === 'suspended') void context.resume();
  return context;
}

function tone(freqFrom, freqTo, seconds, type, gainPeak, when = 0) {
  const ctx = ensureContext();
  if (!ctx) return;
  const start = ctx.currentTime + when;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freqFrom, start);
  osc.frequency.exponentialRampToValueAtTime(Math.max(30, freqTo), start + seconds);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(gainPeak, start + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + seconds);
  osc.connect(gain).connect(ctx.destination);
  osc.start(start);
  osc.stop(start + seconds + 0.05);
}

function noiseBurst(seconds, gainPeak, filterFreq, when = 0) {
  const ctx = ensureContext();
  if (!ctx) return;
  const start = ctx.currentTime + when;
  const length = Math.max(1, Math.floor(ctx.sampleRate * seconds));
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i += 1) data[i] = Math.random() * 2 - 1;
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = filterFreq;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(gainPeak, start);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + seconds);
  source.connect(filter).connect(gain).connect(ctx.destination);
  source.start(start);
}

export const sounds = {
  scoop() {
    tone(300, 140, 0.09, 'triangle', 0.16);
  },
  place() {
    tone(520, 340, 0.07, 'triangle', 0.14);
  },
  grillStart() {
    noiseBurst(0.35, 0.1, 5200);
  },
  grillReady() {
    tone(880, 880, 0.09, 'sine', 0.16);
    tone(1320, 1320, 0.14, 'sine', 0.16, 0.1);
  },
  serve() {
    tone(784, 784, 0.1, 'sine', 0.18);
    tone(988, 988, 0.1, 'sine', 0.18, 0.09);
    tone(1319, 1319, 0.2, 'sine', 0.18, 0.18);
  },
  coin() {
    tone(1568, 1568, 0.07, 'square', 0.07);
    tone(2093, 2093, 0.16, 'square', 0.07, 0.06);
  },
  error() {
    tone(160, 110, 0.18, 'sawtooth', 0.1);
  },
  strike() {
    tone(392, 392, 0.12, 'square', 0.1);
    tone(311, 311, 0.22, 'square', 0.1, 0.12);
  },
  trash() {
    noiseBurst(0.16, 0.12, 700);
  },
  dayEnd() {
    tone(523, 523, 0.14, 'sine', 0.16);
    tone(659, 659, 0.14, 'sine', 0.16, 0.13);
    tone(784, 784, 0.3, 'sine', 0.16, 0.26);
  },
};
