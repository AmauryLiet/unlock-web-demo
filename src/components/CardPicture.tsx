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
  actions?: Action[];
  clickable?: boolean;
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
  actions = [],
  clickable = false,
  ...divProps
}: Props) => {
  const height = heightMapping[size];

  return (
    <div className={`root ${clickable ? "clickable" : ""}`} {...divProps}>
      <img
        className="secretSide"
        src={`/${cardMetadata.secretSidePath}`}
        alt={alt}
      />
      <img src={`/${cardMetadata.visibleSidePath}`} alt={alt} />
      <div className="actionContainer">
        {actions.map(({ label, onClick }) => (
          <div key={label} className="action" onClick={onClick}>
            <span>{label}</span>
          </div>
        ))}
      </div>
      <style jsx>{`
        .root {
          height: ${height}px;
          position: relative;
        }
        .root.clickable {
          cursor: pointer;
          border: 3px solid transparent;
        }
        .root.clickable:hover {
          border-color: darkgrey;
        }
        img {
          transition: opacity 100ms;
          height: ${height}px;
          border-radius: 5px;
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

          transition: opacity 200ms;
          opacity: 0;
        }
        .root:hover .actionContainer {
          opacity: 1;
        }
        .action {
          height: 15%;

          border: 3px solid transparent;
          background-color: rgba(200, 200, 200, 0.8);
          transition: background-color 200ms, border 200ms, text-shadow 200ms;

          // about contained text
          display: flex;
          align-items: center;
          padding-left: 5%;
          font-weight: bold;

          user-select: none;
          cursor: pointer;

          font-size: ${size === PictureSizes.small ? "small" : "unset"};
        }
        .action:hover {
          text-shadow: 0 0 3px beige;
          background-color: rgba(150, 150, 150, 0.9);
          border-color: rgb(100, 100, 100);
        }
      `}</style>
    </div>
  );
};
