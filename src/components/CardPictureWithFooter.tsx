import Link from "next/link";
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
  cardHref?: string;
}

export default ({
  cardMetadata,
  picSize,
  alt,
  showSecretSide,
  children,
  actions,

  style,
  cardHref,
  ...divProps
}: Props) => {
  const hasHref = !!cardHref;

  const cardPicture = (
    <CardPicture
      cardMetadata={cardMetadata}
      alt={alt}
      size={picSize}
      showSecretSide={showSecretSide}
      actions={actions}
      clickable={hasHref}
    />
  );

  return (
    <div
      style={{ display: "flex", flexDirection: "column", ...style }}
      {...divProps}
    >
      {hasHref ? <Link href={cardHref}>{cardPicture}</Link> : cardPicture}
      {children}
    </div>
  );
};
