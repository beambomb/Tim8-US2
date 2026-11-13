'use client';

export default function KosCatalogSkeleton({ count = 6 }) {
  const items = Array.from({ length: count });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {items.map((_, i) => (
        <div
          key={i}
          className="rounded-xl bg-[#FFFFFF] border border-[#E2E8F0] overflow-hidden animate-pulse flex flex-col"
        >
          {/* Photo placeholder */}
          <div className="aspect-[16/10] w-full bg-[#EEF2F7] relative">
            <div className="absolute top-3 left-3 h-5 w-16 bg-[#E2E8F0] rounded" />
            <div className="absolute top-3 right-3 h-5 w-24 bg-[#E2E8F0] rounded" />
          </div>

          {/* Body placeholder */}
          <div className="p-4 flex flex-col flex-1 justify-between gap-4">
            <div className="flex flex-col gap-2">
              <div className="h-4 bg-[#E2E8F0] rounded w-3/4" />
              <div className="h-3 bg-[#EEF2F7] rounded w-1/2" />
              <div className="flex gap-1.5 mt-2">
                <div className="h-4 bg-[#EEF2F7] rounded w-16" />
                <div className="h-4 bg-[#EEF2F7] rounded w-20" />
                <div className="h-4 bg-[#EEF2F7] rounded w-14" />
              </div>
            </div>

            <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-between">
              <div className="h-5 bg-[#E2E8F0] rounded w-24" />
              <div className="h-7 bg-[#EEF2F7] rounded w-20" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
