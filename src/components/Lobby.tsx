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
  Paper,
  Select,
  SelectChangeEvent,
  Typography,
} from "@mui/material";
import StyledChip from "./StyledChip";
import LoginIcon from "@mui/icons-material/Login";
import LogoutIcon from "@mui/icons-material/Logout";
import MenuIcon from "@mui/icons-material/Menu";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { auth, database, signInWithGoogle } from "../firebaseDatabaseConfig";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { ref, set, get } from "firebase/database";
import { QuizContext } from "../App";
import { fetchAudioForOne } from "../tools/tools";
import { AudioType, Language } from "../tools/constants";

function Lobby() {
  const quizContext = useContext(QuizContext);
  if (!quizContext) {
    throw new Error("Must be used within a QuizContext.Provider");
  }
  const {
    eBird,
    regionList,
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
    language,
    setLanguage,
    eBirdNameProperty,
    region,
    setRegion,
  } = quizContext;

  const [birbInput, setBirbInput] = React.useState<string>("");
  const [selectedBirbId, setSelectedBirbId] = React.useState<string>("");
  const [user, setUser] = useState<any>(null);
  const [shareClickCount, setShareClickCount] = useState<number>(0);
  const [listName, setListName] = useState(currentList);
  const [dbListsData, setDbListsData] = useState<any>({});

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
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      if (u) {
        get(ref(database, `admin/${u.uid}`))
          .then((snapshot) => {
            if (snapshot.exists()) {
              console.log("User is an admin");
              setUser(u);
              setShareClickCount(5);
            } else {
              console.log("User is not an admin");
              setUser(null);
            }
          })
          .catch((error) => {
            console.error("Error verifying admin rights:", error);
            setUser(null);
          });
      } else {
        setUser(null);
      }
    });
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
    fetchAudioForOne(birbId, region).then((birdAudio) => {
      if (!birdAudio) return;
      const audioList = birdAudio[audioType];

      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current = null;
      }

      const randomIndex = (Math.random() * Math.min(audioList.length, 5)) | 0;
      const urlWithMetadata = audioList?.[randomIndex];

      if (urlWithMetadata!.url) {
        const audio = new Audio(urlWithMetadata.url);
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

  const [notScrolledToBottom, setNotScrolledToBottom] = useState(false);
  const styledChipPaperRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = styledChipPaperRef.current;
    if (!el) return;
    const handleScroll = () => {
      if (el.scrollTop + el.clientHeight < el.scrollHeight) {
        setNotScrolledToBottom(true);
      } else {
        setNotScrolledToBottom(false);
      }
    };
    el.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <Box
      sx={{
        overflow: "auto",
        display: "grid",
        height: css_height_90,
        minHeight: 0,
        gridTemplateRows: "auto auto 1fr auto auto",
        gap: "1rem",
      }}
    >
      {/* title */}
      <Box
        sx={{
          display: "grid",
          alignItems: "center",
          gridTemplateColumns: "auto auto",
        }}
      >
        <Typography
          variant="h4"
          onClick={() => window.location.reload()}
          sx={{
            justifySelf: "start",
            cursor: "pointer",
          }}
        >
          Work in progress...
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
            justifySelf: "end",
            display: "grid",
            gridTemplateColumns: "auto auto",
          }}
        >
          <Box sx={{ justifySelf: "end" }}>
            <IconButton color="primary">
              <MoreVertIcon />
            </IconButton>
          </Box>

          {!user && (
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
      </Box>

      {/* region and language */}
      <Box
        sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}
      >
        <FormControl fullWidth>
          <InputLabel>Region</InputLabel>
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
                  return (
                    <MenuItem key={key} value={key}>
                      {key}
                    </MenuItem>
                  );
                })}
          </Select>
        </FormControl>
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

      {/* autocomplete */}
      <Box>
        <Box
          sx={{
            display: "grid",
            alignItems: "center",
            gap: "0.5rem",
            gridTemplateColumns: "1fr",
          }}
        >
          <Autocomplete
            disabled={user || currentList !== "Custom"}
            size="small"
            inputValue={birbInput}
            onInputChange={(e, v) => setBirbInput(v)}
            value={selectedBirbId}
            onChange={(e, v) => setSelectedBirbId(v!)}
            options={regionList[region].sort((a, b) =>
              eBird[a][eBirdNameProperty].localeCompare(
                eBird[b][eBirdNameProperty]
              )
            )}
            getOptionLabel={(birbId) =>
              eBird[birbId] ? eBird[birbId][eBirdNameProperty] : ""
            }
            freeSolo
            isOptionEqualToValue={(birbId, input) =>
              eBird[birbId][eBirdNameProperty] === input
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
                  eBird[option][eBirdNameProperty]
                ).toLowerCase();
                return searchTerms.every((term) => optionLabel.includes(term));
              });
            }}
            renderInput={(params) => (
              <TextField {...params} label="Find brib ..." variant="outlined" />
            )}
            getOptionDisabled={(option) => selectedBirbIds.includes(option)}
          />
        </Box>
      </Box>

      {/* StyledChip */}
      <Paper
        sx={{
          overflow: "auto",
          margin: "0.1rem",
          display: "grid",
          gap: "0.5rem",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          padding: "0.5rem",
        }}
        elevation={1}
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
              label={eBird[birbId][eBirdNameProperty]}
              variant="outlined"
              onClick={() => playAudioForBirb(birbId, AudioType.SONG)}
              onDelete={() => deleteBirb(birbId)}
            />
          ))}
        {notScrolledToBottom && (
          <Box
            sx={{
              position: "absolute",
              bottom: "4px",
              right: "4px",
              background: "rgba(0,0,0,0.5)",
              color: "white",
              px: 1,
              py: 0.5,
              borderRadius: "4px",
              fontSize: "0.8rem",
            }}
          >
            Scroll for more...
          </Box>
        )}
      </Paper>

      {/* DB List */}
      <Box sx={{}}>
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
            <InputLabel>List</InputLabel>
            <Select
              label="List"
              value={currentList}
              onChange={(event: SelectChangeEvent) => {
                const key = event.target.value;
                if (key === "Custom") {
                  setSelectedBirbIds(customList ? customList : []);
                } else {
                  setSelectedBirbIds(dbListsData[key]);
                }
                setCurrentList(key);
              }}
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
          {/* {shareClickCount < 5 && (
            <IconButton
              color="primary"
              onClick={copyUrl}
              disabled={selectedBirbIds.length <= 0}
            >
              <ShareIcon />
            </IconButton>
          )} */}
        </Box>
      </Box>

      {/* admin Save list */}
      {/* <Box>
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
      </Box> */}

      {/* Language and Quiz button */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "1fr",
        }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr",
            // gap: "0.5rem",
          }}
        >
          <Button
            variant="contained"
            onClick={() => setOpenStartQuizDialog(true)}
            disabled={selectedBirbIds.length <= 0}
          >
            {`Quiz ${selectedBirbIds.length} birb${
              selectedBirbIds.length === 1 ? "" : "s"
            }`}
          </Button>

          {/* {shareClickCount >= 5 && (
            <Box>
              {!user && (
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
          )} */}
        </Box>
      </Box>
    </Box>
  );
}

export default Lobby;
