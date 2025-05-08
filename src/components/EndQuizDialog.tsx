import * as React from "react";
import Dialog from "@mui/material/Dialog";
import {
  Box,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import StyledChip from "./StyledChip";

export interface QuizDialogProps {
  birbsMapFr: any;
  openEndQuizDialog: boolean;
  answers: Array<boolean>;
  selectedBirbIds: Array<string>;
  setOpenEndQuizDialog: React.Dispatch<any>;
}

function EndQuizDialog({
  birbsMapFr,
  openEndQuizDialog,
  answers,
  selectedBirbIds,
  setOpenEndQuizDialog,
}: QuizDialogProps) {
  const nbGood = answers.filter((answer) => answer).length;
  const nbTotal = answers.length;

  return (
    <Dialog
      onClose={() => setOpenEndQuizDialog(false)}
      open={openEndQuizDialog}
      scroll="paper"
      maxWidth="md"
      fullWidth
    >
      <DialogTitle sx={{ padding: "2rem", paddingBottom: "1.5rem" }}>
        {`Résultats : ${(
          (nbGood / nbTotal) *
          100
        ).toFixed(2)}% (${nbGood}/${nbTotal})`}
      </DialogTitle>
      <DialogContent sx={{ padding: "2rem" }}>
        <Box
          sx={{
            display: "grid",
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
      </DialogContent>
    </Dialog>
  );
}

export default EndQuizDialog;
