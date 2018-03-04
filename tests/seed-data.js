const { ObjectID } = require("mongodb")
const jwt = require("jsonwebtoken")

const User = require("../models/user")
const ToDo = require("../models/todo")

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
          .sign({ _id: userOneId, access: "auth" }, process.env.JWT_SECRET)
          .toString()
      }
    ]
  },
  {
    _id: userTwoId,
    email: "user.two@example.com",
    password: "userTwoPass",
    tokens: [
      {
        access: "auth",
        token: jwt
          .sign({ _id: userTwoId, access: "auth" }, process.env.JWT_SECRET)
          .toString()
      }
    ]
  }
]

const sampleToDos = [
  {
    _id: new ObjectID(),
    todo: "Sample todo no. 1",
    _creator: userOneId
  },
  {
    _id: new ObjectID(),
    todo: "Sample todo no. 2",
    completed: true,
    completedAt: 4343,
    _creator: userTwoId
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

const populateTodos = function(done) {
  this.timeout(4000)
  ToDo.remove({})
    .then(() => ToDo.insertMany(sampleToDos))
    .then(() => done())
}

module.exports = { sampleToDos, populateTodos, sampleUsers, populateUsers }
