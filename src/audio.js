// =========================================================================
// AUDIO.JS - SISTEM SOUND EFFECTS & BGM GENERATIVE ROMANTIS (WEB AUDIO API)
// Ringan, tanpa file MP3 besar, bekerja langsung di browser & smartphone
// =========================================================================

export class GameAudio {
  constructor() {
    this.audioCtx = null;
    this.isMuted = false;
    this.isPlayingBGM = false;
    this.bgmTimer = null;
  }

  initAudio() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioContext();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  // Efek Suara Interaksi (Chime Berbunyi Lembut)
  playChime() {
    if (this.isMuted) return;
    this.initAudio();

    const now = this.audioCtx.currentTime;
    const freqs = [523.25, 659.25, 783.99, 1046.50];

    freqs.forEach((freq, i) => {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + i * 0.08);

      gain.gain.setValueAtTime(0, now + i * 0.08);
      gain.gain.linearRampToValueAtTime(0.12, now + i * 0.08 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.08 + 0.6);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + 0.7);
    });
  }

  // Efek Suara Tombol / Klik UI
  playClick() {
    if (this.isMuted) return;
    this.initAudio();

    const now = this.audioCtx.currentTime;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.08);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start(now);
    osc.stop(now + 0.09);
  }

  // Efek Suara Perayaan / Fanfare
  playCelebration() {
    if (this.isMuted) return;
    this.initAudio();

    const now = this.audioCtx.currentTime;
    const notes = [440, 554.37, 659.25, 880];

    notes.forEach((freq, idx) => {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.12);

      gain.gain.setValueAtTime(0.1, now + idx * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.12 + 1.2);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now + idx * 0.12);
      osc.stop(now + idx * 0.12 + 1.3);
    });
  }

  // Musik Latar Romantis Lembut (Romantic Acoustic Harp Generative)
  startBGM() {
    if (this.isPlayingBGM) return;
    this.initAudio();
    this.isPlayingBGM = true;

    const chords = [
      [261.63, 329.63, 392.00, 523.25], // C Major
      [220.00, 261.63, 329.63, 440.00], // A Minor
      [174.61, 220.00, 261.63, 349.23], // F Major
      [196.00, 246.94, 293.66, 392.00]  // G Major
    ];

    let currentChord = 0;
    let noteStep = 0;

    const playNextNote = () => {
      if (!this.isPlayingBGM || this.isMuted) {
        this.bgmTimer = setTimeout(playNextNote, 600);
        return;
      }

      if (this.audioCtx) {
        const chord = chords[currentChord];
        const freq = chord[noteStep % chord.length];

        const now = this.audioCtx.currentTime;
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.04, now + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.6);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.start(now);
        osc.stop(now + 1.7);
      }

      noteStep++;
      if (noteStep >= 4) {
        noteStep = 0;
        currentChord = (currentChord + 1) % chords.length;
      }

      this.bgmTimer = setTimeout(playNextNote, 420);
    };

    playNextNote();
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (!this.isMuted && !this.isPlayingBGM) {
      this.startBGM();
    }
    return this.isMuted;
  }
}
