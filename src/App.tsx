import "./App.css";
import React, { createContext, useEffect, useMemo } from "react";
import raw_eBird from "./macaulay/ebird_taxonomy_merged_minimal.json";
import raw_region_list from "./macaulay/ebird_species_list.json";
import { Box, Link, Snackbar, Typography } from "@mui/material";
import Lobby from "./components/Lobby";
import Quiz from "./components/Quiz";
import { EBirdNameProperty, Language } from "./tools/constants";
import { ConfirmProvider } from "material-ui-confirm";

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
  sequence: Array<string>;
  randomSeed: number;
  counter: number;
  birbEmoji: string;
  selectedBirbIds: Array<string>;
  answers: Array<boolean>;
  showAnswers: Array<boolean>;
  endQuiz: () => void;
  setCounter: React.Dispatch<React.SetStateAction<number>>;
  setAnswers: React.Dispatch<React.SetStateAction<Array<boolean>>>;
  setShowAnswers: React.Dispatch<React.SetStateAction<Array<boolean>>>;
  css_height_90: string;
  gameMode: GameMode | null;
  setSelectedBirbIds: React.Dispatch<any>;
  setOpenStartQuizDialog: React.Dispatch<any>;
  setOpenSnake: React.Dispatch<any>;
  setSnakeMessage: React.Dispatch<any>;
  currentList: string;
  setCurrentList: React.Dispatch<any>;
  customList: Array<string>;
  setCustomList: React.Dispatch<any>;
  setQuizStarted: React.Dispatch<any>;
  setGameMode: React.Dispatch<any>;
  openStartQuizDialog: boolean;
  startQuiz: (nbBirb: number) => void;
  openEndQuizDialog: boolean;
  setOpenEndQuizDialog: React.Dispatch<any>;
  songCheckbox: boolean;
  setSongCheckbox: React.Dispatch<any>;
  callCheckbox: boolean;
  setCallCheckbox: React.Dispatch<any>;
  language: Language;
  setLanguage: React.Dispatch<any>;
  eBirdNameProperty: EBirdNameProperty;
  sliderValue: number;
  setSliderValue: React.Dispatch<any>;
  region: string;
  setRegion: React.Dispatch<any>;
  isMobileDevice: boolean;
  openLocalizationDialog: boolean;
  setOpenLocalizationDialog: React.Dispatch<any>;
  openPublishDialog: boolean;
  setOpenPublishDialog: React.Dispatch<any>;
  openEditDialog: boolean;
  setOpenEditDialog: React.Dispatch<any>;
};

export const QuizContext = createContext<QuizContextType | undefined>(
  undefined
);

