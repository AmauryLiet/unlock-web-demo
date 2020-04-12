import { useRouter } from "next/router";
import React from "react";
import CardPicture, { PictureSizes } from "../../components/CardPicture";
import { getMetadataForName } from "../../tools/metadataHandling";

export default () => {
  const router = useRouter();
  const { scenarioName } = router.query;

  if (typeof scenarioName != "string") {
    return <div>{`Error: invalid path "${scenarioName}"`}</div>;
  }

  const scenarioAssetsMetadata = getMetadataForName(scenarioName);

  if (!scenarioAssetsMetadata) {
    return (
      <div>{`Error: could not find assets with name "${scenarioName}"`}</div>
    );
  }

  return (
    <div>
      <h2>{scenarioName}</h2>
      <h3>Initial pages paths</h3>
      {scenarioAssetsMetadata.introCards.map((cardMetadata) => (
        <CardPicture
          src={`/${cardMetadata.visibleSidePath}`}
          alt="Introduction card"
          size={PictureSizes.medium}
        />
      ))}
      <h3>Additional pages paths</h3>
      {scenarioAssetsMetadata.numberedCards.map((cardMetadata) => (
        <CardPicture
          src={`/${cardMetadata.visibleSidePath}`}
          alt="Available card"
          size={PictureSizes.small}
        />
      ))}
    </div>
  );
};
