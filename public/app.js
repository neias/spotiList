import { CrossfadePreviewDeck } from './audioPreview.js';

const I18N = {
  tr: {
    brandSub: 'Tempo Öncelikli • Ruh Hali Uyumlu Liste Stüdyosu',
    tabStudio: 'Stüdyo',
    tabAnalytics: 'Analiz & Harita',
    tabLibrary: 'Kütüphane',
    tabConnect: 'Spotify & Yükle',
    rule1Badge: '1. KURAL • EN ÖNEMLİ',
    tempoTitle: 'Tempo (BPM) Kontrolü',
    tempoCurveLabel: 'Tempo Eğrisi',
    targetBpmLabel: 'Hedef Tempo',
    bpmRangeLabel: 'BPM Aralığı (Min – Max)',
    toleranceLabel: 'Tempo Toleransı',
    tolStrict: '±3 Sıkı',
    tolBalanced: '±6 Dengeli',
    tolWide: '±12 Esnek',
    tempoWeightLabel: 'Tempo Öncelik Ağırlığı',
    harmonicTempoLabel: 'Yarı/Çift Tempo Eşleşmesine İzin Ver (70 ↔ 140 BPM)',
    rule2Badge: '2. KURAL • RUH HALİ',
    moodTitle: 'Hissettirdiği Ruh Hali',
    moodStrictnessLabel: 'Ruh Hali Sıkılığı',
    strictOff: 'Serbest',
    strictBalanced: 'Dengeli',
    strictHigh: 'Katı',
    customMoodToggle: 'İnce Duygu Ayarı (Valence / Enerji / Akustik)',
    enableCustomMood: 'Özel duygu hedeflerini aktif et',
    rule3Badge: 'KAYNAK ANALİZİ',
    sourcesTitle: 'Beğeni, Albüm & Çok Dinlenen',
    sourceFilterLabel: 'Kaynak Filtresi',
    srcAll: 'Tüm Kütüphane (Sevilen + Albüm + Çok Dinlenen)',
    srcLiked: 'Sadece Sevdiğim Parçalar',
    srcAlbum: 'Sadece Kaydettiğim Albümler',
    srcTop: 'Sadece Çok Dinlediklerim',
    trackCountLabel: 'Parça Sayısı',
    artistCooldownLabel: 'Sanatçı Aralığı',
    generateBtn: 'Tempo & Ruh Hali Listesi Oluştur',
    saveBtn: 'Listeyi Kaydet',
    pushSpotifyBtn: "Spotify'a Aktar",
    kpiAvgBpm: 'Ortalama Tempo',
    kpiSmoothness: 'Beat Geçiş Pürüzsüzlüğü',
    kpiMoodCohesion: 'Ruh Hali Uyumu',
    kpiDuration: 'Süre & Kaynak',
    curveChartTitle: 'Liste Tempo (BPM) & Ruh Hali Eğrisi',
    curveChartSub: 'Kesik çizgi hedef tempo eğrisini, yeşil çizgi seçilen parçaların BPM akışını gösterir.',
    generatedTracksTitle: 'Oluşturulan Müzik Listesi',
    thTrack: 'Parça & Sanatçı',
    thSources: 'Kaynaklar',
    thBpm: 'Tempo & ΔBPM',
    thMood: 'Ruh Hali',
    thScore: 'Skor Dağılımı',
    thActions: 'Sıra',
    savedPlaylistsTitle: 'Kayıtlı Listelerim',
    quadrantTitle: '2D Tempo (BPM) × Ruh Hali (Valence / Enerji) Haritası',
    quadrantSub: 'Tüm kütüphaneniz BPM ve duygusal pozitiflik ekseninde dağılır; beyaz çizgi aktif listenizin rotasını gösterir.',
    histogramTitle: 'Tempo (BPM) Dağılım Histogramı',
    histogramSub: 'Sevdiğiniz, albümden gelen ve çok dinlediğiniz parçaların BPM yoğunluğu.',
    moodBreakdownTitle: 'Kütüphane Ruh Hali Dağılımı',
    topArtistsTitle: 'En Çok Dinlenen Sanatçılar & Ortalama BPM',
    albumsTitle: 'Albüm Tempo Analizi',
  },
  en: {
    brandSub: 'Tempo-First • Mood-Cohesive Playlist Studio',
    tabStudio: 'Studio',
    tabAnalytics: 'Analytics & Map',
    tabLibrary: 'Library',
    tabConnect: 'Spotify & Import',
    rule1Badge: 'RULE #1 • PRIMARY',
    tempoTitle: 'Tempo (BPM) Control',
    tempoCurveLabel: 'Tempo Progression Curve',
    targetBpmLabel: 'Target Tempo',
    bpmRangeLabel: 'BPM Range (Min – Max)',
    toleranceLabel: 'Tempo Tolerance',
    tolStrict: '±3 Strict',
    tolBalanced: '±6 Balanced',
    tolWide: '±12 Flexible',
    tempoWeightLabel: 'Tempo Priority Weight',
    harmonicTempoLabel: 'Allow Half/Double-Time Tempo (70 ↔ 140 BPM)',
    rule2Badge: 'RULE #2 • MOOD',
    moodTitle: 'Mood & Emotional Feel',
    moodStrictnessLabel: 'Mood Strictness',
    strictOff: 'Open',
    strictBalanced: 'Balanced',
    strictHigh: 'Strict',
    customMoodToggle: 'Fine-Tune Emotion (Valence / Energy / Acoustic)',
    enableCustomMood: 'Enable custom emotion targets',
    rule3Badge: 'SOURCE SIGNALS',
    sourcesTitle: 'Liked, Albums & Most Listened',
    sourceFilterLabel: 'Source Filter',
    srcAll: 'All Sources (Liked + Albums + Top)',
    srcLiked: 'Liked Tracks Only',
    srcAlbum: 'Saved Albums Only',
    srcTop: 'Most Listened Only',
    trackCountLabel: 'Track Count',
    artistCooldownLabel: 'Artist Cooldown',
    generateBtn: 'Generate Tempo & Mood Playlist',
    saveBtn: 'Save Playlist',
    pushSpotifyBtn: 'Export to Spotify',
    kpiAvgBpm: 'Average Tempo',
    kpiSmoothness: 'Beat-Match Smoothness',
    kpiMoodCohesion: 'Mood Cohesion',
    kpiDuration: 'Duration & Sources',
    curveChartTitle: 'Playlist Tempo (BPM) & Mood Curve',
    curveChartSub: 'Dashed amber line shows target tempo curve; green line tracks actual BPM progression.',
    generatedTracksTitle: 'Generated Playlist',
    thTrack: 'Track & Artist',
    thSources: 'Sources',
    thBpm: 'Tempo & ΔBPM',
    thMood: 'Mood',
    thScore: 'Score Mix',
    thActions: 'Order',
    savedPlaylistsTitle: 'Saved Playlists',
    quadrantTitle: '2D Tempo (BPM) × Mood (Valence) Quadrant Map',
    quadrantSub: 'Library plotted by BPM vs. positivity; white path traces your active playlist.',
    histogramTitle: 'Tempo (BPM) Distribution Histogram',
    histogramSub: 'BPM concentration across liked tracks, saved albums, and top plays.',
    moodBreakdownTitle: 'Library Mood Breakdown',
    topArtistsTitle: 'Top Artists & Average BPM',
    albumsTitle: 'Saved Album Tempo Insights',
  },
};

const state = {
  lang: 'tr',
  meta: { moods: [], tempoCurves: [], genres: [], scenarios: [] },
  activeScenarioId: null,
  libraryMode: 'empty',
  tracks: [],
  albums: [],
  analytics: null,
  listeningCalendar: null,
  savedPlaylists: [],
  generated: null,
  showPlaylistPath: true,
  config: {
    tempoCurve: 'steady',
    targetBpm: 122,
    minBpm: 95,
    maxBpm: 135,
    toleranceBpm: 6,
    tempoWeight: 0.65,
    allowHarmonicTempo: false,
    preferHarmonicKeys: true,
    discoveryRatio: 0,
    discoverySeedSource: 'mixed',
    discoveryPlacement: 'interleaved',
    discoveryTempoFlex: 0,
    includeGenres: [],
    excludeGenres: [],
    languageMode: 'auto',
    vocalMode: 'all',
    sonicCohesion: true,
    selectionMode: 'count',
    targetDurationMinutes: 45,
    moodIds: ['groove'],
    moodStrictness: 'balanced',
    useCustomMood: false,
    customMood: { valence: 0.65, energy: 0.72, danceability: 0.70, acousticness: 0.15 },
    sourceFilter: 'all',
    sourceWeights: { liked: 1.0, album: 0.9, top: 1.2 },
    trackCount: 14,
    artistCooldown: 2,
    varietySeed: 0,
  },
  editingTrackId: null,
  tapTimestamps: [],
};

