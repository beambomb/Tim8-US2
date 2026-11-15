const STORAGE_KEY = 'carikos:savedCampuses';

export const DEFAULT_CAMPUS = {
  id: 'UGM',
  shortName: 'UGM',
  nama: 'UGM (Universitas Gadjah Mada)',
  kota: 'Sleman / Yogyakarta',
  latitude: -7.7713,
  longitude: 110.3775,
  source: 'preset',
};

export const POPULAR_CAMPUS_PRESETS = [
  DEFAULT_CAMPUS,
  {
    id: 'UNY',
    shortName: 'UNY',
    nama: 'UNY (Universitas Negeri Yogyakarta)',
    kota: 'Yogyakarta',
    latitude: -7.7749,
    longitude: 110.3867,
    source: 'preset',
  },
  {
    id: 'UPN',
    shortName: 'UPN',
    nama: 'UPN "Veteran" Yogyakarta',
    kota: 'Sleman',
    latitude: -7.7618,
    longitude: 110.4087,
    source: 'preset',
  },
  {
    id: 'UII',
    shortName: 'UII',
    nama: 'UII Kampus Terpadu',
    kota: 'Kaliurang, Sleman',
    latitude: -7.6878,
    longitude: 110.4137,
    source: 'preset',
  },
  {
    id: 'ITB',
    shortName: 'ITB',
    nama: 'ITB (Institut Teknologi Bandung)',
    kota: 'Bandung',
    latitude: -6.8915,
    longitude: 107.6107,
    source: 'preset',
  },
  {
    id: 'UI',
    shortName: 'UI',
    nama: 'UI (Universitas Indonesia)',
    kota: 'Depok',
    latitude: -6.3653,
    longitude: 106.8286,
    source: 'preset',
  },
];

export function mergeWithDefaultCampus(customList = []) {
  const result = [DEFAULT_CAMPUS];
  const seenIds = new Set([DEFAULT_CAMPUS.id]);

  for (const item of customList || []) {
    if (!item?.id || !Number.isFinite(Number(item.latitude)) || !Number.isFinite(Number(item.longitude))) {
      continue;
    }
    if (seenIds.has(item.id)) continue;
    seenIds.add(item.id);
    result.push({
      id: String(item.id),
      shortName: String(item.shortName || item.nama || item.id),
      nama: String(item.nama || item.shortName || item.id),
      kota: String(item.kota || ''),
      latitude: Number(item.latitude),
      longitude: Number(item.longitude),
      source: item.source || 'custom',
    });
  }

  return result;
}

export function loadGuestCampuses() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveGuestCampuses(campuses) {
  if (typeof window === 'undefined') return;
  try {
    const customOnly = (campuses || []).filter((item) => item?.id !== DEFAULT_CAMPUS.id);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(customOnly));
  } catch {
    // Abaikan error quota/private browsing
  }
}
