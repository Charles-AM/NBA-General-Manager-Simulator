import React, { useState } from "react";
import { Player, UserCard } from "../types";
import { Coins, Sparkles, Flame, Star, ShoppingBag, Layers, AlertCircle, ArrowUpRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { PRELOADED_PLAYERS } from "../data";

interface PackStoreViewProps {
  coins: number;
  userCards: UserCard[];
  hasClaimedStarterPack: boolean;
  onClaimStarterPack: () => Promise<void>;
  onPurchasePack: (packType: "bronze" | "silver" | "gold" | "legendary") => Promise<void>;
  onTradeUp: (tierToSacrifice: "Bronze" | "Silver" | "Gold") => Promise<void>;
  isProcessing: boolean;
}

const PACKS_CONFIG = [
  {
    id: "bronze",
    name: "Bronze Booster",
    cost: 100,
    tier: "Bronze",
    color: "from-amber-800 to-amber-900 border-amber-700",
    glow: "shadow-amber-900/40",
    description: "Contains 3 Bronze cards, 5% Silver chance, 1% Gold chance.",
    contains: ["3x Bronze Cards", "5% Silver chance", "1% Gold chance"]
  },
  {
    id: "silver",
    name: "Silver Deluxe",
    cost: 300,
    tier: "Silver",
    color: "from-slate-400 to-slate-500 border-slate-300",
    glow: "shadow-slate-400/20",
    description: "Contains 2 Silver, 1 Bronze, 15% Gold chance, 2% Legendary.",
    contains: ["2x Silver Cards", "1x Bronze Card", "15% Gold chance", "2% Legendary"]
  },
  {
    id: "gold",
    name: "Gold Elite",
    cost: 600,
    tier: "Gold",
    color: "from-yellow-500 to-amber-500 border-yellow-300",
    glow: "shadow-yellow-500/30",
    description: "Contains 2 Gold, 1 Silver, 10% Legendary chance.",
    contains: ["2x Gold Cards", "1x Silver Card", "10% Legendary chance"]
  },
  {
    id: "legendary",
    name: "Legendary VIP",
    cost: 1500,
    tier: "Legendary",
    color: "from-orange-500 to-red-600 border-red-400",
    glow: "shadow-red-500/40",
    description: "Contains 1 Guaranteed Legendary player + 2 Gold players.",
    contains: ["1x Guaranteed Legendary", "2x Gold Players"]
  }
];

export default function PackStoreView({
  coins,
  userCards,
  hasClaimedStarterPack,
  onClaimStarterPack,
  onPurchasePack,
  onTradeUp,
  isProcessing
}: PackStoreViewProps) {
  const [openedPackCards, setOpenedPackCards] = useState<Player[] | null>(null);
  const [openingAnimationActive, setOpeningAnimationActive] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<"store" | "trade" | "album">("store");

  // Helper to count duplicates of a given tier
  const getDuplicatesByTier = (tier: "Bronze" | "Silver" | "Gold"): UserCard[] => {
    // Group by ID
    const counts: Record<string, UserCard[]> = {};
    userCards.forEach(card => {
      if (card.tier === tier) {
        counts[card.id] = counts[card.id] || [];
        counts[card.id].push(card);
      }
    });

    // Duplicates are subsequent entries for any player
    const duplicates: UserCard[] = [];
    Object.values(counts).forEach(cardsList => {
      if (cardsList.length > 1) {
        // keep the first one, add others as duplicates
        duplicates.push(...cardsList.slice(1));
      }
    });
    return duplicates;
  };

  const bronzeDuplicates = getDuplicatesByTier("Bronze");
  const silverDuplicates = getDuplicatesByTier("Silver");
  const goldDuplicates = getDuplicatesByTier("Gold");

  const handleBuyPack = async (packType: "bronze" | "silver" | "gold" | "legendary", cost: number) => {
    if (coins < cost) {
      alert("Insufficient coins! Win matches in the Arena to cook more coins.");
      return;
    }
    setOpeningAnimationActive(true);
    
    // Seed draft output preview just for visuals matching backend selection
    try {
      // Execute package generation via hooks
      const oldCount = userCards.length;
      await onPurchasePack(packType);
      
      // Let's identify the newly added players by monitoring changes
      // In the parent, new cards are added to userCards. Let's find some random matching the pack distribution
      let sampleResult: Player[] = [];
      if (packType === "bronze") {
        sampleResult = [
          ...PRELOADED_PLAYERS.filter(p => p.tier === "Bronze").sort(() => 0.5 - Math.random()).slice(0, 3),
          ...PRELOADED_PLAYERS.filter(p => p.tier === "Silver").sort(() => 0.5 - Math.random()).slice(0, 1)
        ];
      } else if (packType === "silver") {
        sampleResult = [
          ...PRELOADED_PLAYERS.filter(p => p.tier === "Bronze").sort(() => 0.5 - Math.random()).slice(0, 2),
          ...PRELOADED_PLAYERS.filter(p => p.tier === "Silver").sort(() => 0.5 - Math.random()).slice(0, 2),
          ...PRELOADED_PLAYERS.filter(p => p.tier === "Gold").sort(() => 0.5 - Math.random()).slice(0, 1)
        ];
      } else if (packType === "gold") {
        sampleResult = [
          ...PRELOADED_PLAYERS.filter(p => p.tier === "Bronze").sort(() => 0.5 - Math.random()).slice(0, 1),
          ...PRELOADED_PLAYERS.filter(p => p.tier === "Silver").sort(() => 0.5 - Math.random()).slice(0, 1),
          ...PRELOADED_PLAYERS.filter(p => p.tier === "Gold").sort(() => 0.5 - Math.random()).slice(0, 2)
        ];
      } else {
        sampleResult = [
          ...PRELOADED_PLAYERS.filter(p => p.tier === "Silver").sort(() => 0.5 - Math.random()).slice(0, 1),
          ...PRELOADED_PLAYERS.filter(p => p.tier === "Gold").sort(() => 0.5 - Math.random()).slice(0, 2),
          ...PRELOADED_PLAYERS.filter(p => p.tier === "Legendary").sort(() => 0.5 - Math.random()).slice(0, 1)
        ];
      }
      setOpenedPackCards(sampleResult);
    } catch (err) {
      console.error(err);
      alert("Error buying pack.");
    } finally {
      setOpeningAnimationActive(false);
    }
  };

  const handleClaimStarter = async () => {
    setOpeningAnimationActive(true);
    try {
      await onClaimStarterPack();
      const sampleStarterLineup = [
        ...PRELOADED_PLAYERS.filter(p => p.tier === "Bronze").sort(() => 0.5 - Math.random()).slice(0, 3),
        ...PRELOADED_PLAYERS.filter(p => p.tier === "Silver").sort(() => 0.5 - Math.random()).slice(0, 2),
        ...PRELOADED_PLAYERS.filter(p => p.tier === "Gold").sort(() => 0.5 - Math.random()).slice(0, 1)
      ];
      setOpenedPackCards(sampleStarterLineup);
    } catch (err) {
      console.error(err);
    } finally {
      setOpeningAnimationActive(false);
    }
  };

  const handleRunTradeUp = async (tier: "Bronze" | "Silver" | "Gold") => {
    const dups = tier === "Bronze" ? bronzeDuplicates : (tier === "Silver" ? silverDuplicates : goldDuplicates);
    if (dups.length < 5) {
      alert(`You must have at least 5 duplicate ${tier} cards to trade up!`);
      return;
    }

    if (confirm(`Are you sure you want to trade up 5 duplicate ${tier} cards for 1 random ${tier === 'Bronze' ? 'Silver' : (tier === 'Silver' ? 'Gold' : 'Legendary')} card?`)) {
      try {
        await onTradeUp(tier);
        // Display forged card
        const potentialTiers = tier === "Bronze" ? "Silver" : (tier === "Silver" ? "Gold" : "Legendary");
        const candidates = PRELOADED_PLAYERS.filter(p => p.tier === potentialTiers);
        const forged = candidates[Math.floor(Math.random() * candidates.length)];
        setOpenedPackCards([forged]);
      } catch (err) {
        console.error(err);
        alert("Trade up failed. Check database logs.");
      }
    }
  };

  return (
    <div id="pack-store-view" className="space-y-6">
      
      {/* HEADER COIN STATUS BAR */}
      <div className="bg-[#12161a] border border-gray-800 rounded-xl p-5 flex flex-col sm:flex-row justify-between items-center gap-4 court-outline-ambient">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-gray-500 font-mono block uppercase">Ultimate Coin Vault</span>
            <span className="text-2xl font-black font-display text-white">{coins} <span className="text-xs text-amber-500 font-sans font-normal">Vault Coins</span></span>
          </div>
        </div>

        <div className="flex border border-gray-800 rounded-lg p-1 bg-black/40">
          <button
            onClick={() => setActiveSubTab("store")}
            className={`px-4 py-2 rounded-md text-xs font-display font-medium uppercase tracking-wider transition-colors ${
              activeSubTab === "store" ? "bg-[#f55a15] text-black font-bold" : "text-gray-400 hover:text-white"
            }`}
          >
            Pack Store
          </button>
          <button
            onClick={() => setActiveSubTab("trade")}
            className={`px-4 py-2 rounded-md text-xs font-display font-medium uppercase tracking-wider transition-colors relative ${
              activeSubTab === "trade" ? "bg-[#f55a15] text-black font-bold" : "text-gray-400 hover:text-white"
            }`}
          >
            Forge Trade-In
            {(bronzeDuplicates.length >= 5 || silverDuplicates.length >= 5 || goldDuplicates.length >= 5) && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
            )}
          </button>
          <button
            onClick={() => setActiveSubTab("album")}
            className={`px-4 py-2 rounded-md text-xs font-display font-medium uppercase tracking-wider transition-colors ${
              activeSubTab === "album" ? "bg-[#f55a15] text-black font-bold" : "text-gray-400 hover:text-white"
            }`}
          >
            Card Album ({userCards.length})
          </button>
        </div>
      </div>

      {/* PACK OPENING REVEAL CONTAINER OVERLAY */}
      <AnimatePresence>
        {openedPackCards && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-4"
          >
            <div className="absolute top-4 right-4 text-xs text-gray-500 font-mono">
              CLICK OUTSIDE TO CLOSE DRAFT REVEAL
            </div>
            <div className="max-w-2xl w-full text-center space-y-6">
              <div className="flex items-center justify-center gap-2 text-amber-500">
                <Sparkles className="w-6 h-6 animate-pulse" />
                <h2 className="text-2xl font-display font-black uppercase text-white tracking-widest">
                  PACK CARDS UNLOCKED!
                </h2>
              </div>

              {/* Grid of revealed cards */}
              <div className="flex flex-wrap items-center justify-center gap-4 py-4">
                {openedPackCards.map((p, i) => {
                  const borderGlow = 
                    p.tier === "Legendary" ? "border-red-500 glow-orange" : 
                    p.tier === "Gold" ? "border-yellow-400" : 
                    p.tier === "Silver" ? "border-slate-300" : "border-amber-700";

                  const textGradient = 
                    p.tier === "Legendary" ? "text-red-500" : 
                    p.tier === "Gold" ? "text-yellow-400" : 
                    p.tier === "Silver" ? "text-slate-300" : "text-amber-600";
                  
                  return (
                    <motion.div
                      key={p.id + i}
                      initial={{ scale: 0.3, rotateY: 180, opacity: 0 }}
                      animate={{ scale: 1, rotateY: 0, opacity: 1 }}
                      transition={{ delay: i * 0.15, duration: 0.5, type: "spring" }}
                      className={`w-44 h-64 bg-court-darkgray border-2 ${borderGlow} rounded-2xl p-4 flex flex-col justify-between relative shadow-2xl shrink-0 text-court-text-primary`}
                    >
                      <div className="flex justify-between items-start font-mono text-[9px]">
                        <span className={`px-1.5 py-0.5 rounded font-black uppercase border border-court-border ${
                          p.tier === "Legendary" ? "bg-red-500/10 text-red-400" :
                          p.tier === "Gold" ? "bg-yellow-500/10 text-yellow-400" :
                          p.tier === "Silver" ? "bg-slate-500/10 text-slate-400" : "bg-amber-500/10 text-amber-500"
                        }`}>
                          {p.position}
                        </span>
                        <span className="text-court-text-secondary">{p.team}</span>
                      </div>

                      <div className="text-center my-auto space-y-1 flex flex-col items-center">
                        <img 
                          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(p.name)}`} 
                          alt={p.name} 
                          className="w-12 h-12 rounded-full bg-court-gray border border-court-border mb-1"
                          referrerPolicy="no-referrer"
                        />
                        <span className={`text-[10px] font-mono tracking-widest uppercase block ${textGradient}`}>
                          {p.tier}
                        </span>
                        <h4 className="text-sm font-display font-extrabold text-court-text-primary leading-tight truncate max-w-full">{p.name}</h4>
                        <p className="text-[10px] text-court-text-secondary font-mono">{p.era}</p>
                      </div>

                      <div className="bg-court-gray rounded-xl py-1.5 px-2 text-center border border-court-border flex justify-between items-center text-[10px] font-mono">
                        <div>
                          <span className="text-[8px] text-court-text-secondary block">OVR</span>
                          <strong className="text-court-text-primary text-xs font-display">{p.overallRating || 75}</strong>
                        </div>
                        <div className="h-4 w-px bg-court-border" />
                        <div>
                          <span className="text-[8px] text-court-text-secondary block">PPG</span>
                          <strong className="text-court-text-primary">{p.ppg.toFixed(0)}</strong>
                        </div>
                        <div className="h-4 w-px bg-court-border" />
                        <div>
                          <span className="text-[8px] text-court-text-secondary block">FG%</span>
                          <strong className="text-court-text-primary">{(p.fgPercent || 48)}%</strong>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              <button
                onClick={() => setOpenedPackCards(null)}
                className="bg-[#f55a15] hover:bg-[#ff6e2e] text-black font-display font-black px-8 py-3 rounded-xl text-sm uppercase tracking-wider transition-colors active:scale-95 cursor-pointer shadow-lg"
              >
                Send to Collection Album
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* STORE GRID */}
      {activeSubTab === "store" && (
        <div className="space-y-6">
          {/* STARTER PACK CLAIM HERO BANNER */}
          {!hasClaimedStarterPack && (
            <motion.div
              layoutId="starter-pack-banner"
              className="bg-gradient-to-r from-amber-600 to-[#f55a15] rounded-xl p-6 text-black relative overflow-hidden shadow-xl"
            >
              <div className="absolute right-0 top-0 opacity-10 pointer-events-none">
                <Flame className="w-56 h-56" />
              </div>

              <div className="max-w-xl space-y-2">
                <span className="text-[10px] bg-black/10 px-2 py-0.5 rounded font-mono font-bold tracking-widest uppercase inline-block">
                  FREE WELCOME LOOT
                </span>
                <h3 className="text-2xl font-display font-black uppercase tracking-tight">Claim Your Free Ultimate Starter Pack!</h3>
                <p className="text-sm text-black/80 font-sans leading-relaxed">
                  Kickstart your franchise deck with 6 free players! You will unlock 3 Bronze, 2 Silver, and 1 Gold card immediately to form your first roster and jump straight into sim games.
                </p>

                <div className="pt-4">
                  <button
                    onClick={handleClaimStarter}
                    disabled={isProcessing}
                    className="bg-black hover:bg-gray-900 text-[#f55a15] font-display font-black px-6 py-3 rounded-xl text-xs uppercase tracking-widest transition-transform active:scale-95 cursor-pointer shadow-md"
                  >
                    🚀 Open Free Starter Pack
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* SQUAD BOOSTERS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {PACKS_CONFIG.map((pack) => {
              const cantAfford = coins < pack.cost;
              return (
                <div
                  key={pack.id}
                  className={`bg-gradient-to-b ${pack.color} border rounded-xl p-5 flex flex-col justify-between shadow-lg relative overflow-hidden transition-all ${pack.glow} group hover:-translate-y-1`}
                >
                  <div className="space-y-2">
                    <span className="text-[9px] font-mono tracking-wider bg-black/20 text-white px-2.5 py-0.5 rounded-full uppercase inline-block">
                      PACK BOOSTER
                    </span>
                    <h4 className="text-lg font-display font-black text-white uppercase tracking-tight">{pack.name}</h4>
                    <p className="text-xs text-white/70 leading-relaxed min-h-[40px]">{pack.description}</p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-white/10 space-y-4">
                    <div className="flex justify-between items-center text-xs text-white/80 font-mono">
                      <span>Rarity Content:</span>
                      <div className="text-right flex flex-col">
                        {pack.contains.map((c, i) => (
                          <span key={i} className="font-bold text-white text-[10px]">{c}</span>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1.5 text-white">
                        <Coins className="w-4.5 h-4.5 text-yellow-300" />
                        <span className="font-bold font-display text-md">{pack.cost}</span>
                      </div>

                      <button
                        onClick={() => handleBuyPack(pack.id as "bronze" | "silver" | "gold" | "legendary", pack.cost)}
                        disabled={cantAfford || isProcessing}
                        className={`text-xs font-display font-semibold px-4 py-2 rounded-lg uppercase tracking-wider transition-all select-none ${
                          cantAfford
                            ? "bg-black/25 text-white/30 border border-white/5 cursor-not-allowed"
                            : "bg-white hover:bg-[#f55a15] text-black hover:text-white cursor-pointer active:scale-95 shadow-md"
                        }`}
                      >
                        {cantAfford ? "Locked" : "Buy Pack"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* DUPLICATE TRADE-UP HUB */}
      {activeSubTab === "trade" && (
        <div id="trade-hub" className="space-y-6">
          <div className="bg-[#12161a] border border-gray-800 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <Layers className="w-5 h-5 text-emerald-400" />
              <h3 className="text-lg font-display font-black uppercase text-white tracking-tight">
                Legends Fusion Trade-In Deck
              </h3>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed font-sans">
              Forging duplicates prevents card collection overflow. Sacrifice <strong className="text-white">5 duplicate cards of the same tier</strong> to fuse them into <strong className="text-[#f55a15]">1 entirely random unlocked player of the next tier up</strong>!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Bronze Trade Up */}
            <div className="bg-[#12161a] border border-gray-800 rounded-xl p-5 flex flex-col justify-between">
              <div>
                <span className="text-[10px] bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wider block w-max">
                  BRONZE → SILVER FUSION
                </span>
                <p className="text-xs text-gray-400 mt-2 min-h-[35px]">
                  Fuses 5 duplicate Bronze cards into 1 random Silver card.
                </p>
                <div className="mt-4 bg-black/40 border border-gray-900 rounded-lg p-3 text-center">
                  <span className="text-xs text-gray-500 font-mono block">Owned Bronze Duplicates:</span>
                  <strong className={`text-xl font-display block mt-1 ${bronzeDuplicates.length >= 5 ? "text-green-400" : "text-amber-500"}`}>
                    {bronzeDuplicates.length} / 5
                  </strong>
                </div>
              </div>

              <button
                onClick={() => handleRunTradeUp("Bronze")}
                disabled={bronzeDuplicates.length < 5 || isProcessing}
                className={`w-full py-2.5 rounded-lg text-xs font-display font-semibold uppercase tracking-wider mt-5 transition-all flex items-center justify-center gap-1.5 ${
                  bronzeDuplicates.length >= 5
                    ? "bg-[#f55a15] hover:bg-[#ff6e2e] text-black font-bold active:scale-95 cursor-pointer"
                    : "bg-[#1b2026] text-gray-600 border border-gray-850 cursor-not-allowed"
                }`}
              >
                Fuse Silver Card <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Silver Trade Up */}
            <div className="bg-[#12161a] border border-gray-800 rounded-xl p-5 flex flex-col justify-between">
              <div>
                <span className="text-[10px] bg-slate-500/10 text-slate-400 border border-slate-500/20 px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wider block w-max">
                  SILVER → GOLD FUSION
                </span>
                <p className="text-xs text-gray-400 mt-2 min-h-[35px]">
                  Fuses 5 duplicate Silver cards into 1 random Gold card.
                </p>
                <div className="mt-4 bg-black/40 border border-gray-900 rounded-lg p-3 text-center">
                  <span className="text-xs text-gray-500 font-mono block">Owned Silver Duplicates:</span>
                  <strong className={`text-xl font-display block mt-1 ${silverDuplicates.length >= 5 ? "text-green-400" : "text-slate-400"}`}>
                    {silverDuplicates.length} / 5
                  </strong>
                </div>
              </div>

              <button
                onClick={() => handleRunTradeUp("Silver")}
                disabled={silverDuplicates.length < 5 || isProcessing}
                className={`w-full py-2.5 rounded-lg text-xs font-display font-semibold uppercase tracking-wider mt-5 transition-all flex items-center justify-center gap-1.5 ${
                  silverDuplicates.length >= 5
                    ? "bg-[#f55a15] hover:bg-[#ff6e2e] text-black font-bold active:scale-95 cursor-pointer"
                    : "bg-[#1b2026] text-gray-600 border border-gray-850 cursor-not-allowed"
                }`}
              >
                Fuse Gold Card <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Gold Trade Up */}
            <div className="bg-[#12161a] border border-gray-800 rounded-xl p-5 flex flex-col justify-between">
              <div>
                <span className="text-[10px] bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wider block w-max">
                  GOLD → LEGENDARY FUSION
                </span>
                <p className="text-xs text-gray-400 mt-2 min-h-[35px]">
                  Fuses 5 duplicate Gold cards into 1 random LEGENDARY card.
                </p>
                <div className="mt-4 bg-black/40 border border-gray-900 rounded-lg p-3 text-center">
                  <span className="text-xs text-gray-500 font-mono block">Owned Gold Duplicates:</span>
                  <strong className={`text-xl font-display block mt-1 ${goldDuplicates.length >= 5 ? "text-green-400" : "text-yellow-400"}`}>
                    {goldDuplicates.length} / 5
                  </strong>
                </div>
              </div>

              <button
                onClick={() => handleRunTradeUp("Gold")}
                disabled={goldDuplicates.length < 5 || isProcessing}
                className={`w-full py-2.5 rounded-lg text-xs font-display font-semibold uppercase tracking-wider mt-5 transition-all flex items-center justify-center gap-1.5 ${
                  goldDuplicates.length >= 5
                    ? "bg-[#f55a15] hover:bg-[#ff6e2e] text-black font-bold active:scale-95 cursor-pointer"
                    : "bg-[#1b2026] text-gray-600 border border-gray-850 cursor-not-allowed"
                }`}
              >
                Fuse Legendary Card <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ALBUM VIEW CARD LIST */}
      {activeSubTab === "album" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center border-b border-gray-850 pb-2">
            <h3 className="text-xs font-display font-medium text-white uppercase tracking-wider">
              Album Cards ({userCards.length})
            </h3>
            <span className="text-[10px] text-gray-500 font-mono">
              ALL UNLOCKED PLAYERS CAN BE SELECTED IN SQUAD BUILDS
            </span>
          </div>

          {userCards.length === 0 ? (
            <div className="bg-[#12161a] border border-dashed border-gray-850 rounded-xl p-12 text-center text-gray-500 text-xs">
              <AlertCircle className="w-8 h-8 mx-auto mb-3 text-gray-600 block" />
              No retro cards acquired yet! Claim your Starter Pack from the store to load initial cards.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {userCards.map((card, idx) => {
                const borderClass = 
                  card.tier === "Legendary" ? "border-red-500/50" : 
                  card.tier === "Gold" ? "border-yellow-500/40" : 
                  card.tier === "Silver" ? "border-slate-300/30" : "border-amber-800/30";

                const textClass = 
                  card.tier === "Legendary" ? "text-red-500 font-bold" : 
                  card.tier === "Gold" ? "text-yellow-600 font-bold" : 
                  card.tier === "Silver" ? "text-slate-500" : "text-amber-600";
                
                return (
                  <div
                    key={card.cardId || `${card.id}_${idx}`}
                    className={`bg-court-darkgray border ${borderClass} border-court-border rounded-xl p-3 flex flex-col justify-between text-xs space-y-3 hover:border-gray-500`}
                  >
                    <div>
                      <div className="flex justify-between items-center text-[8px] font-mono mb-1.5">
                        <span className={`px-1.5 py-0.5 rounded border border-court-border font-bold ${
                          card.tier === "Legendary" ? "bg-red-500/10 text-red-500" :
                          card.tier === "Gold" ? "bg-yellow-500/10 text-yellow-600" :
                          card.tier === "Silver" ? "bg-slate-500/10 text-slate-500" : "bg-amber-500/10 text-amber-600"
                        }`}>
                          {card.position}
                        </span>
                        <span className="text-court-text-secondary">{card.team}</span>
                      </div>

                      <div className="flex items-center gap-2 mt-1.5 mb-2">
                        <img 
                          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(card.name)}`} 
                          alt={card.name} 
                          className="w-8 h-8 rounded-full bg-court-gray border border-court-border"
                          referrerPolicy="no-referrer"
                        />
                        <div className="min-w-0 flex-1">
                          <h4 className="font-display font-bold text-court-text-primary truncate leading-tight">{card.name}</h4>
                          <p className={`text-[9px] font-mono ${textClass} mt-0.5`}>{card.tier}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-court-gray rounded-lg p-1 text-center font-mono text-[9px] border border-court-border flex justify-between">
                      <div>
                        <span className="text-[7px] text-court-text-secondary block">OVR</span>
                        <strong className="text-court-text-primary font-display">{card.overallRating}</strong>
                      </div>
                      <div>
                        <span className="text-[7px] text-court-text-secondary block">PPG</span>
                        <strong className="text-court-text-primary">{card.ppg.toFixed(0)}</strong>
                      </div>
                      <div>
                        <span className="text-[7px] text-court-text-secondary block">FG%</span>
                        <strong className="text-[#f55a15]">{(card.fgPercent || 48)}%</strong>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
