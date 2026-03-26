import * as React from "react";
import { Typography } from "@mui/material";
import { DBRegion, EBirdNameProperty } from "../tools/constants";

type BirbNameRevealControlProps = {
  bottomContent?: React.ReactNode;
  commonName: string;
  commonNameFr: string;
  currentNameProperty: EBirdNameProperty;
  isBirbInRegion: boolean;
  region: DBRegion;
  regionLabel: string;
  scientificName: string;
};

function BirbNameRevealControl({
  bottomContent,
  commonName,
  commonNameFr,
  currentNameProperty,
  isBirbInRegion,
  region,
  regionLabel,
  scientificName,
}: BirbNameRevealControlProps) {
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
          marginTop: "1rem",
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.6fr) minmax(180px, 1fr)",
          gridTemplateRows: "auto auto",
          columnGap: "1rem",
          rowGap: "0.5rem",
          alignItems: "start",
        }}
      >
        <Typography
          component="span"
          sx={{
            gridColumn: "1",
            gridRow: "1 / span 2",
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
              fontSize: "1.5rem",
            }}
          >
            {`${primaryName.value}${
              isBirbInRegion
                ? ""
                : ` (not found in ${region}, audio came from ${regionLabel})`
            }`}
          </Typography>
        </Typography>
        {secondaryNames.map(([, name], index) => (
          <Typography
            key={name.label}
            component="span"
            sx={{
              gridColumn: "2",
              gridRow: `${index + 1}`,
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
                fontSize: "0.8rem",
              }}
            >
              {name.value}
            </Typography>
          </Typography>
        ))}
      </Typography>
      {bottomContent}
    </>
  );
}

export default BirbNameRevealControl;
