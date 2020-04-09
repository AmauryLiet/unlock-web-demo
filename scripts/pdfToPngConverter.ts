import PDF2Pic from "pdf2pic";

const LARGER_DIMENSION_SIZE = 600;

const pdf2pic = new PDF2Pic({
  density: 100, // output pixels per inch
  savename: "converted_pdf", // output file name
  savedir: "./assets/pages", // output file location
  format: "png", // output file format
  size: `${LARGER_DIMENSION_SIZE}x${LARGER_DIMENSION_SIZE}`, // output size in pixels
});

pdf2pic
  .convertBulk(`./assets/original/0 - tutorial.pdf`, -1)
  .then((resolve) => {
    console.log("pdf converted successfully!");
  });
