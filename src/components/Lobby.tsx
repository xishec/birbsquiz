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
import { auth, database, signInWithGoogle } from "../firebaseDatabaseConfig";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { ref, set, get, remove } from "firebase/database";
import { QuizContext } from "../App";
// import { fetchAudioForOne } from "../tools/tools";
import { AudioType, CUSTOM, DBRegion, FavoriteList } from "../tools/constants";
import EndQuizDialog from "./Dialog/EndQuizDialog";
import StartQuizDialog from "./Dialog/StartQuizDialog";
import LocalizationDialog from "./Dialog/LocalizationDialog";
import PublishDialog from "./Dialog/PublishDialog";
import { arraysEqual, DB_LIST, DB_LISTS } from "../tools/tools";
import EditDialog from "./Dialog/EditDialog";
import { useConfirm } from "material-ui-confirm";
import LearnDialog from "./Dialog/LearnDialog";

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
    openLearnDialog,
    setOpenLearnDialog,
    currentTranslation: t,
  } = quizContext;

  const [birbInput, setBirbInput] = React.useState<string>("");
  const [learnBirbId, setLearnBirbId] = React.useState<string>("");
  const [user, setUser] = useState<User | null | undefined>();
  const [dbListsData, setDBListsData] = useState<DB_LISTS>({});
  const [isUserList, setIsUserList] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null); // add this ref
  const listboxRef = useRef<HTMLUListElement>(null);
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    if (listboxRef.current) {
      listboxRef.current.scrollTop = scrollPosition;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBirbIds]);

  // update custom list content when birbs change
  useEffect(() => {
    if (currentList === CUSTOM) {
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
    if (currentList === CUSTOM) {
      setSelectedBirbIds(customList ? customList : []);
    } else {
      if (dbListsData[currentList])
        setSelectedBirbIds(dbListsData[currentList].ids);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentList]);

  // if loaded and list invalid, set to Custom
  useEffect(() => {
    if (!dbListsData || Object.keys(dbListsData).length === 0) return;
    if (currentList !== CUSTOM && !dbListsData[currentList]) {
      console.log(`List "${currentList}" not found in DB, setting to Custom`);
      setCurrentList(CUSTOM);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dbListsData]);

  const loadBirbList = useCallback(() => {
    // remove(ref(database, `v2/birbs`))

    const listRef = ref(database, `v2/lists`);
    get(listRef)
      .then((snapshot) => {
        let data: DB_LISTS = snapshot.val();
        if (!data) {
          data = {};
          set(listRef, data)
            .then(() =>
              console.log("Created v2/lists because it did not exist")
            )
            .catch((error) => console.error("Error creating v2/lists:", error));
        }
        setDBListsData(data);
      })
      .catch((error) => {
        console.error("Error reading birb list:", error);
        setSnakeMessage(error.message);
        setOpenSnake(true);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadBirbList();
  }, [loadBirbList]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      if (u) {
        setUser(u);
        if (!sessionStorage.getItem("greeted")) {
          setSnakeMessage(`Hello ${u.email}, welcome to Birbsquiz!`);
          setOpenSnake(true);
          sessionStorage.setItem("greeted", "true");
        }
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
        setIsAdmin(false);
        sessionStorage.removeItem("greeted");
      }
    });
    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addBirb = useCallback(
    (birbId: string) => {
      if (eBird[birbId] && !selectedBirbIds.find((id) => id === birbId)) {
        setSelectedBirbIds([...selectedBirbIds, birbId]);
      }
    },
    [eBird, selectedBirbIds, setSelectedBirbIds]
  );

  const deleteBirb = useCallback(
    (birbId: string) => {
      // console.log("Deleting birb:", birbId);
      const newSelectedBirbIds = selectedBirbIds?.filter((id) => id !== birbId);
      setSelectedBirbIds(newSelectedBirbIds!);
    },
    [selectedBirbIds, setSelectedBirbIds]
  );

  const saveBirbList = (
    newListName: string,
    userId: string,
    favorite?: string
  ) => {
    const listRef = ref(database, `v2/lists/${newListName}`);
    set(listRef, {
      name: newListName,
      creator: userId,
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

  React.useEffect(() => {
    if (!openLearnDialog) {
      setLearnBirbId("");
    }
  }, [openLearnDialog]);

  return (
    <Box>
      <EndQuizDialog />
      <StartQuizDialog />
      <LocalizationDialog />
      <LearnDialog birbId={learnBirbId} />
      <PublishDialog
        isAdmin={isAdmin}
        dbListsData={dbListsData}
        setCurrentList={setCurrentList}
        saveBirbList={(listName: string, favorite: string) =>
          saveBirbList(listName, user!.uid, favorite)
        }
      />
      <EditDialog
        isAdmin={isAdmin}
        currentList={currentList}
        dbListsData={dbListsData}
        setCurrentList={setCurrentList}
        saveBirbList={(newListName: string, favorite?: string) =>
          saveBirbList(newListName, dbListsData[currentList].creator, favorite)
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
          gap: "1rem",
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
            margin: "0rem 1.5rem",
            display: "grid",
            alignItems: "center",
            gridTemplateColumns: "auto auto",
          }}
        >
          <Typography
            onClick={() => window.location.reload()}
            variant="h5"
            component="span"
            sx={{
              fontSize: isMobileDevice ? "2rem" : "3rem",
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
              gridTemplateColumns: "auto",
              alignItems: "center",
            }}
          >
            {!user && (
              <Button
                variant="outlined"
                onClick={signInWithGoogle}
                size="small"
              >
                {t.Login}
              </Button>
            )}
            {user && (
              <Button
                variant="outlined"
                onClick={() => signOut(auth)}
                size="small"
              >
                {t.Logout}
              </Button>
            )}
          </Box>
        </Box>

        {/* autocomplete */}
        <Box
          sx={{
            margin: "0 1.5rem",
            display: "grid",
            gridTemplateColumns: "auto 1fr auto",
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
            autoHighlight
            disableCloseOnSelect
            disabled={!user && currentList !== CUSTOM}
            size="small"
            inputValue={birbInput}
            onInputChange={(e, v) => {
              // console.log(e, v);
              if (e?.type === "change" || v === "") {
                setBirbInput(v);
              }
            }}
            onChange={(e, v) => {
              addBirb(v!);
            }}
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
            ListboxProps={{
              ref: listboxRef,
              onScroll: (event: React.UIEvent<HTMLUListElement>) => {
                setScrollPosition(event.currentTarget.scrollTop);
              },
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                inputRef={inputRef}
                label={
                  !user && currentList !== CUSTOM
                    ? t.NotYourList
                    : `${t.FindBirbs} ${
                        region === DBRegion.EARTH ? t.On : t.In
                      } ${t[region]}...`
                }
                variant="outlined"
              />
            )}
            renderOption={(props, option) => (
              <li
                {...props}
                id={option}
                style={{
                  width: "100%",
                  display: "grid",
                  gridTemplateColumns: "1fr auto",
                  cursor: selectedBirbIds.includes(option)
                    ? "default"
                    : "pointer",
                }}
              >
                <span
                  style={{
                    color: selectedBirbIds.includes(option) ? "#aaa" : "#000",
                  }}
                >
                  {eBird[option][eBirdNameProperty]}
                </span>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={(event) => {
                    event.stopPropagation();
                    // console.log("Button clicked for:", option);
                    setLearnBirbId(option);
                    setOpenLearnDialog(true);
                  }}
                >
                  {t.Learn}
                </Button>
              </li>
            )}
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
                <Box
                  key={`chip-${birbId}`}
                  sx={{ height: "100%", width: "100%" }}
                >
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
                    onClick={() => {
                      setOpenLearnDialog(true);
                      setLearnBirbId(birbId);
                    }}
                    onDelete={
                      currentList === CUSTOM || isUserList
                        ? () => deleteBirb(birbId)
                        : undefined
                    }
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
            <IconButton size="large" color="primary">
              <AddIcon />
            </IconButton>
          </Box>
        )}

        {/* Buttons */}
        <Box
          sx={{
            margin: "0 1.5rem",
            marginTop: "0.5rem",
            display: "grid",
            gap: "0.5rem",
            gridTemplateColumns: "1fr",
          }}
        >
          {/* Dropdown list */}
          <Box>
            <FormControl fullWidth>
              <InputLabel>List</InputLabel>
              <Select
                label={t.List}
                value={
                  [CUSTOM, ...Object.keys(dbListsData)].includes(currentList)
                    ? currentList
                    : CUSTOM
                }
                onChange={(event: SelectChangeEvent) => {
                  const key = event.target.value;
                  console.log("Setting current list to:", key);
                  setCurrentList(key);
                }}
                size="small"
              >
                <MenuItem key={CUSTOM} value={CUSTOM}>
                  t.Custom
                </MenuItem>
                {dbListsData &&
                  Object.entries(dbListsData)
                    .filter(
                      ([key, value]) => value.favorite === FavoriteList.FAVORITE
                    )
                    .map(([key, value]) => (
                      <MenuItem key={key} value={key}>
                        <span
                          role="img"
                          aria-label="favorite"
                          style={{ marginRight: "0.5rem" }}
                        >
                          ⭐️
                        </span>
                        {key}
                      </MenuItem>
                    ))}
                {dbListsData &&
                  Object.entries(dbListsData)
                    .filter(
                      ([key, value]) =>
                        value.favorite !== FavoriteList.FAVORITE &&
                        value.creator === user?.uid
                    )
                    .map(([key, value]) => (
                      <MenuItem key={key} value={key}>
                        <span
                          role="img"
                          aria-label="edit"
                          style={{ marginRight: "0.5rem" }}
                        >
                          ✏️
                        </span>
                        {key}
                      </MenuItem>
                    ))}
                {dbListsData &&
                  Object.entries(dbListsData)
                    .filter(
                      ([key, value]) =>
                        value.favorite !== FavoriteList.FAVORITE &&
                        value.creator !== user?.uid
                    )
                    .map(([key, value]) => (
                      <MenuItem key={key} value={key}>
                        {key}
                      </MenuItem>
                    ))}
              </Select>
            </FormControl>
          </Box>

          {/* Clear and create */}
          {currentList === CUSTOM && (
            <Box
              sx={{
                display: "grid",
                gap: "0.5rem",
                gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
              }}
            >
              <Button
                sx={{ height: "40px" }}
                disabled={selectedBirbIds.length <= 0}
                onClick={() =>
                  confirmAction(t.ClearTile, t.ClearConfirm, () => {
                    setSelectedBirbIds([]);
                  })
                }
                color="error"
                variant="outlined"
              >
                {t.Clear}
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
                  {t.Create}
                </Button>
              )}
            </Box>
          )}

          {/* Copy and edit */}
          {currentList !== CUSTOM && (
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
                  confirmAction(t.CopyTile, t.CopyConfirm, () => {
                    setCurrentList(CUSTOM);
                    setCustomList(selectedBirbIds);
                  })
                }
                color="primary"
                variant="outlined"
              >
                {t.Copy}
              </Button>

              {isUserList && (
                <Button
                  sx={{ height: "40px" }}
                  onClick={() => setOpenEditDialog(true)}
                  color="primary"
                  variant="outlined"
                >
                  {t.Edit}
                </Button>
              )}
            </Box>
          )}

          {/* Reset and save */}
          {currentList !== CUSTOM &&
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
                    confirmAction(t.ResetTile, t.ResetConfirm, () => {
                      setSelectedBirbIds(dbListsData[currentList]?.ids!);
                    })
                  }
                  color="warning"
                  variant="outlined"
                >
                  {t.Reset}
                </Button>

                <Button
                  sx={{ height: "40px" }}
                  onClick={() =>
                    confirmAction(t.SaveTile, t.SaveConfirm, () => {
                      saveBirbList(
                        currentList,
                        dbListsData[currentList].creator
                      );
                    })
                  }
                  color="success"
                  variant="outlined"
                >
                  {t.Save}
                </Button>
              </Box>
            )}

          {/* Quiz button */}
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
    </Box>
  );
}

export default Lobby;
