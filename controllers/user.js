const { ObjectID } = require("mongodb")
const pick = require("lodash/pick")

const User = require("../models/user")

exports.signUpUser = (req, res, next) => {
  const { email } = req.body

  // See whether a user with a given email exists
  User.findOne({ email }, (err, existingUser) => {
    if (err) return next(err)

    if (existingUser)
      return res.status(422).send({ message: "Email is in use" })

    // If not, create a new user & save
    const body = pick(req.body, ["email", "password"])
    const user = new User(body)

    user
      .save()
      .then(() => user.generateToken())
      .then(token => {
        res.header("x-auth", token).send({
          message: "New user account is successfully creaed",
          userObj: user
        })
      })
      .catch(err => {
        res.status(400).send(err.message)
      })
  })
}

exports.loginUser = (req, res) => {
  const body = pick(req.body, ["email", "password"])

  User.findByCredentials(body.email, body.password)
    .then(user => {
      return user.generateToken().then(token => {
        res
          .header("x-auth", token)
          .send({ message: "Succfully logged in", userobj: user })
      })
    })
    .catch(err => {
      res.status(400).send(err)
    })
}

exports.getAllUsers = (req, res) => {
  User.find().then(
    users => {
      res.send({ users })
    },
    err => {
      res.status(400).send(err)
    }
  )
}

exports.getUserByToken = (req, res) => {
  const token = req.header("x-auth")

  User.findByToken(token)
    .then(user => {
      if (!user) {
        return Promise.reject()
      }
      res.send(user)
    })
    .catch(err => {
      res.status(401).send(err)
    })
}

exports.deleteUser = (req, res) => {
  const { id } = req.params

  if (!ObjectID.isValid(id))
    return res.status(404).send({ message: "Invalid ID" })

  User.findByIdAndRemove(id)
    .then(user => {
      return !user
        ? res
            .status(400)
            .send({ message: "Bad request! The user cannot be found" })
        : res.send({ message: "Successfully deleted the user", user })
    })
    .catch(err => {
      res.status(404).send({ message: err.message })
    })
}
