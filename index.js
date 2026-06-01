const express = require('express')
const path = require('path')
const db = require('./src/db')

const server = express()
const host = 'http://localhost:8082'

server.use(express.json())
server.use('/assets', express.static(path.resolve(__dirname, './assets')))
server.use('/dist', express.static(path.resolve(__dirname, './dist')))

// API endpoint to register a user
server.post('/api/register', async (req, res) => {
  try {
    const { username, password } = req.body
    if (!username || !password) {
      return res.status(400).json({ error: 'Missing username or password' })
    }
    if (username.length < 3 || password.length < 3) {
      return res.status(400).json({ error: 'Username and password must be at least 3 characters' })
    }
    const userId = await db.registerUser(username, password)
    res.json({ success: true, userId, username })
  } catch (err) {
    console.error('Error registering user:', err)
    res.status(400).json({ error: err.message })
  }
})

// API endpoint to login a user
server.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body
    if (!username || !password) {
      return res.status(400).json({ error: 'Missing username or password' })
    }
    const user = await db.loginUser(username, password)
    res.json({ success: true, userId: user.id, username: user.username })
  } catch (err) {
    console.error('Error logging in:', err)
    res.status(401).json({ error: err.message })
  }
})

// API endpoint to save a score
server.post('/api/score', async (req, res) => {
  try {
    const { userId, username, score, blocks } = req.body
    if (!userId || !username || score === undefined) {
      return res.status(400).json({ error: 'Missing userId, username, or score' })
    }
    const result = await db.saveScore(userId, username, score, blocks || 0)
    res.json({ success: true, ...result })
  } catch (err) {
    console.error('Error saving score:', err)
    res.status(500).json({ error: 'Failed to save score' })
  }
})

// API endpoint to get top scores
server.get('/api/scores', async (req, res) => {
  try {
    const limit = req.query.limit || 10
    const scores = await db.getTopScores(parseInt(limit))
    res.json(scores)
  } catch (err) {
    console.error('Error fetching scores:', err)
    res.status(500).json({ error: 'Failed to fetch scores' })
  }
})

// API endpoint to get user's best score
server.get('/api/score/:userId', async (req, res) => {
  try {
    const { userId } = req.params
    const score = await db.getUserBestScore(parseInt(userId))
    res.json(score || { score: 0, blocks: 0 })
  } catch (err) {
    console.error('Error fetching user score:', err)
    res.status(500).json({ error: 'Failed to fetch score' })
  }
})

server.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, './index.html'));
})

const start = async () => {
  try {
    await db.initDb()
    console.log('Database initialized')
    server.listen(8082, () => {
      console.log(`server started at ${host}`)
    })
  } catch (err) {
    console.error('Failed to start server:', err)
    process.exit(1)
  }
}

start()
