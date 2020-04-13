import fs from "fs";
import path from "path";
import PDF2Pic from "pdf2pic";
import sharp from "sharp";
import {
  CARD_COUNT_PER_PAGE,
  allPdfAssetsMetadata,
  PdfAssetMetadata,
  COLUMN_COUNT_PER_PAGE,
  ROW_COUNT_PER_PAGE,
  MarginDetails,
} from "../assets/original";

const assetsDir = path.join(__dirname, "../assets");
const pdfAssetsDir = path.join(assetsDir, "./original");
const pagesAssetsDir = path.join(assetsDir, "./pages");
const cardsAssetsDir = path.join(__dirname, "../public");

const LARGER_DIMENSION_SIZE = 1500;

type PagePaths = string[];
export interface CardMetadata {
  visibleSidePath: string;
  secretSidePath: string;
}
export interface ConvertedAssetsMetadata {
  scenarioPublicName: string;
  introCards: CardMetadata[];
  numberedCards: CardMetadata[];
}

const convertPdfToPngPages = async (
  pdfFilename: string
): Promise<PagePaths> => {
  const pdf2pic = new PDF2Pic({
    density: 100, // output pixels per inch
    savename: pdfFilename, // output file name
    savedir: pagesAssetsDir, // output file location
    format: "png", // output file format
    size: `${LARGER_DIMENSION_SIZE}x${LARGER_DIMENSION_SIZE}`, // output size in pixels
  });

  try {
    const conversionResults = await pdf2pic.convertBulk(
      path.join(pdfAssetsDir, `${pdfFilename}.pdf`),
      -1
    );
    console.info(`✅ pdf "${pdfFilename}" successfully converted in png`);

    return conversionResults.map((result) => result.path);
  } catch (error) {
    console.error(`cannot convert pdf>png for file "${pdfFilename}":`, error);
    throw error;
  }
};

const getCroppedCardFromPage = async (
  page: any,
  cardIndex: number,
  marginDetails: MarginDetails
) => {
  const { width, height } = await page.metadata();

  const horizontalOffset = Math.round(
      (marginDetails.horizontalPercentage * width) / 100
    ),
    topOffset = Math.round((marginDetails.topPercentage * height) / 100),
    bottomOffset = Math.round((marginDetails.bottomPercentage * height) / 100);

  const cardWidth = Math.round(
    (width - 2 * horizontalOffset) / COLUMN_COUNT_PER_PAGE
  );
  const cardHeight = Math.round(
    (height - topOffset - bottomOffset) / ROW_COUNT_PER_PAGE
  );

  return page.clone().extract({
    top: topOffset + cardHeight * Math.floor(cardIndex / COLUMN_COUNT_PER_PAGE),
    left:
      horizontalOffset +
      cardWidth * Math.floor(cardIndex % COLUMN_COUNT_PER_PAGE),
    width: cardWidth,
    height: cardHeight,
  });
};

const extractCardsFromPages = async (
  pdfAssetMetadata: PdfAssetMetadata,
  pages: any
): Promise<CardMetadata[]> => {
  const {
    filename: pdfFilename,
    startWithSecretFaces,
    emptyCardsCountOnLastPage,
  } = pdfAssetMetadata;

  const assetsDirRelativePath = pdfFilename;
  const pdfCardsAssetsDir = path.join(cardsAssetsDir, assetsDirRelativePath);
  if (!fs.existsSync(pdfCardsAssetsDir)) fs.mkdirSync(pdfCardsAssetsDir);

  const cardCount =
    (pages.length / 2) * CARD_COUNT_PER_PAGE - emptyCardsCountOnLastPage;

  return await Promise.all(
    [...Array(cardCount)].map(
      async (_, cardIndex): Promise<CardMetadata> => {
        const firstInterestingPageIndex =
          Math.floor(cardIndex / CARD_COUNT_PER_PAGE) * 2;

        const pageWithVisibleSide =
          pages[firstInterestingPageIndex + (startWithSecretFaces ? 1 : 0)];
        const pageWithSecretSide =
          pages[firstInterestingPageIndex + (startWithSecretFaces ? 0 : 1)];

        const cardIndexOnFirstPage = cardIndex % CARD_COUNT_PER_PAGE;
        const cardIndexOnSecondPage =
          COLUMN_COUNT_PER_PAGE *
            Math.floor(cardIndexOnFirstPage / COLUMN_COUNT_PER_PAGE) +
          (COLUMN_COUNT_PER_PAGE -
            (cardIndexOnFirstPage % COLUMN_COUNT_PER_PAGE) -
            1);

        const cardIndexOnVisiblePage = startWithSecretFaces
          ? cardIndexOnSecondPage
          : cardIndexOnFirstPage;
        const cardIndexOnSecretPage = startWithSecretFaces
          ? cardIndexOnFirstPage
          : cardIndexOnSecondPage;

        const cardVisibleSide = await getCroppedCardFromPage(
          pageWithVisibleSide,
          cardIndexOnVisiblePage,
          pdfAssetMetadata.marginDetails
        );
        const visibleSideRelativePath = path.join(
          assetsDirRelativePath,
          `${cardIndex}-visible.png`
        );
        const cardVisibleSidePath = path.join(
          cardsAssetsDir,
          visibleSideRelativePath
        );
        await cardVisibleSide.toFile(cardVisibleSidePath);

        const cardSecretSide = await getCroppedCardFromPage(
          pageWithSecretSide,
          cardIndexOnSecretPage,
          pdfAssetMetadata.marginDetails
        );
        const secretSideRelativePath = path.join(
          assetsDirRelativePath,
          `${cardIndex}-secret.png`
        );
        const cardSecretSidePath = path.join(
          cardsAssetsDir,
          secretSideRelativePath
        );
        await cardSecretSide.toFile(cardSecretSidePath);
        console.info(
          `✅ "${pdfFilename}": split card ${cardIndex + 1}/${cardCount}`
        );

        return {
          visibleSidePath: visibleSideRelativePath,
          secretSidePath: secretSideRelativePath,
        };
      }
    )
  );
};

const main = async () => {
  const convertedAssetsMetadata: ConvertedAssetsMetadata[] = await Promise.all(
    allPdfAssetsMetadata.map(async (pdfAssetMetadata) => {
      const pagePaths = await convertPdfToPngPages(pdfAssetMetadata.filename);

      const pages = pagePaths.map((path) => sharp(path));

      const allCards = await extractCardsFromPages(pdfAssetMetadata, pages);

      return {
        scenarioPublicName: pdfAssetMetadata.filename,
        introCards: pdfAssetMetadata.introductionCards.map(
          (introCardIndex) => allCards[introCardIndex]
        ),
        numberedCards: allCards.filter(
          (_, cardIndex) =>
            !pdfAssetMetadata.introductionCards.includes(cardIndex)
        ),
      };
    })
  );

  await fs.promises.writeFile(
    path.join(cardsAssetsDir, "metadata.json"),
    JSON.stringify(convertedAssetsMetadata)
  );
};

main();
