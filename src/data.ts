import { Player } from "./types";

export interface PoolPlayer extends Player {
  difficulty: "easy" | "medium" | "hard";
}

const RAW_PRELOADED_PLAYERS = [
  // ================= 1980s =================
  {
    id: "magic-johnson",
    name: "Magic Johnson",
    era: "1980s",
    team: "LAL",
    position: "Guard",
    ppg: 19.5,
    apg: 11.2,
    rpg: 7.2,
    fgPercent: 52,
    tier: "hard",
    isActive: false
  },
  {
    id: "larry-bird",
    name: "Larry Bird",
    era: "1980s",
    team: "BOS",
    position: "Forward",
    ppg: 24.3,
    apg: 6.3,
    rpg: 10.0,
    fgPercent: 49,
    tier: "hard",
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
    tier: "hard",
    isActive: false
  },
  {
    id: "isiah-thomas",
    name: "Isiah Thomas",
    era: "1980s",
    team: "DET",
    position: "Guard",
    ppg: 19.2,
    apg: 9.3,
    rpg: 3.6,
    fgPercent: 45,
    tier: "medium",
    isActive: false
  },
  {
    id: "dominique-wilkins",
    name: "Dominique Wilkins",
    era: "1980s",
    team: "ATL",
    position: "Forward",
    ppg: 24.8,
    apg: 2.5,
    rpg: 6.7,
    fgPercent: 46,
    tier: "medium",
    isActive: false
  },
  {
    id: "john-paxson",
    name: "John Paxson",
    era: "1980s",
    team: "CHI",
    position: "Guard",
    ppg: 7.2,
    apg: 3.6,
    rpg: 1.2,
    fgPercent: 47,
    tier: "easy",
    isActive: false
  },

  // ================= 1990s =================
  {
    id: "michael-jordan",
    name: "Michael Jordan",
    era: "1990s",
    team: "CHI",
    position: "Guard",
    ppg: 30.1,
    apg: 5.3,
    rpg: 6.2,
    fgPercent: 50,
    tier: "hard",
    isActive: false
  },
  {
    id: "hakeem-olajuwon",
    name: "Hakeem Olajuwon",
    era: "1990s",
    team: "HOU",
    position: "Center",
    ppg: 21.8,
    apg: 2.5,
    rpg: 11.1,
    fgPercent: 51,
    tier: "hard",
    isActive: false
  },
  {
    id: "reggie-miller",
    name: "Reggie Miller",
    era: "1990s",
    team: "IND",
    position: "Guard",
    ppg: 18.2,
    apg: 3.0,
    rpg: 3.0,
    fgPercent: 47,
    tier: "medium",
    isActive: false
  },
  {
    id: "charles-barkley",
    name: "Charles Barkley",
    era: "1990s",
    team: "PHX",
    position: "Forward",
    ppg: 22.1,
    apg: 3.9,
    rpg: 11.7,
    fgPercent: 54,
    tier: "medium",
    isActive: false
  },
  {
    id: "steve-kerr",
    name: "Steve Kerr",
    era: "1990s",
    team: "CHI",
    position: "Guard",
    ppg: 6.0,
    apg: 1.8,
    rpg: 1.2,
    fgPercent: 48,
    tier: "easy",
    isActive: false
  },
  {
    id: "muggsy-bogues",
    name: "Muggsy Bogues",
    era: "1990s",
    team: "CHA",
    position: "Guard",
    ppg: 7.7,
    apg: 7.6,
    rpg: 2.6,
    fgPercent: 46,
    tier: "easy",
    isActive: false
  },

  // ================= 2000s =================
  {
    id: "kobe-bryant",
    name: "Kobe Bryant",
    era: "2000s",
    team: "LAL",
    position: "Guard",
    ppg: 25.0,
    apg: 4.7,
    rpg: 5.2,
    fgPercent: 45,
    tier: "hard",
    isActive: false
  },
  {
    id: "shaquille-oneal",
    name: "Shaquille O'Neal",
    era: "2000s",
    team: "LAL",
    position: "Center",
    ppg: 23.7,
    apg: 2.5,
    rpg: 10.9,
    fgPercent: 58,
    tier: "hard",
    isActive: false
  },
  {
    id: "tim-duncan",
    name: "Tim Duncan",
    era: "2000s",
    team: "SAS",
    position: "Center",
    ppg: 19.0,
    apg: 3.0,
    rpg: 10.8,
    fgPercent: 51,
    tier: "hard",
    isActive: false
  },
  {
    id: "allen-iverson",
    name: "Allen Iverson",
    era: "2000s",
    team: "PHI",
    position: "Guard",
    ppg: 26.7,
    apg: 6.2,
    rpg: 3.7,
    fgPercent: 42,
    tier: "medium",
    isActive: false
  },
  {
    id: "robert-horry",
    name: "Robert Horry",
    era: "2000s",
    team: "LAL",
    position: "Forward",
    ppg: 7.0,
    apg: 2.1,
    rpg: 4.8,
    fgPercent: 42,
    tier: "easy",
    isActive: false
  },
  {
    id: "derek-fisher",
    name: "Derek Fisher",
    era: "2000s",
    team: "LAL",
    position: "Guard",
    ppg: 8.3,
    apg: 3.0,
    rpg: 2.1,
    fgPercent: 40,
    tier: "easy",
    isActive: false
  },

  // ================= 2010s =================
  {
    id: "lebron-james-10s",
    name: "LeBron James",
    era: "2010s",
    team: "MIA",
    position: "Forward",
    ppg: 27.2,
    apg: 7.4,
    rpg: 7.5,
    fgPercent: 50,
    tier: "hard",
    isActive: false
  },
  {
    id: "stephen-curry-10s",
    name: "Stephen Curry",
    era: "2010s",
    team: "GSW",
    position: "Guard",
    ppg: 24.8,
    apg: 6.4,
    rpg: 4.7,
    fgPercent: 47,
    tier: "hard",
    isActive: false
  },
  {
    id: "kevin-durant-10s",
    name: "Kevin Durant",
    era: "2010s",
    team: "OKC",
    position: "Forward",
    ppg: 27.3,
    apg: 4.4,
    rpg: 7.0,
    fgPercent: 50,
    tier: "hard",
    isActive: false
  },
  {
    id: "ray-allen",
    name: "Ray Allen",
    era: "2010s",
    team: "MIA",
    position: "Guard",
    ppg: 18.9,
    apg: 3.4,
    rpg: 4.1,
    fgPercent: 45,
    tier: "medium",
    isActive: false
  },
  {
    id: "danny-green",
    name: "Danny Green",
    era: "2010s",
    team: "SAS",
    position: "Guard",
    ppg: 8.7,
    apg: 1.5,
    rpg: 3.4,
    fgPercent: 42,
    tier: "easy",
    isActive: false
  },
  {
    id: "kyle-korver",
    name: "Kyle Korver",
    era: "2010s",
    team: "ATL",
    position: "Guard",
    ppg: 9.7,
    apg: 1.7,
    rpg: 3.0,
    fgPercent: 44,
    tier: "easy",
    isActive: false
  },

  // ================= Current =================
  {
    id: "nikola-jokic-cur",
    name: "Nikola Jokić",
    era: "Current",
    team: "DEN",
    position: "Center",
    ppg: 29.7,
    apg: 10.3,
    rpg: 13.7,
    fgPercent: 58,
    tier: "hard",
    isActive: true
  },
  {
    id: "giannis-antetokounmpo-cur",
    name: "Giannis Antetokounmpo",
    era: "Current",
    team: "MIL",
    position: "Forward",
    ppg: 31.0,
    apg: 6.2,
    rpg: 12.3,
    fgPercent: 61,
    tier: "hard",
    isActive: true
  },
  {
    id: "luka-doncic-cur",
    name: "Luka Dončić",
    era: "Current",
    team: "DAL",
    position: "Guard",
    ppg: 28.5,
    apg: 9.2,
    rpg: 8.1,
    fgPercent: 48,
    tier: "hard",
    isActive: true
  },
  {
    id: "jayson-tatum-cur",
    name: "Jayson Tatum",
    era: "Current",
    team: "BOS",
    position: "Forward",
    ppg: 27.0,
    apg: 4.8,
    rpg: 8.2,
    fgPercent: 47,
    tier: "medium",
    isActive: true
  },
  {
    id: "shai-gilgeous-cur",
    name: "Shai Gilgeous-Alexander",
    era: "Current",
    team: "OKC",
    position: "Guard",
    ppg: 30.1,
    apg: 6.4,
    rpg: 5.5,
    fgPercent: 53,
    tier: "medium",
    isActive: true
  },
  {
    id: "alex-caruso",
    name: "Alex Caruso",
    era: "Current",
    team: "OKC",
    position: "Guard",
    ppg: 10.1,
    apg: 3.5,
    rpg: 3.8,
    fgPercent: 46,
    tier: "easy",
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
    tier: "easy",
    isActive: true
  }
];

