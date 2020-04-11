import * as fs from "fs";
import path from "path";
import PDF2Pic from "pdf2pic";
import sharp from "sharp";
import {
  PDF_HORIZONTAL_MARGIN,
  PDF_VERTICAL_MARGIN,
  pdfAssetsMetadata,
} from "../assets/original";

const assetsDir = path.join(__dirname, "../assets");
const pdfAssetsDir = path.join(assetsDir, "./original");
const pagesAssetsDir = path.join(assetsDir, "./pages");
const cardsAssetsDir = path.join(assetsDir, "./cards");

const LARGER_DIMENSION_SIZE = 1500;

interface PageAssetsMetadata {
  name: string;
  emptyCardsCountOnLastPage: number;
  pagesPaths: string[];
}

pdfAssetsMetadata.forEach(
  async ({ filename: pdfFilename, emptyCardsCountOnLastPage }) => {
    const pdf2pic = new PDF2Pic({
      density: 100, // output pixels per inch
      savename: pdfFilename, // output file name
      savedir: pagesAssetsDir, // output file location
      format: "png", // output file format
      size: `${LARGER_DIMENSION_SIZE}x${LARGER_DIMENSION_SIZE}`, // output size in pixels
    });

    let pageAssetsMetadata: PageAssetsMetadata;
    try {
      const conversionResults = await pdf2pic.convertBulk(
        path.join(pdfAssetsDir, `${pdfFilename}.pdf`),
        -1
      );
      console.info(`✅ pdf "${pdfFilename}" successfully converted in png`);

      pageAssetsMetadata = {
        name: pdfFilename,
        emptyCardsCountOnLastPage,
        pagesPaths: conversionResults.map((result) => result.path),
      };
    } catch (error) {
      console.error(`cannot convert pdf>png for file "${pdfFilename}":`, error);
      return;
    }

    const pdfCardsAssetsDir = path.join(cardsAssetsDir, pdfFilename);

    if (!fs.existsSync(pdfCardsAssetsDir)) fs.mkdirSync(pdfCardsAssetsDir);

    pageAssetsMetadata.pagesPaths.map(async (pagePath, index) => {
      const page = sharp(pagePath);
      const { width, height } = await page.metadata();

      const top = Math.round(PDF_VERTICAL_MARGIN * height),
        left = Math.round(PDF_HORIZONTAL_MARGIN * width);
      await page
        .extract({
          left,
          top,
          width: width - 2 * left,
          height: height - 2 * top,
        })
        .toFile(path.join(pdfCardsAssetsDir, "output.png"));
    });
  }
);
