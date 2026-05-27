import React, { useState } from "react";
import { Player, SavedTeam, UserCard } from "../types";
import { Trash2, Shield, Award, RotateCcw, Edit2, Search, Save, FolderOpen, HeartHandshake, CheckSquare, XSquare, AlertCircle } from "lucide-react";
import { PRELOADED_PLAYERS } from "../data";
import { motion, AnimatePresence } from "motion/react";

interface RosterViewProps {
  starters: Player[];
  bench: Player[];
  teamName: string;
  onRemove: (id: string, slot: "starter" | "bench") => void;
  onUpdateTeamName: (name: string) => void;
  onAddFromPreloaded: (player: Player, slot: "starter" | "bench") => void;
  onAutoDraft: () => void;
  onClearRoster: () => void;
  onSaveTeam: () => Promise<void>;
  savedTeams: SavedTeam[];
  onLoadTeam: (team: SavedTeam) => void;
  onDeleteSavedTeam: (teamId: string) => Promise<void>;
  isSaveLoading: boolean;
  userCards: UserCard[];
  activeGameMode?: "free" | "ultimate";
}

export default function RosterView({
  starters,
  bench,
  teamName,
  onRemove,
  onUpdateTeamName,
  onAddFromPreloaded,
  onAutoDraft,
  onClearRoster,
  onSaveTeam,
  savedTeams,
  onLoadTeam,
  onDeleteSavedTeam,
  isSaveLoading,
  userCards,
  activeGameMode = "ultimate"
}: RosterViewProps) {
  
  // Custom Filter State
  const [selectedEra, setSelectedEra] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [showLoadDrawer, setShowLoadDrawer] = useState(false);

  // Stats calculation
  const totalSlots = 8;
  const draftedCount = starters.length + bench.length;
  const allPlayers = [...starters, ...bench];
  
  const avgPPG = allPlayers.length > 0 ? (allPlayers.reduce((acc, p) => acc + p.ppg, 0) / allPlayers.length).toFixed(1) : "0.0";
  const avgAPG = allPlayers.length > 0 ? (allPlayers.reduce((acc, p) => acc + p.apg, 0) / allPlayers.length).toFixed(1) : "0.0";
  const avgRPG = allPlayers.length > 0 ? (allPlayers.reduce((acc, p) => acc + p.rpg, 0) / allPlayers.length).toFixed(1) : "0.0";
  const avgFG = allPlayers.length > 0 ? Math.round(allPlayers.reduce((acc, p) => acc + (p.fgPercent || 48), 0) / allPlayers.length) : 0;

  // Tactical Chemistry Calculation & Breakdown
  const computeDetailedChemistry = () => {
    const teams = allPlayers.map(p => p.team).filter(Boolean);
    const eras = allPlayers.map(p => p.era).filter(Boolean);
    
    const teamBonusCounts: Record<string, number> = {};
    const eraBonusCounts: Record<string, number> = {};
    
    teams.forEach(t => teamBonusCounts[t] = (teamBonusCounts[t] || 0) + 1);
    eras.forEach(e => eraBonusCounts[e] = (eraBonusCounts[e] || 0) + 1);
    
    let teamBonusPct = 0;
    let eraBonusPct = 0;
    const teamBreakdown: string[] = [];
    const eraBreakdown: string[] = [];
    
    Object.entries(teamBonusCounts).forEach(([team, count]) => {
      if (count > 1) {
        const bonus = count * 2;
        teamBonusPct += bonus;
        teamBreakdown.push(`${team} Sync x${count} (+${bonus}% stats)`);
      }
    });

    Object.entries(eraBonusCounts).forEach(([era, count]) => {
      if (count > 1) {
        const bonus = count * 1;
        eraBonusPct += bonus;
        eraBreakdown.push(`${era} Era Sync x${count} (+${bonus}% stats)`);
      }
    });

    const totalCalculated = Math.min(30, teamBonusPct + eraBonusPct);
    return {
      total: totalCalculated,
      teamBreakdown,
      eraBreakdown
    };
  };

  const chemistry = computeDetailedChemistry();

  // Position Requirement Checking (Locks Verification)
  const checkPositionUnlocks = () => {
    const hasPG = allPlayers.some(p => p.position === "Point Guard" || p.position === "Guard" || p.position.toLowerCase().includes("pg") || p.position.toLowerCase().includes("point"));
    const hasSG = allPlayers.some(p => p.position === "Shooting Guard" || p.position === "Guard" || p.position.toLowerCase().includes("sg") || p.position.toLowerCase().includes("shooting"));
    const hasSF = allPlayers.some(p => p.position === "Small Forward" || p.position === "Forward" || p.position.toLowerCase().includes("sf") || p.position.toLowerCase().includes("small"));
    const hasPF = allPlayers.some(p => p.position === "Power Forward" || p.position === "Forward" || p.position.toLowerCase().includes("pf") || p.position.toLowerCase().includes("power"));
    const hasC = allPlayers.some(p => p.position === "Center" || p.position.toLowerCase().startsWith("c") || p.position.toLowerCase().includes("center"));
    
    return [
      { key: "PG", label: "Point Guard", status: hasPG },
      { key: "SG", label: "Shooting Guard", status: hasSG },
      { key: "SF", label: "Small Forward", status: hasSF },
      { key: "PF", label: "Power Forward", status: hasPF },
      { key: "C", label: "Center", status: hasC }
    ];
  };

  const locks = checkPositionUnlocks();

  // Determine active source pool
  const isFreeDraft = activeGameMode === "free";
  const hasCollection = !isFreeDraft && userCards && userCards.length > 0;
  const draftPool = isFreeDraft ? PRELOADED_PLAYERS : (hasCollection ? userCards : PRELOADED_PLAYERS);

  // Filter player pool
  const filteredPlayers = draftPool.filter((p) => {
    const eraMatches = selectedEra === "All" || p.era === selectedEra;
    const searchMatches = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.position.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.team.toLowerCase().includes(searchQuery.toLowerCase());
    return eraMatches && searchMatches;
  });

  return (
    <div id="roster-view" className="space-y-6">
      
      {/* TEAM BANNED / CONTROLS DECK */}
      <div className="bg-gradient-to-r from-gray-950 via-[#12161a] to-gray-950 border border-gray-850 rounded-xl p-5 shadow-xl court-outline relative overflow-hidden">
        <div className="absolute right-0 bottom-0 opacity-[0.03] pointer-events-none">
          <Shield className="w-56 h-56 text-[#f55a15]" />
        </div>
        
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 relative z-10">
          <div className="space-y-2 flex-1 w-full text-xs">
            <span className="text-[10px] text-[#f55a15] font-mono uppercase tracking-widest block font-bold">
              Franchise Builder Deck
            </span>
            <div className="flex items-center gap-2.5">
              <input
                type="text"
                id="team-name-input"
                value={teamName}
                onChange={(e) => onUpdateTeamName(e.target.value)}
                placeholder="Name Your Franchise Squad..."
                className="bg-transparent text-lg md:text-2xl font-display font-black text-white border-b border-dashed border-gray-600 focus:border-[#f55a15] hover:border-gray-400 focus:outline-none transition-colors w-full max-w-sm py-0.5"
              />
              <Edit2 className="w-4 h-4 text-gray-400 shrink-0" />
            </div>
            
            <p className="text-xs text-gray-400">
               Roster Complete Check: <span className="text-[#f55a15] font-bold">{draftedCount} / {totalSlots}</span> signed players (5 Starters, 3 Bench required)
            </p>

            {/* Position Unlock indicators */}
            <div className="flex flex-wrap gap-2.5 pt-1.5">
              {locks.map((loc) => (
                <span
                  key={loc.key}
                  className={`px-2.5 py-1 rounded font-mono text-[9px] font-bold tracking-wider flex items-center gap-1.5 transition-all border ${
                    loc.status
                      ? "bg-green-500/10 text-green-400 border-green-500/20"
                      : "bg-red-500/10 text-red-400 border-red-500/20 animate-pulse"
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${loc.status ? "bg-green-400" : "bg-red-400 animate-ping"}`} />
                  {loc.key}: {loc.status ? "Active Secure" : "Missing Lock"}
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto shrink-0">
            {/* Display Chemistry rating metrics */}
            <div className="bg-[#1b2026] border border-gray-850/80 p-3 rounded-lg text-center w-full sm:w-32">
              <span className="text-[8px] text-gray-500 uppercase font-mono tracking-wider block">TEAM CHEMISTRY</span>
              <strong className="text-xl font-display text-emerald-400 block mt-0.5">{chemistry.total}%</strong>
              <span className="text-[8px] text-emerald-500 font-mono block">Max 30% Active</span>
            </div>

            <div className="grid grid-cols-4 gap-2 bg-[#1b2026] border border-gray-850/80 p-3 rounded-lg text-center w-full sm:w-auto flex-1 sm:flex-initial">
              <div>
                <p className="text-[9px] text-gray-500 uppercase font-mono tracking-wider">AVG PPG</p>
                <p className="text-xs font-bold text-white font-display mt-0.5">{avgPPG}</p>
              </div>
              <div>
                <p className="text-[9px] text-gray-500 uppercase font-mono tracking-wider">AVG APG</p>
                <p className="text-xs font-bold text-white font-display mt-0.5">{avgAPG}</p>
              </div>
              <div>
                <p className="text-[9px] text-gray-500 uppercase font-mono tracking-wider">AVG RPG</p>
                <p className="text-xs font-bold text-white font-display mt-0.5">{avgRPG}</p>
              </div>
              <div>
                <p className="text-[9px] text-gray-500 uppercase font-mono tracking-wider">TEAM FG%</p>
                <p className="text-xs font-bold text-[#f55a15] font-display mt-0.5">{avgFG}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Chemistry Breakdown drawer if exists */}
        {allPlayers.length > 1 && (chemistry.teamBreakdown.length > 0 || chemistry.eraBreakdown.length > 0) && (
          <div className="mt-4 p-3 bg-black/40 border border-gray-900 rounded-lg text-[10px] font-mono grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-400">
            <div>
              <span className="text-[#f55a15] font-bold block mb-1">TEAM CHEMISTRY BOOSTS:</span>
              {chemistry.teamBreakdown.length === 0 ? "None yet" : chemistry.teamBreakdown.map((b, i) => <div key={i}>✓ {b}</div>)}
            </div>
            <div>
              <span className="text-blue-400 font-bold block mb-1">ERA CHEMISTRY BOOSTS:</span>
              {chemistry.eraBreakdown.length === 0 ? "None yet" : chemistry.eraBreakdown.map((b, i) => <div key={i}>✓ {b}</div>)}
            </div>
          </div>
        )}

        {/* PERSISTENT LOAD/SAVE SQUAD TRIGGERS */}
        <div className="mt-5 pt-4 border-t border-gray-900 flex flex-wrap gap-2.5">
          <button
            onClick={onSaveTeam}
            disabled={isSaveLoading || draftedCount === 0}
            id="save-current-team-btn"
            className="text-xs bg-[#f55a15] hover:bg-[#ff6e2e] text-black font-display font-bold px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer disabled:opacity-45"
          >
            <Save className="w-3.5 h-3.5" /> {isSaveLoading ? "Saving..." : "Save Current Team"}
          </button>

          <button
            onClick={() => setShowLoadDrawer(!showLoadDrawer)}
            id="load-saved-team-btn"
            className="text-xs bg-[#1b2026] hover:bg-gray-800 text-white border border-gray-800 font-display font-bold px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
          >
            <FolderOpen className="w-3.5 h-3.5" /> Load Saved Team ({savedTeams.length})
          </button>

          <button
            onClick={onClearRoster}
            id="redraft-team-btn"
            className="text-xs bg-red-950/20 hover:bg-red-900 border border-red-900 text-red-200 font-display font-medium px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer ml-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Redraft Team (Clear)
          </button>
        </div>
      </div>

      {/* DRAWER LAYER FOR SAVED TEAMS */}
      <AnimatePresence>
        {showLoadDrawer && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-[#12161a] border border-gray-850 rounded-xl p-5 overflow-hidden shadow-lg"
          >
            <h3 className="text-sm font-display font-black text-white uppercase tracking-wider mb-3 flex items-center gap-2">
              <FolderOpen className="w-4.5 h-4.5 text-[#f55a15]" /> Your Saved Franchise Rosters
            </h3>
            {savedTeams.length === 0 ? (
              <p className="text-xs text-gray-500 font-sans italic py-2">
                No rosters saved yet. Draft some legends and click "Save Current Team" above!
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {savedTeams.map((team) => (
                  <div
                    key={team.id}
                    className="bg-[#1b2026] border border-gray-800 hover:border-gray-700 p-3.5 rounded-lg flex flex-col justify-between text-xs"
                  >
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="font-display font-bold text-white text-sm truncate">{team.name}</h4>
                        <button
                          onClick={() => onDeleteSavedTeam(team.id)}
                          className="text-gray-500 hover:text-red-500 p-1 rounded hover:bg-red-950/20 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-[10px] text-gray-400 font-mono mt-1">
                        Chemistry Boost: {team.chemistryRating || 0}% • Created: {new Date(team.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-900 flex justify-between items-center">
                      <span className="text-[10px] text-gray-500">
                        {team.starters.length + team.bench.length} active players
                      </span>
                      <button
                        onClick={() => {
                          onLoadTeam(team);
                          setShowLoadDrawer(false);
                        }}
                        className="text-[10px] bg-[#f55a15] text-black font-bold px-3 py-1.5 rounded transition-all hover:bg-[#ff6e2e] cursor-pointer"
                      >
                        Activate Team
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ACTIVE SIGNED ROSTER DETAILS */}
      <div className="grid grid-cols-1 gap-6">
        
        {/* Starters Slot Section */}
        <div className="space-y-3">
          <div className="flex justify-between items-center border-b border-gray-850 pb-2">
            <h3 className="text-xs font-display font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#f55a15] animate-ping" />
              1. Starter Lineup ({starters.length} of 5)
            </h3>
            <span className="text-[10px] text-gray-500 font-mono">COURT DECK REQUIREMENT: EXACTLY 5</span>
          </div>

          {starters.length === 0 ? (
            <div className="border border-dashed border-gray-850 rounded-xl p-8 text-center text-gray-500 text-xs">
              No active starters selection signed to contract yet. Select players from the pool below.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {starters.map((player) => {
                const isInjured = player.injuryRemainingGames !== undefined && player.injuryRemainingGames > 0;
                return (
                  <div
                    key={player.id}
                    className={`bg-[#12161a] border rounded-xl p-3.5 relative flex flex-col justify-between transition-all ${
                      isInjured ? "border-red-900/40 bg-red-950/10" : "border-gray-800/80 hover:border-[#f55a15]/40"
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-start">
                        <span className="text-[9px] font-mono px-2 py-0.5 bg-gray-850 text-[#f55a15] font-semibold rounded uppercase">
                          {player.position}
                        </span>
                        <div className="flex items-center gap-1">
                          {player.age && (
                            <span className="text-[9px] bg-black/40 text-gray-400 font-mono px-1 rounded border border-gray-800" title="Physical Age">
                              {player.age}yr
                            </span>
                          )}
                          <button
                            onClick={() => onRemove(player.id, "starter")}
                            className="text-gray-500 hover:text-red-500 transition-colors p-1 rounded hover:bg-red-950/25 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <h4 className="text-sm font-display font-black text-white mt-3 truncate">{player.name}</h4>
                      <div className="flex justify-between items-center text-[10px] text-gray-400 font-mono mt-0.5 uppercase tracking-wide">
                        <span>{player.team}</span>
                        <span className="text-amber-500">{player.era}</span>
                      </div>

                      {/* Physical stamina stats */}
                      {player.stamina !== undefined && (
                        <div className="mt-2.5 space-y-1">
                          <div className="flex justify-between text-[8px] font-mono text-gray-400">
                            <span>Stamina Status</span>
                            <span className={player.stamina < 30 ? "text-red-400 font-bold" : player.stamina < 70 ? "text-yellow-400 font-bold" : "text-emerald-400 font-bold"}>
                              {player.stamina}%
                            </span>
                          </div>
                          <div className="w-full h-1 bg-black rounded-full overflow-hidden border border-gray-900">
                            <div
                              className={`h-full transition-all duration-300 ${
                                player.stamina < 30 ? "bg-red-500" : player.stamina < 70 ? "bg-yellow-500" : "bg-emerald-500"
                              }`}
                              style={{ width: `${player.stamina}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {isInjured && (
                        <div className="mt-2 px-1 rounded-md py-0.5 bg-red-950/30 border border-red-900/45 text-[8px] text-red-300 font-mono text-center uppercase tracking-wider animate-pulse font-bold">
                          🏥 OUT {player.injuryRemainingGames} GAMES
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-4 gap-1 bg-black text-center rounded-lg p-2 mt-4 text-[10px] font-mono border border-gray-900">
                      <div>
                        <span className="text-[8px] text-gray-500 block">PTS</span>
                        <b className="text-white font-display text-[11px] block">{player.ppg.toFixed(1)}</b>
                      </div>
                      <div>
                        <span className="text-[8px] text-gray-500 block">AST</span>
                        <b className="text-white font-display text-[11px] block">{player.apg.toFixed(1)}</b>
                      </div>
                      <div>
                        <span className="text-[8px] text-gray-500 block">REB</span>
                        <b className="text-white font-display text-[11px] block">{player.rpg.toFixed(1)}</b>
                      </div>
                      <div>
                        <span className="text-[8px] text-gray-500 block">OVR</span>
                        <b className="text-[#f55a15] font-display text-[11px] block">{player.overallRating || 75}</b>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Bench Slot Section */}
        <div className="space-y-3">
          <div className="flex justify-between items-center border-b border-gray-850 pb-2">
            <h3 className="text-xs font-display font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              2. Bench Roster Reserves ({bench.length} of 3)
            </h3>
            <span className="text-[10px] text-gray-500 font-mono">BENCH DECK REQUIREMENT: EXACTLY 3</span>
          </div>

          {bench.length === 0 ? (
            <div className="border border-dashed border-gray-850 rounded-xl p-6 text-center text-gray-500 text-xs">
              No bench players selected yet. Select players from the historical legends pool below.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {bench.map((player) => {
                const isInjured = player.injuryRemainingGames !== undefined && player.injuryRemainingGames > 0;
                return (
                  <div
                    key={player.id}
                    className={`bg-[#12161a] border rounded-xl p-3.5 relative flex flex-col justify-between transition-all ${
                      isInjured ? "border-red-900/40 bg-red-950/10" : "border-gray-800/80 hover:border-blue-500/30"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] font-mono px-2 py-0.5 bg-gray-850 text-blue-400 font-semibold rounded uppercase">
                            {player.position}
                          </span>
                          {player.age && (
                            <span className="text-[9px] bg-black/45 text-gray-400 font-mono px-1 rounded border border-gray-800">
                              {player.age}yr
                            </span>
                          )}
                        </div>
                        <h4 className="text-sm font-display font-black text-white mt-2.5 truncate">{player.name}</h4>
                        <p className="text-[10px] text-gray-400 font-mono mt-0.5">
                          Team: {player.team} • Era: <span className="text-amber-500">{player.era}</span>
                        </p>

                        {/* Physical stamina stats */}
                        {player.stamina !== undefined && (
                          <div className="mt-2 space-y-1">
                            <div className="flex justify-between text-[8px] font-mono text-gray-400">
                              <span>Stamina Status</span>
                              <span className={player.stamina < 30 ? "text-red-400 font-bold" : player.stamina < 70 ? "text-yellow-400 font-bold" : "text-emerald-400 font-bold"}>
                                {player.stamina}%
                              </span>
                            </div>
                            <div className="w-full h-1 bg-black rounded-full overflow-hidden border border-gray-901">
                              <div
                                className={`h-full transition-all duration-300 ${
                                  player.stamina < 30 ? "bg-red-500" : player.stamina < 70 ? "bg-yellow-500" : "bg-emerald-500"
                                }`}
                                style={{ width: `${player.stamina}%` }}
                              />
                            </div>
                          </div>
                        )}

                        {isInjured && (
                          <div className="mt-2 px-1 rounded-md py-0.5 bg-red-950/30 border border-red-900/45 text-[8px] text-red-300 font-mono text-center uppercase tracking-wider animate-pulse font-bold">
                            🏥 OUT {player.injuryRemainingGames} GAMES
                          </div>
                        )}
                      </div>
                      
                      <button
                        onClick={() => onRemove(player.id, "bench")}
                        className="text-gray-500 hover:text-red-500 transition-colors p-1 rounded hover:bg-red-950/25 shrink-0 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-4 gap-1 bg-black text-center rounded-lg p-2 mt-4 text-[10px] font-mono border border-gray-900">
                      <div>
                        <span className="text-[8px] text-gray-500 block">PTS</span>
                        <b className="text-white font-display text-[11px] block">{player.ppg.toFixed(1)}</b>
                      </div>
                      <div>
                        <span className="text-[8px] text-gray-500 block">AST</span>
                        <b className="text-white font-display text-[11px] block">{player.apg.toFixed(1)}</b>
                      </div>
                      <div>
                        <span className="text-[8px] text-gray-500 block">REB</span>
                        <b className="text-white font-display text-[11px] block">{player.rpg.toFixed(1)}</b>
                      </div>
                      <div>
                        <span className="text-[8px] text-gray-500 block">OVR</span>
                        <b className="text-blue-400 font-display text-[11px] block">{player.overallRating || 75}</b>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* HISTORICAL LEGENDS DRAFTING HUB */}
      <div className="bg-[#12161a] border border-gray-850 rounded-xl p-5 shadow-lg court-outline">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5 border-b border-gray-850 pb-4">
          <div>
            <h4 className="text-md font-display font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
              <Award className="w-5 h-5 text-[#f55a15]" />
              {isFreeDraft 
                ? "Simulated Free Draft (All 500+ Legends Unlocked)" 
                : (hasCollection ? "Your Acquired Ultimate Album Pool" : "Historical Legends Pool (Classic Standard)")}
            </h4>
            <p className="text-xs text-gray-400 mt-1 font-sans">
              {isFreeDraft 
                ? "Simulated Mode: Full access to every historical & modern player. Play against AI without collection boundaries." 
                : (hasCollection 
                  ? "Ultimate Squad: Draft exclusively from card assets you unlocked in the PACK STORE." 
                  : "Ultimate Squad: Springboard starter pack not claimed yet. Open packs to activate collection draft!")}
            </p>
          </div>

          <button
            onClick={onAutoDraft}
            id="auto-draft-btn"
            className="text-xs bg-[#f55a15]/10 hover:bg-[#f55a15] text-[#f55a15] hover:text-black font-display font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 transition-all w-full sm:w-auto justify-center uppercase tracking-wide cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Auto-Fill Remainder
          </button>
        </div>

        {/* SEARCH AND FILTER CONTROL PANEL */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-6">
          <div className="relative col-span-1 xl:col-span-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, team or position..."
              className="w-full bg-[#1b2026] text-[#f3f4f6] text-xs pl-10 pr-4 py-3 rounded-lg border border-gray-800 focus:outline-none focus:border-[#f55a15]"
            />
            <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-500" />
          </div>

          <div className="flex flex-wrap gap-1.5 col-span-1 xl:col-span-2 items-center justify-start xl:justify-end">
            {(["All", "1980s", "1990s", "2000s", "2010s", "Current"] as const).map((era) => (
              <button
                key={era}
                onClick={() => setSelectedEra(era)}
                className={`text-[10px] font-mono tracking-wide px-3.5 py-2 rounded-lg uppercase transition-all cursor-pointer ${
                  selectedEra === era
                    ? "bg-[#f55a15] text-black font-bold"
                    : "bg-[#1b2026] text-gray-400 hover:text-white hover:bg-gray-800"
                }`}
              >
                {era}
              </button>
            ))}
          </div>
        </div>

        {/* If pool is empty */}
        {filteredPlayers.length === 0 && (
          <div className="bg-[#1b2026] select-none text-center rounded-xl p-10 border border-gray-850/60 flex flex-col items-center justify-center space-y-2">
            <AlertCircle className="w-7 h-7 text-amber-500" />
            <p className="text-xs text-gray-300 font-bold uppercase tracking-wide">No selectable cards match criteria</p>
            <p className="text-[11px] text-gray-500">
               {isFreeDraft 
                 ? "Try modifying your search query or filters above." 
                 : (hasCollection 
                   ? "You have no matching cards in your collection. Buy or claim more booster packs!" 
                   : "Try claiming the starter pack in the Pack Store to begin your Career mode collection!")}
            </p>
          </div>
        )}

        {/* RESULTS GRID OF LEGENDS ROW */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 max-h-[450px] overflow-y-auto pr-1">
          {filteredPlayers.map((p) => {
            const alreadyInRoster = allPlayers.some((i) => i.id === p.id);
            const borderAccent = 
              p.tier === "Legendary" ? "border-red-500/40 hover:border-red-500" :
              p.tier === "Gold" ? "border-yellow-500/30 hover:border-yellow-500" :
              p.tier === "Silver" ? "border-slate-500/30 hover:border-slate-400" : "border-gray-800 hover:border-[#f55a15]/30";
            
            // Look up physical fatigue metrics from acquired collections
            const matchedCard = activeGameMode === "ultimate" 
              ? userCards.find(c => c.id === p.id)
              : null;
            
            const stamValue = matchedCard ? (matchedCard.stamina !== undefined ? matchedCard.stamina : 100) : undefined;
            const cardAgeValue = matchedCard ? (matchedCard.age !== undefined ? matchedCard.age : p.age) : (p.age || 26);
            const injuryRemVal = matchedCard ? (matchedCard.injuryRemainingGames || 0) : 0;
            const isInjured = injuryRemVal > 0;
            const isExhausted = stamValue !== undefined && stamValue < 15;

            return (
              <div
                key={p.id}
                className={`border rounded-xl p-3.5 flex flex-col justify-between transition-all ${borderAccent} ${
                  alreadyInRoster 
                    ? "bg-[#0c0f12]/30 border-gray-905 text-gray-600 pointer-events-none opacity-[0.25]" 
                    : "bg-[#1b2026] text-white"
                }`}
              >
                <div>
                  <div className="flex justify-between items-center text-[10px] font-mono">
                    <span className={`text-[9px] px-1.5 py-0.5 font-semibold rounded uppercase ${
                      p.tier === "Legendary" ? "bg-red-500/10 text-red-400" :
                      p.tier === "Gold" ? "bg-yellow-500/10 text-yellow-400" :
                      p.tier === "Silver" ? "bg-slate-500/10 text-slate-400" : "bg-amber-500/10 text-[#f55a15]"
                    }`}>
                      {p.tier}: {p.position}
                    </span>
                    <span className="text-gray-400 uppercase tracking-widest">{p.team}</span>
                  </div>
                  
                  <h4 className="text-xs font-display font-bold text-white mt-1.5 truncate">{p.name}</h4>
                  <div className="flex justify-between items-center mt-1 text-[9px] font-mono text-gray-400">
                    <span>OVR Rating: <strong className="text-white">{matchedCard ? matchedCard.overallRating : p.overallRating}</strong></span>
                    <span className="text-amber-500 font-semibold">{p.era}</span>
                  </div>

                  <div className="text-[9px] font-mono text-gray-500 mt-1 flex justify-between items-center border-t border-gray-850/60 pt-1.5">
                    <span>Physical Age: <strong>{cardAgeValue}yr</strong></span>
                    {stamValue !== undefined && (
                      <span className={stamValue < 30 ? "text-red-400 font-bold" : stamValue < 70 ? "text-yellow-400 font-bold" : "text-emerald-400 font-bold"}>
                        🔋 {stamValue}% Stam
                      </span>
                    )}
                  </div>

                  {stamValue !== undefined && (
                    <div className="w-full h-1 bg-black rounded-full overflow-hidden mt-1 text-xs">
                      <div
                        className={`h-full transition-all duration-300 ${
                          stamValue < 30 ? "bg-red-500" : stamValue < 70 ? "bg-yellow-500" : "bg-emerald-500"
                        }`}
                        style={{ width: `${stamValue}%` }}
                      />
                    </div>
                  )}

                  {isInjured && (
                    <div className="mt-2 text-center text-[8px] bg-red-950/20 text-red-300 py-0.5 rounded font-mono animate-pulse uppercase tracking-wider font-extrabold border border-red-900/30">
                      🏥 INJURED (OUT {injuryRemVal} GAMES)
                    </div>
                  )}
                </div>

                {/* mini stats grid */}
                <div className="grid grid-cols-3 gap-1 bg-black/40 text-[10px] font-mono text-center rounded-lg p-1.5 mt-2.5 border border-gray-901">
                  <div>
                    <span className="text-[8px] text-gray-500 block">PPG</span>
                    <span className="font-bold text-gray-300 font-display">{p.ppg.toFixed(0)}</span>
                  </div>
                  <div>
                    <span className="text-[8px] text-gray-500 block">APG</span>
                    <span className="font-bold text-gray-300 font-display">{p.apg.toFixed(0)}</span>
                  </div>
                  <div>
                    <span className="text-[8px] text-gray-500 block">RPG</span>
                    <span className="font-bold text-gray-300 font-display">{p.rpg.toFixed(0)}</span>
                  </div>
                </div>

                <div className="flex gap-1.5 mt-3">
                  {isInjured ? (
                    <div className="w-full text-center text-[9px] bg-red-950/40 border border-red-900/40 text-red-300 font-display font-medium py-1.5 rounded uppercase tracking-wider select-none">
                      🏥 MEDICAL BAN (INJURED)
                    </div>
                  ) : isExhausted ? (
                    <div className="w-full text-center text-[9px] bg-amber-950/30 border border-amber-900/40 text-amber-300 font-display font-medium py-1.5 rounded uppercase tracking-wider select-none">
                      🔋 EXHAUSTED (RECOVER RES)
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => onAddFromPreloaded({
                          ...p, 
                          stamina: stamValue, 
                          age: cardAgeValue, 
                          injuryRemainingGames: injuryRemVal,
                          overallRating: matchedCard ? matchedCard.overallRating : p.overallRating
                        }, "starter")}
                        disabled={starters.length >= 5}
                        className="flex-1 text-[10px] bg-[#f55a15] hover:bg-[#ff6e2e] text-black font-display font-semibold py-1.5 rounded transition-colors disabled:opacity-30 cursor-pointer uppercase tracking-wider"
                      >
                        {stamValue !== undefined && stamValue < 40 ? "⚠️ Starter" : "+ Starter"}
                      </button>
                      <button
                        onClick={() => onAddFromPreloaded({
                          ...p, 
                          stamina: stamValue, 
                          age: cardAgeValue, 
                          injuryRemainingGames: injuryRemVal,
                          overallRating: matchedCard ? matchedCard.overallRating : p.overallRating
                        }, "bench")}
                        disabled={bench.length >= 3}
                        className="flex-1 text-[10px] bg-gray-850 hover:bg-gray-750 text-white font-display font-semibold py-1.5 rounded transition-all disabled:opacity-30 border border-gray-700 cursor-pointer uppercase tracking-wider"
                      >
                        {stamValue !== undefined && stamValue < 40 ? "⚠️ Bench" : "+ Bench"}
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
