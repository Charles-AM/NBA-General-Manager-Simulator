import { Player } from "./types";

export interface PoolPlayer extends Player {
  difficulty: "easy" | "medium" | "hard";
}

const RAW_PRELOADED_PLAYERS = [
  // ================= CURRENT NBA SUPERSTARS (2025-2026) =================
  {
    id: "lebron-james",
    name: "LeBron James",
    era: "Current",
    team: "LAL",
    position: "Small Forward",
    ppg: 27.2,
    apg: 7.4,
    rpg: 7.5,
    fgPercent: 50,
    tier: "Legendary",
    overallRating: 97,
    isActive: true
  },
  {
    id: "stephen-curry",
    name: "Stephen Curry",
    era: "Current",
    team: "GSW",
    position: "Point Guard",
    ppg: 24.8,
    apg: 6.4,
    rpg: 4.7,
    fgPercent: 47,
    tier: "Legendary",
    overallRating: 96,
    isActive: true
  },
  {
    id: "kevin-durant",
    name: "Kevin Durant",
    era: "Current",
    team: "PHX",
    position: "Small Forward",
    ppg: 27.3,
    apg: 4.4,
    rpg: 7.0,
    fgPercent: 50,
    tier: "Legendary",
    overallRating: 96,
    isActive: true
  },
  {
    id: "giannis-antetokounmpo",
    name: "Giannis Antetokounmpo",
    era: "Current",
    team: "MIL",
    position: "Power Forward",
    ppg: 31.0,
    apg: 6.2,
    rpg: 12.3,
    fgPercent: 61,
    tier: "Legendary",
    overallRating: 97,
    isActive: true
  },
  {
    id: "luka-doncic",
    name: "Luka Dončić",
    era: "Current",
    team: "DAL",
    position: "Point Guard",
    ppg: 28.5,
    apg: 9.2,
    rpg: 8.1,
    fgPercent: 48,
    tier: "Legendary",
    overallRating: 96,
    isActive: true
  },
  {
    id: "nikola-jokic",
    name: "Nikola Jokić",
    era: "Current",
    team: "DEN",
    position: "Center",
    ppg: 29.7,
    apg: 10.3,
    rpg: 13.7,
    fgPercent: 58,
    tier: "Legendary",
    overallRating: 98,
    isActive: true
  },
  {
    id: "joel-embiid",
    name: "Joel Embiid",
    era: "Current",
    team: "PHI",
    position: "Center",
    ppg: 33.0,
    apg: 4.2,
    rpg: 10.2,
    fgPercent: 51,
    tier: "Legendary",
    overallRating: 96,
    isActive: true
  },
  {
    id: "shai-gilgeous-alexander",
    name: "Shai Gilgeous-Alexander",
    era: "Current",
    team: "OKC",
    position: "Point Guard",
    ppg: 30.1,
    apg: 6.4,
    rpg: 5.5,
    fgPercent: 53,
    tier: "Legendary",
    overallRating: 95,
    isActive: true
  },
  {
    id: "jayson-tatum",
    name: "Jayson Tatum",
    era: "Current",
    team: "BOS",
    position: "Small Forward",
    ppg: 27.0,
    apg: 4.8,
    rpg: 8.2,
    fgPercent: 47,
    tier: "Gold",
    overallRating: 94,
    isActive: true
  },
  {
    id: "anthony-davis",
    name: "Anthony Davis",
    era: "Current",
    team: "LAL",
    position: "Power Forward",
    ppg: 24.0,
    apg: 2.5,
    rpg: 10.4,
    fgPercent: 53,
    tier: "Gold",
    overallRating: 94,
    isActive: true
  },
  {
    id: "victor-wembanyama",
    name: "Victor Wembanyama",
    era: "Current",
    team: "SAS",
    position: "Center",
    ppg: 21.4,
    apg: 3.9,
    rpg: 10.6,
    fgPercent: 46,
    tier: "Gold",
    overallRating: 93,
    isActive: true
  },
  {
    id: "anthony-edwards",
    name: "Anthony Edwards",
    era: "Current",
    team: "MIN",
    position: "Shooting Guard",
    ppg: 25.9,
    apg: 5.1,
    rpg: 5.4,
    fgPercent: 46,
    tier: "Gold",
    overallRating: 93,
    isActive: true
  },
  {
    id: "tyrese-haliburton",
    name: "Tyrese Haliburton",
    era: "Current",
    team: "IND",
    position: "Point Guard",
    ppg: 20.1,
    apg: 10.9,
    rpg: 3.9,
    fgPercent: 48,
    tier: "Gold",
    overallRating: 91,
    isActive: true
  },
  {
    id: "donovan-mitchell",
    name: "Donovan Mitchell",
    era: "Current",
    team: "CLE",
    position: "Shooting Guard",
    ppg: 26.6,
    apg: 6.1,
    rpg: 5.1,
    fgPercent: 46,
    tier: "Gold",
    overallRating: 92,
    isActive: true
  },
  {
    id: "devin-booker",
    name: "Devin Booker",
    era: "Current",
    team: "PHX",
    position: "Shooting Guard",
    ppg: 27.1,
    apg: 6.9,
    rpg: 4.5,
    fgPercent: 48,
    tier: "Gold",
    overallRating: 92,
    isActive: true
  },
  {
    id: "ja-morant",
    name: "Ja Morant",
    era: "Current",
    team: "MEM",
    position: "Point Guard",
    ppg: 26.2,
    apg: 8.1,
    rpg: 5.9,
    fgPercent: 47,
    tier: "Gold",
    overallRating: 91,
    isActive: true
  },
  {
    id: "zion-williamson",
    name: "Zion Williamson",
    era: "Current",
    team: "NOP",
    position: "Power Forward",
    ppg: 26.0,
    apg: 4.6,
    rpg: 7.0,
    fgPercent: 58,
    tier: "Gold",
    overallRating: 90,
    isActive: true
  },
  {
    id: "bam-adebayo",
    name: "Bam Adebayo",
    era: "Current",
    team: "MIA",
    position: "Center",
    ppg: 19.3,
    apg: 3.9,
    rpg: 10.4,
    fgPercent: 52,
    tier: "Gold",
    overallRating: 89,
    isActive: true
  },
  {
    id: "paolo-banchero",
    name: "Paolo Banchero",
    era: "Current",
    team: "ORL",
    position: "Power Forward",
    ppg: 22.6,
    apg: 5.4,
    rpg: 6.9,
    fgPercent: 45,
    tier: "Gold",
    overallRating: 89,
    isActive: true
  },
  {
    id: "chet-holmgren",
    name: "Chet Holmgren",
    era: "Current",
    team: "OKC",
    position: "Center",
    ppg: 16.5,
    apg: 2.4,
    rpg: 7.9,
    fgPercent: 53,
    tier: "Silver",
    overallRating: 88,
    isActive: true
  },

  // ================= LEGENDS - 2010s ERA =================
  {
    id: "kobe-bryant",
    name: "Kobe Bryant",
    era: "2010s",
    team: "LAL",
    position: "Shooting Guard",
    ppg: 27.0,
    apg: 4.6,
    rpg: 5.4,
    fgPercent: 45,
    tier: "Legendary",
    overallRating: 98,
    isActive: false
  },
  {
    id: "tim-duncan",
    name: "Tim Duncan",
    era: "2010s",
    team: "SAS",
    position: "Power Forward",
    ppg: 20.0,
    apg: 3.2,
    rpg: 11.5,
    fgPercent: 50,
    tier: "Legendary",
    overallRating: 97,
    isActive: false
  },
  {
    id: "dirk-nowitzki",
    name: "Dirk Nowitzki",
    era: "2010s",
    team: "DAL",
    position: "Power Forward",
    ppg: 25.0,
    apg: 2.5,
    rpg: 8.0,
    fgPercent: 47,
    tier: "Legendary",
    overallRating: 96,
    isActive: false
  },
  {
    id: "dwyane-wade",
    name: "Dwyane Wade",
    era: "2010s",
    team: "MIA",
    position: "Shooting Guard",
    ppg: 26.0,
    apg: 6.0,
    rpg: 5.0,
    fgPercent: 48,
    tier: "Legendary",
    overallRating: 95,
    isActive: false
  },
  {
    id: "kevin-garnett",
    name: "Kevin Garnett",
    era: "2010s",
    team: "BOS",
    position: "Power Forward",
    ppg: 20.0,
    apg: 4.0,
    rpg: 11.0,
    fgPercent: 50,
    tier: "Legendary",
    overallRating: 96,
    isActive: false
  },
  {
    id: "chris-paul",
    name: "Chris Paul",
    era: "2010s",
    team: "LAC",
    position: "Point Guard",
    ppg: 18.5,
    apg: 9.5,
    rpg: 4.2,
    fgPercent: 47,
    tier: "Gold",
    overallRating: 94,
    isActive: false
  },
  {
    id: "carmelo-anthony",
    name: "Carmelo Anthony",
    era: "2010s",
    team: "NYK",
    position: "Small Forward",
    ppg: 26.0,
    apg: 3.0,
    rpg: 7.0,
    fgPercent: 45,
    tier: "Gold",
    overallRating: 93,
    isActive: false
  },
  {
    id: "dwight-howard",
    name: "Dwight Howard",
    era: "2010s",
    team: "ORL",
    position: "Center",
    ppg: 20.0,
    apg: 1.5,
    rpg: 13.5,
    fgPercent: 57,
    tier: "Gold",
    overallRating: 92,
    isActive: false
  },
  {
    id: "derrick-rose",
    name: "Derrick Rose",
    era: "2010s",
    team: "CHI",
    position: "Point Guard",
    ppg: 25.0,
    apg: 7.7,
    rpg: 4.1,
    fgPercent: 45,
    tier: "Legendary",
    overallRating: 95,
    isActive: false
  },
  {
    id: "russell-westbrook",
    name: "Russell Westbrook",
    era: "2010s",
    team: "OKC",
    position: "Point Guard",
    ppg: 27.0,
    apg: 10.0,
    rpg: 8.0,
    fgPercent: 44,
    tier: "Legendary",
    overallRating: 95,
    isActive: false
  },
  {
    id: "james-harden",
    name: "James Harden",
    era: "2010s",
    team: "HOU",
    position: "Shooting Guard",
    ppg: 29.0,
    apg: 8.0,
    rpg: 6.0,
    fgPercent: 44,
    tier: "Legendary",
    overallRating: 96,
    isActive: false
  },
  {
    id: "kawhi-leonard",
    name: "Kawhi Leonard",
    era: "2010s",
    team: "SAS",
    position: "Small Forward",
    ppg: 25.5,
    apg: 3.5,
    rpg: 6.5,
    fgPercent: 49,
    tier: "Legendary",
    overallRating: 95,
    isActive: false
  },
  {
    id: "paul-george",
    name: "Paul George",
    era: "2010s",
    team: "IND",
    position: "Small Forward",
    ppg: 23.0,
    apg: 3.5,
    rpg: 6.5,
    fgPercent: 44,
    tier: "Gold",
    overallRating: 92,
    isActive: false
  },
  {
    id: "damian-lillard",
    name: "Damian Lillard",
    era: "2010s",
    team: "POR",
    position: "Point Guard",
    ppg: 26.0,
    apg: 6.5,
    rpg: 4.2,
    fgPercent: 44,
    tier: "Gold",
    overallRating: 93,
    isActive: false
  },
  {
    id: "kyrie-irving",
    name: "Kyrie Irving",
    era: "2010s",
    team: "CLE",
    position: "Point Guard",
    ppg: 24.0,
    apg: 5.5,
    rpg: 3.8,
    fgPercent: 47,
    tier: "Gold",
    overallRating: 94,
    isActive: false
  },

  // ================= LEGENDS - 2000s ERA =================
  {
    id: "shaquille-oneal",
    name: "Shaquille O'Neal",
    era: "2000s",
    team: "LAL",
    position: "Center",
    ppg: 27.0,
    apg: 3.5,
    rpg: 11.5,
    fgPercent: 58,
    tier: "Legendary",
    overallRating: 99,
    isActive: false
  },
  {
    id: "allen-iverson",
    name: "Allen Iverson",
    era: "2000s",
    team: "PHI",
    position: "Shooting Guard",
    ppg: 27.5,
    apg: 6.0,
    rpg: 3.8,
    fgPercent: 42,
    tier: "Legendary",
    overallRating: 96,
    isActive: false
  },
  {
    id: "tracy-mcgrady",
    name: "Tracy McGrady",
    era: "2000s",
    team: "HOU",
    position: "Shooting Guard",
    ppg: 26.5,
    apg: 4.8,
    rpg: 6.0,
    fgPercent: 44,
    tier: "Legendary",
    overallRating: 95,
    isActive: false
  },
  {
    id: "vince-carter",
    name: "Vince Carter",
    era: "2000s",
    team: "TOR",
    position: "Shooting Guard",
    ppg: 24.5,
    apg: 4.0,
    rpg: 5.5,
    fgPercent: 45,
    tier: "Gold",
    overallRating: 94,
    isActive: false
  },
  {
    id: "jason-kidd",
    name: "Jason Kidd",
    era: "2000s",
    team: "NJN",
    position: "Point Guard",
    ppg: 14.5,
    apg: 9.0,
    rpg: 6.5,
    fgPercent: 41,
    tier: "Gold",
    overallRating: 94,
    isActive: false
  },
  {
    id: "steve-nash",
    name: "Steve Nash",
    era: "2000s",
    team: "PHX",
    position: "Point Guard",
    ppg: 16.5,
    apg: 10.5,
    rpg: 3.0,
    fgPercent: 49,
    tier: "Legendary",
    overallRating: 95,
    isActive: false
  },
  {
    id: "ray-allen",
    name: "Ray Allen",
    era: "2000s",
    team: "BOS",
    position: "Shooting Guard",
    ppg: 20.0,
    apg: 3.5,
    rpg: 4.0,
    fgPercent: 45,
    tier: "Gold",
    overallRating: 93,
    isActive: false
  },
  {
    id: "paul-pierce",
    name: "Paul Pierce",
    era: "2000s",
    team: "BOS",
    position: "Small Forward",
    ppg: 22.0,
    apg: 3.8,
    rpg: 6.0,
    fgPercent: 45,
    tier: "Gold",
    overallRating: 93,
    isActive: false
  },
  {
    id: "ben-wallace",
    name: "Ben Wallace",
    era: "2000s",
    team: "DET",
    position: "Center",
    ppg: 6.0,
    apg: 1.5,
    rpg: 12.0,
    fgPercent: 47,
    tier: "Gold",
    overallRating: 93,
    isActive: false
  },
  {
    id: "chauncey-billups",
    name: "Chauncey Billups",
    era: "2000s",
    team: "DET",
    position: "Point Guard",
    ppg: 18.0,
    apg: 6.0,
    rpg: 3.0,
    fgPercent: 42,
    tier: "Gold",
    overallRating: 92,
    isActive: false
  },

  // ================= LEGENDS - 1990s ERA =================
  {
    id: "michael-jordan",
    name: "Michael Jordan",
    era: "1990s",
    team: "CHI",
    position: "Shooting Guard",
    ppg: 31.5,
    apg: 5.5,
    rpg: 6.0,
    fgPercent: 50,
    tier: "Legendary",
    overallRating: 99,
    isActive: false
  },
  {
    id: "scottie-pippen",
    name: "Scottie Pippen",
    era: "1990s",
    team: "CHI",
    position: "Small Forward",
    ppg: 18.0,
    apg: 5.5,
    rpg: 6.5,
    fgPercent: 48,
    tier: "Legendary",
    overallRating: 95,
    isActive: false
  },
  {
    id: "dennis-rodman",
    name: "Dennis Rodman",
    era: "1990s",
    team: "CHI",
    position: "Power Forward",
    ppg: 6.5,
    apg: 2.0,
    rpg: 15.0,
    fgPercent: 47,
    tier: "Gold",
    overallRating: 93,
    isActive: false
  },
  {
    id: "hakeem-olajuwon",
    name: "Hakeem Olajuwon",
    era: "1990s",
    team: "HOU",
    position: "Center",
    ppg: 24.0,
    apg: 3.0,
    rpg: 11.5,
    fgPercent: 51,
    tier: "Legendary",
    overallRating: 98,
    isActive: false
  },
  {
    id: "charles-barkley",
    name: "Charles Barkley",
    era: "1990s",
    team: "PHX",
    position: "Power Forward",
    ppg: 23.0,
    apg: 4.0,
    rpg: 11.5,
    fgPercent: 54,
    tier: "Legendary",
    overallRating: 96,
    isActive: false
  },
  {
    id: "karl-malone",
    name: "Karl Malone",
    era: "1990s",
    team: "UTA",
    position: "Power Forward",
    ppg: 26.0,
    apg: 3.5,
    rpg: 10.0,
    fgPercent: 52,
    tier: "Legendary",
    overallRating: 96,
    isActive: false
  },
  {
    id: "john-stockton",
    name: "John Stockton",
    era: "1990s",
    team: "UTA",
    position: "Point Guard",
    ppg: 14.0,
    apg: 11.5,
    rpg: 2.8,
    fgPercent: 51,
    tier: "Legendary",
    overallRating: 95,
    isActive: false
  },
  {
    id: "david-robinson",
    name: "David Robinson",
    era: "1990s",
    team: "SAS",
    position: "Center",
    ppg: 24.0,
    apg: 3.0,
    rpg: 11.0,
    fgPercent: 52,
    tier: "Legendary",
    overallRating: 96,
    isActive: false
  },
  {
    id: "patrick-ewing",
    name: "Patrick Ewing",
    era: "1990s",
    team: "NYK",
    position: "Center",
    ppg: 23.0,
    apg: 2.0,
    rpg: 10.5,
    fgPercent: 50,
    tier: "Legendary",
    overallRating: 95,
    isActive: false
  },
  {
    id: "reggie-miller",
    name: "Reggie Miller",
    era: "1990s",
    team: "IND",
    position: "Shooting Guard",
    ppg: 19.5,
    apg: 3.0,
    rpg: 3.0,
    fgPercent: 47,
    tier: "Gold",
    overallRating: 94,
    isActive: false
  },
  {
    id: "gary-payton",
    name: "Gary Payton",
    era: "1990s",
    team: "SEA",
    position: "Point Guard",
    ppg: 18.0,
    apg: 7.0,
    rpg: 4.0,
    fgPercent: 47,
    tier: "Gold",
    overallRating: 94,
    isActive: false
  },
  {
    id: "clyde-drexler",
    name: "Clyde Drexler",
    era: "1990s",
    team: "POR",
    position: "Shooting Guard",
    ppg: 22.0,
    apg: 5.5,
    rpg: 6.0,
    fgPercent: 47,
    tier: "Gold",
    overallRating: 94,
    isActive: false
  },

  // ================= LEGENDS - 1980s ERA =================
  {
    id: "magic-johnson",
    name: "Magic Johnson",
    era: "1980s",
    team: "LAL",
    position: "Point Guard",
    ppg: 19.5,
    apg: 11.2,
    rpg: 7.2,
    fgPercent: 52,
    tier: "Legendary",
    overallRating: 98,
    isActive: false
  },
  {
    id: "larry-bird",
    name: "Larry Bird",
    era: "1980s",
    team: "BOS",
    position: "Small Forward",
    ppg: 24.3,
    apg: 6.3,
    rpg: 10.0,
    fgPercent: 49,
    tier: "Legendary",
    overallRating: 98,
    isActive: false
  },
  {
    id: "kareem-abdul-jabbar",
    name: "Kareem Abdul-Jabbar",
    era: "1980s",
    team: "LAL",
    position: "Center",
    ppg: 24.6,
    apg: 3.6,
    rpg: 11.2,
    fgPercent: 56,
    tier: "Legendary",
    overallRating: 98,
    isActive: false
  },
  {
    id: "isiah-thomas",
    name: "Isiah Thomas",
    era: "1980s",
    team: "DET",
    position: "Point Guard",
    ppg: 19.2,
    apg: 9.3,
    rpg: 3.6,
    fgPercent: 45,
    tier: "Legendary",
    overallRating: 95,
    isActive: false
  },
  {
    id: "julius-erving",
    name: "Julius Erving",
    era: "1980s",
    team: "PHI",
    position: "Small Forward",
    ppg: 22.0,
    apg: 4.0,
    rpg: 6.7,
    fgPercent: 50,
    tier: "Legendary",
    overallRating: 96,
    isActive: false
  },
  {
    id: "moses-malone",
    name: "Moses Malone",
    era: "1980s",
    team: "PHI",
    position: "Center",
    ppg: 21.0,
    apg: 1.5,
    rpg: 12.5,
    fgPercent: 49,
    tier: "Legendary",
    overallRating: 95,
    isActive: false
  },

  // ================= DYNAMIC COLLECTION ASSETS & CONTEMPORARY STARTERS/ROLE SQUAD =================
  {
    id: "jalen-brunson",
    name: "Jalen Brunson",
    era: "Current",
    team: "NYK",
    position: "Point Guard",
    ppg: 28.7,
    apg: 6.7,
    rpg: 3.6,
    fgPercent: 48,
    tier: "Gold",
    overallRating: 93,
    isActive: true
  },
  {
    id: "de-aaron-fox",
    name: "De'Aaron Fox",
    era: "Current",
    team: "SAC",
    position: "Point Guard",
    ppg: 26.6,
    apg: 5.6,
    rpg: 4.6,
    fgPercent: 47,
    tier: "Gold",
    overallRating: 90,
    isActive: true
  },
  {
    id: "domantas-sabonis",
    name: "Domantas Sabonis",
    era: "Current",
    team: "SAC",
    position: "Center",
    ppg: 19.4,
    apg: 8.2,
    rpg: 13.7,
    fgPercent: 59,
    tier: "Gold",
    overallRating: 88,
    isActive: true
  },
  {
    id: "tyrese-maxey",
    name: "Tyrese Maxey",
    era: "Current",
    team: "PHI",
    position: "Point Guard",
    ppg: 25.9,
    apg: 6.2,
    rpg: 3.7,
    fgPercent: 45,
    tier: "Gold",
    overallRating: 89,
    isActive: true
  },
  {
    id: "jaylen-brown",
    name: "Jaylen Brown",
    era: "Current",
    team: "BOS",
    position: "Shooting Guard",
    ppg: 23.0,
    apg: 3.6,
    rpg: 5.5,
    fgPercent: 50,
    tier: "Gold",
    overallRating: 92,
    isActive: true
  },
  {
    id: "jamal-murray",
    name: "Jamal Murray",
    era: "Current",
    team: "DEN",
    position: "Point Guard",
    ppg: 21.2,
    apg: 6.5,
    rpg: 4.1,
    fgPercent: 46,
    tier: "Gold",
    overallRating: 88,
    isActive: true
  },
  {
    id: "jrue-holiday",
    name: "Jrue Holiday",
    era: "Current",
    team: "BOS",
    position: "Point Guard",
    ppg: 12.8,
    apg: 4.8,
    rpg: 5.4,
    fgPercent: 48,
    tier: "Gold",
    overallRating: 87,
    isActive: true
  },
  {
    id: "derrick-white",
    name: "Derrick White",
    era: "Current",
    team: "BOS",
    position: "Point Guard",
    ppg: 15.2,
    apg: 5.2,
    rpg: 4.2,
    fgPercent: 46,
    tier: "Silver",
    overallRating: 85,
    isActive: true
  },
  {
    id: "kristaps-porzingis",
    name: "Kristaps Porzingis",
    era: "Current",
    team: "BOS",
    position: "Power Forward",
    ppg: 20.1,
    apg: 2.0,
    rpg: 7.2,
    fgPercent: 51,
    tier: "Gold",
    overallRating: 88,
    isActive: true
  },
  {
    id: "rudy-gobert",
    name: "Rudy Gobert",
    era: "Current",
    team: "MIN",
    position: "Center",
    ppg: 14.0,
    apg: 1.3,
    rpg: 12.9,
    fgPercent: 65,
    tier: "Gold",
    overallRating: 87,
    isActive: true
  },
  {
    id: "karl-anthony-towns",
    name: "Karl-Anthony Towns",
    era: "Current",
    team: "NYK",
    position: "Center",
    ppg: 21.8,
    apg: 3.0,
    rpg: 8.3,
    fgPercent: 50,
    tier: "Gold",
    overallRating: 88,
    isActive: true
  },
  {
    id: "bradley-beal",
    name: "Bradley Beal",
    era: "Current",
    team: "PHX",
    position: "Shooting Guard",
    ppg: 18.2,
    apg: 5.0,
    rpg: 4.4,
    fgPercent: 51,
    tier: "Silver",
    overallRating: 85,
    isActive: true
  },
  {
    id: "brandon-ingram",
    name: "Brandon Ingram",
    era: "Current",
    team: "NOP",
    position: "Small Forward",
    ppg: 20.8,
    apg: 5.7,
    rpg: 5.1,
    fgPercent: 49,
    tier: "Silver",
    overallRating: 86,
    isActive: true
  },
  {
    id: "mikal-bridges",
    name: "Mikal Bridges",
    era: "Current",
    team: "NYK",
    position: "Small Forward",
    ppg: 19.6,
    apg: 3.6,
    rpg: 4.5,
    fgPercent: 44,
    tier: "Silver",
    overallRating: 86,
    isActive: true
  },
  {
    id: "marcus-smart",
    name: "Marcus Smart",
    era: "Current",
    team: "MEM",
    position: "Point Guard",
    ppg: 11.5,
    apg: 5.0,
    rpg: 3.5,
    fgPercent: 41,
    tier: "Silver",
    overallRating: 82,
    isActive: true
  },
  {
    id: "alex-caruso",
    name: "Alex Caruso",
    era: "Current",
    team: "OKC",
    position: "Point Guard",
    ppg: 10.1,
    apg: 3.5,
    rpg: 3.8,
    fgPercent: 46,
    tier: "Silver",
    overallRating: 81,
    isActive: true
  },
  {
    id: "josh-hart",
    name: "Josh Hart",
    era: "Current",
    team: "NYK",
    position: "Small Forward",
    ppg: 9.4,
    apg: 4.1,
    rpg: 8.3,
    fgPercent: 43,
    tier: "Silver",
    overallRating: 84,
    isActive: true
  },
  {
    id: "donte-divincenzo",
    name: "Donte DiVincenzo",
    era: "Current",
    team: "MIN",
    position: "Shooting Guard",
    ppg: 15.5,
    apg: 2.6,
    rpg: 3.7,
    fgPercent: 44,
    tier: "Silver",
    overallRating: 81,
    isActive: true
  },
  {
    id: "bruce-brown",
    name: "Bruce Brown",
    era: "Current",
    team: "TOR",
    position: "Shooting Guard",
    ppg: 10.8,
    apg: 2.7,
    rpg: 4.2,
    fgPercent: 47,
    tier: "Silver",
    overallRating: 80,
    isActive: true
  },
  {
    id: "austin-reaves",
    name: "Austin Reaves",
    era: "Current",
    team: "LAL",
    position: "Shooting Guard",
    ppg: 15.9,
    apg: 5.5,
    rpg: 4.3,
    fgPercent: 48,
    tier: "Silver",
    overallRating: 83,
    isActive: true
  },
  {
    id: "naz-reid",
    name: "Naz Reid",
    era: "Current",
    team: "MIN",
    position: "Center",
    ppg: 13.5,
    apg: 1.3,
    rpg: 5.2,
    fgPercent: 47,
    tier: "Silver",
    overallRating: 84,
    isActive: true
  },
  {
    id: "bobby-portis",
    name: "Bobby Portis",
    era: "Current",
    team: "MIL",
    position: "Power Forward",
    ppg: 13.8,
    apg: 1.3,
    rpg: 7.4,
    fgPercent: 50,
    tier: "Silver",
    overallRating: 81,
    isActive: true
  },
  {
    id: "grayson-allen",
    name: "Grayson Allen",
    era: "Current",
    team: "PHX",
    position: "Shooting Guard",
    ppg: 13.5,
    apg: 3.0,
    rpg: 3.9,
    fgPercent: 50,
    tier: "Bronze",
    overallRating: 78,
    isActive: true
  },
  {
    id: "al-horford",
    name: "Al Horford",
    era: "Current",
    team: "BOS",
    position: "Center",
    ppg: 8.6,
    apg: 2.6,
    rpg: 6.4,
    fgPercent: 51,
    tier: "Silver",
    overallRating: 82,
    isActive: true
  },
  {
    id: "malik-monk",
    name: "Malik Monk",
    era: "Current",
    team: "SAC",
    position: "Shooting Guard",
    ppg: 15.4,
    apg: 5.1,
    rpg: 2.9,
    fgPercent: 44,
    tier: "Silver",
    overallRating: 81,
    isActive: true
  },
  {
    id: "tj-mcconnell",
    name: "T.J. McConnell",
    era: "Current",
    team: "IND",
    position: "Point Guard",
    ppg: 10.2,
    apg: 5.5,
    rpg: 2.7,
    fgPercent: 55,
    tier: "Bronze",
    overallRating: 79,
    isActive: true
  },
  {
    id: "luguentz-dort",
    name: "Luguentz Dort",
    era: "Current",
    team: "OKC",
    position: "Small Forward",
    ppg: 10.9,
    apg: 1.4,
    rpg: 3.6,
    fgPercent: 43,
    tier: "Silver",
    overallRating: 80,
    isActive: true
  },
  {
    id: "payton-pritchard",
    name: "Payton Pritchard",
    era: "Current",
    team: "BOS",
    position: "Point Guard",
    ppg: 9.6,
    apg: 3.4,
    rpg: 3.2,
    fgPercent: 46,
    tier: "Bronze",
    overallRating: 78,
    isActive: true
  },
  {
    id: "kevon-looney",
    name: "Kevon Looney",
    era: "Current",
    team: "GSW",
    position: "Center",
    ppg: 5.6,
    apg: 2.5,
    rpg: 7.3,
    fgPercent: 54,
    tier: "Bronze",
    overallRating: 78,
    isActive: true
  },
  {
    id: "jose-alvarado",
    name: "Jose Alvarado",
    era: "Current",
    team: "NOP",
    position: "Point Guard",
    ppg: 7.0,
    apg: 3.0,
    rpg: 2.3,
    fgPercent: 41,
    tier: "Bronze",
    overallRating: 76,
    isActive: true
  },
  {
    id: "christian-wood",
    name: "Christian Wood",
    era: "Current",
    team: "LAL",
    position: "Power Forward",
    ppg: 6.9,
    apg: 1.0,
    rpg: 5.1,
    fgPercent: 46,
    tier: "Bronze",
    overallRating: 77,
    isActive: true
  },

  // ================= HISTORICAL ROLE PLAYERS & CLASSIC SQUAD HELPERS =================
  {
    id: "tony-parker",
    name: "Tony Parker",
    era: "2000s",
    team: "SAS",
    position: "Point Guard",
    ppg: 15.8,
    apg: 5.6,
    rpg: 2.7,
    fgPercent: 49,
    tier: "Gold",
    overallRating: 89,
    isActive: false
  },
  {
    id: "manu-ginobili",
    name: "Manu Ginóbili",
    era: "2000s",
    team: "SAS",
    position: "Shooting Guard",
    ppg: 13.3,
    apg: 3.8,
    rpg: 3.5,
    fgPercent: 45,
    tier: "Gold",
    overallRating: 89,
    isActive: false
  },
  {
    id: "steve-kerr",
    name: "Steve Kerr",
    era: "1990s",
    team: "CHI",
    position: "Point Guard",
    ppg: 6.0,
    apg: 1.8,
    rpg: 1.2,
    fgPercent: 48,
    tier: "Bronze",
    overallRating: 75,
    isActive: false
  },
  {
    id: "john-paxson",
    name: "John Paxson",
    era: "1990s",
    team: "CHI",
    position: "Point Guard",
    ppg: 7.2,
    apg: 3.6,
    rpg: 1.2,
    fgPercent: 47,
    tier: "Bronze",
    overallRating: 72,
    isActive: false
  },
  {
    id: "danny-green",
    name: "Danny Green",
    era: "2010s",
    team: "SAS",
    position: "Shooting Guard",
    ppg: 8.7,
    apg: 1.5,
    rpg: 3.4,
    fgPercent: 42,
    tier: "Bronze",
    overallRating: 79,
    isActive: false
  },
  {
    id: "kyle-korver",
    name: "Kyle Korver",
    era: "2010s",
    team: "ATL",
    position: "Shooting Guard",
    ppg: 9.7,
    apg: 1.7,
    rpg: 3.0,
    fgPercent: 44,
    tier: "Bronze",
    overallRating: 78,
    isActive: false
  },
  {
    id: "robert-horry",
    name: "Robert Horry",
    era: "2000s",
    team: "LAL",
    position: "Power Forward",
    ppg: 7.0,
    apg: 2.1,
    rpg: 4.8,
    fgPercent: 42,
    tier: "Bronze",
    overallRating: 76,
    isActive: false
  },
  {
    id: "derek-fisher",
    name: "Derek Fisher",
    era: "2000s",
    team: "LAL",
    position: "Point Guard",
    ppg: 8.3,
    apg: 3.0,
    rpg: 2.1,
    fgPercent: 40,
    tier: "Bronze",
    overallRating: 78,
    isActive: false
  },
  {
    id: "spud-webb",
    name: "Spud Webb",
    era: "1980s",
    team: "ATL",
    position: "Point Guard",
    ppg: 9.9,
    apg: 5.3,
    rpg: 2.1,
    fgPercent: 45,
    tier: "Bronze",
    overallRating: 76,
    isActive: false
  },
  {
    id: "kenny-smith",
    name: "Kenny Smith",
    era: "1990s",
    team: "HOU",
    position: "Point Guard",
    ppg: 12.8,
    apg: 5.0,
    rpg: 2.0,
    fgPercent: 48,
    tier: "Silver",
    overallRating: 80,
    isActive: false
  },
  {
    id: "toni-kukoc",
    name: "Toni Kukoč",
    era: "1990s",
    team: "CHI",
    position: "Small Forward",
    ppg: 11.6,
    apg: 3.7,
    rpg: 4.2,
    fgPercent: 44,
    tier: "Silver",
    overallRating: 85,
    isActive: false
  },
  {
    id: "jason-terry",
    name: "Jason Terry",
    era: "2000s",
    team: "DAL",
    position: "Shooting Guard",
    ppg: 13.4,
    apg: 3.8,
    rpg: 2.3,
    fgPercent: 44,
    tier: "Silver",
    overallRating: 84,
    isActive: false
  },
  {
    id: "andre-iguodala",
    name: "Andre Iguodala",
    era: "2010s",
    team: "GSW",
    position: "Small Forward",
    ppg: 11.3,
    apg: 4.2,
    rpg: 4.9,
    fgPercent: 46,
    tier: "Silver",
    overallRating: 86,
    isActive: false
  },
  {
    id: "amare-stoudemire",
    name: "Amar'e Stoudemire",
    era: "2000s",
    team: "PHX",
    position: "Power Forward",
    ppg: 18.9,
    apg: 1.2,
    rpg: 7.8,
    fgPercent: 53,
    tier: "Gold",
    overallRating: 91,
    isActive: false
  },
  {
    id: "shawn-marion",
    name: "Shawn Marion",
    era: "2000s",
    team: "PHX",
    position: "Small Forward",
    ppg: 15.2,
    apg: 1.9,
    rpg: 8.7,
    fgPercent: 48,
    tier: "Gold",
    overallRating: 88,
    isActive: false
  },
  {
    id: "lamar-odom",
    name: "Lamar Odom",
    era: "2000s",
    team: "LAL",
    position: "Power Forward",
    ppg: 13.3,
    apg: 3.7,
    rpg: 8.4,
    fgPercent: 46,
    tier: "Silver",
    overallRating: 84,
    isActive: false
  }
];

