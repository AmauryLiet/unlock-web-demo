import React from "react";
import { CardMetadata } from "../../scripts/pdfToPngConverter";
import CardPicture, { PictureSizes } from "./CardPicture";

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  cardMetadata: CardMetadata;
  picSize: PictureSizes;
  alt: string;
  children: React.ReactNode;
  showSecretSide?: boolean;
}

export default ({
  cardMetadata,
  picSize,
  alt,
  showSecretSide,
  children,

  style,
  ...divProps
}: Props) => {
  return (
    <div
      style={{ display: "flex", flexDirection: "column", ...style }}
      {...divProps}
    >
      <CardPicture
        cardMetadata={cardMetadata}
        alt={alt}
        size={picSize}
        showSecretSide={showSecretSide}
      />
      {children}
    </div>
  );
};
