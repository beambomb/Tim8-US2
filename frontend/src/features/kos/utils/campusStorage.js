const STORAGE_KEY = 'carikos:savedCampuses';

export const DEFAULT_CAMPUS = {
  id: 'UGM',
  shortName: 'UGM',
  nama: 'UGM (Universitas Gadjah Mada)',
  kota: 'Sleman / Yogyakarta',
  latitude: -7.7713,
  longitude: 110.3775,
  source: 'preset',
  isDefault: true,
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

const CAMPUS_QUERY_ALIASES = {
  unhas: 'Universitas Hasanuddin',
  undip: 'Universitas Diponegoro',
  unpad: 'Universitas Padjadjaran',
  unair: 'Universitas Airlangga',
  uns: 'Universitas Sebelas Maret',
  usu: 'Universitas Sumatera Utara',
  ub: 'Universitas Brawijaya',
  unibraw: 'Universitas Brawijaya',
  its: 'Institut Teknologi Sepuluh Nopember',
  ipb: 'Institut Pertanian Bogor',
  upi: 'Universitas Pendidikan Indonesia',
  unnes: 'Universitas Negeri Semarang',
  unsoed: 'Universitas Jenderal Soedirman',
  unud: 'Universitas Udayana',
  unm: 'Universitas Negeri Makassar',
  um: 'Universitas Negeri Malang',
  unila: 'Universitas Lampung',
  unsri: 'Universitas Sriwijaya',
  unand: 'Universitas Andalas',
  untar: 'Universitas Tarumanagara',
  trisakti: 'Universitas Trisakti',
  binus: 'Universitas Bina Nusantara',
  telkom: 'Telkom University',
  ums: 'Universitas Muhammadiyah Surakarta',
  umy: 'Universitas Muhammadiyah Yogyakarta',
  uad: 'Universitas Ahmad Dahlan',
};

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

  return {
    id: `osm_${item.osm_type || 'n'}_${item.osm_id || `${item.lat}_${item.lon}`}`,
    shortName: primaryName.split(/\s+/).slice(0, 3).join(' '),
    nama: primaryName,
    kota: city,
    latitude: Number(Number(item.lat).toFixed(6)),
    longitude: Number(Number(item.lon).toFixed(6)),
    source: 'nominatim',
  };
}

/**
 * Fallback pencarian kampus langsung dari browser via OpenStreetMap Nominatim
 * ketika endpoint backend tidak terjangkau atau belum di-restart.
 */
export async function searchCampusesDirectly(
  rawQuery = '',
  presets = POPULAR_CAMPUS_PRESETS
) {
  const normalized = String(rawQuery || '').trim();
  const queryLower = normalized.toLowerCase();

  const presetMatches = (presets || []).filter(
    (item) =>
      item.id?.toLowerCase().includes(queryLower) ||
      item.shortName?.toLowerCase().includes(queryLower) ||
      item.nama?.toLowerCase().includes(queryLower) ||
      item.kota?.toLowerCase().includes(queryLower)
  );

  if (normalized.length < 2) {
    return presetMatches;
  }

  const nominatimQuery = CAMPUS_QUERY_ALIASES[queryLower] || normalized;
  const url = new URL('https://nominatim.openstreetmap.org/search');
  url.searchParams.set('format', 'jsonv2');
  url.searchParams.set('addressdetails', '1');
  url.searchParams.set('countrycodes', 'id');
  url.searchParams.set('limit', '8');
  url.searchParams.set('q', nominatimQuery);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000);

  let nominatimMatches = [];
  let networkFailed = false;
  try {
    const response = await fetch(url.toString(), {
      signal: controller.signal,
      headers: {
        'Accept-Language': 'id,en;q=0.8',
      },
    });
    if (!response.ok) {
      networkFailed = true;
    } else {
      const payload = await response.json();
      if (Array.isArray(payload)) {
        nominatimMatches = payload
          .filter((item) => item?.lat && item?.lon)
          .map(formatNominatimPlace);
      }
    }
  } catch {
    networkFailed = true;
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

  if (networkFailed && merged.length === 0) {
    throw new Error('NOMINATIM_UNREACHABLE');
  }

  return merged;
}
