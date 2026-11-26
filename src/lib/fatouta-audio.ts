/**
 * Fatouta soundtrack — plays extracted_audio.aac once (no loop).
 */

const TRACK_SRC = '/audio/extracted_audio.aac';

export class FatoutaAudio {
  private audio: HTMLAudioElement | null = null;
  private playing = false;
  private onEndedCb: (() => void) | null = null;

  get isPlaying(): boolean {
    return this.playing;
  }

  private ensureAudio(): HTMLAudioElement {
    if (!this.audio) {
      this.audio = new Audio(TRACK_SRC);
      this.audio.preload = 'auto';
      this.audio.loop = false;
      this.audio.addEventListener('ended', () => {
        this.playing = false;
        this.onEndedCb?.();
      });
      this.audio.addEventListener('error', () => {
        this.playing = false;
        this.onEndedCb?.();
      });
    }
    return this.audio;
  }

  /** Optional callback when the track finishes (animation can keep running). */
  onEnded(cb: (() => void) | null): void {
    this.onEndedCb = cb;
  }

  /** Play extracted_audio.aac once (call inside a user gesture). */
  start(): void {
    const el = this.ensureAudio();
    el.pause();
    el.loop = false;
    el.currentTime = 0;
    el.volume = 1;
    this.playing = true;
    void el.play().catch(() => {
      this.playing = false;
      this.onEndedCb?.();
    });
  }

  stop(): void {
    this.playing = false;
    if (this.audio) {
      this.audio.pause();
      try {
        this.audio.currentTime = 0;
      } catch {
        // ignore
      }
      this.audio.loop = false;
    }
  }
}
