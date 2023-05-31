import React, { useEffect } from "react";
import Button from "@mui/material/Button";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import rawBirbs from "./birbsMap.json";
import {
  Box,
  Chip,
  CircularProgress,
  Snackbar,
  Switch,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import "./App.css";

function App() {
  let birbsMap = rawBirbs as any;
  const [birbInput, setBirbInput] = React.useState<string>("");
  const [selectedBirb, setSelectedBirb] = React.useState<string>("");
  const [selectedBirbs, setSelectedBirbs] = React.useState<Array<string>>(
    localStorage.getItem("selectedBirbs")
      ? JSON.parse(localStorage.getItem("selectedBirbs")!)
      : []
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
            .splice(0, 3)
            .map((recording: any) => recording.file);
          setAudioSources(new Map(audioSources?.set(birb, recordings)));
        } else {
          deleteBirb(birb);
          setOpenSnake(true);
          setSnakeMessage("Cet oiseau ne chante pas.");
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

  return (
    <Box sx={{ maxHeight: "100vh" }}>
      <Box
        sx={{
          display: "grid",
          height: "100%",
          gridTemplateRows: "min-content 1fr",
        }}
      >
        <Box
          sx={{ padding: "1rem", display: "grid", justifyContent: "center" }}
        >
          <Typography variant="h1">Birbsquiz</Typography>
        </Box>

        <Box
          sx={{
            padding: "1rem",
            display: "grid",
            justifyContent: "center",
            gridTemplateColumns: "minmax(min-content, 800px)",
          }}
        >
          {!quizStarted && (
            <Box
              sx={{
                display: "grid",
                gap: "1rem",
                gridTemplateRows: "min-content max-content min-content",
              }}
            >
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
              <Box
                sx={{
                  display: "grid",
                  gap: "0.5rem",
                  gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
                  overflowY: "scroll",
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

              <Button
                variant="contained"
                onClick={startQuiz}
                disabled={selectedBirbs.length <= 0}
              >
                Quiz moi
              </Button>
            </Box>
          )}

          {quizStarted && (
            <Box sx={{ display: "grid", gap: "1rem" }}>
              <Box
                sx={{
                  display: "grid",
                  gap: "1rem",
                  gridTemplateColumns: "repeat(auto-fill, 1fr)",
                }}
              >
                {audioSources.size <= 0 && (
                  <Box
                    sx={{
                      display: "grid",
                      justifyContent: "center",
                    }}
                  >
                    <CircularProgress color="inherit" />
                  </Box>
                )}
                {audioSources.size > 0 &&
                  audioSources
                    .get(selectedBirbs[sequence![counter]])!
                    .map((audioSource: string, i: number) => (
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

              <Box sx={{ display: "grid", gap: "1rem" }}>
                <Button
                  variant={
                    counter === selectedBirbs.length - 1
                      ? "contained"
                      : "outlined"
                  }
                  onClick={nextQuestion}
                  disabled={!showAnswer}
                >
                  {counter === selectedBirbs.length - 1
                    ? "Terminer"
                    : "Prochain"}
                </Button>
              </Box>
            </Box>
          )}
        </Box>

        <Snackbar
          open={openSnake}
          autoHideDuration={5000}
          message={snakeMessage}
          onClose={() => {
            setOpenSnake(false);
            setSnakeMessage("");
          }}
          action={<CloseIcon fontSize="small" />}
        />
      </Box>
    </Box>
  );
}

export default App;
