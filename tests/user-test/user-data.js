const { ObjectID } = require("mongodb")
const jwt = require("jsonwebtoken")

const configSecret = require("../../config/config-secret")
const User = require("../../models/user")

const userOneId = new ObjectID()
const userTwoId = new ObjectID()

const sampleUsers = [
  {
    _id: userOneId,
    email: "user.one@example.com",
    password: "userOnePass",
    tokens: [
      {
        access: "auth",
        token: jwt
          .sign({ _id: userOneId, access: "auth" }, configSecret.secret)
          .toString()
      }
    ]
  },
  {
    _id: userTwoId,
    email: "user.two@example.com",
    password: "userTwoPass"
  }
]

const populateUsers = function(done) {
  this.timeout(4000)
  User.remove({})
    .then(() => {
      const userOne = new User(sampleUsers[0]).save()
      const userTwo = new User(sampleUsers[1]).save()

      return Promise.all([userOne, userTwo])
    })
    .then(() => done())
}

module.exports = { sampleUsers, populateUsers }
