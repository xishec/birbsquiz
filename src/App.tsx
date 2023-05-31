import React, { useEffect } from "react";
import Button from "@mui/material/Button";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import rawBirbs from "./birbs.json";
import { Box, Chip, CircularProgress } from "@mui/material";

function App() {
  let birbs = rawBirbs as any;

  const [selectedBirb, setSelectedBirb] = React.useState<string>();
  const [selectedBirbs, setSelectedBirbs] = React.useState<Array<string>>(
    JSON.parse(localStorage.getItem("selectedBirbs")!)
  );
  const [audioSources, setAudioSources] = React.useState<
    Map<string, Array<string>>
  >(new Map());
  const [counter, setCounter] = React.useState(0);
  const [quizStarted, setQuizStarted] = React.useState(false);
  const [showAnswer, setShowAnswer] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [sequence, setSequence] = React.useState<Array<number>>();

  const addBirb = (birbToAdd: string) => {
    if (!selectedBirbs.find((birb) => birb === birbToAdd)) {
      setSelectedBirb(birbToAdd!);
      setSelectedBirbs([...selectedBirbs, birbToAdd!]);
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
    if (counter == selectedBirbs.length - 1) {
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

  const fetchBirb = (birb: string) => {
    // setLoading(true);
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
    <Box>
      {!quizStarted && (
        <Box sx={{ margin: "1rem", display: "grid", gap: "1rem" }}>
          <Autocomplete
            value={selectedBirb}
            onChange={(e, birbToAdd) => {
              addBirb(birbToAdd!);
            }}
            freeSolo
            options={Object.keys(birbs)}
            renderInput={(params) => (
              <TextField {...params} label="Recherche" />
            )}
          />
          <Box sx={{ display: "flex", gap: "0.5rem" }}>
            {selectedBirbs.map((birb) => (
              <Chip
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
            Quiz
          </Button>
        </Box>
      )}

      {quizStarted && (
        <Box sx={{ margin: "1rem", display: "grid", gap: "1rem" }}>
          {loading && (
            <Box sx={{ display: "flex" }}>
              <CircularProgress />
            </Box>
          )}
          {audioSources.size > 0 && (
            <Box sx={{ display: "flex", gap: "0.5rem" }}>
              {audioSources
                .get(selectedBirbs[sequence![counter]])!
                .map((audioSource: string) => (
                  <audio controls src={audioSource}>
                    Your browser does not support the
                    <code>audio</code> element.
                  </audio>
                ))}
            </Box>
          )}
          <Box sx={{ display: "grid", gap: "1rem" }}>
            <Button variant="contained" onClick={nextQuestion}>
              {counter === selectedBirbs.length ? "Terminer" : "Prochain"}
            </Button>

            {!showAnswer && (
              <Button variant="contained" onClick={() => setShowAnswer(true)}>
                Réponse
              </Button>
            )}
            {showAnswer && (
              <Box>
                <Chip
                  label={selectedBirbs[sequence![counter]]}
                  variant="outlined"
                />
              </Box>
            )}
          </Box>
        </Box>
      )}
    </Box>
  );
}

export default App;
