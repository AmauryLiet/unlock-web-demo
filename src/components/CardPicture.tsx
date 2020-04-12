import React from "react";

export enum PictureSizes {
  small = "small",
  medium = "medium",
}

interface Props {
  src: string;
  alt: string;
  size: PictureSizes;
}

const heightMapping: { [key in PictureSizes]: number } = {
  [PictureSizes.small]: 200,
  [PictureSizes.medium]: 500,
};

export default ({ src, alt, size }: Props) => {
  const height = heightMapping[size];

  return <img src={src} alt={alt} style={{ height }} />;
};
