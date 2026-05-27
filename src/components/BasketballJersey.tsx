import React from "react";

interface BasketballJerseyProps {
  name: string;
  tier?: string;
  className?: string;
}

export default function BasketballJersey({ name, tier, className = "w-12 h-12" }: BasketballJerseyProps) {
  // Normalize tier name
  const normalizedTier = tier?.toLowerCase();

  // Color configurations matching retro/classic NBA and modern palettes
  let jerseyColor = "#111827"; // Bronze/Default background
  let textColor = "#f3f4f6";
  let trimColor = "#f55a15";

  if (normalizedTier === "legendary" || normalizedTier === "legend") {
    // Retro Bulls / Blazers: High-contrast red and gold/black
    jerseyColor = "#dc2626"; // Vibrant Red
    textColor = "#f97316";   // Bold gold-orange
    trimColor = "#000000";   // Trim pitch-black
  } else if (normalizedTier === "gold") {
    // Royal Lakers / Warriors: Bold purple and rich gold yellow
    jerseyColor = "#5b21b6"; // Lakers Purple
    textColor = "#eab308";   // Golden Yellow
    trimColor = "#ffffff";   // Clean white highlight
  } else if (normalizedTier === "silver") {
    // Classics blue: royal blue/white and silver trims
    jerseyColor = "#1d4ed8"; // Classic Royal Blue
    textColor = "#ffffff";   // Sizzling white
    trimColor = "#60a5fa";   // Soft sky trim
  } else if (normalizedTier === "bronze" || normalizedTier === "starter" || normalizedTier === "bench") {
    // Celtics/Bucks: Hard court forest green and cream gold accents
    jerseyColor = "#065f46"; // Deep Emerald Green
    textColor = "#ffffff";   // Creamy White
    trimColor = "#fbbf24";   // Vibrant Amber
  }

  // Calculate deterministic jersey numbers (0 - 99) based on player's name character hash
  let hashVal = 0;
  for (let i = 0; i < name.length; i++) {
    hashVal += name.charCodeAt(i);
  }
  const jerseyNumber = hashVal % 100;

  // Extract initials (e.g. LeBron James -> LJ)
  const initials = name
    .split(/\s+/)
    .map((word) => word[0])
    .join("")
    .substring(0, 3)
    .toUpperCase();

  return (
    <svg
      viewBox="0 0 100 100"
      className={`${className} select-none shrink-0 drop-shadow-md`}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Standard Basketball Jersey Shape Outline */}
      <path
        d="M 24,20 
           C 28,8 34,8 41,13 
           C 43,7 57,7 59,13 
           C 66,8 72,8 76,20 
           L 78,42 
           C 78,47 73,49 73,53 
           L 73,88 
           L 27,88 
           L 27,53 
           C 27,49 22,47 22,42 
           Z"
        fill={jerseyColor}
        stroke={trimColor}
        strokeWidth="3.5"
        strokeLinejoin="round"
      />

      {/* Stylized collar V-neck */}
      <path
        d="M 41,13 C 44,20 56,20 59,13"
        fill="none"
        stroke={trimColor}
        strokeWidth="3.5"
        strokeLinecap="round"
      />

      {/* Shoulder strap sleeve lines */}
      <path
        d="M 24,20 C 27,16 28,26 22,42"
        fill="none"
        stroke={trimColor}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M 76,20 C 73,16 72,26 78,42"
        fill="none"
        stroke={trimColor}
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Dynamic Jersey Side Stripes */}
      <path
        d="M 28,55 L 28,85"
        stroke={trimColor}
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.6"
      />
      <path
        d="M 72,55 L 72,85"
        stroke={trimColor}
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.6"
      />

      {/* Player Initials Arched Text */}
      <text
        x="50"
        y="35"
        fill={textColor}
        fontSize="8.5"
        fontWeight="bold"
        fontFamily="sans-serif"
        textAnchor="middle"
        letterSpacing="0.8"
      >
        {initials}
      </text>

      {/* Player Decoded Jersey Number */}
      <text
        x="50"
        y="60"
        fill={textColor}
        fontSize="25"
        fontWeight="900"
        fontFamily="sans-serif"
        textAnchor="middle"
        dominantBaseline="middle"
      >
        {jerseyNumber}
      </text>
    </svg>
  );
}
