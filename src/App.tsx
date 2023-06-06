import "./App.css";
import React, { useCallback, useEffect, useMemo } from "react";
import Button from "@mui/material/Button";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import rawBirbsMapFr from "./dendroica/birbsMapFr.json";
import rawData from "./dendroica/data.json";
import CopyAllIcon from "@mui/icons-material/CopyAll";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import {
  Box,
  Checkbox,
  Chip,
  IconButton,
  Link,
  Snackbar,
  Switch,
  Tab,
  Tooltip,
  TooltipProps,
  Typography,
  styled,
  tooltipClasses,
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

enum TabName {
  Songs = "songs",
  Photo = "photo",
}

const HtmlTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip placement="left" {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    maxWidth: "50vw",
    backgroundColor: "#dddddd",
    color: "rgba(0, 0, 0, 0.87)",
    fontSize: theme.typography.pxToRem(12),
  },
}));

function App() {
  const birbsMapFr = rawBirbsMapFr as any;
  const dataMap = rawData as any;

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
  const [isGoodAnswer, setIsGoodAnswer] = React.useState(true);
  const [sequence, setSequence] = React.useState<Array<number>>();
  const [openSnake, setOpenSnake] = React.useState(false);
  const [snakeMessage, setSnakeMessage] = React.useState("");
  const birbEmoji = useMemo(
    () => birbEmojis[Math.floor(Math.random() * birbEmojis.length)],
    []
  );
  const [tab, setTab] = React.useState(TabName.Songs);

  const handleTabChange = (e: any, newTab: TabName) => {
    setTab(newTab);
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

  const previousQuestion = () => {
    setCounter(counter - 1);
    setShowAnswer(true);
  };

  const endQuiz = () => {
    setCounter(0);
    setQuizStarted(false);
  };

  const copyUrl = () => {
    const encodedBirbs = btoa(localStorage.getItem("selectedBirbIds")!);
    let url = `${window.location.href.split("?")[0]}?birbs=${encodedBirbs}`;
    navigator.clipboard.writeText(url);
    setSnakeMessage(`Lien copié!`);
    setOpenSnake(true);
  };

  const hi = async () => {
    const idsToFetch = Object.keys(birbsMapFr);
    // .splice(0, 3);
    const myMap: any = {};

    for (const birbId of idsToFetch) {
      if (myMap[birbId]) continue;
      fetch(`https://www.natureinstruct.org/srv/json.php/get_species/${birbId}`)
        .then((response) => response.text())
        .then((data) => {
          myMap[birbId] = {};

          const mp3s = data.match(/\/files(.*?)mp3/g);
          if (mp3s && mp3s.length > 0) {
            const songs = mp3s
              .splice(0, 5)
              .map((path: any) => `https://www.natureinstruct.org${path}`);
            myMap[birbId].songs = songs;
          } else {
            myMap[birbId].songs = [];
          }

          const jpgs = data.match(/\/files(.*?)jpg/g);
          if (jpgs && jpgs.length > 0) {
            const photos = jpgs
              .splice(0, 5)
              .map((path: any) => `https://www.natureinstruct.org${path}`);
            myMap[birbId].photos = photos;
          } else {
            myMap[birbId].photos = [];
          }

          myMap[birbId].songCredits = JSON.parse(
            data
              .match(/g_songCredits = \[(.*?)]/g)![0]
              .replace("g_songCredits = ", "")
          ).splice(0, 5);

          myMap[birbId].photoCredits = JSON.parse(
            data
              .match(/g_photoCredits = \[(.*?)]/g)![0]
              .replace("g_photoCredits = ", "")
          ).splice(0, 5);

          console.log(JSON.stringify(myMap));
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
    const audioSource = dataMap[selectedBirbIds[sequence![counter]]].songs
      .slice()
      .splice(0, 3);
    return (
      <>
        {audioSource &&
          audioSource.length > 0 &&
          audioSource.map((audioSource: string, i: number) => (
            <Box key={`audio-${i}`}>
              <audio style={{ width: "100%" }} controls src={audioSource}>
                Your browser does not support the
                <code>audio</code> element.
              </audio>
              <Box sx={{ display: "grid", justifyContent: "flex-end" }}>
                <Typography
                  sx={{ alignSelf: "flex-end", color: "#dcdcdc" }}
                  variant="caption"
                >
                  <HtmlTooltip
                    title={
                      <React.Fragment>
                        <div
                          dangerouslySetInnerHTML={{
                            __html:
                              dataMap[selectedBirbIds[sequence![counter]]]
                                .songCredits[i],
                          }}
                        />
                      </React.Fragment>
                    }
                  >
                    <Box>source</Box>
                  </HtmlTooltip>
                </Typography>
              </Box>
            </Box>
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
          padding: "1.5rem",
          display: "grid",
          justifyContent: "center",
          gridTemplateColumns: "minmax(min-content, 800px)",
          alignContent: "flex-start",
          gap: "1.5rem",
        }}
      >
        {!quizStarted && (
          <>
            <Typography sx={{ justifySelf: "center" }} variant="h2">
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

            {/* <Box
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
            </Box> */}

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr",
              }}
            >
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "min-content 1fr",
                  gap: "0.5rem",
                }}
              >
                {/* <Button
                  variant="outlined"
                  onClick={copyUrl}
                  disabled={selectedBirbIds.length <= 0}
                >
                  Partager
                </Button> */}
                <IconButton
                  color="primary"
                  onClick={copyUrl}
                  disabled={selectedBirbIds.length <= 0}
                >
                  <CopyAllIcon />
                </IconButton>

                <Button
                  variant="contained"
                  onClick={startQuiz}
                  disabled={selectedBirbIds.length <= 0}
                >
                  {`Quiz moi ${selectedBirbIds.length} birb${
                    selectedBirbIds.length === 1 ? "" : "s"
                  }`}
                </Button>
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

            <TabContext value={tab}>
              <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                <TabList variant="fullWidth" onChange={handleTabChange}>
                  <Tab label="Chants" value={TabName.Songs} />
                  <Tab label="Photo" value={TabName.Photo} />
                </TabList>
              </Box>
              {tab === TabName.Songs && (
                <TabPanel sx={{ padding: "0rem 1.5rem" }} value={TabName.Songs}>
                  <Box
                    sx={{
                      display: "grid",
                      gap: "0.5rem",
                      gridTemplateColumns: "repeat(auto-fill, 1fr)",
                    }}
                  >
                    {getAudioSource()}
                  </Box>
                </TabPanel>
              )}
              {tab === TabName.Photo && (
                <TabPanel
                  sx={{
                    padding: "0rem 1.5rem",
                    overflow: "auto",
                    display: "grid",
                    justifyContent: "center",
                  }}
                  value={TabName.Photo}
                >
                  <img
                    style={{ height: "100%", width: "100%", objectFit: "fill" }}
                    src={dataMap[selectedBirbIds[sequence![counter]]].photos[0]}
                    loading="lazy"
                  />
                  <Box sx={{ display: "grid", justifyContent: "flex-end" }}>
                    <Typography
                      sx={{ alignSelf: "flex-end", color: "#dcdcdc" }}
                      variant="caption"
                    >
                      <HtmlTooltip
                        title={
                          <React.Fragment>
                            <div
                              dangerouslySetInnerHTML={{
                                __html:
                                  dataMap[selectedBirbIds[sequence![counter]]]
                                    .photoCredits[0],
                              }}
                            />
                          </React.Fragment>
                        }
                      >
                        <Box>source</Box>
                      </HtmlTooltip>
                    </Typography>
                  </Box>
                </TabPanel>
              )}
            </TabContext>

            <Box
              sx={{
                display: "grid",
                alignItems: "center",
                gridTemplateColumns: "auto 1fr",
                gridTemplateRows: "1fr 1fr",
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

              <Switch
                color="success"
                checked={isGoodAnswer}
                onChange={() => setIsGoodAnswer(!isGoodAnswer)}
                disabled={!showAnswer}
              />
              {showAnswer && (
                <Typography variant="body1">
                  {isGoodAnswer ? "Bonne réponse :)" : ":("}
                </Typography>
              )}
            </Box>

            <Box
              sx={{
                display: "grid",
                gap: "0.5rem",
                gridTemplateColumns: "1fr",
              }}
            >
              <Box
                sx={{
                  display: "grid",
                  gap: "0.5rem",
                  gridTemplateColumns: "1fr 1fr",
                }}
              >
                <Button
                  variant="outlined"
                  disabled={counter <= 0}
                  onClick={previousQuestion}
                >
                  Dernier
                </Button>

                <Button
                  variant={
                    counter === selectedBirbIds.length - 1
                      ? "contained"
                      : "outlined"
                  }
                  onClick={nextQuestion}
                >
                  {counter === selectedBirbIds.length - 1
                    ? "Terminer "
                    : "Prochain "}
                </Button>
              </Box>

              {/* <Button variant="outlined" color="error" onClick={endQuiz}>
                retour
              </Button> */}

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
  );
}

export default App;
