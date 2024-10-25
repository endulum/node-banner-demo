import { loadImage, createCanvas } from "canvas";
import path from 'path';

async function getBanner(
  scrollname: string, 
  flair: string, 
  dragons: string, 
  growing: string, 
  weeklyClicks: string, 
  allTimeClicks: string
) {
  const WIDTH = 327;
  const HEIGHT = 61;
  const WHITE = '#dff6f5';
  const bannerBG = await loadImage(path.join(__dirname, `/../../banner.png`));

  // place the banner bg
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(bannerBG, 0, 0);

  function setTextAndShadow(fill: string, font: string) {
    ctx.shadowColor = "rgba(0, 0, 0, 0.25)";
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;
    ctx.fillStyle = fill;
    ctx.font = font;
  }

  // the scrollname and flair
  const actualScrollName = scrollname?.toString() ?? 'Scroll Name'
  setTextAndShadow(WHITE, '16px "Alkhemikal"');
  ctx.fillText(actualScrollName, 118, 23);

  const flairFilePath = path.join(__dirname, `/../../flair/${flair as string}.png`)
  try {
    const { width } = ctx.measureText(actualScrollName);
    const flairImage = await loadImage(flairFilePath);
    ctx.drawImage(flairImage, width + 123, 16 - Math.floor(flairImage.height / 2));
  } catch(e) {
    if ((e as { code: string }).code === 'ENOENT') 
      console.log('flair probably doesnt exist');
    else console.error(e)
  }

  function setStat(statName: string, statValue: string, xPos: number, yPos: number) {
    setTextAndShadow(WHITE, '8px Nokia Cellphone FC');
    ctx.fillText(statName + ':', xPos, yPos);
    let { width } = ctx.measureText(statName);
    ctx.fillStyle = '#f2bd59';
    ctx.fillText(statValue, xPos + width + 5, yPos)
  }

  // the stats
  setStat('Dragons', dragons as string ?? '0', 118, 37);
  setStat('Growing', growing as string ?? '0', 118, 48);
  setStat('Weekly Clicks', weeklyClicks as string ?? '0', 118 + 85, 37);
  setStat('All-Time Clicks', allTimeClicks as string ?? '0', 118 + 85, 48);

  const bannerImage = await loadImage(canvas.toBuffer("image/png"));
  return bannerImage
}

export default getBanner