/**
 * Audio Manager for MindSweeper Extension
 * 
 * Singleton pattern audio system that handles:
 * - Sound effect playback with graceful fallback
 * - Volume and mute controls
 * - Persistent settings sync
 * - Autoplay policy error handling
 * - Chrome extension compatibility
 */

export type SoundName = 'reveal' | 'flag' | 'win' | 'loss';

/**
 * AudioManager singleton class
 * Manages all audio playback and settings
 */
class AudioManager {
  private sounds: Map<SoundName, HTMLAudioElement> = new Map();
  private muted: boolean = false;
  private volume: number = 0.5;
  private initialized: boolean = false;

  /**
   * Preload all audio files
   * Call this early to avoid delays on first play
   */
  async preload(): Promise<void> {
    if (this.initialized) {
      return;
    }

    const soundFiles: Record<SoundName, string> = {
      reveal: 'sounds/reveal.wav',
      flag: 'sounds/flag.wav',
      win: 'sounds/win.wav',
      loss: 'sounds/loss.wav',
    };

    try {
      // Determine the base path for audio files
      const basePath = this.getBasePath();

      for (const [name, file] of Object.entries(soundFiles) as [SoundName, string][]) {
        try {
          const audio = new Audio();
          audio.src = `${basePath}/${file}`;
          audio.volume = this.volume;
          audio.preload = 'auto';
          
          // Wait for audio to be loadable (but don't block on errors)
          await new Promise<void>((resolve) => {
            const onLoad = () => {
              audio.removeEventListener('canplaythrough', onLoad);
              audio.removeEventListener('error', onError);
              resolve();
            };
            const onError = (e: Event) => {
              console.warn(`Failed to preload audio: ${name}`, e);
              audio.removeEventListener('canplaythrough', onLoad);
              audio.removeEventListener('error', onError);
              resolve(); // Resolve anyway, we'll handle errors at play time
            };
            
            audio.addEventListener('canplaythrough', onLoad, { once: true });
            audio.addEventListener('error', onError, { once: true });
            
            // Timeout after 2 seconds
            setTimeout(() => {
              audio.removeEventListener('canplaythrough', onLoad);
              audio.removeEventListener('error', onError);
              resolve();
            }, 2000);
          });

          this.sounds.set(name, audio);
        } catch (error) {
          console.warn(`Error creating audio for ${name}:`, error);
        }
      }

      this.initialized = true;
    } catch (error) {
      console.error('Failed to preload audio files:', error);
    }
  }

  /**
   * Get the base path for audio files
   * Handles both extension and standalone contexts
   */
  private getBasePath(): string {
    // Check if we're in a Chrome extension environment
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL) {
      // In extension context, use chrome.runtime.getURL for proper path resolution
      return chrome.runtime.getURL('');
    }
    
    // In standalone mode (e.g., index.html), use relative path
    return '';
  }

  /**
   * Play a sound effect
   * Handles autoplay policy errors gracefully
   */
  play(soundName: SoundName): void {
    if (this.muted) {
      return;
    }

    const audio = this.sounds.get(soundName);
    if (!audio) {
      console.warn(`Sound not found: ${soundName}`);
      return;
    }

    try {
      // Reset audio to start if it's already playing
      audio.currentTime = 0;
      audio.volume = this.volume;

      // Play returns a Promise that may reject due to autoplay policy
      const playPromise = audio.play();
      
      if (playPromise !== undefined) {
        playPromise.catch((error: Error) => {
          // Autoplay was prevented - this is expected and okay
          // Only log in development, don't show errors to users
          if (import.meta.env.DEV) {
            console.debug(`Audio autoplay blocked for ${soundName}:`, error.message);
          }
        });
      }
    } catch (error) {
      // Catch synchronous errors (e.g., Audio API not available)
      console.warn(`Failed to play sound ${soundName}:`, error);
    }
  }

  /**
   * Set the volume level (0.0 to 1.0)
   */
  setVolume(level: number): void {
    this.volume = Math.max(0, Math.min(1, level));
    
    // Update volume on all loaded audio elements
    for (const audio of this.sounds.values()) {
      audio.volume = this.volume;
    }
  }

  /**
   * Set muted state
   */
  setMuted(muted: boolean): void {
    this.muted = muted;
  }

  /**
   * Get current muted state
   */
  isMuted(): boolean {
    return this.muted;
  }

  /**
   * Get current volume level
   */
  getVolume(): number {
    return this.volume;
  }

  /**
   * Toggle mute state
   * Returns the new muted state
   */
  toggleMute(): boolean {
    this.muted = !this.muted;
    return this.muted;
  }
}

/**
 * Export singleton instance
 */
export const audioManager = new AudioManager();
