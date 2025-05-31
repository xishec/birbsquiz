import React, { useContext, useEffect } from "react";
import Button from "@mui/material/Button";
import {
  Box,
  CircularProgress,
  IconButton,
  Switch,
  Tooltip,
  Typography,
} from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CloseIcon from "@mui/icons-material/Close";
import { GameMode, QuizContext, shuffleArray } from "../App";
import {
  AudioType,
  EBirdNameProperty,
  Language,
  Sex,
} from "../tools/constants";
import { BirdImage, UrlWithMetadata } from "../tools/tools";

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
    callCheckbox,
    songCheckbox,
    eBirdNameProperty,
    dbBirbs,
    regionList,
    region,
    currentTranslation: t,
  } = quizContext;

  const [audioRandomIndex, setAudioRandomIndex] = React.useState(0);
  const [audioSources, setAudioSources] = React.useState<UrlWithMetadata[]>([]);
  const [imageMaleRandomIndex, setImageMaleRandomIndex] = React.useState(0);
  const [imageFemaleRandomIndex, setImageFemaleRandomIndex] = React.useState(0);
  const [imageSources, setImageSources] = React.useState<BirdImage>();
  const [birbId, setBirbId] = React.useState(sequence[counter]);
  const [previewing, setPreviewing] = React.useState(false);
  const [audioPlayed, setAudioPlayed] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [currentAudioType, setCurrentAudioType] = React.useState<AudioType>();
  const [shouldRevealMoreNames, setShouldRevealMoreNames] =
    React.useState(false);
  const [shouldReveal, setShouldReveal] = React.useState(false);

  const pauseAllAudio = () => {
    const audioElements = document.querySelectorAll("audio");
    audioElements.forEach((audio) => {
      audio.pause();
    });
  };

  const nextQuestion = () => {
    console.log("loading is");
    setLoading(true);
    setCounter(counter + 1);
    setAudioPlayed(false);
  };

  const previousQuestion = () => {
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
    setShouldReveal(false);
    setBirbId(sequence[counter]);
    console.log("birbId is", sequence[counter]);
  }, [counter, selectedBirbIds, sequence]);

  const fetchAndSetAudioSources = () => {
    const birdAudio = dbBirbs[birbId]?.audio;
    if (!birdAudio) return;

    const birdRandomSeed = (randomSeed * ((counter % 10) + 1)) % 1;

    let newAudioType = AudioType.CAll;

    if (!birdAudio[AudioType.SONG]) {
      newAudioType = AudioType.CAll;
    } else if (!birdAudio[AudioType.CAll]) {
      newAudioType = AudioType.SONG;
    } else {
      if (callCheckbox) {
        newAudioType = AudioType.CAll;
      }
      if (songCheckbox) {
        newAudioType = AudioType.SONG;
      }
      if (callCheckbox && songCheckbox) {
        newAudioType = birdRandomSeed < 0.5 ? AudioType.CAll : AudioType.SONG;
      }
    }

    setCurrentAudioType(newAudioType);
    const urlWithMetadata = birdAudio[newAudioType];
    const candidateCount = Math.min(urlWithMetadata.length, 5);
    const randomIndex = Math.floor(birdRandomSeed * candidateCount);
    setAudioRandomIndex(randomIndex);
    setAudioSources(urlWithMetadata);
  };

  const fetchAndSetImageSources = () => {
    const birdImage = dbBirbs[birbId]?.image;
    if (!birdImage) return;

    setImageMaleRandomIndex(0);
    const newImageSrcMale = [...birdImage[Sex.MALE]];
    shuffleArray(newImageSrcMale);

    setImageFemaleRandomIndex(0);
    const newImageSrcFemale = [...birdImage[Sex.FEMALE]];
    shuffleArray(newImageSrcFemale);

    setImageSources({
      [Sex.MALE]: newImageSrcMale,
      [Sex.FEMALE]: newImageSrcFemale,
    } as BirdImage);
  };

  useEffect(() => {
    setAudioSources([]);
    setImageSources({
      [Sex.MALE]: [],
      [Sex.FEMALE]: [],
    });
  }, [birbId]);

  useEffect(() => {
    if (
      !audioSources ||
      audioSources.length === 0 ||
      !audioSources[0] ||
      !imageSources ||
      imageSources[Sex.MALE].length === 0 ||
      imageSources[Sex.FEMALE].length === 0
    ) {
      setLoading(true);
      fetchAndSetAudioSources();
      fetchAndSetImageSources();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioSources, imageSources]);

  // Preload images when imageSources are available
  useEffect(() => {
    if (
      imageSources &&
      imageSources[Sex.MALE].length > 0 &&
      imageSources[Sex.FEMALE].length > 0
    ) {
      // Preload both male and female images
      [imageSources[Sex.MALE][0], imageSources[Sex.FEMALE][0]].forEach(
        (urlWithMetadata) => {
          const img = new Image();
          img.src = urlWithMetadata.url;
        }
      );
      setShouldReveal(showAnswers[counter]);
    }
  }, [imageSources, counter, showAnswers]);

  const audioComponents = (
    <>
      {audioSources.slice(0, 5).length > 0 &&
        audioSources.slice(0, 5)[0] &&
        currentAudioType &&
        audioSources
          .slice(0, 5)
          .map((urlWithMetadata: UrlWithMetadata, i: number) => (
            <Box
              key={`audio-box-${birbId}-after-reveal-${i}`}
              sx={{
                display: "grid",
                gap: "0.5rem",
                gridTemplateColumns: "max-content 1fr min-content",
                alignItems: "center",
              }}
            >
              <Typography
                sx={{
                  marginRight: "0.5rem",
                  fontWeight: i === audioRandomIndex ? "bold" : "normal",
                }}
              >
                {`${currentAudioType === AudioType.CAll ? t.Call : t.Song} ${
                  i + 1
                }`}
              </Typography>

              <audio
                id={`audio-${birbId}-after-reveal-${i}`}
                style={{
                  width: "100%",
                }}
                controls
                src={urlWithMetadata.url}
                onPlay={handleAudioPlay}
                onError={(e) => {
                  window.location.reload();
                }}
              >
                Your browser does not support the
                <code>audio</code> element.
              </audio>

              <Tooltip
                placement="top"
                enterDelay={0}
                leaveDelay={0}
                enterTouchDelay={0}
                leaveTouchDelay={0}
                title={`${urlWithMetadata.author} - ${urlWithMetadata.location}`}
              >
                <IconButton>
                  <InfoOutlinedIcon sx={{ color: "black" }} fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          ))}
    </>
  );

  const audioComponent = (
    <>
      {audioSources[audioRandomIndex] && (
        <Box
          key={`audio-box-${birbId}-before-reveal`}
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr",
            alignItems: "center",
          }}
        >
          <audio
            id={`audio-${birbId}-before-reveal`}
            style={{
              width: "100%",
            }}
            controls
            preload="auto"
            autoPlay
            src={audioSources[audioRandomIndex].url}
            onPlay={handleAudioPlay}
            onLoadedData={(e) => {
              const audio = e.currentTarget;
              audio.play();
            }}
            onCanPlay={(e) => {
              const audio = e.currentTarget;
              audio.play();
            }}
            onError={(e) => {
              window.location.reload();
            }}
          >
            Your browser does not support the
            <code>audio</code> element.
          </audio>
        </Box>
      )}
    </>
  );

  const birbImage = (
    <Box
      sx={{
        marginTop: "1rem",
        display: "grid",
        justifyContent: "center",
        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
        gap: "2rem",
        rowGap: "0.5rem",
      }}
    >
      {imageSources &&
        Object.entries(imageSources)
          .sort(([sexA], [sexB]) => {
            if (sexA === Sex.MALE) return -1;
            if (sexB === Sex.MALE) return 1;
            return 0;
          })
          .map(([sex, images]) => {
            if (!images || images.length === 0) return null;

            const randomIndex =
              sex === Sex.MALE ? imageMaleRandomIndex : imageFemaleRandomIndex;

            return (
              <Box
                key={`image-box-${birbId}-${sex}`}
                sx={{
                  justifySelf: "center",
                }}
              >
                <Typography
                  sx={{
                    display: "grid",
                    alignItems: "center",
                    gridTemplateColumns: "1fr min-content",
                    paddingBottom: "0.2rem",
                  }}
                  variant="body1"
                >
                  {sex.charAt(0).toUpperCase() + sex.slice(1)}
                  <Tooltip
                    placement="top"
                    enterDelay={0}
                    leaveDelay={0}
                    enterTouchDelay={0}
                    leaveTouchDelay={0}
                    title={`${images[randomIndex].author} - ${images[randomIndex].location}`}
                    sx={{ marginBottom: "0.1rem" }}
                  >
                    <IconButton>
                      <InfoOutlinedIcon
                        sx={{ color: "black" }}
                        fontSize="small"
                      />
                    </IconButton>
                  </Tooltip>
                </Typography>
                <Box
                  sx={{
                    cursor: "pointer",
                    overflow: "hidden",
                    padding: "0 0rem",
                  }}
                  onClick={() => {
                    if (sex === Sex.MALE) {
                      setImageMaleRandomIndex(
                        (prevIndex) => (prevIndex + 1) % images.length
                      );
                    } else {
                      setImageFemaleRandomIndex(
                        (prevIndex) => (prevIndex + 1) % images.length
                      );
                    }
                  }}
                >
                  <img
                    style={{
                      height: "100%",
                      width: "100%",
                      objectFit: "contain",
                      // borderRadius: "4px",
                      borderRadius: "4px",
                    }}
                    src={images[randomIndex].url}
                    loading="lazy"
                    alt={eBird[birbId][eBirdNameProperty]}
                  />
                </Box>
              </Box>
            );
          })}
    </Box>
  );

  return (
    <Box
      sx={{
        marginTop: "1.5rem",
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
          margin: "0 1.5rem",
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
            margin: "0 1.5rem",
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
      {!loading && (
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
                marginTop: "1rem",
                padding: "0 1.5rem",
                overflow: "auto",
                paddingBottom: "1rem",
              }}
            >
              <Box
                sx={{
                  display: "grid",
                  gap: "0.5rem",
                  gridTemplateColumns: "repeat(auto-fill, 1fr)",
                }}
              >
                {!shouldReveal && audioComponent}
                {shouldReveal && audioComponents}
              </Box>
              {(previewing || shouldReveal) && birbImage}
            </Box>
          )}
          {gameMode === GameMode.IMAGES && (
            <Box
              sx={{
                marginTop: "1rem",
                overflow: "auto",
                display: "grid",
                padding: "0 1.5rem",
                justifyContent: "center",
              }}
            >
              {birbImage}
            </Box>
          )}
        </Box>
      )}
      {loading && (
        <Box
          sx={{
            display: "grid",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <CircularProgress size="5rem" />
        </Box>
      )}

      {/* Reveal and answer buttons */}
      <Box
        sx={{
          padding: "0 1.5rem",
        }}
      >
        <Box>
          {/* Show reveal button if not already revealed */}
          {!shouldReveal && (
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
                sx={{ height: "40px" }}
                variant="outlined"
                disabled={!audioPlayed && gameMode === GameMode.CHANTS}
                onClick={() => {
                  pauseAllAudio();

                  const newShowAnswers: any = Array.from(showAnswers);
                  newShowAnswers[counter] = !newShowAnswers[counter];
                  setShowAnswers(newShowAnswers);

                  const newAnswers: any = Array.from(answers);
                  newAnswers[counter] = true;
                  setShouldReveal(true);
                  setAnswers(newAnswers);
                }}
              >
                {t.Reveal}
              </Button>
              {gameMode === GameMode.CHANTS && (
                <Button
                  sx={{ height: "40px" }}
                  variant="outlined"
                  onMouseDown={() => setPreviewing(true)}
                  onMouseUp={() => setPreviewing(false)}
                  onMouseLeave={() => setPreviewing(false)}
                  onTouchStart={() => setPreviewing(true)}
                  onTouchEnd={() => setPreviewing(false)}
                >
                  <span role="img" aria-label="peek">
                    👀
                  </span>
                </Button>
              )}
            </Box>
          )}

          {/* Show answer */}
          {shouldRevealMoreNames && (
            <Box
              sx={{
                marginTop: "1rem",
                display: "grid",
                justifyContent: "center",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "0.5rem",
              }}
            >
              <Button
                size="small"
                variant="outlined"
                sx={{
                  height: "40px",
                  pointerEvents: "none",
                  color: "#222222",
                  borderColor: "#222222",
                }}
              >
                {`${Language.EN.toUpperCase()} : ${
                  eBird[birbId][EBirdNameProperty.COMMON_NAME]
                }`}
              </Button>
              <Button
                size="small"
                variant="outlined"
                sx={{
                  height: "40px",
                  pointerEvents: "none",
                  color: "#222222",
                  borderColor: "#222222",
                }}
              >
                {`${Language.FR} : ${
                  eBird[birbId][EBirdNameProperty.COMMON_NAME_FR]
                }`}
              </Button>
              <Button
                size="small"
                variant="outlined"
                sx={{
                  height: "40px",
                  pointerEvents: "none",
                  color: "#222222",
                  borderColor: "#222222",
                }}
              >
                {`${Language.LATIN} : ${
                  eBird[birbId][EBirdNameProperty.SCIENTIFIC_NAME]
                }`}
              </Button>
            </Box>
          )}

          {/* Reveal answer and switch */}
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
                sx={{ height: "40px" }}
                variant="outlined"
                color={answers[counter] ? "success" : "error"}
                onMouseDown={() => setShouldRevealMoreNames(true)}
                onMouseUp={() => setShouldRevealMoreNames(false)}
                onMouseLeave={() => setShouldRevealMoreNames(false)}
                onTouchStart={() => setShouldRevealMoreNames(true)}
                onTouchEnd={() => setShouldRevealMoreNames(false)}
              >
                {`${eBird[birbId][eBirdNameProperty]} 
                      ${
                        regionList[region].includes(birbId)
                          ? ""
                          : `(not found in ${region}, audio came from ${t[region]})`
                      }`}
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
                  disabled={!shouldReveal}
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
            marginTop: "0.5rem",
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
                sx={{ height: "40px" }}
                disabled={!shouldReveal || loading}
                variant="contained"
                onClick={nextQuestion}
                color={answers[counter] ? "success" : "error"}
              >
                <ArrowForwardIcon />
              </Button>
            </Box>
          )}

          {counter === sequence.length - 1 && (
            <Button
              sx={{ height: "40px" }}
              disabled={!shouldReveal || loading}
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