const previewDeck = new CrossfadePreviewDeck(({ isPlaying, label, progress, embedUrl }) => {
  const bar = $('previewDeckBar');
  const stopBtn = $('stopDeckBtn');
  const embedHost = $('spotifyEmbedHost');
  const progWrap = $('previewDeckProgressWrap');
  if (!bar) return;
  bar.classList.toggle('hidden', !isPlaying);
  stopBtn.classList.toggle('hidden', !isPlaying);
  $('previewDeckLabel').textContent = label || '';
  $('previewDeckProgress').style.width = `${Math.round((progress || 0) * 100)}%`;

  if (embedUrl) {
    progWrap.classList.add('hidden');
    embedHost.classList.remove('hidden');
    if (embedHost.dataset.url !== embedUrl) {
      embedHost.dataset.url = embedUrl;
      embedHost.innerHTML = `<iframe style="border-radius:10px;border:0;width:100%;height:80px;" src="${embedUrl}" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>`;
    }
  } else {
    progWrap.classList.remove('hidden');
    embedHost.classList.add('hidden');
    embedHost.dataset.url = '';
    embedHost.innerHTML = '';
  }
});

const $ = (id) => document.getElementById(id);

function showToast(msg) {
  const el = $('toast');
  el.textContent = msg;
  el.classList.remove('hidden');
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => el.classList.add('hidden'), 3200);
}

async function api(path, options = {}) {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return data;
}

function formatDuration(ms) {
  const totalSec = Math.round((Number(ms) || 0) / 1000);
  const mins = Math.floor(totalSec / 60);
  const secs = totalSec % 60;
  return `${mins} dk ${secs.toString().padStart(2, '0')} sn`;
}

function moodLabel(moodId) {
  const m = state.meta.moods.find((x) => x.id === moodId);
  if (!m) return moodId;
  return state.lang === 'tr' ? m.labelTr : m.labelEn;
}

function moodColor(moodId) {
  return state.meta.moods.find((x) => x.id === moodId)?.color || '#38bdf8';
}

function applyTranslations() {
  const dict = I18N[state.lang];
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    if (dict[key]) el.textContent = dict[key];
  });
  $('langToggle').textContent = state.lang.toUpperCase();
  renderScenarioPresets();
  renderCurveSelector();
  renderMoodGrid();
  renderGenreChips();
  if (state.generated) renderGeneratedPlaylist();
  if (state.analytics) renderAnalytics();
  if (state.listeningCalendar) renderListeningCalendar();
}

function renderGenreChips() {
  const host = $('genreChipsGrid');
  if (!host) return;
  host.innerHTML = '';
  for (const g of state.meta.genres || []) {
    const isInc = state.config.includeGenres.includes(g.id);
    const isExc = state.config.excludeGenres.includes(g.id);
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `genre-chip ${isInc ? 'include' : isExc ? 'exclude' : ''}`;
    const prefix = isInc ? '✓ ' : isExc ? '✕ ' : '';
    btn.textContent = `${prefix}${state.lang === 'tr' ? g.labelTr : g.labelEn}`;
    btn.addEventListener('click', () => {
      if (isInc) {
        state.config.includeGenres = state.config.includeGenres.filter((x) => x !== g.id);
        state.config.excludeGenres.push(g.id);
      } else if (isExc) {
        state.config.excludeGenres = state.config.excludeGenres.filter((x) => x !== g.id);
      } else {
        state.config.includeGenres.push(g.id);
      }
      renderGenreChips();
      runGenerate();
    });
    host.appendChild(btn);
  }
}

function renderScenarioPresets() {
  const host = $('scenarioPresetsGrid');
  if (!host) return;
  host.innerHTML = '';
  const list = state.meta.scenarios || [];
  if (list.length === 0) {
    host.innerHTML = '<p class="muted">Hiç şablon yok. "+ Mevcut Ayarı Şablon Ekle" ile kendi şablonunuzu oluşturabilirsiniz.</p>';
    return;
  }
  for (const sc of list) {
    const btn = document.createElement('div');
    btn.className = `scenario-btn ${state.activeScenarioId === sc.id ? 'active' : ''}`;
    btn.setAttribute('role', 'button');
    btn.tabIndex = 0;
    btn.innerHTML = `
      <span class="stitle">${escapeHtml(sc.icon || '🎵')} ${escapeHtml(state.lang === 'tr' ? sc.labelTr : sc.labelEn)}</span>
      <span class="sdesc">${escapeHtml(state.lang === 'tr' ? sc.descTr : sc.descEn)}</span>
      <button type="button" class="scenario-del" data-del-sc="${escapeHtml(sc.id)}" title="Şablonu sil">✕</button>
    `;
    btn.addEventListener('click', (e) => {
      if (e.target.closest('[data-del-sc]')) return;
      applyScenarioPreset(sc);
    });
    btn.querySelector('[data-del-sc]').addEventListener('click', async (e) => {
      e.stopPropagation();
      const res = await api(`/api/scenarios/${encodeURIComponent(sc.id)}`, { method: 'DELETE' });
      state.meta.scenarios = res.scenarios || [];
      if (state.activeScenarioId === sc.id) state.activeScenarioId = null;
      renderScenarioPresets();
      showToast(`Şablon silindi: ${sc.labelTr}`);
    });
    host.appendChild(btn);
  }
}

function applyScenarioPreset(sc) {
  state.activeScenarioId = sc.id;
  Object.assign(state.config, sc.config);

  const isSteady = state.config.tempoCurve === 'steady';
  $('steadyBpmControls').classList.toggle('hidden', !isSteady);
  $('rangeBpmControls').classList.toggle('hidden', isSteady);
  $('targetBpm').value = state.config.targetBpm;
  $('targetBpmVal').textContent = state.config.targetBpm;
  $('minBpm').value = state.config.minBpm;
  $('minBpmVal').textContent = state.config.minBpm;
  $('maxBpm').value = state.config.maxBpm;
  $('maxBpmVal').textContent = state.config.maxBpm;
  $('tempoWeight').value = Math.round(state.config.tempoWeight * 100);
  $('preferHarmonicKeys').checked = Boolean(state.config.preferHarmonicKeys);
  $('discoveryRatio').value = Math.round((state.config.discoveryRatio || 0) * 100);
  $('discoveryRatioVal').textContent = Math.round((state.config.discoveryRatio || 0) * 100);
  $('targetDurationMinutes').value = state.config.targetDurationMinutes || 45;

  const isDur = state.config.selectionMode === 'duration';
  $('trackCountWrap').classList.toggle('hidden', isDur);
  $('durationWrap').classList.toggle('hidden', !isDur);
  $('selectionModeGroup').querySelectorAll('button').forEach((b) => {
    b.classList.toggle('active', b.dataset.selmode === state.config.selectionMode);
  });

  $('toleranceGroup').querySelectorAll('button').forEach((b) => {
    b.classList.toggle('active', Number(b.dataset.tol) === state.config.toleranceBpm);
  });

  updatePriorityBar();
  renderScenarioPresets();
  renderCurveSelector();
  renderMoodGrid();
  runGenerate();
  showToast(`Şablon uygulandı: ${sc.labelTr}`);
}

function renderCurveSelector() {
  const host = $('curveSelector');
  host.innerHTML = '';
  for (const curve of state.meta.tempoCurves) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `curve-btn ${state.config.tempoCurve === curve.id ? 'active' : ''}`;
    btn.innerHTML = `
      <span class="ctitle">${state.lang === 'tr' ? curve.labelTr : curve.labelEn}</span>
      <span class="cdesc">${state.lang === 'tr' ? curve.descTr : curve.descEn}</span>
    `;
    btn.addEventListener('click', () => {
      state.config.tempoCurve = curve.id;
      const isSteady = curve.id === 'steady';
      $('steadyBpmControls').classList.toggle('hidden', !isSteady);
      $('rangeBpmControls').classList.toggle('hidden', isSteady);
      renderCurveSelector();
      runGenerate();
    });
    host.appendChild(btn);
  }
}

