import { Player, PlayerBoxScore, PlayByPlayLog, GameResult } from "../types";

// Helper for generating random integers
const randBetween = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

// Formats seconds into a MM:SS string
function formatTime(secondsLeft: number): string {
  const m = Math.floor(secondsLeft / 60);
  const s = secondsLeft % 60;
  return `${m}:${s < 10 ? "0" + s : s}`;
}

// Map player archetypes based on position, name, and rating
export type PlayerArchetype = "3PT Specialist" | "Post Scorer" | "Slasher" | "Balanced";

export function determineArchetype(name: string, position: string): PlayerArchetype {
  const lowerName = name.toLowerCase();
  const lowerPos = position.toLowerCase();

  if (
    lowerName.includes("curry") ||
    lowerName.includes("thompson") ||
    lowerName.includes("allen") ||
    lowerName.includes("lillard") ||
    lowerName.includes("miller") ||
    lowerName.includes("harden") ||
    lowerName.includes("durant") ||
    lowerName.includes("bird")
  ) {
    return "3PT Specialist";
  }

  if (
    lowerName.includes("jokic") ||
    lowerName.includes("embiid") ||
    lowerName.includes("duncan") ||
    lowerName.includes("shaq") ||
    lowerName.includes("oneal") ||
    lowerName.includes("olajuwon") ||
    lowerName.includes("ewing") ||
    lowerName.includes("kareem") ||
    lowerPos.includes("center")
  ) {
    return "Post Scorer";
  }

  if (
    lowerName.includes("giannis") ||
    lowerName.includes("zion") ||
    lowerName.includes("morant") ||
    lowerName.includes("westbrook") ||
    lowerName.includes("rose") ||
    lowerName.includes("james") ||
    lowerName.includes("jordan") ||
    lowerName.includes("carter")
  ) {
    return "Slasher";
  }

  // Fallback defaults by position
  if (lowerPos.includes("guard")) {
    return Math.random() > 0.5 ? "3PT Specialist" : "Slasher";
  }
  if (lowerPos.includes("center") || lowerPos.includes("power forward")) {
    return "Post Scorer";
  }
  return "Balanced";
}

// Advanced play commentary databases
const threePointPlays = [
  "{player} commands the perimeter, executes a smooth step-back dribble, and swishes an incredible three-pointer!",
  "{player} comes off a stagger screen, catches-and-shoots in one fluid motion... SPLASH from deep!",
  "{player} sizes up their defender, pulls up off the high dribble, and drills a high-arc shot from way downtown!",
  "{player} floats deep beyond the arc, spots an opening, and releases a cold-blooded dagger! BAAAANG!"
];

const midRangePlays = [
  "{player} utilizes a subtle pump-fake, drives laterally, and nails a pure pull-up jumper from 15 feet!",
  "{player} backs down, pivots dynamically, and fades away, swishing a high-difficulty turnaround mid-range shot!",
  "{player} dribbles through a high screen, pulls up on a dime, and banks in an elegant mid-range shot off the glass!",
  "{player} executes a beautiful spin move to create breathing room, elevating for a perfect mid-range splash."
];

const slasherPlays = [
  "{player} splits a heavy double-team on the bounce, navigates the paint with an acrobatic euro-step, and lays it in!",
  "{player} drives fearlessly down the lane, hangs suspended in mid-air, and scoops a circus reverse layup plus the foul!",
  "{player} explodes past the help defender on the wings, elevations high, and finishes a SPECTACULAR two-handed slam!",
  "{player} streaks down the wing on a furious fast break and secures an elegant finger-roll layup off the glass."
];

const postPlays = [
  "{player} establishes deep post position, seals the defender, and executes a delicate hook shot off the glass!",
  "{player} executes the legendary 'Dream Shake' down low, leaving their defender bewildered, and drops an up-and-under layup!",
  "{player} backs down aggressively, shoulders into the chest of the defender, and turns around for an unstoppable baseline post fadeaway!",
  "{player} drops step fluidly along the lane line and floats in an authoritative baby hook."
];

const posterizingDunks = [
  "💥 OH MY WORD! {player} elevates to the heavens and detonates a MONSTER posterizing windmill slam over multiple defenders!",
  "🔥🔥 UNBELIEVABLE! {player} takes off from the dotted line, absorbs contact, and drives home a ferocious poster slam!"
];

const clutchPlays = [
  "🚨 CLUTCH GENIUS MATCH POINT! {player} steps back, isolates, and drills a cold-blooded game-winning bucket!",
  "⏰ COUNTDOWN CLUTCH TIME! {player} attacks the mismatch, shields the ball, and drains an unbelievable clutch jumper plus the harm!"
];

