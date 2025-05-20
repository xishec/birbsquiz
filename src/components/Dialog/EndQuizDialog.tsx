import * as React from "react";
import Dialog from "@mui/material/Dialog";
import { Box, DialogContent, DialogTitle } from "@mui/material";
import StyledChip from "../StyledChip";
import { QuizContext } from "../../App";

function EndQuizDialog() {
  const quizContext = React.useContext(QuizContext);
  if (!quizContext) {
    throw new Error("Must be used within a QuizContext.Provider");
  }
  const {
    eBird,
    openEndQuizDialog,
    setOpenEndQuizDialog,
    sequence,
    answers,
    eBirdNameProperty,
  } = quizContext;

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
      <DialogTitle sx={{ padding: "1.5rem", paddingBottom: "1.5rem" }}>
        {`Résultats : ${((nbGood / nbTotal) * 100).toFixed(
          2
        )}% (${nbGood}/${nbTotal})`}
      </DialogTitle>
      <DialogContent sx={{ padding: "1.5rem" }}>
        <Box
          sx={{
            display: "grid",
            overflow: "auto",
            gap: "0.5rem",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          }}
        >
          {sequence.map((birbId, i) => (
            <StyledChip
              key={`chip-${i}`}
              label={eBird[birbId][eBirdNameProperty]}
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
