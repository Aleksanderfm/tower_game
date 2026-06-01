const sqlite3 = require('sqlite3').verbose()
const path = require('path')
const fs = require('fs')

const dataDir = process.env.DATA_DIR || path.join(__dirname, '..', 'data')
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}
const dbPath = path.join(dataDir, 'scores.db')

let db

const initDb = () => {
  return new Promise((resolve, reject) => {
    db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        reject(err)
      } else {
        // Create users table
        db.run(`
          CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `, (err) => {
          if (err) {
            reject(err)
            return
          }

          // Create scores table with user reference
          db.run(`
            CREATE TABLE IF NOT EXISTS scores (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              userId INTEGER NOT NULL,
              username TEXT NOT NULL,
              score INTEGER NOT NULL,
              blocks INTEGER NOT NULL,
              timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
              FOREIGN KEY(userId) REFERENCES users(id)
            )
          `, (err) => {
            if (err) reject(err)
            else resolve()
          })
        })
      }
    })
  })
}

const registerUser = (username, password) => {
  return new Promise((resolve, reject) => {
    db.run(
      'INSERT INTO users (username, password) VALUES (?, ?)',
      [username, password],
      function (err) {
        if (err) {
          if (err.message.includes('UNIQUE constraint failed')) {
            reject(new Error('Username already exists'))
          } else {
            reject(err)
          }
        } else {
          resolve(this.lastID)
        }
      }
    )
  })
}

const loginUser = (username, password) => {
  return new Promise((resolve, reject) => {
    db.get(
      'SELECT id, username FROM users WHERE username = ? AND password = ?',
      [username, password],
      (err, row) => {
        if (err) reject(err)
        else if (row) resolve(row)
        else reject(new Error('Invalid credentials'))
      }
    )
  })
}

const saveScore = (userId, username, score, blocks) => {
  return new Promise((resolve, reject) => {
    // First, check if user already has a better score
    db.get(
      'SELECT id, score FROM scores WHERE userId = ? ORDER BY score DESC LIMIT 1',
      [userId],
      (err, row) => {
        if (err) {
          reject(err)
          return
        }

        // Only save if no previous score or new score is better
        if (!row || score > row.score) {
          db.run(
            'INSERT INTO scores (userId, username, score, blocks) VALUES (?, ?, ?, ?)',
            [userId, username, score, blocks],
            function (err) {
              if (err) reject(err)
              else resolve({ id: this.lastID, newBest: !row || score > row.score })
            }
          )
        } else {
          resolve({ id: row.id, newBest: false })
        }
      }
    )
  })
}

const getTopScores = (limit = 10) => {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT username, MAX(score) as score, MAX(blocks) as blocks 
       FROM scores 
       GROUP BY userId 
       ORDER BY score DESC, blocks DESC 
       LIMIT ?`,
      [limit],
      (err, rows) => {
        if (err) reject(err)
        else resolve(rows || [])
      }
    )
  })
}

const getUserBestScore = (userId) => {
  return new Promise((resolve, reject) => {
    db.get(
      'SELECT score, blocks FROM scores WHERE userId = ? ORDER BY score DESC LIMIT 1',
      [userId],
      (err, row) => {
        if (err) reject(err)
        else resolve(row || null)
      }
    )
  })
}

const closeDb = () => {
  return new Promise((resolve, reject) => {
    if (db) {
      db.close((err) => {
        if (err) reject(err)
        else resolve()
      })
    } else {
      resolve()
    }
  })
}

module.exports = {
  initDb,
  registerUser,
  loginUser,
  saveScore,
  getTopScores,
  getUserBestScore,
  closeDb
}
