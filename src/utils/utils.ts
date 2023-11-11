export function mapToBrightness(imageData: ImageData): number[][] {
  const mappedImage: number[][] = [];
  const { data, width, height } = imageData;

  const calculateRelativeLuminance = (
    red: number,
    green: number,
    blue: number
  ) => {
    return Math.sqrt(
      0.299 * Math.pow(red, 2) +
        0.587 * Math.pow(green, 2) +
        0.114 * Math.pow(blue, 2)
    );
  };
  for (let row = 0; row < height; row++) {
    mappedImage.push([]);
    for (let col = 0; col < width; col++) {
      // row* width * 4 gets us to the start of the row
      // col * 4 gets us to the specific pixel column
      const red = data[row * width * 4 + col * 4];
      const green = data[row * width * 4 + col * 4 + 1];
      const blue = data[row * width * 4 + col * 4 + 2];
      mappedImage[row].push(calculateRelativeLuminance(red, green, blue));
    }
  }

  return mappedImage;
}
