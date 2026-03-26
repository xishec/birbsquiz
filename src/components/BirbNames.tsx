import * as React from "react";
import { Box, Typography } from "@mui/material";
import { DBRegion, EBirdNameProperty } from "../tools/constants";

type BirbNamesProps = {
  commonName: string;
  commonNameFr: string;
  currentNameProperty: EBirdNameProperty;
  isBirbInRegion: boolean;
  region: DBRegion;
  regionLabel: string;
  scientificName: string;
};

function BirbNames({
  commonName,
  commonNameFr,
  currentNameProperty,
  isBirbInRegion,
  region,
  regionLabel,
  scientificName,
}: BirbNamesProps) {
  const allNames = [
    {
      property: EBirdNameProperty.COMMON_NAME,
      label: "English",
      value: commonName,
    },
    {
      property: EBirdNameProperty.COMMON_NAME_FR,
      label: "French",
      value: commonNameFr,
    },
    {
      property: EBirdNameProperty.SCIENTIFIC_NAME,
      label: "Latin",
      value: scientificName,
    },
  ];
  const primaryName = allNames.find(
    ({ property }) => property === currentNameProperty,
  );

  if (!primaryName) {
    return null;
  }

  const secondaryNames = allNames.filter(
    ({ property }) => property !== currentNameProperty,
  );
  const orderedNames = [primaryName, ...secondaryNames];
  const secondaryColumnWidth = "140px";

  return (
    <>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          gap: "1rem",
        }}
      >
        {orderedNames.map((name, index) => (
          <Typography
            key={name.label}
            sx={{
              fontSize: "0.8rem",
              opacity: 0.7,
              flex: index === 0 ? "1 1 0" : `0 0 ${secondaryColumnWidth}`,
              minWidth: 0,
            }}
          >
            {name.label}
          </Typography>
        ))}
      </Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "1rem",
        }}
      >
        <Box
          sx={{
            flex: "1 1 0",
            minWidth: 0,
          }}
        >
          <Typography
            sx={{
              fontSize: "1rem",
            }}
          >
            {`${primaryName.value}${
              isBirbInRegion
                ? ""
                : ` (not found in ${region}, audio came from ${regionLabel})`
            }`}
          </Typography>
        </Box>
        {secondaryNames.map((name) => (
          <Box
            key={name.label}
            sx={{
              flex: `0 0 ${secondaryColumnWidth}`,
              minWidth: 0,
            }}
          >
            <Typography
              sx={{
                fontSize: "1rem",
              }}
            >
              {name.value}
            </Typography>
          </Box>
        ))}
      </Box>
    </>
  );
}

export default BirbNames;
