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

export enum ActionName {
  REINIT,
  TOGGLE_INTRO_CARD,
}

type Action =
  | {
      type: ActionName.REINIT;
      scenarioName: string;
    }
  | {
      type: ActionName.TOGGLE_INTRO_CARD;
      introCardIndex: number;
    };

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
    case ActionName.REINIT:
      return initCardStatusReducer(action.scenarioName);

    case ActionName.TOGGLE_INTRO_CARD:
      const introCardsStatus = [...state.introCardsStatus];
      const previousCardStatus = introCardsStatus[action.introCardIndex];
      const newCardStatus = {
        [CardStatus.VISIBLE_FACE]: CardStatus.SECRET_FACE,
        [CardStatus.SECRET_FACE]: CardStatus.VISIBLE_FACE,
      }[previousCardStatus];

      if (!newCardStatus) {
        console.error(
          `ERROR: cannot toggle card which was previously "${previousCardStatus}"`
        );
        return state;
      }

      introCardsStatus[action.introCardIndex] = newCardStatus;
      return {
        ...state,
        introCardsStatus,
      };

    default:
      throw new Error();
  }
};
