import express from "express";
import asyncHandler from "express-async-handler"
import dotenv from 'dotenv';
import errorHandler from '../middleware/errorHandler'

dotenv.config({ path: '.env' });

const app = express();
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/', asyncHandler(async (_req, res) => {
  res.send('Hello, World')
}))

// hook up any routes here.

app.use('*', asyncHandler(async (_req, res) => {
  res.sendStatus(404)
}))

app.use(errorHandler)

export default app