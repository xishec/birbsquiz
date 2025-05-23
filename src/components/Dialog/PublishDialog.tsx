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

function PublishDialog({
  dbListsData,
  setCurrentList,
  saveBirbList,
}: {
  dbListsData: DB_LISTS;
  setCurrentList: (listName: string) => void;
  saveBirbList: (listName: string, favorite: string) => void;
}) {
  const [newListName, setNewListName] = React.useState<string>("");
  const [favorite, setFavorite] = React.useState("Normal list");

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
            gridTemplateRows: "auto auto auto",
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
                <MenuItem value="EARTH">EARTH</MenuItem>
                {regionList &&
                  Object.keys(regionList)
                    .filter((key) => key !== "EARTH")
                    .sort()
                    .map((key) => {
                      if (key === "EARTH") return null;
                      return (
                        <MenuItem key={key} value={key}>
                          {key}
                        </MenuItem>
                      );
                    })}
              </Select>
            </FormControl>
          </Box>

          <Box sx={{ display: "grid", gridTemplateColumns: "1fr" }}>
            <FormControl fullWidth>
              <InputLabel>Favorite control (admin)</InputLabel>{" "}
              <Select
                label="Favorite control (admin)"
                value={favorite}
                onChange={(event: SelectChangeEvent) => {
                  const key = event.target.value;
                  setFavorite(key);
                }}
                size="small"
              >
                <MenuItem value="Favorite list">Favorite list</MenuItem>
                <MenuItem value="Normal list">Normal list</MenuItem>
              </Select>
            </FormControl>
          </Box>

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
