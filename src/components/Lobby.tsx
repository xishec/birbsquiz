import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import ShareIcon from "@mui/icons-material/Share";
import {
  Box,
  Button,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Typography,
} from "@mui/material";
import StyledChip from "./StyledChip";
import LoginIcon from "@mui/icons-material/Login";
import LogoutIcon from "@mui/icons-material/Logout";
import { auth, database, signInWithGoogle } from "../firebaseDatabaseConfig";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { ref, set, get } from "firebase/database";
import { QuizContext } from "../App";
import { AudioType, fetchAudioForOne } from "../macaulay/Helper";

function Lobby() {
  const quizContext = useContext(QuizContext);
  if (!quizContext) {
    throw new Error("Must be used within a QuizContext.Provider");
  }
  const {
    eBird,
    birbEmoji,
    selectedBirbIds,
    setSelectedBirbIds,
    setOpenStartQuizDialog,
    setOpenSnake,
    setSnakeMessage,
    css_height_90,
    currentList,
    setCurrentList,
    customList,
    setCustomList,
  } = quizContext;

  const [birbInput, setBirbInput] = React.useState<string>("");
  const [selectedBirbId, setSelectedBirbId] = React.useState<string>("");
  const [user, setUser] = useState<any>(null);
  const [shareClickCount, setShareClickCount] = useState<number>(0);
  const [listName, setListName] = useState(currentList);
  const [dbListsData, setDbListsData] = useState<any>({});

  const handleChange = (event: SelectChangeEvent) => {
    const key = event.target.value;
    if (key === "Custom") {
      setSelectedBirbIds(customList ? customList : []);
    } else {
      setSelectedBirbIds(dbListsData[key]);
    }
    setCurrentList(key);
  };

  useEffect(() => {
    if (currentList === "Custom") {
      setCustomList(selectedBirbIds);
    }
    setListName(currentList);
  }, [currentList, selectedBirbIds, setCustomList]);

  const saveBirbList = () => {
    if (!user) return;
    // Directly reference the path without a push
    const listRef = ref(database, `v2/lists/${listName}`);
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
    const listRef = ref(database, `v2/lists`);
    get(listRef)
      .then((snapshot) => {
        let data = snapshot.val();
        if (!data) {
          data = {};
          set(listRef, data)
            .then(() =>
              console.log("Created v2/lists because it did not exist")
            )
            .catch((error) => console.error("Error creating v2/lists:", error));
        }
        setDbListsData(data);
      })
      .catch((error) => {
        console.error("Error reading birb list:", error);
        setSnakeMessage("Erreur lors du chargement de la liste!");
        setOpenSnake(true);
      });
  }, [setOpenSnake, setSnakeMessage, setDbListsData]);

  useEffect(() => {
    loadBirbList();
  }, [loadBirbList]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsubscribe();
  }, []);

  const addBirb = useCallback(
    (birbId: string) => {
      if (eBird[birbId] && !selectedBirbIds.find((id) => id === birbId)) {
        setSelectedBirbIds([...selectedBirbIds, birbId]);
      }
      playAudioForBirb(birbId, AudioType.SONG);
      setBirbInput("");
      setSelectedBirbId("");
    },
    [eBird, selectedBirbIds, setSelectedBirbIds]
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

  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  const playAudioForBirb = (birbId: string, audioType: AudioType) => {
    fetchAudioForOne(birbId).then((birdAudio) => {
      if (!birdAudio) return;
      const audioList = birdAudio[audioType];

      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current = null;
      }

      const randomIndex = (Math.random() * Math.min(audioList.length, 5)) | 0;
      const songSrc = audioList?.[randomIndex];

      if (songSrc) {
        const audio = new Audio(songSrc);
        currentAudioRef.current = audio;
        audio.currentTime = 4 + Math.random() * 4;
        audio
          .play()
          .then(() => {
            setTimeout(() => {
              audio.pause();
              if (currentAudioRef.current === audio) {
                currentAudioRef.current = null;
              }
            }, 3000);
          })
          .catch((error) => {
            console.error("Error playing audio", error);
          });
      }
    });
  };

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
      <Typography
        variant="h2"
        onClick={() => window.location.reload()}
        sx={{
          justifySelf: "center",
          cursor: "pointer",
        }}
      >
        Birbsquiz
        <Box
          component="span"
          sx={{
            marginLeft: "0.5rem",
            display: "inline-block",
            transition: "transform 0.1s ease",
            "&:hover": { transform: "scale(1.1)" },
          }}
        >
          {user ? "🦖" : birbEmoji}
        </Box>
      </Typography>

      <Box
        sx={{
          marginTop: "1rem",
          display: "grid",
          alignItems: "center",
          gap: "0.5rem",
          gridTemplateColumns: "1fr auto",
        }}
      >
        {(user || currentList === "Custom") && (
          <Autocomplete
            size="small"
            inputValue={birbInput}
            onInputChange={(e, v) => setBirbInput(v)}
            value={selectedBirbId}
            onChange={(e, v) => setSelectedBirbId(v!)}
            options={Object.keys(eBird).sort((a, b) =>
              eBird[a].comNameFr.localeCompare(eBird[b].comNameFr)
            )}
            getOptionLabel={(birbId) =>
              eBird[birbId] ? eBird[birbId].comNameFr : ""
            }
            freeSolo
            isOptionEqualToValue={(birbId, input) =>
              eBird[birbId].comNameFr === input
            }
            filterOptions={(options, { inputValue }) => {
              const normalize = (str: string) =>
                str
                  .normalize("NFD")
                  .replace(/[\u0300-\u036f]/g, "")
                  .replace(/['-]/g, ""); // ignore apostrophes and hyphens
              const searchTerms = normalize(inputValue)
                .toLowerCase()
                .split(" ")
                .filter((term) => term);
              return options.filter((option) => {
                const optionLabel = normalize(
                  eBird[option].comNameFr
                ).toLowerCase();
                return searchTerms.every((term) => optionLabel.includes(term));
              });
            }}
            renderInput={(params) => (
              <TextField {...params} label="Find brib ..." variant="outlined" />
            )}
            getOptionDisabled={(option) => selectedBirbIds.includes(option)}
          />
        )}
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
                sx={{
                  margin: "0.2rem",
                  cursor: "pointer",
                  transition: "transform 0.1s ease",
                  "&:hover": {},
                  "&:active": { transform: "scale(1.02)", boxShadow: 0 },
                }}
                key={`chip-${i}`}
                label={eBird[birbId].comNameFr}
                variant="outlined"
                onClick={() => playAudioForBirb(birbId, AudioType.SONG)}
                onDelete={() => deleteBirb(birbId)}
              />
            ))}
        </Box>
      </Box>

      <Box
        sx={{
          marginTop: "1rem",
        }}
      >
        <Box
          sx={{
            marginTop: "0.5rem",
            display: "grid",
            gap: "0.5rem",
            gridTemplateColumns:
              user || currentList === "Custom" ? "1fr 125px" : "1fr",
          }}
        >
          <FormControl fullWidth>
            <InputLabel id="demo-simple-select-label">List</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              label="Birb list"
              value={currentList}
              onChange={handleChange}
              size="small"
            >
              <MenuItem value="Custom">Custom</MenuItem>
              {dbListsData &&
                Object.entries(dbListsData).map(([key, value]) => {
                  return <MenuItem value={key}>{key}</MenuItem>;
                })}
            </Select>
          </FormControl>
          {(user || currentList === "Custom") && (
            <Button
              onClick={() => setSelectedBirbIds([])}
              color="error"
              variant="outlined"
            >
              Clear
            </Button>
          )}
        </Box>
      </Box>

      <Box>
        {user && (
          <Box
            sx={{
              marginTop: "0.5rem",
              display: "grid",
              gap: "0.5rem",
              gridTemplateColumns: "1fr 125px",
            }}
          >
            <TextField
              fullWidth
              label="Save current list as ..."
              variant="outlined"
              size="small"
              value={listName}
              onChange={(e) => setListName(e.target.value)}
            />
            <Button
              disabled={!listName || listName === "Custom"}
              onClick={saveBirbList}
              color={
                Object.keys(dbListsData).includes(listName)
                  ? "warning"
                  : "success"
              }
              variant="outlined"
            >
              {Object.keys(dbListsData).includes(listName)
                ? "Overwrite"
                : "Save As"}
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
            onClick={() => setOpenStartQuizDialog(true)}
            disabled={selectedBirbIds.length <= 0}
          >
            {`Quiz ${selectedBirbIds.length} birb${
              selectedBirbIds.length === 1 ? "" : "s"
            }`}
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

export default Lobby;