function renderMoodGrid() {
  const host = $('moodGrid');
  host.innerHTML = '';
  const libMoodFilter = $('libMoodFilter');
  const currentLibMood = libMoodFilter.value || 'all';
  libMoodFilter.innerHTML = `<option value="all">${state.lang === 'tr' ? 'Tüm Ruh Halleri' : 'All Moods'}</option>`;

  for (const mood of state.meta.moods) {
    const active = state.config.moodIds.includes(mood.id);
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `mood-card ${active ? 'active' : ''}`;
    btn.style.setProperty('--mood-color', mood.color);
    btn.innerHTML = `
      <div class="mood-card-top">
        <span class="mood-dot" style="background:${mood.color}"></span>
        <span>${state.lang === 'tr' ? mood.labelTr : mood.labelEn}</span>
      </div>
      <small>${state.lang === 'tr' ? mood.descTr : mood.descEn}</small>
    `;
    btn.addEventListener('click', () => {
      const idx = state.config.moodIds.indexOf(mood.id);
      if (idx >= 0) {
        state.config.moodIds.splice(idx, 1);
      } else {
        state.config.moodIds.push(mood.id);
      }
      renderMoodGrid();
      runGenerate();
    });
    host.appendChild(btn);

    const opt = document.createElement('option');
    opt.value = mood.id;
    opt.textContent = state.lang === 'tr' ? mood.labelTr : mood.labelEn;
    libMoodFilter.appendChild(opt);
  }
  libMoodFilter.value = currentLibMood;
}

function updatePriorityBar() {
  const tw = Math.round(state.config.tempoWeight * 100);
  const remain = 100 - tw;
  const mw = Math.round(remain * 0.72);
  const aw = remain - mw;
  $('tempoWeightVal').textContent = tw;
  $('priorityBar').innerHTML = `
    <span class="pb-tempo" style="width:${tw}%">Tempo ${tw}%</span>
    <span class="pb-mood" style="width:${mw}%">${state.lang === 'tr' ? 'Ruh Hali' : 'Mood'} ${mw}%</span>
    <span class="pb-aff" style="width:${aw}%">${aw}%</span>
  `;
}

function updateLibraryBadge() {
  const count = state.tracks.length;
  const avg = state.analytics?.summary?.avgBpm || 0;
  const emptyBanner = $('emptyLibraryBanner');
  if (emptyBanner) {
    emptyBanner.classList.toggle('hidden', count > 0);
  }
  if (count === 0) {
    $('libraryBadge').textContent = state.lang === 'tr' ? 'Kütüphane Boş' : 'Empty Library';
    return;
  }
  const modeMap = {
    demo: 'Demo',
    imported: state.lang === 'tr' ? 'İçe Aktarıldı' : 'Imported',
    spotify: 'Spotify',
  };
  $('libraryBadge').textContent = `${modeMap[state.libraryMode] || 'Kütüphane'} • ${count} ${
    state.lang === 'tr' ? 'Parça' : 'Tracks'
  } • ${avg} BPM`;
}

function buildGeneratePayload() {
  const c = state.config;
  const tw = c.tempoWeight;
  const remain = 1 - tw;
  const mw = Math.round(remain * 0.72 * 100) / 100;
  const aw = Math.max(0.02, Math.round((remain - mw) * 100) / 100);

  return {
    tempoCurve: c.tempoCurve,
    targetBpm: c.targetBpm,
    minBpm: c.tempoCurve === 'steady' ? c.targetBpm - c.toleranceBpm : c.minBpm,
    maxBpm: c.tempoCurve === 'steady' ? c.targetBpm + c.toleranceBpm : c.maxBpm,
    toleranceBpm: c.toleranceBpm,
    tempoWeight: tw,
    moodWeight: mw,
    affinityWeight: aw,
    allowHarmonicTempo: c.allowHarmonicTempo,
    preferHarmonicKeys: c.preferHarmonicKeys,
    discoveryRatio: c.discoveryRatio,
    discoverySeedSource: c.discoverySeedSource,
    discoveryPlacement: c.discoveryPlacement,
    discoveryTempoFlex: c.discoveryTempoFlex,
    includeGenres: c.includeGenres,
    excludeGenres: c.excludeGenres,
    languageMode: c.languageMode,
    vocalMode: c.vocalMode,
    sonicCohesion: c.sonicCohesion,
    selectionMode: c.selectionMode,
    targetDurationMinutes: c.targetDurationMinutes,
    moodIds: c.moodIds,
    moodStrictness: c.moodStrictness,
    customMood: c.useCustomMood ? c.customMood : null,
    sourceFilter: c.sourceFilter,
    sourceWeights: c.sourceWeights,
    trackCount: c.trackCount,
    artistCooldown: c.artistCooldown,
    varietySeed: c.varietySeed || 0,
  };
}

