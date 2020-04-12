import * as fs from "fs";
import path from "path";
import PDF2Pic from "pdf2pic";
import sharp from "sharp";
import {
  CARD_COUNT_PER_PAGE,
  PDF_HORIZONTAL_MARGIN,
  PDF_VERTICAL_MARGIN,
  allPdfAssetsMetadata,
  PdfAssetMetadata,
  COLUMN_COUNT_PER_PAGE,
  ROW_COUNT_PER_PAGE,
} from "../assets/original";

const assetsDir = path.join(__dirname, "../assets");
const pdfAssetsDir = path.join(assetsDir, "./original");
const pagesAssetsDir = path.join(assetsDir, "./pages");
const cardsAssetsDir = path.join(assetsDir, "./cards");

const LARGER_DIMENSION_SIZE = 1500;

type PagePaths = string[];
type CardMetadata = {
  cardVisibleSidePath: string;
  cardSecretSidePath: string;
};

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

const getCroppedCardFromPage = async (page: any, cardIndex: number) => {
  const { width, height } = await page.metadata();

  const horizontalOffset = Math.round(PDF_HORIZONTAL_MARGIN * width),
    verticalOffset = Math.round(PDF_VERTICAL_MARGIN * height);

  const cardWidth = Math.round(
    (width - 2 * horizontalOffset) / COLUMN_COUNT_PER_PAGE
  );
  const cardHeight = Math.round(
    (height - 2 * verticalOffset) / ROW_COUNT_PER_PAGE
  );

  return page.clone().extract({
    top:
      verticalOffset +
      cardHeight * Math.floor(cardIndex / COLUMN_COUNT_PER_PAGE),
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

  const pdfCardsAssetsDir = path.join(cardsAssetsDir, pdfFilename);
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
          cardIndexOnVisiblePage
        );
        const cardVisibleSidePath = path.join(
          pdfCardsAssetsDir,
          `${cardIndex}-visible.png`
        );
        await cardVisibleSide.toFile(cardVisibleSidePath);

        const cardSecretSide = await getCroppedCardFromPage(
          pageWithSecretSide,
          cardIndexOnSecretPage
        );
        const cardSecretSidePath = path.join(
          pdfCardsAssetsDir,
          `${cardIndex}-secret.png`
        );
        await cardSecretSide.toFile(cardSecretSidePath);
        console.info(
          `✅ "${pdfFilename}": split card ${cardIndex + 1}/${cardCount}`
        );

        return {
          cardVisibleSidePath,
          cardSecretSidePath,
        };
      }
    )
  );
};

const main = async () => {
  const convertedAssetsMetadata = await Promise.all(
    allPdfAssetsMetadata.map(async (pdfAssetMetadata) => {
      const pagePaths = await convertPdfToPngPages(pdfAssetMetadata.filename);

      const pages = pagePaths.map((path) => sharp(path));

      return await extractCardsFromPages(pdfAssetMetadata, pages);
    })
  );
};

main();
