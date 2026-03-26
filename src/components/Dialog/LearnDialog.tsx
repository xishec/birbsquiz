import * as React from "react";
import Dialog from "@mui/material/Dialog";
import {
  Box,
  CircularProgress,
  DialogContent,
  Typography,
} from "@mui/material";
import { QuizContext } from "../../App";
import { LoadingState } from "../../tools/constants";
import {
  BirdImage,
  fetchImageAndAudioForMultiple,
  UrlWithMetadata,
} from "../../tools/tools";
import LearnBirbContent from "../LearnBirbContent";

function LearnDialog({ birbId }: { birbId: string }) {
  const quizContext = React.useContext(QuizContext);
  if (!quizContext) {
    throw new Error("Must be used within a QuizContext.Provider");
  }
  const { isMobileDevice, openLearnDialog, setOpenLearnDialog, eBird, region } =
    quizContext;

  const [audioSourcesSong, setAudioSourcesSong] = React.useState<
    UrlWithMetadata[]
  >([]);
  const [audioSourcesCall, setAudioSourcesCall] = React.useState<
    UrlWithMetadata[]
  >([]);
  const [imageSources, setImageSources] = React.useState<BirdImage>();
  const [progress, setProgress] = React.useState<number>(0);
  const [loadingState, setLoadingState] = React.useState<LoadingState>(
    LoadingState.UNLOADED,
  );

  React.useEffect(() => {
    if (!birbId || !eBird[birbId]) {
      return;
    }

    let ignore = false;
    let timeoutId: number | undefined;

    setProgress(0);
    setLoadingState(LoadingState.LOADING);

    fetchImageAndAudioForMultiple(0, [birbId], region, (_, newProgress) => {
      if (!ignore) {
        setProgress(newProgress);
      }
    }).then((newDBBirb) => {
      if (ignore) {
        return;
      }

      setAudioSourcesSong(newDBBirb[birbId]?.audio?.song || []);
      setAudioSourcesCall(newDBBirb[birbId]?.audio?.call || []);
      setImageSources(newDBBirb[birbId]?.image || undefined);
      timeoutId = window.setTimeout(() => {
        setLoadingState(LoadingState.DONE);
      }, 500);
    });

    return () => {
      ignore = true;
      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [birbId, eBird, region]);

  React.useEffect(() => {
    if (!openLearnDialog) {
      setProgress(0);
      setLoadingState(LoadingState.UNLOADED);
      setAudioSourcesSong([]);
      setAudioSourcesCall([]);
      setImageSources(undefined);
    }
  }, [openLearnDialog]);

  React.useEffect(() => {
    if (openLearnDialog && birbId && !eBird[birbId]) {
      setOpenLearnDialog(false);
    }
  }, [birbId, eBird, openLearnDialog, setOpenLearnDialog]);

  if (!birbId || !Object.keys(eBird).includes(birbId)) {
    return null;
  }
  return (
    <Dialog
      onClose={() => setOpenLearnDialog(false)}
      open={openLearnDialog}
      maxWidth={false}
      fullScreen={isMobileDevice}
    >
      <DialogContent
        sx={{
          padding: isMobileDevice ? "1rem" : "2rem",
          width: isMobileDevice ? "100%" : "800px",
          height: isMobileDevice ? "100%" : "80vh",
        }}
      >
        {loadingState === LoadingState.DONE ? (
          <LearnBirbContent
            birbId={birbId}
            audioSourcesCall={audioSourcesCall}
            audioSourcesSong={audioSourcesSong}
            imageSources={imageSources}
          />
        ) : (
          <Box
            sx={{
              height: "100%",
              display: "grid",
              justifyContent: "center",
              alignItems: "center",
              marginTop: "-2rem",
              padding: isMobileDevice ? "0" : "0",
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
