import React from "react";
import { ConvertedAssetsMetadata } from "../../scripts/pdfToPngConverter";

interface Props {
  scenarioMetadata: ConvertedAssetsMetadata;
}

export default ({ scenarioMetadata }: Props) => {
  return (
    <div style={{ display: "flex", flexDirection: "column", margin: "10px" }}>
      <img
        src={`/${scenarioMetadata.introCards[0].visibleSidePath}`}
        alt="my image"
        style={{ height: 500 }}
      />
      <span
        style={{
          textAlign: "center",
          fontFamily: "Roboto, sans-serif",
        }}
      >
        {scenarioMetadata.scenarioPublicName}
      </span>
    </div>
  );
};
