import React, { useEffect, useRef } from "react";
import { Player, PlayerBoxScore, PlayByPlayLog, GameResult } from "../types";
import { THEMED_OPPONENT_TEAMS } from "../data";
import { useGameSimulation } from "../hooks/useGameSimulation";
import { Play, ShieldAlert, Award, AlertCircle, CheckCircle, Zap, ShieldCheck, Trophy, RotateCcw, ArrowRight, Star, Search, Users } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface SimulationViewProps {
  userId: string;
  teamName: string;
  starters: Player[];
  bench: Player[];
  onSaveGameRecord: (record: GameResult) => Promise<void>;
  onResetToDraft: () => void;
}

// Custom lightweight confetti pieces
function ConfettiEffect() {
  const [pieces, setPieces] = React.useState<any[]>([]);
  React.useEffect(() => {
    const arr = Array.from({ length: 80 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100, // percentage width
      delay: Math.random() * 2,
      size: Math.random() * 8 + 6,
      color: ["#f55a15", "#ffaa00", "#00ffcc", "#ff007f", "#ffff00"][Math.floor(Math.random() * 5)]
    }));
    setPieces(arr);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-50">
      {pieces.map((p) => (
        <motion.div
          key={p.id}
          initial={{ y: -50, x: `${p.x}vw`, rotate: 0, opacity: 1 }}
          animate={{ y: "110vh", rotate: 360, opacity: 0 }}
          transition={{ duration: 4, delay: p.delay, ease: "linear" }}
          style={{
            position: "absolute",
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: Math.random() > 0.5 ? "50%" : "2px"
          }}
        />
      ))}
    </div>
  );
}

