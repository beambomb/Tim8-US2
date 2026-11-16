'use client';

import { useEffect, useRef, useState } from 'react';

const DEFAULT_CENTER = { lat: -7.766, lng: 110.374 };

function parseCoord(value, fallback) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

/**
 * Interactive OpenStreetMap (Leaflet) pin-picker for selecting kos coordinates
 * without requiring any paid Maps API key.
 */
export default function KosMapPicker({
  latitude,
  longitude,
  addressQuery = '',
  onChangeCoords,
}) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const onChangeRef = useRef(onChangeCoords);

  const [searchText, setSearchText] = useState('');
  const [searching, setSearching] = useState(false);
  const [locating, setLocating] = useState(false);
  const [mapNotice, setMapNotice] = useState(null);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    onChangeRef.current = onChangeCoords;
  }, [onChangeCoords]);

  const activeLat = parseCoord(latitude, DEFAULT_CENTER.lat);
  const activeLng = parseCoord(longitude, DEFAULT_CENTER.lng);

  useEffect(() => {
    let cancelled = false;
    let mapInstance = null;

    async function initMap() {
      if (!containerRef.current || typeof window === 'undefined') return;

      try {
        await import('leaflet/dist/leaflet.css');
        const leafletMod = await import('leaflet');
        const L = leafletMod.default || leafletMod;
        if (cancelled || !containerRef.current) return;

        mapInstance = L.map(containerRef.current, {
          center: [activeLat, activeLng],
          zoom: 15,
          zoomControl: true,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors',
          maxZoom: 19,
        }).addTo(mapInstance);

        const pinIcon = L.divIcon({
          className: 'carikos-map-pin',
          html: '<div style="width:28px;height:28px;border-radius:9999px;background:#1D4ED8;border:3px solid #FFFFFF;box-shadow:0 4px 10px rgba(15,23,42,0.35);"></div>',
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        const marker = L.marker([activeLat, activeLng], {
          draggable: true,
          icon: pinIcon,
        }).addTo(mapInstance);

        marker.on('dragend', () => {
          const pos = marker.getLatLng();
          onChangeRef.current?.(
            Number(pos.lat.toFixed(6)),
            Number(pos.lng.toFixed(6))
          );
        });

        mapInstance.on('click', (event) => {
          const { lat, lng } = event.latlng;
          marker.setLatLng([lat, lng]);
          onChangeRef.current?.(Number(lat.toFixed(6)), Number(lng.toFixed(6)));
        });

        mapRef.current = mapInstance;
        markerRef.current = marker;
        setMapReady(true);
      } catch {
        if (!cancelled) {
          setMapNotice(
            'Peta interaktif tidak dapat dimuat. Anda masih bisa mengisi Latitude dan Longitude secara manual.'
          );
        }
      }
    }

    initMap();

    return () => {
      cancelled = true;
      if (mapInstance) {
        mapInstance.remove();
      }
      mapRef.current = null;
      markerRef.current = null;
      setMapReady(false);
    };
    // Initialize map once; subsequent coordinate changes sync via ref below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!mapReady || !mapRef.current || !markerRef.current) return;
    if (!Number.isFinite(Number(latitude)) || !Number.isFinite(Number(longitude))) {
      return;
    }
    const nextLat = Number(latitude);
    const nextLng = Number(longitude);
    markerRef.current.setLatLng([nextLat, nextLng]);
    mapRef.current.setView([nextLat, nextLng], mapRef.current.getZoom());
  }, [latitude, longitude, mapReady]);

  const moveMapTo = (lat, lng, zoom = 16) => {
    const roundedLat = Number(lat.toFixed(6));
    const roundedLng = Number(lng.toFixed(6));
    onChangeCoords?.(roundedLat, roundedLng);
    if (markerRef.current) {
      markerRef.current.setLatLng([roundedLat, roundedLng]);
    }
    if (mapRef.current) {
      mapRef.current.setView([roundedLat, roundedLng], zoom);
    }
  };

  const handleSearchAddress = async (rawQuery) => {
    const query = String(rawQuery || '').trim();
    if (!query) {
      setMapNotice('Masukkan nama jalan, kelurahan, atau area untuk dicari.');
      return;
    }

    setSearching(true);
    setMapNotice(null);
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=id&q=${encodeURIComponent(
        query
      )}`;
      const res = await fetch(url, {
        headers: { Accept: 'application/json' },
      });
      if (!res.ok) {
        throw new Error('Nominatim request failed');
      }
      const data = await res.json();
      if (!Array.isArray(data) || data.length === 0) {
        setMapNotice(
          `Lokasi "${query}" tidak ditemukan. Coba tambah nama kota atau klik langsung di peta.`
        );
        return;
      }

      const lat = Number(data[0].lat);
      const lng = Number(data[0].lon);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        throw new Error('Koordinat tidak valid');
      }
      moveMapTo(lat, lng, 16);
    } catch {
      setMapNotice(
        'Pencarian peta sedang tidak tersedia. Klik langsung pada peta atau isi koordinat manual.'
      );
    } finally {
      setSearching(false);
    }
  };

  const handleUseMyLocation = () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setMapNotice('Browser Anda tidak mendukung fitur lokasi GPS.');
      return;
    }
    setLocating(true);
    setMapNotice(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        moveMapTo(position.coords.latitude, position.coords.longitude, 17);
        setLocating(false);
      },
      () => {
        setLocating(false);
        setMapNotice(
          'Izin lokasi ditolak atau gagal membaca GPS perangkat Anda.'
        );
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex flex-1 gap-2">
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSearchAddress(searchText);
              }
            }}
            placeholder="Cari jalan atau area di peta (contoh: Warungboto Yogyakarta)..."
            aria-label="Cari lokasi di peta"
            className="flex-1 px-3 py-2 rounded-lg bg-[#FFFFFF] border border-[#CBD5E1] text-xs text-[#0F172A] placeholder-[#64748B] focus:outline-none focus:border-[var(--accent)]"
          />
          <button
            type="button"
            disabled={searching}
            onClick={() => handleSearchAddress(searchText)}
            className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-[#EEF2F7] hover:bg-[#E2E8F0] text-[#0F172A] border border-[#CBD5E1] disabled:opacity-50 transition-colors cursor-pointer shrink-0"
          >
            {searching ? 'Mencari...' : 'Cari Peta'}
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {addressQuery.trim() && (
            <button
              type="button"
              disabled={searching}
              onClick={() => handleSearchAddress(addressQuery)}
              className="px-3 py-2 rounded-lg text-xs font-medium bg-[#EFF6FF] hover:bg-[#DBEAFE] text-[#1D4ED8] border border-[#BFDBFE] disabled:opacity-50 transition-colors cursor-pointer shrink-0"
            >
              Cocokkan Alamat
            </button>
          )}
          <button
            type="button"
            disabled={locating}
            onClick={handleUseMyLocation}
            className="px-3 py-2 rounded-lg text-xs font-medium bg-[#FFFFFF] hover:bg-[#F8FAFC] text-[#0F172A] border border-[#CBD5E1] disabled:opacity-50 transition-colors cursor-pointer shrink-0"
          >
            {locating ? 'Mengambil GPS...' : 'Lokasi Saya'}
          </button>
        </div>
      </div>

      {mapNotice && (
        <p className="text-xs text-[#92400E] bg-[#FFFBEB] border border-[#FDE68A] rounded-lg px-3 py-2">
          {mapNotice}
        </p>
      )}

      <div
        ref={containerRef}
        aria-label="Peta interaktif pilih lokasi kos"
        className="w-full h-64 sm:h-72 rounded-xl border border-[#CBD5E1] bg-[#EEF2F7] overflow-hidden relative z-0"
      />

      <p className="text-xs text-[#475569]">
        Klik titik mana saja di peta atau geser penanda biru untuk mengisi Latitude dan Longitude secara otomatis.
      </p>
    </div>
  );
}
