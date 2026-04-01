import * as React from "react";
import { Box, IconButton, Tooltip, Typography } from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { QuizContext } from "../App";
import { AudioType, Sex } from "../tools/constants";
import { BirdImage, UrlWithMetadata } from "../tools/tools";
import BirbNames from "./BirbNames";

type LearnBirbContentProps = {
  audioSourcesCall: UrlWithMetadata[];
  audioSourcesSong: UrlWithMetadata[];
  imageSources?: BirdImage | null;
  birbId: string;
  audioRandomIndex?: number;
  highlightedAudioType?: AudioType | null;
};

function LearnBirbContent({
  audioSourcesCall,
  audioSourcesSong,
  imageSources,
  birbId,
  audioRandomIndex,
  highlightedAudioType,
}: LearnBirbContentProps) {
  const quizContext = React.useContext(QuizContext);
  if (!quizContext) {
    throw new Error("Must be used within a QuizContext.Provider");
  }
  const {
    eBird,
    eBirdNameProperty,
    isMobileDevice,
    region,
    regionList,
    currentTranslation: t,
  } = quizContext;

  const [imageMaleRandomIndex, setImageMaleRandomIndex] = React.useState(0);
  const [imageFemaleRandomIndex, setImageFemaleRandomIndex] = React.useState(0);

  React.useEffect(() => {
    setImageMaleRandomIndex(0);
    setImageFemaleRandomIndex(0);
  }, [birbId, imageSources]);

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
  };

  const renderAudioSection = (
    audioSources: UrlWithMetadata[],
    audioType: AudioType,
  ) => (
    <>
      {audioSources.slice(0, 5).map((urlWithMetadata, index) => {
        const isHighlightedAudio =
          audioRandomIndex === index && highlightedAudioType === audioType;

        return (
          <Box
            key={`audio-box-${birbId}-${audioType}-${index}`}
            sx={{
              display: "grid",
              gap: "0.5rem",
              gridTemplateColumns: isMobileDevice
                ? "minmax(0, 1fr) min-content"
                : "60px minmax(0, 1fr) min-content",
              alignItems: "center",
              minWidth: 0,
            }}
          >
            <Typography
              sx={{
                marginRight: "0.5rem",
                fontWeight: isHighlightedAudio ? 700 : undefined,
                minWidth: 0,
                overflowWrap: "anywhere",
                gridColumn: isMobileDevice ? "1 / 2" : undefined,
              }}
            >
              {`${audioType.charAt(0).toUpperCase() + audioType.slice(1)} ${
                index + 1
              }`}
            </Typography>

            <Box
              sx={{
                minWidth: 0,
                gridColumn: isMobileDevice ? "1 / -1" : undefined,
              }}
            >
              <audio
                id={`audio-${birbId}-${audioType}-${index}`}
                style={{
                  width: "100%",
                  maxWidth: "100%",
                }}
                controls
                src={urlWithMetadata.url}
                onPlay={handleAudioPlay}
                onError={() => {
                  window.location.reload();
                }}
              >
                {t.BrowserDoesNotSupportAudio}
              </audio>
            </Box>

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
        );
      })}
    </>
  );

  if (!birbId || !eBird[birbId]) {
    return null;
  }

  const isBirbInRegion = regionList[region].includes(birbId);
  const maleImages = imageSources?.[Sex.MALE] || [];
  const femaleImages = imageSources?.[Sex.FEMALE] || [];
  const hasImages = maleImages.length > 0 || femaleImages.length > 0;
  const hasAudio = audioSourcesSong.length > 0 || audioSourcesCall.length > 0;

  return (
    <Box
      sx={{
        display: "grid",
        gap: "1rem",
        width: "100%",
        minWidth: 0,
      }}
    >
      <BirbNames
        commonName={eBird[birbId].comName}
        commonNameFr={eBird[birbId].comNameFr}
        currentNameProperty={eBirdNameProperty}
        isBirbInRegion={isBirbInRegion}
        region={region}
        regionLabel={t[region]}
        scientificName={eBird[birbId].sciName}
      />

      {hasImages && (
        <Box
          sx={{
            display: "grid",
            justifyContent: "center",
            gridTemplateColumns: {
              xs: "minmax(0, 1fr)",
              sm: "repeat(2, minmax(0, 1fr))",
            },
            gap: "2rem",
            rowGap: "0.5rem",
            width: "100%",
            minWidth: 0,
          }}
        >
          {[
            { images: maleImages, label: t.Male, sex: Sex.MALE },
            { images: femaleImages, label: t.Female, sex: Sex.FEMALE },
          ].map(({ images, label, sex }) => {
            if (images.length === 0) {
              return null;
            }

            const randomIndex =
              sex === Sex.MALE ? imageMaleRandomIndex : imageFemaleRandomIndex;

            return (
              <Box
                key={`image-box-${birbId}-${sex}`}
                sx={{
                  justifySelf: "center",
                  width: "100%",
                  maxWidth: isMobileDevice ? "100%" : "420px",
                  minWidth: 0,
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
                  {label}
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
                    width: "100%",
                  }}
                  onClick={() => {
                    if (sex === Sex.MALE) {
                      setImageMaleRandomIndex(
                        (previousIndex) => (previousIndex + 1) % images.length,
                      );
                    } else {
                      setImageFemaleRandomIndex(
                        (previousIndex) => (previousIndex + 1) % images.length,
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
      )}

      {hasAudio && (
        <Box
          sx={{
            marginTop: "0.5rem",
            display: "grid",
            gap: "0.5rem",
            gridTemplateColumns: "minmax(0, 1fr)",
            width: "100%",
            minWidth: 0,
          }}
        >
          {renderAudioSection(audioSourcesSong, AudioType.SONG)}
          {renderAudioSection(audioSourcesCall, AudioType.CALL)}
        </Box>
      )}
    </Box>
  );
}

export default LearnBirbContent;
