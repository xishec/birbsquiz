import * as React from "react";
import Dialog from "@mui/material/Dialog";
import {
  Box,
  Button,
  CircularProgress,
  DialogContent,
  DialogTitle,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";
import { QuizContext } from "../../App";
import {
  AudioType,
  EBirdNameProperty,
  Language,
  LoadingState,
  Sex,
} from "../../tools/constants";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import {
  BirdImage,
  fetchImageAndAudioForMultiple,
  UrlWithMetadata,
} from "../../tools/tools";

function LearnDialog({ birbId }: { birbId: string }) {
  const quizContext = React.useContext(QuizContext);
  if (!quizContext) {
    throw new Error("Must be used within a QuizContext.Provider");
  }
  const {
    isMobileDevice,
    openLearnDialog,
    setOpenLearnDialog,
    eBird,
    eBirdNameProperty,
    region,
    regionList,
    currentTranslation: t,
  } = quizContext;

  const [audioSourcesSong, setAudioSourcesSong] = React.useState<
    UrlWithMetadata[]
  >([]);
  const [audioSourcesCall, setAudioSourcesCall] = React.useState<
    UrlWithMetadata[]
  >([]);
  const [imageSources, setImageSources] = React.useState<BirdImage>();
  const [imageMaleRandomIndex, setImageMaleRandomIndex] = React.useState(0);
  const [imageFemaleRandomIndex, setImageFemaleRandomIndex] = React.useState(0);
  // const [dbBirb, setDBBirb] = React.useState<DB_BIRBS>();
  const [progress, setProgress] = React.useState<number>(0);
  const [loadingState, setLoadingState] = React.useState<LoadingState>(
    LoadingState.UNLOADED
  );
  const [shouldRevealMoreNames, setShouldRevealMoreNames] =
    React.useState(false);

  React.useEffect(() => {
    if (!Object.keys(eBird).includes(birbId)) return;
    console.log("birbId is", birbId);
    fetchImageAndAudioForMultiple([birbId], region, (newProgress) => {
      setProgress(newProgress);
    }).then((newDBBirb) => {
      // setDBBirb(newDBBirb);
      setAudioSourcesSong(newDBBirb[birbId]?.audio?.song || []);
      setAudioSourcesCall(newDBBirb[birbId]?.audio?.call || []);
      setImageSources(newDBBirb[birbId]?.image || undefined);
      // console.log("dbBirbs loaded", newDBBirb);
      setTimeout(() => {
        setLoadingState(LoadingState.DONE);
      }, 500);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [birbId]);

  React.useEffect(() => {
    if (!openLearnDialog) {
      setProgress(0);
      setLoadingState(LoadingState.UNLOADED);
    }
  }, [openLearnDialog]);

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
  };

  const audioComponent = (
    audioSources: UrlWithMetadata[],
    audioType: AudioType
  ) => (
    <>
      {audioSources.slice(0, 5).length > 0 &&
        audioSources.slice(0, 5)[0] &&
        audioSources
          .slice(0, 5)
          .map((urlWithMetadata: UrlWithMetadata, i: number) => (
            <Box
              key={`audio-box-${birbId}-after-reveal-${i}`}
              sx={{
                display: "grid",
                gap: "0.5rem",
                gridTemplateColumns: "60px 1fr min-content",
                alignItems: "center",
              }}
            >
              <Typography
                sx={{
                  marginRight: "0.5rem",
                }}
              >
                {`${audioType.charAt(0).toUpperCase() + audioType.slice(1)} ${
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

  if (!birbId || !Object.keys(eBird).includes(birbId)) {
    if (openLearnDialog) setOpenLearnDialog(false);
    return null;
  }

  const OneOrTwoREM = isMobileDevice ? "1rem" : "2rem";

  return (
    <Dialog
      onClose={() => setOpenLearnDialog(false)}
      open={openLearnDialog}
      scroll="paper"
      maxWidth="xl"
      fullScreen={isMobileDevice}
    >
      <DialogTitle
        sx={{
          paddingInline: OneOrTwoREM,
          paddingBlock: "1rem",
        }}
      >
        <Typography
          variant="h5"
          component="span"
          sx={{
            fontSize: isMobileDevice ? "1.5rem" : "2rem",
          }}
        >
          {eBird[birbId][eBirdNameProperty]}
        </Typography>
      </DialogTitle>
      <DialogContent sx={{ padding: "0", height: "100%" }}>
        {loadingState === LoadingState.DONE ? (
          <Box
            sx={{
              display: "grid",
              height: "100%",
            }}
          >
            <Box sx={{ flexGrow: 1, overflowY: "auto" }}>
              <Box
                sx={{
                  overflow: "auto",
                  paddingInline: OneOrTwoREM,
                  paddingBottom: isMobileDevice ? "2rem" : 0,
                }}
              >
                <Box
                  sx={{
                    display: "grid",
                    gap: "0.5rem",
                    gridTemplateColumns: "repeat(auto-fill, 1fr)",
                  }}
                >
                  {audioComponent(audioSourcesSong, AudioType.SONG)}
                  {audioComponent(audioSourcesCall, AudioType.CAll)}
                </Box>
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
                    Object.entries(imageSources!).map(([sex, images]) => {
                      if (!images || images.length === 0) return null;
                      const randomIndex =
                        sex === Sex.MALE
                          ? imageMaleRandomIndex
                          : imageFemaleRandomIndex;
                      return (
                        <Box
                          key={`image-box-${birbId}-${sex}`}
                          sx={{ justifySelf: "center" }}
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
              </Box>
            </Box>

            {shouldRevealMoreNames && (
              <Box
                sx={{
                  paddingInline: OneOrTwoREM,
                  paddingTop: OneOrTwoREM,
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
            <Box
              sx={{
                paddingInline: OneOrTwoREM,
                paddingTop: OneOrTwoREM,
                display: "grid",
                alignItems: "center",
                gridTemplateColumns: "1fr",
              }}
            >
              <Button
                sx={{ height: "40px" }}
                variant="outlined"
                color="primary"
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
            </Box>

            <Box
              sx={{
                paddingInline: OneOrTwoREM,
                paddingTop: "0.5rem",
                paddingBottom: OneOrTwoREM,
              }}
            >
              <Button
                sx={{ height: "40px", width: "100%" }}
                variant="outlined"
                color="error"
                onClick={() => setOpenLearnDialog(false)}
              >
                Close
              </Button>
            </Box>
          </Box>
        ) : (
          <Box
            sx={{
              height: "100%",
              display: "grid",
              justifyContent: "center",
              alignItems: "center",
              marginTop: "-2rem",
              padding: isMobileDevice ? "0" : "15rem",
            }}
          >
            <Box sx={{ position: "relative", display: "inline-flex" }}>
              <CircularProgress
                variant="determinate"
                size="5rem"
                value={progress}
              />
              <Box
                sx={{
                  top: 0,
                  left: 0,
                  bottom: 0,
                  right: 0,
                  position: "absolute",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Typography
                  variant="caption"
                  component="div"
                  sx={{ color: "text.secondary" }}
                >{`${Math.round(progress)}%`}</Typography>
              </Box>
            </Box>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default LearnDialog;
