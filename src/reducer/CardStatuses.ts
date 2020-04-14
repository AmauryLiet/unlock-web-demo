import * as R from "ramda";
import {
  CardMetadata,
  CardType,
  ConvertedAssetsMetadata,
} from "../types/metadata";
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
  overallCardsOrder: string[];
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
    cardsStatus: R.fromPairs(
      scenarioAssetsMetadata.cards.map(({ id, type }) => [
        id,
        typeToStatusMapping[type],
      ])
    ),
    overallCardsOrder: scenarioAssetsMetadata.cards.map(R.prop("id")),
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
        overallCardsOrder: moveElementLast(
          state.overallCardsOrder,
          action.introCardId
        ),
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

      const overallCardsOrder = moveElementLast(
        state.overallCardsOrder,
        action.cardId
      );

      return {
        ...state,
        cardsStatus: {
          ...state.cardsStatus,
          [action.cardId]: CardStatus.SECRET_FACE,
        },
        overallCardsOrder,
      };
    }

    case ActionName.DISCARD_CARD: {
      const overallCardsOrder = moveElementLast(
        state.overallCardsOrder,
        action.cardId
      );

      return {
        ...state,
        cardsStatus: {
          ...state.cardsStatus,
          [action.cardId]: CardStatus.DISCARDED,
        },
        overallCardsOrder,
      };
    }

    default:
      throw new Error();
  }
};

const getAllCardsOrdered = (state: State) =>
  state.overallCardsOrder.map((id) =>
    R.find<CardMetadata>(R.propEq("id", id))(state.scenarioAssetsMetadata.cards)
  );
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
