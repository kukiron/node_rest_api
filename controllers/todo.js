const { ObjectID } = require("mongodb")

const ToDo = require("../models/todo")

exports.postToDo = (req, res) => {
  const { todo, completed, completedAt } = req.body

  const todoItem = new ToDo({
    todo,
    completed,
    completedAt
  })

  todoItem.save().then(
    doc => {
      res.send({
        message: "New todo added successfully",
        todoItem: doc
      })
    },
    err => {
      res.status(400).send(err.message)
    }
  )
}

exports.getAllToDos = (req, res) => {
  ToDo.find().then(
    todos => {
      res.send({ todos })
    },
    err => {
      res.status(400).send(err.message)
    }
  )
}

exports.getToDoById = (req, res) => {
  const { id } = req.params

  if (!ObjectID.isValid(id))
    return res.status(404).send({ error: "Invalid ID" })

  ToDo.findById(id)
    .then(todo => {
      return !todo
        ? res.status(400).send({ message: "No todo found" })
        : res.send(todo)
    })
    .catch(err => res.status(404).send({ message: err.message }))
}
