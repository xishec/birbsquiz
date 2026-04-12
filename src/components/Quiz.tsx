import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from "react";
import Autocomplete from "@mui/material/Autocomplete";
import Button from "@mui/material/Button";
import { PopperProps } from "@mui/material/Popper";
import {
  Box,
  CircularProgress,
  IconButton,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import CloseIcon from "@mui/icons-material/Close";
import { GameMode, QuizContext, shuffleArray } from "../App";
import { AudioType, Language, Sex } from "../tools/constants";
import { BirdImage, fetchAudioForOne, UrlWithMetadata } from "../tools/tools";
import LearnDialog from "./Dialog/LearnDialog";
import LearnBirbContent from "./LearnBirbContent";
import { buttonSx } from "./buttonStyles";

const updateBooleanAtIndex = (
  items: boolean[],
  index: number,
  value: boolean,
) => {
  const nextItems = [...items];
  nextItems[index] = value;
  return nextItems;
};

const updateItemAtIndex = <T,>(items: T[], index: number, value: T) => {
  const nextItems = [...items];
  nextItems[index] = value;
  return nextItems;
};

const normalizeSearchText = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/['-]/g, "")
    .toLowerCase()
    .trim();

const isPlainEnterKey = (event: {
  key: string;
  metaKey: boolean;
  ctrlKey: boolean;
  altKey: boolean;
}) =>
  event.key === "Enter" && !event.metaKey && !event.ctrlKey && !event.altKey;

const isAutocompleteExpanded = (element: HTMLElement) =>
  element.querySelector("input")?.getAttribute("aria-expanded") === "true";

const quizPagePadding = "1.5rem";
const pinnedAnswerBarRadius = "16px";

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
    selectedBirbIds,
    answers,
    showAnswers,
    answerInputs,
    answerBirbIds,
    endQuiz,
    setCounter,
    setAnswers,
    setShowAnswers,
    setAnswerInputs,
    setAnswerBirbIds,
    gameMode,
    callCheckbox,
    songCheckbox,
    language,
    birbEmoji,
    setOpenLearnDialog,
    eBirdNameProperty,
    dbBirbs,
    setDBBirbs,
    region,
    isMobileDevice,
    currentTranslation: t,
  } = quizContext;

  const [audioRandomIndex, setAudioRandomIndex] = React.useState(0);
  const [revealedAudioType, setRevealedAudioType] =
    React.useState<AudioType | null>(null);
  const [audioSources, setAudioSources] = React.useState<UrlWithMetadata[]>([]);
  const [imageMaleRandomIndex, setImageMaleRandomIndex] = React.useState(0);
  const [imageFemaleRandomIndex, setImageFemaleRandomIndex] = React.useState(0);
  const [imageSources, setImageSources] = React.useState<BirdImage>();
  const [audioPlayed, setAudioPlayed] = React.useState(false);
  const [audioError, setAudioError] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [shouldReveal, setShouldReveal] = React.useState(false);
  const answerBirbIdsRef = React.useRef<Array<string | null>>([]);
  const answerInputRef = useRef<HTMLInputElement>(null);
  const [learnBirbId, setLearnBirbId] = React.useState("");
  const birbId = sequence[counter];
  const answerInput = answerInputs[counter] ?? "";
  const selectedAnswerBirbId = answerBirbIds[counter] ?? null;

  const sortedAllBirbIds = useMemo(
    () =>
      Object.keys(eBird).sort((leftBirbId, rightBirbId) =>
        eBird[leftBirbId][eBirdNameProperty].localeCompare(
          eBird[rightBirbId][eBirdNameProperty],
        ),
      ),
    [eBird, eBirdNameProperty],
  );

  const pauseAllAudio = useCallback(() => {
    const audioElements = document.querySelectorAll("audio");
    audioElements.forEach((audio) => {
      audio.pause();
    });
  }, []);

  const updateCurrentAnswerInput = (value: string) => {
    setAnswerInputs((previousAnswerInputs) =>
      updateItemAtIndex(previousAnswerInputs, counter, value),
    );
  };

  const updateCurrentAnswerBirbId = (value: string | null) => {
    setAnswerBirbIds((previousAnswerBirbIds) => {
      const nextAnswerBirbIds = updateItemAtIndex(
        previousAnswerBirbIds,
        counter,
        value,
      );
      answerBirbIdsRef.current = nextAnswerBirbIds;
      return nextAnswerBirbIds;
    });
  };

  const nextQuestion = useCallback(() => {
    pauseAllAudio();
    setLoading(true);
    setCounter((previousCounter) => previousCounter + 1);
    setAudioPlayed(false);
  }, [pauseAllAudio, setCounter]);

  const previousQuestion = useCallback(() => {
    pauseAllAudio();
    setLoading(true);
    setCounter((previousCounter) => previousCounter - 1);
    setAudioPlayed(false);
  }, [pauseAllAudio, setCounter]);

  const handleAudioPlay = (
    e: React.SyntheticEvent<HTMLAudioElement, Event>,
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
    answerBirbIdsRef.current = answerBirbIds;
  }, [answerBirbIds]);

  useEffect(() => {
    setLoading(true);
    setShouldReveal(false);
  }, [counter, selectedBirbIds, sequence]);

  useEffect(() => {
    setAnswerInputs((previousAnswerInputs) =>
      sequence.map((_, index) => previousAnswerInputs[index] ?? ""),
    );
    setAnswerBirbIds((previousAnswerBirbIds) => {
      const nextAnswerBirbIds = sequence.map(
        (_, index) => previousAnswerBirbIds[index] ?? null,
      );
      answerBirbIdsRef.current = nextAnswerBirbIds;
      return nextAnswerBirbIds;
    });
  }, [sequence, setAnswerBirbIds, setAnswerInputs]);

  const revealCurrentQuestion = () => {
    pauseAllAudio();
    const isCorrectAnswer = answerBirbIdsRef.current[counter] === birbId;
    setShowAnswers((previousShowAnswers) =>
      updateBooleanAtIndex(previousShowAnswers, counter, true),
    );
    setShouldReveal(true);
    setAnswers((previousAnswers) =>
      updateBooleanAtIndex(previousAnswers, counter, isCorrectAnswer),
    );
  };

  const fetchAndSetAudioSources = () => {
    const birdAudio = dbBirbs[birbId]?.audio;
    if (!birdAudio) return;

    const birdRandomSeed = (randomSeed * ((counter % 10) + 1)) % 1;

    let newAudioType = AudioType.CALL;

    if (!birdAudio[AudioType.SONG]) {
      newAudioType = AudioType.CALL;
    } else if (!birdAudio[AudioType.CALL]) {
      newAudioType = AudioType.SONG;
    } else {
      if (callCheckbox) {
        newAudioType = AudioType.CALL;
      }
      if (songCheckbox) {
        newAudioType = AudioType.SONG;
      }
      if (callCheckbox && songCheckbox) {
        newAudioType = birdRandomSeed < 0.5 ? AudioType.CALL : AudioType.SONG;
      }
    }

    const urlWithMetadata = birdAudio[newAudioType];
    const candidateCount = Math.min(urlWithMetadata.length, 5);
    const randomIndex = Math.floor(birdRandomSeed * candidateCount);
    setRevealedAudioType(newAudioType);
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
    setRevealedAudioType(null);
    setAudioError(false);
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
        },
      );
      setShouldReveal(showAnswers[counter] ?? false);
    }
  }, [imageSources, counter, showAnswers]);

  const isFirstQuestion = counter === 0;
  const isLastQuestion = counter === sequence.length - 1;
  const hasAnswerInput = answerInput.trim().length > 0;
  const advanceRevealedQuestion = useCallback(() => {
    if (isLastQuestion) {
      endQuiz();
    } else {
      nextQuestion();
    }
  }, [endQuiz, isLastQuestion, nextQuestion]);

  useEffect(() => {
    if (!shouldReveal || loading) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isPlainEnterKey(event) || event.defaultPrevented || event.repeat) {
        return;
      }

      event.preventDefault();
      advanceRevealedQuestion();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [advanceRevealedQuestion, loading, shouldReveal]);

  const answerAutocompleteComponentsProps = useMemo<{
    popper: Partial<PopperProps>;
  }>(
    () => ({
      popper: {
        placement: isMobileDevice ? "top-start" : "bottom-start",
        popperOptions: {
          strategy: "absolute",
        },
        modifiers: [
          {
            name: "offset",
            options: {
              offset: [0, 8],
            },
          },
          {
            name: "preventOverflow",
            options: {
              boundary: "viewport",
              padding: 8,
            },
          },
        ],
        sx: {
          zIndex: 1500,
        },
      },
    }),
    [isMobileDevice],
  );

  if (!birbId || !eBird[birbId]) {
    return null;
  }

  const answerLanguageLabel =
    language === Language.EN
      ? t.English
      : language === Language.FR
        ? t.French
        : t.Latin;
  const revealedAnswerText = hasAnswerInput
    ? `${answers[counter] ? "" : "Learn"} ${answerInput}`
    : t.NoAnswer;
  const revealSongSources = dbBirbs[birbId]?.audio?.[AudioType.SONG] || [];
  const revealCallSources = dbBirbs[birbId]?.audio?.[AudioType.CALL] || [];
  const isPinnedMobileAnswerBar = isMobileDevice && !shouldReveal;
  const pinnedAnswerBarReserve =
    "calc(8.5rem + var(--footer-height) + env(safe-area-inset-bottom))";
  const pinnedAnswerBarBottom =
    "calc(var(--footer-height) + env(safe-area-inset-bottom) + 0.75rem)";
  const answerAutocompleteListboxSx = isMobileDevice
    ? {
        maxHeight: "calc(var(--vh, 1vh) * 45)",
      }
    : undefined;
  const answerAutocompleteNoOptionsText =
    answerInput.trim().length < 3 ? t.TypeAtLeast3Characters : t.NoMatchingBirds;
  const answerInputLabelProps = isPinnedMobileAnswerBar
    ? {
        shrink: true,
      }
    : undefined;
  const pinnedAnswerBarSx = isPinnedMobileAnswerBar
    ? {
        left: "50%",
        bottom: pinnedAnswerBarBottom,
        transform: "translateX(-50%)",
        width: "calc(100vw - (var(--screen-padding) * 2))",
        maxWidth: "800px",
        borderRadius: pinnedAnswerBarRadius,
      }
    : undefined;

  const answerAutocomplete = () => (
    <Autocomplete
      autoHighlight
      blurOnSelect={isMobileDevice ? "touch" : false}
      componentsProps={answerAutocompleteComponentsProps}
      disablePortal={isMobileDevice}
      forcePopupIcon={false}
      ListboxProps={{
        sx: answerAutocompleteListboxSx,
      }}
      size="small"
      value={selectedAnswerBirbId}
      inputValue={answerInput}
      onChange={(_event, value) => {
        updateCurrentAnswerBirbId(value);
        updateCurrentAnswerInput(value ? eBird[value][eBirdNameProperty] : "");
        if (isMobileDevice && value) {
          window.setTimeout(() => {
            answerInputRef.current?.blur();
          }, 0);
        }
      }}
      onInputChange={(_event, value, reason) => {
        updateCurrentAnswerInput(value);
        if (reason === "clear" || reason === "input") {
          updateCurrentAnswerBirbId(null);
        }
      }}
      filterOptions={(options, { inputValue }) => {
        if (inputValue.length < 3) {
          return [];
        }

        const searchTerms = normalizeSearchText(inputValue)
          .split(" ")
          .filter((term) => term);

        return options.filter((option) => {
          const optionLabel = normalizeSearchText(
            eBird[option][eBirdNameProperty],
          );
          return searchTerms.every((term) => optionLabel.includes(term));
        });
      }}
      options={sortedAllBirbIds}
      getOptionLabel={(answerBirbId) =>
        eBird[answerBirbId] ? eBird[answerBirbId][eBirdNameProperty] : ""
      }
      isOptionEqualToValue={(option, value) => option === value}
      noOptionsText={answerAutocompleteNoOptionsText}
      renderInput={(params) => (
        <TextField
          {...params}
          autoFocus
          inputRef={answerInputRef}
          label={`${t.Answer} (${answerLanguageLabel}) ...`}
          InputLabelProps={answerInputLabelProps}
          onKeyDown={(event) => {
            if (!isPlainEnterKey(event)) {
              return;
            }

            if (isAutocompleteExpanded(event.currentTarget)) {
              return;
            }

            event.preventDefault();
            revealCurrentQuestion();
          }}
        />
      )}
    />
  );

  const answerSubmitButton = (
    <Button
      sx={buttonSx}
      variant="outlined"
      disabled={!audioPlayed && gameMode === GameMode.CHANTS}
      onClick={revealCurrentQuestion}
    >
      {hasAnswerInput ? t.Confirm : t.NoAnswer}
    </Button>
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
          {audioError ? (
            <Typography variant="body2" color="text.secondary" sx={{ padding: "0.5rem 0" }}>
              {t.AudioUnavailable}
            </Typography>
          ) : (
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
              onError={() => {
                setAudioError(true);
                setAudioPlayed(true);
                fetchAudioForOne(birbId, region, true).then((audio) => {
                  if (audio) {
                    setDBBirbs((prev) => ({
                      ...prev,
                      [birbId]: { ...prev[birbId], audio },
                    }));
                  }
                });
              }}
            >
              {t.BrowserDoesNotSupportAudio}
            </audio>
          )}
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
                        (prevIndex) => (prevIndex + 1) % images.length,
                      );
                    } else {
                      setImageFemaleRandomIndex(
                        (prevIndex) => (prevIndex + 1) % images.length,
                      );
                    }
                  }}
                >
                  <img
                    style={{
                      height: "100%",
                      width: "100%",
                      objectFit: "contain",
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
    <>
      <LearnDialog birbId={learnBirbId} />
      <Box
        sx={{
          overflow: "hidden",
          overscrollBehavior: "contain",
          display: "grid",
          height: "100%",
          minHeight: 0,
          boxSizing: "border-box",
          paddingTop: quizPagePadding,
          gridTemplateRows: "auto 1fr auto",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: "grid",
            alignItems: "center",
            gridTemplateColumns: "1fr auto 1fr",
            margin: `0 ${quizPagePadding}`,
            gap: "1rem",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
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
              justifyContent: "center",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <IconButton onClick={previousQuestion} disabled={isFirstQuestion}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h4" sx={{ alignSelf: "center" }}>
              {`${counter + 1}/${sequence.length}`}
            </Typography>
            <IconButton onClick={nextQuestion} disabled={isLastQuestion}>
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
              minHeight: 0,
              overscrollBehavior: "contain",
              display: "flex",
              flexDirection: "column",
              justifyContent: "start",
              paddingBottom: isPinnedMobileAnswerBar
                ? pinnedAnswerBarReserve
                : 0,
            }}
          >
            {gameMode === GameMode.CHANTS && (
              <Box
                sx={{
                  marginTop: "1rem",
                  padding: `0 ${quizPagePadding}`,
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
                </Box>
                {shouldReveal && (
                  <LearnBirbContent
                    birbId={birbId}
                    audioSourcesCall={revealCallSources}
                    audioSourcesSong={revealSongSources}
                    imageSources={imageSources}
                    audioRandomIndex={audioRandomIndex}
                    highlightedAudioType={revealedAudioType}
                  />
                )}
              </Box>
            )}
            {gameMode === GameMode.IMAGES && !loading && (
              <Box
                sx={{
                  marginTop: "1rem",
                  overflow: "auto",
                  display: "grid",
                  padding: `0 ${quizPagePadding}`,
                  justifyContent: "center",
                }}
              >
                {!shouldReveal && birbImage}
                {shouldReveal && (
                  <LearnBirbContent
                    birbId={birbId}
                    audioSourcesCall={revealCallSources}
                    audioSourcesSong={revealSongSources}
                    imageSources={imageSources}
                  />
                )}
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

        <Box
          sx={{
            padding: isPinnedMobileAnswerBar
              ? 0
              : `${quizPagePadding} ${quizPagePadding} 0`,
            boxSizing: "border-box",
            backgroundColor: "background.paper",
            position: isPinnedMobileAnswerBar ? "fixed" : "relative",
            zIndex: isPinnedMobileAnswerBar ? 1600 : 1,
            ...pinnedAnswerBarSx,
          }}
        >
          <Box>
            <Box
              sx={{
                display: "grid",
                gap: "0.5rem",
              }}
            >
              {!shouldReveal && (
                <>
                  {answerAutocomplete()}
                  {answerSubmitButton}
                </>
              )}

              {shouldReveal && (
                <>
                  <Button
                    sx={{
                      ...buttonSx,
                      textTransform: "none",
                      px: 1.75,
                    }}
                    disabled={answers[counter] || !selectedAnswerBirbId}
                    fullWidth
                    variant="outlined"
                    color={answers[counter] ? "success" : "error"}
                    onClick={() => {
                      if (!selectedAnswerBirbId) {
                        return;
                      }
                      setLearnBirbId(selectedAnswerBirbId);
                      setOpenLearnDialog(true);
                    }}
                  >
                    <Typography component="span">
                      {revealedAnswerText}
                    </Typography>
                  </Button>
                  {!isLastQuestion && (
                    <Box
                      sx={{
                        display: "grid",
                        alignItems: "center",
                        gridTemplateColumns: "1fr auto",
                      }}
                    >
                      <Button
                        sx={buttonSx}
                        variant="contained"
                        onClick={advanceRevealedQuestion}
                        color={answers[counter] ? "success" : "error"}
                      >
                        <ArrowForwardIcon />
                      </Button>
                    </Box>
                  )}

                  {isLastQuestion && (
                    <Button
                      sx={buttonSx}
                      variant="contained"
                      onClick={advanceRevealedQuestion}
                      color={answers[counter] ? "success" : "error"}
                    >
                      <ArrowForwardIcon />
                    </Button>
                  )}
                </>
              )}
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
}

export default Quiz;
