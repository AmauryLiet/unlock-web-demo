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

const loadPagesAndMetadata = async (pagePaths: PagePaths) => {
  const pages = pagePaths.map((path) => sharp(path));
  // ⚠️ assumption: all pages have the same width & height
  const { width, height } = await pages[0].metadata();

  return {
    pages,
    width,
    height,
  };
};

const getCroppedCardFromPage = (
  page: any,
  pageWidth: number,
  pageHeight: number,
  cardIndex: number
) => {
  const horizontalOffset = Math.round(PDF_HORIZONTAL_MARGIN * pageWidth),
    verticalOffset = Math.round(PDF_VERTICAL_MARGIN * pageHeight);

  const cardWidth = Math.round((pageWidth - 2 * horizontalOffset) / 3);
  const cardHeight = Math.round((pageHeight - 2 * verticalOffset) / 2);

  return page.clone().extract({
    top: verticalOffset + cardHeight * Math.floor(cardIndex / 3),
    left: horizontalOffset + cardWidth * Math.floor(cardIndex % 3),
    width: cardWidth,
    height: cardHeight,
  });
};

const extractCardsFromPages = async (
  pdfAssetMetadata: PdfAssetMetadata,
  pages: any,
  pageWidth: number,
  pageHeight: number
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

      await getCroppedCardFromPage(
        pageWithVisibleSide,
        pageWidth,
        pageHeight,
        cardIndexOnVisiblePage
      ).toFile(path.join(pdfCardsAssetsDir, `${cardIndex}-visible.png`));

      await getCroppedCardFromPage(
        pageWithSecretSide,
        pageWidth,
        pageHeight,
        cardIndexOnSecretPage
      ).toFile(path.join(pdfCardsAssetsDir, `${cardIndex}-secret.png`));
      console.info(
        `✅ "${pdfFilename}": split card ${cardIndex + 1}/${cardCount}`
      );
    })
  );

  return [];
};

allPdfAssetsMetadata.forEach(async (pdfAssetMetadata) => {
  const pagePaths = await convertPdfToPngPages(pdfAssetMetadata.filename);

  const {
    pages,
    width: pageWidth,
    height: pageHeight,
  } = await loadPagesAndMetadata(pagePaths);

  await extractCardsFromPages(pdfAssetMetadata, pages, pageWidth, pageHeight);
});
