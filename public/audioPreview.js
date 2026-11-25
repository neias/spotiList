/**
 * Real 30-Second Audio Preview & Crossfade Transition Deck.
 *
 * Resolves real 30s preview audio (Spotify / iTunes / Deezer) via /api/preview/resolve
 * and plays actual songs with smooth volume crossfading between consecutive tracks.
 */

export class CrossfadePreviewDeck {
  constructor(onStateChange = () => {}) {
    this.onStateChange = onStateChange;
    this.timers = [];
    this.audioEls = [];
    this.isPlaying = false;
    this.mode = 'idle';
    this.label = '';
    this.progress = 0;
    this.progressRaf = null;
    this.previewCache = new Map();
  }

  stop() {
    this.isPlaying = false;
    this.mode = 'idle';
    this.progress = 0;
    for (const id of this.timers) {
      clearInterval(id);
      clearTimeout(id);
    }
    this.timers = [];
    for (const el of this.audioEls) {
      try {
        el.pause();
        el.src = '';
      } catch {
        // ignore
      }
    }
    this.audioEls = [];
    if (this.progressRaf) {
      cancelAnimationFrame(this.progressRaf);
      this.progressRaf = null;
    }
    this.onStateChange({ isPlaying: false, mode: 'idle', label: '', progress: 0, embedUrl: null });
  }

  async resolvePreview(track) {
    if (track?.previewUrl && /^https?:\/\//i.test(track.previewUrl)) {
      return { previewUrl: track.previewUrl, source: 'spotify' };
    }
    const cacheKey = `${track?.id || ''}::${track?.name || ''}`;
    if (this.previewCache.has(cacheKey)) {
      return this.previewCache.get(cacheKey);
    }

    const params = new URLSearchParams({
      id: track?.id || '',
      track: track?.name || '',
      artist: track?.artists?.[0] || '',
    });
    try {
      const res = await fetch(`/api/preview/resolve?${params.toString()}`);
      const data = await res.json();
      if (data?.previewUrl) {
        track.previewUrl = data.previewUrl;
      }
      this.previewCache.set(cacheKey, data);
      return data;
    } catch {
      return { previewUrl: null, source: 'none' };
    }
  }

  startProgressLoop(durationMs) {
    const start = performance.now();
    const tick = () => {
      if (!this.isPlaying) return;
      const elapsed = performance.now() - start;
      this.progress = Math.min(1, elapsed / Math.max(1, durationMs));
      this.onStateChange({
        isPlaying: true,
        mode: this.mode,
        label: this.label,
        progress: this.progress,
      });
      if (this.progress < 1) {
        this.progressRaf = requestAnimationFrame(tick);
      } else {
        this.stop();
      }
    };
    this.progressRaf = requestAnimationFrame(tick);
  }

  /**
   * Plays the real 30-second song preview for a track.
   */
  async playSingle(track) {
    this.stop();
    this.isPlaying = true;
    this.mode = 'single';
    this.label = `Önizleme aranıyor: ${track.name}...`;
    this.onStateChange({ isPlaying: true, mode: 'single', label: this.label, progress: 0 });

    const resolved = await this.resolvePreview(track);
    if (!this.isPlaying) return;

    if (!resolved?.previewUrl) {
      if (resolved?.spotifyEmbedUrl) {
        this.label = `Spotify Oynatıcı: ${track.name} — ${(track.artists || []).join(', ')} (aşağıdan Play'e basın)`;
        this.onStateChange({
          isPlaying: true,
          mode: 'embed',
          label: this.label,
          progress: 0,
          embedUrl: resolved.spotifyEmbedUrl,
        });
        return;
      }
      this.label = `Önizleme bulunamadı: "${track.name}" (çevrimdışı veya katalog dışı)`;
      this.onStateChange({ isPlaying: true, mode: 'single', label: this.label, progress: 0, embedUrl: null });
      const tid = setTimeout(() => this.stop(), 3500);
      this.timers.push(tid);
      return;
    }

    const audio = new Audio(resolved.previewUrl);
    audio.volume = 0.9;
    this.audioEls.push(audio);

    this.label = `▶ ${track.name} — ${(track.artists || []).join(', ')} (${track.effectiveBpm ?? track.bpm} BPM • ${resolved.source.toUpperCase()} 30sn)`;
    try {
      await audio.play();
      this.startProgressLoop(30000);
      audio.addEventListener('ended', () => this.stop(), { once: true });
    } catch {
      this.label = `Tarayıcı ses oynatmayı engelledi — tekrar tıklayın.`;
      this.onStateChange({ isPlaying: true, mode: 'single', label: this.label, progress: 0 });
    }
  }

  /**
   * Plays a real audio crossfade between Track A (last portion or first 10s) and Track B.
   */
  async playCrossfade(trackA, trackB, crossfadeSec = 4) {
    this.stop();
    if (!trackA || !trackB) return;

    this.isPlaying = true;
    this.mode = 'crossfade';
    this.label = `Crossfade hazırlanıyor: ${trackA.name} → ${trackB.name}...`;
    this.onStateChange({ isPlaying: true, mode: 'crossfade', label: this.label, progress: 0 });

    const [resA, resB] = await Promise.all([this.resolvePreview(trackA), this.resolvePreview(trackB)]);
    if (!this.isPlaying) return;

    if (!resA?.previewUrl || !resB?.previewUrl) {
      this.label = `Crossfade için her iki parçanın da 30sn önizlemesi gerekli (${!resA?.previewUrl ? trackA.name : trackB.name} bulunamadı).`;
      this.onStateChange({ isPlaying: true, mode: 'crossfade', label: this.label, progress: 0 });
      const tid = setTimeout(() => this.stop(), 4000);
      this.timers.push(tid);
      return;
    }

    const leadSec = 6;
    const tailSec = 7;
    const totalSec = leadSec + crossfadeSec + tailSec;

    const audioA = new Audio(resA.previewUrl);
    const audioB = new Audio(resB.previewUrl);
    audioA.volume = 0.9;
    audioB.volume = 0.0;
    this.audioEls.push(audioA, audioB);

    this.label = `⇄ Crossfade (${crossfadeSec}sn): ${trackA.name} [${trackA.effectiveBpm ?? trackA.bpm} BPM] → ${trackB.name} [${trackB.effectiveBpm ?? trackB.bpm} BPM]`;

    try {
      await audioA.play();
      this.startProgressLoop(totalSec * 1000);

      const startFadeTimer = setTimeout(async () => {
        if (!this.isPlaying) return;
        try {
          await audioB.play();
        } catch {
          return;
        }
        const steps = 24;
        const intervalMs = (crossfadeSec * 1000) / steps;
        let step = 0;
        const fadeInterval = setInterval(() => {
          step += 1;
          const ratio = Math.min(1, step / steps);
          audioA.volume = Math.max(0, 0.9 * (1 - ratio));
          audioB.volume = Math.min(0.9, 0.9 * ratio);
          if (step >= steps) {
            clearInterval(fadeInterval);
            audioA.pause();
          }
        }, intervalMs);
        this.timers.push(fadeInterval);
      }, leadSec * 1000);

      const endTimer = setTimeout(() => this.stop(), totalSec * 1000);
      this.timers.push(startFadeTimer, endTimer);
    } catch {
      this.label = 'Crossfade oynatılamadı — tarayıcı izinlerini kontrol edin.';
      this.onStateChange({ isPlaying: true, mode: 'crossfade', label: this.label, progress: 0 });
    }
  }
}