const customAssists = [
  "assisted by a brilliant, physics-defying no-look pass from {passer}.",
  "after a spectacular behind-the-back dish from {passer}.",
  "following a crisp, rapid-fire swinging pass from {passer}.",
  "thanks to {passer}'s spectacular elite floor vision and laser delivery."
];

const defensiveRebounds = [
  "{player} boxes out aggressively and secures a tough defensive rebound.",
  "{player} leaps high above the pack to corral the missed ball.",
  "{player} establishes leverage in the paint and rips down the defensive rebound."
];

const offensiveRebounds = [
  "⚡️ {player} fights hard underneath, tips the ball, and snatches an electric offensive rebound inside the paint!",
  "📈 {player} out-muscles everyone under the board, securing a critical offensive rebound for a fresh possession!"
];

const blockPlays = [
  "❌ REJECTED! {player} rotates instantly from the weak side and swat-blocks the shot into the third row!",
  "💀 NO WAY! {player} stays vertical, tracking the ball, and swat-blocks the attempt out of bounds!"
];

const regularMisses = [
  "{player} takes the contested shot but it ticks off the back rim and misses.",
  "{player} fires from deep, but the ball rattles in and out of the cylinder.",
  "{player} goes for a tough runner in the lane, but it bounces off the side-rim."
];

const turnoverPlays = [
  "{player} loses control of their handle under suffocating pressure, sliding out of bounds.",
  "{player} attempts a high-risk cross-court bounce pass that gets easily intercepted.",
  "{player} gets picked clean on the perimeter while trying to cross over their opponent."
];

