import express from "express";
import asyncHandler from "express-async-handler"
import dotenv from 'dotenv';
import errorHandler from './src/middleware/errorHandler'

import { createCanvas } from "canvas";
import GIFEncoder from 'gifencoder';

dotenv.config({ path: '.env' });

const app = express();
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

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

// hook up any routes here.

app.use('*', asyncHandler(async (_req, res) => {
  res.sendStatus(404)
}))

app.use(errorHandler)

app.listen(process.env.PORT || 3000);