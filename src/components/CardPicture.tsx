import React from "react";
import { CardMetadata } from "../../scripts/pdfToPngConverter";

export enum PictureSizes {
  small = "small",
  medium = "medium",
}

interface Props {
  cardMetadata: CardMetadata;
  alt: string;
  size: PictureSizes;
  showSecretSide?: boolean;
}

const heightMapping: { [key in PictureSizes]: number } = {
  [PictureSizes.small]: 200,
  [PictureSizes.medium]: 500,
};

export default ({ cardMetadata, alt, size, showSecretSide = false }: Props) => {
  const height = heightMapping[size];

  return (
    <>
      <img
        src={`/${cardMetadata.secretSidePath}`}
        alt={alt}
        style={{
          height,
          position: "absolute",
          opacity: showSecretSide ? 1 : 0,
        }}
      />
      <img
        src={`/${cardMetadata.visibleSidePath}`}
        alt={alt}
        style={{
          height,
        }}
      />
      <style jsx>{`
        img {
          transition: opacity 100ms;
        }
        div {
          border: 3px solid transparent;
        }
        div:hover {
          border-color: darkgrey;
        }
      `}</style>
    </>
  );
};
