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

  const handleTabChange = (e: any, newTab: TabName) => {
    setTab(newTab);
  };

  const nextQuestion = () => {
    setCounter(counter + 1);
  };

  const previousQuestion = () => {
    setCounter(counter - 1);
  };

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

  return (
    <>
      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        <IconButton
          color="primary"
          disabled={counter <= 0}
          onClick={previousQuestion}
        >
          <ArrowBackIcon />
        </IconButton>

        <Typography variant="h4">
          {/* <Box component="span" sx={{ color: "primary.main" }}> */}
          {/* Birbsquizzing... */}
          {/* </Box> */}
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

      <TabContext value={tab}>
        <Box
          sx={{ marginTop: "0.5rem", borderBottom: 1, borderColor: "divider" }}
        >
          <TabList variant="fullWidth" onChange={handleTabChange}>
            <Tab label="Chants" value={TabName.Songs} />
            <Tab label="Photo" value={TabName.Photo} />
          </TabList>
        </Box>
        {tab === TabName.Songs && (
          <TabPanel
            sx={{ marginTop: "1.5rem", padding: "0rem 0.5rem" }}
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
              alt={dataMap[selectedBirbIds[sequence[counter]]].photoCredits[0]}
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

      <Box
        sx={{
          marginTop: "0.5rem",
          display: "grid",
          alignItems: "center",
          gridTemplateColumns: "auto 1fr",
          gap: "0.5rem",
        }}
      >
        <Switch
          checked={showAnswers[sequence[counter]]}
          onChange={() => {
            const newShowAnswers: any = Array.from(showAnswers);
            newShowAnswers[sequence[counter]] =
              !newShowAnswers[sequence[counter]];
            setShowAnswers(newShowAnswers);

            const newAnswers: any = Array.from(answers);
            newAnswers[sequence[counter]] = true;
            setAnswers(newAnswers);
          }}
        />
        <Typography variant="body1">
          {showAnswers[sequence[counter]]
            ? birbsMapFr[selectedBirbIds[sequence[counter]]]
            : "???"}
        </Typography>
      </Box>

      {showAnswers[sequence[counter]] && (
        <Box
          sx={{
            marginTop: "0.5rem",
            display: "grid",
            alignItems: "center",
            gridTemplateColumns: "auto 1fr",
            gap: "0.5rem",
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
              newAnswers[sequence[counter]] = !newAnswers[sequence[counter]];
              setAnswers(newAnswers);
            }}
          />
          <Typography variant="body1">
            {answers[sequence[counter]] ? "Good birb" : "Faux"}
          </Typography>
        </Box>
      )}

      {/* {showAnswers[sequence[counter]] && (
        <Box
          sx={{
            marginTop: "1rem",
            display: "grid",
            gap: "1rem",
            gridTemplateColumns: "1fr 1fr",
          }}
        >
          <Button
            variant={
              answers[sequence[counter]] === null ||
              answers[sequence[counter]] === true
                ? "outlined"
                : "contained"
            }
            onClick={() => {
              const newAnswers: any = Array.from(answers);
              newAnswers[sequence[counter]] = false;
              setAnswers(newAnswers);
            }}
            color="error"
          >
            Faux
          </Button>

          <Button
            variant={
              answers[sequence[counter]] === null ||
              answers[sequence[counter]] === false
                ? "outlined"
                : "contained"
            }
            onClick={() => {
              const newAnswers: any = Array.from(answers);
              newAnswers[sequence[counter]] = true;
              setAnswers(newAnswers);
            }}
            // color="success"
          >
            Birb
          </Button>
        </Box>
      )} */}

      {showAnswers[sequence[counter]] &&
        !(counter === selectedBirbIds.length - 1) && (
          <Button
            sx={{ marginTop: "1rem" }}
            variant="outlined"
            onClick={nextQuestion}
          >
            Prochain
          </Button>
        )}

      {counter === selectedBirbIds.length - 1 && (
        <Button
          sx={{ marginTop: "1rem" }}
          variant="contained"
          onClick={endQuiz}
        >
          Terminer
        </Button>
      )}
    </>
  );
}

export default Quiz;
