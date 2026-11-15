'use client';

export default function KosCatalogSkeleton({ count = 6 }) {
  const items = Array.from({ length: count });

  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5"
      aria-busy="true"
      aria-label="Memuat daftar kos"
    >
      {items.map((_, i) => (
        <div
          key={i}
          className="rounded-xl bg-[#FFFFFF] overflow-hidden flex flex-col"
        >
          {/* Compact 16:9 photo placeholder */}
          <div className="aspect-[16/9] w-full bg-[#EEF2F7] relative">
            <div className="absolute top-2.5 left-2.5 h-5 w-16 bg-[#E2E8F0] rounded" />
          </div>

          {/* Compact body placeholder */}
          <div className="p-3.5 flex flex-col flex-1 justify-between gap-2.5">
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <div className="h-4 bg-[#EEF2F7] rounded w-12" />
                <div className="h-4 bg-[#EEF2F7] rounded w-14" />
              </div>
              <div className="h-4 bg-[#E2E8F0] rounded w-3/4" />
              <div className="h-3.5 bg-[#EEF2F7] rounded w-2/3" />
              <div className="h-3.5 bg-[#EEF2F7] rounded w-1/2" />
            </div>

            <div className="pt-1 flex items-center justify-between">
              <div className="h-5 bg-[#E2E8F0] rounded w-24" />
              <div className="h-7 bg-[#EEF2F7] rounded-lg w-16" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
