const express = require("express")
const bodyParser = require("body-parser")
const morgan = require("morgan")

const router = require("./router")

const app = express()
const port = process.env.PORT || 3330

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
