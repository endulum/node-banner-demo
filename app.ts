import express from "express";
import asyncHandler from "express-async-handler"
import dotenv from 'dotenv';
import errorHandler from './src/middleware/errorHandler'

import { createCanvas } from "canvas";

dotenv.config({ path: '.env' });

const app = express();
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/image.png', asyncHandler(async (_req, res) => {
  const canvas = createCanvas(100, 100);
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = "#222222";
  ctx.fillRect(0, 0, 100, 100);
  ctx.fillStyle = "#f2f2f2";
  ctx.font = "32px Arial";
  ctx.fillText("Hello", 13, 35);

  const buffer = canvas.toBuffer("image/png");
  res.contentType('image/jpeg');
  res.send(buffer);
}))

// hook up any routes here.

app.use('*', asyncHandler(async (_req, res) => {
  res.sendStatus(404)
}))

app.use(errorHandler)

app.listen(process.env.PORT || 3000);