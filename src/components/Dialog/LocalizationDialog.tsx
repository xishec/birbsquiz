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
  Typography,
} from "@mui/material";
import { QuizContext } from "../../App";
import { DBRegion, Language } from "../../tools/constants";

function LocalizationDialog() {
  const quizContext = React.useContext(QuizContext);
  if (!quizContext) {
    throw new Error("Must be used within a QuizContext.Provider");
  }
  const {
    regionList,
    openLocalizationDialog,
    setOpenLocalizationDialog,
    region,
    setRegion,
    language,
    setLanguage,
    currentTranslation: t,
  } = quizContext;

  return (
    <Dialog
      onClose={() => setOpenLocalizationDialog(false)}
      open={openLocalizationDialog}
      scroll="paper"
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle sx={{ padding: "1.5rem", paddingBottom: "0.5rem" }}>
        <Typography variant="h5" component="span">
          {t.LocalizationSettings}
        </Typography>
      </DialogTitle>
      <DialogContent sx={{ padding: "1.5rem" }}>
        <Typography sx={{ fontSize: "0.9rem" }}>
          {t.LocalizationTitle}
        </Typography>
        <Box
          sx={{
            marginTop: "1rem",
            display: "grid",
            gap: "1rem",
            gridTemplateRows: "repeat(auto-fill, auto)",
          }}
        >
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr" }}>
            <FormControl fullWidth>
              <InputLabel>{t.Region}</InputLabel>
              <Select
                label={t.Region}
                value={region}
                onChange={(event: SelectChangeEvent) => {
                  const key = event.target.value as DBRegion;
                  setRegion(key);
                }}
                size="small"
              >
                <MenuItem key={DBRegion.EARTH} value={DBRegion.EARTH}>
                  {t[DBRegion.EARTH]}
                </MenuItem>
                {regionList &&
                  Object.keys(regionList)
                    .filter((key) => key !== DBRegion.EARTH)
                    .sort()
                    .map((key) => {
                      if (key === DBRegion.EARTH) return null;
                      return (
                        <MenuItem key={key} value={key}>
                          {t[key as DBRegion]}
                        </MenuItem>
                      );
                    })}
              </Select>
            </FormControl>
          </Box>

          <Box sx={{ display: "grid", gridTemplateColumns: "1fr" }}>
            <FormControl fullWidth>
              <InputLabel>{t.Language}</InputLabel>
              <Select
                value={language}
                label={t.Language}
                onChange={(event: SelectChangeEvent) =>
                  setLanguage(event.target.value as Language)
                }
                size="small"
              >
                {Object.entries(Language).map(([key, value]) => (
                  <MenuItem key={key} value={value}>
                    {key}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Button
            sx={{ height: "40px" }}
            variant="outlined"
            onClick={() => setOpenLocalizationDialog(false)}
          >
            OK
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
}

export default LocalizationDialog;
