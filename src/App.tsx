import "./App.css";
import React, { createContext, useEffect, useMemo } from "react";
import raw_eBird from "./macaulay/ebird_taxonomy_merged_minimal.json";
import raw_region_list from "./macaulay/ebird_species_list.json";
import { Box, Link, Snackbar, Typography } from "@mui/material";
import Lobby from "./components/Lobby";
import Quiz from "./components/Quiz";
import { EBirdNameProperty, Language, Region } from "./tools/constants";
import { ConfirmProvider } from "material-ui-confirm";
import { DB_BIRBS, isValidEnumValue } from "./tools/tools";

const birbEmojis = [
  "🐦‍⬛",
  "🦤",
  "🦜",
  "🦅",
  "🦚",
  "🦃",
  "🦉",
  "🦢",
  "🦩",
  "🦆",
  "🪿",
  "🥚",
  "🍳",
];

export enum GameMode {
  CHANTS = "chants",
  IMAGES = "images",
}

export type QuizContextType = {
  eBird: Record<
    string,
    {
      sciName: string;
      comName: string;
      comNameFr: string;
    }
  >;
  regionList: Record<string, string[]>;
  sequence: string[];
  randomSeed: number;
  counter: number;
  birbEmoji: string;
  selectedBirbIds: string[];
  answers: boolean[];
  showAnswers: boolean[];
  endQuiz: () => void;
  setCounter: React.Dispatch<React.SetStateAction<number>>;
  setAnswers: React.Dispatch<React.SetStateAction<boolean[]>>;
  setShowAnswers: React.Dispatch<React.SetStateAction<boolean[]>>;
  css_height_90: string;
  gameMode: GameMode | null;
  setSelectedBirbIds: React.Dispatch<React.SetStateAction<string[]>>;
  setOpenStartQuizDialog: React.Dispatch<React.SetStateAction<boolean>>;
  setOpenSnake: React.Dispatch<React.SetStateAction<boolean>>;
  setSnakeMessage: React.Dispatch<React.SetStateAction<string>>;
  currentList: string;
  setCurrentList: React.Dispatch<React.SetStateAction<string>>;
  customList: string[];
  setCustomList: React.Dispatch<React.SetStateAction<string[]>>;
  setQuizStarted: React.Dispatch<React.SetStateAction<boolean>>;
  setGameMode: React.Dispatch<React.SetStateAction<GameMode | null>>;
  openStartQuizDialog: boolean;
  startQuiz: (nbBirb: number) => void;
  openEndQuizDialog: boolean;
  setOpenEndQuizDialog: React.Dispatch<React.SetStateAction<boolean>>;
  songCheckbox: boolean;
  setSongCheckbox: React.Dispatch<React.SetStateAction<boolean>>;
  callCheckbox: boolean;
  setCallCheckbox: React.Dispatch<React.SetStateAction<boolean>>;
  language: Language;
  setLanguage: React.Dispatch<React.SetStateAction<Language>>;
  eBirdNameProperty: EBirdNameProperty;
  sliderValue: number;
  setSliderValue: React.Dispatch<React.SetStateAction<number>>;
  region: Region;
  setRegion: React.Dispatch<React.SetStateAction<Region>>;
  isMobileDevice: boolean;
  openLocalizationDialog: boolean;
  setOpenLocalizationDialog: React.Dispatch<React.SetStateAction<boolean>>;
  openPublishDialog: boolean;
  setOpenPublishDialog: React.Dispatch<React.SetStateAction<boolean>>;
  openEditDialog: boolean;
  setOpenEditDialog: React.Dispatch<React.SetStateAction<boolean>>;
  dbBirbs: DB_BIRBS;
  setDbBirbs: React.Dispatch<React.SetStateAction<DB_BIRBS>>;
};

export const QuizContext = createContext<QuizContextType | undefined>(
  undefined
);

