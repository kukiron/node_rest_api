require("./src/config/config-env")
const path = require("path")
const express = require("express")
const mongoose = require("mongoose")
const bodyParser = require("body-parser")
const morgan = require("morgan")
const cors = require("cors")

const router = require("./src/router")

const app = express()
const port = process.env.PORT

mongoose.Promise = global.Promise
mongoose.connect(process.env.MONGODB_URI)

// View engine
app.set("view engine", "ejs")
app.set("views", path.resolve(__dirname, "views"))
// Middlewares
app.use(morgan("combined"))
app.use(
  bodyParser.urlencoded({
    extended: true
  })
)
app.use(bodyParser.json({ type: "*/*" }))
app.use(cors())
// Set up the static file path
app.use(express.static(path.resolve(__dirname, "assets")))

router(app)

app.listen(port, () => {
  console.log(`🌍 Express server is up and running on port: ${port} 🐎`)
})

module.exports = app
