import * as fs from "fs";
import path from "path";
import PDF2Pic from "pdf2pic";
import sharp from "sharp";
import {
  CARDS_PER_PAGE,
  PDF_HORIZONTAL_MARGIN,
  PDF_VERTICAL_MARGIN,
  allPdfAssetsMetadata,
  PdfAssetMetadata,
} from "../assets/original";

const assetsDir = path.join(__dirname, "../assets");
const pdfAssetsDir = path.join(assetsDir, "./original");
const pagesAssetsDir = path.join(assetsDir, "./pages");
const cardsAssetsDir = path.join(assetsDir, "./cards");

const LARGER_DIMENSION_SIZE = 1500;

type PagePaths = string[];
type CardsMetadata = Array<{
  pathVisibleSide: string;
  pathHiddenSide: string;
}>;

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

const loadPages = async (pagePaths: PagePaths) => {
  return pagePaths.map((path) => sharp(path));
};

const getCroppedCardFromPage = async (page: any, cardIndex: number) => {
  const { width, height } = await page.metadata();

  const horizontalOffset = Math.round(PDF_HORIZONTAL_MARGIN * width),
    verticalOffset = Math.round(PDF_VERTICAL_MARGIN * height);

  const cardWidth = Math.round((width - 2 * horizontalOffset) / 3);
  const cardHeight = Math.round((height - 2 * verticalOffset) / 2);

  return page.clone().extract({
    top: verticalOffset + cardHeight * Math.floor(cardIndex / 3),
    left: horizontalOffset + cardWidth * Math.floor(cardIndex % 3),
    width: cardWidth,
    height: cardHeight,
  });
};

const extractCardsFromPages = async (
  pdfAssetMetadata: PdfAssetMetadata,
  pages: any
): Promise<CardsMetadata> => {
  const { filename: pdfFilename, startWithSecretFaces } = pdfAssetMetadata;

  const pdfCardsAssetsDir = path.join(cardsAssetsDir, pdfFilename);
  if (!fs.existsSync(pdfCardsAssetsDir)) fs.mkdirSync(pdfCardsAssetsDir);

  const cardCount = (pages.length / 2) * CARDS_PER_PAGE;

  await Promise.all(
    [...Array(cardCount)].map(async (_, cardIndex) => {
      const firstInterestingPageIndex =
        Math.floor(cardIndex / CARDS_PER_PAGE) * 2;

      const pageWithVisibleSide =
        pages[firstInterestingPageIndex + (startWithSecretFaces ? 1 : 0)];
      const pageWithSecretSide =
        pages[firstInterestingPageIndex + (startWithSecretFaces ? 0 : 1)];

      const cardIndexOnFirstPage = cardIndex % CARDS_PER_PAGE;
      const cardIndexOnSecondPage =
        Math.floor(cardIndexOnFirstPage / 3) * 3 +
        (2 - (cardIndexOnFirstPage % 3));

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
      await cardVisibleSide.toFile(
        path.join(pdfCardsAssetsDir, `${cardIndex}-visible.png`)
      );

      const cardSecretSide = await getCroppedCardFromPage(
        pageWithSecretSide,
        cardIndexOnSecretPage
      );
      await cardSecretSide.toFile(
        path.join(pdfCardsAssetsDir, `${cardIndex}-secret.png`)
      );
      console.info(
        `✅ "${pdfFilename}": split card ${cardIndex + 1}/${cardCount}`
      );
    })
  );

  return [];
};

allPdfAssetsMetadata.forEach(async (pdfAssetMetadata) => {
  const pagePaths = await convertPdfToPngPages(pdfAssetMetadata.filename);

  const pages = await loadPages(pagePaths);

  await extractCardsFromPages(pdfAssetMetadata, pages);
});
