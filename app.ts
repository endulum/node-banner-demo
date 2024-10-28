import express from "express";
import asyncHandler from "express-async-handler"
import dotenv from 'dotenv';
import errorHandler from './src/middleware/errorHandler'

import sharp from "sharp";
import path from 'path';
import fs from 'fs/promises';

import getDragons from './src/functions/getDragons';
import getDragonStrip from './src/functions/getDragonStrip';
import getBanner from './src/functions/getBanner';
import getAnimatedBanner from './src/functions/getAnimatedBanner';

dotenv.config({ path: '.env' });

const app = express();
app.use(express.json())
app.use(express.urlencoded({ extended: true }));

app.get('/textdemo', asyncHandler(async (req, res) => {
  // goal: create text
  const text = 'no eggs here. go home.';
  
  const svgText = `<svg>
      <style>
        text { 
          font: 16px Alkhemikal;
          filter: drop-shadow(1px 1px 0px rgba(0, 0, 0, 0.25));
        }
      </style>
      <text x="0%" y="9" fill="white" text-anchor="left">
        ${text}
      </text>
    </svg>`;

  const bannerPath = path.join(__dirname, `/banner.png`);

  const svgBuffer = Buffer.from(svgText);
  const svgImage = sharp(svgBuffer).png()
  const metadata = await svgImage.metadata();
  console.log(metadata);
  const bannerBuffer = await sharp(path.join(__dirname, '/banner.png'))
    .png()
    .composite([
      { input: await svgImage.toBuffer(), top: 25, left: 125 },
    ])
    .toBuffer()
  res.contentType('image/png');
  res.send(bannerBuffer);
}))

app.get('/demo', asyncHandler(async (req, res) => {
  try {
    const startTime = performance.now();
    // for here, we'll just yoink the scrollname from the query
    const { scrollName } = req.query as Record<string, string | null>;

    // first, we need information, which is what we'll hit APIs for.
    // hit the DC API for dragon info
    const { 
      success, dragonCount, growingCount, dragonIds 
    } = await getDragons(scrollName ?? '');
    if (!success) throw new Error('scroll not found');

    // then, hit the hatchery API for click and flair info
    // TODO: that
    const SAMPLE_WCLICKS = 12345
    const SAMPLE_ACLICKS = 123456
    const SAMPLE_FLAIR = 'saxifrage'

    // place gathered information on the banner
    const bannerBuffer = await getBanner(
      scrollName as string,
      SAMPLE_FLAIR,
      dragonCount.toLocaleString(),
      growingCount.toLocaleString(),
      SAMPLE_WCLICKS.toLocaleString(),
      SAMPLE_ACLICKS.toLocaleString()
      // prefer using toLocaleString for commas
    );

    // convert growing IDs to a strip of images
    const { stripBuffer, stripWidth, stripHeight } = await getDragonStrip(dragonIds);

    // combine banner and strip into animated banner
    const animatedBannerBuffer = await getAnimatedBanner(
      bannerBuffer,
      stripBuffer,
      stripWidth,
      stripHeight
    );

    const endTime = performance.now();
    console.log(`total time: ${endTime - startTime}ms`)
    res.contentType('image/gif');
    res.send(animatedBannerBuffer);
  } catch(e) {
    console.error(e);
    const buffer = await fs.readFile(path.join(__dirname, 'notfound.webp'));
    res.contentType('image/webp');
    res.send(buffer);
  }
}))

app.use('*', asyncHandler(async (_req, res) => {
  res.sendStatus(404)
}))

app.use(errorHandler)

app.listen(process.env.PORT || 3000, () => console.log('ready'));