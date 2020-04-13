import { ConvertedAssetsMetadata } from "../../scripts/pdfToPngConverter";
import { getMetadataForName } from "../tools/metadataHandling";

export enum CardStatus {
  VISIBLE_FACE = "VISIBLE_FACE",
  SECRET_FACE = "SECRET_FACE",
  DISCARDED = "DISCARDED",
  AVAILABLE = "AVAILABLE",
}

interface State {
  scenarioAssetsMetadata: ConvertedAssetsMetadata;
  introCardsStatus: CardStatus[];
  numberedCardsStatus: CardStatus[];
}

interface Action {
  type: string;
}

export const initCardStatusReducer = (
  scenarioName: string | string[] | undefined
): State => {
  if (typeof scenarioName != "string") {
    console.error(`Error: invalid non-string path ${scenarioName}`);
    return;
  }
  const scenarioAssetsMetadata = getMetadataForName(scenarioName);
  if (!scenarioAssetsMetadata) {
    console.error(`Error: unknown scenario ${scenarioName}`);
    return;
  }

  return {
    scenarioAssetsMetadata,
    introCardsStatus: Array(scenarioAssetsMetadata.introCards.length).fill(
      CardStatus.VISIBLE_FACE
    ),
    numberedCardsStatus: Array(
      scenarioAssetsMetadata.numberedCards.length
    ).fill(CardStatus.AVAILABLE),
  };
};

export const cardStatusReducer = (state: State, action: Action): State => {
  switch (action.type) {
    default:
      throw new Error();
  }
};