const GENERATED_RAW_PLAYERS: any[] = [];

const firstNamesList = [
  "Jalen", "Cade", "Evan", "Keegan", "Tyrese", "Austin", "Malik", "Rui", "Luguentz", "Chet", "Dereck", "Keyonte", "Brandon", "Scoot", "Amen", "Ausar", "Ja", "Desmond", "Marcus", "Dillon", "Fred", "Alperen", "Jabari", "Tari", "Cam", "Jaden", "Isaiah", "Pascal", "Myles", "Benedict", "Andrew", "De'Aaron", "Domantas", "Keon", "Harrison", "Derrick", "Jrue", "Kristaps", "Jaylen", "Al", "Aaron", "Michael", "Jamal", "Kentavious", "Brook", "Khris", "Damian", "Bobby", "Grayson", "Bradley", "Devin", "Yusuf", "Taurean", "Jarred", "Gabe", "Christian", "Jaxson", "Max", "Mike", "Rudy", "Karl-Anthony", "Anthony", "Naz", "Kyle", "Nickeil", "Cole", "Deandre", "Zach", "Alex", "Coby", "Nikola", "Patrick", "Ayo", "Andre", "Torrey", "Lonzo", "DeMar", "Terry", "LaMelo", "Miles", "Mark", "Nick", "PJ", "Cody", "Saddiq", "De'Andre", "Clint", "Bogdan", "Onyeka", "Garrison", "Trae", "Dejounte", "Kyrie", "Luka", "Grant", "Josh", "Tim", "Maxi", "Dwight", "Richaun", "Olivier-Maxence"
];

