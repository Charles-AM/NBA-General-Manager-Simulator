import React, { useState } from "react";
import { CareerSave, Player } from "../types";
import { PRELOADED_PLAYERS } from "../data";
import { Shield, Coins, Sparkles, FolderOpen, Trash2, Trophy, Clock, Check, HeartPulse, Sparkle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface CareerSavesHubProps {
  careerSaves: CareerSave[];
  loading: boolean;
  onLoadSave: (saveId: string) => Promise<void>;
  onCreateNewSave: (saveId: string, teamName: string, injuriesEnabled: boolean, starterCards: Player[]) => Promise<void>;
  onDeleteSave: (saveId: string) => Promise<void>;
}

export default function CareerSavesHub({
  careerSaves,
  loading,
  onLoadSave,
  onCreateNewSave,
  onDeleteSave
}: CareerSavesHubProps) {
  const [activeSlotId, setActiveSlotId] = useState<string | null>(null); // slot being created
  const [onboardingStage, setOnboardingStage] = useState<"slot_preview" | "name_team" | "draw_reveal">("slot_preview");
  const [newTeamName, setNewTeamName] = useState("");
  const [injuriesEnabled, setInjuriesEnabled] = useState(true);
  const [drawnPlayers, setDrawnPlayers] = useState<(Player & { flipped?: boolean })[]>([]);
  const [hoveredCardIndex, setHoveredCardIndex] = useState<number | null>(null);

  const getDivisionName = (lvl: number) => {
    switch (lvl) {
      case 0: return "Rookie Division";
      case 1: return "Pro Division";
      case 2: return "All-Star Region";
      case 3: return "Superstar Bracket";
      case 4: return "Legend Conference";
      case 5: return "GOAT Finals";
      default: return "Rookie Division";
    }
  };

  const getDivisionColor = (lvl: number) => {
    switch (lvl) {
      case 0: return "text-amber-500 border-amber-500/20 bg-amber-500/5";
      case 1: return "text-slate-400 border-slate-500/20 bg-slate-500/5";
      case 2: return "text-yellow-400 border-yellow-500/20 bg-yellow-500/5";
      case 3: return "text-blue-400 border-blue-500/20 bg-blue-500/5";
      case 4: return "text-purple-400 border-purple-500/20 bg-purple-500/5";
      case 5: return "text-red-500 border-red-500/20 bg-red-500/5";
      default: return "text-amber-500 border-amber-500/20 bg-amber-500/5";
    }
  };

  const handleStartOnboarding = (slotId: string) => {
    setActiveSlotId(slotId);
    setNewTeamName("");
    setInjuriesEnabled(true);
    setOnboardingStage("name_team");
  };

  const generateStarterDraws = () => {
    // Collect preloaded template players matching precise rating rules
    const bronzePool = PRELOADED_PLAYERS.filter(p => p.tier === "Bronze" || (p.overallRating && p.overallRating < 75));
    const silverPool = PRELOADED_PLAYERS.filter(p => p.tier === "Silver" || (p.overallRating && p.overallRating >= 75 && p.overallRating < 85));
    const goldPool = PRELOADED_PLAYERS.filter(p => p.tier === "Gold" || (p.overallRating && p.overallRating >= 85 && p.overallRating < 95));

    const selected: Player[] = [];
    const usedNames = new Set<string>();

    const drawFromPool = (pool: Player[], count: number) => {
      const candidates = [...pool].sort(() => 0.5 - Math.random());
      let drawnCount = 0;
      for (const p of candidates) {
        if (drawnCount >= count) break;
        if (!usedNames.has(p.name)) {
          selected.push({
            ...p,
            stamina: 100,
            injuryRemainingGames: 0,
            injuryType: null,
            age: Math.floor(Math.random() * 5) + 19 // Age between 19 and 23 for young star potential!
          });
          usedNames.add(p.name);
          drawnCount++;
        }
      }
    };

    drawFromPool(bronzePool, 3);
    drawFromPool(silverPool, 3);
    drawFromPool(goldPool, 2);

    return selected;
  };

  const handleGoToDraws = () => {
    if (!newTeamName.trim()) {
      alert("Please name your franchise team is required!");
      return;
    }
    const cards = generateStarterDraws().map(p => ({ ...p, flipped: false }));
    setDrawnPlayers(cards);
    setOnboardingStage("draw_reveal");
  };

  const handleFlipCard = (idx: number) => {
    setDrawnPlayers(prev => prev.map((p, i) => i === idx ? { ...p, flipped: true } : p));
  };

  const handleFlipAll = () => {
    setDrawnPlayers(prev => prev.map(p => ({ ...p, flipped: true })));
  };

  const handleFinishOnboarding = async () => {
    const unflipped = drawnPlayers.some(p => !p.flipped);
    if (unflipped) {
      if (!confirm("Are you sure you want to finish without revealing all 8 starter draws first?")) {
        return;
      }
    }
    if (activeSlotId) {
      await onCreateNewSave(activeSlotId, newTeamName.trim(), injuriesEnabled, drawnPlayers);
      // Reset onboarding
      setActiveSlotId(null);
      setOnboardingStage("slot_preview");
    }
  };

  // Helper to find save file by slot id
  const findSave = (slotId: string) => careerSaves.find(s => s.id === slotId);

  return (
    <div id="career-saves-hub" className="space-y-6">
      
      {/* HUB SUB-HEADER */}
      <div className="bg-[#12161a] border border-gray-850 p-5 rounded-xl relative overflow-hidden shadow-lg">
        <div className="absolute top-0 right-0 opacity-[0.03] pointer-events-none">
          <Trophy className="w-44 h-44 text-[#f55a15]" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="text-[10px] text-[#f55a15] font-mono uppercase tracking-widest font-bold block">
              🏀 ULTIMATE SQUAD MULTI-SAVE CONTROLLERS
            </span>
            <h2 className="text-xl md:text-2xl font-display font-black text-white uppercase tracking-tight mt-1">
              Career Franchise Management
            </h2>
            <p className="text-xs text-gray-400 mt-2 font-sans max-w-xl">
              Load, create, or delete up to <strong className="text-white">3 persistent career saves</strong>. Each save file holds its own unique card collections, accumulated coins, active divisions, physical stamina models, and customized franchise trophy shelves!
            </p>
          </div>
          <div className="px-4 py-2.5 bg-black/40 border border-gray-800 rounded-lg text-center font-mono text-[10px] text-gray-500">
            SLOTS SECURED: <strong className="text-emerald-400">{careerSaves.length} / 3 ACTIVE</strong>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        
        {/* STAGE 1: SAVE FILE GRID */}
        {onboardingStage === "slot_preview" && (
          <motion.div
            key="stage-slots"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {["save_0", "save_1", "save_2"].map((slotId, index) => {
              const save = findSave(slotId);
              const exists = !!save;

              return (
                <div
                  key={slotId}
                  className={`bg-[#12161a] border rounded-2xl p-6 flex flex-col justify-between min-h-[350px] shadow-lg relative overflow-hidden transition-all duration-300 ${
                    exists 
                      ? "border-gray-800 hover:border-[#f55a15]/40" 
                      : "border-dashed border-gray-850 hover:bg-gray-950/20"
                  }`}
                >
                  {/* Decorative faint layout */}
                  <div className="absolute right-[-15px] top-[-15px] text-[100px] font-black font-display text-white/[0.01] select-none pointer-events-none">
                    {index + 1}
                  </div>

                  <div>
                    <div className="flex justify-between items-center border-b border-gray-850 pb-3 mb-4">
                      <span className="text-[10px] font-mono tracking-widest uppercase text-gray-500">
                        Franchise Slot #{index + 1}
                      </span>
                      {exists ? (
                        <span className="px-2 py-0.5 rounded text-[8px] font-mono font-bold bg-green-500/10 text-green-400 uppercase">
                          • SECURED
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[8px] font-mono font-bold bg-gray-800 text-gray-500 uppercase">
                          EMPTY
                        </span>
                      )}
                    </div>

                    {exists ? (
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-lg font-display font-black text-white uppercase tracking-tight truncate">
                            {save.teamName}
                          </h3>
                          <p className="text-xs text-[#f55a15] font-mono mt-0.5">
                            {save.saveName}
                          </p>
                        </div>

                        {/* Rarity and stats indicator */}
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className={`border rounded-lg p-2.5 font-mono ${getDivisionColor(save.division)}`}>
                            <span className="text-[8px] text-gray-500 block">ARENA RANK</span>
                            <b className="font-display font-bold text-[10px] block uppercase truncate">
                              {getDivisionName(save.division)}
                            </b>
                          </div>
                          <div className="bg-black/40 border border-gray-900 rounded-lg p-2.5 font-mono">
                            <span className="text-[8px] text-gray-500 block">COIN VAULT</span>
                            <b className="text-white text-[11px] font-display flex items-center gap-1 mt-0.5">
                              <Coins className="w-3.5 h-3.5 text-amber-500" /> {save.coins}
                            </b>
                          </div>
                        </div>

                        {/* Extra records */}
                        <div className="bg-black/25 rounded-xl p-3 border border-gray-900 space-y-1 text-[11px] font-mono text-gray-400">
                          <div className="flex justify-between">
                            <span>League Season:</span>
                            <strong className="text-white">Season {save.seasonNumber || 1}</strong>
                          </div>
                          <div className="flex justify-between">
                            <span>Season Run:</span>
                            <strong className="text-gray-300">
                              {save.seasonWins}-{save.seasonLosses} ({save.seasonGamesPlayed}/12 Played)
                            </strong>
                          </div>
                          <div className="flex justify-between">
                            <span>Cumulative W/L:</span>
                            <strong className="text-gray-300">{save.wins}W - {save.losses}L</strong>
                          </div>
                          <div className="flex justify-between">
                            <span>Card Collection:</span>
                            <span className="text-[#f55a15] font-bold">{(save.userCards || []).length} Retro Cards</span>
                          </div>
                          <div className="flex justify-between border-t border-gray-900 pt-1.5 mt-1 text-[10px] items-center">
                            <span>Injuries Module:</span>
                            <span className={save.injuriesEnabled ? "text-red-400 flex items-center gap-1" : "text-gray-500"}>
                              <HeartPulse className="w-3 h-3" /> {save.injuriesEnabled ? "Fatigue Active" : "Disabled"}
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="py-8 text-center space-y-3">
                        <div className="w-12 h-12 rounded-full border border-dashed border-gray-800 flex items-center justify-center mx-auto text-gray-600">
                          <FolderOpen className="w-5 h-5" />
                        </div>
                        <p className="text-xs text-gray-500 font-sans leading-relaxed">
                          This slot is currently empty. Start a new team and build your ultimate championship roster.
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-900 flex gap-2 w-full">
                    {exists ? (
                      <>
                        <button
                          onClick={() => onLoadSave(slotId)}
                          disabled={loading}
                          className="flex-1 bg-[#f55a15] hover:bg-[#ff6e2e] text-black font-display font-black py-2.5 rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer text-center"
                        >
                          Load Squad
                        </button>
                        <button
                          onClick={() => onDeleteSave(slotId)}
                          disabled={loading}
                          className="px-3 border border-red-950/40 hover:bg-red-950/20 text-red-500 rounded-xl transition-all cursor-pointer"
                          title="Wipe Career Slot"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleStartOnboarding(slotId)}
                        disabled={loading}
                        className="w-full bg-[#1b2026] hover:bg-gray-800 text-white border border-gray-800 font-display font-bold py-3 rounded-xl text-xs uppercase tracking-widest transition-transform active:scale-98 cursor-pointer"
                      >
                        🚀 Start New Career
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </motion.div>
        )}

        {/* STAGE 2: ENTER TEAM NAME & CHOOSE SETTINGS */}
        {onboardingStage === "name_team" && (
          <motion.div
            key="stage-name"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="max-w-md mx-auto bg-[#12161a] border border-gray-800 rounded-2xl p-6 shadow-2xl space-y-6"
          >
            <div className="text-center space-y-1 border-b border-gray-850 pb-4">
              <Shield className="w-10 h-10 text-[#f55a15] mx-auto" />
              <h3 className="text-lg font-display font-extrabold text-white uppercase tracking-tight mt-2">
                Launch My Franchise
              </h3>
              <p className="text-xs text-gray-500">Initialize settings and design your tournament identity.</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] text-gray-500 font-mono tracking-widest uppercase block">
                  Franchise Team Name
                </label>
                <input
                  type="text"
                  maxLength={24}
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  placeholder="e.g. Chicago Retros, LA Lobsters..."
                  className="w-full bg-black/40 text-white px-4 py-3 rounded-xl border border-gray-800 text-sm focus:outline-none focus:border-[#f55a15]"
                />
              </div>

              <div className="bg-black/20 border border-gray-905 p-4 rounded-xl flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-display font-bold text-white uppercase">Physical Stamina & Injuries</h4>
                  <p className="text-[10px] text-gray-400 mt-1 max-w-xs leading-normal">
                    Activating physical fatigue and random injuries forces strategic backup player rotation! Inactive, resting players recover stamina.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setInjuriesEnabled(!injuriesEnabled)}
                  className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 focus:outline-none shrink-0 ${
                    injuriesEnabled ? "bg-red-500" : "bg-gray-800"
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                      injuriesEnabled ? "translate-x-6" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="flex gap-3 pt-3">
              <button
                onClick={() => setOnboardingStage("slot_preview")}
                className="flex-1 bg-gray-900 border border-gray-800 text-gray-400 font-display font-semibold py-2.5 rounded-xl text-xs uppercase tracking-wider hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleGoToDraws}
                className="flex-1 bg-[#f55a15] hover:bg-[#ff6e2e] text-black font-display font-black py-2.5 rounded-xl text-xs uppercase tracking-wider"
              >
                Draft Players
              </button>
            </div>
          </motion.div>
        )}

        {/* STAGE 3: THE 8 STARTER DRAWS */}
        {onboardingStage === "draw_reveal" && (
          <motion.div
            key="stage-draws"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            <div className="bg-[#12161a] border border-gray-850 p-5 rounded-xl flex flex-col sm:flex-row justify-between items-center gap-4">
              <div>
                <span className="text-[10px] text-yellow-500 font-mono uppercase tracking-widest font-bold block">
                  🎨 SQUAD SPIN COMBINATORS
                </span>
                <h3 className="text-lg font-display font-black text-white uppercase tracking-tight">
                  Unlocking Your Starting Deck
                </h3>
                <p className="text-xs text-gray-400 font-sans mt-0.5">
                  Reveal your guaranteed starting assets: <strong className="text-amber-500">3 Bronze</strong>, <strong className="text-slate-300">3 Silver</strong>, and <strong className="text-yellow-400">2 Gold</strong>. Click individual cards to unlock, or flip all below!
                </p>
              </div>

              <div className="flex gap-2.5">
                <button
                  onClick={handleFlipAll}
                  className="bg-gray-850 hover:bg-gray-750 text-white font-mono text-[10px] tracking-wider uppercase px-4 py-2.5 border border-gray-750 rounded-lg"
                >
                  Reveal All
                </button>
                <button
                  onClick={handleFinishOnboarding}
                  className="bg-[#f55a15] hover:bg-[#ff6e2e] text-black font-display font-black text-xs uppercase tracking-widest px-6 py-2.5 rounded-lg active:scale-95 shadow-md"
                >
                  Claim & Begin Franchise
                </button>
              </div>
            </div>

            {/* Grid of 8 Draft Elements */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4 py-2">
              {drawnPlayers.map((p, i) => {
                const isFlipped = p.flipped;

                const borderGlow = 
                  p.tier === "Gold" ? "border-yellow-400 shadow-yellow-500/10" : 
                  p.tier === "Silver" ? "border-slate-300 shadow-slate-400/10" : "border-amber-700 shadow-amber-900/10";

                const textGradient = 
                  p.tier === "Gold" ? "text-yellow-400" : 
                  p.tier === "Silver" ? "text-slate-300" : "text-amber-600";

                return (
                  <div
                    key={p.id + "_" + i}
                    className="aspect-[3/4.5] w-full relative perspective"
                    onMouseEnter={() => setHoveredCardIndex(i)}
                    onMouseLeave={() => setHoveredCardIndex(null)}
                  >
                    <motion.div
                      className="w-full h-full relative duration-500 preserve-3d cursor-pointer"
                      animate={{ rotateY: isFlipped ? 180 : 0 }}
                      onClick={() => handleFlipCard(i)}
                      whileHover={{ scale: 1.03 }}
                    >
                      {/* CARD BACK */}
                      <div className="absolute inset-0 w-full h-full rounded-2xl bg-gradient-to-b from-[#161a20] to-[#0c0f12] border-2 border-dashed border-gray-800 flex flex-col items-center justify-center p-3 text-center backface-hidden shadow-2xl select-none z-10">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-gray-900 to-gray-800 flex items-center justify-center border border-gray-850 text-gray-500 shadow-inner group-hover:scale-115 transition-transform">
                          <Sparkle className="w-5 h-5 text-[#f55a15]/50 animate-pulse" />
                        </div>
                        <span className="text-[9px] text-[#f55a15] font-mono font-bold uppercase tracking-wider mt-4">
                          REVEAL RETRO
                        </span>
                        <span className="text-[7px] text-gray-500 font-mono uppercase mt-1">
                          Starter {p.tier}
                        </span>
                      </div>

                      {/* CARD FRONT */}
                      <div
                        className={`absolute inset-0 w-full h-full rounded-2xl bg-[#0f1216] border-2 ${borderGlow} flex flex-col justify-between p-3 rotate-y-180 backface-hidden shadow-2xl overflow-hidden select-none z-0`}
                      >
                        {/* Shimmer layout */}
                        <div className="absolute -inset-y-12 -inset-x-20 w-8 bg-white/5 rotate-12 blur-sm pointer-events-none animate-shimmer" />

                        <div className="flex justify-between items-start font-mono text-[8px] border-b border-gray-900/40 pb-1">
                          <span className={`px-1 rounded font-bold uppercase py-0.2 ${
                            p.tier === "Gold" ? "bg-yellow-500/10 text-yellow-400" :
                            p.tier === "Silver" ? "bg-slate-500/10 text-slate-400" : "bg-amber-500/10 text-amber-500"
                          }`}>
                            {p.position}
                          </span>
                          <span className="text-gray-500 text-[8px]">{p.team}</span>
                        </div>

                        <div className="text-center my-auto">
                          <span className={`text-[8px] font-mono tracking-widest uppercase block ${textGradient} font-bold`}>
                            {p.tier}
                          </span>
                          <span className="block text-xs font-display font-extrabold text-white tracking-tight mt-0.5 leading-tight truncate">
                            {p.name}
                          </span>
                          <span className="text-[7px] text-gray-500 font-mono block mt-0.2">{p.era}</span>
                        </div>

                        <div className="bg-black/60 rounded-lg p-1 text-center font-mono border border-gray-950 flex justify-between items-center text-[8px] text-gray-400">
                          <div>
                            <span className="text-[6px] text-gray-650 block">OVR</span>
                            <strong className="text-white font-display font-bold text-[9px]">{p.overallRating}</strong>
                          </div>
                          <div className="h-3 w-px bg-gray-850" />
                          <div>
                            <span className="text-[6px] text-gray-650 block">PPG</span>
                            <span>{p.ppg.toFixed(0)}</span>
                          </div>
                          <div className="h-3 w-px bg-gray-850" />
                          <div>
                            <span className="text-[6px] text-gray-650 block">AGE</span>
                            <span className="text-[#f55a15] font-semibold">{p.age}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

      </AnimatePresence>

    </div>
  );
}
