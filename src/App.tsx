import React, { useEffect, useMemo } from "react";
import Button from "@mui/material/Button";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import rawBirbs from "./birbsMap.json";
import {
  Box,
  Chip,
  CircularProgress,
  Link,
  Snackbar,
  Switch,
  Typography,
} from "@mui/material";
import LinearProgress, {
  LinearProgressProps,
} from "@mui/material/LinearProgress";

import "./App.css";

function LinearProgressWithLabel(
  props: LinearProgressProps & { value: number }
) {
  return (
    <Box sx={{ display: "flex", alignItems: "center" }}>
      <Box sx={{ width: "100%", mr: 1 }}>
        <LinearProgress variant="determinate" {...props} />
      </Box>
      <Box sx={{ minWidth: 35 }}>
        <Typography variant="body2" color="text.secondary">{`${Math.round(
          props.value
        )}%`}</Typography>
      </Box>
    </Box>
  );
}

const birdEmojis = [
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
  let birbsMap = rawBirbs as any;
  const [birbInput, setBirbInput] = React.useState<string>("");
  const [selectedBirb, setSelectedBirb] = React.useState<string>("");
  const [selectedBirbs, setSelectedBirbs] = React.useState<Array<string>>(
    () => {
      const urlBirbs = new URLSearchParams(window.location.search).get("birbs");
      if (urlBirbs)
        return JSON.parse(urlBirbs).filter((birb: any) => birbsMap[birb]);

      const localStorageBirbs = localStorage.getItem("selectedBirbs");
      if (localStorageBirbs)
        return JSON.parse(localStorageBirbs).filter(
          (birb: any) => birbsMap[birb]
        );

      return [];
    }
  );
  const [audioSources, setAudioSources] = React.useState<
    Map<string, Array<string>>
  >(new Map());
  const [counter, setCounter] = React.useState(0);
  const [quizStarted, setQuizStarted] = React.useState(false);
  const [showAnswer, setShowAnswer] = React.useState(false);
  const [sequence, setSequence] = React.useState<Array<number>>();
  const [openSnake, setOpenSnake] = React.useState(false);
  const [snakeMessage, setSnakeMessage] = React.useState("");
  const birdEmoji = useMemo(
    () => birdEmojis[Math.floor(Math.random() * birdEmojis.length)],
    []
  );

  const addBirb = (birbToAdd: string) => {
    if (
      birbsMap[birbToAdd] &&
      !selectedBirbs.find((birb) => birb === birbToAdd)
    ) {
      setSelectedBirbs([...selectedBirbs, birbToAdd]);
    }
    setBirbInput("");
    setSelectedBirb("");
  };

  const deleteBirb = (birbToDelete: string) => {
    const newSelectedBirbs = selectedBirbs?.filter(
      (birb) => birb !== birbToDelete
    );
    setSelectedBirbs(newSelectedBirbs!);
  };

  const startQuiz = () => {
    setQuizStarted(true);
    setCounter(0);
    randomSequence(selectedBirbs.length);
  };

  const nextQuestion = () => {
    if (counter === selectedBirbs.length - 1) {
      setCounter(0);
      setQuizStarted(false);
    } else {
      setCounter(counter + 1);
    }
    setShowAnswer(false);
  };

  const copyUrl = () => {
    let url = `${
      window.location.href.split("?")[0]
    }?birbs=${localStorage.getItem("selectedBirbs")}`.replaceAll(" ", "%20");
    navigator.clipboard.writeText(url);
    setSnakeMessage("Lien copié!");
    setOpenSnake(true);
  };

  useEffect(() => {
    if (quizStarted && sequence) fetchBirb(selectedBirbs[sequence[counter]]);
  }, [quizStarted]);

  useEffect(() => {
    if (selectedBirb) addBirb(selectedBirb);
  }, [selectedBirb]);

  useEffect(() => {
    // console.log(audioSources);
  }, [audioSources]);

  useEffect(() => {
    localStorage.setItem("selectedBirbs", JSON.stringify(selectedBirbs));
  }, [selectedBirbs]);

  useEffect(() => {
    if (counter < selectedBirbs.length - 1 && sequence) {
      fetchBirb(selectedBirbs[sequence![counter + 1]]);
    }
  }, [counter, sequence]);

  const fetchBirb = (birb: string) => {
    if (!birbsMap[birb]) {
      deleteBirb(birb);
    }
    const latinName = birbsMap[birb] as string;
    fetch(
      `https://xeno-canto.org/api/2/recordings?query=${latinName
        .replace(" ", "%20")
        .toLowerCase()}%20q:A`
    )
      .then((response) => response.json())
      .then((data) => {
        if (data.recordings.length > 0) {
          const recordings = data.recordings
            .filter(
              (recording: any) =>
                !recording["file-name"].includes(".wav") &&
                !recording.type.includes("drumming")
            )
            .splice(0, 3)
            .map((recording: any) => recording.file);
          setAudioSources(new Map(audioSources?.set(birb, recordings)));
        } else {
          setAudioSources(new Map(audioSources?.set(birb, [])));
        }
      });
  };

  // const fetchBirbs = (birbsToAdd: Array<string>, birbToAdd?: string) => {
  //   Promise.all(
  //     birbsToAdd.map((birb: string) => {
  //       if (!birbsMap[birb]) {
  //         deleteBirb(birb);
  //       }
  //       const latinName = birbsMap[birb] as string;
  //       return fetch(
  //         `https://xeno-canto.org/api/2/recordings?query=${latinName
  //           .replace(" ", "%20")
  //           .toLowerCase()}%20q:A`
  //       );
  //     })
  //   )
  //     .then((results) => Promise.all(results.map((result) => result.json())))
  //     .then((results: Array<any>) => {
  //       console.log(results);
  //       results.forEach((result) => {
  //         if (result.recordings) {
  //           const latinName = `${result.recordings[0].gen} ${result.recordings[0].sp}`;
  //           const recordings = result.recordings
  //             .splice(0, 3)
  //             .map((recording: any) => recording.file);
  //           setAudioSources(new Map(audioSources?.set(latinName, recordings)));
  //         } else {
  //           deleteBirb(birbToAdd!);
  //           setOpenSnake(true);
  //           setSnakeMessage(`${birbToAdd} ne chante pas.`);
  //         }
  //       });
  //     });
  // };

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

  const getAudioSource = () => {
    const audioSource = audioSources.get(selectedBirbs[sequence![counter]]);
    return (
      <>
        {!audioSource && (
          <Box
            sx={{
              display: "grid",
              justifyContent: "center",
            }}
          >
            <CircularProgress />
          </Box>
        )}
        {audioSource &&
          audioSource.length > 0 &&
          audioSource.map((audioSource: string, i: number) => (
            <audio
              key={`audio-${i}`}
              style={{ width: "100%" }}
              controls
              src={audioSource}
            >
              Your browser does not support the
              <code>audio</code> element.
            </audio>
          ))}

        {audioSource && audioSource.length === 0 && (
          <Typography variant="body1">This brib doesn't sing</Typography>
        )}
      </>
    );
  };

  return (
    <Box sx={{ height: "100vh" }}>
      <Box
        sx={{
          height: "80%",
          padding: "2rem",
          display: "grid",
          justifyContent: "center",
          gridTemplateColumns: "minmax(min-content, 800px)",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: "2rem",
            height: "100%",
            overflow: "auto",
          }}
        >
          <Typography variant="h2">
            {/* <Box component="span" sx={{ color: "primary.main" }}> */}
            Birbsquiz
            {/* </Box> */}
            {birdEmoji}
          </Typography>

          {!quizStarted && (
            <>
              <Autocomplete
                inputValue={birbInput}
                onInputChange={(e, v) => setBirbInput(v)}
                value={selectedBirb}
                onChange={(e, v) => setSelectedBirb(v!)}
                options={Object.keys(birbsMap)}
                getOptionLabel={(option) => option}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Recherche ..."
                    variant="outlined"
                  />
                )}
                open={birbInput.length > 2}
                popupIcon={null}
              />

              {selectedBirbs.length > 0 && (
                <Box
                  sx={{
                    maxHeight: "100%",
                    display: "grid",
                    gridTemplateRows: "min-content min-content min-content",
                    overflow: "auto",
                    gap: "0.5rem",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(200px, 1fr))",
                  }}
                >
                  {selectedBirbs.map((birb, i) => (
                    <Chip
                      key={`chip-${i}`}
                      label={birb}
                      variant="outlined"
                      onDelete={() => deleteBirb(birb)}
                    />
                  ))}
                </Box>
              )}

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "1rem",
                }}
              >
                <Button
                  variant="outlined"
                  onClick={copyUrl}
                  disabled={selectedBirbs.length <= 0}
                >
                  Partager
                </Button>
                <Button
                  variant="contained"
                  onClick={startQuiz}
                  disabled={selectedBirbs.length <= 0}
                >
                  Quiz moi
                </Button>
              </Box>
              
              <Box sx={{ position: "absolute", bottom: 0, left: "0.25rem" }}>
                <Typography sx={{ color: "#dcdcdc" }} variant="caption">
                  <Link
                    sx={{ color: "#dcdcdc" }}
                    target="_blank"
                    rel="noopener"
                    underline="hover"
                    href="https://xeno-canto.org"
                  >
                    xeno-canto
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
            </>
          )}

          {quizStarted && (
            <>
              <LinearProgressWithLabel
                value={((counter + 1) / selectedBirbs.length) * 100}
              />

              <Box
                sx={{
                  display: "grid",
                  gap: "1rem",
                  gridTemplateColumns: "repeat(auto-fill, 1fr)",
                }}
              >
                {getAudioSource()}
              </Box>

              <Box
                sx={{
                  display: "grid",
                  alignItems: "center",
                  gap: "1rem",
                  gridTemplateColumns: "min-content 1fr",
                }}
              >
                <Switch
                  checked={showAnswer}
                  onChange={() => setShowAnswer(!showAnswer)}
                />
                <Typography variant="body1">
                  {showAnswer ? selectedBirbs[sequence![counter]] : "???"}
                </Typography>
              </Box>

              <Button
                variant={
                  counter === selectedBirbs.length - 1
                    ? "contained"
                    : "outlined"
                }
                onClick={nextQuestion}
                disabled={!showAnswer}
              >
                {counter === selectedBirbs.length - 1 ? "Terminer" : "Prochain"}
              </Button>
            </>
          )}
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
    </Box>
  );
}

export default App;
