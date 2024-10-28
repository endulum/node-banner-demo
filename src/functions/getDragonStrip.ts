// import { loadImage, createCanvas, type Image } from "canvas";

import sharp from "sharp";

async function getDragonStrip(dragonIds: string[]) {
  const dragonImages = await Promise.all(
    dragonIds.map(async (dragonId) => {
      const response = await fetch(
        `https://dragcave.net/image/${dragonId}.gif`
      )
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const image = sharp(buffer);
      return image;
    })
  );

  const dragonMetadatas = await Promise.all(
    dragonImages.map((dragonImage) => dragonImage.metadata())
  );

  const totalWidth = dragonMetadatas.reduce(
    (acc, curr) => acc + (curr.width ?? 0) + 1,
    0
  )

  const STRIP_HEIGHT = 50;

  let compositeImage = sharp({
    create: {
      width: totalWidth,
      height: STRIP_HEIGHT,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  });

  let totalXOffset = 0;
  const composites: sharp.OverlayOptions[] = [];
  for (let i = 0; i < dragonImages.length; i++) {
    const dragonImage = dragonImages[i];
    const dragonMetadata = dragonMetadatas[i];
    const xOffset = totalXOffset;
    const yOffset = STRIP_HEIGHT - (dragonMetadata.height ?? 0);
    composites.push({
      input: await dragonImage.toBuffer(),
      left: xOffset,
      top: yOffset
    });
    totalXOffset += (dragonMetadata.width ?? 0) + 1;
  }

  compositeImage = compositeImage.composite(composites);

  return {
    stripBuffer: await compositeImage.png().toBuffer(),
    stripWidth: totalWidth,
    stripHeight: STRIP_HEIGHT
  }
}

export default getDragonStrip;