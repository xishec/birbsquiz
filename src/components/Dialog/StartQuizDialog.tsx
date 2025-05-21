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
  } = quizContext;

  const [maxSliderValue, setMaxSliderValue] = React.useState<number>(
    selectedBirbIds.length
  );
  const [loading, setLoading] = React.useState(false);
  const [progress, setProgress] = React.useState<number>(0);

  const handleSliderChange = (
    event: Event,
    newValue: number | number[],
    activeThumb: number
  ) => {
    setSliderValue(newValue as number);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value, 10);
    if (!isNaN(value)) {
      setSliderValue(value);
    }
  };

  const handleBlur = () => {
    if (sliderValue < 0) {
      setSliderValue(0);
    } else if (sliderValue > maxSliderValue) {
      setSliderValue(maxSliderValue);
    }
  };

  React.useEffect(() => {
    setMaxSliderValue(selectedBirbIds.length);
    if (sliderValue > selectedBirbIds.length && selectedBirbIds.length > 0) {
      setSliderValue(selectedBirbIds.length);
    }
  }, [selectedBirbIds, sliderValue]);

  const loadQuiz = (gameMode: GameMode) => {
    setLoading(true);
    setProgress(0);
    fetchImageAndAudioForMultiple(selectedBirbIds, region, (prog) =>
      setProgress(prog)
    ).then(() => {
      setGameMode(gameMode);
      setQuizStarted(true);
      setOpenStartQuizDialog(false);
      startQuiz(sliderValue);
      setTimeout(() => {
        setLoading(false);
      }, 500);
    });
  };

  return (
    <Dialog
      onClose={() => setOpenStartQuizDialog(false)}
      open={openStartQuizDialog}
      scroll="paper"
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle sx={{ padding: "1.5rem", paddingBottom: "1rem" }}>
        {!loading && <Typography variant="h5">Start a quiz</Typography>}
        {loading && <Typography variant="h5">Loading...</Typography>}
      </DialogTitle>
      <DialogContent sx={{ padding: "1.5rem" }}>
        {!loading && (
          <Box
            sx={{
              marginTop: "1rem",
              display: "grid",
              gap: "1rem",
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
                    const key = event.target.value;
                    setRegion(key);
                  }}
                  size="small"
                >
                  <MenuItem value="EARTH">EARTH</MenuItem>
                  {regionList &&
                    Object.keys(regionList)
                      .filter((key) => key !== "EARTH")
                      .sort()
                      .map((key) => {
                        if (key === "EARTH") return null;
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

            <Box>
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
              onClick={() => {
                loadQuiz(GameMode.CHANTS);
              }}
            >
              Audio
            </Button>

            <Button
              sx={{ height: "40px" }}
              variant="outlined"
              disabled={sliderValue <= 0}
              onClick={() => {
                loadQuiz(GameMode.IMAGES);
              }}
            >
              Image
            </Button>
          </Box>
        )}
        {loading && (
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
