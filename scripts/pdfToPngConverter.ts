import PDF2Pic from "pdf2pic";
import { pdfAssetsMetadata } from "../assets/original";

const LARGER_DIMENSION_SIZE = 600;

pdfAssetsMetadata.map(async ({ filename, emptyCardsCountOnLastPage }) => {
  const pdf2pic = new PDF2Pic({
    density: 100, // output pixels per inch
    savename: filename, // output file name
    savedir: "./assets/pages", // output file location
    format: "png", // output file format
    size: `${LARGER_DIMENSION_SIZE}x${LARGER_DIMENSION_SIZE}`, // output size in pixels
  });

  pdf2pic
    .convertBulk(`./assets/original/${filename}.pdf`, -1)
    .then((resolve) => {
      console.log("pdf converted successfully!");
    })
    .catch((error) => {
      console.error(`cannot convert pdf>png for file "${filename}":`, error);
    });
});
