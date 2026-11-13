'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { ownerService } from '../services/ownerService';

/**
 * Custom Hook for Owner Dashboard Metrics & Analytics Aggregation
 * Aggregates GET /api/owner/kos and GET /api/bookings/owner
 */
export function useOwnerDashboard() {
  const [kosList, setKosList] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let ignore = false;

    const execute = async () => {
      try {
        const [kosRes, bookingsRes] = await Promise.all([
          ownerService.getOwnerKos(),
          ownerService.getOwnerBookings(),
        ]);

        if (!ignore) {
          setKosList(kosRes.data || []);
          setBookings(bookingsRes.data || []);
          setError(null);
        }
      } catch (err) {
        if (!ignore) {
          setError(
            err.response?.data?.message ||
              'Gagal memuat ringkasan data analitik dashboard pemilik.'
          );
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    };

    execute();

    return () => {
      ignore = true;
    };
  }, []);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [kosRes, bookingsRes] = await Promise.all([
        ownerService.getOwnerKos(),
        ownerService.getOwnerBookings(),
      ]);

      setKosList(kosRes.data || []);
      setBookings(bookingsRes.data || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Gagal memuat ringkasan data analitik dashboard pemilik.'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Aggregate comprehensive business metrics
  const metrics = useMemo(() => {
    const totalKos = kosList.length;

    let totalKamar = 0;
    let kamarTersedia = 0;
    let approvedKos = 0;
    let pendingKos = 0;
    let rejectedKos = 0;

    kosList.forEach((k) => {
      const kamar = Number(k.jumlahKamar) || 0;
      const tersedia = Number(k.jumlahKamarTersedia) || 0;
      totalKamar += kamar;
      kamarTersedia += Math.min(tersedia, kamar);

      if (k.statusVerifikasi === 'Approved') approvedKos += 1;
      else if (k.statusVerifikasi === 'Pending') pendingKos += 1;
      else if (k.statusVerifikasi === 'Rejected') rejectedKos += 1;
    });

    const kamarTerisi = Math.max(0, totalKamar - kamarTersedia);
    const okupansi = totalKamar > 0 ? Math.round((kamarTerisi / totalKamar) * 100) : 0;

    let bookingPending = 0;
    let bookingApproved = 0;
    let bookingRejected = 0;
    let estimatedIncome = 0;

    bookings.forEach((b) => {
      const status = (b.status || '').toUpperCase();
      if (status === 'PENDING') bookingPending += 1;
      else if (status === 'DISETUJUI') {
        bookingApproved += 1;
        const hargaBulan = b.kosId?.harga || 0;
        const durasi = Number(b.durasiBulan) || 1;
        estimatedIncome += hargaBulan * durasi;
      } else if (status === 'DITOLAK') {
        bookingRejected += 1;
      }
    });

    return {
      totalKos,
      totalKamar,
      kamarTersedia,
      kamarTerisi,
      okupansi,
      statusCounts: {
        approved: approvedKos,
        pending: pendingKos,
        rejected: rejectedKos,
      },
      totalBookings: bookings.length,
      bookingPending,
      bookingApproved,
      bookingRejected,
      estimatedIncome,
    };
  }, [kosList, bookings]);

  return {
    metrics,
    kosList,
    bookings,
    recentBookings: bookings.slice(0, 5),
    isLoading,
    error,
    refetch,
  };
}
