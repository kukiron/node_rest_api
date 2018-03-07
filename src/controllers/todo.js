const { ObjectID } = require("mongodb")
const pick = require("lodash/pick")
const isBoolean = require("lodash/isBoolean")

const ToDo = require("../models/todo")

exports.addTodo = async (req, res) => {
  const todoItem = new ToDo({
    todo: req.body.todo,
    _creator: req.user._id
  })

  try {
    const doc = await todoItem.save()
    res.send({
      message: "New todo added successfully",
      todoItem: doc
    })
  } catch (err) {
    res.status(400).send(err.message)
  }
}

exports.getAllToDos = async (req, res) => {
  try {
    const todos = await ToDo.find({ _creator: req.user._id })
    res.send({ todos })
  } catch (err) {
    res.status(400).send(err.message)
  }
}

exports.getToDoById = async (req, res) => {
  const { id } = req.params

  if (!ObjectID.isValid(id))
    return res.status(404).send({ message: "Invalid ID" })

  try {
    const todo = await ToDo.findOne({ _id: id, _creator: req.user._id })
    !todo
      ? res
          .status(400)
          .send({ message: "Bad request! The todo cannot be found" })
      : res.send({ message: "Todo found", todo })
  } catch (err) {
    res.status(404).send({ message: err.message })
  }
}

exports.deleteToDo = async (req, res) => {
  const { id } = req.params

  if (!ObjectID.isValid(id))
    return res.status(404).send({ message: "Invalid ID" })

  try {
    const todo = await ToDo.findOneAndRemove({
      _id: id,
      _creator: req.user._id
    })
    !todo
      ? res
          .status(400)
          .send({ message: "Bad request! The todo cannot be found" })
      : res.send({ message: "Successfully deleted the todo", todo })
  } catch (err) {
    res.status(404).send({ message: err.message })
  }
}

exports.updateToDos = async (req, res) => {
  const { id } = req.params
  const body = pick(req.body, ["todo", "completed"])

  if (!ObjectID.isValid(id))
    return res.status(404).send({ message: "Invalid ID" })

  if (body.completed && isBoolean(body.completed)) {
    body.completedAt = new Date().getTime()
  } else {
    body.completed = false
    body.completedAt = null
  }

  try {
    const todo = await ToDo.findOneAndUpdate(
      { _id: id, _creator: req.user._id },
      { $set: body },
      { new: true, runValidators: true }
    )
    !todo
      ? res
          .status(400)
          .send({ message: "Bad request! The todo cannot be updated" })
      : res.send({ message: "Successfully updated the todo", todo })
  } catch (err) {
    res.status(404).send({ message: err.message })
  }
}
