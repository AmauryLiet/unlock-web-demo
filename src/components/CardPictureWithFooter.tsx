import React from "react";
import { CardMetadata } from "../types/metadata";
import CardPicture, { Action, PictureSizes } from "./CardPicture";

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  cardMetadata: CardMetadata;
  picSize: PictureSizes;
  alt: string;
  children: React.ReactNode;
  showSecretSide?: boolean;
  actions: Action[];
}

export default ({
  cardMetadata,
  picSize,
  alt,
  showSecretSide,
  children,
  actions,

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
        actions={actions}
      />
      {children}
    </div>
  );
};