async function runGenerate({ excludeCurrent = false } = {}) {
  try {
    const payload = buildGeneratePayload();
    if (excludeCurrent && state.generated?.tracks?.length) {
      payload.excludeTrackIds = state.generated.tracks.map((t) => t.id);
    }
    state.generated = await api('/api/playlists/generate', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    const moodTitle =
      state.config.moodIds.length > 0
        ? state.config.moodIds.map(moodLabel).slice(0, 2).join(' + ')
        : state.lang === 'tr'
          ? 'Serbest Ruh Hali'
          : 'Open Mood';

    const bpmTitle =
      state.config.tempoCurve === 'steady'
        ? `${state.config.targetBpm} BPM`
        : `${state.config.minBpm}–${state.config.maxBpm} BPM`;

    $('playlistNameInput').value = `${bpmTitle} • ${moodTitle}`;
    renderGeneratedPlaylist();
    if (state.analytics) renderQuadrantChart();
  } catch (err) {
    showToast(err.message);
  }
}

function renderGeneratedPlaylist() {
  const gen = state.generated;
  if (!gen) return;
  const m = gen.metrics;

  $('kpiAvgBpm').textContent = m.trackCount ? `${m.avgBpm} BPM` : '—';
  $('kpiBpmRange').textContent = m.trackCount ? `${m.minBpm} – ${m.maxBpm} BPM (σ=${m.bpmStdDev})` : '—';
  $('kpiSmoothness').textContent = m.trackCount ? `${m.beatMatchSmoothness}%` : '—';
  $('kpiMaxJump').textContent = m.trackCount
    ? `Ort Δ ${m.avgStepJumpBpm} • Maks Δ ${m.maxStepJumpBpm} BPM`
    : '—';
  $('kpiMoodCohesion').textContent = m.trackCount ? `${m.moodCohesion}%` : '—';
  $('kpiPoolInfo').textContent = `Camelot Uyum: ${m.harmonicCompatibility ?? 100}% • Havuz: ${gen.candidatePoolCount}`;
  $('kpiDuration').textContent = m.trackCount
    ? `${m.trackCount} parça • ${formatDuration(m.totalDurationMs)}`
    : '0 parça';
  $('kpiSources').textContent = `♥ ${m.sourceBreakdown.liked}  •  💿 ${m.sourceBreakdown.album}  •  🔥 ${m.sourceBreakdown.top}${m.sourceBreakdown.discovery ? `  •  ✨ ${m.sourceBreakdown.discovery}` : ''}`;

  const warn = $('poolWarning');
  if (state.config.selectionMode === 'count' && gen.tracks.length < state.config.trackCount) {
    warn.textContent =
      state.lang === 'tr'
        ? `Tempo kuralına uyan ${gen.tracks.length} parça bulundu (toleransı genişletebilirsiniz).`
        : `Found ${gen.tracks.length} tracks within strict tempo gate.`;
    warn.classList.remove('hidden');
  } else {
    warn.classList.add('hidden');
  }

  renderCurveChart(gen);

  const tbody = $('playlistTracksBody');
  tbody.innerHTML = '';

  gen.tracks.forEach((t, idx) => {
    const tr = document.createElement('tr');
    const deltaText = idx === 0 ? 'Başlangıç' : `${t.deltaBpmFromPrev >= 0 ? '+' : ''}${t.deltaBpmFromPrev}`;
    const mColor = moodColor(t.matchedMood === 'custom' ? t.primaryMood : t.matchedMood);
    const mText = moodLabel(t.matchedMood === 'custom' ? t.primaryMood : t.matchedMood);

    const wT = Math.round((t.scores?.tempo || 0) * 100);
    const wM = Math.round((t.scores?.mood || 0) * 100);
    const wA = Math.round((t.scores?.affinity || 0) * 100);
    const isClash = t.harmonicTransition === 'clash';
    const hasNext = idx < gen.tracks.length - 1;

    tr.innerHTML = `
      <td><strong>${idx + 1}</strong></td>
      <td>
        <div class="track-main">
          <span class="track-title">${escapeHtml(t.name)}</span>
          <span class="track-artist">${escapeHtml((t.artists || []).join(', '))}${t.albumName ? ` • ${escapeHtml(t.albumName)}` : ''}</span>
        </div>
      </td>
      <td>
        <div class="src-badges">
          ${t.isDiscovery ? `<span class="badge badge-discovery">✨ Keşif</span><button class="icon-btn" data-add-disc="${idx}" title="Kütüphaneye ekle">+Ekle</button>` : ''}
          ${t.isLiked ? '<span class="badge badge-liked">♥ Sevilen</span>' : ''}
          ${t.fromAlbum ? '<span class="badge badge-album">💿 Albüm</span>' : ''}
          ${!t.isDiscovery && (t.playCount > 0 || t.topRank) ? `<span class="badge badge-top">🔥 ${t.topRank ? `#${t.topRank}` : `${t.playCount}x`}</span>` : ''}
        </div>
      </td>
      <td>
        <div class="bpm-cell">
          <span class="bpm-pill">${t.effectiveBpm ?? t.bpm} BPM${t.harmonicMatched ? ` (${t.harmonicRatio}x)` : ''}</span>
          <span class="delta-pill">${deltaText}</span>
        </div>
      </td>
      <td>
        <span class="camelot-pill ${isClash ? 'clash' : ''}" title="Geçiş: ${t.harmonicTransition || 'start'}">${t.camelotCode || '—'} ${t.keyLabel && t.keyLabel !== '—' ? `• ${t.keyLabel}` : ''}</span>
      </td>
      <td>
        <span class="badge" style="border-color:${mColor}; color:${mColor}">${mText}</span>
      </td>
      <td>
        <div class="score-mini">
          <span>T:${wT} • R:${wM} • K:${wA}</span>
          <div class="score-track">
            <span style="width:${Math.max(4, wT * 0.65)}%; background:#16a34a"></span>
            <span style="width:${Math.max(4, wM * 0.25)}%; background:#0284c7"></span>
            <span style="width:${Math.max(4, wA * 0.10)}%; background:#d97706"></span>
          </div>
        </div>
      </td>
      <td>
        <div class="slot-actions">
          <button class="icon-btn" data-preview="${idx}" title="Ön Dinle (Gerçek Müzik)">▶</button>
          ${hasNext ? `<button class="icon-btn" data-crossfade="${idx}" title="Sonrakiyle Crossfade Geçişini Test Et">⇄</button>` : ''}
          <button class="icon-btn" data-swap="${idx}" title="Bu parçayı benzeriyle değiştir">↻</button>
          <button class="icon-btn" data-move="up" data-idx="${idx}" title="Yukarı">↑</button>
          <button class="icon-btn" data-move="down" data-idx="${idx}" title="Aşağı">↓</button>
          <button class="icon-btn" data-move="del" data-idx="${idx}" title="Çıkar">✕</button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });

  tbody.querySelectorAll('[data-move]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const idx = Number(btn.getAttribute('data-idx'));
      const action = btn.getAttribute('data-move');
      reorderGeneratedSlot(idx, action);
    });
  });

  tbody.querySelectorAll('[data-preview]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const idx = Number(btn.getAttribute('data-preview'));
      const t = state.generated?.tracks?.[idx];
      if (t) previewDeck.playSingle(t);
    });
  });

  tbody.querySelectorAll('[data-crossfade]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const idx = Number(btn.getAttribute('data-crossfade'));
      const list = state.generated?.tracks || [];
      const cfSec = Number($('crossfadeSeconds')?.value) || 4;
      if (list[idx] && list[idx + 1]) {
        previewDeck.playCrossfade(list[idx], list[idx + 1], cfSec);
      }
    });
  });

  tbody.querySelectorAll('[data-swap]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const idx = Number(btn.getAttribute('data-swap'));
      const list = state.generated?.tracks || [];
      if (!list[idx]) return;
      const payload = buildGeneratePayload();
      payload.trackCount = 3;
      payload.selectionMode = 'count';
      payload.excludeTrackIds = list.map((t) => t.id);
      payload.targetBpm = list[idx].effectiveBpm ?? list[idx].bpm;
      payload.varietySeed = (state.config.varietySeed || 0) + idx + 1;
      const alt = await api('/api/playlists/generate', { method: 'POST', body: JSON.stringify(payload) });
      const replacement = alt.tracks?.find((cand) => !list.some((x) => x.id === cand.id));
      if (!replacement) {
        return showToast('Bu BPM aralığında değiştirecek başka parça bulunamadı.');
      }
      list[idx] = replacement;
      reorderGeneratedSlot(idx, 'noop');
      showToast(`Parça değiştirildi: ${replacement.name}`);
    });
  });

  tbody.querySelectorAll('[data-add-disc]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const idx = Number(btn.getAttribute('data-add-disc'));
      const t = state.generated?.tracks?.[idx];
      if (!t) return;
      await api('/api/library/tracks', { method: 'POST', body: JSON.stringify(t) });
      t.isDiscovery = false;
      t.isLiked = true;
      await refreshLibrary();
      renderGeneratedPlaylist();
      showToast(`"${t.name}" kütüphanenize eklendi!`);
    });
  });
}

function reorderGeneratedSlot(idx, action) {
  const list = state.generated?.tracks;
  if (!list) return;
  if (action === 'up' && idx > 0) {
    [list[idx - 1], list[idx]] = [list[idx], list[idx - 1]];
  } else if (action === 'down' && idx < list.length - 1) {
    [list[idx + 1], list[idx]] = [list[idx], list[idx + 1]];
  } else if (action === 'del') {
    list.splice(idx, 1);
  }
  // Recompute delta BPM and metrics locally
  for (let i = 0; i < list.length; i += 1) {
    const cur = list[i].effectiveBpm ?? list[i].bpm;
    const prev = i > 0 ? (list[i - 1].effectiveBpm ?? list[i - 1].bpm) : cur;
    list[i].slotIndex = i;
    list[i].deltaBpmFromPrev = i === 0 ? 0 : Math.round((cur - prev) * 10) / 10;
  }
  const bpms = list.map((t) => t.effectiveBpm ?? t.bpm);
  if (bpms.length > 0) {
    const avg = bpms.reduce((s, b) => s + b, 0) / bpms.length;
    const jumps = list.slice(1).map((t) => Math.abs(t.deltaBpmFromPrev || 0));
    const avgJump = jumps.length ? jumps.reduce((s, j) => s + j, 0) / jumps.length : 0;
    state.generated.metrics.trackCount = list.length;
    state.generated.metrics.avgBpm = Math.round(avg * 10) / 10;
    state.generated.metrics.minBpm = Math.round(Math.min(...bpms) * 10) / 10;
    state.generated.metrics.maxBpm = Math.round(Math.max(...bpms) * 10) / 10;
    state.generated.metrics.avgStepJumpBpm = Math.round(avgJump * 10) / 10;
    state.generated.metrics.maxStepJumpBpm = jumps.length ? Math.round(Math.max(...jumps) * 10) / 10 : 0;
    state.generated.metrics.beatMatchSmoothness = Math.round(100 * Math.exp(-((avgJump / 12) ** 2)));
    state.generated.metrics.totalDurationMs = list.reduce((s, t) => s + (t.durationMs || 0), 0);
  }
  renderGeneratedPlaylist();
  if (state.analytics) renderQuadrantChart();
}

function renderCurveChart(gen) {
  const host = $('playlistCurveChart');
  const tracks = gen.tracks || [];
  if (tracks.length === 0) {
    host.innerHTML = '<p class="muted">Seçilen kriterlere uygun parça bulunamadı.</p>';
    return;
  }

  const W = 780;
  const H = 210;
  const padL = 44;
  const padR = 20;
  const padT = 18;
  const padB = 30;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;

  const allBpms = [
    ...tracks.map((t) => t.effectiveBpm ?? t.bpm),
    ...(gen.slotTargets || []).slice(0, tracks.length),
  ];
  const minY = Math.max(50, Math.floor(Math.min(...allBpms) - 10));
  const maxY = Math.min(200, Math.ceil(Math.max(...allBpms) + 10));
  const yOfBpm = (bpm) => padT + plotH - ((bpm - minY) / Math.max(1, maxY - minY)) * plotH;
  const xOfIdx = (i) => padL + (tracks.length === 1 ? plotW / 2 : (i / (tracks.length - 1)) * plotW);

  const actualPts = tracks.map((t, i) => `${xOfIdx(i)},${yOfBpm(t.effectiveBpm ?? t.bpm)}`).join(' ');
  const targetPts = tracks
    .map((t, i) => `${xOfIdx(i)},${yOfBpm(t.slotTargetBpm ?? gen.slotTargets?.[i] ?? t.bpm)}`)
    .join(' ');
  const energyPts = tracks
    .map((t, i) => `${xOfIdx(i)},${padT + plotH - (t.energy ?? 0.5) * plotH}`)
    .join(' ');

  const gridLines = [0, 0.5, 1]
    .map((ratio) => {
      const bpmLabel = Math.round(minY + ratio * (maxY - minY));
      const y = yOfBpm(bpmLabel);
      return `<line x1="${padL}" y1="${y}" x2="${W - padR}" y2="${y}" stroke="#253244" stroke-dasharray="3 3" />
              <text x="6" y="${y + 4}" fill="#8ea0b5" font-size="11">${bpmLabel}</text>`;
    })
    .join('');

  const nodes = tracks
    .map((t, i) => {
      const x = xOfIdx(i);
      const y = yOfBpm(t.effectiveBpm ?? t.bpm);
      return `<g>
        <circle cx="${x}" cy="${y}" r="5" fill="#1ed760" stroke="#0b0f14" stroke-width="2">
          <title>#${i + 1} ${escapeHtml(t.name)} — ${t.effectiveBpm ?? t.bpm} BPM</title>
        </circle>
        <text x="${x}" y="${H - 8}" text-anchor="middle" fill="#8ea0b5" font-size="10">${i + 1}</text>
      </g>`;
    })
    .join('');

  host.innerHTML = `
    <svg viewBox="0 0 ${W} ${H}" width="100%" height="${H}">
      ${gridLines}
      <polyline fill="none" stroke="#38bdf8" stroke-width="1.8" stroke-opacity="0.6" points="${energyPts}" />
      <polyline fill="none" stroke="#f59e0b" stroke-width="2" stroke-dasharray="6 4" points="${targetPts}" />
      <polyline fill="none" stroke="#1ed760" stroke-width="3" points="${actualPts}" />
      ${nodes}
    </svg>
  `;
}

function renderAnalytics() {
  const a = state.analytics;
  if (!a) return;
  renderQuadrantChart();
  renderHistogram(a.tempoHistogram || []);

  const moodHost = $('moodBreakdownList');
  moodHost.innerHTML = (a.moodDistribution || [])
    .map(
      (m) => `
      <div class="bar-row">
        <div class="bar-row-top">
          <span>${state.lang === 'tr' ? m.labelTr : m.labelEn}</span>
          <strong>${m.count} (${m.percent}%)</strong>
        </div>
        <div class="bar-track">
          <div class="bar-fill" style="width:${m.percent}%; background:${m.color}"></div>
        </div>
      </div>`
    )
    .join('');

  $('topArtistsList').innerHTML = (a.topArtists || [])
    .map(
      (ar) => `
      <div class="compact-row">
        <div><strong>${escapeHtml(ar.artist)}</strong> <span class="muted">(${ar.trackCount} parça)</span></div>
        <div><span class="bpm-pill">${ar.avgBpm} BPM</span></div>
      </div>`
    )
    .join('');

  $('albumInsightsList').innerHTML = (a.albumInsights || [])
    .map(
      (al) => `
      <div class="compact-row">
        <div><strong>${escapeHtml(al.albumName)}</strong> <span class="muted">• ${escapeHtml(al.artist)}</span></div>
        <div><span class="badge">${al.avgBpm} BPM (±${al.bpmSpan})</span></div>
      </div>`
    )
    .join('');
}

function renderQuadrantChart() {
  const host = $('quadrantChart');
  const points = state.analytics?.scatterPoints || [];
  if (!points.length) {
    host.innerHTML = '<p class="muted">Haritayı görmek için önce Spotify hesabınızı bağlayın veya demo kütüphaneyi yükleyin.</p>';
    return;
  }

  const W = 920;
  const H = 390;
  const padL = 62;
  const padR = 26;
  const padT = 28;
  const padB = 48;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;

  const xOf = (bpm) => padL + ((Math.max(58, Math.min(182, bpm)) - 58) / (182 - 58)) * plotW;
  const yOf = (val) => padT + plotH - Math.max(0, Math.min(1, val)) * plotH;

  const activeTracks = state.generated?.tracks || [];
  const activeMap = new Map(activeTracks.map((t, i) => [t.id, i + 1]));
  const pathPts = activeTracks.map((t) => `${xOf(t.effectiveBpm ?? t.bpm)},${yOf(t.valence ?? 0.5)}`).join(' ');

  const gridBpm = [70, 90, 110, 125, 140, 160, 175]
    .map((b) => {
      const x = xOf(b);
      return `<line x1="${x}" y1="${padT}" x2="${x}" y2="${H - padB}" stroke="#253244" stroke-dasharray="3 3" />
              <text x="${x}" y="${H - padB + 16}" text-anchor="middle" fill="#8ea0b5" font-size="11">${b}</text>`;
    })
    .join('');

  const gridY = [0, 0.25, 0.5, 0.75, 1]
    .map((v) => {
      const y = yOf(v);
      return `<line x1="${padL}" y1="${y}" x2="${W - padR}" y2="${y}" stroke="${v === 0.5 ? '#475569' : '#1e293b'}" stroke-dasharray="${v === 0.5 ? '5 4' : '2 3'}" />
              <text x="${padL - 8}" y="${y + 4}" text-anchor="end" fill="#8ea0b5" font-size="10">${Math.round(v * 100)}%</text>`;
    })
    .join('');

  const midX = xOf(115);
  const dots = points
    .map((p) => {
      const cx = xOf(p.bpm);
      const cy = yOf(p.valence);
      const slotNum = activeMap.get(p.id);
      const inList = Boolean(slotNum) && state.showPlaylistPath;
      const r = inList ? 9 : 4.5;
      return `<g>
        <circle cx="${cx}" cy="${cy}" r="${r}" fill="${p.moodColor}" fill-opacity="${inList ? 1 : 0.72}"
          stroke="${inList ? '#ffffff' : '#0b0f14'}" stroke-width="${inList ? 2.2 : 1}"
          data-tip="${slotNum ? `[Liste #${slotNum}] ` : ''}${escapeHtml(p.name)} — ${escapeHtml(p.artist)} (${p.bpm} BPM • Pozitiflik %${Math.round(p.valence * 100)} • ${moodLabel(p.primaryMood)})"></circle>
        ${inList ? `<text x="${cx}" y="${cy + 3.5}" text-anchor="middle" fill="#06110a" font-size="9.5" font-weight="800" pointer-events="none">${slotNum}</text>` : ''}
      </g>`;
    })
    .join('');

  host.innerHTML = `
    <svg viewBox="0 0 ${W} ${H}" width="100%" height="${H}">
      ${gridBpm}
      ${gridY}
      <line x1="${midX}" y1="${padT}" x2="${midX}" y2="${H - padB}" stroke="#475569" stroke-dasharray="5 4" />
      <text x="${padL + 8}" y="${padT + 14}" fill="#64748b" font-size="11" font-weight="600">Sakin &amp; Aydınlık (Düşük BPM, Yüksek Pozitiflik)</text>
      <text x="${W - padR - 8}" y="${padT + 14}" text-anchor="end" fill="#64748b" font-size="11" font-weight="600">Enerjik &amp; Mutlu (Yüksek BPM, Yüksek Pozitiflik)</text>
      <text x="${padL + 8}" y="${H - padB - 8}" fill="#64748b" font-size="11" font-weight="600">Melankolik &amp; Sakin (Düşük BPM, Düşük Pozitiflik)</text>
      <text x="${W - padR - 8}" y="${H - padB - 8}" text-anchor="end" fill="#64748b" font-size="11" font-weight="600">Karanlık &amp; Yoğun (Yüksek BPM, Düşük Pozitiflik)</text>
      <text x="${padL + plotW / 2}" y="${H - 8}" text-anchor="middle" fill="#cbd5e1" font-size="11.5" font-weight="700">TEMPO (BPM) — Yavaştan Hızlıya →</text>
      <text x="16" y="${padT + plotH / 2}" text-anchor="middle" fill="#cbd5e1" font-size="11.5" font-weight="700" transform="rotate(-90 16 ${padT + plotH / 2})">RUH HALİ POZİTİFLİĞİ (%) ↑</text>
      ${state.showPlaylistPath && activeTracks.length > 1 ? `<polyline fill="none" stroke="#ffffff" stroke-opacity="0.78" stroke-width="2" stroke-dasharray="6 4" points="${pathPts}" />` : ''}
      ${dots}
    </svg>
  `;

  host.querySelectorAll('circle[data-tip]').forEach((circle) => {
    circle.addEventListener('mouseenter', () => {
      $('quadrantTooltip').textContent = circle.getAttribute('data-tip');
    });
  });
}

function renderHistogram(buckets) {
  const host = $('tempoHistogramChart');
  const W = 460;
  const H = 220;
  const padL = 28;
  const padB = 28;
  const padT = 16;
  const maxVal = Math.max(1, ...buckets.map((b) => b.total));
  const barW = (W - padL - 10) / Math.max(1, buckets.length);

  const bars = buckets
    .map((b, i) => {
      const h = (b.total / maxVal) * (H - padB - padT);
      const x = padL + i * barW + 3;
      const y = H - padB - h;
      return `<g>
        <rect x="${x}" y="${y}" width="${Math.max(8, barW - 6)}" height="${h}" rx="4" fill="#1ed760" fill-opacity="0.82">
          <title>${b.label} BPM: ${b.total} parça (♥ ${b.liked}, 💿 ${b.album}, 🔥 ${b.top})</title>
        </rect>
        <text x="${x + (barW - 6) / 2}" y="${H - 10}" text-anchor="middle" fill="#8ea0b5" font-size="9">${b.min}</text>
      </g>`;
    })
    .join('');

  host.innerHTML = `<svg viewBox="0 0 ${W} ${H}" width="100%" height="${H}">${bars}</svg>`;
}

function renderLibraryTable() {
  const q = $('libSearch').value.trim().toLowerCase();
  const src = $('libSourceFilter').value;
  const mood = $('libMoodFilter').value;

  const filtered = state.tracks.filter((t) => {
    if (src === 'liked' && !t.isLiked) return false;
    if (src === 'album' && !t.fromAlbum) return false;
    if (src === 'top' && !(t.playCount > 0 || t.topRank)) return false;
    if (q) {
      const hay = `${t.name} ${(t.artists || []).join(' ')} ${t.albumName || ''}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    if (mood !== 'all') {
      const sp = state.analytics?.scatterPoints?.find((p) => p.id === t.id);
      if (sp && sp.primaryMood !== mood) return false;
    }
    return true;
  });

  const tbody = $('libraryTracksBody');
  tbody.innerHTML = filtered
    .slice(0, 150)
    .map((t) => {
      const sp = state.analytics?.scatterPoints?.find((p) => p.id === t.id);
      const pm = sp?.primaryMood || 'groove';
      return `
      <tr>
        <td>
          <div class="track-main">
            <span class="track-title">${escapeHtml(t.name)}</span>
            <span class="track-artist">${escapeHtml((t.artists || []).join(', '))}</span>
          </div>
        </td>
        <td>${escapeHtml(t.albumName || '—')}</td>
        <td>
          <div class="src-badges">
            ${t.isLiked ? '<span class="badge badge-liked">♥</span>' : ''}
            ${t.fromAlbum ? '<span class="badge badge-album">💿</span>' : ''}
            ${t.playCount > 0 ? `<span class="badge badge-top">🔥 ${t.playCount}</span>` : ''}
          </div>
        </td>
        <td><span class="bpm-pill">${Math.round(t.bpm * 10) / 10}</span></td>
        <td><span class="badge" style="color:${moodColor(pm)}">${moodLabel(pm)}</span></td>
        <td>${Math.round((t.valence ?? 0.5) * 100)}% / ${Math.round((t.energy ?? 0.5) * 100)}%</td>
        <td><span class="badge">${t.manualOverride ? 'Manuel' : t.featureSource}</span></td>
        <td><button class="icon-btn" data-edit-track="${escapeHtml(t.id)}">BPM Düzenle</button></td>
      </tr>`;
    })
    .join('');

  tbody.querySelectorAll('[data-edit-track]').forEach((btn) => {
    btn.addEventListener('click', () => openEditModal(btn.getAttribute('data-edit-track')));
  });
}

function renderSavedPlaylists() {
  $('savedCount').textContent = `${state.savedPlaylists.length} liste`;
  const host = $('savedPlaylistsGrid');
  if (state.savedPlaylists.length === 0) {
    host.innerHTML = '<p class="muted">Henüz kayıtlı liste yok. Yukarıdan oluşturup kaydedebilirsiniz.</p>';
    return;
  }

  host.innerHTML = state.savedPlaylists
    .map(
      (pl) => `
      <div class="saved-item">
        <div class="saved-item-title">${escapeHtml(pl.name)}</div>
        <div class="saved-item-meta">${pl.tracks?.length || 0} parça • Ort. ${pl.metrics?.avgBpm || '—'} BPM • Uyum ${pl.metrics?.moodCohesion || '—'}%</div>
        <div class="btn-row">
          <button class="btn btn-secondary btn-sm" data-load-pl="${pl.id}">Yükle</button>
          <a class="btn btn-ghost btn-sm" href="/api/playlists/${encodeURIComponent(pl.id)}/export?format=csv">CSV</a>
          <button class="btn btn-ghost btn-sm" data-del-pl="${pl.id}">Sil</button>
        </div>
      </div>`
    )
    .join('');

  host.querySelectorAll('[data-load-pl]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const pl = state.savedPlaylists.find((p) => p.id === btn.getAttribute('data-load-pl'));
      if (!pl) return;
      state.generated = {
        tracks: pl.tracks,
        metrics: pl.metrics,
        slotTargets: pl.tracks.map((t) => t.slotTargetBpm || t.bpm),
        candidatePoolCount: pl.tracks.length,
        tempoPoolCount: pl.tracks.length,
      };
      $('playlistNameInput').value = pl.name;
      renderGeneratedPlaylist();
    });
  });

  host.querySelectorAll('[data-del-pl]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      await api(`/api/playlists/${encodeURIComponent(btn.getAttribute('data-del-pl'))}`, { method: 'DELETE' });
      await refreshSavedPlaylists();
      showToast('Kayıtlı liste silindi.');
    });
  });
}

