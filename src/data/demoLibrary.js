/**
 * Curated 90-track realistic demo library covering Liked Tracks, Saved Albums,
 * and Most-Listened Tracks across Turkish & global artists, 64-174 BPM, and all 6 moods.
 */

const RAW_DEMO_TRACKS = [
  // --- 64 - 84 BPM (Chill / Melancholic / Focus) ---
  { id: 'demo_01', name: 'Öyle Kolaysa', artists: ['Mabel Matiz'], albumId: 'alb_maya', albumName: 'Maya', bpm: 78, valence: 0.36, energy: 0.44, danceability: 0.56, acousticness: 0.42, instrumentalness: 0.02, durationMs: 254000, genres: ['turkish pop', 'anatolian pop'], isLiked: true, fromAlbum: true, playCount: 148, topRank: 4 },
  { id: 'demo_02', name: 'Fırtınadayım', artists: ['Mabel Matiz'], albumId: 'alb_maya', albumName: 'Maya', bpm: 84, valence: 0.31, energy: 0.49, danceability: 0.51, acousticness: 0.38, instrumentalness: 0.01, durationMs: 238000, genres: ['turkish pop'], isLiked: true, fromAlbum: true, playCount: 112, topRank: 11 },
  { id: 'demo_03', name: 'Sarmaşık', artists: ['Mabel Matiz'], albumId: 'alb_maya', albumName: 'Maya', bpm: 92, valence: 0.48, energy: 0.58, danceability: 0.66, acousticness: 0.25, instrumentalness: 0.02, durationMs: 229000, genres: ['turkish pop'], isLiked: false, fromAlbum: true, playCount: 67, topRank: 28 },
  { id: 'demo_04', name: 'Aşk Yok Olmaktır', artists: ['Mabel Matiz'], albumId: 'alb_maya', albumName: 'Maya', bpm: 108, valence: 0.68, energy: 0.71, danceability: 0.74, acousticness: 0.16, instrumentalness: 0.01, durationMs: 242000, genres: ['turkish pop'], isLiked: true, fromAlbum: true, playCount: 94, topRank: 16 },
  { id: 'demo_05', name: 'Says', artists: ['Nils Frahm'], albumId: 'alb_spaces', albumName: 'Spaces', bpm: 72, valence: 0.38, energy: 0.42, danceability: 0.32, acousticness: 0.78, instrumentalness: 0.91, durationMs: 498000, genres: ['neoclassical', 'ambient'], isLiked: true, fromAlbum: true, playCount: 89, topRank: 18 },
  { id: 'demo_06', name: 'For', artists: ['Nils Frahm'], albumId: 'alb_spaces', albumName: 'Spaces', bpm: 66, valence: 0.44, energy: 0.22, danceability: 0.28, acousticness: 0.92, instrumentalness: 0.94, durationMs: 185000, genres: ['neoclassical'], isLiked: false, fromAlbum: true, playCount: 41, topRank: null },
  { id: 'demo_07', name: 'Familiar', artists: ['Agnes Obel'], albumId: 'alb_myopia', albumName: 'Citizen of Glass', bpm: 76, valence: 0.24, energy: 0.31, danceability: 0.42, acousticness: 0.81, instrumentalness: 0.15, durationMs: 235000, genres: ['chamber pop', 'indie folk'], isLiked: true, fromAlbum: false, playCount: 73, topRank: 24 },
  { id: 'demo_08', name: 'Motion Picture Soundtrack', artists: ['Radiohead'], albumId: 'alb_kida', albumName: 'Kid A', bpm: 68, valence: 0.12, energy: 0.21, danceability: 0.24, acousticness: 0.86, instrumentalness: 0.48, durationMs: 200000, genres: ['art rock', 'alternative'], isLiked: true, fromAlbum: true, playCount: 54, topRank: null },
  { id: 'demo_09', name: 'Bir Derdim Var', artists: ['Mor ve Ötesi'], albumId: 'alb_dunya', albumName: 'Dünya Yalan Söylüyor', bpm: 80, valence: 0.21, energy: 0.68, danceability: 0.41, acousticness: 0.12, instrumentalness: 0.03, durationMs: 215000, genres: ['turkish rock', 'alternative rock'], isLiked: true, fromAlbum: true, playCount: 164, topRank: 2 },
  { id: 'demo_10', name: 'Cambaz', artists: ['Mor ve Ötesi'], albumId: 'alb_dunya', albumName: 'Dünya Yalan Söylüyor', bpm: 132, valence: 0.35, energy: 0.86, danceability: 0.52, acousticness: 0.04, instrumentalness: 0.01, durationMs: 230000, genres: ['turkish rock'], isLiked: true, fromAlbum: true, playCount: 138, topRank: 6 },
  { id: 'demo_11', name: 'Sevda Çiçeği', artists: ['Mor ve Ötesi'], albumId: 'alb_dunya', albumName: 'Dünya Yalan Söylüyor', bpm: 96, valence: 0.34, energy: 0.62, danceability: 0.49, acousticness: 0.15, instrumentalness: 0.02, durationMs: 242000, genres: ['turkish rock'], isLiked: false, fromAlbum: true, playCount: 59, topRank: null },
  { id: 'demo_12', name: 'Uyan', artists: ['Mor ve Ötesi'], albumId: 'alb_dunya', albumName: 'Dünya Yalan Söylüyor', bpm: 118, valence: 0.28, energy: 0.79, danceability: 0.47, acousticness: 0.08, instrumentalness: 0.04, durationMs: 266000, genres: ['turkish rock'], isLiked: true, fromAlbum: true, playCount: 77, topRank: 22 },

  // --- 85 - 102 BPM (Warm Mid-Tempo / Chill Groove / Indie / Anatolian Psychedelic) ---
  { id: 'demo_13', name: 'People Everywhere (Still Alive)', artists: ['Khruangbin'], albumId: 'alb_universe', albumName: 'The Universe Smiles Upon You', bpm: 95, valence: 0.72, energy: 0.58, danceability: 0.68, acousticness: 0.36, instrumentalness: 0.84, durationMs: 159000, genres: ['psychedelic funk', 'instrumental'], isLiked: true, fromAlbum: true, playCount: 105, topRank: 13 },
  { id: 'demo_14', name: 'White Gloves', artists: ['Khruangbin'], albumId: 'alb_universe', albumName: 'The Universe Smiles Upon You', bpm: 88, valence: 0.54, energy: 0.34, danceability: 0.61, acousticness: 0.64, instrumentalness: 0.42, durationMs: 218000, genres: ['psychedelic funk', 'chill'], isLiked: true, fromAlbum: true, playCount: 82, topRank: 20 },
  { id: 'demo_15', name: 'Time (You and I)', artists: ['Khruangbin'], albumId: 'alb_mordechai', albumName: 'Mordechai', bpm: 106, valence: 0.79, energy: 0.69, danceability: 0.81, acousticness: 0.22, instrumentalness: 0.38, durationMs: 342000, genres: ['psychedelic funk', 'disco'], isLiked: true, fromAlbum: false, playCount: 119, topRank: 9 },
  { id: 'demo_16', name: 'Goca Dünya', artists: ['Altın Gün'], albumId: 'alb_on', albumName: 'On', bpm: 98, valence: 0.64, energy: 0.74, danceability: 0.72, acousticness: 0.19, instrumentalness: 0.14, durationMs: 226000, genres: ['anatolian rock', 'psychedelic'], isLiked: true, fromAlbum: true, playCount: 97, topRank: 15 },
  { id: 'demo_17', name: 'Süpürgesi Yoncadan', artists: ['Altın Gün'], albumId: 'alb_yol', albumName: 'Yol', bpm: 112, valence: 0.71, energy: 0.76, danceability: 0.78, acousticness: 0.15, instrumentalness: 0.08, durationMs: 212000, genres: ['anatolian rock', 'synth funk'], isLiked: true, fromAlbum: false, playCount: 88, topRank: 19 },
  { id: 'demo_18', name: 'Tatlı Dile Güler Yüze', artists: ['Altın Gün'], albumId: 'alb_on', albumName: 'On', bpm: 90, valence: 0.58, energy: 0.61, danceability: 0.64, acousticness: 0.29, instrumentalness: 0.11, durationMs: 205000, genres: ['anatolian rock'], isLiked: false, fromAlbum: true, playCount: 44, topRank: null },
  { id: 'demo_19', name: 'Aylak', artists: ['Büyük Ev Ablukada'], albumId: 'alb_firtinayt', albumName: 'Fırtınayt', bpm: 100, valence: 0.52, energy: 0.66, danceability: 0.69, acousticness: 0.18, instrumentalness: 0.04, durationMs: 233000, genres: ['turkish indie', 'synth pop'], isLiked: true, fromAlbum: true, playCount: 121, topRank: 8 },
  { id: 'demo_20', name: 'Güneş Yerinde', artists: ['Büyük Ev Ablukada'], albumId: 'alb_firtinayt', albumName: 'Fırtınayt', bpm: 116, valence: 0.76, energy: 0.78, danceability: 0.79, acousticness: 0.11, instrumentalness: 0.02, durationMs: 219000, genres: ['turkish indie', 'electropop'], isLiked: true, fromAlbum: true, playCount: 132, topRank: 7 },
  { id: 'demo_21', name: 'Hoşçakal Kadar', artists: ['Büyük Ev Ablukada'], albumId: 'alb_firtinayt', albumName: 'Fırtınayt', bpm: 94, valence: 0.29, energy: 0.55, danceability: 0.58, acousticness: 0.24, instrumentalness: 0.03, durationMs: 249000, genres: ['turkish indie'], isLiked: false, fromAlbum: true, playCount: 63, topRank: null },
  { id: 'demo_22', name: 'Senden Daha Güzel', artists: ['Duman'], albumId: 'alb_duman1', albumName: 'Duman I', bpm: 102, valence: 0.67, energy: 0.77, danceability: 0.59, acousticness: 0.09, instrumentalness: 0.01, durationMs: 235000, genres: ['turkish rock'], isLiked: true, fromAlbum: true, playCount: 175, topRank: 1 },
  { id: 'demo_23', name: 'Dibine Kadar', artists: ['Duman'], albumId: 'alb_duman1', albumName: 'Duman I', bpm: 124, valence: 0.44, energy: 0.85, danceability: 0.53, acousticness: 0.05, instrumentalness: 0.01, durationMs: 221000, genres: ['turkish rock'], isLiked: true, fromAlbum: true, playCount: 116, topRank: 10 },
  { id: 'demo_24', name: 'Elleri Ellerime', artists: ['Duman'], albumId: 'alb_duman1', albumName: 'Duman I', bpm: 86, valence: 0.41, energy: 0.54, danceability: 0.48, acousticness: 0.27, instrumentalness: 0.01, durationMs: 256000, genres: ['turkish rock'], isLiked: false, fromAlbum: true, playCount: 52, topRank: null },

  // --- 103 - 118 BPM (Synth-pop / Indie Groove / Darkwave / Nu-Disco) ---
  { id: 'demo_25', name: 'Koca Bir Saçmalık', artists: ['Jakuzi'], albumId: 'alb_fantezi', albumName: 'Fantezi Müzik', bpm: 115, valence: 0.28, energy: 0.74, danceability: 0.71, acousticness: 0.07, instrumentalness: 0.12, durationMs: 214000, genres: ['turkish darkwave', 'synthpop'], isLiked: true, fromAlbum: true, playCount: 141, topRank: 5 },
  { id: 'demo_26', name: 'Her An Ölecek Gibi', artists: ['Jakuzi'], albumId: 'alb_fantezi', albumName: 'Fantezi Müzik', bpm: 110, valence: 0.22, energy: 0.66, danceability: 0.64, acousticness: 0.11, instrumentalness: 0.16, durationMs: 238000, genres: ['turkish darkwave'], isLiked: true, fromAlbum: true, playCount: 91, topRank: 17 },
  { id: 'demo_27', name: 'İstediğin Gibi Kullan', artists: ['Jakuzi'], albumId: 'alb_fantezi', albumName: 'Fantezi Müzik', bpm: 118, valence: 0.34, energy: 0.77, danceability: 0.76, acousticness: 0.06, instrumentalness: 0.09, durationMs: 204000, genres: ['turkish darkwave'], isLiked: false, fromAlbum: true, playCount: 58, topRank: null },
  { id: 'demo_28', name: 'The Less I Know The Better', artists: ['Tame Impala'], albumId: 'alb_currents', albumName: 'Currents', bpm: 117, valence: 0.78, energy: 0.74, danceability: 0.79, acousticness: 0.03, instrumentalness: 0.04, durationMs: 216000, genres: ['psychedelic pop', 'indie'], isLiked: true, fromAlbum: true, playCount: 156, topRank: 3 },
  { id: 'demo_29', name: 'Let It Happen', artists: ['Tame Impala'], albumId: 'alb_currents', albumName: 'Currents', bpm: 125, valence: 0.58, energy: 0.88, danceability: 0.67, acousticness: 0.02, instrumentalness: 0.26, durationMs: 467000, genres: ['psychedelic pop', 'electronic'], isLiked: true, fromAlbum: true, playCount: 129, topRank: 7 },
  { id: 'demo_30', name: 'Eventually', artists: ['Tame Impala'], albumId: 'alb_currents', albumName: 'Currents', bpm: 92, valence: 0.36, energy: 0.61, danceability: 0.52, acousticness: 0.06, instrumentalness: 0.08, durationMs: 318000, genres: ['psychedelic pop'], isLiked: false, fromAlbum: true, playCount: 64, topRank: null },
  { id: 'demo_31', name: 'Borderline', artists: ['Tame Impala'], albumId: 'alb_slowrush', albumName: 'The Slow Rush', bpm: 98, valence: 0.71, energy: 0.72, danceability: 0.74, acousticness: 0.05, instrumentalness: 0.02, durationMs: 237000, genres: ['psychedelic pop'], isLiked: true, fromAlbum: false, playCount: 102, topRank: 14 },
  { id: 'demo_32', name: 'Instant Crush', artists: ['Daft Punk', 'Julian Casablancas'], albumId: 'alb_ram', albumName: 'Random Access Memories', bpm: 110, valence: 0.49, energy: 0.64, danceability: 0.75, acousticness: 0.08, instrumentalness: 0.01, durationMs: 337000, genres: ['synthpop', 'electronic'], isLiked: true, fromAlbum: true, playCount: 115, topRank: 10 },
  { id: 'demo_33', name: 'Get Lucky', artists: ['Daft Punk', 'Pharrell Williams'], albumId: 'alb_ram', albumName: 'Random Access Memories', bpm: 116, valence: 0.86, energy: 0.81, danceability: 0.87, acousticness: 0.04, instrumentalness: 0.00, durationMs: 369000, genres: ['nu-disco', 'funk'], isLiked: true, fromAlbum: true, playCount: 108, topRank: 12 },
  { id: 'demo_34', name: 'Giorgio by Moroder', artists: ['Daft Punk'], albumId: 'alb_ram', albumName: 'Random Access Memories', bpm: 113, valence: 0.52, energy: 0.73, danceability: 0.70, acousticness: 0.09, instrumentalness: 0.76, durationMs: 544000, genres: ['electronic', 'disco'], isLiked: false, fromAlbum: true, playCount: 69, topRank: 27 },
  { id: 'demo_35', name: 'Touch', artists: ['Daft Punk', 'Paul Williams'], albumId: 'alb_ram', albumName: 'Random Access Memories', bpm: 96, valence: 0.31, energy: 0.48, danceability: 0.46, acousticness: 0.44, instrumentalness: 0.24, durationMs: 498000, genres: ['electronic'], isLiked: false, fromAlbum: true, playCount: 38, topRank: null },
  { id: 'demo_36', name: 'Midnight City', artists: ['M83'], albumId: 'alb_hurry', albumName: 'Hurry Up, We\'re Dreaming', bpm: 105, valence: 0.61, energy: 0.82, danceability: 0.66, acousticness: 0.02, instrumentalness: 0.14, durationMs: 243000, genres: ['synthpop', 'shoegaze'], isLiked: true, fromAlbum: false, playCount: 118, topRank: 9 },

  // --- 119 - 128 BPM (House / Nu-Disco / Indie Dance / Pop) ---
  { id: 'demo_37', name: 'Levitating', artists: ['Dua Lipa'], albumId: 'alb_fn', albumName: 'Future Nostalgia', bpm: 103, valence: 0.91, energy: 0.83, danceability: 0.84, acousticness: 0.02, instrumentalness: 0.00, durationMs: 203000, genres: ['dance pop', 'disco'], isLiked: true, fromAlbum: true, playCount: 95, topRank: 16 },
  { id: 'demo_38', name: 'Don\'t Start Now', artists: ['Dua Lipa'], albumId: 'alb_fn', albumName: 'Future Nostalgia', bpm: 124, valence: 0.76, energy: 0.79, danceability: 0.88, acousticness: 0.01, instrumentalness: 0.00, durationMs: 183000, genres: ['dance pop', 'nu-disco'], isLiked: true, fromAlbum: true, playCount: 126, topRank: 8 },
  { id: 'demo_39', name: 'Physical', artists: ['Dua Lipa'], albumId: 'alb_fn', albumName: 'Future Nostalgia', bpm: 147, valence: 0.74, energy: 0.91, danceability: 0.72, acousticness: 0.01, instrumentalness: 0.00, durationMs: 193000, genres: ['synthpop', 'hi-nrg'], isLiked: true, fromAlbum: true, playCount: 84, topRank: 20 },
  { id: 'demo_40', name: 'Latch', artists: ['Disclosure', 'Sam Smith'], albumId: 'alb_settle', albumName: 'Settle', bpm: 122, valence: 0.56, energy: 0.74, danceability: 0.85, acousticness: 0.05, instrumentalness: 0.02, durationMs: 255000, genres: ['uk garage', 'house'], isLiked: true, fromAlbum: true, playCount: 134, topRank: 6 },
  { id: 'demo_41', name: 'White Noise', artists: ['Disclosure', 'AlunaGeorge'], albumId: 'alb_settle', albumName: 'Settle', bpm: 123, valence: 0.62, energy: 0.78, danceability: 0.86, acousticness: 0.03, instrumentalness: 0.04, durationMs: 278000, genres: ['house', 'uk garage'], isLiked: false, fromAlbum: true, playCount: 62, topRank: 29 },
  { id: 'demo_42', name: 'When a Fire Starts to Burn', artists: ['Disclosure'], albumId: 'alb_settle', albumName: 'Settle', bpm: 124, valence: 0.44, energy: 0.87, danceability: 0.84, acousticness: 0.02, instrumentalness: 0.45, durationMs: 283000, genres: ['deep house', 'uk garage'], isLiked: true, fromAlbum: true, playCount: 79, topRank: 21 },
  { id: 'demo_43', name: 'One More Time', artists: ['Daft Punk'], albumId: 'alb_discovery', albumName: 'Discovery', bpm: 123, valence: 0.84, energy: 0.76, danceability: 0.82, acousticness: 0.02, instrumentalness: 0.01, durationMs: 320000, genres: ['french house'], isLiked: true, fromAlbum: true, playCount: 145, topRank: 5 },
  { id: 'demo_44', name: 'Digital Love', artists: ['Daft Punk'], albumId: 'alb_discovery', albumName: 'Discovery', bpm: 125, valence: 0.81, energy: 0.72, danceability: 0.76, acousticness: 0.04, instrumentalness: 0.08, durationMs: 301000, genres: ['french house'], isLiked: true, fromAlbum: true, playCount: 86, topRank: 19 },
  { id: 'demo_45', name: 'Veridis Quo', artists: ['Daft Punk'], albumId: 'alb_discovery', albumName: 'Discovery', bpm: 112, valence: 0.42, energy: 0.49, danceability: 0.65, acousticness: 0.14, instrumentalness: 0.92, durationMs: 345000, genres: ['electronic', 'instrumental'], isLiked: true, fromAlbum: true, playCount: 98, topRank: 15 },
  { id: 'demo_46', name: 'Do I Wanna Know?', artists: ['Arctic Monkeys'], albumId: 'alb_am', albumName: 'AM', bpm: 85, valence: 0.39, energy: 0.54, danceability: 0.61, acousticness: 0.18, instrumentalness: 0.01, durationMs: 272000, genres: ['indie rock'], isLiked: true, fromAlbum: true, playCount: 151, topRank: 4 },
  { id: 'demo_47', name: 'R U Mine?', artists: ['Arctic Monkeys'], albumId: 'alb_am', albumName: 'AM', bpm: 97, valence: 0.53, energy: 0.81, danceability: 0.54, acousticness: 0.02, instrumentalness: 0.01, durationMs: 201000, genres: ['indie rock'], isLiked: true, fromAlbum: true, playCount: 109, topRank: 12 },
  { id: 'demo_48', name: 'Arabella', artists: ['Arctic Monkeys'], albumId: 'alb_am', albumName: 'AM', bpm: 90, valence: 0.47, energy: 0.68, danceability: 0.57, acousticness: 0.09, instrumentalness: 0.00, durationMs: 207000, genres: ['indie rock'], isLiked: false, fromAlbum: true, playCount: 51, topRank: null },
  { id: 'demo_49', name: 'Innerbloom', artists: ['RÜFÜS DU SOL'], albumId: 'alb_bloom', albumName: 'Bloom', bpm: 122, valence: 0.38, energy: 0.63, danceability: 0.68, acousticness: 0.07, instrumentalness: 0.52, durationMs: 578000, genres: ['melodic house', 'electronic'], isLiked: true, fromAlbum: false, playCount: 111, topRank: 11 },
  { id: 'demo_50', name: 'Glue', artists: ['Bicep'], albumId: 'alb_bicep', albumName: 'Bicep', bpm: 130, valence: 0.32, energy: 0.79, danceability: 0.72, acousticness: 0.03, instrumentalness: 0.87, durationMs: 269000, genres: ['breakbeat', 'electronic'], isLiked: true, fromAlbum: true, playCount: 124, topRank: 8 },
  { id: 'demo_51', name: 'Apricots', artists: ['Bicep'], albumId: 'alb_isles', albumName: 'Isles', bpm: 126, valence: 0.41, energy: 0.75, danceability: 0.73, acousticness: 0.06, instrumentalness: 0.79, durationMs: 246000, genres: ['electronic', 'uk garage'], isLiked: true, fromAlbum: false, playCount: 83, topRank: 20 },
  { id: 'demo_52', name: 'Marea (we\'ve lost dancing)', artists: ['Fred again..', 'The Blessed Madonna'], albumId: 'alb_actual1', albumName: 'Actual Life', bpm: 123, valence: 0.46, energy: 0.77, danceability: 0.78, acousticness: 0.09, instrumentalness: 0.12, durationMs: 285000, genres: ['house', 'electronic'], isLiked: true, fromAlbum: false, playCount: 136, topRank: 6 },
  { id: 'demo_53', name: 'Delilah (pull me out of this)', artists: ['Fred again..'], albumId: 'alb_actual3', albumName: 'Actual Life 3', bpm: 134, valence: 0.63, energy: 0.84, danceability: 0.77, acousticness: 0.04, instrumentalness: 0.08, durationMs: 250000, genres: ['house', 'uk garage'], isLiked: true, fromAlbum: false, playCount: 114, topRank: 11 },
  { id: 'demo_54', name: 'Karanlıklar', artists: ['Hayko Cepkin'], albumId: 'alb_tanisma', albumName: 'Tanışma Bitti', bpm: 126, valence: 0.16, energy: 0.92, danceability: 0.49, acousticness: 0.02, instrumentalness: 0.04, durationMs: 241000, genres: ['turkish metal', 'industrial rock'], isLiked: true, fromAlbum: false, playCount: 68, topRank: 26 },
  { id: 'demo_55', name: 'Bilmem Mi?', artists: ['Sefo'], albumId: 'alb_single1', albumName: 'Bilmem Mi?', bpm: 122, valence: 0.82, energy: 0.77, danceability: 0.86, acousticness: 0.08, instrumentalness: 0.00, durationMs: 171000, genres: ['turkish pop', 'dance'], isLiked: false, fromAlbum: false, playCount: 92, topRank: 17 },
  { id: 'demo_56', name: 'Rüya Gibi', artists: ['Gaye Su Akyol'], albumId: 'alb_anadolu', albumName: 'Anadolu Ejderi', bpm: 120, valence: 0.51, energy: 0.69, danceability: 0.67, acousticness: 0.16, instrumentalness: 0.09, durationMs: 223000, genres: ['anatolian psychedelic', 'indie'], isLiked: true, fromAlbum: false, playCount: 74, topRank: 23 },

  // --- 129 - 148 BPM (Driving Indie / Techno / Dark Synth / High-Energy Pop) ---
  { id: 'demo_57', name: 'Midnight Request Line', artists: ['Skream'], albumId: 'alb_skream', albumName: 'Skream!', bpm: 138, valence: 0.27, energy: 0.81, danceability: 0.73, acousticness: 0.02, instrumentalness: 0.89, durationMs: 342000, genres: ['dubstep', 'electronic'], isLiked: false, fromAlbum: false, playCount: 47, topRank: null },
  { id: 'demo_58', name: 'Genesis', artists: ['Justice'], albumId: 'alb_cross', albumName: 'Cross', bpm: 130, valence: 0.24, energy: 0.91, danceability: 0.65, acousticness: 0.01, instrumentalness: 0.86, durationMs: 234000, genres: ['electro house', 'french electro'], isLiked: true, fromAlbum: true, playCount: 101, topRank: 14 },
  { id: 'demo_59', name: 'D.A.N.C.E.', artists: ['Justice'], albumId: 'alb_cross', albumName: 'Cross', bpm: 113, valence: 0.85, energy: 0.83, danceability: 0.82, acousticness: 0.02, instrumentalness: 0.01, durationMs: 242000, genres: ['french electro', 'nu-disco'], isLiked: true, fromAlbum: true, playCount: 96, topRank: 16 },
  { id: 'demo_60', name: 'Phantom Pt. II', artists: ['Justice'], albumId: 'alb_cross', albumName: 'Cross', bpm: 128, valence: 0.36, energy: 0.93, danceability: 0.71, acousticness: 0.01, instrumentalness: 0.88, durationMs: 200000, genres: ['electro house'], isLiked: false, fromAlbum: true, playCount: 55, topRank: null },
  { id: 'demo_61', name: 'Blinding Lights', artists: ['The Weeknd'], albumId: 'alb_afterhours', albumName: 'After Hours', bpm: 171, valence: 0.64, energy: 0.84, danceability: 0.66, acousticness: 0.01, instrumentalness: 0.00, durationMs: 200000, genres: ['synthwave', 'pop'], isLiked: true, fromAlbum: true, playCount: 161, topRank: 3 },
  { id: 'demo_62', name: 'After Hours', artists: ['The Weeknd'], albumId: 'alb_afterhours', albumName: 'After Hours', bpm: 109, valence: 0.19, energy: 0.59, danceability: 0.64, acousticness: 0.08, instrumentalness: 0.04, durationMs: 361000, genres: ['r&b', 'synthwave'], isLiked: true, fromAlbum: true, playCount: 128, topRank: 7 },
  { id: 'demo_63', name: 'Save Your Tears', artists: ['The Weeknd'], albumId: 'alb_afterhours', albumName: 'After Hours', bpm: 118, valence: 0.52, energy: 0.78, danceability: 0.76, acousticness: 0.02, instrumentalness: 0.00, durationMs: 215000, genres: ['synthpop'], isLiked: false, fromAlbum: true, playCount: 72, topRank: 25 },
  { id: 'demo_64', name: 'Harder, Better, Faster, Stronger', artists: ['Daft Punk'], albumId: 'alb_discovery', albumName: 'Discovery', bpm: 123, valence: 0.71, energy: 0.82, danceability: 0.83, acousticness: 0.02, instrumentalness: 0.18, durationMs: 224000, genres: ['french house'], isLiked: true, fromAlbum: true, playCount: 117, topRank: 10 },
  { id: 'demo_65', name: 'Take Me Out', artists: ['Franz Ferdinand'], albumId: 'alb_ff', albumName: 'Franz Ferdinand', bpm: 104, valence: 0.69, energy: 0.81, danceability: 0.67, acousticness: 0.03, instrumentalness: 0.00, durationMs: 237000, genres: ['indie rock', 'post-punk revival'], isLiked: true, fromAlbum: false, playCount: 87, topRank: 19 },
  { id: 'demo_66', name: 'Mr. Brightside', artists: ['The Killers'], albumId: 'alb_hotfuss', albumName: 'Hot Fuss', bpm: 148, valence: 0.68, energy: 0.91, danceability: 0.52, acousticness: 0.01, instrumentalness: 0.00, durationMs: 222000, genres: ['indie rock'], isLiked: true, fromAlbum: false, playCount: 142, topRank: 5 },
  { id: 'demo_67', name: 'Breathe', artists: ['The Prodigy'], albumId: 'alb_fat', albumName: 'The Fat of the Land', bpm: 130, valence: 0.22, energy: 0.95, danceability: 0.68, acousticness: 0.01, instrumentalness: 0.35, durationMs: 335000, genres: ['big beat', 'breakbeat'], isLiked: true, fromAlbum: false, playCount: 76, topRank: 22 },
  { id: 'demo_68', name: 'Ghosts \'n\' Stuff', artists: ['deadmau5', 'Rob Swire'], albumId: 'alb_lack', albumName: 'For Lack of a Better Name', bpm: 128, valence: 0.54, energy: 0.86, danceability: 0.77, acousticness: 0.01, instrumentalness: 0.38, durationMs: 328000, genres: ['electro house'], isLiked: false, fromAlbum: false, playCount: 66, topRank: 28 },
  { id: 'demo_69', name: 'Strobe', artists: ['deadmau5'], albumId: 'alb_lack', albumName: 'For Lack of a Better Name', bpm: 128, valence: 0.39, energy: 0.66, danceability: 0.62, acousticness: 0.05, instrumentalness: 0.95, durationMs: 633000, genres: ['progressive house', 'instrumental'], isLiked: true, fromAlbum: false, playCount: 122, topRank: 8 },
  { id: 'demo_70', name: 'Aşkın Olayım', artists: ['Simge'], albumId: 'alb_benbazen', albumName: 'Ben Bazen', bpm: 120, valence: 0.69, energy: 0.72, danceability: 0.79, acousticness: 0.14, instrumentalness: 0.00, durationMs: 252000, genres: ['turkish pop'], isLiked: true, fromAlbum: false, playCount: 99, topRank: 14 },
  { id: 'demo_71', name: 'Dönence', artists: ['Barış Manço'], albumId: 'alb_sozum', albumName: 'Sözüm Meclisten Dışarı', bpm: 108, valence: 0.26, energy: 0.58, danceability: 0.44, acousticness: 0.29, instrumentalness: 0.31, durationMs: 344000, genres: ['anatolian rock'], isLiked: true, fromAlbum: false, playCount: 104, topRank: 13 },
  { id: 'demo_72', name: 'Gülpembe', artists: ['Barış Manço'], albumId: 'alb_sozum', albumName: 'Sözüm Meclisten Dışarı', bpm: 82, valence: 0.33, energy: 0.41, danceability: 0.46, acousticness: 0.54, instrumentalness: 0.08, durationMs: 302000, genres: ['anatolian rock'], isLiked: true, fromAlbum: false, playCount: 93, topRank: 16 },

  // --- 149 - 174 BPM (Fast Rock / Drum & Bass / High-BPM Workout & Peak) ---
  { id: 'demo_73', name: 'Everlong', artists: ['Foo Fighters'], albumId: 'alb_colour', albumName: 'The Colour and the Shape', bpm: 158, valence: 0.48, energy: 0.90, danceability: 0.44, acousticness: 0.01, instrumentalness: 0.02, durationMs: 250000, genres: ['alternative rock'], isLiked: true, fromAlbum: false, playCount: 131, topRank: 7 },
  { id: 'demo_74', name: 'Sabotage', artists: ['Beastie Boys'], albumId: 'alb_ill', albumName: 'Ill Communication', bpm: 168, valence: 0.46, energy: 0.94, danceability: 0.51, acousticness: 0.02, instrumentalness: 0.04, durationMs: 178000, genres: ['rap rock', 'alternative'], isLiked: true, fromAlbum: false, playCount: 71, topRank: 25 },
  { id: 'demo_75', name: 'B.O.B. - Bombs Over Baghdad', artists: ['Outkast'], albumId: 'alb_stankonia', albumName: 'Stankonia', bpm: 154, valence: 0.72, energy: 0.95, danceability: 0.73, acousticness: 0.02, instrumentalness: 0.00, durationMs: 304000, genres: ['hip hop'], isLiked: true, fromAlbum: false, playCount: 85, topRank: 20 },
  { id: 'demo_76', name: 'Tarantula', artists: ['Pendulum'], albumId: 'alb_hold', albumName: 'Hold Your Colour', bpm: 174, valence: 0.34, energy: 0.96, danceability: 0.61, acousticness: 0.01, instrumentalness: 0.31, durationMs: 331000, genres: ['drum and bass'], isLiked: true, fromAlbum: false, playCount: 78, topRank: 22 },
  { id: 'demo_77', name: 'Watercolour', artists: ['Pendulum'], albumId: 'alb_immersion', albumName: 'Immersion', bpm: 174, valence: 0.49, energy: 0.95, danceability: 0.58, acousticness: 0.01, instrumentalness: 0.19, durationMs: 304000, genres: ['drum and bass'], isLiked: false, fromAlbum: false, playCount: 49, topRank: null },
  { id: 'demo_78', name: 'Hey Ya!', artists: ['Outkast'], albumId: 'alb_speakerboxxx', albumName: 'Speakerboxxx/The Love Below', bpm: 160, valence: 0.96, energy: 0.93, danceability: 0.73, acousticness: 0.10, instrumentalness: 0.00, durationMs: 235000, genres: ['funk', 'pop rap'], isLiked: true, fromAlbum: false, playCount: 113, topRank: 11 },
  { id: 'demo_79', name: 'Kuzu Kuzu', artists: ['Tarkan'], albumId: 'alb_karma', albumName: 'Karma', bpm: 126, valence: 0.83, energy: 0.84, danceability: 0.85, acousticness: 0.12, instrumentalness: 0.00, durationMs: 234000, genres: ['turkish pop'], isLiked: true, fromAlbum: true, playCount: 125, topRank: 8 },
  { id: 'demo_80', name: 'Hüp', artists: ['Tarkan'], albumId: 'alb_karma', albumName: 'Karma', bpm: 132, valence: 0.78, energy: 0.86, danceability: 0.83, acousticness: 0.08, instrumentalness: 0.01, durationMs: 221000, genres: ['turkish pop'], isLiked: false, fromAlbum: true, playCount: 61, topRank: 29 },
  { id: 'demo_81', name: 'Dudu', artists: ['Tarkan'], albumId: 'alb_dudu', albumName: 'Dudu', bpm: 128, valence: 0.86, energy: 0.82, danceability: 0.84, acousticness: 0.14, instrumentalness: 0.00, durationMs: 274000, genres: ['turkish pop'], isLiked: true, fromAlbum: false, playCount: 103, topRank: 13 },

  // --- Acoustic / Lo-fi / Ambient / Late-Night Focus cluster (70 - 100 BPM) ---
  { id: 'demo_82', name: 'Holocene', artists: ['Bon Iver'], albumId: 'alb_boniver', albumName: 'Bon Iver', bpm: 74, valence: 0.21, energy: 0.28, danceability: 0.39, acousticness: 0.84, instrumentalness: 0.22, durationMs: 336000, genres: ['indie folk'], isLiked: true, fromAlbum: false, playCount: 81, topRank: 21 },
  { id: 'demo_83', name: 'Kafama Göre', artists: ['Athena'], albumId: 'alb_pis', albumName: 'Pis', bpm: 140, valence: 0.77, energy: 0.89, danceability: 0.64, acousticness: 0.04, instrumentalness: 0.00, durationMs: 211000, genres: ['turkish ska', 'punk rock'], isLiked: true, fromAlbum: false, playCount: 110, topRank: 12 },
  { id: 'demo_84', name: 'Ben Böyleyim', artists: ['Athena'], albumId: 'alb_pis', albumName: 'Pis', bpm: 136, valence: 0.58, energy: 0.85, danceability: 0.62, acousticness: 0.05, instrumentalness: 0.00, durationMs: 204000, genres: ['turkish rock'], isLiked: false, fromAlbum: false, playCount: 57, topRank: null },
  { id: 'demo_85', name: 'Nights', artists: ['Frank Ocean'], albumId: 'alb_blonde', albumName: 'Blonde', bpm: 90, valence: 0.42, energy: 0.55, danceability: 0.56, acousticness: 0.39, instrumentalness: 0.04, durationMs: 307000, genres: ['alternative r&b'], isLiked: true, fromAlbum: true, playCount: 147, topRank: 4 },
  { id: 'demo_86', name: 'Pink + White', artists: ['Frank Ocean'], albumId: 'alb_blonde', albumName: 'Blonde', bpm: 80, valence: 0.56, energy: 0.46, danceability: 0.54, acousticness: 0.67, instrumentalness: 0.01, durationMs: 184000, genres: ['alternative r&b'], isLiked: true, fromAlbum: true, playCount: 119, topRank: 9 },
  { id: 'demo_87', name: 'Ivy', artists: ['Frank Ocean'], albumId: 'alb_blonde', albumName: 'Blonde', bpm: 116, valence: 0.34, energy: 0.38, danceability: 0.55, acousticness: 0.72, instrumentalness: 0.01, durationMs: 249000, genres: ['alternative r&b'], isLiked: false, fromAlbum: true, playCount: 65, topRank: 28 },
  { id: 'demo_88', name: 'Kiğılı değil, Kalbim', artists: ['Kalben'], albumId: 'alb_kalben', albumName: 'Kalben', bpm: 86, valence: 0.37, energy: 0.33, danceability: 0.48, acousticness: 0.79, instrumentalness: 0.02, durationMs: 215000, genres: ['turkish indie', 'acoustic'], isLiked: true, fromAlbum: false, playCount: 70, topRank: 25 },
  { id: 'demo_89', name: 'Sadece', artists: ['Kalben'], albumId: 'alb_kalben', albumName: 'Kalben', bpm: 78, valence: 0.32, energy: 0.29, danceability: 0.45, acousticness: 0.85, instrumentalness: 0.01, durationMs: 229000, genres: ['turkish indie', 'acoustic'], isLiked: true, fromAlbum: false, playCount: 88, topRank: 19 },
  { id: 'demo_90', name: 'Kişisel Bir Şey', artists: ['Yüzyüzeyken Konuşuruz'], albumId: 'alb_akustik', albumName: 'Akustik Travma', bpm: 114, valence: 0.44, energy: 0.67, danceability: 0.63, acousticness: 0.17, instrumentalness: 0.02, durationMs: 238000, genres: ['turkish indie'], isLiked: true, fromAlbum: false, playCount: 107, topRank: 12 },
  { id: 'demo_91', name: 'Dinle Beni Bi\'', artists: ['Yüzyüzeyken Konuşuruz'], albumId: 'alb_akustik', albumName: 'Akustik Travma', bpm: 120, valence: 0.49, energy: 0.71, danceability: 0.68, acousticness: 0.13, instrumentalness: 0.01, durationMs: 226000, genres: ['turkish indie'], isLiked: true, fromAlbum: false, playCount: 95, topRank: 16 },
  { id: 'demo_92', name: 'Avare', artists: ['Adamlar'], albumId: 'alb_dunya_gunluk', albumName: 'Dünya Günlükleri', bpm: 102, valence: 0.43, energy: 0.69, danceability: 0.59, acousticness: 0.14, instrumentalness: 0.02, durationMs: 244000, genres: ['turkish indie rock'], isLiked: true, fromAlbum: false, playCount: 84, topRank: 20 },
  { id: 'demo_93', name: 'Zombi', artists: ['Adamlar'], albumId: 'alb_dunya_gunluk', albumName: 'Dünya Günlükleri', bpm: 124, valence: 0.38, energy: 0.82, danceability: 0.63, acousticness: 0.07, instrumentalness: 0.01, durationMs: 231000, genres: ['turkish indie rock'], isLiked: false, fromAlbum: false, playCount: 53, topRank: null },
  { id: 'demo_94', name: 'Avuç İçi', artists: ['Ceylan Ertem'], albumId: 'alb_amansiz', albumName: 'Amansız Gücenik', bpm: 76, valence: 0.25, energy: 0.36, danceability: 0.41, acousticness: 0.74, instrumentalness: 0.03, durationMs: 268000, genres: ['turkish alternative'], isLiked: true, fromAlbum: false, playCount: 60, topRank: 30 },
  { id: 'demo_95', name: 'Sunset Lover', artists: ['Petit Biscuit'], albumId: 'alb_pb', albumName: 'Presence', bpm: 91, valence: 0.66, energy: 0.49, danceability: 0.75, acousticness: 0.38, instrumentalness: 0.78, durationMs: 237000, genres: ['chillwave', 'electronic'], isLiked: true, fromAlbum: false, playCount: 90, topRank: 17 },
  { id: 'demo_96', name: 'Breathe (In the Air)', artists: ['Pink Floyd'], albumId: 'alb_dsotm', albumName: 'The Dark Side of the Moon', bpm: 64, valence: 0.39, energy: 0.31, danceability: 0.38, acousticness: 0.52, instrumentalness: 0.37, durationMs: 169000, genres: ['progressive rock'], isLiked: true, fromAlbum: true, playCount: 100, topRank: 14 },
];

