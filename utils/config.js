if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

let port = process.env.PORT
let mongoUrl = process.env.MONGODB_URI

if (process.env.NODE_ENV === 'test') {
  port = process.env.TEST_PORT
  mongoUrl = process.env.TEST_MONGODB_URI
}
if (process.env.NODE_ENV === 'debug') {
  port = process.env.TEST_PORT_DEBUG
  mongoUrl = 'dummy'
}

module.exports = {
  mongoUrl,
  port
}