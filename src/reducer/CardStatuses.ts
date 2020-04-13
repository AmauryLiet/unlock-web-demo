import { fromPairs } from "ramda";
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
  introCardsStatus: { [id: string]: CardStatus };
  numberedCardsStatus: { [id: string]: CardStatus };
}

export enum ActionName {
  REINIT,
  TOGGLE_INTRO_CARD,
  REVEAL_NUMBERED_CARD,
  DISCARD_CARD,
}

type Action =
  | {
      type: ActionName.REINIT;
      scenarioName: string;
    }
  | {
      type: ActionName.TOGGLE_INTRO_CARD;
      introCardId: string;
    }
  | {
      type: ActionName.REVEAL_NUMBERED_CARD;
      numberedCardId: string;
    }
  | {
      type: ActionName.DISCARD_CARD;
      cardId: string;
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

  const introCardsStatus = fromPairs(
    scenarioAssetsMetadata.introCards.map((assetMetadata) => [
      assetMetadata.id,
      CardStatus.VISIBLE_FACE,
    ])
  );
  const numberedCardsStatus = fromPairs(
    scenarioAssetsMetadata.numberedCards.map((assetMetadata) => [
      assetMetadata.id,
      CardStatus.AVAILABLE,
    ])
  );
  return {
    scenarioAssetsMetadata,
    introCardsStatus,
    numberedCardsStatus,
  };
};

export const cardStatusReducer = (state: State, action: Action): State => {
  switch (action.type) {
    case ActionName.REINIT:
      return initCardStatusReducer(action.scenarioName);

    case ActionName.TOGGLE_INTRO_CARD:
      const previousCardStatus = state.introCardsStatus[action.introCardId];
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

      return {
        ...state,
        introCardsStatus: {
          ...state.introCardsStatus,
          [action.introCardId]: newCardStatus,
        },
      };

    case ActionName.REVEAL_NUMBERED_CARD:
      const cardFormerStatus = state.numberedCardsStatus[action.numberedCardId];
      const expectedFormerStatuses = [
        CardStatus.VISIBLE_FACE,
        CardStatus.AVAILABLE,
      ];
      if (!expectedFormerStatuses.includes(cardFormerStatus))
        console.warn(
          `Tried to reveal a non visible card "${action.numberedCardId}" was "${cardFormerStatus}"`
        );

      return {
        ...state,
        numberedCardsStatus: {
          ...state.numberedCardsStatus,
          [action.numberedCardId]: CardStatus.SECRET_FACE,
        },
      };

    case ActionName.DISCARD_CARD:
      if (
        state.scenarioAssetsMetadata.introCards
          .map((card) => card.id)
          .includes(action.cardId)
      ) {
        return {
          ...state,
          introCardsStatus: {
            ...state.introCardsStatus,
            [action.cardId]: CardStatus.DISCARDED,
          },
        };
      } else {
        return {
          ...state,
          numberedCardsStatus: {
            ...state.numberedCardsStatus,
            [action.cardId]: CardStatus.DISCARDED,
          },
        };
      }

    default:
      throw new Error();
  }
};

const getAllIntroCards = (state: State) =>
  state.scenarioAssetsMetadata.introCards;
const getAllNumberedCards = (state: State) =>
  state.scenarioAssetsMetadata.numberedCards;

const getVisibleIntroCards = (state: State) =>
  getAllIntroCards(state).filter(
    (cardMetadata) =>
      state.introCardsStatus[cardMetadata.id] !== CardStatus.DISCARDED
  );
const getNumberedCardsByStatus = (state: State, status: CardStatus) =>
  getAllNumberedCards(state).filter(
    (cardMetadata) => state.numberedCardsStatus[cardMetadata.id] === status
  );

export const cardStatusSelectors = {
  getVisibleIntroCards,
  getNumberedCardsByStatus,
};
