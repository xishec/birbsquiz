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
import { CUSTOM, FavoriteList } from "../../tools/constants";

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
  saveBirbList: (newListName: string, favorite?: string) => void;
  deleteBirbList: (listName: string) => void;
}) {
  const quizContext = React.useContext(QuizContext);
  if (!quizContext) {
    throw new Error("Must be used within a QuizContext.Provider");
  }
  const {
    openEditDialog,
    setOpenEditDialog,
    currentTranslation: t,
  } = quizContext;

  const [newListName, setNewListName] = React.useState<string>(currentList);

  const [favorite, setFavorite] = React.useState<FavoriteList>(
    dbListsData[currentList]?.favorite || FavoriteList.NORMAL
  );
  const confirm = useConfirm();
  const handleDelete = async () => {
    const { confirmed } = await confirm({
      title: t.Delete,
      description: `${t.DeleteTile} "${currentList}" ?`,
      confirmationText: t.Confirm,
    });

    if (confirmed) {
      deleteBirbList(currentList);
      setCurrentList(CUSTOM);
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
        <Typography variant="h5" component="span">
          {t.Edit}
        </Typography>
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
              newListName.toLowerCase() === CUSTOM ||
              (Object.keys(dbListsData).includes(newListName) &&
                newListName !== currentList)
            }
            helperText={
              newListName.toLowerCase() === CUSTOM
                ? `${t.TitleCustom} be '${t.Custom}'`
                : Object.keys(dbListsData).includes(newListName) &&
                  newListName !== currentList
                ? t.TitleDuplicate
                : ""
            }
          />

          {isAdmin && (
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr" }}>
              <FormControl fullWidth>
                <InputLabel>{t.FavoriteControl}</InputLabel>
                <Select
                  label={t.FavoriteControl}
                  value={favorite}
                  onChange={(event: SelectChangeEvent) => {
                    const key = event.target.value;
                    setFavorite(key as FavoriteList);
                  }}
                  size="small"
                >
                  <MenuItem
                    key={FavoriteList.FAVORITE}
                    value={FavoriteList.FAVORITE}
                  >
                    {t.Favorite}
                  </MenuItem>
                  <MenuItem
                    key={FavoriteList.NORMAL}
                    value={FavoriteList.NORMAL}
                  >
                    {t.Normal}
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
              {t.Delete}
            </Button>

            <Button
              disabled={
                !newListName ||
                newListName.toLowerCase() === CUSTOM ||
                (Object.keys(dbListsData).includes(newListName) &&
                  newListName !== currentList)
              }
              variant="outlined"
              color="success"
              onClick={() => {
                saveBirbList(newListName, favorite);
                deleteBirbList(currentList);
                setCurrentList(newListName!);
                setOpenEditDialog(false);
              }}
            >
              {t.Save}
            </Button>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
}

export default EditDialog;
