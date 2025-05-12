import * as React from "react";
import Dialog from "@mui/material/Dialog";
import {
  Box,
  Button,
  Checkbox,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  FormGroup,
  Slider,
  TextField,
  Typography,
} from "@mui/material";
import { GameMode } from "../../App";
import { QuizContext } from "../../App";

function StartQuizDialog() {
  const quizContext = React.useContext(QuizContext);
  if (!quizContext) {
    throw new Error("Must be used within a QuizContext.Provider");
  }
  const {
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
  } = quizContext;

  const [sliderValue, setSliderValue] = React.useState<number>(
    selectedBirbIds.length
  );
  const [maxSliderValue, setMaxSliderValue] = React.useState<number>(
    selectedBirbIds.length
  );

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
    setSliderValue(selectedBirbIds.length);
    setMaxSliderValue(selectedBirbIds.length);
  }, [selectedBirbIds]);

  return (
    <Dialog
      onClose={() => setOpenStartQuizDialog(false)}
      open={openStartQuizDialog}
      scroll="paper"
      maxWidth="md"
      fullWidth
    >
      <DialogTitle sx={{ padding: "2rem", paddingBottom: "1rem" }}>
        Configurations
      </DialogTitle>
      <DialogContent sx={{ padding: "2rem" }}>
        <Box
          sx={{
            display: "grid",
            gap: "1rem",
            gridTemplateRows: "min-content 1fr 1fr 1fr",
          }}
        >
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

          <Box
            sx={{
              display: "grid",
              gap: "1rem",
              gridTemplateColumns: "min-content 1fr",
            }}
          >
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
              variant="outlined"
              disabled={sliderValue <= 0 || !(callCheckbox || songCheckbox)}
              onClick={() => {
                setGameMode(GameMode.CHANTS);
                setQuizStarted(true);
                setOpenStartQuizDialog(false);
                startQuiz(sliderValue);
              }}
            >
              Audio <span style={{ marginLeft: "1rem" }}>🎶</span>
            </Button>
          </Box>

          <Button
            variant="outlined"
            disabled={sliderValue <= 0}
            onClick={() => {
              setGameMode(GameMode.IMAGES);
              setQuizStarted(true);
              setOpenStartQuizDialog(false);
              startQuiz(sliderValue);
            }}
          >
            Images <span style={{ marginLeft: "1rem" }}>👀</span>
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
}

export default StartQuizDialog;
