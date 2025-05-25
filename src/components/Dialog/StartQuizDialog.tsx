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
import { LoadingState, Region } from "../../tools/constants";

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
    setQuizStarted,
    startQuiz,
    callCheckbox,
    setCallCheckbox,
    songCheckbox,
    setSongCheckbox,
    sliderValue,
    setSliderValue,
    region,
    setRegion,
    setDbBirbs,
  } = quizContext;

  const [maxSliderValue, setMaxSliderValue] = React.useState<number>(
    selectedBirbIds.length
  );
  const [loadingState, setLoadingState] = React.useState<LoadingState>(
    LoadingState.UNLOADED
  );
  const [progress, setProgress] = React.useState<number>(0);

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

  const loadQuiz = () => {
    setLoadingState(LoadingState.LOADING);
    setProgress(0);
    console.log("Loading quiz...");
    fetchImageAndAudioForMultiple(selectedBirbIds, region, (prog) =>
      setProgress(prog)
    ).then((newDbBirbs) => {
      setDbBirbs(newDbBirbs);
      console.log("dbBirbs loaded", newDbBirbs, Object.keys(newDbBirbs).length);
      setTimeout(() => {
        setLoadingState(LoadingState.DONE);
        // console.log("Quiz loaded");
      }, 500);
    });
  };

  const officiallyStartQuiz = () => {
    setQuizStarted(true);
    setOpenStartQuizDialog(false);
    startQuiz(sliderValue);
  };

  React.useEffect(() => {
    if (loadingState === LoadingState.DONE && gameMode !== null) {
      officiallyStartQuiz();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadingState, gameMode]);

  React.useEffect(() => {
    if (openStartQuizDialog && loadingState === LoadingState.UNLOADED)
      loadQuiz();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openStartQuizDialog, loadingState]);

  const shouldShowLoading =
    loadingState === LoadingState.LOADING && gameMode !== null;

  return (
    <Dialog
      onClose={() => {
        setOpenStartQuizDialog(false);
        setLoadingState(LoadingState.UNLOADED);
      }}
      open={openStartQuizDialog}
      scroll="paper"
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle sx={{ padding: "1.5rem", paddingBottom: "1rem" }}>
        {!shouldShowLoading && (
          <Typography variant="h5">Start a quiz</Typography>
        )}
        {shouldShowLoading && <Typography variant="h5">Loading...</Typography>}
      </DialogTitle>
      <DialogContent sx={{ padding: "1.5rem" }}>
        {!shouldShowLoading && (
          <Box
            sx={{
              marginTop: "1rem",
              display: "grid",
              gap: "0.5rem",
              gridTemplateRows: "auto auto auto auto auto",
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
                <InputLabel>Region</InputLabel>
                <Select
                  label="Region"
                  value={region}
                  onChange={(event: SelectChangeEvent) => {
                    const key = event.target.value as Region;
                    setRegion(key);
                  }}
                  size="small"
                >
                  <MenuItem key={Region.EARTH} value={Region.EARTH}>{Region.EARTH}</MenuItem>
                  {regionList &&
                    Object.keys(regionList)
                      .filter((key) => key !== Region.EARTH)
                      .sort()
                      .map((key) => {
                        if (key === Region.EARTH) return null;
                        return (
                          <MenuItem key={key} value={key}>
                            {key}
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
                title={
                  "Show your local birbs (if a selected birb isn't available in your region, we will default back to a EARTH version)"
                }
              >
                <IconButton>
                  <InfoOutlinedIcon sx={{ color: "black" }} fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>

            <Box sx={{ marginTop: "0.5rem" }}>
              <Typography variant="body1" gutterBottom>
                Number of birbs to quiz :
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
                label="Calls"
              />
              <FormControlLabel
                control={<Checkbox />}
                checked={songCheckbox}
                onChange={(event, checked) => setSongCheckbox(checked)}
                label="Songs"
              />
            </FormGroup>

            <Button
              sx={{ height: "40px" }}
              variant="outlined"
              disabled={sliderValue <= 0 || !(callCheckbox || songCheckbox)}
              onClick={() => setGameMode(GameMode.CHANTS)}
            >
              Audio
            </Button>

            <Button
              sx={{ height: "40px" }}
              variant="outlined"
              disabled={sliderValue <= 0}
              onClick={() => setGameMode(GameMode.IMAGES)}
            >
              Image
            </Button>
          </Box>
        )}
        {shouldShowLoading && (
          <Box sx={{ width: "100%", margin: "1rem 0" }}>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Box sx={{ width: "100%", mr: 1 }}>
                <LinearProgress variant="determinate" value={progress} />
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
