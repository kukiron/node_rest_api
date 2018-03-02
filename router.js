const todoController = require("./controllers/todo")
const userController = require("./controllers/user")

module.exports = app => {
  app.get("/", (req, res) => {
    res.send("Hi there!")
  })

  // GET requests
  app.get("/todos", todoController.getAllToDos)
  app.get("/users", userController.getUsers)
  app.get("/todos/:id", todoController.getToDoById)

  // POST requests
  app.post("/todos", todoController.postToDo)
  app.post("/users", userController.signUpUser)
}
