import "./App.css";
import React, { useEffect, useMemo } from "react";
import rawBirbsMapFr from "./dendroica/birbsMapFr.json";
import rawData from "./dendroica/data.json";
import { Box, Link, Snackbar, Typography } from "@mui/material";
import Welcome from "./components/Welcome";
import Quiz from "./components/Quiz";
import QuizDialog from "./components/QuizDialog";

const birbEmojis = [
  " 🐦‍⬛",
  " 🦤",
  " 🦜",
  " 🦅",
  " 🦚",
  " 🦃",
  " 🦉",
  " 🦢",
  " 🦩",
  " 🦆",
  " 🪿",
  " 🥚",
  " 🍳",
];

function App() {
  const birbsMapFr = rawBirbsMapFr as any;
  const dataMap = rawData as any;

  const [selectedBirbIds, setSelectedBirbIds] = React.useState<Array<string>>(
    () => {
      const urlBirbs = new URLSearchParams(window.location.search).get("birbs");
      if (urlBirbs)
        return JSON.parse(atob(urlBirbs)).filter(
          (birbId: any) => birbsMapFr[birbId]
        );

      return [];
    }
  );
  const [counter, setCounter] = React.useState(0);
  const [sequence, setSequence] = React.useState<Array<number>>([]);
  const [showAnswers, setShowAnswers] = React.useState<Array<boolean>>([]);
  const [answers, setAnswers] = React.useState<Array<boolean>>([]);
  const [quizStarted, setQuizStarted] = React.useState(false);
  const [openSnake, setOpenSnake] = React.useState(false);
  const [snakeMessage, setSnakeMessage] = React.useState("");
  const birbEmoji = useMemo(
    () => birbEmojis[Math.floor(Math.random() * birbEmojis.length)],
    []
  );
  const [openQuizDialog, setOpenQuizDialog] = React.useState(false);

  const startQuiz = () => {
    setQuizStarted(true);
    setCounter(0);
    randomSequence(selectedBirbIds.length);
    setShowAnswers(Array(selectedBirbIds.length).fill(false));
    setAnswers(Array(selectedBirbIds.length).fill(false));
  };

  const endQuiz = () => {
    setCounter(0);
    setQuizStarted(false);
    setOpenQuizDialog(true);
  };

  const randomSequence = (max: number) => {
    const newSequence = [...Array(max).keys()];
    shuffleArray(newSequence);
    setSequence(newSequence);
  };

  const shuffleArray = (array: Array<any>) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = array[i];
      array[i] = array[j];
      array[j] = temp;
    }
  };

  useEffect(() => {
    const url = new URL(window.location.href);
    if (selectedBirbIds.length > 0) {
      const encodedBirbs = btoa(JSON.stringify(selectedBirbIds));
      url.searchParams.set("birbs", encodedBirbs);
    } else {
      url.searchParams.delete("birbs");
    }
    window.history.pushState(null, "", url.toString());
  }, [selectedBirbIds]);

  const css_height_90 = "calc(var(--vh, 1vh) * 90)";

  const welcomeProps = {
    birbsMapFr,
    birbEmoji,
    selectedBirbIds,
    setSelectedBirbIds,
    startQuiz,
    setOpenSnake,
    setSnakeMessage,
    css_height_90,
  };

  const quizProps = {
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
  };

  const quizDialogProps = {
    birbsMapFr,
    selectedBirbIds,
    answers,
    openQuizDialog,
    setOpenQuizDialog,
  };

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
        {!quizStarted && <Welcome {...welcomeProps} />}

        {quizStarted && <Quiz {...quizProps} />}
      </Box>

      <Box sx={{ position: "absolute", bottom: 0, left: "0.25rem" }}>
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

      <Box sx={{ position: "absolute", bottom: 0, right: "0.25rem" }}>
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

      <QuizDialog {...quizDialogProps} />

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
  );
}

export default App;
