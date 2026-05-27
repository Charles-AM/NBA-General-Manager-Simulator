import React, { useState } from "react";
import { GameResult } from "../types";
import { Award, Star, Flame, Zap, ShieldAlert, Trash2, Globe, Settings, TrendingUp } from "lucide-react";

interface LeadersViewProps {
  games: GameResult[];
  loading: boolean;
  onClearHistory?: () => Promise<void>;
}

interface PlayerLeaderStats {
  name: string;
  totalPoints: number;
  totalAssists: number;
  totalRebounds: number;
  gamesPlayed: number;
  maxPoints: number;
  maxAssists: number;
}

export default function LeadersView({ games, loading, onClearHistory }: LeadersViewProps) {
  const [activeLeaderTab, setActiveLeaderTab] = useState<"personal" | "global" | "settings">("personal");
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Parse Career Metrics
  const aggregateLeaderboards = (): PlayerLeaderStats[] => {
    const registry: { [name: string]: PlayerLeaderStats } = {};

    games.forEach((game) => {
      game.playerStats?.forEach((p) => {
        if (!registry[p.name]) {
          registry[p.name] = {
            name: p.name,
            totalPoints: 0,
            totalAssists: 0,
            totalRebounds: 0,
            gamesPlayed: 0,
            maxPoints: 0,
            maxAssists: 0
          };
        }

        const ref = registry[p.name];
        ref.totalPoints += p.points;
        ref.totalAssists += p.assists;
        ref.totalRebounds += p.rebounds;
        ref.gamesPlayed += 1;
        if (p.points > ref.maxPoints) ref.maxPoints = p.points;
        if (p.assists > ref.maxAssists) ref.maxAssists = p.assists;
      });
    });

    return Object.values(registry);
  };

  const leaders = aggregateLeaderboards();

  const topPoints = [...leaders]
    .filter((l) => l.totalPoints > 0)
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .slice(0, 5);

  const topAssists = [...leaders]
    .filter((l) => l.totalAssists > 0)
    .sort((a, b) => b.totalAssists - a.totalAssists)
    .slice(0, 5);

  const singleGameScoringRecord = games.reduce((acc, game) => {
    game.playerStats?.forEach((p) => {
      if (p.points > acc.points) {
        acc = { name: p.name, points: p.points, opponent: game.opponentName, date: game.createdAt };
      }
    });
    return acc;
  }, { name: "None", points: 0, opponent: "N/A", date: "" });

  const singleGameAssistsRecord = games.reduce((acc, game) => {
    game.playerStats?.forEach((p) => {
      if (p.assists > acc.assists) {
        acc = { name: p.name, assists: p.assists, opponent: game.opponentName, date: game.createdAt };
      }
    });
    return acc;
  }, { name: "None", assists: 0, opponent: "N/A", date: "" });

  const handleClearAllHistory = async () => {
    if (!onClearHistory) return;
    setDeleting(true);
    try {
      await onClearHistory();
      setShowConfirmDelete(false);
      alert("SUCCESS: All simulated games history ledger cleared from database.");
    } catch (e) {
      console.error(e);
      alert("Clear operations failed. Verify connection status.");
    } finally {
      setDeleting(false);
    }
  };

  // MOCK GLOBAL BENCHMARKS FOR GAMIFIED COMPETITION
  const globalSingleGameScores = [
    { name: "Michael Jordan", team: "CHI", score: 63, owner: "GoldenState_GM" },
    { name: "Kobe Bryant", team: "LAL", score: 61, owner: "MambaGM_8" },
    { name: "Wilt Chamberlain", team: "PHI", score: 58, owner: "DynastyGeneral" },
    { name: "Stephen Curry", team: "GSW", score: 54, owner: "SplashKing" },
    { name: "LeBron James", team: "MIA", score: 52, owner: "KingJames_App" },
    { name: "James Harden", team: "HOU", score: 50, owner: "DraftTactician" },
    { name: "Luka Dončić", team: "DAL", score: 49, owner: "LukaMagic" },
    { name: "Allen Iverson", team: "PHI", score: 48, owner: "CrossoverLegend" },
    { name: "Damian Lillard", team: "POR", score: 47, owner: "DameTime_99" },
    { name: "Kyrie Irving", team: "CLE", score: 46, owner: "AnklesGM" }
  ];

  const globalCareerPoints = [
    { name: "LeBron James", points: 40120, user: "KingLoz_General" },
    { name: "Kareem Abdul-Jabbar", points: 38387, user: "RetroShowtime" },
    { name: "Karl Malone", points: 36928, user: "MailmanExpress" },
    { name: "Kobe Bryant", points: 33643, user: "VenomGM_LAL" },
    { name: "Michael Jordan", points: 32292, user: "AirFlight_23" },
    { name: "Dirk Nowitzki", points: 31560, user: "FadeawayGerman" },
    { name: "Wilt Chamberlain", points: 31419, user: "OverlordCenter" },
    { name: "Julius Erving", points: 30026, user: "DrJ_Boomer" },
    { name: "Moses Malone", points: 29580, user: "BigMo_Boards" },
    { name: "Shaquille O'Neal", points: 28596, user: "DieselPower" }
  ];

  const globalWinPercentages = [
    { user: "ChampGM_Boston", winPct: 88, games: 45 },
    { user: "MambaTactics", winPct: 84, games: 60 },
    { user: "SplashBrotherFan", winPct: 82, games: 32 },
    { user: "ShowtimeDynasty", winPct: 79, games: 110 },
    { user: "AirJordan_23", winPct: 78, games: 85 },
    { user: "TheDiesel_8", winPct: 76, games: 50 },
    { user: "DrRetroBasketball", winPct: 75, games: 24 },
    { user: "DenverMileHigh", winPct: 73, games: 41 },
    { user: "SkyHookLegend", winPct: 71, games: 68 },
    { user: "FranchiseArchitect", winPct: 70, games: 15 }
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-10 h-10 border-4 border-t-[#f55a15] border-gray-800 rounded-full animate-spin mb-4" />
        <p className="text-sm text-gray-400 font-mono">Aggregating League Records...</p>
      </div>
    );
  }

  return (
    <div id="leaders-view" className="space-y-6">
      
      {/* INTRO HERO BOX */}
      <div className="bg-[#12161a] border border-gray-800 rounded-xl p-5 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-[#f55a15]" />
            <h2 className="text-xl font-display font-black uppercase text-white tracking-tight">
              Honors & Career Ledger
            </h2>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Browse aggregated stats, compete with global GMs, and clear game files.
          </p>
        </div>

        <div className="flex border border-gray-800 rounded-lg p-1 bg-black/40 shrink-0">
          <button
            onClick={() => setActiveLeaderTab("personal")}
            className={`px-3 py-1.5 rounded text-xs font-display font-semibold uppercase tracking-wider transition-colors ${
              activeLeaderTab === "personal" ? "bg-[#f55a15] text-black font-extrabold" : "text-gray-400 hover:text-white"
            }`}
          >
            My Records
          </button>
          <button
            onClick={() => setActiveLeaderTab("global")}
            className={`px-3 py-1.5 rounded text-xs font-display font-semibold uppercase tracking-wider transition-colors ${
              activeLeaderTab === "global" ? "bg-[#f55a15] text-black font-extrabold" : "text-gray-400 hover:text-white"
            }`}
          >
            Global Leaderboard
          </button>
          <button
            onClick={() => setActiveLeaderTab("settings")}
            className={`px-3 py-1.5 rounded text-xs font-display font-semibold uppercase tracking-wider transition-colors ${
              activeLeaderTab === "settings" ? "bg-[#f55a15] text-black font-extrabold" : "text-gray-400 hover:text-white"
            }`}
          >
            Settings
          </button>
        </div>
      </div>

      {/* CONFIRM DELETE MODAL GATED PANEL */}
      {showConfirmDelete && (
        <div className="bg-red-950/20 border-2 border-red-900 rounded-xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center gap-2.5 text-red-400">
            <ShieldAlert className="w-6 h-6 animate-bounce" />
            <h3 className="text-lg font-display font-black uppercase text-white tracking-tight">
              CRITICAL: Clear Simulation Ledger?
            </h3>
          </div>
          <p className="text-xs text-gray-300 leading-relaxed font-sans">
            This operation is <span className="text-red-400 font-bold underline">irreversible</span>. It will completely delete all simulated match history results for your GM account in Firestore. Career win-loss tallies will return to zero.
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleClearAllHistory}
              disabled={deleting}
              className="bg-red-650 hover:bg-red-500 text-white font-display font-bold px-4 py-2.5 rounded-lg text-xs uppercase tracking-wide cursor-pointer flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" /> {deleting ? "Purging Files..." : "Confirmed: Erase History"}
            </button>
            <button
              onClick={() => setShowConfirmDelete(false)}
              className="bg-[#1b2026] hover:bg-gray-800 text-white border border-gray-800 px-4 py-2.5 rounded-lg text-xs transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* VIEW PANEL: PERSONAL SQUAD RECORDS */}
      {activeLeaderTab === "personal" && (
        <div className="space-y-6 animate-fade-in">
          {games.length === 0 ? (
            <div className="text-center py-16 bg-[#12161a] border border-gray-850 rounded-xl">
              <ShieldAlert className="w-10 h-10 text-gray-600 mx-auto mb-4 animate-pulse" />
              <p className="text-sm text-gray-400 font-sans">No personal accomplishments compiled.</p>
              <p className="text-xs text-gray-500 mt-1 font-sans">Draft and run live match simulations under the Arena tab first!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Wins and cumulative highlights */}
              {(() => {
                const totalGames = games.length;
                const careerWins = games.filter((g) => g.userScore > g.opponentScore).length;
                const careerLosses = totalGames - careerWins;
                const winPct = totalGames > 0 ? Math.round((careerWins / totalGames) * 100) : 0;
                
                return (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div className="bg-[#12161a] border border-gray-800 rounded-xl p-4">
                      <span className="text-[9px] text-gray-500 uppercase font-mono block">Sim Games</span>
                      <strong className="text-3xl font-black font-display text-white">{totalGames}</strong>
                    </div>
                    <div className="bg-[#12161a] border border-gray-800 rounded-xl p-4">
                      <span className="text-[9px] text-gray-500 uppercase font-mono block">Record</span>
                      <strong className="text-3xl font-black font-display text-green-400">{careerWins}W - {careerLosses}L</strong>
                    </div>
                    <div className="bg-[#12161a] border border-gray-800 rounded-xl p-4">
                      <span className="text-[9px] text-gray-500 uppercase font-mono block">Win-Pct</span>
                      <strong className="text-3xl font-black font-display text-[#f55a15]">{winPct}%</strong>
                    </div>
                    <div className="bg-[#12161a] border border-gray-800 rounded-xl p-4">
                      <span className="text-[9px] text-gray-500 uppercase font-mono block">Margin Avg</span>
                      <strong className="text-3xl font-black font-display text-blue-400">
                        {(games.reduce((acc,g) => acc + (g.userScore - g.opponentScore), 0) / totalGames).toFixed(1)}
                      </strong>
                    </div>
                  </div>
                );
              })()}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#12161a] border border-gray-800 rounded-xl p-5 relative overflow-hidden">
                  <span className="text-[10px] bg-[#f55a15]/10 text-[#f55a15] border border-[#f55a15]/20 font-mono px-2 py-0.5 rounded font-bold uppercase block w-max">
                    SINGLE GAME SCORING LANDMARK
                  </span>
                  <p className="text-2xl font-extrabold font-display text-white mt-3">
                    {singleGameScoringRecord.points} <span className="text-xs text-gray-400">Points</span>
                  </p>
                  <p className="text-sm font-semibold text-gray-300 mt-1">{singleGameScoringRecord.name}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">Scored against {singleGameScoringRecord.opponent}</p>
                </div>

                <div className="bg-[#12161a] border border-gray-800 rounded-xl p-5 relative overflow-hidden">
                  <span className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono px-2 py-0.5 rounded font-bold uppercase block w-max">
                    SINGLE GAME ASSISTS LANDMARK
                  </span>
                  <p className="text-2xl font-extrabold font-display text-white mt-3">
                    {singleGameAssistsRecord.assists} <span className="text-xs text-gray-400">Assists</span>
                  </p>
                  <p className="text-sm font-semibold text-gray-300 mt-1">{singleGameAssistsRecord.name}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">Distributed against {singleGameAssistsRecord.opponent}</p>
                </div>
              </div>

              {/* Roster career cumulative leader panels */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="bg-[#12161a] border border-gray-800 rounded-xl p-5 space-y-3">
                  <h3 className="text-xs font-display font-medium text-white uppercase tracking-wider border-b border-gray-850 pb-2">
                    🎖️ Career Points leaders
                  </h3>
                  <div className="space-y-2">
                    {topPoints.map((p, i) => (
                      <div key={p.name} className="flex justify-between items-center text-xs bg-[#1b2026] p-2.5 rounded border border-gray-901">
                        <span className="text-gray-500 font-mono font-bold w-4">{i+1}.</span>
                        <span className="flex-1 text-white truncate font-medium ml-1">{p.name}</span>
                        <strong className="text-white text-xs font-mono font-bold">{p.totalPoints} PTS</strong>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-[#12161a] border border-gray-800 rounded-xl p-5 space-y-3">
                  <h3 className="text-xs font-display font-medium text-white uppercase tracking-wider border-b border-gray-850 pb-2">
                    🎖️ Career Assists leaders
                  </h3>
                  <div className="space-y-2">
                    {topAssists.map((p, i) => (
                      <div key={p.name} className="flex justify-between items-center text-xs bg-[#1b2026] p-2.5 rounded border border-gray-901">
                        <span className="text-gray-500 font-mono font-bold w-4">{i+1}.</span>
                        <span className="flex-1 text-white truncate font-medium ml-1">{p.name}</span>
                        <strong className="text-blue-400 text-xs font-mono font-bold">{p.totalAssists} AST</strong>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW PANEL: GLOBAL BENCHMARKS */}
      {activeLeaderTab === "global" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in text-xs">
          
          {/* Top 10 Single Game Point Records */}
          <div className="bg-[#12161a] border border-gray-800 rounded-xl p-5 space-y-3">
            <h3 className="text-xs font-display font-black uppercase text-[#f55a15] tracking-tight flex items-center gap-1.5 pb-2 border-b border-gray-850">
              <Zap className="w-4 h-4" /> Top 10 Game Scores
            </h3>
            <div className="space-y-2">
              {globalSingleGameScores.map((item, i) => (
                <div key={i} className="bg-[#1b2026] border border-gray-900 rounded-lg p-2 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-550 font-mono font-bold w-4">{i+1}.</span>
                    <div>
                      <p className="font-bold text-white">{item.name}</p>
                      <span className="text-[9px] text-gray-500 font-mono">GM: {item.owner}</span>
                    </div>
                  </div>
                  <strong className="text-[#f55a15] font-display font-black text-sm">{item.score} PTS</strong>
                </div>
              ))}
            </div>
          </div>

          {/* Top 10 Career Points Leaders */}
          <div className="bg-[#12161a] border border-gray-800 rounded-xl p-5 space-y-3">
            <h3 className="text-xs font-display font-black uppercase text-blue-400 tracking-tight flex items-center gap-1.5 pb-2 border-b border-gray-850">
              <TrendingUp className="w-4 h-4" /> Top 10 Total Points
            </h3>
            <div className="space-y-2">
              {globalCareerPoints.map((item, i) => (
                <div key={i} className="bg-[#1b2026] border border-gray-900 rounded-lg p-2 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-550 font-mono font-bold w-4">{i+1}.</span>
                    <div>
                      <p className="font-bold text-white">{item.name}</p>
                      <span className="text-[9px] text-gray-500 font-mono">GM: {item.user}</span>
                    </div>
                  </div>
                  <strong className="text-white font-mono font-semibold">{item.points.toLocaleString()}</strong>
                </div>
              ))}
            </div>
          </div>

          {/* Top 10 Win Percentages */}
          <div className="bg-[#12161a] border border-gray-800 rounded-xl p-5 space-y-3">
            <h3 className="text-xs font-display font-black uppercase text-green-400 tracking-tight flex items-center gap-1.5 pb-2 border-b border-gray-850">
              <Globe className="w-4 h-4" /> Top 10 Win Percentages
            </h3>
            <div className="space-y-2">
              {globalWinPercentages.map((item, i) => (
                <div key={i} className="bg-[#1b2026] border border-gray-900 rounded-lg p-2 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-550 font-mono font-bold w-4">{i+1}.</span>
                    <div>
                      <p className="font-bold text-white">{item.user}</p>
                      <span className="text-[9px] text-gray-500 font-mono">{item.games} games played</span>
                    </div>
                  </div>
                  <strong className="text-green-400 font-display font-black text-sm">{item.winPct}%</strong>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* VIEW PANEL: SETTINGS CONTROLS */}
      {activeLeaderTab === "settings" && (
        <div className="bg-[#12161a] border border-gray-850 rounded-xl p-5 animate-fade-in space-y-6">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-850">
            <Settings className="w-4.5 h-4.5 text-gray-400" />
            <h3 className="text-sm font-display font-black uppercase text-white tracking-widest">
              Franchise Database Settings
            </h3>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#1b2026] p-5 rounded-lg border border-gray-900">
            <div className="space-y-1">
              <h4 className="font-display font-bold text-white text-xs uppercase tracking-wide">Purge Game History Ledger</h4>
              <p className="text-xs text-gray-400">Remove all simulated game entries indefinitely. This can NOT be undone.</p>
            </div>

            <button
              onClick={() => setShowConfirmDelete(true)}
              className="bg-red-950/20 hover:bg-red-900 border border-red-950/40 text-red-200 py-2.5 px-4 rounded-lg text-xs font-display font-black uppercase tracking-wider cursor-pointer flex items-center gap-1 shrink-0"
            >
              <Trash2 className="w-4 h-4" /> Clear History Ledger
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
