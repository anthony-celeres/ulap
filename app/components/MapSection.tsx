"use client";

export default function MapSection({ city }: { city: string }) {
  const mapSrc = `https://maps.google.com/maps?q=${encodeURIComponent(city)}&t=&z=13&ie=UTF8&iwloc=&output=embed`;

  return (
    <div className="p-[18px] bg-white border border-[#e2e8f0] rounded-2xl min-h-[260px] map-section">
      <div className="flex items-center justify-between mb-4 map-header">
        <h3 className="text-sm font-semibold">Global map</h3>
        <div className="flex items-center gap-1.5 bg-white border border-[#e2e8f0] rounded-lg py-1 px-3 text-xs text-[#64748b] cursor-pointer view-wide-btn">View wide ✨</div>
      </div>
      <div className="relative h-[200px] bg-[#f1f5f9] rounded-xl overflow-hidden map-body">
        <iframe
          width="100%"
          height="100%"
          frameBorder="0"
          style={{ border: 0, borderRadius: '12px' }}
          src={mapSrc}
          allowFullScreen
          title={`Google Map of ${city}`}
        ></iframe>

        <div className="absolute bottom-3.5 left-3.5 bg-white border border-[#e2e8f0] shadow-sm rounded-xl p-3 w-[165px] text-[#111] map-popup pointer-events-none opacity-90">
          <p className="text-[11px] font-medium leading-relaxed mb-2.5">Explore global map of wind, weather and oceans condition.</p>
          <button className="bg-[#7c3aed] text-white border-none rounded-lg p-1.5 text-[11px] font-semibold cursor-pointer w-full pointer-events-auto">Get started</button>
        </div>

        <div className="absolute bottom-3.5 right-12 text-[11px] text-[#c4b5fd] pointer-events-none">
          📍 <span>{city}</span>
        </div>
      </div>
    </div>
  );
}