const lastNamesList = [
  "Suggs", "Cunningham", "Mobley", "Murray", "Haliburton", "Reaves", "Monk", "Hachimura", "Dort", "Holmgren", "Lively", "George", "Miller", "Henderson", "Thompson", "Morant", "Bane", "Smart", "Brooks", "VanVleet", "Sengun", "Smith", "Eason", "Whitmore", "McDaniels", "Stewart", "Duren", "Siakam", "Turner", "Mathurin", "Nembhard", "Fox", "Sabonis", "Ellis", "Barnes", "White", "Holiday", "Porzingis", "Brown", "Horford", "Gordon", "Porter", "Caldwell-Pope", "Lopez", "Middleton", "Lillard", "Portis", "Allen", "Beal", "Booker", "Nurkic", "Reddish", "Prince", "Vanderbilt", "Vincent", "Wood", "Hayes", "Christie", "Conley", "Gobert", "Towns", "Edwards", "Reid", "Anderson", "Aldridge", "Ayton", "Jordan", "LaVine", "Caruso", "Vucevic", "Williams", "Dosunmu", "Drummond", "Craig", "Ball", "DeRozan", "Rozier", "Bridges", "Richards", "Washington", "Martin", "Bey", "Hunter", "Capela", "Bogdanovic", "Okongwu", "Johnson", "Mathews", "Young", "Irving", "Doncic", "Jones", "Hardaway", "Kleber", "Powell", "Holmes", "Hardy", "Prosper", "Morris"
];

const nbaTeams = [
  "BOS", "BKN", "NYK", "PHI", "TOR", "CHI", "CLE", "DET", "IND", "MIL", "ATL", "CHA", "MIA", "ORL", "WAS", "DEN", "MIN", "OKC", "POR", "UTA", "GSW", "LAC", "LAL", "PHX", "SAC", "DAL", "HOU", "MEM", "NOP", "SAS"
];

const eras = ["1980s", "1990s", "2000s", "2010s", "Current"];

