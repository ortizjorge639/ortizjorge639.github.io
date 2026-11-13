export type SoundState = { enabled: boolean; error: string | null; awaitingGesture: boolean };

export class StudioAudio {
  private context?: AudioContext;
  private output?: GainNode;
  private noise?: AudioBuffer;
  private enabled = true;
  private entryPending = false;
  private entryNodes = new Set<OscillatorNode>();
  private ribbitFrame = 0;
  private ribbitListeners = new Set<() => void>();
  private explicitlySet = false;
  private error: string | null = null;
  private lastDraw = 0;
  private lastHover = 0;
  private lastUI = -1;
  private listeners = new Set<(state: SoundState) => void>();

  subscribe(listener: (state: SoundState) => void) {
    this.listeners.add(listener);
    listener(this.state());
    return () => { this.listeners.delete(listener); };
  }

  onEntryRibbit(listener: () => void) {
    this.ribbitListeners.add(listener);
    return () => { this.ribbitListeners.delete(listener); };
  }

  private notify() {
    this.listeners.forEach((listener) => listener(this.state()));
  }

  private state(): SoundState {
    return { enabled: this.enabled, error: this.error,
      awaitingGesture: this.enabled && this.context?.state !== 'running' };
  }

  startEntry(playJingle: boolean) {
    this.entryPending = playJingle;
    this.activate();
    const unlock = (event: Event) => {
      if (!event.isTrusted || !this.enabled) return;
      if (event.target instanceof Element && event.target.closest('#sound-toggle,#ink-sound')) return;
      if (event instanceof KeyboardEvent && !['Enter', ' '].includes(event.key)) return;
      this.activate();
    };
    document.addEventListener('pointerdown', unlock, { capture: true });
    document.addEventListener('keydown', unlock, { capture: true });
  }

  private activate() {
    if (!this.enabled) return;
    try {
      if (!this.context) {
        this.context = new AudioContext();
        this.output = this.context.createGain();
        this.output.connect(this.context.destination);
        this.context.addEventListener('statechange', () => { this.playEntryIfReady(); this.notify(); });
      }
      this.output!.gain.setValueAtTime(1, this.context.currentTime);
      if (this.context.state !== 'running') {
        void this.context.resume().then(() => { this.playEntryIfReady(); this.notify(); }).catch((error: unknown) => {
          if (error instanceof DOMException && error.name === 'NotAllowedError') this.notify();
          else this.fail(error);
        });
      }
      this.playEntryIfReady();
      this.notify();
    } catch (error) { this.fail(error); }
  }

  private playEntryIfReady() {
    if (!this.entryPending || !this.enabled || this.context?.state !== 'running' || !this.output) return;
    this.entryPending = false;
    const ctx = this.context;
    const start = ctx.currentTime + 0.01;
    const voice = (offset: number, duration: number, frequency: number, ribbit = false) => {
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.type = 'square';
      oscillator.frequency.setValueAtTime(frequency, start + offset);
      if (ribbit) {
        // Stepped falling pulses form the two syllables of an original pixel croak.
        for (let i = 1; i <= 8; i++) {
          oscillator.frequency.setValueAtTime(frequency * (1 - i * .065), start + offset + i * duration / 9);
          gain.gain.setValueAtTime(i % 2 ? .022 : .008, start + offset + i * duration / 9);
        }
      }
      gain.gain.setValueAtTime(0, start + offset);
      gain.gain.linearRampToValueAtTime(ribbit ? .022 : .012, start + offset + .004);
      gain.gain.setValueAtTime(ribbit ? .01 : .012, start + offset + duration - .012);
      gain.gain.linearRampToValueAtTime(0, start + offset + duration);
      oscillator.connect(gain).connect(this.output!);
      this.entryNodes.add(oscillator);
      oscillator.onended = () => { this.entryNodes.delete(oscillator); oscillator.disconnect(); gain.disconnect(); };
      oscillator.start(start + offset);
      oscillator.stop(start + offset + duration + .002);
    };
    [523.25, 659.25, 783.99, 1046.5].forEach((note, i) => voice(i * .09, .11, note));
    voice(.64, .13, 460, true);
    voice(.81, .17, 350, true);
    const greetAt = start + .64;
    const endsAt = start + .98;
    const synchronize = () => {
      this.ribbitFrame = 0;
      if (!this.enabled || ctx.state === 'closed' || ctx.currentTime > endsAt) return;
      if (ctx.state === 'running' && ctx.currentTime >= greetAt) {
        if (!document.hidden) this.ribbitListeners.forEach(listener => listener());
        return;
      }
      this.ribbitFrame = requestAnimationFrame(synchronize);
    };
    cancelAnimationFrame(this.ribbitFrame);
    this.ribbitFrame = requestAnimationFrame(synchronize);
  }

