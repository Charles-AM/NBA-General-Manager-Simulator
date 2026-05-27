import React, { useState } from "react";
import { GameResult } from "../types";
import { Calendar, Award, ChevronDown, ChevronUp, History, ShieldAlert } from "lucide-react";

interface HistoryListProps {
  games: GameResult[];
  loading: boolean;
}

export default function HistoryList({ games, loading }: HistoryListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const formatDate = (isoStr: string) => {
    try {
      return new Date(isoStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch {
      return "Game Date Unavailable";
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-10 h-10 border-4 border-t-[#f55a15] border-gray-800 rounded-full animate-spin mb-4" />
        <p className="text-sm text-gray-400 font-mono">Retrieving Game Records from Firestore...</p>
      </div>
    );
  }

  return (
    <div id="history-list" className="space-y-4">
      <div className="bg-[#12161a] border border-gray-800 rounded-xl p-5 court-outline-ambient">
        <div className="flex items-center gap-2.5 mb-3">
          <History className="w-5 h-5 text-[#f55a15]" />
          <h2 className="text-xl font-display font-bold text-white uppercase tracking-tight">
            Team History Log
          </h2>
        </div>
        <p className="text-sm text-gray-400 font-sans leading-relaxed">
          Historical log of matches simulated and persistent inside your account database. Expanded items render box statistics.
        </p>
      </div>

      {games.length === 0 ? (
        <div className="text-center py-16 bg-[#12161a] border border-gray-850 rounded-xl">
          <ShieldAlert className="w-10 h-10 text-gray-600 mx-auto mb-4" />
          <p className="text-sm text-gray-400 font-sans">No matches played yet in your franchise career.</p>
          <p className="text-xs text-gray-500 mt-1 font-sans">Run simulated games in the Arena tab to list history records.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {games.map((game) => {
            const hasUserWon = game.userScore > game.opponentScore;
            const isExpanded = expandedId === game.id;

            return (
              <div
                key={game.id}
                className="bg-[#12161a] border border-gray-850 rounded-xl overflow-hidden transition-all hover:border-gray-800"
              >
                {/* Header panel summarized card */}
                <div
                  onClick={() => toggleExpand(game.id)}
                  className="p-4 md:p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 cursor-pointer hover:bg-gray-900/10 transition-colors"
                >
                  <div className="flex flex-col md:flex-row md:items-center gap-3.5 flex-1 select-none">
                    <span className={`text-[10px] uppercase font-mono px-3 py-1 rounded inline-block text-center font-bold font-display cursor-default shadow-sm ${
                      hasUserWon ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"
                    }`}>
                      {hasUserWon ? "WIN" : "LOSS"}
                    </span>
                    <div>
                      <h4 className="text-md font-display font-medium text-white">
                        vs {game.opponentName}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                        <Calendar className="w-3.5 h-3.5 text-gray-500" />
                        <span>{formatDate(game.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between w-full md:w-auto gap-6 shrink-0">
                    <div className="text-right font-display leading-tight">
                      <span className="text-[10px] text-gray-500 block font-mono">FINAL SCORE</span>
                      <span className="text-lg md:text-xl font-bold text-white">
                        {game.userScore} - {game.opponentScore}
                      </span>
                    </div>
                    {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                  </div>
                </div>

                {/* Expanded Box Score */}
                {isExpanded && (
                  <div className="bg-black/40 border-t border-gray-901 p-4 md:p-5 space-y-5 cursor-default">
                    {/* MVP display */}
                    <div className="bg-gradient-to-r from-amber-950/10 via-transparent p-3 rounded-lg border border-amber-900/20 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <Award className="w-4.5 h-4.5 text-amber-500 shrink-0" />
                        <span className="text-xs text-amber-200">
                          Match MVP: <strong className="text-white font-display font-semibold">{game.mvp?.name || "Unresolved"}</strong> ({game.mvp?.points} pts, {game.mvp?.assists} ast, {game.mvp?.rebounds} reb)
                        </span>
                      </div>
                      <span className="text-[10px] text-gray-500 uppercase font-mono tracking-wider hidden sm:inline">
                        Verified Performance
                      </span>
                    </div>

                    {/* Box stats grids */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
                      <div>
                        <h5 className="text-[11px] font-display font-bold text-[#f55a15] uppercase tracking-wider mb-2">
                          Your Squad Box Score
                        </h5>
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-gray-400">
                            <thead className="text-[9px] uppercase font-mono tracking-wider text-gray-550 border-b border-gray-800">
                              <tr>
                                <th className="py-2">Player</th>
                                <th className="py-2 text-center col-span-1">PTS</th>
                                <th className="py-2 text-center">AST</th>
                                <th className="py-2 text-center">REB</th>
                                <th className="py-2 text-center">FG%</th>
                              </tr>
                            </thead>
                            <tbody>
                              {game.playerStats?.map((p, i) => (
                                <tr key={i} className="border-b border-gray-900 hover:bg-white/5">
                                  <td className="py-2 font-medium text-white">{p.name}</td>
                                  <td className="py-2 text-center font-bold text-white">{p.points}</td>
                                  <td className="py-2 text-center">{p.assists}</td>
                                  <td className="py-2 text-center">{p.rebounds}</td>
                                  <td className="py-2 text-center font-mono text-[#f55a15]">{p.fgPercent}%</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      <div>
                        <h5 className="text-[11px] font-display font-bold text-gray-400 uppercase tracking-wider mb-2">
                          Rival Box Score
                        </h5>
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-gray-400">
                            <thead className="text-[9px] uppercase font-mono tracking-wider text-gray-550 border-b border-gray-800">
                              <tr>
                                <th className="py-2">Player</th>
                                <th className="py-2 text-center">PTS</th>
                                <th className="py-2 text-center">AST</th>
                                <th className="py-2 text-center">REB</th>
                                <th className="py-2 text-center">FG%</th>
                              </tr>
                            </thead>
                            <tbody>
                              {game.opponentStats?.map((p, i) => (
                                <tr key={i} className="border-b border-gray-900 hover:bg-white/5">
                                  <td className="py-2 text-gray-300">{p.name}</td>
                                  <td className="py-2 text-center text-white">{p.points}</td>
                                  <td className="py-2 text-center">{p.assists}</td>
                                  <td className="py-2 text-center">{p.rebounds}</td>
                                  <td className="py-2 text-center font-mono">{p.fgPercent}%</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
