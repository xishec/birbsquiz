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

function PublishDialog() {
  const [newListName, setNewListName] = React.useState<string>();

  const quizContext = React.useContext(QuizContext);
  if (!quizContext) {
    throw new Error("Must be used within a QuizContext.Provider");
  }
  const {
    regionList,
    openPublishDialog,
    setOpenPublishDialog,
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
      setOpenPublishDialog(false);
      startQuiz(sliderValue);
      setTimeout(() => {
        setLoading(false);
      }, 500);
    });
  };

  return (
    <Dialog
      onClose={() => setOpenPublishDialog(false)}
      open={openPublishDialog}
      scroll="paper"
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle sx={{ padding: "1.5rem", paddingBottom: "0.5rem" }}>
        <Typography variant="h5">Publish</Typography>
      </DialogTitle>
      <DialogContent sx={{ padding: "1.5rem" }}>
        <Typography sx={{ fontSize: "0.9rem" }}>
          Let's share your quiz with others!
        </Typography>
        <Box
          sx={{
            marginTop: "1rem",
            display: "grid",
            gap: "1rem",
            gridTemplateRows: "auto auto",
          }}
        >
          <TextField
            fullWidth
            label="Save current list as ..."
            variant="outlined"
            size="small"
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
          />
          <Button
            disabled={!newListName || newListName === "Custom"}
            variant="outlined"
          >
            "Save As"
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
}

export default PublishDialog;
