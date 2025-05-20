import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import AddIcon from "@mui/icons-material/Add";
import LanguageIcon from "@mui/icons-material/Language";
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
// import { fetchAudioForOne } from "../tools/tools";
import { AudioType } from "../tools/constants";

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
    eBirdNameProperty,
    region,
    setOpenLocalizationDialog,
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
    // fetchAudioForOne(birbId, region).then((birdAudio) => {
    //   if (!birdAudio) return;
    //   const audioList = birdAudio[audioType];
    //   if (currentAudioRef.current) {
    //     currentAudioRef.current.pause();
    //     currentAudioRef.current = null;
    //   }
    //   const randomIndex = (Math.random() * Math.min(audioList.length, 5)) | 0;
    //   const urlWithMetadata = audioList?.[randomIndex];
    //   if (urlWithMetadata!.url) {
    //     const audio = new Audio(urlWithMetadata.url);
    //     currentAudioRef.current = audio;
    //     audio.currentTime = 4 + Math.random() * 4;
    //     audio
    //       .play()
    //       .then(() => {
    //         setTimeout(() => {
    //           audio.pause();
    //           if (currentAudioRef.current === audio) {
    //             currentAudioRef.current = null;
    //           }
    //         }, 3000);
    //       })
    //       .catch((error) => {
    //         console.error("Error playing audio", error);
    //       });
    //   }
    // });
  };

  return (
    <Box
      sx={{
        overflow: "auto",
        display: "grid",
        height: css_height_90,
        minHeight: 0,
        gridTemplateColumns: "1fr",
        gridTemplateRows: "auto auto 1fr auto",
        gap: "1rem",
        marginTop: "1.5rem",
      }}
    >
      <Box
        sx={{
          width: "100%",
          position: "absolute",
          top: "0.1rem",
        }}
      >
        <Typography
          sx={{
            fontSize: "1rem",
            fontWeight: "200",
          }}
        >
          Work in progress, not stable yet!
        </Typography>
      </Box>

      {/* title */}
      <Box
        sx={{
          margin: "0 1.5rem",
          display: "grid",
          alignItems: "center",
          gridTemplateColumns: "auto auto",
        }}
      >
        <Typography
          onClick={() => window.location.reload()}
          sx={{
            fontSize: "2.5rem",
            fontWeight: "200",
            justifySelf: "start",
            cursor: "pointer",
          }}
        >
          Birbsquiz
          <Box
            component="span"
            sx={{
              marginLeft: "1rem",
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
            <IconButton
              color="primary"
              onClick={() => setOpenLocalizationDialog(true)}
            >
              <LanguageIcon />
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
      {/* <Box
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
      </Box> */}

      {/* autocomplete */}
      <Box sx={{ margin: "0 1.5rem" }}>
        <Autocomplete
          disabled={!user && currentList !== "Custom"}
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
            <TextField
              {...params}
              label={
                !user && currentList !== "Custom"
                  ? "Disabled"
                  : `Find bribs ${region === "EARTH" ? "on" : "in"} ${region}}`
              }
              variant="outlined"
            />
          )}
          getOptionDisabled={(option) => selectedBirbIds.includes(option)}
        />
      </Box>

      {/* StyledChip */}
      {selectedBirbIds.length > 0 && (
        <Box
          sx={{
            marginTop: "0.25rem",
            display: "grid",
            gridAutoFlow: "column",
            gridTemplateRows: "repeat(auto-fill, minmax(40px, auto))",
            gridAutoColumns: "calc(100% - 0rem)",
            height: "100%",
            overflowX: "auto",
            overflowY: "hidden",
            gap: "0.5rem",
            position: "relative",
            padding: "0 1.5rem",
          }}
        >
          {selectedBirbIds.length > 0 &&
            selectedBirbIds.map((birbId, i) => (
              <Box sx={{ height: "100%", width: "100%" }}>
                <StyledChip
                  sx={{
                    width: "100%",
                    height: "40px",
                    cursor: "pointer",
                    transition: "transform 0.1s ease",
                    "&:hover": {},
                    "&:active": { transform: "scale(1.02)", boxShadow: 0 },
                    borderRadius: "100px",
                  }}
                  key={`chip-${i}`}
                  label={eBird[birbId][eBirdNameProperty]}
                  variant="outlined"
                  onClick={() => playAudioForBirb(birbId, AudioType.SONG)}
                  onDelete={() => deleteBirb(birbId)}
                />
              </Box>
            ))}
        </Box>
      )}
      {selectedBirbIds.length === 0 && (
        <Box
          sx={{
            margin: "0 1.5rem",
            height: "100%",
            border: "1px solid #ccc",
            borderRadius: "4px",
            display: "grid",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <IconButton size="large" disabled>
            <AddIcon sx={{ color: "#ccc" }} />
          </IconButton>
        </Box>
      )}

      {/* DB List */}
      <Box
        sx={{
          margin: "0 1.5rem",
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
            sx={{ height: "40px" }}
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
          margin: "0 1.5rem",
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
            sx={{ height: "40px" }}
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