export const ALL_RAW_PLAYERS = [...RAW_PRELOADED_PLAYERS];

export function getPlayerOverallAndTier(player: { ppg: number; apg: number; rpg: number; id?: string; name?: string }): { overallRating: number; tier: "Bronze" | "Silver" | "Gold" | "Legendary" } {
  const pName = player.name || "";
  const pId = player.id || "";
  
  const found = RAW_PRELOADED_PLAYERS.find(p => 
    p.id === pId || p.name.toLowerCase() === pName.toLowerCase()
  );

  if (found) {
    return { overallRating: found.overallRating, tier: found.tier as any };
  }

  // Dynamic formula for searched players fallback
  const scorerComponent = player.ppg * 1.5;
  const facilitatorComponent = player.apg * 1.8 + player.rpg * 1.4;
  let rawRating = Math.round(45 + scorerComponent + facilitatorComponent);
  
  if (rawRating < 60) rawRating = 60;
  if (rawRating > 99) rawRating = 99;

  let tier: "Bronze" | "Silver" | "Gold" | "Legendary" = "Bronze";
  if (rawRating >= 95) {
    tier = "Legendary";
  } else if (rawRating >= 85) {
    tier = "Gold";
  } else if (rawRating >= 75) {
    tier = "Silver";
  }

  return { overallRating: rawRating, tier };
}

