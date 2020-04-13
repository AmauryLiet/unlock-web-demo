import { useRouter } from "next/router";
import React, { useReducer } from "react";
import CardList from "../../components/CardList";
import CardPicture, { PictureSizes } from "../../components/CardPicture";
import {
  initCardStatusReducer,
  cardStatusReducer,
  ActionName,
} from "../../reducer/CardStatuses";

export default () => {
  const router = useRouter();
  const { scenarioName } = router.query;

  const [state, dispatch] = useReducer(
    cardStatusReducer,
    scenarioName,
    initCardStatusReducer
  );

  if (!state) {
    if (typeof scenarioName === "string") {
      // FIXME Next issue :( https://github.com/zeit/next.js/issues/11201
      //  this workaround is made to ensure proper state initialization at 2nd render
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
      <h3>Initial pages paths</h3>
      <CardList>
        {state.scenarioAssetsMetadata.introCards.map(
          (cardMetadata, introCardIndex) => (
            <div
              key={cardMetadata.visibleSidePath}
              style={{ display: "flex", flexDirection: "column" }}
            >
              <CardPicture
                src={`/${cardMetadata.visibleSidePath}`}
                alt="Introduction card"
                size={PictureSizes.medium}
              />
              <span>{state.introCardsStatus[introCardIndex]}</span>
            </div>
          )
        )}
      </CardList>
      <h3>Additional pages paths</h3>
      <CardList>
        {state.scenarioAssetsMetadata.numberedCards.map(
          (cardMetadata, numberedCardIndex) => (
            <div
              key={cardMetadata.visibleSidePath}
              style={{ display: "flex", flexDirection: "column" }}
            >
              <CardPicture
                src={`/${cardMetadata.visibleSidePath}`}
                alt="Available card"
                size={PictureSizes.small}
              />
              <span>{state.numberedCardsStatus[numberedCardIndex]}</span>
            </div>
          )
        )}
      </CardList>
    </div>
  );
};
