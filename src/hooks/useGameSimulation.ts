import { useState, useEffect, useRef } from "react";
import { Player, PlayByPlayLog, GameResult } from "../types";
import { simulateGame } from "../utils/simulator";
import { PRELOADED_PLAYERS, OPPONENT_TEAMS, THEMED_OPPONENT_TEAMS } from "../data";

interface UseGameSimulationProps {
  userId: string;
  teamName: string;
  starters: Player[];
  bench: Player[];
  onSaveGameRecord: (record: GameResult) => Promise<void>;
}

export function useGameSimulation({
  userId,
  teamName,
  starters,
  bench,
  onSaveGameRecord,
}: UseGameSimulationProps) {
  // Game Options
  const [gameMode, setGameMode] = useState<50 | 100>(50); // target score
  const [difficulty, setDifficulty] = useState<"Easy" | "Medium" | "Hard" | "Legend">("Medium");
  const [opponentTeamName, setOpponentTeamName] = useState("Crossover Wizards");
  const [selectedOpponentTeamId, setSelectedOpponentTeamId] = useState<string>("dynamic");
  const [oppTeamSearchQuery, setOppTeamSearchQuery] = useState("");

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

  // Speed options
  const [simSpeed, setSimSpeed] = useState<"slow" | "normal" | "fast">("normal");
  const simSpeedRef = useRef(simSpeed);
  const timeoutRef = useRef<any>(null);
  const playIndexRef = useRef(0);
  const activeResultRef = useRef<GameResult | null>(null);

  useEffect(() => {
    simSpeedRef.current = simSpeed;
  }, [simSpeed]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const isRosterComplete = starters.length === 5 && bench.length === 3;

  // Whenever difficulty or selected team changes, automatically re-draft
  useEffect(() => {
    draftOpponent(selectedOpponentTeamId, difficulty);
  }, [selectedOpponentTeamId, difficulty]);

  const draftOpponent = (teamId: string, currentDifficulty: "Easy" | "Medium" | "Hard" | "Legend") => {
    if (teamId === "dynamic") {
      let names = ["Steve Kerr", "Robert Horry", "Derek Fisher", "Danny Green", "John Paxson", "Malik Monk", "Kyle Korver"];
      if (currentDifficulty === "Medium") {
        names = ["Reggie Miller", "Allen Iverson", "Steve Nash", "Domantas Sabonis", "Ray Allen", "Isiah Thomas", "Jayson Tatum", "Shai Gilgeous-Alexander"];
      } else if (currentDifficulty === "Hard") {
        names = ["Michael Jordan", "Kobe Bryant", "LeBron James", "Stephen Curry", "Kevin Durant", "Shaquille O'Neal", "Tim Duncan", "Magic Johnson", "Larry Bird", "Nikola Jokić", "Giannis Antetokounmpo"];
      } else if (currentDifficulty === "Legend") {
        names = ["Michael Jordan", "Kobe Bryant", "LeBron James", "Stephen Curry", "Kevin Durant", "Shaquille O'Neal", "Tim Duncan", "Magic Johnson", "Larry Bird", "Nikola Jokić", "Giannis Antetokounmpo", "Tony Parker", "Kareem Abdul-Jabbar", "Luka Dončić"];
      }

      // Filter PRELOADED_PLAYERS that fit difficulty levels
      const matched = PRELOADED_PLAYERS.filter(p => {
        if (currentDifficulty === "Legend") return p.tier.toLowerCase() === "legendary";
        if (currentDifficulty === "Hard") return p.tier.toLowerCase() === "gold";
        if (currentDifficulty === "Medium") return p.tier.toLowerCase() === "silver";
        return p.tier.toLowerCase() === "bronze";
      });
      const pool = matched.length >= 8 ? matched : PRELOADED_PLAYERS.filter(p => names.includes(p.name));
      const finalPool = pool.length >= 8 ? pool : [...PRELOADED_PLAYERS];

      const shuffled = [...finalPool].sort(() => 0.5 - Math.random());
      const startersOpp = shuffled.slice(0, 5).map(p => ({ ...p, position: p.position }));
      const benchOpp = shuffled.slice(5, 8).map(p => ({ ...p, position: p.position }));

      setOpponentStarters(startersOpp);
      setOpponentBench(benchOpp);

      const matchingTeam = OPPONENT_TEAMS.find(t => t.level === currentDifficulty);
      setOpponentTeamName(matchingTeam ? matchingTeam.name : "Rival Contenders");
    } else {
      const themedTeam = THEMED_OPPONENT_TEAMS.find(t => t.id === teamId);
      if (!themedTeam) return;

      setOpponentTeamName(themedTeam.name);

      // Stars
      const starPlayers = PRELOADED_PLAYERS.filter(p =>
        themedTeam.tags.some(tag => p.name.toLowerCase().includes(tag.toLowerCase()))
      );

      // Filler
      const teamLevel = themedTeam.level;
      const matchedFiller = PRELOADED_PLAYERS.filter(p => {
        if (starPlayers.some(sp => sp.id === p.id)) return false;
        if (teamLevel === "Legend") return p.tier === "Legendary" || p.tier === "Gold";
        if (teamLevel === "Hard") return p.tier === "Gold" || p.tier === "Silver";
        if (teamLevel === "Medium") return p.tier === "Silver" || p.tier === "Bronze";
        return p.tier === "Bronze";
      });

      const shuffledFiller = [...matchedFiller].sort(() => 0.5 - Math.random());
      const fullSquad = [...starPlayers, ...shuffledFiller];

      if (fullSquad.length < 8) {
        const remainingNeeded = 8 - fullSquad.length;
        const backupPool = PRELOADED_PLAYERS.filter(p => !fullSquad.some(fs => fs.id === p.id));
        const extraFillers = [...backupPool].sort(() => 0.5 - Math.random()).slice(0, remainingNeeded);
        fullSquad.push(...extraFillers);
      }

      const startersOpp = fullSquad.slice(0, 5);
      const benchOpp = fullSquad.slice(5, 8);

      setOpponentStarters(startersOpp);
      setOpponentBench(benchOpp);
    }
  };

  const handleStartSimulation = async () => {
    if (!isRosterComplete) return;

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    setStage("simulating");
    setSimulatedResult(null);
    activeResultRef.current = null;
    setLiveFeed([]);
    setLiveScore({ user: 0, opponent: 0 });
    setCurrentQuarter(1);
    setLiveTime("12:00");
    setIsRecordSaved(false);

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
    activeResultRef.current = result;

    const totalPlaysCount = result.playByPlay.length;
    playIndexRef.current = 0;
    setSimStep(0);

    const SPEED_DELAYS = {
      slow: 1000,
      normal: 400,
      fast: 50
    };

    const runStep = () => {
      const idx = playIndexRef.current;
      if (idx < totalPlaysCount) {
        const play = result.playByPlay[idx];
        setLiveFeed((prev) => [...prev, play]);
        setCurrentQuarter(play.quarter);
        setLiveTime(play.timeRemaining);

        // Update core scoreboard
        const scoreMatch = play.score.split("-");
        if (scoreMatch.length === 2) {
          const uS = parseInt(scoreMatch[0].trim());
          const oS = parseInt(scoreMatch[1].trim());
          if (!isNaN(uS) && !isNaN(oS)) {
            setLiveScore({ user: uS, opponent: oS });
          }
        }

        playIndexRef.current = idx + 1;
        setSimStep(idx + 1);

        const currentDelay = SPEED_DELAYS[simSpeedRef.current];
        timeoutRef.current = setTimeout(runStep, currentDelay);
      } else {
        setSimulatedResult(result);
        setStage("results");
        
        onSaveGameRecord(result)
          .then(() => {
            setIsRecordSaved(true);
          })
          .catch((err) => {
            console.error("Auto-save failed on simulation completion:", err);
          });
      }
    };

    const initialDelay = SPEED_DELAYS[simSpeedRef.current];
    timeoutRef.current = setTimeout(runStep, initialDelay);
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

  const handleSkipToEnd = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    const resInstance = activeResultRef.current;
    if (resInstance) {
      setLiveFeed(resInstance.playByPlay);
      const lastPlay = resInstance.playByPlay[resInstance.playByPlay.length - 1];
      if (lastPlay) {
        setCurrentQuarter(lastPlay.quarter);
        setLiveTime(lastPlay.timeRemaining);
        const lastScore = lastPlay.score.split("-");
        if (lastScore.length === 2) {
          const uS = parseInt(lastScore[0].trim());
          const oS = parseInt(lastScore[1].trim());
          if (!isNaN(uS) && !isNaN(oS)) {
            setLiveScore({ user: uS, opponent: oS });
          }
        }
      }
      setSimStep(resInstance.playByPlay.length);
      setSimulatedResult(resInstance);
      setStage("results");
    }
  };

  const totalPlaysCount = simulatedResult?.playByPlay.length || activeResultRef.current?.playByPlay.length || 0;

  return {
    gameMode,
    setGameMode,
    difficulty,
    setDifficulty,
    opponentTeamName,
    setOpponentTeamName,
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
  };
}
