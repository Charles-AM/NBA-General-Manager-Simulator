import { useState, useEffect } from "react";
import {
  auth,
  db,
  handleFirestoreError,
  OperationType
} from "./firebase";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
  signInAnonymously
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  deleteDoc
} from "firebase/firestore";
import { Player, GameResult, SavedTeam, UserProfile, UserCard, CareerSave, CareerChallenge } from "./types";
import { PRELOADED_PLAYERS } from "./data";

// Subcomponents import
import SearchPlayerCard from "./components/SearchPlayerCard";
import RosterView from "./components/RosterView";
import SimulationView from "./components/SimulationView";
import HistoryList from "./components/HistoryList";
import LeadersView from "./components/LeadersView";
import PackStoreView from "./components/PackStoreView";
import CareerSavesHub from "./components/CareerSavesHub";

// Lucide icons
import {
  Shield,
  Zap,
  History,
  Award,
  LogOut,
  Sparkles,
  Search,
  UserCheck,
  Flame,
  User as UserIcon,
  HelpCircle,
  FolderSync,
  Moon,
  Sun,
  Coins,
  Settings,
  X,
  Plus,
  Trash2,
  VolumeX,
  Volume2,
  Play,
  Check,
  ChevronRight,
  ChevronLeft,
  Users as Users2,
  Trophy,
  Sliders,
  ArrowLeft
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [tab, setTab] = useState<"draft" | "packs" | "arena" | "history" | "leaders" | "settings">("draft");
  const [previousTab, setPreviousTab] = useState<"draft" | "packs" | "arena" | "history" | "leaders" | "settings">("draft");

  const handleSetTab = (newTab: "draft" | "packs" | "arena" | "history" | "leaders" | "settings") => {
    if (tab !== "settings") {
      setPreviousTab(tab);
    }
    setTab(newTab);
  };

  // Roster States
  const [teamName, setTeamName] = useState("My Retro Ballers");
  const [ultimateStarters, setUltimateStarters] = useState<Player[]>([]);
  const [ultimateBench, setUltimateBench] = useState<Player[]>([]);
  const [freeStarters, setFreeStarters] = useState<Player[]>([]);
  const [freeBench, setFreeBench] = useState<Player[]>([]);
  const [activeGameMode, setActiveGameMode] = useState<"free" | "ultimate">("ultimate");
  const [modeSelected, setModeSelected] = useState<boolean>(false);

  // Sounds & UI layout states
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);

  const starters = activeGameMode === "free" ? freeStarters : ultimateStarters;
  const bench = activeGameMode === "free" ? freeBench : ultimateBench;

  // Simulation archives
  const [games, setGames] = useState<GameResult[]>([]);
  const [gamesLoading, setGamesLoading] = useState(false);
  const [savingRecord, setSavingRecord] = useState(false);

  // Multi-Team states
  const [savedTeams, setSavedTeams] = useState<SavedTeam[]>([]);
  const [isSaveLoading, setIsSaveLoading] = useState(false);

  // Career Tracker States
  const [wins, setWins] = useState(0);
  const [losses, setLosses] = useState(0);
  const [totalMargin, setTotalMargin] = useState(0);

  // Multi-Save Career file system states
  const [careerSaves, setCareerSaves] = useState<CareerSave[]>([]);
  const [activeSaveId, setActiveSaveId] = useState<string | null>(null); // e.g. "save_0", "save_1", "save_2" or null
  const [activeSave, setActiveSave] = useState<CareerSave | null>(null);
  const [loadingSaves, setLoadingSaves] = useState(false);

  // Active save mirrors for high responsivity:
  const [division, setDivision] = useState<number>(0); // 0 = Rookie, 1 = Pro, etc.
  const [seasonNumber, setSeasonNumber] = useState<number>(1);
  const [seasonWins, setSeasonWins] = useState<number>(0);
  const [seasonLosses, setSeasonLosses] = useState<number>(0);
  const [seasonGamesPlayed, setSeasonGamesPlayed] = useState<number>(0);
  const [winStreak, setWinStreak] = useState<number>(0);
  const [lastFiveGames, setLastFiveGames] = useState<("W" | "L")[]>([]);
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>([]);
  const [challenges, setChallenges] = useState<CareerChallenge[]>([]);
  const [injuriesEnabled, setInjuriesEnabled] = useState<boolean>(true);

  // Popups/notifications alerts:
  const [showSeasonRecap, setShowSeasonRecap] = useState<any | null>(null);
  const [showAchievementToast, setShowAchievementToast] = useState<string | null>(null);

  // Guest Merging states
  const [showMergePrompt, setShowMergePrompt] = useState(false);
  const [guestUidToMerge, setGuestUidToMerge] = useState<string | null>(null);
  const [mergingInProcess, setMergingInProcess] = useState(false);

  // Ultimate Team collection states
  const [coins, setCoins] = useState(500);
  const [hasClaimedStarterPack, setHasClaimedStarterPack] = useState(false);
  const [userCards, setUserCards] = useState<UserCard[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Theme and settings states
  const [theme] = useState<"dark">("dark");
  const [settingsStatusMessage, setSettingsStatusMessage] = useState<string | null>(null);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState("");

  useEffect(() => {
    // Always enforce dark theme
    document.documentElement.classList.add("dark");
    document.documentElement.classList.remove("light");
  }, []);

  // Sync auth updates
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);

      if (currentUser) {
        // Look up previous guest ID in localStorage for possible merging
        const storedGuestUid = localStorage.getItem("nba_simulator_guest_uid");
        if (storedGuestUid && storedGuestUid !== currentUser.uid && !currentUser.isAnonymous) {
          setGuestUidToMerge(storedGuestUid);
          setShowMergePrompt(true);
        } else if (currentUser.isAnonymous) {
          // If signed in anonymously, store uid to recognize guest session
          localStorage.setItem("nba_simulator_guest_uid", currentUser.uid);
        }

        // Hydrate from Firestore
        await loadUserData(currentUser);
        await loadGameRecords(currentUser.uid);
        await loadSavedTeams(currentUser.uid);
        await loadUserCards(currentUser.uid);
        await reloadCareerSaves(currentUser.uid);
      } else {
        // Reset states
        setUltimateStarters([]);
        setUltimateBench([]);
        setFreeStarters([]);
        setFreeBench([]);
        setGames([]);
        setSavedTeams([]);
        setUserCards([]);
        setTeamName("My Retro Ballers");
        setWins(0);
        setLosses(0);
        setTotalMargin(0);
        setCoins(500);
        setHasClaimedStarterPack(false);
        setActiveGameMode("ultimate");
        setShowMergePrompt(false);
        setGuestUidToMerge(null);
        setCareerSaves([]);
        setActiveSaveId(null);
        setActiveSave(null);
        setDivision(0);
        setSeasonNumber(1);
        setSeasonWins(0);
        setSeasonLosses(0);
        setSeasonGamesPlayed(0);
        setWinStreak(0);
        setLastFiveGames([]);
        setUnlockedAchievements([]);
        setChallenges([]);
      }
    });

    return () => unsubscribe();
  }, []);

  // Sync / write active career save file states dynamically
  const syncWithActiveCareerSave = async (updates: {
    coins?: number;
    hasClaimedStarterPack?: boolean;
    wins?: number;
    losses?: number;
    totalMargin?: number;
    division?: number;
    seasonNumber?: number;
    seasonWins?: number;
    seasonLosses?: number;
    seasonGamesPlayed?: number;
    teamName?: string;
    starters?: Player[];
    bench?: Player[];
    userCards?: UserCard[];
    lastFiveGames?: ("W" | "L")[];
    winStreak?: number;
    unlockedAchievements?: string[];
    challenges?: CareerChallenge[];
    injuriesEnabled?: boolean;
  }) => {
    // Stage 1: Update local mirrors
    if (updates.coins !== undefined) setCoins(updates.coins);
    if (updates.hasClaimedStarterPack !== undefined) setHasClaimedStarterPack(updates.hasClaimedStarterPack);
    if (updates.wins !== undefined) setWins(updates.wins);
    if (updates.losses !== undefined) setLosses(updates.losses);
    if (updates.totalMargin !== undefined) setTotalMargin(updates.totalMargin);
    if (updates.division !== undefined) setDivision(updates.division);
    if (updates.seasonNumber !== undefined) setSeasonNumber(updates.seasonNumber);
    if (updates.seasonWins !== undefined) setSeasonWins(updates.seasonWins);
    if (updates.seasonLosses !== undefined) setSeasonLosses(updates.seasonLosses);
    if (updates.seasonGamesPlayed !== undefined) setSeasonGamesPlayed(updates.seasonGamesPlayed);
    if (updates.teamName !== undefined) setTeamName(updates.teamName);
    if (updates.starters !== undefined) setUltimateStarters(updates.starters);
    if (updates.bench !== undefined) setUltimateBench(updates.bench);
    if (updates.userCards !== undefined) setUserCards(updates.userCards);
    if (updates.lastFiveGames !== undefined) setLastFiveGames(updates.lastFiveGames);
    if (updates.winStreak !== undefined) setWinStreak(updates.winStreak);
    if (updates.unlockedAchievements !== undefined) setUnlockedAchievements(updates.unlockedAchievements);
    if (updates.challenges !== undefined) setChallenges(updates.challenges);
    if (updates.injuriesEnabled !== undefined) setInjuriesEnabled(updates.injuriesEnabled);

    if (!user || !activeSaveId) return;

    // Stage 2: Write unified object representation to career_saves
    const saveDocRef = doc(db, "career_saves", `${user.uid}_${activeSaveId}`);
    const newestSave: CareerSave = {
      id: activeSaveId,
      userId: user.uid,
      saveName: activeSave?.saveName || `Season ${updates.seasonNumber !== undefined ? updates.seasonNumber : seasonNumber} Ballers`,
      coins: updates.coins !== undefined ? updates.coins : coins,
      hasClaimedStarterPack: updates.hasClaimedStarterPack !== undefined ? updates.hasClaimedStarterPack : hasClaimedStarterPack,
      wins: updates.wins !== undefined ? updates.wins : wins,
      losses: updates.losses !== undefined ? updates.losses : losses,
      totalMargin: updates.totalMargin !== undefined ? updates.totalMargin : totalMargin,
      division: updates.division !== undefined ? updates.division : division,
      seasonNumber: updates.seasonNumber !== undefined ? updates.seasonNumber : seasonNumber,
      seasonWins: updates.seasonWins !== undefined ? updates.seasonWins : seasonWins,
      seasonLosses: updates.seasonLosses !== undefined ? updates.seasonLosses : seasonLosses,
      seasonGamesPlayed: updates.seasonGamesPlayed !== undefined ? updates.seasonGamesPlayed : seasonGamesPlayed,
      teamName: updates.teamName !== undefined ? updates.teamName : teamName,
      starters: updates.starters !== undefined ? updates.starters : ultimateStarters,
      bench: updates.bench !== undefined ? updates.bench : ultimateBench,
      userCards: updates.userCards !== undefined ? updates.userCards : userCards,
      lastFiveGames: updates.lastFiveGames !== undefined ? updates.lastFiveGames : lastFiveGames,
      winStreak: updates.winStreak !== undefined ? updates.winStreak : winStreak,
      unlockedAchievements: updates.unlockedAchievements !== undefined ? updates.unlockedAchievements : unlockedAchievements,
      challenges: updates.challenges !== undefined ? updates.challenges : challenges,
      injuriesEnabled: updates.injuriesEnabled !== undefined ? updates.injuriesEnabled : injuriesEnabled,
      createdAt: activeSave?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      await setDoc(saveDocRef, newestSave);
      setActiveSave(newestSave);

      // Reload saves list silently in background
      const q = query(collection(db, "career_saves"), where("userId", "==", user.uid));
      const snap = await getDocs(q);
      const loaded: CareerSave[] = [];
      snap.forEach((d) => { loaded.push(d.data() as CareerSave); });
      loaded.sort((a,b) => a.id.localeCompare(b.id));
      setCareerSaves(loaded);
    } catch (err) {
      console.error("Failed to write career save updates:", err);
      handleFirestoreError(err, OperationType.WRITE, `career_saves/${user.uid}_${activeSaveId}`);
    }
  };

  const reloadCareerSaves = async (uid: string) => {
    setLoadingSaves(true);
    try {
      const q = query(collection(db, "career_saves"), where("userId", "==", uid));
      const snap = await getDocs(q);
      const loaded: CareerSave[] = [];
      snap.forEach((docSnap) => {
        loaded.push(docSnap.data() as CareerSave);
      });
      loaded.sort((a,b) => a.id.localeCompare(b.id));
      setCareerSaves(loaded);
    } catch (err) {
      console.error("Failed loading career saves:", err);
      handleFirestoreError(err, OperationType.LIST, "career_saves");
    } finally {
      setLoadingSaves(false);
    }
  };

  const handleLoadSave = async (saveSlotId: string) => {
    if (!user) return;
    try {
      setLoadingSaves(true);
      const saveDocRef = doc(db, "career_saves", `${user.uid}_${saveSlotId}`);
      const snap = await getDoc(saveDocRef);
      if (snap.exists()) {
        const s = snap.data() as CareerSave;
        setActiveSaveId(saveSlotId);
        setActiveSave(s);

        // Populate standard state variables to mirror active save
        setCoins(s.coins);
        setHasClaimedStarterPack(s.hasClaimedStarterPack);
        setWins(s.wins);
        setLosses(s.losses);
        setTotalMargin(s.totalMargin);
        setDivision(s.division);
        setSeasonNumber(s.seasonNumber);
        setSeasonWins(s.seasonWins);
        setSeasonLosses(s.seasonLosses);
        setSeasonGamesPlayed(s.seasonGamesPlayed);
        setTeamName(s.teamName);
        setUltimateStarters(s.starters || []);
        setUltimateBench(s.bench || []);
        setUserCards(s.userCards || []);
        setLastFiveGames(s.lastFiveGames || []);
        setWinStreak(s.winStreak || 0);
        setUnlockedAchievements(s.unlockedAchievements || []);
        setChallenges(s.challenges || []);
        setInjuriesEnabled(s.injuriesEnabled !== undefined ? s.injuriesEnabled : true);

        // Update mode states
        setModeSelected(true);
        setActiveGameMode("ultimate");

        // Set active window tab to draft
        setTab("draft");
      }
    } catch (err) {
      console.error("Failed to load save:", err);
      handleFirestoreError(err, OperationType.GET, `career_saves/${user.uid}_${saveSlotId}`);
    } finally {
      setLoadingSaves(false);
    }
  };

  const handleCreateNewSave = async (saveSlotId: string, customTeamName: string, physicalInjuriesToggled: boolean, starterCards: Player[]) => {
    if (!user) return;
    try {
      setLoadingSaves(true);

      // Map chosen starter cards into dynamic UserCards schema
      const mappedUserCards: UserCard[] = starterCards.map((p, idx) => {
        const cardUid = `card_${user.uid}_starter_${p.id}_${idx}_${Math.random().toString(36).substring(2, 6)}`;
        return {
          ...p,
          cardId: cardUid,
          userId: user.uid,
          dateAcquired: new Date().toISOString()
        } as UserCard;
      });

      // Auto-assign first lineup: first 5 starters, last 3 bench
      const startSquad = starterCards.slice(0, 5);
      const benchSquad = starterCards.slice(5, 8);

      const starterChallenges: CareerChallenge[] = [
        {
          id: "chal_pts",
          title: "Scoring Firepower",
          description: "Have any player score 40+ points in a single simulation game.",
          targetType: "points",
          targetValue: 40,
          rewardCoins: 150,
          completed: false
        },
        {
          id: "chal_diff",
          title: "Statement Win",
          description: "Defeat your rival by a 15+ score margin.",
          targetType: "win_by",
          targetValue: 15,
          rewardCoins: 200,
          completed: false
        },
        {
          id: "chal_ast",
          title: "Point General",
          description: "Get 10+ assists with your primary Point Guard in a match.",
          targetType: "assists",
          targetValue: 10,
          rewardCoins: 125,
          completed: false
        }
      ];

      const newSaveDoc: CareerSave = {
        id: saveSlotId,
        userId: user.uid,
        saveName: `Season 1 Ballers`,
        coins: 500,
        hasClaimedStarterPack: true,
        wins: 0,
        losses: 0,
        totalMargin: 0,
        division: 0,
        seasonNumber: 1,
        seasonWins: 0,
        seasonLosses: 0,
        seasonGamesPlayed: 0,
        teamName: customTeamName || "My Retro Ballers",
        starters: startSquad,
        bench: benchSquad,
        userCards: mappedUserCards,
        lastFiveGames: [],
        winStreak: 0,
        unlockedAchievements: [],
        challenges: starterChallenges,
        injuriesEnabled: physicalInjuriesToggled,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await setDoc(doc(db, "career_saves", `${user.uid}_${saveSlotId}`), newSaveDoc);
      setActiveSaveId(saveSlotId);
      setActiveSave(newSaveDoc);

      setCoins(500);
      setHasClaimedStarterPack(true);
      setWins(0);
      setLosses(0);
      setTotalMargin(0);
      setDivision(0);
      setSeasonNumber(1);
      setSeasonWins(0);
      setSeasonLosses(0);
      setSeasonGamesPlayed(0);
      setTeamName(newSaveDoc.teamName);
      setUltimateStarters(startSquad);
      setUltimateBench(benchSquad);
      setUserCards(mappedUserCards);
      setLastFiveGames([]);
      setWinStreak(0);
      setUnlockedAchievements([]);
      setChallenges(starterChallenges);
      setInjuriesEnabled(physicalInjuriesToggled);

      setModeSelected(true);
      setActiveGameMode("ultimate");

      await reloadCareerSaves(user.uid);
      setTab("draft");
    } catch (err) {
      console.error("Failed creating career save:", err);
      handleFirestoreError(err, OperationType.WRITE, `career_saves/${user.uid}_${saveSlotId}`);
    } finally {
      setLoadingSaves(false);
    }
  };

  const handleDeleteSaveFile = async (saveSlotId: string) => {
    if (!user) return;
    if (confirm("🚨 WARNING: Are you sure you want to permanently erase this career save? This will forever delete all rosters, collection cards, accumulated coins, and division levels!")) {
      try {
        setLoadingSaves(true);
        await deleteDoc(doc(db, "career_saves", `${user.uid}_${saveSlotId}`));
        if (activeSaveId === saveSlotId) {
          setActiveSaveId(null);
          setActiveSave(null);
          setCoins(500);
          setHasClaimedStarterPack(false);
          setUltimateStarters([]);
          setUltimateBench([]);
          setUserCards([]);
          setWins(0);
          setLosses(0);
          setTotalMargin(0);
          setDivision(0);
          setSeasonNumber(1);
          setSeasonWins(0);
          setSeasonLosses(0);
          setSeasonGamesPlayed(0);
          setWinStreak(0);
          setLastFiveGames([]);
          setUnlockedAchievements([]);
          setChallenges([]);
        }
        await reloadCareerSaves(user.uid);
      } catch (err) {
         console.error(err);
         handleFirestoreError(err, OperationType.DELETE, `career_saves/${user.uid}_${saveSlotId}`);
      } finally {
         setLoadingSaves(false);
      }
    }
  };

  // Fetch user profile and career wins/losses
  const loadUserData = async (currentUser: User) => {
    const path = `users/${currentUser.uid}`;
    try {
      const docRef = doc(db, "users", currentUser.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setTeamName(data.teamName || "My Retro Ballers");

        const freeSt = data.freeStarters || [];
        const freeBn = data.freeBench || [];
        const ultSt = data.starters || [];
        const ultBn = data.bench || [];

        setFreeStarters(freeSt);
        setFreeBench(freeBn);
        setUltimateStarters(ultSt);
        setUltimateBench(ultBn);

        setWins(data.wins || 0);
        setLosses(data.losses || 0);
        setTotalMargin(data.totalMargin || 0);
        setCoins(data.coins !== undefined ? data.coins : 500);
        setHasClaimedStarterPack(data.hasClaimedStarterPack || false);
        setActiveGameMode(data.activeGameMode || "ultimate");
      } else {
        // New profile initialization
        setWins(0);
        setLosses(0);
        setTotalMargin(0);
        setCoins(500);
        setHasClaimedStarterPack(false);
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, path);
    }
  };

  // Fetch collected cards
  const loadUserCards = async (uid: string) => {
    try {
      const q = query(collection(db, "player_collection"), where("userId", "==", uid));
      const snap = await getDocs(q);
      const loaded: UserCard[] = [];
      snap.forEach((docSnap) => {
        const data = docSnap.data();
        loaded.push({
          ...data,
          id: data.playerId || data.id,
          cardId: docSnap.id
        } as UserCard);
      });
      setUserCards(loaded);
    } catch (err) {
      console.error("Failed loading user cards album:", err);
    }
  };

  // Fetch saved named rosters
  const loadSavedTeams = async (uid: string) => {
    try {
      const q = query(collection(db, "saved_teams"), where("userId", "==", uid));
      const snap = await getDocs(q);
      const loaded: SavedTeam[] = [];
      snap.forEach((doc) => {
        loaded.push(doc.data() as SavedTeam);
      });
      setSavedTeams(loaded);
    } catch (err) {
      console.error("Failed loading user saved rosters:", err);
    }
  };

  // Fetch simulated matches from Firestore (/game_history path)
  const loadGameRecords = async (uid: string) => {
    const path = "game_history";
    setGamesLoading(true);
    try {
      const q = query(collection(db, path), where("userId", "==", uid));
      const querySnapshot = await getDocs(q);
      const loaded: GameResult[] = [];
      querySnapshot.forEach((doc) => {
        loaded.push(doc.data() as GameResult);
      });

      // Sort in-memory descending
      loaded.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      setGames(loaded);
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, path);
    } finally {
      setGamesLoading(false);
    }
  };

  // Persist current active team draft configuration to Firestore
  const saveActiveRosterDraft = async (
    uid: string,
    email: string | null,
    currentTeamName: string,
    st: Player[],
    bn: Player[],
    modeTarget: "free" | "ultimate"
  ) => {
    const path = `users/${uid}`;
    try {
      const payload: any = {
        uid,
        email: email || "anonymous_user",
        teamName: currentTeamName,
        wins,
        losses,
        totalMargin,
        coins,
        hasClaimedStarterPack,
        activeGameMode: modeTarget,
        updatedAt: new Date().toISOString()
      };

      if (modeTarget === "free") {
        payload.freeStarters = st;
        payload.freeBench = bn;
        payload.starters = ultimateStarters;
        payload.bench = ultimateBench;
      } else {
        payload.starters = st;
        payload.bench = bn;
        payload.freeStarters = freeStarters;
        payload.freeBench = freeBench;
      }

      await setDoc(doc(db, "users", uid), payload, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  };

  // Handle Save Named Custom Team (Max 5 Limit)
  const handleSaveTeam = async () => {
    if (!user) return;
    if (savedTeams.length >= 5) {
      alert("Maximum of 5 saved teams allowed! Please delete an existing saved team before adding a new one.");
      return;
    }

    setIsSaveLoading(true);
    const teamId = `team_${Date.now()}`;
    const nameToSave = teamName.trim() || "My Saved Franchise";

    try {
      const newTeamPayload: SavedTeam = {
        id: teamId,
        userId: user.uid,
        name: nameToSave,
        starters,
        bench,
        chemistryRating: 80,
        createdAt: new Date().toISOString()
      };

      await setDoc(doc(db, "saved_teams", teamId), newTeamPayload);
      setSavedTeams((prev) => [...prev, newTeamPayload]);
      alert(`"${nameToSave}" team drafted and saved successfully!`);
    } catch (err) {
      console.error("Error saving team to Firestore:", err);
      alert("Failed to save team roster. Check secure rules validation.");
    } finally {
      setIsSaveLoading(false);
    }
  };

  // Load a Saved Named team into active draft state
  const handleLoadTeam = async (team: SavedTeam) => {
    if (!user) return;
    setTeamName(team.name);
    if (activeGameMode === "free") {
      setFreeStarters(team.starters);
      setFreeBench(team.bench);
      await saveActiveRosterDraft(user.uid, user.email, team.name, team.starters, team.bench, "free");
    } else {
      setUltimateStarters(team.starters);
      setUltimateBench(team.bench);
      await saveActiveRosterDraft(user.uid, user.email, team.name, team.starters, team.bench, "ultimate");
    }
  };

  // Delete matching saved team
  const handleDeleteSavedTeam = async (teamId: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, "saved_teams", teamId));
      setSavedTeams((prev) => prev.filter((t) => t.id !== teamId));
    } catch (err) {
      console.error("Error deleting saved team roster:", err);
      alert("Failed to delete saved team.");
    }
  };

  // Persist completed game record to Firestore and update career records
  const handleSaveGameRecord = async (record: GameResult) => {
    if (!user) return;
    const path = `game_history/${record.id}`;
    setSavingRecord(true);

    try {
      // 1. Write game log matching game_history collection rules
      const finalRecord = {
        ...record,
        gameMode: activeGameMode
      };
      await setDoc(doc(db, "game_history", record.id), finalRecord);
      
      // Update locally
      setGames((prev) => [finalRecord, ...prev]);

      if (activeGameMode === "ultimate" && activeSaveId) {
        // Did user win
        const didWin = record.userScore > record.opponentScore;
        const margin = record.userScore - record.opponentScore;

        // Cumulative overall wins/losses
        const updatedWins = wins + (didWin ? 1 : 0);
        const updatedLosses = losses + (didWin ? 0 : 1);
        const updatedMargin = totalMargin + margin;

        // Streak status
        const nextStreak = didWin ? winStreak + 1 : 0;

        // 1. Play-To-Earn Coins Calculations
        const baseCoins = didWin ? 100 : 40;
        
        // Win streak bonus (+15 coins per streak win, capped at +75 coins)
        const streakBonus = didWin ? Math.min(75, winStreak * 15) : 0;
        
        // Division modifier (+10% multiplier per division level)
        const divisionMultiplier = 1.0 + (division * 0.1);
        
        // Underdog multiplier (up to +150 coins for beating stronger teams)
        const userStartersOvr = Math.round(ultimateStarters.reduce((acc, p) => acc + (p.overallRating || 70), 0) / Math.max(1, ultimateStarters.length));
        const estimateOppOvr = 75 + (division * 4) + (record.opponentScore > 100 ? 5 : 0);
        const diffOvr = estimateOppOvr - userStartersOvr;
        const underdogBonus = (didWin && diffOvr > 0) ? Math.min(150, diffOvr * 15) : 0;

        const calculatedEarned = Math.round((baseCoins + streakBonus + underdogBonus) * divisionMultiplier);
        
        // 2. Scan Career Challenges
        const currentChallenges = challenges.map(c => ({ ...c }));
        let extraChallengeCoins = 0;
        const newlyCompletedChallenges: string[] = [];

        currentChallenges.forEach(chal => {
          if (!chal.completed) {
            let meetsTarget = false;
            if (chal.targetType === "points") {
              const maxPoints = Math.max(...record.playerStats.map(ps => ps.points || 0), 0);
              if (maxPoints >= chal.targetValue) meetsTarget = true;
            } else if (chal.targetType === "win_by") {
              if (margin >= chal.targetValue) meetsTarget = true;
            } else if (chal.targetType === "assists") {
              const maxAssists = Math.max(...record.playerStats.map(ps => ps.assists || 0), 0);
              if (maxAssists >= chal.targetValue) meetsTarget = true;
            }

            if (meetsTarget) {
              chal.completed = true;
              extraChallengeCoins += chal.rewardCoins;
              newlyCompletedChallenges.push(chal.title);
            }
          }
        });

        const totalEarnedCoins = calculatedEarned + extraChallengeCoins;
        const updatedCoins = Math.min(99999, coins + totalEarnedCoins);

        // 3. Sliding Window & Division Promotion/Relegation checks
        const updatedLastFive = [...lastFiveGames, didWin ? "W" as const : "L" as const].slice(-5);
        let updatedDivision = division;
        let divisionNotification: "promoted" | "relegated" | null = null;
        let finalLastFive = updatedLastFive;

        if (updatedLastFive.length === 5) {
          const winCount = updatedLastFive.filter(g => g === "W").length;
          const lossCount = updatedLastFive.filter(g => g === "L").length;

          if (winCount >= 3 && division < 5) {
            updatedDivision = division + 1;
            divisionNotification = "promoted";
            finalLastFive = []; // Reset window context for freshness on next tier
          } else if (lossCount >= 4 && division > 0) {
            updatedDivision = division - 1;
            divisionNotification = "relegated";
            finalLastFive = []; // Reset window
          }
        }

        // 4. Physical Stamina Burn & Recover Rates
        // Starters drop 15-20%, Bench drop 5-10%, Inactives recover +75%
        const updatedCollection: UserCard[] = userCards.map(card => {
          const isStarter = ultimateStarters.some(p => p.id === card.id);
          const isBench = ultimateBench.some(p => p.id === card.id);
          
          let stam = card.stamina !== undefined ? card.stamina : 100;
          let recoveryGames = card.injuryRemainingGames || 0;
          let inType = card.injuryType || null;

          if (isStarter) {
            stam = Math.max(0, stam - (Math.floor(Math.random() * 6) + 15));
          } else if (isBench) {
            stam = Math.max(0, stam - (Math.floor(Math.random() * 6) + 5));
          } else {
            stam = Math.min(100, stam + 75);
          }

          // Injury recovery decay
          if (recoveryGames > 0) {
            recoveryGames = Math.max(0, recoveryGames - 1);
            if (recoveryGames === 0) {
              inType = null;
            }
          }

          return {
            ...card,
            stamina: stam,
            injuryRemainingGames: recoveryGames,
            injuryType: inType
          };
        });

        // 5. In-Game Injuries Processing
        // Apply simulator-raised active injuries
        const customInjuries = (finalRecord as any).gameInjuriesOccurred || [];
        const injuredNamesList: string[] = [];

        if (injuriesEnabled && customInjuries.length > 0) {
          customInjuries.forEach((report: any) => {
            // Find card with name matching report.name in updatedCollection
            const cardIdx = updatedCollection.findIndex(card => card.name.toLowerCase() === report.name.toLowerCase());
            if (cardIdx !== -1) {
              updatedCollection[cardIdx].injuryRemainingGames = report.games;
              updatedCollection[cardIdx].injuryType = report.type;
              injuredNamesList.push(`${report.name} (${report.type} - Out ${report.games} matches)`);
            }
          });
        }

        // Sync starters and bench with updated stamina and injury states
        const syncSquadWithCollection = (squad: Player[]) => {
          return squad.map(player => {
            const cardRepresentation = updatedCollection.find(c => c.id === player.id);
            if (cardRepresentation) {
              return {
                ...player,
                stamina: cardRepresentation.stamina,
                injuryRemainingGames: cardRepresentation.injuryRemainingGames,
                injuryType: cardRepresentation.injuryType
              };
            }
            return player;
          });
        };

        let updatedStarters = syncSquadWithCollection(ultimateStarters);
        let updatedBench = syncSquadWithCollection(ultimateBench);

        // 6. Scan Achievement Trophies
        const currentAchievements = [...unlockedAchievements];
        const newlyEarnedTrophies: string[] = [];
        
        const tryUnlock = (id: string, nameText: string) => {
          if (!currentAchievements.includes(id)) {
            currentAchievements.push(id);
            newlyEarnedTrophies.push(nameText);
          }
        };

        if (updatedWins >= 1) tryUnlock("first_win", "Inaugural Match Victory Medal");
        if (nextStreak >= 3) tryUnlock("streak_3", "Hot Heat Streak Token (3+ Streak)");
        if (updatedDivision >= 1) tryUnlock("division_pro", "Professional Bracket Banner");
        if (updatedDivision >= 4) tryUnlock("division_legend", "Legendary Conference Shield");
        if (updatedCoins >= 2500) tryUnlock("wealth_rich", "Franchise Golden Vault Treasury Key");
        if (userStartersOvr >= 85) tryUnlock("elite_squad_ovr", "Super Elite GM Crest (85+ OVR Starters)");

        // 7. Season Game count & End of Season Aging
        const nextSeasonGamesPlayed = seasonGamesPlayed + 1;
        let finalSeasonWins = seasonWins + (didWin ? 1 : 0);
        let finalSeasonLosses = seasonLosses + (didWin ? 0 : 1);
        let displayedSeasonNumber = seasonNumber;
        let seasonRecapReport: any | null = null;

        if (nextSeasonGamesPlayed >= 12) {
          // Season Completed! Award bonus matching active division bracket
          const divisionAwards = [200, 400, 700, 1100, 1600, 2500];
          const seasonAwardBonus = divisionAwards[division] || 300;
          const endSeasonCoins = Math.min(99999, updatedCoins + seasonAwardBonus);

          // Apply Physical Aging & Progressions
          const progressLog: string[] = [];
          
          updatedCollection.forEach(card => {
            const currentAge = card.age || 26;
            const nextAge = currentAge + 1;
            card.age = nextAge;

            if (nextAge < 25) {
              // Increase overall
              const growth = Math.floor(Math.random() * 3) + 1; // +1 to +3
              card.overallRating = Math.min(99, card.overallRating + growth);
              progressLog.push(`📈 ${card.name} aged to ${nextAge} and grew OVR by +${growth}! (OVR: ${card.overallRating})`);
            } else if (nextAge >= 33) {
              // Degradation with half rate protection for Legendary tier
              const randChance = Math.random();
              if (card.tier === "Legendary" && randChance > 0.5) {
                // Legendary avoids hit!
                progressLog.push(`🛡️ ${card.name} (${nextAge}) maintained elite status. (OVR: ${card.overallRating})`);
              } else {
                const decline = Math.floor(Math.random() * 2) + 1; // -1 to -2
                card.overallRating = Math.max(60, card.overallRating - decline);
                progressLog.push(`📉 ${card.name} aged to ${nextAge} and declined OVR by -${decline}. (OVR: ${card.overallRating})`);
              }
            } else {
              progressLog.push(`✨ ${card.name} aged to ${nextAge} and is in their absolute athletic prime!`);
            }
          });

          // Re-sync starters and bench ratings
          updatedStarters = syncSquadWithCollection(updatedStarters);
          updatedBench = syncSquadWithCollection(updatedBench);

          // Prepare final visual season wrap-up model state
          seasonRecapReport = {
            season: seasonNumber,
            wins: finalSeasonWins,
            losses: finalSeasonLosses,
            bonusReward: seasonAwardBonus,
            agedLogs: progressLog
          };

          // Reset season statistics
          displayedSeasonNumber = seasonNumber + 1;
          finalSeasonWins = 0;
          finalSeasonLosses = 0;
          
          // Trigger popups
          setTimeout(() => {
            setShowSeasonRecap(seasonRecapReport);
          }, 800);
        }

        // 8. Commit All calculations to Career Save
        await syncWithActiveCareerSave({
          coins: seasonRecapReport ? Math.min(99999, updatedCoins + seasonRecapReport.bonusReward) : updatedCoins,
          wins: updatedWins,
          losses: updatedLosses,
          totalMargin: updatedMargin,
          division: updatedDivision,
          seasonNumber: displayedSeasonNumber,
          seasonWins: finalSeasonWins,
          seasonLosses: finalSeasonLosses,
          seasonGamesPlayed: nextSeasonGamesPlayed >= 12 ? 0 : nextSeasonGamesPlayed,
          starters: updatedStarters,
          bench: updatedBench,
          userCards: updatedCollection,
          lastFiveGames: finalLastFive,
          winStreak: nextStreak,
          unlockedAchievements: currentAchievements,
          challenges: currentChallenges
        });

        // Trigger visual alerts
        let alertMsg = `MATCH CONCLUDED!\nCoins Gained: +${calculatedEarned} COINS.`;
        if (extraChallengeCoins > 0) {
          alertMsg += `\n🎯 CHALLENGES HIT: +${extraChallengeCoins} BONUS COINS! Completed: [${newlyCompletedChallenges.join(", ")}]`;
        }
        if (divisionNotification === "promoted") {
          alertMsg += `\n🏆 PROMOTED! You advanced to the ${[
            "Rookie", "Pro", "All-Star", "Superstar", "Legend", "GOAT"
          ][updatedDivision]} Arena League!`;
        } else if (divisionNotification === "relegated") {
          alertMsg += `\n⚠️ RELEGATED: You dropped to the ${[
            "Rookie", "Pro", "All-Star", "Superstar", "Legend", "GOAT"
          ][updatedDivision]} Arena League. Ensure key reserves have high stamina!`;
        }
        if (injuredNamesList.length > 0) {
          alertMsg += `\n💥 INJURIES REPORTED:\n${injuredNamesList.join("\n")}`;
        }
        if (newlyEarnedTrophies.length > 0) {
          setShowAchievementToast(newlyEarnedTrophies[0]);
          alertMsg += `\n🌟 TROPHY UNLOCKED: [${newlyEarnedTrophies.join(", ")}]`;
        }

        alert(alertMsg);
      } else {
        // Free practice mode: save record but no rewards/saves matches
        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          email: user.email || "anonymous_user",
          teamName,
          starters: ultimateStarters,
          bench: ultimateBench,
          freeStarters,
          freeBench,
          activeGameMode,
          updatedAt: new Date().toISOString()
        }, { merge: true });
        
        alert("Simulated Game Finished & Saved! In Free Draft Mode, stats are loaded but no Coins are earned.");
      }

    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    } finally {
      setSavingRecord(false);
    }
  };

  // Claim the Free Welcoming Starter Pack (3 Bronze, 3 Silver, 2 Gold)
  const handleClaimStarterPack = async () => {
    if (!user) {
      alert("ERROR: Please sign in (or click Guest Mode) before claiming free card packs!");
      return;
    }
    setIsProcessing(true);
    try {
      // Pick random preloaded players matching tier rules
      const bronzePool = PRELOADED_PLAYERS.filter(p => !p.overallRating || p.overallRating < 75);
      const silverPool = PRELOADED_PLAYERS.filter(p => p.overallRating && p.overallRating >= 75 && p.overallRating < 85);
      const goldPool = PRELOADED_PLAYERS.filter(p => p.overallRating && p.overallRating >= 85 && p.overallRating < 95);

      const drawnBronze = Array.from({ length: 3 }, () => bronzePool[Math.floor(Math.random() * bronzePool.length)]);
      const drawnSilver = Array.from({ length: 3 }, () => silverPool[Math.floor(Math.random() * silverPool.length)]);
      const drawnGold = Array.from({ length: 2 }, () => goldPool[Math.floor(Math.random() * goldPool.length)]);

      const drawn = [...drawnBronze, ...drawnSilver, ...drawnGold].filter(Boolean);

      // Write drawn collection to Firestore collection "player_collection"
      const batchPromises = drawn.map(async (p) => {
        const idStr = `card_${user.uid}_${p.id}_${Math.random().toString(36).substring(2, 6)}`;
        const ref = doc(db, "player_collection", idStr);
        await setDoc(ref, {
          id: idStr,
          userId: user.uid,
          playerId: p.id,
          name: p.name,
          team: p.team,
          position: p.position,
          era: p.era,
          ppg: p.ppg,
          apg: p.apg,
          rpg: p.rpg,
          fgPercent: p.fgPercent || 48,
          overallRating: p.overallRating || 72,
          tier: p.overallRating && p.overallRating >= 95 ? "Legendary" :
                p.overallRating && p.overallRating >= 85 ? "Gold" :
                p.overallRating && p.overallRating >= 75 ? "Silver" : "Bronze"
        });
      });

      await Promise.all(batchPromises);

      // Update Has Claimed in User Profile doc
      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email || "anonymous_user",
        teamName,
        starters,
        bench,
        wins,
        losses,
        totalMargin,
        coins,
        hasClaimedStarterPack: true,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      setHasClaimedStarterPack(true);
      await loadUserCards(user.uid);
    } catch (e) {
      console.error("Failed to claim starter pack:", e);
      alert("Encountered connection errors claiming packs.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Buy a Booster Pack (-250 Coins)
  const handlePurchasePack = async (packCost: number, tierTarget: "Standard" | "Elite") => {
    if (!user) {
      alert("ERROR: Please sign in (or select Guest Mode) to purchase card packs!");
      return null;
    }
    if (coins < packCost) {
      alert(`INSUFFICIENT FUNDS: You need ${packCost} coins to summon this pack. Complete matches under the Arena tab to earn coins!`);
      return null;
    }

    setIsProcessing(true);
    try {
      const drawnCards: Player[] = [];
      const legendaryPool = PRELOADED_PLAYERS.filter(p => p.overallRating && p.overallRating >= 95);
      const goldPool = PRELOADED_PLAYERS.filter(p => p.overallRating && p.overallRating >= 85 && p.overallRating < 95);
      const silverPool = PRELOADED_PLAYERS.filter(p => p.overallRating && p.overallRating >= 75 && p.overallRating < 85);
      const bronzePool = PRELOADED_PLAYERS.filter(p => !p.overallRating || p.overallRating < 75);

      for (let i = 0; i < 3; i++) {
        const rng = Math.random() * 100;
        let drawn: Player;
        if (tierTarget === "Elite") {
          // elite chances: 15% legendary, 50% gold, 35% silver
          if (rng < 15 && legendaryPool.length > 0) {
            drawn = legendaryPool[Math.floor(Math.random() * legendaryPool.length)];
          } else if (rng < 65 && goldPool.length > 0) {
            drawn = goldPool[Math.floor(Math.random() * goldPool.length)];
          } else {
            drawn = silverPool[Math.floor(Math.random() * silverPool.length)];
          }
        } else {
          // standard chances: 3% legendary, 20% gold, 45% silver, 32% bronze
          if (rng < 3 && legendaryPool.length > 0) {
            drawn = legendaryPool[Math.floor(Math.random() * legendaryPool.length)];
          } else if (rng < 23 && goldPool.length > 0) {
            drawn = goldPool[Math.floor(Math.random() * goldPool.length)];
          } else if (rng < 68 && silverPool.length > 0) {
            drawn = silverPool[Math.floor(Math.random() * silverPool.length)];
          } else {
            drawn = bronzePool[Math.floor(Math.random() * bronzePool.length)];
          }
        }
        if (drawn) drawnCards.push(drawn);
      }

      // Write results to database path player_collection
      const batchPromises = drawnCards.map(async (p) => {
        const idStr = `card_${user.uid}_${p.id}_${Math.random().toString(36).substring(2, 6)}`;
        const ref = doc(db, "player_collection", idStr);
        await setDoc(ref, {
          id: idStr,
          userId: user.uid,
          playerId: p.id,
          name: p.name,
          team: p.team,
          position: p.position,
          era: p.era,
          ppg: p.ppg,
          apg: p.apg,
          rpg: p.rpg,
          fgPercent: p.fgPercent || 48,
          overallRating: p.overallRating || 72,
          tier: p.overallRating && p.overallRating >= 95 ? "Legendary" :
                p.overallRating && p.overallRating >= 85 ? "Gold" :
                p.overallRating && p.overallRating >= 75 ? "Silver" : "Bronze"
        });
      });

      await Promise.all(batchPromises);

      // Deduct coins & update profile doc
      const nextCoinsCount = coins - packCost;
      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email || "anonymous_user",
        teamName,
        starters,
        bench,
        wins,
        losses,
        totalMargin,
        coins: nextCoinsCount,
        hasClaimedStarterPack,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      setCoins(nextCoinsCount);
      await loadUserCards(user.uid);
      return drawnCards;
    } catch (e) {
      console.error(e);
      alert("Failed to secure pack purchase transaction.");
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  // Duplicate Fusion & Trade-Up: 5 duplicate items of target tier -> 1 random of next tier
  const handleTradeUpDuplicateCards = async (cardsToDeduct: UserCard[], nextTier: "Silver" | "Gold" | "Legendary") => {
    if (!user) return null;
    setIsProcessing(true);
    try {
      const deletePromises = cardsToDeduct.map(c => deleteDoc(doc(db, "player_collection", c.cardId)));
      await Promise.all(deletePromises);

      const targetPool = PRELOADED_PLAYERS.filter(p => {
        if (nextTier === "Legendary") return p.overallRating && p.overallRating >= 95;
        if (nextTier === "Gold") return p.overallRating && p.overallRating >= 85 && p.overallRating < 95;
        return p.overallRating && p.overallRating >= 75 && p.overallRating < 85;
      });

      const spawned = targetPool[Math.floor(Math.random() * targetPool.length)] || PRELOADED_PLAYERS[0];

      // Write new card to collections
      const spawnedId = `card_${user.uid}_${spawned.id}_trade_${Math.random().toString(36).substring(2, 6)}`;
      await setDoc(doc(db, "player_collection", spawnedId), {
        id: spawnedId,
        userId: user.uid,
        playerId: spawned.id,
        name: spawned.name,
        team: spawned.team,
        position: spawned.position,
        era: spawned.era,
        ppg: spawned.ppg,
        apg: spawned.apg,
        rpg: spawned.rpg,
        fgPercent: spawned.fgPercent || 48,
        overallRating: spawned.overallRating || 75,
        tier: spawned.overallRating && spawned.overallRating >= 95 ? "Legendary" :
              spawned.overallRating && spawned.overallRating >= 85 ? "Gold" : "Silver"
      });

      await loadUserCards(user.uid);
      return spawned;
    } catch (e) {
      console.error(e);
      alert("Encountered failure processing Duplicate Fusion Trade-Up.");
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  // Clear matched game history records completely
  const handleClearHistory = async () => {
    if (!user) return;
    try {
      const q = query(collection(db, "game_history"), where("userId", "==", user.uid));
      const snap = await getDocs(q);
      const deletePromises = snap.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
      
      setGames([]);
      setWins(0);
      setLosses(0);
      setTotalMargin(0);

      // Re-save user record safely with zeroed scores
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email || "anonymous_user",
        teamName,
        starters,
        bench,
        wins: 0,
        losses: 0,
        totalMargin: 0,
        coins,
        hasClaimedStarterPack,
        updatedAt: new Date().toISOString()
      });
    } catch (e) {
      console.error("Purge operations failed:", e);
      throw e;
    }
  };

  // Irving Data Decimator: Completely purges ALL database trees for this user
  const handleDeleteAllDataExecution = async () => {
    if (!user) return;
    try {
      setIsProcessing(true);
      
      // Delete game history documents in batch
      const qGames = query(collection(db, "game_history"), where("userId", "==", user.uid));
      const snapGames = await getDocs(qGames);
      await Promise.all(snapGames.docs.map(docSnap => deleteDoc(docSnap.ref)));

      // Delete active save documents
      const qSaves = query(collection(db, "career_saves"), where("userId", "==", user.uid));
      const snapSaves = await getDocs(qSaves);
      await Promise.all(snapSaves.docs.map(docSnap => deleteDoc(docSnap.ref)));

      // Delete pack cards collection
      const qCards = query(collection(db, "player_collection"), where("userId", "==", user.uid));
      const snapCards = await getDocs(qCards);
      await Promise.all(snapCards.docs.map(docSnap => deleteDoc(docSnap.ref)));

      // Delete customized saved teams
      const qTeams = query(collection(db, "saved_teams"), where("userId", "==", user.uid));
      const snapTeams = await getDocs(qTeams);
      await Promise.all(snapTeams.docs.map(docSnap => deleteDoc(docSnap.ref)));

      // Overwrite users profile base file
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email || "anonymous_user",
        teamName: "My Retro Ballers",
        starters: [],
        bench: [],
        wins: 0,
        losses: 0,
        totalMargin: 0,
        coins: 500,
        hasClaimedStarterPack: false,
        updatedAt: new Date().toISOString()
      });

      // Purge all reactive state values back to baseline
      setGames([]);
      setWins(0);
      setLosses(0);
      setTotalMargin(0);
      setCoins(500);
      setHasClaimedStarterPack(false);
      
      setUltimateStarters([]);
      setUltimateBench([]);
      setFreeStarters([]);
      setFreeBench([]);
      
      setCareerSaves([]);
      setActiveSaveId(null);
      setActiveSave(null);
      
      setTeamName("My Retro Ballers");
      setDeleteConfirmationText("");
      setModeSelected(false); // return to the welcoming game mode selector!
      setTab("draft");
      
    } catch (e) {
      console.error("Purging all user data failed:", e);
      handleFirestoreError(e, OperationType.DELETE, "users/purge_all_user_data");
    } finally {
      setIsProcessing(false);
    }
  };

  // Google Login popup
  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error("Google Auth popup failed:", err);
    }
  };

  // Instant Guest session
  const handleTesterLogin = async () => {
    try {
      await signInAnonymously(auth);
    } catch (err) {
      console.error("Anonymous Signin failed:", err);
    }
  };

  // Logout reset
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const handleSwitchGameMode = async (mode: "free" | "ultimate") => {
    setActiveGameMode(mode);
    if (user) {
      try {
        await setDoc(doc(db, "users", user.uid), {
          activeGameMode: mode,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      } catch (e) {
        console.error("Failed saving active game mode choice:", e);
      }
    }
  };

  // Draft player addition trigger
  const handleDraftPlayer = async (player: Player, slot: "starter" | "bench") => {
    if (!user) return;

    if (activeGameMode === "free") {
      if (slot === "starter") {
        if (freeStarters.length >= 5) return;
        if (freeStarters.some((p) => p.id === player.id) || freeBench.some((p) => p.id === player.id)) return;
        const updated = [...freeStarters, player];
        setFreeStarters(updated);
        await saveActiveRosterDraft(user.uid, user.email, teamName, updated, freeBench, "free");
      } else {
        if (freeBench.length >= 3) return;
        if (freeStarters.some((p) => p.id === player.id) || freeBench.some((p) => p.id === player.id)) return;
        const updated = [...freeBench, player];
        setFreeBench(updated);
        await saveActiveRosterDraft(user.uid, user.email, teamName, freeStarters, updated, "free");
      }
    } else {
      if (slot === "starter") {
        if (ultimateStarters.length >= 5) return;
        if (ultimateStarters.some((p) => p.id === player.id) || ultimateBench.some((p) => p.id === player.id)) return;
        const updated = [...ultimateStarters, player];
        setUltimateStarters(updated);
        await saveActiveRosterDraft(user.uid, user.email, teamName, updated, ultimateBench, "ultimate");
      } else {
        if (ultimateBench.length >= 3) return;
        if (ultimateStarters.some((p) => p.id === player.id) || ultimateBench.some((p) => p.id === player.id)) return;
        const updated = [...ultimateBench, player];
        setUltimateBench(updated);
        await saveActiveRosterDraft(user.uid, user.email, teamName, ultimateStarters, updated, "ultimate");
      }
    }
  };

  // Deletion trigger
  const handleRemovePlayer = async (id: string, slot: "starter" | "bench") => {
    if (!user) return;

    if (activeGameMode === "free") {
      if (slot === "starter") {
        const updated = freeStarters.filter((p) => p.id !== id);
        setFreeStarters(updated);
        await saveActiveRosterDraft(user.uid, user.email, teamName, updated, freeBench, "free");
      } else {
        const updated = freeBench.filter((p) => p.id !== id);
        setFreeBench(updated);
        await saveActiveRosterDraft(user.uid, user.email, teamName, freeStarters, updated, "free");
      }
    } else {
      if (slot === "starter") {
        const updated = ultimateStarters.filter((p) => p.id !== id);
        setUltimateStarters(updated);
        await saveActiveRosterDraft(user.uid, user.email, teamName, updated, ultimateBench, "ultimate");
      } else {
        const updated = ultimateBench.filter((p) => p.id !== id);
        setUltimateBench(updated);
        await saveActiveRosterDraft(user.uid, user.email, teamName, ultimateStarters, updated, "ultimate");
      }
    }
  };

  const handleUpdateTeamName = async (name: string) => {
    setTeamName(name);
    if (user) {
      await saveActiveRosterDraft(user.uid, user.email, name, starters, bench, activeGameMode);
    }
  };

  const handleClearRoster = async () => {
    if (!user) return;
    if (activeGameMode === "free") {
      setFreeStarters([]);
      setFreeBench([]);
      await saveActiveRosterDraft(user.uid, user.email, teamName, [], [], "free");
    } else {
      setUltimateStarters([]);
      setUltimateBench([]);
      await saveActiveRosterDraft(user.uid, user.email, teamName, [], [], "ultimate");
    }
  };

  const handleAutoDraft = async () => {
    if (!user) return;
    const available = activeGameMode === "free"
      ? [...PRELOADED_PLAYERS]
      : PRELOADED_PLAYERS.filter((p) => userCards.some((uc) => uc.playerId === p.id));

    if (activeGameMode === "ultimate" && available.length === 0) {
      alert("Please claim your Free Starter Pack in the Packs tab first to populate your collection!");
      return;
    }

    const shuffled = [...available].sort(() => 0.5 - Math.random());
    const newStarters = shuffled.slice(0, 5);
    const newBench = shuffled.slice(5, 8);

    if (activeGameMode === "free") {
      setFreeStarters(newStarters);
      setFreeBench(newBench);
      await saveActiveRosterDraft(user.uid, user.email, teamName, newStarters, newBench, "free");
    } else {
      setUltimateStarters(newStarters);
      setUltimateBench(newBench);
      await saveActiveRosterDraft(user.uid, user.email, teamName, newStarters, newBench, "ultimate");
    }
  };

  // Merge Guest Account Data with Google Account Profile
  const handleMergeGuestData = async () => {
    if (!user || !guestUidToMerge) return;
    setMergingInProcess(true);

    try {
      // 1. Copy user active roster data & career records
      const guestUserRef = doc(db, "users", guestUidToMerge);
      const guestUserSnap = await getDoc(guestUserRef);
      let guestWins = 0, guestLosses = 0, guestTotalMargin = 0;

      if (guestUserSnap.exists()) {
        const guestData = guestUserSnap.data();
        guestWins = guestData.wins || 0;
        guestLosses = guestData.losses || 0;
        guestTotalMargin = guestData.totalMargin || 0;

        const combinedWins = wins + guestWins;
        const combinedLosses = losses + guestLosses;
        const combinedMargin = totalMargin + guestTotalMargin;

        setWins(combinedWins);
        setLosses(combinedLosses);
        setTotalMargin(combinedMargin);

        // Populate roster if current Google user was clean state
        const mergedStarters = starters.length > 0 ? starters : (guestData.starters || []);
        const mergedBench = bench.length > 0 ? bench : (guestData.bench || []);
        const mergedTeamName = teamName !== "My Retro Ballers" ? teamName : (guestData.teamName || "My Retro Ballers");

        setUltimateStarters(mergedStarters);
        setUltimateBench(mergedBench);
        setTeamName(mergedTeamName);

        // Write combined profile to Google UID
        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          email: user.email || "anonymous_user",
          teamName: mergedTeamName,
          starters: mergedStarters,
          bench: mergedBench,
          wins: combinedWins,
          losses: combinedLosses,
          totalMargin: combinedMargin,
          updatedAt: new Date().toISOString()
        });
      }

      // 2. Fetch all guest saved named teams and copy them to new google ID
      const guestTeamsQ = query(collection(db, "saved_teams"), where("userId", "==", guestUidToMerge));
      const guestTeamsSnap = await getDocs(guestTeamsQ);
      for (const tDoc of guestTeamsSnap.docs) {
        const tData = tDoc.data();
        const copyTeamId = `team_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        const copiedTeam: SavedTeam = {
          id: copyTeamId,
          userId: user.uid,
          name: tData.name,
          starters: tData.starters,
          bench: tData.bench,
          chemistryRating: tData.chemistryRating || 80,
          createdAt: tData.createdAt || new Date().toISOString()
        };
        await setDoc(doc(db, "saved_teams", copyTeamId), copiedTeam);
      }
      await loadSavedTeams(user.uid);

      // 3. Fetch all guest simulated games and copy them to new google ID
      const guestGamesQ = query(collection(db, "game_history"), where("userId", "==", guestUidToMerge));
      const guestGamesSnap = await getDocs(guestGamesQ);
      for (const gDoc of guestGamesSnap.docs) {
        const gData = gDoc.data();
        const copyGameId = `game_history_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        const copiedGame = {
          ...gData,
          id: copyGameId,
          userId: user.uid
        };
        await setDoc(doc(db, "game_history", copyGameId), copiedGame);
      }
      await loadGameRecords(user.uid);

      // Merge Complete: wipe localStorage reference
      localStorage.removeItem("nba_simulator_guest_uid");
      setShowMergePrompt(false);
      setGuestUidToMerge(null);
      alert("SUCCESS: Guest sessions achievements, saved teams, and career logs merged into Google ID!");
    } catch (e) {
      console.error(e);
      alert("Merging error occurred. Check secure connection rules.");
    } finally {
      setMergingInProcess(false);
    }
  };

  const handleDismissMerge = () => {
    localStorage.removeItem("nba_simulator_guest_uid");
    setShowMergePrompt(false);
    setGuestUidToMerge(null);
  };

  const draftedIds = [...starters, ...bench].map((p) => p.id);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0c0f12] text-white flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-t-[#f55a15] border-gray-800 rounded-full animate-spin mb-4" />
        <p className="text-sm font-mono text-gray-400">Loading Franchise Arena...</p>
      </div>
    );
  }

  // Visual Wall for Unauthenticated Visitors
  if (!user) {
    return (
      <div className="min-h-screen bg-[#0c0f12] text-white flex flex-col items-center justify-center p-4 court-bg relative select-none">
        
        <div className="absolute w-[600px] h-[600px] border border-dashed border-[#f55a15]/10 rounded-full pointer-events-none -top-20 z-0 flex items-center justify-center">
          <div className="w-[300px] h-[300px] border border-dashed border-[#f55a15]/5 rounded-full" />
        </div>

        <div className="bg-[#12161a] border border-gray-800 rounded-2xl p-8 max-w-md w-full relative z-10 text-center shadow-2xl glow-orange">
          <div className="w-16 h-16 bg-[#f55a15]/10 border border-[#f55a15]/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="w-8 h-8 text-[#f55a15]" />
          </div>

          <h1 className="text-3xl font-display font-extrabold text-white tracking-tight uppercase">
            NBA SIMULATOR
          </h1>
          <p className="text-xs text-gray-400 font-mono tracking-widest uppercase mt-1">
            FRANCHISE SQUAD GENERATOR
          </p>

          <p className="text-sm text-gray-400 mt-4 leading-relaxed font-sans">
            Build your ultimate franchise roster of real historical NBA legends. Run play-by-play court simulations, track career records, and merge guest drafts seamlessly.
          </p>

          <div className="mt-8 space-y-3">
            <button
              onClick={handleGoogleLogin}
              className="w-full bg-[#f55a15] hover:bg-[#ff6e2e] text-black font-display font-bold py-3.5 px-4 rounded-xl text-sm transition-all flex items-center justify-center gap-2.5 shadow-md active:scale-98 cursor-pointer"
            >
              Sign In with Google Account
            </button>

            <div className="flex items-center gap-2 text-gray-750 my-4">
              <span className="h-px bg-gray-800 flex-1" />
              <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">or test immediately</span>
              <span className="h-px bg-gray-800 flex-1" />
            </div>

            <button
              onClick={handleTesterLogin}
              className="w-full bg-[#1b2026] hover:bg-gray-800 text-white font-display border border-gray-800 py-3.5 px-4 rounded-xl text-xs transition-colors cursor-pointer"
            >
              Play Instant Guest Demo
            </button>
          </div>

          <p className="text-[10px] text-gray-500 font-mono tracking-wide mt-6">
            Persistent stats saved securely in Firestore.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0c0f12] text-white flex flex-col justify-between court-bg parquet-pattern custom-basketball-cursor relative overflow-x-hidden">
      
      {/* Top Header Controls Panel */}
      <header className="bg-[#12161a]/95 border-b border-gray-800 px-4 md:px-8 py-4 relative z-25 shadow-md glass-panel">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#f55a15] rounded-full flex items-center justify-center shadow-lg">
              <Shield className="w-5 h-5 text-black" />
            </div>
            <div>
              <h1 className="font-display font-extrabold text-lg text-white uppercase tracking-tight leading-none flex items-center gap-2">
                COURT SIMULATOR <span className="text-[10px] bg-red-650/20 text-[#f55a15] border border-[#f55a15]/30 px-1.5 py-0.5 rounded">v2.0</span>
              </h1>
              <span className="text-[9px] text-[#f55a15] font-mono tracking-widest uppercase">
                FRANCHISE GM HUB
              </span>
            </div>
          </div>

          {/* User Status Bar Block */}
          <div className="flex items-center gap-3 md:gap-4 scroll-m-1">
            
            {/* Play-To-Earn Coins Counter Pill */}
            {activeGameMode === "ultimate" && (
              <div className="flex items-center gap-1.5 bg-black/50 border border-amber-500/30 px-3 py-1.5 rounded-xl text-xs text-amber-500 font-mono font-bold shrink-0 shadow-sm">
                <Coins className="w-4 h-4 text-amber-500 animate-pulse" />
                <span>{coins} COINS</span>
              </div>
            )}

            {/* Sound Mute/Unmute Fast Toggler */}
            {soundEnabled ? (
              <button
                onClick={() => setSoundEnabled(false)}
                className="bg-gray-800/40 hover:bg-gray-800 border border-gray-850 p-2.5 rounded-xl text-emerald-400 transition-colors cursor-pointer"
                title="Mute commentary sounds"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => setSoundEnabled(true)}
                className="bg-red-950/20 hover:bg-gray-800 border border-red-900/30 p-2.5 rounded-xl text-red-400 transition-colors cursor-pointer"
                title="Unmute commentary sounds"
              >
                <VolumeX className="w-4 h-4" />
              </button>
            )}

            {/* Top Interactive Settings Panel Trigger */}
            <button
              onClick={() => handleSetTab("settings")}
              className={`border p-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                tab === "settings" 
                  ? "bg-[#f55a15] border-[#f55a15] text-black shadow-md glow-orange" 
                  : "bg-gray-800/40 hover:bg-gray-800 border-gray-850 text-gray-400 hover:text-white"
              }`}
              title="System Settings"
            >
              <Settings className="w-4 h-4" />
              <span className="text-xs font-mono font-bold hidden sm:inline">SETTINGS</span>
            </button>

            <div className="text-right hidden md:block">
              <p className="text-xs font-semibold text-white truncate max-w-[150px]">
                {user.isAnonymous ? "Guest Franchise Officer" : user.email}
              </p>
              <span className="text-[9px] text-[#f55a15] font-mono px-2 py-0.5 bg-[#f55a15]/10 rounded border border-[#f55a15]/15 uppercase">
                {user.isAnonymous ? "Guest Session" : "Google GM"}
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="bg-gray-800/40 hover:bg-red-950/20 text-gray-400 hover:text-red-400 border border-gray-850 p-2.5 rounded-xl transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

        </div>

      </header>

      {/* GAME MODE WELCOME LANDING AREA (CHOOSE YOUR ARENA) */}
      {!modeSelected ? (
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-4xl mx-auto w-full px-4 py-12 flex-1 flex flex-col justify-center items-center z-10"
        >
          <div className="text-center space-y-2 mb-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#f55a15]/10 border border-[#f55a15]/25 rounded-full text-[10px] font-mono tracking-widest text-[#f55a15] uppercase">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" /> Next-Gen Basketball Sandbox
            </div>
            <h2 className="text-3xl md:text-5xl font-display font-black text-white tracking-tight uppercase leading-none">
              Select Game Arena
            </h2>
            <p className="text-sm text-gray-400 max-w-xl mx-auto font-sans leading-relaxed">
              Choose your professional pathway. Draft historic rosters, manage multiple save-file franchises in Career mode, or play instantly with preloaded legendary ballers in free sandbox exhibitions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
            
            {/* FREE SIM / EXHIBITION MATCHES CARD */}
            <motion.div 
              whileHover={{ scale: 1.025, translateY: -4 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              onClick={() => {
                setActiveGameMode("free");
                setModeSelected(true);
                setTab("draft");
              }}
              className="glass-panel border border-white/5 rounded-2xl p-6 md:p-8 cursor-pointer relative overflow-hidden transition-all duration-300 hover:border-[#f55a15]/45 hover:shadow-2xl hover:shadow-[#f55a15]/10 flex flex-col justify-between h-96 group text-left"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#f55a15]/5 rounded-full blur-2xl group-hover:bg-[#f55a15]/10 transition-colors pointer-events-none" />
              
              <div className="space-y-4">
                <div className="w-12 h-12 bg-white/5 group-hover:bg-[#f55a15]/15 rounded-xl flex items-center justify-center transition-all">
                  <Sliders className="w-6 h-6 text-gray-300 group-hover:text-[#f55a15]" />
                </div>
                <div>
                  <h3 className="text-2xl font-display font-extrabold text-white uppercase tracking-tight">Free Sim Mode</h3>
                  <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest block mt-0.5">CASUAL EXHIBITIONS</span>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed font-sans pr-4">
                  Full instant draft credentials. Select any of the 500+ present and historical legends, match against 50+ custom themed franchises, and run immediate sandbox gameplay.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2 text-xs border-t border-white/5 pt-4">
                  <div className="flex items-center gap-2 text-gray-300">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Full 500+ Legend Pool Preloaded</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>50+ Customized Opponent Clubs</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <X className="w-4 h-4 text-gray-500 shrink-0" />
                    <span className="text-gray-450 text-[11px]">No coin payouts or booster packs</span>
                  </div>
                </div>
                <button className="w-full bg-white/10 group-hover:bg-[#f55a15] text-white group-hover:text-black font-display font-black uppercase text-xs tracking-wider py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2">
                  Launch Exhibition <Play className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>

            {/* ULTIMATE SQUAD / CAREER GM PATH */}
            <motion.div 
              whileHover={{ scale: 1.025, translateY: -4 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              onClick={() => {
                setActiveGameMode("ultimate");
                setModeSelected(true);
                setTab("draft");
              }}
              className="glass-panel border border-white/5 rounded-2xl p-6 md:p-8 cursor-pointer relative overflow-hidden transition-all duration-300 hover:border-[#f55a15]/45 hover:shadow-2xl hover:shadow-[#f55a15]/10 flex flex-col justify-between h-96 group text-left"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#f55a15]/5 rounded-full blur-2xl group-hover:bg-[#f55a15]/10 transition-colors pointer-events-none" />

              <div className="space-y-4">
                <div className="w-12 h-12 bg-white/5 group-hover:bg-[#f55a15]/15 rounded-xl flex items-center justify-center transition-all">
                  <Trophy className="w-6 h-6 text-gray-300 group-hover:text-[#f55a15]" />
                </div>
                <div>
                  <h3 className="text-2xl font-display font-extrabold text-white uppercase tracking-tight">Ultimate Squad</h3>
                  <span className="text-[10px] font-mono text-amber-500 uppercase tracking-widest block mt-0.5">CAREER GM & LADDER RUN</span>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed font-sans pr-4">
                  Draft starter booster packs, sign strategic ratings tiers, climb division leagues from Rookie to Legendary, earn coin salaries, and fuse duplicate cards.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2 text-xs border-t border-white/5 pt-4">
                  <div className="flex items-center gap-2 text-gray-300">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Booster Shop & Fusion Duplicate Trades</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Earn Coins to buy elite legendary packs</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Persistent Career multi-file saves</span>
                  </div>
                </div>
                <button className="w-full bg-[#f55a15]/20 group-hover:bg-[#f55a15] text-[#f55a15] group-hover:text-black font-display font-black uppercase text-xs tracking-wider py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2">
                  Begin Franchise GM <Play className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>

          </div>
        </motion.div>
      ) : (

        /* Primary Dashboard layout split columns */
        <main className="max-w-7xl mx-auto w-full px-4 md:px-8 py-6 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10 items-start">
          
          {/* Navigation panel */}
          <div className={`${sidebarCollapsed ? "lg:col-span-1" : "lg:col-span-3"} space-y-4 transition-all duration-300`}>
            
            {/* USER GUEST ACCOUNT MERGING POPUP WRAP */}
            <AnimatePresence>
              {showMergePrompt && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-[#12161a] border border-[#f55a15]/30 p-4 rounded-xl shadow-lg relative glow-orange text-xs"
                >
                  <div className="flex gap-2.5 items-start">
                    <FolderSync className="w-6 h-6 text-[#f55a15] shrink-0 mt-0.5" />
                    <div className="leading-normal col">
                      <h4 className="font-display font-bold text-white uppercase tracking-wide">
                        Merge Guest session?
                      </h4>
                      <p className="text-gray-400 mt-1 text-[11px]">
                        We found saved teams and games from your previous guest session. Merging will import them to your Google Account.
                      </p>
                      <div className="flex gap-2 mt-4">
                        <button
                          onClick={handleMergeGuestData}
                          disabled={mergingInProcess}
                          className="bg-[#f55a15] hover:bg-[#ff6e2e] text-black font-semibold px-3 py-1.5 rounded text-[10px] tracking-wide uppercase transition-colors"
                        >
                          {mergingInProcess ? "Merging..." : "Merge Records"}
                        </button>
                        <button
                          onClick={handleDismissMerge}
                          className="bg-gray-900 border border-gray-800 text-gray-400 px-3 py-1.5 rounded text-[10px] uppercase transition-colors hover:text-white"
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Sidebar Navigation Card */}
            <div className="bg-[#12161a]/95 border border-gray-850 rounded-xl p-4 space-y-1.5 shadow-md glass-panel relative">
              
              {/* COLLAPSE/EXPAND TOGGLER (Desktop only view) */}
              <button 
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="absolute -right-3 top-4 bg-[#f55a15] hover:bg-[#ff6e2e] text-black w-6 h-6 rounded-full flex items-center justify-center shadow-lg cursor-pointer border border-[#0c0f12] hidden lg:flex"
                title={sidebarCollapsed ? "Expand Sidebar Menu" : "Collapse Sidebar Menu"}
              >
                {sidebarCollapsed ? <ChevronRight className="w-4.5 h-4.5" /> : <ChevronLeft className="w-4.5 h-4.5" />}
              </button>

              {sidebarCollapsed ? (
                /* COLLAPSED MINI SIDEBAR */
                <div className="flex flex-col items-center gap-4 py-2">
                  <div 
                    className="w-10 h-10 rounded-full bg-[#f55a15]/10 border border-[#f55a15]/20 flex items-center justify-center text-[#f55a15] cursor-pointer" 
                    onClick={() => setModeSelected(false)}
                    title="Change Arena Mode"
                  >
                    {activeGameMode === "ultimate" ? <Trophy className="w-4 h-4 text-[#f55a15]" /> : <Sliders className="w-4 h-4 text-[#f55a15]" />}
                  </div>

                  <div className="w-full h-px bg-gray-800/60" />

                  <button 
                    onClick={() => handleSetTab("draft")} 
                    className={`p-3 rounded-xl transition-all cursor-pointer ${tab === "draft" ? "bg-[#f55a15] text-black shadow-md glow-orange" : "bg-[#1b2026] text-gray-400 hover:text-white"}`}
                    title="My Roster"
                  >
                    <Search className="w-4 h-4" />
                  </button>

                  {activeGameMode === "ultimate" && (
                    <button 
                      onClick={() => handleSetTab("packs")} 
                      className={`p-3 rounded-xl transition-all cursor-pointer ${tab === "packs" ? "bg-[#f55a15] text-black shadow-md glow-orange" : "bg-[#1b2026] text-gray-400 hover:text-white"}`}
                      title="Booster Packs & Fusion Store"
                    >
                      <Sparkles className="w-4 h-4" />
                    </button>
                  )}

                  <button 
                    onClick={() => handleSetTab("arena")} 
                    className={`p-3 rounded-xl transition-all cursor-pointer ${tab === "arena" ? "bg-[#f55a15] text-black shadow-md glow-orange" : "bg-[#1b2026] text-gray-400 hover:text-white"}`}
                    title="Sim Arena Court"
                  >
                    <Zap className="w-4 h-4" />
                  </button>

                  <button 
                    onClick={() => handleSetTab("history")} 
                    className={`p-3 rounded-xl transition-all cursor-pointer ${tab === "history" ? "bg-[#f55a15] text-black shadow-md glow-orange" : "bg-[#1b2026] text-gray-400 hover:text-white"}`}
                    title="Simulation Archive History"
                  >
                    <History className="w-4 h-4" />
                  </button>

                  <button 
                    onClick={() => handleSetTab("leaders")} 
                    className={`p-3 rounded-xl transition-all cursor-pointer ${tab === "leaders" ? "bg-[#f55a15] text-black shadow-md glow-orange" : "bg-[#1b2026] text-gray-400 hover:text-white"}`}
                    title="Leaderboards"
                  >
                    <Award className="w-4 h-4" />
                  </button>

                  <button 
                    onClick={() => handleSetTab("settings")} 
                    className={`p-3 rounded-xl transition-all cursor-pointer ${tab === "settings" ? "bg-[#f55a15] text-black shadow-md glow-orange" : "bg-[#1b2026] text-gray-400 hover:text-white"}`}
                    title="System Settings"
                  >
                    <Settings className="w-4 h-4" />
                  </button>

                  <div className="w-full h-px bg-gray-800/60 my-2" />

                  <button 
                    onClick={() => setModeSelected(false)} 
                    className="p-3 bg-red-950/20 text-red-400 hover:text-red-300 border border-red-900/30 rounded-xl transition-transform hover:scale-105 cursor-pointer"
                    title="Return to Game Mode hub"
                  >
                    <Sliders className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                /* FULL EXPAND SIDEBAR */
                <>
                  {/* ACTIVE GAME MODE CONTAINER */}
                  <div className="bg-black/40 border border-gray-800/60 rounded-xl p-3 mb-2 relative overflow-hidden">
                    <span className="text-[8px] text-[#f55a15] font-mono uppercase tracking-wider block mb-1 font-bold">
                      🏀 ACTIVE GAMES HUB
                    </span>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-display font-black text-white uppercase tracking-wide">
                        {activeGameMode === "ultimate" ? "Ultimate Squad (Career)" : "Free Sim (Exhibition)"}
                      </span>
                      <button 
                        onClick={() => setModeSelected(false)}
                        className="text-[9px] font-mono text-gray-400 hover:text-[#f55a15] border border-gray-800 hover:border-[#f55a15]/30 px-2 py-1 bg-[#1b2026] rounded uppercase font-bold transition-all"
                      >
                        Switch Hub
                      </button>
                    </div>
                    <p className="text-[9px] text-gray-400 mt-1.5 leading-normal">
                      {activeGameMode === "ultimate" 
                        ? "🏆 Complete contract leagues with booster card packs" 
                        : "🏀 Fast simulated exhibition games. No coin rewards"
                      }
                    </p>
                  </div>

                  {activeGameMode === "ultimate" && activeSaveId !== null && (
                    <div className="bg-emerald-950/10 border border-emerald-900/30 rounded-lg p-2.5 mt-1.5 mb-2 text-xs">
                      <span className="text-[8px] text-emerald-400 font-mono uppercase tracking-wider block font-bold">
                        📁 LOADED FRANCHISE SAVE
                      </span>
                      <span className="block font-display font-black text-white uppercase truncate mt-0.5 leading-tight">
                        {teamName}
                      </span>
                      <div className="flex justify-between text-[10px] text-gray-400 font-mono mt-1 pt-1 border-t border-emerald-950/40">
                        <span>Starters OVR:</span>
                        <span className="text-yellow-400 font-extrabold">
                          {Math.round(ultimateStarters.reduce((acc, p) => acc + (p.overallRating || 70), 0) / Math.max(1, ultimateStarters.length))} OVR
                        </span>
                      </div>
                      <div className="flex justify-between text-[10px] text-gray-400 font-mono">
                        <span>Season Run:</span>
                        <span className="text-white font-bold">Season {seasonNumber} ({seasonWins}-{seasonLosses})</span>
                      </div>
                      <div className="flex justify-between text-[10px] text-gray-400 font-mono">
                        <span>Streak:</span>
                        <span className="text-[#f55a15] font-bold">{winStreak} Games</span>
                      </div>
                      <button
                        onClick={() => {
                          setActiveSaveId(null);
                          setActiveSave(null);
                          setTab("draft");
                        }}
                        className="w-full text-center text-[9px] bg-[#1b2026] hover:bg-gray-800 text-gray-300 rounded py-1.5 mt-2 font-semibold uppercase tracking-wider cursor-pointer border border-gray-800 transition-colors"
                      >
                        Switch Franchise
                      </button>
                    </div>
                  )}

                  <span className="text-[9px] text-gray-500 font-mono uppercase tracking-widest block mb-2 font-semibold">
                    CONTROLS BOARD
                  </span>
                  
                  <nav className="space-y-1.5">
                    <button
                      onClick={() => handleSetTab("draft")}
                      className={`w-full py-3 px-4 rounded-lg text-left text-xs font-display font-bold uppercase tracking-wider flex items-center gap-3 transition-colors cursor-pointer ${
                        tab === "draft" 
                          ? "bg-[#f55a15] text-black shadow-md glow-orange" 
                          : "bg-[#1b2026] text-gray-300 hover:text-white hover:bg-gray-850"
                      }`}
                    >
                      <Search className="w-4 h-4 shrink-0" /> My Squad
                    </button>

                    {activeGameMode === "ultimate" && (
                      <button
                        onClick={() => handleSetTab("packs")}
                        className={`w-full py-3 px-4 rounded-lg text-left text-xs font-display font-bold uppercase tracking-wider flex items-center justify-between gap-3 transition-colors cursor-pointer ${
                          tab === "packs" 
                            ? "bg-[#f55a15] text-black shadow-md glow-orange" 
                            : "bg-[#1b2026] text-gray-300 hover:text-white hover:bg-gray-850"
                        }`}
                      >
                        <span className="flex items-center gap-3">
                          <Sparkles className="w-4 h-4 shrink-0" /> Packs & Fusion
                        </span>
                        {!hasClaimedStarterPack && (
                          <span className="text-[8px] bg-amber-500 text-black font-bold font-mono px-1.5 py-0.5 rounded uppercase animate-bounce">
                            FREE
                          </span>
                        )}
                      </button>
                    )}

                    <button
                      onClick={() => handleSetTab("arena")}
                      className={`w-full py-3 px-4 rounded-lg text-left text-xs font-display font-bold uppercase tracking-wider flex items-center gap-3 transition-colors cursor-pointer ${
                        tab === "arena" 
                          ? "bg-[#f55a15] text-black shadow-md glow-orange" 
                          : "bg-[#1b2026] text-gray-300 hover:text-white hover:bg-gray-850"
                      }`}
                    >
                      <Zap className="w-4 h-4 shrink-0" /> Play Sim Arena
                    </button>

                    <button
                      onClick={() => handleSetTab("history")}
                      className={`w-full py-3 px-4 rounded-lg text-left text-xs font-display font-bold uppercase tracking-wider flex items-center gap-3 transition-colors cursor-pointer ${
                        tab === "history" 
                          ? "bg-[#f55a15] text-black shadow-md glow-orange" 
                          : "bg-[#1b2026] text-gray-300 hover:text-white hover:bg-gray-850"
                      }`}
                    >
                      <History className="w-4 h-4 shrink-0" /> Simulation Logs
                    </button>

                    <button
                      onClick={() => handleSetTab("leaders")}
                      className={`w-full py-3 px-4 rounded-lg text-left text-xs font-display font-bold uppercase tracking-wider flex items-center gap-3 transition-colors cursor-pointer ${
                        tab === "leaders" 
                          ? "bg-[#f55a15] text-black shadow-md glow-orange" 
                          : "bg-[#1b2026] text-gray-300 hover:text-white hover:bg-gray-850"
                      }`}
                    >
                      <Award className="w-4 h-4 shrink-0" /> Class Leaders
                    </button>

                    <button
                      onClick={() => handleSetTab("settings")}
                      className={`w-full py-3 px-4 rounded-lg text-left text-xs font-display font-bold uppercase tracking-wider flex items-center gap-3 transition-colors cursor-pointer ${
                        tab === "settings" 
                          ? "bg-[#f55a15] text-black shadow-md glow-orange" 
                          : "bg-[#1b2026] text-gray-300 hover:text-white hover:bg-gray-850"
                      }`}
                    >
                      <Settings className="w-4 h-4 shrink-0" /> System Settings
                    </button>
                  </nav>

                  <div className="bg-[#12161a] border border-gray-850 rounded-xl p-4 mt-4 shadow-inner">
                    <h4 className="text-xs text-white uppercase tracking-wider font-mono font-bold">Roster Status</h4>
                    <div className="mt-2 text-xs space-y-1.5 text-gray-400 leading-normal">
                      <div className="flex justify-between text-xs">
                        <span>Starters Signed:</span>
                        <span className={starters.length === 5 ? "text-green-400 font-bold" : "text-white font-bold"}>
                          {starters.length} / 5
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span>Bench Signed:</span>
                        <span className={bench.length === 3 ? "text-green-400 font-bold" : "text-white font-bold"}>
                          {bench.length} / 3
                        </span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-gray-800 text-xs">
                        <span>Status:</span>
                        <span className={starters.length === 5 && bench.length === 3 ? "text-green-400 uppercase font-mono text-[9px] font-bold" : "text-yellow-500 uppercase font-mono text-[9px] font-bold"}>
                          {starters.length === 5 && bench.length === 3 ? "READY" : "INCOMPLETE"}
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              )}

            </div>
          </div>

          {/* Primary page contents workspace panel */}
          <div className={`${sidebarCollapsed ? "lg:col-span-11" : "lg:col-span-9"} space-y-6 transition-all duration-300`}>
            
            {activeGameMode === "ultimate" && !activeSaveId ? (
              <div className="space-y-6 animate-fade-in">
                {tab !== "draft" && (
                  <div className="bg-amber-950/20 border border-amber-900/30 text-amber-200 text-xs px-4 py-3 rounded-xl flex items-center gap-2.5 font-sans">
                    <span>⚠️ <b>Franchise Required:</b> Define or load an active Career Franchise Save in the main tab to browse the {tab} arena!</span>
                  </div>
                )}
                <CareerSavesHub
                  careerSaves={careerSaves}
                  loading={loadingSaves}
                  onLoadSave={handleLoadSave}
                  onCreateNewSave={handleCreateNewSave}
                  onDeleteSave={handleDeleteSaveFile}
                />
              </div>
            ) : (
              <>
                {tab === "draft" && (
                  <div className="space-y-6">
                    {/* Draft with player search and pre-set selects */}
                    <SearchPlayerCard onDraft={handleDraftPlayer} draftedIds={draftedIds} />
                    <RosterView
                      starters={starters}
                      bench={bench}
                      teamName={teamName}
                      onRemove={handleRemovePlayer}
                      onUpdateTeamName={handleUpdateTeamName}
                      onAddFromPreloaded={handleDraftPlayer}
                      onAutoDraft={handleAutoDraft}
                      onClearRoster={handleClearRoster}
                      onSaveTeam={handleSaveTeam}
                      savedTeams={savedTeams}
                      onLoadTeam={handleLoadTeam}
                      onDeleteSavedTeam={handleDeleteSavedTeam}
                      isSaveLoading={isSaveLoading}
                      userCards={userCards}
                      activeGameMode={activeGameMode}
                    />
                  </div>
                )}
              </>
            )}

            {tab === "packs" && activeGameMode === "ultimate" && (
              <PackStoreView
                coins={coins}
                userCards={userCards}
                hasClaimedStarterPack={hasClaimedStarterPack}
                onClaimStarterPack={handleClaimStarterPack}
                onPurchasePack={async (packType) => {
                  let cost = 100;
                  if (packType === "silver") cost = 300;
                  if (packType === "gold") cost = 600;
                  if (packType === "legendary") cost = 1500;

                  let tierTarget: "Standard" | "Elite" = "Standard";
                  if (packType === "gold" || packType === "legendary") tierTarget = "Elite";

                  await handlePurchasePack(cost, tierTarget);
                }}
                onTradeUp={async (tierToSacrifice) => {
                  // Sacrifices exactly 5 duplicates
                  const getDuplicatesByTier = (tier: "Bronze" | "Silver" | "Gold"): UserCard[] => {
                    const counts: Record<string, UserCard[]> = {};
                    userCards.forEach(card => {
                      if (card.tier === tier) {
                        counts[card.playerId] = counts[card.playerId] || [];
                        counts[card.playerId].push(card);
                      }
                    });

                    const duplicates: UserCard[] = [];
                    Object.values(counts).forEach(cardsList => {
                      if (cardsList.length > 1) {
                        duplicates.push(...cardsList.slice(1));
                      }
                    });
                    return duplicates;
                  };

                  const targetDups = getDuplicatesByTier(tierToSacrifice);
                  if (targetDups.length < 5) return;

                  const toSacrifice = targetDups.slice(0, 5);
                  const nextTier = tierToSacrifice === "Bronze" ? "Silver" : (tierToSacrifice === "Silver" ? "Gold" : "Legendary");
                  await handleTradeUpDuplicateCards(toSacrifice, nextTier);
                }}
                isProcessing={isProcessing}
              />
            )}

            {tab === "arena" && (
              <SimulationView
                userId={user.uid}
                teamName={teamName}
                starters={starters}
                bench={bench}
                onSaveGameRecord={handleSaveGameRecord}
                onResetToDraft={() => setTab("draft")}
              />
            )}

            {tab === "history" && (
              <HistoryList games={games} loading={gamesLoading} />
            )}

            {tab === "leaders" && (
              <LeadersView
                games={games}
                loading={gamesLoading}
                onClearHistory={handleClearHistory}
              />
            )}

            {tab === "settings" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#12161a] border border-gray-800 rounded-2xl p-6 md:p-8 space-y-6 relative overflow-hidden text-left glass-panel shadow-2xl"
              >
                {/* Court Design Accents */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-[#f55a15] to-amber-500" />
                
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-850 pb-5">
                  <div className="flex items-center gap-3">
                    <div className="bg-[#f55a15]/10 p-2.5 rounded-xl border border-[#f55a15]/20">
                      <Settings className="w-6 h-6 text-[#f55a15]" />
                    </div>
                    <div>
                      <h2 className="text-xl md:text-2xl font-display font-black text-white uppercase tracking-tight">System Settings Panel</h2>
                      <p className="text-xs text-gray-400 font-sans mt-1">Configure simulated variables, audio selectors, and database profiles</p>
                    </div>
                  </div>
                  
                  {/* BACK BUTTON */}
                  <button 
                    onClick={() => handleSetTab(previousTab || "draft")}
                    className="px-4 py-2 text-xs font-mono font-bold bg-[#1b2026] hover:bg-gray-800 border border-gray-850 hover:border-gray-750 text-gray-300 hover:text-white rounded-xl transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" /> BACK TO SQUAD
                  </button>
                </div>

                {/* Status Announcement Toast */}
                {settingsStatusMessage && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-emerald-950/25 border border-emerald-500/30 text-emerald-400 p-3.5 rounded-xl flex items-center gap-2.5 text-xs font-mono"
                  >
                    <Check className="w-4 h-4" />
                    <span>{settingsStatusMessage}</span>
                  </motion.div>
                )}

                {/* Main Settings Subsections */}
                <div className="space-y-6">
                  
                  {/* 1. SIMULATION VOLUME CONTROL */}
                  <div className="bg-black/25 border border-gray-850/80 p-5 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <span className="text-sm font-bold text-white block uppercase tracking-wide">Audio Commentary Stream</span>
                      <p className="text-xs text-gray-400 leading-normal mt-1 max-w-xl font-sans">Toggle voice commentary readout engine during the basketball play-by-feed simulation runs.</p>
                    </div>
                    <button 
                      onClick={() => {
                        setSoundEnabled(!soundEnabled);
                        setSettingsStatusMessage(`Audio Commentary successfully set to ${!soundEnabled ? "ON" : "OFF"}`);
                        setTimeout(() => setSettingsStatusMessage(null), 3000);
                      }}
                      className={`flex items-center gap-2 px-4.5 py-2.5 rounded-xl text-xs font-mono transition-all border font-bold cursor-pointer tracking-wider shrink-0 w-full sm:w-auto justify-center ${
                        soundEnabled 
                          ? "bg-emerald-950/20 text-emerald-400 border-emerald-950/40 hover:bg-emerald-950/40" 
                          : "bg-red-950/20 text-red-500 border-red-950/40 hover:bg-red-950/40"
                      }`}
                    >
                      {soundEnabled ? (
                        <>
                          <Volume2 className="w-4 h-4 text-emerald-400" />
                          <span>ACTIVE COMMENTARY ON</span>
                        </>
                      ) : (
                        <>
                          <VolumeX className="w-4 h-4 text-red-500" />
                          <span>COMMENTARY MUTED</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* 2. MATCH SIMULATION ARCHIVES RESET */}
                  <div className="bg-black/25 border border-gray-850/80 p-5 rounded-2xl">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <span className="text-sm font-bold text-white block uppercase tracking-wide">Purge Simulation Archive History</span>
                        <p className="text-xs text-gray-400 leading-normal mt-1 max-w-xl font-sans">Clear all simulation score records and log histories stored inside your cloud account.</p>
                      </div>
                      <button
                        onClick={async () => {
                          if (confirm("Are you sure you want to permanently erase all match history simulation records? This action cannot be undone.")) {
                            try {
                              await handleClearHistory();
                              setSettingsStatusMessage("Match history purged successfully!");
                              setTimeout(() => setSettingsStatusMessage(null), 3000);
                            } catch (err) {
                              alert("An error occurred trying to purge history documents.");
                            }
                          }
                        }}
                        className="px-4.5 py-2.5 bg-red-950/20 hover:bg-red-950/40 text-red-400 border border-red-900/40 rounded-xl text-xs font-mono transition-all font-bold uppercase cursor-pointer tracking-wider shrink-0 w-full sm:w-auto"
                      >
                        Reset Game Logs
                      </button>
                    </div>
                  </div>

                  {/* 3. DANGER ZONE - FULL PURGE DELETE ZONE */}
                  <div className="border-t border-gray-850 pt-5">
                    <span className="text-xs font-mono uppercase tracking-widest text-red-500 font-extrabold block mb-2.5">🚨 Danger Zone: Sandbox Account & Progress</span>
                    <div className="bg-red-950/10 border border-red-950/25 p-5 rounded-2xl space-y-4">
                      <p className="text-xs text-gray-300 leading-relaxed font-sans">
                        Permanently delete this sandbox user database profile, drafted rosters, acquired retro collections, coins, and custom saves. This action is completely irreversible.
                      </p>
                      <div className="space-y-3">
                        <label className="text-[10px] font-mono uppercase tracking-wider text-gray-400 block leading-normal">
                          To confirm, type <span className="text-red-400 font-bold font-mono px-2 py-0.5 bg-red-950/30 rounded">DELETE</span> in the box below:
                        </label>
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                          <input 
                            type="text"
                            placeholder="DELETE"
                            value={deleteConfirmationText}
                            onChange={(e) => setDeleteConfirmationText(e.target.value)}
                            className="bg-black/50 border border-gray-800 text-white rounded-xl px-4 py-2.5 text-sm font-mono focus:border-red-500 focus:outline-none flex-1 max-w-full uppercase tracking-wider"
                          />
                          <button 
                            disabled={deleteConfirmationText !== "DELETE" || isProcessing}
                            onClick={async () => {
                              try {
                                await handleDeleteAllDataExecution();
                                setSettingsStatusMessage("Sandbox account data deleted successfully. Signing out...");
                                setDeleteConfirmationText("");
                                setTimeout(() => {
                                  setSettingsStatusMessage(null);
                                  handleSetTab("draft");
                                }, 3000);
                              } catch (err) {
                                alert("Failed to complete full profile purge.");
                              }
                            }}
                            className={`px-5 py-2.5 rounded-xl text-xs font-display font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 shrink-0 ${
                              deleteConfirmationText === "DELETE" && !isProcessing
                                ? "bg-red-650 hover:bg-red-700 text-white shadow-lg glow-red cursor-pointer"
                                : "bg-gray-850 border border-gray-800 text-gray-500 cursor-not-allowed"
                            }`}
                          >
                            <Trash2 className="w-4 h-4 shadow-sm" /> {isProcessing ? "Purging..." : "Delete Account"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Save Changes button bar */}
                <div className="border-t border-gray-850 pt-5 flex justify-end gap-3">
                  <button
                    onClick={() => handleSetTab(previousTab || "draft")}
                    className="px-5 py-2.5 text-xs font-display font-extrabold uppercase tracking-widest text-gray-400 hover:text-white rounded-xl transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      setSettingsStatusMessage("Changes saved successfully!");
                      setTimeout(() => {
                        setSettingsStatusMessage(null);
                        handleSetTab(previousTab || "draft");
                      }, 1000);
                    }}
                    className="px-6 py-2.5 bg-[#f55a15] hover:bg-[#ff6e2e] text-black font-display font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-md glow-orange cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>

              </motion.div>
            )}

          </div>

        </main>
      )}

      {/* Humiliated credits footer layout */}
      <footer className="border-t border-gray-850 px-8 py-4 bg-[#12161a] text-center text-[10px] text-gray-550 font-mono tracking-wide mt-10 relative z-20">
        All live player stats grounded via actual Google Search integration. Custom GM career progress compiled inside Firestore. Single player Basketball Sandbox.
      </footer>

    </div>
  );
}