const positions = [
  "Point Guard",
  "Shooting Guard",
  "Small Forward",
  "Power Forward",
  "Center"
];

function getSeededRandom(seedString: string) {
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

for (let i = 0; i < 490; i++) {
  const seed = getSeededRandom("gen-player-" + i);
  const fIdx = Math.floor(seed() * firstNamesList.length);
  const lIdx = Math.floor(seed() * lastNamesList.length);
  const tIdx = Math.floor(seed() * nbaTeams.length);
  const eIdx = Math.floor(seed() * eras.length);
  const pos = positions[Math.floor(seed() * positions.length)];
  
  const firstName = firstNamesList[fIdx];
  const lastName = lastNamesList[lIdx];
  const fullName = `${firstName} ${lastName}`;
  const team = nbaTeams[tIdx];
  const era = eras[eIdx];
  
  let ppg = 0;
  let apg = 0;
  let rpg = 0;
  let fgPercent = Math.round(42 + seed() * 15);
  
  if (pos === "Point Guard") {
    ppg = 10 + seed() * 16;
    apg = 5 + seed() * 6;
    rpg = 2.5 + seed() * 3;
  } else if (pos === "Shooting Guard") {
    ppg = 12 + seed() * 18;
    apg = 2.5 + seed() * 4;
    rpg = 3 + seed() * 3;
  } else if (pos === "Small Forward") {
    ppg = 11 + seed() * 17;
    apg = 2 + seed() * 4;
    rpg = 4.5 + seed() * 4;
  } else if (pos === "Power Forward") {
    ppg = 9 + seed() * 15;
    apg = 1.5 + seed() * 3;
    rpg = 6.5 + seed() * 5.5;
  } else {
    ppg = 8 + seed() * 14;
    apg = 1 + seed() * 3;
    rpg = 8 + seed() * 6;
    fgPercent = Math.round(50 + seed() * 12);
  }
  
  ppg = Math.round(ppg * 10) / 10;
  apg = Math.round(apg * 10) / 10;
  rpg = Math.round(rpg * 10) / 10;
  
  const alreadyExistsObj = RAW_PRELOADED_PLAYERS.find(p => p.name.toLowerCase() === fullName.toLowerCase());
  const actualName = alreadyExistsObj ? `${fullName} Jr.` : fullName;
  
  const id = `gen-${firstName.toLowerCase()}-${lastName.toLowerCase()}-${i}`;
  
  const scorerComponent = ppg * 1.5;
  const facilitatorComponent = apg * 1.8 + rpg * 1.4;
  const ratingProjected = Math.round(45 + scorerComponent + facilitatorComponent);
  const diffTag = ratingProjected >= 85 ? "hard" : (ratingProjected >= 75 ? "medium" : "easy");
  
  GENERATED_RAW_PLAYERS.push({
    id,
    name: actualName,
    era,
    team,
    position: pos,
    ppg,
    apg,
    rpg,
    fgPercent,
    tier: diffTag,
    isActive: seed() > 0.4
  });
}

export const ALL_RAW_PLAYERS = [...RAW_PRELOADED_PLAYERS, ...GENERATED_RAW_PLAYERS];

export function getPlayerOverallAndTier(player: { ppg: number; apg: number; rpg: number; id?: string }): { overallRating: number; tier: "Bronze" | "Silver" | "Gold" | "Legendary" } {
  const idMap: Record<string, { ovr: number; tier: "Bronze" | "Silver" | "Gold" | "Legendary" }> = {
    "magic-johnson": { ovr: 96, tier: "Legendary" },
    "larry-bird": { ovr: 96, tier: "Legendary" },
    "kareem-abdul-jabbar": { ovr: 95, tier: "Legendary" },
    "isiah-thomas": { ovr: 87, tier: "Gold" },
    "dominique-wilkins": { ovr: 88, tier: "Gold" },
    "john-paxson": { ovr: 72, tier: "Bronze" },
    "michael-jordan": { ovr: 99, tier: "Legendary" },
    "hakeem-olajuwon": { ovr: 97, tier: "Legendary" },
    "reggie-miller": { ovr: 83, tier: "Silver" },
    "charles-barkley": { ovr: 92, tier: "Gold" },
    "steve-kerr": { ovr: 68, tier: "Bronze" },
    "muggsy-bogues": { ovr: 70, tier: "Bronze" },
    "kobe-bryant": { ovr: 98, tier: "Legendary" },
    "shaquille-oneal": { ovr: 97, tier: "Legendary" },
    "tim-duncan": { ovr: 95, tier: "Legendary" },
    "allen-iverson": { ovr: 92, tier: "Gold" },
    "robert-horry": { ovr: 74, tier: "Bronze" },
    "derek-fisher": { ovr: 73, tier: "Bronze" },
    "lebron-james-10s": { ovr: 98, tier: "Legendary" },
    "stephen-curry-10s": { ovr: 97, tier: "Legendary" },
    "kevin-durant-10s": { ovr: 96, tier: "Legendary" },
    "ray-allen": { ovr: 88, tier: "Gold" },
    "danny-green": { ovr: 74, tier: "Bronze" },
    "kyle-korver": { ovr: 72, tier: "Bronze" },
    "nikola-jokic-cur": { ovr: 97, tier: "Legendary" },
    "giannis-antetokounmpo-cur": { ovr: 96, tier: "Legendary" },
    "luka-doncic-cur": { ovr: 95, tier: "Legendary" },
    "jayson-tatum-cur": { ovr: 89, tier: "Gold" },
    "shai-gilgeous-cur": { ovr: 91, tier: "Gold" },
    "alex-caruso": { ovr: 76, tier: "Silver" },
    "naz-reid": { ovr: 78, tier: "Silver" }
  };

  const key = player.id || "";
  if (idMap[key]) {
    return { overallRating: idMap[key].ovr, tier: idMap[key].tier };
  }

  // Dynamic formula for search grounded custom players
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

export function getDetailedAttributes(player: { name: string; position: string; id?: string }, ovr: number) {
  const seedString = `attr-${player.name}-${player.id || ""}`;
  const seed = getSeededRandom(seedString);
  const pos = (player.position || "").toLowerCase();
  
  // Base values around overall rating
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

  // Position adjustments
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
  } else { // Forward / Power Forward / Small Forward
    three += 2;
    mid += 2;
    pass -= 2;
    handle -= 3;
    intD += 6;
    perimD += 2;
    block += 6;
    strength += 6;
  }

  // Double override for specific historical legends
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
  } else if (nameLower.includes("magic-johnson") || nameLower.includes("magic johnson")) {
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
    difficulty: p.tier as "easy" | "medium" | "hard"
  } as PoolPlayer;
});

