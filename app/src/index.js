const express = require('express')
const app = express()
const PORT = process.env.PORT || 3000
const GIT_COMMIT_SHA = process.env.GIT_COMMIT_SHA || 'development'
const promClient = require('prom-client')
const collectDefaultMetrics = promClient.collectDefaultMetrics
collectDefaultMetrics()

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' })
})

app.get('/version', (req, res) => {
  res.status(200).json({ version: GIT_COMMIT_SHA })
})

app.get('/items', (req, res) => {
  const items = [
    { id: 1, name: 'Item One' },
    { id: 2, name: 'Item Two' },
    { id: 3, name: 'Item Three' }
  ]
  res.status(200).json({ items })
})

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', promClient.register.contentType)
  res.send(await promClient.register.metrics())
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
  console.log(`GIT_COMMIT_SHA: ${GIT_COMMIT_SHA}`)
})

module.exports = app