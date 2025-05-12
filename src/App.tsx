import "./App.css";
import React, { createContext, useEffect, useMemo } from "react";
import rawBirbsMapFr from "./dendroica/birbsMapFr.json";
import rawData from "./dendroica/data.json";
import { Box, Link, Snackbar, Typography } from "@mui/material";
import Lobby from "./components/Lobby";
import Quiz from "./components/Quiz";
import StartQuizDialog from "./components/Dialog/StartQuizDialog";
import EndQuizDialog from "./components/Dialog/EndQuizDialog";

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
  dataMap: any;
  birbsMapFr: any;
  sequence: Array<number>;
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
  gameMode: string;
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
};

export const QuizContext = createContext<QuizContextType | undefined>(
  undefined
);

function App() {
  const birbsMapFr = rawBirbsMapFr as any;
  const dataMap = rawData as any;

  // Helper to load progress from localStorage
  const loadProgress = () => {
    const saved = localStorage.getItem("birbsQuizProgress");
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
            ? parsedBirbs.filter((birbId: any) => birbsMapFr[birbId])
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
      return JSON.parse(atob("WyIyNCIsIjQyOSIsIjI3MCJd"));
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

  const [sequence, setSequence] = React.useState<Array<number>>(
    () => savedProgress.sequence || []
  );

  const [showAnswers, setShowAnswers] = React.useState<Array<boolean>>(
    () => savedProgress.showAnswers || []
  );

  const [answers, setAnswers] = React.useState<Array<boolean>>(
    () => savedProgress.answers || []
  );

  const [quizStarted, setQuizStarted] = React.useState<boolean>(
    () => savedProgress.quizStarted || false
  );

  const [openSnake, setOpenSnake] = React.useState<boolean>(false);
  const [snakeMessage, setSnakeMessage] = React.useState<string>("");

  const birbEmoji = useMemo(
    () => birbEmojis[Math.floor(Math.random() * birbEmojis.length)],
    []
  );

  const [openEndQuizDialog, setOpenEndQuizDialog] = React.useState<boolean>(
    () => savedProgress.openEndQuizDialog || false
  );

  const [openStartQuizDialog, setOpenStartQuizDialog] = React.useState(
    () => savedProgress.openStartQuizDialog || false
  );

  const [gameMode, setGameMode] = React.useState<GameMode>(
    () => savedProgress.gameMode || GameMode.CHANTS
  );

  const [currentList, setCurrentList] = React.useState<string>(
    () => savedProgress.currentList || "Custom"
  );

  const [customList, setCustomList] = React.useState<Array<string>>(
    () => savedProgress.customList || []
  );

  const startQuiz = (nbBirb: number) => {
    setCounter(0);
    randomSequence(nbBirb);
    setShowAnswers(Array(nbBirb).fill(false));
    setAnswers(Array(nbBirb).fill(false));
  };

  const endQuiz = () => {
    if (counter === sequence.length - 1) setOpenEndQuizDialog(true);
    setCounter(0);
    setQuizStarted(false);
  };

  const randomSequence = (max: number) => {
    const newSequence = [...Array(selectedBirbIds.length).keys()];
    shuffleArray(newSequence);
    setSequence(newSequence.splice(0, max));
  };

  const shuffleArray = (array: Array<any>) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = array[i];
      array[i] = array[j];
      array[j] = temp;
    }
  };

  // Save quiz progress to localStorage whenever any dependency changes
  useEffect(() => {
    const progress = {
      selectedBirbIds,
      counter,
      sequence,
      showAnswers,
      answers,
      quizStarted,
      openEndQuizDialog,
      openStartQuizDialog,
      gameMode,
      currentList,
      customList,
    };
    localStorage.setItem("birbsQuizProgress", JSON.stringify(progress));
  }, [
    selectedBirbIds,
    counter,
    sequence,
    showAnswers,
    answers,
    quizStarted,
    openEndQuizDialog,
    openStartQuizDialog,
    gameMode,
    currentList,
    customList,
  ]);

  const css_height_90 = "calc(var(--vh, 1vh) * 90)";

  useEffect(() => {
    const setVh = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty("--vh", `${vh}px`);
    };
    setVh();
    window.addEventListener("resize", setVh);
    return () => window.removeEventListener("resize", setVh);
  }, []);

  return (
    <QuizContext.Provider
      value={{
        dataMap,
        birbsMapFr,
        sequence,
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
      }}
    >
      <Box sx={{ height: css_height_90 }}>
        <Box
          sx={{
            height: css_height_90,
            padding: "2rem",
            paddingBottom: "0",
            display: "grid",
            justifyContent: "center",
            gridTemplateColumns: "minmax(min-content, 800px)",
            alignContent: "flex-start",
            gap: "0rem",
          }}
        >
          {!quizStarted && <Lobby />}
          {quizStarted && <Quiz />}
        </Box>

        <Box sx={{ position: "absolute", bottom: 0, left: "2rem" }}>
          <Typography sx={{ color: "#dcdcdc" }} variant="caption">
            <Link
              sx={{ color: "#dcdcdc" }}
              target="_blank"
              rel="noopener"
              underline="hover"
              href="https://www.natureinstruct.org/dendroica/"
            >
              DENDROICA
            </Link>
          </Typography>
        </Box>

        <Box sx={{ position: "absolute", bottom: 0, right: "2rem" }}>
          <Typography sx={{ color: "#dcdcdc" }} variant="caption">
            <Link
              sx={{ color: "#dcdcdc" }}
              target="_blank"
              rel="noopener"
              underline="hover"
              href="https://www.linkedin.com/in/xishec/"
            >
              Xi Chen
            </Link>
          </Typography>
        </Box>

        <StartQuizDialog />
        <EndQuizDialog />

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
  );
}

export default App;
