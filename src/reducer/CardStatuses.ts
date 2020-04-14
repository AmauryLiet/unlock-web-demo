import * as R from "ramda";
import { CardType, ConvertedAssetsMetadata } from "../types/metadata";
import { getMetadataForName } from "../tools/metadataHandling";

export enum CardStatus {
  VISIBLE_FACE = "VISIBLE_FACE",
  SECRET_FACE = "SECRET_FACE",
  DISCARDED = "DISCARDED",
  AVAILABLE = "AVAILABLE",
}

interface State {
  scenarioAssetsMetadata: ConvertedAssetsMetadata;
  cardsStatus: { [id: string]: CardStatus };
  orderedCards: string[];
}

export enum ActionName {
  REINIT,
  TOGGLE_INTRO_CARD,
  REVEAL_CARD,
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
      type: ActionName.REVEAL_CARD;
      cardId: string;
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

  const typeToStatusMapping: { [type in CardType]: CardStatus } = {
    [CardType.INTRODUCTION]: CardStatus.VISIBLE_FACE,
    [CardType.NUMBERED]: CardStatus.AVAILABLE,
  };

  return {
    scenarioAssetsMetadata,
    cardsStatus: R.map(
      ({ type }) => typeToStatusMapping[type],
      scenarioAssetsMetadata.cards
    ),
    orderedCards: R.keys(scenarioAssetsMetadata.cards),
  };
};

const moveElementLast = <T>(array: Readonly<T[]>, elementToMoveLast: T): T[] =>
  R.append(elementToMoveLast, R.without([elementToMoveLast], array));

export const cardStatusReducer = (
  state: Readonly<State>,
  action: Action
): State => {
  switch (action.type) {
    case ActionName.REINIT:
      return initCardStatusReducer(action.scenarioName);

    case ActionName.TOGGLE_INTRO_CARD:
      const previousCardStatus = state.cardsStatus[action.introCardId];
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
        cardsStatus: {
          ...state.cardsStatus,
          [action.introCardId]: newCardStatus,
        },
      };

    case ActionName.REVEAL_CARD: {
      const cardFormerStatus = state.cardsStatus[action.cardId];
      const expectedFormerStatuses = [
        CardStatus.VISIBLE_FACE,
        CardStatus.AVAILABLE,
      ];
      if (!expectedFormerStatuses.includes(cardFormerStatus))
        console.warn(
          `Tried to reveal a non visible card "${action.cardId}" was "${cardFormerStatus}"`
        );

      const orderedCards = moveElementLast(state.orderedCards, action.cardId);

      return {
        ...state,
        cardsStatus: {
          ...state.cardsStatus,
          [action.cardId]: CardStatus.SECRET_FACE,
        },
        orderedCards,
      };
    }

    case ActionName.DISCARD_CARD: {
      const orderedCards = moveElementLast(state.orderedCards, action.cardId);

      return {
        ...state,
        cardsStatus: {
          ...state.cardsStatus,
          [action.cardId]: CardStatus.DISCARDED,
        },
        orderedCards,
      };
    }

    default:
      throw new Error();
  }
};

const getAllCardsOrdered = (state: State) =>
  state.orderedCards.map((id) => state.scenarioAssetsMetadata.cards[id]);
const getAllIntroCardsOrdered = (state: State) =>
  getAllCardsOrdered(state).filter(R.propEq("type", CardType.INTRODUCTION));
const getAllNumberedCardsOrdered = (state: State) =>
  getAllCardsOrdered(state).filter(R.propEq("type", CardType.NUMBERED));

const getVisibleIntroCards = (state: State) =>
  getAllIntroCardsOrdered(state).filter(
    (cardMetadata) =>
      state.cardsStatus[cardMetadata.id] !== CardStatus.DISCARDED
  );
const getIntroCardsByStatus = (state: State, status: CardStatus) =>
  getAllIntroCardsOrdered(state).filter(
    (cardMetadata) => state.cardsStatus[cardMetadata.id] === status
  );
const getNumberedCardsByStatus = (state: State, status: CardStatus) =>
  getAllNumberedCardsOrdered(state).filter(
    (cardMetadata) => state.cardsStatus[cardMetadata.id] === status
  );
const getAllCardsByStatus = (state: State, status: CardStatus) =>
  getAllCardsOrdered(state).filter(
    (cardMetadata) => state.cardsStatus[cardMetadata.id] === status
  );

const isCardOnSecretFace = (state: State, id: string) =>
  state.cardsStatus[id] === CardStatus.SECRET_FACE;

export const cardStatusSelectors = {
  getVisibleIntroCards,
  getNumberedCardsByStatus,
  getAllCardsByStatus,
  isCardOnSecretFace,
};
