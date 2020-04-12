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

const extractCardsFromPages = async (
  pdfAssetMetadata: PdfAssetMetadata,
  pagePaths: string[]
): Promise<CardsMetadata> => {
  const { filename: pdfFilename, startWithSecretFaces } = pdfAssetMetadata;

  const pdfCardsAssetsDir = path.join(cardsAssetsDir, pdfFilename);

  if (!fs.existsSync(pdfCardsAssetsDir)) fs.mkdirSync(pdfCardsAssetsDir);

  const doublePageCount = pagePaths.length / 2;

  await Promise.all(
    [...Array(doublePageCount)].map(async (_, doublePageIndex) => {
      const consideredPagesPath = pagePaths
        .slice(doublePageIndex * 2)
        .slice(0, 2);
      const [visibleSidePagePath, secretSidePagePath] = startWithSecretFaces
        ? consideredPagesPath.reverse()
        : consideredPagesPath;

      const visibleSidePage = sharp(visibleSidePagePath);
      const hiddenSidePage = sharp(secretSidePagePath);

      const {
        width: rawWidth,
        height: rawHeight,
      } = await visibleSidePage.metadata();
      const horizontalOffset = Math.round(PDF_HORIZONTAL_MARGIN * rawWidth),
        verticalOffset = Math.round(PDF_VERTICAL_MARGIN * rawHeight);

      const pageHorizontalUnit = Math.round(
        (rawWidth - 2 * horizontalOffset) / 3
      );
      const pageVerticalUnit = Math.round((rawHeight - 2 * verticalOffset) / 2);

      await Promise.all(
        [...Array(CARDS_PER_PAGE)].map(async (_, cardIndexOnPage) => {
          const cardGlobalIndex =
            doublePageIndex * CARDS_PER_PAGE + cardIndexOnPage;

          await visibleSidePage
            .clone()
            .extract({
              top:
                verticalOffset +
                pageVerticalUnit * Math.floor(cardIndexOnPage / 3),
              left:
                horizontalOffset +
                pageHorizontalUnit * Math.floor(cardIndexOnPage % 3),
              width: pageHorizontalUnit,
              height: pageVerticalUnit,
            })
            .toFile(
              path.join(pdfCardsAssetsDir, `${cardGlobalIndex}-visible.png`)
            );
        })
      );

      await Promise.all(
        [...Array(CARDS_PER_PAGE)].map(async (_, cardIndexOnPage) => {
          const cardIndexOnPageOfVisibleEquivalent =
            Math.floor(cardIndexOnPage / 3) * 3 + (2 - (cardIndexOnPage % 3));

          const cardGlobalIndex =
            doublePageIndex * CARDS_PER_PAGE +
            cardIndexOnPageOfVisibleEquivalent;

          await hiddenSidePage
            .clone()
            .extract({
              top:
                verticalOffset +
                pageVerticalUnit * Math.floor(cardIndexOnPage / 3),
              left:
                horizontalOffset +
                pageHorizontalUnit * Math.floor(cardIndexOnPage % 3),
              width: pageHorizontalUnit,
              height: pageVerticalUnit,
            })
            .toFile(
              path.join(pdfCardsAssetsDir, `${cardGlobalIndex}-secret.png`)
            );
        })
      );

      console.info(
        `✅ "${pdfFilename}": split all cards pages ${doublePageIndex * 2} & ${
          doublePageIndex * 2 + 1
        }`
      );
    })
  );

  return [];
};

allPdfAssetsMetadata.forEach(async (pdfAssetMetadata) => {
  const pagePaths = await convertPdfToPngPages(pdfAssetMetadata.filename);

  await extractCardsFromPages(pdfAssetMetadata, pagePaths);
});
