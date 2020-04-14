export enum CardType {
  INTRODUCTION = "INTRODUCTION",
  NUMBERED = "NUMBERED",
}

export interface TypeLessCardMetadata {
  id: string;
  visibleSidePath: string;
  secretSidePath: string;
}
export interface CardMetadata extends TypeLessCardMetadata {
  type: CardType;
}
export interface ConvertedAssetsMetadata {
  scenarioPublicName: string;
  cards: CardMetadata[];
}
