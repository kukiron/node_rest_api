const mongoose = require("../db/mongoose")
const Schema = mongoose.Schema

const todoSchema = new Schema({
  todo: {
    type: String,
    minlength: 4,
    trim: true,
    required: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Number,
    default: null
  }
})

const ToDo = mongoose.model("todos", todoSchema)

module.exports = ToDo
