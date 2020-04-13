import { useRouter } from "next/router";
import React, { useCallback, useReducer } from "react";
import CardList from "../../components/CardList";
import { PictureSizes } from "../../components/CardPicture";
import CardPictureWithFooter from "../../components/CardPictureWithFooter";
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
  const revealNumberedCard = useCallback((numberedCardId: string) => {
    dispatch({
      type: ActionName.REVEAL_NUMBERED_CARD,
      numberedCardId,
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
      <h3>Cartes de départ 🏡</h3>
      <CardList>
        {cardStatusSelectors.getVisibleIntroCards(store).map((cardMetadata) => (
          <CardPictureWithFooter
            key={cardMetadata.visibleSidePath}
            onCardPictureClick={() => flipIntroCard(cardMetadata.id)}
            cardMetadata={cardMetadata}
            alt="Introduction card"
            picSize={PictureSizes.medium}
            showSecretSide={
              CardStatus.SECRET_FACE === store.introCardsStatus[cardMetadata.id]
            }
          >
            <span onClick={() => discardCard(cardMetadata.id)}>Jeter</span>
          </CardPictureWithFooter>
        ))}
      </CardList>
      <h3>Cartes retournées 👀</h3>
      <CardList>
        {cardStatusSelectors
          .getNumberedCardsByStatus(store, CardStatus.SECRET_FACE)
          .map((cardMetadata) => (
            <CardPictureWithFooter
              key={cardMetadata.visibleSidePath}
              cardMetadata={cardMetadata}
              alt="Flipped card"
              picSize={PictureSizes.medium}
              showSecretSide
            >
              <span onClick={() => discardCard(cardMetadata.id)}>Jeter</span>
            </CardPictureWithFooter>
          ))}
      </CardList>
      <h3>Cartes dispos 🃏</h3>
      <CardList>
        {cardStatusSelectors
          .getNumberedCardsByStatus(store, CardStatus.AVAILABLE)
          .map((cardMetadata) => (
            <CardPictureWithFooter
              key={cardMetadata.visibleSidePath}
              cardMetadata={cardMetadata}
              alt="Available card"
              picSize={PictureSizes.small}
            >
              <span onClick={() => revealNumberedCard(cardMetadata.id)}>
                Retourner
              </span>
            </CardPictureWithFooter>
          ))}
      </CardList>
    </div>
  );
};
