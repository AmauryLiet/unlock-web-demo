import React from "react";
import { getFirstIntroductionCard } from "../tools/metadataHandling";
import { ConvertedAssetsMetadata } from "../types/metadata";
import { PictureSizes } from "./CardPicture";
import CardPictureWithFooter from "./CardPictureWithFooter";

interface Props {
  scenarioMetadata: ConvertedAssetsMetadata;
  href: string;
}

export default ({ scenarioMetadata, href }: Props) => {
  return (
    <>
      <CardPictureWithFooter
        className="scenarioCard"
        cardMetadata={getFirstIntroductionCard(scenarioMetadata)}
        alt="my image"
        picSize={PictureSizes.medium}
        cardHref={href}
      >
        <span style={{ textAlign: "center" }}>
          {scenarioMetadata.scenarioPublicName}
        </span>
      </CardPictureWithFooter>
      <style jsx>{`
        .scenarioCard {
          background-color: beige;
          border: 3px solid transparent;
        }
        .scenarioCard:hover {
          background-color: lightgreen;
          border-color: lightgreen;
        }
      `}</style>
    </>
  );
};
