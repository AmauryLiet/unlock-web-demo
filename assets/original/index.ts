export const ROW_COUNT_PER_PAGE = 2;
export const COLUMN_COUNT_PER_PAGE = 3;
export const CARD_COUNT_PER_PAGE = ROW_COUNT_PER_PAGE * COLUMN_COUNT_PER_PAGE;
export const PDF_VERTICAL_MARGIN = 8.7 / 100;
export const PDF_HORIZONTAL_MARGIN = 6 / 100;

export interface PdfAssetMetadata {
  filename: string;
  emptyCardsCountOnLastPage: number;
  startWithSecretFaces: boolean;
  introductionCards: number[];
  marginDetails: MarginDetails;
}

export interface MarginDetails {
  horizontalPercentage: number;
  topPercentage: number;
  bottomPercentage: number;
}

const standardMargins: MarginDetails = {
  horizontalPercentage: 6,
  topPercentage: 8.7,
  bottomPercentage: 8.7,
};

const withHeaderMargins: MarginDetails = {
  horizontalPercentage: 5.5,
  topPercentage: 15,
  bottomPercentage: 6.4,
};

export const allPdfAssetsMetadata: Array<PdfAssetMetadata> = [
  {
    filename: "0 - tutorial",
    emptyCardsCountOnLastPage: 2,
    startWithSecretFaces: true,
    introductionCards: [0],
    marginDetails: standardMargins,
  },
  {
    filename: "1 - 5ème avenue",
    emptyCardsCountOnLastPage: 3,
    startWithSecretFaces: true,
    introductionCards: [0, 1],
    marginDetails: standardMargins,
  },
  {
    filename: "2 - Le donjon de Doo-Arann",
    emptyCardsCountOnLastPage: 0,
    startWithSecretFaces: false,
    introductionCards: [0, 1, 2],
    marginDetails: withHeaderMargins,
  },
  {
    filename: "3 - La chambre d'hôtel",
    emptyCardsCountOnLastPage: 4,
    startWithSecretFaces: true,
    introductionCards: [0],
    marginDetails: standardMargins,
  },
  {
    filename: "4 - A la poursuite de Cabrakan",
    emptyCardsCountOnLastPage: 0,
    startWithSecretFaces: false,
    introductionCards: [0, 1, 2],
    marginDetails: withHeaderMargins,
  },
  {
    filename: "5 - L’autel du dieu RA",
    emptyCardsCountOnLastPage: 0,
    startWithSecretFaces: true,
    introductionCards: [2],
    marginDetails: standardMargins,
  },
];
