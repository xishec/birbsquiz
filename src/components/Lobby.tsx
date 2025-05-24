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
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import {
  Box,
  Button,
  FormControl,
  IconButton,
  InputLabel,
  Link,
  MenuItem,
  Select,
  SelectChangeEvent,
  Tooltip,
  Typography,
} from "@mui/material";
import StyledChip from "./StyledChip";
import LoginIcon from "@mui/icons-material/Login";
import LogoutIcon from "@mui/icons-material/Logout";
import { auth, database, signInWithGoogle } from "../firebaseDatabaseConfig";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { ref, set, get, remove } from "firebase/database";
import { QuizContext } from "../App";
// import { fetchAudioForOne } from "../tools/tools";
import { AudioType, FavoriteList, Region } from "../tools/constants";
import EndQuizDialog from "./Dialog/EndQuizDialog";
import StartQuizDialog from "./Dialog/StartQuizDialog";
import LocalizationDialog from "./Dialog/LocalizationDialog";
import PublishDialog from "./Dialog/PublishDialog";
import { arraysEqual, DB_LIST, DB_LISTS } from "../tools/tools";
import EditDialog from "./Dialog/EditDialog";
import { useConfirm } from "material-ui-confirm";

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
    setOpenPublishDialog,
    setOpenEditDialog,
    isMobileDevice,
  } = quizContext;

  const [birbInput, setBirbInput] = React.useState<string>("");
  const [selectedBirbId, setSelectedBirbId] = React.useState<string>("");
  const [user, setUser] = useState<User | null | undefined>();
  const [dbListsData, setDbListsData] = useState<DB_LISTS>({});
  const [isUserList, setIsUserList] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null); // add this ref

  // update custom list content when birbs change
  useEffect(() => {
    if (currentList === "Custom") {
      setCustomList(selectedBirbIds);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBirbIds]);

  // update isUserList when currentList or dbListsData or user change
  useEffect(() => {
    if (isAdmin) {
      setIsUserList(true);
    } else if (
      user?.uid !== undefined &&
      dbListsData[currentList]?.creator === user?.uid
    ) {
      setIsUserList(true);
    } else {
      setIsUserList(false);
    }
  }, [currentList, dbListsData, user, isAdmin]);

  // update birbs when currentList changes
  useEffect(() => {
    if (currentList === "Custom") {
      setSelectedBirbIds(customList ? customList : []);
    } else {
      if (dbListsData[currentList])
        setSelectedBirbIds(dbListsData[currentList].ids);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentList]);

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
        setUser(u);
        get(ref(database, `admin/${u.uid}`))
          .then((snapshot) => {
            if (snapshot.exists()) {
              setIsAdmin(true);
            }
          })
          .catch((error) => {
            console.error("Error verifying admin rights:", error);
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

  // const copyUrl = () => {
  //   const url = new URL(window.location.href);
  //   const encodedBirbs = btoa(JSON.stringify(selectedBirbIds));
  //   url.searchParams.set("birbs", encodedBirbs);
  //   navigator.clipboard.writeText(url.toString());
  //   url.searchParams.delete("birbs");
  //   setSnakeMessage(`Lien copié!`);
  //   setOpenSnake(true);
  // };

  useEffect(() => {
    if (selectedBirbId) addBirb(selectedBirbId);
  }, [selectedBirbId, addBirb]);

  // const currentAudioRef = useRef<HTMLAudioElement | null>(null);

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

  const saveBirbList = (newListName: string, user: User, favorite?: string) => {
    const listRef = ref(database, `v2/lists/${newListName}`);
    set(listRef, {
      name: newListName,
      creator: user.uid,
      ids: selectedBirbIds,
      region: region,
      ...(favorite !== undefined ? { favorite } : {}),
    } as DB_LIST)
      .then(() => {
        loadBirbList();
      })
      .catch((error) => {
        console.error("Error saving birb list:", error);
      });
  };

  const deleteBirbList = (listName: string) => {
    const listRef = ref(database, `v2/lists/${listName}`);
    remove(listRef)
      .then(() => {
        loadBirbList();
      })
      .catch((error) => {
        console.error("Error saving birb list:", error);
      });
  };

  const confirm = useConfirm();
  const confirmAction = async (
    title: string,
    description: string,
    action: () => void
  ) => {
    const { confirmed } = await confirm({
      title: title,
      description: description,
      confirmationText: "Confirm",
    });

    if (confirmed) {
      action();
    }
  };

  return (
    <Box>
      <EndQuizDialog />
      <StartQuizDialog />
      <LocalizationDialog />
      <PublishDialog
        isAdmin={isAdmin}
        dbListsData={dbListsData}
        setCurrentList={setCurrentList}
        saveBirbList={(listName: string, favorite: string) =>
          saveBirbList(listName, user!, favorite)
        }
      />
      <EditDialog
        isAdmin={isAdmin}
        currentList={currentList}
        dbListsData={dbListsData}
        setCurrentList={setCurrentList}
        saveBirbList={(listName: string, favorite: string) =>
          saveBirbList(listName, user!, favorite)
        }
        deleteBirbList={deleteBirbList}
      />

      <Box
        sx={{
          overflow: "auto",
          display: "grid",
          height: css_height_90,
          minHeight: 0,
          gridTemplateColumns: "1fr",
          gridTemplateRows: "auto auto 1fr auto",
          gap: "0.5rem",
          marginTop: "1rem",
        }}
      >
        {/* <Box
          sx={{
            position: "absolute",
            top: "0rem",
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
        </Box> */}

        {/* title */}
        <Box
          sx={{
            margin: "0.25rem 1.5rem",
            display: "grid",
            alignItems: "center",
            gridTemplateColumns: "auto auto",
          }}
        >
          <Typography
            onClick={() => window.location.reload()}
            sx={{
              fontSize: isMobileDevice ? "1.75rem" : "3rem",
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
              {isAdmin ? "🦖" : birbEmoji}
            </Box>
          </Typography>

          <Box
            sx={{
              justifySelf: "end",
              display: "grid",
              gridTemplateColumns: "auto auto",
              alignItems: "center",
            }}
          >
            {user && (
              <Tooltip
                placement="left"
                enterDelay={0}
                leaveDelay={0}
                enterTouchDelay={0}
                leaveTouchDelay={0}
                title={user ? user.email : "Login to save your lists :)"}
                sx={{ justifySelf: "end", marginBottom: "0.05rem" }}
              >
                <IconButton>
                  <InfoOutlinedIcon color="primary" fontSize="small" />
                </IconButton>
              </Tooltip>
            )}

            {!user && (
              <Button
                variant="text"
                onClick={signInWithGoogle}
                endIcon={<LoginIcon />}
                size="small"
              >
                Login
              </Button>
            )}
            {user && (
              <Button
                variant="text"
                onClick={() => signOut(auth)}
                endIcon={<LogoutIcon />}
                size="small"
              >
                Logout
              </Button>
            )}
          </Box>
        </Box>

        {/* autocomplete */}
        <Box
          sx={{
            margin: "0 1.5rem",
            display: "grid",
            gridTemplateColumns: "auto 1fr",
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
                inputRef={inputRef} // pass the ref here
                label={
                  !user && currentList !== "Custom"
                    ? "Disabled (not your list)"
                    : `Find birbs ${
                        region === Region.EARTH ? "on" : "in"
                      } ${region}...`
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
                    color={
                      regionList[region].includes(birbId)
                        ? "default"
                        : "warning"
                    }
                    key={`chip-${i}`}
                    label={`${eBird[birbId][eBirdNameProperty]} 
                      ${
                        regionList[region].includes(birbId)
                          ? ""
                          : `(not found in ${region})`
                      }`}
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
            onClick={() => inputRef.current?.focus()} // add onClick handler here
            sx={{
              margin: "0 1.5rem",
              height: "100%",
              border: "1px solid #ccc",
              borderRadius: "4px",
              display: "grid",
              justifyContent: "center",
              alignItems: "center",
              cursor: "pointer", // indicate it's clickable
            }}
          >
            <IconButton size="large">
              <AddIcon sx={{ color: "#ccc" }} />
            </IconButton>
          </Box>
        )}

        {/* DB List */}
        {true && (
          <Box
            sx={{
              margin: "0 1.5rem",
              marginTop: "0.5rem",
              display: "grid",
              gap: "0.5rem",
              gridTemplateColumns: "1fr",
            }}
          >
            <Box>
              <FormControl fullWidth>
                <InputLabel>List</InputLabel>
                <Select
                  label="List"
                  value={currentList}
                  onChange={(event: SelectChangeEvent) => {
                    const key = event.target.value;
                    setCurrentList(key);
                  }}
                  size="small"
                >
                  <MenuItem value="Custom">Custom</MenuItem>
                  {dbListsData &&
                    Object.entries(dbListsData)
                      .filter(
                        ([key, value]) =>
                          value.favorite === FavoriteList.FAVORITE
                      )
                      .map(([key, value]) => {
                        return <MenuItem value={key}>⭐️ {key}</MenuItem>;
                      })}
                  {dbListsData &&
                    Object.entries(dbListsData)
                      .filter(
                        ([key, value]) =>
                          value.favorite !== FavoriteList.FAVORITE &&
                          value.creator === user?.uid
                      )
                      .map(([key, value]) => {
                        return <MenuItem value={key}>✏️ {key}</MenuItem>;
                      })}
                  {dbListsData &&
                    Object.entries(dbListsData)
                      .filter(
                        ([key, value]) =>
                          value.favorite !== FavoriteList.FAVORITE &&
                          value.creator !== user?.uid
                      )
                      .map(([key, value]) => {
                        return <MenuItem value={key}>{key}</MenuItem>;
                      })}
                </Select>
              </FormControl>
            </Box>

            {currentList === "Custom" && (
              <Box
                sx={{
                  display: "grid",
                  gap: "0.5rem",
                  gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                }}
              >
                <Button
                  sx={{ height: "40px" }}
                  onClick={() =>
                    confirmAction(
                      "Clear Custom list",
                      "Are you sure you want to clear your Custom list?",
                      () => {
                        setSelectedBirbIds([]);
                      }
                    )
                  }
                  color="error"
                  variant="outlined"
                >
                  Clear
                </Button>
                {user && (
                  <Button
                    disabled={selectedBirbIds.length <= 0}
                    sx={{ height: "40px" }}
                    onClick={() => {
                      setOpenPublishDialog(true);
                    }}
                    color="primary"
                    variant="outlined"
                  >
                    Create
                  </Button>
                )}
              </Box>
            )}

            {currentList !== "Custom" && (
              <Box
                sx={{
                  display: "grid",
                  gap: "0.5rem",
                  gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                }}
              >
                <Button
                  sx={{ height: "40px" }}
                  onClick={() =>
                    confirmAction(
                      "Copy to Custom list",
                      "This might overwrite your current Custom list, make sure to save your birbs",
                      () => {
                        setCurrentList("Custom");
                        setCustomList(selectedBirbIds);
                      }
                    )
                  }
                  color="primary"
                  variant="outlined"
                >
                  Copy to Custom
                </Button>

                {isUserList && (
                  <Button
                    sx={{ height: "40px" }}
                    onClick={() => setOpenEditDialog(true)}
                    color="primary"
                    variant="outlined"
                  >
                    Edit
                  </Button>
                )}
              </Box>
            )}

            {currentList !== "Custom" &&
              isUserList &&
              !arraysEqual(selectedBirbIds, dbListsData[currentList]?.ids) && (
                <Box
                  sx={{
                    display: "grid",
                    gap: "0.5rem",
                    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                  }}
                >
                  <Button
                    sx={{ height: "40px" }}
                    onClick={() =>
                      confirmAction(
                        "Reset unsaved changes",
                        `Are you sure you want to reset your unsaved changes?`,
                        () => {
                          setSelectedBirbIds(dbListsData[currentList]?.ids!);
                        }
                      )
                    }
                    color="warning"
                    variant="outlined"
                  >
                    Reset changes
                  </Button>

                  <Button
                    sx={{ height: "40px" }}
                    onClick={() =>
                      confirmAction(
                        "Save birbs to list",
                        `Are you sure you want to update your list?`,
                        () => {
                          saveBirbList(currentList, user!);
                        }
                      )
                    }
                    color="success"
                    variant="outlined"
                  >
                    Save changes
                  </Button>
                </Box>
              )}
          </Box>
        )}

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
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default Lobby;