function App() {
  const buildDate = process.env.REACT_APP_BUILD_DATE;

  const eBird = raw_eBird as any;
  const regionList = Object.fromEntries(
    Object.entries(raw_region_list).map(([key, value]) => {
      const enumKey = Region[key.replace("-", "_") as keyof typeof Region];
      return [enumKey, value];
    })
  ) as Record<keyof typeof Region, string[]>;

  const localStorageKey = "birbsquiz-2205";

  // Helper to load progress from localStorage
  const loadProgress = () => {
    const saved = localStorage.getItem(localStorageKey);
    if (saved) {
      try {
        return JSON.parse(saved) as Progress;
      } catch (e) {
        console.error("Error parsing progress:", e);
      }
    }
    return null;
  };

  const savedProgress: Progress | null = loadProgress();

  const oneHour = 3600000;
  const isOneHourAgo =
    savedProgress?.timestamp !== undefined &&
    Date.now() - savedProgress.timestamp < oneHour;

  const [selectedBirbIds, setSelectedBirbIds] = React.useState<string[]>(() =>
    savedProgress?.selectedBirbIds ? savedProgress.selectedBirbIds : []
  );

  const [counter, setCounter] = React.useState<number>(() =>
    savedProgress?.counter && isOneHourAgo ? savedProgress.counter : 0
  );

  const [sequence, setSequence] = React.useState<string[]>(() =>
    savedProgress?.sequence && isOneHourAgo ? savedProgress.sequence : []
  );

  const [randomSeed, setRandomSeed] = React.useState<number>(() =>
    savedProgress?.randomSeed && isOneHourAgo ? savedProgress.randomSeed : 0
  );

  const [showAnswers, setShowAnswers] = React.useState<boolean[]>(() =>
    savedProgress?.showAnswers && isOneHourAgo ? savedProgress.showAnswers : []
  );

  const [answers, setAnswers] = React.useState<boolean[]>(() =>
    savedProgress?.answers && isOneHourAgo ? savedProgress.answers : []
  );

  const [quizStarted, setQuizStarted] = React.useState<boolean>(() =>
    savedProgress?.quizStarted !== undefined && isOneHourAgo
      ? savedProgress.quizStarted
      : false
  );

  const [openSnake, setOpenSnake] = React.useState<boolean>(false);
  const [snakeMessage, setSnakeMessage] = React.useState<string>("");

  const birbEmoji = useMemo(
    () => birbEmojis[Math.floor(Math.random() * birbEmojis.length)],
    []
  );

  const [openEndQuizDialog, setOpenEndQuizDialog] = React.useState<boolean>(
    () =>
      savedProgress?.openEndQuizDialog !== undefined && isOneHourAgo
        ? savedProgress.openEndQuizDialog
        : false
  );

  const [openStartQuizDialog, setOpenStartQuizDialog] = React.useState<boolean>(
    () =>
      savedProgress?.openStartQuizDialog !== undefined && isOneHourAgo
        ? savedProgress.openStartQuizDialog
        : false
  );

  const [openLocalizationDialog, setOpenLocalizationDialog] =
    React.useState<boolean>(() =>
      savedProgress?.openLocalizationDialog !== undefined
        ? savedProgress.openLocalizationDialog
        : true
    );

  const [openPublishDialog, setOpenPublishDialog] = React.useState<boolean>(
    () =>
      savedProgress?.openPublishDialog !== undefined && isOneHourAgo
        ? savedProgress.openPublishDialog
        : false
  );

  const [openEditDialog, setOpenEditDialog] = React.useState<boolean>(() =>
    savedProgress?.openEditDialog !== undefined && isOneHourAgo
      ? savedProgress.openEditDialog
      : false
  );

  const [gameMode, setGameMode] = React.useState<GameMode | null>(() =>
    savedProgress?.gameMode &&
    isValidEnumValue(GameMode, savedProgress.gameMode) &&
    isOneHourAgo
      ? savedProgress.gameMode
      : null
  );

  const [currentList, setCurrentList] = React.useState<string>(() =>
    savedProgress?.currentList && isOneHourAgo
      ? savedProgress.currentList
      : "Custom"
  );

  const [customList, setCustomList] = React.useState<string[]>(() =>
    savedProgress?.customList ? savedProgress.customList : []
  );

  const [songCheckbox, setSongCheckbox] = React.useState<boolean>(() =>
    savedProgress?.songCheckbox ? savedProgress.songCheckbox : true
  );

  const [callCheckbox, setCallCheckbox] = React.useState<boolean>(() =>
    savedProgress?.callCheckbox ? savedProgress.callCheckbox : false
  );

  const [language, setLanguage] = React.useState<Language>(() =>
    savedProgress?.language &&
    isValidEnumValue(Language, savedProgress.language)
      ? savedProgress.language
      : Language.FR
  );

  const [eBirdNameProperty, setEBridNameProperty] =
    React.useState<EBirdNameProperty>(() =>
      savedProgress?.eBirdNameProperty &&
      isValidEnumValue(EBirdNameProperty, savedProgress.eBirdNameProperty)
        ? savedProgress.eBirdNameProperty
        : EBirdNameProperty.COMMON_NAME_FR
    );

  const [sliderValue, setSliderValue] = React.useState<number>(() =>
    savedProgress?.sliderValue
      ? savedProgress.sliderValue
      : selectedBirbIds.length
  );

  const [region, setRegion] = React.useState<Region>(() =>
    savedProgress?.region && isValidEnumValue(Region, savedProgress.region)
      ? savedProgress.region
      : Region.CA_QC
  );

  const [isMobileDevice, setIsMobileDevice] = React.useState<boolean>(false);

  const [dbBirbs, setDbBirbs] = React.useState<DB_BIRBS>(() =>
    savedProgress?.dbBirbs && isOneHourAgo ? savedProgress.dbBirbs : {}
  );

  const startQuiz = (nbBirb: number) => {
    setCounter(0);
    randomSequence(nbBirb);
    setShowAnswers(Array(nbBirb).fill(false));
    setAnswers(Array(nbBirb).fill(false));
  };

  const endQuiz = () => {
    if (counter === sequence.length - 1) setOpenEndQuizDialog(true);
    setGameMode(null);
    setCounter(0);
    setQuizStarted(false);
  };

  const randomSequence = (max: number) => {
    const newSequence = [...selectedBirbIds];
    shuffleArray(newSequence);
    setSequence(newSequence.splice(0, max));
    setRandomSeed(Math.random());
  };

  useEffect(() => {
    if (language === Language.FR) {
      setEBridNameProperty(EBirdNameProperty.COMMON_NAME_FR);
    } else if (language === Language.EN) {
      setEBridNameProperty(EBirdNameProperty.COMMON_NAME);
    } else if (language === Language.LATIN) {
      setEBridNameProperty(EBirdNameProperty.SCIENTIFIC_NAME);
    }
  }, [language]);

  type Progress = {
    timestamp: number;
    selectedBirbIds: string[];
    counter: number;
    sequence: string[];
    randomSeed: number;
    showAnswers: boolean[];
    answers: boolean[];
    quizStarted: boolean;
    openEndQuizDialog: boolean;
    openStartQuizDialog: boolean;
    openLocalizationDialog: boolean;
    openPublishDialog: boolean;
    openEditDialog: boolean;
    gameMode: GameMode | null;
    currentList: string;
    customList: string[];
    songCheckbox: boolean;
    callCheckbox: boolean;
    language: Language;
    eBirdNameProperty: EBirdNameProperty;
    sliderValue: number;
    region: Region;
    isMobileDevice: boolean;
    dbBirbs: DB_BIRBS;
  };

  // Save quiz progress to localStorage whenever any dependency changes
  useEffect(() => {
    const progress: Progress = {
      timestamp: Date.now(),
      selectedBirbIds,
      counter,
      sequence,
      randomSeed,
      showAnswers,
      answers,
      quizStarted,
      openEndQuizDialog,
      openStartQuizDialog,
      openLocalizationDialog,
      openPublishDialog,
      openEditDialog,
      gameMode,
      currentList,
      customList,
      songCheckbox,
      callCheckbox,
      language,
      eBirdNameProperty,
      sliderValue,
      region,
      isMobileDevice,
      dbBirbs,
    };
    localStorage.removeItem("birbsQuizProgress");
    localStorage.removeItem("birbsQuizV2");
    localStorage.removeItem("birbsquiz-1905");
    localStorage.setItem(localStorageKey, JSON.stringify(progress));
  }, [
    selectedBirbIds,
    counter,
    sequence,
    randomSeed,
    showAnswers,
    answers,
    quizStarted,
    openEndQuizDialog,
    openStartQuizDialog,
    openLocalizationDialog,
    openPublishDialog,
    openEditDialog,
    gameMode,
    currentList,
    customList,
    songCheckbox,
    callCheckbox,
    language,
    eBirdNameProperty,
    sliderValue,
    region,
    isMobileDevice,
    dbBirbs,
  ]);

  const css_height_90 = "calc(var(--vh, 1vh) * 93)";

  useEffect(() => {
    const handleResize = () => {
      setIsMobileDevice(window.innerWidth <= 800);
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty("--vh", `${vh}px`);
    };
    // Initialize on mount
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <ConfirmProvider>
      <QuizContext.Provider
        value={{
          eBird,
          regionList,
          sequence,
          randomSeed,
          counter,
          birbEmoji,
          selectedBirbIds,
          answers,
          showAnswers,
          endQuiz,
          setCounter,
          setAnswers,
          setShowAnswers,
          css_height_90,
          gameMode,
          setSelectedBirbIds,
          setOpenStartQuizDialog,
          setOpenSnake,
          setSnakeMessage,
          currentList,
          setCurrentList,
          customList,
          setCustomList,
          setQuizStarted,
          setGameMode,
          openStartQuizDialog,
          startQuiz,
          openEndQuizDialog,
          setOpenEndQuizDialog,
          songCheckbox,
          setSongCheckbox,
          callCheckbox,
          setCallCheckbox,
          language,
          setLanguage,
          eBirdNameProperty,
          sliderValue,
          setSliderValue,
          region,
          setRegion,
          isMobileDevice,
          openLocalizationDialog,
          setOpenLocalizationDialog,
          openPublishDialog,
          setOpenPublishDialog,
          openEditDialog,
          setOpenEditDialog,
          dbBirbs,
          setDbBirbs,
        }}
      >
        <Box
          sx={{
            height: css_height_90,
            "*": {
              WebkitUserSelect: "none",
              MozUserSelect: "none",
              msUserSelect: "none",
              userSelect: "none",
              WebkitTouchCallout: "none",
            },
            // button: {
            //   height: "40px",
            // },
          }}
        >
          <Box
            sx={{
              display: "grid",
              justifyContent: "center",
              gridTemplateColumns: "minmax(min-content, 800px)",
            }}
          >
            {!quizStarted && <Lobby />}
            {quizStarted && <Quiz />}
          </Box>

          {/* Footer */}
          <Box
            sx={{
              position: "absolute",
              bottom: 0,
              margin: "0 2rem",
              display: "flex",
              justifyContent: "space-between",
              width: "calc(100% - 4rem)",
              alignItems: "center",
            }}
          >
            <Box>
              <Typography variant="caption">
                <Link
                  sx={{ color: "#dcdcdc", fontSize: "0.6rem" }}
                  target="_blank"
                  rel="noopener"
                  underline="hover"
                  href="https://www.macaulaylibrary.org/"
                >
                  Macaulay Library
                </Link>
              </Typography>
            </Box>

            {buildDate && (
              <Box>
                <Typography
                  sx={{ color: "#dcdcdc", fontSize: "0.6rem" }}
                  variant="caption"
                >
                  Build on {buildDate}
                </Typography>
              </Box>
            )}

            <Box>
              <Typography variant="caption">
                <Link
                  sx={{ color: "#dcdcdc", fontSize: "0.6rem" }}
                  target="_blank"
                  rel="noopener"
                  underline="hover"
                  href="https://www.linkedin.com/in/xishec/"
                >
                  Xi Chen
                </Link>
              </Typography>
            </Box>
          </Box>

          <Snackbar
            open={openSnake}
            autoHideDuration={2000}
            onClose={() => {
              setOpenSnake(false);
              setSnakeMessage("");
            }}
            message={snakeMessage}
            anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          />
        </Box>
      </QuizContext.Provider>
    </ConfirmProvider>
  );
}

export default App;

export const shuffleArray = (array: Array<any>) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
};
