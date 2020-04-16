import { useRouter } from "next/router";
import React, { useCallback, useReducer } from "react";
import CardList from "../../components/CardList";
import CardPicture, {
  ActionType,
  PictureSizes,
} from "../../components/CardPicture";
import {
  ActionName,
  CardStatus,
  cardStatusReducer,
  cardStatusSelectors,
  initCardStatusReducer,
} from "../../reducer/CardStatuses";

export default () => {
  const router = useRouter();
  const { scenarioName } = router.query;

  const [store, dispatch] = useReducer(
    cardStatusReducer,
    scenarioName,
    initCardStatusReducer
  );

  const flipIntroCard = useCallback((introCardId: string) => {
    dispatch({
      type: ActionName.TOGGLE_INTRO_CARD,
      introCardId,
    });
  }, []);
  const revealCard = useCallback((cardId: string) => {
    dispatch({
      type: ActionName.REVEAL_CARD,
      cardId,
    });
  }, []);
  const discardCard = useCallback((cardId: string) => {
    dispatch({
      type: ActionName.DISCARD_CARD,
      cardId,
    });
  }, []);

  if (!store) {
    if (typeof scenarioName === "string") {
      // FIXME Next issue :( https://github.com/zeit/next.js/issues/11201
      //  this workaround is made to ensure proper store initialization at 2nd render
      dispatch({
        type: ActionName.REINIT,
        scenarioName,
      });
    }

    return <div>Error: Could not initialize state</div>;
  }

  return (
    <div>
      <h2>{scenarioName}</h2>
      <h3>Cartes retournées 👀</h3>
      <CardList>
        {cardStatusSelectors.getVisibleIntroCards(store).map((cardMetadata) => (
          <CardPicture
            key={cardMetadata.visibleSidePath}
            cardMetadata={cardMetadata}
            alt="Introduction card"
            size={PictureSizes.medium}
            showSecretSide={cardStatusSelectors.isCardOnSecretFace(
              store,
              cardMetadata.id
            )}
            actions={[
              {
                label: "🔄 Retourner",
                onClick: () => flipIntroCard(cardMetadata.id),
              },
              {
                label: "🗑 Jeter",
                onClick: () => discardCard(cardMetadata.id),
                type: ActionType.danger,
              },
            ]}
          />
        ))}
        {cardStatusSelectors
          .getNumberedCardsByStatus(store, CardStatus.SECRET_FACE)
          .map((cardMetadata) => (
            <CardPicture
              key={cardMetadata.visibleSidePath}
              cardMetadata={cardMetadata}
              alt="Flipped card"
              size={PictureSizes.medium}
              showSecretSide
              actions={[
                {
                  label: "🔎 Agrandir",
                  onClick: () =>
                    window.open(
                      `${location.origin}/${cardMetadata.secretSidePath}`
                    ),
                },
                {
                  label: "🗑 Jeter",
                  onClick: () => discardCard(cardMetadata.id),
                  type: ActionType.danger,
                },
              ]}
            />
          ))}
      </CardList>
      <h3>Cartes dispos 🃏</h3>
      <CardList>
        {cardStatusSelectors
          .getNumberedCardsByStatus(store, CardStatus.AVAILABLE)
          .map((cardMetadata) => (
            <CardPicture
              key={cardMetadata.visibleSidePath}
              cardMetadata={cardMetadata}
              alt="Available card"
              size={PictureSizes.small}
              actions={[
                {
                  label: "👀 Retourner",
                  onClick: () => revealCard(cardMetadata.id),
                  type: ActionType.warning,
                },
              ]}
            />
          ))}
      </CardList>
      <h3>Cartes supprimées 🗑</h3>
      <CardList>
        {cardStatusSelectors
          .getAllCardsByStatus(store, CardStatus.DISCARDED)
          .map((cardMetadata) => (
            <CardPicture
              key={cardMetadata.visibleSidePath}
              cardMetadata={cardMetadata}
              alt="Discarded card"
              size={PictureSizes.small}
              showSecretSide
              actions={[
                {
                  label: "⏪ Restaurer",
                  onClick: () => revealCard(cardMetadata.id),
                },
              ]}
            />
          ))}
      </CardList>
    </div>
  );
};
