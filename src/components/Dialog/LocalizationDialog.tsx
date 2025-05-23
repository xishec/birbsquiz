import * as React from "react";
import Dialog from "@mui/material/Dialog";
import {
  Box,
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
import { Language, Region } from "../../tools/constants";

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
        <Typography variant="h5">Localization Settings</Typography>
      </DialogTitle>
      <DialogContent sx={{ padding: "1.5rem" }}>
        <Typography sx={{ fontSize: "0.9rem" }}>
          Change the region to filter birbs
        </Typography>
        <Box
          sx={{
            marginTop: "1rem",
            display: "grid",
            gap: "1rem",
            gridTemplateRows: "auto auto",
          }}
        >
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

          <Box sx={{ display: "grid", gridTemplateColumns: "1fr" }}>
            <FormControl fullWidth>
              <InputLabel>Language</InputLabel>
              <Select
                value={language}
                label="Language"
                onChange={(event: SelectChangeEvent) =>
                  setLanguage(event.target.value)
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
        </Box>
      </DialogContent>
    </Dialog>
  );
}

export default LocalizationDialog;
