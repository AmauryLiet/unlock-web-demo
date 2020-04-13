import Link from "next/link";
import React from "react";
import { ConvertedAssetsMetadata } from "../../scripts/pdfToPngConverter";
import { PictureSizes } from "./CardPicture";
import CardPictureWithFooter from "./CardPictureWithFooter";

interface Props {
  scenarioMetadata: ConvertedAssetsMetadata;
  href: string;
}

export default ({ scenarioMetadata, href }: Props) => {
  return (
    <>
      <Link href={href}>
        <CardPictureWithFooter
          className="scenarioCard"
          cardMetadata={scenarioMetadata.introCards[0]}
          alt="my image"
          picSize={PictureSizes.medium}
        >
          <span style={{ textAlign: "center" }}>
            {scenarioMetadata.scenarioPublicName}
          </span>
        </CardPictureWithFooter>
      </Link>
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
