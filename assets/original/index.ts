export const CARDS_PER_PAGE = 6;
export const PDF_VERTICAL_MARGIN = 8.7 / 100;
export const PDF_HORIZONTAL_MARGIN = 6 / 100;

export const pdfAssetsMetadata: Array<{
  filename: string;
  emptyCardsCountOnLastPage: number;
  startWithSecretFaces: boolean;
  introductionCards: number;
}> = [
  {
    filename: "0 - tutorial",
    emptyCardsCountOnLastPage: 2,
    startWithSecretFaces: true,
    introductionCards: 1,
  },
  {
    filename: "1 - 5ème avenue",
    emptyCardsCountOnLastPage: 3,
    startWithSecretFaces: true,
    introductionCards: 2,
  },
  {
    filename: "2 - Le donjon de Doo-Arann",
    emptyCardsCountOnLastPage: 0,
    startWithSecretFaces: false,
    introductionCards: 3,
  },
  {
    filename: "3 - La chambre d'hôtel",
    emptyCardsCountOnLastPage: 4,
    startWithSecretFaces: true,
    introductionCards: 1,
  },
  {
    filename: "4 - A la poursuite de Cabrakan",
    emptyCardsCountOnLastPage: 0,
    startWithSecretFaces: false,
    introductionCards: 3,
  },
  {
    filename: "5 - L’autel du dieu RA",
    emptyCardsCountOnLastPage: 0,
    startWithSecretFaces: true,
    introductionCards: 1,
  },
];
