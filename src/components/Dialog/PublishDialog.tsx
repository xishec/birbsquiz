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
import { DB_LIST, DB_LISTS } from "../../tools/tools";
import { ref, set } from "firebase/database";
import { database } from "../../firebaseDatabaseConfig";
import { User } from "firebase/auth";

function PublishDialog({
  dbListsData,
  loadBirbList,
  setCurrentList,
  user,
  region,
}: {
  dbListsData: DB_LISTS;
  loadBirbList: () => void;
  setCurrentList: (listName: string) => void;
  user: User;
  region: string;
}) {
  const [newListName, setNewListName] = React.useState<string>();

  const quizContext = React.useContext(QuizContext);
  if (!quizContext) {
    throw new Error("Must be used within a QuizContext.Provider");
  }
  const { openPublishDialog, setOpenPublishDialog, selectedBirbIds } =
    quizContext;

  const saveBirbList = () => {
    const listRef = ref(database, `v2/lists/${newListName}`);
    set(listRef, {
      name: newListName,
      creator: user.uid,
      favorite: false,
      ids: selectedBirbIds,
      region: region,
    } as DB_LIST)
      .then(() => {
        loadBirbList();
      })
      .catch((error) => {
        console.error("Error saving birb list:", error);
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
              saveBirbList();
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
