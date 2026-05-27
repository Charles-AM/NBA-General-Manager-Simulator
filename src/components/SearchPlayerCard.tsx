import React, { useState } from "react";
import { Player } from "../types";
import { Search, Plus, ExternalLink, Sparkles, AlertCircle } from "lucide-react";
import { getPlayerOverallAndTier } from "../data";
import BasketballJersey from "./BasketballJersey";

interface SearchPlayerCardProps {
  onDraft: (player: Player, slot: "starter" | "bench") => void;
  draftedIds: string[];
}

export default function SearchPlayerCard({ onDraft, draftedIds }: SearchPlayerCardProps) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchedPlayer, setSearchedPlayer] = useState<Player | null>(null);
  const [citations, setCitations] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setSearchedPlayer(null);
    setCitations([]);

    try {
      const resp = await fetch("/api/search-player", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerName: query.trim() }),
      });

      if (!resp.ok) {
        throw new Error("Failed to search. Ensure backend server is responsive.");
      }

      const data = await resp.json();
      if (data.error) {
        throw new Error(data.error);
      }

      if (data.player) {
        const item = data.player;
        const tempId = item.name.toLowerCase().replace(/\s+/g, "-");
        
        // Calculate rating overall and tier using our central algorithm
        const { overallRating, tier } = getPlayerOverallAndTier({
          id: tempId,
          ppg: Number(item.ppg) || 0,
          apg: Number(item.apg) || 0,
          rpg: Number(item.rpg) || 0,
        });

        const mappedPlayer: Player = {
          id: tempId,
          name: item.name,
          team: item.team,
          position: item.position,
          ppg: Number(item.ppg) || 0,
          apg: Number(item.apg) || 0,
          rpg: Number(item.rpg) || 0,
          era: "Current",
          fgPercent: item.position === "Center" ? 54 : 46,
          isActive: item.isActive,
          overallRating,
          tier
        };
        setSearchedPlayer(mappedPlayer);
        setCitations(data.citations || []);
      } else {
        setError("No statistics found for that active NBA player name.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred during NBA search grounding.");
    } finally {
      setLoading(false);
    }
  };

  const isAlreadyDrafted = searchedPlayer ? draftedIds.includes(searchedPlayer.id) : false;

  return (
    <div id="search-player-card" className="bg-court-darkgray border border-court-border rounded-xl p-6 court-outline">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-[#f55a15]" />
        <h2 className="text-xl font-display font-bold text-court-text-primary uppercase tracking-tight">
          Grounding NBA Search
        </h2>
      </div>
      <p className="text-sm text-court-text-secondary mb-4 font-sans leading-relaxed">
        Search for ANY active NBA player. We use <span className="text-[#f55a15] font-semibold">Gemini with Google Search Grounding</span> to fetch live, current-season stats from the Web.
      </p>

      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <div className="relative flex-1">
          <input
            type="text"
            id="player-search-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. Stephen Curry, Jayson Tatum, Victor Wembanyama..."
            className="w-full bg-court-gray text-court-text-primary pl-10 pr-4 py-3 rounded-lg border border-court-border text-sm focus:outline-none focus:border-[#f55a15] transition-colors font-sans"
          />
          <Search className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-court-text-tertiary" />
        </div>
        <button
          type="submit"
          id="player-search-submit"
          disabled={loading}
          className="bg-[#f55a15] hover:bg-[#ff6e2e] text-black font-display font-semibold px-5 py-3 rounded-lg text-sm transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      {loading && (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="w-10 h-10 border-4 border-t-[#f55a15] border-gray-800 rounded-full animate-spin mb-4" />
          <p className="text-xs text-court-text-secondary font-mono animate-pulse">
            Grounding Web Search results via Gemini...
          </p>
        </div>
      )}

      {error && (
        <div className="bg-red-950/30 border border-red-905 rounded-lg p-4 flex items-start gap-2.5">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div className="text-sm text-red-100 font-sans">
            <span className="font-semibold block mb-0.5">Search Error</span>
            {error}
          </div>
        </div>
      )}

      {searchedPlayer && (
        <div className="bg-court-gray border border-court-border rounded-lg p-5 animate-fade-in text-court-text-primary">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <div className="flex items-center gap-3">
              <BasketballJersey 
                name={searchedPlayer.name} 
                tier={searchedPlayer.tier} 
                className="w-12 h-12"
              />
              <div>
                <span className="text-[10px] bg-[#f55a15]/10 text-[#f55a15] border border-[#f55a15]/20 font-mono tracking-widest px-2 py-0.5 rounded uppercase font-bold">
                  {searchedPlayer.position || "Player"}
                </span>
                <h3 className="text-lg font-display font-bold text-court-text-primary mt-1 leading-tight">
                  {searchedPlayer.name}
                </h3>
                <p className="text-xs text-court-text-secondary mt-0.5">
                  Current Team: {searchedPlayer.team || "NBA Team"}
                </p>
              </div>
            </div>
            {isAlreadyDrafted ? (
              <span className="bg-court-darkgray text-court-text-secondary border border-court-border px-3 py-1.5 rounded-md text-xs font-semibold">
                Already Drafted
              </span>
            ) : (
              <div className="flex gap-1.5">
                <button
                  onClick={() => onDraft(searchedPlayer, "starter")}
                  className="bg-[#f55a15] hover:bg-[#ff6e2e] text-black text-xs font-semibold px-3 py-2 rounded transition-all flex items-center gap-1 active:scale-95 cursor-pointer uppercase tracking-wider"
                >
                  <Plus className="w-3.5 h-3.5" /> Starter
                </button>
                <button
                  onClick={() => onDraft(searchedPlayer, "bench")}
                  className="bg-[#1b2026] hover:bg-court-darkgray text-white text-xs font-semibold px-3 py-2 rounded transition-all flex items-center gap-1 active:scale-95 border border-gray-700 cursor-pointer uppercase tracking-wider"
                >
                  <Plus className="w-3.5 h-3.5" /> Bench
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2.5 bg-court-darkgray rounded-lg p-3 text-center mb-4 border border-court-border">
            <div>
              <div className="text-xs text-court-text-tertiary uppercase font-mono tracking-wider">PPG</div>
              <div className="text-lg font-bold font-display text-court-text-primary mt-0.5">{searchedPlayer.ppg.toFixed(1)}</div>
            </div>
            <div>
              <div className="text-xs text-court-text-tertiary uppercase font-mono tracking-wider">APG</div>
              <div className="text-lg font-bold font-display text-court-text-primary mt-0.5">{searchedPlayer.apg.toFixed(1)}</div>
            </div>
            <div>
              <div className="text-xs text-court-text-tertiary uppercase font-mono tracking-wider">RPG</div>
              <div className="text-lg font-bold font-display text-court-text-primary mt-0.5">{searchedPlayer.rpg.toFixed(1)}</div>
            </div>
          </div>

          {citations.length > 0 && (
            <div className="border-t border-gray-800/80 pt-3">
              <span className="text-[10px] text-gray-500 uppercase font-mono tracking-wider block mb-1.5">
                Sources Verified via Google Grounding:
              </span>
              <div className="flex flex-wrap gap-2">
                {citations.map((url, i) => (
                  <a
                    key={i}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-gray-400 hover:text-[#f55a15] flex items-center gap-1 underline transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" /> Source [{i + 1}]
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
