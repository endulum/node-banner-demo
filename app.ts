import express from "express";
import asyncHandler from "express-async-handler"
import dotenv from 'dotenv';
import errorHandler from './src/middleware/errorHandler'
import { createCanvas, loadImage } from "canvas";
import GIFEncoder from 'gifencoder';
import path from 'path';

import getDragons from './src/functions/getDragons';
import getDragonStrip from './src/functions/getDragonStrip';
import getBanner from './src/functions/getBanner';

dotenv.config({ path: '.env' });

const app = express();
app.use(express.json())
app.use(express.urlencoded({ extended: true }));



app.get('/textdemo.gif', asyncHandler(async (req, res) => {
  const { scrollname, flair, dragons, growing, weeklyClicks, allTimeClicks } = req.query;
  const bannerImage = await getBanner(scrollname as string, flair as string, dragons as string, growing as string, weeklyClicks as string, allTimeClicks as string);
  
  const dragonIds = await getDragons(scrollname as string)
  const { dragonStrip, width, height } = await getDragonStrip(
    [...dragonIds.slice(0, 5)]
  );

  const B_WIDTH = 327;
  const B_HEIGHT = 61;

  const encoder = new GIFEncoder(B_WIDTH, B_HEIGHT);
  encoder.start();
  encoder.setRepeat(0);
  encoder.setDelay(100);
  encoder.setQuality(0);
  const canvas = createCanvas(B_WIDTH, B_HEIGHT);
  const ctx = canvas.getContext('2d');

  const yPos = B_HEIGHT - height - 8;

  if (width < 106) {
    ctx.drawImage(bannerImage, 0 ,0);
    ctx.drawImage(dragonStrip, 58 - Math.ceil(width / 2), yPos, width, height);
    encoder.addFrame(ctx);
  } else {
    for (let i = 1; i <= width; i+= 2) {
      ctx.drawImage(bannerImage, 0, 0);
      ctx.drawImage(
        dragonStrip, 
        i - 1, 0, 106, height,
        5, yPos, 106, height
      );
      if (i > width - 104) {
        ctx.drawImage(
          dragonStrip, 
          0, 0, i - (width - 104), height,
          width - i + 7, yPos, i - (width - 104), height
        )
      }
      encoder.addFrame(ctx);
    }
  }

  encoder.finish();
  const buffer = encoder.out.getData()
  res.contentType('image/gif');
  res.send(buffer);
}));

app.get('/me', asyncHandler(async (req, res) => {
  console.log(process.env.CURRENT_TOKEN);
  const response = await fetch('https://dragcave.net/api/v2/me', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${process.env.CURRENT_TOKEN ?? ''}`
    }
  });
  if (!response.ok) {
    console.log(response)
    throw new Error(response.statusText);
  } else {
    const json = await response.json()
    res.json(json);
  }
}))

app.get('/dragons', asyncHandler(async (req, res) => {
  if (process.env.DC_API_ENDPOINT === undefined)
    throw new Error('Endpoint is missing.')
  const response = await fetch(process.env.DC_API_ENDPOINT, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${process.env.DC_API_KEY ?? ''}`
    }
  });
  if (!response.ok) {
    console.log(response)
    throw new Error(response.statusText);
  } else {
    const json = await response.json()
    res.json(json);
  }
}))

// DEMO: get growing things on a scroll and put them into a carousel
app.get('/dragons.gif', asyncHandler(async (req, res) => {
  const dragonIds = await getDragons(req.params.scrollName)
  const { dragonStrip, width, height } = await getDragonStrip(dragonIds);

  const B_WIDTH = 150;
  const B_HEIGHT = 50;

  const encoder = new GIFEncoder(B_WIDTH, B_HEIGHT);
  encoder.start();
  encoder.setRepeat(0);
  encoder.setDelay(100);
  encoder.setQuality(1);
  const canvas = createCanvas(B_WIDTH, B_HEIGHT);
  const ctx = canvas.getContext('2d');

  for (let i = 1; i <= width; i+= 2) {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, B_WIDTH, B_HEIGHT);
    if (i >= 1 && i <= B_WIDTH) {
      ctx.drawImage(
        dragonStrip, -i, B_HEIGHT - height, width, height
      );
      encoder.addFrame(ctx);
    } else {
      ctx.drawImage(dragonStrip, -i, B_HEIGHT - height, width, height);
      ctx.drawImage(dragonStrip, width - i, B_HEIGHT - height, width, height);
      encoder.addFrame(ctx);
    }
  }

  encoder.finish();
  const buffer = encoder.out.getData()
  res.contentType('image/gif');
  res.send(buffer);
}))

// hook up any routes here.

app.use('*', asyncHandler(async (_req, res) => {
  res.sendStatus(404)
}))

app.use(errorHandler)

app.listen(process.env.PORT || 3000);