import Link from "next/link";
import React from "react";
import { ConvertedAssetsMetadata } from "../../scripts/pdfToPngConverter";
import CardPicture, { PictureSizes } from "./CardPicture";

interface Props {
  scenarioMetadata: ConvertedAssetsMetadata;
  href: string;
}

export default ({ scenarioMetadata, href }: Props) => {
  return (
    <>
      <Link href={href}>
        <div
          className="scenarioCard"
          style={{ display: "flex", flexDirection: "column", margin: "10px" }}
        >
          <CardPicture
            src={`/${scenarioMetadata.introCards[0].visibleSidePath}`}
            alt="my image"
            size={PictureSizes.medium}
          />
          <span style={{ textAlign: "center" }}>
            {scenarioMetadata.scenarioPublicName}
          </span>
        </div>
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