export function getDemoLibrary() {
  const albumMap = new Map();

  const tracks = RAW_DEMO_TRACKS.map((t, index) => {
    if (t.fromAlbum && !albumMap.has(t.albumId)) {
      albumMap.set(t.albumId, {
        id: t.albumId,
        name: t.albumName,
        artist: t.artists[0],
        releaseYear: 2010 + (index % 15),
        totalTracks: 0,
        savedAt: new Date(Date.now() - index * 86400000).toISOString(),
      });
    }
    if (t.fromAlbum && albumMap.has(t.albumId)) {
      albumMap.get(t.albumId).totalTracks += 1;
    }

    // Deterministic realistic musical key/mode derived from valence + index
    const musicalMode = t.valence >= 0.54 ? 1 : 0;
    const musicalKey = (index * 5 + Math.round(t.bpm)) % 12;

    return {
      ...t,
      musicalKey,
      musicalMode,
      uri: `spotify:track:${t.id}`,
      featureSource: 'measured',
      manualOverride: false,
      addedAt: new Date(Date.now() - index * 43200000).toISOString(),
    };
  });

  // Generate realistic 28-day listening history across Morning / Afternoon / Evening / Night
  const listeningEvents = [];
  const morningPool = tracks.filter((t) => t.bpm <= 96 && t.acousticness >= 0.25);
  const afternoonPool = tracks.filter((t) => t.bpm >= 92 && t.bpm <= 122);
  const eveningPool = tracks.filter((t) => t.bpm >= 115 && t.energy >= 0.70);
  const nightPool = tracks.filter((t) => t.valence <= 0.44);

  const now = Date.now();
  const DAY_MS = 86400000;
  for (let d = 0; d < 28; d += 1) {
    const baseDay = new Date(now - d * DAY_MS);
    const yyyy = baseDay.getUTCFullYear();
    const mm = String(baseDay.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(baseDay.getUTCDate()).padStart(2, '0');

    const schedule = [
      { hour: 8 + (d % 3), pool: morningPool, count: 2 },
      { hour: 13 + (d % 4), pool: afternoonPool, count: 2 },
      { hour: 19 + (d % 3), pool: eveningPool, count: 2 + (d % 2) },
      { hour: 23, pool: nightPool, count: d % 3 === 0 ? 2 : 1 },
    ];

    for (const slot of schedule) {
      if (slot.pool.length === 0) continue;
      for (let k = 0; k < slot.count; k += 1) {
        const tr = slot.pool[(d * 7 + slot.hour * 3 + k * 5) % slot.pool.length];
        const hh = String(slot.hour).padStart(2, '0');
        const min = String((k * 17 + d * 3) % 60).padStart(2, '0');
        listeningEvents.push({
          trackId: tr.id,
          trackName: tr.name,
          artistName: tr.artists[0],
          playedAt: `${yyyy}-${mm}-${dd}T${hh}:${min}:00.000Z`,
          msPlayed: tr.durationMs || 220000,
        });
      }
    }
  }

  return {
    tracks,
    albums: Array.from(albumMap.values()),
    listeningEvents,
  };
}
