import * as React from "react";
import Button from "@mui/material/Button";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import birbs from "./birbs.json";

function App() {
  const [selected, setSelected] = React.useState({});

  const fetchBirb = () => {
    fetch(
      "https://xeno-canto.org/api/2/recordings?query=cardinal%20rouge%20q:A"
    )
      .then((response) => response.json())
      .then((data) => console.log(data));
  };

  return (
    <div>
      <Autocomplete
        value={selected}
        onChange={(e, newValue) => setSelected(newValue)}
        freeSolo
        options={birbs.map((birb) => birb.french)}
        renderInput={(params) => <TextField {...params} label="Recherche" />}
      />
      {selected && (
        <Button variant="contained" onClick={fetchBirb}>
          {selected}
        </Button>
      )}
      {/* <audio controls src="https://xeno-canto.org/803537/download" autoPlay>
        Your browser does not support the
        <code>audio</code> element.
      </audio> */}
    </div>
  );
}

export default App;
