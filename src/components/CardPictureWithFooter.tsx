import React from "react";
import { CardMetadata } from "../types/metadata";
import CardPicture, { PictureSizes } from "./CardPicture";

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  cardMetadata: CardMetadata;
  picSize: PictureSizes;
  alt: string;
  children: React.ReactNode;
  showSecretSide?: boolean;
  onCardPictureClick?: () => void;
}

export default ({
  cardMetadata,
  picSize,
  alt,
  showSecretSide,
  children,
  onCardPictureClick,

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
        onClick={onCardPictureClick}
      />
      {children}
    </div>
  );
};
