import React from "react";
import { CardMetadata } from "../types/metadata";

export enum PictureSizes {
  small = "small",
  medium = "medium",
}

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  cardMetadata: CardMetadata;
  alt: string;
  size: PictureSizes;
  showSecretSide?: boolean;
  actions: Action[];
}

const heightMapping: { [key in PictureSizes]: number } = {
  [PictureSizes.small]: 200,
  [PictureSizes.medium]: 500,
};

export interface Action {
  label: string;
  onClick: () => void;
}

export default ({
  cardMetadata,
  alt,
  size,
  showSecretSide = false,
  actions,
  ...divProps
}: Props) => {
  const height = heightMapping[size];

  return (
    <div className="root" {...divProps}>
      <img
        className="secretSide"
        src={`/${cardMetadata.secretSidePath}`}
        alt={alt}
      />
      <img src={`/${cardMetadata.visibleSidePath}`} alt={alt} />
      <div className="actionContainer">
        {actions.map(({ label, onClick }) => (
          <div key={label} className="action" onClick={onClick}>
            {label}
          </div>
        ))}
      </div>
      <style jsx>{`
        .root {
          height: ${height}px;
          position: relative;
          border: 3px solid transparent;
        }
        .root:hover {
          border-color: darkgrey;
        }
        img {
          transition: opacity 100ms;
          height: ${height}px;
        }
        img.secretSide {
          position: absolute;
          opacity: ${showSecretSide ? 1 : 0};
        }
        .actionContainer {
          position: absolute;
          top: 0;
          width: 100%;
          height: 100%;

          display: flex;
          flex-direction: column-reverse;
        }
        .action {
          height: 15%;
          background-color: lightgrey;
          opacity: 0.8;
        }
      `}</style>
    </div>
  );
};
