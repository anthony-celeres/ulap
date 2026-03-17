"use client";

interface CityData {
  name: string;
  country: string;
  condition: string;
  icon: string;
  temp: number;
}

export default function CitiesList({ cities }: { cities: CityData[] }) {
  return (
    <div className="cities-section">
      <div className="flex items-center justify-between mb-3.5 cities-header">
        <h3 className="text-sm font-semibold">Other large cities</h3>
        <span className="text-xs text-[#7c3aed] cursor-pointer show-all">Show All ›</span>
      </div>

      <div className="flex flex-col gap-2">
        {cities.map((city, idx) => (
          <div key={idx} className="flex items-center justify-between p-3 px-4 bg-white border border-[#e2e8f0] rounded-xl city-card">
            <div className="flex flex-col gap-0.5 city-info">
              <span className="text-[11px] text-[#64748b] city-country">{city.country}</span>
              <span className="text-sm font-semibold city-name">{city.name}</span>
              <span className="text-[11px] text-[#64748b] city-cond">{city.condition}</span>
            </div>
            <div className="flex items-center gap-2 city-right">
              <div className="text-[26px] city-icon">{city.icon}</div>
              <div className="text-xl font-bold city-temp">{city.temp}°</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
