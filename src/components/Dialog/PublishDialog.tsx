import * as React from "react";
import Dialog from "@mui/material/Dialog";
import {
  Box,
  Button,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from "@mui/material";
import { QuizContext } from "../../App";
import { DB_LISTS } from "../../tools/tools";

function PublishDialog({
  dbListsData,
  setCurrentList,
  saveBirbList,
}: {
  dbListsData: DB_LISTS;
  setCurrentList: (listName: string) => void;
  saveBirbList: (listName: string) => void;
}) {
  const [newListName, setNewListName] = React.useState<string>("");

  const quizContext = React.useContext(QuizContext);
  if (!quizContext) {
    throw new Error("Must be used within a QuizContext.Provider");
  }
  const { openPublishDialog, setOpenPublishDialog } = quizContext;

  return (
    <Dialog
      onClose={() => {
        setOpenPublishDialog(false);
        setNewListName("");
      }}
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
            label="List name"
            variant="outlined"
            size="small"
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
            error={
              newListName === "Custom" ||
              Object.keys(dbListsData).includes(newListName)
            }
            helperText={
              newListName === "Custom"
                ? "List name cannot be 'Custom'"
                : Object.keys(dbListsData).includes(newListName)
                ? "List name already exists"
                : ""
            }
          />
          <Button
            disabled={
              !newListName ||
              newListName.toLowerCase() === "custom" ||
              Object.keys(dbListsData).includes(newListName)
            }
            variant="outlined"
            onClick={() => {
              saveBirbList(newListName);
              setCurrentList(newListName!);
              setOpenPublishDialog(false);
            }}
          >
            Publish
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
}

export default PublishDialog;
