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

app.get('/login', asyncHandler(async (req, res) => {
  if (process.env.DC_OAUTH_URL === undefined)
    throw new Error('OAuth url is missing.');
  if (process.env.DC_CLIENT_ID === undefined)
    throw new Error('The client id is missing.');
  const loginURL = `${
    process.env.DC_OAUTH_URL
  }?client_id=${
    process.env.DC_CLIENT_ID
  }&redirect_uri=${
    'http://localhost:3000/'
  }&response_type=code&scope=${
    'dragons'
  }`;

  console.log(loginURL)

  res.redirect(loginURL)
}))

// figure out how to log out!!
app.get('/logout', asyncHandler(async (req, res) => {
  if (process.env.DC_TOKEN_REVOCATION === undefined)
    throw new Error('Token revocation link is missing.');
  if (process.env.CURRENT_TOKEN === undefined)
    throw new Error('The current token is missing.');
  if (process.env.DC_CLIENT_ID === undefined)
    throw new Error('The client id is missing.');
  if (process.env.DC_API_KEY === undefined)
    throw new Error('The client secret is missing.');

  const logoutURL = `${
    process.env.DC_TOKEN_REVOCATION
  }?code=${
    process.env.CURRENT_TOKEN
  }&redirect_uri=${
    'http://localhost:3000/'
  }&client_id=${
    process.env.DC_CLIENT_ID
  }&client_secret=${
    process.env.DC_API_KEY
  }&scopes=identify dragons`

  console.log(logoutURL);

  const response = await fetch(logoutURL, {
    method: 'POST',
    headers: {
      'Content-type': 'application/x-www-form-urlencoded',
    }
  });
  const json = await response.json();
  console.log(json);

  if (!response.ok) {
    throw new Error(response.statusText);
  } else {
    res.sendStatus(200)
  }
}))

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
  console.log(process.env.CURRENT_TOKEN);
  const response = await fetch(process.env.DC_API_ENDPOINT, {
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