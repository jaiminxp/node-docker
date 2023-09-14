const express = require('express')
const mongoose = require('mongoose')
const session = require('express-session')
const redis = require('redis')
let RedisStore = require('connect-redis').default
const cors = require('cors')

const {
  MONGO_USER,
  MONGO_PASSWORD,
  MONGO_IP,
  MONGO_PORT,
  REDIS_URL,
  REDIS_PORT,
  SESSION_SECRET,
} = require('./config/config')
const postRouter = require('./routes/post.routes')
const userRouter = require('./routes/user.routes')

let redisClient = redis.createClient({
  url: `redis://${REDIS_URL}:${REDIS_PORT}`,
})

redisClient
  .connect()
  .then(() => console.log('redis connected'))
  .catch(console.error)

const app = express()
const mongoURL = `mongodb://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_IP}:${MONGO_PORT}/?authSource=admin`

const connectWithRetry = () => {
  mongoose
    .connect(mongoURL, {})
    .then(() => console.log('Connected to database'))
    .catch((e) => {
      console.log(e)
      setTimeout(connectWithRetry, 5000)
    })
}

connectWithRetry()

app.enable('trust proxy')
app.use(
  session({
    store: new RedisStore({ client: redisClient }),
    secret: SESSION_SECRET,
    cookie: {
      secure: false,
      resave: false,
      saveUninitialized: false,
      httpOnly: true,
      maxAge: 60000,
    },
  })
)
app.use(express.json())
app.use(cors({}))

app.get('/api/v1', (req, res) => {
  console.log('yeah it ran')
  res.send('<h2>Hi from Docker!</h2>')
})

app.use('/api/v1/posts', postRouter)
app.use('/api/v1/users', userRouter)

const port = process.env.PORT || 3000
app.listen(port, () => console.log(`listening on port ${port}`))
