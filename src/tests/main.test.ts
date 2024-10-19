import app from "./app";
import request from 'supertest';

describe('GET /', () => {
  test('it works', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(200)
  })
})