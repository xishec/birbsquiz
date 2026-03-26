import * as React from "react";
import { Box, Typography } from "@mui/material";
import { DBRegion, EBirdNameProperty } from "../tools/constants";

type BirbNamesProps = {
  bottomContent?: React.ReactNode;
  commonName: string;
  commonNameFr: string;
  currentNameProperty: EBirdNameProperty;
  isBirbInRegion: boolean;
  region: DBRegion;
  regionLabel: string;
  scientificName: string;
};

function BirbNames({
  bottomContent,
  commonName,
  commonNameFr,
  currentNameProperty,
  isBirbInRegion,
  region,
  regionLabel,
  scientificName,
}: BirbNamesProps) {
  const namesByProperty = {
    [EBirdNameProperty.COMMON_NAME]: {
      label: "English",
      value: commonName,
    },
    [EBirdNameProperty.COMMON_NAME_FR]: {
      label: "French",
      value: commonNameFr,
    },
    [EBirdNameProperty.SCIENTIFIC_NAME]: {
      label: "Latin",
      value: scientificName,
    },
  };
  const primaryName = namesByProperty[currentNameProperty];
  const secondaryNames = Object.entries(namesByProperty).filter(
    ([property]) => property !== currentNameProperty,
  );

  return (
    <>
      <Typography
        sx={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          columnGap: "2rem",
          alignItems: "start",
        }}
      >
        <Typography
          component="span"
          sx={{
            gridColumn: "1",
            minWidth: 0,
            alignSelf: "center",
          }}
        >
          <Typography
            component="span"
            sx={{
              display: "block",
              fontSize: "0.8rem",
              opacity: 0.7,
            }}
          >
            {primaryName.label}
          </Typography>
          <Typography
            component="span"
            sx={{
              display: "block",
              fontSize: "1rem",
              fontWeight: "medium",
            }}
          >
            {`${primaryName.value}${
              isBirbInRegion
                ? ""
                : ` (not found in ${region}, audio came from ${regionLabel})`
            }`}
          </Typography>
        </Typography>
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
          {secondaryNames.map(([, name]) => (
            <Typography
              key={name.label}
              component="span"
              sx={{
                gridColumn: "span 1",
                minWidth: 0,
              }}
            >
              <Typography
                component="span"
                sx={{
                  display: "block",
                  fontSize: "0.8rem",
                  opacity: 0.7,
                }}
              >
                {name.label}
              </Typography>
              <Typography
                component="span"
                sx={{
                  display: "block",
                  fontSize: "1rem",
                }}
              >
                {name.value}
              </Typography>
            </Typography>
          ))}
        </Box>
      </Typography>
      {bottomContent}
    </>
  );
}

export default BirbNames;
