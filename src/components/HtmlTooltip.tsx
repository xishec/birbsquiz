import { Tooltip, TooltipProps, styled, tooltipClasses } from "@mui/material";

const HtmlTooltip = styled(
  ({ className, PopperProps, ...props }: TooltipProps) => {
    const defaultPopperProps = {
      modifiers: [
        {
          name: "offset",
          options: {
            // Adjust the offset here. [x, y] = [horizontal, vertical]
            // Here we use [0, 0] to bring it closer to the pointer.
            offset: [0, -15],
          },
        },
      ],
    };

    return (
      <Tooltip
        placement="bottom"
        {...props}
        PopperProps={{
          ...defaultPopperProps,
          ...PopperProps,
          // Merge custom modifiers if any
          modifiers: [
            ...defaultPopperProps.modifiers,
            ...(PopperProps?.modifiers || []),
          ],
        }}
        classes={{ popper: className }}
      />
    );
  }
)(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    maxWidth: "50vw",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    color: "rgb(250, 250, 250)",
    fontSize: theme.typography.pxToRem(12),
  },
}));

export default HtmlTooltip;