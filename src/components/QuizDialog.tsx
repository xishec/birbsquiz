import * as React from "react";
import Dialog from "@mui/material/Dialog";
import { Box, Typography } from "@mui/material";
import StyledChip from "./StyledChip";

export interface QuizDialogProps {
  birbsMapFr: any;
  openQuizDialog: boolean;
  answers: Array<boolean>;
  selectedBirbIds: Array<string>;
  setOpenQuizDialog: React.Dispatch<any>;
}

function QuizDialog({
  birbsMapFr,
  openQuizDialog,
  answers,
  selectedBirbIds,
  setOpenQuizDialog,
}: QuizDialogProps) {
  return (
    <Dialog onClose={() => setOpenQuizDialog(false)} open={openQuizDialog}>
      <Box sx={{ padding: "2rem" }}>
        <Typography variant="h5">Résultats</Typography>
        <Box
          sx={{
            marginTop: "1rem",
            display: "grid",
            gridTemplateRows: "min-content min-content min-content",
            overflow: "auto",
            gap: "0.5rem",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          }}
        >
          {selectedBirbIds.map((birbId, i) => (
            <StyledChip
              key={`chip-${i}`}
              label={birbsMapFr[birbId]}
              variant="outlined"
              color={answers[i] ? "success" : "error"}
            />
          ))}
        </Box>
      </Box>
    </Dialog>
  );
}

export default QuizDialog;
