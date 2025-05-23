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
import { FavoriteList, Region } from "../../tools/constants";

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
    region,
    setRegion,
    regionList,
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
              newListName.toLowerCase() === "custom" ||
              Object.keys(dbListsData).includes(newListName)
            }
            helperText={
              newListName.toLowerCase() === "custom"
                ? "List name cannot be 'Custom'"
                : Object.keys(dbListsData).includes(newListName)
                ? "List name already exists"
                : ""
            }
          />

          <Box sx={{ display: "grid", gridTemplateColumns: "1fr" }}>
            <FormControl fullWidth>
              <InputLabel>Region</InputLabel>{" "}
              <Select
                label="Region"
                value={region}
                onChange={(event: SelectChangeEvent) => {
                  const key = event.target.value;
                  setRegion(key);
                }}
                size="small"
              >
                <MenuItem value={Region.EARTH}>{Region.EARTH}</MenuItem>
                {regionList &&
                  Object.keys(regionList)
                    .filter((key) => key !== Region.EARTH)
                    .sort()
                    .map((key) => {
                      if (key === Region.EARTH) return null;
                      return (
                        <MenuItem key={key} value={key}>
                          {key}
                        </MenuItem>
                      );
                    })}
              </Select>
            </FormControl>
          </Box>

          {isAdmin && (
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr" }}>
              <FormControl fullWidth>
                <InputLabel>Favorite control (admin)</InputLabel>{" "}
                <Select
                  label="Favorite control (admin)"
                  value={favorite}
                  onChange={(event: SelectChangeEvent) => {
                    const key = event.target.value;
                    setFavorite(key as FavoriteList);
                  }}
                  size="small"
                >
                  <MenuItem value={FavoriteList.FAVORITE}>
                    {FavoriteList.FAVORITE}
                  </MenuItem>
                  <MenuItem value={FavoriteList.NORMAL}>
                    {FavoriteList.NORMAL}
                  </MenuItem>
                </Select>
              </FormControl>
            </Box>
          )}

          <Button
            disabled={
              !newListName ||
              newListName.toLowerCase() === "custom" ||
              Object.keys(dbListsData).includes(newListName)
            }
            variant="outlined"
            onClick={() => {
              saveBirbList(newListName, favorite);
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
