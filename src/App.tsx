import React, { useEffect } from "react";
import Button from "@mui/material/Button";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import rawBirbs from "./birbs.json";
import { Box, Chip, Switch, Typography } from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import "./App.css";

function App() {
  let birbs = rawBirbs as any;
  const [birbInput, setBirbInput] = React.useState<string>("");
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

  const addBirb = (birbToAdd: string) => {
    if (!selectedBirbs.find((birb) => birb === birbToAdd)) {
      setSelectedBirbs([...selectedBirbs, birbToAdd]);
      fetchBirb(birbToAdd);
    }
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
    selectedBirbs.map((birb) => fetchBirb(birb));
  }, []);

  useEffect(() => {
    console.log(audioSources);
  }, [audioSources]);

  useEffect(() => {
    localStorage.setItem("selectedBirbs", JSON.stringify(selectedBirbs));
  }, [selectedBirbs]);

  useEffect(() => {
    if (birbs[birbInput]) addBirb(birbInput);
  }, [birbInput]);

  const fetchBirb = (birb: string) => {
    // setLoading(true);
    if (!birbs[birb]) {
      deleteBirb(birb);
    }
    const latinName = birbs[birb] as string;
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
          console.warn("no recording");
        }
        // setLoading(false);
      });
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

  return (
    <Box sx={{ height: "100vh" }}>
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
              {/* <Autocomplete
                value={selectedBirb}
                onChange={(e, birbInput) => {
                  console.log("hi", e.target);
                  // if (birbInput) {
                  //   console.log(birbInput);
                  //   setBirbInput(birbInput);
                  //   if (birbs[birbInput]) addBirb(birbInput);
                  // }
                }}
                freeSolo
                // open={birbInput.length > 2}
                options={Object.keys(birbs)}
                renderInput={(params) => (
                  <TextField {...params} label="Recherche" />
                )}
              /> */}
              <Autocomplete
                inputValue={birbInput}
                onInputChange={(e, v) => setBirbInput(v)}
                options={Object.keys(birbs)}
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

              <LoadingButton
                loading={selectedBirbs.length !== audioSources.size}
                variant="contained"
                onClick={startQuiz}
                disabled={
                  selectedBirbs.length <= 0 ||
                  selectedBirbs.length !== audioSources.size
                }
              >
                Quiz moi
              </LoadingButton>
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
                {audioSources
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
      </Box>
    </Box>
  );
}

export default App;