function openEditModal(trackId) {
  const t = state.tracks.find((x) => x.id === trackId);
  if (!t) return;
  state.editingTrackId = trackId;
  state.tapTimestamps = [];
  $('editModalTitle').textContent = `${t.name} — ${(t.artists || []).join(', ')}`;
  $('editBpm').value = Math.round(t.bpm * 10) / 10;
  $('editValence').value = Math.round((t.valence ?? 0.5) * 100);
  $('editEnergy').value = Math.round((t.energy ?? 0.5) * 100);
  $('editDance').value = Math.round((t.danceability ?? 0.5) * 100);
  $('editAcoustic').value = Math.round((t.acousticness ?? 0.2) * 100);
  $('editKey').value = Number.isInteger(t.musicalKey) ? String(t.musicalKey) : '';
  $('editMode').value = t.musicalMode === 0 || t.musicalMode === 1 ? String(t.musicalMode) : '';
  syncModalReadouts();
  $('editModal').classList.remove('hidden');
}

function syncModalReadouts() {
  $('editValenceRead').textContent = $('editValence').value;
  $('editEnergyRead').textContent = $('editEnergy').value;
  $('editDanceRead').textContent = $('editDance').value;
  $('editAcousticRead').textContent = $('editAcoustic').value;
}

function renderListeningCalendar() {
  const cal = state.listeningCalendar;
  const todHost = $('timeOfDayGrid');
  const gridHost = $('moodCalendarGrid');
  if (!cal || !todHost || !gridHost) return;

  $('calendarSummaryBadge').textContent = `${cal.totalEvents} dinleme • ${cal.totalMinutes} dk`;

  todHost.innerHTML = (cal.timeOfDay || [])
    .map((b) => {
      const moodName = b.dominantMood
        ? state.lang === 'tr'
          ? b.dominantMood.labelTr
          : b.dominantMood.labelEn
        : '—';
      return `
      <div class="tod-card">
        <div class="tod-title">${state.lang === 'tr' ? b.labelTr : b.labelEn}</div>
        <div class="tod-bpm">${b.avgBpm || '—'} BPM</div>
        <div><span class="badge" style="color:${b.moodColor}; border-color:${b.moodColor}">${moodName}</span></div>
        <div class="muted">${b.eventCount} parça • ${b.minutes} dk</div>
        ${
          b.avgBpm > 0
            ? `<button class="btn btn-secondary btn-sm" data-tod-bpm="${Math.round(b.avgBpm)}" data-tod-mood="${b.dominantMood?.id || ''}">Bu Saate Göre Liste Kur</button>`
            : ''
        }
      </div>`;
    })
    .join('');

  todHost.querySelectorAll('[data-tod-bpm]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const bpm = Number(btn.getAttribute('data-tod-bpm'));
      const moodId = btn.getAttribute('data-tod-mood');
      state.activeScenarioId = null;
      state.config.tempoCurve = 'steady';
      state.config.targetBpm = bpm;
      state.config.toleranceBpm = 8;
      state.config.moodIds = moodId ? [moodId] : [];
      $('steadyBpmControls').classList.remove('hidden');
      $('rangeBpmControls').classList.add('hidden');
      $('targetBpm').value = bpm;
      $('targetBpmVal').textContent = bpm;
      renderScenarioPresets();
      renderCurveSelector();
      renderMoodGrid();
      document.querySelector('.nav-tab[data-tab="studio"]').click();
      runGenerate();
      showToast(`Saat dilimi profili uygulandı: ${bpm} BPM`);
    });
  });

  gridHost.innerHTML = (cal.calendarDays || [])
    .map((d) => {
      const shortDate = d.date.slice(5);
      const mLabel = d.dominantMood ? d.dominantMood.labelTr : '—';
      return `
      <div class="cal-day" style="background:${d.moodColor}" title="${d.date}: ${mLabel} • Ort. ${d.avgBpm} BPM (${d.minutes} dk)">
        <span>${shortDate}</span>
        <small>${Math.round(d.avgBpm)}</small>
      </div>`;
    })
    .join('');
}

