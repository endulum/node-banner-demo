import { loadImage, createCanvas, type Image } from "canvas";

async function getDragonStrip(dragonIds: string[]): Promise<{
  dragonStrip: Image,
  width: number,
  height: number
}> {
  const dragonImages = await Promise.all(
    dragonIds.map(async (dragonId) => { return await loadImage(
      'https://dragcave.net/image/' + dragonId + '.gif'
    )})
  )
  const totalWidth = dragonImages.reduce(
    (acc, curr) => acc + curr.naturalWidth + 1,
    0
  );
  const maxHeight = Math.max(...dragonImages.map(dragon => dragon.naturalHeight))
  
  const canvas = createCanvas(totalWidth, maxHeight);
  const ctx = canvas.getContext('2d');
  let totalXOffset = 0;
  dragonImages.forEach((dragonImage) => {
    ctx.drawImage(
      dragonImage, 
      totalXOffset, 
      maxHeight - dragonImage.naturalHeight,
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
    height: maxHeight
  }
}

export default getDragonStrip;