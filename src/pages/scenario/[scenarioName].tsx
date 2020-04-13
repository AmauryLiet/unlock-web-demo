import { useRouter } from "next/router";
import React, { useReducer } from "react";
import CardPicture, { PictureSizes } from "../../components/CardPicture";
import {
  initCardStatusReducer,
  cardStatusReducer,
} from "../../reducer/CardStatuses";

export default () => {
  const router = useRouter();
  const { scenarioName } = router.query;

  if (!scenarioName) {
    // FIXME Next issue :( https://github.com/zeit/next.js/issues/11201
    //  this workaround is made to ensure proper state initialization, but causes:
    //  "React has detected a change in the order of Hooks called. This will lead to bugs and errors if not fixed. See https://fb.me/rules-of-hooks"
    return <div>Loading...</div>;
  }

  const [state, dispatch] = useReducer(
    cardStatusReducer,
    scenarioName,
    initCardStatusReducer
  );

  if (!state) return <div>Error</div>;

  return (
    <div>
      <h2>{scenarioName}</h2>
      <h3>Initial pages paths</h3>
      <div style={{ display: "flex", flexWrap: "wrap" }}>
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
      </div>
      <h3>Additional pages paths</h3>
      <div style={{ display: "flex", flexWrap: "wrap" }}>
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
      </div>
    </div>
  );
};