async function refreshLibrary() {
  const data = await api('/api/library');
  state.libraryMode = data.libraryMode;
  state.tracks = data.tracks;
  state.albums = data.albums;
  state.analytics = data.analytics;
  state.listeningCalendar = data.listeningCalendar || null;
  updateLibraryBadge();
  renderAnalytics();
  renderListeningCalendar();
  renderLibraryTable();
}

async function refreshSavedPlaylists() {
  const data = await api('/api/playlists');
  state.savedPlaylists = data.playlists || [];
  renderSavedPlaylists();
}

async function refreshSpotifyStatus() {
  const st = await api('/api/auth/spotify/status');
  $('spotifyClientId').value = st.clientId || '';
  $('spotifyRedirectUri').value = st.redirectUri || '';
  $('spotifyStatusBox').textContent = st.connected
    ? 'Spotify hesabına bağlı! "Kütüphaneyi Senkronize Et" ile sevdiğiniz parçaları, albümleri ve en çok dinlediklerinizi çekebilirsiniz.'
    : st.configured
      ? 'Client ID kayıtlı. Bağlanmak için "Spotify ile Giriş Yap" butonuna basın.'
      : 'Henüz Client ID girilmedi. İsterseniz sağdaki alandan Spotify Export JSON/CSV yükleyerek anında devam edebilirsiniz.';
}

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function bindEvents() {
  document.querySelectorAll('.nav-tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.nav-tab').forEach((t) => t.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach((p) => p.classList.remove('active'));
      tab.classList.add('active');
      $(`tab-${tab.getAttribute('data-tab')}`).classList.add('active');
    });
  });

  $('langToggle').addEventListener('click', () => {
    state.lang = state.lang === 'tr' ? 'en' : 'tr';
    applyTranslations();
  });

  $('targetBpm').addEventListener('input', (e) => {
    state.config.targetBpm = Number(e.target.value);
    $('targetBpmVal').textContent = state.config.targetBpm;
    document.querySelectorAll('.chip').forEach((c) => c.classList.toggle('active', Number(c.dataset.bpm) === state.config.targetBpm));
  });
  $('targetBpm').addEventListener('change', runGenerate);

  document.querySelectorAll('.chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      state.config.targetBpm = Number(chip.dataset.bpm);
      $('targetBpm').value = state.config.targetBpm;
      $('targetBpmVal').textContent = state.config.targetBpm;
      document.querySelectorAll('.chip').forEach((c) => c.classList.toggle('active', c === chip));
      runGenerate();
    });
  });

  $('minBpm').addEventListener('input', (e) => {
    state.config.minBpm = Math.min(Number(e.target.value), state.config.maxBpm - 5);
    e.target.value = state.config.minBpm;
    $('minBpmVal').textContent = state.config.minBpm;
  });
  $('minBpm').addEventListener('change', runGenerate);

  $('maxBpm').addEventListener('input', (e) => {
    state.config.maxBpm = Math.max(Number(e.target.value), state.config.minBpm + 5);
    e.target.value = state.config.maxBpm;
    $('maxBpmVal').textContent = state.config.maxBpm;
  });
  $('maxBpm').addEventListener('change', runGenerate);

  $('toleranceGroup').querySelectorAll('button').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.config.toleranceBpm = Number(btn.dataset.tol);
      $('toleranceGroup').querySelectorAll('button').forEach((b) => b.classList.toggle('active', b === btn));
      runGenerate();
    });
  });

  $('tempoWeight').addEventListener('input', (e) => {
    state.config.tempoWeight = Number(e.target.value) / 100;
    updatePriorityBar();
  });
  $('tempoWeight').addEventListener('change', runGenerate);

  $('allowHarmonicTempo').addEventListener('change', (e) => {
    state.config.allowHarmonicTempo = e.target.checked;
    runGenerate();
  });

  $('preferHarmonicKeys').addEventListener('change', (e) => {
    state.config.preferHarmonicKeys = e.target.checked;
    runGenerate();
  });

  $('selectionModeGroup').querySelectorAll('button').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.config.selectionMode = btn.dataset.selmode;
      const isDur = state.config.selectionMode === 'duration';
      $('trackCountWrap').classList.toggle('hidden', isDur);
      $('durationWrap').classList.toggle('hidden', !isDur);
      $('selectionModeGroup').querySelectorAll('button').forEach((b) => b.classList.toggle('active', b === btn));
      runGenerate();
    });
  });

  $('targetDurationMinutes').addEventListener('change', (e) => {
    state.config.targetDurationMinutes = Math.max(15, Math.min(180, Number(e.target.value) || 45));
    runGenerate();
  });

  $('discoveryRatio').addEventListener('input', (e) => {
    const pct = Number(e.target.value);
    state.config.discoveryRatio = pct / 100;
    $('discoveryRatioVal').textContent = pct;
  });
  $('discoveryRatio').addEventListener('change', runGenerate);

  $('discoverySeedSource').addEventListener('change', (e) => {
    state.config.discoverySeedSource = e.target.value;
    if (state.config.discoveryRatio > 0) runGenerate();
  });

  $('discoveryPlacement').addEventListener('change', (e) => {
    state.config.discoveryPlacement = e.target.value;
    if (state.config.discoveryRatio > 0) runGenerate();
  });

  $('discoveryTempoFlex').addEventListener('change', (e) => {
    state.config.discoveryTempoFlex = Number(e.target.value) || 0;
    if (state.config.discoveryRatio > 0) runGenerate();
  });

  $('languageMode').addEventListener('change', (e) => {
    state.config.languageMode = e.target.value;
    runGenerate();
  });

  $('vocalMode').addEventListener('change', (e) => {
    state.config.vocalMode = e.target.value;
    runGenerate();
  });

  $('sonicCohesion').addEventListener('change', (e) => {
    state.config.sonicCohesion = e.target.checked;
    runGenerate();
  });

  $('showPlaylistPathToggle').addEventListener('change', (e) => {
    state.showPlaylistPath = e.target.checked;
    renderQuadrantChart();
  });

  $('goConnectBtn').addEventListener('click', () => {
    document.querySelector('.nav-tab[data-tab="connect"]').click();
  });

  $('emptyLoadDemoBtn').addEventListener('click', async () => {
    await api('/api/library/load-demo', { method: 'POST' });
    await refreshLibrary();
    await runGenerate();
    showToast('96 parçalık demo kütüphane yüklendi.');
  });

  $('clearLibraryBtn').addEventListener('click', async () => {
    await api('/api/library/clear', { method: 'POST' });
    await refreshLibrary();
    await runGenerate();
    showToast('Kütüphane temizlendi.');
  });

  $('openAddScenarioBtn').addEventListener('click', () => {
    $('addScenarioForm').classList.toggle('hidden');
    $('newScenarioName').focus();
  });

  $('cancelNewScenarioBtn').addEventListener('click', () => {
    $('addScenarioForm').classList.add('hidden');
  });

  $('saveNewScenarioBtn').addEventListener('click', async () => {
    const name = $('newScenarioName').value.trim();
    if (!name) return showToast('Lütfen şablon adı girin.');
    const res = await api('/api/scenarios', {
      method: 'POST',
      body: JSON.stringify({
        icon: $('newScenarioIcon').value.trim() || '🎧',
        labelTr: name,
        descTr: $('newScenarioDesc').value.trim() || `${state.config.targetBpm} BPM • Özel Şablon`,
        config: { ...state.config },
      }),
    });
    state.meta.scenarios = res.scenarios || [];
    $('newScenarioName').value = '';
    $('newScenarioDesc').value = '';
    $('addScenarioForm').classList.add('hidden');
    renderScenarioPresets();
    showToast(`Yeni şablon eklendi: ${name}`);
  });

  $('resetScenariosBtn').addEventListener('click', async () => {
    const res = await api('/api/scenarios/reset', { method: 'POST' });
    state.meta.scenarios = res.scenarios || [];
    renderScenarioPresets();
    showToast('Varsayılan akıllı şablonlar geri yüklendi.');
  });

  $('stopDeckBtn').addEventListener('click', () => previewDeck.stop());

  $('moodStrictnessGroup').querySelectorAll('button').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.config.moodStrictness = btn.dataset.strict;
      $('moodStrictnessGroup').querySelectorAll('button').forEach((b) => b.classList.toggle('active', b === btn));
      runGenerate();
    });
  });

  $('useCustomMood').addEventListener('change', (e) => {
    state.config.useCustomMood = e.target.checked;
    runGenerate();
  });
  ['customValence', 'customEnergy', 'customDanceability', 'customAcousticness'].forEach((id) => {
    $(id).addEventListener('change', () => {
      state.config.customMood = {
        valence: Number($('customValence').value) / 100,
        energy: Number($('customEnergy').value) / 100,
        danceability: Number($('customDanceability').value) / 100,
        acousticness: Number($('customAcousticness').value) / 100,
      };
      if (state.config.useCustomMood) runGenerate();
    });
  });

  $('sourceFilter').addEventListener('change', (e) => {
    state.config.sourceFilter = e.target.value;
    runGenerate();
  });

  [
    ['wLiked', 'wLikedVal', 'liked'],
    ['wAlbum', 'wAlbumVal', 'album'],
    ['wTop', 'wTopVal', 'top'],
  ].forEach(([id, labelId, key]) => {
    $(id).addEventListener('input', (e) => {
      const val = Number(e.target.value);
      state.config.sourceWeights[key] = val;
      $(labelId).textContent = val.toFixed(1);
    });
    $(id).addEventListener('change', runGenerate);
  });

  $('trackCount').addEventListener('change', (e) => {
    state.config.trackCount = Math.max(3, Math.min(50, Number(e.target.value) || 14));
    runGenerate();
  });

  $('artistCooldown').addEventListener('change', (e) => {
    state.config.artistCooldown = Math.max(0, Math.min(5, Number(e.target.value) || 0));
    runGenerate();
  });

  $('generateBtn').addEventListener('click', () => {
    state.config.varietySeed = (state.config.varietySeed || 0) + 1;
    runGenerate({ excludeCurrent: true });
  });

  $('shuffleFreshBtn').addEventListener('click', () => {
    state.config.varietySeed = (state.config.varietySeed || 0) + 1;
    runGenerate({ excludeCurrent: true });
    showToast('Aynı kurallarla farklı parçalardan yeni liste oluşturuldu!');
  });

  $('savePlaylistBtn').addEventListener('click', async () => {
    if (!state.generated?.tracks?.length) return showToast('Kaydedilecek parça yok.');
    await api('/api/playlists', {
      method: 'POST',
      body: JSON.stringify({
        name: $('playlistNameInput').value.trim() || 'SpotiList Mix',
        config: state.generated.appliedConfig,
        metrics: state.generated.metrics,
        tracks: state.generated.tracks,
      }),
    });
    await refreshSavedPlaylists();
    showToast('Liste kaydedildi!');
  });

  $('pushSpotifyBtn').addEventListener('click', async () => {
    if (!state.generated?.tracks?.length) return;
    try {
      const res = await api('/api/playlists/push-spotify', {
        method: 'POST',
        body: JSON.stringify({
          name: $('playlistNameInput').value.trim() || 'SpotiList Tempo Mix',
          tracks: state.generated.tracks,
        }),
      });
      showToast('Spotify hesabınıza aktarıldı!');
      if (res.spotifyUrl) window.open(res.spotifyUrl, '_blank');
    } catch (err) {
      showToast(err.message);
    }
  });

  document.querySelectorAll('[data-export]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      if (!state.generated?.tracks?.length) return;
      const format = btn.getAttribute('data-export');
      const res = await fetch(`/api/playlists/export-inline?format=${format}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: $('playlistNameInput').value.trim() || 'spotilist',
          tracks: state.generated.tracks,
          metrics: state.generated.metrics,
        }),
      });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `spotilist.${format === 'm3u' ? 'm3u8' : format}`;
      a.click();
      URL.revokeObjectURL(url);
    });
  });

  ['libSearch', 'libSourceFilter', 'libMoodFilter'].forEach((id) => {
    $(id).addEventListener('input', renderLibraryTable);
    $(id).addEventListener('change', renderLibraryTable);
  });

  $('enrichBtn').addEventListener('click', async () => {
    showToast('ReccoBeats üzerinden BPM bilgileri sorgulanıyor...');
    const res = await api('/api/library/enrich', { method: 'POST' });
    await refreshLibrary();
    showToast(`Tamamlandı: ${res.stats.measuredCount} ölçülmüş, ${res.stats.estimatedCount} tahmini.`);
  });

  $('closeModalBtn').addEventListener('click', () => $('editModal').classList.add('hidden'));
  ['editValence', 'editEnergy', 'editDance', 'editAcoustic'].forEach((id) => {
    $(id).addEventListener('input', syncModalReadouts);
  });

  $('tapTempoBtn').addEventListener('click', () => {
    const now = performance.now();
    const taps = state.tapTimestamps;
    if (taps.length > 0 && now - taps[taps.length - 1] > 2500) {
      taps.length = 0;
    }
    taps.push(now);
    if (taps.length >= 2) {
      const intervals = [];
      for (let i = 1; i < taps.length; i += 1) intervals.push(taps[i] - taps[i - 1]);
      const avgMs = intervals.slice(-6).reduce((s, v) => s + v, 0) / Math.min(6, intervals.length);
      const bpm = Math.round((60000 / avgMs) * 10) / 10;
      if (bpm >= 40 && bpm <= 220) $('editBpm').value = bpm;
    }
  });

  $('saveTrackEditBtn').addEventListener('click', async () => {
    if (!state.editingTrackId) return;
    await api(`/api/library/tracks/${encodeURIComponent(state.editingTrackId)}`, {
      method: 'PATCH',
      body: JSON.stringify({
        bpm: Number($('editBpm').value),
        valence: Number($('editValence').value) / 100,
        energy: Number($('editEnergy').value) / 100,
        danceability: Number($('editDance').value) / 100,
        acousticness: Number($('editAcoustic').value) / 100,
        musicalKey: $('editKey').value === '' ? null : Number($('editKey').value),
        musicalMode: $('editMode').value === '' ? null : Number($('editMode').value),
      }),
    });
    $('editModal').classList.add('hidden');
    await refreshLibrary();
    await runGenerate();
    showToast('Parça BPM ve ruh hali güncellendi & kilitlendi.');
  });

  $('saveSpotifyConfigBtn').addEventListener('click', async () => {
    try {
      await api('/api/auth/spotify/config', {
        method: 'POST',
        body: JSON.stringify({
          clientId: $('spotifyClientId').value.trim(),
          redirectUri: $('spotifyRedirectUri').value.trim(),
        }),
      });
      await refreshSpotifyStatus();
      showToast('Spotify Client ID kaydedildi.');
    } catch (err) {
      showToast(err.message);
    }
  });

  $('spotifyLoginBtn').addEventListener('click', async () => {
    try {
      const { authUrl } = await api('/api/auth/spotify/login');
      window.location.href = authUrl;
    } catch (err) {
      showToast(err.message);
    }
  });

  $('spotifySyncBtn').addEventListener('click', async () => {
    try {
      showToast('Spotify sevilen parçalar, albümler ve çok dinlenenler çekiliyor...');
      const res = await api('/api/auth/spotify/sync', { method: 'POST', body: JSON.stringify({ replace: true }) });
      await refreshLibrary();
      await runGenerate();
      showToast(`${res.syncedTracks} parça ve ${res.syncedAlbums} albüm senkronize edildi!`);
    } catch (err) {
      showToast(err.message);
    }
  });

  $('spotifyDisconnectBtn').addEventListener('click', async () => {
    await api('/api/auth/spotify/disconnect', { method: 'POST' });
    await refreshSpotifyStatus();
    showToast('Spotify bağlantısı kesildi.');
  });

  $('importFile').addEventListener('change', async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    $('importPaste').value = await file.text();
    if (file.name.toLowerCase().endsWith('.csv')) $('importFormat').value = 'csv';
    else $('importFormat').value = 'json';
  });

  $('runImportBtn').addEventListener('click', async () => {
    try {
      const content = $('importPaste').value.trim();
      if (!content) return showToast('Lütfen dosya seçin veya JSON/CSV yapıştırın.');
      const res = await api('/api/library/import', {
        method: 'POST',
        body: JSON.stringify({
          format: $('importFormat').value,
          sourceType: $('importSourceType').value,
          replace: $('importReplace').checked,
          content,
        }),
      });
      await refreshLibrary();
      await runGenerate();
      showToast(`${res.importedTracks} parça içe aktarıldı!`);
    } catch (err) {
      showToast(err.message);
    }
  });

  $('loadDemoBtn').addEventListener('click', async () => {
    await api('/api/library/load-demo', { method: 'POST' });
    await refreshLibrary();
    await runGenerate();
    showToast('Demo kütüphane geri yüklendi.');
  });
}

async function init() {
  state.meta = await api('/api/meta');
  bindEvents();
  applyTranslations();
  updatePriorityBar();
  await Promise.all([refreshLibrary(), refreshSavedPlaylists(), refreshSpotifyStatus()]);
  await runGenerate();

  const params = new URLSearchParams(window.location.search);
  if (params.get('spotifyConnected')) {
    showToast('Spotify bağlantısı başarılı! Şimdi kütüphaneyi senkronize edebilirsiniz.');
  } else if (params.get('spotifyError')) {
    showToast(`Spotify bağlantı hatası: ${params.get('spotifyError')}`);
  }
}

init().catch((err) => showToast(err.message));