  private fail(error: unknown) {
    console.warn('Studio sound unavailable', error);
    this.enabled = false;
    cancelAnimationFrame(this.ribbitFrame);
    this.output?.gain.setValueAtTime(0, this.context!.currentTime);
    this.error = 'Sound is unavailable in this browser. You can still draw.';
    this.notify();
  }

  setEnabled(enabled: boolean, explicit = true) {
    if (explicit) this.explicitlySet = true;
    this.enabled = enabled;
    this.error = null;
    if (enabled) this.activate();
    else {
      this.entryPending = false;
      cancelAnimationFrame(this.ribbitFrame);
      this.output?.gain.setValueAtTime(0, this.context!.currentTime);
      this.entryNodes.forEach((node) => node.stop());
      this.entryNodes.clear();
    }
    this.notify();
  }

  toggle() {
    this.setEnabled(!this.enabled);
    this.playUI();
  }

  enableForInk() {
    if (!this.explicitlySet) this.setEnabled(true, false);
  }

  playGuide(cue: 'open' | 'close' | 'answer') {
    if (!this.enabled || this.context?.state !== 'running' || !this.output) return;
    const now = this.context.currentTime;
    const notes = cue === 'answer' ? [520, 780] : cue === 'open' ? [260, 440] : [320, 180];
    notes.forEach((frequency, index) => {
      const oscillator = this.context!.createOscillator();
      const gain = this.context!.createGain();
      const start = now + index * 0.045;
      oscillator.type = 'triangle';
      oscillator.frequency.setValueAtTime(frequency, start);
      oscillator.frequency.exponentialRampToValueAtTime(frequency * 0.8, start + 0.065);
      gain.gain.setValueAtTime(0.014, start);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.075);
      oscillator.connect(gain).connect(this.output!);
      oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
      oscillator.start(start);
      oscillator.stop(start + 0.08);
    });
  }

  playUI(hover = false) {
    if (!this.enabled || this.context?.state !== 'running' || !this.output) return;
    const now = this.context.currentTime;
    if (now - this.lastUI < 0.04) return;
    if (hover && now - this.lastHover < 0.12) return;
    this.lastUI = now;
    if (hover) this.lastHover = now;
    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();
    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(hover ? 720 : 420, now);
    oscillator.frequency.exponentialRampToValueAtTime(hover ? 500 : 160, now + 0.045);
    gain.gain.setValueAtTime(hover ? 0.007 : 0.025, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.055);
    oscillator.connect(gain).connect(this.output);
    oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
    oscillator.start(now);
    oscillator.stop(now + 0.06);
  }

  draw(tool: 'pen' | 'paint' | 'eraser', pressure: number) {
    if (!this.enabled || this.context?.state !== 'running' || !this.output) return;
    const now = this.context.currentTime;
    if (now - this.lastDraw < 0.065) return;
    this.lastDraw = now;
    if (!this.noise) {
      this.noise = this.context.createBuffer(1, Math.ceil(this.context.sampleRate * 0.065), this.context.sampleRate);
      const samples = this.noise.getChannelData(0);
      for (let i = 0; i < samples.length; i++) samples[i] = Math.random() * 2 - 1;
    }
    const source = this.context.createBufferSource();
    const filter = this.context.createBiquadFilter();
    const gain = this.context.createGain();
    source.buffer = this.noise;
    filter.type = 'bandpass';
    filter.frequency.value = tool === 'pen' ? 2600 : tool === 'paint' ? 1100 : 650;
    filter.Q.value = tool === 'pen' ? 1.4 : 0.6;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.018 * Math.max(0.25, pressure), now + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.055);
    source.connect(filter).connect(gain).connect(this.output);
    source.onended = () => { source.disconnect(); filter.disconnect(); gain.disconnect(); };
    source.start(now);
    source.stop(now + 0.06);
  }
}
