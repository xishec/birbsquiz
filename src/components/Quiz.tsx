import React from "react";
import Button from "@mui/material/Button";
import { Box, IconButton, Switch, Tab, Typography } from "@mui/material";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import HtmlTooltip from "./HtmlTooltip";

enum TabName {
  Songs = "songs",
  Photo = "photo",
}

type QuizProps = {
  dataMap: any;
  birbsMapFr: any;
  sequence: Array<number>;
  counter: number;
  birbEmoji: string;
  selectedBirbIds: Array<string>;
  answers: Array<boolean>;
  showAnswers: Array<boolean>;
  endQuiz: () => void;
  setCounter: React.Dispatch<any>;
  setAnswers: React.Dispatch<any>;
  setShowAnswers: React.Dispatch<any>;
};

function Quiz({
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
}: QuizProps) {
  const [tab, setTab] = React.useState(TabName.Songs);
  const [previewing, setPreviewing] = React.useState(false);
  const [audioPlayed, setAudioPlayed] = React.useState(false);

  const handleTabChange = (e: any, newTab: TabName) => {
    setTab(newTab);
  };

  const nextQuestion = () => {
    setCounter(counter + 1);
    setAudioPlayed(false);
  };

  const previousQuestion = () => {
    setCounter(counter - 1);
    setAudioPlayed(false);
  };

  React.useEffect(() => {
    // Pause and reset all audio elements each time the counter changes
    const audioElements = document.querySelectorAll<HTMLAudioElement>("audio");
    audioElements.forEach((audio) => {
      audio.pause();
      audio.currentTime = 0;
    });
  }, [counter]);

  const getAudioSource = () => {
    const audioSource = dataMap[selectedBirbIds[sequence[counter]]].songs
      .slice()
      .splice(0, 3);
    return (
      <>
        {audioSource &&
          audioSource.length > 0 &&
          audioSource.map((audioSource: string, i: number) => (
            <Box key={`audio-${i}`}>
              <audio
                style={{ width: "100%" }}
                controls
                src={audioSource}
                onPlay={() => setAudioPlayed(true)}
              >
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
                              dataMap[selectedBirbIds[sequence[counter]]]
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

  const birbImage = (
    <Box
      sx={{
        marginTop: "1rem",
        display: "grid",
        justifyContent: "center",
      }}
    >
      <img
        style={{
          height: "100%",
          width: "100%",
          objectFit: "fill",
          maxWidth: "400px",
          maxHeight: "400px",
        }}
        src={dataMap[selectedBirbIds[sequence[counter]]].photos[0]}
        loading="lazy"
        alt={dataMap[selectedBirbIds[sequence[counter]]].photoCredits[0]}
      />
    </Box>
  );

  const shouldReveal = showAnswers[sequence[counter]];

  return (
    <Box
      sx={{
        overflow: "auto",
        display: "grid",
        height: "85vh",
        minHeight: 0,
        gridTemplateRows: "auto 1fr auto",
      }}
    >
      {/* Header with counter and navigation buttons */}
      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        <IconButton
          color="primary"
          disabled={counter <= 0}
          onClick={previousQuestion}
        >
          <ArrowBackIcon />
        </IconButton>

        <Typography variant="h4">
          {` ${counter + 1}/${selectedBirbIds.length}`}
          {birbEmoji}
        </Typography>

        <IconButton
          color="primary"
          disabled={counter >= selectedBirbIds.length - 1}
          onClick={nextQuestion}
        >
          <ArrowForwardIcon />
        </IconButton>
      </Box>

      {/* Tabs for songs and photo */}
      <Box
        sx={{
          overflow: "auto",
          display: "flex",
          flexDirection: "column",
          justifyContent: "start",
        }}
      >
        <TabContext value={tab}>
          <Box
            sx={{
              marginTop: "0.5rem",
              borderBottom: 1,
              borderColor: "divider",
            }}
          >
            <TabList variant="fullWidth" onChange={handleTabChange}>
              <Tab label="Chants" value={TabName.Songs} />
              <Tab label="Photo" value={TabName.Photo} />
            </TabList>
          </Box>
          {tab === TabName.Songs && (
            <TabPanel
              sx={{
                marginTop: "1.5rem",
                overflow: "auto",
                padding: "0rem 0.5rem",
              }}
              value={TabName.Songs}
            >
              <Box
                sx={{
                  display: "grid",
                  gap: "0.5rem",
                  gridTemplateColumns: "repeat(auto-fill, 1fr)",
                }}
              >
                {getAudioSource()}
              </Box>
              {(previewing || shouldReveal) && birbImage}
            </TabPanel>
          )}
          {tab === TabName.Photo && (
            <TabPanel
              sx={{
                marginTop: "1.5rem",
                padding: "0rem 1.5rem",
                overflow: "auto",
                display: "grid",
                justifyContent: "center",
              }}
              value={TabName.Photo}
            >
              <img
                style={{ height: "100%", width: "100%", objectFit: "fill" }}
                src={dataMap[selectedBirbIds[sequence[counter]]].photos[0]}
                loading="lazy"
                alt={
                  dataMap[selectedBirbIds[sequence[counter]]].photoCredits[0]
                }
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
                              dataMap[selectedBirbIds[sequence[counter]]]
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
      </Box>

      {/* Reveal and answer buttons */}
      <Box
        sx={{
          marginTop: "1rem",
        }}
      >
        {/* Reveal buttons */}
        <Box>
          {!shouldReveal && (
            <Box
              sx={{
                marginTop: "0.5rem",
                display: "grid",
                alignItems: "center",
                gridTemplateColumns: "1fr auto",
                gap: "0.5rem",
              }}
            >
              <Button
                variant="outlined"
                disabled={!audioPlayed && tab === TabName.Songs}
                onClick={() => {
                  const newShowAnswers: any = Array.from(showAnswers);
                  newShowAnswers[sequence[counter]] =
                    !newShowAnswers[sequence[counter]];
                  setShowAnswers(newShowAnswers);

                  const newAnswers: any = Array.from(answers);
                  newAnswers[sequence[counter]] = true;
                  setAnswers(newAnswers);
                }}
              >
                Reveal
              </Button>
              {tab === TabName.Songs && (
                <Button
                  variant="outlined"
                  onMouseDown={() => setPreviewing(true)}
                  onMouseUp={() => setPreviewing(false)}
                  onMouseLeave={() => setPreviewing(false)}
                  onTouchStart={() => setPreviewing(true)}
                  onTouchEnd={() => setPreviewing(false)}
                >
                  👀
                </Button>
              )}
            </Box>
          )}

          {shouldReveal && (
            <Box
              sx={{
                marginTop: "0.5rem",
                display: "grid",
                alignItems: "center",
                gridTemplateColumns: "1fr auto",
                gap: "0.5rem",
              }}
            >
              <Button
                variant="outlined"
                sx={{ pointerEvents: "none" }}
                color={answers[sequence[counter]] ? "success" : "error"}
              >
                {birbsMapFr[selectedBirbIds[sequence[counter]]]}
              </Button>
              <Box
                sx={{
                  display: "grid",
                  justifyContent: "center",
                }}
              >
                <Switch
                  sx={{
                    "&.MuiSwitch-root .MuiSwitch-switchBase": {
                      color: "red",
                    },
                    "&.MuiSwitch-root .Mui-checked": {
                      color: "green",
                    },
                    ".MuiSwitch-track": {
                      backgroundColor: "red",
                    },
                  }}
                  color="success"
                  checked={answers[sequence[counter]]}
                  onChange={() => {
                    const newAnswers: any = Array.from(answers);
                    newAnswers[sequence[counter]] =
                      !newAnswers[sequence[counter]];
                    setAnswers(newAnswers);
                  }}
                />
                {/* <Typography variant="body1">
                  {answers[sequence[counter]] ? "Good birb" : "Faux"}
                </Typography> */}
              </Box>
            </Box>
          )}
        </Box>

        <Box
          sx={{
            marginTop: "1rem",
            display: "grid",
            alignItems: "center",
          }}
        >
          {!(counter === selectedBirbIds.length - 1) && (
            <Button
              disabled={!shouldReveal}
              variant="contained"
              onClick={nextQuestion}
              color={answers[sequence[counter]] ? "success" : "error"}
            >
              <ArrowForwardIcon />
            </Button>
          )}

          {counter === selectedBirbIds.length - 1 && (
            <Button
              disabled={!shouldReveal}
              variant="contained"
              onClick={endQuiz}
              color={answers[sequence[counter]] ? "success" : "error"}
            >
              <ArrowForwardIcon />
            </Button>
          )}
        </Box>
      </Box>
    </Box>
  );
}

export default Quiz;
