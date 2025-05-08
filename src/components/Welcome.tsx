import React, { useCallback, useEffect, useState } from "react";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import ShareIcon from "@mui/icons-material/Share";
import { Box, Button, IconButton, Typography } from "@mui/material";
import StyledChip from "./StyledChip";
import LoginIcon from "@mui/icons-material/Login";
import LogoutIcon from "@mui/icons-material/Logout";
import { auth, database, signInWithGoogle } from "../firebaseDatabaseConfig";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { ref, set, get } from "firebase/database";

type WelcomeProps = {
  birbsMapFr: any;
  birbEmoji: string;
  selectedBirbIds: Array<string>;
  setSelectedBirbIds: React.Dispatch<any>;
  startQuiz: React.Dispatch<any>;
  setOpenSnake: React.Dispatch<any>;
  setSnakeMessage: React.Dispatch<any>;
  css_height_90: string;
};

function Welcome({
  birbsMapFr,
  birbEmoji,
  selectedBirbIds,
  setSelectedBirbIds,
  startQuiz,
  setOpenSnake,
  setSnakeMessage,
  css_height_90,
}: WelcomeProps) {
  const [birbInput, setBirbInput] = React.useState<string>("");
  const [selectedBirbId, setSelectedBirbId] = React.useState<string>("");
  const [user, setUser] = useState<any>(null);
  const [shareClickCount, setShareClickCount] = useState<number>(0);
  const [listName, setListName] = useState("");
  const [dbData, setDbData] = useState<any>({});

  const saveBirbList = () => {
    if (!user) return;
    // Directly reference the path without a push
    const listRef = ref(database, `lists/${listName}`);
    set(listRef, selectedBirbIds)
      .then(() => {
        loadBirbList();
        setSnakeMessage("Liste sauvegardée avec succès!");
        setOpenSnake(true);
      })
      .catch((error) => {
        console.error("Error saving birb list:", error);
        setSnakeMessage("Erreur lors de la sauvegarde!");
        setOpenSnake(true);
      });
  };

  const loadBirbList = useCallback(() => {
    const listRef = ref(database, `lists`);
    get(listRef)
      .then((snapshot) => {
        const data = snapshot.val();
        setDbData(data);
      })
      .catch((error) => {
        console.error("Error reading birb list:", error);
        setSnakeMessage("Erreur lors du chargement de la liste!");
        setOpenSnake(true);
      });
  }, [setOpenSnake, setSnakeMessage, setDbData]);

  useEffect(() => {
    loadBirbList();
  }, [loadBirbList]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsubscribe();
  }, []);

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
    setShareClickCount((prev) => prev + 1);
    const url = new URL(window.location.href);
    const encodedBirbs = btoa(JSON.stringify(selectedBirbIds));
    url.searchParams.set("birbs", encodedBirbs);
    navigator.clipboard.writeText(url.toString());
    url.searchParams.delete("birbs");
    setSnakeMessage(`Lien copié!`);
    setOpenSnake(true);
  };

  useEffect(() => {
    if (selectedBirbId) addBirb(selectedBirbId);
  }, [selectedBirbId, addBirb]);

  return (
    <Box
      sx={{
        overflow: "auto",
        display: "grid",
        height: css_height_90,
        minHeight: 0,
        gridTemplateRows: "auto auto 1fr auto auto auto",
      }}
    >
      <Typography sx={{ justifySelf: "center" }} variant="h2">
        {/* <Box component="span" sx={{ color: "primary.main" }}> */}
        Birbsquiz
        {/* </Box> */}
        {user ? " 🦖" : birbEmoji}
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
      </Box>

      <Box sx={{ marginTop: "1.5rem", overflow: "auto" }}>
        <Box
          sx={{
            display: "grid",
            gap: "0.5rem",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          }}
        >
          {selectedBirbIds.length > 0 &&
            selectedBirbIds.map((birbId, i) => (
              <StyledChip
                key={`chip-${i}`}
                label={birbsMapFr[birbId]}
                variant="outlined"
                onDelete={() => deleteBirb(birbId)}
              />
            ))}
        </Box>
      </Box>

      <Box
        sx={{
          marginTop: "1.5rem",
        }}
      >
        <Box sx={{ marginTop: "0.5rem", display: "flex", gap: "0.5rem" }}>
          {dbData &&
            Object.entries(dbData).map(([key, value]) => {
              return (
                <Button
                  onClick={() => setSelectedBirbIds(value)}
                  variant="outlined"
                  color="primary"
                >
                  {key}
                </Button>
              );
            })}
          {/* <Button
            href="/?birbs=WyIyNDYiLCIyNDciLCIyNTEiLCIyNTIiLCIyNDIiLCIyNTUiLCIyNjUiLCIyNjciLCIyNjkiLCIyNjAiLCIyMzMiLCIyNzAiLCIzMzEiLCIzMTAiLCIzMDkiLCIzMTEiLCIzMTgiLCIzMDEiLCI0MjciLCI0MjQiLCIyOTUiLCIyOTgiLCIyOTkiLCIyODMiLCIyODAiLCIzNTkiLCIzNjYiLCIzNjUiLCIzNjkiLCIzNjIiLCIzNjMiLCIzNzgiLCIzODIiLCIzODEiLCIzODgiLCIzNzkiLCIzNzAiLCIzNjAiLCIzOTEiLCIzNjEiLCI0MDciLCI0MTUiLCI0MDIiLCI0MDUiLCI0MzkiLCIzNDIiLCIzNDEiLCI3MyIsIjMyOSJd"
            variant="outlined"
            color="primary"
          >
            SEAT
          </Button>
          <Button
            href="/?birbs=WyIyNCIsIjI2IiwiMzEiLCIyMzMiLCIxNTMiLCIxNTkiLCIyMDIiLCI2NSIsIjc1IiwiMjQyIiwiMjUyIiwiMjUxIiwiMjYwIiwiMjY1IiwiMjY5IiwiMjcwIiwiMjc3IiwiMzMxIiwiMzIyIiwiMzI3IiwiMzMwIiwiMzI5IiwiNTE3NyIsIjMwNiIsIjMwMiIsIjI4OCIsIjM0MiIsIjQxNSIsIjQwNSIsIjQwMCIsIjQzMiIsIjQzNiIsIjQzOSIsIjM4MiIsIjM2NSIsIjM2MSIsIjM1OSIsIjM2OSIsIjQyNyIsIjQyOSIsIjMwMSIsIjI5MSIsIjQzMSIsIjk2IiwiMzY2IiwiMzcxIiwiNDQyIiwiMjQ2IiwiMjQ3IiwiMjQxIiwiMjEzIiwiMjIyIiwiNzMiLCI3MCIsIjY5IiwiMTAyIiwiNDQwIiwiMzE4IiwiMzk5IiwiNDAyIl0%3D"
            variant="outlined"
            color="primary"
          >
            MBO
          </Button> */}
          <Button
            onClick={() => setSelectedBirbIds([])}
            color="error"
            variant="outlined"
          >
            Empty
          </Button>
        </Box>
      </Box>

      <Box>
        {user && (
          <Box
            sx={{
              marginTop: "0.5rem",
              display: "grid",
              gap: "0.5rem",
              alignItems: "center",
            }}
          >
            <TextField
              id="outlined-basic"
              label="List Name ..."
              variant="outlined"
              size="small"
              value={listName}
              onChange={(e) => setListName(e.target.value)}
            />
            <Button
              disabled={!listName}
              onClick={saveBirbList}
              color="success"
              variant="outlined"
            >
              Save
            </Button>
          </Box>
        )}
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
            gridTemplateColumns: "min-content min-content 1fr",
            gap: "0.5rem",
          }}
        >
          <IconButton
            color="primary"
            onClick={copyUrl}
            disabled={selectedBirbIds.length <= 0}
          >
            <ShareIcon />
          </IconButton>
          <Box>
            {!user && shareClickCount > 5 && (
              <IconButton color="primary" onClick={signInWithGoogle}>
                <LoginIcon />
              </IconButton>
            )}
            {user && (
              <IconButton
                color="error"
                onClick={() => {
                  setShareClickCount(0);
                  signOut(auth);
                }}
              >
                <LogoutIcon />
              </IconButton>
            )}
          </Box>

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
    </Box>
  );
}

export default Welcome;
