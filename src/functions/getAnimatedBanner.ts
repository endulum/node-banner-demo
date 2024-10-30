import sharp from 'sharp';
import GIF from 'sharp-gif2';

export default async function getAnimatedBanner(
  bannerBuffer: Buffer,
  stripBuffer: Buffer,
  stripWidth: number,
  stripHeight: number,
): Promise<Buffer> {
  //console.log({stripWidth, stripHeight});
  const BANNER_WIDTH = 106;
  const BANNER_HEIGHT = 50;
  const startTime = performance.now();

  const frames: sharp.Sharp[] = [];

  if (stripWidth < BANNER_WIDTH) {
    const frame = sharp({
      create: {
        width: 327,
        height: 61,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      }
    });
    const composites: sharp.OverlayOptions[] = [
      {
        input: bannerBuffer,
        top: 0,
        left: 0
      },
      {
        input: stripBuffer,
        top: 4,
        left: Math.floor(BANNER_WIDTH / 2) - Math.floor(stripWidth / 2) + 5
      }
    ];
    const composedFrame = await frame.composite(composites).png().toBuffer();
      frames.push(sharp(composedFrame))
  } else {
    console.log(`expecting ${stripWidth} frames`);
    for (let i = 2; i <= stripWidth; i += 2) {
      const cropX = i % stripWidth;
      // what is this...?
      const cropWidth = Math.min(BANNER_WIDTH, stripWidth - cropX);
      //console.log({ cropX, cropWidth })
      
      if (cropX >= stripWidth || cropWidth <= 0) {
        console.error(`Invalid crop area: ${cropX} ${cropWidth}`);
        continue;
      }
  
      const croppedStrip = sharp(stripBuffer).extract({
        left: cropX,
        top: 0,
        width: cropWidth,
        height: stripHeight
      });
  
      const frame = sharp({
        create: {
          width: 327,
          height: 61,
          channels: 4,
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        }
      });
  
      const composites: sharp.OverlayOptions[] = [
        {
          input: bannerBuffer,
          top: 0,
          left: 0
        },
        {
          input: await croppedStrip.toBuffer(),
          top: 4,
          left: 5
        }
      ];
  
      if (cropWidth < BANNER_WIDTH) {
        const overflowWidth = BANNER_WIDTH - cropWidth;
        const overflowStripWidth = Math.min(overflowWidth, stripWidth);
        const overflowStrip = sharp(stripBuffer).extract({
          left: 0,
          top: 0,
          width: overflowStripWidth,
          height: BANNER_HEIGHT
        });
        composites.push({
          input: await overflowStrip.toBuffer(),
          top: 4,
          left: cropWidth + 5
        })
      }
      const composedFrame = await frame.composite(composites).png().toBuffer();
      frames.push(sharp(composedFrame))
    }
  }

  const gif = await GIF.createGif({
    delay: 100,
    repeat: 0,
    format: 'rgb444',
  }).addFrame(frames).toSharp();

  const webpBuffer = await sharp(await gif.toBuffer(), { animated: true })
    .webp()
    .toBuffer()

  const endTime = performance.now();
  console.log(`Banner animation generated in ${endTime - startTime}ms`)
  return webpBuffer;
  // todo: understand this
}