const { ObjectID } = require("mongodb")
const pick = require("lodash/pick")
const isBoolean = require("lodash/isBoolean")

const ToDo = require("../models/todo")

exports.addTodo = (req, res) => {
  const todoItem = new ToDo({
    todo: req.body.todo,
    _creator: req.user._id
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
  ToDo.find({ _creator: req.user._id }).then(
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
    return res.status(404).send({ message: "Invalid ID" })

  ToDo.findOne({ _id: id, _creator: req.user._id })
    .then(todo => {
      return !todo
        ? res
            .status(400)
            .send({ message: "Bad request! The todo cannot be found" })
        : res.send({ message: "Todo found", todo })
    })
    .catch(err => res.status(404).send({ message: err.message }))
}

exports.deleteToDo = (req, res) => {
  const { id } = req.params

  if (!ObjectID.isValid(id))
    return res.status(404).send({ message: "Invalid ID" })

  ToDo.findOneAndRemove({ _id: id, _creator: req.user._id })
    .then(todo => {
      return !todo
        ? res
            .status(400)
            .send({ message: "Bad request! The todo cannot be found" })
        : res.send({ message: "Successfully deleted the todo", todo })
    })
    .catch(err => {
      res.status(404).send({ message: err.message })
    })
}

exports.updateToDos = (req, res) => {
  const { id } = req.params
  const body = pick(req.body, ["todo", "completed"])

  if (!ObjectID.isValid(id))
    return res.status(404).send({ message: "Invalid ID" })

  if (isBoolean(body.completed) && body.completed) {
    body.completedAt = new Date().getTime()
  } else {
    body.completed = false
    body.completedAt = null
  }

  ToDo.findOneAndUpdate(
    { _id: id, _creator: req.user._id },
    { $set: body },
    { new: true, runValidators: true }
  )
    .then(todo => {
      return !todo
        ? res
            .status(400)
            .send({ message: "Bad request! The todo cannot be updated" })
        : res.send({ message: "Successfully updated the todo", todo })
    })
    .catch(err => {
      res.status(404).send({ message: err.message })
    })
}
