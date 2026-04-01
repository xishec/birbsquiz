import "./App.css";
import React, { createContext, useEffect, useMemo } from "react";
import raw_eBird from "./macaulay/ebird_taxonomy_merged_minimal.json";
import raw_region_list from "./macaulay/ebird_species_list.json";
import { Box, Link, Snackbar, Typography } from "@mui/material";
import Lobby from "./components/Lobby";
import Quiz from "./components/Quiz";
import {
  CUSTOM,
  DBRegion,
  EBirdNameProperty,
  Language,
} from "./tools/constants";
import { ConfirmProvider } from "material-ui-confirm";
import { DB_BIRBS, isValidEnumValue } from "./tools/tools";
import {
  Translation,
  translationEnglish,
  translationFrench,
  translationLatin,
} from "./translation/translation";

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

const footerReservedSpace =
  "calc(var(--footer-height) + env(safe-area-inset-bottom))";
const footerTextSx = { color: "#dcdcdc", fontSize: "0.6rem" } as const;

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
  regionList: Record<DBRegion, string[]>;
  sequence: string[];
  randomSeed: number;
  counter: number;
  birbEmoji: string;
  selectedBirbIds: string[];
  answers: boolean[];
  showAnswers: boolean[];
  answerInputs: string[];
  answerBirbIds: Array<string | null>;
  endQuiz: () => void;
  setCounter: React.Dispatch<React.SetStateAction<number>>;
  setAnswers: React.Dispatch<React.SetStateAction<boolean[]>>;
  setShowAnswers: React.Dispatch<React.SetStateAction<boolean[]>>;
  setAnswerInputs: React.Dispatch<React.SetStateAction<string[]>>;
  setAnswerBirbIds: React.Dispatch<React.SetStateAction<Array<string | null>>>;
  gameMode: GameMode | null;
  setSelectedBirbIds: React.Dispatch<React.SetStateAction<string[]>>;
  setOpenStartQuizDialog: React.Dispatch<React.SetStateAction<boolean>>;
  setOpenSnake: React.Dispatch<React.SetStateAction<boolean>>;
  setSnakeMessage: React.Dispatch<React.SetStateAction<string>>;
  currentList: string;
  setCurrentList: React.Dispatch<React.SetStateAction<string>>;
  customList: string[];
  setCustomList: React.Dispatch<React.SetStateAction<string[]>>;
  quizStarted: boolean;
  setQuizStarted: React.Dispatch<React.SetStateAction<boolean>>;
  setGameMode: React.Dispatch<React.SetStateAction<GameMode | null>>;
  openStartQuizDialog: boolean;
  prepareQuiz: (nbBirb: number) => void;
  startQuiz: () => void;
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
  region: DBRegion;
  setRegion: React.Dispatch<React.SetStateAction<DBRegion>>;
  isMobileDevice: boolean;
  openLocalizationDialog: boolean;
  setOpenLocalizationDialog: React.Dispatch<React.SetStateAction<boolean>>;
  openPublishDialog: boolean;
  setOpenPublishDialog: React.Dispatch<React.SetStateAction<boolean>>;
  openEditDialog: boolean;
  setOpenEditDialog: React.Dispatch<React.SetStateAction<boolean>>;
  dbBirbs: DB_BIRBS;
  setDBBirbs: React.Dispatch<React.SetStateAction<DB_BIRBS>>;
  openLearnDialog: boolean;
  setOpenLearnDialog: React.Dispatch<React.SetStateAction<boolean>>;
  currentTranslation: Translation;
};

export const QuizContext = createContext<QuizContextType | undefined>(
  undefined
);

type Progress = {
  timestamp: number;
  selectedBirbIds: string[];
  counter: number;
  sequence: string[];
  randomSeed: number;
  showAnswers: boolean[];
  answers: boolean[];
  answerInputs: string[];
  answerBirbIds: Array<string | null>;
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
  region: DBRegion;
  isMobileDevice: boolean;
  dbBirbs: DB_BIRBS;
  openLearnDialog: boolean;
};

