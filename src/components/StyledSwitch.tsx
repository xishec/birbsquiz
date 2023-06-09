import { Switch } from "@mui/material";
import styled from "@emotion/styled";

const StyledSwitch = styled(Switch)({
  colorSecondary: {
    "&.Mui-checked + .MuiSwitch-track": {
      backgroundColor: "purple",
    },
  },
  track: {
    backgroundColor: "blue",
  },
});

export default StyledSwitch;
