import React, { useContext, useEffect } from "react";
import Button from "@mui/material/Button";
import { Box, IconButton, Switch, Typography } from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import HtmlTooltip from "./HtmlTooltip";
import CloseIcon from "@mui/icons-material/Close";
import { GameMode, QuizContext } from "../App";
import { AudioType, fetchAudio, fetchImage } from "../macaulay/Helper";
import { set } from "firebase/database";

function Quiz() {
  const quizContext = useContext(QuizContext);
  if (!quizContext) {
    throw new Error("Must be used within a QuizContext.Provider");
  }
  const {
    eBird,
    sequence,
    randomSeed,
    counter,
    birbEmoji,
    selectedBirbIds,
    answers,
    showAnswers,
    endQuiz,
    setCounter,
    setAnswers,
    setShowAnswers,
    css_height_90,
    gameMode,
  } = quizContext;

  const [audioSource, setAudioSource] = React.useState<string[]>();
  const [imageSource, setImageSource] = React.useState<string>();
  const [birbId, setBirbId] = React.useState(sequence[counter]);
  const [previewing, setPreviewing] = React.useState(false);
  const [audioPlayed, setAudioPlayed] = React.useState(false);

  const pauseAllAudio = () => {
    const audioElements = document.querySelectorAll("audio");
    audioElements.forEach((audio) => audio.pause());
  };

  const nextQuestion = () => {
    pauseAllAudio();
    setCounter(counter + 1);
    setAudioPlayed(false);
  };

  const previousQuestion = () => {
    pauseAllAudio();
    setCounter(counter - 1);
    setAudioPlayed(false);
  };

  const handleAudioPlay = (
    e: React.SyntheticEvent<HTMLAudioElement, Event>
  ) => {
    const currentAudio = e.currentTarget;
    const allAudios = document.querySelectorAll("audio");
    allAudios.forEach((audio) => {
      if (audio !== currentAudio) {
        audio.pause();
        audio.currentTime = 0;
      }
    });
    setAudioPlayed(true);
  };

  useEffect(() => {
    setBirbId(sequence[counter]);
  }, [counter, selectedBirbIds, sequence]);

  useEffect(() => {
    setAudioSource([]);
    fetchAudio(birbId, AudioType.SONG).then((audioList) => {
      if (!audioList) return;
      const candidateCount = Math.min(audioList.length, 5);
      const randomIndex = Math.floor(randomSeed * candidateCount);
      // console.log(`audio ${randomIndex} in ${audioList.length}`);
      const audioSrc = audioList?.[randomIndex];
      setAudioSource([audioSrc]);
    });

    setImageSource("");
    fetchImage(birbId).then((imageList) => {
      if (!imageList) return;
      const candidateCount = imageList.length;
      const randomIndex = Math.floor(randomSeed * candidateCount);
      const imageSrc = imageList?.[randomIndex];
      setImageSource(imageSrc);
    });
  }, [birbId, randomSeed]);

  const getAudioSource = () => {
    return (
      <>
        {audioSource &&
          audioSource.length > 0 &&
          audioSource.map((audioSource: string, i: number) => (
            <Box key={`audio-${counter}-${i}`}>
              <audio
                autoPlay={i === 0 && !shouldReveal}
                id={`audio-${counter}-${i}`}
                style={{ width: "100%" }}
                controls
                src={audioSource}
                onPlay={handleAudioPlay}
              >
                Your browser does not support the
                <code>audio</code> element.
              </audio>
              {/* todo : add credits */}
              {/* <Box sx={{ display: "grid", justifyContent: "flex-end" }}>
                <Typography
                  sx={{ alignSelf: "flex-end", color: "#dcdcdc" }}
                  variant="caption"
                >
                  <HtmlTooltip
                    title={
                      <React.Fragment>
                        <div
                          dangerouslySetInnerHTML={{
                            __html: dataMap[birbId].songCredits[i],
                          }}
                        />
                      </React.Fragment>
                    }
                  >
                    <Box>source</Box>
                  </HtmlTooltip>
                </Typography>
              </Box> */}
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
        padding: "0 0.5rem",
        display: "grid",
        justifyContent: "center",
      }}
    >
      <Box sx={{ overflow: "hidden", borderRadius: "0.1rem" }}>
        <img
          style={{
            height: "100%",
            width: "100%",
            maxWidth: "400px",
            maxHeight: "400px",
          }}
          src={imageSource}
          loading="lazy"
          alt={"dataMap[birbId].photoCredits[0]"}
        />
      </Box>
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
                    __html: "dataMap[birbId].photoCredits[0]",
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
  );

  const shouldReveal = showAnswers[counter];

  return (
    <Box
      sx={{
        overflow: "auto",
        display: "grid",
        height: css_height_90,
        minHeight: 0,
        gridTemplateRows: "auto 1fr auto",
      }}
    >
      {/* Header with counter and navigation buttons */}
      <Box
        sx={{
          display: "grid",
          justifyContent: "space-between",
          gridTemplateColumns: "1fr 1fr 1fr",
        }}
      >
        <Box>
          <Typography
            variant="h4"
            onClick={() => window.location.reload()}
            sx={{
              width: "min-content",
              cursor: "pointer",
              transition: "transform 0.1s ease",
              "&:hover": {
                transform: "scale(1.2)",
              },
              padding: "0.5rem",
            }}
          >
            {birbEmoji}
          </Typography>
        </Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignContent: "center",
          }}
        >
          <IconButton
            color="primary"
            disabled={counter <= 0}
            onClick={previousQuestion}
          >
            <ArrowBackIcon />
          </IconButton>

          <Typography variant="h4" sx={{ alignSelf: "center" }}>
            {`${counter + 1}/${sequence.length}`}
          </Typography>

          <IconButton
            color="primary"
            disabled={counter >= sequence.length - 1}
            onClick={nextQuestion}
          >
            <ArrowForwardIcon />
          </IconButton>
        </Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
          }}
        >
          <IconButton onClick={endQuiz} color="error">
            <CloseIcon />
          </IconButton>
        </Box>
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
        {gameMode === GameMode.CHANTS && (
          <Box
            sx={{
              marginTop: "1.5rem",
              overflow: "auto",
              padding: "0rem 0.5rem",
            }}
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
          </Box>
        )}
        {gameMode === GameMode.IMAGES && (
          <Box
            sx={{
              marginTop: "1rem",
              padding: "0rem",
              overflow: "auto",
              display: "grid",
              justifyContent: "center",
            }}
          >
            {birbImage}
          </Box>
        )}
      </Box>

      {/* Reveal and answer buttons */}
      <Box
        sx={{
          marginTop: "0rem",
        }}
      >
        <Box>
          {!shouldReveal && (
            <Box
              sx={{
                marginTop: "1rem",
                display: "grid",
                alignItems: "center",
                gridTemplateColumns: "1fr auto",
                gap: "1rem",
              }}
            >
              <Button
                variant="outlined"
                disabled={!audioPlayed && gameMode === GameMode.CHANTS}
                onClick={() => {
                  const newShowAnswers: any = Array.from(showAnswers);
                  newShowAnswers[counter] = !newShowAnswers[counter];
                  setShowAnswers(newShowAnswers);
                  pauseAllAudio();

                  const newAnswers: any = Array.from(answers);
                  newAnswers[counter] = true;
                  setAnswers(newAnswers);
                }}
              >
                Reveal
              </Button>
              {gameMode === GameMode.CHANTS && (
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

          {/* Show answer */}
          {shouldReveal && (
            <Box
              sx={{
                marginTop: "1rem",
                display: "grid",
                alignItems: "center",
                gridTemplateColumns: "1fr auto",
                gap: "0.5rem",
              }}
            >
              <Button
                variant="outlined"
                sx={{ pointerEvents: "none" }}
                color={answers[counter] ? "success" : "error"}
              >
                {eBird[birbId].comNameFr}
              </Button>
              <Box
                sx={{
                  width: "64px",
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
                  checked={answers[counter]}
                  onChange={() => {
                    const newAnswers: any = Array.from(answers);
                    newAnswers[counter] = !newAnswers[counter];
                    setAnswers(newAnswers);
                  }}
                />
                {/* <Typography variant="body1">
                  {answers[counter] ? "Good birb" : "Faux"}
                </Typography> */}
              </Box>
            </Box>
          )}
        </Box>

        {/* Next question button */}
        <Box
          sx={{
            marginTop: "1rem",
            display: "grid",
            alignItems: "center",
          }}
        >
          {!(counter === sequence.length - 1) && (
            <Box
              sx={{
                display: "grid",
                alignItems: "center",
                gridTemplateColumns: "1fr auto",
              }}
            >
              <Button
                disabled={!shouldReveal}
                variant="contained"
                onClick={nextQuestion}
                color={answers[counter] ? "success" : "error"}
              >
                <ArrowForwardIcon />
              </Button>
              {/* <Button
                disabled={!shouldReveal}
                variant="contained"
                onClick={nextQuestion}
                color={answers[counter] ? "success" : "error"}
              >
                {` ${answers.filter((answer) => answer).length}/${counter + 1}`}
              </Button> */}
            </Box>
          )}

          {counter === sequence.length - 1 && (
            <Button
              disabled={!shouldReveal}
              variant="contained"
              onClick={endQuiz}
              color={answers[counter] ? "success" : "error"}
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
