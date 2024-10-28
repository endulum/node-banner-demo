// import { loadImage, createCanvas } from "canvas";
import sharp from 'sharp';
import path from 'path';

async function makeSvg(text: string, textProperties: string): Promise<{
  svgBuffer: Buffer,
  svgWidth: number
}> {
  const svgBuffer = Buffer.from(`<svg dominant-baseline="hanging">
    <text ${textProperties}>
      ${text}
    </text>
  </svg>`);

  const svgImage = sharp(svgBuffer).png();
  const metadata = await svgImage.metadata();
  return { svgBuffer, svgWidth: metadata.width ?? 0 }
}

async function makeStat(statName: string, statNumber: string): Promise<Buffer> {
  const {
    svgBuffer: statBuffer,
    svgWidth: statWidth
  } = await makeSvg(`
    <tspan fill="#dff6f5">${statName}</tspan>
    <tspan fill="#f2bd59">${statNumber}</tspan>
  `,`
    y="7"
    fill="#dff6f5"
    style="
      font: 8px Nokia Cellphone FC;
      filter: drop-shadow(1px 1px 0px rgba(0, 0, 0, 0.25));"
  `)
  return statBuffer;
}

async function getBanner(
  scrollName: string, 
  flair: string, 
  dragons: string, 
  growing: string, 
  weeklyClicks: string, 
  allTimeClicks: string
): Promise<Buffer> {
  const bannerPath = path.join(__dirname, `/../../banner.png`);

  // scrollname
  const { 
    svgBuffer: scrollNameBuffer, 
    svgWidth: scrollNameWidth
  } = await makeSvg(scrollName, `
    y="10"
    fill="#dff6f5"
    style="
      font: 16px Alkhemikal;
      filter: drop-shadow(1px 1px 0px rgba(0, 0, 0, 0.25));"
  `);

  // flair
  const flairPath = path.join(__dirname, `../../flair/${flair}.png`);
  const flairImage = sharp(flairPath)
    .greyscale()
    .threshold(255)
    .composite([{
      input: Buffer.from([255,255,255,Math.ceil(255 / 5)]),
      raw: {
        width: 1,
        height: 1,
        channels: 4
      },
      tile: true,
      blend: 'dest-in'
    }, { input: flairPath, left: -1, top: -1 }, ])
    .png();
  const flairMetadata = await flairImage.metadata();
  const flairBuffer = await flairImage.toBuffer();
  console.log(flairMetadata.height);

  // stats
  const statBuffers = {
    dragons: await makeStat('Dragons:', dragons),
    growing: await makeStat('Growing:', growing),
    weeklyClicks: await makeStat('Weekly Clicks:', weeklyClicks),
    allTimeClicks: await makeStat('All-Time Clicks:', allTimeClicks)
  }

  const bannerBuffer = await sharp(bannerPath)
    .png()
    .composite([
      { input: scrollNameBuffer, top: 12, left: 118 },
      { 
        input: flairBuffer, 
        top: 17 - Math.floor((flairMetadata.height ?? 0) / 2),
        left: 118 + scrollNameWidth + 4 
      },
      { input: statBuffers.dragons, top: 30, left: 118 },
      { input: statBuffers.growing, top: 43, left: 118 },
      { input: statBuffers.weeklyClicks, top: 30, left: 200 },
      { input: statBuffers.allTimeClicks, top: 43, left: 200 },
    ])
    .toBuffer()

  return bannerBuffer
}

export default getBanner