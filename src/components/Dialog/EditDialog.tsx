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

function EditDialog({
  currentList,
  dbListsData,
  setCurrentList,
  saveBirbList,
}: {
  currentList: string;
  dbListsData: DB_LISTS;
  setCurrentList: (listName: string) => void;
  saveBirbList: (listName: string) => void;
}) {
  const [newListName, setNewListName] = React.useState<string>(currentList);

  React.useEffect(() => {
    setNewListName(currentList);
  }, [currentList]);

  const quizContext = React.useContext(QuizContext);
  if (!quizContext) {
    throw new Error("Must be used within a QuizContext.Provider");
  }
  const { openEditDialog, setOpenEditDialog } = quizContext;

  return (
    <Dialog
      onClose={() => setOpenEditDialog(false)}
      open={openEditDialog}
      scroll="paper"
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle sx={{ padding: "1.5rem", paddingBottom: "0.5rem" }}>
        <Typography variant="h5">Edit</Typography>
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
          />
          <Button
            disabled={
              !newListName ||
              newListName === "Custom" ||
              Object.keys(dbListsData).includes(newListName)
            }
            variant="outlined"
            onClick={() => {
              saveBirbList(newListName);
              setCurrentList(newListName!);
              setOpenEditDialog(false);
            }}
          >
            Edit
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
}

export default EditDialog;
