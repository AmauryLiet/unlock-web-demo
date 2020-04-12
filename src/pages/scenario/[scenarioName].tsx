import { useRouter } from "next/router";
import React from "react";

export default () => {
  const router = useRouter();
  const { scenarioName } = router.query;

  return <span>{`Welcome to the scenario "${scenarioName}"`}</span>;
};
