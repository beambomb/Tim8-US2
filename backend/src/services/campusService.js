const CACHE_TTL_MS = 10 * 60 * 1000;
const MAX_CACHE_ENTRIES = 100;
const NOMINATIM_TIMEOUT_MS = 6000;

export const POPULAR_CAMPUSES = [
  {
    id: 'UGM',
    shortName: 'UGM',
    nama: 'UGM (Universitas Gadjah Mada)',
    kota: 'Sleman / Yogyakarta',
    latitude: -7.7713,
    longitude: 110.3775,
    source: 'preset',
  },
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

// In-memory TTL cache for geocoding query results
const campusSearchCache = new Map();

function pruneCache() {
  const now = Date.now();
  for (const [key, entry] of campusSearchCache.entries()) {
    if (entry.expiresAt <= now) {
      campusSearchCache.delete(key);
    }
  }
  while (campusSearchCache.size >= MAX_CACHE_ENTRIES) {
    const oldestKey = campusSearchCache.keys().next().value;
    if (!oldestKey) break;
    campusSearchCache.delete(oldestKey);
  }
}

function formatNominatimPlace(item) {
  const addr = item.address || {};
  const primaryName =
    item.name ||
    addr.university ||
    addr.college ||
    addr.amenity ||
    String(item.display_name || '').split(',')[0]?.trim() ||
    'Lokasi Kampus';

  const city =
    addr.city ||
    addr.town ||
    addr.county ||
    addr.municipality ||
    addr.state_district ||
    addr.state ||
    'Indonesia';

  const shortWords = primaryName.split(/\s+/).slice(0, 3).join(' ');

  return {
    id: `osm_${item.osm_type || 'n'}_${item.osm_id || `${item.lat}_${item.lon}`}`,
    shortName: shortWords,
    nama: primaryName,
    kota: city,
    latitude: Number(Number(item.lat).toFixed(6)),
    longitude: Number(Number(item.lon).toFixed(6)),
    source: 'nominatim',
  };
}

function matchPresets(queryLower) {
  if (!queryLower) return POPULAR_CAMPUSES;
  return POPULAR_CAMPUSES.filter(
    (item) =>
      item.id.toLowerCase().includes(queryLower) ||
      item.shortName.toLowerCase().includes(queryLower) ||
      item.nama.toLowerCase().includes(queryLower) ||
      item.kota.toLowerCase().includes(queryLower)
  );
}

/**
 * Mencari lokasi kampus berdasarkan kata kunci lewat OpenStreetMap Nominatim
 * dengan fallback preset kampus populer dan in-memory TTL cache (10 menit).
 */
export async function searchCampusesService(rawQuery = '') {
  const normalizedQuery = String(rawQuery || '').trim();
  const cacheKey = normalizedQuery.toLowerCase();

  if (!normalizedQuery) {
    return { results: POPULAR_CAMPUSES, cached: false };
  }

  const cachedEntry = campusSearchCache.get(cacheKey);
  if (cachedEntry && cachedEntry.expiresAt > Date.now()) {
    return { results: cachedEntry.results, cached: true };
  }

  const presetMatches = matchPresets(cacheKey);

  if (normalizedQuery.length < 2) {
    return { results: presetMatches, cached: false };
  }

  let nominatimMatches = [];
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), NOMINATIM_TIMEOUT_MS);

  try {
    const url = new URL('https://nominatim.openstreetmap.org/search');
    url.searchParams.set('format', 'jsonv2');
    url.searchParams.set('addressdetails', '1');
    url.searchParams.set('countrycodes', 'id');
    url.searchParams.set('limit', '8');
    url.searchParams.set('q', normalizedQuery);

    const response = await fetch(url.toString(), {
      signal: controller.signal,
      headers: {
        'User-Agent': 'CariKosApp/1.0 (student-housing-locator)',
        'Accept-Language': 'id,en;q=0.8',
      },
    });

    if (response.ok) {
      const payload = await response.json();
      if (Array.isArray(payload)) {
        nominatimMatches = payload
          .filter((item) => item?.lat && item?.lon)
          .map(formatNominatimPlace);
      }
    }
  } catch {
    // Abaikan kegagalan jaringan/timeout Nominatim; tetap kembalikan preset lokal
  } finally {
    clearTimeout(timeoutId);
  }

  const merged = [...presetMatches];
  for (const candidate of nominatimMatches) {
    const isDuplicate = merged.some(
      (existing) =>
        existing.nama.toLowerCase() === candidate.nama.toLowerCase() ||
        (Math.abs(existing.latitude - candidate.latitude) < 0.002 &&
          Math.abs(existing.longitude - candidate.longitude) < 0.002)
    );
    if (!isDuplicate) {
      merged.push(candidate);
    }
  }

  pruneCache();
  campusSearchCache.set(cacheKey, {
    results: merged,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });

  return { results: merged, cached: false };
}
