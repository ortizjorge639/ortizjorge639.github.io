export interface StoryPosition {
  time: number;
  total: number;
  index: number;
  offset: number;
  playing: boolean;
}

export class StoryClock {
  readonly starts: number[];
  readonly total: number;
  readonly durations: readonly number[];
  private time = 0;
  private playing = false;

  constructor(durations: readonly number[]) {
    if (!durations.length || durations.some(value => !Number.isFinite(value) || value <= 0)) {
      throw new Error('Story durations must be finite positive numbers.');
    }
    this.durations = durations;
    let total = 0;
    this.starts = durations.map(duration => { const start = total; total += duration; return start; });
    this.total = total;
  }

  position(): StoryPosition {
    let index = this.starts.findIndex((start, i) => this.time >= start && this.time < start + this.durations[i]);
    if (index < 0) index = this.durations.length - 1;
    return { time: this.time, total: this.total, index, offset: this.time - this.starts[index], playing: this.playing };
  }

  play() {
    if (this.time >= this.total) this.time = 0;
    this.playing = true;
  }
  pause() { this.playing = false; }
  seek(time: number) {
    if (!Number.isFinite(time)) throw new Error('Story position must be finite.');
    this.time = Math.max(0, Math.min(this.total, time));
    this.pause();
  }
  goTo(index: number) {
    if (!Number.isInteger(index)) throw new Error('Story scene index must be an integer.');
    this.seek(this.starts[Math.max(0, Math.min(this.starts.length - 1, index))]);
  }
  advance(seconds: number) {
    if (!Number.isFinite(seconds) || seconds < 0) throw new Error('Elapsed story time must be finite and nonnegative.');
    if (!this.playing) return;
    this.time = Math.min(this.total, this.time + seconds);
    if (this.time === this.total) this.pause();
  }
}
