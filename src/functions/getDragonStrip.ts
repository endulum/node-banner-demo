import { loadImage, createCanvas, type Image } from "canvas";

async function getDragonStrip(dragonIds: string[]): Promise<{
  dragonStrip: Image | null,
  width: number,
  height: number
}> {
  if (dragonIds.length === 0) {
    return {
      dragonStrip: null,
      width: 0,
      height: 0
    }
  }
  
  const dragonImages = await Promise.all(
    dragonIds.map(async (dragonId) => { return await loadImage(
      'https://dragcave.net/image/' + dragonId + '.gif'
    )})
  )
  const totalWidth = dragonImages.reduce(
    (acc, curr) => acc + curr.naturalWidth + 1,
    0
  );

  const STRIP_HEIGHT = 48;
  
  const canvas = createCanvas(totalWidth, STRIP_HEIGHT);
  const ctx = canvas.getContext('2d');
  let totalXOffset = 0;
  dragonImages.forEach((dragonImage) => {
    ctx.drawImage(
      dragonImage, 
      totalXOffset, 
      STRIP_HEIGHT - dragonImage.naturalHeight,
      dragonImage.naturalWidth,
      dragonImage.naturalHeight
    );
    totalXOffset += dragonImage.naturalWidth + 1;
  });

  // trying to "flatten" the dragons into a single image to deliver
  const dragonStrip = await loadImage(canvas.toBuffer("image/png"));
  return {
    dragonStrip,
    width: totalWidth,
    height: STRIP_HEIGHT
  }
}

export default getDragonStrip;