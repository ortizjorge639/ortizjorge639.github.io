export type SoundState = { enabled: boolean; error: string | null };

export class StudioAudio {
  private context?: AudioContext;
  private noise?: AudioBuffer;
  private enabled = false;
  private explicitlySet = false;
  private error: string | null = null;
  private lastDraw = 0;
  private lastHover = 0;
  private lastUI = -1;
  private listeners = new Set<(state: SoundState) => void>();

  subscribe(listener: (state: SoundState) => void) {
    this.listeners.add(listener);
    listener({ enabled: this.enabled, error: this.error });
    return () => { this.listeners.delete(listener); };
  }

  private notify() {
    this.listeners.forEach((listener) => listener({ enabled: this.enabled, error: this.error }));
  }

  private fail(error: unknown) {
    console.warn('Studio sound unavailable', error);
    this.enabled = false;
    this.error = 'Sound is unavailable in this browser. You can still draw.';
    this.notify();
  }

  setEnabled(enabled: boolean, explicit = true) {
    if (explicit) this.explicitlySet = true;
    this.enabled = enabled;
    this.error = null;
    if (enabled) {
      try {
        this.context ??= new AudioContext();
        void this.context.resume().catch((error: unknown) => this.fail(error));
      } catch (error) {
        this.fail(error);
        return;
      }
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

  playUI(hover = false) {
    if (!this.enabled || !this.context) return;
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
    oscillator.connect(gain).connect(this.context.destination);
    oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
    oscillator.start(now);
    oscillator.stop(now + 0.06);
  }

  draw(tool: 'pen' | 'paint' | 'eraser', pressure: number) {
    if (!this.enabled || !this.context) return;
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
    source.connect(filter).connect(gain).connect(this.context.destination);
    source.onended = () => { source.disconnect(); filter.disconnect(); gain.disconnect(); };
    source.start(now);
    source.stop(now + 0.06);
  }
}
