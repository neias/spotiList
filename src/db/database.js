import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';

export function createDatabase(dbPath = join(process.cwd(), 'data', 'spotilist.db')) {
  if (dbPath !== ':memory:') {
    mkdirSync(dirname(dbPath), { recursive: true });
  }
  const db = new DatabaseSync(dbPath);

  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS tracks (
      id TEXT PRIMARY KEY,
      uri TEXT,
      name TEXT NOT NULL,
      artists_json TEXT NOT NULL,
      album_id TEXT,
      album_name TEXT,
      duration_ms INTEGER DEFAULT 0,
      genres_json TEXT DEFAULT '[]',
      is_liked INTEGER DEFAULT 0,
      from_album INTEGER DEFAULT 0,
      play_count INTEGER DEFAULT 0,
      top_rank INTEGER,
      bpm REAL DEFAULT 120,
      valence REAL DEFAULT 0.5,
      energy REAL DEFAULT 0.5,
      danceability REAL DEFAULT 0.5,
      acousticness REAL DEFAULT 0.2,
      instrumentalness REAL DEFAULT 0.05,
      musical_key INTEGER,
      musical_mode INTEGER,
      feature_source TEXT DEFAULT 'estimated',
      manual_override INTEGER DEFAULT 0,
      image_url TEXT,
      preview_url TEXT,
      added_at TEXT
    );

    CREATE TABLE IF NOT EXISTS listening_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      track_id TEXT,
      track_name TEXT NOT NULL,
      artist_name TEXT NOT NULL,
      played_at TEXT NOT NULL,
      ms_played INTEGER DEFAULT 210000
    );
    CREATE INDEX IF NOT EXISTS idx_listening_played_at ON listening_events(played_at);

    CREATE TABLE IF NOT EXISTS albums (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      artist TEXT NOT NULL,
      release_year INTEGER,
      total_tracks INTEGER DEFAULT 0,
      image_url TEXT,
      saved_at TEXT
    );

    CREATE TABLE IF NOT EXISTS playlists (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      config_json TEXT NOT NULL,
      metrics_json TEXT NOT NULL,
      tracks_json TEXT NOT NULL,
      spotify_playlist_id TEXT,
      spotify_url TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value_json TEXT NOT NULL
    );
  `);

  // Safe column migration for existing SQLite databases
  const existingCols = new Set(db.prepare('PRAGMA table_info(tracks)').all().map((c) => c.name));
  if (!existingCols.has('musical_key')) {
    db.exec('ALTER TABLE tracks ADD COLUMN musical_key INTEGER');
  }
  if (!existingCols.has('musical_mode')) {
    db.exec('ALTER TABLE tracks ADD COLUMN musical_mode INTEGER');
  }

  const upsertTrackStmt = db.prepare(`
    INSERT INTO tracks (
      id, uri, name, artists_json, album_id, album_name, duration_ms, genres_json,
      is_liked, from_album, play_count, top_rank,
      bpm, valence, energy, danceability, acousticness, instrumentalness,
      musical_key, musical_mode,
      feature_source, manual_override, image_url, preview_url, added_at
    ) VALUES (
      @id, @uri, @name, @artists_json, @album_id, @album_name, @duration_ms, @genres_json,
      @is_liked, @from_album, @play_count, @top_rank,
      @bpm, @valence, @energy, @danceability, @acousticness, @instrumentalness,
      @musical_key, @musical_mode,
      @feature_source, @manual_override, @image_url, @preview_url, @added_at
    )
    ON CONFLICT(id) DO UPDATE SET
      uri = COALESCE(excluded.uri, tracks.uri),
      name = excluded.name,
      artists_json = excluded.artists_json,
      album_id = COALESCE(excluded.album_id, tracks.album_id),
      album_name = COALESCE(excluded.album_name, tracks.album_name),
      duration_ms = CASE WHEN excluded.duration_ms > 0 THEN excluded.duration_ms ELSE tracks.duration_ms END,
      genres_json = CASE WHEN excluded.genres_json != '[]' THEN excluded.genres_json ELSE tracks.genres_json END,
      is_liked = MAX(tracks.is_liked, excluded.is_liked),
      from_album = MAX(tracks.from_album, excluded.from_album),
      play_count = MAX(tracks.play_count, excluded.play_count),
      top_rank = COALESCE(
        CASE WHEN tracks.top_rank IS NULL THEN excluded.top_rank
             WHEN excluded.top_rank IS NULL THEN tracks.top_rank
             ELSE MIN(tracks.top_rank, excluded.top_rank) END,
        tracks.top_rank, excluded.top_rank
      ),
      bpm = CASE WHEN tracks.manual_override = 1 THEN tracks.bpm ELSE excluded.bpm END,
      valence = CASE WHEN tracks.manual_override = 1 THEN tracks.valence ELSE excluded.valence END,
      energy = CASE WHEN tracks.manual_override = 1 THEN tracks.energy ELSE excluded.energy END,
      danceability = CASE WHEN tracks.manual_override = 1 THEN tracks.danceability ELSE excluded.danceability END,
      acousticness = CASE WHEN tracks.manual_override = 1 THEN tracks.acousticness ELSE excluded.acousticness END,
      instrumentalness = CASE WHEN tracks.manual_override = 1 THEN tracks.instrumentalness ELSE excluded.instrumentalness END,
      musical_key = CASE WHEN tracks.manual_override = 1 THEN tracks.musical_key ELSE COALESCE(excluded.musical_key, tracks.musical_key) END,
      musical_mode = CASE WHEN tracks.manual_override = 1 THEN tracks.musical_mode ELSE COALESCE(excluded.musical_mode, tracks.musical_mode) END,
      feature_source = CASE WHEN tracks.manual_override = 1 THEN tracks.feature_source ELSE excluded.feature_source END,
      image_url = COALESCE(excluded.image_url, tracks.image_url),
      preview_url = COALESCE(excluded.preview_url, tracks.preview_url)
  `);

  const upsertAlbumStmt = db.prepare(`
    INSERT INTO albums (id, name, artist, release_year, total_tracks, image_url, saved_at)
    VALUES (@id, @name, @artist, @release_year, @total_tracks, @image_url, @saved_at)
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      artist = excluded.artist,
      release_year = COALESCE(excluded.release_year, albums.release_year),
      total_tracks = MAX(albums.total_tracks, excluded.total_tracks),
      image_url = COALESCE(excluded.image_url, albums.image_url)
  `);

  function rowToTrack(row) {
    return {
      id: row.id,
      uri: row.uri,
      name: row.name,
      artists: JSON.parse(row.artists_json || '[]'),
      albumId: row.album_id,
      albumName: row.album_name,
      durationMs: row.duration_ms,
      genres: JSON.parse(row.genres_json || '[]'),
      isLiked: Boolean(row.is_liked),
      fromAlbum: Boolean(row.from_album),
      playCount: row.play_count,
      topRank: row.top_rank,
      bpm: row.bpm,
      valence: row.valence,
      energy: row.energy,
      danceability: row.danceability,
      acousticness: row.acousticness,
      instrumentalness: row.instrumentalness,
      musicalKey: row.musical_key,
      musicalMode: row.musical_mode,
      featureSource: row.feature_source,
      manualOverride: Boolean(row.manual_override),
      imageUrl: row.image_url,
      previewUrl: row.preview_url,
      addedAt: row.added_at,
    };
  }

  return {
    db,

    clearLibrary() {
      db.exec('DELETE FROM tracks; DELETE FROM albums; DELETE FROM listening_events;');
    },

    upsertLibrary({ tracks = [], albums = [], listeningEvents = [] }, { replace = false } = {}) {
      db.exec('BEGIN');
      try {
        if (replace) {
          db.exec('DELETE FROM tracks; DELETE FROM albums; DELETE FROM listening_events;');
        }
        for (const a of albums) {
          upsertAlbumStmt.run({
            id: a.id,
            name: a.name,
            artist: a.artist || 'Unknown Artist',
            release_year: a.releaseYear ?? null,
            total_tracks: a.totalTracks ?? 0,
            image_url: a.imageUrl ?? null,
            saved_at: a.savedAt ?? new Date().toISOString(),
          });
        }
        for (const t of tracks) {
          upsertTrackStmt.run({
            id: t.id,
            uri: t.uri || `spotify:track:${t.id}`,
            name: t.name,
            artists_json: JSON.stringify(t.artists || ['Unknown Artist']),
            album_id: t.albumId ?? null,
            album_name: t.albumName ?? '',
            duration_ms: Number(t.durationMs) || 0,
            genres_json: JSON.stringify(t.genres || []),
            is_liked: t.isLiked ? 1 : 0,
            from_album: t.fromAlbum ? 1 : 0,
            play_count: Number(t.playCount) || 0,
            top_rank: Number.isFinite(t.topRank) ? t.topRank : null,
            bpm: Number(t.bpm) || 120,
            valence: Number(t.valence ?? 0.5),
            energy: Number(t.energy ?? 0.5),
            danceability: Number(t.danceability ?? 0.5),
            acousticness: Number(t.acousticness ?? 0.2),
            instrumentalness: Number(t.instrumentalness ?? 0.05),
            musical_key: Number.isInteger(t.musicalKey) ? t.musicalKey : null,
            musical_mode: t.musicalMode === 0 || t.musicalMode === 1 ? t.musicalMode : null,
            feature_source: t.featureSource || 'estimated',
            manual_override: t.manualOverride ? 1 : 0,
            image_url: t.imageUrl ?? null,
            preview_url: t.previewUrl ?? null,
            added_at: t.addedAt ?? new Date().toISOString(),
          });
        }
        if (listeningEvents.length > 0) {
          const insertEvt = db.prepare(`
            INSERT INTO listening_events (track_id, track_name, artist_name, played_at, ms_played)
            VALUES (@track_id, @track_name, @artist_name, @played_at, @ms_played)
          `);
          for (const ev of listeningEvents) {
            if (!ev?.playedAt) continue;
            insertEvt.run({
              track_id: ev.trackId ?? null,
              track_name: ev.trackName || 'Unknown Track',
              artist_name: ev.artistName || 'Unknown Artist',
              played_at: ev.playedAt,
              ms_played: Number(ev.msPlayed) || 210000,
            });
          }
        }
        db.exec('COMMIT');
      } catch (err) {
        db.exec('ROLLBACK');
        throw err;
      }
    },

    getListeningEvents() {
      return db.prepare('SELECT * FROM listening_events ORDER BY played_at DESC').all().map((r) => ({
        id: r.id,
        trackId: r.track_id,
        trackName: r.track_name,
        artistName: r.artist_name,
        playedAt: r.played_at,
        msPlayed: r.ms_played,
      }));
    },

    getAllTracks() {
      const rows = db.prepare('SELECT * FROM tracks ORDER BY play_count DESC, is_liked DESC, name ASC').all();
      return rows.map(rowToTrack);
    },

    getTrackById(id) {
      const row = db.prepare('SELECT * FROM tracks WHERE id = ?').get(id);
      return row ? rowToTrack(row) : null;
    },

    updateTrackFeatures(id, patch, { manual = true } = {}) {
      const existing = this.getTrackById(id);
      if (!existing) return null;

      const updated = {
        bpm: patch.bpm !== undefined ? Number(patch.bpm) : existing.bpm,
        valence: patch.valence !== undefined ? Number(patch.valence) : existing.valence,
        energy: patch.energy !== undefined ? Number(patch.energy) : existing.energy,
        danceability: patch.danceability !== undefined ? Number(patch.danceability) : existing.danceability,
        acousticness: patch.acousticness !== undefined ? Number(patch.acousticness) : existing.acousticness,
        instrumentalness: patch.instrumentalness !== undefined ? Number(patch.instrumentalness) : existing.instrumentalness,
        musical_key: patch.musicalKey !== undefined ? (patch.musicalKey === null || patch.musicalKey === '' ? null : Number(patch.musicalKey)) : existing.musicalKey,
        musical_mode: patch.musicalMode !== undefined ? (patch.musicalMode === null || patch.musicalMode === '' ? null : Number(patch.musicalMode)) : existing.musicalMode,
        feature_source: patch.featureSource || (manual ? 'manual' : existing.featureSource),
        manual_override: patch.manualOverride !== undefined ? (patch.manualOverride ? 1 : 0) : (manual ? 1 : existing.manualOverride ? 1 : 0),
        id,
      };

      db.prepare(`
        UPDATE tracks SET
          bpm = @bpm,
          valence = @valence,
          energy = @energy,
          danceability = @danceability,
          acousticness = @acousticness,
          instrumentalness = @instrumentalness,
          musical_key = @musical_key,
          musical_mode = @musical_mode,
          feature_source = @feature_source,
          manual_override = @manual_override
        WHERE id = @id
      `).run(updated);

      return this.getTrackById(id);
    },

    getAllAlbums() {
      return db.prepare('SELECT * FROM albums ORDER BY saved_at DESC, name ASC').all().map((row) => ({
        id: row.id,
        name: row.name,
        artist: row.artist,
        releaseYear: row.release_year,
        totalTracks: row.total_tracks,
        imageUrl: row.image_url,
        savedAt: row.saved_at,
      }));
    },

    savePlaylist(playlist) {
      const id = playlist.id || `pl_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      const createdAt = playlist.createdAt || new Date().toISOString();
      db.prepare(`
        INSERT INTO playlists (id, name, description, config_json, metrics_json, tracks_json, spotify_playlist_id, spotify_url, created_at)
        VALUES (@id, @name, @description, @config_json, @metrics_json, @tracks_json, @spotify_playlist_id, @spotify_url, @created_at)
        ON CONFLICT(id) DO UPDATE SET
          name = excluded.name,
          description = excluded.description,
          config_json = excluded.config_json,
          metrics_json = excluded.metrics_json,
          tracks_json = excluded.tracks_json,
          spotify_playlist_id = COALESCE(excluded.spotify_playlist_id, playlists.spotify_playlist_id),
          spotify_url = COALESCE(excluded.spotify_url, playlists.spotify_url)
      `).run({
        id,
        name: playlist.name,
        description: playlist.description || '',
        config_json: JSON.stringify(playlist.config || {}),
        metrics_json: JSON.stringify(playlist.metrics || {}),
        tracks_json: JSON.stringify(playlist.tracks || []),
        spotify_playlist_id: playlist.spotifyPlaylistId ?? null,
        spotify_url: playlist.spotifyUrl ?? null,
        created_at: createdAt,
      });
      return this.getPlaylistById(id);
    },

    getAllPlaylists() {
      return db.prepare('SELECT * FROM playlists ORDER BY created_at DESC').all().map((row) => ({
        id: row.id,
        name: row.name,
        description: row.description,
        config: JSON.parse(row.config_json || '{}'),
        metrics: JSON.parse(row.metrics_json || '{}'),
        tracks: JSON.parse(row.tracks_json || '[]'),
        spotifyPlaylistId: row.spotify_playlist_id,
        spotifyUrl: row.spotify_url,
        createdAt: row.created_at,
      }));
    },

    getPlaylistById(id) {
      const row = db.prepare('SELECT * FROM playlists WHERE id = ?').get(id);
      if (!row) return null;
      return {
        id: row.id,
        name: row.name,
        description: row.description,
        config: JSON.parse(row.config_json || '{}'),
        metrics: JSON.parse(row.metrics_json || '{}'),
        tracks: JSON.parse(row.tracks_json || '[]'),
        spotifyPlaylistId: row.spotify_playlist_id,
        spotifyUrl: row.spotify_url,
        createdAt: row.created_at,
      };
    },

    deletePlaylist(id) {
      const res = db.prepare('DELETE FROM playlists WHERE id = ?').run(id);
      return res.changes > 0;
    },

    getSetting(key, defaultValue = null) {
      const row = db.prepare('SELECT value_json FROM settings WHERE key = ?').get(key);
      return row ? JSON.parse(row.value_json) : defaultValue;
    },

    setSetting(key, value) {
      db.prepare(`
        INSERT INTO settings (key, value_json) VALUES (?, ?)
        ON CONFLICT(key) DO UPDATE SET value_json = excluded.value_json
      `).run(key, JSON.stringify(value));
    },

    updateTrackPreviewUrl(id, previewUrl) {
      if (!id || !previewUrl) return;
      db.prepare('UPDATE tracks SET preview_url = ? WHERE id = ?').run(previewUrl, id);
    },

    getScenarios(defaultScenarios = []) {
      const stored = this.getSetting('scenarios', null);
      if (Array.isArray(stored)) return stored;
      this.setSetting('scenarios', defaultScenarios);
      return defaultScenarios;
    },

    addScenario(scenario, defaultScenarios = []) {
      const list = this.getScenarios(defaultScenarios);
      const id = scenario.id || `sc_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      const item = {
        id,
        icon: scenario.icon || '🎵',
        labelTr: scenario.labelTr || scenario.name || 'Özel Şablon',
        labelEn: scenario.labelEn || scenario.labelTr || scenario.name || 'Custom Preset',
        descTr: scenario.descTr || scenario.description || '',
        descEn: scenario.descEn || scenario.descTr || scenario.description || '',
        config: scenario.config || {},
      };
      const next = [...list.filter((s) => s.id !== id), item];
      this.setSetting('scenarios', next);
      return { scenario: item, scenarios: next };
    },

    deleteScenario(id, defaultScenarios = []) {
      const list = this.getScenarios(defaultScenarios);
      const next = list.filter((s) => s.id !== id);
      if (next.length === list.length) return { deleted: false, scenarios: list };
      this.setSetting('scenarios', next);
      return { deleted: true, scenarios: next };
    },

    resetScenarios(defaultScenarios = []) {
      this.setSetting('scenarios', defaultScenarios);
      return defaultScenarios;
    },

    close() {
      db.close();
    },
  };
}