function App() {
  const buildDate = process.env.REACT_APP_BUILD_DATE;

  const eBird = raw_eBird as Record<
    string,
    {
      sciName: string;
      comName: string;
      comNameFr: string;
    }
  >;
  const regionList = raw_region_list as Record<DBRegion, string[]>;

  const localStorageKey = "birbsquiz-2205";

  const loadProgress = (): Progress | null => {
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
    savedProgress?.counter !== undefined && isOneHourAgo
      ? savedProgress.counter
      : 0
  );

  const [sequence, setSequence] = React.useState<string[]>(() =>
    savedProgress?.sequence && isOneHourAgo ? savedProgress.sequence : []
  );

  const [randomSeed, setRandomSeed] = React.useState<number>(() =>
    savedProgress?.randomSeed !== undefined && isOneHourAgo
      ? savedProgress.randomSeed
      : 0
  );

  const [showAnswers, setShowAnswers] = React.useState<boolean[]>(() =>
    savedProgress?.showAnswers && isOneHourAgo ? savedProgress.showAnswers : []
  );

  const [answers, setAnswers] = React.useState<boolean[]>(() =>
    savedProgress?.answers && isOneHourAgo ? savedProgress.answers : []
  );

  const [answerInputs, setAnswerInputs] = React.useState<string[]>(() =>
    savedProgress?.answerInputs && isOneHourAgo ? savedProgress.answerInputs : []
  );

  const [answerBirbIds, setAnswerBirbIds] = React.useState<Array<string | null>>(
    () =>
      savedProgress?.answerBirbIds && isOneHourAgo
        ? savedProgress.answerBirbIds
        : [],
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

  const [openStartQuizDialog, setOpenStartQuizDialog] =
    React.useState<boolean>(false);

  const [openLocalizationDialog, setOpenLocalizationDialog] =
    React.useState<boolean>(() =>
      savedProgress?.openLocalizationDialog !== undefined
        ? savedProgress.openLocalizationDialog
        : true
    );

  const [openLearnDialog, setOpenLearnDialog] = React.useState<boolean>(() =>
    savedProgress?.openLearnDialog !== undefined && isOneHourAgo
      ? savedProgress.openLearnDialog
      : false
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
    quizStarted &&
    isOneHourAgo
      ? savedProgress.gameMode
      : null
  );

  const [currentList, setCurrentList] = React.useState<string>(() =>
    savedProgress?.currentList && isOneHourAgo
      ? savedProgress.currentList
      : CUSTOM
  );

  const [customList, setCustomList] = React.useState<string[]>(() =>
    savedProgress?.customList ? savedProgress.customList : []
  );

  const [songCheckbox, setSongCheckbox] = React.useState<boolean>(() =>
    savedProgress?.songCheckbox ?? true
  );

  const [callCheckbox, setCallCheckbox] = React.useState<boolean>(() =>
    savedProgress?.callCheckbox ?? false
  );

  const [language, setLanguage] = React.useState<Language>(() =>
    savedProgress?.language &&
    isValidEnumValue(Language, savedProgress.language)
      ? savedProgress.language
      : Language.FR
  );

  const [eBirdNameProperty, setEBirdNameProperty] =
    React.useState<EBirdNameProperty>(() =>
      savedProgress?.eBirdNameProperty &&
      isValidEnumValue(EBirdNameProperty, savedProgress.eBirdNameProperty)
        ? savedProgress.eBirdNameProperty
        : EBirdNameProperty.COMMON_NAME_FR
    );

  const [sliderValue, setSliderValue] = React.useState<number>(() =>
    savedProgress?.sliderValue !== undefined
      ? savedProgress.sliderValue
      : selectedBirbIds.length
  );

  const [region, setRegion] = React.useState<DBRegion>(() =>
    savedProgress?.region && isValidEnumValue(DBRegion, savedProgress.region)
      ? savedProgress.region
      : DBRegion.CA_QC
  );

  const [isMobileDevice, setIsMobileDevice] = React.useState<boolean>(false);

  const [dbBirbs, setDBBirbs] = React.useState<DB_BIRBS>(() =>
    savedProgress?.dbBirbs && isOneHourAgo ? savedProgress.dbBirbs : {}
  );

  const [currentTranslation, setCurrentTranslation] =
    React.useState<Translation>(translationFrench);

  const prepareQuiz = (nbBirb: number) => {
    setCounter(0);
    randomSequence(nbBirb);
    setShowAnswers(Array(nbBirb).fill(false));
    setAnswers(Array(nbBirb).fill(false));
    setAnswerInputs(Array(nbBirb).fill(""));
    setAnswerBirbIds(Array(nbBirb).fill(null));
  };

  const startQuiz = () => {
    setQuizStarted(true);
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
      setCurrentTranslation(translationFrench);
      setEBirdNameProperty(EBirdNameProperty.COMMON_NAME_FR);
    } else if (language === Language.EN) {
      setCurrentTranslation(translationEnglish);
      setEBirdNameProperty(EBirdNameProperty.COMMON_NAME);
    } else if (language === Language.LATIN) {
      setCurrentTranslation(translationLatin);
      setEBirdNameProperty(EBirdNameProperty.SCIENTIFIC_NAME);
    }
  }, [language]);

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
      answerInputs,
      answerBirbIds,
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
      openLearnDialog,
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
    answerInputs,
    answerBirbIds,
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
    openLearnDialog,
  ]);

  useEffect(() => {
    const visualViewport = window.visualViewport;
    let timeoutId: number | undefined;
    let animationFrameId: number | undefined;

    const updateViewportMetrics = () => {
      const viewportHeight = Math.round(
        visualViewport?.height ??
          document.documentElement.clientHeight ??
          window.innerHeight,
      );
      const viewportWidth = Math.round(
        visualViewport?.width ??
          document.documentElement.clientWidth ??
          window.innerWidth,
      );
      const isTouchDevice =
        window.matchMedia("(pointer: coarse)").matches ||
        navigator.maxTouchPoints > 0;

      setIsMobileDevice(
        isTouchDevice && Math.min(viewportWidth, viewportHeight) <= 900,
      );
      const vh = viewportHeight * 0.01;
      document.documentElement.style.setProperty(
        "--app-height",
        `${viewportHeight}px`,
      );
      document.documentElement.style.setProperty("--vh", `${vh}px`);
    };

    const scheduleViewportUpdate = () => {
      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId);
      }
      if (animationFrameId !== undefined) {
        window.cancelAnimationFrame(animationFrameId);
      }

      updateViewportMetrics();
      animationFrameId = window.requestAnimationFrame(updateViewportMetrics);
      timeoutId = window.setTimeout(updateViewportMetrics, 250);
    };

    scheduleViewportUpdate();
    window.addEventListener("resize", scheduleViewportUpdate);
    window.addEventListener("orientationchange", scheduleViewportUpdate);
    visualViewport?.addEventListener("resize", scheduleViewportUpdate);

    return () => {
      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId);
      }
      if (animationFrameId !== undefined) {
        window.cancelAnimationFrame(animationFrameId);
      }

      window.removeEventListener("resize", scheduleViewportUpdate);
      window.removeEventListener("orientationchange", scheduleViewportUpdate);
      visualViewport?.removeEventListener("resize", scheduleViewportUpdate);
    };
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
          answerInputs,
          answerBirbIds,
          endQuiz,
          setCounter,
          setAnswers,
          setShowAnswers,
          setAnswerInputs,
          setAnswerBirbIds,
          gameMode,
          setSelectedBirbIds,
          setOpenStartQuizDialog,
          setOpenSnake,
          setSnakeMessage,
          currentList,
          setCurrentList,
          customList,
          setCustomList,
          quizStarted,
          setQuizStarted,
          setGameMode,
          openStartQuizDialog,
          prepareQuiz,
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
          setDBBirbs,
          openLearnDialog,
          setOpenLearnDialog,
          currentTranslation,
        }}
      >
        <Box
          sx={{
            position: "fixed",
            inset: "0 auto auto 0",
            width: "100%",
            height: "var(--app-height, 100dvh)",
            minHeight: "var(--app-height, 100dvh)",
            overflow: "hidden",
            display: "grid",
            gridTemplateRows: "minmax(0, 1fr)",
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
              minHeight: 0,
              height: "100%",
              display: "grid",
              justifyContent: "center",
              gridTemplateColumns: "minmax(min-content, 800px)",
              paddingBottom: footerReservedSpace,
              boxSizing: "border-box",
            }}
          >
            {!quizStarted && <Lobby />}
            {quizStarted && <Quiz />}
          </Box>

          {/* Footer */}
          <Box
            sx={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              padding: "0.5rem var(--screen-padding)",
              paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))",
              display: "flex",
              justifyContent: "space-between",
              width: "100%",
              minWidth: 0,
              alignItems: "center",
              gap: "1rem",
              zIndex: 1200,
            }}
          >
            <Box>
              <Typography variant="caption">
                <Link
                  sx={footerTextSx}
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
                  sx={footerTextSx}
                  variant="caption"
                >
                  Build on {buildDate}
                </Typography>
              </Box>
            )}

            <Box>
              <Typography variant="caption">
                <Link
                  sx={footerTextSx}
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
            autoHideDuration={3000}
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
