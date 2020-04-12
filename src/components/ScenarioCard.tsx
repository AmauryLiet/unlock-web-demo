import Link from "next/link";
import React from "react";
import { ConvertedAssetsMetadata } from "../../scripts/pdfToPngConverter";

interface Props {
  scenarioMetadata: ConvertedAssetsMetadata;
  href: string;
}

export default ({ scenarioMetadata, href }: Props) => {
  return (
    <>
      <Link href={href}>
        <div
          style={{ display: "flex", flexDirection: "column", margin: "10px" }}
        >
          <img
            src={`/${scenarioMetadata.introCards[0].visibleSidePath}`}
            alt="my image"
            style={{ height: 500 }}
          />
          <span style={{ textAlign: "center" }}>
            {scenarioMetadata.scenarioPublicName}
          </span>
        </div>
      </Link>
      <style jsx>{`
        div {
          background-color: lightgrey;
        }
        div:hover {
          background-color: lightgreen;
        }
      `}</style>
    </>
  );
};
