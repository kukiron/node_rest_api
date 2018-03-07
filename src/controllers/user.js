const { ObjectID } = require("mongodb")
const pick = require("lodash/pick")

const User = require("../models/user")

exports.signUpUser = async (req, res) => {
  const { email } = req.body
  const body = pick(req.body, ["email", "password"])
  const user = new User(body)

  try {
    const existingUser = await User.findOne({ email })
    if (existingUser)
      return res.status(422).send({ message: "Email is in use" })

    await user.save()
    const token = await user.generateToken()
    res.header("x-auth", token).send({
      message: "New user account is successfully creaed",
      userObj: user
    })
  } catch (err) {
    res.status(400).send(err.message)
  }
}

exports.loginUser = async (req, res) => {
  const { email, password } = pick(req.body, ["email", "password"])

  try {
    const user = await User.findByCredentials(email, password)
    const token = await user.generateToken()
    res
      .header("x-auth", token)
      .send({ message: "Succfully logged in", userobj: user })
  } catch (err) {
    res.status(400).send(err)
  }
}

exports.logoutUser = async (req, res) => {
  const { user, token } = req

  try {
    await user.removeToken(token)
    res.status(200).send({ message: "You are logged out" })
  } catch (err) {
    res.status(401).send(err)
  }
}

exports.getUserByToken = (req, res) => {
  res.send(req.user)
}

// for routes with test purposes
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
    res.send({ users })
  } catch (err) {
    res.status(400).send(err)
  }
}

// for routes with test purposes
exports.deleteUser = async (req, res) => {
  const { id } = req.params

  if (!ObjectID.isValid(id))
    return res.status(404).send({ message: "Invalid ID" })

  try {
    const user = await User.findByIdAndRemove(id)
    !user
      ? res
          .status(400)
          .send({ message: "Bad request! The user cannot be found" })
      : res.send({ message: "Successfully deleted the user", user })
  } catch (err) {
    res.status(404).send({ message: err.message })
  }
}
