import styled from "@emotion/styled";
import { Chip } from "@mui/material";

const StyledChip = styled(Chip)({
  root: {
    width: "70%",
    position: "relative",
  },
  svg: {
    position: "absolute",
    right: 0,
  },
});

export default StyledChip;
