import "./App.css";
import React, { useCallback, useEffect, useMemo } from "react";
import Button from "@mui/material/Button";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import rawBirbsMapFr from "./dendroica/birbsMapFr.json";
import rawRecordingsMap from "./dendroica/recordingsMap.json";
import rawPhotosMap from "./dendroica/photosMap.json";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import {
  Box,
  Chip,
  Link,
  Snackbar,
  Switch,
  Tab,
  Typography,
  styled,
} from "@mui/material";

const StyledChip = styled(Chip)({
  root: {
    width: "70%",
    position: "relative",
  },
  svg: {
    position: "absolute",
    right: 0,
  },
});

const birbEmojis = [
  " 🐦‍⬛",
  " 🦤",
  " 🦜",
  " 🦅",
  // " 🦚",
  " 🦃",
  // " 🦉",
  " 🦢",
  " 🦩",
  " 🦆",
  " 🪿",
  " 🥚",
  // " 🍳",
];

function App() {
  const birbsMapFr = rawBirbsMapFr as any;
  const recordingsMap = rawRecordingsMap as any;
  const photosMap = rawPhotosMap as any;

  const [birbInput, setBirbInput] = React.useState<string>("");
  const [selectedBirbId, setSelectedBirbId] = React.useState<string>("");
  const [selectedBirbIds, setSelectedBirbIds] = React.useState<Array<string>>(
    () => {
      const urlBirbs = new URLSearchParams(window.location.search).get("birbs");
      if (urlBirbs)
        return JSON.parse(atob(urlBirbs)).filter(
          (birbId: any) => birbsMapFr[birbId]
        );

      const localStorageBirbs = localStorage.getItem("selectedBirbIds");
      if (localStorageBirbs)
        return JSON.parse(localStorageBirbs).filter(
          (birbId: any) => birbsMapFr[birbId]
        );

      return [];
    }
  );
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
  const [value, setValue] = React.useState("1");

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
  };

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
    const encodedBirbs = btoa(localStorage.getItem("selectedBirbIds")!);
    let url = `${window.location.href.split("?")[0]}?birbs=${encodedBirbs}`;
    navigator.clipboard.writeText(url);
    setSnakeMessage(`Lien copié (${url})`);
    setOpenSnake(true);
  };

  const hi = async () => {
    const idsToFetch = Object.keys(birbsMapFr);
    // .splice(0, 3);
    const myMap: any = {};

    // while (myMap.size < idsToFetch.length) {
    for (const birbId of idsToFetch) {
      if (myMap[birbId]) continue;
      fetch(`https://www.natureinstruct.org/srv/json.php/get_species/${birbId}`)
        .then((response) => response.text())
        .then((data) => {
          const regex = /\/files(.*?)jpg/g;
          const found = data.match(regex);
          if (found && found.length > 0) {
            const recordings = found
              .splice(0, 1)
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

  useEffect(() => {
    if (selectedBirbId) addBirb(selectedBirbId);
  }, [selectedBirbId, addBirb]);

  useEffect(() => {
    localStorage.setItem("selectedBirbIds", JSON.stringify(selectedBirbIds));
  }, [selectedBirbIds]);

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
            gap: "1.5rem",
            height: "100%",
            overflow: "auto",
          }}
        >
          {!quizStarted && (
            <>
              <Typography variant="h2">
                {/* <Box component="span" sx={{ color: "primary.main" }}> */}
                Birbsquiz
                {/* </Box> */}
                {birbEmoji}
              </Typography>

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
              />

              {selectedBirbIds.length > 0 && (
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateRows: "min-content min-content min-content",
                    overflow: "auto",
                    gap: "0.5rem",
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  }}
                >
                  {selectedBirbIds.map((birbId, i) => (
                    <StyledChip
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
                  gridTemplateColumns: "1fr",
                }}
              >
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "1.5rem",
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

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                  }}
                >
                  <Typography
                    sx={{ position: "relative", top: 0 }}
                    variant="caption"
                  >
                    {selectedBirbIds.length} birbs
                  </Typography>
                </Box>
              </Box>
            </>
          )}

          {quizStarted && (
            <>
              <Box sx={{ display: "flex", justifyContent: "center" }}>
                <Typography variant="h4">
                  {/* <Box component="span" sx={{ color: "primary.main" }}> */}
                  {/* Birbsquizzing... */}
                  {/* </Box> */}
                  {` ${counter + 1}/${selectedBirbIds.length}`}
                  {birbEmoji}
                </Typography>
              </Box>

              <TabContext value={value}>
                <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                  <TabList variant="fullWidth" onChange={handleChange}>
                    <Tab label="Chants" value="1" />
                    <Tab label="Image" value="2" />
                  </TabList>
                </Box>
                <TabPanel sx={{ padding: "0" }} value="1">
                  <Box
                    sx={{
                      display: "grid",
                      gap: "1.5rem",
                      gridTemplateColumns: "repeat(auto-fill, 1fr)",
                    }}
                  >
                    {getAudioSource()}
                  </Box>
                </TabPanel>
                <TabPanel sx={{ padding: "0" }} value="2">
                  <img
                    style={{ height: "100%", width: "100%" }}
                    src={photosMap[selectedBirbIds[sequence![counter]]]}
                    loading="lazy"
                  />
                </TabPanel>
              </TabContext>

              <Box
                sx={{
                  display: "grid",
                  gap: "1.5rem",
                  gridTemplateColumns: "1fr",
                }}
              >
                <Box
                  sx={{
                    display: "grid",
                    alignItems: "center",
                    gap: "1.5rem",
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
                    ? "Terminer "
                    : "Prochain "}
                </Button>

                {/* <LinearProgressWithLabel
                  value={((counter + 1) / selectedBirbIds.length) * 100}
                /> */}
              </Box>
            </>
          )}
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
