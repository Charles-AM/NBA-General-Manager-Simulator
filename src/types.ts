export interface Player {
  id: string; // original player template slug or unique id
  name: string;
  era: string; // "1980s" | "1990s" | "2000s" | "2010s" | "Current"
  team: string; // NBA team abbreviation
  position: string; // "Point Guard" | "Shooting Guard" | "Small Forward" | "Power Forward" | "Center" | "Guard" | "Forward" etc.
  ppg: number;
  apg: number;
  rpg: number;
  fgPercent: number; // e.g. 52 for 52%
  isActive?: boolean;
  citations?: string[];
  overallRating: number; // Overall Rating between 60 - 99
  tier: "Bronze" | "Silver" | "Gold" | "Legendary";
  
  // Realism extension fields
  stamina?: number; // 0 - 100, default 100
  injuryRemainingGames?: number; // >0 means injured for X games
  injuryType?: "Minor" | "Moderate" | "Major" | null;
  age?: number; // Calculated/randomized for progression

  // Detailed Player Attributes (0-99 scale)
  threePointRating?: number;
  midRangeRating?: number;
  freeThrowRating?: number;
  passRating?: number;
  ballHandleRating?: number;
  perimeterRating?: number;
  interiorRating?: number;
  stealRating?: number;
  blockRating?: number;
  speedRating?: number;
  strengthRating?: number;
  verticalRating?: number;
}

export interface CareerChallenge {
  id: string;
  title: string;
  description: string;
  targetType: "points" | "win_by" | "assists" | "opp_score" | "three_pointers";
  targetValue: number;
  rewardCoins: number;
  completed: boolean;
}

export interface CareerSave {
  id: string; // e.g. "save_1", "save_2", "save_3"
  userId: string;
  saveName: string;
  coins: number;
  hasClaimedStarterPack: boolean;
  wins: number;
  losses: number;
  totalMargin: number;
  division: number; // 0 = Rookie, 1 = Pro, 2 = All-Star, 3 = Superstar, 4 = Legend, 5 = GOAT
  seasonNumber: number; // e.g. Season 1
  seasonWins: number;
  seasonLosses: number;
  seasonGamesPlayed: number; // 0 to 12
  seasonRecord?: string;
  currentSeasonGames?: ("W" | "L")[];
  teamName: string;
  starters: Player[];
  bench: Player[];
  userCards: UserCard[];
  lastFiveGames: ("W" | "L")[];
  winStreak: number;
  unlockedAchievements: string[]; // List of unique achievement IDs
  challenges: CareerChallenge[];
  injuriesEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserCard extends Player {
  cardId: string; // Unique acquired card instance ID
  userId: string;
  dateAcquired: string;
}

export interface PlayerBoxScore {
  name: string;
  position: string;
  points: number;
  assists: number;
  rebounds: number;
  fgm: number;
  fga: number;
  fgPercent: number;
}

export interface PlayByPlayLog {
  quarter: number;
  timeRemaining: string; // e.g. "10:45"
  description: string;
  score: string;
  type: "score" | "rebound" | "assist" | "turnover" | "foul" | "miss" | "neutral";
  playerName?: string;
}

export interface GameResult {
  id: string;
  userId: string;
  opponentId: string; // "friend_uid" or "cpu"
  opponentName: string; // Friend's name or Machine level name
  userTeamName: string;
  opponentTeamName: string;
  userScore: number;
  opponentScore: number;
  mvp: PlayerBoxScore;
  mvpName?: string;
  mvpStats?: any;
  highestScorer: PlayerBoxScore;
  assistLeader: PlayerBoxScore;
  playerStats: PlayerBoxScore[]; // User Team box scores
  opponentStats: PlayerBoxScore[]; // Opponent Team box scores
  playByPlay: PlayByPlayLog[];
  date: string; // ISO date string
  createdAt: string;
  gameInjuriesOccurred?: any[];
  gameMode?: string;
  difficulty?: string;
  userWin?: boolean;
  mvpPoints?: number;
}

export interface SavedTeam {
  id: string;
  userId: string;
  name: string;
  starters: Player[];
  bench: Player[];
  chemistryRating: number;
  createdAt: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  username: string;
  themePreference: "dark" | "light";
  coins: number;
  packsCount: number;
  hasClaimedStarterPack: boolean;
  wins: number;
  losses: number;
  totalMargin: number;
  teamName: string;
  starters: Player[];
  bench: Player[];
  updatedAt?: string;
}

export interface FriendMatchup {
  id: string; // Composite key: currentUid_opponentUid
  userId: string;
  opponentId: string;
  userWins: number;
  opponentWins: number;
  lastPlayed: string;
}

export interface GlobalStats {
  userId: string;
  username: string;
  careerPoints: number;
  careerAssists: number;
  careerRebounds: number;
  highestScore: number;
  highestAssists: number;
  winPercentage: number;
  gamesPlayed: number;
}

export interface PrivateChallenge {
  id: string;
  challengerId: string;
  challengerName: string;
  challengerTeam: SavedTeam | {
    name: string;
    starters: Player[];
    bench: Player[];
    chemistryRating: number;
  };
  opponentId: string; // Direct opponent UID or "any"
  opponentName?: string;
  opponentTeam?: {
    name: string;
    starters: Player[];
    bench: Player[];
    chemistryRating: number;
  } | null;
  status: "pending" | "accepted" | "declined" | "completed";
  userScore?: number;
  opponentScore?: number;
  winnerId?: string;
  createdAt: string;
  acceptedAt?: string;
}
