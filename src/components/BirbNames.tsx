import * as React from "react";
import { Box, Typography } from "@mui/material";
import { QuizContext } from "../App";
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
  const quizContext = React.useContext(QuizContext);
  if (!quizContext) {
    throw new Error("Must be used within a QuizContext.Provider");
  }
  const { currentTranslation: t } = quizContext;

  const replaceTemplate = (
    template: string,
    values: Record<string, string>,
  ) =>
    Object.entries(values).reduce(
      (message, [key, value]) => message.replace(`{${key}}`, value),
      template,
    );

  const allNames = [
    {
      property: EBirdNameProperty.COMMON_NAME,
      label: t.English,
      value: commonName,
    },
    {
      property: EBirdNameProperty.COMMON_NAME_FR,
      label: t.French,
      value: commonNameFr,
    },
    {
      property: EBirdNameProperty.SCIENTIFIC_NAME,
      label: t.Latin,
      value: scientificName,
    },
  ];
  const primaryNameIndex = allNames.findIndex(
    ({ property }) => property === currentNameProperty,
  );

  if (primaryNameIndex === -1) {
    return null;
  }

  const orderedNames = [
    allNames[primaryNameIndex],
    ...allNames.slice(0, primaryNameIndex),
    ...allNames.slice(primaryNameIndex + 1),
  ];

  return (
    <>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(3, minmax(0, 1fr))",
          },
          alignItems: "flex-start",
          width: "100%",
        }}
      >
        {orderedNames.map((name, index) => (
          <Box
            key={name.label}
            sx={{
              minWidth: 0,
              display: "flex",
              justifyContent: {
                xs: "flex-start",
                sm:
                  index === 0
                    ? "flex-start"
                    : index === 1
                      ? "center"
                      : "flex-end",
              },
            }}
          >
            <Box
              sx={{
                minWidth: 0,
                textAlign: "left",
              }}
            >
              <Typography
                sx={{
                  fontSize: "0.8rem",
                  opacity: 0.7,
                  marginBottom: "0.25rem",
                }}
              >
                {name.label}
              </Typography>
              <Typography
                sx={{
                fontSize: "1rem",
              }}
            >
                {`${name.value}${
                  index === 0 && !isBirbInRegion
                    ? ` (${replaceTemplate(
                        t.NotFoundInRegionAudioFromRegion,
                        {
                          region,
                          regionLabel,
                        },
                      )})`
                    : ""
                }`}
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>
    </>
  );
}

export default BirbNames;
