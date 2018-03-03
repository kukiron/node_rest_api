const { ObjectID } = require("mongodb")

const ToDo = require("../../models/todo")

const sampleToDos = [
  {
    _id: new ObjectID(),
    todo: "Sample todo no. 1"
  },
  {
    _id: new ObjectID(),
    todo: "Sample todo no. 2",
    completed: true
  }
]

const populateTodos = function(done) {
  this.timeout(4000)
  ToDo.remove({})
    .then(() => ToDo.insertMany(sampleToDos))
    .then(() => done())
}

module.exports = { sampleToDos, populateTodos }