export function getSeededRandom(seedString: string) {
  let h = 1779033703 ^ seedString.length;
  for (let i = 0; i < seedString.length; i++) {
    h = Math.imul(h ^ seedString.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return function() {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

export function getDetailedAttributes(player: { name: string; position: string; id?: string }, ovr: number) {
  const seedString = `attr-${player.name}-${player.id || ""}`;
  const seed = getSeededRandom(seedString);
  const pos = (player.position || "").toLowerCase();
  
  let three = Math.round(ovr - 12 + seed() * 18);
  let mid = Math.round(ovr - 8 + seed() * 15);
  let ft = Math.round(ovr - 6 + seed() * 12);
  let pass = Math.round(ovr - 15 + seed() * 20);
  let handle = Math.round(ovr - 12 + seed() * 18);
  let perimD = Math.round(ovr - 12 + seed() * 18);
  let intD = Math.round(ovr - 18 + seed() * 22);
  let steal = Math.round(ovr - 15 + seed() * 16);
  let block = Math.round(ovr - 20 + seed() * 22);
  let speed = Math.round(ovr - 10 + seed() * 15);
  let strength = Math.round(ovr - 12 + seed() * 18);
  let vert = Math.round(ovr - 12 + seed() * 18);

  if (pos.includes("guard") || pos.includes("point")) {
    three += 8;
    mid += 4;
    ft += 6;
    pass += 12;
    handle += 14;
    perimD += 6;
    intD -= 15;
    block -= 15;
    steal += 8;
    speed += 8;
    strength -= 8;
    vert += 3;
  } else if (pos.includes("center")) {
    three -= 18;
    mid -= 6;
    ft -= 10;
    pass -= 10;
    handle -= 12;
    perimD -= 14;
    intD += 14;
    block += 16;
    steal -= 10;
    speed -= 10;
    strength += 14;
    vert -= 4;
  } else {
    three += 2;
    mid += 2;
    pass -= 2;
    handle -= 3;
    intD += 6;
    perimD += 2;
    block += 6;
    strength += 6;
  }

  const nameLower = player.name.toLowerCase();
  if (nameLower.includes("curry")) {
    three = 99;
    ft = 96;
    handle = 98;
    speed = 91;
  } else if (nameLower.includes("jordan") || nameLower.includes("bryant")) {
    mid = 98;
    vert = 97;
    perimD = 96;
    steal = 92;
    speed = 94;
    strength = 88;
  } else if (nameLower.includes("shaq") || nameLower.includes("oneal")) {
    three = 25;
    mid = 42;
    ft = 52;
    strength = 99;
    intD = 95;
    block = 94;
    speed = 76;
    vert = 82;
  } else if (nameLower.includes("jokic")) {
    pass = 98;
    handle = 88;
    three = 85;
    mid = 94;
    strength = 90;
    speed = 68;
  } else if (nameLower.includes("lebron")) {
    speed = 93;
    strength = 95;
    pass = 92;
    handle = 90;
    vert = 96;
    intD = 84;
    perimD = 88;
  } else if (nameLower.includes("durant")) {
    three = 93;
    mid = 97;
    ft = 90;
    vert = 88;
    block = 82;
  } else if (nameLower.includes("bird")) {
    three = 95;
    mid = 94;
    ft = 93;
    pass = 92;
    steal = 88;
    speed = 78;
  } else if (nameLower.includes("magic")) {
    pass = 99;
    handle = 95;
    three = 78;
    mid = 88;
    strength = 86;
  } else if (nameLower.includes("hakeem") || nameLower.includes("olajuwon")) {
    intD = 98;
    block = 98;
    strength = 92;
    speed = 82;
    mid = 85;
  } else if (nameLower.includes("wembanyama")) {
    block = 99;
    intD = 92;
    perimD = 85;
    three = 82;
    vert = 92;
    speed = 84;
  }

  const clamp = (val: number) => Math.max(25, Math.min(99, val));

  return {
    threePointRating: clamp(three),
    midRangeRating: clamp(mid),
    freeThrowRating: clamp(ft),
    passRating: clamp(pass),
    ballHandleRating: clamp(handle),
    perimeterRating: clamp(perimD),
    interiorRating: clamp(intD),
    stealRating: clamp(steal),
    blockRating: clamp(block),
    speedRating: clamp(speed),
    strengthRating: clamp(strength),
    verticalRating: clamp(vert)
  };
}

export const PRELOADED_PLAYERS: PoolPlayer[] = ALL_RAW_PLAYERS.map((p) => {
  const meta = getPlayerOverallAndTier(p);
  const attributes = getDetailedAttributes(p, meta.overallRating);
  return {
    ...p,
    ...attributes,
    overallRating: meta.overallRating,
    tier: meta.tier,
    difficulty: meta.overallRating >= 95 ? "hard" : (meta.overallRating >= 85 ? "medium" : "easy")
  } as PoolPlayer;
});

export const OPPONENT_TEAMS = [
  { name: "Slam Dunk Titans", level: "Easy" },
  { name: "Crossover Wizards", level: "Medium" },
  { name: "Three-Point Snipers", level: "Hard" },
  { name: "Rim Protector Beasts", level: "Hard" },
  { name: "Fast Break Demons", level: "Medium" }
];

export const THEMED_OPPONENT_TEAMS = [
  { id: "bulls90s", name: "96 Bulls", level: "Legend", tags: ["Michael Jordan", "Scottie Pippen", "Dennis Rodman"], style: "Midrange Mastery & Lock Down Defence" },
  { id: "warriors17", name: "17 Warriors", level: "Legend", tags: ["Stephen Curry", "Kevin Durant", "Andre Iguodala"], style: "Splashing pace & space 3PT fest" },
  { id: "lakers01", name: "01 Lakers", level: "Legend", tags: ["Kobe Bryant", "Shaquille O'Neal", "Derek Fisher"], style: "Inside Out Force & Clutch" },
  { id: "spurs14", name: "14 Spurs", level: "Hard", tags: ["Tim Duncan", "Tony Parker", "Manu Ginóbili"], style: "The Beautiful Game Passing Flow" },
  { id: "heat13", name: "13 Heat", level: "Legend", tags: ["LeBron James", "Dwyane Wade", "Ray Allen"], style: "Fast Breaks & Aggressive Trap D" },
  { id: "lakers20", name: "20 Lakers", level: "Hard", tags: ["LeBron James", "Anthony Davis", "Christian Wood"], style: "Physical Paints & Double-Double Dominance" },
  { id: "nuggets23", name: "23 Nuggets", level: "Hard", tags: ["Nikola Jokić", "Jamal Murray", "Bobby Portis"], style: "High IQ Post passing off-cuts" },
  { id: "pistons04", name: "04 Pistons", level: "Hard", tags: ["Chauncey Billups", "Ben Wallace", "Robert Horry"], style: "Gritty Brickwall Shot Protection" },
  { id: "dreamteam", name: "90s Dream Team", level: "Legend", tags: ["Michael Jordan", "Magic Johnson", "Larry Bird", "Charles Barkley"], style: "Elite Legacy Supremacy" },
  { id: "allstars", name: "Modern All-Stars", level: "Legend", tags: ["Luka Dončić", "Giannis Antetokounmpo", "Nikola Jokić", "Jayson Tatum"], style: "Positionless High Tempo Scoring" }
];
