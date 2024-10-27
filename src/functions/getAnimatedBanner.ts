import { createCanvas, loadImage, type Image } from "canvas";
import GIFEncoder from 'gif-encoder-2';

export default function getAnimatedBanner(
  bannerImage: Image,
  dragonStrip: {
    image: Image | null,
    width: number,
    height: number
  }
): Buffer {
  const startTime = performance.now();
  const B_WIDTH = bannerImage.naturalWidth;
  const B_HEIGHT = bannerImage.naturalHeight;
  // TODO: factor out a B_BORDER from border width

  const encoder = new GIFEncoder(B_WIDTH, B_HEIGHT, 'octree');
  encoder.start();
  encoder.setRepeat(0);
  encoder.setDelay(100);
  encoder.setQuality(1);
  const canvas = createCanvas(B_WIDTH, B_HEIGHT);
  const ctx = canvas.getContext('2d');

  if (dragonStrip.image) {
    const yPos = B_HEIGHT - dragonStrip.height - 8;

    if (dragonStrip.width < 106) {
      ctx.drawImage(bannerImage, 0 ,0);
      ctx.drawImage(
        dragonStrip.image, 
        58 - Math.ceil(dragonStrip.width / 2), 
        yPos, 
        dragonStrip.width, 
        dragonStrip.height
      );
      encoder.addFrame(ctx);
    } else {
      for (let i = 1; i <= dragonStrip.width; i+= 2) {
        ctx.drawImage(bannerImage, 0, 0);
        ctx.drawImage(
          dragonStrip.image, 
          i - 1, 0, 106, dragonStrip.height,
          5, yPos, 106, dragonStrip.height
        );
        if (i > dragonStrip.width - 104) {
          ctx.drawImage(
            dragonStrip.image, 
            0, 0, i - (dragonStrip.width - 104), dragonStrip.height,
            dragonStrip.width - i + 7, yPos, i - (dragonStrip.width - 104), dragonStrip.height
          )
        }
        encoder.addFrame(ctx);
      }
    }
  } else {
    ctx.drawImage(bannerImage, 0 ,0);
    encoder.addFrame(ctx);
  }

  encoder.finish();
  const buffer = encoder.out.getData();

  const endTime = performance.now();
  console.log(`animated banner generated in ${endTime - startTime}ms`);
  return buffer;
}