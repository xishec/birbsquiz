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
import { useConfirm } from "material-ui-confirm";
import { FavoriteList, Region } from "../../tools/constants";

function EditDialog({
  isAdmin,
  currentList,
  dbListsData,
  setCurrentList,
  saveBirbList,
  deleteBirbList,
}: {
  isAdmin: boolean;
  currentList: string;
  dbListsData: DB_LISTS;
  setCurrentList: (listName: string) => void;
  saveBirbList: (listName: string, favorite: string) => void;
  deleteBirbList: (listName: string) => void;
}) {
  const quizContext = React.useContext(QuizContext);
  if (!quizContext) {
    throw new Error("Must be used within a QuizContext.Provider");
  }
  const { openEditDialog, setOpenEditDialog, region, setRegion, regionList } =
    quizContext;

  const [newListName, setNewListName] = React.useState<string>(currentList);

  const [favorite, setFavorite] = React.useState<FavoriteList>(
    dbListsData[currentList]?.favorite || FavoriteList.NORMAL
  );
  const confirm = useConfirm();
  const handleDelete = async () => {
    const { confirmed } = await confirm({
      title: "Delete list",
      description: `Are you sure you want to delete this list "${currentList}" ?`,
      confirmationText: "Confirm",
    });

    if (confirmed) {
      deleteBirbList(currentList);
      setCurrentList("Custom");
      setOpenEditDialog(false);
    }
  };

  React.useEffect(() => {
    setFavorite(dbListsData[currentList]?.favorite || FavoriteList.NORMAL);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openEditDialog]);

  React.useEffect(() => {
    setNewListName(currentList);
  }, [currentList]);

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
              (Object.keys(dbListsData).includes(newListName) &&
                newListName !== currentList)
            }
            helperText={
              newListName.toLowerCase() === "custom"
                ? "List name cannot be 'Custom'"
                : Object.keys(dbListsData).includes(newListName) &&
                  newListName !== currentList
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

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "0.5rem",
            }}
          >
            <Button
              variant="outlined"
              color="error"
              onClick={() => handleDelete()}
            >
              Delete
            </Button>

            <Button
              disabled={
                !newListName ||
                newListName.toLowerCase() === "custom" ||
                (Object.keys(dbListsData).includes(newListName) &&
                  newListName !== currentList)
              }
              variant="outlined"
              color="success"
              onClick={() => {
                deleteBirbList(currentList);
                saveBirbList(newListName, favorite);
                setCurrentList(newListName!);
                setOpenEditDialog(false);
              }}
            >
              Save
            </Button>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
}

export default EditDialog;
