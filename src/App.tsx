import React from "react";
import Button from "@mui/material/Button";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import rawBirbs from "./birbs.json";

function App() {
  const [selectedBirbName, setSelectedBirbName] = React.useState<
    string | null
  >();
  const [audioSources, setAudioSources] = React.useState<Array<string>>();
  let birbs = rawBirbs as any;

  const fetchBirb = () => {
    const latinName = birbs[selectedBirbName!] as string;
    fetch(
      `https://xeno-canto.org/api/2/recordings?query=${latinName
        .replace(" ", "%20")
        .toLowerCase()}%20q:A`
    )
      .then((response) => response.json())
      .then((data) => {
        if (data.recordings.length > 0) {
          console.log(
            data.recordings.splice(0, 3).map((recording: any) => recording.file)
          );
          setAudioSources(
            data.recordings.splice(0, 3).map((recording: any) => recording.file)
          );
        }
      });
  };
  return (
    <div>
      <Autocomplete
        value={selectedBirbName}
        onChange={(e, name) => setSelectedBirbName(name)}
        freeSolo
        options={Object.keys(birbs)}
        renderInput={(params) => <TextField {...params} label="Recherche" />}
      />
      {selectedBirbName && (
        <Button variant="contained" onClick={fetchBirb}>
          {selectedBirbName}
        </Button>
      )}
      {audioSources?.map((audioSource: string) => (
        <audio controls src={audioSource}>
          Your browser does not support the
          <code>audio</code> element.
        </audio>
      ))}
    </div>
  );
}

export default App;
