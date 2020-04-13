import { useRouter } from "next/router";
import React, { useState } from "react";
import CardPicture, { PictureSizes } from "../../components/CardPicture";
import { getMetadataForName } from "../../tools/metadataHandling";

enum CardStatus {
  VISIBLE_FACE = "VISIBLE_FACE",
  SECRET_FACE = "SECRET_FACE",
  DISCARDED = "DISCARDED",
  AVAILABLE = "AVAILABLE",
}

export default () => {
  const router = useRouter();
  const { scenarioName } = router.query;

  if (!scenarioName) {
    // FIXME Next issue :( https://github.com/zeit/next.js/issues/11201
    //  this workaround is made to ensure proper state initialization, but causes:
    //  "React has detected a change in the order of Hooks called. This will lead to bugs and errors if not fixed. See https://fb.me/rules-of-hooks"
    return <div>Loading...</div>;
  }

  const [state, setState] = useState(() => {
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
  });

  if (!state) return <div>Error</div>;

  return (
    <div>
      <h2>{scenarioName}</h2>
      <h3>Initial pages paths</h3>
      {state.scenarioAssetsMetadata.introCards.map(
        (cardMetadata, introCardIndex) => (
          <>
            <CardPicture
              src={`/${cardMetadata.visibleSidePath}`}
              alt="Introduction card"
              size={PictureSizes.medium}
            />
            <span>{state.introCardsStatus[introCardIndex]}</span>
          </>
        )
      )}
      <h3>Additional pages paths</h3>
      {state.scenarioAssetsMetadata.numberedCards.map(
        (cardMetadata, numberedCardIndex) => (
          <>
            <CardPicture
              src={`/${cardMetadata.visibleSidePath}`}
              alt="Available card"
              size={PictureSizes.small}
            />
            <span>{state.numberedCardsStatus[numberedCardIndex]}</span>
          </>
        )
      )}
    </div>
  );
};