function App() {
  const buildDate = process.env.REACT_APP_BUILD_DATE;

  const eBird = raw_eBird as any;
  const regionList = raw_region_list as any;

  // Helper to load progress from localStorage
  const loadProgress = () => {
    const saved = localStorage.getItem("birbsquiz-2205");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error parsing progress:", e);
      }
    }
    return {};
  };

  const savedProgress = loadProgress();

  const [selectedBirbIds, setSelectedBirbIds] = React.useState<Array<string>>(
    () => {
      const urlBirbs = new URLSearchParams(window.location.search).get("birbs");
      if (urlBirbs) {
        try {
          const parsedBirbs = JSON.parse(atob(urlBirbs));
          return Array.isArray(parsedBirbs)
            ? parsedBirbs.filter((birbId: any) => eBird[birbId])
            : [];
        } catch (e) {
          console.error("Error parsing URL birbs:", e);
          return [];
        }
      } else if (
        savedProgress.selectedBirbIds &&
        Array.isArray(savedProgress.selectedBirbIds)
      ) {
        return savedProgress.selectedBirbIds;
      }
      return [];
      // return JSON.parse(atob("WyIyNCIsIjQyOSIsIjI3MCJd"));
    }
  );

  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.delete("birbs");
    window.history.replaceState(null, "", url.toString());
  }, [selectedBirbIds]);

  const [counter, setCounter] = React.useState<number>(() =>
    savedProgress.counter !== undefined ? savedProgress.counter : 0
  );

  const [sequence, setSequence] = React.useState<Array<string>>(
    () => savedProgress.sequence || []
  );

  const [randomSeed, setRandomSeed] = React.useState<number>(
    () => savedProgress.randomSeed || 0
  );

  const [showAnswers, setShowAnswers] = React.useState<Array<boolean>>(
    () => savedProgress.showAnswers || []
  );

  const [answers, setAnswers] = React.useState<Array<boolean>>(
    () => savedProgress.answers || []
  );

  const [quizStarted, setQuizStarted] = React.useState<boolean>(
    () => savedProgress.quizStarted
  );

  const [openSnake, setOpenSnake] = React.useState<boolean>(false);
  const [snakeMessage, setSnakeMessage] = React.useState<string>("");

  const birbEmoji = useMemo(
    () => birbEmojis[Math.floor(Math.random() * birbEmojis.length)],
    []
  );

  const [openEndQuizDialog, setOpenEndQuizDialog] = React.useState<boolean>(
    () => savedProgress.openEndQuizDialog
  );

  const [openStartQuizDialog, setOpenStartQuizDialog] = React.useState(
    () => savedProgress.openStartQuizDialog
  );

  const [openLocalizationDialog, setOpenLocalizationDialog] = React.useState(
    () => savedProgress?.openLocalizationDialog ?? true
  );

  const [openPublishDialog, setOpenPublishDialog] = React.useState(
    () => savedProgress.openPublishDialog
  );

  const [openEditDialog, setOpenEditDialog] = React.useState(
    () => savedProgress.openEditDialog
  );

  const [gameMode, setGameMode] = React.useState<GameMode | null>(
    () => savedProgress.gameMode || null
  );

  const [currentList, setCurrentList] = React.useState<string>(
    () => savedProgress.currentList || "Custom"
  );

  const [customList, setCustomList] = React.useState<Array<string>>(
    () => savedProgress.customList || []
  );

  const [songCheckbox, setSongCheckbox] = React.useState(
    () => savedProgress.songCheckbox
  );

  const [callCheckbox, setCallCheckbox] = React.useState(
    () => savedProgress.callCheckbox
  );

  const [language, setLanguage] = React.useState(
    () => savedProgress.language || Language.FR
  );

  const [eBirdNameProperty, setEBridNameProperty] = React.useState(
    () => savedProgress.eBirdNameProperty || EBirdNameProperty.COMMON_NAME_FR
  );

  const [sliderValue, setSliderValue] = React.useState<number>(
    () => savedProgress.sliderValue || selectedBirbIds.length
  );

  const [region, setRegion] = React.useState<string>(
    () => savedProgress.region || "EARTH"
  );

  const [isMobileDevice, setIsMobileDevice] = React.useState(false);

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

  // Save quiz progress to localStorage whenever any dependency changes
  useEffect(() => {
    const progress = {
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
    };
    localStorage.removeItem("birbsQuizProgress");
    localStorage.removeItem("birbsQuizV2");
    localStorage.removeItem("birbsquiz-1905");
    localStorage.setItem("birbsquiz-2205", JSON.stringify(progress));
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
  ]);

  const css_height_90 = "calc(var(--vh, 1vh) * 90)";

  useEffect(() => {
    setIsMobileDevice(window.innerWidth <= 800);
    // console.log("isMobileDevice", window.innerWidth <= 800);
    const setVh = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty("--vh", `${vh}px`);
    };
    setVh();
    window.addEventListener("resize", setVh);
    return () => window.removeEventListener("resize", setVh);
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
            autoHideDuration={5000}
            onClose={() => {
              setOpenSnake(false);
              setSnakeMessage("");
            }}
            message={snakeMessage}
            anchorOrigin={{ vertical: "top", horizontal: "center" }}
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