export default function SimulationView({
  userId,
  teamName,
  starters,
  bench,
  onSaveGameRecord,
  onResetToDraft,
}: SimulationViewProps) {
  const {
    gameMode,
    setGameMode,
    difficulty,
    setDifficulty,
    opponentTeamName,
    selectedOpponentTeamId,
    setSelectedOpponentTeamId,
    oppTeamSearchQuery,
    setOppTeamSearchQuery,
    opponentStarters,
    opponentBench,
    stage,
    setStage,
    simStep,
    simulatedResult,
    liveScore,
    liveFeed,
    currentQuarter,
    liveTime,
    isRecordSaved,
    savingRecord,
    activeTab,
    setActiveTab,
    simSpeed,
    setSimSpeed,
    isRosterComplete,
    handleStartSimulation,
    saveToHistory,
    draftOpponent,
    handleSkipToEnd,
    totalPlaysCount,
  } = useGameSimulation({
    userId,
    teamName,
    starters,
    bench,
    onSaveGameRecord,
  });

  const feedEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    feedEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [liveFeed.length]);

  const totalUserStats = simulatedResult ? simulatedResult.playerStats : [];
  const totalOpponentStats = simulatedResult ? simulatedResult.opponentStats : [];

  return (
    <div id="simulation-view" className="space-y-6">
      <AnimatePresence mode="wait">
        {/* SETUP SCREEN */}
        {stage === "setup" && (
          <motion.div
            key="setup"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            <div className="bg-[#12161a] border border-gray-800 rounded-xl p-6 relative overflow-hidden court-outline shadow-xl">
              <div className="absolute right-0 top-0 opacity-5 pointer-events-none">
                <Trophy className="w-56 h-56 text-[#f55a15]" />
              </div>

              <div className="flex items-center gap-2.5 mb-6 border-b border-gray-850 pb-4">
                <Zap className="w-5.5 h-5.5 text-[#f55a15]" />
                <div>
                  <h2 className="text-xl font-display font-black text-white uppercase tracking-tight">
                    Simulation Setup
                  </h2>
                  <p className="text-xs text-gray-400">Configure parameters for match-up shootouts</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Mode Select */}
                <div>
                  <label className="text-xs text-gray-400 font-mono uppercase tracking-widest block mb-2">
                    🏀 Game Target Score
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setGameMode(50)}
                      className={`py-3 px-4 rounded-xl text-xs font-display font-black uppercase transition-all tracking-wider cursor-pointer ${
                        gameMode === 50
                          ? "bg-[#f55a15] text-black shadow-md glow-orange"
                          : "bg-[#1b2026] text-gray-400 border border-gray-850 hover:bg-gray-800"
                      }`}
                    >
                      First to 50
                    </button>
                    <button
                      onClick={() => setGameMode(100)}
                      className={`py-3 px-4 rounded-xl text-xs font-display font-black uppercase transition-all tracking-wider cursor-pointer ${
                        gameMode === 100
                          ? "bg-[#f55a15] text-black shadow-md glow-orange"
                          : "bg-[#1b2026] text-gray-400 border border-gray-850 hover:bg-gray-800"
                      }`}
                    >
                      Full First to 100
                    </button>
                  </div>
                </div>

                {/* Difficulty Select for Procedural Matches */}
                <div>
                  <label className="text-xs text-gray-400 font-mono uppercase tracking-widest block mb-2">
                    ⚙️ Match Difficulty (Dynamic Mode)
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {(["Easy", "Medium", "Hard", "Legend"] as const).map((level) => (
                      <button
                        key={level}
                        onClick={() => {
                          setDifficulty(level);
                          setSelectedOpponentTeamId("dynamic");
                        }}
                        className={`py-3 rounded-xl text-xs font-display font-bold uppercase transition-all cursor-pointer ${
                          difficulty === level && selectedOpponentTeamId === "dynamic"
                            ? "bg-[#f55a15] text-black shadow-md glow-orange"
                            : "bg-[#1b2026] text-gray-400 border border-gray-850 hover:bg-gray-850 hover:text-white"
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-gray-400 mt-2">Selecting these directly triggers a dynamic procedural opponent squad setup.</p>
                </div>
              </div>

              {/* BRAND NEW INTERACTIVE SQUAD SELECT PANEL */}
              <div className="border-t border-gray-850 pt-6 mb-8 space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h3 className="text-sm font-display font-black uppercase tracking-wider text-white">
                      🎮 Choose Your Opponent Franchise
                    </h3>
                    <p className="text-xs text-gray-400">Select standard procedural setups or iconic legacy & active franchise teams</p>
                  </div>
                  <div className="text-xs text-gray-400 bg-[#1b2026] border border-gray-850 px-3.5 py-1.5 rounded-xl font-mono">
                    Active Target: <strong className="text-[#f55a15]">{opponentTeamName}</strong> ({difficulty})
                  </div>
                </div>

                {/* Search & Difficulty Quick Filters */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Search box */}
                  <div className="relative md:col-span-1">
                    <input
                      type="text"
                      value={oppTeamSearchQuery}
                      onChange={(e) => setOppTeamSearchQuery(e.target.value)}
                      placeholder="Search franchises (Bulls, Warriors, Lakers...)"
                      className="w-full bg-[#1b2026] border border-gray-850 rounded-xl py-2.5 pl-9 pr-4 text-xs text-white focus:outline-none focus:border-[#f55a15] transition-colors"
                    />
                    <Search className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                  </div>

                  {/* Difficulty level quick tabs */}
                  <div className="flex flex-wrap gap-1.5 md:col-span-2 justify-start md:justify-end">
                    <button
                      onClick={() => setOppTeamSearchQuery("")}
                      className="px-3 py-2 bg-[#1b2026] hover:bg-gray-800 border border-gray-850 text-gray-400 hover:text-white rounded-xl text-xs font-mono font-bold transition-all cursor-pointer"
                    >
                      Clear Search
                    </button>
                    {(["All", "Easy", "Medium", "Hard", "Legend"] as const).map((lvl) => (
                      <button
                        key={lvl}
                        onClick={() => {
                          if (lvl === "All") {
                            setOppTeamSearchQuery("");
                          } else {
                            setOppTeamSearchQuery(lvl);
                          }
                        }}
                        className="px-3 py-2 bg-[#1b1f24] hover:bg-gray-800 border border-gray-850 text-gray-300 hover:text-white rounded-xl text-xs font-mono font-bold transition-all cursor-pointer"
                      >
                        {lvl} Teams
                      </button>
                    ))}
                  </div>
                </div>

                {/* Opponent Roster Grid Deck */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-h-[350px] overflow-y-auto pr-1 customize-scrollbar pb-2">
                  {/* Option 1: Dynamic Random Generated Squad */}
                  <div
                    onClick={() => {
                      setSelectedOpponentTeamId("dynamic");
                      draftOpponent("dynamic", difficulty);
                    }}
                    className={`p-4 rounded-xl border transition-all text-left flex flex-col justify-between cursor-pointer group ${
                      selectedOpponentTeamId === "dynamic"
                        ? "bg-[#1b2026]/80 border-[#f55a15] ring-1 ring-[#f55a15]/30 shadow-lg"
                        : "bg-[#111418] border-gray-850 hover:bg-[#161a1f] hover:border-gray-750"
                    }`}
                    style={{ minHeight: "125px" }}
                  >
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <span className="text-xs font-display font-black uppercase text-white tracking-wide">Dynamic Rival Selection</span>
                        <span className="text-[9px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded">
                          {difficulty} Mode
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-400 mt-1.5 leading-normal">
                        Randomly compiles balanced, position-compliant basketball contenders matching selected slot tier.
                      </p>
                    </div>
                    <div className="border-t border-gray-850/80 pt-2 mt-3 flex items-center justify-between">
                      <span className="text-[10px] font-mono text-gray-400 group-hover:text-white transition-colors">🤖 Infinite Variations</span>
                      <span className="text-[10px] text-amber-500 font-bold group-hover:underline">Procedural Setup</span>
                    </div>
                  </div>

                  {/* Option 2+: Themed Legacy Franchises */}
                  {THEMED_OPPONENT_TEAMS.filter((team) => {
                    const q = oppTeamSearchQuery.toLowerCase();
                    return (
                      team.name.toLowerCase().includes(q) ||
                      team.style.toLowerCase().includes(q) ||
                      team.level.toLowerCase().includes(q) ||
                      team.tags.some((t) => t.toLowerCase().includes(q))
                    );
                  }).map((team) => {
                    const isSelected = selectedOpponentTeamId === team.id;
                    return (
                      <div
                        key={team.id}
                        onClick={() => {
                          setSelectedOpponentTeamId(team.id);
                          setDifficulty(team.level as any);
                          draftOpponent(team.id, team.level as any);
                        }}
                        className={`p-4 rounded-xl border transition-all text-left flex flex-col justify-between cursor-pointer group ${
                          isSelected
                            ? "bg-[#1b2026]/80 border-[#f55a15] ring-1 ring-[#f55a15]/30 shadow-lg"
                            : "bg-[#111418] border-gray-850 hover:bg-[#161a1f] hover:border-gray-750"
                        }`}
                        style={{ minHeight: "145px" }}
                      >
                        <div>
                          <div className="flex justify-between items-start gap-1">
                            <span className="text-xs font-display font-black uppercase text-white tracking-wide truncate pr-1">
                              {team.name}
                            </span>
                            <span
                              className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border shrink-0 ${
                                team.level === "Legend"
                                  ? "bg-red-500/10 text-red-400 border-red-500/20"
                                  : team.level === "Hard"
                                  ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                  : team.level === "Medium"
                                  ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                  : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              }`}
                            >
                              {team.level}
                            </span>
                          </div>
                          <p className="text-[10px] text-gray-400 italic mt-1.5 leading-normal">
                            &ldquo;{team.style}&rdquo;
                          </p>
                        </div>
                        <div className="border-t border-gray-850/80 pt-2 mt-3 space-y-1">
                          <span className="text-[9px] font-mono text-gray-550 block">KEY PLAYERS:</span>
                          <div className="flex flex-wrap gap-1 leading-none">
                            {team.tags.slice(0, 3).map((tag, i) => (
                              <span key={i} className="text-[9px] bg-gray-900 border border-gray-800 text-gray-300 font-sans px-1 py-0.5 rounded">
                                {tag}
                              </span>
                            ))}
                            {team.tags.length > 3 && (
                              <span className="text-[9px] text-[#f55a15] font-bold">+{team.tags.length - 3}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Roster Condition Error Gate */}
              {!isRosterComplete ? (
                <div className="bg-yellow-950/20 border border-yellow-800/40 rounded-xl p-5 flex gap-3 text-yellow-200">
                  <ShieldAlert className="w-6 h-6 text-yellow-500 shrink-0 mt-0.5" />
                  <div className="text-xs leading-relaxed font-sans">
                    <span className="font-bold text-yellow-500 block mb-1">Roster Requirement Unfulfilled</span>
                    Your custom team currently consists of <strong className="text-white">{starters.length} starters</strong> and <strong className="text-white">{bench.length} bench</strong> players. You must sign exactly <strong className="text-[#f55a15]">5 starters</strong> and <strong className="text-[#f55a15]">3 bench players</strong> in the Draft tab to authorize simulation.
                    <button
                      onClick={onResetToDraft}
                      className="mt-3.5 bg-[#f55a15] hover:bg-[#ff6e2e] text-black font-bold px-4 py-2 rounded-lg text-xs flex items-center gap-1.5 cursor-pointer uppercase tracking-wider font-display shrink-0"
                    >
                      <ArrowRight className="w-3.5 h-3.5" /> Open Draft Room
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={handleStartSimulation}
                  id="start-simulation-btn"
                  className="w-full bg-[#f55a15] hover:bg-[#ff6e2e] text-black font-display font-black py-4 rounded-xl text-md transition-all uppercase tracking-widest flex items-center justify-center gap-3 cursor-pointer shadow-lg active:scale-98 relative z-10"
                >
                  <Play className="w-5.5 h-5.5 fill-black" /> Run Full-Court Simulation
                </button>
              )}
            </div>

            {/* PRE-GAME SQUAD COMPARISON GRID */}
            {isRosterComplete && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* User Squad */}
                <div className="bg-[#12161a] border border-gray-850 rounded-xl p-5">
                  <span className="text-[10px] font-mono tracking-widest uppercase text-[#f55a15] block mb-1">YOUR TEAM</span>
                  <p className="text-lg font-display font-bold text-white mb-4 truncate">{teamName || "Anonymous Squad"}</p>
                  <div className="space-y-2 max-h-[290px] overflow-y-auto pr-1">
                    {[...starters, ...bench].map((p, idx) => (
                      <div key={p.id} className="flex justify-between items-center text-xs bg-[#1b2026] border border-gray-900 p-2.5 rounded hover:border-gray-800">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[9px] text-[#f55a15] bg-[#f55a15]/10 px-1.5 py-0.5 rounded">
                            {idx < 5 ? "Starter" : "Bench"}
                          </span>
                          <span className="font-semibold text-white">{p.name}</span>
                          <span className="text-gray-500 font-mono font-medium text-[10px]">{p.position}</span>
                        </div>
                        <span className="text-gray-400 font-mono text-[10px]">{p.ppg.toFixed(0)} PPG</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Opponent Squad (Drafted based on difficulty!) */}
                <div className="bg-[#12161a] border border-gray-850 rounded-xl p-5">
                  <span className="text-[10px] font-mono tracking-widest uppercase text-blue-400 block mb-1">AI OPPONENT</span>
                  <p className="text-lg font-display font-bold text-white mb-4 truncate">{opponentTeamName}</p>
                  <div className="space-y-2 max-h-[290px] overflow-y-auto pr-1">
                    {[...opponentStarters, ...opponentBench].map((p, idx) => (
                      <div key={p.id} className="flex justify-between items-center text-xs bg-[#1b2026] border border-gray-900 p-2.5 rounded hover:border-gray-800">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[9px] text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded">
                            {idx < 5 ? "Starter" : "Bench"}
                          </span>
                          <span className="font-semibold text-white/90">{p.name}</span>
                          <span className="text-gray-500 font-mono font-medium text-[10px]">{p.position}</span>
                        </div>
                        <span className="text-gray-400 font-mono text-[10px]">{p.ppg.toFixed(0)} PPG</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* SIMULATING TICKER SCREEN */}
        {stage === "simulating" && (
          <motion.div
            key="simulating"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="bg-[#12161a] border border-[#f55a15]/30 rounded-xl overflow-hidden shadow-2xl glow-orange"
          >
            {/* Header Scoreboard */}
            <div className="bg-gradient-to-b from-[#1b2026] to-[#12161a] border-b border-gray-800 p-6 flex flex-col sm:flex-row justify-between items-center text-center gap-4">
              <div className="flex-1 text-center sm:text-left">
                <p className="text-[10px] text-[#f55a15] font-mono uppercase tracking-widest">HOME</p>
                <p className="text-md md:text-xl font-display font-black text-white truncate">{teamName}</p>
              </div>

              <div className="flex flex-col items-center gap-2 shrink-0 max-w-[220px] w-full">
                <div className="bg-[#090b0d] border border-gray-800 rounded-2xl px-8 py-4 text-center relative w-full">
                  <span className="text-[9px] bg-[#f55a15]/10 text-[#f55a15] font-mono px-2.5 py-0.5 rounded-full border border-[#f55a15]/20 animate-pulse uppercase block font-semibold mb-2">
                    Q{currentQuarter} • {liveTime}
                  </span>
                  <div className="flex items-center justify-center gap-1 font-display text-4xl font-black text-white select-none">
                    <motion.div
                      key={`user-${liveScore.user}`}
                      initial={{ scale: 1.15, color: "#f55a15" }}
                      animate={{ scale: 1, color: "#ffffff" }}
                      transition={{ duration: 0.15 }}
                      className="w-16 text-center font-mono font-black tabular-nums tracking-tighter"
                    >
                      {liveScore.user}
                    </motion.div>
                    <span className="text-gray-600 font-sans text-xl font-normal w-4 text-center">:</span>
                    <motion.div
                      key={`opp-${liveScore.opponent}`}
                      initial={{ scale: 1.15, color: "#f55a15" }}
                      animate={{ scale: 1, color: "#ffffff" }}
                      transition={{ duration: 0.15 }}
                      className="w-16 text-center font-mono font-black tabular-nums tracking-tighter"
                    >
                      {liveScore.opponent}
                    </motion.div>
                  </div>
                </div>
                {/* Dynamic Speed Selector */}
                <div className="flex items-center gap-1.5 bg-[#090b0d]/90 border border-gray-800 p-1.5 rounded-xl w-full justify-center">
                  {(["slow", "normal", "fast"] as const).map((spd) => (
                    <button
                      key={spd}
                      onClick={() => setSimSpeed(spd)}
                      className={`flex-1 py-1 text-[10px] rounded-lg font-mono font-black uppercase transition-all tracking-wider ${
                        simSpeed === spd
                          ? "bg-[#f55a15] text-black shadow-sm glow-orange"
                          : "text-gray-400 hover:text-white hover:bg-gray-850"
                      }`}
                    >
                      {spd}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1 text-center sm:text-right">
                <p className="text-[10px] text-blue-400 font-mono uppercase tracking-widest">AWAY (RIVAL)</p>
                <p className="text-md md:text-xl font-display font-black text-white truncate">{opponentTeamName}</p>
              </div>
            </div>

            {/* Live narrative scrolling block */}
            <div className="p-4 md:p-6 bg-black min-h-[350px] max-h-[400px] overflow-y-auto space-y-4 font-mono select-none border-b border-gray-900">
              {liveFeed.map((play, i) => {
                const isScore = play.type === "score";
                const isFoul = play.type === "foul";
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.15 }}
                    className={`pb-3 border-b border-gray-950 flex gap-3 text-xs leading-relaxed ${
                      isScore ? "bg-emerald-950/5 p-2 rounded border border-emerald-950/20" : ""
                    }`}
                  >
                    <span className="text-[#f55a15] shrink-0 font-bold">[{play.timeRemaining}]</span>
                    <span className="text-gray-400 font-mono text-[9px] shrink-0 uppercase tracking-wider block mt-0.5">Q{play.quarter}</span>
                    <div className="flex-1 text-gray-200">
                      {play.description}
                    </div>
                    <span className={`shrink-0 font-bold font-mono tracking-wider ${isScore ? "text-green-400" : (isFoul ? "text-yellow-500" : "text-gray-400")}`}>
                      {play.score}
                    </span>
                  </motion.div>
                );
              })}
              <div ref={feedEndRef} />
            </div>

            <div className="bg-[#1b2026] px-6 py-4 border-t border-gray-850 flex flex-col sm:flex-row justify-between items-center gap-3">
              <div className="text-xs text-gray-400 font-mono flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#f55a15] animate-ping" />
                <span>Live play-by-play feeding • Play {simStep} / {totalPlaysCount}</span>
              </div>
              
              <button
                type="button"
                onClick={handleSkipToEnd}
                className="px-4.5 py-2 bg-[#f55a15]/10 hover:bg-[#f55a15] text-[#f55a15] hover:text-black border border-[#f55a15]/20 rounded-xl text-xs font-mono font-extrabold uppercase tracking-widest transition-all cursor-pointer shadow-sm min-h-[44px] flex items-center justify-center"
              >
                ⏩ Skip to End
              </button>
            </div>
          </motion.div>
        )}

        {/* RESULTS SCREEN */}
        {stage === "results" && simulatedResult && (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6 relative"
          >
            {/* Run Confetti for winners! */}
            {simulatedResult.userScore > simulatedResult.opponentScore && <ConfettiEffect />}

            {/* Overwhelming victory or loss header panel */}
            {(() => {
              const won = simulatedResult.userScore > simulatedResult.opponentScore;
              return (
                <div className={`p-6 border rounded-xl relative overflow-hidden shadow-2xl ${
                  won
                    ? "bg-slate-900/60 border-emerald-600/40 text-emerald-100 glow-orange"
                    : "bg-slate-900/60 border-red-650/40 text-red-100"
                }`}>
                  <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                    <div className="flex items-center gap-4 text-center md:text-left self-stretch">
                      <div className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 mx-auto md:mx-0 ${
                        won ? "bg-[#f55a15] text-black shadow-lg" : "bg-red-650 text-white shadow-lg"
                      }`}>
                        {won ? <Trophy className="w-7 h-7" /> : <ShieldAlert className="w-7 h-7" />}
                      </div>

                      <div>
                        <h2 className="text-2xl md:text-3xl font-display font-extrabold uppercase tracking-tight text-white leading-none">
                          {won ? "VICTORY UNLOCKED" : "DEFEAT CONCEDED"}
                        </h2>
                        <p className="text-xs text-gray-400 mt-1.5 font-sans leading-relaxed">
                          Your squad {won ? "clinched a spectacular clutch win" : "lost a grueling defensive battle"} against {simulatedResult.opponentName}.
                        </p>
                      </div>
                    </div>

                    <div className="bg-[#0c0f12] border border-gray-800 p-4 rounded-xl text-center shrink-0 w-full md:w-auto min-w-[150px]">
                      <span className="text-[10px] text-gray-500 block font-mono">FINAL SCORE</span>
                      <span className="text-3xl font-black font-display text-white">
                        {simulatedResult.userScore} - {simulatedResult.opponentScore}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Core Box Stats Summary Widgets */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Highlight Game MVP with stunning reveal! */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="bg-gradient-to-b from-amber-950/20 to-[#12161a] border border-amber-900/50 rounded-xl p-5 flex flex-col justify-between shadow-md"
              >
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2 py-0.5 rounded font-mono font-bold tracking-widest uppercase">
                      GAME MVP
                    </span>
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  </div>
                  <h3 className="text-lg font-display font-extrabold text-white truncate">{simulatedResult.mvp.name}</h3>
                  <p className="text-xs text-gray-400">Position Focus: {simulatedResult.mvp.position}</p>
                </div>
                
                <div className="mt-6 pt-4 border-t border-amber-900/35 grid grid-cols-4 text-center font-mono text-amber-200">
                  <div>
                    <span className="text-[9px] text-gray-500 block">PTS</span>
                    <strong className="text-white text-md font-display">{simulatedResult.mvp.points}</strong>
                  </div>
                  <div>
                    <span className="text-[9px] text-gray-500 block">AST</span>
                    <strong className="text-white text-md font-display">{simulatedResult.mvp.assists}</strong>
                  </div>
                  <div>
                    <span className="text-[9px] text-gray-500 block">REB</span>
                    <strong className="text-white text-md font-display">{simulatedResult.mvp.rebounds}</strong>
                  </div>
                  <div>
                    <span className="text-[9px] text-gray-500 block">FG%</span>
                    <strong className="text-white text-md font-display">{simulatedResult.mvp.fgPercent}%</strong>
                  </div>
                </div>
              </motion.div>

              {/* High Scorers stats details */}
              <div className="bg-[#12161a] border border-gray-850 rounded-xl p-5 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] bg-[#f55a15]/10 text-[#f55a15] border border-[#f55a15]/20 px-2 py-0.5 rounded font-mono font-bold inline-block mb-3 uppercase tracking-wider">
                    PTS LEADER
                  </span>
                  <h3 className="text-lg font-display font-extrabold text-white truncate">{simulatedResult.highestScorer.name}</h3>
                  <p className="text-xs text-gray-400">Position Focus: {simulatedResult.highestScorer.position}</p>
                </div>
                <div className="mt-6 pt-4 border-t border-gray-800/50 flex justify-between items-center font-mono text-xs">
                  <span className="text-gray-400">Points Cooked:</span>
                  <span className="text-[#f55a15] font-black text-xl font-display">{simulatedResult.highestScorer.points} PTS</span>
                </div>
              </div>

              {/* Assist leaders stats details */}
              <div className="bg-[#12161a] border border-gray-850 rounded-xl p-5 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded font-mono font-bold inline-block mb-3 uppercase tracking-wider">
                    DIMES LEADER
                  </span>
                  <h3 className="text-lg font-display font-extrabold text-white truncate">{simulatedResult.assistLeader.name}</h3>
                  <p className="text-xs text-gray-400">Position Focus: {simulatedResult.assistLeader.position}</p>
                </div>
                <div className="mt-6 pt-4 border-t border-gray-800/50 flex justify-between items-center font-mono text-xs">
                  <span className="text-gray-400">Dimes Distributed:</span>
                  <span className="text-blue-400 font-black text-xl font-display">{simulatedResult.assistLeader.assists} AST</span>
                </div>
              </div>
            </div>

            {/* ACTION ROW BAR FOR PERSISTENCE */}
            <div className="bg-[#12161a] border border-gray-850 px-5 py-4 rounded-xl flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-xs text-gray-400 text-center sm:text-left font-sans">
                {isRecordSaved 
                  ? "✓ Results saved successfully to your cloud GM legacy record history."
                  : "Save this dynamic match record in your career simulation history database."}
              </p>

              <div className="flex gap-2.5 w-full sm:w-auto">
                <button
                  onClick={saveToHistory}
                  disabled={isRecordSaved || savingRecord}
                  id="save-records-button"
                  className="flex-1 sm:flex-none text-xs bg-[#f55a15] hover:bg-[#ff6e2e] text-black font-display font-bold px-5 py-2.5 rounded-lg uppercase tracking-wider shadow active:scale-95 disabled:opacity-40"
                >
                  {savingRecord ? "Saving Detail..." : (isRecordSaved ? "Record Saved" : "Save Game Record")}
                </button>
                <button
                  onClick={handleStartSimulation}
                  className="flex-1 sm:flex-none text-xs bg-[#1b2026] hover:bg-gray-800 border border-gray-800 text-white font-display font-bold px-4 py-2.5 rounded-lg uppercase tracking-wider flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Rematch Opponent
                </button>
              </div>
            </div>

            {/* TAB SELECTION - NARRATIVE VS BOX SCORE */}
            <div className="bg-[#12161a] border border-gray-850 rounded-xl overflow-hidden shadow-lg">
              <div className="bg-[#1b2026] border-b border-gray-800 flex">
                <button
                  onClick={() => setActiveTab("narrative")}
                  className={`flex-1 py-4 text-center font-display font-bold uppercase tracking-widest text-xs transition-colors cursor-pointer ${
                    activeTab === "narrative"
                      ? "bg-[#12161a] text-[#f55a15] border-b-2 border-[#f55a15]"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  Play-by-play narrative logs
                </button>
                <button
                  onClick={() => setActiveTab("box")}
                  className={`flex-1 py-4 text-center font-display font-bold uppercase tracking-widest text-xs transition-colors cursor-pointer ${
                    activeTab === "box"
                      ? "bg-[#12161a] text-[#f55a15] border-b-2 border-[#f55a15]"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  Full Game Boxscore
                </button>
              </div>

              {/* tab panel: narrative */}
              {activeTab === "narrative" && (
                <div className="p-4 md:p-6 space-y-3 font-mono text-xs text-gray-300 max-h-[380px] overflow-y-auto">
                  {simulatedResult.playByPlay.map((feed, i) => (
                    <div key={i} className="flex gap-2.5 border-b border-gray-901/50 pb-2 flex-col sm:flex-row">
                      <div className="flex gap-2 text-[#f55a15] font-semibold shrink-0">
                        <span>Q{feed.quarter}</span>
                        <span>-</span>
                        <span>{feed.timeRemaining}</span>
                      </div>
                      <span className="flex-1 text-gray-200">{feed.description}</span>
                      <span className="text-gray-500 font-bold self-end sm:self-auto">{feed.score}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* tab panel: detailed box score */}
              {activeTab === "box" && (
                <div className="p-4 md:p-6 space-y-8">
                  {/* Your team box statistics */}
                  <div>
                    <h3 className="text-sm font-display font-extrabold text-[#f55a15] uppercase tracking-wider mb-3">
                      {simulatedResult.userTeamName} (YOUR SQUAD)
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs text-gray-400">
                        <thead className="bg-[#1b2026] text-[10px] text-gray-500 uppercase font-mono tracking-wider">
                          <tr>
                            <th className="p-2.5 pl-4">PLAYER NAME</th>
                            <th className="p-2.5">POS</th>
                            <th className="p-2.5 text-center">PTS</th>
                            <th className="p-2.5 text-center">AST</th>
                            <th className="p-2.5 text-center">REB</th>
                            <th className="p-2.5 text-center">FGM-A</th>
                            <th className="p-2.5 text-center">FG%</th>
                          </tr>
                        </thead>
                        <tbody>
                          {totalUserStats.map((p, i) => (
                            <tr key={i} className="border-b border-gray-900 hover:bg-gray-900/40">
                              <td className="p-2.5 pl-4 font-bold text-white">{p.name}</td>
                              <td className="p-2.5 text-gray-500 font-mono">{p.position}</td>
                              <td className="p-2.5 text-center text-white font-black text-sm">{p.points}</td>
                              <td className="p-2.5 text-center text-white font-medium">{p.assists}</td>
                              <td className="p-2.5 text-center text-white font-medium">{p.rebounds}</td>
                              <td className="p-2.5 text-center font-mono text-gray-300">{p.fgm}-{p.fga}</td>
                              <td className="p-2.5 text-center font-mono text-[#f55a15] font-bold">{p.fgPercent}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Rival team box statistics */}
                  <div>
                    <h3 className="text-sm font-display font-extrabold text-blue-400 uppercase tracking-wider mb-3">
                      {simulatedResult.opponentName} (AI OPPONENT)
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs text-gray-400">
                        <thead className="bg-[#1b2026] text-[10px] text-gray-500 uppercase font-mono tracking-wider">
                          <tr>
                            <th className="p-2.5 pl-4">PLAYER NAME</th>
                            <th className="p-2.5">POS</th>
                            <th className="p-2.5 text-center">PTS</th>
                            <th className="p-2.5 text-center">AST</th>
                            <th className="p-2.5 text-center">REB</th>
                            <th className="p-2.5 text-center">FGM-A</th>
                            <th className="p-2.5 text-center">FG%</th>
                          </tr>
                        </thead>
                        <tbody>
                          {totalOpponentStats.map((p, i) => (
                            <tr key={i} className="border-b border-gray-900 hover:bg-gray-900/40">
                              <td className="p-2.5 pl-4 font-bold text-white/90">{p.name}</td>
                              <td className="p-2.5 text-gray-500 font-mono">{p.position}</td>
                              <td className="p-2.5 text-center text-white font-black text-sm">{p.points}</td>
                              <td className="p-2.5 text-center text-white font-medium">{p.assists}</td>
                              <td className="p-2.5 text-center text-white font-medium">{p.rebounds}</td>
                              <td className="p-2.5 text-center font-mono text-gray-300">{p.fgm}-{p.fga}</td>
                              <td className="p-2.5 text-center font-mono text-blue-400 font-bold">{p.fgPercent}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* EXIT CONTROLS FOR THE RESULTS STAGE */}
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setStage("setup")}
                id="play-again-btn"
                className="w-full bg-[#1b2026] hover:bg-gray-800 text-white font-display font-bold py-4 rounded-xl text-xs border border-gray-800 uppercase tracking-wider transition-all cursor-pointer"
              >
                Play Again (Same Teams)
              </button>
              <button
                onClick={onResetToDraft}
                className="w-full bg-transparent hover:bg-gray-900 text-[#f55a15] hover:text-white font-display font-bold py-4 rounded-xl text-xs border border-dashed border-[#f55a15]/50 hover:border-white uppercase tracking-wider transition-all cursor-pointer"
              >
                Redraft Teams (Start over)
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
