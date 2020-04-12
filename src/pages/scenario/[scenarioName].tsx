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
      <ul>
        {scenarioAssetsMetadata.introCards.map((cardMetadata) => (
          <li>{cardMetadata.visibleSidePath}</li>
        ))}
      </ul>
      <h3>Additional pages paths</h3>
      <ul>
        {scenarioAssetsMetadata.numberedCards.map((cardMetadata) => (
          <li>{cardMetadata.visibleSidePath}</li>
        ))}
      </ul>
    </div>
  );
};
