const mongoose = require("mongoose")

mongoose.Promise = global.Promise
mongoose.connect("mongodb://localhost:27017/todo-app-mongoose")

module.exports = mongoose