export function simulateGame(
  userId: string,
  userTeamName: string,
  opponentName: string,
  userStarters: Player[],
  userBench: Player[],
  opponentStarters: Player[],
  opponentBench: Player[],
  targetScore: number,
  difficulty: "Easy" | "Medium" | "Hard" | "Legend",
  injuriesEnabled: boolean = true,
  playerFatigueMap: Record<string, number> = {} // maps player.id -> stamina percent (0-100)
): GameResult {
  const allUserPlayers = [...userStarters, ...userBench];
  const allOpponentPlayers = [...opponentStarters, ...opponentBench];

  // Designate home court (50/50)
  const isUserHome = Math.random() > 0.5;
  const homeTeamName = isUserHome ? userTeamName : opponentName;

  // Calculate Chemistry helper
  const calcChemistry = (players: Player[]): number => {
    if (players.length === 0) return 0;
    const teamCounts: Record<string, number> = {};
    const eraCounts: Record<string, number> = {};
    
    players.forEach((p) => {
      if (p.team) teamCounts[p.team] = (teamCounts[p.team] || 0) + 1;
      if (p.era) eraCounts[p.era] = (eraCounts[p.era] || 0) + 1;
    });

    let bonus = 0;
    Object.values(teamCounts).forEach((count) => {
      if (count > 1) bonus += count * 2.5; // Up to 25% chemistry
    });
    Object.values(eraCounts).forEach((count) => {
      if (count > 1) bonus += count * 1.5;
    });

    return Math.min(100, Math.round(bonus * 3.3)); // Normalized out of 100
  };

  const userChemistry = calcChemistry(allUserPlayers);
  const opponentChemistry = calcChemistry(allOpponentPlayers);

  // Initialize Box Scores
  const userBoxStats: PlayerBoxScore[] = allUserPlayers.map((p) => ({
    name: p.name,
    position: p.position,
    points: 0,
    assists: 0,
    rebounds: 0,
    fgm: 0,
    fga: 0,
    fgPercent: 0
  }));

  const opponentBoxStats: PlayerBoxScore[] = allOpponentPlayers.map((p) => ({
    name: p.name,
    position: p.position,
    points: 0,
    assists: 0,
    rebounds: 0,
    fgm: 0,
    fga: 0,
    fgPercent: 0
  }));

  const playByPlay: PlayByPlayLog[] = [];
  let userScore = 0;
  let opponentScore = 0;

  // Real-time states
  let currentQuarter = 1;
  let quarterSecondsLeft = 720;
  let userTeamFouls = 0;
  let opponentTeamFouls = 0;

  // Personal statistics mapping
  const playerFouledOutSet = new Set<string>();
  const playerEjectedSet = new Set<string>();
  const playerFoulsMap: Record<string, number> = {};
  const playerTechnicalsMap: Record<string, number> = {};

  // Track injuries that occurred *during this game*
  const gameInjuriesMap: Record<string, { type: "Minor" | "Moderate" | "Major"; games: number }> = {};

  // Find associated player specs
  const getAssociatedPlayerSpec = (playerName: string): { playerSpec: Player | null; isUser: boolean } => {
    const userMatch = allUserPlayers.find(p => p.name === playerName);
    if (userMatch) return { playerSpec: userMatch, isUser: true };
    const oppMatch = allOpponentPlayers.find(p => p.name === playerName);
    if (oppMatch) return { playerSpec: oppMatch, isUser: false };
    return { playerSpec: null, isUser: false };
  };

  // Safe active player index picker (excl fouled out / ejected)
  const pickActivePlayerIndexExcludingOut = (list: PlayerBoxScore[], allSpecs: Player[]) => {
    // 5 starters get higher weight than 3 bench
    const availableIndices: number[] = [];
    list.forEach((p, idx) => {
      if (!playerFouledOutSet.has(p.name) && !playerEjectedSet.has(p.name)) {
        availableIndices.push(idx);
      }
    });

    if (availableIndices.length === 0) return 0;

    // Weight starters higher if they are available
    const startersAvailable = availableIndices.filter(i => i < 5);
    const benchAvailable = availableIndices.filter(i => i >= 5);

    if (startersAvailable.length > 0 && Math.random() < 0.80) {
      return startersAvailable[randBetween(0, startersAvailable.length - 1)];
    }
    return availableIndices[randBetween(0, availableIndices.length - 1)];
  };

  playByPlay.push({
    quarter: 1,
    timeRemaining: "12:00",
    description: `🏟️ Welcome to the Arena! Home-court advantage belongs to: ${homeTeamName}. Target to win: ${targetScore} PTS. Let's make history!`,
    score: "0 - 0",
    type: "neutral"
  });

  let overridePossession: "user" | "opponent" | null = null;

  // Keep simulating possessions until target score is reached
  while (userScore < targetScore && opponentScore < targetScore) {
    const possessionSeconds = randBetween(12, 24);
    quarterSecondsLeft -= possessionSeconds;

    // End of Quarter Logic
    if (quarterSecondsLeft <= 0) {
      playByPlay.push({
        quarter: currentQuarter,
        timeRemaining: "0:00",
        description: `🏀 Buzz! End of Quarter ${currentQuarter}. Scores: ${userTeamName} ${userScore} - ${opponentName} ${opponentScore}`,
        score: `${userScore} - ${opponentScore}`,
        type: "neutral"
      });

      currentQuarter += 1;
      quarterSecondsLeft = 720;
      userTeamFouls = 0;
      opponentTeamFouls = 0;
    }

    const timeStr = formatTime(Math.max(0, quarterSecondsLeft));

    // Handle Sudden late game foul-out strategy (within 1 minute left in play, and down within 8)
    const totalTimeRemainingInQuarter = quarterSecondsLeft;
    const isLateGameClose = Math.abs(userScore - opponentScore) <= 8 && totalTimeRemainingInQuarter < 60;

    // 1. Determine possession (base 50/50, adjusted tiny bit by team chemistry)
    const isUserPossession = overridePossession !== null 
      ? (overridePossession === "user")
      : (Math.random() > (0.50 - (userChemistry - opponentChemistry) / 1000));
    
    // Reset possession override for subsequent play
    overridePossession = null;

    const currentTeamName = isUserPossession ? userTeamName : opponentName;
    const otherTeamName = isUserPossession ? opponentName : userTeamName;

    const currentTeamStats = isUserPossession ? userBoxStats : opponentBoxStats;
    const otherTeamStats = isUserPossession ? opponentBoxStats : userBoxStats;

    const currentTeamSpecs = isUserPossession ? allUserPlayers : allOpponentPlayers;
    const otherTeamSpecs = isUserPossession ? allOpponentPlayers : allUserPlayers;

    // Pick active shooter & defender
    const shooterIndex = pickActivePlayerIndexExcludingOut(currentTeamStats, currentTeamSpecs);
    const shooter = currentTeamStats[shooterIndex];
    const shooterSpec = currentTeamSpecs[shooterIndex];

    const defenderIndex = pickActivePlayerIndexExcludingOut(otherTeamStats, otherTeamSpecs);
    const defender = otherTeamStats[defenderIndex];
    const defenderSpec = otherTeamSpecs[defenderIndex];

    if (!shooterSpec || !defenderSpec) continue;

    // Apply Fatigue and Injury Status check
    const shooterStamina = playerFatigueMap[shooterSpec.id] !== undefined ? playerFatigueMap[shooterSpec.id] : 100;
    const isShooterFatigued = shooterStamina < 40;
    const isShooterSeverelyFatigued = shooterStamina < 20;

    // Base skill calculation
    let baseRating = shooterSpec.overallRating || 75;
    if (isShooterFatigued) {
      baseRating -= 10; // -10 OVR fatigue penalty
    }

    // Determine Archetype
    const archetype = determineArchetype(shooterSpec.name, shooterSpec.position);

    const eventRoll = Math.random();

    // 2. CHECK FOR RANDOM TECHNICAL FOULS & IMMEDIATE EJECTIONS (0.6% chance)
    if (Math.random() < 0.006) {
      const isOffenderUser = Math.random() > 0.5;
      const offenderStats = isOffenderUser ? userBoxStats : opponentBoxStats;
      const offenderSpecs = isOffenderUser ? allUserPlayers : allOpponentPlayers;
      const offenderIndex = pickActivePlayerIndexExcludingOut(offenderStats, offenderSpecs);
      const offender = offenderStats[offenderIndex];
      const offenderSpec = offenderSpecs[offenderIndex];

      const techCount = (playerTechnicalsMap[offender.name] || 0) + 1;
      playerTechnicalsMap[offender.name] = techCount;

      let techMsg = `📢 TECHNICAL FOUL! ${offender.name} violently disputes a block/charge whistle, roaring at the referee's face!`;
      
      // 2 techs or Flagrant 2 ejection
      if (techCount >= 2 || Math.random() < 0.15) {
        playerEjectedSet.add(offender.name);
        techMsg += ` 🟥 EJECTION! Referee waves their arms and commands ${offender.name} to head to the locker room immediately!`;
      }

      // Push technical foul call first
      playByPlay.push({
        quarter: currentQuarter,
        timeRemaining: timeStr,
        description: techMsg,
        score: `${userScore} - ${opponentScore}`,
        type: "foul",
        playerName: offender.name
      });

      const freeThrowShooters = isOffenderUser ? opponentBoxStats : userBoxStats;
      const freeThrowSpecs = isOffenderUser ? allOpponentPlayers : allUserPlayers;
      const ftShooterIdx = pickActivePlayerIndexExcludingOut(freeThrowShooters, freeThrowSpecs);
      const ftShooter = freeThrowShooters[ftShooterIdx];
      const ftShooterSpec = freeThrowSpecs[ftShooterIdx];

      const ftProb = (ftShooterSpec?.fgPercent || 78) / 100;
      const ftSuccess = Math.random() < ftProb;

      let ftMsg = "";
      if (ftSuccess) {
        ftShooter.points += 1;
        if (isOffenderUser) opponentScore += 1;
        else userScore += 1;
        ftMsg = `🎯 Technical Shootout: ${ftShooter.name} walks to the line and coolly sinks the technical throw! (+1 point)`;
      } else {
        ftMsg = `❌ Technical Shootout: ${ftShooter.name} misses the free throw off the side of the iron!`;
      }

      playByPlay.push({
        quarter: currentQuarter,
        timeRemaining: timeStr,
        description: ftMsg,
        score: `${userScore} - ${opponentScore}`,
        type: ftSuccess ? "score" : "miss",
        playerName: ftShooter.name
      });

      continue;
    }

    // 3. SHOT CLOCK INTERACTIVE READS
    const shotClockRemaining = randBetween(1, 24);
    const isWindingDown = shotClockRemaining < 5;
    
    // LATE-GAME INTENTIONAL FOUL STRATEGY (Trailing team fouls leading team to stop clock in close games)
    const isIntentionalFoulNeeded = isLateGameClose && (
      (isUserPossession && opponentScore < userScore) || // User has ball, CPU is trailing and fouls User
      (!isUserPossession && userScore < opponentScore)   // CPU has ball, User is trailing and fouls CPU
    );
    if (isIntentionalFoulNeeded) {
      if (isUserPossession) {
        opponentTeamFouls += 1;
      } else {
        userTeamFouls += 1;
      }
      const previousFouls = playerFoulsMap[defender.name] || 0;
      const totalFouls = previousFouls + 1;
      playerFoulsMap[defender.name] = totalFouls;

      let phrase = `🚨 Late game strategy! ${defender.name} intentionally wraps up ${shooter.name} to freeze the physical clock! (Foul #${totalFouls} for ${defender.name})`;
      
      if (totalFouls >= 6) {
        playerFouledOutSet.add(defender.name);
        phrase += ` ⚠️ FOULED OUT! ${defender.name} is directed to the bench with 6 fouls.`;
      }

      // Push foul call first
      playByPlay.push({
        quarter: currentQuarter,
        timeRemaining: timeStr,
        description: phrase,
        score: `${userScore} - ${opponentScore}`,
        type: "foul",
        playerName: shooter.name
      });

      // Award free throws since it is late game stop - 1 by 1!
      const ftPct = (shooterSpec.fgPercent || 78) / 100;
      for (let s = 1; s <= 2; s++) {
        const ftSuccess = Math.random() < ftPct;
        let ftMsg = "";
        if (ftSuccess) {
          shooter.points += 1;
          if (isUserPossession) {
            userScore += 1;
          } else {
            opponentScore += 1;
          }
          ftMsg = `🎯 Pressure Free Throw (${s}/2): ${shooter.name} steps up under immense pressure and sinks the clutch free throw! (+1 point)`;
        } else {
          ftMsg = `❌ Pressure Free Throw (${s}/2): ${shooter.name}'s shot rattles off the iron and misses!`;
        }

        playByPlay.push({
          quarter: currentQuarter,
          timeRemaining: timeStr,
          description: ftMsg,
          score: `${userScore} - ${opponentScore}`,
          type: ftSuccess ? "score" : "miss",
          playerName: shooter.name
        });
      }

      continue;
    }

    // 1. Determine shot category based on archetype weight lists and player ratings
    let shotCategory: "3PT" | "Mid" | "Paint" | "Post" = "Mid";
    const rollStyle = Math.random() * 100;

    if (archetype === "3PT Specialist") {
      if (rollStyle < 50) shotCategory = "3PT";
      else if (rollStyle < 75) shotCategory = "Mid";
      else if (rollStyle < 90) shotCategory = "Paint";
      else shotCategory = "Post";
    } else if (archetype === "Post Scorer") {
      if (rollStyle < 10) shotCategory = "3PT";
      else if (rollStyle < 30) shotCategory = "Mid";
      else if (rollStyle < 50) shotCategory = "Paint";
      else shotCategory = "Post";
    } else if (archetype === "Slasher") {
      if (rollStyle < 5) shotCategory = "3PT";
      else if (rollStyle < 20) shotCategory = "Mid";
      else if (rollStyle < 85) shotCategory = "Paint";
      else shotCategory = "Post";
    } else { // Balanced
      if (rollStyle < 25) shotCategory = "3PT";
      else if (rollStyle < 50) shotCategory = "Mid";
      else if (rollStyle < 75) shotCategory = "Paint";
      else shotCategory = "Post";
    }

    // 2. Fetch specific player attributes (0-99 scale)
    let specificRating = shooterSpec.overallRating || 75;
    if (shotCategory === "3PT") {
      specificRating = shooterSpec.threePointRating || (shooterSpec.overallRating - 5);
    } else if (shotCategory === "Mid") {
      specificRating = shooterSpec.midRangeRating || shooterSpec.overallRating;
    } else if (shotCategory === "Paint") {
      specificRating = shooterSpec.verticalRating || (shooterSpec.overallRating + 2);
    } else if (shotCategory === "Post") {
      specificRating = shooterSpec.strengthRating || (shooterSpec.overallRating - 2);
    }

    // Adjust for fatigue
    if (isShooterFatigued) {
      specificRating -= 10;
    }

    // Base scoring probability from shot specific rating
    let scoringProbability = specificRating / 160; // 0.38 - 0.62 range

    // 3. Defender Closeness and Clamped Event
    const defenderDefRating = (shotCategory === "3PT" || shotCategory === "Mid")
      ? (defenderSpec.perimeterRating || defenderSpec.overallRating || 75)
      : (defenderSpec.interiorRating || defenderSpec.overallRating || 75);

    const closenessRoll = Math.random() * 100;
    let isClamped = false;
    let closenessText = "moderate pressure";

    if (closenessRoll < (defenderDefRating * 0.45)) {
      // Clamped Event! Excellent defense forces a bad shot
      isClamped = true;
      scoringProbability -= 0.18; // Heavy penalty
      closenessText = "🔒 CLAMPED (smothering contest)";
    } else if (closenessRoll > 85) {
      // Wide open shot!
      scoringProbability += 0.15; // Huge boost
      closenessText = "Wide Open";
    } else {
      closenessText = "contested look";
    }

    // Shot winding down penalty
    if (isWindingDown) {
      scoringProbability -= 0.12; 
    }

    // Chemistry scaling (+0.5% stats per 10% chemistry -> max +5% modifier)
    const currentChemistryBonus = 1 + (isUserPossession ? userChemistry : opponentChemistry) / 2000;
    scoringProbability *= currentChemistryBonus;

    // Home court OVR assistance (+2 OVR -> approx +2% accuracy modifier)
    if (isUserPossession && isUserHome) scoringProbability += 0.02;
    if (!isUserPossession && !isUserHome) scoringProbability += 0.02;

    // Difficulty adjusters
    if (isUserPossession) {
      if (difficulty === "Easy") scoringProbability += 0.06;
      if (difficulty === "Hard") scoringProbability -= 0.04;
      if (difficulty === "Legend") scoringProbability -= 0.08;
    } else {
      if (difficulty === "Easy") scoringProbability -= 0.08;
      if (difficulty === "Hard") scoringProbability += 0.04;
      if (difficulty === "Legend") scoringProbability += 0.09;
    }

    // Clutch Multiplier: In First to 50/100, if score is within 3 points, Superstars get +10% boost to scoring
    const isClutchMatch = Math.abs(userScore - opponentScore) <= 3;
    const isSuperstar = (shooterSpec.overallRating || 75) >= 90;
    const isClutchTime = Math.abs(userScore - opponentScore) <= 6 && 
                         (userScore >= targetScore - 10 || opponentScore >= targetScore - 10);

    if (isClutchMatch && isSuperstar) {
      scoringProbability += 0.10;
    } else if (isClutchTime && isSuperstar) {
      scoringProbability += 0.08; // fallback standard clutch boost
    }

    // Constraint limits
    scoringProbability = Math.max(0.18, Math.min(0.85, scoringProbability));

    // 4. PROCESS EVENT: CORE POSSESSION (Made, Missed, Turnover, Foul)
    if (eventRoll < scoringProbability) {
      // MADE BASKET
      const isThreeShot = shotCategory === "3PT";
      const pointsScored = isThreeShot ? 3 : 2;

      shooter.points += pointsScored;
      shooter.fgm += 1;
      shooter.fga += 1;

      if (isUserPossession) {
        userScore += pointsScored;
      } else {
        opponentScore += pointsScored;
      }

      // Generate description based on style
      let desc = "";
      if (isClutchTime && isSuperstar && Math.random() < 0.6) {
        const clPhrase = clutchPlays[randBetween(0, clutchPlays.length - 1)];
        desc = clPhrase.replace("{player}", shooter.name);
      } else {
        if (isThreeShot) {
          desc = threePointPlays[randBetween(0, threePointPlays.length - 1)].replace("{player}", shooter.name);
        } else if (shotCategory === "Mid") {
          desc = midRangePlays[randBetween(0, midRangePlays.length - 1)].replace("{player}", shooter.name);
        } else if (shotCategory === "Paint") {
          // Extra spice for slashers doing poster dunks (8% chance)
          if (archetype === "Slasher" && Math.random() < 0.25) {
            desc = posterizingDunks[randBetween(0, posterizingDunks.length - 1)].replace("{player}", shooter.name);
          } else {
            desc = slasherPlays[randBetween(0, slasherPlays.length - 1)].replace("{player}", shooter.name);
          }
        } else {
          desc = postPlays[randBetween(0, postPlays.length - 1)].replace("{player}", shooter.name);
        }
      }

      desc += ` (+${pointsScored} points)`;

      // Winding down clock commentary tag
      if (isWindingDown) {
        desc = `⏰ Shot clock expiring! ` + desc;
      }

      // Assist selection (approx 60% of times)
      if (Math.random() < 0.60) {
        let passerIndex = randBetween(0, currentTeamStats.length - 1);
        if (passerIndex === shooterIndex) {
          passerIndex = (passerIndex + 1) % currentTeamStats.length;
        }
        const passer = currentTeamStats[passerIndex];
        passer.assists += 1;

        const astPhrase = customAssists[randBetween(0, customAssists.length - 1)].replace("{passer}", passer.name);
        desc += " " + astPhrase;
      }

      // Live CPU timeout response to user run
      if (isUserPossession && userScore > opponentScore + 12 && Math.random() < 0.12) {
        desc += ` 🗣️ Timeout CPU Coach! The ${opponentName} head coach calls a 30-second timeout to freeze the momentum!`;
      }

      playByPlay.push({
        quarter: currentQuarter,
        timeRemaining: timeStr,
        description: desc,
        score: `${userScore} - ${opponentScore}`,
        type: "score",
        playerName: shooter.name
      });

    } else if (eventRoll < 0.82) {
      // MISSED BASKET
      shooter.fga += 1;
      let desc = "";

      // check if blocked
      const isBlocked = Math.random() < (defenderSpec.overallRating / 270); // up to ~35% blocks matching defender specs
      if (isBlocked) {
        desc = blockPlays[randBetween(0, blockPlays.length - 1)].replace("{player}", defender.name);
      } else {
        desc = regularMisses[randBetween(0, regularMisses.length - 1)].replace("{player}", shooter.name);
      }

      // Rebounding: 15% offensive rebound average, 85% defensive rebound
      const isOffensiveBoard = Math.random() < 0.15;
      const isDefenseBoard = !isOffensiveBoard;
      
      if (isOffensiveBoard) {
        // Carry over possession for second chance
        overridePossession = isUserPossession ? "user" : "opponent";
      }

      const boardTeamStats = isDefenseBoard ? otherTeamStats : currentTeamStats;
      const boardTeamAllSpecs = isDefenseBoard ? otherTeamSpecs : currentTeamSpecs;
      const boardIndex = pickActivePlayerIndexExcludingOut(boardTeamStats, boardTeamAllSpecs);
      const boardGrabber = boardTeamStats[boardIndex];

      boardGrabber.rebounds += 1;

      const rebPhrase = isDefenseBoard 
        ? defensiveRebounds[randBetween(0, defensiveRebounds.length - 1)].replace("{player}", boardGrabber.name)
        : `⚡️ SECOND CHANCE! ` + offensiveRebounds[randBetween(0, offensiveRebounds.length - 1)].replace("{player}", boardGrabber.name);

      desc += " " + rebPhrase;

      playByPlay.push({
        quarter: currentQuarter,
        timeRemaining: timeStr,
        description: desc,
        score: `${userScore} - ${opponentScore}`,
        type: isDefenseBoard ? "rebound" : "miss",
        playerName: boardGrabber.name
      });

    } else if (eventRoll < 0.92) {
      // TURNOVER
      const desc = turnoverPlays[randBetween(0, turnoverPlays.length - 1)].replace("{player}", shooter.name);

      playByPlay.push({
        quarter: currentQuarter,
        timeRemaining: timeStr,
        description: desc,
        score: `${userScore} - ${opponentScore}`,
        type: "turnover",
        playerName: shooter.name
      });

    } else {
      // PERSONAL OR SHOOTING FOUL!
      if (isUserPossession) {
        opponentTeamFouls += 1;
      } else {
        userTeamFouls += 1;
      }

      const defenderFouls = playerFoulsMap[defender.name] || 0;
      const totalDefenderFouls = defenderFouls + 1;
      playerFoulsMap[defender.name] = totalDefenderFouls;

      const currentTeamFoulLimit = isUserPossession ? opponentTeamFouls : userTeamFouls;

      // Classify foul type
      const isFlagrantType = Math.random() < 0.04; // 4% chance of flagrant
      const isShootingFoul = Math.random() < 0.65; // shooting foul

      let foulDesc = "";
      if (isFlagrantType) {
        const isFlagrant2 = Math.random() > 0.6; // major flagrant
        if (isFlagrant2) {
          playerEjectedSet.add(defender.name);
          foulDesc = `🚨 FLAGRANT FOUL 2! ${defender.name} winds up and clobbers ${shooter.name} in mid-air! Immediate EJECTION signaled by officials!`;
          
          // Trigger Injury Potential!
          if (injuriesEnabled && !gameInjuriesMap[shooterSpec.name]) {
            const injuredProb = isShooterSeverelyFatigued ? 0.75 : 0.35; // high risk on severe fatigue
            if (Math.random() < injuredProb) {
              const rolls = Math.random();
              const injuryDetails: { type: "Minor" | "Moderate" | "Major"; games: number } = 
                rolls < 0.5 ? { type: "Minor", games: 1 } :
                rolls < 0.9 ? { type: "Moderate", games: randBetween(3, 5) } :
                { type: "Major", games: 10 };

              gameInjuriesMap[shooterSpec.name] = injuryDetails;
              foulDesc += ` \n💥 INJURY REPORT: ${shooterSpec.name} hit the deck hard and is gripping their knee. Team doctors confirm a ${injuryDetails.type} injury (Out for ${injuryDetails.games} matches)!`;
            }
          }
        } else {
          foulDesc = `⚠️ FLAGRANT FOUL 1! ${defender.name} hits ${shooter.name} on the neck during a physical block attempt. Review confirms unnecessary contact!`;
        }
      } else {
        const foulNames = ["shooting", "personal", "offensive", "loose ball"];
        const chosenFoul = foulNames[randBetween(0, foulNames.length - 1)];
        foulDesc = `Whistle! A ${chosenFoul} foul is committed by ${defender.name} on ${shooter.name}. (Foul #${totalDefenderFouls} for ${defender.name})`;
      }

      // Fouling Out trigger
      if (totalDefenderFouls >= 6) {
        playerFouledOutSet.add(defender.name);
        foulDesc += ` \n⚠️ FOULED OUT! ${defender.name} has compiled 6 personal fouls and must depart the court!`;
      }

      // Process shoot free throws if shooting foul or penalty boundary (limit >=5)
      const isDoubleBonus = currentTeamFoulLimit >= 10;
      const isInPenalty = currentTeamFoulLimit >= 5;

      const shootsFT = isShootingFoul || isInPenalty;

      playByPlay.push({
        quarter: currentQuarter,
        timeRemaining: timeStr,
        description: foulDesc + (shootsFT ? " (Free throws to follow)" : " (Possession retained. Inbounds pass inside the sidelines)"),
        score: `${userScore} - ${opponentScore}`,
        type: "foul",
        playerName: shooter.name
      });

      if (shootsFT) {
        const shotsCount = (isThreePointPlaysTag(foulDesc) || shotCategory === "3PT") ? 3 : 2;
        const penalText = isDoubleBonus ? "Double Bonus! " : (isInPenalty ? "Bonus! " : "Shooting foul! ");
        const ftPct = (shooterSpec.fgPercent || 78) / 100;

        for (let s = 1; s <= shotsCount; s++) {
          const ftSuccess = Math.random() < ftPct;
          let ftMsg = "";
          if (ftSuccess) {
            shooter.points += 1;
            if (isUserPossession) {
              userScore += 1;
            } else {
              opponentScore += 1;
            }
            ftMsg = `🎯 ${penalText}Free Throw (${s}/${shotsCount}): ${shooter.name} steps up to the charity stripe and swishes it! (+1 point)`;
          } else {
            ftMsg = `❌ ${penalText}Free Throw (${s}/${shotsCount}): ${shooter.name}'s shot clanks hard of the back iron and misses!`;
          }

          playByPlay.push({
            quarter: currentQuarter,
            timeRemaining: timeStr,
            description: ftMsg,
            score: `${userScore} - ${opponentScore}`,
            type: ftSuccess ? "score" : "miss",
            playerName: shooter.name
          });
        }
      }
    }
  }

  // Helper inside FT
  function isThreePointPlaysTag(desc: string): boolean {
    return desc.includes("three") || desc.includes("deep") || desc.includes("downtown");
  }

  // Calculate physical FG percent across rosters
  const computePercentages = (list: PlayerBoxScore[]) => {
    list.forEach(p => {
      p.fgPercent = p.fga > 0 ? Math.round((p.fgm / p.fga) * 100) : 0;
    });
  };
  computePercentages(userBoxStats);
  computePercentages(opponentBoxStats);

  // Pick Game MVP (standard metric system points + assists + rebounds)
  const calcRating = (p: PlayerBoxScore) => p.points + 0.5 * p.fgm - 0.7 * p.fga + 0.5 * p.rebounds + 0.8 * p.assists;

  let mvp = userBoxStats[0];
  let highestScorer = userBoxStats[0];
  let assistLeader = userBoxStats[0];

  const updateTrophies = (p: PlayerBoxScore) => {
    if (p.points > highestScorer.points) highestScorer = p;
    if (p.assists > assistLeader.assists) assistLeader = p;
    if (calcRating(p) > calcRating(mvp)) mvp = p;
  };

  userBoxStats.forEach(updateTrophies);
  opponentBoxStats.forEach(updateTrophies);

  // Append Game buzzer
  playByPlay.push({
    quarter: currentQuarter,
    timeRemaining: "0:00",
    description: `🚨 BUZZZZ! The final buzzer sounds! The matchup is official. Final Score: ${userTeamName} ${userScore} - ${opponentName} ${opponentScore}. Match MVP: ${mvp.name}!`,
    score: `${userScore} - ${opponentScore}`,
    type: "neutral"
  });

  return {
    id: `game_${Date.now()}_${randBetween(10, 99)}`,
    userId,
    userTeamName,
    opponentName,
    opponentId: "cpu",
    opponentTeamName: opponentName,
    userScore,
    opponentScore,
    mvp,
    highestScorer,
    assistLeader,
    playerStats: userBoxStats,
    opponentStats: opponentBoxStats,
    playByPlay,
    date: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    // Custom return extension for hyper-realism:
    gameInjuriesOccurred: Object.entries(gameInjuriesMap).map(([pName, injury]) => ({
      name: pName,
      type: injury.type,
      games: injury.games
    }))
  };
}
