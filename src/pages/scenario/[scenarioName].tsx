import { useRouter } from "next/router";
import React from "react";
import { ConvertedAssetsMetadata } from "../../../scripts/pdfToPngConverter";

const allConvertedAssetsMetadata: ConvertedAssetsMetadata[] = require("../../../public/metadata.json");

export default () => {
  const router = useRouter();
  const { scenarioName } = router.query;

  const scenarioAssetsMetadata = allConvertedAssetsMetadata.find(
    (convertedAssetsMetadata) =>
      convertedAssetsMetadata.scenarioPublicName === scenarioName
  );

  if (!scenarioAssetsMetadata) {
    return (
      <div>{`Error: could not find assets with name "${scenarioName}". Available ones: ${allConvertedAssetsMetadata.map(
        (data) => data.scenarioPublicName
      )}`}</div>
    );
  }

  return (
    <div>
      <h2>{`Welcome to the scenario "${scenarioName}"`}</h2>
      <h3>Initial pages paths</h3>
      {scenarioAssetsMetadata.introCards.map((cardMetadata) => (
        <img
          src={`/${cardMetadata.visibleSidePath}`}
          alt="Introduction card"
          style={{ height: 500 }}
        />
      ))}
      <h3>Additional pages paths</h3>
      {scenarioAssetsMetadata.numberedCards.map((cardMetadata) => (
        <img
          src={`/${cardMetadata.visibleSidePath}`}
          alt="Available card"
          style={{ height: 500 }}
        />
      ))}
    </div>
  );
};
