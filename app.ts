import express from "express";
import asyncHandler from "express-async-handler"
import dotenv from 'dotenv';
import errorHandler from './src/middleware/errorHandler'
import { createCanvas } from "canvas";
import GIFEncoder from 'gifencoder';

import getDragons from './src/functions/getDragons';
import getDragonStrip from './src/functions/getDragonStrip';

dotenv.config({ path: '.env' });

const app = express();
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// DEMO: get growing things on a scroll and put them into a carousel
app.get('/dragons/:scrollName.gif', asyncHandler(async (req, res) => {
  const dragonIds = await getDragons(req.params.scrollName)
  const { dragonStrip, width, height } = await getDragonStrip(dragonIds);

  const BANNERWIDTH = 150;
  const BANNERHEIGHT = 50;

  const encoder = new GIFEncoder(BANNERWIDTH, BANNERHEIGHT);
  encoder.start();
  encoder.setRepeat(0);
  encoder.setDelay(100);
  encoder.setQuality(1);
  const canvas = createCanvas(BANNERWIDTH, BANNERHEIGHT);
  const ctx = canvas.getContext('2d');

  for (let i = 1; i <= width; i+= 2) {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, BANNERWIDTH, BANNERHEIGHT);
    if (i >= 1 && i <= BANNERWIDTH) {
      ctx.drawImage(dragonStrip, -i, BANNERHEIGHT - height, width, height);
      encoder.addFrame(ctx);
    } else {
      ctx.drawImage(dragonStrip, -i, BANNERHEIGHT - height, width, height);
      ctx.drawImage(dragonStrip, width - i, BANNERHEIGHT - height, width, height);
      encoder.addFrame(ctx);
    }
  }

  encoder.finish();
  const buffer = encoder.out.getData()
  res.contentType('image/gif');
  res.send(buffer);
}))

// DEMO: just make an image
app.get('/image.png', asyncHandler(async (_req, res) => {
  const WIDTH = 100;
  const HEIGHT = 100;

  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = "#222222";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  ctx.fillStyle = "#f2f2f2";
  ctx.font = "32px Arial";
  ctx.fillText("owo?", 13, 35);

  const buffer = canvas.toBuffer("image/png");
  res.contentType('image/png');
  res.send(buffer);
}))

// DEMO: make a gif, square of three alternating colors
app.get('/image.gif', asyncHandler(async (_req, res) => {
  const WIDTH = 100;
  const HEIGHT = 100;

  const encoder = new GIFEncoder(WIDTH, HEIGHT);
  encoder.start();
  encoder.setRepeat(0);   // 0 for repeat, -1 for no-repeat
  encoder.setDelay(500);  // frame delay in ms
  encoder.setQuality(10); // image quality. 10 is default.

  // use node-canvas
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext('2d');

  // red rectangle
  ctx.fillStyle = '#ff0000';
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  encoder.addFrame(ctx);

  // green rectangle
  ctx.fillStyle = '#00ff00';
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  encoder.addFrame(ctx);

  // blue rectangle
  ctx.fillStyle = '#0000ff';
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  encoder.addFrame(ctx);

  encoder.finish();
  const buffer = encoder.out.getData()
  res.contentType('image/gif');
  res.send(buffer);
}))

// DEMO: make a gif, carousel of a red square and blue square.
app.get('/slide.gif', asyncHandler(async (_req, res) => {
  const WIDTH = 100;
  const HEIGHT = 100;

  const encoder = new GIFEncoder(WIDTH, HEIGHT);
  encoder.start();
  encoder.setRepeat(0);
  encoder.setDelay(50);
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext('2d');

  for (let i = 1; i <= WIDTH; i++) {
    if (i === 1 || i === WIDTH) {
      ctx.fillStyle = '#ff0000';
      ctx.fillRect(0, 0, WIDTH, HEIGHT);
      encoder.addFrame(ctx);
    } else if (i === WIDTH / 2) {
      ctx.fillStyle = '#0000ff';
      ctx.fillRect(0, 0, WIDTH, HEIGHT);
      encoder.addFrame(ctx);
    } else if (i < WIDTH / 2) {
      const redx = 0 - (i * 2);
      const bluex = WIDTH - (i * 2);
      // console.log({ i, redx, bluex });
      ctx.fillStyle = '#ff0000';
      ctx.fillRect(redx, 0, WIDTH, HEIGHT);
      ctx.fillStyle = '#0000ff';
      ctx.fillRect(bluex, 0, WIDTH, HEIGHT);
      encoder.addFrame(ctx);
    } else {
      const redx = WIDTH - ((i * 2) - WIDTH);
      const bluex = 0 - ((i * 2) - WIDTH);
      // console.log({ i, redx, bluex });
      ctx.fillStyle = '#ff0000';
      ctx.fillRect(redx, 0, WIDTH, HEIGHT);
      ctx.fillStyle = '#0000ff';
      ctx.fillRect(bluex, 0, WIDTH, HEIGHT);
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