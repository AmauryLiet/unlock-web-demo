import path from "path";
import PDF2Pic from "pdf2pic";
import { pdfAssetsMetadata } from "../assets/original";

const assetsDir = path.join(__dirname, "../assets");
const pdfAssetsDir = path.join(assetsDir, "./original");
const pagesAssetsDir = path.join(assetsDir, "./pages");

const LARGER_DIMENSION_SIZE = 1500;

interface PageAssetsMetadata {
  name: string;
  emptyCardsCountOnLastPage: number;
  pagesPaths: string[];
}

pdfAssetsMetadata.forEach(async ({ filename, emptyCardsCountOnLastPage }) => {
  const pdf2pic = new PDF2Pic({
    density: 100, // output pixels per inch
    savename: filename, // output file name
    savedir: pagesAssetsDir, // output file location
    format: "png", // output file format
    size: `${LARGER_DIMENSION_SIZE}x${LARGER_DIMENSION_SIZE}`, // output size in pixels
  });

  let pageAssetsMetadata: PageAssetsMetadata;
  try {
    const conversionResults = await pdf2pic.convertBulk(
      path.join(pdfAssetsDir, `${filename}.pdf`),
      -1
    );
    console.info(`✅ pdf "${filename}" successfully converted in png`);

    pageAssetsMetadata = {
      name: filename,
      emptyCardsCountOnLastPage,
      pagesPaths: conversionResults.map((result) => result.path),
    };
  } catch (error) {
    console.error(`cannot convert pdf>png for file "${filename}":`, error);
    return;
  }
});
