import * as React from "react";
import Dialog from "@mui/material/Dialog";
import {
  Box,
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
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
  const nbGood = answers.filter((answer) => answer).length;
  const nbTotal = answers.length;

  return (
    <Dialog
      onClose={() => setOpenQuizDialog(false)}
      open={openQuizDialog}
      scroll="paper"
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        {`Résultats : ${nbGood}/${nbTotal} - ${((nbGood / nbTotal) * 100).toFixed(2)}%`}
      </DialogTitle>
      <DialogContent>
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
      <DialogActions>
        <Button
          sx={
            {
              // marginBottom: "-1rem",
              // marginRight: "-1rem",
            }
          }
          onClick={() => setOpenQuizDialog(false)}
          variant="contained"
        >
          Retour
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default QuizDialog;
