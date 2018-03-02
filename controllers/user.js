const User = require("../models/user")

exports.signUpUser = (req, res, next) => {
  const { email, password } = req.body

  // See whether a user with a given email exists
  User.findOne({ email }, (err, existingUser) => {
    if (err) return next(err)

    if (existingUser) return res.status(422).send({ error: "Email is in use" })

    // If not, create a new user & save
    const user = new User({
      email,
      password
    })

    user.save().then(
      doc => {
        res.send({
          message: "New user account is successfully creaed",
          userObj: doc
        })
      },
      err => {
        res.status(400).send(err.message)
      }
    )
  })
}

exports.getUsers = (req, res) => {
  User.find().then(
    users => {
      res.send({ users })
    },
    err => {
      res.status(400).send(err)
    }
  )
}
