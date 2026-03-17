"use client";

interface TopBarProps {
  city: string;
  onSearch: (city: string) => void;
  onCityInput: (city: string) => void;
  inputCity: string;
}

export default function TopBar({ city, onSearch, onCityInput, inputCity }: TopBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 mb-6 topbar">
      <div className="flex items-center gap-3 topbar-left">
        <div className="flex items-center justify-center text-lg cursor-pointer bg-white border border-[#e2e8f0] rounded-xl w-10 h-10 text-[#64748b]">⋮⋮</div>
        <div className="flex items-center justify-center text-lg cursor-pointer bg-white border border-[#e2e8f0] rounded-xl w-10 h-10 text-[#64748b]">🌤</div>
        <div className="flex items-center gap-2 bg-white border border-[#e2e8f0] rounded-xl py-2 px-4 text-sm font-medium location-badge">
          <span className="text-[#64748b]">📍</span> {city}
        </div>
      </div>

      <div className="relative flex-1 min-w-[200px] flex gap-2 search-wrap">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b] text-sm pointer-events-none">🔍</span>
        <input
          className="flex-1 bg-white border border-[#e2e8f0] rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[#7c3aed] transition-colors search-input"
          type="text"
          placeholder="Search city..."
          value={inputCity}
          onChange={(e) => onCityInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSearch(inputCity)}
        />
        <button
          className="bg-[#7c3aed] text-white border-none rounded-xl px-5 py-2.5 text-sm font-semibold cursor-pointer hover:opacity-85 transition-opacity whitespace-nowrap search-btn"
          onClick={() => onSearch(inputCity)}
        >
          Search
        </button>
      </div>

      <div className="flex gap-3 ml-auto topbar-right">
        <div className="flex items-center justify-center text-lg cursor-pointer bg-white border border-[#e2e8f0] rounded-xl w-10 h-10 text-[#64748b]">⚙️</div>
        <div className="flex items-center justify-center text-lg cursor-pointer bg-white border border-[#e2e8f0] rounded-xl w-10 h-10 text-[#64748b]">🌙</div>
        <div className="flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br from-[#f59e0b] to-[#ef4444] font-bold text-sm avatar">A</div>
      </div>
    </div>
  );
}
