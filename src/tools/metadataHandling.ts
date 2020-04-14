import { CardType, ConvertedAssetsMetadata } from "../types/metadata";

const allConvertedAssetsMetadata: ConvertedAssetsMetadata[] = require("../../public/metadata.json");

export const getAllMetadata = () => allConvertedAssetsMetadata;

export const getMetadataForName = (
  scenarioName: string
): ConvertedAssetsMetadata | undefined =>
  allConvertedAssetsMetadata.find(
    (convertedAssetsMetadata) =>
      convertedAssetsMetadata.scenarioPublicName === scenarioName
  );

export const getFirstIntroductionCard = (
  convertedAssetsMetadata: ConvertedAssetsMetadata
) =>
  convertedAssetsMetadata.cards.find(
    (cardMetadata) => cardMetadata.type === CardType.INTRODUCTION
  );
