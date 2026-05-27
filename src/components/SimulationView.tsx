import React, { useState, useEffect, useRef } from "react";
import { Player, PlayerBoxScore, PlayByPlayLog, GameResult } from "../types";
import { simulateGame } from "../utils/simulator";
import { PRELOADED_PLAYERS, OPPONENT_TEAMS } from "../data";
import { Play, ShieldAlert, Award, AlertCircle, CheckCircle, Zap, ShieldCheck, Trophy, RotateCcw, ArrowRight, Star } from "lucide-react";
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
  const [pieces, setPieces] = useState<any[]>([]);
  useEffect(() => {
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
  // Game Options
  const [gameMode, setGameMode] = useState<50 | 100>(50); // target score
  const [difficulty, setDifficulty] = useState<"Easy" | "Medium" | "Hard">("Medium");
  const [opponentTeamName, setOpponentTeamName] = useState("Crossover Wizards");

  // Roster drafted for opponent
  const [opponentStarters, setOpponentStarters] = useState<Player[]>([]);
  const [opponentBench, setOpponentBench] = useState<Player[]>([]);

  // Simulation state
  const [stage, setStage] = useState<"setup" | "simulating" | "results">("setup");
  const [simStep, setSimStep] = useState(0);
  const [simulatedResult, setSimulatedResult] = useState<GameResult | null>(null);
  const [liveScore, setLiveScore] = useState({ user: 0, opponent: 0 });
  const [liveFeed, setLiveFeed] = useState<PlayByPlayLog[]>([]);
  const [currentQuarter, setCurrentQuarter] = useState(1);
  const [liveTime, setLiveTime] = useState("12:00");
  const [isRecordSaved, setIsRecordSaved] = useState(false);
  const [savingRecord, setSavingRecord] = useState(false);

  const [activeTab, setActiveTab] = useState<"narrative" | "box">("narrative");
  const feedEndRef = useRef<HTMLDivElement>(null);

  // Check if roster is complete
  const isRosterComplete = starters.length === 5 && bench.length === 3;

  // Whenever difficulty changes, we automatically re-draft opponents
  useEffect(() => {
    draftOpponent();
  }, [difficulty]);

  const draftOpponent = () => {
    // Select opponent names based on difficulty context
    let names = ["Steve Kerr", "Robert Horry", "Derek Fisher", "Danny Green", "John Paxson", "Muggsy Bogues", "Kyle Korver"];
    if (difficulty === "Medium") {
      names = ["Reggie Miller", "Allen Iverson", "Steve Nash", "Dominique Wilkins", "Ray Allen", "Isiah Thomas", "Jayson Tatum", "Shai Gilgeous-Alexander"];
    } else if (difficulty === "Hard") {
      names = ["Michael Jordan", "Kobe Bryant", "LeBron James", "Stephen Curry", "Kevin Durant", "Shaquille O'Neal", "Tim Duncan", "Magic Johnson", "Larry Bird", "Nikola Jokić", "Giannis Antetokounmpo"];
    }

    // Filter PRELOADED_PLAYERS that fit our difficulty
    const matched = PRELOADED_PLAYERS.filter(p => p.tier === difficulty.toLowerCase());
    const pool = matched.length >= 8 ? matched : PRELOADED_PLAYERS.filter(p => names.includes(p.name));
    
    // Fallback to any if pool is too small
    const finalPool = pool.length >= 8 ? pool : [...PRELOADED_PLAYERS];

    // Shuffle and slice
    const shuffled = [...finalPool].sort(() => 0.5 - Math.random());
    const startersOpp = shuffled.slice(0, 5).map(p => ({ ...p, position: p.position }));
    const benchOpp = shuffled.slice(5, 8).map(p => ({ ...p, position: p.position }));

    setOpponentStarters(startersOpp);
    setOpponentBench(benchOpp);

    // Pick a matching team name
    const matchingTeam = OPPONENT_TEAMS.find(t => t.level === difficulty);
    setOpponentTeamName(matchingTeam ? matchingTeam.name : "Rival Contenders");
  };

  const handleStartSimulation = async () => {
    if (!isRosterComplete) return;

    setStage("simulating");
    setSimulatedResult(null);
    setLiveFeed([]);
    setLiveScore({ user: 0, opponent: 0 });
    setCurrentQuarter(1);
    setLiveTime("12:00");
    setIsRecordSaved(false);

    // Seed/Simulate full court game result
    const result = simulateGame(
      userId,
      teamName || "User Team",
      opponentTeamName,
      starters,
      bench,
      opponentStarters,
      opponentBench,
      gameMode,
      difficulty
    );

    // Stream plays with Framer Motion to build high suspense
    const totalPlaysCount = result.playByPlay.length;
    let index = 0;

    const interval = setInterval(() => {
      if (index < totalPlaysCount) {
        const play = result.playByPlay[index];
        setLiveFeed((prev) => [...prev, play]);
        setCurrentQuarter(play.quarter);
        setLiveTime(play.timeRemaining);

        // Update core scoreboard
        const scoreMatch = play.score.split(" - ");
        if (scoreMatch.length === 2) {
          setLiveScore({
            user: parseInt(scoreMatch[0]),
            opponent: parseInt(scoreMatch[1])
          });
        }

        index++;
        setSimStep(index);

        setTimeout(() => {
          feedEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 15);
      } else {
        clearInterval(interval);
        setSimulatedResult(result);
        setStage("results");
      }
    }, 400); // Ticking timing speed
  };

  const saveToHistory = async () => {
    if (!simulatedResult) return;
    setSavingRecord(true);
    try {
      await onSaveGameRecord(simulatedResult);
      setIsRecordSaved(true);
    } catch (e) {
      console.error(e);
    } finally {
      setSavingRecord(false);
    }
  };

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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
                {/* Mode Select */}
                <div>
                  <label className="text-xs text-gray-400 font-mono uppercase tracking-widest block mb-2">
                    Game Target Score
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setGameMode(50)}
                      className={`py-3 px-4 rounded-lg text-xs font-display font-bold uppercase transition-all tracking-wider ${
                        gameMode === 50
                          ? "bg-[#f55a15] text-black shadow-md glow-orange"
                          : "bg-[#1b2026] text-gray-300 border border-gray-850 hover:bg-gray-800"
                      }`}
                    >
                      First to 50
                    </button>
                    <button
                      onClick={() => setGameMode(100)}
                      className={`py-3 px-4 rounded-lg text-xs font-display font-bold uppercase transition-all tracking-wider ${
                        gameMode === 100
                          ? "bg-[#f55a15] text-black shadow-md glow-orange"
                          : "bg-[#1b2026] text-gray-300 border border-gray-850 hover:bg-gray-800"
                      }`}
                    >
                      Full (First to 100)
                    </button>
                  </div>
                </div>

                {/* Difficulty Select */}
                <div>
                  <label className="text-xs text-gray-400 font-mono uppercase tracking-widest block mb-2">
                    Difficulty Level
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(["Easy", "Medium", "Hard"] as const).map((level) => (
                      <button
                        key={level}
                        onClick={() => setDifficulty(level)}
                        className={`py-3 rounded-lg text-xs font-display font-bold uppercase transition-all ${
                          difficulty === level
                            ? "bg-[#f55a15] text-black shadow-md glow-orange"
                            : "bg-[#1b2026] text-gray-300 border border-gray-850 hover:bg-gray-850"
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Opponent Selection Details */}
                <div>
                  <label className="text-xs text-gray-400 font-mono uppercase tracking-widest block mb-2">
                    Opposing Franchise Team
                  </label>
                  <div className="bg-[#1b2026] border border-gray-850 p-3.5 rounded-lg text-sm flex justify-between items-center text-white">
                    <span className="font-semibold block truncate pr-2">{opponentTeamName}</span>
                    <span className="text-[10px] font-mono tracking-wide px-2 py-0.5 bg-gray-850 text-gray-400 rounded">
                      {difficulty}
                    </span>
                  </div>
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

              <div className="bg-[#090b0d] border border-gray-800 rounded-2xl px-8 py-4 shrink-0 text-center relative max-w-[220px] w-full">
                <span className="text-[9px] bg-[#f55a15]/10 text-[#f55a15] font-mono px-2.5 py-0.5 rounded-full border border-[#f55a15]/20 animate-pulse uppercase block font-semibold mb-2">
                  Q{currentQuarter} • {liveTime}
                </span>
                <div className="flex items-center justify-center gap-4 font-display text-4xl font-black tracking-mono text-white select-none">
                  <motion.span
                    key={liveScore.user}
                    initial={{ scale: 1.25, color: "#f55a15" }}
                    animate={{ scale: 1, color: "#ffffff" }}
                    transition={{ duration: 0.2 }}
                  >
                    {liveScore.user}
                  </motion.span>
                  <span className="text-gray-600 font-sans text-xl font-normal">:</span>
                  <motion.span
                    key={liveScore.opponent}
                    initial={{ scale: 1.25, color: "#f55a15" }}
                    animate={{ scale: 1, color: "#ffffff" }}
                    transition={{ duration: 0.2 }}
                  >
                    {liveScore.opponent}
                  </motion.span>
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

            <div className="bg-[#1b2026] px-6 py-4 border-t border-gray-850 text-center text-xs text-gray-400 font-mono animate-pulse flex justify-center items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#f55a15] animate-ping" />
              Compiling real-time basketball stats... Play {simStep} / {simStep + 10}
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