export const OPPONENT_TEAMS = [
  { name: "Slam Dunk Titans", level: "Easy" },
  { name: "Crossover Wizards", level: "Medium" },
  { name: "Three-Point Snipers", level: "Hard" },
  { name: "Rim Protector Beasts", level: "Hard" },
  { name: "Fast Break Demons", level: "Medium" }
];

// Rich array of 50+ pre-defined themed opponent teams representing various eras and concepts
export const THEMED_OPPONENT_TEAMS = [
  { id: "bulls90s", name: "90s Bulls", level: "Legend", tags: ["Jordan", "Pippen", "Rodman"], style: "Defensive Dominance & Midrange Master" },
  { id: "warriors17", name: "2017 Warriors", level: "Legend", tags: ["Curry", "Durant", "Thompson"], style: "Pace & Space 3PT Fest" },
  { id: "lakers00s", name: "2000s Lakers", level: "Legend", tags: ["Kobe", "Shaq", "Fisher"], style: "Inside Out Force & Clutch" },
  { id: "allstars", name: "Modern All-Stars", level: "Legend", tags: ["Luka", "Giannis", "Jokic", "Tatum"], style: "Positionless High-Tempo Elite" },
  { id: "grizzlies", name: "Gritty Grizzlies", level: "Hard", tags: ["Randolph", "Gasol", "Allen"], style: "Grit and Grind Heavy Interior" },
  { id: "pace_space", name: "Pace & Space 5-Out", level: "Hard", tags: ["Curry", "Allen", "Korver", "Nash"], style: "Maximum Threes & Transition" },
  { id: "showtime", name: "Showtime Lakers", level: "Legend", tags: ["Magic", "Kareem", "Worthy"], style: "Fast Breaks & Highlight Passes" },
  { id: "bad_boys", name: "Bad Boys Pistons", level: "Hard", tags: ["Isiah", "Dumars", "Laimbeer"], style: "Suffocating Perimeter & physical D" },
  { id: "celtics86", name: "1986 Celtics", level: "Hard", tags: ["Bird", "McHale", "Parish"], style: "Team Passing & Elite IQ Shooting" },
  { id: "rockets95", name: "1995 Rockets", level: "Hard", tags: ["Olajuwon", "Drexler", "Horry"], style: "Post Dominance & Corner Shooters" },
  { id: "pistons04", name: "2004 Pistons", level: "Hard", tags: ["Billups", "Milton", "Prince", "Ben Wallace"], style: "Slow Grind Shot Defense" },
  { id: "heat13", name: "2013 Heat", level: "Legend", tags: ["LeBron", "Wade", "Bosh", "Allen"], style: "Aggressive Traps & Slasher Drive" },
  { id: "spurs14", name: "2014 Spurs", level: "Hard", tags: ["Duncan", "Parker", "Ginobili", "Leonard"], style: "The Beautiful Game Ball Movement" },
  { id: "cavs16", name: "2016 Cavaliers", level: "Hard", tags: ["LeBron", "Irving", "Love"], style: "Isolation Scoring & Clutch Threes" },
  { id: "raptors19", name: "2019 Raptors", level: "Medium", tags: ["Leonard", "Siakam", "Lowry"], style: "Lockdown Help Defense" },
  { id: "bucks21", name: "2021 Bucks", level: "Hard", tags: ["Giannis", "Middleton", "Holiday"], style: "Rim Attack & Brickwall Screen" },
  { id: "nuggets23", name: "2023 Nuggets", level: "Hard", tags: ["Jokic", "Murray", "Gordon"], style: "Two-Man Game & Post Facilitation" },
  { id: "run_tmc", name: "Run TMC Warriors", level: "Medium", tags: ["Hardaway", "Richmond", "Mullin"], style: "Uptempo Run & Gun Offense" },
  { id: "lob_city", name: "Lob City Clippers", level: "Medium", tags: ["Paul", "Griffin", "Jordan"], style: "High-Flying Dunkers & Pick and Roll" },
  { id: "kings02", name: "2002 Kings", level: "Medium", tags: ["Webber", "Bibby", "Divac", "Stojakovic"], style: "High-Post Elbow Passing SPA" },
  { id: "wolves04", name: "2004 Timberwolves", level: "Medium", tags: ["Garnett", "Cassell", "Sprewell"], style: "Midrange Pullups & Intensity" },
  { id: "heat06", name: "2006 Heat", level: "Medium", tags: ["Wade", "Shaq", "Walker"], style: "Heavy Freethrows & Dunk Attacks" },
  { id: "celtics08", name: "2008 Celtics", level: "Hard", tags: ["Pierce", "Garnett", "Allen", "Rondo"], style: "Ubuntu High Defensive Rotation" },
  { id: "magic09", name: "2009 Magic", level: "Medium", tags: ["Howard", "Turkoglu", "Lewis"], style: "Four-Out In & Inside Out Layout" },
  { id: "mavs11", name: "2011 Mavericks", level: "Hard", tags: ["Nowitzki", "Terry", "Kidd", "Marion"], style: "Invaluable Zone D & Midrange fadeaway" },
  { id: "rising_25", name: "Rising Stars 2025", level: "Legend", tags: ["Wembanyama", "Edwards", "Holmgren"], style: "Future Freak Athleticism" },
  { id: "hoop_dreams", name: "Hoop Dreams Elite", level: "Legend", tags: ["Kobe", "Curry", "Jordan", "Durant"], style: "Pure Isolation Shot Creators" },
  { id: "three_snipers", name: "Perimeter Snipers", level: "Medium", tags: ["Korver", "Kerr", "Miller", "Allen"], style: "Catch-and-Shoot Floaters Only" },
  { id: "rim_beasts", name: "Paint Protectors", level: "Medium", tags: ["Gobert", "Wallace", "Ewing", "Howard"], style: "Block Parties & Offensive Boards" },
  { id: "fast_demons", name: "Fast Break Demons", level: "Medium", tags: ["Morant", "Fox", "Westbrook"], style: "Coast-to-Coast Speeds & Layups" },
  { id: "midrange_snipers", name: "Mid-Range Snipers", level: "Medium", tags: ["DeRozan", "Aldridge", "Pierce", "Wade"], style: "Turnaround Jumper Aesthetics" },
  { id: "euro_elite", name: "Euro League Giants", level: "Hard", tags: ["Jokic", "Doncic", "Sabonis", "Porzingis"], style: "Passing IQ & Faceup Bigs" },
  { id: "def_wall", name: "Defensive Steel Wall", level: "Hard", tags: ["Caruso", "Dort", "Smart", "Gobert"], style: "Full Court Press & Steals" },
  { id: "point_gods", name: "Point Guard Wizards", level: "Medium", tags: ["Nash", "Paul", "Stockton", "Kidd"], style: "Elite Playmaking & Direct Assists" },
  { id: "bounce_bros", name: "High Flying Bounce", level: "Easy", tags: ["Carter", "LaVine", "Gordon"], style: "Spectacular Dunks Only" },
  { id: "grit_n_grind", name: "Grit and Grind Grizz", level: "Medium", tags: ["Conley", "Randolph", "Gasol"], style: "Muck Up the Play & Offense boards" },
  { id: "sonics96", name: "1996 SuperSonics", level: "Hard", tags: ["Payton", "Kemp", "Schrempf"], style: "Alley-Oops & Full Court Traps" },
  { id: "sixers83", name: "1983 Sixers", level: "Hard", tags: ["Malone", "Erving", "Cheeks"], style: "Physical Rebounding & Slashing" },
  { id: "knicks94", name: "1994 Knicks", level: "Medium", tags: ["Ewing", "Starks", "Oakley"], style: "Physical Paints & Double Teams" },
  { id: "blazers77", name: "1977 Trail Blazers", level: "Medium", tags: ["Walton", "Lucas", "Hollins"], style: "Pivote Outlet Passes & Rebounds" },
  { id: "bullets78", name: "1978 Bullets", level: "Easy", tags: ["Hayes", "Dandridge", "Unseld"], style: "Two-Handed Chest Rebounds & Hooks" },
  { id: "phx93", name: "1993 Suns", level: "Medium", tags: ["Barkley", "Johnson", "Majerle"], style: "High-Energy Post & Spot up Threes" },
  { id: "pacers00", name: "2000 Pacers", level: "Easy", tags: ["Miller", "Rose", "Smits"], style: "Off-screen curling Threes" },
  { id: "nets02", name: "2002 Nets", level: "Easy", tags: ["Kidd", "Martin", "Jefferson"], style: "Full Court breakaways" },
  { id: "suns05", name: "2005 Suns (Seven Seconds)", level: "Hard", tags: ["Nash", "Stoudemire", "Marion"], style: "7 Seconds or Less Pick-N-Roll" },
  { id: "lakers09", name: "2009 Lakers", level: "Hard", tags: ["Kobe", "Gasol", "Odom", "Fisher"], style: "Triangle Offense & Isolation Shot" },
  { id: "thunder12", name: "2012 Thunder", level: "Hard", tags: ["Durant", "Westbrook", "Harden", "Ibaka"], style: "Isolating Young Heat Score" },
  { id: "wolves24", name: "2024 Timberwolves", level: "Medium", tags: ["Edwards", "Towns", "Gobert"], style: "Perimeter Clamps & Rim Protection" },
  { id: "knicks25", name: "2025 Knicks", level: "Medium", tags: ["Brunson", "Towns", "Hart"], style: "Hustle Rebounds & Drive-N-Kicks" },
  { id: "clippers20", name: "2020 Clippers", level: "Medium", tags: ["Leonard", "George", "Harrell"], style: "Physical Midranges & Offbench scoring" },
  { id: "all_legends", name: "Hall of Fame Legends", level: "Legend", tags: ["Jordan", "Kobe", "LeBron", "Shaq", "Magic"], style: "Pure Legend Tier Mastery" },
  { id: "bench_warmers", name: "Undrafted Scrappers", level: "Easy", tags: ["Kerr", "Fisher", "Caruso"], style: "Fundamental Motion Basketball" }
];

