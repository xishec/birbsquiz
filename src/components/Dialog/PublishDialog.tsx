import * as React from "react";
import Dialog from "@mui/material/Dialog";
import {
  Box,
  Button,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
  Typography,
} from "@mui/material";
import { QuizContext } from "../../App";
import { DB_LISTS } from "../../tools/tools";
import { CUSTOM, FavoriteList } from "../../tools/constants";

function PublishDialog({
  isAdmin,
  dbListsData,
  setCurrentList,
  saveBirbList,
}: {
  isAdmin: boolean;
  dbListsData: DB_LISTS;
  setCurrentList: (listName: string) => void;
  saveBirbList: (listName: string, favorite: string) => void;
}) {
  const [newListName, setNewListName] = React.useState<string>("");
  const [favorite, setFavorite] = React.useState<FavoriteList>(
    FavoriteList.NORMAL
  );

  const quizContext = React.useContext(QuizContext);
  if (!quizContext) {
    throw new Error("Must be used within a QuizContext.Provider");
  }
  const {
    openPublishDialog,
    setOpenPublishDialog,
    currentTranslation: t,
  } = quizContext;

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
        <Typography variant="h5" component="span">
          {t.Create}
        </Typography>
      </DialogTitle>
      <DialogContent sx={{ padding: "1.5rem" }}>
        <Typography sx={{ fontSize: "0.9rem" }}>{t.ShareTitle}</Typography>
        <Box
          sx={{
            marginTop: "1rem",
            display: "grid",
            gap: "1rem",
            gridTemplateRows: "repeat(auto-fill, auto)",
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
              newListName.toLowerCase() === CUSTOM ||
              Object.keys(dbListsData).includes(newListName)
            }
            helperText={
              newListName.toLowerCase() === CUSTOM
                ? "List name cannot be 'Custom'"
                : Object.keys(dbListsData).includes(newListName)
                ? "List name already exists"
                : ""
            }
          />

          {isAdmin && (
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr" }}>
              <FormControl fullWidth>
                <InputLabel>{t.FavoriteControl}</InputLabel>{" "}
                <Select
                  label={t.FavoriteControl}
                  value={favorite}
                  onChange={(event: SelectChangeEvent) => {
                    const key = event.target.value;
                    setFavorite(key as FavoriteList);
                  }}
                  size="small"
                >
                  <MenuItem value={FavoriteList.FAVORITE}>
                    {t.Favorite}
                  </MenuItem>
                  <MenuItem value={FavoriteList.NORMAL}>{t.Normal}</MenuItem>
                </Select>
              </FormControl>
            </Box>
          )}

          <Button
            disabled={
              !newListName ||
              newListName.toLowerCase() === CUSTOM ||
              Object.keys(dbListsData).includes(newListName)
            }
            variant="outlined"
            onClick={() => {
              saveBirbList(newListName, favorite);
              console.log("seeting current list to", newListName);
              setCurrentList(newListName!);
              setOpenPublishDialog(false);
            }}
          >
            {t.Create}
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
}

export default PublishDialog;
