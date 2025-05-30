import * as React from "react";
import Dialog from "@mui/material/Dialog";
import {
  Box,
  Button,
  Checkbox,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormGroup,
  IconButton,
  InputLabel,
  LinearProgress,
  MenuItem,
  Select,
  SelectChangeEvent,
  Slider,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { GameMode } from "../../App";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { QuizContext } from "../../App";
import { fetchImageAndAudioForMultiple } from "../../tools/tools";
import { DBRegion, LoadingState } from "../../tools/constants";

function StartQuizDialog() {
  const quizContext = React.useContext(QuizContext);
  if (!quizContext) {
    throw new Error("Must be used within a QuizContext.Provider");
  }
  const {
    regionList,
    openStartQuizDialog,
    setOpenStartQuizDialog,
    selectedBirbIds,
    gameMode,
    setGameMode,
    prepareQuiz,
    startQuiz,
    callCheckbox,
    setCallCheckbox,
    songCheckbox,
    setSongCheckbox,
    sliderValue,
    setSliderValue,
    region,
    setRegion,
    setDBBirbs,
    sequence,
    endQuiz,
    currentTranslation: t,
  } = quizContext;

  const [maxSliderValue, setMaxSliderValue] = React.useState<number>(
    selectedBirbIds.length
  );
  const [loadingState, setLoadingState] = React.useState<LoadingState>(
    LoadingState.UNLOADED
  );
  const [progress, setProgress] = React.useState<number>(0);
  const cancelRequestRef = React.useRef(false);

  const handleSliderChange = (
    event: Event,
    newValue: number | number[],
    activeThumb: number
  ) => {
    if (openStartQuizDialog) setSliderValue(newValue as number);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value, 10);
    if (!isNaN(value)) {
      if (openStartQuizDialog) setSliderValue(value as number);
    }
  };

  const handleBlur = () => {
    if (!openStartQuizDialog) return;
    if (sliderValue < 0) {
      setSliderValue(0);
    } else if (sliderValue > maxSliderValue) {
      setSliderValue(maxSliderValue);
    }
  };

  React.useEffect(() => {
    if (!openStartQuizDialog) return;
    setMaxSliderValue(selectedBirbIds.length);
    if (sliderValue > selectedBirbIds.length && selectedBirbIds.length > 0) {
      setSliderValue(selectedBirbIds.length);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBirbIds, sliderValue, openStartQuizDialog]);

  React.useEffect(() => {
    if (sequence.length <= 0 || !openStartQuizDialog) return;
    console.log("Starting quiz with sequence", sequence);
    setLoadingState(LoadingState.LOADING);
    setProgress(0);
    cancelRequestRef.current = false;
    console.log("Loading quiz...");
    fetchImageAndAudioForMultiple(sequence, region, (newProgress) => {
      setProgress(newProgress);
    }).then((newDBBirbs) => {
      if (cancelRequestRef.current) return; // cancel if flagged
      setDBBirbs(newDBBirbs);
      console.log("dbBirbs loaded", newDBBirbs, Object.keys(newDBBirbs).length);
      setTimeout(() => {
        if (cancelRequestRef.current) return;
        setLoadingState(LoadingState.DONE);
      }, 500);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sequence]);

  // Close the dialog when loading is done and quiz has started
  React.useEffect(() => {
    if (loadingState === LoadingState.DONE) {
      startQuiz();
      setOpenStartQuizDialog(false);
    }
  }, [loadingState, startQuiz, setOpenStartQuizDialog]);

  // Prepare the quiz when gameMode is set and loadingState is UNLOADED
  React.useEffect(() => {
    if (gameMode !== null && loadingState === LoadingState.UNLOADED) {
      prepareQuiz(sliderValue);
    }
  }, [gameMode, loadingState, sliderValue, prepareQuiz]);

  const shouldShowLoading =
    loadingState === LoadingState.LOADING && gameMode !== null;

  return (
    <Dialog
      onClose={() => {
        cancelRequestRef.current = true; // cancel any in-progress request
        setOpenStartQuizDialog(false);
        setLoadingState(LoadingState.UNLOADED);
        endQuiz();
      }}
      open={openStartQuizDialog}
      scroll="paper"
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle sx={{ padding: "1.5rem", paddingBottom: "1rem" }}>
        {!shouldShowLoading && (
          <Typography variant="h5" component="span">
            {t.StartQuiz}
          </Typography>
        )}
        {shouldShowLoading && (
          <Typography variant="h5" component="span">
            {t.Loading}
          </Typography>
        )}
      </DialogTitle>
      <DialogContent sx={{ padding: "1.5rem" }}>
        {!shouldShowLoading && (
          <Box
            sx={{
              marginTop: "1rem",
              display: "grid",
              gap: "0.5rem",
              gridTemplateRows: "repeat(auto-fill, auto)",
            }}
          >
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr auto",
                gap: "0.5rem",
              }}
            >
              <FormControl fullWidth>
                <InputLabel>{t.Region}</InputLabel>
                <Select
                  label={t.Region}
                  value={region}
                  onChange={(event: SelectChangeEvent) => {
                    const key = event.target.value as DBRegion;
                    setRegion(key);
                  }}
                  size="small"
                >
                  <MenuItem key={DBRegion.EARTH} value={DBRegion.EARTH}>
                    {t[DBRegion.EARTH]}
                  </MenuItem>
                  {regionList &&
                    Object.keys(regionList)
                      .filter((key) => key !== DBRegion.EARTH)
                      .sort()
                      .map((key) => {
                        if (key === DBRegion.EARTH) return null;
                        return (
                          <MenuItem key={key} value={key}>
                            {t[key as DBRegion]}
                          </MenuItem>
                        );
                      })}
                </Select>
              </FormControl>

              <Tooltip
                placement="top"
                enterDelay={0}
                leaveDelay={0}
                enterTouchDelay={0}
                leaveTouchDelay={0}
                title={t.StartHelp}
              >
                <IconButton>
                  <InfoOutlinedIcon sx={{ color: "black" }} fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>

            <Box sx={{ marginTop: "0.5rem" }}>
              <Typography variant="body1" gutterBottom>
                {t.StartNumber}
              </Typography>
              <Box
                sx={{
                  display: "grid",
                  gap: "1rem",
                  gridTemplateColumns: "1fr 75px",
                  alignItems: "center",
                }}
              >
                <Box>
                  <Slider
                    value={sliderValue}
                    min={0}
                    max={maxSliderValue}
                    onChange={handleSliderChange}
                  />
                </Box>
                <Box>
                  <TextField
                    fullWidth
                    size="small"
                    value={sliderValue}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    inputProps={{
                      min: 0,
                      max: maxSliderValue,
                      type: "number",
                    }}
                  />
                </Box>
              </Box>
            </Box>

            <FormGroup
              sx={{
                display: "grid",
                gap: "1rem",
                gridTemplateColumns: "1fr 1fr",
              }}
            >
              <FormControlLabel
                control={<Checkbox />}
                checked={callCheckbox}
                onChange={(event, checked) => setCallCheckbox(checked)}
                label={t.Call}
              />
              <FormControlLabel
                control={<Checkbox />}
                checked={songCheckbox}
                onChange={(event, checked) => setSongCheckbox(checked)}
                label={t.Song}
              />
            </FormGroup>

            <Button
              sx={{ height: "40px" }}
              variant="outlined"
              disabled={sliderValue <= 0 || !(callCheckbox || songCheckbox)}
              onClick={() => setGameMode(GameMode.CHANTS)}
            >
              {t.Audio}
            </Button>

            <Button
              sx={{ height: "40px" }}
              variant="outlined"
              disabled={sliderValue <= 0}
              onClick={() => setGameMode(GameMode.IMAGES)}
            >
              {t.Image}
            </Button>
          </Box>
        )}
        {shouldShowLoading && (
          <Box sx={{ width: "100%", margin: "1rem 0" }}>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Box sx={{ width: "100%", mr: 1 }}>
                <LinearProgress
                  variant="buffer"
                  value={progress}
                  valueBuffer={progress + 10}
                />
              </Box>
              <Box sx={{ minWidth: 35 }}>
                <Typography
                  variant="body2"
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

export default StartQuizDialog;
