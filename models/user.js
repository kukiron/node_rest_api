const mongoose = require("mongoose")
const validator = require("validator")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")
const pick = require("lodash/pick")

const configSecret = require("../config/config-secret.js")

const Schema = mongoose.Schema

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    minlength: 3,
    trim: true,
    unique: true,
    lowercase: true,
    validate: {
      validator: validator.isEmail,
      message: "{VALUE} is not a valid email"
    }
  },
  password: {
    type: String,
    required: true,
    minlength: [6, "The password should be atleast 6 characters long"]
  },
  tokens: [
    {
      access: {
        type: String,
        required: true
      },
      token: {
        type: String,
        required: true
      }
    }
  ]
})

userSchema.pre("save", function(next) {
  const user = this

  if (user.isModified("password")) {
    bcrypt.genSalt(10, (err, salt) => {
      if (err) return next(err)

      bcrypt.hash(user.password, salt, (err, hash) => {
        if (err) return next(err)

        user.password = hash
        next()
      })
    })
  } else next()
})

userSchema.methods.toJSON = function() {
  const user = this
  const userObj = user.toObject()

  return pick(userObj, ["_id", "email"])
}

userSchema.methods.generateToken = function() {
  const user = this
  const access = "auth"
  const token = jwt
    .sign({ _id: user._id.toHexString(), access }, configSecret.secret)
    .toString()

  user.tokens = user.tokens.concat([{ access, token }])

  return user.save().then(() => token)
}

userSchema.methods.removeToken = function(token) {
  const user = this

  return user.update({
    $pull: {
      tokens: { token }
    }
  })
}

userSchema.statics.findByCredentials = function(email, password) {
  const User = this

  return User.findOne({ email }).then(user => {
    if (!user) return Promise.reject("No user found with this email")

    return new Promise((resolve, reject) => {
      bcrypt.compare(password, user.password, (err, res) => {
        res ? resolve(user) : reject("Invalid login info")
      })
    })
  })
}

userSchema.statics.findByToken = function(token) {
  const User = this
  let decoded

  try {
    decoded = jwt.verify(token, configSecret.secret)
  } catch (err) {
    return Promise.reject(`User token error - ${err.message}`)
  }

  return User.findOne({
    _id: decoded._id,
    "tokens.token": token,
    "tokens.access": "auth"
  })
}

const User = mongoose.model("user", userSchema)

module.exports = User
