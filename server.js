require("./config/config-env")
const express = require("express")
const mongoose = require("mongoose")
const bodyParser = require("body-parser")
const morgan = require("morgan")

const router = require("./router")

const app = express()
const port = process.env.PORT

mongoose.Promise = global.Promise
mongoose.connect(process.env.MONGODB_URI)

app.use(morgan("combined"))
app.use(
  bodyParser.urlencoded({
    extended: true
  })
)
app.use(bodyParser.json({ type: "*/*" }))

router(app)

app.listen(port, () => {
  console.log(`🌍 Express server is up and running on port: ${port} 🐎`)
})

module.exports = app
