import React, { useCallback, useEffect } from "react";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import CopyAllIcon from "@mui/icons-material/CopyAll";
import { Box, Button, IconButton, Link, Typography } from "@mui/material";
import StyledChip from "./StyledChip";

type WelcomeProps = {
  birbsMapFr: any;
  birbEmoji: string;
  selectedBirbIds: Array<string>;
  setSelectedBirbIds: React.Dispatch<any>;
  startQuiz: React.Dispatch<any>;
  setOpenSnake: React.Dispatch<any>;
  setSnakeMessage: React.Dispatch<any>;
};

function Welcome({
  birbsMapFr,
  birbEmoji,
  selectedBirbIds,
  setSelectedBirbIds,
  startQuiz,
  setOpenSnake,
  setSnakeMessage,
}: WelcomeProps) {
  const [birbInput, setBirbInput] = React.useState<string>("");
  const [selectedBirbId, setSelectedBirbId] = React.useState<string>("");

  const addBirb = useCallback(
    (birbId: string) => {
      if (birbsMapFr[birbId] && !selectedBirbIds.find((id) => id === birbId)) {
        setSelectedBirbIds([...selectedBirbIds, birbId]);
      }
      setBirbInput("");
      setSelectedBirbId("");
    },
    [birbsMapFr, selectedBirbIds, setSelectedBirbIds]
  );

  const deleteBirb = useCallback(
    (birbId: string) => {
      const newSelectedBirbIds = selectedBirbIds?.filter((id) => id !== birbId);
      setSelectedBirbIds(newSelectedBirbIds!);
    },
    [selectedBirbIds, setSelectedBirbIds]
  );

  const copyUrl = () => {
    let url = window.location.href;
    navigator.clipboard.writeText(url);
    setSnakeMessage(`Lien copié!`);
    setOpenSnake(true);
  };

  useEffect(() => {
    if (selectedBirbId) addBirb(selectedBirbId);
  }, [selectedBirbId, addBirb]);

  return (
    <>
      <Typography sx={{ justifySelf: "center" }} variant="h2">
        {/* <Box component="span" sx={{ color: "primary.main" }}> */}
        Birbsquiz
        {/* </Box> */}
        {birbEmoji}
      </Typography>

      <Box
        sx={{
          marginTop: "1.5rem",
          display: "grid",
          alignItems: "center",
          gap: "0.5rem",
          gridTemplateColumns: "1fr auto",
        }}
      >
        <Autocomplete
          size="small"
          inputValue={birbInput}
          onInputChange={(e, v) => setBirbInput(v)}
          value={selectedBirbId}
          onChange={(e, v) => setSelectedBirbId(v!)}
          options={Object.keys(birbsMapFr).sort((a, b) =>
            birbsMapFr[a].localeCompare(birbsMapFr[b])
          )}
          getOptionLabel={(birbId) =>
            birbsMapFr[birbId] ? birbsMapFr[birbId] : ""
          }
          freeSolo
          isOptionEqualToValue={(birbId, input) => birbsMapFr[birbId] === input}
          renderInput={(params) => (
            <TextField {...params} label="Recherche ..." variant="outlined" />
          )}
          getOptionDisabled={(option) => selectedBirbIds.includes(option)}
        />
        <Button onClick={() => setSelectedBirbIds([])}>Reset</Button>
      </Box>

      {selectedBirbIds.length > 0 && (
        <Box
          sx={{
            marginTop: "1.5rem",
            display: "grid",
            overflow: "auto",
            gap: "0.5rem",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          }}
        >
          {selectedBirbIds.map((birbId, i) => (
            <StyledChip
              key={`chip-${i}`}
              label={birbsMapFr[birbId]}
              variant="outlined"
              onDelete={() => deleteBirb(birbId)}
            />
          ))}
        </Box>
      )}

      {/* <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <Typography
                sx={{ position: "relative", top: 0 }}
                variant="caption"
              >
                {selectedBirbIds.length} birbs
              </Typography>
            </Box> */}
      <Box
        sx={{
          marginTop: "1.5rem",
        }}
      >
        <Typography>Listes :</Typography>
        <Box sx={{ marginTop: "0.5rem", display: "flex", gap: "0.5rem" }}>
          <Button
            href="https://birbsquiz.web.app/?birbs=WyIyNDYiLCIyNDciLCIyNTEiLCIyNTIiLCIyNDIiLCIyNTUiLCIyNjUiLCIyNjciLCIyNjkiLCIyNjAiLCIyMzMiLCIyNzAiLCIzMzEiLCIzMTAiLCIzMDkiLCIzMTEiLCIzMTgiLCIzMDEiLCI0MjciLCI0MjQiLCIyOTUiLCIyOTgiLCIyOTkiLCIyODMiLCIyODAiLCIzNTkiLCIzNjYiLCIzNjUiLCIzNjkiLCIzNjIiLCIzNjMiLCIzNzgiLCIzODIiLCIzODEiLCIzODgiLCIzNzkiLCIzNzAiLCIzNjAiLCIzOTEiLCIzNjEiLCI0MDciLCI0MTUiLCI0MDIiLCI0MDUiLCI0MzkiLCIzNDIiLCIzNDEiLCI3MyIsIjMyOSJd"
            variant="outlined"
            color="primary"
          >
            SEAT
          </Button>
          <Button
            href="https://birbsquiz.web.app/?birbs=WyIyNCIsIjI2IiwiMzEiLCIyMzMiLCIxNTMiLCIxNTkiLCIyMDIiLCI2NSIsIjc1IiwiMjQyIiwiMjUyIiwiMjUxIiwiMjYwIiwiMjY1IiwiMjY5IiwiMjcwIiwiMjc3IiwiMzMxIiwiMzIyIiwiMzI3IiwiMzMwIiwiMzI5IiwiNTE3NyIsIjMwNiIsIjMwMiIsIjI4OCIsIjM0MiIsIjQxNSIsIjQwNSIsIjQwMCIsIjQzMiIsIjQzNiIsIjQzOSIsIjM4MiIsIjM2NSIsIjM2MSIsIjM1OSIsIjM2OSIsIjQyNyIsIjQyOSIsIjMwMSIsIjI5MSIsIjQzMSIsIjk2IiwiMzY2IiwiMzcxIiwiNDQyIiwiMjQ2IiwiMjQ3IiwiMjQxIiwiMjEzIiwiMjIyIiwiNzMiLCI3MCIsIjY5IiwiMTAyIiwiNDQwIiwiMzE4IiwiMzk5IiwiNDAyIl0%3D"
            variant="outlined"
            color="primary"
          >
            MBO
          </Button>
        </Box>
      </Box>

      <Box
        sx={{
          marginTop: "1.5rem",
          display: "grid",
          gridTemplateColumns: "1fr",
        }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "min-content 1fr",
            gap: "0.5rem",
          }}
        >
          {/* <Button
                  variant="outlined"
                  onClick={copyUrl}
                  disabled={selectedBirbIds.length <= 0}
                >
                  Partager
                </Button> */}
          <IconButton
            color="primary"
            onClick={copyUrl}
            disabled={selectedBirbIds.length <= 0}
          >
            <CopyAllIcon />
          </IconButton>

          <Button
            variant="contained"
            onClick={startQuiz}
            disabled={selectedBirbIds.length <= 0}
          >
            {`Quiz moi ${selectedBirbIds.length} birb${
              selectedBirbIds.length === 1 ? "" : "s"
            }`}
          </Button>
        </Box>
      </Box>
    </>
  );
}

export default Welcome;
