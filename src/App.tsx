import React, { useCallback, useEffect, useMemo } from "react";
import Button from "@mui/material/Button";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import rawBirbsMapFr from "./dendroica/birbsMapFr.json";
import rawRecordingsMap from "./dendroica/recordingsMap.json";
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
  const recordingsMap = rawRecordingsMap as any;

  const [birbInput, setBirbInput] = React.useState<string>("");
  const [selectedBirbId, setSelectedBirbId] = React.useState<string>("");
  const [selectedBirbIds, setSelectedBirbIds] = React.useState<Array<string>>(
    () => {
      const urlBirbs = new URLSearchParams(window.location.search).get("birbs");
      if (urlBirbs)
        return JSON.parse(urlBirbs).filter((birbId: any) => birbsMapFr[birbId]);

      const localStorageBirbs = localStorage.getItem("selectedBirbIds");
      if (localStorageBirbs)
        return JSON.parse(localStorageBirbs).filter(
          (birbId: any) => birbsMapFr[birbId]
        );

      return [];
    }
  );
  // const [audioSources, setAudioSources] = React.useState<
  //   Map<string, Array<string>>
  // >(new Map());
  const [counter, setCounter] = React.useState(0);
  const [quizStarted, setQuizStarted] = React.useState(false);
  const [showAnswer, setShowAnswer] = React.useState(false);
  const [sequence, setSequence] = React.useState<Array<number>>();
  const [openSnake, setOpenSnake] = React.useState(false);
  const [snakeMessage, setSnakeMessage] = React.useState("");
  const birbEmoji = useMemo(
    () => birbEmojis[Math.floor(Math.random() * birbEmojis.length)],
    []
  );

  const addBirb = useCallback(
    (birbId: string) => {
      if (birbsMapFr[birbId] && !selectedBirbIds.find((id) => id === birbId)) {
        setSelectedBirbIds([...selectedBirbIds, birbId]);
      }
      setBirbInput("");
      setSelectedBirbId("");
    },
    [birbsMapFr, selectedBirbIds]
  );

  const deleteBirb = useCallback(
    (birbId: string) => {
      const newSelectedBirbIds = selectedBirbIds?.filter((id) => id !== birbId);
      setSelectedBirbIds(newSelectedBirbIds!);
    },
    [selectedBirbIds]
  );

  // const fetchBirb = useCallback(
  //   (birbId: string) => {
  //     console.log("fetchBirb", birbsMapFr[birbId]);
  //     if (!birbsMapFr[birbId]) {
  //       deleteBirb(birbId);
  //     } else {
  //       fetch(
  //         `https://www.whateverorigin.org/get?url=https://www.natureinstruct.org/srv/json.php/get_species/${birbId}`
  //       )
  //         .then((response) => response.json())
  //         .then((data) => {
  //           const regex = /\/files(.*?)mp3/g;
  //           const found = data.contents.match(regex);
  //           if (found.length > 0) {
  //             const recordings = found
  //               .splice(0, 3)
  //               .map((path: any) => `https://www.natureinstruct.org${path}`);
  //             setAudioSources(new Map(audioSources?.set(birbId, recordings)));
  //           } else {
  //             setAudioSources(new Map(audioSources?.set(birbId, [])));
  //           }
  //         })
  //         .catch((e) => console.warn(e));
  //     }
  //   },
  //   [audioSources, birbsMapFr, deleteBirb]
  // );

  const startQuiz = () => {
    setQuizStarted(true);
    setCounter(0);
    randomSequence(selectedBirbIds.length);
  };

  const nextQuestion = () => {
    if (counter === selectedBirbIds.length - 1) {
      endQuiz();
    } else {
      setCounter(counter + 1);
    }
    setShowAnswer(false);
  };

  const endQuiz = () => {
    setCounter(0);
    setQuizStarted(false);
  };

  const copyUrl = () => {
    let url = `${
      window.location.href.split("?")[0]
    }?birbs=${localStorage.getItem("selectedBirbIds")}`.replaceAll(" ", "%20");
    navigator.clipboard.writeText(url);
    setSnakeMessage("Lien copié!");
    setOpenSnake(true);
  };

  const hi = async () => {
    const idsToFetch = Object.keys(birbsMapFr);
    const myMap: any = {};

    // while (myMap.size < idsToFetch.length) {
    for (const birbId of idsToFetch) {
      if (myMap[birbId]) continue;
      fetch(`https://www.natureinstruct.org/srv/json.php/get_species/${birbId}`)
        .then((response) => response.text())
        .then((data) => {
          const regex = /\/files(.*?)mp3/g;
          const found = data.match(regex);
          if (found && found.length > 0) {
            const recordings = found
              .splice(0, 3)
              .map((path: any) => `https://www.natureinstruct.org${path}`);
            myMap[birbId] = recordings;
            console.log(JSON.stringify(myMap));
          } else {
            myMap[birbId] = [];
          }
        })
        .catch((e) => console.warn(e));
    }
  };

  useEffect(() => {
    // hi();
  }, []);

  // useEffect(() => {
  //   console.log(audioSources);
  // }, [audioSources]);

  useEffect(() => {
    if (selectedBirbId) addBirb(selectedBirbId);
  }, [selectedBirbId, addBirb]);

  useEffect(() => {
    localStorage.setItem("selectedBirbIds", JSON.stringify(selectedBirbIds));
  }, [selectedBirbIds]);

  // useEffect(() => {
  //   if (!quizStarted || !sequence) return;

  //   // fetch this birb
  //   if (counter === 0) {
  //     fetchBirb(selectedBirbIds[sequence![counter]]);
  //   }

  //   // fetch next birb
  //   if (counter < selectedBirbIds.length - 1) {
  //     fetchBirb(selectedBirbIds[sequence![counter + 1]]);
  //   }
  // }, [quizStarted, counter, sequence, fetchBirb, selectedBirbIds]);

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
    // const audioSource = audioSources.get(selectedBirbIds[sequence![counter]]);
    const audioSource = recordingsMap[selectedBirbIds[sequence![counter]]];
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
          <Typography variant="body1">Cet oiseau ne change pas.</Typography>
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
            {birbEmoji}
          </Typography>

          {!quizStarted && (
            <>
              <Autocomplete
                inputValue={birbInput}
                onInputChange={(e, v) => setBirbInput(v)}
                value={selectedBirbId}
                onChange={(e, v) => setSelectedBirbId(v!)}
                options={Object.keys(birbsMapFr).sort((a, b) =>
                  birbsMapFr[a].localeCompare(birbsMapFr[b])
                )}
                getOptionLabel={(birbId) =>
                  birbsMapFr[birbId] ? birbsMapFr[birbId] : ""
                }
                freeSolo
                isOptionEqualToValue={(birbId, input) =>
                  birbsMapFr[birbId] === input
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Recherche ..."
                    variant="outlined"
                  />
                )}
                popupIcon={null}
              />

              {selectedBirbIds.length > 0 && (
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
                  {selectedBirbIds.map((birbId, i) => (
                    <Chip
                      key={`chip-${i}`}
                      label={birbsMapFr[birbId]}
                      variant="outlined"
                      onDelete={() => deleteBirb(birbId)}
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
                  disabled={selectedBirbIds.length <= 0}
                >
                  Partager
                </Button>
                <Button
                  variant="contained"
                  onClick={startQuiz}
                  disabled={selectedBirbIds.length <= 0}
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
                value={((counter + 1) / selectedBirbIds.length) * 100}
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
                  {showAnswer
                    ? birbsMapFr[selectedBirbIds[sequence![counter]]]
                    : "???"}
                </Typography>
              </Box>

              <Button
                variant={
                  counter === selectedBirbIds.length - 1
                    ? "contained"
                    : "outlined"
                }
                onClick={nextQuestion}
                disabled={!showAnswer}
              >
                {counter === selectedBirbIds.length - 1
                  ? "Terminer"
                  : "Prochain"}
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
