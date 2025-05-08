import * as React from "react";
import Dialog from "@mui/material/Dialog";
import {
  Box,
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { GameMode } from "../App";

export interface QuizProps {
  setQuizStarted: React.Dispatch<any>;
  setGameMode: React.Dispatch<any>;
  openStartQuizDialog: boolean;
  setOpenStartQuizDialog: React.Dispatch<any>;
}

function StartQuizDialog({
  setQuizStarted,
  setGameMode,
  openStartQuizDialog,
  setOpenStartQuizDialog,
}: QuizProps) {
  return (
    <Dialog
      onClose={() => setOpenStartQuizDialog(false)}
      open={openStartQuizDialog}
      scroll="paper"
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>Choose mode</DialogTitle>
      <DialogContent sx={{ padding: "1.5rem" }}>
        <Box
          sx={{
            display: "grid",
            gap: "1rem",
            gridTemplateRows: "1fr 1fr",
          }}
        >
          <Button
            variant="outlined"
            onClick={() => {
              setGameMode(GameMode.CHANTS);
              setQuizStarted(true);
              setOpenStartQuizDialog(false);
            }}
          >
            Chants <span style={{ marginLeft: "1rem" }}>🎶</span>
          </Button>
          <Button
            variant="outlined"
            onClick={() => {
              setGameMode(GameMode.IMAGES);
              setQuizStarted(true);
              setOpenStartQuizDialog(false);
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
