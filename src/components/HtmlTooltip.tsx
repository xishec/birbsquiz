import { Tooltip, TooltipProps, styled, tooltipClasses } from "@mui/material";

const HtmlTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip placement="left" {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    maxWidth: "50vw",
    backgroundColor: "rgb(237, 237, 237)",
    color: "rgb(0, 0, 0)",
    fontSize: theme.typography.pxToRem(12),
  },
}));

export default HtmlTooltip;
