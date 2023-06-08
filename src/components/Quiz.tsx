import React from "react";
import Button from "@mui/material/Button";
import {
  Box,
  IconButton,
  Switch,
  Tab,
  Tooltip,
  TooltipProps,
  Typography,
  styled,
  tooltipClasses,
} from "@mui/material";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const HtmlTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip placement="left" {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    maxWidth: "50vw",
    backgroundColor: "#dcdcdc",
    color: "rgba(0, 0, 0, 0.87)",
    fontSize: theme.typography.pxToRem(12),
  },
}));

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
  endQuiz: () => void;
  setCounter: React.Dispatch<any>;
};

function Quiz({
  dataMap,
  birbsMapFr,
  sequence,
  counter,
  birbEmoji,
  selectedBirbIds,
  endQuiz,
  setCounter,
}: QuizProps) {
  const [tab, setTab] = React.useState(TabName.Songs);
  const [showAnswer, setShowAnswer] = React.useState(false);

  const handleTabChange = (e: any, newTab: TabName) => {
    setTab(newTab);
  };

  const nextQuestion = () => {
    setCounter(counter + 1);
    setShowAnswer(false);
  };

  const previousQuestion = () => {
    setCounter(counter - 1);
    setShowAnswer(false);
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
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
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
          checked={showAnswer}
          onChange={() => setShowAnswer(!showAnswer)}
        />
        <Typography variant="body1">
          {showAnswer ? birbsMapFr[selectedBirbIds[sequence[counter]]] : "???"}
        </Typography>
      </Box>

      <Box
        sx={{
          marginTop: "1rem",
          display: "grid",
          gap: "1rem",
          gridTemplateColumns: "1fr 1fr",
        }}
      >
        <Button
          variant="outlined"
          disabled={!showAnswer}
          onClick={previousQuestion}
          color="error"
        >
          Faux
        </Button>

        <Button
          variant="outlined"
          disabled={!showAnswer}
          onClick={previousQuestion}
        >
          Birb
        </Button>
      </Box>
    </>
  );
}

export default Quiz;
