import Head from "next/head";
import React from "react";

import ScenarioPresentation from "../components/ScenarioPresentation";
import { getAllMetadata } from "../tools/metadataHandling";

export default () => {
  return (
    <div>
      <Head>
        <title>Unlock free demo</title>
        <link
          href="https://fonts.googleapis.com/css2?family=Roboto&display=swap"
          rel="stylesheet"
        />
        <link
          rel="shortcut icon"
          href="https://static.wixstatic.com/media/59baa2_0ad2227e86b749e7b61facf1794f6af0%7Emv2_d_5016_5051_s_4_2.png/v1/fill/w_32%2Ch_32%2Clg_1%2Cusm_0.66_1.00_0.01/59baa2_0ad2227e86b749e7b61facf1794f6af0%7Emv2_d_5016_5051_s_4_2.png"
          type="image/png"
        />
      </Head>
      <h1>Unlock</h1>
      <h2>Scénarios</h2>
      <div style={{ display: "flex", flexWrap: "wrap" }}>
        {getAllMetadata().map((scenarioMetadata) => (
          <ScenarioPresentation
            key={scenarioMetadata.scenarioPublicName}
            scenarioMetadata={scenarioMetadata}
            href={`/scenario/${scenarioMetadata.scenarioPublicName}`}
          />
        ))}
      </div>
    </div>
  );
};
