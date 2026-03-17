const request = require('supertest')
const app = require('./index')

describe('API Endpoints', () => {
  test('GET /health returns 200', async () => {
    const response = await request(app).get('/health')
    expect(response.status).toBe(200)
    expect(response.body.status).toBe('ok')
  })

  test('GET /version returns version info', async () => {
    const response = await request(app).get('/version')
    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('version')
  })

  test('GET /items returns list of items', async () => {
    const response = await request(app).get('/items')
    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('items')
    expect(Array.isArray(response.body.items)).toBe(true)
  })
})